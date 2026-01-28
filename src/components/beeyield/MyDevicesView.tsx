import React, { useState, useEffect } from 'react';
import { IoTDevice, SensorReading } from '@/services/beeyieldService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Plus, Battery, Signal, Search, Filter, Cpu, Wifi,
    Moon, Sun, Bell, Headset, Settings, LogOut, ChevronDown, Check
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
    <div className="bg-white dark:bg-[#111111] p-4 rounded-sm border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden h-24 flex flex-col justify-between">
        <div className={cn("absolute top-0 left-0 w-full h-[3px]", colorClass)} />
        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
    </div>
);

// Alert Card Component matching screenshot
const AlertCard = ({ label, value, colorClass }: { label: string, value: number | string, colorClass: string }) => (
    <div className="bg-white dark:bg-[#111111] p-4 rounded-lg border border-gray-100 dark:border-white/5 shadow-sm h-24 flex flex-col justify-between">
        <div className={cn("w-full h-[2px] mb-2 rounded-full", colorClass)} />
        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter leading-tight">{label}</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
    </div>
);

interface MyDevicesViewProps {
    devices: IoTDevice[];
    readings: SensorReading[];
    onTabChange: (tab: string) => void;
}

const MyDevicesView: React.FC<MyDevicesViewProps> = ({ devices: initialDevices, readings, onTabChange }) => {
    const [localDevices, setLocalDevices] = useState<IoTDevice[]>(initialDevices);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showShortId, setShowShortId] = useState(false);
    const [showLastVal, setShowLastVal] = useState(false);
    const { t, language } = useLanguage();
    const { signOut } = useAuth();
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    // Sync local devices when initialDevices changes
    useEffect(() => {
        setLocalDevices(initialDevices);
    }, [initialDevices]);

    const handleAddDevice = (newDevice: IoTDevice) => {
        setLocalDevices([newDevice, ...localDevices]);
        toast.success(`Device ${newDevice.device_code} added successfully!`);
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        if (newTheme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    };

    // Stats calculations
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
        <div className="space-y-6 pb-20 -mt-2">
            <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white px-2 mb-8 tracking-tight">My devices</h1>
            </div>

            {/* Stats Row 1 */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <StatCard label={t('total_devices')} value={totalDevices} colorClass="bg-[#F4D03F]" />
                <StatCard label={t('with_measurement')} value={withMeasurement} colorClass="bg-[#1B9157]" />
                <StatCard label={t('measured_24h')} value={measured24h} colorClass="bg-[#1B9157]" />
                <StatCard label={t('measured_48h')} value={measured48h} colorClass="bg-[#1B9157]" />
                <StatCard label={t('measured_7d')} value={measured7d} colorClass="bg-[#F4D03F]" />
            </div>

            {/* Stats Row 2 */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-[40%]">
                <StatCard label={t('measured_30d')} value={measured30d} colorClass="bg-[#F4D03F]" />
                <StatCard label={t('measured_365d')} value={measured365d} colorClass="bg-red-500" />
            </div>

            {/* Attention Needed Section */}
            <div className="mt-8 bg-slate-50/50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 p-6">
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 tracking-tight">{t('attention_needed')}</h3>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1">{t('attention_subtitle')}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <AlertCard label={t('no_measurement_5d')} value={noMeasurement5d} colorClass="bg-red-500" />
                    <AlertCard label={t('no_measurement_24h_5d')} value={0} colorClass="bg-[#F4D03F]" />
                    <AlertCard label={t('low_battery')} value={lowBattery} colorClass="bg-[#F4D03F]" />
                    <AlertCard label={t('weak_signal')} value={0} colorClass="bg-[#F4D03F]" />
                </div>

                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-6 px-1">{t('all_healthy')}</p>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <span className="absolute -top-2 left-3 bg-white dark:bg-[#000000] px-1 text-[10px] font-bold text-slate-400 z-10">{t('apiary')}</span>
                        <Select defaultValue="all">
                            <SelectTrigger className="w-64 h-11 rounded-lg border-slate-300 dark:border-white/10 bg-white dark:bg-black/20 font-bold text-slate-700 dark:text-slate-300">
                                <SelectValue placeholder={t('all_apiaries')} />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all">{t('all_apiaries')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="h-11 px-6 rounded-full bg-[#1B9157] hover:bg-[#146c43] text-white font-bold shadow-lg shadow-green-500/10"
                    >
                        <Plus className="w-4 h-4 mr-2" /> {t('add_device')}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setShowShortId(!showShortId)}
                        className={cn(
                            "h-11 px-6 rounded-full font-bold shadow-sm transition-all",
                            showShortId
                                ? "bg-[#F4D03F] hover:bg-[#e0be36] text-[#1A1A1A] border-transparent"
                                : "bg-white dark:bg-black/20 border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200"
                        )}
                    >
                        {showShortId ? (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#4ADE80] mr-2 shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                        ) : (
                            <div className="w-3 h-3 rounded-full border-2 border-slate-200 flex items-center justify-center mr-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#F4D03F]" />
                            </div>
                        )}
                        {t('show_short_id')}
                    </Button>
                    <Button
                        onClick={() => setShowLastVal(!showLastVal)}
                        className={cn(
                            "h-11 px-6 rounded-full font-bold shadow-lg transition-all",
                            showLastVal
                                ? "bg-[#F4D03F] hover:bg-[#e0be36] text-[#1A1A1A] shadow-yellow-500/20"
                                : "bg-white dark:bg-black/20 border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 border"
                        )}
                    >
                        {showLastVal ? (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#4ADE80] mr-2 shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                        ) : (
                            <div className="w-3 h-3 rounded-full border-2 border-slate-200 flex items-center justify-center mr-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#F4D03F]" />
                            </div>
                        )}
                        {t('show_last_measurement')}
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="mt-8">
                <div className="bg-[#FFF9F6] dark:bg-[#1A1816]/50 rounded-t-2xl border-b border-rose-100 dark:border-rose-900/20">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="h-14">
                                {showShortId && <th className="text-[12px] font-bold text-slate-600 dark:text-slate-400 px-6 uppercase tracking-tight whitespace-nowrap pl-8">{t('table_device_id')}</th>}
                                <th className={cn("text-[12px] font-bold text-slate-600 dark:text-slate-400 px-6 uppercase tracking-tight whitespace-nowrap", !showShortId && "pl-8")}>{t('table_status')}</th>
                                <th className="text-[12px] font-bold text-slate-600 dark:text-slate-400 px-6 uppercase tracking-tight whitespace-nowrap">{t('table_battery')}</th>
                                <th className="text-[12px] font-bold text-slate-600 dark:text-slate-400 px-6 uppercase tracking-tight whitespace-nowrap">{t('table_signal')}</th>
                                <th className="text-[12px] font-bold text-slate-600 dark:text-slate-400 px-6 uppercase tracking-tight whitespace-nowrap">{t('table_last_ago')}</th>
                                <th className="text-[12px] font-bold text-slate-600 dark:text-slate-400 px-6 uppercase tracking-tight whitespace-nowrap">{t('table_apiary')}</th>
                                <th className="text-[12px] font-bold text-slate-600 dark:text-slate-400 px-6 uppercase tracking-tight whitespace-nowrap">{t('table_hive')}</th>
                                {showLastVal && <th className="text-[12px] font-bold text-slate-600 dark:text-slate-400 px-6 uppercase tracking-tight whitespace-nowrap">{t('table_last_val')}</th>}
                            </tr>
                        </thead>
                    </table>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <tbody>
                            {localDevices.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-24 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                                        No hardware units detected
                                    </td>
                                </tr>
                            ) : (
                                localDevices.map((device, i) => (
                                    <tr key={device.id} className="h-16 border-b border-slate-50 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                        {showShortId && <td className="px-8 font-mono text-xs font-bold text-slate-500">{device.device_code}</td>}
                                        <td className={cn("px-6", !showShortId && "pl-8")}>
                                            <div className="flex items-center gap-2">
                                                <div className={cn("w-2 h-2 rounded-full", device.status === 'active' ? 'bg-[#1B9157]' : 'bg-slate-300')} />
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">{device.status === 'active' ? t('online') : t('offline')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 font-bold text-xs text-slate-600">{device.battery_level}%</td>
                                        <td className="px-6 font-bold text-xs text-slate-600">92%</td>
                                        <td className="px-6 font-bold text-xs text-slate-600">2 min ago</td>
                                        <td className="px-6 font-bold text-xs text-slate-600">{device.location_name || 'Global'}</td>
                                        <td className="px-6 font-bold text-xs text-slate-600">Hive #1</td>
                                        {showLastVal && <td className="px-6 font-bold text-sm text-slate-800 dark:text-slate-200">25.4°C</td>}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
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
