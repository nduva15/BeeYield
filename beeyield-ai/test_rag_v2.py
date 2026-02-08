import urllib.request
import json

def test_rag():
    base_url = "http://localhost:8001"
    
    print("Testing /health...")
    try:
        with urllib.request.urlopen(f"{base_url}/health") as response:
            data = json.loads(response.read().decode())
            print(f"Health: {data}")
    except Exception as e:
        print(f"Health failed: {e}")
        return

    print("\nTesting /stats...")
    try:
        with urllib.request.urlopen(f"{base_url}/stats") as response:
            data = json.loads(response.read().decode())
            print(f"Stats: {data}")
    except Exception as e:
        print(f"Stats failed: {e}")

    print("\nTesting /query (Timothy Nduva story)...")
    url = f"{base_url}/query"
    payload = json.dumps({
        "query": "Who is Timothy Nduva and what is his story?",
        "top_k": 3
    }).encode('utf-8')
    
    req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'})
    
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            print(f"Status: Success")
            print(f"Query Type: {data['query_type']}")
            print(f"Sources: {len(data['sources'])}")
            print(f"Context Sample: {data['context'][:200]}...")
    except Exception as e:
        print(f"Query failed: {e}")

if __name__ == "__main__":
    test_rag()
