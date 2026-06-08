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

SECRET_KEY = os.getenv("APP_SECRET", "super-secret-key-change-in-production")
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
    token = authorization.replace("Bearer ", "")
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

    supabase.table("wallets").insert({
        "user_id": user["id"],
        "balance": 0,
        "created_at": now,
        "updated_at": now,
    }).execute()

    token = create_token(user["id"])

    return {"token": token, "user": _format_user(user)}


@router.post("/login")
def login(data: LoginRequest):
    result = supabase.table("users").select("*").execute()
    user = None
    for u in result.data:
        if u.get("email") == data.email_or_username or u.get("username") == data.email_or_username:
            user = u
            break

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not bcrypt.verify(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token(user["id"])

    return {"token": token, "user": _format_user(user)}


@router.post("/firebase")
def firebase_login(data: dict):
    id_token = data.get("token")
    if not id_token:
        raise HTTPException(status_code=400, detail="Missing token")

    try:
        import firebase_admin
        from firebase_admin import auth as firebase_auth
        if not firebase_admin._apps:
            cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
            if cred_path:
                cred = firebase_admin.credentials.Certificate(cred_path)
            else:
                import json
                cred_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
                if cred_json:
                    cred = firebase_admin.credentials.Certificate(json.loads(cred_json))
                else:
                    raise HTTPException(status_code=500, detail="Firebase credentials not configured")
            firebase_admin.initialize_app(cred)
        decoded = firebase_auth.verify_id_token(id_token)
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid Firebase token: {str(e)}")

    firebase_uid = decoded.get("uid")
    email = decoded.get("email", f"{firebase_uid}@swiftmint.mw")
    name = decoded.get("name", decoded.get("email", "User"))

    result = supabase.table("users").select("*").eq("firebase_uid", firebase_uid).execute()

    if result.data:
        user = result.data[0]
        local_token = create_token(user["id"])
        wallet = supabase.table("wallets").select("balance").eq("user_id", user["id"]).execute()
        balance = wallet.data[0]["balance"] if wallet.data else 0
        return {"token": local_token, "user": _format_user(user), "balance": balance}

    now = datetime.utcnow().isoformat()

    user_result = supabase.table("users").insert({
        "name": name,
        "username": (email.split("@")[0] + firebase_uid[:4]),
        "phone": decoded.get("phone_number", ""),
        "email": email,
        "password_hash": "",
        "firebase_uid": firebase_uid,
        "is_admin": False,
        "created_at": now,
    }).execute()

    if not user_result.data:
        raise HTTPException(status_code=500, detail="Failed to create user")

    user = user_result.data[0]

    supabase.table("wallets").insert({
        "user_id": user["id"],
        "balance": 0,
        "created_at": now,
        "updated_at": now,
    }).execute()

    local_token = create_token(user["id"])

    return {"token": local_token, "user": _format_user(user), "balance": 0}


@router.get("/me", response_model=dict)
def get_me(user: dict = Depends(get_current_user)):
    wallet = supabase.table("wallets").select("balance").eq("user_id", user["id"]).execute()
    balance = wallet.data[0]["balance"] if wallet.data else 0
    return {"user": _format_user(user), "balance": balance}
