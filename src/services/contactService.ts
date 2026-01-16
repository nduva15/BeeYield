/**
 * Contact Service - Connects directly to Supabase
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
        throw new Error("Supabase client not initialized. Check environment variables.");
    }
    try {
        // Construct a summary message for the 'message' column as a fallback/summary
        const summaryMessage = `
Type: ${data.inquiry_type.toUpperCase()}
Topic: ${data.topic}
${data.message ? `Message: ${data.message}` : ''}
        `.trim();

        const { error } = await supabase.from('contact_submissions').insert({
            // Standard contact fields
            first_name: data.first_name,
            last_name: data.last_name,
            name: `${data.first_name} ${data.last_name}`,
            email: data.email,
            phone: data.phone,
            city: data.city,
            state: data.state,
            country: data.country,

            // Inquiry metadata
            inquiry_type: data.inquiry_type,
            topic: data.topic,
            subject: `${data.inquiry_type.toUpperCase()}: ${data.topic}`,
            message: data.message || summaryMessage, // Use specific message or summary

            // Specific fields
            company: data.company || null,
            farm_name: data.farm_name || null,
            crop_type: data.crop_type || null,
            acres: data.acres || null,
            apiary_name: data.apiary_name || null,
            hive_count: data.hive_count || null,
            experience_years: data.experience_years || null,

            status: 'new'
        });

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Error submitting contact form:", error);
        throw error;
    }
};

export const submitPollinationRequest = async (data: PollinationRequest) => {
    if (!supabase) {
        throw new Error("Supabase client not initialized. Check environment variables.");
    }
    try {
        const { error } = await supabase.from('pollination_requests').insert({
            full_name: data.full_name,
            email: data.email,
            phone: data.phone,
            farm_name: data.farm_name,
            farm_location: data.farm_location,
            crop_type: data.crop_type,
            acres: data.acres,
            preferred_start_date: data.preferred_start_date,
            additional_info: data.additional_info || null,
            status: 'pending'
        });

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Error submitting pollination request:", error);
        throw error;
    }
};

export const submitNewsletterSubscription = async (data: NewsletterSubscription) => {
    if (!supabase) {
        throw new Error("Supabase client not initialized. Check environment variables.");
    }
    try {
        // First check if already subscribed to avoid unique constraint error
        const { data: existing } = await supabase
            .from('newsletter_subscribers')
            .select('id')
            .eq('email', data.email)
            .single();

        if (existing) {
            return { success: true, message: "Already subscribed" };
        }

        const { error } = await supabase.from('newsletter_subscribers').insert({
            email: data.email,
            first_name: data.first_name || null
        });

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Error subscribing to newsletter:", error);
        throw error;
    }
};
