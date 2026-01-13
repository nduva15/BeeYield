import { createServerFn } from '@tanstack/react-start/server'
import { TraceResponse } from '@/services/traceabilityService'

// Define runtime environment variable access for the server
// This works because this code only runs on the server
const getApiBaseUrl = () => {
    return process.env.VITE_API_URL || 'http://localhost:8000/api/v1'
}

export const traceBatchFn = createServerFn({ method: "GET" })
    .validator((code: string) => code)
    .handler(async ({ data: code }): Promise<TraceResponse | null> => {
        const API_V1_URL = getApiBaseUrl()

        try {
            console.log(`Server Function: Tracing batch ${code} at ${API_V1_URL}`)
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
