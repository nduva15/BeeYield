
import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_URL = "http://localhost:8000/api/v1"
# We need a valid token. Since we can't easily get one without login, 
# we can try to call a public endpoint or just check if the endpoint returns 401 (which means it exists).
# If it didn't exist, it would return 404.

def check_endpoints():
    endpoints = [
        "/settings/full",
        "/settings/hives",
        "/settings/hives/global/thresholds" # POST
    ]
    
    print("Checking Endpoints Existence...")
    
    for ep in endpoints:
        try:
            url = f"{API_URL}{ep}"
            # method GET for first two, POST for last
            if "thresholds" in ep:
                resp = requests.post(url)
            else:
                resp = requests.get(url)
            
            print(f"[{resp.status_code}] {ep}")
            
            if resp.status_code == 404:
                print(f"❌ Error: Endpoint {ep} not found!")
            elif resp.status_code == 401:
                print(f"✅ Endpoint {ep} exists (Protected)")
            else:
                 print(f"✅ Endpoint {ep} exists (Status {resp.status_code})")
                 
        except Exception as e:
            print(f"Connection Error: {e}")

if __name__ == "__main__":
    check_endpoints()
