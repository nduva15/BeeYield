# Authentication System Fixes (2026-02-11)

## Summary of Changes

The following critical fixes have been implemented to resolve login loops, "Account Required" errors, and multi-backend session management issues.

### 1. **Multi-Backend State Management**
- **Issue**: `activeBackend` in `AuthContext` only updated on `popstate` events (browser back/forward), causing React Router navigation (`navigate()`) to leave the context stale.
- **Fix**: Implemented `MutationObserver` + fallback + `popstate` listener to ensure `activeBackend` (Shop vs BeeYield vs CEBA) is always in sync with the URL.
- **Result**: Navigating from `/shop` to `/beeyield-login` to `/beeyield-dashboard` now correctly switches the authentication context.

### 2. **BeeYield Dashboard Access**
- **Issue**: `LoginForm` blocked login if `beeyield_active` metadata was missing, forcing users to "Sign Up" even if they had an account.
- **Fix**: Removed the blocking check. Instead, successful login now **automatically updates** the user's metadata with `{ beeyield_active: true }`.
- **Result**: Users can now log in via the BeeYield portal regardless of how they originally signed up (e.g. via Shop).

### 3. **Google OAuth Flow**
- **Issue**: `AuthCallback` always used the default `shop` client to process OAuth redirects, failing to authenticate consistently when initiated from BeeYield or Admin portals.
- **Fix**: `LoginForm` and `RegisterForm` now save `authBackend` to `localStorage` before redirect. `AuthCallback` reads this value to initialize the correct Client instance.
- **Result**: Signing in with Google from the BeeYield login page correctly establishes a session on the BeeYield client.

### 4. **Protected Route Robustness**
- **Issue**: `ProtectedRoute` strict checking caused redirect loops for users authenticated on the backend but missing metadata updates.
- **Fix**: Updated `ProtectedRoute` and `BeeYieldDashboard` to accept users who are authenticated on the specific backend client (`beeyieldUser`) directly.
- **Result**: Dashboard access is instant and reliable.

## Verification
- **Login**: Navigate to `/beeyield-login`. Login with any valid account. You should be redirected to `/beeyield-dashboard`.
- **Signup**: Use the "Sign Up" tab on `/beeyield-login`. Create an account. You should be logged in and redirected.
- **Google Auth**: Use "Continue with Google". You should be redirected back and logged in to the correct context.
