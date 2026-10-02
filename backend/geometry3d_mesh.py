"""
geometry3d_mesh.py
==================
Server-side 3D mesh tier for the MathViz ``geometry_3d`` widget.

Why it exists
-------------
The widget draws 19 solids from templates baked into the browser
(MathVizGeometry3D.js: BASIC_SOLIDS + EXOTIC_SOLIDS). For any other solid the
model names, the client used to fall back to a 1x1x1 box — a figure that is
silently wrong. This module is the honest answer: `solid` + numeric `dims` are
compiled into a real mesh with trimesh (pure Python + numpy — small enough for
the single-worker instance that torch once knocked over), validated
(watertight / volume / bounding box), and returned either as vertex/index
arrays for the browser (THREE.BufferGeometry) or as an STL/GLB download.

Security / bounds
-----------------
Everything is derived from `solid` + numbers; no code from the model is ever
executed (same rule as the GeoGebra exporter). Dimensions are clamped to
[MIN_DIM, MAX_DIM], segment counts are fixed internal constants, and a hard
face ceiling (MAX_FACES) keeps one request from allocating unbounded memory.
The endpoint that calls this (/api/geometry3d/mesh) is rate-limited via
security_limits.VIZ_EXPORT_LIMIT.

The trimesh import is guarded: on an instance without the wheel the module
still imports, and build_mesh raises Geometry3DError so the endpoint can answer
honestly instead of 500-ing.
"""
from __future__ import annotations

import math
from typing import Any, Dict, List, Optional, Tuple

try:
    import numpy as np
    import trimesh
    _HAS_TRIMESH = True
except Exception:  # pragma: no cover - requirements.txt ships trimesh
    np = None
    trimesh = None
    _HAS_TRIMESH = False

MIN_DIM = 1e-3
MAX_DIM = 50.0
MAX_FACES = 120_000
MAX_ARRAY_VERTICES = 60_000
MAX_EXPORT_BYTES = 4_000_000
_RING_SECTIONS = 64

# Canonical names plus the spellings a Vietnamese model actually emits.
SUPPORTED_SOLIDS: Tuple[str, ...] = (
    "box", "prism", "pyramid", "truncated_pyramid",
    "cylinder", "cone", "frustum",
    "sphere", "ellipsoid", "hemisphere",
    "capsule", "torus",
)

_SOLID_ALIASES: Dict[str, str] = {
    "cuboid": "box", "rectangular_box": "box", "hinh_hop": "box",
    "hinh_hop_chu_nhat": "box", "khoi_hop": "box",
    "lang_tru": "prism", "prism_n": "prism", "lang_tru_deu": "prism",
    "hinh_chop": "pyramid", "hinh_chop_deu": "pyramid", "pyramid_n": "pyramid",
    "hinh_chop_cut": "truncated_pyramid", "chop_cut": "truncated_pyramid",
    "hinh_tru": "cylinder", "tru": "cylinder",
    "hinh_non": "cone", "non": "cone",
    "hinh_non_cut": "frustum", "non_cut": "frustum", "truncated_cone": "frustum",
    "hinh_cau": "sphere", "cau": "sphere",
    "elip_3d": "ellipsoid", "ellipsoid_3d": "ellipsoid",
    "nua_cau": "hemisphere", "half_sphere": "hemisphere",
    "tru_tron_hai_dau": "capsule",
    "hinh_xuyen": "torus", "xuyen": "torus",
}


class Geometry3DError(ValueError):
    """A request this module cannot (or must not) build."""


def canonical_solid(solid: Any) -> str:
    key = str(solid or "").strip().lower().replace(" ", "_").replace("-", "_")
    key = _SOLID_ALIASES.get(key, key)
    if key not in SUPPORTED_SOLIDS:
        raise Geometry3DError(
            f"Khối '{solid}' chưa có template phía máy chủ. "
            f"Hỗ trợ: {', '.join(SUPPORTED_SOLIDS)}."
        )
    return key


def _require() -> None:
    if not _HAS_TRIMESH:
        raise Geometry3DError("trimesh chưa được cài trên máy chủ này.")


def _dim(dims: Any, primary: str, *fallbacks: str, default: Optional[float] = None) -> float:
    """One clamped, finite dimension: primary key, then fallbacks, then default."""
    data = dims if isinstance(dims, dict) else {}
    value: Optional[float] = None
    for key in (primary, *fallbacks):
        raw = data.get(key)
        if isinstance(raw, (int, float)) and not isinstance(raw, bool):
            value = float(raw)
            break
    if value is None:
        if default is None:
            raise Geometry3DError(f"Thiếu kích thước '{primary}' cho khối này.")
        value = float(default)
    if not math.isfinite(value):
        raise Geometry3DError(f"Kích thước '{primary}' không hữu hạn.")
    return max(MIN_DIM, min(MAX_DIM, value))


def _sides(dims: Any, key: str = "n", default: int = 6) -> int:
    data = dims if isinstance(dims, dict) else {}
    raw = data.get(key)
    if isinstance(raw, (int, float)) and not isinstance(raw, bool) and math.isfinite(float(raw)):
        return max(3, min(_RING_SECTIONS, int(raw)))
    return max(3, min(_RING_SECTIONS, default))


def _ring(radius: float, n: int, z: float) -> List[Tuple[float, float, float]]:
    return [
        (radius * math.cos(2 * math.pi * i / n), radius * math.sin(2 * math.pi * i / n), z)
        for i in range(n)
    ]


def _fix_winding(mesh: "trimesh.Trimesh") -> "trimesh.Trimesh":
    """Outward normals: a negative volume means the winding is inverted."""
    try:
        if mesh.volume < 0:
            mesh.invert()
    except Exception:
        pass
    return mesh


def _rings_to_mesh(bottom: List[Tuple[float, float, float]],
                   top: List[Tuple[float, float, float]],
                   cap_bottom: bool = True, cap_top: bool = True) -> "trimesh.Trimesh":
    """A closed solid between two equal-length rings (side-wall + fan caps)."""
    n = len(bottom)
    vertices = list(bottom) + list(top)
    faces: List[Tuple[int, int, int]] = []
    for i in range(n):
        j = (i + 1) % n
        faces.append((i, j, n + j))
        faces.append((i, n + j, n + i))
    if cap_bottom:
        for i in range(1, n - 1):
            faces.append((0, i + 1, i))
    if cap_top:
        for i in range(1, n - 1):
            faces.append((n, n + i, n + i + 1))
    return _fix_winding(trimesh.Trimesh(vertices=vertices, faces=faces, process=True))


def _pyramid_mesh(radius: float, height: float, n: int) -> "trimesh.Trimesh":
    vertices = _ring(radius, n, -height / 2) + [(0.0, 0.0, height / 2)]
    apex = n
    faces: List[Tuple[int, int, int]] = []
    for i in range(n):
        j = (i + 1) % n
        faces.append((i, j, apex))
    for i in range(1, n - 1):
        faces.append((0, i + 1, i))
    return _fix_winding(trimesh.Trimesh(vertices=vertices, faces=faces, process=True))


def _hemisphere_mesh(radius: float, sections: int = 32, rings: int = 16) -> "trimesh.Trimesh":
    """Half sphere (dome + flat cap) built by hand.

    NOT trimesh's `slice_plane`: that path imports scipy.spatial.cKDTree, and
    scipy is deliberately not a dependency of this service (it is ~40 MB of
    wheels for one shape). A UV grid + a fan cap is a dozen lines and needs
    nothing beyond the standard library.
    """
    vertices: List[Tuple[float, float, float]] = [(0.0, 0.0, radius)]
    for i in range(1, rings + 1):
        theta = (math.pi / 2) * (i / rings)
        z = radius * math.cos(theta)
        ring_r = radius * math.sin(theta)
        for j in range(sections):
            phi = 2 * math.pi * j / sections
            vertices.append((ring_r * math.cos(phi), ring_r * math.sin(phi), z))
    cap_center = len(vertices)
    vertices.append((0.0, 0.0, 0.0))

    faces: List[Tuple[int, int, int]] = []
    for j in range(sections):                       # top pole fan
        jn = (j + 1) % sections
        faces.append((0, 1 + jn, 1 + j))
    for i in range(1, rings):                       # quad band between rings
        base_a = 1 + (i - 1) * sections
        base_b = 1 + i * sections
        for j in range(sections):
            jn = (j + 1) % sections
            a, b = base_a + j, base_a + jn
            c, d = base_b + jn, base_b + j
            faces.append((a, b, c))
            faces.append((a, c, d))
    equator = 1 + (rings - 1) * sections            # flat cap fan
    for j in range(sections):
        jn = (j + 1) % sections
        faces.append((cap_center, equator + jn, equator + j))
    return _fix_winding(trimesh.Trimesh(vertices=vertices, faces=faces, process=True))


def build_mesh(solid: Any, dims: Any) -> "trimesh.Trimesh":
    """`solid` + `dims` → a Trimesh. Raises Geometry3DError.

    Dimensions use the widget's own key vocabulary first (a/b/h/r/r1/r2/n...)
    with the descriptive spellings (width/height/radius...) as fallbacks, so a
    payload written for the client templates runs here unchanged.
    """
    _require()
    key = canonical_solid(solid)
    if key == "box":
        a = _dim(dims, "a", "width", default=3.0)
        b = _dim(dims, "b", "depth", default=2.5)
        h = _dim(dims, "h", "height", "c", default=4.0)
        mesh = trimesh.creation.box(extents=(a, b, h))
    elif key == "prism":
        n = _sides(dims)
        r = _dim(dims, "r", "radius", "a", default=2.0)
        h = _dim(dims, "h", "height", default=4.0)
        mesh = _rings_to_mesh(_ring(r, n, -h / 2), _ring(r, n, h / 2))
    elif key == "pyramid":
        n = _sides(dims)
        r = _dim(dims, "r", "radius", "a", default=2.0)
        h = _dim(dims, "h", "height", default=4.0)
        mesh = _pyramid_mesh(r, h, n)
    elif key == "truncated_pyramid":
        n = _sides(dims)
        r1 = _dim(dims, "r1", "bottom_radius", default=2.0)
        r2 = _dim(dims, "r2", "top_radius", default=1.0)
        h = _dim(dims, "h", "height", default=4.0)
        mesh = _rings_to_mesh(_ring(r1, n, -h / 2), _ring(r2, n, h / 2))
    elif key == "cylinder":
        r = _dim(dims, "r", "radius", default=2.0)
        h = _dim(dims, "h", "height", default=4.0)
        mesh = trimesh.creation.cylinder(radius=r, height=h, sections=_RING_SECTIONS)
    elif key == "cone":
        r = _dim(dims, "r", "radius", default=2.0)
        h = _dim(dims, "h", "height", default=4.0)
        mesh = trimesh.creation.cone(radius=r, height=h, sections=_RING_SECTIONS)
    elif key == "frustum":
        r1 = _dim(dims, "r1", "bottom_radius", default=3.0)
        r2 = _dim(dims, "r2", "top_radius", default=1.5)
        h = _dim(dims, "h", "height", default=4.0)
        mesh = _rings_to_mesh(_ring(r1, _RING_SECTIONS, -h / 2),
                              _ring(r2, _RING_SECTIONS, h / 2))
    elif key == "sphere":
        r = _dim(dims, "r", "radius", default=2.0)
        mesh = trimesh.creation.icosphere(subdivisions=3, radius=r)
    elif key == "ellipsoid":
        a = _dim(dims, "a", "rx", default=3.0)
        b = _dim(dims, "b", "ry", default=2.5)
        c = _dim(dims, "c", "rz", "h", default=2.0)
        mesh = trimesh.creation.icosphere(subdivisions=3, radius=1.0)
        mesh.apply_scale([a, b, c])
    elif key == "hemisphere":
        r = _dim(dims, "r", "radius", default=2.0)
        mesh = _hemisphere_mesh(r)
    elif key == "capsule":
        r = _dim(dims, "r", "radius", default=1.5)
        h = _dim(dims, "h", "height", default=3.0)
        mesh = trimesh.creation.capsule(height=h, radius=r, count=(16, 16))
    elif key == "torus":
        major = _dim(dims, "R", "major_radius", "r1", default=2.5)
        minor = _dim(dims, "r", "minor_radius", "r2", default=1.0)
        if minor >= major:
            raise Geometry3DError("Bán kính ống của hình xuyến phải nhỏ hơn bán kính vòng.")
        mesh = trimesh.creation.torus(major_radius=major, minor_radius=minor,
                                      major_sections=48, minor_sections=24)
    else:  # canonical_solid already rejected anything else
        raise Geometry3DError(f"Khối '{solid}' chưa có template phía máy chủ.")

    if mesh is None or not isinstance(mesh, trimesh.Trimesh):
        raise Geometry3DError("Không dựng được lưới cho khối này.")
    if len(mesh.faces) > MAX_FACES:
        raise Geometry3DError("Lưới vượt giới hạn cho phép.")
    return mesh


def mesh_report(mesh: "trimesh.Trimesh") -> Dict[str, Any]:
    """The numbers a student/teacher can check: watertight, volume, bbox."""
    bounds = mesh.bounds
    extents = bounds[1] - bounds[0]
    return {
        "watertight": bool(mesh.is_watertight),
        "volume": round(abs(float(mesh.volume)), 6),
        "area": round(float(mesh.area), 6),
        "faces": int(len(mesh.faces)),
        "vertices": int(len(mesh.vertices)),
        "bounding_box": {
            "min": [round(float(v), 6) for v in bounds[0]],
            "max": [round(float(v), 6) for v in bounds[1]],
            "extents": [round(float(v), 6) for v in extents],
        },
    }


def mesh_arrays(mesh: "trimesh.Trimesh") -> Dict[str, Any]:
    """Flat vertex/index arrays for THREE.BufferGeometry (bounded size)."""
    if len(mesh.vertices) > MAX_ARRAY_VERTICES:
        raise Geometry3DError("Lưới quá lớn để hiển thị trực tiếp.")
    return {
        "vertices": [round(float(v), 6) for v in mesh.vertices.reshape(-1)],
        "indices": [int(i) for i in mesh.faces.reshape(-1)],
        "triangles": int(len(mesh.faces)),
    }


def export_bytes(mesh: "trimesh.Trimesh", fmt: Any, solid: str = "khoi"):
    """(bytes, filename, mime) for 'stl' | 'glb' (raises Geometry3DError)."""
    wanted = str(fmt or "").strip().lower()
    if wanted not in ("stl", "glb"):
        raise Geometry3DError("Định dạng xuất chỉ hỗ trợ 'stl' hoặc 'glb'.")
    try:
        data = mesh.export(file_type=wanted)
    except Exception as exc:  # pragma: no cover - depends on trimesh internals
        raise Geometry3DError(f"Không xuất được tệp {wanted.upper()}: {exc}") from exc
    if not isinstance(data, (bytes, bytearray)):
        raise Geometry3DError(f"Bộ xuất {wanted.upper()} không trả về dữ liệu nhị phân.")
    if len(data) > MAX_EXPORT_BYTES:
        raise Geometry3DError("Tệp lưới vượt giới hạn dung lượng cho phép.")
    safe = "".join(ch for ch in str(solid) if ch.isalnum() or ch in "-_") or "khoi"
    filename = f"duomath-{safe}.{wanted}"
    mime = "model/stl" if wanted == "stl" else "model/gltf-binary"
    return bytes(data), filename, mime
