
import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL") # Frontend uses VITE_ prefix, backend usually SUPABASE_URL. Let's try both or fallback.
if not SUPABASE_URL:
    SUPABASE_URL = os.getenv("SUPABASE_URL")

SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") # Must use service role key for migrations

if not SUPABASE_URL or not SUPABASE_KEY:
    print("X Error: Supabase credentials not found in .env")
    print(f"URL: {SUPABASE_URL}, KEY: {'***' if SUPABASE_KEY else 'None'}")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
print(f"Connected to Supabase: {SUPABASE_URL}")

def run_sql_file(file_path):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return False
    
    with open(file_path, 'r') as f:
        sql = f.read()
            
    print(f"Executing SQL from {file_path}...")
    try:
        # Calls a custom RPC function 'exec_sql' if it exists
        # Alternatively, use the REST API to post to /rpc/exec_sql if configured
        response = supabase.rpc('exec_sql', {'query': sql}).execute()
        print("Success!")
        print(response)
        return True
    except Exception as e:
        print(f"Failed to execute SQL: {e}")
        # If exec_sql RPC doesn't exist, we might need a direct connection or another method.
        # But based on migrate_db.py, exec_sql seems to be the way.
        return False

if __name__ == "__main__":
    migration_file = os.path.join(os.path.dirname(__file__), "../supabase/migrations/20260208133000_create_notes_tables.sql")
    run_sql_file(migration_file)
