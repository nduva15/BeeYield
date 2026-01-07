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

const API_URL = "http://localhost:8000/api/v1";

export const getProducts = async (category?: string): Promise<Product[]> => {
    try {
        const url = category ? `${API_URL}/shop/products?category=${category}` : `${API_URL}/shop/products`;
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

export interface CheckoutOrder {
    shipping_address: any;
    payment_method: "mpesa" | "card";
    items: {
        product_id: string;
        variant_id: string;
        quantity: number;
    }[];
    total_kes: number;
    notes?: string;
}

export const initializeCheckout = async (orderData: CheckoutOrder): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}/shop/checkout/init`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
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
