import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.supabase_db import get_supabase_admin

def trim_hives():
    print("=" * 60)
    print("TRIM HIVES: Reducing to 184")
    print("=" * 60)
    
    supabase = get_supabase_admin()
    
    # 1. Get Apiary
    apiaries = supabase.table("apiaries").select("*").execute().data
    if not apiaries:
        print("No apiaries found!")
        return
    
    apiary = apiaries[0]
    apiary_id = apiary['id']
    print(f"Target Apiary: {apiary['name']} (ID: {apiary_id})")
    
    # 2. Get Hives
    hives = supabase.table("hives").select("id, hive_code").eq("apiary_id", apiary_id).order("created_at", desc=True).execute().data
    print(f"Total Hives Found: {len(hives)}")
    
    if len(hives) <= 184:
        print("Hive count is already 184 or less. No trimming needed.")
        return

    # 3. Identify excess
    target_count = 184
    excess_count = len(hives) - target_count
    hives_to_delete = hives[:excess_count] # Delete the newest ones (assuming they are the duplicates/extras added last)
    
    print(f"Preparing to delete {len(hives_to_delete)} hives...")
    
    deleted_count = 0
    errors = 0
    
    for h in hives_to_delete:
        h_id = h['id']
        try:
            # Delete dependencies
            supabase.table("harvests").delete().eq("hive_id", h_id).execute()
            # Deleting inspections if they link to hive_id (some schemas do, some don't, check schema later if fails)
            # Assuming inspections might be apiary-level mostly, but checking hive linkage safely
            try:
                supabase.table("inspections").delete().eq("hive_id", h_id).execute() 
            except:
                pass # column might not exist
            
            # Finally delete hive
            supabase.table("hives").delete().eq("id", h_id).execute()
            deleted_count += 1
            if deleted_count % 10 == 0:
                print(f"  Deleted {deleted_count}...")
        except Exception as e:
            print(f"  Failed to delete hive {h.get('hive_code', h_id)}: {e}")
            errors += 1

    print(f"\nCompleted.")
    print(f"Deleted: {deleted_count}")
    print(f"Errors: {errors}")
    
    # Verify
    final_count = len(supabase.table("hives").select("id").eq("apiary_id", apiary_id).execute().data)
    print(f"Final Hive Count: {final_count}")

if __name__ == "__main__":
    trim_hives()
