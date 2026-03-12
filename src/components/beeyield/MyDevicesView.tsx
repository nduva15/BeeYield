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
                title={<>Device <span className="text-[#F4D03F]">Management</span></>}
                subtitle="Manage all your IoT sensors and hardware in one place to keep your apiary connected."
                actions={
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className={cn(glass.btnPrimary, "h-24 bg-[#F4D03F] text-[#1A1A1A] shadow-4xl rounded-[3.5rem] px-16 font-black italic text-2xl uppercase flex items-center justify-center gap-10 group/btn pl-24")}
                    >
                        <Plus className="w-10 h-10 group-hover/btn:rotate-90 transition-transform" />
                        Add Device
                    </button>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
                <GlassStatCard label="Total Devices" value={localDevices.length} icon={Smartphone} index={0} />
                <GlassStatCard label="Active (24h)" value={measured24h} icon={RefreshCw} index={1} color="text-[#1B9157]" />
                <GlassStatCard label="Offline" value={offlineCount} icon={Wifi} index={2} color="text-destructive" />
                <GlassStatCard label="Low Battery" value={localDevices.filter(d => d.battery_level < 20).length} icon={Battery} index={3} color="text-[#F4D03F]" />
            </div>

            {/* Device Registry */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(glass.card, "p-0 overflow-hidden bg-[#FFF9F0]/80 backdrop-blur-3xl rounded-[6rem] relative")}
            >
                {/* Search and Filters */}
                <div className="p-16 border-b border-[#F4D03F]/10 bg-gray-400 backdrop-blur-3xl flex flex-col xl:flex-row gap-16 items-center relative z-10">
                    <div className="flex-1 w-full relative">
                        <Label className={cn(glass.microLabel, 'ml-8 opacity-40 uppercase italic mb-4 block')}>Search Devices</Label>
                        <div className="relative">
                            <Search className="absolute left-10 top-1/2 -translate-y-1/2 w-10 h-10 text-[#F4D03F] opacity-20" />
                            <Input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by code or location..."
                                className={cn(glass.input, "h-24 pl-26 text-3xl")}
                            />
                        </div>
                    </div>
                    <div className="w-full xl:w-[450px]">
                        <Label className={cn(glass.microLabel, 'ml-8 opacity-40 uppercase italic mb-4 block')}>Location</Label>
                        <Select value={selectedApiaryId} onValueChange={setSelectedApiaryId}>
                            <SelectTrigger className={cn(glass.select, 'h-24 px-12 text-2xl')}>
                                <div className="flex items-center gap-8">
                                    <Layers className="w-8 h-8 text-blue-400" />
                                    <SelectValue placeholder="All Locations" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className={glass.selectContent}>
                                <SelectItem value="all" className="p-6 font-black uppercase text-[15px] italic rounded-2xl">All Locations</SelectItem>
                                {apiaries.map(apiary => (
                                    <SelectItem key={apiary.id} value={apiary.id} className="p-6 font-black uppercase text-[15px] italic rounded-2xl">{apiary.name.toUpperCase()}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto thin-scrollbar relative z-10">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-gray-400">
                                <th className={cn(glass.microLabel, "px-14 py-12 opacity-40 border-b border-[#F4D03F]/10 uppercase italic")}>Status</th>
                                <th className={cn(glass.microLabel, "px-10 py-12 opacity-40 border-b border-[#F4D03F]/10 uppercase italic")}>Device</th>
                                <th className={cn(glass.microLabel, "px-10 py-12 opacity-40 border-b border-[#F4D03F]/10 uppercase italic")}>Location</th>
                                <th className={cn(glass.microLabel, "px-10 py-12 opacity-40 border-b border-[#F4D03F]/10 uppercase italic")}>Hive</th>
                                <th className={cn(glass.microLabel, "px-10 py-12 opacity-40 border-b border-[#F4D03F]/10 uppercase italic")}>Battery</th>
                                <th className={cn(glass.microLabel, "px-10 py-12 opacity-40 border-b border-[#F4D03F]/10 uppercase italic")}>Last Seen</th>
                                <th className={cn(glass.microLabel, "px-14 py-12 opacity-40 border-b border-[#F4D03F]/10 text-right uppercase italic")}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <AnimatePresence mode="popLayout">
                                {filteredDevices.length === 0 ? (
                                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <td colSpan={7} className="h-[500px] text-center">
                                            <div className="flex flex-col items-center justify-center space-y-10 group/null opacity-20">
                                                <SearchCode className="w-24 h-24" />
                                                <h3 className="text-5xl font-black italic tracking-tighter uppercase">No Devices Found</h3>
                                                <p className="text-xl italic uppercase tracking-widest">Connect your first sensor to start monitoring.</p>
                                                <button onClick={() => setIsAddModalOpen(true)} className={cn(glass.btnPrimary, "h-22 px-14 mt-12 bg-[#F4D03F] text-[#1A1A1A]")}>
                                                    Add Device <ArrowRight className="w-8 h-8 ml-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ) : (
                                    filteredDevices.map((device, i) => (
                                        <motion.tr
                                            key={device.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="group hover:bg-[#F4D03F]/[0.04] transition-all duration-700 cursor-default"
                                        >
                                            <td className="px-14 py-14">
                                                <div className="flex items-center gap-6">
                                                    <div className={cn("w-4 h-4 rounded-full border-2 border-[#F4D03F]/40 shadow-4xl", device.status === 'active' ? 'bg-[#1B9157]' : 'bg-red-500')} />
                                                    <span className={cn(glass.microLabel, "font-black italic text-[14px]", device.status === 'active' ? 'text-[#1B9157]' : 'text-red-500')}>{device.status === 'active' ? 'Online' : 'Offline'}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-14">
                                                <div className="flex items-center gap-10">
                                                    <div className="w-20 h-20 rounded-[2rem] bg-gray-400 border border-[#F4D03F]/10 flex items-center justify-center shadow-4xl group-hover:scale-110 group-hover:text-[#F4D03F] transition-all">
                                                        <Cpu className="w-10 h-10" />
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-3xl font-black italic text-foreground tracking-tighter uppercase group-hover:text-[#F4D03F]">{device.device_code}</span>
                                                        <span className="text-[12px] font-black text-[#F4D03F]/20 uppercase italic">v5.2</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-14">
                                                <div className="flex items-center gap-5">
                                                    <MapPin className="w-6 h-6 text-[#F4D03F] opacity-40" />
                                                    <span className="text-lg font-black italic text-foreground/40 group-hover:text-foreground transition-colors uppercase">{getApiaryName(device.linked_apiary_id || device.apiary_id, device.location_name)}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-14">
                                                <div className={cn(glass.badge, 'bg-[#1B9157]/ text-[#1B9157] border-[#1B9157]/ px-10 py-3 skew-x-[-12deg]')}>
                                                    <div className="flex items-center gap-4 skew-x-[12deg]">
                                                        <ShieldCheck className="w-5 h-5" />
                                                        <span className="font-black italic uppercase text-[15px]">{getHiveName(device.hive_id)}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-14">
                                                <div className="flex items-center gap-8">
                                                    <div className="flex flex-col items-end gap-3 min-w-[120px]">
                                                        <span className="text-2xl font-black italic tabular-nums text-foreground/70">{device.battery_level}%</span>
                                                        <div className="w-full h-2.5 bg-[#F9F7F2] rounded-full overflow-hidden shadow-inner p-[1px] border border-[#F4D03F]/10">
                                                            <div className={cn("h-full rounded-full", device.battery_level > 60 ? "bg-[#1B9157]" : device.battery_level > 20 ? "bg-[#F4D03F]" : "bg-red-500 animate-pulse")} style={{ width: `${device.battery_level}%` }} />
                                                        </div>
                                                    </div>
                                                    <Battery className={cn("w-8 h-8 transition-all", device.battery_level < 20 ? "text-red-500 animate-pulse" : "text-[#F4D03F] opacity-30")} />
                                                </div>
                                            </td>
                                            <td className="px-10 py-14">
                                                <div className="flex items-center gap-5">
                                                    <Activity className="w-5 h-5 text-[#F4D03F]/20" />
                                                    <span className="text-[14px] font-black text-foreground/30 uppercase italic">{timeAgo(device.last_ping)}</span>
                                                </div>
                                            </td>
                                            <td className="px-14 py-14 text-right">
                                                <div className="flex items-center justify-end gap-6 opacity-0 group-hover:opacity-100 transition-all translate-x-12 group-hover:translate-x-0">
                                                    <button className={cn(glass.btnSecondary, "h-18 w-18 p-0 border-[#F4D03F]/10 hover:text-[#F4D03F]")}>
                                                        <FileSearch className="w-8 h-8" />
                                                    </button>
                                                    <button className={cn(glass.btnSecondary, "h-18 w-18 p-0 border-[#F4D03F]/10 hover:text-[#F4D03F]")}>
                                                        <Settings className="w-8 h-8" />
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

                {/* Footer */}
                <div className="p-14 border-t border-[#F4D03F]/10 bg-gray-400 backdrop-blur-3xl flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">
                    <div className="flex items-center gap-10">
                        <Database className="w-10 h-10 text-[#F4D03F] opacity-40" />
                        <div className="flex flex-col">
                            <p className="text-[14px] font-black text-foreground uppercase italic leading-none">System Registry</p>
                            <span className="text-[10px] font-black text-muted-foreground/30 uppercase italic mt-1">Version 5.2.0 · Secured</span>
                        </div>
                    </div>
                    <button className={cn(glass.btnSecondary, "h-22 px-14 flex items-center gap-8 rounded-[3rem]")}>
                        <Download className="w-8 h-8" />
                        Export Device Log
                    </button>
                </div>
            </motion.div>

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
