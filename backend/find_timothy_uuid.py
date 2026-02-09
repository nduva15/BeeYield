import os, sys
sys.path.append(os.getcwd())
from app.db.supabase_db import get_supabase_admin

def get_timothy_uuid():
    supabase = get_supabase_admin()
    # auth.users is not accessible via .table() usually, but let's try
    try:
        # Check profiles first
        res = supabase.table("profiles").select("id").eq("username", "timothy").execute()
        if res.data:
            print(f"Timothy ID (from profiles): {res.data[0]['id']}")
            return res.data[0]['id']
        
        # Try a raw SQL-like approach if possible, or just search for apiaries owned by him
        res = supabase.table("apiaries").select("user_id, name").execute()
        for a in res.data:
            if "Timothy" in a['name'] or "Kibwezi" in a['name']:
                print(f"Found apiary '{a['name']}' with user_id: {a['user_id']}")
                return a['user_id']
                
        print("Could not find Timothy's UUID via profiles or apiaries.")
    except Exception as e:
        print(f"Error: {e}")
    return None

get_timothy_uuid()
