-- Add series support to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS series_id UUID,
ADD COLUMN IF NOT EXISTS is_primary_occurrence BOOLEAN DEFAULT FALSE;

-- Create index for series_id
CREATE INDEX IF NOT EXISTS idx_events_series_id ON events(series_id);

-- Create index for primary occurrence lookups
CREATE INDEX IF NOT EXISTS idx_events_is_primary ON events(is_primary_occurrence) WHERE is_primary_occurrence = TRUE;
