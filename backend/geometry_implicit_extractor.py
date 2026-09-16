"""
geometry_implicit_extractor.py
==============================
Extracts geometric construction relationships directly from LLM reply text
(Vietnamese and English) using regular expressions and semantic patterns.

When the LLM outputs a complex geometry problem and explains points in text
(e.g., "Gọi H là trực tâm tam giác ABC", "D là chân đường cao hạ từ A xuống BC",
"M là trung điểm BC", "K là giao điểm của EF và BC"), but forgets to include
a "constructions" array in the mathviz JSON block, this module parses those
definitions and automatically populates the "constructions" array so
geometry_construction_solver can compute exact analytic coordinates.
"""

import re
import copy
import logging
from typing import Dict, Any, List, Optional, Set

from geometry_construction_solver import resolve_constructions

logger = logging.getLogger("geometry_implicit_extractor")


# Patterns for Vietnamese & English geometric descriptions
PATTERNS = [
    # Orthocenter: H là trực tâm tam giác ABC / orthocenter of triangle ABC
    {
        "type": "orthocenter",
        "regex": re.compile(
            r"(?:gọi\s+|let\s+)?([A-Z])\s+(?:là|is|be)\s+(?:trực tâm|orthocenter)(?:\s+của|\s+of)?(?:\s+(?:tam giác|tam\s+giác|triangle|△))?\s+([A-Z])([A-Z])([A-Z])",
            re.IGNORECASE
        ),
        "handler": lambda m: {"point": m.group(1).upper(), "type": "orthocenter", "of": [m.group(2).upper(), m.group(3).upper(), m.group(4).upper()]}
    },
    # Circumcenter: O là tâm ngoại tiếp tam giác ABC / circumcenter of triangle ABC
    {
        "type": "circumcenter",
        "regex": re.compile(
            r"(?:gọi\s+|let\s+)?([A-Z])\s+(?:là|is|be)\s+(?:tâm\s+(?:đường\s+tròn\s+)?ngoại\s+tiếp|circumcenter)(?:\s+của|\s+of)?(?:\s+(?:tam giác|triangle|△))?\s+([A-Z])([A-Z])([A-Z])",
            re.IGNORECASE
        ),
        "handler": lambda m: {"point": m.group(1).upper(), "type": "circumcenter", "of": [m.group(2).upper(), m.group(3).upper(), m.group(4).upper()]}
    },
    # Incenter: I là tâm nội tiếp tam giác ABC / incenter of triangle ABC
    {
        "type": "incenter",
        "regex": re.compile(
            r"(?:gọi\s+|let\s+)?([A-Z])\s+(?:là|is|be)\s+(?:tâm\s+(?:đường\s+tròn\s+)?nội\s+tiếp|incenter)(?:\s+của|\s+of)?(?:\s+(?:tam giác|triangle|△))?\s+([A-Z])([A-Z])([A-Z])",
            re.IGNORECASE
        ),
        "handler": lambda m: {"point": m.group(1).upper(), "type": "incenter", "of": [m.group(2).upper(), m.group(3).upper(), m.group(4).upper()]}
    },
    # Centroid: G là trọng tâm tam giác ABC / centroid of triangle ABC
    {
        "type": "centroid",
        "regex": re.compile(
            r"(?:gọi\s+|let\s+)?([A-Z])\s+(?:là|is|be)\s+(?:trọng\s+tâm|centroid)(?:\s+của|\s+of)?(?:\s+(?:tam giác|triangle|△))?\s+([A-Z])([A-Z])([A-Z])",
            re.IGNORECASE
        ),
        "handler": lambda m: {"point": m.group(1).upper(), "type": "centroid", "of": [m.group(2).upper(), m.group(3).upper(), m.group(4).upper()]}
    },
    # Nine-point center: N là tâm đường tròn Euler / 9 điểm của tam giác ABC
    {
        "type": "nine_point_center",
        "regex": re.compile(
            r"(?:gọi\s+|let\s+)?([A-Z])\s+(?:là|is|be)\s+tâm\s+(?:đường\s+tròn\s+)?(?:euler|9\s*điểm|nine-point)(?:\s+của|\s+of)?(?:\s+(?:tam giác|triangle|△))?\s+([A-Z])([A-Z])([A-Z])",
            re.IGNORECASE
        ),
        "handler": lambda m: {"point": m.group(1).upper(), "type": "nine_point_center", "of": [m.group(2).upper(), m.group(3).upper(), m.group(4).upper()]}
    },
    # Midpoint: M là trung điểm BC / M is midpoint of BC
    {
        "type": "midpoint",
        "regex": re.compile(
            r"(?:gọi\s+|let\s+)?([A-Z])\s+(?:là|is|be)\s+(?:trung\s+điểm|midpoint)(?:\s+của|\s+of)?(?:\s+(?:đoạn|đoạn\s+thẳng|cạnh|segment))?\s+([A-Z])([A-Z])",
            re.IGNORECASE
        ),
        "handler": lambda m: {"point": m.group(1).upper(), "type": "midpoint", "of": [m.group(2).upper(), m.group(3).upper()]}
    },
    # Foot of altitude: D là chân đường cao hạ/kẻ từ A xuống BC
    {
        "type": "foot",
        "regex": re.compile(
            r"(?:gọi\s+|let\s+)?([A-Z])\s+(?:là|is|be)\s+chân\s+(?:đường\s+)?(?:cao|vuông\s+góc)(?:\s+(?:hạ|kẻ))?\s+từ\s+([A-Z])(?:\s+(?:xuống|đến|lên))(?:\s+(?:cạnh|đường\s+thẳng))?\s+([A-Z])([A-Z])",
            re.IGNORECASE
        ),
        "handler": lambda m: {"point": m.group(1).upper(), "type": "foot", "of": [m.group(2).upper(), m.group(3).upper(), m.group(4).upper()]}
    },
    # Foot English: D is foot of altitude from A to BC
    {
        "type": "foot",
        "regex": re.compile(
            r"(?:let\s+)?([A-Z])\s+(?:is|be)\s+(?:the\s+)?foot\s+of\s+(?:the\s+)?altitude\s+from\s+([A-Z])\s+to\s+([A-Z])([A-Z])",
            re.IGNORECASE
        ),
        "handler": lambda m: {"point": m.group(1).upper(), "type": "foot", "of": [m.group(2).upper(), m.group(3).upper(), m.group(4).upper()]}
    },
    # Angle bisector foot: D là chân đường phân giác góc A của tam giác ABC
    {
        "type": "angle_bisector_foot",
        "regex": re.compile(
            r"(?:gọi\s+|let\s+)?([A-Z])\s+(?:là|is|be)\s+chân\s+(?:đường\s+)?phân\s+giác(?:\s+trong)?(?:\s+(?:hạ|kẻ))?\s+từ\s+([A-Z])(?:\s+của\s+(?:tam giác|triangle|△)\s+([A-Z])([A-Z])([A-Z])|\s+(?:xuống|lên)\s+(?:cạnh\s+)?([A-Z])([A-Z]))",
            re.IGNORECASE
        ),
        "handler": lambda m: {
            "point": m.group(1).upper(),
            "type": "angle_bisector_foot",
            "of": [
                m.group(2).upper(),
                (m.group(3) or m.group(6)).upper(),
                (m.group(4) or m.group(7)).upper()
            ]
        }
    },
    # Intersection: K là giao điểm của EF và BC / K is intersection of EF and BC
    {
        "type": "intersection",
        "regex": re.compile(
            r"(?:gọi\s+|let\s+)?([A-Z])\s+(?:là|is|be)\s+(?:giao\s+điểm|intersection)(?:\s+của|\s+giữa|\s+of)?\s+([A-Z])([A-Z])\s+(?:và|với|and|∩)\s+([A-Z])([A-Z])",
            re.IGNORECASE
        ),
        "handler": lambda m: {"point": m.group(1).upper(), "type": "intersection", "of": [m.group(2).upper(), m.group(3).upper(), m.group(4).upper(), m.group(5).upper()]}
    },
    # Line-line intersection: AC cắt BD tại E
    {
        "type": "intersection",
        "regex": re.compile(
            r"([A-Z])([A-Z])\s+(?:cắt|intersects?)\s+([A-Z])([A-Z])\s+tại\s+([A-Z])",
            re.IGNORECASE
        ),
        "handler": lambda m: {"point": m.group(5).upper(), "type": "intersection", "of": [m.group(1).upper(), m.group(2).upper(), m.group(3).upper(), m.group(4).upper()]}
    },
    # Foot perpendicular: Kẻ EH vuông góc với AB tại H / Kẻ EH ⊥ AB tại H
    {
        "type": "foot",
        "regex": re.compile(
            r"(?:kẻ|hạ|draw)?\s*([A-Z])([A-Z])\s+(?:vuông\s+góc\s+với|⊥)\s+([A-Z])([A-Z])\s+tại\s+([A-Z])",
            re.IGNORECASE
        ),
        "handler": lambda m: {
            "point": m.group(5).upper(),
            "type": "foot",
            "of": [
                (m.group(1) if m.group(1).upper() != m.group(5).upper() else m.group(2)).upper(),
                m.group(3).upper(),
                m.group(4).upper()
            ]
        }
    },
    # Point on arc: Trên cung nhỏ BC lấy D / Lấy D trên cung nhỏ BC
    {
        "type": "point_on_arc",
        "regex": re.compile(
            r"(?:trên\s+cung\s+(nhỏ|lớn)?\s*([A-Z])([A-Z])\s+lấy\s+([A-Z])|lấy\s+([A-Z])\s+trên\s+cung\s+(nhỏ|lớn)?\s*([A-Z])([A-Z]))",
            re.IGNORECASE
        ),
        "handler": lambda m: {
            "point": (m.group(4) or m.group(5)).upper(),
            "type": "point_on_arc",
            "of": ["O", (m.group(2) or m.group(7)).upper(), (m.group(3) or m.group(8)).upper()],
            "arc": "major" if (m.group(1) or m.group(6) or "").lower() == "lớn" else "minor",
            "t": 0.38
        }
    },
    # Circle line intersection: Tia DH cắt (O) tại (điểm thứ hai là)? F
    {
        "type": "circle_line_intersection",
        "regex": re.compile(
            r"(?:tia|đường\s+thẳng)?\s*([A-Z])([A-Z])\s+cắt\s+\((?:O|I)\)\s+tại(?:\s+điểm\s+thứ\s+(?:hai|2)\s+là)?\s+([A-Z])",
            re.IGNORECASE
        ),
        "handler": lambda m: {
            "point": m.group(3).upper(),
            "type": "circle_line_intersection",
            "of": ["O", "A", m.group(1).upper(), m.group(2).upper()]
        }
    },
]


def _collect_diagram_point_ids(viz_data: Dict[str, Any]) -> Set[str]:
    """
    Collects all unique point IDs declared in layers of the diagram.
    """
    pids = set()
    for lay in viz_data.get("layers", []) or []:
        kind = lay.get("kind")
        if kind in ("polygon", "triangle") and isinstance(lay.get("points"), list):
            for p in lay["points"]:
                if isinstance(p, dict) and p.get("id"):
                    pids.add(p["id"])
        elif kind == "points" and isinstance(lay.get("data"), list):
            for p in lay["data"]:
                if isinstance(p, dict) and p.get("id"):
                    pids.add(p["id"])
        elif kind in ("line", "segment"):
            for endpoint in (lay.get("from"), lay.get("to")):
                if isinstance(endpoint, dict) and endpoint.get("id"):
                    pids.add(endpoint["id"])
    return pids


def extract_implicit_constructions(reply_text: str, viz_block: Dict[str, Any]) -> Dict[str, Any]:
    """
    Scans reply_text for implicit geometric definitions and merges them into viz_block["constructions"].
    Then invokes resolve_constructions to compute exact analytic coordinates.
    """
    if not reply_text or not isinstance(viz_block, dict):
        return viz_block

    existing_constructions = list(viz_block.get("constructions") or [])
    existing_points = {c.get("point") for c in existing_constructions if isinstance(c, dict)}
    diagram_points = _collect_diagram_point_ids(viz_block)

    new_constructions = []
    
    for pat in PATTERNS:
        for match in pat["regex"].finditer(reply_text):
            try:
                c = pat["handler"](match)
                target_point = c["point"]
                # Only add if not already in constructions and target point is present or referenced in diagram
                if target_point not in existing_points:
                    # Verify dependency points exist
                    of_pts = c.get("of", [])
                    if all(p in diagram_points or any(nc["point"] == p for nc in new_constructions) for p in of_pts):
                        new_constructions.append(c)
                        existing_points.add(target_point)
            except Exception as e:
                logger.debug(f"[ImplicitExtractor] Failed to parse match {match.group(0)}: {e}")

    if not new_constructions:
        return viz_block

    data = copy.deepcopy(viz_block)
    combined = existing_constructions + new_constructions
    data["constructions"] = combined
    logger.info(f"[ImplicitExtractor] Injected {len(new_constructions)} implicit constructions: {[c['point'] for c in new_constructions]}")

    # Solve constructions with newly injected graph
    resolved_data, unsolved = resolve_constructions(data)
    return resolved_data
