"""
test_geometry_verification_gate.py
==================================
Tests for the pre-render QA verification gate and geometry image preprocessing
from D:\\duomath-geometry-rendering-plan.md.
"""

import sys
import os
import io

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from geometry_verification import verify_geometry_mathviz, GeometryVerifier
from image_preprocessing import preprocess_geometry_image
try:
    from PIL import Image, ImageDraw
    _PIL_OK = True
except ImportError:
    _PIL_OK = False


def test_verify_geometry_mathviz_passed():
    """Verify that a correctly constructed geometry block passes verification."""
    # Right triangle A(0, 3), B(4, 0), C(0, 0) -> Orthocenter is C(0, 0)
    viz = {
        "widget": "geometry_2d",
        "layers": [
            {
                "kind": "polygon",
                "points": [
                    {"id": "A", "x": 0.0, "y": 3.0},
                    {"id": "B", "x": 4.0, "y": 0.0},
                    {"id": "C", "x": 0.0, "y": 0.0},
                ]
            },
            {
                "kind": "points",
                "data": [
                    {"id": "H", "x": 0.0, "y": 0.0}
                ]
            }
        ],
        "constructions": [
            {"point": "H", "type": "orthocenter", "of": ["A", "B", "C"]}
        ]
    }

    result = verify_geometry_mathviz(viz)
    assert result["all_passed"] is True, f"Expected all_passed True, got: {result}"
    assert result["valid_count"] >= 1
    print("[PASS] test_verify_geometry_mathviz_passed")


def test_verify_geometry_mathviz_detects_false_claim():
    """Verify that an invalid construction is caught by the verification gate."""
    # Points A, B, C not collinear, but claimed collinear
    viz = {
        "widget": "geometry_2d",
        "layers": [
            {
                "kind": "polygon",
                "points": [
                    {"id": "A", "x": 0.0, "y": 3.0},
                    {"id": "B", "x": 4.0, "y": 0.0},
                    {"id": "C", "x": 0.0, "y": 0.0},
                ]
            }
        ],
        "relations": [
            {"type": "collinear", "entities": ["A", "B", "C"]}
        ]
    }

    result = verify_geometry_mathviz(viz)
    assert result["all_passed"] is False, "Expected false collinear claim to fail verification!"
    assert result["invalid_count"] == 1
    print("[PASS] test_verify_geometry_mathviz_detects_false_claim")


def test_verify_tangent_relation():
    """Verify tangent claim validation."""
    # Line y = 2 is tangent to circle centered at (0, 0) with radius 2
    points = {
        "P1": (-5.0, 2.0),
        "P2": (5.0, 2.0),
        "O": (0.0, 0.0)
    }
    claims = [
        {"kind": "tangent", "points": ["P1", "P2", "O"], "radius": 2.0}
    ]
    res = GeometryVerifier.verify_claims(points, claims)
    assert res["all_passed"] is True, f"Expected tangent to pass, got: {res}"
    print("[PASS] test_verify_tangent_relation")


def test_image_preprocessing_with_synthetic_geometry():
    """Verify preprocess_geometry_image processes an image and returns hints."""
    if _PIL_OK:
        img = Image.new("RGB", (400, 300), color="white")
        draw = ImageDraw.Draw(img)
        draw.line([(50, 50), (250, 50)], fill="black", width=2)
        draw.ellipse([(100, 100), (200, 200)], outline="black", width=2)
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        img_bytes = buf.getvalue()
    else:
        # Minimal 1x1 PNG bytes
        img_bytes = (
            b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01'
            b'\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05'
            b'\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
        )

    cleaned_bytes, hints = preprocess_geometry_image(img_bytes)
    assert isinstance(cleaned_bytes, bytes)
    assert len(cleaned_bytes) > 0
    assert "line_count_estimate" in hints
    assert "circle_count_estimate" in hints
    print(f"[PASS] test_image_preprocessing_with_synthetic_geometry: hints={hints}")


if __name__ == "__main__":
    test_verify_geometry_mathviz_passed()
    test_verify_geometry_mathviz_detects_false_claim()
    test_verify_tangent_relation()
    test_image_preprocessing_with_synthetic_geometry()
    print("\n>>> ALL GEOMETRY VERIFICATION GATE TESTS PASSED! <<<")
