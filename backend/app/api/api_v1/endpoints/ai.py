from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict, Optional, Any
from app.services.ai_service import AIService
from pydantic import BaseModel

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = None

class SearchRequest(BaseModel):
    query: str

@router.post("/chat")
async def chat_with_assistant(request: ChatRequest):
    """
    Chat with the BeeYield AI Assistant.
    """
    try:
        response = await AIService.chat(request.message, request.history)
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
