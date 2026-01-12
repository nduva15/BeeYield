
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv("backend/.env")

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

s = create_client(url, key)

print("--- DIAGNOSTIC CHECK ---")

try:
    res = s.table("honey_batches").select("*").limit(1).execute()
    print(f"HONEY_BATCHES: Visible! Count = {len(res.data)}")
    if res.data:
        print(f"  Sample Batch: {res.data[0].get('batch_code')}")
except Exception as e:
    print(f"HONEY_BATCHES: ERROR - {e}")

try:
    res = s.table("farmers").select("*").limit(1).execute()
    print(f"FARMERS: Visible! Count = {len(res.data)}")
    if res.data:
        print(f"  Sample Farmer: {res.data[0].get('name')}")
except Exception as e:
    print(f"FARMERS: ERROR - {e}")
