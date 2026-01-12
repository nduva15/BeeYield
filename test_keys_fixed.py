
import os
import requests
from supabase import create_client, Client
from dotenv import load_dotenv

# Force load from backend/.env
load_dotenv("backend/.env")

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

print(f"URL: {url}")
print(f"KEY: {key[:10]}...{key[-10:]}")

try:
    s = create_client(url, key)
    res = s.table("honey_batches").select("*").limit(1).execute()
    print(f"SUCCESS: {len(res.data)} rows")
except Exception as e:
    print(f"FAIL: {e}")
