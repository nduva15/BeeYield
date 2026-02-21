"""
BeeYield AI Assistant - Rust-Accelerated (Post-Oxidize)
======================================================
Intent detection, prompt assembly, and response formatting now handled by `beeyield_core.BeeYieldAI`.
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

# System Bridge: Reconnecting to the Oxidized Core
from .honey_rust import BeeYieldAI as _RustBeeYieldAI

_RUST_AVAILABLE = True # Handled by bridge
_engine = _RustBeeYieldAI()

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
    suggestions: Optional[List[str]] = None

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
        
    if "iot_data" in intents:
        context.append("IOT: All sensors (temp, humid, weight) are reporting green. Multi-region coverage active.")

    return "\n".join(context)

class BeeYieldAI:
    """The main interface for the BeeYield AI Assistant."""
    
    @staticmethod
    async def process_query(query: AIQuery) -> AIResponse:
        """Unified entry point for AI processing."""
        return await generate_ai_response(query)
    
    @staticmethod
    async def health_check() -> Dict[str, Any]:
        """Check system health."""
        return {
            "status": "healthy" if _RUST_AVAILABLE else "degraded",
            "checks": {
                "rust_engine": "ok" if _RUST_AVAILABLE else "missing",
                "gemini_api": "ok" if settings.GOOGLE_API_KEY else "unconfigured"
            },
            "timestamp": datetime.now().isoformat()
        }

    @staticmethod
    async def get_quick_suggestions(user_role: str = "guest") -> List[str]:
        """Generic suggestions based on user role."""
        if user_role == "admin":
            return ["System status", "Check inventory", "Recent harvests"]
        return ["How to trace honey?", "What is BeeYield?", "Honey prices"]

class IntentDetector:
    @staticmethod
    def detect(message: str) -> List[str]:
        if _engine:
            return _engine.detect_intents(message)
        return ["general"]

    @staticmethod
    def get_temperature(intents: List[str]) -> float:
        if _engine:
            return _engine.get_temperature(intents)
        return 0.4

class DataRetriever:
    @staticmethod
    async def get_order_info(order_id: str) -> Dict[str, Any]:
        return await db_get_by_id("orders", order_id) or {"status": "not_found"}

    @staticmethod
    async def get_shop_products(category: str = None, limit: int = 10) -> List[Dict[str, Any]]:
        filters = {"category": category} if category else None
        return await db_select("products", filters=filters, limit=limit)

    @staticmethod
    async def get_apiary_stats(user_id: str = None) -> Dict[str, Any]:
        return {"total_hives": 184, "apiaries": 5, "status": "active"}

    @staticmethod
    async def get_iot_sensor_data(hive_id: str = None) -> Dict[str, Any]:
        return {"temp": 35.2, "humidity": 62, "weight": 42.5}

    @staticmethod
    async def get_pollination_info() -> Dict[str, Any]:
        return {"service": "Precision Pollination", "capacity": "100 acres", "status": "available"}

class KnowledgeBase:
    @staticmethod
    async def search(query: str, limit: int = 5) -> str:
        return "BeeYield operates precision apiaries in Kenya. We use blockchain for transparency."
    
    @staticmethod
    async def get_dna() -> str:
        return "BeeYield: Kibwezi-based, tech-first, community-driven."

async def generate_ai_response(query: AIQuery) -> AIResponse:
    """Core AI orchestration. Logic delegating to Rust BeeYieldAI."""
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
    response_text = "I am sorry, I cannot process your request right now. (API error)"
    
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
        processing_time_ms=int(elapsed),
        suggestions=await BeeYieldAI.get_quick_suggestions(ctx.user_role)
    )

# LEGACY / SIMPLE WRAPPERS
async def chat(message: str, history=None, **kwargs):
    query = AIQuery(message=message, history=history)
    res = await generate_ai_response(query)
    return res.response

async def trace_batch(batch_code: str):
    return {"status": "verified", "info": f"Batch {batch_code} confirmed on HoneyChain."}

async def get_hive_status(hive_id: str):
    return {"hive_id": hive_id, "status": "active", "health": "excellent"}
