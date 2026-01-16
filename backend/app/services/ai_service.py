from typing import List, Dict, Any, Optional
import json
import httpx
import os
import asyncio
from app.db.supabase_db import db_select

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
        Sends a message to the AI with high-depth BeeYield context.
        Differentiates between complex technical inquiries and simple factual questions.
        Maintains strict clean-text formatting, no asterisks, and clickable links.
        """
        msg_lower = message.lower().strip()
        target_lang = AIService.get_language_name(language)
        is_sw = (language.upper() == 'SW')
        
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
        if any(msg_lower == kw or msg_lower.startswith(kw + " ") for kw in greetings_keywords) or (len(msg_lower.split()) <= 2 and "?" not in msg_lower):
            hour = int(current_time.split(':')[0]) if current_time else 12
            greet_msg = "Habari za mchana" if hour < 17 and hour >= 12 else ("Habari za asubuhi" if hour < 12 else "Habari za jioni")
            if not is_sw:
                greet_msg = "Good afternoon" if hour < 17 and hour >= 12 else ("Good morning" if hour < 12 else "Good evening")
            
            inner_greet = f"Jambo! {greet_msg}. Mimi ni BeeYield AI. Tunaweza kukusaidia nini leo?" if is_sw else f"Hi! {greet_msg}. I am BeeYield AI. How can we assist you with our professional services today?"
            return (
                f"{'KARIBU KWENYE BEE AI HUB' if is_sw else 'WELCOME TO THE BEE AI HUB'}\n\n"
                f"{inner_greet}\n\n"
                f"1. TIME AND DATE: Current Local Time is {current_time or 'available'} on {current_date or 'today'}.\n\n"
                f"2. POLLINATION SERVICES: Discover how our 184 Smart Hives optimize crop yields for Watermelons, Avocados, and more.\n\n"
                f"3. HONEY TRACEABILITY: Explore our blockchain-backed HoneyChain to verify the purity of our 883 Kgs+ of harvested honey.\n\n"
                f"4. SENSORY ANALYSIS: I can analyze uploaded photos, documents, and technical links to provide precision diagnostic support.\n\n"
                "RESOURCE DIRECTORY:\n"
                "1. BEEYIELD SHOP: [Insert Link: beeyield.com/shop]\n"
                "2. TRACEABILITY HUB: [Insert Link: beeyield.com/traceability]\n"
                "3. CORPORATE CONTACT: [Insert Link: beeyield.com/contact]\n\n"
                "How can I help you today?"
            )

        # --- Simple Factual Detection (Fast Response for simple stuff) ---
        simple_facts = {
            "email": "Our official corporate email is info@beeyield.co.ke.",
            "phone": "You can reach our executive team at +254 712 345 678.",
            "founder": "BeeYield was founded by Timothy Mathuva (CEO), Carole Mathuva (CGO), and Agatha Mathuva (IT Head).",
            "founders": "BeeYield was founded by Timothy Mathuva (CEO), Carole Mathuva (CGO), and Agatha Mathuva (IT Head).",
            "headquarters": "We are headquartered in Kibwezi, Makueni County, Kenya.",
            "location": "Our physical operations are centered in Kibwezi, Makueni County, Kenya.",
            "timothy": "Timothy Mathuva is the CEO and founder of BeeYield Hub.",
            "carole": "Carole Mathuva is the Chief Growth Officer (CGO) at BeeYield Hub.",
            "agatha": "Agatha Mathuva is the Head of IT and Traceability at BeeYield Hub."
        }
        
        # --- LLM Logic (Dynamic Complexity) ---
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            try:
                beeyield_context = AIService.get_beeyield_context(language)
                system_prompt = (
                    f"Manage every response as BeeYield AI, the technical principal of the platform. "
                    f"You must respond ENTIRELY in {target_lang}.\n"
                    f"CONTEXTUAL TIME DATA: Current Time is {current_time}, Current Date is {current_date}.\n"
                    "Use precise and accurate data from the BeeYield website.\n"
                    "INSTRUCTIONAL LOGIC:\n"
                    "1. If the user asks a SIMPLE FACTUAL QUESTION (e.g., email, phone, location, founders, greetings), answer DIRECTLY and CONCISELY in 1 paragraph.\n"
                    "2. If the user asks a COMPLEX TECHNICAL or STRATEGIC QUESTION (e.g., how pollination works, impact data, technology details), use the 4-POINT NUMBERED LIST structure.\n"
                    "3. ALWAYS include a 'RESOURCE DIRECTORY' at the end with EXACTLY 3 relevant internal links from the pool.\n"
                    "STRICT FORMATTING RULES:\n"
                    "1. NO ASTERISKS (** or *) anywhere. No bolding/italics.\n"
                    "2. Start with an UPPERCASE MAIN TITLE at the top.\n"
                    "3. Ensure EXACTLY ONE BLANK LINE between every paragraph and list item.\n"
                    "4. For numbered points, use: 'Number. UPPERCASE KEY PHRASE: Detailed description...'\n"
                    f"Link Pool:\n{chr(10).join(all_links)}\n"
                    "ACCURACY DATA:\n"
                    "- Email: info@beeyield.co.ke\n"
                    "- Phone: +254 712 345 678\n"
                    "- Founders: Timothy, Carole, and Agatha Mathuva\n"
                    f"Context Data:\n{beeyield_context}"
                )
                
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
            except Exception as e:
                return f"BeeYield AI Technical Support ({target_lang}) is currently syncing. Status: {str(e)}"

        # General Fallback
        return (
            "BEEYIELD AI CORPORATE DIRECTIVE\n\n"
            "I can assist you with technical hive data, pollination services, and contact information.\n\n"
            "1. CONTACT: Reach us at info@beeyield.co.ke or +254 712 345 678.\n\n"
            "2. MISSION: We empower 25+ partner farmers with 184 Smart Hives and blockchain traceability.\n\n"
            "RESOURCE DIRECTORY:\n"
            "1. BEEYIELD SHOP: [Insert Link: beeyield.com/shop]\n"
            "2. TRACEABILITY HUB: [Insert Link: beeyield.com/traceability]\n"
            "3. CORPORATE CONTACT: [Insert Link: beeyield.com/contact]\n"
        )

    @staticmethod
    async def search_google(query: str) -> List[Dict[str, Any]]:
        return [{"title": f"BeeYield Source: {query}", "link": f"https://www.google.com/search?q={query}", "snippet": "Verifying data for " + query}]
