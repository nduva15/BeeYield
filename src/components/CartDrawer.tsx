import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

const CartDrawer: React.FC = () => {
    const navigate = useNavigate();
    const {
        items,
        isOpen,
        closeCart,
        removeFromCart,
        updateQuantity,
        getTotalItems,
        getTotalPrice,
    } = useCart();

    const formatPrice = (price: number) => `KES ${price.toLocaleString()}`;

    const handleCheckout = () => {
        closeCart();
        navigate({ to: '/checkout' });
    };

    const getCategoryEmoji = (category: string) => {
        switch (category) {
            case 'honey':
                return '🍯';
            case 'merch':
                return '👕';
            case 'education':
                return '📚';
            default:
                return '📦';
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={closeCart}
            />

            {/* Drawer */}
            <div
                className={`fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border shadow-2xl z-50 transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-full">
                            <ShoppingBag className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-lg">Your Cart</h2>
                            <p className="text-sm text-muted-foreground">
                                {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={closeCart}
                        className="p-2 rounded-full hover:bg-muted transition-colors"
                        aria-label="Close cart"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Cart Content */}
                <div className="flex flex-col h-[calc(100%-80px)]">
                    {items.length === 0 ? (
                        /* Empty State */
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                                <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Your cart is empty</h3>
                            <p className="text-muted-foreground mb-6">
                                Discover our premium honey and sustainable products!
                            </p>
                            <Button variant="default" onClick={() => { closeCart(); navigate({ to: '/shop' }); }}>
                                Continue Shopping
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Items List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="group flex gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/30 transition-all duration-200"
                                    >
                                        {/* Product Icon */}
                                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-3xl">{getCategoryEmoji(item.category)}</span>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h4 className="font-medium text-foreground truncate">
                                                        {item.name}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="secondary" className="text-xs">
                                                            {item.size}
                                                        </Badge>
                                                        {item.badge && (
                                                            <Badge variant="outline" className="text-xs">
                                                                {item.badge}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                                                    aria-label="Remove item"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between mt-3">
                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="p-1 rounded hover:bg-background transition-colors"
                                                        aria-label="Decrease quantity"
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </button>
                                                    <span className="w-8 text-center font-medium text-sm">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="p-1 rounded hover:bg-background transition-colors"
                                                        aria-label="Increase quantity"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>

                                                {/* Price */}
                                                <span className="font-semibold text-primary">
                                                    {formatPrice(item.price * item.quantity)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer with Total & Checkout */}
                            <div className="border-t border-border p-4 bg-muted/30">
                                {/* Subtotal */}
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-medium">{formatPrice(getTotalPrice())}</span>
                                </div>
                                <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span className="text-sm text-muted-foreground">Calculated at checkout</span>
                                </div>

                                {/* Total */}
                                <div className="flex items-center justify-between mb-4">
                                    <span className="font-semibold text-lg">Total</span>
                                    <span className="font-bold text-xl text-primary">
                                        {formatPrice(getTotalPrice())}
                                    </span>
                                </div>

                                {/* Checkout Button */}
                                <Button
                                    className="w-full h-12 text-base font-semibold gap-2 bg-gradient-to-r from-primary to-amber-600 hover:from-primary/90 hover:to-amber-600/90"
                                    onClick={handleCheckout}
                                >
                                    Proceed to Checkout
                                    <ArrowRight className="h-5 w-5" />
                                </Button>

                                {/* Continue Shopping */}
                                <Button
                                    variant="ghost"
                                    className="w-full mt-2"
                                    onClick={() => { closeCart(); navigate({ to: '/shop' }); }}
                                >
                                    Continue Shopping
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default CartDrawer;
