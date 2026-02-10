
import os
import sys
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("X Error: Supabase credentials not found in .env")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
print(f"Connected to Supabase: {SUPABASE_URL}")

def run_migration():
    # Path to the migration file
    migration_file = os.path.join("supabase", "migrations", "20260208190000_settings_module.sql")
    
    if not os.path.exists(migration_file):
        # Try absolute path if relative fails
        migration_file = r"c:\Users\aggym\Downloads\Honey\supabase\migrations\20260208190000_settings_module.sql"
    
    if not os.path.exists(migration_file):
        print(f"File not found: {migration_file}")
        sys.exit(1)
    
    with open(migration_file, 'r') as f:
        sql_content = f.read()
    
    print(f"Executing {migration_file}...")
    try:
        # Attempt to use exec_sql RPC
        response = supabase.rpc('exec_sql', {'query': sql_content}).execute()
        print(f"Success! Result: {response.data}")
    except Exception as e:
        print(f"Execution Failed: {e}")
        # fallback: try to run statement by statement if it's a big block (simple parser)
        # But exec_sql usually handles blocks.
        sys.exit(1)

if __name__ == "__main__":
    run_migration()
