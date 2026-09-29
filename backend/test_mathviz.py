import sys, os
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.dirname(__file__))
from main import detect_widget, cached_system_prompt, validate_mathviz, _extract_mathviz_block

test_queries = [
    ('Cho hình chóp tứ giác đều S.ABCD, cạnh đáy 4, cao 6', 'geometry_3d'),
    ('Khảo sát sự biến thiên và vẽ đồ thị hàm số y = x^2 - 4x + 3', 'function_plot'),
    ('Vẽ vòng tròn lượng giác và đồ thị hàm số sin(x)', 'unit_circle_wave'),
    ('Cho tam giác ABC có A(1, 2), B(3, 4), C(5, 0)', 'geometry_2d'),
    ('Giải hệ bất phương trình bậc nhất 2 ẩn và tìm miền nghiệm', 'inequality_region'),
    ('Cho tập hợp A = {1, 2, 3} và B = {2, 3, 4}, tìm giao của hai tập', 'venn_sets'),
    ('Tìm số hạng thứ 10 của cấp số cộng với u1 = 2, d = 3', 'sequence_series'),
    ('Cho số phức z = 3 + 4i, tính môđun của z', 'complex_plane'),
    ('Tính xác suất trong phân phối nhị thức B(10, 0.5)', 'distribution'),
    ('Phương pháp học toán hiệu quả là gì?', None)
]

print('=== TESTING WIDGET DETECTION ===')
for q, expected in test_queries:
    res = detect_widget(q)
    status = 'OK' if res == expected else f'MISMATCH (got {res}, expected {expected})'
    print(f'[{status}] "{q[:45]}..." -> {res}')
    assert res == expected, f'Expected {expected}, got {res}'

prompt_with_viz = cached_system_prompt('solution', 'geometry_3d')
assert 'geometry_3d' in prompt_with_viz
assert 'QUY TẮC TRỰC QUAN HÓA' in prompt_with_viz
print('\n=== SYSTEM PROMPT INJECTION: OK ===')

# Đợt 8 / 4I: the model must be taught the SAME vocabulary the validator and the
# renderers enforce. Until this, geometry_2d's prompt taught four kinds
# (circle/polygon/line/points) while JSXGraph already drew arc/angle/ray/polyline
# — so a figure with an arc, a sector or a shaded region came back with those
# layers simply missing and nothing said about it.
import mathviz_contract as _mc
for _variant in ('text', 'solution', 'visualizer', 'image_with_vision'):
    _geo_prompt = cached_system_prompt(_variant, 'geometry_2d')
    _missing = sorted(k for k in _mc.LAYER_KINDS if k not in _geo_prompt)
    assert not _missing, f"variant '{_variant}' does not teach {_missing}"
    assert 'KHÔNG bịa kind mới' in _geo_prompt, f"variant '{_variant}' misses the no-invented-kind rule"
print('=== GEOMETRY VOCABULARY TAUGHT IN EVERY VARIANT: OK ===')

_arc_prompt = cached_system_prompt('solution', 'geometry_2d')
assert '"kind":"arc"' in _arc_prompt and '"kind":"region"' in _arc_prompt, \
    'the tangent-arc example (the reported figure) must be in the prompt'
print('=== TANGENT-ARC EXAMPLE PRESENT: OK ===')


def _validate_invented_kind_is_caught():
    """A kind no renderer can draw must be a VALIDATION error, not a silent drop.

    That is what makes the two existing repair tiers (a same-model retry, then the
    free-tier JSON repair) actually run for this class of figure.
    """
    bad = {"type": "mathviz.v1", "widget": "geometry_2d", "layers": [
        {"kind": "spiral_of_archimedes", "turns": 4}]}
    errs = validate_mathviz("geometry_2d", bad)
    assert any("kind không hợp lệ" in e for e in errs), errs

    dangling = {"type": "mathviz.v1", "widget": "geometry_2d", "layers": [
        {"kind": "circle", "center": {"id": "O", "x": 0, "y": 0}, "r": 1,
         "through_3pts": ["A", "B", "C"]}]}
    errs2 = validate_mathviz("geometry_2d", dangling)
    assert any("chưa khai báo" in e for e in errs2), errs2

    bad_type = {"type": "mathviz.v1", "widget": "geometry_2d", "layers": [
        {"kind": "points", "data": [{"id": "A", "x": 0, "y": 0},
                                    {"id": "B", "x": 1, "y": 0},
                                    {"id": "C", "x": 0, "y": 1}]}],
        "constructions": [{"point": "H", "type": "spiral_center", "of": ["A", "B", "C"]}]}
    errs3 = validate_mathviz("geometry_2d", bad_type)
    assert any("chưa hỗ trợ" in e for e in errs3), errs3

    ok = {"type": "mathviz.v1", "widget": "geometry_2d", "mode": "composite", "layers": [
        {"kind": "points", "data": [{"id": "A", "x": 0, "y": 0},
                                    {"id": "B", "x": 1, "y": 0},
                                    {"id": "C", "x": 0, "y": 1}]},
        {"kind": "arc", "center": {"id": "A", "x": 0, "y": 0},
         "from": {"id": "B", "x": 1, "y": 0}, "to": {"id": "C", "x": 0, "y": 1}},
    ]}
    assert validate_mathviz("geometry_2d", ok) == [], validate_mathviz("geometry_2d", ok)
    print('=== INVENTED KIND / DANGLING POINT ARE NOW VALIDATION ERRORS: OK ===')


_validate_invented_kind_is_caught()

raw_sample = '''Đây là lời giải:
1. Thể tích hình chóp...
```mathviz
{"type": "mathviz.v1", "widget": "geometry_3d", "title": "Hình chóp", "solid": "square_pyramid", "dims": {"a": 4, "h": 6}}
```
'''
text, block = _extract_mathviz_block(raw_sample)
assert block is not None
assert block['widget'] == 'geometry_3d'
errs = validate_mathviz('geometry_3d', block)
assert len(errs) == 0, f'Validation errors: {errs}'
print('=== MATHVIZ EXTRACTION & VALIDATION: OK ===')
print('\n>>> ALL 9 WIDGET ROUTING & VALIDATION TESTS PASSED! <<<')
