"""
Vision Agent Module for DuoMath / DuoMCB
Specialized in extracting structured geometric primitives from complex mathematical diagrams
(especially Olympiad-level geometry) via free-tier vision-language models on OpenRouter.

Changes vs. the original version (mapped to the risk-mitigation plan):
  - Risk 3: every image is run through image_preprocessing.preprocess_image_b64()
    (aspect-preserving resize + letterbox pad) before it is sent anywhere.
  - Risk 5: a SHA-256 + perceptual-hash cache (vision_cache.py) is checked
    before any network call, and a small ordered list of confirmed-free
    OpenRouter models is tried in sequence so one model's rate limit
    doesn't stall the whole request.
  - Free-tier correctness fix: the default model now carries OpenRouter's
    `:free` suffix. The previous default (`qwen/qwen2.5-vl-72b-instruct`,
    no suffix) resolves to OpenRouter's normal PAID routing for that model
    — same model name, different (billed) route. This was silently
    violating the "free tier only" requirement even though nothing was
    visibly broken.

Public interface is unchanged: `GeometryVisionAgent(...).extract_with_fallback(...)`
still returns `(structured_text_or_None, success_bool)`, so both existing
call sites in main.py (the /chat endpoint and /api/geometry/preprocess)
work without modification.
"""

import os
import logging
from typing import Tuple, Optional, List
import httpx

from image_preprocessing import preprocess_image_b64
import vision_cache

logger = logging.getLogger("vision_agent")

SYSTEM_PROMPT = """You are a precise mathematical OCR and visual parsing system specializing in Olympiad geometry diagrams. 

Analyze the provided geometric diagram and return a structured text breakdown of every element present. Do NOT generate rendering code (e.g., Canvas, SVG, Python). 

Output your findings using the following schema:

1. LABELED POINTS: List every point identifier (e.g., A, B, C, O, H) along with its visual role (e.g., "A: Top vertex of triangle ABC", "O: Circumcenter").
2. PRIMITIVES & SHAPES:
   - Triangles, Quadrilaterals, Polygons: List vertices in order.
   - Circles: Identify centers, radii if indicated, and special types (e.g., "Incircle of △ABC", "Circumcircle passing through B, C, D, E").
   - Lines & Segments: List explicitly drawn lines, altitudes, medians, or angle bisectors.
3. SPATIAL & GEOMETRIC RELATIONS:
   - Tangencies (e.g., "Line AB is tangent to Circle Ω at point T").
   - Intersections (e.g., "Point P is the intersection of altitude AH and line BC").
   - Collinearity & Concyclicity (e.g., "Points X, Y, Z are collinear").
   - Perpendicular / Parallel indicators (e.g., "Segment AD ⊥ BC at D").
"""

# Confirmed-$0 OpenRouter models as of the free-tier audit behind this change.
# Keep this list ordered best-quality-first for THIS specific task (dense
# OCR + spatial reasoning over Olympiad diagrams with 10+ labeled points):
# large, DEDICATED vision-language models first, general-purpose multimodal
# models last as a floor rather than a default. This was regressed once
# already — a previous edit set DEFAULT_MODEL to minimax/minimax-m3:free
# (a general agentic/coding model) with nvidia/nemotron-3-nano-omni-30b-a3b
# (an explicitly small "nano", 3B-active-parameter model marketed as a
# *perception sub-agent* for handing off to a bigger reasoning model, not a
# standalone diagram parser) as the only fallback. Both technically accept
# image input, so this wasn't a hard crash — but neither is built for dense
# single-shot geometric OCR, which plausibly explains a real quality drop
# in recognition even though nothing was throwing errors. qwen2.5-vl-72b
# was NOT pulled from OpenRouter's free tier (re-verified live) — there
# was no forcing reason to have moved off it.
DEFAULT_MODEL = "inclusionai/ling-3.0-flash-vl:free"
DEFAULT_FALLBACK_MODELS = [
    "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
    "google/gemma-4-31b-it:free",
    "google/gemma-4-26b-a4b-it:free",
]


class GeometryVisionAgent:
    """
    Sends complex geometry images to a free-tier OpenRouter vision model
    and extracts structured spatial & geometric relationships, with a
    hash-based cache and a multi-model free-tier fallback chain in front
    of the network call.
    """

    OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
    DEFAULT_MODEL = DEFAULT_MODEL

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None,
                 fallback_models: Optional[List[str]] = None):
        self.api_key = api_key or os.environ.get("OPENROUTER_API_KEY", "")
        primary = model or os.environ.get("OPENROUTER_VISION_MODEL", self.DEFAULT_MODEL)

        env_fallbacks = os.environ.get("OPENROUTER_VISION_FALLBACK_MODELS", "")
        fb = fallback_models if fallback_models is not None else (
            [m.strip() for m in env_fallbacks.split(",") if m.strip()] or DEFAULT_FALLBACK_MODELS
        )

        # Dedupe while preserving order: primary first, then fallbacks.
        seen = set()
        self.models: List[str] = [m for m in ([primary] + list(fb)) if m and not (m in seen or seen.add(m))]
        self.model = self.models[0]  # kept for backward compatibility (code that reads `.model`)
        self.enabled = os.environ.get("VISION_AGENT_ENABLED", "true").lower() in ("true", "1", "yes")

        # Tier 1: Specialized Fine-Tuned DuoMath Vision Agent on Hugging Face ZeroGPU
        self.hf_space_id = os.environ.get("VISION_HF_SPACE_ID", "WilliamShakespear/duomath-qwen-vl-demo")
        self.hf_space_token = os.environ.get("VISION_HF_SPACE_TOKEN", "") or os.environ.get("HF_API_KEY", "")
        self._hf_client = None

    def is_configured(self) -> bool:
        """Check if either Hugging Face Space or OpenRouter API key is enabled."""
        if not self.enabled:
            return False
        if self.hf_space_id and self.hf_space_id.strip():
            return True
        api_key = self.api_key or os.environ.get("OPENROUTER_API_KEY", "")
        return bool(api_key and api_key.strip())

    async def _call_hf_space(self, b64_data: str, user_text: str) -> str:
        """Call fine-tuned DuoMath Qwen2.5-VL ZeroGPU Space."""
        import base64
        import tempfile
        import asyncio
        from gradio_client import Client, handle_file

        if self._hf_client is None:
            self._hf_client = Client(self.hf_space_id, token=self.hf_space_token or None)

        img_bytes = base64.b64decode(b64_data)
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp_f:
            tmp_f.write(img_bytes)
            tmp_path = tmp_f.name

        try:
            result = await asyncio.to_thread(
                self._hf_client.predict,
                image=handle_file(tmp_path),
                question=user_text,
                max_tokens=1024,
                temperature=0.1,
                api_name="/solve_geometry"
            )
            return str(result)
        finally:
            try:
                if os.path.exists(tmp_path):
                    os.remove(tmp_path)
            except Exception:
                pass

    async def _call_openrouter(self, model: str, image_url: str, user_text: str, api_key: str) -> str:
        headers = {
            "Authorization": f"Bearer {api_key}",
            "HTTP-Referer": "https://duomath.local",
            "X-Title": "DuoMath Olympiad Geometry Agent",
            "Content-Type": "application/json"
        }
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": [
                    {"type": "text", "text": user_text},
                    {"type": "image_url", "image_url": {"url": image_url}}
                ]}
            ],
            "temperature": 0.1,
            "max_tokens": 1500
        }
        async with httpx.AsyncClient(timeout=90.0) as client:
            resp = await client.post(self.OPENROUTER_URL, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            msg = data["choices"][0]["message"]
            return msg.get("content") or msg.get("reasoning") or ""

    async def extract_geometry_primitives(
        self,
        image_data: str,
        media_type: str = "image/jpeg",
        user_hint: str = ""
    ) -> str:
        """
        Preprocesses the image (aspect-preserving resize+pad), checks the
        cache, attempts our specialized fine-tuned Hugging Face Space first,
        and — on a miss/failure — walks self.models in order until one succeeds.
        """
        # Risk 3 — standardize the image before it goes anywhere.
        _with_grid = os.environ.get("VISION_GRID_OVERLAY", "false").lower() in ("true", "1", "yes")
        std_b64, meta = preprocess_image_b64(image_data, with_grid=_with_grid)
        phash = vision_cache.compute_phash(std_b64)

        # Risk 5 — cache check (skips ALL network calls on a hit).
        cached = vision_cache.get_cached(meta["sha256"], phash)
        if cached:
            logger.info(f"[VisionAgent] Cache hit (distance={cached.get('phash_distance', 0)}) — skipping network call.")
            return cached["vision_text"]

        user_text = (
            "Extract a complete, structured geometric breakdown of this diagram:\n"
            "1. LABELED POINTS: List every point letter visible and its role.\n"
            "2. PRIMITIVES: Circles, lines, altitudes, chords, tangents, secants.\n"
            "3. GIVEN VALUES & TEXT: Extract all explicit numbers, lengths, angles, formulas, or text labeled in the image.\n"
            "4. RELATIONS: Intersections, tangencies, collinearity, perpendicularities.\n"
            "Focus purely on faithful diagram extraction."
        )
        if user_hint:
            user_text += f"\nUser Problem / Context: {user_hint}"

        # Tier 1: Specialized Fine-Tuned DuoMath Qwen2.5-VL LoRA on Hugging Face ZeroGPU Space
        if self.hf_space_id:
            try:
                logger.info(f"[VisionAgent] Sending image to Fine-Tuned DuoMath Space ({self.hf_space_id})...")
                result = await self._call_hf_space(std_b64, user_text)
                if result and result.strip():
                    logger.info("[VisionAgent] Fine-Tuned Space successfully parsed geometry diagram.")
                    vision_cache.set_cached(meta["sha256"], phash, result.strip(), model_used=f"hf-space:{self.hf_space_id}")
                    return result.strip()
            except Exception as e:
                logger.warning(f"[VisionAgent] Fine-Tuned Space call failed: {e}. Falling back to OpenRouter models.")

        # Tier 2: OpenRouter free models fallback
        api_key = self.api_key or os.environ.get("OPENROUTER_API_KEY", "")
        if not api_key:
            raise ValueError("Both Fine-Tuned Space and OPENROUTER_API_KEY failed or are unconfigured.")

        image_url = f"data:{media_type};base64,{std_b64}"
        last_error: Optional[Exception] = None
        for candidate_model in self.models:
            try:
                logger.info(f"[VisionAgent] Sending image to {candidate_model} via OpenRouter...")
                result = await self._call_openrouter(candidate_model, image_url, user_text, api_key)
                if result and result.strip():
                    vision_cache.set_cached(meta["sha256"], phash, result.strip(), model_used=candidate_model)
                    return result.strip()
            except httpx.HTTPStatusError as e:
                last_error = e
                status = e.response.status_code if e.response is not None else "?"
                logger.warning(f"[VisionAgent] {candidate_model} returned HTTP {status} — trying next free model.")
                continue
            except Exception as e:
                last_error = e
                logger.warning(f"[VisionAgent] {candidate_model} failed ({e}) — trying next free model.")
                continue

        raise last_error or RuntimeError("All configured free vision models failed.")

    async def extract_with_fallback(
        self,
        image_data: str,
        media_type: str = "image/jpeg",
        user_hint: str = ""
    ) -> Tuple[Optional[str], bool]:
        """
        Attempts extraction across the free-model chain (see
        extract_geometry_primitives). If unconfigured or every model in the
        chain fails, returns (None, False) so the caller falls through to
        its own next tier (main.py sends the raw image to Gemini vision
        directly in that case).
        Returns: (structured_text_or_None, success_boolean)
        """
        if not self.is_configured():
            logger.info("[VisionAgent] OpenRouter Vision Agent is not configured or disabled. Skipping.")
            return None, False

        try:
            result = await self.extract_geometry_primitives(image_data, media_type, user_hint)
            if result and result.strip():
                logger.info("[VisionAgent] Successfully extracted geometry primitives.")
                return result.strip(), True
            return None, False
        except Exception as e:
            logger.warning(f"[VisionAgent] Failed across all free models: {e}. Falling back to default vision.")
            return None, False
