from fastapi import APIRouter, Depends, HTTPException, Header
from typing import List, Optional
from jose import jwt, JWTError
from app.core.config import settings
from app.core import security
from app.schemas import shop as schemas
from app.services import payment, shop_service
from app.db.clickhouse_db import track_order_event

router = APIRouter()

@router.get("/products", response_model=List[schemas.Product])
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
    authorization: Optional[str] = Header(None)
):
    """
    Initialize payment for order.
    """
    user_id = None
    if authorization:
        try:
            token = authorization.split(" ")[1]
            # Decode and verify the JWT token signature
            # Using Supabase JWT secret for verification
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[security.ALGORITHM])
            user_id = payload.get("sub")
        except JWTError as e:
            print(f"JWT verification failed: {e}")
            # Invalid token - proceed without user_id (anonymous order)
        except Exception as e:
            print(f"Auth token decode error: {e}")

    order_result = shop_service.create_order(order_in, user_id=user_id)
    
    if order_result["status"] == "error":
        raise HTTPException(status_code=500, detail=order_result["message"])

    order_id = order_result["order_id"]
    order_number = order_result["order_number"]
    
    try:
        track_order_event(order_id, "created", 0.0)
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

@router.post("/checkout/callback/mpesa")
def mpesa_callback(payload: dict):
    """
    Handle M-Pesa payment callback.
    """
    print(f"M-Pesa Callback received: {payload}")
    # Logic to update order status in Supabase based on callback data
    return {"status": "success"}
