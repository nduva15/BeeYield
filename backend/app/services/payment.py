from app.services.mpesa import mpesa_service
from app.core.config import settings

def init_mpesa_payment(phone_number: str, amount: float, reference: str):
    """
    Initialize M-Pesa STK Push.
    """
    # Clean phone number (remove +, ensures starts with 254)
    phone = phone_number.replace("+", "").strip()
    if phone.startswith("0"):
        phone = "254" + phone[1:]
    elif not phone.startswith("254"):
        phone = "254" + phone



    try:
        response = mpesa_service.stk_push(
            phone=phone,
            amount=amount,
            reference=reference,
            description="BeeYield Honey Purchase"
        )
        return response
    except Exception as e:
        print(f"M-Pesa Service Error: {e}")
        return {"error": str(e), "status": "failed"}

def init_stripe_payment(amount: float, currency: str = "usd"):
    """
    Create Stripe PaymentIntent.
    """

         
    import stripe
    stripe.api_key = settings.STRIPE_SECRET_KEY
    try:
        intent = stripe.PaymentIntent.create(
            amount=int(amount * 100), # Stripe uses cents
            currency=currency,
        )
        return {"client_secret": intent.client_secret}
    except Exception as e:
        print(f"Stripe Error: {e}")
        return {"error": str(e)}
