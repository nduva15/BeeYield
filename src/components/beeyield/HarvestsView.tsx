import React from 'react';
import {
    Package, Plus, Calendar, MapPin, Hexagon, TrendingUp, Download, Search, RefreshCw,
    ShieldCheck, Zap, ArrowRight, ChevronLeft, SearchX, Layers, Cpu, Database, Binary,
    FlaskConical, Droplets, Wind, Scale, History, Activity, Lock as LockIcon, FlaskRound, HeartPulse, Shield, Hash, Thermometer
} from "lucide-react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useHarvests, useCreateHarvest } from '@/hooks/useHarvests';
import { Harvest } from '@/services/beeyieldService';
import { useApiaries } from '@/hooks/useApiaries';
import { useHives } from '@/hooks/useHives';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { glass, GlassStatCard } from './GlassTheme';
import { BeeYieldPageHeader, BeeYieldPageShell, BeeYieldSectionHeader } from '@/components/beeyield/BeeYieldUI';
import { beeyieldService } from '@/services/beeyieldService';

interface HarvestsViewProps {
    onTabChange?: (tab: string, message?: string, action?: string) => void;
    initialParams?: { message?: string, action?: string } | null;
}

const HarvestsView: React.FC<HarvestsViewProps> = ({ initialParams, onTabChange }) => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [filterYear, setFilterYear] = React.useState<string>('all');
    const [isAddingHarvest, setIsAddingHarvest] = React.useState(false);
    const [selectedApiaryId, setSelectedApiaryId] = React.useState<string>('');
    const [selectedHiveId, setSelectedHiveId] = React.useState<string>('');
    const [batches, setBatches] = React.useState<any[]>([]);
    const [isBatchesLoading, setIsBatchesLoading] = React.useState(false);
    const [batchYearFilter, setBatchYearFilter] = React.useState('all');
    const [batchHiveFilter, setBatchHiveFilter] = React.useState('');
    const [selectedHarvest, setSelectedHarvest] = React.useState<Harvest | null>(null);

    React.useEffect(() => {
        if (initialParams?.action === 'open_add_new') {
            setIsAddingHarvest(true);
        }
        fetchBatches();
    }, [initialParams]);

    const fetchBatches = async () => {
        setIsBatchesLoading(true);
        try {
            const data = await beeyieldService.getBatches();
            setBatches(data);
        } catch (error) {
            console.error('Error fetching batches:', error);
        } finally {
            setIsBatchesLoading(false);
        }
    };

    const [formData, setFormData] = React.useState<Partial<Harvest>>({
        harvest_date: format(new Date(), 'yyyy-MM-dd'),
        quantity_kg: 0,
        honey_type: 'Acacia',
        nectar_source: 'Floral',
        extraction_method: 'Cold Extraction',
        color_grade: 'Light Amber',
        weather_conditions: 'Sunny',
        is_verified: true
    });

    const { data: harvests = [], isLoading } = useHarvests();

    // Enrich batches with Hive info from harvests
    const enrichedBatches = React.useMemo(() => {
        return batches.map(b => {
            const h = harvests.find((hv: any) => hv.batch_code === b.batch_code);
            return {
                ...b,
                hive_code: h?.hive?.hive_code || 'N/A',
                harvest_year: h?.harvest_date ? new Date(h.harvest_date).getFullYear().toString() : (b.harvest_date ? new Date(b.harvest_date).getFullYear().toString() : 'all')
            };
        });
    }, [batches, harvests]);
    const { mutate: createHarvest, isPending: isCreating } = useCreateHarvest();
    const { data: apiaries = [] } = useApiaries();
    const { data: hives = [] } = useHives(selectedApiaryId || undefined);

    const filteredHives = React.useMemo(() => {
        if (!selectedApiaryId) return hives;
        return hives.filter((h: any) => (h.apiary_id || h.apiary?.id) === selectedApiaryId);
    }, [hives, selectedApiaryId]);

    // Calculate statistics
    const stats = React.useMemo(() => {
        const totalHarvests = harvests.length;
        const totalHoney = harvests.reduce((sum, h) => sum + (h.quantity_kg || 0), 0);
        const thisMonth = harvests.filter(h => {
            const harvestDate = new Date(h.harvest_date);
            const now = new Date();
            return harvestDate.getMonth() === now.getMonth() &&
                harvestDate.getFullYear() === now.getFullYear();
        }).length;
        const avgPerHarvest = totalHarvests > 0 ? totalHoney / totalHarvests : 0;

        return {
            totalHarvests,
            totalHoney: totalHoney.toFixed(1),
            thisMonth,
            avgPerHarvest: avgPerHarvest.toFixed(1)
        };
    }, [harvests]);

    // Filter harvests
    const filteredHarvests = React.useMemo(() => {
        return harvests.filter(harvest => {
            const matchesSearch = searchQuery === '' ||
                harvest.batch_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                harvest.honey_type?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesYear = filterYear === 'all' ||
                new Date(harvest.harvest_date).getFullYear().toString() === filterYear;

            return matchesSearch && matchesYear;
        });
    }, [harvests, searchQuery, filterYear]);

    const exportHarvestsCsv = React.useCallback(() => {
        const rows = filteredHarvests.map((h) => ({
            batch_code: h.batch_code || '',
            harvest_date: h.harvest_date || '',
            apiary: (h as any).apiary?.name || '',
            hive_code: (h as any).hive?.hive_code || '',
            quantity_kg: h.quantity_kg ?? '',
            honey_type: h.honey_type || '',
            color_grade: h.color_grade || '',
            verified: (h as any).is_verified ?? '',
        }));

        if (rows.length === 0) {
            toast.info('No harvests to export');
            return;
        }

        const escapeCsv = (v: unknown) => {
            const s = String(v ?? '');
            if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
            return s;
        };

        const header = Object.keys(rows[0]).join(',');
        const body = rows.map((r) => Object.values(r).map(escapeCsv).join(',')).join('\n');
        const csv = `${header}\n${body}\n`;

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `beeyield-harvests-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        toast.success('Harvest export generated');
    }, [filteredHarvests]);

    const getColorGradeStyles = (grade?: string) => {
        const styles: Record<string, string> = {
            'Extra Light Amber': 'bg-[#F4D03F] text-[#F4D03F] border-amber-500/20',
            'Light Amber': 'bg-[#F4D03F] text-[#F4D03F] border-amber-500/40',
            'Amber': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
            'Dark Amber': 'bg-orange-500/20 text-orange-400 border-orange-500/40',
        };
        return styles[grade || ''] || 'bg-foreground/5 text-foreground/40 border-border/50';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedApiaryId) {
            toast.error('Please select an apiary.');
            return;
        }
        if (!selectedHiveId) {
            toast.error('Please select a hive.');
            return;
        }
        if (!formData.quantity_kg || formData.quantity_kg <= 0) {
            toast.error('Please enter the amount of honey harvested.');
            return;
        }

        const toastId = toast.loading('Saving harvest information...');
        createHarvest({ ...(formData as any), apiary_id: selectedApiaryId, hive_id: selectedHiveId } as any, {
            onSuccess: () => {
                setIsAddingHarvest(false);
                setSelectedApiaryId('');
                setSelectedHiveId('');
                setFormData({
                    harvest_date: format(new Date(), 'yyyy-MM-dd'),
                    quantity_kg: 0,
                    honey_type: 'Acacia',
                    nectar_source: 'Floral',
                    extraction_method: 'Cold Extraction',
                    color_grade: 'Light Amber',
                    weather_conditions: 'Sunny',
                    is_verified: true
                });
                toast.success('Harvest saved successfully.', { id: toastId });
            },
            onError: (err: any) => {
                const msg =
                    typeof err?.message === 'string'
                        ? err.message
                        : (typeof err?.detail === 'string' ? err.detail : 'Could not save the harvest. Please try again.');
                toast.error('Could not save the harvest.', { id: toastId, description: msg, duration: 8000 });
            }
        });
    };

    if (isAddingHarvest) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(glass.page, "p-4 lg:p-6 space-y-6 pb-20")}
            >
                {/* Header */}
                <BeeYieldPageHeader
                    icon={Activity}
                    label="Harvest"
                    onBack={() => setIsAddingHarvest(false)}
                    title={<>Record <span className="text-[#F4D03F]">harvest</span></>}
                    subtitle="Save your harvest details."
                    actions={
                        <button
                            onClick={() => setIsAddingHarvest(false)}
                            className={cn(glass.btnSecondary, "w-9 h-9 p-0 flex items-center justify-center")}
                            aria-label="Back to harvest list"
                            title="Back"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    }
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 relative z-10">
                    {/* Left Column */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className={cn(glass.card, 'bg-white/40 border-white/20 p-5 shadow-xl relative overflow-hidden group')}>
                            <div className="relative z-10 space-y-3">
                                <div className="w-8 h-8 rounded-lg bg-[#1B9157] flex items-center justify-center shadow-sm">
                                    <FlaskConical className="w-4 h-4 text-white" />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-[10px] font-black text-[#1A1A1A]">Harvest details</h3>
                                    <p className="text-[8px] font-black text-gray-400">Record what you harvested</p>
                                </div>
                            </div>
                        </div>

                        <div className={cn(glass.card, "bg-white/40 border-white/20 p-5 shadow-xl")}>
                                <div className="space-y-1 mb-4">
                                    <h4 className="text-[10px] font-black text-[#1A1A1A]">Batch</h4>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/50 border border-white/40 shadow-sm">
                                        <span className="text-[10px] font-bold text-gray-400 tracking-wider">ID</span>
                                        <span className="text-xs font-bold text-[#F4D03F] tabular-nums">BTCH_{new Date().getTime().toString().slice(-6)}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/50 border border-white/40 shadow-sm">
                                        <span className="text-[10px] font-bold text-gray-400 tracking-wider">Status</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#1B9157] animate-pulse" />
                                            <span className="text-[10px] font-bold text-[#1B9157] tracking-wider">Saved</span>
                                        </div>
                                    </div>
                                </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={cn(glass.card, "p-0 overflow-hidden bg-white/40 border-white/20 shadow-xl relative")}
                        >
                            <div className="p-5 border-b border-white/20 bg-white/20 relative z-10 backdrop-blur-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/20">
                                        <Layers className="w-4 h-4 text-[#F4D03F]" />
                                    </div>
                                    <div className="space-y-0.5">
                                    <h2 className="text-[11px] font-black text-[#1A1A1A]">Harvest <span className="text-[#F4D03F]">form</span></h2>
                                        <p className="text-[8px] font-black text-gray-400">Enter harvest details</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6 relative z-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className={glass.microLabel}>Apiary *</Label>
                                        <Select value={selectedApiaryId} onValueChange={(val) => {
                                            setSelectedApiaryId(val);
                                            setSelectedHiveId('');
                                        }}>
                                            <SelectTrigger id="harvest-apiary" aria-label="Apiary" className={cn(glass.select, "border-white/40 bg-white/50 h-10")}>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3.5 h-3.5 text-[#F4D03F]/40" />
                                                    <SelectValue placeholder="Select apiary" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className={glass.selectContent}>
                                                {apiaries.length > 0 ? apiaries.map((a: any) => (
                                                    <SelectItem key={a.id} value={a.id} className="text-xs font-semibold">
                                                        {a.name}{a.location_name ? ` — ${a.location_name}` : ''}
                                                    </SelectItem>
                                                )) : (
                                                    <div className="p-2 text-center text-[10px] text-gray-400 font-black">No Apiaries</div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={glass.microLabel}>Hive *</Label>
                                        <Select value={selectedHiveId} onValueChange={setSelectedHiveId} disabled={!selectedApiaryId}>
                                            <SelectTrigger id="harvest-hive" aria-label="Hive" className={cn(glass.select, "border-white/40 bg-white/50 h-10")}>
                                                <div className="flex items-center gap-2">
                                                    <Hexagon className="w-3.5 h-3.5 text-[#1B9157]/40" />
                                                    <SelectValue placeholder={selectedApiaryId ? "Select hive" : "Select apiary first"} />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className={glass.selectContent}>
                                                {filteredHives.length > 0 ? filteredHives.map((h: any) => (
                                                    <SelectItem key={h.id} value={h.id} className="text-xs font-semibold">
                                                        {h.hive_code || h.hive_name || h.id.slice(0, 6)}
                                                    </SelectItem>
                                                )) : (
                                                    <div className="p-2 text-center text-[10px] text-gray-400 font-black">
                                                        {selectedApiaryId ? 'No Hives In Apiary' : 'Select Apiary First'}
                                                    </div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={glass.microLabel}>Harvest Date</Label>
                                        <div className="relative group/input">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F4D03F]/40" />
                                            <Input
                                                id="harvest-date"
                                                name="harvest_date"
                                                autoComplete="off"
                                                type="date"
                                                value={formData.harvest_date}
                                                onChange={(e) => setFormData({ ...formData, harvest_date: e.target.value })}
                                                className={cn(glass.input, "pl-10 h-10 border-white/40 bg-white/50 focus:bg-white")}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={glass.microLabel}>Yield (KG)*</Label>
                                        <div className="relative group/input">
                                            <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1B9157]/40" />
                                            <Input
                                                id="harvest-quantity-kg"
                                                name="quantity_kg"
                                                autoComplete="off"
                                                type="number"
                                                step="0.1"
                                                placeholder="0.0"
                                                value={formData.quantity_kg || ''}
                                                onChange={(e) => setFormData({ ...formData, quantity_kg: parseFloat(e.target.value) })}
                                                className={cn(glass.input, "pl-10 h-10 border-white/40 bg-white/50 focus:bg-white")}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={glass.microLabel}>Honey Type</Label>
                                        <Select
                                            value={formData.honey_type}
                                            onValueChange={(val) => setFormData({ ...formData, honey_type: val })}
                                        >
                                            <SelectTrigger id="harvest-honey-type" aria-label="Honey type" className={cn(glass.select, "border-white/40 bg-white/50 h-10")}>
                                                <div className="flex items-center gap-2">
                                                    <Database className="w-3.5 h-3.5 text-[#F4D03F]/40" />
                                                    <SelectValue placeholder="Select type" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className={glass.selectContent}>
                                                {['Acacia', 'Multifloral', 'Sunflower', 'Forest', 'Rapeseed'].map(v => (
                                                    <SelectItem key={v} value={v} className="text-xs font-semibold">{v}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={glass.microLabel}>Honey Grade</Label>
                                        <Select
                                            value={formData.color_grade}
                                            onValueChange={(val) => setFormData({ ...formData, color_grade: val })}
                                        >
                                            <SelectTrigger id="harvest-color-grade" aria-label="Honey grade" className={glass.select}>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-[#F4D03F]" />
                                                    <SelectValue placeholder="Select grade" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className={glass.selectContent}>
                                                {['Extra Light Amber', 'Light Amber', 'Amber', 'Dark Amber'].map(g => (
                                                    <SelectItem key={g} value={g} className="text-xs font-semibold">{g}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={glass.microLabel}>Extraction Method</Label>
                                        <div className="relative group/input">
                                            <Cpu className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A1A]/20" />
                                            <Input
                                                id="harvest-extraction-method"
                                                name="extraction_method"
                                                autoComplete="off"
                                                placeholder="e.g. Cold Centrifuge"
                                                value={formData.extraction_method || ''}
                                                onChange={(e) => setFormData({ ...formData, extraction_method: e.target.value })}
                                                className={cn(glass.input, "pl-10 h-10 border-white/40 bg-white/50 focus:bg-white text-[11px] font-black tracking-tight")}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={glass.microLabel}>Weather</Label>
                                        <div className="relative group/input">
                                            <Wind className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A1A]/20" />
                                            <Input
                                                id="harvest-weather-conditions"
                                                name="weather_conditions"
                                                autoComplete="off"
                                                placeholder="e.g. Sunny"
                                                value={formData.weather_conditions || ''}
                                                onChange={(e) => setFormData({ ...formData, weather_conditions: e.target.value })}
                                                className={cn(glass.input, "pl-10 h-10 border-white/40 bg-white/50 focus:bg-white text-[11px] font-black tracking-tight")}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3 border-t border-[#F4D03F]/10 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingHarvest(false)}
                                        className={cn(glass.btnSecondary, "h-9 px-6 font-black text-[10px] rounded-xl")}
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isCreating}
                                        className={cn(glass.btnPrimary, "flex-1 h-9 font-black text-[10px]")}
                                    >
                                        {isCreating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                        Save harvest
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <BeeYieldPageShell className={cn(glass.page, "p-4 lg:p-6 space-y-6 pb-20")}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
            >
            {/* Header */}
            <BeeYieldPageHeader
                icon={Package}
                label="Harvests"
                onBack={() => onTabChange?.('home')}
                title={<>Harvest <span className="text-[#F4D03F]">list</span></>}
                subtitle="View and record your harvests."
                actions={
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => window.location.reload()}
                            aria-label="Refresh harvests"
                            title="Refresh"
                            className={cn(glass.btnSecondary, "w-9 h-9 p-0 flex items-center justify-center")}
                        >
                            <span className="sr-only">Refresh</span>
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setIsAddingHarvest(true)}
                            className={glass.btnPrimary}
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Add harvest
                        </button>
                    </div>
                }
            />

            {/* Stats Matrix */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <GlassStatCard label="Total honey" value={`${stats.totalHoney}KG`} icon={Zap} index={0} />
                <GlassStatCard label="Total harvests" value={stats.totalHarvests} icon={History} index={1} color="text-[#1A1A1A]" />
                <GlassStatCard label="This month" value={stats.thisMonth} icon={Calendar} index={2} color="text-[#1A1A1A]" />
                <GlassStatCard label="Average yield" value={`${stats.avgPerHarvest}KG`} icon={Activity} index={3} color="text-[#1B9157]" />
            </div>

            <Tabs defaultValue="harvests" className="w-full space-y-6">
                <TabsList className={cn(glass.filterBar, "bg-white/40 backdrop-blur-xl border-white/20 p-1 rounded-xl w-full max-w-sm mx-auto h-auto flex gap-1")}>
                    <TabsTrigger value="harvests" className="flex-1 rounded-lg text-[10px] font-black py-2 data-[state=active]:bg-white data-[state=active]:text-[#1A1A1A] data-[state=active]:shadow-sm transition-all h-9 uppercase tracking-tighter">
                        <History className="w-4 h-4 mr-2" />
                        Harvest Logs
                    </TabsTrigger>
                    <TabsTrigger value="batches" className="flex-1 rounded-lg text-[10px] font-black py-2 data-[state=active]:bg-white data-[state=active]:text-[#1A1A1A] data-[state=active]:shadow-sm transition-all h-9 uppercase tracking-tighter">
                        <Binary className="w-4 h-4 mr-2" />
                        Traceability Batches
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="harvests" className="space-y-6 mt-0">
            {/* Filter bar */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(glass.filterBar, "bg-white/40 backdrop-blur-xl border-white/20 p-2 rounded-2xl")}
            >
                <div className="flex-1 w-full relative group/search">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A1A]/20" />
                    <Input
                        id="harvests-search"
                        name="search_harvests"
                        autoComplete="off"
                        placeholder="Search harvests…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-10 pl-10 bg-white/50 border border-white/40 rounded-xl text-sm font-semibold text-[#1A1A1A] placeholder:text-gray-400 focus:bg-white transition-colors"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto p-1 border-t md:border-t-0 md:border-l border-white/20">
                    <Select value={filterYear} onValueChange={setFilterYear}>
                        <SelectTrigger id="harvests-filter-year" aria-label="Filter year" className="h-10 w-full md:w-32 bg-white/50 border border-white/40 rounded-xl focus:bg-white text-sm font-semibold text-gray-600 transition-colors">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" />
                                <SelectValue placeholder="Year" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className={glass.selectContent}>
                            <SelectItem value="all" className="font-bold text-xs">All harvest cycles</SelectItem>
                            {Array.from({ length: 9 }, (_, i) => {
                                const year = (new Date().getFullYear() - i).toString();
                                return (
                                    <SelectItem key={year} value={year} className="font-bold text-xs">{year}</SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                    <div className="w-px h-4 bg-[#F4D03F]/20 mx-1 hidden md:block" />
                    <button
                        onClick={exportHarvestsCsv}
                        className="h-8 px-3 text-xs font-bold text-gray-500 hover:text-[#F4D03F] transition-all flex items-center gap-2"
                        aria-label="Export filtered harvests as CSV"
                        title="Export CSV"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Export
                    </button>
                </div>
            </motion.div>

            {/* Harvest table */}
            <div className="mt-4 relative z-10">
                <div className={cn(glass.card, "p-0 overflow-hidden bg-white/40 border-white/20 shadow-xl")}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/30 border-b border-white/40 backdrop-blur-sm">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500">Batch ID</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500">Date</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500">Hive</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 text-center">Net yield</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 text-center">Grade</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F4D03F]/5">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={6} className="p-10 text-center h-40">
                                                <div className="flex flex-col items-center gap-3">
                                                    <RefreshCw className="w-6 h-6 text-[#F4D03F] animate-spin" />
                                                    <span className="text-xs font-medium text-gray-400">Loading entries...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredHarvests.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-10 text-center h-40">
                                                <div className="flex flex-col items-center gap-4">
                                                    <SearchX className="w-8 h-8 text-gray-300" />
                                                    <span className="text-sm font-medium text-gray-400">No harvests found</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredHarvests.map((h, i) => (
                                            <motion.tr
                                                key={h.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                onClick={() => setSelectedHarvest(h)}
                                                className="hover:bg-white/50 transition-colors group cursor-pointer"
                                            >
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-bold text-[#1A1A1A]">
                                                        {h.batch_code || `BAT-${h.id.toString().slice(-6).toUpperCase()}`}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-medium text-gray-500 tabular-nums">
                                                        {format(new Date(h.harvest_date), 'MMM dd, yyyy')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-[#1A1A1A] truncate max-w-[150px]">
                                                            {h.apiary?.name || 'Field Ops'}
                                                        </span>
                                                        <span className="text-[10px] font-medium text-gray-400">
                                                            ID: {h.hive?.hive_code || 'Unknown'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-sm font-bold text-[#1B9157] tabular-nums">
                                                        {h.quantity_kg.toFixed(1)} <span className="text-[10px] font-medium opacity-50">Kg</span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <Badge variant="outline" className="border-[#F4D03F]/20 text-[#F4D03F] font-bold text-[10px] tracking-wider bg-white">
                                                        {h.color_grade?.split(' ')[0] || 'A'}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Badge variant="outline" className="border-[#1B9157]/20 text-[#1B9157] font-bold text-[10px] tracking-wider bg-white">
                                                        Archived
                                                    </Badge>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            </TabsContent>

            <TabsContent value="batches" className="space-y-6 mt-0">
            {/* Traceability Batches Section */}
            <div className="mt-12 space-y-6 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <BeeYieldSectionHeader
                        icon={ShieldCheck}
                        title={<>Traceability <span className="text-[#F4D03F]">records</span></>}
                        subtitle="Immutable digital twins of your honey production."
                    />
                    
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative group/search">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <Input 
                                className="w-[150px] pl-9 h-9 rounded-xl border-white/40 bg-white/50 text-[10px] font-bold focus:bg-white transition-all" 
                                placeholder="Search Hive..." 
                                value={batchHiveFilter}
                                onChange={(e) => setBatchHiveFilter(e.target.value)}
                            />
                        </div>

                        <Select value={batchYearFilter} onValueChange={setBatchYearFilter}>
                            <SelectTrigger className="w-[110px] h-9 rounded-xl border-white/40 bg-white/50 text-[10px] font-bold focus:bg-white transition-all shadow-sm">
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent className={glass.selectContent}>
                                <SelectItem value="all" className="font-bold text-xs uppercase tracking-tighter">All Production</SelectItem>
                                {['2026', '2025', '2024', '2023', '2022', '2021', '2020'].map(y => (
                                    <SelectItem key={y} value={y} className="font-bold text-xs">{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                
                <div className={cn(glass.card, "p-0 overflow-hidden bg-white/40 border-white/20 shadow-xl")}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/30 border-b border-white/40 backdrop-blur-sm">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-tight">Batch Code</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-tight">Hive</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-tight">Harvest Date</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-tight">Honey Type</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-tight text-center">Net (KG)</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-tight text-center">Grade</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-tight text-right">Blockchain Hash</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F4D03F]/5">
                                {isBatchesLoading ? (
                                    <tr><td colSpan={7} className="p-12 text-center text-xs text-gray-400 font-bold">Verifying records...</td></tr>
                                ) : enrichedBatches
                                    .filter(b => batchYearFilter === 'all' || b.harvest_year === batchYearFilter)
                                    .filter(b => !batchHiveFilter || b.hive_code?.toLowerCase().includes(batchHiveFilter.toLowerCase()))
                                    .length === 0 ? (
                                    <tr><td colSpan={7} className="p-12 text-center text-xs text-gray-400 font-bold">No traceability records found for this year.</td></tr>
                                ) : enrichedBatches
                                    .filter(b => batchYearFilter === 'all' || b.harvest_year === batchYearFilter)
                                    .filter(b => !batchHiveFilter || b.hive_code?.toLowerCase().includes(batchHiveFilter.toLowerCase()))
                                    .map((batch) => (
                                    <tr key={batch.id} className="hover:bg-white/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="text-[11px] font-black text-[#1A1A1A] tabular-nums font-mono text-primary/80 uppercase">
                                                {batch.batch_code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-black text-[#1B9157] tracking-tighter">
                                                {batch.hive_code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-bold text-gray-500 tabular-nums">
                                                {format(new Date(batch.harvest_date), 'MMM dd, yyyy')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[10px] font-semibold text-gray-600">
                                            {batch.honey_type}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-[11px] font-black text-[#1A1A1A]">
                                                {batch.quantity_kg} KG
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Badge variant="outline" className={cn(
                                                "border-none text-[9px] font-black px-2",
                                                batch.quality_grade === 'A' ? "bg-[#1B9157]/10 text-[#1B9157]" : "bg-[#F4D03F]/10 text-[#F4D03F]"
                                            )}>
                                                GRADE {batch.quality_grade}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                                                <code className="text-[8px] font-mono text-gray-400 opacity-60">
                                                    {(batch.block_hash || '0x...').slice(0, 16)}...
                                                </code>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            </TabsContent>
            </Tabs>
            {/* Details Modal */}
            <AnimatePresence>
                {selectedHarvest && (
                    <div className={glass.modalOverlay} onClick={() => setSelectedHarvest(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className={cn(glass.modalCard, "max-w-md")}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-[#F4D03F]/10">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h2 className="text-xl font-bold text-foreground tracking-tight">Harvest <span className="text-[#F4D03F]">Details</span></h2>
                                        <p className="text-xs text-gray-400 font-medium">Traceability record for {selectedHarvest.batch_code || 'this batch'}</p>
                                    </div>
                                    <button onClick={() => setSelectedHarvest(null)} className="w-8 h-8 rounded-lg bg-[#F9F7F2] border border-[#F4D03F]/10 flex items-center justify-center hover:bg-red-500/10 transition-all">
                                        <Activity className="w-4 h-4 text-gray-400" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black uppercase text-gray-400">Batch Code</span>
                                        <div className="text-sm font-bold truncate tabular-nums">{selectedHarvest.batch_code || '—'}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black uppercase text-gray-400">Date</span>
                                        <div className="text-sm font-bold">{selectedHarvest.harvest_date ? format(new Date(selectedHarvest.harvest_date), 'MMM dd, yyyy') : '—'}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black uppercase text-gray-400">Yield (KG)</span>
                                        <div className="text-sm font-bold text-[#1B9157]">{selectedHarvest.quantity_kg?.toFixed(1)} KG</div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black uppercase text-gray-400">Honey Type</span>
                                        <div className="text-sm font-bold">{selectedHarvest.honey_type || '—'}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black uppercase text-gray-400">Extraction</span>
                                        <div className="text-sm font-bold">{selectedHarvest.extraction_method || '—'}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black uppercase text-gray-400">Color Grade</span>
                                        <div className="text-sm font-bold">{selectedHarvest.color_grade || '—'}</div>
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <span className="text-[9px] font-black uppercase text-gray-400">Weather</span>
                                        <div className="text-sm font-bold">{selectedHarvest.weather_conditions || '—'}</div>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-[#F4D03F]/10">
                                    <button onClick={() => setSelectedHarvest(null)} className={cn(glass.btnPrimary, "w-full")}>
                                        Close Details
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            </motion.div>
        </BeeYieldPageShell>
    );
};

export default HarvestsView;
