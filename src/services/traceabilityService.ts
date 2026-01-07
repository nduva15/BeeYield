/**
 * Traceability Service - Powered by BeeYield HoneyChain
 */
import { API_V1_URL } from "./api";

export interface Location {
    latitude: number;
    longitude: number;
    location_name: string;
    region: string;
    county: string;
}

export interface Farmer extends Location {
    farmer_id: string;
    name: string;
    phone?: string;
    experience_years: number;
    story: string;
    registration_date: string;
}

export interface Apiary extends Location {
    apiary_id: string;
    apiary_code: string;
    name: string;
    environment_type: string;
    flora_types: string[];
    water_source?: string;
    established_date: string;
}

export interface Hive {
    hive_id: string;
    hive_code: string;
    hive_type: string;
    bee_type: string;
    queen_type?: string;
    frame_count: number;
    material: string;
    has_sensors: boolean;
    installation_date: string;
    status: string;
}

export interface TraceJourneyStep {
    title: string;
    date: string;
    location: string;
    description: string;
    icon: string;
    data: Record<string, unknown>;
    hash?: string;
}

export interface TraceResponse {
    batch_code: string;
    product_name: string;
    verified: boolean;
    blockchain_verified: boolean;
    verification_url: string;

    // Entities
    farmer?: Farmer;
    apiary?: Apiary;
    hive?: Hive;

    // Story
    story_title: string;
    story_content: string;

    // Stats / Impact
    impact_stats: Record<string, unknown>;

    // Sensor Snapshot
    sensor_snapshot?: Record<string, unknown>;

    // Full Journey
    timeline: TraceJourneyStep[];
}

export interface ImpactStats {
    total_honey_kg: string;
    hive_count: string;
    beekeepers: string;
    farmers_served: string;
    acres_pollinated: string;
}

export const traceBatch = async (code: string): Promise<TraceResponse | null> => {
    try {
        const response = await fetch(`${API_V1_URL}/traceability/code/${code}`);
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

export const getImpactStats = async (): Promise<ImpactStats | null> => {
    try {
        const response = await fetch(`${API_V1_URL}/stats/impact`);
        if (!response.ok) {
            throw new Error("Failed to fetch impact stats");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching impact stats:", error);
        return null;
    }
};

export const getBlockchainStatus = async (): Promise<unknown> => {
    try {
        const response = await fetch(`${API_V1_URL}/traceability/chain`);
        if (!response.ok) {
            throw new Error("Failed to fetch blockchain status");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching blockchain status:", error);
        return null;
    }
};
