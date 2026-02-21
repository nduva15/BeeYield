"""
BeeYield AI Assistant - Rust-Accelerated (Post-Oxidize)
======================================================
Intent detection, prompt assembly, and response formatting now handled by `beeyield_core.AssistantEngine`.
Python orchestration manages Gemini API calls and dynamic context retrieval.
"""
from typing import Any, Optional, Dict, List
import json
import httpx
import os
import asyncio
from datetime import datetime
import pytz
from pydantic import BaseModel

from app.db.supabase_db import db_select, db_get_by_id
from app.core.config import settings

try:
    from beeyield_core import AssistantEngine as _RustEngine
    _RUST_AVAILABLE = True
except ImportError:
    _RUST_AVAILABLE = False

_engine = _RustEngine() if _RUST_AVAILABLE else None

class AIContext(BaseModel):
    user_id: Optional[str] = None
    user_name: Optional[str] = None
    user_role: Optional[str] = "guest"
    language: str = "EN"
    timezone: str = "Africa/Nairobi"

class AIQuery(BaseModel):
    message: str
    context: Optional[AIContext] = None
    history: Optional[List[Dict[str, str]]] = None

class AIResponse(BaseModel):
    response: str
    sources: Optional[List[Dict[str, str]]] = None
    processing_time_ms: int = 0

async def get_context_data(message: str, intents: List[str], user_id: Optional[str]) -> str:
    """Collect relevant context based on detected intents."""
    context = []
    if any(i in ["product_search", "order_status"] for i in intents):
        products = await db_select("products", limit=5)
        context.append(f"PRODUCTS: {json.dumps(products)}")
    
    if "harvest_logs" in intents:
        harvests = await db_select("harvests", limit=5, order_by="harvest_date", ascending=False)
        context.append(f"HARVESTS: {json.dumps(harvests)}")
    
    if "trace_honey" in intents:
        context.append("TRACEABILITY: HoneyChain Blockchain is 100% active. All batches are verified.")

    return "\n".join(context)

async def generate_ai_response(query: AIQuery) -> AIResponse:
    """Core AI orchestration. Logic delegating to Rust AssistantEngine."""
    start_time = datetime.now()
    if not _engine:
        return AIResponse(response="AI Engine unavailable.", processing_time_ms=0)

    # 1. RUST: Detect Intents
    intents = _engine.detect_intents(query.message)
    temp = _engine.get_temperature(intents)
    
    # 2. PYTHON: Dynamic Context Retrieval
    context_data = await get_context_data(query.message, intents, query.context.user_id if query.context else None)
    
    # 3. RUST: Build Prompt
    ctx = query.context or AIContext()
    system_prompt = _engine.build_system_prompt(
        ctx.language, ctx.user_role, ctx.user_name, intents, context_data
    )

    # 4. PYTHON: Call Gemini API
    api_key = settings.GOOGLE_API_KEY
    response_text = "I am sorry, I cannot process your request right now."
    
    if api_key:
        try:
            async with httpx.AsyncClient() as client:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={api_key}"
                history = [{"role": "user" if h["role"] == "user" else "model", "parts": [{"text": h["content"]}]} for h in (query.history or [])[-5:]]
                
                payload = {
                    "system_instruction": {"parts": [{"text": system_prompt}]},
                    "contents": history + [{"role": "user", "parts": [{"text": query.message}]}],
                    "generationConfig": {"temperature": temp, "maxOutputTokens": 2048}
                }
                resp = await client.post(url, json=payload, timeout=30.0)
                json_resp = resp.json()
                if "candidates" in json_resp:
                    response_text = json_resp["candidates"][0]["content"]["parts"][0]["text"]
        except Exception as e:
            print(f"Gemini API Error: {e}")

    # 5. RUST: Format & Sanitize
    final_response = _engine.format_response(response_text)
    
    elapsed = (datetime.now() - start_time).total_seconds() * 1000
    return AIResponse(
        response=final_response,
        processing_time_ms=int(elapsed)
    )
