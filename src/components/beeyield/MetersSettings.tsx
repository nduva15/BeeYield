import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bell, Shield } from 'lucide-react';

const MetersSettings: React.FC = () => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h1 className="text-[2.5rem] font-bold text-[#0F172A] dark:text-white tracking-tight">Settings</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-primary" />
                            <CardTitle>Notifications</CardTitle>
                        </div>
                        <CardDescription>Configure how you want to be alerted.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Email Alerts</Label>
                                <p className="text-xs text-gray-500">Receive daily digest summaries.</p>
                            </div>
                            <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Push Notifications</Label>
                                <p className="text-xs text-gray-500">Real-time alerts for critical events.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">SMS Notifications</Label>
                                <p className="text-xs text-gray-500">Direct texts for emergency leaks.</p>
                            </div>
                            <Switch />
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary" />
                            <CardTitle>Thresholds & Limits</CardTitle>
                        </div>
                        <CardDescription>Set automatic trigger points for alarms.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Leak Detection Sensitivity</Label>
                                <p className="text-xs text-gray-500">High sensitivity triggers more alerts.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-500">High</span>
                                <Switch defaultChecked />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Daily Usage Cap</Label>
                                <p className="text-xs text-gray-500">Alert when daily limit exceeded.</p>
                            </div>
                            <Button variant="outline" size="sm">Configure</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default MetersSettings;
