import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv(dotenv_path="backend/.env")

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(url, key)

def list_tables():
    sql = """
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
    """
    try:
        # Note: exec_sql returns void, so we might not get the list back directly
        # Unless the exec_sql is defined differently.
        # Let's check the definition of exec_sql if possible.
        res = supabase.rpc("exec_sql", {"query": sql}).execute()
        print("Response from RPC:", res.data)
        
        # If exec_sql returns results (SET RECORD or JSON), we'll see them.
        # If it returns void, we won't.
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_tables()
