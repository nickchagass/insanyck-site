# INSANYCK Email Diagnostic Guide

**Status:** Active Debugging
**Created:** 2025-12-28
**Purpose:** Diagnose and fix email delivery issues

---

## 🚨 CURRENT ISSUE

**Symptom:** Interface says "Email sent" but email does NOT arrive in Outlook
**Cause:** Unknown (investigating)
**Priority:** P0 — Blocking production use

---

## 📋 PRE-DEPLOYMENT CHECKLIST

Before deploying, verify these items in the Vercel Dashboard:

### Vercel Environment Variables

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Check that these variables exist and are enabled for **Production**:

- [ ] `RESEND_API_KEY` exists
  - Value should start with `re_`
  - Should be **44 characters** long
  - Should be marked for **Production** environment
  - Generate at: https://resend.com/api-keys

- [ ] `EMAIL_FROM` exists (optional but recommended)
  - Format: `"INSANYCK <no-reply@insanyck.com>"`
  - OR use: `"INSANYCK <onboarding@resend.dev>"` for testing
  - Domain must be verified in Resend

- [ ] `NEXTAUTH_URL` is set to production URL
  - Example: `https://insanyck.com`
  - NOT `http://localhost:3000`

### Resend Dashboard Configuration

Go to: **https://resend.com/domains**

- [ ] Domain `insanyck.com` is added
- [ ] Domain status is **Verified** (green checkmark)
- [ ] DNS records are configured in Cloudflare:
  - [ ] SPF record
  - [ ] DKIM record
  - [ ] (Optional) DMARC record

---

## 🔍 DIAGNOSTIC WORKFLOW

### Step 1: Check Logs (Most Important!)

After deploying the diagnostic version:

1. Go to: **Vercel Dashboard → Your Project → Logs** (Real-time tab)
2. Trigger a login attempt on the site
3. Look for logs with prefix `[INSANYCK EMAIL]`

**What to look for:**

#### ✅ Success Pattern (Email Working)
```
[INSANYCK EMAIL DIAGNOSTIC] {"event":"resend:init","hasApiKey":true,"apiKeyPrefix":"re_xxxxx"}
[INSANYCK EMAIL] ✅ Resend client initialized successfully
[INSANYCK EMAIL] 📤 Attempting to send via Resend API...
[INSANYCK EMAIL] ✅ EMAIL SENT SUCCESSFULLY! {"emailId":"abc123..."}
```

#### ❌ Missing API Key Pattern
```
[INSANYCK EMAIL DIAGNOSTIC] {"event":"resend:init","hasApiKey":false,"apiKeyPrefix":"MISSING"}
[INSANYCK EMAIL] ❌ RESEND_API_KEY is MISSING!
[INSANYCK EMAIL] Check: Vercel Dashboard > Settings > Environment Variables
```

**Fix:** Add `RESEND_API_KEY` to Vercel environment variables

#### ❌ Invalid API Key Format
```
[INSANYCK EMAIL] ❌ RESEND_API_KEY has INVALID FORMAT!
[INSANYCK EMAIL] Current prefix: sk_
[INSANYCK EMAIL] Expected prefix: re_
```

**Fix:** Generate new API key from Resend (old format is deprecated)

#### ❌ Domain Not Verified
```
[INSANYCK EMAIL] ❌ RESEND API RETURNED ERROR: {...}
[INSANYCK EMAIL] 🌐 DOMAIN VERIFICATION ISSUE DETECTED!
[INSANYCK EMAIL] Go to: https://resend.com/domains
```

**Fix:** Verify domain in Resend + add DNS records (see below)

---

### Step 2: Test Email Endpoint

Use the diagnostic endpoint to test email in isolation:

#### Local Development
```bash
# Open in browser:
http://localhost:3000/api/test-email

# Or with curl:
curl http://localhost:3000/api/test-email
```

#### Production (with secret)
```bash
# First, add DEBUG_SECRET to Vercel env vars (any random string)
# Then:
curl -H "x-debug-secret: YOUR_SECRET" https://insanyck.com/api/test-email

# Test with specific email:
curl "https://insanyck.com/api/test-email?email=your@email.com" \
  -H "x-debug-secret: YOUR_SECRET"
```

#### Response Analysis

**Success Response:**
```json
{
  "timestamp": "2025-12-28T...",
  "environment": {
    "hasResendKey": true,
    "resendKeyFormat": "VALID",
    "emailFrom": "INSANYCK <onboarding@resend.dev>"
  },
  "test": {
    "status": "success",
    "result": {
      "id": "abc123..."
    }
  },
  "instructions": [
    "✅ EMAIL SENT SUCCESSFULLY!",
    "Check email in: delivered@resend.dev",
    "Email ID: abc123..."
  ]
}
```

**Error Response:**
```json
{
  "test": {
    "status": "error",
    "error": {
      "name": "validation_error",
      "message": "Domain not verified"
    }
  },
  "instructions": [
    "DOMAIN VERIFICATION REQUIRED:",
    "1. Go to https://resend.com/domains",
    "..."
  ]
}
```

---

### Step 3: Verify Domain in Resend

If you see "Domain not verified" error:

#### 3.1 Add Domain to Resend

1. Go to: https://resend.com/domains
2. Click **"Add Domain"**
3. Enter: `insanyck.com`
4. Click **"Add"**

#### 3.2 Get DNS Records

Resend will show you DNS records to add. Example:

```
Type: TXT
Name: resend._domainkey
Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKB...
```

#### 3.3 Add Records to Cloudflare

1. Go to: **Cloudflare Dashboard → insanyck.com → DNS → Records**

2. Add **SPF Record**:
   - Type: `TXT`
   - Name: `@` (or `insanyck.com`)
   - Content: `v=spf1 include:resend.dev ~all`
   - TTL: Auto
   - Click **Save**

3. Add **DKIM Record** (copy from Resend):
   - Type: `TXT`
   - Name: `resend._domainkey`
   - Content: `p=MIGfMA0GCS...` (copy full value from Resend)
   - TTL: Auto
   - Click **Save**

4. (Optional) Add **DMARC Record**:
   - Type: `TXT`
   - Name: `_dmarc`
   - Content: `v=DMARC1; p=none; rua=mailto:dmarc@insanyck.com`
   - TTL: Auto
   - Click **Save**

#### 3.4 Verify in Resend

1. Go back to: https://resend.com/domains
2. Click **"Verify"** next to `insanyck.com`
3. Wait for verification (can take 1-24 hours, usually ~5 minutes)
4. Refresh page until status shows **"Verified"** ✅

---

### Step 4: Check Resend Dashboard

Go to: https://resend.com/emails

**What to check:**

- If emails appear in the list → Email is being sent ✅
- If emails do NOT appear → Problem is in the code ❌
- Check email status:
  - **Delivered** ✅ — Email was delivered successfully
  - **Bounced** ❌ — Email address doesn't exist
  - **Complained** ⚠️ — Recipient marked as spam
  - **Pending** ⏳ — Still being delivered

---

## 🛠️ COMMON FIXES

### Fix 1: Missing RESEND_API_KEY

**Error:** `RESEND_API_KEY is MISSING`

**Solution:**
1. Go to: https://resend.com/api-keys
2. Click **"Create API Key"**
3. Name: `INSANYCK Production`
4. Copy the key (starts with `re_`)
5. Go to Vercel: **Settings → Environment Variables**
6. Click **"Add New"**
   - Key: `RESEND_API_KEY`
   - Value: `re_xxxxx...` (paste the key)
   - Environment: Check **Production**
7. Click **"Save"**
8. Redeploy: `git commit --allow-empty -m "Add Resend key" && git push`

---

### Fix 2: Domain Not Verified

**Error:** `Domain not verified`

**Quick Fix (Testing Only):**
Use Resend's test domain:

1. Vercel: **Settings → Environment Variables**
2. Add or update `EMAIL_FROM`:
   - Key: `EMAIL_FROM`
   - Value: `"INSANYCK <onboarding@resend.dev>"`
   - Environment: **Production**
3. Save and redeploy

**Permanent Fix:**
Follow **Step 3** above to verify `insanyck.com`

---

### Fix 3: Email Goes to Spam

**Symptoms:**
- Email is "Delivered" in Resend
- But doesn't appear in Inbox
- Found in Spam/Junk folder

**Solution:**

1. **Test email quality:** https://mail-tester.com
   - Send test email to address shown
   - Check score (aim for 10/10)
   - Follow recommendations

2. **Add DMARC record** (improves deliverability):
   ```
   Type: TXT
   Name: _dmarc
   Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@insanyck.com
   ```

3. **Check content:**
   - Avoid spam trigger words
   - Include plain text version (already done ✅)
   - Have proper unsubscribe link (not needed for transactional emails)

4. **Warm up domain:**
   - Send small volume first (~10-50/day)
   - Gradually increase over 2 weeks
   - This builds domain reputation

---

### Fix 4: Rate Limit Exceeded

**Error:** `Rate limit exceeded`

**Free Plan Limits:**
- 100 emails per day
- 1 email per second

**Solutions:**

1. **Upgrade to paid plan:**
   - Go to: https://resend.com/settings/billing
   - Select plan based on volume

2. **Temporary fix (if testing):**
   - Wait 24 hours for limit reset
   - Use multiple test email addresses
   - Reduce test frequency

---

## 🧪 TESTING CHECKLIST

### Before Removing Diagnostic Code

Test these scenarios to confirm email is working:

- [ ] Login with PT language → Email arrives in PT ✅
- [ ] Login with EN language (`/en/conta/login`) → Email arrives in EN ✅
- [ ] Click magic link → Redirects to authenticated page ✅
- [ ] Email arrives within 30 seconds ✅
- [ ] Email NOT in spam folder ✅
- [ ] Email displays correctly in:
  - [ ] Gmail (web)
  - [ ] Apple Mail (macOS/iOS)
  - [ ] Outlook (web/desktop)
  - [ ] Mobile (iOS/Android)

---

## 🧹 CLEANUP AFTER FIX

Once email is confirmed working:

### 1. Remove Diagnostic Endpoint

```bash
# Delete test endpoint
rm src/pages/api/test-email.ts

# Or on Windows:
del src\pages\api\test-email.ts
```

### 2. Remove Verbose Logging

Revert `src/lib/email.ts` to production version (remove diagnostic logs).

You can use git to compare:
```bash
git diff src/lib/email.ts
```

### 3. Remove This Guide

```bash
rm EMAIL-DIAGNOSTIC-GUIDE.md
```

### 4. Commit Clean Version

```bash
git add .
git commit -m "fix: email delivery working, remove diagnostic code"
git push origin main
```

---

## 📞 ESCALATION

If issue persists after all fixes:

### Contact Resend Support

- Dashboard: https://resend.com/support
- Email: support@resend.com
- Discord: https://discord.gg/resend

**Information to provide:**
- Email ID from Resend dashboard
- Error message from logs
- Domain verification status
- Screenshots of DNS records

### Check Resend Status

- Status page: https://status.resend.com
- May be a service outage (rare)

---

## 📊 MONITORING (Post-Fix)

Set up monitoring to catch future issues:

### 1. Resend Webhooks

Configure webhook to track delivery:

1. Go to: https://resend.com/webhooks
2. Add endpoint: `https://insanyck.com/api/webhooks/resend`
3. Events: `email.delivered`, `email.bounced`
4. Store webhook events in database for analytics

### 2. Error Tracking

Restore error logging but keep it structured:

```typescript
if (!success) {
  // Log to error tracking service (e.g., Sentry)
  console.error('[INSANYCK EMAIL] Failed to send', {
    event: 'email:failed',
    locale,
    timestamp: new Date().toISOString(),
  });
}
```

### 3. Success Rate Dashboard

Track email success rate:
- Total emails attempted
- Total emails delivered
- Delivery rate % (target: >99%)
- Average delivery time

---

**Last Updated:** 2025-12-28
**Next Review:** After email is confirmed working
