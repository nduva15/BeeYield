
import clickhouse_connect
import os
from dotenv import load_dotenv

load_dotenv()

def test_clickhouse():
    host = os.getenv("CLICKHOUSE_HOST")
    user = os.getenv("CLICKHOUSE_USER")
    password = os.getenv("CLICKHOUSE_PASSWORD")
    port = int(os.getenv("CLICKHOUSE_PORT", 8443))
    
    print(f"Connecting to {host}...")
    try:
        client = clickhouse_connect.get_client(
            host=host,
            user=user,
            password=password,
            port=port,
            secure=True
        )
        print("✅ ClickHouse Connection Successful!")
        print(f"Server version: {client.server_version}")
    except Exception as e:
        print(f"❌ ClickHouse Connection Failed: {e}")

if __name__ == "__main__":
    test_clickhouse()
