
import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "backend")))
load_dotenv(dotenv_path="backend/.env")

url = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

def final_cleanup():
    target_user_id = "10c9b5b3-f9c4-47cf-bc6b-c7d6e8e4bce6" # Timothy Nduva
    
    # 1. Find all apiaries
    res = supabase.table("apiaries").select("*").execute()
    all_apiaries = res.data
    
    print(f"Total apiaries found: {len(all_apiaries)}")
    
    for a in all_apiaries:
        aid = a['id']
        name = a['name']
        uid = a.get('user_id')
        
        should_delete = False
        
        # Rule 1: Delete anything with "Markempai"
        if "Markempai" in name or "markempai" in name.lower():
            print(f"Reason: Found 'Markempai' in name '{name}'")
            should_delete = True
            
        # Rule 2: If it's Timothy's, and NOT "Kibwezi Main Apiary", delete it
        elif uid == target_user_id and "Kibwezi Main Apiary" not in name:
            print(f"Reason: Timothy's extra apiary '{name}'")
            should_delete = True
            
        # Rule 3: If it's NOT Timothy's, and the user said "ONLY HAVE KIBWEZI MAIN APIARY", maybe delete it too?
        # User said: "DELETE MARKEMPAI AND ANY OTHER APIARY AND ONLY HAVE KIBWEZI MAIN APIARY"
        elif "Kibwezi Main Apiary" not in name:
             print(f"Reason: Not the main apiary '{name}'")
             should_delete = True

        if should_delete:
            print(f"DELETING Apiary: {name} ({aid})")
            # Cascade manual
            supabase.table("harvests").delete().eq("apiary_id", aid).execute()
            supabase.table("hives").delete().eq("apiary_id", aid).execute()
            supabase.table("tasks").delete().eq("apiary_id", aid).execute()
            supabase.table("notes").delete().eq("apiary_id", aid).execute()
            supabase.table("apiaries").delete().eq("id", aid).execute()
            print(f"Deleted {name}")

    # 2. Ensure Timothy has Kibwezi Main Apiary
    res = supabase.table("apiaries").select("*").eq("user_id", target_user_id).ilike("name", "%Kibwezi Main Apiary%").execute()
    if not res.data:
        print("Kibwezi Main Apiary missing for Timothy! Something is wrong.")
    else:
        kib_id = res.data[0]['id']
        print(f"Confirmed Kibwezi Main Apiary (ID: {kib_id}) exists for Timothy.")
        
        # 3. Check hive count for this apiary
        hives_res = supabase.table("hives").select("id").eq("apiary_id", kib_id).execute()
        count = len(hives_res.data)
        print(f"Apiary {kib_id} has {count} hives.")
        
        if count != 184:
            print(f"Hive count mismatch! Expected 184, got {count}. Re-seeding might be needed.")

if __name__ == "__main__":
    final_cleanup()
