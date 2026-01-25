-- Add age/birthday and adult-only event support

-- Add birthday to profiles (for age verification)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birthday DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age_verified BOOLEAN DEFAULT false;

-- Add adult_only flag to events
ALTER TABLE events ADD COLUMN IF NOT EXISTS adult_only BOOLEAN DEFAULT false;

-- Create index for filtering adult-only events
CREATE INDEX IF NOT EXISTS idx_events_adult_only ON events(adult_only) WHERE adult_only = true;
