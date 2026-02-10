
import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "backend")))
load_dotenv(dotenv_path="backend/.env")

url = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

def list_all_details():
    with open("full_system_report.txt", "w") as f:
        f.write("--- APIARIES ---\n")
        res = supabase.table("apiaries").select("*").execute()
        for a in res.data:
            f.write(f"{a}\n")
            
        f.write("\n--- HIVES (First 5) ---\n")
        res = supabase.table("hives").select("*").limit(5).execute()
        for h in res.data:
            f.write(f"{h}\n")
            
        f.write("\n--- HARVESTS (First 5) ---\n")
        res = supabase.table("harvests").select("*").limit(5).execute()
        for h in res.data:
            f.write(f"{h}\n")

if __name__ == "__main__":
    list_all_details()
