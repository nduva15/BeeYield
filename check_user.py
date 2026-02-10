
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

def check_user(user_id):
    url = f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{user_id}&select=*"
    response = httpx.get(url, headers=headers)
    print(f"Profile: {response.json()}")

    # For email, we might need to check if it's in a different field or table if profiles doesn't have it
    # But usually we can check auth.users directly via SQL
    
check_user('10c9b5b3-f9c4-47cf-bc6b-c7d6e8e4bce6')
