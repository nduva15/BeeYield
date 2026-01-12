import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { getUserOrders } from '@/services/shopService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import {
    User, Mail, Shield, LogOut, Loader2, UserPlus, LogIn,
    Package, ShoppingBag, MapPin, Phone, Clock, CheckCircle2,
    XCircle, Truck, CreditCard, RefreshCw
} from 'lucide-react';

type AuthMode = 'login' | 'register';

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

const BuyerDashboard = () => {
    const { user, loading, signOut } = useAuth();
    const navigate = useNavigate();
    const [authMode, setAuthMode] = useState<AuthMode>('login');
    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    useEffect(() => {
        if (user?.email) {
            loadOrders();
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

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-200"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
            case 'processing':
                return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200"><RefreshCw className="w-3 h-3 mr-1" /> Processing</Badge>;
            case 'shipped':
                return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-200"><Truck className="w-3 h-3 mr-1" /> Shipped</Badge>;
            case 'completed':
                return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</Badge>;
            case 'cancelled':
                return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200"><XCircle className="w-3 h-3 mr-1" /> Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    // Show Login/Register forms when user is NOT logged in
    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 py-24">
                <div className="container max-w-lg mx-auto px-4 space-y-8">
                    {/* Header */}
                    <div className="space-y-4 text-center">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto border-2 border-primary/20">
                            <ShoppingBag className="h-10 w-10 text-primary" />
                        </div>
                        <h1 className="text-4xl font-black text-foreground tracking-tightest leading-none">
                            {authMode === 'login' ? 'Welcome Back' : 'Join BeeYield'}
                        </h1>
                        <p className="text-lg text-muted-foreground font-medium">
                            {authMode === 'login'
                                ? 'Sign in to view your orders and account'
                                : 'Create an account to track orders and more'}
                        </p>
                    </div>

                    {/* Auth Mode Selector */}
                    <Card className="border-none glass shadow-premium rounded-[2rem] overflow-hidden">
                        <CardContent className="pt-6 pb-8 px-8">
                            {/* Tab Switcher */}
                            <div className="grid grid-cols-2 gap-2 mb-8 p-1 bg-muted rounded-2xl">
                                <button
                                    type="button"
                                    onClick={() => setAuthMode('login')}
                                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${authMode === 'login'
                                        ? 'bg-primary text-primary-foreground shadow-lg'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <LogIn className="h-4 w-4" />
                                    Sign In
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAuthMode('register')}
                                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${authMode === 'register'
                                        ? 'bg-primary text-primary-foreground shadow-lg'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <UserPlus className="h-4 w-4" />
                                    Create Account
                                </button>
                            </div>

                            {/* Login Form */}
                            {authMode === 'login' && (
                                <LoginForm
                                    onSuccess={() => { }}
                                    onSwitchToRegister={() => setAuthMode('register')}
                                />
                            )}

                            {/* Register Form - default role is 'user' for buyers */}
                            {authMode === 'register' && (
                                <RegisterForm
                                    defaultRole="user"
                                    onSuccess={() => setAuthMode('login')}
                                    onSwitchToLogin={() => setAuthMode('login')}
                                />
                            )}
                        </CardContent>
                    </Card>

                    {/* Benefits */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 rounded-2xl bg-card/50 border border-border/50">
                            <span className="text-2xl">🍯</span>
                            <p className="text-xs font-bold mt-2 text-muted-foreground">Track Orders</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-card/50 border border-border/50">
                            <span className="text-2xl">⚡</span>
                            <p className="text-xs font-bold mt-2 text-muted-foreground">Fast Checkout</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-card/50 border border-border/50">
                            <span className="text-2xl">🎁</span>
                            <p className="text-xs font-bold mt-2 text-muted-foreground">Exclusive Deals</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // User is logged in - show buyer dashboard
    const userMetadata = user.user_metadata || {};
    const firstName = userMetadata.first_name || userMetadata.full_name?.split(' ')[0] || '';
    const lastName = userMetadata.last_name || userMetadata.full_name?.split(' ').slice(1).join(' ') || '';
    const fullName = firstName && lastName ? `${firstName} ${lastName}` : firstName || 'Customer';

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 py-24">
            <div className="container max-w-5xl mx-auto px-4 space-y-10">
                {/* Header */}
                <div className="space-y-4 text-center lg:text-left">
                    <h1 className="text-5xl font-black text-foreground tracking-tightest leading-none">
                        My <span className="text-primary italic">Account</span>
                    </h1>
                    <p className="text-xl text-muted-foreground font-medium">View your orders and manage your profile.</p>
                </div>

                {/* Main Tabs */}
                <Tabs defaultValue="orders" className="space-y-8">
                    <TabsList className="bg-muted/40 p-1.5 rounded-full backdrop-blur border inline-flex h-auto gap-2">
                        <TabsTrigger value="orders" className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow transition-all font-bold text-xs uppercase tracking-widest flex gap-2">
                            <Package className="h-4 w-4" /> My Orders
                        </TabsTrigger>
                        <TabsTrigger value="profile" className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow transition-all font-bold text-xs uppercase tracking-widest flex gap-2">
                            <User className="h-4 w-4" /> Profile
                        </TabsTrigger>
                    </TabsList>

                    {/* Orders Tab */}
                    <TabsContent value="orders" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-black tracking-tight">Order History</h2>
                            <Button onClick={loadOrders} variant="outline" size="sm" className="rounded-full" disabled={ordersLoading}>
                                <RefreshCw className={`h-4 w-4 mr-2 ${ordersLoading ? 'animate-spin' : ''}`} /> Refresh
                            </Button>
                        </div>

                        {ordersLoading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : orders.length === 0 ? (
                            <Card className="border-none glass rounded-3xl overflow-hidden">
                                <CardContent className="py-16 text-center">
                                    <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/30 mb-6" />
                                    <h3 className="text-2xl font-black mb-2">No Orders Yet</h3>
                                    <p className="text-muted-foreground mb-6">Start shopping to see your orders here!</p>
                                    <Button onClick={() => navigate('/shop')} className="rounded-full px-8 shadow-glow">
                                        Browse Shop
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <Card key={order.id} className="border-none glass rounded-3xl overflow-hidden hover:shadow-xl transition-all">
                                        <CardContent className="p-6">
                                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-black text-xl text-primary">
                                                            {order.order_number || `BY-${order.id.slice(0, 8).toUpperCase()}`}
                                                        </span>
                                                        {getStatusBadge(order.status)}
                                                    </div>
                                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-4 w-4" />
                                                            {new Date(order.created_at).toLocaleDateString()}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <CreditCard className="h-4 w-4" />
                                                            {order.payment_method?.toUpperCase() || 'N/A'}
                                                        </span>
                                                        {order.shipping_address?.city && (
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="h-4 w-4" />
                                                                {order.shipping_address.city}, {order.shipping_address.county}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total</p>
                                                    <p className="text-3xl font-black italic text-primary">
                                                        KES {order.total_amount?.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Profile Tab */}
                    <TabsContent value="profile" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {/* Profile Card */}
                        <Card className="border-none glass shadow-premium rounded-[3rem] overflow-hidden">
                            <CardHeader className="p-10 pb-0">
                                <CardTitle className="text-2xl font-black tracking-widest uppercase flex items-center gap-3">
                                    <User className="h-6 w-6 text-primary" />
                                    Profile
                                </CardTitle>
                                <CardDescription className="text-muted-foreground font-medium">Your account information</CardDescription>
                            </CardHeader>
                            <CardContent className="p-10 space-y-8">
                                <div className="flex flex-col sm:flex-row items-center gap-8">
                                    <div className="w-24 h-24 rounded-[2rem] bg-primary/10 flex items-center justify-center border-2 border-primary/20 p-1 shadow-glow shadow-primary/20">
                                        {userMetadata.avatar_url ? (
                                            <img
                                                src={userMetadata.avatar_url}
                                                alt={fullName}
                                                className="w-full h-full rounded-[1.8rem] object-cover"
                                            />
                                        ) : (
                                            <span className="text-4xl font-black text-primary">
                                                {fullName.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-center sm:text-left space-y-2">
                                        <p className="font-black text-3xl tracking-tight leading-none">{fullName}</p>
                                        <p className="text-lg text-muted-foreground font-semibold flex items-center justify-center sm:justify-start gap-3">
                                            <Mail className="h-5 w-5 text-primary" />
                                            {user.email}
                                        </p>
                                    </div>
                                </div>

                                <Separator className="bg-border/50" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 bg-white/40 dark:bg-card/40 rounded-3xl border border-border/50 space-y-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Account ID</span>
                                        <p className="font-mono text-sm text-foreground overflow-hidden text-ellipsis">{user.id}</p>
                                    </div>
                                    <div className="p-6 bg-white/40 dark:bg-card/40 rounded-3xl border border-border/50 space-y-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Account Type</span>
                                        <p className="font-black text-lg text-foreground uppercase tracking-widest">
                                            {userMetadata.role === 'admin' || userMetadata.role === 'super_admin' ? 'Admin' : 'Customer'}
                                        </p>
                                    </div>
                                    <div className="p-6 bg-white/40 dark:bg-card/40 rounded-3xl border border-border/50 space-y-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</span>
                                        <p className={`font-black text-lg uppercase tracking-widest ${user.email_confirmed_at ? 'text-nature-green' : 'text-honey-dark'}`}>
                                            {user.email_confirmed_at ? 'Verified' : 'Unverified'}
                                        </p>
                                    </div>
                                    <div className="p-6 bg-white/40 dark:bg-card/40 rounded-3xl border border-border/50 space-y-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Member Since</span>
                                        <p className="font-black text-lg text-foreground">{new Date(user.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Sign Out */}
                        <Card className="border-none glass shadow-premium rounded-[3rem] overflow-hidden">
                            <CardContent className="p-10">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                    <div className="text-center sm:text-left">
                                        <p className="text-2xl font-black tracking-tightest">Session Management</p>
                                        <p className="text-base text-muted-foreground font-medium">
                                            Safely end your current session.
                                        </p>
                                    </div>
                                    <Button
                                        size="lg"
                                        variant="destructive"
                                        className="h-14 px-10 font-black rounded-2xl shadow-glow shadow-destructive/20 active:scale-95 transition-all"
                                        onClick={handleSignOut}
                                    >
                                        <LogOut className="mr-3 h-6 w-6" />
                                        Sign Out
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default BuyerDashboard;
