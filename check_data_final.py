import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("VITE_SUPABASE_URL")
key = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")

print(f"Checking tables at {url}")
client = create_client(url, key)

tables = ["products", "orders", "honey_batches", "newsletter_subscribers", "contact_submissions"]

for t in tables:
    try:
        res = client.table(t).select("*", count="exact").execute()
        print(f"Table '{t}': {res.count} records")
    except Exception as e:
        print(f"Table '{t}': Error - {e}")
