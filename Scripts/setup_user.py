import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not supabase_url or not supabase_key:
    print("Missing Supabase credentials")
    exit(1)

supabase = create_client(supabase_url, supabase_key)

email = "timothynduva349@gmail.com"
password = "123456"

def setup_user():
    print(f"Setting up user: {email}")
    
    try:
        # Use auth admin to list users
        users_res = supabase.auth.admin.list_users()
        users = users_res.users
        
        existing_user = next((u for u in users if u.email == email), None)
        
        if existing_user:
            print(f"User exists (ID: {existing_user.id}). Updating...")
            res = supabase.auth.admin.update_user_by_id(
                existing_user.id,
                {
                    "password": password,
                    "user_metadata": {**existing_user.user_metadata, "beeyield_active": True, "role": "admin"},
                    "email_confirm": True
                }
            )
            print("User updated successfully!")
        else:
            print("User does not exist. Creating...")
            res = supabase.auth.admin.create_user({
                "email": email,
                "password": password,
                "user_metadata": {"beeyield_active": True, "role": "admin"},
                "email_confirm": True
            })
            print("User created successfully!")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    setup_user()
