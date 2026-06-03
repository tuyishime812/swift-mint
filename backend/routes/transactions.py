from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime

from models import SendMoney, PayBill, TransactionResponse
from database import supabase
from routes.auth import get_current_user

router = APIRouter(prefix="/api/transactions", tags=["transactions"])

STANDARD_RATE = 0.06
VIP_RATE = 0.035
MIN_FEE = 5000
VIP_THRESHOLD = 300000
BILL_FEE_RATE = 0.02


def _generate_ref() -> str:
    return f"REF-{datetime.utcnow().strftime('%y%m%d%H%M%S')}-{__import__('random').randint(100, 999)}"


@router.get("/", response_model=dict)
def list_transactions(user: dict = Depends(get_current_user)):
    result = supabase.table("transactions") \
        .select("*") \
        .eq("user_id", user["id"]) \
        .order("created_at", desc=True) \
        .execute()
    return {"transactions": result.data}


@router.post("/send", response_model=dict)
def send_money(input: SendMoney, user: dict = Depends(get_current_user)):
    if not input.recipient_name.strip():
        raise HTTPException(status_code=400, detail="Recipient name is required")
    if not input.recipient_number.strip():
        raise HTTPException(status_code=400, detail="Recipient number is required")

    wallet_result = supabase.table("wallets").select("*").eq("user_id", user["id"]).execute()
    if not wallet_result.data:
        raise HTTPException(status_code=404, detail="Wallet not found")

    wallet = wallet_result.data[0]

    is_vip = input.amount >= VIP_THRESHOLD
    raw_fee = input.amount * (VIP_RATE if is_vip else STANDARD_RATE)
    fee = max(round(raw_fee), MIN_FEE)
    total = input.amount + fee

    if wallet["balance"] < total:
        raise HTTPException(status_code=400, detail="Insufficient wallet balance. Please fund your wallet first.")

    new_balance = wallet["balance"] - total
    ref = _generate_ref()

    supabase.table("wallets").update({
        "balance": new_balance,
        "updated_at": datetime.utcnow().isoformat(),
    }).eq("id", wallet["id"]).execute()

    supabase.table("transactions").insert({
        "user_id": user["id"],
        "type": "send",
        "status": "pending",
        "amount": input.amount,
        "fee": fee,
        "payout": input.amount,
        "currency": "MWK",
        "description": f"Send to {input.recipient_name} ({input.country}) via {input.wallet_type}",
        "reference": ref,
        "country": input.country,
        "recipient_name": input.recipient_name,
        "wallet_type": input.wallet_type,
        "recipient_number": input.recipient_number,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }).execute()

    return {
        "success": True,
        "reference": ref,
        "amount": input.amount,
        "fee": fee,
        "total": total,
        "new_balance": new_balance,
        "status": "pending",
    }


@router.post("/pay-bill", response_model=dict)
def pay_bill(input: PayBill, user: dict = Depends(get_current_user)):
    if not input.account_number.strip():
        raise HTTPException(status_code=400, detail="Account number is required")

    wallet_result = supabase.table("wallets").select("*").eq("user_id", user["id"]).execute()
    if not wallet_result.data:
        raise HTTPException(status_code=404, detail="Wallet not found")

    wallet = wallet_result.data[0]

    fee = round(input.amount * BILL_FEE_RATE)
    total = input.amount + fee

    if wallet["balance"] < total:
        raise HTTPException(status_code=400, detail="Insufficient wallet balance")

    new_balance = wallet["balance"] - total
    ref = _generate_ref()

    supabase.table("wallets").update({
        "balance": new_balance,
        "updated_at": datetime.utcnow().isoformat(),
    }).eq("id", wallet["id"]).execute()

    supabase.table("transactions").insert({
        "user_id": user["id"],
        "type": "bill",
        "status": "completed",
        "amount": input.amount,
        "fee": fee,
        "payout": input.amount,
        "currency": "MWK",
        "description": f"Bill payment to {input.biller}",
        "reference": ref,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }).execute()

    supabase.table("bill_payments").insert({
        "user_id": user["id"],
        "biller": input.biller,
        "account_number": input.account_number,
        "amount": input.amount,
        "fee": fee,
        "status": "completed",
        "reference": ref,
        "created_at": datetime.utcnow().isoformat(),
    }).execute()

    return {
        "success": True,
        "reference": ref,
        "amount": input.amount,
        "fee": fee,
        "total": total,
        "new_balance": new_balance,
        "status": "completed",
    }


@router.patch("/{txn_id}/status", response_model=dict)
def update_transaction_status(txn_id: str, status: str, user: dict = Depends(get_current_user)):
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

    return {"success": True, "status": status}


@router.delete("/{txn_id}", response_model=dict)
def delete_transaction(txn_id: str, user: dict = Depends(get_current_user)):
    result = supabase.table("transactions").select("*").eq("id", txn_id).eq("user_id", user["id"]).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Transaction not found")

    supabase.table("transactions").delete().eq("id", txn_id).execute()
    return {"success": True}
