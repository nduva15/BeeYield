import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("VITE_SUPABASE_URL")
key = os.getenv("VITE_SUPABASE_ANON_KEY")

supabase = create_client(url, key)

email = "temp_admin@beeyield.com"
password = "TemporaryPassword123!"

try:
    print(f"Attempting to sign up {email}...")
    res = supabase.auth.sign_up({
        "email": email,
        "password": password,
    })
    print("Sign up response:", res.user.id if res.user else "No user")
    
    # Sign in to get session
    print("Signing in...")
    res = supabase.auth.sign_in_with_password({
        "email": email,
        "password": password,
    })
    print("Signed in! Session active.")
    
    # Now try to insert into products
    print("Attempting to seed a product as authenticated user...")
    p_res = supabase.table("products").insert({
        "name": "Acacia Gold Honey (Seeded)",
        "description": "Seeded via authenticated user bypass",
        "category": "honey",
        "is_active": True
    }).execute()
    print("Product insert success:", p_res.data)

except Exception as e:
    print("ERROR:", e)
