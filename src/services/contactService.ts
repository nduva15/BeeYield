import { supabase, supabaseBeeYield, supabaseCEBA, supabaseShop } from "@/lib/supabase";
import { apiPost, apiGet, apiPatch } from "./api";

/** Helper to get a working supabase client */
const getSupabase = () => {
    return supabase || supabaseBeeYield || supabaseCEBA || supabaseShop;
};

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

const CONTACT_OUTBOX_KEY = "beeyield_contact_outbox";
const OFFLINE_SUCCESS_MESSAGE = "We've received your submission and will process it as soon as the service is available.";

const TABLE_TO_ENDPOINT: Record<string, string> = {
    contact_submissions: "/contact/submit",
    pollination_requests: "/contact/pollination",
    newsletter_subscribers: "/contact/newsletter",
    contact_messages: "/contact/message",
};

type QueuedContactSubmission = {
    id: string;
    table: string;
    operation: "insert" | "upsert";
    payload: Record<string, unknown>;
    onConflict?: string;
    queuedAt: string;
};

let memoryQueue: QueuedContactSubmission[] = [];

function canUseBrowserStorage() {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function getQueuedSubmissions(): QueuedContactSubmission[] {
    if (!canUseBrowserStorage()) return memoryQueue;

    try {
        const rawQueue = window.localStorage.getItem(CONTACT_OUTBOX_KEY);
        if (!rawQueue) return [];
        const parsed = JSON.parse(rawQueue);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.warn("[ContactService] Could not read queued submissions:", error);
        return memoryQueue;
    }
}

function setQueuedSubmissions(queue: QueuedContactSubmission[]) {
    memoryQueue = queue;
    if (!canUseBrowserStorage()) return;

    try {
        window.localStorage.setItem(CONTACT_OUTBOX_KEY, JSON.stringify(queue));
    } catch (error) {
        console.warn("[ContactService] Could not persist queued submissions:", error);
    }
}

function queueSubmission(
    table: string,
    operation: QueuedContactSubmission["operation"],
    payload: Record<string, unknown>,
    onConflict?: string,
) {
    const queue = getQueuedSubmissions();
    queue.push({
        id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
        table,
        operation,
        payload,
        onConflict,
        queuedAt: new Date().toISOString(),
    });
    setQueuedSubmissions(queue);
}

async function submitQueuedItem(item: QueuedContactSubmission) {
    const endpoint = TABLE_TO_ENDPOINT[item.table];

    if (endpoint) {
        await apiPost<ContactServiceResponse>(endpoint, item.payload);
        return;
    }

    const client = getSupabase();
    if (!client) {
        throw new Error("Supabase is not configured for queued submission flush.");
    }

    const query = (client as any).from(item.table);
    const { error } = item.operation === "upsert"
        ? await query.upsert(item.payload, { onConflict: item.onConflict })
        : await query.insert(item.payload);

    if (error) throw error;
}

async function flushQueuedSubmissions() {
    const queue = getQueuedSubmissions();
    if (queue.length === 0) return;

    const pending: QueuedContactSubmission[] = [];

    for (const item of queue) {
        try {
            await submitQueuedItem(item);
        } catch {
            pending.push(item);
        }
    }

    setQueuedSubmissions(pending);
}

if (typeof window !== "undefined") {
    window.addEventListener("online", () => {
        void flushQueuedSubmissions();
    });
    void flushQueuedSubmissions();
}

function shouldUseSupabaseFallback(error: unknown) {
    const typedError = error as FallbackError;
    const message = typedError?.message ?? String(error ?? "");

    return (
        error instanceof TypeError ||
        typedError?.status === undefined ||
        typedError.status >= 500 ||
        typedError.status === 404 ||
        typedError.status === 405 ||
        typedError.status === 401 ||
        /failed to fetch|fetch failed|networkerror|network error|load failed|err_connection_refused|connection timeout/i.test(message)
    );
}

function isSupabasePermissionError(error: any) {
    return error?.code === "42501" || /row-level security|permission denied|violates row-level security/i.test(error?.message ?? "");
}

function queueFallbackRow(
    table: string,
    operation: QueuedContactSubmission["operation"],
    payload: Record<string, unknown>,
    onConflict?: string,
) {
    queueSubmission(table, operation, payload, onConflict);
    console.warn(`[ContactService] Queued "${table}" submission locally. ${OFFLINE_SUCCESS_MESSAGE}`);
}

async function insertFallbackRow(table: string, payload: Record<string, unknown>) {
    const client = getSupabase();
    if (!client) {
        const url = import.meta.env.VITE_SUPABASE_URL ? "present" : "missing";
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY ? "present" : "missing";
        console.warn(`[ContactService] Supabase fallback unavailable. Config: URL ${url}, Key ${key}. Queueing "${table}" submission locally.`);
        queueFallbackRow(table, "insert", payload);
        return;
    }

    let error: any = null;
    try {
        ({ error } = await (client as any).from(table).insert(payload));
    } catch (insertError) {
        error = insertError;
    }

    if (error) {
        // Log the specific error for debugging
        console.error(`[ContactService] Supabase fallback INSERT into "${table}" failed:`, error.message, `(code: ${error.code})`);

        if (isSupabasePermissionError(error)) {
            console.warn(`[ContactService] Public insert policy is not available for "${table}".`);
        }

        queueFallbackRow(table, "insert", payload);
    }
}

async function upsertFallbackRow(table: string, payload: Record<string, unknown>, onConflict: string) {
    const client = getSupabase();
    if (!client) {
        const url = import.meta.env.VITE_SUPABASE_URL ? "present" : "missing";
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY ? "present" : "missing";
        console.warn(`[ContactService] Supabase fallback unavailable. Config: URL ${url}, Key ${key}. Queueing "${table}" submission locally.`);
        queueFallbackRow(table, "upsert", payload, onConflict);
        return;
    }

    let error: any = null;
    try {
        ({ error } = await (client as any)
            .from(table)
            .upsert(payload, { onConflict }));
    } catch (upsertError) {
        error = upsertError;
    }

    if (error) {
        console.error(`[ContactService] Supabase fallback UPSERT into "${table}" failed:`, error.message, `(code: ${error.code})`);

        if (isSupabasePermissionError(error)) {
            console.warn(`[ContactService] Public upsert policy is not available for "${table}".`);
        }

        queueFallbackRow(table, "upsert", payload, onConflict);
    }
}

export const submitContactForm = async (data: ContactSubmission) => {
    try {
        return await apiPost<ContactServiceResponse>("/contact/submit", data);
    } catch (apiError) {
        if (shouldUseSupabaseFallback(apiError)) {
            console.info("[ContactService] Backend API unavailable, using Supabase fallback for contact form.");
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

        console.error("Error submitting contact form:", apiError);
        throw apiError;
    }
};

export const submitPollinationRequest = async (data: PollinationRequest) => {
    try {
        return await apiPost<ContactServiceResponse>("/contact/pollination", data);
    } catch (apiError) {
        if (shouldUseSupabaseFallback(apiError)) {
            console.info("[ContactService] Backend API unavailable, using Supabase fallback for pollination request.");
            await insertFallbackRow("pollination_requests", {
                ...data,
                status: "pending",
            });

            return {
                status: "success",
                message: "Thank you for your interest in our pollination services! We've received your request and will contact you shortly to discuss your needs.",
            };
        }

        console.error("Error submitting pollination request:", apiError);
        throw apiError;
    }
};

export const submitNewsletterSubscription = async (data: NewsletterSubscription) => {
    try {
        return await apiPost<ContactServiceResponse>("/contact/newsletter", data);
    } catch (apiError) {
        if (shouldUseSupabaseFallback(apiError)) {
            console.info("[ContactService] Backend API unavailable, using Supabase fallback for newsletter subscription.");
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

        console.error("Error subscribing to newsletter:", apiError);
        throw apiError;
    }
};

/** Submit a dedicated contact message (public) */
export const submitContactMessage = async (data: ContactMessage) => {
    try {
        return await apiPost<ContactServiceResponse>("/contact/message", data);
    } catch (apiError) {
        if (shouldUseSupabaseFallback(apiError)) {
            console.info("[ContactService] Backend API unavailable, using Supabase fallback for contact message.");
            await insertFallbackRow("contact_messages", {
                ...data,
                status: "new",
            });

            return {
                status: "success",
                message: "Message sent! We will get back to you shortly.",
            };
        }

        console.error("Error submitting contact message:", apiError);
        throw apiError;
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
