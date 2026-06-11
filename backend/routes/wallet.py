from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime

from database import supabase
from routes.auth import get_current_user

router = APIRouter(prefix="/api/wallet", tags=["wallet"])


def _error_text(exc: Exception) -> str:
    return str(exc).lower()


def _get_or_create_wallet(user_id: str) -> dict:
    result = supabase.table("wallets").select("*").eq("user_id", user_id).limit(1).execute()
    if result.data:
        return result.data[0]

    now = datetime.utcnow().isoformat()
    try:
        supabase.table("wallets").insert({
            "user_id": user_id,
            "balance": 0,
            "created_at": now,
            "updated_at": now,
        }).execute()
    except Exception as exc:
        if "23505" not in _error_text(exc) and "duplicate key" not in _error_text(exc):
            raise HTTPException(status_code=500, detail="Wallet could not be initialized")

    result = supabase.table("wallets").select("*").eq("user_id", user_id).limit(1).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Wallet could not be loaded")
    return result.data[0]


@router.get("/balance", response_model=dict)
def get_balance(user: dict = Depends(get_current_user)):
    wallet = _get_or_create_wallet(user["id"])
    return {"balance": wallet["balance"], "wallet_id": wallet["id"]}
