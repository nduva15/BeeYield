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
    Database,
    TrendingUp
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
        if (s.includes('healthy') || s.includes('active') || s.includes('ok')) return 'bg-[#1B9157]';
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
            <div className="absolute top-0 right-0 w-[60rem] h-[60rem] bg-[#F4D03F]/[0.04] rounded-full blur-[150px] -mr-40 -mt-20 pointer-events-none" />

            {/* Header */}
            <PageHeader
                icon={MapPin}
                label="Site Intelligence"
                title={<>{apiary.name.split(' ')[0]} <span className="text-[#F4D03F]">{apiary.name.split(' ').slice(1).join(' ') || 'Site'}</span></>}
                subtitle="Operational telemetry for this location."
                actions={
                    <div className="flex items-center gap-2 relative z-10">
                        <button
                            onClick={() => setViewingApiary(null)}
                            className={cn(glass.btnSecondary, "w-9 h-9 p-0 flex items-center justify-center")}
                            aria-label="Back to locations"
                            title="Back to locations"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div className="flex bg-[#F9F7F2] p-1 rounded-lg border border-[#F4D03F]/10 gap-1">
                            <button
                                onClick={() => setActiveView('dashboard')}
                                className={cn('h-7 px-3 rounded-md text-[10px] font-bold transition-all flex items-center gap-1.5',
                                    activeView === 'dashboard' ? 'bg-[#F4D03F] text-[#1A1A1A] shadow-sm' : 'text-gray-400 hover:text-[#F4D03F]'
                                )}
                            >
                                <Target className="w-3.5 h-3.5" />
                                Interactive
                            </button>
                            <button
                                onClick={() => setActiveView('details')}
                                className={cn('h-7 px-3 rounded-md text-[10px] font-bold transition-all flex items-center gap-1.5',
                                    activeView === 'details' ? 'bg-[#F4D03F] text-[#1A1A1A] shadow-sm' : 'text-gray-400 hover:text-[#F4D03F]'
                                )}
                            >
                                <Activity className="w-3.5 h-3.5" />
                                Analytics
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
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {[
                            { label: 'TOTAL UNITS', value: stats.total, icon: Hexagon, color: 'text-[#1A1A1A]' },
                            { label: 'Healthy', value: stats.healthy, icon: ShieldCheck, color: 'text-[#1B9157]' },
                            { label: 'Alerts', value: stats.warnings, icon: Activity, color: 'text-[#FBBE24]' },
                            { label: 'Critical', value: stats.critical, icon: Box, color: 'text-red-500' },
                            { label: 'AREA (AC)', value: apiary.size_acres || 0, icon: Sprout, color: 'text-[#1A1A1A]' }
                        ].map((s, i) => (
                            <div key={i} className="bg-white/40 border border-[#F4D03F]/10 p-3 rounded-xl flex flex-col gap-1 relative overflow-hidden group hover:border-[#F4D03F]/30 transition-all backdrop-blur-sm shadow-sm">
                                <div className="flex items-center justify-between relative z-10">
                                    <span className="text-[8px] font-black text-gray-400">{s.label}</span>
                                    <s.icon className={cn("w-3.5 h-3.5", s.color)} />
                                </div>
                                <span className={cn("text-xl font-black tracking-tight tabular-nums relative z-10", s.color)}>{s.value}</span>
                            </div>
                        ))}
                    </div>

                    <div className={cn(glass.card, "p-4 bg-white/40 border-[#F4D03F]/10 backdrop-blur-md")}>
                        <div className="space-y-1">
                            <h3 className="text-[10px] font-black text-[#1A1A1A]">Analytics</h3>
                            <p className="text-[9px] font-bold text-gray-400">
                                No synthetic charts. Add real telemetry/harvest data to populate analytics.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Panel - Grid View */}
                        <div className="lg:col-span-4 space-y-12">
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 1 }}
                                className={cn(glass.card, "bg-white/40 border-[#F4D03F]/10 backdrop-blur-md min-h-[500px] flex flex-col p-0 overflow-hidden")}
                            >
                                <div className="flex items-center justify-between p-4 border-b border-[#F4D03F]/10 bg-[#F4D03F]/[0.02]">
                                    <div className="space-y-0.5">
                                        <h3 className="text-[10px] font-black text-[#1A1A1A]">Asset Matrix</h3>
                                        <p className="text-[8px] font-bold text-gray-400">High-Density Grid</p>
                                    </div>
                                    <div className="flex bg-[#F4D03F]/5 p-1 rounded-lg gap-1 border border-[#F4D03F]/10 shadow-inner">
                                        <button
                                            className={cn("h-7 w-7 rounded-md transition-all flex items-center justify-center", viewMode === 'grid' ? "bg-white shadow-md text-[#F4D03F] border border-[#F4D03F]/10" : "text-gray-300 hover:text-[#1A1A1A]")}
                                            onClick={() => setViewMode('grid')}
                                            aria-label="Grid view"
                                            title="Grid view"
                                        >
                                            <LayoutGrid className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            className={cn("h-7 w-7 rounded-md transition-all flex items-center justify-center", viewMode === 'list' ? "bg-white shadow-md text-[#F4D03F] border border-[#F4D03F]/10" : "text-gray-300 hover:text-[#1A1A1A]")}
                                            onClick={() => setViewMode('list')}
                                            aria-label="List view"
                                            title="List view"
                                        >
                                            <ListIcon className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-4 flex-1 overflow-y-auto custom-scrollbar-modern">
                                    {viewMode === 'grid' ? (
                                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                                            {hives.map((hive, i) => (
                                                <motion.div
                                                    key={hive.id}
                                                    initial={{ opacity: 0, scale: 0 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: i * 0.02, duration: 0.5 }}
                                                    whileHover={{ scale: 1.1, zIndex: 50, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                                                    className={cn(
                                                        "aspect-square rounded-lg flex items-center justify-center text-sm font-bold text-[#1A1A1A] cursor-pointer shadow-sm relative overflow-hidden border border-[#F4D03F]/40",
                                                        getStatusColor(hive.status)
                                                    )}
                                                    onClick={() => handleEditHive(hive)}
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <span className="relative z-10 drop-shadow-sm">{hive.hive_code.split('-').pop() || hive.hive_code.slice(-2)}</span>
                                                </motion.div>
                                            ))}
                                            {hives.length === 0 && (
                                                <div className="col-span-full h-96 flex flex-col items-center justify-center text-center opacity-20">
                                                    <Box className="w-24 h-24 mb-6 animate-pulse" />
                                                    <p className="text-lg font-semibold text-gray-600">No hives yet</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {hives.slice(0, 50).map((hive, i) => (
                                                <motion.div
                                                    key={hive.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.05, duration: 0.8 }}
                                                    whileHover={{ x: 5, scale: 1.01 }}
                                                    className="flex items-center justify-between p-3 rounded-xl bg-[#F9F7F2] border border-[#F4D03F]/10 hover:border-[#F4D03F]/40 hover:bg-[#F4D03F]/10 transition-all cursor-pointer group shadow-sm"
                                                    onClick={() => handleEditHive(hive)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn("w-2 h-2 rounded-full border border-[#F4D03F]/20 shadow-sm animate-pulse", getStatusColor(hive.status))} />
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-[#1A1A1A] tracking-tight group-hover:text-[#F4D03F] transition-colors">#{hive.hive_code}</span>
                                                            <span className="text-xs text-gray-500">Hive</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex flex-col items-end">
                                                            <div className="flex items-center gap-2">
                                                                <Thermometer className="w-3.5 h-3.5 text-red-500 opacity-40 group-hover:opacity-100 transition-all" />
                                                                <span className="text-sm font-bold tabular-nums text-[#1A1A1A]/70 italic group-hover:text-[#1A1A1A]">
                                                                    {((hive as any).latest_temp)?.toFixed(1) || '--'}°C
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4 text-[#F4D03F] opacity-0 group-hover:opacity-100 transition-all" />
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
                                className={cn(glass.section, "min-h-[500px] flex flex-col")}
                            >
                                <div className={cn(glass.sectionHeader, "flex items-center justify-between")}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/20">
                                            <Database className="w-4 h-4 text-[#F4D03F]" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <h3 className="text-sm font-semibold text-[#1A1A1A]">Devices</h3>
                                            <p className={cn(glass.microLabel, "opacity-40")}>Device management</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleOpenAddHive}
                                        className={cn(glass.btnPrimary, "px-3 h-8")}
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Add hive
                                    </button>
                                </div>

                                <div className="p-4 flex-1 overflow-visible relative z-10">
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(glass.page, "p-4 lg:p-6 space-y-6 pb-20")}
            >
                {/* Header */}
                <div className="flex items-center gap-4 border-b border-[#F4D03F]/10 pb-4 relative">
                    <button
                        onClick={resetForm}
                        className={cn(glass.btnSecondary, "h-10 w-10 p-0 rounded-xl flex items-center justify-center bg-white shadow-sm border-[#F4D03F]/10")}
                        aria-label="Back"
                        title="Back"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="space-y-1 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1 bg-[#F4D03F]/10 rounded-full border border-[#F4D03F]/20">
                                <span className=" font-black text-[9px] text-[#F4D03F]">{editingApiary ? 'Edit Location' : 'Add New Location'}</span>
                            </div>
                        </div>
                        <h1 className="text-lg font-bold text-[#1A1A1A] tracking-tight uppercase">
                            Site <span className="text-[#F4D03F]">Deployment</span>
                        </h1>
                    </div>
                </div>

                {/* Form Card */}
                <div className={cn(glass.card, 'max-w-4xl shadow-2xl p-0 overflow-hidden bg-white/70 border-[#F4D03F]/10 rounded-3xl mx-auto backdrop-blur-xl')}>
                    <div className="p-5 border-b border-[#F4D03F]/10 bg-[#F4D03F]/[0.02] relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/20 shadow-sm">
                                <Layers className="w-4 h-4 text-[#F4D03F]" />
                            </div>
                            <div className="space-y-0.5">
                                <h3 className="text-[10px] font-black text-[#1A1A1A]">Unit Parameters</h3>
                                <p className="text-[8px] font-bold text-[#F4D03F]">Fill in the basics for this location.</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-6 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black text-gray-400 ml-2">Site Identifier*</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Acacia Valley 01"
                                        className={cn(glass.input, "px-4 h-10 text-[11px] font-black tracking-wider")}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-gray-500 ml-2">Placement</Label>
                                    <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                                        <SelectTrigger className="h-10 border-[#F4D03F]/10 bg-white/50 px-4 rounded-xl font-black text-[9px] transition-all hover:border-[#F4D03F]/30 focus:ring-0">
                                            <div className="flex items-center gap-3">
                                                <Target className="w-3.5 h-3.5 text-[#F4D03F]" />
                                                <SelectValue placeholder="Select type" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="bg-white/90 backdrop-blur-md border-[#F4D03F]/20 rounded-xl overflow-hidden shadow-2xl">
                                            <SelectItem value="permanent" className="text-[9px] font-black focus:bg-[#F4D03F]/10 focus:text-[#1A1A1A]">Permanent Site</SelectItem>
                                            <SelectItem value="migratory" className="text-[9px] font-black focus:bg-[#F4D03F]/10 focus:text-[#1A1A1A]">Migratory Site</SelectItem>
                                            <SelectItem value="breeding" className="text-[9px] font-black focus:bg-[#F4D03F]/10 focus:text-[#1A1A1A]">Breeding Site</SelectItem>
                                            <SelectItem value="quarantine" className="text-[9px] font-black focus:bg-[#F4D03F]/10 focus:text-[#1A1A1A]">Isolation Site</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-black text-gray-400 ml-2">Unit Capacity</Label>
                                        <div className="relative">
                                            <Hexagon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#F4D03F]/40" />
                                            <Input
                                                type="number"
                                                value={formData.expected_hives || ''}
                                                onChange={(e) => setFormData({ ...formData, expected_hives: parseInt(e.target.value) || 0 })}
                                                placeholder="0"
                                                className="h-10 pl-10 font-black text-[11px] bg-white/50 border-[#F4D03F]/10 rounded-xl tabular-nums"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-black text-gray-400 ml-2">Area (AC)</Label>
                                        <div className="relative">
                                            <Sprout className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#1B9157]/40" />
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={formData.size_acres || ''}
                                                onChange={(e) => setFormData({ ...formData, size_acres: parseFloat(e.target.value) || 0 })}
                                                placeholder="0.0"
                                                className="h-10 pl-10 font-black text-[11px] bg-white/50 border-[#F4D03F]/10 rounded-xl tabular-nums"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black text-gray-400 ml-2">Geospatial Point</Label>
                                    <div className="relative">
                                        <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#F4D03F]/40" />
                                        <Input
                                            value={formData.location_name}
                                            onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                                            placeholder="GPS / ADDRESS"
                                            className="h-10 pl-10 font-black text-[10px] bg-white/50 border-[#F4D03F]/10 rounded-xl tracking-wider"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-gray-500 ml-2">Flora</Label>
                                    <div className="relative">
                                        <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#1B9157]/40" />
                                        <Input
                                            value={formData.forage_type}
                                            onChange={(e) => setFormData({ ...formData, forage_type: e.target.value })}
                                            placeholder="Lavender Cluster Pro"
                                            className="h-10 pl-10 font-black text-[10px] bg-white/50 border-[#F4D03F]/10 rounded-xl tracking-wider"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black text-gray-400 ml-2">Operational Log</Label>
                                    <Textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="h-20 p-4 text-[10px] font-bold bg-white/50 border-[#F4D03F]/10 rounded-xl resize-none italic leading-relaxed"
                                        placeholder="MISSION_CRITICAL_NOTES..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-[#F4D03F]/10">
                            <button
                                onClick={resetForm}
                                className={cn(glass.btnSecondary, "h-11 px-6 text-[9px] font-black")}
                            >
                                Discard_Draft
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={createApiary.isPending || updateApiary.isPending}
                                className={cn(glass.btnPrimary, "h-11 px-10 text-[9px] font-black shadow-xl shadow-[#F4D03F]/10")}
                            >
                                {createApiary.isPending || updateApiary.isPending ? (
                                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <ShieldCheck className="w-4 h-4 mr-2" />
                                )}
                                {editingApiary ? 'Save changes' : 'Add location'}
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
            className={cn(glass.page, "p-4 lg:p-6 space-y-6 pb-20")}
        >
            {/* Header */}
            <PageHeader
                icon={MapPin}
                label="Apiaries"
                title={<>Apiary <span className="text-[#F4D03F]">Network</span></>}
                subtitle="Manage your apiary records."
                actions={
                    <button
                        onClick={() => setIsAddingPlace(true)}
                        className={glass.btnPrimary}
                    >
                        <Plus className="w-4 h-4" />
                        Add location
                    </button>
                }
            />
            <div className={cn(glass.card, "p-4 bg-white/40 border-[#F4D03F]/10 backdrop-blur-md")}>
                <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-gray-400">Total Apiaries</span>
                    <div className="h-6 w-6 rounded-lg bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/10 shadow-sm">
                        <MapPin className="w-3.5 h-3.5 text-[#F4D03F]" />
                    </div>
                </div>
                <div className="text-xl font-black tracking-tight text-[#1A1A1A] tabular-nums mt-2">{apiaries.length}</div>
                <p className="text-[8px] font-bold text-gray-400 mt-1">Records</p>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className={cn(glass.skeleton, "aspect-video rounded-xl")} />
                    ))}
                </div>
            ) : apiaries.length === 0 ? (
                <motion.div
                    initial={{ scale: 0.98, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={glass.emptyState}
                >
                    <div className="w-16 h-16 rounded-2xl bg-[#F4D03F]/5 border border-[#F4D03F]/20 flex items-center justify-center mb-6 shadow-sm">
                        <SearchX className="w-6 h-6 text-[#F4D03F] opacity-40" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1A1A1A] tracking-tight opacity-40">No Locations Found</h3>
                    <p className="text-[10px] font-bold opacity-30 italic max-w-xs mx-auto text-center mt-2">Add your first location to start tracking.</p>
                    <button onClick={() => setIsAddingPlace(true)} className={cn(glass.btnPrimary, "mt-6 px-6")}>
                        <Plus className="w-4 h-4 mr-2" /> Add location
                    </button>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {apiaries.map((apiary, index) => (
                            <motion.div
                                key={apiary.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                className="h-full"
                            >
                                <div
                                    className={cn(
                                        glass.card,
                                        "p-0 cursor-pointer shadow-sm hover:border-[#F4D03F]/40 transition-all duration-300 relative flex flex-col h-full group bg-white/70 backdrop-blur-md rounded-xl overflow-hidden"
                                    )}
                                    onClick={() => setViewingApiary(apiary)}
                                >
                                    <div className="p-4 flex flex-col h-full relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="px-2.5 py-1 bg-[#1A1A1A]/5 rounded-lg border border-[#F4D03F]/10 text-xs font-semibold text-gray-500 group-hover:bg-[#F4D03F] group-hover:text-[#1A1A1A] group-hover:border-[#F4D03F] transition-all">
                                                {apiary.type || 'Permanent'}
                                            </div>
                                            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleEdit(apiary); }}
                                                    className="w-7 h-7 rounded-lg bg-white/50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#1A1A1A] hover:border-gray-200 transition-all"
                                                    aria-label="Edit location"
                                                    title="Edit location"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(apiary.id, e); }}
                                                    className="w-7 h-7 rounded-lg bg-red-50/50 border border-red-100 flex items-center justify-center text-red-300 hover:text-red-500 hover:border-red-200 transition-all"
                                                    aria-label="Delete location"
                                                    title="Delete location"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-1 mb-6">
                                            <h3 className="text-sm font-bold text-[#1A1A1A] group-hover:text-[#F4D03F] transition-colors tracking-tight truncate">{apiary.name}</h3>
                                            <div className="flex items-center gap-1.5 text-gray-400">
                                                <MapPin className="w-3 h-3" />
                                                <span className="text-xs font-semibold text-gray-500 truncate">{apiary.location_name || 'Location not set'}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mt-auto">
                                            <div className="p-2 rounded-xl bg-gray-50/50 border border-gray-100 space-y-0.5">
                                                <p className="text-[7px] font-black text-gray-400">Capacity</p>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-sm font-black text-[#1A1A1A] tabular-nums">{apiary.expected_hives || 0}</span>
                                                    <span className="text-[8px] font-bold text-gray-300">Fr</span>
                                                </div>
                                            </div>
                                            <div className={cn("p-2 rounded-xl border space-y-0.5", (apiary.hive_count || 0) > 0 ? "bg-[#1B9157]/5 border-[#1B9157]/10" : "bg-gray-50/50 border-gray-100")}>
                                                <p className="text-[7px] font-black text-gray-400">Active_Units</p>
                                                <div className="flex items-baseline gap-1">
                                                    <span className={cn("text-sm font-black tabular-nums", (apiary.hive_count || 0) > 0 ? "text-[#1B9157]" : "text-gray-300")}>{apiary.hive_count || 0}</span>
                                                    <span className="text-[8px] font-bold text-gray-300">Hub</span>
                                                </div>
                                            </div>
                                        </div>

                                        <button className="mt-4 w-full h-9 rounded-xl border border-dashed border-gray-200 text-[8px] font-black text-gray-300 group-hover:border-[#F4D03F]/30 group-hover:text-[#F4D03F] group-hover:bg-[#F4D03F]/5 transition-all flex items-center justify-center gap-2">
                                            Open_Network_Interface
                                            <ArrowRight className="w-3 h-3" />
                                        </button>
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
