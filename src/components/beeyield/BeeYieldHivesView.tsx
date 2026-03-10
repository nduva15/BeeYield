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
                title={<>Hive <span className="text-honey">Inventory</span></>}
                subtitle="Track your hives, monitor equipment health, and manage colony weight data in real-time."
                actions={
                    <div className="flex items-center gap-6">
                        <button
                            onClick={handleExportExcel}
                            disabled={isExporting}
                            className={cn(glass.btnSecondary, "h-20 w-20 p-0 rounded-[2.5rem] bg-white dark:bg-black/60 shadow-4xl border-white/5 flex items-center justify-center hover:text-honey hover:scale-110 active:scale-95 transition-all duration-700")}
                            title="Export to Excel"
                        >
                            {isExporting ? <RefreshCw className="w-10 h-10 animate-spin" /> : <Download className="w-10 h-10" />}
                        </button>
                        <button
                            onClick={handleOpenAddHive}
                            className={cn(glass.btnPrimary, "h-24 bg-[#FBBE24] text-black shadow-4xl rounded-[3.5rem] px-16 font-black italic text-2xl transition-all uppercase flex items-center justify-center gap-8 group/btn pl-24")}
                        >
                            <Plus className="w-10 h-10 group-hover/btn:rotate-90 transition-transform duration-1000" />
                            Add New Hive
                        </button>
                    </div>
                }
            />

            {/* ── Quick Stats ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                <GlassStatCard label="Total Hives" value={stats.total} icon={Box} index={0} />
                <GlassStatCard label="Online" value={stats.active} icon={ShieldCheck} index={1} color="text-emerald-500" />
                <GlassStatCard label="Alerts" value={stats.critical} icon={HeartPulse} index={2} color="text-destructive" />
                <GlassStatCard label="Average Weight" value={`${stats.avgWeight}kg`} icon={Zap} index={3} color="text-honey" />
            </div>

            {/* ── Filter Bar ── */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className={glass.filterBar}
            >
                <div className="relative z-10 flex flex-col xl:flex-row gap-12 justify-between items-center">
                    <div className="flex bg-black/5 dark:bg-white/5 p-4 rounded-[3.5rem] gap-4 border border-white/10 shadow-inner w-full xl:w-auto">
                        <button
                            onClick={() => setViewMode('hives')}
                            className={cn('flex-1 xl:flex-initial h-20 px-16 rounded-[2.8rem] text-lg font-black uppercase tracking-widest italic transition-all duration-700 flex items-center gap-6 justify-center',
                                viewMode === 'hives' ? 'bg-white dark:bg-black/80 text-honey shadow-4xl border border-honey/20' : 'text-foreground/30 hover:text-honey hover:bg-honey/10'
                            )}
                        >
                            <Layers className="w-7 h-7" /> Hive List
                        </button>
                        <button
                            onClick={() => setViewMode('devices')}
                            className={cn('flex-1 xl:flex-initial h-20 px-16 rounded-[2.8rem] text-lg font-black uppercase tracking-widest italic transition-all duration-700 flex items-center gap-6 justify-center',
                                viewMode === 'devices' ? 'bg-white dark:bg-black/80 text-honey shadow-4xl border border-honey/20' : 'text-foreground/30 hover:text-honey hover:bg-honey/10'
                            )}
                        >
                            <Cpu className="w-7 h-7" /> Equipment
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 w-full xl:flex-1 xl:justify-end">
                        <div className="relative flex-1 max-w-xl group/search">
                            <Search className="absolute left-10 top-1/2 -translate-y-1/2 w-8 h-8 text-honey opacity-20 group-focus-within/search:opacity-100 transition-opacity duration-700" />
                            <Input
                                placeholder="Search hives..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={cn(glass.input, 'h-24 pl-24 px-12 rounded-[3.5rem] italic font-black text-2xl bg-black/5 dark:bg-black/30 border-none shadow-inner normal-case placeholder:opacity-5')}
                            />
                        </div>
                        <div className="w-full md:w-[350px]">
                            <Select value={selectedPlace} onValueChange={setSelectedPlace}>
                                <SelectTrigger className={cn(glass.select, 'h-24 px-10 rounded-[3.5rem] italic font-black text-xl bg-black/5 dark:bg-black/30 border-none shadow-inner')}>
                                    <div className="flex items-center gap-6">
                                        <MapPin className="w-8 h-8 text-honey opacity-30" />
                                        <SelectValue placeholder="All Locations" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className={glass.selectContent}>
                                    <SelectItem value="all" className="p-6 font-black uppercase text-[15px] tracking-widest italic rounded-2xl">All Locations</SelectItem>
                                    {apiaries.map(a => <SelectItem key={a.id} value={a.id} className="p-6 font-black uppercase text-[15px] tracking-widest italic rounded-2xl">{a.name.toUpperCase()}</SelectItem>)}
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className={cn(glass.skeleton, 'aspect-[3/4] rounded-[4rem] animate-pulse')} />
                            ))}
                        </div>
                    ) : filteredHives.length === 0 ? (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={glass.emptyState}>
                            <div className="w-56 h-56 rounded-[4rem] bg-honey/5 border border-honey/20 flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-1000 shadow-4xl">
                                <Hexagon className="w-28 h-28 text-honey opacity-20" />
                            </div>
                            <div className="space-y-6">
                                <h3 className="text-6xl font-black italic text-foreground tracking-tighter uppercase leading-none opacity-40">No Hives Found</h3>
                                <p className={cn(glass.microLabel, "max-w-xl mx-auto")}>Add your first hive to start monitoring your colonies.</p>
                            </div>
                            <button onClick={handleOpenAddHive} className={cn(glass.btnPrimary, "h-24 bg-honey text-black mt-16 px-20 rounded-[3.5rem]")}>
                                <Plus className="w-10 h-10 mr-6" /> Add Hive
                            </button>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
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
                    /* ── Equipment Table ── */
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className={glass.table}>
                        <div className="p-16 border-b border-white/5 bg-white/40 dark:bg-black/40 backdrop-blur-3xl flex items-center justify-between">
                            <div className="flex items-center gap-8">
                                <div className="w-18 h-18 rounded-[1.5rem] bg-honey/20 flex items-center justify-center border border-honey/40 shadow-4xl">
                                    <Cpu className="w-10 h-10 text-honey" />
                                </div>
                                <h3 className="text-6xl font-black italic text-foreground tracking-tighter uppercase leading-none">Equipment <span className="text-honey">Fleet</span></h3>
                            </div>
                            <p className={glass.microLabel}>Monitor your hardware health and batteries</p>
                        </div>

                        <div className="overflow-x-auto thin-scrollbar">
                            <table className="w-full text-left border-separate border-spacing-0">
                                <thead>
                                    <tr>
                                        <th className={glass.tableHead}>Device Code</th>
                                        <th className={glass.tableHead}>Assigned Hive</th>
                                        <th className={glass.tableHead}>Status</th>
                                        <th className={glass.tableHead}>Battery</th>
                                        <th className={cn(glass.tableHead, "text-right")}>Last Seen</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {devices.map((device, i) => {
                                        const linkedHive = hives.find(h => h.id === device.hive_id || h.hive_code === device.device_code);
                                        return (
                                            <motion.tr
                                                key={device.id}
                                                initial={{ opacity: 0, x: -30 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05, duration: 0.8 }}
                                                className={glass.tableRow}
                                            >
                                                <td className="px-16 py-14">
                                                    <div className="flex items-center gap-10">
                                                        <div className="w-20 h-20 rounded-[2.5rem] bg-black/5 dark:bg-white/5 border border-white/5 flex items-center justify-center shadow-4xl group-hover:scale-125 group-hover:rotate-12 transition-all">
                                                            <Hash className="w-10 h-10 text-honey opacity-40 group-hover:opacity-100" />
                                                        </div>
                                                        <span className="text-3xl font-black italic text-foreground tracking-tighter group-hover:text-honey transition-colors">{device.device_code}</span>
                                                    </div>
                                                </td>
                                                <td className="px-12 py-14">
                                                    {linkedHive ? (
                                                        <div className={cn(glass.badge, 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-12 py-4 shadow-3xl skew-x-[-15deg] max-w-fit')}>
                                                            <div className="flex items-center gap-6 skew-x-[15deg]">
                                                                <ShieldCheck className="w-6 h-6" />
                                                                <span className="font-black italic uppercase text-lg">Hive: {linkedHive.hive_code}</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="italic font-black text-xl opacity-20 uppercase tracking-widest">Unassigned</span>
                                                    )}
                                                </td>
                                                <td className="px-12 py-14">
                                                    <div className="flex items-center gap-8">
                                                        <div className={cn("w-5 h-5 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.8)] animate-pulse", device.status === 'active' ? 'bg-emerald-500' : 'bg-red-500')} />
                                                        <span className={cn("text-2xl font-black uppercase italic", device.status === 'active' ? "text-emerald-500" : "text-foreground/30")}>
                                                            {device.status === 'active' ? 'Online' : 'Offline'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-12 py-14">
                                                    <div className="flex items-center gap-10">
                                                        <div className="flex flex-col items-end gap-3 min-w-[160px]">
                                                            <span className="text-4xl font-black italic text-foreground tracking-tighter tabular-nums">{device.battery_level}%</span>
                                                            <div className="w-full h-3 bg-black/10 dark:bg-white/5 rounded-full overflow-hidden shadow-inner p-[1.5px] border border-white/5">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${device.battery_level}%` }}
                                                                    className={cn("h-full rounded-full animate-shimmer", device.battery_level > 60 ? "bg-emerald-500" : device.battery_level > 20 ? "bg-honey" : "bg-red-500")}
                                                                />
                                                            </div>
                                                        </div>
                                                        <Battery className={cn("w-12 h-12", device.battery_level < 20 ? "text-red-500 animate-pulse" : "text-honey opacity-20")} />
                                                    </div>
                                                </td>
                                                <td className="px-16 py-14 text-right">
                                                    <span className="text-2xl font-black italic text-foreground tracking-tighter uppercase">{new Date(device.last_ping || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).toUpperCase()}</span>
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
                            initial={{ opacity: 0, scale: 0.9, y: 100 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 100 }}
                            className={glass.modalCard}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className={glass.modalHeader}>
                                <div className="flex justify-between items-start">
                                    <div className="space-y-6">
                                        <div className="inline-flex items-center gap-6 px-8 py-3 bg-honey/10 rounded-full border border-honey/30 shadow-4xl skew-x-[-15deg]">
                                            <Calendar className="w-6 h-6 text-honey skew-x-[15deg]" />
                                            <span className="text-[12px] font-black uppercase tracking-[0.5em] skew-x-[15deg] italic">Task Management</span>
                                        </div>
                                        <h2 className="text-6xl font-black text-foreground tracking-tighter uppercase italic leading-none">Schedule <span className="text-honey">Inspection</span></h2>
                                        <p className="text-xl font-black text-foreground/30 uppercase italic border-l-4 border-honey/20 pl-10">Set a reminder to check on this colony soon.</p>
                                    </div>
                                    <button onClick={() => setIsRequestingInspection(false)} className="w-20 h-20 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-500/20 transition-all duration-700">
                                        <X className="w-10 h-10" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-20 space-y-16">
                                <div className="space-y-8">
                                    <Label className={glass.microLabel}>Inspection Title</Label>
                                    <Input
                                        value={inspectionTaskForm.title}
                                        onChange={(e) => setInspectionTaskForm({ ...inspectionTaskForm, title: e.target.value })}
                                        className={glass.input}
                                        placeholder="Routine Health Check"
                                    />
                                </div>
                                <div className="space-y-8">
                                    <Label className={glass.microLabel}>Due Date</Label>
                                    <Input
                                        type="date"
                                        value={inspectionTaskForm.due_date}
                                        onChange={(e) => setInspectionTaskForm({ ...inspectionTaskForm, due_date: e.target.value })}
                                        className={glass.input}
                                    />
                                </div>
                                <div className="pt-12 flex gap-12">
                                    <button className={glass.btnSecondary} onClick={() => setIsRequestingInspection(false)}>
                                        Cancel
                                    </button>
                                    <button onClick={submitInspectionRequest} disabled={isSavingTask} className={cn(glass.btnPrimary, "flex-1")}>
                                        {isSavingTask ? <RefreshCw className="w-12 h-12 animate-spin" /> : <ShieldCheck className="w-12 h-12" />}
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
                            initial={{ opacity: 0, scale: 0.9, y: 100 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 100 }}
                            className={glass.modalCard}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className={glass.modalHeader}>
                                <div className="flex justify-between items-start">
                                    <div className="space-y-6">
                                        <h2 className="text-7xl font-black text-foreground tracking-tighter uppercase italic leading-none">Hive <span className="text-honey">Notes</span></h2>
                                        <p className="text-2xl font-black text-foreground/30 uppercase italic border-l-4 border-honey/20 pl-10">Archive observations for hive #{activeHive.hive_code}.</p>
                                    </div>
                                    <button onClick={() => setIsNotesModalOpen(false)} className="w-20 h-20 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-500/20 transition-all duration-700">
                                        <X className="w-10 h-10" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-20 space-y-16">
                                <Textarea
                                    value={hiveNotes}
                                    onChange={(e) => setHiveNotes(e.target.value)}
                                    className="min-h-[400px] p-16 rounded-[4rem] font-black italic text-4xl leading-relaxed bg-black/5 dark:bg-black/40 border-white/10 shadow-inner resize-none focus:ring-honey/20"
                                    placeholder="Write your observations here..."
                                />
                                <button onClick={handleSaveNotes} disabled={isSavingNotes} className={cn(glass.btnPrimary, "w-full h-28 text-3xl")}>
                                    {isSavingNotes ? <RefreshCw className="w-16 h-16 animate-spin" /> : <ShieldCheck className="w-16 h-16" />}
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
                .thin-scrollbar::-webkit-scrollbar-thumb { background: rgba(251, 191, 36, 0.1); border-radius: 20px; }
                .thin-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(251, 191, 36, 0.2); }
            `}</style>
        </motion.div>
    );
};

export default BeeYieldHivesView;
