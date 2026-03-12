import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
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
import ShopLoginForm from '@/components/auth/shop/ShopLoginForm';
import ShopRegisterForm from '@/components/auth/shop/ShopRegisterForm';
import ShopForgotPasswordForm from '@/components/auth/shop/ShopForgotPasswordForm';
import Logo from '@/assets/Logo.png';

type AuthMode = 'login' | 'register' | 'forgot-password';

const ShopAuth: React.FC = () => {
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
                navigate('/shop-dashboard?tab=checkout');
            } else if (items.length > 0) {
                // Default fallback if they have items but no explicit redirect
                navigate('/shop-dashboard?tab=checkout');
            } else {
                navigate('/shop-dashboard');
            }
        }
    }, [user, authLoading, items, navigate, location.search]);

    const steps = [
        { id: 'identification', label: 'Login', icon: User, active: true },
        { id: 'payment', label: 'Payment', icon: Shield, active: false },
        { id: 'confirmation', label: 'Confirmation', icon: CheckCircle2, active: false },
    ];

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-beeyield-cream">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-beeyield-gold"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-beeyield-cream via-white to-beeyield-gold/10 font-sans">
            {/* Header - Matching Checkout Aesthetic */}
            <div className="bg-white/80 backdrop-blur-md border-b border-beeyield-gold/20 sticky top-0 z-10 shadow-soft">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => navigate('/shop')}
                            className="flex items-center gap-2 text-beeyield-green/70 hover:text-beeyield-gold transition-colors font-bold group"
                        >
                            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                            <span className="hidden sm:inline uppercase tracking-wider text-xs">Back to Shop</span>
                        </button>

                        <div className="flex items-center gap-2 animate-float">
                            <img src={Logo} alt="BeeYield Logo" className="h-10 w-10 drop-shadow-sm" />
                            <h1 className="text-2xl font-black font-heading tracking-tight text-beeyield-black hidden sm:block">BeeYield</h1>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-beeyield-green font-bold">
                            <Lock className="h-4 w-4 text-beeyield-gold" />
                            <span className="hidden sm:inline uppercase tracking-wider text-[10px]">Secure</span>
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-between max-w-md mx-auto relative pt-2">
                        {steps.map((step, index) => {
                            const StepIcon = step.icon;
                            return (
                                <React.Fragment key={step.id}>
                                    <div className="flex flex-col items-center relative z-10">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${step.active
                                                ? 'bg-gradient-to-br from-beeyield-gold to-beeyield-orange text-gray-900 shadow-glow scale-110'
                                                : 'bg-beeyield-cream text-beeyield-green/40 border border-beeyield-gold/20'
                                                }`}
                                        >
                                            <StepIcon className="h-5 w-5" />
                                        </div>
                                        <span
                                            className={`text-[10px] font-black uppercase tracking-widest mt-2 ${step.active ? 'text-beeyield-orange' : 'text-beeyield-green/40'
                                                }`}
                                        >
                                            {step.label}
                                        </span>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className="flex-1 h-0.5 mx-2 bg-beeyield-gold/10 relative -top-3">
                                            <div className={`h-full bg-gradient-to-r from-beeyield-gold to-beeyield-orange transition-all duration-500 ${step.active ? 'w-1/2' : 'w-0'}`} />
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
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="space-y-4"
                        >
                            <h2 className="text-4xl lg:text-5xl font-black tracking-tightest leading-tight text-beeyield-green">
                                Shop <span className="text-beeyield-gold">Checkout.</span> <br />
                                Secure Access.
                            </h2>
                            <p className="text-xl text-beeyield-green/70 font-medium leading-relaxed">
                                Login to see your orders, track shipments, and manage your honey subscription.
                            </p>
                        </motion.div>

                        <div className="grid gap-4">
                            {[
                                { title: 'Fast Checkout', desc: 'Securely save addresses and payment methods for 1-click buying.', icon: ShoppingBag, color: 'text-beeyield-orange' },
                                { title: 'Trackable', desc: 'Check the origin and purity of every bottle you buy.', icon: CheckCircle2, color: 'text-beeyield-green' },
                                { title: 'Order History', desc: 'Track your deliveries and re-order your favorites instantly.', icon: Hexagon, color: 'text-beeyield-gold' },
                                { title: 'Buyer Protection', desc: 'Every payment is safe and monitored for your safety.', icon: Shield, color: 'text-beeyield-green' }
                            ].map((benefit, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + (i * 0.1) }}
                                    whileHover={{ scale: 1.02, x: 5 }}
                                    className="flex gap-4 p-6 rounded-3xl bg-white border border-beeyield-gold/20 hover:border-beeyield-orange/50 hover:shadow-soft transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-beeyield-cream flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                                        <benefit.icon className={`h-6 w-6 ${benefit.color}`} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-beeyield-green">{benefit.title}</h4>
                                        <p className="text-sm text-beeyield-green/60 font-medium leading-relaxed">{benefit.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: The Auth Dashboard Card */}
                    <div className="lg:col-span-12 xl:col-span-7 order-1 lg:order-2">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <Card className="border-2 border-beeyield-gold/10 bg-white/80 backdrop-blur-xl shadow-premium rounded-[2.5rem] overflow-hidden hover:shadow-glow transition-shadow duration-500">
                                <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between border-b border-beeyield-gold/10 bg-beeyield-cream/30">
                                    <div>
                                        <CardTitle className="text-2xl font-black font-heading flex items-center gap-2 text-beeyield-green">
                                            <LogIn className="h-6 w-6 text-beeyield-gold" />
                                            {authMode === 'login' ? 'Log In' : authMode === 'register' ? 'Sign Up' : 'Reset Password'}
                                        </CardTitle>
                                        <p className="text-sm font-bold text-beeyield-green/50 mt-1 uppercase tracking-wider">
                                            {authMode === 'login' ? 'Please enter your account details' : 'Create your buyer account today'}
                                        </p>
                                    </div>
                                    <div className="flex gap-1 p-1 bg-white rounded-xl border border-beeyield-gold/20 shadow-sm">
                                        <button
                                            onClick={() => setAuthMode('login')}
                                            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-tighter transition-all ${authMode === 'login' ? 'bg-beeyield-green text-gray-900 shadow-md' : 'text-beeyield-green/40 hover:bg-beeyield-cream'}`}
                                        >
                                            Log In
                                        </button>
                                        <button
                                            onClick={() => setAuthMode('register')}
                                            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-tighter transition-all ${authMode === 'register' ? 'bg-beeyield-gold text-beeyield-black shadow-md' : 'text-beeyield-green/40 hover:bg-beeyield-cream'}`}
                                        >
                                            Sign Up
                                        </button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 lg:p-12">
                                    <div className="max-w-md mx-auto w-full">
                                        {authMode === 'login' && (
                                            <div className="animate-fade-in-up">
                                                <ShopLoginForm
                                                    onSuccess={() => {
                                                        toast.success("Logged In");
                                                        // Redirection handled by useEffect
                                                    }}
                                                    onSwitchToRegister={() => setAuthMode('register')}
                                                    onForgotPassword={() => setAuthMode('forgot-password')}
                                                />
                                            </div>
                                        )}

                                        {authMode === 'register' && (
                                            <div className="animate-fade-in-up">
                                                <ShopRegisterForm
                                                    onSuccess={() => {
                                                        toast.success("Account Created Successfully");
                                                        setAuthMode('login');
                                                    }}
                                                    onSwitchToLogin={() => setAuthMode('login')}
                                                />
                                            </div>
                                        )}

                                        {authMode === 'forgot-password' && (
                                            <div className="animate-fade-in-up">
                                                <ShopForgotPasswordForm
                                                    onBackToLogin={() => setAuthMode('login')}
                                                />
                                            </div>
                                        )}

                                        {/* Footer Message */}
                                        <div className="mt-12 pt-8 border-t border-beeyield-gold/10 text-center space-y-4">
                                            <p className="text-xs text-beeyield-green/40 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                                <Shield className="h-3 w-3" /> Secure Encryption
                                            </p>

                                            {items.length > 0 && (
                                                <motion.div
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="bg-beeyield-gold/10 p-4 rounded-2xl border border-beeyield-gold/20 flex items-center justify-between group cursor-pointer hover:bg-beeyield-gold/20 transition-colors"
                                                    onClick={() => navigate('/shop-dashboard?tab=checkout')}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-beeyield-orange">
                                                            <ShoppingBag className="h-4 w-4" />
                                                        </div>
                                                        <p className="text-xs font-bold text-left text-beeyield-green">
                                                            Finish your order <br />
                                                            <span className="text-[10px] text-beeyield-green/60 uppercase tracking-wide">{items.length} items waiting</span>
                                                        </p>
                                                    </div>
                                                    <ArrowRight className="h-4 w-4 text-beeyield-green group-hover:translate-x-1 transition-transform" />
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Simple Footer */}
            <div className="container mx-auto px-4 py-8 border-t border-beeyield-gold/10 mt-12 bg-white/50 backdrop-blur-sm">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-beeyield-green/50 text-[10px] font-black uppercase tracking-widest">
                    <p>© 2026 BeeYield Honey Shop. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-beeyield-gold transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-beeyield-gold transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-beeyield-gold transition-colors">Support</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShopAuth;
