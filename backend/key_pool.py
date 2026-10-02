"""
key_pool.py
===========
P11 — một "bể khoá" nhỏ cho các tầng free-tier (Groq hôm nay, NVIDIA theo cùng
khuôn mẫu ở P12), thuần Python và test được offline.

Vì sao cần module này
---------------------
Mọi nhà cung cấp free đều tính quota THEO TỪNG KHOÁ: Groq đếm request và token
cho mỗi key; một khoá hết quota (429), sai quyền (401/403) hay vượt trần TPM
(413 — file lớn gửi kèm) là vô dụng cho tới khi có người sửa biến môi trường.
Với đúng một khoá trong `GROQ_API_KEY`, MỘT lần 429 là cả nhà cung cấp bị gạch
tên hết ngày và thang tier chat lặng lẽ mất đi một tầng.

Bể khoá thêm gì
---------------
  * `GROQ_API_KEY_SECONDARY` (và hai khoá NVIDIA sau này) tham gia cùng bể;
  * trạng thái lỗi-cấp-khoá (401/403/413/429) làm cool-down ĐÚNG khoá đó rồi
    thử lại CÙNG model bằng khoá kế tiếp — một round-trip thêm, không mất tier;
  * cooldown tôn trọng chính header của nhà cung cấp (`retry-after`,
    `x-ratelimit-reset-requests`, `x-ratelimit-reset-tokens` — đã kiểm chứng
    live trên Groq/Cerebras 2026-10-01), nên khoá quay lại đúng lúc provider
    nói thay vì đoán;
  * `snapshot()` là thứ trang admin nhìn thấy: khoá nào đang chạy, khoá nào
    đang cooldown, còn bao lâu — không bao giờ lộ chính khoá.

Quy ước thiết kế (theo chat_budget.py / fallback_policy.py)
-----------------------------------------------------------
  * Thuần Python, không mạng, không import main.py — cả lớp test được offline
    với đồng hồ được tiêm vào (`test_key_pool.py`).
  * Không bao giờ ném lỗi khi ghi trạng thái; cùng lắm trả "" (caller đã xử lý
    trường hợp "chưa cấu hình khoá").
  * Không bao giờ đưa khoá vào log: `key_id()` chỉ hiện 4 ký tự cuối.
"""

from __future__ import annotations

import re
import threading
import time
from typing import Callable, Dict, List, Mapping, Optional

#: Các mã trạng thái nghĩa là "khoá NÀY không dùng được ngay bây giờ, thử khoá
#: kế tiếp": 401/403 = khoá sai/bị thu hồi, 413 = vượt trần TPM của khoá (Groq),
#: 429 = rate limit. Lỗi nội dung (400/422/500) KHÔNG phải lỗi khoá.
RETRYABLE_STATUSES = (401, 403, 413, 429)

DEFAULT_COOLDOWN_S = 60.0        # không có header chỉ đường: nghỉ một phút
INVALID_KEY_COOLDOWN_S = 3600.0  # 401/403: khoá thu hồi không tự sống lại
MAX_COOLDOWN_S = 24 * 3600.0

# `(?![A-Za-z])` thay cho `\b`: đơn vị phải KHÔNG dính chữ cái kế tiếp, nhưng
# được phép dính CHỮ SỐ — chính là dạng Groq gửi ("2m59.56s", "1h2m"), nơi
# `\b` cũ làm mất số hạng đầu (giữa "m" và "5" không có word boundary).
_DURATION_RE = re.compile(r"(\d+(?:\.\d+)?)\s*(ms|s|m|h|d)(?![A-Za-z])", re.IGNORECASE)
_UNIT_S = {"ms": 0.001, "s": 1.0, "m": 60.0, "h": 3600.0, "d": 86400.0}


def parse_keys(*raw_values: Optional[str]) -> List[str]:
    """Tách danh sách khoá kiểu env (phẩy / chấm phẩy / khoảng trắng / xuống
    dòng), strip, bỏ rỗng, khử trùng lặp giữ nguyên thứ tự khai báo."""
    seen = set()
    out: List[str] = []
    for raw in raw_values:
        if not raw:
            continue
        for part in re.split(r"[,;\s]+", str(raw)):
            key = part.strip()
            if key and key not in seen:
                seen.add(key)
                out.append(key)
    return out


def key_id(key: str) -> str:
    """Danh tính an toàn để ghi log: chỉ 4 ký tự cuối của khoá."""
    key = (key or "").strip()
    return f"…{key[-4:]}" if len(key) >= 4 else "(short)"


def headers_for(key: str) -> Dict[str, str]:
    """Header chuẩn mà mọi provider OpenAI-compatible đều nhận."""
    return {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}


def parse_reset_duration(value: str) -> Optional[float]:
    """`"1s"`, `"120ms"`, `"2m59.56s"` → số giây. None khi không đọc được."""
    if not value:
        return None
    total = 0.0
    found = False
    for amount, unit in _DURATION_RE.findall(str(value)):
        found = True
        total += float(amount) * _UNIT_S[unit.lower()]
    return total if found else None


def cooldown_seconds(status: int, headers: Optional[Mapping[str, str]] = None, *,
                     default: float = DEFAULT_COOLDOWN_S) -> float:
    """Khoá này nên nghỉ bao lâu sau `status`.

    `retry-after` được ưu tiên khi có (đó là câu trả lời tường minh của
    provider), rồi tới các header `x-ratelimit-reset-*` (Groq và Cerebras đều
    gửi nhiều header dạng này; chọn giá trị dài nhất để an toàn). Mọi giá trị
    được kẹp vào [1, MAX_COOLDOWN_S]. 401/403 dùng cooldown khoá-hỏng: khoá bị
    thu hồi không tự sống lại sau một phút.
    """
    if status in (401, 403):
        return INVALID_KEY_COOLDOWN_S
    value: Optional[float] = None
    if headers:
        low = {str(k).lower(): str(v) for k, v in headers.items()}
        retry = low.get("retry-after")
        if retry:
            try:
                value = float(retry)
            except (TypeError, ValueError):
                value = parse_reset_duration(retry)
        if value is None:
            resets = [parse_reset_duration(v) for k, v in low.items()
                      if k.startswith("x-ratelimit-reset") and v]
            resets = [r for r in resets if r is not None]
            if resets:
                value = max(resets)
    if value is None:
        value = default
    return max(1.0, min(float(value), MAX_COOLDOWN_S))


class KeyPool:
    """Tập khoá có thứ tự, kèm cooldown riêng cho từng khoá. An toàn luồng;
    đồng hồ được tiêm vào nên test có thể "du hành thời gian"."""

    def __init__(self, keys, *, name: str = "pool",
                 clock: Optional[Callable[[], float]] = None) -> None:
        self.name = name
        self._keys: List[str] = list(keys)
        self._clock: Callable[[], float] = clock or time.monotonic
        self._cooldown_until: Dict[str, float] = {}
        self._failures: Dict[str, int] = {}
        self._lock = threading.Lock()

    # ── hình dạng ────────────────────────────────────────────────────────────
    def __len__(self) -> int:
        return len(self._keys)

    def has_keys(self) -> bool:
        return bool(self._keys)

    @property
    def keys(self) -> List[str]:
        return list(self._keys)

    @staticmethod
    def retryable(status: int) -> bool:
        return status in RETRYABLE_STATUSES

    # ── chọn khoá ────────────────────────────────────────────────────────────
    def request_order(self) -> List[str]:
        """Mọi khoá, tốt-nhất-trước: khoá còn sống (theo thứ tự khai báo), rồi
        khoá đang cooldown xếp theo thời điểm hồi phục sớm nhất. Vòng xoay của
        caller gọi hàm này MỘT lần mỗi request để làm việc trên ảnh chụp ổn
        định của bể."""
        with self._lock:
            now = self._clock()
            live = [k for k in self._keys if self._cooldown_until.get(k, 0.0) <= now]
            cooling = sorted((k for k in self._keys if k not in live),
                             key=lambda k: self._cooldown_until.get(k, 0.0))
            return live + cooling

    def active(self) -> str:
        """Khoá mà một request mới nên bắt đầu: khoá đầu tiên chưa cooldown;
        khi TẤT CẢ đang cooldown thì khoá hồi phục sớm nhất (vẫn hơn là không
        gửi gì). Bể rỗng trả ""."""
        order = self.request_order()
        return order[0] if order else ""

    def active_id(self) -> str:
        return key_id(self.active())

    # ── ghi trạng thái ───────────────────────────────────────────────────────
    def note_ok(self, key: str) -> None:
        with self._lock:
            self._cooldown_until.pop(key, None)
            self._failures.pop(key, None)

    def note_response(self, key: str, status: int,
                      headers: Optional[Mapping[str, str]] = None) -> None:
        """Cập nhật trạng thái từ MỘT response HTTP: 2xx xoá cooldown của khoá;
        trạng thái lỗi-cấp-khoá đặt cooldown (đọc từ header reset của provider)."""
        if not key:
            return
        with self._lock:
            if 200 <= int(status) < 300:
                self._cooldown_until.pop(key, None)
                self._failures.pop(key, None)
                return
            if int(status) in RETRYABLE_STATUSES:
                self._failures[key] = self._failures.get(key, 0) + 1
                self._cooldown_until[key] = self._clock() + cooldown_seconds(status, headers)

    def snapshot(self) -> List[Dict[str, object]]:
        """Trạng thái cho trang admin: thứ tự, id, live/cooling, giây còn lại,
        số lần lỗi. KHÔNG bao giờ trả về chính khoá."""
        with self._lock:
            now = self._clock()
            out: List[Dict[str, object]] = []
            for index, key in enumerate(self._keys):
                until = self._cooldown_until.get(key, 0.0)
                left = max(0.0, until - now)
                out.append({
                    "index": index,
                    "id": key_id(key),
                    "state": "live" if left <= 0 else "cooling",
                    "cooldown_left_s": round(left, 1),
                    "failures": self._failures.get(key, 0),
                })
            return out

