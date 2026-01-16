from typing import List, Dict, Any, Optional
import json
import httpx
import os
import asyncio
from app.db.supabase_db import db_select

class AIService:
    @staticmethod
    def get_beeyield_context() -> str:
        """
        Gathers comprehensive information from the BeeYield project.
        """
        context_parts = []
        
        # 1. Company Identity
        context_parts.append("### About BeeYield Hub:")
        context_parts.append("- Tagline: From Hive to Table, Traced with Trust")
        context_parts.append("- Mission: Revolutionizing beekeeping through blockchain traceability and sustainable practices.")
        context_parts.append("- Vision: To create a world where every drop of honey tells a story of ethical sourcing and environmental stewardship.")
        context_parts.append("- Founders: Timothy Nduva (CEO), Carole Nduva (Growth), Agatha Nduva (IT). They are siblings.")
        context_parts.append("- Location: Headquarters in Kibwezi, Makueni, Kenya.")

        # 2. Key Statistics (Impact)
        stats = db_select("company_stats")
        if stats:
            context_parts.append("\n### Impact Statistics:")
            for s in stats:
                context_parts.append(f"- {s.get('stat_label', s.get('stat_key'))}: {s.get('stat_value')}")
        else:
            context_parts.append("\n### Impact Statistics:")
            context_parts.append("- Farmers Supported: 500+")
            context_parts.append("- Hives Managed: 184")
            context_parts.append("- Trees Planted: 2,500+")
            context_parts.append("- Acres Pollinated: 25+")

        # 3. Products & Services
        context_parts.append("""
### Core Offerings & Features:
1. **Managed Pollination Services**: We deploy mobile apiaries to farms (watermelons, avocados, beans, etc.) to boost yields by up to 30%.
2. **BeeYield Intelligent Hives**: IoT-enabled Langstroth hives that monitor health, temperature, and weight in real-time.
3. **Traceability System**: Blockchain-powered tracking. Every jar has a QR code. When scanned, it shows harvest date, location, and the beekeeper's profile.
4. **Organic Honey**: 100% pure, raw, and unadulterated honey from Kenya's diverse landscapes.
5. **Farmer Network**: A community of trained beekeepers using sustainable methods.
""")

        # 4. Blog Posts (Knowledge Base)
        posts = db_select("blog_posts", filters={"status": "published"}, limit=10)
        if posts:
            context_parts.append("\n### Latest Articles & Knowledge:")
            for post in posts:
                context_parts.append(f"- {post.get('title')}: {post.get('excerpt')}")

        # 5. FAQs
        faqs = db_select("faqs", filters={"is_active": True})
        if faqs:
            context_parts.append("\n### Frequently Asked Questions:")
            for faq in faqs:
                context_parts.append(f"Q: {faq.get('question')}\nA: {faq.get('answer')}")

        # 6. Site Navigation
        context_parts.append("""
### Website Navigation (Direct the user here):
- Dashboard & My Hives: /dashboard
- Traceability (Check my honey): /traceability
- Shop (Buy honey/hives): /shop
- About Us: /about
- Contact: /contact
- Blog: /blog
- Services: /services-beeyield
""")

        return "\n".join(context_parts)

    @staticmethod
    async def chat(message: str, history: List[Dict[str, str]] = None) -> str:
        """
        Sends a message to the AI with BeeYield context and handles responses.
        """
        msg_lower = message.lower()
        
        # Expert Rule System (Immediate Expert Responses)
        if "pollination" in msg_lower:
            return "At BeeYield, we provide precision pollination services. By deploying our IoT-monitored apiaries during flowering windows, we help farmers (especially for mangoes and avocados) increase their crop yields by up to 30%. Would you like to check our /services-beeyield page for more details?"
        
        if "traceability" in msg_lower or "blockchain" in msg_lower or "qr code" in msg_lower:
            return "Our traceability system is powered by blockchain. Every jar of BeeYield honey has a unique QR code. When you scan it, you can see the exact harvest location (like Kibwezi), the date, and the beekeeper's details. You can try it yourself on our /traceability page!"

        if "disease" in msg_lower or "health" in msg_lower or "sick" in msg_lower:
            return "We take hive health very seriously. Our BeeYield Intelligent Hives use IoT sensors to monitor temperature and acoustics in real-time. We can detect signs of Varroa mites, Small Hive Beetles, or Varroa-related issues before they decimate a colony. Our dashboard provides alerts so you can intervene early."

        if "who are you" in msg_lower or "what is beeyield" in msg_lower:
            return "I am the BeeYield AI Assistant! BeeYield is a Kenya-based agritech startup founded by Timothy, Carole, and Agatha Nduva. We combine traditional beekeeping with modern tech like IoT and Blockchain to improve agricultural yields and provide trusted honey."

        # LLM Logic (If key provided)
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            try:
                beeyield_context = AIService.get_beeyield_context()
                system_prompt = f"You are the BeeYield Expert Assistant. Your tone is helpful, professional, and knowledgeable about Kenyan agritech. Use this context: {beeyield_context}"
                
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
                return f"I'm specialized in BeeYield information. Ask me about pollination, our intelligent hives, or honey traceability! (Technical note: LLM connection issue: {str(e)})"

        # General Knowledge Simulation (when no LLM key)
        if "google" in msg_lower or "search" in msg_lower or "tell me about" in msg_lower:
            return f"As your BeeYield assistant, I focus primarily on our apiary tech and services. For broad web searches about '{message}', I recommend checking Google for the latest global updates. However, within the BeeYield ecosystem, we are leaders in {msg_lower if len(msg_lower) < 20 else 'sustainable agritech'}."

        return "I'm the BeeYield AI Assistant. I can help you with hive management, pollination services, and honey traceability. What would you like to know about our technology or products?"

    @staticmethod
    async def search_google(query: str) -> List[Dict[str, Any]]:
        """
        Simulates / placeholder for Google Search.
        """
        return [
            {"title": f"Web info for {query}", "link": f"https://www.google.com/search?q={query}", "snippet": "Showing external info related to " + query}
        ]
