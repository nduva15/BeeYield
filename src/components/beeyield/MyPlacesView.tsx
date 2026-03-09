import React from 'react';
import {
    Plus,
    MapPin,
    Trash2,
    Edit,
    Thermometer,
    LayoutGrid,
    List as ListIcon,
    Hexagon,
    ShieldCheck,
    ArrowRight,
    ChevronLeft,
    SearchX,
    RefreshCw,
    Wind,
    Sun,
    Sprout,
    Activity,
    Cpu,
    Target,
    Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Apiary,
    ApiaryCreateInput,
    Hive
} from '@/services/beeyieldService';
import {
    useApiaries,
    useCreateApiary,
    useUpdateApiary,
    useDeleteApiary,
    useHivesWithTelemetry
} from '@/hooks/useHives';
import { HivesTable } from './HivesTable';
import HiveFormModal from './HiveFormModal';
import OrchardDashboardView from './OrchardDashboardView';

// --- Detail View Component ---
const ApiaryDetailView = ({ apiary, setViewingApiary, onTabChange }: { apiary: Apiary; setViewingApiary: (a: Apiary | null) => void; onTabChange?: (tab: string) => void }) => {
    const { hives, isLoading: hivesLoading } = useHivesWithTelemetry(apiary.id);
    const [activeView, setActiveView] = React.useState<'dashboard' | 'details'>('dashboard');
    const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
    const [isAddingHive, setIsAddingHive] = React.useState(false);
    const [editingHive, setEditingHive] = React.useState<Hive | null>(null);

    const handleEditHive = (hive: Hive) => {
        setEditingHive(hive);
        setIsAddingHive(true);
    };

    const handleOpenAddHive = () => {
        setEditingHive(null);
        setIsAddingHive(true);
    };

    const getStatusColor = (status?: string) => {
        if (!status) return 'bg-gray-200';
        const s = status.toLowerCase();
        if (s.includes('healthy') || s.includes('active') || s.includes('ok')) return 'bg-emerald-500';
        if (s.includes('weak') || s.includes('warning') || s.includes('maintenance')) return 'bg-amber-500';
        if (s.includes('critical') || s.includes('abandoned') || s.includes('emergency')) return 'bg-red-500';
        return 'bg-gray-300';
    };

    const stats = React.useMemo(() => {
        const total = hives.length;
        const healthy = hives.filter(h => {
            const s = h.status?.toLowerCase() || '';
            return s.includes('healthy') || s.includes('active') || s.includes('ok');
        }).length;
        const warnings = hives.filter(h => h.status?.toLowerCase().includes('weak') || h.status?.toLowerCase().includes('maintenance')).length;
        const critical = hives.filter(h => h.status?.toLowerCase().includes('abandoned') || h.status?.toLowerCase().includes('critical')).length;

        return { total, healthy, warnings, critical };
    }, [hives]);

    return (
        <div className="space-y-12 pb-20 animate-in fade-in duration-500 honeycomb-bg min-h-screen p-8 -m-8">
            {/* Custom Detailed Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4">
                <div className="flex items-center gap-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewingApiary(null)}
                        className="h-16 w-16 rounded-[2rem] border border-border bg-white/50 backdrop-blur-md text-muted-foreground hover:text-honey shadow-sm transition-all hover:border-honey/50"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2.5 px-5 py-2 bg-honey/10 text-honey rounded-full text-[10px] font-black uppercase tracking-widest border border-honey/20 backdrop-blur-sm">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="uppercase tracking-[0.1em]">{apiary.location_name || 'Satellite Managed Sector'}</span>
                        </div>
                        <h1 className="text-6xl font-serif font-black text-honey tracking-tight leading-none">{apiary.name}</h1>
                    </div>
                </div>

                <div className="flex bg-muted/30 backdrop-blur-md p-2 rounded-[2rem] border border-border gap-1">
                    <Button
                        variant="ghost"
                        onClick={() => setActiveView('dashboard')}
                        className={cn('h-14 px-10 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all',
                            activeView === 'dashboard' ? 'bg-white text-honey shadow-md' : 'text-muted-foreground hover:text-honey'
                        )}
                    >
                        Spatial Map
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => setActiveView('details')}
                        className={cn('h-14 px-10 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all',
                            activeView === 'details' ? 'bg-white text-honey shadow-md' : 'text-muted-foreground hover:text-honey'
                        )}
                    >
                        Fleet Metrics
                    </Button>
                </div>
            </div>

            {activeView === 'dashboard' ? (
                <OrchardDashboardView apiary={apiary} onTabChange={onTabChange} />
            ) : (
                <div className="space-y-10">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        <motion.div whileHover={{ y: -4 }}>
                            <Card className="rounded-[2rem] border-slate-200/60 dark:border-white/5 p-8 text-center bg-white dark:bg-white/5 shadow-2xl shadow-black/5">
                                <Hexagon className="w-6 h-6 mx-auto mb-4 text-emerald-600" />
                                <p className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-widest mb-1">Total Hives</p>
                                <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.total}</p>
                            </Card>
                        </motion.div>
                        <motion.div whileHover={{ y: -4 }}>
                            <Card className="rounded-[2rem] border-slate-200/60 dark:border-white/5 p-8 text-center bg-white dark:bg-white/5 shadow-2xl shadow-black/5">
                                <ShieldCheck className="w-6 h-6 mx-auto mb-4 text-emerald-500" />
                                <p className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-widest mb-1">Healthy</p>
                                <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.healthy}</p>
                            </Card>
                        </motion.div>
                        <motion.div whileHover={{ y: -4 }}>
                            <Card className="rounded-[2rem] border-slate-200/60 dark:border-white/5 p-8 text-center bg-white dark:bg-white/5 shadow-2xl shadow-black/5">
                                <Activity className="w-6 h-6 mx-auto mb-4 text-amber-500" />
                                <p className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-widest mb-1">Attention</p>
                                <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.warnings}</p>
                            </Card>
                        </motion.div>
                        <motion.div whileHover={{ y: -4 }}>
                            <Card className="rounded-[2rem] border-slate-200/60 dark:border-white/5 p-8 text-center bg-white dark:bg-white/5 shadow-2xl shadow-black/5">
                                <Wind className="w-6 h-6 mx-auto mb-4 text-red-500" />
                                <p className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-widest mb-1">Critical</p>
                                <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.critical}</p>
                            </Card>
                        </motion.div>
                        <motion.div whileHover={{ y: -4 }}>
                            <Card className="rounded-[2rem] border-none p-8 text-center bg-amber-600 text-white shadow-xl shadow-amber-900/20">
                                <Sprout className="w-6 h-6 mx-auto mb-4 text-amber-200" />
                                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Net Acreage</p>
                                <p className="text-3xl font-black tracking-tighter">{apiary.size_acres || 0} Ac</p>
                            </Card>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                        {/* Left Panel: Hive Fleet Visualization */}
                        <Card className="lg:col-span-4 rounded-[2.5rem] border-slate-200/60 dark:border-white/5 bg-white dark:bg-white/5 shadow-2xl shadow-black/5 overflow-hidden flex flex-col min-h-[500px]">
                            <div className="p-8 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 dark:text-white/20 italic">Spatial Topology</h3>
                                <div className="flex bg-slate-50 dark:bg-black/20 p-1.5 rounded-2xl gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn("h-10 w-10 rounded-xl transition-all", viewMode === 'grid' ? "bg-white dark:bg-white/10 text-amber-600 shadow-sm" : "text-slate-400 dark:text-white/20")}
                                        onClick={() => setViewMode('grid')}
                                    >
                                        <LayoutGrid className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn("h-10 w-10 rounded-xl transition-all", viewMode === 'list' ? "bg-white dark:bg-white/10 text-amber-600 shadow-sm" : "text-slate-400 dark:text-white/20")}
                                        onClick={() => setViewMode('list')}
                                    >
                                        <ListIcon className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                                {viewMode === 'grid' ? (
                                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                                        {hives.map(hive => (
                                            <motion.div
                                                key={hive.id}
                                                whileHover={{ scale: 1.15, zIndex: 10 }}
                                                className={cn(
                                                    "aspect-square rounded-xl flex items-center justify-center text-[10px] font-black text-white transition-all cursor-pointer shadow-sm relative group",
                                                    getStatusColor(hive.status)
                                                )}
                                                onClick={() => handleEditHive(hive)}
                                            >
                                                {hive.hive_code.split('-').pop() || hive.hive_code.slice(-2)}
                                                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity" />
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {hives.slice(0, 50).map(hive => (
                                            <div
                                                key={hive.id}
                                                className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-transparent hover:border-amber-500/20 hover:bg-white dark:hover:bg-white/10 transition-all cursor-pointer group"
                                                onClick={() => handleEditHive(hive)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={cn("w-3 h-3 rounded-full shadow-sm", getStatusColor(hive.status))} />
                                                    <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Hive <span className="text-amber-600">#{hive.hive_code}</span></span>
                                                </div>
                                                <div className="flex items-center gap-4 text-[11px] font-black text-slate-400 dark:text-white/20 uppercase tracking-widest">
                                                    <span className="flex items-center gap-2">
                                                        <Thermometer className="w-3.5 h-3.5 text-orange-500" />
                                                        {((hive as any).latest_temp)?.toFixed(1) || '--'}°
                                                    </span>
                                                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Right Panel: Detailed Hives List (Table) */}
                        <Card className="lg:col-span-8 rounded-[2.5rem] border-slate-200/60 dark:border-white/5 bg-white dark:bg-white/5 shadow-2xl shadow-black/5 overflow-hidden min-h-[500px]">
                            <CardContent className="p-0">
                                <div className="p-10 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Fleet Audit Registry</h3>
                                    <Button
                                        onClick={handleOpenAddHive}
                                        className="h-12 px-8 rounded-2xl bg-neutral-900 dark:bg-amber-600 text-white gap-3 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-black/10 transition-all hover:scale-[1.02]"
                                    >
                                        <Plus className="w-4.5 h-4.5" /> Deploy Asset
                                    </Button>
                                </div>

                                <div className="p-0">
                                    {hivesLoading ? (
                                        <div className="p-10 space-y-6">
                                            {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-3xl bg-slate-50 dark:bg-white/5 animate-pulse" />)}
                                        </div>
                                    ) : (
                                        <HivesTable
                                            data={hives || []}
                                            onRowClick={handleEditHive}
                                        />
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            <HiveFormModal
                isOpen={isAddingHive}
                onClose={() => setIsAddingHive(false)}
                preselectedApiaryId={apiary.id}
                editingHive={editingHive}
            />
        </div>
    );
};

interface MyPlacesViewProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

const MyPlacesView: React.FC<MyPlacesViewProps> = ({ onTabChange }) => {
    // UI State
    const [isAddingPlace, setIsAddingPlace] = React.useState(false);
    const [editingApiary, setEditingApiary] = React.useState<Apiary | null>(null);
    const [viewingApiary, setViewingApiary] = React.useState<Apiary | null>(null);

    // TanStack Query Hooks
    const { data: apiaries = [], isLoading } = useApiaries();
    const createApiary = useCreateApiary();
    const updateApiary = useUpdateApiary();
    const deleteApiary = useDeleteApiary();

    // Form state
    const [formData, setFormData] = React.useState<ApiaryCreateInput>({
        name: '',
        type: 'permanent',
        location_name: '',
        region: '',
        forage_type: '',
        expected_hives: 0,
        size_acres: 0,
        notes: '',
    });

    const resetForm = () => {
        setIsAddingPlace(false);
        setEditingApiary(null);
        setFormData({
            name: '', type: 'permanent', location_name: '', region: '',
            forage_type: '', expected_hives: 0, size_acres: 0, notes: ''
        });
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            toast.error('Identify the sector name first');
            return;
        }

        try {
            if (editingApiary) {
                await updateApiary.mutateAsync({ id: editingApiary.id, data: formData });
                toast.success('Sector parameters updated');
            } else {
                await createApiary.mutateAsync(formData);
                toast.success('New colony sector established');
            }
            resetForm();
        } catch (error) { }
    };

    const handleEdit = (apiary: Apiary) => {
        setEditingApiary(apiary);
        setFormData({
            name: apiary.name,
            type: apiary.type || 'permanent',
            location_name: apiary.location_name || '',
            region: apiary.region || '',
            forage_type: apiary.forage_type || '',
            expected_hives: apiary.expected_hives || 0,
            size_acres: apiary.size_acres || 0,
            notes: apiary.notes || '',
        });
        setIsAddingPlace(true);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Decommission this sector and archive local records?')) return;
        try {
            await deleteApiary.mutateAsync(id);
            toast.success('Sector decommissioned');
        } catch (error) {
            console.error(error);
        }
    };

    if (viewingApiary) {
        return <ApiaryDetailView apiary={viewingApiary} setViewingApiary={setViewingApiary} onTabChange={onTabChange} />;
    }

    if (isAddingPlace) {
        return (
            <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={resetForm}
                        className="h-14 w-14 rounded-2xl border border-beeyield-sand bg-white text-beeyield-charcoal hover:bg-beeyield-forest/5 hover:text-beeyield-forest"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <div>
                        <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-beeyield-forest/5 border border-beeyield-forest/10 mb-2">
                            <MapPin className="w-3.5 h-3.5 text-beeyield-forest" />
                            <span className="text-[10px] font-bold text-beeyield-forest uppercase tracking-[0.1em]">{editingApiary ? 'Edit Coordinates' : 'Design Sector'}</span>
                        </div>
                        <h1 className="text-4xl font-bold text-beeyield-charcoal tracking-tight">Apiary Setup</h1>
                    </div>
                </div>

                <Card className="rounded-[3rem] border-[#E0E0E0] bg-white shadow-sm overflow-hidden max-w-5xl">
                    <CardHeader className="p-12 pb-6">
                        <CardTitle className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400">Sector Definition</CardTitle>
                    </CardHeader>
                    <CardContent className="p-12 pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1">Apiary Identifier*</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Ridge Field Highlands"
                                        className="h-14 rounded-2xl border-[#E0E0E0] font-bold text-beeyield-charcoal"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1">Establishment Type</Label>
                                    <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                                        <SelectTrigger className="h-14 rounded-2xl border-[#E0E0E0] font-bold text-beeyield-charcoal">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl">
                                            <SelectItem value="permanent">Permanent Territory</SelectItem>
                                            <SelectItem value="migratory">Migratory / Transient</SelectItem>
                                            <SelectItem value="breeding">Selection / Breeding</SelectItem>
                                            <SelectItem value="quarantine">Quarantine Isolation</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1">Colony Target</Label>
                                        <div className="relative">
                                            <Hexagon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-beeyield-forest" />
                                            <Input
                                                type="number"
                                                value={formData.expected_hives || ''}
                                                onChange={(e) => setFormData({ ...formData, expected_hives: parseInt(e.target.value) || 0 })}
                                                placeholder="0"
                                                className="h-14 pl-10 rounded-2xl border-[#E0E0E0] font-bold text-beeyield-charcoal"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1">Acreage (Net)</Label>
                                        <div className="relative">
                                            <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={formData.size_acres || ''}
                                                onChange={(e) => setFormData({ ...formData, size_acres: parseFloat(e.target.value) || 0 })}
                                                placeholder="0.00"
                                                className="h-14 pl-10 rounded-2xl border-[#E0E0E0] font-bold text-beeyield-charcoal"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1">Geographical Region</Label>
                                    <Input
                                        value={formData.location_name}
                                        onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                                        placeholder="e.g. Rift Valley / Mau Escarpment"
                                        className="h-14 rounded-2xl border-[#E0E0E0] font-bold text-beeyield-charcoal"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1">Dominant Forage</Label>
                                    <div className="relative">
                                        <Sprout className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-beeyield-forest" />
                                        <Input
                                            value={formData.forage_type}
                                            onChange={(e) => setFormData({ ...formData, forage_type: e.target.value })}
                                            placeholder="e.g. Wild Acacia / Lavender"
                                            className="h-14 pl-10 rounded-2xl border-[#E0E0E0] font-bold text-beeyield-charcoal"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1">Log / Notes</Label>
                                    <Textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="min-h-[140px] rounded-[2rem] border-[#E0E0E0] p-8 font-medium text-lg focus:ring-beeyield-forest/20 focus:border-beeyield-forest/30 transition-all resize-none"
                                        placeholder="Specific terrain features, accessibility, or security details..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-10 border-t border-[#F5F5F5] mt-10">
                            <Button
                                variant="ghost"
                                onClick={resetForm}
                                className="h-14 px-8 rounded-2xl font-bold text-gray-400 hover:text-beeyield-charcoal"
                            >
                                Discard
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={createApiary.isPending || updateApiary.isPending}
                                className="h-16 px-12 rounded-2xl bg-beeyield-forest text-white gap-3 font-bold text-lg shadow-xl shadow-beeyield-forest/20"
                            >
                                {createApiary.isPending || updateApiary.isPending ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                                {editingApiary ? 'Commit Updates' : 'Initialize Sector'}
                            </Button>
                        </div>
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
                        <MapPin className="w-3.5 h-3.5" />
                        Industrial Global Topology
                    </div>
                    <h1 className="text-6xl font-serif font-black text-honey tracking-tight leading-none">Apiary <span className="text-foreground">Network</span></h1>
                    <p className="text-sm font-medium text-muted-foreground max-w-lg leading-relaxed uppercase tracking-wider opacity-70">
                        Hierarchical management of your industrial apiaries and specialized bio-zones.
                    </p>
                </div>
                <Button
                    onClick={() => setIsAddingPlace(true)}
                    className="h-16 px-10 rounded-[2rem] bg-gradient-amber text-white hover:scale-[1.02] active:scale-[0.98] transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-honey/20 gap-3"
                >
                    <Plus className="w-6 h-6" />
                    Initialize Sector
                </Button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="aspect-[4/3] rounded-[3rem] bg-beeyield-sand/20 animate-pulse border border-beeyield-sand/30" />
                    ))}
                </div>
            ) : apiaries.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-beeyield-forest/5 border border-beeyield-forest/10 flex items-center justify-center mb-8">
                        <SearchX className="w-10 h-10 text-beeyield-forest/30" />
                    </div>
                    <h3 className="text-2xl font-bold text-beeyield-charcoal mb-3">No established sectors</h3>
                    <p className="text-gray-400 font-medium max-w-md mb-8">Establish your first apiary location to begin distributing your colony fleet across the network.</p>
                    <Button onClick={() => setIsAddingPlace(true)} className="h-12 px-6 rounded-xl bg-beeyield-forest text-white font-bold gap-2">
                        <Plus className="w-4 h-4" /> Add Coordinates
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    <AnimatePresence>
                        {apiaries.map((apiary, index) => (
                            <motion.div
                                key={apiary.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                            >
                                <Card
                                    className="group relative cursor-pointer hover:shadow-2xl hover:shadow-honey/10 transition-all duration-500 rounded-[2.5rem] border-border bg-white/80 backdrop-blur-md border-b-8 border-b-muted hover:border-b-honey overflow-hidden"
                                    onClick={() => setViewingApiary(apiary)}
                                >
                                    <CardContent className="p-10">
                                        <div className="flex justify-between items-start mb-10">
                                            <div className="flex-1">
                                                <Badge className="bg-muted text-muted-foreground border-border px-3.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-4">
                                                    {apiary.type || 'Permanent Sector'}
                                                </Badge>
                                                <h3 className="text-3xl font-serif font-black text-foreground group-hover:text-honey transition-colors leading-tight">
                                                    {apiary.name}
                                                </h3>
                                                <div className="flex items-center text-[10px] font-black text-muted-foreground mt-3 uppercase tracking-[0.15em] opacity-70">
                                                    <MapPin className="w-3.5 h-3.5 mr-2 text-honey" />
                                                    {apiary.location_name || 'Global Unassigned Coordinates'}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-center justify-center w-20 h-20 rounded-[1.75rem] bg-muted/50 border border-border group-hover:bg-gradient-amber group-hover:text-white transition-all duration-500 shadow-sm">
                                                <span className="text-2xl font-black">{apiary.hive_count || 0}</span>
                                                <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Assets</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8 py-8 border-t border-border">
                                            <div className="space-y-1">
                                                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-2 flex items-center gap-2 opacity-70">
                                                    <Sprout className="w-3 h-3 text-honey" /> Primary Flora
                                                </p>
                                                <p className="text-sm font-black text-foreground tracking-tight uppercase">{apiary.forage_type || 'Industrial Mix'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-2 flex items-center gap-2 opacity-70">
                                                    <Target className="w-3 h-3 text-honey" /> Sector Size
                                                </p>
                                                <p className="text-sm font-black text-foreground tracking-tight uppercase">{apiary.size_acres || 0} Acres</p>
                                            </div>
                                        </div>

                                        {/* Hover Actions */}
                                        <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0 flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => { e.stopPropagation(); handleEdit(apiary); }}
                                                className="h-12 w-12 rounded-xl bg-white dark:bg-white/10 shadow-2xl text-slate-400 hover:text-amber-600 border border-slate-200 dark:border-white/5"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => { e.stopPropagation(); handleDelete(apiary.id, e); }}
                                                className="h-12 w-12 rounded-xl bg-white dark:bg-white/10 shadow-2xl text-slate-400 hover:text-red-500 border border-slate-200 dark:border-white/5"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <div className="mt-4 pt-4 flex items-center justify-between">
                                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Autonomous Monitoring Online</span>
                                            <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-amber-600 transition-all duration-700">
                                                <ArrowRight className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default MyPlacesView;
