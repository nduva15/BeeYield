/**
 * Shop Service - Connects to Supabase
 */
import { supabase } from "@/lib/supabase";
import { API_V1_URL } from "./api";

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
    if (!supabase) return [];
    try {
        let query = supabase
            .from('products' as any)
            .select('*, variants:product_variants(*)');

        if (category_name) {
            query = query.eq('category', category_name);
        }

        const { data, error } = await query;
        if (error) throw error;

        return (data || []).map((p: any) => ({
            ...p,
            variants: p.variants || []
        }));
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
};

export const getProduct = async (productId: string): Promise<Product | null> => {
    if (!supabase) return null;
    try {
        const { data, error } = await supabase
            .from('products' as any)
            .select('*, variants:product_variants(*)')
            .eq('id', productId)
            .single();

        if (error) throw error;
        return {
            ...data,
            variants: data.variants || []
        };
    } catch (error) {
        console.error("Error fetching product:", error);
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
}

export const initializeCheckout = async (orderData: CheckoutOrder, token?: string): Promise<CheckoutResponse> => {
    if (!supabase) {
        throw new Error("Supabase client is not initialized");
    }

    try {
        // 1. Create the order
        const { data: order, error: orderError } = await (supabase
            .from("orders" as any) as any)
            .insert([{
                customer_email: orderData.shipping_address.email,
                customer_phone: orderData.shipping_address.phone,
                shipping_address: orderData.shipping_address,
                payment_method: orderData.payment_method,
                total_amount: orderData.total_kes,
                status: "pending",
                notes: orderData.notes
            }])
            .select()
            .single();

        if (orderError) throw orderError;

        // 2. Clear items (if we had an items table)
        // In this implementation, we can store items in the order itself or a separate table
        // For simplicity and matching the expected response, we just return the order ID

        const orderId = order.id;
        const orderNumber = `BY-${orderId.toString().slice(0, 8).toUpperCase()}`;

        return {
            order_id: orderId,
            order_number: orderNumber,
            status: "pending",
            message: "Order initialized successfully"
        };
    } catch (error) {
        console.error("Error initializing checkout:", error);
        throw error;
    }
};

