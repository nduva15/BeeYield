# ✅ DEPLOYMENT CHECKLIST - AUTHENTICATION FIX

**Use this to track your progress from broken auth to working deployment.**

---

## 📋 Pre-Deployment (Read These Files)

- [ ] Read `DELIVERY_SUMMARY.md` (2 min)
- [ ] Read `QUICK_START_AUTH.md` (5 min)
- [ ] Read `DEPLOY_COMMANDS.md` (10 min)
- [ ] Understand the flow: `.env` → `compose` → `build` → `app`

---

## 🔧 Setup Phase (15 minutes)

### Create Environment File
- [ ] File exists: `.env.production.example` ✅ (already created)
- [ ] Run: `cp .env.production.example .env`
- [ ] Open `.env` in editor
- [ ] Have Supabase project ready (or create one)

### Fill Environment Variables
- [ ] Get from Supabase project:
  - [ ] `VITE_SUPABASE_URL` = project URL
  - [ ] `VITE_SUPABASE_ANON_KEY` = anon public key
- [ ] Optional - if using separate backends:
  - [ ] `VITE_SUPABASE_URL_SHOP`
  - [ ] `VITE_SUPABASE_ANON_KEY_SHOP`
  - [ ] `VITE_SUPABASE_URL_BEEYIELD`
  - [ ] `VITE_SUPABASE_ANON_KEY_BEEYIELD`
  - [ ] `VITE_SUPABASE_URL_CEBA`
  - [ ] `VITE_SUPABASE_ANON_KEY_CEBA`
- [ ] `VITE_SUPER_ADMIN_EMAIL` = your email
- [ ] Verify no template values (like "your-project-ref.supabase.co")

### Verify File Changes
- [ ] Check `Dockerfile` has fixes:
  ```bash
  grep "ARG VITE_SUPABASE_URL_SHOP" Dockerfile
  # Should show: ARG VITE_SUPABASE_URL_SHOP
  ```
- [ ] Check `docker-compose.yml` has fixes:
  ```bash
  grep "VITE_SUPABASE_URL:" docker-compose.yml
  # Should show: VITE_SUPABASE_URL: ${VITE_SUPABASE_URL}
  ```

---

## 🐳 Docker Phase (5 minutes)

### Stop Current Containers
- [ ] Run: `docker-compose down`
- [ ] Wait for "Done" message
- [ ] Verify no errors

### Rebuild Containers
- [ ] Run: `docker-compose build --no-cache frontend`
  - [ ] Wait for build to complete (2-3 minutes)
  - [ ] Build should end with "Successfully tagged"
- [ ] Optional: `docker-compose build --no-cache backend`

### Start Services
- [ ] Run: `docker-compose up -d`
- [ ] Wait 15 seconds
- [ ] Check: `docker-compose ps`
  - [ ] frontend: Up
  - [ ] backend: Up
  - [ ] postgres: Up
  - [ ] redis: Up

---

## ✅ Validation Phase (2 minutes)

### Run Automated Validation
- [ ] Run: `bash validate-auth-deployment.sh` (or `.ps1` on Windows)
- [ ] Check all tests pass:
  - [ ] ✓ .env file exists
  - [ ] ✓ VITE_SUPABASE_URL configured
  - [ ] ✓ VITE_SUPABASE_ANON_KEY configured
  - [ ] ✓ Docker is running
  - [ ] ✓ Frontend container is running
  - [ ] ✓ Frontend is accessible
  - [ ] ✓ Docker Compose config is correct
  - [ ] ✓ Nginx config is valid

### Fix Any Failed Tests
If validation fails:
- [ ] Read the specific error message
- [ ] Go to `AUTH_DEPLOYMENT_FIX.md` → find matching issue
- [ ] Follow fix instructions
- [ ] Re-run validation
- [ ] Repeat until all tests pass

---

## 🧪 Manual Testing Phase (3 minutes)

### Test 1: Frontend Loads
- [ ] Open browser
- [ ] Visit: `http://localhost:3000`
- [ ] Should see BeeYield homepage (not error page)

### Test 2: Auth Form Loads
- [ ] Visit: `http://localhost:3000/shop/auth`
- [ ] Should see signup/login form
- [ ] Form should be interactive (not grayed out)

### Test 3: Environment Configured
- [ ] Open DevTools (F12)
- [ ] Go to Console tab
- [ ] Paste: `console.log(import.meta.env.VITE_SUPABASE_URL)`
- [ ] Should show: `https://your-project-ref.supabase.co`
- [ ] Should NOT show: empty, undefined, or template values

### Test 4: Signup Works
- [ ] At signup form:
  - [ ] Fill First Name: `Test`
  - [ ] Fill Last Name: `User`
  - [ ] Fill Email: `test@example.com`
  - [ ] Fill Password: `TempPassword123!`
  - [ ] Fill Confirm: `TempPassword123!`
- [ ] Click "Create Client Account"
- [ ] Should see:
  - [ ] Success message, OR
  - [ ] Specific error from Supabase (means it tried!)
- [ ] Should NOT see: form just hangs, nothing happens

### Test 5: Login Works
- [ ] At login form:
  - [ ] Fill Email: `test@example.com`
  - [ ] Fill Password: `TempPassword123!`
- [ ] Click "Log In"
- [ ] Should see:
  - [ ] Success message and redirect, OR
  - [ ] Specific error (wrong credentials OK)

### Test 6: OAuth Button Appears
- [ ] At login form
- [ ] Should see "Sign in with Google" button
- [ ] Button should be clickable (not grayed out)

### Test 7: No Console Errors
- [ ] DevTools Console should show NO red error messages
- [ ] Warnings (yellow) are OK
- [ ] Errors would indicate: config, CORS, or build issues

---

## 🔍 Debugging (If Tests Fail)

### If validation script fails:
- [ ] Read the exact error message
- [ ] Check `.env` file:
  ```bash
  cat .env | grep VITE_SUPABASE
  ```
- [ ] Values should be real URLs/keys, not templates
- [ ] Go to `AUTH_DEPLOYMENT_FIX.md` and find matching issue

### If auth form won't load:
- [ ] Check frontend is running:
  ```bash
  docker-compose ps frontend
  # Status should be "Up"
  ```
- [ ] Check frontend logs:
  ```bash
  docker-compose logs frontend | tail -20
  # Look for any "ERROR" messages
  ```
- [ ] Try accessing: `http://localhost:3000/index.html`

### If signup/login won't submit:
- [ ] Open DevTools Console (F12)
- [ ] Look for red error messages
- [ ] Check Network tab:
  - [ ] Filter by "auth"
  - [ ] Try submitting form
  - [ ] Look for failed requests (red)
  - [ ] Click failed request → Response tab → see error details

### If CORS error appears:
- [ ] Go to Supabase project
- [ ] Settings → Authentication
- [ ] Find "Authorized redirect URLs"
- [ ] Add: `http://localhost:3000`
- [ ] Click Save
- [ ] Wait 5 minutes
- [ ] Refresh browser

### If Supabase says "invalid credentials":
- [ ] Check `.env` values match Supabase project
- [ ] Verify you copied the ENTIRE key (very long string)
- [ ] Make sure URL has `.supabase.co` at end
- [ ] Rebuild: `docker-compose build --no-cache frontend`

---

## 🎯 Success Criteria (All Should Be ✅)

- [ ] ✅ Validation script passes all 9 tests
- [ ] ✅ Frontend loads at `http://localhost:3000`
- [ ] ✅ Auth forms load at `/shop/auth`
- [ ] ✅ Console shows VITE_SUPABASE_URL (not empty)
- [ ] ✅ Signup form accepts input
- [ ] ✅ Signup form submits (success or specific error)
- [ ] ✅ Login form accepts input
- [ ] ✅ Login form submits (success or specific error)
- [ ] ✅ OAuth button appears and is clickable
- [ ] ✅ DevTools Console shows NO red errors
- [ ] ✅ All 4 containers running (docker-compose ps)
- [ ] ✅ No "Supabase client missing" errors

---

## 📚 Documentation References

If you're stuck on:

| Issue | Document | Section |
|-------|----------|---------|
| Environment setup | SUPABASE_SETUP.md | Step 1-2 |
| Deployment commands | DEPLOY_COMMANDS.md | Full guide |
| OAuth not working | SUPABASE_SETUP.md | Step 3 |
| CORS errors | SUPABASE_SETUP.md | Step 4 |
| Deep troubleshooting | AUTH_DEPLOYMENT_FIX.md | Full guide |
| Quick deployment | QUICK_START_AUTH.md | Full guide |
| Understanding the fix | AUTH_FIX_SUMMARY.md | Full guide |
| Validation failed | AUTH_DEPLOYMENT_FIX.md | Validation section |

---

## 🚀 After Everything Works

- [ ] Read through one of the guides for deeper understanding
- [ ] Test with your real Supabase account (not just validation)
- [ ] Test password reset flow
- [ ] Test OAuth (Google sign-in)
- [ ] Test across different browsers
- [ ] Test on different network/device if possible
- [ ] Plan production deployment (if ready)

---

## 📝 Notes

**Write here if something goes wrong:**

```
Date: ____________________
Issue: ____________________
Error: ____________________
Action taken: ____________________
Result: ____________________
```

---

## ✅ Final Status

- [ ] Environment setup: COMPLETE
- [ ] Docker build: COMPLETE
- [ ] Validation: PASSING
- [ ] Manual tests: PASSING
- [ ] Auth ready for deployment: ✅ YES

---

**Checklist Complete! 🎉**

Your signup and login forms are now fully deployed and working!

Next steps:
- [ ] Test with real users
- [ ] Monitor logs for issues
- [ ] Plan production deployment
- [ ] Document any custom changes

---

**Deployment Completed**: ___________  
**By**: ___________  
**Status**: ✅ READY FOR PRODUCTION
