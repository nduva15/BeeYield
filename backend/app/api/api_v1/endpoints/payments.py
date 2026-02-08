"""
Stripe Payment Endpoints
Secure card management and checkout with Stripe
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from pydantic import BaseModel
from app.core.config import settings
from app.core import security
import stripe

router = APIRouter()

# Initialize Stripe with the secret key
if settings.STRIPE_SECRET_KEY:
    stripe.api_key = settings.STRIPE_SECRET_KEY


class PaymentIntentRequest(BaseModel):
    amount: float  # Amount in KES
    currency: str = "kes"


class SetupIntentRequest(BaseModel):
    pass  # No params needed for setup intent


class ConfirmPaymentRequest(BaseModel):
    payment_intent_id: str
    order_id: str


@router.post("/create-payment-intent")
def create_payment_intent(
    request: PaymentIntentRequest,
    current_user: dict = Depends(security.get_current_user)
):
    """
    Create a Stripe PaymentIntent for checkout.
    Returns client_secret for frontend to complete payment.
    """
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(
            status_code=503,
            detail="Stripe is not configured. Please contact support."
        )
    
    try:
        # Convert KES to USD cents for Stripe (approximate rate)
        # In production, use a real exchange rate API
        kes_to_usd = 0.0065  # Approximate rate: 1 KES = 0.0065 USD
        amount_usd = request.amount * kes_to_usd
        
        # Stripe requires minimum 50 cents for USD
        amount_cents = max(50, int(amount_usd * 100))
        
        # For KES, we can use amount directly in cents (1 KES = 100 cents)
        if request.currency.lower() == 'kes':
            amount_cents = int(request.amount * 100)
            currency = 'kes'
        else:
            currency = 'usd'
        
        user_id = current_user.get("sub")
        user_email = current_user.get("email", "")
        
        intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency=currency,
            metadata={
                "user_id": user_id,
                "user_email": user_email,
            },
            automatic_payment_methods={
                "enabled": True,
            },
        )
        
        return {
            "client_secret": intent.client_secret,
            "payment_intent_id": intent.id,
        }
        
    except stripe.error.StripeError as e:
        print(f"Stripe Error: {e}")
        raise HTTPException(
            status_code=400,
            detail=f"Payment initialization failed: {str(e)}"
        )
    except Exception as e:
        print(f"Payment Error: {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while creating payment"
        )


@router.post("/create-setup-intent")
def create_setup_intent(
    current_user: dict = Depends(security.get_current_user)
):
    """
    Create a Stripe SetupIntent for saving card without immediate payment.
    Used in the Payment Methods section to add cards.
    """
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(
            status_code=503,
            detail="Stripe is not configured. Please contact support."
        )
    
    try:
        user_id = current_user.get("sub")
        
        # Check if customer already exists, or create one
        # For now, we'll just create a SetupIntent without a customer
        intent = stripe.SetupIntent.create(
            metadata={
                "user_id": user_id,
            },
            usage="off_session",  # Allow using the card for future payments
        )
        
        return {
            "client_secret": intent.client_secret,
            "setup_intent_id": intent.id,
        }
        
    except stripe.error.StripeError as e:
        print(f"Stripe Error: {e}")
        raise HTTPException(
            status_code=400,
            detail=f"Card setup failed: {str(e)}"
        )
    except Exception as e:
        print(f"Setup Error: {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while setting up card"
        )


@router.post("/confirm-payment")
def confirm_payment(
    request: ConfirmPaymentRequest,
    current_user: dict = Depends(security.get_current_user)
):
    """
    Confirm that a payment was successful and update order status.
    """
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(
            status_code=503,
            detail="Stripe is not configured"
        )
    
    try:
        # Retrieve the payment intent to verify status
        intent = stripe.PaymentIntent.retrieve(request.payment_intent_id)
        
        if intent.status == "succeeded":
            # Update order status in database
            from app.services.shop_service import update_order_status
            update_order_status(
                request.order_id, 
                status="paid",
                payment_status="completed"
            )
            
            return {
                "status": "success",
                "message": "Payment confirmed",
                "payment_status": intent.status,
            }
        else:
            return {
                "status": "pending",
                "message": f"Payment status: {intent.status}",
                "payment_status": intent.status,
            }
            
    except stripe.error.StripeError as e:
        print(f"Stripe Error: {e}")
        raise HTTPException(
            status_code=400,
            detail=f"Payment verification failed: {str(e)}"
        )
    except Exception as e:
        print(f"Confirm Error: {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while confirming payment"
        )


@router.post("/webhook")
async def stripe_webhook(request_body: bytes = Depends(lambda r: r.body())):
    """
    Handle Stripe webhooks for async payment events.
    """
    if not settings.STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=503, detail="Webhook not configured")
    
    # This would be implemented for production to handle async events
    # For now, we handle payments synchronously
    return {"received": True}
