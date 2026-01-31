import os
import sys
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

try:
    res = supabase.table("apiaries").select("*").limit(1).execute()
    if res.data:
        print(f"Columns in apiaries: {list(res.data[0].keys())}")
    else:
        # Try to get column info via another way or just print tables
        print("No data in apiaries.")
except Exception as e:
    print(f"Error: {e}")
