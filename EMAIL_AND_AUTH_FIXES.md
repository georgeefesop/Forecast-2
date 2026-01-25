# Email & Authentication Fixes Plan

## Issue 1: Unprofessional Email Appearance

### Problems Identified:
1. ❌ Email subject/body shows "Sign in to localhost:3000" (exposes dev environment)
2. ❌ Sender is `onboarding@resend.dev` (generic Resend domain, not branded)
3. ❌ No custom styling/branding (plain white background, default button)
4. ❌ No footer (copyright, unsubscribe, privacy policy links)
5. ❌ `NEXTAUTH_URL` is set to `http://localhost:3000` in production

### Solution Steps:

#### Step 1: Fix NEXTAUTH_URL for Production
**Priority: HIGH** (affects email links and redirects)

1. **Get your Vercel production URL:**
   ```bash
   vercel ls
   ```
   Or check: https://vercel.com/georgeefesops-projects/forecast-2

2. **Update `.env.local` for local development:**
   ```env
   NEXTAUTH_URL=http://localhost:3000
   ```

3. **Set `NEXTAUTH_URL` in Vercel for each environment:**
   ```bash
   # Production (your actual Vercel domain)
   echo "https://forecast-2-g9d58anjr-georgeefesops-projects.vercel.app" | vercel env add NEXTAUTH_URL production --force
   
   # Preview (use production URL as fallback)
   echo "https://forecast-2-g9d58anjr-georgeefesops-projects.vercel.app" | vercel env add NEXTAUTH_URL preview --force
   
   # Development (keep localhost)
   echo "http://localhost:3000" | vercel env add NEXTAUTH_URL development
   ```
   
   **Note:** If you have a custom domain (e.g., `forecast.app`), use that instead. Check Vercel Dashboard → Settings → Domains.

#### Step 2: Customize Email Template
**Priority: HIGH** (branding and professionalism)

NextAuth v5 allows custom email templates. Create a custom email template:

1. **Create email template file:**
   - File: `lib/emails/signin-email.tsx` (or `.ts` for plain HTML)
   - Customize with:
     - App logo/branding
     - Custom colors matching your app theme
     - Professional footer with links
     - Better button styling

2. **Update `lib/auth.ts` to use custom template:**
   ```typescript
   EmailProvider({
     server: { /* ... */ },
     from: process.env.EMAIL_FROM || "noreply@forecast.app",
     // Add custom email template
     sendVerificationRequest: async ({ identifier, url, provider }) => {
       // Custom email sending logic with styled template
     },
   }),
   ```

3. **Email template should include:**
   - ✅ App name/logo ("Forecast" or your brand)
   - ✅ Professional subject line: "Sign in to Forecast" (not localhost)
   - ✅ Styled HTML email with your brand colors
   - ✅ Footer with:
     - Copyright notice
     - Privacy policy link
     - Unsubscribe/preferences link
     - Support contact

#### Step 3: Set Up Custom Domain for Email (Optional but Recommended)
**Priority: MEDIUM** (for production)

1. **In Resend Dashboard:**
   - Go to https://resend.com/domains
   - Add your domain (e.g., `forecast.app` or your custom domain)
   - Add DNS records (SPF, DKIM, DMARC) to verify domain
   - Wait for verification (usually 5-10 minutes)

2. **Update `EMAIL_FROM` after verification:**
   ```bash
   # Change from onboarding@resend.dev to:
   echo "noreply@yourdomain.com" | vercel env add EMAIL_FROM production
   ```

3. **Update `.env.local`:**
   ```env
   EMAIL_FROM=noreply@yourdomain.com
   ```

---

## Issue 2: MissingSecret Error in Middleware

### Problem:
```
Runtime MissingSecret
Must pass `secret` if not set to JWT getToken()
```

### Root Cause:
In NextAuth v5, `getToken()` in middleware requires the `secret` parameter to be explicitly passed when using JWT strategy.

### Solution:

**File: `middleware.ts`**

**Current code (line 6):**
```typescript
const token = await getToken({ req: request });
```

**Fixed code:**
```typescript
const token = await getToken({ 
  req: request,
  secret: process.env.NEXTAUTH_SECRET 
});
```

**Complete fix:**
```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Protect routes that require auth
  const protectedPaths = ["/submit", "/account", "/organizer", "/admin", "/boost"];
  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !token) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/submit/:path*", "/account/:path*", "/organizer/:path*", "/admin/:path*", "/boost/:path*"],
};
```

**Verification:**
- Ensure `NEXTAUTH_SECRET` is set in `.env.local`
- Ensure `NEXTAUTH_SECRET` is set in Vercel (all environments)
- Test sign-in flow after fix

---

## Implementation Priority

### Immediate (Fix Now):
1. ✅ Fix `MissingSecret` error in `middleware.ts` (5 minutes)
2. ✅ Set `NEXTAUTH_URL` in Vercel production environment (2 minutes)

### High Priority (This Week):
3. ✅ Create custom email template with branding (1-2 hours)
4. ✅ Update `EmailProvider` to use custom template (30 minutes)
5. ✅ Test email appearance in production (15 minutes)

### Medium Priority (Before Launch):
6. ⚠️ Set up custom domain in Resend (30 minutes + DNS propagation)
7. ⚠️ Update `EMAIL_FROM` to use custom domain (5 minutes)
8. ⚠️ Add email footer with legal links (1 hour)

---

## Quick Fix Commands

### Fix MissingSecret (Do This First):
```bash
# Edit middleware.ts and add secret parameter to getToken()
```

### Fix NEXTAUTH_URL:
```bash
# Already set to: https://forecast-2-g9d58anjr-georgeefesops-projects.vercel.app
# If you have a custom domain, update it:
echo "https://your-custom-domain.com" | vercel env add NEXTAUTH_URL production --force
echo "https://your-custom-domain.com" | vercel env add NEXTAUTH_URL preview --force
```

### Verify Environment Variables:
```bash
vercel env ls | Select-String "NEXTAUTH"
```

---

## Testing Checklist

After fixes:
- [ ] Sign in flow works without `MissingSecret` error
- [ ] Email received shows production domain (not localhost)
- [ ] Email has custom styling/branding
- [ ] Email footer includes required links
- [ ] Magic link redirects correctly after sign-in
- [ ] Protected routes work after authentication

---

## Files to Modify

1. **`middleware.ts`** - Add `secret` parameter to `getToken()`
2. **`lib/auth.ts`** - Add custom email template to `EmailProvider`
3. **`lib/emails/signin-email.tsx`** - NEW: Custom email template component
4. **Vercel Environment Variables** - Set `NEXTAUTH_URL` for production
5. **`.env.local`** - Update `NEXTAUTH_URL` if needed

---

## Notes for Next Developer

- The `MissingSecret` error is a breaking change in NextAuth v5 - always pass `secret` in middleware
- Email templates in NextAuth v5 can be customized via `sendVerificationRequest` callback
- Resend allows custom domains for free (just need to verify DNS)
- Test emails in production, not localhost (email links need correct domain)
