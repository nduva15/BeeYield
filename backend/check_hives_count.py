import os
import sys

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.supabase_db import db_select

def check_hives_and_apiaries():
    print("Fetching apiaries...")
    apiaries = db_select("apiaries")
    print(f"Total apiaries: {len(apiaries)}")

    print("Fetching hives...")
    # db_select has a default limit of 100. We might have more.
    hives = db_select("hives", limit=1000)
    print(f"Total hives: {len(hives)}")

    for apiary in apiaries:
        # Filter hives by apiary_id
        apiary_hives = [h for h in hives if h.get('apiary_id') == apiary['id']]
        print(f"Apiary: {apiary['name']} ({apiary.get('apiary_code', 'N/A')}) - Hives: {len(apiary_hives)}")

if __name__ == "__main__":
    check_hives_and_apiaries()
