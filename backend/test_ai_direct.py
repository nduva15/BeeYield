
import asyncio
import os
import sys

# Add the current directory to sys.path to allow importing 'app'
sys.path.append(os.getcwd())

from app.services.ai_service import AIService
from app.core.config import settings

async def test_direct():
    print(f"Testing with GOOGLE_API_KEY: {settings.GOOGLE_API_KEY}")
    try:
        response = await AIService.chat("Hello, tell me about BeeYield.", current_time="12:00:00", current_date="Friday, Jan 16, 2026")
        print("\n--- FINAL RESPONSE ---")
        print(response)
        print("----------------------")
    except Exception as e:
        print(f"Direct test exception: {e}")

if __name__ == "__main__":
    asyncio.run(test_direct())
