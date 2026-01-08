/**
 * Shop Service - Connects to Python Backend
 */
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

export const getProducts = async (category?: string): Promise<Product[]> => {
    try {
        const url = category
            ? `${API_V1_URL}/shop/products?category=${category}`
            : `${API_V1_URL}/shop/products`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Failed to fetch products");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
};

export const getProduct = async (productId: string): Promise<Product | null> => {
    try {
        const response = await fetch(`${API_V1_URL}/shop/products/${productId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch product");
        }
        return await response.json();
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
    payment_info?: {
        checkout_request_id?: string;
        merchant_request_id?: string;
        client_secret?: string;
    };
}

export const initializeCheckout = async (orderData: CheckoutOrder, token?: string): Promise<CheckoutResponse> => {
    try {
        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_V1_URL}/shop/checkout/init`, {
            method: "POST",
            headers,
            body: JSON.stringify(orderData),
        });
        if (!response.ok) {
            throw new Error("Failed to initialize checkout");
        }
        return await response.json();
    } catch (error) {
        console.error("Error initializing checkout:", error);
        throw error;
    }
};
