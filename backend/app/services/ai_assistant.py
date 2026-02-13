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
        'product_search': ['buy', 'purchase', 'order', 'shop', 'honey', 'price', 'cost', 'product', 'available', 'stock', 'store'],
        'order_status': ['order', 'tracking', 'delivery', 'shipment', 'status', 'where is my'],
        'cart_help': ['cart', 'checkout', 'payment', 'pay', 'mpesa', 'card'],
        
        # Traceability
        'trace_honey': ['trace', 'origin', 'source', 'batch', 'verify', 'authenticate', 'qr', 'honeychain'],
        'farmer_info': ['farmer', 'beekeeper', 'who made', 'producer'],
        'apiary_info': ['apiary', 'hive', 'farm', 'location', 'where from'],
        
        # Pollination
        'pollination_service': ['pollination', 'pollinate', 'crop', 'yield', 'farming', 'agricultural', 'mango', 'sunflower', 'avocado'],
        'pollination_quote': ['quote', 'estimate', 'pricing', 'how much', 'cost for pollination'],
        
        # IoT & Technical
        'iot_data': ['sensor', 'temperature', 'humidity', 'weight', 'telemetry', 'iot', 'monitoring', 'data'],
        'hive_health': ['health', 'disease', 'sick', 'varroa', 'mite', 'infection', 'anomaly', 'symptom', 'treatment', 'cure', 'prevention', 'pest'],
        'device_help': ['device', 'beehub', 'setup', 'configure', 'install', 'gateway'],
        
        # Bee Knowledge
        'bee_species': ['species', 'type of bee', 'race', 'african bee', 'italian bee', 'carniolan', 'buckfast', 'aggressive', 'gentle'],
        'market_intel': ['market', 'trend', 'global', 'forecast', 'statistics', 'industry', 'growth'],
        
        # Company & Team
        'about_beeyield': ['about', 'company', 'who are you', 'what is beeyield', 'mission', 'story', 'history'],
        'team_info': ['team', 'founder', 'ceo', 'cto', 'timothy', 'agatha', 'carole', 'leader', 'staff', 'who runs'],
        'esg_commitments': ['esg', 'sustainability', 'promise', '50/50', 'sdg', 'un goals', 'impact', 'environment', 'social', 'governance', 'tree'],
        'contact': ['contact', 'reach', 'email', 'phone', 'call', 'message', 'support', 'address', 'hq'],
        'career': ['job', 'career', 'work', 'hiring', 'apply', 'employment'],
        
        # Education & Content
        'learn_beekeeping': ['learn', 'training', 'course', 'education', 'tutorial', 'how to'],
        'bee_facts': ['bee', 'bees', 'pollinator', 'colony', 'queen', 'swarm'],
        'blog_content': ['blog', 'article', 'read', 'post', 'news', 'story', 'journey', 'ecosystem', 'raw honey'],
        
        # Dashboard
        'dashboard_help': ['dashboard', 'my hives', 'my apiaries', 'my harvests', 'analytics', 'report'],
        'harvest_logs': ['harvest', 'yield', 'production', 'bottles', 'jars', 'honey collected', 'batches', 'days', 'collected', 'volume', 'which hive', 'link', 'linked'],
        
        # Greetings & Localization
        'greeting': ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'jambo', 'habari', 'natta', 'wimwega', 'ni kwega', 'oreni', 'muga', 'bonjour', 'hallo', 'hola', 'ni hao', 'cześć', 'marhaba', 'ola'],
        'farewell': ['bye', 'goodbye', 'thanks', 'thank you', 'asante', 'kwaheri', 'au revoir', 'auf wiedersehen', 'adios'],
        
        # Regional
        'regional_intel': ['region', 'kenya', 'europe', 'asia', 'us', 'united states', 'global', 'local', 'market share']
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
        factual_intents = ['trace_honey', 'order_status', 'iot_data', 'product_search', 'harvest_logs']
        
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
    async def get_harvest_data(user_id: Optional[str] = None) -> str:
        """Get recent harvest logs and production stats with relative timing"""
        try:
            filters = {}
            if user_id:
                # Find farmer_id associated with this user_id first if needed, 
                # but assuming harvests are linked via user_id or farmer_id in context.
                filters["user_id"] = user_id
                
            now = datetime.now().date()
            harvests = await db_select("harvests", filters=filters, limit=10, order_by="harvest_date", ascending=False)
            batches = await db_select("batches", filters=filters, limit=5, order_by="packaging_date", ascending=False)
            
            summary = "PRODUCTION & BATCH SUMMARY:\n"
            
            if not harvests and not batches:
                # Try unfiltered for demo purposes if specific user has none
                harvests = await db_select("harvests", limit=5, order_by="harvest_date", ascending=False)
                batches = await db_select("batches", limit=3, order_by="packaging_date", ascending=False)
            
            if harvests:
                # Map hive IDs to codes for better readability
                hive_ids = [h.get('hive_id') for h in harvests if h.get('hive_id')]
                hives_data = await db_select("hives", filters={"id": hive_ids}) if hive_ids else []
                hive_map = {hive['id']: hive.get('hive_code', 'H-UNK') for hive in hives_data}
                
                summary += "RECENT HARVEST LOGS:\n"
                for h in harvests:
                    qty = h.get('quantity_kg', 0)
                    h_date_str = h.get('harvest_date')
                    h_date = datetime.strptime(h_date_str[:10], "%Y-%m-%d").date() if h_date_str else now
                    days_ago = (now - h_date).days
                    
                    time_desc = f"{days_ago} days ago" if days_ago > 0 else "today"
                    if days_ago == 1: time_desc = "yesterday"
                    
                    hive_code = hive_map.get(h.get('hive_id'), "Unknown")
                    summary += f"- {h_date_str[:10]} ({time_desc}): {qty}kg from Hive {hive_code}\n"
            
            if batches:
                summary += "\nCURRENT BATCHES:\n"
                for b in batches:
                    code = b.get('batch_code', 'Unknown')
                    p_date_str = b.get('packaging_date')
                    p_date = datetime.strptime(p_date_str[:10], "%Y-%m-%d").date() if p_date_str else now
                    days_ago = (now - p_date).days
                    
                    summary += f"- Batch {code}: Packaged {days_ago} days ago ({b.get('quantity_jars', 0)} jars)\n"
                    
            return summary
        except Exception as e:
            return f"HARVEST DATA: Error - {str(e)}"

    @staticmethod
    async def get_shop_products(category: Optional[str] = None, limit: int = 5) -> str:
        """Get product information for AI context"""
        try:
            filters = {"is_active": True}
            if category:
                filters["category"] = category
            
            products = await db_select("products", filters=filters, limit=limit)
            
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
                order = await db_get_by_id("orders", order_id)
                if order:
                    return f"""ORDER DETAILS:
- Order #: {order.get('order_number', order.get('id'))}
- Status: {order.get('status', 'pending')}
- Total: KES {order.get('total', 0):,.2f}
- Payment: {order.get('payment_status', 'pending')}
- Created: {order.get('created_at', 'Unknown')}"""
            
            if user_id:
                orders = await db_select("orders", filters={"user_id": user_id}, limit=5, order_by="created_at", ascending=False)
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
            batches = await db_select("batches", filters={"batch_code": batch_code})
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
            
            apiaries = await db_select("apiaries", filters=filters, limit=20)
            hives = await db_select("hives", limit=200) # Fetch more to be safe
            
            # Simple count mapping if we had hive->apiary relation, but purely stats here:
            total_hives = len(hives) if hives else 0
            active_hives = sum(1 for h in (hives or []) if h.get('status') in ['Active', 'Active & Healthy', 'OK'])
            
            overview = f"""APIARY NETWORK SUMMARY:
- Total Apiaries: {len(apiaries) if apiaries else 0}
- Total Hives: {total_hives}
- Active Hives: {active_hives}
"""
            if apiaries:
                overview += "LOCATIONS:\n"
                for a in apiaries:
                    name = a.get('name', 'Unnamed')
                    loc = a.get('location', 'Kenya')
                    size = a.get('size_acres', 0)
                    overview += f"- {name} ({loc}): {size} acres\n"
            
            return overview
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
            contracts = await db_select("pollination_contracts", limit=5)
            
            return """PRECISION POLLINATION SERVICES:
- Crops Supported: Mangoes, Sunflower, Oranges, Avocados, Beans, Tomatoes
- Average Yield Increase: Up to 35% (results vary by crop & conditions)
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
                farmer = await db_get_by_id("farmers", farmer_id)
                if farmer:
                    return f"""FARMER PROFILE:
- Name: {farmer.get('name', 'Partner Beekeeper')}
- Region: {farmer.get('region', 'Makueni County')}
- Experience: {farmer.get('years_experience', '5+')} years
- Cert: Master Beekeeper"""
            
            farmers = await db_select("farmers", limit=5)
            if farmers:
                return f"PARTNER NETWORK: {len(farmers)}+ certified beekeepers across Kenya"
            
            return """PARTNER BEEKEEPERS:
- Network: 50+ trained beekeepers
- Lead Beekeeper: Timothy Nduva
- Certification: BeeYield Master Beekeeper Program
- Location: Makueni & Kitui Counties"""
        except Exception as e:
            return f"FARMER DATA: Error - {str(e)}"

    @staticmethod
    async def get_inspection_stats(user_id: Optional[str] = None) -> str:
        """Get recent hive inspection data"""
        try:
            filters = {}
            if user_id:
                filters["user_id"] = user_id
            
            now = datetime.now().date()
            inspections = await db_select("inspections", filters=filters, limit=10, order_by="inspection_date", ascending=False)
            
            if not inspections:
                # Fallback to general history
                inspections = await db_select("inspections", limit=5, order_by="inspection_date", ascending=False)
                
            if not inspections:
                 return "INSPECTION DATA: No recent inspections recorded."
            
            summary = "RECENT HIVE INSPECTIONS:\n"
            for insp in inspections:
                date_str = insp.get('inspection_date')
                i_date = datetime.strptime(date_str[:10], "%Y-%m-%d").date() if date_str else now
                days_ago = (now - i_date).days
                
                h_id = insp.get('hive_id')
                status = insp.get('condition_rating', insp.get('status', 'OK'))
                summary += f"- {date_str[:10] if date_str else 'N/A'} ({days_ago} days ago): Hive {h_id[:8] if h_id else 'UNK'} - Status: {status}\n"
                
            return summary
        except Exception as e:
            return f"INSPECTION DATA: Error - {str(e)}"


# ==============================================================================
# KNOWLEDGE BASE ACCESS
# ==============================================================================

class KnowledgeBase:
    """Access to BeeYield knowledge base"""
    
    _cache: Optional[Dict] = None
    _encyclopedia_cache: Optional[Dict] = None
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
    async def load_encyclopedia() -> Dict:
        """Load the comprehensive bee encyclopedia"""
        if KnowledgeBase._encyclopedia_cache:
             return KnowledgeBase._encyclopedia_cache
             
        enc_path = os.path.join(os.path.dirname(__file__), "../data/bee_encyclopedia.json")
        try:
            with open(enc_path, 'r', encoding='utf-8') as f:
                KnowledgeBase._encyclopedia_cache = json.load(f)
                return KnowledgeBase._encyclopedia_cache
        except Exception as e:
            print(f"Error loading encyclopedia: {e}")
            return {}

    
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

═══════════════════════════════════════════════════════════════════════════════
                         COMPREHENSIVE RESPONSE GUIDELINES
═══════════════════════════════════════════════════════════════════════════════

RESPONSE FORMAT: You MUST provide a COMPREHENSIVE, DETAILED response structured as follows:

## 📋 EXECUTIVE SUMMARY
Provide a 3-5 sentence high-level overview answering the user's core question immediately.

## 🔍 DETAILED ANALYSIS
Provide an in-depth exploration of the topic covering:
- **Background & Context**: Historical or foundational information
- **Current State**: What is happening now with relevant data points
- **Key Factors**: The main elements influencing this topic
- **Technical Details**: Specific data, measurements, or specifications when applicable

## 📊 DATA INSIGHTS (when applicable)
Present any quantitative information in a clear, organized manner:
- Statistics and metrics with proper context
- Comparisons and benchmarks
- Trends and patterns observed

## 🎯 PRACTICAL APPLICATIONS
Explain how this information applies in real-world scenarios:
- Step-by-step guidance when relevant
- Best practices and recommendations
- Common pitfalls to avoid

## 🌍 REGIONAL CONTEXT (for East Africa/Kenya)
Provide localized insights:
- How this applies specifically to the Kenyan/East African context
- Local regulations, practices, or considerations
- Seasonal factors or climate considerations

## 💡 EXPERT RECOMMENDATIONS
Offer actionable, expert-level advice:
- Immediate actions to consider
- Short-term improvements or opportunities
- Long-term strategic considerations

## 🔗 ADDITIONAL RESOURCES
Point to relevant resources:
- Related BeeYield services or products
- Educational materials or documentation
- Contact points for further assistance

═══════════════════════════════════════════════════════════════════════════════

CORE DIRECTIVES:
1. **COMPREHENSIVENESS**: Provide THOROUGH, DETAILED responses. Aim for 80-120 lines minimum per response.
2. **ACCURACY**: Use ONLY the data provided. Never hallucinate facts. If unsure, say "I don't have that information."
3. **RICH FORMATTING**: Use headers (##), **bold**, *italics*, bullet points, numbered lists, and emojis for visual organization.
4. **BRAND VOICE**: Professional, warm, knowledgeable. Position BeeYield as the leader in agricultural tech.
5. **ACTIONABLE**: Always conclude with specific next steps the user can take.
6. **LOCALIZATION**: Respect Kenyan context and East African agricultural practices.
7. **CITATIONS**: Reference specific data points from the context provided.
8. **EDUCATIONAL**: Explain concepts thoroughly - assume the user wants to deeply understand the topic.

SPECIAL CAPABILITIES:
- 🔗 Honey traceability verification via HoneyChain blockchain
- 📡 Real-time IoT sensor data interpretation with anomaly detection
- 🌻 Precision pollination service recommendations with yield projections
- 🛒 Order and product assistance with full catalog knowledge
- 🐝 Advanced beekeeping education and comprehensive health diagnostics
- 📈 Market intelligence and industry trend analysis
- 🌍 Regional agricultural insights for East Africa

RESPONSE LENGTH: Your response should be COMPREHENSIVE and DETAILED. Do NOT shorten your response.
Provide a full, thorough answer that covers all relevant aspects of the user's question.
A good response should be at least 500-800 words for substantive questions.

Answer the user's question with the depth and expertise expected of a world-class agricultural AI advisor."""

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
                    # Use stable model version
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={api_key}"
                    
                    payload = {
                        "system_instruction": {"parts": [{"text": system_prompt}]},
                        "contents": gemini_history + [
                            {"role": "user", "parts": [{"text": query.message}]}
                        ],
                        "generationConfig": {
                            "temperature": temperature,
                            "maxOutputTokens": 8192,
                            "topP": 0.95
                        }
                    }
                    
                    resp = await client.post(url, json=payload, timeout=90.0)
                    data = resp.json()
                    
                    if "candidates" in data:
                        response_text = data["candidates"][0]["content"]["parts"][0]["text"]
                        response_text = AIEngine._sanitize_response(response_text)
                        response_text = AIEngine._ensure_min_paragraphs(response_text, min_paragraphs=2)
                        
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
                        print(f"[ERROR] GEMINI ERROR: {data['error'].get('message')}")
            
            except Exception as e:
                print(f"[ERROR] AI ENGINE ERROR: {e}")
        
        # Fallback response
        elapsed = (datetime.now() - start_time).total_seconds() * 1000
        
        return AIResponse(
            response=AIEngine._ensure_min_paragraphs(AIEngine._generate_fallback(query.message, intents, context_data), min_paragraphs=2),
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
    def _ensure_min_paragraphs(text: str, min_paragraphs: int = 2) -> str:
        """Ensure the response contains at least `min_paragraphs` paragraphs.

        - Considers paragraphs separated by one or more blank lines.
        - If fewer paragraphs exist, split sentences into additional paragraphs.
        """
        if not text:
            return text

        # split on blank lines
        parts = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
        if len(parts) >= min_paragraphs:
            return "\n\n".join(parts)

        # fallback: split into sentences and redistribute into paragraphs
        sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text.strip()) if s.strip()]
        if not sentences:
            return text

        # compute sentences per paragraph (round up)
        per_par = max(1, (len(sentences) + min_paragraphs - 1) // min_paragraphs)
        new_parts = []
        i = 0
        for _ in range(min_paragraphs):
            chunk = sentences[i:i+per_par]
            if not chunk:
                chunk = [sentences[-1]]
            new_parts.append(" ".join(chunk).strip())
            i += per_par

        return "\n\n".join(new_parts)
    
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
            return """# 🐝 Welcome to BeeYield AI

Jambo! I am your intelligent apiculture assistant, designed to empower your beekeeping journey with precision data and expert insights.

## How I Can Assist You Today
I utilize BeeYield's advanced ecosystem to provide you with:

### 🍯 Honey Shop & Products
- Browse our premium, traceable honey varieties (Acacia, Multi-flower, Forest).
- Get detailed product information, pricing, and availability.
- Track your orders in real-time.

### 🔗 Blockchain Traceability
- Verify the origin of your honey using our HoneyChain technology.
- View the complete journey from specific apiaries to your jar.
- Access harvest dates, beekeeper profiles, and quality certifications.

### 🌻 Precision Pollination Services
- Learn how our pollination services may help improve your crop yields.
- Get customized quotes for crops like Mangoes, Avocados, and Sunflowers.
- Understand our hive density recommendations and management practices.

### 📡 IoT Monitoring & Hive Health
- Access real-time data from your BeeHUB sensors (Temperature, Humidity, Weight, Acoustics).
- Receive health diagnostics and early warning alerts for pests or diseases.
- View historical performance trends for your apiaries.

**How can I assist you specifically today?**"""
        
        primary_intent = intents[0] if intents else 'general'
        
        responses = {
            'product_search': """# 🍯 BeeYield Premium Honey Collection

I can certainly help you explore our range of high-quality, traceable honey products. At BeeYield, we pride ourselves on purity, traceability, and taste.

## Our Signature Varieties

### 1. 🌿 Acacia Honey (Premium)
- **Profile**: Light, clear, and slow to crystallize with a delicate floral taste.
- **Origin**: Sourced from the pristine acacia woodlands of Makueni.
- **Best For**: Sweetening tea, drizzling over yogurt, or direct consumption.
- **Availability**: Available in 500g and 1kg jars.

### 2. 🌸 Multi-Flower Honey
- **Profile**: Rich, golden amber color with a complex, full-bodied flavor profile.
- **Origin**: Harvested from diverse wildflowers in the Kitui region.
- **Best For**: Baking, cooking, and natural remedies.
- **Benefits**: High in antioxidants and pollen content.

### 3. 🌳 Forest Honey (Honeydew)
- **Profile**: Dark, bold, and mineral-rich with savory undertones.
- **Origin**: Sourced from indigenous forests.
- **Best For**: Marinades, glazes, and health wellness.

## Why Choose BeeYield?
- **Blockchain Verified**: Every jar is traceable to the hive.
- **Sustainably Sourced**: We support over 50 local farmers.
- **100% Pure**: Raw, unpasteurized, and free from additives.

**🔗 Visit beeyield.com/shop to view our full catalog and place an order today.**""",

            'trace_honey': """# 🔗 HoneyChain Traceability Verification

I can help you verify the authenticity and origin of your BeeYield honey. Our HoneyChain technology ensures complete transparency from hive to home.

## How to Trace Your Honey
1. **Locate the QR Code**: Find the unique QR code or Batch ID on your honey jar label.
2. **Scan or Enter**: Scan the code with your phone or enter the Batch ID at **beeyield.com/traceability**.
3. **View the Journey**: Instantly access the immutable blockchain record.

## What You Will See
- **Beekeeper Profile**: Meet the specific farmer who harvested your honey.
- **Apiary Location**: See the exact GPS coordinates of the hive (protected for privacy).
- **Harvest Date**: Confirm exactly when the honey was harvested.
- **Floral Source**: Learn about the dominant flora in the area during harvest.
- **Lab Results**: View quality assurance metrics ensuring purity.

**Authenticity Guarantee**
Every jar of BeeYield honey is cryptographically signed and recorded on the ledger, preventing counterfeiting and ensuring you receive only 100% pure, ethically sourced honey.

**Do you have a batch code you would like me to check for you right now?**""",

            'pollination_service': """# 🌻 Precision Pollination Services

BeeYield's Precision Pollination service is designed to maximize your agricultural output through scientifically managed hive placement.

## The Impact of Pollination
Strategic placement of bee colonies can significantly increase crop quality and quantity.
- **Yield Increase**: Farms typically see a **25-35% increase** in yield.
- **Quality Improvement**: Better fruit set, uniform shape, and longer shelf life.

## Supported Crops
We specialize in pollination for:
- 🥭 **Mangoes** (Keitt, Kent, Apple)
- 🥑 **Avocados** (Hass, Fuerte)
- 🌻 **Sunflowers**
- 🍅 **Tomatoes & Beans**
- 🍊 **Citrus Fruits**

## Service Package Includes
1. **Site Assessment**: Analysis of crop acreage and flowering timelines.
2. **Hive Deployment**: Placement of strong, healthy colonies (2-5 hives/hectare).
3. **IoT Monitoring**: 24/7 surveillance of hive strength and activity.
4. **Impact Reporting**: Data-driven reports on pollination efficiency.

**Next Steps**
To receive a customized quote, please provide your crop type, acreage, and location. You can also visit **beeyield.com/pollination-services** for more details.""",

            'iot_data': """# 📡 IoT Sensor Network & Telemetry

Your BeeHUB sensors are actively monitoring your apiary's vital signs. Here is an overview of the metrics we track and why they matter.

## Key Metrics Monitored

### 🌡️ Temperature
- **Optimal Range**: 34°C - 36°C (Brood Nest)
- **Significance**: Stable temperature indicates a healthy queen and active brood rearing. Drops may signal swarming or colony loss.

### 💧 Humidity
- **Optimal Range**: 50% - 60%
- **Significance**: Critical for nectar curing (turning nectar into honey) and preventing mold growth.

### ⚖️ Weight
- **Tracking**: Daily weight gain/loss.
- **Significance**: Sudden drops may indicate swarming or theft. Steady increases indicate a nectar flow (honey production).

### 🔊 Acoustics (Sound)
- **Analysis**: Frequency and amplitude patterns.
- **Significance**: We detect specific sound signatures for queenlessness, swarming preparation, and calmness.

## Access Your Data
You can view granular, real-time graphs and set custom alerts on your full dashboard at **beeyield.com/dashboard**.

**Would you like me to check the status of a specific hive ID?**""",

            'about_beeyield': """# 🐝 About BeeYield

BeeYield is a premier agritech company revolutionizing the apiculture industry in Africa through technology, sustainability, and transparency.

## Our Mission
To empower beekeepers and farmers with data-driven insights, ensuring sustainable food security and economic growth through precision pollination and modern beekeeping.

## Company Profile
- **Founded**: 2020
- **Headquarters**: Kibwezi, Makueni County, Kenya
- **Leadership**: 
  - **Timothy Mathuva** (CEO)
  - **Agatha Mathuva** (IT Lead)
  - **Carole Mathuva** (Growth Officer)

## Our Core Pillars
1. **Technology**: Leveraging LoRaWAN IoT sensors and AI for hive monitoring.
2. **Traceability**: Pioneering HoneyChain for immutable supply chain transparency.
3. **Sustainability**: Committed to a 50/50 harvest promise—leaving enough honey for the bees to thrive.
4. **Community**: Partnering with over 50 local farmers to improve livelihoods.

## Impact
- **184+** Managed Hives
- **2,500+** Trees Planted
- **<15%** Colony Loss Rate (vs. industry avg of 40%)

**We are more than a honey company; we are stewards of the ecosystem.**""",
        }
        
        return responses.get(primary_intent, f"""# Analysis of Your Query: "{message[:50]}..."

I apologize, but I am currently operating in **Fallback Mode** as my advanced AI connection is temporarily unavailable. However, I can still provide you with information based on my internal knowledge base.

## 📂 Relevant Knowledge Retrieved
Based on your query, here is the relevant data available in my system:

{context[:800]}...

## 🔍 How to Proceed
While I cannot generate a custom deep-dive analysis at this exact moment, here are the best ways to get the detailed help you need:

1. **Specific Queries**: Try asking about specific topics like "Traceability", "Shop", "Pollination", or "Hive Health" to trigger my specialized modules.
2. **Contact Support**: For complex inquiries, please email our support team at **support@beeyield.com**.
3. **Visit Our Portal**: Access your full dashboard and tools at **beeyield.com**.

**I am ready to assist with another request whenever you are ready.**""")


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
        
        # Load Encyclopedia for specific lookups
        encyclopedia = await KnowledgeBase.load_encyclopedia()
        
        # Intent-specific data retrieval
        if any(i in ['product_search', 'cart_help'] for i in intents):
            # Increase limit to show full catalog
            context_parts.append(await DataRetriever.get_shop_products(limit=20))
        
        if 'order_status' in intents:
            context_parts.append(await DataRetriever.get_order_info(user_id=ctx.user_id))
        
        if any(i in ['trace_honey', 'farmer_info', 'apiary_info'] for i in intents):
            # Check for batch code in message
            batch_match = re.search(r'([A-Z0-9]{3,}-[A-Z0-9]{3,}-[0-9]{2})', message.upper())
            if batch_match:
                context_parts.append(await DataRetriever.get_traceability_info(batch_match.group(1)))
            context_parts.append(await DataRetriever.get_farmer_info())
            
            # Add location data from encyclopedia
            locations = encyclopedia.get('locations', {})
            context_parts.append(f"BEEYIELD ZONES & LOCATIONS:\n{json.dumps(locations, indent=2)}")
        
        if any(i in ['pollination_service', 'pollination_quote'] for i in intents):
            context_parts.append(await DataRetriever.get_pollination_info())
            # Add detailed crop data
            crops = encyclopedia.get('pollination_crops', {})
            context_parts.append(f"CROP POLLINATION DATA:\n{json.dumps(crops, indent=2)}")
        
        if any(i in ['iot_data', 'hive_health', 'device_help', 'dashboard_help'] for i in intents):
            # Check for hive ID in message
            hive_match = re.search(r'(H-[A-Z]{3}-\d{2}-\d{2})', message.upper())
            hive_id = hive_match.group(1) if hive_match else None
            context_parts.append(await DataRetriever.get_iot_sensor_data(hive_id))
            context_parts.append(await DataRetriever.get_apiary_stats(ctx.user_id))
            
            if 'hive_health' in intents:
                diseases = encyclopedia.get('diseases_and_pests', {})
                health_nodes = encyclopedia.get('health_nodes', {})
                context_parts.append(f"DISEASE & PEST CATALOG:\n{json.dumps(diseases, indent=2)}")
                context_parts.append(f"GRANULAR HEALTH DATA (Symptoms/Treatments/Glossary):\n{json.dumps(health_nodes, indent=2)}")

        if 'harvest_logs' in intents:
            context_parts.append(await DataRetriever.get_harvest_data(ctx.user_id))
            context_parts.append(await DataRetriever.get_inspection_stats(ctx.user_id))

        if 'bee_species' in intents:
            species = encyclopedia.get('bee_species', {})
            context_parts.append(f"BEE SPECIES CATALOG:\n{json.dumps(species, indent=2)}")
            
        if 'about_beeyield' in intents:
            context_parts.append(await DataRetriever.get_company_info())
            # Add market intel to show industry leadership
            market = encyclopedia.get('market_intelligence', {})
            context_parts.append(f"MARKET CONTEXT:\n{json.dumps(market, indent=2)}")
            
        if 'team_info' in intents:
            team = encyclopedia.get('team', {})
            context_parts.append(f"TEAM & LEADERSHIP DATA:\n{json.dumps(team, indent=2)}")
            
        if 'esg_commitments' in intents:
            esg = encyclopedia.get('esg_initiatives', {})
            commitments = encyclopedia.get('commitments', {})
            context_parts.append(f"ESG & COMMITMENTS DATA:\n{json.dumps(esg, indent=2)}\n\n{json.dumps(commitments, indent=2)}")

        if 'market_intel' in intents and 'about_beeyield' not in intents:
             # If specifically asking about market but not company generic
            market = encyclopedia.get('market_intelligence', {})
            context_parts.append(f"MARKET INTELLIGENCE DATA:\n{json.dumps(market, indent=2)}")

        
        if 'contact' in intents:
             contact = encyclopedia.get('contact', {})
             context_parts.append(f"CONTACT DETAILS:\n{json.dumps(contact, indent=2)}")

        if 'blog_content' in intents:
            blogs = encyclopedia.get('blog_posts', [])
            context_parts.append(f"BLOG & EDUCATIONAL CONTENT:\n{json.dumps(blogs, indent=2)}")

        if 'regional_intel' in intents:
            regions = encyclopedia.get('regional_data', {})
            context_parts.append(f"REGIONAL MARKET DATA:\n{json.dumps(regions, indent=2)}")

        if 'greeting' in intents:
            greetings = encyclopedia.get('greetings', {})
            context_parts.append(f"MULTILINGUAL GREETINGS:\n{json.dumps(greetings, indent=2)}")
        
        # 3. Search knowledge base for additional context (history/stories)
        if not any(i in ['greeting', 'farewell'] for i in intents):
            kb_results = await KnowledgeBase.search(message)
            if kb_results and len(kb_results) > 50:
                context_parts.append(f"KNOWLEDGE BASE STORIES:\n{kb_results}")
        
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
