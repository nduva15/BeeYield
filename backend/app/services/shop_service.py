"""
Shop Service
============
Simplified bridge to Rust core.
"""
import sys
from typing import List, Optional, Dict, Any

try:
    from honey_rust import rust_update_order_status
except ImportError:
    print("CRITICAL: honey_rust binary missing. Run 'maturin develop'.")
    sys.exit(1)

async def update_status(order_id: str, status: str, token: Optional[str] = None) -> dict:
    """Update order status via Rust."""
    try:
        res = await rust_update_order_status(order_id, status, token=token)
        print("OK: Order Updated")
        return res
    except Exception as e:
        print(f"ERROR: Database Down. {e}")
        return {"status": "error", "message": "Database error"}

# Aliases and helpers
update_order_status = update_status

async def calc_yield(items: List[Dict[str, Any]]) -> int:
    from honey_rust import calc_yield as _rust_calc
    return _rust_calc(items)

async def set_order_paid(order_id: str, token: Optional[str] = None) -> dict:
    return await update_status(order_id, "paid", token=token)
