import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wifi, Shield, Zap, Bluetooth as BluetoothIcon, Usb } from 'lucide-react';

// Common View Wrapper
const ViewLayout = ({ title, subtitle, icon: Icon, children }: { title: string, subtitle: string, icon: any, children: React.ReactNode }) => (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
        <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#B48428] rounded-[1.25rem] flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                <Icon className="w-8 h-8" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
            </div>
        </div>
        {children}
    </div>
);

// BeeHUB Online View
export const BeeHUBOnlineView: React.FC = () => (
    <ViewLayout title="BeeHUB Online" subtitle="Manage your cloud connectivity and synchronization." icon={Wifi}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="rounded-[2.5rem] p-8 border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm">
                <h3 className="text-xl font-bold mb-6">Cloud Status</h3>
                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-100 dark:border-green-900/20">
                        <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-green-500" />
                            <span className="font-bold text-green-700 dark:text-green-400">Connected to Cloud</span>
                        </div>
                        <span className="text-xs font-bold text-green-600">LATEST SYNC: JUST NOW</span>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 font-medium">Server Location</span>
                            <span className="text-gray-900 dark:text-white font-bold">Western Europe (Frankfurt)</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 font-medium">Uptime (24h)</span>
                            <span className="text-gray-900 dark:text-white font-bold">99.98%</span>
                        </div>
                    </div>
                </div>
            </Card>
            <Card className="rounded-[2.5rem] p-8 border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm">
                <h3 className="text-xl font-bold mb-6">Security Settings</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-blue-500" />
                            <span className="text-sm font-bold">End-to-End Encryption</span>
                        </div>
                        <Button variant="ghost" className="text-blue-500 font-bold text-xs uppercase hover:bg-blue-50 px-3 rounded-lg">Enabled</Button>
                    </div>
                </div>
            </Card>
        </div>
    </ViewLayout>
);

// Bluetooth View
export const BluetoothView: React.FC = () => (
    <ViewLayout title="Bluetooth" subtitle="Direct device connection and local configuration." icon={BluetoothIcon}>
        <div className="bg-white dark:bg-[#09090b] rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <BluetoothIcon className="w-10 h-10 text-blue-500 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Scanning for devices...</h2>
            <p className="text-gray-500 max-w-sm mx-auto mb-8">Make sure your BeeHUB or sensor Bluetooth is active and in range.</p>
            <Button className="rounded-xl px-12 h-12 bg-blue-500 hover:bg-blue-600 text-white font-bold border-none shadow-lg shadow-blue-500/20">
                Cancel Scan
            </Button>
        </div>
    </ViewLayout>
);

// USB View
export const USBView: React.FC = () => (
    <ViewLayout title="USB" subtitle="Firmware updates and data export via wired connection." icon={Usb}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#1e1e1e]/10 p-12 text-center col-span-2">
                <Usb className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-bold text-gray-400">No USB device detected</h3>
                <p className="text-gray-400 text-xs mt-1">Connect your BeeYield device to your computer to perform local actions.</p>
            </Card>
            <div className="space-y-6">
                <Card className="rounded-[2rem] p-6 border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm">
                    <h4 className="font-bold text-sm mb-4">Common Actions</h4>
                    <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start rounded-xl text-xs h-10 border-gray-100">Flash Firmware</Button>
                        <Button variant="outline" className="w-full justify-start rounded-xl text-xs h-10 border-gray-100">Debug Logs</Button>
                    </div>
                </Card>
            </div>
        </div>
    </ViewLayout>
);
