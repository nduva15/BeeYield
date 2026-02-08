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
    async def chat(
        message: str, 
        history: list[dict[str, str]] = None, 
        language: str = 'EN',
        current_time: str = None,
        current_date: str = None
    ) -> str:
        """
        VERTICAL AI SYSTEM (v4.0): THE DUAL-BRAIN ORCHESTRATOR
        Tier 1: Gemini 2.0 Flash (Observation & Extraction)
        Tier 2: GPT-4o (Reasoning & Professional Writing)
        
        Features:
        - Qdrant vector search (if available)
        - Rate limit management with exponential backoff
        - Dual-API failover
        """
        msg_lower = message.lower().strip()
        
        # --- PHASE 0: INTENT & GEOSPATIAL DETECTION ---
        continent = None
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
        knowledge_context = f"{dna_block}\n{knowledge_context}" if dna_block else knowledge_context

        # --- PHASE 2: TIER 1 - GEMINI FLASH (THE READER) ---
        observation_prompt = (
            f"You are the BEE_OBSERVER node. Extract EVERY technical fact, metric, statistic, date, and citation from this context "
            f"related to the query: '{message}'.\n\n"
            f"RULES:\n"
            f"- Be EXHAUSTIVE. Do not omit details. Include percentages, dates, names, figures.\n"
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
                    max_retries=3,
                    base_delay=2.0,
                    api_name="gemini_observe"
                )
            except Exception as e:
                print(f"GEMINI OBSERVATION ERROR (after retries): {e}")
                extracted_facts = knowledge_context[:3000]

        # --- PHASE 3: TIER 2 - GPT-4o (THE REASONER & WRITER) ---
        system_prompt = (
            f"You are the BEE_ARCHITECT (v5.0), the primary intelligence of BeeYield.\n"
            f"TIMESTAMP: {current_time}, {current_date}\n\n"
            f"STRICT GOVERNANCE:\n"
            f"1. FACT-GROUNDING: Use ONLY facts from the extracted data below. NEVER invent data, statistics, or sources. If uncertain, say 'Based on available data' or omit.\n"
            f"2. LENGTH: Target 2200-3200 words. Each section MUST have 4-6 substantial paragraphs. Do NOT summarize or truncate.\n"
            f"3. STRUCTURE: Use ## for main sections, ### for subsections. Include bullet lists for key metrics where appropriate.\n"
            f"4. CITATIONS: Integrate inline [1], [2] and a full VERIFIED BIBLIOGRAPHY with URLs from: {json.dumps(citations)}\n"
            f"5. KEY TAKEAWAYS: End Section I with a **Key Takeaways** bullet list (4-6 items). End the report with **Recommendations** (3-5 numbered items).\n\n"
            f"EXTRACTED FACTS (authoritative source—do not add to this):\n{extracted_facts}\n\n"
            f"REQUIRED STRUCTURE:\n"
            f"## I. INTELLIGENCE BRIEF\n"
            f"### Executive Summary | Key Findings | Key Takeaways (bullets)\n"
            f"## II. GLOBAL TECHNICAL CONTEXT\n"
            f"### Industry Trends | Regional Factors | Technical Metrics\n"
            f"## III. IOT & ENVIRONMENTAL CORRELATION\n"
            f"### Sensor Data | Environmental Factors | Correlations\n"
            f"## IV. INTERNAL OPERATIONS SYNC\n"
            f"### Harvest Data | Apiary Operations | Internal Metrics\n"
            f"## V. VERIFIED BIBLIOGRAPHY\n"
            f"### Numbered references with URLs\n"
            f"## VI. RECOMMENDATIONS\n"
            f"### 3-5 numbered, actionable recommendations"
        )

        final_answer = ""
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
                            {"role": "user", "content": f"Write a full, authoritative report. Do not truncate. Query: {message}"}
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
                    contents=[f"Write a full, authoritative report. Do not truncate. Query: {message}"],
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

        return final_answer
