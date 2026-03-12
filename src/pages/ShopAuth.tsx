import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const mode = params.get('mode') as AuthMode;
        if (mode && ['login', 'register', 'forgot-password'].includes(mode)) {
            setAuthMode(mode);
        }
    }, [location]);

    useEffect(() => {
        if (user && !authLoading) {
            const params = new URLSearchParams(location.search);
            const redirect = params.get('redirect');

            if (redirect === 'checkout') {
                navigate('/shop-dashboard?tab=checkout');
            } else if (items.length > 0) {
                navigate('/shop-dashboard?tab=checkout');
            } else {
                navigate('/shop-dashboard');
            }
        }
    }, [user, authLoading, items, navigate, location.search]);

    if (authLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-4 border-honey/10 border-t-honey animate-spin" />
                    </div>
                    <span className="text-honey font-bold text-sm tracking-widest uppercase">Opening Shop...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFCF9] text-gray-900 selection:bg-honey/20 font-sans relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-honey/5 rounded-full blur-[120px] -mr-96 -mt-96 opacity-60" />
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-beeyield-green/5 rounded-full blur-[120px] -ml-96 -mb-96 opacity-60" />

            <div className="container mx-auto px-6 min-h-screen flex flex-col relative z-10">
                <header className="py-10 flex items-center justify-between">
                    <Link to="/shop" className="flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-gray-100 group-hover:border-honey/30 group-hover:shadow-honey/10 transition-all duration-500">
                            <ShoppingBag className="h-6 w-6 text-beeyield-green" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black tracking-tight text-gray-900 leading-none">
                                Bee<span className="text-honey">Yield</span>
                            </span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1.5 ml-0.5">Honey Shop</span>
                        </div>
                    </Link>

                    <Link
                        to="/shop"
                        className="flex items-center gap-2.5 text-sm font-bold text-gray-400 hover:text-gray-900 transition-all group"
                    >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        <span>Return to Shop</span>
                    </Link>
                </header>

                <main className="flex-1 flex flex-col items-center justify-center py-16">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="max-w-md w-full"
                    >
                        <div className="text-center mb-12 space-y-4">
                            <h2 className="text-4xl font-black tracking-tight text-gray-900 leading-tight">
                                {authMode === 'login' ? 'Welcome Back' : authMode === 'register' ? 'Join the Hive' : 'Reset Password'}
                            </h2>
                            <p className="text-gray-500 font-medium text-lg max-w-[85%] mx-auto leading-relaxed">
                                {authMode === 'login' 
                                    ? 'Log in to manage your orders, track shipments, and update your profile.' 
                                    : authMode === 'register' 
                                    ? 'Create an account for faster checkout and exclusive honey offers.' 
                                    : 'Please enter your email to receive a password recovery link.'}
                            </p>
                        </div>

                        <Card className="border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] bg-white/80 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden">
                            <CardContent className="p-10">
                                <div className="space-y-8">
                                    {authMode === 'login' && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                                            <ShopLoginForm
                                                onSuccess={() => {}} // Hook handles redirection
                                                onSwitchToRegister={() => setAuthMode('register')}
                                                onForgotPassword={() => setAuthMode('forgot-password')}
                                            />
                                        </motion.div>
                                    )}

                                    {authMode === 'register' && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                                            <ShopRegisterForm
                                                onSuccess={() => setAuthMode('login')}
                                                onSwitchToLogin={() => setAuthMode('login')}
                                            />
                                        </motion.div>
                                    )}

                                    {authMode === 'forgot-password' && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                                            <ShopForgotPasswordForm
                                                onBackToLogin={() => setAuthMode('login')}
                                            />
                                        </motion.div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="mt-12 text-center space-y-8">
                            <div className="flex items-center justify-center gap-10 opacity-20 grayscale hover:grayscale-0 transition-all duration-700">
                                <Shield className="h-6 w-6" />
                                <Lock className="h-6 w-6" />
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            
                            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl">
                                <div className="w-2 h-2 rounded-full bg-beeyield-green animate-pulse" />
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                                    256-bit Secure Shopping
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </main>

                <footer className="py-12 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col gap-1 items-center md:items-start text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <p>© 2026 BeeYield Honey Shop. All rights reserved.</p>
                        <p className="opacity-60">Pure Honey, Securely Delivered</p>
                    </div>
                    <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest">
                        <a href="#" className="text-gray-400 hover:text-honey transition-colors">Privacy</a>
                        <a href="#" className="text-gray-400 hover:text-honey transition-colors">Terms</a>
                        <a href="#" className="text-gray-400 hover:text-honey transition-colors">Safety</a>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default ShopAuth;
