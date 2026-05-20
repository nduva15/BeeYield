/**
 * Backend Authentication Service - SIMPLIFIED & FAST
 * Lightweight auth flow without blocking operations
 */

import { supabaseShop, supabaseBeeYield, supabaseCEBA } from '@/lib/supabase';

export type AuthBackend = 'shop' | 'beeyield' | 'ceba';

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
 * Prevent cross-backend session mixing - FAST VERSION
 * Signs out from other backends immediately without waiting
 */
export async function isolateBackendSession(targetBackend: AuthBackend): Promise<void> {
    console.log(`[Auth] Isolating to ${targetBackend} backend`);

    // Get all other backends
    const otherBackends: AuthBackend[] = (['shop', 'beeyield', 'ceba'] as const).filter(
        b => b !== targetBackend
    );

    // Sign out from other backends (don't wait - fire and forget)
    otherBackends.forEach(backend => {
        const client = backend === 'shop' ? supabaseShop : backend === 'beeyield' ? supabaseBeeYield : supabaseCEBA;
        if (client) {
            console.log(`[Auth] Signing out from ${backend}`);
            client.auth.signOut().catch(err => console.warn(`[Auth] Logout from ${backend} failed:`, err));
            clearBackendStorage(backend);
        }
    });
}

/**
 * FAST Signup flow - No backend sync blocking
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
        // Get Supabase client
        const client = backend === 'shop' ? supabaseShop : backend === 'beeyield' ? supabaseBeeYield : supabaseCEBA;
        if (!client) {
            return { success: false, error: 'Backend not configured' };
        }

        // Isolate session (don't block on this)
        isolateBackendSession(backend);

        // Sign up on Supabase (THIS MUST BE FAST)
        console.log(`[${backend}] Signing up on Supabase:`, email);
        const { data, error } = await client.auth.signUp({
            email,
            password,
            options: {
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

        // Save backend context immediately
        localStorage.setItem(getBackendStorageKey(backend, 'auth:email'), email);
        localStorage.setItem(getBackendStorageKey(backend, 'auth:backend'), backend);

        console.log(`[${backend}] Signup successful:`, email);
        return { success: true };
    } catch (error: any) {
        console.error(`[${backend}] Signup error:`, error);
        return { success: false, error: error.message || 'Signup failed' };
    }
}

/**
 * FAST Login flow - No backend verification blocking
 */
export async function completeLoginFlow(
    backend: AuthBackend,
    email: string,
    password: string
): Promise<{ success: boolean; error?: string; needsMFA?: boolean }> {
    try {
        // Get Supabase client
        const client = backend === 'shop' ? supabaseShop : backend === 'beeyield' ? supabaseBeeYield : supabaseCEBA;
        if (!client) {
            return { success: false, error: 'Backend not configured' };
        }

        // Isolate session (don't block on this)
        isolateBackendSession(backend);

        // Sign in on Supabase (THIS MUST BE FAST)
        console.log(`[${backend}] Signing in on Supabase:`, email);
        const { data, error } = await client.auth.signInWithPassword({ email, password });

        if (error) {
            console.error(`[${backend}] Supabase signin error:`, error.message);
            return { success: false, error: error.message };
        }

        // Check if MFA is required
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

        // Save backend context immediately
        localStorage.setItem(getBackendStorageKey(backend, 'auth:email'), email);
        localStorage.setItem(getBackendStorageKey(backend, 'auth:backend'), backend);

        console.log(`[${backend}] Login successful`);
        return { success: true };
    } catch (error: any) {
        console.error(`[${backend}] Login error:`, error);
        return { success: false, error: error.message || 'Login failed' };
    }
}

/**
 * FAST Logout flow
 */
export async function completeLogoutFlow(backend: AuthBackend): Promise<void> {
    try {
        console.log(`[${backend}] Starting logout`);

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
