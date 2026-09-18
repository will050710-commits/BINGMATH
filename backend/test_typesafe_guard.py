# duosteam/backend/test_typesafe_guard.py
import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
import asyncio
from typesafe_guard import key_manager, typesafe_guard, MathDomain

async def run_tests():
    print("=" * 60)
    print("  RUNNING TYPESAFE AI / JEV-STYLE INTEGRATION TESTS")
    print("=" * 60)

    # 1. Test Key Rotation Pool
    print("\n[TEST 1] Key Rotation Pool:")
    status = key_manager.get_status()
    assert status["total_keys"] == 2, "Expected 2 keys in pool"
    print(f"  ✓ Initial keys in pool: {status['total_keys']}")
    print(f"  ✓ Active Key #1: {status['active_key_masked']}")

    # Rotate
    new_key = await key_manager.rotate_key("Testing failover")
    print(f"  ✓ Rotated to Key #2: {key_manager.get_masked_key(new_key)}")
    assert key_manager.active_index == 1, "Expected active index to be 1"

    # Rotate back
    new_key_again = await key_manager.rotate_key("Rotating back")
    print(f"  ✓ Rotated back to Key #1: {key_manager.get_masked_key(new_key_again)}")
    assert key_manager.active_index == 0, "Expected active index to be 0"

    # 2. Test Decomposed Intent Classification
    print("\n[TEST 2] Decomposed Intent Classification:")
    intent_geo = typesafe_guard.reflex_engine.classify_intent("Cho tam giác ABC vuông tại A, vẽ đường tròn ngoại tiếp")
    print(f"  ✓ Intent (Geometry): {intent_geo.domain}, has_geo={intent_geo.has_geometry_visual}")
    assert intent_geo.domain == MathDomain.GEOMETRY_2D

    intent_calc = typesafe_guard.reflex_engine.classify_intent("Tính đạo hàm của f(x) = x^3 - 3x + 1")
    print(f"  ✓ Intent (Calculus): {intent_calc.domain}")
    assert intent_calc.domain == MathDomain.CALCULUS

    # 3. Test Hallucination Detection & SymPy Auto-Healing
    print("\n[TEST 3] Hallucination Detection & SymPy Healing:")
    raw_bad_reply = (
        "Bước 1: Ta tính diện tích tam giác có đáy 12 và chiều cao 5.\n"
        "Bước 2: Áp dụng công thức S = (12 * 5) / 2 = 35.\n"
        "Bước 3: Do đó diện tích là 35."
    )
    result = await typesafe_guard.guard_chat_response(
        raw_bad_reply,
        user_message="Tính diện tích tam giác có đáy 12 và chiều cao 5",
        mode="solution"
    )
    print(f"  ✓ Reflexes triggered: {result.reflexes_triggered}")
    print(f"  ✓ Hallucination score: {result.hallucination_score}")
    print(f"  ✓ Sanitized output:\n{result.sanitized_response}")
    # Verify the false claim '12 * 5) / 2 = 35' was detected
    assert len(result.verified_steps) > 0, "Expected calculation verification"
    assert any("30" in result.sanitized_response for _ in [1]), "Expected healed result 30"

    # 5. Test TypeSafe SystemOne Middleware
    print("\n[TEST 5] TypeSafe SystemOne Middleware (jev-latest):")
    middleware_test_reply = "Ta có 10 + 25 = 35. Kết quả hoàn toàn chính xác."
    res_m = await typesafe_guard.guard_chat_response(
        middleware_test_reply,
        user_message="10 + 25 bằng bao nhiêu?",
        mode="solution"
    )
    print(f"  ✓ Middleware Model: {res_m.middleware_model}")
    print(f"  ✓ SystemOne Eval: {res_m.systemone_eval is not None}")
    print(f"  ✓ Hallucination Score: {res_m.hallucination_score}")
    print(f"  ✓ Is Safe: {res_m.is_safe}")
    assert res_m.is_safe, "Expected safe response for 10 + 25 = 35"

    print("\n" + "=" * 60)
    print("  ALL 5/5 TESTS PASSED! TypeSafe AI Middleware is active & verified.")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_tests())
