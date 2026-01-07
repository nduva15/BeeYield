/**
 * Company Service - Connects to Python Backend
 */
import { API_V1_URL } from "./api";

export interface CompanyInfo {
    name: string;
    tagline: string;
    mission: string;
    vision: string;
    description: string;
    founded_year: number;
    values: {
        title: string;
        description: string;
        icon: string;
    }[];
    social_links: {
        twitter?: string;
        linkedin?: string;
        instagram?: string;
        facebook?: string;
    };
}

export interface TeamMember {
    id: string;
    name: string;
    role: string;
    description?: string;
    bio?: string;
    image: string;
    image_url?: string; // Backend uses image_url
    linkedin_url?: string;
    linkedin?: string; // Frontend uses linkedin
}

export interface CompanyStory {
    title: string;
    subtitle: string;
    intro: string;
    founders_message: string;
    milestones: {
        id: string;
        year: number;
        title: string;
        description: string;
        type: string;
    }[];
}

export interface CompanyStat {
    id: string;
    stat_key: string;
    stat_value: string;
    stat_label: string;
    icon: string;
    category: string;
}

export interface ImpactStory {
    id: string;
    title: string;
    slug: string;
    summary: string;
    content: string;
    impact_type: string;
    image_url?: string;
    beneficiaries_count?: number;
}

export interface AboutPageData {
    company_info: CompanyInfo;
    story: CompanyStory;
    stats: CompanyStat[];
    leadership_team: TeamMember[];
    info?: any; // For fallback compatibility in About.tsx
}

export interface TeamData {
    founders: TeamMember[];
    board: TeamMember[];
    technical: TeamMember[];
}

export const getCompanyInfo = async (): Promise<CompanyInfo | null> => {
    try {
        const response = await fetch(`${API_V1_URL}/company/info`);
        if (!response.ok) throw new Error("Failed to fetch company info");
        return await response.json();
    } catch (error) {
        console.error("Error fetching company info:", error);
        return null;
    }
};

export const getTeamMembers = async (): Promise<TeamMember[]> => {
    try {
        const response = await fetch(`${API_V1_URL}/company/team`);
        if (!response.ok) throw new Error("Failed to fetch team members");
        return await response.json();
    } catch (error) {
        console.error("Error fetching team members:", error);
        return [];
    }
};

// Alias for Team.tsx
export const getTeam = async (): Promise<TeamData | null> => {
    try {
        const members = await getTeamMembers();
        if (!members) return null;

        return {
            founders: members.filter(m => m.role.toLowerCase().includes('founder') || m.id.includes('team-')),
            board: [], // Backend doesn't distinguish board members yet in this endpoint
            technical: []
        };
    } catch (error) {
        console.error("Error fetching team:", error);
        return null;
    }
};

export const getCompanyStory = async (): Promise<CompanyStory | null> => {
    try {
        const response = await fetch(`${API_V1_URL}/company/story`);
        if (!response.ok) throw new Error("Failed to fetch story");
        return await response.json();
    } catch (error) {
        console.error("Error fetching story:", error);
        return null;
    }
};

export const getCompanyStats = async (category?: string): Promise<CompanyStat[]> => {
    try {
        let url = `${API_V1_URL}/company/stats`;
        if (category) {
            url += `?category=${category}`;
        }
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch stats");
        return await response.json();
    } catch (error) {
        console.error("Error fetching stats:", error);
        return [];
    }
};

export const getAboutPageData = async (): Promise<AboutPageData | null> => {
    try {
        const response = await fetch(`${API_V1_URL}/company/about`);
        if (!response.ok) throw new Error("Failed to fetch about page data");
        const data = await response.json();

        // Add compatibility mapping for About.tsx
        return {
            ...data,
            info: {
                name: data.company_info.name,
                description: data.company_info.description,
                mission: data.company_info.mission,
                location: data.company_info.headquarters,
                origin_story: [data.story.intro],
                stats: data.stats.map((s: any) => ({ value: s.stat_value, label: s.stat_label })),
                values: data.company_info.values || []
            }
        };
    } catch (error) {
        console.error("Error fetching about page data:", error);
        return null;
    }
};

export const getImpactStories = async (): Promise<ImpactStory[]> => {
    try {
        const response = await fetch(`${API_V1_URL}/services/impact/stories`);
        if (!response.ok) throw new Error("Failed to fetch impact stories");
        return await response.json();
    } catch (error) {
        console.error("Error fetching impact stories:", error);
        return [];
    }
};
