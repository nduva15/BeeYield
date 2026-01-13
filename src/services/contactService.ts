/**
 * Contact Service - Connects to Supabase
 */
import { supabase } from "@/lib/supabase";

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

import { apiPost } from "./api";

export const submitContactForm = async (data: ContactSubmission) => {
    try {
        return await apiPost<any>('/contact/submit', data);
    } catch (error) {
        console.error("Error submitting contact form via API:", error);
        throw error;
    }
};

export const submitPollinationRequest = async (data: PollinationRequest) => {
    try {
        return await apiPost<any>('/contact/pollination', data);
    } catch (error) {
        console.error("Error submitting pollination request via API:", error);
        throw error;
    }
};

export const submitNewsletterSubscription = async (data: NewsletterSubscription) => {
    try {
        return await apiPost<any>('/contact/newsletter', data);
    } catch (error) {
        console.error("Error subscribing to newsletter via API:", error);
        throw error;
    }
};

