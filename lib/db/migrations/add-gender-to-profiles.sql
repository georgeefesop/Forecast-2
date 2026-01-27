-- Add gender column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'non_binary', 'prefer_not_to_say'));
