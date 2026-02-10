import os
import json
import re
from datetime import datetime
from typing import List, Dict, Any

class MetadataStandardizer:
    """
    KNOWLEDGE LAKEHOUSE ENGINE (v4.0)
    Standardizes 13,000+ datasets with strict metadata gating.
    """
    
    SOURCE_MAPPING = {
        "icipe": {"continent": "Africa", "score": 1.0, "type": "Academic"},
        "pretoria": {"continent": "Africa", "score": 1.0, "type": "Academic"},
        "usda": {"continent": "North America", "score": 1.0, "type": "Government"},
        "researchgate": {"continent": "Global", "score": 0.8, "type": "Pre-print"},
        "beeyield": {"continent": "Africa", "score": 1.0, "type": "Internal"},
        "apisense": {"continent": "Global", "score": 0.9, "type": "IoT"},
        "beehero": {"continent": "Global", "score": 0.9, "type": "IoT"}
    }

    @staticmethod
    def detect_continent(text: str, source_name: str) -> str:
        text_lower = text.lower()
        if any(kw in text_lower for kw in ["kenya", "nairobi", "africa", "ethiopia", "uganda", "makueni"]):
            return "Africa"
        if any(kw in text_lower for kw in ["usa", "america", "florida", "mississippi", "california"]):
            return "North America"
        if any(kw in text_lower for kw in ["eu", "europe", "germany", "poland", "hohenheim"]):
            return "Europe"
        
        # Check source name if text check fails
        for key, meta in MetadataStandardizer.SOURCE_MAPPING.items():
            if key in source_name.lower():
                return meta["continent"]
        
        return "Global"

    @staticmethod
    def get_reliability(source_name: str) -> float:
        for key, meta in MetadataStandardizer.SOURCE_MAPPING.items():
            if key in source_name.lower():
                return meta["score"]
        return 0.7 # Default for unmapped sources

    @staticmethod
    def get_source_type(source_name: str, subtopic: str) -> str:
        for key, meta in MetadataStandardizer.SOURCE_MAPPING.items():
            if key in source_name.lower():
                return meta["type"]
        if "DB_" in source_name: return "Internal_Database"
        return "General_Research"

    @classmethod
    def standardize_node(cls, node: Dict[str, Any]) -> Dict[str, Any]:
        content = node.get("content", "")
        source = node.get("source", "Unknown")
        subtopic = node.get("subtopic", "General")
        
        standardized = {
            "id": node.get("id", f"node_{hash(content + source) % 10**8}"),
            "content": content,
            "metadata": {
                "source": source,
                "subtopic": subtopic,
                "continent": cls.detect_continent(content, source),
                "source_type": cls.get_source_type(source, subtopic),
                "reliability_score": cls.get_reliability(source),
                "is_internal": node.get("is_internal", False) or "beeyield" in source.lower(),
                "timestamp": datetime.now().isoformat(),
                "url": node.get("url", "")
            }
        }
        return standardized

async def run_standardization():
    print("🚀 INITIATING METADATA STANDARDIZATION FOR 13,000+ DATASETS...")
    
    kb_path = "backend/app/data/knowledge_base.json"
    if not os.path.exists(kb_path):
        print("❌ Error: Knowledge base not found.")
        return

    with open(kb_path, 'r', encoding='utf-8') as f:
        kb_data = json.load(f)

    raw_nodes = kb_data.get("knowledge_nodes", [])
    standardized_nodes = []
    
    for node in raw_nodes:
        std_node = MetadataStandardizer.standardize_node(node)
        standardized_nodes.append(std_node)

    # Process external batches
    batch_dir = "data/research_batch"
    if os.path.exists(batch_dir):
        for file in os.listdir(batch_dir):
            if file.endswith(".json"):
                with open(os.path.join(batch_dir, file), 'r', encoding='utf-8') as f:
                    batch_data = json.load(f)
                    for item in batch_data:
                        node = {
                            "source": item.get("source", "Global Research"),
                            "content": f"{item.get('title')}\n{item.get('summary')}",
                            "url": item.get("url"),
                            "is_internal": False
                        }
                        standardized_nodes.append(MetadataStandardizer.standardize_node(node))

    output_path = "backend/app/data/standardized_lakehouse.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump({
            "version": "4.0.0",
            "lakehouse_nodes": standardized_nodes,
            "total_count": len(standardized_nodes)
        }, f, indent=2)

    print(f"✅ SUCCESS: {len(standardized_nodes)} nodes standardized and saved to Lakehouse.")

if __name__ == "__main__":
    import asyncio
    asyncio.run(run_standardization())
