from supabase import create_client
import os

url = "https://lqdxsgnoeickomhsgeco.supabase.co"
# Service role key from the .env file
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZHhzZ25vZWlja29taHNnZWNvIiwicm9zZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg1MjAwMSwiZXhwIjoyMDgzNDI4MDAxfQ.rBmS_M_yhr6CDK4_B8LQ5DG3_z1xEc5UHU4qwtC0-Hc"

supabase = create_client(url, key)

email = "Timothy.mathuva@strathmore.edu"
password = "123456"

try:
    print(f"Attempting to create/update user: {email}")
    # Try to list users to see if it exists
    users_resp = supabase.auth.admin.list_users()
    users = users_resp.users
    existing = next((u for u in users if u.email.lower() == email.lower()), None)
    
    if existing:
        print(f"User found with ID: {existing.id}. Updating password and metadata...")
        res = supabase.auth.admin.update_user_by_id(
            existing.id,
            attributes={
                "password": password,
                "user_metadata": {"role": "super_admin", "first_name": "Timothy", "last_name": "Mathuva"},
                "email_confirm": True
            }
        )
        print("Update successful.")
    else:
        print("User not found. Creating new user...")
        res = supabase.auth.admin.create_user({
            "email": email,
            "password": password,
            "email_confirm": True,
            "user_metadata": {"role": "super_admin", "first_name": "Timothy", "last_name": "Mathuva"}
        })
        print("Creation successful.")
except Exception as e:
    print(f"CRITICAL ERROR: {str(e)}")
