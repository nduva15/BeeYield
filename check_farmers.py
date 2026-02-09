
import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "backend")))
load_dotenv(dotenv_path="backend/.env")

url = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

def check_farmers():
    with open("farmers_report.txt", "w") as f:
        try:
            res = supabase.table("farmers").select("*").execute()
            farmers = res.data
            f.write(f"Total Farmers: {len(farmers)}\n")
            for f_item in farmers:
                f.write(f"FARMER: {f_item.get('name')} | LOCATION: {f_item.get('location_name')} | ID: {f_item.get('id')}\n")
        except Exception as e:
            f.write(f"Error farmers: {e}\n")

if __name__ == "__main__":
    check_farmers()
