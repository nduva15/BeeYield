
import os
import sys
import httpx
# Add the current directory to sys.path so we can import app
sys.path.append(os.getcwd())

from app.core.config import settings

def manual_update():
    headers = {
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    url = f"{settings.SUPABASE_URL}/rest/v1/apiaries"
    
    # First get the ID
    with httpx.Client() as client:
        resp = client.get(url, headers=headers)
        apiaries = resp.json()
        if not apiaries:
            print("No apiaries to update.")
            return
            
        aid = apiaries[0]['id']
        print(f"Targeting Apiary ID: {aid}")
        
        # Now update
        patch_url = f"{url}?id=eq.{aid}"
        payload = {"status": "active"}
        
        resp = client.patch(patch_url, json=payload, headers=headers)
        print(f"Status Code: {resp.status_code}")
        print(f"Response: {resp.text}")

if __name__ == "__main__":
    manual_update()
