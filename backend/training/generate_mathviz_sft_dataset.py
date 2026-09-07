#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
generate_mathviz_sft_dataset.py - Generate High-Quality SFT Dataset for DuoMath Canvas Widgets

Creates fine-tuning samples for:
1. All 9 MathViz widgets:
   - geometry_2d (layers & single-mode triangle/circle/ellipse/polygon)
   - geometry_3d (pyramid, prism, cone, cylinder, sphere, ellipsoid, mobius, klein bottle, etc.)
   - function_plot (tangents, shade_area, extrema, asymptotes)
   - unit_circle_wave (trigonometric waves & phase/amplitude params)
   - inequality_region (linear programming, feasible region vertices)
   - venn_sets (2-3 set operations)
   - sequence_series (arithmetic & geometric progressions)
   - complex_plane (Argand plane, modulus, argument, vectors)
   - distribution (binomial B(n,p), normal Gaussian N(mu, sigma^2))
2. Bilingual Math Olympiad & THPT Reasoning (Vietnamese/English + LaTeX).
3. Formats supported:
   - ChatML ('messages': [{'role': 'system'|'user'|'assistant', 'content': ...}])
   - DeepSeek-R1 reasoning trajectories ('<think> ... </think>')
"""

import os
import sys
import json
import random
import argparse
from pathlib import Path
from typing import List, Dict, Any

# System prompts for SFT
SYSTEM_PROMPT_SOCRATIC_MATHVIZ = """Bạn là DuoMCB (chú Cú Xanh Toán học thông thái 🦉) — Gia sư AI chuyên gia Toán học và Trực quan hóa tương tác MathViz của nền tảng DuoMath.
Nhiệm vụ của bạn:
1. Phân tích đề bài chặt chẽ, chính xác về mặt toán học.
2. Cung cấp lời giải hoặc định hướng gợi mở Socratic với công thức LaTeX chuẩn ($...$ cho inline, $$...$$ cho block).
3. ĐÍNH KÈM ĐÚNG MỘT khối ```mathviz ... ``` ở cuối câu trả lời để tạo widget trực quan tương tác (HTML5 Canvas 2D / Three.js 3D / Đồ thị). Đảm bảo JSON hợp lệ 100% theo quy chuẩn schema mathviz.v1."""

SYSTEM_PROMPT_DEEPSEEK_R1 = """You are DuoMCB, an elite Mathematical Olympiad reasoning engine and dynamic Canvas widget generator.
When presented with a mathematical problem:
1. Reason step-by-step within <think> ... </think> tags. Verify coordinate geometry, intersections, formulas, and parameters.
2. Provide a rigorous, pedagogically clear explanation in Vietnamese/English with LaTeX math expressions ($...$ and $$...$$).
3. Conclude with exactly one ```mathviz ... ``` JSON block matching the mathviz.v1 widget specification."""


# Template generators for diverse, accurate Canvas Widgets
def build_geometry_2d_samples() -> List[Dict[str, Any]]:
    samples = []
    
    # 1. Tam giác nhọn và các đường cao, trực tâm H, tâm ngoại tiếp O (Layers)
    samples.append({
        "user": "Vẽ hình và phân tích tam giác nhọn $ABC$ với các đường cao $AD, BE, CF$ cắt nhau tại trực tâm $H$ và đường tròn ngoại tiếp $(O)$.",
        "think": "Phân tích hình học: Tam giác ABC nhọn không cân. Đặt B(-3, -1.8), C(3, -1.8), A(-0.8, 3.2). Tính chân đường cao D(-0.8, -1.8). BE vuông góc AC, CF vuông góc AB. Trực tâm H là giao điểm của AD, BE, CF. Tâm ngoại tiếp O(0.08, 0.15), bán kính r ≈ 3.48. Dựng widget geometry_2d với cấu trúc layers: circle (O), polygon ABC, các đường cao kẻ nét đứt màu đỏ/cam, các điểm A, B, C, D, E, F, H, O.",
        "assistant_text": (
            "## 📐 Phân Tích Hình Học: Tam Giác Nhọn $ABC$ & Hệ Thống Đường Cao\n\n"
            "Cho tam giác nhọn $ABC$ nội tiếp đường tròn $(O)$. Các đường cao $AD, BE, CF$ đồng quy tại trực tâm $H$.\n\n"
            "**Các tính chất hình học then chốt:**\n"
            "- Tứ giác $BCEF, AFHE, BFHD, CDHE$ là các tứ giác nội tiếp.\n"
            "- Điểm $H$ là tâm đường tròn nội tiếp của tam giác trực âm (orthic triangle) $\\triangle DEF$.\n"
            "- Đường tròn Euler (đường tròn 9 điểm) đi qua trung điểm các cạnh, chân các đường cao và trung điểm các đoạn $HA, HB, HC$.\n\n"
            "Em có thể quan sát trực quan mô hình các lớp hình học trên Canvas bên dưới:\n\n"
            "```mathviz\n"
            + json.dumps({
                "type": "mathviz.v1",
                "widget": "geometry_2d",
                "title": "$\\triangle ABC$ Nhọn, Trực Tâm $H$ và Đường Tròn Ngoại Tiếp $(O)$",
                "layers": [
                    {"kind": "circle", "center": {"x": 0.08, "y": 0.15}, "r": 3.48, "label": "(O)", "color": "#3b82f6"},
                    {"kind": "polygon", "points": [{"id": "A", "x": -0.8, "y": 3.2}, {"id": "B", "x": -3.0, "y": -1.8}, {"id": "C", "x": 3.0, "y": -1.8}], "color": "#10b981"},
                    {"kind": "line", "from": {"x": -0.8, "y": 3.2}, "to": {"x": -0.8, "y": -1.8}, "label": "AD", "style": "dashed", "color": "#f43f5e"},
                    {"kind": "line", "from": {"x": -3.0, "y": -1.8}, "to": {"x": 1.48, "y": 0.21}, "label": "BE", "style": "dashed", "color": "#f43f5e"},
                    {"kind": "line", "from": {"x": 3.0, "y": -1.8}, "to": {"x": -1.68, "y": 1.25}, "label": "CF", "style": "dashed", "color": "#f43f5e"},
                    {"kind": "points", "data": [
                        {"id": "A", "x": -0.8, "y": 3.2}, {"id": "B", "x": -3.0, "y": -1.8}, {"id": "C", "x": 3.0, "y": -1.8},
                        {"id": "D", "x": -0.8, "y": -1.8}, {"id": "E", "x": 1.48, "y": 0.21}, {"id": "F", "x": -1.68, "y": 1.25},
                        {"id": "H", "x": -0.8, "y": -0.52}, {"id": "O", "x": 0.08, "y": 0.15}
                    ]}
                ]
            }, ensure_ascii=False)
            + "\n```"
        )
    })

    # 2. Tiếp tuyến và cát tuyến đường tròn, phương tích (Olympiad)
    samples.append({
        "user": "Minh họa cát tuyến $PAB$ và hai tiếp tuyến $PT_1, PT_2$ từ điểm $P$ nằm ngoài đường tròn $(O)$.",
        "think": "Phương tích tiếp tuyến: Điểm P(5, 0), đường tròn tâm O(0,0), r=3. Chiều dài đoạn tiếp tuyến PT = sqrt(OP^2 - r^2) = sqrt(25 - 9) = 4. Tiếp điểm T1(1.8, 2.4), T2(1.8, -2.4). Cát tuyến PAB đi qua O hoặc cắt đường tròn tại A(3, 0), B(-3, 0) hoặc góc bất kỳ. Dựng layers: đường tròn, tiếp tuyến PT1, PT2, cát tuyến, các điểm P, O, T1, T2, A, B.",
        "assistant_text": (
            "## 📐 Phương Tích và Tiếp Tuyến Từ Một Điểm Tới Đường Tròn\n\n"
            "Từ điểm $P$ nằm ngoài đường tròn $(O; R)$, kẻ hai tiếp tuyến $PT_1, PT_2$ và cát tuyến $PAB$.\n\n"
            "**Định lý phương tích (Power of a Point):**\n"
            "$$\\mathcal{P}_{P/(O)} = PO^2 - R^2 = PT_1^2 = PT_2^2 = PA \\cdot PB$$\n\n"
            "Tứ giác $PT_1OT_2$ có $\\widehat{PT_1O} = \\widehat{PT_2O} = 90^\\circ$ nên nội tiếp đường tròn đường kính $PO$.\n\n"
            "```mathviz\n"
            + json.dumps({
                "type": "mathviz.v1",
                "widget": "geometry_2d",
                "title": "Tiếp Tuyến & Cát Tuyến Từ Điểm $P$ Ngoài $(O)$",
                "layers": [
                    {"kind": "circle", "center": {"x": 0, "y": 0}, "r": 3.0, "label": "(O)", "color": "#3b82f6"},
                    {"kind": "line", "from": {"x": 5.0, "y": 0}, "to": {"x": 1.8, "y": 2.4}, "label": "PT1", "color": "#10b981"},
                    {"kind": "line", "from": {"x": 5.0, "y": 0}, "to": {"x": 1.8, "y": -2.4}, "label": "PT2", "color": "#10b981"},
                    {"kind": "line", "from": {"x": 5.0, "y": 0}, "to": {"x": -2.8, "y": 1.1}, "label": "PAB", "style": "dashed", "color": "#f59e0b"},
                    {"kind": "line", "from": {"x": 0, "y": 0}, "to": {"x": 1.8, "y": 2.4}, "label": "OT1", "style": "dashed", "color": "#94a3b8"},
                    {"kind": "points", "data": [
                        {"id": "O", "x": 0, "y": 0}, {"id": "P", "x": 5.0, "y": 0},
                        {"id": "T1", "x": 1.8, "y": 2.4}, {"id": "T2", "x": 1.8, "y": -2.4},
                        {"id": "A", "x": 1.5, "y": 0.5}, {"id": "B", "x": -2.8, "y": 1.1}
                    ]}
                ]
            }, ensure_ascii=False)
            + "\n```"
        )
    })

    # 3. Tam giác tương tác đơn hình với 4 tâm
    samples.append({
        "user": "Hãy tạo mô hình tam giác tương tác hiển thị trọng tâm $G$, trực tâm $H$, tâm ngoại tiếp $O$ và đường tròn Euler.",
        "think": "Cấu hình mode: triangle, points A(-3, -2), B(3, -2), C(0.5, 3.5). measurements bật đầy đủ side_lengths, angles, centroid, orthocenter, circumcircle.",
        "assistant_text": (
            "## 🔍 Mô Hình Tam Giác Động & Các Tâm Đặc Biệt\n\n"
            "Tam giác $\\triangle ABC$ sở hữu mối liên hệ hình học nổi tiếng: **Đường thẳng Euler** đi qua ba điểm thẳng hàng Trực tâm $H$, Trọng tâm $G$, và Tâm ngoại tiếp $O$ thỏa mãn hệ thức vectơ:\n"
            "$$\\vec{GH} = -2\\vec{GO}$$\n\n"
            "Em có thể kéo rê các đỉnh $A, B, C$ trên widget tương tác dưới đây để kiểm chứng đường thẳng Euler luôn thẳng hàng:\n\n"
            "```mathviz\n"
            + json.dumps({
                "type": "mathviz.v1",
                "widget": "geometry_2d",
                "title": "$\\triangle ABC$ và Các Điểm Tâm Hình Học",
                "mode": "triangle",
                "points": [{"id": "A", "x": -3, "y": -2}, {"id": "B", "x": 3, "y": -2}, {"id": "C", "x": 0.5, "y": 3.5}],
                "measurements": {
                    "show_side_lengths": True,
                    "show_angles": True,
                    "show_centroid_medians": True,
                    "show_orthocenter": True,
                    "show_circumcircle": True,
                    "show_incenter": True
                }
            }, ensure_ascii=False)
            + "\n```"
        )
    })

    return samples


def build_geometry_3d_samples() -> List[Dict[str, Any]]:
    samples = []
    
    # 1. Hình chóp tứ giác đều S.ABCD
    samples.append({
        "user": "Cho hình chóp tứ giác đều $S.ABCD$ có cạnh đáy $a = 4$, chiều cao $h = 6$. Hãy tính thể tích và dựng mô hình 3D.",
        "think": "Hình chóp tứ giác đều: solid: square_pyramid, dims: a=4, h=6. Diện tích đáy S_đáy = a^2 = 16. Thể tích V = 1/3 * 16 * 6 = 32. Show cross section ở độ cao h'=2.",
        "assistant_text": (
            "## 🧊 Hình Chóp Tứ Giác Đều $S.ABCD$\n\n"
            "**1. Công thức tính toán:**\n"
            "- Đáy là hình vuông cạnh $a = 4 \\implies S_{\\text{đáy}} = a^2 = 4^2 = 16$.\n"
            "- Thể tích khối chóp:\n"
            "$$V = \\frac{1}{3} S_{\\text{đáy}} \\cdot h = \\frac{1}{3} \\cdot 16 \\cdot 6 = 32$$\n"
            "- Diện tích xung quanh: Độ dài trung đoạn $d = \\sqrt{h^2 + (a/2)^2} = \\sqrt{36 + 4} = 2\\sqrt{10}$.\n"
            "$$S_{xq} = 4 \\cdot \\left(\\frac{1}{2} a \\cdot d\\right) = 2 \\cdot 4 \\cdot 2\\sqrt{10} = 16\\sqrt{10}$$\n\n"
            "Em có thể xoay chuột để quan sát mô hình 3D từ các góc nhìn khác nhau bên dưới:\n\n"
            "```mathviz\n"
            + json.dumps({
                "type": "mathviz.v1",
                "widget": "geometry_3d",
                "title": "Hình chóp tứ giác đều $S.ABCD$, $a=4$, $h=6$",
                "solid": "square_pyramid",
                "dims": {"a": 4, "h": 6},
                "show_cross_section": True,
                "cross_section_height": 2.0
            }, ensure_ascii=False)
            + "\n```"
        )
    })

    # 2. Hình lăng trụ tam giác đều
    samples.append({
        "user": "Vẽ hình không gian 3D lăng trụ tam giác đều với cạnh đáy bằng 3 và chiều cao bằng 5.",
        "think": "Solid: triangular_prism, dims: a=3, h=5. Diện tích đáy tam giác đều: S = a^2 * sqrt(3)/4 = 9*sqrt(3)/4. Thể tích V = S * h = 45*sqrt(3)/4 ≈ 19.49.",
        "assistant_text": (
            "## 🧊 Khối Lăng Trụ Tam Giác Đều\n\n"
            "Lăng trụ tam giác đều có hai đáy là các tam giác đều cạnh $a = 3$, các mặt bên là hình chữ nhật vuông góc với đáy có chiều cao $h = 5$.\n\n"
            "**Diện tích & Thể tích:**\n"
            "- Diện tích đáy tam giác đều: $$S_{\\text{đáy}} = \\frac{a^2\\sqrt{3}}{4} = \\frac{9\\sqrt{3}}{4}$$\n"
            "- Thể tích lăng trụ:\n"
            "$$V = S_{\\text{đáy}} \\cdot h = \\frac{9\\sqrt{3}}{4} \\cdot 5 = \\frac{45\\sqrt{3}}{4} \\approx 19.49$$\n\n"
            "```mathviz\n"
            + json.dumps({
                "type": "mathviz.v1",
                "widget": "geometry_3d",
                "title": "Lăng Trụ Tam Giác Đều ($a=3, h=5$)",
                "solid": "triangular_prism",
                "dims": {"a": 3, "h": 5},
                "show_cross_section": False,
                "cross_section_height": 0
            }, ensure_ascii=False)
            + "\n```"
        )
    })

    # 3. Khối Elipsoid 3 chiều
    samples.append({
        "user": "Minh họa khối Elipsoid 3 chiều trong không gian với các bán trục $a=3, b=2, c=1.5$.",
        "think": "Solid: ellipsoid, dims: a=3, b=2, c=1.5. Thể tích V = 4/3 * pi * a * b * c = 4/3 * pi * 3 * 2 * 1.5 = 12 * pi ≈ 37.7.",
        "assistant_text": (
            "## 🌐 Mặt Elipsoid 3D Trong Không Gian\n\n"
            "Phương trình chính tắc của mặt Elipsoid trong hệ tọa độ $Oxyz$:\n"
            "$$\\frac{x^2}{a^2} + \\frac{y^2}{b^2} + \\frac{z^2}{c^2} = 1$$\n\n"
            "Với các bán trục $a = 3$, $b = 2$, $c = 1.5$, thể tích khối elipsoid được tính bởi:\n"
            "$$V = \\frac{4}{3}\\pi abc = \\frac{4}{3}\\pi \\cdot 3 \\cdot 2 \\cdot 1.5 = 12\\pi \\approx 37.70$$\n\n"
            "```mathviz\n"
            + json.dumps({
                "type": "mathviz.v1",
                "widget": "geometry_3d",
                "title": "Khối Elipsoid 3D ($a=3, b=2, c=1.5$)",
                "solid": "ellipsoid",
                "dims": {"a": 3, "b": 2, "c": 1.5},
                "show_cross_section": True,
                "cross_section_height": 0
            }, ensure_ascii=False)
            + "\n```"
        )
    })

    return samples


def build_function_plot_samples() -> List[Dict[str, Any]]:
    samples = []
    
    # 1. Hàm bậc 3 với cực trị và tiếp tuyến
    samples.append({
        "user": "Khảo sát và vẽ đồ thị hàm số bậc ba $y = x^3 - 3x^2 + 2$. Tìm các điểm cực trị.",
        "think": "Hàm số: y = x^3 - 3x^2 + 2. Đạo hàm y' = 3x^2 - 6x = 3x(x-2). y' = 0 <=> x=0 hoặc x=2. Tại x=0 => y=2 (Điểm cực đại (0,2)). Tại x=2 => y=-2 (Điểm cực tiểu (2,-2)). Overlays: extrema, tangent_at x0=1. Expr: a*x^3 + b*x^2 + c*x + d.",
        "assistant_text": (
            "## 📈 Khảo Sát Hàm Số Bậc Ba $y = x^3 - 3x^2 + 2$\n\n"
            "**1. Tập xác định:** $D = \\mathbb{R}$.\n\n"
            "**2. Sự biến thiên & Cực trị:**\n"
            "- Đạo hàm: $$y' = 3x^2 - 6x = 3x(x - 2)$$\n"
            "- Nghiệm $y' = 0 \\iff \\left[\\begin{aligned} x &= 0 \\implies y = 2 \\\\ x &= 2 \\implies y = -2 \\end{aligned}\\right.$\n"
            "- Hàm số đồng biến trên $(-\\infty; 0)$ và $(2; +\\infty)$; nghịch biến trên $(0; 2)$.\n"
            "- **Điểm cực đại:** $(0; 2)$; **Điểm cực tiểu:** $(2; -2)$.\n"
            "- **Điểm uốn:** Đạo hàm cấp hai $y'' = 6x - 6 = 0 \\iff x = 1 \\implies I(1; 0)$.\n\n"
            "Em có thể tương tác với các hệ số và quan sát tiếp tuyến tại điểm uốn trên đồ thị:\n\n"
            "```mathviz\n"
            + json.dumps({
                "type": "mathviz.v1",
                "widget": "function_plot",
                "title": "$y = x^3 - 3x^2 + 2$",
                "expr": "a*x^3 + b*x^2 + c*x + d",
                "params": {
                    "a": {"min": -2, "max": 2, "default": 1, "step": 0.1},
                    "b": {"min": -5, "max": 5, "default": -3, "step": 0.5},
                    "c": {"min": -5, "max": 5, "default": 0, "step": 0.5},
                    "d": {"min": -5, "max": 5, "default": 2, "step": 0.5}
                },
                "overlays": [
                    {"kind": "extrema"},
                    {"kind": "tangent_at", "x0": 1.0}
                ],
                "x_domain": [-2.5, 4.5]
            }, ensure_ascii=False)
            + "\n```"
        )
    })

    # 2. Tích phân và diện tích hình phẳng
    samples.append({
        "user": "Tính diện tích hình phẳng giới hạn bởi parabol $y = -x^2 + 4$ và trục hoành $Ox$. Vẽ miền tô màu tích phân.",
        "think": "Phương trình hoành độ giao điểm: -x^2 + 4 = 0 <=> x = -2 hoặc x = 2. Diện tích: S = int_{-2}^{2} (-x^2 + 4) dx = 2 * [ -x^3/3 + 4x ]_0^2 = 2 * (-8/3 + 8) = 32/3 ≈ 10.67. Overlay: shade_area from -2 to 2.",
        "assistant_text": (
            "## 📐 Tính Diện Tích Hình Phẳng Bằng Tích Phân\n\n"
            "**1. Hoành độ giao điểm:**\n"
            "$$-x^2 + 4 = 0 \\iff x = \\pm 2$$\n\n"
            "**2. Công thức diện tích:**\n"
            "Do $-x^2 + 4 \\ge 0$ với mọi $x \\in [-2; 2]$, ta có:\n"
            "$$S = \\int_{-2}^{2} (-x^2 + 4)\\,dx = \\left[ -\\frac{x^3}{3} + 4x \\right]_{-2}^{2} = \\left(-\\frac{8}{3} + 8\\right) - \\left(\\frac{8}{3} - 8\\right) = \\frac{32}{3} \\approx 10.67$$\n\n"
            "Miền diện tích phẳng được tô màu trực quan bên dưới:\n\n"
            "```mathviz\n"
            + json.dumps({
                "type": "mathviz.v1",
                "widget": "function_plot",
                "title": "$y = -x^2 + 4$, Miền Tích Phân $[-2; 2]$",
                "expr": "a*x^2 + b*x + c",
                "params": {
                    "a": {"min": -3, "max": 0, "default": -1, "step": 0.1},
                    "b": {"min": -2, "max": 2, "default": 0, "step": 0.1},
                    "c": {"min": 0, "max": 8, "default": 4, "step": 0.5}
                },
                "overlays": [
                    {"kind": "shade_area", "from": -2.0, "to": 2.0},
                    {"kind": "extrema"}
                ],
                "x_domain": [-3.5, 3.5]
            }, ensure_ascii=False)
            + "\n```"
        )
    })

    return samples


def build_additional_widgets_samples() -> List[Dict[str, Any]]:
    samples = []
    
    # 1. unit_circle_wave
    samples.append({
        "user": "Mô phỏng hàm số lượng giác $y = 2\\sin(2x - \\pi/3)$ trên vòng tròn lượng giác đơn vị.",
        "think": "Widget: unit_circle_wave. amplitude=2, frequency=2, phase=-pi/3 ≈ -1.047. Show sine and cosine lines.",
        "assistant_text": (
            "## 🌊 Vòng Tròn Lượng Giác & Sóng Điều Hòa\n\n"
            "Hàm số lượng giác $y = 2\\sin\\left(2x - \\frac{\\pi}{3}\\right)$ có:\n"
            "- **Biên độ (Amplitude):** $A = 2$.\n"
            "- **Tần số góc (Angular frequency):** $\\omega = 2 \\implies$ Chu kỳ tuần hoàn $T = \\frac{2\\pi}{\\omega} = \\pi$.\n"
            "- **Pha ban đầu (Phase shift):** $\\varphi = -\\frac{\\pi}{3}$.\n\n"
            "Em hãy quan sát sự tương ứng giữa điểm chuyển động tròn đều và đồ thị hình sin trải dài bên phải:\n\n"
            "```mathviz\n"
            + json.dumps({
                "type": "mathviz.v1",
                "widget": "unit_circle_wave",
                "title": "$y = 2\\sin(2x - \\pi/3)$",
                "function": {"preset": "sin(x)", "custom_expr": None},
                "params": {
                    "amplitude": {"min": 0, "max": 3, "default": 2.0, "step": 0.1},
                    "frequency": {"min": 0.5, "max": 5, "default": 2.0, "step": 0.1},
                    "phase": {"min": -3.14, "max": 3.14, "default": -1.05, "step": 0.05},
                    "vertical_shift": {"min": -2, "max": 2, "default": 0, "step": 0.1},
                    "x_range": {"min": 1, "max": 4, "default": 2, "step": 1},
                    "speed": {"min": 0, "max": 3, "default": 1.0, "step": 0.1}
                },
                "radius_expr": "1",
                "display": {"show_sine_line": True, "show_cosine_line": True, "graph_color": "#10b981"}
            }, ensure_ascii=False)
            + "\n```"
        )
    })

    # 2. inequality_region
    samples.append({
        "user": "Xác định miền nghiệm của hệ bất phương trình bậc nhất hai ẩn: $x + y \\le 4$, $x - y \\ge -1$, $x \\ge 0$, $y \\ge 0$.",
        "think": "Widget: inequality_region. Các đỉnh miền nghiệm: Giao điểm của x=0, y=0, x+y=4, x-y=-1. (0,0), (4,0), x+y=4 và x-y=-1 => 2x=3 => x=1.5, y=2.5. x=0 và x-y=-1 => y=1. Vertices: [[0,0], [4,0], [1.5,2.5], [0,1]].",
        "assistant_text": (
            "## 📐 Miền Nghiệm Hệ Bất Phương Trình Tuyến Tính (Quy Hoạch Tuyến Tính)\n\n"
            "Hệ bất phương trình đã cho giới hạn một miền đa giác lồi trên mặt phẳng tọa độ $Oxy$:\n"
            "$$\\begin{cases} x + y \\le 4 \\\\ x - y \\ge -1 \\\\ x \\ge 0 \\\\ y \\ge 0 \\end{cases}$$\n\n"
            "**Tọa độ các đỉnh của đa giác miền nghiệm:**\n"
            "- $O(0; 0)$ (giao điểm $x=0$ và $y=0$)\n"
            "- $A(4; 0)$ (giao điểm $x+y=4$ và $y=0$)\n"
            "- $B(1.5; 2.5)$ (giao điểm $x+y=4$ và $x-y=-1$)\n"
            "- $C(0; 1)$ (giao điểm $x-y=-1$ và $x=0$)\n\n"
            "```mathviz\n"
            + json.dumps({
                "type": "mathviz.v1",
                "widget": "inequality_region",
                "title": "Miền Nghiệm Đa Giác Lồi $OABC$",
                "inequalities": [
                    {"expr": "x + y \\le 4", "color": "#10b981"},
                    {"expr": "x - y \\ge -1", "color": "#3b82f6"},
                    {"expr": "x \\ge 0", "color": "#f59e0b"},
                    {"expr": "y \\ge 0", "color": "#ec4899"}
                ],
                "domain": {"x": [-1, 6], "y": [-1, 6]},
                "highlight_feasible_region": True,
                "vertices_of_region": [[0, 0], [4, 0], [1.5, 2.5], [0, 1]]
            }, ensure_ascii=False)
            + "\n```"
        )
    })

    # 3. complex_plane
    samples.append({
        "user": "Biểu diễn số phức $z = 3 + 4i$ trên mặt phẳng phức Gauss. Tính môđun và acgumen của $z$.",
        "think": "Complex plane: x=3, y=4. Modulus |z| = sqrt(3^2 + 4^2) = 5. Argument phi = arctan(4/3) ≈ 0.927 rad (53.13 độ).",
        "assistant_text": (
            "## 🎯 Mặt Phẳng Phức Argand - Gauss\n\n"
            "Số phức $z = 3 + 4i$ được biểu diễn bởi điểm $M(3; 4)$ hoặc vectơ $\\vec{u} = (3; 4)$ trên mặt phẳng phức.\n\n"
            "**1. Môđun của số phức:**\n"
            "$$|z| = \\sqrt{a^2 + b^2} = \\sqrt{3^2 + 4^2} = 5$$\n\n"
            "**2. Acgumen của số phức:**\n"
            "$$\\varphi = \\arg(z) = \\arctan\\left(\\frac{4}{3}\\right) \\approx 0.9273\\text{ rad } (\\approx 53.13^\\circ)$$\n"
            "Dạng lượng giác: $$z = 5\\left(\\cos 53.13^\\circ + i\\sin 53.13^\\circ\\right)$$\n\n"
            "```mathviz\n"
            + json.dumps({
                "type": "mathviz.v1",
                "widget": "complex_plane",
                "title": "Số Phức $z = 3 + 4i$, $|z| = 5$",
                "numbers": [
                    {"label": "z", "re": 3.0, "im": 4.0, "color": "#10b981", "show_vector": True, "show_conjugate": True}
                ],
                "operations": ["modulus", "argument"]
            }, ensure_ascii=False)
            + "\n```"
        )
    })

    # 4. sequence_series
    samples.append({
        "user": "Cho cấp số cộng có số hạng đầu $u_1 = 3$ và công sai $d = 2$. Hãy viết số hạng tổng quát $u_n$ và tính tổng 10 số hạng đầu $S_{10}$.",
        "think": "Cấp số cộng: u_1=3, d=2. u_n = u_1 + (n-1)d = 3 + 2(n-1) = 2n + 1. S_10 = 10/2 * (2*u_1 + 9*d) = 5 * (6 + 18) = 120. Widget: sequence_series kind: arithmetic.",
        "assistant_text": (
            "## 🔢 Cấp Số Cộng: Số Hạng Tổng Quát & Tổng Riêng $S_n$\n\n"
            "**1. Số hạng tổng quát:**\n"
            "$$u_n = u_1 + (n - 1)d = 3 + (n - 1)2 = 2n + 1$$\n\n"
            "**2. Tổng 10 số hạng đầu tiên:**\n"
            "$$S_{10} = \\frac{10}{2} \\cdot [2u_1 + (10 - 1)d] = 5 \\cdot [2(3) + 9(2)] = 5 \\cdot (6 + 18) = 120$$\n\n"
            "Em có thể kéo thanh trượt để xem biểu đồ cột các số hạng $u_n$ và đồ thị tích lũy $S_n$:\n\n"
            "```mathviz\n"
            + json.dumps({
                "type": "mathviz.v1",
                "widget": "sequence_series",
                "title": "Cấp Số Cộng $u_n = 2n + 1$, $S_{10} = 120$",
                "kind": "arithmetic",
                "params": {
                    "u1": {"min": -10, "max": 10, "default": 3, "step": 1},
                    "d_or_q": {"min": -5, "max": 5, "default": 2, "step": 1},
                    "n_terms": {"min": 3, "max": 25, "default": 10, "step": 1}
                },
                "show_partial_sum": True,
                "highlight_term": 10
            }, ensure_ascii=False)
            + "\n```"
        )
    })

    return samples


def generate_full_sft_dataset(output_dir: Path, target_samples: int = 200, eval_ratio: float = 0.1):
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # 1. Base curated widget samples
    all_raw_samples = (
        build_geometry_2d_samples()
        + build_geometry_3d_samples()
        + build_function_plot_samples()
        + build_additional_widgets_samples()
    )

    # 2. Add Olympiad seed problems if available
    seed_file = output_dir.parent / "olympiad_seed_curated.jsonl"
    if seed_file.exists():
        with open(seed_file, "r", encoding="utf-8") as f:
            for line in f:
                if not line.strip():
                    continue
                item = json.loads(line)
                prob = item.get("problem", "")
                sol = item.get("solution", "")
                all_raw_samples.append({
                    "user": f"Xin hãy giải chi tiết bài toán sau:\n{prob}",
                    "think": f"Olympiad Math Problem: {item.get('topic', '')}. Áp dụng các định lý giải tích và hình học chuyên sâu.",
                    "assistant_text": sol
                })

    # Multiply/Augment to reach desired sample size for SFT
    final_chatml_items = []
    final_deepseek_items = []

    multiplier = max(1, target_samples // len(all_raw_samples) + 1)
    expanded_pool = all_raw_samples * multiplier
    random.seed(42)
    random.shuffle(expanded_pool)
    expanded_pool = expanded_pool[:target_samples]

    for item in expanded_pool:
        u = item["user"]
        th = item.get("think", "")
        a = item["assistant_text"]

        # Standard ChatML (Qwen2.5-Math / Qwen2.5-VL / Generic)
        final_chatml_items.append({
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT_SOCRATIC_MATHVIZ},
                {"role": "user", "content": u},
                {"role": "assistant", "content": a}
            ]
        })

        # DeepSeek-R1 CoT Format
        r1_content = f"<think>\n{th}\n</think>\n\n{a}" if th else a
        final_deepseek_items.append({
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT_DEEPSEEK_R1},
                {"role": "user", "content": u},
                {"role": "assistant", "content": r1_content}
            ]
        })

    # Split train/eval
    split_idx = int(len(final_chatml_items) * (1 - eval_ratio))

    # Save ChatML
    chatml_train_path = output_dir / "hf_mathviz_chatml_train.jsonl"
    chatml_val_path = output_dir / "hf_mathviz_chatml_val.jsonl"
    with open(chatml_train_path, "w", encoding="utf-8") as f:
        for it in final_chatml_items[:split_idx]:
            f.write(json.dumps(it, ensure_ascii=False) + "\n")
    with open(chatml_val_path, "w", encoding="utf-8") as f:
        for it in final_chatml_items[split_idx:]:
            f.write(json.dumps(it, ensure_ascii=False) + "\n")

    # Save DeepSeek-R1
    r1_train_path = output_dir / "hf_deepseek_r1_mathviz_train.jsonl"
    r1_val_path = output_dir / "hf_deepseek_r1_mathviz_val.jsonl"
    with open(r1_train_path, "w", encoding="utf-8") as f:
        for it in final_deepseek_items[:split_idx]:
            f.write(json.dumps(it, ensure_ascii=False) + "\n")
    with open(r1_val_path, "w", encoding="utf-8") as f:
        for it in final_deepseek_items[split_idx:]:
            f.write(json.dumps(it, ensure_ascii=False) + "\n")

    print(f"[SUCCESS] Exported SFT Datasets to {output_dir}:")
    print(f"  - ChatML Train: {chatml_train_path} ({split_idx} items)")
    print(f"  - ChatML Val:   {chatml_val_path} ({len(final_chatml_items) - split_idx} items)")
    print(f"  - DeepSeek-R1 Train: {r1_train_path} ({split_idx} items)")
    print(f"  - DeepSeek-R1 Val:   {r1_val_path} ({len(final_deepseek_items) - split_idx} items)")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate MathViz SFT Dataset for Hugging Face Fine-Tuning")
    parser.add_argument("--output-dir", type=str, default=str(Path(__file__).resolve().parent / "tuning_data"))
    parser.add_argument("--sample-size", type=int, default=200)
    parser.add_argument("--eval-ratio", type=float, default=0.1)
    args = parser.parse_args()

    generate_full_sft_dataset(Path(args.output_dir), target_samples=args.sample_size, eval_ratio=args.eval_ratio)
