
import requests
import json
import sys

BASE_URL = "http://localhost:8000/api/v1/beeyield/tasks"

# Login is hard without credentials, assuming we can test public or using a known token if printed.
# Actually, let's just try to hit the endpoint. If 401, we know auth is working at least.
# The sync script used db_insert directly.
# Let's try to simulate a client request if we can.
# But without a token, I can't really test the API from outside easily unless I disable auth or have a token.
# I will assume manual verification is better here, OR I can use the python db tools to check if tasks exist.

from app.db.supabase_db import db_select

print("Checking Tasks in DB...")
try:    
    tasks = db_select("tasks", limit=5)
    print(f"Found {len(tasks)} tasks.")
    for t in tasks:
        print(f" - {t.get('title')} ({t.get('category')})")
except Exception as e:
    print(f"Error checking DB: {e}")
