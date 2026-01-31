import os
import sys
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

try:
    # Get a single row to see columns
    res = supabase.table("farmers").select("*").limit(1).execute()
    if res.data:
        print(f"Columns in farmers: {list(res.data[0].keys())}")
    else:
        print("No data in farmers table.")
except Exception as e:
    print(f"Error: {e}")
