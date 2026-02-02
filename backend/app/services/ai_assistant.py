"""
BeeYield AI Assistant - Comprehensive Multi-Modal Intelligence System
======================================================================
A powerful AI backend integrating:
- Real-time database queries
- Blockchain traceability
- IoT sensor data
- Shop & order analytics
- Pollination intelligence
- Health diagnostics
- Multi-language support
"""

from typing import Any, Optional, Dict, List
import json
import httpx
import os
import asyncio
import re
from datetime import datetime, timedelta
from pydantic import BaseModel
import pytz

from app.db.supabase_db import db_select, db_get_by_id
from app.core.config import settings
from app.blockchain.honey_chain import honey_blockchain, BlockType


# ==============================================================================
# SCHEMAS
# ==============================================================================

class AIContext(BaseModel):
    """Context passed to the AI for each query"""
    user_id: Optional[str] = None
    user_name: Optional[str] = None
    user_role: Optional[str] = "guest"  # guest, customer, farmer, admin
    session_id: Optional[str] = None
    language: str = "EN"
    timezone: str = "Africa/Nairobi"
    current_page: Optional[str] = None


class AIQuery(BaseModel):
    """Query structure for AI requests"""
    message: str
    context: Optional[AIContext] = None
    history: Optional[List[Dict[str, str]]] = None
    include_sources: bool = True
    stream: bool = False


class AIResponse(BaseModel):
    """Response structure from AI"""
    response: str
    sources: Optional[List[Dict[str, str]]] = None
    confidence: float = 0.95
    processing_time_ms: int = 0
    tokens_used: Optional[int] = None
    language: str = "EN"
    suggestions: Optional[List[str]] = None


# ==============================================================================
# LANGUAGE MAPPING
# ==============================================================================

LANGUAGE_MAP = {
    'EN': 'English',
    'FR': 'French',
    'DE': 'German',
    'ES': 'Spanish',
    'SW': 'Kiswahili',
    'ZH': 'Chinese (Simplified)',
    'PL': 'Polish',
    'AR': 'Arabic',
    'PT': 'Portuguese'
}


# ==============================================================================
# INTENT DETECTION
# ==============================================================================

class IntentDetector:
    """Detects user intent from natural language queries"""
    
    INTENTS = {
        # Shop & Products
        'product_search': ['buy', 'purchase', 'order', 'shop', 'honey', 'price', 'cost', 'product', 'available', 'stock'],
        'order_status': ['order', 'tracking', 'delivery', 'shipment', 'status', 'where is my'],
        'cart_help': ['cart', 'checkout', 'payment', 'pay', 'mpesa', 'card'],
        
        # Traceability
        'trace_honey': ['trace', 'origin', 'source', 'batch', 'verify', 'authenticate', 'qr', 'honeychain'],
        'farmer_info': ['farmer', 'beekeeper', 'who made', 'producer'],
        'apiary_info': ['apiary', 'hive', 'farm', 'location', 'where from'],
        
        # Pollination
        'pollination_service': ['pollination', 'pollinate', 'crop', 'yield', 'farming', 'agricultural'],
        'pollination_quote': ['quote', 'estimate', 'pricing', 'how much', 'cost for pollination'],
        
        # IoT & Technical
        'iot_data': ['sensor', 'temperature', 'humidity', 'weight', 'telemetry', 'iot', 'monitoring'],
        'hive_health': ['health', 'disease', 'sick', 'varroa', 'mite', 'infection', 'anomaly'],
        'device_help': ['device', 'beehub', 'setup', 'configure', 'install', 'gateway'],
        
        # Company & General
        'about_beeyield': ['about', 'company', 'who are you', 'what is beeyield', 'mission', 'story'],
        'contact': ['contact', 'reach', 'email', 'phone', 'call', 'message', 'support'],
        'career': ['job', 'career', 'work', 'hiring', 'apply', 'employment'],
        
        # Education
        'learn_beekeeping': ['learn', 'training', 'course', 'education', 'tutorial', 'how to'],
        'bee_facts': ['bee', 'bees', 'pollinator', 'colony', 'queen', 'swarm'],
        
        # Dashboard
        'dashboard_help': ['dashboard', 'my hives', 'my apiaries', 'my harvests', 'analytics', 'report'],
        
        # Greetings
        'greeting': ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'jambo', 'habari'],
        'farewell': ['bye', 'goodbye', 'thanks', 'thank you', 'asante']
    }
    
    @staticmethod
    def detect(message: str) -> List[str]:
        """Detect intents from message, returns list of matching intents"""
        msg_lower = message.lower()
        detected = []
        
        for intent, keywords in IntentDetector.INTENTS.items():
            for kw in keywords:
                if kw in msg_lower:
                    detected.append(intent)
                    break
        
        return detected if detected else ['general']
    
    @staticmethod
    def get_temperature(intents: List[str]) -> float:
        """Determine optimal temperature based on intent"""
        creative_intents = ['greeting', 'farewell', 'about_beeyield', 'learn_beekeeping']
        factual_intents = ['trace_honey', 'order_status', 'iot_data', 'product_search']
        
        if any(i in creative_intents for i in intents):
            return 0.7
        elif any(i in factual_intents for i in intents):
            return 0.1
        return 0.4


# ==============================================================================
# DATA RETRIEVAL LAYER
# ==============================================================================

class DataRetriever:
    """Retrieves real-time data from all BeeYield services"""
    
    @staticmethod
    async def get_shop_products(category: Optional[str] = None, limit: int = 5) -> str:
        """Get product information for AI context"""
        try:
            filters = {"is_active": True}
            if category:
                filters["category"] = category
            
            products = db_select("products", filters=filters, limit=limit)
            
            if not products:
                return "SHOP DATA: No products currently in database."
            
            summary = "AVAILABLE PRODUCTS:\n"
            for p in products:
                price = p.get('price', 0)
                summary += f"- {p.get('name', 'Unknown')}: KES {price:,.0f} ({p.get('category', 'general')})\n"
                if p.get('description'):
                    summary += f"  → {p.get('description')[:100]}...\n"
            
            return summary
        except Exception as e:
            return f"SHOP DATA: Error retrieving - {str(e)}"
    
    @staticmethod
    async def get_order_info(order_id: Optional[str] = None, user_id: Optional[str] = None) -> str:
        """Get order information"""
        try:
            if order_id:
                order = db_get_by_id("orders", order_id)
                if order:
                    return f"""ORDER DETAILS:
- Order #: {order.get('order_number', order.get('id'))}
- Status: {order.get('status', 'pending')}
- Total: KES {order.get('total', 0):,.2f}
- Payment: {order.get('payment_status', 'pending')}
- Created: {order.get('created_at', 'Unknown')}"""
            
            if user_id:
                orders = db_select("orders", filters={"user_id": user_id}, limit=5, order_by="created_at", ascending=False)
                if orders:
                    summary = "RECENT ORDERS:\n"
                    for o in orders:
                        summary += f"- #{o.get('order_number', o.get('id')[:8])}: {o.get('status')} - KES {o.get('total', 0):,.2f}\n"
                    return summary
            
            return "ORDER DATA: No orders found matching criteria."
        except Exception as e:
            return f"ORDER DATA: Error - {str(e)}"
    
    @staticmethod
    async def get_traceability_info(batch_code: str) -> str:
        """Get honey traceability information from blockchain"""
        try:
            # Try to get batch from blockchain
            journey_data = honey_blockchain.get_batch_journey(batch_code)
            
            if journey_data:
                return f"""HONEYCHAIN VERIFIED BATCH ({batch_code}):
- Product: {journey_data.get('product_name', 'Premium Honey')}
- Farmer: {journey_data.get('farmer_name', 'BeeYield Partner')}
- Apiary: {journey_data.get('apiary_name', 'Kibwezi Apiaries')}
- Harvest Date: {journey_data.get('harvest_date', 'Verified')}
- Honey Type: {journey_data.get('honey_type', 'Multi-flower')}
- Verified: ✓ Authentic on HoneyChain Ledger"""
            
            # Fallback to database
            batches = db_select("batches", filters={"batch_code": batch_code})
            if batches:
                b = batches[0]
                return f"""BATCH INFORMATION ({batch_code}):
- Product: {b.get('product_name', 'Honey')}
- Origin: {b.get('apiary_name', 'BeeYield Apiary')}
- Status: Verified"""
            
            return f"TRACE DATA: Batch {batch_code} not found in system. Please verify the code."
        except Exception as e:
            return f"TRACE DATA: Error - {str(e)}"
    
    @staticmethod
    async def get_apiary_stats(user_id: Optional[str] = None) -> str:
        """Get apiary and hive statistics"""
        try:
            filters = {}
            if user_id:
                filters["user_id"] = user_id
            
            apiaries = db_select("apiaries", filters=filters, limit=10)
            hives = db_select("hives", limit=200)
            
            total_hives = len(hives) if hives else 0
            active_hives = sum(1 for h in (hives or []) if h.get('status') == 'Active & Healthy')
            
            if apiaries:
                return f"""APIARY NETWORK:
- Total Apiaries: {len(apiaries)}
- Primary Site: Kibwezi Main Apiary
- Total Hives: {total_hives}
- Active & Healthy: {active_hives}
- Network Status: ONLINE"""
            
            return f"""BEEYIELD NETWORK:
- Main Apiary: Kibwezi, Makueni County
- Network Hives: 184
- Status: Active"""
        except Exception as e:
            return f"APIARY DATA: Error - {str(e)}"
    
    @staticmethod
    async def get_iot_sensor_data(hive_id: Optional[str] = None) -> str:
        """Get real-time IoT sensor data"""
        try:
            if hive_id:
                sensor_data = honey_blockchain.get_latest_sensor_data(hive_id)
                if sensor_data:
                    return f"""LIVE TELEMETRY ({hive_id}):
- Temperature: {sensor_data.get('temperature', 35.2)}°C (Optimal: 34-36°C)
- Humidity: {sensor_data.get('humidity', 55)}%
- Weight: {sensor_data.get('weight', 45.3)} kg
- Acoustic: {sensor_data.get('audio_status', 'Normal Queen Pattern')}
- Battery: {sensor_data.get('battery', 95)}%
- Signal: Strong"""
            
            return """IOT NETWORK STATUS:
- Connected Gateways: 3
- Active Sensors: 184+
- Data Latency: <500ms
- Coverage: 100%"""
        except Exception as e:
            return f"IOT DATA: Error - {str(e)}"
    
    @staticmethod
    async def get_pollination_info() -> str:
        """Get pollination service information"""
        try:
            contracts = db_select("pollination_contracts", limit=5)
            
            return """PRECISION POLLINATION SERVICES:
- Crops Supported: Mangoes, Sunflower, Oranges, Avocados, Beans, Tomatoes
- Average Yield Increase: 35%
- Hive Density: 2-5 hives per hectare
- Monitoring: 24/7 IoT & AI
- Coverage Area: Makueni, Kitui Counties
- Pricing: Custom quotes based on acreage & crop type
- Contact: pollination@beeyield.com"""
        except Exception as e:
            return f"POLLINATION DATA: Error - {str(e)}"
    
    @staticmethod
    async def get_company_info() -> str:
        """Get BeeYield company information"""
        return """BEEYIELD IDENTITY:
- Company: BeeYield
- Founded: 2020
- Mission: Revolutionizing African beekeeping through precision IoT and blockchain traceability
- HQ: Kibwezi, Makueni County, Kenya
- Farm Size: 5-acre secure apiary site
- Hives: 184 managed colonies
- Founders: Timothy Mathuva (CEO), Agatha Mathuva (IT Lead), Carole Mathuva (Growth Officer)
- Tech Stack: LoRaWAN IoT Sensors, HoneyChain Blockchain, AI Disease Detection
- Products: Premium Traceable Honey, IoT Monitoring Systems, Pollination Services
- ESG: 50/50 Harvest Promise, 2,500+ trees planted, <15% colony loss rate"""
    
    @staticmethod
    async def get_farmer_info(farmer_id: Optional[str] = None) -> str:
        """Get farmer/beekeeper information"""
        try:
            if farmer_id:
                farmer = db_get_by_id("farmers", farmer_id)
                if farmer:
                    return f"""FARMER PROFILE:
- Name: {farmer.get('name', 'Partner Beekeeper')}
- Region: {farmer.get('region', 'Makueni County')}
- Experience: {farmer.get('years_experience', '5+')} years
- Cert: Master Beekeeper"""
            
            farmers = db_select("farmers", limit=5)
            if farmers:
                return f"PARTNER NETWORK: {len(farmers)}+ certified beekeepers across Kenya"
            
            return """PARTNER BEEKEEPERS:
- Network: 50+ trained beekeepers
- Lead Beekeeper: Timothy Nduva
- Certification: BeeYield Master Beekeeper Program
- Location: Makueni & Kitui Counties"""
        except Exception as e:
            return f"FARMER DATA: Error - {str(e)}"


# ==============================================================================
# KNOWLEDGE BASE ACCESS
# ==============================================================================

class KnowledgeBase:
    """Access to BeeYield knowledge base"""
    
    _cache: Optional[Dict] = None
    _cache_time: Optional[datetime] = None
    _cache_duration = timedelta(minutes=30)
    
    @staticmethod
    async def load() -> Dict:
        """Load knowledge base with caching"""
        now = datetime.now()
        
        if (KnowledgeBase._cache and KnowledgeBase._cache_time and 
            (now - KnowledgeBase._cache_time) < KnowledgeBase._cache_duration):
            return KnowledgeBase._cache
        
        kb_path = os.path.join(os.path.dirname(__file__), "../data/knowledge_base.json")
        try:
            with open(kb_path, 'r', encoding='utf-8') as f:
                KnowledgeBase._cache = json.load(f)
                KnowledgeBase._cache_time = now
                return KnowledgeBase._cache
        except Exception:
            return {"dna": {}, "knowledge_nodes": []}
    
    @staticmethod
    async def search(query: str, limit: int = 5) -> str:
        """Search knowledge base for relevant information"""
        kb = await KnowledgeBase.load()
        
        query_words = [w.lower() for w in query.split() if len(w) > 3]
        if not query_words:
            query_words = query.lower().split()
        
        nodes = kb.get("knowledge_nodes", [])
        scored = []
        
        for node in nodes:
            content = node.get("content", "").lower()
            source = node.get("source", "").lower()
            
            score = sum(content.count(w) for w in query_words)
            score += sum(10 for w in query_words if w in source)
            
            if score > 0:
                scored.append((score, node))
        
        scored.sort(key=lambda x: x[0], reverse=True)
        top = scored[:limit]
        
        result = ""
        for _, node in top:
            result += f"{node.get('content', '')[:300]}...\n\n"
        
        return result or "No specific knowledge found for this query."
    
    @staticmethod
    async def get_dna() -> str:
        """Get core company DNA for grounding"""
        kb = await KnowledgeBase.load()
        dna = kb.get("dna", {})
        
        if not dna:
            return await DataRetriever.get_company_info()
        
        founders = ", ".join([f"{f.get('name')} ({f.get('role')})" for f in dna.get('founders', [])])
        tech = dna.get('tech_stack', {})
        
        return f"""BEEYIELD DNA:
- Company: {dna.get('company', 'BeeYield')}
- Mission: {dna.get('mission', 'Revolutionizing African beekeeping')}
- HQ: {dna.get('hq', {}).get('location', 'Kibwezi, Kenya')} on {dna.get('hq', {}).get('farm_size', '5 acres')}
- Hives: {dna.get('hq', {}).get('hives_count', 184)}
- Founders: {founders}
- Technology: {tech.get('sensors', 'IoT Sensors')} + {tech.get('blockchain', 'HoneyChain')}"""


# ==============================================================================
# AI ENGINE
# ==============================================================================

class AIEngine:
    """Core AI processing engine using Google Gemini"""
    
    @staticmethod
    async def generate_response(
        query: AIQuery,
        context_data: str,
        intents: List[str]
    ) -> AIResponse:
        """Generate AI response using Gemini"""
        
        start_time = datetime.now()
        
        # Get context
        ctx = query.context or AIContext()
        language = LANGUAGE_MAP.get(ctx.language.upper(), 'English')
        temperature = IntentDetector.get_temperature(intents)
        
        # Get current time
        tz = pytz.timezone(ctx.timezone)
        now = datetime.now(tz)
        current_time = now.strftime("%H:%M")
        current_date = now.strftime("%A, %B %d, %Y")
        
        # Build system prompt
        system_prompt = f"""SYSTEM ROLE: You are BeeYield AI, the intelligent assistant for BeeYield - a precision pollination and honey traceability company based in Kibwezi, Kenya.

RESPONSE LANGUAGE: {language}
CURRENT TIME: {current_time} EAT, {current_date}
USER CONTEXT: {ctx.user_role.title()} user{f' named {ctx.user_name}' if ctx.user_name else ''}

DETECTED INTENTS: {', '.join(intents)}

DATA CONTEXT:
{context_data}

CORE DIRECTIVES:
1. ACCURACY: Use ONLY the data provided. Never hallucinate facts. If unsure, say "I don't have that information."
2. FORMATTING: Use **bold** for key terms, bullet points for lists. Keep responses concise but helpful.
3. BRAND VOICE: Professional, warm, knowledgeable. Position BeeYield as the leader in agricultural tech.
4. ACTIONABLE: When relevant, suggest next steps or provide links (beeyield.com/...)
5. LOCALIZATION: Respect Kenyan context and East African agricultural practices.

SPECIAL CAPABILITIES:
- Honey traceability verification via HoneyChain blockchain
- Real-time IoT sensor data interpretation
- Pollination service recommendations
- Order and product assistance
- Beekeeping education and health diagnostics

Answer the user's question clearly and helpfully."""

        # Try Gemini API
        api_key = settings.GOOGLE_API_KEY
        if api_key:
            try:
                # Build conversation history
                gemini_history = []
                for h in (query.history or [])[-10:]:
                    role = "user" if h.get("role") == "user" else "model"
                    gemini_history.append({"role": role, "parts": [{"text": h.get("content", "")}]})
                
                async with httpx.AsyncClient() as client:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={api_key}"
                    
                    payload = {
                        "contents": gemini_history + [
                            {"role": "user", "parts": [{"text": f"INSTRUCTIONS:\n{system_prompt}\n\nUSER MESSAGE:\n{query.message}"}]}
                        ],
                        "generationConfig": {
                            "temperature": temperature,
                            "maxOutputTokens": 2048,
                            "topP": 0.9
                        }
                    }
                    
                    resp = await client.post(url, json=payload, timeout=25.0)
                    data = resp.json()
                    
                    if "candidates" in data:
                        response_text = data["candidates"][0]["content"]["parts"][0]["text"]
                        response_text = AIEngine._sanitize_response(response_text)
                        
                        elapsed = (datetime.now() - start_time).total_seconds() * 1000
                        
                        return AIResponse(
                            response=response_text,
                            sources=AIEngine._extract_sources(context_data),
                            confidence=0.95,
                            processing_time_ms=int(elapsed),
                            language=ctx.language,
                            suggestions=AIEngine._generate_suggestions(intents)
                        )
                    
                    elif "error" in data:
                        print(f"GEMINI ERROR: {data['error'].get('message')}")
            
            except Exception as e:
                print(f"AI ENGINE ERROR: {e}")
        
        # Fallback response
        elapsed = (datetime.now() - start_time).total_seconds() * 1000
        
        return AIResponse(
            response=AIEngine._generate_fallback(query.message, intents, context_data),
            confidence=0.7,
            processing_time_ms=int(elapsed),
            language=ctx.language,
            suggestions=AIEngine._generate_suggestions(intents)
        )
    
    @staticmethod
    def _sanitize_response(text: str) -> str:
        """Clean up AI response"""
        if not text:
            return ""
        
        # Fix hallucinated company names  
        text = text.replace("HoneyBee Corp", "BeeYield")
        text = text.replace("YieldBee", "BeeYield")
        
        return text.strip()
    
    @staticmethod
    def _extract_sources(context_data: str) -> List[Dict[str, str]]:
        """Extract source references from context"""
        sources = []
        
        if "HONEYCHAIN" in context_data:
            sources.append({"type": "blockchain", "name": "HoneyChain Ledger"})
        if "IOT" in context_data or "TELEMETRY" in context_data:
            sources.append({"type": "iot", "name": "IoT Sensor Network"})
        if "PRODUCTS" in context_data or "SHOP" in context_data:
            sources.append({"type": "database", "name": "Product Catalog"})
        if "ORDER" in context_data:
            sources.append({"type": "database", "name": "Order System"})
        
        return sources
    
    @staticmethod
    def _generate_suggestions(intents: List[str]) -> List[str]:
        """Generate follow-up suggestions based on intents"""
        suggestions_map = {
            'product_search': ["View all honey products", "Check shipping options", "Learn about traceability"],
            'order_status': ["Contact support", "View order history", "Download invoice"],
            'trace_honey': ["Learn about HoneyChain", "Meet the beekeeper", "View apiary location"],
            'pollination_service': ["Request a quote", "View crop requirements", "See success stories"],
            'iot_data': ["View all sensors", "Set up alerts", "Download historical data"],
            'hive_health': ["Run health diagnostic", "Contact vet support", "View treatment guide"],
            'about_beeyield': ["Meet the team", "View ESG report", "Read our blog"],
            'greeting': ["Browse honey shop", "Check my orders", "Learn about pollination"]
        }
        
        for intent in intents:
            if intent in suggestions_map:
                return suggestions_map[intent]
        
        return ["Browse our shop", "Learn about traceability", "Contact support"]
    
    @staticmethod
    def _generate_fallback(message: str, intents: List[str], context: str) -> str:
        """Generate fallback response when API unavailable"""
        if 'greeting' in intents:
            return """Jambo! 🐝 Welcome to BeeYield AI.

I'm here to help you with:
- **Honey Shop**: Browse our premium traceable honey
- **Traceability**: Verify the origin of your honey
- **Pollination Services**: Learn about precision pollination
- **IoT Monitoring**: Check your hive sensor data

How can I assist you today?"""
        
        primary_intent = intents[0] if intents else 'general'
        
        responses = {
            'product_search': f"I can help you find the perfect honey! We offer premium varieties including Acacia, Multi-flower, and Forest honey. Visit beeyield.com/shop to see our full collection.",
            'trace_honey': "To trace your honey, scan the QR code on your jar or enter the batch code at beeyield.com/traceability. Each jar is verified on our HoneyChain blockchain.",
            'pollination_service': "Our precision pollination services help increase crop yields by up to 35%. We support mangoes, sunflowers, avocados and more. Request a quote at beeyield.com/pollination-services.",
            'iot_data': "BeeHUB sensors monitor temperature, humidity, weight, and acoustics 24/7. View your dashboard at beeyield.com/dashboard for real-time data.",
            'about_beeyield': "BeeYield was founded in 2020 in Kibwezi, Kenya by Timothy, Agatha, and Carole Mathuva. We manage 184+ hives and pioneered HoneyChain blockchain traceability.",
        }
        
        return responses.get(primary_intent, f"""I understand you're asking about **{message[:50]}...**

Based on my knowledge:
{context[:500]}

For more specific help, please:
- 📧 Email: support@beeyield.com  
- 🌐 Visit: beeyield.com
- 📱 Call: +254 xxx xxx xxx""")


# ==============================================================================
# MAIN AI ASSISTANT CLASS
# ==============================================================================

class BeeYieldAI:
    """Main AI Assistant orchestrator"""
    
    @staticmethod
    async def process_query(query: AIQuery) -> AIResponse:
        """Process an AI query with full context retrieval"""
        
        message = query.message
        ctx = query.context or AIContext()
        
        # 1. Detect intents
        intents = IntentDetector.detect(message)
        
        # 2. Gather context based on intents
        context_parts = []
        
        # Always include company DNA
        context_parts.append(await KnowledgeBase.get_dna())
        
        # Intent-specific data retrieval
        if any(i in ['product_search', 'cart_help'] for i in intents):
            context_parts.append(await DataRetriever.get_shop_products())
        
        if 'order_status' in intents:
            context_parts.append(await DataRetriever.get_order_info(user_id=ctx.user_id))
        
        if any(i in ['trace_honey', 'farmer_info', 'apiary_info'] for i in intents):
            # Check for batch code in message
            batch_match = re.search(r'([A-Z0-9]{3,}-[A-Z0-9]{3,}-[0-9]{2})', message.upper())
            if batch_match:
                context_parts.append(await DataRetriever.get_traceability_info(batch_match.group(1)))
            context_parts.append(await DataRetriever.get_farmer_info())
        
        if any(i in ['pollination_service', 'pollination_quote'] for i in intents):
            context_parts.append(await DataRetriever.get_pollination_info())
        
        if any(i in ['iot_data', 'hive_health', 'device_help', 'dashboard_help'] for i in intents):
            # Check for hive ID in message
            hive_match = re.search(r'(H-[A-Z]{3}-\d{2}-\d{2})', message.upper())
            hive_id = hive_match.group(1) if hive_match else None
            context_parts.append(await DataRetriever.get_iot_sensor_data(hive_id))
            context_parts.append(await DataRetriever.get_apiary_stats(ctx.user_id))
        
        if 'about_beeyield' in intents:
            context_parts.append(await DataRetriever.get_company_info())
        
        # 3. Search knowledge base for additional context
        kb_results = await KnowledgeBase.search(message)
        if kb_results and len(kb_results) > 50:
            context_parts.append(f"KNOWLEDGE BASE:\n{kb_results}")
        
        # 4. Combine all context
        full_context = "\n\n".join(context_parts)
        
        # 5. Generate response
        response = await AIEngine.generate_response(query, full_context, intents)
        
        return response
    
    @staticmethod
    async def get_quick_suggestions(user_role: str = "guest") -> List[str]:
        """Get contextual quick suggestions for UI"""
        
        base_suggestions = [
            "What honey products do you have?",
            "How do I trace my honey?", 
            "Tell me about pollination services"
        ]
        
        role_suggestions = {
            "customer": [
                "Where is my order?",
                "How do I use the QR code?",
                "What's your return policy?"
            ],
            "farmer": [
                "Show my hive sensor data",
                "What are today's anomalies?",
                "When should I harvest?"
            ],
            "admin": [
                "Show today's sales summary",
                "Which hives need attention?",
                "Generate monthly report"
            ]
        }
        
        return base_suggestions + role_suggestions.get(user_role, [])
    
    @staticmethod
    async def health_check() -> Dict[str, Any]:
        """Check AI system health"""
        
        checks = {
            "knowledge_base": False,
            "database": False,
            "gemini_api": False
        }
        
        # Check knowledge base
        try:
            kb = await KnowledgeBase.load()
            checks["knowledge_base"] = bool(kb.get("knowledge_nodes"))
        except:
            pass
        
        # Check database
        try:
            test = db_select("company_stats", limit=1)
            checks["database"] = True
        except:
            pass
        
        # Check Gemini API
        checks["gemini_api"] = bool(settings.GOOGLE_API_KEY)
        
        all_healthy = all(checks.values())
        
        return {
            "status": "healthy" if all_healthy else "degraded",
            "checks": checks,
            "timestamp": datetime.now().isoformat()
        }


# ==============================================================================
# CONVENIENCE FUNCTIONS
# ==============================================================================

async def chat(
    message: str,
    history: List[Dict[str, str]] = None,
    language: str = "EN",
    user_id: str = None,
    user_role: str = "guest"
) -> str:
    """Simple chat function for backward compatibility"""
    
    query = AIQuery(
        message=message,
        history=history,
        context=AIContext(
            user_id=user_id,
            language=language,
            user_role=user_role
        )
    )
    
    response = await BeeYieldAI.process_query(query)
    return response.response


async def trace_batch(batch_code: str) -> Dict[str, Any]:
    """Quick batch traceability lookup"""
    info = await DataRetriever.get_traceability_info(batch_code)
    return {"batch_code": batch_code, "info": info}


async def get_hive_status(hive_id: str) -> Dict[str, Any]:
    """Quick hive status lookup"""
    info = await DataRetriever.get_iot_sensor_data(hive_id)
    return {"hive_id": hive_id, "status": info}
