-- Expand venues table schema

-- Add new columns
ALTER TABLE venues 
ADD COLUMN IF NOT EXISTS area TEXT,
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS about TEXT,
ADD COLUMN IF NOT EXISTS images TEXT[],
ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Rename existing columns to match spec (optional, but good for consistency if desired)
-- keeping existing names for now to avoid breaking existing code, can alias in queries
-- address -> address_text
-- website -> website_url
-- instagram -> instagram_url

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_venues_updated_at ON venues;
CREATE TRIGGER trigger_update_venues_updated_at
  BEFORE UPDATE ON venues
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
