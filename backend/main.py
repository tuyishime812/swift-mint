from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

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

import re

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(auth_router)
app.include_router(wallet_router)
app.include_router(transactions_router)
app.include_router(admin_router)
app.include_router(admin_settings_router)


@app.get("/api/health")
def health():
    return {"status": "ok", "app": os.getenv("APP_NAME", "SwiftMint")}


@app.on_event("startup")
def create_tables():
    """Auto-create Supabase tables on startup using direct DB connection."""
    db_url = os.getenv("SUPABASE_DB_URL")
    if not db_url:
        print("[setup] SUPABASE_DB_URL not set. Run backend/schema.sql in Supabase SQL Editor:")
        print("  https://supabase.com/dashboard/project/qkiflkpwlgxdttijeduq/sql/new")
        return

    try:
        import psycopg2
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        with open(os.path.join(os.path.dirname(__file__), "schema.sql")) as f:
            sql = f.read()
        cur.execute(sql)
        conn.commit()
        cur.close()
        conn.close()
        print("[setup] Tables created/verified successfully.")
    except Exception as e:
        print(f"[setup] Could not auto-create tables: {e}")
        print("[setup] Run backend/schema.sql in the Supabase SQL Editor.")
