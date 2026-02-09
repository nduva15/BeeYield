
import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "backend")))
load_dotenv(dotenv_path="backend/.env")

url = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

def search_all():
    with open("master_db_search.txt", "w") as f:
        # Get all table names
        # Note: I'll just guess some common ones if I can't query information_schema
        tables = ["profiles", "apiaries", "hives", "harvests", "tasks", "notes", "farmers", "iot_devices", "sensor_readings", "inspections"]
        for table in tables:
            try:
                res = supabase.table(table).select("*").execute()
                for row in res.data:
                    if "Markempai" in str(row) or "markempai" in str(row).lower():
                        f.write(f"FOUND IN {table}: {row}\n")
            except Exception as e:
                f.write(f"Skip {table}: {e}\n")

if __name__ == "__main__":
    search_all()
