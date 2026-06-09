from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, Header, HTTPException, Query

from database import supabase
from routes.admin_base import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])


def _generate_ref() -> str:
    return f"ADM-{datetime.utcnow().strftime('%y%m%d%H%M%S')}-{uuid4().hex[:8].upper()}"


def _rpc_data(result) -> dict:
    data = result.data
    if isinstance(data, dict):
        return data
    if isinstance(data, list) and data and isinstance(data[0], dict):
        return data[0]
    raise HTTPException(status_code=500, detail="Unexpected database response")


def _raise_db_error(exc: Exception):
    message = str(exc)
    if "Wallet not found" in message:
        raise HTTPException(status_code=404, detail="Wallet not found")
    if "duplicate key" in message or "idempotency" in message:
        raise HTTPException(status_code=409, detail="Duplicate funding request")
    raise HTTPException(status_code=500, detail="Funding could not be processed")


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
    body: dict,
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
    admin: dict = Depends(require_admin),
):
    user_id = body.get("user_id")
    amount = body.get("amount", 0)
    if not user_id or amount <= 0:
        raise HTTPException(status_code=400, detail="User ID and positive amount required")
    if idempotency_key and len(idempotency_key) > 128:
        raise HTTPException(status_code=400, detail="Idempotency-Key is too long")

    try:
        result = supabase.rpc(
            "credit_wallet_by_admin",
            {
                "p_user_id": user_id,
                "p_admin_id": admin["id"],
                "p_amount": int(amount),
                "p_reference": _generate_ref(),
                "p_idempotency_key": idempotency_key,
            },
        ).execute()
    except Exception as exc:
        _raise_db_error(exc)

    return _rpc_data(result)
