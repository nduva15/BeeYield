import React, { useState, useEffect } from 'react';
import { IoTDevice, SensorReading } from '@/services/beeyieldService';
import { Button } from '@/components/ui/button';
import {
    Plus, Battery, Signal, Clock, MapPin, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AddDeviceModal from './AddDeviceModal';
import { toast } from 'sonner';

// helper components
const StatCard = ({ label, value, color }: { label: string, value: number | string, color: string }) => (
    <div className={cn("bg-white dark:bg-[#09090b] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-[#1e1e1e]", color)}>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
);

const AlertCard = ({ label, value, color }: { label: string, value: number | string, color: string }) => (
    <div className={cn("bg-white dark:bg-[#09090b] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-[#1e1e1e]", color)}>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
);

interface MyDevicesViewProps {
    devices: IoTDevice[];
    readings: SensorReading[];
    onTabChange: (tab: string) => void;
}

const MyDevicesView: React.FC<MyDevicesViewProps> = ({ devices: initialDevices, readings, onTabChange }) => {
    const [localDevices, setLocalDevices] = useState<IoTDevice[]>(initialDevices);
    const [showBanner, setShowBanner] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Sync local devices when initialDevices changes (e.g. after fetch)
    useEffect(() => {
        setLocalDevices(initialDevices);
    }, [initialDevices]);

    // Banner persistence
    useEffect(() => {
        const bannerHidden = localStorage.getItem('hideBeeYieldBanner');
        if (bannerHidden) {
            setShowBanner(false);
        }
    }, []);

    const hideBanner = () => {
        setShowBanner(false);
        localStorage.setItem('hideBeeYieldBanner', 'true');
    };

    const handleAddDevice = (newDevice: IoTDevice) => {
        setLocalDevices([newDevice, ...localDevices]);
        toast.success(`Device ${newDevice.device_code} added successfully!`);
    };

    // Derived Stats
    const totalDevices = localDevices.length;
    const withMeasurement = localDevices.filter(d => readings.some(r => r.device_id === d.id)).length;

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    const measuredIn24h = localDevices.filter(d => {
        return readings.some(r => r.device_id === d.id && (now.getTime() - new Date(r.timestamp).getTime() < oneDay));
    }).length;

    const measuredIn48h = localDevices.filter(d => {
        return readings.some(r => r.device_id === d.id && (now.getTime() - new Date(r.timestamp).getTime() < oneDay * 2));
    }).length;

    const measuredIn7Days = localDevices.filter(d => {
        return readings.some(r => r.device_id === d.id && (now.getTime() - new Date(r.timestamp).getTime() < oneDay * 7));
    }).length;

    // Attention Needed Stats
    const noMeasurement5Days = localDevices.filter(d => {
        const hasRecent = readings.some(r => r.device_id === d.id && (now.getTime() - new Date(r.timestamp).getTime() < oneDay * 5));
        return !hasRecent;
    }).length;

    const lowBattery = localDevices.filter(d => d.battery_level < 20).length;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">

            {/* First Steps Banner */}
            {showBanner && (
                <div className="relative bg-gradient-to-r from-orange-50 to-white dark:from-orange-900/10 dark:to-[#09090b] p-6 rounded-3xl border border-orange-100 dark:border-orange-900/20 shadow-sm">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={hideBanner}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">First steps</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-2xl">
                        Start here to set up your apiaries, devices, and measurements.
                    </p>

                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="outline"
                            onClick={() => onTabChange('places')}
                            className="rounded-full bg-white dark:bg-[#1e1e1e] border-orange-100 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm"
                        >
                            Add apiaries and hives
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => onTabChange('devices')}
                            className="rounded-full bg-white dark:bg-[#1e1e1e] border-orange-100 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm"
                        >
                            My devices
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => onTabChange('data')}
                            className="rounded-full bg-white dark:bg-[#1e1e1e] border-orange-100 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm"
                        >
                            Measurement data
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => onTabChange('requests')}
                            className="rounded-full bg-white dark:bg-[#1e1e1e] border-orange-100 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm"
                        >
                            Support Center
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => onTabChange('beeyield')}
                            className="rounded-full bg-white dark:bg-[#1e1e1e] border-orange-100 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm"
                        >
                            BeeYield Agro Intelligence
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => onTabChange('settings')}
                            className="rounded-full bg-white dark:bg-[#1e1e1e] border-orange-100 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm"
                        >
                            Settings
                        </Button>
                    </div>
                </div>
            )}

            {/* Page Title */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My devices</h1>

            {/* Measurement Data Section */}
            <div className="relative">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            Measurement data
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">BeeYield devices assigned to your hives.</p>
                    </div>
                    <Button className="bg-[#246BFD] hover:bg-[#1E5BD7] text-white rounded-xl px-6 h-12">
                        Contact Support Center
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatCard label="TOTAL DEVICES" value={totalDevices} color="border-l-4 border-l-blue-500" />
                    <StatCard label="WITH MEASUREMENT" value={withMeasurement} color="border-l-4 border-l-blue-400" />
                    <StatCard label="MEASURED IN 24H" value={measuredIn24h} color="border-l-4 border-l-green-500" />
                    <StatCard label="MEASURED IN 48H" value={measuredIn48h} color="border-l-4 border-l-emerald-500" />
                    <StatCard label="MEASURED IN 7 DAYS" value={measuredIn7Days} color="border-l-4 border-l-orange-400" />
                </div>
                {/* Additional row for 30/365 days if needed, as per screenshot */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
                    <StatCard label="MEASURED IN 30 DAYS" value={totalDevices} color="border-l-4 border-l-red-400" />
                    <StatCard label="MEASURED IN 365 DAYS" value={totalDevices} color="border-l-4 border-l-red-500" />
                </div>
            </div>

            {/* Attention Needed Section */}
            <div className="bg-white dark:bg-[#1e1e1e]/30 rounded-3xl border border-gray-100 dark:border-[#1e1e1e] p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Today: attention needed</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Alerts are computed from last measurements and battery status.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <AlertCard label="NO MEASUREMENT / OVER 5 DAYS" value={noMeasurement5Days} color="border-t-4 border-t-red-400" />
                    <AlertCard label="NO MEASUREMENT FOR 24H-5 DAYS" value={0} color="border-t-4 border-t-orange-300" />
                    <AlertCard label="LOW BATTERY" value={lowBattery} color="border-t-4 border-t-orange-400" />
                    <AlertCard label="WEAK SIGNAL" value={0} color="border-t-4 border-t-blue-400" />
                </div>

                {noMeasurement5Days === 0 && lowBattery === 0 ? (
                    <p className="text-green-500 dark:text-green-400 text-sm flex items-center gap-2">
                        All devices look healthy today.
                    </p>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Please check the devices listed above.</p>
                )}
            </div>

            {/* Devices List Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50 dark:bg-[#09090b]/50 p-3 rounded-2xl border border-gray-100 dark:border-[#1e1e1e]">
                <div className="w-full md:w-64">
                    <Select defaultValue="all">
                        <SelectTrigger className="w-full bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-gray-700 rounded-xl h-11">
                            <SelectValue placeholder="All apiaries" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#09090b] border-gray-100 dark:border-[#1e1e1e]">
                            <SelectItem value="all">All apiaries</SelectItem>
                            <SelectItem value="north-orchard">North Orchard</SelectItem>
                            <SelectItem value="backyard">Backyard</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="rounded-xl gap-2 bg-[#4ADE80] hover:bg-[#22c55e] text-black border-none whitespace-nowrap h-11 px-6 font-bold"
                    >
                        <Plus className="w-4 h-4" /> Add device
                    </Button>
                    <Button variant="outline" className="rounded-xl gap-2 bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 whitespace-nowrap h-11">
                        <div className="w-2 h-2 rounded-full bg-blue-500" /> Show device short id
                    </Button>
                    <Button variant="outline" className="rounded-xl gap-2 bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 whitespace-nowrap h-11">
                        <div className="w-2 h-2 rounded-full bg-gray-400" /> Show last measurement
                    </Button>
                </div>
            </div>

            {/* Devices Table Header */}
            <div className="bg-[#FFF8F0] dark:bg-[#27272a] rounded-xl px-6 py-4 grid grid-cols-12 gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Battery</div>
                <div className="col-span-2">Signal</div>
                <div className="col-span-3">Last measurement (ago)</div>
                <div className="col-span-1">Apiary</div>
                <div className="col-span-2 text-right">Hive</div>
            </div>

            {/* Devices List */}
            <div className="space-y-2">
                {localDevices.map((device) => (
                    <div key={device.id} className="bg-white dark:bg-[#09090b] border border-gray-100 dark:border-[#1e1e1e] rounded-xl px-6 py-4 grid grid-cols-12 gap-4 items-center hover:shadow-md transition-all hover:bg-gray-50/50 dark:hover:bg-white/5 cursor-pointer">
                        <div className="col-span-2 flex items-center gap-2">
                            <div className={cn("w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]", device.status === 'active' ? "bg-green-500" : "bg-gray-300")} />
                            <span className="font-bold text-gray-900 dark:text-white">{device.device_code}</span>
                        </div>
                        <div className="col-span-2 flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Battery className={cn("w-4 h-4", device.battery_level < 20 ? "text-red-500" : "text-green-500")} />
                            <span className="font-medium">{device.battery_level}%</span>
                        </div>
                        <div className="col-span-2 flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Signal className="w-4 h-4 text-blue-500" />
                            <span className="font-medium">Good</span>
                        </div>
                        <div className="col-span-3 text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {device.last_ping ? (
                                <span className="font-medium text-sm">
                                    {Math.floor((Date.now() - new Date(device.last_ping).getTime()) / 60000)} mins ago
                                </span>
                            ) : (
                                <span className="font-medium text-sm">Never</span>
                            )}
                        </div>
                        <div className="col-span-1 text-gray-500 dark:text-gray-400 truncate text-sm">
                            {device.location_name}
                        </div>
                        <div className="col-span-2 text-right font-bold text-gray-900 dark:text-white truncate">
                            {device.device_name}
                        </div>
                    </div>
                ))}

                {localDevices.length === 0 && (
                    <div className="text-center py-20 bg-gray-50/50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                        <div className="w-16 h-16 bg-white dark:bg-[#1e1e1e] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <Plus className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No devices found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 mb-6">Click "Add device" to register your first BeeYield sensor.</p>
                        <Button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-[#4ADE80] hover:bg-[#22c55e] text-black rounded-xl px-8 border-none font-bold"
                        >
                            Add your first device
                        </Button>
                    </div>
                )}
            </div>

            {/* Modals */}
            <AddDeviceModal
                open={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                onAdd={handleAddDevice}
            />
        </div>
    );
};

export default MyDevicesView;
