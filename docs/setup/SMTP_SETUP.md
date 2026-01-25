# SMTP Setup Guide

## What is SMTP used for?

SMTP (Simple Mail Transfer Protocol) is used for **email authentication** in your Forecast app. Specifically:

### Email Magic Links Authentication
- Users sign in by entering their email address
- They receive a magic link via email
- Clicking the link signs them in (no password needed!)
- This is the primary authentication method for your app

### Current Status
- ✅ Email auth is **optional** - your app works without it
- ⚠️ Without SMTP, users **cannot sign in** (no authentication method available)
- 📧 Once configured, users can sign up and log in via email

---

## Free SMTP Solutions (Recommended)

### Option 1: Resend (⭐ Easiest & Recommended)
**Free Tier:** 3,000 emails/month, 100 emails/day

**Setup:**
1. Go to https://resend.com
2. Sign up (free)
3. Create API key
4. Use these settings:
   ```
   SMTP_HOST=smtp.resend.com
   SMTP_PORT=587
   SMTP_USER=resend
   SMTP_PASSWORD=your-resend-api-key
   EMAIL_FROM=noreply@yourdomain.com (or use their default)
   ```

**Pros:**
- ✅ Very easy setup
- ✅ Great for Next.js/React apps
- ✅ Modern API
- ✅ Good free tier

### Option 2: Gmail App Password (Free)
**Free Tier:** Unlimited (with Gmail account limits)

**Setup:**
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Generate App Password
4. Use these settings:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-16-char-app-password
   EMAIL_FROM=your-email@gmail.com
   ```

**Pros:**
- ✅ Free
- ✅ Uses your existing Gmail
- ✅ Unlimited emails (within Gmail limits)

**Cons:**
- ⚠️ Requires 2FA enabled
- ⚠️ Daily sending limits (~500/day)

### Option 3: SendGrid (Free Tier)
**Free Tier:** 100 emails/day forever

**Setup:**
1. Go to https://sendgrid.com
2. Sign up for free account
3. Create API key
4. Use these settings:
   ```
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASSWORD=your-sendgrid-api-key
   EMAIL_FROM=noreply@yourdomain.com
   ```

**Pros:**
- ✅ 100 emails/day free forever
- ✅ Reliable service
- ✅ Good for production

---

## Quick Setup (Resend - Recommended)

### Step 1: Create Resend Account
1. Visit https://resend.com/signup
2. Sign up (free)
3. Verify your email

### Step 2: Get API Key
1. Go to https://resend.com/api-keys
2. Click "Create API Key"
3. Name it "Forecast App"
4. Copy the API key

### Step 3: Set Environment Variables

**Local (.env.local):**
```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASSWORD=re_your_api_key_here
EMAIL_FROM=onboarding@resend.dev
```

**Vercel (via CLI):**
```bash
echo "smtp.resend.com" | vercel env add SMTP_HOST production
echo "587" | vercel env add SMTP_PORT production
echo "resend" | vercel env add SMTP_USER production
echo "re_your_api_key_here" | vercel env add SMTP_PASSWORD production
echo "onboarding@resend.dev" | vercel env add EMAIL_FROM production
```

**Or via Vercel Dashboard:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable for Production, Preview, and Development

### Step 4: Test
1. Restart your dev server: `npm run dev`
2. Visit http://localhost:3000/auth/signin
3. Enter your email
4. Check your inbox for the magic link!

---

## Do You Need SMTP Right Now?

**You can skip SMTP if:**
- You're just testing the app
- You're building features that don't require authentication
- You want to add it later

**You need SMTP if:**
- Users need to sign up/login
- You want to test the full authentication flow
- You're ready to launch

---

## Testing Without SMTP

Your app will work fine without SMTP, but:
- ❌ Users cannot sign in
- ❌ Protected routes won't be accessible
- ✅ You can still browse events, venues, etc.
- ✅ All other features work
