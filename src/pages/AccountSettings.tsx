import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TwoFactorSetup from '@/components/auth/TwoFactorSetup';
import BeeYieldLoginForm from '@/components/auth/beeyield/BeeYieldLoginForm';
import BeeYieldRegisterForm from '@/components/auth/beeyield/BeeYieldRegisterForm';
import { LogOut, Loader2, Hexagon, Shield, User, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { glass } from '@/components/beeyield/GlassTheme';
import { BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
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

        const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Please select a PNG, JPEG, WebP, or GIF image.');
            return;
        }

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
            toast.error(error?.message || 'Failed to update profile photo.');
        } finally {
            setUploading(false);
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
                                {authMode === 'login' ? 'Sign in to your account' : 'Create a new account'}
                            </p>
                        </div>

                        <Card className={cn(glass.card, "p-0 overflow-hidden bg-white shadow-xl")}>
                            <CardContent className="p-6 sm:p-8">
                                <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-gray-50 rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => setAuthMode('login')}
                                        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md font-bold text-[10px] transition-all ${authMode === 'login' ? 'bg-white text-[#1A1A1A] shadow-sm border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        Sign in
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAuthMode('register')}
                                        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md font-bold text-[10px] transition-all ${authMode === 'register' ? 'bg-white text-[#1A1A1A] shadow-sm border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        Create account
                                    </button>
                                </div>

                                {authMode === 'login' ? (
                                    <BeeYieldLoginForm
                                        onSuccess={() => { }}
                                        onSwitchToRegister={() => setAuthMode('register')}
                                    />
                                ) : (
                                    <BeeYieldRegisterForm
                                        onSuccess={() => { }}
                                        onSwitchToLogin={() => setAuthMode('login')}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </BeeYieldPageShell>
            </motion.div>
        );
    }

    const userMetadata = user.user_metadata || {};
    const fullName = userMetadata.first_name && userMetadata.last_name 
        ? `${userMetadata.first_name} ${userMetadata.last_name}` 
        : userMetadata.full_name || user.email || 'User';

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen">
            <BeeYieldPageShell className="max-w-7xl mx-auto my-0 space-y-8 pb-20 p-4 lg:p-6">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Profile Section */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex flex-col md:flex-row gap-8 items-start bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-[2rem] bg-gray-100 overflow-hidden border-4 border-white shadow-xl">
                                    {user.user_metadata?.avatar_url ? (
                                        <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-amber-50">
                                            <User className="w-12 h-12 text-amber-200" />
                                        </div>
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-white shadow-lg rounded-xl border border-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                                    <span className="text-xl">📸</span>
                                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" disabled={uploading} />
                                </label>
                            </div>

                            <div className="flex-1 space-y-4">
                                <div className="space-y-1">
                                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">{fullName}</h1>
                                    <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                        <Mail className="w-3 h-3" /> {user.email}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 px-3 py-1 text-[10px] uppercase font-black">Verified Account</Badge>
                                    <Badge className="bg-amber-50 text-amber-600 border-amber-100 px-3 py-1 text-[10px] uppercase font-black">Pro Member</Badge>
                                </div>
                            </div>
                        </div>

                        {/* Security Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 px-2">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100 shadow-sm">
                                    <Shield className="h-5 w-5 text-amber-500" />
                                </div>
                                <h2 className="text-xl font-bold tracking-tight text-gray-900">Security & Authentication</h2>
                            </div>
                            <TwoFactorSetup />
                        </div>
                    </div>

                    {/* Danger Zone / Sidebar */}
                    <div className="space-y-8">
                        <div className="bg-red-50/50 p-8 rounded-[2.5rem] border border-red-100 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shadow-sm">
                                    <LogOut className="h-5 w-5 text-red-600" />
                                </div>
                                <h3 className="text-lg font-bold text-red-900">Danger Zone</h3>
                            </div>
                            <p className="text-sm text-red-600 leading-relaxed font-medium">Protect your account integrity. Sign out from this device to end your current session.</p>
                            <Button 
                                variant="destructive" 
                                className="w-full h-12 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-red-200"
                                onClick={handleSignOut}
                            >
                                Logout Securely
                            </Button>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
                            <h4 className="font-bold text-gray-900">Need Help?</h4>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed">If you're having trouble with your account or two-factor authentication, contact our support team in Kibwezi.</p>
                            <Button variant="outline" className="w-full h-10 rounded-lg text-[10px] font-bold border-gray-200">Support Center</Button>
                        </div>
                    </div>
                </div>
            </BeeYieldPageShell>
        </motion.div>
    );
};

export default AccountSettings;
