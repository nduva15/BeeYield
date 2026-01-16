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

    // Full Journey
    timeline: TraceJourneyStep[];
}

export interface SensorSnapshot {
    avg_temp?: number;
    avg_humidity?: number;
    weight_kg?: number;
    acoustic_health?: string;
    [key: string]: unknown;
}

export interface ImpactStats {
    total_honey_kg: string;
    hive_count: string;
    beekeepers: string;
    farmers_served: string;
    acres_pollinated: string;
}

// Demo data for fallback when backend is not available
const getDemoTraceData = (code: string): TraceResponse | null => {
    const upperCode = code.toUpperCase();
    const demoCodes = ["DEMO-001", "KIB-ACACIA-24", "KIB-GOLD-24"];

    if (!demoCodes.includes(upperCode)) return null;

    // Timothy Nduva - Master Beekeeper for all batches (SINGLE FARMER)
    const timothyNduva: Farmer = {
        farmer_id: "F-MAT-001",
        name: "Timothy Nduva",
        region: "Kibwezi",
        county: "Makueni",
        location_name: "Kibwezi, Makueni County",
        latitude: -2.41,
        longitude: 37.97,
        photo_url: "/timothy-nduva.png",
        story: "Timothy Nduva is a master beekeeper and conservationist in Kibwezi, leading the way in sustainable honey production. With 15 years of experience, he manages multiple apiaries across Makueni County, mentoring young beekeepers and championing the 50/50 harvest promise.",
        experience_years: 15,
        registration_date: "2020-05-15"
    };

    // Kibwezi Savannah Apiary - SINGLE APIARY for all batches
    const kibweziApiary: Apiary = {
        apiary_id: "A-KIB-01",
        apiary_code: "KIB-01",
        name: "Kibwezi Savanna Apiary",
        environment_type: "Savanna Woodland",
        flora_types: ["Acacia Tortilis", "Citrus", "Wildflowers", "Baobab"],
        location_name: "Kibwezi",
        latitude: -2.41,
        longitude: 37.97,
        region: "Eastern",
        county: "Makueni",
        established_date: "2020-05-15"
    };

    // BATCH 1: DEMO-001 - Kibwezi Wildflower Honey
    if (upperCode === "DEMO-001") {
        return {
            batch_code: "DEMO-001",
            product_name: "Kibwezi Wildflower Honey",
            verified: true,
            blockchain_verified: true,
            verification_url: "https://beeyield.com/honeychain/verify/demo-001",
            farmer: timothyNduva,
            apiary: kibweziApiary,
            hive: {
                hive_id: "H-KIB-01-01", hive_code: "KIB-01-H01", hive_type: "Langstroth",
                bee_type: "African Honey Bee (Apis mellifera scutellata)",
                installation_date: "2020-05-20", has_sensors: true,
                frame_count: 10, material: "Cedar Wood", status: "ACTIVE"
            },
            story_title: "Meet Timothy Nduva",
            story_content: "Harvested from the diverse wildflower meadows of Kibwezi, Makueni. This honey supports local biodiversity and sustainable livelihoods. Timothy's commitment to leaving 50% of honey for the bees ensures colony health year-round.",
            impact_stats: {
                total_honey_kg: "883",
                hive_count: "24",
                beekeepers: "Timothy Nduva",
                farmers_served: "12",
                acres_pollinated: "25+"
            },
            sensor_snapshot: {
                avg_temp: 34.2,
                avg_humidity: 52,
                weight_kg: 42.5,
                acoustic_health: "OPTIMAL - Healthy Queen Pattern"
            },
            timeline: [
                { title: "Origin Verified", date: "2024-01-10", location: "Kibwezi Savanna Apiary", description: "Colony health confirmed via IoT sensors. Bee population: 45,000+", icon: "Hexagon", data: {}, hash: "0xA1B2C3D4E5F6..." },
                { title: "Harvested", date: "2024-01-15", location: "Kibwezi, Makueni County", description: "Ethically harvested by Timothy Nduva. 15.5kg collected, 15.5kg left for bees (50/50 promise).", icon: "Basket", data: {}, hash: "0xF6E5D4C3B2A1..." },
                { title: "Quality Tested", date: "2024-01-17", location: "BeeYield Quality Lab", description: "Moisture: 17.2%, Purity: 100% Raw, No additives detected.", icon: "TestTube", data: {}, hash: "0x1234567890AB..." },
                { title: "Sealed on HoneyChain™", date: "2024-01-20", location: "BeeYield Blockchain Node", description: "Immutably recorded on HoneyChain™. Authenticity guaranteed forever.", icon: "Shield", data: {}, hash: "0xDEADBEEF0001..." }
            ]
        };
    }

    // BATCH 2: KIB-ACACIA-24 - Pure Acacia Honey
    if (upperCode === "KIB-ACACIA-24") {
        return {
            batch_code: "KIB-ACACIA-24",
            product_name: "Pure Acacia Honey",
            verified: true,
            blockchain_verified: true,
            verification_url: "https://beeyield.com/honeychain/verify/kib-acacia-24",
            farmer: timothyNduva,
            apiary: kibweziApiary,
            hive: {
                hive_id: "H-KIB-01-05", hive_code: "KIB-01-H05", hive_type: "Kenya Top Bar",
                bee_type: "African Honey Bee (Apis mellifera scutellata)",
                installation_date: "2021-04-01", has_sensors: true,
                frame_count: 24, material: "Local Hardwood", status: "ACTIVE"
            },
            story_title: "Meet Timothy Nduva",
            story_content: "This pure acacia honey comes from Timothy's Kibwezi Savanna Apiary in Makueni. The acacia trees thrive here, producing honey with a distinctive light color and mild taste. Each jar supports Timothy's sustainable beekeeping practices.",
            impact_stats: {
                total_honey_kg: "445",
                hive_count: "24",
                beekeepers: "Timothy Nduva",
                farmers_served: "12",
                acres_pollinated: "40+"
            },
            sensor_snapshot: {
                avg_temp: 35.1,
                avg_humidity: 48,
                weight_kg: 38.7,
                acoustic_health: "OPTIMAL - Strong Foraging Activity"
            },
            timeline: [
                { title: "Origin Verified", date: "2024-02-01", location: "Kibwezi Savanna Apiary", description: "Colony strength verified by Timothy. Acacia bloom peak season confirmed.", icon: "Hexagon", data: {}, hash: "0xACAC1A2024B1..." },
                { title: "Harvested", date: "2024-02-12", location: "Kibwezi, Makueni County", description: "Harvested by Timothy Nduva. 22kg collected, 22kg left for bees.", icon: "Basket", data: {}, hash: "0xACAC1A2024B2..." },
                { title: "Quality Tested", date: "2024-02-14", location: "BeeYield Quality Lab", description: "Moisture: 16.8%, Color: Light Amber, Crystallization Rate: Low.", icon: "TestTube", data: {}, hash: "0xACAC1A2024B3..." },
                { title: "Sealed on HoneyChain™", date: "2024-02-18", location: "BeeYield Blockchain Node", description: "Permanently recorded on HoneyChain™ blockchain. Verified authentic.", icon: "Shield", data: {}, hash: "0xACAC1A2024B4..." }
            ]
        };
    }

    // BATCH 3: KIB-GOLD-24 - Premium Golden Honey
    return {
        batch_code: "KIB-GOLD-24",
        product_name: "Premium Golden Honey",
        verified: true,
        blockchain_verified: true,
        verification_url: "https://beeyield.co.ke/honeychain/verify/kib-gold-24",
        farmer: timothyNduva,
        apiary: kibweziApiary,
        hive: {
            hive_id: "H-KIB-01-12", hive_code: "KIB-01-H12", hive_type: "Traditional Log Hive",
            bee_type: "African Honey Bee (Apis mellifera scutellata)",
            installation_date: "2019-12-15", has_sensors: true,
            frame_count: 0, material: "Hollow Mango Log (Traditional)", status: "ACTIVE"
        },
        story_title: "Meet Timothy Nduva",
        story_content: "This premium golden honey comes from Timothy's heritage hives at Kibwezi Savanna Apiary. Timothy combines ancestral beekeeping knowledge with modern IoT monitoring. This golden honey represents the best of tradition and technology.",
        impact_stats: {
            total_honey_kg: "520",
            hive_count: "24",
            beekeepers: "Timothy Nduva",
            farmers_served: "15",
            acres_pollinated: "100+"
        },
        sensor_snapshot: {
            avg_temp: 33.8,
            avg_humidity: 55,
            weight_kg: 52.3,
            acoustic_health: "EXCELLENT - Peak Production"
        },
        timeline: [
            { title: "Heritage Site Verified", date: "2024-03-01", location: "Kibwezi Savanna Apiary", description: "Traditional apiary confirmed active. Timothy's bee genetics preserved.", icon: "Hexagon", data: {}, hash: "0xG0LD24000001..." },
            { title: "Harvested", date: "2024-03-15", location: "Kibwezi, Makueni County", description: "Traditional harvest by Timothy Nduva. 28kg collected, 28kg left for bees.", icon: "Basket", data: {}, hash: "0xG0LD24000002..." },
            { title: "Quality Tested", date: "2024-03-17", location: "BeeYield Quality Lab", description: "Moisture: 17.5%, Color: Rich Golden Amber, Enzyme Activity: Very High.", icon: "TestTube", data: {}, hash: "0xG0LD24000003..." },
            { title: "Sealed on HoneyChain™", date: "2024-03-20", location: "BeeYield Blockchain Node", description: "Immutably sealed on HoneyChain™. Heritage batch certified authentic.", icon: "Shield", data: {}, hash: "0xG0LD24000004..." }
        ]
    };
};

export const traceBatch = async (code: string): Promise<TraceResponse | null> => {
    try {
        const response = await fetch(`${API_V1_URL}/traceability/code/${code}`);
        if (!response.ok) {
            if (response.status === 404) {
                // Try demo data fallback
                return getDemoTraceData(code);
            }
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch traceability data from API, trying demo fallback:", error);
        // Fallback to demo data when backend is unavailable
        const demoData = getDemoTraceData(code);
        if (demoData) {
            console.log("Using demo data for batch:", code);
            return demoData;
        }
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
