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
    try {
        // Construct a rich message with all the details
        const detailedMessage = `
Type: ${data.inquiry_type.toUpperCase()}
Phone: ${data.phone}
Location: ${data.city}, ${data.state}, ${data.country}
${data.company ? `Company: ${data.company}\n` : ''}
${data.farm_name ? `Farm Name: ${data.farm_name}\n` : ''}
${data.apiary_name ? `Apiary Name: ${data.apiary_name}\n` : ''}
${data.crop_type ? `Crop: ${data.crop_type}\n` : ''}
${data.acres ? `Acres: ${data.acres}\n` : ''}
${data.hive_count ? `Hive Count: ${data.hive_count}\n` : ''}
${data.experience_years ? `Experience: ${data.experience_years}\n` : ''}

Message:
${data.message || 'No additional message provided.'}
        `.trim();

        const { error } = await supabase.from('contact_submissions').insert({
            name: `${data.first_name} ${data.last_name}`,
            email: data.email,
            subject: `${data.inquiry_type.toUpperCase()}: ${data.topic}`,
            message: detailedMessage,
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
    try {
        const { error } = await supabase.from('pollination_requests').insert({
            full_name: data.full_name,
            email: data.email,
            phone: data.phone,
            location: data.farm_location,
            crop_type: data.crop_type,
            acres: data.acres,
            preferred_date: data.preferred_start_date,
            message: `Farm Name: ${data.farm_name}\n\n${data.additional_info || ''}`,
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
            status: 'subscribed'
        });

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Error subscribing to newsletter:", error);
        throw error;
    }
};

