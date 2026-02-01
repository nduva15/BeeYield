"""
Admin Dashboard Extended API - Activity Logs, Documents, Tracing History, Payments
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Any, Optional, List
from datetime import datetime, timedelta
from app.db.supabase_db import db_select, db_insert, db_update, db_delete, get_supabase
from app.api.api_v1.endpoints.admin import check_admin_role
from pydantic import BaseModel

router = APIRouter()

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
def get_activity_logs(
    activity_type: Optional[str] = None,
    entity_type: Optional[str] = None,
    user_email: Optional[str] = None,
    days: int = Query(default=30, le=365),
    limit: int = Query(default=100, le=500),
    offset: int = 0,
    current_admin: dict = Depends(check_admin_role)
):
    """
    Get activity logs with optional filters.
    """
    try:
        supabase = get_supabase()
        if not supabase:
            return []
            
        query = supabase.table("activity_logs").select("*")
        
        if activity_type:
            query = query.eq("activity_type", activity_type)
        if entity_type:
            query = query.eq("entity_type", entity_type)
        if user_email:
            query = query.ilike("user_email", f"%{user_email}%")
        
        # Filter by date range
        cutoff = (datetime.utcnow() - timedelta(days=days)).isoformat()
        query = query.gte("created_at", cutoff)
        
        result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        return result.data if result.data else []
    except Exception as e:
        print(f"Activity Log Fetch Error: {e}")
        # Return fallback mock data if table doesn't exist yet
        return []


@router.post("/activity-logs", response_model=dict)
def create_activity_log(
    log_in: ActivityLogCreate,
    current_admin: dict = Depends(check_admin_role)
):
    """
    Create a new activity log entry.
    """
    data = log_in.dict()
    data["user_id"] = current_admin.get("sub")  # JWT subject is user ID
    
    result = db_insert("activity_logs", data)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to log activity"))
    
    return result.get("data", [{}])[0] if result.get("data") else data


@router.get("/activity-logs/stats", response_model=dict)
def get_activity_stats(
    days: int = Query(default=7, le=30),
    current_admin: dict = Depends(check_admin_role)
):
    """
    Get activity statistics for the dashboard.
    """
    try:
        supabase = get_supabase()
        if not supabase:
            return _get_mock_activity_stats()
        
        cutoff = (datetime.utcnow() - timedelta(days=days)).isoformat()
        
        result = supabase.table("activity_logs").select("activity_type, action").gte("created_at", cutoff).execute()
        logs = result.data if result.data else []
        
        # Count by type
        type_counts = {}
        action_counts = {}
        for log in logs:
            t = log.get("activity_type", "other")
            a = log.get("action", "unknown")
            type_counts[t] = type_counts.get(t, 0) + 1
            action_counts[a] = action_counts.get(a, 0) + 1
        
        return {
            "total_activities": len(logs),
            "by_type": type_counts,
            "by_action": action_counts,
            "period_days": days
        }
    except Exception as e:
        print(f"Activity Stats Error: {e}")
        return {"total_activities": 0, "by_type": {}, "by_action": {}, "period_days": days}


# ==========================================
# GENERATED DOCUMENTS
# ==========================================

@router.get("/documents", response_model=List[dict])
def get_generated_documents(
    document_type: Optional[str] = None,
    file_format: Optional[str] = None,
    category: Optional[str] = None,
    days: int = Query(default=30, le=365),
    limit: int = Query(default=100, le=500),
    offset: int = 0,
    current_admin: dict = Depends(check_admin_role)
):
    """
    Get all generated documents with optional filters.
    """
    try:
        supabase = get_supabase()
        if not supabase:
            return []
        
        query = supabase.table("generated_documents").select("*")
        
        if document_type:
            query = query.eq("document_type", document_type)
        if file_format:
            query = query.eq("file_format", file_format)
        if category:
            query = query.eq("category", category)
        
        cutoff = (datetime.utcnow() - timedelta(days=days)).isoformat()
        query = query.gte("created_at", cutoff)
        
        result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        return result.data if result.data else []
    except Exception as e:
        print(f"Documents Fetch Error: {e}")
        return []


@router.post("/documents", response_model=dict)
def log_document_generation(
    doc_in: DocumentLogCreate,
    current_admin: dict = Depends(check_admin_role)
):
    """
    Log a document generation event.
    """
    data = doc_in.dict()
    data["generated_by_user_id"] = current_admin.get("sub")
    
    result = db_insert("generated_documents", data)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to log document"))
    
    return result.get("data", [{}])[0] if result.get("data") else data


@router.get("/documents/stats", response_model=dict)
def get_document_stats(
    days: int = Query(default=30, le=365),
    current_admin: dict = Depends(check_admin_role)
):
    """
    Get document generation statistics.
    """
    try:
        supabase = get_supabase()
        if not supabase:
            return _get_mock_document_stats()
        
        cutoff = (datetime.utcnow() - timedelta(days=days)).isoformat()
        
        result = supabase.table("generated_documents").select("document_type, file_format, category, download_count").gte("created_at", cutoff).execute()
        docs = result.data if result.data else []
        
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
        return {"total_documents": 0, "total_downloads": 0, "by_type": {}, "by_format": {}, "by_category": {}, "period_days": days}


# ==========================================
# TRACING HISTORY
# ==========================================

@router.get("/tracing-history", response_model=List[dict])
def get_tracing_history(
    batch_code: Optional[str] = None,
    trace_source: Optional[str] = None,
    days: int = Query(default=30, le=365),
    limit: int = Query(default=100, le=500),
    offset: int = 0,
    current_admin: dict = Depends(check_admin_role)
):
    """
    Get all tracing history with optional filters.
    """
    try:
        supabase = get_supabase()
        if not supabase:
            return []
        
        query = supabase.table("tracing_history").select("*")
        
        if batch_code:
            query = query.ilike("batch_code", f"%{batch_code}%")
        if trace_source:
            query = query.eq("trace_source", trace_source)
        
        cutoff = (datetime.utcnow() - timedelta(days=days)).isoformat()
        query = query.gte("created_at", cutoff)
        
        result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        return result.data if result.data else []
    except Exception as e:
        print(f"Tracing History Fetch Error: {e}")
        return []


@router.post("/tracing-history", response_model=dict)
def log_trace_event(log_in: TracingLogCreate):
    """
    Log a tracing event. This endpoint is public (no admin check) so it can be called from the traceability page.
    """
    data = log_in.dict()
    data["is_authenticated"] = bool(data.get("traced_by_email"))
    
    result = db_insert("tracing_history", data)
    if not result.get("success"):
        # Silently fail - logging shouldn't break the traceability feature
        print(f"Failed to log trace: {result.get('error')}")
        return data
    
    return result.get("data", [{}])[0] if result.get("data") else data


@router.get("/tracing-history/stats", response_model=dict)
def get_tracing_stats(
    days: int = Query(default=30, le=365),
    current_admin: dict = Depends(check_admin_role)
):
    """
    Get tracing statistics.
    """
    try:
        supabase = get_supabase()
        if not supabase:
            return _get_mock_tracing_stats()
        
        cutoff = (datetime.utcnow() - timedelta(days=days)).isoformat()
        
        result = supabase.table("tracing_history").select("batch_code, trace_source, device_type, is_authenticated").gte("created_at", cutoff).execute()
        traces = result.data if result.data else []
        
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
        return {"total_traces": 0, "unique_batches": 0, "authenticated_traces": 0, "anonymous_traces": 0, "by_source": {}, "by_device": {}, "period_days": days}


@router.get("/tracing-history/top-batches", response_model=List[dict])
def get_top_traced_batches(
    days: int = Query(default=30, le=365),
    limit: int = Query(default=10, le=50),
    current_admin: dict = Depends(check_admin_role)
):
    """
    Get the most frequently traced batches.
    """
    try:
        supabase = get_supabase()
        if not supabase:
            return []
        
        cutoff = (datetime.utcnow() - timedelta(days=days)).isoformat()
        
        result = supabase.table("tracing_history").select("batch_code, honey_type, farmer_name, apiary_name").gte("created_at", cutoff).execute()
        traces = result.data if result.data else []
        
        # Count traces per batch
        batch_counts = {}
        batch_info = {}
        for trace in traces:
            code = trace.get("batch_code")
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
def get_payment_transactions(
    status: Optional[str] = None,
    payment_method: Optional[str] = None,
    days: int = Query(default=30, le=365),
    limit: int = Query(default=100, le=500),
    offset: int = 0,
    current_admin: dict = Depends(check_admin_role)
):
    """
    Get all payment transactions with optional filters.
    """
    try:
        supabase = get_supabase()
        if not supabase:
            return []
        
        query = supabase.table("payment_transactions").select("*")
        
        if status:
            query = query.eq("status", status)
        if payment_method:
            query = query.eq("payment_method", payment_method)
        
        cutoff = (datetime.utcnow() - timedelta(days=days)).isoformat()
        query = query.gte("created_at", cutoff)
        
        result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        return result.data if result.data else []
    except Exception as e:
        print(f"Payments Fetch Error: {e}")
        return []


@router.post("/payments", response_model=dict)
def log_payment_transaction(
    payment_in: PaymentLogCreate,
    current_admin: dict = Depends(check_admin_role)
):
    """
    Log a payment transaction.
    """
    data = payment_in.dict()
    
    result = db_insert("payment_transactions", data)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to log payment"))
    
    return result.get("data", [{}])[0] if result.get("data") else data


@router.get("/payments/stats", response_model=dict)
def get_payment_stats(
    days: int = Query(default=30, le=365),
    current_admin: dict = Depends(check_admin_role)
):
    """
    Get payment statistics.
    """
    try:
        supabase = get_supabase()
        if not supabase:
            return _get_mock_payment_stats()
        
        cutoff = (datetime.utcnow() - timedelta(days=days)).isoformat()
        
        result = supabase.table("payment_transactions").select("payment_method, status, amount_kes").gte("created_at", cutoff).execute()
        payments = result.data if result.data else []
        
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
        return {"total_transactions": 0, "total_amount_kes": 0, "successful_amount_kes": 0, "by_method": {}, "amount_by_method": {}, "by_status": {}, "average_transaction_kes": 0, "period_days": days}


# ==========================================
# ACCOUNTS REGISTRY
# ==========================================

@router.get("/accounts", response_model=List[dict])
def get_account_registry(
    account_type: Optional[str] = None,
    verification_status: Optional[str] = None,
    days: int = Query(default=365, le=365),
    limit: int = Query(default=100, le=500),
    offset: int = 0,
    current_admin: dict = Depends(check_admin_role)
):
    """
    Get all user accounts with optional filters.
    """
    try:
        supabase = get_supabase()
        if not supabase:
            return []
        
        query = supabase.table("account_registry").select("*")
        
        if account_type:
            query = query.eq("account_type", account_type)
        if verification_status:
            query = query.eq("verification_status", verification_status)
        
        cutoff = (datetime.utcnow() - timedelta(days=days)).isoformat()
        query = query.gte("created_at", cutoff)
        
        result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        return result.data if result.data else []
    except Exception as e:
        print(f"Accounts Fetch Error: {e}")
        # Fallback to profiles table
        try:
            profiles = db_select("profiles", order_by="created_at", ascending=False)
            return profiles[:limit] if profiles else []
        except:
            return []


@router.get("/accounts/stats", response_model=dict)
def get_account_stats(
    days: int = Query(default=30, le=365),
    current_admin: dict = Depends(check_admin_role)
):
    """
    Get account statistics.
    """
    try:
        supabase = get_supabase()
        if not supabase:
            return _get_mock_account_stats()
        
        cutoff = (datetime.utcnow() - timedelta(days=days)).isoformat()
        
        result = supabase.table("account_registry").select("account_type, verification_status, is_active").gte("created_at", cutoff).execute()
        accounts = result.data if result.data else []
        
        type_counts = {}
        status_counts = {}
        active_count = 0
        
        for acc in accounts:
            t = acc.get("account_type", "customer")
            s = acc.get("verification_status", "unverified")
            type_counts[t] = type_counts.get(t, 0) + 1
            status_counts[s] = status_counts.get(s, 0) + 1
            if acc.get("is_active"):
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
        return {"total_accounts": 0, "active_accounts": 0, "by_type": {}, "by_verification_status": {}, "period_days": days}


# ==========================================
# INVOICES REGISTRY
# ==========================================

@router.get("/invoices", response_model=List[dict])
def get_invoice_registry(
    status: Optional[str] = None,
    days: int = Query(default=90, le=365),
    limit: int = Query(default=100, le=500),
    offset: int = 0,
    current_admin: dict = Depends(check_admin_role)
):
    """
    Get all invoices with optional filters.
    """
    try:
        supabase = get_supabase()
        if not supabase:
            return []
        
        query = supabase.table("invoice_registry").select("*")
        
        if status:
            query = query.eq("status", status)
        
        cutoff = (datetime.utcnow() - timedelta(days=days)).isoformat()
        query = query.gte("created_at", cutoff)
        
        result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        return result.data if result.data else []
    except Exception as e:
        print(f"Invoices Fetch Error: {e}")
        return []


@router.get("/invoices/stats", response_model=dict)
def get_invoice_stats(
    days: int = Query(default=30, le=365),
    current_admin: dict = Depends(check_admin_role)
):
    """
    Get invoice statistics.
    """
    try:
        supabase = get_supabase()
        if not supabase:
            return _get_mock_invoice_stats()
        
        cutoff = (datetime.utcnow() - timedelta(days=days)).isoformat()
        
        result = supabase.table("invoice_registry").select("status, total_kes, payment_method").gte("created_at", cutoff).execute()
        invoices = result.data if result.data else []
        
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
        return {"total_invoices": 0, "total_amount_kes": 0, "paid_amount_kes": 0, "unpaid_amount_kes": 0, "by_status": {}, "amount_by_status": {}, "period_days": days}


# ==========================================
# COMBINED DASHBOARD STATS
# ==========================================

@router.get("/dashboard-extended", response_model=dict)
def get_extended_dashboard_stats(
    days: int = Query(default=7, le=30),
    current_admin: dict = Depends(check_admin_role)
):
    """
    Get comprehensive dashboard statistics for admin overview.
    """
    try:
        activity_stats = get_activity_stats(days=days, current_admin=current_admin)
        document_stats = get_document_stats(days=days, current_admin=current_admin)
        tracing_stats = get_tracing_stats(days=days, current_admin=current_admin)
        payment_stats = get_payment_stats(days=days, current_admin=current_admin)
        account_stats = get_account_stats(days=days, current_admin=current_admin)
        invoice_stats = get_invoice_stats(days=days, current_admin=current_admin)
        
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


# End of file
