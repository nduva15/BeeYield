
import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Add backend to path to import config
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "backend")))

load_dotenv(dotenv_path="backend/.env")

url = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

if not url or not key:
    print("Error: Supabase credentials not found in backend/.env")
    sys.exit(1)

supabase: Client = create_client(url, key)

tables_to_check = [
    "contact_submissions",
    "pollination_requests",
    "newsletter_subscribers",
    "job_applications",
    "donations"
]

def check_columns():
    for table in tables_to_check:
        print(f"\n--- Columns in '{table}' ---")
        try:
            response = supabase.table(table).select("*").limit(1).execute()
            if response.data:
                for key in response.data[0].keys():
                    print(f"- {key}")
            else:
                print("No records to infer columns from.")
        except Exception as e:
            print(f"Error checking '{table}': {e}")

if __name__ == "__main__":
    check_columns()
