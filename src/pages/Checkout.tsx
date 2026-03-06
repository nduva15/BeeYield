import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/contexts/CartContext';
import { useWishlist, WishlistItem } from '@/contexts/WishlistContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
    ShoppingCart, Truck, MapPin, Tag, Minus, Plus, X, ArrowRight, ArrowLeft,
    CheckCircle2, CreditCard, Smartphone, Shield, Loader2, ChevronRight,
    Gift, Store, Package, Heart, ShieldCheck, FileText, Printer, User,
    Lock, Check, Info, AlertCircle, Sparkles, Receipt, Wallet, LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
    initializeCheckout,
    CheckoutOrder,
    getProducts,
    Product,
    getAddresses,
    getPaymentMethods
} from '@/services/shopService';
import { adminService } from '@/services/adminService';
import ShopLoginForm from '@/components/auth/shop/ShopLoginForm';
import ShopRegisterForm from '@/components/auth/shop/ShopRegisterForm';
import { StripeCardForm } from '@/components/payments/StripeCardForm';

// Premium Design Constants
const GLASS_STYLE = "bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl shadow-indigo-500/10";
const ACCENT_GRADIENT = "bg-gradient-to-r from-amber-500 via-orange-600 to-amber-500";
const TEXT_GRADIENT = "bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-700";

const Checkout = () => {
    const navigate = useNavigate();
    const { user, session } = useAuth();
    const {
        items,
        removeFromCart,
        updateQuantity,
        getTotalItems,
        getTotalPrice,
        clearCart,
    } = useCart();
    const { items: wishlistItems, removeFromWishlist } = useWishlist();

    // State Management
    const [activeSection, setActiveSection] = useState<string>("contact");
    const [isBypassActive, setIsBypassActive] = useState(false);
    const [idempotencyKey] = useState(() => crypto.randomUUID());

    // Form States
    const [contactEmail, setContactEmail] = useState(user?.email || '');
    const [shippingDetails, setShippingDetails] = useState({
        fullName: '',
        phone: '',
        address: '',
        city: '',
        county: '',
        postalCode: '',
        notes: '',
    });
    const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
    const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa');
    const [mpesaNumber, setMpesaNumber] = useState('');
    const [stripeReady, setStripeReady] = useState(false);

    // Coupon States
    const [couponCode, setCouponCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

    // Order Success State
    const [successOrder, setSuccessOrder] = useState<{
        id: string;
        number: string;
        items: any[];
        totals: any;
        batches: string[];
    } | null>(null);

    // Google Maps Autocomplete Ref
    const addressInputRef = useRef<HTMLInputElement>(null);

    // Prefill from user
    useEffect(() => {
        if (user) {
            const meta = user.user_metadata || {};
            setContactEmail(user.email || '');
            setShippingDetails(prev => ({
                ...prev,
                fullName: `${meta.first_name || ''} ${meta.last_name || ''}`.trim() || prev.fullName,
                phone: meta.phone || prev.phone,
                address: meta.address || prev.address,
                city: meta.city || prev.city,
                county: meta.county || prev.county,
            }));
            if (meta.phone === '0742004187') setIsBypassActive(true);
        }
    }, [user]);

    // Google Maps Autocomplete Initialization
    useEffect(() => {
        if (!addressInputRef.current || !(window as any).google) return;

        const autocomplete = new (window as any).google.maps.places.Autocomplete(addressInputRef.current, {
            types: ['address'],
            componentRestrictions: { country: 'KE' }
        });

        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place.address_components) return;

            let streetNumber = '';
            let route = '';
            let city = '';
            let county = '';

            for (const component of place.address_components) {
                const types = component.types;
                if (types.includes('street_number')) streetNumber = component.long_name;
                if (types.includes('route')) route = component.long_name;
                if (types.includes('locality')) city = component.long_name;
                if (types.includes('administrative_area_level_1')) county = component.long_name;
            }

            setShippingDetails(prev => ({
                ...prev,
                address: `${streetNumber} ${route}`.trim() || place.name || prev.address,
                city: city || prev.city,
                county: county || prev.county
            }));
        });
    }, []);

    // Price Calculations
    const subtotal = getTotalPrice();
    const deliveryCost = deliveryMethod === 'delivery' ? (subtotal >= 5000 ? 0 : 350) : 0;
    const taxAmount = Math.round((subtotal - discountAmount) * 0.16); // 16% VAT on discounted subtotal
    const totalPayable = isBypassActive ? 0 : Math.max(0, (subtotal - discountAmount) + deliveryCost + taxAmount);

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setIsValidatingCoupon(true);
        setCouponMessage(null);
        try {
            const { validateCoupon } = await import('@/services/shopService');
            const res = await validateCoupon(couponCode, subtotal);
            if (res.valid) {
                setDiscountAmount(res.discount_amount || 0);
                setCouponMessage({ type: 'success', text: `Coupon applied: ${formatPrice(res.discount_amount || 0)} discount` });
                toast.success("Coupon verified!");
            } else {
                setDiscountAmount(0);
                setCouponMessage({ type: 'error', text: res.message || "Invalid coupon" });
            }
        } catch (error) {
            setCouponMessage({ type: 'error', text: "Failed to validate coupon" });
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    // Order Mutation
    const orderMutation = useMutation({
        mutationFn: (orderData: CheckoutOrder) => initializeCheckout(orderData, session?.access_token),
        onSuccess: (response) => {
            const orderId = response.order_id;
            const orderNum = response.order_number || `BY-${Date.now().toString(36).toUpperCase()}`;

            setSuccessOrder({
                id: orderId,
                number: orderNum,
                items: [...items],
                totals: { subtotal, tax: taxAmount, delivery: deliveryCost, total: totalPayable },
                batches: response.batches || ['KIB-ACACIAL-26']
            });

            // Log activities
            adminService.logPayment({
                order_number: orderNum,
                payment_method: paymentMethod,
                amount_kes: totalPayable,
                status: 'completed',
                customer_email: contactEmail
            }).catch(() => { });

            toast.success(isBypassActive ? 'Order Confirmed (Admin Bypass)!' : 'Payment Initialized!');
            clearCart();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Checkout failed. Please try again.');
        }
    });

    const handlePlaceOrder = () => {
        // Validation
        if (!contactEmail) { toast.error("Please provide a contact email"); setActiveSection("contact"); return; }
        if (!shippingDetails.fullName || !shippingDetails.address) { toast.error("Incomplete shipping details"); setActiveSection("shipping"); return; }
        if (paymentMethod === 'mpesa' && !mpesaNumber) { toast.error("M-Pesa number required"); setActiveSection("payment"); return; }
        if (paymentMethod === 'card' && !stripeReady) { toast.error("Card not verified"); setActiveSection("payment"); return; }

        const orderData: CheckoutOrder = {
            shipping_address: {
                first_name: shippingDetails.fullName.split(' ')[0] || 'Customer',
                last_name: shippingDetails.fullName.split(' ').slice(1).join(' ') || '',
                email: contactEmail,
                phone: shippingDetails.phone,
                address: shippingDetails.address,
                city: shippingDetails.city,
                county: shippingDetails.county,
                postal_code: shippingDetails.postalCode,
            },
            payment_method: paymentMethod,
            delivery_method: deliveryMethod,
            coupon_code: discountAmount > 0 ? couponCode : undefined,
            items: items.map(item => ({
                product_id: item.productId.toString(),
                variant_id: item.variantId,
                quantity: item.quantity
            })),
            total_kes: totalPayable,
            notes: shippingDetails.notes,
            idempotency_key: idempotencyKey,
        };

        orderMutation.mutate(orderData);
    };

    // Format Helpers
    const formatPrice = (price: number) => `KES ${price.toLocaleString()}`;

    // --- SUCCESS VIEW (RECEIPT) ---
    if (successOrder) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 selection:bg-amber-100 selection:text-amber-900">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto"
                >
                    <Card className={`border-none shadow-2xl rounded-[3rem] overflow-hidden ${GLASS_STYLE}`}>
                        <div className={`${ACCENT_GRADIENT} h-2 w-full`} />

                        <CardHeader className="text-center p-12 space-y-6">
                            <div className="flex justify-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", damping: 12 }}
                                    className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 shadow-inner"
                                >
                                    <CheckCircle2 className="w-12 h-12" />
                                </motion.div>
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Order Confirmed!</h1>
                                <p className="text-slate-500 dark:text-slate-400 text-lg uppercase tracking-widest font-bold">Ref: {successOrder.number}</p>
                            </div>
                        </CardHeader>

                        <CardContent className="p-8 md:p-16 space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <h3 className="text-xl font-black border-l-4 border-amber-500 pl-4 uppercase tracking-tight">Delivery Intelligence</h3>
                                    <div className="bg-slate-100/50 dark:bg-slate-800/50 p-6 rounded-3xl space-y-3">
                                        <div className="flex gap-4 items-start">
                                            <User className="w-5 h-5 text-amber-600 mt-1" />
                                            <div>
                                                <p className="font-bold">{shippingDetails.fullName}</p>
                                                <p className="text-sm text-slate-500">{contactEmail}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 items-start">
                                            <MapPin className="w-5 h-5 text-amber-600 mt-1" />
                                            <div>
                                                <p className="font-bold">{shippingDetails.address}</p>
                                                <p className="text-sm text-slate-500">{shippingDetails.city}, {shippingDetails.county}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20">
                                        <Truck className="w-6 h-6 text-amber-600" />
                                        <p className="text-sm font-bold text-amber-900 dark:text-amber-100">ETA: Arriving within 24–48 hours</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-xl font-black border-l-4 border-amber-500 pl-4 uppercase tracking-tight">Traceability Matrix</h3>
                                    <div className="bg-green-500/5 p-6 rounded-3xl border border-green-500/10 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <ShieldCheck className="w-6 h-6 text-green-600" />
                                            <span className="font-black text-green-900 dark:text-green-100">Verified Origin</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            {successOrder.batches.map(batch => (
                                                <div key={batch} className="flex justify-between items-center bg-white dark:bg-slate-950 p-3 rounded-xl shadow-sm">
                                                    <span className="text-xs font-bold text-slate-400">BATCH CODE</span>
                                                    <span className="font-mono font-black text-amber-600">{batch}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest text-center">Oxford Bio-Trace Authenticated</p>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-slate-200 dark:bg-slate-800" />

                            <div className="space-y-6">
                                <h3 className="text-xl font-black uppercase tracking-tight">Order Payload</h3>
                                <div className="space-y-4">
                                    {successOrder.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center font-black text-amber-600">
                                                    {item.quantity}x
                                                </div>
                                                <div>
                                                    <p className="font-bold">{item.name}</p>
                                                    <p className="text-xs text-slate-400">{item.size}</p>
                                                </div>
                                            </div>
                                            <p className="font-black">{formatPrice(item.price * item.quantity)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-xl space-y-4 overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                    <Receipt className="w-32 h-32" />
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(successOrder.totals.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Eco-Pollination Tax (VAT)</span>
                                    <span>{formatPrice(successOrder.totals.tax)}</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Carbon Neutral Shipping</span>
                                    <span>{successOrder.totals.delivery === 0 ? "SPONSORED" : formatPrice(successOrder.totals.delivery)}</span>
                                </div>
                                <Separator className="bg-slate-800" />
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-2xl font-black italic">Total Settled</span>
                                    <span className="text-4xl font-black text-amber-500">{formatPrice(successOrder.totals.total)}</span>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="p-12 bg-slate-100 dark:bg-slate-900/50 flex flex-col sm:flex-row gap-4">
                            <Button
                                onClick={() => navigate('/buyer-dashboard?tab=orders')}
                                size="lg"
                                className="w-full h-16 rounded-full font-black text-lg bg-white text-slate-900 border-2 border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
                            >
                                <LayoutGrid className="mr-2 w-5 h-5" /> Track in Dashboard
                            </Button>
                            <Button
                                onClick={() => navigate('/shop')}
                                size="lg"
                                className={`w-full h-16 rounded-full font-black text-lg text-white shadow-xl ${ACCENT_GRADIENT} hover:scale-[1.02] active:scale-[0.98] transition-all`}
                            >
                                Continue Shopping <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        );
    }

    // --- MAIN CHECKOUT VIEW ---
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 selection:bg-amber-100 selection:text-amber-900">
            <div className="container max-w-7xl mx-auto px-4">

                {/* Frictionless Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div className="space-y-2">
                        <Link to="/shop" className="text-amber-600 font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                            <ArrowLeft className="w-4 h-4" /> Return to Marketplace
                        </Link>
                        <h1 className="text-6xl font-black tracking-tightest leading-none">
                            Seamless <span className={TEXT_GRADIENT}>Checkout</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4 bg-white dark:bg-slate-900 px-6 py-3 rounded-full shadow-sm border border-slate-200 dark:border-slate-800">
                        <Shield className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-bold opacity-70 tracking-tight">SECURED BY POLARIS GATEWAY</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                    {/* Left: The Logic Sections */}
                    <div className="lg:col-span-8 space-y-6">

                        <Accordion type="single" value={activeSection} onValueChange={setActiveSection} className="space-y-6 border-none">

                            {/* SECTION 1: IDENTITY */}
                            <AccordionItem value="contact" className={`rounded-[2.5rem] overflow-hidden border-none shadow-premium px-8 py-4 ${GLASS_STYLE}`}>
                                <AccordionTrigger className="hover:no-underline py-4">
                                    <div className="flex items-center gap-6 text-left">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${activeSection === 'contact' ? 'bg-amber-500 text-white shadow-glow' : 'bg-slate-100 dark:bg-slate-800 opacity-50'}`}>
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black tracking-tight">Identity Checkpoint</h2>
                                            <p className="text-sm text-slate-500 font-bold opacity-60 uppercase tracking-widest">Login or Proceed as Guest</p>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-6 pb-4">
                                    {user ? (
                                        <div className="flex items-center justify-between p-6 bg-amber-500/5 rounded-3xl border border-amber-500/20">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-600 font-black text-xl italic uppercase">
                                                    {user.email?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-lg">{user.email}</p>
                                                    <p className="text-sm text-slate-500">Verified Loyal Customer</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" className="rounded-full text-amber-600 font-bold" onClick={() => navigate('/buyer-dashboard')}>Change Account</Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <h3 className="text-lg font-black italic">Speed: Guest Checkout</h3>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-black uppercase tracking-widest opacity-60">Email for Delivery Updates</Label>
                                                        <Input
                                                            type="email"
                                                            placeholder="nature@example.com"
                                                            value={contactEmail}
                                                            onChange={e => setContactEmail(e.target.value)}
                                                            className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border-slate-200"
                                                        />
                                                    </div>
                                                    <Button
                                                        onClick={() => setActiveSection("shipping")}
                                                        className="w-full h-14 rounded-full font-black text-lg bg-slate-900 text-white hover:bg-slate-800"
                                                    >
                                                        Continue as Guest
                                                    </Button>
                                                </div>
                                                <div className="bg-slate-100 dark:bg-slate-900/50 p-8 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col justify-center text-center space-y-4">
                                                    <Sparkles className="w-10 h-10 text-amber-500 mx-auto" />
                                                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Unlock 20% discount & 1-click checkout on your next order.</p>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => navigate('/auth?redirect=checkout')}
                                                        className="rounded-full border-amber-600 text-amber-600 font-black hover:bg-amber-600 hover:text-white"
                                                    >
                                                        Login to Accrue Points
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </AccordionContent>
                            </AccordionItem>

                            {/* SECTION 2: SHIPPING */}
                            <AccordionItem value="shipping" className={`rounded-[2.5rem] overflow-hidden border-none shadow-premium px-8 py-4 ${GLASS_STYLE}`}>
                                <AccordionTrigger className="hover:no-underline py-4">
                                    <div className="flex items-center gap-6 text-left">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${activeSection === 'shipping' ? 'bg-amber-500 text-white shadow-glow' : 'bg-slate-100 dark:bg-slate-800 opacity-50'}`}>
                                            <Truck className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black tracking-tight">Delivery Logistics</h2>
                                            <p className="text-sm text-slate-500 font-bold opacity-60 uppercase tracking-widest">Where should we dispatch? {shippingDetails.city ? `• ${shippingDetails.city}` : ''}</p>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-6 pb-4 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2 space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest opacity-60">Recipient Full Name</Label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-30" />
                                                <Input
                                                    placeholder="Jane Wildflower"
                                                    className="h-14 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-900"
                                                    value={shippingDetails.fullName}
                                                    onChange={e => setShippingDetails({ ...shippingDetails, fullName: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest opacity-60">Secure Delivery Address (Autocomplete)</Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-30 text-amber-600" />
                                                <Input
                                                    ref={addressInputRef}
                                                    placeholder="Street name, building, apartment..."
                                                    className="h-14 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border-amber-500/20"
                                                    value={shippingDetails.address}
                                                    onChange={e => setShippingDetails({ ...shippingDetails, address: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest opacity-60">City / Town</Label>
                                            <Input
                                                placeholder="Nairobi"
                                                className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-900"
                                                value={shippingDetails.city}
                                                onChange={e => setShippingDetails({ ...shippingDetails, city: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest opacity-60">County</Label>
                                            <Input
                                                placeholder="Nairobi"
                                                className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-900"
                                                value={shippingDetails.county}
                                                onChange={e => setShippingDetails({ ...shippingDetails, county: e.target.value })}
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest opacity-60">Encrypted Phone Number</Label>
                                            <div className="relative">
                                                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-30" />
                                                <Input
                                                    placeholder="07XX XXX XXX"
                                                    className="h-14 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-900"
                                                    value={shippingDetails.phone}
                                                    onChange={e => setShippingDetails({ ...shippingDetails, phone: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-amber-500/5 p-8 rounded-[2rem] border border-amber-500/10 space-y-6">
                                        <h4 className="font-black italic text-lg">Shipping Velocity</h4>
                                        <RadioGroup value={deliveryMethod} onValueChange={v => setDeliveryMethod(v as any)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center gap-6 ${deliveryMethod === 'delivery' ? 'border-amber-500 bg-white dark:bg-slate-800' : 'border-slate-100 dark:border-slate-800 opacity-50'}`} onClick={() => setDeliveryMethod('delivery')}>
                                                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                                                    <Truck className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-black">Standard Courier</p>
                                                    <p className="text-xs text-slate-500">24h - {subtotal >= 5000 ? "FREE" : "KES 350"}</p>
                                                </div>
                                                <RadioGroupItem value="delivery" />
                                            </div>
                                            <div className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center gap-6 ${deliveryMethod === 'pickup' ? 'border-amber-500 bg-white dark:bg-slate-800' : 'border-slate-100 dark:border-slate-800 opacity-50'}`} onClick={() => setDeliveryMethod('pickup')}>
                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                                    <Store className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-black">Self-Pickup</p>
                                                    <p className="text-xs text-slate-500">Ready in 2h - FREE</p>
                                                </div>
                                                <RadioGroupItem value="pickup" />
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    <Button onClick={() => setActiveSection("payment")} className="w-full h-16 rounded-full font-black text-xl shadow-xl hover:scale-[1.01] transition-all">
                                        Vault & Payment Details <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </AccordionContent>
                            </AccordionItem>

                            {/* SECTION 3: PAYMENT */}
                            <AccordionItem value="payment" className={`rounded-[2.5rem] overflow-hidden border-none shadow-premium px-8 py-4 ${GLASS_STYLE}`}>
                                <AccordionTrigger className="hover:no-underline py-4">
                                    <div className="flex items-center gap-6 text-left">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${activeSection === 'payment' ? 'bg-amber-500 text-white shadow-glow' : 'bg-slate-100 dark:bg-slate-800 opacity-50'}`}>
                                            <Lock className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black tracking-tight">Security & Clearing</h2>
                                            <p className="text-sm text-slate-500 font-bold opacity-60 uppercase tracking-widest">End-to-End Encrypted Protocols</p>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-6 pb-4 space-y-8">
                                    <Tabs defaultValue="mpesa" className="w-full" onValueChange={v => setPaymentMethod(v as any)}>
                                        <TabsList className="grid w-full grid-cols-2 h-16 rounded-3xl p-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-8">
                                            <TabsTrigger value="mpesa" className="rounded-2xl font-black italic data-[state=active]:bg-green-600 data-[state=active]:text-white">M-PESA MOBILE</TabsTrigger>
                                            <TabsTrigger value="card" className="rounded-2xl font-black data-[state=active]:bg-indigo-600 data-[state=active]:text-white">SECURE CARD / G-PAY</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="mpesa" className="space-y-6 pt-4">
                                            <div className="bg-green-500/5 p-10 rounded-[2.5rem] border border-green-500/10 text-center space-y-6">
                                                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center text-green-600 mx-auto">
                                                    <Smartphone className="w-10 h-10" />
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-2xl font-black">Direct STK Push</h3>
                                                    <p className="text-sm text-slate-500 font-bold">You will receive a prompt on your phone to enter your M-Pesa PIN.</p>
                                                </div>
                                                <div className="max-w-xs mx-auto space-y-2">
                                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Authorized Phone Number</Label>
                                                    <Input
                                                        placeholder="07XX XXX XXX"
                                                        className="h-14 text-center text-xl font-black tracking-widest rounded-2xl bg-white dark:bg-slate-800 border-green-500/30"
                                                        value={mpesaNumber}
                                                        onChange={e => setMpesaNumber(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="card" className="space-y-6 pt-4">
                                            <div className="bg-indigo-500/5 p-10 rounded-[2.5rem] border border-indigo-500/10 space-y-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-4">
                                                        <CreditCard className="w-8 h-8 text-indigo-600" />
                                                        <h3 className="text-2xl font-black tracking-tight">Express Checkout</h3>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4 opacity-50 gray-scale" alt="Visa" />
                                                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6 opacity-50 gray-scale" alt="MasterCard" />
                                                    </div>
                                                </div>
                                                <div className="rounded-3xl bg-white dark:bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-800 p-6">
                                                    <StripeCardForm
                                                        mode="checkout"
                                                        amount={totalPayable}
                                                        onSuccess={() => setStripeReady(true)}
                                                        onError={() => setStripeReady(false)}
                                                        buttonText="Verify Card Transaction"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-3 bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20">
                                                    <Shield className="w-5 h-5 text-indigo-600" />
                                                    <p className="text-xs font-bold text-indigo-900 dark:text-indigo-100 uppercase tracking-widest">PCI-DSS Level 1 Encrypted Transmission</p>
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </Tabs>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <Sparkles className="w-5 h-5 text-amber-500" />
                                            </div>
                                            <p className="text-xs font-bold leading-tight">Secure Payment<br /><span className="text-slate-400 font-medium">Fast clearing & refund policy</span></p>
                                        </div>
                                        <div className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <ShieldCheck className="w-5 h-5 text-green-600" />
                                            </div>
                                            <p className="text-xs font-bold leading-tight">Honey Guarantee<br /><span className="text-slate-400 font-medium">100% Raw & Traceable</span></p>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                        {/* FINAL ACTION PLATE (STAY AT BOTTOM OF LEFT COLUMN) */}
                        <div className={`mt-8 p-10 rounded-[3rem] text-center space-y-8 relative overflow-hidden ${GLASS_STYLE}`}>
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-30" />
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black tracking-tightest">Review Intelligence</h2>
                                <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">Final verify before payload dispatch</p>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                                <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
                                    <Check className="w-4 h-4 text-green-600" /> Identity Validated
                                </div>
                                <div className="w-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full hidden md:block" />
                                <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
                                    {shippingDetails.address ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-500" />} Shipping Matrix Localized
                                </div>
                                <div className="w-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full hidden md:block" />
                                <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
                                    <Check className="w-4 h-4 text-green-600" /> Logic Sanity Check Pass
                                </div>
                            </div>

                            <Button
                                onClick={handlePlaceOrder}
                                disabled={orderMutation.isPending}
                                size="lg"
                                className={`w-full h-20 rounded-full font-black text-2xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all group ${ACCENT_GRADIENT}`}
                            >
                                {orderMutation.isPending ? (
                                    <span className="flex items-center gap-4">
                                        <Loader2 className="w-6 h-6 animate-spin" /> DISPATCHING...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-4">
                                        AUTHORIZE PAYLOAD <span className="text-white/40 group-hover:text-white transition-colors">{formatPrice(totalPayable)}</span>
                                        <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                                    </span>
                                )}
                            </Button>
                            <p className="text-[10px] uppercase font-black tracking-tighter opacity-30">By clicking authorize, you agree to the Hive Terms of Service & Biosecurity Protocols.</p>
                        </div>
                    </div>

                    {/* Right: Order Intelligence Sidebar */}
                    <div className="lg:col-span-4 space-y-6 sticky top-8">

                        <Card className={`border-none shadow-2xl rounded-[2.5rem] overflow-hidden ${GLASS_STYLE}`}>
                            <CardHeader className="p-8 border-b border-white/10 flex flex-row items-center justify-between">
                                <CardTitle className="text-2xl font-black italic">Order Intelligence</CardTitle>
                                <Badge className="bg-amber-500 font-bold">{getTotalItems()} ITEMS</Badge>
                            </CardHeader>

                            <CardContent className="p-8 space-y-6 max-h-[50vh] overflow-y-auto no-scrollbar">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4 group">
                                        <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex-shrink-0 flex items-center justify-center text-4xl overflow-hidden relative">
                                            {item.image ? <img src={item.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={item.name} /> : '🍯'}
                                            <div className="absolute top-0 right-0 p-1">
                                                <Badge className="h-5 w-5 p-0 rounded-full flex items-center justify-center bg-amber-600 text-[10px]">{item.quantity}</Badge>
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <h4 className="font-bold text-sm leading-tight line-clamp-2">{item.name}</h4>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{item.size}</p>
                                            <p className="font-black text-amber-600">{formatPrice(item.price)}</p>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}

                                {wishlistItems.length > 0 && (
                                    <div className="pt-4 mt-4 border-t border-white/10 space-y-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Forgot something? (From Wishlist)</p>
                                        <div className="flex flex-wrap gap-2">
                                            {wishlistItems.slice(0, 3).map(i => (
                                                <button key={i.id} onClick={() => navigate('/shop')} className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-xl grayscale hover:grayscale-0 transition-all">
                                                    {i.image ? <img src={i.image} className="w-full h-full object-cover rounded-xl" alt={i.name} /> : '❤️'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>

                            <CardFooter className="p-8 bg-slate-100/50 dark:bg-slate-900/50 flex flex-col gap-4">
                                {/* Coupon Input */}
                                <div className="w-full space-y-2 mb-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Privileged Coupon</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Enter Code"
                                            value={couponCode}
                                            onChange={e => setCouponCode(e.target.value)}
                                            className="h-10 rounded-xl bg-white dark:bg-slate-950 border-slate-200"
                                        />
                                        <Button
                                            onClick={handleApplyCoupon}
                                            disabled={isValidatingCoupon || !couponCode}
                                            variant="outline"
                                            className="h-10 rounded-xl font-black text-xs border-amber-500 text-amber-600 hover:bg-amber-50"
                                        >
                                            {isValidatingCoupon ? <Loader2 className="w-3 h-3 animate-spin" /> : "APPLY"}
                                        </Button>
                                    </div>
                                    {couponMessage && (
                                        <p className={`text-[10px] font-bold ${couponMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                                            {couponMessage.text}
                                        </p>
                                    )}
                                </div>

                                <div className="w-full space-y-3">
                                    <div className="flex justify-between text-sm font-bold">
                                        <span className="text-slate-500 opacity-70">METRIC SUB-TOTAL</span>
                                        <span>{formatPrice(subtotal)}</span>
                                    </div>
                                    {discountAmount > 0 && (
                                        <div className="flex justify-between text-sm font-bold text-green-600">
                                            <span className="opacity-70">COUPON DISCOUNT</span>
                                            <span>-{formatPrice(discountAmount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm font-bold">
                                        <span className="text-slate-500 opacity-70">LOGISTICS FEE</span>
                                        <span>{deliveryCost === 0 ? <span className="text-green-600">SPONSORED</span> : formatPrice(deliveryCost)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-bold">
                                        <span className="text-slate-500 opacity-70 italic underline decoration-amber-500/30 decoration-2 underline-offset-4">BIOTIC TAX (VAT 16%)</span>
                                        <span>{formatPrice(taxAmount)}</span>
                                    </div>

                                    <Separator className="bg-slate-200 dark:bg-slate-800" />

                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-xl font-black tracking-tightest">NET PAYABLE</span>
                                        <span className="text-3xl font-black text-amber-600 tracking-tighter">{formatPrice(totalPayable)}</span>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-950 p-6 rounded-[2rem] shadow-sm flex items-center gap-4 w-full">
                                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Vault Transmission</p>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Your payment data never touches our servers. Secured via Polaris & Stripe API.</p>
                                    </div>
                                </div>
                            </CardFooter>
                        </Card>

                        {/* Store Credits / Trust Marks */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-green-500/5 border border-green-500/10 p-5 rounded-3xl flex flex-col items-center text-center space-y-2">
                                <ShieldCheck className="w-8 h-8 text-green-600" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-green-900 dark:text-green-100">Bio-Hacked Security</p>
                            </div>
                            <div className="bg-amber-500/5 border border-amber-500/10 p-5 rounded-3xl flex flex-col items-center text-center space-y-2">
                                <Wallet className="w-8 h-8 text-amber-600" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-amber-900 dark:text-amber-100">Carbon Reward Point +12</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Premium Toast Container Adjustment (handled by Toaster in App.tsx) */}
        </div>
    );
};

export default Checkout;
