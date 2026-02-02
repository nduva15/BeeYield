import os
import sys
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("X Error: Supabase credentials not found")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
print(f"Connected to Supabase: {SUPABASE_URL}")

def reset_kibwezi():
    print("--- Resetting 'Kibwezi' Ownership to NULL ---")
    try:
        # 1. Update Apiary
        print("   - Un-assigning Apiary...")
        # Check if it exists first
        res = supabase.table("apiaries").select("id").eq("name", "Kibwezi Main Apiary").execute()
        if not res.data:
            print("   ! Apiary 'Kibwezi Main Apiary' not found. Creating it...")
            # If not found, we shouldn't create it empty, but the setup_timothy script exists.
            # Let's run setup_timothy_data BUT with None user_id ??
            # Or just warn users.
        else:
            apiary_id = res.data[0]["id"]
            # Set user_id to None/Null
            supabase.table("apiaries").update({"user_id": None}).eq("id", apiary_id).execute()
            print("     ✓ Apiary ownership cleared.")
            
            # 2. Update Hives
            print("   - Un-assigning Hives...")
            supabase.table("hives").update({"user_id": None}).eq("apiary_id", apiary_id).execute()
            print("     ✓ Hives un-assigned.")
            
            # 3. Update Farmer
            print("   - Un-assigning Farmer...")
            supabase.table("farmers").update({"user_id": None}).eq("name", "Timothy Nduva").execute()
            
        print("   ✓ Done. Next time you visit 'My Places', the system should auto-claim these for you.")
        
    except Exception as e:
        print(f"   X Error: {e}")

if __name__ == "__main__":
    reset_kibwezi()
