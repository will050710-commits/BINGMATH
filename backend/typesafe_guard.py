# duosteam/backend/typesafe_guard.py
# ─────────────────────────────────────────────────────────────────────────────
# TypeSafe AI / JevStyle Hallucination Reduction Guard & Key Rotation Engine
# Designed for DuoMCB (DuoMath AI Assistant)
# ─────────────────────────────────────────────────────────────────────────────

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
        self.primary_key = os.environ.get(
            "TYPESAFE_API_KEY_PRIMARY",
            "apikey_2426f1b95e3b263453e9959758168c7c6a6_f4795f5562ab567819ce47fccb4172cf90dfd4059123f0748247072a203b25a3",
        ).strip()
        self.secondary_key = os.environ.get(
            "TYPESAFE_API_KEY_SECONDARY",
            "apikey_242664795a072674630aaa40b879573dfc1_487a1632509672e8bcfff03fff700c7ae55decad9c5da4618198c1b23ffa4c33",
        ).strip()
        
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

    async def record_failure(self, key: str, status_code: int, error_msg: str):
        if key in self.stats:
            self.stats[key]["failures"] += 1
            self.stats[key]["last_used"] = time.time()
            self.stats[key]["last_error"] = f"HTTP {status_code}: {error_msg}"
        
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
    def verify_arithmetic_statements(text: str) -> Tuple[List[VerifiedMathStep], List[str]]:
        """
        Extracts arithmetic and algebraic claims like '2 + 3 = 5' or '12 * 15 = 180'
        and deterministically validates them with SymPy.
        """
        verified_steps: List[VerifiedMathStep] = []
        corrections: List[str] = []
        
        # Pattern: math expression = claimed number/fraction
        # Example: 15 * 4 = 60, (12 * 5) / 2 = 30, 2^3 = 8
        eq_patterns = [
            r"([\(0-9][0-9\.\s\+\-\*\/×÷\^\(\)]+[\)0-9])\s*=\s*(\-?\d+(?:\.\d+)?)\b",
            r"\$([0-9\+\-\*\/×÷\^\.\s\(\)]+)\s*=\s*(\-?[0-9\.\/]+)\$"
        ]

        step_idx = 1
        found_matches = set()
        for pat in eq_patterns:
            for m in re.finditer(pat, text):
                expr_str, claimed_str = m.group(1).strip(), m.group(2).strip()
                # Must contain at least one arithmetic operator
                if not any(op in expr_str for op in ["+", "-", "*", "/", "×", "÷", "^"]):
                    continue
                # Skip trivial or already checked
                pair_key = (expr_str, claimed_str)
                if pair_key in found_matches:
                    continue
                found_matches.add(pair_key)

                clean_expr = expr_str.replace("×", "*").replace("÷", "/").replace("^", "**")
                try:
                    sym_val = sympy.sympify(clean_expr, evaluate=True)
                    num_val = float(sym_val.evalf())
                    claimed_num = float(sympy.sympify(claimed_str).evalf())
                    
                    is_match = abs(num_val - claimed_num) < 1e-6
                    diff_note = None
                    if not is_match:
                        diff_note = f"SymPy calculated {num_val}, but output claimed {claimed_num}"
                        corrections.append(f"Fixed calculation: `{expr_str}` = {num_val} (was claimed: {claimed_num})")

                    verified_steps.append(VerifiedMathStep(
                        step_index=step_idx,
                        raw_expression=expr_str,
                        evaluated_result=str(num_val if abs(num_val - round(num_val)) > 1e-9 else int(round(num_val))),
                        claimed_result=claimed_str,
                        is_match=is_match,
                        diff_note=diff_note
                    ))
                    step_idx += 1
                except Exception:
                    continue

        return verified_steps, corrections


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
    and executing deterministic reflexes (SymPy, Contradiction, MathViz).
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
        Calls TypeSafe SystemOne API (jev-latest) with automatic dual-key rotation.
        """
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

        # Up to 2 attempts across the key rotation pool
        for attempt in range(len(self.key_mgr.keys) or 1):
            active_key = self.key_mgr.get_active_key()
            if not active_key:
                break
            headers = {
                "Authorization": f"Bearer {active_key}",
                "Content-Type": "application/json"
            }
            body = {
                "model": self.model_name,
                "state": state_content[:3000],  # Bound context for fast inference
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
                    elif resp.status_code in (401, 403, 429):
                        logger.warning(f"[TypeSafe] Key failed ({resp.status_code}): {resp.text[:120]}. Rotating key...")
                        await self.key_mgr.record_failure(active_key, resp.status_code, resp.text[:100])
                    else:
                        logger.warning(f"[TypeSafe] Unexpected status {resp.status_code}: {resp.text[:120]}")
                        break
            except Exception as ex:
                logger.warning(f"[TypeSafe] SystemOne call attempt {attempt+1} error: {ex}")
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
        Stage 1 (Remote Middleware): Call TypeSafe SystemOne (jev-latest) for calibrated hallucination scoring & domain judgment.
        Stage 2 (Local Deterministic Reflex Engine): SymPy calculation check & auto-healing, contradiction checks, MathViz validation.
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

        # ── STAGE 1: Remote TypeSafe SystemOne Middleware Evaluation ──
        systemone_answers = None
        middleware_model = None
        systemone_hallucination_prob = 0.0
        systemone_score_val = 0.0

        eval_state = f"User Question: {user_message}\n\nModel Response:\n{raw_reply}"
        try:
            systemone_answers, middleware_model = await self.call_systemone_middleware(eval_state)
            if systemone_answers:
                # 1. Parse has_hallucination noul probability
                has_hal = systemone_answers.get("has_hallucination", {})
                systemone_hallucination_prob = float(has_hal.get("noul", 0.0))

                # 2. Parse hallucination_level score
                hal_score_obj = systemone_answers.get("hallucination_level", {})
                systemone_score_val = float(hal_score_obj.get("score", 0.0))

                # 3. Parse domain choice
                domain_obj = systemone_answers.get("math_domain", {})
                detected_domain = domain_obj.get("choice")
                if detected_domain and hasattr(MathDomain, detected_domain.upper()):
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

        # 2. Contradiction Reflex
        contradictions = self.reflex_engine.reflex_check_contradictions(sanitized_reply, intent)
        reflexes_triggered.extend(contradictions)

        # 3. Repetition Loop Reflex
        if self.reflex_engine.reflex_check_repetition_loops(sanitized_reply):
            reflexes_triggered.append("Repetition Reflex: Detected repeating phrase loop in generation")

        # 4. MathViz Schema Reflex
        sanitized_reply, mathviz_reflexes = self.reflex_engine.reflex_sanitize_mathviz_schema(sanitized_reply)
        reflexes_triggered.extend(mathviz_reflexes)

        # 5. Combined Hallucination Risk Score
        total_steps = len(verified_steps)
        failed_steps = sum(1 for s in verified_steps if not s.is_match)
        calc_risk = (failed_steps / total_steps) if total_steps > 0 else 0.0

        # Weighted combination: 50% SystemOne probabilistic assessment + 50% deterministic checks
        combined_risk = 0.5 * systemone_hallucination_prob + 0.5 * calc_risk
        if contradictions:
            combined_risk += 0.2
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
