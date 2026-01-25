-- Add avatar_seed column to store seed for generated avatars
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_seed TEXT;
