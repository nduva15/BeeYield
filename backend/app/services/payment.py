from typing import Any, Optional

from app.core.config import settings
import stripe

try:
    from honey_rust import MpesaEngine
    _mpesa = MpesaEngine()
except ImportError:
    _mpesa = None

def init_mpesa_payment(phone_number: str, amount: float, reference: str):
    """
    Initialize M-Pesa STK Push using the Oxidized Rust Engine.
    """
    if not _mpesa:
        return {"error": "Oxidized Payment Engine (honey_rust) not loaded.", "status": "failed"}

    # Clean phone number
    phone = phone_number.replace("+", "").strip()
    if phone.startswith("0"):
        phone = "254" + phone[1:]
    elif not phone.startswith("254"):
        phone = "254" + phone

    try:
        # RUST HANDSHAKE: Directly calls Safaricom via compiled Rust logic
        response = _mpesa.initiate_stk_push(
            phone=phone,
            amount=int(amount),
            account_ref=reference
        )
        return response
    except Exception as e:
        print(f"Oxidized M-Pesa Error: {e}")
        return {"error": str(e), "status": "failed", "success": False}

def init_stripe_payment(
    amount: float,
    currency: str = "kes",
    metadata: Optional[dict[str, Any]] = None,
):
    """
    Create Stripe PaymentIntent.
    """
    stripe.api_key = settings.STRIPE_SECRET_KEY
    try:
        intent_payload: dict[str, Any] = {
            "amount": int(amount * 100),  # Stripe uses cents
            "currency": currency,
        }

        if metadata:
            intent_payload["metadata"] = {str(key): str(value) for key, value in metadata.items() if value is not None}

        intent = stripe.PaymentIntent.create(**intent_payload)
        return {
            "client_secret": intent.client_secret,
            "payment_intent_id": intent.id,
            "status": intent.status,
        }
    except Exception as e:
        print(f"Stripe Error: {e}")
        return {"error": str(e)}
