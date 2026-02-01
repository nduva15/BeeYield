import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
s=create_client(os.getenv('VITE_SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_ROLE_KEY'))

try:
    print("Testing RPC exec_sql...")
    res = s.rpc('exec_sql', {'query': 'SELECT 1'}).execute()
    print(f"Success! Result: {res.data}")
except Exception as e:
    print(f"Failed: {e}")
