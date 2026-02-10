
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

def check_hives():
    url = f"{SUPABASE_URL}/rest/v1/hives?select=user_id"
    response = httpx.get(url, headers=headers)
    hives = response.json()
    if not isinstance(hives, list):
        print(f"Error: {hives}")
        return
    
    counts = {}
    for h in hives:
        uid = h.get('user_id')
        counts[uid] = counts.get(uid, 0) + 1
    
    print("Hive counts per user:")
    for uid, count in counts.items():
        # Get full name for uid
        url_p = f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{uid}&select=full_name"
        resp_p = httpx.get(url_p, headers=headers)
        p = resp_p.json()
        name = p[0]['full_name'] if isinstance(p, list) and p else "Unknown"
        print(f"User {uid} ({name}): {count} hives")

check_hives()
