from fastapi import FastAPI
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from collections import defaultdict, deque
import os
import time

from routes.auth import router as auth_router
from routes.wallet import router as wallet_router
from routes.transactions import router as transactions_router
from routes.admin import router as admin_router
from routes.admin_settings import router as admin_settings_router

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
    expose_headers=[],
)

app.include_router(auth_router)
app.include_router(wallet_router)
app.include_router(transactions_router)
app.include_router(admin_router)
app.include_router(admin_settings_router)

RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "120"))
_requests_by_client: dict[str, deque[float]] = defaultdict(deque)


@app.middleware("http")
async def rate_limit(request: Request, call_next):
    client = request.client.host if request.client else "unknown"
    key = f"{client}:{request.url.path}"
    now = time.time()
    window = _requests_by_client[key]

    while window and now - window[0] > 60:
        window.popleft()

    if len(window) >= RATE_LIMIT_PER_MINUTE:
        return JSONResponse({"detail": "Too many requests"}, status_code=429)

    window.append(now)
    return await call_next(request)


@app.get("/")
def root():
    return {"status": "ok", "app": os.getenv("APP_NAME", "SwiftMint"), "docs": "/docs"}

@app.get("/api/health")
def health():
    return {"status": "ok", "app": os.getenv("APP_NAME", "SwiftMint")}
