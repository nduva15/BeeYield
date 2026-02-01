import { supabase } from '@/lib/supabase';
import { apiGet, apiPost, apiPut, apiDelete } from './api';

// Diagnostic check
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.error("FATAL: Supabase environment variables are missing in Admin Service!");
}

// Interfaces for admin data
export interface HoneyBatchInput {
    batch_code?: string;
    honey_type: string;
    harvest_date: string;
    packaged_date?: string;
    quantity_kg: number;
    processing_method: string;
    farmer_name?: string;
    farmer_phone?: string;
    beekeeper_name?: string;
    beekeeper_id?: string;
    apiary_name?: string;
    location_county?: string;
    location_region?: string;
    latitude?: number;
    longitude?: number;
    quality_grade?: string;
    certifications?: string[];
    moisture_content?: number;
    color_grade?: string;
    status?: string;
}

export interface ProductInput {
    name: string;
    description?: string;
    category: string;
    images?: string[];
    badge?: string;
    is_active?: boolean;
    variants?: {
        size: string;
        price_kes: number;
        stock_quantity: number;
        is_available?: boolean;
    }[];
}

export interface ApiaryInput {
    name: string;
    location_name?: string;
    county?: string;
    region?: string;
    latitude?: number;
    longitude?: number;
    farmer_id?: string;
    status?: string;
}

export interface HiveInput {
    hive_code: string;
    apiary_id: string;
    type?: string;
    installation_date?: string;
    last_inspection_date?: string;
    status?: string;
    notes?: string;
}

export interface FarmerInput {
    name: string;
    phone?: string;
    email?: string;
    id_number?: string;
    experience_years?: number;
    story?: string;
    latitude?: number;
    longitude?: number;
    location_name?: string;
    region?: string;
    county?: string;
    ward?: string;
    certification_status?: string;
    status?: string;
}

export interface ActivityLog {
    id: string;
    activity_type: string;
    action: string;
    entity_type: string;
    entity_id?: string;
    entity_reference?: string;
    user_email?: string;
    user_name?: string;
    created_at: string;
    metadata?: any;
}

export interface DocumentLog {
    id: string;
    document_type: string;
    document_name: string;
    file_format: string;
    category: string;
    related_entity_reference?: string;
    download_count: number;
    created_at: string;
}

export interface TracingHistory {
    id: string;
    batch_code: string;
    honey_type?: string;
    farmer_name?: string;
    trace_source: string;
    device_type?: string;
    is_authenticated: boolean;
    created_at: string;
}

export interface PaymentTransaction {
    id: string;
    order_number?: string;
    payment_method: string;
    amount_kes: number;
    status: string;
    created_at: string;
    customer_email?: string;
}

export interface AccountRecord {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    account_type: string;
    verification_status: string;
    is_active: boolean;
    created_at: string;
}

export interface InvoiceRecord {
    id: string;
    invoice_number: string;
    order_number?: string;
    customer_email?: string;
    total_kes: number;
    status: string;
    created_at: string;
}

export const adminService = {
    // ============== SEEDING ==============
    // Seeding via Supabase directly (Frontend logic)
    seedShopContent: async () => {
        return { success: true, productCount: 0 };
    },

    seedTraceabilityData: async (): Promise<{ success: boolean; batchCount?: number; error?: string }> => {
        return { success: true, batchCount: 0 };
    },

    seedApiaryHiveData: async (): Promise<{ success: boolean; apiaryCount?: number; hiveCount?: number; error?: string }> => {
        return { success: true, apiaryCount: 0, hiveCount: 0 };
    },

    // ============== ORDERS ==============
    // ============== ORDERS ==============
    getOrders: async () => {
        try {
            return await apiGet<any[]>('/admin/orders');
        } catch (error) {
            console.error("Failed to fetch orders via API, falling back to direct Supabase", error);
            if (!supabase) throw new Error("Supabase not initialized");
            const { data, error: sbError } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });
            if (sbError) throw sbError;
            return data || [];
        }
    },

    updateOrderStatus: async (orderId: string, status: string) => {
        if (!supabase) throw new Error("Supabase not initialized");
        const { data, error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', orderId)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    deleteOrder: async (orderId: string) => {
        if (!supabase) throw new Error("Supabase not initialized");
        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', orderId);
        if (error) throw error;
        return { success: true };
    },

    // ============== NEWSLETTER ==============
    getNewsletterSubscribers: async () => {
        try {
            return await apiGet<any[]>('/admin/newsletter');
        } catch (error) {
            console.error("Failed to fetch newsletter via API, falling back to direct Supabase", error);
            if (!supabase) throw new Error("Supabase not initialized");
            const { data, error: sbError } = await supabase
                .from('newsletter_subscribers')
                .select('*')
                .order('created_at', { ascending: false });
            if (sbError) throw sbError;
            return data || [];
        }
    },

    deleteNewsletterSubscriber: async (id: string) => {
        if (!supabase) throw new Error("Supabase not initialized");
        const { error } = await supabase
            .from('newsletter_subscribers')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return { success: true };
    },

    // ============== PRODUCTS ==============
    // ============== PRODUCTS ==============
    getProducts: async () => {
        try {
            return await apiGet<any[]>('/admin/products');
        } catch (error) {
            console.error("Failed to fetch products via API, falling back to direct Supabase", error);
            if (!supabase) throw new Error("Supabase not initialized");
            const { data, error: sbError } = await supabase
                .from('products')
                .select('*, product_variants(*)');
            if (sbError) throw sbError;
            return data.map(p => ({
                ...p,
                variants: p.product_variants || []
            })) || [];
        }
    },

    createProduct: async (productData: ProductInput) => {
        try {
            return await apiPost<any>('/admin/products', productData);
        } catch (error) {
            console.error("Failed to create product via API, falling back to direct Supabase", error);
            if (!supabase) throw new Error("Supabase not initialized");
            const { variants, ...pData } = productData as any;
            const { data, error: sbError } = await supabase
                .from('products')
                .insert(pData)
                .select()
                .single();
            if (sbError) throw sbError;

            if (variants && data) {
                const variantsWithId = variants.map((v: any) => ({ ...v, product_id: data.id }));
                await supabase.from('product_variants').insert(variantsWithId);
            } else if (data && (productData as any).price_kes) {
                // Support for old flat structure if needed
                await supabase.from('product_variants').insert({
                    product_id: data.id,
                    size: "Standard",
                    price_kes: (productData as any).price_kes,
                    stock_quantity: (productData as any).stock_quantity || 0,
                    is_available: true
                });
            }
            return data;
        }
    },

    updateProduct: async (id: string, productData: ProductInput) => {
        if (!supabase) throw new Error("Supabase not initialized");
        const { variants, ...pData } = productData as any;
        const { data, error } = await supabase
            .from('products')
            .update(pData)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;

        if (variants) {
            // Simplified: delete old and insert new or just update first
            await supabase.from('product_variants').delete().eq('product_id', id);
            const variantsWithId = variants.map((v: any) => ({ ...v, product_id: id }));
            await supabase.from('product_variants').insert(variantsWithId);
        }
        return data;
    },

    deleteProduct: async (id: string) => {
        if (!supabase) throw new Error("Supabase not initialized");
        const { error } = await supabase
            .from('products')
            .update({ is_active: false })
            .eq('id', id);
        if (error) throw error;
        return { success: true };
    },

    // ============== HONEY BATCHES (TRACEABILITY) ==============
    getBatches: async () => {
        try {
            const data = await apiGet<any[]>('/admin/batches');
            return data || [];
        } catch (error) {
            console.error("Failed to fetch batches via API, falling back to direct Supabase", error);
            if (!supabase) throw new Error("Supabase not initialized");

            // Try honey_batches first
            const { data, error: sbError } = await supabase
                .from('honey_batches' as any)
                .select('*')
                .order('created_at', { ascending: false });

            if (!sbError) return data || [];

            // Try batches second (fallback for different schema versions)
            const { data: bData, error: bError } = await supabase
                .from('batches' as any)
                .select('*')
                .order('created_at', { ascending: false });

            if (bError) {
                console.error("All batch fetch attempts failed:", bError);
                throw bError;
            }
            return bData || [];
        }
    },

    createBatch: async (batchData: HoneyBatchInput) => {
        try {
            return await apiPost<any>('/admin/batches', batchData);
        } catch (error) {
            console.error("Failed to create batch via API, falling back to direct Supabase", error);
            if (!supabase) throw new Error("Supabase not initialized");
            // Generate a code if missing
            if (!batchData.batch_code) {
                batchData.batch_code = `BC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            }
            const { data, error: sbError } = await supabase
                .from('honey_batches')
                .insert(batchData as any)
                .select()
                .single();
            if (sbError) throw sbError;
            return data;
        }
    },

    updateBatch: async (id: string, batchData: Partial<HoneyBatchInput>) => {
        try {
            return await apiPut<any>(`/admin/batches/${id}`, batchData);
        } catch (error) {
            console.error("Failed to update batch via API, falling back to direct Supabase", error);
            if (!supabase) throw new Error("Supabase not initialized");
            const { data, error: sbError } = await supabase
                .from('honey_batches')
                .update(batchData)
                .eq('id', id)
                .select()
                .single();
            if (sbError) throw sbError;
            return data;
        }
    },

    deleteBatch: async (id: string) => {
        try {
            return await apiDelete<any>(`/admin/batches/${id}`);
        } catch (error) {
            console.error("Failed to delete batch via API, falling back to direct Supabase", error);
            if (!supabase) throw new Error("Supabase not initialized");
            const { error: sbError } = await supabase
                .from('honey_batches')
                .delete()
                .eq('id', id);
            if (sbError) throw sbError;
            return { success: true };
        }
    },

    clearTraceability: async () => {
        return await apiDelete<any>('/admin/danger/clear-traceability');
    },

    // ============== POLLINATION REQUESTS ==============
    getPollinationRequests: async () => {
        try {
            return await apiGet<any[]>('/admin/pollination');
        } catch (error) {
            console.error("Failed to fetch pollination via API, falling back to direct Supabase", error);
            if (!supabase) throw new Error("Supabase not initialized");
            const { data, error: sbError } = await supabase
                .from('pollination_requests')
                .select('*')
                .order('created_at', { ascending: false });
            if (sbError) throw sbError;
            return data || [];
        }
    },

    updatePollinationRequestStatus: async (id: string, status: string) => {
        if (!supabase) throw new Error("Supabase not initialized");
        const { data, error } = await supabase
            .from('pollination_requests')
            .update({ status } as any)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    deletePollinationRequest: async (id: string) => {
        if (!supabase) throw new Error("Supabase not initialized");
        const { error } = await supabase
            .from('pollination_requests')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return { success: true };
    },

    // ============== CONTACT REQUESTS ==============
    getContactRequests: async () => {
        try {
            return await apiGet<any[]>('/admin/contact');
        } catch (error) {
            console.error("Failed to fetch contact via API, falling back to direct Supabase", error);
            if (!supabase) throw new Error("Supabase not initialized");
            const { data, error: sbError } = await supabase
                .from('contact_submissions')
                .select('*')
                .order('created_at', { ascending: false });
            if (sbError) throw sbError;
            return data || [];
        }
    },

    updateContactRequestStatus: async (id: string, status: string) => {
        if (!supabase) throw new Error("Supabase not initialized");
        const { data, error } = await supabase
            .from('contact_submissions')
            .update({ status })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    deleteContactRequest: async (id: string) => {
        if (!supabase) throw new Error("Supabase not initialized");
        const { error } = await supabase
            .from('contact_submissions')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return { success: true };
    },

    // ============== STOCK MOVEMENTS ==============
    getStockMovements: async () => {
        try {
            return await apiGet<any[]>('/admin/stock');
        } catch (error) {
            console.error("Failed to fetch stock via API, falling back to direct Supabase", error);
            if (!supabase) throw new Error("Supabase not initialized");
            const { data, error: sbError } = await supabase
                .from('stock_movements')
                .select('*, products(name)')
                .order('created_at', { ascending: false });
            if (sbError) throw sbError;
            return data || [];
        }
    },

    createStockMovement: async (movementData: any) => {
        if (!supabase) throw new Error("Supabase not initialized");
        const { data, error } = await supabase
            .from('stock_movements')
            .insert(movementData)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // ============== FARMERS ==============
    getFarmers: async () => {
        try {
            return await apiGet<any[]>('/admin/farmers');
        } catch (error) {
            console.error("Failed to fetch farmers via API, falling back to direct Supabase", error);
            if (!supabase) throw new Error("Supabase not initialized");
            const { data, error: sbError } = await supabase
                .from('farmers')
                .select('*')
                .order('created_at', { ascending: false });
            if (sbError) throw sbError;
            return data || [];
        }
    },

    createFarmer: async (farmerData: any) => {
        try {
            return await apiPost<any>('/admin/farmers', farmerData);
        } catch (error) {
            console.error("Failed to create farmer via API, falling back to direct Supabase", error);
            if (!supabase) throw new Error("Supabase not initialized");
            const { data, error: sbError } = await supabase
                .from('farmers')
                .insert(farmerData)
                .select()
                .single();
            if (sbError) throw sbError;
            return data;
        }
    },

    updateFarmer: async (id: string, farmerData: any) => {
        if (!supabase) throw new Error("Supabase not initialized");
        const { data, error } = await supabase
            .from('farmers')
            .update(farmerData)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    deleteFarmer: async (id: string) => {
        if (!supabase) throw new Error("Supabase not initialized");
        const { error } = await supabase
            .from('farmers')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return { success: true };
    },

    // ============== USER MANAGEMENT (Super Admin) ==============
    getUsers: async () => {
        try {
            return await apiGet<any[]>('/admin/users');
        } catch (error) {
            console.error("Failed to fetch users via API, falling back to profiles table", error);
            if (!supabase) throw new Error("Supabase not initialized");
            const { data, error: sbError } = await supabase.from('profiles').select('*');
            if (sbError) throw sbError;
            return data || [];
        }
    },

    updateUserRole: async (userId: string, role: string) => {
        try {
            return await apiPut<any>(`/admin/users/${userId}/role`, { role });
        } catch (error) {
            console.error("Failed to update user role via API", error);
            if (!supabase) throw new Error("Supabase not initialized");
            const { error: sbError } = await supabase.from('profiles').update({ role }).eq('id', userId);
            if (sbError) throw sbError;
            return { success: true };
        }
    },

    deleteUser: async (userId: string) => {
        try {
            return await apiDelete<any>(`/admin/users/${userId}`);
        } catch (error) {
            console.error("Failed to delete user via API", error);
            if (!supabase) throw new Error("Supabase not initialized");
            const { error: sbError } = await supabase.from('profiles').delete().eq('id', userId);
            if (sbError) throw sbError;
            return { success: true };
        }
    },

    // ============== DASHBOARD STATS ==============
    getDashboardStats: async () => {
        try {
            // Priority 1: Use backend API for stats (it handles smart fallbacks and blockchain sync)
            return await apiGet<any>('/admin/stats');
        } catch (error) {
            console.error("Failed to fetch dashboard stats via API, falling back to multi-query Supabase:", error);
            if (!supabase) return null;

            try {
                // Priority 2: Direct Supabase multi-query with resilience
                const batchTable = 'honey_batches';
                const { error: probeError } = await supabase.from(batchTable).select('id').limit(1);
                const actualBatchTable = probeError ? 'batches' : batchTable;

                const [
                    { count: ordersCount, data: ordersData },
                    { count: productsCount, data: productsData },
                    { count: usersCount },
                    { count: batchesCount, data: batchesData },
                    { count: apiariesCount },
                    { count: hivesCount },
                    { count: pollinationCount, data: pollinationData },
                    { count: farmersCount }
                ] = await Promise.all([
                    supabase.from('orders').select('*', { count: 'exact' }),
                    supabase.from('products').select('id, category', { count: 'exact' }),
                    supabase.from('profiles').select('id', { count: 'exact' }),
                    supabase.from(actualBatchTable as any).select('quantity_kg', { count: 'exact' }),
                    supabase.from('apiaries').select('id', { count: 'exact' }),
                    supabase.from('hives').select('id', { count: 'exact' }),
                    supabase.from('pollination_requests').select('acres', { count: 'exact' }),
                    supabase.from('farmers').select('id', { count: 'exact' })
                ]);

                const totalRevenue = (ordersData || [])
                    .filter(o => o.status !== 'cancelled')
                    .reduce((sum, o) => sum + (Number(o.total_kes) || 0), 0);

                const totalHoneyKg = ((batchesData as any[]) || [])
                    .reduce((sum, b) => sum + (Number(b.quantity_kg) || 0), 0);

                const totalAcres = (pollinationData || [])
                    .reduce((sum, p) => sum + (Number(p.acres) || 0), 0);

                const pendingOrders = (ordersData || [])
                    .filter(o => o.status === 'pending').length;

                // Product counts per category
                const honeyProducts = (productsData || []).filter(p => p.category?.toLowerCase() === 'honey').length;
                const learnProducts = (productsData || []).filter(p => p.category?.toLowerCase() === 'learn').length;
                const sensorProducts = (productsData || []).filter(p => p.category?.toLowerCase().includes('sensor')).length;
                const merchProducts = (productsData || []).filter(p => p.category?.toLowerCase() === 'merch').length;

                return {
                    total_orders: ordersCount || 0,
                    total_products: productsCount || 0,
                    total_users: usersCount || 0,
                    total_batches: batchesCount || 0,
                    total_apiaries: apiariesCount || 0,
                    total_hives: hivesCount || 0,
                    total_pollination: pollinationCount || 0,
                    total_revenue_kes: totalRevenue,
                    total_honey_kg: totalHoneyKg,
                    total_acres: totalAcres,
                    pending_orders: pendingOrders,
                    total_farmers: farmersCount || 0,
                    active_products: productsCount || 0,
                    category_counts: {
                        honey: honeyProducts,
                        learn: learnProducts,
                        sensors: sensorProducts,
                        merch: merchProducts
                    }
                };
            } catch (sbErr) {
                console.error("Supabase fallback stats failed:", sbErr);
                return null;
            }
        }
    },

    // ============== APIARIES ==============
    getApiaries: async () => {
        if (!supabase) throw new Error("Supabase not initialized");
        console.log("Fetching apiaries...");
        const { data, error } = await supabase.from('apiaries')
            .select('*, farmers(name)')
            .order('created_at', { ascending: false });
        if (error) {
            console.error("Error fetching apiaries:", error);
            throw error;
        }
        console.log(`Fetched ${data?.length || 0} apiaries`);
        return data || [];
    },

    createApiary: async (apiaryData: ApiaryInput) => {
        try {
            return await apiPost<any>('/admin/apiaries', apiaryData);
        } catch (error) {
            console.error("Failed to create apiary via API, falling back to direct Supabase", error);
            if (!supabase) throw new Error("Supabase not initialized");
            const { data, error: sbError } = await supabase
                .from('apiaries')
                .insert(apiaryData)
                .select()
                .single();
            if (sbError) throw sbError;
            return data;
        }
    },

    updateApiary: async (id: string, apiaryData: Partial<ApiaryInput>) => {
        if (!supabase) throw new Error("Supabase not initialized");
        const { data, error } = await supabase
            .from('apiaries')
            .update(apiaryData)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    deleteApiary: async (id: string) => {
        if (!supabase) throw new Error("Supabase not initialized");
        const { error } = await supabase
            .from('apiaries')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return { success: true };
    },

    // ============== HIVES ==============
    getHives: async (apiaryId?: string) => {
        if (!supabase) throw new Error("Supabase not initialized");
        console.log(`Fetching hives (apiaryId: ${apiaryId || 'all'})...`);
        let query = supabase.from('hives').select('*, apiaries(name)');
        if (apiaryId) {
            query = query.eq('apiary_id', apiaryId);
        }
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) {
            console.error("Error fetching hives:", error);
            throw error;
        }
        console.log(`Fetched ${data?.length || 0} hives`);
        return data || [];
    },

    createHive: async (hiveData: HiveInput) => {
        try {
            return await apiPost<any>('/admin/hives', hiveData);
        } catch (error) {
            console.error("Failed to create hive via API, falling back to direct Supabase", error);
            if (!supabase) throw new Error("Supabase not initialized");
            const { data, error: sbError } = await supabase
                .from('hives')
                .insert(hiveData)
                .select()
                .single();
            if (sbError) throw sbError;
            return data;
        }
    },

    updateHive: async (id: string, hiveData: HiveInput) => {
        if (!supabase) throw new Error("Supabase not initialized");
        const { data, error } = await supabase
            .from('hives')
            .update(hiveData)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    deleteHive: async (id: string) => {
        if (!supabase) throw new Error("Supabase not initialized");
        const { error } = await supabase
            .from('hives')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return { success: true };
    },

    createUser: async (userData: any) => {
        try {
            return await apiPost<any>('/admin/users', userData);
        } catch (error: any) {
            console.error("Failed to create user via API", error);
            throw error;
        }
    },

    updateUser: async (userId: string, userData: any) => {
        try {
            return await apiPut<any>(`/admin/users/${userId}`, userData);
        } catch (error) {
            console.error("Failed to update user via API", error);
            if (!supabase) throw new Error("Supabase not initialized");
            const { data, error: sbError } = await supabase.from('profiles').update(userData).eq('id', userId).select().single();
            if (sbError) throw sbError;
            return data;
        }
    },

    // ============== EXTENDED DASHBOARD ==============

    getActivityLogs: async (filters: any = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        return await apiGet<ActivityLog[]>(`/admin/activity-logs?${queryParams}`);
    },

    getActivityStats: async (days: number = 7) => {
        return await apiGet<any>(`/admin/activity-logs/stats?days=${days}`);
    },

    getGeneratedDocuments: async (filters: any = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        return await apiGet<DocumentLog[]>(`/admin/documents?${queryParams}`);
    },

    getDocumentStats: async (days: number = 30) => {
        return await apiGet<any>(`/admin/documents/stats?days=${days}`);
    },

    getTracingHistory: async (filters: any = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        return await apiGet<TracingHistory[]>(`/admin/tracing-history?${queryParams}`);
    },

    getTracingStats: async (days: number = 30) => {
        return await apiGet<any>(`/admin/tracing-history/stats?days=${days}`);
    },

    getPaymentTransactions: async (filters: any = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        return await apiGet<PaymentTransaction[]>(`/admin/payments?${queryParams}`);
    },

    getPaymentStats: async (days: number = 30) => {
        return await apiGet<any>(`/admin/payments/stats?days=${days}`);
    },

    getAccountRegistry: async (filters: any = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        return await apiGet<AccountRecord[]>(`/admin/accounts?${queryParams}`);
    },

    getAccountStats: async (days: number = 30) => {
        return await apiGet<any>(`/admin/accounts/stats?days=${days}`);
    },

    getInvoiceRegistry: async (filters: any = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        return await apiGet<InvoiceRecord[]>(`/admin/invoices?${queryParams}`);
    },

    getInvoiceStats: async (days: number = 30) => {
        return await apiGet<any>(`/admin/invoices/stats?days=${days}`);
    },

    getExtendedDashboardStats: async (days: number = 7) => {
        return await apiGet<any>(`/admin/dashboard-extended?days=${days}`);
    },

    // ============== LOGGING METHODS ==============

    logActivity: async (activity: any) => {
        return await apiPost<any>('/admin/activity-logs', activity);
    },

    logDocument: async (doc: any) => {
        return await apiPost<any>('/admin/documents', doc);
    },

    logTrace: async (trace: any) => {
        // This is a public endpoint on the backend
        return await apiPost<any>('/admin/tracing-history', trace);
    },

    logPayment: async (payment: any) => {
        return await apiPost<any>('/admin/payments', payment);
    }
};
