"""
ClickHouse Database Connection for BeeYield Analytics
Stores: Page views, traceability scans, order analytics, IoT sensor data
"""
import clickhouse_connect
from datetime import datetime
from typing import Optional, Any
from app.core.config import settings


class ClickHouseService:
    _client = None

    @classmethod
    def get_client(cls, database: Optional[str] = None):
        """Get or create ClickHouse client connection"""
        target_db = database if database is not None else settings.CLICKHOUSE_DATABASE
        
        # Fail fast if not configured
        if not settings.CLICKHOUSE_HOST:
            if database is None:
                cls._client = None
            return None
        
        try:
            client = clickhouse_connect.get_client(
                host=settings.CLICKHOUSE_HOST.replace("https://", "").replace("http://", ""),
                port=settings.CLICKHOUSE_PORT,
                user=settings.CLICKHOUSE_USER,
                password=settings.CLICKHOUSE_PASSWORD,
                database=target_db,
                secure=settings.CLICKHOUSE_SECURE,
                connect_timeout=5
            )
            if database is None:
                cls._client = client
            return client
        except Exception as e:
            print(f"ClickHouse connection failed: {e}")
            if database is None:
                cls._client = None
            return None

    @classmethod
    def execute(cls, query: str, parameters: Optional[dict] = None):
        """Execute a query (INSERT, CREATE, etc.)"""
        client = cls.get_client()
        if client:
            return client.command(query, parameters)
        return None

    @classmethod
    def query(cls, query: str, parameters: Optional[dict] = None) -> list[dict[str, Any]]:
        """Execute SELECT query and return results as list of dicts"""
        client = cls.get_client()
        if client:
            result = client.query(query, parameters)
            columns = result.column_names
            return [dict(zip(columns, row)) for row in result.result_rows]
        return []

    @classmethod
    def insert(cls, table: str, data: list[dict[str, Any]], column_names: list[str] = None):
        """Insert rows into a table"""
        client = cls.get_client()
        if client and data:
            if not column_names:
                column_names = list(data[0].keys())
            rows = [[row.get(col) for col in column_names] for row in data]
            client.insert(table, rows, column_names=column_names)
            return True
        return False


# ============ ANALYTICS TRACKING FUNCTIONS ============

def track_page_view(
    page_path: str,
    user_id: Optional[str] = None,
    session_id: Optional[str] = None,
    referrer: Optional[str] = None,
    user_agent: Optional[str] = None,
    ip_country: Optional[str] = None
):
    """Track a page view event"""
    ClickHouseService.insert("page_views", [{
        "page_path": page_path,
        "user_id": user_id or "",
        "session_id": session_id or "",
        "referrer": referrer or "",
        "user_agent": user_agent or "",
        "ip_country": ip_country or "",
        "created_at": datetime.now()
    }])

def track_traceability_scan(
    batch_code: str,
    scan_location: Optional[str] = None,
    user_agent: Optional[str] = None
):
    """Track when someone scans a honey jar QR code"""
    ClickHouseService.insert("traceability_scans", [{
        "batch_code": batch_code,
        "scan_location": scan_location or "",
        "user_agent": user_agent or "",
        "scanned_at": datetime.now()
    }])

def track_order_event(
    order_id: str,
    event_type: str,  # created, paid, shipped, delivered
    order_total: float,
    currency: str = "KES"
):
    """Track order lifecycle events for analytics"""
    ClickHouseService.insert("order_events", [{
        "order_id": order_id,
        "event_type": event_type,
        "order_total": order_total,
        "currency": currency,
        "event_at": datetime.now()
    }])


def get_analytics_summary(days: int = 30) -> dict[str, Any]:
    """Get summary analytics for dashboard"""
    results = ClickHouseService.query(f"""
        SELECT
            countIf(created_at >= now() - INTERVAL {days} DAY) as page_views,
            uniqIf(session_id, created_at >= now() - INTERVAL {days} DAY) as unique_sessions
        FROM page_views
    """)
    
    scans = ClickHouseService.query(f"""
        SELECT count() as total_scans
        FROM traceability_scans
        WHERE scanned_at >= now() - INTERVAL {days} DAY
    """)
    
    return {
        "page_views": results[0]["page_views"] if results else 0,
        "unique_sessions": results[0]["unique_sessions"] if results else 0,
        "traceability_scans": scans[0]["total_scans"] if scans else 0
    }

def get_page_views_chart(days: int = 7) -> list[dict[str, Any]]:
    """Get daily page views for chart"""
    return ClickHouseService.query(f"""
        SELECT
            toStartOfDay(created_at) as date,
            count() as views,
            uniq(session_id) as visitors
        FROM page_views
        WHERE created_at >= now() - INTERVAL {days} DAY
        GROUP BY date
        ORDER BY date ASC
    """)

def get_top_pages(limit: int = 10, days: int = 30) -> list[dict[str, Any]]:
    """Get top visited pages"""
    return ClickHouseService.query(f"""
        SELECT
            page_path,
            count() as views
        FROM page_views
        WHERE created_at >= now() - INTERVAL {days} DAY
        GROUP BY page_path
        ORDER BY views DESC
        LIMIT {limit}
    """)

def get_scans_chart(days: int = 7) -> list[dict[str, Any]]:
    """Get daily traceability scans"""
    return ClickHouseService.query(f"""
        SELECT
            toStartOfDay(scanned_at) as date,
            count() as scans
        FROM traceability_scans
        WHERE scanned_at >= now() - INTERVAL {days} DAY
        GROUP BY date
        ORDER BY date ASC
    """)

def get_sales_analytics(days: int = 30) -> list[dict[str, Any]]:
    """Get sales performance"""
    return ClickHouseService.query(f"""
        SELECT
            toStartOfDay(event_at) as date,
            count() as orders,
            sum(order_total) as revenue
        FROM order_events
        WHERE event_type = 'paid' AND event_at >= now() - INTERVAL {days} DAY
        GROUP BY date
        ORDER BY date ASC
    """)


# Singleton accessor
clickhouse = ClickHouseService()
