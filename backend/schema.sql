-- SwiftMint Exchange - Supabase Schema
-- Run this in the Supabase SQL Editor to create all required tables
-- Safe to run repeatedly (uses IF NOT EXISTS)

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  username TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL DEFAULT '',
  firebase_uid TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);

-- To make a user an admin, run:
-- UPDATE users SET is_admin = TRUE WHERE email = 'admin@example.com';

-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('send', 'receive', 'fund', 'bill', 'fee')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'processing', 'completed', 'cancelled')),
  amount DOUBLE PRECISION NOT NULL,
  fee DOUBLE PRECISION NOT NULL DEFAULT 0,
  payout DOUBLE PRECISION NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'MWK',
  description TEXT NOT NULL DEFAULT '',
  reference TEXT NOT NULL,
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
  amount DOUBLE PRECISION NOT NULL,
  fee DOUBLE PRECISION NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  reference TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bill_payments_user_id ON bill_payments(user_id);
