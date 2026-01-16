import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

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

    // Load wishlist from localStorage on mount
    useEffect(() => {
        try {
            const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
            if (savedWishlist) {
                setItems(JSON.parse(savedWishlist));
            }
        } catch (error) {
            console.error('Error loading wishlist from storage:', error);
        }
        setIsInitialized(true);
    }, []);

    // Save wishlist to localStorage whenever items change
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
        }
    }, [items, isInitialized]);

    const addToWishlist = (item: WishlistItem) => {
        setItems((prevItems) => {
            if (prevItems.some((i) => i.id === item.id)) {
                return prevItems; // Already in wishlist
            }
            toast.success(`Added ${item.name} to wishlist!`);
            return [...prevItems, item];
        });
    };

    const removeFromWishlist = (id: string) => {
        setItems((prevItems) => {
            const item = prevItems.find((i) => i.id === id);
            if (item) {
                toast.info(`Removed ${item.name} from wishlist`);
            }
            return prevItems.filter((i) => i.id !== id);
        });
    };

    const clearWishlist = () => {
        setItems([]);
        toast.info('Wishlist cleared');
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
