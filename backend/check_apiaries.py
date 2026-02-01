print("--- Starting check_apiaries.py ---")
import sys
import os
import asyncio

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.db.supabase_db import db_select

def check_apiaries():
    apiaries = db_select("apiaries")
    print(f"Total apiaries: {len(apiaries)}")
    for a in apiaries:
        print(f"ID: {a['id']}, Code: {a['apiary_code']}, Name: {a['name']}")

if __name__ == "__main__":
    check_apiaries()
