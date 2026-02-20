import React, { useState } from 'react';
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
    Cpu
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
    const [searchQuery, setSearchQuery] = useState('');
    const [filterYear, setFilterYear] = useState<string>('all');
    const [isAddingHarvest, setIsAddingHarvest] = useState(false);

    React.useEffect(() => {
        if (initialParams?.action === 'open_add_new') {
            setIsAddingHarvest(true);
        }
    }, [initialParams]);

    const [formData, setFormData] = useState<Partial<Harvest>>({
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
            'Extra Light Amber': 'bg-amber-50 text-amber-600 border-amber-100',
            'Light Amber': 'bg-amber-100/50 text-amber-700 border-amber-200',
            'Amber': 'bg-amber-500/10 text-amber-800 border-amber-500/20',
            'Dark Amber': 'bg-amber-900/10 text-amber-950 border-amber-900/20',
        };
        return styles[grade || ''] || 'bg-gray-50 text-gray-600 border-gray-100';
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
            <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Custom Page Header */}
                <div className="flex items-center gap-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsAddingHarvest(false)}
                        className="h-14 w-14 rounded-2xl border border-beeyield-sand bg-white text-beeyield-charcoal hover:bg-beeyield-forest/5 hover:text-beeyield-forest"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <div>
                        <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-beeyield-forest/5 border border-beeyield-forest/10 mb-2">
                            <Package className="w-3.5 h-3.5 text-beeyield-forest" />
                            <span className="text-[10px] font-bold text-beeyield-forest uppercase tracking-[0.1em]">Yield Inventory</span>
                        </div>
                        <h1 className="text-4xl font-bold text-beeyield-charcoal tracking-tight">Log Extraction</h1>
                    </div>
                </div>

                <Card className="rounded-[3rem] border-[#E0E0E0] bg-white shadow-sm overflow-hidden max-w-5xl">
                    <CardHeader className="p-12 pb-6">
                        <CardTitle className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400">Harvest Parametrics</CardTitle>
                    </CardHeader>
                    <CardContent className="p-12 pt-0">
                        <form onSubmit={handleSubmit} className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-3">
                                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1">Archive Date</Label>
                                    <Input
                                        type="date"
                                        value={formData.harvest_date}
                                        onChange={(e) => setFormData({ ...formData, harvest_date: e.target.value })}
                                        className="h-14 rounded-2xl border-[#E0E0E0] font-bold text-beeyield-charcoal"
                                        required
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1">Net Weight (kg)</Label>
                                    <div className="relative">
                                        <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                        <Input
                                            type="number"
                                            step="0.1"
                                            placeholder="0.0"
                                            value={formData.quantity_kg || ''}
                                            onChange={(e) => setFormData({ ...formData, quantity_kg: parseFloat(e.target.value) })}
                                            className="h-14 pl-10 rounded-2xl border-[#E0E0E0] font-bold text-beeyield-charcoal"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1">Varietal Feed</Label>
                                    <Select
                                        value={formData.honey_type}
                                        onValueChange={(val) => setFormData({ ...formData, honey_type: val })}
                                    >
                                        <SelectTrigger className="h-14 rounded-2xl border-[#E0E0E0] font-bold text-beeyield-charcoal">
                                            <Layers className="w-4 h-4 mr-2 text-beeyield-forest" />
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl">
                                            <SelectItem value="Acacia">Acacia</SelectItem>
                                            <SelectItem value="Multifloral">Multifloral</SelectItem>
                                            <SelectItem value="Sunflower">Sunflower</SelectItem>
                                            <SelectItem value="Forest">Forest</SelectItem>
                                            <SelectItem value="Rapeseed">Rapeseed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1">Chromatic Grade</Label>
                                    <Select
                                        value={formData.color_grade}
                                        onValueChange={(val) => setFormData({ ...formData, color_grade: val })}
                                    >
                                        <SelectTrigger className="h-14 rounded-2xl border-[#E0E0E0] font-bold text-beeyield-charcoal">
                                            <div className="w-3 h-3 rounded-full mr-2 bg-amber-400" />
                                            <SelectValue placeholder="Select grade" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl">
                                            <SelectItem value="Extra Light Amber">Extra Light Amber</SelectItem>
                                            <SelectItem value="Light Amber">Light Amber</SelectItem>
                                            <SelectItem value="Amber">Amber</SelectItem>
                                            <SelectItem value="Dark Amber">Dark Amber</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1">Extraction Protocol</Label>
                                    <div className="relative">
                                        <Cpu className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            placeholder="e.g. Cold Centrifugue"
                                            value={formData.extraction_method || ''}
                                            onChange={(e) => setFormData({ ...formData, extraction_method: e.target.value })}
                                            className="h-14 pl-10 rounded-2xl border-[#E0E0E0] font-bold text-beeyield-charcoal"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1">Extraction Environment</Label>
                                    <Input
                                        placeholder="e.g. Sunny / Temp Controlled"
                                        value={formData.weather_conditions || ''}
                                        onChange={(e) => setFormData({ ...formData, weather_conditions: e.target.value })}
                                        className="h-14 rounded-2xl border-[#E0E0E0] font-bold text-beeyield-charcoal"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-10 border-t border-[#F5F5F5]">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsAddingHarvest(false)}
                                    className="h-14 px-8 rounded-2xl font-bold text-gray-400 hover:text-beeyield-charcoal"
                                >
                                    Discard
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isCreating}
                                    className="h-16 px-12 rounded-2xl bg-beeyield-forest text-white gap-3 font-bold text-lg shadow-xl shadow-beeyield-forest/20"
                                >
                                    {isCreating ? (
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <ShieldCheck className="w-5 h-5" />
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
        <div className="space-y-12 pb-20 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-beeyield-forest/5 border border-beeyield-forest/10 mb-6">
                        <Package className="w-3.5 h-3.5 text-beeyield-forest" />
                        <span className="text-[10px] font-bold text-beeyield-forest uppercase tracking-[0.15em]">Yield Management</span>
                    </div>
                    <h1 className="text-5xl font-bold text-beeyield-charcoal tracking-tight">Extraction Records</h1>
                    <p className="text-gray-500 font-medium mt-3 text-lg">
                        Biometric tracking of honey production and varietal classification.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.location.reload()}
                        className="h-14 w-14 rounded-2xl border border-beeyield-sand bg-white text-beeyield-charcoal hover:bg-beeyield-forest/5 hover:text-beeyield-forest"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </Button>
                    <Button
                        onClick={() => setIsAddingHarvest(true)}
                        className="h-14 px-8 rounded-2xl bg-beeyield-forest hover:opacity-90 text-white shadow-lg shadow-beeyield-forest/20 gap-3 font-bold text-sm tracking-wide"
                    >
                        <Plus className="w-5 h-5" />
                        Log Extraction
                    </Button>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                    { label: 'Cumulative Yield', value: `${stats.totalHoney}kg`, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
                    { label: 'Extraction Cycles', value: stats.totalHarvests, icon: Package, color: 'text-beeyield-forest', bg: 'bg-beeyield-forest/5' },
                    { label: 'Active Cycle', value: stats.thisMonth, icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { label: 'Yield Coefficient', value: `${stats.avgPerHarvest}kg`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' }
                ].map((stat, i) => (
                    <motion.div key={i} whileHover={{ y: -4, scale: 1.01 }}>
                        <Card className="rounded-[2rem] border-[#E0E0E0] bg-white shadow-sm overflow-hidden group">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:bg-beeyield-forest group-hover:border-beeyield-forest group-hover:text-white", stat.bg)}>
                                        <stat.icon className={cn("w-6 h-6 stroke-[2] transition-colors duration-500 group-hover:text-white", stat.color)} />
                                    </div>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">{stat.label}</p>
                                </div>
                                <h3 className="text-4xl font-bold text-beeyield-charcoal tracking-tighter">{stat.value}</h3>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <Card className="rounded-[2.5rem] border-[#E0E0E0] bg-white shadow-sm overflow-hidden">
                <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search by batch identifier or honey varietal..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 h-14 rounded-2xl border-[#E0E0E0] bg-white font-medium text-sm focus:ring-beeyield-forest/20 focus:border-beeyield-forest/30 transition-all shadow-sm"
                            />
                        </div>
                        <Select value={filterYear} onValueChange={setFilterYear}>
                            <SelectTrigger className="h-14 md:w-[220px] rounded-2xl border-[#E0E0E0] font-bold text-sm bg-white shadow-sm">
                                <Calendar className="w-4 h-4 mr-2 text-beeyield-forest" />
                                <SelectValue placeholder="Harvest Year" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-[#E0E0E0] shadow-xl">
                                <SelectItem value="all">Across All Cycles</SelectItem>
                                <SelectItem value="2025">2025 Cycle</SelectItem>
                                <SelectItem value="2024">2024 Cycle</SelectItem>
                                <SelectItem value="2023">2023 Cycle</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" className="h-14 px-8 rounded-2xl border-[#E0E0E0] text-beeyield-charcoal hover:bg-beeyield-forest/5 hover:border-beeyield-forest/20 hover:text-beeyield-forest transition-all gap-2 font-bold text-sm">
                            <Download className="w-4 h-4" />
                            Export Data
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* List Content */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="aspect-[4/3] rounded-[2.5rem] bg-beeyield-sand/20 animate-pulse border border-beeyield-sand/30" />
                    ))}
                </div>
            ) : filteredHarvests.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-beeyield-forest/5 border border-beeyield-forest/10 flex items-center justify-center mb-8">
                        <SearchX className="w-10 h-10 text-beeyield-forest/30" />
                    </div>
                    <h3 className="text-2xl font-bold text-beeyield-charcoal mb-3">No Extractions Found</h3>
                    <p className="text-gray-400 font-medium max-w-md mb-8">Begin documenting your production metrics by logging your first extraction cycle.</p>
                    <Button onClick={() => setIsAddingHarvest(true)} className="h-12 px-6 rounded-xl bg-beeyield-forest text-white font-bold gap-2">
                        <Plus className="w-4 h-4" /> Log First Harvest
                    </Button>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-beeyield-charcoal px-2">Archive Feed</h3>
                        <div className="h-[1px] flex-1 bg-[#F5F5F5]" />
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{filteredHarvests.length} Batch Records</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence mode="popLayout">
                            {filteredHarvests.map((harvest, index) => (
                                <motion.div
                                    key={harvest.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.05 }}
                                >
                                    <Card
                                        className="rounded-[2.5rem] border-[#E0E0E0] bg-white group hover:shadow-xl hover:shadow-beeyield-forest/5 hover:border-beeyield-forest/20 transition-all duration-300 border-l-4 border-l-beeyield-forest overflow-hidden relative"
                                    >
                                        <CardContent className="p-10">
                                            <div className="flex items-start justify-between mb-8">
                                                <div className="flex-1">
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-beeyield-sand/30 border border-[#E8E0D5] mb-4">
                                                        <Package className="w-3.5 h-3.5 text-beeyield-forest" />
                                                        <span className="text-[9px] font-black text-beeyield-charcoal uppercase tracking-[0.15em]">
                                                            {harvest.batch_code || 'UNIDENTIFIED'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-baseline gap-2">
                                                        <h3 className="text-4xl font-bold text-beeyield-charcoal tracking-tight">
                                                            {harvest.quantity_kg}
                                                        </h3>
                                                        <span className="text-lg font-bold text-gray-400">kg</span>
                                                    </div>
                                                    <p className="text-base font-bold text-beeyield-forest mt-1">
                                                        {harvest.honey_type || 'Mixed Flora'} Varietal
                                                    </p>
                                                </div>
                                                {harvest.is_verified && (
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                                                        <ShieldCheck className="w-6 h-6" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3 py-3 border-y border-[#F8F8F8]">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm font-bold text-beeyield-charcoal">
                                                        {format(new Date(harvest.harvest_date), 'MMM dd, yyyy')}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    {harvest.hive && (
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-beeyield-sand/30 flex items-center justify-center text-beeyield-forest">
                                                                <Hexagon className="w-4 h-4" />
                                                            </div>
                                                            <span className="text-xs font-bold text-beeyield-charcoal">
                                                                #{harvest.hive.hive_code}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {harvest.apiary && (
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-beeyield-sand/30 flex items-center justify-center text-beeyield-forest">
                                                                <MapPin className="w-4 h-4" />
                                                            </div>
                                                            <span className="text-xs font-bold text-beeyield-charcoal truncate">
                                                                {harvest.apiary.name}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {harvest.color_grade && (
                                                    <div className="pt-2">
                                                        <Badge className={cn("rounded-lg px-3 py-1 border font-bold text-[9px] uppercase tracking-widest", getColorGradeStyles(harvest.color_grade))}>
                                                            <div className="w-2 h-2 rounded-full bg-current mr-2 opacity-40" />
                                                            {harvest.color_grade}
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                                                <div className="w-10 h-10 rounded-xl bg-beeyield-forest text-white flex items-center justify-center shadow-lg shadow-beeyield-forest/20">
                                                    <ArrowRight className="w-5 h-5" />
                                                </div>
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
