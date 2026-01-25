# DNS Setup Guide for forecast.app

## Overview
You need to add DNS records to verify `forecast.app` with Resend. This allows you to send emails from `noreply@forecast.app` instead of `onboarding@resend.dev`.

## DNS Records to Add

Add these records at your domain registrar (where you bought `forecast.app`):

### 1. DKIM Record (Domain Verification)
**Type:** `TXT`  
**Name/Host:** `resend._domainkey`  
**Value:** `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCWEF/5+wmtyOZ7OWMPESWkehfZP7fw/yYCvgOleWeWE3epvqvARZBezH0Mk9SlXuK77mB53g556li2RIpW434o77OkWyA2A4CUqxPOpa860kvEUj1fBoGmg6WxV+6gw/tbMBN3yo+LwW6qTgirmE1AlVugijwJokIbQBS/DuhbgQIDAQAB`  
**TTL:** `3600` (or Auto)

### 2. MX Record (Enable Sending)
**Type:** `MX`  
**Name/Host:** `send`  
**Value/Priority:** `10 feedback-smtp.eu-west-1.amazonses.com`  
**TTL:** `3600` (or Auto)

### 3. SPF Record (Enable Sending)
**Type:** `TXT`  
**Name/Host:** `send`  
**Value:** `v=spf1 include:amazonses.com ~all`  
**TTL:** `3600` (or Auto)

---

## Step-by-Step Instructions

### Step 1: Find Your Domain Registrar
Common registrars:
- **Namecheap** → https://www.namecheap.com
- **GoDaddy** → https://www.godaddy.com
- **Google Domains** → https://domains.google.com
- **Cloudflare** → https://www.cloudflare.com/products/registrar/
- **Route 53** (AWS) → https://aws.amazon.com/route53/

### Step 2: Access DNS Management
1. Log in to your domain registrar
2. Find "DNS Management", "DNS Settings", or "Manage DNS"
3. Look for a section to add/edit DNS records

### Step 3: Add the Records

**For most registrars, you'll add:**

1. **DKIM TXT Record:**
   - Click "Add Record" or "+"
   - Type: `TXT`
   - Name: `resend._domainkey` (or `resend._domainkey.forecast.app` if required)
   - Value: `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCWEF/5+wmtyOZ7OWMPESWkehfZP7fw/yYCvgOleWeWE3epvqvARZBezH0Mk9SlXuK77mB53g556li2RIpW434o77OkWyA2A4CUqxPOpa860kvEUj1fBoGmg6WxV+6gw/tbMBN3yo+LwW6qTgirmE1AlVugijwJokIbQBS/DuhbgQIDAQAB`
   - TTL: `3600` or Auto
   - Save

2. **MX Record:**
   - Click "Add Record" or "+"
   - Type: `MX`
   - Name: `send` (or `send.forecast.app` if required)
   - Priority: `10`
   - Value: `feedback-smtp.eu-west-1.amazonses.com`
   - TTL: `3600` or Auto
   - Save

3. **SPF TXT Record:**
   - Click "Add Record" or "+"
   - Type: `TXT`
   - Name: `send` (or `send.forecast.app` if required)
   - Value: `v=spf1 include:amazonses.com ~all`
   - TTL: `3600` or Auto
   - Save

### Step 4: Wait for DNS Propagation
- DNS changes can take **5 minutes to 48 hours** to propagate
- Usually takes **10-30 minutes** for most registrars
- You can check propagation at: https://www.whatsmydns.net

### Step 5: Verify in Resend
1. Go to https://resend.com/domains
2. Find `forecast.app` in your domains list
3. Click "I've added the records" button
4. Resend will verify the DNS records
5. Status should change to "Verified" ✅

---

## Common Issues

### Issue: "Name already exists"
- You might already have a `send` record
- Delete the old one or update it with the new values

### Issue: "Invalid format"
- Make sure you're copying the entire value (it's long!)
- No extra spaces before/after
- For MX records, some registrars split Priority and Value into separate fields

### Issue: "Not verified after 24 hours"
- Double-check you copied the values correctly
- Ensure the record name matches exactly (some registrars auto-append the domain)
- Try using a DNS checker: https://mxtoolbox.com/SuperTool.aspx

---

## After Verification

Once verified in Resend:

1. **Update `.env.local`:**
   ```env
   EMAIL_FROM=noreply@forecast.app
   ```

2. **Update Vercel environment variables:**
   ```bash
   echo "noreply@forecast.app" | vercel env add EMAIL_FROM production --force
   echo "noreply@forecast.app" | vercel env add EMAIL_FROM preview --force
   echo "noreply@forecast.app" | vercel env add EMAIL_FROM development --force
   ```

3. **Redeploy:**
   ```bash
   vercel --prod --yes
   ```

4. **Test:** Send a test sign-in email and verify it comes from `noreply@forecast.app`

---

## Quick Reference

**Records Summary:**
- `resend._domainkey` (TXT) → DKIM verification
- `send` (MX) → Email sending
- `send` (TXT) → SPF for email sending

**Verification Time:** 10-30 minutes (usually)

**Next Steps:** Once verified, update `EMAIL_FROM` to `noreply@forecast.app`
