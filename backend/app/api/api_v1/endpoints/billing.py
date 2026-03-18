from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from datetime import datetime
from app.db.supabase_db import db_select, db_update
from app.services.etims_service import etims_service
from app.core.security import get_current_user
from pydantic import BaseModel

router = APIRouter()

class ETIMSSyncResponse(BaseModel):
    success: bool
    etims_id: Optional[str] = None
    error: Optional[dict] = None

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
    filters = {"id": transaction_id, "user_id": current_user.get("id")}
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
