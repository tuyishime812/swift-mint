-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/qkiflkpwlgxdttijeduq/sql/new

-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid TEXT;

-- Create indexes for the new columns
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);

-- Update existing user to have a username (copy from name)
UPDATE users SET username = name WHERE username = '';

-- Make the existing user (tuyishimemartin007@gmail.com) an admin
UPDATE users SET is_admin = TRUE WHERE email = 'tuyishimemartin007@gmail.com';

-- Verify
SELECT id, name, username, email, is_admin FROM users;
