import React from 'react';
import {
    User, Shield, Bell, Globe, Lock as LockIcon, MapPin, Activity, Save, Trash2, Key, Smartphone, Layers, Hexagon, Cpu, ShieldCheck, Check,
    Settings, LogOut, ChevronRight, Palette, Fingerprint, CreditCard, Receipt, Plus, XCircle, ExternalLink, Clock, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';
import { useSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { glass } from './GlassTheme';
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
import { StripeCardForm } from '@/components/payments/StripeCardForm';
import { deletePaymentMethod, getPaymentMethods, saveStripePaymentMethod } from '@/services/shopService';
import beeyieldService from '@/services/beeyieldService';
import {
    BeeYieldCard,
    BeeYieldFormField,
    BeeYieldPageHeader,
    BeeYieldPageShell,
    BeeYieldTextInput,
} from '@/components/beeyield/BeeYieldUI';

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

type BillingTx = {
    id?: string;
    date?: string;
    description?: string;
    amount?: number;
    currency?: string;
    type?: 'income' | 'expense' | string;
    category?: string;
    status?: string;
    payment_method?: string;
    metadata?: any;
    etims_status?: string;
    etims_qr_url?: string | null;
};

const SettingsView: React.FC<SettingsViewProps> = ({ onTabChange }) => {
    const { user, signOut } = useAuth();
    const { theme, setTheme } = useTheme();
    const { moduleFlags, updateModuleFlags, alerts, updateAlerts, resetWorkspace, syncToBackend, isSyncing } = useSettings();
    const [mounted, setMounted] = React.useState(false);
    const [loading, setLoading] = React.useState<Record<string, boolean>>({});
    const [activeTab, setActiveTab] = React.useState('identity');

    // Billing
    const [billingLoading, setBillingLoading] = React.useState(false);
    const [paymentMethods, setPaymentMethods] = React.useState<SavedPaymentMethod[]>([]);
    const [billingOverview, setBillingOverview] = React.useState<any>(null);
    const [transactions, setTransactions] = React.useState<BillingTx[]>([]);
    const [selectedTx, setSelectedTx] = React.useState<BillingTx | null>(null);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const loadBilling = React.useCallback(async () => {
        setBillingLoading(true);
        try {
            const [methods, overview, txs] = await Promise.all([
                getPaymentMethods().catch(() => []),
                beeyieldService.getBillingOverview().catch(() => null),
                beeyieldService.getTransactions().catch(() => []),
            ]);
            setPaymentMethods((methods || []) as SavedPaymentMethod[]);
            setBillingOverview(overview);
            setTransactions((txs || []) as BillingTx[]);
        } finally {
            setBillingLoading(false);
        }
    }, []);

    React.useEffect(() => {
        if (activeTab === 'billing') {
            loadBilling();
        }
    }, [activeTab, loadBilling]);

    const handleAtomicSave = async (section: string) => {
        setLoading(prev => ({ ...prev, [section]: true }));
        try {
            await syncToBackend();
            toast.success(`${section} Registry Synchronized`, {
                description: "Settings committed to BeeYield Global Registry",
                icon: <Check className="w-4 h-4 text-[#1B9157]" />
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(prev => ({ ...prev, [section]: false }));
        }
    };

    if (!mounted) return null;

    return (
        <BeeYieldPageShell>
            <BeeYieldPageHeader
                icon={Settings}
                label="Settings"
                title={<>Control <span className="text-[#F4D03F]">Center</span></>}
                subtitle="Manage your account, modules, alerts, and security settings."
                actions={
                    <div className="flex items-center gap-2 bg-white/60 border border-[#F4D03F]/20 px-4 h-10 rounded-xl shadow-sm">
                        <Activity className="w-4 h-4 text-[#1B9157] animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]">Sync: <span className="text-[#1B9157]">{isSyncing ? 'Syncing…' : 'On'}</span></span>
                    </div>
                }
            />

            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full space-y-6"
            >
                <TabsList className="bg-white/40 p-1 h-9 w-full grid grid-cols-5 rounded-xl border border-white/40 backdrop-blur-xl">
                    {[
                        { value: 'identity', label: 'Identity', icon: User },
                        { value: 'modules', label: 'Modules', icon: Layers },
                        { value: 'alerts', label: 'Alerting', icon: Bell },
                        { value: 'security', label: 'Security', icon: ShieldCheck },
                        { value: 'billing', label: 'Billing', icon: CreditCard },
                    ].map(tab => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="h-full rounded-lg font-black uppercase text-[9px] tracking-[0.15em] text-gray-400 data-[state=active]:bg-white data-[state=active]:text-[#1A1A1A] data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-white/40 transition-all flex items-center justify-center gap-1.5"
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
                                        "text-center flex flex-col items-center justify-center py-8 px-6 bg-white/40 backdrop-blur-xl border-white/20 rounded-[2.5rem] shadow-xl relative overflow-hidden"
                                    )}
                                >
                                <div className="absolute -top-6 -left-6 opacity-[0.03] pointer-events-none">
                                    <Fingerprint className="w-32 h-32" />
                                </div>
                                <div className="w-20 h-20 rounded-full border-4 border-white/40 bg-[#F4D03F]/10 p-1 flex items-center justify-center relative shadow-sm group">
                                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center border border-gray-100 overflow-hidden">
                                        <User className="w-8 h-8 text-[#1A1A1A] group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div className="absolute bottom-0 right-0 bg-[#1B9157] text-white p-1 rounded-full border-2 border-white shadow-sm">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                                <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-widest mt-6">Account</h3>
                                <p className="text-xs font-bold text-[#1B9157] uppercase tracking-widest mt-1">Verified</p>
                                <button className={cn(glass.btnPrimary, "mt-6 w-full")}>
                                    Update profile
                                </button>
                                </BeeYieldCard>
                            </motion.div>

                            <BeeYieldCard className={cn("p-5 bg-white/40 backdrop-blur-xl border-white/20 rounded-[2.5rem] shadow-xl")}>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <Palette className="w-3.5 h-3.5 text-[#F4D03F]" />
                                            <h4 className="text-[10px] font-black text-[#1A1A1A] tracking-[0.2em] uppercase">Theme</h4>
                                        </div>
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Light / dark</p>
                                    </div>
                                    <Switch
                                        checked={theme === 'dark'}
                                        onCheckedChange={(c) => setTheme(c ? 'dark' : 'light')}
                                        className="scale-90 data-[state=checked]:bg-[#1B9157]"
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
                                className={cn("p-0 overflow-hidden bg-white/40 backdrop-blur-xl border-white/20 rounded-[2.5rem] shadow-xl")}
                            >
                                <BeeYieldCard padded={false} className={cn("p-0 overflow-hidden bg-white/40 backdrop-blur-xl border-white/20 rounded-[2.5rem] shadow-xl")}>
                                    <div className="p-5 border-b border-[#F4D03F]/10 bg-[#F4D03F]/[0.02] flex items-center justify-between flex-wrap gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center border border-gray-100 shadow-sm">
                                                <Globe className="w-4 h-4 text-[#F4D03F]" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <h2 className="text-[11px] font-black text-[#1A1A1A] tracking-[0.3em] uppercase leading-none">Profile_Audit</h2>
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">GLOBAL_REGISTRY_METADATA</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-white/40 text-gray-500 border-white/40 rounded-lg font-black text-[8px] uppercase tracking-widest px-2 py-0.5">ARCHIVED_V5</Badge>
                                    </div>

                                    <div className="p-6 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <BeeYieldFormField id="by_full_name" label="Full Name">
                                                <BeeYieldTextInput
                                                    id="by_full_name"
                                                    icon={User}
                                                    placeholder="e.g. Timothy Nduva"
                                                    className="w-full"
                                                    inputClassName="w-full font-bold bg-white/50"
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    disabled={profileLoading}
                                                />
                                            </BeeYieldFormField>

                                            <BeeYieldFormField id="by_email" label="Verified Email">
                                                <div className="relative">
                                                    <Input id="by_email" className={cn(glass.input, "pl-4 pr-10 w-full font-bold text-gray-500 bg-gray-100 cursor-not-allowed")} defaultValue={user?.email || ""} disabled />
                                                    <LockIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                </div>
                                            </BeeYieldFormField>

                                            <BeeYieldFormField id="by_phone" label="Phone Number">
                                                <BeeYieldTextInput
                                                    id="by_phone"
                                                    icon={Smartphone}
                                                    placeholder="+254 7XX XXX XXX"
                                                    className="w-full"
                                                    inputClassName="w-full font-bold bg-white/50"
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
                                                    inputClassName="w-full font-bold bg-white/50"
                                                    value={locationName}
                                                    onChange={(e) => setLocationName(e.target.value)}
                                                    disabled={profileLoading}
                                                />
                                            </BeeYieldFormField>
                                        </div>

                                        <div className="pt-6 border-t border-[#F4D03F]/10 flex flex-col sm:flex-row justify-between items-center sm:items-start md:items-center gap-4">
                                            <div className="flex items-center gap-2 text-[#1B9157]">
                                                <Activity className="w-5 h-5 animate-pulse" />
                                                <p className="text-xs font-bold uppercase tracking-widest">STATUS: NOMINAL</p>
                                            </div>
                                            <button
                                                onClick={() => handleAtomicSave("Profile")}
                                                disabled={loading["Profile"]}
                                                className={cn(glass.btnPrimary, "w-full sm:w-auto", loading["Profile"] && "opacity-70 cursor-not-allowed")}
                                            >
                                                {loading["Profile"] ? 'SYNCING...' : 'COMMIT CHANGES'}
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
                        className={cn(glass.card, "p-0 overflow-hidden bg-white/40 backdrop-blur-xl border-white/20 rounded-[2.5rem] shadow-xl")}
                    >
                        <div className="p-5 border-b border-[#F4D03F]/10 bg-[#F4D03F]/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center border border-gray-100 shadow-sm">
                                    <Layers className="w-4 h-4 text-[#F4D03F]" />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-[11px] font-black text-[#1A1A1A] tracking-[0.3em] uppercase leading-none">Module_Topography</h3>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">CUSTOM_HARDWARE_SOFTWARE_ROUTING</p>
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
                                {[
                                    { id: 'beehives', label: 'Commercial Apiaries', desc: 'Main telemetry flow for hive health.', icon: Hexagon, color: 'text-[#F4D03F]' },
                                    { id: 'agro', label: 'Meteo & Bloom', desc: 'Satellite weather analytics.', icon: Globe, color: 'text-[#1B9157]' },
                                    { id: 'trackers', label: 'Auxiliary Hardware', desc: 'Solar node vitals & telemetry.', icon: Cpu, color: 'text-blue-500' },
                                    { id: 'patients', label: 'Biometric Lab', desc: 'Advanced veterinary disease analysis.', icon: Activity, color: 'text-red-500' }
                                ].map((mod, idx) => (
                                    <motion.div
                                        key={mod.id}
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-3.5 rounded-xl border border-white/40 bg-white/30 flex items-start justify-between group hover:bg-white/60 hover:border-[#F4D03F]/30 hover:shadow-sm transition-all"
                                    >
                                        <div className="flex gap-3">
                                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border border-gray-100 bg-white shadow-sm transition-transform group-hover:scale-105", mod.color)}>
                                                <mod.icon className="w-4 h-4" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <h4 className="text-[10px] font-black text-[#1A1A1A] tracking-tight uppercase">{mod.label}</h4>
                                                <p className="text-[9px] font-black text-gray-400 max-w-[200px] leading-relaxed uppercase">{mod.desc}</p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={!!(moduleFlags as any)[mod.id]}
                                            onCheckedChange={(val) => updateModuleFlags({ [mod.id]: val })}
                                            className="scale-90 data-[state=checked]:bg-[#1B9157]"
                                        />
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => handleAtomicSave("Modules")}
                                    className={glass.btnPrimary}
                                >
                                    Save Feature Map
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </TabsContent>

                <TabsContent value="alerts" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Internal Telemetry */}
                        <div className={cn(glass.card, "p-0 overflow-hidden bg-white/40 backdrop-blur-xl border-white/20 rounded-[2.5rem] shadow-xl")}>
                            <div className="p-4 border-b border-[#F4D03F]/10 bg-[#F4D03F]/[0.02] flex flex-wrap items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center border border-gray-100 shadow-sm">
                                    <Bell className="w-4 h-4 text-[#F4D03F]" />
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="text-[10px] font-black text-[#1A1A1A] tracking-[0.3em] uppercase leading-none">Internal_Telemetry</h4>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">ANOMALIES_GUIDANCE</p>
                                </div>
                            </div>
                            <div className="p-5 space-y-3">
                                {[
                                    { id: 'aiAnomalies', title: 'Neural Data Drift', desc: 'Predictive sensor spikes.', color: 'emerald-500' },
                                    { id: 'swarmRisk', title: 'Swarm Frequency', desc: 'Acoustic pattern matching.', color: 'amber-500' },
                                    { id: 'onboardingHints', title: 'Contextual AI Hints', desc: 'Real-time guidance pulses.', color: 'blue-500' },
                                ].map((alert) => (
                                    <div key={alert.id} className="flex items-center justify-between p-3 rounded-xl border border-white/40 hover:border-[#F4D03F]/30 bg-white/30 hover:bg-white/60 transition-colors group">
                                        <div className="space-y-0.5">
                                            <h5 className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-tight">{alert.title}</h5>
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{alert.desc}</p>
                                        </div>
                                        <Switch
                                            checked={!!(alerts as any)[alert.id]}
                                            onCheckedChange={(val) => updateAlerts({ [alert.id]: val })}
                                            className="scale-90 data-[state=checked]:bg-[#1B9157]"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* External Routing */}
                        <div className={cn(glass.card, "p-0 overflow-hidden bg-white/40 backdrop-blur-xl border-white/20 rounded-[2.5rem] shadow-xl")}>
                            <div className="p-4 border-b border-blue-500/10 bg-blue-500/[0.02] flex flex-wrap items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center border border-gray-100 shadow-sm">
                                    <Smartphone className="w-4 h-4 text-blue-500" />
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="text-[10px] font-black text-[#1A1A1A] tracking-[0.3em] uppercase leading-none">External_Routing</h4>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">DIRECT_PUSH_PROTOCOLS</p>
                                </div>
                            </div>
                            <div className="p-5 space-y-3">
                                {[
                                    { id: 'malfunction', title: 'Hardware Panic', desc: 'Critical sensor failure alerts.', color: 'red-500' },
                                    { id: 'lowBattery', title: 'Energy Hub Vitals', desc: 'Low power threshold pulses.', color: 'blue-500' },
                                    { id: 'marketing', title: 'Boutique Intelligence', desc: 'Retail pricing updates.', color: 'amber-500' },
                                ].map((alert) => (
                                    <div key={alert.id} className="flex items-center justify-between p-3 rounded-xl border border-white/40 hover:border-blue-500/30 bg-white/30 hover:bg-white/60 transition-colors group">
                                        <div className="space-y-0.5">
                                            <h5 className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-tight">{alert.title}</h5>
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{alert.desc}</p>
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
                            Save Alert Topology
                        </button>
                    </div>
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            className={cn(glass.card, "p-6 bg-white/40 backdrop-blur-xl border-white/20 rounded-[2.5rem] shadow-xl relative overflow-hidden group")}
                        >
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#F4D03F]/5 blur-3xl rounded-full" />
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-gray-100 mb-5 shadow-sm group-hover:bg-white transition-colors">
                                <Key className="w-5 h-5 text-[#F4D03F]" />
                            </div>
                            <h3 className="text-[11px] font-black tracking-[0.3em] text-[#1A1A1A] uppercase leading-none mb-3">Access</h3>
                            <p className="text-[9px] font-black text-gray-400 leading-relaxed mb-6 max-w-sm border-l-2 border-[#F4D03F]/40 pl-3 uppercase">
                                Manage access settings for this account.
                            </p>
                            <button className={glass.btnSecondary}>
                                Create access link
                            </button>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            className={cn(glass.card, "p-6 bg-white/40 backdrop-blur-xl border-red-500/10 rounded-[2.5rem] shadow-xl relative overflow-hidden group")}
                        >
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-500/5 blur-3xl rounded-full" />
                            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center border border-red-100 mb-5 shadow-sm group-hover:bg-white transition-colors">
                                <Trash2 className="w-5 h-5 text-red-500" />
                            </div>
                            <h3 className="text-[11px] font-black tracking-[0.3em] text-red-500 uppercase leading-none mb-3">Delete account</h3>
                            <p className="text-[9px] font-black text-red-500/60 leading-relaxed mb-6 max-w-sm border-l-2 border-red-500/40 pl-3 uppercase">
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
                        className={cn(glass.card, "p-0 overflow-hidden bg-white/40 backdrop-blur-xl border-white/20 rounded-[2.5rem] shadow-xl")}
                    >
                        <div className="p-5 border-b border-[#F4D03F]/10 bg-[#F4D03F]/[0.02] flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center border border-gray-100 shadow-sm">
                                    <CreditCard className="w-4 h-4 text-[#F4D03F]" />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-[11px] font-black text-[#1A1A1A] tracking-[0.3em] uppercase leading-none">Billing_Registry</h3>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">CARDS_HISTORY_TRANSACTIONS_INVOICES</p>
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
                                <Badge className="bg-white/40 text-gray-500 border-white/40 rounded-lg font-black text-[8px] uppercase tracking-widest px-2 py-0.5">
                                    STRIPE_SECURED
                                </Badge>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { label: 'Revenue', value: billingOverview?.total_revenue ?? 0, icon: Receipt, color: 'text-[#1B9157]' },
                                    { label: 'Costs', value: billingOverview?.total_costs ?? 0, icon: ArrowDownRight, color: 'text-red-500' },
                                    { label: 'Net', value: billingOverview?.net_result ?? 0, icon: ArrowUpRight, color: 'text-[#F4D03F]' },
                                ].map((k) => (
                                    <div key={k.label} className="p-4 rounded-2xl border border-white/40 bg-white/30 hover:bg-white/60 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{k.label}</p>
                                                <p className="text-lg font-black text-[#1A1A1A] tabular-nums">
                                                    KES {Number(k.value || 0).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className={cn("w-9 h-9 rounded-xl bg-white flex items-center justify-center border border-gray-100 shadow-sm", k.color)}>
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
                                            <h4 className="text-[10px] font-black text-[#1A1A1A] tracking-[0.3em] uppercase">Payment_Cards</h4>
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">SAVED_METHODS</p>
                                        </div>

                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <button className={cn(glass.btnPrimary, "h-9 px-4")}>
                                                    <Plus className="w-4 h-4" />
                                                    Add Card
                                                </button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle className="flex items-center gap-2">
                                                        <CreditCard className="h-5 w-5 text-[#F4D03F]" />
                                                        Add Payment Card
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        Card data is encrypted and processed securely by Stripe.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="pt-2">
                                                    <StripeCardForm
                                                        mode="save"
                                                        onSuccess={async (paymentMethod) => {
                                                            try {
                                                                await saveStripePaymentMethod(paymentMethod.id, {
                                                                    last4: paymentMethod.last4,
                                                                    brand: paymentMethod.brand,
                                                                    exp_month: paymentMethod.exp_month,
                                                                    exp_year: paymentMethod.exp_year,
                                                                });
                                                                toast.success('Card saved');
                                                                await loadBilling();
                                                            } catch (error) {
                                                                console.error(error);
                                                                toast.error('Failed to save card');
                                                            }
                                                        }}
                                                        onError={(error) => {
                                                            console.error('Stripe error:', error);
                                                        }}
                                                        buttonText="Save Card Securely"
                                                    />
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>

                                    <div className="space-y-3">
                                        {paymentMethods.length === 0 ? (
                                            <div className="p-5 rounded-2xl border border-dashed border-white/50 bg-white/20 text-center">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">NO_CARDS_ON_FILE</p>
                                                <p className="text-[9px] font-bold text-gray-500 mt-2">
                                                    Add a card to speed up upgrades and invoice payments.
                                                </p>
                                            </div>
                                        ) : (
                                            paymentMethods.map((pm) => (
                                                <div
                                                    key={pm.id}
                                                    className="p-4 rounded-2xl border border-white/40 bg-gradient-to-br from-[#111827] to-[#0B1220] text-white relative overflow-hidden"
                                                >
                                                    <div className="absolute top-5 left-5 w-10 h-8 rounded bg-gradient-to-br from-amber-300 to-amber-500 opacity-80" />
                                                    {(pm.is_default || pm.isDefault) && (
                                                        <Badge className="absolute top-4 left-20 bg-[#F4D03F] text-[#1A1A1A] rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest">
                                                            Default
                                                        </Badge>
                                                    )}
                                                    <button
                                                        className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center border border-white/10"
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
                                                        <p className="text-xl font-mono tracking-[0.25em]">
                                                            •••• •••• •••• {pm.last4 || '----'}
                                                        </p>
                                                        <div className="flex items-end justify-between gap-4">
                                                            <div className="min-w-0">
                                                                <p className="text-[10px] uppercase text-white/50 mb-1">Card Holder</p>
                                                                <p className="text-sm font-bold truncate max-w-[160px]">{pm.card_holder_name || user?.email || 'Customer'}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[10px] uppercase text-white/50 mb-1">Valid Thru</p>
                                                                <p className="text-sm font-bold tabular-nums">
                                                                    {String(pm.expiry_month ?? '').padStart(2, '0')}/{pm.expiry_year ?? '—'}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-lg font-black uppercase tracking-wider">{pm.provider || 'Card'}</p>
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
                                            <h4 className="text-[10px] font-black text-[#1A1A1A] tracking-[0.3em] uppercase">Payment_History</h4>
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">LEDGER_TRANSACTIONS</p>
                                        </div>
                                        <Badge className="bg-white/40 text-gray-500 border-white/40 rounded-lg font-black text-[8px] uppercase tracking-widest px-2 py-0.5">
                                            Last 50
                                        </Badge>
                                    </div>

                                    <div className="rounded-2xl border border-white/40 bg-white/30 overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-white/40">
                                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500">Date</TableHead>
                                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500">Type</TableHead>
                                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500">Amount</TableHead>
                                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500">Status</TableHead>
                                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Details</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {transactions.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="text-center py-10">
                                                            <div className="opacity-40 space-y-2">
                                                                <Clock className="w-6 h-6 mx-auto text-gray-500" />
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">NO_TRANSACTIONS</p>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    transactions.slice(0, 12).map((tx, idx) => (
                                                        <TableRow
                                                            key={(tx.id || idx) as any}
                                                            className="cursor-pointer hover:bg-white/60"
                                                            onClick={() => setSelectedTx(tx)}
                                                        >
                                                            <TableCell className="text-[10px] font-bold text-gray-600">
                                                                {tx.date ? new Date(tx.date).toLocaleDateString() : '—'}
                                                            </TableCell>
                                                            <TableCell className="text-[10px] font-black uppercase tracking-widest">
                                                                <span className={cn(
                                                                    "px-2 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest",
                                                                    tx.type === 'income'
                                                                        ? "bg-[#1B9157]/10 text-[#1B9157] border-[#1B9157]/20"
                                                                        : "bg-red-500/10 text-red-500 border-red-500/20"
                                                                )}>
                                                                    {tx.type || '—'}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-[10px] font-black tabular-nums text-[#1A1A1A]">
                                                                {(tx.currency || 'KES').toUpperCase()} {Number(tx.amount || 0).toLocaleString()}
                                                            </TableCell>
                                                            <TableCell className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                                {tx.status || tx.etims_status || '—'}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <button className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#F4D03F] hover:text-[#1A1A1A]">
                                                                    View <ExternalLink className="w-3.5 h-3.5" />
                                                                </button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    <Dialog open={!!selectedTx} onOpenChange={(o) => !o && setSelectedTx(null)}>
                                        <DialogContent className="sm:max-w-lg">
                                            <DialogHeader>
                                                <DialogTitle className="flex items-center gap-2">
                                                    <Receipt className="w-5 h-5 text-[#F4D03F]" />
                                                    Payment Details
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Ledger record with metadata and compliance status.
                                                </DialogDescription>
                                            </DialogHeader>

                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="p-3 rounded-xl border border-white/40 bg-white/40">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Amount</p>
                                                        <p className="text-sm font-black tabular-nums text-[#1A1A1A]">
                                                            {(selectedTx?.currency || 'KES').toUpperCase()} {Number(selectedTx?.amount || 0).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div className="p-3 rounded-xl border border-white/40 bg-white/40">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Type</p>
                                                        <p className="text-sm font-black uppercase tracking-widest text-[#1A1A1A]">
                                                            {selectedTx?.type || '—'}
                                                        </p>
                                                    </div>
                                                    <div className="p-3 rounded-xl border border-white/40 bg-white/40">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Status</p>
                                                        <p className="text-sm font-black uppercase tracking-widest text-[#1A1A1A]">
                                                            {selectedTx?.status || selectedTx?.etims_status || '—'}
                                                        </p>
                                                    </div>
                                                    <div className="p-3 rounded-xl border border-white/40 bg-white/40">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Date</p>
                                                        <p className="text-sm font-black text-[#1A1A1A]">
                                                            {selectedTx?.date ? new Date(selectedTx.date).toLocaleString() : '—'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="p-4 rounded-2xl border border-white/40 bg-white/30 space-y-2">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Description</p>
                                                    <p className="text-[10px] font-bold text-[#1A1A1A]">
                                                        {selectedTx?.description || '—'}
                                                    </p>
                                                    {selectedTx?.category && (
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                                                            Category: <span className="text-[#1A1A1A]">{selectedTx.category}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
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
