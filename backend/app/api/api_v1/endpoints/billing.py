from fastapi import APIRouter, Depends, HTTPException, Request, status, Query
from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel

from app.db.supabase_db import db_select, db_update, db_insert, db_delete
from app.services.etims_service import etims_service
from app.core.security import get_current_user

router = APIRouter()

class ETIMSSyncResponse(BaseModel):
    success: bool
    etims_id: Optional[str] = None
    error: Optional[dict] = None


def get_token(request: Request) -> Optional[str]:
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    return None


def get_user_id(current_user: dict = Depends(get_current_user)) -> str:
    # Supabase JWT uses `sub`. Some legacy paths may use `id`.
    return str(current_user.get("sub") or current_user.get("id"))


class LedgerCreate(BaseModel):
    transaction_type: str  # income | expense
    amount: float
    currency: str = "KES"
    date: str  # ISO date string
    description: str
    module_type: Optional[str] = None
    category: Optional[str] = None
    metadata: Optional[dict[str, Any]] = None


class LedgerUpdate(BaseModel):
    transaction_type: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    date: Optional[str] = None
    description: Optional[str] = None
    module_type: Optional[str] = None
    category: Optional[str] = None
    metadata: Optional[dict[str, Any]] = None
    etims_status: Optional[str] = None


@router.get("/ledger", response_model=List[dict])
async def list_ledger(
    limit: int = Query(50, ge=1, le=200),
    transaction_type: Optional[str] = Query(None),
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    filters: dict[str, Any] = {"user_id": user_id}
    if transaction_type:
        filters["transaction_type"] = transaction_type
    return await db_select("billing_ledger", filters=filters, order_by="date", ascending=False, limit=limit, token=token)


@router.post("/ledger", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_ledger_entry(
    body: LedgerCreate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    payload = body.model_dump()
    payload["user_id"] = user_id
    payload.setdefault("etims_status", "pending")
    res = await db_insert("billing_ledger", payload, token=token)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error", "Failed to create transaction"))
    rows = res.get("data") or []
    return rows[0] if isinstance(rows, list) and rows else payload


@router.patch("/ledger/{transaction_id}", response_model=dict)
async def update_ledger_entry(
    transaction_id: str,
    body: LedgerUpdate,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    rows = await db_select("billing_ledger", filters={"id": transaction_id, "user_id": user_id}, limit=1, token=token)
    if not rows:
        raise HTTPException(status_code=404, detail="Transaction not found")

    patch = body.model_dump(exclude_unset=True)
    if not patch:
        return rows[0]

    res = await db_update("billing_ledger", patch, filters={"id": transaction_id}, token=token)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error", "Failed to update transaction"))
    updated = res.get("data") or []
    return updated[0] if isinstance(updated, list) and updated else rows[0]


@router.delete("/ledger/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ledger_entry(
    transaction_id: str,
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    rows = await db_select("billing_ledger", filters={"id": transaction_id, "user_id": user_id}, limit=1, token=token)
    if not rows:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if (rows[0] or {}).get("etims_status") == "synced":
        raise HTTPException(status_code=400, detail="Cannot delete tax-synced transactions")

    res = await db_delete("billing_ledger", {"id": transaction_id}, token=token)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error", "Failed to delete transaction"))
    return None


@router.get("/overview", response_model=dict)
async def billing_overview(
    user_id: str = Depends(get_user_id),
    token: Optional[str] = Depends(get_token),
):
    rows = await db_select("billing_ledger", filters={"user_id": user_id}, limit=2000, token=token)
    revenue = sum(float(r.get("amount") or 0) for r in rows if r.get("transaction_type") == "income")
    costs = sum(float(r.get("amount") or 0) for r in rows if r.get("transaction_type") == "expense")
    return {
        "total_revenue": revenue,
        "total_costs": costs,
        "net_result": revenue - costs,
        "outstanding_invoices": 0,
    }


@router.post("/sync-etims/{transaction_id}", response_model=ETIMSSyncResponse)
async def sync_transaction_to_etims(
    transaction_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Synchronize a billing_ledger record with the KRA eTIMS system.
    """
    # 1. Fetch the transaction
    # Security: Ensure it belongs to the current user
    user_id = current_user.get("sub") or current_user.get("id")
    filters = {"id": transaction_id, "user_id": user_id}
    transactions = await db_select("billing_ledger", filters=filters)
    
    if not transactions:
        raise HTTPException(status_code=404, detail="Transaction not found or unauthorized")
    
    transaction = transactions[0]
    
    # 2. Check if already synced
    if transaction.get("is_etims_synced"):
        return {
            "success": True, 
            "etims_id": transaction.get("etims_receipt_number"),
            "message": "Already synchronized"
        }

    # 3. Submit to eTIMS Service
    result = await etims_service.submit_invoice(transaction)
    
    if result["success"]:
        # 4. Update database
        update_data = {
            "is_etims_synced": True,
            "etims_status": "synced",
            "etims_receipt_number": result["receipt_number"],
            "etims_signature": result["signature"],
            "metadata": {
                **transaction.get("metadata", {}),
                "etims_qr_url": result["qr_url"],
                "synced_at": str(datetime.now())
            }
        }
        
        await db_update("billing_ledger", update_data, filters={"id": transaction_id})
        
        return {
            "success": True,
            "etims_id": result["receipt_number"]
        }
    else:
        # Log failure
        await db_update("billing_ledger", {
            "etims_status": "failed",
            "etims_error_log": f"{result.get('error')}: {result.get('details')}"
        }, filters={"id": transaction_id})
        
        return {
            "success": False,
            "error": {"message": result.get("error"), "details": result.get("details")}
        }
