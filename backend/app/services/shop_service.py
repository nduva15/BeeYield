from honey_rust import ShopEngine, MpesaEngine, InvoicingEngine, calc_yield as _rust_calc
import logging
import os

logger = logging.getLogger(__name__)

# Initialize the Rust engines
engine = ShopEngine(500000)
mpesa = MpesaEngine()
invoicer = InvoicingEngine()

async def process_checkout(user_id: str, idempotency_key: str, checkout_data: Dict[str, Any]) -> dict:
    """
    Highly concurrent, memory-safe checkout process.
    Delegates idempotency and state validation to Rust.
    """
    from app.db.supabase_db import get_python_context
    with get_python_context() as py:
        # Part 1: Idempotency check & placeholder record in billing_ledger
        transaction = engine.process_idempotent(py, idempotency_key, user_id, checkout_data)
        
        # Part 2: Trigger M-Pesa STK Push if method is mpesa
        if checkout_data.get("payment_method") == "mpesa":
            phone = checkout_data.get("phone")
            amount = int(checkout_data.get("amount", 0))
            if phone and amount > 0:
                try:
                    stk_res = mpesa.initiate_stk_push(phone, amount, f"ORDER-{idempotency_key[:8]}")
                    logger.info(f"M-Pesa STK Initiated: {stk_res}")
                except Exception as e:
                    logger.error(f"M-Pesa Failure: {e}")
                    return {"success": False, "error": "Payment gateway rejected request."}
                    
        return transaction

async def generate_invoice(order_id: str, amount: float, items_html: str, trace_hash: str) -> str:
    """
    Generates a brutalist Rust-powered invoice.
    """
    return invoicer.generate_invoice_html(order_id, amount, items_html, trace_hash)

async def update_status(order_id: str, current_status: str, next_status: str, token: Optional[str] = None) -> dict:
    """
    Updates order status after validating the transition in Rust.
    """
    if not engine.validate_transition(current_status, next_status):
        logger.warning(f"Invalid status transition requested: {current_status} -> {next_status}")
        return {"success": False, "error": "Invalid state transition"}
    
    from honey_rust import rust_update_order_status
    return await rust_update_order_status(order_id, next_status, token=token)

async def calc_yield(items: List[Dict[str, Any]]) -> int:
    return _rust_calc(items)

async def set_order_paid(order_id: str, token: Optional[str] = None) -> dict:
    return await update_status(order_id, "processing", "completed", token=token)
