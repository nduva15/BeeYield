from typing import List, Dict, Any, Optional
import json
import httpx
import os
import asyncio
from app.db.supabase_db import db_select
from app.core.config import settings
from app.services.content_service import ContentService
from app.services.bee_health_ai import BeeHealthAI
from app.blockchain.honey_chain import honey_blockchain

class AIService:
    @staticmethod
    def get_beeyield_context(language: str = 'EN') -> str:
        """
        Gathers comprehensive, high-depth information from the BeeYield project.
        """
        return """
        BeeYield Hub: The Technical Frontier of African Beekeeping
        
        BEE YIELD MASTER CORPORATE DATA:
        - Founders: Timothy Mathuva (CEO), Carole Mathuva (CGO), Agatha Mathuva (IT Head).
        - Impact Metrics: 2,500+ Trees planted; 25+ Acres pollinated; 25+ Partner farmers supported.
        - Operational Assets: 184 Smart Hives in active management; 5-Acre fenced apiary in Kibwezi.
        - Production Stats: 883 Kgs+ of raw, traceable honey harvested.
        - Corporate Contact: Phone: +254 712 345 678 | Email: info@beeyield.co.ke | Web: www.beeyield.co.ke.
        - Head Office: Kibwezi, Makueni County, Kenya.
        - Core Specialized Crops: Watermelons, Avocados, Mangoes, Macadamias, Onions, and Beans.
        """

    @staticmethod
    def get_language_name(code: str) -> str:
        mapping = {
            'EN': 'English',
            'FR': 'French',
            'DE': 'German',
            'ES': 'Spanish',
            'SW': 'Kiswahili',
            'ZH': 'Chinese (Mandarin)',
            'PL': 'Polish'
        }
        return mapping.get(code.upper(), 'English')

    @staticmethod
    async def chat(
        message: str, 
        history: List[Dict[str, str]] = None, 
        language: str = 'EN',
        current_time: str = None,
        current_date: str = None
    ) -> str:
        """
        Sends a message to the AI with high-depth BeeYield context and Modern AI reasoning.
        Primary: Gemini | Secondary: OpenAI | Fallback: Expert Logic.
        """
        msg_lower = message.lower().strip()
        target_lang = AIService.get_language_name(language)
        is_sw = (language.upper() == 'SW')
        
        # --- TECHNICAL DATA AGGREGATION ---
        # Fetch website data dynamically
        website_summary = await ContentService.get_website_knowledge_summary()
        
        # Intent Detection for Health Analysis
        health_context = ""
        health_keywords = ["health", "status", "anomaly", "disease", "sick", "prediction", "check hive", "analyze"]
        if any(kw in msg_lower for kw in health_keywords):
            # Try to extract a hive ID if present, otherwise use default demo ID
            hive_id = "H-KIB-01-01" 
            if "h-kib" in msg_lower:
                for word in msg_lower.split():
                    if word.startswith("h-kib"):
                        hive_id = word.upper()
                        break
            
            sensor_data = honey_blockchain.get_latest_sensor_data(hive_id)
            if sensor_data:
                health_report = await BeeHealthAI.analyze_hive_health(hive_id, sensor_data)
                health_context = f"\nLIVE HIVE HEALTH DATA ({hive_id}):\n{json.dumps(health_report, indent=2)}\n"
        
        # Comprehensive internal link pool
        all_links = [
            "PROFESSIONAL POLLINATION: [Insert Link: beeyield.com/crops-we-pollinate]",
            "BEEKEEPING NETWORK: [Insert Link: beeyield.com/pollination-solutions]",
            "BEEYIELD SHOP: [Insert Link: beeyield.com/shop]",
            "TRACEABILITY HUB: [Insert Link: beeyield.com/traceability]",
            "IMPACT & ESG: [Insert Link: beeyield.com/impact]",
            "CORPORATE CONTACT: [Insert Link: beeyield.com/contact]",
            "ABOUT OUR TEAM: [Insert Link: beeyield.com/about]",
            "GLOBAL HIVE NETWORK: [Insert Link: beeyield.com/global-hive-network]",
            "PRECISION TECHNOLOGY: [Insert Link: beeyield.com/precision-pollination]",
            "BEEYIELD DASHBOARD: [Insert Link: beeyield.com/beeyield-dashboard]",
            "BEE HEALTH & DISEASES: [Insert Link: beeyield.com/diseases]",
            "MEDIA & BLOG: [Insert Link: beeyield.com/blogs]"
        ]

        # --- GREETINGS LOGIC ---
        greetings_keywords = ["hi", "hello", "hey", "habari", "jambo", "good morning", "good afternoon", "good evening", "morning", "afternoon", "evening"]
        if any(msg_lower == kw or msg_lower.startswith(kw + " ") for kw in greetings_keywords) and len(msg_lower.split()) <= 4:
            hour = int(current_time.split(':')[0]) if current_time else 12
            greet_msg = "Habari za mchana" if hour < 17 and hour >= 12 else ("Habari za asubuhi" if hour < 12 else "Habari za jioni")
            if not is_sw:
                greet_msg = "Good afternoon" if hour < 17 and hour >= 12 else ("Good morning" if hour < 12 else "Good evening")
            
            inner_greet = f"Jambo! {greet_msg}. Mimi ni BeeYield AI. Tunaweza kukusaidieje leo?" if is_sw else f"Hi! {greet_msg}. I am BeeYield AI Assistant with expert-level BeeHealth and Traceability reasoning. How can we assist you today?"
            return (
                f"{'KARIBU KWENYE BEE AI HUB' if is_sw else 'WELCOME TO THE BEE AI HUB'}\n\n"
                f"{inner_greet}\n\n"
                f"1. ANALYTICAL REASONING: I use proprietary ML algorithms to detect anomalies and predict disease risks.\n\n"
                f"2. WEBSITE KNOWLEDGE: I am synced with our latest beekeeping guides and shop products.\n\n"
                f"3. PRECISION DATA: Ask me to 'Analyze H-KIB-01-01' for a live health diagnostic.\n\n"
                "RESOURCE DIRECTORY:\n"
                "1. BEEYIELD SHOP: [Insert Link: beeyield.com/shop]\n"
                "2. TRACEABILITY HUB: [Insert Link: beeyield.com/traceability]\n"
                "3. CORPORATE CONTACT: [Insert Link: beeyield.com/contact]\n\n"
                "How can I assist with your beekeeping intelligence today?"
            )

        # --- AI PROMPT PREPARATION ---
        beeyield_context = AIService.get_beeyield_context(language)
        system_prompt = (
            f"Manage every response as BeeYield AI, the technical principal and lead beekeeping engineer. "
            f"You must respond ENTIRELY in {target_lang}.\n"
            f"CONTEXTUAL TIME DATA: Current Time is {current_time}, Current Date is {current_date}.\n"
            "CORE CAPABILITIES & INSTRUCTIONS:\n"
            "1. DATA ANALYSIS: If health data or sensor data is provided, analyze the anomalies and risks with engineering precision.\n"
            "2. MODERN REASONING: Use Chain-of-Thought reasoning. For technical questions, analyze the inputs step-by-step.\n"
            "3. WEBSITE AWARENESS: Use the 'WEBSITE CONTENT KNOWLEDGE' section below to answer questions about latest blogs or products. If the user asks for 'newest products', list them from this context.\n"
            "INSTRUCTIONAL LOGIC:\n"
            "1. For simple questions, answer DIRECTLY.\n"
            "2. For analysis, use a 4-POINT NUMBERED LIST.\n"
            "3. ALWAYS include a 'RESOURCE DIRECTORY' with 3 relevant links.\n"
            "STRICT FORMATTING: NO ASTERISKS, UPPERCASE TITLE, BLANK LINES BETWEEN PARAGRAPHS.\n"
            f"Link Pool:\n{chr(10).join(all_links)}\n"
            f"Core Context:\n{beeyield_context}\n\n"
            f"{website_summary}\n\n"
            f"Sensor/Health Data (if relevant):\n{health_context}"
        )

        # --- PRIMARY: GEMINI API ---
        google_key = settings.GOOGLE_API_KEY
        if google_key:
            try:
                # Convert history to Gemini format (user/model)
                gemini_history = []
                for h in (history or []):
                    role = "user" if h["role"] == "user" else "model"
                    gemini_history.append({"role": role, "parts": [{"text": h["content"]}]})
                
                gemini_payload = {
                    "contents": gemini_history + [{"role": "user", "parts": [{"text": f"SYSTEM INSTRUCTIONS: {system_prompt}\n\nUSER MESSAGE: {message}"}]}],
                    "generationConfig": {
                        "temperature": 0.7,
                        "topP": 0.95,
                        "topK": 40,
                        "maxOutputTokens": 1024,
                    }
                }
                
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        f"https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key={google_key}",
                        json=gemini_payload,
                        timeout=15.0
                    )
                    data = response.json()
                    if "candidates" in data:
                        return data["candidates"][0]["content"]["parts"][0]["text"]
                    else:
                        print(f"GEMINI ERROR: {data}")
            except Exception as e:
                print(f"GEMINI EXCEPTION: {e}")

        # --- SECONDARY: OPENAI API ---
        api_key = settings.OPENAI_API_KEY
        if api_key:
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        "https://api.openai.com/v1/chat/completions",
                        headers={"Authorization": f"Bearer {api_key}"},
                        json={
                            "model": "gpt-4-turbo-preview",
                            "messages": [
                                {"role": "system", "content": system_prompt},
                                *(history or []),
                                {"role": "user", "content": message}
                            ]
                        }
                    )
                    return response.json()["choices"][0]["message"]["content"]
            except Exception:
                pass

        # --- SMART FALLBACK (When AI is Offline) ---
        
        # Check if asking for products
        if "product" in msg_lower or "shop" in msg_lower or "buy" in msg_lower or "new" in msg_lower:
            return (
                f"BEEYIELD SHOP SOLUTIONS\n\n"
                f"I am currently operating in precision catalog mode. Here are our latest offerings from the database:\n\n"
                f"{website_summary}\n\n"
                f"RESOURCE DIRECTORY:\n"
                f"1. BEEYIELD SHOP: [Insert Link: beeyield.com/shop]\n"
                f"2. BEEKEEPING NETWORK: [Insert Link: beeyield.com/global-hive-network]\n"
                f"3. CONTACT US: [Insert Link: beeyield.com/contact]"
            )

        # Check if asking for health
        if health_context:
            return (
                f"HIVE DIAGNOSTIC ANALYSIS\n\n"
                f"I have successfully accessed the blockchain telemetry. Here is the engineering diagnostic:\n\n"
                f"{health_context}\n\n"
                f"1. RECOMMENDATION: Review the thermal and acoustic signatures above. Contact our support team if severity is HIGH.\n\n"
                f"RESOURCE DIRECTORY:\n"
                f"1. BEE HEALTH HUB: [Insert Link: beeyield.com/diseases]\n"
                f"2. SMART TECHNOLOGY: [Insert Link: beeyield.com/precision-pollination]\n"
                f"3. TECHNICAL SUPPORT: [Insert Link: beeyield.com/contact]"
            )

        return (
            "BEEYIELD AI CORPORATE DIRECTIVE\n\n"
            "I can assist you with technical hive data, disease prediction, and website updates.\n\n"
            "1. AI/ML ANALYSIS: I use acoustic and thermal sensors to monitor colony health.\n\n"
            "2. MISSION: We protect African bees through precision technology and blockchain.\n\n"
            "RESOURCE DIRECTORY:\n"
            "1. BEEYIELD SHOP: [Insert Link: beeyield.com/shop]\n"
            "2. TRACEABILITY HUB: [Insert Link: beeyield.com/traceability]\n"
            "3. CORPORATE CONTACT: [Insert Link: beeyield.com/contact]\n"
        )

    @staticmethod
    async def search_google(query: str) -> List[Dict[str, Any]]:
        return [{"title": f"BeeYield Source: {query}", "link": f"https://www.google.com/search?q={query}", "snippet": "Verifying data for " + query}]
