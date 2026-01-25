-- Add support for comment replies, editing, and deletion tracking
-- Migration: Add parent_id, edited_at, and updated_at to comments table

ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for faster parent comment lookups
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);

-- Create index for faster event comment queries with parent ordering
CREATE INDEX IF NOT EXISTS idx_comments_event_parent ON comments(event_id, parent_id, created_at);
