import React from 'react';
import {
    Package,
    Plus,
    Calendar,
    MapPin,
    Hexagon,
    TrendingUp,
    Download,
    Search,
    RefreshCw,
    ShieldCheck,
    Zap,
    Wind,
    ArrowRight,
    ChevronLeft,
    SearchX,
    Filter,
    Layers,
    Cpu,
    Database,
    Binary
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useHarvests, useCreateHarvest } from '@/hooks/useHarvests';
import { Harvest } from '@/services/beeyieldService';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

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
            'Extra Light Amber': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/40',
            'Light Amber': 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60',
            'Amber': 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-900/40',
            'Dark Amber': 'bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-900/60',
        };
        return styles[grade || ''] || 'bg-slate-50 text-slate-400 border-slate-200';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.quantity_kg || formData.quantity_kg <= 0) {
            toast.error('Please enter a valid quantity');
            return;
        }

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
                toast.success('Yield archived successfully');
            }
        });
    };

    if (isAddingHarvest) {
        return (
            <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Custom Page Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4">
                    <div className="flex items-center gap-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsAddingHarvest(false)}
                            className="h-16 w-16 rounded-[1.5rem] border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 text-slate-400 hover:text-amber-600 shadow-sm transition-all"
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </Button>
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/40">
                                <Database className="w-3.5 h-3.5" />
                                <span className="uppercase tracking-[0.1em]">Yield Inventory Subsystem</span>
                            </div>
                            <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic">Log <span className="text-amber-500">Extraction</span></h1>
                        </div>
                    </div>
                </div>

                <Card className="rounded-[3rem] border border-slate-200/60 dark:border-white/5 bg-white dark:bg-white/5 shadow-2xl shadow-black/5 overflow-hidden max-w-5xl">
                    <CardHeader className="p-12 pb-8 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-white/20 italic">Master Extraction Parametrics</CardTitle>
                    </CardHeader>
                    <CardContent className="p-12 pt-10">
                        <form onSubmit={handleSubmit} className="space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em] ml-2">Archive Timestamp</Label>
                                    <Input
                                        type="date"
                                        value={formData.harvest_date}
                                        onChange={(e) => setFormData({ ...formData, harvest_date: e.target.value })}
                                        className="h-14 rounded-2xl border-slate-200 dark:border-white/10 bg-slate-50/30 dark:bg-black/20 font-black text-slate-900 dark:text-white focus-visible:ring-amber-500/20"
                                        required
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em] ml-2">Net Biomass (kg)</Label>
                                    <div className="relative">
                                        <TrendingUp className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                        <Input
                                            type="number"
                                            step="0.1"
                                            placeholder="0.0"
                                            value={formData.quantity_kg || ''}
                                            onChange={(e) => setFormData({ ...formData, quantity_kg: parseFloat(e.target.value) })}
                                            className="h-14 pl-12 rounded-2xl border-slate-200 dark:border-white/10 bg-slate-50/30 dark:bg-black/20 font-black text-slate-900 dark:text-white focus-visible:ring-amber-500/20"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em] ml-2">Varietal Feedstock</Label>
                                    <Select
                                        value={formData.honey_type}
                                        onValueChange={(val) => setFormData({ ...formData, honey_type: val })}
                                    >
                                        <SelectTrigger className="h-14 rounded-2xl border-slate-200 dark:border-white/10 bg-slate-50/30 dark:bg-black/20 font-black text-[10px] uppercase tracking-widest focus:ring-amber-500/20">
                                            <Layers className="w-4 h-4 mr-3 text-emerald-500" />
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-slate-200 dark:border-white/10 shadow-2xl">
                                            <SelectItem value="Acacia" className="p-4 font-black uppercase text-[10px] tracking-widest">Acacia</SelectItem>
                                            <SelectItem value="Multifloral" className="p-4 font-black uppercase text-[10px] tracking-widest">Multifloral</SelectItem>
                                            <SelectItem value="Sunflower" className="p-4 font-black uppercase text-[10px] tracking-widest">Sunflower</SelectItem>
                                            <SelectItem value="Forest" className="p-4 font-black uppercase text-[10px] tracking-widest">Forest</SelectItem>
                                            <SelectItem value="Rapeseed" className="p-4 font-black uppercase text-[10px] tracking-widest">Rapeseed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em] ml-2">Chromatic Grade</Label>
                                    <Select
                                        value={formData.color_grade}
                                        onValueChange={(val) => setFormData({ ...formData, color_grade: val })}
                                    >
                                        <SelectTrigger className="h-14 rounded-2xl border-slate-200 dark:border-white/10 bg-slate-50/30 dark:bg-black/20 font-black text-[10px] uppercase tracking-widest focus:ring-amber-500/20">
                                            <div className="w-3 h-3 rounded-full mr-3 bg-amber-500" />
                                            <SelectValue placeholder="Select grade" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-slate-200 dark:border-white/10 shadow-2xl">
                                            <SelectItem value="Extra Light Amber" className="p-4 font-black uppercase text-[10px] tracking-widest">Extra Light Amber</SelectItem>
                                            <SelectItem value="Light Amber" className="p-4 font-black uppercase text-[10px] tracking-widest">Light Amber</SelectItem>
                                            <SelectItem value="Amber" className="p-4 font-black uppercase text-[10px] tracking-widest">Amber</SelectItem>
                                            <SelectItem value="Dark Amber" className="p-4 font-black uppercase text-[10px] tracking-widest">Dark Amber</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em] ml-2">Mechanical Protocol</Label>
                                    <div className="relative">
                                        <Cpu className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input
                                            placeholder="e.g. Cold Centrifugue"
                                            value={formData.extraction_method || ''}
                                            onChange={(e) => setFormData({ ...formData, extraction_method: e.target.value })}
                                            className="h-14 pl-12 rounded-2xl border-slate-200 dark:border-white/10 bg-slate-50/30 dark:bg-black/20 font-black text-slate-900 dark:text-white focus-visible:ring-amber-500/20"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em] ml-2">Atmospheric Calibration</Label>
                                    <Input
                                        placeholder="e.g. Sunny / Temp Controlled"
                                        value={formData.weather_conditions || ''}
                                        onChange={(e) => setFormData({ ...formData, weather_conditions: e.target.value })}
                                        className="h-14 rounded-2xl border-slate-200 dark:border-white/10 bg-slate-50/30 dark:bg-black/20 font-black text-slate-900 dark:text-white focus-visible:ring-amber-500/20"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-6 pt-12 border-t border-slate-100 dark:border-white/10">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsAddingHarvest(false)}
                                    className="h-14 px-8 rounded-2xl font-black text-slate-400 hover:text-red-500 hover:bg-red-500/5 uppercase text-[11px] tracking-widest"
                                >
                                    Abort Registry
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isCreating}
                                    className="h-16 px-12 rounded-2xl bg-neutral-900 dark:bg-amber-600 text-white hover:scale-[1.02] active:scale-[0.98] transition-all font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-black/10"
                                >
                                    {isCreating ? (
                                        <RefreshCw className="w-5 h-5 animate-spin mr-3" />
                                    ) : (
                                        <ShieldCheck className="w-5 h-5 mr-3 text-amber-200" />
                                    )}
                                    Commit Production Log
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20 animate-in fade-in duration-500 honeycomb-bg min-h-screen p-8 -m-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2.5 px-5 py-2 bg-honey/10 text-honey rounded-full text-[10px] font-black uppercase tracking-widest border border-honey/20 backdrop-blur-sm">
                        <Package className="w-3.5 h-3.5" />
                        Yield Inventory Registry
                    </div>
                    <h1 className="text-6xl font-serif font-black text-honey tracking-tight leading-none">Extraction <span className="text-foreground">Records</span></h1>
                    <p className="text-sm font-medium text-muted-foreground max-w-lg leading-relaxed uppercase tracking-wider opacity-70">
                        Autonomous biometric tracking of production yields and varietal classification protocols.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.location.reload()}
                        className="h-16 w-16 rounded-[2rem] border border-border bg-white/50 backdrop-blur-md text-muted-foreground hover:text-honey shadow-sm transition-all hover:border-honey/50"
                    >
                        <RefreshCw className="w-6 h-6" />
                    </Button>
                    <Button
                        onClick={() => setIsAddingHarvest(true)}
                        className="h-16 px-10 rounded-[2rem] bg-gradient-amber text-white hover:scale-[1.02] active:scale-[0.98] transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-honey/20 gap-3"
                    >
                        <Plus className="w-6 h-6" />
                        Log Extraction
                    </Button>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'Cumulative Yield', value: `${stats.totalHoney}kg`, icon: Zap, color: 'text-honey', bg: 'bg-honey/10' },
                    { label: 'Extraction Cycles', value: stats.totalHarvests, icon: Package, color: 'text-honey', bg: 'bg-honey/10' },
                    { label: 'Current Cycle', value: stats.thisMonth, icon: Calendar, color: 'text-honey', bg: 'bg-honey/10' },
                    { label: 'Yield Coefficient', value: `${stats.avgPerHarvest}kg`, icon: TrendingUp, color: 'text-honey', bg: 'bg-honey/10' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="rounded-[2.5rem] border border-border bg-white/80 backdrop-blur-md shadow-xl shadow-black/5 hover:border-honey/30 transition-all group overflow-hidden">
                            <CardContent className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.bg)}>
                                        <stat.icon className={cn("w-7 h-7", stat.color)} />
                                    </div>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-tight text-right opacity-70">{stat.label}</p>
                                </div>
                                <h3 className="text-4xl font-serif font-black text-foreground tabular-nums tracking-tight">{stat.value}</h3>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Productivity Overview */}
            <Card className="rounded-[3rem] border border-border bg-white/80 backdrop-blur-md shadow-2xl shadow-black/5 overflow-hidden">
                <CardHeader className="p-10 pb-6 flex flex-row items-center justify-between bg-muted/30 border-b border-border">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-70">Strategic Yield Performance Matrix</p>
                        <h2 className="text-4xl font-serif font-black text-honey tracking-tight leading-none">
                            Fiscal {filterYear === 'all' ? new Date().getFullYear() : filterYear} <span className="text-foreground">Audit</span>
                        </h2>
                    </div>
                    <Select value={filterYear} onValueChange={setFilterYear}>
                        <SelectTrigger className="h-16 w-48 rounded-2xl border-border bg-white font-black text-xl shadow-sm focus:ring-honey/20">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-border shadow-2xl max-h-[300px] backdrop-blur-xl bg-white/90">
                            <SelectItem value="all" className="font-black text-[10px] uppercase p-4 tracking-widest">Master Archive</SelectItem>
                            {Array.from({ length: new Date().getFullYear() - 2000 + 1 }, (_, i) => {
                                const year = (new Date().getFullYear() - i).toString();
                                return (
                                    <SelectItem key={year} value={year} className="font-black text-[10px] uppercase p-4 tracking-widest">
                                        Cycle {year}
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent className="p-10 pt-8">
                    <div className="bg-honey/5 border border-honey/20 rounded-2xl p-8 mb-10 flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-honey/10 flex items-center justify-center text-honey">
                            <Binary className="w-6 h-6" />
                        </div>
                        <p className="text-[10px] font-black text-honey/80 uppercase tracking-[0.2em] leading-relaxed">
                            BeeYield Neural analysis engine is currently auditing historical metadata for this sector.
                            <br /><span className="text-muted-foreground opacity-50">Deep telemetry integration active.</span>
                        </p>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="pb-8 text-left text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-50">Strategic Apiary Sector</th>
                                    <th className="pb-8 text-center text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-50">Units</th>
                                    <th className="pb-8 text-center text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-50">Gross Yield</th>
                                    <th className="pb-8 text-center text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-50">Efficiency</th>
                                    <th className="pb-8 text-right text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-50">Variance Δ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {[
                                    { id: 1, name: 'Rogulski Prime', families: 4, total: 27.52, change: 0.72 },
                                    { id: 2, name: 'Caesar Ridge', families: 9, total: 52.6, change: -0.32 },
                                ].map((item) => (
                                    <tr key={item.id} className="group hover:bg-honey/5 transition-colors">
                                        <td className="py-10">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center border border-border font-black text-[10px] text-muted-foreground">
                                                    #{item.id}
                                                </div>
                                                <span className="font-serif text-2xl font-black text-foreground tracking-tight">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-10 text-center font-black text-muted-foreground tabular-nums tracking-widest uppercase text-[11px]">{item.families} Units</td>
                                        <td className="py-10 text-center font-black text-foreground tabular-nums text-lg">{item.total.toFixed(2)} KG</td>
                                        <td className="py-10 text-center font-black text-muted-foreground/60 tabular-nums">{(item.total / item.families).toFixed(2)} KG/U</td>
                                        <td className={cn("py-10 text-right font-black tabular-nums text-lg", item.change >= 0 ? "text-honey" : "text-destructive")}>
                                            {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)} KG
                                        </td>
                                    </tr>
                                )).concat(harvests.filter(h => h.apiary).slice(0, 3).map((h, i) => (
                                    <tr key={`h-${i}`} className="group hover:bg-honey/5 transition-colors">
                                        <td className="py-10">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center border border-border font-black text-[10px] text-muted-foreground">
                                                    #{i + 3}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-8 text-center font-black text-slate-400 tabular-nums">1</td>
                                        <td className="py-8 text-center font-black text-slate-900 dark:text-white tabular-nums">{h.quantity_kg.toFixed(2)} KG</td>
                                        <td className="py-8 text-center font-black text-slate-400/60 tabular-nums">{h.quantity_kg.toFixed(2)} KG/UNIT</td>
                                        <td className="py-8 text-right font-black tabular-nums text-emerald-500">+0.00 KG</td>
                                    </tr>
                                )))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Filters */}
            <Card className="rounded-[2.5rem] border border-slate-200/60 dark:border-white/5 bg-white dark:bg-white/5 shadow-2xl shadow-black/5 overflow-hidden">
                <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-4.5 h-4.5 text-slate-400/50" />
                            <Input
                                placeholder="Query master archive by batch ID or varietal profile..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-14 h-14 rounded-2xl border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 font-black text-[10px] uppercase tracking-widest transition-all focus-within:bg-white dark:focus-within:bg-white/10"
                            />
                        </div>
                        <Select value={filterYear} onValueChange={setFilterYear}>
                            <SelectTrigger className="h-14 md:w-[240px] rounded-2xl border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 font-black text-[10px] uppercase tracking-widest focus:ring-amber-500/20">
                                <Calendar className="w-4.5 h-4.5 mr-3 text-emerald-500" />
                                <SelectValue placeholder="Harvest Year" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-200 dark:border-white/10 shadow-2xl">
                                <SelectItem value="all" className="uppercase font-black text-[10px] p-4 tracking-widest text-slate-400 italic">Temporal Master Feed</SelectItem>
                                {Array.from({ length: new Date().getFullYear() - 2000 + 1 }, (_, i) => {
                                    const year = (new Date().getFullYear() - i).toString();
                                    return (
                                        <SelectItem key={year} value={year} className="uppercase font-black text-[10px] p-4 tracking-widest">
                                            Cycle {year} Registry
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                        <Button variant="ghost" className="h-14 px-10 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-white/40 hover:text-amber-600 transition-all gap-3 font-black text-[10px] uppercase tracking-widest">
                            <Download className="w-5 h-5" />
                            Export Data
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* List Content */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="aspect-[4/3] rounded-[2.5rem] bg-slate-50 dark:bg-white/5 animate-pulse border border-slate-100 dark:border-white/10" />
                    ))}
                </div>
            ) : filteredHarvests.length === 0 ? (
                <div className="py-32 text-center flex flex-col items-center animate-in fade-in zoom-in duration-500">
                    <div className="w-28 h-28 rounded-[2.5rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center mb-10 shadow-sm">
                        <SearchX className="w-12 h-12 text-slate-300 dark:text-white/10" />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter italic">No Extraction Protocols Found</h3>
                    <p className="text-slate-500 dark:text-white/20 font-medium max-w-sm mb-12 text-sm leading-relaxed">
                        Begin documenting production yields by initializing your first extraction cycle registry.
                    </p>
                    <Button onClick={() => setIsAddingHarvest(true)} className="h-16 px-12 rounded-2xl bg-neutral-900 dark:bg-amber-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-black/10 hover:scale-[1.02] transition-all gap-3">
                        <Plus className="w-5 h-5" /> Initialize Production Log
                    </Button>
                </div>
            ) : (
                <div className="space-y-10">
                    <div className="flex items-center gap-6 px-4">
                        <h3 className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.4em] italic whitespace-nowrap">Production Archive Feed</h3>
                        <div className="h-[2px] flex-1 bg-slate-100 dark:bg-white/5" />
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-4 py-1.5 rounded-full">{filteredHarvests.length} Active Records</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        <AnimatePresence mode="popLayout">
                            {filteredHarvests.map((harvest, index) => (
                                <motion.div
                                    key={harvest.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                    whileHover={{ y: -8 }}
                                >
                                    <Card
                                        className="rounded-[2.5rem] border border-slate-200/60 dark:border-white/5 bg-white dark:bg-white/5 group hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 overflow-hidden relative"
                                    >
                                        <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500 group-hover:w-3 transition-all" />

                                        <CardContent className="p-10 pl-12">
                                            <div className="flex items-start justify-between mb-8">
                                                <div className="flex-1 space-y-4">
                                                    <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-neutral-900 dark:bg-white/5 text-white dark:text-amber-500 rounded-xl transition-all group-hover:bg-amber-600 group-hover:text-white">
                                                        <Package className="w-3.5 h-3.5" />
                                                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                                                            {harvest.batch_code || 'UNIDENTIFIED'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-baseline gap-3">
                                                        <h3 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter italic tabular-nums leading-none">
                                                            {harvest.quantity_kg}
                                                        </h3>
                                                        <span className="text-xl font-black text-slate-300 dark:text-white/10 uppercase italic">kg</span>
                                                    </div>
                                                    <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest italic">
                                                        {harvest.honey_type || 'Mixed Flora'} Varietal Matrix
                                                    </p>
                                                </div>
                                                {harvest.is_verified && (
                                                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/40 shadow-sm group-hover:scale-110 transition-transform">
                                                        <ShieldCheck className="w-8 h-8" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-6">
                                                <div className="flex items-center gap-4 py-4 border-y border-slate-50 dark:border-white/5">
                                                    <Calendar className="w-4.5 h-4.5 text-slate-300 dark:text-white/10" />
                                                    <span className="text-[10px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest">
                                                        {format(new Date(harvest.harvest_date), 'MMMM d, yyyy')}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    {harvest.hive && (
                                                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl group-hover:bg-white dark:group-hover:bg-white/5 transition-all">
                                                            <Hexagon className="w-4 h-4 text-amber-500" />
                                                            <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                                                #{harvest.hive.hive_code}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {harvest.apiary && (
                                                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl group-hover:bg-white dark:group-hover:bg-white/5 transition-all">
                                                            <MapPin className="w-4 h-4 text-emerald-500" />
                                                            <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">
                                                                {harvest.apiary.name}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {harvest.color_grade && (
                                                    <div className="pt-2">
                                                        <Badge className={cn("rounded-2xl px-4 py-2 border-none font-black text-[9px] uppercase tracking-widest shadow-sm", getColorGradeStyles(harvest.color_grade))}>
                                                            <div className="w-2.5 h-2.5 rounded-full bg-current mr-3 opacity-40 shadow-sm" />
                                                            {harvest.color_grade}
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-700 bg-neutral-900 dark:bg-amber-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100">
                                                <ArrowRight className="w-6 h-6" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HarvestsView;
