from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict, Optional, Any
from app.services.ai_service import AIService
from pydantic import BaseModel
from datetime import datetime
import pytz

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = None
    language: Optional[str] = 'EN'

class SearchRequest(BaseModel):
    query: str

@router.post("/chat")
async def chat_with_assistant(request: ChatRequest):
    """
    Chat with the BeeYield AI Assistant.
    """
    try:
        # Get current time in East Africa Time (EAT) for BeeYield HQ context
        eat_tz = pytz.timezone('Africa/Nairobi')
        now = datetime.now(eat_tz)
        current_time = now.strftime("%H:%M:%S")
        current_date = now.strftime("%A, %B %d, %Y")
        
        response = await AIService.chat(
            request.message, 
            request.history, 
            request.language,
            current_time=current_time,
            current_date=current_date
        )
        return {"response": response}
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

@router.get("/status")
def get_ai_status():
    """
    Get the status of the AI Assistant training/knowledge base.
    """
    return {
        "status": "active",
        "knowledge_base": "synced with database",
        "last_sync": "just now",
        "capabilities": ["beeyield_docs", "web_search", "traceability_data"]
    }
