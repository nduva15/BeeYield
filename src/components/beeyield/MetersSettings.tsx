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
            <h1 className="text-[2.5rem] font-bold text-[#0F172A] dark:text-[#F4D03F] tracking-tight">Settings</h1>

            {/* Meter Rules and Preferences */}
            <Card className="rounded-2xl border border-gray-100 dark:border-slate-200 bg-white dark:bg-slate-50 shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Settings2 className="w-5 h-5 text-[#1B9157]" />
                        <CardTitle>Sensor rules and preferences</CardTitle>
                    </div>
                    <CardDescription>Configure alarms, thresholds and integrations.</CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Notifications */}
                <Card className="rounded-2xl border border-gray-100 dark:border-slate-200 bg-white dark:bg-slate-50 shadow-sm">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-[#1B9157]" />
                            <CardTitle>Notifications</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {notificationSettings.map((item) => (
                            <div key={item.id} className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="font-medium text-gray-900 dark:text-slate-800">{item.title}</div>
                                    <div className="text-sm text-gray-500">{item.value}</div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => handleEdit('notification', item.id, item.value)}>
                                    Edit
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Alert Thresholds */}
                <Card className="rounded-2xl border border-gray-100 dark:border-slate-200 bg-white dark:bg-slate-50 shadow-sm">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-[#1B9157]" />
                            <CardTitle>Alert thresholds</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {thresholdSettings.map((item) => (
                            <div key={item.id} className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="font-medium text-gray-900 dark:text-slate-800">{item.title}</div>
                                    <div className="text-sm text-gray-500">{item.value}</div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => handleEdit('threshold', item.id, item.value)}>
                                    Edit
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Integrations */}
            <Card className="rounded-2xl border border-gray-100 dark:border-slate-200 bg-white dark:bg-slate-50 shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Plug className="w-5 h-5 text-[#1B9157]" />
                        <CardTitle>Integrations</CardTitle>
                    </div>
                    <CardDescription>Connect to billing or ERP systems.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="secondary">Configure integrations</Button>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={!!activeDialog} onOpenChange={(open) => !open && setActiveDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{getDialogTitle()}</DialogTitle>
                        <DialogDescription>
                            Update your preferences below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="setting-value" className="mb-2 block">
                            {activeDialog?.type === 'notification' ? 'Notification Method' : 'Threshold Value'}
                        </Label>
                        {activeDialog?.type === 'notification' ? (
                            <Select value={tempValue} onValueChange={setTempValue}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Email">Email</SelectItem>
                                    <SelectItem value="SMS">SMS</SelectItem>
                                    <SelectItem value="Push">Push</SelectItem>
                                    <SelectItem value="Email + SMS">Email + SMS</SelectItem>
                                    <SelectItem value="Email + Push">Email + Push</SelectItem>
                                    <SelectItem value="All">All Channels</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <Input
                                id="setting-value"
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                placeholder="e.g. +25%"
                            />
                        )}

                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActiveDialog(null)}>Cancel</Button>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MetersSettings;
