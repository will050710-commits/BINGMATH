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
