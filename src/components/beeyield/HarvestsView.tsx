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
            'Extra Light Amber': 'bg-[#facc15]/10 text-[#064e3b] border-[#facc15]/20',
            'Light Amber': 'bg-[#facc15]/20 text-[#064e3b] border-[#facc15]/40',
            'Amber': 'bg-[#10b981]/10 text-[#064e3b] border-[#10b981]/20',
            'Dark Amber': 'bg-[#064e3b]/10 text-[#064e3b] border-[#064e3b]/20',
        };
        return styles[grade || ''] || 'bg-neutral-50 text-neutral-400 border-neutral-200';
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
                        className="h-14 w-14 rounded-none border-4 border-[#064e3b] bg-white text-[#064e3b] hover:bg-[#facc15]/10 transition-none"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </Button>
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[#10b981] bg-[#064e3b] mb-2">
                            <Package className="w-3.5 h-3.5 text-[#facc15]" />
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Yield Inventory</span>
                        </div>
                        <h1 className="text-5xl font-black text-[#064e3b] tracking-tighter uppercase leading-none">Log <span className="text-[#10b981]">Extraction</span></h1>
                    </div>
                </div>

                <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[12px_12px_0px_0px_rgba(6,78,59,1)] overflow-hidden max-w-5xl">
                    <CardHeader className="p-10 pb-6 border-b-4 border-[#064e3b]/10">
                        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-[#064e3b]/30">Harvest Parametrics</CardTitle>
                    </CardHeader>
                    <CardContent className="p-10 pt-8">
                        <form onSubmit={handleSubmit} className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-[0.2em] ml-1">Archive Date</Label>
                                    <Input
                                        type="date"
                                        value={formData.harvest_date}
                                        onChange={(e) => setFormData({ ...formData, harvest_date: e.target.value })}
                                        className="h-12 rounded-none border-4 border-[#064e3b] font-black text-[#064e3b] transition-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-[0.2em] ml-1">Net Weight (kg)</Label>
                                    <div className="relative">
                                        <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#10b981]" />
                                        <Input
                                            type="number"
                                            step="0.1"
                                            placeholder="0.0"
                                            value={formData.quantity_kg || ''}
                                            onChange={(e) => setFormData({ ...formData, quantity_kg: parseFloat(e.target.value) })}
                                            className="h-12 pl-10 rounded-none border-4 border-[#064e3b] font-black text-[#064e3b] transition-none focus-visible:bg-[#facc15]/5"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-[0.2em] ml-1">Varietal Feed</Label>
                                    <Select
                                        value={formData.honey_type}
                                        onValueChange={(val) => setFormData({ ...formData, honey_type: val })}
                                    >
                                        <SelectTrigger className="h-12 rounded-none border-4 border-[#064e3b] font-black text-xs uppercase transition-none">
                                            <Layers className="w-4 h-4 mr-2 text-[#10b981]" />
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-none border-2 border-[#064e3b]">
                                            <SelectItem value="Acacia">Acacia</SelectItem>
                                            <SelectItem value="Multifloral">Multifloral</SelectItem>
                                            <SelectItem value="Sunflower">Sunflower</SelectItem>
                                            <SelectItem value="Forest">Forest</SelectItem>
                                            <SelectItem value="Rapeseed">Rapeseed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-[0.2em] ml-1">Chromatic Grade</Label>
                                    <Select
                                        value={formData.color_grade}
                                        onValueChange={(val) => setFormData({ ...formData, color_grade: val })}
                                    >
                                        <SelectTrigger className="h-12 rounded-none border-4 border-[#064e3b] font-black text-xs uppercase transition-none">
                                            <div className="w-3 h-3 rounded-none mr-2 bg-[#facc15]" />
                                            <SelectValue placeholder="Select grade" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-none border-2 border-[#064e3b]">
                                            <SelectItem value="Extra Light Amber">Extra Light Amber</SelectItem>
                                            <SelectItem value="Light Amber">Light Amber</SelectItem>
                                            <SelectItem value="Amber">Amber</SelectItem>
                                            <SelectItem value="Dark Amber">Dark Amber</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-[0.2em] ml-1">Extraction Protocol</Label>
                                    <div className="relative">
                                        <Cpu className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#064e3b]/40" />
                                        <Input
                                            placeholder="e.g. Cold Centrifugue"
                                            value={formData.extraction_method || ''}
                                            onChange={(e) => setFormData({ ...formData, extraction_method: e.target.value })}
                                            className="h-12 pl-10 rounded-none border-4 border-[#064e3b] font-black text-[#064e3b] transition-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-[0.2em] ml-1">Extraction Environment</Label>
                                    <Input
                                        placeholder="e.g. Sunny / Temp Controlled"
                                        value={formData.weather_conditions || ''}
                                        onChange={(e) => setFormData({ ...formData, weather_conditions: e.target.value })}
                                        className="h-12 rounded-none border-4 border-[#064e3b] font-black text-[#064e3b] transition-none"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-6 pt-10 border-t-4 border-[#064e3b]/10">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsAddingHarvest(false)}
                                    className="h-12 px-6 rounded-none font-black text-[#064e3b]/40 hover:text-[#064e3b] hover:bg-[#facc15]/10 uppercase text-[10px] tracking-widest transition-none"
                                >
                                    Abort Registry
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isCreating}
                                    className="h-14 px-12 rounded-none bg-[#064e3b] text-white hover:bg-[#10b981] border-2 border-[#064e3b] font-black uppercase text-xs tracking-widest transition-none shadow-[6px_6px_0px_0px_rgba(16,185,129,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                                >
                                    {isCreating ? (
                                        <RefreshCw className="w-5 h-5 animate-spin mr-3" />
                                    ) : (
                                        <ShieldCheck className="w-5 h-5 mr-3 text-[#facc15]" />
                                    )}
                                    COMMIT PRODUCTION LOG
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
                    <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[#10b981] bg-[#064e3b] mb-6">
                        <Package className="w-3.5 h-3.5 text-[#facc15]" />
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Yield Management Registry</span>
                    </div>
                    <h1 className="text-6xl font-black text-[#064e3b] tracking-tighter uppercase leading-none">Extraction <span className="text-[#10b981]">Records</span></h1>
                    <p className="text-[#064e3b]/40 font-black mt-3 text-xl uppercase tracking-tight">
                        Biometric tracking of production and varietal classification.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => window.location.reload()}
                        className="h-12 w-12 rounded-none border-2 border-[#064e3b] text-[#064e3b] hover:bg-[#064e3b] hover:text-white transition-none"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </Button>
                    <Button
                        onClick={() => setIsAddingHarvest(true)}
                        className="h-12 px-8 rounded-none bg-[#064e3b] hover:bg-[#10b981] text-white border-2 border-[#064e3b] gap-3 font-black text-xs uppercase tracking-widest transition-none shadow-[4px_4px_0px_0px_rgba(16,185,129,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                    >
                        <Plus className="w-5 h-5" />
                        LOG EXTRACTION
                    </Button>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'Cumulative Yield', value: `${stats.totalHoney}kg`, icon: Zap, color: 'text-[#facc15]' },
                    { label: 'Extraction Cycles', value: stats.totalHarvests, icon: Package, color: 'text-[#10b981]' },
                    { label: 'Active Cycle', value: stats.thisMonth, icon: Calendar, color: 'text-white' },
                    { label: 'Yield Coefficient', value: `${stats.avgPerHarvest}kg`, icon: TrendingUp, color: 'text-[#10b981]' }
                ].map((stat, i) => (
                    <div key={i}>
                        <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[6px_6px_0px_0px_rgba(6,78,59,1)] overflow-hidden group hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 rounded-none bg-[#064e3b] flex items-center justify-center border-2 border-[#10b981]">
                                        <stat.icon className={cn("w-5 h-5", stat.color)} />
                                    </div>
                                    <p className="text-[9px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em]">{stat.label}</p>
                                </div>
                                <h3 className="text-4xl font-black text-[#064e3b] tracking-tighter uppercase">{stat.value}</h3>
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[8px_8px_0px_0px_rgba(6,78,59,1)] overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#064e3b]/30" />
                            <Input
                                placeholder="Search by batch identifier or honey varietal..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-12 rounded-none border-4 border-[#064e3b] bg-neutral-50/50 font-black text-xs uppercase transition-none focus-visible:ring-0 focus-visible:bg-[#facc15]/5"
                            />
                        </div>
                        <Select value={filterYear} onValueChange={setFilterYear}>
                            <SelectTrigger className="h-12 md:w-[220px] rounded-none border-4 border-[#064e3b] font-black text-xs uppercase transition-none bg-white">
                                <Calendar className="w-4 h-4 mr-2 text-[#10b981]" />
                                <SelectValue placeholder="Harvest Year" />
                            </SelectTrigger>
                            <SelectContent className="rounded-none border-2 border-[#064e3b] shadow-xl">
                                <SelectItem value="all" className="uppercase font-black text-[10px]">Across All Cycles</SelectItem>
                                <SelectItem value="2025" className="uppercase font-black text-[10px]">2025 Cycle</SelectItem>
                                <SelectItem value="2024" className="uppercase font-black text-[10px]">2024 Cycle</SelectItem>
                                <SelectItem value="2023" className="uppercase font-black text-[10px]">2023 Cycle</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" className="h-12 px-8 rounded-none border-2 border-[#064e3b] text-[#064e3b] hover:bg-[#064e3b] hover:text-white transition-none gap-2 font-black text-xs uppercase tracking-widest">
                            <Download className="w-4 h-4" />
                            EXPORT DATA
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
                        <h3 className="text-base font-black text-[#064e3b] px-2 uppercase tracking-tighter">Archive Feed</h3>
                        <div className="h-1 flex-1 bg-[#064e3b]/5" />
                        <span className="text-[10px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em]">{filteredHarvests.length} Batch Records</span>
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
                                        className="rounded-none border-4 border-[#064e3b] bg-white group hover:shadow-[12px_12px_0px_0px_rgba(6,78,59,1)] transition-all duration-300 border-l-[12px] border-l-[#10b981] overflow-hidden relative"
                                    >
                                        <CardContent className="p-8">
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="flex-1">
                                                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 border-2 border-[#10b981] bg-[#064e3b] mb-4">
                                                        <Package className="w-3 h-3 text-[#facc15]" />
                                                        <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">
                                                            {harvest.batch_code || 'UNIDENTIFIED'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-baseline gap-2">
                                                        <h3 className="text-5xl font-black text-[#064e3b] tracking-tighter">
                                                            {harvest.quantity_kg}
                                                        </h3>
                                                        <span className="text-xl font-black text-[#064e3b]/20 uppercase">kg</span>
                                                    </div>
                                                    <p className="text-xs font-black text-[#10b981] mt-1 uppercase tracking-tight">
                                                        {harvest.honey_type || 'Mixed Flora'} Varietal
                                                    </p>
                                                </div>
                                                {harvest.is_verified && (
                                                    <div className="w-12 h-12 rounded-none bg-[#10b981] text-white flex items-center justify-center border-2 border-[#064e3b] shadow-[4px_4px_0px_0px_rgba(6,78,59,1)]">
                                                        <ShieldCheck className="w-7 h-7" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-6">
                                                <div className="flex items-center gap-3 py-3 border-y-2 border-neutral-50">
                                                    <Calendar className="w-4 h-4 text-[#064e3b]/30" />
                                                    <span className="text-[10px] font-black text-[#064e3b] uppercase tracking-widest">
                                                        {format(new Date(harvest.harvest_date), 'MMM dd, yyyy')}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    {harvest.hive && (
                                                        <div className="flex items-center gap-3 px-3 py-2 bg-neutral-50/50 border-2 border-transparent group-hover:border-[#064e3b]/10 transition-none">
                                                            <Hexagon className="w-4 h-4 text-[#10b981]" />
                                                            <span className="text-[10px] font-black text-[#064e3b] uppercase">
                                                                #{harvest.hive.hive_code}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {harvest.apiary && (
                                                        <div className="flex items-center gap-3 px-3 py-2 bg-neutral-50/50 border-2 border-transparent group-hover:border-[#064e3b]/10 transition-none">
                                                            <MapPin className="w-4 h-4 text-[#10b981]" />
                                                            <span className="text-[10px] font-black text-[#064e3b] uppercase truncate">
                                                                {harvest.apiary.name}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {harvest.color_grade && (
                                                    <div className="pt-2">
                                                        <Badge className={cn("rounded-none px-3 py-1 border-2 font-black text-[8px] uppercase tracking-[0.2em] shadow-[3px_3px_0px_0px_rgba(6,78,59,1)]", getColorGradeStyles(harvest.color_grade))}>
                                                            <div className="w-2 h-2 rounded-none bg-current mr-2 opacity-40" />
                                                            {harvest.color_grade}
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                                <div className="w-12 h-12 rounded-none bg-[#064e3b] text-white flex items-center justify-center border-2 border-[#10b981] shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]">
                                                    <ArrowRight className="w-6 h-6" />
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
