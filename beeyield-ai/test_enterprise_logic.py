import asyncio
import os
import sys

# Environment Setup
sys.path.append(os.path.abspath("backend"))
sys.path.append(os.path.abspath("."))

async def test_logic_components():
    print("🧪 STARTING STANDALONE LOGIC VERIFICATION...")
    
    from app.services.hybrid_search import HybridSearch
    from app.services.synthesizer import Synthesizer
    from unittest.mock import patch

    # 1. Test Query Rewriting & Namespace Detection
    print("\n[TEST 1] Testing Query Rewriting & Namespace Detection...")
    query = "Check harvest yield and Varroa prevention for batch KIB-MAIN-26-01"
    
    with patch("app.services.content_service.ContentService.get_website_knowledge_summary") as mock_kb:
        mock_kb.return_value = "Mocked research content about Varroa."
        
        results = await HybridSearch.search(query)
        
        print(f"Rewritten Query: {results.get('rewritten_query')}")
        
        keyword_hits = results.get("keyword_results", [])
        print(f"Keyword Hits: {len(keyword_hits)}")
        
        if keyword_hits and "KIB-MAIN-26-01" in keyword_hits[0]["content"]:
            print("✅ SUCCESS: HybridSearch detected batch code and partitioned it.")
        else:
            print("❌ FAILED: HybridSearch failed to detect/partition batch code.")

    # 2. Test Synthesizer Framework
    print("\n[TEST 2] Testing Synthesizer Governance Protocol...")
    
    # Simulate search results with diverse namespaces
    mock_results = {
        "top_hits": [
            {"type": "METADATA", "content": "Verified Batch KIB-MAIN-26-01 on BeeYield Ledger.", "is_internal": True},
            {"type": "SEMANTIC", "content": "University of Pretoria: Varroa resistance research.", "is_internal": False},
            {"type": "SEMANTIC", "content": "BeeYield Internal: 12.4kg yield in Nairobi.", "is_internal": True}
        ]
    }
    
    synthesis_prompt = await Synthesizer.synthesize_response(mock_results, query, "PATHOLOGY")
    
    print("\n--- SYNTHESIS PROMPT GENERATED ---")
    print(synthesis_prompt)
    
    pillars = ["I. INTELLIGENCE BRIEF", "II. DIAGNOSIS", "III. REGIONAL", "IV. INTERNAL", "V. VERIFIED"]
    if all(p in synthesis_prompt for p in pillars):
        print("\n✅ SUCCESS: Five-Pillar framework enforced in governance protocol.")
    else:
        print("\n❌ FAILED: Missing pillars in generated prompt.")
    
    # 3. Test Partitioning Accuracy
    if "UNIVERSITY RESEARCH" in synthesis_prompt and "INTERNAL BUSINESS LOGS" in synthesis_prompt:
        print("✅ SUCCESS: Namespace Partitioning confirmed in synthesis prompt.")
    else:
        print("❌ FAILED: Namespace Partitioning missing in synthesis prompt.")

if __name__ == "__main__":
    asyncio.run(test_logic_components())
