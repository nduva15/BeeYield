
import os
import sys
import httpx
import json
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
        with open("cols_manual.txt", "w") as f:
            if resp.status_code == 200:
                data = resp.json()
                if data:
                    f.write(json.dumps(list(data[0].keys())))
                else:
                    f.write("No data found.")
            else:
                f.write(f"Error: {resp.status_code} - {resp.text}")

if __name__ == "__main__":
    check_columns()
