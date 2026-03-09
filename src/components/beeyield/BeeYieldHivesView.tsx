import React from 'react';
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
    const deleteHive = useDeleteHive();
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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200/50 dark:border-amber-900/30">
                        <Hexagon className="w-3.5 h-3.5" />
                        Management Protocol
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Fleet <span className="text-emerald-600">Assets</span></h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-white/30 max-w-md">
                        Real-time telemetry and industrial productivity audit for your entire colony network.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        onClick={handleExportExcel}
                        disabled={isExporting}
                        className="h-14 w-14 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-400 hover:text-amber-600 transition-all shadow-sm"
                    >
                        {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileSpreadsheet className="w-5 h-5" />}
                    </Button>
                    <Button
                        onClick={handleOpenAddHive}
                        className="h-14 px-10 rounded-2xl bg-neutral-900 dark:bg-amber-600 text-white hover:scale-[1.02] active:scale-[0.98] transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-black/10 dark:shadow-amber-900/20 flex items-center gap-3"
                    >
                        <Plus className="w-5 h-5" />
                        Register Asset
                    </Button>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Fleet', value: stats.total, icon: Box, color: 'text-amber-500' },
                    { label: 'Nodes Online', value: stats.active, icon: ShieldCheck, color: 'text-emerald-500' },
                    { label: 'Active Alerts', value: stats.critical, icon: HeartPulse, color: 'text-red-500' },
                    { label: 'Mean Hive Payload', value: `${stats.avgWeight}kg`, icon: Zap, color: 'text-amber-600' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="rounded-[2rem] border-slate-200/60 dark:border-white/5 bg-white dark:bg-white/5 shadow-2xl shadow-black/5 hover:border-amber-500/30 transition-all group overflow-hidden relative">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-900 dark:text-white group-hover:scale-110 transition-transform">
                                        <stat.icon className={cn("w-5 h-5", stat.color)} />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.2em]">{stat.label}</p>
                                </div>
                                <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{stat.value}</h3>
                                {/* Decorative background element */}
                                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-transparent to-black/[0.01] pointer-events-none" />
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* View Switching & Filters */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-[2.5rem] p-4 shadow-xl shadow-black/5"
            >
                <div className="flex flex-col lg:flex-row gap-6 justify-between items-center">
                    <div className="flex bg-slate-50 dark:bg-black/20 p-1.5 rounded-[1.25rem] gap-1 w-full lg:w-auto">
                        <Button
                            variant="ghost"
                            onClick={() => setViewMode('hives')}
                            className={cn('flex-1 lg:flex-initial h-11 px-8 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all',
                                viewMode === 'hives' ? 'bg-white dark:bg-white/10 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-slate-400 dark:text-white/20 hover:text-slate-900 dark:hover:text-white'
                            )}
                        >
                            <Box className="w-4 h-4 mr-2" /> Hive Inventory
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setViewMode('devices')}
                            className={cn('flex-1 lg:flex-initial h-11 px-8 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all',
                                viewMode === 'devices' ? 'bg-white dark:bg-white/10 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-slate-400 dark:text-white/20 hover:text-slate-900 dark:hover:text-white'
                            )}
                        >
                            <Cpu className="w-4 h-4 mr-2" /> Hardware Fleet
                        </Button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 w-full lg:flex-1 lg:justify-end">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-white/10" />
                            <Input
                                placeholder="Search asset registry..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-11 h-12 rounded-2xl border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 font-medium text-sm focus:ring-amber-500/20"
                            />
                        </div>
                        <Select value={selectedPlace} onValueChange={setSelectedPlace}>
                            <SelectTrigger className="h-12 md:w-[220px] rounded-2xl border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 font-black text-[10px] uppercase tracking-widest focus:ring-amber-500/20">
                                <MapPin className="w-4 h-4 mr-2 text-amber-500" />
                                <SelectValue placeholder="All Sectors" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-200 dark:border-white/10 shadow-2xl p-0">
                                <SelectItem value="all" className="p-4 font-black uppercase text-[10px] tracking-widest">All Industrial Sectors</SelectItem>
                                {apiaries.map(a => <SelectItem key={a.id} value={a.id} className="p-4 font-black uppercase text-[10px] tracking-widest">{a.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </motion.div>

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
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Cpu className="w-6 h-6 text-amber-500" />
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Hardware Infrastructure</h3>
                        </div>
                        <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-lg">Operational</span>
                    </div>

                    <div className="bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/5">
                        <div className="overflow-x-auto">
                            <table className="w-full text-[10px] text-left uppercase font-black tracking-widest">
                                <thead className="bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-white/20 border-b border-slate-100 dark:border-white/10 uppercase">
                                    <tr>
                                        <th className="px-8 py-6">Hardware Identifier</th>
                                        <th className="px-8 py-6">Deployed Asset</th>
                                        <th className="px-8 py-6">Telemetry Status</th>
                                        <th className="px-8 py-6">Power Core</th>
                                        <th className="px-8 py-6 text-right">Registry Audit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                    {devices.map((device) => {
                                        const linkedHive = hives.find(h => h.id === device.hive_id || h.hive_code === device.device_code);
                                        return (
                                            <tr key={device.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
                                                <td className="px-8 py-6 font-black font-mono text-amber-600 dark:text-amber-400">{device.device_code}</td>
                                                <td className="px-8 py-6">
                                                    {linkedHive ? (
                                                        <span className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-lg text-[9px] font-black border border-emerald-100 dark:border-emerald-900/40 tracking-[0.15em]">#{linkedHive.hive_code}</span>
                                                    ) : (
                                                        <span className="text-slate-300 dark:text-white/10 italic">Awaiting Deployment</span>
                                                    )}
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn("w-2 h-2 rounded-full", device.status === 'active' ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                                                        <span className={cn("text-[10px] font-black", device.status === 'active' ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400")}>
                                                            {device.status}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-20 h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                            <div
                                                                className={cn("h-full transition-all duration-500", device.battery_level > 20 ? "bg-emerald-500" : "bg-red-500")}
                                                                style={{ width: `${device.battery_level}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-slate-900 dark:text-white">{device.battery_level}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right text-slate-400 dark:text-white/30 lowercase tabular-nums">
                                                    {new String(new Date(device.last_ping || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })).toLowerCase()}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
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
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#064e3b]/40 backdrop-blur-sm">
                        <div className="w-full max-w-xl">
                            <Card className="rounded-none border-4 border-[#064e3b] shadow-[12px_12px_0px_0px_rgba(6,78,59,1)] overflow-hidden bg-white">
                                <CardHeader className="p-8 border-b-4 border-[#064e3b] bg-white text-[#064e3b]">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-4xl font-black uppercase tracking-tighter">Schedule audit</CardTitle>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setIsRequestingInspection(false)}
                                            className="rounded-none hover:bg-[#facc15]/10 border-2 border-transparent hover:border-[#064e3b] transition-none"
                                        >
                                            <X className="w-6 h-6" />
                                        </Button>
                                    </div>
                                    <p className="text-[#064e3b]/30 font-black uppercase text-[10px] mt-2 tracking-[0.2em]">Asset verification protocol.</p>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6 bg-white">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-widest">Protocol Title</Label>
                                        <Input
                                            value={inspectionTaskForm.title}
                                            onChange={(e) => setInspectionTaskForm({ ...inspectionTaskForm, title: e.target.value })}
                                            className="h-12 rounded-none border-4 border-[#064e3b] bg-white text-sm font-black uppercase focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:bg-[#facc15]/5 transition-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-widest">Audit Deadline</Label>
                                        <Input
                                            type="date"
                                            value={inspectionTaskForm.due_date}
                                            onChange={(e) => setInspectionTaskForm({ ...inspectionTaskForm, due_date: e.target.value })}
                                            className="h-12 rounded-none border-4 border-[#064e3b] bg-white text-sm font-black uppercase focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:bg-[#facc15]/5 transition-none"
                                        />
                                    </div>
                                    <div className="pt-6 flex gap-4">
                                        <Button
                                            variant="ghost"
                                            className="flex-1 h-12 rounded-none font-black text-[#064e3b]/40 hover:text-[#064e3b] hover:bg-neutral-50 uppercase text-[10px] tracking-widest transition-none"
                                            onClick={() => setIsRequestingInspection(false)}
                                        >
                                            Abort Operation
                                        </Button>
                                        <Button
                                            onClick={submitInspectionRequest}
                                            disabled={isSavingTask}
                                            className="flex-1 h-12 rounded-none bg-[#064e3b] text-white hover:bg-[#10b981] gap-3 font-black uppercase text-[10px] tracking-widest transition-none border-2 border-[#064e3b] shadow-[4px_4px_0px_0px_rgba(16,185,129,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                                        >
                                            {isSavingTask ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                                            Log Audit Request
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
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#064e3b]/40 backdrop-blur-sm">
                        <div className="w-full max-w-4xl">
                            <Card className="rounded-none border-4 border-[#064e3b] shadow-[12px_12px_0px_0px_rgba(6,78,59,1)] overflow-hidden bg-white">
                                <CardContent className="p-10">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 border-2 border-[#10b981] bg-[#064e3b] flex items-center justify-center text-[#facc15]">
                                                <Hexagon className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-4">
                                                    <h2 className="text-4xl font-black text-[#064e3b] uppercase tracking-tighter leading-none">{activeHive.hive_code}</h2>
                                                    <span className="bg-[#facc15]/10 border-2 border-[#facc15] px-2 py-1 text-[10px] font-black uppercase tracking-widest text-[#064e3b]">{activeHive.status}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <MapPin className="w-4 h-4 text-[#cc9c00]" />
                                                    <span className="text-[#064e3b]/30 font-black uppercase text-[10px] tracking-widest">{apiaries.find(a => a.id === activeHive.apiary_id)?.name}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => setIsQuickDetailsOpen(false)} className="rounded-none h-12 w-12 hover:bg-[#facc15]/10 border-4 border-transparent hover:border-[#064e3b] transition-none">
                                            <X className="w-6 h-6 text-[#064e3b]/40" />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                        {[
                                            { label: 'Thermal', value: activeHive.latest_temp ? `${activeHive.latest_temp}°C` : '--', icon: Activity, color: 'text-orange-500' },
                                            { label: 'Mass', value: activeHive.latest_weight ? `${activeHive.latest_weight}kg` : '--', icon: TrendingUp, color: 'text-emerald-600' },
                                            { label: 'Saturation', value: activeHive.latest_humidity ? `${activeHive.latest_humidity}%` : '--', icon: Radio, color: 'text-blue-500' },
                                            { label: 'Biometrics', value: 'OPTIMAL', icon: ShieldCheck, color: 'text-[#064e3b]' }
                                        ].map((item, i) => (
                                            <div key={i} className="bg-neutral-50/50 border-4 border-[#064e3b] p-6 text-center">
                                                <item.icon className={cn("w-5 h-5 mx-auto mb-3", item.color)} />
                                                <p className="text-[9px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em] mb-1">{item.label}</p>
                                                <p className="font-black text-xl text-[#064e3b] uppercase">{item.value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-[#facc15]/5 border-4 border-[#064e3b] p-8 mb-8">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Label className="text-[10px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em]">Registry Notes</Label>
                                            <div className="h-[2px] flex-1 bg-[#064e3b]/10" />
                                        </div>
                                        <p className="text-xl font-black text-[#064e3b] leading-tight uppercase tracking-tight">{activeHive.notes || 'No registry entries recorded.'}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Button
                                            className="h-14 rounded-none bg-[#064e3b] text-white hover:bg-[#10b981] gap-3 font-black text-xs uppercase tracking-widest transition-none border-2 border-[#064e3b] shadow-[6px_6px_0px_0px_rgba(16,185,129,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                                            onClick={() => {
                                                setIsQuickDetailsOpen(false);
                                                onTabChange('inspections', `Filtering for ${activeHive.hive_code}`, `filter_hive:${activeHive.id}`);
                                            }}
                                        >
                                            <Activity className="w-5 h-5" />
                                            Master Data
                                        </Button>
                                        <Button className="h-14 rounded-none border-4 border-[#064e3b] bg-white text-[#064e3b] hover:bg-[#facc15]/10 gap-3 font-black text-xs uppercase tracking-widest transition-none" variant="outline" onClick={() => { setIsQuickDetailsOpen(false); handleOpenNotes(activeHive); }}>
                                            Record Observation
                                        </Button>
                                        <Button className="h-14 rounded-none border-4 border-[#064e3b] bg-white text-[#064e3b] hover:bg-[#facc15]/10 gap-3 font-black text-xs uppercase tracking-widest transition-none" variant="outline" onClick={() => { setIsQuickDetailsOpen(false); handleEditHive(activeHive); }}>
                                            Modify Asset
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
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#064e3b]/40 backdrop-blur-sm">
                        <div className="w-full max-w-2xl">
                            <Card className="rounded-none border-4 border-[#064e3b] shadow-[8px_8px_0px_0px_rgba(6,78,59,1)] overflow-hidden bg-white">
                                <CardHeader className="p-8 border-b-4 border-[#064e3b] flex flex-row items-center justify-between text-[#064e3b]">
                                    <div>
                                        <CardTitle className="text-3xl font-black uppercase tracking-tighter">Asset Observation</CardTitle>
                                        <p className="text-[#064e3b]/30 font-black uppercase text-[10px] mt-2 tracking-[0.2em]">Asset #{activeHive.hive_code}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setIsNotesModalOpen(false)} className="rounded-none h-12 w-12 hover:bg-[#facc15]/10 border-2 border-transparent hover:border-[#064e3b] transition-none">
                                        <X className="w-6 h-6" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <Textarea
                                        value={hiveNotes}
                                        onChange={(e) => setHiveNotes(e.target.value)}
                                        className="min-h-[250px] rounded-none border-4 border-[#064e3b] bg-neutral-50 p-6 font-black text-lg focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:bg-[#facc15]/5 transition-none resize-none uppercase tracking-tight placeholder:text-neutral-300"
                                        placeholder="INPUT OBSERVATION DATA..."
                                    />
                                    <Button onClick={handleSaveNotes} disabled={isSavingNotes} className="w-full h-14 rounded-none bg-[#064e3b] text-white hover:bg-[#10b981] gap-3 font-black text-xs uppercase tracking-widest transition-none border-2 border-[#064e3b] shadow-[4px_4px_0px_0px_rgba(16,185,129,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
                                        {isSavingNotes ? <Loader2 className="w-6 h-6 animate-spin" /> : <ShieldCheck className="w-6 h-6" />}
                                        Store in Registry
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
