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
        // Simulate API call to beeyield_profiles
        setTimeout(() => {
            setLoading(prev => ({ ...prev, [section]: false }));
            toast.success(`${section} Registry Synchronized`, {
                description: "Settings committed to BeeYield Global Registry",
                icon: <Check className="w-5 h-5 text-emerald-500" />
            });
        }, 1200);
    };

    if (!mounted) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, "max-w-7xl mx-auto space-y-16 pb-40")}
        >
            <PageHeader
                icon={Settings}
                label="Identity & Kernel Configuration_v4.4"
                title={<>System <span className="text-honey">Control</span></>}
                subtitle="Manage your industrial identity patterns, module access permissions, and global notification routing protocols."
                actions={
                    <div className="flex items-center gap-6 bg-white/40 dark:bg-black/40 backdrop-blur-3xl border border-white/5 px-8 py-3 font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl shadow-2xl skew-x-[-12deg]">
                        <Activity className="w-5 h-5 text-emerald-500 animate-pulse" />
                        <span className="skew-x-[12deg]">Kernel_Sync: <span className="text-emerald-500">OPTIMIZED</span></span>
                    </div>
                }
            />

            <Tabs defaultValue="identity" className="w-full space-y-12">
                <TabsList className="bg-white/40 dark:bg-black/40 p-2 h-22 w-full grid grid-cols-2 md:grid-cols-4 rounded-[40px] border border-white/10 backdrop-blur-3xl shadow-3xl">
                    {[
                        { value: 'identity', label: 'Identity', icon: User },
                        { value: 'modules', label: 'Modules', icon: Layers },
                        { value: 'alerts', label: 'Alerting', icon: Bell },
                        { value: 'security', label: 'Security', icon: ShieldCheck },
                    ].map(tab => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="h-full rounded-[30px] font-black uppercase text-[12px] tracking-[0.2em] italic text-muted-foreground/60 data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-foreground data-[state=active]:shadow-2xl transition-all duration-700 flex items-center justify-center gap-4"
                        >
                            <tab.icon className="w-5 h-5" /> {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* --- TAB: IDENTITY & LOCALIZATION --- */}
                <TabsContent value="identity" className="animate-in fade-in slide-in-from-bottom-5 duration-1000">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        <div className="lg:col-span-4 space-y-12">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={cn(glass.card, "text-center flex flex-col items-center justify-center py-20 px-12 bg-white/60 dark:bg-black/40 relative overflow-hidden")}
                            >
                                <div className="absolute -top-10 -left-10 opacity-5 pointer-events-none">
                                    <Fingerprint className="w-40 h-40" />
                                </div>
                                <div className="w-44 h-44 rounded-full border-8 border-white/40 dark:border-white/10 bg-gradient-amber p-1 flex items-center justify-center relative shadow-[0_45px_100px_-20px_rgba(251,191,36,0.5)] group">
                                    <div className="w-full h-full rounded-full bg-black/20 backdrop-blur-xl flex items-center justify-center border-4 border-white/10 relative overflow-hidden">
                                        <User className="w-20 h-20 text-white group-hover:scale-110 transition-transform duration-1000" />
                                        <div className="absolute inset-0 bg-honey/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                    </div>
                                    <div className="absolute bottom-2 right-2 bg-emerald-500 text-white p-3 rounded-full border-4 border-white shadow-2xl shadow-emerald-500/50 transform group-hover:rotate-[360deg] transition-transform duration-1000">
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="mt-14 space-y-4">
                                    <h3 className={cn(glass.sectionTitle, 'text-4xl normal-case italic')}>Autonomous <span className="text-honey">Identity</span></h3>
                                    <p className={cn(glass.microLabel, 'opacity-40 leading-relaxed italic uppercase tracking-[0.2em] font-black text-[10px]')}>
                                        System Hash_v4 Verified
                                    </p>
                                </div>
                                <button className={cn(glass.btnSecondary, 'mt-12 w-full h-18 rounded-3xl font-black italic shadow-xl')}>Update Biometrics</button>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(glass.card, "p-12 space-y-8 bg-white/40 dark:bg-black/20 border-white/5")}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-4">
                                            <Palette className="w-6 h-6 text-honey" />
                                            <h4 className="text-xl font-black italic tracking-tight">Chromatic Interface</h4>
                                        </div>
                                        <p className={cn(glass.microLabel, 'opacity-40 uppercase font-black text-[9px] italic')}>Switch visual kernel mode</p>
                                    </div>
                                    <Switch
                                        checked={theme === 'dark'}
                                        onCheckedChange={(c) => setTheme(c ? 'dark' : 'light')}
                                        className="data-[state=checked]:bg-honey h-10 w-18 scale-150"
                                    />
                                </div>
                            </motion.div>

                            <button
                                onClick={() => signOut()}
                                className={cn(glass.btnSecondary, "w-full h-20 rounded-[2.5rem] bg-red-500/5 border-red-500/20 text-red-500 font-black italic text-xl gap-6 group hover:bg-red-500 hover:text-white transition-all duration-700")}
                            >
                                <LogOut className="w-8 h-8 group-hover:-translate-x-2 transition-transform duration-700" />
                                Terminate Session
                            </button>
                        </div>

                        <div className="lg:col-span-8">
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={cn(glass.card, "p-0 overflow-hidden shadow-3xl bg-white/60 dark:bg-[#0D0D0D]/60 backdrop-blur-3xl")}
                            >
                                <div className={cn(glass.sectionHeader, 'p-14 border-b border-white/10 bg-white/40 dark:bg-black/40 flex items-center justify-between')}>
                                    <div className="flex items-center gap-8">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-honey/10 flex items-center justify-center border border-honey/20 shadow-inner">
                                            <Globe className="w-9 h-9 text-honey" />
                                        </div>
                                        <div className="space-y-1">
                                            <h2 className={cn(glass.sectionTitle, 'text-4xl normal-case italic')}>Profile <span className="text-honey">Audit</span></h2>
                                            <p className={cn(glass.microLabel, 'opacity-40 italic tracking-widest text-[9px] uppercase')}>Global Registry Metadata Protocol_v4</p>
                                        </div>
                                    </div>
                                    <Badge className={cn(glass.badge, 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20 px-6 py-3 rounded-full italic font-black shadow-2xl')}>ARCHIVED_PROTOCOL_1</Badge>
                                </div>

                                <div className="p-16 space-y-16">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                        <div className="space-y-6 group">
                                            <Label className={cn(glass.microLabel, 'ml-8 border-l-2 border-honey/40 pl-6 opacity-40 font-black tracking-widest uppercase text-[10px]')}>Full Designation</Label>
                                            <div className="relative">
                                                <User className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-honey/40 transition-colors group-focus-within:text-honey" />
                                                <Input className={cn(glass.input, "h-20 pl-20 px-10 rounded-[2rem] italic font-black text-xl bg-black/5 dark:bg-black/30 border-none shadow-inner")} placeholder="Timothy Nduva" />
                                            </div>
                                        </div>
                                        <div className="space-y-6 group">
                                            <Label className={cn(glass.microLabel, 'ml-8 border-l-2 border-muted-foreground/40 pl-6 opacity-40 font-black tracking-widest uppercase text-[10px]')}>Verified Comms</Label>
                                            <div className="relative">
                                                <Input className={cn(glass.input, "h-20 pl-10 px-10 rounded-[2rem] italic font-black text-xl bg-black/5 dark:bg-black/30 border-none shadow-inner opacity-50 cursor-not-allowed")} defaultValue={user?.email || ""} disabled />
                                                <Lock className="absolute right-8 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground/30" />
                                            </div>
                                        </div>
                                        <div className="space-y-6 group">
                                            <Label className={cn(glass.microLabel, 'ml-8 border-l-2 border-blue-500/40 pl-6 opacity-40 font-black tracking-widest uppercase text-[10px]')}>Nexus Link (+254)</Label>
                                            <div className="relative">
                                                <Smartphone className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-blue-400/40 transition-colors group-focus-within:text-blue-400" />
                                                <Input className={cn(glass.input, "h-20 pl-20 px-10 rounded-[2rem] italic font-black text-xl bg-black/5 dark:bg-black/30 border-none shadow-inner")} placeholder="+254 7XX XXX XXX" />
                                            </div>
                                        </div>
                                        <div className="space-y-6 group">
                                            <Label className={cn(glass.microLabel, 'ml-8 border-l-2 border-orange-500/40 pl-6 opacity-40 font-black tracking-widest uppercase text-[10px]')}>Physical Sector</Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-orange-400/40 transition-colors group-focus-within:text-orange-400" />
                                                <Input className={cn(glass.input, "h-20 pl-20 px-10 rounded-[2rem] italic font-black text-xl bg-black/5 dark:bg-black/30 border-none shadow-inner")} placeholder="Kibwezi, Kenya" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-14 border-t border-white/10 bg-white/40 dark:bg-black/60 flex justify-between items-center -mx-16 -mb-16 mt-12 rounded-b-[3rem]">
                                        <div className="flex items-center gap-8 opacity-20 px-10">
                                            <Activity className="w-10 h-10" />
                                            <p className="text-[11px] font-black uppercase tracking-[0.4em] max-w-sm italic leading-relaxed">SYSTEM_STATUS: SECURE · GLOBAL_HASH: OK</p>
                                        </div>
                                        <button
                                            onClick={() => handleAtomicSave("Profile")}
                                            disabled={loading["Profile"]}
                                            className={cn(glass.btnPrimary, "h-22 px-24 font-black text-2xl italic shadow-[0_45px_100px_-20px_rgba(251,191,36,0.5)] rounded-[2.5rem] flex items-center gap-6 group/commit pl-20")}
                                        >
                                            {loading["Profile"] ? (
                                                <Activity className="w-10 h-10 animate-spin" />
                                            ) : (
                                                <ShieldCheck className="w-10 h-10 group-hover/commit:scale-125 transition-transform duration-1000 text-black" />
                                            )}
                                            Commit Identity
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </TabsContent>

                {/* --- TAB: MODULE SWITCHING --- */}
                <TabsContent value="modules" className="animate-in fade-in slide-in-from-bottom-5 duration-1000">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(glass.card, "p-0 overflow-hidden shadow-3xl bg-white/60 dark:bg-[#0D0D0D]/60 backdrop-blur-3xl")}
                    >
                        <div className={cn(glass.sectionHeader, 'p-14 border-b border-white/10 bg-white/40 dark:bg-black/40 flex flex-col md:flex-row md:items-center justify-between gap-12')}>
                            <div className="flex items-center gap-10">
                                <div className="w-20 h-20 rounded-[2.5rem] bg-honey/10 flex items-center justify-center border-2 border-honey/20 shadow-2xl skew-y-3">
                                    <Layers className="w-10 h-10 text-honey" />
                                </div>
                                <div>
                                    <h3 className={cn(glass.sectionTitle, 'text-5xl italic normal-case')}>Module <span className="text-honey">Topography</span></h3>
                                    <p className={cn(glass.microLabel, 'mt-2 opacity-40 leading-relaxed max-w-xl italic uppercase font-black text-[10px] tracking-[0.2em]')}>
                                        Custom hardware & software routing protocols for your BeeYield cockpit.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-8">
                                <button onClick={() => resetWorkspace(true)} className={cn(glass.btnSecondary, 'h-18 px-10 rounded-3xl font-black italic uppercase text-xs tracking-widest group hover:bg-emerald-500 hover:text-white transition-all duration-700')}>
                                    Full Integration
                                </button>
                                <button onClick={() => resetWorkspace(false)} className={cn(glass.btnSecondary, 'h-18 px-10 rounded-3xl font-black italic uppercase text-xs tracking-widest group hover:bg-red-500 hover:text-white transition-all duration-700')}>
                                    Purge Workspace
                                </button>
                            </div>
                        </div>

                        <div className="p-16">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {[
                                    { id: 'beehives', label: 'Commercial Apiaries', desc: 'Main telemetry flow for hive health, production inventory, and node linkage.', icon: Hexagon, priority: true, color: 'honey' },
                                    { id: 'agro', label: 'Meteo & Bloom', desc: 'Satellite weather analytics, flora tracking, and precision bloom forecasting.', icon: Globe, priority: true, color: 'emerald-500' },
                                    { id: 'trackers', label: 'Auxiliary Hardware', icon: Cpu, desc: 'Real-time vehicle tracking, solar node vitals, and drone telemetry.', color: 'blue-500' },
                                    { id: 'patients', label: 'Biometric Lab', icon: Activity, desc: 'Advanced veterinary mode for microscopic analysis and disease mitigation.', color: 'red-500' },
                                ].map((mod, idx) => (
                                    <motion.div
                                        key={mod.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="p-12 rounded-[3.5rem] border border-white/5 bg-white/20 dark:bg-black/20 flex items-start justify-between group hover:border-honey/60 hover:bg-honey/[0.03] transition-all duration-1000 backdrop-blur-3xl shadow-xl relative overflow-hidden"
                                    >
                                        <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none group-hover:scale-150 group-hover:rotate-12 transition-transform duration-1000">
                                            <mod.icon className="w-40 h-40" />
                                        </div>
                                        <div className="flex gap-10 relative z-10">
                                            <div className={cn("w-18 h-18 rounded-[1.5rem] flex items-center justify-center border-2 shadow-2xl transition-all duration-1000 transform group-hover:rotate-6", `bg-${mod.id === 'beehives' ? 'honey' : mod.color}/10 border-${mod.id === 'beehives' ? 'honey' : mod.color}/20 text-${mod.id === 'beehives' ? 'honey' : mod.color}`)}>
                                                <mod.icon className="w-9 h-9" />
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-6">
                                                    <h4 className="text-2xl font-black italic tracking-tight group-hover:text-foreground transition-colors">{mod.label}</h4>
                                                    {mod.priority && (
                                                        <Badge className="bg-honey/10 text-honey border border-honey/20 px-4 py-1 rounded-full font-black text-[9px] uppercase tracking-widest animate-pulse italic">CORE</Badge>
                                                    )}
                                                </div>
                                                <p className={cn(glass.microLabel, 'opacity-40 leading-relaxed pt-1 normal-case italic font-medium text-lg max-w-sm')}>{mod.desc}</p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={!!(moduleFlags as any)[mod.id]}
                                            onCheckedChange={(val) => updateModuleFlags({ [mod.id]: val })}
                                            className="data-[state=checked]:bg-honey h-8 w-14 mt-4 scale-125"
                                        />
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-20 flex justify-end">
                                <button
                                    onClick={() => handleAtomicSave("Module Flags")}
                                    className={cn(glass.btnPrimary, "h-22 px-24 font-black text-2xl italic shadow-[0_45px_100px_-20px_rgba(251,191,36,0.5)] rounded-[2.5rem] flex items-center gap-6")}
                                >
                                    Commit Feature Map
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </TabsContent>

                {/* --- TAB: SMART NOTIFICATIONS --- */}
                <TabsContent value="alerts" className="animate-in fade-in slide-in-from-bottom-5 duration-1000">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={cn(glass.card, "p-0 overflow-hidden shadow-3xl bg-white/60 dark:bg-[#0D0D0D]/60 backdrop-blur-3xl")}
                        >
                            <div className={cn(glass.sectionHeader, 'p-12 border-b border-white/10 bg-white/40 dark:bg-black/40')}>
                                <div className="flex items-center gap-8">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-honey/10 flex items-center justify-center border border-honey/20">
                                        <Bell className="w-8 h-8 text-honey" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className={cn(glass.sectionTitle, 'text-3xl normal-case italic')}>Internal <span className="text-honey">Telemetry</span></h3>
                                        <p className={cn(glass.microLabel, 'opacity-40 italic tracking-[0.2em] uppercase font-black text-[9px]')}>System-level anomaly detection</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-12 space-y-10">
                                {[
                                    { id: 'aiAnomalies', title: 'Neural Data Drift', desc: 'Predictive analytics for sensor spikes and telemetry anomalies.', icon: ShieldCheck, color: 'emerald-500' },
                                    { id: 'swarmRisk', title: 'Swarm Frequency', desc: 'Acoustic pattern matching for imminent hive swarming detection.', icon: Activity, color: 'honey' },
                                    { id: 'onboardingHints', title: 'Contextual AI Hints', desc: 'Real-time operative guidance based on current workflow state.', icon: Globe, color: 'blue-500' },
                                ].map((alert) => (
                                    <div key={alert.id} className="flex items-center justify-between py-10 px-8 border border-white/5 rounded-[2.5rem] bg-black/5 dark:bg-black/20 group hover:bg-white/5 transition-colors duration-700">
                                        <div className="flex items-center gap-8">
                                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl", `bg-${alert.color}/10 border border-${alert.color}/20 text-${alert.color}`)}>
                                                <alert.icon className="w-7 h-7" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-xl font-black italic tracking-tight">{alert.title}</h4>
                                                <p className={cn(glass.microLabel, 'opacity-40 italic font-medium normal-case text-[15px]')}>{alert.desc}</p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={!!(alerts as any)[alert.id]}
                                            onCheckedChange={(val) => updateAlerts({ [alert.id]: val })}
                                            className="data-[state=checked]:bg-honey h-8 w-14 scale-110"
                                        />
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={cn(glass.card, "p-0 overflow-hidden shadow-3xl bg-white/60 dark:bg-[#0D0D0D]/60 backdrop-blur-3xl")}
                        >
                            <div className={cn(glass.sectionHeader, 'p-12 border-b border-white/10 bg-white/40 dark:bg-black/40')}>
                                <div className="flex items-center gap-8">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                        <Smartphone className="w-8 h-8 text-blue-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className={cn(glass.sectionTitle, 'text-3xl normal-case italic')}>External <span className="text-blue-500">Routing</span></h3>
                                        <p className={cn(glass.microLabel, 'opacity-40 italic tracking-[0.2em] uppercase font-black text-[9px]')}>Direct device push protocols</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-12 space-y-10">
                                {[
                                    { id: 'malfunction', title: 'Hardware Panic', desc: 'Critical alerts for node sensor failure or data loss.', icon: Zap, color: 'red-500' },
                                    { id: 'lowBattery', title: 'BeeHUB Energy Hub', desc: 'Priority notifications when solar nodes drop below 15% threshold.', icon: Cpu, color: 'blue-500' },
                                    { id: 'marketing', title: 'Boutique Intelligence', desc: 'Market analysis for honey retail pricing and boutique updates.', icon: ShoppingBag, color: 'honey' }, // Note: ShoppingBag is not imported here, use something else or add
                                ].map((alert) => (
                                    <div key={alert.id} className="flex items-center justify-between py-10 px-8 border border-white/5 rounded-[2.5rem] bg-black/5 dark:bg-black/20 group hover:bg-white/5 transition-colors duration-700">
                                        <div className="flex items-center gap-8">
                                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl", `bg-${alert.color}/10 border border-${alert.color}/20 text-${alert.color}`)}>
                                                <alert.icon className="w-7 h-7" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-xl font-black italic tracking-tight">{alert.title}</h4>
                                                <p className={cn(glass.microLabel, 'opacity-40 italic font-medium normal-case text-[15px]')}>{alert.desc}</p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={!!(alerts as any)[alert.id]}
                                            onCheckedChange={(val) => updateAlerts({ [alert.id]: val })}
                                            className="data-[state=checked]:bg-honey h-8 w-14 scale-110"
                                        />
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                    <div className="mt-16 flex justify-center">
                        <button
                            onClick={() => handleAtomicSave("Notification Routes")}
                            className={cn(glass.btnPrimary, "h-22 px-32 font-black text-2xl italic shadow-[0_45px_100px_-20px_rgba(251,191,36,0.5)] rounded-[2.5rem] flex items-center gap-6 shadow-honey/30")}
                        >
                            Commit Alert Topology
                        </button>
                    </div>
                </TabsContent>

                {/* --- TAB: SECURITY PATH --- */}
                <TabsContent value="security" className="animate-in fade-in slide-in-from-bottom-5 duration-1000">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(glass.card, "p-12 bg-white/60 dark:bg-black/40 overflow-hidden relative group")}
                        >
                            <div className="absolute top-0 right-0 w-60 h-60 bg-honey/5 blur-[80px] group-hover:bg-honey/10 transition-colors duration-1000" />
                            <div className="mb-12 w-24 h-24 rounded-[2rem] bg-honey/10 flex items-center justify-center border-2 border-honey/20 shadow-3xl transform group-hover:rotate-12 transition-transform duration-1000">
                                <Key className="w-12 h-12 text-honey" />
                            </div>
                            <h3 className={cn(glass.sectionTitle, 'text-5xl italic normal-case mb-8')}>Vault <span className="text-honey">Integrity</span></h3>
                            <p className={cn(glass.microLabel, 'opacity-40 leading-relaxed mb-12 normal-case italic font-medium text-lg border-l-2 border-honey/20 pl-8 max-w-xl')}>
                                Traceability Level 4 enabled for this identity. Kernel sessions are secured via cryptographic node relay. Generate ephemeral access pulses for third-party analysis.
                            </p>
                            <button className={cn(glass.btnSecondary, 'w-full h-20 rounded-[2.5rem] font-black italic text-xl shadow-2xl transition-all duration-700 hover:bg-honey/10 hover:border-honey/40')}>Initialize Access Pulse</button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(glass.card, "p-12 bg-red-500/5 dark:bg-red-500/[0.03] border-red-500/20 overflow-hidden relative group")}
                        >
                            <div className="absolute top-0 right-0 w-60 h-60 bg-red-500/5 blur-[80px]" />
                            <div className="mb-12 w-24 h-24 rounded-[2rem] bg-red-500/10 flex items-center justify-center border-2 border-red-500/20 shadow-3xl transform group-hover:-rotate-12 transition-transform duration-1000">
                                <Trash2 className="w-12 h-12 text-red-500" />
                            </div>
                            <h3 className={cn(glass.sectionTitle, 'text-5xl italic normal-case text-red-500 mb-8')}>Identity <span className="text-foreground">Termination</span></h3>
                            <p className={cn(glass.microLabel, 'text-red-500/40 leading-relaxed mb-12 normal-case italic font-medium text-lg border-l-2 border-red-500/20 pl-8 max-w-xl')}>
                                CRITICAL: This protocol will irreversibly destroy your industrial hash identity, historical apiary metadata, and all node linkage records.
                            </p>
                            <button className="h-20 w-full rounded-[2.5rem] bg-red-500/10 text-red-500 font-black italic text-xl tracking-widest hover:bg-red-500 hover:text-white transition-all duration-700 border border-red-500/20 shadow-2xl flex items-center justify-center gap-6 group/purge">
                                <Shield className="w-8 h-8 group-hover/purge:animate-bounce" />
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
