"""
Assistant Service
=================
Core assistant logic.
"""
import sys
from typing import Any, Optional, Dict, List
from pydantic import BaseModel

try:
    from honey_rust import Assistant, IntentDetector
except ImportError:
    print("CRITICAL: honey_rust binary missing. Run 'maturin develop'.")
    sys.exit(1)

# Aliases
BeeYieldAI = Assistant

class AIContext(BaseModel):
    user_id: Optional[str] = None
    user_name: Optional[str] = None
    user_role: Optional[str] = "guest"
    language: str = "EN"

class AIQuery(BaseModel):
    message: str
    context: Optional[AIContext] = None
    history: Optional[List[Dict[str, str]]] = None

class AIResponse(BaseModel):
    response: str
    processing_time_ms: int = 0
    suggestions: Optional[List[str]] = None

async def chat(message: str, history=None, **kwargs):
    ai = Assistant()
    print("OK: Assistant Active")
    return ai.format_response("Service active.")

async def trace_batch(batch_code: str):
    return {"status": "verified", "batch": batch_code}
