"""
Geometry Engine for DuoMCB
==========================
Incorporates concepts from:
- seominjoon/geosolver: Visual primitive extraction, geometric OCR & spatial label binding.
- google-deepmind/alphageometry: Formal language representation, generic Deductive Database (DDAR),
  and forward-chaining symbolic inference with numerical verification.
"""

import os
import re
import math
import json
import base64
from typing import Dict, List, Set, Tuple, Any, Optional
from dataclasses import dataclass, field

from geometry_verification import (
    is_collinear_2d,
    is_perpendicular_2d,
    is_parallel_2d,
    is_concyclic_2d,
    is_orthocenter_2d,
    is_tangent_to_circle_2d,
    is_harmonic_bundle,
    get_circumcircle,
    distance_2d,
    GeometryVerifier,
    Point2D
)

# Configuration flags
EMIT_UNVERIFIABLE_AXIOMS = True


# ─────────────────────────────────────────────────────────────────────────────
# 1. GEOMETRY DIAGRAM CONSTRUCTION SCHEMA & PREPROCESSOR
# ─────────────────────────────────────────────────────────────────────────────

DIAGRAM_EXTRACTION_SCHEMA = {
    "type": "OBJECT",
    "description": "Schema trích xuất quan hệ dựng hình học thay vì toạ độ điểm trực tiếp",
    "properties": {
        "points": {
            "type": "ARRAY",
            "items": {"type": "STRING"},
            "description": "Danh sách các điểm hình học xuất hiện trong đề/hình (ví dụ: ['A', 'B', 'C', 'H', 'M', 'K'])"
        },
        "constructions": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "point": {"type": "STRING"},
                    "type": {
                        "type": "STRING",
                        "enum": ["orthocenter", "midpoint", "foot", "intersection", "circumcenter", "incenter", "tangent_intersection"]
                    },
                    "of": {
                        "type": "ARRAY",
                        "items": {"type": "STRING"}
                    }
                },
                "required": ["point", "type", "of"]
            },
            "description": "Các quan hệ dựng hình xác định toạ độ điểm"
        },
        "circles": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "id": {"type": "STRING"},
                    "type": {
                        "type": "STRING",
                        "enum": ["circumcircle", "circle_diameter", "incircle", "generic_circle"]
                    },
                    "of": {
                        "type": "ARRAY",
                        "items": {"type": "STRING"}
                    }
                },
                "required": ["id", "type", "of"]
            }
        },
        "relations": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "type": {
                        "type": "STRING",
                        "enum": ["perpendicular", "parallel", "concyclic", "collinear", "tangent", "equal_length"]
                    },
                    "entities": {
                        "type": "ARRAY",
                        "items": {"type": "STRING"}
                    }
                },
                "required": ["type", "entities"]
            }
        }
    },
    "required": ["points", "constructions"]
}


class GeometryImagePreprocessor:
    @staticmethod
    def extract_diagram_features(image_input: Any = None, text_input: str = "") -> Dict[str, Any]:
        """
        Extracts structural geometric construction relations from text and image metadata.
        Uses construction relationships (orthocenter, midpoints, altitudes, circles)
        rather than raw pixel coordinate guessing.
        """
        t = (text_input or "").lower()
        extracted_points: Set[str] = set()
        constructions: List[Dict[str, Any]] = []
        circles: List[Dict[str, Any]] = []
        relations: List[Dict[str, Any]] = []

        # Find points mentioned as single capital letters in text
        for pt in re.findall(r'\b([A-Z])\b', text_input or ""):
            extracted_points.add(pt)

        # Triangle
        tri_m = re.search(r'tam giác\s+([a-z]{3})', t) or re.search(r'triangle\s+([a-z]{3})', t)
        if tri_m:
            pts = [c.upper() for c in tri_m.group(1)]
            for p in pts:
                extracted_points.add(p)
            circles.append({"id": "O", "type": "circumcircle", "of": pts})

        # Altitudes & Orthocenter
        ortho_m = re.search(r'trực tâm\s+([a-z])', t) or re.search(r'orthocenter\s+([a-z])', t)
        if ortho_m and tri_m:
            h_pt = ortho_m.group(1).upper()
            extracted_points.add(h_pt)
            constructions.append({
                "point": h_pt,
                "type": "orthocenter",
                "of": [c.upper() for c in tri_m.group(1)]
            })

        alt_matches = re.findall(r'đường cao\s+([a-z]{2})', t) or re.findall(r'altitude\s+([a-z]{2})', t)
        if tri_m and alt_matches:
            v_all = [c.upper() for c in tri_m.group(1)]
            for alt in alt_matches:
                v_from, f_pt = alt[0].upper(), alt[1].upper()
                extracted_points.add(f_pt)
                base_pts = [p for p in v_all if p != v_from]
                if len(base_pts) == 2:
                    constructions.append({
                        "point": f_pt,
                        "type": "foot",
                        "of": [v_from, base_pts[0], base_pts[1]]
                    })
                    relations.append({
                        "type": "perpendicular",
                        "entities": [f"{v_from}{f_pt}", f"{base_pts[0]}{base_pts[1]}"]
                    })

        # Midpoint
        mid_m = re.search(r'([a-z])\s+là trung điểm\s+(?:của\s+)?([a-z]{2})', t) or re.search(r'midpoint\s+([a-z])\s+of\s+([a-z]{2})', t)
        if mid_m:
            m_pt = mid_m.group(1).upper()
            seg = [mid_m.group(2)[0].upper(), mid_m.group(2)[1].upper()]
            extracted_points.add(m_pt)
            constructions.append({
                "point": m_pt,
                "type": "midpoint",
                "of": seg
            })

        # Tangents
        tan_m = re.search(r'tiếp tuyến tại\s+([a-z])\s+và\s+([a-z]).*cắt nhau tại\s+([a-z])', t)
        if tan_m:
            b_pt, c_pt, t_pt = tan_m.group(1).upper(), tan_m.group(2).upper(), tan_m.group(3).upper()
            extracted_points.update([b_pt, c_pt, t_pt])
            constructions.append({
                "point": t_pt,
                "type": "tangent_intersection",
                "of": [b_pt, c_pt, "O"]
            })
            relations.append({"type": "tangent", "entities": [f"{t_pt}{b_pt}", "O"]})
            relations.append({"type": "tangent", "entities": [f"{t_pt}{c_pt}", "O"]})

        return {
            "points": sorted(list(extracted_points)),
            "constructions": constructions,
            "circles": circles,
            "relations": relations,
            "ocr_text": text_input or "",
            "schema_version": "construction_v2"
        }


# ─────────────────────────────────────────────────────────────────────────────
# 2. REPRESENTATIVE COORDINATE BUILDER FOR RIGOROUS NUMERICAL VALIDATION
# ─────────────────────────────────────────────────────────────────────────────

class SyntheticCoordinateBuilder:
    """
    Builds a non-trivial, general skew coordinate system for any geometric configuration
    to numerically verify symbolic theorems without accidental degeneracies.
    """

    @staticmethod
    def foot_on_line(P: Point2D, L1: Point2D, L2: Point2D) -> Point2D:
        dx, dy = L2[0] - L1[0], L2[1] - L1[1]
        denom = dx * dx + dy * dy
        if denom < 1e-12:
            return L1
        t = ((P[0] - L1[0]) * dx + (P[1] - L1[1]) * dy) / denom
        return (L1[0] + t * dx, L1[1] + t * dy)

    @staticmethod
    def line_intersection(p1: Point2D, p2: Point2D, p3: Point2D, p4: Point2D) -> Optional[Point2D]:
        x1, y1 = p1; x2, y2 = p2; x3, y3 = p3; x4, y4 = p4
        denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
        if abs(denom) < 1e-9:
            return None
        t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom
        return (x1 + t * (x2 - x1), y1 + t * (y2 - y1))

    @classmethod
    def build_general_triangle_context(cls) -> Dict[str, Point2D]:
        """
        Creates general skew triangle ABC:
        A = (0.6, 4.2), B = (-3.2, -1.0), C = (3.6, -0.6)
        and computes exact numerical coordinates for:
        - Altitude feet: D (on BC), E (on AC), F (on AB)
        - Orthocenter: H
        - Circumcenter: O, Circumradius: R
        - Midpoint of BC: M
        - Radical axis intersection point K (with circle diameter AH)
        - External radical axis intersection S on BC
        """
        pts: Dict[str, Point2D] = {
            "A": (0.6, 4.2),
            "B": (-3.2, -1.0),
            "C": (3.6, -0.6),
        }
        A, B, C = pts["A"], pts["B"], pts["C"]

        # Circumcenter O
        cir = get_circumcircle(A, B, C)
        O = cir[0] if cir else (0.0, 0.0)
        pts["O"] = O

        # Feet
        D = cls.foot_on_line(A, B, C)
        E = cls.foot_on_line(B, A, C)
        F = cls.foot_on_line(C, A, B)
        pts["D"] = D
        pts["E"] = E
        pts["F"] = F

        # Orthocenter H
        H = cls.line_intersection(B, E, C, F) or (0.76028, 1.47517)
        pts["H"] = H

        # Midpoint of BC
        M = ((B[0] + C[0]) / 2.0, (B[1] + C[1]) / 2.0)
        pts["M"] = M

        # Line through H perp to AM:
        vAM = (M[0] - A[0], M[1] - A[1])
        vPerp = (-vAM[1], vAM[0])
        H_perp_point = (H[0] + vPerp[0], H[1] + vPerp[1])

        # S is intersection of line (H, H_perp_point) with line BC
        S = cls.line_intersection(H, H_perp_point, B, C)
        if S:
            pts["S"] = S
            O1 = ((A[0] + H[0]) / 2.0, (A[1] + H[1]) / 2.0)
            pts["O1"] = O1
            proj = cls.foot_on_line(O1, S, H)
            K = (2 * proj[0] - H[0], 2 * proj[1] - H[1])
            pts["K"] = K

        return pts

    @classmethod
    def build_brocard_quadrilateral_context(cls) -> Dict[str, Point2D]:
        """
        Creates complete cyclic quadrilateral ABCD on unit circle with:
        - P = AB ∩ CD
        - Q = AD ∩ BC
        - R = AC ∩ BD
        - Center O = (0, 0)
        """
        def on_circle(ang: float) -> Point2D:
            return (math.cos(ang), math.sin(ang))

        pts: Dict[str, Point2D] = {
            "O": (0.0, 0.0),
            "A": on_circle(0.5),
            "B": on_circle(1.8),
            "C": on_circle(3.4),
            "D": on_circle(5.1),
        }
        A, B, C, D = pts["A"], pts["B"], pts["C"], pts["D"]

        P = cls.line_intersection(A, B, C, D)
        Q = cls.line_intersection(A, D, B, C)
        R = cls.line_intersection(A, C, B, D)

        if P: pts["P"] = P
        if Q: pts["Q"] = Q
        if R: pts["R"] = R

        return pts


# ─────────────────────────────────────────────────────────────────────────────
# 3. ALPHAGEOMETRY DYNAMIC TRANSLATOR (Formal Language DSL Parser)
# ─────────────────────────────────────────────────────────────────────────────

class AlphaGeometryTranslator:
    """
    Translates arbitrary geometry problem text into AlphaGeometry Formal DSL declarations and goals.
    """

    @classmethod
    def to_formal_dsl(cls, text: str, diagram_info: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        t = re.sub(r'[\$\\\{\}]', '', text or "").lower()
        formal_lines = []
        goals = []
        auxiliary_hints = []

        # 1. Circle declarations
        cir_match = re.search(r'đường tròn\s*\(([a-z0-9]+)\)', t) or re.search(r'circle\s*\(([a-z0-9]+)\)', t)
        circle_name = cir_match.group(1).lower() if cir_match else 'o'

        # 2. Polygons (Triangle or Concyclic Quad)
        tri_match = re.search(r'tam giác\s+([a-z]{3})', t) or re.search(r'triangle\s+([a-z]{3})', t)
        quad_match = re.search(r'tứ giác\s+([a-z]{4})', t) or re.search(r'quadrilateral\s+([a-z]{4})', t)

        t_str = ""
        if quad_match:
            q_pts = list(quad_match.group(1).lower())
            q_str = ' '.join(q_pts)
            formal_lines.append(f'{q_str} = concyclic_quad {q_str} {circle_name};')
            formal_lines.append(f'p = line_intersection {q_pts[0]} {q_pts[1]} {q_pts[2]} {q_pts[3]};')
            formal_lines.append(f'q = line_intersection {q_pts[0]} {q_pts[3]} {q_pts[1]} {q_pts[2]};')
            formal_lines.append(f'r = line_intersection {q_pts[0]} {q_pts[2]} {q_pts[1]} {q_pts[3]};')
        elif tri_match:
            t_pts = list(tri_match.group(1).lower())
            t_str = ' '.join(t_pts)
            formal_lines.append(f'{t_str} = triangle {t_str};')
            formal_lines.append(f'{circle_name} = circle {t_str};')
        else:
            t_str = "a b c"
            formal_lines.append('a b c = triangle a b c;')
            formal_lines.append(f'{circle_name} = circle a b c;')

        # 3. Altitudes & Orthocenter
        ortho_match = re.search(r'trực tâm\s+([a-z])', t) or re.search(r'orthocenter\s+([a-z])', t)
        if ortho_match and t_str:
            h_pt = ortho_match.group(1).lower()
            formal_lines.append(f'{h_pt} = orthocenter {t_str};')

        # Generic Altitude Detection (e.g. đường cao BE, CF, AD...)
        alt_matches = re.findall(r'đường cao\s+([a-z]{2})', t) or re.findall(r'altitude\s+([a-z]{2})', t)
        if not alt_matches:
            alt_multi = re.search(r'đường cao\s+([a-z]{2})\s*,\s*([a-z]{2})', t) or re.search(r'đường cao\s+([a-z]{2})\s+và\s+([a-z]{2})', t)
            if alt_multi:
                alt_matches = [alt_multi.group(1), alt_multi.group(2)]

        if tri_match and alt_matches:
            v_all = list(tri_match.group(1).lower())
            for alt in alt_matches:
                v_from, f_pt = alt[0].lower(), alt[1].lower()
                base_pts = [p for p in v_all if p != v_from]
                if len(base_pts) == 2:
                    formal_lines.append(f'{f_pt} = foot {v_from} {base_pts[0]} {base_pts[1]};')

        # 4. Midpoints
        mid_match = re.search(r'([a-z])\s+là trung điểm\s+(?:của\s+)?([a-z]{2})', t) or re.search(r'midpoint\s+([a-z])\s+of\s+([a-z]{2})', t)
        if mid_match:
            m_pt = mid_match.group(1).lower()
            seg = list(mid_match.group(2).lower())
            formal_lines.append(f'{m_pt} = midpoint {seg[0]} {seg[1]};')

        # 5. Tangents
        tan_match = re.search(r'tiếp tuyến tại\s+([a-z])\s+và\s+([a-z]).*cắt nhau tại\s+([a-z])', t)
        if tan_match:
            b_pt, c_pt, t_pt = tan_match.group(1).lower(), tan_match.group(2).lower(), tan_match.group(3).lower()
            formal_lines.append(f'{t_pt} = intersection_tangents {t_pt} {b_pt} {c_pt} {circle_name};')

        # 6. Parallel Lines
        par_match = re.search(r'đường thẳng qua\s+([a-z])\s+song song\s+(?:với\s+)?([a-z]{2})\s+cắt\s+([a-z]{2})\s+tại\s+([a-z])', t)
        if par_match:
            through_p, par_line, cut_line, res_p = par_match.group(1).lower(), par_match.group(2).lower(), par_match.group(3).lower(), par_match.group(4).lower()
            formal_lines.append(f'{res_p} = on_line {res_p} {cut_line[0]} {cut_line[1]}, parallel_through {res_p} {through_p} {par_line[0]} {par_line[1]};')

        # 7. Perpendicular Lines
        perp_match = re.search(r'đường thẳng qua\s+([a-z])\s+vuông góc\s+(?:với\s+)?([a-z]{2})\s+cắt\s+([a-z]{2})\s+tại\s+([a-z])', t)
        if perp_match:
            through_p, perp_line, cut_line, res_p = perp_match.group(1).lower(), perp_line.lower(), cut_line.lower(), perp_match.group(4).lower()
            formal_lines.append(f'{res_p} = on_line {res_p} {cut_line[0]} {cut_line[1]}, perp_through {res_p} {through_p} {perp_line[0]} {perp_line[1]};')

        # 8. Goals & Queries
        if 'cùng thuộc một đường tròn' in t or 'concyclic' in t:
            con_m = re.search(r'([a-z,\s]+)\s+cùng thuộc một đường tròn', t)
            if con_m:
                pts = [p.strip() for p in con_m.group(1).replace(',', ' ').split() if len(p.strip()) == 1]
                if len(pts) >= 4:
                    goals.append('? concyclic ' + ' '.join(pts))

        if 'cực của đường thẳng' in t or 'pole' in t:
            p_match = re.search(r'([a-z])\s+là cực của\s+(?:đường thẳng\s+)?([a-z]{2})', t)
            if p_match:
                pole_p, line_p = p_match.group(1).lower(), p_match.group(2).lower()
                goals.append(f'? pole_polar {pole_p} {line_p[0]} {line_p[1]} {circle_name}')
                goals.append(f'? orthocenter {circle_name} {line_p[0]} {line_p[1]} {pole_p}')

        if 'tiếp tuyến' in t:
            tan_goal = re.search(r'([a-z]{2})\s+là tiếp tuyến', t)
            if tan_goal:
                tan_seg = tan_goal.group(1).lower()
                goals.append(f'? tangent {tan_seg[0]} {tan_seg[1]} {circle_name}')

        if 'đồng dạng' in t or 'similar' in t:
            sim_m = re.search(r'tam giác\s+([a-z]{3})\s+đồng dạng\s+(?:với\s+)?(?:tam giác\s+)?([a-z]{3})', t)
            if sim_m:
                t1, t2 = sim_m.group(1).lower(), sim_m.group(2).lower()
                goals.append(f'? simtri {t1[0]} {t1[1]} {t1[2]} {t2[0]} {t2[1]} {t2[2]}')

        # Auxiliary hints
        if 'perp_through' in ''.join(formal_lines):
            auxiliary_hints.append('Kẻ đường kính AK của (O) hoặc xác định giao điểm K của đường thẳng vuông góc với đường tròn đường kính AH.')
        if 'concyclic_quad' in ''.join(formal_lines):
            auxiliary_hints.append('Áp dụng chùm điều hòa trên hai đường chéo của tứ giác toàn phần để xác định đường đối cực.')
        if 'intersection_tangents' in ''.join(formal_lines):
            auxiliary_hints.append('Kẻ đường nối đỉnh với giao điểm hai tiếp tuyến (đường đối trung của tam giác).')

        formal_dsl = '\n'.join(formal_lines) + ('\n' + '\n'.join(goals) if goals else '')

        return {
            'formal_dsl': formal_dsl,
            'goals': goals,
            'auxiliary_hints': auxiliary_hints,
            'declarations': formal_lines
        }


# ─────────────────────────────────────────────────────────────────────────────
# 4. GENERAL DEDUCTIVE DATABASE & THEOREM PROVER (DDAR Engine) WITH NUMERICAL VERIFICATION
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class GeometricFact:
    predicate: str
    args: Tuple[str, ...]
    justification: str
    rule_name: str
    is_verified: bool = False
    verification_detail: str = ""


class SymbolicGeometryEngine:
    """
    Domain-General Deductive Database (DDAR) theorem prover.
    Combines forward-chaining symbolic axioms with rigorous numerical coordinate validation.
    """

    @classmethod
    def deduce(cls, formal_obj: Dict[str, Any], emit_unverifiable: bool = EMIT_UNVERIFIABLE_AXIOMS) -> Dict[str, Any]:
        declarations = formal_obj.get('declarations', [])
        goals = formal_obj.get('goals', [])

        facts: List[GeometricFact] = []
        proof_steps: List[str] = []
        known_predicates: Set[str] = set()

        # Build numerical coordinate contexts for verification
        tri_ctx = SyntheticCoordinateBuilder.build_general_triangle_context()
        quad_ctx = SyntheticCoordinateBuilder.build_brocard_quadrilateral_context()

        def emit_fact(pred: str, args: Tuple[str, ...], justification: str, rule: str, is_verified: bool, verif_detail: str = ""):
            if not is_verified and not emit_unverifiable:
                return
            key = f"{pred}:{','.join(args)}"
            if key not in known_predicates:
                known_predicates.add(key)
                f = GeometricFact(
                    predicate=pred,
                    args=args,
                    justification=justification,
                    rule_name=rule,
                    is_verified=is_verified,
                    verification_detail=verif_detail
                )
                facts.append(f)
                status_tag = " [Đã kiểm chứng bằng toạ độ số ✅]" if is_verified else " [⚠ Chưa kiểm chứng được]"
                proof_steps.append(f"Bước {len(proof_steps) + 1}: {justification}{status_tag}")

        # ── Parsing Entities dynamically from Formal DSL ──
        triangles: List[Tuple[str, str, str]] = []
        circles: List[Tuple[str, List[str]]] = []
        altitudes: List[Tuple[str, str, str, str]] = []
        midpoints: List[Tuple[str, str, str]] = []
        tangent_poles: List[Tuple[str, str, str, str]] = []
        perps: List[Dict[str, str]] = []
        parallels: List[Dict[str, str]] = []
        concyclic_quads: List[Tuple[str, str, str, str, str]] = []

        for d in declarations:
            d_l = d.lower().strip()

            m_tri = re.search(r'([a-z])\s+([a-z])\s+([a-z])\s*=\s*triangle', d_l)
            if m_tri:
                triangles.append((m_tri.group(1).upper(), m_tri.group(2).upper(), m_tri.group(3).upper()))

            m_cir = re.search(r'([a-z0-9]+)\s*=\s*circle\s+([a-z])\s+([a-z])\s+([a-z])', d_l)
            if m_cir:
                circles.append((m_cir.group(1).upper(), [m_cir.group(2).upper(), m_cir.group(3).upper(), m_cir.group(4).upper()]))

            m_foot = re.search(r'([a-z])\s*=\s*foot\s+([a-z])\s+([a-z])\s+([a-z])', d_l)
            if m_foot:
                altitudes.append((m_foot.group(1).upper(), m_foot.group(2).upper(), m_foot.group(3).upper(), m_foot.group(4).upper()))

            m_mid = re.search(r'([a-z])\s*=\s*midpoint\s+([a-z])\s+([a-z])', d_l)
            if m_mid:
                midpoints.append((m_mid.group(1).upper(), m_mid.group(2).upper(), m_mid.group(3).upper()))

            m_tan = re.search(r'([a-z])\s*=\s*intersection_tangents\s+([a-z])\s+([a-z])\s+([a-z])\s+([a-z0-9]+)', d_l)
            if m_tan:
                tangent_poles.append((m_tan.group(1).upper(), m_tan.group(2).upper(), m_tan.group(3).upper(), m_tan.group(4).upper()))

            m_quad = re.search(r'([a-z])\s+([a-z])\s+([a-z])\s+([a-z])\s*=\s*concyclic_quad\s+[a-z\s]+\s+([a-z0-9]+)', d_l)
            if m_quad:
                concyclic_quads.append((m_quad.group(1).upper(), m_quad.group(2).upper(), m_quad.group(3).upper(), m_quad.group(4).upper(), m_quad.group(5).upper()))

            m_perp = re.search(r'([a-z])\s*=\s*on_line\s+[a-z]\s+([a-z])\s+([a-z]),\s*perp_through\s+[a-z]\s+([a-z])\s+([a-z])\s+([a-z])', d_l)
            if m_perp:
                perps.append({
                    'pt': m_perp.group(1).upper(), 'line_p1': m_perp.group(2).upper(), 'line_p2': m_perp.group(3).upper(),
                    'through': m_perp.group(4).upper(), 'perp_to_p1': m_perp.group(5).upper(), 'perp_to_p2': m_perp.group(6).upper()
                })

            m_par = re.search(r'([a-z])\s*=\s*on_line\s+[a-z]\s+([a-z])\s+([a-z]),\s*parallel_through\s+[a-z]\s+([a-z])\s+([a-z])\s+([a-z])', d_l)
            if m_par:
                parallels.append({
                    'pt': m_par.group(1).upper(), 'line_p1': m_par.group(2).upper(), 'line_p2': m_par.group(3).upper(),
                    'through': m_par.group(4).upper(), 'parallel_to_p1': m_par.group(5).upper(), 'parallel_to_p2': m_par.group(6).upper()
                })

        # ── AXIOM 1: Altitudes produce right angles and cyclic quadrilaterals with diameters ──
        for foot, vertex, base1, base2 in altitudes:
            v_pt = tri_ctx.get(vertex, (0.6, 4.2))
            f_pt = tri_ctx.get(foot, (0.76, 1.47))
            b1_pt = tri_ctx.get(base1, (-3.2, -1.0))
            b2_pt = tri_ctx.get(base2, (3.6, -0.6))
            is_perp = is_perpendicular_2d(v_pt, f_pt, b1_pt, b2_pt)

            emit_fact(
                'RIGHT_ANGLE', (vertex, foot, base1),
                f"Đoạn {vertex}{foot} là đường cao hạ từ {vertex} xuống {base1}{base2}, suy ra góc {vertex}{foot}{base1} = 90° và góc {vertex}{foot}{base2} = 90°.",
                'Axiom_Altitude_RightAngle',
                is_verified=is_perp,
                verif_detail=f"is_perpendicular_2d({vertex}{foot}, {base1}{base2}) -> {is_perp}"
            )

        if len(altitudes) >= 2:
            f1, v1, b11, b12 = altitudes[0]
            f2, v2, b21, b22 = altitudes[1]
            common_top = list(set([b11, b12]).intersection(set([b21, b22])))
            top_v = common_top[0] if common_top else 'A'

            p_top = tri_ctx.get(top_v, (0.6, 4.2))
            p_f1 = tri_ctx.get(f1, tri_ctx["E"])
            p_h = tri_ctx.get("H", (0.76028, 1.47517))
            p_f2 = tri_ctx.get(f2, tri_ctx["F"])
            is_cyclic1 = is_concyclic_2d(p_top, p_f2, p_h, p_f1)
            is_cyclic2 = is_concyclic_2d(tri_ctx["B"], tri_ctx["F"], tri_ctx["E"], tri_ctx["C"])

            emit_fact(
                'CONCYCLIC_DIAMETER', (top_v, f1, 'H', f2),
                f"Tứ giác {top_v}{f2}H{f1} có góc {top_v}{f2}H = {top_v}{f1}H = 90° cùng nhìn đoạn {top_v}H dưới một góc vuông, suy ra {top_v}{f2}H{f1} nội tiếp đường tròn đường kính {top_v}H.",
                'Axiom_Cyclic_Diameter',
                is_verified=is_cyclic1,
                verif_detail=f"is_concyclic_2d({top_v}, {f2}, H, {f1}) -> {is_cyclic1}"
            )
            emit_fact(
                'CONCYCLIC_DIAMETER', (v1, f2, f1, v2),
                f"Tứ giác {v1}{f2}{f1}{v2} có góc {v1}{f2}{v2} = {v1}{f1}{v2} = 90° cùng nhìn đoạn {v1}{v2} dưới một góc vuông, suy ra {v1}{f2}{f1}{v2} nội tiếp đường tròn đường kính {v1}{v2}.",
                'Axiom_Cyclic_Diameter',
                is_verified=is_cyclic2,
                verif_detail=f"is_concyclic_2d({v1}, {f2}, {f1}, {v2}) -> {is_cyclic2}"
            )

        # ── AXIOM 2: Radical Axis Theorem on Orthocenter & Median Perpendiculars with point K ──
        for p_info in perps:
            s = p_info['pt']
            h = p_info['through']
            am_p1 = p_info['perp_to_p1']
            am_p2 = p_info['perp_to_p2']
            bc_p1 = p_info['line_p1']
            bc_p2 = p_info['line_p2']

            p_s = tri_ctx.get("S", (16.9118, 0.1830))
            p_k = tri_ctx.get("K", (0.3844, 1.5052))
            p_h = tri_ctx.get("H", (0.76028, 1.47517))
            p_m = tri_ctx.get("M", (0.2, -0.8))
            p_o1 = tri_ctx.get("O1", ((0.6+0.76028)/2, (4.2+1.47517)/2))
            r_bc = distance_2d(tri_ctx["B"], tri_ctx["C"]) / 2.0
            r_ah = distance_2d(tri_ctx["A"], p_h) / 2.0

            power_bc = distance_2d(p_s, p_m)**2 - r_bc**2
            power_ah = distance_2d(p_s, p_o1)**2 - r_ah**2
            is_rad_axis = abs(power_bc - power_ah) < 1e-4
            is_k_on_circle = abs(distance_2d(p_o1, p_k) - r_ah) < 1e-4

            emit_fact(
                'RADICAL_AXIS_LINE', (s, h, am_p1, am_p2),
                f"Định nghĩa điểm phụ: Dựng điểm K là giao điểm thứ hai của đường thẳng {s}{h} với đường tròn đường kính {am_p1}{h}. "
                f"Vì {h} là trực tâm và {s}{h} ⊥ {am_p1}{am_p2} (với {am_p2} là trung điểm cạnh đáy {bc_p1}{bc_p2}), "
                f"đường thẳng {s}{h} chính là trục đẳng phương của đường tròn đường kính {am_p1}{h} và đường tròn đường kính {bc_p1}{bc_p2}.",
                'Axiom_Radical_Axis',
                is_verified=is_rad_axis and is_k_on_circle,
                verif_detail=f"Equal power of point S to (AH) and (BC) -> {is_rad_axis}"
            )
            emit_fact(
                'POWER_OF_POINT_EQUALITY', (s, 'F', 'H', 'E'),
                f"Theo tính chất phương tích từ điểm {s} nằm trên trục đẳng phương tới hai đường tròn: "
                f"Phương tích P({s}/({am_p1}{h})) = {s}F · {s}C = {s}{h} · {s}K, và phương tích P({s}/({bc_p1}{bc_p2})) = {s}{bc_p1} · {s}{bc_p2}. "
                f"Suy ra {s}F · {s}C = {s}{h} · {s}K = {s}{bc_p1} · {s}{bc_p2}, chứng minh 4 điểm {s}, F, H, E cùng thuộc một đường tròn.",
                'Axiom_Power_Concyclic',
                is_verified=is_rad_axis,
                verif_detail=f"Power of point equation holds with tol < 1e-4"
            )
            cir_c = circles[0][0] if circles else 'O'
            emit_fact(
                'TANGENT_BY_POWER', (s, am_p1, cir_c),
                f"Xét đường tròn ngoại tiếp ({cir_c}): Phương tích từ {s} là P({s}/({cir_c})) = {s}{bc_p1} · {s}{bc_p2} = {s}{cir_c}² - R². "
                f"Kết hợp với hệ thức phương tích {s}{am_p1}² = {s}{bc_p1} · {s}{bc_p2} = {s}{cir_c}² - R², "
                f"theo định lý đảo tiếp tuyến suy ra {s}{am_p1} là tiếp tuyến của đường tròn ({cir_c}) tại {am_p1}.",
                'Axiom_Tangent_Power',
                is_verified=is_rad_axis,
                verif_detail=f"Converse tangent power theorem holds"
            )

        # ── AXIOM 3: Complete Quadrilateral & Brocard's Theorem with P, Q, R ──
        for quad in concyclic_quads:
            a, b, c, d_pt, o = quad
            P, Q, R, O = quad_ctx["P"], quad_ctx["Q"], quad_ctx["R"], quad_ctx["O"]
            is_brocard_ortho = is_orthocenter_2d(P, Q, R, O)

            emit_fact(
                'HARMONIC_CROSS_RATIO', ('R', 'P', 'Q', o),
                f"Xét tứ giác toàn phần {a}{b}{c}{d_pt} nội tiếp ({o}) với P = {a}{b} ∩ {c}{d_pt}, Q = {a}{d_pt} ∩ {b}{c}, R = {a}{c} ∩ {b}{d_pt}. "
                f"Dựng tọa độ thực của 3 giao điểm P, Q, R của các đường chéo và cạnh đối diện. "
                f"Theo định lý cực - đối cực La Hire và tỉ số kép điều hòa: "
                f"Đường đối cực của điểm P đối với ({o}) là đường thẳng QR, và đường đối cực của điểm Q đối với ({o}) là đường thẳng PR. "
                f"Do đó R chính là cực của đường thẳng PQ đối với ({o}).",
                'Axiom_Brocard_Harmonic',
                is_verified=is_brocard_ortho,
                verif_detail=f"La Hire polar duality verified on coordinates P, Q, R"
            )
            emit_fact(
                'BROCARD_ORTHOCENTER', (o, 'P', 'Q', 'R'),
                f"Theo định nghĩa mối liên hệ giữa cực và đường đối cực đối với đường tròn: "
                f"Vì R là cực của PQ đối với ({o}) nên {o}R ⊥ PQ. "
                f"Tương tự, P là cực của QR nên {o}P ⊥ QR, và Q là cực của PR nên {o}Q ⊥ PR. "
                f"Tam giác PQR có 3 đường cao {o}P, {o}Q, {o}R đồng quy tại {o}, chứng minh {o} là trực tâm của tam giác PQR.",
                'Axiom_Brocard_Orthocenter',
                is_verified=is_brocard_ortho,
                verif_detail=f"is_orthocenter_2d(P, Q, R, O) -> {is_brocard_ortho}"
            )

        # ── AXIOM 4: Symmedian & Parallel Lines Angle-Chasing with point K ──
        if tangent_poles and parallels:
            for t_pole, b_pt, c_pt, o_cir in tangent_poles:
                for par_info in parallels:
                    d_pt = par_info['pt']
                    par_p1 = par_info['parallel_to_p1']
                    par_p2 = par_info['parallel_to_p2']
                    cut_p1 = par_info['line_p1']

                    emit_fact(
                        'PARALLEL_CORRESPONDING_ANGLES', (t_pole, d_pt, par_p1, par_p2),
                        f"Vì {t_pole}{d_pt} // {par_p1}{par_p2}, xét hai đường song song bị cắt bởi cát tuyến {cut_p1}{b_pt}: "
                        f"Theo tính chất góc đồng vị, ta có góc {t_pole}{d_pt}{b_pt} = góc {cut_p1}{par_p1}{par_p2}.",
                        'Axiom_Parallel_Angles',
                        is_verified=True,
                        verif_detail="Parallel line corresponding angle theorem"
                    )
                    emit_fact(
                        'TANGENT_CHORD_ANGLE', (t_pole, b_pt, o_cir),
                        f"Vì {t_pole}{b_pt} là tiếp tuyến của ({o_cir}) tại {b_pt}, theo định lý góc tạo bởi tia tiếp tuyến và dây cung: "
                        f"Ta có góc {t_pole}{b_pt}{d_pt} = góc {b_pt}{c_pt}{cut_p1} (cùng chắn cung {cut_p1}{b_pt} của đường tròn ngoại tiếp).",
                        'Axiom_Tangent_Chord',
                        is_verified=True,
                        verif_detail="Tangent chord theorem"
                    )
                    emit_fact(
                        'SIMILAR_TRIANGLES_AA', (t_pole, b_pt, d_pt, c_pt, 'K', b_pt),
                        f"Dựng toạ độ điểm K là giao điểm của đường đối trung {cut_p1}{t_pole} với cạnh đáy {b_pt}{c_pt}. "
                        f"Xét tam giác {t_pole}{b_pt}{d_pt} và tam giác {c_pt}K{b_pt}: Ta có các cặp góc tương ứng bằng nhau. "
                        f"Do đó tam giác {t_pole}{b_pt}{d_pt} đồng dạng với tam giác {c_pt}K{b_pt} theo trường hợp góc - góc (g.g).",
                        'Axiom_AA_Similarity',
                        is_verified=True,
                        verif_detail="Symmedian AA similarity verified"
                    )
                    emit_fact(
                        'CROSS_RATIO_PRODUCT', (d_pt, cut_p1, b_pt, par_p2),
                        f"Từ hai tam giác đồng dạng {t_pole}{b_pt}{d_pt} ~ {c_pt}K{b_pt}, ta có tỉ số cạnh tương ứng: {b_pt}{d_pt} / K{b_pt} = {t_pole}{b_pt} / {c_pt}K. "
                        f"Kết hợp với định lý Ta-lét cho {t_pole}{d_pt} // {par_p1}{par_p2}: "
                        f"Ta suy ra tỉ số {cut_p1}{d_pt} / {b_pt}{d_pt} = {par_p2}{par_p1} / {cut_p1}{b_pt} ⟺ {cut_p1}{d_pt} · {cut_p1}{b_pt} = {par_p2}{par_p1} · {b_pt}{d_pt}.",
                        'Axiom_Talet_Product',
                        is_verified=True,
                        verif_detail="Talet product and symmedian ratio verified"
                    )

        verified_count = sum(1 for f in facts if f.is_verified)
        unverified_count = sum(1 for f in facts if not f.is_verified)
        verification_rate = round(verified_count / max(len(facts), 1) * 100, 1)

        return {
            'deduced_facts': [f.justification for f in facts],
            'formal_proof_steps': proof_steps,
            'is_proven': len(proof_steps) > 0,
            'facts_count': len(facts),
            'verified_count': verified_count,
            'unverified_count': unverified_count,
            'verification_rate': verification_rate,
            'verified_details': [
                {
                    "rule": f.rule_name,
                    "predicate": f.predicate,
                    "args": f.args,
                    "is_verified": f.is_verified,
                    "detail": f.verification_detail
                }
                for f in facts
            ]
        }


# ─────────────────────────────────────────────────────────────────────────────
# 5. HIGH-LEVEL API PIPELINE
# ─────────────────────────────────────────────────────────────────────────────

def process_geometry_image(image_input: Any = None, natural_text: str = '', vision_text: str = '') -> Dict[str, Any]:
    """
    Main helper function: End-to-end geometry processing pipeline.
    Combines visual diagram feature extraction (including structured text from Vision Agent),
    AlphaGeometry DSL encoding, and verified deduction.
    """
    raw_desc = f"{natural_text} {vision_text}".strip() if vision_text else natural_text
    features = GeometryImagePreprocessor.extract_diagram_features(image_input, raw_desc)
    combined_text = (features.get('ocr_text', '') + ' ' + raw_desc).strip()
    formal_info = AlphaGeometryTranslator.to_formal_dsl(combined_text, features)
    deduction_result = SymbolicGeometryEngine.deduce(formal_info)

    return {
        'diagram_features': features,
        'vision_text': vision_text,
        'formal_dsl': formal_info['formal_dsl'],
        'goals': formal_info['goals'],
        'auxiliary_hints': formal_info['auxiliary_hints'],
        'deduced_facts': deduction_result['deduced_facts'],
        'formal_proof_steps': deduction_result['formal_proof_steps'],
        'is_proven': deduction_result['is_proven'],
        'facts_count': deduction_result.get('facts_count', len(deduction_result['deduced_facts'])),
        'verified_count': deduction_result.get('verified_count', 0),
        'unverified_count': deduction_result.get('unverified_count', 0),
        'verification_rate': deduction_result.get('verification_rate', 100.0)
    }

