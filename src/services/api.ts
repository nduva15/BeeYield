import { supabase } from '@/lib/supabase';

// Use environment variable for the API base URL
const isDev = import.meta.env.DEV;
const rawBaseUrl = (import.meta.env.VITE_API_URL as string) || (isDev ? "http://localhost:8000/api/v1" : "/api/v1");
export const API_BASE_URL = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

// Ensure we have /api/v1 path
export const API_V1_URL = API_BASE_URL.includes("/api/v1")
    ? API_BASE_URL
    : `${API_BASE_URL}/api/v1`;

/**
 * Get authentication headers from Supabase session
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
    if (!supabase) return {};

    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
            return {
                'Authorization': `Bearer ${session.access_token}`
            };
        }
    } catch (error) {
        console.error('Error getting auth headers:', error);
    }
    return {};
}

// Helper function for API calls with error handling
export async function apiRequest<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${API_V1_URL}${endpoint}`;

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
