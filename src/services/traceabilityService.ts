/**
 * Traceability Service - Powered by BeeYield Honey Trail
 */
import { AI_API_URL } from "./api";

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
    photo_url?: string;
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

export interface CompletenessSection {
    status: string;
    present: number;
    derivable: number;
    missing: number;
    fields: Record<string, string>;
}

export interface CompletenessSummary {
    status: string;
    present: number;
    derivable: number;
    missing: number;
    sections: Record<string, CompletenessSection>;
}

export interface BlockchainVerificationDetails {
    verified?: boolean;
    status?: string;
    block_hash?: string;
    tx_hash?: string;
    verification_url?: string;
    network?: string;
    on_chain_verified?: boolean;
    error?: string;
    chain_stats?: Record<string, unknown>;
}

export interface BlockchainStatus {
    overall: string;
    block_hash?: string;
    honeychain?: BlockchainVerificationDetails;
    polygon?: BlockchainVerificationDetails;
}

export interface SensorSnapshot {
    avg_temp?: number;
    avg_humidity?: number;
    weight_kg?: number;
    acoustic_health?: string;
    activity_level?: number;

    // Detailed Precision Metrics
    colony_acoustics?: string;
    acoustics_status?: string;
    brood_temp?: string;
    temp_trend?: string;
    nest_humidity?: string;
    humidity_trend?: string;
    flight_activity?: string;
    activity_status?: string;
    vibration_index?: string;
    vibration_status?: string;
    queen_pheromone?: string;
    pheromone_trend?: string;
    fob?: number;
    sync_time?: string;
    latitude?: string;
    longitude?: string;

    [key: string]: unknown;
}

export interface TraceResponse {
    batch_code: string;
    product_name: string;
    harvest_date?: string;
    quantity_kg?: number;
    quantity_left_for_bees_kg?: number;
    extraction_method?: string;
    nectar_source?: string;
    weather_conditions?: string;
    moisture_content_percent?: number;
    verified: boolean;
    blockchain_verified: boolean;
    verification_url: string;
    verification_status?: string;
    blockchain_status?: BlockchainStatus;
    completeness?: CompletenessSummary;
    sustainability?: {
        rule?: string;
        ratio?: number;
        status?: string;
    };

    // Entities
    farmer?: Farmer;
    apiary?: Apiary;
    hive?: Hive;

    // Story
    story_title: string;
    story_content: string;

    // Stats / Impact
    impact_stats?: ImpactStats;


    // Sensor Snapshot
    sensor_snapshot?: SensorSnapshot;

    // Health Snapshot
    health_snapshot?: Record<string, any>;

    // Product Details
    florage_type?: string;

    // Extra Details
    extra_metadata?: Record<string, any>;

    // Full Journey
    timeline: TraceJourneyStep[];
}

export interface ImpactStats {
    total_honey_kg: string;
    hive_count: string;
    beekeepers: string;
    farmers_served: string;
    acres_pollinated: string;
    harvested_hives?: string;
}

export interface PublicTraceabilityBatch {
    id?: string;
    batch_code: string;
    harvest_date?: string;
    honey_type?: string;
    verification_status?: string;
    blockchain_verified?: boolean;
    beekeeper_name?: string;
    farmer_name?: string;
    apiary_name?: string;
    hive?: {
        hive_code?: string;
    };
    sensor_snapshot?: {
        avg_temp?: number;
        avg_humidity?: number;
    };
    completeness?: {
        present?: number;
        missing?: number;
    };
    florage_type?: string;
    quantity_left_for_bees_kg?: number;
    sustainability?: {
        ratio?: number;
        status?: string;
    };
    farmer?: {
        name?: string;
    };
    apiary?: {
        name?: string;
    };
}

// Strict Blockchain verification enabled. Mock data generation removed.

export const traceBatch = async (code: string): Promise<TraceResponse | null> => {
    try {
        const response = await fetch(`${AI_API_URL}/traceability/code/${code}`);
        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error(`Connection Error: ${response.statusText}`);
        }

        const data = await response.json();

        // Ensure we have at least the core journey data
        if (!data.timeline || data.timeline.length === 0) {
            console.warn("Retrieved data incomplete for code:", code);
            return null;
        }

        return data;
    } catch (error) {
        console.error("Traceability verification failed:", error);
        throw error; // Let the caller handle UI notification
    }
};

export const getPublicTraceabilityBatches = async (
    limit = 12,
    options?: {
        verifiedOnly?: boolean;
        beekeeperName?: string;
        apiaryName?: string;
    }
): Promise<PublicTraceabilityBatch[]> => {
    try {
        const params = new URLSearchParams({ limit: String(limit) });
        if (options?.verifiedOnly) params.set("verified_only", "true");
        if (options?.beekeeperName) params.set("beekeeper_name", options.beekeeperName);
        if (options?.apiaryName) params.set("apiary_name", options.apiaryName);

        const response = await fetch(`${AI_API_URL}/traceability/batches?${params.toString()}`);
        if (!response.ok) {
            throw new Error(`Connection Error: ${response.statusText}`);
        }

        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Error fetching public traceability batches:", error);
        return [];
    }
};

export const getImpactStats = async (): Promise<ImpactStats | null> => {
    try {
        const response = await fetch(`${AI_API_URL}/stats/impact`);
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
        const response = await fetch(`${AI_API_URL}/traceability/chain`);
        if (!response.ok) {
            throw new Error("Failed to fetch blockchain status");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching blockchain status:", error);
        return null;
    }
};
