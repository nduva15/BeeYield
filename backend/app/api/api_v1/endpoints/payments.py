"""
Stripe Payment Endpoints
Secure card management and checkout with Stripe
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from typing import Optional
from pydantic import BaseModel
from app.core.config import settings
from app.core import security
import stripe
import logging

# Import shop service for order updates
from app.services.shop_service import update_order_status

router = APIRouter()
logger = logging.getLogger(__name__)

def get_token(request: Request) -> Optional[str]:
    """Extract raw token from Authorization header"""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    return None

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


class InvoiceSendRequest(BaseModel):
    order_id: str
    recipient_email: Optional[str] = None
    include_traceability: bool = True


@router.post("/create-payment-intent")
async def create_payment_intent(
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
        # Note: In production, use a real-time exchange rate API service
        # for accurate currency conversion
        kes_to_usd = 0.0069  # Approximate rate: 1 KES = 0.0069 USD
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
        logger.error(f"Stripe payment intent error: {type(e).__name__}")
        raise HTTPException(
            status_code=400,
            detail="Payment initialization failed. Please try again."
        )
    except Exception as e:
        logger.error(f"Unexpected payment error: {type(e).__name__}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while creating payment"
        )


@router.post("/create-setup-intent")
async def create_setup_intent(
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
        logger.error(f"Stripe setup intent error: {type(e).__name__}")
        raise HTTPException(
            status_code=400,
            detail="Card setup failed. Please try again."
        )
    except Exception as e:
        logger.error(f"Unexpected setup error: {type(e).__name__}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while setting up card"
        )


@router.post("/confirm-payment")
async def confirm_payment(
    request: ConfirmPaymentRequest,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
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
            await update_order_status(
                request.order_id, 
                status="paid",
                payment_status="completed",
                token=token
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
        logger.error(f"Stripe payment confirm error: {type(e).__name__}")
        raise HTTPException(
            status_code=400,
            detail="Payment verification failed. Please try again."
        )
    except Exception as e:
        logger.error(f"Unexpected confirm error: {type(e).__name__}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while confirming payment"
        )


@router.post("/webhook")
async def stripe_webhook(request_body: bytes = Depends(lambda r: r.body())):
    """
    Handle Stripe webhooks for async payment events.
    Note: This is a placeholder. For production, implement signature verification
    using stripe.Webhook.construct_event() with STRIPE_WEBHOOK_SECRET.
    """
    if not settings.STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=503, detail="Webhook not configured")
    
    # TODO: Implement webhook signature verification for production:
    # sig_header = request.headers.get('stripe-signature')
    # event = stripe.Webhook.construct_event(request_body, sig_header, settings.STRIPE_WEBHOOK_SECRET)
    
    # For now, we handle payments synchronously
    return {"received": True}


@router.post("/invoice/send")
async def send_invoice(
    request: InvoiceSendRequest,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """
    Send an invoice/confirmation email for an order using Resend.
    """
    from app.services.shop_service import get_order
    from app.services.email_service import email_service
    
    order = await get_order(request.order_id, token=token)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Ownership/Admin check
    is_admin = current_user.get("role") == "admin"
    if not is_admin and order.get("user_id") != current_user.get("sub"):
        raise HTTPException(status_code=403, detail="You do not have permission to send this invoice")

    recipient = request.recipient_email or order.get("shipping_address", {}).get("email")
    if not recipient:
        raise HTTPException(status_code=400, detail="Recipient email not found")

    # Prepare data for email service
    items = order.get("items", [])
    # Flatten items for the email template (strip product prefix if nested)
    flat_items = []
    for it in items:
        p = it.get("product") or {}
        flat_items.append({
            "product_name": p.get("name", "Premium Honey"),
            "variant_size": "Standard", # Default
            "quantity": it.get("quantity", 1),
            "total_price": it.get("price_at_purchase", 0) * it.get("quantity", 1)
        })

    # Prepare batch number if traceability requested
    batch_number = None
    if request.include_traceability:
        batch_number = f"BY-BATCH-{str(order.get('id',''))[:4].upper()}"

    try:
        # Update order email if recipient provided
        if request.recipient_email:
            # We don't necessarily update the DB unless we want to change the customer record
            pass
            
        email_service.send_order_confirmation(
            order=order,
            items=flat_items,
            batch_number=batch_number
        )
        return {"status": "success", "message": f"Invoice sent to {recipient}"}
    except Exception as e:
        logger.error(f"Email delivery error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
