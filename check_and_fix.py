
import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "backend")))
load_dotenv(dotenv_path="backend/.env")

url = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

def check_and_fix():
    with open("cleanup_report.txt", "w") as f:
        f.write("--- SYSTEM CHECK ---\n")
        
        # 1. Get all apiaries
        try:
            res = supabase.table("apiaries").select("*").execute()
            apiaries = res.data
            f.write(f"Total Apiaries: {len(apiaries)}\n")
            for a in apiaries:
                f.write(f"APIARY: {a.get('name')} | ID: {a.get('id')} | USER: {a.get('user_id')}\n")
        except Exception as e:
            f.write(f"Error apiaries: {e}\n")

        # 2. Get hive count per apiary
        try:
            res = supabase.table("hives").select("apiary_id, id").execute()
            hives = res.data
            f.write(f"Total Hives: {len(hives)}\n")
            counts = {}
            for h in hives:
                aid = h.get('apiary_id')
                counts[aid] = counts.get(aid, 0) + 1
            for aid, count in counts.items():
                f.write(f"Apiary ID {aid} has {count} hives\n")
        except Exception as e:
            f.write(f"Error hives: {e}\n")

if __name__ == "__main__":
    check_and_fix()
