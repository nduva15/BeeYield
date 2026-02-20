import React from 'react';
import { beeyieldService, IoTDevice, SensorReading, Apiary, Hive } from '@/services/beeyieldService';
import {
    Plus, Battery, Signal, Search, Smartphone, RefreshCw, Wifi,
    FileSearch, Settings, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AddDeviceModal from './AddDeviceModal';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import StatCard from './StatCard';

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
                toast.success(`Node ${data.device_code} Added`);
            }
        } catch (error) {
            console.error('Add error:', error);
            toast.info(`Cached: Node ${newDeviceData.device_code}`);
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
        if (!dateString) return '-';
        const date = new Date(dateString);
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        if (seconds < 60) return 'Online';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        return `${Math.floor(hours / 24)}d`;
    };

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const measured24h = localDevices.filter(d => readings.some(r => r.device_id === d.id && (now.getTime() - new Date(r.timestamp).getTime() < oneDay))).length;
    const offlineCount = localDevices.filter(d => !readings.some(r => r.device_id === d.id && (now.getTime() - new Date(r.timestamp).getTime() < oneDay * 3))).length;

    return (
        <div className="p-8 space-y-12 bg-white min-h-screen antialiased text-[#064e3b]">
            {/* Header - Utility UI */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b-4 border-[#064e3b] pb-8">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">
                        Node Registry
                    </h1>
                    <p className="text-[#10b981] font-black uppercase text-[10px] tracking-[0.4em] mt-4">
                        Hardware Inventory and Signal Log
                    </p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="h-14 px-8 border-2 border-[#064e3b] bg-[#10b981] font-black text-xs uppercase tracking-widest text-white hover:bg-black transition-all shadow-[6px_6px_0px_0px_rgba(6,78,59,1)] active:shadow-none active:translate-x-1 active:translate-y-1 flex items-center gap-3"
                >
                    <Plus className="w-5 h-5" />
                    Connect Node
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Total Units" value={localDevices.length} icon={Smartphone} />
                <StatCard title="Sync 24h" value={measured24h} icon={RefreshCw} />
                <StatCard title="Offline" value={offlineCount} icon={Wifi} trendType="negative" trend={`${offlineCount > 0 ? 'FIX' : 'OK'}`} />
                <StatCard title="Battery Low" value={localDevices.filter(d => d.battery_level < 20).length} icon={Battery} />
            </div>

            {/* Control Bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-4 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#064e3b]/40" />
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="IDENTIFIER..."
                        className="w-full h-14 pl-12 pr-4 border-2 border-[#064e3b] bg-white font-black text-xs uppercase focus:outline-none focus:bg-[#facc15]/5"
                    />
                </div>
                <div className="md:col-span-4">
                    <Select value={selectedApiaryId} onValueChange={setSelectedApiaryId}>
                        <SelectTrigger className="h-14 border-2 border-[#064e3b] rounded-none bg-white font-black text-xs uppercase focus:ring-0">
                            <SelectValue placeholder="All Apiaries" />
                        </SelectTrigger>
                        <SelectContent className="rounded-none border-2 border-[#064e3b] p-0 bg-white">
                            <SelectItem value="all" className="text-[10px] font-black uppercase p-3 border-b border-[#064e3b]/10">All Apiaries</SelectItem>
                            {apiaries.map(apiary => (
                                <SelectItem key={apiary.id} value={apiary.id} className="text-[10px] font-black uppercase p-3 border-b border-[#064e3b]/10">{apiary.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Device Table */}
            <div className="border-4 border-[#064e3b] bg-white overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-[#064e3b] text-white h-14 font-black uppercase text-[10px] tracking-widest">
                            <th className="px-6">Status</th>
                            <th className="px-6">Node ID</th>
                            <th className="px-6">Locus</th>
                            <th className="px-6">Hive</th>
                            <th className="px-6">Battery</th>
                            <th className="px-6">Pulse</th>
                            <th className="px-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-[#064e3b]/10">
                        {filteredDevices.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-20 text-center text-[#064e3b]/20 font-black uppercase text-xs tracking-widest">Empty Registry</td>
                            </tr>
                        ) : (
                            filteredDevices.map(device => (
                                <tr key={device.id} className="hover:bg-[#facc15]/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("w-2.5 h-2.5 border border-[#064e3b]", device.status === 'active' ? 'bg-[#10b981]' : 'bg-red-500')} />
                                            <span className="text-[10px] font-black uppercase">{device.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-[10px] font-bold">{device.device_code}</td>
                                    <td className="px-6 py-4 text-[10px] font-black uppercase">{getApiaryName(device.linked_apiary_id || device.apiary_id, device.location_name)}</td>
                                    <td className="px-6 py-4 text-[10px] font-black uppercase">{getHiveName(device.hive_id)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black">{device.battery_level}%</span>
                                            <div className="w-16 h-2 border border-[#064e3b] p-[1px] bg-white">
                                                <div className={cn("h-full", device.battery_level > 20 ? 'bg-[#064e3b]' : 'bg-red-500')} style={{ width: `${device.battery_level}%` }} />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-[10px] font-black uppercase">{timeAgo(device.last_ping)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 border-2 border-[#064e3b] bg-white hover:bg-[#10b981] hover:text-white transition-all mr-2">
                                            <FileSearch className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 border-2 border-[#064e3b] bg-white hover:bg-[#10b981] hover:text-white transition-all">
                                            <Settings className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
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
