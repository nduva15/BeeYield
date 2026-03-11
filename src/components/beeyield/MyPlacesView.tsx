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
    Layers,
    Navigation,
    Search,
    ChevronRight,
    Box,
    ExternalLink,
    AlertCircle,
    Info,
    Calendar,
    Settings,
    Binary,
    Shield,
    Database
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { glass, PageHeader, GlassStatCard } from './GlassTheme';

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
        if (!status) return 'bg-foreground/10';
        const s = status.toLowerCase();
        if (s.includes('healthy') || s.includes('active') || s.includes('ok')) return 'bg-emerald-500';
        if (s.includes('weak') || s.includes('warning') || s.includes('maintenance')) return 'bg-[#FBBE24]';
        if (s.includes('critical') || s.includes('abandoned') || s.includes('emergency')) return 'bg-red-500';
        return 'bg-foreground/20';
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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={glass.page}
        >
            <div className="absolute top-0 right-0 w-[60rem] h-[60rem] bg-honey/[0.04] rounded-full blur-[150px] -mr-40 -mt-20 pointer-events-none" />

            {/* Header */}
            <PageHeader
                icon={MapPin}
                label={apiary.location_name || 'Location'}
                title={<>{apiary.name.split(' ')[0]} <span className="text-honey">{apiary.name.split(' ').slice(1).join(' ') || 'Site'}</span></>}
                subtitle="Detailed operational view for this location. Monitor telemetry and manage colony assets."
                actions={
                    <div className="flex items-center gap-8 relative z-10">
                        <button
                            onClick={() => setViewingApiary(null)}
                            className={cn(glass.btnSecondary, "h-24 w-24 p-0 rounded-[3rem] flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-700")}
                        >
                            <ChevronLeft className="w-12 h-12" />
                        </button>

                        <div className="flex bg-white/40 dark:bg-black/60 p-3 rounded-[3.5rem] border border-white/5 gap-3 shadow-4xl relative overflow-hidden group">
                            <button
                                onClick={() => setActiveView('dashboard')}
                                className={cn('h-18 px-14 rounded-[2.5rem] text-[15px] font-black uppercase tracking-[0.3em] italic transition-all duration-700 relative z-10 flex items-center gap-6',
                                    activeView === 'dashboard' ? 'bg-white dark:bg-black text-honey shadow-4xl' : 'text-foreground/30 hover:text-honey hover:bg-honey/10'
                                )}
                            >
                                <Target className="w-6 h-6" />
                                Interactive Map
                            </button>
                            <button
                                onClick={() => setActiveView('details')}
                                className={cn('h-18 px-14 rounded-[2.5rem] text-[15px] font-black uppercase tracking-[0.3em] italic transition-all duration-700 relative z-10 flex items-center gap-6',
                                    activeView === 'details' ? 'bg-white dark:bg-black text-honey shadow-4xl' : 'text-foreground/30 hover:text-honey hover:bg-honey/10'
                                )}
                            >
                                <Activity className="w-6 h-6" />
                                Statistics
                            </button>
                        </div>
                    </div>
                }
            />

            {activeView === 'dashboard' ? (
                <div className="relative z-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                    <OrchardDashboardView apiary={apiary} onTabChange={onTabChange} />
                </div>
            ) : (
                <div className="space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000 relative z-10">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
                        <GlassStatCard label="Total Hives" value={stats.total} icon={Hexagon} index={0} />
                        <GlassStatCard label="Healthy" value={stats.healthy} icon={ShieldCheck} index={1} color="text-emerald-500" />
                        <GlassStatCard label="Alerts" value={stats.warnings} icon={Activity} index={2} color="text-[#FBBE24]" />
                        <GlassStatCard label="Critical" value={stats.critical} icon={Wind} index={3} color="text-red-500" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4, duration: 1 }}
                            className={cn(glass.statCard, "p-12 text-center bg-honey text-black border-none shadow-4xl rounded-[3.5rem] flex flex-col items-center justify-center group/acres")}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover/acres:opacity-100 transition-opacity duration-1000" />
                            <Sprout className="w-16 h-16 mb-8 text-black/20 group-hover/acres:scale-110 group-hover/acres:rotate-12 transition-all duration-1000" />
                            <p className={cn(glass.microLabel, "text-black/40 mb-3 font-black tracking-[0.4em] italic uppercase")}>Total Area</p>
                            <p className="text-7xl font-black italic tracking-tighter text-black leading-none">{apiary.size_acres || 0} <span className="text-3xl opacity-40">AC</span></p>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        {/* Left Panel - Grid View */}
                        <div className="lg:col-span-4 space-y-12">
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 1 }}
                                className={cn(glass.section, "min-h-[750px] flex flex-col")}
                            >
                                <div className={cn(glass.sectionHeader, "flex items-center justify-between")}>
                                    <div className="space-y-3">
                                        <h3 className="text-5xl font-black italic text-foreground tracking-tighter uppercase leading-none italic">Asset <span className="text-honey">Grid</span></h3>
                                        <p className={cn(glass.microLabel, "opacity-30")}>Live Status Matrix</p>
                                    </div>
                                    <div className="flex bg-black/5 dark:bg-white/5 p-3 rounded-[2.5rem] gap-3 shadow-inner border border-white/5">
                                        <button
                                            className={cn("h-16 w-16 rounded-[1.8rem] transition-all duration-700 flex items-center justify-center", viewMode === 'grid' ? "bg-white dark:bg-black shadow-4xl text-honey" : "text-foreground/10 hover:text-foreground/30")}
                                            onClick={() => setViewMode('grid')}
                                        >
                                            <LayoutGrid className="w-7 h-7" />
                                        </button>
                                        <button
                                            className={cn("h-16 w-16 rounded-[1.8rem] transition-all duration-700 flex items-center justify-center", viewMode === 'list' ? "bg-white dark:bg-black shadow-4xl text-honey" : "text-foreground/10 hover:text-foreground/30")}
                                            onClick={() => setViewMode('list')}
                                        >
                                            <ListIcon className="w-7 h-7" />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-16 flex-1 overflow-y-auto custom-scrollbar-modern">
                                    {viewMode === 'grid' ? (
                                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-10">
                                            {hives.map((hive, i) => (
                                                <motion.div
                                                    key={hive.id}
                                                    initial={{ opacity: 0, scale: 0 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: i * 0.02, duration: 0.5 }}
                                                    whileHover={{ scale: 1.4, zIndex: 50, rotate: 10, shadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                                                    className={cn(
                                                        "aspect-square rounded-[1.8rem] flex items-center justify-center text-[16px] font-black text-white cursor-pointer shadow-4xl relative overflow-hidden border-2 border-white/20",
                                                        getStatusColor(hive.status)
                                                    )}
                                                    onClick={() => handleEditHive(hive)}
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <span className="relative z-10 italic drop-shadow-md">{hive.hive_code.split('-').pop() || hive.hive_code.slice(-2)}</span>
                                                </motion.div>
                                            ))}
                                            {hives.length === 0 && (
                                                <div className="col-span-full h-96 flex flex-col items-center justify-center text-center opacity-20">
                                                    <Box className="w-24 h-24 mb-6 animate-pulse" />
                                                    <p className="font-black tracking-[0.4em] uppercase italic text-xl">System Empty</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            {hives.slice(0, 50).map((hive, i) => (
                                                <motion.div
                                                    key={hive.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.05, duration: 0.8 }}
                                                    whileHover={{ x: 20, scale: 1.02 }}
                                                    className="flex items-center justify-between p-12 rounded-[3.5rem] bg-white/40 dark:bg-black/40 border border-white/5 hover:border-honey/60 hover:bg-honey/15 transition-all cursor-pointer group shadow-4xl"
                                                    onClick={() => handleEditHive(hive)}
                                                >
                                                    <div className="flex items-center gap-10">
                                                        <div className={cn("w-5 h-5 rounded-full border-2 border-white/20 shadow-4xl animate-pulse", getStatusColor(hive.status))} />
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-3xl font-black italic text-foreground tracking-tighter uppercase group-hover:text-honey transition-colors">#{hive.hive_code}</span>
                                                            <span className="text-[10px] font-black text-foreground/20 uppercase italic tracking-widest">Biometric Unit</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-10">
                                                        <div className="flex flex-col items-end gap-1">
                                                            <div className="flex items-center gap-4">
                                                                <Thermometer className="w-6 h-6 text-red-500 opacity-40 group-hover:opacity-100 transition-all group-hover:scale-125" />
                                                                <span className="text-3xl font-black tabular-nums text-foreground/70 italic group-hover:text-foreground">
                                                                    {((hive as any).latest_temp)?.toFixed(1) || '--'}°C
                                                                </span>
                                                            </div>
                                                            <span className="text-[10px] font-black text-red-500/30 uppercase italic tracking-widest">Internal Temp</span>
                                                        </div>
                                                        <ChevronRight className="w-10 h-10 text-honey opacity-0 group-hover:opacity-100 translate-x-10 group-hover:translate-x-0 transition-all duration-700" />
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Panel - List View */}
                        <div className="lg:col-span-8 space-y-12">
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 1 }}
                                className={cn(glass.section, "min-h-[750px] flex flex-col")}
                            >
                                <div className={cn(glass.sectionHeader, "flex flex-col md:flex-row items-center justify-between gap-12")}>
                                    <div className="flex items-center gap-12">
                                        <div className="w-20 h-20 rounded-[2.5rem] bg-honey/10 flex items-center justify-center border border-honey/20 shadow-4xl group-hover:rotate-12 transition-transform">
                                            <Database className="w-10 h-10 text-honey" />
                                        </div>
                                        <div className="space-y-3">
                                            <h3 className="text-6xl font-black italic text-foreground tracking-tighter uppercase leading-none italic">Asset <span className="text-honey">Registry</span></h3>
                                            <p className={cn(glass.microLabel, "opacity-30 font-black uppercase tracking-[0.4em]")}>Centralized Intelligence</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleOpenAddHive}
                                        className={cn(glass.btnPrimary, "h-24 bg-honey text-black shadow-4xl rounded-[3.5rem] px-16 font-black italic text-2xl uppercase flex items-center justify-center gap-10 group/btn pl-24")}
                                    >
                                        <Plus className="w-10 h-10 group-hover/btn:rotate-90 transition-transform duration-1000" />
                                        Execute New Unit
                                    </button>
                                </div>

                                <div className="p-16 flex-1 overflow-visible relative z-10">
                                    {hivesLoading ? (
                                        <div className="space-y-12">
                                            {[1, 2, 3, 4, 5].map(i => <div key={i} className={cn(glass.skeleton, "h-32 rounded-[4rem] text-transparent")} />)}
                                        </div>
                                    ) : (
                                        <div className="py-6 h-full">
                                            <HivesTable
                                                data={hives || []}
                                                onRowClick={handleEditHive}
                                            />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            )}

            <HiveFormModal
                isOpen={isAddingHive}
                onClose={() => setIsAddingHive(false)}
                preselectedApiaryId={apiary.id}
                editingHive={editingHive}
            />
        </motion.div>
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

    // Hooks
    const apiariesQuery = useApiaries();
    const createApiary = useCreateApiary();
    const updateApiary = useUpdateApiary();
    const deleteApiary = useDeleteApiary();

    const apiaries = apiariesQuery.data || [];
    const isLoading = apiariesQuery.isLoading;

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
            toast.error('Please enter a location name.');
            return;
        }

        const toastId = toast.loading("Saving location...");
        try {
            if (editingApiary) {
                await updateApiary.mutateAsync({ id: editingApiary.id, data: formData });
                toast.success('Location updated.', { id: toastId });
            } else {
                await createApiary.mutateAsync(formData);
                toast.success('Location saved.', { id: toastId });
            }
            resetForm();
        } catch (error) {
            toast.error("Could not save. Please try again.", { id: toastId });
        }
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
        if (!confirm('Are you sure you want to delete this location? All hive records for this place will be moved to the general registry.')) return;
        const toastId = toast.loading("Deleting location...");
        try {
            await deleteApiary.mutateAsync(id);
            toast.success('Location deleted.', { id: toastId });
        } catch (error) {
            toast.error("Could not delete. Please try again.", { id: toastId });
        }
    };

    if (viewingApiary) {
        return <ApiaryDetailView apiary={viewingApiary} setViewingApiary={setViewingApiary} onTabChange={onTabChange} />;
    }

    if (isAddingPlace) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(glass.page, "p-8 -m-8 space-y-16 pb-20")}
            >
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-12 border-b border-white/5 pb-16 relative">
                    <button
                        onClick={resetForm}
                        className={cn(glass.btnSecondary, "h-22 w-22 p-0 rounded-[3rem] flex items-center justify-center")}
                    >
                        <ChevronLeft className="w-12 h-12" />
                    </button>
                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className={cn(glass.badge, 'bg-honey/10 text-honey border-honey/20 px-8 py-2.5 shadow-3xl skew-x-[-12deg]')}>
                                <div className="flex items-center gap-4 skew-x-[12deg]">
                                    <Navigation className="w-5 h-5" />
                                    <span className="uppercase tracking-[0.4em] font-black italic text-[12px]">{editingApiary ? 'Edit Location' : 'Add New Location'}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-blue-500/10 px-6 py-2.5 rounded-full border border-blue-500/20 shadow-3xl">
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                                <span className="text-[12px] font-black text-blue-500 uppercase tracking-widest italic">Draft</span>
                            </div>
                        </div>
                        <h1 className="text-8xl font-black text-foreground tracking-tighter uppercase italic leading-none">
                            Location <span className="text-honey">Details</span>
                        </h1>
                    </div>
                </div>

                {/* Form Card */}
                <div className={cn(glass.card, 'max-w-7xl shadow-4xl p-0 overflow-hidden bg-white/40 dark:bg-[#0D0D0D]/60 backdrop-blur-3xl rounded-[4rem] mx-auto')}>
                    <div className="p-14 pb-12 border-b border-white/5 bg-white/40 dark:bg-black/40 backdrop-blur-3xl relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <div className="w-16 h-16 rounded-[2rem] bg-honey/10 flex items-center justify-center border border-honey/20 shadow-3xl">
                                <Layers className="w-10 h-10 text-honey" />
                            </div>
                            <div className="space-y-1">
                                <h3 className={cn(glass.microLabel, "italic opacity-80 font-black tracking-[0.3em] uppercase")}>Information</h3>
                                <p className="text-[10px] font-black text-honey/30 uppercase italic">System Sync</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-20 pt-16 space-y-20 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
                            <div className="space-y-16">
                                <div className="space-y-6">
                                    <Label className={cn(glass.microLabel, 'ml-8 opacity-40 uppercase italic')}>Location Name*</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Main Farm"
                                        className={cn(glass.input, "h-24 font-black italic text-3xl px-12")}
                                    />
                                </div>

                                <div className="space-y-6">
                                    <Label className={cn(glass.microLabel, 'ml-8 opacity-40 uppercase italic')}>Type</Label>
                                    <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                                        <SelectTrigger className={cn(glass.select, 'h-24 px-12 text-2xl')}>
                                            <div className="flex items-center gap-8">
                                                <Target className="w-8 h-8 text-blue-400" />
                                                <SelectValue placeholder="Select type" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className={glass.selectContent}>
                                            <SelectItem value="permanent" className="p-6 font-black uppercase text-[15px] italic rounded-2xl">Permanent</SelectItem>
                                            <SelectItem value="migratory" className="p-6 font-black uppercase text-[15px] italic rounded-2xl">Migratory</SelectItem>
                                            <SelectItem value="breeding" className="p-6 font-black uppercase text-[15px] italic rounded-2xl">Breeding</SelectItem>
                                            <SelectItem value="quarantine" className="p-6 font-black uppercase text-[15px] italic rounded-2xl">Isolation</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <Label className={cn(glass.microLabel, 'ml-8 opacity-40 uppercase italic')}>Hives</Label>
                                        <div className="relative group/input">
                                            <Hexagon className="absolute left-10 top-1/2 -translate-y-1/2 w-8 h-8 text-honey opacity-20" />
                                            <Input
                                                type="number"
                                                value={formData.expected_hives || ''}
                                                onChange={(e) => setFormData({ ...formData, expected_hives: parseInt(e.target.value) || 0 })}
                                                placeholder="0"
                                                className={cn(glass.input, "h-24 pl-24 text-4xl tabular-nums")}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <Label className={cn(glass.microLabel, 'ml-8 opacity-40 uppercase italic')}>Size (Acres)</Label>
                                        <div className="relative group/input">
                                            <Sprout className="absolute left-10 top-1/2 -translate-y-1/2 w-8 h-8 text-emerald-500 opacity-20" />
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={formData.size_acres || ''}
                                                onChange={(e) => setFormData({ ...formData, size_acres: parseFloat(e.target.value) || 0 })}
                                                placeholder="0.0"
                                                className={cn(glass.input, "h-24 pl-24 text-4xl tabular-nums")}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-16">
                                <div className="space-y-6">
                                    <Label className={cn(glass.microLabel, 'ml-8 opacity-40 uppercase italic')}>Address / Coordinates</Label>
                                    <div className="relative">
                                        <Navigation className="absolute left-10 top-1/2 -translate-y-1/2 w-8 h-8 text-honey opacity-20" />
                                        <Input
                                            value={formData.location_name}
                                            onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                                            placeholder="GPS or Address"
                                            className={cn(glass.input, "h-24 pl-24 text-2xl")}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <Label className={cn(glass.microLabel, 'ml-8 opacity-40 uppercase italic')}>Forage Type</Label>
                                    <div className="relative">
                                        <Activity className="absolute left-10 top-1/2 -translate-y-1/2 w-8 h-8 text-emerald-500 opacity-20" />
                                        <Input
                                            value={formData.forage_type}
                                            onChange={(e) => setFormData({ ...formData, forage_type: e.target.value })}
                                            placeholder="e.g. Lavender, Fruit Trees"
                                            className={cn(glass.input, "h-24 pl-24 text-2xl")}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <Label className={cn(glass.microLabel, 'ml-8 opacity-40 uppercase italic')}>Description</Label>
                                    <Textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="min-h-[200px] p-12 font-black italic text-xl resize-none rounded-[3rem] bg-black/5 dark:bg-black/40 border-2 border-white/5"
                                        placeholder="Add notes about security, access, or environment..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-10 pt-20 border-t border-white/5">
                            <button
                                onClick={resetForm}
                                className={glass.btnSecondary}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={createApiary.isPending || updateApiary.isPending}
                                className={cn(glass.btnPrimary, "h-22 px-24 bg-honey text-black shadow-4xl rounded-[3rem] font-black italic text-3xl")}
                            >
                                {createApiary.isPending || updateApiary.isPending ? (
                                    <RefreshCw className="w-12 h-12 animate-spin" />
                                ) : (
                                    <ShieldCheck className="w-12 h-12" />
                                )}
                                {editingApiary ? 'Save Changes' : 'Add Location'}
                            </button>
                        </div>
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
                icon={MapPin}
                label="Site Management"
                title={<>Apiary <span className="text-honey">Locations</span></>}
                subtitle="Manage all your apiaries and yards in one place for better tracking and logistics."
                actions={
                    <button
                        onClick={() => setIsAddingPlace(true)}
                        className={cn(glass.btnPrimary, "h-24 bg-honey text-black shadow-4xl rounded-[3.5rem] px-16 font-black italic text-2xl uppercase flex items-center justify-center gap-10 group/btn pl-24")}
                    >
                        <Plus className="w-10 h-10 group-hover/btn:rotate-90 transition-transform" />
                        Add Location
                    </button>
                }
            />

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-14">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className={cn(glass.skeleton, "aspect-[4/3] rounded-[4rem]")} />
                    ))}
                </div>
            ) : apiaries.length === 0 ? (
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={glass.emptyState}
                >
                    <div className="w-64 h-64 rounded-[6rem] bg-honey/5 border border-honey/20 flex items-center justify-center mb-16 shadow-4xl">
                        <SearchX className="w-32 h-32 text-honey opacity-20" />
                    </div>
                    <h3 className="text-7xl font-black italic text-foreground tracking-tighter uppercase leading-none opacity-40">No Locations Found</h3>
                    <p className="text-2xl font-black opacity-20 italic max-w-2xl mx-auto border-l-8 border-honey/20 pl-16 text-center uppercase tracking-widest mt-10">Add your first apiary or hive location to start managing your colonies.</p>
                    <button onClick={() => setIsAddingPlace(true)} className={cn(glass.btnPrimary, "h-24 px-24 mt-16")}>
                        <Plus className="w-8 h-8 mr-6" /> Add Location
                    </button>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
                    <AnimatePresence>
                        {apiaries.map((apiary, index) => (
                            <motion.div
                                key={apiary.id}
                                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: index * 0.1 }}
                                whileHover={{ y: -20 }}
                                className="h-full"
                            >
                                <div
                                    className={cn(
                                        glass.card,
                                        "p-0 cursor-pointer shadow-4xl hover:border-honey/40 transition-all duration-1000 relative flex flex-col h-full group bg-white/60 dark:bg-[#0D0D0D]/60 backdrop-blur-3xl rounded-[4rem]"
                                    )}
                                    onClick={() => setViewingApiary(apiary)}
                                >
                                    <div className="p-14 pb-12 flex flex-col gap-10 relative z-10">
                                        <div className="flex justify-between items-start">
                                            <div className={cn(glass.badge, "bg-white/40 dark:bg-black/60 text-foreground/40 border-white/5 group-hover:bg-honey group-hover:text-black group-hover:border-honey/40 transition-all duration-1000 px-8 py-2.5 skew-x-[-12deg]")}>
                                                <div className="flex items-center gap-4 skew-x-[12deg]">
                                                    <Navigation className="w-4 h-4" />
                                                    <span className="uppercase tracking-[0.3em] font-black italic text-[12px]">{apiary.type || 'Permanent'}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-center justify-center w-36 h-36 rounded-[4rem] bg-white/40 dark:bg-[#151515]/60 border border-white/10 group-hover:bg-honey/10 transition-all shadow-4xl">
                                                <span className="text-6xl font-black italic tabular-nums text-foreground group-hover:text-honey">{apiary.hive_count || 0}</span>
                                                <p className="text-[12px] font-black uppercase tracking-[0.4em] opacity-30 group-hover:opacity-60 italic">HIVES</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h3 className="text-6xl font-black italic text-foreground tracking-tighter uppercase italic leading-none group-hover:text-honey transition-colors duration-1000">
                                                {apiary.name}
                                            </h3>
                                            <div className="flex items-center gap-5 italic font-black text-foreground/30 text-[14px] uppercase tracking-tight pl-2">
                                                <MapPin className="w-6 h-6 text-honey opacity-40" />
                                                <span className="truncate">{apiary.location_name || 'Location Not Set'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-14 py-14 grid grid-cols-2 gap-10 border-t border-white/5 bg-black/[0.02] dark:bg-white/[0.01] mt-6">
                                        <div className="space-y-4">
                                            <p className={cn(glass.microLabel, "opacity-20 italic uppercase")}>Environment</p>
                                            <div className="flex items-center gap-4">
                                                <Sprout className="w-6 h-6 text-emerald-500/40" />
                                                <p className="text-[14px] font-black text-foreground/80 tracking-widest uppercase truncate italic">{apiary.forage_type || 'Mixed Flowers'}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <p className={cn(glass.microLabel, "opacity-20 italic uppercase")}>Area</p>
                                            <div className="flex items-center gap-4">
                                                <Target className="w-6 h-6 text-honey/40" />
                                                <p className="text-[14px] font-black text-foreground/80 tracking-widest uppercase tabular-nums italic">{apiary.size_acres || 0} ACRES</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="absolute top-14 left-14 opacity-0 group-hover:opacity-100 transition-all duration-700 -translate-x-10 group-hover:translate-x-0 flex flex-col gap-6 z-20">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleEdit(apiary); }}
                                            className={cn(glass.btnSecondary, "h-18 w-18 p-0 border-white/5 hover:border-honey/40 hover:text-honey")}
                                        >
                                            <Edit className="w-7 h-7" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(apiary.id, e); }}
                                            className={cn(glass.btnSecondary, "h-18 w-18 p-0 border-white/5 hover:border-red-500/40 hover:text-red-500")}
                                        >
                                            <Trash2 className="w-7 h-7" />
                                        </button>
                                    </div>

                                    <div className="px-14 py-12 bg-white/60 dark:bg-black/60 border-t border-white/5 flex items-center justify-between mt-auto group-hover:bg-honey/5 transition-colors duration-1000">
                                        <div className="flex items-center gap-6">
                                            <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse shadow-4xl" />
                                            <div className="flex flex-col">
                                                <span className={cn(glass.microLabel, "text-emerald-500 font-black tracking-[0.4em] uppercase italic leading-none")}>Synced</span>
                                                <span className="text-[10px] font-black text-muted-foreground/30 uppercase italic mt-1">Secured</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 text-honey group-hover:translate-x-6 transition-transform duration-1000">
                                            <span className={cn(glass.microLabel, "font-black tracking-[0.5em] opacity-0 group-hover:opacity-100 transition-opacity uppercase italic")}>View Details</span>
                                            <ArrowRight className="w-10 h-10 group-hover:rotate-[-45deg] transition-transform duration-1000" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <style>{`
                .thin-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .thin-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .thin-scrollbar::-webkit-scrollbar-thumb { background: rgba(251, 191, 36, 0.1); border-radius: 20px; }
            `}</style>
        </motion.div>
    );
};

export default MyPlacesView;
