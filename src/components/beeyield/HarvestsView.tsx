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
            'Extra Light Amber': 'bg-[#F4D03F]/ text-[#F4D03F] border-amber-500/20',
            'Light Amber': 'bg-[#F4D03F]/ text-[#F4D03F] border-amber-500/40',
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(glass.page, "p-4 lg:p-6 space-y-6 pb-20")}
            >
                {/* Header */}
                <PageHeader
                    icon={Activity}
                    label="Harvest Log"
                    title={<>Honey <span className="text-[#F4D03F]">Harvest</span></>}
                    subtitle="Record production details."
                    actions={
                        <button
                            onClick={() => setIsAddingHarvest(false)}
                            className={cn(glass.btnSecondary, "w-10 h-10 p-0 flex items-center justify-center")}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    }
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 relative z-10">
                    {/* Left Column */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className={cn(glass.card, 'bg-[#1B9157]/5 border-[#1B9157]/10 p-6 rounded-2xl shadow-sm relative overflow-hidden group')}>
                            <div className="relative z-10 space-y-4">
                                <div className="w-10 h-10 rounded-xl bg-[#1B9157] flex items-center justify-center shadow-sm">
                                    <FlaskConical className="w-5 h-5 text-white" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Production Intelligence</h3>
                                    <p className="text-[10px] font-medium text-gray-500">Track yield distribution vectors and node productivity.</p>
                                </div>
                            </div>
                        </div>

                        <div className={glass.card}>
                            <div className="space-y-1 mb-4">
                                <h4 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Current Batch</h4>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F9F7F2] border border-[#F4D03F]/10">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ID</span>
                                    <span className="text-xs font-bold text-[#F4D03F] tabular-nums">BTCH_{new Date().getTime().toString().slice(-6)}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F9F7F2] border border-[#F4D03F]/10">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sync</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#1B9157] animate-pulse" />
                                        <span className="text-[10px] font-bold text-[#1B9157] uppercase tracking-wider">Stable</span>
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
                            className={cn(glass.card, "p-0 overflow-hidden relative")}
                        >
                            <div className="p-6 border-b border-[#F4D03F]/10 bg-[#F9F7F2] relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/20">
                                        <Layers className="w-5 h-5 text-[#F4D03F]" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h2 className="text-base font-bold text-[#1A1A1A] tracking-tight">Extraction <span className="text-[#F4D03F]">Log</span></h2>
                                        <p className="text-[10px] font-medium text-gray-500">Input production analytics.</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6 relative z-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className={glass.microLabel}>Temporal Point</Label>
                                        <div className="relative group/input">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F4D03F]/40" />
                                            <Input
                                                type="date"
                                                value={formData.harvest_date}
                                                onChange={(e) => setFormData({ ...formData, harvest_date: e.target.value })}
                                                className={cn(glass.input, "pl-10")}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={glass.microLabel}>Yield (KG)*</Label>
                                        <div className="relative group/input">
                                            <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1B9157]/40" />
                                            <Input
                                                type="number"
                                                step="0.1"
                                                placeholder="0.0"
                                                value={formData.quantity_kg || ''}
                                                onChange={(e) => setFormData({ ...formData, quantity_kg: parseFloat(e.target.value) })}
                                                className={cn(glass.input, "pl-10")}
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
                                            <SelectTrigger className={glass.select}>
                                                <div className="flex items-center gap-2">
                                                    <Database className="w-3.5 h-3.5 text-[#F4D03F]/40" />
                                                    <SelectValue placeholder="Select type" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className={glass.selectContent}>
                                                {['Acacia', 'Multifloral', 'Sunflower', 'Forest', 'Rapeseed'].map(v => (
                                                    <SelectItem key={v} value={v} className="text-xs font-bold">{v}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={glass.microLabel}>Grade Index</Label>
                                        <Select
                                            value={formData.color_grade}
                                            onValueChange={(val) => setFormData({ ...formData, color_grade: val })}
                                        >
                                            <SelectTrigger className={glass.select}>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-[#F4D03F]" />
                                                    <SelectValue placeholder="Select grade" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className={glass.selectContent}>
                                                {['Extra Light Amber', 'Light Amber', 'Amber', 'Dark Amber'].map(g => (
                                                    <SelectItem key={g} value={g} className="text-xs font-bold">{g}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={glass.microLabel}>Process Vector</Label>
                                        <div className="relative group/input">
                                            <Cpu className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A1A]/20" />
                                            <Input
                                                placeholder="e.g. Cold Centrifuge"
                                                value={formData.extraction_method || ''}
                                                onChange={(e) => setFormData({ ...formData, extraction_method: e.target.value })}
                                                className={cn(glass.input, "pl-10")}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={glass.microLabel}>Climatic State</Label>
                                        <div className="relative group/input">
                                            <Wind className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A1A]/20" />
                                            <Input
                                                placeholder="e.g. Sunny"
                                                value={formData.weather_conditions || ''}
                                                onChange={(e) => setFormData({ ...formData, weather_conditions: e.target.value })}
                                                className={cn(glass.input, "pl-10")}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3 border-t border-[#F4D03F]/10 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingHarvest(false)}
                                        className={glass.btnSecondary}
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isCreating}
                                        className={cn(glass.btnPrimary, "flex-1")}
                                    >
                                        {isCreating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                        Commit Log
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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, "p-4 lg:p-6 space-y-6 pb-20")}
        >
            {/* Header */}
            {/* Header */}
            <PageHeader
                icon={Package}
                label="Production Intelligence"
                title={<>Production <span className="text-[#F4D03F]">Registry</span></>}
                subtitle="Track honey extraction and packaging cycles."
                actions={
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => window.location.reload()}
                            className={cn(glass.btnSecondary, "w-9 h-9 p-0 flex items-center justify-center")}
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setIsAddingHarvest(true)}
                            className={glass.btnPrimary}
                        >
                            <Plus className="w-4 h-4" />
                            Log Extraction
                        </button>
                    </div>
                }
            />

            {/* Stats Matrix */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <GlassStatCard label="Gross Volume" value={`${stats.totalHoney}KG`} icon={Zap} index={0} />
                <GlassStatCard label="Total Cycles" value={stats.totalHarvests} icon={History} index={1} color="text-[#1A1A1A]" />
                <GlassStatCard label="Monthly Delta" value={stats.thisMonth} icon={Calendar} index={2} color="text-[#1A1A1A]" />
                <GlassStatCard label="Yield / Cycle" value={`${stats.avgPerHarvest}KG`} icon={Activity} index={3} color="text-[#1B9157]" />
            </div>

            {/* Registry Filter Bar */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={glass.filterBar}
            >
                <div className="flex-1 w-full relative group/search">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A1A]/20" />
                    <Input
                        placeholder="Filter batches..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-9 pl-9 bg-transparent border-none text-xs font-bold text-[#1A1A1A] placeholder:text-gray-400 focus-visible:ring-0"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto p-1 border-t md:border-t-0 md:border-l border-[#F4D03F]/10">
                    <Select value={filterYear} onValueChange={setFilterYear}>
                        <SelectTrigger className="h-8 w-full md:w-32 bg-transparent border-none focus:ring-0 text-xs font-bold text-gray-500">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" />
                                <SelectValue placeholder="Year" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className={glass.selectContent}>
                            <SelectItem value="all" className="font-bold text-xs">All Cycles</SelectItem>
                            {Array.from({ length: 9 }, (_, i) => {
                                const year = (new Date().getFullYear() - i).toString();
                                return (
                                    <SelectItem key={year} value={year} className="font-bold text-xs">{year}</SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                    <div className="w-px h-4 bg-[#F4D03F]/20 mx-1 hidden md:block" />
                    <button className="h-8 px-3 text-xs font-bold text-gray-500 hover:text-[#F4D03F] transition-all flex items-center gap-2">
                        <Download className="w-3.5 h-3.5" />
                        Export
                    </button>
                </div>
            </motion.div>

            {/* Main Registry Table */}
            <div className="mt-4 relative z-10">
                <div className={cn(glass.card, "p-0 overflow-hidden")}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[#F9F7F2]">
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-[#F4D03F]/10">Batch ID</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-[#F4D03F]/10">Timestamp</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-[#F4D03F]/10">Source Node</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-[#F4D03F]/10 text-center">Net Yield</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-[#F4D03F]/10 text-center">Grade</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-[#F4D03F]/10 text-right">Status</th>
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
                                                className="hover:bg-[#F9F7F2] transition-colors group"
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
                                                        {h.quantity_kg.toFixed(1)} <span className="text-[10px] font-medium opacity-50">KG</span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <Badge variant="outline" className="border-[#F4D03F]/20 text-[#F4D03F] font-bold text-[10px] uppercase tracking-wider bg-white">
                                                        {h.color_grade?.split(' ')[0] || 'A'}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Badge variant="outline" className="border-[#1B9157]/20 text-[#1B9157] font-bold text-[10px] uppercase tracking-wider bg-white">
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
        </motion.div>
    );
};

export default HarvestsView;
