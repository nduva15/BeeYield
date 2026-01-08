/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

// Types
export interface CartItem {
    id: string;
    productId: string;
    variantId: string;
    name: string;
    description: string;
    size: string;
    price: number;
    quantity: number;
    image?: string;
    badge: string | null;
    category: 'honey' | 'merch' | 'education' | 'hardware';
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: Omit<CartItem, 'id'>) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
    isOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'beeyield_cart';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem(CART_STORAGE_KEY);
            if (savedCart) {
                setItems(JSON.parse(savedCart));
            }
        } catch (error) {
            console.error('Error loading cart from storage:', error);
        }
        setIsInitialized(true);
    }, []);

    // Save cart to localStorage whenever items change
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        }
    }, [items, isInitialized]);

    const generateId = () => `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const addToCart = (item: Omit<CartItem, 'id'>) => {
        setItems((prevItems) => {
            // Check if item with same productId and size already exists
            const existingIndex = prevItems.findIndex(
                (i) => i.productId === item.productId && i.size === item.size
            );

            if (existingIndex >= 0) {
                // Update quantity of existing item
                const updatedItems = [...prevItems];
                updatedItems[existingIndex].quantity += item.quantity;
                toast.success(`Updated ${item.name} quantity in cart!`, {
                    description: `${item.size} - Now ${updatedItems[existingIndex].quantity} items`,
                });
                return updatedItems;
            } else {
                // Add new item
                toast.success(`Added ${item.name} to cart!`, {
                    description: `${item.size} - KES ${item.price.toLocaleString()}`,
                });
                return [...prevItems, { ...item, id: generateId() }];
            }
        });
    };

    const removeFromCart = (id: string) => {
        setItems((prevItems) => {
            const item = prevItems.find((i) => i.id === id);
            if (item) {
                toast.info(`Removed ${item.name} from cart`);
            }
            return prevItems.filter((i) => i.id !== id);
        });
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(id);
            return;
        }
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.id === id ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
        toast.info('Cart cleared');
    };

    const getTotalItems = () => items.reduce((total, item) => total + item.quantity, 0);

    const getTotalPrice = () => items.reduce((total, item) => total + item.price * item.quantity, 0);

    const openCart = () => setIsOpen(true);
    const closeCart = () => setIsOpen(false);
    const toggleCart = () => setIsOpen((prev) => !prev);

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getTotalItems,
                getTotalPrice,
                isOpen,
                openCart,
                closeCart,
                toggleCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
