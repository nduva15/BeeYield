import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("VITE_SUPABASE_URL")
anon_key = os.getenv("VITE_SUPABASE_ANON_KEY")

print(f"URL: {url}")

if not url or not anon_key:
    print("Missing credentials")
    exit(1)

supabase = create_client(url, anon_key)

email = "Timothy.mathuva@strathmore.edu"
password = "123456"

try:
    print(f"Attempting to SIGN UP user: {email}...")
    res = supabase.auth.sign_up({
        "email": email,
        "password": password,
        "options": {
            "data": {
                "role": "super_admin",
                "first_name": "Timothy",
                "last_name": "Mathuva"
            }
        }
    })
    print(f"Result: {res}")
except Exception as e:
    print(f"Error: {e}")
