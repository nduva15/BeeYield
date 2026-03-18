"""
AI Assistant Service — Thin Python Gateway
===========================================
Re-exports Rust-backed IntentDetector and provides async data retrieval
helpers consumed by the /assistant/* endpoint router.
"""
import httpx
import json
import os
from typing import Optional, List

RUST_SERVICE_URL = "http://127.0.0.1:9091"

# ---------------------------------------------------------------------------
# Core AI class — delegates to the Rust Actix service
# ---------------------------------------------------------------------------

class BeeYieldAI:
    @staticmethod
    async def query_assistant(payload: dict):
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{RUST_SERVICE_URL}/ai/query", json=payload)
            return response.json()

    @staticmethod
    async def process_query(query):
        """Legacy compatibility — wraps query_assistant."""
        return await BeeYieldAI.query_assistant({"message": getattr(query, "message", str(query))})

    @staticmethod
    async def get_quick_suggestions(user_role: str = "guest") -> list:
        base = [
            "What honey do you have in stock?",
            "Trace my batch origin",
            "How are my hives doing?",
        ]
        if user_role in ("admin", "farmer"):
            base.extend(["Show harvest report", "Latest IoT readings"])
        return base

    @staticmethod
    async def health_check():
        from datetime import datetime
        return {
            "status": "online",
            "checks": {"rust_core": True, "knowledge_base": True},
            "timestamp": datetime.now().isoformat(),
        }


# Backward-compatible aliases
Assistant = BeeYieldAI
AIQuery = dict
AIContext = dict
AIResponse = dict


# ---------------------------------------------------------------------------
# IntentDetector — re-export from the compiled Rust binary
# ---------------------------------------------------------------------------

try:
    from honey_rust import IntentDetector
except ImportError:
    # Fallback pure-Python stub if binary not built
    class IntentDetector:
        @staticmethod
        def detect(message: str) -> List[str]:
            msg = message.lower()
            intents = []
            kw_map = {
                "product_search": ["buy", "purchase", "order", "shop", "honey", "price", "product"],
                "order_status": ["order", "tracking", "delivery", "status"],
                "trace_honey": ["trace", "origin", "batch", "verify", "qr"],
                "iot_data": ["sensor", "temperature", "humidity", "iot"],
                "hive_health": ["health", "disease", "varroa", "mite"],
                "greeting": ["hello", "hi", "hey", "jambo"],
            }
            for intent, keywords in kw_map.items():
                if any(kw in msg for kw in keywords):
                    intents.append(intent)
            return intents or ["general"]

        @staticmethod
        def get_temperature(intents: List[str]) -> float:
            if any(i in intents for i in ["greeting"]):
                return 0.7
            if any(i in intents for i in ["trace_honey", "order_status", "iot_data"]):
                return 0.1
            return 0.4


# ---------------------------------------------------------------------------
# DataRetriever — async helpers for shop, apiaries, IoT, company info
# ---------------------------------------------------------------------------

class DataRetriever:
    @staticmethod
    async def get_order_info(order_id: str, token: Optional[str] = None) -> dict:
        from app.db.supabase_db import db_select
        try:
            results = await db_select("orders", filters={"id": order_id}, token=token)
            return results[0] if results else {"error": "Order not found"}
        except Exception as e:
            return {"error": str(e)}

    @staticmethod
    async def get_shop_products(category: Optional[str] = None, limit: int = 10, token: Optional[str] = None) -> list:
        from app.db.supabase_db import db_select
        try:
            filters = {"category": category} if category else {}
            return await db_select("products", filters=filters, limit=limit, token=token)
        except Exception:
            return []

    @staticmethod
    async def get_pollination_info() -> dict:
        return {
            "service": "Precision Pollination",
            "description": "Managed beehive deployment for crop pollination",
            "crops": ["avocado", "macadamia", "coffee", "mango"],
            "contact": "pollination@beeyield.com",
        }

    @staticmethod
    async def get_apiary_stats(user_id: Optional[str] = None, token: Optional[str] = None) -> dict:
        from app.db.supabase_db import db_select
        try:
            filters = {"user_id": user_id} if user_id else {}
            apiaries = await db_select("apiaries", filters=filters, token=token)
            hives = await db_select("hives", filters=filters, token=token)
            return {
                "total_apiaries": len(apiaries),
                "total_hives": len(hives),
                "active_hives": sum(1 for h in hives if h.get("status") in ("active", None)),
            }
        except Exception:
            return {"total_apiaries": 0, "total_hives": 0, "active_hives": 0}

    @staticmethod
    async def get_iot_sensor_data(hive_id: Optional[str] = None, token: Optional[str] = None) -> list:
        from app.db.supabase_db import db_select
        try:
            filters = {"hive_id": hive_id} if hive_id else {}
            return await db_select(
                "sensor_readings", filters=filters,
                order_by="recorded_at", ascending=False, limit=10, token=token,
            )
        except Exception:
            return []

    @staticmethod
    async def get_company_info() -> dict:
        return {
            "name": "BeeYield Kenya Ltd",
            "hq": "Primate Park, Nairobi",
            "email": "hello@beeyield.com",
            "services": ["Honey Production", "Precision Pollination", "IoT Hive Monitoring"],
        }


# ---------------------------------------------------------------------------
# KnowledgeBase — searches the local JSON knowledge base
# ---------------------------------------------------------------------------

class KnowledgeBase:
    _kb_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../data/knowledge_base.json"))

    @staticmethod
    async def search(query: str, limit: int = 5) -> str:
        """Keyword search over the local knowledge base."""
        try:
            if not os.path.exists(KnowledgeBase._kb_path):
                return ""
            with open(KnowledgeBase._kb_path, "r", encoding="utf-8") as f:
                kb = json.load(f)

            query_lower = query.lower()
            hits = []
            for section_key, section_val in kb.items():
                if isinstance(section_val, dict):
                    text = json.dumps(section_val)
                    if query_lower in text.lower():
                        hits.append(f"[{section_key}] {text[:300]}")
                elif isinstance(section_val, list):
                    for item in section_val:
                        text = json.dumps(item) if isinstance(item, dict) else str(item)
                        if query_lower in text.lower():
                            hits.append(text[:300])
                if len(hits) >= limit:
                    break
            return "\n\n".join(hits)
        except Exception:
            return ""

    @staticmethod
    async def get_dna() -> dict:
        """Return the BeeYield identity block from the knowledge base."""
        try:
            if not os.path.exists(KnowledgeBase._kb_path):
                return {}
            with open(KnowledgeBase._kb_path, "r", encoding="utf-8") as f:
                kb = json.load(f)
            return kb.get("dna", {})
        except Exception:
            return {}


# ---------------------------------------------------------------------------
# Top-level convenience functions used by the endpoint router
# ---------------------------------------------------------------------------

async def chat(message: str, **kwargs) -> dict:
    """Simple chat helper — delegates to BeeYieldAI."""
    try:
        result = await BeeYieldAI.query_assistant({"message": message, **kwargs})
        return result
    except Exception as e:
        return {"response": f"I'm having trouble connecting right now. Error: {e}"}


async def trace_batch(batch_code: str) -> dict:
    """Trace a honey batch by code."""
    from app.db.supabase_db import db_select
    try:
        harvests = await db_select("harvests", filters={"batch_code": batch_code})
        if harvests:
            h = harvests[0]
            return {
                "info": f"Batch {batch_code}: {h.get('honey_type', 'Honey')} — "
                        f"Harvested {h.get('harvest_date', 'N/A')}",
                "harvest": h,
            }
        return {"info": f"Batch {batch_code} not found in database."}
    except Exception as e:
        return {"info": f"Trace lookup error: {e}"}


async def get_hive_status(hive_id: str) -> dict:
    """Get current hive status + latest sensor reading."""
    from app.db.supabase_db import db_select, db_get_by_id
    try:
        hive = await db_get_by_id("hives", hive_id)
        readings = await db_select(
            "sensor_readings",
            filters={"hive_id": hive_id},
            order_by="recorded_at",
            ascending=False,
            limit=1,
        )
        return {
            "hive_id": hive_id,
            "status": hive.get("status", "unknown") if hive else "not found",
            "latest_reading": readings[0] if readings else None,
        }
    except Exception as e:
        return {"hive_id": hive_id, "status": "error", "error": str(e)}
