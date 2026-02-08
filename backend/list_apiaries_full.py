import sys
import os
import httpx
from dotenv import load_dotenv

# Load env from .env file manually since pydantic settings might be tricky
load_dotenv(".env")
SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Missing Supabase credentials")
    sys.exit(1)

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def list_apiaries():
    print(f"Connecting to {SUPABASE_URL}...")
    with httpx.Client(base_url=f"{SUPABASE_URL}/rest/v1", headers=headers, timeout=30.0) as client:
        # Get all apiaries
        resp = client.get("/apiaries?select=*")
        if resp.status_code == 200:
            apiaries = resp.json()
            print(f"Found {len(apiaries)} apiaries.")
            for a in apiaries:
                print(f"ID: {a.get('id')}")
                print(f"Name: {a.get('name')}")
                print(f"User ID: {a.get('user_id')}")
                print(f"Code: {a.get('apiary_code')}")
                print(f"Size Acres: {a.get('size_acres')}")
                print(f"Hive Count: {a.get('hive_count')}")
                print("-" * 20)
                
                # Check for Timothy by name
                if "Timothy" in str(a.get("name")) or "Kibwezi" in str(a.get("name")):
                    print(">>> POTENTIAL MATCH FOR TIMOTHY <<<")
        else:
            print(f"Error: {resp.status_code} - {resp.text}")

if __name__ == "__main__":
    list_apiaries()
