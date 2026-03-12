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
                <div className={cn(glass.card, "p-0 shadow-sm overflow-hidden bg-white")}>
                    <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-gray-200">
                            <Bell className="w-5 h-5 text-[#F4D03F]" />
                        </div>
                        <h3 className="text-lg font-bold text-[#1A1A1A] tracking-tight">Notification Triggers</h3>
                    </div>
                    <div className="p-6 space-y-2">
                        {notificationSettings.map((item) => (
                            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200 group">
                                <div className="space-y-0.5">
                                    <div className="text-sm font-bold text-[#1A1A1A]">{item.title}</div>
                                    <div className="text-[10px] font-medium text-gray-500">{item.value}</div>
                                </div>
                                <button
                                    onClick={() => handleEdit('notification', item.id, item.value)}
                                    className={cn(glass.btnSecondary, "text-[10px] h-8 px-4 w-full sm:w-auto opacity-0 group-hover:opacity-100 transition-opacity")}
                                >
                                    Config
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Alert Thresholds */}
                <div className={cn(glass.card, "p-0 shadow-sm overflow-hidden bg-white")}>
                    <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-gray-200">
                            <Shield className="w-5 h-5 text-[#1B9157]" />
                        </div>
                        <h3 className="text-lg font-bold text-[#1A1A1A] tracking-tight">Operational Bounds</h3>
                    </div>
                    <div className="p-6 space-y-2">
                        {thresholdSettings.map((item) => (
                            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200 group">
                                <div className="space-y-0.5">
                                    <div className="text-sm font-bold text-[#1A1A1A]">{item.title}</div>
                                    <div className="text-[10px] font-medium text-gray-500">{item.value}</div>
                                </div>
                                <button
                                    onClick={() => handleEdit('threshold', item.id, item.value)}
                                    className={cn(glass.btnSecondary, "text-[10px] h-8 px-4 w-full sm:w-auto opacity-0 group-hover:opacity-100 transition-opacity")}
                                >
                                    Tune
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Integrations */}
            <div className={cn(glass.card, "p-6 shadow-sm bg-white border-gray-200 relative overflow-hidden group")}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F4D03F]/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-110" />
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-200 shadow-sm">
                            <Plug className="w-6 h-6 text-[#F4D03F]" />
                        </div>
                        <h3 className="text-lg font-bold text-[#1A1A1A] leading-tight">External<br /> System Interconnect</h3>
                    </div>
                    <button className={cn(glass.btnPrimary, "w-full sm:w-auto h-10 px-6 font-bold text-xs uppercase flex items-center justify-center gap-2")}>
                        Bridge Architectures <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!activeDialog} onOpenChange={(open) => !open && setActiveDialog(null)}>
                <DialogContent className={cn(glass.card, "p-0 overflow-hidden shadow-xl max-w-sm mx-auto bg-white")}>
                    <DialogHeader className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <DialogTitle className="text-xl font-bold text-[#1A1A1A] text-center">{getDialogTitle()}</DialogTitle>
                        <DialogDescription className="text-xs font-medium text-gray-500 text-center mt-1">
                            Update system preferences below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="setting-value" className="text-xs font-bold text-gray-700 ml-1">
                                {activeDialog?.type === 'notification' ? 'Protocol Method' : 'Target Threshold'}
                            </Label>
                            {activeDialog?.type === 'notification' ? (
                                <Select value={tempValue} onValueChange={setTempValue}>
                                    <SelectTrigger className="h-10 bg-white border-gray-200 rounded-lg text-sm font-medium">
                                        <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border border-gray-200 shadow-lg bg-white">
                                        <SelectItem value="Email" className="text-sm font-medium hover:bg-gray-50 cursor-pointer focus:bg-gray-50 focus:text-[#1A1A1A]">Email</SelectItem>
                                        <SelectItem value="SMS" className="text-sm font-medium hover:bg-gray-50 cursor-pointer focus:bg-gray-50 focus:text-[#1A1A1A]">SMS</SelectItem>
                                        <SelectItem value="Push" className="text-sm font-medium hover:bg-gray-50 cursor-pointer focus:bg-gray-50 focus:text-[#1A1A1A]">Push</SelectItem>
                                        <SelectItem value="Email + SMS" className="text-sm font-medium hover:bg-gray-50 cursor-pointer focus:bg-gray-50 focus:text-[#1A1A1A]">Email + SMS</SelectItem>
                                        <SelectItem value="Email + Push" className="text-sm font-medium hover:bg-gray-50 cursor-pointer focus:bg-gray-50 focus:text-[#1A1A1A]">Email + Push</SelectItem>
                                        <SelectItem value="All" className="text-sm font-medium hover:bg-gray-50 cursor-pointer focus:bg-gray-50 focus:text-[#1A1A1A]">All Channels</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    id="setting-value"
                                    value={tempValue}
                                    onChange={(e) => setTempValue(e.target.value)}
                                    placeholder="e.g. +25%"
                                    className="h-10 bg-white border-gray-200 rounded-lg text-sm font-medium focus:border-[#1B9157] transition-colors"
                                />
                            )}
                        </div>
                    </div>
                    <DialogFooter className="p-4 border-t border-gray-100 bg-gray-50/50 flex sm:justify-end gap-2">
                        <button onClick={() => setActiveDialog(null)} className={cn(glass.btnSecondary, "h-9 px-4 font-bold text-[10px] uppercase w-full sm:w-auto")}>Abort</button>
                        <button onClick={handleSave} className={cn(glass.btnPrimary, "h-9 px-6 font-bold text-[10px] uppercase w-full sm:w-auto")}>Commit Changes</button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default MetersSettings;
