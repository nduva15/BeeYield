import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
url = os.getenv("VITE_SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

farmers = supabase.table("farmers").select("user_id, name").execute()
print(f"Farmers: {farmers.data}")

# If user_id is None, we have a problem.
