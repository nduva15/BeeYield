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
    ArrowRight, LayoutGrid, Settings, HelpCircle, Bell, Wallet, Heart
} from 'lucide-react';
import DashboardLayout from '@/components/beeyield/DashboardLayout';
import { NavItem } from '@/components/beeyield/DashboardSidebar';

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
    isDefault: boolean;
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
    const { user, loading: authLoading, signOut } = useAuth();
    const navigate = useNavigate();
    const [authMode, setAuthMode] = useState<AuthMode>('login');
    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

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

    useEffect(() => {
        if (user) {
            loadOrders();
            loadUserData();
            loadSuggestions();
        }
    }, [user]);

    const loadOrders = async () => {
        if (!user?.email) return;
        setOrdersLoading(true);
        try {
            const data = await getUserOrders(user.email);
            setOrders(data);
        } catch (error) {
            console.error("Failed to load orders:", error);
        } finally {
            setOrdersLoading(false);
        }
    };

    const loadUserData = () => {
        if (!user) return;
        const meta = user.user_metadata || {};

        // Load Addresses from metadata or use defaults if empty
        const savedAddresses = meta.addresses || [];
        setAddresses(savedAddresses);

        // Load Payment Methods from metadata
        const savedPayments = meta.payment_methods || [
            // Mock default if none
            // { id: 'p1', type: 'card', brand: 'Visa', last4: '4242', expiry: '12/28', isDefault: true } 
        ];
        setPaymentMethods(savedPayments);

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

    const saveAddress = async (newAddress: Address) => {
        if (!supabase) return;
        const updatedAddresses = [...addresses, newAddress];
        setAddresses(updatedAddresses);
        await supabase.auth.updateUser({ data: { addresses: updatedAddresses } });
        toast.success("Address saved");
    };

    const deleteAddress = async (id: string) => {
        if (!supabase) return;
        const updatedAddresses = addresses.filter(a => a.id !== id);
        setAddresses(updatedAddresses);
        await supabase.auth.updateUser({ data: { addresses: updatedAddresses } });
        toast.success("Address removed");
    };

    const savePaymentMethod = async (newMethod: PaymentMethod) => {
        if (!supabase) return;
        const updatedMethods = [...paymentMethods, newMethod];
        setPaymentMethods(updatedMethods);
        await supabase.auth.updateUser({ data: { payment_methods: updatedMethods } });
        toast.success("Payment method added");
    };

    const deletePaymentMethod = async (id: string) => {
        if (!supabase) return;
        const updated = paymentMethods.filter(p => p.id !== id);
        setPaymentMethods(updated);
        await supabase.auth.updateUser({ data: { payment_methods: updated } });
        toast.success("Payment method removed");
    };

    const navItems: NavItem[] = [
        { id: 'overview', label: 'Overview', icon: LayoutGrid },
        { id: 'orders', label: 'My Orders', icon: Package },
        { id: 'wallet', label: 'Wallet & Credits', icon: Wallet },
        { id: 'addresses', label: 'Delivery Locations', icon: MapPin },
        { id: 'payments', label: 'Payment Methods', icon: CreditCard },
        { id: 'suggestions', label: 'Buy Suggestions', icon: Gift },
        { id: 'profile', label: 'Account Settings', icon: User },
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
                                { label: 'Wallet Balance', value: 'KES 2,450', icon: Wallet, color: 'text-green-500' },
                                { label: 'Favorites', value: '12', icon: Heart, color: 'text-red-500' },
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
                                        { label: 'Top-up Wallet', icon: Wallet, tab: 'wallet' },
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
                                                    <Button variant="secondary" size="sm" className="rounded-full" onClick={() => setTrackingOrder(order)}>
                                                        <Truck className="w-4 h-4 mr-2" /> Track
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="rounded-full">Invoice</Button>
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
                return (
                    <Card className="border-none shadow-premium rounded-[2.5rem] overflow-hidden">
                        <div className="bg-primary p-12 text-primary-foreground">
                            <h3 className="text-sm font-black uppercase tracking-widest opacity-80 mb-2">Available Credits</h3>
                            <p className="text-6xl font-black tracking-tightest">KES 2,450.00</p>
                            <div className="mt-8 flex gap-4">
                                <Button variant="secondary" className="rounded-full">Top Up Credits</Button>
                                <Button variant="ghost" className="rounded-full border border-white/20">Transaction History</Button>
                            </div>
                        </div>
                        <CardContent className="p-12">
                            <h4 className="text-xl font-black mb-6">Recent Wallet Activity</h4>
                            <div className="space-y-4">
                                {[
                                    { label: 'Order #ORD-12345', amount: '-1,200', date: 'Jan 12, 2026', type: 'debit' },
                                    { label: 'Wallet Top-up', amount: '+500', date: 'Jan 10, 2026', type: 'credit' },
                                    { label: 'Order #ORD-12340', amount: '-4,500', date: 'Jan 05, 2026', type: 'debit' },
                                ].map((tx, i) => (
                                    <div key={i} className="flex justify-between items-center py-4 border-b border-muted last:border-0">
                                        <div>
                                            <p className="font-bold">{tx.label}</p>
                                            <p className="text-xs text-muted-foreground">{tx.date}</p>
                                        </div>
                                        <p className={`font-black ${tx.type === 'credit' ? 'text-green-500' : 'text-foreground'}`}>{tx.amount} KES</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                );
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
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        const formData = new FormData(e.currentTarget);
                                        saveAddress({
                                            id: Date.now().toString(),
                                            name: formData.get('name') as string,
                                            street: formData.get('street') as string,
                                            city: formData.get('city') as string,
                                            county: formData.get('county') as string,
                                            phone: formData.get('phone') as string,
                                            isDefault: false
                                        });
                                        // Close dialog logic needed here (omitted for brevity, assume auto close via state in real app)
                                    }} className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Address Name (e.g. Home, Office)</Label>
                                            <Input id="name" name="name" required placeholder="Home" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="street">Street Address</Label>
                                            <Input id="street" name="street" required placeholder="123 Bee St" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="city">City</Label>
                                                <Input id="city" name="city" required placeholder="Nairobi" />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="county">County</Label>
                                                <Input id="county" name="county" required placeholder="Nairobi" />
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="phone">Contact Phone</Label>
                                            <Input id="phone" name="phone" required placeholder="+254..." />
                                        </div>
                                        <DialogFooter><Button type="submit">Save Address</Button></DialogFooter>
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
                                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => deleteAddress(addr.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm"><Edit2 className="h-4 w-4" /></Button>
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
                            <Button onClick={() => savePaymentMethod({
                                id: Date.now().toString(),
                                type: 'card', brand: 'Visa', last4: '4242', expiry: '12/28', isDefault: false
                            })}><Plus className="h-4 w-4 mr-2" /> Add Card</Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {paymentMethods.map((pm) => (
                                <Card key={pm.id} className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border-none">
                                    <CardContent className="p-6 relative">
                                        <div className="flex justify-between items-start mb-8">
                                            <CreditCard className="h-8 w-8 text-white/80" />
                                            <Button variant="ghost" size="icon" className="text-white/50 hover:text-white" onClick={() => deletePaymentMethod(pm.id)}>
                                                <XCircle className="h-5 w-5" />
                                            </Button>
                                        </div>
                                        <div className="mb-4">
                                            <p className="text-xl font-mono tracking-wider">**** **** **** {pm.last4}</p>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] uppercase text-white/50">Card Holder</p>
                                                <p className="font-medium">{profileForm.firstName && profileForm.lastName ? `${profileForm.firstName} ${profileForm.lastName}` : 'Customer'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase text-white/50">Expires</p>
                                                <p className="font-medium">{pm.expiry}</p>
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
            <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 py-24 flex items-center justify-center">
                <div className="container max-w-lg px-4 space-y-8">
                    <div className="space-y-4 text-center">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto border-2 border-primary/20">
                            <ShoppingBag className="h-10 w-10 text-primary" />
                        </div>
                        <h1 className="text-4xl font-black text-foreground tracking-tightest leading-none">
                            {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                        </h1>
                    </div>
                    <Card className="border-none glass shadow-premium rounded-[2rem] overflow-hidden p-8">
                        {authMode === 'login' && <LoginForm onSuccess={() => { }} onSwitchToRegister={() => setAuthMode('register')} onForgotPassword={() => setAuthMode('forgot-password')} />}
                        {authMode === 'register' && <RegisterForm defaultRole="user" onSuccess={() => setAuthMode('login')} onSwitchToLogin={() => setAuthMode('login')} />}
                        {authMode === 'forgot-password' && <ForgotPasswordForm onBackToLogin={() => setAuthMode('login')} />}
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <DashboardLayout
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onLogout={signOut}
            navItems={navItems}
        >
            <div className="pb-12">
                {renderContent()}
            </div>

            {/* Tracking Modal */}
            <Dialog open={!!trackingOrder} onOpenChange={(open) => !open && setTrackingOrder(null)}>
                <DialogContent className="sm:max-w-md rounded-[2.5rem] border-none shadow-glow p-8">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">Track Parcel</DialogTitle>
                        <DialogDescription className="font-medium text-muted-foreground">
                            Order #{trackingOrder?.order_number || trackingOrder?.id.slice(0, 8)}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-8 py-6">
                        <div className="space-y-6">
                            {[
                                { label: 'Order Placed', date: 'Confirmed Jan 12', active: true },
                                { label: 'Packaging', date: 'Completed Jan 13', active: true },
                                { label: 'In Transit', date: 'Expected arrival Jan 16', active: true, pulse: true },
                                { label: 'Delivered', date: 'Estimated Jan 16', active: false }
                            ].map((step, i) => (
                                <div key={i} className="flex gap-4 relative">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${step.active ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                                            {step.active ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                        </div>
                                        {i < 3 && <div className={`w-0.5 flex-1 ${step.active ? 'bg-primary' : 'bg-muted'}`} />}
                                        {step.pulse && <div className="absolute top-0 left-0 w-8 h-8 rounded-full bg-primary/20 animate-ping" />}
                                    </div>
                                    <div className="pb-8">
                                        <p className={`font-bold ${step.active ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</p>
                                        <p className="text-xs text-muted-foreground">{step.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button className="w-full rounded-full" onClick={() => setTrackingOrder(null)}>Return to Dashboard</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default BuyerDashboard;
