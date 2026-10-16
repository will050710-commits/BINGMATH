#!/usr/bin/env python3
"""Kiểm tra tình trạng từng API key trong backend/.env (còn dùng được / hết credit / sai key).

Chạy:   python scripts/check_api_keys.py            (từ thư mục backend)
        python scripts/check_api_keys.py --json     (in JSON, vẫn không lộ key)

AN TOÀN: không bao giờ in giá trị key. Chỉ in tên biến + 4 ký tự cuối. Mỗi key bị
thử bằng đúng MỘT request nhỏ (max_tokens=1) nên gần như không tốn credit.

Phân loại kết quả:
  OK               key dùng được
  HET_CREDIT       hết credit / hết quota (402, hoặc 429 có từ khóa quota/billing/credit)
  BI_GIOI_HAN_TAM  429 theo phút/giờ: chờ là dùng lại được, KHÔNG cần thay key
  SAI_KEY          401/403/400-invalid: key sai, bị thu hồi hoặc bị khóa
  MODEL_LOI        key hợp lệ nhưng model trong .env không còn (404)
  LOI_MANG         timeout / lỗi kết nối
  TRONG            biến có trong .env nhưng để trống
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from typing import Any, Dict, List, Optional, Tuple

import httpx

HERE = os.path.dirname(os.path.abspath(__file__))
BACKEND = os.path.abspath(os.path.join(HERE, ".."))

TIMEOUT = 25.0
QUOTA_WORDS = ("quota", "credit", "billing", "insufficient", "exhausted", "balance",
               "payment", "tokens per day", "requests per day", "daily", "free tier",
               "free-models-per-day", "exceeded your current")
TEMP_WORDS = ("per minute", "per second", "per hour", "try again", "too many requests", "tpm", "rpm")


def load_env(path: str) -> Dict[str, str]:
    env: Dict[str, str] = {}
    if not os.path.exists(path):
        return env
    with open(path, "r", encoding="utf-8-sig", errors="replace") as fh:
        for raw in fh:
            line = raw.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            name, value = line.split("=", 1)
            env[name.strip()] = value.strip().strip('"').strip("'")
    return env


def split_keys(raw: str) -> List[str]:
    seen, out = set(), []
    for part in re.split(r"[,;\s]+", raw or ""):
        part = part.strip()
        if part and part not in seen:
            seen.add(part)
            out.append(part)
    return out


def mask(key: str) -> str:
    return "…" + key[-4:] if len(key) > 8 else "…"


def scrub(text: str, key: str = "") -> str:
    text = (text or "").replace("\n", " ")
    if key:
        text = text.replace(key, "<key>")
    text = re.sub(r"(key=|Bearer\s+)[A-Za-z0-9_\-]{8,}", r"\1<key>", text)
    return text[:170]


def classify(status: int, body: str) -> Tuple[str, str]:
    low = (body or "").lower()
    if status == 200:
        return "OK", ""
    if status == 402:
        return "HET_CREDIT", "402 Payment Required"
    if status == 429:
        if any(w in low for w in QUOTA_WORDS) and not any(w in low for w in ("per minute",)):
            return "HET_CREDIT", "429 + quota/credit"
        if any(w in low for w in TEMP_WORDS):
            return "BI_GIOI_HAN_TAM", "429 theo phút/giờ"
        return "BI_GIOI_HAN_TAM", "429 (không rõ loại)"
    if status in (401, 403):
        return "SAI_KEY", f"HTTP {status}"
    if status == 400 and ("api key" in low or "api_key" in low or "invalid" in low and "key" in low):
        return "SAI_KEY", "400 key không hợp lệ"
    if status in (404, 410):
        return "MODEL_LOI", f"HTTP {status}"
    return "LOI_KHAC", f"HTTP {status}"


def openai_probe(url: str, key: str, model: str, extra: Optional[dict] = None) -> Tuple[int, str]:
    body = {"model": model, "messages": [{"role": "user", "content": "ping"}], "max_tokens": 1}
    if extra:
        body.update(extra)
    r = httpx.post(url, headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                   json=body, timeout=TIMEOUT)
    return r.status_code, r.text


def first(csv: str, default: str) -> str:
    items = [x.strip() for x in (csv or "").split(",") if x.strip()]
    return items[0] if items else default


def check_one(provider: str, key: str, env: Dict[str, str]) -> Dict[str, Any]:
    t0 = time.time()
    extra_info: Dict[str, Any] = {}
    try:
        if provider == "groq":
            model = first(env.get("GROQ_CHAT_MODELS", ""), "llama-3.1-8b-instant")
            status, body = openai_probe("https://api.groq.com/openai/v1/chat/completions", key, model)
        elif provider == "gemini":
            model = env.get("GEMINI_MODEL", "gemini-flash-latest")
            r = httpx.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                params={"key": key}, headers={"Content-Type": "application/json"},
                json={"contents": [{"parts": [{"text": "ping"}]}],
                      "generationConfig": {"maxOutputTokens": 1}}, timeout=TIMEOUT)
            status, body = r.status_code, r.text
        elif provider == "openrouter":
            r = httpx.get("https://openrouter.ai/api/v1/auth/key",
                          headers={"Authorization": f"Bearer {key}"}, timeout=TIMEOUT)
            status, body = r.status_code, r.text
            model = "(auth/key + credits)"
            if status == 200:
                d = (r.json() or {}).get("data", {})
                extra_info.update({"free_tier": d.get("is_free_tier"), "usage": d.get("usage"),
                                   "limit": d.get("limit"), "limit_remaining": d.get("limit_remaining")})
                try:
                    c = httpx.get("https://openrouter.ai/api/v1/credits",
                                  headers={"Authorization": f"Bearer {key}"}, timeout=TIMEOUT)
                    if c.status_code == 200:
                        cd = (c.json() or {}).get("data", {})
                        total, used = cd.get("total_credits"), cd.get("total_usage")
                        extra_info.update({"total_credits": total, "total_usage": used})
                        if isinstance(total, (int, float)) and isinstance(used, (int, float)):
                            extra_info["balance"] = round(total - used, 4)
                except Exception:
                    pass
                lim = d.get("limit_remaining")
                if isinstance(lim, (int, float)) and lim <= 0:
                    status = 402
                    body = "limit_remaining <= 0"
        elif provider == "cerebras":
            model = first(env.get("CEREBRAS_CHAT_MODELS", ""), "llama3.1-8b")
            status, body = openai_probe("https://api.cerebras.ai/v1/chat/completions", key, model)
        elif provider == "nvidia":
            model = first(env.get("NVIDIA_MATH_MODELS", ""), "meta/llama-3.1-8b-instruct")
            status, body = openai_probe("https://integrate.api.nvidia.com/v1/chat/completions", key, model)
        elif provider == "typesafe":
            if key.startswith("sk-or-"):
                r = httpx.get("https://openrouter.ai/api/v1/auth/key",
                              headers={"Authorization": f"Bearer {key}"}, timeout=TIMEOUT)
                status, body = r.status_code, r.text
                model = "openrouter/free (TypeSafe middleware)"
            else:
                model = env.get("TYPESAFE_AI_MODEL", "jev-latest")
                base = env.get("TYPESAFE_AI_BASE_URL", "https://api.typesafe.ai/v1").rstrip("/")
                r = httpx.post(f"{base}/systemone",
                               headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                               json={"model": model, "state": "2 + 2 = 4",
                                     "questions": {"has_hallucination": {
                                         "type": "noul", "instructions": "Is this arithmetic wrong?"}}},
                               timeout=TIMEOUT)
                status, body = r.status_code, r.text
        else:
            return {"state": "LOI_KHAC", "detail": "provider lạ"}
    except httpx.TimeoutException:
        return {"state": "LOI_MANG", "detail": f"timeout > {TIMEOUT:.0f}s", "ms": int((time.time() - t0) * 1000)}
    except Exception as exc:  # noqa: BLE001
        return {"state": "LOI_MANG", "detail": scrub(str(exc), key), "ms": int((time.time() - t0) * 1000)}

    state, why = classify(status, body)
    res: Dict[str, Any] = {"state": state, "http": status, "model": model,
                           "ms": int((time.time() - t0) * 1000)}
    if state != "OK":
        res["detail"] = f"{why} | {scrub(body, key)}"
    if extra_info:
        res["info"] = extra_info
    return res


# (biến .env, provider, dùng làm gì)
VARS: List[Tuple[str, str, str]] = [
    ("GROQ_API_KEY", "groq", "Tier Groq (trả lời nhanh)"),
    ("GROQ_API_KEY_SECONDARY", "groq", "Groq dự phòng"),
    ("GEMINI_API_KEY", "gemini", "Gemini: model chính + vision"),
    ("OPENROUTER_API_KEY", "openrouter", "OpenRouter: free tier, critic, sửa JSON"),
    ("CEREBRAS_API_KEY", "cerebras", "Cerebras (qwen-3.8-27b, gpt-oss-120b)"),
    ("NVIDIA_API_KEY_PRIMARY", "nvidia", "NVIDIA (nemotron, math/code)"),
    ("NVIDIA_API_KEY_SECONDARY", "nvidia", "NVIDIA dự phòng"),
    ("TYPESAFE_API_KEY_PRIMARY", "typesafe", "TypeSafe AI / Jev: duyệt ảo giác"),
    ("TYPESAFE_API_KEY_SECONDARY", "typesafe", "TypeSafe AI / Jev dự phòng"),
    ("VISION_HF_SPACE_TOKEN", "hf", "HF Space vision (không có API kiểm tra)"),
]

ICON = {"OK": "[ OK ]", "HET_CREDIT": "[HẾT ]", "BI_GIOI_HAN_TAM": "[CHỜ ]", "SAI_KEY": "[SAI ]",
        "MODEL_LOI": "[MODL]", "LOI_MANG": "[MẠNG]", "LOI_KHAC": "[LỖI ]", "TRONG": "[TRỐNG]"}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--env", default=os.path.join(BACKEND, ".env"))
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--out", default="", help="ghi báo cáo JSON (không chứa key) ra file")
    args = ap.parse_args()

    env = load_env(args.env)
    results: List[Dict[str, Any]] = []
    for var, provider, purpose in VARS:
        raw = env.get(var, "")
        keys = split_keys(raw)
        if var not in env:
            continue
        if not keys:
            results.append({"var": var, "purpose": purpose, "state": "TRONG", "detail": "biến để trống"})
            continue
        for idx, key in enumerate(keys, 1):
            entry: Dict[str, Any] = {"var": var if len(keys) == 1 else f"{var}#{idx}",
                                     "purpose": purpose, "key": mask(key)}
            if provider == "hf":
                entry.update({"state": "OK", "detail": "có token (không kiểm tra được qua API)"})
            else:
                entry.update(check_one(provider, key, env))
            results.append(entry)

    if args.out:
        os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
        with open(args.out, "w", encoding="utf-8") as fh:
            json.dump({"checked_at": time.strftime("%Y-%m-%d %H:%M:%S"), "results": results},
                      fh, ensure_ascii=False, indent=2)
    if args.json:
        print(json.dumps(results, ensure_ascii=False, indent=2))
    else:
        print(f"Kiểm tra lúc {time.strftime('%Y-%m-%d %H:%M:%S')}  (.env: {os.path.basename(args.env)})\n")
        for e in results:
            line = f"{ICON.get(e['state'], '[ ?? ]')} {e['var']:<30} {e.get('key', ''):<8} {e['purpose']}"
            print(line)
            if e.get("model"):
                print(f"         model={e['model']}  http={e.get('http')}  {e.get('ms')}ms")
            if e.get("info"):
                print(f"         info={e['info']}")
            if e["state"] not in ("OK",) and e.get("detail"):
                print(f"         -> {e['detail']}")
        need = [e["var"] for e in results if e["state"] in ("HET_CREDIT", "SAI_KEY")]
        print("\nCẦN THAY:", ", ".join(need) if need else "không có key nào cần thay")
    return 0


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    sys.exit(main())
