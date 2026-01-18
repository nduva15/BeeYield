import asyncio
import sys
import os

# Add the app directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "app")))

from services.content_service import ContentService

async def test_search():
    query = "American Foulbrood symptoms"
    print(f"Searching for: {query}")
    results = await ContentService.get_website_knowledge_summary(query)
    print("\n--- SEARCH RESULTS ---\n")
    print(results)
    print("\n----------------------\n")

if __name__ == "__main__":
    asyncio.run(test_search())
