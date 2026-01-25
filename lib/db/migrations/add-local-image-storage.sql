-- Add local_image_url to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS local_image_url TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_events_local_image_url ON events(local_image_url);
