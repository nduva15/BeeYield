import React from 'react';
import {
    User, Shield, Bell, Globe, Lock, MapPin, Activity, Save, Trash2, Key, Smartphone, Layers, Hexagon, Cpu, ShieldCheck, Check,
    Settings, LogOut, ChevronRight, Palette, Fingerprint
} from 'lucide-react';
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
import { glass, PageHeader } from './GlassTheme';
import { Input } from '@/components/ui/input';

interface SettingsViewProps {
    onTabChange?: (tab: string, message?: string, action?: string) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onTabChange }) => {
    const { user, signOut } = useAuth();
    const { theme, setTheme } = useTheme();
    const { moduleFlags, updateModuleFlags, alerts, updateAlerts, resetWorkspace, syncToBackend, isSyncing } = useSettings();
    const [mounted, setMounted] = React.useState(false);
    const [loading, setLoading] = React.useState<Record<string, boolean>>({});

    React.useEffect(() => {
        setMounted(true);
    }, []);

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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={glass.page}
        >
            <PageHeader
                icon={Settings}
                label="System Settings"
                title={<>Control <span className="text-[#F4D03F]">Center</span></>}
                subtitle="Manage your industrial identity patterns, module access permissions, and global notification routing protocols."
                actions={
                    <div className="flex items-center gap-2 bg-white/60 border border-[#F4D03F]/20 px-4 h-10 rounded-xl shadow-sm">
                        <Activity className="w-4 h-4 text-[#1B9157] animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]">Cloud Sync: <span className="text-[#1B9157]">{isSyncing ? 'SYNCING...' : 'ACTIVE'}</span></span>
                    </div>
                }
            />

            <Tabs defaultValue="identity" className="w-full space-y-6">
                <TabsList className="bg-white/40 p-1 h-9 w-full grid grid-cols-4 rounded-xl border border-white/40 backdrop-blur-xl">
                    {[
                        { value: 'identity', label: 'Identity', icon: User },
                        { value: 'modules', label: 'Modules', icon: Layers },
                        { value: 'alerts', label: 'Alerting', icon: Bell },
                        { value: 'security', label: 'Security', icon: ShieldCheck },
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
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={cn(glass.card, "text-center flex flex-col items-center justify-center py-8 px-6 bg-white/40 backdrop-blur-xl border-white/20 rounded-[2.5rem] shadow-xl relative overflow-hidden")}
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
                                <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-widest mt-6">Autonomous Identity</h3>
                                <p className="text-xs font-bold text-[#1B9157] uppercase tracking-widest mt-1">Verified Hash</p>
                                <button className={cn(glass.btnPrimary, "mt-6 w-full")}>
                                    Update Biometrics
                                </button>
                            </motion.div>

                            <div className={cn(glass.card, "p-5 bg-white/40 backdrop-blur-xl border-white/20 rounded-[2.5rem] shadow-xl")}>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <Palette className="w-3.5 h-3.5 text-[#F4D03F]" />
                                            <h4 className="text-[10px] font-black text-[#1A1A1A] tracking-[0.2em] uppercase">Interface_Skin</h4>
                                        </div>
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">TOGGLE_VISUAL_KERNEL</p>
                                    </div>
                                    <Switch
                                        checked={theme === 'dark'}
                                        onCheckedChange={(c) => setTheme(c ? 'dark' : 'light')}
                                        className="scale-90 data-[state=checked]:bg-[#1B9157]"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => signOut()}
                                className={cn(glass.btnSecondary, "w-full border-red-500/10 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white")}
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Terminate Session
                            </button>
                        </div>

                        {/* Audit Form */}
                        <div className="lg:col-span-8">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={cn(glass.card, "p-0 overflow-hidden bg-white/40 backdrop-blur-xl border-white/20 rounded-[2.5rem] shadow-xl")}
                            >
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
                                        <div className="space-y-2 group">
                                            <Label className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-widest ml-1">Full Name</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input className={cn(glass.input, "pl-10 w-full font-bold bg-white/50")} placeholder="e.g. Timothy Nduva" />
                                            </div>
                                        </div>
                                        <div className="space-y-2 group">
                                            <Label className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-widest ml-1">Verified Email</Label>
                                            <div className="relative">
                                                <Input className={cn(glass.input, "pl-4 pr-10 w-full font-bold text-gray-500 bg-gray-100 cursor-not-allowed")} defaultValue={user?.email || ""} disabled />
                                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            </div>
                                        </div>
                                        <div className="space-y-2 group">
                                            <Label className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-widest ml-1">Phone Number</Label>
                                            <div className="relative">
                                                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input className={cn(glass.input, "pl-10 w-full font-bold bg-white/50")} placeholder="+254 7XX XXX XXX" />
                                            </div>
                                        </div>
                                        <div className="space-y-2 group">
                                            <Label className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-widest ml-1">Physical Sector</Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input className={cn(glass.input, "pl-10 w-full font-bold bg-white/50")} placeholder="Kibwezi, Kenya" />
                                            </div>
                                        </div>
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
                            <h3 className="text-[11px] font-black tracking-[0.3em] text-[#1A1A1A] uppercase leading-none mb-3">Vault_Integrity</h3>
                            <p className="text-[9px] font-black text-gray-400 leading-relaxed mb-6 max-w-sm border-l-2 border-[#F4D03F]/40 pl-3 uppercase">
                                Traceability Level 4 enabled. Kernel sessions are secured via cryptographic node relay. Generate ephemeral access pulses for third-party analysis.
                            </p>
                            <button className={glass.btnSecondary}>
                                Initialize Access Pulse
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
                            <h3 className="text-[11px] font-black tracking-[0.3em] text-red-500 uppercase leading-none mb-3">Identity_Termination</h3>
                            <p className="text-[9px] font-black text-red-500/60 leading-relaxed mb-6 max-w-sm border-l-2 border-red-500/40 pl-3 uppercase">
                                CRITICAL: Irreversibly destroy industrial hash identity, historical apiary metadata, and all node linkage records.
                            </p>
                            <button className={cn(glass.btnPrimary, "bg-red-500 text-white hover:bg-red-600 border-red-600 w-full")}>
                                <Shield className="w-4 h-4" />
                                Initiate Absolute Purge
                            </button>
                        </motion.div>
                    </div>
                </TabsContent>
            </Tabs>
        </motion.div>
    );
};

export default SettingsView;
