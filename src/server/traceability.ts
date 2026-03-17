import { createServerFn } from '@tanstack/react-start'

// Define runtime environment variable access for the server
// This works because this code only runs on the server
const getApiBaseUrl = () => {
    return process.env.VITE_API_URL || 'http://localhost:8000/api/v1'
}

export const traceBatchFn = createServerFn({ method: "GET" })
    .inputValidator((code: string) => code)
    .handler(async ({ data: code }) => {
        const API_V1_URL = getApiBaseUrl()

        try {
            const response = await fetch(`${API_V1_URL}/traceability/code/${code}`)

            if (!response.ok) {
                if (response.status === 404) return null
                throw new Error("Network response was not ok")
            }

            const data = await response.json()
            return data
        } catch (error) {
            console.error("Failed to fetch traceability data on server:", error)
            // In a real app you might want to throw or return specific error states
            throw error
        }
    })
