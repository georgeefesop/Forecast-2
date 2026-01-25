# Account Features Implementation Plan

## Overview

Comprehensive account management system with avatar support, privacy controls, notification preferences with event subscriptions, security settings, billing, and account deletion.

---

## 1. Avatar System

### Requirements
- Auto-generated avatars (fallback/default)
- User-uploaded avatar option
- Safe file upload with validation
- Image optimization and storage

### Implementation

#### Database
```sql
-- Already exists: profiles.avatar_url (TEXT)
-- Add avatar_source to track if it's generated or uploaded
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_source VARCHAR(20) DEFAULT 'generated';
-- Options: 'generated', 'uploaded'
```

#### Avatar Generation
**Library:** Use a library like `@dicebear/core` with style options
- Generate based on user ID or handle
- Consistent style across the app
- No external API calls needed

**Options:**
- `@dicebear/collection/avataaars` - Avatar style
- `@dicebear/collection/initials` - Initials style
- `@dicebear/collection/bottts` - Bot style

#### Avatar Upload
**Storage:** Vercel Blob (already configured)
**Safety Measures:**
1. File type validation (only images: jpg, jpeg, png, webp)
2. File size limit (max 5MB)
3. Image dimensions validation (min 200x200, max 2000x2000)
4. Image processing/resizing (optimize to 400x400)
5. Virus scanning (optional, via Vercel Blob)
6. Rate limiting (prevent abuse)

**API Route:** `app/api/profile/avatar/route.ts`
- POST: Upload new avatar
- DELETE: Remove uploaded avatar (revert to generated)

#### UI Components
- Avatar display component with fallback
- Avatar upload button with preview
- Avatar removal option
- Loading states during upload

---

## 2. Privacy Features

### Privacy Settings Structure

#### Database Schema
```sql
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
```

#### Privacy Features

1. **Profile Visibility**
   - Public: Anyone can view profile
   - Unlisted: Only accessible via direct link
   - Private: Only you can view

2. **Activity Visibility**
   - Show "Going" status publicly
   - Show comments publicly
   - Show submissions publicly
   - Show vibe checks publicly

3. **Contact Privacy**
   - Show email publicly (default: false)
   - Allow direct messages (default: false)
   - Show location publicly (default: false)

4. **Data Sharing**
   - Share analytics data (for app improvement)
   - Share with third-party services (if any)

#### API Route
`app/api/profile/privacy/route.ts`
- GET: Fetch privacy settings
- POST: Update privacy settings

---

## 3. Notification System

### Notification Types

#### Email Notifications
1. **Event-Related**
   - Event reminders (24h, 1h before)
   - New events matching your interests
   - Events you're "Going" to are updated
   - Events you're "Interested" in are starting soon

2. **Social**
   - New comments on your submissions
   - Replies to your comments
   - Someone "Going" to your event
   - Someone commented on an event you're "Going" to

3. **Account**
   - Event submission approved/rejected
   - Venue claim approved/rejected
   - Account security alerts
   - Email verification

4. **Newsletter**
   - Weekly digest
   - Featured events
   - New venues
   - Special announcements

#### Event Subscriptions

**Database Schema:**
```sql
-- Event subscriptions table
CREATE TABLE IF NOT EXISTS event_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_type VARCHAR(50) NOT NULL,
  -- Types: 'category', 'venue', 'organizer', 'location', 'keyword'
  subscription_value TEXT NOT NULL,
  -- Value depends on type: category name, venue ID, organizer ID, location, keyword
  notification_frequency VARCHAR(20) DEFAULT 'immediate',
  -- Options: 'immediate', 'daily_digest', 'weekly_digest'
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, subscription_type, subscription_value)
);

CREATE INDEX idx_event_subscriptions_user ON event_subscriptions(user_id);
CREATE INDEX idx_event_subscriptions_type ON event_subscriptions(subscription_type);
```

**Subscription Types:**
1. **Category Subscriptions**
   - Subscribe to all events in a category (e.g., "Music", "Theater")
   - Get notified when new events match

2. **Venue Subscriptions**
   - Subscribe to a specific venue
   - Get notified of all new events at that venue

3. **Organizer Subscriptions**
   - Subscribe to an organizer's events
   - Get notified when they create new events

4. **Location Subscriptions**
   - Subscribe to events in a specific area/neighborhood
   - Get notified of nearby events

5. **Keyword Subscriptions**
   - Subscribe to events matching keywords
   - Get notified when events match your keywords

#### Notification Preferences Schema
```sql
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  
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
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### API Routes
- `app/api/notifications/preferences/route.ts` - Get/update preferences
- `app/api/notifications/subscriptions/route.ts` - Manage event subscriptions
- `app/api/notifications/subscribe/route.ts` - Subscribe to specific events/categories

#### UI Components
- Notification preferences page with toggles
- Event subscription manager
- "Subscribe" buttons on event/venue/organizer pages
- Unsubscribe links in emails

---

## 4. Security Settings

### Change Password

**Note:** Currently using email magic links, but adding password option for users who want it.

#### Database
```sql
-- Add password support to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE;
```

#### Implementation
- Password strength requirements:
  - Minimum 12 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- Password hashing: Use bcrypt (industry standard)
- Password change requires current password (if password exists)
- Email notification on password change
- "Forgot password" flow (email reset link)
- Option to set password (if user only has email auth)

#### API Routes
- `app/api/auth/change-password/route.ts` - Change password
- `app/api/auth/set-password/route.ts` - Set initial password (for email-only users)
- `app/api/auth/reset-password/route.ts` - Request password reset
- `app/api/auth/reset-password/confirm/route.ts` - Confirm password reset

#### UI
- Change password form in Security settings
- Set password option (if no password exists)
- Password strength indicator (real-time)
- Show last password change date
- "Forgot password" link on sign-in page

---

## 5. Billing & Subscriptions

### Integration with Stripe

#### Database Schema
```sql
-- Customer information
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Subscription status
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  status VARCHAR(20) NOT NULL,
  -- Options: 'active', 'canceled', 'past_due', 'trialing'
  plan_type VARCHAR(50),
  -- Options: 'boost_basic', 'boost_pro', 'organizer_pro', etc.
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);

-- Payment history
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  amount INTEGER NOT NULL, -- in cents
  currency VARCHAR(3) DEFAULT 'EUR',
  status VARCHAR(20) NOT NULL,
  -- Options: 'succeeded', 'pending', 'failed', 'refunded'
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payments_user ON payments(user_id);
```

#### Features
1. **Subscription Management**
   - View current subscription
   - Upgrade/downgrade plans
   - Cancel subscription
   - Update payment method
   - View billing history

2. **Payment Methods**
   - Add credit card
   - Remove payment methods
   - Set default payment method

3. **Invoices**
   - View/download invoices
   - Email invoice receipts

#### API Routes
- `app/api/billing/subscription/route.ts` - Get subscription info
- `app/api/billing/payment-methods/route.ts` - Manage payment methods
- `app/api/billing/invoices/route.ts` - Get invoices
- `app/api/billing/cancel/route.ts` - Cancel subscription

#### UI Components
- Billing dashboard
- Subscription status card
- Payment method management
- Invoice list
- Upgrade/downgrade buttons

---

## 6. Account Deletion

### GDPR Compliance

#### Database Schema
```sql
-- Track deletion requests
CREATE TABLE IF NOT EXISTS account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  requested_at TIMESTAMP DEFAULT NOW(),
  scheduled_deletion_at TIMESTAMP,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  -- Options: 'pending', 'scheduled', 'completed', 'cancelled'
  UNIQUE(user_id)
);

CREATE INDEX idx_deletion_requests_user ON account_deletion_requests(user_id);
```

#### Implementation Steps

1. **Data Export (Before Deletion)**
   - Export all user data as JSON
   - Include: profile, events, comments, submissions, subscriptions
   - Download link valid for 30 days

2. **Deletion Process**
   - Immediate deletion option (with confirmation)
   - Scheduled deletion (30 days grace period)
   - Soft delete first (mark as deleted, hide from public)
   - Hard delete after grace period (permanent removal)

3. **What Gets Deleted**
   - User account
   - Profile data
   - Personal submissions (or anonymize)
   - Comments (or anonymize)
   - Subscriptions
   - Notification preferences
   - Payment data (per Stripe requirements, may need to keep some)

4. **What Gets Anonymized (Optional)**
   - Keep event submissions but remove user association
   - Keep comments but mark as "Deleted User"
   - Keep analytics data (anonymized)

#### API Routes
- `app/api/account/export/route.ts` - Export user data
- `app/api/account/delete/route.ts` - Request account deletion
- `app/api/account/delete/cancel/route.ts` - Cancel deletion request

#### UI Components
- Account deletion section in Settings
- Data export button
- Deletion confirmation dialog
- Warning about permanent deletion
- Cancel deletion option (if scheduled)

---

## Implementation Priority

### Phase 1: Critical (Week 1)
1. ✅ **Sign Out** - Add to Settings tab
2. ✅ **Avatar System** - Generated avatars + upload functionality
3. ✅ **Basic Privacy Settings** - Make existing toggles functional
4. ✅ **Notification Preferences** - Basic email notification toggles

### Phase 2: High Priority (Week 2)
5. ✅ **Event Subscriptions System** - Subscribe to categories, venues, organizers, keywords
6. ✅ **Profile Editing** - Edit handle/username, display email
7. ✅ **Privacy Settings** - Full implementation with all privacy controls

### Phase 3: Medium Priority (Week 3-4)
8. ✅ **Billing Integration** - Stripe subscription management, payment methods, invoices
9. ✅ **Account Deletion** - GDPR-compliant deletion with data export
10. ✅ **Change Password** - Password management for users who want it

### Phase 4: Polish (Week 5)
11. ✅ **Email Templates** - Templates for all notification types
12. ✅ **Notification Digest System** - Daily/weekly digest emails
13. ✅ **Data Export** - Full user data export (GDPR)
14. ✅ **Subscription Management UI** - Easy subscribe/unsubscribe from events

---

## File Structure

```
app/
  account/
    page.tsx (main account page)
    avatar/
      page.tsx (avatar management)
    privacy/
      page.tsx (privacy settings)
    notifications/
      page.tsx (notification preferences)
      subscriptions/
        page.tsx (event subscriptions)
    security/
      page.tsx (security settings)
    billing/
      page.tsx (billing dashboard)
    delete/
      page.tsx (account deletion)

api/
  profile/
    avatar/
      route.ts (upload/delete avatar)
    privacy/
      route.ts (update privacy)
  notifications/
    preferences/
      route.ts (notification prefs)
    subscriptions/
      route.ts (manage subscriptions)
  account/
    export/
      route.ts (export data)
    delete/
      route.ts (delete account)
  billing/
    subscription/
      route.ts
    payment-methods/
      route.ts
    invoices/
      route.ts

components/
  account/
    avatar-upload.tsx
    privacy-settings.tsx
    notification-preferences.tsx
    event-subscriptions.tsx
    billing-dashboard.tsx
    account-deletion.tsx
```

---

## Security Considerations

### Avatar Upload
- File type whitelist (jpg, png, webp only)
- File size limits (5MB max)
- Image dimension limits
- Virus scanning (Vercel Blob)
- Rate limiting (5 uploads per hour)
- Content validation (no malicious images)

### Account Deletion
- Require password confirmation (if password auth)
- Email confirmation link
- Grace period for recovery
- Secure data export (signed URLs, expiration)

### Billing
- Never store full credit card numbers
- Use Stripe for all payment processing
- Secure webhook handling
- PCI compliance via Stripe

---

## Next Steps

1. **Database Migration** - Add all new columns/tables
2. **Avatar System** - Implement generation + upload
3. **Privacy Settings** - Full implementation
4. **Notification System** - Preferences + subscriptions
5. **Billing** - Stripe integration
6. **Account Deletion** - GDPR-compliant deletion
