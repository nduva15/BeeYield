
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

def check_data():
    print("--- AUTH USERS ---")
    try:
        # Service role can see auth.users table in some setups via RPC or if using admin client
        # But usually we check the public.farmers or similar to see what user_ids are being used
        response = supabase.table("apiaries").select("user_id").execute()
        user_ids = set(a.get('user_id') for a in response.data if a.get('user_id'))
        print(f"User IDs found in apiaries: {user_ids}")
    except Exception as e:
        print(f"Error checking user_ids: {e}")

    print("\n--- APIARIES ---")
    try:
        response = supabase.table("apiaries").select("*").execute()
        for a in response.data:
            print(f"APIARY: {a.get('name')} | USER: {a.get('user_id')}")
    except Exception as e:
        print(f"Error checking apiaries: {e}")

if __name__ == "__main__":
    check_data()
