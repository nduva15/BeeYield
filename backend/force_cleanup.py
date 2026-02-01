import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.supabase_db import get_supabase_admin

def force_cleanup():
    print("=" * 60)
    print("FORCE CLEANUP: 1 Apiary, 184 Hives")
    print("=" * 60)
    
    supabase = get_supabase_admin()
    
    # 1. Get all apiaries and find the main one
    apiaries = supabase.table("apiaries").select("*").execute().data
    print(f"\nFound {len(apiaries)} apiaries")
    
    # Find or pick the main apiary (prefer one with "Main" in name)
    main_apiary = None
    for a in apiaries:
        if 'Main' in a.get('name', ''):
            main_apiary = a
            break
    if not main_apiary and apiaries:
        main_apiary = apiaries[0]
    
    if not main_apiary:
        print("No apiary found!")
        return
    
    main_id = main_apiary['id']
    print(f"Keeping: {main_apiary['name']} (ID: {main_id})")
    
    # 2. Delete apiaries that are NOT the main one
    for a in apiaries:
        if a['id'] != main_id:
            apiary_id = a['id']
            print(f"\nDeleting apiary: {a['name']}")
            
            # Delete related data in order (handle FK constraints)
            try:
                print("  - Deleting tasks...")
                supabase.table("tasks").delete().eq("apiary_id", apiary_id).execute()
            except Exception as e:
                print(f"    (tasks: {e})")
            
            try:
                print("  - Deleting inspections...")
                supabase.table("inspections").delete().eq("apiary_id", apiary_id).execute()
            except Exception as e:
                print(f"    (inspections: {e})")
            
            try:
                print("  - Deleting harvests...")
                # Harvests might be linked to hives, get hive IDs first
                hives = supabase.table("hives").select("id").eq("apiary_id", apiary_id).execute().data
                for h in hives:
                    supabase.table("harvests").delete().eq("hive_id", h['id']).execute()
            except Exception as e:
                print(f"    (harvests: {e})")
            
            try:
                print("  - Deleting hives...")
                supabase.table("hives").delete().eq("apiary_id", apiary_id).execute()
            except Exception as e:
                print(f"    (hives: {e})")
            
            try:
                print("  - Deleting apiary...")
                supabase.table("apiaries").delete().eq("id", apiary_id).execute()
                print("  Done!")
            except Exception as e:
                print(f"    (apiary delete failed: {e})")
    
    # 3. Get all hives for main apiary
    hives = supabase.table("hives").select("id").eq("apiary_id", main_id).execute().data
    print(f"\nCurrent hives in main apiary: {len(hives)}")
    
    # 4. Delete excess hives (keep only 184)
    if len(hives) > 184:
        excess = len(hives) - 184
        print(f"Deleting {excess} excess hives...")
        hives_to_delete = hives[184:]
        deleted = 0
        for h in hives_to_delete:
            try:
                # Delete harvests linked to this hive first
                supabase.table("harvests").delete().eq("hive_id", h['id']).execute()
                supabase.table("hives").delete().eq("id", h['id']).execute()
                deleted += 1
            except Exception as e:
                print(f"  Error deleting hive: {e}")
        print(f"Deleted {deleted} hives")
    
    # 5. Update apiary name and hive_count
    supabase.table("apiaries").update({
        "name": "Kibwezi Main Apiary",
        "hive_count": 184
    }).eq("id", main_id).execute()
    print("\nUpdated apiary to 'Kibwezi Main Apiary' with hive_count=184")
    
    # 6. Final count
    final_hives = supabase.table("hives").select("id").eq("apiary_id", main_id).execute().data
    final_apiaries = supabase.table("apiaries").select("*").execute().data
    
    print("\n" + "=" * 60)
    print("FINAL RESULT")
    print("=" * 60)
    print(f"Total Apiaries: {len(final_apiaries)}")
    print(f"Total Hives: {len(final_hives)}")
    for a in final_apiaries:
        print(f"  {a['name']}: hive_count={a.get('hive_count')}")
    print("=" * 60)

if __name__ == "__main__":
    force_cleanup()
