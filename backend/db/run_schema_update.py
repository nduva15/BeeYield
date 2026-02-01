
import os
import sys
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("X Error: Supabase credentials not found in .env")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
print(f"Connected to Supabase: {SUPABASE_URL}")

def run_sql_via_rpc(sql_content):
    # Supabase-py doesn't support raw SQL execution directly on the client if not exposed via RPC.
    # But often users have a 'exec_sql' or similar RPC function seeded.
    # If not, we might be stuck. 
    # BUT, we can use the 'postgres' library if we had the connection string, which we often don't in Supabase projects unless we parse it.
    
    # Let's try to assume the user might have an `exec_sql` function.
    # If not, we will fail.
    
    try:
        response = supabase.rpc('exec_sql', {'query': sql_content}).execute()
        print(f"RPC Execution Result: {response.data}")
    except Exception as e:
        print(f"RPC Execution Failed: {e}")
        print("Falling back to instructions...")
        return False
    return True

def main():
    files = [
        "backend/db/update_apiaries_schema.sql",
        "backend/db/create_inspections_table.sql",
        "backend/db/seed_kibwezi_full_traceability.sql" 
    ]
    
    print("Attempting to run SQL migrations...")
    print("NOTE: This script attempts to use a hypothetical 'exec_sql' RPC function.")
    print("If this fails, please run the SQL files manually in Supabase Dashboard SQL Editor.")
    
    for f in files:
        if os.path.exists(f):
            print(f"\nProcessing {f}...")
            with open(f, 'r') as file:
                sql = file.read()
                # Try RPC
                success = run_sql_via_rpc(sql)
                if not success:
                    print(f"Could not execute {f} automatically.")
        else:
            print(f"File not found: {f}")

if __name__ == "__main__":
    main()
