# duosteam/backend/test_phase1_grading.py
#
# Phase 1 regression tests — run: python test_phase1_grading.py
#
# Covers audit finding P1-8 (client-computed score / answer key in the bundle)
# and P2-12/P2-13 (f-string SQL, sympify on untrusted input).
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from grading import (  # noqa: E402
    answer_key_stats,
    answers_equivalent,
    grade_section,
    known_test,
    safe_symbolic_parse,
)
from sql_guard import UnsafeSqlColumn, safe_update_columns  # noqa: E402


def test_answer_key_loaded():
    print("\n[TEST 1] server-side answer key")
    stats = answer_key_stats()
    assert stats["exams"] >= 30, f"expected >=30 exams, got {stats['exams']}"
    assert stats["questions"] >= 600, f"expected >=600 questions, got {stats['questions']}"
    assert known_test("reading-test-1") and known_test("reading-test-L11-1")
    assert not known_test("nope-not-a-test")
    print(f"  ✓ {stats['exams']} exams / {stats['questions']} questions loaded server-side")


def test_value_based_grading():
    print("\n[TEST 2] answers are compared by mathematical value")
    true_cases = [
        ("1/2", "0.5"),
        ("0.5", "1/2"),
        ("x=1/2", "1/2"),
        ("1/2", "x = 1/2"),
        ("2x", "2*x"),
        ("√3/2", "sqrt(3)/2"),
        ("B. describe the process", "B"),
        ("b", "B"),
        ("true", "TRUE"),
        ("notgiven", "NOT GIVEN"),
        ("24", "24"),
        ("5x+12y−17=0", "5x+12y-17=0"),          # unicode minus
        ("  [ -5/3 , 1 ]  ", "[-5/3,1]"),
    ]
    for user, key in true_cases:
        assert answers_equivalent(user, key), f"should be EQUAL: {user!r} vs {key!r}"

    false_cases = [
        ("1/3", "1/2"),
        ("A", "B"),
        ("", "1"),
        (None, "1"),
        ("24", "42"),
        ("TRUE", "FALSE"),
    ]
    for user, key in false_cases:
        assert not answers_equivalent(user, key), f"should NOT be equal: {user!r} vs {key!r}"
    print(f"  ✓ {len(true_cases)} equivalent pairs accepted, {len(false_cases)} wrong answers rejected")


def test_server_grade_ignores_client_score():
    print("\n[TEST 3] server grades the section itself")
    # reading-test-1 / section1 keys are MCQ letters (p1q1=B, p1q3=C, ...).
    graded = grade_section("reading-test-1", "section1", {"p1q1": "B", "p1q2": "C"})
    assert graded is not None
    assert graded["total"] == 10, f"expected 10 questions in section1, got {graded['total']}"
    assert graded["score"] == 1, f"p1q1 correct + p1q2 wrong => 1, got {graded['score']}"
    assert graded["accuracy"] == 10.0

    # numeric section: "1-0" -> [-5/3,1]
    graded3 = grade_section("reading-test-1", "section3", {"1-0": "[-5/3,1]", "1-1": "5"})
    assert graded3["score"] == 1, f"expected 1 correct, got {graded3['score']}"

    assert grade_section("reading-test-1", "section9", {}) is None
    assert grade_section("unknown-test", "section1", {}) is None
    print("  ✓ score/total/accuracy come from the server key; unknown keys rejected")


def test_sql_guard():
    print("\n[TEST 4] dynamic SQL is allowlisted")
    sql = safe_update_columns(["username", "phone"], {"username", "phone", "grade"})
    assert sql == "username=?, phone=?", sql
    for bad in (["username; DROP TABLE users"], ["password"], [], ["username", "username"]):
        try:
            safe_update_columns(bad, {"username", "phone"})
        except UnsafeSqlColumn:
            continue
        raise AssertionError(f"not rejected: {bad}")
    print("  ✓ only allowlisted columns can reach the UPDATE statement")


def test_safe_symbolic_parse():
    print("\n[TEST 5] tool expression parser is restricted")
    from sympy import Rational
    assert safe_symbolic_parse("integrate(x**2, (x, 0, 1))") == Rational(1, 3)
    assert safe_symbolic_parse("sqrt(3)/2 + sin(pi/6)") is not None
    for payload in ("__import__('os').system('ls')", "open('/etc/passwd')", "() .__class__"):
        try:
            safe_symbolic_parse(payload)
        except Exception:
            continue
        raise AssertionError(f"payload accepted: {payload!r}")
    print("  ✓ math expressions parse, code-execution payloads rejected")


if __name__ == "__main__":
    print("=" * 62)
    print("  PHASE 1 GRADING & SQL-GUARD TESTS")
    print("=" * 62)
    test_answer_key_loaded()
    test_value_based_grading()
    test_server_grade_ignores_client_score()
    test_sql_guard()
    test_safe_symbolic_parse()
    print("\n" + "=" * 62)
    print("  ALL PHASE 1 TESTS PASSED")
    print("=" * 62)
