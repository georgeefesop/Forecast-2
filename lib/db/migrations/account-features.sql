-- Account Features Migration
-- Adds support for avatars, privacy settings, notifications, subscriptions, billing, and account deletion

-- ============================================
-- AVATAR SYSTEM
-- ============================================

-- Add avatar_source to track generated vs uploaded
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_source VARCHAR(20) DEFAULT 'generated';
-- Options: 'generated', 'uploaded'

-- ============================================
-- PRIVACY SETTINGS
-- ============================================

-- Add privacy columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_going_publicly BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_profile_publicly BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_activity_publicly BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_comments_publicly BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_email_publicly BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS allow_direct_messages BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_location_publicly BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_visibility VARCHAR(20) DEFAULT 'public';
-- Options: 'public', 'unlisted', 'private'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS share_analytics_data BOOLEAN DEFAULT true;

-- ============================================
-- NOTIFICATION PREFERENCES
-- ============================================

CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id TEXT PRIMARY KEY REFERENCES profiles(user_id) ON DELETE CASCADE,
  
  -- Event notifications
  email_event_reminders BOOLEAN DEFAULT true,
  email_event_updates BOOLEAN DEFAULT true,
  email_new_matching_events BOOLEAN DEFAULT true,
  
  -- Social notifications
  email_comments BOOLEAN DEFAULT true,
  email_comment_replies BOOLEAN DEFAULT true,
  email_going_notifications BOOLEAN DEFAULT true,
  
  -- Account notifications
  email_submission_updates BOOLEAN DEFAULT true,
  email_claim_updates BOOLEAN DEFAULT true,
  email_security_alerts BOOLEAN DEFAULT true,
  
  -- Newsletter
  email_newsletter BOOLEAN DEFAULT false,
  email_weekly_digest BOOLEAN DEFAULT false,
  email_featured_events BOOLEAN DEFAULT false,
  
  -- Digest frequency
  digest_frequency VARCHAR(20) DEFAULT 'weekly',
  -- Options: 'daily', 'weekly', 'never'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON notification_preferences(user_id);

-- ============================================
-- EVENT SUBSCRIPTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS event_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  subscription_type VARCHAR(50) NOT NULL,
  -- Types: 'category', 'venue', 'organizer', 'location', 'keyword', 'event'
  subscription_value TEXT NOT NULL,
  -- Value depends on type: category name, venue ID, organizer ID, location, keyword, event ID
  notification_frequency VARCHAR(20) DEFAULT 'immediate',
  -- Options: 'immediate', 'daily_digest', 'weekly_digest'
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, subscription_type, subscription_value)
);

CREATE INDEX IF NOT EXISTS idx_event_subscriptions_user ON event_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_event_subscriptions_type ON event_subscriptions(subscription_type);
CREATE INDEX IF NOT EXISTS idx_event_subscriptions_enabled ON event_subscriptions(enabled) WHERE enabled = true;

-- ============================================
-- SECURITY SETTINGS (Password Support)
-- ============================================

-- Add password support to users table (if using separate users table)
-- Note: Currently using NextAuth with email, but adding password support for future
-- If you have a separate users table, uncomment:
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE;

-- For now, add to profiles (if you want to store password there)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE;

-- ============================================
-- BILLING & SUBSCRIPTIONS
-- ============================================

-- Add Stripe customer info to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  status VARCHAR(20) NOT NULL,
  -- Options: 'active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired'
  plan_type VARCHAR(50),
  -- Options: 'boost_basic', 'boost_pro', 'organizer_pro', 'venue_pro', etc.
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Payment history (extends existing orders table, but more detailed)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_invoice_id TEXT,
  amount INTEGER NOT NULL, -- in cents
  currency VARCHAR(3) DEFAULT 'EUR',
  status VARCHAR(20) NOT NULL,
  -- Options: 'succeeded', 'pending', 'failed', 'refunded', 'canceled'
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- ============================================
-- ACCOUNT DELETION
-- ============================================

-- Track deletion requests
CREATE TABLE IF NOT EXISTS account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scheduled_deletion_at TIMESTAMP WITH TIME ZONE,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  -- Options: 'pending', 'scheduled', 'completed', 'cancelled'
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_deletion_requests_user ON account_deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_status ON account_deletion_requests(status);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_subscriptions_updated_at
  BEFORE UPDATE ON event_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INITIAL DATA SETUP
-- ============================================

-- Create default notification preferences for existing users
INSERT INTO notification_preferences (user_id)
SELECT user_id FROM profiles
ON CONFLICT (user_id) DO NOTHING;
