from fastapi import APIRouter, HTTPException, Depends, Header
from passlib.hash import bcrypt
from jose import jwt
import os
from datetime import datetime, timedelta
from typing import Optional
from dotenv import load_dotenv

from models import UserCreate, UserLogin, UserResponse
from database import supabase

load_dotenv()

router = APIRouter(prefix="/api/auth", tags=["auth"])

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 72


def create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRY_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def get_current_user(authorization: str = Header(...)) -> dict:
    token = authorization.replace("Bearer ", "")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        result = supabase.table("users").select("*").eq("id", user_id).execute()
        if not result.data:
            raise HTTPException(status_code=401, detail="User not found")
        return result.data[0]
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.post("/signup", response_model=dict)
def signup(input: UserCreate):
    existing = supabase.table("users").select("*").eq("phone", input.phone).execute()
    if existing.data:
        raise HTTPException(status_code=409, detail="A user with this phone number already exists")

    password_hash = bcrypt.hash(input.password)

    user_result = supabase.table("users").insert({
        "name": input.name,
        "phone": input.phone,
        "email": input.email or f"{input.phone}@swiftmint.mw",
        "password_hash": password_hash,
        "created_at": datetime.utcnow().isoformat(),
    }).execute()

    if not user_result.data:
        raise HTTPException(status_code=500, detail="Failed to create user")

    user = user_result.data[0]

    wallet_result = supabase.table("wallets").insert({
        "user_id": user["id"],
        "balance": 20000,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }).execute()

    supabase.table("transactions").insert({
        "user_id": user["id"],
        "type": "fund",
        "status": "completed",
        "amount": 20000,
        "fee": 0,
        "payout": 20000,
        "currency": "MWK",
        "description": "Welcome bonus",
        "reference": f"BONUS-{user['id'][:8].upper()}",
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }).execute()

    token = create_token(user["id"])

    return {
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "phone": user["phone"],
            "email": user["email"],
            "created_at": user["created_at"],
        },
        "balance": 20000,
    }


@router.post("/login", response_model=dict)
def login(input: UserLogin):
    result = supabase.table("users").select("*").eq("phone", input.phone).execute()
    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid phone number or password")

    user = result.data[0]

    if not bcrypt.verify(input.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid phone number or password")

    wallet = supabase.table("wallets").select("balance").eq("user_id", user["id"]).execute()
    balance = wallet.data[0]["balance"] if wallet.data else 0

    token = create_token(user["id"])

    return {
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "phone": user["phone"],
            "email": user["email"],
            "created_at": user["created_at"],
        },
        "balance": balance,
    }


@router.get("/me", response_model=dict)
def get_me(user: dict = Depends(get_current_user)):
    wallet = supabase.table("wallets").select("balance").eq("user_id", user["id"]).execute()
    balance = wallet.data[0]["balance"] if wallet.data else 0
    return {
        "user": {
            "id": user["id"],
            "name": user["name"],
            "phone": user["phone"],
            "email": user["email"],
            "created_at": user["created_at"],
        },
        "balance": balance,
    }
