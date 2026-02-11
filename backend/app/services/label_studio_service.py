"""
Label Studio Service - label helpers.
"""
from typing import Optional
from app.core.config import settings

HONEY_BLURB_BY_FLORAL: dict[str, str] = {
    "acacia": "Delicate and water-white, harvested from sun-drenched acacia groves. A mild, elegant sweetness for the discerning palate.",
    "multi-flower": "A vibrant tapestry of local flora, cold-extracted to preserve its complex, multi-layered floral notes.",
    "multiflower": "A vibrant tapestry of local flora, cold-extracted to preserve its complex, multi-layered floral notes.",
    "polyfloral": "A vibrant tapestry of local flora, cold-extracted to preserve its complex, multi-layered floral notes.",
    "forest": "Rich, dark, and robust. Harvested from ancient woodland margins, offering deep notes of malt and wild herbs.",
    "wildflower": "Naturally variable and full of life. A classic meadow harvest that captures the essence of the season.",
    "eucalyptus": "Bold and clean with a refreshing herbal finish. Truly unique character from native nectar sources.",
    "lavender": "Exquisitely aromatic, carrying the soft floral scent and calming essence of blooming lavender fields.",
    "sunflower": "Bright and buttery with a velvety texture. Naturally high in glucose, perfect for morning pastries.",
    "clover": "Silky smooth and gently sweet. A timeless delicate classic favored for its clean finishing notes.",
    "buckwheat": "A masterstroke of intensity. Earthy and malty with a powerful aromatic profile and deep amber hue.",
}


def _safe_text(value: Optional[str]) -> str:
    if value is None:
        return ""
    return str(value).strip()


def _normalize_floral(floral_type: Optional[str]) -> str:
    if not floral_type or not isinstance(floral_type, str):
        return ""
    return floral_type.strip().lower()


def get_blurb_simple(floral_type: Optional[str], location: Optional[str] = None) -> str:
    key = _normalize_floral(floral_type)
    if not key:
        return "Pure honey from our apiaries. Natural and unprocessed."

    if key in HONEY_BLURB_BY_FLORAL:
        blurb = HONEY_BLURB_BY_FLORAL[key]
    else:
        blurb = None
        for k, v in HONEY_BLURB_BY_FLORAL.items():
            if k in key or key in k:
                blurb = v
                break
        if not blurb:
            blurb = f"Pure {floral_type.strip()} honey from our apiaries. Natural and unprocessed."

    if location:
        blurb = f"Harvested in {location}. {blurb}"

    if len(blurb) > 140:
        blurb = blurb[:137].rsplit(" ", 1)[0] + "..."
    return blurb


async def generate_blurb_smart(
    floral_type: Optional[str],
    location: Optional[str] = None,
    harvest_year: Optional[str] = None,
    use_ai: bool = True,
) -> str:
    simple = get_blurb_simple(floral_type, location)
    if not use_ai:
        return simple

    floral_display = (floral_type or "polyfloral").strip()
    location_part = f", location: {location}" if location else ""
    year_part = f", harvest year: {harvest_year}" if harvest_year else ""
    prompt = (
        "Write a single short marketing sentence for a honey label (max 140 characters). "
        f"Honey type: {floral_display}{location_part}{year_part}. "
        "Tone: appealing, natural, producer-friendly. No hashtags or bullet points."
    )

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


def generate_label_pdf(payload: dict) -> bytes:
    """
    Generate a simple label PDF from payload data.
    Raises RuntimeError if reportlab is not installed.
    """
    return generate_advanced_label_pdf(payload)


def generate_advanced_label_pdf(payload: dict) -> bytes:
    """
    Generate a professional label PDF with full styling support.
    Matches the React frontend preview logic.
    """
    try:
        from io import BytesIO
        from reportlab.lib.units import mm
        from reportlab.pdfgen import canvas
        from reportlab.lib import colors
        from reportlab.lib.colors import HexColor
        from reportlab.lib.utils import ImageReader
    except Exception as exc:
        raise RuntimeError("reportlab is required to generate label PDFs") from exc

    import httpx

    # 1. Setup Dimensions & Canvas
    width_mm = float(payload.get("customWidth") or payload.get("width_mm") or 99.1)
    height_mm = float(payload.get("customHeight") or payload.get("height_mm") or 57)
    width = width_mm * mm
    height = height_mm * mm

    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=(width, height))

    # 2. Styles & Colors
    bg_color_hex = payload.get("backgroundColor") or "#FFFFFF"
    text_color_hex = payload.get("textColor") or "#000000"
    accent_color_hex = payload.get("accentColor") or "#F5A623"
    
    bg_color = HexColor(bg_color_hex)
    text_color = HexColor(text_color_hex)
    accent_color = HexColor(accent_color_hex)
    
    shape = payload.get("customShape") or "Rectangle"
    border_style = payload.get("borderStyle")

    # 3. Draw Background & Shape
    c.saveState()
    if shape == "Circle":
        # Draw circular background
        radius = min(width, height) / 2
        c.setFillColor(bg_color)
        c.circle(width/2, height/2, radius, stroke=0, fill=1)
        # Clip to circle
        path = c.beginPath()
        path.circle(width/2, height/2, radius)
        c.clipPath(path, stroke=0)
    elif shape == "Oval":
        c.setFillColor(bg_color)
        c.ellipse(2, 2, width-2, height-2, stroke=0, fill=1)
        path = c.beginPath()
        path.ellipse(2, 2, width-2, height-2)
        c.clipPath(path, stroke=0)
    else:
        c.setFillColor(bg_color)
        c.rect(0, 0, width, height, stroke=0, fill=1)

    # 4. Draw Border
    if border_style == "elegant":
        c.setStrokeColor(accent_color)
        c.setLineWidth(1.5)
        # Double border effect
        padding = 4 * mm
        c.rect(padding, padding, width - 2*padding, height - 2*padding, stroke=1, fill=0)
        c.setLineWidth(0.5)
        c.rect(padding + 1*mm, padding + 1*mm, width - 2*(padding + 1*mm), height - 2*(padding + 1*mm), stroke=1, fill=0)

    # 5. Draw Logo
    show_logo = payload.get("showLogo", True)
    logo_url = payload.get("logoUrl")
    logo_scale = float(payload.get("logoScale") or 1.0)
    
    if show_logo and logo_url:
        try:
            # Handle data URLs (base64) or regular URLs
            if logo_url.startswith("data:"):
                import base64
                header, encoded = logo_url.split(",", 1)
                img_data = base64.b64decode(encoded)
                img = ImageReader(BytesIO(img_data))
            else:
                # Simple fetch for web URLs
                with httpx.Client() as client:
                    resp = client.get(logo_url, timeout=5.0)
                    if resp.status_code == 200:
                        img = ImageReader(BytesIO(resp.content))
                    else:
                        img = None
            
            if img:
                logo_h = 10 * mm * logo_scale
                logo_w, original_h = img.getSize()
                aspect = logo_w / original_h
                logo_display_w = logo_h * aspect
                c.drawImage(img, width - logo_display_w - 6*mm, height - logo_h - 6*mm, width=logo_display_w, height=logo_h, mask='auto')
        except Exception as e:
            print(f"Error drawing logo: {e}")

    # 6. Content Rendering
    c.setFillColor(text_color)
    
    # Product Name (H1)
    product_name = payload.get("productName") or "Honey"
    c.setFont("Helvetica-Bold", 18)
    c.setFillColor(accent_color)
    c.drawString(8 * mm, height - 12 * mm, product_name.upper())
    
    # Honey Type
    honey_type = f"{payload.get('honeyType') or 'Wildflower'} Honey"
    c.setFont("Helvetica-Oblique", 10)
    c.setFillColor(text_color)
    c.drawString(8 * mm, height - 17 * mm, honey_type)

    # Marketing Blurb
    marketing = payload.get("marketingNote") or ""
    if marketing:
        c.setFont("Helvetica-Oblique", 7)
        c.setFillColor(text_color)
        # Simple wrapping
        words = marketing.split()
        lines = []
        curr_line = []
        for w in words:
            if len(" ".join(curr_line + [w])) < 50:
                curr_line.append(w)
            else:
                lines.append(" ".join(curr_line))
                curr_line = [w]
        lines.append(" ".join(curr_line))
        
        y_text = height - 25 * mm
        for line in lines[:3]: # Max 3 lines
            c.drawString(8 * mm, y_text, line)
            y_text -= 3 * mm

    # Main Info Section (Producer, Address)
    y_pos = 20 * mm
    c.setStrokeColor(accent_color)
    c.setAlpha(0.3)
    c.setLineWidth(0.2)
    c.line(8 * mm, y_pos, width - 8 * mm, y_pos)
    c.setAlpha(1.0)
    
    y_pos -= 4 * mm
    c.setFont("Helvetica-Bold", 7)
    producer = payload.get("producer") or ""
    c.setFillColor(text_color)
    c.drawString(8 * mm, y_pos, producer.upper())
    
    y_pos -= 3 * mm
    c.setFont("Helvetica", 6)
    address = payload.get("address") or ""
    c.drawString(8 * mm, y_pos, address)
    
    y_pos -= 3 * mm
    country = payload.get("country") or ""
    c.drawString(8 * mm, y_pos, country)

    # Weight (Highlighted)
    weight_str = f"{payload.get('weight') or '500'}{payload.get('weightUnit') or 'g'}"
    c.setFont("Helvetica-Bold", 16)
    c.setFillColor(text_color)
    c.drawRightString(width - 8 * mm, 14 * mm, weight_str)
    c.setFont("Helvetica-Bold", 6)
    c.drawRightString(width - 8 * mm, 11 * mm, "NET WEIGHT")

    # Batch & Best Before (Small text at bottom)
    if payload.get("showBatchNumber") or payload.get("showBestBefore"):
        y_bottom = 8 * mm
        c.setFont("Helvetica-Bold", 5)
        c.setFillColor(text_color)
        if payload.get("showBatchNumber"):
            batch = payload.get("batchNumber") or "N/A"
            c.drawString(8 * mm, y_bottom, f"LOT: {batch}")
        
        if payload.get("showBestBefore"):
            best_before = payload.get("bestBeforeDate") or "See lid"
            c.drawRightString(width - 8 * mm, y_bottom, f"BEST BEFORE: {best_before}")

    # Footer
    if payload.get("showFooter"):
        c.setFont("Helvetica", 4)
        c.drawCentredString(width/2, 4 * mm, f"BeeYield Traceability System • {payload.get('harvestYear') or '2025'}")

    c.restoreState()
    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer.read()
