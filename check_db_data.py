import os
import sys
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("X Error: Supabase credentials not found in .env")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def check_data():
    print("--- Checking Farmers ---")
    farmers = supabase.table("farmers").select("*").execute()
    print(f"Total Farmers: {len(farmers.data)}")
    for f in farmers.data:
        print(f" - {f.get('name')} ({f.get('farmer_id')})")

    print("\n--- Checking Batches ---")
    batches = supabase.table("batches").select("*").execute()
    print(f"Total Batches: {len(batches.data)}")
    for b in batches.data:
        print(f" - {b.get('batch_code')}")

if __name__ == "__main__":
    check_data()
