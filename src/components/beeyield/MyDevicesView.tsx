import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { beeyieldService, IoTDevice, IoTDeviceCreateInput, SensorReading, Apiary, Hive } from '@/services/beeyieldService';
import {
    Plus, Battery, Search, Smartphone, RefreshCw, Wifi,
    FileSearch, Cpu, ShieldCheck, Activity, Layers,
    SearchCode, Trash2, Edit, Loader2, MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AddDeviceModal from './AddDeviceModal';
import { toast } from 'sonner';
import { glass, GlassStatCard } from './GlassTheme';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
import { deviceKeys } from '@/hooks/useDevices';

interface MyDevicesViewProps {
    devices: IoTDevice[];
    readings: SensorReading[];
    apiaries: Apiary[];
    hives: Hive[];
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

const MyDevicesView: React.FC<MyDevicesViewProps> = ({ devices: initialDevices, readings, apiaries, hives, onTabChange }) => {
    const queryClient = useQueryClient();
    const [localDevices, setLocalDevices] = React.useState<IoTDevice[]>(initialDevices);
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
    const [editingDevice, setEditingDevice] = React.useState<IoTDevice | null>(null);
    const [mutatingDeviceId, setMutatingDeviceId] = React.useState<string | null>(null);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedApiaryId, setSelectedApiaryId] = React.useState<string>('all');

    React.useEffect(() => {
        setLocalDevices(initialDevices);
    }, [initialDevices]);

    const commitDevices = React.useCallback((nextDevices: IoTDevice[]) => {
        setLocalDevices(nextDevices);
        localStorage.setItem('beeyield_devices_cache_v1', JSON.stringify(nextDevices));
        queryClient.setQueryData(deviceKeys.list(), nextDevices);
    }, [queryClient]);

    const handleSubmitDevice = async (deviceData: IoTDeviceCreateInput) => {
        setMutatingDeviceId(editingDevice?.id || 'new');
        try {
            if (editingDevice) {
                const { data, error } = await beeyieldService.updateDevice(editingDevice.id, deviceData);
                if (error || !data) {
                    throw error || new Error('Device update failed');
                }

                const nextDevices = localDevices.map((device) => device.id === data.id ? data : device);
                commitDevices(nextDevices);
                await beeyieldService.logDeviceAuditEvent({
                    device_id: data.id,
                    action: 'updated',
                    changes: {
                        previous: editingDevice,
                        next: deviceData,
                    },
                });
                setEditingDevice(null);
                return data;
            }

            const { data, error } = await beeyieldService.createDevice(deviceData);
            if (error || !data) {
                throw error || new Error('Device creation failed');
            }

            const nextDevices = [data, ...localDevices.filter((device) => device.id !== data.id)];
            commitDevices(nextDevices);
            await beeyieldService.logDeviceAuditEvent({
                device_id: data.id,
                action: 'created',
                changes: deviceData,
            });
            return data;
        } finally {
            setMutatingDeviceId(null);
        }
    };

    const handleEditDevice = (device: IoTDevice) => {
        setEditingDevice(device);
        setIsAddModalOpen(true);
    };

    const handleDeleteDevice = async (device: IoTDevice) => {
        if (!window.confirm(`Delete ${device.device_code}? This cannot be undone.`)) {
            return;
        }

        setMutatingDeviceId(device.id);
        try {
            const result = await beeyieldService.deleteDevice(device.id);
            if (!result.success) {
                throw result.error || new Error('Device deletion failed');
            }

            const nextDevices = localDevices.filter((entry) => entry.id !== device.id);
            commitDevices(nextDevices);
            await beeyieldService.logDeviceAuditEvent({
                device_id: device.id,
                action: 'deleted',
                changes: {
                    deleted: device,
                },
            });
        } catch (error: any) {
            console.error(error);
            toast.error(error?.message || 'Failed to delete device');
        } finally {
            setMutatingDeviceId(null);
        }
    };

    const filteredDevices = localDevices.filter((device) => {
        const matchesApiary = selectedApiaryId === 'all' || device.linked_apiary_id === selectedApiaryId || device.apiary_id === selectedApiaryId;
        const matchesSearch =
            device.device_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (device.device_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (device.location_name || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesApiary && matchesSearch;
    });

    const getHiveName = (hiveId?: string) => hiveId ? hives.find((hive) => hive.id === hiveId)?.hive_code || '-' : '-';

    const getApiaryName = (apiaryId?: string, locationName?: string) => {
        if (apiaryId) {
            const apiary = apiaries.find((entry) => entry.id === apiaryId);
            if (apiary) return apiary.name;
        }
        return locationName || '-';
    };

    const timeAgo = (dateString?: string) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        if (seconds < 60) return 'Online now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const measured24h = localDevices.filter((device) =>
        readings.some((reading) => reading.device_id === device.id && (now.getTime() - new Date(reading.timestamp).getTime() < oneDay))
    ).length;
    const offlineCount = localDevices.filter((device) =>
        !readings.some((reading) => reading.device_id === device.id && (now.getTime() - new Date(reading.timestamp).getTime() < oneDay * 3))
    ).length;

    return (
        <BeeYieldPageShell className={glass.page}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
            >
                <BeeYieldPageHeader
                    icon={Cpu}
                    label="Devices"
                    onBack={() => onTabChange('home')}
                    title={<>Your <span className="text-[#F4D03F]">devices</span></>}
                    subtitle="Manage devices and view recent readings."
                    actions={
                        <button
                            onClick={() => {
                                setEditingDevice(null);
                                setIsAddModalOpen(true);
                            }}
                            className={cn(glass.btnPrimary, "h-11 px-8 text-sm font-semibold flex items-center justify-center gap-2")}
                        >
                            <Plus className="w-4 h-4" />
                            Add device
                        </button>
                    }
                />

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <GlassStatCard label="Total Inventory" value={localDevices.length} icon={Smartphone} index={0} />
                    <GlassStatCard label="Active today" value={measured24h} icon={RefreshCw} index={1} color="text-[#1B9157]" />
                    <GlassStatCard label="Offline" value={offlineCount} icon={Wifi} index={2} color="text-red-500" />
                    <GlassStatCard label="Low battery" value={localDevices.filter((device) => device.battery_level < 20).length} icon={Battery} index={3} color="text-[#F4D03F]" />
                </div>

                <div className={glass.section}>
                    <div className={glass.sectionHeader}>
                        <div className="flex-1 w-full space-y-2">
                            <Label htmlFor="my-devices-search" className="text-xs font-semibold text-[#1A1A1A]/60 ml-2">Device ID</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#F4D03F]/40" />
                                <Input
                                    id="my-devices-search"
                                    autoComplete="off"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search devices…"
                                    className={glass.input + " pl-10 h-10 w-full"}
                                />
                            </div>
                        </div>
                        <div className="w-[200px] flex flex-col gap-1">
                            <Label className={glass.microLabel + " ml-1"}>Location</Label>
                            <Select value={selectedApiaryId} onValueChange={setSelectedApiaryId}>
                                <SelectTrigger id="my-devices-filter-location" aria-label="Location" className={glass.select}>
                                    <div className="flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-[#F4D03F]" />
                                        <SelectValue placeholder="All devices" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className={glass.selectContent}>
                                    <SelectItem value="all" className="text-sm">All devices</SelectItem>
                                    {apiaries.map((apiary) => (
                                        <SelectItem key={apiary.id} value={apiary.id} className="text-sm">{apiary.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="overflow-x-auto thin-scrollbar relative z-10">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead>
                                <tr>
                                    <th className={glass.tableHead}>Status</th>
                                    <th className={glass.tableHead}>Device ID</th>
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
                                                    <h3 className="text-[10px] font-black">No devices found</h3>
                                                    <button
                                                        onClick={() => {
                                                            setEditingDevice(null);
                                                            setIsAddModalOpen(true);
                                                        }}
                                                        className={cn(glass.btnSecondary, "h-9 px-6 text-[8px] font-black mt-4")}
                                                    >
                                                        Add your first device
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
                                                className="group hover:bg-[#F4D03F][0.05] transition-all duration-300 cursor-default"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn("w-2 h-2 rounded-full", device.status === 'active' ? 'bg-[#1B9157] shadow-sm shadow-[#1B9157]/40' : 'bg-red-500 shadow-sm shadow-red-500/40')} />
                                                        <span className={cn("text-[9px] font-black", device.status === 'active' ? 'text-[#1B9157]' : 'text-red-500')}>
                                                            {device.status === 'active' ? 'Nominal' : 'Offline'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-white border border-[#F4D03F]/10 flex items-center justify-center shadow-sm group-hover:bg-[#F4D03F] group-hover:text-white transition-all">
                                                            <Cpu className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[11px] font-black tracking-tight text-[#1A1A1A]">{device.device_code}</span>
                                                            <span className="text-[8px] font-black text-[#F4D03F] italic">{device.firmware_version || 'Firmware pending'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-3 h-3 text-[#F4D03F] opacity-40" />
                                                        <span className="text-[9px] font-bold text-[#1A1A1A]/60 tracking-wider">
                                                            {getApiaryName(device.linked_apiary_id || device.apiary_id, device.location_name)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#1B9157]/5 border border-[#1B9157]/10 text-[#1B9157]">
                                                        <ShieldCheck className="w-3 h-3" />
                                                        <span className="text-[9px] font-black">{getHiveName(device.hive_id)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex flex-col gap-1 w-20">
                                                            <div className="flex justify-between items-center px-0.5">
                                                                <span className="text-[9px] font-black tabular-nums">{device.battery_level}%</span>
                                                            </div>
                                                            <div className="h-1 w-full bg-[#1A1A1A]/5 rounded-full overflow-hidden">
                                                                <div
                                                                    className={cn(
                                                                        "h-full rounded-full transition-all",
                                                                        device.battery_level > 60 ? "bg-[#1B9157]" : device.battery_level > 20 ? "bg-[#F4D03F]" : "bg-red-500 animate-pulse"
                                                                    )}
                                                                    style={{ width: `${device.battery_level}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <Battery className={cn("w-3.5 h-3.5", device.battery_level < 20 ? "text-red-500 animate-pulse" : "text-[#F4D03F] opacity-40")} />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Activity className="w-3 h-3 text-[#F4D03F] opacity-40" />
                                                        <span className="text-[9px] font-bold text-[#1A1A1A]/40">{timeAgo(device.last_ping)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                        <button
                                                            className="w-8 h-8 rounded-lg bg-white border border-[#F4D03F]/10 flex items-center justify-center hover:bg-[#F4D03F] hover:text-white transition-all shadow-sm disabled:opacity-60"
                                                            onClick={() => handleEditDevice(device)}
                                                            aria-label="Edit device"
                                                            title="Edit device"
                                                            disabled={mutatingDeviceId === device.id}
                                                        >
                                                            {mutatingDeviceId === device.id && editingDevice?.id === device.id ? (
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            ) : (
                                                                <Edit className="w-3.5 h-3.5" />
                                                            )}
                                                        </button>
                                                        <button
                                                            className="w-8 h-8 rounded-lg bg-white border border-[#F4D03F]/10 flex items-center justify-center hover:bg-[#F4D03F] hover:text-white transition-all shadow-sm"
                                                            onClick={() => onTabChange('device', undefined, device.id)}
                                                            aria-label="View device details"
                                                            title="View device details"
                                                        >
                                                            <FileSearch className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            className="w-8 h-8 rounded-lg bg-white border border-[#F4D03F]/10 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm disabled:opacity-60"
                                                            onClick={() => handleDeleteDevice(device)}
                                                            aria-label="Delete device"
                                                            title="Delete device"
                                                            disabled={mutatingDeviceId === device.id}
                                                        >
                                                            {mutatingDeviceId === device.id && editingDevice?.id !== device.id ? (
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            )}
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
                    onOpenChange={(open) => {
                        setIsAddModalOpen(open);
                        if (!open) setEditingDevice(null);
                    }}
                    onSubmit={handleSubmitDevice}
                    apiaries={apiaries}
                    hives={hives}
                    device={editingDevice}
                />

                <style>{`
                    .thin-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                    .thin-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .thin-scrollbar::-webkit-scrollbar-thumb { background: rgba(251, 191, 36, 0.1); border-radius: 20px; }
                `}</style>
            </motion.div>
        </BeeYieldPageShell>
    );
};

export default MyDevicesView;
