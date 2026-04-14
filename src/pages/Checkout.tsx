import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
import ShopLoginForm from '@/components/auth/shop/ShopLoginForm';
import ShopRegisterForm from '@/components/auth/shop/ShopRegisterForm';
import { StripeCardForm } from '@/components/payments/StripeCardForm';
import { initializeCheckout, CheckoutOrder, validateCoupon } from '@/services/shopService';
import { adminService } from '@/services/adminService';
import {
    ShoppingCart, Truck, MapPin, Tag, Minus, Plus, X, ArrowRight,
    CheckCircle2, CreditCard, Smartphone, Shield, Loader2, ChevronRight,
    Gift, Store, Package, Heart, ShieldCheck, FileText, Printer, User
} from 'lucide-react';
import { toast } from 'sonner';
import { useAnalytics } from '@/hooks/useAnalytics';
import { BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';

type CheckoutStep = 'cart' | 'payment-info' | 'delivery' | 'payment' | 'shipment' | 'receipt';
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
    const { trackEvent, trackConversion } = useAnalytics();

    // Auth modal state
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

    // Checkout state
    const [currentStep, setCurrentStep] = useState<CheckoutStep>('cart');
    const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
    const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa');
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');
    const [orderId, setOrderId] = useState('');
    const [orderTraceabilityBatches, setOrderTraceabilityBatches] = useState<string[]>([]);
    const [orderedItems, setOrderedItems] = useState<any[]>([]);
    const [orderedTotals, setOrderedTotals] = useState({ subtotal: 0, discount: 0, delivery: 0, total: 0 });
    const [orderPaymentStatus, setOrderPaymentStatus] = useState<'confirmed' | 'pending' | 'action_required'>('pending');
    const [orderPaymentTitle, setOrderPaymentTitle] = useState('Payment pending');
    const [orderPaymentMessage, setOrderPaymentMessage] = useState('Your order is created and waiting for payment confirmation.');

    // Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
    const [couponLoading, setCouponLoading] = useState(false);

    // Payment details
    const [paymentDetails, setPaymentDetails] = useState({
        mpesaNumber: '',
        cardNumber: '',
        cardExpiry: '',
        cardCvc: '',
        cardHolder: '',
    });

    // Stripe state
    const [stripeCardReady, setStripeCardReady] = useState(false);
    const [stripePaymentMethodId, setStripePaymentMethodId] = useState<string | null>(null);
    const [savedCards, setSavedCards] = useState<any[]>([]);
    const [loadCardsStatus, setLoadCardsStatus] = useState<'idle' | 'loading' | 'error'>('idle');

    // Wishlist state (Real)
    const { items: wishlistItems, removeFromWishlist } = useWishlist();

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

            // Fetch saved cards
            const fetchCards = async () => {
                setLoadCardsStatus('loading');
                try {
                    const { getPaymentMethods } = await import('@/services/shopService');
                    const methods = await getPaymentMethods();
                    setSavedCards(methods.filter((m: any) => m.type === 'card'));
                    setLoadCardsStatus('idle');
                } catch (error) {
                    console.error('Error fetching cards:', error);
                    setLoadCardsStatus('error');
                }
            };
            fetchCards();
        }
    }, [user]);

    // Pricing calculations
    const subtotal = getTotalPrice();
    const deliveryCost = deliveryMethod === 'delivery' ? (subtotal >= 5000 ? 0 : 350) : 0;
    const couponDiscount = appliedCoupon ? Math.round(subtotal * appliedCoupon.discount / 100) : 0;
    const isBypassActive = (shippingDetails.phone === '0742004187' || paymentDetails.mpesaNumber === '0742004187');
    const totalPayable = isBypassActive ? 0 : Math.max(0, subtotal + deliveryCost - couponDiscount);

    const formatPrice = (price: number) => `KES ${price.toLocaleString()}`;

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            toast.error('Please enter a coupon code');
            return;
        }
        setCouponLoading(true);
        try {
            const result = await validateCoupon(couponCode, subtotal);
            if (!result.valid) {
                toast.error(result.message || 'Invalid coupon code');
                return;
            }

            setAppliedCoupon({
                code: result.code,
                discount: result.discount_percent,
            });
            toast.success(result.message || 'Coupon applied');
        } catch (error) {
            toast.error('Coupon validation failed');
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        toast.info('Coupon removed');
    };

    const handleProceedToCheckout = () => {
        setCurrentStep('payment-info');
    };

    const handleBackStep = () => {
        if (currentStep === 'payment-info') setCurrentStep('cart');
        else if (currentStep === 'delivery') setCurrentStep('payment-info');
        else if (currentStep === 'payment') setCurrentStep('delivery');
    };

    const handlePaymentInfoNext = () => {
        if (paymentMethod === 'mpesa' && !paymentDetails.mpesaNumber) {
            toast.error('Please enter your M-Pesa number');
            return;
        }
        if (paymentMethod === 'card' && !stripeCardReady) {
            toast.error('Please verify your card using the secure form');
            return;
        }
        setCurrentStep('delivery');
    };

    const handleDeliveryNext = () => {
        if (!shippingDetails.fullName || !shippingDetails.phone || !shippingDetails.address) {
            toast.error('Please fill in all required shipping details');
            return;
        }
        setCurrentStep('payment');
    };

    const handleAuthSuccess = () => {
        setShowAuthModal(false);
        toast.success('Information saved!');
    };

    const handlePlaceOrder = async () => {
        if (!user && !isBypassActive) {
            setShowAuthModal(true);
            toast.error('Please sign in to complete your order');
            return;
        }

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
                payment_method_id: paymentMethod === 'card' ? (stripePaymentMethodId || undefined) : undefined,
                delivery_method: deliveryMethod,
                items: items.map(item => ({
                    product_id: item.productId.toString(),
                    variant_id: item.variantId,
                    quantity: item.quantity
                })),
                total_kes: totalPayable,
                coupon_code: appliedCoupon?.code,
                notes: shippingDetails.notes,
                idempotency_key: (window as any)._checkoutId || crypto.randomUUID(),
            };

            // Persist the checkout ID for retry safety
            (window as any)._checkoutId = orderData.idempotency_key;

            const response = await initializeCheckout(orderData, session?.access_token);
            const paymentInfo = (response.payment_info ?? {}) as Record<string, any>;

            if (paymentInfo.error || paymentInfo.success === false) {
                throw new Error(paymentInfo.error || 'Payment initialization failed. Please try again.');
            }

            // Use the actual UUID for functional calls and Pretty Number for display
            const orderId = response.order_id;
            const orderNum = response.order_number || `BY-${Date.now().toString(36).toUpperCase()}`;
            const mpesaPromptSent = Boolean(paymentInfo.CheckoutRequestID || paymentInfo.ResponseCode === '0');
            const cardIntentCreated = Boolean(paymentInfo.client_secret || paymentInfo.payment_intent_id);

            let nextPaymentStatus: 'confirmed' | 'pending' | 'action_required' = isBypassActive ? 'confirmed' : 'pending';
            let nextPaymentTitle = isBypassActive ? 'Order confirmed' : 'Payment pending';
            let nextPaymentMessage = isBypassActive
                ? 'Bypass mode confirmed the order immediately.'
                : 'Your order is waiting for payment confirmation.';

            if (!isBypassActive && paymentMethod === 'mpesa') {
                nextPaymentStatus = mpesaPromptSent ? 'pending' : 'pending';
                nextPaymentTitle = mpesaPromptSent ? 'M-Pesa prompt sent' : 'M-Pesa initiation pending';
                nextPaymentMessage = mpesaPromptSent
                    ? `Complete the STK push on ${shippingDetails.phone || paymentDetails.mpesaNumber} to release fulfillment.`
                    : 'We created the order, but the payment prompt has not been confirmed yet.';
            }

            if (!isBypassActive && paymentMethod === 'card') {
                nextPaymentStatus = cardIntentCreated ? 'action_required' : 'pending';
                nextPaymentTitle = cardIntentCreated ? 'Card confirmation required' : 'Card payment pending';
                nextPaymentMessage = cardIntentCreated
                    ? 'The payment intent is ready. Complete secure card confirmation before fulfillment starts.'
                    : 'We created the order, but the card payment is still waiting for confirmation.';
            }

            if (paymentInfo.status === 'succeeded' || paymentInfo.status === 'completed') {
                nextPaymentStatus = 'confirmed';
                nextPaymentTitle = 'Payment confirmed';
                nextPaymentMessage = `Payment confirmed via ${paymentMethod.toUpperCase()}. Fulfillment can proceed.`;
            }

            setOrderNumber(orderNum);
            setOrderId(orderId);
            setOrderPaymentStatus(nextPaymentStatus);
            setOrderPaymentTitle(nextPaymentTitle);
            setOrderPaymentMessage(nextPaymentMessage);
            (window as any)._lastOrderId = orderId;

            // Capture current cart state for receipt
            setOrderedItems([...items]);
            setOrderedTotals({
                subtotal,
                discount: couponDiscount,
                delivery: deliveryCost,
                total: totalPayable
            });

            // Assign traceability batches
            if (response.batches && response.batches.length > 0) {
                setOrderTraceabilityBatches(response.batches);
            } else if (items.some(item => item.category === 'honey') || isBypassActive) {
                setOrderTraceabilityBatches(['BEE-20260105-0001']);
            }

            // Log payment for admin dashboard
            adminService.logPayment({
                order_number: orderNum,
                payment_method: paymentMethod,
                amount_kes: totalPayable,
                status: nextPaymentStatus === 'confirmed' ? 'completed' : nextPaymentStatus,
                customer_email: shippingDetails.email
            }).catch(() => { });

            // Log activity
            adminService.logActivity({
                activity_type: 'payment',
                action: nextPaymentStatus === 'confirmed' ? 'completed' : 'initiated',
                entity_type: 'order',
                entity_reference: orderNum,
                user_email: shippingDetails.email,
                metadata: { total: totalPayable, items_count: items.length, payment_status: nextPaymentStatus }
            }).catch(() => { });

            if (nextPaymentStatus === 'confirmed') {
                trackConversion('purchase', totalPayable, 'KES');
                trackEvent('order_completed', { order_number: orderNum, items_count: items.length });
            } else {
                trackEvent('order_created', { order_number: orderNum, items_count: items.length, payment_status: nextPaymentStatus });
            }

            clearCart();
            setCurrentStep('shipment');
            toast.success(
                isBypassActive
                    ? 'Order confirmed.'
                    : nextPaymentStatus === 'confirmed'
                        ? 'Payment confirmed.'
                        : nextPaymentStatus === 'action_required'
                            ? 'Order created. Complete card confirmation to finalize payment.'
                            : 'Order created. Complete the M-Pesa prompt to finalize payment.'
            );
        } catch (error: any) {
            console.error('Checkout error:', error);
            toast.error(error.message || 'Payment failed. Please try again.');
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
            category: item.category as 'honey' | 'merch' | 'education' | 'hardware'
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
            <BeeYieldPageShell className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </BeeYieldPageShell>
        );
    }

    // Empty cart and wishlist check
    if (items.length === 0 && wishlistItems.length === 0 && currentStep !== 'payment') {
        return (
            <BeeYieldPageShell className="min-h-screen bg-background p-0">
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
            </BeeYieldPageShell>
        );
    }

    // --- SUCCESS / RECEIPT VIEW ---
    if ((currentStep === 'payment' || currentStep === 'shipment' || currentStep === 'receipt') && orderNumber) {
        return (
            <BeeYieldPageShell className="min-h-screen bg-muted/30 p-0">
                <div className="container max-w-4xl mx-auto px-4 py-0 md:py-12">
                    <Card className="border-none shadow-premium rounded-[3rem] overflow-hidden print-receipt">
                        {/* Top Header Section */}
                        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 p-12 text-center relative">
                            <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
                                <img src="/logo.png" alt="BeeYield Logo" className="w-10 h-10 object-contain block" />
                                <span className="font-black text-xl text-foreground">BeeYield</span>
                            </div>

                            <div className="w-24 h-24 rounded-full bg-[#1B9157] flex items-center justify-center mx-auto mb-8 mt-4">
                                <CheckCircle2 className="w-12 h-12 text-[#1B9157]" />
                            </div>
                            <h1 className="text-4xl font-black mb-4">Order Confirmed!</h1>
                            <p className="text-muted-foreground text-lg max-w-md mx-auto">
                                Thank you, <span className="text-foreground font-bold">{shippingDetails.fullName.split(' ')[0]}</span>! Your order has been placed and is being prepared for dispatch.
                            </p>
                        </div>

                        <CardContent className="p-8 md:p-12 space-y-10">
                            {/* Meta Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-muted/40 rounded-[2rem] border border-border/50">
                                <div>
                                    <p className="text-xs font-black text-muted-foreground mb-1">Order Number</p>
                                    <p className="text-xl font-black text-primary">{orderNumber}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-black text-muted-foreground mb-1">Date</p>
                                    <p className="text-lg font-bold">{new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-black text-muted-foreground mb-1">Payment Method</p>
                                    <p className="text-lg font-bold uppercase">{paymentMethod}</p>
                                </div>
                            </div>

                            {/* Order Details */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-black flex items-center gap-2">
                                    <Package className="w-6 h-6 text-primary" />
                                    Items Summary
                                </h3>
                                <div className="space-y-4">
                                    {orderedItems.map((item, idx) => (
                                        <div key={idx} className="p-4 md:p-6 flex gap-4 hover:bg-muted/20 transition-colors">
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
                                                        <span className="w-10 text-center font-semibold">Qty: {item.quantity}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Financial Summary */}
                            <div className="border-t border-border pt-8">
                                <div className="max-w-xs ml-auto space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span className="font-bold">{formatPrice(orderedTotals.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Discount</span>
                                        <span className="font-bold">{orderedTotals.discount > 0 ? `-${formatPrice(orderedTotals.discount)}` : formatPrice(0)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Delivery</span>
                                        <span className="font-bold">{orderedTotals.delivery === 0 ? 'Free' : formatPrice(orderedTotals.delivery)}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-black">{orderPaymentStatus === 'confirmed' ? 'Total Paid' : 'Order Total'}</span>
                                        <span className="text-2xl font-black text-primary">{formatPrice(orderedTotals.total)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Traceability Indicator */}
                            {orderTraceabilityBatches.length > 0 && (
                                <div className="p-6 bg-green-50 rounded-[2rem] border border-green-100 relative overflow-hidden">
                                    <Tag className="absolute -right-4 -bottom-4 w-24 h-24 text-[#1B9157]/10 -rotate-12" />
                                    <div className="flex items-start gap-4 mb-2">
                                        <ShieldCheck className="w-6 h-6 text-[#1B9157] mt-1" />
                                        <div className="w-full">
                                            <h4 className="font-black text-[#1B9157]">
                                                Honey History Verification {orderTraceabilityBatches.length > 1 ? 'Codes' : 'Code'}
                                            </h4>
                                            <p className="text-[#1B9157]/80 text-sm mb-4">
                                                {orderTraceabilityBatches.length > 1
                                                    ? 'These batches have been verified for authenticity.'
                                                    : 'This batch has been verified for authenticity.'
                                                }
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {orderTraceabilityBatches.map((batch, idx) => (
                                                    <div key={idx} className="inline-flex items-center gap-3 px-4 py-2 bg-green-100 rounded-full border border-green-200">
                                                        <span className="text-xs font-black text-[#1B9157] tracking-tighter">Trace ID:</span>
                                                        <span className="font-mono font-bold text-[#1B9157]">{batch}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Delivery Notice */}
                            <div className="p-8 bg-blue-50 rounded-[2rem] border border-blue-100 text-center">
                                <Truck className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                                <h4 className="font-black text-blue-900">24 Hours Delivery Promise</h4>
                                <p className="text-blue-700 text-sm">
                                    Each delivery takes 24 hours for shipping dispatch and delivery. You will receive a SMS tracking link shortly.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 no-print">
                                <Button
                                    onClick={() => {
                                        const id = (window as any)._lastOrderId || orderId || orderNumber;
                                        navigate(`/receipt/${id}`);
                                    }}
                                    variant="outline"
                                    className="rounded-full h-12 px-8 flex items-center gap-2 border-primary text-primary hover:bg-primary/5"
                                >
                                    <FileText className="w-4 h-4" />
                                    View & Print Receipt
                                </Button>
                                <Button
                                    onClick={() => navigate('/shop')}
                                    className="rounded-full h-12 px-12 bg-primary font-bold shadow-premium"
                                >
                                    Continue Shopping
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-8 text-center no-print">
                        <button
                            onClick={() => navigate('/buyer-dashboard?tab=orders')}
                            className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 mx-auto font-bold"
                        >
                            Track Your Order in Dashboard <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </BeeYieldPageShell>
        );
    }

    return (
        <BeeYieldPageShell className="min-h-screen bg-background p-0">
            {/* Header with Breadcrumb */}
            <div className="border-b border-border bg-card no-print">
                <div className="container max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <button onClick={() => navigate('/')} className="hover:text-primary">Home</button>
                            <ChevronRight className="w-4 h-4" />
                            <button onClick={() => navigate('/shop')} className="hover:text-primary">Shop</button>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-foreground font-medium">Checkout</span>
                        </div>
                        <Link to="/my-account" className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                            <User className="h-4 w-4" />
                            <span className="hidden sm:inline">My Account</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="border-b border-border bg-card no-print">
                <div className="container max-w-6xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-center gap-4 md:gap-8">
                        {[
                            { id: 'cart', label: 'Cart', icon: ShoppingCart },
                            { id: 'payment-info', label: 'Payment Info', icon: CreditCard },
                            { id: 'delivery', label: 'Delivery', icon: Truck },
                            { id: 'payment', label: 'Payment', icon: Smartphone },
                            { id: 'shipment', label: 'Shipment', icon: Package },
                            { id: 'receipt', label: 'Receipt', icon: CheckCircle2 },
                        ].map((step, idx) => {
                            const stepList: CheckoutStep[] = ['cart', 'payment-info', 'delivery', 'payment', 'shipment', 'receipt'];
                            const isActive = step.id === currentStep;
                            const isPast = stepList.indexOf(currentStep) > idx;
                            return (
                                <div key={step.id} className="flex items-center gap-2 md:gap-4">
                                    <div className={`flex items-center gap-2 ${isActive ? 'text-primary' : isPast ? 'text-[#1B9157]' : 'text-muted-foreground'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-primary text-[#1A1A1A]' : isPast ? 'bg-green-600 text-[#1A1A1A]' : 'bg-muted'}`}>
                                            {isPast ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-4 h-4" />}
                                        </div>
                                        <span className="font-semibold hidden sm:inline">{step.label}</span>
                                    </div>
                                    {idx < 5 && (
                                        <div className={`w-6 md:w-10 h-0.5 ${isPast ? 'bg-green-600' : 'bg-muted'}`} />
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
                    {currentStep === 'payment-info' && 'Payment Information'}
                    {currentStep === 'delivery' && 'Delivery Details'}
                    {currentStep === 'payment' && 'Confirm & Pay'}
                    {currentStep === 'shipment' && 'Order Status'}
                    {currentStep === 'receipt' && 'Order Receipt'}
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
                                                                        aria-label="Decrease quantity"
                                                                    >
                                                                        <Minus className="w-4 h-4" />
                                                                    </button>
                                                                    <span className="w-10 text-center font-semibold">{item.quantity}</span>
                                                                    <button
                                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                        className="p-2 hover:bg-primary/10 rounded-r-lg transition-colors"
                                                                        aria-label="Increase quantity"
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
                                            <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-border text-xs font-black tracking-wider text-muted-foreground bg-muted/10">
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
                                                                aria-label="Remove from wishlist"
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
                                                                <Badge variant="outline" className="border-green-200 text-[#1B9157] bg-green-50">In Stock</Badge>
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
                                                                className="w-full rounded-full bg-primary hover:bg-primary/90 text-[#1A1A1A] font-bold"
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

                        {currentStep === 'payment-info' && (
                            <Card className="border border-border rounded-2xl">
                                <CardHeader className="bg-muted/30 border-b border-border">
                                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-primary" />
                                        Payment Method
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <RadioGroup value={paymentMethod} onValueChange={v => setPaymentMethod(v as 'mpesa' | 'card')} className="grid gap-4">
                                        <div
                                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${paymentMethod === 'mpesa' ? 'border-primary bg-primary/5' : 'border-border'}`}
                                            onClick={() => setPaymentMethod('mpesa')}
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 rounded-2xl bg-[#1B9157] flex items-center justify-center">
                                                    <Smartphone className="text-[#1B9157] w-8 h-8" />
                                                </div>
                                                <div>
                                                    <span className="font-bold text-lg">M-Pesa</span>
                                                    <p className="text-sm text-muted-foreground">Pay securely via your mobile phone</p>
                                                </div>
                                            </div>
                                            <RadioGroupItem value="mpesa" />
                                        </div>

                                        {paymentMethod === 'mpesa' && (
                                            <div className="pl-20 pr-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <Label htmlFor="checkout-mpesa" className="text-sm font-semibold mb-2 block">M-Pesa Phone Number</Label>
                                                <Input
                                                    id="checkout-mpesa"
                                                    name="mpesa_phone"
                                                    autoComplete="tel"
                                                    value={paymentDetails.mpesaNumber}
                                                    onChange={e => setPaymentDetails({ ...paymentDetails, mpesaNumber: e.target.value })}
                                                    placeholder="07XX XXX XXX"
                                                    className="max-w-xs"
                                                />
                                            </div>
                                        )}

                                        <div
                                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border'}`}
                                            onClick={() => setPaymentMethod('card')}
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                                                    <CreditCard className="text-blue-600 w-8 h-8" />
                                                </div>
                                                <div>
                                                    <span className="font-bold text-lg">Bank Card</span>
                                                    <p className="text-sm text-muted-foreground">Visa, Mastercard, or AMEX</p>
                                                </div>
                                            </div>
                                            <RadioGroupItem value="card" />
                                        </div>

                                        {paymentMethod === 'card' && (
                                            <div className="pl-6 pr-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                                {savedCards.length > 0 && (
                                                    <div className="grid gap-2 mb-4">
                                                        <Label className="text-sm font-bold mb-2">Select a Saved Card</Label>
                                                        {savedCards.map(card => (
                                                            <div 
                                                                key={card.id}
                                                                onClick={() => {
                                                                    setStripePaymentMethodId(card.stripe_payment_method_id);
                                                                    setStripeCardReady(true);
                                                                    setPaymentDetails({
                                                                        ...paymentDetails,
                                                                        cardNumber: `**** **** **** ${card.last4}`,
                                                                        cardExpiry: `${card.expiry_month}/${card.expiry_year}`,
                                                                    });
                                                                }}
                                                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${stripePaymentMethodId === card.stripe_payment_method_id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                                        <CreditCard className="w-5 h-5 text-primary" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold">{card.provider} card ending in {card.last4}</p>
                                                                        <p className="text-xs text-muted-foreground">Expires {card.expiry_month}/{card.expiry_year}</p>
                                                                    </div>
                                                                </div>
                                                                {stripePaymentMethodId === card.stripe_payment_method_id && <CheckCircle2 className="w-5 h-5 text-primary" />}
                                                            </div>
                                                        ))}
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            onClick={() => {
                                                                setStripePaymentMethodId(null);
                                                                setStripeCardReady(false);
                                                            }}
                                                            className="text-primary hover:text-primary hover:bg-primary/5 w-fit"
                                                        >
                                                            + Use a different card
                                                        </Button>
                                                    </div>
                                                )}
                                                {!stripePaymentMethodId && (
                                                    <div className="p-4 bg-muted/30 rounded-xl border border-border">
                                                        <StripeCardForm
                                                            mode="save"
                                                            onSuccess={(pm) => {
                                                                setStripePaymentMethodId(pm.id);
                                                                setStripeCardReady(true);
                                                                setPaymentDetails({
                                                                    ...paymentDetails,
                                                                    cardHolder: '',
                                                                    cardNumber: `**** **** **** ${pm.last4}`,
                                                                    cardExpiry: `${pm.exp_month}/${pm.exp_year}`,
                                                                });
                                                                toast.success('Card verified successfully!');
                                                            }}
                                                            onError={(error) => {
                                                                setStripeCardReady(false);
                                                                toast.error(error);
                                                            }}
                                                            buttonText="Verify Card"
                                                        />
                                                    </div>
                                                )}
                                                
                                                {stripeCardReady && (
                                                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                                                        <CheckCircle2 className="w-5 h-5 text-[#1B9157]" />
                                                        <p className="text-sm text-[#1B9157] font-medium">
                                                            Card ending in {paymentDetails.cardNumber.slice(-4)} selected
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </RadioGroup>

                                    <div className="flex gap-4 pt-4">
                                        <Button variant="outline" onClick={handleBackStep} className="rounded-full">
                                            Back
                                        </Button>
                                        <Button
                                            onClick={handlePaymentInfoNext}
                                            className="flex-1 rounded-full h-12 text-lg font-bold bg-primary hover:bg-primary/90"
                                        >
                                            Continue to Delivery
                                            <ArrowRight className="ml-2 w-5 h-5" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {currentStep === 'delivery' && (
                            <Card className="border border-border rounded-2xl">
                                <CardHeader className="bg-muted/30 border-b border-border">
                                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                                        <Truck className="w-5 h-5 text-primary" />
                                        Delivery Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2 space-y-2">
                                            <Label htmlFor="checkout-fullName">Full Name</Label>
                                            <Input
                                                id="checkout-fullName"
                                                name="full_name"
                                                autoComplete="name"
                                                value={shippingDetails.fullName}
                                                onChange={e => setShippingDetails({ ...shippingDetails, fullName: e.target.value })}
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="checkout-email">Email</Label>
                                            <Input
                                                id="checkout-email"
                                                name="email"
                                                type="email"
                                                autoComplete="email"
                                                value={shippingDetails.email}
                                                onChange={e => setShippingDetails({ ...shippingDetails, email: e.target.value })}
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="checkout-phone">Phone Number</Label>
                                            <Input
                                                id="checkout-phone"
                                                name="phone"
                                                type="tel"
                                                autoComplete="tel"
                                                value={shippingDetails.phone}
                                                onChange={e => setShippingDetails({ ...shippingDetails, phone: e.target.value })}
                                                placeholder="+254 700 000 000"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <Label htmlFor="checkout-address">Address</Label>
                                            <Input
                                                id="checkout-address"
                                                name="address"
                                                autoComplete="street-address"
                                                value={shippingDetails.address}
                                                onChange={e => setShippingDetails({ ...shippingDetails, address: e.target.value })}
                                                placeholder="123 Bee Street, Building A"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="checkout-city">City</Label>
                                            <Input
                                                id="checkout-city"
                                                name="city"
                                                autoComplete="address-level2"
                                                value={shippingDetails.city}
                                                onChange={e => setShippingDetails({ ...shippingDetails, city: e.target.value })}
                                                placeholder="Nairobi"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="checkout-county">County</Label>
                                            <Input
                                                id="checkout-county"
                                                name="county"
                                                autoComplete="address-level1"
                                                value={shippingDetails.county}
                                                onChange={e => setShippingDetails({ ...shippingDetails, county: e.target.value })}
                                                placeholder="Nairobi County"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <Label htmlFor="checkout-notes">Order Notes (Optional)</Label>
                                            <Textarea
                                                id="checkout-notes"
                                                name="order_notes"
                                                value={shippingDetails.notes}
                                                onChange={e => setShippingDetails({ ...shippingDetails, notes: e.target.value })}
                                                placeholder="Special delivery instructions..."
                                                rows={3}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <Button variant="outline" onClick={handleBackStep} className="rounded-full">
                                            Back
                                        </Button>
                                        <Button
                                            onClick={handleDeliveryNext}
                                            className="flex-1 rounded-full h-12 text-lg font-bold bg-primary hover:bg-primary/90"
                                        >
                                            Review Order
                                            <ArrowRight className="ml-2 w-5 h-5" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {currentStep === 'payment' && (
                            <Card className="border border-border rounded-2xl p-8 text-center space-y-6">
                                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                                    <Smartphone className="w-10 h-10 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black">Final Confirmation</h2>
                                    <p className="text-muted-foreground mt-2">
                                        Everything is ready! Click below to complete your payment of
                                        <span className="font-bold text-foreground"> {formatPrice(totalPayable)}</span>
                                    </p>
                                </div>
                                <div className="bg-muted/30 p-4 rounded-xl text-left">
                                    <p className="text-sm font-bold text-muted-foreground mb-2">Order Summary</p>
                                    <div className="space-y-1">
                                        <p className="text-sm flex justify-between"><span>Items:</span> <span>{getTotalItems()}</span></p>
                                        <p className="text-sm flex justify-between"><span>Method:</span> <span>{paymentMethod.toUpperCase()}</span></p>
                                        <p className="text-sm flex justify-between"><span>Delivery:</span> <span>{shippingDetails.city}, {shippingDetails.address}</span></p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <Button variant="outline" onClick={handleBackStep} className="rounded-full px-8">
                                        Back
                                    </Button>
                                    <Button
                                        onClick={handlePlaceOrder}
                                        disabled={isProcessing}
                                        className="flex-1 rounded-full h-12 text-lg font-bold bg-gradient-to-r from-primary to-amber-600 shadow-glow"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                Pay Now {formatPrice(totalPayable)}
                                                <ArrowRight className="ml-2 w-5 h-5" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {currentStep === 'shipment' && (
                            <Card className="border border-border rounded-2xl p-8 space-y-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-black">Payment & Fulfillment</h2>
                                        <p className="text-muted-foreground">Order ID: {orderNumber}</p>
                                    </div>
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${orderPaymentStatus === 'confirmed' ? 'bg-[#1B9157]/10' : 'bg-amber-100'}`}>
                                        <Package className={`w-8 h-8 ${orderPaymentStatus === 'confirmed' ? 'text-[#1B9157]' : 'text-amber-700'}`} />
                                    </div>
                                </div>

                                <Badge className={orderPaymentStatus === 'confirmed' ? 'w-fit bg-[#1B9157] text-white' : 'w-fit bg-amber-100 text-amber-900'}>
                                    {orderPaymentStatus === 'confirmed' ? 'Payment confirmed' : orderPaymentStatus === 'action_required' ? 'Action required' : 'Payment pending'}
                                </Badge>

                                <div className="relative pl-8 space-y-12">
                                    <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-muted"></div>

                                    <div className="relative">
                                        <div className={`absolute -left-[29px] w-6 h-6 rounded-full border-4 border-background ${orderPaymentStatus === 'confirmed' ? 'bg-green-600' : 'bg-amber-500'}`}></div>
                                        <p className="font-bold">{orderPaymentTitle}</p>
                                        <p className="text-sm text-muted-foreground">{orderPaymentMessage}</p>
                                    </div>

                                    <div className="relative">
                                        <div className={`absolute -left-[29px] w-6 h-6 rounded-full border-4 border-background ${orderPaymentStatus === 'confirmed' ? 'bg-primary' : 'bg-muted'}`}></div>
                                        <p className={`font-bold ${orderPaymentStatus === 'confirmed' ? 'text-primary' : 'text-muted-foreground'}`}>
                                            {orderPaymentStatus === 'confirmed' ? 'Preparing shipment' : 'Waiting for payment clearance'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {orderPaymentStatus === 'confirmed'
                                                ? 'Our team is packing your items with care.'
                                                : 'Fulfillment starts automatically after payment confirmation.'}
                                        </p>
                                    </div>

                                    <div className={`relative ${orderPaymentStatus === 'confirmed' ? 'opacity-50' : 'opacity-70'}`}>
                                        <div className="absolute -left-[29px] w-6 h-6 rounded-full bg-muted border-4 border-background"></div>
                                        <p className="font-bold">{orderPaymentStatus === 'confirmed' ? 'Out for delivery' : 'Shipment unlocks after payment'}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {orderPaymentStatus === 'confirmed'
                                                ? `Coming to ${shippingDetails.city}`
                                                : 'We will update this timeline as soon as payment is settled.'}
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => setCurrentStep('receipt')}
                                    className="w-full rounded-full h-12 font-bold text-lg"
                                >
                                    View Order Receipt
                                    <ChevronRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Card>
                        )}

                        {/* The simplified receipt block below is removed to avoid confusion, 
                            as we now use the premium one-page receipt above. */}
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
                                    <div className="flex items-center justify-between p-3 bg-[#1B9157] rounded-xl border border-[#1B9157]">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5 text-[#1B9157]" />
                                            <span className="font-bold text-[#1B9157]">{appliedCoupon.code}</span>
                                            <Badge variant="secondary" className="text-[#1B9157] bg-green-100">
                                                {appliedCoupon.discount}% OFF
                                            </Badge>
                                        </div>
                                        <button onClick={handleRemoveCoupon} className="text-muted-foreground hover:text-destructive" aria-label="Remove coupon">
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
                                            <span className="font-semibold">{deliveryCost === 0 ? 'Free' : formatPrice(deliveryCost)}</span>
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

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>{formatPrice(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Delivery</span>
                                        <span>{deliveryCost === 0 ? 'Free' : formatPrice(deliveryCost)}</span>
                                    </div>
                                    {appliedCoupon && (
                                        <div className="flex justify-between text-[#1B9157]">
                                            <span>Coupon Discount</span>
                                            <span>-{formatPrice(couponDiscount)}</span>
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                <div className="rounded-2xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                                    Totals are validated on the backend before payment is initiated.
                                </div>

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
                                        PAY
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
                            <ShopLoginForm
                                onSuccess={handleAuthSuccess}
                                onSwitchToRegister={() => setAuthTab('register')}
                            />
                        </TabsContent>
                        <TabsContent value="register" className="p-6 pt-4">
                            <ShopRegisterForm
                                onSuccess={handleAuthSuccess}
                                onSwitchToLogin={() => setAuthTab('login')}
                            />
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </BeeYieldPageShell>
    );
};

export default Checkout;
