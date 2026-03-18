import React from 'react';
import { Bell, Shield, Plug, Settings2, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';
import { motion } from 'framer-motion';
import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';

interface NotificationSetting {
    id: string;
    title: string;
    value: string;
}

interface ThresholdSetting {
    id: string;
    title: string;
    value: string;
}

const MetersSettings: React.FC = () => {
    const [activeDialog, setActiveDialog] = React.useState<{ type: 'notification' | 'threshold', id: string } | null>(null);
    const [tempValue, setTempValue] = React.useState('');
    const [isIntegrationsOpen, setIsIntegrationsOpen] = React.useState(false);

    const LS_KEY = React.useMemo(() => 'beeyield_meters_settings_v1', []);

    const [notificationSettings, setNotificationSettings] = React.useState<NotificationSetting[]>([
        { id: 'water_leak', title: 'Water leak', value: 'Email + SMS' },
        { id: 'sudden_spike', title: 'Sudden spike', value: 'Email' },
        { id: 'no_comm', title: 'No communication', value: 'Push' },
    ]);

    const [thresholdSettings, setThresholdSettings] = React.useState<ThresholdSetting[]>([
        { id: 'water', title: 'Water', value: '+25%' },
        { id: 'heat', title: 'Heat', value: '+20%' },
        { id: 'energy', title: 'Energy', value: '+18%' },
    ]);

    // Hydrate + persist locally so settings work without backend.
    React.useEffect(() => {
        try {
            const raw = globalThis.localStorage?.getItem(LS_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed?.notificationSettings)) setNotificationSettings(parsed.notificationSettings);
            if (Array.isArray(parsed?.thresholdSettings)) setThresholdSettings(parsed.thresholdSettings);
        } catch {
            // ignore
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        try {
            globalThis.localStorage?.setItem(LS_KEY, JSON.stringify({ notificationSettings, thresholdSettings }));
        } catch {
            // ignore
        }
    }, [LS_KEY, notificationSettings, thresholdSettings]);

    const handleEdit = (type: 'notification' | 'threshold', id: string, currentValue: string) => {
        setActiveDialog({ type, id });
        setTempValue(currentValue);
    };

    const handleSave = () => {
        if (!activeDialog) return;

        const nextValue = tempValue.trim();
        if (!nextValue) return;

        if (activeDialog.type === 'notification') {
            setNotificationSettings(prev => prev.map(item =>
                item.id === activeDialog.id ? { ...item, value: nextValue } : item
            ));
        } else {
            setThresholdSettings(prev => prev.map(item =>
                item.id === activeDialog.id ? { ...item, value: nextValue } : item
            ));
        }
        setActiveDialog(null);
    };

    const getDialogTitle = () => {
        if (!activeDialog) return '';
        const list = activeDialog.type === 'notification' ? notificationSettings : thresholdSettings;
        const item = list.find(i => i.id === activeDialog.id);
        return item ? `Edit ${item.title}` : 'Edit Setting';
    };

    return (
        <BeeYieldPageShell className="p-0 md:p-0 -m-4 md:-m-6 space-y-0 pb-0">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn("max-w-7xl mx-auto space-y-6 pb-20 p-4 lg:p-6")}>
            <BeeYieldPageHeader
                icon={Settings2}
                label="Sensor rules"
                title={<>System <span className="text-[#F4D03F]">Settings</span></>}
                subtitle="Configure operational bounds and notification triggers."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Notifications */}
                <div className={cn(glass.card, "p-0 shadow-sm overflow-hidden bg-white/40 border-white/20")}>
                    <div className="p-5 border-b border-white/10 bg-white/20 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/50 flex items-center justify-center border border-white/40">
                            <Bell className="w-4 h-4 text-[#F4D03F]" />
                        </div>
                        <h3 className="text-[11px] font-black text-[#1A1A1A]">Notification Triggers</h3>
                    </div>
                    <div className="p-6 space-y-2">
                        {notificationSettings.map((item) => (
                            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl hover:bg-white/50 transition-colors border border-transparent hover:border-white/40 group">
                                <div className="space-y-0.5">
                                    <div className="text-[10px] font-black text-[#1A1A1A]">{item.title}</div>
                                    <div className="text-[9px] font-bold text-gray-500">{item.value}</div>
                                </div>
                                <button
                                    onClick={() => handleEdit('notification', item.id, item.value)}
                                    className={cn(glass.btnSecondary, "text-[9px] font-black h-8 px-4 w-full sm:w-auto opacity-0 group-hover:opacity-100 transition-opacity")}
                                >
                                    Edit
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Alert Thresholds */}
                <div className={cn(glass.card, "p-0 shadow-sm overflow-hidden bg-white/40 border-white/20")}>
                    <div className="p-5 border-b border-white/10 bg-white/20 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/50 flex items-center justify-center border border-white/40">
                            <Shield className="w-4 h-4 text-[#1B9157]" />
                        </div>
                        <h3 className="text-[11px] font-black text-[#1A1A1A]">Threshold Alerts</h3>
                    </div>
                    <div className="p-6 space-y-2">
                        {thresholdSettings.map((item) => (
                            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl hover:bg-white/50 transition-colors border border-transparent hover:border-white/40 group">
                                <div className="space-y-0.5">
                                    <div className="text-[10px] font-black text-[#1A1A1A]">{item.title}</div>
                                    <div className="text-[9px] font-bold text-gray-500">{item.value}</div>
                                </div>
                                <button
                                    onClick={() => handleEdit('threshold', item.id, item.value)}
                                    className={cn(glass.btnSecondary, "text-[9px] font-black h-8 px-4 w-full sm:w-auto opacity-0 group-hover:opacity-100 transition-opacity")}
                                >
                                    Change
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Integrations */}
            <div className={cn(glass.card, "p-6 shadow-sm bg-white/40 border-white/20 relative overflow-hidden group")}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F4D03F]/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-110" />
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center border border-white/40 shadow-sm">
                            <Plug className="w-5 h-5 text-[#F4D03F]" />
                        </div>
                        <h3 className="text-[11px] font-black text-[#1A1A1A] leading-tight">Connect other systems</h3>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsIntegrationsOpen(true)}
                        className={cn(glass.btnPrimary, "w-full sm:w-auto h-8 px-5 font-black text-[9px] flex items-center justify-center gap-2")}
                    >
                        Connect systems <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            <Dialog open={isIntegrationsOpen} onOpenChange={setIsIntegrationsOpen}>
                <DialogContent className={cn(glass.card, "p-0 overflow-hidden shadow-xl max-w-md mx-auto bg-white/80 border-white/40")}>
                    <DialogHeader className="p-5 border-b border-white/20 bg-white/30">
                        <DialogTitle className="text-[11px] font-black text-[#1A1A1A] text-center">
                            Integrations
                        </DialogTitle>
                        <DialogDescription className="text-[9px] font-bold text-[#1A1A1A]/50 text-center mt-1">
                            Local configuration only
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-5 space-y-3">
                        <p className="text-[11px] font-semibold text-gray-600">
                            This Meters module does not require a backend to save settings. If you want to connect a billing system, export CSV from Payments or Meter List.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <button
                                type="button"
                                className={cn(glass.btnSecondary, "h-9 px-4 text-[10px] font-black")}
                                onClick={() => {
                                    try {
                                        navigator.clipboard.writeText(JSON.stringify({ notificationSettings, thresholdSettings }, null, 2));
                                    } catch {
                                        // ignore
                                    }
                                }}
                            >
                                Copy settings JSON
                            </button>
                            <button
                                type="button"
                                className={cn(glass.btnPrimary, "h-9 px-4 text-[10px] font-black")}
                                onClick={() => setIsIntegrationsOpen(false)}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!activeDialog} onOpenChange={(open) => !open && setActiveDialog(null)}>
                <DialogContent className={cn(glass.card, "p-0 overflow-hidden shadow-xl max-w-sm mx-auto bg-white/80 border-white/40")}>
                    <DialogHeader className="p-5 border-b border-white/20 bg-white/30">
                        <DialogTitle className="text-[11px] font-black text-[#1A1A1A] text-center">{getDialogTitle()}</DialogTitle>
                        <DialogDescription className="text-[9px] font-bold text-[#1A1A1A]/50 text-center mt-1">
                            Update your settings below
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-5 space-y-4">
                        <div className="space-y-2">
                            {activeDialog?.type === 'notification' ? (
                                <Label className="text-[9px] font-black text-[#1A1A1A]/50 ml-1">
                                    Notification method
                                </Label>
                            ) : (
                                <Label htmlFor="setting-value" className="text-[9px] font-black text-[#1A1A1A]/50 ml-1">
                                    Alert threshold
                                </Label>
                            )}
                            {activeDialog?.type === 'notification' ? (
                                <Select value={tempValue} onValueChange={setTempValue}>
                                    <SelectTrigger id="meters-settings-notification-method" aria-label="Protocol method" className="h-9 bg-white/50 border-white/40 rounded-xl text-[9px] font-black">
                                        <SelectValue placeholder="Select Method" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border border-white/40 shadow-lg bg-white/90">
                                        <SelectItem value="Email" className="text-[9px] font-black hover:bg-white/50 cursor-pointer">Email</SelectItem>
                                        <SelectItem value="SMS" className="text-[9px] font-black hover:bg-white/50 cursor-pointer">SMS</SelectItem>
                                        <SelectItem value="Push" className="text-[9px] font-black hover:bg-white/50 cursor-pointer">Push</SelectItem>
                                        <SelectItem value="Email + SMS" className="text-[9px] font-black hover:bg-white/50 cursor-pointer">Email Sms</SelectItem>
                                        <SelectItem value="Email + Push" className="text-[9px] font-black hover:bg-white/50 cursor-pointer">Email Push</SelectItem>
                                        <SelectItem value="All" className="text-[9px] font-black hover:bg-white/50 cursor-pointer">All Channels</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    id="setting-value"
                                    name="threshold_value"
                                    autoComplete="off"
                                    value={tempValue}
                                    onChange={(e) => setTempValue(e.target.value)}
                                    placeholder="E.G. +25%"
                                    className="h-9 bg-white/50 border-white/40 rounded-xl text-[9px] font-black focus:bg-white transition-colors"
                                />
                            )}
                        </div>
                    </div>
                    <DialogFooter className="p-4 border-t border-white/20 bg-white/40 flex sm:justify-end gap-2">
                        <button onClick={() => setActiveDialog(null)} className={cn(glass.btnSecondary, "h-8 px-4 font-black text-[8px] w-full sm:w-auto")}>Abort</button>
                        <button onClick={handleSave} className={cn(glass.btnPrimary, "h-8 px-5 font-black text-[8px] w-full sm:w-auto")}>Commit Changes</button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            </motion.div>
        </BeeYieldPageShell>
    );
};

export default MetersSettings;
