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
        const controller = new AbortController();
        const signal = controller.signal;

        const initWishlist = async () => {
            try {
                // 1. Load Local first (always available, instant)
                const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
                let localItems: WishlistItem[] = [];
                if (savedWishlist) {
                    localItems = JSON.parse(savedWishlist);
                }

                if (signal.aborted) return;
                setItems(localItems);

                // 2. Try Fetch Backend only if user is authenticated
                if (!supabase) {
                    if (!signal.aborted) setIsInitialized(true);
                    return;
                }

                const { data: { session } } = await supabase.auth.getSession();
                if (signal.aborted) return;

                if (session?.access_token) {
                    try {
                        const { getWishlist } = await import('@/services/shopService');
                        if (signal.aborted) return;

                        const backendItems = await getWishlist(); // returns [] on error
                        if (signal.aborted) return;

                        if (backendItems && backendItems.length > 0) {
                            // Merge logic could go here, for now we trust local + backend union
                            // Simplified for the current implementation
                        }
                    } catch (e: any) {
                        if (e.name !== 'AbortError') {
                            console.warn('Backend wishlist sync failed, using local only');
                        }
                    }
                }
            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    console.error('Error loading wishlist:', error);
                }
            } finally {
                if (!signal.aborted) {
                    setIsInitialized(true);
                }
            }
        };

        initWishlist();
        return () => controller.abort();
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
