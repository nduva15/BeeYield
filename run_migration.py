
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

env_path = Path("backend/.env")
load_dotenv(dotenv_path=env_path)

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in backend/.env")
    exit(1)

supabase: Client = create_client(url, key)

def run_migration(sql_file_path):
    p = Path(sql_file_path)
    if not p.exists():
        print(f"Error: {p} not found")
        return

    print(f"Reading {p}...")
    sql_content = p.read_text(encoding="utf-8")
    
    print(f"Executing migration {p.name} via exec_sql RPC...")
    try:
        supabase.rpc("exec_sql", {"query": sql_content}).execute()
        print("Migration executed successfully!")
    except Exception as e:
        print(f"Error executing migration: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python run_migration.py <path_to_sql_file>")
        # Default to the one I just created if no arg
        default_mig = "supabase/migrations/20260209140000_add_hive_thresholds.sql"
        print(f"No file specified, running default: {default_mig}")
        run_migration(default_mig)
    else:
        run_migration(sys.argv[1])
