import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
    Plus,
    Search,
    Loader2,
    Activity,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    Calendar,
    ClipboardList,
    Trash2,
    Bot,
    ArrowRight,
    MapPin,
    Thermometer,
    Zap,
    Wind,
    Sun,
    HeartPulse,
    ChevronLeft,
    ChevronRight,
    SearchX,
    Hexagon,
    Terminal,
    Target,
    Activity as ActivityIcon,
    Box,
    Sparkles,
    FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { beeyieldService, Apiary, Hive, Inspection } from '@/services/beeyieldService';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

interface InspectionsViewProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
    initialParams?: { message?: string, action?: string } | null;
}

const InspectionsView: React.FC<InspectionsViewProps> = ({ initialParams }) => {
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
            toast.error("Please select a hive for this inspection");
            return;
        }

        setIsSaving(true);
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
                    toast.success('Record archived successfully');
                } else {
                    setInspections([data, ...inspections]);
                    toast.success('New inspection record created');
                }
            }

            setIsAddingInspection(false);
            resetForm();
        } catch (error: any) {
            console.error('Error saving inspection:', error);
            toast.error(error.message || "Failed to commit record");
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
        if (!confirm("Remove this inspection record indefinitely?")) return;

        try {
            const { error } = await beeyieldService.deleteInspection(id);
            if (error) throw error;
            setInspections(inspections.filter(i => i.id !== id));
            toast.success("Record purged from registry");
        } catch (error) {
            console.error("Error deleting record:", error);
            toast.error("Failed to delete record");
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
            <div className="space-y-12 pb-32 animate-in fade-in slide-in-from-bottom-6 duration-700">
                {/* Custom Page Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-slate-100 dark:border-white/5 pb-8">
                    <div className="flex items-center gap-8">
                        <Button
                            variant="ghost"
                            onClick={() => { setIsAddingInspection(false); resetForm(); }}
                            className="h-16 w-16 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 hover:text-amber-500 shadow-sm transition-all active:scale-95"
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </Button>
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100 dark:border-amber-900/40">
                                <Terminal className="w-3.5 h-3.5" />
                                {editingId ? 'Registry Refactoring Protocol' : 'Biometric Audit Initialization'}
                            </div>
                            <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic">Colony <span className="text-amber-500">Audit</span></h1>
                            <p className="text-sm font-medium text-slate-500 dark:text-white/30 italic lowercase px-1">systematic structural and biological health verification for asset hivefleet.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left Panel: Scope & Metadata */}
                    <div className="lg:col-span-4 space-y-10">
                        <Card className="rounded-[3rem] border border-slate-200/60 dark:border-white/5 bg-white dark:bg-white/5 shadow-2xl shadow-black/5 overflow-hidden">
                            <CardHeader className="p-10 pb-0 flex flex-row items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center border border-slate-100 dark:border-white/10">
                                    <Target className="w-5 h-5 text-slate-400" />
                                </div>
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Registry Scope</CardTitle>
                            </CardHeader>
                            <CardContent className="p-10 space-y-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.3em] italic ml-1">Target Sector</Label>
                                    <Select
                                        value={hives.find(h => h.id === formData.hive_id)?.apiary_id || 'unselected'}
                                        onValueChange={(val) => {
                                            const firstHive = hives.find(h => h.apiary_id === val);
                                            if (firstHive) setFormData({ ...formData, hive_id: firstHive.id });
                                        }}
                                    >
                                        <SelectTrigger className="h-14 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 font-black text-[11px] uppercase tracking-widest outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50">
                                            <SelectValue placeholder="Precision Locus" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-slate-200 dark:border-white/10 shadow-2xl">
                                            {apiaries.map(a => <SelectItem key={a.id} value={a.id} className="uppercase font-black text-[10px] p-4 tracking-widest">{a.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.3em] italic ml-1">Archive Asset</Label>
                                    <Select
                                        value={formData.hive_id}
                                        onValueChange={(val) => setFormData({ ...formData, hive_id: val })}
                                    >
                                        <SelectTrigger className="h-14 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 font-black text-[11px] uppercase tracking-widest outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50">
                                            <SelectValue placeholder="Asset Identification" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-slate-200 dark:border-white/10 shadow-2xl">
                                            {hives
                                                .filter(h => !hives.find(xh => xh.id === formData.hive_id)?.apiary_id || h.apiary_id === hives.find(xh => xh.id === formData.hive_id)?.apiary_id)
                                                .map(h => <SelectItem key={h.id} value={h.id} className="uppercase font-black text-[10px] p-4 tracking-widest">HIVE_REF_{h.hive_code}</SelectItem>)
                                            }
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.3em] italic ml-1">Archive Date</Label>
                                    <Input
                                        type="date"
                                        value={formData.inspection_date}
                                        onChange={(e) => setFormData({ ...formData, inspection_date: e.target.value })}
                                        className="h-14 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 font-black text-[11px] outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 transition-all px-6"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.3em] italic ml-1">Audit Personnel</Label>
                                    <Input
                                        placeholder="PERSONNEL_ID..."
                                        value={formData.inspector_name}
                                        onChange={(e) => setFormData({ ...formData, inspector_name: e.target.value })}
                                        className="h-14 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 font-black text-[11px] uppercase tracking-widest outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 transition-all px-6"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="bg-neutral-900 border border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                            <div className="relative z-10 flex items-start gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center border-4 border-black shadow-xl">
                                    <Bot className="w-8 h-8 text-black" />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="font-black text-white text-xl uppercase tracking-tighter italic leading-none">Neural Assistant</h3>
                                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed italic">
                                        SUBMISSION_PROTOCOL: COMMITTING THIS DATA WILL RE-CALIBRATE ASSET VITALITY AND VARROA PROFILES.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Biometric Data */}
                    <div className="lg:col-span-8 space-y-12">
                        <Card className="rounded-[3rem] border border-slate-200/60 dark:border-white/5 bg-white dark:bg-white/5 shadow-2xl shadow-black/5 overflow-hidden">
                            <CardHeader className="p-12 pb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 border-b border-slate-100 dark:border-white/5">
                                <div>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                            <HeartPulse className="w-8 h-8 text-emerald-500" />
                                        </div>
                                        <CardTitle className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
                                            Health <span className="text-amber-500">Vector</span>
                                        </CardTitle>
                                    </div>
                                    <p className="text-slate-400 dark:text-white/20 font-black text-[10px] uppercase tracking-[0.4em] px-1 italic">Industrial Colony Biometrics protocol v4.1</p>
                                </div>
                                <div className="flex bg-slate-50 dark:bg-black/20 rounded-2xl p-1.5 gap-1.5 border border-slate-100 dark:border-white/5 shadow-inner">
                                    {['healthy', 'weak', 'diseased', 'critical'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setFormData({ ...formData, health_status: s })}
                                            className={cn(
                                                "h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                formData.health_status === s
                                                    ? "bg-neutral-900 dark:bg-amber-600 text-white shadow-xl"
                                                    : "text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5"
                                            )}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </CardHeader>
                            <CardContent className="p-12 space-y-12 bg-transparent">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                    {/* Swaps & Toggles */}
                                    <div className="space-y-8">
                                        {[
                                            { id: 'queen_seen', label: 'Queen Verified', sub: 'VISUAL CONFIRMATION', icon: ShieldCheck, color: 'text-amber-500' },
                                            { id: 'eggs_seen', label: 'Oviposition Delta', sub: 'EGG PRESENCE DETECTED', icon: CheckCircle2, color: 'text-emerald-500' },
                                            { id: 'queen_cells_seen', label: 'Swarm Marker', sub: 'QUEEN CELLS ACTIVE', icon: AlertCircle, color: 'text-red-500' }
                                        ].map(item => (
                                            <div key={item.id} className="flex items-center justify-between p-8 rounded-[2rem] bg-slate-50/50 dark:bg-black/10 border border-slate-100 dark:border-white/5 hover:border-amber-500/50 transition-all group shadow-sm hover:shadow-2xl hover:shadow-amber-500/5">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                                                        <item.icon className={cn("w-7 h-7", item.color)} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">{item.label}</span>
                                                        <span className="text-[9px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.3em] italic">{item.sub}</span>
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={(formData as any)[item.id]}
                                                    onCheckedChange={(val) => setFormData({ ...formData, [item.id]: val })}
                                                    className="data-[state=checked]:bg-emerald-500 scale-125"
                                                />
                                            </div>
                                        ))}

                                        <div className="pt-4 space-y-4">
                                            <Label className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.4em] italic ml-2">Temperament Profile</Label>
                                            <div className="flex bg-slate-50 dark:bg-black/20 rounded-2xl p-1.5 gap-1.5 border border-slate-100 dark:border-white/5 shadow-inner">
                                                {['calm', 'nervous', 'aggressive'].map(t => (
                                                    <button
                                                        key={t}
                                                        onClick={() => setFormData({ ...formData, temperament: t })}
                                                        className={cn(
                                                            "flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                            formData.temperament === t
                                                                ? "bg-neutral-900 dark:bg-amber-600 text-white shadow-xl"
                                                                : "text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5"
                                                        )}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Physical Metrics */}
                                    <div className="space-y-10">
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-3 group">
                                                <Label className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.4em] italic ml-2">Core Temp (°C)</Label>
                                                <div className="relative">
                                                    <Thermometer className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 group-hover:animate-pulse" />
                                                    <Input
                                                        type="number"
                                                        value={formData.temperature_celsius}
                                                        onChange={(e) => setFormData({ ...formData, temperature_celsius: parseFloat(e.target.value) })}
                                                        className="h-14 pl-14 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 font-black text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 transition-all text-sm tabular-nums"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.4em] italic ml-2">Sky Condition</Label>
                                                <Select value={formData.weather_condition} onValueChange={(v) => setFormData({ ...formData, weather_condition: v })}>
                                                    <SelectTrigger className="h-14 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 font-black text-[11px] uppercase tracking-widest outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl border-slate-200 dark:border-white/10 shadow-2xl">
                                                        <SelectItem value="sunny" className="p-4 uppercase font-black text-[10px] tracking-widest">Sunny</SelectItem>
                                                        <SelectItem value="cloudy" className="p-4 uppercase font-black text-[10px] tracking-widest">Cloudy</SelectItem>
                                                        <SelectItem value="rainy" className="p-4 uppercase font-black text-[10px] tracking-widest">Rainy</SelectItem>
                                                        <SelectItem value="windy" className="p-4 uppercase font-black text-[10px] tracking-widest">Windy</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-3 group">
                                                <Label className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.4em] italic ml-2">Honey Mass (kg)</Label>
                                                <div className="relative">
                                                    <Zap className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                                                    <Input
                                                        type="number"
                                                        value={formData.honey_stores}
                                                        onChange={(e) => setFormData({ ...formData, honey_stores: parseFloat(e.target.value) })}
                                                        className="h-14 pl-14 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 font-black text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 transition-all text-sm tabular-nums"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3 group">
                                                <Label className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.4em] italic ml-2">Pollen Ratio</Label>
                                                <div className="relative">
                                                    <Sun className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500" />
                                                    <Input
                                                        type="number"
                                                        value={formData.pollen_stores}
                                                        onChange={(e) => setFormData({ ...formData, pollen_stores: parseFloat(e.target.value) })}
                                                        className="h-14 pl-14 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 font-black text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 transition-all text-sm tabular-nums"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-3 group">
                                                <Label className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em] italic ml-2">Varroa Count</Label>
                                                <div className="relative">
                                                    <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                                                    <Input
                                                        type="number"
                                                        value={formData.varroa_mite_count}
                                                        onChange={(e) => setFormData({ ...formData, varroa_mite_count: parseInt(e.target.value) })}
                                                        className="h-14 pl-14 rounded-2xl border-2 border-red-500/30 bg-red-500/5 font-black text-red-600 outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all text-sm tabular-nums"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3 group">
                                                <Label className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.4em] italic ml-2">SH Beetles</Label>
                                                <div className="relative">
                                                    <Box className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <Input
                                                        type="number"
                                                        value={formData.small_hive_beetles_seen}
                                                        onChange={(e) => setFormData({ ...formData, small_hive_beetles_seen: parseInt(e.target.value) })}
                                                        className="h-14 pl-14 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 font-black text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 transition-all text-sm tabular-nums"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-10 pt-6">
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.4em] italic ml-2">Diagnostic Findings</Label>
                                        <Textarea
                                            placeholder="INDUSTRIAL ANOMALIES, BROOD QUALITY, ODOUR STREAM..."
                                            value={formData.findings}
                                            onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                                            className="min-h-[160px] rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 p-8 font-black text-[11px] uppercase tracking-widest outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 transition-all resize-none shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.4em] italic ml-2">Biometric Interventions (Actions Taken)</Label>
                                        <Textarea
                                            placeholder="SPLITS PERFORMED, SUPERS MODIFIED, THERMAL TREATMENT..."
                                            value={formData.actions_taken}
                                            onChange={(e) => setFormData({ ...formData, actions_taken: e.target.value })}
                                            className="min-h-[160px] rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 p-8 font-black text-[11px] uppercase tracking-widest outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 transition-all resize-none shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-12">
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="h-20 px-16 rounded-[2rem] bg-neutral-900 dark:bg-amber-600 text-white hover:bg-black dark:hover:bg-amber-500 gap-5 font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] italic border-none"
                                    >
                                        {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <ShieldCheck className="w-6 h-6 text-emerald-400" />}
                                        {editingId ? 'Commit Registry Refactor' : 'Finalize & Archive Industrial Log'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20 honeycomb-bg min-h-screen p-8 -m-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2.5 px-5 py-2 bg-honey/10 text-honey rounded-full text-[10px] font-black uppercase tracking-widest border border-honey/20 backdrop-blur-sm">
                        <FileText className="w-3.5 h-3.5" />
                        Colony Diagnostic Archive
                    </div>
                    <h1 className="text-6xl font-serif font-black text-honey tracking-tight leading-none">Health <span className="text-foreground">Logs</span></h1>
                    <p className="text-sm font-medium text-muted-foreground max-w-lg leading-relaxed uppercase tracking-wider opacity-70">
                        Universal registry for systematic colony biometric monitoring and historical health archiving.
                    </p>
                </div>
                <Button
                    onClick={() => {
                        resetForm();
                        setIsAddingInspection(true);
                    }}
                    className="h-16 px-10 rounded-[2rem] bg-gradient-amber text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-honey/20 transition-all hover:scale-[1.02] active:scale-[0.98] gap-4"
                >
                    <Plus className="w-6 h-6" />
                    New Inspection
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                    { label: 'Total Logs', value: stats.total, icon: ClipboardList, color: 'text-slate-400', bg: 'bg-white' },
                    { label: 'Healthy State', value: stats.healthy, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-white' },
                    { label: 'Stress Signals', value: stats.issues, icon: AlertCircle, color: 'text-red-500', bg: 'bg-white' },
                    { label: 'Current Cycle', value: stats.thisMonth, icon: Calendar, color: 'text-amber-500', bg: 'bg-white' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/5 p-8 rounded-[2.5rem] shadow-2xl shadow-black/5 hover:scale-[1.02] transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-amber-500/10 transition-all" />
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-black/20 flex items-center justify-center border border-slate-100 dark:border-white/10 group-hover:border-amber-500/50 transition-colors shadow-sm">
                                <stat.icon className={cn("w-6 h-6 stroke-[2] transition-colors", stat.color)} />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.3em] italic">{stat.label}</p>
                        </div>
                        <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Filter Section */}
            <div className="bg-white dark:bg-white/5 rounded-[3rem] border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-black/5 p-10">
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                        <Input
                            placeholder="SEARCH REGISTRY..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-14 pl-14 pr-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 font-black text-[10px] uppercase tracking-widest outline-none focus-visible:ring-4 focus-visible:ring-amber-500/10 focus-visible:border-amber-500/50 transition-all text-slate-900 dark:text-white"
                        />
                    </div>
                    <div className="w-full lg:w-72">
                        <Select value={selectedPlaceId} onValueChange={setSelectedPlaceId}>
                            <SelectTrigger className="h-14 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 font-black text-[10px] uppercase tracking-widest outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50">
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-4 h-4 text-emerald-500" />
                                    <SelectValue placeholder="Network Focus" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-200 dark:border-white/10 shadow-2xl">
                                <SelectItem value="all_places" className="p-4 font-black uppercase text-[10px] tracking-widest">Global Sector Archive</SelectItem>
                                {apiaries.map(a => <SelectItem key={a.id} value={a.id} className="p-4 font-black uppercase text-[10px] tracking-widest">{a.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-full lg:w-72">
                        <Select value={selectedHiveId} onValueChange={setSelectedHiveId}>
                            <SelectTrigger className="h-14 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 font-black text-[10px] uppercase tracking-widest outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50">
                                <div className="flex items-center gap-3">
                                    <Hexagon className="w-4 h-4 text-amber-500" />
                                    <SelectValue placeholder="Colony Filter" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-200 dark:border-white/10 shadow-2xl">
                                <SelectItem value="all_hives" className="p-4 font-black uppercase text-[10px] tracking-widest">All Industrial Units</SelectItem>
                                {filteredHivesForSelect.map(h => <SelectItem key={h.id} value={h.id} className="p-4 font-black uppercase text-[10px] tracking-widest">HIVE_REF_{h.hive_code}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* List Content */}
            {isLoading ? (
                <div className="space-y-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 rounded-[2.5rem] bg-slate-50 dark:bg-white/5 animate-pulse border border-slate-100 dark:border-white/5" />
                    ))}
                </div>
            ) : filteredInspections.length === 0 ? (
                <div className="py-32 text-center flex flex-col items-center gap-8 bg-white dark:bg-white/5 rounded-[3.5rem] border border-dashed border-slate-200 dark:border-white/10 shadow-xl shadow-black/5">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 dark:bg-black/20 flex items-center justify-center border border-slate-100 dark:border-white/5 shadow-inner">
                        <SearchX className="w-12 h-12 text-slate-300 dark:text-white/10" />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Registry Null Result</h3>
                        <p className="text-slate-400 dark:text-white/20 font-black uppercase text-[10px] tracking-[0.4em] italic max-w-md mx-auto leading-relaxed">Adjust filters or initialize a new diagnostic session to populate the industrial archive.</p>
                    </div>
                    <Button onClick={() => { resetForm(); setIsAddingInspection(true); }} className="h-14 px-10 rounded-2xl bg-neutral-900 dark:bg-amber-600 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 border-none">
                        <Plus className="w-4 h-4" /> Initialize New Audit
                    </Button>
                </div>
            ) : (
                <div className="space-y-10">
                    <div className="flex items-center gap-6 px-4">
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Event <span className="text-amber-500">Stream</span></h3>
                        <div className="h-px flex-1 bg-slate-100 dark:bg-white/5" />
                        <div className="px-4 py-1.5 bg-slate-50 dark:bg-white/5 rounded-full border border-slate-100 dark:border-white/10 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
                            {filteredInspections.length} Industrial Records Found
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        <AnimatePresence mode="popLayout">
                            {filteredInspections.map((inspection, index) => {
                                const hive = hives.find(h => h.id === inspection.hive_id);
                                const apiary = hive ? apiaries.find(a => a.id === hive.apiary_id) : null;

                                return (
                                    <motion.div
                                        key={inspection.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05, duration: 0.5 }}
                                    >
                                        <Card
                                            className="rounded-[3rem] border border-slate-200/60 dark:border-white/5 bg-white dark:bg-white/5 hover:bg-amber-500/[0.02] dark:hover:bg-amber-500/[0.03] transition-all cursor-pointer group shadow-2xl shadow-black/5 hover:shadow-amber-500/5 hover:-translate-y-1 relative overflow-hidden"
                                            onClick={() => handleEdit(inspection)}
                                        >
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                                            <CardContent className="p-10 relative z-10">
                                                <div className="flex flex-col lg:flex-row gap-12">
                                                    {/* Hive & Basic Context */}
                                                    <div className="w-full lg:w-80 flex-shrink-0">
                                                        <div className="flex items-start gap-6">
                                                            <div className="w-16 h-16 rounded-[1.25rem] bg-slate-50 dark:bg-black/40 flex items-center justify-center border border-slate-100 dark:border-white/10 group-hover:bg-neutral-900 dark:group-hover:bg-amber-600 transition-all shadow-xl group-hover:scale-110">
                                                                <Hexagon className="w-8 h-8 text-amber-500 group-hover:text-white transition-colors" />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <h3 className="font-black text-slate-900 dark:text-white text-2xl uppercase tracking-tighter leading-none italic pt-1">
                                                                    {apiary?.name || 'Local Sector'}
                                                                </h3>
                                                                <p className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.3em] italic">ASSET_REF: {hive?.hive_code || '---'}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-wrap gap-3 mt-10">
                                                            <div className={cn(
                                                                "px-4 py-1.5 rounded-full border font-black text-[9px] uppercase tracking-widest shadow-sm",
                                                                inspection.health_status === 'healthy' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" :
                                                                    inspection.health_status === 'weak' ? "bg-amber-500/10 border-amber-500/20 text-amber-600" :
                                                                        "bg-red-500/10 border-red-500/20 text-red-600"
                                                            )}>
                                                                {inspection.health_status} STATUS
                                                            </div>
                                                            <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-full text-[9px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest italic shadow-sm">
                                                                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                                                                {new Date(inspection.inspection_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Metrics Snapshot */}
                                                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-10 py-2 border-l border-slate-100 dark:border-white/5 pl-12">
                                                        <div className="space-y-3">
                                                            <p className="text-[10px] text-slate-400 dark:text-white/20 uppercase font-black tracking-[0.4em] italic">HONEY_FLUX</p>
                                                            <div className="flex items-center gap-3">
                                                                <Zap className="w-5 h-5 text-amber-500" />
                                                                <span className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter tabular-nums italic">{inspection.honey_stores || 0} KG</span>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <p className="text-[10px] text-slate-400 dark:text-white/20 uppercase font-black tracking-[0.4em] italic">VARROA_LOAD</p>
                                                            <div className="flex items-center gap-3">
                                                                <ShieldCheck className={cn("w-5 h-5", (inspection.varroa_mite_count || 0) > 3 ? "text-red-500" : "text-emerald-500")} />
                                                                <span className={cn("font-black text-2xl tracking-tighter tabular-nums italic", (inspection.varroa_mite_count || 0) > 3 ? "text-red-500" : "text-slate-900 dark:text-white")}>
                                                                    {inspection.varroa_mite_count || 0}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <p className="text-[10px] text-slate-400 dark:text-white/20 uppercase font-black tracking-[0.4em] italic">CORE_TEMP</p>
                                                            <div className="flex items-center gap-3">
                                                                <Thermometer className="w-5 h-5 text-orange-500" />
                                                                <span className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter tabular-nums italic">{inspection.temperature_celsius || '--'}°C</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col justify-center">
                                                            <div className="flex flex-wrap gap-2">
                                                                {inspection.queen_seen && <div className="w-9 h-9 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-center text-[11px] font-black text-amber-600 shadow-sm" title="Queen Presence Verified">Q</div>}
                                                                {inspection.eggs_seen && <div className="w-9 h-9 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center text-[11px] font-black text-emerald-600 shadow-sm" title="Biometric Eggs Verified">E</div>}
                                                                {inspection.queen_cells_seen && <div className="w-9 h-9 rounded-xl border border-red-500/30 bg-red-500/10 flex items-center justify-center text-[11px] font-black text-red-600 shadow-sm" title="Anomalous Queen Cells">QC</div>}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Actions & Navigation */}
                                                    <div className="flex flex-row lg:flex-col justify-between items-center lg:items-end gap-6 border-t font-black lg:border-t-0 lg:border-l border-slate-100 dark:border-white/5 pt-10 lg:pt-0 lg:pl-12">
                                                        <div className="w-14 h-14 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-neutral-900 dark:group-hover:bg-amber-600 group-hover:text-white transition-all shadow-xl group-hover:scale-105">
                                                            <ArrowRight className="w-6 h-6" />
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-10 w-10 text-slate-300 hover:text-red-500 hover:bg-red-500/5 group/delete transition-colors"
                                                            onClick={(e) => handleDelete(inspection.id, e)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InspectionsView;
