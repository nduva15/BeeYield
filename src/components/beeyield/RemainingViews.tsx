import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wifi, Shield, Zap, Bluetooth as BluetoothIcon, Usb, Grid3X3, Box, Bell, Settings, ChevronDown } from 'lucide-react';
import FirstStepsBanner from './FirstStepsBanner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Common View Wrapper
const ViewLayout = ({ title, subtitle, icon: Icon, onTabChange, showIcon = true, children }: { title: string, subtitle?: string, icon?: any, onTabChange?: (tab: string) => void, showIcon?: boolean, children: React.ReactNode }) => (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
        {onTabChange && <FirstStepsBanner onTabChange={onTabChange} />}
        <div className="flex items-center gap-4">
            {showIcon && Icon && (
                <div className="w-14 h-14 bg-[#B48428] rounded-[1.25rem] flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                    <Icon className="w-8 h-8" />
                </div>
            )}
            <div>
                <h1 className="text-[2.5rem] font-bold text-[#0F172A] dark:text-white tracking-tight">{title}</h1>
                {subtitle && <p className="text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
            </div>
        </div>
        {children}
    </div>
);

interface RemainingViewProps {
    onTabChange: (tab: string) => void;
}

// BeeYield Online View (Measurement data)
export const BeeYieldOnlineView: React.FC<RemainingViewProps> = ({ onTabChange }) => {
    const [selectedPlace, setSelectedPlace] = useState<string>('');
    const [selectedHive, setSelectedHive] = useState<string>('');

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            {onTabChange && <FirstStepsBanner onTabChange={onTabChange} />}

            {/* Title */}
            <h1 className="text-[2.5rem] font-bold text-[#0F172A] dark:text-white tracking-tight">
                Measurement data
            </h1>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* SELECT HIVE Card */}
                <Card className="rounded-[2rem] p-6 border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-[#E8F4FD] dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                            <Grid3X3 className="w-5 h-5 text-[#B48428]" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">SELECT HIVE</p>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Search wireless BeeYield</h3>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* MY PLACES Dropdown */}
                        <div className="border border-gray-100 dark:border-[#1e1e1e] rounded-xl p-3">
                            <div className="flex items-center gap-3">
                                <Grid3X3 className="w-4 h-4 text-[#B48428]" />
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">MY PLACES</span>
                                <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />
                            </div>
                        </div>

                        {/* HIVE Dropdown */}
                        <div className="border border-gray-100 dark:border-[#1e1e1e] rounded-xl p-3">
                            <div className="flex items-center gap-3">
                                <Box className="w-4 h-4 text-[#B48428]" />
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">HIVE</span>
                                <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* SELECTED HIVE Card */}
                <Card className="rounded-[2rem] p-6 border border-gray-100 dark:border-[#1e1e1e] bg-[#F8F6F3] dark:bg-[#1e1e1e] shadow-sm">
                    <div className="mb-6">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">SELECTED HIVE</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Search wireless BeeYield</h3>
                    </div>

                    <div className="flex gap-3">
                        {/* Notifications Button */}
                        <Button
                            variant="outline"
                            className="flex items-center gap-2 rounded-full px-5 py-2 h-auto bg-white dark:bg-[#09090b] border-gray-200 dark:border-[#1e1e1e] hover:bg-gray-50"
                        >
                            <div className="w-8 h-8 bg-[#FEE2E2] rounded-full flex items-center justify-center">
                                <Bell className="w-4 h-4 text-[#EF4444]" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Notifications</span>
                        </Button>

                        {/* Settings Button */}
                        <Button
                            variant="outline"
                            className="flex items-center gap-2 rounded-full px-5 py-2 h-auto bg-white dark:bg-[#09090b] border-gray-200 dark:border-[#1e1e1e] hover:bg-gray-50"
                        >
                            <div className="w-8 h-8 bg-[#FEF3C7] rounded-full flex items-center justify-center">
                                <Settings className="w-4 h-4 text-[#B48428]" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Settings</span>
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Warning Message */}
            <div className="bg-[#FEF9E7] dark:bg-amber-900/10 border border-[#FCD34D] dark:border-amber-700/30 rounded-2xl p-4 text-center">
                <p className="text-[#B48428] font-medium">No BeeYield device assigned to this bee hive.</p>
            </div>

            {/* Contact Link */}
            <div className="bg-[#FFFDF5] dark:bg-amber-900/5 border border-[#FEF3C7] dark:border-amber-800/20 rounded-2xl p-4 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                    <a href="#" className="text-[#B48428] underline hover:text-[#8A6420] font-medium">Contact us</a>
                    {' '}in order to buy one or{' '}
                    <a href="#" className="text-[#B48428] underline hover:text-[#8A6420] font-medium">learn more about BeeYield</a>.
                </p>
            </div>
        </div>
    );
};

// Bluetooth View
export const BluetoothView: React.FC<RemainingViewProps> = ({ onTabChange }) => (
    <ViewLayout title="Bluetooth" subtitle="Direct device connection and local configuration." icon={BluetoothIcon} onTabChange={onTabChange}>
        <div className="bg-white dark:bg-[#09090b] rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <BluetoothIcon className="w-10 h-10 text-blue-500 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Scanning for devices...</h2>
            <p className="text-gray-500 max-w-sm mx-auto mb-8">Make sure your BeeYield Hub or sensor Bluetooth is active and in range.</p>
            <Button className="rounded-xl px-12 h-12 bg-blue-500 hover:bg-blue-600 text-white font-bold border-none shadow-lg shadow-blue-500/20">
                Cancel Scan
            </Button>
        </div>
    </ViewLayout>
);

// USB View
export const USBView: React.FC<RemainingViewProps> = ({ onTabChange }) => (
    <ViewLayout title="USB" subtitle="Firmware updates and data export via wired connection." icon={Usb} onTabChange={onTabChange}>
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
