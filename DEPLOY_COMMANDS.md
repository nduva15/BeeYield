# 🚀 Exact Deployment Commands

Copy and paste these commands in order. **Stop if any command fails.**

---

## Step 1: Setup Environment (1 minute)

```bash
# Copy the example env file
cp .env.production.example .env

# Open .env in your editor and add credentials
# On Mac:
open -a TextEdit .env

# On Windows (PowerShell):
notepad .env

# On Linux:
nano .env
```

**What to edit in .env:**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGc...
VITE_SUPER_ADMIN_EMAIL=your@email.com
```

---

## Step 2: Verify Files Are Ready

```bash
# Check Dockerfile has fixes
grep "ARG VITE_SUPABASE_URL_SHOP" Dockerfile
# Should show the line (confirms update applied)

# Check docker-compose has fixes
grep "VITE_SUPABASE_URL:" docker-compose.yml
# Should show the line (confirms update applied)

# Check env file exists
test -f .env && echo "✅ .env exists" || echo "❌ .env missing - run Step 1"
```

---

## Step 3: Stop Current Containers

```bash
# Stop everything
docker-compose down

# Wait for it to complete (watch for "Done")
# Should see: "Removing beeyield-frontend... Done"
```

---

## Step 4: Rebuild Containers (3-5 minutes)

```bash
# Build frontend with no cache (CRITICAL for env vars)
docker-compose build --no-cache frontend

# Should see "Building frontend..." followed by "Successfully tagged..."
# This step takes 2-3 minutes

# If it fails with "rate limit" or network error:
# Wait 5 minutes and try again
```

---

## Step 5: Build Backend (Optional but recommended)

```bash
# Also rebuild backend to ensure clean state
docker-compose build --no-cache backend

# If you only have Python backend, this takes ~1 minute
```

---

## Step 6: Start All Containers

```bash
# Start all services
docker-compose up -d

# Wait 15 seconds for services to start
sleep 15

# Verify all containers are running
docker-compose ps

# Should show 4 containers: frontend, backend, postgres, redis
# All status should be "Up" (not "Exited" or "Restarting")
```

---

## Step 7: Validate Setup (30 seconds)

```bash
# On Mac/Linux:
bash validate-auth-deployment.sh

# On Windows PowerShell:
.\validate-auth-deployment.ps1

# Should show:
# ✓ .env file exists
# ✓ VITE_SUPABASE_URL configured
# ✓ VITE_SUPABASE_ANON_KEY configured
# ✓ Docker is running
# ✓ Frontend container is running
# ✓ Frontend is accessible at http://localhost:3000
# etc.
```

**If validation fails:**
- Read the specific error
- Check `.env` has values (not template values like "your-project-ref.supabase.co")
- Try Step 3-6 again

---

## Step 8: Manual Testing (2 minutes)

### Test 1: Frontend Loads
```bash
# On Mac/Linux:
curl http://localhost:3000 | grep -o "<title>.*</title>"

# On Windows PowerShell:
Invoke-WebRequest http://localhost:3000 | Select-Object -ExpandProperty RawContent | Select-String "<title>"

# Should see: <title>BeeYield</title>
```

### Test 2: Auth Form Loads
Open browser and visit:
```
http://localhost:3000/shop/auth
```

Should see signup/login form (not error page)

### Test 3: Environment Is Configured
Open DevTools (F12) → Console → Paste:
```javascript
console.log(import.meta.env.VITE_SUPABASE_URL)
```

Should show:
```
https://your-project-ref.supabase.co
```

**NOT empty or "undefined"**

### Test 4: Try Signup
1. Click "Create account"
2. Fill in form:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Password: TestPass123!
3. Click "Create Client Account"

Should either:
- ✅ Show success message
- ✅ Show error from Supabase (good - means it's connecting!)
- ❌ Do nothing (bad - check console for errors)

---

## Step 9: Check for Errors

If test fails, run these diagnostics:

```bash
# Check frontend logs
docker-compose logs frontend

# Look for: any ERROR or WARN messages
# Common: "CRITICAL: Supabase client missing credentials"

# Check if env vars were passed to build
docker-compose logs frontend | grep "VITE_SUPABASE"

# Should show env vars being set during build
```

---

## Step 10: If Something Is Wrong

### Error: "Supabase client missing credentials"

```bash
# Rebuild with no cache
docker-compose down
docker-compose build --no-cache frontend
docker-compose up -d

# If still fails, check .env values
cat .env | grep VITE_SUPABASE

# Should show real URLs/keys, not template values
```

### Error: "CORS error" in browser console

Go to your Supabase project:
1. Settings → Authentication
2. Find "Authorized redirect URLs"
3. Add: `http://localhost:3000`
4. Click Save
5. Wait 5 minutes
6. Refresh browser

### Error: "Form won't submit"

Open DevTools:
1. Console tab - any red errors?
2. Network tab - filter by "auth" - any failed requests?
3. If requests show 401/403 - wrong credentials in .env

---

## Quick Validation Script (All-in-One)

```bash
# Run these all at once
docker-compose down && \
docker-compose build --no-cache frontend backend && \
docker-compose up -d && \
sleep 15 && \
bash validate-auth-deployment.sh
```

---

## Expected Output Timeline

```
0:00   → docker-compose down (15 sec)
0:15   → docker-compose build (2-3 min)
3:15   → docker-compose up -d (10 sec)
3:25   → Containers starting...
3:40   → All services ready ✅
3:45   → Validation script run (30 sec)
4:15   → DONE! Auth is ready 🎉
```

---

## Success Checklist

When deployment is complete, you should be able to check all:

- [ ] `docker-compose ps` shows 4 containers "Up"
- [ ] Validation script passes all tests
- [ ] `http://localhost:3000` loads (not error)
- [ ] `http://localhost:3000/shop/auth` loads signup form
- [ ] Browser console shows VITE_SUPABASE_URL (not empty)
- [ ] Signup form can be filled and submitted
- [ ] Login form can be filled and submitted
- [ ] Google OAuth button appears and is clickable
- [ ] No red errors in browser console

---

## One Gotcha to Remember

**ALWAYS use `--no-cache` when building after changing .env:**

```bash
# ✅ Correct - rebuilds and passes env vars
docker-compose build --no-cache frontend

# ❌ Wrong - might use old build without env vars
docker-compose build frontend

# ❌ Wrong - restart doesn't rebuild
docker-compose restart
```

---

## Next Steps After Successful Deployment

1. ✅ Test signup with real Supabase account
2. ✅ Verify email confirmation works
3. ✅ Test login with created account
4. ✅ Test OAuth (Google sign-in)
5. ✅ Test password reset flow
6. ✅ Test on your deployed domain (when ready)

---

## Need Help?

```bash
# See all logs
docker-compose logs

# See only frontend logs
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f frontend

# See only errors
docker-compose logs | grep -i error

# See which env vars Docker knows about
docker exec beeyield-frontend env | grep VITE
```

---

## Success! 🎉

If you got here, your authentication should be working!

**Next:** Read `SUPABASE_SETUP.md` to ensure Supabase is properly configured.

---

**Commands Created: 2026-04-22**  
**Purpose: Exact steps to fix deployed authentication**
