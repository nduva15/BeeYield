/**
 * Contact Service - Connects to Python Backend
 */
import { API_V1_URL } from "./api";

export interface ContactSubmission {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    country: string;
    inquiry_type: "grower" | "beekeeper" | "general";
    company?: string;
    farm_name?: string;
    apiary_name?: string;
    crop_type?: string;
    acres?: number;
    hive_count?: number;
    experience_years?: string;
    topic: string;
    message?: string;
}

export interface PollinationRequest {
    full_name: string;
    email: string;
    phone: string;
    farm_name: string;
    farm_location: string;
    crop_type: string;
    acres: number;
    preferred_start_date: string;
    additional_info?: string;
}

export interface NewsletterSubscription {
    email: string;
    first_name?: string;
    source?: string;
}

export const submitContactForm = async (data: ContactSubmission) => {
    try {
        const payload = {
            ...data,
            company: data.company
        };

        const response = await fetch(`${API_V1_URL}/contact/submit`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Failed to submit contact form");
        }
        return await response.json();
    } catch (error) {
        console.error("Error submitting contact form:", error);
        throw error;
    }
};

export const submitPollinationRequest = async (data: PollinationRequest) => {
    try {
        const response = await fetch(`${API_V1_URL}/contact/pollination`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Failed to submit pollination request");
        }
        return await response.json();
    } catch (error) {
        console.error("Error submitting pollination request:", error);
        throw error;
    }
};

export const submitNewsletterSubscription = async (data: NewsletterSubscription) => {
    try {
        const response = await fetch(`${API_V1_URL}/contact/newsletter`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Failed to subscribe to newsletter");
        }
        return await response.json();
    } catch (error) {
        console.error("Error subscribing to newsletter:", error);
        throw error;
    }
};
