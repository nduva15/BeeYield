/**
 * Contact Service - Connects to Secure Backend API
 */
import { supabase } from "@/lib/supabase";
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

type ContactServiceResponse = {
    status: string;
    message: string;
};

type FallbackError = Error & {
    status?: number;
    responseBody?: unknown;
};

function shouldUseSupabaseFallback(error: unknown) {
    const typedError = error as FallbackError;
    const message = typedError?.message ?? String(error ?? "");

    return (
        error instanceof TypeError ||
        typedError?.status === undefined ||
        typedError.status >= 500 ||
        /failed to fetch|fetch failed|networkerror|load failed|err_connection_refused/i.test(message)
    );
}

async function insertFallbackRow(table: string, payload: Record<string, unknown>) {
    if (!supabase) {
        throw new Error("Supabase client is unavailable for fallback submissions.");
    }

    const { error } = await (supabase as any).from(table).insert(payload);
    if (error) {
        throw error;
    }
}

async function upsertFallbackRow(table: string, payload: Record<string, unknown>, onConflict: string) {
    if (!supabase) {
        throw new Error("Supabase client is unavailable for fallback submissions.");
    }

    const { error } = await (supabase as any)
        .from(table)
        .upsert(payload, { onConflict });

    if (error) {
        throw error;
    }
}

export const submitContactForm = async (data: ContactSubmission) => {
    try {
        return await apiPost<ContactServiceResponse>("/contact/submit", data);
    } catch (error) {
        if (shouldUseSupabaseFallback(error)) {
            await insertFallbackRow("contact_submissions", {
                ...data,
                name: `${data.first_name} ${data.last_name}`.trim(),
                subject: `${data.inquiry_type.toUpperCase()}: ${data.topic}`,
                status: "new",
            });

            return {
                status: "success",
                message: "Thank you for contacting us! We've received your inquiry and will get back to you shortly.",
            };
        }

        console.error("Error submitting contact form:", error);
        throw error;
    }
};

export const submitPollinationRequest = async (data: PollinationRequest) => {
    try {
        return await apiPost<ContactServiceResponse>("/contact/pollination", data);
    } catch (error) {
        if (shouldUseSupabaseFallback(error)) {
            await insertFallbackRow("pollination_requests", {
                ...data,
                status: "pending",
            });

            return {
                status: "success",
                message: "Thank you for your interest in our pollination services! We've received your request and will contact you shortly to discuss your needs.",
            };
        }

        console.error("Error submitting pollination request:", error);
        throw error;
    }
};

export const submitNewsletterSubscription = async (data: NewsletterSubscription) => {
    try {
        return await apiPost<ContactServiceResponse>("/contact/newsletter", data);
    } catch (error) {
        if (shouldUseSupabaseFallback(error)) {
            await upsertFallbackRow(
                "newsletter_subscribers",
                {
                    email: data.email,
                    first_name: data.first_name ?? null,
                    source: data.source ?? "footer",
                },
                "email",
            );

            return {
                status: "success",
                message: "Welcome to BeeYield! You're now subscribed to our newsletter.",
            };
        }

        console.error("Error subscribing to newsletter:", error);
        throw error;
    }
};

/** Submit a dedicated contact message (public) */
export const submitContactMessage = async (data: ContactMessage) => {
    try {
        return await apiPost<ContactServiceResponse>("/contact/message", data);
    } catch (error) {
        if (shouldUseSupabaseFallback(error)) {
            await insertFallbackRow("contact_messages", {
                ...data,
                status: "new",
            });

            return {
                status: "success",
                message: "Message sent! We will get back to you shortly.",
            };
        }

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
