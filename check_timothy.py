
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

def get_timothy_id():
    # Try multiple ways to find Timothy
    for query in [
        "email=eq.timothynduva349@gmail.com",
        "full_name=ilike.*Timothy*",
        "full_name=ilike.*nduva*"
    ]:
        url = f"{SUPABASE_URL}/rest/v1/profiles?{query}&select=id,full_name,email"
        response = httpx.get(url, headers=headers)
        data = response.json()
        print(f"Query {query} result: {data}")
        if isinstance(data, list) and len(data) > 0:
            return data[0]['id']
    return None

def check_counts(user_id):
    if not user_id:
        print("No user found")
        return
    
    print(f"--- Checking data for User ID: {user_id} ---")
    
    # Apiaries
    url = f"{SUPABASE_URL}/rest/v1/apiaries?user_id=eq.{user_id}&select=id,name"
    response = httpx.get(url, headers=headers)
    apiaries = response.json()
    print(f"Apiaries for {user_id}: {apiaries}")

    # Hives
    url = f"{SUPABASE_URL}/rest/v1/hives?user_id=eq.{user_id}&select=count"
    headers_count = headers.copy()
    headers_count["Prefer"] = "count=exact"
    response = httpx.get(url, headers=headers_count)
    print(f"Hive count (exact): {response.headers.get('Content-Range')}")

    # Harvests
    url = f"{SUPABASE_URL}/rest/v1/harvests?user_id=eq.{user_id}&select=count"
    response = httpx.get(url, headers=headers_count)
    print(f"Harvest count (exact): {response.headers.get('Content-Range')}")

    # Harvest Total quantity_kg
    url = f"{SUPABASE_URL}/rest/v1/harvests?user_id=eq.{user_id}&select=quantity_kg"
    response = httpx.get(url, headers=headers)
    harvests = response.json()
    if isinstance(harvests, list):
        total_kg = sum(h.get('quantity_kg', 0) for h in harvests)
        print(f"Total harvest kg: {total_kg} (from {len(harvests)} records fetched)")
    else:
        print(f"Error fetching harvests: {harvests}")

user_id = get_timothy_id()
check_counts(user_id)
