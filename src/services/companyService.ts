const API_URL = "http://localhost:8000/api/v1";

export interface CompanyValue {
    title: string;
    description: string;
    icon?: string;
}

export interface CompanyStat {
    label: string;
    value: string;
    icon?: string;
}

export interface CompanyInfo {
    name: string;
    tagline: string;
    mission: string;
    vision: string;
    description: string;
    location: string;
    founded_year: number;
    origin_story: string[];
    values: CompanyValue[];
    stats: CompanyStat[];
    social_links: {
        twitter?: string;
        linkedin?: string;
        instagram?: string;
        facebook?: string;
    };
    contact_email: string;
    contact_phone: string;
}

export interface TeamMember {
    id: string;
    name: string;
    role: string;
    description?: string;
    image: string;
    linkedin?: string;
}

export interface TeamData {
    founders: TeamMember[];
    board: TeamMember[];
    technical: TeamMember[];
    operations?: TeamMember[];
}

export interface Milestone {
    id: string;
    year: number;
    title: string;
    description: string;
    type: string;
}

export interface CompanyStory {
    title: string;
    subtitle: string;
    intro: string;
    founders_message: string;
    milestones: Milestone[];
}

export interface AboutPageData {
    info: CompanyInfo;
    story: CompanyStory;
    stats: CompanyStat[];
    team: TeamData;
}

export const getCompanyInfo = async (): Promise<CompanyInfo | null> => {
    try {
        const response = await fetch(`${API_URL}/company/info`);
        if (!response.ok) throw new Error("Failed to fetch company info");
        return await response.json();
    } catch (error) {
        console.error("Error fetching company info:", error);
        return null;
    }
};

export const getTeam = async (): Promise<TeamData | null> => {
    try {
        const response = await fetch(`${API_URL}/company/team`);
        if (!response.ok) throw new Error("Failed to fetch team data");
        return await response.json();
    } catch (error) {
        console.error("Error fetching team data:", error);
        return null;
    }
};

export const getAboutPageData = async (): Promise<AboutPageData | null> => {
    try {
        const response = await fetch(`${API_URL}/company/about`);
        if (!response.ok) throw new Error("Failed to fetch about page data");
        return await response.json();
    } catch (error) {
        console.error("Error fetching about page data:", error);
        return null;
    }
};
