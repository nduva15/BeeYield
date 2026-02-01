import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.supabase_db import db_select

with open("sync_status.txt", "w", encoding="utf-8") as f:
    f.write("=" * 60 + "\n")
    f.write("DATABASE SYNC CHECK\n")
    f.write("=" * 60 + "\n")

    apiaries = db_select('apiaries')
    f.write(f'\nTotal Apiaries: {len(apiaries)}\n')
    f.write('-' * 40 + "\n")

    hives = db_select('hives', limit=1000)
    f.write(f'Total Hive Rows in DB: {len(hives)}\n')
    f.write('-' * 40 + "\n")

    # Count hives per apiary
    f.write('\nBreakdown by Apiary:\n')
    for a in apiaries:
        count = len([h for h in hives if h.get('apiary_id') == a['id']])
        f.write(f"  - {a['name']}\n")
        f.write(f"      ID: {a['id']}\n")
        f.write(f"      Code: {a.get('apiary_code')}\n")
        f.write(f"      hive_count field: {a.get('hive_count')}\n")
        f.write(f"      Actual hive rows: {count}\n")
        f.write("\n")

    f.write("=" * 60 + "\n")
