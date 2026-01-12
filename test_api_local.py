
import requests

def test_api():
    base_url = "http://localhost:8000/api/v1"
    
    print("Testing /admin/farmers...")
    try:
        r = requests.get(f"{base_url}/admin/farmers")
        if r.status_code == 200:
            data = r.json()
            print(f"Success! Found {len(data)} farmers.")
        else:
            print(f"Failed: {r.status_code} - {r.text}")
    except Exception as e:
        print(f"Error: {e}")

    print("\nTesting /admin/batches...")
    try:
        r = requests.get(f"{base_url}/admin/batches")
        if r.status_code == 200:
            data = r.json()
            print(f"Success! Found {len(data)} batches.")
        else:
            print(f"Failed: {r.status_code} - {r.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_api()
