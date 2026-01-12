import { supabase } from '@/lib/supabase';

export const adminService = {
    // Orders
    getOrders: async () => {
        if (!supabase) return [];
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    updateOrderStatus: async (orderId: string, status: string) => {
        if (!supabase) return null;
        const { data, error } = await supabase
            .from('orders' as any)
            .update({ status })
            .eq('id', orderId)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // Newsletter
    getNewsletterSubscribers: async () => {
        if (!supabase) return [];
        const { data, error } = await supabase
            .from('newsletter_subscribers')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    // Products
    getProducts: async () => {
        if (!supabase) return [];
        const { data, error } = await supabase
            .from('products')
            .select('*, variants:product_variants(*)');
        if (error) throw error;
        return data;
    },

    createProduct: async (productData: any) => {
        if (!supabase) return null;
        const { data: product, error: productError } = await (supabase
            .from('products' as any) as any)
            .insert([{
                name: productData.name,
                description: productData.description,
                category: productData.category,
                images: productData.images
            }])
            .select()
            .single();

        if (productError) throw productError;

        // Create variant
        const { error: variantError } = await supabase
            .from('product_variants' as any)
            .insert([{
                product_id: product.id,
                size: 'Default',
                price_kes: productData.price_kes,
                stock_quantity: productData.stock_quantity,
                is_available: true
            }]);

        if (variantError) throw variantError;
        return product;
    },

    updateProduct: async (id: string, productData: any) => {
        if (!supabase) return null;
        const { data, error } = await supabase
            .from('products' as any)
            .update({
                name: productData.name,
                description: productData.description,
                category: productData.category,
                images: productData.images
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Update variant (simplified: update the first one)
        const { error: variantError } = await supabase
            .from('product_variants' as any)
            .update({
                price_kes: productData.price_kes,
                stock_quantity: productData.stock_quantity
            })
            .eq('product_id', id);

        if (variantError) throw variantError;
        return data;
    },

    deleteProduct: async (id: string) => {
        if (!supabase) return null;
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return { success: true };
    },

    // Honey Chain Batches
    getBatches: async () => {
        if (!supabase) return [];
        const { data, error } = await supabase
            .from('honey_batches')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    createBatch: async (batchData: any) => {
        if (!supabase) return null;
        const batchCode = `BY-${batchData.honey_type.slice(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
        const blockHash = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

        const { data, error } = await supabase
            .from('honey_batches' as any)
            .insert([{
                batch_code: batchCode,
                honey_type: batchData.honey_type,
                harvest_date: batchData.harvest_date,
                quantity_kg: batchData.quantity_kg,
                processing_method: batchData.processing_method,
                block_hash: blockHash
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // User Management (Super Admin)
    getUsers: async () => {
        const { apiGet } = await import('./api');
        return apiGet<any[]>('/admin/users');
    },

    updateUserRole: async (userId: string, role: string) => {
        const { apiPut } = await import('./api');
        return apiPut<{ status: string; message: string }>(`/admin/users/${userId}/role`, { role });
    },

    deleteUser: async (userId: string) => {
        const { apiDelete } = await import('./api');
        return apiDelete<{ status: string }>(`/admin/users/${userId}`);
    }
};

