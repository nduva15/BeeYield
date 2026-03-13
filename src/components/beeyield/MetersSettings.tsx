import React from 'react';
import { Bell, Shield, Plug, Settings2, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { glass, PageHeader } from './GlassTheme';
import { motion } from 'framer-motion';

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

    const handleEdit = (type: 'notification' | 'threshold', id: string, currentValue: string) => {
        setActiveDialog({ type, id });
        setTempValue(currentValue);
    };

    const handleSave = () => {
        if (!activeDialog) return;

        if (activeDialog.type === 'notification') {
            setNotificationSettings(prev => prev.map(item =>
                item.id === activeDialog.id ? { ...item, value: tempValue } : item
            ));
        } else {
            setThresholdSettings(prev => prev.map(item =>
                item.id === activeDialog.id ? { ...item, value: tempValue } : item
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn(glass.page, "max-w-7xl mx-auto space-y-6 pb-20 p-4 lg:p-6")}>
            <PageHeader
                icon={Settings2}
                label="Sensor Rules and Protocols"
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
                        <h3 className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-[0.2em]">NOTIFICATION_TRIGGERS</h3>
                    </div>
                    <div className="p-6 space-y-2">
                        {notificationSettings.map((item) => (
                            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl hover:bg-white/50 transition-colors border border-transparent hover:border-white/40 group">
                                <div className="space-y-0.5">
                                    <div className="text-[10px] font-black tracking-widest uppercase text-[#1A1A1A]">{item.title}</div>
                                    <div className="text-[9px] font-bold text-gray-500 uppercase">{item.value}</div>
                                </div>
                                <button
                                    onClick={() => handleEdit('notification', item.id, item.value)}
                                    className={cn(glass.btnSecondary, "text-[9px] font-black uppercase tracking-[0.2em] h-8 px-4 w-full sm:w-auto opacity-0 group-hover:opacity-100 transition-opacity")}
                                >
                                    CONFIG
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
                        <h3 className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-[0.2em]">OPERATIONAL_BOUNDS</h3>
                    </div>
                    <div className="p-6 space-y-2">
                        {thresholdSettings.map((item) => (
                            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl hover:bg-white/50 transition-colors border border-transparent hover:border-white/40 group">
                                <div className="space-y-0.5">
                                    <div className="text-[10px] font-black tracking-widest uppercase text-[#1A1A1A]">{item.title}</div>
                                    <div className="text-[9px] font-bold text-gray-500 uppercase">{item.value}</div>
                                </div>
                                <button
                                    onClick={() => handleEdit('threshold', item.id, item.value)}
                                    className={cn(glass.btnSecondary, "text-[9px] font-black uppercase tracking-[0.2em] h-8 px-4 w-full sm:w-auto opacity-0 group-hover:opacity-100 transition-opacity")}
                                >
                                    TUNE
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
                        <h3 className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-[0.2em] leading-tight">EXTERNAL<br />SYSTEM_INTERCONNECT</h3>
                    </div>
                    <button className={cn(glass.btnPrimary, "w-full sm:w-auto h-8 px-5 font-black text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2")}>
                        BRIDGE_ARCHITECTURES <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!activeDialog} onOpenChange={(open) => !open && setActiveDialog(null)}>
                <DialogContent className={cn(glass.card, "p-0 overflow-hidden shadow-xl max-w-sm mx-auto bg-white/80 border-white/40")}>
                    <DialogHeader className="p-5 border-b border-white/20 bg-white/30">
                        <DialogTitle className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1A1A1A] text-center">{getDialogTitle()}</DialogTitle>
                        <DialogDescription className="text-[9px] font-bold uppercase tracking-widest text-[#1A1A1A]/50 text-center mt-1">
                            UPDATE_SYSTEM_PREFERENCES_BELOW
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-5 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="setting-value" className="text-[9px] font-black uppercase tracking-[0.2em] text-[#1A1A1A]/50 ml-1">
                                {activeDialog?.type === 'notification' ? 'PROTOCOL_METHOD' : 'TARGET_THRESHOLD'}
                            </Label>
                            {activeDialog?.type === 'notification' ? (
                                <Select value={tempValue} onValueChange={setTempValue}>
                                    <SelectTrigger className="h-9 bg-white/50 border-white/40 rounded-xl text-[9px] font-black uppercase tracking-[0.2em]">
                                        <SelectValue placeholder="SELECT_METHOD" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border border-white/40 shadow-lg bg-white/90">
                                        <SelectItem value="Email" className="text-[9px] font-black uppercase tracking-widest hover:bg-white/50 cursor-pointer">EMAIL</SelectItem>
                                        <SelectItem value="SMS" className="text-[9px] font-black uppercase tracking-widest hover:bg-white/50 cursor-pointer">SMS</SelectItem>
                                        <SelectItem value="Push" className="text-[9px] font-black uppercase tracking-widest hover:bg-white/50 cursor-pointer">PUSH</SelectItem>
                                        <SelectItem value="Email + SMS" className="text-[9px] font-black uppercase tracking-widest hover:bg-white/50 cursor-pointer">EMAIL_SMS</SelectItem>
                                        <SelectItem value="Email + Push" className="text-[9px] font-black uppercase tracking-widest hover:bg-white/50 cursor-pointer">EMAIL_PUSH</SelectItem>
                                        <SelectItem value="All" className="text-[9px] font-black uppercase tracking-widest hover:bg-white/50 cursor-pointer">ALL_CHANNELS</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    id="setting-value"
                                    value={tempValue}
                                    onChange={(e) => setTempValue(e.target.value)}
                                    placeholder="E.G. +25%"
                                    className="h-9 bg-white/50 border-white/40 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] focus:bg-white transition-colors"
                                />
                            )}
                        </div>
                    </div>
                    <DialogFooter className="p-4 border-t border-white/20 bg-white/40 flex sm:justify-end gap-2">
                        <button onClick={() => setActiveDialog(null)} className={cn(glass.btnSecondary, "h-8 px-4 font-black tracking-[0.2em] text-[8px] uppercase w-full sm:w-auto")}>ABORT</button>
                        <button onClick={handleSave} className={cn(glass.btnPrimary, "h-8 px-5 font-black tracking-[0.2em] text-[8px] uppercase w-full sm:w-auto")}>COMMIT_CHANGES</button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default MetersSettings;
