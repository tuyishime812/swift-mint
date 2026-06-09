from fastapi import APIRouter, HTTPException, Depends, Header
from datetime import datetime, timedelta
from typing import Optional
from dotenv import load_dotenv
import os

from jose import jwt, JWTError
from passlib.hash import bcrypt

from models import SignupRequest, LoginRequest, UserResponse
from database import supabase

load_dotenv()

router = APIRouter(prefix="/api/auth", tags=["auth"])

SECRET_KEY = os.getenv("APP_SECRET")
if not SECRET_KEY:
    raise RuntimeError("APP_SECRET is required")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7


def create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(authorization: str = Header(...)) -> dict:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.removeprefix("Bearer ").strip()
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    result = supabase.table("users").select("*").eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=401, detail="User not found")
    return result.data[0]


def _format_user(user: dict) -> dict:
    return {
        "id": user["id"],
        "name": user["name"],
        "username": user.get("username", ""),
        "phone": user.get("phone", ""),
        "email": user["email"],
        "is_admin": user.get("is_admin", False),
        "created_at": user["created_at"],
    }


@router.post("/signup")
def signup(data: SignupRequest):
    existing = supabase.table("users").select("id").eq("email", data.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")

    existing_username = supabase.table("users").select("id").eq("username", data.username).execute()
    if existing_username.data:
        raise HTTPException(status_code=400, detail="Username already taken")

    if data.phone:
        existing_phone = supabase.table("users").select("id").eq("phone", data.phone).execute()
        if existing_phone.data:
            raise HTTPException(status_code=400, detail="Phone number already registered")

    now = datetime.utcnow().isoformat()
    hashed = bcrypt.hash(data.password)

    user_result = supabase.table("users").insert({
        "name": data.name,
        "phone": data.phone,
        "email": data.email,
        "username": data.username,
        "password_hash": hashed,
        "is_admin": False,
        "created_at": now,
    }).execute()

    if not user_result.data:
        raise HTTPException(status_code=500, detail="Failed to create user")

    user = user_result.data[0]

    supabase.table("wallets").upsert({
        "user_id": user["id"],
        "balance": 0,
        "created_at": now,
        "updated_at": now,
    }, on_conflict="user_id").execute()

    token = create_token(user["id"])

    return {"token": token, "user": _format_user(user)}


@router.post("/login")
def login(data: LoginRequest):
    result = supabase.table("users").select("*").or_(
        f"email.eq.{data.email_or_username},username.eq.{data.email_or_username}"
    ).execute()

    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user = result.data[0]

    if not user.get("password_hash") or not bcrypt.verify(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token(user["id"])

    return {"token": token, "user": _format_user(user)}


@router.post("/supabase")
def supabase_login(data: dict):
    access_token = data.get("access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail="Missing access token")

    try:
        user_data = supabase.auth.get_user(access_token)
        google_user = user_data.user
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid Supabase token: {str(e)}")

    google_id = google_user.id
    email = google_user.email or f"{google_id}@swiftmint.mw"
    name = google_user.user_metadata.get("full_name", google_user.email or "User")

    result = supabase.table("users").select("*").eq("email", email).execute()

    if result.data:
        user = result.data[0]
        if not user.get("firebase_uid"):
            supabase.table("users").update({"firebase_uid": google_id}).eq("id", user["id"]).execute()
    else:
        now = datetime.utcnow().isoformat()
        user_result = supabase.table("users").insert({
            "name": name,
            "username": f"{email.split('@')[0]}-{google_id[:8]}",
            "phone": google_user.phone or "",
            "email": email,
            "password_hash": "",
            "firebase_uid": google_id,
            "is_admin": False,
            "created_at": now,
        }).execute()

        if not user_result.data:
            raise HTTPException(status_code=500, detail="Failed to create user")

        user = user_result.data[0]

        supabase.table("wallets").upsert({
            "user_id": user["id"],
            "balance": 0,
            "created_at": now,
            "updated_at": now,
        }, on_conflict="user_id").execute()

    local_token = create_token(user["id"])
    wallet = supabase.table("wallets").select("balance").eq("user_id", user["id"]).execute()
    balance = wallet.data[0]["balance"] if wallet.data else 0

    return {"token": local_token, "user": _format_user(user), "balance": balance}


@router.get("/me", response_model=dict)
def get_me(user: dict = Depends(get_current_user)):
    wallet = supabase.table("wallets").select("balance").eq("user_id", user["id"]).execute()
    balance = wallet.data[0]["balance"] if wallet.data else 0
    return {"user": _format_user(user), "balance": balance}
