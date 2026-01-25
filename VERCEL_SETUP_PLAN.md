# Vercel Database Setup Plan

Complete step-by-step plan to set up a working database in Vercel for Forecast.

## Overview

This plan covers:
1. Database creation (Vercel Postgres or Neon)
2. Environment variables configuration
3. Database schema migration
4. Vercel Blob storage setup
5. Testing and verification

---

## Step 1: Choose Database Provider

### Option A: Vercel Postgres (Deprecated but Still Works)
- **Pros**: Integrated with Vercel, easy setup
- **Cons**: Deprecated, will need migration later
- **Status**: Still functional, but consider Option B for long-term

### Option B: Neon Postgres (Recommended)
- **Pros**: Modern, actively maintained, better performance
- **Cons**: Separate service (but integrates well with Vercel)
- **Status**: Recommended for new projects

**Decision**: We'll proceed with **Vercel Postgres** for now (can migrate to Neon later)

---

## Step 2: Create Vercel Postgres Database

### Via Vercel Dashboard:
1. Go to Vercel Dashboard → Your Project → Storage
2. Click "Create Database"
3. Select "Postgres"
4. Choose a name (e.g., `forecast-db`)
5. Select region (choose closest to your users)
6. Click "Create"

### Via Vercel CLI (Alternative):
```bash
vercel storage create postgres --name forecast-db
```

**Output**: You'll get a `DATABASE_URL` connection string

---

## Step 3: Set Up Environment Variables

### Required Variables:

#### Already Set (✅):
- `NEXTAUTH_SECRET` - ✅ Set
- `CRON_SECRET` - ✅ Set

#### Need to Set:

1. **DATABASE_URL**
   - **Source**: From Step 2 (Vercel Postgres connection string)
   - **Format**: `postgres://user:password@host:port/database?sslmode=require`
   - **Set for**: Production, Preview, Development

2. **BLOB_READ_WRITE_TOKEN**
   - **Source**: Vercel Blob storage (Step 4)
   - **Set for**: Production, Preview, Development

3. **NEXTAUTH_URL**
   - **Format**: `https://your-domain.vercel.app` (after first deployment)
   - **Set for**: Production, Preview
   - **Local**: `http://localhost:3000` (for development)

4. **SMTP_* Variables** (Optional for MVP, but needed for auth):
   - `SMTP_HOST` - Your SMTP server
   - `SMTP_PORT` - Usually 587 or 465
   - `SMTP_USER` - Your email/username
   - `SMTP_PASSWORD` - Your email password or app password
   - `EMAIL_FROM` - Sender email address

5. **MIGRATION_SECRET** (Temporary, for migration endpoint):
   - Generate a strong random string (e.g., `openssl rand -hex 32`)
   - Only needed if using the migration API endpoint (Option C)
   - **DELETE after migration is complete**

### Setting Variables via CLI:

```bash
# Database URL (from Vercel Postgres)
echo "postgres://..." | vercel env add DATABASE_URL production
echo "postgres://..." | vercel env add DATABASE_URL preview
echo "postgres://..." | vercel env add DATABASE_URL development

# Blob Token (from Step 4)
echo "vercel_blob_xxx..." | vercel env add BLOB_READ_WRITE_TOKEN production
echo "vercel_blob_xxx..." | vercel env add BLOB_READ_WRITE_TOKEN preview
echo "vercel_blob_xxx..." | vercel env add BLOB_READ_WRITE_TOKEN development

# NEXTAUTH_URL (set after first deployment)
echo "https://forecast-2.vercel.app" | vercel env add NEXTAUTH_URL production
echo "https://forecast-2-*.vercel.app" | vercel env add NEXTAUTH_URL preview
```

---

## Step 4: Create Vercel Blob Storage

### Via Vercel Dashboard:
1. Go to Vercel Dashboard → Your Project → Storage
2. Click "Create Database"
3. Select "Blob"
4. Choose a name (e.g., `forecast-blob`)
5. Click "Create"

### Via Vercel CLI:
```bash
vercel storage create blob --name forecast-blob
```

**Output**: You'll get a `BLOB_READ_WRITE_TOKEN`

---

## Step 5: Run Database Schema Migration

### Option A: Via Vercel Dashboard SQL Editor
1. Go to Vercel Dashboard → Your Database → "Data" tab
2. Click "SQL Editor"
3. Copy contents of `lib/db/schema.sql`
4. Paste and execute

### Option B: Via psql (Local)
```bash
# Connect to database
psql $DATABASE_URL

# Run schema
\i lib/db/schema.sql
```

### Option C: Via API Route (Temporary Migration Endpoint) ✅ Created
A migration endpoint has been created at `app/api/migrate/route.ts`.

**Before using:**
1. Set `MIGRATION_SECRET` environment variable in Vercel (use a strong random string)
2. Deploy your app to Vercel

**Usage:**
```bash
# After deployment, call the endpoint with your secret
curl -X POST https://your-app.vercel.app/api/migrate \
  -H "x-migration-secret: your-migration-secret-here"
```

**After migration:**
- ✅ DELETE `app/api/migrate/route.ts` for security
- ✅ Remove `MIGRATION_SECRET` from environment variables

---

## Step 6: Verify Database Connection

### Option A: Health Check Endpoint (✅ Created)
A health check endpoint has been created at `app/api/health/db`.

**Usage:**
```bash
# Check database status
curl http://localhost:3000/api/health/db

# Or visit in browser:
# http://localhost:3000/api/health/db
```

**Response will show:**
- Connection status
- Number of tables found
- Missing tables (if schema not migrated)
- Schema migration status

### Option B: Test Query (SQL):
```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Should return:
-- profiles, venues, events, event_actions, event_counters, 
-- vibe_checks, comments, reports, submissions, campaigns, 
-- placements, orders, newsletter_subscribers, verification_tokens
```

### Option C: Test via API:
- Try signing up (creates profile)
- Try submitting an event (creates submission)

---

## Step 7: Create Initial Admin User (Optional)

After schema is set up, create your admin account:

```sql
-- Insert admin profile (replace with your actual user_id from NextAuth)
INSERT INTO profiles (user_id, handle, is_admin, is_organizer)
VALUES ('your-nextauth-user-id', 'admin', true, true)
ON CONFLICT (user_id) DO UPDATE SET is_admin = true, is_organizer = true;
```

**Note**: You'll need to sign in first to get your user_id, then run this query.

---

## Step 8: Deploy and Test

1. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

2. **Verify Environment Variables**:
   - Check Vercel Dashboard → Settings → Environment Variables
   - Ensure all variables are set for Production

3. **Test Database Operations**:
   - Sign up (creates profile)
   - Submit event (creates submission)
   - Check admin dashboard (if admin user created)

---

## Checklist

### Pre-Deployment (✅ Completed):
- [x] Build errors fixed
- [x] Migration endpoint created (`app/api/migrate/route.ts`)
- [x] Environment variable template ready (`.env.example`)
- [x] Database schema ready (`lib/db/schema.sql`)
- [x] Vercel cron configuration ready (`vercel.json`)
- [x] NextAuth adapter created (`lib/auth-adapter.ts`)
- [x] Database health check endpoint created (`app/api/health/db`)
- [x] Schema updated with `verification_tokens` table

### Database Setup:
- [ ] Vercel Postgres database created (⚠️ **REQUIRED - Manual Step**)
- [ ] `DATABASE_URL` environment variable set with real connection string (⚠️ **REQUIRED - Manual Step**)
- [ ] Database schema migrated (`lib/db/schema.sql`)
- [ ] Tables verified (14 tables should exist, including `verification_tokens`)
- [ ] Indexes created (check with `\d+ table_name` in psql)

### Storage Setup:
- [ ] Vercel Blob storage created
- [ ] `BLOB_READ_WRITE_TOKEN` environment variable set (all environments)
- [ ] Image upload tested

### Authentication Setup:
- [ ] `NEXTAUTH_SECRET` set (✅ Done)
- [ ] `NEXTAUTH_URL` set (after deployment)
- [ ] SMTP configured (optional for MVP)
- [ ] Email provider tested

### Deployment:
- [ ] First deployment successful
- [ ] Environment variables verified in production
- [ ] Database connection working
- [ ] Basic CRUD operations tested

---

## Troubleshooting

### Database Connection Issues:
- Verify `DATABASE_URL` format is correct
- Check SSL mode (`?sslmode=require` should be in URL)
- Verify database is in same region as deployment

### Schema Migration Issues:
- Check for syntax errors in `schema.sql`
- Verify UUID extension is enabled
- Check for conflicting table names

### Environment Variable Issues:
- Ensure variables are set for correct environment (Production/Preview/Development)
- Redeploy after adding new environment variables
- Check variable names match exactly (case-sensitive)

---

## Next Steps After Setup

1. **Seed Initial Data** (Optional):
   - Add sample venues
   - Add sample events
   - Test ingestion pipeline

2. **Set Up Monitoring**:
   - Database query performance
   - Error tracking
   - Usage metrics

3. **Backup Strategy**:
   - Set up automated backups
   - Document restore procedure

---

## Migration to Neon (Future)

When ready to migrate from Vercel Postgres to Neon:

1. Create Neon database
2. Export data from Vercel Postgres
3. Import to Neon
4. Update `DATABASE_URL`
5. Update code to use Neon client (if needed)
6. Test thoroughly
7. Switch over

---

## Quick Reference Commands

```bash
# List environment variables
vercel env ls

# Add environment variable
echo "value" | vercel env add VARIABLE_NAME production

# Pull environment variables locally
vercel env pull .env.local

# Deploy
vercel --prod

# Check database connection (local)
psql $DATABASE_URL

# Run schema (local)
psql $DATABASE_URL -f lib/db/schema.sql

# Run migration via API (after deployment)
curl -X POST https://your-app.vercel.app/api/migrate \
  -H "x-migration-secret: your-secret-here"
```

---

## ✅ What's Been Prepared

The following has been automated/prepared for you:

1. **Build Errors Fixed**: All syntax errors resolved, build completes successfully
2. **Migration Endpoint**: Created at `app/api/migrate/route.ts` for easy schema migration
3. **Environment Template**: `.env.example` contains all required variables
4. **Database Schema**: `lib/db/schema.sql` is ready with all 13 tables and indexes
5. **Vercel Configuration**: `vercel.json` configured for cron jobs

## 🚀 Next Steps (Manual Actions Required)

You need to complete these steps manually in the Vercel Dashboard:

1. **Create Vercel Postgres Database** (Step 2)
2. **Create Vercel Blob Storage** (Step 4)
3. **Set Environment Variables** (Step 3)
4. **Deploy to Vercel** (Step 8)
5. **Run Migration** (Step 5 - use the API endpoint or SQL editor)
6. **Verify Setup** (Step 6)
7. **Delete Migration Endpoint** (after successful migration)
