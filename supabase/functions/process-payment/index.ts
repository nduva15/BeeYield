import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";

const json = (payload: unknown, status = 200) =>
    new Response(JSON.stringify(payload), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

const titleCase = (value?: string | null) => {
    if (!value) return "Card";
    return value.charAt(0).toUpperCase() + value.slice(1);
};

const appendFormValue = (params: URLSearchParams, key: string, value: unknown) => {
    if (value === undefined || value === null || value === "") return;
    params.append(key, String(value));
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
        method: init.method ?? "POST",
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

const getUserClient = (req: Request) =>
    createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: {
            headers: {
                Authorization: req.headers.get("Authorization") ?? "",
            },
        },
    });

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const getOptionalUser = async (req: Request) => {
    const authorization = req.headers.get("Authorization");
    if (!authorization) return null;

    const userClient = getUserClient(req);
    const { data, error } = await userClient.auth.getUser();
    if (error) {
        console.warn("Optional auth lookup failed:", error.message);
        return null;
    }

    return data.user ?? null;
};

const getRequiredUser = async (req: Request) => {
    const userClient = getUserClient(req);
    const { data, error } = await userClient.auth.getUser();
    if (error || !data.user) {
        throw new Error("Not authenticated");
    }

    return data.user;
};

const ensureStripeCustomer = async (user: { id: string; email?: string | null }) => {
    const { data: profile, error: profileError } = await adminClient
        .from("profiles")
        .select("id, email, first_name, last_name, stripe_customer_id")
        .eq("id", user.id)
        .maybeSingle();

    if (profileError) {
        throw profileError;
    }

    if (profile?.stripe_customer_id) {
        return {
            stripeCustomerId: profile.stripe_customer_id,
            profile,
        };
    }

    const params = new URLSearchParams();
    appendFormValue(params, "email", profile?.email ?? user.email ?? null);
    appendFormValue(
        params,
        "name",
        [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim(),
    );
    appendFormValue(params, "metadata[user_id]", user.id);
    appendFormValue(params, "metadata[source]", "beeyield_payment_vault");

    const customer = await stripeRequest("/customers", {
        method: "POST",
        body: params,
    });

    const { error: updateError } = await adminClient
        .from("profiles")
        .update({
            stripe_customer_id: customer.id,
            updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

    if (updateError) {
        throw updateError;
    }

    return {
        stripeCustomerId: customer.id as string,
        profile,
    };
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error("Supabase environment variables are not configured");
        }

        const body = await req.json();
        const action = typeof body?.action === "string" ? body.action : "create_intent";

        if (action === "create_setup_intent") {
            const user = await getRequiredUser(req);
            const { stripeCustomerId } = await ensureStripeCustomer(user);

            const params = new URLSearchParams();
            appendFormValue(params, "customer", stripeCustomerId);
            appendFormValue(params, "usage", "off_session");
            appendFormValue(params, "payment_method_types[0]", "card");
            appendFormValue(params, "metadata[user_id]", user.id);
            appendFormValue(params, "metadata[source]", "beeyield_payment_vault");

            const setupIntent = await stripeRequest("/setup_intents", {
                method: "POST",
                body: params,
            });

            return json({
                client_secret: setupIntent.client_secret,
                setup_intent_id: setupIntent.id,
                customer_id: stripeCustomerId,
            });
        }

        if (action === "detach_payment_method") {
            const user = await getRequiredUser(req);
            const paymentMethodLookup = typeof body?.payment_method_id === "string"
                ? body.payment_method_id
                : "";

            if (!paymentMethodLookup) {
                throw new Error("payment_method_id is required");
            }

            const { data: paymentMethod, error: paymentMethodError } = await adminClient
                .from("payment_methods")
                .select("id, user_id, stripe_payment_method_id")
                .eq("user_id", user.id)
                .or(`id.eq.${paymentMethodLookup},stripe_payment_method_id.eq.${paymentMethodLookup}`)
                .maybeSingle();

            if (paymentMethodError) {
                throw paymentMethodError;
            }

            if (!paymentMethod) {
                throw new Error("Payment method not found");
            }

            if (paymentMethod.stripe_payment_method_id) {
                await stripeRequest(`/payment_methods/${paymentMethod.stripe_payment_method_id}/detach`, {
                    method: "POST",
                    body: new URLSearchParams(),
                });
            }

            const { error: updateError } = await adminClient
                .from("payment_methods")
                .update({
                    is_default: false,
                    status: "detached",
                    detached_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq("id", paymentMethod.id);

            if (updateError) {
                throw updateError;
            }

            return json({ success: true, id: paymentMethod.id });
        }

        if (action === "create_intent") {
            const amount = Number(body?.amount ?? 0);
            const currency = String(body?.currency ?? "kes").toLowerCase();
            if (!Number.isFinite(amount) || amount <= 0) {
                throw new Error("amount must be a positive number");
            }

            const optionalUser = await getOptionalUser(req);
            const stripeCustomerId = optionalUser
                ? (await ensureStripeCustomer(optionalUser)).stripeCustomerId
                : null;

            const params = new URLSearchParams();
            appendFormValue(params, "amount", Math.round(amount * 100));
            appendFormValue(params, "currency", currency);
            appendFormValue(params, "automatic_payment_methods[enabled]", true);
            appendFormValue(params, "customer", stripeCustomerId);
            appendFormValue(params, "metadata[source]", "beeyield_checkout");
            appendFormValue(params, "metadata[user_id]", optionalUser?.id ?? null);
            appendFormValue(params, "metadata[order_id]", body?.order_id ?? null);

            const paymentIntent = await stripeRequest("/payment_intents", {
                method: "POST",
                body: params,
            });

            return json({
                client_secret: paymentIntent.client_secret,
                payment_intent_id: paymentIntent.id,
            });
        }

        if (action === "confirm") {
            return json({ success: true });
        }

        throw new Error(`Unsupported action: ${action}`);
    } catch (error) {
        console.error("process-payment error:", error);
        return json({
            error: error instanceof Error ? error.message : "Unknown error",
        }, 400);
    }
});
