-- ============================================================
-- BEEYIELD CLICKHOUSE ANALYTICS SCHEMA
-- Run this in ClickHouse Cloud Console
-- ============================================================

-- Create Database
CREATE DATABASE IF NOT EXISTS beeyield_analytics;

USE beeyield_analytics;

-- ============================================================
-- 1. PAGE VIEWS (Website Analytics)
-- ============================================================

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
TTL created_at + INTERVAL 2 YEAR;

-- ============================================================
-- 2. TRACEABILITY SCANS (QR Code Scans)
-- ============================================================

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
TTL scanned_at + INTERVAL 5 YEAR;

-- ============================================================
-- 3. ORDER EVENTS (E-commerce Analytics)
-- ============================================================

CREATE TABLE IF NOT EXISTS order_events (
    id UUID DEFAULT generateUUIDv4(),
    order_id String,
    event_type String, -- created, paid, shipped, delivered, cancelled
    order_total Float64,
    currency String DEFAULT 'KES',
    items_count UInt16 DEFAULT 0,
    customer_type String DEFAULT 'guest', -- guest, registered, returning
    payment_method String DEFAULT '',
    event_at DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(event_at)
ORDER BY (event_at, order_id);

-- ============================================================
-- 4. PRODUCT VIEWS (Product Analytics)
-- ============================================================

CREATE TABLE IF NOT EXISTS product_views (
    id UUID DEFAULT generateUUIDv4(),
    product_id String,
    product_name String DEFAULT '',
    category String DEFAULT '',
    user_id String DEFAULT '',
    session_id String DEFAULT '',
    source String DEFAULT '', -- search, category, homepage, direct
    viewed_at DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(viewed_at)
ORDER BY (viewed_at, product_id);

-- ============================================================
-- 5. SEARCH QUERIES (Search Analytics)
-- ============================================================

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
ORDER BY (searched_at, query);

-- ============================================================
-- 6. API REQUESTS (API Analytics)
-- ============================================================

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
TTL requested_at + INTERVAL 1 YEAR;

-- ============================================================
-- 7. HIVE SENSOR DATA (IoT Analytics)
-- ============================================================

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
TTL recorded_at + INTERVAL 3 YEAR;

-- ============================================================
-- 8. POLLINATION ANALYTICS
-- ============================================================

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
    customer_satisfaction UInt8 DEFAULT 0, -- 1-10 scale
    recorded_at DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYear(recorded_at)
ORDER BY (recorded_at, farm_id);

-- ============================================================
-- 9. EMAIL EVENTS (Email Analytics)
-- ============================================================

CREATE TABLE IF NOT EXISTS email_events (
    id UUID DEFAULT generateUUIDv4(),
    email_id String,
    email_type String, -- newsletter, transactional, marketing
    recipient_email String,
    event_type String, -- sent, delivered, opened, clicked, bounced, unsubscribed
    link_clicked String DEFAULT '',
    event_at DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(event_at)
ORDER BY (event_at, email_id)
TTL event_at + INTERVAL 2 YEAR;

-- ============================================================
-- MATERIALIZED VIEWS FOR AGGREGATIONS
-- ============================================================

-- Daily page views summary
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_page_views
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (date, page_path)
AS SELECT
    toDate(created_at) as date,
    page_path,
    count() as views,
    uniq(session_id) as unique_sessions
FROM page_views
GROUP BY date, page_path;

-- Daily traceability scans summary
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_scans
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (date, batch_code)
AS SELECT
    toDate(scanned_at) as date,
    batch_code,
    scan_country,
    count() as scans
FROM traceability_scans
GROUP BY date, batch_code, scan_country;

-- Daily order summary
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
FROM order_events
GROUP BY date, currency;

-- ============================================================
-- SAMPLE QUERIES FOR ANALYTICS DASHBOARD
-- ============================================================

-- Top pages last 30 days
-- SELECT page_path, count() as views FROM page_views WHERE created_at >= now() - INTERVAL 30 DAY GROUP BY page_path ORDER BY views DESC LIMIT 10;

-- Traceability scans by country
-- SELECT scan_country, count() as scans FROM traceability_scans WHERE scanned_at >= now() - INTERVAL 30 DAY GROUP BY scan_country ORDER BY scans DESC;

-- Revenue by day
-- SELECT date, sum(revenue) as total_revenue FROM mv_daily_orders WHERE date >= today() - 30 GROUP BY date ORDER BY date;

-- Hive health overview
-- SELECT hive_code, avg(temperature_celsius) as avg_temp, avg(humidity_percent) as avg_humidity, avg(weight_kg) as avg_weight FROM hive_sensor_data WHERE recorded_at >= now() - INTERVAL 7 DAY GROUP BY hive_code;
