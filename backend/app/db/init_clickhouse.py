from app.db.clickhouse_db import ClickHouseService

def init_clickhouse():
    """Create analytics tables in ClickHouse if they don't exist"""
    print("🚀 Initializing ClickHouse...")
    
    # 0. Create Database first (connect to 'default' or no db)
    from app.core.config import settings
    default_client = ClickHouseService.get_client(database="default")
    if default_client:
        default_client.command(f"CREATE DATABASE IF NOT EXISTS {settings.CLICKHOUSE_DATABASE}")
        print(f"✅ Database {settings.CLICKHOUSE_DATABASE} ensured")
    
    print("🚀 Creating tables...")
    
    # 1. Page Views Table
    ClickHouseService.execute("""
    CREATE TABLE IF NOT EXISTS page_views (
        page_path String,
        user_id String,
        session_id String,
        referrer String,
        user_agent String,
        ip_country String,
        created_at DateTime DEFAULT now()
    ) ENGINE = MergeTree()
    ORDER BY (created_at, page_path)
    """)
    
    # 2. Traceability Scans Table
    ClickHouseService.execute("""
    CREATE TABLE IF NOT EXISTS traceability_scans (
        batch_code String,
        scan_location String,
        user_agent String,
        scanned_at DateTime DEFAULT now()
    ) ENGINE = MergeTree()
    ORDER BY (scanned_at, batch_code)
    """)
    
    # 3. Order Events Table
    ClickHouseService.execute("""
    CREATE TABLE IF NOT EXISTS order_events (
        order_id String,
        event_type String,
        order_total Float64,
        currency String,
        event_at DateTime DEFAULT now()
    ) ENGINE = MergeTree()
    ORDER BY (event_at, order_id)
    """)
    
    print("✅ ClickHouse tables initialized successfully")

if __name__ == "__main__":
    init_clickhouse()
