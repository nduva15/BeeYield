
import asyncio
import sys
import os

# Add backend to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.services.content_service import ContentService

async def test_retrieval():
    print("--- Testing 'Varroa' Query ---")
    summary = await ContentService.get_website_knowledge_summary("Varroa")
    
    # Check for our specific phrases
    if "**HOWEVER, WITH BEEYIELD**" in summary or "450Hz" in summary:
        print("SUCCESS: Found BeeYield Varroa Context!")
        print(summary[:500]) # Print first 500 chars
    else:
        print("FAILURE: Did not find BeeYield Varroa Context.")
        print("Got:\n" + summary[:500])

if __name__ == "__main__":
    asyncio.run(test_retrieval())
