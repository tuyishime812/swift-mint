-- SwiftMint production hardening migration.
-- Run in Supabase SQL Editor before deploying the hardened backend.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid TEXT;

UPDATE users SET username = name WHERE username = '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone ON users(phone) WHERE phone != '';
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);

ALTER TABLE transactions ADD COLUMN IF NOT EXISTS idempotency_key TEXT;
ALTER TABLE bill_payments ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

ALTER TABLE wallets ALTER COLUMN balance TYPE BIGINT USING ROUND(balance)::BIGINT;
ALTER TABLE transactions ALTER COLUMN amount TYPE BIGINT USING ROUND(amount)::BIGINT;
ALTER TABLE transactions ALTER COLUMN fee TYPE BIGINT USING ROUND(fee)::BIGINT;
ALTER TABLE transactions ALTER COLUMN payout TYPE BIGINT USING ROUND(payout)::BIGINT;
ALTER TABLE bill_payments ALTER COLUMN amount TYPE BIGINT USING ROUND(amount)::BIGINT;
ALTER TABLE bill_payments ALTER COLUMN fee TYPE BIGINT USING ROUND(fee)::BIGINT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_wallets_user_id_unique ON wallets(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_reference_unique ON transactions(reference);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bill_payments_reference_unique ON bill_payments(reference);
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_idempotency_unique
  ON transactions(user_id, type, idempotency_key)
  WHERE idempotency_key IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_bill_payments_idempotency_unique
  ON bill_payments(user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- Re-run backend/schema.sql after this migration to install or refresh RPC functions.
