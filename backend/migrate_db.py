
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

def run_sql(sql_file):
    if not os.path.exists(sql_file):
        print(f"File not found: {sql_file}")
        return False
    
    with open(sql_file, 'r') as f:
        sql_content = f.read()
    
    print(f"Executing {sql_file}...")
    try:
        # Attempt to use exec_sql RPC
        response = supabase.rpc('exec_sql', {'query': sql_content}).execute()
        print(f"Success! Result: {response.data}")
        return True
    except Exception as e:
        print(f"Execution Failed: {e}")
        return False

if __name__ == "__main__":
    run_sql("db/migrate_user_specific_data.sql")
