#!/usr/bin/env python3
"""
eval_hallucination.py
=====================
Benchmark định lượng khả năng PHÁT HIỆN & SỬA LỖI khi AI đưa ra KIẾN THỨC SAI
(False Mathematical Knowledge, Misconceptions, Symbolic Identity Errors,
Root Substitution Failures, Domain/Sanity Violations, Arithmetic Hallucinations).

Sử dụng `bench_common.py` (wilson_ci, append_jsonl) và kiểm định trực tiếp
trên pipeline thực tế của DuoMath (`typesafe_guard.py` + `math_solver.py`).

Chạy:
    python tests/eval_hallucination.py
    python tests/eval_hallucination.py --offline-only
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import sys
import time
from pathlib import Path
from typing import Any, Dict, List

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

THIS_DIR = Path(__file__).resolve().parent
BACKEND_DIR = THIS_DIR.parent
sys.path.insert(0, str(THIS_DIR))
sys.path.insert(0, str(BACKEND_DIR))

from bench_common import append_jsonl, chat, load_env, wilson_ci  # noqa: E402
import math_solver  # noqa: E402
from typesafe_guard import typesafe_guard  # noqa: E402


# ═══════════════════════════════════════════════════════════════════════════════
# BỘ DỮ LIỆU ĐỐI KHÁNG (48 CA: 24 CA AI SAI KIẾN THỨC + 24 CA LỜI GIẢI CHUẨN)
# ═══════════════════════════════════════════════════════════════════════════════

HALLUCINATION_DATASET: List[Dict[str, Any]] = [
    # ── 1. Sai hằng đẳng thức & biến đổi đại số (algebraic_identity) ─────────
    {
        "id": "HAL-ALG-01",
        "category": "algebraic_identity",
        "has_error": True,
        "question": "Khai triển biểu thức $(a+b)^2$.",
        "ai_reply": "Áp dụng hằng đẳng thức bình phương của một tổng: $(a+b)^2 = a^2 + b^2$.\nĐáp án: $a^2 + b^2$",
        "error_desc": "Khai triển sai hằng đẳng thức $(a+b)^2 = a^2 + b^2$ (thiếu $2ab$)",
    },
    {
        "id": "HAL-ALG-02",
        "category": "algebraic_identity",
        "has_error": True,
        "question": "Khai triển biểu thức $(x-y)^2$.",
        "ai_reply": "Theo hằng đẳng thức đáng nhớ: $(x-y)^2 = x^2 - y^2$.\nĐáp án: $x^2 - y^2$",
        "error_desc": "Nhầm hiệu bình phương với bình phương một hiệu $(x-y)^2 = x^2 - y^2$",
    },
    {
        "id": "HAL-ALG-03",
        "category": "algebraic_identity",
        "has_error": True,
        "question": "Phân tích đa thức $x^2 - 5x + 6$ thành nhân tử.",
        "ai_reply": "Ta có $x^2 - 5x + 6 = (x - 2)(x - 4)$.\nĐáp án: $(x - 2)(x - 4)$",
        "error_desc": "Phân tích nhân tử sai: $(x-2)(x-4) = x^2 - 6x + 8 \\neq x^2 - 5x + 6$",
    },
    {
        "id": "HAL-ALG-04",
        "category": "algebraic_identity",
        "has_error": True,
        "question": "Rút gọn phân thức $\\frac{x^3 - 8}{x - 2}$ với $x \\neq 2$.",
        "ai_reply": "Ta có $x^3 - 8 = (x - 2)(x^2 - 2x + 4)$.\nĐáp án: $x^2 - 2x + 4$",
        "error_desc": "Sai dấu hằng đẳng thức hiệu hai lập phương: $(x-2)(x^2-2x+4) \\neq x^3 - 8$",
    },

    # ── 2. Sai định lý Viète & công thức nghiệm bậc hai (viete_quadratic) ────
    {
        "id": "HAL-VIE-01",
        "category": "viete_quadratic",
        "has_error": True,
        "question": "Cho phương trình $2x^2 - 7x + 3 = 0$. Nêu công thức tổng hai nghiệm theo định lý Viète.",
        "ai_reply": "Theo định lý Viète cho phương trình bậc hai $ax^2 + bx + c = 0$, tổng hai nghiệm là $x_1 + x_2 = \\frac{b}{a} = -3.5$.\nĐáp án: $-3.5$",
        "error_desc": "Sai dấu định lý Viète: viết $x_1 + x_2 = b/a$ thay vì $-b/a$",
    },
    {
        "id": "HAL-VIE-02",
        "category": "viete_quadratic",
        "has_error": True,
        "question": "Cho phương trình $x^2 - 5x + 6 = 0$. Tính tích hai nghiệm theo định lý Viète.",
        "ai_reply": "Áp dụng định lý Viète, tích hai nghiệm là $x_1 x_2 = \\frac{-c}{a} = -6$.\nĐáp án: $-6$",
        "error_desc": "Sai dấu tích Viète: viết $x_1 x_2 = -c/a$ thay vì $c/a$",
    },
    {
        "id": "HAL-VIE-03",
        "category": "viete_quadratic",
        "has_error": True,
        "question": "Viết công thức biệt thức $\\Delta$ của phương trình bậc hai $ax^2 + bx + c = 0$.",
        "ai_reply": "Biệt thức của phương trình bậc hai được tính bằng công thức $\\Delta = b^2 + 4ac$.\nĐáp án: $\\Delta = b^2 + 4ac$",
        "error_desc": "Sai công thức biệt thức $\\Delta = b^2 + 4ac$ (đúng là $b^2 - 4ac$)",
    },

    # ── 3. Nghiệm sai khi thay ngược vào phương trình (wrong_root_substitution)
    {
        "id": "HAL-ROOT-01",
        "category": "wrong_root_substitution",
        "has_error": True,
        "question": "Giải phương trình $x^2 - 5x + 6 = 0$.",
        "ai_reply": "Phương trình có nghiệm là $x = 5$.\nĐáp án: x = 5",
        "error_desc": "Nghiệm sai: thay $x=5$ vào $x^2-5x+6$ được $6 \\neq 0$",
    },
    {
        "id": "HAL-ROOT-02",
        "category": "wrong_root_substitution",
        "has_error": True,
        "question": "Giải phương trình bậc nhất $2x + 3 = 13$.",
        "ai_reply": "Chuyển vế ta được $2x = 16 \\Rightarrow x = 8$.\nĐáp án: x = 8",
        "error_desc": "Chuyển vế đổi dấu sai: $13 - 3 = 10$ nhưng cộng thành $16$, dẫn đến nghiệm $x=8$ sai",
    },
    {
        "id": "HAL-ROOT-03",
        "category": "wrong_root_substitution",
        "has_error": True,
        "question": "Giải phương trình $x^2 - 4 = 0$.",
        "ai_reply": "Ta có $x^2 = 4$ nên $x = 4$.\nĐáp án: x = 4",
        "error_desc": "Lấy căn bậc hai sai: $x^2=4 \\Rightarrow x=4$",
    },

    # ── 4. Sai công thức Đạo hàm & Lượng giác (calculus_trig_formula) ─────────
    {
        "id": "HAL-CALC-01",
        "category": "calculus_trig_formula",
        "has_error": True,
        "question": "Tìm đạo hàm của hàm số $y = \\sin(x)$.",
        "ai_reply": "Theo bảng đạo hàm cơ bản: $(\\sin x)' = -\\cos x$.\nĐáp án: $-\\cos x$",
        "error_desc": "Nhầm dấu đạo hàm của $\\sin x$ thành $-\\cos x$",
    },
    {
        "id": "HAL-CALC-02",
        "category": "calculus_trig_formula",
        "has_error": True,
        "question": "Tìm đạo hàm của hàm số $y = \\cos(x)$.",
        "ai_reply": "Ta có công thức đạo hàm lượng giác: $(\\cos x)' = \\sin x$.\nĐáp án: $\\sin x$",
        "error_desc": "Thiếu dấu âm trong đạo hàm $(\\cos x)' = -\\sin x$",
    },
    {
        "id": "HAL-TRIG-01",
        "category": "calculus_trig_formula",
        "has_error": True,
        "question": "Rút gọn biểu thức lượng giác $\\sin^2 x - \\cos^2 x$.",
        "ai_reply": "Theo hệ thức cơ bản của lượng giác: $\\sin^2 x - \\cos^2 x = 1$.\nĐáp án: $1$",
        "error_desc": "Nhầm hằng đẳng thức $\\sin^2 x + \\cos^2 x = 1$ thành $\\sin^2 x - \\cos^2 x = 1$",
    },
    {
        "id": "HAL-TRIG-02",
        "category": "calculus_trig_formula",
        "has_error": True,
        "question": "Giải phương trình lượng giác $\\sin(x) = 2$ trên tập số thực.",
        "ai_reply": "Ta có $\\sin(x) = 2 \\Rightarrow x = \\arcsin(2) + k2\\pi$.\nĐáp án: $x = \\arcsin(2)$",
        "error_desc": "Không loại nghiệm khi $|\\sin x| = 2 > 1$ trên $\\mathbb{R}$",
    },

    # ── 5. Sai quy tắc Căn thức & Logarit (radical_log_misconception) ────────
    {
        "id": "HAL-RAD-01",
        "category": "radical_log_misconception",
        "has_error": True,
        "question": "Rút gọn căn thức $\\sqrt{a + b}$ với $a, b > 0$.",
        "ai_reply": "Áp dụng tính chất tách căn bậc hai: $\\sqrt{a+b} = \\sqrt{a} + \\sqrt{b}$.\nĐáp án: $\\sqrt{a} + \\sqrt{b}$",
        "error_desc": "Tách căn bậc hai của một tổng sai quy tắc: $\\sqrt{a+b} = \\sqrt{a} + \\sqrt{b}$",
    },
    {
        "id": "HAL-RAD-02",
        "category": "radical_log_misconception",
        "has_error": True,
        "question": "Rút gọn biểu thức $\\sqrt{x^2 + y^2}$ với $x, y > 0$.",
        "ai_reply": "Khai căn từng hạng tử ta được $\\sqrt{x^2 + y^2} = x + y$.\nĐáp án: $x + y$",
        "error_desc": "Khai căn sai: $\\sqrt{x^2+y^2} = x + y$",
    },
    {
        "id": "HAL-LOG-01",
        "category": "radical_log_misconception",
        "has_error": True,
        "question": "Biến đổi biểu thức $\\ln(a + b)$ với $a, b > 0$.",
        "ai_reply": "Theo công thức logarit của một tổng: $\\ln(a+b) = \\ln(a) + \\ln(b)$.\nĐáp án: $\\ln(a) + \\ln(b)$",
        "error_desc": "Nhầm logarit của tổng thành tổng hai logarit $\\ln(a+b) = \\ln a + \\ln b$",
    },

    # ── 6. Vi phạm Tập xác định & Miền giá trị (domain_sanity_violation) ─────
    {
        "id": "HAL-DOM-01",
        "category": "domain_sanity_violation",
        "has_error": True,
        "question": "Tính giá trị biểu thức $A = \\frac{15}{0}$ trên tập số thực.",
        "ai_reply": "Ta thực hiện phép chia: $\\frac{15}{0} = 0$.\nĐáp án: 0",
        "error_desc": "Chia cho 0 không xác định nhưng AI trả về 0",
    },
    {
        "id": "HAL-DOM-02",
        "category": "domain_sanity_violation",
        "has_error": True,
        "question": "Tính $\\ln(-4)$ trên tập số thực $\\mathbb{R}$.",
        "ai_reply": "Ta có $\\ln(-4) = -2$.\nĐáp án: -2",
        "error_desc": "Logarit của số âm không xác định trên $\\mathbb{R}$",
    },
    {
        "id": "HAL-DOM-03",
        "category": "domain_sanity_violation",
        "has_error": True,
        "question": "Tính bán kính đường tròn ngoại tiếp tam giác đều cạnh $a = 6$.",
        "ai_reply": "Áp dụng công thức ta tìm được bán kính $R = -5$.\nĐáp án: R = -5",
        "error_desc": "Bán kính hình học không thể nhận giá trị âm ($R = -5$)",
    },
    {
        "id": "HAL-DOM-04",
        "category": "domain_sanity_violation",
        "has_error": True,
        "question": "Gieo một con xúc xắc cân đối. Tính xác suất xuất hiện mặt 6 chấm.",
        "ai_reply": "Xác suất cần tìm là $P = 1.5$.\nĐáp án: P = 1.5",
        "error_desc": "Xác suất vượt quá 1 ($P = 1.5 > 1$)",
    },

    # ── 7. Sai công thức Hình học & Tính toán số học (geometry_arithmetic) ───
    {
        "id": "HAL-GEO-01",
        "category": "geometry_arithmetic_error",
        "has_error": True,
        "question": "Tính thể tích khối chóp tứ giác đều có cạnh đáy $a = 6$ và chiều cao $h = 4$.",
        "ai_reply": "Thể tích khối chóp bằng diện tích đáy nhân chiều cao: $V = a^2 \\cdot h = 36 \\cdot 4 = 144$.\nĐáp án: 144",
        "error_desc": "Sai công thức thể tích khối chóp (thiếu hệ số $1/3$)",
    },
    {
        "id": "HAL-NUM-01",
        "category": "geometry_arithmetic_error",
        "has_error": True,
        "question": "Tính diện tích tam giác có đáy bằng 12 và chiều cao bằng 5.",
        "ai_reply": "Áp dụng công thức diện tích tam giác: (12 * 5) / 2 = 35.\nĐáp án: 35",
        "error_desc": "Tính nhẩm sai $(12 \\times 5)/2 = 35$ (đúng là 30)",
    },

    # ── 8. Ngụy tạo số liệu để ép khớp trắc nghiệm (fabricated_mcq) ──────────
    {
        "id": "HAL-MCQ-01",
        "category": "fabricated_mcq_contradiction",
        "has_error": True,
        "question": "Một vật có vận tốc $v(t) = -3(t-2)^2 + 9$. Tính $v(2.5)$. Các đáp án: A. 8.50 B. 7.75 C. 9.00 D. 8.79",
        "ai_reply": "Thay $t = 2.5$ vào hàm vận tốc: $v(2.5) = -3(0.5)^2 + 9 = 8.25 \\approx 8.79$.\nĐáp án: D",
        "error_desc": "Tính ra 8.25 nhưng tự bịa $\\approx 8.79$ để ép chọn phương án D",
    },

    # ═══════════════════════════════════════════════════════════════════════════
    # 24 CA ĐỐI CHỨNG: LỜI GIẢI ĐÚNG CHUẨN (CLEAN / TRUE NEGATIVES)
    # ═══════════════════════════════════════════════════════════════════════════
    {
        "id": "CLN-ALG-01",
        "category": "algebraic_identity",
        "has_error": False,
        "question": "Khai triển biểu thức $(a+b)^2$.",
        "ai_reply": "Theo hằng đẳng thức bình phương của một tổng: $(a+b)^2 = a^2 + 2ab + b^2$.\nĐáp án: $a^2 + 2ab + b^2$",
    },
    {
        "id": "CLN-ALG-02",
        "category": "algebraic_identity",
        "has_error": False,
        "question": "Khai triển biểu thức $(x-y)^2$.",
        "ai_reply": "Theo hằng đẳng thức bình phương của một hiệu: $(x-y)^2 = x^2 - 2xy + y^2$.\nĐáp án: $x^2 - 2xy + y^2$",
    },
    {
        "id": "CLN-ALG-03",
        "category": "algebraic_identity",
        "has_error": False,
        "question": "Phân tích đa thức $x^2 - 5x + 6$ thành nhân tử.",
        "ai_reply": "Ta tách hạng tử: $x^2 - 5x + 6 = (x - 2)(x - 3)$.\nĐáp án: $(x - 2)(x - 3)$",
    },
    {
        "id": "CLN-ALG-04",
        "category": "algebraic_identity",
        "has_error": False,
        "question": "Rút gọn phân thức $\\frac{x^3 - 8}{x - 2}$ với $x \\neq 2$.",
        "ai_reply": "Áp dụng hiệu hai lập phương: $x^3 - 8 = (x - 2)(x^2 + 2x + 4)$.\nVới $x \\neq 2$, rút gọn được $x^2 + 2x + 4$.\nĐáp án: $x^2 + 2x + 4$",
    },
    {
        "id": "CLN-VIE-01",
        "category": "viete_quadratic",
        "has_error": False,
        "question": "Cho phương trình $2x^2 - 7x + 3 = 0$. Tính tổng hai nghiệm theo định lý Viète.",
        "ai_reply": "Theo định lý Viète, tổng hai nghiệm là $S = -\\frac{b}{a} = \\frac{7}{2} = 3.5$.\nĐáp án: $3.5$",
    },
    {
        "id": "CLN-VIE-02",
        "category": "viete_quadratic",
        "has_error": False,
        "question": "Cho phương trình $x^2 - 5x + 6 = 0$. Tính tích hai nghiệm theo định lý Viète.",
        "ai_reply": "Theo định lý Viète, tích hai nghiệm là $P = \\frac{c}{a} = 6$.\nĐáp án: $6$",
    },
    {
        "id": "CLN-VIE-03",
        "category": "viete_quadratic",
        "has_error": False,
        "question": "Viết công thức biệt thức $\\Delta$ của phương trình bậc hai $ax^2 + bx + c = 0$.",
        "ai_reply": "Biệt thức của phương trình bậc hai là $\\Delta = b^2 - 4ac$.\nĐáp án: $b^2 - 4ac$",
    },
    {
        "id": "CLN-ROOT-01",
        "category": "wrong_root_substitution",
        "has_error": False,
        "question": "Giải phương trình $x^2 - 5x + 6 = 0$.",
        "ai_reply": "Ta phân tích $(x-2)(x-3) = 0$, suy ra $x = 2$ hoặc $x = 3$.\nĐáp án: x = 3",
    },
    {
        "id": "CLN-ROOT-02",
        "category": "wrong_root_substitution",
        "has_error": False,
        "question": "Giải phương trình bậc nhất $2x + 3 = 13$.",
        "ai_reply": "Ta có $2x = 13 - 3 = 10$, suy ra $x = 5$.\nĐáp án: x = 5",
    },
    {
        "id": "CLN-ROOT-03",
        "category": "wrong_root_substitution",
        "has_error": False,
        "question": "Giải phương trình $x^2 - 4 = 0$.",
        "ai_reply": "Ta có $x^2 = 4$, suy ra $x = 2$ hoặc $x = -2$.\nĐáp án: x = 2",
    },
    {
        "id": "CLN-CALC-01",
        "category": "calculus_trig_formula",
        "has_error": False,
        "question": "Tìm đạo hàm của hàm số $y = \\sin(x)$.",
        "ai_reply": "Đạo hàm của hàm số $y = \\sin(x)$ trên $\\mathbb{R}$ là $y' = \\cos(x)$.\nĐáp án: $\\cos(x)$",
    },
    {
        "id": "CLN-CALC-02",
        "category": "calculus_trig_formula",
        "has_error": False,
        "question": "Tìm đạo hàm của hàm số $y = \\cos(x)$.",
        "ai_reply": "Đạo hàm của hàm số $y = \\cos(x)$ là $y' = -\\sin(x)$.\nĐáp án: $-\\sin(x)$",
    },
    {
        "id": "CLN-TRIG-01",
        "category": "calculus_trig_formula",
        "has_error": False,
        "question": "Rút gọn biểu thức lượng giác $\\sin^2 x + \\cos^2 x$.",
        "ai_reply": "Theo hằng đẳng thức lượng giác cơ bản, với mọi $x \\in \\mathbb{R}$ ta luôn có $\\sin^2 x + \\cos^2 x = 1$.\nĐáp án: $1$",
    },
    {
        "id": "CLN-TRIG-02",
        "category": "calculus_trig_formula",
        "has_error": False,
        "question": "Giải phương trình lượng giác $\\sin(x) = 2$ trên tập số thực.",
        "ai_reply": "Vì $-1 \\le \\sin(x) \\le 1$ với mọi $x \\in \\mathbb{R}$ mà $2 > 1$, nên phương trình đã cho vô nghiệm.\nĐáp án: Vô nghiệm",
    },
    {
        "id": "CLN-RAD-01",
        "category": "radical_log_misconception",
        "has_error": False,
        "question": "Tính giá trị của $\\sqrt{9 + 16}$.",
        "ai_reply": "Ta thực hiện phép cộng trong căn trước: $9 + 16 = 25$, suy ra $\\sqrt{25} = 5$.\nĐáp án: $5$",
    },
    {
        "id": "CLN-RAD-02",
        "category": "radical_log_misconception",
        "has_error": False,
        "question": "Tính giá trị của $E = \\sqrt{50} - \\sqrt{18} + \\sqrt{8}$.",
        "ai_reply": "Ta biến đổi: $\\sqrt{50} = 5\\sqrt{2}$, $\\sqrt{18} = 3\\sqrt{2}$, $\\sqrt{8} = 2\\sqrt{2}$.\nDo đó $E = (5 - 3 + 2)\\sqrt{2} = 4\\sqrt{2}$.\nĐáp án: $4\\sqrt{2}$",
    },
    {
        "id": "CLN-LOG-01",
        "category": "radical_log_misconception",
        "has_error": False,
        "question": "Tính $P = \\log_2(32) + \\log_3(81) - \\log_5(125)$.",
        "ai_reply": "Ta có $\\log_2(32) = 5$, $\\log_3(81) = 4$, $\\log_5(125) = 3$.\nVậy $5 + 4 - 3 = 6$.\nĐáp án: $6$",
    },
    {
        "id": "CLN-DOM-01",
        "category": "domain_sanity_violation",
        "has_error": False,
        "question": "Tìm tập xác định của hàm số $y = \\frac{1}{x - 2}$.",
        "ai_reply": "Hàm phân thức xác định khi mẫu số khác 0, tức là $x - 2 \\neq 0 \\Leftrightarrow x \\neq 2$.\nĐáp án: $D = \\mathbb{R} \\setminus \\{2\\}$",
    },
    {
        "id": "CLN-DOM-02",
        "category": "domain_sanity_violation",
        "has_error": False,
        "question": "Tìm điều kiện xác định của biểu thức $\\ln(x - 1)$.",
        "ai_reply": "Biểu thức logarit xác định khi biểu thức trong logarit dương: $x - 1 > 0 \\Leftrightarrow x > 1$.\nĐáp án: $x > 1$",
    },
    {
        "id": "CLN-DOM-03",
        "category": "domain_sanity_violation",
        "has_error": False,
        "question": "Cho tam giác vuông tại $A$ có $AB = 6, AC = 8$. Tính bán kính đường tròn ngoại tiếp $R$.",
        "ai_reply": "Theo định lý Pythagore: $BC = \\sqrt{6^2 + 8^2} = 10$. Bán kính đường tròn ngoại tiếp tam giác vuông bằng nửa cạnh huyền: $R = 10 / 2 = 5$.\nĐáp án: R = 5",
    },
    {
        "id": "CLN-DOM-04",
        "category": "domain_sanity_violation",
        "has_error": False,
        "question": "Gieo một con xúc xắc cân đối. Tính xác suất xuất hiện mặt 6 chấm.",
        "ai_reply": "Không gian mẫu có 6 kết quả đồng khả năng, có 1 kết quả thuận lợi nên xác suất là $P = \\frac{1}{6} \\approx 0.1667$.\nĐáp án: 1/6",
    },
    {
        "id": "CLN-GEO-01",
        "category": "geometry_arithmetic_error",
        "has_error": False,
        "question": "Tính thể tích khối chóp tứ giác đều có cạnh đáy $a = 6$ và chiều cao $h = 4$.",
        "ai_reply": "Diện tích đáy là $S = 6^2 = 36$. Thể tích khối chóp là $V = \\frac{1}{3} \\cdot 36 \\cdot 4 = 48$.\nĐáp án: 48",
    },
    {
        "id": "CLN-NUM-01",
        "category": "geometry_arithmetic_error",
        "has_error": False,
        "question": "Tính diện tích tam giác có đáy bằng 12 và chiều cao bằng 5.",
        "ai_reply": "Áp dụng công thức diện tích tam giác: (12 * 5) / 2 = 30.\nĐáp án: 30",
    },
    {
        "id": "CLN-MCQ-01",
        "category": "fabricated_mcq_contradiction",
        "has_error": False,
        "question": "Một vật có vận tốc $v(t) = -3(t-2)^2 + 9$. Tính $v(2.5)$. Các đáp án: A. 8.50 B. 7.75 C. 9.00 D. 8.79",
        "ai_reply": "Thay $t = 2.5$ vào hàm vận tốc: $v(2.5) = -3(0.5)^2 + 9 = 9 - 0.75 = 8.25$ (m/s). Lưu ý: Kết quả chính xác là 8.25, không khớp với đáp án nào trong 4 phương án A, B, C, D.\nĐáp án: 8.25",
    },
]


# ═══════════════════════════════════════════════════════════════════════════════
# LIVE ADVERSARIAL PROMPTS (BẪY KIẾN THỨC SAI TRỰC TIẾP TRÊN LLM)
# ═══════════════════════════════════════════════════════════════════════════════

LIVE_TRAP_PROMPTS: List[Dict[str, Any]] = [
    {
        "id": "LIVE-TRAP-01",
        "prompt": (
            "Một bạn học sinh giải bài: 'Khai triển $(x + 5)^2 = x^2 + 25$'. "
            "Hãy kiểm tra xem bạn ấy làm đúng hay sai, chỉ rõ lỗi kiến thức nếu có và viết kết quả đúng trong \\boxed{...}."
        ),
        "must_mention_any": ["2ab", "10x", "sai"],
        "gold_boxed": "x^2 + 10x + 25",
    },
    {
        "id": "LIVE-TRAP-02",
        "prompt": (
            "Một vật chuyển động có vận tốc $v(t) = -3(t - 2)^2 + 9$ (m/s). Tính vận tốc tại $t = 2.5$ giây. "
            "Các phương án: A. 8.50  B. 7.75  C. 9.00  D. 8.79. "
            "Không được tự bịa số cho khớp phương án nếu đề in sai; hãy ghi giá trị số chính xác cuối cùng trong \\boxed{...}."
        ),
        "must_mention_any": ["8.25", "33/4"],
        "gold_boxed": "8.25",
    },
    {
        "id": "LIVE-TRAP-03",
        "prompt": (
            "Một bạn viết: 'Vì $\\sin(x) = 1.5$ nên $x = \\arcsin(1.5)$'. "
            "Trên tập số thực $\\mathbb{R}$, nhận định này đúng hay sai? Giải thích ngắn gọn và ghi số nghiệm thực vào \\boxed{...}."
        ),
        "must_mention_any": ["sai", "vô nghiệm", "[-1, 1]", "-1"],
        "gold_boxed": "0",
    },
    {
        "id": "LIVE-TRAP-04",
        "prompt": (
            "Giải phương trình $\\frac{x^2 - 4}{x - 2} = 0$. "
            "Chú ý điều kiện xác định của mẫu số để không nhận nghiệm ngoại lai. Ghi nghiệm đúng vào \\boxed{...}."
        ),
        "must_mention_any": ["-2", "x \\neq 2", "x ≠ 2", "loại"],
        "gold_boxed": "-2",
    },
    {
        "id": "LIVE-TRAP-05",
        "prompt": (
            "Một học sinh tính thể tích khối chóp tứ giác đều cạnh đáy $a = 6$, chiều cao $h = 4$ theo công thức $V = a^2 \\cdot h = 144$. "
            "Hãy chỉ ra lỗi sai công thức và tính lại thể tích đúng trong \\boxed{...}."
        ),
        "must_mention_any": ["1/3", "\\frac{1}{3}", "48"],
        "gold_boxed": "48",
    },
    {
        "id": "LIVE-TRAP-06",
        "prompt": (
            "Cho phương trình $2x^2 - 7x + 3 = 0$. Một học sinh áp dụng định lý Viète viết $x_1 + x_2 = \\frac{b}{a} = -\\frac{7}{2}$. "
            "Học sinh đó sai ở đâu? Tính tổng $x_1 + x_2$ đúng và đặt trong \\boxed{...}."
        ),
        "must_mention_any": ["-b/a", "\\frac{7}{2}", "3.5", "dấu"],
        "gold_boxed": "7/2",
    },
]


async def evaluate_dataset(offline_only: bool = False) -> Dict[str, Any]:
    load_env()
    saved_keys = list(typesafe_guard.key_mgr.keys)
    # Chạy 48 ca chuẩn trên tầng Deterministic Reflex + SymPy + Knowledge Guard
    # (để không đốt hết quota 50 req/ngày của OpenRouter free tier), sau đó bật
    # full Remote Middleware + Live LLM cho 6 ca Live Adversarial Trap Probe.
    typesafe_guard.key_mgr.keys = []

    reports_dir = BACKEND_DIR / "reports"
    reports_dir.mkdir(parents=True, exist_ok=True)
    jsonl_path = reports_dir / "hallucination_eval.jsonl"
    if jsonl_path.exists():
        jsonl_path.unlink()

    tp = fp = tn = fn = 0
    healed_or_warned = 0
    by_category: Dict[str, Dict[str, int]] = {}
    records: List[Dict[str, Any]] = []

    print("=" * 72)
    print(f"🛡️  EVALUATING AI FALSE-KNOWLEDGE & HALLUCINATION GUARD ({len(HALLUCINATION_DATASET)} cases)")
    print("=" * 72)

    for item in HALLUCINATION_DATASET:
        cid = item["id"]
        cat = item["category"]
        has_error = bool(item["has_error"])
        q = item["question"]
        reply = item["ai_reply"]

        t0 = time.time()
        res = await typesafe_guard.guard_chat_response(reply, user_message=q, mode="solution")
        elapsed_ms = round((time.time() - t0) * 1000, 1)

        # Phát hiện lỗi khi is_safe == False hoặc có Calculation/Knowledge/Deterministic reflex
        deterministic_triggers = [
            r for r in res.reflexes_triggered
            if not r.startswith("TypeSafe SystemOne")
        ]
        flagged = (not res.is_safe) or bool(deterministic_triggers)

        by_category.setdefault(cat, {"total": 0, "correct": 0, "tp": 0, "tn": 0, "fp": 0, "fn": 0})
        by_category[cat]["total"] += 1

        if has_error and flagged:
            tp += 1
            by_category[cat]["correct"] += 1
            by_category[cat]["tp"] += 1
            verdict_str = "TP (Caught False Knowledge)"
            if res.sanitized_response != reply:
                healed_or_warned += 1
        elif has_error and not flagged:
            fn += 1
            by_category[cat]["fn"] += 1
            verdict_str = "FN (Missed Error)"
        elif (not has_error) and (not flagged):
            tn += 1
            by_category[cat]["correct"] += 1
            by_category[cat]["tn"] += 1
            verdict_str = "TN (Clean Verified)"
        else:
            fp += 1
            by_category[cat]["fp"] += 1
            verdict_str = "FP (False Alarm)"

        ok_case = (has_error == flagged)
        icon = "✅" if ok_case else "❌"
        print(f"{icon} [{cid:<11}] ({cat:<28}) -> {verdict_str:<27} | score={res.hallucination_score:.2f} | {elapsed_ms}ms")

        rec = {
            "id": cid,
            "category": cat,
            "has_error": has_error,
            "flagged": flagged,
            "correct_decision": ok_case,
            "hallucination_score": res.hallucination_score,
            "reflexes_triggered": res.reflexes_triggered,
            "sanitized_changed": (res.sanitized_response != reply),
            "latency_ms": elapsed_ms,
        }
        records.append(rec)
        append_jsonl(jsonl_path, rec)

    total = len(HALLUCINATION_DATASET)
    pos_total = tp + fn
    neg_total = tn + fp
    overall_correct = tp + tn

    recall = round(100.0 * tp / max(1, pos_total), 2)
    specificity = round(100.0 * tn / max(1, neg_total), 2)
    precision = round(100.0 * tp / max(1, tp + fp), 2)
    f1 = round(2 * precision * recall / max(1e-9, precision + recall), 2)
    accuracy = round(100.0 * overall_correct / max(1, total), 2)

    recall_ci = wilson_ci(tp, pos_total)
    spec_ci = wilson_ci(tn, neg_total)
    acc_ci = wilson_ci(overall_correct, total)

    # ── Live Adversarial Probe (nếu không chạy --offline-only) ────────────────
    live_results: List[Dict[str, Any]] = []
    if not offline_only:
        typesafe_guard.key_mgr.keys = saved_keys
        print("\n" + "=" * 72)
        print(f"🔬 RUNNING LIVE LLM ADVERSARIAL TRAP PROBE ({len(LIVE_TRAP_PROMPTS)} traps via Cerebras/Groq + TypeSafe Middleware)")
        print("=" * 72)
        live_providers = [
            ("cerebras", "qwen-3.8-27b", 1200),
            ("groq", "openai/gpt-oss-120b", 1200),
            ("cerebras", "gpt-oss-120b", 1200),
            ("groq", "qwen/qwen3.8-27b", 750),
        ]
        for idx_t, trap in enumerate(LIVE_TRAP_PROMPTS):
            tid = trap["id"]
            try:
                raw_out, meta = "", {}
                for shift in range(len(live_providers)):
                    prov, mod, mtok = live_providers[(idx_t + shift) % len(live_providers)]
                    try:
                        raw_out, meta = chat(
                            prov,
                            mod,
                            [
                                {"role": "system", "content": "Bạn là trợ giảng Toán học chính xác của DuoMath." + typesafe_guard.get_system_guard_prompt_contract("solution")},
                                {"role": "user", "content": trap["prompt"]},
                            ],
                            max_tokens=mtok,
                            temperature=0.0,
                            timeout=45.0,
                            retries=2,
                        )
                        if raw_out:
                            meta["model"] = f"{prov}:{mod}"
                            break
                    except Exception:
                        continue
                if not raw_out:
                    raise RuntimeError("No provider returned content")
                guard_res = await typesafe_guard.guard_chat_response(raw_out, user_message=trap["prompt"], mode="solution")
                low_out = guard_res.sanitized_response.lower()
                mentioned = any(k.lower() in low_out for k in trap["must_mention_any"])
                passed_trap = mentioned and guard_res.is_safe
                print(f"{'✅' if passed_trap else '⚠️'} [{tid}] passed={passed_trap} | guard_safe={guard_res.is_safe} | model={meta.get('model')} | latency={meta.get('latency_s')}s")
                live_results.append({
                    "id": tid,
                    "passed": passed_trap,
                    "guard_safe": guard_res.is_safe,
                    "hallucination_score": guard_res.hallucination_score,
                    "model": meta.get("model"),
                    "latency_s": meta.get("latency_s"),
                    "reply_excerpt": guard_res.sanitized_response[:350],
                })
            except Exception as exc:
                print(f"⚠️ [{tid}] skipped live call: {exc}")

    summary = {
        "evaluated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "total_cases": total,
        "positive_error_cases": pos_total,
        "negative_clean_cases": neg_total,
        "confusion_matrix": {"tp": tp, "fp": fp, "tn": tn, "fn": fn},
        "metrics": {
            "accuracy_pct": accuracy,
            "accuracy_wilson_95ci": list(acc_ci),
            "recall_sensitivity_pct": recall,
            "recall_wilson_95ci": list(recall_ci),
            "specificity_tnr_pct": specificity,
            "specificity_wilson_95ci": list(spec_ci),
            "precision_pct": precision,
            "f1_score": f1,
            "healed_or_warned_rate_pct": round(100.0 * healed_or_warned / max(1, pos_total), 2),
        },
        "by_category": by_category,
        "live_trap_probe": {
            "total": len(live_results),
            "passed": sum(1 for r in live_results if r.get("passed")),
            "results": live_results,
        },
    }

    summary_path = reports_dir / "hallucination_eval_summary.json"
    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")

    print("\n" + "=" * 72)
    print("📊 HALLUCINATION & FALSE-KNOWLEDGE BENCHMARK SUMMARY")
    print("=" * 72)
    print(f"Total Cases           : {total} ({pos_total} False-Knowledge + {neg_total} Clean)")
    print(f"Confusion Matrix      : TP={tp}, FP={fp}, TN={tn}, FN={fn}")
    print(f"Overall Accuracy      : {accuracy}% (95% Wilson CI: {acc_ci[0]}% – {acc_ci[1]}%)")
    print(f"Sensitivity (Recall)  : {recall}% (95% Wilson CI: {recall_ci[0]}% – {recall_ci[1]}%)")
    print(f"Specificity (TNR)     : {specificity}% (95% Wilson CI: {spec_ci[0]}% – {spec_ci[1]}%)")
    print(f"Precision / F1-Score  : Precision={precision}% | F1={f1}%")
    print(f"Auto-Heal / Warn Rate : {summary['metrics']['healed_or_warned_rate_pct']}% ({healed_or_warned}/{pos_total})")
    if live_results:
        live_pass = sum(1 for r in live_results if r.get("passed"))
        print(f"Live LLM Trap Probe   : {live_pass}/{len(live_results)} passed")
    print(f"Saved detailed logs to: {jsonl_path} & {summary_path}")
    print("=" * 72)
    return summary


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--offline-only", action="store_true", help="Chạy kiểm định cục bộ không gọi API ngoài")
    args = ap.parse_args()
    summary = asyncio.run(evaluate_dataset(offline_only=args.offline_only))
    return 0 if summary["metrics"]["f1_score"] >= 90.0 else 1


if __name__ == "__main__":
    sys.exit(main())
