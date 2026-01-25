-- Add high-res flag to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS is_high_res BOOLEAN DEFAULT FALSE;

-- Create index for high-res lookups
CREATE INDEX IF NOT EXISTS idx_events_high_res ON events(is_high_res);
