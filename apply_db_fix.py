
import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Add backend to path to import config
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "backend")))

load_dotenv(dotenv_path="backend/.env")

url = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

if not url or not key:
    print("Error: Supabase credentials not found in backend/.env")
    sys.exit(1)

supabase: Client = create_client(url, key)

def run_fix():
    print("Applying Permanent Database Fix (SQL)...")
    sql_file = "FIX_SUPABASE_PERMANENTLY.sql"
    if not os.path.exists(sql_file):
        print(f"Error: {sql_file} not found.")
        return

    with open(sql_file, "r") as f:
        sql = f.read()

    # Supabase Python client doesn't have a direct 'execute_sql' method for raw SQL.
    # Usually you use the SQL Editor in the dashboard.
    # However, some setups might have a RPC function for this, but it's unlikely here.
    
    print("Manual step required: Please copy the content of 'FIX_SUPABASE_PERMANENTLY.sql' and run it in the Supabase SQL Editor.")
    print("The file has been created for you in the project root.")

if __name__ == "__main__":
    run_fix()
