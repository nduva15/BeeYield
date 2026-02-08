import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
url = os.getenv("VITE_SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

print("--- User Profiles ---")
try:
    up = supabase.table("user_profiles").select("*").execute()
    print(f"Total User Profiles: {len(up.data)}")
    for p in up.data:
        print(f"- {p.get('email')} ({p.get('id')})")
except Exception as e:
    print(f"Error user_profiles: {e}")

print("\n--- Auth Users (via Service Role) ---")
# Note: This might not work via standard client if it doesn't have auth admin access
try:
    # We can try to count auth table if possible or just assume from profiles
    pass 
except:
    pass
