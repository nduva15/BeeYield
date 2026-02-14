"""
ClickHouse Initialization — now routes through the Go gateway.
Tables are created via the gateway's /ch/init-tables endpoint.
"""
import httpx
import os


DB_GATEWAY_URL = os.environ.get("DB_GATEWAY_URL", "http://127.0.0.1:9090")


def init_clickhouse():
    """Initialize ClickHouse analytics tables via the Go gateway."""
    print("🚀 Initializing ClickHouse via Go gateway...")

    try:
        response = httpx.post(
            f"{DB_GATEWAY_URL}/ch/init-tables",
            timeout=15.0,
        )
        result = response.json()
        if result.get("success"):
            print("✅ ClickHouse tables initialized successfully via gateway")
        else:
            print(f"⚠️ ClickHouse init response: {result}")
    except Exception as e:
        print(f"⚠️ ClickHouse initialization failed (gateway may not be running): {e}")
        print("   → Start the Go gateway with: cd services/db-gateway && go run main.go")


if __name__ == "__main__":
    init_clickhouse()
