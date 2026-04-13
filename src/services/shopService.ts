import { supabaseBeeYield, supabaseCEBA, supabaseShop } from "@/lib/supabase";
import { API_BASE_URL, apiDelete, apiGet, apiPost, apiPut, getAuthHeaders } from "./api";

const getPaymentsClient = () => {
    if (typeof window !== "undefined") {
        const path = window.location.pathname.toLowerCase();

        if ((path.includes("/ceba") || path.startsWith("/admin")) && supabaseCEBA) {
            return supabaseCEBA;
        }

        if (path.includes("/beeyield") && supabaseBeeYield) {
            return supabaseBeeYield;
        }
    }

    return supabaseShop;
};

const FALLBACK_ORDER_STATUSES = ["pending", "processing", "shipped", "completed"] as const;

const toNumber = (value: unknown, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const toString = (value: unknown, fallback = "") => {
    if (typeof value === "string") return value;
    if (value === null || value === undefined) return fallback;
    return String(value);
};

const toArray = <T>(value: unknown): T[] => (Array.isArray(value) ? value as T[] : []);

const sortOrders = <T extends { created_at?: string }>(orders: T[]) => (
    [...orders].sort((a, b) => (
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    ))
);

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
    delivery_method?: "delivery" | "pickup";
    items: {
        product_id: string;
        variant_id: string;
        quantity: number;
    }[];
    total_kes: number;
    coupon_code?: string;
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

export interface Address {
    id: string;
    name: string;
    email?: string;
    phone: string;
    street: string;
    apartment?: string;
    building?: string;
    floor?: string;
    city: string;
    county: string;
    postal_code?: string;
    is_default: boolean;
    user_id?: string;
}

export interface PaymentMethod {
    id: string;
    type: "card" | "mpesa";
    provider?: string;
    brand?: string;
    last4?: string;
    expiry_month?: number;
    expiry_year?: number;
    expiry?: string;
    card_holder_name?: string;
    is_default?: boolean;
    status?: string;
    created_at?: string;
    stripe_payment_method_id?: string;
}

export interface OrderItem {
    id: string;
    product_id: string;
    variant_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    price_at_purchase: number;
    product_name: string;
    product_image?: string;
    product?: Product;
    variant_size: string;
}

export interface Order {
    id: string;
    order_id?: string;
    order_number: string;
    status: string;
    total_kes: number;
    total_amount: number;
    payment_method: string;
    created_at: string;
    payment_status?: string;
    shipping_address: {
        first_name?: string;
        last_name?: string;
        name?: string;
        email?: string;
        phone?: string;
        address?: string;
        street?: string;
        city?: string;
        county?: string;
        postal_code?: string;
    };
    items: OrderItem[];
}

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

export interface TrackingEvent {
    status: string;
    description: string;
    created_at: string;
    location?: string;
}

export interface TrackingInfo {
    order_id: string;
    current_status: string;
    estimated_delivery: string;
    events: TrackingEvent[];
}

export interface ShopDashboardStats {
    total_orders: number;
    active_orders: number;
    completed_orders: number;
    total_spent_kes: number;
    wishlist_items: number;
    saved_addresses: number;
    saved_payment_methods: number;
}

export interface ShopDashboardSummary {
    stats: ShopDashboardStats;
    recent_orders: Order[];
    addresses: Address[];
    payment_methods: PaymentMethod[];
    wishlist: WishlistItem[];
    recommendations: Product[];
}

export interface CouponValidationResult {
    valid: boolean;
    code: string;
    discount_percent: number;
    discount_amount: number;
    message: string;
}

const normalizeVariant = (variant: any): ProductVariant => ({
    id: toString(variant?.id || variant?.variant_id || variant?.size || "variant"),
    size: toString(variant?.size, "Standard"),
    price_kes: toNumber(variant?.price_kes),
    stock_quantity: toNumber(variant?.stock_quantity),
    is_available: Boolean(
        variant?.is_available ?? (toNumber(variant?.stock_quantity) > 0)
    ),
});

const normalizeProduct = (product: any): Product => {
    const images = toArray<string>(product?.images).filter(Boolean);
    const variants = toArray<any>(product?.variants || product?.product_variants).map(normalizeVariant);

    return {
        id: toString(product?.id),
        name: toString(product?.name, "BeeYield Product"),
        description: toString(product?.description),
        category: toString(product?.category, "honey"),
        badge: product?.badge ? toString(product.badge) : null,
        images,
        rating: toNumber(product?.rating),
        review_count: toNumber(product?.review_count),
        is_active: Boolean(product?.is_active ?? true),
        variants,
    };
};

const normalizeAddress = (address: any): Address => ({
    id: toString(address?.id || address?.address_id || "address"),
    name: toString(address?.name, "Address"),
    email: address?.email ? toString(address.email) : undefined,
    phone: toString(address?.phone),
    street: toString(address?.street || address?.address),
    apartment: address?.apartment ? toString(address.apartment) : undefined,
    building: address?.building ? toString(address.building) : undefined,
    floor: address?.floor ? toString(address.floor) : undefined,
    city: toString(address?.city),
    county: toString(address?.county),
    postal_code: address?.postal_code ? toString(address.postal_code) : undefined,
    is_default: Boolean(address?.is_default),
    user_id: address?.user_id ? toString(address.user_id) : undefined,
});

const buildAddressPayload = (address: any) => ({
    name: toString(address?.name, "Address"),
    email: address?.email ? toString(address.email) : null,
    phone: toString(address?.phone),
    street: toString(address?.street || address?.address),
    apartment: address?.apartment ? toString(address.apartment) : null,
    building: address?.building ? toString(address.building) : null,
    floor: address?.floor ? toString(address.floor) : null,
    city: toString(address?.city),
    county: toString(address?.county),
    postal_code: address?.postal_code
        ? toString(address.postal_code)
        : address?.postalCode
            ? toString(address.postalCode)
            : null,
    is_default: Boolean(address?.is_default ?? address?.isDefault),
});

const normalizePaymentMethod = (method: any): PaymentMethod => {
    const type = toString(method?.type, "card").toLowerCase() === "mpesa" ? "mpesa" : "card";

    return {
        id: toString(method?.id || method?.stripe_payment_method_id || "payment-method"),
        type,
        provider: method?.provider ? toString(method.provider) : undefined,
        brand: method?.brand ? toString(method.brand) : undefined,
        last4: method?.last4 ? toString(method.last4) : undefined,
        expiry_month: method?.expiry_month ? toNumber(method.expiry_month) : undefined,
        expiry_year: method?.expiry_year ? toNumber(method.expiry_year) : undefined,
        expiry: method?.expiry
            ? toString(method.expiry)
            : method?.expiry_month && method?.expiry_year
                ? `${method.expiry_month}/${method.expiry_year}`
                : undefined,
        card_holder_name: method?.card_holder_name ? toString(method.card_holder_name) : undefined,
        is_default: Boolean(method?.is_default ?? method?.isDefault),
        status: method?.status ? toString(method.status) : undefined,
        created_at: method?.created_at ? toString(method.created_at) : undefined,
        stripe_payment_method_id: method?.stripe_payment_method_id
            ? toString(method.stripe_payment_method_id)
            : undefined,
    };
};

const buildPaymentMethodPayload = (method: any) => {
    const expiry = toString(method?.expiry);
    const [expiryMonthRaw, expiryYearRaw] = expiry.includes("/") ? expiry.split("/") : [undefined, undefined];

    return {
        type: toString(method?.type, "card").toLowerCase() === "mpesa" ? "mpesa" : "card",
        provider: toString(method?.provider || method?.brand, "Visa"),
        last4: toString(method?.last4, "0000"),
        expiry_month: method?.expiry_month ? toNumber(method.expiry_month) : toNumber(expiryMonthRaw, undefined as never),
        expiry_year: method?.expiry_year ? toNumber(method.expiry_year) : toNumber(expiryYearRaw, undefined as never),
        card_holder_name: method?.card_holder_name ? toString(method.card_holder_name) : null,
        is_default: Boolean(method?.is_default ?? method?.isDefault),
    };
};

const normalizeOrderItem = (item: any): OrderItem => {
    const productRaw = item?.product || {};
    const product = Object.keys(productRaw).length ? normalizeProduct(productRaw) : undefined;
    const quantity = toNumber(item?.quantity, 1);
    const unitPrice = toNumber(
        item?.unit_price ?? item?.price_at_purchase ?? item?.product_price ?? productRaw?.price_kes
    );

    return {
        id: toString(item?.id || `${item?.product_id || productRaw?.id || "item"}-${item?.variant_id || "default"}`),
        product_id: toString(item?.product_id || productRaw?.id),
        variant_id: toString(item?.variant_id || item?.variant?.id || "default"),
        quantity,
        unit_price: unitPrice,
        total_price: toNumber(item?.total_price, unitPrice * quantity),
        price_at_purchase: toNumber(item?.price_at_purchase, unitPrice),
        product_name: toString(item?.product_name || productRaw?.name, "BeeYield Product"),
        product_image: toArray<string>(productRaw?.images)[0] || item?.product_image || undefined,
        product,
        variant_size: toString(item?.variant_size || item?.size || item?.variant?.size, "Standard"),
    };
};

const normalizeOrder = (order: any): Order => {
    const total = toNumber(order?.total_kes ?? order?.total_amount);
    const shippingAddress = order?.shipping_address || {};

    return {
        id: toString(order?.id || order?.order_id),
        order_id: order?.order_id ? toString(order.order_id) : undefined,
        order_number: toString(order?.order_number || order?.id),
        status: toString(order?.status, "pending"),
        total_kes: total,
        total_amount: total,
        payment_method: toString(order?.payment_method, "mpesa"),
        created_at: toString(order?.created_at, new Date().toISOString()),
        payment_status: order?.payment_status ? toString(order.payment_status) : undefined,
        shipping_address: {
            first_name: shippingAddress?.first_name ? toString(shippingAddress.first_name) : undefined,
            last_name: shippingAddress?.last_name ? toString(shippingAddress.last_name) : undefined,
            name: shippingAddress?.name ? toString(shippingAddress.name) : undefined,
            email: shippingAddress?.email ? toString(shippingAddress.email) : undefined,
            phone: shippingAddress?.phone ? toString(shippingAddress.phone) : undefined,
            address: shippingAddress?.address ? toString(shippingAddress.address) : undefined,
            street: shippingAddress?.street ? toString(shippingAddress.street) : undefined,
            city: shippingAddress?.city ? toString(shippingAddress.city) : undefined,
            county: shippingAddress?.county ? toString(shippingAddress.county) : undefined,
            postal_code: shippingAddress?.postal_code ? toString(shippingAddress.postal_code) : undefined,
        },
        items: toArray<any>(order?.items).map(normalizeOrderItem),
    };
};

const normalizeTrackingInfo = (tracking: any): TrackingInfo => {
    const events = toArray<any>(tracking?.events).map((event) => ({
        status: toString(event?.status, "pending"),
        description: toString(event?.description, "Awaiting next fulfillment step."),
        created_at: toString(event?.created_at, new Date().toISOString()),
        location: event?.location ? toString(event.location) : undefined,
    }));

    if (events.length === 0) {
        const steps = toArray<any>(tracking?.steps);
        steps.forEach((step, index) => {
            if (step?.completed || index === 0) {
                events.push({
                    status: toString(step?.status || step?.label, FALLBACK_ORDER_STATUSES[Math.min(index, FALLBACK_ORDER_STATUSES.length - 1)]),
                    description: toString(step?.description || step?.label, "Fulfillment step recorded."),
                    created_at: toString(step?.created_at, new Date().toISOString()),
                    location: step?.location ? toString(step.location) : undefined,
                });
            }
        });
    }

    const currentStatus = toString(
        tracking?.current_status || tracking?.status || events[events.length - 1]?.status,
        "pending"
    );

    return {
        order_id: toString(tracking?.order_id),
        current_status: currentStatus,
        estimated_delivery: toString(
            tracking?.estimated_delivery,
            currentStatus === "completed" ? "Delivered" : "Within 24 hours"
        ),
        events,
    };
};

const normalizeWishlistItem = (item: any): WishlistItem => {
    const product = item?.product || {};
    const variants = toArray<any>(product?.variants || product?.product_variants).map(normalizeVariant);
    const inStock = variants.length > 0
        ? variants.some((variant) => variant.is_available && variant.stock_quantity > 0)
        : Boolean(product?.is_active ?? item?.in_stock ?? true);

    return {
        id: toString(item?.product_id || product?.id || item?.id),
        name: toString(product?.name || item?.product_name, "BeeYield Product"),
        description: toString(product?.description || item?.description),
        price: toNumber(
            item?.product_price ??
            product?.price_kes ??
            product?.variants?.[0]?.price_kes ??
            product?.product_variants?.[0]?.price_kes ??
            item?.price
        ),
        image: toArray<string>(product?.images)[0] || item?.product_image || item?.image,
        category: toString(product?.category || item?.category, "honey"),
        badge: product?.badge ? toString(product.badge) : item?.badge ? toString(item.badge) : null,
        inStock,
        added_at: item?.created_at ? toString(item.created_at) : item?.added_at ? toString(item.added_at) : undefined,
    };
};

export const add_to_cart = async (item: any) => apiPost<any>("/shop/cart/add", item);

export const getProducts = async (category_name?: string): Promise<Product[]> => {
    try {
        const data = await apiGet<any[]>("/shop/products", category_name ? { category: category_name } : undefined);
        return toArray<any>(data).map(normalizeProduct);
    } catch (error) {
        console.error("Error fetching products via API, falling back to Supabase:", error);
        try {
            let query = supabaseShop
                .from("products")
                .select("*, variants:product_variants(*)")
                .eq("is_active", true);

            if (category_name) {
                query = query.eq("category", category_name);
            }

            const { data, error: sbError } = await query;
            if (sbError) throw sbError;
            return toArray<any>(data).map(normalizeProduct);
        } catch (fallbackError) {
            console.error("Supabase product fallback failed:", fallbackError);
            return [];
        }
    }
};

export const getProduct = async (productId: string): Promise<Product | null> => {
    try {
        const data = await apiGet<any>(`/shop/products/${productId}`);
        return normalizeProduct(data);
    } catch (error) {
        console.error("Error fetching product via API, falling back to Supabase:", error);
        try {
            const { data, error: sbError } = await supabaseShop
                .from("products")
                .select("*, variants:product_variants(*)")
                .eq("id", productId)
                .single();

            if (sbError) throw sbError;
            return normalizeProduct(data);
        } catch (fallbackError) {
            console.error("Supabase product fallback failed:", fallbackError);
            return null;
        }
    }
};

export const validateCoupon = async (code: string, amount: number): Promise<CouponValidationResult> => {
    try {
        const response = await apiPost<any>("/shop/checkout/coupon/validate", { code, amount });
        return {
            valid: Boolean(response?.valid),
            code: toString(response?.code || code).toUpperCase(),
            discount_percent: toNumber(response?.discount_percent),
            discount_amount: toNumber(response?.discount_amount),
            message: toString(response?.message, response?.valid ? "Coupon applied." : "Invalid coupon."),
        };
    } catch (error) {
        console.error("Coupon validation failed:", error);
        return {
            valid: false,
            code: code.trim().toUpperCase(),
            discount_percent: 0,
            discount_amount: 0,
            message: "Coupon validation is unavailable right now.",
        };
    }
};

export const initializeCheckout = async (orderData: CheckoutOrder, _accessToken?: string): Promise<CheckoutResponse> => {
    const payload = {
        ...orderData,
        delivery_method: orderData.delivery_method || "delivery",
    };

    try {
        const response = await apiPost<any>("/shop/checkout/init", payload);
        return {
            order_id: toString(response?.order_id),
            order_number: toString(response?.order_number || response?.order_id),
            status: toString(response?.status, "success"),
            message: toString(response?.message, "Order placed successfully."),
            payment_info: response?.payment_info,
            batches: toArray<string>(response?.batches).map((batch) => toString(batch)),
        };
    } catch (error) {
        console.error("Error initializing checkout via API, falling back to Supabase:", error);

        const { data: { user } } = await supabaseShop.auth.getUser();

        const { data: order, error: orderError } = await supabaseShop
            .from("orders")
            .insert({
                user_id: user?.id || null,
                total_kes: orderData.total_kes,
                status: "pending",
                shipping_address: orderData.shipping_address,
                payment_method: orderData.payment_method,
                notes: orderData.notes,
                idempotency_key: orderData.idempotency_key,
            })
            .select()
            .single();

        if (orderError) throw orderError;

        const orderItems = orderData.items.map((item) => ({
            order_id: order.id,
            product_id: item.product_id,
            variant_id: item.variant_id,
            quantity: item.quantity,
        }));

        const { error: itemsError } = await supabaseShop.from("order_items").insert(orderItems);
        if (itemsError) throw itemsError;

        let paymentInfo: any = null;
        if (orderData.payment_method === "card" && orderData.payment_method_id) {
            const { data, error: paymentError } = await supabaseShop.functions.invoke("process-payment", {
                body: {
                    order_id: order.id,
                    payment_method_id: orderData.payment_method_id,
                    amount: orderData.total_kes,
                    currency: "kes",
                },
            });

            if (paymentError) throw paymentError;
            paymentInfo = data;
        }

        return {
            order_id: toString(order.id),
            order_number: toString(order.order_number || `BY-${toString(order.id).slice(0, 8).toUpperCase()}`),
            status: "success",
            message: "Order placed successfully.",
            payment_info: paymentInfo,
        };
    }
};

export const getUserOrders = async (_email?: string): Promise<Order[]> => {
    try {
        const data = await apiGet<any[]>("/shop/orders");
        return sortOrders(toArray<any>(data).map(normalizeOrder));
    } catch (error) {
        console.error("Error fetching user orders via API, falling back to Supabase:", error);

        try {
            const { data: { user } } = await supabaseShop.auth.getUser();
            let query = supabaseShop
                .from("orders")
                .select("*, items:order_items(*, product:products(*))")
                .order("created_at", { ascending: false });

            if (user?.id) {
                query = query.eq("user_id", user.id);
            }

            const { data, error: sbError } = await query;
            if (sbError) throw sbError;
            return sortOrders(toArray<any>(data).map(normalizeOrder));
        } catch (fallbackError) {
            console.error("Supabase user orders fallback failed:", fallbackError);
            return [];
        }
    }
};

export const getShopDashboard = async (): Promise<ShopDashboardSummary> => {
    try {
        const data = await apiGet<any>("/shop/dashboard");
        return {
            stats: {
                total_orders: toNumber(data?.stats?.total_orders),
                active_orders: toNumber(data?.stats?.active_orders),
                completed_orders: toNumber(data?.stats?.completed_orders),
                total_spent_kes: toNumber(data?.stats?.total_spent_kes),
                wishlist_items: toNumber(data?.stats?.wishlist_items),
                saved_addresses: toNumber(data?.stats?.saved_addresses),
                saved_payment_methods: toNumber(data?.stats?.saved_payment_methods),
            },
            recent_orders: sortOrders(toArray<any>(data?.recent_orders).map(normalizeOrder)),
            addresses: toArray<any>(data?.addresses).map(normalizeAddress),
            payment_methods: toArray<any>(data?.payment_methods).map(normalizePaymentMethod),
            wishlist: toArray<any>(data?.wishlist).map(normalizeWishlistItem),
            recommendations: toArray<any>(data?.recommendations).map(normalizeProduct),
        };
    } catch (error) {
        console.error("Dashboard summary failed, rebuilding from individual endpoints:", error);
        const [recent_orders, addresses, payment_methods, wishlist, recommendations] = await Promise.all([
            getUserOrders(),
            getAddresses(),
            getPaymentMethods(),
            getWishlist(),
            getProducts(),
        ]);
        return {
            stats: {
                total_orders: recent_orders.length,
                active_orders: recent_orders.filter((order) => ["pending", "processing", "shipped"].includes(order.status)).length,
                completed_orders: recent_orders.filter((order) => ["completed", "delivered"].includes(order.status)).length,
                total_spent_kes: recent_orders.reduce((sum, order) => sum + order.total_amount, 0),
                wishlist_items: wishlist.length,
                saved_addresses: addresses.length,
                saved_payment_methods: payment_methods.length,
            },
            recent_orders: recent_orders.slice(0, 20),
            addresses,
            payment_methods,
            wishlist,
            recommendations: recommendations.slice(0, 4),
        };
    }
};

export const getAddresses = async (): Promise<Address[]> => {
    try {
        const data = await apiGet<any[]>("/shop/addresses");
        return toArray<any>(data).map(normalizeAddress);
    } catch (error) {
        console.error("Error fetching addresses via API, falling back to Supabase:", error);
        const { data, error: sbError } = await supabaseShop
            .from("addresses")
            .select("*")
            .order("is_default", { ascending: false });

        if (sbError) throw sbError;
        return toArray<any>(data).map(normalizeAddress);
    }
};

export const addAddress = async (address: any): Promise<Address> => {
    const payload = buildAddressPayload(address);

    try {
        const data = await apiPost<any>("/shop/addresses", payload);
        return normalizeAddress(data);
    } catch (error) {
        console.error("Error adding address via API, falling back to Supabase:", error);
        const { data: { user } } = await supabaseShop.auth.getUser();
        const { data, error: sbError } = await supabaseShop
            .from("addresses")
            .insert({ ...payload, user_id: user?.id })
            .select()
            .single();

        if (sbError) throw sbError;
        return normalizeAddress(data);
    }
};

export const updateAddress = async (addressId: string, address: any): Promise<Address> => {
    const payload = buildAddressPayload(address);

    try {
        const data = await apiPut<any>(`/shop/addresses/${addressId}`, payload);
        return normalizeAddress(data);
    } catch (error) {
        console.error("Error updating address via API, falling back to Supabase:", error);
        const { data, error: sbError } = await supabaseShop
            .from("addresses")
            .update(payload)
            .eq("id", addressId)
            .select()
            .single();

        if (sbError) throw sbError;
        return normalizeAddress(data);
    }
};

export const deleteAddress = async (addressId: string) => {
    try {
        return await apiDelete<{ status: string }>(`/shop/addresses/${addressId}`);
    } catch (error) {
        console.error("Error deleting address via API, falling back to Supabase:", error);
        const { error: sbError } = await supabaseShop.from("addresses").delete().eq("id", addressId);
        if (sbError) throw sbError;
        return { status: "success" };
    }
};

export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
    try {
        const data = await apiGet<any[]>("/shop/payment-methods");
        return toArray<any>(data).map(normalizePaymentMethod);
    } catch (error) {
        console.error("Error fetching payment methods via API, falling back to Supabase:", error);
        const client = getPaymentsClient();
        const { data, error: sbError } = await client
            .from("payment_methods")
            .select("*")
            .eq("status", "active")
            .order("is_default", { ascending: false })
            .order("created_at", { ascending: false });

        if (sbError) throw sbError;
        return toArray<any>(data).map(normalizePaymentMethod);
    }
};

export const addPaymentMethod = async (paymentMethod: any): Promise<PaymentMethod> => {
    const payload = buildPaymentMethodPayload(paymentMethod);

    try {
        const data = await apiPost<any>("/shop/payment-methods", payload);
        return normalizePaymentMethod(data);
    } catch (error) {
        console.error("Error adding payment method via API, falling back to Supabase:", error);
        const client = getPaymentsClient();
        const { data: { user } } = await client.auth.getUser();
        const { data, error: sbError } = await client
            .from("payment_methods")
            .insert({ ...payload, user_id: user?.id })
            .select()
            .single();

        if (sbError) throw sbError;
        return normalizePaymentMethod(data);
    }
};

export const deletePaymentMethod = async (paymentId: string) => {
    try {
        return await apiDelete<{ status: string }>(`/shop/payment-methods/${paymentId}`);
    } catch (error) {
        console.error("Error deleting payment method via API, falling back to Stripe detach:", error);
        const client = getPaymentsClient();
        const { data, error: detachError } = await client.functions.invoke("process-payment", {
            body: {
                action: "detach_payment_method",
                payment_method_id: paymentId,
            },
        });

        if (detachError) throw detachError;
        return data;
    }
};

export const updatePaymentMethod = async (paymentId: string, paymentMethod: any): Promise<PaymentMethod> => {
    const payload = buildPaymentMethodPayload(paymentMethod);
    const data = await apiPut<any>(`/shop/payment-methods/${paymentId}`, payload);
    return normalizePaymentMethod(data);
};

export const getOrderTracking = async (orderId: string): Promise<TrackingInfo> => {
    try {
        const data = await apiGet<any>(`/shop/orders/${orderId}/tracking`);
        return normalizeTrackingInfo(data);
    } catch (error) {
        console.error("Error fetching tracking via API, falling back to Supabase:", error);
        const { data, error: sbError } = await supabaseShop
            .from("order_tracking")
            .select("*")
            .eq("order_id", orderId)
            .single();

        if (sbError) {
            return normalizeTrackingInfo({
                order_id: orderId,
                current_status: "pending",
                estimated_delivery: "Within 24 hours",
                events: [
                    {
                        status: "pending",
                        description: "Order received and awaiting fulfillment.",
                        created_at: new Date().toISOString(),
                    },
                ],
            });
        }

        return normalizeTrackingInfo(data);
    }
};

export const getOrder = async (orderId: string): Promise<Order> => {
    try {
        const data = await apiGet<any>(`/shop/orders/${orderId}`);
        return normalizeOrder(data);
    } catch (error) {
        console.error("Error fetching order via API, falling back to Supabase:", error);
        const { data, error: sbError } = await supabaseShop
            .from("orders")
            .select("*, items:order_items(*, product:products(*)), tracking:order_tracking(*)")
            .eq("id", orderId)
            .single();

        if (sbError) throw sbError;
        return normalizeOrder(data);
    }
};

export const cancelOrder = async (orderId: string): Promise<Order> => {
    const data = await apiPost<any>(`/shop/orders/${orderId}/cancel`, {});
    return normalizeOrder(data);
};

export const getWishlist = async (): Promise<WishlistItem[]> => {
    try {
        const data = await apiGet<any[]>("/shop/wishlist");
        return toArray<any>(data).map(normalizeWishlistItem);
    } catch (error) {
        console.error("Error fetching wishlist via API, falling back to Supabase:", error);
        try {
            const { data: { user } } = await supabaseShop.auth.getUser();
            if (!user?.id) return [];

            const { data, error: sbError } = await supabaseShop
                .from("wishlists")
                .select("*, product:products(*, variants:product_variants(*))")
                .eq("user_id", user.id);

            if (sbError) throw sbError;
            return toArray<any>(data).map(normalizeWishlistItem);
        } catch (fallbackError) {
            console.error("Supabase wishlist fallback failed:", fallbackError);
            return [];
        }
    }
};

export const toggleWishlist = async (productId: string): Promise<{ status: string; action: "added" | "removed" }> => {
    try {
        const data = await apiPost<any>(`/shop/wishlist/${productId}`, {});
        return {
            status: toString(data?.status, "success"),
            action: toString(data?.action, "added") === "removed" ? "removed" : "added",
        };
    } catch (error) {
        console.error("Error toggling wishlist via API, falling back to Supabase:", error);
        const { data: { user } } = await supabaseShop.auth.getUser();
        if (!user) throw error;

        const { data: existing } = await supabaseShop
            .from("wishlists")
            .select("*")
            .eq("user_id", user.id)
            .eq("product_id", productId)
            .maybeSingle();

        if (existing) {
            await supabaseShop
                .from("wishlists")
                .delete()
                .eq("user_id", user.id)
                .eq("product_id", productId);
            return { status: "success", action: "removed" };
        }

        await supabaseShop.from("wishlists").insert({ user_id: user.id, product_id: productId });
        return { status: "success", action: "added" };
    }
};

export const syncCart = async (_items: any[]) => ({ status: "success" });

export interface StripePaymentIntent {
    client_secret: string;
    payment_intent_id: string;
}

export interface StripeSetupIntent {
    client_secret: string;
    setup_intent_id: string;
}

export const createStripePaymentIntent = async (amount: number, currency = "kes"): Promise<StripePaymentIntent> => {
    const client = getPaymentsClient();
    const { data, error } = await client.functions.invoke("process-payment", {
        body: { amount, currency, action: "create_intent" },
    });
    if (error) throw error;
    return data;
};

export const createStripeSetupIntent = async (): Promise<StripeSetupIntent> => {
    const client = getPaymentsClient();
    const { data, error } = await client.functions.invoke("process-payment", {
        body: { action: "create_setup_intent" },
    });
    if (error) throw error;
    return data;
};

export const waitForVaultedPaymentMethod = async (
    paymentMethodId: string,
    timeoutMs = 10000,
): Promise<any | null> => {
    const client = getPaymentsClient();
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
        const { data, error } = await client
            .from("payment_methods")
            .select("*")
            .eq("stripe_payment_method_id", paymentMethodId)
            .eq("status", "active")
            .maybeSingle();

        if (error) throw error;
        if (data) return data;

        await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return null;
};

export const confirmStripePayment = async (paymentIntentId: string, orderId: string): Promise<unknown> => {
    const client = getPaymentsClient();
    const { data, error } = await client.functions.invoke("process-payment", {
        body: { action: "confirm", payment_intent_id: paymentIntentId, order_id: orderId },
    });
    if (error) throw error;
    return data;
};

export const downloadInvoice = async (orderId: string, orderNumber: string) => {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/shop/orders/${orderId}/invoice`, {
        method: "GET",
        headers: {
            ...authHeaders,
        },
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Failed to download invoice (${response.status})`);
    }

    const blob = await response.blob();
    const fileName = `Invoice-${orderNumber || orderId}.pdf`;
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
};
