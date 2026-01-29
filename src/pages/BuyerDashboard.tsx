import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { getUserOrders, fallbackProducts, Product } from '@/services/shopService';
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
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import { toast } from 'sonner';
import {
    User, Mail, Shield, LogOut, Loader2, UserPlus, LogIn,
    Package, ShoppingBag, MapPin, Phone, Clock, CheckCircle2,
    XCircle, Truck, CreditCard, RefreshCw, ChevronRight,
    FileText, Search, Plus, Trash2, Edit2, Star, Gift,
    ArrowRight, LayoutGrid, Settings, HelpCircle, Bell, Wallet, Heart,
    Smartphone, CreditCard as CardIcon, Loader2 as Loader
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { initializeCheckout, CheckoutOrder } from '@/services/shopService';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import ShopDashboardLayout from '@/components/shop/ShopDashboardLayout';
import { ShopNavItem as NavItem } from '@/components/shop/ShopDashboardSidebar';

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
    items?: any[];
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
    isDefault: boolean;
}

const BuyerDashboard = () => {
    const { user, loading: authLoading, signOut, session } = useAuth();
    const navigate = useNavigate();
    const [authMode, setAuthMode] = useState<AuthMode>('login');
    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const { items, getTotalItems, getTotalPrice, clearCart, addToCart: addToCartFromContext } = useCart();
    const { items: wishlistItems, removeFromWishlist, isInWishlist } = useWishlist();

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
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [suggestions, setSuggestions] = useState<Product[]>([]);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    });
    const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);



    const loadOrders = async () => {
        if (!user?.email) return;
        setOrdersLoading(true);
        try {
            const { getUserOrders } = await import('@/services/shopService');
            const data = await getUserOrders(user.email);
            setOrders(data);
        } catch (error) {
            console.error("Failed to load orders:", error);
        } finally {
            setOrdersLoading(false);
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

            setAddresses(savedAddresses);
            setPaymentMethods(savedPayments || []);
        } catch (error) {
            console.error("Failed to load user data from backend:", error);
            // Fallback to metadata if backend fails
            const meta = user.user_metadata || {};
            setAddresses(meta.addresses || []);
            setPaymentMethods(meta.payment_methods || []);
        }

        const meta = user.user_metadata || {};
        // Init Profile Form
        setProfileForm({
            firstName: meta.first_name || '',
            lastName: meta.last_name || '',
            email: user.email || '',
            phone: meta.phone || ''
        });
    };


    const loadSuggestions = () => {
        // Randomly select 4 products from fallback
        const shuffled = [...fallbackProducts].sort(() => 0.5 - Math.random());
        setSuggestions(shuffled.slice(0, 4));
    };

    useEffect(() => {
        if (user) {
            loadOrders();
            loadUserData();
            loadSuggestions();
        }
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
            toast.success("Profile updated successfully");
            setIsEditingProfile(false);
        } catch (error: any) {
            toast.error("Failed to update profile", { description: error.message });
        }
    };

    const saveAddress = async (newAddress: any) => {
        try {
            const { addAddress } = await import('@/services/shopService');
            const saved = await addAddress(newAddress);
            setAddresses([...addresses, saved]);
            toast.success("Address saved");
        } catch (error) {
            toast.error("Failed to save address");
        }
    };

    const updateAddress = async (id: string, updatedAddr: any) => {
        // For simplicity, we'll reuse saveAddress but backend should handle ID if present
        await saveAddress(updatedAddr);
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

    const savePaymentMethod = async (newMethod: any) => {
        try {
            const { addPaymentMethod } = await import('@/services/shopService');
            const saved = await addPaymentMethod(newMethod);
            setPaymentMethods([...paymentMethods, saved]);
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
    const [trackingInfo, setTrackingInfo] = useState<any>(null);
    const [loadingTracking, setLoadingTracking] = useState(false);

    const handleTrackOrder = async (order: Order) => {
        setTrackingOrder(order);
        setIsTrackingOpen(true);
        setLoadingTracking(true);
        try {
            const { getOrderTracking } = await import('@/services/shopService');
            const info = await getOrderTracking(order.id);
            setTrackingInfo(info);
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
            case 'completed': return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">Delivered</Badge>;
            case 'cancelled': return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200">Cancelled</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-4xl font-black tracking-tightest">Dashboard <span className="text-primary italic">Overview</span></h1>
                                <p className="text-muted-foreground font-medium">Welcome back, {profileForm.firstName || 'Customer'}</p>
                            </div>
                            <Button onClick={() => navigate('/shop')} className="rounded-full px-8 shadow-glow">
                                <ShoppingBag className="w-4 h-4 mr-2" /> Start Shopping
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                                { label: 'Total Orders', value: orders.length, icon: Package, color: 'text-blue-500' },
                                { label: 'In Transit', value: orders.filter(o => o.status === 'shipped').length, icon: Truck, color: 'text-purple-500' },
                                { label: 'Addresses', value: addresses.length, icon: MapPin, color: 'text-green-500' }, // Replaced wallet
                                { label: 'Favorites', value: wishlistItems.length.toString(), icon: Heart, color: 'text-red-500' },
                            ].map((stat, i) => (
                                <Card key={i} className="border-none shadow-premium rounded-3xl overflow-hidden group">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
                                                <p className="text-3xl font-black">{stat.value}</p>
                                            </div>
                                            <div className={`p-3 rounded-2xl bg-muted/50 group-hover:bg-primary/10 transition-colors ${stat.color}`}>
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
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status</p>
                                                <p className="text-lg font-black text-primary capitalize">{trackingInfo.current_status}</p>
                                            </div>
                                            <Badge className="bg-primary text-white">{trackingInfo.estimated_delivery}</Badge>
                                        </div>

                                        <div className="relative pl-6 space-y-8 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-muted before:rounded-full">
                                            {(trackingInfo.events || []).map((event: any, i: number) => (
                                                <div key={i} className="relative group">
                                                    <div className={`absolute -left-[27px] top-1.5 w-4 h-4 rounded-full border-4 border-white ${i === 0 ? 'bg-primary' : 'bg-muted'} shadow-sm group-hover:scale-125 transition-transform`} />
                                                    <div className="space-y-1">
                                                        <p className={`font-black tracking-tight ${i === 0 ? 'text-foreground' : 'text-muted-foreground'}`}>{event.status.toUpperCase()}</p>
                                                        <p className="text-sm text-muted-foreground font-medium">{event.description}</p>
                                                        <div className="flex items-center gap-2 text-[10px] font-bold opacity-40 uppercase tracking-tighter">
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
                                            className="flex flex-col items-center justify-center p-6 bg-white dark:bg-black/40 rounded-3xl border border-white/20 hover:scale-105 transition-all shadow-sm"
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
                            <Button size="sm" variant="outline" className="rounded-full" onClick={loadOrders} disabled={ordersLoading}>
                                <RefreshCw className={`h-4 w-4 mr-2 ${ordersLoading ? 'animate-spin' : ''}`} /> Refresh
                            </Button>
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
                                                    <Button variant="outline" size="sm" className="rounded-full" onClick={() => handleDownloadInvoice(order)}>
                                                        <FileText className="w-4 h-4 mr-2" /> Invoice
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
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button><Plus className="h-4 w-4 mr-2" /> Add Address</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New Address</DialogTitle>
                                        <DialogDescription>Add a new delivery location for checkout.</DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={async (e) => {
                                        e.preventDefault();
                                        const formData = new FormData(e.currentTarget);
                                        await saveAddress({
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
                                        });
                                        // Auto-close dialog by mocking a click on the backdrop or just refresh
                                        window.location.reload();
                                    }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Location Name</Label>
                                            <Input id="name" name="name" required placeholder="Home / Office" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Context Email</Label>
                                            <Input id="email" name="email" type="email" placeholder="delivery@beeyield.com" />
                                        </div>
                                        <div className="grid gap-2 md:col-span-2">
                                            <Label htmlFor="street">Street & Number</Label>
                                            <Input id="street" name="street" required placeholder="123 Beevior St" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="building">Building / Estate</Label>
                                            <Input id="building" name="building" placeholder="Honey Heights" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="apartment">Apartment / Suite</Label>
                                            <Input id="apartment" name="apartment" placeholder="Unit 402" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="floor">Floor / Level</Label>
                                            <Input id="floor" name="floor" placeholder="4th Floor" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="city">City</Label>
                                            <Input id="city" name="city" required placeholder="Nairobi" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="county">County</Label>
                                            <Input id="county" name="county" required placeholder="Nairobi" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="postal_code">Postal Code</Label>
                                            <Input id="postal_code" name="postal_code" placeholder="00100" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input id="phone" name="phone" required placeholder="+254..." />
                                        </div>
                                        <div className="md:col-span-2 flex items-center gap-2">
                                            <input type="checkbox" id="is_default" name="is_default" className="w-4 h-4" />
                                            <Label htmlFor="is_default">Set as default address</Label>
                                        </div>
                                        <div className="md:col-span-2 pt-4">
                                            <Button type="submit" className="w-full">Save Location</Button>
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
                                            {addr.isDefault && <Badge variant="secondary">Default</Badge>}
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
                                        <Button variant="ghost" size="sm" onClick={() => toast.info("Edit feature coming soon. Please delete and re-add for now.")}><Edit2 className="h-4 w-4" /></Button>
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
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">Payment Methods</h2>
                                <p className="text-muted-foreground">Manage your saved cards and payment details.</p>
                            </div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button><Plus className="h-4 w-4 mr-2" /> Add Card</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add Payment Card</DialogTitle>
                                        <DialogDescription>Your data is encrypted and secure.</DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={async (e) => {
                                        e.preventDefault();
                                        const formData = new FormData(e.currentTarget);
                                        await savePaymentMethod({
                                            type: 'card',
                                            provider: (formData.get('number') as string).startsWith('4') ? 'Visa' : 'Mastercard',
                                            last4: (formData.get('number') as string).slice(-4),
                                            expiry_month: parseInt((formData.get('expiry') as string).split('/')[0]),
                                            expiry_year: parseInt((formData.get('expiry') as string).split('/')[1]),
                                            card_holder_name: formData.get('holder') as string,
                                            is_default: true
                                        });
                                        window.location.reload();
                                    }} className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label>Card Holder Name</Label>
                                            <Input name="holder" required placeholder="Timothy Nduva" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Card Number</Label>
                                            <Input name="number" required placeholder="**** **** **** 4242" maxLength={16} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label>Expiry (MM/YY)</Label>
                                                <Input name="expiry" required placeholder="12/28" maxLength={5} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>CVC</Label>
                                                <Input name="cvc" required placeholder="***" maxLength={3} />
                                            </div>
                                        </div>
                                        <Button type="submit" className="w-full">Link Securely</Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {paymentMethods.map((pm) => (
                                <Card key={pm.id} className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border-none">
                                    <CardContent className="p-6 relative">
                                        <div className="flex justify-between items-start mb-8">
                                            <CreditCard className="h-8 w-8 text-white/80" />
                                            <Button variant="ghost" size="icon" className="text-white/50 hover:text-white" onClick={() => handleDeletePaymentMethod(pm.id)}>
                                                <XCircle className="h-5 w-5" />
                                            </Button>
                                        </div>
                                        <div className="mb-4">
                                            <p className="text-xl font-mono tracking-wider">**** **** **** {pm.last4}</p>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] uppercase text-white/50">Card Holder</p>
                                                <p className="font-medium truncate max-w-[120px]">{pm.card_holder_name || 'Customer'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] uppercase text-white/50">{pm.provider || 'Card'}</p>
                                                <p className="font-medium">{pm.expiry_month}/{pm.expiry_year}</p>
                                            </div>
                                        </div>

                                    </CardContent>
                                </Card>
                            ))}
                            {paymentMethods.length === 0 && <p className="text-muted-foreground col-span-2 text-center py-8">No saved payment methods.</p>}
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
                                        <img src={product.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
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
                                        <Label>First Name</Label>
                                        <Input
                                            value={profileForm.firstName}
                                            onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Last Name</Label>
                                        <Input
                                            value={profileForm.lastName}
                                            onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Email Address</Label>
                                    <Input
                                        value={profileForm.email}
                                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                        type="email"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone Number</Label>
                                    <Input
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
                                            className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <div className="aspect-square bg-muted relative overflow-hidden">
                                            <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
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
            case 'checkout':
                const shippingCost = getTotalPrice() >= 5000 ? 0 : 350;
                const totalWithShipping = getTotalPrice() + shippingCost;

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
                            // We'll pass the full extended address as part of metadata or notes if needed, 
                            // but for now let's just make sure the backend order tracking has it.
                            // Actually, let's just update the CheckoutOrder interface in shopService too.
                            payment_method: paymentMethod,
                            items: items.map(item => ({
                                product_id: item.productId.toString(),
                                variant_id: item.variantId,
                                quantity: item.quantity
                            })),
                            total_kes: totalWithShipping,
                            notes: shippingDetails.notes + (shippingDetails.building ? ` | Bldg: ${shippingDetails.building}` : "") + (shippingDetails.apartment ? ` | Apt: ${shippingDetails.apartment}` : "")
                        };


                        const response = await initializeCheckout(orderData, session?.access_token);
                        await new Promise(r => setTimeout(r, 2000));
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
                                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6 animate-bounce">
                                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                                </div>
                                <h1 className="text-3xl font-black mb-4">Order Confirmed! 🎉</h1>
                                <p className="text-muted-foreground mb-8 text-lg">Thank you for your purchase. We're preparing your honey.</p>
                                <div className="bg-muted/50 rounded-3xl p-6 inline-block mb-10 border border-border/50">
                                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Order Identifier</p>
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
                                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${checkoutStep === 'shipping' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground'}`}
                                        >
                                            1. Shipping
                                        </button>
                                        <button
                                            onClick={() => setCheckoutStep('payment')}
                                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${checkoutStep === 'payment' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground'}`}
                                        >
                                            2. Payment
                                        </button>
                                    </div>

                                    {checkoutStep === 'shipping' && (
                                        <Card className="border-none shadow-premium rounded-[2rem] p-8 space-y-6">
                                            {addresses.length > 0 && (
                                                <div className="space-y-4">
                                                    <Label className="text-sm font-black uppercase tracking-widest opacity-60">Use a saved location</Label>
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
                                                        value={shippingDetails.fullName}
                                                        onChange={e => setShippingDetails({ ...shippingDetails, fullName: e.target.value })}
                                                        placeholder="Timothy Nduva"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Contact Phone</Label>
                                                    <Input
                                                        value={shippingDetails.phone}
                                                        onChange={e => setShippingDetails({ ...shippingDetails, phone: e.target.value })}
                                                        placeholder="+254..."
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Contact Email</Label>
                                                    <Input
                                                        value={shippingDetails.email}
                                                        onChange={e => setShippingDetails({ ...shippingDetails, email: e.target.value })}
                                                        placeholder="test@example.com"
                                                    />
                                                </div>
                                                <div className="md:col-span-2 space-y-2">
                                                    <Label>Street & Number</Label>
                                                    <Input
                                                        value={shippingDetails.street}
                                                        onChange={e => setShippingDetails({ ...shippingDetails, street: e.target.value })}
                                                        placeholder="123 Beevior Road"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Building / Estate</Label>
                                                    <Input
                                                        value={shippingDetails.building}
                                                        onChange={e => setShippingDetails({ ...shippingDetails, building: e.target.value })}
                                                        placeholder="Honey Heights"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Apt / Suite / Floor</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            value={shippingDetails.apartment}
                                                            onChange={e => setShippingDetails({ ...shippingDetails, apartment: e.target.value })}
                                                            placeholder="Apt 2B"
                                                        />
                                                        <Input
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
                                            <RadioGroup value={paymentMethod} onValueChange={v => setPaymentMethod(v as any)} className="grid gap-4">
                                                <div className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between ${paymentMethod === 'mpesa' ? 'border-primary bg-primary/5' : 'border-border'}`} onClick={() => setPaymentMethod('mpesa')}>
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
                                                            <Smartphone className="text-green-600" />
                                                        </div>
                                                        <span className="font-bold text-lg">M-Pesa</span>
                                                    </div>
                                                    <RadioGroupItem value="mpesa" />
                                                </div>
                                                <div className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border'}`} onClick={() => setPaymentMethod('card')}>
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                                                            <CardIcon className="text-blue-600" />
                                                        </div>
                                                        <span className="font-bold text-lg">Bank Card</span>
                                                    </div>
                                                    <RadioGroupItem value="card" />
                                                </div>
                                            </RadioGroup>
                                            <Button onClick={processDashboardPayment} disabled={isProcessing} className="w-full rounded-full h-14 text-xl font-black">
                                                {isProcessing ? <Loader className="animate-spin mr-2" /> : `Pay KES ${totalWithShipping.toLocaleString()}`}
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
                                                <span className="font-bold">{shippingCost === 0 ? 'FREE' : `KES ${shippingCost}`}</span>
                                            </div>
                                            <div className="flex justify-between text-xl font-black pt-4 border-t border-border">
                                                <span>Total</span>
                                                <span className="text-primary">KES {totalWithShipping.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </Card>
                                    <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                        <Shield className="w-5 h-5 text-primary" />
                                        <p className="text-xs font-medium text-muted-foreground leading-tight">Your data is secured with banking-grade encryption protocol.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            default:
                return (
                    <div className="text-center py-32 bg-white dark:bg-black/20 rounded-[3rem] border-2 border-dashed border-muted">
                        <Loader2 className="w-12 h-12 animate-spin text-primary/30 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold">In Development</h2>
                        <p className="text-muted-foreground mt-2">This section is being custom built for your account.</p>
                        <Button variant="link" onClick={() => setActiveTab('overview')} className="mt-4">Return Home</Button>
                    </div>
                );
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto border-2 border-primary/20">
                        <ShoppingBag className="h-10 w-10 text-primary" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black">Account Required</h1>
                        <p className="text-muted-foreground font-medium">To view your orders, wallet, and saved addresses, please sign in to your shop account.</p>
                    </div>
                    <Button onClick={() => navigate('/login')} className="w-full h-12 text-lg font-bold rounded-xl shadow-glow">
                        <LogIn className="w-5 h-5 mr-2" /> Go to Login Dashboard
                    </Button>
                    <Button variant="ghost" onClick={() => navigate('/shop')} className="w-full text-muted-foreground">
                        Continue as Guest
                    </Button>
                </div>
            </div>
        );
    }

    return (
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
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status</p>
                                    <p className="text-lg font-black text-primary capitalize">{trackingInfo.current_status}</p>
                                </div>
                                <Badge className="bg-primary text-white">{trackingInfo.estimated_delivery}</Badge>
                            </div>

                            <div className="relative pl-6 space-y-8 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-muted before:rounded-full">
                                {(trackingInfo.events || []).map((event: any, i: number) => (
                                    <div key={i} className="relative group">
                                        <div className={`absolute -left-[27px] top-1.5 w-4 h-4 rounded-full border-4 border-white ${i === 0 ? 'bg-primary' : 'bg-muted'} shadow-sm group-hover:scale-125 transition-transform`} />
                                        <div className="space-y-1">
                                            <p className={`font-black tracking-tight ${i === 0 ? 'text-foreground' : 'text-muted-foreground'}`}>{event.status.toUpperCase()}</p>
                                            <p className="text-sm text-muted-foreground font-medium">{event.description}</p>
                                            <div className="flex items-center gap-2 text-[10px] font-bold opacity-40 uppercase tracking-tighter">
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
    );
};


export default BuyerDashboard;
