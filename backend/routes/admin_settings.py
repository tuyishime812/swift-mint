from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, Header, HTTPException, Query

from database import supabase
from routes.admin_base import require_admin
from models import AdminFundUser

router = APIRouter(prefix="/api/admin", tags=["admin"])


def _generate_ref(prefix: str = "ADM") -> str:
    return f"{prefix}-{datetime.utcnow().strftime('%y%m%d%H%M%S')}-{uuid4().hex[:8].upper()}"


@router.get("/users-with-balance")
def admin_users_with_balance(
    limit: int = Query(100, ge=1, le=200),
    offset: int = Query(0, ge=0),
    admin: dict = Depends(require_admin),
):
    users = (
        supabase.table("users")
        .select("id, name, phone, email, created_at, wallets(balance)")
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )

    result = []
    for user in users.data:
        wallets = user.pop("wallets", []) or []
        wallet = wallets[0] if isinstance(wallets, list) and wallets else {}
        result.append({**user, "balance": wallet.get("balance", 0)})

    return {"users": result, "limit": limit, "offset": offset}


@router.post("/fund-user")
def admin_fund_user(
    body: AdminFundUser,
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
    admin: dict = Depends(require_admin),
):
    if idempotency_key and len(idempotency_key) > 128:
        raise HTTPException(status_code=400, detail="Idempotency-Key is too long")

    now = datetime.utcnow().isoformat()
    ref = _generate_ref()

    if idempotency_key:
        existing = (
            supabase.table("transactions")
            .select("id")
            .eq("user_id", body.user_id)
            .eq("type", "fund")
            .eq("idempotency_key", idempotency_key)
            .execute()
        )
        if existing.data:
            raise HTTPException(status_code=409, detail="This funding request was already submitted.")

    try:
        result = supabase.table("transactions").insert({
            "user_id": body.user_id,
            "type": "fund",
            "status": "pending",
            "amount": body.amount,
            "fee": 0,
            "payout": body.amount,
            "currency": "MWK",
            "description": "Deposited by SwiftMint Exchange",
            "reference": ref,
            "idempotency_key": idempotency_key,
            "created_at": now,
            "updated_at": now,
        }).execute()
    except Exception as exc:
        message = str(exc)
        if "duplicate key" in message or "idempotency" in message:
            raise HTTPException(status_code=409, detail="This funding request was already submitted.")
        raise HTTPException(status_code=500, detail="Funding could not be created")

    if not result.data:
        raise HTTPException(status_code=500, detail="Funding could not be created")

    return {
        "success": True,
        "reference": ref,
        "amount": body.amount,
        "status": "pending",
    }
