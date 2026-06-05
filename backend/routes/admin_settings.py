from fastapi import APIRouter, Depends
from datetime import datetime

from database import supabase
from routes.auth import get_current_user

router = APIRouter(prefix="/api/admin", tags=["admin"])


def require_admin(user: dict = Depends(get_current_user)):
    if not user.get("is_admin", False):
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


@router.get("/users-with-balance")
def admin_users_with_balance(admin: dict = Depends(require_admin)):
    users = supabase.table("users").select("id, name, phone, email, created_at").order("created_at", desc=True).execute()
    result = []
    for u in users.data:
        wallet = supabase.table("wallets").select("balance").eq("user_id", u["id"]).execute()
        balance = wallet.data[0]["balance"] if wallet.data else 0
        result.append({**u, "balance": balance})
    return {"users": result}


@router.post("/fund-user")
def admin_fund_user(body: dict, admin: dict = Depends(require_admin)):
    user_id = body.get("user_id")
    amount = body.get("amount", 0)
    if not user_id or amount <= 0:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="User ID and positive amount required")

    wallet = supabase.table("wallets").select("*").eq("user_id", user_id).execute()
    if not wallet.data:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Wallet not found")

    w = wallet.data[0]
    new_balance = w["balance"] + amount

    supabase.table("wallets").update({
        "balance": new_balance,
        "updated_at": datetime.utcnow().isoformat(),
    }).eq("id", w["id"]).execute()

    ref = f"ADM-{datetime.utcnow().strftime('%y%m%d%H%M%S').upper()}"
    supabase.table("transactions").insert({
        "user_id": user_id,
        "type": "fund",
        "status": "completed",
        "amount": amount,
        "fee": 0,
        "payout": amount,
        "currency": "MWK",
        "description": f"Manual funding by admin",
        "reference": ref,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }).execute()

    return {"success": True, "new_balance": new_balance, "reference": ref}
