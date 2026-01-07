"""
Shop Service - Connected to Supabase
"""
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
from app.db.supabase_db import db_select, db_insert, db_get_by_id, db_update
from app.schemas import shop as schemas


# Mock products for fallback when DB is empty
MOCK_PRODUCTS = [
    {
        "id": "honey-1",
        "name": "Acacia Honey",
        "description": "Light, golden honey with a delicate floral taste. Perfect for tea and breakfast.",
        "category": "honey",
        "badge": "Bestseller",
        "images": ["https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800"],
        "rating": 4.9,
        "review_count": 128,
        "is_active": True,
        "variants": [
            {"id": "v1", "size": "250g", "price_kes": 450, "stock_quantity": 100, "is_available": True},
            {"id": "v2", "size": "500g", "price_kes": 850, "stock_quantity": 75, "is_available": True},
            {"id": "v3", "size": "1kg", "price_kes": 1500, "stock_quantity": 50, "is_available": True}
        ]
    },
    {
        "id": "honey-2",
        "name": "Forest Honey",
        "description": "Rich, dark honey from Mount Kenya forests. Bold flavor with earthy notes.",
        "category": "honey",
        "badge": "Premium",
        "images": ["https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800"],
        "rating": 4.8,
        "review_count": 89,
        "is_active": True,
        "variants": [
            {"id": "v4", "size": "250g", "price_kes": 550, "stock_quantity": 80, "is_available": True},
            {"id": "v5", "size": "500g", "price_kes": 1000, "stock_quantity": 60, "is_available": True},
            {"id": "v6", "size": "1kg", "price_kes": 1800, "stock_quantity": 40, "is_available": True}
        ]
    },
    {
        "id": "honey-3",
        "name": "Wildflower Honey",
        "description": "Multi-floral honey from the Rift Valley. Complex, balanced sweetness.",
        "category": "honey",
        "badge": None,
        "images": ["https://images.unsplash.com/photo-1471943311424-646960669fbc?w=800"],
        "rating": 4.7,
        "review_count": 156,
        "is_active": True,
        "variants": [
            {"id": "v7", "size": "250g", "price_kes": 400, "stock_quantity": 120, "is_available": True},
            {"id": "v8", "size": "500g", "price_kes": 750, "stock_quantity": 90, "is_available": True},
            {"id": "v9", "size": "1kg", "price_kes": 1400, "stock_quantity": 60, "is_available": True}
        ]
    },
    {
        "id": "honey-4",
        "name": "Savannah Honey",
        "description": "Light amber honey with citrus undertones. Great for baking.",
        "category": "honey",
        "badge": "New",
        "images": [],
        "rating": 4.6,
        "review_count": 34,
        "is_active": True,
        "variants": [
            {"id": "v10", "size": "250g", "price_kes": 420, "stock_quantity": 100, "is_available": True},
            {"id": "v11", "size": "500g", "price_kes": 780, "stock_quantity": 80, "is_available": True},
            {"id": "v12", "size": "1kg", "price_kes": 1450, "stock_quantity": 55, "is_available": True}
        ]
    },
    {
        "id": "merch-1",
        "name": "BeeYield Classic T-Shirt",
        "description": "100% organic cotton t-shirt with embroidered logo. Comfortable everyday wear.",
        "category": "merch",
        "badge": "Bestseller",
        "images": [],
        "rating": 4.8,
        "review_count": 67,
        "is_active": True,
        "variants": [
            {"id": "v13", "size": "S", "price_kes": 1500, "stock_quantity": 30, "is_available": True},
            {"id": "v14", "size": "M", "price_kes": 1500, "stock_quantity": 50, "is_available": True},
            {"id": "v15", "size": "L", "price_kes": 1500, "stock_quantity": 50, "is_available": True},
            {"id": "v16", "size": "XL", "price_kes": 1500, "stock_quantity": 30, "is_available": True}
        ]
    },
    {
        "id": "merch-2",
        "name": "Save the Bees Hoodie",
        "description": "Premium hoodie with our conservation message. Warm and stylish.",
        "category": "merch",
        "badge": "Limited",
        "images": [],
        "rating": 4.9,
        "review_count": 45,
        "is_active": True,
        "variants": [
            {"id": "v17", "size": "S", "price_kes": 3500, "stock_quantity": 20, "is_available": True},
            {"id": "v18", "size": "M", "price_kes": 3500, "stock_quantity": 35, "is_available": True},
            {"id": "v19", "size": "L", "price_kes": 3500, "stock_quantity": 35, "is_available": True},
            {"id": "v20", "size": "XL", "price_kes": 3500, "stock_quantity": 20, "is_available": True}
        ]
    },
    {
        "id": "merch-3",
        "name": "Pollinator Cap",
        "description": "Adjustable cap with embroidered bee design. UV protective material.",
        "category": "merch",
        "badge": None,
        "images": [],
        "rating": 4.5,
        "review_count": 23,
        "is_active": True,
        "variants": [
            {"id": "v21", "size": "One Size", "price_kes": 800, "stock_quantity": 100, "is_available": True}
        ]
    },
    {
        "id": "edu-1",
        "name": "Beekeeping Starter Guide",
        "description": "Comprehensive PDF guide for aspiring beekeepers. 50+ pages of expert knowledge.",
        "category": "education",
        "badge": "Professional",
        "images": [],
        "rating": 4.9,
        "review_count": 89,
        "is_active": True,
        "variants": [
            {"id": "v22", "size": "PDF", "price_kes": 1200, "stock_quantity": 999, "is_available": True}
        ]
    },
    {
        "id": "edu-2",
        "name": "Pollination Science eBook",
        "description": "Deep dive into pollination biology and agricultural applications.",
        "category": "education",
        "badge": None,
        "images": [],
        "rating": 4.7,
        "review_count": 34,
        "is_active": True,
        "variants": [
            {"id": "v23", "size": "PDF", "price_kes": 900, "stock_quantity": 999, "is_available": True}
        ]
    },
    {
        "id": "edu-3",
        "name": "Honey Tasting Masterclass",
        "description": "Video course on honey varieties, tasting notes, and quality assessment.",
        "category": "education",
        "badge": "New",
        "images": [],
        "rating": 4.8,
        "review_count": 12,
        "is_active": True,
        "variants": [
            {"id": "v24", "size": "Video Course", "price_kes": 2500, "stock_quantity": 999, "is_available": True}
        ]
    }
]


def get_products(category: Optional[str] = None) -> List[Dict[str, Any]]:
    """Fetch all active products with their variants from Supabase"""
    filters = {"is_active": True}
    if category:
        filters["category"] = category
    
    products = db_select("products", filters=filters)
    
    if not products:
        # Return mock data filtered by category
        if category:
            return [p for p in MOCK_PRODUCTS if p["category"] == category]
        return MOCK_PRODUCTS
    
    # Fetch variants for each product
    for product in products:
        product["variants"] = db_select("product_variants", filters={"product_id": product["id"]})
        if not product["variants"]:
            product["variants"] = []
        # Ensure images is always a list
        if not product.get("images"):
            product["images"] = []
        
    return products


def get_product_by_id(product_id: str) -> Optional[Dict[str, Any]]:
    """Fetch a single product with variants"""
    product = db_get_by_id("products", product_id)
    
    if not product:
        # Check mock data
        for p in MOCK_PRODUCTS:
            if p["id"] == product_id:
                return p
        return None
    
    product["variants"] = db_select("product_variants", filters={"product_id": product_id})
    if not product["variants"]:
        product["variants"] = []
    if not product.get("images"):
        product["images"] = []
    return product


def create_order(order_in: schemas.OrderCreate, user_id: Optional[str] = None) -> Dict[str, Any]:
    """Create a new order and order items, return order details"""
    order_id = str(uuid.uuid4())
    order_number = f"BY-{datetime.now().strftime('%Y%m%d%H%M')}-{str(uuid.uuid4())[:4].upper()}"
    
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
    
    result = db_insert("orders", order_data)
    
    if not result.get("success"):
        return {"status": "error", "message": result.get("error", "Failed to create order")}
    
    # Insert order items
    for item in order_in.items:
        # Get product and variant details
        product = get_product_by_id(item.product_id)
        variant = None
        if product:
            for v in product.get("variants", []):
                if v.get("id") == item.variant_id:
                    variant = v
                    break
        
        item_data = {
            "order_id": order_id,
            "product_id": item.product_id,
            "variant_id": item.variant_id,
            "product_name": product.get("name", "Unknown") if product else "Unknown",
            "variant_size": variant.get("size", "") if variant else "",
            "quantity": item.quantity,
            "unit_price": variant.get("price_kes", 0) if variant else 0,
            "total_price": (variant.get("price_kes", 0) if variant else 0) * item.quantity
        }
        db_insert("order_items", item_data)
    
    return {
        "order_id": order_id,
        "order_number": order_number,
        "status": "success",
        "message": "Order created successfully"
    }


def get_order(order_id: str) -> Optional[Dict[str, Any]]:
    """Get order with items"""
    order = db_get_by_id("orders", order_id)
    if order:
        order["items"] = db_select("order_items", filters={"order_id": order_id})
    return order


def update_order_status(order_id: str, status: str, payment_status: Optional[str] = None) -> Dict[str, Any]:
    """Update order status"""
    update_data = {"status": status}
    if payment_status:
        update_data["payment_status"] = payment_status
    
    return db_update("orders", update_data, {"id": order_id})
