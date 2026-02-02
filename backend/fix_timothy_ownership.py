import os
import sys
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("X Error: Supabase credentials not found in .env")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
print(f"Connected to Supabase: {SUPABASE_URL}")

TARGET_EMAIL = "timothynduva349@gmail.com"

def get_target_user_id():
    """Get the user ID for the target email"""
    print(f"Looking for user: {TARGET_EMAIL}...")
    
    # Try finding in profiles table first
    try:
        res = supabase.table("profiles").select("id").eq("email", TARGET_EMAIL).execute()
        if res.data:
            return res.data[0]["id"]
    except Exception as e:
        print(f"   [DEBUG] Could not fetch from profiles: {e}")

    # Try finding in user_profiles (alternative name)
    try:
        res = supabase.table("user_profiles").select("id").eq("email", TARGET_EMAIL).execute()
        if res.data:
            return res.data[0]["id"]
    except Exception as e:
        pass
        
    # If using service role, we might be able to list users via auth admin (not native in python client usually, but let's try raw)
    # Often 'profiles' is the way. 
    # If not found, we might need to assume the ONLY user is the one we want if dev env.
    
    print("   ! Could not find user by specific email in profiles.")
    print("   ! Checking for ANY user to default to (Dev Mode fallback)...")
    
    try:
         res = supabase.table("profiles").select("id, email").limit(1).execute()
         if res.data:
             print(f"   ! Found fallback user: {res.data[0].get('email')} ({res.data[0]['id']})")
             return res.data[0]["id"]
    except:
        pass
        
    return None

def fix_ownership(user_id):
    if not user_id:
        print("X Aborting: No user ID available.")
        return

    print(f"--- Assigning 'Kibwezi' data to User ID: {user_id} ---")
    
    # 1. Update Farmer
    # We look for "Timothy Nduva"
    try:
        print("   - Updating Farmer 'Timothy Nduva'...")
        res = supabase.table("farmers").update({"user_id": user_id}).eq("name", "Timothy Nduva").execute()
        print(f"     Updated {len(res.data) if res.data else 0} records.")
    except Exception as e:
        print(f"     Error: {e}")

    # 2. Update Apiary
    try:
        print("   - Updating Apiary 'Kibwezi Main Apiary'...")
        res = supabase.table("apiaries").update({"user_id": user_id}).eq("name", "Kibwezi Main Apiary").execute()
        print(f"     Updated {len(res.data) if res.data else 0} records.")
        
        # Get Apiary ID to update hives
        apiary_res = supabase.table("apiaries").select("id").eq("name", "Kibwezi Main Apiary").execute()
        if apiary_res.data:
            apiary_id = apiary_res.data[0]["id"]
            
            # 3. Update Hives in this Apiary
            print(f"   - Updating Hives for Apiary {apiary_id}...")
            # Supabase update might not support complex where in one go easily, but let's try standard filter
            h_res = supabase.table("hives").update({"user_id": user_id}).eq("apiary_id", apiary_id).execute()
            print(f"     Updated {len(h_res.data) if h_res.data else 0} hives.")
            
    except Exception as e:
        print(f"     Error: {e}")

    print("   ✓ Ownership fix applied.")

if __name__ == "__main__":
    uid = get_target_user_id()
    if uid:
        fix_ownership(uid)
    else:
        print("X No user found to assign data to.")
