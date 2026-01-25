# Quick Start Guide

## 🎯 Testing: Localhost vs Vercel

### ✅ Use **Localhost** for Development
- **Faster**: No deployment wait time
- **Easier debugging**: Console logs, breakpoints work perfectly
- **Free**: No build minutes consumed
- **Hot reload**: Instant changes

**Command:** `npm run dev` → Visit `http://localhost:3000`

### 📦 Use **Vercel** for Production Testing
- Test production environment
- Share with others
- Final testing before launch
- Check production URLs

**URL:** https://forecast-2-70tp7d17v-georgeefesops-projects.vercel.app

---

## 📧 SMTP Setup (Optional but Recommended)

### What is SMTP?
**Email Authentication** - Users sign in via magic links sent to their email (no passwords!)

### Why Set It Up?
- ✅ Users can sign up and log in
- ✅ Protected routes become accessible
- ✅ Full app functionality enabled

### Easiest Free Solution: **Resend.com**
- **Free tier**: 3,000 emails/month
- **Setup time**: 5 minutes
- **Perfect for**: Next.js apps

**See `SMTP_SETUP.md` for detailed instructions**

### Can You Skip It?
Yes! Your app works without SMTP, but:
- ❌ Users cannot sign in
- ❌ Protected routes won't work
- ✅ You can still browse events, venues, etc.

---

## 🔍 Finding Vercel Environment Variables

### Option 1: Dashboard (Easiest)
1. Go to: https://vercel.com/georgeefesops-projects/forecast-2
2. Click **Settings** tab (top navigation)
3. Click **Environment Variables** (left sidebar)
4. View/edit all variables there

### Option 2: CLI
```bash
vercel env ls
```

### Current Variables Set:
- ✅ `DATABASE_URL` - Neon database connection
- ✅ `NEXTAUTH_SECRET` - Auth secret
- ✅ `NEXTAUTH_URL` - Production URL
- ⚠️ `SMTP_*` - Not set yet (optional)

---

## ✅ What's Already Done

- ✅ Database connected (Neon Postgres)
- ✅ Schema migrated (14 tables created)
- ✅ App deployed to Vercel
- ✅ GitHub repository set up
- ✅ Favicon created
- ✅ Build errors fixed

---

## 🚀 Next Steps

1. **Test locally**: `npm run dev`
2. **Set up SMTP** (optional): See `SMTP_SETUP.md`
3. **Test features**: Browse events, try submitting
4. **Create admin user** (if needed): Via database query

---

## 📚 Documentation Files

- `SMTP_SETUP.md` - Email authentication setup
- `VERCEL_SETUP_PLAN.md` - Complete deployment guide
- `DEPLOYMENT.md` - GitHub + Vercel setup
- `README.md` - Project overview
