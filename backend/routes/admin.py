from fastapi import APIRouter, BackgroundTasks, HTTPException, Depends, Query
from datetime import datetime

from database import supabase
from email_service import send_transaction_completed_email
from routes.admin_base import require_admin
from models import UpdateTransactionStatus

router = APIRouter(prefix="/api/admin", tags=["admin"])


def _credit_wallet(user_id: str, amount: int):
    wallet = supabase.table("wallets").select("id, balance").eq("user_id", user_id).limit(1).execute()
    if not wallet.data:
        supabase.table("wallets").insert({
            "user_id": user_id,
            "balance": amount,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }).execute()
        return
    supabase.table("wallets").update({
        "balance": wallet.data[0]["balance"] + amount,
        "updated_at": datetime.utcnow().isoformat(),
    }).eq("id", wallet.data[0]["id"]).execute()


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
def admin_update_status(
    txn_id: str,
    body: UpdateTransactionStatus,
    background_tasks: BackgroundTasks,
    admin: dict = Depends(require_admin),
):
    status = body.status.value
    valid_statuses = ["pending", "confirmed", "processing", "completed", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")

    result = supabase.table("transactions").select("*").eq("id", txn_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Transaction not found")

    txn = result.data[0]
    previous_status = txn.get("status")

    # Credit wallet when a fund transaction is completed
    if status == "completed" and previous_status != "completed" and txn.get("type") == "fund":
        _credit_wallet(txn["user_id"], txn["amount"])

    supabase.table("transactions").update({
        "status": status,
        "updated_at": datetime.utcnow().isoformat(),
    }).eq("id", txn_id).execute()

    if status == "completed" and previous_status != "completed" and txn.get("type") != "fund":
        user_result = supabase.table("users").select("email, name").eq("id", txn["user_id"]).execute()
        if user_result.data:
            txn_user = user_result.data[0]
            background_tasks.add_task(
                send_transaction_completed_email,
                user_email=txn_user["email"],
                user_name=txn_user["name"],
                recipient_name=txn.get("recipient_name", ""),
                country=txn.get("country", ""),
                amount=txn["amount"],
                reference=txn["reference"],
            )

    return {"success": True, "status": status}


@router.delete("/transactions/{txn_id}")
def admin_delete_transaction(txn_id: str, admin: dict = Depends(require_admin)):
    result = supabase.table("transactions").select("*").eq("id", txn_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Transaction not found")

    supabase.table("transactions").delete().eq("id", txn_id).execute()
    return {"success": True}
