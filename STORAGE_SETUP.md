# Vercel Storage Setup Guide

Based on [Vercel Storage Documentation](https://vercel.com/docs/storage)

## Storage Options Available

### 1. **Postgres Database** (Required)
- **Option A**: Vercel Marketplace → Neon Postgres (Recommended)
- **Option B**: Vercel Marketplace → Other Postgres providers
- **Note**: Vercel Postgres is deprecated, use Marketplace options

### 2. **Vercel Blob** (For Images/Files)
- Available on all plans
- Optimized for images, videos, and large files
- Fast reads, millisecond writes

### 3. **Edge Config** (Optional)
- For feature flags and configuration
- Ultra-fast reads (<1ms)
- Not needed for MVP

---

## Step 1: Create Postgres Database (Marketplace)

### Via Vercel Dashboard:

1. Go to https://vercel.com/dashboard
2. Select your project: **forecast-2**
3. Go to **Storage** tab
4. Click **"Browse Marketplace"** or **"Add Integration"**
5. Search for **"Neon"** or **"Postgres"**
6. Click **"Add Integration"** on Neon
7. Follow the setup wizard:
   - Create a new Neon database (or connect existing)
   - Choose region (closest to your users)
   - Vercel will automatically inject `DATABASE_URL` as environment variable

**Alternative Providers:**
- **Supabase** (Postgres + additional features)
- **Upstash** (Redis + Postgres)
- **AWS RDS** (via Marketplace)

### What You Get:
- `DATABASE_URL` automatically set as environment variable
- Database ready to use immediately

---

## Step 2: Create Vercel Blob Storage

### Via Vercel Dashboard:

1. In Vercel Dashboard → Your Project → **Storage** tab
2. Click **"Create"** or **"Add Storage"**
3. Select **"Blob"**
4. Name it: `forecast-blob`
5. Click **"Create"**

### What You Get:
- `BLOB_READ_WRITE_TOKEN` automatically set as environment variable
- Store ready for images and files

---

## Step 3: Verify Environment Variables

After creating storage, verify variables are set:

```bash
# List all environment variables
vercel env ls

# Should show:
# - DATABASE_URL (from Neon/Postgres)
# - BLOB_READ_WRITE_TOKEN (from Blob storage)
# - NEXTAUTH_SECRET (already set)
# - NEXTAUTH_URL (already set)
```

---

## Step 4: Run Database Migration

Once `DATABASE_URL` is set, run the schema migration:

### Option A: Via Migration API Endpoint

1. Generate a migration secret:
   ```bash
   openssl rand -hex 32
   ```

2. Set it in Vercel:
   ```bash
   echo "your-generated-secret" | vercel env add MIGRATION_SECRET production
   ```

3. Redeploy:
   ```bash
   vercel --prod
   ```

4. Call migration endpoint:
   ```bash
   curl -X POST https://forecast-2-7mo8gkdgj-georgeefesops-projects.vercel.app/api/migrate \
     -H "x-migration-secret: your-generated-secret"
   ```

5. **DELETE** `app/api/migrate/route.ts` after success
6. Remove `MIGRATION_SECRET` from environment variables

### Option B: Via Neon Dashboard SQL Editor

1. Go to your Neon dashboard (from the integration)
2. Open SQL Editor
3. Copy contents of `lib/db/schema.sql`
4. Paste and execute

### Option C: Via psql

```bash
# Pull environment variables
vercel env pull .env.local

# Run schema
psql $DATABASE_URL -f lib/db/schema.sql
```

---

## Step 5: Verify Setup

### Check Database Health:
```bash
curl https://forecast-2-7mo8gkdgj-georgeefesops-projects.vercel.app/api/health/db
```

Should return:
```json
{
  "status": "connected",
  "connected": true,
  "schema_migrated": true,
  "tables": {
    "found": 14,
    "expected": 14
  }
}
```

---

## Quick Reference: Storage Products

| Product | Use Case | Speed | Setup |
|---------|----------|-------|-------|
| **Neon Postgres** | Database, transactions | Fast | Marketplace |
| **Vercel Blob** | Images, videos, files | Fast | Dashboard → Storage |
| **Edge Config** | Feature flags, config | Ultra-fast | Dashboard → Storage |

---

## Best Practices

1. **Locate data close to functions**: Choose database region closest to your Vercel deployment region
2. **Optimize cache**: Use cache headers for frequently accessed data
3. **Monitor usage**: Check storage usage in Vercel Dashboard

---

## Troubleshooting

### Database Connection Issues:
- Verify `DATABASE_URL` is set in Vercel Dashboard
- Check SSL mode in connection string
- Ensure database region matches deployment region

### Blob Storage Issues:
- Verify `BLOB_READ_WRITE_TOKEN` is set
- Check Blob store is created in same project

### Migration Issues:
- Check database connection first: `/api/health/db`
- Verify schema.sql syntax
- Check for existing tables (migration is idempotent)

---

## Next Steps After Storage Setup

1. ✅ Test database connection
2. ✅ Run schema migration
3. ✅ Test image upload (Blob storage)
4. ✅ Create initial admin user
5. ✅ Test event submission
6. ✅ Run first data ingestion
