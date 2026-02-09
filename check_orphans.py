
import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "backend")))
load_dotenv(dotenv_path="backend/.env")

url = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

def check_orphans():
    with open("orphans_report.txt", "w") as f:
        try:
            res = supabase.table("hives").select("id, apiary_id").execute()
            hives = res.data
            orphans = [h for h in hives if not h.get('apiary_id')]
            f.write(f"Total Hives: {len(hives)}\n")
            f.write(f"Orphan Hives: {len(orphans)}\n")
            
            apiary_ids = set([h.get('apiary_id') for h in hives if h.get('apiary_id')])
            f.write(f"Unique Apiary IDs in Hives: {apiary_ids}\n")
            
            res = supabase.table("apiaries").select("id, name").execute()
            apiaries = {a['id']: a['name'] for a in res.data}
            f.write(f"Current Apiaries in DB: {apiaries}\n")
            
            # Check for any Markempai in any field of apiaries
            res = supabase.table("apiaries").select("*").execute()
            for a in res.data:
                if "Markempai" in str(a) or "markempai" in str(a).lower():
                    f.write(f"FOUND Markempai in apiary record: {a}\n")
                    
        except Exception as e:
            f.write(f"Error: {e}\n")

if __name__ == "__main__":
    check_orphans()
