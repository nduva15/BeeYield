/**
 * Services Service - Connects to Python Backend for Pollination, Learning, and ESG
 */
import { API_V1_URL } from "./api";

export interface PollinationService {
    id: string;
    name: string;
    slug: string;
    description: string;
    short_description: string;
    features: string[];
    benefits: string[];
}

export interface Crop {
    id: string;
    name: string;
    description: string;
    image_url?: string;
    slug: string;
}

export interface LearningModule {
    id: string;
    title: string;
    slug: string;
    description: string;
    category: string;
    difficulty_level: string;
    is_free: boolean;
    lessons: unknown[];
}

export interface ESGMetric {
    id: string;
    metric_key: string;
    metric_name: string;
    metric_value: number;
    metric_unit: string;
    category: string;
}

export interface Apiary {
    id: string;
    apiary_id: string;
    name: string;
    location_name: string;
    region: string;
    latitude: number;
    longitude: number;
    hive_count: number;
    image_url?: string;
}

export const getPollinationServices = async (): Promise<PollinationService[]> => {
    try {
        const response = await fetch(`${API_V1_URL}/services/pollination`);
        if (!response.ok) throw new Error("Failed to fetch pollination services");
        return await response.json();
    } catch (error) {
        console.error("Error fetching pollination services:", error);
        return [];
    }
};

export const getCrops = async (): Promise<Crop[]> => {
    try {
        const response = await fetch(`${API_V1_URL}/services/crops`);
        if (!response.ok) throw new Error("Failed to fetch crops");
        return await response.json();
    } catch (error) {
        console.error("Error fetching crops:", error);
        return [];
    }
};

export const getLearningModules = async (category?: string): Promise<LearningModule[]> => {
    try {
        let url = `${API_V1_URL}/services/learning/modules`;
        if (category) url += `?category=${category}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch learning modules");
        return await response.json();
    } catch (error) {
        console.error("Error fetching learning modules:", error);
        return [];
    }
};

export const getESGMetrics = async (): Promise<ESGMetric[]> => {
    try {
        const response = await fetch(`${API_V1_URL}/services/esg/metrics`);
        if (!response.ok) throw new Error("Failed to fetch ESG metrics");
        return await response.json();
    } catch (error) {
        console.error("Error fetching ESG metrics:", error);
        return [];
    }
};

export interface SDG {
    id: string;
    number: number;
    title: string;
    description: string;
    impact: string;
    color: string;
    icon: string;
}

export interface ESGPillar {
    id: string;
    name: string;
    description: string;
    icon: string;
    metrics: string[];
}

export const getApiaries = async (): Promise<Apiary[]> => {
    try {
        const response = await fetch(`${API_V1_URL}/services/apiaries`);
        if (!response.ok) throw new Error("Failed to fetch apiaries");
        return await response.json();
    } catch (error) {
        console.error("Error fetching apiaries:", error);
        return [];
    }
};

export const getESGPillars = async (): Promise<ESGPillar[]> => {
    try {
        const response = await fetch(`${API_V1_URL}/services/esg/pillars`);
        if (!response.ok) throw new Error("Failed to fetch ESG pillars");
        return await response.json();
    } catch (error) {
        console.error("Error fetching ESG pillars:", error);
        return [];
    }
};

export const getImpactStories = async (): Promise<unknown[]> => {
    try {
        const response = await fetch(`${API_V1_URL}/services/impact/stories`);
        if (!response.ok) throw new Error("Failed to fetch impact stories");
        return await response.json();
    } catch (error) {
        console.error("Error fetching impact stories:", error);
        return [];
    }
};

export const getSDGs = async (): Promise<SDG[]> => {
    try {
        const response = await fetch(`${API_V1_URL}/services/impact/sdgs`);
        if (!response.ok) throw new Error("Failed to fetch SDGs");
        return await response.json();
    } catch (error) {
        console.error("Error fetching SDGs:", error);
        return [];
    }
};
