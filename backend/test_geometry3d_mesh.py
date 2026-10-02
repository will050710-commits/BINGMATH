"""test_geometry3d_mesh.py — build/validate/export the trimesh fallback tier.
Needs trimesh + numpy + shapely-free paths (all in requirements.txt).
"""
import math
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, os.path.dirname(__file__))

import geometry3d_mesh as g3d  # noqa: E402

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


def close(a, b, rel=0.01):
    return abs(a - b) <= rel * max(1.0, abs(b))


print("=== box ===")
box = g3d.build_mesh("box", {"a": 2, "b": 3, "h": 4})
box_rep = g3d.mesh_report(box)
check("volume of 2x3x4 box is 24", close(box_rep["volume"], 24.0), str(box_rep["volume"]))
check("box is watertight", box_rep["watertight"])
ext = sorted(box_rep["bounding_box"]["extents"])
check("bbox extents are 2/3/4", [round(v, 6) for v in ext] == [2.0, 3.0, 4.0], str(ext))
check("cuboid / hinh_hop_chu_nhat alias to box",
      g3d.canonical_solid("cuboid") == "box"
      and g3d.canonical_solid("hinh_hop_chu_nhat") == "box")

print("=== cylinder ===")
cyl = g3d.mesh_report(g3d.build_mesh("cylinder", {"r": 1.5, "h": 5}))
check("cylinder volume ≈ πr²h",
      close(cyl["volume"], math.pi * 1.5 ** 2 * 5, 0.01), str(cyl["volume"]))
check("cylinder is watertight", cyl["watertight"])

print("=== prism / pyramid (manual ring construction) ===")
prism = g3d.mesh_report(g3d.build_mesh("prism", {"n": 6, "r": 2, "h": 3}))
check("hexagonal prism volume ≈ (3√3/2)r²h",
      close(prism["volume"], (3 * math.sqrt(3) / 2) * 4 * 3, 0.02), str(prism["volume"]))
check("prism is watertight", prism["watertight"])
pyr = g3d.mesh_report(g3d.build_mesh("pyramid", {"n": 4, "r": 2, "h": 4}))
check("square pyramid volume ≈ (1/3)(2r²)h",
      close(pyr["volume"], (1 / 3) * 8 * 4, 0.02), str(pyr["volume"]))
check("pyramid is watertight", pyr["watertight"])

print("=== sphere family ===")
sph = g3d.mesh_report(g3d.build_mesh("sphere", {"r": 2}))
check("sphere volume ≈ 4/3πr³", close(sph["volume"], 4 / 3 * math.pi * 8, 0.01), str(sph["volume"]))
ell = g3d.mesh_report(g3d.build_mesh("ellipsoid", {"a": 3, "b": 2, "c": 1}))
check("ellipsoid volume ≈ 4/3πabc", close(ell["volume"], 4 / 3 * math.pi * 6, 0.02), str(ell["volume"]))
hemi = g3d.mesh_report(g3d.build_mesh("hemisphere", {"r": 2}))
check("hemisphere volume ≈ 2/3πr³", close(hemi["volume"], 2 / 3 * math.pi * 8, 0.04), str(hemi["volume"]))
check("hemisphere is watertight (slice cap closes it)", hemi["watertight"])
check("hemisphere is half as tall as wide",
      close(min(hemi["bounding_box"]["extents"]), 2.0, 0.05),
      str(hemi["bounding_box"]["extents"]))

print("=== capsule / torus ===")
cap = g3d.mesh_report(g3d.build_mesh("capsule", {"r": 1, "h": 2}))
check("capsule volume ≈ cylinder + sphere",
      close(cap["volume"], math.pi * 2 + 4 / 3 * math.pi, 0.03), str(cap["volume"]))
check("capsule is watertight", cap["watertight"])
tor = g3d.mesh_report(g3d.build_mesh("torus", {"R": 2.5, "r": 1}))
check("torus volume ≈ 2π²Rr²", close(tor["volume"], 2 * math.pi ** 2 * 2.5, 0.05), str(tor["volume"]))
check("torus is watertight", tor["watertight"])

print("=== bounds & errors ===")
big = g3d.mesh_report(g3d.build_mesh("box", {"a": 10000, "b": 3, "h": 4}))
check("dimension is clamped to MAX_DIM (50)",
      big["bounding_box"]["extents"][0] == 50.0, str(big["bounding_box"]["extents"]))
try:
    g3d.build_mesh("dodecahedron", {})
    check("an unknown solid raises Geometry3DError", False)
except g3d.Geometry3DError:
    check("an unknown solid raises Geometry3DError", True)
try:
    g3d.build_mesh("torus", {"R": 1, "r": 2})
    check("minor radius ≥ major radius is rejected", False)
except g3d.Geometry3DError:
    check("minor radius ≥ major radius is rejected", True)

print("=== arrays & exports ===")
arr = g3d.mesh_arrays(g3d.build_mesh("prism", {"n": 6, "r": 2, "h": 3}))
check("vertices array is flat xyz", len(arr["vertices"]) % 3 == 0 and len(arr["vertices"]) > 0)
check("indices reference only existing vertices",
      len(arr["indices"]) % 3 == 0
      and (max(arr["indices"]) < len(arr["vertices"]) // 3 if arr["indices"] else True))
check("triangles count matches the indices", arr["triangles"] * 3 == len(arr["indices"]))
stl, sname, smime = g3d.export_bytes(g3d.build_mesh("box", {}), "stl")
check("binary STL length rule holds (84 + 50n)",
      len(stl) > 84 and (len(stl) - 84) % 50 == 0, f"len={len(stl)}")
check("STL filename/mime", sname.endswith(".stl") and smime == "model/stl", f"{sname} {smime}")
glb, gname, gmime = g3d.export_bytes(g3d.build_mesh("sphere", {"r": 1}), "glb")
check("GLB magic is 'glTF'", glb[:4] == b"glTF", str(glb[:4]))
check("GLB filename/mime", gname.endswith(".glb") and gmime == "model/gltf-binary")
try:
    g3d.export_bytes(g3d.build_mesh("box", {}), "step")
    check("a non-STL/GLB format is rejected", False)
except g3d.Geometry3DError:
    check("a non-STL/GLB format is rejected", True)

print(f"\n{checks - failures}/{checks} GEOMETRY 3D MESH CHECKS PASSED")
if failures > 0:
    print(">>> 3D MESH SUITE FAILED <<<")
    sys.exit(1)