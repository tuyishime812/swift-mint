-- SwiftMint production hardening migration.
-- Run in Supabase SQL Editor before deploying the hardened backend.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 0;

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

-- Fix race condition in credit_wallet_by_admin: use ON CONFLICT DO NOTHING
CREATE OR REPLACE FUNCTION credit_wallet_by_admin(
  p_user_id UUID,
  p_admin_id UUID,
  p_amount BIGINT,
  p_reference TEXT,
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet wallets%ROWTYPE;
  v_txn transactions%ROWTYPE;
BEGIN
  IF p_idempotency_key IS NOT NULL THEN
    SELECT * INTO v_txn
    FROM transactions
    WHERE user_id = p_user_id
      AND type = 'fund'
      AND idempotency_key = p_idempotency_key;

    IF FOUND THEN
      SELECT * INTO v_wallet FROM wallets WHERE user_id = p_user_id;
      RETURN jsonb_build_object(
        'success', true,
        'reference', v_txn.reference,
        'new_balance', COALESCE(v_wallet.balance, 0),
        'replayed', true
      );
    END IF;
  END IF;

  SELECT * INTO v_wallet
  FROM wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet not found' USING ERRCODE = 'P0002';
  END IF;

  UPDATE wallets
  SET balance = balance + p_amount,
      updated_at = NOW()
  WHERE id = v_wallet.id
  RETURNING * INTO v_wallet;

  INSERT INTO transactions (
    user_id, type, status, amount, fee, payout, currency, description,
    reference, idempotency_key, created_at, updated_at
  )
  VALUES (
    p_user_id, 'fund', 'completed', p_amount, 0, p_amount, 'MWK',
    'Manual funding by admin ' || p_admin_id::TEXT,
    p_reference, p_idempotency_key, NOW(), NOW()
  )
  ON CONFLICT (user_id, type, idempotency_key) WHERE idempotency_key IS NOT NULL
  DO NOTHING
  RETURNING * INTO v_txn;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', true,
      'reference', p_reference,
      'new_balance', v_wallet.balance,
      'replayed', true
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'reference', v_txn.reference,
    'new_balance', v_wallet.balance,
    'replayed', false
  );
END;
$$;

-- Re-run backend/schema.sql after this migration to install or refresh RPC functions.
