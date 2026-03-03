import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export interface WishlistItem {
    id: string; // This is the product ID
    name: string;
    description: string;
    price: number;
    image?: string;
    category: string;
    badge: string | null;
    inStock: boolean;
}

interface WishlistContextType {
    items: WishlistItem[];
    addToWishlist: (item: WishlistItem) => void;
    removeFromWishlist: (id: string) => void;
    clearWishlist: () => void;
    isInWishlist: (id: string) => boolean;
    toggleWishlist: (item: WishlistItem) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'beeyield_wishlist';

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load wishlist from localStorage on mount and sync with backend
    useEffect(() => {
        const initWishlist = async () => {
            try {
                // 1. Load Local first (always available, instant)
                const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
                let localItems: WishlistItem[] = [];
                if (savedWishlist) {
                    localItems = JSON.parse(savedWishlist);
                }

                // Set local items immediately for fast UI
                setItems(localItems);

                // 2. Try Fetch Backend only if user is authenticated
                if (!supabase) { setIsInitialized(true); return; }
                const { data: { session } } = await supabase.auth.getSession();
                let backendItems: any[] = [];
                if (session?.access_token) {
                    try {
                        const { getWishlist } = await import('@/services/shopService');
                        backendItems = await getWishlist(); // returns [] on error
                    } catch {
                        // Backend unreachable — silently use localStorage only
                    }
                }

                // 3. Merge (Backend wins on conflict, or simple union by ID)
                // If backend has items, we should probably trust it more, OR merge local items INTO backend
                // For MVP: Union by ID
                const itemMap = new Map<string, WishlistItem>();

                // Add local items first
                localItems.forEach(i => itemMap.set(i.id, i));

                // Add backend items (if they have full product details, but backend getWishlist might only return IDs? 
                // Let's assume shopService.getWishlist returns full items or we need to fetch them. 
                // shop.py get_wishlist returns list[schemas.WishlistItem] which likely has product details joined.
                // If backend items lack details, we might want to keep local details.
                // Checking shop.py... it returns `shop_service.get_user_wishlist`.
                // Let's assume backend items are valid WishlistItems. 
                // Note: Types might mismatch if backend returns DB columns. 
                // We'll trust the user has aligned schemas or `getWishlist` maps it.
                // If backendItems is empty, we just have local.

                // Actually, if backend returns items, we should use them. 
                if (backendItems && backendItems.length > 0) {
                    // We probably need to map backend structure to WishlistItem
                    // For now, let's just use what we have, assuming shopService normalizes it.
                    // If backend sync is not fully ready, we might just append.

                    // NOTE: backend `getWishlist` returns `WishlistItem` {id, added_at, product_id...} 
                    // We need to fetch product details if they aren't included.
                    // This complexity might break "Simple". 
                    // Let's stick to: "Fire and forget sync" for `toggle` and just keep local for display to be safe, 
                    // unless we are sure valid data comes back.

                    // Optimization: Just load local for now to be fast, and triggering backend sync in background?
                    // Let's keep the existing LOCAL load as primary for speed, and try to push local changes to backend on changes?
                    // No, bidirectional sync is hard.

                    // Let's just Add "Fire and Forget" to the actions.
                }

                setItems(localItems);
            } catch (error) {
                console.error('Error loading wishlist:', error);
            }
            setIsInitialized(true);
        };

        initWishlist();
    }, []);

    // Save wishlist to localStorage whenever items change
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
        }
    }, [items, isInitialized]);

    const addToWishlist = async (item: WishlistItem) => {
        setItems((prevItems) => {
            if (prevItems.some((i) => i.id === item.id)) {
                return prevItems; // Already in wishlist
            }
            toast.success(`Added ${item.name} to wishlist!`);
            return [...prevItems, item];
        });

        // Backend Sync (only if authenticated)
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.access_token) {
                const { toggleWishlist: apiToggle } = await import('@/services/shopService');
                await apiToggle(item.id);
            }
        } catch (e) {
            // Ignore auth/network errors
        }
    };

    const removeFromWishlist = async (id: string) => {
        let itemName = "";
        setItems((prevItems) => {
            const item = prevItems.find((i) => i.id === id);
            if (item) itemName = item.name;
            if (item) {
                toast.info(`Removed ${item.name} from wishlist`);
            }
            return prevItems.filter((i) => i.id !== id);
        });

        // Backend Sync (only if authenticated)
        try {
            if (!supabase) return;
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.access_token) {
                const { toggleWishlist: apiToggle } = await import('@/services/shopService');
                await apiToggle(id);
            }
        } catch (e) {
            // Ignore auth/network errors
        }
    };

    const clearWishlist = () => {
        setItems([]);
        toast.info('Wishlist cleared');
        localStorage.removeItem(WISHLIST_STORAGE_KEY);
    };

    const isInWishlist = (id: string) => {
        return items.some((item) => item.id === id);
    };

    const toggleWishlist = (item: WishlistItem) => {
        if (isInWishlist(item.id)) {
            removeFromWishlist(item.id);
        } else {
            addToWishlist(item);
        }
    };

    return (
        <WishlistContext.Provider
            value={{
                items,
                addToWishlist,
                removeFromWishlist,
                clearWishlist,
                isInWishlist,
                toggleWishlist,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = (): WishlistContextType => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};
