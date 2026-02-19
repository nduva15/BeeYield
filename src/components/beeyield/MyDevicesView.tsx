import React, { useState, useEffect } from 'react';
import { beeyieldService, IoTDevice, SensorReading, Apiary, Hive } from '@/services/beeyieldService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Plus, Battery, Signal, Search, Filter, Cpu, Wifi,
    Moon, Sun, Bell, Headset, Settings, LogOut, ChevronDown, Check,
    CheckCircle2, XCircle, Info, RefreshCw, Clock, FileSearch, AlertCircle,
    Smartphone, Activity, Calendar, Archive
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AddDeviceModal from './AddDeviceModal';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import StatCard from './StatCard';

// Alert Card Component matching screenshot
const AlertCard = ({ label, value, colorClass }: { label: string, value: number | string, colorClass: string }) => (
    <div className="bg-white p-5 rounded-3xl border border-[#E0E0E0] shadow-sm h-28 flex flex-col justify-between group hover:border-beeyield-forest/20 transition-all">
        <div className={cn("w-2 h-2 mb-2 rounded-full", colorClass)} />
        <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">{label}</p>
            <p className="text-2xl font-bold text-beeyield-charcoal mt-1">{value}</p>
        </div>
    </div>
);

const KPICard = ({ label, value, icon: Icon, color, bg }: { label: string, value: string, icon: React.ElementType, color: string, bg: string }) => (
    <div className={cn("p-5 rounded-3xl flex items-center justify-between border border-[#E0E0E0] bg-white shadow-sm")}>
        <div className="flex items-center gap-4">
            <div className={cn("p-3 rounded-2xl bg-beeyield-forest/5 text-beeyield-forest border border-beeyield-forest/10")}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
                <p className={cn("text-lg font-bold text-beeyield-charcoal")}>{value}</p>
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
            setLocalDevices([newDeviceData as IoTDevice, ...localDevices]);
            toast.info(`Local fallback: Device ${newDeviceData.device_code} added.`);
        }
    };

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
        <div className="space-y-10 pb-20 -mt-2 animate-in fade-in duration-700">
            <div>
                <h1 className="text-4xl font-bold text-beeyield-charcoal mb-2 tracking-tight">Ecosystem Nodes</h1>
                <p className="text-gray-500 font-medium">Monitoring IoT telemetry across global apiary clusters.</p>
            </div>

            {/* Stats Row */}
            <motion.div
                className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4"
                initial="hidden"
                animate="show"
                variants={{
                    hidden: { opacity: 0 },
                    show: {
                        opacity: 1,
                        transition: { staggerChildren: 0.05 }
                    }
                }}
            >
                <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                    <StatCard title={t('total_devices')} value={totalDevices} icon={Smartphone} iconColor="#1B4332" />
                </motion.div>
                <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                    <StatCard title={t('with_measurement')} value={withMeasurement} icon={Activity} iconColor="#1B4332" />
                </motion.div>
                <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                    <StatCard title={t('measured_24h')} value={measured24h} icon={Clock} iconColor="#1B4332" />
                </motion.div>
                <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                    <StatCard title={t('measured_48h')} value={measured48h} icon={Clock} iconColor="#1B4332" />
                </motion.div>
                <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                    <StatCard title={t('measured_7d')} value={measured7d} icon={Calendar} iconColor="#1B4332" />
                </motion.div>
                <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                    <StatCard title={t('measured_30d')} value={measured30d} icon={Calendar} iconColor="#1B4332" />
                </motion.div>
                <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                    <StatCard title={t('measured_365d')} value={measured365d} icon={Archive} iconColor="#E67A2E" />
                </motion.div>
            </motion.div>

            {/* Attention Needed Section */}
            <div className="bg-white rounded-[2.5rem] border border-[#E0E0E0] p-10 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-beeyield-charcoal tracking-tight">Network Anomalies</h3>
                        <p className="text-sm font-medium text-gray-400">Nodes requiring immediate maintenance or recalibration.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <AlertCard label={t('no_measurement_5d')} value={noMeasurement5d} colorClass="bg-red-500" />
                    <AlertCard label={t('no_measurement_24h_5d')} value={0} colorClass="bg-beeyield-forest" />
                    <AlertCard label={t('low_battery')} value={lowBattery} colorClass="bg-orange-500" />
                    <AlertCard label={t('weak_signal')} value={0} colorClass="bg-blue-500" />
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Select value={selectedApiaryId} onValueChange={setSelectedApiaryId}>
                            <SelectTrigger className="w-64 h-12 rounded-xl border-[#E0E0E0] bg-white font-bold text-beeyield-charcoal shadow-sm">
                                <SelectValue placeholder={t('all_apiaries')} />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-[#E0E0E0] shadow-xl">
                                <SelectItem value="all">{t('all_apiaries')}</SelectItem>
                                {apiaries && apiaries.map(apiary => (
                                    <SelectItem key={apiary.id} value={apiary.id} className="rounded-xl">
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
                        className="h-12 px-8 rounded-xl bg-beeyield-forest hover:bg-opacity-90 text-white font-bold shadow-lg shadow-beeyield-forest/10"
                    >
                        <Plus className="w-4 h-4 mr-2 stroke-[3]" /> Register Node
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setShowShortId(!showShortId)}
                        className={cn(
                            "h-12 px-6 rounded-xl font-bold shadow-sm transition-all border-[#E0E0E0]",
                            showShortId ? "bg-beeyield-forest text-white border-beeyield-forest" : "bg-white text-gray-600"
                        )}
                    >
                        Node ID
                    </Button>
                    <Button
                        onClick={() => setShowLastVal(!showLastVal)}
                        className={cn(
                            "h-12 px-6 rounded-xl font-bold shadow-sm transition-all border-[#E0E0E0]",
                            showLastVal ? "bg-beeyield-forest text-white border-beeyield-forest" : "bg-white text-gray-600 border"
                        )}
                    >
                        Telemetry
                    </Button>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white rounded-[2.5rem] border border-[#E0E0E0] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="h-16 bg-beeyield-sand/30 border-b border-[#E0E0E0]">
                                {showShortId && <th className="text-[11px] font-bold text-gray-400 px-8 uppercase tracking-widest">ID</th>}
                                <th className="text-[11px] font-bold text-gray-400 px-8 uppercase tracking-widest">Status</th>
                                <th className="text-[11px] font-bold text-gray-400 px-8 uppercase tracking-widest">Battery</th>
                                <th className="text-[11px] font-bold text-gray-400 px-8 uppercase tracking-widest">Signal</th>
                                <th className="text-[11px] font-bold text-gray-400 px-8 uppercase tracking-widest">Quality</th>
                                <th className="text-[11px] font-bold text-gray-400 px-8 uppercase tracking-widest">Uptime</th>
                                <th className="text-[11px] font-bold text-gray-400 px-8 uppercase tracking-widest">Last Ping</th>
                                <th className="text-[11px] font-bold text-gray-400 px-8 uppercase tracking-widest">Apiary</th>
                                <th className="text-[11px] font-bold text-gray-400 px-8 uppercase tracking-widest">Hive</th>
                                {showLastVal && <th className="text-[11px] font-bold text-gray-400 px-8 uppercase tracking-widest">Value</th>}
                                <th className="text-[11px] font-bold text-gray-400 px-8 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDevices.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className="py-24 text-center text-gray-300 font-bold uppercase tracking-widest text-xs">
                                        No active telemetry found
                                    </td>
                                </tr>
                            ) : (
                                filteredDevices.map((device) => (
                                    <tr key={device.id} className="h-20 border-b border-[#F5F5F5] last:border-0 hover:bg-beeyield-sand/10 transition-colors">
                                        {showShortId && <td className="px-8 font-mono text-xs font-bold text-gray-400">{device.device_code}</td>}
                                        <td className="px-8">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("w-2 h-2 rounded-full", device.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-gray-300')} />
                                                <span className="text-xs font-bold text-beeyield-charcoal uppercase tracking-tight">{device.status === 'active' ? 'Online' : 'Offline'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 font-bold text-xs text-beeyield-charcoal">{device.battery_level}%</td>
                                        <td className="px-8 font-bold text-xs text-gray-500">{getSignalStrength(device.id)}</td>
                                        <td className="px-8">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase",
                                                getSignalQuality(getSignalStrength(device.id)) === 'Excellent' ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                                            )}>
                                                {getSignalQuality(getSignalStrength(device.id))}
                                            </span>
                                        </td>
                                        <td className="px-8 font-bold text-xs text-gray-500">{calculateUptime(device.id)}</td>
                                        <td className="px-8 font-bold text-xs text-gray-500">{timeAgo(device.last_ping)}</td>
                                        <td className="px-8 font-bold text-xs text-beeyield-charcoal">{getApiaryName(device.linked_apiary_id || device.apiary_id, device.location_name)}</td>
                                        <td className="px-8 font-bold text-xs text-beeyield-charcoal">{getHiveName(device.hive_id)}</td>
                                        {showLastVal && <td className="px-8 font-bold text-sm text-beeyield-forest">
                                            {getDeviceReadings(device.id).length > 0 ?
                                                `${Object.values(getDeviceReadings(device.id)[0].readings)[0]}` : '-'
                                            }
                                        </td>}
                                        <td className="px-8 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-beeyield-forest/5 text-beeyield-forest">
                                                    <FileSearch className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-beeyield-forest/5 text-gray-400">
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

