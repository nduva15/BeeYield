
import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Add backend to path to import db utils if needed, or just use raw supabase
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "backend")))
load_dotenv(dotenv_path="backend/.env")

url = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

if not url or not key:
    print("Error: Supabase credentials not found in env.")
    sys.exit(1)

supabase: Client = create_client(url, key)

def debug_timothy():
    report = []
    report.append("=== TIMOTHY NDUVA DATA DEBUG REPORT ===")
    
    # 1. Check User
    email = 'timothynduva349@gmail.com'
    res = supabase.table("auth.users").select("*").eq("email", email).execute()
    # auth.users is usually not accessible via public API client unless service role.
    # We are using service role key hopefully.
    
    # Actually, direct access to auth.users via postgrest might be blocked. 
    # But we can check public.profiles or try to find user ID via logic.
    # Let's search public.profiles first as it's often a copy.
    
    res_prof = supabase.table("profiles").select("*").execute()
    users = res_prof.data
    
    timothy_user = None
    for u in users:
        # Check if we can identify Timothy. 
        # Often profiles don't have email. 
        # Let's check apiaries for this user.
        pass

    # Alternative: check farmers table for name 'Timothy'
    res_farmer = supabase.table("farmers").select("*").ilike("name", "%Timothy%").execute()
    farmers = res_farmer.data
    report.append(f"\nFarmers matching 'Timothy': {len(farmers)}")
    for f in farmers:
        report.append(f"  Farmer: {f['name']} (ID: {f['id']}, User ID: {f.get('user_id')})")
        
    # Let's try to infer from the existing harvest data I saw earlier
    # ID: f042baec-8334-48ec-85f2-ba75f86d576a is an APIARY ID from the report.
    target_apiary_id = "f042baec-8334-48ec-85f2-ba75f86d576a"
    report.append(f"\nChecking Apiary {target_apiary_id} found in harvests report:")
    res_ap = supabase.table("apiaries").select("*").eq("id", target_apiary_id).execute()
    if res_ap.data:
        ap = res_ap.data[0]
        report.append(f"  Name: {ap.get('name')}")
        report.append(f"  User ID: {ap.get('user_id')}")
        timothy_user_id = ap.get('user_id')
        
        # Now check this user's stats
        if timothy_user_id:
            # APIARIES
            res_aps = supabase.table("apiaries").select("*").eq("user_id", timothy_user_id).execute()
            report.append(f"\nUser {timothy_user_id} Apiaries: {len(res_aps.data)}")
            for a in res_aps.data:
                 report.append(f"  - {a['name']} (ID: {a['id']})")
            
            # HIVES
            res_hives = supabase.table("hives").select("*").eq("user_id", timothy_user_id).execute()
            report.append(f"\nUser {timothy_user_id} Hives: {len(res_hives.data)}")
            
            # HARVESTS
            res_harv = supabase.table("harvests").select("*").eq("user_id", timothy_user_id).execute()
            report.append(f"\nUser {timothy_user_id} Harvests: {len(res_harv.data)}")
            
            # Check harvest years
            years = {}
            for h in res_harv.data:
                d = h.get('harvest_date') or h.get('date')
                if d:
                    y = d.split('-')[0]
                    years[y] = years.get(y, 0) + 1
            report.append(f"  Harvests per year: {years}")
            
    else:
         report.append("  Apiary not found.")

    # Write report
    with open("timothy_debug_report.txt", "w") as f:
        f.write("\n".join(report))
    print("Debug report written to timothy_debug_report.txt")

if __name__ == "__main__":
    debug_timothy()
