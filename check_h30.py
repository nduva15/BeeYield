
import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "backend")))
load_dotenv(dotenv_path="backend/.env")

url = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

def check_h30():
    res = supabase.table("hives").select("*, apiaries(name)").eq("hive_code", "KIB-H030").execute()
    if res.data:
        print(f"HIVE KIB-H030: {res.data[0]}")
    else:
        print("HIVE KIB-H030 not found!")

check_h30()
