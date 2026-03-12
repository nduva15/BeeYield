import React from 'react';
import { Bell, Shield, Plug, Settings2, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';
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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn(glass.page, "p-8 -m-8 space-y-12 pb-12 min-h-screen")}>
            <div className="space-y-4">
                <div className={cn(glass.badge, 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 mb-2')}>
                    <Settings2 className="w-4 h-4 mr-2" />
                    Logic & Protocol Tuning
                </div>
                <h1 className={cn(glass.sectionTitle, 'text-6xl')}>System <span className="text-honey">Settings</span></h1>
            </div>

            {/* Meter Rules and Preferences */}
            <div className={cn(glass.card, "p-8 shadow-sm flex items-center gap-4 bg-white/40")}>
                <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center border border-border shadow-sm">
                    <Settings2 className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className={cn(glass.sectionTitle, "text-2xl normal-case")}>Sensor Rules and Protocols</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Notifications */}
                <div className={cn(glass.card, "p-0 shadow-xl overflow-hidden")}>
                    <div className="p-8 border-b border-border bg-white/40 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-honey/10 flex items-center justify-center border border-honey/20">
                            <Bell className="w-5 h-5 text-honey" />
                        </div>
                        <h3 className={cn(glass.sectionTitle, "text-xl normal-case")}>Notification Triggers</h3>
                    </div>
                    <div className="p-8 space-y-2 relative">
                        {notificationSettings.map((item) => (
                            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                                <div className="space-y-1">
                                    <div className={cn(glass.microLabel, "font-bold tracking-wider")}>{item.title}</div>
                                    <div className={cn(glass.microLabel, "text-[10px] opacity-60")}>{item.value}</div>
                                </div>
                                <button
                                    onClick={() => handleEdit('notification', item.id, item.value)}
                                    className={cn(glass.btnSecondary, "text-xs h-9 px-6 bg-white/50 border-border shadow-sm w-full sm:w-auto")}
                                >
                                    Config
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Alert Thresholds */}
                <div className={cn(glass.card, "p-0 shadow-xl overflow-hidden")}>
                    <div className="p-8 border-b border-border bg-white/40 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <Shield className="w-5 h-5 text-emerald-500" />
                        </div>
                        <h3 className={cn(glass.sectionTitle, "text-xl normal-case")}>Operational Bounds</h3>
                    </div>
                    <div className="p-8 space-y-2">
                        {thresholdSettings.map((item) => (
                            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                                <div className="space-y-1">
                                    <div className={cn(glass.microLabel, "font-bold tracking-wider")}>{item.title}</div>
                                    <div className={cn(glass.microLabel, "text-[10px] opacity-60")}>{item.value}</div>
                                </div>
                                <button
                                    onClick={() => handleEdit('threshold', item.id, item.value)}
                                    className={cn(glass.btnSecondary, "text-xs h-9 px-6 bg-white/50 border-border shadow-sm w-full sm:w-auto")}
                                >
                                    Tune
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Integrations */}
            <div className={cn(glass.card, "p-8 shadow-xl bg-honey/5 border-honey/20 relative overflow-hidden group")}>
                <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-transform group-hover:scale-110" />
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-white/40 flex items-center justify-center border border-border shadow-sm">
                            <Plug className="w-6 h-6 text-honey" />
                        </div>
                        <h3 className={cn(glass.sectionTitle, "text-2xl normal-case")}>External<br /> System Interconnect</h3>
                    </div>
                    <button className={cn(glass.btnPrimary, "w-full sm:w-auto h-14 px-8 text-sm uppercase tracking-widest whitespace-nowrap")}>
                        Bridge Architectures <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!activeDialog} onOpenChange={(open) => !open && setActiveDialog(null)}>
                <DialogContent className={cn(glass.card, "p-0 overflow-hidden border-border/50 shadow-2xl max-w-lg mx-auto")}>
                    <DialogHeader className="p-8 border-b border-border bg-white/40 relative">
                        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                        <DialogTitle className={cn(glass.sectionTitle, "text-3xl normal-case text-emerald-600 relative z-10")}>{getDialogTitle()}</DialogTitle>
                        <DialogDescription className={cn(glass.microLabel, "normal-case italic font-semibold opacity-70 mt-2 relative z-10")}>
                            Update system preferences below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-8 space-y-6 bg-white/20">
                        <div className="space-y-4">
                            <Label htmlFor="setting-value" className={cn(glass.microLabel, "font-bold opacity-80 block")}>
                                {activeDialog?.type === 'notification' ? 'Protocol Method' : 'Target Threshold'}
                            </Label>
                            {activeDialog?.type === 'notification' ? (
                                <Select value={tempValue} onValueChange={setTempValue}>
                                    <SelectTrigger className={cn(glass.input, "h-14 rounded-xl")}>
                                        <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                    <SelectContent className={cn("rounded-xl border border-border bg-white/90 backdrop-blur-xl shadow-xl")}>
                                        <SelectItem value="Email" className={cn(glass.microLabel, "hover:bg-muted py-3")}>Email</SelectItem>
                                        <SelectItem value="SMS" className={cn(glass.microLabel, "hover:bg-muted py-3")}>SMS</SelectItem>
                                        <SelectItem value="Push" className={cn(glass.microLabel, "hover:bg-muted py-3")}>Push</SelectItem>
                                        <SelectItem value="Email + SMS" className={cn(glass.microLabel, "hover:bg-muted py-3")}>Email + SMS</SelectItem>
                                        <SelectItem value="Email + Push" className={cn(glass.microLabel, "hover:bg-muted py-3")}>Email + Push</SelectItem>
                                        <SelectItem value="All" className={cn(glass.microLabel, "hover:bg-muted py-3")}>All Channels</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    id="setting-value"
                                    value={tempValue}
                                    onChange={(e) => setTempValue(e.target.value)}
                                    placeholder="e.g. +25%"
                                    className={cn(glass.input, "h-14 rounded-xl font-bold")}
                                />
                            )}
                        </div>
                    </div>
                    <DialogFooter className="p-8 border-t border-border bg-white/30 flex flex-col sm:flex-row gap-4">
                        <button onClick={() => setActiveDialog(null)} className={cn(glass.btnSecondary, "flex-1 border-transparent hover:bg-muted/80")}>Abort</button>
                        <button onClick={handleSave} className={cn(glass.btnPrimary, "flex-1")}>Commit Changes</button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default MetersSettings;
