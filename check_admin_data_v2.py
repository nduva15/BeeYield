import os
import sys
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("VITE_SUPABASE_URL")
# Try to get service key
service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

print(f"URL: {url}")
if not service_key:
    print("NO SERVICE KEY FOUND")
    sys.exit(1)

client = create_client(url, service_key)

tables = ["honey_batches", "products", "newsletter_subscribers", "contact_submissions", "users"]

for t in tables:
    try:
        if t == "users":
             # users is usually auth.users but here we might mean profiles or system users
             # The admin dashboard fetches 'profiles' for users.
             t = "profiles"

        res = client.table(t).select("*", count="exact").execute()
        print(f"Table '{t}': {len(res.data)} rows")
        if len(res.data) > 0:
            print(f"  First row: {res.data[0]}")
    except Exception as e:
        print(f"Table '{t}': ERROR {e}")
