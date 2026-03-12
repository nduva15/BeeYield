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
    const { moduleFlags, updateModuleFlags, alerts, updateAlerts, resetWorkspace } = useSettings();
    const [mounted, setMounted] = React.useState(false);
    const [loading, setLoading] = React.useState<Record<string, boolean>>({});

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const handleAtomicSave = (section: string) => {
        setLoading(prev => ({ ...prev, [section]: true }));
        setTimeout(() => {
            setLoading(prev => ({ ...prev, [section]: false }));
            toast.success(`${section} Registry Synchronized`, {
                description: "Settings committed to BeeYield Global Registry",
                icon: <Check className="w-4 h-4 text-[#1B9157]" />
            });
        }, 1200);
    };

    if (!mounted) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, "max-w-7xl mx-auto space-y-6 pb-20 p-4 lg:p-6")}
        >
            <PageHeader
                icon={Settings}
                label="Identity & Kernel Configuration v4.4"
                title={<>System <span className="text-[#F4D03F]">Control</span></>}
                subtitle="Manage your industrial identity patterns, module access permissions, and global notification routing protocols."
                actions={
                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 px-4 py-1.5 rounded-lg shadow-sm">
                        <Activity className="w-3.5 h-3.5 text-[#1B9157] animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Kernel_Sync: <span className="text-[#1B9157]">OPTIMIZED</span></span>
                    </div>
                }
            />

            <Tabs defaultValue="identity" className="w-full space-y-6">
                <TabsList className="bg-gray-50/80 p-1 h-10 w-full grid grid-cols-4 rounded-lg border border-gray-100 backdrop-blur-xl">
                    {[
                        { value: 'identity', label: 'Identity', icon: User },
                        { value: 'modules', label: 'Modules', icon: Layers },
                        { value: 'alerts', label: 'Alerting', icon: Bell },
                        { value: 'security', label: 'Security', icon: ShieldCheck },
                    ].map(tab => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="h-full rounded-md font-bold uppercase text-[10px] tracking-wider text-gray-500 data-[state=active]:bg-white data-[state=active]:text-[#1A1A1A] data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200 transition-all flex items-center justify-center gap-1.5"
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
                                className={cn(glass.card, "text-center flex flex-col items-center justify-center py-8 px-6 bg-white relative overflow-hidden")}
                            >
                                <div className="absolute -top-6 -left-6 opacity-[0.03] pointer-events-none">
                                    <Fingerprint className="w-32 h-32" />
                                </div>
                                <div className="w-24 h-24 rounded-full border-4 border-gray-50 bg-[#F4D03F]/10 p-1 flex items-center justify-center relative shadow-sm group">
                                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center border border-gray-200 overflow-hidden">
                                        <User className="w-8 h-8 text-[#1A1A1A] group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div className="absolute bottom-0 right-0 bg-[#1B9157] text-white p-1 rounded-full border-2 border-white shadow-sm">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                                <div className="mt-6 space-y-1">
                                    <h3 className="text-xl font-bold tracking-tight text-[#1A1A1A] leading-none">Autonomous <span className="text-[#F4D03F]">Identity</span></h3>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">System Hash v4 Verified</p>
                                </div>
                                <button className={cn(glass.btnPrimary, "mt-6 w-full h-9 font-bold text-xs uppercase shadow-sm")}>
                                    Update Biometrics
                                </button>
                            </motion.div>

                            <div className={cn(glass.card, "p-5 bg-white")}>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <Palette className="w-4 h-4 text-[#F4D03F]" />
                                            <h4 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Interface Skin</h4>
                                        </div>
                                        <p className="text-[10px] font-medium text-gray-500">Toggle visual kernel state</p>
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
                                className={cn(glass.btnSecondary, "w-full h-10 border-red-100 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 font-bold text-xs uppercase flex items-center justify-center gap-2 group transition-all")}
                            >
                                <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                                Terminate Session
                            </button>
                        </div>

                        {/* Audit Form */}
                        <div className="lg:col-span-8">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={cn(glass.card, "p-0 overflow-hidden bg-white")}
                            >
                                <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-gray-200 shadow-sm">
                                            <Globe className="w-5 h-5 text-[#F4D03F]" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <h2 className="text-lg font-bold text-[#1A1A1A] tracking-tight leading-none">Profile <span className="text-[#F4D03F]">Audit</span></h2>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Global Registry Metadata Protocol</p>
                                        </div>
                                    </div>
                                    <Badge className="bg-gray-100 text-gray-600 border-none rounded-md font-bold text-[9px] uppercase tracking-wider px-2 py-0.5">ARCHIVED_v5</Badge>
                                </div>

                                <div className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1.5 group">
                                            <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Full Designation</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input className="h-10 pl-10 bg-gray-50 border-gray-200 rounded-lg text-sm font-medium focus:bg-white transition-colors" placeholder="e.g. Timothy Nduva" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 group">
                                            <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Verified Comms</Label>
                                            <div className="relative">
                                                <Input className="h-10 pl-4 pr-10 bg-gray-100 border-transparent rounded-lg text-sm font-medium text-gray-500 cursor-not-allowed" defaultValue={user?.email || ""} disabled />
                                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 group">
                                            <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Nexus Link (+254)</Label>
                                            <div className="relative">
                                                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input className="h-10 pl-10 bg-gray-50 border-gray-200 rounded-lg text-sm font-medium focus:bg-white transition-colors" placeholder="+254 7XX XXX XXX" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 group">
                                            <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Physical Sector</Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input className="h-10 pl-10 bg-gray-50 border-gray-200 rounded-lg text-sm font-medium focus:bg-white transition-colors" placeholder="Kibwezi, Kenya" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center sm:items-start md:items-center gap-4">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Activity className="w-4 h-4" />
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">SYSTEM_HASH: OK</p>
                                        </div>
                                        <button
                                            onClick={() => handleAtomicSave("Profile")}
                                            disabled={loading["Profile"]}
                                            className={cn(glass.btnPrimary, "w-full sm:w-auto h-10 px-8 font-bold text-xs uppercase flex items-center justify-center gap-2", loading["Profile"] && "opacity-70 cursor-not-allowed")}
                                        >
                                            {loading["Profile"] ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                            Commit Identity
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
                        className={cn(glass.card, "p-0 overflow-hidden bg-white")}
                    >
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-gray-200 shadow-sm">
                                    <Layers className="w-6 h-6 text-[#F4D03F]" />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-xl font-bold text-[#1A1A1A] tracking-tight leading-none">Module <span className="text-[#F4D03F]">Topography</span></h3>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Custom hardware & software routing protocols</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => resetWorkspace(true)} className={cn(glass.btnSecondary, "h-9 px-4 font-bold text-[10px] uppercase")}>
                                    Full Integration
                                </button>
                                <button onClick={() => resetWorkspace(false)} className={cn(glass.btnSecondary, "h-9 px-4 font-bold text-[10px] uppercase border-red-100 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600")}>
                                    Purge Matrix
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
                                        className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex items-start justify-between group hover:bg-white hover:border-[#F4D03F]/30 hover:shadow-sm transition-all"
                                    >
                                        <div className="flex gap-4">
                                            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center border border-gray-200 bg-white shadow-sm transition-transform group-hover:scale-105", mod.color)}>
                                                <mod.icon className="w-5 h-5" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <h4 className="text-sm font-bold text-[#1A1A1A] tracking-tight">{mod.label}</h4>
                                                <p className="text-[11px] font-medium text-gray-500 max-w-[200px] leading-relaxed">{mod.desc}</p>
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
                                    onClick={() => handleAtomicSave("Module Flags")}
                                    className={cn(glass.btnPrimary, "h-10 px-6 font-bold text-xs uppercase shadow-sm")}
                                >
                                    Commit Feature Map
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </TabsContent>

                <TabsContent value="alerts" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Internal Telemetry */}
                        <div className={cn(glass.card, "p-0 overflow-hidden bg-white")}>
                            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-wrap items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-gray-200 shadow-sm">
                                    <Bell className="w-5 h-5 text-[#F4D03F]" />
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="text-lg font-bold text-[#1A1A1A] tracking-tight leading-none">Internal <span className="text-[#F4D03F]">Telemetry</span></h4>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Anomalies & Guidance</p>
                                </div>
                            </div>
                            <div className="p-5 space-y-3">
                                {[
                                    { id: 'aiAnomalies', title: 'Neural Data Drift', desc: 'Predictive sensor spikes.', color: 'emerald-500' },
                                    { id: 'swarmRisk', title: 'Swarm Frequency', desc: 'Acoustic pattern matching.', color: 'amber-500' },
                                    { id: 'onboardingHints', title: 'Contextual AI Hints', desc: 'Real-time guidance pulses.', color: 'blue-500' },
                                ].map((alert) => (
                                    <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 bg-gray-50/50 hover:bg-white transition-colors group">
                                        <div className="space-y-0.5">
                                            <h5 className="text-sm font-bold text-[#1A1A1A]">{alert.title}</h5>
                                            <p className="text-[10px] font-medium text-gray-500">{alert.desc}</p>
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
                        <div className={cn(glass.card, "p-0 overflow-hidden bg-white")}>
                            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-wrap items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-gray-200 shadow-sm">
                                    <Smartphone className="w-5 h-5 text-blue-500" />
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="text-lg font-bold text-[#1A1A1A] tracking-tight leading-none">External <span className="text-blue-500">Routing</span></h4>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Direct push protocols</p>
                                </div>
                            </div>
                            <div className="p-5 space-y-3">
                                {[
                                    { id: 'malfunction', title: 'Hardware Panic', desc: 'Critical sensor failure alerts.', color: 'red-500' },
                                    { id: 'lowBattery', title: 'Energy Hub Vitals', desc: 'Low power threshold pulses.', color: 'blue-500' },
                                    { id: 'marketing', title: 'Boutique Intelligence', desc: 'Retail pricing updates.', color: 'amber-500' },
                                ].map((alert) => (
                                    <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 bg-gray-50/50 hover:bg-white transition-colors group">
                                        <div className="space-y-0.5">
                                            <h5 className="text-sm font-bold text-[#1A1A1A]">{alert.title}</h5>
                                            <p className="text-[10px] font-medium text-gray-500">{alert.desc}</p>
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
                            onClick={() => handleAtomicSave("Notification Routes")}
                            className={cn(glass.btnPrimary, "h-10 px-8 font-bold text-xs uppercase shadow-sm")}
                        >
                            Commit Alert Topology
                        </button>
                    </div>
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            className={cn(glass.card, "p-8 bg-white relative overflow-hidden group")}
                        >
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#F4D03F]/5 blur-3xl rounded-full" />
                            <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 mb-6 shadow-sm group-hover:bg-white transition-colors">
                                <Key className="w-6 h-6 text-[#F4D03F]" />
                            </div>
                            <h3 className="text-2xl font-bold tracking-tight text-[#1A1A1A] leading-none mb-3">Vault <span className="text-[#F4D03F]">Integrity</span></h3>
                            <p className="text-[11px] font-medium text-gray-500 leading-relaxed mb-8 max-w-sm border-l-2 border-[#F4D03F]/40 pl-4">
                                Traceability Level 4 enabled. Kernel sessions are secured via cryptographic node relay. Generate ephemeral access pulses for third-party analysis.
                            </p>
                            <button className={cn(glass.btnSecondary, "w-full h-10 font-bold text-xs uppercase")}>
                                Initialize Access Pulse
                            </button>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            className={cn(glass.card, "p-8 bg-white border-red-100 relative overflow-hidden group")}
                        >
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-500/5 blur-3xl rounded-full" />
                            <div className="w-14 h-14 rounded-xl bg-red-50 flex items-center justify-center border border-red-100 mb-6 shadow-sm group-hover:bg-white transition-colors">
                                <Trash2 className="w-6 h-6 text-red-500" />
                            </div>
                            <h3 className="text-2xl font-bold tracking-tight text-red-600 leading-none mb-3">Identity <span className="text-[#1A1A1A]">Termination</span></h3>
                            <p className="text-[11px] font-medium text-red-600/80 leading-relaxed mb-8 max-w-sm border-l-2 border-red-500/40 pl-4">
                                CRITICAL: Irreversibly destroy industrial hash identity, historical apiary metadata, and all node linkage records.
                            </p>
                            <button className={cn("w-full h-10 bg-red-600 text-white hover:bg-red-700 rounded-lg font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all shadow-sm")}>
                                <Shield className="w-3.5 h-3.5" />
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
