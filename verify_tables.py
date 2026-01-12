import os
import sys
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("VITE_SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Missing credentials")
    sys.exit(1)

client = create_client(url, key)

# Query pg_catalog to see real tables
try:
    # This might require higher permissions than anon, but service role should work
    res = client.rpc('get_tables_info', {}).execute()
    # If RPC doesn't exist, we can try a raw select from something known or just check errors
    print("RPC get_tables_info not found or failed, trying common tables...")
except:
    pass

tables_to_check = [
    "products", "batches", "honey_batches", "orders", "newsletter_subscribers", 
    "contact_submissions", "pollination_requests", "team_members", "profiles"
]

for t in tables_to_check:
    try:
        res = client.table(t).select("count", count="exact").limit(0).execute()
        print(f"Table '{t}': EXISTS (count: {res.count})")
    except Exception as e:
        if "does not exist" in str(e).lower():
            print(f"Table '{t}': DOES NOT EXIST")
        else:
            print(f"Table '{t}': Error - {e}")
