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

export const adminService = {
    // ============== SEEDING ==============
    // Seeding via Supabase directly (Frontend logic)
    seedShopContent: async () => {
        if (!supabase) throw new Error("Supabase not initialized");

        const products = [
            // HONEY
            {
                name: "Highland Blossom Honey",
                description: "Rare, multi-floral honey harvested from the pristine Aberdare highlands. Delicate floral notes with a smooth, lingering finish.",
                category: "honey",
                is_active: true,
                badge: "Bestseller",
                images: ["https://images.unsplash.com/photo-1587049352846-4a222e784d38"],
                variants: [
                    { size: "250g", price_kes: 850, stock_quantity: 100 },
                    { size: "500g", price_kes: 1500, stock_quantity: 75 },
                    { size: "1kg", price_kes: 2800, stock_quantity: 50 }
                ]
            },
            {
                name: "Savannah Gold Honey",
                description: "Rich, amber honey with distinctive citrus and acacia undertones from the Kibwezi savannah. Bold and energizing.",
                category: "honey",
                is_active: true,
                badge: "Premium",
                images: ["https://images.unsplash.com/photo-1558611848-73f7eb4001a1"],
                variants: [
                    { size: "250g", price_kes: 950, stock_quantity: 80 },
                    { size: "500g", price_kes: 1700, stock_quantity: 60 },
                    { size: "1kg", price_kes: 3200, stock_quantity: 40 }
                ]
            },
            {
                name: "Mara Wildflower Honey",
                description: "Exquisite wildflower honey from the Maasai Mara region. Complex, aromatic profile with hints of wild herbs and grassland blooms.",
                category: "honey",
                is_active: true,
                badge: "Limited Edition",
                images: ["https://images.unsplash.com/photo-1471943311424-646960669fac"],
                variants: [
                    { size: "250g", price_kes: 1100, stock_quantity: 40 },
                    { size: "500g", price_kes: 2000, stock_quantity: 30 }
                ]
            },
            // HARDWARE
            {
                name: "ApiSense Sentinel Node",
                description: "Advanced IoT hive monitor with acoustic disease detection, temperature, and humidity sensors.",
                category: "hardware",
                is_active: true,
                badge: "New Technology",
                images: ["https://images.unsplash.com/photo-1517420704952-d9f39e95b43e"],
                variants: [
                    { size: "Standard Unit", price_kes: 15000, stock_quantity: 25 }
                ]
            }
        ];

        let count = 0;
        for (const p of products) {
            // Check if product exists
            const { data: existingProduct } = await supabase.from('products').select('id').eq('name', p.name).maybeSingle();

            if (!existingProduct) {
                const { variants, ...productData } = p;
                const { data: inserted } = await supabase.from('products').insert(productData).select().single();

                if (inserted && variants) {
                    const variantsToInsert = variants.map(v => ({
                        ...v,
                        product_id: inserted.id,
                        is_available: true
                    }));
                    await supabase.from('product_variants').insert(variantsToInsert);
                    count++;
                }
            }
        }
        return { success: true, productCount: count };
    },

    seedTraceabilityData: async (): Promise<{ success: boolean; batchCount?: number; error?: string }> => {
        if (!supabase) throw new Error("Supabase not initialized");
        try {
            // 1. Ensure Farmer Exists
            const farmer = {
                name: "Timothy Nduva",
                phone: "+254 700 000 000",
                email: "timothy@beeyield.com",
                county: "Makueni",
                region: "Kibwezi",
                farmer_id: "F-MAT-001",
                experience_years: 15,
                story: "Timothy Nduva is a master beekeeper and conservationist in Kibwezi, leading the way in sustainable honey production. With 15 years of experience, he manages multiple apiaries across Makueni County, mentoring young beekeepers and championing the 50/50 harvest promise."
            };

            // Check if farmer exists
            const { data: existingFarmer } = await supabase.from('farmers').select('id').eq('name', farmer.name).maybeSingle();

            if (!existingFarmer) {
                await supabase.from('farmers').insert(farmer);
            }

            // 2. Create 3 Batches (Official Demo Batches)
            const batches = [
                {
                    batch_code: "DEMO-001",
                    honey_type: "Savannah Wildflower",
                    harvest_date: "2024-01-15",
                    quantity_kg: 15.5,
                    processing_method: "Raw Centrifuged",
                    farmer_name: "Timothy Nduva",
                    location_county: "Makueni",
                    location_region: "Kibwezi",
                    status: "verified",
                    block_hash: "0xDEADBEEF0001883"
                },
                {
                    batch_code: "KIB-ACACIA-24",
                    honey_type: "Organic Acacia",
                    harvest_date: "2024-02-12",
                    quantity_kg: 22.0,
                    processing_method: "Raw Filtered",
                    farmer_name: "Timothy Nduva",
                    location_county: "Makueni",
                    location_region: "Kibwezi",
                    status: "verified",
                    block_hash: "0xACAC1A2024B4"
                },
                {
                    batch_code: "KIB-GOLD-24",
                    honey_type: "Savannah Gold",
                    harvest_date: "2024-03-15",
                    quantity_kg: 28.0,
                    processing_method: "Traditional Extraction",
                    farmer_name: "Timothy Nduva",
                    location_county: "Makueni",
                    location_region: "Kibwezi",
                    status: "verified",
                    block_hash: "0xG0LD24000004"
                }
            ];

            let count = 0;
            for (const batch of batches) {
                const { data: existingBatch } = await supabase.from('honey_batches').select('id').eq('batch_code', batch.batch_code).maybeSingle();
                if (!existingBatch) {
                    await supabase.from('honey_batches').insert(batch);
                    count++;
                }
            }

            return { success: true, batchCount: count };
        } catch (err: any) {
            console.error("Seeding error:", err);
            return { success: false, error: err.message };
        }
    },

    seedApiaryHiveData: async (): Promise<{ success: boolean; apiaryCount?: number; hiveCount?: number; error?: string }> => {
        if (!supabase) throw new Error("Supabase not initialized");
        try {
            // 1. Ensure Farmer Timothy Nduva exists for linking
            const { data: farmer } = await supabase.from('farmers').select('id').eq('name', 'Timothy Nduva').maybeSingle();
            const farmerId = farmer?.id;

            // 2. Official Apiaries
            const apiaries = [
                { name: "Kibwezi Savannah Apiary", location_name: "Kibwezi", county: "Makueni", region: "Eastern", status: "active", farmer_id: farmerId },
                { name: "Mutomo Acacia Reserve", location_name: "Mutomo", county: "Makueni", region: "Eastern", status: "active", farmer_id: farmerId },
                { name: "Mwingi Heritage Apiary", location_name: "Mwingi Central", county: "Makueni", region: "Eastern", status: "active", farmer_id: farmerId }
            ];

            let aCount = 0;
            let hCount = 0;

            for (const a of apiaries) {
                let apiaryId;
                const { data: existingApiary } = await supabase.from('apiaries').select('id').eq('name', a.name).maybeSingle();

                if (!existingApiary) {
                    const { data: insertedApiary } = await supabase.from('apiaries').insert(a).select().single();
                    apiaryId = insertedApiary?.id;
                    aCount++;
                } else {
                    apiaryId = existingApiary.id;
                }

                if (apiaryId) {
                    // Seed some hives for each apiary if empty
                    const { count } = await supabase.from('hives').select('id', { count: 'exact', head: true }).eq('apiary_id', apiaryId);

                    if (count === 0) {
                        const hives = [
                            {
                                hive_code: `${a.name.split(' ')[0].toUpperCase()}-01`,
                                apiary_id: apiaryId,
                                type: "Langstroth",
                                status: "active",
                                installation_date: "2022-01-15"
                            },
                            {
                                hive_code: `${a.name.split(' ')[0].toUpperCase()}-02`,
                                apiary_id: apiaryId,
                                type: "Kenya Top Bar",
                                status: "active",
                                installation_date: "2023-03-20"
                            }
                        ];
                        await supabase.from('hives').insert(hives);
                        hCount += 2;
                    }
                }
            }

            return { success: true, apiaryCount: aCount, hiveCount: hCount };
        } catch (err: any) {
            console.error("Seeding error:", err);
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
    }
};
