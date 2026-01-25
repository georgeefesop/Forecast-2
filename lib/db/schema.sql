-- Forecast Database Schema
-- Vercel Postgres (Note: @vercel/postgres is deprecated, consider migrating to Neon)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  user_id TEXT PRIMARY KEY,
  handle TEXT NOT NULL UNIQUE,
  email TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  is_organizer BOOLEAN DEFAULT FALSE,
  going_public_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Venues table
CREATE TABLE IF NOT EXISTS venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL,
  address TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  type TEXT,
  tags TEXT[],
  phone TEXT,
  email TEXT,
  website TEXT,
  instagram TEXT,
  claim_status TEXT DEFAULT 'unclaimed' CHECK (claim_status IN ('unclaimed', 'pending', 'claimed', 'rejected')),
  claimed_by_user_id TEXT REFERENCES profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  end_at TIMESTAMP WITH TIME ZONE,
  city TEXT NOT NULL,
  venue_id UUID REFERENCES venues(id),
  address_text TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  category TEXT,
  tags TEXT[],
  price_min DECIMAL(10, 2),
  price_max DECIMAL(10, 2),
  currency TEXT DEFAULT 'EUR',
  image_url TEXT,
  ticket_url TEXT,
  status TEXT DEFAULT 'published' CHECK (status IN ('published', 'pending', 'archived')),
  source_name TEXT,
  source_url TEXT,
  source_external_id TEXT,
  created_by_user_id TEXT REFERENCES profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event actions (save, interested, going, etc.)
CREATE TABLE IF NOT EXISTS event_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES profiles(user_id),
  event_id UUID NOT NULL REFERENCES events(id),
  type TEXT NOT NULL CHECK (type IN ('save', 'interested', 'going', 'ticket_click', 'share')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, event_id, type)
);

-- Event counters (denormalized for performance)
CREATE TABLE IF NOT EXISTS event_counters (
  event_id UUID PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE,
  interested_count INTEGER DEFAULT 0,
  going_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  ticket_clicks_count INTEGER DEFAULT 0,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vibe checks
CREATE TABLE IF NOT EXISTS vibe_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES profiles(user_id),
  event_id UUID NOT NULL REFERENCES events(id),
  crowd TEXT CHECK (crowd IN ('chill', 'mixed', 'intense')),
  music TEXT CHECK (music IN ('🔥', 'ok', 'meh')),
  queue TEXT CHECK (queue IN ('short', 'medium', 'long')),
  value TEXT CHECK (value IN ('worth it', 'overpriced')),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(user_id),
  body TEXT NOT NULL,
  status TEXT DEFAULT 'visible' CHECK (status IN ('visible', 'hidden')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_user_id TEXT NOT NULL REFERENCES profiles(user_id),
  target_type TEXT NOT NULL CHECK (target_type IN ('event', 'venue', 'comment', 'user')),
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Submissions
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES profiles(user_id),
  payload_json JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_user_id TEXT NOT NULL REFERENCES profiles(user_id),
  product_type TEXT NOT NULL CHECK (product_type IN ('promote_event', 'feature_venue', 'sponsor_newsletter')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_payment', 'active', 'paused', 'ended')),
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  targeting_json JSONB,
  budget_cents INTEGER,
  currency TEXT DEFAULT 'EUR',
  creative_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Placements
CREATE TABLE IF NOT EXISTS placements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  placement_type TEXT NOT NULL CHECK (placement_type IN ('home_banner', 'featured_events', 'explore_insert', 'map_highlight', 'event_sponsor_tile', 'newsletter_sponsor')),
  config_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders (for Stripe integration)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES profiles(user_id),
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'EUR',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  city TEXT,
  interests TEXT[],
  frequency TEXT DEFAULT 'weekly' CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verification tokens for NextAuth Email provider
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_city ON events(city);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_start_at ON events(start_at);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_venue_id ON events(venue_id);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_events_source ON events(source_name, source_external_id);

CREATE INDEX IF NOT EXISTS idx_venues_slug ON venues(slug);
CREATE INDEX IF NOT EXISTS idx_venues_city ON venues(city);
CREATE INDEX IF NOT EXISTS idx_venues_claim_status ON venues(claim_status);

CREATE INDEX IF NOT EXISTS idx_event_actions_user_event ON event_actions(user_id, event_id);
CREATE INDEX IF NOT EXISTS idx_event_actions_type ON event_actions(type);

CREATE INDEX IF NOT EXISTS idx_comments_event ON comments(event_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);

CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON campaigns(starts_at, ends_at);

CREATE INDEX IF NOT EXISTS idx_placements_campaign ON placements(campaign_id);
CREATE INDEX IF NOT EXISTS idx_placements_type ON placements(placement_type);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_campaign ON orders(campaign_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

CREATE INDEX IF NOT EXISTS idx_verification_tokens_identifier ON verification_tokens(identifier);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_expires ON verification_tokens(expires);

-- Function to update event counters
CREATE OR REPLACE FUNCTION update_event_counters()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO event_counters (event_id, interested_count, going_count, saves_count, last_activity_at)
    VALUES (NEW.event_id, 0, 0, 0, NOW())
    ON CONFLICT (event_id) DO NOTHING;
    
    IF NEW.type = 'interested' THEN
      UPDATE event_counters SET interested_count = interested_count + 1, last_activity_at = NOW()
      WHERE event_id = NEW.event_id;
    ELSIF NEW.type = 'going' THEN
      UPDATE event_counters SET going_count = going_count + 1, last_activity_at = NOW()
      WHERE event_id = NEW.event_id;
    ELSIF NEW.type = 'save' THEN
      UPDATE event_counters SET saves_count = saves_count + 1, last_activity_at = NOW()
      WHERE event_id = NEW.event_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.type = 'interested' THEN
      UPDATE event_counters SET interested_count = GREATEST(0, interested_count - 1), last_activity_at = NOW()
      WHERE event_id = OLD.event_id;
    ELSIF OLD.type = 'going' THEN
      UPDATE event_counters SET going_count = GREATEST(0, going_count - 1), last_activity_at = NOW()
      WHERE event_id = OLD.event_id;
    ELSIF OLD.type = 'save' THEN
      UPDATE event_counters SET saves_count = GREATEST(0, saves_count - 1), last_activity_at = NOW()
      WHERE event_id = OLD.event_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for event counters
DROP TRIGGER IF EXISTS trigger_update_event_counters ON event_actions;
CREATE TRIGGER trigger_update_event_counters
  AFTER INSERT OR DELETE ON event_actions
  FOR EACH ROW
  EXECUTE FUNCTION update_event_counters();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for events updated_at
DROP TRIGGER IF EXISTS trigger_update_events_updated_at ON events;
CREATE TRIGGER trigger_update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
