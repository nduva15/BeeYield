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
    with open("backend/inspect_output.txt", "w", encoding="utf-8") as f:
        f.write("--- Farmers ---\n")
        res = supabase.table("farmers").select("*").execute()
        for row in res.data:
            f.write(f"ID: {row['id']} | Name: {row['name']} | FarmerID: {row.get('farmer_id')} | Created: {row['created_at']}\n")

        f.write("\n--- Apiaries ---\n")
        res = supabase.table("apiaries").select("*").execute()
        for row in res.data:
            f.write(f"ID: {row['id']} | Name: {row['name']} | Code: {row['apiary_code']} | FarmerID: {row['farmer_id']}\n")

        f.write("\n--- Batches ---\n")
        res = supabase.table("batches").select("*").execute()
        for row in res.data:
            f.write(f"ID: {row['id']} | Code: {row['batch_code']} | Created: {row['created_at']}\n")

        try:
            f.write("\n--- Honey Batches ---\n")
            res = supabase.table("honey_batches").select("*").execute()
            for row in res.data:
                f.write(f"ID: {row['id']} | Code: {row['batch_code']} | Created: {row['created_at']}\n")
        except:
            pass

if __name__ == "__main__":
    check_traceability()
