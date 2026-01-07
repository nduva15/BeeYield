import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.core.config import settings

print(f"Host: {settings.CLICKHOUSE_HOST}")
print(f"User: {settings.CLICKHOUSE_USER}")
pwd = settings.CLICKHOUSE_PASSWORD
if pwd:
    print(f"Pass: {pwd[0]}***{pwd[-1]} (length {len(pwd)})")
else:
    print("Pass: EMPTY")

from app.db.clickhouse_db import ClickHouseService

try:
    client = ClickHouseService.get_client()
    if client:
        print("✅ Successfully connected to ClickHouse")
        res = client.query("SELECT 1")
        print(f"✅ Success: {res.result_rows}")
    else:
        print("❌ ClickHouse client is None")
except Exception as e:
    print(f"❌ Error: {e}")
