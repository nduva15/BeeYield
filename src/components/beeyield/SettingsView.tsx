import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    User,
    Shield,
    Bell,
    Globe,
    Lock,
    Mail,
    Phone,
    MapPin,
    AlertTriangle,
    Save,
    Trash2,
    Database,
    ShieldCheck,
    Cpu,
    Activity,
    Key,
    Smartphone,
    Layers,
    Bot,
    MousePointer2,
    Check
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';
import { useSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
                icon: <Check className="w-4 h-4 text-emerald-500" />
            });
        }, 800);
    };

    if (!mounted) return null;

    const brutalCardClass = "bg-white dark:bg-zinc-950 border-4 border-[#064e3b] dark:border-zinc-800 p-8 shadow-[8px_8px_0px_0px_rgba(6,78,59,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] transition-all";
    const brutalInputClass = "w-full h-14 px-6 border-2 border-[#064e3b] dark:border-zinc-800 bg-white dark:bg-zinc-900 font-bold text-xs uppercase focus:bg-[#facc15]/10 dark:focus:bg-emerald-500/10 outline-none transition-colors text-[#064e3b] dark:text-zinc-200 placeholder:text-zinc-300 dark:placeholder:text-zinc-700";
    const brutalButtonClass = "h-14 px-10 border-4 border-[#064e3b] dark:border-zinc-800 bg-[#facc15] dark:bg-emerald-600 font-black text-xs uppercase tracking-widest text-[#064e3b] dark:text-white hover:bg-[#064e3b] hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-[6px_6px_0px_0px_rgba(6,78,59,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] active:shadow-none active:translate-x-1 active:translate-y-1 disabled:opacity-50 flex items-center justify-center gap-3";

    return (
        <div className="p-4 md:p-8 space-y-12 bg-slate-50 dark:bg-transparent min-h-screen text-[#064e3b] dark:text-zinc-200 antialiased overflow-hidden">
            {/* Header - High-Utility Breadcrumb / Status */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b-8 border-[#064e3b] dark:border-zinc-800 pb-10">
                <div className="space-y-4">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-2 bg-[#facc15] px-3 py-1 border-2 border-[#064e3b] shadow-[4px_4px_0px_0px_rgba(6,78,59,1)]"
                    >
                        <ShieldCheck className="w-3 h-3" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Secure Kernel_v4.2</span>
                    </motion.div>
                    <h1 className="text-6xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85] text-[#064e3b] dark:text-white">
                        System <span className="text-[#10b981]">Config</span>
                    </h1>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border-2 border-[#064e3b] dark:border-zinc-800 px-4 py-2 font-black text-[10px] uppercase tracking-widest">
                        <Activity className="w-4 h-4 text-[#10b981] animate-pulse" />
                        Registry_Sync: <span className="text-[#10b981]">OK</span>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="identity" className="w-full">
                <TabsList className="bg-[#064e3b] dark:bg-zinc-900 p-1 h-auto w-full grid grid-cols-2 md:grid-cols-4 rounded-none mb-12 shadow-[12px_12px_0px_0px_rgba(6,78,59,0.1)] dark:shadow-none">
                    <TabsTrigger value="identity" className="h-16 rounded-none font-black uppercase text-[10px] tracking-[0.2em] text-white/40 data-[state=active]:bg-[#10b981] data-[state=active]:text-white transition-all data-[state=active]:shadow-inner">
                        <User className="w-4 h-4 mr-3" /> Identity
                    </TabsTrigger>
                    <TabsTrigger value="modules" className="h-16 rounded-none font-black uppercase text-[10px] tracking-[0.2em] text-white/40 data-[state=active]:bg-[#10b981] data-[state=active]:text-white transition-all data-[state=active]:shadow-inner">
                        <Layers className="w-4 h-4 mr-3" /> Modules
                    </TabsTrigger>
                    <TabsTrigger value="alerts" className="h-16 rounded-none font-black uppercase text-[10px] tracking-[0.2em] text-white/40 data-[state=active]:bg-[#10b981] data-[state=active]:text-white transition-all data-[state=active]:shadow-inner">
                        <Bell className="w-4 h-4 mr-3" /> Alert Routes
                    </TabsTrigger>
                    <TabsTrigger value="security" className="h-16 rounded-none font-black uppercase text-[10px] tracking-[0.2em] text-white/40 data-[state=active]:bg-[#10b981] data-[state=active]:text-white transition-all data-[state=active]:shadow-inner">
                        <ShieldCheck className="w-4 h-4 mr-3" /> Security
                    </TabsTrigger>
                </TabsList>

                {/* --- TAB: IDENTITY & LOCALIZATION --- */}
                <TabsContent value="identity" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-4 space-y-8">
                            <div className={cn(brutalCardClass, "text-center flex flex-col items-center justify-center py-12")}>
                                <div className="w-32 h-32 border-4 border-[#064e3b] dark:border-zinc-700 bg-[#facc15] dark:bg-emerald-900 flex items-center justify-center relative shadow-[6px_6px_0px_0px_rgba(6,78,59,1)]">
                                    <User className="w-16 h-16 text-[#064e3b] dark:text-white" />
                                    <div className="absolute -bottom-3 -right-3 bg-emerald-500 text-white p-1.5 border-2 border-[#064e3b]">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="mt-8 space-y-2">
                                    <h3 className="text-2xl font-black uppercase tracking-tighter">Global Identity</h3>
                                    <p className="text-[10px] font-bold text-[#064e3b]/60 dark:text-zinc-500 uppercase tracking-widest leading-relaxed px-4">
                                        Verified by BeeYield Agricultural Registry Service
                                    </p>
                                </div>
                                <button className="mt-8 h-12 w-full border-2 border-[#064e3b] dark:border-zinc-700 bg-white dark:bg-zinc-800 font-black text-[10px] uppercase hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-none">Upload New Proof</button>
                            </div>

                            <div className={cn(brutalCardClass, "bg-[#facc15]/10")}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-black uppercase">Dark Mode Theme</h4>
                                        <p className="text-[9px] font-bold text-[#064e3b]/50 dark:text-zinc-500 uppercase tracking-widest">Switch visual canvas</p>
                                    </div>
                                    <Switch
                                        checked={theme === 'dark'}
                                        onCheckedChange={(c) => setTheme(c ? 'dark' : 'light')}
                                        className="h-10 w-16 border-4 border-[#064e3b] dark:border-zinc-700 data-[state=checked]:bg-[#10b981] rounded-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-8 space-y-10">
                            <div className={brutalCardClass}>
                                <div className="flex items-center justify-between mb-10">
                                    <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-4">
                                        <Globe className="w-6 h-6 text-[#10b981]" />
                                        Profile Data
                                    </h3>
                                    <Badge className="bg-[#10b981] text-white border-0 py-1.5 px-3 font-bold uppercase text-[9px] tracking-widest rounded-none">Active Entry</Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Full Name</Label>
                                        <input className={brutalInputClass} placeholder="Timothy Nduva" />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Login Email</Label>
                                        <div className="relative group">
                                            <input className={cn(brutalInputClass, "bg-neutral-50 dark:bg-zinc-900 border-zinc-200 cursor-not-allowed")} defaultValue={user?.email || ""} disabled />
                                            <Lock className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Phone Link (+254)</Label>
                                        <input className={brutalInputClass} placeholder="+254 7XX XXX XXX" />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Physical Locus</Label>
                                        <div className="relative">
                                            <input className={brutalInputClass} placeholder="Kibwezi, Kenya" />
                                            <MapPin className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#10b981]" />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 flex justify-end">
                                    <button
                                        onClick={() => handleAtomicSave("Profile")}
                                        disabled={loading["Profile"]}
                                        className={brutalButtonClass}
                                    >
                                        {loading["Profile"] ? <Activity className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Profile
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* --- TAB: MODULE SWITCHING --- */}
                <TabsContent value="modules" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className={brutalCardClass}>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                            <div>
                                <h3 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-4">
                                    <Layers className="w-8 h-8 text-[#10b981]" />
                                    Module Switching
                                </h3>
                                <p className="text-[11px] font-bold text-[#064e3b]/50 dark:text-zinc-500 uppercase tracking-widest mt-2 max-w-xl">
                                    Enable or disable high-level features to customize your BeeYield cockpit. Mission-critical modules are marked.
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => resetWorkspace(true)} className="h-10 px-6 border-2 border-[#064e3b] dark:border-zinc-700 bg-emerald-50 content-center font-black text-[9px] uppercase hover:bg-emerald-100 transition-colors">Enable All</button>
                                <button onClick={() => resetWorkspace(false)} className="h-10 px-6 border-2 border-red-200 bg-red-50 text-red-600 font-black text-[9px] uppercase hover:bg-red-100 transition-colors">Turn Off All</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[
                                { id: 'beehives', label: 'Smart Beehives', desc: 'Apiary management, IoT hive health, and production tracking.', icon: Hexagon, priority: true },
                                { id: 'agro', label: 'Agro & Meteo', desc: 'Precision weather analytics and bloom tracking integration.', icon: Globe, priority: true },
                                { id: 'trackers', label: 'Other Resources', icon: Cpu, desc: 'Vehicle tracking, solar node vitals, and auxiliary hardware.' },
                                { id: 'patients', label: 'Patients (Medical)', icon: Activity, desc: 'Advanced veterinary mode for hive disease and bee health treatments.' },
                            ].map((mod) => (
                                <div key={mod.id} className="p-6 border-2 border-[#064e3b]/10 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex items-start justify-between group hover:border-[#F4D03F] transition-all">
                                    <div className="flex gap-6">
                                        <div className="p-3 bg-white dark:bg-zinc-800 border-2 border-[#064e3b] dark:border-zinc-700 shadow-[4px_4px_0px_0px_rgba(6,78,59,1)]">
                                            <mod.icon className="w-6 h-6 text-[#10b981]" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-base font-black uppercase tracking-tight">{mod.label}</h4>
                                                {mod.priority && (
                                                    <Badge className="bg-orange-500 text-white border-0 text-[8px] font-black uppercase h-4 px-1 rounded-none tracking-widest">Priority</Badge>
                                                )}
                                            </div>
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">{mod.desc}</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={!!(moduleFlags as any)[mod.id]}
                                        onCheckedChange={(val) => updateModuleFlags({ [mod.id]: val })}
                                        className="h-8 w-14 border-2 border-[#064e3b] dark:border-zinc-700 data-[state=checked]:bg-[#10b981] rounded-none mt-1"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 flex justify-end">
                            <button
                                onClick={() => handleAtomicSave("Module Flags")}
                                className={brutalButtonClass}
                            >
                                Committ Feature Map
                            </button>
                        </div>
                    </div>
                </TabsContent>

                {/* --- TAB: SMART NOTIFICATIONS --- */}
                <TabsContent value="alerts" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className={brutalCardClass}>
                            <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-4 mb-8">
                                <Bell className="w-6 h-6 text-[#facc15]" />
                                BeeYield Alert Patterns
                            </h3>
                            <div className="space-y-6">
                                {[
                                    { id: 'aiAnomalies', title: 'Internal Anomaly detection', desc: 'System identifies sensor spikes and data drift anomalies.', icon: Shield },
                                    { id: 'swarmRisk', title: 'Swarm Frequency Alerts', desc: 'Predictive analytics triggers if swarm patterns match.', icon: Activity },
                                    { id: 'onboardingHints', title: 'In-app Hints / Tutorials', desc: 'Context-aware guidance for operations.', icon: Globe },
                                ].map((alert) => (
                                    <div key={alert.id} className="flex items-center justify-between py-4 border-b border-[#064e3b]/5 last:border-0">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 border-2 border-[#064e3b] bg-white flex items-center justify-center">
                                                <alert.icon className="w-5 h-5 text-zinc-400" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <h4 className="text-sm font-black uppercase tracking-tight">{alert.title}</h4>
                                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{alert.desc}</p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={!!(alerts as any)[alert.id]}
                                            onCheckedChange={(val) => updateAlerts({ [alert.id]: val })}
                                            className="h-8 w-14 border-2 border-[#064e3b] data-[state=checked]:bg-[#10b981] rounded-none"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={brutalCardClass}>
                            <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-4 mb-8">
                                <Smartphone className="w-6 h-6 text-[#10b981]" />
                                Direct Device Alerts
                            </h3>
                            <div className="space-y-6">
                                {[
                                    { id: 'malfunction', title: 'Critical Malfunction', desc: 'Flash alerts on hardware hardware panic.' },
                                    { id: 'lowBattery', title: 'BeeHUB Low Battery', desc: 'Notify if nodes drop below 20% power.' },
                                    { id: 'marketing', title: 'Marketing Content', desc: 'Product updates and honey boutique offers.' },
                                ].map((alert) => (
                                    <div key={alert.id} className="flex items-center justify-between py-4 border-b border-[#064e3b]/5 last:border-0">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 border-2 border-[#064e3b] bg-white flex items-center justify-center">
                                                <Smartphone className="w-5 h-5 text-zinc-400" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <h4 className="text-sm font-black uppercase tracking-tight">{alert.title}</h4>
                                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{alert.desc}</p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={!!(alerts as any)[alert.id]}
                                            onCheckedChange={(val) => updateAlerts({ [alert.id]: val })}
                                            className="h-8 w-14 border-2 border-[#064e3b] data-[state=checked]:bg-[#10b981] rounded-none"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="mt-12 flex justify-center">
                        <button
                            onClick={() => handleAtomicSave("Notification Routes")}
                            className={cn(brutalButtonClass, "w-full md:w-auto px-20 translate-y-4 hover:translate-y-0")}
                        >
                            Commit Notification Map
                        </button>
                    </div>
                </TabsContent>

                {/* --- TAB: SECURITY PATH --- */}
                <TabsContent value="security" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className={brutalCardClass}>
                            <div className="mb-10 p-6 bg-[#facc15]/20 border-2 border-[#064e3b] inline-block">
                                <Key className="w-12 h-12 text-[#064e3b]" />
                            </div>
                            <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">API Node Integration</h3>
                            <p className="text-xs font-bold text-[#064e3b]/60 dark:text-zinc-500 uppercase tracking-widest leading-loose mb-10">
                                Connect third-party analytics and hive monitoring nodes. Traceability Level 4 enabled for this identity. Session is secured via BeeYield Kernel.
                            </p>
                            <button className={cn(brutalButtonClass, "w-full")}>Generate Access Pulse</button>
                        </div>

                        <div className={cn(brutalCardClass, "bg-red-50 dark:bg-red-950/20")}>
                            <div className="mb-10 p-6 bg-red-100 dark:bg-red-900/40 border-2 border-red-600 inline-block">
                                <Trash2 className="w-12 h-12 text-red-600" />
                            </div>
                            <h3 className="text-3xl font-black uppercase tracking-tighter text-red-600 mb-4">Identity Termination</h3>
                            <p className="text-xs font-bold text-red-600/60 uppercase tracking-widest leading-loose mb-10">
                                CRITICAL: This will destroy your global hash identity, apiary datasets, and node linkage records. This action is immutable.
                            </p>
                            <button className="h-14 w-full border-4 border-red-600 bg-white dark:bg-zinc-900 text-red-600 font-black uppercase text-xs tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-[6px_6px_0px_0px_rgba(220,38,38,0.1)] active:shadow-none">Purge All Records</button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SettingsView;
