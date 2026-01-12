/**
 * API Configuration for BeeYield Frontend
 * Centralizes all API endpoint configuration
 */

// Use environment variable for the API base URL
// In development with Vite proxy: use relative path "/api/v1"
// In production: use the full URL from environment
// Use environment variable for the API base URL
// In development with Vite proxy: use relative path "/api/v1"
// In production: use the full URL from environment
const isDev = import.meta.env.DEV;
const rawBaseUrl = (import.meta.env.VITE_API_URL as string) || (isDev ? "http://localhost:8000/api/v1" : "/api/v1");
export const API_BASE_URL = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

// Ensure we have /api/v1 path
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
            let errorData: any = {};
            const text = await response.text();
            try {
                errorData = JSON.parse(text);
            } catch (e) {
                // If JSON parse fails, it might be HTML or empty
                console.error("Non-JSON error response from server:", text.substring(0, 200));
                errorData = { detail: `API Error ${response.status}: ${response.statusText}. The server returned HTML instead of JSON. Please ensure the backend is running.` };
            }
            throw new Error(errorData.detail || `API Error: ${response.status}`);
        }

        const responseText = await response.text();
        try {
            return JSON.parse(responseText);
        } catch (e: any) {
            console.error("Failed to parse JSON response:", responseText.substring(0, 200));
            throw new Error(`Connection Error: The server returned an invalid response (HTML). Please check if the backend is running at ${API_V1_URL}. Technical: ${e.message}`);
        }
    } catch (error: any) {
        console.error(`API Error for ${endpoint}:`, error);
        // Better error message for common JSON parse error (HTML returned)
        if (error.message?.includes("Unexpected token") || error.message?.includes("not valid JSON")) {
            throw new Error(`Connection Error: The server returned an invalid response (HTML). Please check if the backend is running at ${API_V1_URL}.`);
        }
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
