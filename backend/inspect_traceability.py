import os
import sys
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("X Error: Supabase credentials not found")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def check_traceability():
    print("--- Farmers ---")
    res = supabase.table("farmers").select("name, farmer_id").execute()
    for row in res.data:
        print(f"- {row['name']} ({row['farmer_id']})")

    print("\n--- Apiaries ---")
    res = supabase.table("apiaries").select("name, apiary_code").execute()
    for row in res.data:
        print(f"- {row['name']} ({row['apiary_code']})")

    print("\n--- Batches ---")
    res = supabase.table("batches").select("batch_code, created_at").execute()
    for row in res.data:
        print(f"- {row['batch_code']} (Created: {row['created_at']})")

    # Also check 'honey_batches' as it's mentioned in the sql script
    try:
        print("\n--- Honey Batches ---")
        res = supabase.table("honey_batches").select("batch_code, created_at").execute()
        for row in res.data:
            print(f"- {row['batch_code']} (Created: {row['created_at']})")
    except:
        print("Table 'honey_batches' not found.")

if __name__ == "__main__":
    check_traceability()
