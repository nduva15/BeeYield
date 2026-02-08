import requests
import json
import time

def test_rag():
    base_url = "http://localhost:8001"
    
    print("Testing /health...")
    try:
        res = requests.get(f"{base_url}/health")
        print(f"Health: {res.json()}")
    except Exception as e:
        print(f"Health failed: {e}")
        return

    print("\nTesting /query (Company Mission)...")
    payload = {
        "query": "What is BeeYield's mission?",
        "top_k": 3
    }
    try:
        res = requests.post(f"{base_url}/query", json=payload)
        data = res.json()
        print(f"Source Types: {[s['type'] for s in data['sources']]}")
        print(f"Query Type: {data['query_type']}")
        print(f"Context Snippet: {data['context'][:200]}...")
    except Exception as e:
        print(f"Query failed: {e}")

    print("\nTesting /stats...")
    try:
        res = requests.get(f"{base_url}/stats")
        print(f"Stats: {res.json()}")
    except Exception as e:
        print(f"Stats failed: {e}")

if __name__ == "__main__":
    test_rag()
