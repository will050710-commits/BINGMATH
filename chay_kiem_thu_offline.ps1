# chay_kiem_thu_offline.ps1 — bản PowerShell (Windows) của chay_kiem_thu_offline.sh
# Đặt ở thư mục gốc repo (duosteam / BINGMATH) rồi chạy:  powershell -ExecutionPolicy Bypass -File .\chay_kiem_thu_offline.ps1
# Nếu dùng venv: đặt $env:PYTHON = ".\.venv\Scripts\python.exe" trước khi chạy.
$ErrorActionPreference = "Continue"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $Root "backend")
$Py = if ($env:PYTHON) { $env:PYTHON } else { "python" }
$LogDir = Join-Path $Root "_evidence_logs"; New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
$env:PYTHONIOENCODING = "utf-8"

Write-Host ">> Cai phu thuoc test (neu thieu)..."
& $Py -m pip install -q numpy sympy pillow opencv-python-headless shapely fsrs pydantic fastapi httpx slowapi json-repair trimesh orjson "PyJWT[crypto]" cryptography | Out-Null

$Suites = @(
 "test_geometry_snapping","test_geometry_verification","test_geometry_analytic_checks",
 "test_geometry_construction_solver","test_geometry_pipeline","test_geometry3d_mesh",
 "test_mathviz","test_mathviz_contract","test_diagram_complexity","test_geogebra_export",
 "test_math_reader","test_math_solver","test_typesafe_guard","test_vnhsge_bank","test_fsrs_scheduler",
 "test_chat_budget","test_chat_routing","test_fallback_policy","test_key_pool","test_token_meter",
 "test_math_concepts","test_retrieval_hybrid","test_retrieval_dense"
)
$pass = 0; $fail = 0; $rows = @()
foreach ($s in $Suites) {
  $log = Join-Path $LogDir "$s.log"
  & $Py "$s.py" *> $log
  $ok = ($LASTEXITCODE -eq 0)
  $last = (Select-String -Path $log -Pattern "passed|PASSED|FAILED" | Select-Object -Last 1).Line
  if ($ok) { $pass++; $st = "PASS" } else { $fail++; $st = "FAIL" }
  $rows += ("{0,-4} {1,-36} {2}" -f $st, $s, $last)
}

Write-Host "`n>> Danh gia (eval: Hoi quy 30 cau + Chong kien thuc sai 48 ca + Benchmark doc lap 60 cau + RAG)"
& $Py tests/eval_math_regression.py *> (Join-Path $LogDir "eval_math_regression.log")
Select-String -Path (Join-Path $LogDir "eval_math_regression.log") -Pattern "Total|Accuracy" | Select-Object -Last 2 | ForEach-Object { $_.Line }

& $Py tests/eval_hallucination.py --offline-only *> (Join-Path $LogDir "eval_hallucination.log")
Select-String -Path (Join-Path $LogDir "eval_hallucination.log") -Pattern "Total Cases|Confusion Matrix|Overall Accuracy|Precision / F1" | ForEach-Object { $_.Line }

& $Py tests/eval_external_benchmark.py --n-per-math-subject 10 --n-vi 20 --n-omni 20 --resume *> (Join-Path $LogDir "eval_external_benchmark.log")
Select-String -Path (Join-Path $LogDir "eval_external_benchmark.log") -Pattern "Total Independent|Raw LLM Baseline|DuoMath Guarded|Hendrycks_MATH|Omni_MATH|Vi_MetaMath" | ForEach-Object { $_.Line }

foreach ($m in "sparse","hybrid") {
  $lg = Join-Path $LogDir "eval_rag_$m.log"
  & $Py tests/eval_rag.py --mode $m *> $lg
  Write-Host "--- eval_rag mode=$m"
  Select-String -Path $lg -Pattern "Recall@1|MRR|false positives|concept recall" | ForEach-Object { $_.Line }
}

Write-Host "`n================ KET QUA ================"
$rows | ForEach-Object { Write-Host $_ }
Write-Host "Tong: $pass PASS / $fail FAIL (log: $LogDir)"
exit ($(if ($fail -eq 0) { 0 } else { 1 }))
