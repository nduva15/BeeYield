import os
import sys
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

try:
    res = supabase.table("honey_batches").select("batch_code, farmer_name, location_region").execute()
    print(f"Total honey_batches in Supabase: {len(res.data)}")
    for row in res.data[:5]:
        print(row)
except Exception as e:
    print(f"Error: {e}")
