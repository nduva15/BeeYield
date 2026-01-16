import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/contexts/CartContext';
import { useWishlist, WishlistItem } from '@/contexts/WishlistContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { toast } from 'sonner';
import { initializeCheckout, CheckoutOrder } from '@/services/shopService';
import {
    ShoppingCart, Truck, MapPin, Tag, Minus, Plus, X, ArrowRight,
    CheckCircle2, CreditCard, Smartphone, Shield, Loader2, ChevronRight,
    Gift, Store, Package, Heart
} from 'lucide-react';

type CheckoutStep = 'cart' | 'shipping' | 'payment';
type DeliveryMethod = 'delivery' | 'pickup';



const Checkout = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading, session } = useAuth();
    const {
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        getTotalItems,
        getTotalPrice,
        clearCart,
    } = useCart();

    // Auth modal state
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

    // Checkout state
    const [currentStep, setCurrentStep] = useState<CheckoutStep>('cart');
    const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
    const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa');
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');

    // Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
    const [couponLoading, setCouponLoading] = useState(false);

    // Tip state
    const [selectedTip, setSelectedTip] = useState<number | null>(null);
    const [customTipPercent, setCustomTipPercent] = useState('');

    // Use store credits
    const [useCredits, setUseCredits] = useState(false);
    const storeCredits = 0; // Would come from user profile

    // Wishlist state (Real)
    const { items: wishlistItems, removeFromWishlist } = useWishlist();

    // Debug logging
    useEffect(() => {
        console.log('Checkout Render:', { currentStep, cartItems: items.length, wishlistItems: wishlistItems.length });
    }, [currentStep, items, wishlistItems]);

    // Shipping details
    const [shippingDetails, setShippingDetails] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        county: '',
        postalCode: '',
        notes: '',
    });

    // Prefill shipping from user profile
    useEffect(() => {
        if (user) {
            const meta = user.user_metadata || {};
            setShippingDetails(prev => ({
                ...prev,
                fullName: `${meta.first_name || ''} ${meta.last_name || ''}`.trim() || prev.fullName,
                email: user.email || prev.email,
                phone: meta.phone || prev.phone,
                address: meta.address || prev.address,
                city: meta.city || prev.city,
                county: meta.county || prev.county,
            }));
        }
    }, [user]);

    // Pricing calculations
    const subtotal = getTotalPrice();
    const deliveryCost = deliveryMethod === 'delivery' ? (subtotal >= 5000 ? 0 : 350) : 0;
    const tipAmount = selectedTip || (customTipPercent ? (subtotal * parseFloat(customTipPercent) / 100) : 0);
    const serviceFee = Math.round(subtotal * 0.025); // 2.5% service fee
    const taxAmount = Math.round(subtotal * 0.16); // 16% VAT
    const couponDiscount = appliedCoupon ? Math.round(subtotal * appliedCoupon.discount / 100) : 0;
    const creditsApplied = useCredits ? Math.min(storeCredits, subtotal) : 0;
    const totalPayable = subtotal + deliveryCost + tipAmount + serviceFee + taxAmount - couponDiscount - creditsApplied;

    const formatPrice = (price: number) => `KES ${price.toLocaleString()}`;

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            toast.error('Please enter a coupon code');
            return;
        }
        setCouponLoading(true);
        // Simulate coupon validation
        await new Promise(r => setTimeout(r, 1000));

        // Mock coupon validation - In production, call backend API
        const validCoupons: Record<string, number> = {
            'HONEY10': 10,
            'BEEYIELD20': 20,
            'FIRST15': 15,
            'SWEET5': 5,
        };

        const discount = validCoupons[couponCode.toUpperCase()];
        if (discount) {
            setAppliedCoupon({ code: couponCode.toUpperCase(), discount });
            toast.success(`Coupon applied! ${discount}% off your order`);
        } else {
            toast.error('Invalid coupon code');
        }
        setCouponLoading(false);
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        toast.info('Coupon removed');
    };

    const handleProceedToCheckout = () => {
        if (!user) {
            setShowAuthModal(true);
            return;
        }
        navigate('/buyer-dashboard?tab=checkout');
    };

    const handleAuthSuccess = () => {
        setShowAuthModal(false);
        toast.success('Welcome! Redirecting to checkout...');
        navigate('/buyer-dashboard?tab=checkout');
    };

    const handlePlaceOrder = async () => {
        if (!user) return;

        setIsProcessing(true);
        try {
            const orderData: CheckoutOrder = {
                shipping_address: {
                    first_name: shippingDetails.fullName.split(' ')[0] || '',
                    last_name: shippingDetails.fullName.split(' ').slice(1).join(' ') || '',
                    email: shippingDetails.email,
                    phone: shippingDetails.phone,
                    address: shippingDetails.address,
                    city: shippingDetails.city,
                    county: shippingDetails.county,
                    postal_code: shippingDetails.postalCode,
                },
                payment_method: paymentMethod,
                items: items.map(item => ({
                    product_id: item.productId.toString(),
                    variant_id: item.variantId,
                    quantity: item.quantity
                })),
                total_kes: totalPayable,
                notes: shippingDetails.notes,
            };

            const response = await initializeCheckout(orderData, session?.access_token);
            await new Promise(r => setTimeout(r, 2000));
            setOrderNumber(response.order_id || `BY-${Date.now().toString(36).toUpperCase()}`);
            clearCart();
            setCurrentStep('payment');
            toast.success('Order placed successfully!');
        } catch (error) {
            toast.error('Payment failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const moveFromWishlistToCart = (item: WishlistItem) => {
        if (!item.inStock) {
            toast.error('Item is currently out of stock');
            return;
        }
        addToCart({
            productId: item.id,
            variantId: 'default',
            name: item.name,
            description: 'Moved from wishlist',
            size: 'Standard',
            price: item.price,
            quantity: 1,
            image: item.image,
            badge: null,
            category: item.category as any
        });
        removeFromWishlist(item.id);
        // toast handles in addToCart
    };



    const getCategoryEmoji = (category: string) => {
        switch (category) {
            case 'honey': return '🍯';
            case 'merch': return '👕';
            case 'education': return '📚';
            case 'hardware': return '🔧';
            default: return '📦';
        }
    };

    // Loading state
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    // Empty cart and wishlist check
    if (items.length === 0 && wishlistItems.length === 0 && currentStep !== 'payment') {
        return (
            <div className="min-h-screen bg-background">
                <div className="container max-w-6xl mx-auto px-4 py-12">
                    <div className="text-center py-20">
                        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                            <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                        <h2 className="text-3xl font-black mb-4">Your Cart is Empty</h2>
                        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                            Discover our premium honey and sustainable beekeeping products
                        </p>
                        <Button onClick={() => navigate('/shop')} size="lg" className="rounded-full px-8">
                            Start Shopping
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Order confirmation
    if (currentStep === 'payment' && orderNumber) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container max-w-2xl mx-auto px-4 py-12">
                    <Card className="border-none shadow-premium rounded-[2.5rem] p-12 text-center">
                        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6 animate-bounce">
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                        </div>
                        <h1 className="text-3xl font-black mb-4">Order Confirmed! 🎉</h1>
                        <p className="text-muted-foreground mb-8 text-lg">
                            Thank you for your purchase. We're preparing your order.
                        </p>
                        <div className="bg-muted/50 rounded-3xl p-6 inline-block mb-10 border border-border/50">
                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Order Number</p>
                            <p className="text-3xl font-black text-primary">{orderNumber}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button onClick={() => navigate('/shop')} className="rounded-full px-8">
                                Continue Shopping
                            </Button>
                            <Button variant="outline" onClick={() => navigate('/buyer-dashboard?tab=orders')} className="rounded-full px-8">
                                Track Your Order
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header with Breadcrumb */}
            <div className="border-b border-border bg-card">
                <div className="container max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <button onClick={() => navigate('/')} className="hover:text-primary">Home</button>
                        <ChevronRight className="w-4 h-4" />
                        <button onClick={() => navigate('/shop')} className="hover:text-primary">Shop</button>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-foreground font-medium">Checkout</span>
                    </div>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="border-b border-border bg-card">
                <div className="container max-w-6xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-center gap-4 md:gap-8">
                        {[
                            { id: 'cart', label: 'Cart', icon: ShoppingCart },
                            { id: 'shipping', label: 'Shipping', icon: Truck },
                            { id: 'payment', label: 'Payment', icon: CreditCard },
                        ].map((step, idx) => {
                            const isActive = step.id === currentStep;
                            const isPast = ['cart', 'shipping', 'payment'].indexOf(currentStep) > idx;
                            return (
                                <div key={step.id} className="flex items-center gap-2 md:gap-4">
                                    <div className={`flex items-center gap-2 ${isActive ? 'text-primary' : isPast ? 'text-green-600' : 'text-muted-foreground'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-primary text-white' : isPast ? 'bg-green-600 text-white' : 'bg-muted'}`}>
                                            {isPast ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-4 h-4" />}
                                        </div>
                                        <span className="font-semibold hidden sm:inline">{step.label}</span>
                                    </div>
                                    {idx < 2 && (
                                        <div className={`w-12 md:w-20 h-0.5 ${isPast ? 'bg-green-600' : 'bg-muted'}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-3xl md:text-4xl font-black mb-8">
                    {currentStep === 'cart' && 'My Cart'}
                    {currentStep === 'shipping' && 'Shipping Details'}
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Cart Items or Shipping Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {currentStep === 'cart' && (
                            <>
                                <Card className="border border-border rounded-2xl overflow-hidden">
                                    <CardHeader className="bg-muted/30 border-b border-border">
                                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                                            <ShoppingCart className="w-5 h-5 text-primary" />
                                            My Cart ({getTotalItems()})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0 divide-y divide-border">
                                        {items.length === 0 ? (
                                            <div className="p-8 text-center text-muted-foreground">
                                                Your cart is currently empty.
                                                {wishlistItems.length > 0 && (
                                                    <span className="block mt-2 font-medium text-primary">
                                                        Check your Wishlist below! 👇
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            items.map((item) => (
                                                <div key={item.id} className="p-4 md:p-6 flex gap-4 hover:bg-muted/20 transition-colors">
                                                    {/* Product Image */}
                                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden border border-border">
                                                        {item.image ? (
                                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-4xl">{getCategoryEmoji(item.category)}</span>
                                                        )}
                                                    </div>

                                                    {/* Product Details */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div>
                                                                <h3 className="font-bold text-foreground">{item.name}</h3>
                                                                <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    {item.badge && (
                                                                        <Badge variant="secondary" className="text-xs">{item.badge}</Badge>
                                                                    )}
                                                                    <span className="text-xs text-muted-foreground">Size: {item.size}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Price and Quantity */}
                                                        <div className="flex items-center justify-between mt-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-primary text-lg">{formatPrice(item.price)}</span>
                                                                {item.badge === 'Sale' && (
                                                                    <Badge variant="destructive" className="text-xs">20% OFF</Badge>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center gap-4">
                                                                {/* Quantity Controls */}
                                                                <div className="flex items-center gap-1 bg-muted rounded-lg border border-border">
                                                                    <button
                                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                        className="p-2 hover:bg-primary/10 rounded-l-lg transition-colors"
                                                                    >
                                                                        <Minus className="w-4 h-4" />
                                                                    </button>
                                                                    <span className="w-10 text-center font-semibold">{item.quantity}</span>
                                                                    <button
                                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                        className="p-2 hover:bg-primary/10 rounded-r-lg transition-colors"
                                                                    >
                                                                        <Plus className="w-4 h-4" />
                                                                    </button>
                                                                </div>

                                                                {/* Remove Button */}
                                                                <button
                                                                    onClick={() => removeFromCart(item.id)}
                                                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                                                >
                                                                    <X className="w-5 h-5" />
                                                                    <span className="text-xs">Remove</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )))}
                                    </CardContent>
                                </Card>

                                {/* Wishlist Section */}
                                {wishlistItems.length > 0 && (
                                    <Card className="border border-border rounded-2xl mt-8 shadow-sm">
                                        <CardHeader className="bg-muted/30 border-b border-border">
                                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                                <Heart className="w-5 h-5 text-primary fill-primary/20" />
                                                Your Wishlist ({wishlistItems.length})
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            {/* Table Header for larger screens */}
                                            <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-border text-xs font-black uppercase tracking-wider text-muted-foreground bg-muted/10">
                                                <div className="col-span-6 pl-2">Product</div>
                                                <div className="col-span-2">Price</div>
                                                <div className="col-span-2">Stock Status</div>
                                                <div className="col-span-2 text-center">Action</div>
                                            </div>

                                            {/* Wishlist Items */}
                                            <div className="divide-y divide-border">
                                                {wishlistItems.map((item) => (
                                                    <div key={item.id} className="p-4 flex flex-col md:grid md:grid-cols-12 gap-4 items-center group hover:bg-muted/10 transition-colors">
                                                        {/* Product */}
                                                        <div className="col-span-6 flex items-center gap-4 w-full">
                                                            <button
                                                                onClick={() => removeFromWishlist(item.id)}
                                                                className="p-1 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-border">
                                                                {item.image ? (
                                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span className="text-2xl">{getCategoryEmoji(item.category)}</span>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-foreground line-clamp-2">{item.name}</span>
                                                                <span className="text-xs text-muted-foreground md:hidden mt-1">
                                                                    {item.inStock ? 'In Stock' : 'Out of Stock'} - {formatPrice(item.price)}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Price */}
                                                        <div className="col-span-2 w-full md:w-auto hidden md:block">
                                                            <span className="font-bold">{formatPrice(item.price)}</span>
                                                        </div>

                                                        {/* Stock Status */}
                                                        <div className="col-span-2 w-full md:w-auto hidden md:block">
                                                            {item.inStock ? (
                                                                <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">In Stock</Badge>
                                                            ) : (
                                                                <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50">Out of Stock</Badge>
                                                            )}
                                                        </div>

                                                        {/* Action */}
                                                        <div className="col-span-2 w-full md:w-auto mt-2 md:mt-0">
                                                            <Button
                                                                size="sm"
                                                                disabled={!item.inStock}
                                                                onClick={() => moveFromWishlistToCart(item)}
                                                                className="w-full rounded-full bg-primary hover:bg-primary/90 text-white font-bold"
                                                            >
                                                                Add To Cart
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </>
                        )}

                        {currentStep === 'shipping' && (
                            <Card className="border border-border rounded-2xl">
                                <CardHeader className="bg-muted/30 border-b border-border">
                                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                                        <Truck className="w-5 h-5 text-primary" />
                                        Shipping Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2 space-y-2">
                                            <Label>Full Name</Label>
                                            <Input
                                                value={shippingDetails.fullName}
                                                onChange={e => setShippingDetails({ ...shippingDetails, fullName: e.target.value })}
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email</Label>
                                            <Input
                                                type="email"
                                                value={shippingDetails.email}
                                                onChange={e => setShippingDetails({ ...shippingDetails, email: e.target.value })}
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Phone Number</Label>
                                            <Input
                                                value={shippingDetails.phone}
                                                onChange={e => setShippingDetails({ ...shippingDetails, phone: e.target.value })}
                                                placeholder="+254 700 000 000"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <Label>Address</Label>
                                            <Input
                                                value={shippingDetails.address}
                                                onChange={e => setShippingDetails({ ...shippingDetails, address: e.target.value })}
                                                placeholder="123 Bee Street, Building A"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>City</Label>
                                            <Input
                                                value={shippingDetails.city}
                                                onChange={e => setShippingDetails({ ...shippingDetails, city: e.target.value })}
                                                placeholder="Nairobi"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>County</Label>
                                            <Input
                                                value={shippingDetails.county}
                                                onChange={e => setShippingDetails({ ...shippingDetails, county: e.target.value })}
                                                placeholder="Nairobi County"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <Label>Order Notes (Optional)</Label>
                                            <Textarea
                                                value={shippingDetails.notes}
                                                onChange={e => setShippingDetails({ ...shippingDetails, notes: e.target.value })}
                                                placeholder="Special delivery instructions..."
                                                rows={3}
                                            />
                                        </div>
                                    </div>

                                    {/* Payment Method Selection */}
                                    <div className="space-y-4 pt-4 border-t border-border">
                                        <Label className="text-lg font-bold">Payment Method</Label>
                                        <RadioGroup value={paymentMethod} onValueChange={v => setPaymentMethod(v as any)} className="grid gap-4">
                                            <div
                                                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${paymentMethod === 'mpesa' ? 'border-primary bg-primary/5' : 'border-border'}`}
                                                onClick={() => setPaymentMethod('mpesa')}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                                        <Smartphone className="text-green-600" />
                                                    </div>
                                                    <div>
                                                        <span className="font-bold">M-Pesa</span>
                                                        <p className="text-xs text-muted-foreground">Pay via mobile money</p>
                                                    </div>
                                                </div>
                                                <RadioGroupItem value="mpesa" />
                                            </div>
                                            <div
                                                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border'}`}
                                                onClick={() => setPaymentMethod('card')}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                                        <CreditCard className="text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <span className="font-bold">Bank Card</span>
                                                        <p className="text-xs text-muted-foreground">Credit or Debit card</p>
                                                    </div>
                                                </div>
                                                <RadioGroupItem value="card" />
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <Button variant="outline" onClick={() => setCurrentStep('cart')} className="rounded-full">
                                            Back to Cart
                                        </Button>
                                        <Button
                                            onClick={handlePlaceOrder}
                                            disabled={isProcessing || !shippingDetails.fullName || !shippingDetails.phone || !shippingDetails.address}
                                            className="flex-1 rounded-full h-12 text-lg font-bold bg-gradient-to-r from-primary to-amber-600"
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    Place Order - {formatPrice(totalPayable)}
                                                    <ArrowRight className="ml-2 w-5 h-5" />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="space-y-6">
                        {/* Coupons Section */}
                        <Card className="border border-border rounded-2xl">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Tag className="w-5 h-5 text-primary" />
                                    Coupons
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {appliedCoupon ? (
                                    <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                            <span className="font-bold text-green-700">{appliedCoupon.code}</span>
                                            <Badge variant="secondary" className="text-green-700 bg-green-100">
                                                {appliedCoupon.discount}% OFF
                                            </Badge>
                                        </div>
                                        <button onClick={handleRemoveCoupon} className="text-muted-foreground hover:text-destructive">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Coupon code"
                                            value={couponCode}
                                            onChange={e => setCouponCode(e.target.value)}
                                            className="flex-1"
                                        />
                                        <Button
                                            onClick={handleApplyCoupon}
                                            disabled={couponLoading}
                                            className="bg-foreground text-background hover:bg-foreground/90 font-bold"
                                        >
                                            {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'APPLY NOW'}
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Your Order Summary */}
                        <Card className="border border-border rounded-2xl">
                            <CardHeader className="border-b border-border">
                                <CardTitle className="text-lg font-bold">Your Order</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                {/* Subtotal */}
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal ({getTotalItems()} items)</span>
                                    <span className="font-semibold">{formatPrice(subtotal)}</span>
                                </div>

                                <Separator />

                                {/* Delivery Options */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold">Delivery</Label>
                                    <RadioGroup value={deliveryMethod} onValueChange={v => setDeliveryMethod(v as DeliveryMethod)} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <RadioGroupItem value="delivery" id="delivery" />
                                                <Label htmlFor="delivery" className="flex items-center gap-2 cursor-pointer">
                                                    <Truck className="w-4 h-4 text-primary" />
                                                    Delivery
                                                </Label>
                                            </div>
                                            <span className="font-semibold">{deliveryCost === 0 ? 'FREE' : formatPrice(deliveryCost)}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <RadioGroupItem value="pickup" id="pickup" />
                                                <Label htmlFor="pickup" className="flex items-center gap-2 cursor-pointer">
                                                    <Store className="w-4 h-4 text-secondary" />
                                                    Pick Up
                                                </Label>
                                            </div>
                                            {deliveryMethod === 'pickup' && (
                                                <Select defaultValue="nairobi">
                                                    <SelectTrigger className="w-24 h-8">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="nairobi">Nairobi</SelectItem>
                                                        <SelectItem value="mombasa">Mombasa</SelectItem>
                                                        <SelectItem value="kisumu">Kisumu</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </div>
                                    </RadioGroup>
                                </div>

                                <Separator />

                                {/* Tip Section */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold">Tip</Label>
                                    <div className="flex gap-2">
                                        {[200, 400, 700].map(amount => (
                                            <button
                                                key={amount}
                                                onClick={() => { setSelectedTip(amount); setCustomTipPercent(''); }}
                                                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${selectedTip === amount ? 'bg-primary text-white border-primary' : 'border-border hover:border-primary'}`}
                                            >
                                                {formatPrice(amount)}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            placeholder="%"
                                            value={customTipPercent}
                                            onChange={e => { setCustomTipPercent(e.target.value); setSelectedTip(null); }}
                                            className="w-16 text-center"
                                        />
                                        <Input
                                            placeholder="KES"
                                            value={tipAmount > 0 ? tipAmount.toString() : ''}
                                            readOnly
                                            className="flex-1"
                                        />
                                        <span className="text-sm text-muted-foreground">Total: {formatPrice(tipAmount)}</span>
                                    </div>
                                </div>

                                <Separator />

                                {/* Fees Breakdown */}
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Service Fee</span>
                                        <span>{formatPrice(serviceFee)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tax (VAT 16%)</span>
                                        <span>{formatPrice(taxAmount)}</span>
                                    </div>
                                    {appliedCoupon && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Coupon Discount</span>
                                            <span>-{formatPrice(couponDiscount)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Store Credits */}
                                {storeCredits > 0 && (
                                    <>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id="credits"
                                                    checked={useCredits}
                                                    onChange={e => setUseCredits(e.target.checked)}
                                                    className="rounded border-primary text-primary focus:ring-primary"
                                                />
                                                <Label htmlFor="credits" className="flex items-center gap-2 cursor-pointer text-sm">
                                                    <Gift className="w-4 h-4 text-primary" />
                                                    Use Store Credits
                                                </Label>
                                            </div>
                                            <span className="font-semibold text-primary">{formatPrice(storeCredits)}</span>
                                        </div>
                                    </>
                                )}

                                <Separator />

                                {/* Total */}
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-lg font-bold">Total Payable</span>
                                    <span className="text-2xl font-black text-primary">{formatPrice(totalPayable)}</span>
                                </div>

                                {/* Proceed Button */}
                                {currentStep === 'cart' && (
                                    <Button
                                        onClick={handleProceedToCheckout}
                                        className="w-full h-12 rounded-xl text-lg font-bold bg-gradient-to-r from-primary to-amber-600 hover:from-primary/90 hover:to-amber-600/90 shadow-glow"
                                    >
                                        PROCEED TO CHECKOUT
                                    </Button>
                                )}

                                {/* Security Badge */}
                                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10">
                                    <Shield className="w-5 h-5 text-primary" />
                                    <p className="text-xs text-muted-foreground">
                                        Your payment is secured with banking-grade encryption
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Auth Modal */}
            <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
                <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-premium p-0 overflow-hidden">
                    <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 pb-4">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black text-center">
                                Sign in to Checkout
                            </DialogTitle>
                            <p className="text-center text-muted-foreground text-sm">
                                Create an account or sign in to complete your order
                            </p>
                        </DialogHeader>
                    </div>
                    <Tabs value={authTab} onValueChange={v => setAuthTab(v as 'login' | 'register')} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mx-6 mt-2" style={{ width: 'calc(100% - 48px)' }}>
                            <TabsTrigger value="login" className="rounded-full">Sign In</TabsTrigger>
                            <TabsTrigger value="register" className="rounded-full">Create Account</TabsTrigger>
                        </TabsList>
                        <TabsContent value="login" className="p-6 pt-4">
                            <LoginForm
                                onSuccess={handleAuthSuccess}
                                onSwitchToRegister={() => setAuthTab('register')}
                            />
                        </TabsContent>
                        <TabsContent value="register" className="p-6 pt-4">
                            <RegisterForm
                                onSuccess={handleAuthSuccess}
                                onSwitchToLogin={() => setAuthTab('login')}
                            />
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Checkout;
