"""
Label Studio Service – Smart Storyteller & label helpers.
Generates honey marketing descriptions from floral type (curated + optional AI).
"""
from typing import Optional
from app.core.config import settings

# Curated descriptions by floral type (PRD: "Acacia" -> "Sweet & Mild", etc.)
# Keys are normalized (lower, stripped); display name can differ.
HONEY_BLURB_BY_FLORAL: dict[str, str] = {
    "acacia": "Harvested from acacia groves, this honey offers delicate floral notes and a mild, sweet character—perfect for drizzling.",
    "lipowy": "Zbiór z pasiek wśród lipowych alei. Delikatny, kwiatowy miód o charakterystycznym aromacie lipy.",
    "lipa": "Zbiór z pasiek wśród lipowych alei. Delikatny, kwiatowy miód o charakterystycznym aromacie lipy.",
    "polyfloral": "A complex blend of wildflowers from our apiaries. Each jar captures the diversity of the season.",
    "multi-flower": "A complex blend of wildflowers from our apiaries. Each jar captures the diversity of the season.",
    "multiflower": "A complex blend of wildflowers from our apiaries. Each jar captures the diversity of the season.",
    "orange blossom": "Citrusy and bright. This honey carries the scent of orange groves and a clean, lingering finish.",
    "orange": "Citrusy and bright. This honey carries the scent of orange groves and a clean, lingering finish.",
    "spadziowy": "Miód spadziowy z drzew iglastych i liściastych—intensywny, lekko żywiczny smak.",
    "forest": "From forest margins and wild flora. Deep, robust flavour with hints of woodland herbs.",
    "heather": "Bold and aromatic, with the distinctive taste of heather moorland. A beekeeper favourite.",
    "manuka": "From New Zealand Leptospermum. Valued for its unique flavour and traditional use.",
    "rapeseed": "Light and mild, from rapeseed fields. Smooth and versatile for everyday use.",
    "rzepakowy": "Lekki, łagodny miód rzepakowy. Idealny do codziennego użytku.",
    "buckwheat": "Dark and full-bodied, with malty notes. A strong character honey.",
    "clover": "Classic and mild. Sweet, light, and widely loved.",
    "wildflower": "A blend of meadow and hedgerow blooms. Naturally variable and full of character.",
    "eucalyptus": "Distinctive, with a slight menthol note. Often from Mediterranean or Australian sources.",
    "lavender": "Floral and aromatic, with the calming scent of lavender fields.",
    "sunflower": "Golden and sunny. Mild sweetness from sunflower pollination.",
    "chestnut": "Strong, slightly bitter, with a long finish. From chestnut forests.",
    "thyme": "Herbaceous and aromatic. A taste of the Mediterranean.",
    "sourwood": "Delicate, with a subtle spice. A prized single-origin from Appalachia.",
    "tupelo": "Buttery and mild, with a unique floral character. From Southern US wetlands.",
}


def _normalize_floral(floral_type: Optional[str]) -> str:
    if not floral_type or not isinstance(floral_type, str):
        return ""
    return floral_type.strip().lower()


def get_blurb_simple(floral_type: Optional[str], location: Optional[str] = None) -> str:
    """
    Returns a curated marketing blurb for the given floral type (max ~140 chars for label).
    Uses HONEY_BLURB_BY_FLORAL; if not found, returns a generic line.
    Optionally prepends location for "Harvested from X" style.
    """
    key = _normalize_floral(floral_type)
    if not key:
        return "Pure honey from our apiaries. Natural and unprocessed."
    # Exact match
    if key in HONEY_BLURB_BY_FLORAL:
        blurb = HONEY_BLURB_BY_FLORAL[key]
    else:
        # Substring match (e.g. "Acacia groves of Kiambu" -> acacia)
        for k, v in HONEY_BLURB_BY_FLORAL.items():
            if k in key or key in k:
                blurb = v
                break
        else:
            blurb = f"Pure {floral_type.strip()} honey from our apiaries. Natural and unprocessed."
    # Trim to ~140 chars for label "Marketing note"
    if len(blurb) > 140:
        blurb = blurb[:137].rsplit(" ", 1)[0] + "..."
    return blurb


async def generate_blurb_smart(
    floral_type: Optional[str],
    location: Optional[str] = None,
    harvest_year: Optional[str] = None,
    use_ai: bool = True,
) -> str:
    """
    Smart Storyteller: either returns curated blurb or generates one via AI (Gemini/OpenAI).
    use_ai=False: always use curated/simple logic.
    use_ai=True: try AI for richer text when API keys are available; fallback to curated.
    """
    simple = get_blurb_simple(floral_type, location)
    if not use_ai:
        return simple

    floral_display = (floral_type or "polyfloral").strip()
    location_part = f", location: {location}" if location else ""
    year_part = f", harvest year: {harvest_year}" if harvest_year else ""

    prompt = (
        f"Write a single short marketing sentence for honey label (max 140 characters). "
        f"Honey type: {floral_display}{location_part}{year_part}. "
        f"Tone: appealing, natural, producer-friendly. No hashtags or bullet points. "
        f"Example style: 'Harvested from the Acacia groves of Kiambu, this honey offers delicate floral notes...'"
    )

    # Prefer Gemini (already used in ai_service), then OpenAI
    google_key = getattr(settings, "GOOGLE_API_KEY", None)
    if google_key:
        try:
            from google import genai
            from google.genai import types
            client = genai.Client(api_key=google_key)
            resp = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=[prompt],
                config=types.GenerateContentConfig(temperature=0.5, max_output_tokens=150),
            )
            if resp and resp.text:
                text = resp.text.strip().strip('"')
                if len(text) <= 145:
                    return text[:140]
                return text[:137].rsplit(" ", 1)[0] + "..."
        except Exception:
            pass

    openai_key = getattr(settings, "OPENAI_API_KEY", None)
    if openai_key and not openai_key.startswith("sk-proj-REPLACE"):
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                r = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {openai_key}", "Content-Type": "application/json"},
                    json={
                        "model": "gpt-4o-mini",
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.5,
                        "max_tokens": 150,
                    },
                    timeout=15.0,
                )
                data = r.json()
                if "choices" in data and data["choices"]:
                    text = (data["choices"][0].get("message", {}).get("content") or "").strip().strip('"')
                    if text and len(text) <= 145:
                        return text[:140]
                    if text:
                        return text[:137].rsplit(" ", 1)[0] + "..."
        except Exception:
            pass

    return simple
