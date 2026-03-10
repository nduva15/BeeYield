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
import { glass, PageHeader, GlassStatCard } from './GlassTheme';

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
                            className={cn(glass.btnSecondary, "h-24 w-24 p-0 rounded-[2.5rem] bg-white dark:bg-black/60 shadow-4xl border-white/5 flex items-center justify-center hover:text-honey hover:scale-110 active:scale-95 transition-all duration-700")}
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
                                    <FlaskConical className="w-10 h-10 text-white" />
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-4xl font-black italic text-foreground tracking-tighter uppercase leading-none">Important <span className="text-emerald-500">Note</span></h3>
                                    <p className="text-xl font-black text-foreground/40 italic leading-relaxed border-l-4 border-emerald-500/20 pl-12 uppercase tracking-tight">
                                        Recording your harvest details helps you track production trends and see which hives or locations are most productive.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className={cn(glass.card, "p-16 space-y-12 bg-white/40 dark:bg-[#0D0D0D]/60 backdrop-blur-3xl rounded-[4rem] shadow-4xl border-white/5")}>
                            <div className="space-y-4">
                                <p className={cn(glass.microLabel, "opacity-20 italic font-black uppercase tracking-[0.4em]")}>Current Batch</p>
                                <h4 className="text-4xl font-black italic text-foreground tracking-tighter uppercase leading-none italic">Harvest <span className="text-honey">Details</span></h4>
                            </div>
                            <div className="grid grid-cols-1 gap-8 pt-4">
                                <div className="flex items-center justify-between p-10 rounded-[2.5rem] bg-black/5 dark:bg-black/40 border border-white/5 shadow-inner">
                                    <span className={cn(glass.microLabel, "opacity-20 font-black italic uppercase tracking-[0.3em]")}>BATCH CODE</span>
                                    <span className="text-2xl font-black italic text-honey tabular-nums tracking-tighter uppercase">BATCH_{new Date().getTime().toString().slice(-6)}</span>
                                </div>
                                <div className="flex items-center justify-between p-10 rounded-[2.5rem] bg-black/5 dark:bg-black/40 border border-white/5 shadow-inner">
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
                            className={cn(glass.card, "p-0 overflow-hidden bg-white/60 dark:bg-[#0D0D0D]/60 backdrop-blur-3xl rounded-[5rem] relative")}
                        >
                            <div className="p-16 border-b border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-3xl relative z-10">
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

                                <div className="p-16 mt-20 border-t border-white/10 bg-white/40 dark:bg-black/60 backdrop-blur-3xl flex flex-col sm:flex-row justify-between items-center -m-20 rounded-b-[5rem]">
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
                label="Production History"
                title={<>Production <span className="text-honey">History</span></>}
                subtitle="Track and manage your honey production across all locations to see how your business is growing."
                actions={
                    <div className="flex items-center gap-8">
                        <button
                            onClick={() => window.location.reload()}
                            className={cn(glass.btnSecondary, "h-20 w-20 p-0 rounded-[2.5rem] bg-white dark:bg-black/60 shadow-4xl border-white/5 flex items-center justify-center hover:text-honey hover:rotate-180 transition-all duration-1000")}
                        >
                            <RefreshCw className="w-10 h-10" />
                        </button>
                        <button
                            onClick={() => setIsAddingHarvest(true)}
                            className={cn(glass.btnPrimary, "h-24 bg-honey text-black shadow-4xl rounded-[3.5rem] px-16 font-black italic text-2xl transition-all uppercase flex items-center justify-center gap-10 group/btn pl-24")}
                        >
                            <Plus className="w-10 h-10 group-hover/btn:rotate-90 transition-transform duration-1000" />
                            Log New Harvest
                        </button>
                    </div>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                <GlassStatCard label="Total Honey" value={`${stats.totalHoney}kg`} icon={Zap} index={0} color="text-honey" />
                <GlassStatCard label="Total Harvests" value={stats.totalHarvests} icon={RefreshCw} index={1} color="text-blue-500" />
                <GlassStatCard label="This Month" value={stats.thisMonth} icon={Calendar} index={2} color="text-orange-500" />
                <GlassStatCard label="Average per Harvest" value={`${stats.avgPerHarvest}kg`} icon={Activity} index={3} color="text-emerald-500" />
            </div>

            {/* Performance Matrix */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(glass.card, "p-0 overflow-hidden bg-white/80 dark:bg-[#0D0D0D]/80 backdrop-blur-3xl rounded-[6rem] relative")}
            >
                <div className="p-16 border-b border-white/5 bg-white/40 dark:bg-black/40 backdrop-blur-3xl flex flex-col xl:flex-row items-center justify-between gap-16 relative z-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-10">
                            <div className="w-16 h-16 rounded-[2rem] bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-4xl">
                                <TrendingUp className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h2 className="text-6xl font-black italic text-foreground tracking-tighter uppercase leading-none">Production <span className="text-honey">Trends</span></h2>
                        </div>
                        <p className={cn(glass.microLabel, "opacity-40 uppercase italic tracking-[0.4em] pl-24")}>View production stats for {filterYear === 'all' ? 'All Years' : filterYear}</p>
                    </div>
                    <div className="w-full xl:w-96">
                        <Select value={filterYear} onValueChange={setFilterYear}>
                            <SelectTrigger className={cn(glass.select, 'h-24 px-12 text-3xl')}>
                                <Calendar className="w-10 h-10 text-honey opacity-40" />
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent className={glass.selectContent}>
                                <SelectItem value="all" className="p-6 font-black uppercase text-[15px] italic rounded-2xl">All Years</SelectItem>
                                {Array.from({ length: 9 }, (_, i) => {
                                    const year = (new Date().getFullYear() - i).toString();
                                    return (
                                        <SelectItem key={year} value={year} className="p-6 font-black uppercase text-[15px] italic rounded-2xl">Year {year}</SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="p-20 relative z-10">
                    <div className="bg-honey/[0.03] border border-honey/20 rounded-[4rem] p-16 mb-20 flex items-center gap-12 group overflow-hidden relative shadow-inner">
                        <div className="absolute inset-0 bg-honey/[0.01] animate-pulse pointer-events-none" />
                        <div className="w-24 h-24 rounded-[2.5rem] bg-honey/10 flex items-center justify-center text-honey shrink-0 shadow-4xl group-hover:rotate-[360deg] transition-all duration-1000 border border-honey/20">
                            <Binary className="w-12 h-12" />
                        </div>
                        <div className="space-y-4">
                            <p className="text-lg font-black text-honey uppercase tracking-[0.4em] italic opacity-80 flex items-center gap-4">
                                <div className="w-2.5 h-2.5 rounded-full bg-honey animate-pulse" />
                                Production Sync Active
                            </p>
                            <p className="text-2xl font-black text-foreground/40 italic leading-relaxed uppercase tracking-tight">
                                Your production data is being synced across all devices to give you a complete overview of your business health.
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto thin-scrollbar pt-6">
                        <table className="w-full text-left border-separate border-spacing-y-10">
                            <thead>
                                <tr>
                                    <th className="pb-12 pl-12 text-[12px] font-black text-muted-foreground/30 uppercase tracking-[0.5em] italic">Location</th>
                                    <th className="pb-12 text-center text-[12px] font-black text-muted-foreground/30 uppercase tracking-[0.5em] italic">Hives</th>
                                    <th className="pb-12 text-center text-[12px] font-black text-muted-foreground/30 uppercase tracking-[0.5em] italic">Total Output</th>
                                    <th className="pb-12 text-center text-[12px] font-black text-muted-foreground/30 uppercase tracking-[0.5em] italic">Output per Hive</th>
                                    <th className="pb-12 pr-12 text-right text-[12px] font-black text-muted-foreground/30 uppercase tracking-[0.5em] italic">Growth</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { id: 1, name: 'Main Farm', families: 432, total: 2752.4, change: 12.72 },
                                    { id: 2, name: 'Hillside Apiary', families: 890, total: 5260.8, change: -4.32 },
                                ].map((item, i) => (
                                    <motion.tr
                                        key={item.id}
                                        initial={{ opacity: 0, x: -30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="group"
                                    >
                                        <td className="py-14 pl-12 bg-white/5 group-hover:bg-honey/[0.05] rounded-l-[4rem] transition-all duration-700">
                                            <div className="flex items-center gap-10">
                                                <div className="w-20 h-20 rounded-[2.5rem] bg-black/5 dark:bg-white/5 flex items-center justify-center border border-white/5 font-black text-xl text-muted-foreground/20 italic group-hover:text-honey transition-all shadow-inner">
                                                    #{item.id}
                                                </div>
                                                <div className="space-y-3">
                                                    <span className="text-4xl font-black italic text-foreground tracking-tighter uppercase leading-none group-hover:text-honey transition-colors">{item.name}</span>
                                                    <div className="flex items-center gap-4 text-[10px] opacity-20 font-black italic uppercase tracking-[0.3em]">
                                                        <Hash className="w-3 h-3 text-honey" />
                                                        <span>ID: {item.id}00X</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-14 text-center bg-white/5 group-hover:bg-honey/[0.05]">
                                            <span className="text-3xl font-black italic text-foreground tracking-tighter uppercase">{item.families} <span className="text-sm opacity-20">Hives</span></span>
                                        </td>
                                        <td className="py-14 text-center bg-white/5 group-hover:bg-honey/[0.05]">
                                            <div className="flex flex-col items-center">
                                                <span className="text-4xl font-black italic tabular-nums text-foreground tracking-tighter">{item.total.toFixed(1)} <span className="text-sm font-sans opacity-20">KG</span></span>
                                                <div className="w-32 h-2.5 bg-black/10 dark:bg-white/5 mt-4 rounded-full overflow-hidden p-[1px] border border-white/5 shadow-inner">
                                                    <div className="h-full bg-honey rounded-full shadow-[0_0_20px_rgba(251,191,36,0.5)]" style={{ width: '75%' }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-14 text-center bg-white/5 group-hover:bg-honey/[0.05]">
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="text-3xl font-black italic text-foreground/40 tabular-nums tracking-tighter group-hover:text-honey transition-colors">{(item.total / item.families).toFixed(2)}</span>
                                                <span className="text-[10px] font-black uppercase opacity-20 tracking-[0.3em] italic">KG / HIVE</span>
                                            </div>
                                        </td>
                                        <td className="py-14 pr-12 text-right bg-white/5 group-hover:bg-honey/[0.05] rounded-r-[4rem]">
                                            <div className={cn("inline-flex items-center gap-6 px-10 py-4 rounded-full font-black tabular-nums text-3xl italic shadow-4xl skew-x-[-12deg] transition-all", item.change >= 0 ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20")}>
                                                <div className="skew-x-[12deg] flex items-center gap-4">
                                                    {item.change >= 0 ? <TrendingUp className="w-6 h-6 animate-pulse" /> : <TrendingUp className="w-6 h-6 rotate-180" />}
                                                    {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                                                </div>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>

            {/* Filter Bar */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className={glass.filterBar}
            >
                <div className="flex-1 w-full relative group/search">
                    <Search className="absolute left-10 top-1/2 -translate-y-1/2 w-10 h-10 text-honey opacity-20 group-focus-within/search:opacity-100 transition-all duration-700" />
                    <Input
                        placeholder="Search by batch code or honey type..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn(glass.input, 'h-24 pl-26 px-12 italic font-black text-3xl bg-transparent border-none shadow-none normal-case placeholder:opacity-5')}
                    />
                </div>
                <div className="flex flex-col md:flex-row gap-10 w-full xl:w-auto">
                    <Select value={filterYear} onValueChange={setFilterYear}>
                        <SelectTrigger className={cn(glass.select, 'h-24 w-full md:w-80 px-12 rounded-[4rem] italic font-black text-2xl')}>
                            <Calendar className="w-8 h-8 text-honey opacity-30" />
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent className={glass.selectContent}>
                            <SelectItem value="all" className="p-6 font-black uppercase text-[15px] italic rounded-2xl">All Years</SelectItem>
                            {Array.from({ length: 9 }, (_, i) => {
                                const year = (new Date().getFullYear() - i).toString();
                                return (
                                    <SelectItem key={year} value={year} className="p-6 font-black uppercase text-[15px] italic rounded-2xl">Year {year}</SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                    <button className={cn(glass.btnSecondary, 'h-24 px-14 rounded-[4rem] bg-white dark:bg-black/60 shadow-4xl group/export hover:text-honey transition-all')}>
                        <Download className="w-8 h-8 group-hover/export:translate-y-2 transition-transform" />
                        <span className="text-xl font-black italic uppercase tracking-widest">Export History</span>
                    </button>
                </div>
            </motion.div>

            {/* List */}
            <div className="relative z-10">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-14">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className={cn(glass.skeleton, 'aspect-[2/3] rounded-[5rem]')} />
                        ))}
                    </div>
                ) : filteredHarvests.length === 0 ? (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={glass.emptyState}>
                        <div className="w-64 h-64 rounded-[6rem] bg-honey/5 border border-honey/20 flex items-center justify-center mb-16 shadow-4xl">
                            <SearchX className="w-32 h-32 text-honey opacity-20" />
                        </div>
                        <h3 className="text-7xl font-black italic text-foreground tracking-tighter uppercase leading-none opacity-40">No Harvests Found</h3>
                        <p className="text-2xl font-black opacity-20 italic max-w-2xl mx-auto border-l-8 border-honey/20 pl-16 text-center uppercase tracking-widest mt-10">
                            Record your first honey harvest to start tracking your production history and hive performance.
                        </p>
                        <button onClick={() => setIsAddingHarvest(true)} className={cn(glass.btnPrimary, "h-24 px-24 mt-16")}>
                            <Plus className="w-12 h-12" /> Add Harvest
                        </button>
                    </motion.div>
                ) : (
                    <div className="space-y-16">
                        <div className="flex items-center gap-10 border-l-8 border-emerald-500/40 pl-16 group">
                            <h3 className="text-6xl font-black italic text-foreground tracking-tighter uppercase leading-none">Production <span className="text-emerald-500">History</span></h3>
                            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent mx-14" />
                            <div className={cn(glass.badge, 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-12 py-4 rounded-full shadow-4xl skew-x-[-15deg]')}>
                                <div className="skew-x-[15deg] font-black italic uppercase text-[16px] tracking-[0.4em] flex items-center gap-6">
                                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse" />
                                    {filteredHarvests.length} Records
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-16">
                            <AnimatePresence mode="popLayout">
                                {filteredHarvests.map((harvest, index) => (
                                    <motion.div
                                        key={harvest.id}
                                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        transition={{ duration: 1, delay: index * 0.05 }}
                                        whileHover={{ y: -20, scale: 1.02 }}
                                        className="relative"
                                    >
                                        <div className={cn(glass.card, 'p-0 h-[680px] group hover:border-honey/60 hover:shadow-4xl cursor-pointer overflow-hidden transition-all duration-1000 border-white/5 bg-white/80 dark:bg-[#0D0D0D]/90 backdrop-blur-3xl rounded-[5rem] flex flex-col')}>
                                            <div className="absolute top-0 left-0 w-4 h-full bg-emerald-500/40 group-hover:bg-honey transition-all duration-1000" />
                                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-honey/[0.03] rounded-full blur-[100px] pointer-events-none" />

                                            <div className="p-16 pl-24 flex-1 flex flex-col justify-between relative z-10">
                                                <div className="space-y-12">
                                                    <div className="flex items-start justify-between">
                                                        <div className="space-y-6">
                                                            <div className={cn(glass.badge, 'bg-black/10 dark:bg-white/5 text-foreground/40 border-white/5 px-8 py-3 group-hover:bg-honey/10 group-hover:text-honey group-hover:border-honey/30 transition-all skew-x-[-12deg]')}>
                                                                <div className="skew-x-[12deg] flex items-center gap-4">
                                                                    <Package className="w-4 h-4" />
                                                                    <span className="text-[12px] font-black uppercase tracking-[0.4em] italic leading-none">{harvest.batch_code || 'N/A'}</span>
                                                                </div>
                                                            </div>
                                                            <div className="pt-6 flex items-baseline gap-6">
                                                                <h3 className="text-9xl font-black italic text-foreground tracking-tighter tabular-nums leading-none group-hover:scale-110 group-hover:text-honey transition-all duration-1000">{harvest.quantity_kg.toFixed(1)}</h3>
                                                                <span className="text-3xl font-black text-muted-foreground/20 italic uppercase tracking-tighter">KG</span>
                                                            </div>
                                                            <div className="flex items-center gap-6 pt-2">
                                                                <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-4xl animate-pulse" />
                                                                <p className="text-2xl font-black italic text-emerald-500 uppercase tracking-tight leading-none">{harvest.honey_type || 'Mixed Flower'}</p>
                                                            </div>
                                                        </div>
                                                        {harvest.is_verified && (
                                                            <div className="w-24 h-24 rounded-[3.5rem] bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shadow-4xl">
                                                                <Shield className="w-12 h-12" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="space-y-10">
                                                        <div className="flex items-center gap-8 py-8 border-y border-white/5 group-hover:border-honey/20 transition-all duration-1000">
                                                            <div className="w-14 h-14 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center border border-white/5 shadow-inner">
                                                                <Calendar className="w-8 h-8 text-honey opacity-40" />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <span className="text-3xl font-black italic text-foreground/60 uppercase tracking-tighter leading-none">{format(new Date(harvest.harvest_date), 'MMM d, yyyy').toUpperCase()}</span>
                                                                <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em] italic">Harvest Date</p>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-8">
                                                            <div className="p-8 bg-black/5 dark:bg-black/40 border border-white/5 rounded-[3rem] group-hover:translate-y-[-8px] transition-all shadow-inner space-y-4">
                                                                <div className="flex items-center gap-4 text-honey/40">
                                                                    <Hexagon className="w-5 h-5" />
                                                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] italic">HIVE</span>
                                                                </div>
                                                                <p className="text-xl font-black italic text-foreground tracking-tighter uppercase leading-none truncate">{harvest.hive?.hive_code || 'No Hive'}</p>
                                                            </div>
                                                            <div className="p-8 bg-black/5 dark:bg-black/40 border border-white/5 rounded-[3rem] group-hover:translate-y-[-8px] transition-all shadow-inner space-y-4">
                                                                <div className="flex items-center gap-4 text-emerald-500/40">
                                                                    <MapPin className="w-5 h-5" />
                                                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] italic">APIARY</span>
                                                                </div>
                                                                <p className="text-xl font-black italic text-foreground tracking-tighter uppercase leading-none truncate">{harvest.apiary?.name || 'No Apiary'}</p>
                                                            </div>
                                                        </div>

                                                        {harvest.color_grade && (
                                                            <div className={cn("inline-flex items-center gap-6 px-12 py-5 rounded-[2.5rem] shadow-4xl skew-x-[-12deg] transition-all border-2", getColorGradeStyles(harvest.color_grade))}>
                                                                <div className="skew-x-[12deg] flex items-center gap-6">
                                                                    <div className="w-4 h-4 rounded-full bg-current animate-pulse shadow-4xl" />
                                                                    <span className="font-black italic uppercase text-[12px] tracking-[0.4em]">{harvest.color_grade.toUpperCase()}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex justify-end pt-12">
                                                    <div className="w-24 h-24 rounded-[3.5rem] bg-honey text-black shadow-4xl flex items-center justify-center opacity-0 translate-y-20 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-1000 scale-75 group-hover:scale-110 active:scale-95">
                                                        <ArrowRight className="w-12 h-12" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
                .animate-shimmer { animation: shimmer 2.5s infinite linear; }
                .thin-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .thin-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .thin-scrollbar::-webkit-scrollbar-thumb { background: rgba(251, 191, 36, 0.1); border-radius: 20px; }
            `}</style>
        </motion.div>
    );
};

export default HarvestsView;
