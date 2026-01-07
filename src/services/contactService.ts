const API_URL = "http://localhost:8000/api/v1";

export interface ContactSubmission {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    country: string;
    inquiry_type: "grower" | "beekeeper" | "general";
    company_name?: string;
    farm_name?: string;
    apiary_name?: string;
    crop_type?: string;
    acres?: number;
    hive_count?: number;
    experience_years?: string;
    topic?: string;
    message?: string;
}

export const submitContactForm = async (data: ContactSubmission) => {
    try {
        const response = await fetch(`${API_URL}/contact/submit`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error("Failed to submit contact form");
        }
        return await response.json();
    } catch (error) {
        console.error("Error submitting contact form:", error);
        throw error;
    }
};

export const submitPollinationRequest = async (data: any) => {
    try {
        const response = await fetch(`${API_URL}/contact/pollination`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error("Failed to submit pollination request");
        }
        return await response.json();
    } catch (error) {
        console.error("Error submitting pollination request:", error);
        throw error;
    }
};
