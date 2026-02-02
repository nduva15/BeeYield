import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Missing Supabase credentials")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("Searching for user 'timothynduva349@gmail.com' in Auth...")

# The supabase-py client doesn't have a direct 'auth.admin' but we can try to find them in 'auth.users' if exposed 
# or check 'profiles' with service role which might bypass RLS (if profiles has them).
# Since I saw profiles was empty with db_select, maybe service role sees more?

try:
    res = supabase.table("profiles").select("*").eq("email", "timothynduva349@gmail.com").execute()
    if res.data:
        print(f"FOUND in profiles: {res.data[0]['id']}")
    else:
        print("Not found in profiles. Checking ALL profiles...")
        res = supabase.table("profiles").select("*").execute()
        print(f"All profiles: {res.data}")
except Exception as e:
    print(f"Error querying profiles: {e}")

print("\nChecking for ANY user in 'users' table (public schema fallback)...")
try:
    res = supabase.table("users").select("*").execute()
    print(f"Users table data: {res.data}")
except:
    pass
