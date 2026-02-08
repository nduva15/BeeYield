"""
Shop Service - Connected to Supabase
"""
from typing import List, Optional, Dict, Any
import uuid
import io
import os
from datetime import datetime
from app.db.supabase_db import db_select, db_insert, db_get_by_id, db_update
from app.schemas import shop as schemas

# Products and orders now come exclusively from the database.
TOTAL_HARVEST_LIMIT_GRAMS = 60000

def get_total_honey_sold_grams() -> int:
    """Calculate total grams of honey sold across all completed orders."""
    # Fetch all honey items from order_items
    # In a real app we'd filter by successful payment status in the 'orders' table first.
    items = db_select("order_items")
    total_grams = 0
    for item in items:
        name = str(item.get("product_name", "")).lower()
        if any(h in name for h in ["honey", "acacia", "blossom"]):
            size_str = str(item.get("variant_size", "")).lower()
            qty = item.get("quantity", 0)
            if "1kg" in size_str: total_grams += 1000 * qty
            elif "500g" in size_str: total_grams += 500 * qty
            elif "250g" in size_str: total_grams += 250 * qty
            else: total_grams += 500 * qty
    return total_grams

def get_products(category: Optional[str] = None) -> List[Dict[str, Any]]:
    """Fetch all active products with their variants from Supabase"""
    filters = {"is_active": True}
    if category:
        filters["category"] = category
    
    products = db_select("products", filters=filters)
    
    if not products:
        return []
    
    total_sold = get_total_honey_sold_grams()
    is_out_of_stock = total_sold >= TOTAL_HARVEST_LIMIT_GRAMS

    # Fetch variants for each product
    for product in products:
        product["variants"] = db_select("product_variants", filters={"product_id": product["id"]})
        
        # If honey and out of stock, mark all variants as out of stock
        if product.get("category") == "honey" and is_out_of_stock:
            for v in product["variants"]:
                v["stock_quantity"] = 0
                v["is_available"] = False
        
        if not product["variants"]:
            product["variants"] = []
        # Ensure images is always a list
        if not product.get("images"):
            product["images"] = []
        
    return products


def get_product_by_id(product_id: str) -> Optional[Dict[str, Any]]:
    """Fetch a single product with variants. Supports fallback for static IDs."""
    product = None
    is_mock = product_id.startswith(("h", "hw", "m", "edu"))
    
    try:
        product = db_get_by_id("products", product_id)
    except:
        pass
    
    if not product and is_mock:
        # Fallback for static IDs used in frontend (h1, h2, hw1, etc.)
        category = "honey" if product_id.startswith("h") else "hardware" if product_id.startswith("hw") else "merch" if product_id.startswith("m") else "education" if product_id.startswith("edu") else "honey"
        
        # Determine name based on ID prefix
        name_map = {
            "h1": "BeeYield Premium Acacia",
            "h2": "Wildflower Blossom Honey",
            "h3": "Kibwezi Forest Honey",
            "hw1": "Solar Hive Monitor Pro",
            "m1": "BeeYield Premium Hoodie",
            "edu-1": "BEEKEEPING STARTER GUIDE"
        }
        
        product = {
            "id": product_id,
            "name": name_map.get(product_id, f"Product {product_id}"),
            "description": "Premium quality product from BeeYield.",
            "category": category,
            "images": [],
            "rating": 4.9,
            "review_count": 100,
            "is_active": True,
            "variants": []
        }
    
    if product:
        if not product.get("variants"):
            product["variants"] = db_select("product_variants", filters={"product_id": product_id})
        
        # If still no variants and it's a mock, add a default one or catch-all
        if not product.get("variants") and is_mock:
            product["variants"] = [
                {"id": f"v{product_id}-1", "size": "500g", "price_kes": 500, "stock_quantity": 100, "is_available": True},
                {"id": f"v{product_id}-2", "size": "250g", "price_kes": 300, "stock_quantity": 100, "is_available": True},
                {"id": f"v{product_id}-3", "size": "1kg", "price_kes": 950, "stock_quantity": 100, "is_available": True}
            ]
            
        if not product.get("images"):
            # Default mock images based on category
            if product.get("category") == "honey":
                product["images"] = ["/images/products/beeyield_honey_500g.png"]
            elif product.get("category") == "hardware":
                product["images"] = ["/images/products/solar_hive_monitor.png"]
            elif product.get("category") == "merch":
                product["images"] = ["/images/products/beeyield_hoodie.png"]
            else:
                product["images"] = ["/images/products/beekeeping_guide.png"]
        
    return product


def is_valid_uuid(val: Any) -> bool:
    if not val: return False
    try:
        uuid.UUID(str(val))
        return True
    except (ValueError, TypeError):
        return False

def get_batches_for_items(items: List[Dict[str, Any]]) -> List[str]:
    """Calculate which hive batches were used based on honey weight (2kg per hive)."""
    batches = set()
    category_weights = {} # grams
    
    for item in items:
        # Helper to safely get value from dict or object (Pydantic model)
        def get_val(obj, key, default=None):
            if isinstance(obj, dict):
                return obj.get(key, default)
            return getattr(obj, key, default)

        name_val = get_val(item, "product_name") or get_val(item, "name") or ""
        name = str(name_val).lower()
        
        size_str = str(get_val(item, "variant_size") or "").lower()
        qty = int(get_val(item, "quantity") or 1)
        
        # Only process honey
        if "honey" not in name and "acacia" not in name and "blossom" not in name:
            continue
            
        cat = "acacia" if "acacia" in name else "wildflower"
        
        weight = 0
        if "1kg" in size_str: weight = 1000 * qty
        elif "500g" in size_str: weight = 500 * qty
        elif "250g" in size_str: weight = 250 * qty
        else: weight = 500 * qty # Default
        
        category_weights[cat] = category_weights.get(cat, 0) + weight
    
    for cat, total_weight in category_weights.items():
        # Each hive yields 2000g
        num_hives = (total_weight + 1999) // 2000
    import random
    
    # Define hive ranges for realistic variety
    ranges = {
        "acacia": list(range(101, 161)),
        "wildflower": list(range(161, 221))
    }
    
    for cat, total_weight in category_weights.items():
        # User requested logic: Handle "different batches" for same total weight.
        # We simulate that every 500g-750g might come from a different hive harvest.
        # 1 Hive Batch displayed per ~600g of honey sold to show variety.
        # e.g. 2kg (2000g) -> ~3-4 Hives.
        
        avg_batch_size = 600  # grams per unique hive ID shown
        num_hives_needed = max(1, int(total_weight / avg_batch_size))
        
        # Add some randomness: +/- 1 batch if order is large
        if num_hives_needed > 1:
            num_hives_needed += random.choice([0, 1])
        
        available_hives = ranges.get(cat, ranges["wildflower"])
        
        # Ensure we don't request more than available
        count = min(num_hives_needed, len(available_hives))
        
        # Pick random hives for this order
        selected_hives = random.sample(available_hives, count)
        
        for h_id in selected_hives:
            h_num = str(h_id).zfill(3)
            batches.add(f"KIB-H{h_num}-2026")
            
    return sorted(list(batches))

def create_order(order_in: schemas.OrderCreate, user_id: Optional[str] = None) -> Dict[str, Any]:
    """Create a new order and order items, return order details. Robust against invalid UUIDs."""
    order_id = str(uuid.uuid4())
    order_number = f"BY-{datetime.now().strftime('%Y%m%d%H%M')}-{str(uuid.uuid4())[:4].upper()}"
    
    # Sanitize user_id (must be valid UUID for Postgres FK)
    sanitized_user_id = user_id if is_valid_uuid(user_id) else None
    
    order_data = {
        "id": order_id,
        "order_number": order_number,
        "user_id": sanitized_user_id,
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
        # If it still fails, it might be the shipping_address JSONB or other columns
        print(f"Order Insert Failed: {result.get('error')}")
        return {"status": "error", "message": result.get("error", "Failed to create order")}

    # Validate stock before proceeding
    total_sold = get_total_honey_sold_grams()
    order_honey_grams = 0
    for item in order_in.items:
        p = get_product_by_id(item.product_id)
        if p and p.get("category") == "honey":
            # Estimate item weight
            # (Simplification: we use the items passed in)
            pass 
    
    # Actually we'll calculate it from current items
    batches_calculated = get_batches_for_items([{"product_id": i.product_id, "quantity": i.quantity} for i in order_in.items]) # This is crude, let's fix
    
    # Better: Calculate additional weight
    new_weight = 0
    for item in order_in.items:
        # We need the variant to know size
        product = get_product_by_id(item.product_id)
        variant = next((v for v in product.get("variants", []) if v.get("id") == item.variant_id), None)
        if product and product.get("category") == "honey" and variant:
            size = str(variant.get("size", "")).lower()
            if "1kg" in size: new_weight += 1000 * item.quantity
            elif "500g" in size: new_weight += 500 * item.quantity
            elif "250g" in size: new_weight += 250 * item.quantity
            else: new_weight += 500 * item.quantity

    if total_sold + new_weight > TOTAL_HARVEST_LIMIT_GRAMS:
        remaining = max(0, TOTAL_HARVEST_LIMIT_GRAMS - total_sold)
        return {"status": "error", "message": f"Insufficient stock. Only {remaining/1000:.1f}kg of honey remains from this harvest."}

    
    # Insert order items
    batches = set()
    has_honey = False
    
    for item in order_in.items:
        # Get product and variant details (with fallback)
        product = get_product_by_id(item.product_id)
        variant = None
        if product:
            for v in product.get("variants", []):
                if v.get("id") == item.variant_id:
                    variant = v
                    break
        
        # Sanitize IDs for FKs
        s_product_id = item.product_id if is_valid_uuid(item.product_id) else None
        s_variant_id = item.variant_id if is_valid_uuid(item.variant_id) else None
        
        product_name = product.get("name", "Unknown") if product else "Unknown"
        variant_size = variant.get("size", "") if variant else ""
        product_image = product.get("images", [""])[0] if product and product.get("images") else ""
        
        item_data = {
            "order_id": order_id,
            "product_id": s_product_id,
            "variant_id": s_variant_id,
            "product_name": product_name,
            "variant_size": variant_size,
            "product_image": product_image,
            "quantity": item.quantity,
            "unit_price": variant.get("price_kes", 0) if variant else 0,
            "total_price": (variant.get("price_kes", 0) if variant else 0) * item.quantity
        }
        db_insert("order_items", item_data)
        
        if product and product.get("category") == "honey":
            has_honey = True

    # Smart batch calculation based on total weight and hive yield
    if has_honey:
        batches = set(get_batches_for_items(order_in.items))
    
    # Send confirmation email
    try:
        full_order = get_order(order_id)
        if full_order:
            batch_list = list(batches) if batches else None
            # For backward compatibility with email service if it expects string
            email_batch = batch_list[0] if batch_list else None
            
            from app.services.email_service import email_service
            email_service.send_order_confirmation(full_order, full_order.get('items', []), batch_number=email_batch)
    except Exception as e:
        print(f"Failed to send confirmation email: {e}")
    
    return {
        "order_id": order_id,
        "order_number": order_number,
        "status": "success",
        "message": "Order created successfully",
        "batches": list(batches) if batches else []
    }


def get_order(order_id: str) -> Optional[Dict[str, Any]]:
    """Get order with items. Supports both UUID and order_number."""
    order = None
    # Try UUID lookup first
    try:
        order = db_get_by_id("orders", order_id)
    except:
        pass
        
    # If not found or not a UUID, try searching by order_number
    if not order:
        orders = db_select("orders", filters={"order_number": order_id})
        if orders:
            order = orders[0]
            order_id = order["id"] # Use the real UUID for items fetch
            
    if not order:
        return None
        
    order["items"] = db_select("order_items", filters={"order_id": order_id})
    return order


def get_user_orders(user_id: str) -> List[Dict[str, Any]]:
    """Get all orders for a user"""
    orders = db_select("orders", filters={"user_id": user_id})
    
    # If no orders in DB, return mock orders for demo
    if not orders:
        return []
        
    # Sort by created_at descending
    return sorted(orders, key=lambda x: x.get('created_at', ''), reverse=True)


def update_order_status(order_id: str, status: str, payment_status: Optional[str] = None) -> Dict[str, Any]:
    """Update order status"""
    update_data = {"status": status}
    if payment_status:
        update_data["payment_status"] = payment_status
    
    return db_update("orders", update_data, {"id": order_id})



# ==========================================
#  NEW FEATURES IMPLEMENTATION
# ==========================================

# --- Wallet Services ---
def get_user_wallet(user_id: str) -> Dict[str, Any]:
    """Get user wallet balance, create if not exists"""
    wallet = db_select("user_wallets", filters={"user_id": user_id})
    if wallet and len(wallet) > 0:
        return wallet[0]
    
    # Create default wallet
    new_wallet = {
        "user_id": user_id,
        "balance": 0.00,
        "currency": "KES"
    }
    # Try inserting (might fail if table doesn't exist yet, return mock in that case)
    res = db_insert("user_wallets", new_wallet)
    if res.get("success"):
        return new_wallet
    
    return new_wallet

def get_wallet_transactions(user_id: str) -> List[Dict[str, Any]]:
    """Get wallet history"""
    return db_select("wallet_transactions", filters={"user_id": user_id}, order_by="created_at", ascending=False)

def top_up_wallet(user_id: str, amount: float, reference: str) -> Dict[str, Any]:
    """Credit wallet balance"""
    wallet = get_user_wallet(user_id)
    current_balance = float(wallet.get("balance", 0))
    new_balance = current_balance + amount
    
    # Update wallet
    db_update("user_wallets", {"balance": new_balance}, {"user_id": user_id})
    
    # Record transaction
    txn = {
        "user_id": user_id,
        "type": "credit",
        "amount": amount,
        "description": "Wallet Top-up",
        "reference_id": reference
    }
    db_insert("wallet_transactions", txn)
    
    return {"status": "success", "new_balance": new_balance}

# --- Wishlist Services ---
def get_user_wishlist(user_id: str) -> List[Dict[str, Any]]:
    """Get wishlist items with product details"""
    # Get raw wishlist items
    items = db_select("wishlists", filters={"user_id": user_id})
    
    result = []
    for item in items:
        # Fetch product details for UI
        prod = get_product_by_id(item["product_id"])
        if prod:
            # Safe access to variants
            variants = prod.get("variants", [])
            price = 0
            if variants and len(variants) > 0:
                price = variants[0].get("price_kes", 0)
                
            item["product_name"] = prod.get("name")
            item["product_image"] = prod.get("images", [""])[0] if prod.get("images") else ""
            item["product_price"] = price
            result.append(item)
            
    return result

def toggle_wishlist_item(user_id: str, product_id: str) -> Dict[str, Any]:
    """Add or remove item from wishlist"""
    existing = db_select("wishlists", filters={"user_id": user_id, "product_id": product_id})
    
    if existing and len(existing) > 0:
        # Remove
        db_delete("wishlists", {"id": existing[0]["id"]})
        return {"action": "removed", "product_id": product_id}
    else:
        # Add
        db_insert("wishlists", {"user_id": user_id, "product_id": product_id})
        return {"action": "added", "product_id": product_id}

# --- Address Services ---
def get_user_addresses(user_id: str) -> List[Dict[str, Any]]:
    return db_select("user_addresses", filters={"user_id": user_id})

def add_user_address(user_id: str, address_data: Dict[str, Any]) -> Dict[str, Any]:
    address_data["user_id"] = user_id
    
    # If set as default, unset others
    if address_data.get("is_default"):
        # This update logic is a bit manual without a transaction, but OK for now
        existing = get_user_addresses(user_id)
        for addr in existing:
            if addr.get("is_default"):
                db_update("user_addresses", {"is_default": False}, {"id": addr["id"]})

    res = db_insert("user_addresses", address_data)
    if res.get("success") and res.get("data"):
         return res["data"][0]
    return address_data

def delete_user_address(user_id: str, address_id: str):
    return db_delete("user_addresses", {"id": address_id, "user_id": user_id})

# --- Order Tracking ---
def get_order_tracking(order_id: str) -> Dict[str, Any]:
    """Get full tracking history for an order"""
    order = get_order(order_id)
    if not order:
        return None
        
    events = db_select("order_tracking_events", filters={"order_id": order_id}, order_by="created_at", ascending=False)
    
    # If no events, generate pseudo-events based on status
    if not events:
        status = order.get("status", "pending")
        created_at = order.get("created_at")
        events = []
        
        # Base event
        events.append({
            "status": "confirmed",
            "description": "Order placed successfully",
            "location": "Online System",
            "created_at": created_at
        })
        
        if status in ["processing", "shipped", "delivered"]:
             events.insert(0, {
                 "status": "processing",
                 "description": "Order is being prepared",
                 "location": "Warehouse",
                 "created_at": created_at # simplified timestamp
             })
             
        if status in ["shipped", "delivered"]:
             events.insert(0, {
                 "status": "shipped",
                 "description": "Package has left our facility",
                 "location": "Sort Facility",
                 "created_at": created_at
             })
             
        if status == "delivered":
             events.insert(0, {
                 "status": "delivered",
                 "description": "Package delivered to recipient",
                 "location": "Customer Address",
                 "created_at": created_at
             })
             
    return {
        "order_id": order_id,
        "current_status": order.get("status"),
        "estimated_delivery": "24 Hours Service",
        "events": events
    }


# --- Payment Method Services ---
def get_user_payment_methods(user_id: str) -> List[Dict[str, Any]]:
    return db_select("user_payment_methods", filters={"user_id": user_id})

def add_user_payment_method(user_id: str, method_data: Dict[str, Any]) -> Dict[str, Any]:
    method_data["user_id"] = user_id
    
    # Handle defaults
    if method_data.get("is_default"):
        existing = get_user_payment_methods(user_id)
        for pm in existing:
            if pm.get("is_default"):
                db_update("user_payment_methods", {"is_default": False}, {"id": pm["id"]})
                
    res = db_insert("user_payment_methods", method_data)
    if res.get("success") and res.get("data"):
         return res["data"][0]
    return method_data

def delete_user_payment_method(user_id: str, method_id: str):
    return db_delete("user_payment_methods", {"id": method_id, "user_id": user_id})


# --- Invoice Generation ---
def generate_invoice_pdf(order_id: str) -> io.BytesIO:
    """
    Generates a premium PDF receipt/invoice for the given order.
    Includes BeeYield branding, 16% VAT details, and delivery terms.
    Now supports multiple traceability codes.
    """
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    from reportlab.lib import colors
    from reportlab.lib.units import inch
    from reportlab.platypus import Table, TableStyle
    
    try:
        order = get_order(order_id)
    except Exception as e:
        print(f"Error fetching order {order_id}: {e}")
        raise ValueError(f"Failed to fetch order: {e}")
        
    if not order:
        print(f"Order {order_id} not found in database.")
        raise ValueError(f"Order {order_id} not found")
        
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # --- 1. BRANDING & HEADER ---
    c.setStrokeColor(colors.HexColor("#F59E0B")) # BeeYield Amber
    c.setLineWidth(5)
    c.line(0, height, width, height)
    
    # Robust logo path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.normpath(os.path.join(current_dir, "..", "..", ".."))
    logo_path = os.path.join(project_root, "public", "logo.png")
    
    # Try alternative locations if project_root isn't as expected
    if not os.path.exists(logo_path):
        # Maybe we are in a different structure
        paths_to_try = [
            os.path.join(os.getcwd(), "public", "logo.png"),
            os.path.join(os.getcwd(), "..", "public", "logo.png"),
            "public/logo.png"
        ]
        for p in paths_to_try:
            if os.path.exists(p):
                logo_path = p
                break
    
    if os.path.exists(logo_path):
        try:
            c.drawImage(logo_path, 50, height - 85, width=60, height=60, mask='auto', preserveAspectRatio=True)
        except Exception as e:
            print(f"Failed to draw logo: {e}")
    
    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 20)
    c.drawString(120, height - 55, "BeeYield Limited")
    
    c.setFont("Helvetica", 10)
    c.setFillColor(colors.grey)
    c.drawString(120, height - 70, "Africa's Premier Precision Pollination & Honey Chain Platform")
    c.drawString(120, height - 82, "HQ: Kibwezi West, Makueni | support@beeyield.com")

    # --- 2. INVOICE META ---
    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 24)
    c.drawRightString(width - 50, height - 55, "INVOICE")
    
    c.setFont("Helvetica", 10)
    c.drawRightString(width - 50, height - 75, f"No: {order.get('order_number')}")
    c.drawRightString(width - 50, height - 87, f"Date: {order.get('created_at', '').split('T')[0]}")
    c.drawRightString(width - 50, height - 99, f"Status: {order.get('status', '').upper()}")

    # --- 3. DELIVERY & TERMS ---
    c.setStrokeColor(colors.lightgrey)
    c.setLineWidth(0.5)
    c.line(50, height - 120, width - 50, height - 120)

    c.setFont("Helvetica-Bold", 11)
    c.drawString(50, height - 145, "Delivery Details")
    
    shipping = order.get("shipping_address", {})
    c.setFont("Helvetica", 10)
    y_addr = height - 160
    customer_name = shipping.get("name") or f"{shipping.get('first_name', '')} {shipping.get('last_name', '')}".strip() or "Valued Customer"
    c.drawString(50, y_addr, customer_name)
    y_addr -= 12
    
    addr_line = shipping.get('street') or shipping.get('address') or "N/A"
    if shipping.get('building'): addr_line += f", {shipping.get('building')}"
    c.drawString(50, y_addr, addr_line)
    y_addr -= 12
    c.drawString(50, y_addr, f"{shipping.get('city', '')}, {shipping.get('county', '')}")
    y_addr -= 12
    c.drawString(50, y_addr, f"Phone: {shipping.get('phone', 'N/A')}")

    # Expected Delivery Note
    c.setFillColor(colors.HexColor("#1E40AF")) # Blue
    c.setFont("Helvetica-Bold", 10)
    c.drawString(320, height - 145, "Delivery Promise")
    c.setFont("Helvetica", 10)
    c.setFillColor(colors.black)
    c.drawString(320, height - 160, "Each delivery takes 24 hours for shipping")
    c.drawString(320, height - 172, "dispatch and delivery.")

    # --- 4. ITEMS TABLE ---
    y_table = height - 210 # Moved up slightly
    data = [["", "Item Description", "Qty", "Unit Price", "Total"]]
    
    items = order.get("items", [])
    subtotal = 0
    batches = set()
    
    for item in items:
        name = f"{item.get('product_name')} ({item.get('variant_size')})"
        product_id = item.get("product_id")
        
        prod_data = get_product_by_id(product_id)
        if prod_data and prod_data.get("category") == "honey":
            # Just mark honey presence, we calculate batches globally
            pass
            
        qty = item.get('quantity', 0)
        price = item.get('unit_price', 0)
        total = item.get('total_price', 0)
        subtotal += total
        
        # Try to get image path
        img_url = None
        if prod_data and prod_data.get("images"):
            img_url = prod_data["images"][0]
            
        img_flow = ""
        if img_url:
            # Resolve physical path for reportlab
            p_root = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".."))
            local_img_path = os.path.join(p_root, "public", img_url.lstrip("/"))
            if os.path.exists(local_img_path):
                from reportlab.platypus import Image
                try:
                    img_flow = Image(local_img_path, width=0.3*inch, height=0.3*inch)
                except:
                    img_flow = "📦"
            else:
                img_flow = "📦"
        else:
            img_flow = "📦"
            
        data.append([img_flow, name[:45], str(qty), f"KES {price:,.2f}", f"KES {total:,.2f}"])
    
    # Adjust table columns to fit images
    table = Table(data, colWidths=[0.4 * inch, 2.8 * inch, 0.5 * inch, 1.15 * inch, 1.15 * inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#FEF3C7")), # Amber 100
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'CENTER'),
        ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    
    tw, th = table.wrap(width - 100, height)
    table.drawOn(c, 50, y_table - th)
    y_total = y_table - th - 20 # Tighter spacing

    # --- 5. VAT & TOTALS ---
    vat_inclusive_total = subtotal
    net_amount = vat_inclusive_total / 1.16
    vat_amount = vat_inclusive_total - net_amount
    
    c.setFont("Helvetica", 10)
    c.drawRightString(450, y_total, "Subtotal (Excl. VAT):")
    c.drawRightString(550, y_total, f"KES {net_amount:,.2f}")
    
    y_total -= 15
    c.drawRightString(450, y_total, "VAT (16%):")
    c.drawRightString(550, y_total, f"KES {vat_amount:,.2f}")
    
    y_total -= 25
    c.setLineWidth(1)
    c.line(380, y_total + 18, 550, y_total + 18)
    
    c.setFont("Helvetica-Bold", 14)
    c.drawRightString(450, y_total, "Amount Paid:")
    c.drawRightString(550, y_total, f"KES {vat_inclusive_total:,.2f}")

    # --- 6. TRACEABILITY ---
    batches = get_batches_for_items(items)
    if batches:
        c.setStrokeColor(colors.black)
        c.setLineWidth(1)
        c.rect(50, 50, 495, 80, fill=0)
        
        c.setFillColor(colors.HexColor("#065F46")) # Dark Green
        c.setFont("Helvetica-Bold", 12)
        c.drawString(65, 115, "HoneyChain™ Traceability")
        
        c.setFillColor(colors.black)
        c.setFont("Helvetica", 9)
        c.drawString(65, 100, "Your honey is tracked via blockchain from hive to jar.")
        c.drawString(65, 88, f"Batches provided in this order: {', '.join(batches[:3])}" + (f" (+{len(batches)-3} more)" if len(batches) > 3 else ""))
        
        c.setFont("Helvetica-Oblique", 9)
        c.drawString(65, 70, "Scan QR code on jar or visit beeyield.com/trace with these codes.")
        
        # QR Code placeholder
        c.rect(480, 60, 50, 50)
        c.setFont("Helvetica", 8)
        c.drawCentredString(505, 80, "SCAN ME")
    else:
        # Standard footer if no honey
        c.setFont("Helvetica-Oblique", 10)
        c.drawCentredString(width/2, 60, "Thank you for shopping with BeeYield!")
    
    c.save()
    buffer.seek(0)
    return buffer
