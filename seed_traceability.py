
import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

# Load env from backend/.env
env_path = Path("backend/.env")
load_dotenv(dotenv_path=env_path)

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in backend/.env")
    exit(1)

supabase: Client = create_client(url, key)

def run_seed():
    seed_file = Path("supabase/HONEYCHAIN_TRACEABILITY_SEED.sql")
    if not seed_file.exists():
        print(f"Error: {seed_file} not found")
        return

    print(f"Reading {seed_file}...")
    sql_content = seed_file.read_text(encoding="utf-8")
    
    print("Executing seed via exec_sql RPC...")
    try:
        supabase.rpc("exec_sql", {"query": sql_content}).execute()
        print("Seed executed successfully!")
    except Exception as e:
        print(f"Error executing seed: {e}")

if __name__ == "__main__":
    run_seed()
