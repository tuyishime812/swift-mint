from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime

from models import FundWallet, WalletResponse
from database import supabase
from routes.auth import get_current_user

router = APIRouter(prefix="/api/wallet", tags=["wallet"])


@router.get("/balance", response_model=dict)
def get_balance(user: dict = Depends(get_current_user)):
    result = supabase.table("wallets").select("*").eq("user_id", user["id"]).execute()
    if not result.data:
        wallet = supabase.table("wallets").insert({
            "user_id": user["id"],
            "balance": 0,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }).execute()
        return {"balance": 0, "wallet_id": wallet.data[0]["id"]}
    return {"balance": result.data[0]["balance"], "wallet_id": result.data[0]["id"]}


@router.post("/fund", response_model=dict)
def fund_wallet(input: FundWallet, user: dict = Depends(get_current_user)):
    wallet_result = supabase.table("wallets").select("*").eq("user_id", user["id"]).execute()
    if not wallet_result.data:
        raise HTTPException(status_code=404, detail="Wallet not found")

    wallet = wallet_result.data[0]
    new_balance = wallet["balance"] + input.amount

    supabase.table("wallets").update({
        "balance": new_balance,
        "updated_at": datetime.utcnow().isoformat(),
    }).eq("id", wallet["id"]).execute()

    ref = f"REF-{datetime.utcnow().strftime('%y%m%d%H%M%S').upper()}"

    supabase.table("transactions").insert({
        "user_id": user["id"],
        "type": "fund",
        "status": "completed",
        "amount": input.amount,
        "fee": 0,
        "payout": input.amount,
        "currency": "MWK",
        "description": f"Wallet funded via {input.payment_method}",
        "reference": ref,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }).execute()

    return {"balance": new_balance, "reference": ref}
