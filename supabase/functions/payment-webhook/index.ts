import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const json = (payload: unknown, status = 200) =>
    new Response(JSON.stringify(payload), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

const titleCase = (value?: string | null) => {
    if (!value) return "Card";
    return value.charAt(0).toUpperCase() + value.slice(1);
};

const timingSafeEqual = (left: string, right: string) => {
    if (left.length !== right.length) return false;

    let mismatch = 0;
    for (let index = 0; index < left.length; index += 1) {
        mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
    }

    return mismatch === 0;
};

const computeWebhookSignature = async (payload: string, timestamp: string) => {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(STRIPE_WEBHOOK_SECRET),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
    );

    const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(`${timestamp}.${payload}`),
    );

    return Array.from(new Uint8Array(signature))
        .map((value) => value.toString(16).padStart(2, "0"))
        .join("");
};

const verifyStripeSignature = async (payload: string, signatureHeader: string | null) => {
    if (!STRIPE_WEBHOOK_SECRET) {
        throw new Error("Missing STRIPE_WEBHOOK_SECRET");
    }

    if (!signatureHeader) {
        throw new Error("Missing Stripe signature header");
    }

    const pairs = signatureHeader
        .split(",")
        .map((item) => item.trim().split("="))
        .filter(([key, value]) => key && value);

    const timestamp = pairs.find(([key]) => key === "t")?.[1];
    const signatures = pairs.filter(([key]) => key === "v1").map(([, value]) => value);

    if (!timestamp || signatures.length === 0) {
        throw new Error("Malformed Stripe signature header");
    }

    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - Number(timestamp)) > 300) {
        throw new Error("Stripe webhook timestamp is outside the tolerance window");
    }

    const expectedSignature = await computeWebhookSignature(payload, timestamp);
    const matched = signatures.some((candidate) => timingSafeEqual(candidate, expectedSignature));

    if (!matched) {
        throw new Error("Stripe webhook signature verification failed");
    }
};

const stripeRequest = async (
    path: string,
    init: {
        method?: "GET" | "POST";
        body?: URLSearchParams;
    } = {},
) => {
    if (!STRIPE_SECRET_KEY) {
        throw new Error("Missing STRIPE_SECRET_KEY");
    }

    const hasBody = init.body !== undefined;
    const response = await fetch(`https://api.stripe.com/v1${path}`, {
        method: init.method ?? "GET",
        headers: {
            Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
            ...(hasBody ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
        },
        body: init.body?.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.error?.message ?? `Stripe request failed for ${path}`);
    }

    return data;
};

const resolveUserIdForCustomer = async (customerId?: string | null, metadataUserId?: string | null) => {
    if (metadataUserId) return metadataUserId;
    if (!customerId) return null;

    const { data: profile, error } = await adminClient
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return profile?.id ?? null;
};

const syncSetupIntentSuccess = async (setupIntent: any) => {
    const stripePaymentMethodId = typeof setupIntent.payment_method === "string"
        ? setupIntent.payment_method
        : setupIntent.payment_method?.id;
    const stripeCustomerId = typeof setupIntent.customer === "string"
        ? setupIntent.customer
        : setupIntent.customer?.id;

    if (!stripePaymentMethodId || !stripeCustomerId) {
        throw new Error("SetupIntent is missing customer or payment method");
    }

    const userId = await resolveUserIdForCustomer(
        stripeCustomerId,
        setupIntent.metadata?.user_id ?? null,
    );

    if (!userId) {
        throw new Error(`Unable to resolve user for Stripe customer ${stripeCustomerId}`);
    }

    const paymentMethod = await stripeRequest(`/payment_methods/${stripePaymentMethodId}`, {
        method: "GET",
    });

    const card = paymentMethod.card ?? {};
    const now = new Date().toISOString();

    const { error: resetDefaultsError } = await adminClient
        .from("payment_methods")
        .update({
            is_default: false,
            updated_at: now,
        })
        .eq("user_id", userId)
        .eq("status", "active");

    if (resetDefaultsError) {
        throw resetDefaultsError;
    }

    const { error: upsertError } = await adminClient
        .from("payment_methods")
        .upsert({
            user_id: userId,
            type: paymentMethod.type ?? "card",
            provider: titleCase(card.brand),
            last4: card.last4 ?? null,
            expiry_month: card.exp_month ?? null,
            expiry_year: card.exp_year ?? null,
            card_holder_name: paymentMethod.billing_details?.name ?? null,
            billing_email: paymentMethod.billing_details?.email ?? null,
            is_default: true,
            stripe_customer_id: stripeCustomerId,
            stripe_payment_method_id: stripePaymentMethodId,
            stripe_setup_intent_id: setupIntent.id,
            fingerprint: card.fingerprint ?? null,
            status: "active",
            detached_at: null,
            updated_at: now,
        }, {
            onConflict: "stripe_payment_method_id",
        });

    if (upsertError) {
        throw upsertError;
    }
};

const syncPaymentMethodDetached = async (paymentMethod: any) => {
    const stripePaymentMethodId = paymentMethod.id;
    if (!stripePaymentMethodId) return;

    const { error } = await adminClient
        .from("payment_methods")
        .update({
            is_default: false,
            status: "detached",
            detached_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq("stripe_payment_method_id", stripePaymentMethodId);

    if (error) {
        throw error;
    }
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error("Supabase environment variables are not configured");
        }

        const payload = await req.text();
        await verifyStripeSignature(payload, req.headers.get("stripe-signature"));

        const event = JSON.parse(payload);
        const eventType = event?.type;

        if (eventType === "setup_intent.succeeded") {
            await syncSetupIntentSuccess(event.data.object);
        }

        if (eventType === "payment_method.detached") {
            await syncPaymentMethodDetached(event.data.object);
        }

        return json({ received: true });
    } catch (error) {
        console.error("payment-webhook error:", error);
        return json({
            error: error instanceof Error ? error.message : "Unknown error",
        }, 400);
    }
});
