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
    res = supabase.table("farmers").select("*").execute()
    for row in res.data:
        print(f"ID: {row['id']} | Name: {row['name']} | FarmerID: {row.get('farmer_id')} | Created: {row['created_at']}")

    print("\n--- Apiaries ---")
    res = supabase.table("apiaries").select("*").execute()
    for row in res.data:
        print(f"ID: {row['id']} | Name: {row['name']} | Code: {row['apiary_code']} | FarmerID: {row['farmer_id']}")

    print("\n--- Batches ---")
    res = supabase.table("batches").select("*").execute()
    for row in res.data:
        print(f"ID: {row['id']} | Code: {row['batch_code']} | Created: {row['created_at']}")

    try:
        print("\n--- Honey Batches ---")
        res = supabase.table("honey_batches").select("*").execute()
        for row in res.data:
            print(f"ID: {row['id']} | Code: {row['batch_code']} | Created: {row['created_at']}")
    except:
        pass

if __name__ == "__main__":
    check_traceability()
