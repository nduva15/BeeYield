/**
 * Shop Service - Connects to Supabase
 */
import { supabase, supabaseBeeYield, supabaseCEBA, supabaseShop } from "@/lib/supabase";
import { apiGet, apiPost } from "./api";

const getPaymentsClient = () => {
    if (typeof window !== 'undefined') {
        const path = window.location.pathname.toLowerCase();

        if ((path.includes('/ceba') || path.startsWith('/admin')) && supabaseCEBA) {
            return supabaseCEBA;
        }

        if (path.includes('/beeyield') && supabaseBeeYield) {
            return supabaseBeeYield;
        }
    }

    return supabaseShop;
};

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
        let query = supabaseShop.from('products').select(`
            *,
            variants:product_variants(*)
        `).eq('is_active', true);

        if (category_name) {
            query = query.eq('category', category_name);
        }

        const { data, error } = await query;
        if (error) throw error;
        return (data || []) as Product[];
    } catch (error) {
        console.error("Error fetching products from Supabase:", error);
        return [];
    }
};

export const getProduct = async (productId: string): Promise<Product | null> => {
    try {
        const { data, error } = await supabaseShop
            .from('products')
            .select(`
                *,
                variants:product_variants(*)
            `)
            .eq('id', productId)
            .single();

        if (error) throw error;
        return data as Product;
    } catch (error) {
        console.error("Error fetching product from Supabase:", error);
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
    payment_method_id?: string;
    items: {
        product_id: string;
        variant_id: string;
        quantity: number;
    }[];
    total_kes: number;
    notes?: string;
    idempotency_key?: string;
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
        const { data: { user } } = await supabaseShop.auth.getUser();

        // 1. Create the order in Supabase
        const { data: order, error: orderError } = await supabaseShop
            .from('orders')
            .insert({
                user_id: user?.id || null, // Allow guest checkout
                total_kes: orderData.total_kes,
                status: 'pending',
                shipping_address: orderData.shipping_address,
                payment_method: orderData.payment_method,
                notes: orderData.notes,
                idempotency_key: orderData.idempotency_key
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // 2. Create order items
        const orderItems = orderData.items.map(item => ({
            order_id: order.id,
            product_id: item.product_id,
            variant_id: item.variant_id,
            quantity: item.quantity
        }));

        const { error: itemsError } = await supabaseShop
            .from('order_items')
            .insert(orderItems);

        if (itemsError) throw itemsError;

        // 3. Process payment if card is used via Supabase Edge Function (the "Stripe Wrapper")
        let paymentInfo: any = null;
        if (orderData.payment_method === 'card' && orderData.payment_method_id) {
            const { data, error: paymentError } = await supabaseShop.functions.invoke('process-payment', {
                body: {
                    order_id: order.id,
                    payment_method_id: orderData.payment_method_id,
                    amount: orderData.total_kes,
                    currency: 'kes'
                }
            });

            if (paymentError) throw paymentError;
            paymentInfo = data;
        }

        return {
            order_id: order.id,
            order_number: order.order_number || `BY-${order.id.slice(0, 8).toUpperCase()}`,
            status: 'success',
            message: 'Order placed successfully',
            payment_info: paymentInfo
        };
    } catch (error) {
        console.error("Error initializing checkout via Supabase:", error);
        throw error;
    }
};

export const getUserOrders = async (email: string): Promise<Record<string, unknown>[]> => {
    try {
        const { data, error } = await supabaseShop
            .from('orders')
            .select(`
                *,
                items:order_items(
                    *,
                    product:products(*)
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []) as Record<string, unknown>[];
    } catch (error) {
        console.error("Error fetching user orders via Supabase:", error);
        return [];
    }
};

// --- NEW SERVICES ---

// Address Services
export const getAddresses = async () => {
    const { data, error } = await supabaseShop.from('addresses').select('*').order('is_default', { ascending: false });
    if (error) throw error;
    return data;
};

export const addAddress = async (address: any) => {
    const { data: { user } } = await supabaseShop.auth.getUser();
    const { data, error } = await supabaseShop.from('addresses').insert({ ...address, user_id: user?.id }).select().single();
    if (error) throw error;
    return data;
};

export const updateAddress = async (addressId: string, address: any) => {
    const { data, error } = await supabaseShop.from('addresses').update(address).eq('id', addressId).select().single();
    if (error) throw error;
    return data;
};

export const deleteAddress = async (addressId: string) => {
    const { error } = await supabaseShop.from('addresses').delete().eq('id', addressId);
    if (error) throw error;
    return { success: true };
};

// Payment Method Services
export const getPaymentMethods = async () => {
    const client = getPaymentsClient();
    const { data, error } = await client
        .from('payment_methods')
        .select('*')
        .eq('status', 'active')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
};

export const addPaymentMethod = async (paymentMethod: any) => {
    const client = getPaymentsClient();
    const { data: { user } } = await client.auth.getUser();
    const { data, error } = await client.from('payment_methods').insert({ ...paymentMethod, user_id: user?.id }).select().single();
    if (error) throw error;
    return data;
};

export const deletePaymentMethod = async (paymentId: string) => {
    const client = getPaymentsClient();
    const { data, error } = await client.functions.invoke('process-payment', {
        body: {
            action: 'detach_payment_method',
            payment_method_id: paymentId,
        }
    });
    if (error) throw error;
    return data;
};

// Tracking Services
export const getOrderTracking = async (orderId: string) => {
    const { data, error } = await supabaseShop.from('order_tracking').select('*').eq('order_id', orderId).single();
    if (error) throw error;
    return data;
};

// Order Detail Services
export const getOrder = async (orderId: string): Promise<any> => {
    const { data, error } = await supabaseShop.from('orders').select(`
        *,
        items:order_items(
            *,
            product:products(*)
        ),
        tracking:order_tracking(*)
    `).eq('id', orderId).single();
    if (error) throw error;
    return data;
};

export interface WishlistItem {
    id: string;
    name: string;
    description: string;
    price: number;
    image?: string;
    category: string;
    badge: string | null;
    inStock: boolean;
    added_at?: string;
}

// Wishlist Services
export const getWishlist = async (): Promise<WishlistItem[]> => {
    try {
        const data = await apiGet<any[]>('/shop/wishlist');
        return Array.isArray(data) ? data.map(item => {
            const product = item.product || {};
            return {
                id: item.product_id || product.id || item.id,
                name: product.name || 'Unknown Product',
                description: product.description || '',
                price: Number(product.price_kes || product.price || 0),
                image: Array.isArray(product.images) ? product.images[0] : (product.featured_image || ''),
                category: product.category || 'honey',
                badge: product.badge || null,
                inStock: product.is_active !== false,
                added_at: item.created_at || item.added_at
            };
        }) : [];
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        // Fallback or empty
        return [];
    }
};

export const toggleWishlist = async (productId: string): Promise<{ status: string; action: 'added' | 'removed' }> => {
    try {
        return await apiPost<{ status: string; action: 'added' | 'removed' }>(`/shop/wishlist/${productId}`, {});
    } catch (error) {
        console.error("Error toggling wishlist:", error);
        // Fallback to direct Supabase if needed (optional)
        const { data: { user } } = await supabaseShop.auth.getUser();
        if (!user) throw error;
        
        const { data: existing } = await supabaseShop.from('wishlists').select('*').eq('user_id', user.id).eq('product_id', productId).single();
        if (existing) {
            await supabaseShop.from('wishlists').delete().eq('user_id', user.id).eq('product_id', productId);
            return { status: 'success', action: 'removed' };
        } else {
            await supabaseShop.from('wishlists').insert({ user_id: user.id, product_id: productId });
            return { status: 'success', action: 'added' };
        }
    }
};

export const syncCart = async (items: any[]): Promise<any> => {
    // Optional: Implement robust cart sync logic if supported by backend
    // For now, we can just log or implement a simple 'save status'
    return { status: "success" };
};

// --- STRIPE PAYMENT SERVICES ---

// --- STRIPE PAYMENT SERVICES (SUPABASE WRAPPER READY) ---

export interface StripePaymentIntent {
    client_secret: string;
    payment_intent_id: string;
}

export interface StripeSetupIntent {
    client_secret: string;
    setup_intent_id: string;
}

// Create a PaymentIntent for checkout using the Edge Function
export const createStripePaymentIntent = async (amount: number, currency: string = 'kes'): Promise<StripePaymentIntent> => {
    const client = getPaymentsClient();
    const { data, error } = await client.functions.invoke('process-payment', {
        body: { amount, currency, action: 'create_intent' }
    });
    if (error) throw error;
    return data;
};

// Create a SetupIntent for saving card without immediate payment
export const createStripeSetupIntent = async (): Promise<StripeSetupIntent> => {
    const client = getPaymentsClient();
    const { data, error } = await client.functions.invoke('process-payment', {
        body: { action: 'create_setup_intent' }
    });
    if (error) throw error;
    return data;
};

export const waitForVaultedPaymentMethod = async (
    paymentMethodId: string,
    timeoutMs: number = 10000,
): Promise<any | null> => {
    const client = getPaymentsClient();
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
        const { data, error } = await client
            .from('payment_methods')
            .select('*')
            .eq('stripe_payment_method_id', paymentMethodId)
            .eq('status', 'active')
            .maybeSingle();

        if (error) throw error;
        if (data) return data;

        await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return null;
};

// Confirm payment was successful via Edge function
export const confirmStripePayment = async (paymentIntentId: string, orderId: string): Promise<unknown> => {
    const client = getPaymentsClient();
    const { data, error } = await client.functions.invoke('process-payment', {
        body: { action: 'confirm', payment_intent_id: paymentIntentId, order_id: orderId }
    });
    if (error) throw error;
    return data;
};

// Download Invoice - Legacy support
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
