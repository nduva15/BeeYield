from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from fastapi import HTTPException, Request, status

from app.core.config import settings
from app.db.supabase_db import db_insert, db_rpc, db_select, db_update

_AUDIT_TABLE = "mpesa_c2b_audit_logs"


def normalize_kenyan_phone(raw_phone: str | None) -> str:
    digits = "".join(ch for ch in str(raw_phone or "") if ch.isdigit())
    if digits.startswith("254") and len(digits) >= 12:
        return digits
    if digits.startswith("0") and len(digits) == 10:
        return f"254{digits[1:]}"
    if len(digits) == 9:
        return f"254{digits}"
    return digits


def _allowed_shortcodes() -> set[str]:
    allowed = {str(code).strip() for code in settings.MPESA_ALLOWED_SHORTCODES if str(code).strip()}
    shortcode = str(settings.MPESA_BUSINESS_SHORTCODE or "").strip()
    if shortcode:
        allowed.add(shortcode)
    return allowed


def _client_host(request: Request) -> str:
    return getattr(request.client, "host", "") or ""


def _resolve_source_ip(request: Request) -> str:
    client_host = _client_host(request)
    trusted_proxies = {ip.strip() for ip in settings.MPESA_TRUSTED_PROXY_IPS if ip.strip()}
    forwarded_for = request.headers.get("x-forwarded-for", "")

    if client_host in trusted_proxies and forwarded_for:
        forwarded_chain = [part.strip() for part in forwarded_for.split(",") if part.strip()]
        if forwarded_chain:
            return forwarded_chain[0]

    return client_host


def _require_allowed_source_ip(request: Request) -> str:
    source_ip = _resolve_source_ip(request)
    allowlist = {ip.strip() for ip in settings.MPESA_SAFARICOM_IP_ALLOWLIST if ip.strip()}
    if allowlist and source_ip not in allowlist:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="source_ip_not_allowed",
        )
    return source_ip


async def _insert_audit(payload: dict[str, Any], *, source_ip: str, disposition: str, failure_reason: str | None = None) -> str | None:
    audit_payload = {
        "trans_id": payload.get("TransID"),
        "bill_ref_number": payload.get("BillRefNumber"),
        "business_shortcode": payload.get("BusinessShortCode"),
        "msisdn": normalize_kenyan_phone(payload.get("MSISDN")),
        "source_ip": source_ip,
        "disposition": disposition,
        "failure_reason": failure_reason,
        "payload": payload,
    }
    result = await db_insert(_AUDIT_TABLE, audit_payload, token=settings.SUPABASE_SERVICE_ROLE_KEY)
    if result.get("success") and result.get("data"):
        return result["data"][0].get("id")
    return None


async def _update_audit(audit_id: str | None, *, disposition: str, failure_reason: str | None = None, rpc_result: dict[str, Any] | None = None) -> None:
    if not audit_id:
        return
    update_payload: dict[str, Any] = {"disposition": disposition}
    if failure_reason is not None:
        update_payload["failure_reason"] = failure_reason
    if rpc_result is not None:
        update_payload["rpc_result"] = rpc_result
    await db_update(_AUDIT_TABLE, update_payload, {"id": audit_id}, token=settings.SUPABASE_SERVICE_ROLE_KEY)


def _validation_response(result_code: int = 0, description: str = "Accepted") -> dict[str, Any]:
    return {"ResultCode": result_code, "ResultDesc": description}


def _assert_known_shortcode(payload: dict[str, Any]) -> None:
    allowed = _allowed_shortcodes()
    shortcode = str(payload.get("BusinessShortCode") or "").strip()
    if allowed and shortcode not in allowed:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="business_shortcode_not_allowed")


@dataclass
class RoutingTarget:
    routing_type: str
    routing_id: str | None
    user_id: str | None
    failure_reason: str | None = None


async def _find_wallet_target(reference: str, payer_phone: str) -> RoutingTarget:
    wallets = await db_select(
        "wallets",
        filters={"account_reference": reference},
        limit=1,
        token=settings.SUPABASE_SERVICE_ROLE_KEY,
    )
    if not wallets:
        return RoutingTarget("needs_reconciliation", None, None, "wallet_not_found")

    wallet = wallets[0]
    user_id = wallet.get("user_id")
    if user_id:
        profiles = await db_select(
            "profiles",
            filters={"id": user_id},
            limit=1,
            token=settings.SUPABASE_SERVICE_ROLE_KEY,
        )
        if profiles:
            profile_phone = normalize_kenyan_phone(profiles[0].get("phone_normalized"))
            if profile_phone and payer_phone and profile_phone != payer_phone:
                return RoutingTarget("needs_reconciliation", None, user_id, "wallet_phone_mismatch")

    return RoutingTarget("wallet", wallet.get("id"), user_id)


async def _find_order_target(reference: str, payer_phone: str) -> RoutingTarget:
    orders = await db_select(
        "orders",
        filters={"order_number": reference},
        limit=1,
        token=settings.SUPABASE_SERVICE_ROLE_KEY,
    )
    if not orders:
        return RoutingTarget("needs_reconciliation", None, None, "order_not_found")

    order = orders[0]
    user_id = order.get("user_id")
    if user_id:
        profiles = await db_select(
            "profiles",
            filters={"id": user_id},
            limit=1,
            token=settings.SUPABASE_SERVICE_ROLE_KEY,
        )
        if profiles:
            profile_phone = normalize_kenyan_phone(profiles[0].get("phone_normalized"))
            if profile_phone and payer_phone and profile_phone != payer_phone:
                return RoutingTarget("needs_reconciliation", None, user_id, "order_phone_mismatch")

    return RoutingTarget("order", order.get("id"), user_id)


async def _resolve_routing_target(payload: dict[str, Any]) -> RoutingTarget:
    bill_ref = str(payload.get("BillRefNumber") or "").strip()
    payer_phone = normalize_kenyan_phone(payload.get("MSISDN"))

    if bill_ref.startswith("WAL:"):
        return await _find_wallet_target(bill_ref.removeprefix("WAL:"), payer_phone)
    if bill_ref.startswith("ORD:"):
        return await _find_order_target(bill_ref.removeprefix("ORD:"), payer_phone)

    return RoutingTarget("needs_reconciliation", None, None, "unsupported_bill_ref")


async def validate_c2b(request: Request, payload: dict[str, Any]) -> dict[str, Any]:
    _assert_known_shortcode(payload)

    try:
        source_ip = _require_allowed_source_ip(request)
    except HTTPException as exc:
        source_ip = _resolve_source_ip(request)
        await _insert_audit(payload, source_ip=source_ip, disposition="rejected", failure_reason=str(exc.detail))
        raise

    await _insert_audit(payload, source_ip=source_ip, disposition="received")
    return _validation_response()


async def confirm_c2b(request: Request, payload: dict[str, Any]) -> dict[str, Any]:
    _assert_known_shortcode(payload)

    try:
        source_ip = _require_allowed_source_ip(request)
    except HTTPException as exc:
        source_ip = _resolve_source_ip(request)
        await _insert_audit(payload, source_ip=source_ip, disposition="rejected", failure_reason=str(exc.detail))
        raise

    audit_id = await _insert_audit(payload, source_ip=source_ip, disposition="received")
    routing = await _resolve_routing_target(payload)

    rpc_params = {
        "p_trans_id": payload.get("TransID"),
        "p_trans_time": payload.get("TransTime"),
        "p_trans_amount": payload.get("TransAmount"),
        "p_msisdn": normalize_kenyan_phone(payload.get("MSISDN")),
        "p_bill_ref_number": payload.get("BillRefNumber"),
        "p_business_shortcode": payload.get("BusinessShortCode"),
        "p_first_name": payload.get("FirstName"),
        "p_middle_name": payload.get("MiddleName"),
        "p_last_name": payload.get("LastName"),
        "p_org_account_balance": payload.get("OrgAccountBalance"),
        "p_routing_target_type": routing.routing_type,
        "p_routing_target_id": routing.routing_id,
        "p_user_id": routing.user_id,
    }
    if routing.failure_reason:
        rpc_params["p_failure_reason"] = routing.failure_reason

    rpc_result = await db_rpc(
        "apply_mpesa_c2b_confirmation",
        params=rpc_params,
        token=settings.SUPABASE_SERVICE_ROLE_KEY,
    ) or {}

    final_status = str(rpc_result.get("status") or ("processed" if routing.routing_type != "needs_reconciliation" else "needs_reconciliation"))
    failure_reason = rpc_result.get("failure_reason") or routing.failure_reason
    await _update_audit(audit_id, disposition=final_status, failure_reason=failure_reason, rpc_result=rpc_result)

    return {
        **_validation_response(),
        "status": final_status,
        **rpc_result,
    }
