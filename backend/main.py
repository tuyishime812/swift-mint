from fastapi import FastAPI
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from dotenv import load_dotenv
from collections import defaultdict, deque
import os
import time
import re

from routes.auth import router as auth_router
from routes.wallet import router as wallet_router
from routes.transactions import router as transactions_router
from routes.admin import router as admin_router
from routes.admin_settings import router as admin_settings_router
from routes.testimonials import router as testimonials_router
from routes.notifications import router as notifications_router

load_dotenv()

app = FastAPI(
    title=os.getenv("APP_NAME", "SwiftMint Exchange API"),
    version="1.0.0",
)

cors_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Idempotency-Key"],
    expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
)

app.include_router(auth_router)
app.include_router(wallet_router)
app.include_router(transactions_router)
app.include_router(admin_router)
app.include_router(admin_settings_router)
app.include_router(testimonials_router)
app.include_router(notifications_router)

RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "120"))
_requests_by_client: dict[str, deque[float]] = defaultdict(deque)


def _get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        client = forwarded.split(",")[0].strip()
        if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", client):
            return client
        if re.match(r"^[0-9a-fA-F:]+$", client):
            return client
    client = request.client.host if request.client else "unknown"
    return client


@app.middleware("http")
async def rate_limit(request: Request, call_next):
    client = _get_client_ip(request)
    now = time.time()
    window = _requests_by_client[client]

    while window and now - window[0] > 60:
        window.popleft()

    remaining = RATE_LIMIT_PER_MINUTE - len(window)

    if len(window) >= RATE_LIMIT_PER_MINUTE:
        return JSONResponse(
            {"detail": "Too many requests"},
            status_code=429,
            headers={
                "X-RateLimit-Limit": str(RATE_LIMIT_PER_MINUTE),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(int(window[0] + 60)) if window else "0",
                "Retry-After": str(int(window[0] + 60 - now)) if window else "60",
            },
        )

    window.append(now)
    response = await call_next(request)
    response.headers["X-RateLimit-Limit"] = str(RATE_LIMIT_PER_MINUTE)
    response.headers["X-RateLimit-Remaining"] = str(remaining)
    response.headers["X-RateLimit-Reset"] = str(int(now + 60))
    return response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        csp = (
            "default-src 'self'; "
            "script-src 'self'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data:; "
            "font-src 'self'; "
            "connect-src 'self'; "
            "frame-ancestors 'none'; "
            "form-action 'self'"
        )
        response.headers["Content-Security-Policy"] = csp
        return response


app.add_middleware(SecurityHeadersMiddleware)


@app.get("/")
def root():
    return {"status": "ok", "app": os.getenv("APP_NAME", "SwiftMint"), "docs": "/docs"}


@app.get("/api/health")
def health():
    return {"status": "ok", "app": os.getenv("APP_NAME", "SwiftMint")}



