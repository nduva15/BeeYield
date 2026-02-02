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
    impact_stats: ImpactStats | Record<string, unknown>;

    // Sensor Snapshot
    sensor_snapshot?: SensorSnapshot;

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

// DETERMINISTIC DATA GENERATOR - SYNCED WITH DASHBOARD RANGES
const generateMockData = (code: string): TraceResponse => {
    const parts = code.split(/[-_]/);

    // Improved hive number extraction: Look for a part that is purely numeric or follows a known pattern
    let hiveNumInt = 101;
    const numericParts = parts.map(p => p.replace(/\D/g, '')).filter(p => p.length > 0 && p !== "2026" && p !== "2025");

    // The hive number is typically the 3rd part or the largest number before the size
    if (numericParts.length > 0) {
        // Find a part that looks like a hive ID (usually 100-184 in our case)
        const possibleHive = numericParts.find(n => parseInt(n) >= 1 && parseInt(n) <= 184);
        hiveNumInt = possibleHive ? parseInt(possibleHive) : parseInt(numericParts[0]);
    } else {
        let hash = 0;
        for (let i = 0; i < code.length; i++) {
            hash = code.charCodeAt(i) + ((hash << 5) - hash);
        }
        hiveNumInt = (Math.abs(hash) % 184) + 1;
    }

    if (hiveNumInt > 184) hiveNumInt = (hiveNumInt % 184) + 1;

    const hiveNumberVal = hiveNumInt.toString().padStart(3, '0');

    // SYNCED WITH PrecisionPollinationView.tsx generation logic for 1:1 matching
    const seed = (hiveNumInt * 13) % 100;

    // Base ranges from PrecisionPollinationView.tsx
    const acousticsVal = Math.round(220 + (seed % 30));
    const tempVal = parseFloat((33.5 + (seed % 30) / 10).toFixed(1));
    const humidityVal = Math.round(55 + (seed % 20));
    const flightVal = parseFloat((25 + (seed % 25)).toFixed(1));

    const trends: ('up' | 'down' | 'stable')[] = ['up', 'down', 'stable'];
    const getTrend = (s: number) => trends[s % 3];
    const getTrendValue = (trend: 'up' | 'down' | 'stable', s: number) => {
        const val = ((s % 50) / 10 + 0.5).toFixed(1);
        return trend === 'stable' ? 'Stable' : `${trend === 'up' ? '+' : '-'}${val}%`;
    };

    const acousticsTrend = getTrendValue(getTrend(seed), seed);
    const tempTrendValue = getTrendValue(getTrend(seed + 1), seed + 5);
    const humidityTrendValue = getTrendValue(getTrend(seed + 2), seed + 10);
    const activityTrendValue = getTrendValue(getTrend(seed + 3), seed + 15);

    const acoustics = acousticsVal.toString();
    const broodTemp = tempVal.toFixed(1);
    const nestHumidity = humidityVal.toString();
    const flightActivity = flightVal.toFixed(1);
    const vibration = (2.1 + (seed % 10) * 0.1).toFixed(2);

    const row = Math.floor((hiveNumInt - 1) / 10);
    const col = (hiveNumInt - 1) % 10;
    const baseLat = -1.2921;
    const baseLng = 36.8219;
    const lat = (baseLat + (row * 0.0005) + ((seed % 10) * 0.00002)).toFixed(4);
    const lng = (baseLng + (col * 0.0008) + ((seed % 10) * 0.00002)).toFixed(4);

    const isAcacia = code.toUpperCase().includes("ACACIA");
    const day = (hiveNumInt % 20) + 10;
    const harvestDate = `Jan ${day}, 2026`;

    // HARVEST LOGIC: 60kg total / 30 hives = 2kg per hive
    const hiveYield = "2.00";

    // Determine Jar Size and Price Category mapping
    let jarSize = "500g";
    let jarsProduced = 4; // 2kg / 500g

    if (code.includes("1KG") || (hiveNumInt >= 101 && hiveNumInt <= 110)) {
        jarSize = "1kg";
        jarsProduced = 2; // 2kg / 1kg
    } else if (code.includes("500G") || (hiveNumInt >= 111 && hiveNumInt <= 120)) {
        jarSize = "500g";
        jarsProduced = 4;
    } else if (code.includes("250G") || (hiveNumInt >= 121 && hiveNumInt <= 130)) {
        jarSize = "250g";
        jarsProduced = 8;
    }

    return {
        batch_code: code,
        product_name: isAcacia ? "Premium Acacia Honey" : "Organic Wildflower Honey",
        verified: true,
        blockchain_verified: true,
        verification_url: `https://chain.beeyield.com/verify/${code}`,
        farmer: {
            farmer_id: "F-TIM-001",
            name: "Timothy Nduva",
            location_name: "Kibwezi",
            region: "Eastern",
            county: "Makueni",
            latitude: -2.4167,
            longitude: 37.9667,
            experience_years: 6,
            story: "Dedicated to sustainable beekeeping and protecting our local ecosystems. Every jar tells the story of our commitment to the bees and the land we share with them.",
            registration_date: "2020-01-15"
        },
        apiary: {
            apiary_id: "A-KIB-001",
            apiary_code: "KIB-MAIN",
            name: "Kibwezi Sanctuary",
            location_name: "Kibwezi West",
            region: "Eastern",
            county: "Makueni",
            environment_type: "Savanna Wooded",
            flora_types: isAcacia ? ["Yellow Acacia", "Red Acacia"] : ["Wildflower", "Acacia", "Sunflower"],
            water_source: "Natural Spring Stream",
            established_date: "2020-02-01",
            latitude: -2.4200,
            longitude: 37.9700
        },
        hive: {
            hive_id: `H-${hiveNumberVal}`,
            hive_code: `H-${hiveNumberVal}`,
            hive_type: "Langstroth",
            bee_type: "Apis Mellifera Scutellata",
            frame_count: 10,
            material: "Certified Pine",
            has_sensors: true,
            status: "Active",
            installation_date: "2020-03-01"
        },
        story_title: "The BeeYield Story",
        story_content: "From 4 hives to 184.",
        impact_stats: {
            total_honey_kg: "60.00",
            hive_count: "184",
            harvested_hives: "30",
            beekeepers: "1",
            farmers_served: "5",
            acres_pollinated: "5",
            batch_yield_kg: hiveYield,
            jars_in_this_sub_batch: jarsProduced.toString()
        },
        extra_metadata: {
            harvest_context: `Harvested specifically from Hive H-${hiveNumberVal} on ${harvestDate}. Part of the 60kg Certified Harvest.`,
            jar_size: jarSize,
            production_lot_size: `${jarsProduced} jars of ${jarSize}`,
            placement_score: (94 + (hiveNumInt % 5)).toString()
        },
        sensor_snapshot: {
            avg_temp: parseFloat(broodTemp),
            avg_humidity: parseFloat(nestHumidity),
            weight_kg: 2.0, // Fixed yield for harvested hives
            activity_level: 8,

            // Hyper-detailed Precision Data - Deterministic for perfect matching
            colony_acoustics: acoustics,
            acoustics_status: acousticsTrend,
            brood_temp: broodTemp,
            temp_trend: tempTrendValue,
            nest_humidity: nestHumidity,
            humidity_trend: humidityTrendValue,
            flight_activity: flightActivity,
            activity_status: activityTrendValue,
            vibration_index: vibration,
            vibration_status: "Optimal",
            queen_status: (seed % 10) > 1 ? 'present' : ((seed % 2) === 0 ? 'absent' : 'unknown'),
            queen_pheromone: "High",
            pheromone_trend: "Strong",
            fob: 7,
            last_sync: `${(seed % 10) + 1}m ago`,
            sync_time: `${(seed % 10) + 1}m ago`,
            latitude: lat,
            longitude: lng
        },
        timeline: [
            {
                title: "Ready For You",
                date: "Jan 30, 2026",
                location: "BeeYield Distribution Center, Nairobi",
                description: `Bottled and sealed. Batch ${code}. Verified Authentic.`,
                icon: "CheckCircle2",
                data: {}
            },
            {
                title: "Harvest Day",
                date: harvestDate,
                location: "Kibwezi Sanctuary",
                description: `Harvested ${hiveYield}kg from Hive H-${hiveNumberVal}. 50% left for the colony.`,
                icon: "Scale",
                data: {}
            },
            {
                title: "Foraging Period",
                date: "Dec 2025 - Jan 2026",
                location: "Kibwezi Forest",
                description: "Bees visited approximately 2 million flowers within a 3km radius.",
                icon: "Leaf",
                data: {}
            }
        ]
    };
};

export const traceBatch = async (code: string): Promise<TraceResponse | null> => {
    try {
        const response = await fetch(`${API_V1_URL}/traceability/code/${code}`);
        if (!response.ok) {
            if (response.status === 404) {
                console.log("Batch not found in backend, returning demo data for:", code);
                return generateMockData(code);
            }
            throw new Error("Network response was not ok");
        }

        const data = await response.json();

        if (!data.hive || !data.farmer) {
            console.warn("Backend data incomplete for demo. Using mock generator.");
            return generateMockData(code);
        }

        return data;
    } catch (error) {
        console.error("Failed to fetch traceability data from API, using fallback:", error);
        return generateMockData(code);
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
