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

export const submitContactForm = async (data: ContactSubmission) => {
    if (!supabase) {
        throw new Error("Supabase client is not initialized");
    }

    try {
        const { error } = await supabase
            .from("contact_submissions")
            .insert([data]);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Error submitting contact form:", error);
        throw error;
    }
};

export const submitPollinationRequest = async (data: PollinationRequest) => {
    if (!supabase) {
        throw new Error("Supabase client is not initialized");
    }

    try {
        const { error } = await supabase
            .from("pollination_requests")
            .insert([data]);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Error submitting pollination request:", error);
        throw error;
    }
};

export const submitNewsletterSubscription = async (data: NewsletterSubscription) => {
    if (!supabase) {
        throw new Error("Supabase client is not initialized");
    }

    try {
        // Check if already subscribed
        const { data: existing } = await supabase
            .from("newsletter_subscribers")
            .select("email")
            .eq("email", data.email)
            .single();

        if (existing) {
            return { status: "success", message: "Already subscribed" };
        }

        const { error } = await supabase
            .from("newsletter_subscribers")
            .insert([data]);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Error subscribing to newsletter:", error);
        throw error;
    }
};

