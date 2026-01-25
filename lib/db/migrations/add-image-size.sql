-- Add image_size_kb to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS image_size_kb INTEGER;

-- Create index for size filtering
CREATE INDEX IF NOT EXISTS idx_events_image_size ON events(image_size_kb);
