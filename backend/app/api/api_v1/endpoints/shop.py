from fastapi import APIRouter, Depends, HTTPException, Header
from typing import Optional, Any
from jose import jwt
from app.core.config import settings
from app.core import security
from app.schemas import shop as schemas
from app.services import payment, shop_service
from app.db.clickhouse_db import track_order_event

router = APIRouter()

@router.get("/products", response_model=list[schemas.Product])
def get_products(category: Optional[str] = None):
    """
    Get all active products, optionally filtered by category.
    """
    products = shop_service.get_products(category)
    return products

@router.get("/products/{product_id}", response_model=schemas.Product)
def get_product_detail(product_id: str):
    """
    Get single product details.
    """
    product = shop_service.get_product_by_id(product_id)
    if not product:
         raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/cart/add", response_model=dict)
def add_to_cart(item: schemas.CartItemAdd):
    """
    Add item to session cart.
    """
    return {"status": "success", "message": "Item added to cart"}

@router.post("/checkout/init", response_model=dict)
def initialize_checkout(
    order_in: schemas.OrderCreate,
    current_user: dict = Depends(security.get_current_user)
):
    """
    Initialize payment for order.
    Requires authentication.
    """
    user_id = current_user.get("sub")
    
    # SECURITY: Validate price on server (Don't do math on the phone!)
    calculated_total = 0
    for item in order_in.items:
        # Fetch actual product/variant from DB to get real price
        product = shop_service.get_product_by_id(item.product_id)
        if not product:
            raise HTTPException(status_code=400, detail=f"Product {item.product_id} not found")
        
        variant = next((v for v in product.get("variants", []) if v.get("id") == item.variant_id), None)
        if not variant:
            raise HTTPException(status_code=400, detail=f"Variant {item.variant_id} not found")
        
        calculated_total += variant.get("price_kes", 0) * item.quantity
    
    # Check if the provided total matches what the server calculated
    if abs(calculated_total - order_in.total_kes) > 0.01:
        raise HTTPException(
            status_code=400, 
            detail=f"Price mismatch. Expected {calculated_total}, got {order_in.total_kes}. Logic must live on the server!"
        )

    order_result = shop_service.create_order(order_in, user_id=user_id)
    
    if order_result["status"] == "error":
        raise HTTPException(status_code=500, detail=order_result["message"])

    order_id = order_result["order_id"]
    order_number = order_result["order_number"]
    
    try:
        track_order_event(order_id, "created", float(order_in.total_kes))
    except Exception as e:
        print(f"ClickHouse tracking failed: {e}")

    total_amount = order_in.total_kes
    
    payment_response = {}
    if order_in.payment_method == "mpesa":
        # Get phone from shipping address
        phone = order_in.shipping_address.get("phone", "254700000000")
        payment_response = payment.init_mpesa_payment(phone, total_amount, order_number)
    elif order_in.payment_method == "card":
        payment_response = payment.init_stripe_payment(total_amount)
    else:
        payment_response = {"message": "Order created, payment pending"}

    return {
        **order_result,
        "payment_info": payment_response
    }

@router.get("/orders", response_model=list[schemas.Order])
def get_user_orders(
    email: Optional[str] = None,
    current_user: dict = Depends(security.get_current_user)
):
    """
    Get orders for the current user.
    """
    user_id = current_user.get("sub")
    # In a real app, we'd filter by user_id. 
    # For now, if email is provided, verify it matches or just use user_id.
    filters = {"user_id": user_id}
    orders = shop_service.get_user_orders(user_id=user_id)
    return orders
