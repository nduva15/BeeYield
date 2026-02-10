import os
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
    """
    response = supabase.rpc("exec_sql", {"query": sql}).execute()
    # Wait, exec_sql returns void. I need a function that returns data.
    # Actually, I can use a different approach.
    pass

def check_table(table_name):
    sql = f"SELECT column_name FROM information_schema.columns WHERE table_name = '{table_name}'"
    # Again, exec_sql returns void.
    pass

# I'll use a hack to get results if I have to, but maybe I can just try to DROP if exists?
# Better: use a query that I know works.

if __name__ == "__main__":
    # Let's try to just select from it and see if it fails.
    try:
        # Get one row to see columns
        res = supabase.table("sensor_readings").select("*").limit(1).execute()
        print("sensor_readings exists")
        if res.data:
            print(f"Columns: {res.data[0].keys()}")
        else:
            # If empty, we can try to get column names from information_schema if we had a function for it
            # or just assume it's empty and we don't know the columns yet.
            # Let's try to insert a dummy row or just use the API to describe if possible.
            print("Table is empty, can't infer columns from select *")
    except Exception as e:
        print(f"sensor_readings error: {e}")
