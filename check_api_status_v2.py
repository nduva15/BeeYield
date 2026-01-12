
import requests
import json

def check_status():
    try:
        r = requests.get("http://localhost:8000/")
        print("API STATUS RESPONSE:")
        print(json.dumps(r.json(), indent=2))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_status()
