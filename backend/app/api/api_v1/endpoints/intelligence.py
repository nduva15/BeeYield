from fastapi import APIRouter, Depends
from typing import Any, Optional, Dict
from app.services.intelligence_hub import IntelligenceHub
from app.api.api_v1.endpoints.beeyield import get_user_id, get_token
from pydantic import BaseModel

router = APIRouter()

class AIActionRequest(BaseModel):
    action_type: str
    params: Dict[str, Any]

@router.get("/context")
async def get_ai_context(
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """
    Returns the 'Company Brain' context for the current user.
    Front-end can inject this into the AI prompt.
    """
    try:
        context = await IntelligenceHub.get_user_snapshot(user_id, token)
        return {"context": context}
    except Exception as e:
        print(f"[ERROR] Failed to generate AI context: {e}")
        return {"context": "[UNABLE TO RETRIEVE USER DATA]"}

@router.post("/action")
async def execute_ai_action(
    req: AIActionRequest,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token)
):
    """
    Executes a transactional action recommended by the AI.
    """
    return await IntelligenceHub.execute_ai_action(
        req.action_type, 
        req.params, 
        user_id, 
        token
    )
