from fastapi import APIRouter, Depends
from datetime import datetime

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
