
import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Adjust path to find .env in backend/
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend", ".env")
load_dotenv(dotenv_path=env_path)

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in backend/.env")
    # Try creating a dummy client if just testing, but for migration we need real credentials
    sys.exit(1)

try:
    supabase: Client = create_client(url, key)
except Exception as e:
    print(f"Failed to initialize Supabase client: {e}")
    sys.exit(1)

def apply_migration():
    migration_file = "supabase/migrations/20260208240000_image_analysis_module.sql"
    # Adjust path relative to script location in scripts/ -> root/supabase/...
    file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), migration_file)
    
    if not os.path.exists(file_path):
        print(f"Error: Migration file not found at {file_path}")
        return

    print(f"Reading migration file: {file_path}")
    with open(file_path, 'r', encoding='utf-8') as f:
        sql_content = f.read()

    print("Attempting to execute migration via 'exec_sql' RPC...")
    
    try:
        # call exec_sql(sql_query)
        response = supabase.rpc('exec_sql', {'sql_query': sql_content}).execute()
        print("Migration executed successfully via RPC.")
        print("Response:", response)
    except Exception as e:
        print(f"RPC Execution failed: {e}")
        print("\nFallback: Please execute the SQL manually in the Supabase Dashboard SQL Editor.")
        print(f"File location: {os.path.abspath(file_path)}")

if __name__ == "__main__":
    apply_migration()
