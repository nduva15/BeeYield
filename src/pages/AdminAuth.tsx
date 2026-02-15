import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import {
    Shield,
    Lock,
    LogIn,
    Loader2,
    UserPlus,
    Terminal,
    Database,
    Server,
    Cpu,
    Zap,
    Globe,
    Activity,
    Maximize2
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { SUPER_ADMIN_EMAIL } from '@/config/constants';
import { motion } from 'framer-motion';

type AuthMode = 'login' | 'register' | 'forgot-password';

const AdminAuth = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [authMode, setAuthMode] = useState<AuthMode>('login');

    const redirectPath = searchParams.get('redirect') || '/admin';

    useEffect(() => {
        if (!loading && user) {
            const userRole = user?.user_metadata?.role || 'user';
            const isSuperAdminEmail = [SUPER_ADMIN_EMAIL].includes(user?.email?.toLowerCase() || '');
            const isAdmin = userRole === 'admin' || userRole === 'super_admin' || isSuperAdminEmail;

            if (isAdmin) {
                navigate(redirectPath);
            }
        }
    }, [user, loading, navigate, redirectPath]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-beeyield-cream">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-beeyield-gold/20 border-t-beeyield-green rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Zap className="h-6 w-6 text-beeyield-gold animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-beeyield-cream text-beeyield-green selection:bg-beeyield-gold/40 flex items-center justify-center p-4 overflow-hidden relative font-sans">
            {/* Geometric Circuit Background - Updated for Light Theme */}
            <div className="absolute inset-0 z-0 opacity-5">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-beeyield-gold to-transparent animate-scan" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-0 bg-[radial-gradient(#1B9157_1px,transparent_1px)] bg-[size:20px_20px]" />
                <svg className="absolute inset-0 w-full h-full">
                    <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                        <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(27,145,87,0.1)" strokeWidth="0.5" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            <div className="container max-w-xl mx-auto relative z-10 space-y-12">
                {/* Enterprise Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="space-y-6 text-center"
                >
                    <div className="relative inline-block">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="w-24 h-24 rounded-3xl bg-white flex items-center justify-center border-2 border-beeyield-gold/20 shadow-glow group transition-all"
                        >
                            <Shield className="h-12 w-12 text-beeyield-green group-hover:scale-110 transition-transform" />
                            <div className="absolute -top-2 -right-2 bg-beeyield-gold text-beeyield-black text-[8px] font-black px-2 py-0.5 rounded shadow-lg uppercase tracking-widest">Secure</div>
                        </motion.div>
                        {/* Decorative corners */}
                        <div className="absolute -top-4 -left-4 w-4 h-4 border-t-2 border-l-2 border-beeyield-green/30" />
                        <div className="absolute -bottom-4 -right-4 w-4 h-4 border-b-2 border-r-2 border-beeyield-green/30" />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-center gap-3">
                            <div className="h-px w-8 bg-beeyield-gold/50" />
                            <span className="text-[10px] font-black text-beeyield-gold tracking-[0.5em] uppercase">Admin Access</span>
                            <div className="h-px w-8 bg-beeyield-gold/50" />
                        </div>
                        <h1 className="text-5xl font-black text-beeyield-black tracking-tightest leading-none flex flex-col">
                            <span className="text-beeyield-green/40 text-sm tracking-[0.8em] font-normal mb-1">ADMIN</span>
                            ADMIN PANEL
                        </h1>
                    </div>
                </motion.div>

                {/* Industrial Auth Card - Updated Styles */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="bg-white border-2 border-beeyield-gold/10 shadow-premium rounded-none relative overflow-hidden group">
                        {/* Corner Detail */}
                        <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden pointer-events-none">
                            <div className="absolute top-[-20px] right-[-20px] w-10 h-10 bg-beeyield-gold/20 rotate-45 border border-beeyield-gold/40" />
                        </div>

                        <CardContent className="pt-10 pb-12 px-10">
                            {/* Auth Mode Interface */}
                            <div className="mb-10 flex items-center justify-between border-b border-beeyield-green/10 pb-6">
                                <div className="space-y-1">
                                    <h2 className="text-xs font-black text-beeyield-green uppercase tracking-widest">
                                        {authMode === 'login' ? 'Login' : 'Sign Up'}
                                    </h2>
                                    <p className="text-[9px] text-beeyield-green/50 font-bold uppercase tracking-widest flex items-center gap-2">
                                        <Activity className="h-2 w-2 text-beeyield-gold animate-pulse" />
                                        {authMode === 'login' ? 'Enter Details' : 'Create Account'}
                                    </p>
                                </div>
                                <div className="flex gap-2 p-1 bg-beeyield-cream border border-beeyield-green/10">
                                    <button
                                        onClick={() => setAuthMode('login')}
                                        className={`px-4 py-2 text-[9px] font-black uppercase tracking-tighter transition-all ${authMode === 'login' ? 'bg-beeyield-green text-white shadow-sm' : 'text-beeyield-green/60 hover:text-beeyield-green'}`}
                                    >
                                        Log In
                                    </button>
                                    <button
                                        onClick={() => setAuthMode('register')}
                                        className={`px-4 py-2 text-[9px] font-black uppercase tracking-tighter transition-all ${authMode === 'register' ? 'bg-beeyield-gold text-beeyield-black shadow-sm' : 'text-beeyield-green/60 hover:text-beeyield-green'}`}
                                    >
                                        Sign Up
                                    </button>
                                </div>
                            </div>

                            {/* Forms */}
                            {authMode === 'login' && (
                                <div className="animate-fade-in-up">
                                    <LoginForm
                                        variant="admin"
                                        onSuccess={() => navigate(redirectPath)}
                                        onSwitchToRegister={() => setAuthMode('register')}
                                        onForgotPassword={() => setAuthMode('forgot-password')}
                                    />
                                </div>
                            )}

                            {authMode === 'register' && (
                                <div className="animate-fade-in-up">
                                    <RegisterForm
                                        variant="admin"
                                        defaultRole="admin"
                                        onSuccess={() => {
                                            toast.success("Welcome! Account created.");
                                            setAuthMode('login');
                                        }}
                                        onSwitchToLogin={() => setAuthMode('login')}
                                        additionalMetadata={{ ceba_active: true }}
                                    />
                                </div>
                            )}

                            {authMode === 'forgot-password' && (
                                <div className="animate-fade-in-up">
                                    <ForgotPasswordForm
                                        variant="admin"
                                        onBackToLogin={() => setAuthMode('login')}
                                    />
                                </div>
                            )}
                        </CardContent>

                        {/* Industrial Status Bar */}
                        <div className="px-10 py-3 bg-beeyield-green/5 border-t border-beeyield-green/10 flex items-center justify-between">
                            <div className="flex gap-6">
                                <div className="flex items-center gap-2 text-[8px] font-black text-beeyield-green/60 uppercase tracking-widest">
                                    <Server className="h-3 w-3" /> SERVER
                                </div>
                                <div className="flex items-center gap-2 text-[8px] font-black text-beeyield-green/60 uppercase tracking-widest">
                                    <Globe className="h-3 w-3" /> NETWORK
                                </div>
                            </div>
                            <div className="text-[8px] font-black text-beeyield-gold uppercase tracking-widest animate-pulse">
                                System Online
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* System Navigation */}
                <div className="flex flex-col items-center gap-6 pt-4">
                    <button
                        onClick={() => navigate('/')}
                        className="group flex items-center gap-4 text-beeyield-green/40 hover:text-beeyield-green transition-all text-[10px] font-black uppercase tracking-[0.4em]"
                    >
                        <div className="h-px w-6 bg-beeyield-green/20 group-hover:bg-beeyield-green transition-all" />
                        Exit
                        <div className="h-px w-6 bg-beeyield-green/20 group-hover:bg-beeyield-green transition-all" />
                    </button>

                    <div className="flex gap-12 text-[9px] font-bold text-beeyield-green/60 uppercase tracking-widest">
                        <div className="flex items-center gap-2 hover:text-beeyield-green cursor-help transition-colors">
                            <Cpu className="h-3 w-3" /> Encrypted
                        </div>
                        <div className="flex items-center gap-2 hover:text-beeyield-green cursor-help transition-colors">
                            <Maximize2 className="h-3 w-3" /> Full Access
                        </div>
                    </div>
                </div>
            </div>

            {/* HUD Elements - Updated colors */}
            <div className="fixed bottom-10 left-10 hidden xl:block pointer-events-none">
                <div className="space-y-2 text-[8px] text-beeyield-green/40 font-bold uppercase tracking-widest border-l border-beeyield-green/20 pl-4">
                    <p>Status: Checking...</p>
                    <p>IP Local: 127.0.0.1</p>
                    <p>Protocol: Secure</p>
                </div>
            </div>
        </div>
    );
};

export default AdminAuth;
