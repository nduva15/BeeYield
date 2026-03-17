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
        history = history or []

        # Lightweight conversation memory for retrieval (bounded).
        mem_lines: List[str] = []
        for t in history[-8:]:
            role = str(t.get("role", "")).strip().lower()
            content = str(t.get("content", "")).strip()
            if role in {"user", "assistant"} and content:
                mem_lines.append(f"{role}: {content[:400]}")
        conversation_memory = "\n".join(mem_lines).strip()
        retrieval_query = message if not conversation_memory else f"{message}\n\nRECENT_CONTEXT:\n{conversation_memory}"
        
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
        hybrid_results = await HybridSearch.search(retrieval_query, limit=40, continent=continent)
        knowledge_context = hybrid_results.get("semantic_context", "")
        citations = hybrid_results.get("sources", [])
        # Merge keyword hits (e.g. batch codes) into context
        for kw in hybrid_results.get("keyword_results", []):
            if kw.get("content"):
                knowledge_context = f"{kw['content']}\n\n{knowledge_context}"
 
        # Fuse with Qdrant vector search if available (semantic diversity)
        if QDRANT_AVAILABLE and knowledge_context:
            try:
                vector_results = await QdrantVectorStore.search(retrieval_query, limit=20, continent=continent)
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
        
        # Simple Response Mode should ONLY handle greetings/pleasantries.
        # Everything else should use the long-form RAG + synthesis path.
        is_simple = bool(re.fullmatch(r"\s*(hi|hello|hey|thanks|thank you|ok|okay)\s*[!.]?\s*", msg_lower))
        
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
                "You are the BEE_OBSERVER node.\n"
                "Task: extract ONLY what is explicitly present in CONTEXT and relevant to USER_QUERY.\n"
                "Output MUST be valid JSON (no markdown, no prose) with shape:\n"
                "{\n"
                "  \"facts\": [\n"
                "    {\n"
                "      \"id\": \"F1\",\n"
                "      \"pillar\": \"INTELLIGENCE|GLOBAL_CONTEXT|IOT_ENVIRONMENTAL|INTERNAL_OPS\",\n"
                "      \"claim\": \"short atomic fact\",\n"
                "      \"evidence\": \"verbatim snippet from CONTEXT\",\n"
                "      \"source\": \"source name from context header\",\n"
                "      \"url\": \"url if present else empty\",\n"
                "      \"confidence\": 0.0\n"
                "    }\n"
                "  ]\n"
                "}\n"
                "Rules:\n"
                "- Evidence MUST be copied verbatim from CONTEXT.\n"
                "- If a number/date isn't in CONTEXT, do not add it.\n"
                "- If url isn't present, set url to \"\".\n\n"
                f"USER_QUERY:\n{message}\n\n"
                f"CONTEXT:\n{knowledge_context}"
            )
            
            extracted_facts_raw = ""
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
                    extracted_facts_raw = await RateLimitManager.with_retry(
                        gemini_observe,
                        max_retries=2,
                        base_delay=1.0,
                        api_name="gemini_observe"
                    )
                except Exception:
                    extracted_facts_raw = ""

            # Parse observer JSON robustly; fall back to empty facts if it isn't valid JSON.
            extracted_facts_obj: Dict[str, Any] = {"facts": []}
            try:
                extracted_facts_obj = json.loads(extracted_facts_raw) if extracted_facts_raw else {"facts": []}
            except Exception:
                try:
                    m = re.search(r"\{[\\s\\S]*\}", extracted_facts_raw or "")
                    if m:
                        extracted_facts_obj = json.loads(m.group(0))
                except Exception:
                    extracted_facts_obj = {"facts": []}

            facts_json = json.dumps(extracted_facts_obj, ensure_ascii=False)

            # --- PHASE 3: TIER 2 - SYNTHESIS (THE REASONER & WRITER) ---
            system_prompt = (
                f"You are the BEE_ARCHITECT (v5.0), the primary intelligence of BeeYield.\n"
                f"TIMESTAMP: {current_time}, {current_date}\n\n"
                f"STRICT GOVERNANCE:\n"
                f"1. OUTPUT: MUST be Markdown.\n"
                f"2. FACT-GROUNDING: You may ONLY assert claims that appear in FACTS_JSON.\n"
                f"3. EVIDENCE: For every key claim, include an (Evidence: \"...\") snippet copied verbatim from FACTS_JSON.\n"
                f"4. LENGTH: Target 1800-3000 words (long, structured, professional).\n"
                f"5. STRUCTURE: Use the exact section headers below with ##, and rich subsections with ###.\n"
                f"6. CITATIONS: Use inline numeric citations like [1], [2] and list them in the bibliography using ONLY URLs from ALLOWED_SOURCES.\n"
                f"7. UNKNOWN HANDLING: If FACTS_JSON lacks data for a subsection, write \"Unknown\" and explain what data is missing.\n\n"
                f"FACTS_JSON:\n{facts_json}\n\n"
                f"ALLOWED_SOURCES:\n{json.dumps(citations)}\n\n"
                f"REQUIRED SECTIONS:\n"
                f"## I. INTELLIGENCE BRIEF\n"
                f"### Summary\n"
                f"### Key findings (bulleted; each with evidence + citation)\n"
                f"### Actionable recommendations (ranked; each tied to evidence)\n"
                f"## II. GLOBAL TECHNICAL CONTEXT\n"
                f"### Industry baseline\n"
                f"### Regional considerations\n"
                f"### Metrics & thresholds\n"
                f"## III. IOT & ENVIRONMENTAL CORRELATION\n"
                f"### Signal interpretation\n"
                f"### Environmental drivers\n"
                f"### Correlation notes (clearly mark assumptions)\n"
                f"## IV. INTERNAL OPERATIONS SYNC\n"
                f"### Ops overview\n"
                f"### Risks & mitigations\n"
                f"### Next steps & instrumentation\n"
                f"## V. VERIFIED BIBLIOGRAPHY\n"
                f"### Numbered list 1..N with names + URLs\n"
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

    @staticmethod
    async def generate_label_pack(
        floral_type: str,
        location: str,
        harvest_year: str,
        tone: str = "luxury",
        product_name: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Generate a structured "Label Pack" for the Label Generator UI.

        The pack is designed to be long, predictable, and multi-field.
        """
        floral = (floral_type or "Wildflower").strip()
        origin = (location or "").strip() or "Single-origin"
        year = (harvest_year or "").strip() or "Unknown"
        name = (product_name or "").strip() or f"{floral} Reserve"
        tone_clean = (tone or "luxury").strip()

        schema_hint = {
            "product_name": "string",
            "short_blurb": "string (<= 180 chars, no quotes, no hashtags)",
            "long_story": "string (2-4 paragraphs, marketing narrative)",
            "tasting_notes": ["string", "string", "string", "string", "string"],
            "origin": "string",
            "harvest_date_range": "string (e.g., 'Mar–Apr 2026')",
            "sustainability_claims": ["string", "string", "string"],
            "pairings": ["string", "string", "string", "string"],
            "allergen_notes": "string",
            "qr_landing_copy": "string (1-2 paragraphs, for landing page hero + trust)",
            "tone": "string"
        }

        prompt = (
            "You are an expert honey brand copywriter and compliance-conscious label specialist.\n"
            "Return ONLY valid JSON. Do not wrap in markdown. Do not include commentary.\n"
            "Write long, structured content for a honey label content pack.\n\n"
            f"Inputs:\n- floral_type: {floral}\n- location: {origin}\n- harvest_year: {year}\n- product_name: {name}\n- tone: {tone_clean}\n\n"
            "Hard rules:\n"
            "- short_blurb must be <= 180 characters.\n"
            "- tasting_notes must be 5 items.\n"
            "- sustainability_claims must be 3 items.\n"
            "- pairings must be 4 items.\n"
            "- allergen_notes must be conservative and safe (e.g., 'May contain traces...' only if stated as assumption).\n"
            "- Include BeeYield themes: traceability, zero-disturbance harvesting, 50/50 promise, research/monitoring.\n\n"
            f"JSON schema example (types only):\n{json.dumps(schema_hint, indent=2)}\n"
        )

        # Try OpenAI first (best control over JSON)
        openai_key = getattr(settings, "OPENAI_API_KEY", None)
        if openai_key and not openai_key.startswith("sk-proj-REPLACE"):
            try:
                async with httpx.AsyncClient() as client:
                    resp = await client.post(
                        "https://api.openai.com/v1/chat/completions",
                        headers={"Authorization": f"Bearer {openai_key}", "Content-Type": "application/json"},
                        json={
                            "model": "gpt-4o-mini",
                            "messages": [
                                {"role": "system", "content": "You return strict JSON only."},
                                {"role": "user", "content": prompt},
                            ],
                            "temperature": 0.35,
                            "max_tokens": 1800,
                            "response_format": {"type": "json_object"},
                        },
                        timeout=25.0,
                    )
                    data = resp.json()
                    if "choices" in data and data["choices"]:
                        raw = (data["choices"][0].get("message", {}).get("content") or "").strip()
                        if raw:
                            return json.loads(raw)
            except Exception:
                pass

        # Fallback to Gemini if available
        google_key = getattr(settings, "GOOGLE_API_KEY", None)
        if google_key:
            try:
                from google.genai import types
                client = genai.Client(api_key=google_key)
                response = client.models.generate_content(
                    model="gemini-2.0-flash",
                    contents=[prompt],
                    config=types.GenerateContentConfig(
                        temperature=0.35,
                        max_output_tokens=1800,
                        response_mime_type="application/json",
                    ),
                )
                raw = (response.text or "").strip()
                if raw:
                    # Some providers still wrap JSON; extract first object if needed
                    m = re.search(r"\{[\s\S]*\}", raw)
                    if m:
                        return json.loads(m.group(0))
            except Exception:
                pass

        # Heuristic fallback (always return a valid pack)
        season = "Mar–Apr" if year.isdigit() else "Seasonal"
        return {
            "product_name": name,
            "short_blurb": f"Traceable {floral} honey from {origin} ({year}). Zero-disturbance harvested with BeeYield’s 50/50 promise.",
            "long_story": (
                f"From {origin}, this {floral.lower()} harvest is produced under BeeYield’s 50/50 promise—supporting farmer livelihoods while funding ecosystem monitoring and research.\n\n"
                "Each batch is captured through zero-disturbance harvesting protocols and protected with end-to-end traceability. Scan the QR to verify harvest context, handling standards, and the story behind the jar."
            ),
            "tasting_notes": [
                "Floral top-notes with clean, bright sweetness",
                "Soft herbal undertone and warm nectar finish",
                "Silky texture with balanced acidity",
                "Lingering pollen-like aroma and gentle spice",
                "Elegant aftertaste with minimal bitterness",
            ],
            "origin": origin,
            "harvest_date_range": f"{season} {year}",
            "sustainability_claims": [
                "50/50 Promise: farmer sustainability + ecosystem research",
                "Zero-disturbance harvesting to protect colony vitality",
                "Traceability-first supply chain with verifiable batch history",
            ],
            "pairings": [
                "Fresh bread, cultured butter, and sea salt",
                "Greek yogurt, granola, and citrus zest",
                "Herbal tea or black coffee as a natural sweetener",
                "Cheese board: mild goat cheese or aged cheddar",
            ],
            "allergen_notes": "Honey is not recommended for infants under 12 months.",
            "qr_landing_copy": (
                "Scan to verify your jar. This batch is recorded with BeeYield’s traceability protocol, linking harvest timing, handling, and quality checks.\n\n"
                "BeeYield reinvests through the 50/50 promise—supporting farmers and funding sensor-based monitoring and research that protects pollinators and ecosystems."
            ),
            "tone": tone_clean,
        }

