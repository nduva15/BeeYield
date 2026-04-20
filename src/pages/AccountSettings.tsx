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
import { glass } from '@/components/beeyield/GlassTheme';
import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
import { motion } from 'framer-motion';
import { uploadAvatar } from '@/services/beeyieldService';
import { toast } from 'sonner';

type AuthMode = 'login' | 'register';

const AccountSettings = () => {
    const { user, loading, signOut, updateUser } = useAuth();
    const navigate = useNavigate();
    const [authMode, setAuthMode] = useState<AuthMode>('login');
    const [uploading, setUploading] = useState(false);

    const handleSignOut = async () => {
        await signOut('beeyield');
        navigate('/');
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        // Validate file type
        const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Please select a PNG, JPEG, WebP, or GIF image.');
            return;
        }

        // Size check (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image size must be less than 2MB');
            return;
        }

        try {
            setUploading(true);
            const { url, error } = await uploadAvatar(user.id, file);
            if (error) throw error;
            
            const { error: updateError } = await updateUser({ avatar_url: url }, 'beeyield');
            if (updateError) throw updateError;

            toast.success('Profile photo updated successfully!');
        } catch (error: any) {
            console.error('Upload failed:', error);
            const msg = error?.message || 'Failed to update profile photo.';
            toast.error(msg);
        } finally {
            setUploading(false);
            // Reset input so the same file can be re-selected
            if (event.target) event.target.value = '';
        }
    };

    if (loading) {
        return (
            <BeeYieldPageShell className="flex items-center justify-center min-h-screen m-0">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-[#1B9157]" />
                    <span className="text-xs font-bold text-gray-500">Loading…</span>
                </div>
            </BeeYieldPageShell>
        );
    }

    if (!user) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen">
                <BeeYieldPageShell className="min-h-screen py-16 lg:py-24 m-0">
                    <div className="container max-w-sm mx-auto px-4 space-y-8 relative z-10">
                    <div className="space-y-4 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto border border-gray-100">
                            <Hexagon className="h-8 w-8 text-[#F4D03F]" />
                        </div>
                        <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">
                            Account <span className="text-[#F4D03F]">Access</span>
                        </h1>
                        <p className="text-[11px] font-bold text-gray-500">
                            {authMode === 'login'
                                ? 'Sign in to your account'
                                : 'Create a new account'}
                        </p>
                    </div>

                    <Card className={cn(glass.card, "p-0 overflow-hidden bg-white shadow-xl")}>
                        <CardContent className="p-6 sm:p-8">
                            <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-gray-50 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setAuthMode('login')}
                                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md font-bold text-[10px] transition-all ${authMode === 'login'
                                        ? 'bg-white text-[#1A1A1A] shadow-sm border border-gray-200'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    Sign in
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAuthMode('register')}
                                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md font-bold text-[10px] transition-all ${authMode === 'register'
                                        ? 'bg-white text-[#1A1A1A] shadow-sm border border-gray-200'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    Create account
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
                    <div className="container max-w-sm mx-auto px-4 space-y-8 relative z-10">
                    <div className="space-y-4 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto border border-gray-100">
                            <Hexagon className="h-8 w-8 text-[#F4D03F]" />
                        </div>
                        <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">
                            Account <span className="text-[#F4D03F]">Access</span>
                        </h1>
                        <p className="text-[11px] font-bold text-gray-500">
                            {authMode === 'login'
                                ? 'Sign in to your account'
                                : 'Create a new account'}
                        </p>
                    </div>

                    <Card className={cn(glass.card, "p-0 overflow-hidden bg-white shadow-xl")}>
                        <CardContent className="p-6 sm:p-8">
                            <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-gray-50 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setAuthMode('login')}
                                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md font-bold text-[10px] transition-all ${authMode === 'login'
                                        ? 'bg-white text-[#1A1A1A] shadow-sm border border-gray-200'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    Sign in
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAuthMode('register')}
                                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md font-bold text-[10px] transition-all ${authMode === 'register'
                                        ? 'bg-white text-[#1A1A1A] shadow-sm border border-gray-200'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    Create account
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
                        <div className="p-3 rounded-xl bg-muted/30 border border-border/50 backdrop-blur-sm">
                            <span className="text-xl">🍯</span>
                            <p className="text-[9px] font-bold mt-1.5 text-muted-foreground">Track Orders</p>
                        </div>
                        <div className="p-3 rounded-xl bg-muted/30 border border-border/50 backdrop-blur-sm">
                            <span className="text-xl">⚡</span>
                            <p className="text-[9px] font-bold mt-1.5 text-muted-foreground">Fast Checkout</p>
                        </div>
                        <div className="p-3 rounded-xl bg-muted/30 border border-border/50 backdrop-blur-sm">
                            <span className="text-xl">🎁</span>
                            <p className="text-[9px] font-bold mt-1.5 text-muted-foreground">Exclusive Deals</p>
                        </div>
                    </div>
                    </div>
                </BeeYieldPageShell>
            </motion.div>
        );
    }

    const userMetadata = user.user_metadata || {};
    const firstName = userMetadata.first_name || userMetadata.full_name?.split(' ')[0] || '';
    const lastName = userMetadata.last_name || userMetadata.full_name?.split(' ').slice(1).join(' ') || '';
    const fullName = firstName && lastName ? `${firstName} ${lastName}` : firstName || 'User';

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen">
        <BeeYieldPageShell className="max-w-7xl mx-auto my-0 space-y-6 pb-20 p-4 lg:p-6">
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
                                        className={cn("w-full h-10 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100 hover:border-red-600 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm")}
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
            </BeeYieldPageShell>
        </motion.div>
    );
};

export default AccountSettings;
