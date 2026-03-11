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
                title={<>Hive <span className="text-[#FF6B00]">Inventory</span></>}
                subtitle="Track your hives, monitor equipment health, and manage colony weight data in real-time."
                actions={
                    <div className="flex items-center gap-6">
                        <button
                            onClick={handleExportExcel}
                            disabled={isExporting}
                            className={cn(glass.btnSecondary, "px-8")}
                            title="Export to Excel"
                        >
                            {isExporting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={handleOpenAddHive}
                            className={glass.btnPrimary}
                        >
                            <Plus className="w-6 h-6" />
                            Initialize Hive
                        </button>
                    </div>
                }
            />

            {/* ── Quick Stats ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <GlassStatCard label="Total Hives" value={stats.total} icon={Box} index={0} />
                <GlassStatCard label="Online Status" value={stats.active} icon={ShieldCheck} index={1} color="text-white" />
                <GlassStatCard label="Critical Alerts" value={stats.critical} icon={HeartPulse} index={2} color="text-[#FF6B00]" />
                <GlassStatCard label="Mean Weight" value={`${stats.avgWeight}kg`} icon={Zap} index={3} color="text-[#FF6B00]" />
            </div>

            {/* ── Filter Bar ── */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className={glass.filterBar}
            >
                <div className="relative z-10 flex flex-col xl:flex-row gap-8 justify-between items-center">
                    <div className="flex bg-white/5 p-2 rounded-2xl gap-2 border border-white/10 w-full xl:w-auto">
                        <button
                            onClick={() => setViewMode('hives')}
                            className={cn('flex-1 xl:flex-initial h-14 px-10 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-4 justify-center',
                                viewMode === 'hives' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10'
                            )}
                        >
                            <Layers className="w-5 h-5" /> Hives
                        </button>
                        <button
                            onClick={() => setViewMode('devices')}
                            className={cn('flex-1 xl:flex-initial h-14 px-10 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-4 justify-center',
                                viewMode === 'devices' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10'
                            )}
                        >
                            <Cpu className="w-5 h-5" /> Hardware
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 w-full xl:flex-1 xl:justify-end">
                        <div className="relative flex-1 max-w-xl group/search">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FF6B00] opacity-40 group-focus-within/search:opacity-100 transition-opacity" />
                            <Input
                                placeholder="Filter units..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={cn(glass.input, 'h-14 pl-14 px-8 rounded-xl font-bold text-lg bg-white/5 border-white/10 shadow-inner')}
                            />
                        </div>
                        <div className="w-full md:w-[280px]">
                            <Select value={selectedPlace} onValueChange={setSelectedPlace}>
                                <SelectTrigger className={cn(glass.select, 'h-14 px-6 rounded-xl font-bold bg-white/5 border-white/10')}>
                                    <div className="flex items-center gap-4">
                                        <MapPin className="w-5 h-5 text-[#FF6B00] opacity-30" />
                                        <SelectValue placeholder="Sectors" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className={glass.selectContent}>
                                    <SelectItem value="all" className="font-bold uppercase text-[12px] tracking-widest">Global</SelectItem>
                                    {apiaries.map(a => <SelectItem key={a.id} value={a.id} className="font-bold uppercase text-[12px] tracking-widest">{a.name.toUpperCase()}</SelectItem>)}
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
                                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn(glass.table, "bg-[#0A0A0A] border-white/20")}>
                        <div className="p-12 border-b border-white/10 bg-white/5 backdrop-blur-3xl flex items-center justify-between">
                            <div className="flex items-center gap-8">
                                <div className="w-14 h-14 rounded-2xl bg-[#FF6B00]/10 flex items-center justify-center border border-[#FF6B00]/20">
                                    <Cpu className="w-8 h-8 text-[#FF6B00]" />
                                </div>
                                <h3 className="text-4xl font-black text-white tracking-tighter uppercase">Equipment <span className="text-[#FF6B00]">Fleet</span></h3>
                            </div>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Hardware Telemetry Monitoring</p>
                        </div>

                        <div className="overflow-x-auto thin-scrollbar">
                            <table className="w-full text-left border-separate border-spacing-0">
                                <thead>
                                    <tr>
                                        <th className={glass.tableHead}>ID CODE</th>
                                        <th className={glass.tableHead}>DEPLOYMENT</th>
                                        <th className={glass.tableHead}>STATUS</th>
                                        <th className={glass.tableHead}>BATTERY</th>
                                        <th className={cn(glass.tableHead, "text-right")}>LAST TEL</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
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
                                                <td className="px-12 py-8">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
                                                            <Hash className="w-6 h-6 text-[#FF6B00] opacity-40" />
                                                        </div>
                                                        <span className="text-xl font-black text-white tracking-tighter uppercase">{device.device_code}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-8">
                                                    {linkedHive ? (
                                                        <div className="bg-white/5 text-white border border-white/10 px-6 py-2 rounded-lg max-w-fit flex items-center gap-4">
                                                            <ShieldCheck className="w-4 h-4 text-[#FF6B00]" />
                                                            <span className="font-bold uppercase text-[11px] tracking-widest">HIVE: {linkedHive.hive_code}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="font-bold text-sm text-white/10 uppercase tracking-widest">Dormant</span>
                                                    )}
                                                </td>
                                                <td className="px-8 py-8">
                                                    <div className="flex items-center gap-6">
                                                        <div className={cn("w-3 h-3 rounded-full", device.status === 'active' ? 'bg-[#FF6B00] shadow-[0_0_10px_rgba(255,107,0,0.4)]' : 'bg-white/10')} />
                                                        <span className={cn("text-lg font-black uppercase", device.status === 'active' ? "text-white" : "text-white/20")}>
                                                            {device.status === 'active' ? 'SYNCING' : 'OFFLINE'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-8">
                                                    <div className="flex items-center gap-8">
                                                        <div className="flex flex-col items-end gap-2 min-w-[120px]">
                                                            <span className="text-2xl font-mono font-black text-white tracking-tighter tabular-nums">{device.battery_level}%</span>
                                                            <div className="w-full h-2 bg-white/5 rounded-none overflow-hidden relative border border-white/10">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${device.battery_level}%` }}
                                                                    className={cn("h-full", device.battery_level > 60 ? "bg-white" : device.battery_level > 20 ? "bg-[#FF6B00]" : "bg-[#FF6B00]/40")}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-12 py-8 text-right">
                                                    <span className="text-lg font-mono font-black text-white/40 tracking-tighter uppercase">{new Date(device.last_ping || Date.now()).toLocaleDateString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
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
                .thin-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 107, 0, 0.1); border-radius: 20px; }
                .thin-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 107, 0, 0.2); }
            `}</style>
        </motion.div>
    );
};

export default BeeYieldHivesView;
