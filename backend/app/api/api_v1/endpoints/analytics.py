from fastapi import APIRouter, Depends, HTTPException
from typing import list, dict, Any
from app.db.clickhouse_db import (
    get_analytics_summary,
    get_page_views_chart,
    get_top_pages,
    get_scans_chart,
    get_sales_analytics
)

router = APIRouter()

@router.get("/summary", response_model=dict[str, Any])
def read_analytics_summary(days: int = 30):
    """
    Get high-level analytics summary:
    - Total page views
    - Unique sessions
    - Total traceability scans
    """
    try:
        return get_analytics_summary(days=days)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/page-views", response_model=list[dict[str, Any]])
def read_page_views_chart(days: int = 7):
    """
    Get time-series data for page views and unique visitors.
    """
    try:
        return get_page_views_chart(days=days)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/top-pages", response_model=list[dict[str, Any]])
def read_top_pages(limit: int = 10, days: int = 30):
    """
    Get top most visited pages.
    """
    try:
        return get_top_pages(limit=limit, days=days)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/scans", response_model=list[dict[str, Any]])
def read_scans_chart(days: int = 7):
    """
    Get time-series data for traceability scans.
    """
    try:
        return get_scans_chart(days=days)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sales", response_model=list[dict[str, Any]])
def read_sales_analytics(days: int = 30):
    """
    Get sales performance metrics (orders and revenue).
    """
    try:
        return get_sales_analytics(days=days)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
