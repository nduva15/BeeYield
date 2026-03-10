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
    Terminal, Target, Box, FileText, Lock, Activity, Waves, Hash, Shield, Microscope, RefreshCw, Microspectrum
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
                    toast.success('Inspection report updated.', { id: toastId });
                } else {
                    setInspections([data, ...inspections]);
                    toast.success('New inspection saved.', { id: toastId });
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

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 py-8 relative z-10">
                    {/* Left Column */}
                    <div className="lg:col-span-4 space-y-16">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={cn(glass.card, "p-0 overflow-hidden bg-white/60 dark:bg-[#0D0D0D]/60 backdrop-blur-3xl rounded-[5rem] relative")}
                        >
                            <div className="p-16 border-b border-white/5 bg-white/40 dark:bg-black/40 backdrop-blur-3xl flex items-center gap-10 relative z-10">
                                <div className="w-16 h-16 rounded-[2rem] bg-honey/10 flex items-center justify-center border border-honey/20 shadow-3xl">
                                    <Target className="w-10 h-10 text-honey" />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-4xl font-black italic text-foreground tracking-tighter uppercase leading-none italic">Hive <span className="text-honey">Details</span></h3>
                                    <p className={cn(glass.microLabel, 'opacity-40 italic text-[10px]')}>Select which hive you checked.</p>
                                </div>
                            </div>
                            <div className="p-16 space-y-12 relative z-10">
                                <div className="space-y-6">
                                    <Label className={cn(glass.microLabel, 'ml-10 opacity-40 uppercase italic')}>Location</Label>
                                    <Select
                                        value={hives.find(h => h.id === formData.hive_id)?.apiary_id || 'unselected'}
                                        onValueChange={(val) => {
                                            const firstHive = hives.find(h => h.apiary_id === val);
                                            if (firstHive) setFormData({ ...formData, hive_id: firstHive.id });
                                        }}
                                    >
                                        <SelectTrigger className={cn(glass.select)}>
                                            <div className="flex items-center gap-8">
                                                <MapPin className="w-8 h-8 text-honey opacity-30" />
                                                <SelectValue placeholder="Select Location" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className={glass.selectContent}>
                                            {apiaries.map(a => <SelectItem key={a.id} value={a.id} className="p-6 uppercase font-black text-[15px] italic rounded-2xl">{a.name.toUpperCase()}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-6">
                                    <Label className={cn(glass.microLabel, 'ml-10 opacity-40 uppercase italic')}>Hive ID</Label>
                                    <Select
                                        value={formData.hive_id}
                                        onValueChange={(val) => setFormData({ ...formData, hive_id: val })}
                                    >
                                        <SelectTrigger className={cn(glass.select)}>
                                            <div className="flex items-center gap-8">
                                                <Hexagon className="w-8 h-8 text-honey opacity-30" />
                                                <SelectValue placeholder="Select Hive" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className={glass.selectContent}>
                                            {filteredHivesForSelect.map(h => <SelectItem key={h.id} value={h.id} className="p-6 uppercase font-black text-[15px] italic rounded-2xl">{h.hive_code}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-1 gap-12">
                                    <div className="space-y-6">
                                        <Label className={cn(glass.microLabel, 'ml-10 opacity-40 uppercase italic')}>Date</Label>
                                        <div className="relative group/input">
                                            <Calendar className="absolute left-10 top-1/2 -translate-y-1/2 w-8 h-8 text-honey opacity-20 group-focus-within/input:opacity-100 transition-opacity" />
                                            <Input
                                                type="date"
                                                value={formData.inspection_date}
                                                onChange={(e) => setFormData({ ...formData, inspection_date: e.target.value })}
                                                className={cn(glass.input, "pl-24 text-2xl")}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <Label className={cn(glass.microLabel, 'ml-10 opacity-40 uppercase italic')}>Inspector Name</Label>
                                        <div className="relative group/input">
                                            <Terminal className="absolute left-10 top-1/2 -translate-y-1/2 w-8 h-8 text-honey opacity-20 group-focus-within/input:opacity-100 transition-opacity" />
                                            <Input
                                                placeholder="Enter your name"
                                                value={formData.inspector_name}
                                                onChange={(e) => setFormData({ ...formData, inspector_name: e.target.value })}
                                                className={cn(glass.input, "pl-24 text-2xl")}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <div className={cn(glass.card, 'bg-honey/[0.03] border-honey/30 p-16 rounded-[4rem] group relative overflow-hidden')}>
                            <div className="absolute inset-0 bg-honey/[0.01] animate-pulse pointer-events-none" />
                            <div className="relative z-10 space-y-10">
                                <div className="w-20 h-20 rounded-[2.5rem] bg-honey flex items-center justify-center shadow-4xl group-hover:rotate-[360deg] transition-all duration-1000">
                                    <Microscope className="w-10 h-10 text-white" />
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-4xl font-black italic text-foreground tracking-tighter uppercase leading-none">Important <span className="text-honey">Note</span></h3>
                                    <p className="text-xl font-black text-foreground/40 italic leading-relaxed border-l-4 border-honey/20 pl-12 uppercase tracking-tight">
                                        Recording these details helps our AI analyze your hive's growth and alert you to any potential issues before they become serious.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-8 space-y-16">
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={cn(glass.card, "p-0 overflow-hidden bg-white/60 dark:bg-[#0D0D0D]/60 backdrop-blur-3xl rounded-[5rem] relative")}
                        >
                            <div className={cn(glass.sectionHeader, 'p-16 border-b border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-3xl flex flex-col xl:flex-row items-center justify-between gap-16 relative z-10')}>
                                <div className="flex items-center gap-10">
                                    <div className="w-18 h-18 rounded-[2rem] bg-honey/10 flex items-center justify-center border border-honey/20 shadow-3xl">
                                        <HeartPulse className="w-10 h-10 text-honey animate-pulse" />
                                    </div>
                                    <div className="space-y-4">
                                        <h2 className="text-6xl font-black italic text-foreground tracking-tighter uppercase leading-none">Health <span className="text-honey">Check</span></h2>
                                        <p className={cn(glass.microLabel, 'opacity-40 uppercase italic')}>Select the overall health status of the hive.</p>
                                    </div>
                                </div>
                                <div className="flex bg-black/10 dark:bg-black/60 backdrop-blur-3xl p-3 rounded-[4rem] border border-white/5 gap-3 shadow-4xl w-full xl:w-fit">
                                    {['healthy', 'weak', 'diseased', 'critical'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setFormData({ ...formData, health_status: s })}
                                            className={cn(
                                                "h-16 flex-1 xl:w-40 rounded-[3rem] text-[12px] font-black uppercase tracking-[0.2em] transition-all italic",
                                                formData.health_status === s
                                                    ? "bg-honey text-black shadow-4xl"
                                                    : "text-foreground/30 hover:text-honey hover:bg-white/5"
                                            )}
                                        >
                                            {s === 'healthy' ? 'Healthy' : s === 'weak' ? 'Weak' : s === 'diseased' ? 'Check' : 'Critical'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-20 space-y-20 relative z-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                                    <div className="space-y-12">
                                        {[
                                            { id: 'queen_seen', label: 'Queen Seen', sub: 'Visual verification', icon: ShieldCheck, color: 'text-honey' },
                                            { id: 'eggs_seen', label: 'Eggs Seen', sub: 'New brood present', icon: CheckCircle2, color: 'text-emerald-500' },
                                            { id: 'queen_cells_seen', label: 'Queen Cells', sub: 'Swarm potential', icon: AlertCircle, color: 'text-red-500' }
                                        ].map((item, i) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between p-12 rounded-[4.5rem] bg-black/5 dark:bg-black/40 border border-white/5 hover:border-honey/60 transition-all duration-700 shadow-4xl"
                                            >
                                                <div className="flex items-center gap-10">
                                                    <div className="w-20 h-20 rounded-[2.5rem] border border-white/5 bg-white/40 dark:bg-black/40 flex items-center justify-center shadow-4xl">
                                                        <item.icon className={cn("w-10 h-10", item.color)} />
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <span className="text-4xl font-black italic text-foreground tracking-tighter uppercase leading-none">{item.label}</span>
                                                        <span className={cn(glass.microLabel, 'opacity-30 italic')}>{item.sub}</span>
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={(formData as any)[item.id]}
                                                    onCheckedChange={(val) => setFormData({ ...formData, [item.id]: val })}
                                                    className="data-[state=checked]:bg-honey scale-[2.2] shadow-4xl mr-8"
                                                />
                                            </div>
                                        ))}

                                        <div className="pt-8 space-y-8">
                                            <Label className={cn(glass.microLabel, 'ml-10 opacity-40 uppercase italic')}>Temperament</Label>
                                            <div className="flex bg-black/10 dark:bg-black/60 backdrop-blur-3xl p-3 rounded-[4rem] border border-white/5 gap-3 shadow-4xl">
                                                {['calm', 'nervous', 'aggressive'].map(t => (
                                                    <button
                                                        key={t}
                                                        onClick={() => setFormData({ ...formData, temperament: t })}
                                                        className={cn(
                                                            "flex-1 h-18 rounded-[3rem] text-[12px] font-black uppercase tracking-[0.2em] transition-all italic",
                                                            formData.temperament === t
                                                                ? "bg-honey text-black shadow-4xl"
                                                                : "text-foreground/30 hover:text-honey hover:bg-white/5"
                                                        )}
                                                    >
                                                        {t.toUpperCase()}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-16">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            <div className="space-y-6">
                                                <Label className={cn(glass.microLabel, 'ml-10 opacity-40 uppercase italic')}>Temperature (°C)</Label>
                                                <div className="relative">
                                                    <Thermometer className="absolute left-10 top-1/2 -translate-y-1/2 w-8 h-8 text-red-500 opacity-20" />
                                                    <Input
                                                        type="number"
                                                        value={formData.temperature_celsius}
                                                        onChange={(e) => setFormData({ ...formData, temperature_celsius: parseFloat(e.target.value) })}
                                                        className={cn(glass.input, 'pl-24 text-4xl tabular-nums')}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                <Label className={cn(glass.microLabel, 'ml-10 opacity-40 uppercase italic')}>Weather</Label>
                                                <Select value={formData.weather_condition} onValueChange={(v) => setFormData({ ...formData, weather_condition: v })}>
                                                    <SelectTrigger className={cn(glass.select)}>
                                                        <div className="flex items-center gap-8">
                                                            <Sun className="w-8 h-8 text-honey opacity-30" />
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

                                        <div className="grid grid-cols-2 gap-12">
                                            <div className="space-y-6">
                                                <Label className={cn(glass.microLabel, 'ml-10 opacity-40 uppercase italic')}>Honey Stores (kg)</Label>
                                                <div className="relative">
                                                    <Zap className="absolute left-10 top-1/2 -translate-y-1/2 w-8 h-8 text-honey opacity-20" />
                                                    <Input
                                                        type="number"
                                                        value={formData.honey_stores}
                                                        onChange={(e) => setFormData({ ...formData, honey_stores: parseFloat(e.target.value) })}
                                                        className={cn(glass.input, 'pl-24 text-4xl tabular-nums')}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                <Label className={cn(glass.microLabel, 'ml-10 opacity-40 uppercase italic')}>Pollen Reserves</Label>
                                                <div className="relative">
                                                    <Sun className="absolute left-10 top-1/2 -translate-y-1/2 w-8 h-8 text-orange-400 opacity-20" />
                                                    <Input
                                                        type="number"
                                                        value={formData.pollen_stores}
                                                        onChange={(e) => setFormData({ ...formData, pollen_stores: parseFloat(e.target.value) })}
                                                        className={cn(glass.input, 'pl-24 text-4xl tabular-nums')}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-12">
                                            <div className="space-y-6">
                                                <Label className={cn(glass.microLabel, 'ml-10 opacity-40 uppercase italic text-red-500 font-black')}>Varroa Count</Label>
                                                <div className="relative">
                                                    <Microscope className="absolute left-10 top-1/2 -translate-y-1/2 w-8 h-8 text-red-500 opacity-20" />
                                                    <Input
                                                        type="number"
                                                        value={formData.varroa_mite_count}
                                                        onChange={(e) => setFormData({ ...formData, varroa_mite_count: parseInt(e.target.value) })}
                                                        className={cn(glass.input, 'pl-24 text-4xl italic bg-red-500/5 border-red-500/20 text-red-500 tabular-nums')}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                <Label className={cn(glass.microLabel, 'ml-10 opacity-40 uppercase italic')}>Beetle Count</Label>
                                                <div className="relative">
                                                    <Box className="absolute left-10 top-1/2 -translate-y-1/2 w-8 h-8 text-foreground opacity-10" />
                                                    <Input
                                                        type="number"
                                                        value={formData.small_hive_beetles_seen}
                                                        onChange={(e) => setFormData({ ...formData, small_hive_beetles_seen: parseInt(e.target.value) })}
                                                        className={cn(glass.input, 'pl-24 text-4xl tabular-nums')}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-20 pt-16 border-t border-white/10">
                                    <div className="space-y-8">
                                        <Label className={cn(glass.microLabel, 'ml-16 opacity-40 uppercase italic')}>What did you see? (Findings)</Label>
                                        <Textarea
                                            placeholder="Write your findings here..."
                                            value={formData.findings}
                                            onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                                            className={cn(glass.input, 'min-h-[300px] rounded-[4.5rem] p-16 pl-24 text-3xl font-black italic bg-black/5 dark:bg-black/40 border-none resize-none')}
                                        />
                                    </div>
                                    <div className="space-y-8">
                                        <Label className={cn(glass.microLabel, 'ml-16 opacity-40 uppercase italic')}>What did you do? (Actions Taken)</Label>
                                        <Textarea
                                            placeholder="Write the actions you took..."
                                            value={formData.actions_taken}
                                            onChange={(e) => setFormData({ ...formData, actions_taken: e.target.value })}
                                            className={cn(glass.input, 'min-h-[300px] rounded-[4.5rem] p-16 pl-24 text-3xl font-black italic bg-black/5 dark:bg-black/40 border-none resize-none')}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-16 border-t border-white/10 bg-white/40 dark:bg-black/60 backdrop-blur-3xl flex flex-col sm:flex-row justify-between items-center rounded-b-[5rem]">
                                <div className="flex items-center gap-10 opacity-10 px-10 mb-10 sm:mb-0">
                                    <Lock className="w-10 h-10" />
                                    <p className="text-[14px] font-black uppercase tracking-[0.5em] italic">Data protected and synced.</p>
                                </div>
                                <div className="flex gap-10">
                                    <button
                                        onClick={() => { setIsAddingInspection(false); resetForm(); }}
                                        className={glass.btnSecondary}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className={cn(glass.btnPrimary, "h-24 px-24 text-3xl bg-honey text-black shadow-4xl rounded-[3rem]")}
                                    >
                                        {isSaving ? <RefreshCw className="w-12 h-12 animate-spin" /> : <ShieldCheck className="w-12 h-12" />}
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
                label="Health Tracking"
                title={<>Health <span className="text-honey">Audit</span></>}
                subtitle="View and manage your hive inspection history to ensure your colonies stay healthy and productive."
                actions={
                    <button
                        onClick={() => { resetForm(); setIsAddingInspection(true); }}
                        className={cn(glass.btnPrimary, "h-24 bg-honey text-black shadow-4xl rounded-[3.5rem] px-16 font-black italic text-2xl transition-all uppercase flex items-center justify-center gap-10 group/btn pl-24")}
                    >
                        <Plus className="w-10 h-10 group-hover/btn:rotate-90 transition-transform duration-1000" />
                        Execute New Audit
                    </button>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                <GlassStatCard label="Total Audit Logs" value={stats.total} icon={ClipboardList} index={0} />
                <GlassStatCard label="Healthy Status" value={stats.healthy} icon={CheckCircle2} index={1} color="text-emerald-500" />
                <GlassStatCard label="Alerts" value={stats.issues} icon={AlertCircle} index={2} color="text-red-500" />
                <GlassStatCard label="This Month" value={stats.thisMonth} icon={Calendar} index={3} color="text-honey" />
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

                                    return (
                                        <motion.div
                                            key={inspection.id}
                                            initial={{ opacity: 0, x: -50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05, duration: 1 }}
                                            onClick={() => handleEdit(inspection)}
                                            className={cn(glass.card, 'p-12 h-auto cursor-pointer hover:border-honey/60 hover:shadow-4xl transition-all duration-1000 flex flex-col xl:flex-row gap-16 overflow-hidden')}
                                        >
                                            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-honey/[0.02] rounded-full blur-[120px] pointer-events-none" />

                                            {/* Details Section */}
                                            <div className="w-full xl:w-[480px] shrink-0 space-y-12">
                                                <div className="flex items-center gap-10">
                                                    <div className="w-24 h-24 rounded-[3rem] bg-honey/10 flex items-center justify-center border border-honey/20 transition-all duration-1000 shadow-4xl group-hover:scale-110 group-hover:rotate-12">
                                                        <Hexagon className="w-12 h-12 text-honey" />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <h3 className="text-5xl font-black italic text-foreground tracking-tighter uppercase leading-none group-hover:text-honey transition-colors">{apiary?.name || 'Local Archive'}</h3>
                                                        <div className="flex items-center gap-6 text-[14px] opacity-20 font-black italic uppercase tracking-[0.4em]">
                                                            <Hash className="w-4 h-4 text-honey" />
                                                            <span>Hive: {hive?.hive_code || '---'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-10 pt-10 border-t border-white/10">
                                                    <div className={cn("px-10 py-5 rounded-[3rem] font-black italic text-2xl uppercase tracking-tighter shadow-4xl flex items-center justify-center gap-6",
                                                        inspection.health_status === 'healthy' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                                                            inspection.health_status === 'weak' ? "bg-honey/10 text-honey border border-honey/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                                                    )}>
                                                        <div className={cn("w-3.5 h-3.5 rounded-full animate-pulse",
                                                            inspection.health_status === 'healthy' ? "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,1)]" :
                                                                inspection.health_status === 'weak' ? "bg-honey shadow-[0_0_20px_rgba(251,191,36,1)]" : "bg-red-500 shadow-[0_0_20px_rgba(239,68,68,1)]"
                                                        )} />
                                                        {inspection.health_status.toUpperCase()}
                                                    </div>
                                                    <div className="px-10 py-5 rounded-[3rem] bg-white/5 dark:bg-black/60 border border-white/5 font-black italic text-2xl uppercase tracking-tighter shadow-4xl flex items-center justify-center gap-6">
                                                        <Calendar className="w-8 h-8 text-honey/40" />
                                                        {new Date(inspection.inspection_date).toLocaleDateString([], { month: 'short', day: 'numeric' }).toUpperCase()}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Content Section */}
                                            <div className="flex-1 space-y-12 min-w-0">
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                                                    {[
                                                        { l: 'Temp', v: `${inspection.temperature_celsius}°C`, i: Thermometer, c: 'text-red-500', b: 'bg-red-500/10' },
                                                        { l: 'Honey', v: `${inspection.honey_stores}kg`, i: Zap, c: 'text-honey', b: 'bg-honey/10' },
                                                        { l: 'Tempera', v: inspection.temperament, i: Activity, c: 'text-emerald-500', b: 'bg-emerald-500/10' },
                                                        { l: 'Weather', v: inspection.weather_condition, i: Sun, c: 'text-orange-400', b: 'bg-orange-400/10' }
                                                    ].map((s, idx) => (
                                                        <div key={idx} className="bg-black/5 dark:bg-black/40 p-10 rounded-[4.5rem] border border-white/5 group-hover:border-honey/20 transition-all duration-1000 shadow-4xl">
                                                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-3xl", s.b)}>
                                                                <s.i className={cn("w-8 h-8", s.c)} />
                                                            </div>
                                                            <p className="text-3xl font-black italic text-foreground tracking-tighter leading-none mb-3 tabular-nums">{s.v}</p>
                                                            <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em] italic">{s.l}</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="bg-black/10 dark:bg-black/40 p-14 rounded-[5rem] border border-white/5 relative overflow-hidden group-hover:border-honey/20 transition-all">
                                                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-honey/10 to-transparent" />
                                                    <div className="flex items-center gap-8 mb-6">
                                                        <FileText className="w-8 h-8 text-honey/20" />
                                                        <span className="text-[12px] font-black italic uppercase tracking-[0.4em] opacity-30">Findings</span>
                                                    </div>
                                                    <p className="text-2xl font-black italic text-foreground/40 leading-[1.3] line-clamp-2 uppercase tracking-tight">
                                                        {inspection.findings || 'No specific findings documented.'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Action Section */}
                                            <div className="xl:w-48 xl:border-l border-white/5 pl-4 flex flex-col items-center justify-center gap-12 group-hover:bg-red-500/[0.02] transition-colors rounded-r-[5rem]">
                                                <button
                                                    onClick={(e) => handleDelete(inspection.id, e)}
                                                    className="w-24 h-24 rounded-[3rem] bg-white/5 dark:bg-black/40 border border-white/10 flex items-center justify-center text-foreground/20 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/40 hover:scale-125 transition-all duration-700 shadow-4xl group-active/del:scale-75"
                                                    title="Purge Record"
                                                >
                                                    <Trash2 className="w-12 h-12" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(inspection)}
                                                    className="w-24 h-24 rounded-[3rem] bg-honey/10 border border-honey/20 flex items-center justify-center text-honey hover:scale-125 hover:rotate-90 transition-all duration-700 shadow-4xl"
                                                >
                                                    <ArrowRight className="w-12 h-12" />
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
