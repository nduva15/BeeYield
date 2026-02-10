
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

def apply_migration():
    migration_path = "BEE_YIELD_HIVES_BACKEND.sql"
    if not os.path.exists(migration_path):
        print(f"Error: {migration_path} not found.")
        return

    print(f"Reading {migration_path}...")
    with open(migration_path, 'r', encoding='utf-8') as f:
        sql = f.read()

    print("Applying migration to Supabase...")
    try:
        # Supabase Python client doesn't have a direct 'execute_raw_sql' method for public use easily
        # but we can use the rpc 'db_execute' if it's broad enough, 
        # however, usually for migrations we use the REST API or CLI.
        # Since we can't easily run raw SQL via the client without a custom RPC, 
        # I will use a different approach: I'll inform the user how to do it in the SQL editor 
        # or try to use 'npx supabase db execute' if I can get it to work without login.
        
        # Actually, the most reliable way for me as an agent to 'DO' it is to use the CLI if I can link it.
        print("Note: Automated SQL execution via Python client is limited. Please run SQL in the Dashboard.")
        print("Wait, I will try to use the CLI with the project ref.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    apply_migration()
