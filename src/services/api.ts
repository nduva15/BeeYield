import { supabaseShop, supabaseBeeYield, supabaseCEBA } from '@/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

// Use environment variable for the API base URL
const isDev = import.meta.env.DEV;


// Python Backend (INTELLIGENCE HUB)
export const AI_API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1` : "http://localhost:8000/api/v1";

// Rust/Go Gateway (DATA & SHOP)
export const DATA_API_URL = "http://localhost:9090/api/v1";

// Default to Python Backend for generic requests
export const API_BASE_URL = AI_API_URL;
export const API_V1_URL = AI_API_URL;

/**
 * Get the active Supabase client based on URL path
 */
function getActiveClient() {
    if (typeof window === 'undefined') return supabaseShop;
    const path = window.location.pathname;
    // Special handling for admin/ceba paths
    if (path.includes('/ceba') || path.includes('/admin') || path.startsWith('/admin')) {
        return supabaseCEBA || supabaseShop;
    }
    // Special handling for beeyield
    if (path.includes('beeyield') || path.includes('/integrations/callback')) {
        return supabaseBeeYield || supabaseShop;
    }
    return supabaseShop;
}

type NamedClient = {
    client: SupabaseClient | null;
    key: 'shop' | 'beeyield' | 'ceba';
};

const SESSION_CACHE_TTL = 60000;
const namedClients: NamedClient[] = [
    { client: supabaseBeeYield, key: 'beeyield' },
    { client: supabaseShop, key: 'shop' },
    { client: supabaseCEBA, key: 'ceba' },
];

const sessionCache: Partial<Record<NamedClient['key'], any>> = {};
const sessionCacheTime: Partial<Record<NamedClient['key'], number>> = {};
const sessionPromises: Partial<Record<NamedClient['key'], Promise<any> | null>> = {};

function getClientKey(client: SupabaseClient | null): NamedClient['key'] | null {
    return namedClients.find((entry) => entry.client === client)?.key ?? null;
}

function getClientSearchOrder(activeClient: SupabaseClient | null): NamedClient[] {
    const activeKey = getClientKey(activeClient);
    const order = activeKey
        ? [activeKey, 'beeyield', 'shop', 'ceba']
        : ['beeyield', 'shop', 'ceba'];

    return Array.from(new Set(order))
        .map((key) => namedClients.find((entry) => entry.key === key))
        .filter((entry): entry is NamedClient => Boolean(entry));
}

async function getSessionForClient(entry: NamedClient): Promise<any | null> {
    if (!entry.client) return null;

    const now = Date.now();
    const cached = sessionCache[entry.key];
    if (cached && (now - (sessionCacheTime[entry.key] || 0) < SESSION_CACHE_TTL)) {
        return cached;
    }

    if (sessionPromises[entry.key]) {
        try {
            return await sessionPromises[entry.key];
        } catch {
            // fall through and retry below
        }
    }

    sessionPromises[entry.key] = (async () => {
        try {
            const { data: { session } } = await entry.client!.auth.getSession();
            if (session?.access_token) {
                sessionCache[entry.key] = session;
                sessionCacheTime[entry.key] = Date.now();
                return session;
            }

            delete sessionCache[entry.key];
            delete sessionCacheTime[entry.key];
            return null;
        } catch (error) {
            console.error(`Error getting auth session for ${entry.key}:`, error);
            return null;
        } finally {
            sessionPromises[entry.key] = null;
        }
    })();

    return sessionPromises[entry.key];
}

/**
 * Get authentication headers from Supabase session with caching and concurrency protection
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
    const activeClient = getActiveClient();
    const clientsToCheck = getClientSearchOrder(activeClient);

    for (const entry of clientsToCheck) {
        const session = await getSessionForClient(entry);
        if (session?.access_token) {
            return { 'Authorization': `Bearer ${session.access_token}` };
        }
    }

    for (const entry of clientsToCheck) {
        const cached = sessionCache[entry.key];
        if (cached?.access_token) {
            return { 'Authorization': `Bearer ${cached.access_token}` };
        }
    }

    return {};
}

/**
 * Get the appropriate base URL based on the endpoint
 */
export function getBaseUrl(endpoint: string): string {
    // Default to Gateway (Port 9090) for Shop & general Data
    let baseUrl = DATA_API_URL;

    // List of prefixes that should be routed to the Python Backend (Port 8000)
    const pythonPrefixes = [
        "/ai/", "ai/",
        "/assistant/", "assistant/",
        "/beeyield/", "beeyield/",
        "/hub/", "hub/",
        "/integrations/", "integrations/",
        "/bee-data",
        "/search",
        "/contact/",
        "/forms/",
        "/pollination/",
        "/forage/", "forage/",
        "/stats/",
        "/labels", "/labels/", "labels",
        "/image/",
        "/acoustic/",
        "/iot/", "iot/",
        "/traceability/", "traceability/",
        "/analytics/", "analytics/",
        "/auth/", "auth/",
        "/settings/", "settings/",
        "/inspections/", "inspections/",
        "/notes/", "notes/",
        "/requests/", "requests/",
        "/admin/", "admin/",
        "/shop/", "shop/",
        "/blog/", "blog/",
        "/meters/", "meters/",
        "/measurements/", "measurements/",
        "/reports/", "/reports", "reports/",
        "/intelligence/", "intelligence/", "intelligence"
    ];

    const isPythonBackend = pythonPrefixes.some(prefix =>
        endpoint.includes(prefix) || endpoint.startsWith(prefix)
    );

    if (isPythonBackend) {
        baseUrl = AI_API_URL;
    }

    return baseUrl;
}

// Helper function for API calls with error handling
export async function apiRequest<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const baseUrl = getBaseUrl(endpoint);

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
            const err = new Error('Invalid JSON response from server');
            (err as any).cause = e;
            throw err;
        }
    } catch (error: any) {
        if (error.name !== 'AbortError') {
            console.error(`API Error for ${endpoint}:`, error);
        }
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
    const baseUrl = getBaseUrl(endpoint);
    const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
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
