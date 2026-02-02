import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

try:
    print("Fetching profiles...")
    # Trying different table names common in Supabase setups
    tables = ["profiles", "user_profiles"]
    found = False
    for t in tables:
        try:
            res = supabase.table(t).select("*").execute()
            if res.data:
                print(f"--- Users in '{t}' ---")
                for u in res.data:
                    print(f"ID: {u.get('id')} | Email: {u.get('email')}")
                found = True
        except Exception as e:
            print(f"Table '{t}' error: {e}")
            
    if not found:
        print("No users found in standard profile tables.")
        
except Exception as e:
    print(f"Error: {e}")
