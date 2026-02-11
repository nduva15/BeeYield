import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import {
    ArrowLeft,
    Lock,
    User,
    UserPlus,
    LogIn,
    Shield,
    CheckCircle2,
    ShoppingBag,
    ArrowRight,
    Hexagon
} from 'lucide-react';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import Logo from '@/assets/Logo.png';

type AuthMode = 'login' | 'register' | 'forgot-password';

const Authentication: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading: authLoading } = useAuth();
    const { items } = useCart();
    const [authMode, setAuthMode] = useState<AuthMode>('login');

    // Parse mode from URL if possible (e.g. /login?mode=register)
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const mode = params.get('mode') as AuthMode;
        if (mode && ['login', 'register', 'forgot-password'].includes(mode)) {
            setAuthMode(mode);
        }
    }, [location]);

    // Redirect if already logged in
    useEffect(() => {
        if (user && !authLoading) {
            const params = new URLSearchParams(location.search);
            const redirect = params.get('redirect');

            if (redirect === 'checkout') {
                navigate('/buyer-dashboard?tab=checkout');
            } else if (items.length > 0) {
                // Default fallback if they have items but no explicit redirect
                navigate('/buyer-dashboard?tab=checkout');
            } else {
                navigate('/buyer-dashboard');
            }
        }
    }, [user, authLoading, items, navigate, location.search]);

    const steps = [
        { id: 'identification', label: 'Identification', icon: User, active: true },
        { id: 'payment', label: 'Payment', icon: Shield, active: false },
        { id: 'confirmation', label: 'Confirmation', icon: CheckCircle2, active: false },
    ];

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
            {/* Header - Matching Checkout Aesthetic */}
            <div className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => navigate('/shop')}
                            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-bold"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span className="hidden sm:inline">Back to Shop</span>
                        </button>

                        <div className="flex items-center gap-2">
                            <img src={Logo} alt="Logo" className="h-8 w-8" />
                            <h1 className="text-2xl font-black font-heading tracking-tight">BeeYield</h1>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                            <Lock className="h-4 w-4 text-primary" />
                            <span className="hidden sm:inline">Secure Connection</span>
                        </div>
                    </div>

                    {/* Progress Steps - Progress bar like e-commerce */}
                    <div className="flex items-center justify-between max-w-md mx-auto relative pt-2">
                        {steps.map((step, index) => {
                            const StepIcon = step.icon;
                            return (
                                <React.Fragment key={step.id}>
                                    <div className="flex flex-col items-center relative z-10">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${step.active
                                                ? 'bg-primary text-white ring-4 ring-primary/20 shadow-glow'
                                                : 'bg-muted text-muted-foreground'
                                                }`}
                                        >
                                            <StepIcon className="h-5 w-5" />
                                        </div>
                                        <span
                                            className={`text-xs font-black uppercase tracking-widest mt-2 ${step.active ? 'text-primary' : 'text-muted-foreground'
                                                }`}
                                        >
                                            {step.label}
                                        </span>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className="flex-1 h-0.5 mx-2 bg-muted relative -top-3">
                                            <div className={`h-full bg-primary transition-all duration-500 ${step.active ? 'w-1/2' : 'w-0'}`} />
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                    {/* Left Column: Benefits & Trust */}
                    <div className="lg:col-span-12 xl:col-span-5 space-y-8 order-2 lg:order-1 mt-8 lg:mt-0">
                        <div className="space-y-4">
                            <h2 className="text-4xl lg:text-5xl font-black tracking-tightest leading-tight">
                                One Account. <br />
                                <span className="text-primary">Unlimited</span> Access.
                            </h2>
                            <p className="text-xl text-muted-foreground font-medium leading-relaxed">
                                Join the world's most advanced pollination network. Get data-driven insights, secure harvests, and premium honey.
                            </p>
                        </div>

                        <div className="grid gap-4">
                            {[
                                { title: 'Seamless Checkout', desc: 'Securely store addresses and payment methods for 1-click buying.', icon: ShoppingBag },
                                { title: 'Honey Traceability', desc: 'Verify the origin and purity of every jar you purchase.', icon: CheckCircle2 },
                                { title: 'IoT Hive Monitoring', desc: 'Access real-time data from your smart hives anywhere.', icon: Hexagon },
                                { title: 'Buyer Protection', desc: 'Every transaction is encrypted and monitored for your safety.', icon: Shield }
                            ].map((benefit, i) => (
                                <div key={i} className="flex gap-4 p-6 rounded-3xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all group">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        <benefit.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">{benefit.title}</h4>
                                        <p className="text-base text-muted-foreground font-medium">{benefit.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: The Auth Dashboard Card */}
                    <div className="lg:col-span-12 xl:col-span-7 order-1 lg:order-2">
                        <Card className="border-none glass shadow-premium rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between border-b border-border/10 bg-muted/20">
                                <div>
                                    <CardTitle className="text-2xl font-black font-heading flex items-center gap-2">
                                        <LogIn className="h-6 w-6 text-primary" />
                                        {authMode === 'login' ? 'Welcome Back' : authMode === 'register' ? 'Create Account' : 'Reset Password'}
                                    </CardTitle>
                                    <p className="text-base font-medium text-muted-foreground mt-1">
                                        {authMode === 'login' ? 'Please enter your details to continue' : 'Join BeeYield today'}
                                    </p>
                                </div>
                                <div className="flex gap-1 p-1 bg-background/50 rounded-xl border border-border/50">
                                    <button
                                        onClick={() => setAuthMode('login')}
                                        className={`px-4 py-2 rounded-lg text-sm font-black uppercase tracking-tighter transition-all ${authMode === 'login' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}
                                    >
                                        Log In
                                    </button>
                                    <button
                                        onClick={() => setAuthMode('register')}
                                        className={`px-4 py-2 rounded-lg text-sm font-black uppercase tracking-tighter transition-all ${authMode === 'register' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}
                                    >
                                        Sign Up
                                    </button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 lg:p-12">
                                <div className="max-w-md mx-auto w-full">
                                    {authMode === 'login' && (
                                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <LoginForm
                                                variant="shop"
                                                onSuccess={() => {
                                                    toast.success("Identity Verified");
                                                    // Redirection handled by useEffect
                                                }}
                                                onSwitchToRegister={() => setAuthMode('register')}
                                                onForgotPassword={() => setAuthMode('forgot-password')}
                                            />
                                        </div>
                                    )}

                                    {authMode === 'register' && (
                                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <RegisterForm
                                                onSuccess={() => {
                                                    toast.success("Account Created Successfully");
                                                    setAuthMode('login');
                                                }}
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

                                    {/* Footer Message */}
                                    <div className="mt-12 pt-8 border-t border-border/50 text-center space-y-4">
                                        <p className="text-xs text-muted-foreground font-medium flex items-center justify-center gap-2">
                                            <Shield className="h-3 w-3" /> All data is encrypted with AES-256 standard
                                        </p>

                                        {items.length > 0 && (
                                            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex items-center justify-between group cursor-pointer" onClick={() => navigate('/buyer-dashboard?tab=checkout')}>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                        <ShoppingBag className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <p className="text-xs font-bold text-left">
                                                        Finish your order <br />
                                                        <span className="text-[10px] text-muted-foreground">{items.length} items waiting in cart</span>
                                                    </p>
                                                </div>
                                                <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Simple Footer */}
            <div className="container mx-auto px-4 py-8 border-t border-border/10 mt-12">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-muted-foreground text-xs font-medium">
                    <p>© 2026 BeeYield Professional Pollination. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-primary transition-colors">Support</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Authentication;
