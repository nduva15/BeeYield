import asyncio
import os
import sys

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

from app.services.content_service import ContentService

async def test_deep_knowledge():
    print("Testing Deep Knowledge Retrieval...")
    
    queries = [
        "Who is the CEO of BeeYield?",
        "What are the smart hive sensors?",
        "Tell me about the BeeLearn courses",
        "What is the impact in Makueni?"
    ]
    
    for q in queries:
        print(f"\n--- QUERY: {q} ---")
        summary = await ContentService.get_website_knowledge_summary(q)
        print(summary)

if __name__ == "__main__":
    asyncio.run(test_deep_knowledge())
