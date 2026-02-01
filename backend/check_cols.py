
import os
import sys
import httpx
# Add the current directory to sys.path so we can import app
sys.path.append(os.getcwd())

from app.core.config import settings

def check_columns():
    headers = {
        "apikey": settings.SUPABASE_ANON_KEY or settings.SUPABASE_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_ANON_KEY or settings.SUPABASE_KEY}",
    }
    url = f"{settings.SUPABASE_URL}/rest/v1/apiaries?limit=1"
    
    with httpx.Client() as client:
        resp = client.get(url, headers=headers)
        if resp.status_code == 200:
            data = resp.json()
            if data:
                print(f"Columns: {list(data[0].keys())}")
            else:
                print("No data found.")
        else:
            print(f"Error: {resp.status_code} - {resp.text}")

if __name__ == "__main__":
    check_columns()
