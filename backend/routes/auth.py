from fastapi import APIRouter, HTTPException, Depends, Header
from datetime import datetime, timedelta
from typing import Optional
from dotenv import load_dotenv
from uuid import uuid4
import os
import re

from jose import jwt, JWTError
from passlib.hash import bcrypt

from models import SignupRequest, LoginRequest, SupabaseLogin, UpdateProfileRequest
from database import supabase

load_dotenv()

router = APIRouter(prefix="/api/auth", tags=["auth"])

SECRET_KEY = os.getenv("APP_SECRET")
if not SECRET_KEY:
    raise RuntimeError("APP_SECRET is required")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 1
USERNAME_CLEANUP_RE = re.compile(r"[^a-z0-9_.-]+")


def create_token(user_id: str, token_version: int = 0) -> str:
    payload = {
        "sub": user_id,
        "tkn_v": token_version,
        "jti": uuid4().hex,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.removeprefix("Bearer ").strip()
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        tkn_v = payload.get("tkn_v", 0)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    result = supabase.table("users").select("*").eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=401, detail="User not found")

    user = result.data[0]
    if user.get("token_version", 0) != tkn_v:
        raise HTTPException(status_code=401, detail="Token revoked. Please log in again.")

    return user


def _rpc_data(result) -> dict:
    data = result.data
    if isinstance(data, dict):
        return data
    if isinstance(data, list) and data and isinstance(data[0], dict):
        return data[0]
    raise HTTPException(status_code=500, detail="Unexpected database response")


def _db_error_text(exc: Exception) -> str:
    parts = [str(exc)]
    for attr in ("message", "details", "hint", "code"):
        value = getattr(exc, attr, None)
        if value:
            parts.append(str(value))
    return " ".join(parts).lower()


def _duplicate_detail(error_text: str) -> str:
    if "firebase_uid" in error_text:
        return "Google account already linked"
    if "phone" in error_text:
        return "Phone number already registered"
    if "username" in error_text:
        return "Username already taken"
    if "email" in error_text:
        return "Email already registered"
    return "Account already exists"


def _raise_signup_db_error(exc: Exception):
    error_text = _db_error_text(exc)
    if "23505" in error_text or "duplicate key" in error_text or "unique constraint" in error_text:
        raise HTTPException(status_code=409, detail=_duplicate_detail(error_text))
    if "create_user_with_wallet" in error_text and ("not found" in error_text or "does not exist" in error_text):
        raise HTTPException(status_code=500, detail="Account creation is temporarily unavailable")
    raise HTTPException(status_code=500, detail="Account could not be created")


def _ensure_wallet(user_id: str):
    wallet = supabase.table("wallets").select("id").eq("user_id", user_id).limit(1).execute()
    if wallet.data:
        return

    now = datetime.utcnow().isoformat()
    try:
        supabase.table("wallets").insert({
            "user_id": user_id,
            "balance": 0,
            "created_at": now,
            "updated_at": now,
        }).execute()
    except Exception as exc:
        error_text = _db_error_text(exc)
        if "23505" in error_text or "duplicate key" in error_text or "unique constraint" in error_text:
            return
        raise HTTPException(status_code=500, detail="Wallet could not be initialized")


def _wallet_balance(user_id: str) -> int:
    wallet = supabase.table("wallets").select("balance").eq("user_id", user_id).limit(1).execute()
    if wallet.data:
        return wallet.data[0]["balance"]

    _ensure_wallet(user_id)
    return 0


def _create_user_with_wallet(
    *,
    name: str,
    email: str,
    username: str,
    phone: str,
    password_hash: str,
    firebase_uid: str | None = None,
) -> dict:
    try:
        result = supabase.rpc(
            "create_user_with_wallet",
            {
                "p_name": name,
                "p_email": email,
                "p_username": username,
                "p_phone": phone,
                "p_password_hash": password_hash,
                "p_firebase_uid": firebase_uid,
            },
        ).execute()
    except Exception as exc:
        _raise_signup_db_error(exc)

    return _rpc_data(result)


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _google_username(email: str, google_id: str) -> str:
    base = email.split("@", 1)[0].strip().lower()
    base = USERNAME_CLEANUP_RE.sub("-", base).strip(".-_") or "user"
    return f"{base[:32]}-{google_id[:16].lower()}"


def _assert_no_existing_signup_conflict(data: SignupRequest):
    existing = supabase.table("users").select("id").eq("email", data.email).execute()
    if existing.data:
        raise HTTPException(status_code=409, detail="Email already registered")

    existing_username = supabase.table("users").select("id").eq("username", data.username).execute()
    if existing_username.data:
        raise HTTPException(status_code=409, detail="Username already taken")

    existing_phone = supabase.table("users").select("id").eq("phone", data.phone).execute()
    if existing_phone.data:
        raise HTTPException(status_code=409, detail="Phone number already registered")


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
    _assert_no_existing_signup_conflict(data)
    hashed = bcrypt.hash(data.password)

    user = _create_user_with_wallet(
        name=data.name,
        email=data.email,
        username=data.username,
        phone=data.phone,
        password_hash=hashed,
    )

    token = create_token(user["id"], user.get("token_version", 0))

    return {"token": token, "user": _format_user(user)}


@router.post("/login")
def login(data: LoginRequest):
    identifier = data.email_or_username

    result = supabase.table("users").select("*").eq("email", identifier).execute()
    if not result.data:
        result = supabase.table("users").select("*").eq("username", identifier).execute()

    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user = result.data[0]

    if not user.get("password_hash") or not bcrypt.verify(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    _ensure_wallet(user["id"])
    token = create_token(user["id"], user.get("token_version", 0))

    return {"token": token, "user": _format_user(user)}


@router.post("/supabase")
def supabase_login(data: SupabaseLogin):
    access_token = data.access_token

    try:
        user_data = supabase.auth.get_user(access_token)
        google_user = user_data.user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Supabase token")

    google_id = google_user.id
    email = _normalize_email(google_user.email or f"{google_id}@swiftmint.mw")
    metadata = google_user.user_metadata or {}
    name = (metadata.get("full_name") or google_user.email or "User").strip()

    uid_result = supabase.table("users").select("*").eq("firebase_uid", google_id).execute()
    if uid_result.data:
        user = uid_result.data[0]
        _ensure_wallet(user["id"])
    else:
        email_result = supabase.table("users").select("*").eq("email", email).execute()
        if email_result.data:
            user = email_result.data[0]
        else:
            phone = (getattr(google_user, "phone", None) or "").strip()
            user = _create_user_with_wallet(
                name=name,
                email=email,
                username=_google_username(email, google_id),
                phone=phone,
                password_hash="",
                firebase_uid=google_id,
            )

    if user.get("email") == email:
        existing_google_id = user.get("firebase_uid")
        if existing_google_id and existing_google_id != google_id:
            raise HTTPException(status_code=409, detail="This email is already linked to a different Google account")
        if not existing_google_id:
            try:
                update = supabase.table("users").update({"firebase_uid": google_id}).eq("id", user["id"]).execute()
            except Exception as exc:
                _raise_signup_db_error(exc)
            if update.data:
                user = update.data[0]
        _ensure_wallet(user["id"])

    local_token = create_token(user["id"], user.get("token_version", 0))
    balance = _wallet_balance(user["id"])

    return {"token": local_token, "user": _format_user(user), "balance": balance}


@router.get("/me", response_model=dict)
def get_me(user: dict = Depends(get_current_user)):
    balance = _wallet_balance(user["id"])
    return {"user": _format_user(user), "balance": balance}


@router.patch("/profile")
def update_profile(data: UpdateProfileRequest, user: dict = Depends(get_current_user)):
    updates = {}
    if data.name is not None and data.name:
        updates["name"] = data.name
    if data.phone is not None and data.phone:
        existing = supabase.table("users").select("id").eq("phone", data.phone).neq("id", user["id"]).execute()
        if existing.data:
            raise HTTPException(status_code=409, detail="Phone number already registered")
        updates["phone"] = data.phone
    if data.username is not None and data.username:
        existing = supabase.table("users").select("id").eq("username", data.username).neq("id", user["id"]).execute()
        if existing.data:
            raise HTTPException(status_code=409, detail="Username already taken")
        updates["username"] = data.username
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = supabase.table("users").update(updates).eq("id", user["id"]).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to update profile")
    return _format_user(result.data[0])
