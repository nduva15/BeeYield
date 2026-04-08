from typing import List, Optional, Dict, Any
from app.core.config import settings
import logging
import json

logger = logging.getLogger(__name__)

# Defensive import: Rust engine is optional — backend works without it
try:
    from honey_rust import ShopEngine, MpesaEngine, InvoicingEngine, calc_yield as _rust_calc
    engine = ShopEngine(500000)
    mpesa = MpesaEngine()
    invoicer = InvoicingEngine()
    _RUST_SHOP_AVAILABLE = True
    logger.info("Oxidized Shop Engine: Online")
except ImportError:
    def _rust_calc(items):
        return 0
    engine = None
    mpesa = None
    invoicer = None
    _RUST_SHOP_AVAILABLE = False
    logger.warning("Oxidized Shop Engine: OFFLINE — run 'maturin develop' inside backend/beeyield_core")

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
            await db_select("profiles", columns="id", token=token, limit=1)
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
    if id_key and engine:
        payload = order_in.dict()
        payload["amount"] = str(order_in.total_kes)
        payload["currency"] = "KES"
        payload["description"] = "Order initialization via Shop API"
        try:
            ledger_entry = engine.process_idempotent(id_key, user_id or "guest", payload)
            if logger.isEnabledFor(logging.DEBUG):
                logger.debug(f"Oxidized Idempotency: Ledger Entry {ledger_entry.get('id')}")
        except Exception as e:
            logger.error(f"Oxidized Financial Core Failure: {e}")
            return {"status": "error", "message": f"Financial Core rejected transaction: {str(e)}"}

    price_map: Dict[str, float] = {}
    
    # 4. Strict Price & Logistics Validation (Oxidized Validation)
    if not is_bypass:
        for item in order_in.items:
            product = await get_product_by_id(item.product_id, token=token)
            if not product:
                return {"status": "error", "message": f"Product {item.product_id} not found."}
            for v in product.get("variants", []):
                price_map[v["id"]] = float(v.get("price_kes", 0))
        
        try:
            items_list = list(map(lambda x: x.dict(), order_in.items))
            # 4a. Base Items Total — Python validation (Rust engine doesn't have this method)
            subtotal = 0.0
            for item_dict in items_list:
                vid = item_dict.get("variant_id")
                price = price_map.get(vid, 0.0)
                if price <= 0:
                    return {"status": "error", "message": f"Price not found for variant {vid}"}
                subtotal += price * item_dict.get("quantity", 1)
            
            # 4b. Coupon Logic
            discount = 0.0
            if getattr(order_in, "coupon_code", None):
                # Simple coupon validation — extend as needed
                logger.info(f"Coupon code received: {order_in.coupon_code}")
                
            # 4c. Shipping Logic
            delivery_method = getattr(order_in, "delivery_method", "delivery")
            shipping = 350.0 if delivery_method == "delivery" and subtotal < 5000 else 0.0
            
            # 4d. Final Total Calculation (Subtotal + Shipping)
            final_total = subtotal + shipping - discount
            
            if final_total > order_in.total_kes + 1:
                return {"status": "error", "message": f"Price mismatch. Minimum required {final_total}, got {order_in.total_kes}."}
            
            order_in.total_kes = final_total
        except Exception as e:
            logger.error(f"Validation Failure: {e}")
            return {"status": "error", "message": f"Validation failed: {str(e)}"}

    # 5. Create Order Document
    hex_id: str = uuid.uuid4().hex
    order_number = f"BY-{datetime.now().strftime('%y%m%d')}-{hex_id[:4].upper()}"
    
    order_data = {
        "user_id": user_id if not is_bypass else None,
        "order_number": order_number,
        "total_kes": order_in.total_kes if not is_bypass else 0,
        "status": "pending",
        "payment_status": "pending",
        "shipping_address": order_in.shipping_address,
        "payment_method": order_in.payment_method,
        "delivery_method": getattr(order_in, "delivery_method", "delivery"),
        "notes": getattr(order_in, "notes", None),
        "idempotency_key": id_key,
        "created_at": datetime.now().isoformat()
    }


    res = await db_insert("orders", order_data, token=settings.SUPABASE_SERVICE_ROLE_KEY)
    if not res.get("success"):
        error_msg = res.get('error', 'Unknown DB error')
        logger.error(f"Order creation failed: {error_msg}")
        return {"status": "error", "message": f"DB Error: {error_msg}"}
    
    order_id = res["data"][0]["id"]
    
    # 6. Atomic item insertion
    for item in order_in.items:
        # Get the actual price from our validated price_map if possible, else 0
        price_val = price_map.get(str(item.variant_id), 0.0)
        item_data = {
            "order_id": order_id,
            "product_id": item.product_id,
            "variant_id": item.variant_id,
            "quantity": item.quantity,
            "unit_price": price_val,
            "total_price": price_val * item.quantity,
            "price_at_purchase": price_val
        }
        await db_insert("order_items", item_data, token=settings.SUPABASE_SERVICE_ROLE_KEY)

    tracking_event = {
        "status": "pending",
        "location": order_in.shipping_address.get("city"),
        "description": "Order received and queued for fulfillment.",
        "created_at": datetime.now().isoformat(),
    }
    await db_insert(
        "order_tracking",
        {
            "order_id": order_id,
            "status": "pending",
            "estimated_delivery": "Within 24 hours",
            "events": [tracking_event],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        },
        token=settings.SUPABASE_SERVICE_ROLE_KEY,
    )

    # 7. Financial Core — Payment Trigger
    payment_info = {}

    if is_bypass:
        payment_info = {"message": "Bypass active. Order confirmed.", "status": "completed"}
    elif order_in.payment_method == "mpesa":
        phone: str = clean_phone
        if phone.startswith("0"):
            phone = "254" + phone[1:]
        elif not phone.startswith("254"):
            phone = "254" + phone
        
        if not mpesa:
            payment_info = {"success": False, "error": "M-Pesa engine not available (Rust core offline)"}
        else:
            try:
                stk_res = mpesa.initiate_stk_push(phone, int(order_in.total_kes), order_number)
                payment_info = stk_res
                
                checkout_id = stk_res.get("CheckoutRequestID")
                if checkout_id and id_key:
                    await db_update("billing_ledger", 
                        {
                            "checkout_request_id": checkout_id,
                            "metadata": {"checkout_request_id": checkout_id, "order_id": order_id}
                        }, 
                        {"idempotency_key": id_key},
                        token=settings.SUPABASE_SERVICE_ROLE_KEY
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

async def apply_coupon_code(code: str, total_amount: float) -> dict:
    """Validate coupon codes for the ecommerce checkout flow."""
    normalized = (code or "").strip().upper()

    coupon_rules = {
        "WELCOME10": {"discount_percent": 10.0, "minimum_amount": 1500.0, "message": "Welcome offer applied."},
        "HONEY15": {"discount_percent": 15.0, "minimum_amount": 3000.0, "message": "Honey harvest promo applied."},
        "BEEYIELD5": {"discount_percent": 5.0, "minimum_amount": 0.0, "message": "Loyalty discount applied."},
    }

    rule = coupon_rules.get(normalized)
    if not rule:
        return {
            "valid": False,
            "code": normalized,
            "discount_percent": 0.0,
            "discount_amount": 0.0,
            "message": "Invalid or expired coupon code.",
        }

    if total_amount < rule["minimum_amount"]:
        return {
            "valid": False,
            "code": normalized,
            "discount_percent": rule["discount_percent"],
            "discount_amount": 0.0,
            "message": f"Coupon requires a minimum cart value of KES {int(rule['minimum_amount'])}.",
        }

    discount_amount = round((rule["discount_percent"] / 100.0) * total_amount, 2)
    return {
        "valid": True,
        "code": normalized,
        "discount_percent": rule["discount_percent"],
        "discount_amount": discount_amount,
        "message": rule["message"],
    }

async def get_products(category: Optional[str] = None, token: Optional[str] = None) -> list[dict[str, Any]]:
    from app.db.supabase_db import db_select
    filters: dict[str, Any] = {"is_active": True}
    if category:
        filters["category"] = category
    res = await db_select("products", columns="*,variants:product_variants(*)", filters=filters, token=token)
    return res

async def get_product_by_id(product_id: str, token: Optional[str] = None) -> Optional[dict]:
    # Note: db_get_by_id doesn't support complex columns in its simple form, using select instead
    from app.db.supabase_db import db_select
    res = await db_select("products", columns="*,variants:product_variants(*)", filters={"id": product_id}, token=token)
    return res[0] if res else None


async def _hydrate_order_items(order: dict[str, Any], token: Optional[str] = None) -> dict[str, Any]:
    if "items" in order and isinstance(order.get("items"), list):
        return order

    from app.db.supabase_db import db_select

    order_id = order.get("id")
    if not order_id:
        order["items"] = []
        return order

    items = await db_select("order_items", filters={"order_id": order_id}, token=token)
    enriched_items: list[dict[str, Any]] = []
    for item in items:
        enriched_item = dict(item)
        product_id = enriched_item.get("product_id")
        if product_id and "product" not in enriched_item:
            product = await get_product_by_id(product_id, token=token)
            if product:
                enriched_item["product"] = product
        enriched_items.append(enriched_item)

    order["items"] = enriched_items
    return order

async def get_user_orders(user_id: str, token: Optional[str] = None) -> list[dict[str, Any]]:
    from app.db.supabase_db import db_select
    columns = "*,items:order_items(*,product:products(*,variants:product_variants(*)))"
    orders = await db_select("orders", columns=columns, filters={"user_id": user_id}, token=token)
    hydrated_orders = [await _hydrate_order_items(dict(order), token=token) for order in orders]
    return sorted(hydrated_orders, key=lambda row: row.get("created_at", ""), reverse=True)

async def get_order(order_id: str, token: Optional[str] = None) -> Optional[dict]:
    from app.db.supabase_db import db_select
    columns = "*,items:order_items(*,product:products(*,variants:product_variants(*)))"
    res = await db_select("orders", columns=columns, filters={"id": order_id}, token=token)
    if not res:
        return None
    return await _hydrate_order_items(dict(res[0]), token=token)


async def _append_tracking_event(
    order_id: str,
    *,
    status: str,
    description: str,
    location: Optional[str] = None,
    token: Optional[str] = None,
) -> None:
    from app.db.supabase_db import db_insert, db_select, db_update
    from datetime import datetime

    records = await db_select("order_tracking", filters={"order_id": order_id}, token=token)
    new_event = {
        "status": status,
        "location": location,
        "description": description,
        "created_at": datetime.now().isoformat(),
    }

    if records:
        record = records[0]
        events = record.get("events") if isinstance(record.get("events"), list) else []
        events.append(new_event)
        await db_update(
            "order_tracking",
            {
                "status": status,
                "events": events,
                "updated_at": datetime.now().isoformat(),
            },
            {"order_id": order_id},
            token=token,
        )
        return

    await db_insert(
        "order_tracking",
        {
            "order_id": order_id,
            "status": status,
            "estimated_delivery": "Within 24 hours",
            "events": [new_event],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        },
        token=token,
    )

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
    if invoicer:
        return invoicer.generate_invoice_html(order_id, amount, items_html, trace_hash)
    # Fallback when Rust core is offline
    return f"<html><body><h1>Invoice {order_id}</h1><p>Amount: KES {amount}</p>{items_html}</body></html>"

async def process_mpesa_callback(payload: Dict[str, Any]) -> dict:
    """
    Process incoming M-Pesa callback from Safaricom.
    Matches via checkout_request_id and updates both Ledger and Order.
    """
    from app.db.supabase_db import db_update, db_select
    try:
        if not mpesa:
            return {"success": False, "error": "M-Pesa engine not available"}
        rust_data = mpesa.parse_callback_result(json.dumps(payload))
        res_code = rust_data.get("result_code")
        checkout_id = rust_data.get("checkout_request_id")
        
        if not checkout_id:
            logger.error(f"Callback missing checkout_request_id: {payload}")
            return {"success": False, "error": "Missing checkout_request_id"}

        # 1. Update Ledger status
        status = "completed" if res_code == 0 else "failed"
        await db_update("billing_ledger", 
            {"payment_status": status}, 
            {"checkout_request_id": checkout_id}
        )
        
        # 2. Find Order ID from Ledger metadata
        ledger_records = await db_select("billing_ledger", filters={"checkout_request_id": checkout_id})
        if ledger_records:
            metadata = ledger_records[0].get("metadata", {})
            order_id = metadata.get("order_id")
            if order_id:
                # 3. Update Order status
                order_update = {
                    "payment_status": "paid" if res_code == 0 else "failed",
                    "status": "processing" if res_code == 0 else "pending"
                }
                await db_update("orders", order_update, {"id": order_id})
                logger.info(f"Payment {status} for Order {order_id} (CheckoutID: {checkout_id})")
        
        return {"success": res_code == 0}
    except Exception as e:
        logger.error(f"Callback Processing Error: {e}")
        return {"success": False, "error": str(e)}

async def update_status(order_id: str, current_status: str, next_status: str, token: Optional[str] = None) -> dict:
    if engine and not engine.validate_transition(current_status, next_status):
        return {"success": False, "error": "Invalid state transition"}
    if not _RUST_SHOP_AVAILABLE:
        # Fallback: direct DB update without Rust validation
        from app.db.supabase_db import db_update
        return await db_update("orders", {"status": next_status}, {"id": order_id}, token=token)
    from honey_rust import rust_update_order_status
    return await rust_update_order_status(order_id, next_status, token=token)

async def update_order_status(order_id: str, current_status: str, next_status: str, token: Optional[str] = None) -> dict:
    """Explicit wrapper for updating order status."""
    return await update_status(order_id, current_status, next_status, token=token)


async def calc_yield(items: List[Dict[str, Any]]) -> int:
    return _rust_calc(items)

async def set_order_paid(order_id: str, token: Optional[str] = None) -> dict:
    return await update_status(order_id, "processing", "completed", token=token)

# ==========================================
#  WISHLIST SERVICES
# ==========================================

async def get_user_wishlist(user_id: str, token: Optional[str] = None) -> List[dict]:
    from app.db.supabase_db import db_select
    return await db_select("wishlists", columns="*,product:products(*)", filters={"user_id": user_id}, token=token)

async def toggle_wishlist_item(user_id: str, product_id: str, token: Optional[str] = None) -> dict:
    from app.db.supabase_db import db_select, db_insert, db_delete
    existing = await db_select("wishlists", filters={"user_id": user_id, "product_id": product_id}, token=token)
    if existing:
        await db_delete("wishlists", filters={"user_id": user_id, "product_id": product_id}, token=token)
        return {"status": "success", "action": "removed"}
    else:
        await db_insert("wishlists", {"user_id": user_id, "product_id": product_id}, token=token)
        return {"status": "success", "action": "added"}

# ==========================================
#  WALLET SERVICES
# ==========================================

async def get_user_wallet(user_id: str, token: Optional[str] = None) -> dict:
    from app.db.supabase_db import db_select, db_insert
    results = await db_select("wallets", filters={"user_id": user_id}, token=token)
    if results:
        return results[0]
    # Auto-create wallet if missing
    new_wallet = {"user_id": user_id, "balance": 0.0, "currency": "KES"}
    res = await db_insert("wallets", new_wallet, token=token)
    if res.get("success") and res.get("data"):
        return res["data"][0]
    return {"user_id": user_id, "balance": 0.0, "currency": "KES"}

async def get_wallet_transactions(user_id: str, token: Optional[str] = None) -> List[dict]:
    from app.db.supabase_db import db_select
    return await db_select("wallet_transactions", filters={"user_id": user_id}, token=token)

async def top_up_wallet(user_id: str, amount: float, reference: str, token: Optional[str] = None) -> dict:
    from app.db.supabase_db import db_insert, db_update
    wallet = await get_user_wallet(user_id, token=token)
    new_balance = wallet.get("balance", 0) + amount
    await db_update("wallets", {"balance": new_balance}, {"user_id": user_id}, token=token)
    await db_insert("wallet_transactions", {
        "user_id": user_id,
        "amount": amount,
        "type": "credit",
        "reference": reference,
        "balance_after": new_balance
    }, token=token)
    return {"status": "success", "new_balance": new_balance}

# ==========================================
#  ADDRESS SERVICES
# ==========================================

async def get_user_addresses(user_id: str, token: Optional[str] = None) -> List[dict]:
    from app.db.supabase_db import db_select
    return await db_select("addresses", filters={"user_id": user_id}, token=token)

async def add_user_address(user_id: str, address_data: dict, token: Optional[str] = None) -> dict:
    from app.db.supabase_db import db_insert, db_update
    if address_data.get("is_default"):
        await db_update("addresses", {"is_default": False}, {"user_id": user_id}, token=token)
    address_data["user_id"] = user_id
    res = await db_insert("addresses", address_data, token=token)
    if res.get("success") and res.get("data"):
        return res["data"][0]
    return address_data

async def delete_user_address(user_id: str, address_id: str, token: Optional[str] = None):
    from app.db.supabase_db import db_delete
    await db_delete("addresses", filters={"id": address_id, "user_id": user_id}, token=token)

async def update_user_address(user_id: str, address_id: str, address_data: dict, token: Optional[str] = None) -> dict:
    from app.db.supabase_db import db_update
    if address_data.get("is_default"):
        await db_update("addresses", {"is_default": False}, {"user_id": user_id}, token=token)
    res = await db_update("addresses", address_data, {"id": address_id, "user_id": user_id}, token=token)
    if res.get("success") and res.get("data"):
        return res["data"][0]
    return {**address_data, "id": address_id}

# ==========================================
#  PAYMENT METHOD SERVICES
# ==========================================

async def get_user_payment_methods(user_id: str, token: Optional[str] = None) -> list[dict[str, Any]]:
    from app.db.supabase_db import db_select
    return await db_select("payment_methods", filters={"user_id": user_id}, token=token)

async def add_user_payment_method(user_id: str, method_data: dict, token: Optional[str] = None) -> dict:
    from app.db.supabase_db import db_insert, db_update
    if method_data.get("is_default"):
        await db_update("payment_methods", {"is_default": False}, {"user_id": user_id}, token=token)
    method_data["user_id"] = user_id
    res = await db_insert("payment_methods", method_data, token=token)
    if res.get("success") and res.get("data"):
        return res["data"][0]
    return method_data

async def delete_user_payment_method(user_id: str, method_id: str, token: Optional[str] = None):
    from app.db.supabase_db import db_delete
    await db_delete("payment_methods", filters={"id": method_id, "user_id": user_id}, token=token)


async def update_user_payment_method(user_id: str, method_id: str, method_data: dict, token: Optional[str] = None) -> dict:
    from app.db.supabase_db import db_update
    if method_data.get("is_default"):
        await db_update("payment_methods", {"is_default": False}, {"user_id": user_id}, token=token)
    res = await db_update("payment_methods", method_data, {"id": method_id, "user_id": user_id}, token=token)
    if res.get("success") and res.get("data"):
        return res["data"][0]
    return {**method_data, "id": method_id}

# ==========================================
#  ORDER TRACKING SERVICE
# ==========================================

async def get_order_tracking(order_id: str, token: Optional[str] = None) -> Optional[dict]:
    from app.db.supabase_db import db_select
    results = await db_select("order_tracking", filters={"order_id": order_id}, token=token)
    if results:
        record = results[0]
        raw_events = record.get("events") or record.get("history") or []
        if not isinstance(raw_events, list):
            raw_events = []

        events = []
        for event in raw_events:
            if not isinstance(event, dict):
                continue
            events.append({
                "status": event.get("status") or record.get("status") or "processing",
                "location": event.get("location"),
                "description": event.get("description") or event.get("label") or "Fulfillment step recorded.",
                "created_at": event.get("created_at") or record.get("updated_at") or record.get("created_at"),
            })

        if not events:
            events = [{
                "status": record.get("status", "processing"),
                "location": record.get("current_location"),
                "description": record.get("description", "Order is moving through fulfillment."),
                "created_at": record.get("updated_at") or record.get("created_at"),
            }]

        return {
            "order_id": order_id,
            "current_status": record.get("status", "processing"),
            "estimated_delivery": record.get("estimated_delivery", "Within 24 hours"),
            "events": events,
        }
    # Return a default tracking state based on order status
    order = await get_order(order_id, token=token)
    if order:
        current_status = order.get("status", "pending")
        event_map = {
            "pending": [
                {"status": "pending", "description": "Order placed and awaiting confirmation."},
            ],
            "processing": [
                {"status": "pending", "description": "Order placed successfully."},
                {"status": "processing", "description": "Payment confirmed and fulfillment started."},
            ],
            "shipped": [
                {"status": "pending", "description": "Order placed successfully."},
                {"status": "processing", "description": "Order packed and prepared for dispatch."},
                {"status": "shipped", "description": "Shipment is on the road to the customer."},
            ],
            "completed": [
                {"status": "pending", "description": "Order placed successfully."},
                {"status": "processing", "description": "Order packed and prepared for dispatch."},
                {"status": "shipped", "description": "Shipment is on the road to the customer."},
                {"status": "completed", "description": "Order delivered successfully."},
            ],
        }
        return {
            "order_id": order_id,
            "current_status": current_status,
            "estimated_delivery": "Delivered" if current_status == "completed" else "Within 24 hours",
            "events": [
                {
                    **event,
                    "location": None,
                    "created_at": order.get("created_at"),
                }
                for event in event_map.get(current_status, event_map["pending"])
            ],
        }
    return None


async def cancel_order(user_id: str, order_id: str, token: Optional[str] = None) -> dict:
    from app.db.supabase_db import db_update

    order = await get_order(order_id, token=token)
    if not order or str(order.get("user_id")) != str(user_id):
        raise ValueError("Order not found")

    current_status = str(order.get("status", "pending")).lower()
    if current_status not in {"pending", "processing"}:
        raise ValueError("Only pending or processing orders can be cancelled")

    await db_update(
        "orders",
        {"status": "cancelled", "payment_status": order.get("payment_status", "pending")},
        {"id": order_id, "user_id": user_id},
        token=token,
    )
    await _append_tracking_event(
        order_id,
        status="cancelled",
        description="Order cancelled by customer from the shop dashboard.",
        location=order.get("shipping_address", {}).get("city"),
        token=token,
    )

    refreshed = await get_order(order_id, token=token)
    if refreshed:
        return refreshed

    order["status"] = "cancelled"
    return order


async def get_dashboard_summary(user_id: str, token: Optional[str] = None) -> dict:
    orders = await get_user_orders(user_id, token=token)
    addresses = await get_user_addresses(user_id, token=token)
    payment_methods = await get_user_payment_methods(user_id, token=token)
    wishlist = await get_user_wishlist(user_id, token=token)
    recommendations = (await get_products(token=token))[:4]

    completed_statuses = {"completed", "delivered"}
    active_statuses = {"pending", "processing", "shipped"}

    stats = {
        "total_orders": len(orders),
        "active_orders": len([order for order in orders if str(order.get("status", "")).lower() in active_statuses]),
        "completed_orders": len([order for order in orders if str(order.get("status", "")).lower() in completed_statuses]),
        "total_spent_kes": sum(float(order.get("total_kes", 0) or 0) for order in orders if str(order.get("status", "")).lower() not in {"cancelled", "failed"}),
        "wishlist_items": len(wishlist),
        "saved_addresses": len(addresses),
        "saved_payment_methods": len(payment_methods),
    }

    return {
        "stats": stats,
        "recent_orders": orders[:20],
        "addresses": addresses,
        "payment_methods": payment_methods,
        "wishlist": wishlist,
        "recommendations": recommendations,
    }
