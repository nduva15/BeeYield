import os
import sys
import uuid
import json

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.db.supabase_db import get_supabase

def seed_force():
    supabase = get_supabase()
    if not supabase:
        print("FAIL: No supabase connection")
        return
    
    print(f"URL: {supabase.supabase_url}")
    
    # 1. Product
    p = {
        "name": "TEST PRODUCT " + str(uuid.uuid4())[:8],
        "description": "Test",
        "category": "honey",
        "is_active": True
    }
    try:
        res = supabase.table("products").insert(p).execute()
        print(f"Product Insert Result: {res.data}")
    except Exception as e:
        print(f"Product Insert ERROR: {e}")

if __name__ == "__main__":
    seed_force()
