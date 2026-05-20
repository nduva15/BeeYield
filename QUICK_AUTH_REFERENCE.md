# 🚀 QUICK REFERENCE: 3-Backend Auth System

---

## What Changed

### Before ❌
- Forms → Supabase only
- No backend sync
- Users don't exist in your database
- Shop/BeeYield accounts could mix
- Logout incomplete

### After ✅
- Forms → Supabase + Backend
- Automatic backend sync
- Users exist in both systems
- Complete isolation by backend
- Full logout cleanup

---

## How to Use (For Each Form)

### PATTERN: All 3 forms follow this

```typescript
// LOGIN
import { completeLoginFlow } from '@/services/backendAuth';

const handleSubmit = async (e) => {
    const result = await completeLoginFlow(
        'shop' | 'beeyield' | 'ceba',  // Pick one
        email,
        password
    );
    
    if (!result.success) {
        if (result.needsMFA) {
            // Show MFA input
        } else {
            toast.error(result.error);
        }
    } else {
        toast.success('Logged in');
        navigate('/dashboard');
    }
};

// SIGNUP
import { completeSignupFlow } from '@/services/backendAuth';

const handleSubmit = async (e) => {
    const result = await completeSignupFlow(
        'shop' | 'beeyield' | 'ceba',  // Pick one
        email,
        password,
        firstName,
        lastName,
        'user' | 'professional' | 'admin'  // Role
    );
    
    if (result.success) {
        toast.success('Account created');
        navigate('/login');
    } else {
        toast.error(result.error);
    }
};

// LOGOUT
import { completeLogoutFlow } from '@/services/backendAuth';

const handleLogout = async () => {
    await completeLogoutFlow('shop' | 'beeyield' | 'ceba');
    navigate('/');
};
```

---

## Files to Update

### ✅ Already Done
- `src/services/backendAuth.ts` (NEW)
- `src/services/api.ts` (UPDATED - removed fallback)
- `src/components/auth/shop/*` (UPDATED)

### 🔄 You Need To Do

1. **BeeYield Login Form**
   - Import `completeLoginFlow` 
   - Replace `signIn()` call
   - Use `'beeyield'` backend

2. **BeeYield Register Form**
   - Import `completeSignupFlow`
   - Replace signup logic
   - Use `'beeyield'` backend
   - Use `'professional'` role

3. **CEBA Login Form**
   - Import `completeLoginFlow`
   - Replace `signIn()` call
   - Use `'ceba'` backend
   - Add admin role check

4. **CEBA Register Form**
   - Import `completeSignupFlow`
   - Use `'ceba'` backend
   - Use `'admin'` role
   - Add admin verification

---

## Backend Endpoints Needed

Your backend needs 3 endpoints:

### 1. Register User
```
POST /auth/register-backend
Body: { email, first_name, last_name, role, auth_backend }
Response: { id, email, backend, role }
```

### 2. Verify Session
```
GET /auth/verify?backend=shop&email=user@example.com
Response: { exists: true/false, role: string }
```

### 3. Logout
```
POST /auth/logout-backend
Body: { backend: 'shop'|'beeyield'|'ceba' }
Response: { success: true }
```

### 4. Enforce in Middleware
```python
# All routes except /auth/
Check X-Backend header == user.auth_backend
Deny if mismatch (403 Unauthorized)
```

---

## Storage Keys

### Per Backend
```
shop:auth:email           ← Current backend
shop:auth:backend         ← "shop"
shop:savedEmail           ← For "Remember me"

beeyield:auth:email
beeyield:auth:backend
beeyield:savedEmail

ceba:auth:email
ceba:auth:backend
ceba:savedEmail
```

### Old Keys (DELETE)
```
❌ savedEmail_shop
❌ savedEmail_beeyield
❌ savedEmail_ceba
❌ authBackend
❌ authReturnTo
```

---

## Testing Each Form

### Shop Form
1. Go to `/shop/auth`
2. Click "Create account"
3. Fill form → Submit
4. Check: User exists in `shop_users` table ✓
5. Logout & Login with same email ✓

### BeeYield Form  
1. Go to `/beeyield-login`
2. Click "Create account"
3. Fill form → Submit
4. Check: User exists in `beeyield_users` table ✓
5. Logout & Login with same email ✓

### CEBA Form
1. Go to `/admin` or `/ceba`
2. Click "Create account"
3. Fill form → Submit
4. Check: User exists in `ceba_users` table ✓
5. Logout & Login with same email ✓

---

## Common Issues & Fixes

### "Supabase signup succeeded but backend sync failed"
- Check `/auth/register-backend` endpoint exists
- Check it's receiving correct `auth_backend` value
- Check database table exists for that backend

### "Login fails: user not found on backend"
- Check user was created in correct table
- Check email matches exactly (case-sensitive?)
- Manual check: `SELECT * FROM shop_users WHERE email = ?`

### "User from shop can see beeyield data"
- Check middleware enforces `X-Backend` header
- Check `auth_backend` field matches
- Verify `getAuthHeaders()` doesn't fall back to shop

### "Logout doesn't clear all data"
- Check `completeLogoutFlow()` clears correct backend storage
- Check backend `/auth/logout-backend` is called
- Verify localStorage only has current backend keys

### "Same email creates 2 accounts by mistake"
- This is CORRECT - separate backends = separate tables
- User needs different account in each system
- Document clearly: "Shop and Dashboard are separate accounts"

---

## Monitoring / Debugging

### Check Current Backend
```javascript
// DevTools Console:
localStorage.getItem('shop:auth:backend')      // null if not logged in
localStorage.getItem('beeyield:auth:backend')  // null if not logged in
localStorage.getItem('ceba:auth:backend')      // null if not logged in
```

### Check Session
```javascript
// Check Supabase session per backend:
const { supabaseShop, supabaseBeeYield, supabaseCEBA } = 
  await import('@/lib/supabase');

const { data } = await supabaseShop.auth.getSession();
console.log('Shop:', data.session ? 'Logged in' : 'Logged out');

const { data } = await supabaseBeeYield.auth.getSession();
console.log('BeeYield:', data.session ? 'Logged in' : 'Logged out');
```

### Check API Header
```javascript
// Check what header is sent:
import { getAuthHeaders } from '@/services/api';
const headers = await getAuthHeaders();
console.log(headers);
// Should show: { Authorization: 'Bearer ...', X-Backend: 'shop'|'beeyield'|'ceba' }
```

---

## Checklist Before Deploy

- [ ] All 3 forms import correct auth functions
- [ ] All forms pass correct backend name: 'shop'|'beeyield'|'ceba'
- [ ] All forms pass correct role: 'user'|'professional'|'admin'
- [ ] Backend endpoints implemented
- [ ] Backend middleware enforces X-Backend header
- [ ] All 3 backends have separate user tables
- [ ] Test: Signup creates user in backend ✓
- [ ] Test: Login verifies user exists ✓
- [ ] Test: Logout clears all storage ✓
- [ ] Test: Cross-backend isolation works ✓

---

## Deploy Command

```bash
# Code changes
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Then test each form
# Then implement backend endpoints if not done
```

---

**Status: Ready to implement on BeeYield + CEBA forms** ✅
