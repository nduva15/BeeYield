
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

def check_id_exists(user_id):
    url = f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{user_id}&select=id,full_name"
    response = httpx.get(url, headers=headers)
    print(f"ID {user_id} in profiles: {response.json()}")
    
    url = f"{SUPABASE_URL}/rest/v1/apiaries?user_id=eq.{user_id}&select=id,name"
    response = httpx.get(url, headers=headers)
    print(f"ID {user_id} apiaries: {response.json()}")

    url = f"{SUPABASE_URL}/rest/v1/hives?user_id=eq.{user_id}&select=count"
    headers_count = headers.copy()
    headers_count["Prefer"] = "count=exact"
    response = httpx.get(url, headers=headers_count)
    print(f"ID {user_id} hives: {response.headers.get('Content-Range')}")

check_id_exists('c6b8d234-a6f2-4d7a-a634-8c4d2d3a3c1e')
