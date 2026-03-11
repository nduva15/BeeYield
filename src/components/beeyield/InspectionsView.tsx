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
                className={cn(glass.page, "p-12 -m-8 space-y-20")}
            >
                {/* ── Header ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-16 border-b border-white/5 pb-20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-honey/[0.04] rounded-full blur-[100px] -mr-40 -mt-20 pointer-events-none" />
                    <div className="flex items-center gap-14 relative z-10">
                        <button
                            onClick={() => { setIsAddingInspection(false); resetForm(); }}
                            className={cn(glass.btnSecondary, "h-24 w-24 p-0 rounded-[2.5rem] bg-white dark:bg-black/60 shadow-4xl border-white/5 flex items-center justify-center hover:text-honey hover:scale-110 active:scale-95 transition-all duration-700")}
                        >
                            <ChevronLeft className="w-12 h-12" />
                        </button>
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-4 px-6 py-2 bg-honey/10 rounded-full border border-honey/20 shadow-2xl skew-x-[-15deg]">
                                <Activity className="w-5 h-5 text-honey animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] skew-x-[15deg] italic text-honey">Inspection Report</span>
                            </div>
                            <h1 className="text-7xl font-black italic text-foreground tracking-tighter uppercase leading-none italic">Hive <span className="text-honey">Check</span></h1>
                            <p className={cn(glass.microLabel, 'opacity-40 italic tracking-[0.4em] font-black uppercase text-[12px] border-l-4 border-honey/20 pl-8')}>Record your observations for this hive to track its health over time.</p>
                        </div>
                    </div>
                    <div className="flex gap-10 relative z-10">
                        <button
                            onClick={() => { setIsAddingInspection(false); resetForm(); }}
                            className={cn(glass.btnSecondary, "h-22 px-14 font-black italic uppercase tracking-[0.3em] text-lg rounded-[2.5rem] bg-white dark:bg-black/60 border-white/5 shadow-4xl hover:text-red-500 transition-all duration-700")}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={cn(glass.btnPrimary, "h-22 px-24 bg-honey text-black shadow-4xl rounded-[3rem] font-black italic text-2xl transition-all uppercase flex items-center justify-center gap-10 group/commit pl-28")}
                        >
                            {isSaving ? <RefreshCw className="w-12 h-12 animate-spin" /> : <ShieldCheck className="w-12 h-12" />}
                            {editingId ? 'Update Report' : 'Save Report'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">
                    {/* Left Column: Metadata & Unit ID */}
                    <div className="lg:col-span-4 space-y-12">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={cn(glass.card, "p-0 overflow-visible bg-white/20 dark:bg-black/60 rounded-[4rem] group/card")}
                        >
                            <div className="p-12 border-b border-white/5 bg-white/40 dark:bg-black/40 backdrop-blur-3xl rounded-t-[4rem] flex items-center gap-10 relative">
                                <div className="w-14 h-14 rounded-2xl bg-honey/10 flex items-center justify-center border border-honey/20 shadow-4xl group-hover/card:rotate-12 transition-transform">
                                    <Target className="w-8 h-8 text-honey" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-4xl font-black italic text-foreground tracking-tighter uppercase leading-none">Unit <span className="text-honey">ID</span></h3>
                                    <p className={cn(glass.microLabel, 'opacity-30 italic')}>Identifier Synthesis</p>
                                </div>
                            </div>
                            <div className="p-12 space-y-10">
                                <div className="space-y-4">
                                    <Label className={glass.microLabel}>Deployment Site</Label>
                                    <Select
                                        value={hives.find(h => h.id === formData.hive_id)?.apiary_id || 'unselected'}
                                        onValueChange={(val) => {
                                            const firstHive = hives.find(h => h.apiary_id === val);
                                            if (firstHive) setFormData({ ...formData, hive_id: firstHive.id });
                                        }}
                                    >
                                        <SelectTrigger className={glass.select}>
                                            <div className="flex items-center gap-6">
                                                <MapPin className="w-6 h-6 text-honey opacity-20" />
                                                <SelectValue placeholder="Location" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className={glass.selectContent}>
                                            {apiaries.map(a => <SelectItem key={a.id} value={a.id} className="p-6 uppercase font-black text-[15px] italic rounded-2xl">{a.name.toUpperCase()}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-4">
                                    <Label className={glass.microLabel}>Active Unit</Label>
                                    <Select
                                        value={formData.hive_id}
                                        onValueChange={(val) => setFormData({ ...formData, hive_id: val })}
                                    >
                                        <SelectTrigger className={glass.select}>
                                            <div className="flex items-center gap-6">
                                                <Hexagon className="w-6 h-6 text-honey opacity-20" />
                                                <SelectValue placeholder="Hive ID" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className={glass.selectContent}>
                                            {filteredHivesForSelect.map(h => <SelectItem key={h.id} value={h.id} className="p-6 uppercase font-black text-[15px] italic rounded-2xl">UNIT #{h.hive_code}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-4">
                                    <Label className={glass.microLabel}>Diagnostic Date</Label>
                                    <div className="relative group/input">
                                        <Calendar className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-honey opacity-20 group-focus-within/input:opacity-100 transition-opacity" />
                                        <Input
                                            type="date"
                                            value={formData.inspection_date}
                                            onChange={(e) => setFormData({ ...formData, inspection_date: e.target.value })}
                                            className={cn(glass.input, "pl-20 text-xl")}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label className={glass.microLabel}>Inspector Signature</Label>
                                    <div className="relative group/input">
                                        <Terminal className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-honey opacity-20 group-focus-within/input:opacity-100 transition-opacity" />
                                        <Input
                                            placeholder="SIGNATURE REQUIRED"
                                            value={formData.inspector_name}
                                            onChange={(e) => setFormData({ ...formData, inspector_name: e.target.value })}
                                            className={cn(glass.input, "pl-20 text-xl tracking-widest")}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <div className={cn(glass.card, 'bg-honey/[0.03] border-honey/20 p-12 rounded-[3.5rem] group relative overflow-hidden')}>
                            <div className="absolute inset-0 bg-honey/[0.01] animate-pulse pointer-events-none" />
                            <div className="relative z-10 space-y-6">
                                <div className="w-16 h-16 rounded-2xl bg-honey flex items-center justify-center shadow-4xl group-hover:rotate-12 transition-transform">
                                    <Microscope className="w-8 h-8 text-black" />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-3xl font-black italic text-foreground tracking-tighter uppercase leading-none">Neural <span className="text-honey">Analysis</span></h3>
                                    <p className="text-lg font-black text-foreground/30 italic leading-relaxed border-l-4 border-honey/20 pl-8 uppercase tracking-tight">
                                        Data integrity is critical. These observations power the collective hive intelligence model.
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
                            className={cn(glass.card, "p-0 overflow-visible bg-white/20 dark:bg-black/60 rounded-[4rem] relative group/vitals")}
                        >
                            <div className={cn(glass.sectionHeader, 'p-12 border-b border-white/5 bg-white/40 dark:bg-black/60 rounded-t-[4rem] flex flex-col xl:flex-row items-center justify-between gap-12 relative z-10')}>
                                <div className="flex items-center gap-8">
                                    <div className="w-16 h-16 rounded-2xl bg-honey/10 flex items-center justify-center border border-honey/20 shadow-4xl group-hover/vitals:scale-110 transition-transform">
                                        <HeartPulse className="w-8 h-8 text-honey animate-pulse" />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-5xl font-black italic text-foreground tracking-tighter uppercase leading-none">Biometric <span className="text-honey">Vitals</span></h2>
                                        <p className={cn(glass.microLabel, 'opacity-30 italic')}>Standard Assessment Protocol</p>
                                    </div>
                                </div>
                                <div className="flex bg-black/10 dark:bg-black/40 backdrop-blur-3xl p-2 rounded-[3rem] border border-white/5 gap-2 shadow-4xl w-full xl:w-fit">
                                    {['healthy', 'weak', 'diseased', 'critical'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setFormData({ ...formData, health_status: s })}
                                            className={cn(
                                                "h-14 flex-1 xl:w-36 rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all italic",
                                                formData.health_status === s
                                                    ? "bg-honey text-black shadow-4xl"
                                                    : "text-foreground/30 hover:text-honey hover:bg-white/5"
                                            )}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-16 space-y-16 relative z-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                    <div className="space-y-12">
                                        {[
                                            { id: 'queen_seen', label: 'Queen Verified', sub: 'Visual Confirmation', icon: ShieldCheck, color: 'text-honey' },
                                            { id: 'eggs_seen', label: 'Matrix Presence', sub: 'Active Brood Core', icon: CheckCircle2, color: 'text-emerald-500' },
                                            { id: 'queen_cells_seen', label: 'Swarm Vector', sub: 'Anomaly Detection', icon: AlertCircle, color: 'text-red-500' }
                                        ].map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between p-10 rounded-[3.5rem] bg-black/5 dark:bg-black/40 border border-white/5 hover:border-honey/40 transition-all shadow-4xl"
                                            >
                                                <div className="flex items-center gap-8">
                                                    <div className="w-16 h-16 rounded-2xl border border-white/5 bg-white/40 dark:bg-black/40 flex items-center justify-center shadow-4xl">
                                                        <item.icon className={cn("w-8 h-8", item.color)} />
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-3xl font-black italic text-foreground tracking-tighter uppercase leading-none">{item.label}</span>
                                                        <span className={cn(glass.microLabel, 'opacity-20 italic')}>{item.sub}</span>
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={(formData as any)[item.id]}
                                                    onCheckedChange={(val) => setFormData({ ...formData, [item.id]: val })}
                                                    className="data-[state=checked]:bg-honey scale-[1.8] shadow-4xl mr-4"
                                                />
                                            </div>
                                        ))}

                                        <div className="pt-4 space-y-6">
                                            <Label className={glass.microLabel}>Temperament Profile</Label>
                                            <div className="grid grid-cols-3 bg-black/10 dark:bg-black/40 p-2 rounded-[3rem] border border-white/5 gap-2 shadow-4xl">
                                                {['calm', 'nervous', 'aggressive'].map(t => (
                                                    <button
                                                        key={t}
                                                        onClick={() => setFormData({ ...formData, temperament: t })}
                                                        className={cn(
                                                            "h-14 rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all italic",
                                                            formData.temperament === t
                                                                ? "bg-honey text-black shadow-4xl"
                                                                : "text-foreground/30 hover:text-honey hover:bg-white/5"
                                                        )}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-12">
                                        <div className="grid grid-cols-2 gap-10">
                                            <div className="space-y-4">
                                                <Label className={glass.microLabel}>Thermal Index (°C)</Label>
                                                <div className="relative group/input">
                                                    <Thermometer className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-red-500 opacity-20 group-focus-within/input:opacity-100 transition-all" />
                                                    <Input
                                                        type="number"
                                                        value={formData.temperature_celsius}
                                                        onChange={(e) => setFormData({ ...formData, temperature_celsius: parseFloat(e.target.value) })}
                                                        className={cn(glass.input, 'pl-18 text-3xl tabular-nums')}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <Label className={glass.microLabel}>Atmospheric State</Label>
                                                <Select value={formData.weather_condition} onValueChange={(v) => setFormData({ ...formData, weather_condition: v })}>
                                                    <SelectTrigger className={glass.select}>
                                                        <div className="flex items-center gap-6">
                                                            <Sun className="w-6 h-6 text-honey opacity-20" />
                                                            <SelectValue />
                                                        </div>
                                                    </SelectTrigger>
                                                    <SelectContent className={glass.selectContent}>
                                                        {['sunny', 'cloudy', 'rainy', 'windy'].map(w => (
                                                            <SelectItem key={w} value={w} className="p-6 uppercase font-black text-[15px] italic rounded-2xl">{w.toUpperCase()}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-10">
                                            <div className="space-y-4">
                                                <Label className={glass.microLabel}>Honey Stores (kg)</Label>
                                                <div className="relative group/input">
                                                    <Zap className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-honey opacity-20 group-focus-within/input:opacity-100 transition-all" />
                                                    <Input
                                                        type="number"
                                                        value={formData.honey_stores}
                                                        onChange={(e) => setFormData({ ...formData, honey_stores: parseFloat(e.target.value) })}
                                                        className={cn(glass.input, 'pl-18 text-3xl tabular-nums')}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <Label className={glass.microLabel}>Pollen Reserves</Label>
                                                <div className="relative group/input">
                                                    <Box className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-orange-400 opacity-20 group-focus-within/input:opacity-100 transition-all" />
                                                    <Input
                                                        type="number"
                                                        value={formData.pollen_stores}
                                                        onChange={(e) => setFormData({ ...formData, pollen_stores: parseFloat(e.target.value) })}
                                                        className={cn(glass.input, 'pl-18 text-3xl tabular-nums')}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-10">
                                            <div className="space-y-4">
                                                <Label className={cn(glass.microLabel, 'text-red-500/60')}>Varroa Density</Label>
                                                <div className="relative group/input">
                                                    <Microscope className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-red-500 opacity-20 group-focus-within/input:opacity-100 transition-all" />
                                                    <Input
                                                        type="number"
                                                        value={formData.varroa_mite_count}
                                                        onChange={(e) => setFormData({ ...formData, varroa_mite_count: parseInt(e.target.value) })}
                                                        className={cn(glass.input, 'pl-18 text-3xl italic bg-red-500/5 border-red-500/20 text-red-500 tabular-nums')}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <Label className={glass.microLabel}>Beetle Threshold</Label>
                                                <div className="relative group/input">
                                                    <Bug className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-foreground opacity-10 group-focus-within/input:opacity-100 transition-all" />
                                                    <Input
                                                        type="number"
                                                        value={formData.small_hive_beetles_seen}
                                                        onChange={(e) => setFormData({ ...formData, small_hive_beetles_seen: parseInt(e.target.value) })}
                                                        className={cn(glass.input, 'pl-18 text-3xl tabular-nums')}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-12 pt-12 border-t border-white/5">
                                    <div className="space-y-6">
                                        <Label className={glass.microLabel}>Observational Synthesis (Findings)</Label>
                                        <Textarea
                                            placeholder="ARCHIVE OBSERVATIONS..."
                                            value={formData.findings}
                                            onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                                            className={cn(glass.input, 'min-h-[250px] rounded-[3.5rem] p-12 pl-16 text-2xl font-black italic bg-black/5 dark:bg-black/40 border-none resize-none placeholder:opacity-5')}
                                        />
                                    </div>
                                    <div className="space-y-6">
                                        <Label className={glass.microLabel}>Strategic Countermeasures (Actions)</Label>
                                        <Textarea
                                            placeholder="RECORD ACTIONS..."
                                            value={formData.actions_taken}
                                            onChange={(e) => setFormData({ ...formData, actions_taken: e.target.value })}
                                            className={cn(glass.input, 'min-h-[250px] rounded-[3.5rem] p-12 pl-16 text-2xl font-black italic bg-black/5 dark:bg-black/40 border-none resize-none placeholder:opacity-5')}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-12 border-t border-white/5 bg-white/40 dark:bg-black/60 backdrop-blur-3xl flex flex-col sm:flex-row justify-between items-center rounded-b-[4rem] gap-8">
                                <div className="flex items-center gap-6 opacity-20 px-8">
                                    <Shield className="w-8 h-8" />
                                    <p className="text-[12px] font-black uppercase tracking-[0.4em] italic">Encryption Layer Active</p>
                                </div>
                                <div className="flex gap-6 w-full sm:w-auto">
                                    <button
                                        onClick={() => { setIsAddingInspection(false); resetForm(); }}
                                        className={cn(glass.btnSecondary, "h-20 px-12 text-lg")}
                                    >
                                        Abort
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className={cn(glass.btnPrimary, "h-20 px-16 text-xl bg-honey text-black shadow-4xl rounded-[3rem] min-w-[280px]")}
                                    >
                                        {isSaving ? <RefreshCw className="w-10 h-10 animate-spin" /> : <ShieldCheck className="w-10 h-10" />}
                                        {editingId ? 'Update Report' : 'Save Report'}
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
                label="Health Surveillance"
                title={<>Diagnostic <span className="text-honey">Audit</span></>}
                subtitle="High-fidelity inspection reports and autonomous health monitoring for your colony fleet."
                actions={
                    <button
                        onClick={() => { resetForm(); setIsAddingInspection(true); }}
                        className={cn(glass.btnPrimary, "h-22 bg-honey text-black shadow-4xl rounded-[3.5rem] px-18 font-black italic text-2xl transition-all uppercase flex items-center justify-center gap-10 group/btn")}
                    >
                        <Plus className="w-10 h-10 group-hover/btn:rotate-90 transition-transform duration-1000" />
                        Execute Audit
                    </button>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
                <GlassStatCard label="Total Audit Logs" value={stats.total} icon={ClipboardList} index={0} />
                <GlassStatCard label="Optimal Health" value={stats.healthy} icon={CheckCircle2} index={1} color="text-emerald-500" />
                <GlassStatCard label="Critical Alerts" value={stats.issues} icon={AlertCircle} index={2} color="text-red-500" />
                <GlassStatCard label="Current Month" value={stats.thisMonth} icon={Activity} index={3} color="text-honey" />
            </div>

            {/* Filter Bar */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className={glass.filterBar}
            >
                <div className="flex-1 w-full relative group/search">
                    <Search className="absolute left-10 top-1/2 -translate-y-1/2 w-10 h-10 text-honey opacity-20 group-focus-within/search:opacity-100 transition-all duration-700" />
                    <Input
                        placeholder="Search reports by inspector or findings..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn(glass.input, 'h-24 pl-26 px-12 italic font-black text-3xl bg-transparent border-none shadow-none normal-case placeholder:opacity-5')}
                    />
                </div>
                <div className="flex flex-col md:flex-row gap-10 w-full xl:w-auto">
                    <Select value={selectedPlaceId} onValueChange={setSelectedPlaceId}>
                        <SelectTrigger className={cn(glass.select, 'h-24 w-full md:w-[350px] px-12 rounded-[3.5rem] italic font-black text-xl')}>
                            <div className="flex items-center gap-10">
                                <MapPin className="w-8 h-8 text-honey opacity-30" />
                                <SelectValue placeholder="All Locations" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className={glass.selectContent}>
                            <SelectItem value="all_places" className="p-6 font-black uppercase text-[15px] italic rounded-2xl">All Locations</SelectItem>
                            {apiaries.map(a => <SelectItem key={a.id} value={a.id} className="p-6 font-black uppercase text-[15px] italic rounded-2xl">{a.name.toUpperCase()}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={selectedHiveId} onValueChange={setSelectedHiveId}>
                        <SelectTrigger className={cn(glass.select, 'h-24 w-full md:w-[300px] px-12 rounded-[3.5rem] italic font-black text-xl')}>
                            <div className="flex items-center gap-10">
                                <Hexagon className="w-8 h-8 text-honey opacity-30" />
                                <SelectValue placeholder="All Hives" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className={glass.selectContent}>
                            <SelectItem value="all_hives" className="p-6 font-black uppercase text-[15px] italic rounded-2xl">All Hives</SelectItem>
                            {filteredHivesForSelect.map(h => <SelectItem key={h.id} value={h.id} className="p-6 font-black uppercase text-[15px] italic rounded-2xl">{h.hive_code}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </motion.div>

            {/* List */}
            <div className="relative z-10">
                {isLoading ? (
                    <div className="space-y-16">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={cn(glass.skeleton, 'h-[400px] rounded-[5rem]')} />
                        ))}
                    </div>
                ) : filteredInspections.length === 0 ? (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={glass.emptyState}>
                        <div className="w-64 h-64 rounded-[6rem] bg-honey/5 border border-honey/20 flex items-center justify-center mb-16 shadow-4xl">
                            <SearchX className="w-32 h-32 text-honey opacity-20" />
                        </div>
                        <h3 className="text-7xl font-black italic text-foreground tracking-tighter uppercase leading-none opacity-40">No Reports Found</h3>
                        <p className="text-2xl font-black opacity-20 italic max-w-2xl mx-auto border-l-8 border-honey/20 pl-16 text-center uppercase tracking-widest mt-10">
                            You haven't recorded any inspections yet. Create your first report to start tracking hive health.
                        </p>
                        <button onClick={() => { resetForm(); setIsAddingInspection(true); }} className={cn(glass.btnPrimary, "h-24 px-24 mt-16")}>
                            <Plus className="w-12 h-12" /> Create Report
                        </button>
                    </motion.div>
                ) : (
                    <div className="space-y-16">
                        <div className="flex items-center gap-10 border-l-8 border-honey/40 pl-16 group">
                            <h2 className="text-6xl font-black italic text-foreground tracking-tighter uppercase leading-none">Diagnostic <span className="text-honey">Archive</span></h2>
                            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent mx-14" />
                            <div className={cn(glass.badge, 'bg-honey/10 text-honey border-honey/20 px-12 py-4 rounded-full shadow-4xl skew-x-[-15deg]')}>
                                <div className="skew-x-[15deg] font-black italic uppercase text-[16px] tracking-[0.4em] flex items-center gap-6">
                                    <div className="w-3.5 h-3.5 rounded-full bg-honey animate-pulse" />
                                    {filteredInspections.length} Reports
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-14">
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
                                            className={cn(glass.card, 'p-10 h-auto cursor-pointer hover:border-honey/60 hover:shadow-4xl transition-all duration-1000 flex flex-col xl:flex-row gap-12 overflow-hidden group/item')}
                                        >
                                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-honey/[0.02] rounded-full blur-[100px] pointer-events-none" />

                                            {/* Details Section */}
                                            <div className="w-full xl:w-[400px] shrink-0 space-y-10 relative">
                                                <div className="flex items-center gap-8">
                                                    <div className="w-20 h-20 rounded-[2.5rem] bg-black/5 dark:bg-black/60 flex items-center justify-center border border-white/5 transition-all duration-1000 shadow-4xl group-hover/item:scale-110 group-hover/item:rotate-12">
                                                        <Hexagon className="w-10 h-10 text-honey opacity-40 group-hover/item:opacity-100 transition-opacity" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <h3 className="text-4xl font-black italic text-foreground tracking-tighter uppercase leading-none group-hover/item:text-honey transition-colors">{apiary?.name || 'Local Archive'}</h3>
                                                        <div className="flex items-center gap-4 text-[12px] opacity-20 font-black italic uppercase tracking-[0.4em]">
                                                            <Hash className="w-4 h-4 text-honey" />
                                                            <span>UNIT: #{hive?.hive_code || '---'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5">
                                                    <div className={cn("px-8 py-4 rounded-[2.5rem] font-black italic text-xl uppercase tracking-tighter shadow-4xl flex items-center justify-center gap-4",
                                                        health === 'healthy' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                                                            health === 'weak' ? "bg-honey/10 text-honey border border-honey/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                                                    )}>
                                                        <div className={cn("w-3 h-3 rounded-full animate-pulse",
                                                            health === 'healthy' ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" :
                                                                health === 'weak' ? "bg-honey shadow-[0_0_15px_rgba(251,191,36,0.5)]" : "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                                                        )} />
                                                        {health.toUpperCase()}
                                                    </div>
                                                    <div className="px-8 py-4 rounded-[2.5rem] bg-white/5 dark:bg-black/80 border border-white/5 font-black italic text-xl uppercase tracking-tighter shadow-4xl flex items-center justify-center gap-4">
                                                        <Calendar className="w-6 h-6 text-honey opacity-20" />
                                                        {new Date(inspection.inspection_date).toLocaleDateString([], { month: 'short', day: 'numeric' }).toUpperCase()}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Content Section */}
                                            <div className="flex-1 space-y-10 min-w-0 relative">
                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                                                    {[
                                                        { l: 'Temp', v: `${inspection.temperature_celsius}°C`, i: Thermometer, c: 'text-red-500', b: 'bg-red-500/10' },
                                                        { l: 'Honey', v: `${inspection.honey_stores}kg`, i: Zap, c: 'text-honey', b: 'bg-honey/10' },
                                                        { l: 'B.Matrix', v: (inspection.brood_pattern || 'Solid').toUpperCase(), i: Target, c: 'text-emerald-500', b: 'bg-emerald-500/10' },
                                                        { l: 'Weather', v: (inspection.weather_condition || 'Sunny').toUpperCase(), i: Sun, c: 'text-orange-400', b: 'bg-orange-400/10' }
                                                    ].map((s, idx) => (
                                                        <div key={idx} className="bg-white/5 dark:bg-black/60 p-8 rounded-[3.5rem] border border-white/5 group-hover/item:border-honey/20 transition-all duration-1000 shadow-4xl">
                                                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-3xl", s.b)}>
                                                                <s.i className={cn("w-6 h-6", s.c)} />
                                                            </div>
                                                            <p className="text-2xl font-black italic text-foreground tracking-tighter leading-none mb-2 tabular-nums">{s.v}</p>
                                                            <p className="text-[9px] font-black opacity-20 uppercase tracking-[0.2em] italic">{s.l}</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="bg-black/5 dark:bg-black/60 p-10 rounded-[4rem] border border-white/5 relative overflow-hidden group-hover/item:border-honey/20 transition-all">
                                                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-honey/10 to-transparent" />
                                                    <div className="flex items-center gap-6 mb-4">
                                                        <FileText className="w-6 h-6 text-honey opacity-20" />
                                                        <span className="text-[10px] font-black italic uppercase tracking-[0.3em] opacity-30">Diagnostic Synthesis</span>
                                                    </div>
                                                    <p className="text-xl font-black text-foreground/30 leading-relaxed line-clamp-2 uppercase italic tracking-tight">
                                                        {inspection.findings || 'No specific diagnostic findings archived for this cycle.'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Action Section */}
                                            <div className="xl:w-40 xl:border-l border-white/5 pl-4 flex flex-col items-center justify-center gap-10 group-hover/item:bg-white/5 transition-colors rounded-r-[4rem] relative">
                                                <button
                                                    onClick={(e) => handleDelete(inspection.id, e)}
                                                    className="w-20 h-20 rounded-3xl bg-white/5 dark:bg-black/60 border border-white/5 flex items-center justify-center text-foreground/20 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 hover:scale-110 transition-all shadow-4xl"
                                                    title="Purge Record"
                                                >
                                                    <Trash2 className="w-10 h-10" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(inspection)}
                                                    className="w-20 h-20 rounded-3xl bg-honey/10 border border-honey/20 flex items-center justify-center text-honey hover:scale-110 hover:rotate-90 transition-all shadow-4xl"
                                                >
                                                    <ArrowRight className="w-10 h-10" />
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
