-- Create venue_claims table

CREATE TABLE IF NOT EXISTS venue_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(user_id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  role TEXT NOT NULL, -- Owner, Manager, Promoter
  contact_info JSONB, -- { website, instagram, email, phone }
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_claims_venue ON venue_claims(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_claims_user ON venue_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_venue_claims_status ON venue_claims(status);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_venue_claims_updated_at ON venue_claims;
CREATE TRIGGER trigger_update_venue_claims_updated_at
  BEFORE UPDATE ON venue_claims
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
