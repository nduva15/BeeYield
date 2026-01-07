/* 
  Traceability Service
  Connects frontend to Python Backend.
*/

export interface TraceJourney {
    hive: {
        code: string;
        location: string;
        coordinates: string;
        environment: string;
    };
    harvest: {
        date: string;
        beekeeper: string;
        quantity: string;
        method: string;
    };
}

export interface TraceResponse {
    batch_id: string;
    verified: boolean;
    blockchain_verified: boolean;
    journey: TraceJourney;
    beekeeper_story?: string;
    impact?: {
        farmers_supported: number;
    };
}

const API_URL = "http://localhost:8000/api/v1";

export const traceBatch = async (code: string): Promise<TraceResponse | null> => {
    try {
        const response = await fetch(`${API_URL}/traceability/code/${code}`);
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch traceability data:", error);
        return null;
    }
};
