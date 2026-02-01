"""
Shop Service - Connected to Supabase
"""
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
from app.db.supabase_db import db_select, db_insert, db_get_by_id, db_update
from app.schemas import shop as schemas



# Products and orders now come exclusively from the database.


def get_products(category: Optional[str] = None) -> List[Dict[str, Any]]:
    """Fetch all active products with their variants from Supabase"""
    filters = {"is_active": True}
    if category:
        filters["category"] = category
    
    products = db_select("products", filters=filters)
    
    if not products:
        return []
    
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
    
    # Send confirmation email
    try:
        # Check if order contains honey to assign a batch number
        batch_number = None
        has_honey = False
        
        # We need to know the category of items for this check
        # Since we just inserted them, we can check the products we looked up.
        # But we didn't store the full product info in the loop above in a way we can easily access outside without re-fetching.
        # To avoid re-fetching, let's just do a quick check on the order_in items against the DB/Mock products again or assume for now.
        # A better way is to fetch the full order we just created which has everything.
        
        full_order = get_order(order_id)
        if full_order:
            # Check for honey in items
            for item in full_order.get('items', []):
                # We need to join with products to know the category, or check if we store category in order_items (we don't currently)
                # Let's fetch the product details for each item to check category
                prod = get_product_by_id(item['product_id'])
                if prod and prod.get('category') == 'honey':
                    has_honey = True
                    break
            
            if has_honey:
                # Assign a batch number for traceability
                # In a real system, this would come from inventory management
                batch_number = "DEMO-001" 
            
            from app.services.email_service import email_service
            email_service.send_order_confirmation(full_order, full_order.get('items', []), batch_number=batch_number)
             
    except Exception as e:
        print(f"Failed to send confirmation email: {e}")
    
    return {
        "order_id": order_id,
        "order_number": order_number,
        "status": "success",
        "message": "Order created successfully"
    }


def get_order(order_id: str) -> Optional[Dict[str, Any]]:
    """Get order with items"""
    order = db_get_by_id("orders", order_id)
    if not order:
        return None
        
    if order:
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

    orders = db_select("orders", filters={"user_id": user_id}, order_by="created_at", ascending=False)
    for order in orders:
        order["items"] = db_select("order_items", filters={"order_id": order["id"]})
    return orders


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
        "estimated_delivery": "3-5 Business Days",
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
def generate_invoice_pdf(order_id: str) -> str:
    """
    Generates a PDF invoice for the given order and returns the file path or bytes.
    For this implementation, we will return the bytes directly via a buffer for StreamingResponse.
    """
    import io
    import os
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    from reportlab.lib import colors
    from reportlab.lib.units import inch
    
    order = get_order(order_id)
    if not order:
        raise ValueError("Order not found")
        
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # 1. Header & Logo

    current_dir = os.path.dirname(os.path.abspath(__file__))
    # path from backend/app/services/shop_service.py to public/logo.png
    # Services -> App -> Backend -> Root -> Public
    logo_path = os.path.join(current_dir, "..", "..", "..", "public", "logo.png")
    logo_path = os.path.normpath(logo_path)
    
    if os.path.exists(logo_path):
        c.drawImage(logo_path, 50, height - 70, width=50, height=50, mask='auto', preserveAspectRatio=True)
    else:
        # Fallback to text logo
        print(f"Warning: Logo not found at {logo_path}")
        c.setFont("Helvetica-Bold", 24)
        c.setFillColor(colors.orange) # BeeYield Theme
        c.drawString(50, height - 50, "BeeYield")
    
    c.setFont("Helvetica", 10)
    c.setFillColor(colors.black)
    x_offset = 110 if os.path.exists(logo_path) else 50
    c.drawString(x_offset, height - 40, "BeeYield Limited")
    c.drawString(x_offset, height - 52, "Africa's Biggest Beekeeping Platform")
    c.drawString(x_offset, height - 64, "Kibwezi, Kenya")
    c.drawString(x_offset, height - 76, "support@beeyield.com")

    
    # 2. Invoice Details
    c.setFont("Helvetica-Bold", 16)
    c.drawString(400, height - 50, "INVOICE")
    
    c.setFont("Helvetica", 12)
    c.drawString(400, height - 70, f"Order #: {order.get('order_number')}")
    c.drawString(400, height - 85, f"Date: {order.get('created_at', '').split('T')[0]}")
    c.drawString(400, height - 100, f"Status: {order.get('status', '').upper()}")

    # 3. Bill To
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, height - 140, "Bill To:")
    
    shipping = order.get("shipping_address", {})
    if isinstance(shipping, dict):
        c.setFont("Helvetica", 12)
        c.drawString(50, height - 160, shipping.get("name") or shipping.get("first_name") or "Customer")
        
        # Build address strings
        line1 = shipping.get('street', '')
        if shipping.get('building'):
             line1 += f", {shipping.get('building')}"
             
        line2 = ""
        if shipping.get('floor'):
             line2 += f"Floor {shipping.get('floor')}, "
        if shipping.get('apartment'):
             line2 += f"{shipping.get('apartment')}"
        
        line3 = f"{shipping.get('city', '')}, {shipping.get('county', '')}"
        if shipping.get('postal_code'):
             line3 += f" {shipping.get('postal_code')}"
             
        c.drawString(50, height - 175, line1)
        if line2:
            c.drawString(50, height - 190, line2)
            y_next = height - 205
        else:
            y_next = height - 190
            
        c.drawString(50, y_next, line3)
        c.drawString(50, y_next - 15, shipping.get('phone', ''))

    
    # 4. Items Table Header
    y = height - 250
    c.setFillColor(colors.lightgrey)
    c.rect(50, y, 500, 20, fill=True, stroke=False)
    
    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(60, y + 6, "Item Description")
    c.drawString(300, y + 6, "Qty")
    c.drawString(350, y + 6, "Unit Price")
    c.drawString(450, y + 6, "Total")
    
    y -= 25
    
    # 5. Items List
    total_amount = 0
    items = order.get("items", [])
    
    c.setFont("Helvetica", 10)
    for item in items:
        name = f"{item.get('product_name')} ({item.get('variant_size')})"
        qty = item.get('quantity', 0)
        price = item.get('unit_price', 0)
        total = item.get('total_price', 0)
        total_amount += total
        
        c.drawString(60, y, name[:40]) # Truncate if long
        c.drawString(300, y, str(qty))
        c.drawString(350, y, f"KES {price:,.2f}")
        c.drawString(450, y, f"KES {total:,.2f}")
        y -= 20
        
        if y < 100: # New page if needed
            c.showPage()
            y = height - 50
            
    # 6. Total
    y -= 10
    c.line(50, y, 550, y)
    y -= 25
    c.setFont("Helvetica-Bold", 12)
    c.drawString(350, y, "Grand Total:")
    c.drawString(450, y, f"KES {total_amount:,.2f}")
    
    # 7. Footer
    c.setFont("Helvetica-Oblique", 10)
    c.drawCentredString(width/2, 50, "Thank you for shopping with BeeYield!")
    
    c.save()
    buffer.seek(0)
    return buffer

