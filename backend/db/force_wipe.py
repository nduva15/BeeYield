import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def run_sql(sql_file):
    with open(sql_file, 'r') as f:
        sql = f.read()
    
    # Supabase python client doesn't have a direct 'run sql' method easily accessible 
    # unless using an RPC. But we can use the 'postgres' endpoint if we have the right permissions.
    # However, for simplicity, I'll use the 'delete' method on each table programmatically.
    
    tables = [
        "inspections", "tasks", "processing_records", "harvests", 
        "packaged_batches", "honey_batches", "batches", 
        "tracing_history", "activity_logs", "generated_documents",
        "hives", "apiaries", "farmers"
    ]
    
    print("--- Clearing Tables ---")
    for table in tables:
        try:
            print(f"  Clearing {table}...")
            # We use a very broad filter to delete everything
            res = supabase.table(table).delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
            print(f"  ✓ Cleared {table}")
        except Exception as e:
            print(f"  X Error clearing {table}: {e}")

if __name__ == "__main__":
    run_sql("backend/db/wipe_data.sql")
