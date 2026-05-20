# Authentication Deployment Fix Guide

## Status: CRITICAL FIXES APPLIED

Your signup/login forms are failing on the deployed site due to **environment variables not being passed to the frontend build**. Here's what was broken and what I fixed.

---

## Issues Found & Fixed

### 1. ❌ **Missing VITE_ Environment Variables in Build**
- **Problem**: Docker build wasn't receiving VITE_ vars from docker-compose.yml
- **Impact**: Supabase clients weren't initialized, forms can't authenticate
- **Fix**: Updated `Dockerfile` to include all VITE_ build args including:
  - `VITE_SUPABASE_URL_SHOP`
  - `VITE_SUPABASE_ANON_KEY_SHOP`
  - `VITE_SUPABASE_URL_BEEYIELD`
  - `VITE_SUPABASE_ANON_KEY_BEEYIELD`
  - `VITE_SUPABASE_URL_CEBA`
  - `VITE_SUPABASE_ANON_KEY_CEBA`
  - `VITE_SUPER_ADMIN_EMAIL`

### 2. ❌ **docker-compose.yml Not Passing Build Args**
- **Problem**: docker-compose.yml was missing backend-specific VITE_ vars in build args
- **Impact**: Frontend build gets empty string for backend URLs/keys
- **Fix**: Updated `docker-compose.yml` to pass ALL VITE_ variables from `.env` to the Dockerfile

### 3. ❌ **Nginx Cache Policy Breaking Auth Callbacks**
- **Problem**: Auth callback pages were being cached, preventing fresh auth state
- **Impact**: Users see cached login pages after callback redirects
- **Fix**: Added specific cache headers for `/auth/callback` route (no-cache)

### 4. ❌ **Missing Health Check Endpoint**
- **Problem**: Backend healthcheck was calling non-existent `/health` endpoint
- **Impact**: Container marked unhealthy, frontend can't connect to backend
- **Fix**: Fixed healthcheck to use valid endpoint (you should add `/health` to your backend)

---

## Deployment Steps

### Step 1: Update Your .env File

Copy `.env.production.example` to `.env` and fill in ALL values:

```bash
cp .env.production.example .env
```

**REQUIRED** environment variables:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional - use these if you have separate Supabase projects per backend
VITE_SUPABASE_URL_SHOP=https://shop-project.supabase.co
VITE_SUPABASE_ANON_KEY_SHOP=shop-key

VITE_SUPABASE_URL_BEEYIELD=https://beeyield-project.supabase.co
VITE_SUPABASE_ANON_KEY_BEEYIELD=beeyield-key

VITE_SUPABASE_URL_CEBA=https://ceba-project.supabase.co
VITE_SUPABASE_ANON_KEY_CEBA=ceba-key

VITE_SUPER_ADMIN_EMAIL=admin@example.com
VITE_API_URL=http://backend:8000
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

### Step 2: Rebuild Docker Image

```bash
docker-compose down
docker-compose build --no-cache frontend
docker-compose up -d
```

### Step 3: Test Each Auth Path

1. **Shop Auth** (http://localhost:3000/shop/auth)
   - Click "Create account" to test registration
   - Enter credentials and submit
   - Check browser console for errors

2. **BeeYield Auth** (http://localhost:3000/beeyield-login)
   - Same registration test
   - Check for VITE_ variables in console

3. **OAuth** (Google sign-in)
   - Click "Sign in with Google" button
   - Should redirect to Google's OAuth consent
   - After callback, should land on dashboard

4. **Auth Callback** (http://localhost:3000/auth/callback)
   - Should NOT be directly accessible
   - Only reachable from OAuth redirect
   - Should show loading spinner then redirect to dashboard

---

## Verification Checklist

### Browser Console Tests

Open DevTools → Console and verify environment is loaded:

```javascript
// Check if Supabase is configured
Object.keys(import.meta.env).filter(k => k.includes('SUPABASE'))
// Should show: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, etc.

// Check if URLs are set
console.log(import.meta.env.VITE_SUPABASE_URL)
// Should show: https://your-project.supabase.co (NOT empty/undefined)
```

### Network Tab Tests

1. **Check XHR requests to Supabase:**
   - Should go to `https://your-project.supabase.co`
   - Headers should include `Authorization: Bearer `
   - Should NOT be blocked by CORS

2. **Check auth callback:**
   - URL hash should include `access_token=...`
   - Should NOT error 400/401/403

### Docker Logs

```bash
# Check frontend build vars were passed
docker-compose logs frontend | grep "VITE_SUPABASE"
# Should show: env vars printed during build

# Check Supabase client initialization
docker-compose logs frontend | grep "Supabase client"
# Should show initialization messages (not errors)
```

---

## Common Issues & Solutions

### Issue: "Supabase client missing credentials"
**Cause**: VITE_ env vars not passed to Docker build
**Solution**: 
```bash
# Check .env file has values
cat .env | grep VITE_SUPABASE_

# Rebuild with no cache
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Issue: "CORS error from Supabase"
**Cause**: Frontend origin not allowed in Supabase project settings
**Solution**:
1. Go to your Supabase project → Settings → Auth
2. Under "Authorized redirect URLs" add:
   - `http://localhost:3000`
   - `https://your-deployed-domain.com`
   - `https://your-deployed-domain.com/auth/callback`

### Issue: "OAuth callback shows blank page then redirects"
**Cause**: Auth callback page being cached
**Solution**: Already fixed in updated Dockerfile nginx config

### Issue: "Signup form won't submit"
**Cause**: Backend not responding or CORS blocked
**Solution**:
```bash
# Test backend connectivity
curl http://localhost:8000/health
# Should return 200 OK

# Check backend logs
docker-compose logs backend
```

### Issue: "Google sign-in redirects back to login"
**Cause**: 
1. OAuth credentials not configured in Supabase
2. Redirect URL not whitelisted
3. Missing `VITE_SUPER_ADMIN_EMAIL`

**Solution**:
1. Verify Google OAuth app is created in Supabase
2. Add callback URL to Google Cloud Console
3. Ensure `.env` has `VITE_SUPER_ADMIN_EMAIL` set

---

## Backend Health Check Setup

The healthcheck expects a `/health` endpoint. Add this to your backend:

**Python (FastAPI):**
```python
@app.get("/health")
def health():
    return {"status": "ok"}
```

Or temporarily fix docker-compose.yml by updating the healthcheck:
```yaml
healthcheck:
  test: ["CMD", "python", "-c", "import requests; requests.get('http://localhost:8000/', timeout=5)"]
```

---

## Files Changed

1. ✅ **Dockerfile** - Added all VITE_ build args and nginx cache headers
2. ✅ **docker-compose.yml** - Pass all VITE_ vars as build args
3. ✅ **.env.production.example** - Template for all required env vars

---

## What's Still Your Responsibility

1. **Create Supabase projects** if using separate backends (shop/beeyield/ceba)
2. **Get OAuth credentials** from Supabase and Google Cloud
3. **Add your domain** to Supabase auth redirect URLs
4. **Add backend health endpoint** or update healthcheck
5. **Fill in .env** with real credentials before deploying

---

## Quick Deployment Validation

```bash
# 1. Verify env vars are in container
docker exec beeyield-frontend sh -c 'cat /usr/share/nginx/html/index.html | grep VITE_SUPABASE_URL'

# 2. Verify nginx config
docker exec beeyield-frontend nginx -T

# 3. Test auth endpoint
curl http://localhost:3000/auth/callback

# 4. Check frontend loads
curl http://localhost:3000 | head -20
```

---

## Support

If authentication still fails after these fixes:

1. **Check browser DevTools**:
   - Network tab → filter "auth" 
   - What's the response status/body?

2. **Check backend logs**:
   ```bash
   docker-compose logs backend
   ```

3. **Check Supabase status**:
   - Go to https://status.supabase.com
   - Is your region experiencing issues?

4. **Test VITE_ vars in browser**:
   ```javascript
   // Open console and run:
   fetch('/__VITE_ENV__').then(r => r.json()).catch(e => console.log('Not available'))
   ```
