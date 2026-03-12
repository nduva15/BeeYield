import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
    Shield,
    Lock,
    Cpu,
    Hexagon,
    ChevronRight,
    ArrowLeft,
    Terminal,
    Database,
    Activity,
    Bot,
    Sprout,
    LineChart,
    Layers
} from 'lucide-react';
import BeeYieldLoginForm from '@/components/auth/beeyield/BeeYieldLoginForm';
import BeeYieldRegisterForm from '@/components/auth/beeyield/BeeYieldRegisterForm';
import BeeYieldForgotPasswordForm from '@/components/auth/beeyield/BeeYieldForgotPasswordForm';

type AuthMode = 'login' | 'register' | 'forgot-password';

const ProfessionalAuth: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading: authLoading, beeyieldUser } = useAuth();
    const [authMode, setAuthMode] = useState<AuthMode>('login');

    useEffect(() => {
        if ((user || beeyieldUser) && !authLoading) {
            navigate('/beeyield-dashboard');
        }
    }, [user, beeyieldUser, authLoading, navigate]);

    if (authLoading) {
        return (
            <div className="min-h-screen bg-beeyield-cream flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <Activity className="h-12 w-12 text-beeyield-green animate-pulse" />
                        <div className="absolute inset-0 bg-beeyield-green/20 blur-xl animate-pulse" />
                    </div>
                    <span className="text-beeyield-green/60 font-mono text-xs tracking-widest uppercase">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-beeyield-cream text-beeyield-green selection:bg-beeyield-gold/30 overflow-hidden relative font-sans">
            {/* High-Tech Grid Background - Light Theme */}
            <div className="absolute inset-0 z-0 opacity-10">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1B9157_1px,transparent_1px),linear-gradient(to_bottom,#1B9157_1px,transparent_1px)] bg-[size:4rem_4rem]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at:50%_50%,rgba(244,208,63,0.1)_0%,transparent_100%)]" />
            </div>

            <div className="container mx-auto px-4 min-h-screen flex flex-col relative z-10">
                {/* Agri-Tech Header */}
                <div className="py-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <motion.div
                            whileHover={{ rotate: 90 }}
                            transition={{ duration: 0.5 }}
                            className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border-2 border-beeyield-green/10 shadow-soft relative group"
                        >
                            <Sprout className="h-7 w-7 text-beeyield-green transition-transform group-hover:scale-110" />
                        </motion.div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tighter leading-none text-beeyield-green flex items-center gap-2">
                                BEE<span className="text-beeyield-gold">YIELD</span>
                                <span className="text-[10px] bg-beeyield-green text-gray-900 px-2 py-0.5 rounded-full font-mono uppercase">Farmer</span>
                            </h1>
                            <p className="text-[10px] text-beeyield-green/50 font-bold tracking-[0.3em] uppercase mt-1">Farmer Dashboard</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-xs text-beeyield-green/60 hover:text-beeyield-green transition-colors font-bold uppercase tracking-widest border border-beeyield-green/20 px-4 py-2 rounded-lg bg-white/50 hover:bg-white hover:shadow-sm"
                    >
                        <ArrowLeft className="h-3 w-3" /> Dashboard Hub
                    </button>
                </div>

                <div className="flex-1 flex items-center justify-center py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-7xl w-full items-center">

                        {/* Technical Specs Side */}
                        <div className="hidden lg:block space-y-12">
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-beeyield-green/10 border border-beeyield-green/20">
                                    <div className="w-2 h-2 rounded-full bg-beeyield-green shadow-[0_0_8px_#1B9157]" />
                                    <span className="text-[10px] font-bold text-beeyield-green tracking-widest uppercase">Online</span>
                                </div>
                                <h2 className="text-7xl font-black tracking-tighter leading-[0.9] text-beeyield-green">
                                    Precision <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-beeyield-gold to-beeyield-orange">Farmer</span> <br />
                                    Portal.
                                </h2>
                                <p className="text-beeyield-green/60 max-w-md text-lg leading-relaxed font-medium">
                                    Tools for farmers and beekeepers. Healthy bees, better honey.
                                </p>
                            </motion.div>

                            <div className="grid grid-cols-2 gap-6">
                                {[
                                    { icon: LineChart, label: 'Yield Tracking', desc: 'Track honey harvest' },
                                    { icon: Activity, label: 'Hive Diseases', desc: 'Protect your bees' },
                                    { icon: Hexagon, label: 'Land 50/50 Promise', desc: 'Fair revenue sharing' },
                                    { icon: Layers, label: 'Manage Hives', desc: 'Simple apiary tools' }
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + (i * 0.1) }}
                                        className="p-6 rounded-2xl bg-white border border-beeyield-green/10 hover:border-beeyield-gold/50 hover:shadow-soft transition-all group backdrop-blur-sm"
                                    >
                                        <item.icon className="h-6 w-6 text-beeyield-green/40 group-hover:text-beeyield-orange mb-4 transition-colors" />
                                        <h4 className="font-bold text-sm mb-1 text-beeyield-green">{item.label}</h4>
                                        <p className="text-xs text-beeyield-green/50 leading-relaxed font-medium">{item.desc}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Professional Auth Card (Matrix Style - Light) */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="max-w-md w-full mx-auto relative"
                        >
                            {/* Decorative Glow */}
                            <div className="absolute -inset-4 bg-beeyield-gold/20 blur-3xl rounded-[3rem] opacity-50" />

                            <Card className="bg-white border-2 border-beeyield-green/10 shadow-premium rounded-[2rem] overflow-hidden relative">
                                <div className="p-8 border-b border-beeyield-green/5 bg-beeyield-cream/30">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="inline-flex rounded-xl bg-beeyield-cream p-1 border border-beeyield-green/10 shadow-inner">
                                            <button
                                                onClick={() => setAuthMode('login')}
                                                className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${authMode === 'login' ? 'bg-beeyield-green text-gray-900 shadow-sm' : 'text-beeyield-green/40 hover:text-beeyield-green'}`}
                                            >
                                                Log In
                                            </button>
                                            <button
                                                onClick={() => setAuthMode('register')}
                                                className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${authMode === 'register' ? 'bg-beeyield-gold text-beeyield-black shadow-sm' : 'text-beeyield-green/40 hover:text-beeyield-green'}`}
                                            >
                                                Sign Up
                                            </button>
                                        </div>
                                        <div className="w-8 h-8 rounded-full border border-beeyield-green/10 flex items-center justify-center bg-white shadow-sm">
                                            <Lock className="h-3 w-3 text-beeyield-green/60" />
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-black tracking-tightest text-beeyield-green uppercase">
                                        {authMode === 'login' ? 'Log In' : authMode === 'register' ? 'Sign Up' : 'Reset Password'}
                                    </h3>
                                    <p className="text-[10px] text-beeyield-green/50 font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-beeyield-orange animate-pulse" />
                                        {authMode === 'login' ? 'Please log in' : 'Please sign up'}
                                    </p>
                                </div>

                                <CardContent className="p-8 pb-10">
                                    <div className="space-y-6">
                                        {authMode === 'login' && (
                                            <div className="animate-fade-in-up">
                                                <BeeYieldLoginForm
                                                    onSuccess={() => navigate('/beeyield-dashboard')}
                                                    onSwitchToRegister={() => setAuthMode('register')}
                                                    onForgotPassword={() => setAuthMode('forgot-password')}
                                                />
                                            </div>
                                        )}

                                        {authMode === 'register' && (
                                            <div className="animate-fade-in-up">
                                                <BeeYieldRegisterForm
                                                    onSuccess={() => {
                                                        toast.success("Account Created");
                                                        setAuthMode('login');
                                                    }}
                                                    onSwitchToLogin={() => setAuthMode('login')}
                                                />
                                            </div>
                                        )}

                                        {authMode === 'forgot-password' && (
                                            <div className="animate-fade-in-up">
                                                <BeeYieldForgotPasswordForm
                                                    onBackToLogin={() => setAuthMode('login')}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </CardContent>

                                <div className="px-8 py-4 bg-beeyield-green/5 border-t border-beeyield-green/5 flex items-center justify-between">
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-2 text-[8px] font-black text-beeyield-green/60 uppercase tracking-widest">
                                            <Shield className="h-2.5 w-2.5" /> 2FA Active
                                        </div>
                                        <div className="flex items-center gap-2 text-[8px] font-black text-beeyield-green/60 uppercase tracking-widest">
                                            <Activity className="h-2.5 w-2.5" /> Live Log
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                </div>

                {/* Cyber Footer - Light Theme */}
                <div className="py-8 border-t border-beeyield-green/10 flex items-center justify-between text-[10px] font-black text-beeyield-green/40 uppercase tracking-[0.4em]">
                    <div className="flex items-center gap-2">
                        <Hexagon className="h-3 w-3 text-beeyield-gold" />
                        <span>Farmer Portal</span>
                    </div>
                    <div className="flex gap-8">
                        <span className="text-beeyield-orange/60">EST. 2026 // KENYA</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfessionalAuth;
