# Deployment Guide

## Quick Start: GitHub + Vercel

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `Forecast-2` (or your preferred name)
3. **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click "Create repository"

### Step 2: Push to GitHub

```bash
# Add your GitHub repository as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/Forecast-2.git

# Or if using SSH:
# git remote add origin git@github.com:YOUR_USERNAME/Forecast-2.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Connect to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repository (`Forecast-2`)
4. Vercel will auto-detect Next.js settings
5. Click "Deploy"

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: forecast-2
# - Directory: ./
# - Override settings? No
```

### Step 4: Set Environment Variables in Vercel

After deployment, set these in Vercel Dashboard → Settings → Environment Variables:

**Required:**
- `NEXTAUTH_SECRET` - (already generated in .env.local)
- `NEXTAUTH_URL` - Your Vercel deployment URL (e.g., `https://forecast-2.vercel.app`)

**After creating database:**
- `DATABASE_URL` - From Vercel Postgres
- `BLOB_READ_WRITE_TOKEN` - From Vercel Blob (if using)

**Optional (for email auth):**
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `EMAIL_FROM`

### Step 5: Create Vercel Postgres Database

1. In Vercel Dashboard → Your Project → Storage
2. Click "Create Database" → Select "Postgres"
3. Name: `forecast-db`
4. Copy the `DATABASE_URL` connection string
5. Add it to Environment Variables (all environments)

### Step 6: Run Database Migration

**Option A: Via Migration API Endpoint**

1. Set `MIGRATION_SECRET` in Vercel environment variables (generate a random string)
2. Redeploy your app
3. Call the migration endpoint:
   ```bash
   curl -X POST https://your-app.vercel.app/api/migrate \
     -H "x-migration-secret: your-migration-secret"
   ```
4. **DELETE** `app/api/migrate/route.ts` after successful migration
5. Remove `MIGRATION_SECRET` from environment variables

**Option B: Via Vercel Dashboard SQL Editor**

1. Go to Vercel Dashboard → Your Database → Data tab
2. Click "SQL Editor"
3. Copy contents of `lib/db/schema.sql`
4. Paste and execute

### Step 7: Verify Deployment

1. Check health endpoint: `https://your-app.vercel.app/api/health/db`
2. Should show: `{"status": "connected", "schema_migrated": true}`

## Post-Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created and connected
- [ ] Environment variables set in Vercel
- [ ] Vercel Postgres database created
- [ ] `DATABASE_URL` added to environment variables
- [ ] Database schema migrated
- [ ] Health check endpoint returns success
- [ ] Migration endpoint deleted (if used)
- [ ] `MIGRATION_SECRET` removed (if used)

## Troubleshooting

### Build Fails on Vercel

- Check build logs in Vercel Dashboard
- Ensure all dependencies are in `package.json`
- Verify environment variables are set

### Database Connection Fails

- Verify `DATABASE_URL` is correct
- Check SSL mode in connection string (`?sslmode=require`)
- Ensure database is in same region as deployment

### Environment Variables Not Working

- Redeploy after adding new environment variables
- Check variable names match exactly (case-sensitive)
- Verify variables are set for correct environment (Production/Preview/Development)

## Next Steps

After successful deployment:
1. Test all features
2. Set up custom domain (optional)
3. Configure monitoring and analytics
4. Set up automated backups
