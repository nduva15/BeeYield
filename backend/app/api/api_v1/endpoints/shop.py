from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from typing import Optional
import random
from app.core import security
from app.schemas import shop as schemas
from app.services import mpesa_c2b, shop_service
from app.db.supabase_db import db_select


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
    # 1. Identity Extraction (API concerns)
    user_id = current_user.get("sub") if current_user else None
    
    # 2. Preliminary Validation
    if not user_id:
        # Check for bypass in service layer via order_result, 
        # but for now we require auth unless we're in a bypass state
        pass # Will be handled by service layer's logic if we want to allow guest checkouts

    order_result = await shop_service.create_order(order_in, user_id=user_id, token=token)
    if order_result["status"] == "error":
        # Check if it was an auth error
        if "Authentication required" in str(order_result.get("message", "")):
             raise HTTPException(status_code=401, detail=order_result["message"])
        raise HTTPException(status_code=500, detail=order_result["message"])

    return {
        **order_result,
        "payment_info": order_result.get("payment_info", {})
    }

@router.post("/checkout/callback/mpesa")
async def mpesa_callback(payload: dict):
    """
    Public webhook for Safaricom Daraja API.
    Delegates validation to the Rust ShopEngine.
    """
    return await shop_service.process_mpesa_callback(payload)


@router.post("/checkout/c2b/validation")
async def mpesa_c2b_validation(request: Request, payload: dict):
    """Validate incoming M-Pesa C2B webhooks before confirmation."""
    return await mpesa_c2b.validate_c2b(request, payload)


@router.post("/checkout/c2b/confirmation")
async def mpesa_c2b_confirmation(request: Request, payload: dict):
    """Persist and route M-Pesa C2B confirmations."""
    return await mpesa_c2b.confirm_c2b(request, payload)

@router.get("/checkout/status/{idempotency_key}")
async def get_checkout_status(idempotency_key: str, token: Optional[str] = Depends(get_token)):
    """
    Poll point for frontend to check if M-Pesa callback landed.
    """
    filters = {"idempotency_key": idempotency_key}
    results = await db_select("billing_ledger", filters=filters, token=token)
    if results:
        tx = results[0]
        return {
            "status": tx.get("payment_status"),
            "transaction_id": tx.get("id"),
            "paid": tx.get("payment_status") == "completed"
        }
    return {"status": "not_found", "paid": False}

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


@router.get("/dashboard", response_model=schemas.ShopDashboardSummary)
async def get_dashboard_summary(
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    user_id = current_user.get("sub")
    return await shop_service.get_dashboard_summary(user_id, token=token)

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

#  NEW ENDPOINTS
# ==========================================

@router.post("/checkout/coupon/validate", response_model=schemas.CouponValidationResult)
async def validate_coupon(
    coupon_in: schemas.CouponValidationRequest,
    token: Optional[str] = Depends(get_token)
):
    """Validate a coupon code via the Rust engine"""
    return await shop_service.apply_coupon_code(coupon_in.code, coupon_in.amount)

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

@router.put("/addresses/{address_id}", response_model=schemas.Address)
async def update_address(
    address_id: str,
    address_in: schemas.AddressCreate, # Using same schema for update for simplicity
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    user_id = current_user.get("sub")
    return await shop_service.update_user_address(user_id, address_id, address_in.dict(), token=token)

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
    For MVP, we shuffle products or pick 'Featured'.
    """
    all_products = await shop_service.get_products(token=token)
    # Simple Shuffle for variety
    if all_products:
        random.shuffle(all_products)
        return all_products[:4]
    return []

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


@router.put("/payment-methods/{method_id}", response_model=schemas.PaymentMethod)
async def update_payment_method(
    method_id: str,
    method_in: schemas.PaymentMethodUpdate,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    user_id = current_user.get("sub")
    return await shop_service.update_user_payment_method(user_id, method_id, method_in.dict(), token=token)


@router.post("/orders/{order_id}/cancel", response_model=schemas.Order)
async def cancel_order(
    order_id: str,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    user_id = current_user.get("sub")
    try:
        return await shop_service.cancel_order(user_id, order_id, token=token)
    except ValueError as exc:
        message = str(exc)
        status_code = 404 if message == "Order not found" else 400
        raise HTTPException(status_code=status_code, detail=message)

# --- Invoice ---
@router.get("/orders/{order_id}/invoice")
async def download_invoice(
    order_id: str,
    current_user: Optional[dict] = Depends(security.get_optional_current_user),
    token: Optional[str] = Depends(get_token)
):
    """Download PDF Invoice"""
    
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
