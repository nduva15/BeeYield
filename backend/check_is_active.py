
import os
import sys
# Add the current directory to sys.path so we can import app
sys.path.append(os.getcwd())

from app.db.supabase_db import db_select

def check_is_active():
    apiaries = db_select("apiaries")
    for a in apiaries:
        print(f"Apiary: {a.get('name')} | is_active: {a.get('is_active')}")

if __name__ == "__main__":
    check_is_active()
