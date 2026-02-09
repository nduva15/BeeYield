import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Settings2, CloudRain, Briefcase, UserRound, Star, HelpCircle, Camera, Loader2, Mail, Check, ChevronDown, Sparkles, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSettings } from '@/contexts/SettingsContext';
import { LanguageCode } from '@/lib/translations';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useUserSettings, useUpdateSettings, useUpdateNotificationConfig, useUpdateHiveThresholds } from '@/hooks/useSettingsData';
import { UserSettingsUpdate, NotificationConfigUpdate } from '@/services/beeyieldService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useHives } from '@/hooks/useApiaries';

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
    const { data: allHives } = useHives();

    // State for local overrides before saving
    const [localSettings, setLocalSettings] = useState<UserSettingsUpdate>({});
    const [hiveThresholds, setHiveThresholds] = useState<Record<string, {
        temp_threshold_high?: number;
        temp_threshold_low?: number;
        weight_drop_threshold?: number;
    }>>({});

    const handleSaveGeneral = async () => {
        try {
            await updateSettingsMutation.mutateAsync(localSettings);
            setLocalSettings({});
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
            // Clear local state for this hive after successful update
            const newThresholds = { ...hiveThresholds };
            delete newThresholds[hiveId];
            setHiveThresholds(newThresholds);
        } catch (error) {
            // Error handled by service toast
        }
    };

    const handleNotifToggle = async (eventType: string, field: 'email_enabled' | 'push_enabled' | 'sms_enabled', value: boolean) => {
        try {
            await updateNotifMutation.mutateAsync({
                eventType,
                config: { [field]: value }
            });
        } catch (error) {
            // Error handled by service toast
        }
    };

    // State for modules
    const [modules, setModules] = useState([
        { id: 'beeyield', icon: Sparkles, label: 'BeeYield System', desc: t('beeyield_desc'), enabled: true, priority: true },
        { id: 'iot', icon: Settings2, label: 'IoT Core', desc: t('iot_desc'), enabled: true },
        { id: 'traceability', icon: HelpCircle, label: 'Traceability', desc: t('traceability_desc'), enabled: true },
        { id: 'training', icon: BookOpen, label: 'Learning Hub', desc: t('training_desc'), enabled: false },
        { id: 'marketplace', icon: Briefcase, label: 'Marketplace', desc: t('marketplace_desc'), enabled: false },
    ]);

    const userMetadata = user?.user_metadata || {};
    const firstName = userMetadata.first_name || '';
    const lastName = userMetadata.last_name || '';
    const email = user?.email || '';

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            const file = event.target.files?.[0];
            if (!file) return;

            if (!supabase) {
                toast.error("Database connection not available");
                return;
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to 'avatars' bucket
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            const { error: updateError } = await supabase.auth.updateUser({
                data: { avatar_url: publicUrl }
            });

            if (updateError) {
                throw updateError;
            }

            toast.success("Profile photo updated successfully!");
        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            toast.error(error.message || "Error uploading avatar");
        } finally {
            setUploading(false);
        }
    };

    const handleEmailUpdate = async () => {
        if (!newEmail || !newEmail.includes('@')) {
            toast.error("Please enter a valid email address");
            return;
        }

        try {
            setEmailUpdating(true);
            if (!supabase) {
                toast.error("Database connection not available");
                return;
            }

            const { error } = await supabase.auth.updateUser({ email: newEmail });

            if (error) {
                throw error;
            }

            toast.success("Confirmation email sent to both addresses!");
            setNewEmail('');
        } catch (error: any) {
            console.error('Error updating email:', error);
            toast.error(error.message || "Error updating email");
        } finally {
            setEmailUpdating(false);
        }
    };

    const handlePasswordUpdate = async () => {
        if (!newPassword || newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            setPasswordUpdating(true);
            if (!supabase) {
                toast.error("Database connection not available");
                return;
            }

            const { error } = await supabase.auth.updateUser({ password: newPassword });

            if (error) {
                throw error;
            }

            toast.success("Password updated successfully!");
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error('Error updating password:', error);
            toast.error(error.message || "Error updating password");
        } finally {
            setPasswordUpdating(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm("Are you absolutely sure you want to delete your account? This action cannot be undone.")) {
            return;
        }

        try {
            setDeletingAccount(true);
            if (!supabase) {
                toast.error("Database connection not available");
                return;
            }

            toast.error("For security reasons, account deletion must be handled by an administrator. Please contact support@beeyield.com");
        } catch (error: any) {
            console.error('Error deleting account:', error);
            toast.error(error.message || "Error deleting account");
        } finally {
            setDeletingAccount(false);
        }
    };

    const toggleModule = (id: string) => {
        setModules(prev => prev.map(m =>
            m.id === id ? { ...m, enabled: !m.enabled } : m
        ));
    };

    const enableAllModules = () => {
        setModules(prev => prev.map(m => ({ ...m, enabled: true })));
        toast.success("All modules enabled");
    };

    const disableAllModules = () => {
        setModules(prev => prev.map(m => ({ ...m, enabled: false })));
        toast.success("All modules disabled");
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring" as const,
                stiffness: 100,
                damping: 15
            }
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-8 pb-24 max-w-[1600px] mx-auto"
        >

            <motion.h1 variants={itemVariants} className="text-[2.5rem] font-bold text-[#0F172A] dark:text-white tracking-tight px-2">{t('settings')}</motion.h1>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-8">
                    {/* General Section */}
                    <motion.div variants={itemVariants}>
                        <Card className="rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-500">
                            <CardHeader className="p-10 pb-2">
                                <CardTitle className="text-2xl font-black tracking-tight">{t('general')}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-10 space-y-6">
                                {/* Profile Photo Upload */}
                                <div className="flex flex-col items-center justify-center pb-8 border-b border-dashed border-gray-200 dark:border-gray-800 mb-2">
                                    <div className="relative group cursor-pointer">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-amber-200 to-orange-500 rounded-full blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
                                        <Avatar className="h-32 w-32 border-[6px] border-white dark:border-[#09090b] shadow-2xl relative z-10 transition-transform duration-300 group-hover:scale-105">
                                            <AvatarImage src={userMetadata.avatar_url} className="object-cover" />
                                            <AvatarFallback className="text-4xl bg-gradient-to-br from-amber-400 to-orange-500 text-white font-black">
                                                {firstName?.charAt(0) || email?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer text-white z-20 backdrop-blur-sm">
                                            {uploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Camera className="w-8 h-8 drop-shadow-lg" />}
                                        </label>
                                        <input
                                            id="avatar-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleAvatarUpload}
                                            disabled={uploading}
                                        />
                                        <motion.div
                                            whileHover={{ scale: 1.1 }}
                                            className="absolute bottom-1 right-1 bg-white dark:bg-[#0F172A] p-2.5 rounded-full shadow-lg border border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 z-30 cursor-pointer pointer-events-none"
                                        >
                                            <Camera className="w-4 h-4" />
                                        </motion.div>
                                    </div>
                                    <p className="text-xs font-bold text-gray-400 mt-6 uppercase tracking-widest bg-gray-50 dark:bg-white/5 py-1.5 px-4 rounded-full">{t('tap_to_update')}</p>
                                </div>

                                <div className="relative group">
                                    <Label htmlFor="username" className="absolute left-4 top-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest z-10 pointer-events-none">{t('username')}</Label>
                                    <Input id="username" defaultValue={email.split('@')[0]} className="pt-8 pb-3 px-4 rounded-2xl bg-gray-50/50 dark:bg-[#1e1e1e] border-gray-100 dark:border-gray-800 h-[4.5rem] shadow-none font-bold text-gray-400 cursor-not-allowed group-hover:border-amber-200/50 transition-colors focus-visible:ring-0 focus-visible:border-amber-400" readOnly />
                                </div>

                                <div className="relative group">
                                    <Label htmlFor="email" className="absolute left-4 top-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest z-10 pointer-events-none">{t('email')}</Label>
                                    <Input id="email" defaultValue={email} className="pt-8 pb-3 px-4 rounded-2xl bg-gray-50/50 dark:bg-[#1e1e1e] border-gray-100 dark:border-gray-800 h-[4.5rem] shadow-none font-bold text-gray-400 cursor-not-allowed group-hover:border-amber-200/50 transition-colors focus-visible:ring-0 focus-visible:border-amber-400" readOnly />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative group">
                                        <Label htmlFor="firstname" className="absolute left-4 top-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest z-10 pointer-events-none">{t('first_name')}</Label>
                                        <Input id="firstname" defaultValue={firstName} className="pt-8 pb-3 px-4 rounded-2xl bg-gray-50/30 dark:bg-[#09090b] border-gray-100 dark:border-gray-800 h-[4.5rem] shadow-none font-bold group-hover:border-amber-500/30 focus:border-amber-500 transition-all outline-none focus-visible:ring-0 focus-visible:bg-white dark:focus-visible:bg-black" />
                                    </div>
                                    <div className="relative group">
                                        <Label htmlFor="surname" className="absolute left-4 top-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest z-10 pointer-events-none">{t('surname')}</Label>
                                        <Input id="surname" defaultValue={lastName} className="pt-8 pb-3 px-4 rounded-2xl bg-gray-50/30 dark:bg-[#09090b] border-gray-100 dark:border-gray-800 h-[4.5rem] shadow-none font-bold group-hover:border-amber-500/30 focus:border-amber-500 transition-all outline-none focus-visible:ring-0 focus-visible:bg-white dark:focus-visible:bg-black" />
                                    </div>
                                </div>

                                <div className="relative group">
                                    <Label htmlFor="phone" className="absolute left-4 top-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest z-10 pointer-events-none">{t('phone')}</Label>
                                    <Input id="phone" defaultValue="0742014187" className="pt-8 pb-3 px-4 rounded-2xl bg-gray-50/30 dark:bg-[#09090b] border-gray-100 dark:border-gray-800 h-[4.5rem] shadow-none font-bold group-hover:border-amber-500/30 focus:border-amber-500 transition-all outline-none focus-visible:ring-0 focus-visible:bg-white dark:focus-visible:bg-black" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative group">
                                        <Label htmlFor="unit_system" className="absolute left-4 top-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest z-40 pointer-events-none">Unit System</Label>
                                        <Select
                                            value={localSettings.unit_system || settings?.unit_system || 'Metric'}
                                            onValueChange={(val) => setLocalSettings(prev => ({ ...prev, unit_system: val as any }))}
                                        >
                                            <SelectTrigger className="w-full pt-8 pb-3 px-4 rounded-2xl bg-gray-50/30 dark:bg-[#09090b] border-gray-100 dark:border-gray-800 h-[4.5rem] shadow-none font-bold hover:border-amber-500/30 focus:border-amber-500 transition-all outline-none focus:ring-0">
                                                <SelectValue placeholder="System" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-gray-100 dark:border-gray-800">
                                                <SelectItem value="Metric">Metric (kg, °C)</SelectItem>
                                                <SelectItem value="Imperial">Imperial (lb, °F)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="relative group">
                                        <Label htmlFor="theme" className="absolute left-4 top-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest z-40 pointer-events-none">Theme</Label>
                                        <Select
                                            value={localSettings.theme || settings?.theme || 'System'}
                                            onValueChange={(val) => setLocalSettings(prev => ({ ...prev, theme: val as any }))}
                                        >
                                            <SelectTrigger className="w-full pt-8 pb-3 px-4 rounded-2xl bg-gray-50/30 dark:bg-[#09090b] border-gray-100 dark:border-gray-800 h-[4.5rem] shadow-none font-bold hover:border-amber-500/30 focus:border-amber-500 transition-all outline-none focus:ring-0">
                                                <SelectValue placeholder="Theme" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-gray-100 dark:border-gray-800">
                                                <SelectItem value="System">Auto (System)</SelectItem>
                                                <SelectItem value="Light">Light</SelectItem>
                                                <SelectItem value="Dark">Dark</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="relative group">
                                    <Label htmlFor="language" className="absolute left-4 top-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest z-40 pointer-events-none">{t('language')}</Label>
                                    <Select value={language} onValueChange={(val) => setLanguage(val as LanguageCode)}>
                                        <SelectTrigger
                                            className="w-full pt-8 pb-3 px-4 rounded-2xl bg-gray-50/30 dark:bg-[#09090b] border-gray-100 dark:border-gray-800 h-[4.5rem] shadow-none font-bold hover:border-amber-500/30 focus:border-amber-500 transition-all outline-none focus:ring-0 flex items-center justify-between group"
                                        >
                                            <div className="flex items-center w-full pt-1">
                                                <SelectValue placeholder={t('language')} />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-xl shadow-xl overflow-hidden min-w-[300px]">
                                            {languages.map((lang) => (
                                                <SelectItem
                                                    key={lang.code}
                                                    value={lang.code}
                                                    className="py-3 px-4 focus:bg-amber-50 dark:focus:bg-amber-900/10 cursor-pointer rounded-xl my-1 mx-1"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-6 h-4 rounded-[3px] overflow-hidden shadow-sm border border-black/10 flex-shrink-0">
                                                            <img src={lang.flag} alt={lang.country} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-sm text-gray-900 dark:text-gray-100">{lang.name}</span>
                                                            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{lang.country}</span>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleSaveGeneral}
                                        disabled={updateSettingsMutation.isPending || Object.keys(localSettings).length === 0}
                                        className="bg-[#B48428]/10 text-[#B48428] border-2 border-[#B48428]/20 hover:bg-[#B48428] hover:text-white rounded-2xl px-12 py-3 font-bold text-sm transition-all shadow-sm hover:shadow-lg hover:shadow-amber-500/20 disabled:opacity-50"
                                    >
                                        {updateSettingsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2inline" /> : null}
                                        {t('save_changes')}
                                    </motion.button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* IoT Thresholds Section */}
                    <motion.div variants={itemVariants}>
                        <Card className="rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-500">
                            <CardHeader className="p-10 pb-4">
                                <CardTitle className="text-2xl font-black leading-tight">IoT Alert Thresholds</CardTitle>
                                <p className="text-sm text-gray-400 font-medium pt-2">Global default thresholds for your smart sensors</p>
                            </CardHeader>
                            <CardContent className="p-10 pt-0 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative group">
                                        <Label className="absolute left-4 top-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest z-10">High Temp (°C)</Label>
                                        <Input
                                            type="number"
                                            defaultValue={settings?.temp_threshold_high}
                                            onChange={(e) => setLocalSettings(prev => ({ ...prev, temp_threshold_high: parseFloat(e.target.value) }))}
                                            className="pt-8 pb-3 px-4 rounded-2xl bg-gray-50/30 dark:bg-[#09090b] border-gray-100 dark:border-gray-800 h-[4.5rem] font-bold"
                                        />
                                    </div>
                                    <div className="relative group">
                                        <Label className="absolute left-4 top-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest z-10">Low Temp (°C)</Label>
                                        <Input
                                            type="number"
                                            defaultValue={settings?.temp_threshold_low}
                                            onChange={(e) => setLocalSettings(prev => ({ ...prev, temp_threshold_low: parseFloat(e.target.value) }))}
                                            className="pt-8 pb-3 px-4 rounded-2xl bg-gray-50/30 dark:bg-[#09090b] border-gray-100 dark:border-gray-800 h-[4.5rem] font-bold"
                                        />
                                    </div>
                                </div>
                                <div className="relative group">
                                    <Label className="absolute left-4 top-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest z-10">Weight Drop Alert (kg)</Label>
                                    <Input
                                        type="number"
                                        defaultValue={settings?.weight_drop_threshold}
                                        onChange={(e) => setLocalSettings(prev => ({ ...prev, weight_drop_threshold: parseFloat(e.target.value) }))}
                                        className="pt-8 pb-3 px-4 rounded-2xl bg-gray-50/30 dark:bg-[#09090b] border-gray-100 dark:border-gray-800 h-[4.5rem] font-bold"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleSaveGeneral}
                                        className="bg-transparent border-2 border-gray-200 dark:border-gray-800 text-gray-500 hover:border-[#B48428] hover:text-[#B48428] rounded-2xl px-10 py-3 font-bold text-sm transition-all"
                                    >
                                        Save Defaults
                                    </motion.button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* AI Auto Notifications */}

                    {/* Email Notifications Hub */}
                    <motion.div variants={itemVariants}>
                        <Card className="rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-500">
                            <CardHeader className="p-10 pb-4">
                                <CardTitle className="text-2xl font-black leading-tight">{t('email_notifications_hub')}</CardTitle>
                                <p className="text-sm text-gray-400 font-medium pt-2">Manage how you receive alerts for hive events.</p>
                            </CardHeader>
                            <CardContent className="p-10 pt-0 space-y-6">
                                {settings?.notification_configs?.map((config) => (
                                    <div key={config.event_type} className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300 capitalize">{config.event_type.replace(/_/g, ' ')}</span>
                                            <div className="flex gap-4 mt-2">
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={config.email_enabled}
                                                        onCheckedChange={(val) => handleNotifToggle(config.event_type, 'email_enabled', val)}
                                                        className="scale-75"
                                                    />
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={config.push_enabled}
                                                        onCheckedChange={(val) => handleNotifToggle(config.event_type, 'push_enabled', val)}
                                                        className="scale-75"
                                                    />
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Push</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(!settings?.notification_configs || settings.notification_configs.length === 0) && (
                                    <p className="text-sm text-center text-gray-400 font-medium py-8">No notification configurations found.</p>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    {/* Account Info */}
                    <motion.div variants={itemVariants}>
                        <Card className="rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-500">
                            <CardHeader className="p-10 pb-4">
                                <CardTitle className="text-2xl font-black">{t('account_info')}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-10 pt-0 space-y-6">
                                <div className="flex justify-between items-center py-4 border-b border-gray-50 dark:border-white/5">
                                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <UserRound className="w-4 h-4" /> {t('account_type')}
                                    </span>
                                    <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] uppercase font-black tracking-widest border border-blue-200 dark:border-blue-900/50 px-3 py-1.5">{userMetadata.role || 'BEEKEEPER'}</Badge>
                                </div>
                                <div className="flex justify-between items-center py-4 border-b border-gray-50 dark:border-white/5">
                                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Star className="w-4 h-4" /> {t('subscription')}
                                    </span>
                                    <span className="text-sm font-black text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-lg">-</span>
                                </div>
                                <div className="flex justify-between items-center py-4">
                                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <CloudRain className="w-4 h-4" /> {t('joined')}
                                    </span>
                                    <span className="text-sm font-black text-gray-900 dark:text-white font-mono">{new Date(user?.created_at || Date.now()).toLocaleDateString()}</span>
                                </div>
                                <div className="pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => signOut()}
                                        className="w-full h-14 rounded-2xl border-2 border-red-50 dark:border-red-900/20 text-red-500 hover:bg-red-500 hover:text-white font-black uppercase tracking-widest text-xs transition-all shadow-none"
                                    >
                                        Logout
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Change Email */}
                    <motion.div variants={itemVariants}>
                        <Card className="rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-500">
                            <CardHeader className="p-10 pb-4">
                                <CardTitle className="text-2xl font-black">{t('change_email')}</CardTitle>
                                <p className="text-sm text-gray-400 font-medium pt-2">{t('change_email_desc')}</p>
                            </CardHeader>
                            <CardContent className="p-10 pt-0 space-y-4">
                                <div className="relative group">
                                    <Label htmlFor="new-email" className="absolute left-4 top-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest z-10 pointer-events-none">{t('new_email_address')}</Label>
                                    <Input
                                        id="new-email"
                                        type="email"
                                        placeholder="Enter new email"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        className="pt-8 pb-3 px-4 rounded-2xl bg-gray-50/30 dark:bg-[#09090b] border-gray-100 dark:border-gray-800 h-[4.5rem] shadow-none font-bold group-hover:border-amber-500/30 focus:border-amber-500 transition-all outline-none focus-visible:ring-0 focus-visible:bg-white dark:focus-visible:bg-black"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl px-8 py-3 font-bold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                        onClick={handleEmailUpdate}
                                        disabled={emailUpdating || !newEmail}
                                    >
                                        {emailUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                                        {t('update_email')}
                                    </motion.button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Change Password */}
                    <motion.div variants={itemVariants}>
                        <Card className="rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-500">
                            <CardHeader className="p-10 pb-4">
                                <CardTitle className="text-2xl font-black">{t('change_password')}</CardTitle>
                                <p className="text-sm text-gray-400 font-medium pt-2">{t('change_password_desc')}</p>
                            </CardHeader>
                            <CardContent className="p-10 pt-0 space-y-4">
                                <div className="relative group">
                                    <Label htmlFor="new-password" className="absolute left-4 top-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest z-10 pointer-events-none">{t('new_password')}</Label>
                                    <Input
                                        id="new-password"
                                        type="password"
                                        placeholder="Min 6 characters"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="pt-8 pb-3 px-4 rounded-2xl bg-gray-50/30 dark:bg-[#09090b] border-gray-100 dark:border-gray-800 h-[4.5rem] shadow-none font-bold group-hover:border-amber-500/30 focus:border-amber-500 transition-all outline-none focus-visible:ring-0"
                                    />
                                </div>
                                <div className="relative group">
                                    <Label htmlFor="confirm-password" className="absolute left-4 top-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest z-10 pointer-events-none">{t('confirm_password')}</Label>
                                    <Input
                                        id="confirm-password"
                                        type="password"
                                        placeholder="Repeat new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pt-8 pb-3 px-4 rounded-2xl bg-gray-50/30 dark:bg-[#09090b] border-gray-100 dark:border-gray-800 h-[4.5rem] shadow-none font-bold group-hover:border-amber-500/30 focus:border-amber-500 transition-all outline-none focus-visible:ring-0"
                                    />
                                </div>
                                <div className="flex justify-end pt-2">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl px-10 py-3 font-bold text-sm transition-all disabled:opacity-50"
                                        onClick={handlePasswordUpdate}
                                        disabled={passwordUpdating || !newPassword || !confirmPassword}
                                    >
                                        {passwordUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                        {t('change_password')}
                                    </motion.button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Delete Account */}
                    <motion.div variants={itemVariants}>
                        <Card className="rounded-[2.5rem] border border-red-50 dark:border-red-900/10 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-500">
                            <CardHeader className="p-10 pb-4">
                                <CardTitle className="text-2xl font-black text-red-600">{t('delete_account')}</CardTitle>
                                <p className="text-sm text-red-400 font-medium pt-4 leading-relaxed">{t('delete_account_desc')}</p>
                            </CardHeader>
                            <CardContent className="p-10 pt-0">
                                <div className="flex justify-end pt-4">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="bg-red-50 dark:bg-red-900/10 border-2 border-red-100 dark:border-red-900/20 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl px-10 py-3 font-bold text-sm transition-all shadow-none disabled:opacity-50"
                                        onClick={handleDeleteAccount}
                                        disabled={deletingAccount}
                                    >
                                        {deletingAccount ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                        {t('delete_my_account')}
                                    </motion.button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Guides & Tutorials */}
                    <motion.div variants={itemVariants}>
                        <Card className="rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-500">
                            <CardHeader className="p-10 pb-4">
                                <CardTitle className="text-2xl font-black">{t('guides_tutorials')}</CardTitle>
                                <p className="text-sm text-gray-400 font-medium pt-2">{t('guides_tutorials_desc')}</p>
                            </CardHeader>
                            <CardContent className="p-10 pt-0 space-y-8">
                                <div className="flex items-center gap-4 bg-gray-50/50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                                    <Switch
                                        checked={showGuides}
                                        onCheckedChange={setShowGuides}
                                        className="data-[state=checked]:bg-[#B48428] scale-125 ml-2"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{t('enable_tips_tutorials')}</span>
                                        <span className="text-[10px] text-gray-400 font-medium">{t('helper_tooltips_desc')}</span>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="bg-transparent border-2 border-gray-200 dark:border-gray-800 text-gray-500 hover:border-[#B48428] hover:text-[#B48428] rounded-2xl px-10 py-3 font-bold text-sm transition-all"
                                    >
                                        {t('save')}
                                    </motion.button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>

            {/* Hive Thresholds Section */}
            <motion.div variants={itemVariants}>
                <Card className="rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl shadow-sm overflow-hidden mt-8 hover:shadow-md transition-all duration-500">
                    <CardHeader className="p-10 pb-6 border-b border-gray-50 dark:border-[#1e1e1e]">
                        <div>
                            <CardTitle className="text-3xl font-black">Hive-Specific Thresholds</CardTitle>
                            <p className="text-sm text-gray-400 font-medium mt-4 max-w-2xl leading-relaxed">
                                Override global defaults for specific hives. Leave blank to use global settings.
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent className="p-10 pt-8">
                        <div className="border border-gray-100 dark:border-[#1e1e1e] rounded-[2.5rem] overflow-hidden">
                            <Table>
                                <TableHeader className="bg-gray-50/50 dark:bg-[#1e1e1e]/20">
                                    <TableRow className="border-b border-gray-100 dark:border-[#1e1e1e] hover:bg-transparent">
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-400 py-4 px-8">Hive Code</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-400 py-4 px-8">High Temp (°C)</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-400 py-4 px-8">Low Temp (°C)</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-400 py-4 px-8">Weight Drop (kg)</TableHead>
                                        <TableHead className="text-right py-4 px-8"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {allHives?.map((hive) => (
                                        <TableRow key={hive.id} className="border-b border-gray-50 dark:border-[#1e1e1e] hover:bg-gray-50/30 dark:hover:bg-white/5 transition-colors">
                                            <TableCell className="py-6 px-8">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-gray-900 dark:text-white">{hive.hive_code}</span>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase">{hive.apiary?.name || 'Main Apiary'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-6 px-8">
                                                <Input
                                                    type="number"
                                                    placeholder={settings?.temp_threshold_high?.toString()}
                                                    value={hiveThresholds[hive.id]?.temp_threshold_high ?? hive.temp_threshold_high ?? ''}
                                                    onChange={(e) => setHiveThresholds(prev => ({
                                                        ...prev,
                                                        [hive.id]: { ...prev[hive.id], temp_threshold_high: parseFloat(e.target.value) }
                                                    }))}
                                                    className="w-24 h-10 rounded-xl bg-gray-50/30 dark:bg-[#09090b] border-gray-100 dark:border-gray-800 font-bold text-sm focus:border-amber-500 transition-all outline-none"
                                                />
                                            </TableCell>
                                            <TableCell className="py-6 px-8">
                                                <Input
                                                    type="number"
                                                    placeholder={settings?.temp_threshold_low?.toString()}
                                                    value={hiveThresholds[hive.id]?.temp_threshold_low ?? hive.temp_threshold_low ?? ''}
                                                    onChange={(e) => setHiveThresholds(prev => ({
                                                        ...prev,
                                                        [hive.id]: { ...prev[hive.id], temp_threshold_low: parseFloat(e.target.value) }
                                                    }))}
                                                    className="w-24 h-10 rounded-xl bg-gray-50/30 dark:bg-[#09090b] border-gray-100 dark:border-gray-800 font-bold text-sm focus:border-amber-500 transition-all outline-none"
                                                />
                                            </TableCell>
                                            <TableCell className="py-6 px-8">
                                                <Input
                                                    type="number"
                                                    placeholder={settings?.weight_drop_threshold?.toString()}
                                                    value={hiveThresholds[hive.id]?.weight_drop_threshold ?? hive.weight_drop_threshold ?? ''}
                                                    onChange={(e) => setHiveThresholds(prev => ({
                                                        ...prev,
                                                        [hive.id]: { ...prev[hive.id], weight_drop_threshold: parseFloat(e.target.value) }
                                                    }))}
                                                    className="w-24 h-10 rounded-xl bg-gray-50/30 dark:bg-[#09090b] border-gray-100 dark:border-gray-800 font-bold text-sm focus:border-amber-500 transition-all outline-none"
                                                />
                                            </TableCell>
                                            <TableCell className="py-6 px-8 text-right">
                                                <Button
                                                    variant="ghost"
                                                    disabled={!hiveThresholds[hive.id] || updateHiveThresholdsMutation.isPending}
                                                    onClick={() => handleUpdateHiveThreshold(hive.id)}
                                                    className="h-10 px-4 rounded-xl font-bold text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 transition-all disabled:opacity-50"
                                                >
                                                    {updateHiveThresholdsMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Update'}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {(!allHives || allHives.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="py-12 text-center text-gray-400 font-bold">
                                                No hives found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Modules Section */}
            <motion.div variants={itemVariants}>
                <Card className="rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl shadow-sm overflow-hidden mt-8 hover:shadow-md transition-all duration-500">
                    <CardHeader className="p-10 pb-6 border-b border-gray-50 dark:border-[#1e1e1e]">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-3xl font-black">{t('modules_settings')}</CardTitle>
                                <p className="text-sm text-gray-400 font-medium mt-4 max-w-2xl leading-relaxed">{t('modules_settings_desc')}</p>
                            </div>
                            <div className="flex gap-2">
                                <motion.button
                                    onClick={enableAllModules}
                                    whileHover={{ scale: 1.05 }}
                                    className="bg-gray-100 dark:bg-white/5 rounded-xl px-5 py-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    {t('enable_all')}
                                </motion.button>
                                <motion.button
                                    onClick={disableAllModules}
                                    whileHover={{ scale: 1.05 }}
                                    className="bg-gray-100 dark:bg-white/5 rounded-xl px-5 py-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    {t('disable_all')}
                                </motion.button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-10 pt-8">
                        <div className="border border-gray-100 dark:border-[#1e1e1e] rounded-[2.5rem] overflow-hidden">
                            <div className="bg-gray-50/50 dark:bg-[#1e1e1e]/20 px-8 py-6 border-b border-gray-100 dark:border-[#1e1e1e]">
                                <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{t('core_modules')}</p>
                                <p className="text-[10px] font-bold text-gray-400 opacity-60">{t('ui_only_desc')}</p>
                            </div>

                            <div className="divide-y divide-gray-50 dark:divide-[#1e1e1e] bg-white dark:bg-[#09090b]">
                                {modules.map((mod) => (
                                    <motion.div
                                        key={mod.id}
                                        whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                                        className="p-8 flex items-center justify-between transition-all"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 bg-white dark:bg-[#09090b] rounded-2xl flex items-center justify-center shadow-lg shadow-gray-100/50 dark:shadow-none border border-gray-100 dark:border-gray-800">
                                                <mod.icon className="w-7 h-7 text-gray-900 dark:text-white" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-lg font-black text-gray-900 dark:text-white">{mod.label}</span>
                                                    {mod.priority && (
                                                        <Badge className="bg-[#B48428] text-white text-[8px] font-black tracking-widest px-2 py-0.5 rounded-sm border-none shadow-sm">{t('priority')}</Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-400 font-medium">{mod.desc}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <motion.button whileTap={{ scale: 0.9 }} className="text-gray-300 hover:text-amber-500 transition-colors">
                                                <Star className={cn("w-6 h-6", mod.id === 'beeyield' ? "fill-amber-500 text-amber-500" : "text-gray-300")} />
                                            </motion.button>
                                            <div className="relative">
                                                <Switch
                                                    checked={mod.enabled}
                                                    onCheckedChange={() => toggleModule(mod.id)}
                                                    className="data-[state=checked]:bg-[#B48428] scale-110"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="px-10 py-6 bg-gray-50/30 dark:bg-white/5 flex flex-col sm:flex-row items-center justify-end gap-1 border-t border-gray-100 dark:border-[#1e1e1e]">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    className="bg-[#B48428] hover:bg-[#966b1d] text-white rounded-2xl px-12 h-14 font-black shadow-xl shadow-amber-500/20 border-none transition-all ml-4 text-base"
                                >
                                    {t('save_changes')}
                                </motion.button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
};

export default SettingsView;
