/**
 * Contact Service - Connects to Secure Backend API
 */
import { apiPost, apiGet, apiPatch } from "./api";

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
    form_specific_data?: Record<string, unknown>;
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

/** Dedicated Contact Message (PRD Engagement Module) */
export interface ContactMessage {
    full_name: string;
    email: string;
    subject?: string;
    message: string;
}

/** Contact message row returned from DB */
export interface ContactMessageRow {
    id: string;
    full_name: string;
    email: string;
    subject: string | null;
    message: string;
    status: "new" | "read" | "replied" | "archived";
    created_at: string;
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

/** Submit a dedicated contact message (public) */
export const submitContactMessage = async (data: ContactMessage) => {
    try {
        return await apiPost<{ status: string; message: string }>("/contact/message", data);
    } catch (error) {
        console.error("Error submitting contact message:", error);
        throw error;
    }
};

/** Get all contact messages (admin only) */
export const getContactMessages = async (status?: string, limit = 50) => {
    try {
        const params = new URLSearchParams();
        if (status) params.append("status", status);
        params.append("limit", String(limit));
        const query = params.toString();
        return await apiGet<ContactMessageRow[]>(`/contact/messages${query ? `?${query}` : ""}`);
    } catch (error) {
        console.error("Error fetching contact messages:", error);
        throw error;
    }
};

/** Update a contact message status (admin only) */
export const updateContactMessageStatus = async (messageId: string, status: "new" | "read" | "replied" | "archived") => {
    try {
        return await apiPatch<{ status: string; message: string }>(`/contact/messages/${messageId}/status`, { status });
    } catch (error) {
        console.error("Error updating message status:", error);
        throw error;
    }
};
