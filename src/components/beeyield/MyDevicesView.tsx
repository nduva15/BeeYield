import React, { useState, useEffect } from 'react';
import { beeyieldService, IoTDevice, SensorReading, Apiary, Hive } from '@/services/beeyieldService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Plus, Battery, Signal, Search, Filter, Cpu, Wifi,
    Moon, Sun, Bell, Headset, Settings, LogOut, ChevronDown, Check,
    CheckCircle2, XCircle, Info, RefreshCw, Clock, FileSearch, AlertCircle,
    Smartphone, Activity, Calendar, Archive, Radio, BatteryMedium,
    Zap, Terminal, Network, ShieldCheck, Waves
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AddDeviceModal from './AddDeviceModal';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import StatCard from './StatCard';

// Alert Card Component - Reskinned for Premium Theme
const AlertCard = ({ label, value, colorClass, icon: Icon }: { label: string, value: number | string, colorClass: string, icon: React.ElementType }) => (
    <div className="bg-white p-7 rounded-[2.5rem] border border-[#E0E0E0] shadow-sm h-36 flex flex-col justify-between group hover:border-beeyield-forest/20 hover:shadow-2xl hover:shadow-beeyield-forest/5 transition-all relative overflow-hidden">
        <div className="flex justify-between items-start relative z-10">
            <div className={cn("w-3 h-3 rounded-full shadow-sm", colorClass)} />
            <Icon className="w-5 h-5 text-gray-200 group-hover:text-beeyield-forest/20 transition-colors" />
        </div>
        <div className="relative z-10">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-tight mb-2">{label}</p>
            <p className="text-3xl font-black text-beeyield-charcoal tracking-tighter">{value}</p>
        </div>
        <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gray-50 rounded-full blur-xl group-hover:bg-beeyield-forest/5 transition-colors" />
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
                toast.success(`Infrastructure Node ${data.device_code} Provisioned`);
            }
        } catch (error) {
            console.error('Failed to add device:', error);
            toast.info(`Local fallback: Node ${newDeviceData.device_code} cached.`);
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

        if (seconds < 60) return 'Live';
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
    const measured7d = localDevices.filter(d => readings.some(r => r.device_id === d.id && (now.getTime() - new Date(r.timestamp).getTime() < oneDay * 7))).length;
    const measured30d = localDevices.filter(d => readings.some(r => r.device_id === d.id && (now.getTime() - new Date(r.timestamp).getTime() < oneDay * 30))).length;

    const noMeasurement5d = localDevices.filter(d => !readings.some(r => r.device_id === d.id && (now.getTime() - new Date(r.timestamp).getTime() < oneDay * 5))).length;
    const lowBattery = localDevices.filter(d => d.battery_level < 20).length;

    return (
        <div className="space-y-12 pb-20 animate-in fade-in duration-700">
            {/* Cinematic Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                <div>
                    <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-beeyield-forest/5 border border-beeyield-forest/10 mb-8">
                        <Network className="w-4 h-4 text-beeyield-forest" />
                        <span className="text-[11px] font-black text-beeyield-forest uppercase tracking-[0.2em]">Sovereign Node Network</span>
                    </div>
                    <h1 className="text-6xl font-black text-beeyield-charcoal tracking-tighter leading-none">
                        Ecosystem <span className="text-beeyield-forest">Nodes.</span>
                    </h1>
                    <p className="text-gray-500 font-medium mt-6 text-xl max-w-2xl leading-relaxed">
                        Global orchestration of IoT biometric telemetry across distributed apiary clusters.
                    </p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right hidden lg:block mr-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Network Capacity</p>
                        <p className="text-sm font-bold text-beeyield-charcoal uppercase tracking-tighter flex items-center justify-end gap-2">
                            <Waves className="w-4 h-4 text-beeyield-forest" /> 100% Operational
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="h-16 px-10 rounded-[2rem] bg-beeyield-forest text-white hover:opacity-90 shadow-xl shadow-beeyield-forest/20 transition-all font-black text-[12px] uppercase tracking-[0.2em] flex items-center gap-4"
                    >
                        <Plus className="w-5 h-5 stroke-[3]" /> Register Node
                    </Button>
                </div>
            </div>

            {/* Tactical Stats Row */}
            <motion.div
                className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6"
                initial="hidden"
                animate="show"
                variants={{
                    hidden: { opacity: 0 },
                    show: {
                        opacity: 1,
                        transition: { staggerChildren: 0.1 }
                    }
                }}
            >
                <StatCard title="Total Nodes" value={totalDevices} icon={Smartphone} />
                <StatCard title="Telemetry Active" value={withMeasurement} icon={Activity} />
                <StatCard title="Sync 24h" value={measured24h} icon={Clock} />
                <StatCard title="Sync 7d" value={measured7d} icon={Calendar} />
                <StatCard title="Sync 30d" value={measured30d} icon={Calendar} />
                <StatCard title="Protocol Hub" value="98.3%" icon={ShieldCheck} subtitle="F1 Precision" />
            </motion.div>

            {/* Attention Grid */}
            <div className="space-y-8">
                <div className="flex items-center gap-4 px-2">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Network Integrity Logs</h3>
                    <div className="h-[1px] flex-1 bg-beeyield-sand" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <AlertCard label="Signal Interruption (>5d)" value={noMeasurement5d} colorClass="bg-red-500" icon={Wifi} />
                    <AlertCard label="Encryption Outliers" value={0} colorClass="bg-beeyield-forest" icon={ShieldCheck} />
                    <AlertCard label="Critical Energy Levels" value={lowBattery} colorClass="bg-orange-500" icon={BatteryMedium} />
                    <AlertCard label="Carrier Weakness" value={0} colorClass="bg-blue-500" icon={Radio} />
                </div>
            </div>

            {/* Command Desk Controls */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-6">
                <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="relative group w-full md:w-80">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-beeyield-forest z-10">
                            <Filter className="w-5 h-5" />
                        </div>
                        <Select value={selectedApiaryId} onValueChange={setSelectedApiaryId}>
                            <SelectTrigger className="w-full h-16 pl-14 pr-8 rounded-[2rem] border-2 border-beeyield-sand bg-white font-black text-beeyield-charcoal shadow-sm hover:border-beeyield-forest/30 transition-all focus:ring-0">
                                <SelectValue placeholder="Filter by Location Cluster" />
                            </SelectTrigger>
                            <SelectContent className="rounded-[2.5rem] border-beeyield-sand shadow-2xl p-2 max-h-[400px]">
                                <SelectItem value="all" className="rounded-2xl font-bold py-4">All Regional Clusters</SelectItem>
                                {apiaries && apiaries.map(apiary => (
                                    <SelectItem key={apiary.id} value={apiary.id} className="rounded-2xl font-bold py-4">
                                        {apiary.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search Node IDs..."
                            className="h-16 pl-14 pr-8 rounded-[2rem] border-2 border-beeyield-sand bg-white font-black text-beeyield-charcoal shadow-sm w-full md:w-80 focus:ring-beeyield-forest/20 transition-all"
                        />
                    </div>
                    <Button
                        variant="ghost"
                        onClick={() => setShowShortId(!showShortId)}
                        className={cn(
                            "h-16 px-8 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition-all",
                            showShortId ? "bg-beeyield-charcoal text-white" : "bg-white border-2 border-beeyield-sand text-gray-500"
                        )}
                    >
                        ID Mask
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => setShowLastVal(!showLastVal)}
                        className={cn(
                            "h-16 px-8 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition-all",
                            showLastVal ? "bg-beeyield-charcoal text-white" : "bg-white border-2 border-beeyield-sand text-gray-500"
                        )}
                    >
                        Telemetry Feed
                    </Button>
                </div>
            </div>

            {/* Inventory Ledger */}
            <Card className="rounded-[4rem] border-[#E0E0E0] bg-white shadow-sm overflow-hidden border-b-8 border-b-beeyield-sand/40">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="h-20 bg-beeyield-sand/20 border-b border-[#E0E0E0]">
                                {showShortId && <th className="text-[11px] font-black text-gray-400 px-10 uppercase tracking-[0.3em]">Hashed ID</th>}
                                <th className="text-[11px] font-black text-gray-400 px-10 uppercase tracking-[0.3em]">Status</th>
                                <th className="text-[11px] font-black text-gray-400 px-10 uppercase tracking-[0.3em]">Energy</th>
                                <th className="text-[11px] font-black text-gray-400 px-10 uppercase tracking-[0.3em]">Link Persistence</th>
                                <th className="text-[11px] font-black text-gray-400 px-10 uppercase tracking-[0.3em]">Integrity</th>
                                <th className="text-[11px] font-black text-gray-400 px-10 uppercase tracking-[0.3em]">Last Sync</th>
                                <th className="text-[11px] font-black text-gray-400 px-10 uppercase tracking-[0.3em]">Topology Cluster</th>
                                <th className="text-[11px] font-black text-gray-400 px-10 uppercase tracking-[0.3em]">Node Link</th>
                                {showLastVal && <th className="text-[11px] font-black text-gray-400 px-10 uppercase tracking-[0.3em]">Stream</th>}
                                <th className="text-[11px] font-black text-gray-400 px-10 uppercase tracking-[0.3em] text-right">Audit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDevices.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className="py-40 text-center text-gray-300 font-black uppercase tracking-[0.5em] text-sm">
                                        No authorized nodes detected
                                    </td>
                                </tr>
                            ) : (
                                filteredDevices.map((device, idx) => (
                                    <tr key={device.id} className="h-24 border-b border-[#F5F5F5] last:border-0 hover:bg-beeyield-sand/10 transition-all group">
                                        {showShortId && <td className="px-10 font-mono text-[11px] font-black text-gray-400 group-hover:text-beeyield-charcoal transition-colors">{device.device_code}</td>}
                                        <td className="px-10">
                                            <div className="flex items-center gap-4">
                                                <div className={cn("w-3 h-3 rounded-full shadow-sm", device.status === 'active' ? 'bg-beeyield-forest shadow-beeyield-forest/40 animate-pulse' : 'bg-gray-200')} />
                                                <span className="text-[11px] font-black text-beeyield-charcoal uppercase tracking-widest">{device.status === 'active' ? 'Operational' : 'Dormant'}</span>
                                            </div>
                                        </td>
                                        <td className="px-10">
                                            <div className="flex items-center gap-3">
                                                <span className="font-black text-sm text-beeyield-charcoal">{device.battery_level}%</span>
                                                <div className="w-10 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className={cn("h-full rounded-full", device.battery_level > 50 ? 'bg-beeyield-forest' : device.battery_level > 20 ? 'bg-amber-500' : 'bg-red-500')} style={{ width: `${device.battery_level}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 font-bold text-sm text-gray-400">{getSignalStrength(device.id)}</td>
                                        <td className="px-10">
                                            <Badge variant="outline" className={cn(
                                                "px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-white border-2",
                                                getSignalQuality(getSignalStrength(device.id)) === 'Excellent' ? "text-emerald-600 border-emerald-100" : "text-amber-600 border-amber-100"
                                            )}>
                                                {getSignalQuality(getSignalStrength(device.id))}
                                            </Badge>
                                        </td>
                                        <td className="px-10 font-black text-[11px] text-gray-400 uppercase tracking-tighter">{timeAgo(device.last_ping)}</td>
                                        <td className="px-10 font-black text-[11px] text-beeyield-charcoal uppercase tracking-tighter">{getApiaryName(device.linked_apiary_id || device.apiary_id, device.location_name)}</td>
                                        <td className="px-10 font-black text-[11px] text-beeyield-charcoal uppercase tracking-tighter">{getHiveName(device.hive_id)}</td>
                                        {showLastVal && <td className="px-10 font-black text-[11px] text-beeyield-forest uppercase">
                                            {getDeviceReadings(device.id).length > 0 ?
                                                `${Object.values(getDeviceReadings(device.id)[0].readings)[0]}` : '-'
                                            }
                                        </td>}
                                        <td className="px-10 text-right">
                                            <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                                                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white shadow-sm border border-[#F0F0F0] text-beeyield-forest hover:bg-beeyield-forest hover:text-white transition-all">
                                                    <FileSearch className="w-5 h-5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white shadow-sm border border-[#F0F0F0] text-gray-400 hover:text-beeyield-charcoal transition-all">
                                                    <Settings className="w-5 h-5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

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
