from fastapi import APIRouter, Depends, HTTPException, Header, Request
from typing import Optional, Any, List
from jose import jwt
from app.core.config import settings
from app.core import security
from app.schemas import shop as schemas
from app.services import payment, shop_service
from app.db.clickhouse_db import track_order_event

router = APIRouter()

def get_token(request: Request) -> Optional[str]:
    """Extract raw token from Authorization header"""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    return None

@router.get("/products", response_model=list[schemas.Product])
async def get_products(category: Optional[str] = None, token: Optional[str] = Depends(get_token)):
    """
    Get all active products, optionally filtered by category.
    """
    products = await shop_service.get_products(category, token=token)
    return products

@router.get("/products/{product_id}", response_model=schemas.Product)
async def get_product_detail(product_id: str, token: Optional[str] = Depends(get_token)):
    """
    Get single product details.
    """
    product = await shop_service.get_product_by_id(product_id, token=token)
    if not product:
         raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/cart/add", response_model=dict)
async def add_to_cart(item: schemas.CartItemAdd):
    """
    Add item to session cart.
    """
    return {"status": "success", "message": "Item added to cart"}

@router.post("/checkout/init", response_model=dict)
async def initialize_checkout(
    order_in: schemas.OrderCreate,
    current_user: Optional[dict] = Depends(security.get_optional_current_user),
    token: Optional[str] = Depends(get_token)
):
    """
    Initialize payment for order.
    """
    # Robust bypass check
    raw_phone = str(order_in.shipping_address.get("phone", ""))
    clean_phone = "".join(filter(str.isdigit, raw_phone))
    
    # Check if phone matches configured admin bypass (if set)
    # Checks last 9 digits (e.g. 742...) to handle +254/07 variations if ADMIN_BYPASS_PHONE is set
    bypass_ph = settings.ADMIN_BYPASS_PHONE
    is_bypass = False
    if bypass_ph and len(clean_phone) >= 9:
        is_bypass = clean_phone.endswith(bypass_ph[-9:]) or (bypass_ph in str(order_in.dict()))
    
    if settings.DEBUG:
        print(f"DEBUG: Initialize Checkout - User: {current_user}, Bypass: {is_bypass}, Phone: {raw_phone}")
    
    user_id = None
    if is_bypass:
        user_id = None # Guest/System order
        order_in.total_kes = 0 # Force 0 for bypass
    elif not current_user:
        raise HTTPException(
            status_code=401, 
            detail="Authentication required for checkout. Please sign in."
        )
    else:
        user_id = current_user.get("sub")
    
    # SECURITY: Validate price on server
    calculated_total = 0
    for item in order_in.items:
        product = await shop_service.get_product_by_id(item.product_id, token=token)
        if not product:
            raise HTTPException(status_code=400, detail=f"Product {item.product_id} not found")
        
        variant = next((v for v in product.get("variants", []) if v.get("id") == item.variant_id), None)
        if not variant and product.get("id", "").startswith(("h", "hw", "m", "edu")):
            variant = product.get("variants", [{}])[0]
            
        if not variant:
            raise HTTPException(status_code=400, detail=f"Variant {item.variant_id} not found")
        
        calculated_total += variant.get("price_kes", 0) * item.quantity
    
    # Price mismatch check (not for bypass)
    if not is_bypass and calculated_total > order_in.total_kes + 1:
        raise HTTPException(
            status_code=400, 
            detail=f"Price mismatch. Minimum required {calculated_total}, got {order_in.total_kes}."
        )

    order_result = await shop_service.create_order(order_in, user_id=user_id, token=token)
    if order_result["status"] == "error":
        raise HTTPException(status_code=500, detail=order_result["message"])

    order_id = order_result["order_id"]
    order_number = order_result["order_number"]
    
    try:
        track_order_event(order_id, "created", float(order_in.total_kes))
    except Exception as e:
        pass

    payment_response = {}
    if is_bypass:
        payment_response = {"message": "Bypass active. Order confirmed.", "status": "completed"}
    elif order_in.payment_method == "mpesa":
        phone = order_in.shipping_address.get("phone", "254700000000")
        payment_response = payment.init_mpesa_payment(phone, order_in.total_kes, order_number)
    elif order_in.payment_method == "card":
        payment_response = payment.init_stripe_payment(order_in.total_kes)
    else:
        payment_response = {"message": "Order created, payment pending"}

    return {
        **order_result,
        "payment_info": payment_response
    }

@router.get("/orders", response_model=list[schemas.Order])
async def get_user_orders(
    email: Optional[str] = None,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """
    Get orders for the current user.
    """
    user_id = current_user.get("sub")
    orders = await shop_service.get_user_orders(user_id=user_id, token=token)
    return orders

@router.get("/orders/{order_id}", response_model=schemas.Order)
async def get_order_detail(
    order_id: str,
    current_user: Optional[dict] = Depends(security.get_optional_current_user),
    token: Optional[str] = Depends(get_token)
):
    """
    Get full order details including items.
    """
    # Security check: If logged in, must own the order or be guest bypass
    order = await shop_service.get_order(order_id, token=token)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    user_id = current_user.get("sub") if current_user else None
    
    # If it's a guest user (no auth), allow if order belongs to no user (guest order)
    if not current_user:
        if order.get("user_id") is not None:
             raise HTTPException(status_code=403, detail="Access denied")
    else:
        # If logged in, must own the order
        if str(order.get("user_id")) != str(user_id):
             raise HTTPException(status_code=403, detail="Access denied")
             
    return order

# ==========================================
#  NEW ENDPOINTS
# ==========================================

# --- Wallet ---
@router.get("/wallet", response_model=schemas.Wallet)
async def get_wallet(current_user: dict = Depends(security.get_current_user), token: Optional[str] = Depends(get_token)):
    user_id = current_user.get("sub")
    return await shop_service.get_user_wallet(user_id, token=token)

@router.get("/wallet/transactions", response_model=list[schemas.WalletTransaction])
async def get_transactions(current_user: dict = Depends(security.get_current_user), token: Optional[str] = Depends(get_token)):
    user_id = current_user.get("sub")
    return await shop_service.get_wallet_transactions(user_id, token=token)

@router.post("/wallet/topup")
async def top_up_wallet(
    amount: float, 
    reference: str = "Self-Topup",
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    user_id = current_user.get("sub")
    return await shop_service.top_up_wallet(user_id, amount, reference, token=token)

# --- Wishlist ---
@router.get("/wishlist", response_model=list[schemas.WishlistItem])
async def get_wishlist(current_user: dict = Depends(security.get_current_user), token: Optional[str] = Depends(get_token)):
    user_id = current_user.get("sub")
    return await shop_service.get_user_wishlist(user_id, token=token)

@router.post("/wishlist/{product_id}")
async def toggle_wishlist(
    product_id: str,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    user_id = current_user.get("sub")
    return await shop_service.toggle_wishlist_item(user_id, product_id, token=token)

# --- Addresses ---
@router.get("/addresses", response_model=list[schemas.Address])
async def get_addresses(current_user: dict = Depends(security.get_current_user), token: Optional[str] = Depends(get_token)):
    user_id = current_user.get("sub")
    return await shop_service.get_user_addresses(user_id, token=token)

@router.post("/addresses", response_model=schemas.Address)
async def add_address(
    address_in: schemas.AddressCreate,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    user_id = current_user.get("sub")
    return await shop_service.add_user_address(user_id, address_in.dict(), token=token)

@router.delete("/addresses/{address_id}")
async def delete_address(
    address_id: str,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    user_id = current_user.get("sub")
    await shop_service.delete_user_address(user_id, address_id, token=token)
    return {"status": "success"}

# --- Tracking ---
@router.get("/orders/{order_id}/tracking", response_model=schemas.TrackingInfo)
async def track_order(
    order_id: str,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    user_id = current_user.get("sub")
    orders = await shop_service.get_user_orders(user_id, token=token)
    if not any(str(o["id"]) == str(order_id) for o in orders):
         raise HTTPException(status_code=403, detail="Order not found or access denied")

    info = await shop_service.get_order_tracking(order_id, token=token)
    if not info:
        raise HTTPException(status_code=404, detail="Tracking info not found")
    return info

# --- Suggestions ---
@router.get("/suggestions", response_model=list[schemas.Product])
async def get_suggestions(current_user: dict = Depends(security.get_current_user), token: Optional[str] = Depends(get_token)):
    """
    Get personalized suggestions.
    For MVP, we shuffle products or pick 'Featured'.
    """
    all_products = await shop_service.get_products(token=token)
    # Simple Shuffle for variety
    import random
    random.shuffle(all_products)
    return all_products[:4]

# --- Payment Methods ---
@router.get("/payment-methods", response_model=list[schemas.PaymentMethod])
async def get_payment_methods(current_user: dict = Depends(security.get_current_user), token: Optional[str] = Depends(get_token)):
    user_id = current_user.get("sub")
    return await shop_service.get_user_payment_methods(user_id, token=token)

@router.post("/payment-methods", response_model=schemas.PaymentMethod)
async def add_payment_method(
    method_in: schemas.PaymentMethodCreate,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    user_id = current_user.get("sub")
    return await shop_service.add_user_payment_method(user_id, method_in.dict(), token=token)

@router.delete("/payment-methods/{method_id}")
async def delete_payment_method(
    method_id: str,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    user_id = current_user.get("sub")
    await shop_service.delete_user_payment_method(user_id, method_id, token=token)
    return {"status": "success"}

# --- Invoice ---
@router.get("/orders/{order_id}/invoice")
async def download_invoice(
    order_id: str,
    current_user: Optional[dict] = Depends(security.get_optional_current_user),
    token: Optional[str] = Depends(get_token)
):
    """Download PDF Invoice"""
    from fastapi.responses import StreamingResponse
    
    # Security check
    user_id = current_user.get("sub") if current_user else None
    
    order = await shop_service.get_order(order_id, token=token)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # If it's a guest user, allow if order has no user_id
    if not current_user:
        if order.get("user_id") is not None:
             raise HTTPException(status_code=403, detail="Access denied")
    else:
        # If logged in, must own the order
        if str(order.get("user_id")) != str(user_id):
             raise HTTPException(status_code=403, detail="Access denied")
          
    try:
        pdf_buffer = await shop_service.generate_invoice_pdf(order_id, token=token)
        return StreamingResponse(
            pdf_buffer, 
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=Invoice-{order_id}.pdf"}
        )
    except Exception as e:
        print(f"Invoice Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate invoice")
