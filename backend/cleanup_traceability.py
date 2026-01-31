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

def cleanup():
    # Tables in reverse order of dependencies
    tables = [
        "blockchain_records",
        "honey_batches",
        "batches",
        "processing_records",
        "harvests",
        "flower_sources",
        "colonies",
        "hives",
        "apiaries",
        "farmers"
    ]
    
    print("--- Cleaning up Traceability Tables ---")
    for table in tables:
        try:
            print(f"Clearing {table}...")
            # We use a query that matches everything to delete all rows
            # In Supabase/Postgrest, we need a filter to perform a delete
            res = supabase.table(table).delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
            print(f"✓ {table} cleared.")
        except Exception as e:
            # Table might not exist or have different structure
            if "does not exist" in str(e):
                print(f"Skipping {table} (table does not exist)")
            else:
                print(f"Error clearing {table}: {e}")

if __name__ == "__main__":
    cleanup()
