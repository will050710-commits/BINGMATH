import os
import sys
import base64
import asyncio
from pathlib import Path

backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

env_path = backend_dir / ".env"
if env_path.exists():
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ[k.strip()] = v.strip()

from vision_agent import GeometryVisionAgent

async def run_test():
    print("=" * 70)
    print("TEST: INTEGRATING DUOMATH QWEN-VL ZERO-GPU SPACE INTO BACKEND")
    print("=" * 70)
    
    agent = GeometryVisionAgent()
    print("HF Space ID:", agent.hf_space_id)
    print("Is Configured:", agent.is_configured())
    
    img_path = backend_dir.parent.parent / "space_demo" / "examples" / "geom_tangent_circle.png"
    if not img_path.exists():
        img_path = Path("space_demo/examples/geom_tangent_circle.png")
    
    print("Reading image file:", img_path)
    with open(img_path, "rb") as f:
        raw_b64 = base64.b64encode(f.read()).decode("utf-8")
        
    print("Calling extract_with_fallback...")
    result, success = await agent.extract_with_fallback(
        image_data=raw_b64,
        media_type="image/png",
        user_hint="PA is tangent to circle O at A, OP = 4, angle APO = 30 degrees. Find radius of circle O."
    )
    
    print("Success:", success)
    print("-" * 70)
    print("RESPONSE FROM VISION AGENT:")
    sys.stdout.buffer.write(result.encode("utf-8"))
    print()
    print("=" * 70)
    assert success is True, "Extraction failed!"
    assert result and len(result) > 10, "Result is empty!"
    print("ALL INTEGRATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(run_test())
