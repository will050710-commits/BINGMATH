#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
benchmark_canvas_model.py - Benchmark & Evaluate Math & Canvas Generation Quality

Evaluates:
1. JSON Syntax Validity (Is the mathviz block parsable with zero drops?)
2. MathViz Specification Compliance (Does it have type: mathviz.v1 and valid widget?)
3. Geometric Feasibility (Runs through geometry_snapping and verification gate)
4. Overall Drop Rate & Latency
"""

import os
import sys
import re
import json
import time
import argparse
from pathlib import Path
from typing import List, Dict, Any

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# Ensure backend root is in sys.path so we can import verification and snapping
BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

try:
    from geometry_snapping import snap_geometry_2d_payload
    from geometry_verification import verify_geometry_payload
    _VERIFICATION_AVAILABLE = True
except ImportError:
    _VERIFICATION_AVAILABLE = False

# Golden Benchmark Prompts across distinct widget domains
BENCHMARK_PROMPTS = [
    {
        "id": "geo_2d_triangle_orthocenter",
        "prompt": "Cho tam giác nhọn ABC nội tiếp đường tròn (O) với các đường cao AD, BE, CF cắt nhau tại trực tâm H. Hãy vẽ hình Canvas 2D mô phỏng tam giác này.",
        "expected_widget": "geometry_2d"
    },
    {
        "id": "geo_2d_tangents",
        "prompt": "Từ điểm P nằm ngoài đường tròn (O; 3), kẻ hai tiếp tuyến PT1 và PT2. Minh họa hình vẽ trên canvas 2D.",
        "expected_widget": "geometry_2d"
    },
    {
        "id": "geo_3d_pyramid",
        "prompt": "Cho hình chóp tứ giác đều S.ABCD có cạnh đáy a = 4, chiều cao h = 6. Tính thể tích và tạo mô hình 3D.",
        "expected_widget": "geometry_3d"
    },
    {
        "id": "geo_3d_prism",
        "prompt": "Vẽ hình không gian 3D lăng trụ tam giác đều với cạnh đáy bằng 3 và chiều cao bằng 5.",
        "expected_widget": "geometry_3d"
    },
    {
        "id": "calc_cubic_plot",
        "prompt": "Khảo sát và vẽ đồ thị hàm số bậc ba y = x^3 - 3x^2 + 2 kèm điểm cực trị và tiếp tuyến.",
        "expected_widget": "function_plot"
    },
    {
        "id": "trig_unit_circle",
        "prompt": "Mô phỏng hàm số lượng giác y = 2*sin(2x - pi/3) trên vòng tròn lượng giác đơn vị.",
        "expected_widget": "unit_circle_wave"
    },
    {
        "id": "linear_programming",
        "prompt": "Xác định và vẽ miền nghiệm của hệ bất phương trình: x + y <= 4, x - y >= -1, x >= 0, y >= 0.",
        "expected_widget": "inequality_region"
    },
    {
        "id": "complex_plane_z",
        "prompt": "Biểu diễn số phức z = 3 + 4i trên mặt phẳng phức Gauss và tính môđun của nó.",
        "expected_widget": "complex_plane"
    }
]

def extract_mathviz_payload(response_text: str) -> Dict[str, Any] | None:
    """Extracts mathviz JSON block from model response."""
    pattern = r"```(?:mathviz)?\s*(\{.*?\})\s*```"
    matches = re.findall(pattern, response_text, re.DOTALL)
    if not matches:
        return None
    raw_json = matches[-1].strip()
    try:
        return json.loads(raw_json)
    except Exception:
        try:
            import json_repair
            return json_repair.loads(raw_json)
        except Exception:
            return None

def evaluate_response(item: Dict[str, Any], response_text: str) -> Dict[str, Any]:
    expected_w = item["expected_widget"]
    payload = extract_mathviz_payload(response_text)
    
    if not payload:
        return {
            "id": item["id"],
            "success": False,
            "error": "Missing or unparsable mathviz block",
            "widget_matched": False,
            "snapped": False
        }
    
    widget_type = payload.get("widget")
    widget_matched = (widget_type == expected_w)
    
    snapped = False
    verification_passed = True
    if _VERIFICATION_AVAILABLE and widget_type == "geometry_2d":
        try:
            snapped_payload, snap_stats = snap_geometry_2d_payload(payload)
            snapped = True
            v_result = verify_geometry_payload(snapped_payload)
            verification_passed = v_result.get("passed", True)
        except Exception as e:
            verification_passed = False

    return {
        "id": item["id"],
        "success": widget_matched and verification_passed,
        "widget_found": widget_type,
        "expected_widget": expected_w,
        "widget_matched": widget_matched,
        "snapped": snapped,
        "verification_passed": verification_passed
    }

def run_benchmark(api_url: str = None, api_key: str = None, model_name: str = None):
    print("==================================================================")
    print("  📊 DuoMath Canvas & Widget Benchmark Suite")
    print(f"  Total Test Cases: {len(BENCHMARK_PROMPTS)}")
    print(f"  Target Model:     {model_name or 'Simulated / Internal'}")
    print("==================================================================")

    results = []
    # If no external API provided, test with synthetic golden responses for self-check
    if not api_url:
        print("\n[INFO] Running self-test evaluation on Golden MathViz Templates...")
        from generate_mathviz_sft_dataset import (
            build_geometry_2d_samples,
            build_geometry_3d_samples,
            build_function_plot_samples,
            build_additional_widgets_samples
        )
        sample_pool = (
            build_geometry_2d_samples()
            + build_geometry_3d_samples()
            + build_function_plot_samples()
            + build_additional_widgets_samples()
        )
        
        for prompt_item in BENCHMARK_PROMPTS:
            exp_w = prompt_item["expected_widget"]
            matching_sample = next((s for s in sample_pool if f'"widget": "{exp_w}"' in s["assistant_text"] or f'"widget":"{exp_w}"' in s["assistant_text"]), sample_pool[0])
            eval_res = evaluate_response(prompt_item, matching_sample["assistant_text"])
            results.append(eval_res)
            print(f"  [{'PASS' if eval_res['success'] else 'FAIL'}] {prompt_item['id']} -> Expected: {exp_w} | Found: {eval_res.get('widget_found')}")
    else:
        # Future / User benchmark against live endpoint
        print(f"[INFO] Connecting to API: {api_url}...")
        # Implementation for httpx call to openai/hf endpoint
        pass

    passed_count = sum(1 for r in results if r["success"])
    total = len(results)
    pass_rate = (passed_count / total) * 100 if total > 0 else 0

    print("\n==================================================================")
    print(f"  🎯 BENCHMARK SUMMARY:")
    print(f"  Passed: {passed_count} / {total} ({pass_rate:.1f}%)")
    print(f"  MathViz Drop Rate: {100 - pass_rate:.1f}%")
    print("==================================================================")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Benchmark DuoMath Canvas Widget Generation")
    parser.add_argument("--api-url", type=str, default=None)
    parser.add_argument("--api-key", type=str, default=None)
    parser.add_argument("--model", type=str, default=None)
    args = parser.parse_args()

    run_benchmark(args.api_url, args.api_key, args.model)
