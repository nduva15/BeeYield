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
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-beeyield-forest/5 border border-beeyield-forest/10 mb-6">
                        <Hexagon className="w-3.5 h-3.5 text-beeyield-forest" />
                        <span className="text-[10px] font-bold text-beeyield-forest uppercase tracking-[0.15em]">Colony Management</span>
                    </div>
                    <h1 className="text-5xl font-bold text-beeyield-charcoal tracking-tight">Beehouse Network</h1>
                    <p className="text-gray-500 font-medium mt-3 text-lg">
                        Real-time health monitoring and productivity insights for your apiaries.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={handleExportExcel}
                        disabled={isExporting}
                        className="h-14 w-14 rounded-2xl border-[#E0E0E0] text-beeyield-charcoal hover:bg-beeyield-forest/5 hover:border-beeyield-forest/20 hover:text-beeyield-forest transition-all"
                    >
                        {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileSpreadsheet className="w-5 h-5" />}
                    </Button>
                    <Button
                        onClick={handleOpenAddHive}
                        className="h-14 px-8 rounded-2xl bg-beeyield-forest hover:opacity-90 text-white shadow-lg shadow-beeyield-forest/20 gap-3 font-bold text-sm tracking-wide"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Hive
                    </Button>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: 'Total Hives', value: stats.total, icon: Box, color: 'text-beeyield-forest', bg: 'bg-beeyield-forest/5' },
                    { label: 'Active Colonies', value: stats.active, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Needs Attention', value: stats.critical, icon: HeartPulse, color: 'text-red-500', bg: 'bg-red-50' },
                    { label: 'Avg Productivity', value: `${stats.avgWeight}kg`, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' }
                ].map((stat, i) => (
                    <motion.div key={i} whileHover={{ y: -4, scale: 1.01 }}>
                        <Card className="rounded-[2rem] border-[#E0E0E0] bg-white shadow-sm overflow-hidden group">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:bg-beeyield-forest group-hover:border-beeyield-forest group-hover:text-white", stat.bg)}>
                                        <stat.icon className={cn("w-6 h-6 stroke-[2] transition-colors duration-500 group-hover:text-white", stat.color)} />
                                    </div>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">{stat.label}</p>
                                </div>
                                <h3 className="text-4xl font-bold text-beeyield-charcoal tracking-tighter">{stat.value}</h3>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* View Switching & Filters */}
            <Card className="rounded-[2.5rem] border-[#E0E0E0] bg-white shadow-sm overflow-hidden">
                <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
                        <div className="flex bg-beeyield-sand/30 border border-[#E8E0D5] rounded-2xl p-1.5 gap-1 w-full md:w-auto">
                            <Button
                                variant="ghost"
                                onClick={() => setViewMode('hives')}
                                className={cn('flex-1 md:flex-initial h-11 px-8 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all',
                                    viewMode === 'hives' ? 'bg-beeyield-forest text-white shadow-md' : 'text-gray-400 hover:text-beeyield-charcoal'
                                )}
                            >
                                <Box className="w-4 h-4 mr-2" /> Hives
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setViewMode('devices')}
                                className={cn('flex-1 md:flex-initial h-11 px-8 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all',
                                    viewMode === 'devices' ? 'bg-beeyield-forest text-white shadow-md' : 'text-gray-400 hover:text-beeyield-charcoal'
                                )}
                            >
                                <Cpu className="w-4 h-4 mr-2" /> Devices
                            </Button>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 w-full md:flex-1 md:justify-end md:max-w-3xl">
                            <div className="relative flex-1">
                                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Find a specific hive..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-12 h-14 rounded-2xl border-[#E0E0E0] bg-white font-medium text-sm focus:ring-beeyield-forest/20 focus:border-beeyield-forest/30 transition-all shadow-sm"
                                />
                            </div>
                            <Select value={selectedPlace} onValueChange={setSelectedPlace}>
                                <SelectTrigger className="h-14 md:w-[240px] rounded-2xl border-[#E0E0E0] font-bold text-sm bg-white shadow-sm">
                                    <MapPin className="w-4 h-4 mr-2 text-beeyield-forest" />
                                    <SelectValue placeholder="Global Network" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-[#E0E0E0] shadow-xl">
                                    <SelectItem value="all">Global Network</SelectItem>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="aspect-[4/5] rounded-[2rem] bg-beeyield-sand/20 animate-pulse border border-beeyield-sand/30" />
                        ))}
                    </div>
                ) : filteredHives.length === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center">
                        <div className="w-24 h-24 rounded-[2.5rem] bg-beeyield-forest/5 border border-beeyield-forest/10 flex items-center justify-center mb-8">
                            <Hexagon className="w-10 h-10 text-beeyield-forest/30" />
                        </div>
                        <h3 className="text-2xl font-bold text-beeyield-charcoal mb-3">No Hives Found</h3>
                        <p className="text-gray-400 font-medium max-w-sm mb-8">We couldn't find any hives matching your search criteria. Try adjusting your filters or add a new hive.</p>
                        <Button onClick={handleOpenAddHive} className="h-12 px-6 rounded-xl bg-beeyield-forest text-white font-bold gap-2">
                            <Plus className="w-4 h-4" /> Add a Hive
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        <AnimatePresence>
                            {filteredHives.map((hive) => (
                                <motion.div
                                    key={hive.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    layout
                                >
                                    <FlipCardHive
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
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )
            ) : (
                /* Devices View */
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-beeyield-forest/5 border border-beeyield-forest/10 flex items-center justify-center">
                            <Cpu className="w-5 h-5 text-beeyield-forest" />
                        </div>
                        <h3 className="text-2xl font-bold text-beeyield-charcoal">IoT Fleet Management</h3>
                    </div>

                    <Card className="rounded-[2.5rem] border-[#E0E0E0] bg-white shadow-sm overflow-hidden">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-beeyield-sand/20 border-b border-[#F5F5F5] text-gray-400 font-bold text-[11px] uppercase tracking-widest">
                                        <tr>
                                            <th className="px-10 py-6">Hardware Identifier</th>
                                            <th className="px-10 py-6">Linked Colony</th>
                                            <th className="px-10 py-6">Connectivity</th>
                                            <th className="px-10 py-6">Energy Status</th>
                                            <th className="px-10 py-6 text-right">Synchronization</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#F5F5F5]">
                                        {devices.map((device) => {
                                            const linkedHive = hives.find(h => h.id === device.hive_id || h.hive_code === device.device_code);
                                            return (
                                                <tr key={device.id} className="hover:bg-beeyield-sand/5 transition-colors group">
                                                    <td className="px-10 py-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-xl bg-beeyield-forest/5 flex items-center justify-center text-beeyield-forest group-hover:bg-beeyield-forest group-hover:text-white transition-all">
                                                                <Cpu className="w-4 h-4" />
                                                            </div>
                                                            <span className="font-mono font-bold text-beeyield-charcoal">{device.device_code}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        {linkedHive ? (
                                                            <Badge variant="outline" className="rounded-lg border-[#E0E0E0] font-mono text-[11px] font-bold text-beeyield-charcoal px-3 py-1">
                                                                #{linkedHive.hive_code}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-gray-300 font-medium italic">Unassigned</span>
                                                        )}
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                            {device.status}
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                                                                <div
                                                                    className={cn("h-full transition-all duration-1000", device.battery_level > 20 ? "bg-emerald-500" : "bg-red-500")}
                                                                    style={{ width: `${device.battery_level}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs font-bold text-beeyield-charcoal">{device.battery_level}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6 text-right">
                                                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                                            {new Date(device.last_ping || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
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
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-beeyield-charcoal/40 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-xl"
                        >
                            <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white">
                                <div className="h-2 bg-beeyield-forest" />
                                <CardHeader className="p-10 pb-4">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-2xl font-bold text-beeyield-charcoal">Schedule Inspection</CardTitle>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setIsRequestingInspection(false)}
                                            className="rounded-xl hover:bg-gray-100"
                                        >
                                            <X className="w-6 h-6" />
                                        </Button>
                                    </div>
                                    <p className="text-gray-500 font-medium">Create a diagnostic task for colony verification.</p>
                                </CardHeader>
                                <CardContent className="p-10 pt-6 space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Task Title</Label>
                                        <Input
                                            value={inspectionTaskForm.title}
                                            onChange={(e) => setInspectionTaskForm({ ...inspectionTaskForm, title: e.target.value })}
                                            className="h-14 rounded-2xl border-[#E0E0E0] bg-white text-sm font-bold text-beeyield-charcoal"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Deadline</Label>
                                        <Input
                                            type="date"
                                            value={inspectionTaskForm.due_date}
                                            onChange={(e) => setInspectionTaskForm({ ...inspectionTaskForm, due_date: e.target.value })}
                                            className="h-14 rounded-2xl border-[#E0E0E0] bg-white text-sm font-bold text-beeyield-charcoal"
                                        />
                                    </div>
                                    <div className="pt-6 flex gap-4">
                                        <Button
                                            variant="ghost"
                                            className="flex-1 h-14 rounded-2xl font-bold text-gray-400 hover:text-beeyield-charcoal"
                                            onClick={() => setIsRequestingInspection(false)}
                                        >
                                            Discard
                                        </Button>
                                        <Button
                                            onClick={submitInspectionRequest}
                                            disabled={isSavingTask}
                                            className="flex-1 h-14 rounded-2xl bg-beeyield-forest text-white gap-3 font-bold shadow-lg shadow-beeyield-forest/20"
                                        >
                                            {isSavingTask ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                                            Commit Schedule
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Quick Details Overlay */}
            <AnimatePresence>
                {isQuickDetailsOpen && activeHive && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-beeyield-charcoal/40 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-4xl"
                        >
                            <Card className="rounded-[3rem] border-none shadow-3xl overflow-hidden bg-white">
                                <CardContent className="p-12">
                                    <div className="flex justify-between items-start mb-10">
                                        <div className="flex items-center gap-6">
                                            <div className="w-20 h-20 rounded-[2rem] bg-beeyield-forest flex items-center justify-center text-white shadow-xl shadow-beeyield-forest/30">
                                                <Hexagon className="w-10 h-10 fill-white" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-4">
                                                    <h2 className="text-4xl font-bold text-beeyield-charcoal">{activeHive.hive_code}</h2>
                                                    <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 rounded-full py-1.5 px-4 font-bold tracking-widest uppercase text-[10px]">{activeHive.status}</Badge>
                                                </div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <MapPin className="w-4 h-4 text-beeyield-forest" />
                                                    <span className="text-gray-400 font-medium">{apiaries.find(a => a.id === activeHive.apiary_id)?.name}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => setIsQuickDetailsOpen(false)} className="rounded-2xl h-12 w-12 hover:bg-gray-50 border border-transparent hover:border-gray-100">
                                            <X className="w-6 h-6 text-gray-400" />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                                        {[
                                            { label: 'Thermal Signal', value: activeHive.latest_temp ? `${activeHive.latest_temp}°C` : '--', icon: Activity, color: 'text-orange-500' },
                                            { label: 'Net Weight', value: activeHive.latest_weight ? `${activeHive.latest_weight}kg` : '--', icon: TrendingUp, color: 'text-emerald-600' },
                                            { label: 'Air Moisture', value: activeHive.latest_humidity ? `${activeHive.latest_humidity}%` : '--', icon: Radio, color: 'text-blue-500' },
                                            { label: 'Brood Index', value: 'High Opt', icon: ShieldCheck, color: 'text-beeyield-forest' }
                                        ].map((item, i) => (
                                            <div key={i} className="bg-beeyield-sand/20 border border-beeyield-sand/30 rounded-3xl p-8 text-center transition-all hover:bg-beeyield-sand/40">
                                                <item.icon className={cn("w-6 h-6 mx-auto mb-4 stroke-[2.5]", item.color)} />
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{item.label}</p>
                                                <p className="font-bold text-2xl text-beeyield-charcoal">{item.value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-beeyield-sand/10 border border-[#F0F0F0] p-10 rounded-[2rem] mb-10">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Colony Log Archive</Label>
                                            <div className="h-[1px] flex-1 bg-[#F0F0F0]" />
                                        </div>
                                        <p className="text-lg font-medium text-beeyield-charcoal leading-relaxed">{activeHive.notes || 'No log entries recorded for this hive cycle.'}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <Button
                                            className="h-16 rounded-2xl bg-beeyield-forest text-white gap-3 font-bold text-base shadow-lg shadow-beeyield-forest/20"
                                            onClick={() => {
                                                setIsQuickDetailsOpen(false);
                                                onTabChange('inspections', `Filtering for ${activeHive.hive_code}`, `filter_hive:${activeHive.id}`);
                                            }}
                                        >
                                            <Activity className="w-5 h-5" />
                                            Deep Diagnostics
                                        </Button>
                                        <Button className="h-16 rounded-2xl border-[#E0E0E0] bg-white gap-3 font-bold text-beeyield-charcoal hover:bg-beeyield-forest/5" variant="outline" onClick={() => { setIsQuickDetailsOpen(false); handleOpenNotes(activeHive); }}>
                                            Record Observation
                                        </Button>
                                        <Button className="h-16 rounded-2xl border-[#E0E0E0] bg-white gap-3 font-bold text-beeyield-charcoal hover:bg-beeyield-forest/5" variant="outline" onClick={() => { setIsQuickDetailsOpen(false); handleEditHive(activeHive); }}>
                                            Adjust Hierarchy
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Notes Overlay */}
            <AnimatePresence>
                {isNotesModalOpen && activeHive && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-beeyield-charcoal/40 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-2xl"
                        >
                            <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white">
                                <div className="h-2 bg-beeyield-forest" />
                                <CardHeader className="p-10 pb-4 flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-2xl font-bold text-beeyield-charcoal">Observation Log</CardTitle>
                                        <p className="text-gray-500 font-medium">Recording insights for hive #{activeHive.hive_code}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setIsNotesModalOpen(false)} className="rounded-xl h-12 w-12 hover:bg-gray-50">
                                        <X className="w-6 h-6" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-10 pt-6 space-y-8">
                                    <Textarea
                                        value={hiveNotes}
                                        onChange={(e) => setHiveNotes(e.target.value)}
                                        className="min-h-[280px] rounded-3xl border-[#E0E0E0] bg-beeyield-sand/10 p-8 font-medium text-lg focus:ring-beeyield-forest/20 focus:border-beeyield-forest/30 transition-all resize-none"
                                        placeholder="Note down colony health, swarm signals, or queen performance..."
                                    />
                                    <Button onClick={handleSaveNotes} disabled={isSavingNotes} className="w-full h-16 rounded-2xl bg-beeyield-forest text-white gap-3 font-bold text-lg shadow-lg shadow-beeyield-forest/20">
                                        {isSavingNotes ? <Loader2 className="w-6 h-6 animate-spin" /> : <ShieldCheck className="w-6 h-6" />}
                                        Archive Notes
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BeeYieldHivesView;
