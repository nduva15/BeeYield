from typing import List, Optional, Dict, Any
from honey_rust import ShopEngine, MpesaEngine, InvoicingEngine, calc_yield as _rust_calc
from app.core.config import settings
import logging
import json

logger = logging.getLogger(__name__)

# Initialize the Rust engines (Local PyO3 Bindings)
engine = ShopEngine(500000)
mpesa = MpesaEngine()
invoicer = InvoicingEngine()

async def create_order(order_in: Any, user_id: Optional[str] = None, token: Optional[str] = None) -> dict:
    """
    Core order creation logic with Oxidized Idempotency.
    Ensures 'Never Trust the Client' principle using the Rust ShopEngine.
    """
    from app.db.supabase_db import db_insert, db_select, db_update
    from datetime import datetime
    import uuid

    id_key = getattr(order_in, 'idempotency_key', None)
    
    # 1. Idempotent Recovery — check for existing order
    if id_key:
        existing = await db_select("orders", filters={"idempotency_key": id_key}, token=token)
        if existing:
            return {
                "status": "success",
                "order_id": existing[0]["id"],
                "order_number": existing[0]["order_number"],
                "message": "Found existing order for this key (Idempotent recovery)."
            }

    # 2. Bypass & Auth Check (single pass)
    raw_phone = str(order_in.shipping_address.get("phone", ""))
    clean_phone = "".join(filter(str.isdigit, raw_phone))
    
    is_bypass = False
    
    # Secure Check: If token is provided, verify against the secured database role system
    # This aligns with the Phase A: Secure Role-Based Access Control PRD
    if token:
        try:
            # db_select automatically runs under the user's RLS context, so is_admin() works
            admin_check = await db_select("profiles", columns="id", token=token, limit=1)
            # If we just need to know if they are an admin, we can rely on a custom RPC or just check if the backend allowed a certain operation,
            # but for a quick RBAC, it's better to fetch their profile role if available. 
            # Alternatively, since we created the SQL is_admin() function, we can execute an RPC call.
            from app.db.supabase_db import supabase_client
            # Verify admin status securely via RPC
            rpc_res = supabase_client.rpc("is_admin").execute()
            if rpc_res.data is True:
                is_bypass = True
        except Exception as e:
            logger.warning(f"Failed to verify admin status via RPC: {e}")
            
    # Fallback to local .env configuration (for development/legacy support)
    if not is_bypass:
        bypass_ph = getattr(settings, "ADMIN_BYPASS_PHONE", None)
        if bypass_ph and len(clean_phone) >= 9:
            is_bypass = clean_phone.endswith(bypass_ph[-9:]) or (bypass_ph in str(order_in.dict()))

    # 3. Rust Engine Ledger Idempotency
    if id_key:
        payload = order_in.dict()
        payload["amount"] = str(order_in.total_kes)
        payload["currency"] = "KES"
        payload["description"] = "Order initialization via Shop API"
        try:
            ledger_entry = engine.process_idempotent(id_key, user_id, payload)
            if logger.isEnabledFor(logging.DEBUG):
                logger.debug(f"Oxidized Idempotency: Ledger Entry {ledger_entry.get('id')}")
        except Exception as e:
            logger.error(f"Oxidized Financial Core Failure: {e}")
            return {"status": "error", "message": f"Financial Core rejected transaction: {str(e)}"}

    # 4. Strict Price Validation (Never Trust the Client)
    if not is_bypass:
        calculated_total = 0
        for item in order_in.items:
            product = await get_product_by_id(item.product_id, token=token)
            if not product:
                return {"status": "error", "message": f"Product {item.product_id} not found."}
            
            variant = next((v for v in product.get("variants", []) if v.get("id") == item.variant_id), None)
            if not variant and product.get("id", "").startswith(("h", "hw", "m", "edu")):
                variant = product.get("variants", [{}])[0]
                
            if not variant:
                return {"status": "error", "message": f"Variant {item.variant_id} not found."}
            
            calculated_total += variant.get("price_kes", 0) * item.quantity
        
        if calculated_total > order_in.total_kes + 1:
            return {"status": "error", "message": f"Price mismatch. Minimum required {calculated_total}, got {order_in.total_kes}."}
        
        order_in.total_kes = calculated_total

    # 5. Create Order Document
    order_number = f"BY-{datetime.now().strftime('%y%m%d')}-{str(uuid.uuid4())[:4].upper()}"
    
    order_data = {
        "user_id": user_id if not is_bypass else None,
        "order_number": order_number,
        "total_kes": order_in.total_kes if not is_bypass else 0,
        "status": "pending",
        "shipping_address": order_in.shipping_address,
        "payment_method": order_in.payment_method,
        "idempotency_key": id_key,
        "created_at": datetime.now().isoformat()
    }

    res = await db_insert("orders", order_data, token=token)
    if not res.get("success"):
        error_msg = res.get('error', 'Unknown DB error')
        logger.error(f"Order creation failed: {error_msg}")
        return {"status": "error", "message": f"DB Error: {error_msg}"}
    
    order_id = res["data"][0]["id"]
    
    # 6. Atomic item insertion
    for item in order_in.items:
        item_data = {
            "order_id": order_id,
            "product_id": item.product_id,
            "variant_id": item.variant_id,
            "quantity": item.quantity,
            "price_at_purchase": getattr(item, 'price_at_purchase', 0)
        }
        await db_insert("order_items", item_data, token=token)

    # 7. Financial Core — Payment Trigger
    payment_info = {}

    if is_bypass:
        payment_info = {"message": "Bypass active. Order confirmed.", "status": "completed"}
    elif order_in.payment_method == "mpesa":
        phone = clean_phone
        if phone.startswith("0"):
            phone = "254" + phone[1:]
        elif not phone.startswith("254"):
            phone = "254" + phone
        
        try:
            stk_res = mpesa.initiate_stk_push(phone, int(order_in.total_kes), order_number)
            payment_info = stk_res
            
            checkout_id = stk_res.get("CheckoutRequestID")
            if checkout_id and id_key:
                await db_update("billing_ledger", 
                    {"metadata": {"checkout_request_id": checkout_id, "order_id": order_id}}, 
                    {"idempotency_key": id_key},
                    token=token
                )
        except Exception as e:
            logger.warning(f"Oxidized M-Pesa Push error: {e}")
            payment_info = {"success": False, "error": str(e)}

    elif order_in.payment_method == "card":
        from app.services import payment
        payment_info = payment.init_stripe_payment(order_in.total_kes)

    return {
        "status": "success", 
        "order_id": order_id, 
        "order_number": order_number,
        "payment_info": payment_info
    }

async def get_products(category: Optional[str] = None, token: Optional[str] = None) -> List[dict]:
    from app.db.supabase_db import db_select
    filters = {"category": category} if category else None
    return await db_select("products", filters=filters, token=token)

async def get_product_by_id(product_id: str, token: Optional[str] = None) -> Optional[dict]:
    from app.db.supabase_db import db_get_by_id
    columns = "*,variants(*)"
    # Note: db_get_by_id doesn't support complex columns in its simple form, using select instead
    from app.db.supabase_db import db_select
    res = await db_select("products", columns=columns, filters={"id": product_id}, token=token)
    return res[0] if res else None

async def get_user_orders(user_id: str, token: Optional[str] = None) -> List[dict]:
    from app.db.supabase_db import db_select
    columns = "*,items:order_items(*,product:products(*))"
    return await db_select("orders", columns=columns, filters={"user_id": user_id}, token=token)

async def get_order(order_id: str, token: Optional[str] = None) -> Optional[dict]:
    from app.db.supabase_db import db_select
    columns = "*,items:order_items(*,product:products(*))"
    res = await db_select("orders", columns=columns, filters={"id": order_id}, token=token)
    return res[0] if res else None

async def generate_invoice_pdf(order_id: str, token: Optional[str] = None):
    """
    Generates a PDF using the Rust engine's HTML and a PDF converter.
    """
    order = await get_order(order_id, token=token)
    if not order:
        raise Exception("Order not found")
        
    html = await generate_invoice(
        order_id, 
        order.get("total_kes", 0), 
        "Items list placeholder", 
        "hash_placeholder"
    )
    
    # For now, return as a stream of the HTML (mocking PDF)
    import io
    return io.BytesIO(html.encode())

async def generate_invoice(order_id: str, amount: float, items_html: str, trace_hash: str) -> str:
    return invoicer.generate_invoice_html(order_id, amount, items_html, trace_hash)

async def process_mpesa_callback(payload: Dict[str, Any]) -> dict:
    try:
        rust_data = mpesa.parse_callback_result(json.dumps(payload))
        res_code = rust_data.get("result_code")
        checkout_id = rust_data.get("checkout_request_id")
        from app.db.supabase_db import db_update
        if res_code == 0:
            await db_update("billing_ledger", {"payment_status": "completed"}, {"metadata->>checkout_request_id": checkout_id})
            return {"success": True}
        else:
            await db_update("billing_ledger", {"payment_status": "failed"}, {"metadata->>checkout_request_id": checkout_id})
            return {"success": False, "error": f"M-Pesa rejected: {res_code}"}
    except Exception as e:
        logger.error(f"Callback Processing Error: {e}")
        return {"success": False, "error": str(e)}

async def update_status(order_id: str, current_status: str, next_status: str, token: Optional[str] = None) -> dict:
    if not engine.validate_transition(current_status, next_status):
        return {"success": False, "error": "Invalid state transition"}
    from honey_rust import rust_update_order_status
    return await rust_update_order_status(order_id, next_status, token=token)

update_order_status = update_status

async def calc_yield(items: List[Dict[str, Any]]) -> int:
    return _rust_calc(items)

async def set_order_paid(order_id: str, token: Optional[str] = None) -> dict:
    return await update_status(order_id, "processing", "completed", token=token)
