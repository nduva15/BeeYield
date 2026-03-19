import { supabaseShop, supabaseCEBA } from '@/lib/supabase';

// Prioritize CEBA client for admin operations, fallback to shop if not available (though unlikely)
const supabase = supabaseCEBA || supabaseShop;
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
    // ============== SEEDING / SYNC ==============
    seedData: async () => {
        try {
            return await apiPost<any>('/admin/seed-data', {});
        } catch (error) {
            console.error("Failed to seed data:", error);
            throw error;
        }
    },

    syncAll: async () => {
        try {
            return await apiPost<any>('/admin/sync-all', {});
        } catch (error) {
            console.error("Failed to sync data:", error);
            throw error;
        }
    },

    // ============== ORDERS ==============
    getOrders: async () => {
        try {
            return await apiGet<any[]>('/admin/orders');
        } catch (error) {
            console.error("Failed to fetch orders via API, falling back to direct Supabase", error);
            if (!supabase) throw new Error("Supabase not initialized", { cause: error });
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
            if (!supabase) throw new Error("Supabase not initialized", { cause: error });
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
    getProducts: async () => {
        try {
            return await apiGet<any[]>('/admin/products');
        } catch (error) {
            console.error("Failed to fetch products via API, falling back to direct Supabase", error);
            if (!supabase) throw new Error("Supabase not initialized", { cause: error });
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
            if (!supabase) throw new Error("Supabase not initialized", { cause: error });
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

    // ============== HONEY BATCHES ==============
    getBatches: async () => {
        try {
            return await apiGet<any[]>('/admin/batches');
        } catch (error) {
            console.error("Failed to fetch batches via API, falling back to direct Supabase", error);
            if (!supabase) throw new Error("Supabase not initialized", { cause: error });
            const { data, error: sbError } = await supabase
                .from('honey_batches' as any)
                .select('*')
                .order('created_at', { ascending: false });
            return data || [];
        }
    },

    createBatch: async (batchData: HoneyBatchInput) => {
        return await apiPost<any>('/admin/batches', batchData);
    },

    updateBatch: async (id: string, batchData: Partial<HoneyBatchInput>) => {
        return await apiPut<any>(`/admin/batches/${id}`, batchData);
    },

    deleteBatch: async (id: string) => {
        return await apiDelete<any>(`/admin/batches/${id}`);
    },

    // ============== FARMERS ==============
    getFarmers: async () => {
        try {
            return await apiGet<any[]>('/admin/farmers');
        } catch (error) {
            if (!supabase) throw new Error("Supabase not initialized", { cause: error });
            const { data, error: sbError } = await supabase.from('farmers').select('*');
            return data || [];
        }
    },

    createFarmer: async (farmerData: any) => {
        return await apiPost<any>('/admin/farmers', farmerData);
    },

    updateFarmer: async (id: string, data: any) => {
        return await apiPut<any>(`/admin/farmers/${id}`, data);
    },

    deleteFarmer: async (id: string) => {
        return await apiDelete<any>(`/admin/farmers/${id}`);
    },

    // ============== STOCK MOVEMENTS ==============
    getStockMovements: async () => {
        try { return await apiGet<any[]>('/admin/stock-movements'); }
        catch { return (await supabase?.from('stock_movements').select('*'))?.data || []; }
    },

    createStockMovement: async (data: any) => {
        return await apiPost<any>('/admin/stock-movements', data);
    },

    // ============== APIARIES & HIVES ==============
    getApiaries: async () => {
        try { return await apiGet<any[]>('/admin/apiaries'); }
        catch { 
            if (!supabase) return [];
            const { data } = await supabase
                .from('apiaries')
                .select('*, farmer:farmers(name)')
                .order('created_at', { ascending: false });
            return data || [];
        }
    },

    getHives: async () => {
        try { return await apiGet<any[]>('/admin/hives'); }
        catch { 
            if (!supabase) return [];
            const { data } = await supabase
                .from('hives')
                .select('*, apiary:apiaries(name), farmer:farmers(name)')
                .order('created_at', { ascending: false });
            return data || [];
        }
    },

    createApiary: async (data: any) => {
        try { return await apiPost<any>('/admin/apiaries', data); }
        catch {
            if (!supabase) throw new Error("Supabase not initialized");
            const { data: res, error } = await supabase.from('apiaries').insert(data).select().single();
            if (error) throw error;
            return res;
        }
    },

    updateApiary: async (id: string, data: any) => {
        try { return await apiPut<any>(`/admin/apiaries/${id}`, data); }
        catch {
            if (!supabase) throw new Error("Supabase not initialized");
            const { data: res, error } = await supabase.from('apiaries').update(data).eq('id', id).select().single();
            if (error) throw error;
            return res;
        }
    },

    deleteApiary: async (id: string) => {
        try { return await apiDelete<any>(`/admin/apiaries/${id}`); }
        catch {
            if (!supabase) throw new Error("Supabase not initialized");
            const { error } = await supabase.from('apiaries').delete().eq('id', id);
            if (error) throw error;
            return { success: true };
        }
    },

    createHive: async (data: any) => {
        try { return await apiPost<any>('/admin/hives', data); }
        catch {
            if (!supabase) throw new Error("Supabase not initialized");
            const { data: res, error } = await supabase.from('hives').insert(data).select().single();
            if (error) throw error;
            return res;
        }
    },

    updateHive: async (id: string, data: any) => {
        try { return await apiPut<any>(`/admin/hives/${id}`, data); }
        catch {
            if (!supabase) throw new Error("Supabase not initialized");
            const { data: res, error } = await supabase.from('hives').update(data).eq('id', id).select().single();
            if (error) throw error;
            return res;
        }
    },

    deleteHive: async (id: string) => {
        try { return await apiDelete<any>(`/admin/hives/${id}`); }
        catch {
            if (!supabase) throw new Error("Supabase not initialized");
            const { error } = await supabase.from('hives').delete().eq('id', id);
            if (error) throw error;
            return { success: true };
        }
    },

    // ============== HARVESTS ==============
    getHarvests: async () => {
        try { return await apiGet<any[]>('/admin/harvests'); }
        catch {
            if (!supabase) return [];
            const { data } = await supabase
                .from('harvests')
                .select('*, hive:hives(hive_code), farmer:farmers(name)')
                .order('harvest_date', { ascending: false });
            return data || [];
        }
    },

    createHarvest: async (data: any) => {
        try { return await apiPost<any>('/admin/harvests', data); }
        catch {
            if (!supabase) throw new Error("Supabase not initialized");
            const { data: res, error } = await supabase.from('harvests').insert(data).select().single();
            if (error) throw error;
            return res;
        }
    },

    updateHarvest: async (id: string, data: any) => {
        try { return await apiPut<any>(`/admin/harvests/${id}`, data); }
        catch {
            if (!supabase) throw new Error("Supabase not initialized");
            const { data: res, error } = await supabase.from('harvests').update(data).eq('id', id).select().single();
            if (error) throw error;
            return res;
        }
    },

    deleteHarvest: async (id: string) => {
        try { return await apiDelete<any>(`/admin/harvests/${id}`); }
        catch {
            if (!supabase) throw new Error("Supabase not initialized");
            const { error } = await supabase.from('harvests').delete().eq('id', id);
            if (error) throw error;
            return { success: true };
        }
    },

    // ============== POLLINATION ==============
    getPollinationRequests: async () => {
        try { return await apiGet<any[]>('/admin/pollination'); }
        catch { return (await supabase?.from('pollination_contracts').select('*'))?.data || []; }
    },

    updatePollinationRequestStatus: async (id: string, status: string) => {
        return await apiPut<any>(`/admin/pollination/${id}/status`, { status });
    },

    deletePollinationRequest: async (id: string) => {
        return await apiDelete<any>(`/admin/pollination/${id}`);
    },

    // ============== CONTACT ==============
    getContactRequests: async () => {
        try { return await apiGet<any[]>('/admin/contact'); }
        catch { return (await supabase?.from('contact_submissions').select('*'))?.data || []; }
    },

    updateContactRequestStatus: async (id: string, status: string) => {
        return await apiPut<any>(`/admin/contact/${id}/status`, { status });
    },

    deleteContactRequest: async (id: string) => {
        return await apiDelete<any>(`/admin/contact/${id}`);
    },

    // ============== ACTIVITY LOGS ==============
    getActivityLogs: async (filters: any) => {
        const queryParams = new URLSearchParams(filters).toString();
        return await apiGet<any[]>(`/admin/activity-logs?${queryParams}`);
    },

    getActivityStats: async (days: number) => {
        return await apiGet<any>(`/admin/activity-logs/stats?days=${days}`);
    },

    logActivity: async (activity: any) => {
        try { return await apiPost<any>('/admin/activity-logs', activity); }
        catch { return null; }
    },

    // ============== DASHBOARD STATS ==============
    getDashboardStats: async () => {
        try {
            return await apiGet<any>('/admin/stats');
        } catch (error) {
            console.error("Dashboard stats API failed, calculating from Supabase", error);
            if (!supabase) return null;

            try {
                const [
                    { count: totalOrders },
                    { count: pendingOrders },
                    { count: totalProducts },
                    { count: totalUsers },
                    { count: totalApiaries },
                    { count: totalHives },
                    { count: totalFarmers },
                    { count: totalHarvests },
                    { data: revenueData },
                    { data: weightData }
                ] = await Promise.all([
                    supabase.from('orders').select('*', { count: 'exact', head: true }),
                    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                    supabase.from('products').select('*', { count: 'exact', head: true }),
                    supabase.from('profiles').select('*', { count: 'exact', head: true }),
                    supabase.from('apiaries').select('*', { count: 'exact', head: true }),
                    supabase.from('hives').select('*', { count: 'exact', head: true }),
                    supabase.from('farmers').select('*', { count: 'exact', head: true }),
                    supabase.from('harvests').select('*', { count: 'exact', head: true }),
                    supabase.from('orders').select('total_amount').neq('status', 'cancelled'),
                    supabase.from('harvests').select('quantity_kg')
                ]);

                const totalRevenue = revenueData?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
                const totalHoneyKg = weightData?.reduce((sum, h) => sum + (Number(h.quantity_kg) || 0), 0) || 0;

                return {
                    total_orders: totalOrders || 0,
                    pending_orders: pendingOrders || 0,
                    total_products: totalProducts || 0,
                    total_users: totalUsers || 0,
                    total_apiaries: totalApiaries || 0,
                    total_hives: totalHives || 0,
                    total_farmers: totalFarmers || 0,
                    total_harvests: totalHarvests || 0,
                    total_revenue_kes: totalRevenue,
                    total_honey_kg: totalHoneyKg,
                    total_acres: 0, // Placeholder
                    category_counts: { honey: totalProducts || 0, learn: 0, sensors: 0, merch: 0 }
                };
            } catch (innerError) {
                console.error("Deep stats calculation failed:", innerError);
                return null;
            }
        }
    },

    // ============== USER MANAGEMENT ==============
    getUsers: async () => {
        return await apiGet<any[]>('/admin/users');
    },

    createUser: async (userData: any) => {
        return await apiPost<any>('/admin/users', userData);
    },

    updateUserRole: async (userId: string, role: string) => {
        return await apiPut<any>(`/admin/users/${userId}/role`, { role });
    },

    deleteUser: async (userId: string) => {
        return await apiDelete<any>(`/admin/users/${userId}`);
    },

    updateUser: async (userId: string, userData: any) => {
        try {
            return await apiPut<any>(`/admin/users/${userId}`, userData);
        } catch (error) {
            console.error("Failed to update user via API", error);
            if (!supabase) throw new Error("Supabase not initialized", { cause: error });
            const { data, error: sbError } = await supabase.from('profiles').update(userData).eq('id', userId).select().single();
            if (sbError) throw sbError;
            return data;
        }
    },

    // ============== JOB MANAGEMENT ==============
    getJobs: async () => {
        if (!supabase) throw new Error("Supabase not initialized");
        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    createJob: async (jobData: any) => {
        if (!supabase) throw new Error("Supabase not initialized");
        const { data, error } = await supabase
            .from('jobs')
            .insert(jobData)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    updateJob: async (id: string, jobData: any) => {
        if (!supabase) throw new Error("Supabase not initialized");
        const { data, error } = await supabase
            .from('jobs')
            .update(jobData)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    deleteJob: async (id: string) => {
        if (!supabase) throw new Error("Supabase not initialized");
        const { error } = await supabase
            .from('jobs')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return { success: true };
    },

    getApplications: async () => {
        if (!supabase) throw new Error("Supabase not initialized");
        const { data, error } = await supabase
            .from('job_applications')
            .select('*, jobs(title)')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    updateApplicationStatus: async (id: string, status: string) => {
        if (!supabase) throw new Error("Supabase not initialized");
        const { data, error } = await supabase
            .from('job_applications')
            .update({ status })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    getResumeSignedUrl: async (resumePath: string) => {
        if (!supabase) throw new Error("Supabase not initialized");
        const { data, error } = await supabase.storage
            .from('resumes')
            .createSignedUrl(resumePath, 3600);
        if (error) throw error;
        return data.signedUrl;
    },

    // ============== EXTENDED DASHBOARD ==============
    getGeneratedDocuments: async (filters: any = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        return await apiGet<any[]>(`/admin/documents?${queryParams}`);
    },

    getDocumentStats: async (days: number = 30) => {
        return await apiGet<any>(`/admin/documents/stats?days=${days}`);
    },

    getHistory: async (filters: any = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        return await apiGet<any[]>(`/admin/history?${queryParams}`);
    },

    getHistoryStats: async (days: number = 30) => {
        return await apiGet<any>(`/admin/history/stats?days=${days}`);
    },

    getPaymentTransactions: async (filters: any = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        return await apiGet<any[]>(`/admin/payments?${queryParams}`);
    },

    getPaymentStats: async (days: number = 30) => {
        return await apiGet<any>(`/admin/payments/stats?days=${days}`);
    },

    getAccountRegistry: async (filters: any = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        return await apiGet<any[]>(`/admin/accounts?${queryParams}`);
    },

    getAccountStats: async (days: number = 30) => {
        return await apiGet<any>(`/admin/accounts/stats?days=${days}`);
    },

    getInvoiceRegistry: async (filters: any = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        return await apiGet<any[]>(`/admin/invoices?${queryParams}`);
    },

    getInvoiceStats: async (days: number = 30) => {
        return await apiGet<any>(`/admin/invoices/stats?days=${days}`);
    },

    getExtendedDashboardStats: async (days: number = 7) => {
        return await apiGet<any>(`/admin/dashboard-extended?days=${days}`);
    },

    // ============== LOGGING METHODS ==============
    logDocument: async (doc: any) => {
        return await apiPost<any>('/admin/documents', doc);
    },

    logHistory: async (trace: any) => {
        return await apiPost<any>('/admin/history', trace);
    },

    logPayment: async (payment: any) => {
        return await apiPost<any>('/admin/payments', payment);
    }
};
