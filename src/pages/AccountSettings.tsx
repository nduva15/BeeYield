import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import TwoFactorSetup from '@/components/auth/TwoFactorSetup';
import BeeYieldLoginForm from '@/components/auth/beeyield/BeeYieldLoginForm';
import BeeYieldRegisterForm from '@/components/auth/beeyield/BeeYieldRegisterForm';
import { User, Mail, Shield, LogOut, Loader2, UserPlus, LogIn, Hexagon, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { glass, PageHeader } from '@/components/beeyield/GlassTheme';
import { motion } from 'framer-motion';

type AuthMode = 'login' | 'register';

const AccountSettings = () => {
    const { user, loading, signOut } = useAuth();
    const navigate = useNavigate();
    const [authMode, setAuthMode] = useState<AuthMode>('login');

    const handleSignOut = async () => {
        await signOut('beeyield');
        navigate('/');
    };

    if (loading) {
        return (
            <div className={cn(glass.page, "flex items-center justify-center min-h-screen")}>
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-[#1B9157]" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Initializing Secure Kernel...</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn(glass.page, "min-h-screen py-16 lg:py-24")}>
                <div className="container max-w-sm mx-auto px-4 space-y-8 relative z-10">
                    <div className="space-y-4 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto border border-gray-100">
                            <Hexagon className="h-8 w-8 text-[#F4D03F]" />
                        </div>
                        <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">
                            Identity <span className="text-[#F4D03F]">Relay</span>
                        </h1>
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                            {authMode === 'login'
                                ? 'Authorize access to BeeYield Kernel'
                                : 'Initialize new industrial node'}
                        </p>
                    </div>

                    <Card className={cn(glass.card, "p-0 overflow-hidden bg-white shadow-xl")}>
                        <CardContent className="p-6 sm:p-8">
                            <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-gray-50 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setAuthMode('login')}
                                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md font-bold text-[10px] uppercase transition-all ${authMode === 'login'
                                        ? 'bg-white text-[#1A1A1A] shadow-sm border border-gray-200'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    Authorize
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAuthMode('register')}
                                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md font-bold text-[10px] uppercase transition-all ${authMode === 'register'
                                        ? 'bg-white text-[#1A1A1A] shadow-sm border border-gray-200'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    Initialize
                                </button>
                            </div>

                            {authMode === 'login' && (
                                <BeeYieldLoginForm
                                    onSuccess={() => { }}
                                    onSwitchToRegister={() => setAuthMode('register')}
                                />
                            )}

                            {authMode === 'register' && (
                                <BeeYieldRegisterForm
                                    onSuccess={() => { }}
                                    onSwitchToLogin={() => setAuthMode('login')}
                                />
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-3 gap-3 text-center opacity-70 hover:opacity-100 transition-opacity">
                        <div className="p-3 rounded-xl bg-white/50 border border-gray-100 backdrop-blur-sm">
                            <span className="text-xl">🍯</span>
                            <p className="text-[9px] font-bold mt-1.5 text-gray-500 uppercase tracking-widest">Track Orders</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/50 border border-gray-100 backdrop-blur-sm">
                            <span className="text-xl">⚡</span>
                            <p className="text-[9px] font-bold mt-1.5 text-gray-500 uppercase tracking-widest">Fast Checkout</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/50 border border-gray-100 backdrop-blur-sm">
                            <span className="text-xl">🎁</span>
                            <p className="text-[9px] font-bold mt-1.5 text-gray-500 uppercase tracking-widest">Exclusive Deals</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    const userMetadata = user.user_metadata || {};
    const firstName = userMetadata.first_name || userMetadata.full_name?.split(' ')[0] || '';
    const lastName = userMetadata.last_name || userMetadata.full_name?.split(' ').slice(1).join(' ') || '';
    const fullName = firstName && lastName ? `${firstName} ${lastName}` : firstName || 'User';

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn(glass.page, "max-w-7xl mx-auto space-y-6 pb-20 p-4 lg:p-6")}>
            <PageHeader
                icon={User}
                label="Identity & Kernel Access"
                title={<>Account <span className="text-[#F4D03F]">Portal</span></>}
                subtitle="Manage your personal settings, security, and authentication methods."
            />

            <div className="container max-w-4xl mx-auto space-y-8">
                <Card className={cn(glass.card, "p-0 overflow-hidden bg-white shadow-sm")}>
                    <CardHeader className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-gray-200 shadow-sm">
                                <User className="h-6 w-6 text-[#F4D03F]" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold text-[#1A1A1A] tracking-tight">Your Profile</CardTitle>
                                <CardDescription className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-1">Personal account information</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8 space-y-8">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-200 overflow-hidden shadow-sm">
                                {userMetadata.avatar_url ? (
                                    <img
                                        src={userMetadata.avatar_url}
                                        alt={fullName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-3xl font-bold text-gray-400">
                                        {fullName.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div className="text-center md:text-left space-y-1">
                                <p className="font-bold text-2xl tracking-tight text-[#1A1A1A]">{fullName}</p>
                                <p className="text-sm text-gray-500 font-medium flex items-center justify-center md:justify-start gap-2">
                                    <Mail className="h-4 w-4 opacity-50" />
                                    {user.email}
                                </p>
                            </div>
                        </div>

                        <Separator className="bg-gray-100" />

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Login Type</span>
                                <p className="text-sm font-bold text-[#1A1A1A]">{user.app_metadata?.provider || 'Email'}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Account status</span>
                                <p className={`text-sm font-bold flex items-center gap-2 ${user.email_confirmed_at ? 'text-[#1B9157]' : 'text-[#F4D03F]'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${user.email_confirmed_at ? 'bg-[#1B9157]' : 'bg-[#F4D03F]'}`} />
                                    {user.email_confirmed_at ? 'Verified' : 'Pending'}
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5 sm:col-span-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Member Since</span>
                                <p className="text-sm font-bold text-[#1A1A1A]">{new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-gray-200 shadow-sm">
                                <Shield className="h-4 w-4 text-[#F4D03F]" />
                            </div>
                            <h2 className="text-lg font-bold tracking-tight text-[#1A1A1A]">Security</h2>
                        </div>
                        <TwoFactorSetup />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center border border-red-100 shadow-sm">
                                <LogOut className="h-4 w-4 text-red-500" />
                            </div>
                            <h2 className="text-lg font-bold tracking-tight text-[#1A1A1A]">Danger Zone</h2>
                        </div>
                        <Card className={cn(glass.card, "p-0 overflow-hidden bg-white border-red-100 shadow-sm")}>
                            <CardContent className="p-6">
                                <div className="space-y-6">
                                    <div className="space-y-1">
                                        <p className="text-base font-bold text-red-600">Sign Out</p>
                                        <p className="text-xs text-red-400 font-medium">Log out of your account session safely.</p>
                                    </div>
                                    <button
                                        onClick={handleSignOut}
                                        className={cn("w-full h-10 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100 hover:border-red-600 rounded-lg font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all shadow-sm")}
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Logout from Device
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AccountSettings;
