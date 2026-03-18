
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
    Lock as LockIcon,
    ShieldCheck,
    Clock,
    ChevronRight,
    Map
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

// ... preceding imports ...
import { toast } from 'sonner';
import { BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
import { glass, PageHeader } from '@/components/beeyield/GlassTheme';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
        const baseClass = "px-3 py-0.5 rounded-lg font-bold text-[10px] uppercase tracking-wider";
        switch (status?.toLowerCase()) {
            case 'pending': return <Badge variant="outline" className={cn(baseClass, "bg-[#F4D03F]/10 text-[#F4D03F] border-[#F4D03F]/20")}>Pending</Badge>;
            case 'processing': return <Badge variant="outline" className={cn(baseClass, "bg-blue-50 text-blue-600 border-blue-100")}>Processing</Badge>;
            case 'shipped': return <Badge variant="outline" className={cn(baseClass, "bg-indigo-50 text-indigo-600 border-indigo-100")}>Shipped</Badge>;
            case 'delivered':
            case 'completed': return <Badge variant="outline" className={cn(baseClass, "bg-green-50 text-green-600 border-green-100")}>Delivered</Badge>;
            case 'cancelled': return <Badge variant="outline" className={cn(baseClass, "bg-red-50 text-red-600 border-red-100")}>Cancelled</Badge>;
            default: return <Badge variant="outline" className={baseClass}>{status}</Badge>;
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <PageHeader
                            icon={LayoutGrid}
                            label="Customer Dashboard"
                            title={<>Welcome back, <span className="text-[#F4D03F]">{profileForm.firstName || 'Customer'}</span></>}
                            subtitle="Manage your honey orders and account preferences."
                            actions={
                                <Button onClick={() => navigate('/shop')} className={cn(glass.btnPrimary, "px-8")}>
                                    <ShoppingBag className="w-4 h-4 mr-2" /> Start Shopping
                                </Button>
                            }
                        />

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Total Orders', value: orders.length, icon: Package, color: 'text-[#F4D03F]' },
                                { label: 'In Transit', value: orders.filter(o => o.status === 'shipped').length, icon: Truck, color: 'text-[#F4D03F]' },
                                { label: 'Locations', value: addresses.length, icon: MapPin, color: 'text-[#F4D03F]' },
                                { label: 'Wishlist', value: wishlistItems.length, icon: Heart, color: 'text-[#F4D03F]' },
                            ].map((stat, i) => (
                                <div key={i} className={cn(glass.section, "p-5 flex items-center justify-between")}>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                                        <p className="text-2xl font-black text-[#1A1A1A]">{stat.value}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/10">
                                        <stat.icon className={cn("w-5 h-5", stat.color)} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Recent Activity */}
                            <div className="lg:col-span-8">
                                <div className={cn(glass.section, "overflow-hidden")}>
                                    <div className="px-6 py-4 border-b border-[#F4D03F]/10 flex items-center justify-between bg-white/30">
                                        <div>
                                            <h3 className="text-sm font-bold text-[#1A1A1A]">Recent Activity</h3>
                                            <p className="text-[11px] text-gray-500">Your latest shop interactions</p>
                                        </div>
                                        <button onClick={() => setActiveTab('orders')} className="text-[11px] font-bold text-[#F4D03F] hover:underline">
                                            View all
                                        </button>
                                    </div>
                                    <div className="p-4 space-y-2">
                                        {orders.slice(0, 3).map(order => (
                                            <div key={order.id} className="bg-white/50 border border-[#F4D03F]/10 rounded-xl p-4 flex items-center justify-between group hover:border-[#F4D03F]/30 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-[#F4D03F]/5 flex items-center justify-center">
                                                        <Package className="w-5 h-5 text-[#F4D03F]" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[13px] font-bold text-[#1A1A1A]">{order.order_number || 'ORD-' + order.id.slice(0, 5)}</p>
                                                        <p className="text-[11px] text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[13px] font-bold">KES {order.total_amount.toLocaleString()}</span>
                                                    {getStatusBadge(order.status)}
                                                </div>
                                            </div>
                                        ))}
                                        {orders.length === 0 && (
                                            <div className="text-center py-10 opacity-50 italic text-sm">No recent activity</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Workflows */}
                            <div className="lg:col-span-4">
                                <div className={cn(glass.section, "p-6")}>
                                    <h3 className="text-sm font-bold text-[#1A1A1A] mb-4">Quick Workflows</h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {[
                                            { id: 'orders', label: 'Track Shipment', icon: Truck, sub: 'Logistics network' },
                                            { id: 'profile', label: 'Update Profile', icon: User, sub: 'Account settings' },
                                            { id: 'addresses', label: 'Manage Places', icon: MapPin, sub: 'Shipping locations' },
                                            { id: 'help', label: 'Support Center', icon: HelpCircle, sub: 'Get assistance' },
                                        ].map((v) => (
                                            <button
                                                key={v.id}
                                                onClick={() => setActiveTab(v.id)}
                                                className="w-full text-left bg-white/50 border border-[#F4D03F]/10 rounded-xl p-3 hover:bg-white/80 hover:border-[#F4D03F]/30 transition-all flex items-center gap-3 group"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/10 group-hover:scale-105 transition-transform">
                                                    <v.icon className="w-5 h-5 text-[#F4D03F]" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-[12px] font-bold text-[#1A1A1A]">{v.label}</div>
                                                    <div className="text-[10px] text-gray-500">{v.sub}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            case 'orders':
                return (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <PageHeader
                            icon={Package}
                            label="Customer Management"
                            title="Order History"
                            subtitle="View and track all your transactions with BeeYield."
                        />

                        {orders.length === 0 ? (
                            <div className={cn(glass.section, "py-20 text-center")}>
                                <ShoppingBag className="h-16 w-16 mx-auto text-gray-200 mb-6" />
                                <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">No Orders Yet</h3>
                                <p className="text-gray-500 mb-8 max-w-xs mx-auto text-sm">You haven't placed any orders. Start exploring our harvest now.</p>
                                <Button onClick={() => navigate('/shop')} className={glass.btnPrimary}>Browse Shop</Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map(order => (
                                    <div key={order.id} className={cn(glass.section, "p-0 overflow-hidden group hover:border-[#F4D03F]/30 transition-all")}>
                                        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-[#F4D03F]/5 flex items-center justify-center border border-[#F4D03F]/10">
                                                    <Package className="w-6 h-6 text-[#F4D03F]" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-lg font-black text-[#1A1A1A] tracking-tight">{order.order_number || 'ORD-' + order.id.slice(0, 5)}</p>
                                                    <p className="text-[11px] text-gray-500 font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                                                    <div className="flex gap-2 pt-2">
                                                        {getStatusBadge(order.status)}
                                                        <Badge variant="outline" className="px-2 py-0.5 rounded-lg font-bold text-[10px] bg-white text-[#1A1A1A] border-[#F4D03F]/10">KES {order.total_amount.toLocaleString()}</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <button onClick={() => handleTrackOrder(order)} className={cn(glass.btnSecondary, "text-[11px] h-9 px-4")}>
                                                    <Truck className="w-3.5 h-3.5 mr-2 text-[#F4D03F]" /> Track
                                                </button>
                                                <button onClick={() => navigate(`/receipt/${order.id}`)} className={cn(glass.btnSecondary, "text-[11px] h-9 px-4")}>
                                                    <FileText className="w-3.5 h-3.5 mr-2 text-[#F4D03F]" /> Receipt
                                                </button>
                                                <button onClick={() => handleDownloadInvoice(order)} className={cn(glass.btnSecondary, "text-[11px] h-9 px-4")}>
                                                    <Download className="w-3.5 h-3.5 mr-2 text-[#F4D03F]" /> PDF Invoice
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                );
            case 'wallet':
                return null; // Removed

            case 'addresses':
                return (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <PageHeader
                            icon={MapPin}
                            label="Shipping Logistics"
                            title="Delivery Locations"
                            subtitle="Manage your saved addresses for efficient fulfillment."
                            actions={
                                <Button onClick={() => { setEditingAddress(null); setIsAddressModalOpen(true); }} className={glass.btnPrimary}>
                                    <Plus className="h-4 w-4 mr-2" /> New Location
                                </Button>
                            }
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {addresses.map((addr) => (
                                <div key={addr.id} className={cn(glass.section, "p-0 overflow-hidden group hover:border-[#F4D03F]/30 transition-all")}>
                                    <div className="p-6 flex flex-col h-full bg-white/40">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/10 text-[#F4D03F]">
                                                    <MapPin className="w-4 h-4" />
                                                </div>
                                                <p className="text-sm font-bold text-[#1A1A1A]">{addr.name}</p>
                                            </div>
                                            {addr.is_default && (
                                                <Badge className="bg-[#F4D03F]/15 text-[#1A1A1A] font-bold text-[9px] uppercase tracking-wider border-[#F4D03F]/20">Default</Badge>
                                            )}
                                        </div>
                                        <div className="space-y-1.5 flex-1 pl-12 text-[12px] text-gray-500 font-medium">
                                            <p className="text-[#1A1A1A] font-bold">{addr.street}</p>
                                            <p>{addr.building}</p>
                                            <p>{addr.city}, {addr.county}</p>
                                            <p className="pt-2">{addr.phone}</p>
                                        </div>
                                        <div className="mt-6 pt-4 border-t border-[#F4D03F]/10 flex justify-end gap-2">
                                            <button 
                                                onClick={() => { setEditingAddress(addr); setIsAddressModalOpen(true); }}
                                                className="w-8 h-8 rounded-lg bg-white border border-[#F4D03F]/10 flex items-center justify-center text-gray-400 hover:text-[#1A1A1A] hover:border-[#F4D03F]/30 transition-all shadow-sm"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteAddress(addr.id)}
                                                className="w-8 h-8 rounded-lg bg-white border border-red-50 flex items-center justify-center text-gray-300 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {addresses.length === 0 && (
                                <div className={cn(glass.section, "col-span-1 md:col-span-2 lg:col-span-3 py-16 text-center bg-white/40")}>
                                    <MapPin className="h-12 w-12 mx-auto text-gray-200 mb-4" />
                                    <h3 className="font-bold text-[#1A1A1A] mb-1">No Locations Saved</h3>
                                    <p className="text-sm text-gray-500 mb-6">Add a delivery address to speed up your checkout process.</p>
                                    <Button onClick={() => { setEditingAddress(null); setIsAddressModalOpen(true); }} className={glass.btnSecondary}>
                                        Add First Address
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Address Dialog - Refined to match theme */}
                        <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
                            <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden border-none shadow-premium">
                                <div className="p-8 bg-white">
                                    <DialogHeader className="mb-8">
                                        <DialogTitle className="text-3xl font-black text-[#1A1A1A] tracking-tight">
                                            {editingAddress ? 'Update' : 'Add'} <span className="text-[#F4D03F] italic">Location</span>
                                        </DialogTitle>
                                        <DialogDescription className="text-gray-500 font-medium">Specify your delivery coordinates for order fulfillment.</DialogDescription>
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
                                    }} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Label</Label>
                                            <Input name="name" required placeholder="Home / Work / Shop" className="bg-[#F9F7F2] border-[#F4D03F]/10 rounded-xl h-12 text-[13px] font-medium" defaultValue={editingAddress?.name} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Context Email</Label>
                                            <Input name="email" type="email" placeholder="shipping@beeyield.com" className="bg-[#F9F7F2] border-[#F4D03F]/10 rounded-xl h-12 text-[13px] font-medium" defaultValue={editingAddress?.email} />
                                        </div>
                                        <div className="md:col-span-2 space-y-1.5">
                                            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Street & House Number</Label>
                                            <Input name="street" required placeholder="123 Bee Street" className="bg-[#F9F7F2] border-[#F4D03F]/10 rounded-xl h-12 text-[13px] font-medium" defaultValue={editingAddress?.street} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Building/Estate</Label>
                                            <Input name="building" placeholder="Honey Heights" className="bg-[#F9F7F2] border-[#F4D03F]/10 rounded-xl h-12 text-[13px] font-medium" defaultValue={editingAddress?.building} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">City</Label>
                                            <Input name="city" required placeholder="Nairobi" className="bg-[#F9F7F2] border-[#F4D03F]/10 rounded-xl h-12 text-[13px] font-medium" defaultValue={editingAddress?.city} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">County</Label>
                                            <Input name="county" required placeholder="Nairobi" className="bg-[#F9F7F2] border-[#F4D03F]/10 rounded-xl h-12 text-[13px] font-medium" defaultValue={editingAddress?.county} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Phone Number</Label>
                                            <Input name="phone" required placeholder="+254..." className="bg-[#F9F7F2] border-[#F4D03F]/10 rounded-xl h-12 text-[13px] font-medium" defaultValue={editingAddress?.phone} />
                                        </div>
                                        <div className="md:col-span-2 flex items-center gap-2 py-2">
                                            <input type="checkbox" id="is_default" name="is_default" className="w-4 h-4 rounded border-gray-300 text-[#F4D03F] focus:ring-[#F4D03F]" defaultChecked={editingAddress?.is_default} />
                                            <Label htmlFor="is_default" className="text-[12px] font-bold text-gray-500">Set as my default shipping address</Label>
                                        </div>
                                        <div className="md:col-span-2 pt-4">
                                            <Button type="submit" className={cn(glass.btnPrimary, "w-full h-14 text-sm")}>
                                                {editingAddress ? 'Update Location' : 'Register Location'}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </motion.div>
                );
            case 'payments':
                return (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <PageHeader
                            icon={CreditCard}
                            label="Financial Security"
                            title={<>Payment <span className="text-[#F4D03F] italic">Methods</span></>}
                            subtitle="Manage your encrypted billing methods and wallet balance."
                            actions={
                                <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                                    <Button onClick={() => setIsPaymentModalOpen(true)} className={glass.btnPrimary}>
                                        <Plus className="h-4 w-4 mr-2" /> Link New Card
                                    </Button>
                                    <DialogContent className="max-w-md rounded-3xl p-8 border-none shadow-premium">
                                        <DialogHeader className="mb-6">
                                            <DialogTitle className="text-2xl font-black text-[#1A1A1A]">Secure <span className="text-[#F4D03F] italic">Enclave</span></DialogTitle>
                                            <DialogDescription className="text-gray-500 font-medium pt-1">Linking a card allows for 1-tap checkout next time.</DialogDescription>
                                        </DialogHeader>
                                        
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 p-4 bg-[#F4D03F]/5 border border-[#F4D03F]/10 rounded-2xl">
                                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-[#F4D03F]/10">
                                                    <LockIcon className="w-5 h-5 text-[#F4D03F]" />
                                                </div>
                                                <div>
                                                    <p className="text-[12px] font-bold text-[#1A1A1A]">End-to-End Encryption</p>
                                                    <p className="text-[10px] text-gray-400 font-medium">Card data never reaches our servers</p>
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
                                                        toast.success('Card linked successfully!');
                                                    } catch (error) {
                                                        toast.error('Failed to save card.');
                                                    }
                                                }}
                                                onError={(error) => toast.error('Security verification failed.')}
                                            />
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            }
                        />

                        {/* Security Banner */}
                        <div className={cn(glass.section, "p-5 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-blue-100 flex items-center gap-4")}>
                            <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-200/20">
                                <Shield className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-black text-[12px] text-blue-900 uppercase tracking-widest">Enterprise Security</p>
                                <p className="text-[11px] text-blue-700 font-medium">All payment methods are tokenized and processed via Stripe's tier-1 PCI compliance protocols.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            {paymentMethods.map((pm) => (
                                <div key={pm.id} className="relative group perspective-1000">
                                    <div className="bg-[#1A1A1A] rounded-[24px] p-8 text-white shadow-2xl overflow-hidden relative border border-white/5 h-56 flex flex-col justify-between group-hover:scale-[1.02] transition-all duration-500">
                                        {/* Abstract patterns */}
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
                                        
                                        <div className="flex justify-between items-start relative z-10">
                                            <div className="w-12 h-9 rounded-lg bg-gradient-to-br from-[#F4D03F] to-[#E5C02F] shadow-inner" />
                                            <button 
                                                onClick={() => handleDeletePaymentMethod(pm.id)}
                                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center transition-all text-white/40"
                                            >
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="relative z-10 py-6">
                                            <p className="text-2xl font-mono tracking-[4px] font-black text-white/90">
                                                •••• •••• •••• {pm.last4}
                                            </p>
                                        </div>

                                        <div className="flex justify-between items-end relative z-10">
                                            <div className="space-y-1">
                                                <p className="text-[9px] text-white/40 uppercase font-black tracking-widest leading-none">Card Holder</p>
                                                <p className="font-bold text-[13px] tracking-tight truncate max-w-[150px]">{pm.card_holder_name || (profileForm.firstName + ' ' + (profileForm.lastName || ''))}</p>
                                            </div>
                                            <div className="text-right space-y-1">
                                                <p className="text-[9px] text-white/40 uppercase font-black tracking-widest leading-none">Expires</p>
                                                <p className="font-bold text-[13px] tracking-tight tabular-nums">{String(pm.expiry_month).padStart(2, '0')}/{String(pm.expiry_year).slice(-2)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-black italic tracking-tighter text-white/30 uppercase">{pm.provider || 'VISA'}</p>
                                            </div>
                                        </div>

                                        {(pm.is_default || pm.isDefault) && (
                                            <div className="absolute top-8 left-20">
                                                <Badge className="bg-[#F4D03F] text-[#1A1A1A] font-black text-[9px] px-2 py-0.5 border-none shadow-lg tracking-wider">PRIMARY</Badge>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {paymentMethods.length === 0 && (
                                <div className={cn(glass.section, "col-span-1 md:col-span-2 py-16 text-center bg-white/40")}>
                                    <CreditCard className="h-12 w-12 mx-auto text-gray-200 mb-4" />
                                    <h3 className="font-bold text-[#1A1A1A] mb-1">No Saved Cards</h3>
                                    <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">Link a card securely to enable 1-tap checkout for your honey orders.</p>
                                    <Button onClick={() => setIsPaymentModalOpen(true)} className={glass.btnSecondary}>Add Card Securely</Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                );
            case 'suggestions':
                return (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <PageHeader
                            icon={ShoppingBag}
                            label="Discovery Hub"
                            title={<>Curated <span className="text-[#F4D03F] italic">Picks</span></>}
                            subtitle="Based on your interest in precision apiculture and sustainable honey."
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {suggestions.map((product) => (
                                <div key={product.id} className={cn(glass.section, "p-0 overflow-hidden group hover:border-[#F4D03F]/30 transition-all")}>
                                    <div className="aspect-square bg-[#F9F7F2] relative overflow-hidden flex items-center justify-center border-b border-[#F4D03F]/5">
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute top-3 left-3">
                                            <Badge className="bg-[#F4D03F] text-[#1A1A1A] font-black text-[9px] px-2 py-0 border-none rounded-lg">{product.badge || 'NEW'}</Badge>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-black text-[13px] text-[#1A1A1A] mb-1 truncate tracking-tight">{product.name}</h3>
                                        <p className="text-[10px] text-gray-500 mb-4 line-clamp-2 leading-relaxed">{product.description}</p>
                                        <div className="flex justify-between items-center pt-2">
                                            <p className="font-black text-[#1A1A1A] text-sm">KES {product.variants[0].price_kes.toLocaleString()}</p>
                                            <button 
                                                onClick={() => navigate('/shop')}
                                                className="w-8 h-8 rounded-lg bg-[#F4D03F]/10 flex items-center justify-center text-[#F4D03F] group-hover:bg-[#F4D03F] group-hover:text-white transition-all shadow-sm"
                                            >
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                );
            case 'profile':
                return (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6 max-w-3xl"
                    >
                        <PageHeader
                            icon={User}
                            label="Account Preferences"
                            title="Personal Identity"
                            subtitle="Update your contact info and security credentials."
                        />

                        <div className={cn(glass.section, "p-8 space-y-8 bg-white/40")}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">First Name</Label>
                                    <Input
                                        className="bg-white/50 border-[#F4D03F]/10 rounded-xl h-12 text-[14px] font-medium"
                                        value={profileForm.firstName}
                                        onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Last Name</Label>
                                    <Input
                                        className="bg-white/50 border-[#F4D03F]/10 rounded-xl h-12 text-[14px] font-medium"
                                        value={profileForm.lastName}
                                        onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Email Address</Label>
                                    <Input
                                        className="bg-white/50 border-[#F4D03F]/10 rounded-xl h-12 text-[14px] font-medium opacity-70 cursor-not-allowed"
                                        value={profileForm.email}
                                        disabled
                                        type="email"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Phone Number</Label>
                                    <Input
                                        className="bg-white/50 border-[#F4D03F]/10 rounded-xl h-12 text-[14px] font-medium"
                                        value={profileForm.phone}
                                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                        type="tel"
                                    />
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-[#F4D03F]/5 flex justify-end">
                                <Button onClick={updateProfile} className={cn(glass.btnPrimary, "px-10 h-14")}>
                                    Save Profile Changes
                                </Button>
                            </div>
                        </div>

                        {/* Security Section (Optional addition) */}
                        <div className={cn(glass.section, "p-8 opacity-60 pointer-events-none")}>
                            <h3 className="text-sm font-bold text-[#1A1A1A] mb-1">Security & Authentication</h3>
                            <p className="text-[12px] text-gray-500 mb-6">Manage your password and multi-factor authentication.</p>
                            <Button className={glass.btnSecondary}>Request Reset Token</Button>
                        </div>
                    </motion.div>
                );
            case 'favorites':
                return (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <PageHeader
                            icon={Heart}
                            label="Saved Collections"
                            title={<>My <span className="text-[#F4D03F] italic">Favorites</span></>}
                            subtitle="Items you've added for later consideration."
                        />

                        {wishlistItems.length === 0 ? (
                            <div className={cn(glass.section, "py-24 text-center bg-white/40")}>
                                <Heart className="w-16 h-16 mx-auto text-gray-200 mb-6" />
                                <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Favorites List Empty</h3>
                                <p className="text-gray-500 mb-8 max-w-xs mx-auto text-sm">Save items you love and they will appear here for easy access.</p>
                                <Button onClick={() => navigate('/shop')} className={glass.btnPrimary}>Start Exploring</Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {wishlistItems.map((item) => (
                                    <div key={item.id} className={cn(glass.section, "p-0 overflow-hidden group relative hover:border-[#F4D03F]/30 transition-all shadow-sm")}>
                                        <button
                                            onClick={() => removeFromWishlist(item.id)}
                                            className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm hover:bg-red-50 hover:text-red-500 transition-all border border-gray-100"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                        <div className="aspect-square bg-[#F9F7F2] relative overflow-hidden flex items-center justify-center border-b border-[#F4D03F]/5">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        </div>
                                        <div className="p-6">
                                            <h3 className="font-black text-[15px] text-[#1A1A1A] mb-1 truncate tracking-tight">{item.name}</h3>
                                            <p className="text-[11px] text-gray-500 mb-5 line-clamp-2 leading-relaxed">{item.description}</p>
                                            <div className="flex justify-between items-center pt-2">
                                                <p className="font-black text-[#1A1A1A] text-lg">KES {item.price.toLocaleString()}</p>
                                                <div className="flex gap-2">
                                                    <Button onClick={() => navigate('/shop')} className={cn(glass.btnSecondary, "h-9 text-[11px]")}>Details</Button>
                                                    <Button onClick={() => { toast.success("Added to cart!"); navigate('/shop'); }} className={cn(glass.btnPrimary, "h-9 text-[11px]")}>Buy Now</Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                );
            case 'help':
                return (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <PageHeader
                            icon={HelpCircle}
                            label="Customer Support"
                            title={<>Help <span className="text-[#F4D03F] italic">Center</span></>}
                            subtitle="Expert assistance for your apiculture commerce journey."
                        />
                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { title: 'Order Support', desc: 'Questions about delivery or returns', icon: Package },
                                { title: 'Account Issues', desc: 'Can\'t log in or change details', icon: Shield },
                                { title: 'Technical Help', desc: 'Trouble with the BeeYield platform', icon: Settings },
                            ].map((item, i) => (
                                <div key={i} className={cn(glass.section, "p-10 text-center group hover:border-[#F4D03F]/30 transition-all bg-white/40 shadow-sm")}>
                                    <div className="w-20 h-20 rounded-2xl bg-[#F4D03F]/5 mx-auto mb-8 flex items-center justify-center group-hover:bg-[#F4D03F]/10 transition-colors border border-[#F4D03F]/10">
                                        <item.icon className="w-8 h-8 text-[#F4D03F]" />
                                    </div>
                                    <h3 className="text-xl font-black text-[#1A1A1A] mb-3 tracking-tight">{item.title}</h3>
                                    <p className="text-[12px] text-gray-500 mb-8 leading-relaxed px-2">{item.desc}</p>
                                    <Button className={cn(glass.btnSecondary, "w-full py-6")}>Contact Specialist</Button>
                                </div>
                            ))}
                        </div>
                        
                        <div className={cn(glass.section, "p-10 flex flex-col md:flex-row items-center justify-between gap-8 bg-[#1A1A1A] text-white overflow-hidden relative")}>
                             <div className="absolute top-0 right-0 w-64 h-64 bg-[#F4D03F]/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-20" />
                             <div>
                                <h3 className="text-xl font-black mb-1">Direct AI Assistance</h3>
                                <p className="text-white/40 text-xs">Our Librarian agent is ready to analyze your shop queries instantly.</p>
                             </div>
                             <Button onClick={() => navigate('/assistant')} className={cn(glass.btnPrimary, "px-10 h-14 bg-[#F4D03F] text-[#1A1A1A] hover:bg-white")}>
                                Launch BeeYield AI
                             </Button>
                        </div>
                    </motion.div>
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
                        <div className={cn(glass.section, "py-32 text-center bg-white/40")}>
                            <ShoppingBag className="w-16 h-16 mx-auto text-gray-200 mb-6" />
                            <h2 className="text-2xl font-black text-[#1A1A1A]">Cart Empty</h2>
                            <p className="text-gray-500 mb-8 max-w-xs mx-auto text-sm">Add premium honey products to your cart before checking out.</p>
                            <Button onClick={() => navigate('/shop')} className={glass.btnPrimary}>Browse Products</Button>
                        </div>
                    );
                }

                return (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <PageHeader
                            icon={ShoppingBag}
                            label="Express Checkout"
                            title={<>Secure <span className="text-[#F4D03F] italic">Transaction</span></>}
                            subtitle="Review your selection and finalize your premium order."
                        />

                        {checkoutStep === 'confirmation' ? (
                            <div className={cn(glass.section, "p-16 text-center bg-white relative overflow-hidden")}>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#1B9157]/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-20" />
                                <div className="w-24 h-24 rounded-full bg-[#1B9157]/10 flex items-center justify-center mx-auto mb-8 border border-[#1B9157]/20">
                                    <CheckCircle2 className="w-10 h-10 text-[#1B9157]" />
                                </div>
                                <h1 className="text-4xl font-black mb-4 tracking-tighter text-[#1A1A1A]">Order Confirmed</h1>
                                <p className="text-gray-500 mb-10 text-lg font-medium max-w-md mx-auto leading-relaxed">Thank you for your purchase. We've initiated the refinement process for your order.</p>
                                
                                <div className="bg-[#1A1A1A] rounded-[24px] p-8 inline-block mb-12 border border-white/5 shadow-2xl relative">
                                    <p className="text-[10px] font-black text-white/40 mb-2 uppercase tracking-widest pl-1">Order Identifier</p>
                                    <p className="text-4xl font-mono font-black text-[#F4D03F] tracking-tighter">{orderNumber}</p>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button onClick={() => navigate('/shop')} className={cn(glass.btnPrimary, "px-10 h-14")}>Explore More</Button>
                                    <Button onClick={() => setActiveTab('orders')} className={cn(glass.btnSecondary, "px-10 h-14")}>Track My Assets</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-8">
                                    {/* Steps Indicator */}
                                    <div className="flex items-center gap-6 pb-2">
                                        {[
                                            { id: 'shipping', label: 'Identity & Logistics', icon: Truck },
                                            { id: 'payment', label: 'Financial Enclave', icon: ShieldCheck }
                                        ].map((step, idx) => (
                                            <button
                                                key={step.id}
                                                onClick={() => setCheckoutStep(step.id as any)}
                                                className="flex items-center gap-3 group transition-all"
                                            >
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all border",
                                                    checkoutStep === step.id 
                                                        ? "bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-lg scale-110" 
                                                        : "bg-white text-gray-400 border-gray-100 group-hover:border-[#F4D03F]/30"
                                                )}>
                                                    <step.icon className="w-5 h-5 shadow-sm" />
                                                </div>
                                                <div className="text-left">
                                                    <p className={cn("text-[9px] font-black uppercase tracking-widest leading-none mb-1", checkoutStep === step.id ? "text-[#1A1A1A]" : "text-gray-400")}>Step 0{idx+1}</p>
                                                    <p className={cn("text-[12px] font-black tracking-tight", checkoutStep === step.id ? "text-[#1A1A1A]" : "text-gray-400")}>{step.label}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    {checkoutStep === 'shipping' && (
                                        <div className={cn(glass.section, "p-10 space-y-8 bg-white/40")}>
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-sm font-black text-[#1A1A1A] uppercase tracking-widest pl-1">Shipping Protocol</h3>
                                                {addresses.length > 0 && <p className="text-[10px] font-bold text-gray-400">SELECT SAVED LOCATION</p>}
                                            </div>

                                            {addresses.length > 0 && (
                                                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
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
                                                                toast.success(`Active Location: ${addr.name}`);
                                                            }}
                                                            className={cn(
                                                                "flex-shrink-0 w-44 p-4 border-2 rounded-[20px] text-left transition-all relative group",
                                                                shippingDetails.street === addr.street ? "border-[#F4D03F] bg-[#F4D03F]/5" : "border-gray-100 bg-white/50 hover:border-[#F4D03F]/20"
                                                            )}
                                                        >
                                                            <div className="flex items-start justify-between mb-3">
                                                                <div className={cn("p-1.5 rounded-lg", shippingDetails.street === addr.street ? "bg-[#F4D03F] text-white" : "bg-gray-100 text-gray-400")}>
                                                                    <MapPin className="w-3.5 h-3.5" />
                                                                </div>
                                                                {shippingDetails.street === addr.street && <div className="w-2 h-2 rounded-full bg-[#F4D03F] animate-pulse" />}
                                                            </div>
                                                            <p className="font-black text-[13px] text-[#1A1A1A] truncate">{addr.name}</p>
                                                            <p className="text-[10px] text-gray-500 font-medium truncate">{addr.city}</p>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="md:col-span-2 space-y-2">
                                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Recipient Name</Label>
                                                    <Input
                                                        className="bg-white/50 border-[#F4D03F]/10 rounded-xl h-12 text-[14px] font-medium"
                                                        value={shippingDetails.fullName}
                                                        onChange={e => setShippingDetails({ ...shippingDetails, fullName: e.target.value })}
                                                        placeholder="Full identity of receiver"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Primary Phone</Label>
                                                    <Input
                                                        className="bg-white/50 border-[#F4D03F]/10 rounded-xl h-12 text-[14px] font-medium"
                                                        value={shippingDetails.phone}
                                                        onChange={e => setShippingDetails({ ...shippingDetails, phone: e.target.value })}
                                                        placeholder="+254..."
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Secure Email</Label>
                                                    <Input
                                                        className="bg-white/50 border-[#F4D03F]/10 rounded-xl h-12 text-[14px] font-medium"
                                                        value={shippingDetails.email}
                                                        onChange={e => setShippingDetails({ ...shippingDetails, email: e.target.value })}
                                                        placeholder="logistics@vault.com"
                                                    />
                                                </div>
                                                <div className="md:col-span-2 space-y-2">
                                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Logistics Path (Street)</Label>
                                                    <Input
                                                        className="bg-white/50 border-[#F4D03F]/10 rounded-xl h-12 text-[14px] font-medium"
                                                        value={shippingDetails.street}
                                                        onChange={e => setShippingDetails({ ...shippingDetails, street: e.target.value })}
                                                        placeholder="Exact street or road coordinate"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Base Location (City)</Label>
                                                    <Input
                                                        className="bg-white/50 border-[#F4D03F]/10 rounded-xl h-12 text-[14px] font-medium"
                                                        value={shippingDetails.city}
                                                        onChange={e => setShippingDetails({ ...shippingDetails, city: e.target.value })}
                                                        placeholder="Nairobi Central"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Region (County)</Label>
                                                    <Input
                                                        className="bg-white/50 border-[#F4D03F]/10 rounded-xl h-12 text-[14px] font-medium"
                                                        value={shippingDetails.county}
                                                        onChange={e => setShippingDetails({ ...shippingDetails, county: e.target.value })}
                                                        placeholder="Nairobi"
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="pt-6 border-t border-[#F4D03F]/5">
                                                <Button onClick={() => setCheckoutStep('payment')} className={cn(glass.btnPrimary, "w-full h-14 text-lg")}>
                                                    Initialize Payment Flow <ChevronRight className="ml-2 w-5 h-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}


                                    {checkoutStep === 'payment' && (
                                        <div className={cn(glass.section, "p-10 space-y-8 bg-white/40")}>
                                            <div className="mb-2">
                                                <h3 className="text-sm font-black text-[#1A1A1A] uppercase tracking-widest pl-1">Secure Settlement</h3>
                                            </div>
                                            
                                            <RadioGroup value={paymentMethod} onValueChange={v => setPaymentMethod(v as 'mpesa' | 'card')} className="grid gap-6">
                                                <div 
                                                    onClick={() => setPaymentMethod('mpesa')}
                                                    className={cn(
                                                        "p-8 rounded-[24px] border-2 transition-all cursor-pointer flex items-center justify-between group",
                                                        paymentMethod === 'mpesa' ? "border-[#1B9157] bg-[#1B9157]/5 shadow-lg" : "border-gray-100 bg-white/50 hover:border-gray-200"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-6">
                                                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all", paymentMethod === 'mpesa' ? "bg-[#1B9157] text-white" : "bg-gray-100 text-gray-400")}>
                                                            <Smartphone className="w-7 h-7" />
                                                        </div>
                                                        <div>
                                                            <span className="font-black text-xl text-[#1A1A1A] block">M-PESA Express</span>
                                                            <span className="text-[11px] text-gray-500 font-medium">Instant STK push notification</span>
                                                        </div>
                                                    </div>
                                                    <div className={cn("w-6 h-6 rounded-full border-4 flex items-center justify-center transition-all", paymentMethod === 'mpesa' ? "border-[#1B9157] bg-[#1B9157]" : "border-gray-200")}>
                                                        {paymentMethod === 'mpesa' && <div className="w-2 h-2 rounded-full bg-white" />}
                                                    </div>
                                                </div>

                                                <div 
                                                    onClick={() => setPaymentMethod('card')}
                                                    className={cn(
                                                        "p-8 rounded-[24px] border-2 transition-all cursor-pointer flex flex-col gap-8 group",
                                                        paymentMethod === 'card' ? "border-[#F4D03F] bg-[#F4D03F]/5 shadow-lg" : "border-gray-100 bg-white/50 hover:border-gray-200"
                                                    )}
                                                >
                                                    <div className="flex items-center justify-between w-full">
                                                        <div className="flex items-center gap-6">
                                                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all", paymentMethod === 'card' ? "bg-[#F4D03F] text-white" : "bg-gray-100 text-gray-400")}>
                                                                <CreditCard className="w-7 h-7" />
                                                            </div>
                                                            <div>
                                                                <span className="font-black text-xl text-[#1A1A1A] block">Premium Bank Card</span>
                                                                <span className="text-[11px] text-gray-500 font-medium tracking-tight">Encrypted Settlement via Stripe</span>
                                                            </div>
                                                        </div>
                                                        <div className={cn("w-6 h-6 rounded-full border-4 flex items-center justify-center transition-all", paymentMethod === 'card' ? "border-[#F4D03F] bg-[#F4D03F]" : "border-gray-200")}>
                                                            {paymentMethod === 'card' && <div className="w-2 h-2 rounded-full bg-white" />}
                                                        </div>
                                                    </div>

                                                    {paymentMethod === 'card' && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            className="pt-2 space-y-6 overflow-hidden"
                                                        >
                                                            {paymentMethods.length > 0 ? (
                                                                <div className="space-y-4">
                                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Select Vault Method</p>
                                                                    <div className="grid gap-3">
                                                                        {paymentMethods.map(pm => (
                                                                            <div
                                                                                key={pm.id}
                                                                                onClick={(e) => { e.stopPropagation(); setSelectedPaymentMethodId(pm.id); }}
                                                                                className={cn(
                                                                                    "p-5 rounded-2xl border-2 flex items-center justify-between group transition-all",
                                                                                    selectedPaymentMethodId === pm.id ? "border-[#F4D03F] bg-white shadow-premium" : "border-gray-100 bg-white/50 hover:bg-white"
                                                                                )}
                                                                            >
                                                                                <div className="flex items-center gap-4">
                                                                                    <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] text-white flex items-center justify-center font-black text-[10px] tracking-widest">{pm.provider?.slice(0, 4) || 'CARD'}</div>
                                                                                    <div>
                                                                                        <span className="font-black text-sm text-[#1A1A1A] block">•••• {pm.last4}</span>
                                                                                        <span className="text-[10px] text-gray-400 font-medium">Expires {pm.expiry_month}/{pm.expiry_year}</span>
                                                                                    </div>
                                                                                </div>
                                                                                <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", selectedPaymentMethodId === pm.id ? "border-[#F4D03F] bg-[#F4D03F]" : "border-gray-200")}>
                                                                                    {selectedPaymentMethodId === pm.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); setSelectedPaymentMethodId(null); }}
                                                                            className={cn(
                                                                                "w-full h-14 flex items-center justify-center rounded-2xl border-2 border-dashed font-black text-xs tracking-widest transition-all",
                                                                                !selectedPaymentMethodId ? "border-[#F4D03F] text-[#F4D03F] bg-[#F4D03F]/5" : "border-gray-200 text-gray-400 hover:border-[#F4D03F]/30 hover:text-[#F4D03F]"
                                                                            )}
                                                                        >
                                                                            <Plus className="w-4 h-4 mr-2" /> LINK NEW INSTRUMENT
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="p-8 bg-white/50 rounded-3xl border-2 border-dashed border-gray-100 text-center">
                                                                    <p className="text-xs font-black text-gray-400 tracking-widest">NO ASSETS DETECTED IN VAULT</p>
                                                                </div>
                                                            )}

                                                            {!selectedPaymentMethodId && (
                                                                <div className="p-8 bg-white rounded-3xl shadow-premium border border-[#F4D03F]/10">
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
                                                        </motion.div>
                                                    )}
                                                </div>
                                            </RadioGroup>
                                            
                                            <div className="pt-4">
                                                <Button onClick={processDashboardPayment} disabled={isProcessing} className={cn(glass.btnPrimary, "w-full h-16 text-xl tracking-tightest")}>
                                                    {isProcessing ? <Loader className="animate-spin mr-3 w-6 h-6" /> : `Commit Settlement: KES ${checkoutTotalWithShipping.toLocaleString()}`}
                                                </Button>
                                                <p className="text-center text-[10px] text-gray-400 font-bold mt-4 uppercase tracking-[2px]">Encrypted Financial Pipeline Active</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <div className={cn(glass.section, "p-10 bg-[#1A1A1A] text-white overflow-hidden relative")}>
                                        <div className="absolute top-0 right-0 w-48 h-48 bg-[#F4D03F]/10 rounded-full -mr-24 -mt-24 blur-3xl opacity-20" />
                                        <h3 className="font-black text-xl mb-8 tracking-tighter">Order <span className="text-[#F4D03F]">Overview</span></h3>
                                        <div className="space-y-6">
                                            {items.map(item => (
                                                <div key={item.id} className="flex justify-between items-center text-sm border-b border-white/5 pb-4 last:border-0 last:pb-0">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-black text-[13px] tracking-tight truncate max-w-[120px]">{item.name}</span>
                                                        <span className="text-[10px] text-white/40 font-bold">Qty: {item.quantity} units</span>
                                                    </div>
                                                    <span className="font-black text-white/90">KES {(item.price * item.quantity).toLocaleString()}</span>
                                                </div>
                                            ))}
                                            
                                            <div className="space-y-3 pt-6 border-t border-white/10">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-white/40 font-bold uppercase tracking-widest">Base Value</span>
                                                    <span className="font-black">KES {totalPrice.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-white/40 font-bold uppercase tracking-widest">Logistics</span>
                                                    <span className={cn("font-black", checkoutShippingCost === 0 ? "text-[#1B9157]" : "text-white/90")}>{checkoutShippingCost === 0 ? 'COMPLIMENTARY' : `KES ${checkoutShippingCost}`}</span>
                                                </div>
                                                <Separator className="bg-white/10 my-4" />
                                                <div className="flex justify-between items-end pt-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-white/40 text-[9px] font-black uppercase tracking-widest">Final Commitment</span>
                                                        <span className="text-[11px] text-[#F4D03F] font-black italic">VAT Inclusive</span>
                                                    </div>
                                                    <span className="text-3xl font-black text-white tracking-tighter leading-none">KES {checkoutTotalWithShipping.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className={cn(glass.section, "p-6 flex items-center gap-4 border-[#1B9157]/20 bg-[#1B9157]/5")}>
                                        <div className="w-10 h-10 rounded-xl bg-[#1B9157] text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#1B9157]/20">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-[#1B9157] uppercase tracking-widest leading-none mb-1">Vault Protection</p>
                                            <p className="text-[10px] font-medium text-gray-500 leading-tight">Your payment signals are encrypted with AES-256 logistics protocols.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                );
            }
            default:
                return (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={cn(glass.section, "py-32 text-center bg-white/40")}
                    >
                        <Loader2 className="w-12 h-12 animate-spin text-[#F4D03F]/30 mx-auto mb-6" />
                        <h2 className="text-2xl font-black text-[#1A1A1A]">Module in Assembly</h2>
                        <p className="text-gray-500 mt-2 text-sm max-w-xs mx-auto">This neural segment is currently being optimized for your account.</p>
                        <Button variant="link" onClick={() => setActiveTab('overview')} className="mt-8 text-[#F4D03F] font-black uppercase tracking-widest text-[10px]">Return to Identity Hub</Button>
                    </motion.div>
                );
        }
    };

    if (authLoading) {
        // Show nothing, let data load instantly
        return null;
    }

    if (!user) {
        return (
            <BeeYieldPageShell className="min-h-screen flex items-center justify-center bg-[#F9F7F2] relative overflow-hidden p-0">
                {/* Visual Architecture */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F4D03F]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#1B9157]/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(glass.section, "max-w-md w-full p-10 bg-white/80 border-[#F4D03F]/20 relative z-10 mx-4")}
                >
                    <div className="flex justify-center mb-10 relative">
                        <div className="absolute inset-0 bg-[#F4D03F]/20 blur-2xl rounded-full scale-150 animate-pulse opacity-50" />
                        <img src="/logo.png" alt="BeeYield Logo" className="w-16 h-16 relative z-10" />
                    </div>
                    
                    <div className="mb-10 text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1A1A1A] border border-white/10 mb-2">
                            <LockIcon className="w-3 h-3 text-[#F4D03F]" />
                            <span className="text-[9px] font-black text-white uppercase tracking-[2px]">Encrypted Portal</span>
                        </div>
                        <h1 className="text-4xl font-black text-[#1A1A1A] tracking-tightest leading-none">Shop <span className="text-[#F4D03F] italic">Identity</span></h1>
                        <p className="text-[13px] font-medium text-gray-500 leading-relaxed px-4">Authenticate to access your curated honey collection and logistic maps.</p>
                    </div>

                    <div className="space-y-6">
                        {authMode === 'login' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <ShopLoginForm
                                    onSuccess={() => window.location.reload()}
                                    onSwitchToRegister={() => setAuthMode('register')}
                                    onForgotPassword={() => setAuthMode('forgot-password')}
                                />
                            </motion.div>
                        )}

                        {authMode === 'register' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <ShopRegisterForm
                                    onSuccess={() => setAuthMode('login')}
                                    onSwitchToLogin={() => setAuthMode('login')}
                                />
                            </motion.div>
                        )}
                        
                        {authMode === 'forgot-password' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <ForgotPasswordForm
                                    variant="shop"
                                    onBackToLogin={() => setAuthMode('login')}
                                />
                            </motion.div>
                        )}
                    </div>

                    <div className="mt-10 pt-8 border-t border-gray-100">
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/shop')}
                            className="w-full text-gray-400 hover:text-[#1A1A1A] group font-black text-[10px] uppercase tracking-widest"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Exit to Discovery
                        </Button>
                    </div>
                </motion.div>
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
                <DialogContent className="max-w-md rounded-[32px] p-8 border-none shadow-premium bg-white overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#F4D03F]/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <DialogHeader className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                             <div className="p-2 bg-[#F4D03F]/10 rounded-xl">
                                <Truck className="w-5 h-5 text-[#F4D03F]" />
                             </div>
                             <DialogTitle className="text-2xl font-black text-[#1A1A1A]">Logistic <span className="text-[#F4D03F] italic">Telemetry</span></DialogTitle>
                        </div>
                        <DialogDescription className="text-gray-400 font-medium tracking-tight">
                            Identity: {trackingOrder?.order_number || trackingOrder?.id || 'UNIDENTIFIED'}
                        </DialogDescription>
                    </DialogHeader>
                    
                    {loadingTracking ? (
                        <div className="flex flex-col items-center justify-center py-16 space-y-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-[#F4D03F]/20 blur-xl rounded-full scale-150 animate-pulse" />
                                <Loader className="w-12 h-12 text-[#F4D03F] animate-spin relative z-10" />
                            </div>
                            <p className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-[3px]">Syncing Logistics Network</p>
                        </div>
                    ) : trackingInfo ? (
                        <div className="space-y-8 pt-2">
                            <div className="flex items-center justify-between p-6 bg-[#1A1A1A] rounded-2xl border border-white/5 shadow-premium">
                                <div>
                                    <p className="text-[9px] font-black text-white/40 uppercase tracking-[2px] mb-1">Current Protocol</p>
                                    <p className="text-xl font-black text-[#F4D03F] capitalize tracking-tighter">{trackingInfo.current_status}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-white/40 uppercase tracking-[2px] mb-1">Estimated Drift</p>
                                    <Badge className="bg-[#F4D03F] text-[#1A1A1A] border-none font-black text-[10px] px-3">{trackingInfo.estimated_delivery}</Badge>
                                </div>
                            </div>

                            <div className="relative pl-8 space-y-10 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                                {(trackingInfo.events || []).map((event: any, i: number) => (
                                    <div key={i} className="relative group">
                                        <div className={cn(
                                            "absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full border-4 border-white shadow-premium transition-all z-10",
                                            i === 0 ? 'bg-[#F4D03F] scale-125' : 'bg-gray-200'
                                        )} />
                                        <div className="space-y-1">
                                            <p className={cn("text-[11px] font-black tracking-widest uppercase mb-1", i === 0 ? 'text-[#1A1A1A]' : 'text-gray-400')}>{event.status}</p>
                                            <p className="text-[13px] text-gray-500 font-medium leading-relaxed">{event.description}</p>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-gray-300 tracking-tight pt-1">
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(event.created_at).toLocaleString()}</span>
                                                {event.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location}</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-100">
                            <Package className="w-12 h-12 mx-auto text-gray-200 mb-4" />
                            <p className="text-sm font-bold text-[#1A1A1A]">Telemetry Unavailable</p>
                            <p className="text-[11px] text-gray-400 mt-1">Satellite sync pending for this shipment.</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            </ShopDashboardLayout>
        </BeeYieldPageShell>
    );
};


export default ShopDashboard;
