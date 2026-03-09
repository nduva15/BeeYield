import React from 'react';
import { beeyieldService, IoTDevice, SensorReading, Apiary, Hive } from '@/services/beeyieldService';
import {
    Plus, Battery, Signal, Search, Smartphone, RefreshCw, Wifi,
    FileSearch, Settings, ArrowRight, Cpu, Network, ShieldCheck, Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AddDeviceModal from './AddDeviceModal';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import StatCard from './StatCard';
import { Button } from '@/components/ui/button';

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
            // Even if offline, we show it in local for better DX
            setLocalDevices([newDeviceData, ...localDevices]);
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
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4">
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100 dark:border-amber-900/40">
                        <Cpu className="w-3.5 h-3.5" />
                        Hardware Inventory Management
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none italic uppercase">Node <span className="text-amber-500">Registry</span></h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-white/30 max-w-md px-1 lowercase italic">
                        provisioning, tracking and signal monitoring for all active IoT clusters.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="h-16 px-10 rounded-2xl bg-neutral-900 dark:bg-amber-600 text-white font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98] gap-4"
                    >
                        <Plus className="w-5 h-5" />
                        Initialize Node
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <StatCard title="Total Units" value={localDevices.length} icon={Smartphone} />
                <StatCard title="Sync 24h" value={measured24h} icon={RefreshCw} />
                <StatCard
                    title="Offline Nodes"
                    value={offlineCount}
                    icon={Wifi}
                    trendType={offlineCount > 0 ? "negative" : "positive"}
                    trend={offlineCount > 0 ? 'CRITICAL' : 'MAX'}
                />
                <StatCard
                    title="Low Battery"
                    value={localDevices.filter(d => d.battery_level < 20).length}
                    icon={Battery}
                    trendType="neutral"
                    trend="Checkups"
                />
            </div>

            {/* Content Card */}
            <div className="bg-white dark:bg-white/5 rounded-[3rem] border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-black/5 overflow-hidden">
                {/* Control Bar */}
                <div className="p-10 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="SEARCH REGISTRY..."
                                className="w-full h-14 pl-12 pr-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 font-black text-[10px] uppercase tracking-widest focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 transition-all outline-none"
                            />
                        </div>
                        <div className="w-full md:w-80">
                            <Select value={selectedApiaryId} onValueChange={setSelectedApiaryId}>
                                <SelectTrigger className="h-14 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 font-black text-[10px] uppercase tracking-widest focus:ring-amber-500/10 focus:border-amber-500/50">
                                    <SelectValue placeholder="All Sectors" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-200 dark:border-white/10 shadow-2xl">
                                    <SelectItem value="all" className="p-4 font-black uppercase text-[10px] tracking-widest">All Industrial Sectors</SelectItem>
                                    {apiaries.map(apiary => (
                                        <SelectItem key={apiary.id} value={apiary.id} className="p-4 font-black uppercase text-[10px] tracking-widest">{apiary.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Device Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-white/[0.01] h-16 font-black uppercase text-[9px] tracking-[0.3em] text-slate-400 italic">
                                <th className="px-10 border-b border-slate-100 dark:border-white/5">Signal Status</th>
                                <th className="px-8 border-b border-slate-100 dark:border-white/5">Hardware ID</th>
                                <th className="px-8 border-b border-slate-100 dark:border-white/5">Deployment Sector</th>
                                <th className="px-8 border-b border-slate-100 dark:border-white/5">Target Hive</th>
                                <th className="px-8 border-b border-slate-100 dark:border-white/5">Battery Charge</th>
                                <th className="px-8 border-b border-slate-100 dark:border-white/5">Last Pulse</th>
                                <th className="px-10 border-b border-slate-100 dark:border-white/5 text-right font-black">Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {filteredDevices.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-200 mb-2">
                                                <Network className="w-8 h-8" />
                                            </div>
                                            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-300 italic">Registry Void</span>
                                            <Button
                                                variant="ghost"
                                                onClick={() => setIsAddModalOpen(true)}
                                                className="text-[10px] font-black uppercase text-amber-500 hover:text-amber-600 tracking-widest"
                                            >
                                                Initialize First Node →
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredDevices.map(device => (
                                    <tr key={device.id} className="hover:bg-amber-500/[0.02] dark:hover:bg-amber-500/[0.03] transition-colors group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-2.5 h-2.5 rounded-full",
                                                    device.status === 'active' ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                                                )} />
                                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white">{device.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-900 dark:text-white tracking-widest group-hover:text-amber-500 transition-colors">{device.device_code}</span>
                                                <span className="text-[9px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest">IOT_v2.41</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8 text-[11px] font-black uppercase text-slate-500 dark:text-white/40 tracking-widest italic leading-none">
                                            {getApiaryName(device.linked_apiary_id || device.apiary_id, device.location_name)}
                                        </td>
                                        <td className="px-8 py-8">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-white/60">
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                {getHiveName(device.hive_id)}
                                            </div>
                                        </td>
                                        <td className="px-8 py-8">
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm font-black tabular-nums text-slate-900 dark:text-white min-w-[3ch]">{device.battery_level}%</span>
                                                <div className="w-20 h-2 bg-slate-100 dark:bg-black/20 rounded-full overflow-hidden p-0.5">
                                                    <div
                                                        className={cn(
                                                            "h-full rounded-full transition-all duration-700",
                                                            device.battery_level > 60 ? 'bg-emerald-500' : device.battery_level > 20 ? 'bg-amber-500' : 'bg-red-500'
                                                        )}
                                                        style={{ width: `${device.battery_level}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8 text-[11px] font-black uppercase text-slate-400 dark:text-white/20 tracking-widest tabular-nums italic">
                                            {timeAgo(device.last_ping)}
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" className="w-10 h-10 p-0 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5">
                                                    <FileSearch className="w-4 h-4 text-slate-400" />
                                                </Button>
                                                <Button variant="ghost" className="w-10 h-10 p-0 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5">
                                                    <Settings className="w-4 h-4 text-slate-400" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Pagination */}
                <div className="p-10 border-t border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.01] flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.3em] italic">INDUSTRIAL HARDWARE REGISTRY SYSTEM v4.2 · ENCRYPTED_SYNC_ACTIVE</p>
                    <Button variant="outline" className="h-12 px-8 rounded-xl border-slate-200 dark:border-white/10 font-black uppercase text-[10px] tracking-widest gap-3 transition-all hover:scale-[1.02]">
                        <Download className="w-4 h-4" />
                        Download Registry Bundle (.CSV)
                    </Button>
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
