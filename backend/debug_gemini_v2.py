
import httpx
import os
import json
from dotenv import load_dotenv

load_dotenv(".env")

async def debug():
    key = os.getenv("GOOGLE_API_KEY")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={key}"
    
    payload = {
        "contents": [{"role": "user", "parts": [{"text": "Hello, tell me a joke about bees."}]}],
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload)
        print(f"STATUS: {response.status_code}")
        print(f"RESPONSE: {response.text}")

if __name__ == "__main__":
    import asyncio
    asyncio.run(debug())
