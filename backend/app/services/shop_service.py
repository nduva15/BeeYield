"""
Shop Service - Rust-Accelerated (Post-Oxidize)
==============================================
Inventory calculations and batch assignment logic moved to `beeyield_core.ShopEngine`.
Database interactions and payment orchestration remains in Python.
"""
from typing import List, Optional, Dict, Any
import uuid
import io
import os
from datetime import datetime
from app.db.supabase_db import db_select, db_insert, db_get_by_id, db_update
from app.schemas import shop as schemas
from app.core.config import settings

try:
    from beeyield_core import ShopEngine as _RustEngine
    _RUST_AVAILABLE = True
except ImportError:
    _RUST_AVAILABLE = False

_engine = _RustEngine(settings.TOTAL_HARVEST_LIMIT_GRAMS) if _RUST_AVAILABLE else None

async def get_total_honey_sold_grams(token: Optional[str] = None) -> int:
    """Calculate total grams of honey sold across all completed orders using Rust."""
    items = await db_select("order_items", limit=10000, token=token)
    if _engine:
        return _engine.calculate_total_weight(items)
    return 0 # Fallback

async def get_products(category: Optional[str] = None, token: Optional[str] = None) -> List[Dict[ Any]]:
    filters = {"is_active": True}
    if category: filters["category"] = category
    products = await db_select("products", filters=filters, token=token)
    if not products: return []
    
    total_sold = await get_total_honey_sold_grams(token=token)
    is_out_of_stock = total_sold >= settings.TOTAL_HARVEST_LIMIT_GRAMS

    for product in products:
        product["variants"] = await db_select("product_variants", filters={"product_id": product["id"]}, token=token)
        if product.get("category") == "honey" and is_out_of_stock:
            for v in product["variants"]:
                v["stock_quantity"] = 0
                v["is_available"] = False
    return products

async def get_product_by_id(product_id: str, token: Optional[str] = None) -> Optional[Dict[str, Any]]:
    product = await db_get_by_id("products", product_id, token=token)
    if product:
        product["variants"] = await db_select("product_variants", filters={"product_id": product["id"]}, token=token)
    return product

async def create_order(order_in: schemas.OrderCreate, user_id: Optional[str] = None, token: Optional[str] = None) -> Dict[str, Any]:
    """Create a new order. Business logic logic delegated to Rust."""
    order_id = str(uuid.uuid4())
    order_number = f"BY-{datetime.now().strftime('%Y%m%d%H%M')}-{str(uuid.uuid4())[:4].upper()}"
    
    # 1. Calculate weight of new order using Rust
    new_weight = 0
    if _engine:
        # Mini-hack: create a list of items for the engine to calculate
        temp_items = [{"product_name": "honey", "variant_size": it.variant_id, "quantity": it.quantity} for it in order_in.items]
        # Actually we need the real variant size from DB
        for item in order_in.items:
            product = await get_product_by_id(item.product_id, token=token)
            variant = next((v for v in product.get("variants", []) if v.get("id") == item.variant_id), None)
            if product and product.get("category") == "honey" and variant:
                size = variant.get("size", "500g")
                new_weight += _engine.calculate_total_weight([{"product_name": "honey", "variant_size": size, "quantity": item.quantity}])

    # 2. Stock Check
    total_sold = await get_total_honey_sold_grams(token=token)
    if _engine and not _engine.is_in_stock(total_sold, new_weight):
        return {"status": "error", "message": "Insufficient stock."}

    # 3. Create Order in DB
    order_data = {
        "id": order_id,
        "order_number": order_number,
        "user_id": user_id,
        "status": "pending",
        "total_kes": order_in.total_kes,
        "shipping_address": order_in.shipping_address,
        "created_at": datetime.utcnow().isoformat()
    }
    await db_insert("orders", order_data, token=token)
    
    # 4. Process Items & Assign Batches
    all_hives = await db_select("hives", filters={"status": "active"}, limit=1000, token=token)
    hive_codes = [h.get("hive_code") for h in all_hives]
    
    batches = []
    if _engine:
        # Gather items as dicts for Rust
        items_for_rust = []
        for item in order_in.items:
            product = await get_product_by_id(item.product_id, token=token)
            variant = next((v for v in product.get("variants", []) if v.get("id") == item.variant_id), None)
            items_for_rust.append({
                "product_name": product.get("name", ""),
                "variant_size": variant.get("size", ""),
                "quantity": item.quantity
            })
            
            # DB Insert for item
            await db_insert("order_items", {
                "order_id": order_id,
                "product_id": item.product_id,
                "variant_id": item.variant_id,
                "product_name": product.get("name"),
                "variant_size": variant.get("size"),
                "quantity": item.quantity,
                "unit_price": variant.get("price_kes"),
                "total_price": variant.get("price_kes") * item.quantity
            }, token=token)
        
        batches = _engine.select_batches(items_for_rust, hive_codes)

    return {
        "order_id": order_id,
        "order_number": order_number,
        "status": "success",
        "batches": batches
    }

async def get_order(order_id: str, token: Optional[str] = None) -> Optional[Dict[str, Any]]:
    order = await db_get_by_id("orders", order_id, token=token)
    if order:
        order["items"] = await db_select("order_items", filters={"order_id": order_id}, token=token)
    return order

async def get_user_orders(user_id: str, token: Optional[str] = None) -> List[Dict[str, Any]]:
    orders = await db_select("orders", filters={"user_id": user_id}, token=token)
    return sorted(orders, key=lambda x: x.get('created_at', ''), reverse=True)
