/**
 * API Configuration for BeeYield Frontend
 * Centralizes all API endpoint configuration
 */

// Use relative path to leverage the Vite proxy (defined in vite.config.ts)
// This will work both in development (proxying to :8000) and production (if served from same origin)
// Use environment variable for the API base URL, fallback to empty string (same origin)
const rawBaseUrl = (import.meta.env.VITE_API_URL as string) || "";
export const API_BASE_URL = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

// Ensure we don't double the /api/v1 part if it's already in VITE_API_URL
export const API_V1_URL = API_BASE_URL.includes("/api/v1")
    ? API_BASE_URL
    : `${API_BASE_URL}/api/v1`;

// Helper function for API calls with error handling
export async function apiRequest<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const url = `${API_V1_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options?.headers,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `API Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`API Error for ${endpoint}:`, error);
        throw error;
    }
}

// GET request helper
export async function apiGet<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
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
    return apiRequest<T>(url, { method: "GET" });
}

// POST request helper
export async function apiPost<T>(endpoint: string, data: unknown): Promise<T> {
    return apiRequest<T>(endpoint, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

// PUT request helper
export async function apiPut<T>(endpoint: string, data: unknown): Promise<T> {
    return apiRequest<T>(endpoint, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

// DELETE request helper
export async function apiDelete<T>(endpoint: string): Promise<T> {
    return apiRequest<T>(endpoint, { method: "DELETE" });
}
