import asyncio
import httpx

async def test_ai_output():
    url = "http://localhost:8000/api/v1/ai/chat"
    payload = {
        "message": "Who is Timothy Mathuva?",
        "history": [],
        "language": "EN"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, timeout=30.0)
        data = response.json()
        print("RAW RESPONSE:")
        print(data.get("response"))
        
        content = data.get("response", "")
        if "**" in content: print("ERROR: Bold detected!")
        if "#" in content: print("ERROR: Header detected!")
        if "_" in content: print("ERROR: Underscore detected!")

if __name__ == "__main__":
    asyncio.run(test_ai_output())
