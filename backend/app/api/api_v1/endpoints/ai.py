from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional

from app.services.ai_service import AIService


router = APIRouter()


class GenerateBlurbRequest(BaseModel):
    floral_type: str = Field(..., description="Honey floral/florage type (e.g., Acacia, Wildflower)")
    location: str = Field(..., description="Origin/location text (e.g., Kenya, Nyeri Highlands)")
    harvest_year: str = Field(..., description="Harvest year (e.g., 2026)")
    tone: Optional[str] = Field("luxury", description="Desired brand tone")


class LabelPack(BaseModel):
    product_name: str
    short_blurb: str
    long_story: str
    tasting_notes: List[str] = []
    origin: str
    harvest_date_range: str
    sustainability_claims: List[str] = []
    pairings: List[str] = []
    allergen_notes: str
    qr_landing_copy: str
    tone: str


class GenerateLabelPackRequest(BaseModel):
    floral_type: str = Field(..., description="Honey floral/florage type (e.g., Acacia, Wildflower)")
    location: str = Field(..., description="Origin/location text")
    harvest_year: str = Field(..., description="Harvest year")
    product_name: Optional[str] = Field(None, description="Optional product name override")
    tone: Optional[str] = Field("luxury", description="Desired brand tone")


@router.post("/generate-blurb", response_model=dict)
async def generate_blurb(payload: GenerateBlurbRequest):
    """
    Generates a short label blurb. Kept for backward compatibility with the frontend.
    """
    try:
        blurb = await AIService.generate_marketing_blurb(
            floral_type=payload.floral_type,
            location=payload.location,
            harvest_year=payload.harvest_year,
            tone=payload.tone or "luxury",
        )
        return {"blurb": blurb}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Blurb generation failed: {exc}")


@router.post("/generate-label-pack", response_model=LabelPack)
async def generate_label_pack(payload: GenerateLabelPackRequest):
    """
    Generates a structured "Label Pack" for the label generator UI.
    """
    try:
        pack = await AIService.generate_label_pack(
            floral_type=payload.floral_type,
            location=payload.location,
            harvest_year=payload.harvest_year,
            tone=payload.tone or "luxury",
            product_name=payload.product_name,
        )
        return LabelPack(**pack)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Label pack generation failed: {exc}")

