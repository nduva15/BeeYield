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
