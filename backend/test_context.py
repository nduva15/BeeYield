
import asyncio
import httpx
import os
from dotenv import load_dotenv

load_dotenv(".env")

async def test_context():
    google_key = os.getenv("GOOGLE_API_KEY")
    url = "http://localhost:8000/api/v1/ai/chat"
    
    questions = [
        "Who is the CEO of BeeYield?",
        "Are there any job openings for an Agronomist?",
        "What specific sensors are in the smart hive?",
        "Tell me the story of how BeeYield started."
    ]
    
    print("--- TESTING BEEYIELD CONTEXT AWARENESS ---\n")
    
    for q in questions:
        print(f"Q: {q}")
        payload = {"message": q}
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload, timeout=30.0)
                if response.status_code == 200:
                    answer = response.json()["response"]
                    print(f"AI: {answer}\n")
                else:
                    print(f"Error {response.status_code}: {response.text}\n")
        except Exception as e:
            print(f"Connection Error: {e}\n")

if __name__ == "__main__":
    asyncio.run(test_context())
