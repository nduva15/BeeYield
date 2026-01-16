import asyncio
import sys
import os

# Ensure backend folder is in path
sys.path.append(os.getcwd())

from app.services.ai_service import AIService

async def test():
    print("Testing 'What are our newest products?'...")
    resp = await AIService.chat(
        message="What are our newest products?", 
        current_time="12:00:00", 
        current_date="Friday, Jan 16"
    )
    print("\n--- RESPONSE ---")
    print(resp)
    print("--- END RESPONSE ---\n")

if __name__ == "__main__":
    asyncio.run(test())
