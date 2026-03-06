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

export const add_to_cart = async (item: any) => {
    return await apiPost<any>('/shop/cart/add', item);
};

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
    idempotency_key: string;
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
        const options: RequestInit = {};
        if (accessToken) {
            options.headers = { Authorization: `Bearer ${accessToken}` };
        }
        return await apiPost<CheckoutResponse>('/shop/checkout/init', orderData, options);
    } catch (error) {
        console.error("Error initializing checkout via API:", error);
        throw error;
    }
};

export const getUserOrders = async (email: string): Promise<Record<string, unknown>[]> => {
    try {
        const orders = await apiGet<unknown[]>('/shop/orders', { email });
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

// Address Services
export const getAddresses = async () => {
    return await apiGet<unknown[]>('/shop/addresses', {});
};

export const addAddress = async (address: unknown) => {
    return await apiPost<unknown>('/shop/addresses', address);
};

export const deleteAddress = async (addressId: string) => {
    const { apiDelete } = await import("./api");
    return await apiDelete<unknown>(`/shop/addresses/${addressId}`);
};

// Payment Method Services
export const getPaymentMethods = async () => {
    return await apiGet<unknown[]>('/shop/payment-methods', {});
};

export const addPaymentMethod = async (paymentMethod: unknown) => {
    return await apiPost<unknown>('/shop/payment-methods', paymentMethod);
};

export const deletePaymentMethod = async (paymentId: string) => {
    const { apiDelete } = await import("./api");
    return await apiDelete<unknown>(`/shop/payment-methods/${paymentId}`);
};

// Tracking Services
export const getOrderTracking = async (orderId: string) => {
    return await apiGet<unknown>(`/shop/orders/${orderId}/tracking`, {});
};

// Order Detail Services
export const getOrder = async (orderId: string): Promise<any> => {
    return await apiGet<any>(`/shop/orders/${orderId}`, {});
};

// Invoice Services
export const downloadInvoice = async (orderId: string, orderNumber: string) => {
    const { apiDownload } = await import("./api");
    const fileName = `Invoice-${orderNumber || orderId}.pdf`;
    try {
        await apiDownload(`/shop/orders/${orderId}/invoice`, {}, fileName);
    } catch (error) {
        console.error("Invoice PDF Download Error:", error);
        throw error;
    }
};

// --- WISHLIST & CART SERVICES ---

export interface WishlistItem {
    id: string; // Product ID
    added_at: string;
}

export const getWishlist = async (): Promise<WishlistItem[]> => {
    try {
        return await apiGet<WishlistItem[]>('/shop/wishlist');
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        return [];
    }
};

export const toggleWishlist = async (productId: string): Promise<{ status: string; action: 'added' | 'removed' }> => {
    return await apiPost<{ status: string; action: 'added' | 'removed' }>(`/shop/wishlist/${productId}`, {});
};

export const syncCart = async (items: any[]): Promise<any> => {
    // Optional: Implement robust cart sync logic if supported by backend
    // For now, we can just log or implement a simple 'save status'
    return { status: "success" };
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
    return await apiPost<StripePaymentIntent>('/payments/stripe/create-payment-intent', {
        amount,
        currency,
    });
};

// Create a SetupIntent for saving card without immediate payment
export const createStripeSetupIntent = async (): Promise<StripeSetupIntent> => {
    return await apiPost<StripeSetupIntent>('/payments/stripe/create-setup-intent', {});
};

// Save a Stripe PaymentMethod to user's account
export const saveStripePaymentMethod = async (paymentMethodId: string, cardDetails: {
    last4: string;
    brand: string;
    exp_month: number;
    exp_year: number;
    card_holder_name?: string;
}): Promise<unknown> => {
    return await apiPost<unknown>('/shop/payment-methods', {
        type: 'card',
        stripe_payment_method_id: paymentMethodId,
        provider: cardDetails.brand.charAt(0).toUpperCase() + cardDetails.brand.slice(1),
        last4: cardDetails.last4,
        expiry_month: cardDetails.exp_month,
        expiry_year: cardDetails.exp_year,
        card_holder_name: cardDetails.card_holder_name || '',
        is_default: true,
    });
};

// Confirm payment was successful
export const confirmStripePayment = async (paymentIntentId: string, orderId: string): Promise<unknown> => {
    return await apiPost<unknown>('/payments/stripe/confirm-payment', {
        payment_intent_id: paymentIntentId,
        order_id: orderId,
    });
};

// Validate a coupon code
export const validateCoupon = async (code: string, amount: number): Promise<{
    valid: boolean;
    discount_amount?: number;
    new_total?: number;
    message?: string;
}> => {
    return await apiPost<any>(`/shop/checkout/coupon/validate?code=${code}&amount=${amount}`, {});
};
