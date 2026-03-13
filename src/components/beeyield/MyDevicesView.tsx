import React from 'react';
import { beeyieldService, IoTDevice, SensorReading, Apiary, Hive } from '@/services/beeyieldService';
import {
    Plus, Battery, Signal, Search, Smartphone, RefreshCw, Wifi,
    FileSearch, Settings, ArrowRight, Cpu, Network, ShieldCheck, Download,
    Waves, Activity, Zap, Layers, ChevronRight, SearchCode, Database,
    Info, Filter, MoreVertical, Trash2, Edit, Check, AlertCircle, Loader2, MapPin, Binary
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AddDeviceModal from './AddDeviceModal';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { glass, PageHeader, GlassStatCard } from './GlassTheme';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Label } from '@/components/ui/label';

interface MyDevicesViewProps {
    devices: IoTDevice[];
    readings: SensorReading[];
    apiaries: Apiary[];
    hives: Hive[];
    onTabChange: (tab: string) => void;
}

const MyDevicesView: React.FC<MyDevicesViewProps> = ({ devices: initialDevices, readings, apiaries, hives, onTabChange }) => {
    const [localDevices, setLocalDevices] = React.useState<IoTDevice[]>(initialDevices);
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedApiaryId, setSelectedApiaryId] = React.useState<string>('all');
    const { t } = useLanguage();

    React.useEffect(() => {
        setLocalDevices(initialDevices);
    }, [initialDevices]);

    const handleAddDevice = async (newDeviceData: any) => {
        try {
            const { data, error } = await beeyieldService.createDevice(newDeviceData);
            if (error) throw error;
            if (data) {
                setLocalDevices([data, ...localDevices]);
                toast.success(`Device ${data.device_code} Added`);
            }
        } catch (error) {
            console.error('Add error:', error);
            setLocalDevices([newDeviceData, ...localDevices]);
            toast.info(`Device ${newDeviceData.device_code} cached locally.`);
        }
    };

    const filteredDevices = localDevices.filter(d => {
        const matchesApiary = selectedApiaryId === 'all' || d.linked_apiary_id === selectedApiaryId || d.apiary_id === selectedApiaryId;
        const matchesSearch = d.device_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (d.location_name || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesApiary && matchesSearch;
    });

    const getHiveName = (hiveId?: string) => hiveId ? hives?.find(h => h.id === hiveId)?.hive_code || '-' : '-';

    const getApiaryName = (apiaryId?: string, locationName?: string) => {
        if (apiaryId) {
            const apiary = apiaries?.find(a => a.id === apiaryId);
            if (apiary) return apiary.name;
        }
        return locationName || '-';
    };

    const timeAgo = (dateString?: string) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        if (seconds < 60) return 'Online Now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const measured24h = localDevices.filter(d => readings.some(r => r.device_id === d.id && (now.getTime() - new Date(r.timestamp).getTime() < oneDay))).length;
    const offlineCount = localDevices.filter(d => !readings.some(r => r.device_id === d.id && (now.getTime() - new Date(r.timestamp).getTime() < oneDay * 3))).length;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={glass.page}
        >
            {/* Header */}
            <PageHeader
                icon={Cpu}
                label="Sensor Management"
                title={<>Device <span className="text-[#F4D03F]">Registry</span></>}
                subtitle="IoT node orchestration and hardware telemetry monitoring."
                actions={
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className={cn(glass.btnPrimary, "h-11 px-8 text-[9px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2")}
                    >
                        <Plus className="w-4 h-4" />
                        Initialize_Node
                    </button>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <GlassStatCard label="Total Inventory" value={localDevices.length} icon={Smartphone} index={0} />
                <GlassStatCard label="Active Vector" value={measured24h} icon={RefreshCw} index={1} color="text-[#1B9157]" />
                <GlassStatCard label="Offline Trace" value={offlineCount} icon={Wifi} index={2} color="text-red-500" />
                <GlassStatCard label="Module Energy" value={localDevices.filter(d => d.battery_level < 20).length} icon={Battery} index={3} color="text-[#F4D03F]" />
            </div>

            {/* Device Registry */}
            <div className={glass.section}>
                {/* Search and Filters */}
                <div className={glass.sectionHeader}>
                    <div className="flex-1 w-full space-y-2">
                        <Label className="text-[9px] font-black tracking-[0.2em] text-[#1A1A1A]/40 uppercase ml-2">Node Identifier</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#F4D03F]/40" />
                            <Input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search..."
                                className={glass.input + " pl-10 h-10 w-full"}
                            />
                        </div>
                    </div>
                    <div className="w-[200px] flex flex-col gap-1">
                        <Label className={glass.microLabel + " ml-1"}>Location</Label>
                        <Select value={selectedApiaryId} onValueChange={setSelectedApiaryId}>
                            <SelectTrigger className={glass.select}>
                                <div className="flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-[#F4D03F]" />
                                    <SelectValue placeholder="All Nodes" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className={glass.selectContent}>
                                <SelectItem value="all" className="text-sm">All Nodes</SelectItem>
                                {apiaries.map(apiary => (
                                    <SelectItem key={apiary.id} value={apiary.id} className="text-sm">{apiary.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto thin-scrollbar relative z-10">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr>
                                <th className={glass.tableHead}>Status</th>
                                <th className={glass.tableHead}>Node ID</th>
                                <th className={glass.tableHead}>Location</th>
                                <th className={glass.tableHead}>Target</th>
                                <th className={glass.tableHead}>Energy</th>
                                <th className={glass.tableHead}>Last Sync</th>
                                <th className={glass.tableHead + " text-right"}>Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F4D03F]/10">
                            <AnimatePresence mode="popLayout">
                                {filteredDevices.length === 0 ? (
                                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <td colSpan={7} className="h-48 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-3 opacity-30">
                                                <SearchCode className="w-8 h-8" />
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">No Nodes Detected</h3>
                                                <button onClick={() => setIsAddModalOpen(true)} className={cn(glass.btnSecondary, "h-9 px-6 text-[8px] font-black uppercase mt-4")}>
                                                    Initialize First Node
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ) : (
                                    filteredDevices.map((device, i) => (
                                        <motion.tr
                                            key={device.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="group hover:bg-[#F4D03F]/[0.05] transition-all duration-300 cursor-default"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("w-2 h-2 rounded-full", device.status === 'active' ? 'bg-[#1B9157] shadow-sm shadow-[#1B9157]/40' : 'bg-red-500 shadow-sm shadow-red-500/40')} />
                                                    <span className={cn("text-[9px] font-black uppercase tracking-widest", device.status === 'active' ? 'text-[#1B9157]' : 'text-red-500')}>{device.status === 'active' ? 'NOMINAL' : 'OFFLINE'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-white border border-[#F4D03F]/10 flex items-center justify-center shadow-sm group-hover:bg-[#F4D03F] group-hover:text-white transition-all">
                                                        <Cpu className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] font-black uppercase tracking-tight text-[#1A1A1A]">{device.device_code}</span>
                                                        <span className="text-[7px] font-black text-[#F4D03F] uppercase italic tracking-[0.2em]">Node_v5.2</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3 h-3 text-[#F4D03F] opacity-40" />
                                                    <span className="text-[9px] font-bold text-[#1A1A1A]/60 uppercase tracking-wider">{getApiaryName(device.linked_apiary_id || device.apiary_id, device.location_name)}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#1B9157]/5 border border-[#1B9157]/10 text-[#1B9157]">
                                                    <ShieldCheck className="w-3 h-3" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">{getHiveName(device.hive_id)}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex flex-col gap-1 w-20">
                                                        <div className="flex justify-between items-center px-0.5">
                                                            <span className="text-[9px] font-black tabular-nums">{device.battery_level}%</span>
                                                        </div>
                                                        <div className="h-1 w-full bg-[#1A1A1A]/5 rounded-full overflow-hidden">
                                                            <div className={cn("h-full rounded-full transition-all", device.battery_level > 60 ? "bg-[#1B9157]" : device.battery_level > 20 ? "bg-[#F4D03F]" : "bg-red-500 animate-pulse")} style={{ width: `${device.battery_level}%` }} />
                                                        </div>
                                                    </div>
                                                    <Battery className={cn("w-3.5 h-3.5", device.battery_level < 20 ? "text-red-500 animate-pulse" : "text-[#F4D03F] opacity-40")} />
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Activity className="w-3 h-3 text-[#F4D03F] opacity-40" />
                                                    <span className="text-[9px] font-bold text-[#1A1A1A]/40 uppercase tracking-widest">{timeAgo(device.last_ping)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button className="w-8 h-8 rounded-lg bg-white border border-[#F4D03F]/10 flex items-center justify-center hover:bg-[#F4D03F] hover:text-white transition-all shadow-sm">
                                                        <FileSearch className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button className="w-8 h-8 rounded-lg bg-white border border-[#F4D03F]/10 flex items-center justify-center hover:bg-[#1A1A1A] hover:text-white transition-all shadow-sm">
                                                        <Settings className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
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

            <style>{`
                .thin-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .thin-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .thin-scrollbar::-webkit-scrollbar-thumb { background: rgba(251, 191, 36, 0.1); border-radius: 20px; }
            `}</style>
        </motion.div>
    );
};

export default MyDevicesView;
