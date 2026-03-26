import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
    Plus, Search, Loader2, ShieldCheck, AlertCircle, CheckCircle2, Calendar, ClipboardList, Trash2,
    Bot, ArrowRight, MapPin, Thermometer, Zap, Sun, HeartPulse, ChevronLeft, SearchX, Hexagon,
    Terminal, Target, Box, FileText, Lock as LockIcon, Activity, Waves, Hash, Shield, Microscope, RefreshCw, Bug, Layers
} from "lucide-react";
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import beeyieldService, { Apiary, Hive, Inspection, Harvest } from '@/services/beeyieldService';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { glass, GlassStatCard } from './GlassTheme';
import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
import { useApiaries, useHives } from '@/hooks/useApiaries';
import { useHarvests } from '@/hooks/useHarvests';
import { useInspections, useCreateInspection, useUpdateInspection, useDeleteInspection } from '@/hooks/useInspections';
import { useTasks, useUpdateTask } from '@/hooks/useTasks';

interface InspectionsViewProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
    initialParams?: { message?: string, action?: string } | null;
}

const InspectionsView: React.FC<InspectionsViewProps> = ({ onTabChange, initialParams }) => {
    // UI State
    const [isAddingInspection, setIsAddingInspection] = React.useState(false);
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
    // Data from Hooks
    const { data: apiariesData, isLoading: apiariesLoading } = useApiaries();
    const { data: hivesData, isLoading: hivesLoading } = useHives();
    const { data: harvestsData, isLoading: harvestsLoading } = useHarvests();
    const { data: inspectionsData, isLoading: inspectionsLoading } = useInspections();

    // Mutations
    const createInspectionMutation = useCreateInspection();
    const updateInspectionMutation = useUpdateInspection();
    const deleteInspectionMutation = useDeleteInspection();
    const { data: tasksData, isLoading: tasksLoading } = useTasks();
    const updateTaskMutation = useUpdateTask();

    const apiaries = apiariesData || [];
    const hives = hivesData || [];
    const harvests = harvestsData || [];
    const inspections = inspectionsData || [];
    const tasks = tasksData || [];

    const isLoading = apiariesLoading || hivesLoading || harvestsLoading || inspectionsLoading || tasksLoading;

    // Filters
    const [selectedPlaceId, setSelectedPlaceId] = React.useState<string>('all_places');
    const [selectedHiveId, setSelectedHiveId] = React.useState<string>('all_hives');
    const [selectedBatchCode, setSelectedBatchCode] = React.useState<string>('all_batches');
    const [searchQuery, setSearchQuery] = React.useState('');

    const { user, beeyieldUser } = useAuth();
    const userId = beeyieldUser?.id || user?.id;

    // Task linked logic
    const [linkedTaskId, setLinkedTaskId] = React.useState<string | null>(null);

    // Form State
    const [formData, setFormData] = React.useState({
        hive_id: '',
        inspector_name: '',
        inspection_date: new Date().toISOString().split('T')[0],
        health_status: 'healthy',
        temperament: 'calm',
        honey_stores: 0,
        pollen_stores: 0,
        brood_pattern: 'solid',
        eggs_seen: false,
        queen_seen: false,
        queen_cells_seen: false,
        varroa_mite_count: 0,
        small_hive_beetles_seen: 0,
        weather_condition: 'sunny',
        temperature_celsius: 25,
        findings: '',
        actions_taken: '',
        notes: ''
    });

    const resetForm = React.useCallback(() => {
        setFormData({
            hive_id: '',
            inspector_name: '',
            inspection_date: new Date().toISOString().split('T')[0],
            health_status: 'healthy',
            temperament: 'calm',
            honey_stores: 0,
            pollen_stores: 0,
            brood_pattern: 'solid',
            eggs_seen: false,
            queen_seen: false,
            queen_cells_seen: false,
            varroa_mite_count: 0,
            small_hive_beetles_seen: 0,
            weather_condition: 'sunny',
            temperature_celsius: 25,
            findings: '',
            actions_taken: '',
            notes: ''
        });
        setEditingId(null);
    }, []);

    // Handle initial params for filtering or modals
    React.useEffect(() => {
        if (initialParams?.action === 'open_add_new') {
            setIsAddingInspection(true);
        } else if (initialParams?.action?.startsWith('filter_hive:')) {
            const hiveId = initialParams.action.split(':')[1];
            if (hiveId && hives.length > 0 && hives.some(h => h.id === hiveId)) {
                setSelectedHiveId(hiveId);
                const hive = hives.find(h => h.id === hiveId);
                if (hive && hive.apiary_id) {
                    setSelectedPlaceId(hive.apiary_id);
                }
                toast.info(`Filtering logs for hive ${hive?.hive_code || hiveId}`);
            }
        }
    }, [initialParams, hives]);

    const isSaving = createInspectionMutation.isPending || updateInspectionMutation.isPending;

    const handleSave = React.useCallback(async () => {
        if (!formData.hive_id || formData.hive_id === 'all_hives') {
            toast.error("Please select a hive first.");
            return;
        }

        try {
            if (editingId) {
                await updateInspectionMutation.mutateAsync({ id: editingId, data: formData });
            } else {
                const response = await createInspectionMutation.mutateAsync(formData);
                // If this was linked to a task, mark task as complete
                if (linkedTaskId && response?.data) {
                    await updateTaskMutation.mutateAsync({ 
                        id: linkedTaskId, 
                        updates: { status: 'completed', completed_at: new Date().toISOString() } 
                    });
                }
            }
            setIsAddingInspection(false);
            setLinkedTaskId(null);
            resetForm();
        } catch (error: any) {
            console.error('Error saving inspection:', error);
        }
    }, [formData, editingId, linkedTaskId, createInspectionMutation, updateInspectionMutation, updateTaskMutation, resetForm]);

    const handleEdit = React.useCallback((inspection: Inspection) => {
        setEditingId(inspection.id);
        setFormData({
            hive_id: inspection.hive_id,
            inspector_name: inspection.inspector_name || '',
            inspection_date: inspection.inspection_date || new Date().toISOString().split('T')[0],
            health_status: inspection.health_status || 'healthy',
            temperament: inspection.temperament || 'calm',
            honey_stores: inspection.honey_stores || 0,
            pollen_stores: inspection.pollen_stores || 0,
            brood_pattern: inspection.brood_pattern || 'solid',
            eggs_seen: inspection.eggs_seen || false,
            queen_seen: inspection.queen_seen || false,
            queen_cells_seen: inspection.queen_cells_seen || false,
            varroa_mite_count: inspection.varroa_mite_count || 0,
            small_hive_beetles_seen: inspection.small_hive_beetles_seen || 0,
            weather_condition: inspection.weather_condition || 'sunny',
            temperature_celsius: inspection.temperature_celsius || 25,
            findings: inspection.findings || '',
            actions_taken: inspection.actions_taken || '',
            notes: inspection.notes || ''
        });
        setIsAddingInspection(true);
    }, []);

    const handleDelete = React.useCallback(async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this inspection? This cannot be undone.")) return;

        try {
            await deleteInspectionMutation.mutateAsync(id);
        } catch (error) {
            console.error("Error deleting record:", error);
        }
    }, [deleteInspectionMutation]);

    const filteredHivesForSelect = hives.filter(h =>
        selectedPlaceId === 'all_places' || h.apiary_id === selectedPlaceId
    );

    const filteredInspections = inspections.filter(i => {
        if (selectedHiveId !== 'all_hives' && i.hive_id !== selectedHiveId) return false;
        
        const hive = hives.find(h => h.id === i.hive_id);
        const apiary = hive ? apiaries.find(a => a.id === hive.apiary_id) : null;

        if (selectedPlaceId !== 'all_places') {
            if (!hive || hive.apiary_id !== selectedPlaceId) return false;
        }

        if (selectedBatchCode !== 'all_batches') {
            const hiveHarvests = harvests.filter(h => h.hive_id === i.hive_id);
            const hasBatchMatch = hiveHarvests.some(h => (h as any).batch_code === selectedBatchCode);
            if (!hasBatchMatch) return false;
        }

        if (searchQuery) {
            const searchLower = searchQuery.toLowerCase();
            return (
                i.inspector_name?.toLowerCase().includes(searchLower) ||
                i.findings?.toLowerCase().includes(searchLower) ||
                hive?.hive_code.toLowerCase().includes(searchLower) ||
                apiary?.name.toLowerCase().includes(searchLower)
            );
        }
        return true;
    });

    const batchOptions = React.useMemo(() => {
        const seen = new Set<string>();
        harvests.forEach(h => {
            const code = (h as any).batch_code;
            if (code) seen.add(code);
        });
        return Array.from(seen).sort();
    }, [harvests]);

    const stats = React.useMemo(() => {
        const pending = tasks.filter(t => t.category === 'inspection' && t.status === 'pending').length;
        return {
            total: inspections.length,
            healthy: inspections.filter(i => i.health_status === 'healthy').length,
            issues: inspections.filter(i => i.health_status !== 'healthy').length,
            pendingCount: pending,
            thisMonth: inspections.filter(i => {
                const date = new Date(i.inspection_date);
                const now = new Date();
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            }).length
        };
    }, [inspections, tasks]);

    if (isAddingInspection) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={glass.page}
            >
                {/* ── Header ── */}
                <BeeYieldPageHeader
                    icon={Microscope}
                    label="Inspection"
                    title={<>Hive <span className="text-[#F4D03F]">inspection</span></>}
                    subtitle="Record inspection notes and health status."
                    actions={
                        <div className="flex gap-2">
                             <button
                                onClick={() => { setIsAddingInspection(false); resetForm(); }}
                                className={glass.btnSecondary}
                            >
                                Discard
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className={glass.btnPrimary}
                            >
                                {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                                {editingId ? 'Update Report' : 'Archive Log'}
                            </button>
                        </div>
                    }
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                    {/* Left Column: Metadata & Unit ID */}
                    <div className="lg:col-span-4 space-y-12">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={cn(glass.card, "p-0 overflow-hidden bg-white/40 border-white/20 shadow-xl")}
                        >
                            <div className="p-4 border-b border-white/20 bg-white/20 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/20 shadow-sm">
                                    <Target className="w-4 h-4 text-[#F4D03F]" />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-[10px] font-black text-[#1A1A1A]">Hive Details</h3>
                                    <p className="text-[8px] font-black text-gray-400">Hive and Location</p>
                                </div>
                            </div>
                            <div className="p-5 space-y-4">
                                <div className="space-y-3">
                                    <Label className={glass.microLabel}>Deployment Site</Label>
                                    <Select
                                        value={hives.find(h => h.id === formData.hive_id)?.apiary_id || 'unselected'}
                                        onValueChange={(val) => {
                                            const firstHive = hives.find(h => h.apiary_id === val);
                                            if (firstHive) setFormData({ ...formData, hive_id: firstHive.id });
                                        }}
                                    >
                                        <SelectTrigger id="inspection-apiary" aria-label="Deployment site" className={cn(glass.select, "h-10 border-white/40 bg-white/50")}>
                                            <div className="flex items-center gap-3">
                                                <MapPin className="w-4 h-4 text-[#F4D03F]/40" />
                                                <SelectValue placeholder="Deployment Site" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className={glass.selectContent}>
                                            {apiaries.map(a => <SelectItem key={a.id} value={a.id} className=" font-bold text-xs">{a.name.toUpperCase()}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <Label className={glass.microLabel}>Select Hive</Label>
                                    <Select
                                        value={formData.hive_id}
                                        onValueChange={(val) => setFormData({ ...formData, hive_id: val })}
                                    >
                                        <SelectTrigger id="inspection-hive" aria-label="Select hive" className={cn(glass.select, "h-10 border-white/40 bg-white/50")}>
                                            <div className="flex items-center gap-3">
                                                <Hexagon className="w-4 h-4 text-[#F4D03F]/40" />
                                                <SelectValue placeholder="Select a hive…" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className={glass.selectContent}>
                                            {filteredHivesForSelect.map(h => <SelectItem key={h.id} value={h.id} className=" font-bold text-xs">UNIT #{h.hive_code}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="inspection-date" className={glass.microLabel}>Inspection Date</Label>
                                    <div className="relative group/input">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F4D03F] opacity-40" />
                                        <Input
                                            id="inspection-date"
                                            name="inspection_date"
                                            autoComplete="off"
                                            type="date"
                                            value={formData.inspection_date}
                                            onChange={(e) => setFormData({ ...formData, inspection_date: e.target.value })}
                                            className={cn(glass.input, "h-10 pl-10 border-white/40 bg-white/50 focus:bg-white")}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="inspection-inspector-name" className={glass.microLabel}>Inspector Name</Label>
                                    <div className="relative group/input">
                                        <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F4D03F] opacity-40" />
                                        <Input
                                            id="inspection-inspector-name"
                                            name="inspector_name"
                                            autoComplete="name"
                                            placeholder="Enter name"
                                            value={formData.inspector_name}
                                            onChange={(e) => setFormData({ ...formData, inspector_name: e.target.value })}
                                            className={cn(glass.input, "h-10 pl-10 border-white/40 bg-white/50 focus:bg-white text-[11px] font-black tracking-tight")}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <div className={cn(glass.card, 'bg-white/40 border-white/20 p-5 shadow-xl relative overflow-hidden group')}>
                            <div className="relative z-10 space-y-4">
                                <div className="w-10 h-10 rounded-xl bg-[#F4D03F] flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                                    <Microscope className="w-5 h-5 text-[#1A1A1A]" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-[10px] font-black text-[#1A1A1A]">Colony Analysis</h3>
                                    <p className="text-[8px] font-black text-gray-400 leading-relaxed">
                                        Powering Collective Hive Intelligence
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Biometric Vitals & Findings */}
                    <div className="lg:col-span-8 space-y-12">
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={cn(glass.card, "p-0 bg-white/40 border-white/20 shadow-xl overflow-hidden")}
                        >
                            <div className="p-4 border-b border-white/20 bg-white/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/20 shadow-sm">
                                        <HeartPulse className="w-4 h-4 text-[#F4D03F]" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h2 className="text-[11px] font-black text-[#1A1A1A]">Colony Health Assessment</h2>
                                        <p className="text-[8px] font-black text-gray-400">Basic metrics</p>
                                    </div>
                                </div>
                                <div className="flex bg-white/40 p-1 rounded-xl border border-white/40 gap-1 w-full sm:w-auto overflow-x-auto shadow-sm">
                                    {['healthy', 'weak', 'diseased', 'critical'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setFormData({ ...formData, health_status: s })}
                                            className={cn(
                                                "h-8 px-4 rounded-lg text-[9px] font-black transition-all whitespace-nowrap",
                                                formData.health_status === s
                                                    ? "bg-[#F4D03F] text-[#1A1A1A] shadow-md"
                                                    : "text-gray-400 hover:text-[#1A1A1A] hover:bg-white/50"
                                            )}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-5 space-y-6 relative z-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        {[
                                             { id: 'queen_seen', label: 'Queen seen', sub: 'Visual verification', icon: ShieldCheck, color: 'text-[#F4D03F]' },
                                             { id: 'eggs_seen', label: 'Eggs seen', sub: 'Active brood', icon: CheckCircle2, color: 'text-[#1B9157]' },
                                             { id: 'queen_cells_seen', label: 'Queen cells seen', sub: 'Potential swarm', icon: AlertCircle, color: 'text-red-500' }
                                         ].map((item) => (
                                             <div
                                                 key={item.id}
                                                 className="flex items-center justify-between p-4 rounded-xl border border-[#F4D03F]/10 hover:border-[#F4D03F]/20 transition-all bg-white"
                                             >
                                                 <div className="flex items-center gap-3">
                                                     <div className="w-8 h-8 rounded-lg border border-[#F4D03F]/10 bg-[#F9F7F2] flex items-center justify-center">
                                                         <item.icon className={cn("w-4 h-4", item.color)} />
                                                     </div>
                                                     <div className="flex flex-col">
                                                         <span className="text-sm font-bold text-[#1A1A1A] tracking-tight">{item.label}</span>
                                                         <span className={cn(glass.microLabel, 'opacity-40')}>{item.sub}</span>
                                                     </div>
                                                 </div>
                                                 <Switch
                                                    id={`inspection-${item.id}`}
                                                     checked={(formData as any)[item.id]}
                                                     onCheckedChange={(val) => setFormData({ ...formData, [item.id]: val })}
                                                     className="data-[state=checked]:bg-[#F4D03F]"
                                                 />
                                             </div>
                                         ))}

                                         <div className="space-y-3">
                                             <Label className={glass.microLabel}>Temperament Profile</Label>
                                             <div className="grid grid-cols-3 bg-[#F9F7F2] p-1 rounded-lg border border-[#F4D03F]/10 gap-1">
                                                 {['calm', 'nervous', 'aggressive'].map(t => (
                                                     <button
                                                         key={t}
                                                         onClick={() => setFormData({ ...formData, temperament: t })}
                                                         className={cn(
                                                             "h-8 rounded-md text-[10px] font-bold tracking-wider transition-all",
                                                             formData.temperament === t
                                                                 ? "bg-[#F4D03F] text-[#1A1A1A] shadow-sm"
                                                                 : "text-gray-400 hover:text-[#F4D03F] hover:bg-white"
                                                         )}
                                                     >
                                                          {t}
                                                     </button>
                                                 ))}
                                             </div>
                                         </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="inspection-temperature-c" className={glass.microLabel}>Temperature (°C)</Label>
                                                <div className="relative group/input">
                                                    <Thermometer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500 opacity-40" />
                                                <Input
                                                        id="inspection-temperature-c"
                                                        name="temperature_celsius"
                                                        autoComplete="off"
                                                        type="number"
                                                        value={formData.temperature_celsius}
                                                        onChange={(e) => setFormData({ ...formData, temperature_celsius: parseFloat(e.target.value) })}
                                                        className={cn(glass.input, "h-10 pl-10 border-white/40 bg-white/50 focus:bg-white")}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className={glass.microLabel}>Weather</Label>
                                                <Select value={formData.weather_condition} onValueChange={(v) => setFormData({ ...formData, weather_condition: v })}>
                                                    <SelectTrigger id="inspection-weather" aria-label="Weather" className={cn(glass.select, "h-10 border-white/40 bg-white/50")}>
                                                        <div className="flex items-center gap-3">
                                                            <Sun className="w-4 h-4 text-[#F4D03F]/40" />
                                                            <SelectValue />
                                                        </div>
                                                    </SelectTrigger>
                                                    <SelectContent className={glass.selectContent}>
                                                        {['sunny', 'cloudy', 'rainy', 'windy'].map(w => (
                                                            <SelectItem key={w} value={w} className=" font-bold text-xs">{w.toUpperCase()}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="inspection-honey-stores" className={glass.microLabel}>Honey Stores (kg)</Label>
                                                <div className="relative group/input">
                                                    <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F4D03F] opacity-40" />
                                                    <Input
                                                        id="inspection-honey-stores"
                                                        name="honey_stores"
                                                        autoComplete="off"
                                                        type="number"
                                                        value={formData.honey_stores}
                                                        onChange={(e) => setFormData({ ...formData, honey_stores: parseFloat(e.target.value) })}
                                                        className={cn(glass.input, "h-10 pl-10 border-white/40 bg-white/50 focus:bg-white")}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="inspection-pollen-stores" className={glass.microLabel}>Pollen Reserves</Label>
                                                <div className="relative group/input">
                                                    <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400 opacity-40" />
                                                    <Input
                                                        id="inspection-pollen-stores"
                                                        name="pollen_stores"
                                                        autoComplete="off"
                                                        type="number"
                                                        value={formData.pollen_stores}
                                                        onChange={(e) => setFormData({ ...formData, pollen_stores: parseFloat(e.target.value) })}
                                                        className={cn(glass.input, "h-10 pl-10 border-white/40 bg-white/50 focus:bg-white")}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className={cn(glass.microLabel, 'text-red-500/60')}>Varroa Count</Label>
                                                <div className="relative group/input">
                                                    <Microscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500 opacity-40" />
                                                    <Input
                                                        id="inspection-varroa-count"
                                                        name="varroa_mite_count"
                                                        autoComplete="off"
                                                        type="number"
                                                        value={formData.varroa_mite_count}
                                                        onChange={(e) => setFormData({ ...formData, varroa_mite_count: parseInt(e.target.value) })}
                                                        className={cn(glass.input, "h-10 pl-10 border-red-500/20 bg-red-500/5 focus:bg-white")}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="inspection-beetle-count" className={glass.microLabel}>Beetle Count</Label>
                                                <div className="relative group/input">
                                                    <Bug className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground opacity-10" />
                                                    <Input
                                                        id="inspection-beetle-count"
                                                        name="small_hive_beetles_seen"
                                                        autoComplete="off"
                                                        type="number"
                                                        value={formData.small_hive_beetles_seen}
                                                        onChange={(e) => setFormData({ ...formData, small_hive_beetles_seen: parseInt(e.target.value) })}
                                                        className={cn(glass.input, "h-10 pl-10 border-white/40 bg-white/50 focus:bg-white")}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 pt-6 border-t border-[#F4D03F]/10">
                                    <div className="space-y-2">
                                        <Label htmlFor="inspection-findings" className={glass.microLabel}>Findings</Label>
                                        <Textarea
                                            id="inspection-findings"
                                            name="findings"
                                            autoComplete="off"
                                            placeholder="Record Observations"
                                            value={formData.findings}
                                            onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                                            className={cn(glass.input, "h-auto py-2.5 min-h-[100px] border-white/40 bg-white/50 focus:bg-white text-[11px] font-black tracking-tight resize-none")}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="inspection-actions-taken" className={glass.microLabel}>Actions Taken</Label>
                                        <Textarea
                                            id="inspection-actions-taken"
                                            name="actions_taken"
                                            autoComplete="off"
                                            placeholder="Record Actions Protocols"
                                            value={formData.actions_taken}
                                            onChange={(e) => setFormData({ ...formData, actions_taken: e.target.value })}
                                            className={cn(glass.input, "h-auto py-2.5 min-h-[100px] border-white/40 bg-white/50 focus:bg-white text-[11px] font-black tracking-tight resize-none")}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 border-t border-white/20 bg-white/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-4 h-4 text-[#F4D03F]/40" />
                                    <p className="text-[8px] font-black text-gray-400">Data Encryption Active</p>
                                </div>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <button
                                        onClick={() => { setIsAddingInspection(false); resetForm(); }}
                                        className={cn(glass.btnSecondary, "h-9 px-6 font-black text-[10px] rounded-xl")}
                                    >
                                        Discard
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className={cn(glass.btnPrimary, "flex-1 sm:flex-none h-9 px-8 font-black text-[10px]")}
                                    >
                                        {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                        {editingId ? 'Update Report' : 'Archive Log'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <BeeYieldPageShell className={glass.page}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
            >
            {/* Header */}
            <BeeYieldPageHeader
                icon={ClipboardList}
                label="Inspections"
                onBack={() => onTabChange('home')}
                title={<>Inspection <span className="text-[#F4D03F]">history</span></>}
                subtitle="View and record your inspection notes."
                actions={
                    <button
                        onClick={() => { resetForm(); setIsAddingInspection(true); }}
                        className={glass.btnPrimary}
                    >
                        <Plus className="w-4 h-4" />
                        Log Diagnostic
                    </button>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                <GlassStatCard label="Total inspections" value={stats.total} icon={ClipboardList} index={0} />
                <GlassStatCard label="Healthy colonies" value={stats.healthy} icon={CheckCircle2} index={1} color="text-[#1B9157]" />
                <GlassStatCard label="Colonies with issues" value={stats.issues} icon={AlertCircle} index={2} color="text-red-500" />
                <GlassStatCard label="This month" value={stats.thisMonth} icon={Activity} index={3} color="text-[#F4D03F]" />
            </div>

            {/* Filter Bar */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className={glass.filterBar}
            >
                <div className="flex-1 w-full relative group/search">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A1A]/20" />
                    <Input
                        placeholder="Search reports..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-10 pl-12 bg-white/50 border border-white/40 rounded-xl text-[11px] font-black text-[#1A1A1A] placeholder:text-gray-400 focus:bg-white transition-colors"
                    />
                </div>
                <div className="flex flex-col md:flex-row gap-2 w-full xl:w-auto p-1">
                    <Select value={selectedPlaceId} onValueChange={(val) => {
                        setSelectedPlaceId(val);
                        setSelectedHiveId('all_hives');
                    }}>
                        <SelectTrigger className={cn(glass.select, "w-full md:w-44 h-10 border-white/40 bg-white/50 text-[11px] font-black")}>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-[#F4D03F]/40" />
                                <SelectValue placeholder="Location" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className={glass.selectContent}>
                            <SelectItem value="all_places" className=" font-bold text-xs">All Locations</SelectItem>
                            {apiaries.map(a => <SelectItem key={a.id} value={a.id} className=" font-bold text-xs">{a.name.toUpperCase()}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    
                    <Select value={selectedHiveId} onValueChange={setSelectedHiveId}>
                        <SelectTrigger className={cn(glass.select, "w-full md:w-36 h-10 border-white/40 bg-white/50 text-[11px] font-black")}>
                            <div className="flex items-center gap-2">
                                <Hexagon className="w-3.5 h-3.5 text-[#F4D03F]/40" />
                                <SelectValue placeholder="Unit" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className={glass.selectContent}>
                            <SelectItem value="all_hives" className=" font-bold text-xs">All Hives</SelectItem>
                            {filteredHivesForSelect.map(h => <SelectItem key={h.id} value={h.id} className=" font-bold text-xs">{h.hive_code}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    <Select value={selectedBatchCode} onValueChange={setSelectedBatchCode}>
                        <SelectTrigger className={cn(glass.select, "w-full md:w-36 h-10 border-white/40 bg-white/50 text-[11px] font-black")}>
                            <div className="flex items-center gap-2">
                                <Layers className="w-3.5 h-3.5 text-[#F4D03F]/40" />
                                <SelectValue placeholder="Batch" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className={glass.selectContent}>
                            <SelectItem value="all_batches" className=" font-bold text-xs">All Batches</SelectItem>
                            {batchOptions.map(code => <SelectItem key={code} value={code} className=" font-bold text-xs">{code}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </motion.div>

            {/* List */}
            <div className="relative z-10 space-y-8">
                {/* Pending Inspections Section */}
                {!isLoading && tasks.some(t => t.category === 'inspection' && t.status === 'pending') && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 border-l-4 border-l-[#F4D03F] pl-4">
                            <h2 className="text-[11px] font-black text-[#1A1A1A] leading-none uppercase tracking-widest">Required <span className="text-[#F4D03F]">Inspections</span></h2>
                            <div className="h-px flex-1 bg-gradient-to-r from-[#F4D03F]/10 to-transparent" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {tasks.filter(t => t.category === 'inspection' && t.status === 'pending').map(task => {
                                const hive = hives.find(h => h.id === task.hive_id);
                                const apiary = apiaries.find(a => a.id === task.apiary_id);
                                return (
                                    <motion.div
                                        key={task.id}
                                        whileHover={{ y: -2 }}
                                        className="bg-white/40 border border-[#F4D03F]/20 rounded-xl p-4 flex items-start justify-between group/task shadow-sm"
                                    >
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/20">
                                                    <Activity className="w-3 h-3 text-[#F4D03F]" />
                                                </div>
                                                <span className="text-[10px] font-black text-[#1A1A1A]">{apiary?.name || 'Local'} - {hive?.hive_code || '---'}</span>
                                            </div>
                                            <p className="text-[11px] font-bold text-gray-500 line-clamp-1">{task.title}</p>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3 h-3 text-gray-400" />
                                                <span className="text-[9px] font-black text-gray-400">Due {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'ASAP'}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                resetForm();
                                                setFormData({
                                                    ...formData,
                                                    hive_id: task.hive_id || '',
                                                    findings: `Required Inspection for: ${task.title}`
                                                });
                                                setLinkedTaskId(task.id);
                                                setIsAddingInspection(true);
                                            }}
                                            className="w-8 h-8 rounded-lg bg-[#F4D03F] flex items-center justify-center text-[#1A1A1A] hover:scale-110 transition-transform shadow-md"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}


                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={cn(glass.skeleton, 'h-24 rounded-xl')} />
                        ))}
                    </div>
                ) : filteredInspections.length === 0 ? (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 rounded-2xl bg-[#F4D03F]/5 border border-[#F4D03F]/20 flex items-center justify-center mb-6">
                            <SearchX className="w-8 h-8 text-[#F4D03F] opacity-20" />
                        </div>
                        <h3 className="text-xl font-black text-[#1A1A1A] tracking-tight">No inspections</h3>
                        <p className="text-[10px] font-bold text-gray-400 mt-2 max-w-md text-center">
                            No inspection reports found.
                        </p>
                        <button onClick={() => { resetForm(); setIsAddingInspection(true); }} className={cn(glass.btnPrimary, "mt-6")}>
                            <Plus className="w-4 h-4" /> Log first inspection
                        </button>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 border-l-4 border-l-[#F4D03F] pl-4">
                            <h2 className="text-[11px] font-black text-[#1A1A1A] leading-none uppercase tracking-widest">Recent <span className="text-[#F4D03F]">Logs</span></h2>
                            <div className="h-px flex-1 bg-gradient-to-r from-[#F4D03F]/10 to-transparent" />
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F4D03F]/10 text-[#F4D03F] border border-[#F4D03F]/20 rounded-xl">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#F4D03F] animate-pulse" />
                                <span className="text-[9px] font-black tracking-wider uppercase">{filteredInspections.length} logs</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <AnimatePresence mode="popLayout">
                                {filteredInspections.map((inspection, index) => {
                                    const hive = hives.find(h => h.id === inspection.hive_id);
                                    const apiary = hive ? apiaries.find(a => a.id === hive.apiary_id) : null;
                                    const health = (inspection.health_status || 'healthy').toLowerCase();

                                    return (
                                        <motion.div
                                            key={inspection.id}
                                            initial={{ opacity: 0, x: -50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05, duration: 1 }}
                                            onClick={() => handleEdit(inspection)}
                                            className="bg-white/40 border border-white/40 rounded-xl p-4 cursor-pointer hover:border-[#F4D03F]/40 hover:bg-white/60 transition-all flex flex-col xl:flex-row gap-5 overflow-hidden group/item shadow-sm"
                                        >
                                            {/* Details Section */}
                                            <div className="w-full xl:w-[200px] shrink-0 space-y-3 relative">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-gray-100 shadow-sm">
                                                        <Hexagon className="w-4 h-4 text-[#F4D03F]/60" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xs font-black text-[#1A1A1A] tracking-tight group-hover/item:text-[#F4D03F] transition-colors">{apiary?.name || 'Local'}</h3>
                                                        <div className="flex items-center gap-1.5 text-[8px] text-gray-400 font-black">
                                                            <Hash className="w-3 h-3 text-[#F4D03F]/40" />
                                                            <span>{hive?.hive_code || '---'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 pt-3 border-t border-[#F4D03F]/10">
                                                    <div className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black flex items-center gap-1.5",
                                                        health === 'healthy' ? "bg-[#1B9157]/10 text-[#1B9157]" :
                                                            health === 'weak' ? "bg-[#F4D03F]/10 text-[#F4D03F]" : "bg-red-500/10 text-red-500"
                                                    )}>
                                                        <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse",
                                                            health === 'healthy' ? "bg-[#1B9157]" :
                                                                health === 'weak' ? "bg-[#F4D03F]" : "bg-red-500"
                                                        )} />
                                                        {health}
                                                    </div>
                                                    <div className="px-2.5 py-1 rounded-lg bg-white/50 text-[9px] font-black text-gray-500 flex items-center gap-1.5 border border-white/40">
                                                        <Calendar className="w-3 h-3 text-[#F4D03F]/40" />
                                                        {new Date(inspection.inspection_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Content Section */}
                                            <div className="flex-1 space-y-3 min-w-0 relative">
                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                                    {[
                                                        { l: 'Temp', v: `${inspection.temperature_celsius}°C`, i: Thermometer, c: 'text-red-500', b: 'bg-red-500/10' },
                                                        { l: 'Honey', v: `${inspection.honey_stores}kg`, i: Zap, c: 'text-[#F4D03F]', b: 'bg-[#F4D03F]/10' },
                                                        { l: 'Brood', v: (inspection.brood_pattern || 'Solid'), i: Target, c: 'text-[#1B9157]', b: 'bg-[#1B9157]/10' },
                                                        { l: 'Weather', v: (inspection.weather_condition || 'Sunny'), i: Sun, c: 'text-[#F4D03F]', b: 'bg-orange-400/10' }
                                                    ].map((s, idx) => {
                                                        const Icon = s.i;
                                                        return (
                                                            <div key={idx} className="bg-white/40 p-2.5 rounded-xl border border-white/40 shadow-sm">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <Icon className={cn("w-3 h-3", s.c)} />
                                                                    <span className="text-[8px] font-black text-gray-400">{s.l}</span>
                                                                </div>
                                                                <p className="text-[11px] font-black text-[#1A1A1A] tabular-nums tracking-tight">{s.v}</p>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                <div className="bg-[#F9F7F2] p-4 rounded-xl border border-[#F4D03F]/10">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <FileText className="w-3.5 h-3.5 text-[#F4D03F] opacity-40" />
                                                        <span className="text-[9px] font-bold tracking-wider text-gray-400">Findings</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                                                        {inspection.findings || 'No findings recorded for this inspection.'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Action Section */}
                                            <div className="xl:w-20 xl:border-l border-[#F4D03F]/10 pl-3 flex flex-row xl:flex-col items-center justify-center gap-2">
                                                <button
                                                    onClick={(e) => handleDelete(inspection.id, e)}
                                                    className="w-9 h-9 rounded-lg bg-[#F9F7F2] border border-[#F4D03F]/10 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(inspection)}
                                                    className="w-9 h-9 rounded-lg bg-[#F4D03F]/10 border border-[#F4D03F]/20 flex items-center justify-center text-[#F4D03F] hover:scale-105 transition-all"
                                                    aria-label="Edit inspection"
                                                    title="Edit"
                                                >
                                                    <ArrowRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </div>
            </motion.div>
        </BeeYieldPageShell>
    );
};

export default InspectionsView;
