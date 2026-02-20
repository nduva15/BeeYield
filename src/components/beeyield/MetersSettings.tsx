import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Shield, Plug, Settings2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    const [activeDialog, setActiveDialog] = useState<{ type: 'notification' | 'threshold', id: string } | null>(null);
    const [tempValue, setTempValue] = useState('');

    const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([
        { id: 'water_leak', title: 'Water leak', value: 'Email + SMS' },
        { id: 'sudden_spike', title: 'Sudden spike', value: 'Email' },
        { id: 'no_comm', title: 'No communication', value: 'Push' },
    ]);

    const [thresholdSettings, setThresholdSettings] = useState<ThresholdSetting[]>([
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
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[#10b981] bg-[#064e3b] mb-4">
                    <Settings2 className="w-3.5 h-3.5 text-[#facc15]" />
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Logic & Protocol Tuning</span>
                </div>
                <h1 className="text-5xl font-black text-[#064e3b] tracking-tighter uppercase leading-none">System <span className="text-[#10b981]">Settings</span></h1>
            </div>

            {/* Meter Rules and Preferences */}
            <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
                <CardHeader className="p-8">
                    <div className="flex items-center gap-3">
                        <Settings2 className="w-5 h-5 text-[#10b981]" />
                        <CardTitle className="text-xl font-black text-[#064e3b] uppercase tracking-tighter">Sensor Rules and Protocols</CardTitle>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Notifications */}
                <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
                    <CardHeader className="p-8 border-b-4 border-[#064e3b]/10">
                        <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5 text-[#10b981]" />
                            <CardTitle className="text-lg font-black text-[#064e3b] uppercase tracking-tighter">Notification Triggers</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        {notificationSettings.map((item) => (
                            <div key={item.id} className="flex items-center justify-between pb-4 border-b-2 border-neutral-50 last:border-0 last:pb-0">
                                <div className="space-y-1">
                                    <div className="font-black text-[#064e3b] uppercase tracking-tight text-sm">{item.title}</div>
                                    <div className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-widest">{item.value}</div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit('notification', item.id, item.value)}
                                    className="rounded-none border-2 border-[#064e3b] bg-white text-[#064e3b] hover:bg-[#064e3b] hover:text-white font-black text-[10px] uppercase tracking-widest h-8 px-4 transition-none shadow-[3px_3px_0px_0px_rgba(6,78,59,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
                                >
                                    CONFIG
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Alert Thresholds */}
                <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
                    <CardHeader className="p-8 border-b-4 border-[#064e3b]/10">
                        <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-[#10b981]" />
                            <CardTitle className="text-lg font-black text-[#064e3b] uppercase tracking-tighter">Operational Bounds</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        {thresholdSettings.map((item) => (
                            <div key={item.id} className="flex items-center justify-between pb-4 border-b-2 border-neutral-50 last:border-0 last:pb-0">
                                <div className="space-y-1">
                                    <div className="font-black text-[#064e3b] uppercase tracking-tight text-sm">{item.title}</div>
                                    <div className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-widest">{item.value}</div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit('threshold', item.id, item.value)}
                                    className="rounded-none border-2 border-[#064e3b] bg-white text-[#064e3b] hover:bg-[#064e3b] hover:text-white font-black text-[10px] uppercase tracking-widest h-8 px-4 transition-none shadow-[3px_3px_0px_0px_rgba(6,78,59,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
                                >
                                    TUNE
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Integrations */}
            <Card className="rounded-none border-4 border-[#064e3b] bg-[#064e3b] shadow-[8px_8px_0px_0px_rgba(250,204,21,1)] overflow-hidden">
                <CardHeader className="p-8">
                    <div className="flex items-center gap-3">
                        <Plug className="w-6 h-6 text-[#facc15]" />
                        <CardTitle className="text-xl font-black text-white uppercase tracking-tighter">External System Interconnect</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                    <Button className="h-14 px-12 rounded-none bg-[#facc15] text-[#064e3b] hover:bg-white border-4 border-[#064e3b] font-black uppercase text-xs tracking-[0.2em] transition-none shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] active:shadow-none active:translate-x-1 active:translate-y-1">
                        BRIDGE ARCHITECTURES
                    </Button>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={!!activeDialog} onOpenChange={(open) => !open && setActiveDialog(null)}>
                <DialogContent className="rounded-none border-4 border-[#064e3b] bg-white p-0 overflow-hidden max-w-lg shadow-[12px_12px_0px_0px_rgba(6,78,59,1)]">
                    <DialogHeader className="p-8 border-b-4 border-[#064e3b]/10 bg-neutral-50/30">
                        <DialogTitle className="text-2xl font-black text-[#064e3b] uppercase tracking-tighter italic">{getDialogTitle()}</DialogTitle>
                        <DialogDescription className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-widest mt-1">
                            Update system preferences below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-8 space-y-6">
                        <div className="space-y-3">
                            <Label htmlFor="setting-value" className="text-[10px] font-black text-[#064e3b]/60 uppercase tracking-[0.2em] ml-1">
                                {activeDialog?.type === 'notification' ? 'Protocol Method' : 'Target Threshold'}
                            </Label>
                            {activeDialog?.type === 'notification' ? (
                                <Select value={tempValue} onValueChange={setTempValue}>
                                    <SelectTrigger className="h-12 rounded-none border-4 border-[#064e3b] font-black text-xs uppercase focus:ring-0 transition-none">
                                        <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-none border-2 border-[#064e3b]">
                                        <SelectItem value="Email" className="uppercase font-black text-[10px]">Email</SelectItem>
                                        <SelectItem value="SMS" className="uppercase font-black text-[10px]">SMS</SelectItem>
                                        <SelectItem value="Push" className="uppercase font-black text-[10px]">Push</SelectItem>
                                        <SelectItem value="Email + SMS" className="uppercase font-black text-[10px]">Email + SMS</SelectItem>
                                        <SelectItem value="Email + Push" className="uppercase font-black text-[10px]">Email + Push</SelectItem>
                                        <SelectItem value="All" className="uppercase font-black text-[10px]">All Channels</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    id="setting-value"
                                    value={tempValue}
                                    onChange={(e) => setTempValue(e.target.value)}
                                    placeholder="e.g. +25%"
                                    className="h-12 rounded-none border-4 border-[#064e3b] font-black text-sm focus-visible:ring-0 focus-visible:bg-[#facc15]/5 transition-none"
                                />
                            )}
                        </div>
                    </div>
                    <DialogFooter className="p-8 pt-0 flex gap-4 border-t-0">
                        <Button variant="ghost" onClick={() => setActiveDialog(null)} className="h-12 px-6 rounded-none font-black text-[#064e3b]/40 hover:text-[#064e3b] hover:bg-[#facc15]/10 uppercase text-[10px] tracking-widest transition-none">ABORT</Button>
                        <Button onClick={handleSave} className="h-12 px-10 rounded-none bg-[#064e3b] text-white hover:bg-[#10b981] border-2 border-[#064e3b] font-black uppercase text-[10px] tracking-widest transition-none shadow-[4px_4px_0px_0px_rgba(16,185,129,1)] active:shadow-none active:translate-x-1 active:translate-y-1">COMMIT CHANGES</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MetersSettings;
