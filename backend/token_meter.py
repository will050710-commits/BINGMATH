"""
token_meter.py
==============
P10 — đo lượng token/quota cho MỌI lời gọi nhà cung cấp, để trang admin trả
lời được câu hỏi vận hành: hôm nay đã tiêu bao nhiêu, còn lại bao nhiêu, khoá
nào đang tới hạn.

Vì sao cần hai nửa
------------------
Các tầng free không cùng mức độ minh bạch quota:
  * Cerebras và Groq trả header `x-ratelimit-remaining-*` ngay trên mỗi câu
    trả lời (kiểm chứng live 2026-10-01) → đo được LIVE;
  * Gemini và NVIDIA không gửi header quota nào → chỉ có thể TỰ ĐẾM từ
    `usage` của chính các payload (không bao giờ được "vẽ" số như thể là live);
  * OpenRouter là sổ credit trả phí — cũng tự đếm từ usage.

Module này chỉ chứa hàm thuần: đọc payload usage, đọc header reset, đổi
"remaining / limit" thành kim đo. Phần SQL nằm ở main.py (`token_log` /
`token_usage_summary`), nên toàn bộ phép tính và cách parse test được offline
(`test_token_meter.py`), không cần mạng, không cần khoá.
"""

from __future__ import annotations

import os
from typing import Mapping, Optional

#: Ngưỡng kim đo: dưới 15% = đỏ (critical), dưới 30% = vàng (low). Cùng tinh
#: thần "nói thật" của P3: số không có thì hiện "unknown", không tô xanh giả.
GAUGE_CRITICAL_PCT = 15.0
GAUGE_LOW_PCT = 30.0

#: Trần cửa sổ admin cho endpoint /api/admin/token-usage.
MAX_WINDOW_DAYS = 90


def env_int(name: str, default: int, *, lo: int = 0, hi: int = 10_000) -> int:
    """env_int của chat_budget.py cố tình không import được ở đây (module này
    phải đứng một mình); cùng quy ước: giá trị hỏng dùng default, luôn kẹp."""
    raw = os.environ.get(name)
    if raw is None or str(raw).strip() == "":
        return default
    try:
        value = int(float(str(raw).strip()))
    except (TypeError, ValueError):
        return default
    return max(lo, min(value, hi))


def retention_days() -> int:
    """Số ngày giữ log token (mặc định 30; 0 = giữ mãi)."""
    return env_int("TOKEN_USAGE_RETENTION_DAYS", 30, lo=0, hi=3650)


def _int(value) -> int:
    try:
        return int(value or 0)
    except (TypeError, ValueError):
        return 0


def normalize_openai_usage(payload) -> dict:
    """`usage` của mọi API OpenAI-compatible → dict chuẩn hoá.

    Nhận CẢ HAI dạng: response đầy đủ (có khoá `usage`) hoặc chính object
    usage. `completion_tokens_details.reasoning_tokens` được tách riêng vì các
    model reasoning (Cerebras qwen/gpt-oss, NVIDIA Nemotron) đốt phần lớn ngân
    sách vào đó — con số này chính là thứ P8 phải chống bằng sàn 3072.
    """
    if not isinstance(payload, dict):
        return {"input_tokens": 0, "output_tokens": 0, "total_tokens": 0,
                "reasoning_tokens": 0}
    usage = payload.get("usage") if isinstance(payload.get("usage"), dict) else payload
    details = usage.get("completion_tokens_details") or {}
    if not isinstance(details, dict):
        details = {}
    return {
        "input_tokens": _int(usage.get("prompt_tokens")),
        "output_tokens": _int(usage.get("completion_tokens")),
        "total_tokens": _int(usage.get("total_tokens")),
        "reasoning_tokens": _int(details.get("reasoning_tokens")),
    }


def normalize_gemini_usage(payload) -> dict:
    """`usageMetadata` của Gemini → cùng dict chuẩn hoá.

    `thoughtsTokenCount` (token suy nghĩ) được cộng vào output — nó vẫn tiêu
    quota — nhưng báo riêng ở `reasoning_tokens` để nhìn ra model nào đang
    suy nghĩ quá nhiều.
    """
    if not isinstance(payload, dict):
        return {"input_tokens": 0, "output_tokens": 0, "total_tokens": 0,
                "reasoning_tokens": 0}
    meta = payload.get("usageMetadata") or payload.get("usage_metadata") or {}
    if not isinstance(meta, dict):
        meta = {}
    thoughts = _int(meta.get("thoughtsTokenCount"))
    candidates = _int(meta.get("candidatesTokenCount"))
    total = _int(meta.get("totalTokenCount")) or (
        _int(meta.get("promptTokenCount")) + candidates + thoughts)
    return {
        "input_tokens": _int(meta.get("promptTokenCount")),
        "output_tokens": candidates + thoughts,
        "total_tokens": total,
        "reasoning_tokens": thoughts,
    }


def quota_snapshot(provider: str, headers: Optional[Mapping[str, str]]) -> Optional[dict]:
    """Ảnh chụp quota LIVE từ header của một câu trả lời, hoặc None.

    Không nhà cung cấp nào gửi cùng tên header, nên cách làm là quét mọi
    `x-ratelimit-remaining-*` / `x-ratelimit-limit-*` (phần hậu tố giữ nguyên,
    ví dụ `tokens-day`, `requests-minute`) và cả `retry-after`. Trả None khi
    không có gì — admin phải thấy "self-count", không phải một kim giả.
    """
    if not headers:
        return None
    remaining: dict = {}
    limit: dict = {}
    reset: dict = {}
    retry_after = None
    for raw_key, raw_value in headers.items():
        key = str(raw_key).lower()
        value = str(raw_value).strip()
        if not value:
            continue
        if key == "retry-after":
            retry_after = value
        elif key.startswith("x-ratelimit-remaining-"):
            remaining[key[len("x-ratelimit-remaining-"):]] = value
        elif key.startswith("x-ratelimit-limit-"):
            limit[key[len("x-ratelimit-limit-"):]] = value
        elif key.startswith("x-ratelimit-reset-"):
            reset[key[len("x-ratelimit-reset-"):]] = value
    if not (remaining or limit or reset or retry_after):
        return None
    snap = {"provider": str(provider or "")[:24], "remaining": remaining,
            "limit": limit, "reset": reset}
    if retry_after is not None:
        snap["retry_after"] = retry_after
    return snap


def pct_left(remaining, limit) -> Optional[float]:
    """% còn lại, kẹp 0..100. None khi thiếu số hoặc limit <= 0 (không đoán)."""
    try:
        r = float(remaining)
        l = float(limit)
    except (TypeError, ValueError):
        return None
    if l <= 0:
        return None
    return max(0.0, min(100.0, r / l * 100.0))


def gauge_state(pct: Optional[float]) -> str:
    """Đổi % còn lại thành trạng thái hiển thị. `unknown` khi không có số —
    đây là nhãn trung thực cho Gemini/NVIDIA (self-count không có trần)."""
    if pct is None:
        return "unknown"
    if pct < GAUGE_CRITICAL_PCT:
        return "critical"
    if pct < GAUGE_LOW_PCT:
        return "low"
    return "ok"

