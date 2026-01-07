import clickhouse_connect
import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def init_clickhouse():
    """Create BeeYield analytics database and all tables in ClickHouse"""
    
    host = os.getenv("CLICKHOUSE_HOST")
    user = os.getenv("CLICKHOUSE_USER", "default")
    password = os.getenv("CLICKHOUSE_PASSWORD")
    port = int(os.getenv("CLICKHOUSE_PORT", 8443))
    database = os.getenv("CLICKHOUSE_DATABASE", "beeyield_analytics")
    
    if not host or not password:
        print("❌ Error: CLICKHOUSE_HOST or CLICKHOUSE_PASSWORD not found in .env file")
        return

    print(f"🔌 Connecting to ClickHouse at {host}...")

    # Connect to ClickHouse Cloud
    try:
        client = clickhouse_connect.get_client(
            host=host,
            user=user,
            password=password,
            port=port,
            secure=True
        )
        print("✅ Connected to ClickHouse Cloud")
    except Exception as e:
        print(f"❌ Failed to connect to ClickHouse: {e}")
        return
    
    # 1. Create Database
    client.command(f"CREATE DATABASE IF NOT EXISTS {database}")
    print(f"✅ Database {database} created/verified")
    
    # Reconnect with database selected
    client = clickhouse_connect.get_client(
        host=host,
        user=user,
        password=password,
        port=port,
        database=database,
        secure=True
    )

    # DROP existing tables to ensure fresh schema
    print("🗑️ Dropping existing tables to ensure fresh schema...")
    tables_to_drop = [
        "mv_daily_page_views", "mv_daily_scans", "mv_daily_orders",
        "page_views", "traceability_scans", "order_events", "product_views", 
        "search_queries", "api_requests", "hive_sensor_data", 
        "pollination_analytics", "email_events"
    ]
    for table in tables_to_drop:
        client.command(f"DROP TABLE IF EXISTS {table}")
    print("✅ Existing tables dropped")
    
    # 2. Page Views Table
    client.command("""
    CREATE TABLE IF NOT EXISTS page_views (
        id UUID DEFAULT generateUUIDv4(),
        page_path String,
        page_title String DEFAULT '',
        user_id String DEFAULT '',
        session_id String DEFAULT '',
        referrer String DEFAULT '',
        user_agent String DEFAULT '',
        ip_country String DEFAULT '',
        ip_city String DEFAULT '',
        device_type String DEFAULT '',
        browser String DEFAULT '',
        os String DEFAULT '',
        created_at DateTime DEFAULT now()
    ) ENGINE = MergeTree()
    PARTITION BY toYYYYMM(created_at)
    ORDER BY (created_at, page_path)
    TTL created_at + INTERVAL 2 YEAR
    """)
    print("✅ Table page_views created")
    
    # 3. Traceability Scans Table
    client.command("""
    CREATE TABLE IF NOT EXISTS traceability_scans (
        id UUID DEFAULT generateUUIDv4(),
        batch_code String,
        product_id String DEFAULT '',
        scan_location String DEFAULT '',
        scan_country String DEFAULT '',
        scan_city String DEFAULT '',
        user_agent String DEFAULT '',
        is_verified Bool DEFAULT true,
        scanned_at DateTime DEFAULT now()
    ) ENGINE = MergeTree()
    PARTITION BY toYYYYMM(scanned_at)
    ORDER BY (scanned_at, batch_code)
    TTL scanned_at + INTERVAL 5 YEAR
    """)
    print("✅ Table traceability_scans created")
    
    # 4. Order Events Table
    client.command("""
    CREATE TABLE IF NOT EXISTS order_events (
        id UUID DEFAULT generateUUIDv4(),
        order_id String,
        event_type String,
        order_total Float64,
        currency String DEFAULT 'KES',
        items_count UInt16 DEFAULT 0,
        customer_type String DEFAULT 'guest',
        payment_method String DEFAULT '',
        event_at DateTime DEFAULT now()
    ) ENGINE = MergeTree()
    PARTITION BY toYYYYMM(event_at)
    ORDER BY (event_at, order_id)
    """)
    print("✅ Table order_events created")
    
    # 5. Product Views Table
    client.command("""
    CREATE TABLE IF NOT EXISTS product_views (
        id UUID DEFAULT generateUUIDv4(),
        product_id String,
        product_name String DEFAULT '',
        category String DEFAULT '',
        user_id String DEFAULT '',
        session_id String DEFAULT '',
        source String DEFAULT '',
        viewed_at DateTime DEFAULT now()
    ) ENGINE = MergeTree()
    PARTITION BY toYYYYMM(viewed_at)
    ORDER BY (viewed_at, product_id)
    """)
    print("✅ Table product_views created")
    
    # 6. Search Queries Table
    client.command("""
    CREATE TABLE IF NOT EXISTS search_queries (
        id UUID DEFAULT generateUUIDv4(),
        query String,
        results_count UInt32 DEFAULT 0,
        user_id String DEFAULT '',
        session_id String DEFAULT '',
        clicked_result Bool DEFAULT false,
        searched_at DateTime DEFAULT now()
    ) ENGINE = MergeTree()
    PARTITION BY toYYYYMM(searched_at)
    ORDER BY (searched_at, query)
    """)
    print("✅ Table search_queries created")
    
    # 7. API Requests Table
    client.command("""
    CREATE TABLE IF NOT EXISTS api_requests (
        id UUID DEFAULT generateUUIDv4(),
        endpoint String,
        method String,
        status_code UInt16,
        response_time_ms UInt32,
        user_id String DEFAULT '',
        ip_address String DEFAULT '',
        user_agent String DEFAULT '',
        error_message String DEFAULT '',
        requested_at DateTime DEFAULT now()
    ) ENGINE = MergeTree()
    PARTITION BY toYYYYMM(requested_at)
    ORDER BY (requested_at, endpoint)
    TTL requested_at + INTERVAL 1 YEAR
    """)
    print("✅ Table api_requests created")
    
    # 8. Hive Sensor Data Table
    client.command("""
    CREATE TABLE IF NOT EXISTS hive_sensor_data (
        id UUID DEFAULT generateUUIDv4(),
        hive_id String,
        hive_code String,
        apiary_name String DEFAULT '',
        temperature_celsius Float32,
        humidity_percent Float32,
        weight_kg Float32,
        sound_level_db Float32 DEFAULT 0,
        battery_percent UInt8 DEFAULT 100,
        signal_strength Int8 DEFAULT 0,
        recorded_at DateTime DEFAULT now()
    ) ENGINE = MergeTree()
    PARTITION BY toYYYYMM(recorded_at)
    ORDER BY (recorded_at, hive_id)
    TTL recorded_at + INTERVAL 3 YEAR
    """)
    print("✅ Table hive_sensor_data created")
    
    # 9. Pollination Analytics Table
    client.command("""
    CREATE TABLE IF NOT EXISTS pollination_analytics (
        id UUID DEFAULT generateUUIDv4(),
        farm_id String,
        farm_name String DEFAULT '',
        crop_type String,
        acres Float32,
        hives_deployed UInt16,
        start_date Date,
        end_date Date,
        estimated_yield_increase_percent Float32 DEFAULT 0,
        actual_yield_increase_percent Float32 DEFAULT 0,
        customer_satisfaction UInt8 DEFAULT 0,
        recorded_at DateTime DEFAULT now()
    ) ENGINE = MergeTree()
    PARTITION BY toYear(recorded_at)
    ORDER BY (recorded_at, farm_id)
    """)
    print("✅ Table pollination_analytics created")
    
    # 10. Email Events Table
    client.command("""
    CREATE TABLE IF NOT EXISTS email_events (
        id UUID DEFAULT generateUUIDv4(),
        email_id String,
        email_type String,
        recipient_email String,
        event_type String,
        link_clicked String DEFAULT '',
        event_at DateTime DEFAULT now()
    ) ENGINE = MergeTree()
    PARTITION BY toYYYYMM(event_at)
    ORDER BY (event_at, email_id)
    TTL event_at + INTERVAL 2 YEAR
    """)
    print("✅ Table email_events created")
    
    # 11. Materialized View: Daily Page Views
    client.command(f"""
    CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_page_views
    ENGINE = SummingMergeTree()
    PARTITION BY toYYYYMM(date)
    ORDER BY (date, page_path)
    AS SELECT
        toDate(created_at) as date,
        page_path,
        count() as views,
        uniq(session_id) as unique_sessions
    FROM {database}.page_views
    GROUP BY date, page_path
    """)
    print("✅ Materialized view mv_daily_page_views created")
    
    # 12. Materialized View: Daily Scans
    client.command(f"""
    CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_scans
    ENGINE = SummingMergeTree()
    PARTITION BY toYYYYMM(date)
    ORDER BY (date, batch_code)
    AS SELECT
        toDate(scanned_at) as date,
        batch_code,
        scan_country,
        count() as scans
    FROM {database}.traceability_scans
    GROUP BY date, batch_code, scan_country
    """)
    print("✅ Materialized view mv_daily_scans created")
    
    # 13. Materialized View: Daily Orders
    client.command(f"""
    CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_orders
    ENGINE = SummingMergeTree()
    PARTITION BY toYYYYMM(date)
    ORDER BY (date, currency)
    AS SELECT
        toDate(event_at) as date,
        currency,
        countIf(event_type = 'created') as orders_created,
        countIf(event_type = 'paid') as orders_paid,
        sumIf(order_total, event_type = 'paid') as revenue
    FROM {database}.order_events
    GROUP BY date, currency
    """)
    print("✅ Materialized view mv_daily_orders created")
    
    # Verify tables were created
    tables = client.query("SHOW TABLES").result_set
    print("\n📊 Tables in beeyield_analytics:")
    for table in tables:
        print(f"   - {table[0]}")
    
    print("\n🎉 ClickHouse initialization complete!")

if __name__ == '__main__':
    init_clickhouse()