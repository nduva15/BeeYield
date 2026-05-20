# 🚀 Authentication Deployment - Quick Start

## The Problem (In 30 Seconds)
Your signup/login forms don't work on the deployed site because **Supabase credentials aren't passed to the frontend Docker build**.

## The Solution (In 30 Seconds)
Environment variables → docker-compose.yml → Dockerfile → Frontend build = Working auth!

---

## Deploy Now (Copy & Paste)

```bash
# Step 1: Create .env file
cp .env.production.example .env

# Step 2: Edit with your Supabase credentials (IMPORTANT!)
# Edit .env and replace these with REAL values:
#   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
#   VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY

# Step 3: Rebuild and start
docker-compose down
docker-compose build --no-cache frontend backend
docker-compose up -d

# Step 4: Validate
bash validate-auth-deployment.sh
# (or on Windows: .\validate-auth-deployment.ps1)
```

---

## Test It

### Local Testing
1. Visit http://localhost:3000/shop/auth
2. Try to sign up with test email
3. Open browser DevTools → Console
4. Type: `console.log(import.meta.env.VITE_SUPABASE_URL)`
5. Should show your Supabase URL (NOT empty or "undefined")

### Common Errors & Fixes

| Error | Fix |
|-------|-----|
| "Supabase client missing" | Edit .env and rebuild with `--no-cache` |
| Form submits but nothing happens | Check browser console for JavaScript errors |
| CORS error | Add domain to Supabase: Project → Settings → Auth → Authorized URLs |
| OAuth redirect fails | Verify OAuth app in Supabase and Google Cloud Console |

---

## What I Fixed

✅ **Dockerfile** - Now passes 12 VITE_ variables (was 5)  
✅ **docker-compose.yml** - Now passes env vars to build  
✅ **.env.production.example** - Template with all required vars  
✅ **Nginx config** - Fixed cache for auth callbacks  
✅ **Validation scripts** - Test your setup automatically  

---

## Files to Know

- **AUTH_FIX_SUMMARY.md** - What was wrong & what I fixed
- **AUTH_DEPLOYMENT_FIX.md** - Deep troubleshooting guide  
- **validate-auth-deployment.sh** - Automatic setup tester
- **.env.production.example** - Copy to `.env` and fill in

---

## One Thing to Remember

**The frontend build happens at docker-compose build time**, not runtime. So:

```bash
# ✅ This works - rebuild after changing .env
docker-compose build --no-cache

# ❌ This won't work - just changing .env and restarting
docker-compose restart

# ✅ This works - down, build, up in one go
docker-compose down && docker-compose build --no-cache && docker-compose up -d
```

---

## Need More Help?

1. **Setup validation failed?**
   - Run: `bash validate-auth-deployment.sh` (Mac/Linux)
   - Or: `.\validate-auth-deployment.ps1` (Windows)
   - It tells you exactly what's missing

2. **Auth still not working?**
   - Check: `docker-compose logs frontend | grep "VITE_SUPABASE"`
   - Shows if vars were passed to build

3. **More detailed guide?**
   - Read: `AUTH_DEPLOYMENT_FIX.md`
   - Has network debugging, CORS fixes, backend setup

---

## Success! ✅

When working correctly:
- Signup form accepts input
- Login form accepts input  
- OAuth "Sign in with Google" button works
- No errors in browser console
- `VITE_SUPABASE_URL` console.log shows your URL

---

**Ready?** Start with: `cp .env.production.example .env`
