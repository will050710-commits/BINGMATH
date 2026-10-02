"""test_chat_routing.py — offline suite for P5 (figure-only vs solve routing).

The routing matrix needs the standard library only. The WIRING checks read
main.py as TEXT (no import): main.py needs fastapi, and the CI offline job has
no reason to boot the app just to read its source.
"""
import os
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, os.path.dirname(__file__))

import chat_routing as cr  # noqa: E402

checks = 0
failures = 0


def check(label, ok, detail=""):
    global checks, failures
    checks += 1
    if ok:
        print(f"  [OK] {label}")
    else:
        failures += 1
        print(f"  [FAIL] {label} {detail}")


BACKEND = Path(__file__).resolve().parent
MAIN = (BACKEND / "main.py").read_text(encoding="utf-8")

print("=== placeholder detection ===")
check('the UI hint "Gợi ý bài toán từ ảnh" is a placeholder',
      cr.is_placeholder_message("Gợi ý bài toán từ ảnh"))
check("...even with odd spacing/case",
      cr.is_placeholder_message("  gợi ý BÀI  toán từ ảnh "))
check("an empty message is a placeholder",
      cr.is_placeholder_message("") and cr.is_placeholder_message(None))
check("a real question is not",
      not cr.is_placeholder_message("Cho tam giác ABC có AB = 5"))
# P14-fix — the three strings the DuoMCB page ACTUALLY sends today must count
# as placeholders too (the threeD one used to match the generic 2D keywords).
check('the threeD UI prompt "Minh họa tương tác cho bài toán này." is a placeholder',
      cr.is_placeholder_message("Minh họa tương tác cho bài toán này."))
check('the hint UI prompt "Gợi ý bài toán trong ảnh này." is a placeholder',
      cr.is_placeholder_message("Gợi ý bài toán trong ảnh này."))
check('the solution UI prompt "Giải chi tiết bài toán trong ảnh này." is a placeholder',
      cr.is_placeholder_message("Giải chi tiết bài toán trong ảnh này."))
check("a placeholder never counts as a usable statement",
      not cr.has_usable_statement(None, "Minh họa tương tác cho bài toán này."))

print("\n=== usable statement ===")
stmt = {"transcription": "Cho tam giác ABC có AB = 5, AC = 3, góc A = 60 độ"}
check("a transcription with numbers/length is a statement",
      cr.has_usable_statement(stmt, "Gợi ý bài toán từ ảnh"))
check("a short label-like transcription is NOT",
      not cr.has_usable_statement({"transcription": "hình tam giác"}, "Gợi ý bài toán từ ảnh"))
check("latex counts via the joined text",
      cr.has_usable_statement({"latex": ["x^2+1"]}, "Gợi ý bài toán từ ảnh"))
check("a long symbol-free transcription counts (30+ chars)",
      cr.has_usable_statement({"transcription": "Vẽ giúp mình một hình minh họa cho bài này"}, ""))
check("a typed message counts even without perception",
      cr.has_usable_statement(None, "Giải giúp em bài này với ạ"))
check("a typed placeholder does not",
      not cr.has_usable_statement(None, "Gợi ý bài toán từ ảnh"))

print("\n=== figure structure ===")
desc = ("LABELED POINTS: A: top vertex; B: left; C: right. Triangle ABC, D on BC, "
        "E on the extension of BC.")
check("a long vision description counts as structure",
      cr.figure_structure_available(None, desc))
check("a diagram flag counts too",
      cr.figure_structure_available({"diagram": True}, ""))
check("nothing readable → no structure",
      not cr.figure_structure_available({"confidence": 0.0}, ""))

print("\n=== decide_reply_mode matrix ===")
check("no image → solve",
      cr.decide_reply_mode(image_data=None, user_message="x") == "solve")
check("image + statement → solve",
      cr.decide_reply_mode(image_data="data:", perception=stmt,
                           user_message="Gợi ý bài toán từ ảnh") == "solve")
check("image + readable figure + no statement → figure_only",
      cr.decide_reply_mode(image_data="data:",
                           perception={"confidence": 0.0, "diagram": True},
                           vision_description=desc,
                           user_message="Gợi ý bài toán từ ảnh") == "figure_only")
check("image + nothing → solve (the ask-for-a-better-photo path)",
      cr.decide_reply_mode(image_data="data:", perception={"confidence": 0.0},
                           user_message="Gợi ý bài toán từ ảnh") == "solve")
check("the kill switch forces solve",
      cr.decide_reply_mode(image_data="data:", perception={"diagram": True},
                           vision_description=desc,
                           user_message="Gợi ý bài toán từ ảnh", enabled=False) == "solve")

print("\n=== the fixed notes ===")
check("the figure-only note says it did NOT solve",
      "chưa giải" in cr.FIGURE_ONLY_NOTE and "mô hình" in cr.FIGURE_ONLY_NOTE)
check("the no-block note asks for a clearer photo/text",
      "chụp lại" in cr.FIGURE_ONLY_NO_BLOCK_NOTE and "gõ đề" in cr.FIGURE_ONLY_NO_BLOCK_NOTE)

print("\n=== main.py wiring (source-level) ===")
check("main.py imports the routing module", "import chat_routing" in MAIN)
check("the routing decision runs with the kill switch",
      "chat_routing.decide_reply_mode(" in MAIN
      and 'os.environ.get("FIGURE_ONLY_ENABLED", "1")' in MAIN)
check("figure-only switches the prompt variant to the visualizer",
      '_reply_mode == "figure_only":' in MAIN
      and 'prompt_variant = "visualizer"' in MAIN)
check("figure-only replaces the solve-first hand-off",
      "CHẾ ĐỘ CHỈ-VẼ-HÌNH" in MAIN
      and "KHÔNG bịa số liệu, KHÔNG tự đặt câu hỏi, KHÔNG giải" in MAIN)
check("the server appends the fixed note (both variants)",
      "chat_routing.FIGURE_ONLY_NOTE" in MAIN
      and "chat_routing.FIGURE_ONLY_NO_BLOCK_NOTE" in MAIN)
check("figure-only never starts verification", '_reply_mode != "figure_only"' in MAIN)
check("the solution-first ordering rule is in the visual rules",
      "trình bày lời giải TRƯỚC" in MAIN
      and "bản minh họa ```mathviz đặt SAU CÙNG" in MAIN)
check("the per-answer log line records the reply mode", "reply={_reply_mode}" in MAIN)

# ── P14-fix (classroom report 2026-10-01) ───────────────────────────────────
# A tetrahedron photo answered with the local engine's canned "plane geometry"
# sample + a generic 2D triangle. Three wiring rules keep that fixed:
#   1. the canned UI prompts never drive widget detection (they matched the
#      generic 2D keywords and pinned every image to geometry_2d);
#   2. with a placeholder as the message, the VISION text picks the widget;
#   3. the local floor answers image requests honestly — the transcript or an
#      ask-for-a-better-photo — never a fabricated sample problem/figure.
print("\n=== P14-fix wiring (placeholder-safe widget + honest local floor) ===")
import re as _re  # noqa: E402
_COMMENT_RE = _re.compile(r"/\*[\s\S]*?\*/|(?<![:'\"`])#[^\n]*")
MAIN_CLEAN = _COMMENT_RE.sub("", MAIN)

check("detect_widget blanks a canned UI prompt before scanning",
      "if user_message and chat_routing.is_placeholder_message(user_message):" in MAIN)
check("the generic UI words are out of the 2D keyword list",
      '"tương tác"' not in MAIN_CLEAN and '"bài toán này"' not in MAIN_CLEAN
      and '"minh họa"' not in MAIN_CLEAN)
check("...while explicit drawing intent stays",
      '"vẽ hình", "dựng hình", "hình vẽ"' in MAIN)
check("with a placeholder, the vision text picks the widget",
      "if _widget is None and vision_description:" in MAIN
      and "_widget = detect_widget(str(vision_description)[:1200])" in MAIN)
check("the honest local-floor helper exists",
      "def _local_floor_reply(" in MAIN)
check("...and it is the ONLY caller of the canned mock",
      MAIN.count("generate_mock_mathgpt_reply(") == 2, str(MAIN.count("generate_mock_mathgpt_reply(")))
check("both local-floor call sites pass the image context",
      MAIN_CLEAN.count("had_image=bool(image_data)") >= 2,
      str(MAIN_CLEAN.count("had_image=bool(image_data)")))
check("the with-image reply says it is NOT a solution",
      "chưa phải lời giải" in MAIN)
check("the blind-with-image reply asks for a clearer photo",
      "chưa đọc được nội dung trong ảnh" in MAIN)
check("the honest floor skips verification (nothing was solved)",
      "_honest_floor = False" in MAIN
      and "_honest_floor = bool(image_data)" in MAIN
      and "and not _honest_floor" in MAIN_CLEAN)

print(f"\n{checks - failures}/{checks} CHAT ROUTING CHECKS PASSED")
if failures > 0:
    print(">>> CHAT ROUTING SUITE FAILED <<<")
    sys.exit(1)
