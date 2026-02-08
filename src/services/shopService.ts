/**
 * Shop Service - Connects to Supabase
 */
import { supabase } from "@/lib/supabase";
import { apiGet, apiPost } from "./api";

export interface ProductVariant {
    id: string;
    size: string;
    price_kes: number;
    stock_quantity: number;
    is_available: boolean;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    category: string;
    badge: string | null;
    images: string[];
    rating: number;
    review_count: number;
    is_active: boolean;
    variants: ProductVariant[];
}

export const getProducts = async (category_name?: string): Promise<Product[]> => {
    try {
        const params: Record<string, string> = {};
        if (category_name) params.category = category_name;

        const products = await apiGet<Product[]>('/shop/products', params);
        return products;
    } catch (error) {
        console.error("Error fetching products from API:", error);
        return [];
    }
};

export const getProduct = async (productId: string): Promise<Product | null> => {
    try {
        return await apiGet<Product>(`/shop/products/${productId}`);
    } catch (error) {
        console.error("Error fetching product from API:", error);
        return null;
    }
};

export interface CheckoutOrder {
    shipping_address: {
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        county: string;
        postal_code?: string;
    };
    payment_method: "mpesa" | "card";
    items: {
        product_id: string;
        variant_id: string;
        quantity: number;
    }[];
    total_kes: number;
    notes?: string;
}

export interface CheckoutResponse {
    order_id: string;
    order_number: string;
    status: string;
    message: string;
    payment_info?: unknown;
    batches?: string[];
}

export const initializeCheckout = async (orderData: CheckoutOrder, accessToken?: string): Promise<CheckoutResponse> => {
    try {
        const headers: Record<string, string> = {};
        if (accessToken) {
            headers.Authorization = `Bearer ${accessToken}`;
        } else if (supabase) {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) headers.Authorization = `Bearer ${session.access_token}`;
        }

        return await apiPost<CheckoutResponse>('/shop/checkout/init', orderData, { headers });
    } catch (error) {
        console.error("Error initializing checkout via API:", error);
        throw error;
    }
};

export const getUserOrders = async (email: string): Promise<Record<string, unknown>[]> => {
    try {
        const { data: { session } } = await (supabase ? supabase.auth.getSession() : Promise.resolve({ data: { session: null } }));
        const headers: Record<string, string> = {};
        if (session) headers.Authorization = `Bearer ${session.access_token}`;

        const orders = await apiGet<unknown[]>('/shop/orders', { email }, { headers });
        return Array.isArray(orders) ? (orders as Record<string, unknown>[]).map(o => ({
            ...o,
            total_amount: (o.total_kes as number) || (o.total_amount as number)
        })) : [];
    } catch (error) {
        console.error("Error fetching user orders via API:", error);
        return [];
    }
};

// --- NEW SERVICES ---

const getAuthHeaders = async (): Promise<Record<string, string>> => {
    const { data: { session } } = await (supabase ? supabase.auth.getSession() : Promise.resolve({ data: { session: null } }));
    return session ? { Authorization: `Bearer ${session.access_token}` } : {};
};

// Address Services
export const getAddresses = async () => {
    const headers = await getAuthHeaders();
    return await apiGet<unknown[]>('/shop/addresses', {}, { headers });
};

export const addAddress = async (address: unknown) => {
    const headers = await getAuthHeaders();
    return await apiPost<unknown>('/shop/addresses', address, { headers });
};

export const deleteAddress = async (addressId: string) => {
    const headers = await getAuthHeaders();
    const { apiDelete } = await import("./api");
    return await apiDelete<unknown>(`/shop/addresses/${addressId}`, { headers });
};

// Payment Method Services
export const getPaymentMethods = async () => {
    const headers = await getAuthHeaders();
    return await apiGet<unknown[]>('/shop/payment-methods', {}, { headers });
};

export const addPaymentMethod = async (paymentMethod: unknown) => {
    const headers = await getAuthHeaders();
    return await apiPost<unknown>('/shop/payment-methods', paymentMethod, { headers });
};

export const deletePaymentMethod = async (paymentId: string) => {
    const headers = await getAuthHeaders();
    const { apiDelete } = await import("./api");
    return await apiDelete<unknown>(`/shop/payment-methods/${paymentId}`, { headers });
};

// Tracking Services
export const getOrderTracking = async (orderId: string) => {
    const headers = await getAuthHeaders();
    return await apiGet<unknown>(`/shop/orders/${orderId}/tracking`, {}, { headers });
};

// Order Detail Services
export const getOrder = async (orderId: string): Promise<any> => {
    const headers = await getAuthHeaders();
    return await apiGet<any>(`/shop/orders/${orderId}`, {}, { headers });
};

// Invoice Services
export const downloadInvoice = async (orderId: string, orderNumber: string) => {
    const session = await (supabase ? supabase.auth.getSession() : Promise.resolve({ data: { session: null } }));
    const token = session.data.session?.access_token;

    const { API_V1_URL } = await import("./api");
    const downloadUrl = `${API_V1_URL}/shop/orders/${orderId}/invoice`;
    console.log(`Downloading invoice from: ${downloadUrl}`);

    try {
        const response = await fetch(downloadUrl, {
            headers: token ? {
                Authorization: `Bearer ${token}`
            } : {}
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Invoice Download Failed:", response.status, response.statusText, errorText);
            throw new Error(`Failed to download invoice: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Invoice-${orderNumber || orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Invoice PDF Fetch Error:", error);
        throw error;
    }
};

// --- STRIPE PAYMENT SERVICES ---

export interface StripePaymentIntent {
    client_secret: string;
    payment_intent_id: string;
}

export interface StripeSetupIntent {
    client_secret: string;
    setup_intent_id: string;
}

// Create a PaymentIntent for checkout
export const createStripePaymentIntent = async (amount: number, currency: string = 'kes'): Promise<StripePaymentIntent> => {
    const headers = await getAuthHeaders();
    return await apiPost<StripePaymentIntent>('/payments/stripe/create-payment-intent', {
        amount,
        currency,
    }, { headers });
};

// Create a SetupIntent for saving card without immediate payment
export const createStripeSetupIntent = async (): Promise<StripeSetupIntent> => {
    const headers = await getAuthHeaders();
    return await apiPost<StripeSetupIntent>('/payments/stripe/create-setup-intent', {}, { headers });
};

// Save a Stripe PaymentMethod to user's account
export const saveStripePaymentMethod = async (paymentMethodId: string, cardDetails: {
    last4: string;
    brand: string;
    exp_month: number;
    exp_year: number;
    card_holder_name?: string;
}): Promise<unknown> => {
    const headers = await getAuthHeaders();
    return await apiPost<unknown>('/shop/payment-methods', {
        type: 'card',
        stripe_payment_method_id: paymentMethodId,
        provider: cardDetails.brand.charAt(0).toUpperCase() + cardDetails.brand.slice(1),
        last4: cardDetails.last4,
        expiry_month: cardDetails.exp_month,
        expiry_year: cardDetails.exp_year,
        card_holder_name: cardDetails.card_holder_name || '',
        is_default: true,
    }, { headers });
};

// Confirm payment was successful
export const confirmStripePayment = async (paymentIntentId: string, orderId: string): Promise<unknown> => {
    const headers = await getAuthHeaders();
    return await apiPost<unknown>('/payments/stripe/confirm-payment', {
        payment_intent_id: paymentIntentId,
        order_id: orderId,
    }, { headers });
};



