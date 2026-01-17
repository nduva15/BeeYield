from typing import List, Dict, Any, Optional
import os
import json
import re

class ContentService:
    @staticmethod
    async def get_raw_knowledge_base() -> Dict[str, Any]:
        """Reads the ultra-granular knowledge base."""
        kb_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../data/knowledge_base.json"))
        if not os.path.exists(kb_path):
            return {}
        try:
            with open(kb_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return {}

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
        Combines DNA (Identity) + Node Retrieval (Details).
        """
        kb = await ContentService.get_raw_knowledge_base()
        if not kb:
            return "BEEYIELD DNA: Knowledge Loading..."

        # 1. Hardcoded Identity (Always included for grounding)
        dna = kb.get("dna", {})
        dna_text = (
            f"BEE YIELD IDENTITY:\n"
            f"- Mission: {dna.get('mission')}\n"
            f"- HQ: {dna.get('hq', {}).get('location')} on a {dna.get('hq', {}).get('farm_size')}\n"
            f"- Founders: {', '.join([f'{f.get('name')} ({f.get('role')})' for f in dna.get('founders', [])])}\n"
            f"- Tech: {dna.get('tech_stack', {}).get('sensors')} using {dna.get('tech_stack', {}).get('blockchain')}\n"
        )
        
        # 2. Dynamic Component Discovery
        specific_intel = await ContentService.search_knowledge(query)
        
        return f"{dna_text}\nDETAILED TRAINING DATA:\n{specific_intel}"
