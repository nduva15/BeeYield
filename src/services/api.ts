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

/**
 * Get authentication headers from Supabase session with caching
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
    const activeClient = getActiveClient();
    if (!activeClient) return {};

    const now = Date.now();
    // Cache session for 30 seconds to reduce overhead on concurrent requests
    if (cachedSession && (now - lastSessionFetch < 30000)) {
        return {
            'Authorization': `Bearer ${cachedSession.access_token}`
        };
    }

    try {
        // 1. Try active client (e.g. BeeYield or CEBA)
        let { data: { session } } = await activeClient.auth.getSession();

        // 2. Fallback: If no session on active client, and active client is NOT shop, try shop (main) session
        // This handles cases where a Shop user has permissions to access BeeYield/CEBA areas
        if (!session && activeClient !== supabaseShop && supabaseShop) {
            const { data: shopAuth } = await supabaseShop.auth.getSession();
            if (shopAuth.session) {
                session = shopAuth.session;
            }
        }

        if (session?.access_token) {
            cachedSession = session;
            lastSessionFetch = now;
            return {
                'Authorization': `Bearer ${session.access_token}`
            };
        }
    } catch (error) {
        console.error('Error getting auth headers:', error);
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

    // Route AI requests to Python Backend
    if (endpoint.includes("/ai/") || endpoint.startsWith("ai/")) {
        baseUrl = AI_API_URL;
    }

    // Construct full URL
    // If endpoint starts with http, use it as is.
    // If endpoint starts with /, append to baseUrl (which has no trailing slash usually)
    // If endpoint has no leading slash, add one.
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
                console.error("Non-JSON error response:", text.substring(0, 200));
                errorData = { detail: `API Error ${response.status}: ${response.statusText}` };
            }
            throw new Error(errorData.detail || errorData.message || `API Error: ${response.status}`);
        }

        const responseText = await response.text();
        if (!responseText) return {} as T;

        try {
            return JSON.parse(responseText);
        } catch (e) {
            console.error("Failed to parse JSON:", responseText.substring(0, 200));
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
