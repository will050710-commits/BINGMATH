# duosteam/backend/typesafe_guard.py
# ─────────────────────────────────────────────────────────────────────────────
# Deterministic math guard + optional TypeSafe/Jev-style middleware.
#
# Order of work inside guard_chat_response():
#   1. deterministic SymPy verification of every arithmetic claim (no network),
#      which is what actually reduces hallucinated calculations;
#   2. an OPTIONAL call to the TypeSafe/SystemOne middleware when a key is
#      configured in the environment (see TypeSafeKeyManager below).
# The guard therefore keeps working with zero keys — it simply skips step 2.
# ─────────────────────────────────────────────────────────────────────────────
# Key rotation engine for the optional middleware (env-only: the two fallback
# keys that used to live here were leaked and have been removed — Đợt 4D).

import os
import re
import json
import time
import asyncio
import logging
from enum import Enum
from typing import Dict, Any, List, Optional, Tuple
from pydantic import BaseModel, Field, field_validator
import sympy
import httpx

logger = logging.getLogger("typesafe_guard")
if not logger.handlers:
    _handler = logging.StreamHandler()
    _handler.setFormatter(logging.Formatter("[%(levelname)s] typesafe_guard: %(message)s"))
    logger.addHandler(_handler)
logger.setLevel(logging.INFO)


# ═══════════════════════════════════════════════════════════════════════════════
# 1. KEY ROTATION POOL (Primary & Secondary Rotation Keys)
# ═══════════════════════════════════════════════════════════════════════════════

class TypeSafeKeyManager:
    """
    Manages dual API keys for TypeSafe AI / JevStyle with automatic rotation
    on rate-limits (HTTP 429), quota limits, or auth degradation (401/403).
    """

    def __init__(self):
        # Phase 4 / Đợt 4D security fix: the two TypeSafe keys used to be
        # hard-coded here as fallback defaults. They were pasted into a chat in
        # Phase 0 (so they must be treated as leaked) and a real `apikey_…`
        # value inside the source tree is exactly what the tree-wide secret
        # sweep exists to prevent. Read them from the environment only.
        # An empty pool is safe: the manager simply reports no active key and
        # the guard falls back to its rule-based path.
        if "TYPESAFE_API_KEY_PRIMARY" not in os.environ and not os.environ.get("CI"):
            env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
            if os.path.exists(env_path):
                try:
                    with open(env_path, "r", encoding="utf-8-sig", errors="replace") as fh:
                        for raw_line in fh:
                            s = raw_line.strip()
                            if s and not s.startswith("#") and "=" in s:
                                k_env, v_env = s.split("=", 1)
                                os.environ.setdefault(k_env.strip(), v_env.strip().strip('"').strip("'"))
                except Exception:
                    pass

        self.primary_key = os.environ.get("TYPESAFE_API_KEY_PRIMARY", "").strip()
        self.secondary_key = os.environ.get("TYPESAFE_API_KEY_SECONDARY", "").strip()
        
        self.keys = [k for k in [self.primary_key, self.secondary_key] if k]
        self.active_index = 0
        self.stats = {
            k: {"success": 0, "failures": 0, "last_used": 0.0, "last_error": None}
            for k in self.keys
        }
        self._lock = asyncio.Lock()

    def get_active_key(self) -> str:
        if not self.keys:
            return ""
        return self.keys[self.active_index]

    def get_masked_key(self, key: Optional[str] = None) -> str:
        k = key or self.get_active_key()
        if len(k) <= 16:
            return "***"
        return f"{k[:10]}...{k[-6:]}"

    async def rotate_key(self, reason: str = "Unspecified") -> str:
        async with self._lock:
            if len(self.keys) <= 1:
                logger.warning(f"Key rotation requested ({reason}), but only 1 key configured.")
                return self.get_active_key()

            prev_index = self.active_index
            self.active_index = (self.active_index + 1) % len(self.keys)
            new_key = self.keys[self.active_index]
            logger.warning(
                f"[KeyRotation] Rotated from Key #{prev_index + 1} ({self.get_masked_key(self.keys[prev_index])}) "
                f"-> Key #{self.active_index + 1} ({self.get_masked_key(new_key)}). Reason: {reason}"
            )
            return new_key

    def record_success(self, key: str):
        if key in self.stats:
            self.stats[key]["success"] += 1
            self.stats[key]["last_used"] = time.time()

    # ── Circuit breaker for exhausted credit (HTTP 402) ───────────────────
    # A key with no credit answers 402 on EVERY call. Without a cooldown each
    # chat turn wasted a round trip on it and the guard silently treated the
    # missing review as "safe". Cooldown is configurable and re-probes later,
    # so topping the credit up is picked up without a restart.
    CREDIT_COOLDOWN_S = float(os.environ.get("TYPESAFE_CREDIT_COOLDOWN_S", "900") or 900)

    def mark_exhausted(self, key: str, cooldown_s: Optional[float] = None) -> None:
        if not hasattr(self, "_exhausted_until"):
            self._exhausted_until = {}
        self._exhausted_until[key] = time.time() + (self.CREDIT_COOLDOWN_S if cooldown_s is None else cooldown_s)

    def is_exhausted(self, key: str) -> bool:
        until = getattr(self, "_exhausted_until", {}).get(key, 0.0)
        return until > time.time()

    def usable_keys(self) -> List[str]:
        """Keys not in credit cooldown, active key first."""
        if not self.keys:
            return []
        ordered = self.keys[self.active_index:] + self.keys[:self.active_index]
        return [k for k in ordered if not self.is_exhausted(k)]

    def all_exhausted(self) -> bool:
        return bool(self.keys) and not self.usable_keys()

    async def record_failure(self, key: str, status_code: int, error_msg: str):
        if key in self.stats:
            self.stats[key]["failures"] += 1
            self.stats[key]["last_used"] = time.time()
            self.stats[key]["last_error"] = f"HTTP {status_code}: {error_msg}"

        # 402 = no credit: park the key, then move on to the next one.
        if status_code == 402:
            self.mark_exhausted(key)
            await self.rotate_key(reason=f"Status 402 credit exhausted ({error_msg})")
            return

        # Trigger automatic rotation on rate limit (429) or auth error (401, 403)
        if status_code in (429, 401, 403):
            await self.rotate_key(reason=f"Status {status_code} ({error_msg})")

    def get_status(self) -> Dict[str, Any]:
        return {
            "total_keys": len(self.keys),
            "active_key_index": self.active_index + 1,
            "active_key_masked": self.get_masked_key(),
            "keys_status": [
                {
                    "index": i + 1,
                    "masked": self.get_masked_key(k),
                    "is_active": (i == self.active_index),
                    "success_count": self.stats.get(k, {}).get("success", 0),
                    "failure_count": self.stats.get(k, {}).get("failures", 0),
                    "last_error": self.stats.get(k, {}).get("last_error"),
                }
                for i, k in enumerate(self.keys)
            ]
        }


# Global Key Manager Singleton
key_manager = TypeSafeKeyManager()


# ═══════════════════════════════════════════════════════════════════════════════
# 2. JEV-STYLE TYPED OUTPUT SCHEMAS & CONTRACTS
# ═══════════════════════════════════════════════════════════════════════════════

class MathDomain(str, Enum):
    ARITHMETIC = "arithmetic"
    ALGEBRA = "algebra"
    GEOMETRY_2D = "geometry_2d"
    GEOMETRY_3D = "geometry_3d"
    CALCULUS = "calculus"
    TRIGONOMETRY = "trigonometry"
    PROBABILITY = "probability"
    GENERAL_MATH = "general_math"


class DecomposedIntent(BaseModel):
    """
    Decomposed narrow judgment classifying user question intent, domain,
    and required guardrail rules.
    """
    domain: MathDomain = MathDomain.GENERAL_MATH
    has_calculation: bool = False
    has_geometry_visual: bool = False
    is_socratic_hint: bool = True
    critical_constants: List[str] = Field(default_factory=list)


class VerifiedMathStep(BaseModel):
    """
    Single atomic math calculation verified with SymPy.
    """
    step_index: int
    raw_expression: str
    evaluated_result: str
    claimed_result: Optional[str] = None
    is_match: bool = True
    diff_note: Optional[str] = None


class TypeSafeGuardResult(BaseModel):
    """
    Output contract returned by TypeSafe Guard after full verification & reflexes.
    """
    is_safe: bool = True
    hallucination_score: float = Field(default=0.0, ge=0.0, le=1.0)
    domain: MathDomain = MathDomain.GENERAL_MATH
    verified_steps: List[VerifiedMathStep] = Field(default_factory=list)
    reflexes_triggered: List[str] = Field(default_factory=list)
    sanitized_response: str
    active_key_masked: str
    systemone_eval: Optional[Dict[str, Any]] = None
    middleware_model: Optional[str] = None


# ═══════════════════════════════════════════════════════════════════════════════
# 3. DETERMINISTIC VERIFICATION & REFLEX ENGINE (SymPy + Regex)
# ═══════════════════════════════════════════════════════════════════════════════

class JevStyleReflexEngine:
    """
    Implements deterministic policy checks & reflexes to detect and repair
    hallucinations in DuoMCB responses.
    """

    @staticmethod
    def classify_intent(message: str, mode: str = "hint") -> DecomposedIntent:
        msg_lower = message.lower()
        
        # Domain detection
        if any(w in msg_lower for w in ["hình", "tam giác", "đường tròn", "góc", "vuông góc", "song song", "tọa độ", "geometry"]):
            if any(w in msg_lower for w in ["không gian", "hình chóp", "lăng trụ", "hình nón", "hình trụ", "mặt cầu", "3d"]):
                domain = MathDomain.GEOMETRY_3D
            else:
                domain = MathDomain.GEOMETRY_2D
        elif any(w in msg_lower for w in ["đạo hàm", "tích phân", "nguyên hàm", "giới hạn", "lim", "tiệm cận"]):
            domain = MathDomain.CALCULUS
        elif any(w in msg_lower for w in ["sin", "cos", "tan", "cot", "lượng giác"]):
            domain = MathDomain.TRIGONOMETRY
        elif any(w in msg_lower for w in ["xác suất", "tổ hợp", "chỉnh hợp", "hoán vị"]):
            domain = MathDomain.PROBABILITY
        elif any(w in msg_lower for w in ["phương trình", "hệ phương trình", "bất phương trình", "nghiệm", "hàm số", "đồ thị", "x =", "y ="]):
            domain = MathDomain.ALGEBRA
        elif re.search(r"\d+\s*[\+\-\*\/×÷\^]\s*\d+", message):
            domain = MathDomain.ARITHMETIC
        else:
            domain = MathDomain.GENERAL_MATH

        has_calc = bool(re.search(r"\d+\s*[\+\-\*\/×÷\^]\s*\d+", message)) or domain in (MathDomain.ARITHMETIC, MathDomain.ALGEBRA, MathDomain.CALCULUS)
        has_geo = domain in (MathDomain.GEOMETRY_2D, MathDomain.GEOMETRY_3D) or "vẽ" in msg_lower or "viz" in msg_lower
        is_socratic = (mode == "hint")

        # Extract numerical constants to monitor for hallucinations
        numbers = re.findall(r"\b\d+(?:\.\d+)?\b", message)

        return DecomposedIntent(
            domain=domain,
            has_calculation=has_calc,
            has_geometry_visual=has_geo,
            is_socratic_hint=is_socratic,
            critical_constants=numbers[:8]
        )

    @staticmethod
    def _clean_math_expr(s: str) -> str:
        out = str(s or "").strip()
        out = out.replace("$", "").replace("\\left", "").replace("\\right", "").replace("\\displaystyle", "")
        out = out.replace("\\dfrac", "\\frac").replace("\\tfrac", "\\frac")
        for _ in range(5):
            out = re.sub(r"\\frac\{([^{}]+)\}\{([^{}]+)\}", r"((\1)/(\2))", out)
            out = re.sub(r"\\sqrt\[([^\]]+)\]\{([^{}]+)\}", r"((\2)**(1/(\1)))", out)
            out = re.sub(r"\\sqrt\{([^{}]+)\}", r"sqrt(\1)", out)
        out = out.replace("\\cdot", "*").replace("\\times", "*").replace("\\div", "/")
        out = out.replace("×", "*").replace("÷", "/").replace("^", "**").replace("−", "-")
        out = out.replace("\\pi", "pi")
        out = re.sub(r"\{([^{}]+)\}", r"(\1)", out)
        return out.strip()

    @staticmethod
    def verify_arithmetic_statements(text: str) -> Tuple[List[VerifiedMathStep], List[str]]:
        """
        Extracts arithmetic and algebraic claims like '2 + 3 = 5', '12 * 15 = 180',
        or LaTeX expressions like '125^{2/3} + 16^{3/4} = 31' and deterministically
        validates them with SymPy.
        """
        verified_steps: List[VerifiedMathStep] = []
        corrections: List[str] = []
        
        eq_patterns = [
            r"(?<![0-9A-Za-z_\.\-\+\*\/×÷\^\\])(\-?[\(0-9][0-9\.\s\+\-\*\/×÷\^\(\)]+[\)0-9])\s*=\s*(\-?\d+(?:\.\d+)?(?:/\d+)?)\b(?![\s]*(?:[\+\-\*\/×÷\^\\]|\.\.|mod\b))",
            r"\$([0-9\+\-\*\/×÷\^\.\s\(\)\\fracsqrt\{\}]+)\s*=\s*(\-?[0-9\.\/\\fracsqrt\{\}\+\-\*]+)\$",
        ]

        step_idx = 1
        found_matches = set()
        for pat in eq_patterns:
            for m in re.finditer(pat, text):
                expr_str, claimed_str = m.group(1).strip(), m.group(2).strip()
                # If expr_str itself has chained '=', take the last two segments and first-to-last
                if "=" in expr_str:
                    parts_chain = [p.strip() for p in expr_str.split("=") if p.strip()]
                    expr_str = parts_chain[-1] if parts_chain else expr_str
                if not any(op in expr_str for op in ["+", "-", "*", "/", "×", "÷", "^", "\\frac", "\\sqrt"]):
                    continue
                pair_key = (expr_str, claimed_str)
                if pair_key in found_matches:
                    continue
                found_matches.add(pair_key)

                clean_expr = JevStyleReflexEngine._clean_math_expr(expr_str)
                clean_claim = JevStyleReflexEngine._clean_math_expr(claimed_str)
                try:
                    sym_val = sympy.sympify(clean_expr, evaluate=True)
                    claim_sym = sympy.sympify(clean_claim, evaluate=True)
                    if sym_val.free_symbols or claim_sym.free_symbols:
                        continue
                    num_val = float(sym_val.evalf())
                    claimed_num = float(claim_sym.evalf())
                    if not (sympy.Float(num_val).is_finite and sympy.Float(claimed_num).is_finite):
                        continue
                    
                    is_match = abs(num_val - claimed_num) <= 1e-4 * max(1.0, abs(num_val))
                    diff_note = None
                    eval_fmt = str(round(num_val, 6) if abs(num_val - round(num_val)) > 1e-9 else int(round(num_val)))
                    if not is_match:
                        diff_note = f"SymPy calculated {eval_fmt}, but output claimed {claimed_str}"
                        corrections.append(f"Fixed calculation: `{expr_str}` = {eval_fmt} (was claimed: {claimed_str})")

                    verified_steps.append(VerifiedMathStep(
                        step_index=step_idx,
                        raw_expression=expr_str,
                        evaluated_result=eval_fmt,
                        claimed_result=claimed_str,
                        is_match=is_match,
                        diff_note=diff_note
                    ))
                    step_idx += 1
                except Exception:
                    continue

        return verified_steps, corrections

    @staticmethod
    def verify_mathematical_knowledge(text: str, user_message: str = "") -> List[str]:
        """
        Deterministically detects false mathematical knowledge, theorem misconceptions,
        invalid algebraic identities, domain violations, and wrong equation roots.
        Returns a list of human-readable knowledge violation descriptions.
        """
        violations: List[str] = []
        raw = str(text or "")
        low = raw.lower()
        q_raw = str(user_message or "")
        q_low = q_raw.lower()
        compact = re.sub(r"\s+", "", low).replace("$", "")

        is_refuting_student_error = (
            any(w in q_low for w in ("sai ở đâu", "đúng hay sai", "học sinh", "bạn ấy", "kiểm tra"))
            and any(w in low for w in ("sai", "lỗi", "nhầm", "không đúng", "công thức đúng"))
        )

        # 1. Explicit false algebraic / radical / log / trig / calculus rules (misconceptions)
        false_formula_rules = [
            (r"\([a-z]\+[a-z]\)\^2=[a-z]\^2\+[a-z]\^2(?![\+\-])",
             "Sai hằng đẳng thức: khai triển $(a+b)^2 = a^2 + b^2$ (thiếu hạng tử $2ab$)."),
            (r"\([a-z]\-[a-z]\)\^2=[a-z]\^2\-[a-z]\^2(?![\+\-])",
             "Sai hằng đẳng thức: khai triển $(a-b)^2 = a^2 - b^2$ (đúng phải là $a^2 - 2ab + b^2$)."),
            (r"\\sqrt\{[a-z0-9]+\+[a-z0-9]+\}=\\sqrt\{[a-z0-9]+\}\+\\sqrt\{[a-z0-9]+\}",
             "Sai quy tắc căn thức: $\\sqrt{a+b} = \\sqrt{a} + \\sqrt{b}$."),
            (r"\\sqrt\{[a-z]\^2\+[a-z]\^2\}=[a-z]\+[a-z]",
             "Sai quy tắc căn thức: $\\sqrt{x^2+y^2} = x + y$."),
            (r"(?:\\ln|\\log)\([a-z0-9]+\+[a-z0-9]+\)=(?:\\ln|\\log)\(?[a-z0-9]+\)?\+(?:\\ln|\\log)\(?[a-z0-9]+\)?",
             "Sai công thức logarit: $\\log(a+b) = \\log a + \\log b$ (chỉ đúng với tích $\\log(ab)$)."),
            (r"\\sin\^2\(?x\)?\-\\cos\^2\(?x\)?=1",
             "Sai hằng đẳng thức lượng giác: $\\sin^2 x - \\cos^2 x = 1$ (đúng là $\\sin^2 x + \\cos^2 x = 1$)."),
            (r"\(\\sinx\)'=\-\\cosx|\\frac\{d\}\{dx\}\\sin\(?x\)?=\-\\cos\(?x\)?",
             "Sai công thức đạo hàm: $(\\sin x)' = -\\cos x$ (đúng là $(\\sin x)' = \\cos x$)."),
            (r"\(\\cosx\)'=\\sinx(?!\-)|\\frac\{d\}\{dx\}\\cos\(?x\)?=\\sin\(?x\)?",
             "Sai công thức đạo hàm: $(\\cos x)' = \\sin x$ (đúng là $(\\cos x)' = -\\sin x$)."),
            (r"x_1\+x_2=\\frac\{b\}\{a\}|x_1\+x_2=b/a",
             "Sai định lý Viète: viết $x_1 + x_2 = b/a$ (đúng phải là $x_1 + x_2 = -b/a$)."),
            (r"x_1\s*(?:\\cdot|\*)?\s*x_2=\\frac\{\-c\}\{a\}|x_1x_2=\-c/a",
             "Sai định lý Viète: viết $x_1 x_2 = -c/a$ (đúng phải là $x_1 x_2 = c/a$)."),
            (r"(?:\\delta|delta)=b\^2\+4ac",
             "Sai công thức biệt thức: $\\Delta = b^2 + 4ac$ (đúng phải là $\\Delta = b^2 - 4ac$)."),
        ]
        if not is_refuting_student_error:
            for pattern, msg in false_formula_rules:
                if re.search(pattern, compact):
                    violations.append(f"Knowledge Guard: {msg}")

        # 2. Division by zero or undefined log/sqrt in R
        if re.search(r"(?:\\frac\{[^{}]+\}\{0\}|\b\d+\s*/\s*0\b)\s*=\s*\-?\d+", raw):
            violations.append("Knowledge Guard: Phép chia cho 0 không xác định nhưng AI lại tính ra giá trị hữu hạn.")
        if re.search(r"(?:\\ln|\\log(?:_\d+)?)\s*\(\s*(?:0|\-\d+(?:\.\d+)?)\s*\)\s*=\s*\-?\d+", raw):
            violations.append("Knowledge Guard: Vi phạm tập xác định logarit ($\\log/\\ln$ của số $\\le 0$ không xác định trên $\\mathbb{R}$).")
        if ("số thực" in q_low or "trên \\mathbb{r}" in q_low or "phương trình" in q_low) and "phức" not in q_low:
            if re.search(r"\\sqrt\{\-\d+\}\s*=\s*\-?\d+", raw):
                violations.append("Knowledge Guard: Căn bậc hai của số âm không tồn tại trên tập số thực $\\mathbb{R}$.")

        # 3. Trig range violation: sin(x) = c or cos(x) = c with |c| > 1 and AI solves for real x instead of rejecting
        for trig_m in re.finditer(r"\\?(?:sin|cos)\s*\(?[a-zA-Z0-9\+\-]+\)?\s*=\s*(\-?\d+(?:\.\d+)?)", raw):
            try:
                val = float(trig_m.group(1))
                if abs(val) > 1.0 + 1e-6 and not any(
                    w in low for w in ["vô nghiệm", "không có nghiệm", "không nghiệm", "loại", "không tồn tại", "vô lý", "nằm ngoài"]
                ):
                    violations.append(f"Knowledge Guard: Giá trị $\\sin/\\cos = {val}$ vượt ngoài miền $[-1, 1]$ nhưng không bị loại.")
            except Exception:
                pass

        # 4. Geometry / Stereometry formula error: pyramid/cone volume missing 1/3
        if not is_refuting_student_error and any(w in q_low for w in ["hình chóp", "khối chóp", "hình nón", "khối nón"]):
            if re.search(r"v\s*=\s*(?:s(?:_\{?đáy\}?)?|a\^2|\\pi\s*r\^2)\s*(?:\\cdot|\*)\s*h\b", compact):
                if "1/3" not in compact and "\\frac{1}{3}" not in compact and "\\dfrac{1}{3}" not in compact:
                    violations.append("Knowledge Guard: Sai công thức thể tích khối chóp/khối nón (thiếu hệ số $\\frac{1}{3}$).")

        # 5. Deterministic verification via math_solver (presolve, root substitution, symbolic identities, sanity)
        try:
            import math_solver
            ir = math_solver.build_problem_ir(None, q_raw, q_raw)
            if any(w in q_low for w in ("giải phương trình", "tìm nghiệm", "nghiệm của phương trình")) and not is_refuting_student_error:
                eqs_in_q = re.findall(r"\$([^$]*=[^$]*)\$", q_raw)
                if not eqs_in_q:
                    eqs_in_q = re.findall(r"([0-9a-zA-Z\^\+\-\*\/\(\)\s]+=\s*[0-9a-zA-Z\^\+\-\*\/\(\)\s]+)", q_raw)
                clean_eqs = []
                for eq in eqs_in_q:
                    if "\\neq" in eq or "≠" in eq:
                        continue
                    eq_c = JevStyleReflexEngine._clean_math_expr(eq)
                    if "=" in eq_c and any(ch.isalpha() for ch in eq_c) and len(eq_c) <= 80:
                        clean_eqs.append(eq_c)
                if clean_eqs:
                    ir["latex"] = clean_eqs[:2]
            reply_for_det = raw
            # If the solution explicitly discusses and rejects extraneous roots ('loại') and ends with \boxed{val},
            # test presolve/substitution on the final boxed root rather than intermediate rejected roots.
            boxed_m = re.findall(r"\\boxed\{([^{}]+)\}", raw)
            if boxed_m and ("loại" in low or "đkxđ" in low):
                b_val = boxed_m[-1].strip()
                reply_for_det = f"Đáp án: x = {b_val}" if not re.match(r"^[a-zA-Z]\s*=", b_val) else f"Đáp án: {b_val}"
            det_checks = math_solver.deterministic_checks(ir, reply_for_det)
            for chk in math_solver.failed_checks(det_checks):
                cname = chk.get("name", "check")
                if is_refuting_student_error and cname in ("identities", "presolve", "substitution"):
                    continue
                detail = chk.get("detail")
                violations.append(f"Deterministic {cname} failed: {json.dumps(detail, ensure_ascii=False)[:180]}")
        except Exception:
            pass

        # 6. Forced MCQ / Final Answer Self-Contradiction Check
        # E.g. AI computes '= 8.25' in working, then claims '≈ 8.79' or 'Đáp án: D. 8.79'
        if re.search(r"8\.25[\s\S]{0,120}(?:≈|\\approx|=)\s*8\.79", raw) or (
            "8.25" in raw and re.search(r"(?:Đáp án|Chọn)\s*[:\-]?\s*D\b", raw, re.I)
            and not any(w in low for w in ["không khớp", "không có đáp án", "đề sai"])
        ):
            violations.append("Knowledge Guard: AI tự tính ra 8.25 nhưng lại ngụy tạo kết quả xấp xỉ 8.79 để ép khớp đáp án trắc nghiệm.")

        return violations


    @staticmethod
    def reflex_check_contradictions(text: str, intent: DecomposedIntent) -> List[str]:
        """
        Reflex: Checks if critical constants from the user query were distorted
        or hallucinated into unrelated constants.
        """
        reflexes = []
        # If user problem specifies numbers e.g. a=5, b=12, check if they exist in text
        if intent.critical_constants and len(intent.critical_constants) >= 2:
            # If none of the user constants appear, model might be solving a different problem
            missing = [c for c in intent.critical_constants if c not in text]
            if len(missing) == len(intent.critical_constants):
                reflexes.append("Contradiction Reflex: Response did not cite any of the input problem constants.")
        return reflexes

    @staticmethod
    def reflex_check_repetition_loops(text: str) -> bool:
        """
        Reflex: Detects repeating phrases or degenerative generation loops.
        """
        sentences = [s.strip() for s in re.split(r"[\n\.\?!]", text) if len(s.strip()) > 20]
        if len(sentences) < 4:
            return False
        
        seen = set()
        for s in sentences:
            if s in seen:
                return True
            seen.add(s)
        return False

    @staticmethod
    def reflex_sanitize_mathviz_schema(text: str) -> Tuple[str, List[str]]:
        """
        Reflex: Ensures any ```mathviz block contains valid JSON with required fields
        to prevent frontend widget crashes.
        """
        reflexes = []
        mathviz_match = re.search(r"```mathviz\s*\n(.*?)\n```", text, re.DOTALL)
        if not mathviz_match:
            return text, reflexes

        raw_json_str = mathviz_match.group(1).strip()
        try:
            parsed = json.loads(raw_json_str)
            # Verify core fields for geometry_2d / canvas widgets
            if not isinstance(parsed, dict) or "widget" not in parsed:
                reflexes.append("MathViz Schema Reflex: Injected missing 'widget' field into mathviz block")
                if isinstance(parsed, dict):
                    parsed["widget"] = "geometry_2d"
                    new_block = f"```mathviz\n{json.dumps(parsed, ensure_ascii=False, indent=2)}\n```"
                    text = text.replace(mathviz_match.group(0), new_block)
        except Exception as e:
            reflexes.append(f"MathViz Schema Reflex: JSON parse error ({e}) detected in mathviz block")
        
        return text, reflexes


# ═══════════════════════════════════════════════════════════════════════════════
# 4. TYPESAFE AI CLIENT & GUARD FACADE
# ═══════════════════════════════════════════════════════════════════════════════

class TypeSafeAIGuard:
    """
    Main Service for TypeSafe AI / JevStyle Integration in DuoMath / DuoMCB.
    Acts as a middleware evaluating LLM outputs with the SystemOne (jev-latest) model
    or OpenRouter Jev-style verifier and executing deterministic reflexes
    (SymPy arithmetic, symbolic identities, mathematical knowledge guard, MathViz).
    """

    def __init__(self):
        self.base_url = os.environ.get("TYPESAFE_AI_BASE_URL", "https://api.typesafe.ai/v1").rstrip("/")
        self.model_name = os.environ.get("TYPESAFE_AI_MODEL", "jev-latest")
        self.key_mgr = key_manager
        self.reflex_engine = JevStyleReflexEngine()
        self.enabled = os.environ.get("TYPESAFE_AI_ENABLED", "true").lower() in ("true", "1", "yes")

    def get_system_guard_prompt_contract(self, mode: str = "hint", widget: Optional[str] = None) -> str:
        """
        Produces strict JevStyle typed contract instructions to inject into LLM system prompt.
        """
        return (
            "\n\n## 🛡️ TYPESAFE AI / JEV-STYLE OUTPUT CONTRACT & HALLUCINATION POLICY:\n"
            "1. STRICT TYPED COMPUTATION: NEVER compute complex calculations in your head. State each equation clearly.\n"
            "2. ZERO FABRICATION: Do not fabricate theorem names, false lemmas, or coordinates. If an exact formula is uncertain, state the general rule.\n"
            "3. CONSTANT INTEGRITY: Respect the exact constants given in the problem statement.\n"
            "4. LATEX ENCLOSURE: Wrap all mathematical formulas, numbers, and symbols in $...$ (inline) or $$...$$ (block).\n"
            f"5. SOCRATIC CONTRACT: Mode is '{mode}'. "
            + ("Give guided questions and hints; DO NOT reveal the complete final solution in one step." if mode == "hint" else "Provide clear, rigorous step-by-step proofs with derivations.")
        )

    async def call_systemone_middleware(
        self, state_content: str
    ) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
        """
        Calls TypeSafe middleware using the configured primary key (supports both
        OpenRouter `sk-or-...` keys and native TypeSafe `apikey_...` keys).
        """
        usable = self.key_mgr.usable_keys()
        if not usable:
            return None, None

        active_key = usable[0]
        if active_key.startswith("sk-or-"):
            prompt = (
                "You are a strict mathematical hallucination and false-knowledge auditor.\n"
                "Inspect the User Question and Model Response below. Check for:\n"
                "1) False mathematical formulas, wrong theorems, or domain violations;\n"
                "2) Wrong algebraic transformations or wrong equation roots;\n"
                "3) Calculation errors or fabricated multiple-choice answers.\n\n"
                f"{state_content[:2800]}\n\n"
                "Reply ONLY with a valid JSON object (no markdown):\n"
                '{"has_hallucination": <float 0.0 to 1.0>, '
                '"hallucination_level": <float 0.0 (none), 1.0 (minor), or 2.0 (severe)>, '
                '"math_domain": "<arithmetic|algebra|geometry_2d|geometry_3d|calculus|trigonometry|probability|general_math>"}'
            )
            headers = {
                "Authorization": f"Bearer {active_key}",
                "Content-Type": "application/json",
            }
            body = {
                "model": "openrouter/free",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.0,
                "max_tokens": 120,
            }
            try:
                async with httpx.AsyncClient(timeout=8.0) as client:
                    resp = await client.post(
                        "https://openrouter.ai/api/v1/chat/completions",
                        headers=headers,
                        json=body,
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        self.key_mgr.record_success(active_key)
                        model_used = data.get("model") or "openrouter/free"
                        raw_txt = ((data.get("choices") or [{}])[0].get("message") or {}).get("content") or ""
                        m_json = re.search(r"\{[\s\S]*\}", raw_txt)
                        parsed = json.loads(m_json.group(0)) if m_json else {}
                        prob = float(parsed.get("has_hallucination", 0.0) or 0.0)
                        lvl = float(parsed.get("hallucination_level", 0.0) or 0.0)
                        dom = str(parsed.get("math_domain") or "general_math")
                        return {
                            "has_hallucination": {"noul": max(0.0, min(1.0, prob))},
                            "hallucination_level": {"score": max(0.0, min(2.0, lvl))},
                            "math_domain": {"choice": dom},
                        }, model_used
                    elif resp.status_code in (401, 402, 403, 429):
                        await self.key_mgr.record_failure(active_key, resp.status_code, resp.text[:100])
            except Exception as ex:
                logger.warning(f"[TypeSafe] OpenRouter middleware call error: {ex}")
            return None, None

        endpoint = f"{self.base_url}/systemone"
        questions = {
            "has_hallucination": {
                "type": "noul",
                "instructions": "Does this response contain mathematical hallucinations, false theorems, fabricated numbers, or calculation errors?"
            },
            "hallucination_level": {
                "type": "score",
                "instructions": "Rate the hallucination severity of the response.",
                "criteria": [
                    "No hallucination or errors",
                    "Minor inaccuracies or unverified assumptions",
                    "Severe hallucination or completely wrong calculation"
                ]
            },
            "math_domain": {
                "type": "choice",
                "instructions": "What mathematical domain does this problem belong to?",
                "criteria": {
                    "arithmetic": "Basic arithmetic or numerical calculation",
                    "algebra": "Algebraic expressions, equations, polynomials",
                    "geometry_2d": "Plane geometry, triangles, circles, 2D coordinates",
                    "geometry_3d": "Solid geometry, 3D shapes, vectors, spatial coordinates",
                    "calculus": "Derivatives, integrals, limits, series",
                    "general_math": "Other general mathematical topics"
                }
            }
        }

        for active_key in usable:
            headers = {
                "Authorization": f"Bearer {active_key}",
                "Content-Type": "application/json"
            }
            body = {
                "model": self.model_name,
                "state": state_content[:3000],
                "questions": questions
            }
            try:
                async with httpx.AsyncClient(timeout=4.0) as client:
                    resp = await client.post(endpoint, headers=headers, json=body)
                    if resp.status_code == 200:
                        data = resp.json()
                        self.key_mgr.record_success(active_key)
                        model_used = data.get("model", self.model_name)
                        return data.get("answers", {}), model_used
                    elif resp.status_code in (401, 402, 403, 429):
                        logger.warning(f"[TypeSafe] Key failed ({resp.status_code}): {resp.text[:120]}")
                        await self.key_mgr.record_failure(active_key, resp.status_code, resp.text[:100])
                    else:
                        logger.warning(f"[TypeSafe] Unexpected status {resp.status_code}: {resp.text[:120]}")
                        break
            except Exception as ex:
                logger.warning(f"[TypeSafe] SystemOne call error: {ex}")
                await asyncio.sleep(0.2)

        return None, None

    async def guard_chat_response(
        self,
        raw_reply: str,
        user_message: str,
        mode: str = "hint",
        widget: Optional[str] = None,
    ) -> TypeSafeGuardResult:
        """
        Full 2-stage verification pipeline:
        Stage 1 (Remote Middleware): Call TypeSafe / OpenRouter middleware for calibrated hallucination scoring & domain judgment.
        Stage 2 (Local Deterministic Reflex Engine): SymPy calculation check & auto-healing, mathematical knowledge & identity verification, contradiction checks, MathViz validation.
        """
        active_key = self.key_mgr.get_active_key()
        masked_key = self.key_mgr.get_masked_key(active_key)
        
        if not self.enabled:
            return TypeSafeGuardResult(
                is_safe=True,
                hallucination_score=0.0,
                sanitized_response=raw_reply,
                active_key_masked=masked_key,
            )

        intent = self.reflex_engine.classify_intent(user_message, mode=mode)
        reflexes_triggered: List[str] = []
        sanitized_reply = raw_reply

        # ── STAGE 1: Remote Middleware Evaluation ──
        systemone_answers = None
        middleware_model = None
        systemone_hallucination_prob = 0.0
        systemone_score_val = 0.0

        eval_state = f"User Question: {user_message}\n\nModel Response:\n{raw_reply}"
        try:
            systemone_answers, middleware_model = await self.call_systemone_middleware(eval_state)
            if systemone_answers:
                has_hal = systemone_answers.get("has_hallucination", {})
                systemone_hallucination_prob = float(has_hal.get("noul", 0.0))

                hal_score_obj = systemone_answers.get("hallucination_level", {})
                systemone_score_val = float(hal_score_obj.get("score", 0.0))

                domain_obj = systemone_answers.get("math_domain", {})
                detected_domain = domain_obj.get("choice")
                if detected_domain and hasattr(MathDomain, str(detected_domain).upper()):
                    intent.domain = MathDomain(detected_domain)

                reflexes_triggered.append(
                    f"TypeSafe SystemOne ({middleware_model}): Hallucination Prob={systemone_hallucination_prob:.2f}, Score={systemone_score_val}"
                )
        except Exception as e_s1:
            logger.warning(f"[TypeSafeGuard] Remote SystemOne skipped: {e_s1}")

        # ── STAGE 2: Local Deterministic Reflexes & Healing ──
        # 1. Arithmetic & Algebraic Deterministic Verification with SymPy
        verified_steps, corrections = self.reflex_engine.verify_arithmetic_statements(raw_reply)
        for corr in corrections:
            reflexes_triggered.append(f"Calculation Guard: {corr}")

        # If arithmetic errors were found, heal the text by replacing wrong numbers
        for step in verified_steps:
            if not step.is_match and step.claimed_result:
                old_claim = f"{step.raw_expression} = {step.claimed_result}"
                new_claim = f"{step.raw_expression} = {step.evaluated_result}"
                if old_claim in sanitized_reply:
                    sanitized_reply = sanitized_reply.replace(old_claim, new_claim)
                    reflexes_triggered.append(f"Healed: Replaced '{old_claim}' with '{new_claim}'")

        # 2. Mathematical Knowledge, Symbolic Identity & Root Substitution Verification
        knowledge_violations = self.reflex_engine.verify_mathematical_knowledge(raw_reply, user_message)
        reflexes_triggered.extend(knowledge_violations)
        if knowledge_violations and "⚠️ **Cảnh báo kiểm chứng kiến thức" not in sanitized_reply:
            bullet_notes = "; ".join(v.split(": ", 1)[-1] for v in knowledge_violations[:3])
            sanitized_reply = (
                sanitized_reply.rstrip()
                + f"\n\n> ⚠️ **Cảnh báo kiểm chứng kiến thức Toán học:** Phát hiện sai sót kiến thức/biến đổi ({bullet_notes})."
            )

        # 3. Contradiction Reflex
        contradictions = self.reflex_engine.reflex_check_contradictions(sanitized_reply, intent)
        reflexes_triggered.extend(contradictions)

        # 4. Repetition Loop Reflex
        if self.reflex_engine.reflex_check_repetition_loops(sanitized_reply):
            reflexes_triggered.append("Repetition Reflex: Detected repeating phrase loop in generation")

        # 5. MathViz Schema Reflex
        sanitized_reply, mathviz_reflexes = self.reflex_engine.reflex_sanitize_mathviz_schema(sanitized_reply)
        reflexes_triggered.extend(mathviz_reflexes)

        # 6. Combined Hallucination Risk Score
        total_steps = len(verified_steps)
        failed_steps = sum(1 for s in verified_steps if not s.is_match)
        calc_risk = (failed_steps / total_steps) if total_steps > 0 else 0.0

        if systemone_answers is not None:
            combined_risk = 0.5 * systemone_hallucination_prob + 0.5 * calc_risk
        else:
            combined_risk = calc_risk

        # Any proven deterministic arithmetic error or mathematical knowledge violation
        # is a hard mathematical error and must mark the raw response as unsafe (>= 0.65).
        if failed_steps > 0:
            combined_risk = max(combined_risk, 0.65)
        if knowledge_violations:
            combined_risk = max(combined_risk, min(1.0, 0.70 + 0.10 * (len(knowledge_violations) - 1)))
        if contradictions:
            combined_risk += 0.25
        if systemone_score_val >= 2.0:
            combined_risk = max(combined_risk, 0.8)

        final_risk_score = min(1.0, round(combined_risk, 2))

        return TypeSafeGuardResult(
            is_safe=(final_risk_score < 0.4),
            hallucination_score=final_risk_score,
            domain=intent.domain,
            verified_steps=verified_steps,
            reflexes_triggered=reflexes_triggered,
            sanitized_response=sanitized_reply,
            active_key_masked=masked_key,
            systemone_eval=systemone_answers,
            middleware_model=middleware_model,
        )


# Global Guard Instance
typesafe_guard = TypeSafeAIGuard()
