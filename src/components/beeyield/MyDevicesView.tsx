import React, { useState, useEffect } from 'react';
import { IoTDevice, SensorReading } from '@/services/beeyieldService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Plus, Battery, Signal, Search, Filter, Cpu, Wifi,
    Moon, Sun, Bell, Headset, Settings, LogOut, ChevronDown, Check,
    CheckCircle2, XCircle, Info, RefreshCw, Clock, FileSearch, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AddDeviceModal from './AddDeviceModal';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

// Stat Card Component matching screenshot
const StatCard = ({ label, value, colorClass }: { label: string, value: number | string, colorClass: string }) => (
    <div className="bg-white dark:bg-[#111111] p-4 rounded-sm border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden h-28 flex flex-col justify-between">
        <div className={cn("absolute top-0 left-0 w-full h-[3px]", colorClass)} />
        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.15em] mb-4">{label}</p>
        <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
    </div>
);

// Alert Card Component matching screenshot
const AlertCard = ({ label, value, colorClass }: { label: string, value: number | string, colorClass: string }) => (
    <div className="bg-white dark:bg-[#111111] p-4 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm h-32 flex flex-col justify-between group hover:border-[#F4D03F]/30 transition-all">
        <div className={cn("w-full h-[3px] mb-4 rounded-full", colorClass)} />
        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tight leading-tight mb-2">{label}</p>
        <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
    </div>
);

interface MyDevicesViewProps {
    devices: IoTDevice[];
    readings: SensorReading[];
    apiaries: any[];
    onTabChange: (tab: string) => void;
}

const MyDevicesView: React.FC<MyDevicesViewProps> = ({ devices: initialDevices, readings, apiaries, onTabChange }) => {
    const [localDevices, setLocalDevices] = useState<IoTDevice[]>(initialDevices);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showShortId, setShowShortId] = useState(false);
    const [showLastVal, setShowLastVal] = useState(false);
    const [selectedApiaryId, setSelectedApiaryId] = useState<string>('all');
    const { t } = useLanguage();
    const { user } = useAuth();

    // Sync local devices when initialDevices changes
    useEffect(() => {
        setLocalDevices(initialDevices);
    }, [initialDevices]);

    const handleAddDevice = (newDevice: IoTDevice) => {
        setLocalDevices([newDevice, ...localDevices]);
        toast.success(`Device ${newDevice.device_code} added successfully!`);
    };

    // Filter devices based on apiary and search
    const filteredDevices = localDevices.filter(d => {
        const matchesApiary = selectedApiaryId === 'all' || d.linked_apiary_id === selectedApiaryId;
        const matchesSearch = d.device_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (d.location_name || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesApiary && matchesSearch;
    });

    // Stats calculations (use localDevices to show global stats as per screenshot)
    const totalDevices = localDevices.length;
    const withMeasurement = localDevices.filter(d => readings.some(r => r.device_id === d.id)).length;
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    const measured24h = localDevices.filter(d => readings.some(r => r.device_id === d.id && (now.getTime() - new Date(r.timestamp).getTime() < oneDay))).length;
    const measured48h = localDevices.filter(d => readings.some(r => r.device_id === d.id && (now.getTime() - new Date(r.timestamp).getTime() < oneDay * 2))).length;
    const measured7d = localDevices.filter(d => readings.some(r => r.device_id === d.id && (now.getTime() - new Date(r.timestamp).getTime() < oneDay * 7))).length;
    const measured30d = localDevices.filter(d => readings.some(r => r.device_id === d.id && (now.getTime() - new Date(r.timestamp).getTime() < oneDay * 30))).length;
    const measured365d = localDevices.filter(d => readings.some(r => r.device_id === d.id && (now.getTime() - new Date(r.timestamp).getTime() < oneDay * 365))).length;

    const noMeasurement5d = localDevices.filter(d => !readings.some(r => r.device_id === d.id && (now.getTime() - new Date(r.timestamp).getTime() < oneDay * 5))).length;
    const lowBattery = localDevices.filter(d => d.battery_level < 20).length;

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-500">
            <div>
                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">Measurement data</h1>
                <p className="text-sm font-medium text-slate-400 dark:text-slate-500">BeeHUB devices assigned to your hives.</p>
            </div>

            {/* Stats Rows - Matching Screenshot */}
            <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <StatCard label="TOTAL DEVICES" value={totalDevices} colorClass="bg-blue-500" />
                    <StatCard label="WITH MEASUREMENT" value={withMeasurement} colorClass="bg-sky-400" />
                    <StatCard label="MEASURED IN 24H" value={measured24h} colorClass="bg-green-600" />
                    <StatCard label="MEASURED IN 48H" value={measured48h} colorClass="bg-green-500" />
                    <StatCard label="MEASURED IN 7 DAYS" value={measured7d} colorClass="bg-amber-400" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <StatCard label="MEASURED IN 30 DAYS" value={measured30d} colorClass="bg-orange-500" />
                    <StatCard label="MEASURED IN 365 DAYS" value={measured365d} colorClass="bg-red-500" />
                    <div className="hidden md:block col-span-3" />
                </div>
            </div>

            {/* Attention Needed Section */}
            <div className="mt-12 bg-white dark:bg-[#0c0c0e] rounded-[2rem] border border-slate-100 dark:border-white/5 p-10 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 tracking-tight">Today: attention needed</h3>
                    <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-2">Alerts are computed from last measurements and battery status.</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
                        <AlertCard label="NO MEASUREMENT / OVER 5 DAYS" value={noMeasurement5d} colorClass="bg-red-500" />
                        <AlertCard label="NO MEASUREMENT FOR 24H-5 DAYS" value={0} colorClass="bg-amber-400" />
                        <AlertCard label="LOW BATTERY" value={lowBattery} colorClass="bg-orange-500" />
                        <AlertCard label="WEAK SIGNAL" value={0} colorClass="bg-blue-500" />
                    </div>

                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-10 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" /> All devices look healthy today.
                    </p>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mt-12">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <span className="absolute -top-2 left-4 bg-[#FAF9F6] dark:bg-[#09090b] px-2 text-[10px] font-black text-slate-400 z-10 uppercase tracking-widest">Apiary</span>
                        <Select value={selectedApiaryId} onValueChange={setSelectedApiaryId}>
                            <SelectTrigger className="w-72 h-14 rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] font-bold text-slate-700 dark:text-slate-300 shadow-sm">
                                <SelectValue placeholder="All apiaries" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                                <SelectItem value="all" className="font-bold py-3 text-slate-700">All apiaries</SelectItem>
                                {apiaries.map(apiary => (
                                    <SelectItem key={apiary.id} value={apiary.id} className="font-bold py-3 text-slate-700">
                                        {apiary.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="h-14 px-8 rounded-2xl bg-[#52E495] hover:bg-[#46d188] text-slate-800 font-black shadow-lg shadow-green-500/10 border-none transition-all uppercase tracking-wider flex items-center gap-3"
                    >
                        <Plus className="w-5 h-5 stroke-[3]" /> Add device
                    </Button>
                    <Button
                        onClick={() => setShowShortId(!showShortId)}
                        className={cn(
                            "h-14 px-8 rounded-2xl font-black shadow-lg transition-all uppercase tracking-wider flex items-center gap-3",
                            showShortId
                                ? "bg-blue-600 text-white shadow-blue-500/20"
                                : "bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 border"
                        )}
                    >
                        <div className={cn("w-3 h-3 rounded-full", showShortId ? "bg-green-400" : "bg-slate-300")} />
                        Show device short id
                    </Button>
                    <Button
                        onClick={() => setShowLastVal(!showLastVal)}
                        className={cn(
                            "h-14 px-8 rounded-2xl font-black shadow-lg shadow-slate-200/50 transition-all uppercase tracking-wider flex items-center gap-3",
                            showLastVal
                                ? "bg-blue-600 text-white shadow-blue-500/20"
                                : "bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 border"
                        )}
                    >
                        <div className={cn("w-3 h-3 rounded-full", showLastVal ? "bg-green-400" : "bg-slate-300")} />
                        Show last measurement
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="mt-12 group">
                <div className="bg-[#FFF9F6] dark:bg-[#1A1816]/50 rounded-t-3xl border-b border-rose-100 dark:border-rose-900/20 overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="h-16">
                                <th className="text-[11px] font-black text-slate-500 dark:text-slate-400 px-8 uppercase tracking-widest whitespace-nowrap">Device (short id)</th>
                                <th className="text-[11px] font-black text-slate-500 dark:text-slate-400 px-8 uppercase tracking-widest whitespace-nowrap">Status</th>
                                <th className="text-[11px] font-black text-slate-500 dark:text-slate-400 px-8 uppercase tracking-widest whitespace-nowrap">Battery</th>
                                <th className="text-[11px] font-black text-slate-500 dark:text-slate-400 px-8 uppercase tracking-widest whitespace-nowrap">Signal</th>
                                <th className="text-[11px] font-black text-slate-500 dark:text-slate-400 px-8 uppercase tracking-widest whitespace-nowrap">Last measurement (ago)</th>
                                <th className="text-[11px] font-black text-slate-500 dark:text-slate-400 px-8 uppercase tracking-widest whitespace-nowrap">Apiary</th>
                                <th className="text-[11px] font-black text-slate-500 dark:text-slate-400 px-8 uppercase tracking-widest whitespace-nowrap">Hive</th>
                            </tr>
                        </thead>
                    </table>
                </div>
                <div className="bg-white dark:bg-[#0c0c0e] rounded-b-3xl border border-slate-100 dark:border-white/5 border-t-0 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <tbody>
                                {filteredDevices.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-32 text-center text-slate-300 dark:text-slate-600 font-black uppercase tracking-widest text-sm">
                                            No active devices detected in your network
                                        </td>
                                    </tr>
                                ) : (
                                    filteredDevices.map((device, i) => (
                                        <tr key={device.id} className="h-20 border-b border-slate-50 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors last:border-0">
                                            <td className="px-8 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                                                {showShortId ? device.device_code : '******' + device.device_code.slice(-4)}
                                            </td>
                                            <td className="px-8">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("w-2.5 h-2.5 rounded-full", device.status === 'active' ? 'bg-[#1B9157] shadow-[0_0_8px_rgba(27,145,87,0.4)]' : 'bg-slate-300')} />
                                                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">{device.status === 'active' ? 'Online' : 'Offline'}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 font-bold text-xs text-slate-600 dark:text-slate-400">{device.battery_level}%</td>
                                            <td className="px-8 font-bold text-xs text-slate-600 dark:text-slate-400">-</td>
                                            <td className="px-8 font-bold text-xs text-slate-600 dark:text-slate-400">-</td>
                                            <td className="px-8 font-bold text-xs text-slate-600 dark:text-slate-400">{device.location_name || '-'}</td>
                                            <td className="px-8 font-bold text-xs text-slate-600 dark:text-slate-400">-</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <AddDeviceModal
                open={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                onAdd={handleAddDevice}
            />
        </div>
    );
};

export default MyDevicesView;
