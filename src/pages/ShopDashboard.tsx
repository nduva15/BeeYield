
import {
    LayoutGrid,
    Package,
    MapPin,
    CreditCard,
    Gift,
    User,
    Heart,
    ShoppingBag,
    HelpCircle,
    CheckCircle2,
    ArrowRight,
    Smartphone,
    Loader,
    Loader2,
    Shield,
    Trash2,
    Edit2,
    Plus,
    FileText,
    Download,
    XCircle,
    Settings,
    Truck,
    ArrowLeft,
    Lock as LockIcon
} from 'lucide-react';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { getUserOrders, getProducts, Product, saveStripePaymentMethod } from '@/services/shopService';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from "@/components/ui/progress";
import ShopLoginForm from '@/components/auth/shop/ShopLoginForm';
import ShopRegisterForm from '@/components/auth/shop/ShopRegisterForm';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import { StripeCardForm } from '@/components/payments/StripeCardForm';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { initializeCheckout, CheckoutOrder } from '@/services/shopService';
import { useCart, CartContextType } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import ShopDashboardLayout from '@/components/shop/ShopDashboardLayout';
import { ShopNavItem as NavItem } from '@/components/shop/ShopDashboardSidebar';
import { adminService } from '@/services/adminService';

// Toast utility import (adjust if needed)
import { toast } from 'sonner';
import { BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';

const ShopDashboard = () => {
    const { user, signOut, loading: authLoading, session } = useAuth();
    const navigate = useNavigate();
    const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot-password'>('login');
    const [activeTab, setActiveTab] = useState<string>('overview');
    const [orders, setOrders] = useState<Order[]>([]);
    // Cart and wishlist context
    const { items, getTotalItems, getTotalPrice, clearCart, addToCart: addToCartFromContext } = useCart() as CartContextType;
    const { items: wishlistItems, removeFromWishlist, isInWishlist } = useWishlist();
    // ...existing code...



    type AuthMode = 'login' | 'register' | 'forgot-password';

    interface Order {
        id: string;
        order_number?: string;
        status: string;
        total_amount: number;
        payment_method: string;
        created_at: string;
        shipping_address: {
            first_name?: string;
            last_name?: string;
            address?: string;
            city?: string;
            county?: string;
            phone?: string;
        };
        items?: Record<string, unknown>[];
    }

    interface Address {
        id: string;
        name: string;
        street: string;
        city: string;
        county: string;
        phone: string;
        email?: string;
        apartment?: string;
        building?: string;
        floor?: string;
        postal_code?: string;
        is_default: boolean;
    }

    interface PaymentMethod {
        id: string;
        type: 'card' | 'mpesa';
        last4?: string;
        brand?: string;
        expiry?: string;
        isDefault?: boolean;
        is_default?: boolean;
        card_holder_name?: string;
        provider?: string;
        expiry_month?: number;
        expiry_year?: number;
    }
    const handleLogout = async () => {
        await signOut();
        navigate('/shop');
    };

    // Checkout State
    const [checkoutStep, setCheckoutStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping');
    const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa');
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');
    const [shippingDetails, setShippingDetails] = useState({
        fullName: '',
        email: '',
        phone: '',
        street: '',
        apartment: '',
        building: '',
        floor: '',
        city: '',
        county: '',
        postalCode: '',
        notes: '',
    });


    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        if (tab) setActiveTab(tab);
    }, []);

    // Local state
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [suggestions, setSuggestions] = useState<Product[]>([]);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    });
    const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);
    const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

    const loadSuggestions = async () => {
        try {
            const data = await getProducts();
            const shuffled = [...(data || [])].sort(() => 0.5 - Math.random());
            setSuggestions(shuffled.slice(0, 4));
        } catch (error) {
            console.error("Failed to load suggestions:", error);
            setSuggestions([]);
        }
    };

    const loadOrders = async () => {
        if (!user?.email) return;
        // Removed setOrdersLoading for instant load
        try {
            const { getUserOrders } = await import('@/services/shopService');
            const data = await getUserOrders(user?.email || '');
            setOrders(data as unknown as Order[]);
        } catch (error) {
            console.error("Failed to load orders:", error);
        }
    };

    const loadUserData = async () => {
        if (!user) return;
        try {
            // Load from real backend instead of just metadata
            const [savedAddresses, savedPayments] = await Promise.all([
                import('@/services/shopService').then(m => m.getAddresses()),
                import('@/services/shopService').then(m => m.getPaymentMethods())
            ]);

            setAddresses(savedAddresses as Address[]);
            setPaymentMethods(savedPayments as PaymentMethod[] || []);
        } catch (error) {
            console.error("Failed to load user data from backend:", error);
            // Fallback to metadata if backend fails
            const meta = user?.user_metadata || {};
            setAddresses(meta.addresses || []);
            setPaymentMethods(meta.payment_methods || []);
        }

        const meta = user?.user_metadata || {};
        // Init Profile Form
        setProfileForm({
            firstName: meta.first_name || '',
            lastName: meta.last_name || '',
            email: user?.email || '',
            phone: meta.phone || ''
        });
    };

    useEffect(() => {
        if (!user) return;
        // Load all dashboard data concurrently for speed
        Promise.all([
            import('@/services/shopService').then(m => m.getUserOrders(user.email || '')),
            import('@/services/shopService').then(m => m.getAddresses()),
            import('@/services/shopService').then(m => m.getPaymentMethods()),
            getProducts()
        ]).then(([ordersData, addressesData, paymentMethodsData, suggestionsData]) => {
            setOrders(Array.isArray(ordersData) ? ordersData.map(o => ({
                ...o,
                id: typeof o.id === 'string' ? o.id : (typeof o.order_id === 'string' ? o.order_id : ''),
                status: typeof o.status === 'string' ? o.status : '',
                total_amount: typeof o.total_amount === 'number' ? o.total_amount : 0,
                payment_method: typeof o.payment_method === 'string' ? o.payment_method : '',
                created_at: typeof o.created_at === 'string' ? o.created_at : '',
                shipping_address: typeof o.shipping_address === 'object' && o.shipping_address !== null ? o.shipping_address : {
                    first_name: '',
                    last_name: '',
                    address: '',
                    city: '',
                    county: '',
                    phone: ''
                },
                items: Array.isArray(o.items) ? o.items : []
            })) : []);
            setAddresses(addressesData as Address[]);
            setPaymentMethods(paymentMethodsData as PaymentMethod[]);
            const shuffled = [...(suggestionsData || [])].sort(() => 0.5 - Math.random());
            setSuggestions(shuffled.slice(0, 4));
        }).catch(() => {
            setOrders([]);
            setAddresses([]);
            setPaymentMethods([]);
            setSuggestions([]);
        });
    }, [user]);


    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const updateProfile = async () => {
        if (!supabase) {
            toast.error("Database connection unavailable");
            return;
        }
        try {
            const { error } = await supabase.auth.updateUser({
                email: profileForm.email,
                data: {
                    first_name: profileForm.firstName,
                    last_name: profileForm.lastName,
                    phone: profileForm.phone
                }
            });

            if (error) throw error;

            // Log account update
            adminService.logActivity({
                activity_type: 'account',
                action: 'updated',
                entity_type: 'user_profile',
                entity_reference: user?.email || 'unknown',
                metadata: { fields: ['first_name', 'last_name', 'phone'] }
            }).catch(() => { });

            toast.success("Profile updated successfully");
            setIsEditingProfile(false);
        } catch (error: unknown) {
            const err = error as { message: string };
            toast.error("Failed to update profile", { description: err.message });
        }
    };

    const saveAddress = async (newAddress: unknown) => {
        try {
            const { addAddress } = await import('@/services/shopService');
            const saved = await addAddress(newAddress);
            setAddresses([...addresses, saved as Address]);
            toast.success("Address saved");
        } catch (error) {
            toast.error("Failed to save address");
        }
    };

    const updateAddress = async (id: string, updatedAddr: Partial<Address>) => {
        try {
            const { updateAddress: updateAddressApi } = await import('@/services/shopService');
            const updated = await updateAddressApi(id, updatedAddr) as Address;
            setAddresses(addresses.map(a => a.id === id ? updated : a));
            toast.success("Address updated");
        } catch (error) {
            toast.error("Failed to update address");
        }
    };

    const handleDeleteAddress = async (id: string) => {
        try {
            const { deleteAddress } = await import('@/services/shopService');
            await deleteAddress(id);
            setAddresses(addresses.filter(a => a.id !== id));
            toast.success("Address removed");
        } catch (error) {
            toast.error("Failed to remove address");
        }
    };

    const savePaymentMethod = async (newMethod: unknown) => {
        try {
            const { addPaymentMethod } = await import('@/services/shopService');
            const saved = await addPaymentMethod(newMethod);
            setPaymentMethods([...paymentMethods, saved as PaymentMethod]);
            toast.success("Payment method added");
        } catch (error) {
            toast.error("Failed to add payment method");
        }
    };

    const handleDeletePaymentMethod = async (id: string) => {
        try {
            const { deletePaymentMethod } = await import('@/services/shopService');
            await deletePaymentMethod(id);
            setPaymentMethods(paymentMethods.filter(p => p.id !== id));
            toast.success("Payment method removed");
        } catch (error) {
            toast.error("Failed to remove payment method");
        }
    };

    const [isTrackingOpen, setIsTrackingOpen] = useState(false);
    const [trackingInfo, setTrackingInfo] = useState<{
        current_status: string;
        estimated_delivery: string;
        events: { status: string; description: string; created_at: string; location?: string }[];
    } | null>(null);
    const [loadingTracking, setLoadingTracking] = useState(false);

    const handleTrackOrder = async (order: Order) => {
        setTrackingOrder(order);
        setIsTrackingOpen(true);
        setLoadingTracking(true);
        try {
            const { getOrderTracking } = await import('@/services/shopService');
            const info = await getOrderTracking(order.id);
            setTrackingInfo(info as any);
        } catch (error) {
            console.error("Tracking unavailable:", error);
            setTrackingInfo(null);
        } finally {
            setLoadingTracking(false);
        }
    };

    const handleDownloadInvoice = async (order: Order) => {
        try {
            const { downloadInvoice } = await import('@/services/shopService');

            // Log invoice download
            adminService.logActivity({
                activity_type: 'document',
                action: 'downloaded',
                entity_type: 'invoice',
                entity_reference: order.order_number || order.id,
                metadata: { order_id: order.id }
            }).catch(() => { });

            adminService.logDocument({
                document_type: 'invoice',
                document_name: `Invoice_${order.order_number || order.id}.pdf`,
                file_format: 'PDF',
                category: 'Billing',
                related_entity_reference: order.id
            }).catch(() => { });

            toast.promise(downloadInvoice(order.id, order.order_number || order.id), {
                loading: 'Preparing invoice...',
                success: 'Invoice downloaded!',
                error: 'Failed to download invoice'
            });
        } catch (error) {
            console.error("Invoice Error:", error);
        }
    };


    const navItems: NavItem[] = [
        { id: 'overview', label: 'Overview', icon: LayoutGrid },
        { id: 'orders', label: 'My Orders', icon: Package },
        // { id: 'wallet', label: 'Wallet & Credits', icon: Wallet }, // Removed as requested
        { id: 'addresses', label: 'Delivery Locations', icon: MapPin },
        { id: 'payments', label: 'Payment Methods', icon: CreditCard },
        { id: 'suggestions', label: 'Buy Suggestions', icon: Gift },
        { id: 'profile', label: 'Account Settings', icon: User },
        { id: 'favorites', label: 'My Favorites', icon: Heart },
        { id: 'checkout', label: 'Checkout', icon: ShoppingBag, hidden: items.length === 0 },
        { id: 'help', label: 'Help Center', icon: HelpCircle },
    ];


    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending': return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-200">Pending</Badge>;
            case 'processing': return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">Processing</Badge>;
            case 'shipped': return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-200">Shipped</Badge>;
            case 'delivered':
            case 'completed': return <Badge variant="outline" className="bg-[#1B9157] text-[#1B9157] border-green-200">Delivered</Badge>;
            case 'cancelled': return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200">Cancelled</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h1 className="text-5xl font-black tracking-tightest text-beeyield-green">Dashboard <span className="text-beeyield-gold italic">Overview</span></h1>
                                <p className="text-beeyield-green/40 font-bold text-xs mt-2">Welcome back to the hive, {profileForm.firstName || 'Customer'}</p>
                            </div>
                            <Button onClick={() => navigate('/shop')} className="rounded-full px-10 h-14 shadow-xl shadow-beeyield-green/20 text-sm">
                                <ShoppingBag className="w-5 h-5 mr-2" /> Start Shopping
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            {[
                                { label: 'Total Orders', value: orders.length, icon: Package, color: 'text-beeyield-green', bg: 'bg-beeyield-green/5' },
                                { label: 'In Transit', value: orders.filter(o => o.status === 'shipped').length, icon: Truck, color: 'text-beeyield-orange', bg: 'bg-beeyield-orange/5' },
                                { label: 'Delivery Locations', value: addresses.length, icon: MapPin, color: 'text-beeyield-green', bg: 'bg-beeyield-green/5' },
                                { label: 'My Favorites', value: wishlistItems.length.toString(), icon: Heart, color: 'text-beeyield-orange', bg: 'bg-beeyield-orange/5' },
                            ].map((stat, i) => (
                                <Card key={i} className="border-none shadow-2xl shadow-beeyield-green/[0.02] rounded-[32px] overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                                    <CardContent className="p-8">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-[10px] font-black text-beeyield-green/30 mb-3">{stat.label}</p>
                                                <p className="text-3xl font-black text-beeyield-green">{stat.value}</p>
                                            </div>
                                            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                                <stat.icon className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Tracking Dialog */}
                        <Dialog open={isTrackingOpen} onOpenChange={setIsTrackingOpen}>
                            <DialogContent className="max-w-md rounded-3xl">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black">Shipment <span className="text-primary italic">Tracking</span></DialogTitle>
                                    <DialogDescription>
                                        Order {trackingOrder?.order_number || trackingOrder?.id}
                                    </DialogDescription>
                                </DialogHeader>
                                {loadingTracking ? (
                                    <div className="flex flex-col items-center justify-center py-10 space-y-4">
                                        <Loader className="w-10 h-10 text-primary animate-spin" />
                                        <p className="text-sm font-bold opacity-50">Syncing with logistics network...</p>
                                    </div>
                                ) : trackingInfo ? (
                                    <div className="space-y-6 pt-4">
                                        <div className="flex items-center justify-between p-4 bg-primary/10 rounded-2xl border border-primary/20">
                                            <div>
                                                <p className="text-[10px] font-black opacity-60">Status</p>
                                                <p className="text-lg font-black text-primary capitalize">{trackingInfo.current_status}</p>
                                            </div>
                                            <Badge className="bg-primary text-[#1A1A1A]">{trackingInfo.estimated_delivery}</Badge>
                                        </div>

                                        <div className="relative pl-6 space-y-8 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-muted before:rounded-full">
                                            {(trackingInfo.events || []).map((event, i: number) => (
                                                <div key={i} className="relative group">
                                                    <div className={`absolute -left-[27px] top-1.5 w-4 h-4 rounded-full border-4 border-white ${i === 0 ? 'bg-primary' : 'bg-muted'} shadow-sm group-hover:scale-125 transition-transform`} />
                                                    <div className="space-y-1">
                                                        <p className={`font-black tracking-tight ${i === 0 ? 'text-foreground' : 'text-muted-foreground'}`}>{event.status.toUpperCase()}</p>
                                                        <p className="text-sm text-muted-foreground font-medium">{event.description}</p>
                                                        <div className="flex items-center gap-2 text-[10px] font-bold opacity-40 tracking-tighter">
                                                            <span>{new Date(event.created_at).toLocaleString()}</span>
                                                            {event.location && <span>• {event.location}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-10 opacity-50">
                                        <p>Tracking information not yet available for this order.</p>
                                    </div>
                                )}
                            </DialogContent>
                        </Dialog>


                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <Card className="border-none shadow-premium rounded-[2.5rem]">
                                <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-2xl font-black">Recent Orders</CardTitle>
                                        <CardDescription>Your last 3 transactions</CardDescription>
                                    </div>
                                    <Button variant="ghost" className="rounded-full" onClick={() => setActiveTab('orders')}>View All</Button>
                                </CardHeader>
                                <CardContent className="p-8 space-y-4">
                                    {orders.slice(0, 3).map(order => (
                                        <div key={order.id} className="flex items-center justify-between p-4 rounded-2xl border border-muted hover:bg-muted/30 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center">
                                                    <Package className="w-6 h-6 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-bold">{order.order_number || 'ORD-' + order.id.slice(0, 5)}</p>
                                                    <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="text-right flex items-center gap-4">
                                                <p className="font-black text-sm">KES {order.total_amount.toLocaleString()}</p>
                                                {getStatusBadge(order.status)}
                                            </div>
                                        </div>
                                    ))}
                                    {orders.length === 0 && (
                                        <div className="text-center py-10 bg-muted/20 rounded-xl">
                                            <p className="text-muted-foreground">No recent orders found.</p>
                                            <Button variant="link" onClick={() => navigate('/shop')}>Start Shopping</Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-premium rounded-[2.5rem] bg-gradient-to-br from-primary/10 to-transparent">
                                <CardHeader className="p-8 pb-0">
                                    <CardTitle className="text-2xl font-black">Quick Actions</CardTitle>
                                    <CardDescription>Commonly tasks for your account</CardDescription>
                                </CardHeader>
                                <CardContent className="p-8 grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'Track Order', icon: MapPin, tab: 'orders' },
                                        { label: 'Order History', icon: Package, tab: 'orders' }, // Replaced Wallet
                                        { label: 'Update Profile', icon: User, tab: 'profile' },
                                        { label: 'Support Chat', icon: HelpCircle, tab: 'help' }
                                    ].map((action, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveTab(action.tab)}
                                            className="flex flex-col items-center justify-center p-6 bg-[#FFF9F0] rounded-3xl border border-[#F4D03F]/40 hover:scale-105 transition-all shadow-sm"
                                        >
                                            <action.icon className="w-8 h-8 text-primary mb-3" />
                                            <span className="text-sm font-bold">{action.label}</span>
                                        </button>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                );
            case 'orders':
                return (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-black tracking-tight">Order History</h2>
                            {/* Removed manual refresh button for orders */}
                        </div>

                        {orders.length === 0 ? (
                            <div className="text-center py-20 bg-muted/10 rounded-3xl border-2 border-dashed border-muted">
                                <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/30 mb-6" />
                                <h3 className="text-xl font-bold mb-2">No Orders Yet</h3>
                                <Button onClick={() => navigate('/shop')}>Browse Shop</Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map(order => (
                                    <Card key={order.id} className="border-none shadow-sm hover:shadow-md transition-all rounded-3xl">
                                        <CardContent className="p-6">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <div className="flex gap-6">
                                                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                                                        <Package className="w-8 h-8 text-muted-foreground" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-lg font-black">{order.order_number || 'ORD-' + order.id.slice(0, 5)}</p>
                                                        <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                                                        <div className="flex gap-2 pt-1">
                                                            {getStatusBadge(order.status)}
                                                            <Badge variant="secondary" className="bg-muted text-foreground border-none">KES {order.total_amount.toLocaleString()}</Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    <Button variant="secondary" size="sm" className="rounded-full" onClick={() => handleTrackOrder(order)}>
                                                        <Truck className="w-4 h-4 mr-2" /> Track
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="rounded-full" onClick={() => navigate(`/receipt/${order.id}`)}>
                                                        <FileText className="w-4 h-4 mr-2" /> Receipt
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="rounded-full" onClick={() => handleDownloadInvoice(order)}>
                                                        <Download className="w-4 h-4 mr-2" /> PDF
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'wallet':
                return null; // Removed

            case 'addresses':
                return (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">Delivery Locations</h2>
                                <p className="text-muted-foreground">Manage your shipping addresses.</p>
                            </div>
                            <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
                                <DialogTrigger asChild>
                                    <Button onClick={() => { setEditingAddress(null); setIsAddressModalOpen(true); }}><Plus className="h-4 w-4 mr-2" /> Add Address</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
                                        <DialogDescription>{editingAddress ? 'Update your delivery location details.' : 'Add a new delivery location for checkout.'}</DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={async (e) => {
                                        e.preventDefault();
                                        const formData = new FormData(e.currentTarget);
                                        const addressData = {
                                            name: formData.get('name') as string,
                                            email: formData.get('email') as string,
                                            phone: formData.get('phone') as string,
                                            street: formData.get('street') as string,
                                            apartment: formData.get('apartment') as string,
                                            building: formData.get('building') as string,
                                            floor: formData.get('floor') as string,
                                            city: formData.get('city') as string,
                                            county: formData.get('county') as string,
                                            postal_code: formData.get('postal_code') as string,
                                            is_default: (formData.get('is_default') === 'on')
                                        };
                                        if (editingAddress) {
                                            await updateAddress(editingAddress.id, addressData);
                                        } else {
                                            await saveAddress(addressData);
                                        }
                                        setIsAddressModalOpen(false);
                                    }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Location Name</Label>
                                            <Input id="name" name="name" required placeholder="Home / Office" defaultValue={editingAddress?.name} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Context Email</Label>
                                            <Input id="email" name="email" type="email" placeholder="delivery@beeyield.com" defaultValue={editingAddress?.email} />
                                        </div>
                                        <div className="grid gap-2 md:col-span-2">
                                            <Label htmlFor="street">Street & Number</Label>
                                            <Input id="street" name="street" required placeholder="123 Beevior St" defaultValue={editingAddress?.street} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="building">Building / Estate</Label>
                                            <Input id="building" name="building" placeholder="Honey Heights" defaultValue={editingAddress?.building} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="apartment">Apartment / Suite</Label>
                                            <Input id="apartment" name="apartment" placeholder="Unit 402" defaultValue={editingAddress?.apartment} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="floor">Floor / Level</Label>
                                            <Input id="floor" name="floor" placeholder="4th Floor" defaultValue={editingAddress?.floor} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="city">City</Label>
                                            <Input id="city" name="city" required placeholder="Nairobi" defaultValue={editingAddress?.city} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="county">County</Label>
                                            <Input id="county" name="county" required placeholder="Nairobi" defaultValue={editingAddress?.county} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="postal_code">Postal Code</Label>
                                            <Input id="postal_code" name="postal_code" placeholder="00100" defaultValue={editingAddress?.postal_code} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input id="phone" name="phone" required placeholder="+254..." defaultValue={editingAddress?.phone} />
                                        </div>
                                        <div className="md:col-span-2 flex items-center gap-2">
                                            <input type="checkbox" id="is_default" name="is_default" className="w-4 h-4" title="Set this address as default" defaultChecked={editingAddress?.is_default} />
                                            <Label htmlFor="is_default">Set as default address</Label>
                                        </div>
                                        <div className="md:col-span-2 pt-4">
                                            <Button type="submit" className="w-full">{editingAddress ? 'Update Location' : 'Save Location'}</Button>
                                        </div>
                                    </form>

                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {addresses.map((addr) => (
                                <Card key={addr.id} className="relative">
                                    <CardHeader>
                                        <CardTitle className="text-base font-bold flex justify-between">
                                            {addr.name}
                                            {addr.is_default && <Badge variant="secondary">Default</Badge>}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm space-y-1 text-muted-foreground">
                                        <p>{addr.street}</p>
                                        <p>{addr.city}, {addr.county}</p>
                                        <p>{addr.phone}</p>
                                    </CardContent>
                                    <CardFooter className="flex justify-end gap-2">
                                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => handleDeleteAddress(addr.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => {
                                            setEditingAddress(addr);
                                            setIsAddressModalOpen(true);
                                        }}><Edit2 className="h-4 w-4" /></Button>
                                    </CardFooter>

                                </Card>
                            ))}
                            {addresses.length === 0 && <p className="text-muted-foreground col-span-2 text-center py-8">No addresses saved.</p>}
                        </div>
                    </div>
                );
            case 'payments':
                return (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-black tracking-tight">Payment Methods</h2>
                            <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                                <DialogTrigger asChild>
                                    <Button onClick={() => setIsPaymentModalOpen(true)} className="rounded-full px-8 h-12 shadow-xl shadow-beeyield-green/10">
                                        <Plus className="w-5 h-4 mr-2" /> Add Payment Method
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md rounded-[2.5rem] p-10 border-none shadow-premium bg-white overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-beeyield-gold/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
                                    <DialogHeader className="mb-6 relative z-10">
                                        <DialogTitle className="text-3xl font-black">Link <span className="text-primary italic">Card</span></DialogTitle>
                                        <DialogDescription className="text-muted-foreground font-medium">Add a credit or debit card for subscription and shop checkout.</DialogDescription>
                                    </DialogHeader>
                                    <div className="bg-[#FFF9F0] p-6 rounded-3xl border border-beeyield-gold/20 mb-6 relative z-10">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 rounded-2xl bg-[#1B9157]/10 flex items-center justify-center">
                                                <Shield className="w-5 h-5 text-[#1B9157]" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-[#1B9157]">Bank-Grade Security</p>
                                                <p className="text-[10px] font-bold text-muted-foreground">Encrypted by Stripe</p>
                                            </div>
                                        </div>
                                        <StripeCardForm
                                            mode="save"
                                            buttonText="Link Card Securely"
                                            onSuccess={async (pm) => {
                                                try {
                                                    await saveStripePaymentMethod(pm.id, pm);
                                                    await loadUserData();
                                                    setIsPaymentModalOpen(false);
                                                } catch (error) {
                                                    console.error('Failed to save card:', error);
                                                    toast.error('Failed to save card. Please try again.');
                                                }
                                            }}
                                            onError={(error) => {
                                                console.error('Stripe error:', error);
                                            }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-center text-muted-foreground font-bold leading-relaxed px-4 opacity-60">By linking your card, you authorize BeeYield to securely store this method for future transactions. You can remove it at any time.</p>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Info banner about Stripe security */}
                        <Card className="border-none bg-gradient-to-r from-blue-50 to-indigo-50">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-2 bg-blue-500/10 rounded-full">
                                    <Shield className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-blue-900">Secured by Stripe</p>
                                    <p className="text-sm text-blue-700">Your payment information is encrypted and never stored on our servers.</p>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {paymentMethods.map((pm) => (
                                <Card key={pm.id} className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white border-none overflow-hidden relative shadow-2xl">
                                    {/* Glassmorphism overlay */}
                                    <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />
                                    {/* Card chip decoration */}
                                    <div className="absolute top-6 left-6 w-12 h-10 rounded-lg bg-gradient-to-br from-beeyield-gold to-beeyield-orange/80 shadow-inner" />
                                    <div className="absolute top-6 right-6 opacity-20 transform translate-x-1/2 -translate-y-1/2">
                                        <div className="w-32 h-32 rounded-full bg-white/10 blur-3xl" />
                                    </div>
                                    <CardContent className="p-6 pt-16 relative">
                                        <div className="absolute top-4 right-4">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-white/40 hover:text-white hover:bg-white/10"
                                                onClick={() => handleDeletePaymentMethod(pm.id)}
                                            >
                                                <XCircle className="h-5 w-5" />
                                            </Button>
                                        </div>
                                        <div className="mb-6">
                                            <p
                                                className="text-2xl font-mono"
                                                aria-label={`Card ending in ${pm.last4}`}
                                            >
                                                •••• •••• •••• {pm.last4}
                                            </p>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] text-white/40 mb-1 font-black">Card Holder</p>
                                                <p className="font-bold truncate max-w-[150px] tracking-tight">{pm.card_holder_name || profileForm.firstName + ' ' + profileForm.lastName}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-white/40 mb-1 font-black">Valid Thru</p>
                                                <p className="font-bold">{String(pm.expiry_month).padStart(2, '0')}/{String(pm.expiry_year).slice(-2)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-black italic tracking-tighter opacity-80">{pm.provider || 'Visa'}</p>
                                            </div>
                                        </div>
                                        {(pm.is_default || pm.isDefault) && (
                                            <Badge className="absolute top-4 left-24 bg-beeyield-gold text-beeyield-green font-black text-[9px] px-2 py-0 border-none shadow-premium">
                                                Active
                                            </Badge>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                            {paymentMethods.length === 0 && (
                                <div className="col-span-2 text-center py-12 bg-muted/20 rounded-2xl border-2 border-dashed border-muted">
                                    <CreditCard className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                                    <h3 className="font-bold text-lg mb-2">No saved cards</h3>
                                    <p className="text-muted-foreground mb-4">Add a card for faster checkout next time.</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'suggestions':
                return (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div>
                            <h2 className="text-4xl font-black tracking-tightest">Curated <span className="text-primary italic">Picks</span></h2>
                            <p className="text-muted-foreground font-medium">Based on your interest in precision apiculture</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {suggestions.map((product) => (
                                <Card key={product.id} className="border-none shadow-premium rounded-[2rem] overflow-hidden group">
                                    <div className="aspect-square bg-muted relative overflow-hidden">
                                        <img
                                            src={product.images[0]}
                                            alt={product.name ? `${product.name} product image` : 'Honey product image'}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <Badge className="absolute top-4 left-4 rounded-full">{product.badge || 'New'}</Badge>
                                    </div>
                                    <CardContent className="p-6">
                                        <h3 className="font-black text-lg mb-1 truncate">{product.name}</h3>
                                        <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{product.description}</p>
                                        <div className="flex justify-between items-center">
                                            <p className="font-black text-primary">KES {product.variants[0].price_kes.toLocaleString()}</p>
                                            <Button size="icon" variant="ghost" className="rounded-full" onClick={() => navigate('/shop')}><ArrowRight className="w-4 h-4" /></Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                );
            case 'profile':
                return (
                    <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl">
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">Personal Details</h2>
                            <p className="text-muted-foreground">Update your contact information.</p>
                        </div>
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="profile_first_name">First Name</Label>
                                        <Input
                                            id="profile_first_name"
                                            name="profile_first_name"
                                            value={profileForm.firstName}
                                            onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="profile_last_name">Last Name</Label>
                                        <Input
                                            id="profile_last_name"
                                            name="profile_last_name"
                                            value={profileForm.lastName}
                                            onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="profile_email">Email Address</Label>
                                    <Input
                                        id="profile_email"
                                        name="profile_email"
                                        value={profileForm.email}
                                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                        type="email"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="profile_phone">Phone Number</Label>
                                    <Input
                                        id="profile_phone"
                                        name="profile_phone"
                                        value={profileForm.phone}
                                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                        type="tel"
                                    />
                                </div>
                                <div className="pt-4">
                                    <Button onClick={updateProfile}>Save Changes</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );
            case 'favorites':
                return (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div>
                            <h2 className="text-4xl font-black tracking-tightest">My <span className="text-primary italic">Favorites</span></h2>
                            <p className="text-muted-foreground font-medium">Items you've saved for later</p>
                        </div>

                        {wishlistItems.length === 0 ? (
                            <Card className="border-none shadow-premium rounded-[2.5rem] p-20 text-center">
                                <Heart className="w-16 h-16 mx-auto text-muted-foreground/20 mb-6" />
                                <h3 className="text-xl font-bold mb-2">Your favorites list is empty</h3>
                                <p className="text-muted-foreground mb-8">Start exploring our shop and save items you love!</p>
                                <Button onClick={() => navigate('/shop')} className="rounded-full">Browse Shop</Button>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {wishlistItems.map((item) => (
                                    <Card key={item.id} className="border-none shadow-premium rounded-[2rem] overflow-hidden group relative">
                                        <button
                                            onClick={() => removeFromWishlist(item.id)}
                                            aria-label={`Remove ${item.name} from favorites`}
                                            className="absolute top-4 right-4 z-10 p-2 bg-[#FFF9F0]/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <div className="aspect-square bg-muted relative overflow-hidden">
                                            <img
                                                src={item.image}
                                                alt={item.name ? `${item.name} product image` : 'Honey product image'}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            {item.badge && <Badge className="absolute top-4 left-4 rounded-full">{item.badge}</Badge>}
                                        </div>
                                        <CardContent className="p-6">
                                            <h3 className="font-black text-lg mb-1 truncate">{item.name}</h3>
                                            <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{item.description}</p>
                                            <div className="flex justify-between items-center">
                                                <p className="font-black text-primary font-mono">KES {item.price.toLocaleString()}</p>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="ghost" className="rounded-xl border border-border" onClick={() => navigate('/shop')}>Details</Button>
                                                    <Button size="sm" className="rounded-xl" onClick={() => {
                                                        // Get the product from fallback or just add this item (simple version)
                                                        toast.success("Item added to cart!");
                                                        navigate('/shop'); // Go to shop to select size properly or just add direct
                                                    }}>Buy Now</Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'help':
                return (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div>
                            <h2 className="text-4xl font-black tracking-tightest">Support <span className="text-primary italic">Center</span></h2>
                            <p className="text-muted-foreground font-medium">How can we help you today?</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { title: 'Order Support', desc: 'Questions about delivery or returns', icon: Package },
                                { title: 'Account Issues', desc: 'Can\'t log in or change details', icon: Shield },
                                { title: 'Technical Help', desc: 'Trouble with the BeeYield platform', icon: Settings },
                            ].map((item, i) => (
                                <Card key={i} className="border-none shadow-premium rounded-3xl p-8 hover:bg-primary/5 transition-all text-center group">
                                    <div className="w-16 h-16 rounded-2xl bg-muted mx-auto mb-6 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                        <item.icon className="w-8 h-8 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground mb-6">{item.desc}</p>
                                    <Button variant="outline" className="rounded-full w-full">Contact Specialist</Button>
                                </Card>
                            ))}
                        </div>
                    </div>
                );
            case 'checkout': {
                const totalPrice: number = getTotalPrice();
                const checkoutShippingCost: number = totalPrice >= 5000 ? 0 : 350;
                const checkoutTotalWithShipping: number = totalPrice + checkoutShippingCost;

                const processDashboardPayment = async () => {
                    setIsProcessing(true);
                    try {
                        const orderData: CheckoutOrder = {
                            shipping_address: {
                                first_name: shippingDetails.fullName.split(' ')[0] || '',
                                last_name: shippingDetails.fullName.split(' ').slice(1).join(' ') || '',
                                email: shippingDetails.email,
                                phone: shippingDetails.phone,
                                address: shippingDetails.street,
                                city: shippingDetails.city,
                                county: shippingDetails.county,
                                postal_code: shippingDetails.postalCode,
                            },
                            payment_method: paymentMethod,
                            payment_method_id: paymentMethod === 'card' ? (selectedPaymentMethodId || undefined) : undefined,
                            items: items.map(item => ({
                                product_id: item.productId.toString(),
                                variant_id: item.variantId,
                                quantity: item.quantity
                            })),
                            total_kes: checkoutTotalWithShipping,
                            notes: shippingDetails.notes + (shippingDetails.building ? ` | Bldg: ${shippingDetails.building}` : "") + (shippingDetails.apartment ? ` | Apt: ${shippingDetails.apartment}` : "")
                        };


                        const response = await initializeCheckout(orderData, session?.access_token);
                        setOrderNumber(response.order_id || `BY-${Date.now().toString(36).toUpperCase()}`);
                        clearCart();
                        setCheckoutStep('confirmation');
                        toast.success('Order placed successfully!');
                    } catch (error) {
                        toast.error('Payment failed. Please try again.');
                    } finally {
                        setIsProcessing(false);
                    }
                };

                if (items.length === 0 && checkoutStep !== 'confirmation') {
                    return (
                        <div className="text-center py-20">
                            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                            <h2 className="text-2xl font-black">Your cart is empty</h2>
                            <Button onClick={() => navigate('/shop')} className="mt-4 rounded-full">Browse Products</Button>
                        </div>
                    );
                }

                return (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div>
                            <h2 className="text-4xl font-black tracking-tightest">Secure <span className="text-primary italic">Checkout</span></h2>
                            <p className="text-muted-foreground font-medium">Complete your premium order</p>
                        </div>

                        {checkoutStep === 'confirmation' ? (
                            <Card className="border-none shadow-premium rounded-[2.5rem] p-12 text-center">
                                <div className="w-20 h-20 rounded-full bg-[#1B9157] flex items-center justify-center mx-auto mb-6 animate-bounce">
                                    <CheckCircle2 className="w-10 h-10 text-[#1B9157]" />
                                </div>
                                <h1 className="text-3xl font-black mb-4">Order Confirmed! 🎉</h1>
                                <p className="text-muted-foreground mb-8 text-lg">Thank you for your purchase. We're preparing your honey.</p>
                                <div className="bg-muted/50 rounded-3xl p-6 inline-block mb-10 border border-border/50">
                                    <p className="text-xs font-black text-muted-foreground mb-1">Order Identifier</p>
                                    <p className="text-3xl font-black text-primary">{orderNumber}</p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button onClick={() => navigate('/shop')} className="rounded-full px-8">Continue Shopping</Button>
                                    <Button variant="outline" onClick={() => setActiveTab('orders')} className="rounded-full px-8">View My Orders</Button>
                                </div>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Steps Header */}
                                    <div className="flex items-center gap-4 bg-muted/30 p-2 rounded-2xl w-fit">
                                        <button
                                            onClick={() => setCheckoutStep('shipping')}
                                            className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${checkoutStep === 'shipping' ? 'bg-primary text-[#1A1A1A] shadow-sm' : 'text-muted-foreground'}`}
                                        >
                                            1. Shipping
                                        </button>
                                        <button
                                            onClick={() => setCheckoutStep('payment')}
                                            className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${checkoutStep === 'payment' ? 'bg-primary text-[#1A1A1A] shadow-sm' : 'text-muted-foreground'}`}
                                        >
                                            2. Payment
                                        </button>
                                    </div>

                                    {checkoutStep === 'shipping' && (
                                        <Card className="border-none shadow-premium rounded-[2rem] p-8 space-y-6">
                                            {addresses.length > 0 && (
                                                <div className="space-y-4">
                                                    <Label className="text-sm font-black opacity-60">Use a saved location</Label>
                                                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                                        {addresses.map(addr => (
                                                            <button
                                                                key={addr.id}
                                                                onClick={() => {
                                                                    setShippingDetails({
                                                                        ...shippingDetails,
                                                                        fullName: profileForm.firstName + " " + profileForm.lastName,
                                                                        email: addr.email || profileForm.email,
                                                                        phone: addr.phone,
                                                                        street: addr.street,
                                                                        city: addr.city,
                                                                        county: addr.county,
                                                                        apartment: addr.apartment || '',
                                                                        building: addr.building || '',
                                                                        floor: addr.floor || '',
                                                                        postalCode: addr.postal_code || '',
                                                                    });
                                                                    toast.success(`Using ${addr.name}`);
                                                                }}
                                                                className="flex-shrink-0 p-4 border-2 border-border rounded-2xl text-left hover:border-primary transition-all group"
                                                            >
                                                                <p className="font-bold group-hover:text-primary">{addr.name}</p>
                                                                <p className="text-[10px] text-muted-foreground">{addr.city}</p>
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <Separator className="opacity-50" />
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="md:col-span-2 space-y-2">
                                                    <Label>Full Name / Recipient</Label>
                                                    <Input
                                                        id="checkout-full-name"
                                                        name="fullName"
                                                        value={shippingDetails.fullName}
                                                        onChange={e => setShippingDetails({ ...shippingDetails, fullName: e.target.value })}
                                                        placeholder="Timothy Nduva"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Contact Phone</Label>
                                                    <Input
                                                        id="checkout-phone"
                                                        name="phone"
                                                        value={shippingDetails.phone}
                                                        onChange={e => setShippingDetails({ ...shippingDetails, phone: e.target.value })}
                                                        placeholder="+254..."
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Contact Email</Label>
                                                    <Input
                                                        id="checkout-email"
                                                        name="email"
                                                        value={shippingDetails.email}
                                                        onChange={e => setShippingDetails({ ...shippingDetails, email: e.target.value })}
                                                        placeholder="test@example.com"
                                                    />
                                                </div>
                                                <div className="md:col-span-2 space-y-2">
                                                    <Label>Street & Number</Label>
                                                    <Input
                                                        id="checkout-street"
                                                        name="street"
                                                        value={shippingDetails.street}
                                                        onChange={e => setShippingDetails({ ...shippingDetails, street: e.target.value })}
                                                        placeholder="123 Beevior Road"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Building / Estate</Label>
                                                    <Input
                                                        id="checkout-building"
                                                        name="building"
                                                        value={shippingDetails.building}
                                                        onChange={e => setShippingDetails({ ...shippingDetails, building: e.target.value })}
                                                        placeholder="Honey Heights"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Apt / Suite / Floor</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            id="checkout-apartment"
                                                            name="apartment"
                                                            value={shippingDetails.apartment}
                                                            onChange={e => setShippingDetails({ ...shippingDetails, apartment: e.target.value })}
                                                            placeholder="Apt 2B"
                                                        />
                                                        <Input
                                                            id="checkout-floor"
                                                            name="floor"
                                                            value={shippingDetails.floor}
                                                            onChange={e => setShippingDetails({ ...shippingDetails, floor: e.target.value })}
                                                            placeholder="4th"
                                                            className="w-20"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>City</Label>
                                                    <Input
                                                        id="checkout-city"
                                                        name="city"
                                                        value={shippingDetails.city}
                                                        onChange={e => setShippingDetails({ ...shippingDetails, city: e.target.value })}
                                                        placeholder="Nairobi"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>County</Label>
                                                    <Input
                                                        id="checkout-county"
                                                        name="county"
                                                        value={shippingDetails.county}
                                                        onChange={e => setShippingDetails({ ...shippingDetails, county: e.target.value })}
                                                        placeholder="Nairobi"
                                                    />
                                                </div>
                                            </div>
                                            <Button onClick={() => setCheckoutStep('payment')} className="w-full rounded-full h-12 text-lg font-bold">
                                                Continue to Payment <ArrowRight className="ml-2 w-5 h-5" />
                                            </Button>
                                        </Card>
                                    )}


                                    {checkoutStep === 'payment' && (
                                        <Card className="border-none shadow-premium rounded-[2rem] p-8 space-y-8">
                                            <RadioGroup value={paymentMethod} onValueChange={v => setPaymentMethod(v as 'mpesa' | 'card')} className="grid gap-4">
                                                <div className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between ${paymentMethod === 'mpesa' ? 'border-primary bg-primary/5' : 'border-border'}`} onClick={() => setPaymentMethod('mpesa')}>
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-[#1B9157]/10 flex items-center justify-center">
                                                            <Smartphone className="text-[#1B9157]" />
                                                        </div>
                                                        <span className="font-bold text-lg">M-Pesa</span>
                                                    </div>
                                                    <RadioGroupItem value="mpesa" />
                                                </div>
                                                <div className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col gap-4 ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border'}`} onClick={() => setPaymentMethod('card')}>
                                                    <div className="flex items-center justify-between w-full">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                                                                <CreditCard className="text-blue-600" />
                                                            </div>
                                                            <span className="font-bold text-lg">Bank Card</span>
                                                        </div>
                                                        <RadioGroupItem value="card" />
                                                    </div>

                                                    {paymentMethod === 'card' && (
                                                        <div className="pt-2 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                                            {paymentMethods.length > 0 ? (
                                                                <>
                                                                    <p className="text-[10px] font-black text-muted-foreground ml-1">Use Saved Card</p>
                                                                    <div className="grid gap-2">
                                                                        {paymentMethods.map(pm => (
                                                                            <div
                                                                                key={pm.id}
                                                                                onClick={(e) => { e.stopPropagation(); setSelectedPaymentMethodId(pm.id); }}
                                                                                className={`p-4 rounded-2xl border flex items-center justify-between group transition-all cursor-pointer ${selectedPaymentMethodId === pm.id ? 'border-primary bg-white shadow-sm' : 'border-border bg-white/50 hover:bg-white'}`}
                                                                            >
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-bold text-[10px]">{pm.brand === 'Visa' ? 'V' : 'MC'}</div>
                                                                                    <span className="font-bold text-sm">•••• {pm.last4}</span>
                                                                                </div>
                                                                                <div className={`w-4 h-4 rounded-full border-2 border-primary transition-all ${selectedPaymentMethodId === pm.id ? 'bg-primary' : 'bg-transparent'}`} />
                                                                            </div>
                                                                        ))}
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={(e) => { e.stopPropagation(); setSelectedPaymentMethodId(null); }}
                                                                            className={`w-full justify-start font-bold text-xs h-10 px-4 rounded-xl ${!selectedPaymentMethodId ? 'bg-primary/10 text-primary' : ''}`}
                                                                        >
                                                                            + Use a new card
                                                                        </Button>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="p-4 bg-white/50 rounded-2xl border border-dashed text-center">
                                                                    <p className="text-xs font-bold text-muted-foreground">No cards saved yet. You'll enter details next.</p>
                                                                </div>
                                                            )}

                                                            {!selectedPaymentMethodId && (
                                                                <div className="p-4 bg-white rounded-2xl shadow-premium animate-in zoom-in-95 duration-300">
                                                                    <StripeCardForm
                                                                        mode="save"
                                                                        buttonText="Verify & Pay"
                                                                        onSuccess={async (pm) => {
                                                                            await saveStripePaymentMethod(pm.id, pm);
                                                                            loadUserData();
                                                                            setSelectedPaymentMethodId(pm.id);
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </RadioGroup>
                                            <Button onClick={processDashboardPayment} disabled={isProcessing} className="w-full rounded-full h-14 text-xl font-black">
                                                {isProcessing ? <Loader className="animate-spin mr-2" /> : `Pay KES ${checkoutTotalWithShipping.toLocaleString()}`}
                                            </Button>
                                        </Card>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <Card className="border-none shadow-premium rounded-[2rem] p-8 bg-muted/20">
                                        <h3 className="font-black text-xl mb-6">Order Summary</h3>
                                        <div className="space-y-4">
                                            {items.map(item => (
                                                <div key={item.id} className="flex justify-between items-center text-sm">
                                                    <span className="font-medium text-muted-foreground">{item.name} x{item.quantity}</span>
                                                    <span className="font-bold">KES {(item.price * item.quantity).toLocaleString()}</span>
                                                </div>
                                            ))}
                                            <Separator className="bg-border/50" />
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Shipping</span>
                                                <span className="font-bold">{checkoutShippingCost === 0 ? 'Free' : `KES ${checkoutShippingCost}`}</span>
                                            </div>
                                            <div className="flex justify-between text-xl font-black pt-4 border-t border-border">
                                                <span>Total</span>
                                                <span className="text-primary">KES {checkoutTotalWithShipping.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </Card>
                                    <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                        <Shield className="w-5 h-5 text-primary" />
                                        <p className="text-xs font-medium text-muted-foreground leading-tight">Your data is protected with encrypted connections.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            }
            default:
                return (
                    <div className="text-center py-32 bg-[#FFF9F0] rounded-[3rem] border-2 border-dashed border-muted">
                        <Loader2 className="w-12 h-12 animate-spin text-primary/30 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold">In Development</h2>
                        <p className="text-muted-foreground mt-2">This section is being custom built for your account.</p>
                        <Button variant="link" onClick={() => setActiveTab('overview')} className="mt-4">Return Home</Button>
                    </div>
                );
        }
    };

    if (authLoading) {
        // Show nothing, let data load instantly
        return null;
    }

    if (!user) {
        // Show login/signup modal for Shop dashboard
        return (
            <BeeYieldPageShell className="min-h-screen flex items-center justify-center bg-beeyield-cream/50 relative overflow-hidden p-0">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-beeyield-gold/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-beeyield-orange/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="max-w-md w-full p-8 rounded-[2.5rem] shadow-premium bg-[#FFF9F0] border border-beeyield-gold/20 relative z-10 mx-4">
                    <div className="flex justify-center mb-8 relative">
                        <div className="absolute inset-0 bg-beeyield-gold/20 blur-xl rounded-full scale-150 animate-pulse" />
                        <img src="/logo.png" alt="BeeYield Logo" className="w-20 h-20 relative z-10" />
                    </div>
                    <div className="mb-8 text-center space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-beeyield-gold/10 border border-beeyield-gold/20 mb-2">
                            <LockIcon className="w-3 h-3 text-beeyield-gold" />
                            <span className="text-[10px] font-black text-beeyield-gold">Secure Portal</span>
                        </div>
                        <h1 className="text-3xl font-black text-beeyield-green tracking-tightest">Shop <span className="text-beeyield-gold italic">Access</span></h1>
                        <p className="text-sm font-medium text-beeyield-green/60 pb-6">Authenticate to view your orders, track deliveries, and manage your premium honey subscription.</p>

                        {authMode === 'login' && (
                            <div className="animate-fade-in-up">
                                <ShopLoginForm
                                    onSuccess={() => window.location.reload()}
                                    onSwitchToRegister={() => setAuthMode('register')}
                                    onForgotPassword={() => setAuthMode('forgot-password')}
                                />
                            </div>
                        )}

                        {authMode === 'register' && (
                            <div className="animate-fade-in-up">
                                <ShopRegisterForm
                                    onSuccess={() => setAuthMode('login')}
                                    onSwitchToLogin={() => setAuthMode('login')}
                                />
                            </div>
                        )}
                        {authMode === 'forgot-password' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <ForgotPasswordForm
                                    variant="shop"
                                    onBackToLogin={() => setAuthMode('login')}
                                />
                            </div>
                        )}

                        <div className="mt-8 pt-6 border-t border-beeyield-gold/10">
                            <Button
                                variant="ghost"
                                onClick={() => navigate('/shop')}
                                className="w-full text-beeyield-green/40 hover:text-beeyield-green group font-bold text-xs"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Public Shop
                            </Button>
                        </div>
                    </div>
                </div>
            </BeeYieldPageShell>
        );
    }

    return (
        <BeeYieldPageShell className="p-0">
            <ShopDashboardLayout
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onLogout={handleLogout}
                navItems={navItems}
            >
            <div className="pb-12">
                {renderContent()}
            </div>

            {/* Tracking Modal */}
            <Dialog open={isTrackingOpen} onOpenChange={setIsTrackingOpen}>
                <DialogContent className="max-w-md rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">Shipment <span className="text-primary italic">Tracking</span></DialogTitle>
                        <DialogDescription>
                            Order {trackingOrder?.order_number || trackingOrder?.id}
                        </DialogDescription>
                    </DialogHeader>
                    {loadingTracking ? (
                        <div className="flex flex-col items-center justify-center py-10 space-y-4">
                            <Loader className="w-10 h-10 text-primary animate-spin" />
                            <p className="text-sm font-bold opacity-50">Syncing with logistics network...</p>
                        </div>
                    ) : trackingInfo ? (
                        <div className="space-y-6 pt-4">
                            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-2xl border border-primary/20">
                                <div>
                                    <p className="text-[10px] font-black opacity-60">Status</p>
                                    <p className="text-lg font-black text-primary capitalize">{trackingInfo.current_status}</p>
                                </div>
                                <Badge className="bg-primary text-[#1A1A1A]">{trackingInfo.estimated_delivery}</Badge>
                            </div>

                            <div className="relative pl-6 space-y-8 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-muted before:rounded-full">
                                {(trackingInfo.events || []).map((event: { status: string; description: string; created_at: string; location?: string }, i: number) => (
                                    <div key={i} className="relative group">
                                        <div className={`absolute -left-[27px] top-1.5 w-4 h-4 rounded-full border-4 border-white ${i === 0 ? 'bg-primary' : 'bg-muted'} shadow-sm group-hover:scale-125 transition-transform`} />
                                        <div className="space-y-1">
                                            <p className={`font-black tracking-tight ${i === 0 ? 'text-foreground' : 'text-muted-foreground'}`}>{event.status.toUpperCase()}</p>
                                            <p className="text-sm text-muted-foreground font-medium">{event.description}</p>
                                            <div className="flex items-center gap-2 text-[10px] font-bold opacity-40 tracking-tighter">
                                                <span>{new Date(event.created_at).toLocaleString()}</span>
                                                {event.location && <span>• {event.location}</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-10 opacity-50">
                            <p>Tracking information not yet available for this order.</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            </ShopDashboardLayout>
        </BeeYieldPageShell>
    );
};


export default ShopDashboard;
