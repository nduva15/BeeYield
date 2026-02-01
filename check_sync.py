
import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Add backend to path to import config
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "backend")))

load_dotenv(dotenv_path="backend/.env")

url = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

if not url or not key:
    print("Error: Supabase credentials not found in backend/.env")
    sys.exit(1)

supabase: Client = create_client(url, key)

def check_sync():
    print("Listing all users:")
    users = supabase.auth.admin.list_users()
    for u in users:
        print(f"USER ID: {u.id} | EMAIL: {u.email}")

    print("\nListing all apiaries:")
    res = supabase.table("apiaries").select("*").execute()
    for a in res.data:
        print(f"APIARY: {a.get('name')} | USER_ID: {a.get('user_id')}")

if __name__ == "__main__":
    check_sync()
