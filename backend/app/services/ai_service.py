from typing import List, Dict, Any, Optional
import json
import httpx
import os
import asyncio
import re
from app.db.supabase_db import db_select
from app.core.config import settings
from app.services.content_service import ContentService
from app.services.bee_health_ai import BeeHealthAI
from app.blockchain.honey_chain import honey_blockchain

class AIService:
    @staticmethod
    def get_language_name(code: str) -> str:
        mapping = {
            'EN': 'English', 'FR': 'French', 'DE': 'German', 
            'ES': 'Spanish', 'SW': 'Kiswahili', 'ZH': 'Chinese', 'PL': 'Polish'
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
        ULTRA-THOUGHT NEURAL LINK
        Sends a message to the AI with 600+ node precision context.
        """
        msg_lower = message.lower().strip()
        target_lang = AIService.get_language_name(language)
        
        # --- PHASE 1: PRECISION DATA RETRIEVAL ---
        knowledge_context = await ContentService.get_website_knowledge_summary(message)
        
        # Real-time Telemetry (for health queries)
        health_context = ""
        if any(kw in msg_lower for kw in ["health", "status", "anomaly", "disease", "check", "analyze", "sensors"]):
            hive_id = "H-KIB-01-01" # Default hub
            for word in msg_lower.split():
                if word.startswith("h-kib"): hive_id = word.upper(); break
            
            sensor_data = honey_blockchain.get_latest_sensor_data(hive_id)
            if sensor_data:
                health_report = await BeeHealthAI.analyze_hive_health(hive_id, sensor_data)
                health_context = f"\nLIVE HIVE TELEMETRY ({hive_id}):\n{json.dumps(health_report, indent=2)}\n"
        
        # --- PHASE 2: ELITE SYSTEM INSTRUCTIONS ---
        system_prompt = (
            f"SYSTEM ROLE: You are the ELITE MASTER INTELLIGENCE of BeeYield (Kibwezi, Kenya).\n"
            f"IDENTITY: Expert in precision apiculture, IoT engineering, and HoneyChain blockchain traceability.\n"
            f"LANGUAGE: Respond ONLY in {target_lang}. Correct any user grammar in a professional way.\n"
            f"TIMESTAMP: {current_time} EAT, {current_date}\n\n"
            f"TRAINING DATA (PRIORITY SOURCE):\n{knowledge_context}\n\n"
            f"LIVE TELEMETRY:\n{health_context}\n\n"
            f"CORE DIRECTIVES (NON-NEGOTIABLE):\n"
            f"1. FACTUAL: Use ONLY the training data for company specifics. If unknown, stick to general tech beekeeping.\n"
            f"2. STYLE: Professional, technical, yet sales-driven for BeeYield products.\n"
            f"3. NO MARKDOWN: Never use #, **, __, or asterisks. Use ALL CAPS for section headers or emphasis.\n"
            f"4. LINKS: Always end with 3 RELEVANT site links in the format [Insert Link: beeyield.com/page].\n"
            f"5. FOUNDERS: Timothy (CEO), Agatha (IT/Blockchain), and Carole (Growth) are your creators. Treat them with respect."
        )

        def sanitize_final(text: str) -> str:
            """Removes all remaining markdown clutter and formats for the premium frontend."""
            if not text: return ""
            # Strip all #, *, _, and residual bold/italics
            text = text.replace("**", "").replace("__", "")
            text = re.sub(r'#+\s*', '', text) # Headers
            text = re.sub(r'^\s*\*\s+', '- ', text, flags=re.M) # Bullets to dashes
            text = text.replace("*", "").replace("_", "")
            return text.strip()

        # --- PHASE 3: NEURAL EXECUTION ---
        google_key = settings.GOOGLE_API_KEY
        if google_key:
            try:
                # Prepare history for Gemini
                gemini_history = []
                for h in (history or [])[-10:]: # Keep last 10 for context window efficiency
                    role = "user" if h["role"] == "user" else "model"
                    gemini_history.append({"role": role, "parts": [{"text": h["content"]}]})
                
                async with httpx.AsyncClient() as client:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={google_key}"
                    payload = {
                        "contents": gemini_history + [{"role": "user", "parts": [{"text": f"INSTRUCTIONS: {system_prompt}\n\nUSER MESSAGE: {message}"}]}],
                        "generationConfig": {"temperature": 0.25, "maxOutputTokens": 2048, "topP": 0.95}
                    }
                    resp = await client.post(url, json=payload, timeout=25.0)
                    data = resp.json()
                    if "candidates" in data:
                        raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
                        return sanitize_final(raw_text)
                    elif "error" in data:
                        print(f"GEMINI ERROR: {data['error'].get('message')}")
            except Exception as e:
                print(f"NEURAL ERROR: {e}")

        # --- PHASE 4: LOCAL ADAPTIVE FALLBACK ---
        # High-fidelity response generated from the nodes if the API fails
        fallback_msg = (
            f"I AM ANALYZING YOUR REQUEST USING MY LOCAL KNOWLEDGE ENGINE.\n\n"
            f"SUMMARY OF FINDINGS:\n"
            f"{knowledge_context[:1200]}\n\n"
            f"EXPERT RECOMMENDATIONS:\n"
            f"- VIEW POLLINATION SERVICES: [Insert Link: beeyield.com/pollination-services]\n"
            f"- BROWSE PREMIUM HONEY: [Insert Link: beeyield.com/shop]\n"
            f"- CONTACT OUR TEAM: [Insert Link: beeyield.com/contact]"
        )
        return sanitize_final(fallback_msg)
