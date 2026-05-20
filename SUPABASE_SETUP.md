# Supabase Configuration for BeeYield Authentication

This guide walks you through setting up Supabase projects for signup/login to work.

---

## Step 1: Create Supabase Project

### For Single Project Setup (Easiest)

1. Go to https://supabase.com
2. Sign in / create account
3. Click "New Project"
4. Fill in:
   - **Name**: BeeYield
   - **Database Password**: Save this somewhere safe!
   - **Region**: Closest to you
5. Wait for project to initialize (5-10 minutes)

### For Multi-Project Setup (Shop, BeeYield, CEBA)

Create 3 separate projects:
1. `BeeYield Shop` 
2. `BeeYield Professional`
3. `BeeYield Admin`

---

## Step 2: Get Your Credentials

For each project:

1. Go to **Project Settings** (bottom left gear icon)
2. Click **API**
3. Copy these values into your `.env` file:
   - **URL**: `VITE_SUPABASE_URL` (under "Project URL")
   - **Anon Key**: `VITE_SUPABASE_ANON_KEY` (under "anon public" key)

**Example:**
```
VITE_SUPABASE_URL=https://abcd1234.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 3: Configure OAuth (Google Sign-In)

### 3a. Get Google OAuth Credentials

1. Go to https://console.cloud.google.com
2. Create a new project
3. Enable "Google+ API"
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Choose **Web Application**
6. Add Authorized redirect URIs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000`
   - `https://your-deployed-domain.com` (after deployment)
7. Copy **Client ID** and **Client Secret**

### 3b. Add Google OAuth to Supabase

1. In Supabase project → **Authentication** → **Providers**
2. Find **Google** and click to expand
3. Paste your Google Client ID and Secret
4. Click **Save**

---

## Step 4: Configure Redirect URLs

This is CRITICAL for OAuth to work!

1. In Supabase → **Authentication** → **URL Configuration**
2. Under **Authorized redirect URLs**, add:
   ```
   http://localhost:3000
   http://localhost:3000/auth/callback
   http://localhost:3000/shop/auth
   http://localhost:3000/beeyield-login
   http://localhost:3000/ceba/login
   ```
3. After deployment, also add your production domain:
   ```
   https://yourdomain.com
   https://yourdomain.com/auth/callback
   ```

---

## Step 5: Enable Email Authentication

1. In Supabase → **Authentication** → **Providers**
2. Make sure **Email** is enabled (should be by default)
3. Look for **Email/Password** confirmation settings

---

## Step 6: Create Database Tables

Run this SQL in Supabase SQL Editor:

```sql
-- Shop profiles table
CREATE TABLE shop_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- BeeYield profiles table
CREATE TABLE beeyield_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- CEBA profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE shop_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE beeyield_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create basic policies
CREATE POLICY "Users can view own profile"
  ON shop_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON shop_profiles FOR UPDATE
  USING (auth.uid() = id);
```

---

## Step 7: Fill In Your .env File

After collecting credentials:

```bash
# Single project setup
VITE_SUPABASE_URL=https://abcd1234.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Multi-project setup (optional)
VITE_SUPABASE_URL_SHOP=https://shop-xxx.supabase.co
VITE_SUPABASE_ANON_KEY_SHOP=eyJ...

VITE_SUPABASE_URL_BEEYIELD=https://beeyield-xxx.supabase.co
VITE_SUPABASE_ANON_KEY_BEEYIELD=eyJ...

VITE_SUPABASE_URL_CEBA=https://ceba-xxx.supabase.co
VITE_SUPABASE_ANON_KEY_CEBA=eyJ...

# Admin email (for super admin access)
VITE_SUPER_ADMIN_EMAIL=your@email.com
```

---

## Step 8: Test Locally

```bash
# Rebuild with new env vars
docker-compose down
docker-compose build --no-cache frontend
docker-compose up -d

# Visit signup page
# http://localhost:3000/shop/auth

# Open browser DevTools Console and run:
console.log(import.meta.env.VITE_SUPABASE_URL)
# Should show your Supabase URL (NOT empty)
```

---

## Troubleshooting

### "Supabase client initialization failed"
- Check `.env` has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
- Both should start with `https://` and `eyJ...`
- Rebuild with `docker-compose build --no-cache`

### "CORS error when trying to signup"
- Add `http://localhost:3000` to Supabase → Auth → URL Configuration
- Wait 5 minutes for changes to propagate
- Rebuild frontend

### "Google OAuth redirects back to login"
- Verify Google OAuth app is created in Google Cloud Console
- Add redirect URI to Google app
- Verify credentials are entered in Supabase
- Check redirect URL is whitelisted in Supabase

### "Email verification link doesn't work"
- Supabase sends links automatically
- Check spam folder for verification email
- If not received after 5 min, click "Resend" on signup page

---

## Production Deployment

When deploying to production:

1. Update `.env` with production domain
2. Add production redirect URLs to Supabase:
   ```
   https://yourdomain.com
   https://yourdomain.com/auth/callback
   ```
3. Add production domain to Google OAuth app
4. Rebuild and redeploy: `docker-compose build --no-cache && docker-compose up -d`

---

## Security Notes

- Never commit `.env` to git (use `.gitignore`)
- Keep VITE_SUPABASE_ANON_KEY secret (it's public but tied to your Supabase project)
- Use strong database passwords
- Enable RLS on all tables
- Use Supabase's role-based access control for sensitive tables

---

## Next Steps

1. ✅ Create Supabase project
2. ✅ Get credentials
3. ✅ Configure OAuth
4. ✅ Add redirect URLs
5. ✅ Create database tables
6. ✅ Fill in `.env`
7. ✅ Rebuild and test
8. → Read `AUTH_DEPLOYMENT_FIX.md` for next steps
