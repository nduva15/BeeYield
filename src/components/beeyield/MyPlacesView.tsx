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
                label="Site Intelligence Kernel"
                title={<>{apiary.name.split(' ')[0]} <span className="text-[#F4D03F]">{apiary.name.split(' ').slice(1).join(' ') || 'Site'}</span></>}
                subtitle="High-fidelity operational telemetry for this location."
                actions={
                    <div className="flex items-center gap-3 relative z-10">
                        <button
                            onClick={() => setViewingApiary(null)}
                            className={cn(glass.btnSecondary, "h-10 w-10 p-0 rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-sm bg-white border-[#F4D03F]/10")}
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>

                        <div className="flex bg-[#1A1A1A]/5 p-1 rounded-xl border border-[#F4D03F]/10 gap-1 shadow-sm">
                            <button
                                onClick={() => setActiveView('dashboard')}
                                className={cn('h-8 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2',
                                    activeView === 'dashboard' ? 'bg-white text-[#F4D03F] shadow-sm border border-[#F4D03F]/10' : 'text-[#1A1A1A]/30 hover:text-[#F4D03F]'
                                )}
                            >
                                <Target className="w-4 h-4" />
                                Interactive
                            </button>
                            <button
                                onClick={() => setActiveView('details')}
                                className={cn('h-8 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2',
                                    activeView === 'details' ? 'bg-white text-[#F4D03F] shadow-sm border border-[#F4D03F]/10' : 'text-[#1A1A1A]/30 hover:text-[#F4D03F]'
                                )}
                            >
                                <Activity className="w-4 h-4" />
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
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                            { label: 'TOTAL HIVES', value: stats.total, icon: Hexagon, color: 'text-[#1A1A1A]' },
                            { label: 'HEALTHY', value: stats.healthy, icon: ShieldCheck, color: 'text-[#1B9157]' },
                            { label: 'ALERTS', value: stats.warnings, icon: Activity, color: 'text-[#FBBE24]' },
                            { label: 'CRITICAL', value: stats.critical, icon: Box, color: 'text-red-500' },
                            { label: 'TOTAL AREA', value: `${apiary.size_acres || 0} AC`, icon: Sprout, color: 'text-[#1A1A1A]' }
                        ].map((s, i) => (
                            <div key={i} className="bg-white border border-[#F4D03F]/10 p-5 rounded-3xl flex flex-col gap-2 relative overflow-hidden group hover:border-[#F4D03F]/30 transition-all shadow-sm">
                                <div className="flex items-center justify-between relative z-10">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-[#1A1A1A]/30">{s.label}</span>
                                    <s.icon className={cn("w-4 h-4", s.color)} />
                                </div>
                                <span className={cn("text-2xl font-black tracking-tighter tabular-nums relative z-10", s.color)}>{s.value}</span>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        {/* Left Panel - Grid View */}
                        <div className="lg:col-span-4 space-y-12">
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 1 }}
                                className={cn(glass.section, "min-h-[500px] flex flex-col")}
                            >
                                <div className={cn(glass.sectionHeader, "flex items-center justify-between")}>
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold text-[#1A1A1A] tracking-tight">Asset <span className="text-[#F4D03F]">Grid</span></h3>
                                        <p className={cn(glass.microLabel, "opacity-40")}>Live Status Matrix</p>
                                    </div>
                                    <div className="flex bg-[#F9F7F2] p-1 rounded-lg gap-1 border border-[#F4D03F]/20 shadow-sm">
                                        <button
                                            className={cn("h-7 w-7 rounded-md transition-all flex items-center justify-center", viewMode === 'grid' ? "bg-[#FFF9F0] shadow-sm text-[#F4D03F] border border-[#F4D03F]/20" : "text-[#1A1A1A]/20 hover:text-[#1A1A1A]/40")}
                                            onClick={() => setViewMode('grid')}
                                        >
                                            <LayoutGrid className="w-4 h-4" />
                                        </button>
                                        <button
                                            className={cn("h-7 w-7 rounded-md transition-all flex items-center justify-center", viewMode === 'list' ? "bg-[#FFF9F0] shadow-sm text-[#F4D03F] border border-[#F4D03F]/20" : "text-[#1A1A1A]/20 hover:text-[#1A1A1A]/40")}
                                            onClick={() => setViewMode('list')}
                                        >
                                            <ListIcon className="w-4 h-4" />
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
                                                    <span className="relative z-10 italic drop-shadow-sm">{hive.hive_code.split('-').pop() || hive.hive_code.slice(-2)}</span>
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
                                                            <span className="text-[9px] font-bold text-[#1A1A1A]/30 uppercase tracking-widest">Biometric Unit</span>
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
                                    <div className="flex items-center gap-4">
                                        <div className="w-9 h-9 rounded-lg bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/20 shadow-sm">
                                            <Database className="w-5 h-5 text-[#F4D03F]" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-bold text-[#1A1A1A] tracking-tight">Asset <span className="text-[#F4D03F]">Registry</span></h3>
                                            <p className={cn(glass.microLabel, "opacity-40 uppercase tracking-widest")}>Centralized Intelligence</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleOpenAddHive}
                                        className={cn(glass.btnPrimary, "px-4")}
                                    >
                                        <Plus className="w-4 h-4" />
                                        New Unit
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
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="space-y-1 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1 bg-[#F4D03F]/10 rounded-full border border-[#F4D03F]/20">
                                <span className="uppercase tracking-widest font-black text-[9px] text-[#F4D03F]">{editingApiary ? 'Edit Location' : 'Add New Location'}</span>
                            </div>
                        </div>
                        <h1 className="text-2xl font-black text-[#1A1A1A] tracking-tighter uppercase">
                            Site <span className="text-[#F4D03F]">Deployment</span>
                        </h1>
                    </div>
                </div>

                {/* Form Card */}
                <div className={cn(glass.card, 'max-w-4xl shadow-sm p-0 overflow-hidden bg-white border-[#F4D03F]/10 rounded-3xl mx-auto')}>
                    <div className="p-6 border-b border-[#F4D03F]/10 bg-[#1A1A1A]/5 relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/20 shadow-sm">
                                <Layers className="w-5 h-5 text-[#F4D03F]" />
                            </div>
                            <div className="space-y-0.5">
                                <h3 className="text-xs font-black tracking-widest uppercase text-[#1A1A1A]">Unit Parameters</h3>
                                <p className="text-[8px] font-bold text-[#F4D03F]/60 uppercase italic">Industrial site initialization protocol.</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-6 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black tracking-widest text-[#1A1A1A]/40 uppercase ml-4">Identifier*</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Acacia Valley Node"
                                        className="h-10 px-4 font-black text-xs bg-[#1A1A1A]/5 border-[#F4D03F]/10 rounded-xl"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black tracking-widest text-[#1A1A1A]/40 uppercase ml-4">Deployment Vector</Label>
                                    <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                                        <SelectTrigger className="h-10 border-[#F4D03F]/10 bg-[#1A1A1A]/5 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest">
                                            <div className="flex items-center gap-3">
                                                <Target className="w-4 h-4 text-[#F4D03F]/40" />
                                                <SelectValue placeholder="Select type" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-[#F4D03F]/10">
                                            <SelectItem value="permanent" className="text-[9px] font-black uppercase tracking-widest">Permanent Site</SelectItem>
                                            <SelectItem value="migratory" className="text-[9px] font-black uppercase tracking-widest">Migratory Site</SelectItem>
                                            <SelectItem value="breeding" className="text-[9px] font-black uppercase tracking-widest">Breeding Site</SelectItem>
                                            <SelectItem value="quarantine" className="text-[9px] font-black uppercase tracking-widest">Isolation Site</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-black tracking-widest text-[#1A1A1A]/40 uppercase ml-4">Node Capacity</Label>
                                        <div className="relative">
                                            <Hexagon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F4D03F]/40" />
                                            <Input
                                                type="number"
                                                value={formData.expected_hives || ''}
                                                onChange={(e) => setFormData({ ...formData, expected_hives: parseInt(e.target.value) || 0 })}
                                                placeholder="0"
                                                className="h-10 pl-10 font-black text-xs bg-[#1A1A1A]/5 border-[#F4D03F]/10 rounded-xl"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-black tracking-widest text-[#1A1A1A]/40 uppercase ml-4">Area Coverage</Label>
                                        <div className="relative">
                                            <Sprout className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1B9157]/40" />
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={formData.size_acres || ''}
                                                onChange={(e) => setFormData({ ...formData, size_acres: parseFloat(e.target.value) || 0 })}
                                                placeholder="0.0"
                                                className="h-10 pl-10 font-black text-xs bg-[#1A1A1A]/5 border-[#F4D03F]/10 rounded-xl"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black tracking-widest text-[#1A1A1A]/40 uppercase ml-4">Geospatial Point</Label>
                                    <div className="relative">
                                        <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F4D03F]/40" />
                                        <Input
                                            value={formData.location_name}
                                            onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                                            placeholder="GPS or Address"
                                            className="h-10 pl-10 font-black text-xs bg-[#1A1A1A]/5 border-[#F4D03F]/10 rounded-xl"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black tracking-widest text-[#1A1A1A]/40 uppercase ml-4">Floral Vector</Label>
                                    <div className="relative">
                                        <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1B9157]/40" />
                                        <Input
                                            value={formData.forage_type}
                                            onChange={(e) => setFormData({ ...formData, forage_type: e.target.value })}
                                            placeholder="e.g. Lavender Cluster"
                                            className="h-10 pl-10 font-black text-xs bg-[#1A1A1A]/5 border-[#F4D03F]/10 rounded-xl"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black tracking-widest text-[#1A1A1A]/40 uppercase ml-4">Operational Narrative</Label>
                                    <Textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="h-20 p-4 text-xs font-black bg-[#1A1A1A]/5 border-[#F4D03F]/10 rounded-xl resize-none italic"
                                        placeholder="Add mission-critical notes..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-6 border-t border-[#F4D03F]/10">
                            <button
                                onClick={resetForm}
                                className="h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest bg-white border border-[#F4D03F]/10 hover:text-red-500 transition-all"
                            >
                                Discard
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={createApiary.isPending || updateApiary.isPending}
                                className="h-12 px-10 bg-[#F4D03F] text-[#1A1A1A] shadow-lg shadow-[#F4D03F]/20 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-3 active:scale-95 transition-all"
                            >
                                {createApiary.isPending || updateApiary.isPending ? (
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                ) : (
                                    <ShieldCheck className="w-5 h-5" />
                                )}
                                {editingApiary ? 'Commit Changes' : 'Initialize Site'}
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
                label="Infrastructure Registry Kernel"
                title={<>Apiary <span className="text-[#F4D03F]">Network</span></>}
                subtitle="High-fidelity management of global distribution nodes."
                actions={
                    <button
                        onClick={() => setIsAddingPlace(true)}
                        className="h-10 bg-[#1A1A1A] text-white hover:bg-[#F4D03F] hover:text-[#1A1A1A] rounded-xl px-6 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Initialize Site
                    </button>
                }
            />

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className={cn(glass.skeleton, "aspect-video rounded-xl")} />
                    ))}
                </div>
            ) : apiaries.length === 0 ? (
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={glass.emptyState}
                >
                    <div className="w-20 h-20 rounded-2xl bg-[#F4D03F]/5 border border-[#F4D03F]/20 flex items-center justify-center mb-6 shadow-sm">
                        <SearchX className="w-8 h-8 text-[#F4D03F] opacity-40" />
                    </div>
                    <h3 className="text-3xl font-bold text-[#1A1A1A] tracking-tight opacity-40">No Locations Found</h3>
                    <p className="text-sm font-semibold opacity-30 italic max-w-sm mx-auto text-center uppercase tracking-widest mt-4">Initialize your first distribution node to start tracking.</p>
                    <button onClick={() => setIsAddingPlace(true)} className={cn(glass.btnPrimary, "mt-8 px-8")}>
                        <Plus className="w-5 h-5 mr-3" /> Initialize_Site_Alpha
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
                                        "p-0 cursor-pointer shadow-sm hover:border-[#F4D03F]/40 transition-all duration-300 relative flex flex-col h-full group bg-white rounded-3xl overflow-hidden"
                                    )}
                                    onClick={() => setViewingApiary(apiary)}
                                >
                                    <div className="p-6 flex flex-col gap-4 relative z-10">
                                        <div className="flex justify-between items-start">
                                            <div className="px-3 py-1 bg-[#1A1A1A]/5 rounded-full border border-[#F4D03F]/10 text-[8px] font-black uppercase tracking-widest text-[#1A1A1A]/40 group-hover:bg-[#F4D03F] group-hover:text-[#1A1A1A] transition-all">
                                                {apiary.type || 'Permanent'}
                                            </div>
                                            <div className="flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-[#1A1A1A]/5 border border-[#F4D03F]/10 group-hover:bg-[#F4D03F]/10 transition-all shadow-sm">
                                                <span className="text-lg font-black text-[#1A1A1A] group-hover:text-[#F4D03F]">{apiary.hive_count || 0}</span>
                                                <p className="text-[6px] font-black uppercase tracking-widest opacity-30 italic leading-none">UNITS</p>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-black text-[#1A1A1A] tracking-tighter uppercase group-hover:text-[#F4D03F] transition-all">
                                                {apiary.name}
                                            </h3>
                                            <div className="flex items-center gap-2 font-bold text-[#1A1A1A]/30 text-[9px] uppercase tracking-widest italic">
                                                <MapPin className="w-3 h-3 text-[#F4D03F]/40" />
                                                <span className="truncate">{apiary.location_name || 'NETWORK NODE'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-6 py-4 grid grid-cols-2 gap-4 border-t border-[#F4D03F]/5 bg-[#1A1A1A]/[0.02]">
                                        <div className="space-y-1">
                                            <p className="text-[7px] font-black uppercase tracking-widest text-[#1A1A1A]/20">Flora Vector</p>
                                            <div className="flex items-center gap-2">
                                                <Sprout className="w-3 h-3 text-[#1B9157]/40" />
                                                <p className="text-[9px] font-black text-[#1A1A1A]/80 tracking-widest uppercase truncate italic">{apiary.forage_type || 'Mixed Crops'}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[7px] font-black uppercase tracking-widest text-[#1A1A1A]/20">Area Coverage</p>
                                            <div className="flex items-center gap-2">
                                                <Target className="w-3 h-3 text-[#F4D03F]/40" />
                                                <p className="text-[9px] font-black text-[#1A1A1A]/80 tracking-widest uppercase tabular-nums italic">{apiary.size_acres || 0} AC</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="absolute top-4 right-14 opacity-0 group-hover:opacity-100 transition-all flex gap-2 z-20">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleEdit(apiary); }}
                                            className="h-8 w-8 rounded-lg bg-white border border-[#F4D03F]/10 shadow-sm flex items-center justify-center hover:text-[#F4D03F] transition-all"
                                        >
                                            <Edit className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(apiary.id, e); }}
                                            className="h-8 w-8 rounded-lg bg-white border border-[#F4D03F]/10 shadow-sm flex items-center justify-center hover:text-red-500 transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <div className="px-6 py-3 bg-[#1A1A1A]/[0.03] border-t border-[#F4D03F]/5 flex items-center justify-between mt-auto group-hover:bg-[#F4D03F]/5 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#1B9157] animate-pulse" />
                                            <span className="text-[8px] font-black text-[#1B9157] uppercase tracking-widest">Linked</span>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-[#F4D03F] transform group-hover:translate-x-1 transition-transform" />
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
