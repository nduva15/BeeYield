# Google Authentication Setup Guide 🐝

To ensure Google Sign-In and Sign-Up work across all your codebase instances (Local, Staging, Production), follow these steps in your Supabase Dashboard.

## 1. Supabase Project Configuration
1. Go to **Authentication** -> **Providers** -> **Google**.
2. Enable Google Provider.
3. Enter your **Google Client ID** and **Client Secret** (obtained from Google Cloud Console).
4. **IMPORTANT**: Copy your project's Callback URL and add it to your Google Cloud Console "Authorized redirect URIs":
   - `https://ezfccfypwmuvbpujkqrg.supabase.co/auth/v1/callback`

## 2. Redirect URL Permissions
Supabase only allows redirects to specific URLs for security. You MUST add your callback routes to the "Redirect URLs" list:
1. Go to **Authentication** -> **URL Configuration**.
2. Under **Redirect URLs**, add the following (one for each instance):
   - `http://localhost:5173/auth/callback` (Local Development)
   - `https://your-production-domain.com/auth/callback` (Production)
   - `https://your-staging-domain.com/auth/callback` (Staging/Preview)

## 3. Environment Variables
Ensure your `.env` file (and production environment) has the correct variables:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
# Recommendation: For backend verification of Google users
SUPABASE_JWT_SECRET=your_project_jwt_secret 
```

## 4. How it works in the code
- **Frontend**: `AuthContext.tsx` uses `signInWithOAuth` with `redirectTo` set to `${window.location.origin}/auth/callback`.
- **Callback**: `AuthCallback.tsx` handles the session exchange and redirects the user back to their original page (stored in `localStorage.authReturnTo`).
- **Navigation**: The `Header.tsx` now dynamically shows a Login button or an Account dropdown based on `user` state.

---
*BeeYield Security Protocol: Identity Verified.* 🛡️
