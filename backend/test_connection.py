import os
import sys

# Add the parent directory to sys.path so we can import 'app'
# Assuming we are running this from backend/
# backend/ is current dir
sys.path.append(os.getcwd())

try:
    from app.db.supabase_db import get_supabase
    print("Import successful")
except Exception as e:
    print(f"Import failed: {e}")
    sys.exit(1)

try:
    client = get_supabase()
    if client:
        print("Supabase connected")
    else:
        print("Supabase NOT connected (check env vars)")
except Exception as e:
    print(f"Connection error: {e}")
