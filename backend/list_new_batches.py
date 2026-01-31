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

def list_batches():
    print("--- New Real Batches ---")
    try:
        res = supabase.table("honey_batches").select("*").execute()
        for b in res.data:
            print(f"Batch Code: {b['batch_code']}")
            print(f"  Type: {b['honey_type']}")
            print(f"  Farmer: {b['farmer_name']}")
            print(f"  Location: {b['location_region']}, {b['location_county']}")
            print(f"  Quantity: {b['quantity_kg']}kg")
            print(f"  Harvest Date: {b['harvest_date']}")
            print(f"  Packaged Date: {b['packaged_date']}")
            print(f"  Status: {b['status']}")
            print("-" * 20)
    except Exception as e:
        print(f"Error reading batches: {e}")

if __name__ == "__main__":
    list_batches()
