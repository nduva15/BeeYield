from __future__ import annotations

import hashlib
import ipaddress
import logging
from decimal import Decimal, InvalidOperation
from typing import Any, Optional

from fastapi import HTTPException, Request

from app.core.config import settings
from app.db.supabase_db import db_insert, db_rpc, db_select, db_update


logger = logging.getLogger(__name__)

SUPPORTED_C2B_COMMANDS = {"customerpaybillonline"}
ROUTING_WALLET = "wallet"
ROUTING_ORDER = "order"
ROUTING_RECONCILIATION = "needs_reconciliation"


def normalize_kenyan_phone(value: Any) -> Optional[str]:
    if value is None:
        return None

    digits = "".join(ch for ch in str(value) if ch.isdigit())
    if not digits:
        return None

    if digits.startswith("254") and len(digits) == 12 and digits[3] in {"7", "1"}:
        return digits
    if digits.startswith("0") and len(digits) == 10 and digits[1] in {"7", "1"}:
        return f"254{digits[1:]}"
    if len(digits) == 9 and digits[0] in {"7", "1"}:
        return f"254{digits}"
    return None


def build_wallet_account_reference(user_id: str) -> str:
    digest = hashlib.md5(str(user_id).encode("utf-8")).hexdigest()[:10].upper()
    return f"BYW{digest}"


def build_wallet_bill_reference(account_reference: str) -> str:
    return f"WAL:{account_reference}"


def build_order_bill_reference(order_number: str) -> str:
    return f"ORD:{order_number}"


def get_allowed_shortcodes() -> set[str]:
    codes = {code.strip() for code in settings.MPESA_ALLOWED_SHORTCODES if code and code.strip()}
    if settings.MPESA_BUSINESS_SHORTCODE:
        codes.add(str(settings.MPESA_BUSINESS_SHORTCODE).strip())
    return codes


def _ip_matches(ip_text: Optional[str], allowlist: list[str]) -> bool:
    if not ip_text:
        return False

    candidate = ip_text.strip()
    for entry in allowlist:
        rule = (entry or "").strip()
        if not rule:
            continue
        if candidate == rule:
            return True
        try:
            if "/" in rule:
                network = ipaddress.ip_network(rule, strict=False)
                if ipaddress.ip_address(candidate) in network:
                    return True
            elif ipaddress.ip_address(candidate) == ipaddress.ip_address(rule):
                return True
        except ValueError:
            continue
    return False


def get_request_ips(request: Request) -> tuple[Optional[str], Optional[str]]:
    immediate_ip = request.client.host if request.client else None
    trusted = settings.MPESA_TRUSTED_PROXY_IPS

    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for and _ip_matches(immediate_ip, trusted):
        first_hop = forwarded_for.split(",")[0].strip()
        return first_hop or None, immediate_ip

    return immediate_ip, immediate_ip


def assert_allowed_source(request: Request) -> tuple[Optional[str], Optional[str]]:
    source_ip, immediate_ip = get_request_ips(request)
    allowlist = settings.MPESA_SAFARICOM_IP_ALLOWLIST
    if allowlist and not _ip_matches(source_ip, allowlist):
        raise HTTPException(status_code=403, detail="Source IP is not allowed")
    return source_ip, immediate_ip


def _to_decimal(value: Any) -> Decimal:
    try:
        amount = Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError) as exc:
        raise ValueError("Invalid transaction amount") from exc
    if amount <= 0:
        raise ValueError("Transaction amount must be positive")
    return amount.quantize(Decimal("0.01"))


def parse_c2b_payload(payload: dict[str, Any]) -> dict[str, Any]:
    if not isinstance(payload, dict):
        raise ValueError("Invalid M-PESA payload")

    transaction_type = (payload.get("TransactionType") or payload.get("CommandID") or "").strip()
    command = transaction_type.lower()
    if command not in SUPPORTED_C2B_COMMANDS:
        raise ValueError("Unsupported transaction type")

    business_shortcode = str(payload.get("BusinessShortCode") or payload.get("ShortCode") or "").strip()
    if not business_shortcode:
        raise ValueError("BusinessShortCode is required")
    if business_shortcode not in get_allowed_shortcodes():
        raise ValueError("Unexpected business shortcode")

    trans_id = str(payload.get("TransID") or "").strip()
    trans_time = str(payload.get("TransTime") or "").strip()
    bill_ref_number = str(payload.get("BillRefNumber") or "").strip()
    msisdn_raw = payload.get("MSISDN")

    if not trans_id:
        raise ValueError("TransID is required")
    if not trans_time:
        raise ValueError("TransTime is required")
    if not bill_ref_number:
        raise ValueError("BillRefNumber is required")

    msisdn_normalized = normalize_kenyan_phone(msisdn_raw)
    if not msisdn_normalized:
        raise ValueError("MSISDN is invalid")

    amount = _to_decimal(payload.get("TransAmount"))

    return {
        "transaction_type": transaction_type,
        "business_shortcode": business_shortcode,
        "trans_id": trans_id,
        "trans_time": trans_time,
        "bill_ref_number": bill_ref_number,
        "msisdn_raw": str(msisdn_raw),
        "msisdn_normalized": msisdn_normalized,
        "amount": amount,
        "first_name": payload.get("FirstName"),
        "middle_name": payload.get("MiddleName"),
        "last_name": payload.get("LastName"),
        "invoice_number": payload.get("InvoiceNumber"),
        "org_account_balance": payload.get("OrgAccountBalance"),
        "third_party_trans_id": payload.get("ThirdPartyTransID"),
        "raw_payload": payload,
    }


async def create_audit_log(
    *,
    request_type: str,
    payload: dict[str, Any],
    source_ip: Optional[str],
    immediate_ip: Optional[str],
    disposition: str,
    failure_reason: Optional[str] = None,
    parsed: Optional[dict[str, Any]] = None,
    matched_entity_type: Optional[str] = None,
    matched_entity_id: Optional[str] = None,
) -> Optional[str]:
    audit_payload = {
        "request_type": request_type,
        "raw_payload": payload,
        "source_ip": source_ip,
        "immediate_ip": immediate_ip,
        "disposition": disposition,
        "failure_reason": failure_reason,
        "matched_entity_type": matched_entity_type,
        "matched_entity_id": matched_entity_id,
    }
    if parsed:
        audit_payload.update(
            {
                "trans_id": parsed.get("trans_id"),
                "bill_ref_number": parsed.get("bill_ref_number"),
                "normalized_msisdn": parsed.get("msisdn_normalized"),
                "amount": float(parsed["amount"]) if parsed.get("amount") is not None else None,
                "shortcode": parsed.get("business_shortcode"),
                "transaction_type": parsed.get("transaction_type"),
            }
        )

    try:
        result = await db_insert(
            "mpesa_c2b_audit_logs",
            audit_payload,
            token=settings.SUPABASE_SERVICE_ROLE_KEY,
        )
        rows = result.get("data") or []
        if isinstance(rows, list) and rows:
            return rows[0].get("id")
    except Exception as exc:
        logger.warning("Failed to create M-PESA audit log: %s", exc)
    return None


async def update_audit_log(
    audit_id: Optional[str],
    *,
    disposition: str,
    failure_reason: Optional[str] = None,
    matched_entity_type: Optional[str] = None,
    matched_entity_id: Optional[str] = None,
    ledger_id: Optional[str] = None,
) -> None:
    if not audit_id:
        return

    patch: dict[str, Any] = {"disposition": disposition}
    if failure_reason is not None:
        patch["failure_reason"] = failure_reason
    if matched_entity_type is not None:
        patch["matched_entity_type"] = matched_entity_type
    if matched_entity_id is not None:
        patch["matched_entity_id"] = matched_entity_id
    if ledger_id is not None:
        patch["ledger_id"] = ledger_id

    try:
        await db_update(
            "mpesa_c2b_audit_logs",
            patch,
            {"id": audit_id},
            token=settings.SUPABASE_SERVICE_ROLE_KEY,
        )
    except Exception as exc:
        logger.warning("Failed to update M-PESA audit log %s: %s", audit_id, exc)


async def validate_c2b_request(request: Request, payload: dict[str, Any]) -> dict[str, Any]:
    source_ip, immediate_ip = get_request_ips(request)
    try:
        assert_allowed_source(request)
    except HTTPException:
        await create_audit_log(
            request_type="validation",
            payload=payload,
            source_ip=source_ip,
            immediate_ip=immediate_ip,
            disposition="rejected",
            failure_reason="source_ip_not_allowed",
        )
        raise

    try:
        parsed = parse_c2b_payload(payload)
    except ValueError as exc:
        await create_audit_log(
            request_type="validation",
            payload=payload,
            source_ip=source_ip,
            immediate_ip=immediate_ip,
            disposition="rejected",
            failure_reason=str(exc),
        )
        return {"ResultCode": 1, "ResultDesc": str(exc)}

    await create_audit_log(
        request_type="validation",
        payload=payload,
        source_ip=source_ip,
        immediate_ip=immediate_ip,
        disposition="received",
        parsed=parsed,
    )
    return {"ResultCode": 0, "ResultDesc": "Accepted"}


async def _find_wallet_match(parsed: dict[str, Any]) -> dict[str, Any]:
    bill_ref = parsed["bill_ref_number"]
    account_reference = bill_ref.split(":", 1)[1].strip()
    wallets = await db_select(
        "wallets",
        filters={"account_reference": account_reference},
        limit=2,
        token=settings.SUPABASE_SERVICE_ROLE_KEY,
    )
    if len(wallets) != 1:
        return {
            "routing_target_type": ROUTING_RECONCILIATION,
            "routing_target_id": None,
            "routing_user_id": None,
            "failure_reason": "wallet_reference_not_unique",
        }

    wallet = wallets[0]
    user_id = wallet.get("user_id")
    profiles = await db_select(
        "profiles",
        filters={"id": user_id},
        limit=1,
        token=settings.SUPABASE_SERVICE_ROLE_KEY,
    )
    profile = profiles[0] if profiles else {}
    profile_phone = profile.get("phone_normalized") or normalize_kenyan_phone(profile.get("phone"))

    if profile_phone != parsed["msisdn_normalized"]:
        return {
            "routing_target_type": ROUTING_RECONCILIATION,
            "routing_target_id": str(wallet.get("id")),
            "routing_user_id": str(user_id) if user_id else None,
            "failure_reason": "wallet_phone_mismatch",
        }

    return {
        "routing_target_type": ROUTING_WALLET,
        "routing_target_id": str(wallet.get("id")),
        "routing_user_id": str(user_id) if user_id else None,
        "failure_reason": None,
    }


async def _find_order_match(parsed: dict[str, Any]) -> dict[str, Any]:
    order_number = parsed["bill_ref_number"].split(":", 1)[1].strip()
    orders = await db_select(
        "orders",
        filters={"order_number": order_number},
        limit=5,
        token=settings.SUPABASE_SERVICE_ROLE_KEY,
    )
    candidates = [
        order for order in orders
        if str(order.get("status")) == "pending" and str(order.get("payment_status", "pending")) != "paid"
    ]
    if len(candidates) != 1:
        return {
            "routing_target_type": ROUTING_RECONCILIATION,
            "routing_target_id": None,
            "routing_user_id": None,
            "failure_reason": "order_not_unique_or_not_pending",
        }

    order = candidates[0]
    user_id = order.get("user_id")
    profile_phone = None

    if user_id:
        profiles = await db_select(
            "profiles",
            filters={"id": user_id},
            limit=1,
            token=settings.SUPABASE_SERVICE_ROLE_KEY,
        )
        profile = profiles[0] if profiles else {}
        profile_phone = profile.get("phone_normalized") or normalize_kenyan_phone(profile.get("phone"))

    if not profile_phone:
        shipping_address = order.get("shipping_address") or {}
        profile_phone = normalize_kenyan_phone(shipping_address.get("phone"))

    if profile_phone != parsed["msisdn_normalized"]:
        return {
            "routing_target_type": ROUTING_RECONCILIATION,
            "routing_target_id": str(order.get("id")),
            "routing_user_id": str(user_id) if user_id else None,
            "failure_reason": "order_phone_mismatch",
        }

    return {
        "routing_target_type": ROUTING_ORDER,
        "routing_target_id": str(order.get("id")),
        "routing_user_id": str(user_id) if user_id else None,
        "failure_reason": None,
    }


async def resolve_routing(parsed: dict[str, Any]) -> dict[str, Any]:
    bill_ref = parsed["bill_ref_number"].strip()
    upper = bill_ref.upper()

    if upper.startswith("WAL:"):
        return await _find_wallet_match(parsed)
    if upper.startswith("ORD:"):
        return await _find_order_match(parsed)

    return {
        "routing_target_type": ROUTING_RECONCILIATION,
        "routing_target_id": None,
        "routing_user_id": None,
        "failure_reason": "unsupported_bill_reference",
    }


async def persist_c2b_confirmation(
    parsed: dict[str, Any],
    routing: dict[str, Any],
) -> dict[str, Any]:
    payload = {
        "p_trans_id": parsed["trans_id"],
        "p_amount": float(parsed["amount"]),
        "p_currency": "KES",
        "p_bill_ref_number": parsed["bill_ref_number"],
        "p_msisdn_normalized": parsed["msisdn_normalized"],
        "p_msisdn_raw": parsed["msisdn_raw"],
        "p_business_shortcode": parsed["business_shortcode"],
        "p_transaction_type": parsed["transaction_type"],
        "p_trans_time": parsed["trans_time"],
        "p_raw_payload": parsed["raw_payload"],
        "p_routing_target_type": routing["routing_target_type"],
        "p_routing_target_id": routing.get("routing_target_id"),
        "p_routing_user_id": routing.get("routing_user_id"),
        "p_failure_reason": routing.get("failure_reason"),
    }
    result = await db_rpc(
        "apply_mpesa_c2b_confirmation",
        params=payload,
        token=settings.SUPABASE_SERVICE_ROLE_KEY,
    )
    if not isinstance(result, dict):
        raise HTTPException(status_code=500, detail="Failed to persist M-PESA confirmation")
    return result


async def confirm_c2b_request(request: Request, payload: dict[str, Any]) -> dict[str, Any]:
    source_ip, immediate_ip = get_request_ips(request)
    try:
        assert_allowed_source(request)
    except HTTPException:
        await create_audit_log(
            request_type="confirmation",
            payload=payload,
            source_ip=source_ip,
            immediate_ip=immediate_ip,
            disposition="rejected",
            failure_reason="source_ip_not_allowed",
        )
        raise

    try:
        parsed = parse_c2b_payload(payload)
    except ValueError as exc:
        await create_audit_log(
            request_type="confirmation",
            payload=payload,
            source_ip=source_ip,
            immediate_ip=immediate_ip,
            disposition="rejected",
            failure_reason=str(exc),
        )
        return {"ResultCode": 1, "ResultDesc": str(exc)}

    routing = await resolve_routing(parsed)
    audit_id = await create_audit_log(
        request_type="confirmation",
        payload=payload,
        source_ip=source_ip,
        immediate_ip=immediate_ip,
        disposition="received",
        parsed=parsed,
        matched_entity_type=routing.get("routing_target_type"),
        matched_entity_id=routing.get("routing_target_id"),
    )

    result = await persist_c2b_confirmation(parsed, routing)
    status = str(result.get("status") or "").lower()
    if status not in {"processed", "duplicate", "needs_reconciliation"}:
        status = "processed" if routing["routing_target_type"] in {ROUTING_WALLET, ROUTING_ORDER} else "needs_reconciliation"

    await update_audit_log(
        audit_id,
        disposition=status,
        failure_reason=result.get("failure_reason") or routing.get("failure_reason"),
        matched_entity_type=routing.get("routing_target_type"),
        matched_entity_id=routing.get("routing_target_id"),
        ledger_id=result.get("ledger_id"),
    )

    return {"ResultCode": 0, "ResultDesc": "Accepted", "status": status}
