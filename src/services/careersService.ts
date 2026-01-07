const API_URL = "http://localhost:8000/api/v1";

export interface JobListing {
    id: string;
    title: string;
    slug: string;
    location: string;
    type: string;
    department?: string;
    description: string;
    is_active: boolean;
    posted_date: string;
}

export const getJobListings = async (): Promise<JobListing[]> => {
    try {
        const response = await fetch(`${API_URL}/careers/`);
        if (!response.ok) throw new Error("Failed to fetch job listings");
        return await response.json();
    } catch (error) {
        console.error("Error fetching job listings:", error);
        return [];
    }
};
