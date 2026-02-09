
import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Load credentials from backend/.env
load_dotenv(dotenv_path="backend/.env")

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in backend/.env")
    sys.exit(1)

supabase: Client = create_client(url, key)

def verify_tables():
    tables_to_check = [
        "profiles",
        "apiaries",
        "hives",
        "inspections",
        "tasks",
        "harvests",
        "farmers"
    ]
    
    print("\nVerifying BeeYield Hives Backend Schema...")
    print("=" * 45)
    
    all_ok = True
    for table in tables_to_check:
        try:
            supabase.table(table).select("*").limit(0).execute()
            print(f"Table '{table}': EXISTS")
        except Exception as e:
            if "does not exist" in str(e).lower() or "404" in str(e):
                print(f"Table '{table}': MISSING")
                all_ok = False
            else:
                print(f"Table '{table}': Error checking ({e})")
                all_ok = False
    
    print("=" * 45)
    if all_ok:
        print("SUCCESS: All backend tables are correctly initialized!")
    else:
        print("MISSING TABLES DETECTED.")

if __name__ == "__main__":
    verify_tables()
