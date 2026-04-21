import React from 'react';
import {
    User, Shield, Bell, Globe, Lock as LockIcon, MapPin, Activity, Save, Trash2, Key, Smartphone, Layers, Hexagon, Cpu, ShieldCheck, Check, Mail,
    Settings, LogOut, ChevronRight, Palette, Fingerprint, CreditCard, Receipt, Plus, XCircle, ExternalLink, Clock, ArrowUpRight, ArrowDownRight,
    Camera, Loader2
} from "lucide-react";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';
import { useSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { glass, GlassModal, GlassConfirmModal } from './GlassTheme';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { deletePaymentMethod, getPaymentMethods, waitForVaultedPaymentMethod } from '@/services/shopService';
import { beeyieldService, uploadAvatar, BillingOverview, Transaction } from '@/services/beeyieldService';
import {
    BeeYieldCard,
    BeeYieldFormField,
    BeeYieldPageHeader,
    BeeYieldPageShell,
    BeeYieldTextInput,
} from '@/components/beeyield/BeeYieldUI';
import {
    MODULE_TOGGLES,
    INTERNAL_ALERTS,
    DELIVERY_ALERTS,
    BILLING_FIELDS,
} from '@/data/settingsConfig';

interface SettingsViewProps {
    onTabChange?: (tab: string, message?: string, action?: string) => void;
}

type SavedPaymentMethod = {
    id: string;
    type?: string;
    provider?: string;
    last4?: string;
    expiry_month?: number;
    expiry_year?: number;
    card_holder_name?: string;
    is_default?: boolean;
    isDefault?: boolean;
    created_at?: string;
};

const SettingsView: React.FC<SettingsViewProps> = ({ onTabChange }) => {
    const { user, signOut, updateUser } = useAuth();
    const { theme, setTheme } = useTheme();
    const { moduleFlags, updateModuleFlags, alerts, updateAlerts, resetWorkspace, syncToBackend, isSyncing } = useSettings();
    const [mounted, setMounted] = React.useState(false);
    const [loading, setLoading] = React.useState<Record<string, boolean>>({});
    const [activeTab, setActiveTab] = React.useState('identity');
    const [pageError, setPageError] = React.useState<string | null>(null);

    // Billing
    const [billingLoading, setBillingLoading] = React.useState(false);
    const [paymentMethods, setPaymentMethods] = React.useState<SavedPaymentMethod[]>([]);
    const [billingOverview, setBillingOverview] = React.useState<BillingOverview | null>(null);
    const [transactions, setTransactions] = React.useState<Transaction[]>([]);
    const [selectedTx, setSelectedTx] = React.useState<Transaction | null>(null);
    const [isAddCardOpen, setIsAddCardOpen] = React.useState(false);
    const [StripeCardFormComp, setStripeCardFormComp] = React.useState<React.ComponentType<any> | null>(null);

    // Profile state
    const [fullName, setFullName] = React.useState(user?.user_metadata?.full_name || '');
    const [phone, setPhone] = React.useState(user?.user_metadata?.phone || '');
    const [locationName, setLocationName] = React.useState(user?.user_metadata?.location_name || '');
    const [email, setEmail] = React.useState(user?.email || '');
    const [profileLoading, setProfileLoading] = React.useState(false);
    const [uploading, setUploading] = React.useState(false);

    React.useEffect(() => {
        if (user) {
            if (user.user_metadata) {
                setFullName(user.user_metadata.full_name || '');
                setPhone(user.user_metadata.phone || '');
                setLocationName(user.user_metadata.location_name || '');
            }
            if (user.email) {
                setEmail(user.email);
            }
        }
    }, [user]);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const loadBilling = React.useCallback(async () => {
        setBillingLoading(true);
        setPageError(null);
        try {
            const [methods, overview, txs] = await Promise.all([
                getPaymentMethods().catch(() => []),
                beeyieldService.getBillingOverview().catch(() => null),
                beeyieldService.getTransactions().catch(() => []),
            ]);
            setPaymentMethods((methods || []) as SavedPaymentMethod[]);
            setBillingOverview(overview);
            setTransactions((txs || []) as Transaction[]);
        } catch (e: any) {
            const msg = e?.message || 'Failed to load billing data';
            console.error(e);
            setPageError(msg);
            toast.error(msg);
        } finally {
            setBillingLoading(false);
        }
    }, []);

    const ensureStripeCardForm = React.useCallback(async () => {
        if (StripeCardFormComp) return;
        try {
            const mod: any = await import('@/components/payments/StripeCardForm');
            setStripeCardFormComp(() => mod.StripeCardForm || mod.default);
        } catch (e) {
            console.error(e);
            toast.error('Stripe UI failed to load. Check CSP/keys.');
        }
    }, [StripeCardFormComp]);

    React.useEffect(() => {
        if (activeTab === 'billing') {
            loadBilling();
        }
    }, [activeTab, loadBilling]);

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
            // Reset the file input so the same file can be re-selected
            if (event.target) event.target.value = '';
        }
    };

    const handleAtomicSave = async (section: string) => {
        setLoading(prev => ({ ...prev, [section]: true }));
        if (section === 'Profile') setProfileLoading(true);
        setPageError(null);
        try {
            if (section === 'Profile') {
                if (email !== user?.email) {
                    const { error: emailError } = await updateUser({ email }, 'beeyield');
                    if (emailError) throw emailError;
                    toast.info('Email update initiated', { 
                        description: 'Please check your inbox to confirm the change.' 
                    });
                }

                const names = fullName.trim().split(/\s+/);
                const firstName = names[0] || '';
                const lastName = names.slice(1).join(' ') || '';
                const { error } = await beeyieldService.updateUserProfile({
                    first_name: firstName,
                    last_name: lastName,
                    phone: phone,
                    location_name: locationName
                });
                if (error) throw error;
            } else {
                await syncToBackend();
            }
            
            toast.success(`${section} synced`, {
                description: "Your settings are saved and up to date.",
                icon: <Check className="w-4 h-4 text-beeyield-green" />
            });
        } catch (error: any) {
            const msg = error?.message || `Failed to sync ${section}`;
            console.error(error);
            setPageError(msg);
            toast.error(msg);
        } finally {
            setLoading(prev => ({ ...prev, [section]: false }));
            if (section === 'Profile') setProfileLoading(false);
        }
    };

    if (!mounted) return null;

    return (
        <BeeYieldPageShell>
            <BeeYieldPageHeader
                icon={Settings}
                label="Settings"
                title={<>Control <span className="text-primary">Center</span></>}
                subtitle="Manage your account, modules, alerts, and security settings."
                actions={
                    <div className="flex items-center gap-2 bg-muted/50 border border-primary/20 px-4 h-10 rounded-xl shadow-sm">
                        <Activity className="w-4 h-4 text-beeyield-green animate-pulse" />
                        <span className="text-xs font-semibold text-foreground">
                            Sync: <span className="text-beeyield-green">{isSyncing ? 'Syncing…' : 'On'}</span>
                        </span>
                    </div>
                }
            />

            {pageError && (
                <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-destructive">Settings error</p>
                            <p className="text-sm font-semibold text-foreground break-words">{pageError}</p>
                        </div>
                        <button
                            type="button"
                            className={cn(glass.btnSecondary, "h-9 px-4 text-xs font-semibold")}
                            onClick={() => setPageError(null)}
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}

            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full space-y-6"
            >
                <TabsList className="bg-muted/30 p-1 h-9 w-full grid grid-cols-5 rounded-xl border border-border/40 backdrop-blur-xl">
                    {[
                        { value: 'identity', label: 'Profile', icon: User },
                        { value: 'modules', label: 'Modules', icon: Layers },
                        { value: 'alerts', label: 'Alerting', icon: Bell },
                        { value: 'security', label: 'Security', icon: ShieldCheck },
                        { value: 'billing', label: 'Billing', icon: CreditCard },
                    ].map(tab => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="h-full rounded-lg text-xs font-semibold text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/40 transition-all flex items-center justify-center gap-1.5"
                        >
                            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="identity" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Profile Summary */}
                        <div className="lg:col-span-4 space-y-4">
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                                <BeeYieldCard
                                    padded={false}
                                    className={cn(
                                        "text-center flex flex-col items-center justify-center py-8 px-6 bg-muted/30 backdrop-blur-xl border-border rounded-[2.5rem] shadow-xl relative overflow-hidden"
                                    )}
                                >
                                <div className="absolute -top-6 -left-6 opacity-[0.03] pointer-events-none">
                                    <Fingerprint className="w-32 h-32" />
                                </div>
                                <div className="w-20 h-20 rounded-[1.5rem] border-4 border-border/40 bg-card p-1 flex items-center justify-center relative shadow-sm group overflow-hidden">
                                    <div className="w-full h-full rounded-[1.2rem] bg-gray-50 flex items-center justify-center border border-gray-100 overflow-hidden relative">
                                        {user?.user_metadata?.avatar_url ? (
                                            <img src={user.user_metadata.avatar_url} alt={fullName} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-8 h-8 text-foreground group-hover:scale-110 transition-transform" />
                                        )}
                                        {uploading && (
                                            <div className="absolute inset-0 bg-muted/50 backdrop-blur-sm flex items-center justify-center">
                                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                            </div>
                                        )}
                                    </div>
                                    <label className="absolute bottom-1 right-1 w-7 h-7 bg-primary text-white p-1.5 rounded-lg border-2 border-white shadow-sm cursor-pointer hover:scale-110 transition-transform flex items-center justify-center">
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                                        <Camera className="w-3.5 h-3.5" />
                                    </label>
                                </div>
                                <h3 className="text-sm font-bold text-foreground mt-6">{fullName}</h3>
                                <p className="text-xs font-semibold text-beeyield-green mt-1">Verified BeeYield Profile</p>
                                <label className={cn(glass.btnPrimary, "mt-6 w-full cursor-pointer flex items-center justify-center gap-2")}>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                                    Change photo
                                </label>
                                </BeeYieldCard>
                            </motion.div>

                            <BeeYieldCard className={cn("p-5 bg-muted/30 backdrop-blur-xl border-border rounded-[2.5rem] shadow-xl")}>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <Palette className="w-3.5 h-3.5 text-primary" />
                                            <h4 className="text-xs font-semibold text-foreground">Theme</h4>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Light / dark</p>
                                    </div>
                                    <Switch
                                        checked={theme === 'dark'}
                                        onCheckedChange={(c) => setTheme(c ? 'dark' : 'light')}
                                        className="scale-90 data-[state=checked]:bg-beeyield-green"
                                    />
                                </div>
                            </BeeYieldCard>

                            <button
                                onClick={() => signOut()}
                                className={cn(glass.btnSecondary, "w-full border-red-500/10 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white")}
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Log out
                            </button>
                        </div>

                        {/* Audit Form */}
                        <div className="lg:col-span-8">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={cn("p-0 overflow-hidden bg-muted/30 backdrop-blur-xl border-border rounded-[2.5rem] shadow-xl")}
                            >
                                <BeeYieldCard padded={false} className={cn("p-0 overflow-hidden bg-muted/30 backdrop-blur-xl border-border rounded-[2.5rem] shadow-xl")}>
                                    <div className="p-5 border-b border-border/50 bg-primary[0.02] flex items-center justify-between flex-wrap gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-card flex items-center justify-center border border-gray-100 shadow-sm">
                                                <Globe className="w-4 h-4 text-primary" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <h2 className="text-sm font-bold text-foreground leading-none">Profile review</h2>
                                                <p className="text-xs text-muted-foreground">Account details</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-muted/30 text-muted-foreground border-border/40 rounded-lg font-semibold text-xs px-2 py-0.5">Archived</Badge>
                                    </div>

                                    <div className="p-6 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <BeeYieldFormField id="by_full_name" label="Full Name">
                                                <BeeYieldTextInput
                                                    id="by_full_name"
                                                    icon={User}
                                                    placeholder="e.g. Timothy Nduva"
                                                    className="w-full"
                                                    inputClassName="w-full font-bold bg-card/50"
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    disabled={profileLoading}
                                                />
                                            </BeeYieldFormField>

                                            <BeeYieldFormField id="by_email" label="Verified Email">
                                                <BeeYieldTextInput
                                                    id="by_email"
                                                    icon={Mail}
                                                    placeholder="e.g. you@example.com"
                                                    className="w-full"
                                                    inputClassName="w-full font-bold bg-card/50"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    disabled={profileLoading}
                                                    type="email"
                                                />
                                            </BeeYieldFormField>

                                            <BeeYieldFormField id="by_phone" label="Phone Number">

                                                <BeeYieldTextInput
                                                    id="by_phone"
                                                    icon={Smartphone}
                                                    placeholder="+254 7XX XXX XXX"
                                                    className="w-full"
                                                    inputClassName="w-full font-bold bg-card/50"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    disabled={profileLoading}
                                                />
                                            </BeeYieldFormField>

                                            <BeeYieldFormField id="by_sector" label="Physical Sector">
                                                <BeeYieldTextInput
                                                    id="by_sector"
                                                    icon={MapPin}
                                                    placeholder="Kibwezi, Kenya"
                                                    className="w-full"
                                                    inputClassName="w-full font-bold bg-card/50"
                                                    value={locationName}
                                                    onChange={(e) => setLocationName(e.target.value)}
                                                    disabled={profileLoading}
                                                />
                                            </BeeYieldFormField>
                                        </div>

                                        <div className="pt-6 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center sm:items-start md:items-center gap-4">
                                            <div className="flex items-center gap-2 text-beeyield-green">
                                                <Activity className="w-5 h-5 animate-pulse" />
                                                <p className="text-xs font-semibold text-beeyield-green">Status: OK</p>
                                            </div>
                                            <button
                                                onClick={() => handleAtomicSave("Profile")}
                                                disabled={loading["Profile"]}
                                                className={cn(glass.btnPrimary, "w-full sm:w-auto", loading["Profile"] && "opacity-70 cursor-not-allowed")}
                                            >
                                                {loading["Profile"] ? 'Syncing…' : 'Sync changes'}
                                            </button>
                                        </div>
                                    </div>
                                </BeeYieldCard>
                            </motion.div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="modules" className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(glass.card, "p-0 overflow-hidden bg-muted/30 backdrop-blur-xl border-border rounded-[2.5rem] shadow-xl")}
                    >
                        <div className="p-5 border-b border-border/50 bg-primary[0.02] flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-card flex items-center justify-center border border-gray-100 shadow-sm">
                                    <Layers className="w-4 h-4 text-primary" />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-sm font-bold text-foreground leading-none">Modules</h3>
                                    <p className="text-xs text-muted-foreground">Choose what you want to use in BeeYield.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => resetWorkspace(true)} className={glass.btnSecondary}>
                                    Activate All
                                </button>
                                <button onClick={() => resetWorkspace(false)} className={cn(glass.btnSecondary, "text-red-500 hover:bg-red-500 hover:text-white border-red-500/30")}>
                                    Purge All
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {MODULE_TOGGLES.map((mod, idx) => (
                                    <motion.div
                                        key={mod.id}
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-3.5 rounded-xl border border-border/40 bg-card/30 flex items-start justify-between group hover:bg-muted/50 hover:border-border/ hover:shadow-sm transition-all"
                                    >
                                        <div className="flex gap-3">
                                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border border-gray-100 bg-card shadow-sm transition-transform group-hover:scale-105", mod.color)}>
                                                <mod.icon className="w-4 h-4" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <h4 className="text-xs font-semibold text-foreground">{mod.label}</h4>
                                                <p className="text-xs text-muted-foreground max-w-[240px] leading-relaxed">{mod.desc}</p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={!!(moduleFlags as any)[mod.id]}
                                            onCheckedChange={(val) => updateModuleFlags({ [mod.id]: val })}
                                            className="scale-90 data-[state=checked]:bg-beeyield-green"
                                        />
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => handleAtomicSave("Modules")}
                                    className={glass.btnPrimary}
                                >
                                    Save modules
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </TabsContent>

                <TabsContent value="alerts" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Internal alerts */}
                        <div className={cn(glass.card, "p-0 overflow-hidden bg-muted/30 backdrop-blur-xl border-border rounded-[2.5rem] shadow-xl")}>
                            <div className="p-4 border-b border-border/50 bg-primary[0.02] flex flex-wrap items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-card flex items-center justify-center border border-gray-100 shadow-sm">
                                    <Bell className="w-4 h-4 text-primary" />
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="text-sm font-bold text-foreground leading-none">BeeYield alerts</h4>
                                    <p className="text-xs text-muted-foreground">Choose what you want to be notified about.</p>
                                </div>
                            </div>
                            <div className="p-5 space-y-3">
                                {INTERNAL_ALERTS.map((alert) => (
                                    <div key={alert.id} className="flex items-center justify-between p-3 rounded-xl border border-border/40 hover:border-border/ bg-card/30 hover:bg-muted/50 transition-colors group">
                                        <div className="space-y-0.5">
                                            <h5 className="text-xs font-semibold text-foreground">{alert.title}</h5>
                                            <p className="text-xs text-muted-foreground">{alert.desc}</p>
                                        </div>
                                        <Switch
                                            checked={!!(alerts as any)[alert.id]}
                                            onCheckedChange={(val) => updateAlerts({ [alert.id]: val })}
                                            className="scale-90 data-[state=checked]:bg-beeyield-green"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Delivery */}
                        <div className={cn(glass.card, "p-0 overflow-hidden bg-muted/30 backdrop-blur-xl border-border rounded-[2.5rem] shadow-xl")}>
                            <div className="p-4 border-b border-blue-500/10 bg-blue-500/[0.02] flex flex-wrap items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-card flex items-center justify-center border border-gray-100 shadow-sm">
                                    <Smartphone className="w-4 h-4 text-blue-500" />
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="text-sm font-bold text-foreground leading-none">Where to send alerts</h4>
                                    <p className="text-xs text-muted-foreground">Choose your alert channels.</p>
                                </div>
                            </div>
                            <div className="p-5 space-y-3">
                                {DELIVERY_ALERTS.map((alert) => (
                                    <div key={alert.id} className="flex items-center justify-between p-3 rounded-xl border border-border/40 hover:border-blue-500/30 bg-card/30 hover:bg-muted/50 transition-colors group">
                                        <div className="space-y-0.5">
                                            <h5 className="text-xs font-semibold text-foreground">{alert.title}</h5>
                                            <p className="text-xs text-muted-foreground">{alert.desc}</p>
                                        </div>
                                        <Switch
                                            checked={!!(alerts as any)[alert.id]}
                                            onCheckedChange={(val) => updateAlerts({ [alert.id]: val })}
                                            className="scale-90 data-[state=checked]:bg-blue-500"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center pt-2">
                        <button
                            onClick={() => handleAtomicSave("Alerts")}
                            className={glass.btnPrimary}
                        >
                            Save alerts
                        </button>
                    </div>
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            className={cn(glass.card, "p-6 bg-muted/30 backdrop-blur-xl border-border rounded-[2.5rem] shadow-xl relative overflow-hidden group")}
                        >
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 blur-3xl rounded-full" />
                            <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-gray-100 mb-5 shadow-sm group-hover:bg-card transition-colors">
                                <Key className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="text-sm font-bold text-foreground leading-none mb-3">Access</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed mb-6 max-w-sm border-l-2 border-border/ pl-3">
                                Manage access settings for this account.
                            </p>
                            <button className={glass.btnSecondary}>
                                Create access link
                            </button>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            className={cn(glass.card, "p-6 bg-muted/30 backdrop-blur-xl border-red-500/10 rounded-[2.5rem] shadow-xl relative overflow-hidden group")}
                        >
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-500/5 blur-3xl rounded-full" />
                            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center border border-red-100 mb-5 shadow-sm group-hover:bg-card transition-colors">
                                <Trash2 className="w-5 h-5 text-red-500" />
                            </div>
                            <h3 className="text-sm font-bold tracking-tight text-red-500 leading-none mb-3">Delete account</h3>
                            <p className="text-xs text-red-500/70 leading-relaxed mb-6 max-w-sm border-l-2 border-red-500/40 pl-3">
                                This permanently deletes your account and removes your data.
                            </p>
                            <button className={cn(glass.btnPrimary, "bg-red-500 text-white hover:bg-red-600 border-red-600 w-full")}>
                                <Shield className="w-4 h-4" />
                                Delete account
                            </button>
                        </motion.div>
                    </div>
                </TabsContent>

                <TabsContent value="billing" className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(glass.card, "p-0 overflow-hidden bg-muted/30 backdrop-blur-xl border-border rounded-[2.5rem] shadow-xl")}
                    >
                        <div className="p-5 border-b border-border/50 bg-primary[0.02] flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-card flex items-center justify-center border border-gray-100 shadow-sm">
                                    <CreditCard className="w-4 h-4 text-primary" />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-sm font-bold text-foreground leading-none">Billing</h3>
                                    <p className="text-xs text-muted-foreground">Cards, payments, and invoices.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={loadBilling}
                                    className={cn(glass.btnSecondary, "h-9 px-4")}
                                    disabled={billingLoading}
                                >
                                    {billingLoading ? 'SYNCING…' : 'Refresh'}
                                </button>
                                <Badge className="bg-muted/30 text-muted-foreground border-border/40 rounded-lg font-semibold text-xs px-2 py-0.5">
                                    Secured by Stripe
                                </Badge>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {BILLING_FIELDS.map((k) => (
                                    <div key={k.label} className="p-4 rounded-2xl border border-border/40 bg-card/30 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <p className="text-xs text-muted-foreground">{k.label}</p>
                                                <p className="text-lg font-black text-foreground tabular-nums">
                                                    KES {Number((billingOverview as any)?.[k.key] || 0).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className={cn("w-9 h-9 rounded-xl bg-card flex items-center justify-center border border-gray-100 shadow-sm", k.color)}>
                                                <k.icon className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Cards */}
                                <div className="lg:col-span-5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <h4 className="text-sm font-bold text-foreground">Payment cards</h4>
                                            <p className="text-xs text-muted-foreground">Saved methods</p>
                                        </div>

                                        <button 
                                            className={cn(glass.btnPrimary, "h-9 px-4")}
                                            onClick={() => {
                                                setIsAddCardOpen(true);
                                                void ensureStripeCardForm();
                                            }}
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Card
                                        </button>

                                        <GlassModal
                                            isOpen={isAddCardOpen}
                                            onClose={() => setIsAddCardOpen(false)}
                                            title="Add Payment Card"
                                            subtitle="Card data is encrypted and processed securely by Stripe."
                                        >
                                            <div className="pt-2">
                                                {StripeCardFormComp ? (
                                                    <StripeCardFormComp
                                                        mode="save"
                                                        onSuccess={async (result: any) => {
                                                            try {
                                                                if (result?.paymentMethodId) {
                                                                    await waitForVaultedPaymentMethod(result.paymentMethodId);
                                                                }
                                                                toast.success('Card saved to vault');
                                                                setIsAddCardOpen(false);
                                                                await loadBilling();
                                                            } catch (error) {
                                                                console.error(error);
                                                                toast.error('Card verified, but vault sync is still pending');
                                                                await loadBilling();
                                                            }
                                                        }}
                                                        onError={(error: any) => {
                                                            console.error('Stripe error:', error);
                                                            const msg = error?.message || String(error) || 'Stripe error';
                                                            setPageError(msg);
                                                            toast.error(msg);
                                                        }}
                                                        buttonText="Verify & Vault"
                                                    />
                                                ) : (
                                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                                        Loading secure card form…
                                                    </div>
                                                )}
                                            </div>
                                        </GlassModal>
                                    </div>

                                    <div className="space-y-3">
                                        {paymentMethods.length === 0 ? (
                                            <div className="p-5 rounded-2xl border border-dashed border-border/ bg-card/20 text-center">
                                                <p className="text-sm font-semibold text-muted-foreground/90">No saved cards</p>
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    Add a card to speed up upgrades and invoice payments.
                                                </p>
                                            </div>
                                        ) : (
                                            paymentMethods.map((pm) => (
                                                <div
                                                    key={pm.id}
                                                    className="p-4 rounded-2xl border border-border/40 bg-gradient-to-br from-[#111827] to-[#0B1220] text-white relative overflow-hidden"
                                                >
                                                    <div className="absolute top-5 left-5 w-10 h-8 rounded bg-gradient-to-br from-amber-300 to-amber-500 opacity-80" />
                                                    {(pm.is_default || pm.isDefault) && (
                                                        <Badge className="absolute top-4 left-20 bg-primary text-foreground rounded-full px-3 py-1 text-xs font-semibold">
                                                            Default
                                                        </Badge>
                                                    )}
                                                    <button
                                                        className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-card/10 hover:bg-card/20 flex items-center justify-center border border-border/"
                                                        onClick={async () => {
                                                            try {
                                                                await deletePaymentMethod(pm.id);
                                                                toast.success('Card removed');
                                                                await loadBilling();
                                                            } catch (e) {
                                                                console.error(e);
                                                                toast.error('Failed to remove card');
                                                            }
                                                        }}
                                                        title="Remove card"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                    <div className="pt-12 space-y-6">
                                                        <p className="text-xl font-mono">
                                                            •••• •••• •••• {pm.last4 || '----'}
                                                        </p>
                                                        <div className="flex items-end justify-between gap-4">
                                                            <div className="min-w-0">
                                                                <p className="text-xs text-white/60 mb-1">Card holder</p>
                                                                <p className="text-sm font-bold truncate max-w-[160px]">{pm.card_holder_name || user?.email || 'Customer'}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs text-white/60 mb-1">Valid thru</p>
                                                                <p className="text-sm font-bold tabular-nums">
                                                                    {String(pm.expiry_month ?? '').padStart(2, '0')}/{pm.expiry_year ?? '—'}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-lg font-black tracking-tight">{pm.provider || 'Card'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Payment history */}
                                <div className="lg:col-span-7 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <h4 className="text-sm font-bold text-foreground">Payment history</h4>
                                            <p className="text-xs text-muted-foreground">Recent transactions</p>
                                        </div>
                                        <Badge className="bg-muted/30 text-muted-foreground border-border/40 rounded-lg font-black text-[8px] px-2 py-0.5">
                                            Last 50
                                        </Badge>
                                    </div>

                                    <div className="rounded-2xl border border-border/40 bg-card/30 overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/30">
                                                    <TableHead className="text-xs font-semibold text-muted-foreground">Date</TableHead>
                                                    <TableHead className="text-xs font-semibold text-muted-foreground">Type</TableHead>
                                                    <TableHead className="text-xs font-semibold text-muted-foreground">Amount</TableHead>
                                                    <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
                                                    <TableHead className="text-xs font-semibold text-muted-foreground text-right">Details</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {transactions.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="text-center py-10">
                                                            <div className="opacity-40 space-y-2">
                                                                <Clock className="w-6 h-6 mx-auto text-muted-foreground" />
                                                                <p className="text-sm font-semibold text-muted-foreground/90">No transactions yet</p>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    transactions.slice(0, 12).map((tx, idx) => (
                                                        <TableRow
                                                            key={(tx.id || idx) as any}
                                                            className="cursor-pointer hover:bg-muted/50"
                                                            onClick={() => setSelectedTx(tx)}
                                                        >
                                                            <TableCell className="text-[10px] font-bold text-muted-foreground/90">
                                                                {tx.date ? new Date(tx.date).toLocaleDateString() : '—'}
                                                            </TableCell>
                                                            <TableCell className="text-xs font-semibold">
                                                                <span className={cn(
                                                                    "px-2 py-1 rounded-lg border text-xs font-semibold",
                                                                    tx.type === 'income'
                                                                        ? "bg-beeyield-green/10 text-beeyield-green border-beeyield-green/20"
                                                                        : "bg-red-500/10 text-red-500 border-red-500/20"
                                                                )}>
                                                                    {tx.type || '—'}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-[10px] font-black tabular-nums text-foreground">
                                                                {(tx.currency || 'KES').toUpperCase()} {Number(tx.amount || 0).toLocaleString()}
                                                            </TableCell>
                                                            <TableCell className="text-xs font-semibold text-muted-foreground">
                                                                {tx.status || tx.etims_status || '—'}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <button className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:text-foreground">
                                                                    View <ExternalLink className="w-3.5 h-3.5" />
                                                                </button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    <GlassModal 
                                        isOpen={!!selectedTx} 
                                        onClose={() => setSelectedTx(null)}
                                        title="Payment Details"
                                        subtitle="Ledger record with metadata and compliance status."
                                    >
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="p-3 rounded-xl border border-primary/20 bg-muted/30">
                                                    <p className="text-xs font-semibold text-muted-foreground">Amount</p>
                                                    <p className="text-sm font-black tabular-nums text-foreground">
                                                        {(selectedTx?.currency || 'KES').toUpperCase()} {Number(selectedTx?.amount || 0).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="p-3 rounded-xl border border-primary/20 bg-muted/30">
                                                    <p className="text-xs font-semibold text-muted-foreground">Type</p>
                                                    <p className="text-sm font-semibold text-foreground">
                                                        {selectedTx?.type || '—'}
                                                    </p>
                                                </div>
                                                <div className="p-3 rounded-xl border border-primary/20 bg-muted/30">
                                                    <p className="text-xs font-semibold text-muted-foreground">Status</p>
                                                    <p className="text-sm font-semibold text-foreground">
                                                        {selectedTx?.status || selectedTx?.etims_status || '—'}
                                                    </p>
                                                </div>
                                                <div className="p-3 rounded-xl border border-primary/20 bg-muted/30">
                                                    <p className="text-xs font-semibold text-muted-foreground">Date</p>
                                                    <p className="text-sm font-black text-foreground">
                                                        {selectedTx?.date ? new Date(selectedTx.date).toLocaleString() : '—'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="p-4 rounded-xl border border-primary/20 bg-card/30 space-y-2">
                                                <p className="text-xs font-semibold text-muted-foreground">Description</p>
                                                <p className="text-[10px] font-bold text-foreground">
                                                    {selectedTx?.description || '—'}
                                                </p>
                                                {selectedTx?.category && (
                                                    <p className="text-xs font-semibold text-muted-foreground">
                                                        Category: <span className="text-foreground">{selectedTx.category}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </GlassModal>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </TabsContent>
            </Tabs>
        </BeeYieldPageShell>
    );
};

export default SettingsView;


