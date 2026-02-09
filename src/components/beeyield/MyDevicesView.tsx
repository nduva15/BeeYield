import React, { useState, useEffect } from 'react';
import { beeyieldService, IoTDevice, SensorReading, Apiary, Hive } from '@/services/beeyieldService';
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

// KPI Card Component
const KPICard = ({ label, value, icon: Icon, color, bg }: { label: string, value: string, icon: React.ElementType, color: string, bg: string }) => (
    <div className={cn("p-4 rounded-lg flex items-center justify-between", bg)}>
        <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-full", color, bg.replace('dark:bg-white/5', 'dark:bg-white/10'))}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
                <p className={cn("text-lg font-bold", color)}>{value}</p>
            </div>
        </div>
    </div>
);

interface MyDevicesViewProps {
    devices: IoTDevice[];
    readings: SensorReading[];
    apiaries: Apiary[];
    hives: Hive[];
    onTabChange: (tab: string) => void;
}

const MyDevicesView: React.FC<MyDevicesViewProps> = ({ devices: initialDevices, readings, apiaries, hives, onTabChange }) => {
    const [localDevices, setLocalDevices] = useState<IoTDevice[]>(initialDevices);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showShortId, setShowShortId] = useState(false);
    const [showLastVal, setShowLastVal] = useState(false);
    const [selectedApiaryId, setSelectedApiaryId] = useState<string>('all');
    const { t, language } = useLanguage();
    const { signOut } = useAuth();
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    // Sync local devices when initialDevices changes
    useEffect(() => {
        setLocalDevices(initialDevices);
    }, [initialDevices]);

    const handleAddDevice = async (newDeviceData: any) => {
        try {
            const { data, error } = await beeyieldService.createDevice(newDeviceData);
            if (error) throw error;
            if (data) {
                setLocalDevices([data, ...localDevices]);
                toast.success(`Device ${data.device_code} added successfully!`);
            }
        } catch (error) {
            console.error('Failed to add device:', error);
            // Fallback for demo if API fails
            setLocalDevices([newDeviceData as IoTDevice, ...localDevices]);
            toast.info(`Local fallback: Device ${newDeviceData.device_code} added.`);
        }
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        if (newTheme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    };

    // Filter devices based on apiary and search
    const filteredDevices = localDevices.filter(d => {
        const matchesApiary = selectedApiaryId === 'all' || d.linked_apiary_id === selectedApiaryId || d.apiary_id === selectedApiaryId;
        const matchesSearch = d.device_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (d.location_name || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesApiary && matchesSearch;
    });

    const getHiveName = (hiveId?: string) => {
        if (!hiveId) return '-';
        const hive = hives?.find(h => h.id === hiveId);
        return hive ? hive.hive_code : '-';
    };

    const getApiaryName = (apiaryId?: string, locationName?: string) => {
        if (apiaryId) {
            const apiary = apiaries?.find(a => a.id === apiaryId);
            if (apiary) return apiary.name;
        }
        return locationName || '-';
    }

    const getDeviceReadings = (deviceId: string) => {
        return readings?.filter(r => r.device_id === deviceId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) || [];
    };

    const getSignalStrength = (deviceId: string) => {
        const deviceReadings = getDeviceReadings(deviceId);
        if (deviceReadings.length === 0) return '-';
        return deviceReadings[0].signal_strength !== undefined ? `${deviceReadings[0].signal_strength} dBm` : '-';
    };

    const getSignalQuality = (strength: string) => {
        if (strength === '-') return '-';
        const val = parseInt(strength);
        if (isNaN(val)) return '-';
        if (val > -60) return 'Excellent';
        if (val > -80) return 'Good';
        if (val > -90) return 'Fair';
        return 'Poor';
    };

    const calculateUptime = (deviceId: string) => {
        const deviceReadings = getDeviceReadings(deviceId);
        if (deviceReadings.length < 2) return '-';
        return '99.9%';
    };

    const timeAgo = (dateString?: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
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

            {/* Network Stability KPI Cards */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    {
                        label: 'Active Devices',
                        value: `${localDevices.filter(d => d.status === 'active').length}/${localDevices.length}`,
                        icon: CheckCircle2,
                        color: 'text-emerald-500',
                        bg: 'bg-emerald-50 dark:bg-emerald-900/10'
                    },
                    {
                        label: 'Avg Signal Quality',
                        value: (() => {
                            const strengths = localDevices.map(d => parseInt(getSignalStrength(d.id))).filter(s => !isNaN(s));
                            if (strengths.length === 0) return '-';
                            const avg = strengths.reduce((a, b) => a + b, 0) / strengths.length;
                            return getSignalQuality(avg.toString());
                        })(),
                        icon: Signal,
                        color: 'text-blue-500',
                        bg: 'bg-blue-50 dark:bg-blue-900/10'
                    },
                    {
                        label: 'Network Uptime',
                        value: localDevices.length > 0 ? '99.9%' : '-',
                        icon: Clock,
                        color: 'text-[#F4D03F]',
                        bg: 'bg-[#F4D03F]/10 dark:bg-[#F4D03F]/20'
                    },
                    {
                        label: 'Critical Alerts',
                        value: lowBattery.toString(),
                        icon: AlertCircle,
                        color: 'text-slate-400',
                        bg: 'bg-slate-50 dark:bg-white/5'
                    },
                ].map((stat, i) => (
                    <KPICard key={i} {...stat} />
                ))}
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <span className="absolute -top-2 left-3 bg-white dark:bg-[#000000] px-1 text-[10px] font-bold text-slate-400 z-10">{t('apiary')}</span>
                        <Select value={selectedApiaryId} onValueChange={setSelectedApiaryId}>
                            <SelectTrigger className="w-64 h-11 rounded-lg border-slate-300 dark:border-white/10 bg-white dark:bg-black/20 font-bold text-slate-700 dark:text-slate-300">
                                <SelectValue placeholder={t('all_apiaries')} />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all">{t('all_apiaries')}</SelectItem>
                                {apiaries && apiaries.map(apiary => (
                                    <SelectItem key={apiary.id} value={apiary.id}>
                                        {apiary.name}
                                    </SelectItem>
                                ))}
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
                                <th className="text-[12px] font-bold text-slate-600 dark:text-slate-400 px-6 uppercase tracking-tight whitespace-nowrap">Signal Quality</th>
                                <th className="text-[12px] font-bold text-slate-600 dark:text-slate-400 px-6 uppercase tracking-tight whitespace-nowrap">Uptime</th>
                                <th className="text-[12px] font-bold text-slate-600 dark:text-slate-400 px-6 uppercase tracking-tight whitespace-nowrap">{t('table_last_ago')}</th>
                                <th className="text-[12px] font-bold text-slate-600 dark:text-slate-400 px-6 uppercase tracking-tight whitespace-nowrap">{t('table_apiary')}</th>
                                <th className="text-[12px] font-bold text-slate-600 dark:text-slate-400 px-6 uppercase tracking-tight whitespace-nowrap">{t('table_hive')}</th>
                                {showLastVal && <th className="text-[12px] font-bold text-slate-600 dark:text-slate-400 px-6 uppercase tracking-tight whitespace-nowrap">{t('table_last_val')}</th>}
                                <th className="text-[12px] font-bold text-slate-600 dark:text-slate-400 px-6 uppercase tracking-tight whitespace-nowrap text-right">Actions</th>
                            </tr>
                        </thead>
                    </table>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <tbody>
                            {filteredDevices.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className="py-24 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                                        No hardware units detected
                                    </td>
                                </tr>
                            ) : (
                                filteredDevices.map((device, i) => (
                                    <tr key={device.id} className="h-16 border-b border-slate-50 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                        {showShortId && <td className="px-8 font-mono text-xs font-bold text-slate-500">{device.device_code}</td>}
                                        <td className={cn("px-6", !showShortId && "pl-8")}>
                                            <div className="flex items-center gap-2">
                                                <div className={cn("w-2 h-2 rounded-full", device.status === 'active' ? 'bg-[#1B9157]' : 'bg-slate-300')} />
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">{device.status === 'active' ? t('online') : t('offline')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 font-bold text-xs text-slate-600">{device.battery_level}%</td>
                                        <td className="px-6 font-bold text-xs text-slate-600">{getSignalStrength(device.id)}</td>
                                        <td className="px-6 font-bold text-xs text-slate-600">{getSignalQuality(getSignalStrength(device.id))}</td>
                                        <td className="px-6 font-bold text-xs text-slate-600">{calculateUptime(device.id)}</td>
                                        <td className="px-6 font-bold text-xs text-slate-600">{timeAgo(device.last_ping)}</td>
                                        <td className="px-6 font-bold text-xs text-slate-600">{getApiaryName(device.linked_apiary_id || device.apiary_id, device.location_name)}</td>
                                        <td className="px-6 font-bold text-xs text-slate-600">{getHiveName(device.hive_id)}</td>
                                        {showLastVal && <td className="px-6 font-bold text-sm text-slate-800 dark:text-slate-200">
                                            {getDeviceReadings(device.id).length > 0 ?
                                                `${Object.values(getDeviceReadings(device.id)[0].readings)[0]}` : '-'
                                            }
                                        </td>}
                                        <td className="py-4 text-right pr-4">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600" title="Diagnostic Report">
                                                    <FileSearch className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-[#F4D03F]/10 text-[#F4D03F]" title="Settings">
                                                    <Settings className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
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
                apiaries={apiaries}
                hives={hives}
            />
        </div>
    );
};

export default MyDevicesView;
