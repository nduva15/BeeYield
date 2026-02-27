from fastapi import APIRouter, HTTPException, Body
from typing import Optional, Any
from app.services.ai_service import AIService
from pydantic import BaseModel
from datetime import datetime
import pytz

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    history: Optional[list[dict[str, str]]] = None
    language: Optional[str] = 'EN'

class SearchRequest(BaseModel):
    query: str

class BlurbRequest(BaseModel):
    floral_type: str
    location: str
    harvest_year: str
    tone: Optional[str] = "luxury"

@router.post("/chat")
async def chat_with_assistant(request: ChatRequest):
    """
    Chat endpoint.
    """
    try:
        # Get current time in East Africa Time (EAT) for BeeYield HQ context
        eat_tz = pytz.timezone('Africa/Nairobi')
        now = datetime.now(eat_tz)
        current_time = now.strftime("%H:%M:%S")
        current_date = now.strftime("%A, %B %d, %Y")
        
        ai_data = await AIService.chat(
            request.message, 
            request.history, 
            request.language,
            current_time=current_time,
            current_date=current_date
        )
        return ai_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/search")
async def search_web(request: SearchRequest):
    """
    Simulate a web search for the assistant.
    """
    try:
        results = await AIService.search_google(request.query)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-blurb")
async def generate_blurb(request: BlurbRequest):
    """
    Generate a marketing blurb for honey labels.
    """
    try:
        blurb = await AIService.generate_marketing_blurb(
            floral_type=request.floral_type,
            location=request.location,
            harvest_year=request.harvest_year,
            tone=request.tone
        )
        return {"blurb": blurb}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
def get_ai_status():
    """
    Get system status.
    """
    return {
        "status": "active",
        "knowledge_base": "synced with database",
        "last_sync": "just now",
        "capabilities": ["beeyield_docs", "web_search", "history_data"]
    }
