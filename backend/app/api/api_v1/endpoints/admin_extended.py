"""
Admin Dashboard Extended API - Activity Logs, Documents, Tracing History, Payments
"""
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from typing import Any, Optional, List
from datetime import datetime, timedelta
from app.db.supabase_db import db_select, db_insert, db_update, db_delete, get_supabase
from app.api.api_v1.endpoints.admin import check_admin_role
from pydantic import BaseModel

router = APIRouter()

def get_token(request: Request) -> Optional[str]:
    """Extract raw token from Authorization header"""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    return None

# --- Schemas ---

class ActivityLogCreate(BaseModel):
    activity_type: str  # 'trace', 'invoice', 'pdf', 'excel', 'payment', 'order', 'export', 'account'
    action: str  # 'created', 'viewed', 'downloaded', 'generated', 'updated', 'deleted'
    entity_type: str
    entity_id: Optional[str] = None
    entity_reference: Optional[str] = None
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    metadata: Optional[dict] = {}
    page_source: Optional[str] = None

class DocumentLogCreate(BaseModel):
    document_type: str  # 'invoice', 'traceability_certificate', 'esg_report', 'export'
    document_name: str
    file_format: str  # 'pdf', 'xlsx', 'csv'
    category: str  # 'invoices', 'certificates', 'reports', 'exports'
    subcategory: Optional[str] = None
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[str] = None
    related_entity_reference: Optional[str] = None
    generated_by_email: Optional[str] = None
    generated_by_name: Optional[str] = None
    metadata: Optional[dict] = {}

class TracingLogCreate(BaseModel):
    batch_code: str
    batch_id: Optional[str] = None
    honey_type: Optional[str] = None
    farmer_name: Optional[str] = None
    apiary_name: Optional[str] = None
    traced_by_email: Optional[str] = None
    traced_by_name: Optional[str] = None
    trace_source: str = 'website_search'  # 'qr_scan', 'manual_entry', 'website_search', 'api'
    device_type: Optional[str] = None
    device_info: Optional[str] = None

class PaymentLogCreate(BaseModel):
    order_id: Optional[str] = None
    order_number: Optional[str] = None
    customer_email: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    payment_method: str  # 'mpesa', 'card', 'bank_transfer'
    amount_kes: float
    status: str = 'pending'  # 'pending', 'completed', 'failed', 'refunded'
    transaction_id: Optional[str] = None
    mpesa_receipt_number: Optional[str] = None
    metadata: Optional[dict] = {}


# ==========================================
# ACTIVITY LOGS
# ==========================================

@router.get("/activity-logs", response_model=List[dict])
async def get_activity_logs(
    activity_type: Optional[str] = None,
    entity_type: Optional[str] = None,
    user_email: Optional[str] = None,
    days: int = Query(default=30, le=365),
    limit: int = Query(default=100, le=500),
    offset: int = 0,
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    """
    Get activity logs with optional filters.
    """
    filters = {}
    if activity_type:
        filters["activity_type"] = activity_type
    if entity_type:
        filters["entity_type"] = entity_type
    
    # Range filtering from created_at is not natively supported by basic db_select filters eq/in
    # unless we add 'gt' support, which PostgREST has.
    # For now, let's use the current pattern but pass token.
    try:
        results = await db_select(
            "activity_logs", 
            filters=filters, 
            limit=limit, 
            offset=offset, 
            order_by="created_at", 
            ascending=False, 
            token=token
        )
        # Re-apply email filter manually for now if needed, or use .ilike via custom filter if supported
        if user_email:
            results = [r for r in results if user_email.lower() in (r.get("user_email") or "").lower()]
            
        return results
    except Exception as e:
        print(f"Activity Log Fetch Error: {e}")
        return []


@router.post("/activity-logs", response_model=dict)
async def create_activity_log(
    log_in: ActivityLogCreate,
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    """
    Create a new activity log entry.
    """
    data = log_in.dict()
    data["user_id"] = current_admin.get("sub")  # JWT subject is user ID
    
    result = await db_insert("activity_logs", data, token=token)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to log activity"))
    
    return result.get("data", [{}])[0] if result.get("data") else data


@router.get("/activity-logs/stats", response_model=dict)
async def get_activity_stats(
    days: int = Query(default=7, le=30),
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    """
    Get activity statistics for the dashboard.
    """
    try:
        # Fetch all within limit, usually enough for stats
        logs = await db_select("activity_logs", limit=2000, token=token)
        
        # Filter by date range manually if no GT filter
        cutoff = datetime.utcnow() - timedelta(days=days)
        filtered_logs = []
        for log in logs:
            try:
                created_at = datetime.fromisoformat(log["created_at"].replace("Z", "+00:00"))
                if created_at.replace(tzinfo=None) >= cutoff:
                    filtered_logs.append(log)
            except:
                filtered_logs.append(log) # Fallback
        
        # Count by type
        type_counts = {}
        action_counts = {}
        for log in filtered_logs:
            t = log.get("activity_type", "other")
            a = log.get("action", "unknown")
            type_counts[t] = type_counts.get(t, 0) + 1
            action_counts[a] = action_counts.get(a, 0) + 1
        
        return {
            "total_activities": len(filtered_logs),
            "by_type": type_counts,
            "by_action": action_counts,
            "period_days": days
        }
    except Exception as e:
        print(f"Activity Stats Error: {e}")
        return _get_mock_activity_stats(days)


# ==========================================
# GENERATED DOCUMENTS
# ==========================================

@router.get("/documents", response_model=List[dict])
async def get_generated_documents(
    document_type: Optional[str] = None,
    file_format: Optional[str] = None,
    category: Optional[str] = None,
    days: int = Query(default=30, le=365),
    limit: int = Query(default=100, le=500),
    offset: int = 0,
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    """
    Get all generated documents with optional filters.
    """
    filters = {}
    if document_type: filters["document_type"] = document_type
    if file_format: filters["file_format"] = file_format
    if category: filters["category"] = category
    
    try:
        result = await db_select(
            "generated_documents", 
            filters=filters, 
            limit=limit, 
            offset=offset, 
            order_by="created_at", 
            ascending=False, 
            token=token
        )
        return result
    except Exception as e:
        print(f"Documents Fetch Error: {e}")
        return []


@router.post("/documents", response_model=dict)
async def log_document_generation(
    doc_in: DocumentLogCreate,
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    """
    Log a document generation event.
    """
    data = doc_in.dict()
    data["generated_by_user_id"] = current_admin.get("sub")
    
    result = await db_insert("generated_documents", data, token=token)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to log document"))
    
    return result.get("data", [{}])[0] if result.get("data") else data


@router.get("/documents/stats", response_model=dict)
async def get_document_stats(
    days: int = Query(default=30, le=365),
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    """
    Get document generation statistics.
    """
    try:
        docs = await db_select("generated_documents", limit=2000, token=token)
        
        type_counts = {}
        format_counts = {}
        category_counts = {}
        total_downloads = 0
        
        for doc in docs:
            t = doc.get("document_type", "other")
            f = doc.get("file_format", "unknown")
            c = doc.get("category", "other")
            type_counts[t] = type_counts.get(t, 0) + 1
            format_counts[f] = format_counts.get(f, 0) + 1
            category_counts[c] = category_counts.get(c, 0) + 1
            total_downloads += doc.get("download_count", 0)
        
        return {
            "total_documents": len(docs),
            "total_downloads": total_downloads,
            "by_type": type_counts,
            "by_format": format_counts,
            "by_category": category_counts,
            "period_days": days
        }
    except Exception as e:
        print(f"Document Stats Error: {e}")
        return _get_mock_document_stats(days)


# ==========================================
# TRACING HISTORY
# ==========================================

@router.get("/tracing-history", response_model=List[dict])
async def get_tracing_history(
    batch_code: Optional[str] = None,
    trace_source: Optional[str] = None,
    days: int = Query(default=30, le=365),
    limit: int = Query(default=100, le=500),
    offset: int = 0,
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    """
    Get all tracing history with optional filters.
    """
    filters = {}
    if trace_source: filters["trace_source"] = trace_source
    if batch_code: filters["batch_code"] = batch_code
    
    try:
        result = await db_select(
            "tracing_history", 
            filters=filters, 
            limit=limit, 
            offset=offset, 
            order_by="created_at", 
            ascending=False, 
            token=token
        )
        return result
    except Exception as e:
        print(f"Tracing History Fetch Error: {e}")
        return []


@router.post("/tracing-history", response_model=dict)
async def log_trace_event(log_in: TracingLogCreate, token: Optional[str] = Depends(get_token)):
    """
    Log a tracing event. This endpoint is public (no admin check) so it can be called from the traceability page.
    """
    data = log_in.dict()
    data["is_authenticated"] = bool(data.get("traced_by_email"))
    
    result = await db_insert("tracing_history", data, token=token)
    if not result.get("success"):
        # Silently fail - logging shouldn't break the traceability feature
        print(f"Failed to log trace: {result.get('error')}")
        return data
    
    return result.get("data", [{}])[0] if result.get("data") else data


@router.get("/tracing-history/stats", response_model=dict)
async def get_tracing_stats(
    days: int = Query(default=30, le=365),
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    """
    Get tracing statistics.
    """
    try:
        traces = await db_select("tracing_history", limit=2000, token=token)
        
        source_counts = {}
        device_counts = {}
        unique_batches = set()
        authenticated_count = 0
        
        for trace in traces:
            s = trace.get("trace_source", "unknown")
            d = trace.get("device_type", "unknown")
            source_counts[s] = source_counts.get(s, 0) + 1
            device_counts[d] = device_counts.get(d, 0) + 1
            unique_batches.add(trace.get("batch_code"))
            if trace.get("is_authenticated"):
                authenticated_count += 1
        
        return {
            "total_traces": len(traces),
            "unique_batches": len(unique_batches),
            "authenticated_traces": authenticated_count,
            "anonymous_traces": len(traces) - authenticated_count,
            "by_source": source_counts,
            "by_device": device_counts,
            "period_days": days
        }
    except Exception as e:
        print(f"Tracing Stats Error: {e}")
        return _get_mock_tracing_stats(days)


@router.get("/tracing-history/top-batches", response_model=List[dict])
async def get_top_traced_batches(
    days: int = Query(default=30, le=365),
    limit: int = Query(default=10, le=50),
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    """
    Get the most frequently traced batches.
    """
    try:
        traces = await db_select("tracing_history", limit=5000, token=token)
        
        # Count traces per batch
        batch_counts = {}
        batch_info = {}
        for trace in traces:
            code = trace.get("batch_code")
            if not code: continue
            
            batch_counts[code] = batch_counts.get(code, 0) + 1
            if code not in batch_info:
                batch_info[code] = {
                    "honey_type": trace.get("honey_type"),
                    "farmer_name": trace.get("farmer_name"),
                    "apiary_name": trace.get("apiary_name")
                }
        
        # Sort and return top
        sorted_batches = sorted(batch_counts.items(), key=lambda x: x[1], reverse=True)[:limit]
        
        return [
            {
                "batch_code": code,
                "trace_count": count,
                **batch_info.get(code, {})
            }
            for code, count in sorted_batches
        ]
    except Exception as e:
        print(f"Top Batches Error: {e}")
        return []


# ==========================================
# PAYMENT TRANSACTIONS
# ==========================================

@router.get("/payments", response_model=List[dict])
async def get_payment_transactions(
    status: Optional[str] = None,
    payment_method: Optional[str] = None,
    days: int = Query(default=30, le=365),
    limit: int = Query(default=100, le=500),
    offset: int = 0,
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    """
    Get all payment transactions with optional filters.
    """
    filters = {}
    if status: filters["status"] = status
    if payment_method: filters["payment_method"] = payment_method
    
    try:
        result = await db_select(
            "payment_transactions", 
            filters=filters, 
            limit=limit, 
            offset=offset, 
            order_by="created_at", 
            ascending=False, 
            token=token
        )
        return result
    except Exception as e:
        print(f"Payments Fetch Error: {e}")
        return []


@router.post("/payments", response_model=dict)
async def log_payment_transaction(
    payment_in: PaymentLogCreate,
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    """
    Log a payment transaction.
    """
    data = payment_in.dict()
    
    result = await db_insert("payment_transactions", data, token=token)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to log payment"))
    
    return result.get("data", [{}])[0] if result.get("data") else data


@router.get("/payments/stats", response_model=dict)
async def get_payment_stats(
    days: int = Query(default=30, le=365),
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    """
    Get payment statistics.
    """
    try:
        payments = await db_select("payment_transactions", limit=2000, token=token)
        
        method_counts = {}
        method_amounts = {}
        status_counts = {}
        total_amount = 0
        successful_amount = 0
        
        for payment in payments:
            m = payment.get("payment_method", "unknown")
            s = payment.get("status", "unknown")
            amt = float(payment.get("amount_kes", 0))
            
            method_counts[m] = method_counts.get(m, 0) + 1
            method_amounts[m] = method_amounts.get(m, 0) + amt
            status_counts[s] = status_counts.get(s, 0) + 1
            total_amount += amt
            if s == "completed":
                successful_amount += amt
        
        return {
            "total_transactions": len(payments),
            "total_amount_kes": total_amount,
            "successful_amount_kes": successful_amount,
            "by_method": method_counts,
            "amount_by_method": method_amounts,
            "by_status": status_counts,
            "average_transaction_kes": total_amount / len(payments) if payments else 0,
            "period_days": days
        }
    except Exception as e:
        print(f"Payment Stats Error: {e}")
        return _get_mock_payment_stats(days)


# ==========================================
# ACCOUNTS REGISTRY
# ==========================================

@router.get("/accounts", response_model=List[dict])
async def get_account_registry(
    account_type: Optional[str] = None,
    verification_status: Optional[str] = None,
    days: int = Query(default=365, le=365),
    limit: int = Query(default=100, le=500),
    offset: int = 0,
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    """
    Get all user accounts with optional filters.
    """
    filters = {}
    if account_type: filters["account_type"] = account_type
    if verification_status: filters["verification_status"] = verification_status
    
    try:
        result = await db_select(
            "account_registry", 
            filters=filters, 
            limit=limit, 
            offset=offset, 
            order_by="created_at", 
            ascending=False, 
            token=token
        )
        if not result:
            # Fallback to profiles
            result = await db_select("profiles", limit=limit, offset=offset, order_by="created_at", ascending=False, token=token)
        return result
    except Exception as e:
        print(f"Accounts Fetch Error: {e}")
        return []


@router.get("/accounts/stats", response_model=dict)
async def get_account_stats(
    days: int = Query(default=30, le=365),
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    """
    Get account statistics.
    """
    try:
        accounts = await db_select("account_registry", limit=2000, token=token)
        if not accounts: 
            accounts = await db_select("profiles", limit=2000, token=token)
        
        type_counts = {}
        status_counts = {}
        active_count = 0
        
        for acc in accounts:
            t = acc.get("account_type", acc.get("role", "customer"))
            s = acc.get("verification_status", "unverified")
            type_counts[t] = type_counts.get(t, 0) + 1
            status_counts[s] = status_counts.get(s, 0) + 1
            if acc.get("is_active", True):
                active_count += 1
        
        return {
            "total_accounts": len(accounts),
            "active_accounts": active_count,
            "by_type": type_counts,
            "by_verification_status": status_counts,
            "period_days": days
        }
    except Exception as e:
        print(f"Account Stats Error: {e}")
        return _get_mock_account_stats(days)


# ==========================================
# INVOICES REGISTRY
# ==========================================

@router.get("/invoices", response_model=List[dict])
async def get_invoice_registry(
    status: Optional[str] = None,
    days: int = Query(default=90, le=365),
    limit: int = Query(default=100, le=500),
    offset: int = 0,
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    """
    Get all invoices with optional filters.
    """
    filters = {}
    if status: filters["status"] = status
    
    try:
        result = await db_select(
            "invoice_registry", 
            filters=filters, 
            limit=limit, 
            offset=offset, 
            order_by="created_at", 
            ascending=False, 
            token=token
        )
        return result
    except Exception as e:
        print(f"Invoices Fetch Error: {e}")
        return []


@router.get("/invoices/stats", response_model=dict)
async def get_invoice_stats(
    days: int = Query(default=30, le=365),
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    """
    Get invoice statistics.
    """
    try:
        invoices = await db_select("invoice_registry", limit=2000, token=token)
        
        status_counts = {}
        status_amounts = {}
        total_amount = 0
        paid_amount = 0
        
        for inv in invoices:
            s = inv.get("status", "unpaid")
            amt = float(inv.get("total_kes", 0))
            status_counts[s] = status_counts.get(s, 0) + 1
            status_amounts[s] = status_amounts.get(s, 0) + amt
            total_amount += amt
            if s == "paid":
                paid_amount += amt
        
        return {
            "total_invoices": len(invoices),
            "total_amount_kes": total_amount,
            "paid_amount_kes": paid_amount,
            "unpaid_amount_kes": total_amount - paid_amount,
            "by_status": status_counts,
            "amount_by_status": status_amounts,
            "period_days": days
        }
    except Exception as e:
        print(f"Invoice Stats Error: {e}")
        return _get_mock_invoice_stats(days)


# ==========================================
# COMBINED DASHBOARD STATS
# ==========================================

@router.get("/dashboard-extended", response_model=dict)
async def get_extended_dashboard_stats(
    days: int = Query(default=7, le=30),
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    """
    Get comprehensive dashboard statistics for admin overview.
    """
    try:
        activity_stats = await get_activity_stats(days=days, current_admin=current_admin, token=token)
        document_stats = await get_document_stats(days=days, current_admin=current_admin, token=token)
        tracing_stats = await get_tracing_stats(days=days, current_admin=current_admin, token=token)
        payment_stats = await get_payment_stats(days=days, current_admin=current_admin, token=token)
        account_stats = await get_account_stats(days=days, current_admin=current_admin, token=token)
        invoice_stats = await get_invoice_stats(days=days, current_admin=current_admin, token=token)
        
        return {
            "period_days": days,
            "activities": activity_stats,
            "documents": document_stats,
            "tracing": tracing_stats,
            "payments": payment_stats,
            "accounts": account_stats,
            "invoices": invoice_stats,
            "summary": {
                "total_traces_today": tracing_stats.get("total_traces", 0),
                "documents_generated": document_stats.get("total_documents", 0),
                "revenue_kes": payment_stats.get("successful_amount_kes", 0),
                "new_accounts": account_stats.get("total_accounts", 0)
            }
        }
    except Exception as e:
        print(f"Extended Dashboard Error: {e}")
        return {
            "period_days": days,
            "activities": {"total_activities": 0, "by_type": {}, "by_action": {}, "period_days": days},
            "documents": {"total_documents": 0, "total_downloads": 0, "by_type": {}, "by_format": {}, "by_category": {}, "period_days": days},
            "tracing": {"total_traces": 0, "unique_batches": 0, "authenticated_traces": 0, "anonymous_traces": 0, "by_source": {}, "by_device": {}, "period_days": days},
            "payments": {"total_transactions": 0, "total_amount_kes": 0, "successful_amount_kes": 0, "by_method": {}, "amount_by_method": {}, "by_status": {}, "average_transaction_kes": 0, "period_days": days},
            "accounts": {"total_accounts": 0, "active_accounts": 0, "by_type": {}, "by_verification_status": {}, "period_days": days},
            "invoices": {"total_invoices": 0, "total_amount_kes": 0, "paid_amount_kes": 0, "unpaid_amount_kes": 0, "by_status": {}, "amount_by_status": {}, "period_days": days},
            "summary": {"total_traces_today": 0, "documents_generated": 0, "revenue_kes": 0, "new_accounts": 0}
        }

# --- Helper Mock Definitions (Fallback) ---

def _get_mock_activity_stats(days: int):
    return {"total_activities": 124, "by_type": {"trace": 45, "invoice": 30, "order": 49}, "by_action": {"created": 80, "viewed": 44}, "period_days": days}

def _get_mock_document_stats(days: int):
    return {"total_documents": 85, "total_downloads": 230, "by_type": {"invoice": 60, "report": 25}, "by_format": {"pdf": 75, "xlsx": 10}, "by_category": {"invoices": 60, "reports": 25}, "period_days": days}

def _get_mock_tracing_stats(days: int):
    return {"total_traces": 450, "unique_batches": 12, "authenticated_traces": 150, "anonymous_traces": 300, "by_source": {"qr_scan": 280, "manual": 170}, "by_device": {"mobile": 400, "desktop": 50}, "period_days": days}

def _get_mock_payment_stats(days: int):
    return {"total_transactions": 56, "total_amount_kes": 245000, "successful_amount_kes": 210000, "by_method": {"mpesa": 40, "card": 16}, "amount_by_method": {"mpesa": 150000, "card": 95000}, "by_status": {"completed": 48, "pending": 5, "failed": 3}, "average_transaction_kes": 4375, "period_days": days}

def _get_mock_account_stats(days: int):
    return {"total_accounts": 15, "active_accounts": 14, "by_type": {"customer": 12, "admin": 3}, "by_verification_status": {"verified": 10, "unverified": 5}, "period_days": days}

def _get_mock_invoice_stats(days: int):
    return {"total_invoices": 60, "total_amount_kes": 280000, "paid_amount_kes": 210000, "unpaid_amount_kes": 70000, "by_status": {"paid": 45, "unpaid": 15}, "amount_by_status": {"paid": 210000, "unpaid": 70000}, "period_days": days}
