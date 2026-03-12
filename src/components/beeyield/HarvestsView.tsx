import React from 'react';
import {
    Package, Plus, Calendar, MapPin, Hexagon, TrendingUp, Download, Search, RefreshCw,
    ShieldCheck, Zap, ArrowRight, ChevronLeft, SearchX, Layers, Cpu, Database, Binary,
    FlaskConical, Droplets, Wind, Scale, History, Activity, Lock, FlaskRound, HeartPulse, Shield, Hash, Thermometer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHarvests, useCreateHarvest } from '@/hooks/useHarvests';
import { Harvest } from '@/services/beeyieldService';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { glass, PageHeader } from './GlassTheme';

interface HarvestsViewProps {
    onTabChange?: (tab: string, message?: string, action?: string) => void;
    initialParams?: { message?: string, action?: string } | null;
}

const HarvestsView: React.FC<HarvestsViewProps> = ({ initialParams }) => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [filterYear, setFilterYear] = React.useState<string>('all');
    const [isAddingHarvest, setIsAddingHarvest] = React.useState(false);

    React.useEffect(() => {
        if (initialParams?.action === 'open_add_new') {
            setIsAddingHarvest(true);
        }
    }, [initialParams]);

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
    const { mutate: createHarvest, isPending: isCreating } = useCreateHarvest();

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

    const getColorGradeStyles = (grade?: string) => {
        const styles: Record<string, string> = {
            'Extra Light Amber': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
            'Light Amber': 'bg-amber-500/20 text-amber-400 border-amber-500/40',
            'Amber': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
            'Dark Amber': 'bg-orange-500/20 text-orange-400 border-orange-500/40',
        };
        return styles[grade || ''] || 'bg-foreground/5 text-foreground/40 border-border/50';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.quantity_kg || formData.quantity_kg <= 0) {
            toast.error('Please enter the amount of honey harvested.');
            return;
        }

        const toastId = toast.loading('Saving harvest information...');
        createHarvest(formData as any, {
            onSuccess: () => {
                setIsAddingHarvest(false);
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
                toast.error('Could not save the harvest. Please try again.', { id: toastId });
            }
        });
    };

    if (isAddingHarvest) {
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
                            onClick={() => setIsAddingHarvest(false)}
                            className={cn(glass.btnSecondary, "h-24 w-24 p-0 rounded-[2.5rem] bg-white shadow-4xl border-white/5 flex items-center justify-center hover:text-honey hover:scale-110 active:scale-95 transition-all duration-700")}
                        >
                            <ChevronLeft className="w-12 h-12" />
                        </button>
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-4 px-6 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-2xl skew-x-[-15deg]">
                                <Activity className="w-5 h-5 text-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] skew-x-[15deg] italic text-emerald-500">Harvest Log</span>
                            </div>
                            <h1 className="text-7xl font-black italic text-foreground tracking-tighter uppercase leading-none">Honey <span className="text-honey">Harvest</span></h1>
                            <p className={cn(glass.microLabel, 'opacity-40 italic tracking-[0.4em] font-black uppercase text-[12px] border-l-4 border-honey/20 pl-8')}>Record your harvest details here to track production trends.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 py-8 relative z-10">
                    {/* Left Column */}
                    <div className="lg:col-span-4 space-y-16">
                        <div className={cn(glass.card, 'bg-emerald-500/[0.03] border-emerald-500/30 p-16 rounded-[4rem] shadow-4xl relative overflow-hidden group')}>
                            <div className="relative z-10 space-y-10">
                                <div className="w-20 h-20 rounded-[2.5rem] bg-emerald-500 flex items-center justify-center shadow-4xl">
                                    <FlaskConical className="w-10 h-10 text-gray-900" />
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-4xl font-black italic text-foreground tracking-tighter uppercase leading-none">Important <span className="text-emerald-500">Note</span></h3>
                                    <p className="text-xl font-black text-foreground/40 italic leading-relaxed border-l-4 border-emerald-500/20 pl-12 uppercase tracking-tight">
                                        Recording your harvest details helps you track production trends and see which hives or locations are most productive.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className={cn(glass.card, "p-16 space-y-12 bg-white/40 backdrop-blur-3xl rounded-[4rem] shadow-4xl border-white/5")}>
                            <div className="space-y-4">
                                <p className={cn(glass.microLabel, "opacity-20 italic font-black uppercase tracking-[0.4em]")}>Current Batch</p>
                                <h4 className="text-4xl font-black italic text-foreground tracking-tighter uppercase leading-none italic">Harvest <span className="text-honey">Details</span></h4>
                            </div>
                            <div className="grid grid-cols-1 gap-8 pt-4">
                                <div className="flex items-center justify-between p-10 rounded-[2.5rem] bg-gray-50 border border-white/5 shadow-inner">
                                    <span className={cn(glass.microLabel, "opacity-20 font-black italic uppercase tracking-[0.3em]")}>BATCH CODE</span>
                                    <span className="text-2xl font-black italic text-honey tabular-nums tracking-tighter uppercase">BATCH_{new Date().getTime().toString().slice(-6)}</span>
                                </div>
                                <div className="flex items-center justify-between p-10 rounded-[2.5rem] bg-gray-50 border border-white/5 shadow-inner">
                                    <span className={cn(glass.microLabel, "opacity-20 font-black italic uppercase tracking-[0.3em]")}>SYNC STATUS</span>
                                    <div className="flex items-center gap-4">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-2xl font-black italic text-emerald-500 tabular-nums tracking-tighter uppercase">Online</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-8">
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={cn(glass.card, "p-0 overflow-hidden bg-white/60 backdrop-blur-3xl rounded-[5rem] relative")}
                        >
                            <div className="p-16 border-b border-gray-200 bg-white/40 backdrop-blur-3xl relative z-10">
                                <div className="flex items-center gap-10">
                                    <div className="w-18 h-18 rounded-[2rem] bg-honey/10 flex items-center justify-center border border-honey/20 shadow-3xl">
                                        <Layers className="w-10 h-10 text-honey" />
                                    </div>
                                    <div className="space-y-4">
                                        <h2 className="text-5xl font-black italic text-foreground tracking-tighter uppercase leading-none">Harvest <span className="text-honey">Details</span></h2>
                                        <p className={cn(glass.microLabel, 'opacity-40 uppercase italic')}>Fill in the details for your recent honey harvest.</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-20 space-y-20 relative z-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                                    <div className="space-y-6">
                                        <Label className={cn(glass.microLabel, 'ml-8 opacity-40 uppercase italic')}>Date</Label>
                                        <div className="relative group/input">
                                            <Calendar className="absolute left-10 top-1/2 -translate-y-1/2 w-8 h-8 text-honey opacity-20" />
                                            <Input
                                                type="date"
                                                value={formData.harvest_date}
                                                onChange={(e) => setFormData({ ...formData, harvest_date: e.target.value })}
                                                className={cn(glass.input, "h-24 pl-24 text-2xl")}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <Label className={cn(glass.microLabel, 'ml-8 opacity-40 uppercase italic')}>Amount (kg)*</Label>
                                        <div className="relative group/input">
                                            <Scale className="absolute left-10 top-1/2 -translate-y-1/2 w-8 h-8 text-emerald-500 opacity-20" />
                                            <Input
                                                type="number"
                                                step="0.1"
                                                placeholder="0.0"
                                                value={formData.quantity_kg || ''}
                                                onChange={(e) => setFormData({ ...formData, quantity_kg: parseFloat(e.target.value) })}
                                                className={cn(glass.input, 'h-24 pl-24 text-4xl tabular-nums focus:text-emerald-500')}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <Label className={cn(glass.microLabel, 'ml-8 opacity-40 uppercase italic')}>Honey Type</Label>
                                        <Select
                                            value={formData.honey_type}
                                            onValueChange={(val) => setFormData({ ...formData, honey_type: val })}
                                        >
                                            <SelectTrigger className={cn(glass.select, 'h-24 px-12 text-2xl')}>
                                                <div className="flex items-center gap-8">
                                                    <Database className="w-8 h-8 text-honey opacity-30" />
                                                    <SelectValue placeholder="Select type" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className={glass.selectContent}>
                                                {['Acacia', 'Multifloral', 'Sunflower', 'Forest', 'Rapeseed'].map(v => (
                                                    <SelectItem key={v} value={v} className="p-6 uppercase font-black text-[15px] italic rounded-2xl">{v.toUpperCase()}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-6">
                                        <Label className={cn(glass.microLabel, 'ml-8 opacity-40 uppercase italic')}>Honey Color</Label>
                                        <Select
                                            value={formData.color_grade}
                                            onValueChange={(val) => setFormData({ ...formData, color_grade: val })}
                                        >
                                            <SelectTrigger className={cn(glass.select, 'h-24 px-12 text-2xl')}>
                                                <div className="flex items-center gap-8">
                                                    <div className="w-8 h-8 rounded-full bg-amber-500" />
                                                    <SelectValue placeholder="Select grade" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className={glass.selectContent}>
                                                {['Extra Light Amber', 'Light Amber', 'Amber', 'Dark Amber'].map(g => (
                                                    <SelectItem key={g} value={g} className="p-6 uppercase font-black text-[15px] italic rounded-2xl">{g.toUpperCase()}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-6">
                                        <Label className={cn(glass.microLabel, 'ml-8 opacity-40 uppercase italic')}>Extraction Method</Label>
                                        <div className="relative group/input">
                                            <Cpu className="absolute left-10 top-1/2 -translate-y-1/2 w-8 h-8 text-muted-foreground opacity-20" />
                                            <Input
                                                placeholder="e.g. Cold Centrifuge"
                                                value={formData.extraction_method || ''}
                                                onChange={(e) => setFormData({ ...formData, extraction_method: e.target.value })}
                                                className={cn(glass.input, 'h-24 pl-24 text-2xl')}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <Label className={cn(glass.microLabel, 'ml-8 opacity-40 uppercase italic')}>Weather</Label>
                                        <div className="relative group/input">
                                            <Wind className="absolute left-10 top-1/2 -translate-y-1/2 w-8 h-8 text-blue-400 opacity-20" />
                                            <Input
                                                placeholder="e.g. Sunny"
                                                value={formData.weather_conditions || ''}
                                                onChange={(e) => setFormData({ ...formData, weather_conditions: e.target.value })}
                                                className={cn(glass.input, 'h-24 pl-24 text-2xl')}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-16 mt-20 border-t border-gray-200 bg-white/40 backdrop-blur-3xl flex flex-col sm:flex-row justify-between items-center -m-20 rounded-b-[5rem]">
                                    <div className="flex items-center gap-10 opacity-10 px-10 mb-10 sm:mb-0">
                                        <Lock className="w-10 h-10" />
                                        <p className="text-[14px] font-black uppercase tracking-[0.5em] italic">Data protected and synced.</p>
                                    </div>
                                    <div className="flex gap-10">
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingHarvest(false)}
                                            className={glass.btnSecondary}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isCreating}
                                            className={cn(glass.btnPrimary, "h-22 px-24 bg-honey text-black shadow-4xl rounded-[3rem] font-black italic text-3xl")}
                                        >
                                            {isCreating ? (
                                                <RefreshCw className="w-12 h-12 animate-spin" />
                                            ) : (
                                                <ShieldCheck className="w-12 h-12" />
                                            )}
                                            Save Harvest
                                        </button>
                                    </div>
                                </div>
                            </form>
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
                icon={Package}
                label="Production Registry"
                title={<>Production <span className="text-[#FF6B00]">Registry</span></>}
                subtitle="High-fidelity telemetry of honey extraction, clarification, and packaging cycles."
                actions={
                    <div className="flex items-center gap-8">
                        <button
                            onClick={() => window.location.reload()}
                            className={cn(glass.btnSecondary, "h-20 w-20 p-0 rounded-2xl bg-white/5 border-gray-200 flex items-center justify-center hover:text-[#FF6B00] transition-all")}
                        >
                            <RefreshCw className="w-8 h-8" />
                        </button>
                        <button
                            onClick={() => setIsAddingHarvest(true)}
                            className={cn(glass.btnPrimary, "h-24 bg-[#FF6B00] text-black rounded-2xl px-16 font-black text-2xl transition-all uppercase flex items-center justify-center gap-10 group/btn pl-24 font-mono shadow-[0_0_50px_rgba(255,107,0,0.2)]")}
                        >
                            <Plus className="w-8 h-8 group-hover/btn:rotate-90 transition-all" />
                            LOG_EXTRACTION
                        </button>
                    </div>
                }
            />

            {/* Stats Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: 'GROSS VOLUME', value: `${stats.totalHoney}KG`, icon: Zap, color: 'text-[#FF6B00]' },
                    { label: 'TOTAL CYCLES', value: stats.totalHarvests, icon: RefreshCw, color: 'text-gray-900' },
                    { label: 'MONTHLY DELTA', value: stats.thisMonth, icon: Calendar, color: 'text-gray-900' },
                    { label: 'YIELD / CYCLE', value: `${stats.avgPerHarvest}KG`, icon: Activity, color: 'text-gray-900' }
                ].map((s, i) => (
                    <div key={i} className="bg-white/5 border border-gray-200 p-10 rounded-3xl flex flex-col gap-6 relative overflow-hidden group hover:border-[#FF6B00]/40 transition-all">
                        <div className="flex items-center justify-between relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 group-hover:text-gray-600 transition-colors">{s.label}</span>
                            <s.icon className={cn("w-6 h-6", s.color)} />
                        </div>
                        <span className={cn("text-6xl font-black tracking-tighter tabular-nums relative z-10", s.color)}>{s.value}</span>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full translate-x-10 translate-y-10" />
                    </div>
                ))}
            </div>

            {/* Registry Filter Bar */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/5 border border-gray-200 rounded-3xl p-6 flex flex-col xl:flex-row items-center justify-between gap-8 relative overflow-hidden"
            >
                <div className="flex-1 w-full relative group/search">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 text-gray-400 group-focus-within/search:text-[#FF6B00] transition-all" />
                    <Input
                        placeholder="Neural Batch Query..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-16 pl-20 bg-transparent border-none text-xl font-mono text-gray-900 placeholder:text-white/10 focus-visible:ring-0 uppercase tracking-widest"
                    />
                </div>
                <div className="flex items-center gap-6 w-full xl:w-auto">
                    <Select value={filterYear} onValueChange={setFilterYear}>
                        <SelectTrigger className="h-16 w-full xl:w-64 bg-white/5 border-gray-200 rounded-xl text-gray-900 font-mono uppercase tracking-widest px-8">
                            <div className="flex items-center gap-4">
                                <Calendar className="w-5 h-5 text-gray-400" />
                                <SelectValue placeholder="Year" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="bg-gray-50 border-gray-200">
                            <SelectItem value="all" className="uppercase font-mono text-white/60 focus:text-gray-900">All_Years</SelectItem>
                            {Array.from({ length: 9 }, (_, i) => {
                                const year = (new Date().getFullYear() - i).toString();
                                return (
                                    <SelectItem key={year} value={year} className="uppercase font-mono text-white/60 focus:text-gray-900">CY_{year}</SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                    <button className="h-16 px-10 bg-white/5 border border-gray-200 rounded-xl text-gray-600 hover:text-gray-900 hover:border-[#FF6B00]/40 transition-all flex items-center gap-4 group">
                        <Download className="w-6 h-6" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">EXPORT_DB</span>
                    </button>
                </div>
            </motion.div>

            {/* Main Registry Table */}
            <div className="mt-8 relative z-10">
                <div className="bg-white/5 border border-gray-200 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 bg-white/[0.02]">
                                    <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] font-mono">Batch_ID</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] font-mono">Timestamp</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] font-mono">Source_Vector</th>
                                    <th className="px-10 py-8 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] font-mono">Volume_Net</th>
                                    <th className="px-10 py-8 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] font-mono">Grade_Idx</th>
                                    <th className="px-10 py-8 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] font-mono">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="p-20 text-center">
                                            <div className="flex flex-col items-center gap-6 animate-pulse">
                                                <RefreshCw className="w-12 h-12 text-[#FF6B00] animate-spin" />
                                                <span className="text-xl font-mono text-gray-400 uppercase tracking-widest">Hydrating_Records...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredHarvests.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-20 text-center">
                                            <div className="flex flex-col items-center gap-6">
                                                <SearchX className="w-16 h-16 text-white/10" />
                                                <span className="text-xl font-mono text-white/10 uppercase tracking-widest">No_Records_Found</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredHarvests.map((h, i) => (
                                        <motion.tr
                                            key={h.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.02 }}
                                            className="border-b border-white/5 hover:bg-white/[0.01] transition-all group"
                                        >
                                            <td className="px-10 py-10">
                                                <span className="text-lg font-mono font-black text-[#FF6B00] tracking-tighter uppercase whitespace-nowrap">
                                                    {h.batch_code || `BAT-${h.id.toString().slice(-6).toUpperCase()}`}
                                                </span>
                                            </td>
                                            <td className="px-10 py-10">
                                                <span className="text-lg font-mono font-black text-gray-600 group-hover:text-white/60 transition-colors uppercase whitespace-nowrap">
                                                    {format(new Date(h.harvest_date), 'yyyy.MM.dd')}
                                                </span>
                                            </td>
                                            <td className="px-10 py-10">
                                                <div className="flex flex-col">
                                                    <span className="text-xl font-black text-gray-800 group-hover:text-gray-900 transition-colors uppercase truncate max-w-[200px]">
                                                        {h.apiary?.name || 'FIELD_OPS'}
                                                    </span>
                                                    <span className="text-[10px] font-mono font-black text-gray-400 uppercase tracking-widest">
                                                        NODE_{h.hive?.hive_code || 'NULL'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-10 text-center">
                                                <span className="text-4xl font-black text-[#FF6B00] tracking-tighter tabular-nums">
                                                    {h.quantity_kg.toFixed(2)}
                                                    <span className="text-sm ml-2 text-gray-400">KG</span>
                                                </span>
                                            </td>
                                            <td className="px-10 py-10 text-center">
                                                <div className="inline-flex items-center gap-4 px-6 py-2 bg-white/5 border border-gray-200 rounded-lg">
                                                    <div className="w-2 h-2 rounded-full bg-white opacity-40" />
                                                    <span className="text-[12px] font-mono font-black text-white/60 uppercase">
                                                        GRADE_{h.color_grade?.split(' ')[0].toUpperCase() || 'A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-10 text-right">
                                                <div className="inline-flex items-center gap-4 px-6 py-2 bg-white/10 text-gray-900 border border-gray-300 rounded-lg font-mono text-[10px] font-black uppercase tracking-widest">
                                                    <ShieldCheck className="w-4 h-4 text-gray-600" />
                                                    EXTRACTED
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
                .animate-shimmer { animation: shimmer 2.5s infinite linear; }
                .thin-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .thin-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .thin-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 107, 0, 0.2); border-radius: 20px; }
            `}</style>
        </motion.div>
    );
};

export default HarvestsView;
