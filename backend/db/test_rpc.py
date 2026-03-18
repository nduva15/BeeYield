import os
from dotenv import load_dotenv
from supabase import create_client

def test_rpc_script():
    load_dotenv()
    url = os.getenv('VITE_SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not url or not key:
        print("Skipping: VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.")
        return

    s = create_client(url, key)
    try:
        print("Testing RPC exec_sql...")
        res = getattr(s, 'rpc')('exec_sql', {'query': 'SELECT 1'}).execute()
        print(f"Success! Result: {res.data}")
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    test_rpc_script()
