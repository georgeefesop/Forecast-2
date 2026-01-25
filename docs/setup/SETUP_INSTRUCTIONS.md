# Vercel Database Setup Instructions

## ✅ Build Status: PASSING

The application builds successfully! Now let's set up the database.

## Step 1: Create Vercel Postgres Database

**Via Vercel Dashboard:**
1. Go to https://vercel.com/dashboard
2. Select your project: `forecast-2`
3. Go to the **Storage** tab
4. Click **Create Database**
5. Select **Postgres**
6. Name it: `forecast-db`
7. Choose a region (closest to your users)
8. Click **Create**

**After creation:**
- You'll see a connection string like: `postgres://user:password@host:port/database?sslmode=require`
- Copy this - you'll need it for `DATABASE_URL`

## Step 2: Create Vercel Blob Storage

**Via Vercel Dashboard:**
1. In the same **Storage** tab
2. Click **Create Database** again
3. Select **Blob**
4. Name it: `forecast-blob`
5. Click **Create**

**After creation:**
- You'll get a `BLOB_READ_WRITE_TOKEN`
- Copy this token

## Step 3: Set Environment Variables

Run these commands (replace the values with your actual connection string and token):

```bash
# Database URL
echo "postgres://user:password@host:port/database?sslmode=require" | vercel env add DATABASE_URL production
echo "postgres://user:password@host:port/database?sslmode=require" | vercel env add DATABASE_URL preview
echo "postgres://user:password@host:port/database?sslmode=require" | vercel env add DATABASE_URL development

# Blob Token
echo "vercel_blob_xxx..." | vercel env add BLOB_READ_WRITE_TOKEN production
echo "vercel_blob_xxx..." | vercel env add BLOB_READ_WRITE_TOKEN preview
echo "vercel_blob_xxx..." | vercel env add BLOB_READ_WRITE_TOKEN development

# NEXTAUTH_URL (set after first deployment)
# Get your deployment URL from Vercel dashboard after deploying
echo "https://forecast-2.vercel.app" | vercel env add NEXTAUTH_URL production
```

## Step 4: Run Database Schema

**Option A: Via Vercel Dashboard SQL Editor**
1. Go to your database in Vercel Dashboard
2. Click **Data** tab
3. Click **SQL Editor**
4. Copy the entire contents of `lib/db/schema.sql`
5. Paste and execute

**Option B: Via psql (if you have it installed)**
```bash
# Pull environment variables locally
vercel env pull .env.local

# Connect and run schema
psql $DATABASE_URL -f lib/db/schema.sql
```

## Step 5: Deploy

```bash
vercel --prod
```

## Step 6: Verify

1. Visit your deployed site
2. Try signing up (creates profile)
3. Try submitting an event (creates submission)
4. Check admin dashboard (if you create an admin user)

## Already Configured ✅

- `NEXTAUTH_SECRET` - Set for all environments
- `CRON_SECRET` - Set for all environments
- Project linked to Vercel
- Build passing

## Next Steps After Database Setup

1. Create your admin user (sign in first, then run SQL to set is_admin = true)
2. Test event submission
3. Set up SMTP for email authentication (optional for MVP)
4. Run first ingestion to populate events
