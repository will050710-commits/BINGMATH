"""
test_duomath_space_agent.py
===========================
Offline + optional live test suite for GeometryVisionAgent, image_preprocessing
(Risk 3), and vision_cache (Risk 5).

By default (no flags), runs 100% offline in CI using a synthetic geometry PNG
and a temporary SQLite vision_cache DB. Pass `--live` to run against the live
Hugging Face Space / OpenRouter endpoint.
"""
import asyncio
import base64
import io
import os
import sys
import tempfile
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from PIL import Image, ImageDraw
from image_preprocessing import preprocess_image_b64
import vision_cache
from vision_agent import GeometryVisionAgent, DEFAULT_MODEL, DEFAULT_FALLBACK_MODELS


def _make_synthetic_diagram_b64(width: int = 800, height: int = 600) -> str:
    img = Image.new("RGB", (width, height), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.ellipse((150, 100, 550, 500), outline=(0, 0, 0), width=3)
    draw.line((150, 300, 650, 300), fill=(0, 0, 0), width=2)
    draw.polygon([(350, 100), (150, 300), (550, 300)], outline=(20, 20, 20))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")


async def run_offline_tests() -> None:
    print("=== TESTING GEOMETRY VISION AGENT & 2-TIER CACHE (OFFLINE) ===")

    # 1. Model ladder & free-tier invariant
    agent = GeometryVisionAgent(api_key="test-key-offline", model=DEFAULT_MODEL)
    assert agent.is_configured() is True, "Agent with api_key must be configured"
    assert agent.model.endswith(":free"), f"Primary vision model must be :free, got {agent.model}"
    for m in DEFAULT_FALLBACK_MODELS:
        assert m.endswith(":free") or m == "openrouter/free", f"Fallback model must be free tier: {m}"
    print("[OK] Free-tier vision model ladder verified.")

    # 2. Unconfigured agent fails open without raising
    unconf = GeometryVisionAgent(api_key="")
    unconf.hf_space_id = ""
    unconf.api_key = ""
    old_key = os.environ.pop("OPENROUTER_API_KEY", None)
    try:
        assert unconf.is_configured() is False
        res, ok = await unconf.extract_with_fallback(_make_synthetic_diagram_b64())
        assert res is None and ok is False
        print("[OK] Unconfigured agent gracefully returns (None, False).")
    finally:
        if old_key is not None:
            os.environ["OPENROUTER_API_KEY"] = old_key

    # 3. Aspect-preserving preprocessing + 2-tier cache hit skips network
    with tempfile.TemporaryDirectory() as tmpdir:
        old_db = vision_cache.CACHE_DB_PATH
        vision_cache.CACHE_DB_PATH = os.path.join(tmpdir, "test_vision_cache.db")
        try:
            vision_cache.init_cache_db()
            raw_b64 = _make_synthetic_diagram_b64(800, 600)
            std_b64, meta = preprocess_image_b64(raw_b64, with_grid=False)
            assert meta["orig_width"] == 800 and meta["orig_height"] == 600
            phash = vision_cache.compute_phash(std_b64)
            assert len(phash) == 16

            expected_text = "1. LABELED POINTS: A, B, C, O\n2. PRIMITIVES: Circle(O), Triangle(ABC)"
            vision_cache.set_cached(meta["sha256"], phash, expected_text, model_used=DEFAULT_MODEL)

            text, success = await agent.extract_with_fallback(raw_b64, media_type="image/png")
            assert success is True, "Cache hit should succeed without network"
            assert text == expected_text, f"Unexpected cached text: {text}"
            print("[OK] 2-tier vision cache hit returned structured primitives with 0 network calls.")
        finally:
            vision_cache.CACHE_DB_PATH = old_db

    print(">>> ALL VISION AGENT OFFLINE TESTS PASSED! <<<")


async def run_live_test() -> None:
    env_path = backend_dir / ".env"
    if env_path.exists():
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ[k.strip()] = v.strip()

    agent = GeometryVisionAgent()
    raw_b64 = _make_synthetic_diagram_b64()
    result, success = await agent.extract_with_fallback(
        image_data=raw_b64,
        media_type="image/png",
        user_hint="PA is tangent to circle O at A, OP = 4, angle APO = 30 degrees. Find radius of circle O.",
    )
    assert success is True and result and len(result) > 10
    print("LIVE VISION AGENT TEST PASSED!")


if __name__ == "__main__":
    if "--live" in sys.argv:
        asyncio.run(run_live_test())
    else:
        asyncio.run(run_offline_tests())
