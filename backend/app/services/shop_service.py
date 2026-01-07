from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
from app.db.supabase_db import db_select, db_insert, db_get_by_id
from app.schemas import shop as schemas

def get_products(category: Optional[str] = None) -> List[Dict[str, Any]]:
    """Fetch all active products with their variants from Supabase"""
    filters = {"is_active": True}
    if category:
        filters["category"] = category
    
    products = db_select("products", filters=filters)
    
    # Fetch variants for each product
    # Note: In a high-traffic app, we'd use a join or a single query for variants
    for product in products:
        product["variants"] = db_select("product_variants", filters={"product_id": product["id"]})
        
    return products

def get_product_by_id(product_id: str) -> Optional[Dict[str, Any]]:
    """Fetch a single product with variants"""
    product = db_get_by_id("products", product_id)
    if product:
        product["variants"] = db_select("product_variants", filters={"product_id": product_id})
    return product

def create_order(order_in: schemas.OrderCreate, user_id: Optional[str] = None) -> Dict[str, Any]:
    """Create a new order and return order details"""
    order_id = str(uuid.uuid4())
    order_number = f"BY-{datetime.now().strftime('%Y%m%d%H%M')}-{str(uuid.uuid4())[:4].upper()}"
    
    # This is a simplified implementation. 
    # Real implementation would calculate totals from items and variants in the DB.
    order_data = {
        "id": order_id,
        "order_number": order_number,
        "user_id": user_id,
        "status": "pending",
        "payment_method": order_in.payment_method,
        "payment_status": "pending",
        "total_kes": order_in.total_kes,
        "shipping_address": order_in.shipping_address,
        "notes": order_in.notes,
        "created_at": datetime.utcnow().isoformat()
    }
    
    # In a real app, we'd also insert into order_items table here
    
    result = db_insert("orders", order_data)
    if result["success"]:
        return {
            "order_id": order_id,
            "order_number": order_number,
            "status": "success"
        }
    return {"status": "error", "message": result.get("error", "Unknown error")}
