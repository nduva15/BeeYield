import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
url = os.getenv("VITE_SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

print("--- Checking Auth User Metadata ---")
try:
    users = supabase.auth.admin.list_users()
    for user in users:
        print(f"Email: {user.email}")
        print(f"Metadata: {user.user_metadata}")
        print("-" * 20)
except Exception as e:
    print(f"Error: {e}")
