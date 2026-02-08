import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
url = os.getenv("VITE_SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

print("--- Listing Auth Users ---")
try:
    users = supabase.auth.admin.list_users()
    for user in users:
        print(f"- {user.email} (ID: {user.id})")
except Exception as e:
    print(f"Error listing users: {e}")
