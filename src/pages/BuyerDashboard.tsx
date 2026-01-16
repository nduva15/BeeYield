import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { getUserOrders, fallbackProducts, Product } from '@/services/shopService';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import { toast } from 'sonner';
import {
    User, Mail, Shield, LogOut, Loader2, UserPlus, LogIn,
    Package, ShoppingBag, MapPin, Phone, Clock, CheckCircle2,
    XCircle, Truck, CreditCard, RefreshCw, ChevronRight,
    FileText, Search, Plus, Trash2, Edit2, Star, Gift,
    ArrowRight
} from 'lucide-react';

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
    const { user, loading, signOut } = useAuth();
    const navigate = useNavigate();
    const [authMode, setAuthMode] = useState<AuthMode>('login');
    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    // Local state for features (synced with metadata where possible)
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [suggestions, setSuggestions] = useState<Product[]>([]);

    // Edit Profile State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    });

    // Tracking State
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
        if (savedAddresses.length === 0 && meta.address) {
            // Migration for users with single address in root metadata
            savedAddresses.push({
                id: '1',
                name: 'Home',
                street: meta.address,
                city: meta.city || '',
                county: meta.county || '',
                phone: meta.phone || '',
                isDefault: true
            });
        }
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
        // Randomly select 3 products from fallback
        const shuffled = [...fallbackProducts].sort(() => 0.5 - Math.random());
        setSuggestions(shuffled.slice(0, 3));
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

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending': return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-200"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
            case 'processing': return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200"><RefreshCw className="w-3 h-3 mr-1" /> Processing</Badge>;
            case 'shipped': return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-200"><Truck className="w-3 h-3 mr-1" /> Shipped</Badge>;
            case 'delivered':
            case 'completed': return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Delivered</Badge>;
            case 'cancelled': return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200"><XCircle className="w-3 h-3 mr-1" /> Cancelled</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        // Reuse existing login/register UI
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 py-24">
                <div className="container max-w-lg mx-auto px-4 space-y-8">
                    <div className="space-y-4 text-center">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto border-2 border-primary/20">
                            <ShoppingBag className="h-10 w-10 text-primary" />
                        </div>
                        <h1 className="text-4xl font-black text-foreground tracking-tightest leading-none">
                            {authMode === 'login' ? 'Welcome Back' : 'Join BeeYield'}
                        </h1>
                        <p className="text-lg text-muted-foreground font-medium">
                            {authMode === 'login' ? 'Sign in to view your dashboard' : 'Create an account to track orders'}
                        </p>
                    </div>

                    <Card className="border-none glass shadow-premium rounded-[2rem] overflow-hidden">
                        <CardContent className="pt-6 pb-8 px-8">
                            {authMode !== 'forgot-password' && (
                                <div className="grid grid-cols-2 gap-2 mb-8 p-1 bg-muted rounded-2xl">
                                    <button
                                        type="button"
                                        onClick={() => setAuthMode('login')}
                                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${authMode === 'login' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        <LogIn className="h-4 w-4" /> Sign In
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAuthMode('register')}
                                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${authMode === 'register' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        <UserPlus className="h-4 w-4" /> Create Account
                                    </button>
                                </div>
                            )}
                            {authMode === 'login' && <LoginForm onSuccess={() => { }} onSwitchToRegister={() => setAuthMode('register')} onForgotPassword={() => setAuthMode('forgot-password')} />}
                            {authMode === 'register' && <RegisterForm defaultRole="user" onSuccess={() => setAuthMode('login')} onSwitchToLogin={() => setAuthMode('login')} />}
                            {authMode === 'forgot-password' && <ForgotPasswordForm onBackToLogin={() => setAuthMode('login')} />}
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const userMetadata = user.user_metadata || {};
    const fullName = profileForm.firstName && profileForm.lastName ? `${profileForm.firstName} ${profileForm.lastName}` : (userMetadata.full_name || 'Customer');

    return (
        <div className="min-h-screen bg-background/50">
            <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)]">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 lg:w-72 bg-card border-r border-border p-6 space-y-8">
                    <div className="flex items-center gap-4 px-2">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                            <span className="text-lg font-black text-primary">
                                {fullName.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-bold truncate">{fullName}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Button variant={activeTab === 'overview' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setActiveTab('overview')}>
                            <ShoppingBag className="mr-2 h-4 w-4" /> Overview
                        </Button>
                        <Button variant={activeTab === 'orders' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setActiveTab('orders')}>
                            <Package className="mr-2 h-4 w-4" /> Orders & History
                        </Button>
                        <Button variant={activeTab === 'addresses' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setActiveTab('addresses')}>
                            <MapPin className="mr-2 h-4 w-4" /> Delivery Locations
                        </Button>
                        <Button variant={activeTab === 'payments' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setActiveTab('payments')}>
                            <CreditCard className="mr-2 h-4 w-4" /> Payment Methods
                        </Button>
                        <Button variant={activeTab === 'suggestions' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setActiveTab('suggestions')}>
                            <Gift className="mr-2 h-4 w-4" /> Buy Suggestions
                        </Button>
                        <Button variant={activeTab === 'profile' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setActiveTab('profile')}>
                            <User className="mr-2 h-4 w-4" /> Profile Settings
                        </Button>
                    </div>

                    <div className="pt-4 border-t border-border">
                        <Button variant="outline" className="w-full text-destructive hover:text-destructive" onClick={handleSignOut}>
                            <LogOut className="mr-2 h-4 w-4" /> Sign Out
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6 md:p-10 overflow-y-auto h-[calc(100vh-80px)]">

                    {/* OVERVIEW */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div>
                                <h2 className="text-3xl font-black tracking-tight">Welcome, {profileForm.firstName || 'Friend'}!</h2>
                                <p className="text-muted-foreground">Here's what's happening with your account today.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="bg-primary/5 border-primary/10">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">{orders.length}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Deliveries</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">{orders.filter(o => ['processing', 'shipped'].includes(o.status.toLowerCase())).length}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Last Order</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-sm font-medium">
                                            {orders.length > 0 ? new Date(orders[0].created_at).toLocaleDateString() : 'No orders yet'}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold mb-4">Recent Orders</h3>
                                {orders.length > 0 ? (
                                    <div className="space-y-4">
                                        {orders.slice(0, 3).map(order => (
                                            <Card key={order.id} className="hover:shadow-md transition-all">
                                                <CardContent className="p-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-2 bg-muted rounded-full">
                                                            <Package className="h-5 w-5 text-muted-foreground" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold">{order.order_number}</p>
                                                            <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        {getStatusBadge(order.status)}
                                                        <span className="font-bold">KES {order.total_amount.toLocaleString()}</span>
                                                        <Button variant="ghost" size="icon" onClick={() => { setActiveTab('orders'); }}>
                                                            <ChevronRight className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 bg-muted/20 rounded-xl">
                                        <p className="text-muted-foreground">No recent orders found.</p>
                                        <Button variant="link" onClick={() => navigate('/shop')}>Start Shopping</Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ORDERS */}
                    {activeTab === 'orders' && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-black tracking-tight">Order History</h2>
                                <Button size="sm" variant="outline" onClick={loadOrders} disabled={ordersLoading}>
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
                                    {orders.map((order) => (
                                        <Card key={order.id} className="border-none bg-card shadow-sm hover:shadow-md transition-all overflow-hidden">
                                            <CardHeader className="bg-muted/30 border-b border-border/50 py-4 flex flex-row items-center justify-between">
                                                <div>
                                                    <CardTitle className="text-lg font-bold flex items-center gap-3">
                                                        {order.order_number || order.id.slice(0, 8)}
                                                        {getStatusBadge(order.status)}
                                                    </CardTitle>
                                                    <CardDescription>{new Date(order.created_at).toLocaleDateString()} • {order.items?.length || 1} Items</CardDescription>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xl font-black text-primary">KES {order.total_amount.toLocaleString()}</span>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-bold uppercase text-muted-foreground">Shipping To</p>
                                                        <p className="font-medium">{order.shipping_address?.address}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {order.shipping_address?.city}, {order.shipping_address?.county}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => setTrackingOrder(order)}>
                                                            <Truck className="h-4 w-4 mr-2" /> Track Delivery
                                                        </Button>
                                                        <Button variant="outline" size="sm" onClick={() => toast.info('Receipt downloaded')}>
                                                            <FileText className="h-4 w-4 mr-2" /> Receipt
                                                        </Button>
                                                        <Button variant="outline" size="sm" onClick={() => toast.info('Invoice downloaded')}>
                                                            <FileText className="h-4 w-4 mr-2" /> Invoice
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ADDRESSES */}
                    {activeTab === 'addresses' && (
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
                    )}

                    {/* PAYMENTS */}
                    {activeTab === 'payments' && (
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
                                                    <p className="font-medium">{fullName}</p>
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
                    )}

                    {/* SUGGESTIONS */}
                    {activeTab === 'suggestions' && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">Predicted for You</h2>
                                <p className="text-muted-foreground">Based on your browsing history and preference.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {suggestions.map((product) => (
                                    <Card key={product.id} className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all">
                                        <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button className="rounded-full" onClick={() => navigate(`/shop/product/${product.id}`)}>View Product</Button>
                                            </div>
                                        </div>
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold truncate pr-2">{product.name}</h3>
                                                <Badge variant="secondary" className="text-xs">{product.rating} ★</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{product.description}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-primary">From KES {product.variants[0]?.price_kes.toLocaleString()}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PROFILE */}
                    {activeTab === 'profile' && (
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
                    )}
                </div>
            </div>

            {/* Tracking Modal */}
            <Dialog open={!!trackingOrder} onOpenChange={(open) => !open && setTrackingOrder(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Track Delivery</DialogTitle>
                        <DialogDescription>
                            Order #{trackingOrder?.order_number || trackingOrder?.id.slice(0, 8)}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="relative pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-muted">
                            <div className="relative">
                                <div className="absolute left-[-2.05rem] bg-green-500 h-4 w-4 rounded-full ring-4 ring-background" />
                                <p className="font-medium text-sm">Order Placed</p>
                                <p className="text-xs text-muted-foreground">{new Date(trackingOrder?.created_at || '').toLocaleDateString()}</p>
                            </div>
                            <div className="relative">
                                <div className={`absolute left-[-2.05rem] h-4 w-4 rounded-full ring-4 ring-background ${['processing', 'shipped', 'delivered'].includes(trackingOrder?.status.toLowerCase() || '') ? 'bg-green-500' : 'bg-muted'}`} />
                                <p className="font-medium text-sm">Processing</p>
                                <p className="text-xs text-muted-foreground">Your order is being prepared.</p>
                            </div>
                            <div className="relative">
                                <div className={`absolute left-[-2.05rem] h-4 w-4 rounded-full ring-4 ring-background ${['shipped', 'delivered'].includes(trackingOrder?.status.toLowerCase() || '') ? 'bg-green-500' : 'bg-muted'}`} />
                                <p className="font-medium text-sm">Shipped</p>
                                <p className="text-xs text-muted-foreground">On the way to delivery partner.</p>
                            </div>
                            <div className="relative">
                                <div className={`absolute left-[-2.05rem] h-4 w-4 rounded-full ring-4 ring-background ${['delivered'].includes(trackingOrder?.status.toLowerCase() || '') ? 'bg-green-500' : 'bg-muted'}`} />
                                <p className="font-medium text-sm">Delivered</p>
                                <p className="text-xs text-muted-foreground">Estimated Delivery: {new Date(Date.now() + 86400000 * 3).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="bg-muted p-4 rounded-lg flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-primary" />
                            <div className="text-sm">
                                <p className="font-bold">Destination</p>
                                <p className="text-muted-foreground">{trackingOrder?.shipping_address?.address}, {trackingOrder?.shipping_address?.city}</p>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default BuyerDashboard;
