from typing import List, Dict, Any, Optional
import os
import json
import math
import re
from collections import Counter
from datetime import datetime, timedelta

# Query expansion: domain-specific synonyms for better recall
QUERY_EXPANSION_MAP = {
    "varroa": ["varroa destructor", "mite", "pathogen", "disease", "treatment"],
    "honey": ["honey production", "harvest", "nectar", "honeycomb"],
    "pollination": ["pollinate", "crop", "agriculture", "bee activity"],
    "sensor": ["IoT", "monitoring", "temperature", "weight", "acoustic"],
    "africa": ["Kenya", "East Africa", "Kibwezi", "Makueni", "African"],
    "blockchain": ["traceability", "HoneyChain", "ledger", "verified"],
    "hive": ["colony", "apiary", "beehive", "brood"],
    "disease": ["AFB", "nosema", "health", "detection"],
}


class ContentService:
    _lakehouse_cache: Optional[Dict[str, Any]] = None
    _cache_time: Optional[datetime] = None
    _cache_duration = timedelta(minutes=30)

    @staticmethod
    async def get_lakehouse_data() -> Dict[str, Any]:
        """Reads the standardized knowledge lakehouse, with in-memory caching."""
        now = datetime.now()
        if (ContentService._lakehouse_cache is not None and 
            ContentService._cache_time is not None and 
            (now - ContentService._cache_time) < ContentService._cache_duration):
            return ContentService._lakehouse_cache

        data = {"lakehouse_nodes": []}
        lakehouse_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "../data/standardized_lakehouse.json")
        )
        if os.path.exists(lakehouse_path):
            try:
                with open(lakehouse_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
            except Exception:
                pass
        
        # Fallback: use knowledge_base.json if lakehouse is empty
        if not data.get("lakehouse_nodes"):
            kb_path = os.path.abspath(
                os.path.join(os.path.dirname(__file__), "../data/knowledge_base.json")
            )
            if os.path.exists(kb_path):
                try:
                    with open(kb_path, 'r', encoding='utf-8') as f:
                        kb = json.load(f)
                    nodes = kb.get("knowledge_nodes", [])
                    data = {
                        "lakehouse_nodes": [
                            {
                                "content": n.get("content", ""),
                                "metadata": {
                                    "source": n.get("source", "Unknown"),
                                    "subtopic": n.get("subtopic", "General"),
                                    "continent": "Global",
                                    "source_type": "General",
                                    "reliability_score": 0.8,
                                    "is_internal": "BeeYield" in str(n.get("source", "")),
                                    "url": ""
                                }
                            }
                            for n in nodes
                        ]
                    }
                except Exception:
                    pass
        
        ContentService._lakehouse_cache = data
        ContentService._cache_time = now
        return data

    @staticmethod
    def _expand_query(query: str) -> List[str]:
        """Expand query with synonyms for better recall."""
        query_lower = query.lower()
        expanded = [query]
        for trigger, synonyms in QUERY_EXPANSION_MAP.items():
            if trigger in query_lower:
                expanded.extend(synonyms[:2])  # Add top 2 synonyms
        return list(dict.fromkeys(expanded))  # Dedupe preserving order

    @staticmethod
    async def search_knowledge(
        query: str, 
        limit: int = 25, 
        continent: Optional[str] = None,
        source_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        GEOSPATIAL & METADATA-AWARE SEARCH (v5.0).
        BM25-style scoring + query expansion + hybrid matching.
        """
        # Practical bounds: keep retrieval stable and avoid huge downstream contexts.
        limit = max(10, min(int(limit or 25), 100))

        lakehouse = await ContentService.get_lakehouse_data()
        nodes = lakehouse.get("lakehouse_nodes", [])

        # Query expansion
        expanded_queries = ContentService._expand_query(query)
        all_query_terms = set()
        for q in expanded_queries:
            all_query_terms.update(w for w in re.findall(r'\w+', q.lower()) if len(w) > 2)

        if not all_query_terms:
            all_query_terms = set(re.findall(r'\w+', query.lower()))
        all_query_terms = list(all_query_terms)

        scored_nodes = []
        n_nodes = len(nodes)
        if n_nodes == 0:
            return {"summary": "", "sources": []}
            
        avg_doc_len = max(1, sum(len(n.get("content", "").split()) for n in nodes) / n_nodes)
        k1, b = 1.5, 0.75

        # --- PRE-CALCULATE DF FOR ALL TERMS ---
        df_map = {}
        processed_nodes = []
        for node in nodes:
            content_lower = node.get("content", "").lower()
            # Tokenize once to avoid repeated splitting and expensive term counting.
            words = re.findall(r"[a-z0-9]+", content_lower)
            word_set = set(words)
            word_counts = Counter(words)
            processed_nodes.append((node, words, word_set, word_counts))
            
            for term in all_query_terms:
                if term in word_set:
                    df_map[term] = df_map.get(term, 0) + 1

        # --- MAIN SCORING LOOP ---
        for node, words, word_set, word_counts in processed_nodes:
            meta = node.get("metadata", {})
            if continent and meta.get("continent") != continent and meta.get("continent") != "Global":
                continue
            if source_type and meta.get("source_type") != source_type:
                continue

            doc_len = len(words)
            score = 0.0
            matched_terms = 0

            for term in all_query_terms:
                if term not in word_set:
                    continue
                
                matched_terms += 1
                tf = word_counts.get(term, 0)
                df = df_map.get(term, 0)
                
                # BM25 IDF
                idf = math.log((n_nodes - df + 0.5) / (df + 0.5) + 1)
                norm = 1 - b + b * (doc_len / avg_doc_len)
                score += idf * (tf * (k1 + 1)) / (tf + k1 * norm)
                
                # Source/Subtopic Boost
                if term in meta.get("source", "").lower() or term in meta.get("subtopic", "").lower():
                    score += 8.0

            if score > 0:
                # Coverage boost: favor nodes matching more distinct query terms.
                coverage = matched_terms / max(1, len(all_query_terms))
                score *= (1.0 + min(0.6, coverage))

                score *= meta.get("reliability_score", 0.7)
                if meta.get("is_internal"):
                    score *= 2.0
                scored_nodes.append((score, node))

        scored_nodes.sort(key=lambda x: x[0], reverse=True)
        # Pull extra candidates for better dedupe and source extraction.
        top_results = scored_nodes[:max(limit, 40)]


        intel_summary = ""
        bibliography = []
        seen_content = set()
        max_summary_chars = 24000
        for score, n in top_results:
            content = n.get("content", "").strip()
            meta = n.get("metadata", {})
            source = meta.get("source", "Unknown")
            subtopic = meta.get("subtopic", "General")
            url = meta.get("url", "")
            # Dedupe near-duplicates (slightly larger prefix).
            dedupe_key = content[:180]
            if content and dedupe_key not in seen_content:
                seen_content.add(dedupe_key)
                header = f"[{source} | {subtopic} | score={score:.2f}]"
                if url:
                    header += f"\nURL: {url}"
                intel_summary += f"{header}\n{content}\n\n"
                if len(intel_summary) >= max_summary_chars:
                    break
            if meta.get("url"):
                source_id = f"{meta['source']} ({meta['subtopic']})"
                if not any(s["name"] == source_id for s in bibliography):
                    bibliography.append({"name": source_id, "url": meta["url"]})

        return {
            "summary": intel_summary.strip(),
            "sources": bibliography[:25]
        }

    @staticmethod
    async def get_website_knowledge_summary(query: str = "") -> str:
        """LEGACY COMPATIBILITY: Hybrid Search retrieval."""
        # 1. Identity Component (DNA)
        kb_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../data/knowledge_base.json"))
        dna_text = "BEEYIELD DNA: Knowledge Loading..."
        
        if os.path.exists(kb_path):
            with open(kb_path, 'r', encoding='utf-8') as f:
                kb = json.load(f)
                dna = kb.get("dna", {})
                dna_text = (
                    f"BEE YIELD IDENTITY:\n"
                    f"- Mission: {dna.get('mission')}\n"
                    f"- HQ: {dna.get('hq', {}).get('location')} on a {dna.get('hq', {}).get('farm_size')}\n"
                    f"- Founders: {', '.join([f'{f.get('name')} ({f.get('role')})' for f in dna.get('founders', [])])}\n"
                    f"- Tech: {dna.get('tech_stack', {}).get('sensors')} using {dna.get('tech_stack', {}).get('blockchain')}\n"
                )

        # 2. Retrieval Component
        results = await ContentService.search_knowledge(query)
        specific_intel = results["summary"]
        
        return f"{dna_text}\n\nDETAILED TRAINING DATA:\n{specific_intel}"
