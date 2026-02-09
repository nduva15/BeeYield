
import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "backend")))
load_dotenv(dotenv_path="backend/.env")

url = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

def check_harvests():
    with open("harvests_report.txt", "w") as f:
        try:
            res = supabase.table("harvests").select("*").limit(10).execute()
            harvests = res.data
            f.write(f"Sample Harvests: {len(harvests)}\n")
            for h in harvests:
                f.write(f"ID: {h.get('id')} | APIARY_ID: {h.get('apiary_id')} | QUANTITY: {h.get('quantity_kg')}\n")
        except Exception as e:
            f.write(f"Error harvests: {e}\n")

if __name__ == "__main__":
    check_harvests()
