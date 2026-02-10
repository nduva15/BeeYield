
from app.db.supabase_db import db_select
apies = db_select('apiaries')
for a in apies:
    print(f"APIARY: {a.get('name')} | ID: {a.get('id')} | USER: {a.get('user_id')}")
