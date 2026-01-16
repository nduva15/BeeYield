import { supabase } from '@/lib/supabase';

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

export const adminService = {
    // ============== SEEDING ==============
    // Seeding via Supabase directly (Frontend logic)
    seedShopContent: async () => {
        if (!supabase) throw new Error("Supabase not initialized");
        const products = [
            { name: "Acacia Honey", description: "Pure honey from Acacia trees", category: "honey", is_active: true, images: ["https://images.unsplash.com/photo-1587049352846-4a222e784d38"] },
            { name: "Wildflower Honey", description: "Honey from varied wildflowers", category: "honey", is_active: true, images: ["https://images.unsplash.com/photo-1558611848-73f7eb4001a1"] },
            { name: "Manuka Honey", description: "Premium Manuka honey", category: "premium", is_active: true, images: ["https://images.unsplash.com/photo-1471943311424-646960669fac"] },
            { name: "HiveGuard Sensor", description: "Real-time temperature and humidity monitoring.", category: "sensors", is_active: true, images: ["https://images.unsplash.com/photo-1517420704952-d9f39e95b43e"] }
        ];

        for (const p of products) {
            const { data: inserted } = await supabase.from('products').insert(p).select().single();
            if (inserted) {
                await supabase.from('product_variants').insert({
                    product_id: inserted.id,
                    size: "Standard",
                    price_kes: 1200,
                    stock_quantity: 50
                });
            }
        }
        return { success: true };
    },

    seedTraceabilityData: async (): Promise<{ success: boolean; batchCount?: number; error?: string }> => {
        if (!supabase) throw new Error("Supabase not initialized");
        try {
            // 1. Ensure Farmer Exists
            const farmer = {
                name: "Timothy Nduva",
                phone: "+254700000000",
                email: "timothy@beeyield.com",
                county: "Makueni",
                region: "Kibwezi"
            };
            const { data: insertedFarmer } = await supabase.from('farmers').insert(farmer).select().single();

            // 2. Create 3 Batches
            const batches = [
                {
                    batch_code: "BATCH-2024-001",
                    honey_type: "Acacia",
                    harvest_date: "2024-01-10",
                    quantity_kg: 280,
                    processing_method: "Raw Filtered",
                    farmer_name: "Timothy Nduva",
                    location_county: "Makueni",
                    location_region: "Kibwezi",
                    status: "verified"
                },
                {
                    batch_code: "BATCH-2024-002",
                    honey_type: "Wildflower",
                    harvest_date: "2024-01-15",
                    quantity_kg: 250,
                    processing_method: "Raw Filtered",
                    farmer_name: "Timothy Nduva",
                    location_county: "Makueni",
                    location_region: "Kibwezi",
                    status: "verified"
                },
                {
                    batch_code: "BATCH-2024-003",
                    honey_type: "Blossom",
                    harvest_date: "2024-02-01",
                    quantity_kg: 353,
                    processing_method: "Raw Filtered",
                    farmer_name: "Timothy Nduva",
                    location_county: "Kitui",
                    location_region: "Mwingi",
                    status: "verified"
                }
            ];

            const { error } = await supabase.from('honey_batches').insert(batches);
            if (error) throw error;
            return { success: true, batchCount: batches.length };
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    },

    seedApiaryHiveData: async (): Promise<{ success: boolean; apiaryCount?: number; hiveCount?: number; error?: string }> => {
        if (!supabase) throw new Error("Supabase not initialized");
        try {
            // Simplified seed - Ensure 1 Apiary
            const apiary = { name: "Kibwezi East Cluster A", location_name: "Kibwezi", county: "Makueni", status: "active" };
            const { data: insertedApiary, error: aError } = await supabase.from('apiaries').insert(apiary).select().single();
            if (aError) throw aError;

            if (insertedApiary) {
                const hives = [
                    { hive_code: "H-KIB-001", apiary_id: insertedApiary.id, type: "Langstroth", status: "active" },
                    { hive_code: "H-KIB-002", apiary_id: insertedApiary.id, type: "Langstroth", status: "active" }
                ];
                const { error: hError } = await supabase.from('hives').insert(hives);
                if (hError) throw hError;
            }
            return { success: true, apiaryCount: 1, hiveCount: 2 };
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    },

    // ============== ORDERS ==============
    getOrders: async () => {
        if (!supabase) throw new Error("Supabase not initialized");
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
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
        if (!supabase) throw new Error("Supabase not initialized");
        const { data, error } = await supabase
            .from('newsletter_subscribers')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
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
        if (!supabase) throw new Error("Supabase not initialized");
        const { data, error } = await supabase
            .from('products')
            .select('*, product_variants(*)');
        if (error) throw error;
        // Map variants to match frontend expectation if needed, although the dashboard seems to handle product.variants
        return data.map(p => ({
            ...p,
            variants: p.product_variants || [] // Map the joined table
        })) || [];
    },

    createProduct: async (productData: ProductInput) => {
        if (!supabase) throw new Error("Supabase not initialized");
        const { variants, ...pData } = productData as any;
        const { data, error } = await supabase
            .from('products')
            .insert(pData)
            .select()
            .single();
        if (error) throw error;

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
        if (!supabase) throw new Error("Supabase not initialized");
        console.log("Fetching batches...");
        const { data, error } = await supabase
            .from('honey_batches')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) {
            console.error("Error fetching batches:", error);
            throw error;
        }
        console.log(`Fetched ${data?.length || 0} batches`);
        return data || [];
    },

    createBatch: async (batchData: HoneyBatchInput) => {
        if (!supabase) throw new Error("Supabase not initialized");
        // Generate a code if missing
        if (!batchData.batch_code) {
            batchData.batch_code = `BC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        }
        const { data, error } = await supabase
            .from('honey_batches')
            .insert(batchData as any)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    updateBatch: async (id: string, batchData: Partial<HoneyBatchInput>) => {
        if (!supabase) throw new Error("Supabase not initialized");
        const { data, error } = await supabase
            .from('honey_batches')
            .update(batchData)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    deleteBatch: async (id: string) => {
        if (!supabase) throw new Error("Supabase not initialized");
        const { error } = await supabase
            .from('honey_batches')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return { success: true };
    },

    // ============== POLLINATION REQUESTS ==============
    getPollinationRequests: async () => {
        if (!supabase) throw new Error("Supabase not initialized");
        const { data, error } = await supabase
            .from('pollination_requests')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
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
        if (!supabase) throw new Error("Supabase not initialized");
        const { data, error } = await supabase
            .from('contact_submissions')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
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
        if (!supabase) throw new Error("Supabase not initialized");
        const { data, error } = await supabase
            .from('stock_movements')
            .select('*, products(name)')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
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
        if (!supabase) throw new Error("Supabase not initialized");
        console.log("Fetching farmers...");
        const { data, error } = await supabase
            .from('farmers')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) {
            console.error("Error fetching farmers:", error);
            throw error;
        }
        console.log(`Fetched ${data?.length || 0} farmers`);
        return data || [];
    },

    createFarmer: async (farmerData: any) => {
        if (!supabase) throw new Error("Supabase not initialized");
        const { data, error } = await supabase
            .from('farmers')
            .insert(farmerData)
            .select()
            .single();
        if (error) throw error;
        return data;
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
        if (!supabase) throw new Error("Supabase not initialized");
        const { data, error } = await supabase
            .from('profiles')
            .select('*');
        if (error) throw error;
        return data || [];
    },

    updateUserRole: async (userId: string, role: string) => {
        if (!supabase) throw new Error("Supabase not initialized");
        const { error } = await supabase
            .from('profiles')
            .update({ role })
            .eq('id', userId);
        if (error) throw error;
        return { success: true };
    },

    deleteUser: async (userId: string) => {
        // Technically needs service role to delete from auth.users
        // Here we just remove the profile
        if (!supabase) throw new Error("Supabase not initialized");
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);
        if (error) throw error;
        return { success: true };
    },

    // ============== DASHBOARD STATS ==============
    getDashboardStats: async () => {
        if (!supabase) return null;
        try {
            // In a better world, we'd use an RPC or a single complex query
            // But for simplicity and reliability, we do parallel counts
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
                supabase.from('honey_batches').select('quantity_kg', { count: 'exact' }),
                supabase.from('apiaries').select('id', { count: 'exact' }),
                supabase.from('hives').select('id', { count: 'exact' }),
                supabase.from('pollination_requests').select('acres', { count: 'exact' }),
                supabase.from('farmers').select('id', { count: 'exact' })
            ]);

            const totalRevenue = (ordersData || [])
                .filter(o => o.status !== 'cancelled')
                .reduce((sum, o) => sum + (Number(o.total_kes) || 0), 0);

            const totalHoneyKg = (batchesData || [])
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
        } catch (error) {
            console.error("Failed to fetch dashboard stats via Supabase:", error);
            return null;
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
        if (!supabase) throw new Error("Supabase not initialized");
        const { data, error } = await supabase
            .from('apiaries')
            .insert(apiaryData)
            .select()
            .single();
        if (error) throw error;
        return data;
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
        if (!supabase) throw new Error("Supabase not initialized");
        const { data, error } = await supabase
            .from('hives')
            .insert(hiveData)
            .select()
            .single();
        if (error) throw error;
        return data;
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

    // Placeholder for createUser since it usually requires admin privileges not available in anon key
    createUser: async (userData: any) => {
        console.warn("User creation usually requires Service Role. Attempting profile insert.");
        if (!supabase) throw new Error("Supabase not initialized");
        // This is a profile creation, actual user must be created via auth
        return { error: "User creation must be handled via Auth/Service Role. Profile created manually if ID exists." };
    },

    updateUser: async (userId: string, userData: any) => {
        if (!supabase) throw new Error("Supabase not initialized");
        const { data, error } = await supabase
            .from('profiles')
            .update(userData)
            .eq('id', userId)
            .select()
            .single();
        if (error) throw error;
        return data;
    }
};
