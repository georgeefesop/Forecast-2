-- Add language column to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS language text DEFAULT 'en';

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_events_language ON events(language);
