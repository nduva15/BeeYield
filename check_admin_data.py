import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("VITE_SUPABASE_URL")
anon_key = os.getenv("VITE_SUPABASE_ANON_KEY")
service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") # Check if this exists in env, though might not be in .env

print(f"URL: {url}")
print(f"Anon Key Present: {bool(anon_key)}")
print(f"Service Key Present: {bool(service_key)}")

tables = [
    "orders",
    "newsletter_subscribers",
    "products",
    "honey_batches",
    "pollination_requests",
    "contact_submissions",
    "stock_movements"
]

def check_table(client, table_name, role_name):
    try:
        # Just try to get count or 1 row
        res = client.table(table_name).select("*", count="exact").limit(1).execute()
        print(f"[{role_name}] Table '{table_name}': Found {res.count} rows (SAMPLE: {len(res.data)})")
        if len(res.data) > 0:
            print(f"   Sample ID: {res.data[0].get('id')}")
    except Exception as e:
        print(f"[{role_name}] Table '{table_name}': ERROR - {str(e)}")

print("\n--- CHECKING WITH ANON KEY (Public/RLS Restricted) ---")
if url and anon_key:
    anon_client = create_client(url, anon_key)
    for t in tables:
        check_table(anon_client, t, "ANON")

print("\n--- CHECKING WITH SERVICE KEY (Bypass RLS) ---")
if url and service_key:
    service_client = create_client(url, service_key)
    for t in tables:
        check_table(service_client, t, "SERVICE")
else:
    print("Skipping Service Key check (key not found)")
