import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from "@/components/ui/badge";
import { Textarea } from '@/components/ui/textarea';
import {
    Plus,
    Hexagon,
    Box,
    MapPin,
    Loader2,
    FileSpreadsheet,
    Activity,
    Zap,
    X,
    ShieldCheck,
    Radio,
    Search,
    Cpu,
    TrendingUp,
    HeartPulse
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { beeyieldService, Hive, IoTDevice } from '@/services/beeyieldService';
import { motion, AnimatePresence } from 'framer-motion';
import { useHives, useDeleteHive, useUpdateHive, useApiaries } from '@/hooks/useHives';
import HiveFormModal from './HiveFormModal';
import FlipCardHive from './FlipCardHive';

interface BeeYieldHivesViewProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

const BeeYieldHivesView: React.FC<BeeYieldHivesViewProps> = ({ onTabChange }) => {
    // UI State
    const [selectedPlace, setSelectedPlace] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const [viewMode, setViewMode] = useState<'hives' | 'devices'>('hives');

    // Modal states
    const [isHiveModalOpen, setIsHiveModalOpen] = useState(false);
    const [editingHive, setEditingHive] = useState<Hive | null>(null);

    // Notes and Quick Details states
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
    const [isQuickDetailsOpen, setIsQuickDetailsOpen] = useState(false);
    const [activeHive, setActiveHive] = useState<Hive | null>(null);
    const [hiveNotes, setHiveNotes] = useState("");
    const [isSavingNotes, setIsSavingNotes] = useState(false);

    // Request Inspection Task State
    const [isRequestingInspection, setIsRequestingInspection] = useState(false);
    const [isSavingTask, setIsSavingTask] = useState(false);
    const [inspectionTaskForm, setInspectionTaskForm] = useState({
        title: 'Routine Inspection',
        description: 'Standard hive health check',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'medium' as 'low' | 'medium' | 'high',
        hive_id: '',
        apiary_id: ''
    });

    // Data Hooks
    const { data: hives = [], isLoading: hivesLoading } = useHives();
    const { data: apiaries = [], isLoading: apiariesLoading } = useApiaries();
    const deleteHive = useDeleteHive();
    const updateHiveMutation = useUpdateHive();
    const [devices, setDevices] = useState<IoTDevice[]>([]);

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const devicesData = await beeyieldService.getDevices();
                setDevices(devicesData);
            } catch (error) {
                console.error("Failed to fetch devices", error);
            }
        };
        fetchDevices();
    }, []);

    const isLoading = hivesLoading || apiariesLoading;

    // Filtering
    const filteredHives = React.useMemo(() => {
        return hives.filter(h => {
            const matchesPlace = selectedPlace === 'all' || h.apiary_id === selectedPlace;
            const matchesSearch = searchQuery === '' ||
                h.hive_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                h.status?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesPlace && matchesSearch;
        });
    }, [hives, selectedPlace, searchQuery]);

    const activeDevices = devices.filter(d => d.status === 'active');

    // Stats
    const stats = React.useMemo(() => {
        return {
            total: hives.length,
            active: hives.filter(h => h.status === 'ACTIVE').length,
            critical: hives.filter(h => h.status !== 'ACTIVE').length,
            avgWeight: hives.length > 0
                ? (hives.reduce((sum, h) => sum + (h.latest_weight || 0), 0) / hives.length).toFixed(1)
                : '0.0'
        };
    }, [hives]);

    // Handlers
    const handleOpenAddHive = () => {
        setEditingHive(null);
        if (apiaries.length === 0) {
            toast.error('Please add an apiary first before adding hives');
            onTabChange('places');
            return;
        }
        setIsHiveModalOpen(true);
    };

    const handleEditHive = (hive: Hive) => {
        setEditingHive(hive);
        setIsHiveModalOpen(true);
    };

    const handleRequestInspection = (hive: Hive, e: React.MouseEvent) => {
        e.stopPropagation();
        setInspectionTaskForm({
            title: `Inspect Hive ${hive.hive_code}`,
            description: 'Routine colony health and productivity check.',
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            priority: 'medium',
            hive_id: hive.id,
            apiary_id: hive.apiary_id || ''
        });
        setIsRequestingInspection(true);
    };

    const handleOpenQuickDetails = (hive: Hive) => {
        setActiveHive(hive);
        setIsQuickDetailsOpen(true);
    };

    const handleOpenNotes = (hive: Hive, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setActiveHive(hive);
        setHiveNotes(hive.notes || "");
        setIsNotesModalOpen(true);
    };

    const handleSaveNotes = async () => {
        if (!activeHive) return;
        setIsSavingNotes(true);
        try {
            await updateHiveMutation.mutateAsync({
                id: activeHive.id,
                data: { notes: hiveNotes }
            });
            setIsNotesModalOpen(false);
            toast.success("Notes saved to archive");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save notes");
        } finally {
            setIsSavingNotes(false);
        }
    };

    const submitInspectionRequest = async () => {
        setIsSavingTask(true);
        try {
            let dueDate = inspectionTaskForm.due_date;
            const { error } = await beeyieldService.createTask({
                title: inspectionTaskForm.title,
                description: inspectionTaskForm.description,
                status: 'pending',
                priority: inspectionTaskForm.priority === 'high' ? 'High' : inspectionTaskForm.priority === 'low' ? 'Low' : 'Medium',
                type: 'Inspection',
                category: 'Inspection',
                due_date: new Date(dueDate).toISOString(),
                hive_id: inspectionTaskForm.hive_id,
                apiary_id: inspectionTaskForm.apiary_id,
                is_completed: false
            });

            if (!error) {
                toast.success('Inspection requested successfully');
                setIsRequestingInspection(false);
            }
        } catch (e) {
            console.error(e);
            toast.error('Failed to request inspection');
        } finally {
            setIsSavingTask(false);
        }
    };

    const handleExportExcel = async () => {
        setIsExporting(true);
        try {
            const exportData = filteredHives.map(h => ({
                hive_id: h.hive_code,
                apiary: h.apiary?.name || apiaries.find(a => a.id === h.apiary_id)?.name || 'Unknown',
                type: h.hive_type,
                status: h.status,
                installed: h.installation_date,
                weight: h.latest_weight,
                temp: h.latest_temp
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Hives Data');
            XLSX.writeFile(wb, `BeeYield_Hives_${new Date().toISOString().split('T')[0]}.xlsx`);
            toast.success('Export successful');
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export data');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-black bg-neutral-100 mb-6">
                        <Hexagon className="w-3.5 h-3.5 text-black" />
                        <span className="text-[10px] font-bold text-black uppercase tracking-widest">Hive Management</span>
                    </div>
                    <h1 className="text-6xl font-black text-black tracking-tighter uppercase leading-none">Hives</h1>
                    <p className="text-neutral-500 font-bold mt-3 text-xl uppercase tracking-tight">
                        Real-time status and productivity data.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={handleExportExcel}
                        disabled={isExporting}
                        className="h-12 w-12 rounded-none border-2 border-black text-black hover:bg-black hover:text-white transition-none"
                    >
                        {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileSpreadsheet className="w-5 h-5" />}
                    </Button>
                    <Button
                        onClick={handleOpenAddHive}
                        className="h-12 px-8 rounded-none bg-black hover:bg-[#FF4F00] text-white border-2 border-black gap-3 font-bold text-xs uppercase tracking-widest transition-none"
                    >
                        <Plus className="w-5 h-5" />
                        Add Hive
                    </Button>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Hives', value: stats.total, icon: Box },
                    { label: 'Active', value: stats.active, icon: ShieldCheck },
                    { label: 'Warning', value: stats.critical, icon: HeartPulse },
                    { label: 'Avg Weight', value: `${stats.avgWeight}kg`, icon: Zap }
                ].map((stat, i) => (
                    <Card key={i} className="rounded-none border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 border-2 border-black flex items-center justify-center bg-neutral-50 group-hover:bg-black group-hover:text-white transition-none">
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{stat.label}</p>
                            </div>
                            <h3 className="text-4xl font-black text-black tracking-tighter">{stat.value}</h3>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* View Switching & Filters */}
            <Card className="rounded-none border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6 justify-between items-center">
                        <div className="flex border-2 border-black p-1 gap-1 w-full lg:w-auto">
                            <Button
                                variant="ghost"
                                onClick={() => setViewMode('hives')}
                                className={cn('flex-1 lg:flex-initial h-10 px-6 rounded-none text-[10px] font-bold uppercase tracking-widest transition-none',
                                    viewMode === 'hives' ? 'bg-black text-white' : 'text-neutral-400 hover:text-black'
                                )}
                            >
                                <Box className="w-4 h-4 mr-2" /> Hives
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setViewMode('devices')}
                                className={cn('flex-1 lg:flex-initial h-10 px-6 rounded-none text-[10px] font-bold uppercase tracking-widest transition-none',
                                    viewMode === 'devices' ? 'bg-black text-white' : 'text-neutral-400 hover:text-black'
                                )}
                            >
                                <Cpu className="w-4 h-4 mr-2" /> Devices
                            </Button>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 w-full lg:flex-1 lg:justify-end">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                <Input
                                    placeholder="Search hives..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 h-12 rounded-none border-2 border-black bg-white font-bold text-xs uppercase tracking-tight focus:ring-0 transition-none"
                                />
                            </div>
                            <Select value={selectedPlace} onValueChange={setSelectedPlace}>
                                <SelectTrigger className="h-12 md:w-[200px] rounded-none border-2 border-black font-bold text-[10px] uppercase bg-white">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="All Locations" />
                                </SelectTrigger>
                                <SelectContent className="rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    <SelectItem value="all">All Locations</SelectItem>
                                    {apiaries.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* List Content */}
            {viewMode === 'hives' ? (
                isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="aspect-[4/5] border-2 border-neutral-200 animate-pulse bg-neutral-50" />
                        ))}
                    </div>
                ) : filteredHives.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-neutral-300">
                        <Hexagon className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-black uppercase mb-2">No Hives</h3>
                        <p className="text-neutral-400 font-bold mb-6 uppercase text-[10px]">No results match your criteria.</p>
                        <Button onClick={handleOpenAddHive} className="h-10 px-6 rounded-none bg-black text-white font-bold text-[10px] uppercase">
                            Add Hive
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredHives.map((hive) => (
                            <FlipCardHive
                                key={hive.id}
                                hive={{
                                    id: hive.id,
                                    name: hive.hive_code,
                                    weight: hive.latest_weight || 0,
                                    temp: hive.latest_temp || 0,
                                    humidity: hive.latest_humidity || 0,
                                    status: hive.status === 'ACTIVE' ? 'ok' : hive.status?.toUpperCase() === 'MAINTENANCE' ? 'warning' : 'critical'
                                }}
                                onViewHistory={() => handleOpenQuickDetails(hive)}
                                onMarkInspection={() => handleRequestInspection(hive, {} as any)}
                            />
                        ))}
                    </div>
                )
            ) : (
                /* Devices View */
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <Cpu className="w-6 h-6 text-black" />
                        <h3 className="text-2xl font-black text-black uppercase tracking-tighter">Devices</h3>
                    </div>

                    <Card className="rounded-none border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-[10px] text-left uppercase font-bold tracking-widest">
                                    <thead className="bg-neutral-100 border-b-2 border-black">
                                        <tr>
                                            <th className="px-6 py-4">Serial Number</th>
                                            <th className="px-6 py-4">Hive</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Battery</th>
                                            <th className="px-6 py-4 text-right">Last Seen</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y-2 divide-neutral-100">
                                        {devices.map((device) => {
                                            const linkedHive = hives.find(h => h.id === device.hive_id || h.hive_code === device.device_code);
                                            return (
                                                <tr key={device.id} className="hover:bg-neutral-50 transition-none">
                                                    <td className="px-6 py-4 font-mono">{device.device_code}</td>
                                                    <td className="px-6 py-4">
                                                        {linkedHive ? (
                                                            <span className="p-1 border border-neutral-200 bg-white">#{linkedHive.hive_code}</span>
                                                        ) : (
                                                            <span className="text-neutral-300">Unassigned</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={cn("px-2 py-1 border", device.status === 'active' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-neutral-50 text-neutral-400 border-neutral-200")}>
                                                            {device.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-16 h-3 bg-neutral-100 border border-neutral-200 overflow-hidden">
                                                                <div
                                                                    className={cn("h-full", device.battery_level > 20 ? "bg-emerald-500" : "bg-red-500")}
                                                                    style={{ width: `${device.battery_level}%` }}
                                                                />
                                                            </div>
                                                            <span>{device.battery_level}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-neutral-400">
                                                        {new Date(device.last_ping || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Modals & Overlays */}
            <HiveFormModal
                isOpen={isHiveModalOpen}
                onClose={() => setIsHiveModalOpen(false)}
                editingHive={editingHive}
            />

            {/* Inspection Request Overlay */}
            <AnimatePresence>
                {isRequestingInspection && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/50">
                        <div className="w-full max-w-xl">
                            <Card className="rounded-none border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden bg-white">
                                <CardHeader className="p-8 border-b-2 border-black">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-3xl font-black text-black uppercase tracking-tighter">Schedule Inspection</CardTitle>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setIsRequestingInspection(false)}
                                            className="rounded-none hover:bg-neutral-100 border-2 border-transparent hover:border-black transition-none"
                                        >
                                            <X className="w-6 h-6" />
                                        </Button>
                                    </div>
                                    <p className="text-neutral-500 font-bold uppercase text-xs mt-2">Colony verification task.</p>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Task Title</Label>
                                        <Input
                                            value={inspectionTaskForm.title}
                                            onChange={(e) => setInspectionTaskForm({ ...inspectionTaskForm, title: e.target.value })}
                                            className="h-12 rounded-none border-2 border-black bg-white text-sm font-bold uppercase transition-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Deadline</Label>
                                        <Input
                                            type="date"
                                            value={inspectionTaskForm.due_date}
                                            onChange={(e) => setInspectionTaskForm({ ...inspectionTaskForm, due_date: e.target.value })}
                                            className="h-12 rounded-none border-2 border-black bg-white text-sm font-bold uppercase transition-none"
                                        />
                                    </div>
                                    <div className="pt-6 flex gap-4">
                                        <Button
                                            variant="ghost"
                                            className="flex-1 h-12 rounded-none font-bold text-neutral-400 hover:text-black uppercase text-xs tracking-widest transition-none"
                                            onClick={() => setIsRequestingInspection(false)}
                                        >
                                            Discard
                                        </Button>
                                        <Button
                                            onClick={submitInspectionRequest}
                                            disabled={isSavingTask}
                                            className="flex-1 h-12 rounded-none bg-black text-white hover:bg-[#FF4F00] gap-3 font-bold uppercase text-xs tracking-widest transition-none border-2 border-black"
                                        >
                                            {isSavingTask ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                                            Save Inspection
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Quick Details Overlay */}
            <AnimatePresence>
                {isQuickDetailsOpen && activeHive && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/50">
                        <div className="w-full max-w-4xl">
                            <Card className="rounded-none border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden bg-white">
                                <CardContent className="p-10">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 border-2 border-black bg-[#FF4F00] flex items-center justify-center text-white">
                                                <Hexagon className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-4">
                                                    <h2 className="text-4xl font-black text-black uppercase tracking-tighter leading-none">{activeHive.hive_code}</h2>
                                                    <span className="bg-neutral-100 border border-black px-2 py-1 text-[10px] font-bold uppercase tracking-widest">{activeHive.status}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <MapPin className="w-4 h-4 text-neutral-400" />
                                                    <span className="text-neutral-400 font-bold uppercase text-[10px]">{apiaries.find(a => a.id === activeHive.apiary_id)?.name}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => setIsQuickDetailsOpen(false)} className="rounded-none h-12 w-12 hover:bg-neutral-50 border-2 border-transparent hover:border-black transition-none">
                                            <X className="w-6 h-6 text-neutral-400" />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                        {[
                                            { label: 'Temp', value: activeHive.latest_temp ? `${activeHive.latest_temp}°C` : '--', icon: Activity, color: 'text-orange-500' },
                                            { label: 'Weight', value: activeHive.latest_weight ? `${activeHive.latest_weight}kg` : '--', icon: TrendingUp, color: 'text-emerald-600' },
                                            { label: 'Humidity', value: activeHive.latest_humidity ? `${activeHive.latest_humidity}%` : '--', icon: Radio, color: 'text-blue-500' },
                                            { label: 'Brood', value: 'OPTIMAL', icon: ShieldCheck, color: 'text-neutral-700' }
                                        ].map((item, i) => (
                                            <div key={i} className="bg-neutral-50 border-2 border-black p-6 text-center">
                                                <item.icon className={cn("w-5 h-5 mx-auto mb-3", item.color)} />
                                                <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1">{item.label}</p>
                                                <p className="font-black text-xl text-black uppercase">{item.value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-neutral-50 border-2 border-black p-8 mb-8">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Observation Log</Label>
                                            <div className="h-[1px] flex-1 bg-black/10" />
                                        </div>
                                        <p className="text-lg font-bold text-black leading-tight uppercase tracking-tight">{activeHive.notes || 'No log entries.'}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Button
                                            className="h-14 rounded-none bg-black text-white hover:bg-[#FF4F00] gap-3 font-bold text-xs uppercase tracking-widest transition-none border-2 border-black"
                                            onClick={() => {
                                                setIsQuickDetailsOpen(false);
                                                onTabChange('inspections', `Filtering for ${activeHive.hive_code}`, `filter_hive:${activeHive.id}`);
                                            }}
                                        >
                                            <Activity className="w-5 h-5" />
                                            Detailed View
                                        </Button>
                                        <Button className="h-14 rounded-none border-2 border-black bg-white text-black hover:bg-neutral-50 gap-3 font-bold text-xs uppercase tracking-widest transition-none" variant="outline" onClick={() => { setIsQuickDetailsOpen(false); handleOpenNotes(activeHive); }}>
                                            Add Note
                                        </Button>
                                        <Button className="h-14 rounded-none border-2 border-black bg-white text-black hover:bg-neutral-50 gap-3 font-bold text-xs uppercase tracking-widest transition-none" variant="outline" onClick={() => { setIsQuickDetailsOpen(false); handleEditHive(activeHive); }}>
                                            Edit Hive
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Notes Overlay */}
            <AnimatePresence>
                {isNotesModalOpen && activeHive && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/50">
                        <div className="w-full max-w-2xl">
                            <Card className="rounded-none border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden bg-white">
                                <CardHeader className="p-8 border-b-2 border-black flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-3xl font-black text-black uppercase tracking-tighter">Observation Log</CardTitle>
                                        <p className="text-neutral-500 font-bold uppercase text-xs mt-2">Hive #{activeHive.hive_code}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setIsNotesModalOpen(false)} className="rounded-none h-12 w-12 hover:bg-neutral-50 border-2 border-transparent hover:border-black transition-none">
                                        <X className="w-6 h-6" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <Textarea
                                        value={hiveNotes}
                                        onChange={(e) => setHiveNotes(e.target.value)}
                                        className="min-h-[250px] rounded-none border-2 border-black bg-neutral-50 p-6 font-bold text-lg focus:ring-0 transition-none resize-none uppercase tracking-tight placeholder:text-neutral-300"
                                        placeholder="Record status..."
                                    />
                                    <Button onClick={handleSaveNotes} disabled={isSavingNotes} className="w-full h-14 rounded-none bg-black text-white hover:bg-[#FF4F00] gap-3 font-bold text-xs uppercase tracking-widest transition-none border-2 border-black">
                                        {isSavingNotes ? <Loader2 className="w-6 h-6 animate-spin" /> : <ShieldCheck className="w-6 h-6" />}
                                        Save Notes
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BeeYieldHivesView;
