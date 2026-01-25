# User Account Features Plan

## Research Summary

Based on industry best practices and common user account implementations, here are the standard features found in modern account systems.

## Current Implementation Status

✅ **Already Implemented:**
- Account page with tabs (Saved, Activity, Settings)
- Theme toggle (light/dark mode)
- Basic privacy toggle UI (not functional)
- User session management via NextAuth

❌ **Missing:**
- Sign out functionality
- Profile editing
- Email management
- Security settings
- Account deletion

---

## Recommended Features (Prioritized)

### 🔴 **Critical (Must Have)**

#### 1. Sign Out
**Status:** ❌ Missing  
**Priority:** HIGHEST  
**Implementation:**
- Add sign out button to account settings
- Add sign out option to user menu/dropdown in nav
- Use NextAuth's `signOut()` function

**Location:**
- Settings tab in account page
- User dropdown menu in main nav (if you add one)

---

### 🟡 **High Priority (Should Have)**

#### 2. Profile Information Display & Edit
**Status:** ⚠️ Partial (display only via session)  
**Priority:** HIGH  
**Features:**
- Display current email (read-only, since using email auth)
- Display username/handle (editable)
- Display avatar (if you add avatar support)
- Display account creation date
- Edit handle/username

**Database:** Already have `profiles` table with `handle`, `avatar_url`, `email`

#### 3. Email Management
**Status:** ❌ Missing  
**Priority:** HIGH  
**Features:**
- Display current email (read-only for email auth)
- Email verification status indicator
- Change email (requires re-verification)
- Email preferences (newsletter, notifications)

**Note:** Since you're using email magic links, changing email requires new verification

#### 4. Session Management
**Status:** ❌ Missing  
**Priority:** MEDIUM-HIGH  
**Features:**
- View active sessions/devices
- Sign out from specific devices
- Sign out from all devices
- Last login information

**Note:** NextAuth JWT doesn't track multiple sessions by default, may need enhancement

---

### 🟢 **Medium Priority (Nice to Have)**

#### 5. Privacy Settings
**Status:** ⚠️ UI exists but not functional  
**Priority:** MEDIUM  
**Features:**
- Show "Going" status publicly (toggle)
- Show profile publicly (toggle)
- Show activity/comments publicly (toggle)
- Block users (if you add user blocking)

#### 6. Notification Preferences
**Status:** ❌ Missing  
**Priority:** MEDIUM  
**Features:**
- Email notifications for:
  - Event reminders
  - New comments on your events
  - Event approval/rejection
  - Newsletter
- In-app notification preferences (if you add in-app notifications)

#### 7. Connected Accounts
**Status:** ❌ Missing  
**Priority:** LOW-MEDIUM  
**Features:**
- Display connected email
- Add OAuth providers (Google, GitHub, etc.) - future enhancement
- Remove connected accounts

**Note:** Currently only email auth, but structure for OAuth exists

#### 8. Account Deletion
**Status:** ❌ Missing  
**Priority:** MEDIUM  
**Features:**
- Request account deletion
- Confirm deletion (with warning)
- Delete all user data (GDPR compliance)
- Export data before deletion (GDPR requirement)

---

### 🔵 **Low Priority (Future Enhancements)**

#### 9. Security Settings
**Status:** ❌ Missing  
**Priority:** LOW (not applicable to email-only auth yet)  
**Features:**
- Change password (if you add password auth)
- Two-factor authentication (2FA)
- Security activity log
- Trusted devices

**Note:** Not needed for email magic link auth, but good for future

#### 10. Billing & Subscriptions
**Status:** ❌ Missing  
**Priority:** LOW (deferred per DEFERRED.md)  
**Features:**
- View subscription status
- Payment methods
- Billing history
- Cancel subscription

**Note:** Payment integration is deferred per your DEFERRED.md

#### 11. Data Export
**Status:** ❌ Missing  
**Priority:** LOW  
**Features:**
- Export all user data (GDPR compliance)
- Download data as JSON/CSV
- Include: profile, saved events, comments, submissions

---

## Recommended Implementation Order

### Phase 1: Critical (Do Now)
1. ✅ **Sign Out** - Add to Settings tab and nav menu

### Phase 2: High Priority (This Sprint)
2. ✅ **Profile Display & Edit** - Show and edit handle/username
3. ✅ **Email Display** - Show current email (read-only)

### Phase 3: Medium Priority (Next Sprint)
4. ✅ **Privacy Settings** - Make existing toggle functional
5. ✅ **Notification Preferences** - Basic email notification toggles
6. ✅ **Session Management** - Basic "Sign out from all devices"

### Phase 4: Future
7. Account deletion
8. Data export
9. Security settings (when adding password auth)
10. Connected accounts (when adding OAuth)

---

## Implementation Details

### Sign Out Implementation

**File:** `app/account/page.tsx` (Settings tab)  
**File:** `components/nav/main-nav.tsx` (if adding user menu)

```typescript
import { signOut } from "next-auth/react";

// In Settings tab
<button
  onClick={() => signOut({ callbackUrl: "/" })}
  className="..."
>
  Sign Out
</button>
```

### Profile Edit Implementation

**API Route:** `app/api/profile/update/route.ts` (already exists!)  
**Database:** Update `profiles.handle` via existing API

**Features:**
- Edit handle/username
- Upload avatar (if adding file upload)
- Display email (read-only)

### Privacy Settings Implementation

**Database:** Add `privacy_settings` table or add columns to `profiles`:
- `show_going_publicly` (boolean)
- `show_profile_publicly` (boolean)
- `show_activity_publicly` (boolean)

**API:** Update privacy settings endpoint

---

## Database Schema Additions Needed

```sql
-- Add to profiles table (if not exists)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_going_publicly BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_profile_publicly BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_activity_publicly BOOLEAN DEFAULT true;

-- Notification preferences (optional)
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  email_event_reminders BOOLEAN DEFAULT true,
  email_comments BOOLEAN DEFAULT true,
  email_approvals BOOLEAN DEFAULT true,
  email_newsletter BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## UI/UX Recommendations

### Settings Tab Organization

1. **Profile**
   - Handle/Username (editable)
   - Email (read-only, with verification badge)
   - Avatar (if implemented)

2. **Privacy**
   - Show "Going" publicly (toggle)
   - Show profile publicly (toggle)
   - Show activity publicly (toggle)

3. **Notifications**
   - Email notification toggles
   - Newsletter subscription

4. **Security**
   - Active sessions
   - Sign out from all devices
   - Sign out button

5. **Account**
   - Account creation date
   - Export data
   - Delete account (danger zone)

### Sign Out Button Placement

**Option 1:** Settings tab, bottom of Security section  
**Option 2:** User dropdown menu in nav (if you add one)  
**Option 3:** Both locations

**Recommendation:** Both - Settings tab for full control, nav menu for quick access

---

## Next Steps

1. **Immediate:** Implement sign out functionality
2. **This Week:** Add profile editing (handle/username)
3. **Next Week:** Make privacy settings functional
4. **Future:** Add notification preferences and session management

---

## References

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [NIST Digital Identity Guidelines](https://www.nist.gov/publications/digital-identity-guidelines)
- [Auth0 User Profile Components](https://components.lab.auth0.com/docs/components/user-profile)
- [Clerk User Profile Reference](https://clerk.com/docs/react/reference/components/user/user-profile)
