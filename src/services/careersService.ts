/**
 * Careers Service - Connects to Python Backend
 */
import { API_V1_URL } from "./api";

export interface JobListing {
    id: string;
    title: string;
    slug: string;
    department?: string;
    location: string;
    job_type: string;
    description: string;
    requirements?: string[];
    benefits?: string[];
    salary_range?: string;
    is_active: boolean;
    posted_date: string;
    closing_date?: string;
}

export interface JobApplication {
    job_id: string;
    full_name: string;
    email: string;
    phone?: string;
    cover_letter?: string;
    linkedin_url?: string;
    portfolio_url?: string;
    experience_years?: number;
    resume?: File;
}

export const getJobListings = async (): Promise<JobListing[]> => {
    try {
        const response = await fetch(`${API_V1_URL}/careers/`);
        if (!response.ok) throw new Error("Failed to fetch job listings");
        return await response.json();
    } catch (error) {
        console.error("Error fetching job listings:", error);
        return [];
    }
};

export const getJobBySlug = async (slug: string): Promise<JobListing | null> => {
    try {
        const response = await fetch(`${API_V1_URL}/careers/${slug}`);
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error("Failed to fetch job");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching job:", error);
        return null;
    }
};

export const applyForJob = async (application: JobApplication): Promise<{ status: string; message: string }> => {
    try {
        const formData = new FormData();
        formData.append("job_id", application.job_id);
        formData.append("full_name", application.full_name);
        formData.append("email_address", application.email);

        if (application.phone) formData.append("phone", application.phone);
        if (application.cover_letter) formData.append("cover_letter", application.cover_letter);
        if (application.linkedin_url) formData.append("linkedin_url", application.linkedin_url);
        if (application.portfolio_url) formData.append("portfolio_url", application.portfolio_url);
        if (application.experience_years) formData.append("experience_years", String(application.experience_years));
        if (application.resume) formData.append("resume", application.resume);

        const response = await fetch(`${API_V1_URL}/careers/apply`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Failed to submit application");
        }
        return await response.json();
    } catch (error) {
        console.error("Error applying for job:", error);
        throw error;
    }
};
