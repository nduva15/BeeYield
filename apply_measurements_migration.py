import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv(dotenv_path="backend/.env")

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in backend/.env")
    exit(1)

supabase: Client = create_client(url, key)

def apply_migration(file_path):
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found.")
        return

    print(f"Reading {file_path}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        sql = f.read()

    print(f"Applying {file_path} to Supabase via RPC...")
    try:
        # Split SQL into blocks if needed, but exec_sql usually handles multi-statement if they are not too complex
        # However, it's safer to run it.
        # Note: 'exec_sql' expects a 'query' parameter
        response = supabase.rpc("exec_sql", {"query": sql}).execute()
        print("Migration applied successfully!")
        print(response)
    except Exception as e:
        with open("migration_error.txt", "w") as f:
            f.write(str(e))
        print(f"Error applying migration. Check migration_error.txt")

if __name__ == "__main__":
    apply_migration("supabase/migrations/20260208223000_measurement_data_module.sql")
