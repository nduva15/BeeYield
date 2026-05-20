/**
 * Backend Authentication Service
 * 
 * Handles synchronization with backend after Supabase auth
 * Ensures each backend (shop, beeyield, ceba) maintains separate users
 * Prevents cross-backend session mixing
 */

import { supabaseShop, supabaseBeeYield, supabaseCEBA } from '@/lib/supabase';
import { apiPost, apiGet } from './api';
import { buildAuthCallbackUrl } from '@/lib/authRedirect';

export type AuthBackend = 'shop' | 'beeyield' | 'ceba';

interface BackendAuthResult {
    success: boolean;
    error?: string;
    data?: {
        id: string;
        email: string;
        backend: AuthBackend;
        role: string;
    };
}

interface BackendSyncPayload {
    user_id?: string;
    email: string;
    first_name?: string;
    last_name?: string;
    role: string;
    auth_backend: AuthBackend;
    metadata?: Record<string, any>;
}

const RETURN_TO_BY_BACKEND: Record<AuthBackend, string> = {
    shop: '/shop-dashboard',
    beeyield: '/beeyield-dashboard',
    ceba: '/ceba',
};

function userBelongsToBackend(user: any, backend: AuthBackend): boolean {
    const metadata = user?.user_metadata ?? {};
    return metadata.auth_backend === backend || metadata[`${backend}_active`] === true;
}

/**
 * Sync user with backend after Supabase authentication
 * This is CRITICAL - creates/updates user account on backend
 */
export async function syncUserWithBackend(
    backend: AuthBackend,
    payload: BackendSyncPayload
): Promise<BackendAuthResult> {
    try {
        console.log(`[${backend}] Syncing user with backend:`, payload.email);

        const endpoint = `/auth/register-backend`;
        const response = await apiPost<any>(endpoint, {
            ...payload,
            auth_backend: backend,
        });

        if (response.error) {
            console.error(`[${backend}] Backend sync error:`, response.error);
            return {
                success: false,
                error: response.error,
            };
        }

        console.log(`[${backend}] User synced successfully:`, response.data?.id);
        return {
            success: true,
            data: {
                id: response.data?.id || payload.email,
                email: payload.email,
                backend,
                role: payload.role,
            },
        };
    } catch (error: any) {
        console.error(`[${backend}] Backend sync failed:`, error);
        return {
            success: false,
            error: error.message || 'Backend sync failed',
        };
    }
}

/**
 * Verify user exists and has active session on backend
 */
export async function verifyBackendSession(
    backend: AuthBackend,
    email: string
): Promise<{ exists: boolean; role?: string }> {
    try {
        console.log(`[${backend}] Verifying backend session for:`, email);

        const response = await apiGet<any>(`/auth/verify`, {
            backend,
            email,
        });

        return {
            exists: response.exists === true,
            role: response.role,
        };
    } catch (error) {
        console.error(`[${backend}] Verify session failed:`, error);
        return { exists: false };
    }
}

/**
 * Clear backend session
 */
export async function clearBackendSession(backend: AuthBackend): Promise<void> {
    try {
        console.log(`[${backend}] Clearing backend session`);
        await apiPost(`/auth/logout-backend`, { backend });
    } catch (error) {
        console.error(`[${backend}] Clear session failed:`, error);
    }
}

/**
 * Get backend-specific storage key
 */
export function getBackendStorageKey(backend: AuthBackend, key: string): string {
    return `${backend}:${key}`;
}

/**
 * Clear all storage for a specific backend
 */
export function clearBackendStorage(backend: AuthBackend): void {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(`${backend}:`)) {
            keysToRemove.push(key);
        }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
}

/**
 * Prevent cross-backend session mixing
 * Call this when switching backends
 */
export async function isolateBackendSession(targetBackend: AuthBackend): Promise<void> {
    console.log(`[Auth] Isolating to ${targetBackend} backend`);

    // Get all other backends
    const otherBackends: AuthBackend[] = (['shop', 'beeyield', 'ceba'] as const).filter(
        b => b !== targetBackend
    );

    // Sign out from other backends
    for (const backend of otherBackends) {
        const client = backend === 'shop' ? supabaseShop : backend === 'beeyield' ? supabaseBeeYield : supabaseCEBA;
        if (client) {
            console.log(`[Auth] Signing out from ${backend}`);
            await client.auth.signOut();
            await clearBackendSession(backend);
            clearBackendStorage(backend);
        }
    }
}

/**
 * Complete signup flow: Supabase → Backend
 */
export async function completeSignupFlow(
    backend: AuthBackend,
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: string = 'user',
    metadata?: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
    try {
        // Step 1: Get Supabase client
        const client = backend === 'shop' ? supabaseShop : backend === 'beeyield' ? supabaseBeeYield : supabaseCEBA;
        if (!client) {
            return { success: false, error: 'Backend not configured' };
        }

        // Step 2: Isolate session to this backend
        await isolateBackendSession(backend);

        // Step 3: Sign up on Supabase
        console.log(`[${backend}] Signing up on Supabase:`, email);
        const { data, error } = await client.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: buildAuthCallbackUrl({
                    backend,
                    returnTo: RETURN_TO_BY_BACKEND[backend],
                    intent: 'signup',
                }),
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    role,
                    auth_backend: backend,
                    [`${backend}_active`]: true,
                    ...metadata,
                },
            },
        });

        if (error) {
            console.error(`[${backend}] Supabase signup error:`, error.message);
            return { success: false, error: error.message };
        }

        if (!data.user) {
            return { success: false, error: 'User creation failed' };
        }

        if (Array.isArray(data.user.identities) && data.user.identities.length === 0 && !data.session) {
            return {
                success: false,
                error: `This email already exists in auth but is not registered for ${backend}. Use a separate ${backend} account or configure separate Supabase projects for each backend.`,
            };
        }

        // Step 4: Sync with backend
        console.log(`[${backend}] Syncing with backend after signup`);
        const syncResult = await syncUserWithBackend(backend, {
            user_id: data.user.id,
            email,
            first_name: firstName,
            last_name: lastName,
            role,
            auth_backend: backend,
        });

        if (!syncResult.success) {
            console.warn(`[${backend}] Backend sync warning (non-critical):`, syncResult.error);
            // Don't fail signup if backend sync fails - user can sync later
        }

        // Step 5: Save backend context
        localStorage.setItem(getBackendStorageKey(backend, 'auth:email'), email);
        localStorage.setItem(getBackendStorageKey(backend, 'auth:backend'), backend);

        return { success: true };
    } catch (error: any) {
        console.error(`[${backend}] Complete signup flow error:`, error);
        return { success: false, error: error.message || 'Signup failed' };
    }
}

/**
 * Complete login flow: Supabase → Backend → Verify
 */
export async function completeLoginFlow(
    backend: AuthBackend,
    email: string,
    password: string
): Promise<{ success: boolean; error?: string; needsMFA?: boolean }> {
    try {
        // Step 1: Get Supabase client
        const client = backend === 'shop' ? supabaseShop : backend === 'beeyield' ? supabaseBeeYield : supabaseCEBA;
        if (!client) {
            return { success: false, error: 'Backend not configured' };
        }

        // Step 2: Isolate session to this backend
        await isolateBackendSession(backend);

        // Step 3: Sign in on Supabase
        console.log(`[${backend}] Signing in on Supabase:`, email);
        const { data, error } = await client.auth.signInWithPassword({ email, password });

        if (error) {
            console.error(`[${backend}] Supabase signin error:`, error.message);
            return { success: false, error: error.message };
        }

        // Step 4: Check if MFA is required
        if (data.session === null && !error) {
            const { data: factorsData } = await client.auth.mfa.listFactors();
            if (factorsData?.totp && factorsData.totp.length > 0) {
                console.log(`[${backend}] MFA required for user`);
                return { success: false, error: null, needsMFA: true };
            }
        }

        if (!data.user) {
            return { success: false, error: 'Login failed' };
        }

        // Step 5: Verify backend session
        console.log(`[${backend}] Verifying backend session`);
        const verifyResult = await verifyBackendSession(backend, email);

        if (!verifyResult.exists) {
            if (!userBelongsToBackend(data.user, backend)) {
                await client.auth.signOut();
                return {
                    success: false,
                    error: `This email is not registered for the ${backend} backend. Please create the right account first.`,
                };
            }

            // Try to sync if doesn't exist on backend
            console.log(`[${backend}] User not found on backend, attempting sync`);
            const syncResult = await syncUserWithBackend(backend, {
                user_id: data.user.id,
                email,
                role: data.user.user_metadata?.role || 'user',
                auth_backend: backend,
            });

            if (!syncResult.success) {
                console.error(`[${backend}] Failed to sync user on backend:`, syncResult.error);
                await client.auth.signOut();
                return {
                    success: false,
                    error: `Backend verification failed: ${syncResult.error}`,
                };
            }
        }

        // Step 6: Save backend context
        localStorage.setItem(getBackendStorageKey(backend, 'auth:email'), email);
        localStorage.setItem(getBackendStorageKey(backend, 'auth:backend'), backend);

        console.log(`[${backend}] Login successful`);
        return { success: true };
    } catch (error: any) {
        console.error(`[${backend}] Complete login flow error:`, error);
        return { success: false, error: error.message || 'Login failed' };
    }
}

/**
 * Logout from backend
 */
export async function completeLogoutFlow(backend: AuthBackend): Promise<void> {
    try {
        console.log(`[${backend}] Starting logout`);

        // Clear backend session
        await clearBackendSession(backend);

        // Sign out from Supabase
        const client = backend === 'shop' ? supabaseShop : backend === 'beeyield' ? supabaseBeeYield : supabaseCEBA;
        if (client) {
            await client.auth.signOut();
        }

        // Clear storage
        clearBackendStorage(backend);

        console.log(`[${backend}] Logout complete`);
    } catch (error) {
        console.error(`[${backend}] Logout error:`, error);
    }
}

/**
 * Check if user is authenticated on backend
 */
export async function isAuthenticatedOnBackend(backend: AuthBackend): Promise<boolean> {
    try {
        const client = backend === 'shop' ? supabaseShop : backend === 'beeyield' ? supabaseBeeYield : supabaseCEBA;
        if (!client) return false;

        const { data } = await client.auth.getSession();
        return data.session !== null;
    } catch (error) {
        console.error(`[${backend}] Auth check error:`, error);
        return false;
    }
}

/**
 * Get current user for backend
 */
export async function getBackendUser(backend: AuthBackend) {
    try {
        const client = backend === 'shop' ? supabaseShop : backend === 'beeyield' ? supabaseBeeYield : supabaseCEBA;
        if (!client) return null;

        const { data } = await client.auth.getUser();
        return data.user;
    } catch (error) {
        console.error(`[${backend}] Get user error:`, error);
        return null;
    }
}
