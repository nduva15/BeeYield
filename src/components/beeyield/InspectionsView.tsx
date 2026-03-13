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
    Terminal, Target, Box, FileText, Lock, Activity, Waves, Hash, Shield, Microscope, RefreshCw, Bug
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import beeyieldService, { Apiary, Hive, Inspection } from '@/services/beeyieldService';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { glass, PageHeader, GlassStatCard } from './GlassTheme';

interface InspectionsViewProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
    initialParams?: { message?: string, action?: string } | null;
}

const InspectionsView: React.FC<InspectionsViewProps> = ({ onTabChange, initialParams }) => {
    // UI State
    const [isAddingInspection, setIsAddingInspection] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);
    const [editingId, setEditingId] = React.useState<string | null>(null);

    // Data State
    const [inspections, setInspections] = React.useState<Inspection[]>([]);
    const [apiaries, setApiaries] = React.useState<Apiary[]>([]);
    const [hives, setHives] = React.useState<Hive[]>([]);

    // Filters
    const [selectedPlaceId, setSelectedPlaceId] = React.useState<string>('all_places');
    const [selectedHiveId, setSelectedHiveId] = React.useState<string>('all_hives');
    const [searchQuery, setSearchQuery] = React.useState('');

    const { user, beeyieldUser } = useAuth();
    const userId = beeyieldUser?.id || user?.id;

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

    const resetForm = () => {
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
    };

    React.useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [apiariesData, hivesData, inspectionsData] = await Promise.all([
                    beeyieldService.getApiaries(),
                    beeyieldService.getHives(),
                    beeyieldService.getInspections()
                ]);

                if (userId) {
                    const filteredApiaries = apiariesData.filter(a => !a.user_id || a.user_id === userId);
                    const filteredHives = hivesData.filter(h => !h.user_id || h.user_id === userId);
                    const userHiveIds = new Set(filteredHives.map(h => h.id));
                    const filteredInspections = inspectionsData.filter(i => userHiveIds.has(i.hive_id));

                    setApiaries(filteredApiaries);
                    setHives(filteredHives);
                    setInspections(filteredInspections);
                } else {
                    setApiaries(apiariesData);
                    setHives(hivesData);
                    setInspections(inspectionsData);
                }
            } catch (error) {
                console.error("Error loading data", error);
                toast.error("Failed to load dashboard data");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [userId]);

    React.useEffect(() => {
        if (initialParams?.action === 'open_add_new') {
            setIsAddingInspection(true);
        } else if (initialParams?.action?.startsWith('filter_hive:')) {
            const hiveId = initialParams.action.split(':')[1];
            if (hiveId && hives.some(h => h.id === hiveId)) {
                setSelectedHiveId(hiveId);
                const hive = hives.find(h => h.id === hiveId);
                if (hive && hive.apiary_id) {
                    setSelectedPlaceId(hive.apiary_id);
                }
                toast.info(`Filtering logs for hive ${hive?.hive_code || hiveId}`);
            }
        }
    }, [initialParams, hives]);

    const handleSave = async () => {
        if (!formData.hive_id || formData.hive_id === 'all_hives') {
            toast.error("Please select a hive first.");
            return;
        }

        setIsSaving(true);
        const toastId = toast.loading('Saving inspection report...');
        try {
            let result;
            if (editingId) {
                result = await beeyieldService.updateInspection(editingId, formData);
            } else {
                result = await beeyieldService.createInspection(formData);
            }

            const { data, error } = result;
            if (error) throw error;

            if (data) {
                if (editingId) {
                    setInspections(inspections.map(i => i.id === editingId ? data : i));
                    toast.success('Diagnostic report synthesized.', { id: toastId });
                } else {
                    setInspections([data, ...inspections]);
                    toast.success('New health audit archived.', { id: toastId });
                }
            }

            setIsAddingInspection(false);
            resetForm();
        } catch (error: any) {
            console.error('Error saving inspection:', error);
            toast.error("Could not save the record. Please try again.", { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (inspection: Inspection) => {
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
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this inspection? This cannot be undone.")) return;

        const toastId = toast.loading('Deleting record...');
        try {
            const { error } = await beeyieldService.deleteInspection(id);
            if (error) throw error;
            setInspections(inspections.filter(i => i.id !== id));
            toast.success("Record deleted successfully.", { id: toastId });
        } catch (error) {
            console.error("Error deleting record:", error);
            toast.error("Failed to delete record.", { id: toastId });
        }
    };

    const filteredHivesForSelect = hives.filter(h =>
        selectedPlaceId === 'all_places' || h.apiary_id === selectedPlaceId
    );

    const filteredInspections = inspections.filter(i => {
        if (selectedHiveId !== 'all_hives' && i.hive_id !== selectedHiveId) return false;
        if (selectedPlaceId !== 'all_places') {
            const hive = hives.find(h => h.id === i.hive_id);
            if (!hive || hive.apiary_id !== selectedPlaceId) return false;
        }
        if (searchQuery) {
            const hive = hives.find(h => h.id === i.hive_id);
            const apiary = hive ? apiaries.find(a => a.id === hive.apiary_id) : null;
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

    const stats = React.useMemo(() => {
        return {
            total: inspections.length,
            healthy: inspections.filter(i => i.health_status === 'healthy').length,
            issues: inspections.filter(i => i.health_status !== 'healthy').length,
            thisMonth: inspections.filter(i => {
                const date = new Date(i.inspection_date);
                const now = new Date();
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            }).length
        };
    }, [inspections]);

    if (isAddingInspection) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={glass.page}
            >
                {/* ── Header ── */}
                <PageHeader
                    icon={Microscope}
                    label="Inspection_Log"
                    title={<>Hive <span className="text-[#F4D03F]">Diagnostic</span></>}
                    subtitle="Unit health synthesis and protocol registry."
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
                                {editingId ? 'Update_Report' : 'Archive_Log'}
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
                                    <h3 className="text-[10px] font-black text-[#1A1A1A] tracking-[0.2em] uppercase">Unit_Config</h3>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">IDENTIFICATION_SYNTHESIS</p>
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
                                        <SelectTrigger className={cn(glass.select, "h-10 border-white/40 bg-white/50")}>
                                            <div className="flex items-center gap-3">
                                                <MapPin className="w-4 h-4 text-[#F4D03F]/40" />
                                                <SelectValue placeholder="Deployment Site" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className={glass.selectContent}>
                                            {apiaries.map(a => <SelectItem key={a.id} value={a.id} className="uppercase font-bold text-xs">{a.name.toUpperCase()}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <Label className={glass.microLabel}>Active Unit</Label>
                                    <Select
                                        value={formData.hive_id}
                                        onValueChange={(val) => setFormData({ ...formData, hive_id: val })}
                                    >
                                        <SelectTrigger className={cn(glass.select, "h-10 border-white/40 bg-white/50")}>
                                            <div className="flex items-center gap-3">
                                                <Hexagon className="w-4 h-4 text-[#F4D03F]/40" />
                                                <SelectValue placeholder="Unit Logic Core" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className={glass.selectContent}>
                                            {filteredHivesForSelect.map(h => <SelectItem key={h.id} value={h.id} className="uppercase font-bold text-xs">UNIT #{h.hive_code}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className={glass.microLabel}>Diagnostic Date</Label>
                                    <div className="relative group/input">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F4D03F] opacity-40" />
                                        <Input
                                            type="date"
                                            value={formData.inspection_date}
                                            onChange={(e) => setFormData({ ...formData, inspection_date: e.target.value })}
                                            className={cn(glass.input, "h-10 pl-10 border-white/40 bg-white/50 focus:bg-white")}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className={glass.microLabel}>Inspector Signature</Label>
                                    <div className="relative group/input">
                                        <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F4D03F] opacity-40" />
                                        <Input
                                            placeholder="OFFICER_SIGNATURE"
                                            value={formData.inspector_name}
                                            onChange={(e) => setFormData({ ...formData, inspector_name: e.target.value })}
                                            className={cn(glass.input, "h-10 pl-10 border-white/40 bg-white/50 focus:bg-white text-[11px] font-black uppercase tracking-tight")}
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
                                    <h3 className="text-[10px] font-black text-[#1A1A1A] tracking-[0.2em] uppercase">Neural_Analysis</h3>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                                        POWERING_COLLECTIVE_HIVE_INTELLIGENCE
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
                                        <h2 className="text-[11px] font-black text-[#1A1A1A] tracking-[0.2em] uppercase">Biometric_Vitals</h2>
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">STANDARD_ASSESSMENT_PROTOCOL</p>
                                    </div>
                                </div>
                                <div className="flex bg-white/40 p-1 rounded-xl border border-white/40 gap-1 w-full sm:w-auto overflow-x-auto shadow-sm">
                                    {['healthy', 'weak', 'diseased', 'critical'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setFormData({ ...formData, health_status: s })}
                                            className={cn(
                                                "h-8 px-4 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap",
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
                                             { id: 'queen_seen', label: 'Queen Verified', sub: 'Visual Confirmation', icon: ShieldCheck, color: 'text-[#F4D03F]' },
                                             { id: 'eggs_seen', label: 'Matrix Presence', sub: 'Active Brood Core', icon: CheckCircle2, color: 'text-[#1B9157]' },
                                             { id: 'queen_cells_seen', label: 'Swarm Vector', sub: 'Anomaly Detection', icon: AlertCircle, color: 'text-red-500' }
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
                                                             "h-8 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
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
                                                <Label className={glass.microLabel}>Thermal Index (°C)</Label>
                                                <div className="relative group/input">
                                                    <Thermometer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500 opacity-40" />
                                                <Input
                                                        type="number"
                                                        value={formData.temperature_celsius}
                                                        onChange={(e) => setFormData({ ...formData, temperature_celsius: parseFloat(e.target.value) })}
                                                        className={cn(glass.input, "h-10 pl-10 border-white/40 bg-white/50 focus:bg-white")}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className={glass.microLabel}>Atmospheric State</Label>
                                                <Select value={formData.weather_condition} onValueChange={(v) => setFormData({ ...formData, weather_condition: v })}>
                                                    <SelectTrigger className={cn(glass.select, "h-10 border-white/40 bg-white/50")}>
                                                        <div className="flex items-center gap-3">
                                                            <Sun className="w-4 h-4 text-[#F4D03F]/40" />
                                                            <SelectValue />
                                                        </div>
                                                    </SelectTrigger>
                                                    <SelectContent className={glass.selectContent}>
                                                        {['sunny', 'cloudy', 'rainy', 'windy'].map(w => (
                                                            <SelectItem key={w} value={w} className="uppercase font-bold text-xs">{w.toUpperCase()}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className={glass.microLabel}>Honey Stores (kg)</Label>
                                                <div className="relative group/input">
                                                    <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F4D03F] opacity-40" />
                                                    <Input
                                                        type="number"
                                                        value={formData.honey_stores}
                                                        onChange={(e) => setFormData({ ...formData, honey_stores: parseFloat(e.target.value) })}
                                                        className={cn(glass.input, "h-10 pl-10 border-white/40 bg-white/50 focus:bg-white")}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className={glass.microLabel}>Pollen Reserves</Label>
                                                <div className="relative group/input">
                                                    <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400 opacity-40" />
                                                    <Input
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
                                                <Label className={cn(glass.microLabel, 'text-red-500/60')}>Varroa Density</Label>
                                                <div className="relative group/input">
                                                    <Microscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500 opacity-40" />
                                                    <Input
                                                        type="number"
                                                        value={formData.varroa_mite_count}
                                                        onChange={(e) => setFormData({ ...formData, varroa_mite_count: parseInt(e.target.value) })}
                                                        className={cn(glass.input, "h-10 pl-10 border-red-500/20 bg-red-500/5 focus:bg-white")}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className={glass.microLabel}>Beetle Threshold</Label>
                                                <div className="relative group/input">
                                                    <Bug className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground opacity-10" />
                                                    <Input
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
                                        <Label className={glass.microLabel}>Findings</Label>
                                        <Textarea
                                            placeholder="RECORD_OBSERVATIONS"
                                            value={formData.findings}
                                            onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                                            className={cn(glass.input, "h-auto py-2.5 min-h-[100px] border-white/40 bg-white/50 focus:bg-white text-[11px] font-black uppercase tracking-tight resize-none")}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={glass.microLabel}>Actions Taken</Label>
                                        <Textarea
                                            placeholder="RECORD_ACTIONS_PROTOCOLS"
                                            value={formData.actions_taken}
                                            onChange={(e) => setFormData({ ...formData, actions_taken: e.target.value })}
                                            className={cn(glass.input, "h-auto py-2.5 min-h-[100px] border-white/40 bg-white/50 focus:bg-white text-[11px] font-black uppercase tracking-tight resize-none")}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 border-t border-white/20 bg-white/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-4 h-4 text-[#F4D03F]/40" />
                                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">DATA_ENCRYPTION_ACTIVE</p>
                                </div>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <button
                                        onClick={() => { setIsAddingInspection(false); resetForm(); }}
                                        className={cn(glass.btnSecondary, "h-9 px-6 font-black uppercase tracking-[0.2em] text-[10px] rounded-xl")}
                                    >
                                        Discard
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className={cn(glass.btnPrimary, "flex-1 sm:flex-none h-9 px-8 font-black uppercase tracking-[0.2em] text-[10px]")}
                                    >
                                        {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                        {editingId ? 'Update_Report' : 'Archive_Log'}
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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={glass.page}
        >
            {/* Header */}
            <PageHeader
                icon={ClipboardList}
                label="Health_Surveillance"
                title={<>Diagnostic <span className="text-[#F4D03F]">Audit</span></>}
                subtitle="High-fidelity inspection reports and autonomous health monitoring."
                actions={
                    <button
                        onClick={() => { resetForm(); setIsAddingInspection(true); }}
                        className={glass.btnPrimary}
                    >
                        <Plus className="w-4 h-4" />
                        Log_Diagnostic
                    </button>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                <GlassStatCard label="Total Audit Logs" value={stats.total} icon={ClipboardList} index={0} />
                <GlassStatCard label="Optimal Health" value={stats.healthy} icon={CheckCircle2} index={1} color="text-[#1B9157]" />
                <GlassStatCard label="Critical Alerts" value={stats.issues} icon={AlertCircle} index={2} color="text-red-500" />
                <GlassStatCard label="Current Month" value={stats.thisMonth} icon={Activity} index={3} color="text-[#F4D03F]" />
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
                        className="h-10 pl-12 bg-white/50 border border-white/40 rounded-xl text-[11px] font-black tracking-widest text-[#1A1A1A] uppercase placeholder:text-gray-400 focus:bg-white transition-colors"
                    />
                </div>
                <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto p-1">
                    <Select value={selectedPlaceId} onValueChange={setSelectedPlaceId}>
                        <SelectTrigger className={cn(glass.select, "w-full md:w-44 h-10 border-white/40 bg-white/50 text-[11px] font-black uppercase tracking-widest")}>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-[#F4D03F]/40" />
                                <SelectValue placeholder="Location" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className={glass.selectContent}>
                            <SelectItem value="all_places" className="uppercase font-bold text-xs">All Locations</SelectItem>
                            {apiaries.map(a => <SelectItem key={a.id} value={a.id} className="uppercase font-bold text-xs">{a.name.toUpperCase()}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={selectedHiveId} onValueChange={setSelectedHiveId}>
                        <SelectTrigger className={cn(glass.select, "w-full md:w-40 h-10 border-white/40 bg-white/50 text-[11px] font-black uppercase tracking-widest")}>
                            <div className="flex items-center gap-2">
                                <Hexagon className="w-3.5 h-3.5 text-[#F4D03F]/40" />
                                <SelectValue placeholder="Unit" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className={glass.selectContent}>
                            <SelectItem value="all_hives" className="uppercase font-bold text-xs">All Hives</SelectItem>
                            {filteredHivesForSelect.map(h => <SelectItem key={h.id} value={h.id} className="uppercase font-bold text-xs">{h.hive_code}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </motion.div>

            {/* List */}
            <div className="relative z-10">
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
                        <h3 className="text-xl font-black text-[#1A1A1A] tracking-tight uppercase">Registry_Empty</h3>
                        <p className="text-[10px] font-bold text-gray-400 mt-2 max-w-md text-center uppercase tracking-widest">
                            NO_AUDIT_LOGS_DETECTED_FOR_CURRENT_PARAMETERS
                        </p>
                        <button onClick={() => { resetForm(); setIsAddingInspection(true); }} className={cn(glass.btnPrimary, "mt-6")}>
                            <Plus className="w-4 h-4" /> Log_Initial_Diagnostic
                        </button>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 border-l-4 border-l-[#F4D03F] pl-4">
                            <h2 className="text-[11px] font-black text-[#1A1A1A] tracking-[0.3em] uppercase leading-none">Diagnostic_<span className="text-[#F4D03F]">Archive</span></h2>
                            <div className="h-px flex-1 bg-gradient-to-r from-[#F4D03F]/10 to-transparent" />
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F4D03F]/10 text-[#F4D03F] border border-[#F4D03F]/20 rounded-xl">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#F4D03F] animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-wider">{filteredInspections.length} Logs</span>
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
                                                        <div className="flex items-center gap-1.5 text-[8px] text-gray-400 font-black uppercase tracking-widest">
                                                            <Hash className="w-3 h-3 text-[#F4D03F]/40" />
                                                            <span>{hive?.hive_code || '---'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 pt-3 border-t border-[#F4D03F]/10">
                                                    <div className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5",
                                                        health === 'healthy' ? "bg-[#1B9157]/10 text-[#1B9157]" :
                                                            health === 'weak' ? "bg-[#F4D03F]/10 text-[#F4D03F]" : "bg-red-500/10 text-red-500"
                                                    )}>
                                                        <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse",
                                                            health === 'healthy' ? "bg-[#1B9157]" :
                                                                health === 'weak' ? "bg-[#F4D03F]" : "bg-red-500"
                                                        )} />
                                                        {health}
                                                    </div>
                                                    <div className="px-2.5 py-1 rounded-lg bg-white/50 text-[9px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5 border border-white/40">
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
                                                    ].map((s, idx) => (
                                                        <div key={idx} className="bg-white/40 p-2.5 rounded-xl border border-white/40 shadow-sm">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <s.i className={cn("w-3 h-3", s.c)} />
                                                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">{s.l}</span>
                                                            </div>
                                                            <p className="text-[11px] font-black text-[#1A1A1A] tabular-nums tracking-tight uppercase">{s.v}</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="bg-[#F9F7F2] p-4 rounded-xl border border-[#F4D03F]/10">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <FileText className="w-3.5 h-3.5 text-[#F4D03F] opacity-40" />
                                                        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Findings</span>
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
    );
};

export default InspectionsView;
