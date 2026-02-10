
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
    
    counts = {}
    for h in hives:
        uid = h.get('user_id')
        counts[uid] = counts.get(uid, 0) + 1
    
    print("Hive counts per user:")
    for uid, count in counts.items():
        print(f"User {uid}: {count} hives")

check_hives()
