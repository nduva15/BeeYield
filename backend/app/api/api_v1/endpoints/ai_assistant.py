"""
BeeYield Assistant API Endpoints
================================
Comprehensive API for the Assistant with all features:
- Chat with context
- Batch traceability
- Hive health analysis
- Quick actions
- Streaming support
"""

from fastapi import APIRouter, HTTPException, Body, Depends, Query
from fastapi.responses import StreamingResponse
from typing import Optional, Any, List, Dict
from pydantic import BaseModel, Field
from datetime import datetime
import pytz
import json
import asyncio

from app.services.ai_assistant import (
    BeeYieldAI, 
    AIQuery, 
    AIContext, 
    AIResponse,
    IntentDetector,
    DataRetriever,
    KnowledgeBase,
    chat as simple_chat,
    trace_batch,
    get_hive_status
)
from app.services.bee_health_ai import BeeHealthAI
from app.blockchain.honey_chain import honey_blockchain
from app.core.security import get_current_user, get_optional_current_user

router = APIRouter()


# ==============================================================================
# REQUEST/RESPONSE MODELS
# ==============================================================================

class ChatRequest(BaseModel):
    """Chat request model"""
    message: str = Field(..., min_length=1, max_length=2000, description="User message")
    history: Optional[List[Dict[str, str]]] = Field(None, description="Conversation history")
    language: Optional[str] = Field("EN", description="Response language code")
    include_sources: Optional[bool] = Field(True, description="Include data sources")
    stream: Optional[bool] = Field(False, description="Stream response")
    session_id: Optional[str] = Field(None, description="Chat session ID for persistence")


class ChatResponse(BaseModel):
    """Chat response model"""
    response: str
    sources: Optional[List[Dict[str, str]]] = None
    confidence: float = 0.95
    processing_time_ms: int = 0
    language: str = "EN"
    suggestions: Optional[List[str]] = None
    timestamp: str
    session_id: Optional[str] = None


class TraceRequest(BaseModel):
    """Traceability request"""
    batch_code: str = Field(..., min_length=3, description="Honey batch code")


class HiveAnalysisRequest(BaseModel):
    """Hive health analysis request"""
    hive_id: str = Field(..., description="Hive identifier")
    include_recommendations: bool = Field(True, description="Include treatment recommendations")


class QuickActionRequest(BaseModel):
    """Quick action request"""
    action: str = Field(..., description="Action type")
    parameters: Optional[Dict[str, Any]] = Field(None, description="Action parameters")


class FeedbackRequest(BaseModel):
    """User feedback on AI response"""
    message_id: str
    rating: int = Field(..., ge=1, le=5)
    feedback_text: Optional[str] = None


# ==============================================================================
# MAIN CHAT ENDPOINTS
# ==============================================================================

@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(
    request: ChatRequest,
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    """
    Chat with the BeeYield Assistant.
    
    Features:
    - Multi-language support (EN, SW, FR, DE, ES, ZH, PL, AR, PT)
    - Context-aware responses based on user role
    - Real-time data integration (shop, IoT, blockchain)
    - Conversation history support
    """
    try:
        # Get current time in EAT
        eat_tz = pytz.timezone('Africa/Nairobi')
        now = datetime.now(eat_tz)
        current_time_str = now.strftime("%H:%M:%S")
        current_date_str = now.strftime("%A, %B %d, %Y")
        
        # Build context from authenticated user
        user_name = None
        if current_user:
            user_name = current_user.get("name") or current_user.get("email", "").split("@")[0]
        
        # --- NEW: UNIFIED SERVICE DELEGATION ---
        from app.services.ai_service import AIService
        
        # Load local history if session_id and user exist 
        merged_history = request.history or []
        from app.db.supabase_db import db_select, db_insert
        from app.api.api_v1.endpoints.reports import get_token
        
        if request.session_id and current_user:
            past_messages = await db_select("chat_messages", filters={"session_id": request.session_id}, order_by="created_at", ascending=True)
            if past_messages:
                db_hist = [{"role": m["role"], "content": m["content"]} for m in past_messages]
                # Merge DB history with request history
                for m in db_hist:
                    if m not in merged_history:
                        merged_history.append(m)
        
        ai_data = await AIService.chat(
            message=request.message,
            history=merged_history,
            language=request.language or "EN",
            current_time=current_time_str,
            current_date=current_date_str
        )
        
        # Save to DB if user is authenticated
        if current_user:
            user_id = current_user.get("sub")
            session_id = request.session_id
            
            # Create session if needed
            if not session_id:
                # Generate a title from the message
                title = request.message[:30] + "..." if len(request.message) > 30 else request.message
                session_result = await db_insert("chat_sessions", {"user_id": user_id, "title": title})
                if session_result and session_result.get("data"):
                    session_id = session_result["data"][0]["id"]
            
            if session_id:
                # Save User Message
                await db_insert("chat_messages", {
                    "session_id": session_id,
                    "role": "user",
                    "content": request.message,
                })
                
                # Save AI Response
                await db_insert("chat_messages", {
                    "session_id": session_id,
                    "role": "assistant",
                    "content": ai_data["response"],
                    "sources": json.dumps(ai_data.get("sources") or []),
                    "suggestions": json.dumps(ai_data.get("suggestions") or [])
                })
                
                # Log Activity (F5)
                await db_insert("activity_logs", {
                    "user_id": user_id,
                    "event_type": "ai_chat",
                    "title": "Chat with AI Assistant",
                    "subtitle": request.message[:50] + "..." if len(request.message) > 50 else request.message,
                    "entity_type": "chat_session",
                    "entity_id": session_id
                })
        
        # Add session_id to the response if generated
        response_data = ChatResponse(
            response=ai_data["response"],
            sources=ai_data.get("sources") if request.include_sources else None,
            confidence=0.98,
            processing_time_ms=0,
            language=request.language or "EN",
            suggestions=ai_data.get("suggestions"),
            timestamp=now.isoformat()
        )
        if hasattr(response_data, "session_id") and "session_id" in locals() and session_id:
            response_data.session_id = session_id
        
        return response_data
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"AI processing error: {str(e)}")


@router.get("/sessions")
async def get_chat_sessions(current_user: dict = Depends(get_current_user)):
    """Get all chat sessions for the current user."""
    from app.db.supabase_db import db_select
    try:
        user_id = current_user.get("sub")
        sessions = await db_select("chat_sessions", filters={"user_id": user_id}, order_by="updated_at", ascending=False)
        return {"sessions": sessions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/{session_id}/messages")
async def get_chat_session_messages(session_id: str, current_user: dict = Depends(get_current_user)):
    """Get messages for a specific chat session."""
    from app.db.supabase_db import db_select
    try:
        user_id = current_user.get("sub")
        # Verify ownership
        sessions = await db_select("chat_sessions", filters={"id": session_id, "user_id": user_id})
        if not sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        
        messages = await db_select("chat_messages", filters={"session_id": session_id}, order_by="created_at", ascending=True)
        return {"messages": messages, "session": sessions[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/sessions/{session_id}", status_code=204)
async def delete_chat_session(session_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a chat session and all its messages."""
    from app.db.supabase_db import db_select, db_delete
    try:
        user_id = current_user.get("sub")
        # Verify ownership
        sessions = await db_select("chat_sessions", filters={"id": session_id, "user_id": user_id})
        if not sessions:
            raise HTTPException(status_code=404, detail="Session not found")

        # Delete messages first (cascade should handle this, but be explicit)
        await db_delete("chat_messages", {"session_id": session_id})
        await db_delete("chat_sessions", {"id": session_id})
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/stream")
async def chat_stream(
    request: ChatRequest,
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    """
    Stream chat response for real-time display.
    Returns Server-Sent Events (SSE).
    """
    async def generate():
        try:
            # For now, return full response as single event
            # In production, integrate with streaming API
            query = AIQuery(
                message=request.message,
                history=request.history,
                context=AIContext(
                    language=request.language or "EN"
                )
            )
            
            result = await BeeYieldAI.process_query(query)
            
            # Yield response in chunks (simulated streaming)
            words = result.response.split()
            buffer = ""
            for i, word in enumerate(words):
                buffer += word + " "
                if i % 5 == 0:  # Send every 5 words
                    yield f"data: {json.dumps({'chunk': buffer, 'done': False})}\n\n"
                    buffer = ""
                    await asyncio.sleep(0.05)
            
            if buffer:
                yield f"data: {json.dumps({'chunk': buffer, 'done': False})}\n\n"
            
            yield f"data: {json.dumps({'done': True, 'suggestions': result.suggestions})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
        }
    )


# ==============================================================================
# TRACEABILITY ENDPOINTS
# ==============================================================================

@router.post("/trace")
async def trace_honey_batch(request: TraceRequest):
    """
    Trace a honey batch using its code.
    Retrieves full journey from HoneyChain blockchain.
    """
    try:
        result = await trace_batch(request.batch_code)
        
        # Get additional blockchain data
        journey = honey_blockchain.get_batch_journey(request.batch_code)
        
        return {
            "batch_code": request.batch_code,
            "verified": journey is not None,
            "journey_summary": result.get("info"),
            "blockchain_data": journey,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/trace/{batch_code}")
async def trace_honey_get(batch_code: str):
    """GET endpoint for honey traceability"""
    try:
        result = await trace_batch(batch_code)
        journey = honey_blockchain.get_batch_journey(batch_code)
        
        return {
            "batch_code": batch_code,
            "verified": journey is not None,
            "info": result.get("info"),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
# HIVE HEALTH ENDPOINTS
# ==============================================================================

@router.post("/hive/analyze")
async def analyze_hive_health(request: HiveAnalysisRequest):
    """
    Analyze hive health using AI and sensor data.
    Returns health score, anomalies, and recommendations.
    """
    try:
        # Get sensor data
        sensor_data = honey_blockchain.get_latest_sensor_data(request.hive_id)
        
        if not sensor_data:
            # Generate sample data for demo
            sensor_data = {
                "temperature": 35.2,
                "humidity": 55,
                "weight": 45.3,
                "audio_anomaly": "NORMAL"
            }
        
        # Run health analysis
        health_report = await BeeHealthAI.analyze_hive_health(request.hive_id, sensor_data)
        
        # Add recommendations if requested
        if request.include_recommendations:
            recommendations = []
            
            for anomaly in health_report.get("anomalies", []):
                if anomaly.get("type") == "THERMAL_STRESS":
                    recommendations.append({
                        "priority": "HIGH",
                        "action": "Improve ventilation or provide shade",
                        "timeframe": "Immediate"
                    })
                elif anomaly.get("type") == "EXCESSIVE_MOISTURE":
                    recommendations.append({
                        "priority": "MEDIUM",
                        "action": "Check hive drainage and add ventilation",
                        "timeframe": "Within 24 hours"
                    })
                elif anomaly.get("type") == "ACOUSTIC_DISEASE_SIGNATURE":
                    recommendations.append({
                        "priority": "CRITICAL",
                        "action": "Perform Varroa mite count and treatment",
                        "timeframe": "Immediate inspection required"
                    })
            
            health_report["recommendations"] = recommendations
        
        return health_report
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/hive/{hive_id}/status")
async def get_hive_status_endpoint(hive_id: str):
    """Get current hive status and sensor readings"""
    try:
        result = await get_hive_status(hive_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
# QUICK ACTION ENDPOINTS
# ==============================================================================

@router.post("/quick-action")
async def execute_quick_action(
    request: QuickActionRequest,
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    """
    - contact_support: Generate support ticket
    """
    try:
        params = request.parameters or {}
        result = {"action": request.action, "status": "completed"}
        
        if request.action == "check_order":
            order_id = params.get("order_id")
            if order_id:
                result["data"] = await DataRetriever.get_order_info(order_id=order_id)
            else:
                result["message"] = "Please provide an order ID"
        
        elif request.action == "find_product":
            category = params.get("category")
            result["data"] = await DataRetriever.get_shop_products(category=category)
        
        elif request.action == "get_quote":
            result["data"] = await DataRetriever.get_pollination_info()
            result["message"] = "For a detailed quote, please visit beeyield.com/pollination-request"
        
        elif request.action == "schedule_inspection":
            result["message"] = "Inspection scheduling will be available soon. Contact support@beeyield.com"
        
        elif request.action == "contact_support":
            result["data"] = {
                "email": "support@beeyield.com",
                "phone": "+254 xxx xxx xxx",
                "hours": "Mon-Fri 8AM-6PM EAT"
            }
        
        else:
            result["status"] = "unknown"
            result["message"] = f"Unknown action: {request.action}"
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
# SUGGESTION ENDPOINTS
# ==============================================================================

@router.get("/suggestions")
async def get_suggestions(
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    """
    Get contextual quick suggestions for the chat interface.
    Suggestions are personalized based on user role.
    """
    try:
        user_role = "guest"
        if current_user:
            user_role = current_user.get("role", "customer")
        
        suggestions = await BeeYieldAI.get_quick_suggestions(user_role)
        
        return {
            "suggestions": suggestions,
            "role": user_role
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/intents")
async def analyze_intents(message: str = Query(..., description="Message to analyze")):
    """Analyze intents from a message (for debugging/testing)"""
    intents = IntentDetector.detect(message)
    temperature = IntentDetector.get_temperature(intents)
    
    return {
        "message": message,
        "detected_intents": intents,
        "recommended_temperature": temperature
    }


# ==============================================================================
# KNOWLEDGE & DATA ENDPOINTS
# ==============================================================================

@router.get("/knowledge/search")
async def search_knowledge(
    query: str = Query(..., min_length=2, description="Search query"),
    limit: int = Query(5, ge=1, le=20, description="Max results")
):
    """Search the BeeYield knowledge base"""
    try:
        results = await KnowledgeBase.search(query, limit=limit)
        return {
            "query": query,
            "results": results,
            "count": len(results.split("\n\n")) if results else 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/data/products")
async def get_product_data(
    category: Optional[str] = Query(None, description="Product category filter"),
    limit: int = Query(10, ge=1, le=50)
):
    """Get product data for AI context"""
    try:
        products = await DataRetriever.get_shop_products(category=category, limit=limit)
        return {"data": products}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/data/apiaries")
async def get_apiary_data(
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    """Get apiary statistics"""
    try:
        user_id = current_user.get("sub") if current_user else None
        stats = await DataRetriever.get_apiary_stats(user_id)
        return {"data": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/data/iot")
async def get_iot_data(
    hive_id: Optional[str] = Query(None, description="Specific hive ID")
):
    """Get IoT sensor data"""
    try:
        data = await DataRetriever.get_iot_sensor_data(hive_id)
        return {"data": data, "hive_id": hive_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/data/company")
async def get_company_data():
    """Get BeeYield company information"""
    try:
        dna = await KnowledgeBase.get_dna()
        info = await DataRetriever.get_company_info()
        return {"dna": dna, "info": info}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
# FEEDBACK & ANALYTICS
# ==============================================================================

@router.post("/feedback")
async def submit_feedback(
    request: FeedbackRequest,
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    """
    Submit feedback on Assistant response quality.
    Used to improve accuracy over time.
    """
    try:
        # In production, save to database
        return {
            "status": "received",
            "message_id": request.message_id,
            "rating": request.rating,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
# HEALTH & STATUS
# ==============================================================================

@router.get("/status")
async def get_ai_status():
    """
    Get comprehensive Assistant system status.
    Checks knowledge base, database, and API connectivity.
    """
    try:
        health = await BeeYieldAI.health_check()
        
        return {
            "status": health["status"],
            "version": "2.0.0",
            "capabilities": [
                "multi_language",
                "blockchain_traceability",
                "iot_integration",
                "health_diagnostics",
                "shop_assistant",
                "pollination_advisor"
            ],
            "checks": health["checks"],
            "timestamp": health["timestamp"]
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }


@router.get("/languages")
async def get_supported_languages():
    """Get list of supported languages"""
    return {
        "languages": [
            {"code": "EN", "name": "English", "native": "English"},
            {"code": "SW", "name": "Kiswahili", "native": "Kiswahili"},
            {"code": "FR", "name": "French", "native": "Français"},
            {"code": "DE", "name": "German", "native": "Deutsch"},
            {"code": "ES", "name": "Spanish", "native": "Español"},
            {"code": "ZH", "name": "Chinese", "native": "中文"},
            {"code": "PL", "name": "Polish", "native": "Polski"},
            {"code": "AR", "name": "Arabic", "native": "العربية"},
            {"code": "PT", "name": "Portuguese", "native": "Português"}
        ],
        "default": "EN"
    }


# ==============================================================================
# LEGACY COMPATIBILITY
# ==============================================================================

@router.post("/search")
async def search_web(request: dict = Body(...)):
    """
    Legacy web search endpoint.
    Simulates web search for real-time intelligence.
    """
    query = request.get("query", "")
    
    # Return contextual intelligence
    msg_lower = query.lower()
    
    if any(kw in msg_lower for kw in ["current", "latest", "outbreak", "news", "trend", "2026"]):
        results = (
            "CURRENT INTELLIGENCE REPORT (FEB 2026):\n"
            "- VARROA UPDATE: Amitraz resistance confirmed in 45% of Kenyan commercial apiaries.\n"
            "- PATHOGEN TRENDS: DWV-B virus levels stabilizing after 2025 interventions.\n"
            "- BIO-TECH: USDA-approved AFB Vaccine in year 2 of rollout, 40% reduction in larval mortality.\n"
            "- CLIMATE: Warm winter fluctuations in Rift Valley - supplemental protein recommended.\n"
            "- REGULATORY: New Kenyan drone-based spray monitoring rules in effect."
        )
    else:
        results = f"No critical alerts for query: '{query}'"
    
    return {"results": results, "timestamp": datetime.now().isoformat()}


# ==============================================================================
# STATUS ENDPOINT
# ==============================================================================

@router.get("/status")
async def get_assistant_status():
    """
    Get AI Assistant operational status.
    Used by frontend to check if the AI service is online.
    """
    return {
        "status": "online",
        "mode": "neural",
        "version": "4.2",
        "capabilities": [
            "chat",
            "traceability",
            "hive_analysis",
            "pollination_recommendations",
            "health_diagnostics"
        ],
        "timestamp": datetime.now(pytz.UTC).isoformat()
    }

# ==============================================================================
# ATOMIC AI ENDPOINT (NATIVE HIVE)
# ==============================================================================

@router.post("/atomic/chat", response_model=ChatResponse)
async def chat_atomic(
    request: ChatRequest,
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    """
    Chat with the BeeYield Native Hive (Atomic Mode).
    Uses the pure Python dependency-free model.
    """
    try:
        from app.services.bee_atomic import AtomicAIService
        
        result = await AtomicAIService.generate_thought_response(request.message)
        
        return ChatResponse(
            response=result["response"],
            sources=[{"type": "model", "name": result.get("mode", "Atomic")}],
            confidence=0.95,
            processing_time_ms=20,
            language="EN",
            suggestions=["Ask about traceability", "Check hive status"],
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
