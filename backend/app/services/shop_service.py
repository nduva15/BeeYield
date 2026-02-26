from typing import List, Optional, Dict, Any
from honey_rust import ShopEngine, MpesaEngine, InvoicingEngine, calc_yield as _rust_calc
import logging
import json

logger = logging.getLogger(__name__)

# Initialize the Rust engines (Local PyO3 Bindings)
engine = ShopEngine(500000)
mpesa = MpesaEngine()
invoicer = InvoicingEngine()

async def process_checkout(user_id: str, idempotency_key: str, checkout_data: Dict[str, Any]) -> dict:
    """
    Highly concurrent, memory-safe checkout process.
    Delegates idempotency and Payments to local Rust engines.
    """
    from app.db.supabase_db import get_python_context
    with get_python_context() as py:
        # Part 1: Idempotency check (Double Charge Killer)
        transaction = engine.process_idempotent(py, idempotency_key, user_id, checkout_data)
        
        # Part 2: Trigger M-Pesa STK Push via Rust Engine
        if checkout_data.get("payment_method") == "mpesa":
            phone = checkout_data.get("phone")
            amount = int(checkout_data.get("amount", 0))
            if phone and amount > 0:
                try:
                    # RUST HANDSHAKE: Handled in compiled binary
                    stk_res = mpesa.initiate_stk_push(
                        phone,
                        amount, 
                        f"ORDER-{idempotency_key[:8]}"
                    )
                    
                    checkout_id = stk_res.get("CheckoutRequestID")
                    if checkout_id:
                        from app.db.supabase_db import db_update
                        await db_update("billing_ledger", 
                            {"metadata": {"checkout_request_id": checkout_id}}, 
                            {"idempotency_key": idempotency_key}
                        )
                    
                    logger.info(f"M-Pesa STK Initiated (Oxidized): {checkout_id}")
                except Exception as e:
                    logger.error(f"Oxidized Payment Failure: {e}")
                    return {"success": False, "error": "Handshake rejected by gateway binary."}
                    
        return transaction

async def generate_invoice(order_id: str, amount: float, items_html: str, trace_hash: str) -> str:
    """
    Generates a brutalist Rust-powered invoice.
    """
    return invoicer.generate_invoice_html(order_id, amount, items_html, trace_hash)

async def process_mpesa_callback(payload: Dict[str, Any]) -> dict:
    """
    Highly secure M-Pesa callback processor.
    Delegates validation to Rust Engine.
    """
    try:
        # VALIDATE: Handled in compiled binary
        rust_data = mpesa.parse_callback_result(json.dumps(payload))
        
        res_code = rust_data.get("result_code")
        checkout_id = rust_data.get("checkout_request_id")
        
        from app.db.supabase_db import db_update
        
        if res_code == 0:
            await db_update("billing_ledger", 
                {"payment_status": "completed"}, 
                {"metadata->>checkout_request_id": checkout_id}
            )
            return {"success": True}
        else:
            await db_update("billing_ledger", 
                {"payment_status": "failed"}, 
                {"metadata->>checkout_request_id": checkout_id}
            )
            return {"success": False, "error": f"M-Pesa rejected: {res_code}"}
            
    except Exception as e:
        logger.error(f"Callback Processing Error: {e}")
        return {"success": False, "error": str(e)}

async def update_status(order_id: str, current_status: str, next_status: str, token: Optional[str] = None) -> dict:
    """
    Updates order status after validating the transition in Rust.
    """
    if not engine.validate_transition(current_status, next_status):
        logger.warning(f"Invalid status transition requested: {current_status} -> {next_status}")
        return {"success": False, "error": "Invalid state transition"}
    
    from honey_rust import rust_update_order_status
    return await rust_update_order_status(order_id, next_status, token=token)

# Alias for backward compatibility with payments.py
update_order_status = update_status

async def calc_yield(items: List[Dict[str, Any]]) -> int:
    return _rust_calc(items)

async def set_order_paid(order_id: str, token: Optional[str] = None) -> dict:
    return await update_status(order_id, "processing", "completed", token=token)
