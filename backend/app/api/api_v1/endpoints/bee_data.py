from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import json
import os

router = APIRouter()

def load_intelligence_data():
    """Load intelligence data from JSON file."""
    data_path = os.path.join(os.path.dirname(__file__), "../../../data/bee_intelligence.json")
    try:
        with open(data_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading bee_intelligence.json: {e}")
        return {}

@router.get("/bee-health")
async def get_bee_health_guide():
    """Return comprehensive bee health data for AI context."""
    data = load_intelligence_data()
    return data.get("bee_health", {})

@router.get("/market-data")
async def get_market_intelligence():
    """Return global and regional honey market data."""
    data = load_intelligence_data()
    return data.get("market_data", {})

@router.get("/global-research")
async def get_global_research_summary():
    """Return summaries of latest apiculture research."""
    data = load_intelligence_data()
    return data.get("global_research", {})

@router.get("/iot-metrics")
async def get_iot_hive_metrics():
    """Return real-time IoT metrics for hive monitoring analysis."""
    data = load_intelligence_data()
    return data.get("iot_metrics", {})

@router.get("/traceability-ledger")
async def get_blockchain_traceability_ledger():
    """Return a summary of the blockchain traceability ledger for verification."""
    data = load_intelligence_data()
    return data.get("traceability_ledger", {})
