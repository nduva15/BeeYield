
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Supabase credentials missing.")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def fix_links():
    print("Checking for unlinked harvests...")
    
    # 1. Get all harvests missing hive_id
    res = supabase.table("harvests").select("id").is_("hive_id", "null").execute()
    unlinked = res.data
    
    if not unlinked:
        print("✅ All harvests are already linked to hives.")
        return

    print(f"Found {len(unlinked)} unlinked harvests.")
    
    # 2. Get a default hive (first one)
    res_hive = supabase.table("hives").select("id, hive_code").limit(1).execute()
    if not res_hive.data:
        print("❌ No hives found in database to link to.")
        return
        
    default_hive_id = res_hive.data[0]["id"]
    default_hive_code = res_hive.data[0]["hive_code"]
    
    print(f"Linking to default hive: {default_hive_code} ({default_hive_id})")
    
    # 3. Update them
    for h in unlinked:
        supabase.table("harvests").update({"hive_id": default_hive_id}).eq("id", h["id"]).execute()
        
    print(f"✅ Successfully linked {len(unlinked)} harvests.")

if __name__ == "__main__":
    fix_links()
