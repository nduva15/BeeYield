from typing import List, Dict, Any, Optional
import os
import json
import re

class ContentService:
    @staticmethod
    async def get_raw_knowledge_base() -> Dict[str, Any]:
        """Reads the ultra-granular knowledge base and aggregates research batches."""
        kb_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../data/knowledge_base.json"))
        data = {"knowledge_nodes": []}
        
        # 1. Load Core Knowledge Base
        if os.path.exists(kb_path):
            try:
                with open(kb_path, 'r', encoding='utf-8') as f:
                    core_kb = json.load(f)
                    data["dna"] = core_kb.get("dna", {})
                    data["knowledge_nodes"].extend(core_kb.get("knowledge_nodes", []))
                    for node in data["knowledge_nodes"]:
                        node["is_internal"] = True # Explicitly mark core data
            except Exception:
                pass

        # 2. Load Research Batches (Neural Librarian)
        research_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data/research_batch"))
        if os.path.exists(research_dir):
            for filename in os.listdir(research_dir):
                if filename.endswith(".json") and filename.startswith("batch_"):
                    try:
                        with open(os.path.join(research_dir, filename), 'r', encoding='utf-8') as f:
                            batch_data = json.load(f)
                            for item in batch_data:
                                data["knowledge_nodes"].append({
                                    "source": item.get("source", "Global Research"),
                                    "subtopic": item.get("type", "General"),
                                    "content": f"{item.get('title')}\n{item.get('summary')}",
                                    "url": item.get("url"),
                                    "is_internal": False
                                })
                    except Exception:
                        continue
        
        return data

    @staticmethod
    async def search_knowledge(query: str, limit: int = 4) -> str:
        """
        Advanced Multi-Node Retrieval Scoring.
        Prioritizes nodes with higher keyword density and relevant DNA matches.
        """
        kb = await ContentService.get_raw_knowledge_base()
        if not kb:
            return ""

        query_words = [w for w in re.findall(r'\w+', query.lower()) if len(w) > 3]
        if not query_words:
            query_words = [w for w in re.findall(r'\w+', query.lower())]

        nodes = kb.get("knowledge_nodes", [])
        scored_nodes = []
        
        for node in nodes:
            content = node.get("content", "").lower()
            source = node.get("source", "").lower()
            subtopic = node.get("subtopic", "").lower()
            is_internal = node.get("is_company", False) or node.get("is_internal", False)
            
            score = 0
            for word in query_words:
                # Frequency match
                matches = content.count(word)
                score += (matches * 1)
                
                # Metadata bonus
                if word in source or word in subtopic:
                    score += 10
                    
                # Exact phrase bonus (if query has multiple words)
                if len(query_words) > 1 and " ".join(query_words[:2]) in content:
                    score += 20
            
            # --- NEURAL LIBRARIAN: VAULT PRIORITY ---
            if is_internal:
                # If query is about harvests, team, or internal ops, boost is massive
                if any(kw in query.lower() for kw in ["harvest", "team", "yield", "protocol", "beeyield"]):
                    score *= 5.0
                else:
                    score += 15 # Baseline boost for company data
            
            if score > 0:
                # Length penalty (we want concise high-density nodes, not just giant blobs)
                final_score = score / (1 + (len(content) / 2000))
                scored_nodes.append((final_score, node))
        
        # Sort by score
        scored_nodes.sort(key=lambda x: x[0], reverse=True)
        top_results = scored_nodes[:limit]
        
        if not top_results:
            # Absolute fallback if no keywords match - return high-level site data
            top_results = [(0, n) for n in nodes if "OurStory" in n['source'] or "About" in n['source']][:3]

        intel_summary = ""
        for _, n in top_results:
            intel_summary += f"{n.get('content')}\n\n"
            
        return intel_summary.strip()

    @staticmethod
    async def get_website_knowledge_summary(query: str = "") -> str:
        """
        Combines DNA (Identity) + Hybrid Search Retrieval (Context).
        """
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

        # 2. Hybrid Search Component (Semantic + Keyword)
        from app.services.hybrid_search import HybridSearch
        search_results = await HybridSearch.search(query)
        specific_intel = search_results.get("semantic_context", "")
        
        # Inject detected metadata (batch codes, etc.)
        metadata_notes = ""
        for hit in search_results.get("keyword_results", []):
            metadata_notes += f"ALERT: Detected high-precision match: {hit.get('content')}\n"

        return f"{dna_text}\n{metadata_notes}\nDETAILED TRAINING DATA:\n{specific_intel}"
