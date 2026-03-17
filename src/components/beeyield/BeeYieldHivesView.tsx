import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    Plus, Hexagon, Box, MapPin, Loader2, FileSpreadsheet, Activity, Zap, X, ShieldCheck, Radio, Search, Cpu, TrendingUp, HeartPulse, Binary, Download, Send, Calendar, AlertCircle, RefreshCw, Layers, ChevronRight, Hash, Shield, Battery
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { beeyieldService, Hive, IoTDevice } from '@/services/beeyieldService';
import { motion, AnimatePresence } from 'framer-motion';
import { useHives, useDeleteHive, useUpdateHive, useApiaries } from '@/hooks/useHives';
import HiveFormModal from './HiveFormModal';
import FlipCardHive from './FlipCardHive';
import { glass, PageHeader, GlassStatCard } from './GlassTheme';

interface BeeYieldHivesViewProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

const BeeYieldHivesView: React.FC<BeeYieldHivesViewProps> = ({ onTabChange }) => {
    // UI State
    const [selectedPlace, setSelectedPlace] = React.useState('all');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [isExporting, setIsExporting] = React.useState(false);
    const [viewMode, setViewMode] = React.useState<'hives' | 'devices'>('hives');

    // Modal states
    const [isHiveModalOpen, setIsHiveModalOpen] = React.useState(false);
    const [editingHive, setEditingHive] = React.useState<Hive | null>(null);

    // Notes and Quick Details states
    const [isNotesModalOpen, setIsNotesModalOpen] = React.useState(false);
    const [isQuickDetailsOpen, setIsQuickDetailsOpen] = React.useState(false);
    const [activeHive, setActiveHive] = React.useState<Hive | null>(null);
    const [hiveNotes, setHiveNotes] = React.useState("");
    const [isSavingNotes, setIsSavingNotes] = React.useState(false);

    // Request Inspection Task State
    const [isRequestingInspection, setIsRequestingInspection] = React.useState(false);
    const [isSavingTask, setIsSavingTask] = React.useState(false);
    const [inspectionTaskForm, setInspectionTaskForm] = React.useState({
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
    const updateHiveMutation = useUpdateHive();
    const [devices, setDevices] = React.useState<IoTDevice[]>([]);

    React.useEffect(() => {
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

    // Stats (counts only — avoid synthetic/derived telemetry KPIs when metrics are missing)
    const stats = React.useMemo(() => {
        return {
            total: hives.length,
            active: hives.filter(h => h.status === 'ACTIVE').length,
            critical: hives.filter(h => h.status !== 'ACTIVE').length,
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
        const toastId = toast.loading("Saving your notes...");
        setIsSavingNotes(true);
        try {
            await updateHiveMutation.mutateAsync({
                id: activeHive.id,
                data: { notes: hiveNotes }
            });
            setIsNotesModalOpen(false);
            toast.success("Notes saved successfully", { id: toastId });
        } catch (error) {
            toast.error("Could not save notes. Please try again.", { id: toastId });
        } finally {
            setIsSavingNotes(false);
        }
    };

    const submitInspectionRequest = async () => {
        const toastId = toast.loading("Scheduling inspection...");
        setIsSavingTask(true);
        try {
            const { error } = await beeyieldService.createTask({
                title: inspectionTaskForm.title,
                description: inspectionTaskForm.description,
                status: 'pending',
                priority: inspectionTaskForm.priority === 'high' ? 'High' : inspectionTaskForm.priority === 'low' ? 'Low' : 'Medium',
                type: 'Inspection',
                category: 'Inspection',
                due_date: new Date(inspectionTaskForm.due_date).toISOString(),
                hive_id: inspectionTaskForm.hive_id,
                apiary_id: inspectionTaskForm.apiary_id,
                is_completed: false
            });

            if (!error) {
                toast.success('Inspection scheduled', { id: toastId });
                setIsRequestingInspection(false);
            }
        } catch (e) {
            toast.error('Failed to schedule inspection', { id: toastId });
        } finally {
            setIsSavingTask(false);
        }
    };

    const handleExportExcel = async () => {
        setIsExporting(true);
        const toastId = toast.loading("Preparing your data...");
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
            XLSX.utils.book_append_sheet(wb, ws, 'Hives');
            XLSX.writeFile(wb, `BeeYield_Hives_${new Date().toISOString().split('T')[0]}.xlsx`);
            toast.success('Data exported successfully', { id: toastId });
        } catch (error) {
            toast.error('Export failed. Please try again.', { id: toastId });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={glass.page}
        >
            {/* ── Header ── */}
            <PageHeader
                icon={Hexagon}
                label="Hive Management"
                title={<>Hive <span className="text-[#F4D03F]">Inventory</span></>}
                subtitle="Track your hives and manage records."
                actions={
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExportExcel}
                            disabled={isExporting}
                            className={cn(glass.btnSecondary, "w-9 h-9 p-0")}
                            aria-label="Export hives to Excel"
                            title="Export to Excel"
                        >
                            <span className="sr-only">Export</span>
                            {isExporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                        </button>
                        <button
                            onClick={handleOpenAddHive}
                            className={cn(glass.btnPrimary, "h-9 text-[10px]")}
                        >
                            <Plus className="w-4 h-4" />
                            Add hive
                        </button>
                    </div>
                }
            />

            {/* ── Quick Stats ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <GlassStatCard label="Inventory Total" value={stats.total} icon={Box} index={0} />
                <GlassStatCard label="Online Status" value={stats.active} icon={ShieldCheck} index={1} color="text-[#1B9157]" />
                <GlassStatCard label="Alert Vector" value={stats.critical} icon={AlertCircle} index={2} color="text-red-500" />
                <GlassStatCard label="Telemetry" value="—" icon={TrendingUp} index={3} color="text-[#1A1A1A]" />
            </div>

            {/* ── Filter Bar ── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(glass.card, "p-1.5 bg-white/40 border-[#F4D03F]/10 backdrop-blur-md relative overflow-visible")}
            >
                <div className="relative z-10 flex flex-col xl:flex-row gap-3 justify-between items-center">
                    <div className="flex bg-[#F4D03F]/5 p-1 rounded-lg gap-1 border border-[#F4D03F]/10 w-full xl:w-auto shadow-inner">
                        <button
                            onClick={() => setViewMode('hives')}
                            className={cn('flex-1 xl:flex-initial h-8 px-4 rounded-md text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 justify-center',
                                viewMode === 'hives' ? 'bg-white text-[#F4D03F] shadow-md border border-[#F4D03F]/10' : 'text-gray-400 hover:text-[#1A1A1A]'
                            )}
                        >
                            <Layers className="w-3 h-3" /> Hives
                        </button>
                        <button
                            onClick={() => setViewMode('devices')}
                            className={cn('flex-1 xl:flex-initial h-8 px-4 rounded-md text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 justify-center',
                                viewMode === 'devices' ? 'bg-white text-[#F4D03F] shadow-md border border-[#F4D03F]/10' : 'text-gray-400 hover:text-[#1A1A1A]'
                            )}
                        >
                            <Cpu className="w-3 h-3" /> Hardware
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-2 w-full xl:flex-1 xl:justify-end">
                        <div className="relative flex-1 max-w-sm group/search">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <Input
                                placeholder="FILTER_UNITS..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-8 pl-9 bg-white/50 border-[#F4D03F]/10 rounded-lg text-[10px] font-black uppercase tracking-wider focus:border-[#F4D03F]/30"
                            />
                        </div>
                        <div className="w-full md:w-44">
                            <Select value={selectedPlace} onValueChange={setSelectedPlace}>
                                <SelectTrigger className="h-8 px-3 rounded-lg bg-white/50 border-[#F4D03F]/10 text-[9px] font-black uppercase tracking-widest transition-all hover:border-[#F4D03F]/30 shadow-none">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3 h-3 text-[#F4D03F]" />
                                        <SelectValue placeholder="All" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-white/90 backdrop-blur-md border-[#F4D03F]/20 rounded-xl overflow-hidden shadow-2xl">
                                    <SelectItem value="all" className="font-black uppercase text-[8px] tracking-[0.2em] focus:bg-[#F4D03F]/10">All_Sites</SelectItem>
                                    {apiaries.map(a => <SelectItem key={a.id} value={a.id} className="font-black uppercase text-[8px] tracking-[0.2em] focus:bg-[#F4D03F]/10">{a.name.toUpperCase()}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── Main Content ── */}
            <div className="relative z-10">
                {viewMode === 'hives' ? (
                    isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className={cn(glass.skeleton, 'aspect-[3/4] rounded-xl animate-pulse')} />
                            ))}
                        </div>
                    ) : filteredHives.length === 0 ? (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20">
                            <div className="w-16 h-16 rounded-xl bg-[#F4D03F]/5 border border-[#F4D03F]/20 flex items-center justify-center mb-4">
                                <Hexagon className="w-8 h-8 text-[#F4D03F] opacity-20" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground/40 tracking-tight">No Hives Found</h3>
                            <p className="text-xs text-gray-400 font-medium mt-1 max-w-md text-center">Add your first hive to start monitoring your colonies.</p>
                            <button onClick={handleOpenAddHive} className={cn(glass.btnPrimary, "mt-4 h-9 text-[10px]")}>
                                <Plus className="w-3.5 h-3.5" /> Add Hive
                            </button>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            <AnimatePresence>
                                {filteredHives.map((hive, i) => (
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
                            </AnimatePresence>
                        </div>
                    )
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn(glass.card, "p-0 bg-white/40 border-[#F4D03F]/10 backdrop-blur-md overflow-hidden")}>
                        <div className="px-5 py-4 border-b border-[#F4D03F]/10 bg-[#F4D03F]/[0.02] flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/10 shadow-sm">
                                    <Cpu className="w-4 h-4 text-[#F4D03F]" />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-[10px] font-black tracking-widest uppercase text-[#1A1A1A]">Equipment Fleet</h3>
                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Hardware Telemetry Monitoring</p>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto thin-scrollbar">
                            <table className="w-full text-left border-separate border-spacing-0">
                                <thead>
                                    <tr className="bg-[#1A1A1A]/[0.02]">
                                        <th className={cn(glass.tableHead, "text-[9px] font-black uppercase tracking-[0.2em] py-4")}>ID CODE</th>
                                        <th className={cn(glass.tableHead, "text-[9px] font-black uppercase tracking-[0.2em] py-4")}>DEPLOYMENT</th>
                                        <th className={cn(glass.tableHead, "text-[9px] font-black uppercase tracking-[0.2em] py-4")}>STATUS</th>
                                        <th className={cn(glass.tableHead, "text-[9px] font-black uppercase tracking-[0.2em] py-4")}>BATTERY</th>
                                        <th className={cn(glass.tableHead, "text-right text-[9px] font-black uppercase tracking-[0.2em] py-4")}>LAST TEL</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {devices.map((device, i) => {
                                        const linkedHive = hives.find(h => h.id === device.hive_id || h.hive_code === device.device_code);
                                        return (
                                            <motion.tr
                                                key={device.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className={glass.tableRow}
                                            >
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-white border border-[#F4D03F]/10 flex items-center justify-center shadow-sm">
                                                            <Hash className="w-4 h-4 text-[#F4D03F] opacity-40" />
                                                        </div>
                                                        <span className="text-xs font-black text-[#1A1A1A] tracking-tight uppercase tabular-nums">{device.device_code}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    {linkedHive ? (
                                                        <div className="bg-white/50 text-[#1A1A1A] border border-[#F4D03F]/10 px-3 py-1 rounded-md max-w-fit flex items-center gap-2 shadow-sm">
                                                            <ShieldCheck className="w-3.5 h-3.5 text-[#1B9157]" />
                                                            <span className="font-black uppercase text-[8px] tracking-[0.2em]">HIVE: {linkedHive.hive_code}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="font-black text-[9px] text-gray-400 uppercase tracking-widest opacity-40">Dormant_Mode</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn("w-1.5 h-1.5 rounded-full", device.status === 'active' ? 'bg-[#1B9157] animate-pulse shadow-[0_0_8px_rgba(27,145,87,0.3)]' : 'bg-gray-300')} />
                                                        <span className={cn("text-[9px] font-black uppercase tracking-widest", device.status === 'active' ? "text-[#1B9157]" : "text-gray-400")}>
                                                            {device.status === 'active' ? 'SYNCHRONIZED' : 'OFFLINE_VECTOR'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex flex-col items-end gap-1 min-w-[80px]">
                                                            <span className="text-[10px] font-black text-[#1A1A1A] tabular-nums tracking-widest">{device.battery_level}%</span>
                                                            <div className="w-full h-1 bg-[#1A1A1A]/5 rounded-full overflow-hidden relative border border-transparent">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${device.battery_level}%` }}
                                                                    className={cn("h-full", device.battery_level > 60 ? "bg-[#1B9157]" : device.battery_level > 20 ? "bg-[#F4D03F]" : "bg-red-500")}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    <span className="text-[9px] font-black text-gray-500 tabular-nums uppercase tracking-widest opacity-60">
                                                        {new Date(device.last_ping || Date.now()).toLocaleDateString([], { month: '2-digit', day: '2-digit' })} 
                                                        <span className="ml-1 text-[#F4D03F]/60">[{new Date(device.last_ping || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}]</span>
                                                    </span>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* ── Modals & Overlays ── */}

            <HiveFormModal
                isOpen={isHiveModalOpen}
                onClose={() => setIsHiveModalOpen(false)}
                editingHive={editingHive}
            />

            {/* Inspection Request */}
            <AnimatePresence>
                {isRequestingInspection && (
                    <div className={glass.modalOverlay} onClick={() => setIsRequestingInspection(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className={glass.modalCard}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-[#F4D03F]/10">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h2 className="text-xl font-bold text-foreground tracking-tight">Schedule <span className="text-[#F4D03F]">Inspection</span></h2>
                                        <p className="text-xs text-gray-400 font-medium">Set a reminder to check on this colony.</p>
                                    </div><button onClick={() => setIsRequestingInspection(false)} className="w-9 h-9 rounded-lg bg-[#F9F7F2] border border-[#F4D03F]/10 flex items-center justify-center hover:bg-red-500/10 transition-all" aria-label="Close inspection dialog" title="Close">
                                        <span className="sr-only">Close</span>
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <Label className={glass.microLabel}>Inspection Title</Label>
                                    <Input value={inspectionTaskForm.title} onChange={(e) => setInspectionTaskForm({ ...inspectionTaskForm, title: e.target.value })} className={glass.input} placeholder="Routine Health Check" />
                                </div>
                                <div className="space-y-2">
                                    <Label className={glass.microLabel}>Due Date</Label>
                                    <Input type="date" value={inspectionTaskForm.due_date} onChange={(e) => setInspectionTaskForm({ ...inspectionTaskForm, due_date: e.target.value })} className={glass.input} />
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button className={glass.btnSecondary} onClick={() => setIsRequestingInspection(false)}>Cancel</button>
                                    <button onClick={submitInspectionRequest} disabled={isSavingTask} className={cn(glass.btnPrimary, "flex-1")}>
                                        {isSavingTask ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                        Save Inspection
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Notes Overlay */}
            <AnimatePresence>
                {isNotesModalOpen && activeHive && (
                    <div className={glass.modalOverlay} onClick={() => setIsNotesModalOpen(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className={glass.modalCard}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-[#F4D03F]/10">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h2 className="text-xl font-bold text-foreground tracking-tight">Hive <span className="text-[#F4D03F]">Notes</span></h2>
                                        <p className="text-xs text-gray-400 font-medium">Archive observations for hive #{activeHive.hive_code}.</p>
                                    </div>
                                    <button onClick={() => setIsNotesModalOpen(false)} className="w-9 h-9 rounded-lg bg-[#F9F7F2] border border-[#F4D03F]/10 flex items-center justify-center hover:bg-red-500/10 transition-all" aria-label="Close notes dialog" title="Close">
                                        <span className="sr-only">Close</span>
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <Textarea
                                    value={hiveNotes}
                                    onChange={(e) => setHiveNotes(e.target.value)}
                                    className="min-h-[200px] p-4 rounded-xl text-sm bg-[#F9F7F2] border-[#F4D03F]/10 resize-none focus:ring-[#F4D03F]/20"
                                    placeholder="Write your observations here..."
                                />
                                <button onClick={handleSaveNotes} disabled={isSavingNotes} className={cn(glass.btnPrimary, "w-full")}>
                                    {isSavingNotes ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                    Save Notes
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
                .animate-shimmer { animation: shimmer 3s infinite linear; }
                .thin-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .thin-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .thin-scrollbar::-webkit-scrollbar-thumb { background: rgba(244, 208, 63, 0.1); border-radius: 20px; }
                .thin-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(244, 208, 63, 0.2); }
            `}</style>
        </motion.div>
    );
};

export default BeeYieldHivesView;
