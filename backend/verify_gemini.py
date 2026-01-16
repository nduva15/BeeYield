
import asyncio
import httpx

async def test_ai():
    url = "http://localhost:8000/api/v1/ai/chat"
    payload = {"message": "Hello, are you active?"}
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, timeout=20.0)
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_ai())
