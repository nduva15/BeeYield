import { supabaseShop, supabaseBeeYield, supabaseCEBA } from '@/lib/supabase';

// Use environment variable for the API base URL
const isDev = import.meta.env.DEV;


// Python Backend (AI ONLY)
export const AI_API_URL = "http://localhost:8000/api/v1";

// Rust/Go Gateway (DATA & SHOP)
export const DATA_API_URL = "http://localhost:9090/api/v1";

// Default to Data URL for generic requests, but handle routing in apiRequest
export const API_BASE_URL = DATA_API_URL;
export const API_V1_URL = DATA_API_URL;

/**
 * Get the active Supabase client based on URL path
 */
function getActiveClient() {
    if (typeof window === 'undefined') return supabaseShop;
    const path = window.location.pathname;
    // Special handling for admin/ceba paths
    if (path.includes('/ceba') || path.startsWith('/admin')) {
        return supabaseCEBA || supabaseShop;
    }
    // Special handling for beeyield
    if (path.includes('beeyield')) {
        return supabaseBeeYield || supabaseShop;
    }
    return supabaseShop;
}

let cachedSession: any = null;
let lastSessionFetch = 0;
let sessionPromise: Promise<any> | null = null;

/**
 * Get authentication headers from Supabase session with caching and concurrency protection
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
    const activeClient = getActiveClient();
    if (!activeClient) return {};

    const now = Date.now();
    // Cache session for 60 seconds to reduce overhead on concurrent requests
    if (cachedSession && (now - lastSessionFetch < 60000)) {
        return {
            'Authorization': `Bearer ${cachedSession.access_token}`
        };
    }

    // If a request is already in flight, wait for it
    if (sessionPromise) {
        try {
            const session = await sessionPromise;
            if (session) return { 'Authorization': `Bearer ${session.access_token}` };
        } catch (e) {
            // If promise fails, fall through to create a new one
        }
    }

    // Create a new session fetch promise
    sessionPromise = (async () => {
        try {
            // 1. Try active client (e.g. BeeYield or CEBA)
            let { data: { session } } = await activeClient.auth.getSession();

            // 2. Fallback: If no session on active client, and active client is NOT shop, try shop (main) session
            if (!session && activeClient !== supabaseShop && supabaseShop) {
                const { data: shopAuth } = await supabaseShop.auth.getSession();
                if (shopAuth.session) {
                    session = shopAuth.session;
                }
            }

            if (session?.access_token) {
                cachedSession = session;
                lastSessionFetch = Date.now();
                return session;
            }
            return null;
        } catch (error) {
            console.error('Error getting auth headers:', error);
            return null;
        } finally {
            sessionPromise = null;
        }
    })();

    const session = await sessionPromise;
    if (session) {
        return { 'Authorization': `Bearer ${session.access_token}` };
    }

    // Fallback to previously cached session if available even if expired, to prevent blocking
    if (cachedSession) {
        return {
            'Authorization': `Bearer ${cachedSession.access_token}`
        };
    }

    return {};
}

// Helper function for API calls with error handling
export async function apiRequest<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    let baseUrl = DATA_API_URL;

    // Route AI and Assistant requests to Python Backend (Port 8000)
    const isAI = endpoint.includes("/ai/") ||
        endpoint.startsWith("ai/") ||
        endpoint.includes("/assistant/") ||
        endpoint.startsWith("assistant/") ||
        endpoint.includes("/bee-data") ||
        endpoint.includes("/search");

    if (isAI) {
        baseUrl = AI_API_URL;
    }

    // Construct full URL
    let url = endpoint;
    if (!endpoint.startsWith('http')) {
        const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        url = `${baseUrl}${path}`;
    }

    const authHeaders = await getAuthHeaders();

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...authHeaders,
                ...options?.headers,
            },
        });

        if (!response.ok) {
            let errorData: any = {};
            const text = await response.text();
            try {
                errorData = JSON.parse(text);
            } catch (e) {
                errorData = { detail: `API Error ${response.status}: ${response.statusText}` };
            }
            throw new Error(errorData.detail || errorData.message || `API Error: ${response.status}`);
        }

        const responseText = await response.text();
        if (!responseText) return {} as T;

        try {
            return JSON.parse(responseText);
        } catch (e) {
            console.error("Failed to parse JSON for endpoint:", endpoint);
            throw new Error(`Invalid JSON response from server`);
        }
    } catch (error: any) {
        console.error(`API Error for ${endpoint}:`, error);
        throw error;
    }
}

// GET request helper
export async function apiGet<T>(
    endpoint: string,
    params?: Record<string, unknown>,
    options?: RequestInit
): Promise<T> {
    let url = endpoint;
    if (params) {
        const stringParams: Record<string, string> = {};
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                stringParams[key] = String(value);
            }
        });
        const query = new URLSearchParams(stringParams).toString();
        url += `${url.includes('?') ? '&' : '?'}${query}`;
    }
    return apiRequest<T>(url, { method: "GET", ...options });
}

// POST request helper
export async function apiPost<T>(
    endpoint: string,
    data: unknown,
    options?: RequestInit
): Promise<T> {
    return apiRequest<T>(endpoint, {
        method: "POST",
        body: JSON.stringify(data),
        ...options
    });
}

// PUT request helper
export async function apiPut<T>(
    endpoint: string,
    data: unknown,
    options?: RequestInit
): Promise<T> {
    return apiRequest<T>(endpoint, {
        method: "PUT",
        body: JSON.stringify(data),
        ...options
    });
}

// PATCH request helper
export async function apiPatch<T>(
    endpoint: string,
    data: unknown,
    options?: RequestInit
): Promise<T> {
    return apiRequest<T>(endpoint, {
        method: "PATCH",
        body: JSON.stringify(data),
        ...options
    });
}

// DELETE request helper
export async function apiDelete<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    return apiRequest<T>(endpoint, { method: "DELETE", ...options });
}

/**
 * Handle file downloads from the API
 */
export async function apiDownload(
    endpoint: string,
    data: any = {},
    filename?: string
): Promise<Blob> {
    const url = endpoint.startsWith('http') ? endpoint : `${API_V1_URL}${endpoint}`;
    const authHeaders = await getAuthHeaders();

    const response = await fetch(url, {
        method: "POST", // Most downloads use POST with body data
        headers: {
            "Content-Type": "application/json",
            ...authHeaders,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();

    if (filename) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }

    return blob;
}
