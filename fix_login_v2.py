import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("VITE_SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

print(f"URL: {url}")
print(f"Key length: {len(key) if key else 0}")

if not url or not key:
    print("Missing credentials")
    exit(1)

supabase = create_client(url, key)

email = "Timothy.mathuva@strathmore.edu"
password = "123456"

try:
    # Use admin to create or update
    print(f"Checking for user {email}...")
    users = supabase.auth.admin.list_users().users
    user = next((u for u in users if u.email.lower() == email.lower()), None)
    
    if user:
        print(f"Updating user {user.id}...")
        supabase.auth.admin.update_user_by_id(
            user.id,
            attributes={
                "password": password,
                "user_metadata": {"role": "super_admin", "first_name": "Timothy", "last_name": "Mathuva"},
                "email_confirm": True
            }
        )
        print("Updated successfully.")
    else:
        print("Creating new user...")
        supabase.auth.admin.create_user({
            "email": email,
            "password": password,
            "email_confirm": True,
            "user_metadata": {"role": "super_admin", "first_name": "Timothy", "last_name": "Mathuva"}
        })
        print("Created successfully.")
except Exception as e:
    print(f"Error: {e}")
