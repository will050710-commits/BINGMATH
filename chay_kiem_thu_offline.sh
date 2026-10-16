#!/usr/bin/env bash
# chay_kiem_thu_offline.sh — chạy các suite kiểm thử & benchmark của backend DuoMCB.
# Cách dùng: đặt file này ở thư mục gốc repo (duosteam / BINGMATH) rồi chạy:  bash chay_kiem_thu_offline.sh
# Kết quả: bảng PASS/FAIL ở cuối + log từng suite trong thư mục ./_evidence_logs
set -u
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT/backend" || { echo "Không thấy thư mục backend/ — hãy đặt script ở gốc repo"; exit 2; }

PY="${PYTHON:-python3}"
LOGDIR="$ROOT/_evidence_logs"; mkdir -p "$LOGDIR"

echo ">> Cài phụ thuộc test (nếu thiếu)..."
$PY -m pip install -q numpy sympy pillow opencv-python-headless shapely fsrs pydantic fastapi httpx \
    slowapi json-repair trimesh orjson "PyJWT[crypto]" cryptography 2>&1 | tail -1

SUITES=(
  test_geometry_snapping test_geometry_verification test_geometry_analytic_checks
  test_geometry_construction_solver test_geometry_pipeline test_geometry3d_mesh
  test_mathviz test_mathviz_contract test_diagram_complexity test_geogebra_export
  test_math_reader test_math_solver test_typesafe_guard test_vnhsge_bank test_fsrs_scheduler
  test_chat_budget test_chat_routing test_fallback_policy test_key_pool test_token_meter
  test_math_concepts test_retrieval_hybrid test_retrieval_dense
)

pass=0; fail=0; rows=()
for s in "${SUITES[@]}"; do
  timeout 300 $PY "$s.py" > "$LOGDIR/$s.log" 2>&1; rc=$?
  last="$(grep -E "passed|PASSED|FAILED" "$LOGDIR/$s.log" | tail -n 1 | cut -c1-90)"
  if [ $rc -eq 0 ]; then pass=$((pass+1)); st="PASS"; else fail=$((fail+1)); st="FAIL"; fi
  rows+=("$(printf '%-4s %-36s %s' "$st" "$s" "$last")")
done

echo; echo ">> Đánh giá (eval: Hồi quy 30 câu + Chống kiến thức sai 48 ca + Benchmark độc lập 60 câu + RAG)"
$PY tests/eval_math_regression.py > "$LOGDIR/eval_math_regression.log" 2>&1
grep -E "Total|Accuracy" "$LOGDIR/eval_math_regression.log" | tail -n 2

$PY tests/eval_hallucination.py --offline-only > "$LOGDIR/eval_hallucination.log" 2>&1
grep -E "Total Cases|Confusion Matrix|Overall Accuracy|Precision / F1" "$LOGDIR/eval_hallucination.log"

$PY tests/eval_external_benchmark.py --n-per-math-subject 10 --n-vi 20 --n-omni 20 --resume > "$LOGDIR/eval_external_benchmark.log" 2>&1
grep -E "Total Independent|Raw LLM Baseline|DuoMath Guarded|Hendrycks_MATH|Omni_MATH|Vi_MetaMath" "$LOGDIR/eval_external_benchmark.log"

for m in sparse hybrid; do
  $PY tests/eval_rag.py --mode "$m" > "$LOGDIR/eval_rag_$m.log" 2>&1
  echo "--- eval_rag mode=$m"; grep -E "Recall@1|MRR|false positives|concept recall" "$LOGDIR/eval_rag_$m.log"
done

echo; echo "================ KẾT QUẢ ================"
printf '%s\n' "${rows[@]}"
echo "Tổng: $pass PASS / $fail FAIL (log: $LOGDIR)"
[ $fail -eq 0 ]
