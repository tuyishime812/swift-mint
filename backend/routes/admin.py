from fastapi import APIRouter, HTTPException, Depends, Query
from datetime import datetime

from database import supabase
from routes.auth import get_current_user
from routes.admin_base import require_admin
from models import UpdateTransactionStatus

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/transactions")
def admin_list_transactions(
    limit: int = Query(100, ge=1, le=200),
    offset: int = Query(0, ge=0),
    admin: dict = Depends(require_admin),
):
    result = supabase.table("transactions") \
        .select("*") \
        .order("created_at", desc=True) \
        .range(offset, offset + limit - 1) \
        .execute()
    return {"transactions": result.data, "limit": limit, "offset": offset}


@router.get("/users")
def admin_list_users(
    limit: int = Query(100, ge=1, le=200),
    offset: int = Query(0, ge=0),
    admin: dict = Depends(require_admin),
):
    result = supabase.table("users") \
        .select("id, name, phone, email, created_at") \
        .order("created_at", desc=True) \
        .range(offset, offset + limit - 1) \
        .execute()
    return {"users": result.data, "limit": limit, "offset": offset}


@router.patch("/transactions/{txn_id}/status")
def admin_update_status(txn_id: str, body: UpdateTransactionStatus, admin: dict = Depends(require_admin)):
    status = body.status.value
    valid_statuses = ["pending", "confirmed", "processing", "completed", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")

    result = supabase.table("transactions").select("*").eq("id", txn_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Transaction not found")

    supabase.table("transactions").update({
        "status": status,
        "updated_at": datetime.utcnow().isoformat(),
    }).eq("id", txn_id).execute()

    return {"success": True, "status": status}


@router.delete("/transactions/{txn_id}")
def admin_delete_transaction(txn_id: str, admin: dict = Depends(require_admin)):
    result = supabase.table("transactions").select("*").eq("id", txn_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Transaction not found")

    supabase.table("transactions").delete().eq("id", txn_id).execute()
    return {"success": True}
