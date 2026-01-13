import { supabase } from '@/lib/supabase';
import { apiGet, apiDelete, apiPut, apiPost } from './api';

// Interfaces for admin data
export interface HoneyBatchInput {
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

const getAuthHeaders = async (): Promise<Record<string, string>> => {
    if (!supabase) return {};
    const { data: { session } } = await supabase.auth.getSession();
    return session ? { Authorization: `Bearer ${session.access_token}` } : {};
};

export const adminService = {
    // ============== SEEDING ==============
    seedShopContent: async () => {
        try {
            const headers = await getAuthHeaders();
            return await apiPost<any>('/admin/seed/shop', {}, { headers });
        } catch (error) {
            console.error("Failed to seed shop content:", error);
            throw error;
        }
    },

    seedTraceabilityData: async () => {
        try {
            const headers = await getAuthHeaders();
            return await apiPost<any>('/admin/seed/traceability', {}, { headers });
        } catch (error) {
            console.error("Seed traceability error:", error);
            throw error;
        }
    },

    seedApiaryHiveData: async () => {
        try {
            const headers = await getAuthHeaders();
            return await apiPost<any>('/admin/seed/apiary-hives', {}, { headers });
        } catch (error) {
            console.error("Seed apiary/hive error:", error);
            throw error;
        }
    },

    // ============== ORDERS ==============
    getOrders: async () => {
        try {
            const headers = await getAuthHeaders();
            return await apiGet<any[]>('/admin/orders', {}, { headers });
        } catch (error) {
            console.error("API getOrders failed:", error);
            throw error;
        }
    },

    updateOrderStatus: async (orderId: string, status: string) => {
        try {
            const headers = await getAuthHeaders();
            return await apiPut(`/admin/orders/${orderId}/status`, { status }, { headers });
        } catch (error) {
            console.error("API updateOrderStatus failed:", error);
            throw error;
        }
    },

    deleteOrder: async (orderId: string) => {
        try {
            const headers = await getAuthHeaders();
            return await apiDelete(`/admin/orders/${orderId}`, { headers });
        } catch (error) {
            console.error("API deleteOrder failed:", error);
            throw error;
        }
    },

    // ============== NEWSLETTER ==============
    getNewsletterSubscribers: async () => {
        try {
            const headers = await getAuthHeaders();
            return await apiGet<any[]>('/admin/newsletter', {}, { headers });
        } catch (error) {
            console.error("API getNewsletterSubscribers failed:", error);
            throw error;
        }
    },

    deleteNewsletterSubscriber: async (id: string) => {
        try {
            const headers = await getAuthHeaders();
            return await apiDelete(`/admin/newsletter/${id}`, { headers });
        } catch (error) {
            console.error("API deleteNewsletterSubscriber failed:", error);
            throw error;
        }
    },

    // ============== PRODUCTS ==============
    getProducts: async () => {
        try {
            const headers = await getAuthHeaders();
            return await apiGet<any[]>('/admin/products', {}, { headers });
        } catch (error) {
            console.error("API getProducts failed:", error);
            throw error;
        }
    },

    createProduct: async (productData: ProductInput) => {
        try {
            const headers = await getAuthHeaders();
            return await apiPost('/admin/products', productData, { headers });
        } catch (error) {
            console.error("API createProduct failed:", error);
            throw error;
        }
    },

    updateProduct: async (id: string, productData: ProductInput) => {
        try {
            const headers = await getAuthHeaders();
            return await apiPut(`/admin/products/${id}`, productData, { headers });
        } catch (error) {
            console.error("API updateProduct failed:", error);
            throw error;
        }
    },

    deleteProduct: async (id: string) => {
        try {
            const headers = await getAuthHeaders();
            return await apiDelete(`/admin/products/${id}`, { headers });
        } catch (error) {
            console.error("API deleteProduct failed:", error);
            throw error;
        }
    },

    // ============== HONEY BATCHES (TRACEABILITY) ==============
    getBatches: async () => {
        try {
            const headers = await getAuthHeaders();
            return await apiGet<any[]>('/admin/batches', {}, { headers });
        } catch (error) {
            console.error("API getBatches failed:", error);
            throw error;
        }
    },

    createBatch: async (batchData: HoneyBatchInput) => {
        try {
            const headers = await getAuthHeaders();
            return await apiPost('/admin/batches', batchData, { headers });
        } catch (error) {
            console.error("API createBatch failed:", error);
            throw error;
        }
    },

    updateBatch: async (id: string, batchData: Partial<HoneyBatchInput>) => {
        try {
            const headers = await getAuthHeaders();
            return await apiPut(`/admin/batches/${id}`, batchData, { headers });
        } catch (error) {
            console.error("API updateBatch failed:", error);
            throw error;
        }
    },

    deleteBatch: async (id: string) => {
        try {
            const headers = await getAuthHeaders();
            return await apiDelete(`/admin/batches/${id}`, { headers });
        } catch (error) {
            console.error("API deleteBatch failed:", error);
            throw error;
        }
    },

    // ============== POLLINATION REQUESTS ==============
    getPollinationRequests: async () => {
        try {
            const headers = await getAuthHeaders();
            return await apiGet<any[]>('/admin/pollination', {}, { headers });
        } catch (error) {
            console.error("API getPollinationRequests failed:", error);
            throw error;
        }
    },

    updatePollinationRequestStatus: async (id: string, status: string) => {
        try {
            const headers = await getAuthHeaders();
            return await apiPut(`/admin/pollination/${id}/status`, { status }, { headers });
        } catch (error) {
            console.error("API updatePollinationRequestStatus failed:", error);
            throw error;
        }
    },

    deletePollinationRequest: async (id: string) => {
        try {
            const headers = await getAuthHeaders();
            return await apiDelete(`/admin/pollination/${id}`, { headers });
        } catch (error) {
            console.error("API deletePollinationRequest failed:", error);
            throw error;
        }
    },

    // ============== CONTACT REQUESTS ==============
    getContactRequests: async () => {
        try {
            const headers = await getAuthHeaders();
            return await apiGet<any[]>('/admin/contact', {}, { headers });
        } catch (error) {
            console.error("API getContactRequests failed:", error);
            throw error;
        }
    },

    updateContactRequestStatus: async (id: string, status: string) => {
        try {
            const headers = await getAuthHeaders();
            return await apiPut(`/admin/contact/${id}/status`, { status }, { headers });
        } catch (error) {
            console.error("API updateContactRequestStatus failed:", error);
            throw error;
        }
    },

    deleteContactRequest: async (id: string) => {
        try {
            const headers = await getAuthHeaders();
            return await apiDelete(`/admin/contact/${id}`, { headers });
        } catch (error) {
            console.error("API deleteContactRequest failed:", error);
            throw error;
        }
    },

    // ============== STOCK MOVEMENTS ==============
    getStockMovements: async () => {
        try {
            const headers = await getAuthHeaders();
            return await apiGet<any[]>('/admin/stock', {}, { headers });
        } catch (error) {
            console.error("API getStockMovements failed:", error);
            throw error;
        }
    },

    createStockMovement: async (movementData: any) => {
        try {
            const headers = await getAuthHeaders();
            return await apiPost('/admin/stock', movementData, { headers });
        } catch (error) {
            console.error("API createStockMovement failed:", error);
            throw error;
        }
    },

    // ============== FARMERS ==============
    getFarmers: async () => {
        try {
            const headers = await getAuthHeaders();
            return await apiGet<any[]>('/admin/farmers', {}, { headers });
        } catch (error) {
            console.error("API getFarmers failed:", error);
            throw error;
        }
    },

    createFarmer: async (farmerData: any) => {
        try {
            const headers = await getAuthHeaders();
            return await apiPost('/admin/farmers', farmerData, { headers });
        } catch (error) {
            console.error("API createFarmer failed:", error);
            throw error;
        }
    },

    updateFarmer: async (id: string, farmerData: any) => {
        try {
            const headers = await getAuthHeaders();
            return await apiPut(`/admin/farmers/${id}`, farmerData, { headers });
        } catch (error) {
            console.error("API updateFarmer failed:", error);
            throw error;
        }
    },

    deleteFarmer: async (id: string) => {
        try {
            const headers = await getAuthHeaders();
            return await apiDelete(`/admin/farmers/${id}`, { headers });
        } catch (error) {
            console.error("API deleteFarmer failed:", error);
            throw error;
        }
    },

    // ============== USER MANAGEMENT (Super Admin) ==============
    getUsers: async () => {
        try {
            const headers = await getAuthHeaders();
            return await apiGet<any[]>('/admin/users', {}, { headers });
        } catch (error) {
            console.error("API getUsers failed:", error);
            throw error;
        }
    },

    createUser: async (userData: any) => {
        try {
            const headers = await getAuthHeaders();
            return await apiPost<any>('/admin/users', userData, { headers });
        } catch (error) {
            console.error("API createUser failed:", error);
            throw error;
        }
    },

    updateUser: async (userId: string, userData: any) => {
        try {
            const headers = await getAuthHeaders();
            return await apiPut<any>(`/admin/users/${userId}`, userData, { headers });
        } catch (error) {
            console.error("API updateUser failed:", error);
            throw error;
        }
    },

    updateUserRole: async (userId: string, role: string) => {
        try {
            const headers = await getAuthHeaders();
            return await apiPut(`/admin/users/${userId}/role`, { role }, { headers });
        } catch (error) {
            console.error("API updateUserRole failed:", error);
            throw error;
        }
    },

    deleteUser: async (userId: string) => {
        try {
            const headers = await getAuthHeaders();
            return await apiDelete<{ status: string }>(`/admin/users/${userId}`, { headers });
        } catch (error) {
            console.error("API deleteUser failed:", error);
            throw error;
        }
    },

    // ============== DASHBOARD STATS ==============
    getDashboardStats: async () => {
        try {
            const headers = await getAuthHeaders();
            return await apiGet<any>('/admin/stats', {}, { headers });
        } catch (error) {
            console.error("API getDashboardStats failed:", error);
            return null;
        }
    },

    // ============== APIARIES ==============
    getApiaries: async () => {
        try {
            const headers = await getAuthHeaders();
            return await apiGet<any[]>('/admin/apiaries', {}, { headers });
        } catch (error) {
            console.error("API getApiaries failed:", error);
            throw error;
        }
    },

    createApiary: async (apiaryData: ApiaryInput) => {
        try {
            const headers = await getAuthHeaders();
            return await apiPost('/admin/apiaries', apiaryData, { headers });
        } catch (error) {
            console.error("API createApiary failed:", error);
            throw error;
        }
    },

    updateApiary: async (id: string, apiaryData: Partial<ApiaryInput>) => {
        try {
            const headers = await getAuthHeaders();
            return await apiPut(`/admin/apiaries/${id}`, apiaryData, { headers });
        } catch (error) {
            console.error("API updateApiary failed:", error);
            throw error;
        }
    },

    deleteApiary: async (id: string) => {
        try {
            const headers = await getAuthHeaders();
            return await apiDelete(`/admin/apiaries/${id}`, { headers });
        } catch (error) {
            console.error("API deleteApiary failed:", error);
            throw error;
        }
    },

    // ============== HIVES ==============
    getHives: async (apiaryId?: string) => {
        try {
            const headers = await getAuthHeaders();
            const params = apiaryId ? { apiary_id: apiaryId } : {};
            return await apiGet<any[]>('/admin/hives', params, { headers });
        } catch (error) {
            console.error("API getHives failed:", error);
            throw error;
        }
    },

    createHive: async (hiveData: HiveInput) => {
        try {
            return await apiPost('/admin/hives', hiveData);
        } catch {
            if (!supabase) return null;
            const { data, error } = await supabase
                .from('hives' as any)
                .insert([hiveData])
                .select()
                .single();
            if (error) throw error;
            return data;
        }
    },

    updateHive: async (id: string, hiveData: HiveInput) => {
        try {
            return await apiPut(`/admin/hives/${id}`, hiveData);
        } catch {
            if (!supabase) return null;
            const { data, error } = await supabase
                .from('hives' as any)
                .update(hiveData)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        }
    },

    deleteHive: async (id: string) => {
        try {
            return await apiDelete(`/admin/hives/${id}`);
        } catch {
            if (!supabase) return null;
            const { error } = await supabase
                .from('hives' as any)
                .delete()
                .eq('id', id);
            if (error) throw error;
            return { success: true };
        }
    }
};
