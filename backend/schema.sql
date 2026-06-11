-- SwiftMint Exchange - Supabase Schema
-- Run this in the Supabase SQL Editor to create all required tables
-- Safe to run repeatedly (uses IF NOT EXISTS)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  username TEXT NOT NULL DEFAULT '' CHECK (username = LOWER(BTRIM(username))),
  phone TEXT NOT NULL DEFAULT '' CHECK (phone = BTRIM(phone)),
  email TEXT NOT NULL DEFAULT '' CHECK (email = LOWER(BTRIM(email))),
  password_hash TEXT NOT NULL DEFAULT '',
  firebase_uid TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  token_version INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone ON users(phone) WHERE phone != '';
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_normalized ON users(LOWER(BTRIM(email)));
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_normalized ON users(LOWER(BTRIM(username)));
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_firebase_uid_unique ON users(firebase_uid) WHERE firebase_uid IS NOT NULL AND firebase_uid != '';
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);

-- To make a user an admin, run:
-- UPDATE users SET is_admin = TRUE WHERE email = 'admin@example.com';

-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('send', 'receive', 'fund', 'bill', 'fee')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'processing', 'completed', 'cancelled')),
  amount BIGINT NOT NULL,
  fee BIGINT NOT NULL DEFAULT 0,
  payout BIGINT NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'MWK',
  description TEXT NOT NULL DEFAULT '',
  reference TEXT NOT NULL,
  idempotency_key TEXT,
  country TEXT,
  recipient_name TEXT,
  wallet_type TEXT,
  recipient_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bill payments table
CREATE TABLE IF NOT EXISTS bill_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  biller TEXT NOT NULL,
  account_number TEXT NOT NULL,
  amount BIGINT NOT NULL,
  fee BIGINT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  reference TEXT NOT NULL,
  idempotency_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Keep existing deployments compatible with integer money storage.
ALTER TABLE wallets ALTER COLUMN balance TYPE BIGINT USING ROUND(balance)::BIGINT;
ALTER TABLE transactions ALTER COLUMN amount TYPE BIGINT USING ROUND(amount)::BIGINT;
ALTER TABLE transactions ALTER COLUMN fee TYPE BIGINT USING ROUND(fee)::BIGINT;
ALTER TABLE transactions ALTER COLUMN payout TYPE BIGINT USING ROUND(payout)::BIGINT;
ALTER TABLE bill_payments ALTER COLUMN amount TYPE BIGINT USING ROUND(amount)::BIGINT;
ALTER TABLE bill_payments ALTER COLUMN fee TYPE BIGINT USING ROUND(fee)::BIGINT;

ALTER TABLE transactions ADD COLUMN IF NOT EXISTS idempotency_key TEXT;
ALTER TABLE bill_payments ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bill_payments_user_id ON bill_payments(user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_wallets_user_id_unique ON wallets(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_reference_unique ON transactions(reference);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bill_payments_reference_unique ON bill_payments(reference);
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_idempotency_unique
  ON transactions(user_id, type, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE OR REPLACE FUNCTION create_user_with_wallet(
  p_name TEXT,
  p_email TEXT,
  p_username TEXT,
  p_phone TEXT,
  p_password_hash TEXT,
  p_firebase_uid TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  username TEXT,
  phone TEXT,
  email TEXT,
  password_hash TEXT,
  firebase_uid TEXT,
  is_admin BOOLEAN,
  token_version INTEGER,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH inserted_user AS (
    INSERT INTO users (
      name,
      phone,
      email,
      username,
      password_hash,
      firebase_uid,
      is_admin,
      created_at
    )
    VALUES (
      COALESCE(NULLIF(BTRIM(p_name), ''), 'User'),
      COALESCE(BTRIM(p_phone), ''),
      LOWER(BTRIM(p_email)),
      LOWER(BTRIM(p_username)),
      COALESCE(p_password_hash, ''),
      p_firebase_uid,
      FALSE,
      NOW()
    )
    RETURNING users.*
  ),
  inserted_wallet AS (
    INSERT INTO wallets (user_id, balance, created_at, updated_at)
    SELECT inserted_user.id, 0, NOW(), NOW()
    FROM inserted_user
    ON CONFLICT (user_id) DO NOTHING
  )
  SELECT
    inserted_user.id,
    inserted_user.name,
    inserted_user.username,
    inserted_user.phone,
    inserted_user.email,
    inserted_user.password_hash,
    inserted_user.firebase_uid,
    inserted_user.is_admin,
    inserted_user.token_version,
    inserted_user.created_at
  FROM inserted_user;
END;
$$;

-- Testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  text TEXT NOT NULL,
  stars INTEGER NOT NULL DEFAULT 5 CHECK (stars >= 1 AND stars <= 5),
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(is_approved, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bill_payments_idempotency_unique
  ON bill_payments(user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE OR REPLACE FUNCTION debit_wallet_for_send(
  p_user_id UUID,
  p_amount BIGINT,
  p_fee BIGINT,
  p_reference TEXT,
  p_country TEXT,
  p_recipient_name TEXT,
  p_wallet_type TEXT,
  p_recipient_number TEXT,
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
  v_total BIGINT := p_amount + p_fee;
BEGIN
  IF p_idempotency_key IS NOT NULL THEN
    SELECT * INTO v_txn
    FROM transactions
    WHERE user_id = p_user_id
      AND type = 'send'
      AND idempotency_key = p_idempotency_key;

    IF FOUND THEN
      SELECT * INTO v_wallet FROM wallets WHERE user_id = p_user_id;
      RETURN jsonb_build_object(
        'success', true,
        'reference', v_txn.reference,
        'amount', v_txn.amount,
        'fee', v_txn.fee,
        'total', v_txn.amount + v_txn.fee,
        'new_balance', COALESCE(v_wallet.balance, 0),
        'status', v_txn.status,
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

  IF v_wallet.balance < v_total THEN
    RAISE EXCEPTION 'Insufficient wallet balance' USING ERRCODE = 'P0001';
  END IF;

  UPDATE wallets
  SET balance = balance - v_total,
      updated_at = NOW()
  WHERE id = v_wallet.id
  RETURNING * INTO v_wallet;

  INSERT INTO transactions (
    user_id, type, status, amount, fee, payout, currency, description,
    reference, idempotency_key, country, recipient_name, wallet_type,
    recipient_number, created_at, updated_at
  )
  VALUES (
    p_user_id, 'send', 'pending', p_amount, p_fee, p_amount, 'MWK',
    'Send to ' || p_recipient_name || ' (' || p_country || ') via ' || p_wallet_type,
    p_reference, p_idempotency_key, p_country, p_recipient_name, p_wallet_type,
    p_recipient_number, NOW(), NOW()
  )
  RETURNING * INTO v_txn;

  RETURN jsonb_build_object(
    'success', true,
    'reference', v_txn.reference,
    'amount', v_txn.amount,
    'fee', v_txn.fee,
    'total', v_txn.amount + v_txn.fee,
    'new_balance', v_wallet.balance,
    'status', v_txn.status,
    'replayed', false
  );
END;
$$;

CREATE OR REPLACE FUNCTION debit_wallet_for_bill(
  p_user_id UUID,
  p_biller TEXT,
  p_account_number TEXT,
  p_amount BIGINT,
  p_fee BIGINT,
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
  v_total BIGINT := p_amount + p_fee;
BEGIN
  IF p_idempotency_key IS NOT NULL THEN
    SELECT * INTO v_txn
    FROM transactions
    WHERE user_id = p_user_id
      AND type = 'bill'
      AND idempotency_key = p_idempotency_key;

    IF FOUND THEN
      SELECT * INTO v_wallet FROM wallets WHERE user_id = p_user_id;
      RETURN jsonb_build_object(
        'success', true,
        'reference', v_txn.reference,
        'amount', v_txn.amount,
        'fee', v_txn.fee,
        'total', v_txn.amount + v_txn.fee,
        'new_balance', COALESCE(v_wallet.balance, 0),
        'status', v_txn.status,
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

  IF v_wallet.balance < v_total THEN
    RAISE EXCEPTION 'Insufficient wallet balance' USING ERRCODE = 'P0001';
  END IF;

  UPDATE wallets
  SET balance = balance - v_total,
      updated_at = NOW()
  WHERE id = v_wallet.id
  RETURNING * INTO v_wallet;

  INSERT INTO transactions (
    user_id, type, status, amount, fee, payout, currency, description,
    reference, idempotency_key, created_at, updated_at
  )
  VALUES (
    p_user_id, 'bill', 'completed', p_amount, p_fee, p_amount, 'MWK',
    'Bill payment to ' || p_biller,
    p_reference, p_idempotency_key, NOW(), NOW()
  )
  RETURNING * INTO v_txn;

  INSERT INTO bill_payments (
    user_id, biller, account_number, amount, fee, status, reference,
    idempotency_key, created_at
  )
  VALUES (
    p_user_id, p_biller, p_account_number, p_amount, p_fee, 'completed',
    p_reference, p_idempotency_key, NOW()
  );

  RETURN jsonb_build_object(
    'success', true,
    'reference', v_txn.reference,
    'amount', v_txn.amount,
    'fee', v_txn.fee,
    'total', v_txn.amount + v_txn.fee,
    'new_balance', v_wallet.balance,
    'status', v_txn.status,
    'replayed', false
  );
END;
$$;

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
    SELECT * INTO v_txn
    FROM transactions
    WHERE user_id = p_user_id
      AND type = 'fund'
      AND idempotency_key = p_idempotency_key;

    RETURN jsonb_build_object(
      'success', true,
      'reference', COALESCE(v_txn.reference, p_reference),
      'new_balance', v_wallet.balance,
      'replayed', true
    );
  END IF;

  UPDATE wallets
  SET balance = balance + p_amount,
      updated_at = NOW()
  WHERE id = v_wallet.id
  RETURNING * INTO v_wallet;

  RETURN jsonb_build_object(
    'success', true,
    'reference', v_txn.reference,
    'new_balance', v_wallet.balance,
    'replayed', false
  );
END;
$$;
