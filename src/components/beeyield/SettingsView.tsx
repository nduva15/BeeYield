import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Settings2, CloudRain, Briefcase, UserRound, Star, HelpCircle,
    Camera, Loader2, Mail, Check, ChevronDown, Sparkles, BookOpen,
    MapPin, BellRing, Shield, Smartphone, Zap, Thermometer,
    Droplets, Weight, Globe, ShieldCheck, Waves, Terminal,
    Activity, LayoutDashboard, Cpu, Target, Package, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { LanguageCode } from '@/lib/translations';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useApiaries } from '@/hooks/useApiaries';
import { useUserSettings, useUpdateSettings, useUpdateNotificationConfig, useUpdateHiveThresholds, useNotificationSettings, useUpdateNotificationSettings, useIoTSettings, useUpdateIoTSettings, useHiveSettings } from '@/hooks/useSettingsData';
import { UserSettingsUpdate, NotificationConfigUpdate, UserNotificationSettings, IoTSettings } from '@/services/beeyieldService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";

interface SettingsViewProps {
    onTabChange: (tab: string) => void;
}

const languages = [
    { code: 'EN' as LanguageCode, name: 'English', country: 'United Kingdom', flag: 'https://flagcdn.com/gb.svg' },
    { code: 'FR' as LanguageCode, name: 'Français', country: 'France', flag: 'https://flagcdn.com/fr.svg' },
    { code: 'DE' as LanguageCode, name: 'Deutsch', country: 'Germany', flag: 'https://flagcdn.com/de.svg' },
    { code: 'ES' as LanguageCode, name: 'Español', country: 'Spain', flag: 'https://flagcdn.com/es.svg' },
    { code: 'SW' as LanguageCode, name: 'Kiswahili', country: 'Kenya', flag: 'https://flagcdn.com/ke.svg' },
    { code: 'ZH' as LanguageCode, name: '中文', country: 'China', flag: 'https://flagcdn.com/cn.svg' },
    { code: 'PL' as LanguageCode, name: 'Polski', country: 'Poland', flag: 'https://flagcdn.com/pl.svg' },
];

const SettingsView: React.FC<SettingsViewProps> = ({ onTabChange }) => {
    const { user, signOut } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    const { theme, setTheme } = useTheme();
    const { showGuides, setShowGuides } = useSettings();
    const [uploading, setUploading] = useState(false);
    const [emailUpdating, setEmailUpdating] = useState(false);
    const [passwordUpdating, setPasswordUpdating] = useState(false);
    const [deletingAccount, setDeletingAccount] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // TanStack Query Hooks
    const { data: settings, isLoading } = useUserSettings();
    const updateSettingsMutation = useUpdateSettings();
    const updateNotifMutation = useUpdateNotificationConfig();
    const updateHiveThresholdsMutation = useUpdateHiveThresholds();
    const { data: allHivesSettings, isLoading: hivesLoading } = useHiveSettings();
    const { data: apiaries = [], isLoading: apiariesLoading } = useApiaries();

    // PRD Settings Hooks
    const { data: prdNotifications, isLoading: notifLoading } = useNotificationSettings();
    const { data: prdIoT, isLoading: iotLoading } = useIoTSettings();
    const updatePrdNotif = useUpdateNotificationSettings();
    const updatePrdIoT = useUpdateIoTSettings();

    // State for local overrides before saving
    const [localSettings, setLocalSettings] = useState<UserSettingsUpdate>({});
    const [hiveThresholds, setHiveThresholds] = useState<Record<string, {
        temp_high?: number;
        temp_low?: number;
        weight_drop?: number;
    }>>({});

    const handleSaveGeneral = async () => {
        try {
            await updateSettingsMutation.mutateAsync(localSettings);
            setLocalSettings({});
            toast.success("Global Configuration Updated");
        } catch (error) {
            // Error handled by service toast
        }
    };

    const handleUpdateHiveThreshold = async (hiveId: string) => {
        const thresholds = hiveThresholds[hiveId];
        if (!thresholds) return;

        try {
            await updateHiveThresholdsMutation.mutateAsync({
                hiveId,
                thresholds
            });
            const newThresholds = { ...hiveThresholds };
            delete newThresholds[hiveId];
            setHiveThresholds(newThresholds);
            toast.success(`Node ${hiveId.slice(0, 8)} Thresholds Set`);
        } catch (error) {
            // Error handled by service toast
        }
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            const file = event.target.files?.[0];
            if (!file) return;

            if (!supabase) {
                toast.error("Database connection unavailable");
                return;
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            const { error: updateError } = await supabase.auth.updateUser({
                data: { avatar_url: publicUrl }
            });

            if (updateError) throw updateError;

            toast.success("Identity Visual Synchronized");
        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            toast.error(error.message || "Identity update failed");
        } finally {
            setUploading(false);
        }
    };

    const handleEmailUpdate = async () => {
        if (!newEmail || !newEmail.includes('@')) {
            toast.error("Invalid Email Structure");
            return;
        }

        try {
            setEmailUpdating(true);
            if (!supabase) throw new Error("Database connection unavailable");

            const { error } = await supabase.auth.updateUser({ email: newEmail });
            if (error) throw error;

            toast.success("Verification Packet Transmitted");
            setNewEmail('');
        } catch (error: any) {
            toast.error(error.message || "Email propagation failed");
        } finally {
            setEmailUpdating(false);
        }
    };

    const handlePasswordUpdate = async () => {
        if (!newPassword || newPassword.length < 6) {
            toast.error("Entropy Requirement: Min 6 chars");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Credential Mismatch");
            return;
        }

        try {
            setPasswordUpdating(true);
            if (!supabase) throw new Error("Database connection unavailable");

            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;

            toast.success("Security Signature Rotated");
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            toast.error(error.message || "Credential rotation failed");
        } finally {
            setPasswordUpdating(false);
        }
    };

    const userMetadata = user?.user_metadata || {};
    const firstName = userMetadata.first_name || '';
    const lastName = userMetadata.last_name || '';
    const email = user?.email || '';

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0, opacity: 1,
            transition: { type: "spring", stiffness: 100, damping: 15 }
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-16 pb-32 max-w-[1400px] mx-auto"
        >
            {/* Cinematic Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                <div>
                    <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-beeyield-forest/5 border border-beeyield-forest/10 mb-8">
                        <Settings2 className="w-4 h-4 text-beeyield-forest" />
                        <span className="text-[11px] font-black text-beeyield-forest uppercase tracking-[0.2em]">Global Configuration Suite</span>
                    </div>
                    <h1 className="text-6xl font-black text-beeyield-charcoal tracking-tighter leading-none">
                        System <span className="text-beeyield-forest">Protocols.</span>
                    </h1>
                    <p className="text-gray-500 font-medium mt-6 text-xl max-w-2xl leading-relaxed">
                        Orchestrate your sovereign identity, biometric thresholds, and ecosystem communication parameters.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                {/* Left Column: Personal & Bio-Thresholds */}
                <div className="space-y-12">
                    {/* Identity & Core Settings */}
                    <motion.div variants={itemVariants}>
                        <Card className="rounded-[3.5rem] border-[#E0E0E0] bg-white shadow-sm overflow-hidden hover:shadow-2xl hover:shadow-beeyield-forest/5 transition-all duration-700">
                            <CardHeader className="p-12 pb-4">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-beeyield-forest/10 flex items-center justify-center text-beeyield-forest border border-beeyield-forest/20">
                                        <UserRound className="w-6 h-6" />
                                    </div>
                                    <CardTitle className="text-3xl font-black text-beeyield-charcoal">{t('general')}</CardTitle>
                                </div>
                                <CardDescription className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Primary Identity Registry</CardDescription>
                            </CardHeader>
                            <CardContent className="p-12 space-y-8">
                                {/* Profile Photo Upload */}
                                <div className="flex flex-col items-center justify-center py-6">
                                    <div className="relative group cursor-pointer">
                                        <div className="absolute inset-0 bg-beeyield-forest/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                        <Avatar className="h-40 w-40 border-8 border-beeyield-sand/30 shadow-2xl relative z-10 transition-transform duration-500 group-hover:scale-105">
                                            <AvatarImage src={userMetadata.avatar_url} className="object-cover" />
                                            <AvatarFallback className="text-5xl bg-beeyield-forest text-white font-black">
                                                {firstName?.charAt(0) || email?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-beeyield-charcoal/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer text-white z-20 backdrop-blur-sm">
                                            {uploading ? <Loader2 className="w-10 h-10 animate-spin" /> : <Camera className="w-10 h-10 drop-shadow-2xl" />}
                                        </label>
                                        <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
                                    </div>
                                    <Badge className="bg-beeyield-sand text-beeyield-forest px-4 py-2 mt-8 rounded-full text-[10px] font-black uppercase tracking-widest border-none">Root Authorization</Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="relative group">
                                        <Label className="absolute left-6 top-4 text-[9px] font-black text-gray-400 uppercase tracking-widest z-10">First Identification</Label>
                                        <Input defaultValue={firstName} className="h-20 pt-8 pb-3 px-6 rounded-3xl border-2 border-beeyield-sand bg-white font-black text-beeyield-charcoal shadow-none focus:ring-0 focus:border-beeyield-forest transition-all" />
                                    </div>
                                    <div className="relative group">
                                        <Label className="absolute left-6 top-4 text-[9px] font-black text-gray-400 uppercase tracking-widest z-10">Last Identification</Label>
                                        <Input defaultValue={lastName} className="h-20 pt-8 pb-3 px-6 rounded-3xl border-2 border-beeyield-sand bg-white font-black text-beeyield-charcoal shadow-none focus:ring-0 focus:border-beeyield-forest transition-all" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="relative">
                                        <Label className="absolute left-6 top-4 text-[9px] font-black text-gray-400 uppercase tracking-widest z-10">Unit Protocol</Label>
                                        <Select value={localSettings.unit_system || settings?.unit_system || 'Metric'} onValueChange={(val) => setLocalSettings(prev => ({ ...prev, unit_system: val as any }))}>
                                            <SelectTrigger className="h-20 pt-8 pb-3 px-6 rounded-3xl border-2 border-beeyield-sand bg-white font-black text-beeyield-charcoal shadow-none focus:ring-0 focus:border-beeyield-forest transition-all">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-3xl border-beeyield-sand shadow-2xl p-2">
                                                <SelectItem value="Metric" className="rounded-2xl font-bold py-4">Metric System (SI)</SelectItem>
                                                <SelectItem value="Imperial" className="rounded-2xl font-bold py-4">Imperial System</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="relative">
                                        <Label className="absolute left-6 top-4 text-[9px] font-black text-gray-400 uppercase tracking-widest z-10">Visual Theme</Label>
                                        <Select value={theme} onValueChange={(val: any) => { setTheme(val); setLocalSettings(prev => ({ ...prev, theme: val })); }}>
                                            <SelectTrigger className="h-20 pt-8 pb-3 px-6 rounded-3xl border-2 border-beeyield-sand bg-white font-black text-beeyield-charcoal shadow-none focus:ring-0 focus:border-beeyield-forest transition-all">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-3xl border-beeyield-sand shadow-2xl p-2">
                                                <SelectItem value="system" className="rounded-2xl font-bold py-4">Auto Sync</SelectItem>
                                                <SelectItem value="light" className="rounded-2xl font-bold py-4">High Contrast</SelectItem>
                                                <SelectItem value="dark" className="rounded-2xl font-bold py-4">Midnight Mode</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="relative">
                                    <Label className="absolute left-6 top-4 text-[9px] font-black text-gray-400 uppercase tracking-widest z-10">Regional Language</Label>
                                    <Select value={language} onValueChange={(val) => setLanguage(val as LanguageCode)}>
                                        <SelectTrigger className="h-20 pt-8 pb-3 px-6 rounded-3xl border-2 border-beeyield-sand bg-white font-black text-beeyield-charcoal shadow-none focus:ring-0 focus:border-beeyield-forest transition-all">
                                            <div className="flex items-center gap-3">
                                                <img src={languages.find(l => l.code === language)?.flag} className="w-5 h-3.5 object-cover rounded-[2px] shadow-sm border border-black/5" alt="flag" />
                                                <SelectValue />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="rounded-[2.5rem] border-beeyield-sand shadow-2xl p-3 max-h-[500px]">
                                            {languages.map((lang) => (
                                                <SelectItem key={lang.code} value={lang.code} className="rounded-2xl font-bold py-5 px-6">
                                                    <div className="flex items-center gap-4">
                                                        <img src={lang.flag} className="w-6 h-4 object-cover rounded-[3px] shadow-sm border border-black/5" alt={lang.name} />
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black text-beeyield-charcoal">{lang.name}</span>
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{lang.country}</span>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button
                                        onClick={handleSaveGeneral}
                                        disabled={updateSettingsMutation.isPending || Object.keys(localSettings).length === 0}
                                        className="h-16 px-12 rounded-[2rem] bg-beeyield-charcoal text-white hover:bg-beeyield-forest transition-all font-black text-[11px] uppercase tracking-[0.2em] shadow-xl"
                                    >
                                        {updateSettingsMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                        Propagate Changes
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Sensor Thresholds */}
                    <motion.div variants={itemVariants}>
                        <Card className="rounded-[3.5rem] border-[#E0E0E0] bg-white shadow-sm overflow-hidden hover:shadow-2xl hover:shadow-beeyield-forest/5 transition-all duration-700">
                            <CardHeader className="p-12 pb-4">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-500/20">
                                        <Zap className="w-6 h-6" />
                                    </div>
                                    <CardTitle className="text-3xl font-black text-beeyield-charcoal">Biometric Constraints</CardTitle>
                                </div>
                                <CardDescription className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Real-time Telemetry Triggers</CardDescription>
                            </CardHeader>
                            <CardContent className="p-12 space-y-12">
                                {/* Temperature Slider */}
                                <div className="space-y-8">
                                    <div className="flex justify-between items-center bg-beeyield-sand/20 p-6 rounded-3xl border border-beeyield-sand">
                                        <div>
                                            <span className="text-xs font-black text-beeyield-charcoal uppercase tracking-[0.2em] flex items-center gap-3">
                                                <Thermometer className="w-5 h-5 text-orange-500" /> Temperature Envelope
                                            </span>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Nominal Operation Range</p>
                                        </div>
                                        <div className="bg-white border-2 border-beeyield-sand text-beeyield-charcoal px-4 py-2 rounded-2xl font-black text-sm shadow-sm">
                                            {prdIoT?.temp_min_threshold}°C — {prdIoT?.temp_max_threshold}°C
                                        </div>
                                    </div>
                                    <div className="px-4">
                                        <Slider
                                            defaultValue={[prdIoT?.temp_min_threshold || 15, prdIoT?.temp_max_threshold || 38]}
                                            max={50} min={0} step={0.5}
                                            onValueChange={(v) => updatePrdIoT.mutate({ temp_min_threshold: v[0], temp_max_threshold: v[1] })}
                                            className="text-beeyield-forest"
                                        />
                                    </div>
                                </div>

                                {/* Weight Drop Slider */}
                                <div className="space-y-8">
                                    <div className="flex justify-between items-center bg-beeyield-sand/20 p-6 rounded-3xl border border-beeyield-sand">
                                        <div>
                                            <span className="text-xs font-black text-beeyield-charcoal uppercase tracking-[0.2em] flex items-center gap-3">
                                                <Weight className="w-5 h-5 text-blue-500" /> Kinetic Drift Alarm
                                            </span>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Trigger for Swarm/Theft</p>
                                        </div>
                                        <div className="bg-white border-2 border-beeyield-sand text-beeyield-charcoal px-4 py-2 rounded-2xl font-black text-sm shadow-sm">
                                            {prdIoT?.weight_drop_alert_kg} kg Delta
                                        </div>
                                    </div>
                                    <div className="px-4">
                                        <Slider
                                            defaultValue={[prdIoT?.weight_drop_alert_kg || 2]}
                                            max={10} min={0.5} step={0.5}
                                            onValueChange={(v) => updatePrdIoT.mutate({ weight_drop_alert_kg: v[0] })}
                                        />
                                    </div>
                                </div>

                                {/* Humidity Range Slider */}
                                <div className="space-y-8">
                                    <div className="flex justify-between items-center bg-beeyield-sand/20 p-6 rounded-3xl border border-beeyield-sand">
                                        <div>
                                            <span className="text-xs font-black text-beeyield-charcoal uppercase tracking-[0.2em] flex items-center gap-3">
                                                <Droplets className="w-5 h-5 text-cyan-500" /> Atmospheric Index
                                            </span>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Critical Hive Hydration</p>
                                        </div>
                                        <div className="bg-white border-2 border-beeyield-sand text-beeyield-charcoal px-4 py-2 rounded-2xl font-black text-sm shadow-sm">
                                            {prdIoT?.humidity_min_threshold}% — {prdIoT?.humidity_max_threshold}% RH
                                        </div>
                                    </div>
                                    <div className="px-4">
                                        <Slider
                                            defaultValue={[prdIoT?.humidity_min_threshold || 40, prdIoT?.humidity_max_threshold || 80]}
                                            max={100} min={0} step={1}
                                            onValueChange={(v) => updatePrdIoT.mutate({ humidity_min_threshold: v[0], humidity_max_threshold: v[1] })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Right Column: Communication & Security */}
                <div className="space-y-12">
                    {/* Communication Protocols */}
                    <motion.div variants={itemVariants}>
                        <Card className="rounded-[3.5rem] border-[#E0E0E0] bg-beeyield-charcoal text-white shadow-2xl overflow-hidden group">
                            <CardHeader className="p-12 pb-6 border-b border-white/5">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-beeyield-forest border border-white/10 group-hover:bg-beeyield-forest group-hover:text-white transition-all">
                                        <BellRing className="w-6 h-6" />
                                    </div>
                                    <CardTitle className="text-3xl font-black">Link Protocols</CardTitle>
                                </div>
                                <CardDescription className="text-white/30 font-bold uppercase tracking-widest text-[10px]">Ecosystem Propagation Channels</CardDescription>
                            </CardHeader>
                            <CardContent className="p-12 space-y-10">
                                {/* Master Channels */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    {[
                                        { id: 'email', label: 'Neural Mail', icon: Mail, checked: prdNotifications?.email_alerts_enabled, action: (v: boolean) => updatePrdNotif.mutate({ email_alerts_enabled: v }) },
                                        { id: 'push', label: 'Push Logic', icon: Smartphone, checked: prdNotifications?.push_notifications_enabled, action: (v: boolean) => updatePrdNotif.mutate({ push_notifications_enabled: v }) },
                                        { id: 'sms', label: 'Cellular Band', icon: Radio, pro: true }
                                    ].map((channel, i) => (
                                        <div key={i} className={cn(
                                            "flex flex-col items-center p-8 rounded-[2.5rem] border transition-all duration-500",
                                            channel.checked ? "bg-white text-beeyield-charcoal border-white" : "bg-white/5 text-white/40 border-white/10",
                                            channel.pro && "opacity-40 grayscale"
                                        )}>
                                            <channel.icon className={cn("w-7 h-7 mb-4", channel.checked ? "text-beeyield-forest" : "text-white/20")} />
                                            <span className="text-[10px] font-black uppercase tracking-widest mb-6">{channel.label}</span>
                                            {channel.pro ? (
                                                <Badge className="bg-beeyield-forest text-white text-[8px] font-black py-1 px-3">ENCRYPTED</Badge>
                                            ) : (
                                                <Switch checked={channel.checked} onCheckedChange={channel.action} className="data-[state=checked]:bg-beeyield-forest" />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-6 pt-6">
                                    <h4 className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em]">Event Logic</h4>

                                    {[
                                        { id: 'swarm', label: 'Migration Trigger (Swarm)', desc: 'Bio-secretion & frequency shift detection', icon: Zap, color: 'bg-orange-500/10 text-orange-500', checked: prdNotifications?.notify_on_swarm, action: (v: boolean) => updatePrdNotif.mutate({ notify_on_swarm: v }) },
                                        { id: 'theft', label: 'Perimeter Breach (Theft)', desc: 'Accelerometer & GPS drift verification', icon: Shield, color: 'bg-red-500/10 text-red-500', checked: prdNotifications?.notify_on_theft, action: (v: boolean) => updatePrdNotif.mutate({ notify_on_theft: v }) },
                                        { id: 'battery', label: 'Energy Depletion (IoT)', desc: 'Node voltage < 3.2V alert', icon: Zap, color: 'bg-amber-500/10 text-amber-500', checked: prdNotifications?.notify_on_low_battery, action: (v: boolean) => updatePrdNotif.mutate({ notify_on_low_battery: v }) }
                                    ].map((event, i) => (
                                        <div key={i} className="flex items-center justify-between p-7 bg-white/5 rounded-3xl border border-white/5 hover:border-white/20 transition-all group">
                                            <div className="flex items-center gap-6">
                                                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all", event.color)}>
                                                    <event.icon className="w-6 h-6" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-white tracking-tight">{event.label}</span>
                                                    <span className="text-[11px] text-white/30 font-medium">{event.desc}</span>
                                                </div>
                                            </div>
                                            <Switch checked={event.checked} onCheckedChange={event.action} className="data-[state=checked]:bg-beeyield-forest" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Security Identity Verification */}
                    <motion.div variants={itemVariants}>
                        <Card className="rounded-[3.5rem] border-[#E0E0E0] bg-white shadow-sm overflow-hidden group">
                            <CardHeader className="p-12 pb-4">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-beeyield-forest/5 flex items-center justify-center text-beeyield-forest border border-beeyield-forest/10">
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                    <CardTitle className="text-3xl font-black text-beeyield-charcoal">Security Ledger</CardTitle>
                                </div>
                                <CardDescription className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Credential Rotation & Access</CardDescription>
                            </CardHeader>
                            <CardContent className="p-12 space-y-8">
                                <div className="space-y-6">
                                    <div className="relative group">
                                        <Label className="absolute left-6 top-4 text-[9px] font-black text-gray-400 uppercase tracking-widest z-10">Neural Address Re-Route</Label>
                                        <Input
                                            type="email"
                                            placeholder="Authorized Secondary Email"
                                            value={newEmail}
                                            onChange={(e) => setNewEmail(e.target.value)}
                                            className="h-20 pt-8 pb-3 px-6 rounded-3xl border-2 border-beeyield-sand bg-white font-black text-beeyield-charcoal shadow-none focus:ring-0 focus:border-beeyield-forest transition-all"
                                        />
                                        <Mail className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                                    </div>
                                    <Button
                                        onClick={handleEmailUpdate}
                                        disabled={emailUpdating || !newEmail}
                                        className="w-full h-16 rounded-[2rem] bg-beeyield-charcoal text-white hover:bg-beeyield-forest transition-all font-black text-[11px] uppercase tracking-[0.2em]"
                                    >
                                        {emailUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                                        Initialize Migration
                                    </Button>
                                </div>

                                <div className="h-[1px] w-full bg-beeyield-sand" />

                                <div className="space-y-6">
                                    <div className="relative group">
                                        <Label className="absolute left-6 top-4 text-[9px] font-black text-gray-400 uppercase tracking-widest z-10">New Cipher Key</Label>
                                        <Input
                                            type="password"
                                            placeholder="Entropy Strength > Default"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="h-20 pt-8 pb-3 px-6 rounded-3xl border-2 border-beeyield-sand bg-white font-black text-beeyield-charcoal shadow-none focus:ring-0 focus:border-beeyield-forest transition-all"
                                        />
                                    </div>
                                    <div className="relative group">
                                        <Label className="absolute left-6 top-4 text-[9px] font-black text-gray-400 uppercase tracking-widest z-10">Verify Cipher</Label>
                                        <Input
                                            type="password"
                                            placeholder="Parity Check"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="h-20 pt-8 pb-3 px-6 rounded-3xl border-2 border-beeyield-sand bg-white font-black text-beeyield-charcoal shadow-none focus:ring-0 focus:border-beeyield-forest transition-all"
                                        />
                                    </div>
                                    <Button
                                        onClick={handlePasswordUpdate}
                                        disabled={passwordUpdating || !newPassword}
                                        className="w-full h-16 rounded-[2rem] bg-beeyield-charcoal text-white hover:bg-beeyield-forest transition-all font-black text-[11px] uppercase tracking-[0.2em]"
                                    >
                                        Rotate Security Signature
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="pt-20 border-t border-beeyield-sand">
                <Card className="rounded-[4rem] border-red-100 bg-red-50/10 shadow-sm overflow-hidden group border-2 border-dashed">
                    <CardHeader className="p-16 text-center">
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto mb-8 group-hover:bg-red-500 group-hover:text-white transition-all">
                            <AlertCircle className="w-10 h-10" />
                        </div>
                        <CardTitle className="text-4xl font-black text-red-600 tracking-tighter mb-4">Permanent Termination</CardTitle>
                        <p className="text-red-400/60 font-medium text-lg max-w-2xl mx-auto leading-relaxed">
                            Requesting account termination results in the irreversible excision of all authorized telemetry, certificates, and historical biometric digests.
                        </p>
                    </CardHeader>
                    <CardContent className="p-16 pt-0 flex justify-center">
                        <Button
                            variant="ghost"
                            onClick={handleDeleteAccount}
                            disabled={deletingAccount}
                            className="h-20 px-16 rounded-[2.5rem] bg-white border-2 border-red-100 text-red-500 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all font-black text-[12px] uppercase tracking-[0.3em] shadow-xl shadow-red-500/5"
                        >
                            Execute Termination
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SettingsView;
