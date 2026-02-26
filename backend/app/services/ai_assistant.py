import httpx

RUST_SERVICE_URL = "http://127.0.0.1:9091"

class BeeYieldAI:
    @staticmethod
    async def query_assistant(payload: dict):
        async with httpx.AsyncClient() as client:
            # Direct handshake with the Rust Core
            response = await client.post(f"{RUST_SERVICE_URL}/ai/query", json=payload)
            return response.json()

# Match the names your __init__.py is looking for
Assistant = BeeYieldAI 
AIQuery = dict
AIContext = dict
AIResponse = dict
