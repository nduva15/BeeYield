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

export const adminService = {
    // ============== SEEDING ==============
    seedShopContent: async () => {
        try {
            const { FALLBACK_PRODUCTS } = await import('./shopService');
            console.log(`Seeding ${FALLBACK_PRODUCTS.length} products...`);

            const results: any[] = [];
            for (const p of FALLBACK_PRODUCTS) {
                const productInput: ProductInput = {
                    name: p.name,
                    description: p.description,
                    category: p.category,
                    badge: p.badge || undefined,
                    images: p.images,
                    is_active: p.is_active,
                    variants: p.variants.map(v => ({
                        size: v.size,
                        price_kes: v.price_kes,
                        stock_quantity: v.stock_quantity,
                        is_available: v.is_available
                    }))
                };
                try {
                    const res = await adminService.createProduct(productInput);
                    results.push(res);
                } catch (e) {
                    // console.error(`Failed to seed ${p.name}`, e);
                }
            }
            return { success: true, count: results.length };
        } catch (error) {
            console.error("Failed to seed shop content:", error);
            throw error;
        }
    },

    seedTraceabilityData: async () => {
        if (!supabase) return { success: false, error: "Supabase client not available" };

        try {
            // 1. Seed Farmer Timothy Nduva
            const farmerData = {
                farmer_id: "F-MAT-001",
                name: "Timothy Nduva",
                email: "timothy@beeyield.com",
                phone: "+254712345678",
                region: "Eastern",
                county: "Makueni",
                location_name: "Kibwezi HQ",
                latitude: -2.41,
                longitude: 37.97,
                experience_years: 15,
                story: "Timothy Nduva is a master beekeeper and conservationist in Kibwezi, leading the way in sustainable honey production.",
                certification_status: "CERTIFIED",
                registration_date: "2020-05-15"
            };

            // Check if exists
            const { data: existingFarmer } = await supabase.from('farmers' as any).select('id').eq('farmer_id', 'F-MAT-001').maybeSingle();

            if (!existingFarmer) {
                const { error: farmerError } = await supabase.from('farmers' as any).insert([farmerData]);
                if (farmerError) console.error("Failed to seed farmer:", farmerError);
            }

            // 2. Seed 3 Batches
            const batches = [
                {
                    batch_code: "DEMO-001",
                    honey_type: "Kibwezi Wildflower Honey",
                    packaged_date: "2024-01-20",
                    quantity_jars: 30,
                    jar_size_grams: 500,
                    blockchain_hash: "0x0dab75f233d2ac30ca09f41148ac2e5b9069a65314db4981b8d8d65862644ea",
                    quantity_kg: 15,
                    processing_method: "Raw Filtered",
                    quality_grade: "A",
                    farmer_name: "Timothy Nduva",
                    location_county: "Makueni",
                    processing_date: "2024-01-18"
                },
                {
                    batch_code: "KIB-ACACIA-24",
                    honey_type: "Pure Acacia Honey",
                    packaged_date: "2024-02-25",
                    quantity_jars: 45,
                    jar_size_grams: 500,
                    blockchain_hash: "0x00b50ac6f4fd4e5fca9583ceb47a6ae95af06f2ddba798df7c474e1e1765eb7a",
                    quantity_kg: 22.5,
                    processing_method: "Raw Filtered",
                    quality_grade: "A",
                    farmer_name: "Timothy Nduva",
                    location_county: "Makueni",
                    processing_date: "2024-02-20"
                },
                {
                    batch_code: "KIB-GOLD-24",
                    honey_type: "Premium Golden Honey",
                    packaged_date: "2024-03-10",
                    quantity_jars: 60,
                    jar_size_grams: 500,
                    blockchain_hash: "0x00a77b296b1fcc6db13ce20593ff45da29d0168233fbe0056ff1981541ae72e2",
                    quantity_kg: 30,
                    processing_method: "Raw Filtered",
                    quality_grade: "A",
                    farmer_name: "Timothy Nduva",
                    location_county: "Makueni",
                    processing_date: "2024-03-05"
                }
            ];

            let batchCount = 0;
            for (const b of batches) {
                // Try honey_batches first (preferred by backend)
                const { data: existingHB, error: checkError } = await supabase.from('honey_batches' as any).select('id').eq('batch_code', b.batch_code).maybeSingle();

                if (checkError) console.warn(`Note: honey_batches check returned error: ${checkError.message}. This usually means the table is missing or RLS is blocking access.`);

                if (!existingHB) {
                    const { error: hbError } = await supabase.from('honey_batches' as any).insert([b]);
                    if (!hbError) {
                        batchCount++;
                    } else {
                        console.warn(`Could not insert into 'honey_batches': ${hbError.message}. Trying 'batches' table...`);
                        // Fallback to batches table
                        const { data: existingB, error: bCheckError } = await supabase.from('batches' as any).select('id').eq('batch_code', b.batch_code).maybeSingle();
                        if (!existingB) {
                            const { error: bError } = await supabase.from('batches' as any).insert([{
                                ...b,
                                total_quantity_kg: b.quantity_kg
                            }]);
                            if (!bError) {
                                batchCount++;
                            } else {
                                console.error(`Fallback failed: Could not insert into 'batches' table either: ${bError.message}. Ensure RLS policies allow inserts.`);
                            }
                        }
                    }
                }
            }

            return { success: true, batchCount };
        } catch (error) {
            console.error("Seed traceability error:", error);
            throw error;
        }
    },

    seedApiaryHiveData: async () => {
        if (!supabase) return { success: false, error: "Supabase client not available" };

        try {
            // 1. Get Timothy Nduva's ID
            const { data: farmer } = await supabase.from('farmers' as any).select('id').eq('farmer_id', 'F-MAT-001').maybeSingle() as any;
            if (!farmer) return { success: false, error: "Farmer Timothy Nduva not found. Seed traceability first." };

            // 2. Seed Apiaries
            const apiariesToSeed = [
                {
                    name: "Kibwezi East Cluster A",
                    location_name: "Kibwezi HQ",
                    county: "Makueni",
                    region: "Eastern",
                    latitude: -2.41,
                    longitude: 37.97,
                    farmer_id: farmer.id,
                    status: "active"
                },
                {
                    name: "Kibwezi West Outpost",
                    location_name: "West Riverside",
                    county: "Makueni",
                    region: "Eastern",
                    latitude: -2.42,
                    longitude: 37.95,
                    farmer_id: farmer.id,
                    status: "active"
                }
            ];

            const createdApiaries: any[] = [];
            for (const a of apiariesToSeed) {
                const { data: existing } = await supabase.from('apiaries' as any).select('id').eq('name', a.name).maybeSingle();
                if (!existing) {
                    const { data, error } = await supabase.from('apiaries' as any).insert([a]).select().single();
                    if (!error) createdApiaries.push(data);
                } else {
                    createdApiaries.push(existing);
                }
            }

            if (createdApiaries.length === 0) return { success: true, apiaryCount: 0, hiveCount: 0 };

            // 3. Seed Hives
            const hivesToSeed = [
                { hive_code: "HIVE-KIB-001", apiary_id: createdApiaries[0].id, type: "Langstroth", status: "active", notes: "Superior colony strength" },
                { hive_code: "HIVE-KIB-002", apiary_id: createdApiaries[0].id, type: "Langstroth", status: "active", notes: "Recently split" },
                { hive_code: "HIVE-KIB-003", apiary_id: createdApiaries[1].id, type: "KTB", status: "active", notes: "Traditional Kenya Top Bar" },
                { hive_code: "HIVE-KIB-004", apiary_id: createdApiaries[1].id, type: "Langstroth", status: "weak", notes: "Monitoring for mites" }
            ];

            let hiveCount = 0;
            for (const h of hivesToSeed) {
                const { data: existing } = await supabase.from('hives' as any).select('id').eq('hive_code', h.hive_code).maybeSingle();
                if (!existing) {
                    const { error } = await supabase.from('hives' as any).insert([h]);
                    if (!error) hiveCount++;
                }
            }

            return { success: true, apiaryCount: createdApiaries.length, hiveCount };
        } catch (error) {
            console.error("Seed apiary/hive error:", error);
            throw error;
        }
    },

    // ============== ORDERS ==============
    getOrders: async () => {
        try {
            return await apiGet<any[]>('/admin/orders');
        } catch (error) {
            console.warn("API getOrders failed, falling back to Supabase", error);
            if (!supabase) return [];
            const { data } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });
            return data || [];
        }
    },

    updateOrderStatus: async (orderId: string, status: string) => {
        // Prefer API if available, else Supabase
        try {
            return await apiPut(`/admin/orders/${orderId}/status`, { status });
        } catch {
            if (!supabase) return null;
            const { data, error } = await supabase
                .from('orders' as any)
                .update({ status })
                .eq('id', orderId)
                .select()
                .single();
            if (error) throw error;
            return data;
        }
    },

    deleteOrder: async (orderId: string) => {
        if (!supabase) return null;
        const { error } = await supabase
            .from('orders' as any)
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
            if (!supabase) return [];
            const { data } = await supabase
                .from('newsletter_subscribers')
                .select('*')
                .order('created_at', { ascending: false });
            return data || [];
        }
    },

    deleteNewsletterSubscriber: async (id: string) => {
        try {
            return await apiDelete(`/admin/newsletter/${id}`);
        } catch {
            if (!supabase) return null;
            const { error } = await supabase
                .from('newsletter_subscribers' as any)
                .delete()
                .eq('id', id);
            if (error) throw error;
            return { success: true };
        }
    },

    // ============== PRODUCTS ==============
    getProducts: async () => {
        try {
            return await apiGet<any[]>('/admin/products');
        } catch (error) {
            if (!supabase) return [];
            const { data } = await supabase
                .from('products')
                .select('*, variants:product_variants(*)');
            return data || [];
        }
    },

    createProduct: async (productData: ProductInput) => {
        try {
            return await apiPost('/admin/products', productData);
        } catch {
            if (!supabase) return null;
            // Fallback to Supabase logic (simplified)
            const { data: product, error: productError } = await (supabase
                .from('products' as any) as any)
                .insert([{
                    name: productData.name,
                    description: productData.description,
                    category: productData.category,
                    badge: productData.badge,
                    images: productData.images || [],
                    is_active: productData.is_active !== false
                }])
                .select()
                .single();

            if (productError) throw productError;

            // Handle variants
            if (productData.variants && productData.variants.length > 0) {
                const variantsToInsert = productData.variants.map(v => ({
                    product_id: product.id,
                    size: v.size,
                    price_kes: v.price_kes,
                    stock_quantity: v.stock_quantity,
                    is_available: v.is_available ?? true
                }));
                const { error: variantError } = await supabase
                    .from('product_variants')
                    .insert(variantsToInsert);
                if (variantError) console.error("Failed to create variants in fallback", variantError);
            }

            return product;
        }
    },

    updateProduct: async (id: string, productData: ProductInput) => {
        try {
            return await apiPut(`/admin/products/${id}`, productData);
        } catch {
            if (!supabase) return null;
            const { data, error } = await supabase
                .from('products' as any)
                .update({
                    name: productData.name,
                    description: productData.description,
                    category: productData.category,
                    images: productData.images,
                    is_active: productData.is_active
                })
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        }
    },

    deleteProduct: async (id: string) => {
        try {
            return await apiDelete(`/admin/products/${id}`);
        } catch {
            if (!supabase) return null;
            await supabase.from('product_variants').delete().eq('product_id', id);
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
            return { success: true };
        }
    },

    // ============== HONEY BATCHES (TRACEABILITY) ==============
    getBatches: async () => {
        let data: any[] = [];
        try {
            console.log("Fetching batches from API...");
            data = await apiGet<any[]>('/admin/batches');
            console.log(`API returned ${data?.length || 0} batches.`);
        } catch (error) {
            console.warn("API getBatches failed, logic falling back to Supabase", error);
        }

        // Robust fallback: if API returned nothing, check Supabase directly with multiple table names
        if (!data || data.length === 0) {
            if (!supabase) return [];

            const tableVariants = ['honey_batches', 'hney-batches', 'batches', 'harvests'];
            for (const table of tableVariants) {
                console.log(`Attempting direct Supabase fallback for ${table}...`);
                const { data: sbData, error: sbError } = await supabase
                    .from(table as any)
                    .select('*')
                    .order('created_at', { ascending: false });

                if (!sbError && sbData && sbData.length > 0) {
                    console.log(`Success! Found ${sbData.length} rows in ${table}.`);
                    return sbData;
                }
            }
        }

        return data || [];
    },

    createBatch: async (batchData: HoneyBatchInput) => {
        try {
            return await apiPost('/admin/batches', batchData);
        } catch {
            // Fallback
            if (!supabase) return null;
            const prefix = batchData.honey_type.slice(0, 3).toUpperCase().replace(/\s/g, '');
            const timestamp = Date.now().toString(36).toUpperCase();
            const batchCode = `KIB-${prefix}-${timestamp}`;
            const blockHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

            const { data, error } = await supabase
                .from('honey_batches' as any)
                .insert([{ ...batchData, batch_code: batchCode, block_hash: blockHash }])
                .select()
                .single();

            if (error) throw error;
            return data;
        }
    },

    updateBatch: async (id: string, batchData: Partial<HoneyBatchInput>) => {
        try {
            return await apiPut(`/admin/batches/${id}`, batchData);
        } catch {
            if (!supabase) return null;
            const { data, error } = await supabase
                .from('honey_batches' as any)
                .update(batchData)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        }
    },

    deleteBatch: async (id: string) => {
        try {
            return await apiDelete(`/admin/batches/${id}`);
        } catch {
            if (!supabase) return null;
            const { error } = await supabase
                .from('honey_batches' as any)
                .delete()
                .eq('id', id);
            if (error) throw error;
            return { success: true };
        }
    },

    // ============== POLLINATION REQUESTS ==============
    getPollinationRequests: async () => {
        try {
            return await apiGet<any[]>('/admin/pollination');
        } catch {
            if (!supabase) return [];
            const { data, error } = await supabase
                .from('pollination_requests')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        }
    },

    updatePollinationRequestStatus: async (id: string, status: string) => {
        try {
            return await apiPut(`/admin/pollination/${id}/status`, { status });
        } catch {
            if (!supabase) return null;
            const { data, error } = await supabase
                .from('pollination_requests')
                .update({ status } as any)
                .eq('id', parseInt(id))
                .select()
                .single();
            if (error) throw error;
            return data;
        }
    },

    deletePollinationRequest: async (id: string) => {
        try {
            return await apiDelete(`/admin/pollination/${id}`);
        } catch {
            if (!supabase) return null;
            const { error } = await supabase
                .from('pollination_requests')
                .delete()
                .eq('id', parseInt(id));
            if (error) throw error;
            return { success: true };
        }
    },

    // ============== CONTACT REQUESTS ==============
    getContactRequests: async () => {
        try {
            return await apiGet<any[]>('/admin/contact');
        } catch (error) {
            if (!supabase) return [];
            const { data } = await supabase
                .from('contact_submissions')
                .select('*')
                .order('created_at', { ascending: false });
            return data || [];
        }
    },

    updateContactRequestStatus: async (id: string, status: string) => {
        try {
            return await apiPut(`/admin/contact/${id}/status`, { status });
        } catch {
            if (!supabase) return null;
            const { data, error } = await supabase
                .from('contact_submissions')
                .update({ status })
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        }
    },

    deleteContactRequest: async (id: string) => {
        try {
            return await apiDelete(`/admin/contact/${id}`);
        } catch {
            if (!supabase) return null;
            const { error } = await supabase
                .from('contact_submissions')
                .delete()
                .eq('id', id);
            if (error) throw error;
            return { success: true };
        }
    },

    // ============== STOCK MOVEMENTS ==============
    getStockMovements: async () => {
        if (!supabase) return [];
        const { data, error } = await supabase
            .from('stock_movements' as any)
            .select('*, products(name)')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    createStockMovement: async (movementData: any) => {
        if (!supabase) return null;
        const { data, error } = await (supabase
            .from('stock_movements' as any) as any)
            .insert([movementData])
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
            if (!supabase) return [];
            const { data } = await supabase
                .from('farmers' as any)
                .select('*')
                .order('created_at', { ascending: false });
            return data || [];
        }
    },

    createFarmer: async (farmerData: any) => {
        try {
            return await apiPost('/admin/farmers', farmerData);
        } catch {
            if (!supabase) return null;
            const { data, error } = await supabase
                .from('farmers' as any)
                .insert([farmerData])
                .select()
                .single();
            if (error) throw error;
            return data;
        }
    },

    updateFarmer: async (id: string, farmerData: any) => {
        try {
            return await apiPut(`/admin/farmers/${id}`, farmerData);
        } catch {
            if (!supabase) return null;
            const { data, error } = await supabase
                .from('farmers' as any)
                .update(farmerData)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        }
    },

    deleteFarmer: async (id: string) => {
        try {
            return await apiDelete(`/admin/farmers/${id}`);
        } catch {
            if (!supabase) return null;
            const { error } = await supabase
                .from('farmers' as any)
                .delete()
                .eq('id', id);
            if (error) throw error;
            return { success: true };
        }
    },

    // ============== USER MANAGEMENT (Super Admin) ==============
    getUsers: async () => {
        try {
            return await apiGet<any[]>('/admin/users');
        } catch {
            if (!supabase) return [];
            const { data } = await supabase
                .from('profiles' as any)
                .select('*')
                .order('created_at', { ascending: false });
            return data || [];
        }
    },

    createUser: async (userData: any) => {
        return apiPost<any>('/admin/users', userData);
    },

    updateUser: async (userId: string, userData: any) => {
        try {
            return await apiPut<any>(`/admin/users/${userId}`, userData);
        } catch {
            if (!supabase) return null;
            const { data, error } = await supabase
                .from('profiles' as any)
                .update(userData)
                .eq('id', userId)
                .select()
                .single();
            if (error) throw error;
            return data;
        }
    },

    updateUserRole: async (userId: string, role: string) => {
        try {
            return await apiPut(`/admin/users/${userId}/role`, { role });
        } catch {
            if (!supabase) return null;
            const { data, error } = await supabase
                .from('profiles' as any)
                .update({ role })
                .eq('id', userId)
                .select()
                .single();
            if (error) throw error;
            return data;
        }
    },

    deleteUser: async (userId: string) => {
        try {
            return await apiDelete<{ status: string }>(`/admin/users/${userId}`);
        } catch {
            if (!supabase) return null;
            const { error } = await supabase
                .from('profiles' as any)
                .delete()
                .eq('id', userId);
            if (error) throw error;
            return { status: 'success' };
        }
    },

    // ============== DASHBOARD STATS ==============
    getDashboardStats: async () => {
        // Can be calculated frontend side from fetched data now
        return null;
    },

    // ============== APIARIES ==============
    getApiaries: async () => {
        try {
            return await apiGet<any[]>('/admin/apiaries');
        } catch (error) {
            if (!supabase) return [];
            const { data } = await supabase
                .from('apiaries' as any)
                .select('*, farmers(name)')
                .order('created_at', { ascending: false });
            return data || [];
        }
    },

    createApiary: async (apiaryData: ApiaryInput) => {
        try {
            return await apiPost('/admin/apiaries', apiaryData);
        } catch {
            if (!supabase) return null;
            const { data, error } = await supabase
                .from('apiaries' as any)
                .insert([apiaryData])
                .select()
                .single();
            if (error) throw error;
            return data;
        }
    },

    updateApiary: async (id: string, apiaryData: ApiaryInput) => {
        try {
            return await apiPut(`/admin/apiaries/${id}`, apiaryData);
        } catch {
            if (!supabase) return null;
            const { data, error } = await supabase
                .from('apiaries' as any)
                .update(apiaryData)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        }
    },

    deleteApiary: async (id: string) => {
        try {
            return await apiDelete(`/admin/apiaries/${id}`);
        } catch {
            if (!supabase) return null;
            const { error } = await supabase
                .from('apiaries' as any)
                .delete()
                .eq('id', id);
            if (error) throw error;
            return { success: true };
        }
    },

    // ============== HIVES ==============
    getHives: async () => {
        try {
            return await apiGet<any[]>('/admin/hives');
        } catch (error) {
            if (!supabase) return [];
            const { data } = await supabase
                .from('hives' as any)
                .select('*, apiaries(name)')
                .order('created_at', { ascending: false });
            return data || [];
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
