import asyncio
import os
import sys
import json

# Ensure backend folder is in path
sys.path.append(os.getcwd())

from app.services.ai_service import AIService
from app.core.config import settings

async def verify_gemini():
    print("--- BeeYield AI Hub: Verification Sequence ---")
    
    key = settings.GOOGLE_API_KEY
    if not key:
        print("FAILED: GOOGLE_API_KEY not found in settings.")
        return

    print(f"Key detected: {key[:4]}...{key[-4:]}")
    
    test_queries = [
        "What are our newest products?",
        "Analyze the health of hive H-KIB-01-01"
    ]
    
    for query in test_queries:
        print(f"\nQUERY: {query}")
        print("-" * 30)
        try:
            # We mock the time/date context
            response = await AIService.chat(
                message=query,
                current_time="17:30:00",
                current_date="Friday, January 16, 2026"
            )
            print("RESPONSE:")
            print(response)
            
            # Basic validation
            if "BEEYIELD" in response.upper() or "HONEY" in response.upper():
                print("\nSUCCESS: AI is responding with BeeYield intelligence.")
            else:
                print("\nWARNING: Response seems generic.")
                
        except Exception as e:
            print(f"ERROR during AI verification: {e}")

if __name__ == "__main__":
    asyncio.run(verify_gemini())
