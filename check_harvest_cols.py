
import os
import httpx
from dotenv import load_dotenv

load_dotenv('backend/.env')

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_KEY')

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

def check_harvest_cols():
    # Use select=* and limit=1 to see column names
    url = f"{SUPABASE_URL}/rest/v1/harvests?select=*&limit=1"
    response = httpx.get(url, headers=headers)
    data = response.json()
    if data and isinstance(data, list):
        print("Harvest columns:")
        for k in data[0].keys():
            print(f" - {k}")
    else:
        print(f"No harvest data or error: {data}")

check_harvest_cols()
