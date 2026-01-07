
import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

def list_tables():
    url = f"{SUPABASE_URL}/rest/v1/"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            spec = response.json()
            definitions = spec.get('definitions', {})
            tables = sorted(list(definitions.keys()))
            print(f"TABLES_FOUND")
            for t in tables:
                print(f"T:{t}")
        else:
            print(f"ERROR:{response.status_code}")
    except Exception as e:
        print(f"EXCEPTION:{e}")

if __name__ == "__main__":
    list_tables()
