import os
import sys
import httpx
from dotenv import load_dotenv

load_dotenv(".env")
SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Missing Supabase admin credentials")
    sys.exit(1)

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

def find_timothy():
    print(f"Connecting to {SUPABASE_URL}...")
    url = f"{SUPABASE_URL}/auth/v1/admin/users"
    
    with httpx.Client(base_url=url, headers=headers) as client:
        # Paging through users
        params = {"page": 1, "per_page": 50}
        found = False
        
        while True:
            try:
                resp = client.get("", params=params)
                if resp.status_code != 200:
                    print(f"Error fetching users: {resp.status_code} {resp.text}")
                    break
                
                users = resp.json().get("users", [])
                if not users:
                    break
                
                for u in users:
                    email = u.get("email", "").lower()
                    if "timothy" in email or "nduva" in email:
                        print(f"FOUND USER: {u.get('id')} ({email})")
                        found = True
                        return u.get('id')
                
                params["page"] += 1
            except Exception as e:
                print(f"Exception: {e}")
                break
        
        if not found:
            print("Timothy Nduva not found in auth users.")
            return None

if __name__ == "__main__":
    find_timothy()
