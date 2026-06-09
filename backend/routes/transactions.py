from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, BackgroundTasks, Depends, Header, HTTPException, Query

from database import supabase
from email_service import send_order_placed_email, send_transaction_completed_email
from models import PayBill, SendMoney
from routes.auth import get_current_user

router = APIRouter(prefix="/api/transactions", tags=["transactions"])

STANDARD_RATE = 0.06
VIP_RATE = 0.035
MIN_FEE = 5000
VIP_THRESHOLD = 300000
BILL_FEE_RATE = 0.02


def _generate_ref(prefix: str = "REF") -> str:
    return f"{prefix}-{datetime.utcnow().strftime('%y%m%d%H%M%S')}-{uuid4().hex[:8].upper()}"


def _rpc_data(result) -> dict:
    data = result.data
    if isinstance(data, dict):
        return data
    if isinstance(data, list) and data and isinstance(data[0], dict):
        return data[0]
    raise HTTPException(status_code=500, detail="Unexpected database response")


def _raise_db_error(exc: Exception):
    message = str(exc)
    if "Insufficient wallet balance" in message:
        raise HTTPException(
            status_code=400,
            detail="Insufficient wallet balance. Fund your wallet via WhatsApp and contact us to get credited.",
        )
    if "Wallet not found" in message:
        raise HTTPException(status_code=404, detail="Wallet not found")
    if "duplicate key" in message or "idempotency" in message:
        raise HTTPException(status_code=409, detail="Duplicate transaction request")
    raise HTTPException(status_code=500, detail="Transaction could not be processed")


def _validate_idempotency_key(value: str | None):
    if value and len(value) > 128:
        raise HTTPException(status_code=400, detail="Idempotency-Key is too long")


@router.get("/", response_model=dict)
def list_transactions(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: dict = Depends(get_current_user),
):
    result = (
        supabase.table("transactions")
        .select("*")
        .eq("user_id", user["id"])
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    return {"transactions": result.data, "limit": limit, "offset": offset}


@router.post("/send", response_model=dict)
def send_money(
    input: SendMoney,
    background_tasks: BackgroundTasks,
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
    user: dict = Depends(get_current_user),
):
    if not input.recipient_name.strip():
        raise HTTPException(status_code=400, detail="Recipient name is required")
    if not input.recipient_number.strip():
        raise HTTPException(status_code=400, detail="Recipient number is required")
    _validate_idempotency_key(idempotency_key)

    is_vip = input.amount >= VIP_THRESHOLD
    raw_fee = input.amount * (VIP_RATE if is_vip else STANDARD_RATE)
    fee = max(round(raw_fee), MIN_FEE)
    ref = _generate_ref()

    try:
        result = supabase.rpc(
            "debit_wallet_for_send",
            {
                "p_user_id": user["id"],
                "p_amount": input.amount,
                "p_fee": fee,
                "p_reference": ref,
                "p_country": input.country,
                "p_recipient_name": input.recipient_name,
                "p_wallet_type": input.wallet_type,
                "p_recipient_number": input.recipient_number,
                "p_idempotency_key": idempotency_key,
            },
        ).execute()
    except Exception as exc:
        _raise_db_error(exc)

    data = _rpc_data(result)

    if not data.get("replayed"):
        background_tasks.add_task(
            send_order_placed_email,
            user_email=user["email"],
            user_name=user["name"],
            recipient_name=input.recipient_name,
            country=input.country,
            amount=data["amount"],
            fee=data["fee"],
            reference=data["reference"],
        )

    return data


@router.post("/pay-bill", response_model=dict)
def pay_bill(
    input: PayBill,
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
    user: dict = Depends(get_current_user),
):
    if not input.account_number.strip():
        raise HTTPException(status_code=400, detail="Account number is required")
    _validate_idempotency_key(idempotency_key)

    fee = round(input.amount * BILL_FEE_RATE)
    ref = _generate_ref()

    try:
        result = supabase.rpc(
            "debit_wallet_for_bill",
            {
                "p_user_id": user["id"],
                "p_biller": input.biller,
                "p_account_number": input.account_number,
                "p_amount": input.amount,
                "p_fee": fee,
                "p_reference": ref,
                "p_idempotency_key": idempotency_key,
            },
        ).execute()
    except Exception as exc:
        _raise_db_error(exc)

    return _rpc_data(result)


@router.patch("/{txn_id}/status", response_model=dict)
def update_transaction_status(
    txn_id: str,
    body: dict,
    background_tasks: BackgroundTasks,
    user: dict = Depends(get_current_user),
):
    status = body.get("status")
    valid_statuses = ["pending", "confirmed", "processing", "completed", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")

    result = supabase.table("transactions").select("*").eq("id", txn_id).eq("user_id", user["id"]).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Transaction not found")

    supabase.table("transactions").update({
        "status": status,
        "updated_at": datetime.utcnow().isoformat(),
    }).eq("id", txn_id).execute()

    if status == "completed":
        txn = result.data[0]
        background_tasks.add_task(
            send_transaction_completed_email,
            user_email=user["email"],
            user_name=user["name"],
            recipient_name=txn.get("recipient_name", ""),
            country=txn.get("country", ""),
            amount=txn["amount"],
            reference=txn["reference"],
        )

    return {"success": True, "status": status}


@router.delete("/{txn_id}", response_model=dict)
def delete_transaction(txn_id: str, user: dict = Depends(get_current_user)):
    result = supabase.table("transactions").select("*").eq("id", txn_id).eq("user_id", user["id"]).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Transaction not found")

    supabase.table("transactions").delete().eq("id", txn_id).execute()
    return {"success": True}
