import asyncio
import os
import sys

# Standard BeeYield Test Mocks
os.environ["SUPABASE_URL"] = "https://mock.supabase.co"
os.environ["SUPABASE_KEY"] = "mock_key"
os.environ["GOOGLE_API_KEY"] = "mock_key"

sys.path.append(os.path.abspath("backend"))
sys.path.append(os.path.abspath("."))

async def test_gemini_rag():
    print("🧠 INITIATING GEMINI-STYLE RAG SYNTHESIS TEST...")
    
    from backend.app.services.ai_service import AIService
    from unittest.mock import patch
    
    query = "Provide a full report on African honey bee resilience and our current Nairobi harvest yield."
    
    # Mock knowledge nodes to simulate 15k corpus reach
    mock_knowledge = (
        "According to the University of Pretoria (2024), African bees (A.m. scutellata) "
        "show higher hygienic behavior against Varroa [1]. "
        "Nairobi Hub 2026 harvest logs record a 12.4kg yield per hive [2]."
    )
    
    with patch("backend.app.services.content_service.ContentService.get_website_knowledge_summary", return_value=mock_knowledge):
        print(f"📝 Testing Query: {query}")
        
        response = await AIService.chat(
            message=query,
            language="EN",
            current_time="03:10",
            current_date="2026-02-06"
        )
        
        print("\n--- GEMINI-STYLE OUTPUT PREVIEW ---")
        print(response)
        
        expected_pillars = ["## Executive Summary", "## Technical Analysis", "## IoT & Precision Insights", "## Internal Operations", "## Bibliography"]
        missing = [p for p in expected_pillars if p not in response]
        
        if not missing:
            print("\n✅ SUCCESS: All Five Pillars detected in output.")
        else:
            print(f"\n❌ FAILED: Missing pillars: {missing}")

if __name__ == "__main__":
    asyncio.run(test_gemini_rag())
