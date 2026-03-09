from typing import Any, Optional, Dict, List
import json
import httpx
import os
import asyncio
import re
from google import genai
from app.db.supabase_db import db_select
from app.core.config import settings
from app.services.content_service import ContentService
from app.services.hybrid_search import HybridSearch
from app.services.report_generator import ReportGenerator
from app.services.rate_limit_manager import RateLimitManager
from app.services.link_generator import enhance_response

# Try to import vector store (optional dependency)
try:
    from app.services.vector_store import QdrantVectorStore
    QDRANT_AVAILABLE = True
except ImportError:
    QDRANT_AVAILABLE = False


def _get_bee_dna() -> str:
    """Inject BeeYield identity into every retrieval context."""
    kb_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../data/knowledge_base.json"))
    if os.path.exists(kb_path):
        try:
            with open(kb_path, 'r', encoding='utf-8') as f:
                kb = json.load(f)
            dna = kb.get("dna", {})
            founders = ", ".join([f"{f.get('name')} ({f.get('role')})" for f in dna.get("founders", [])])
            return (
                f"BEEYIELD IDENTITY (always ground answers here):\n"
                f"- Mission: {dna.get('mission', '')}\n"
                f"- HQ: {dna.get('hq', {}).get('location', '')} on {dna.get('hq', {}).get('farm_size', '')}, {dna.get('hq', {}).get('hives_count', '')} hives\n"
                f"- Founders: {founders}\n"
                f"- Tech: {dna.get('tech_stack', {}).get('sensors', '')} | Blockchain: {dna.get('tech_stack', {}).get('blockchain', '')} | ML: {dna.get('tech_stack', {}).get('ml', '')}\n"
            )
        except Exception:
            pass
    return ""

class AIService:
    @staticmethod
    def get_language_name(code: str) -> str:
        mapping = {
            'EN': 'English', 'FR': 'French', 'DE': 'German', 
            'ES': 'Spanish', 'SW': 'Kiswahili', 'ZH': 'Chinese', 'PL': 'Polish'
        }
        return mapping.get(code.upper(), 'English')

    @staticmethod
    def _ensure_min_paragraphs(text: str, min_paragraphs: int = 2) -> str:
        """Ensure the response contains at least `min_paragraphs` paragraphs."""
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
            # Take a chunk of sentences
            chunk = sentences[i:i+per_par]
            if not chunk and sentences:
                # If we're out of sentences but still need paragraphs, take the last sentence
                chunk = [sentences[-1]]
            
            if chunk:
                new_parts.append(" ".join(chunk).strip())
            i += per_par

        return "\n\n".join(new_parts)

    @staticmethod
    async def chat(
        message: str, 
        history: list[dict[str, str]] = None, 
        language: str = 'EN',
        current_time: str = None,
        current_date: str = None
    ) -> Dict[str, Any]:
        """
        VERTICAL AI SYSTEM (v4.0): THE DUAL-BRAIN ORCHESTRATOR
        Tier 1: Gemini 2.0 Flash (Observation & Extraction)
        Tier 2: GPT-4o (Reasoning & Professional Writing)
        
        Returns:
            Dict containing 'response', 'sources', 'suggestions'.
        """
        msg_lower = message.lower().strip()
        
        # --- PHASE 0: POLYGLOT INTENT & EXPERT ROUTING (Go Gateway -> Rust Engine) ---
        continent = None
        expert_context = ""
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                # Call the Go Gateway which proxies to the Rust MoE Router
                route_resp = await client.post(
                    f"{settings.DB_GATEWAY_URL}/ai/route",
                    json={"query": message}
                )
                if route_resp.status_code == 200:
                    route_data = route_resp.json()
                    expert = route_data.get("expert")
                    reason = route_data.get("reason")
                    print(f"[MOE ROUTER] Expert: {expert} | Reason: {reason}")
                    
                    if expert == "AFRICAN":
                        continent = "Africa"
                    expert_context = f"ROUTING_METADATA: Expert: {expert}, Reason: {reason}\n"
        except Exception as e:
            print(f"[MOE ROUTER] Fallback to basic detection: {e}")
            if any(kw in msg_lower for kw in ["africa", "kenya", "nairobi", "makueni"]):
                continent = "Africa"

        
        # --- PHASE 1: HYBRID RAG (Fused Retrieval) ---
        # HybridSearch: query expansion + BM25-style ContentService
        hybrid_results = await HybridSearch.search(message, limit=25, continent=continent)
        knowledge_context = hybrid_results.get("semantic_context", "")
        citations = hybrid_results.get("sources", [])
        # Merge keyword hits (e.g. batch codes) into context
        for kw in hybrid_results.get("keyword_results", []):
            if kw.get("content"):
                knowledge_context = f"{kw['content']}\n\n{knowledge_context}"
 
        # Fuse with Qdrant vector search if available (semantic diversity)
        if QDRANT_AVAILABLE and knowledge_context:
            try:
                vector_results = await QdrantVectorStore.search(message, limit=15, continent=continent)
                vec_summary = vector_results.get("summary", "")
                if vec_summary and vec_summary not in knowledge_context:
                    knowledge_context = f"{knowledge_context}\n\n--- ADDITIONAL SEMANTIC MATCHES ---\n{vec_summary}"
                for s in vector_results.get("sources", []):
                    if s not in citations and len(citations) < 12:
                        citations.append(s)
            except Exception as e:
                print(f"[QDRANT] Fuse skipped: {e}")

        # Inject BeeYield DNA for grounding
        dna_block = _get_bee_dna()
        knowledge_context = f"{expert_context}\n{dna_block}\n{knowledge_context}" if dna_block else f"{expert_context}\n{knowledge_context}"

        # --- PHASE 1.5: VERTICAL DATA INJECTION (BEE HEALTH & DISEASES) ---
        if any(kw in msg_lower for kw in ["disease", "health", "sick", "varroa", "foulbrood", "nosema"]):
            try:
                # Retrieve structured health data from our new vertical endpoint
                # Since we are inside the same process, we could try to call the function directly 
                # or use an internal app client. For simplicity here, we'll use a mocked load of the same data logic
                # or a local HTTP call if settings ALLOW it.
                async with httpx.AsyncClient(timeout=2.0) as client:
                    health_url = f"{settings.API_URL}{settings.API_V1_STR}/bee-data/bee-health"
                    health_resp = await client.get(health_url)
                    if health_resp.status_code == 200:
                        health_data = health_resp.json()
                        knowledge_context += f"\n\n--- INTERNAL BEE HEALTH DATABASE ---\n{json.dumps(health_data, indent=2)}"
            except Exception as e:
                print(f"[BEE HEALTH INJECTION] Skipped: {e}")

        if any(kw in msg_lower for kw in ["market", "price", "export", "import", "money", "business", "demand"]):
            try:
                async with httpx.AsyncClient(timeout=2.0) as client:
                    market_url = f"{settings.API_URL}{settings.API_V1_STR}/bee-data/market-data"
                    market_resp = await client.get(market_url)
                    if market_resp.status_code == 200:
                        market_data = market_resp.json()
                        knowledge_context += f"\n\n--- MARKET INTELLIGENCE DATABASE ---\n{json.dumps(market_data, indent=2)}"
            except Exception as e:
                print(f"[MARKET DATA INJECTION] Skipped: {e}")

        if any(kw in msg_lower for kw in ["research", "science", "breakthrough", "study", "university", "paper", "innovation"]):
            try:
                async with httpx.AsyncClient(timeout=2.0) as client:
                    research_url = f"{settings.API_URL}{settings.API_V1_STR}/bee-data/global-research"
                    research_resp = await client.get(research_url)
                    if research_resp.status_code == 200:
                        research_data = research_resp.json()
                        knowledge_context += f"\n\n--- GLOBAL RESEARCH HUB ---\n{json.dumps(research_data, indent=2)}"
            except Exception as e:
                print(f"[GLOBAL RESEARCH INJECTION] Skipped: {e}")

        if any(kw in msg_lower for kw in ["sensor", "iot", "temperature", "humidity", "acoustic", "metric", "monitoring", "meter", "live data"]):
            try:
                async with httpx.AsyncClient(timeout=2.0) as client:
                    iot_url = f"{settings.API_URL}{settings.API_V1_STR}/bee-data/iot-metrics"
                    iot_resp = await client.get(iot_url)
                    if iot_resp.status_code == 200:
                        iot_data = iot_resp.json()
                        knowledge_context += f"\n\n--- LIVE IOT SENSOR STREAM ---\n{json.dumps(iot_data, indent=2)}"
            except Exception as e:
                print(f"[IOT DATA INJECTION] Skipped: {e}")

        if any(kw in msg_lower for kw in ["traceability", "blockchain", "ledger", "batch", "verify", "honeychain", "polygon", "integrity"]):
            try:
                async with httpx.AsyncClient(timeout=2.0) as client:
                    trace_url = f"{settings.API_URL}{settings.API_V1_STR}/bee-data/traceability-ledger"
                    trace_resp = await client.get(trace_url)
                    if trace_resp.status_code == 200:
                        trace_data = trace_resp.json()
                        knowledge_context += f"\n\n--- BLOCKCHAIN TRACEABILITY LEDGER ---\n{json.dumps(trace_data, indent=2)}"
            except Exception as e:
                print(f"[TRACEABILITY INJECTION] Skipped: {e}")


        # --- PHASE 2: TIER 1 - GEMINI FLASH (THE READER / RESPONDER) ---
        
        # Optimization: Simple Response Mode for short/conversational queries
        is_simple = len(message) < 50 and not any(kw in msg_lower for kw in ["compare", "analyze", "report", "detailed", "technical", "history"])
        
        final_answer = ""
        
        if is_simple:
            simple_prompt = (
                f"You are BeeYield AI. Provide a helpful, professional response. "
                f"Your response MUST contain at least 2 distinct paragraphs. "
                f"Message: '{message}'\n\nContext:\n{knowledge_context[:2000]}"
            )
            google_key = settings.GOOGLE_API_KEY
            if google_key:
                client = genai.Client(api_key=google_key)
                response = client.models.generate_content(
                    model="gemini-2.0-flash",
                    contents=[simple_prompt],
                    config=genai.types.GenerateContentConfig(temperature=0.7)
                )
                final_answer = response.text
        
        if not final_answer:
            # Technical/Complex Query Path
            observation_prompt = (
                f"You are the BEE_OBSERVER node. Extract EVERY technical fact, metric, statistic, date, and citation from this context "
                f"related to the query: '{message}'.\n\n"
                f"RULES:\n"
                f"- Be EXHAUSTIVE. Include percentages, dates, names, figures.\n"
                f"- Organize by pillar: INTELLIGENCE, GLOBAL_CONTEXT, IOT_ENVIRONMENTAL, INTERNAL_OPS, BIBLIOGRAPHY.\n"
                f"- Output a structured JSON array: [{{\"pillar\": \"...\", \"fact\": \"...\", \"source\": \"...\"}}]\n\n"
                f"CONTEXT:\n{knowledge_context}"
            )
            
            extracted_facts = ""
            google_key = settings.GOOGLE_API_KEY
            if google_key:
                async def gemini_observe():
                    from google.genai import types
                    client = genai.Client(api_key=google_key)
                    obs_resp = client.models.generate_content(
                        model="gemini-2.0-flash",
                        contents=[observation_prompt],
                        config=types.GenerateContentConfig(temperature=0.1, max_output_tokens=8192)
                    )
                    return obs_resp.text
                
                try:
                    extracted_facts = await RateLimitManager.with_retry(
                        gemini_observe,
                        max_retries=2,
                        base_delay=1.0,
                        api_name="gemini_observe"
                    )
                except Exception:
                    extracted_facts = knowledge_context[:3000]

            # --- PHASE 3: TIER 2 - SYNTHESIS (THE REASONER & WRITER) ---
            system_prompt = (
                f"You are the BEE_ARCHITECT (v5.0), the primary intelligence of BeeYield.\n"
                f"TIMESTAMP: {current_time}, {current_date}\n\n"
                f"STRICT GOVERNANCE:\n"
                f"1. FACT-GROUNDING: Use ONLY facts from the extracted data below. NEVER invent data.\n"
                f"2. LENGTH: Target 800-1200 words. Provide substantial depth without unnecessary fluff.\n"
                f"3. STRUCTURE: Use ## for main sections, ### for subsections. Ensure at least 5-7 paragraphs.\n"
                f"4. CITATIONS: Integrate inline [1], [2] referencing: {json.dumps(citations)}\n"
                f"5. KEY TAKEAWAYS: Include a **Key Takeaways** list at the end of Section I.\n\n"
                f"EXTRACTED FACTS:\n{extracted_facts}\n"
            )

            openai_key = settings.OPENAI_API_KEY
            if openai_key and not openai_key.startswith("sk-proj-REPLACE"):
                async def openai_synthesize():
                    async with httpx.AsyncClient() as client:
                        url = "https://api.openai.com/v1/chat/completions"
                        headers = {"Authorization": f"Bearer {openai_key}", "Content-Type": "application/json"}
                        payload = {
                            "model": "gpt-4o",
                            "messages": [
                                {"role": "system", "content": system_prompt},
                                {"role": "user", "content": f"Write a full, authoritative report with at least 5 paragraphs. Query: {message}"}
                            ],
                            "temperature": 0.25,
                            "max_tokens": 16384
                        }
                        resp = await client.post(url, headers=headers, json=payload, timeout=120.0)
                        data = resp.json()
                        if "choices" in data:
                            return data["choices"][0]["message"]["content"]
                        elif "error" in data:
                            raise Exception(data["error"].get("message", "OpenAI API error"))
                        return ""
                
                try:
                    final_answer = await RateLimitManager.with_retry(
                        openai_synthesize,
                        max_retries=3,
                        base_delay=1.0,
                        api_name="openai_synthesize"
                    )
                except Exception as e:
                    print(f"OPENAI SYNTHESIS ERROR (after retries): {e}")

            # Fallback to pure Gemini if GPT-4o fails
            if not final_answer and google_key:
                async def gemini_synthesize():
                    from google.genai import types
                    client = genai.Client(api_key=google_key)
                    response = client.models.generate_content(
                        model="gemini-2.0-flash",
                        contents=[f"Write a full, authoritative report with at least 5 paragraphs. Do not truncate. Query: {message}"],
                        config=types.GenerateContentConfig(
                            system_instruction=system_prompt,
                            temperature=0.25,
                            max_output_tokens=16384
                        )
                    )
                    return response.text
                
                try:
                    final_answer = await RateLimitManager.with_retry(
                        gemini_synthesize,
                        max_retries=3,
                        base_delay=5.0,
                        api_name="gemini_synthesize"
                    )
                except Exception as e:
                    final_answer = f"Error in synthesis: {e}\n\nRaw Context:\n{knowledge_context[:1000]}"

        # --- PHASE 4: ASSET GENERATION ---
        if "pdf" in msg_lower or "report" in msg_lower:
            pdf_url = await ReportGenerator.create_report(
                title="BeeYield Deep-Dive Intelligence Brief",
                content=final_answer,
                sources=citations
            )
            final_answer += f"\n\n---\n**GENERATOR LOG:** 📄 [Intelligence_Report_v4.pdf]({pdf_url})"


        # Apply minimum paragraph rule as Post-processing
        final_answer = AIService._ensure_min_paragraphs(final_answer, min_paragraphs=2)

        # --- PHASE 5: VERTICAL LINKING & CITATION ORCHESTRATION ---
        # Enhance the response with internal links and formatted citations
        final_answer = enhance_response(
            text=final_answer,
            sources=citations,
            add_citations=True,
            add_links=True,
            add_suggestions=True
        )

        return {
            "response": final_answer,
            "sources": citations[:12],
            "suggestions": ["How to detect Varroa?", "Trace honey batch", "Check hive health"]
        }

    @staticmethod
    async def generate_marketing_blurb(
        floral_type: str,
        location: str,
        harvest_year: str,
        tone: str = "luxury"
    ) -> str:
        """
        Generate a short, captivating marketing blurb for honey labels.
        """
        prompt = (
            f"Write a short, captivating {tone} marketing blurb (max 40 words) for {floral_type} honey "
            f"harvested in {location} in {harvest_year}. "
            f"Highlight its unique terroir or tasting notes. "
            f"Do not use hashtags. Do not use quotes."
        )

        # Try OpenAI First (Better creative writing)
        openai_key = settings.OPENAI_API_KEY
        if openai_key and not openai_key.startswith("sk-proj-REPLACE"):
            try:
                async with httpx.AsyncClient() as client:
                    url = "https://api.openai.com/v1/chat/completions"
                    headers = {"Authorization": f"Bearer {openai_key}", "Content-Type": "application/json"}
                    payload = {
                        "model": "gpt-4o",
                        "messages": [
                            {"role": "system", "content": "You are a poetic copywriter for a luxury honey brand."},
                            {"role": "user", "content": prompt}
                        ],
                        "temperature": 0.7,
                        "max_tokens": 100
                    }
                    resp = await client.post(url, headers=headers, json=payload, timeout=10.0)
                    data = resp.json()
                    if "choices" in data:
                        return data["choices"][0]["message"]["content"].strip().strip('"')
            except Exception as e:
                print(f"OpenAI Blurb Error: {e}")

        # Fallback to Gemini
        google_key = settings.GOOGLE_API_KEY
        if google_key:
            try:
                from google.genai import types
                client = genai.Client(api_key=google_key)
                response = client.models.generate_content(
                    model="gemini-2.0-flash",
                    contents=[prompt],
                    config=types.GenerateContentConfig(
                        temperature=0.8,
                        max_output_tokens=100
                    )
                )
                return response.text.strip().strip('"')
            except Exception as e:
                print(f"Gemini Blurb Error: {e}")

        return f"Pure {floral_type} honey from {location}. Verified harvest of {harvest_year}."

