/**
 * Contact Service - Connects to Secure Backend API
 */
import { apiPost } from "./api";

export interface ContactSubmission {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    country: string;
    inquiry_type: "grower" | "beekeeper" | "general" | "diseases" | "In-Land Technology" | "In-Hive Technology";
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
        return await apiPost<{ status: string; message: string }>("/contact/submit", data);
    } catch (error) {
        console.error("Error submitting contact form:", error);
        throw error;
    }
};

export const submitPollinationRequest = async (data: PollinationRequest) => {
    try {
        return await apiPost<{ status: string; message: string }>("/contact/pollination", data);
    } catch (error) {
        console.error("Error submitting pollination request:", error);
        throw error;
    }
};

export const submitNewsletterSubscription = async (data: NewsletterSubscription) => {
    try {
        return await apiPost<{ status: string; message: string }>("/contact/newsletter", data);
    } catch (error) {
        console.error("Error subscribing to newsletter:", error);
        throw error;
    }
};
