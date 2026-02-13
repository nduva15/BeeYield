import React, { useState } from 'react';
import { Plus, MapPin, Trash2, Edit, Thermometer, Droplets, Scale, Battery, Activity, LayoutGrid, List as ListIcon, Hexagon, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
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

// --- Sub-components (StatCard from PrecisionPollination) ---
const StatCard = ({ label, value, colorClass }: { label: string; value: string | number; colorClass: string }) => (
    <div className="bg-white dark:bg-[#111111] rounded-2xl p-4 border border-gray-100 dark:border-white/5 flex flex-col gap-1 shadow-sm">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
        <div className="flex items-center gap-2">
            <div className={cn("w-1.5 h-1.5 rounded-full", colorClass)} />
            <span className="text-xl font-black text-slate-800 dark:text-slate-100">{value}</span>
        </div>
    </div>
);

// --- Detail View Component ---
const ApiaryDetailView = ({ apiary, setViewingApiary }: { apiary: Apiary; setViewingApiary: (a: Apiary | null) => void }) => {
    const { hives, isLoading: hivesLoading } = useHivesWithTelemetry(apiary.id);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isAddingHive, setIsAddingHive] = useState(false);
    const [editingHive, setEditingHive] = useState<Hive | null>(null);

    const handleEditHive = (hive: Hive) => {
        setEditingHive(hive);
        setIsAddingHive(true);
    };

    const handleOpenAddHive = () => {
        setEditingHive(null);
        setIsAddingHive(true);
    };

    const getStatusColor = (status?: string) => {
        if (!status) return 'bg-gray-400';
        const s = status.toLowerCase();
        if (s.includes('healthy') || s.includes('active')) return 'bg-[#1B9157]';
        if (s.includes('weak') || s.includes('warning')) return 'bg-[#F4D03F]';
        if (s.includes('critical') || s.includes('abandoned')) return 'bg-red-500 animate-pulse';
        return 'bg-gray-400';
    };

    // Calculate aggregate health status
    const stats = React.useMemo(() => {
        const total = hives.length;
        const healthy = hives.filter(h => {
            const s = h.status?.toLowerCase() || '';
            return s.includes('healthy') || s.includes('active');
        }).length;
        const warnings = hives.filter(h => h.status?.toLowerCase().includes('weak')).length;
        const critical = hives.filter(h => h.status?.toLowerCase().includes('abandoned')).length;

        return { total, healthy, warnings, critical };
    }, [hives]);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
            <div className="mb-8 px-2 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewingApiary(null)}
                        className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                {apiary.name}
                            </h1>
                            <Badge className="bg-[#1B9157]/10 text-[#1B9157] border-none font-bold text-[10px] uppercase">
                                <ShieldCheck className="w-3 h-3 mr-1" /> Live
                            </Badge>
                        </div>
                        <p className="text-slate-500 text-sm font-semibold flex items-center gap-2 mt-1">
                            <MapPin className="w-3 h-3" />
                            {apiary.location_name || 'No location set'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-6 mx-2">
                {/* Field Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    <StatCard label="Total Hives" value={stats.total} colorClass="bg-[#F4D03F]" />
                    <StatCard label="Healthy" value={stats.healthy} colorClass="bg-[#1B9157]" />
                    <StatCard label="Warnings" value={stats.warnings} colorClass="bg-[#F4D03F]" />
                    <StatCard label="Critical" value={stats.critical} colorClass="bg-red-500" />
                    <StatCard label="Acreage" value={`${apiary.size_acres || 0} Ac`} colorClass="bg-blue-500" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Panel: Hive Fleet Visualization */}
                    <div className="lg:col-span-4 bg-white dark:bg-[#111111] rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                        <div className="p-6 border-b border-gray-50 dark:border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Hexagon className="w-4 h-4 text-[#F4D03F]" />
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Hive Fleet</h3>
                            </div>
                            <div className="flex gap-1">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="sm"
                                    className={cn("h-7 w-7 p-0", viewMode === 'grid' && "bg-[#F4D03F] text-black hover:bg-[#F4D03F]/90")}
                                    onClick={() => setViewMode('grid')}
                                >
                                    <LayoutGrid className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                                    size="sm"
                                    className={cn("h-7 w-7 p-0", viewMode === 'list' && "bg-[#F4D03F] text-black hover:bg-[#F4D03F]/90")}
                                    onClick={() => setViewMode('list')}
                                >
                                    <ListIcon className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>

                        <div className="p-5 flex-1 overflow-y-auto max-h-[500px] custom-scrollbar">
                            {viewMode === 'grid' ? (
                                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-6 gap-1.5">
                                    {hives.map(hive => (
                                        <div
                                            key={hive.id}
                                            className={cn(
                                                "aspect-square rounded flex items-center justify-center text-[10px] font-black text-white transition-all cursor-pointer hover:scale-110",
                                                getStatusColor(hive.status)
                                            )}
                                            title={`${hive.hive_code} - ${hive.status}`}
                                            onClick={() => handleEditHive(hive)}
                                        >
                                            {hive.hive_code.split('-')[1] || hive.hive_code.slice(-2)}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {hives.slice(0, 50).map(hive => (
                                        <div
                                            key={hive.id}
                                            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all cursor-pointer"
                                            onClick={() => handleEditHive(hive)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn("w-2 h-2 rounded-full", getStatusColor(hive.status))} />
                                                <span className="text-xs font-black text-slate-700 dark:text-slate-200">{hive.hive_code}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <Thermometer className="w-3 h-3" />
                                                    {((hive as any).temp || hive.latest_temp)?.toFixed(1) || '--'}°
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Scale className="w-3 h-3" />
                                                    {((hive as any).weight || hive.latest_weight)?.toFixed(1) || '--'}kg
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {hives.length > 50 && (
                                        <p className="text-center text-[10px] font-bold text-slate-400 py-2 uppercase tracking-widest">+ {hives.length - 50} more hives</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel: Detailed Hives List (Table) */}
                    <div className="lg:col-span-8 bg-white dark:bg-[#111111] rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden min-h-[400px]">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <Activity className="w-5 h-5 text-[#1B9157]" />
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Hives</h2>
                                </div>
                                <Button
                                    onClick={handleOpenAddHive}
                                    className="bg-[#1B9157] hover:bg-[#157a48] text-white font-bold rounded-xl btn-hover-effect"
                                >
                                    <Plus className="w-4 h-4 mr-2" /> New Hive
                                </Button>
                            </div>

                            {hivesLoading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-10 w-full rounded-lg" />
                                    <Skeleton className="h-[300px] w-full rounded-[1.5rem]" />
                                </div>
                            ) : (
                                <HivesTable
                                    data={hives || []}
                                    onRowClick={handleEditHive}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

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
    const [isAddingPlace, setIsAddingPlace] = useState(false);
    const [editingApiary, setEditingApiary] = useState<Apiary | null>(null);
    const [viewingApiary, setViewingApiary] = useState<Apiary | null>(null);

    // TanStack Query Hooks
    const { data: apiaries = [], isLoading } = useApiaries();
    const createApiary = useCreateApiary();
    const updateApiary = useUpdateApiary();
    const deleteApiary = useDeleteApiary();

    // Form state
    const [formData, setFormData] = useState<ApiaryCreateInput>({
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
            toast.error('Please enter an apiary name');
            return;
        }

        try {
            if (editingApiary) {
                await updateApiary.mutateAsync({ id: editingApiary.id, data: formData });
            } else {
                await createApiary.mutateAsync(formData);
            }
            resetForm();
        } catch (error) {
            // Error handling is done in mutation hooks
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
        if (!confirm('Are you sure you want to delete this apiary?')) return;
        try {
            await deleteApiary.mutateAsync(id);
        } catch (error) {
            console.error(error);
        }
    };

    if (viewingApiary) {
        return <ApiaryDetailView apiary={viewingApiary} setViewingApiary={setViewingApiary} />;
    }

    if (isAddingPlace) {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
                <div className="mb-8 px-2 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-[#1e293b] dark:text-white tracking-tight">
                        {editingApiary ? 'Edit Place' : 'Add Place'}
                    </h1>
                    <Button
                        variant="ghost"
                        onClick={resetForm}
                        className="text-slate-500"
                    >
                        Cancel
                    </Button>
                </div>

                <Card className="border-none shadow-sm bg-white dark:bg-[#1e1e1e] rounded-[2rem] overflow-hidden max-w-4xl mx-2">
                    <CardContent className="p-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            {/* Left Column */}
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <Label htmlFor="name" className="text-sm font-[800] text-slate-500 uppercase tracking-widest">
                                        Apiary Name<span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Nanyuki North Field"
                                        className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 text-base bg-slate-50/50 dark:bg-slate-900/50"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="type" className="text-sm font-[800] text-slate-500 uppercase tracking-widest">
                                        Apiary Type
                                    </Label>
                                    <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                                        <SelectTrigger className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="permanent">Permanent</SelectItem>
                                            <SelectItem value="migratory">Migratory</SelectItem>
                                            <SelectItem value="breeding">Breeding</SelectItem>
                                            <SelectItem value="quarantine">Quarantine</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="hives" className="text-sm font-[800] text-slate-500 uppercase tracking-widest">
                                        Expected Hives
                                    </Label>
                                    <Input
                                        id="hives"
                                        name="expected_hives"
                                        type="number"
                                        value={formData.expected_hives || ''}
                                        onChange={(e) => setFormData({ ...formData, expected_hives: parseInt(e.target.value) || 0 })}
                                        placeholder="0"
                                        className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 text-base bg-slate-50/50 dark:bg-slate-900/50"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="acres" className="text-sm font-[800] text-slate-500 uppercase tracking-widest">
                                        Apiary Size (Acres)
                                    </Label>
                                    <Input
                                        id="acres"
                                        name="size_acres"
                                        type="number"
                                        step="0.01"
                                        value={formData.size_acres || ''}
                                        onChange={(e) => setFormData({ ...formData, size_acres: parseFloat(e.target.value) || 0 })}
                                        placeholder="0.00"
                                        className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 text-base bg-slate-50/50 dark:bg-slate-900/50"
                                    />
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <Label htmlFor="location" className="text-sm font-[800] text-slate-500 uppercase tracking-widest">
                                        Location Name
                                    </Label>
                                    <Input
                                        id="location"
                                        name="location_name"
                                        value={formData.location_name}
                                        onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                                        placeholder="e.g. Mount Kenya Region"
                                        className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 text-base bg-slate-50/50 dark:bg-slate-900/50"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="forage" className="text-sm font-[800] text-slate-500 uppercase tracking-widest">
                                        Primary Forage
                                    </Label>
                                    <Input
                                        id="forage"
                                        name="forage_type"
                                        value={formData.forage_type}
                                        onChange={(e) => setFormData({ ...formData, forage_type: e.target.value })}
                                        placeholder="e.g. Acacia, Canola"
                                        className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 text-base bg-slate-50/50 dark:bg-slate-900/50"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="notes" className="text-sm font-[800] text-slate-500 uppercase tracking-widest">
                                        Notes
                                    </Label>
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full min-h-[120px] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 resize-y focus:outline-none focus:ring-2 focus:ring-[#F4D03F]"
                                        placeholder="Enter additional details..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 flex justify-end gap-4">
                            <Button
                                variant="ghost"
                                onClick={resetForm}
                                className="h-14 px-8 rounded-xl font-bold text-slate-500"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={createApiary.isPending || updateApiary.isPending}
                                className="h-14 px-8 rounded-xl bg-[#F4D03F] hover:bg-[#D4AF37] text-white font-bold"
                            >
                                {createApiary.isPending || updateApiary.isPending ? 'Saving...' : editingApiary ? 'Update Apiary' : 'Deploy Apiary'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Default List View
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
            <div className="mb-8 px-2 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#1e293b] dark:text-white tracking-tight">
                        My Places ({apiaries.length})
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Manage your apiaries and hive locations
                    </p>
                </div>
                <Button
                    onClick={() => setIsAddingPlace(true)}
                    className="bg-[#1e293b] hover:bg-black text-white rounded-full px-6 h-12 shadow-lg hover:shadow-xl transition-all font-bold"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    New Apiary
                </Button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="h-[200px] w-full rounded-[2rem]" />
                        </div>
                    ))}
                </div>
            ) : apiaries.length === 0 ? (
                <Card className="border-dashed border-2 border-slate-200 dark:border-slate-800 bg-transparent shadow-none mx-2">
                    <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6">
                            <MapPin className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-[#1e293b] dark:text-white mb-2">
                            No Apiaries Yet
                        </h3>
                        <p className="text-slate-500 max-w-sm mb-8">
                            Start by adding your first apiary location to track your hives and harvests.
                        </p>
                        <Button
                            onClick={() => setIsAddingPlace(true)}
                            className="bg-[#F4D03F] hover:bg-[#D4AF37] text-white font-bold rounded-xl h-12 px-8"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Add First Place
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mx-2">
                    {apiaries.map((apiary) => (
                        <div
                            key={apiary.id}
                            className="group relative bg-white dark:bg-[#1e1e1e] rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all border border-slate-100 dark:border-slate-800 cursor-pointer"
                            onClick={() => setViewingApiary(apiary)}
                        >
                            <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => { e.stopPropagation(); handleEdit(apiary); }}
                                    className="h-8 w-8 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-full"
                                >
                                    <Edit className="w-3 h-3 text-slate-500" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => handleDelete(apiary.id, e)}
                                    className="h-8 w-8 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 rounded-full"
                                >
                                    <Trash2 className="w-3 h-3 text-red-500" />
                                </Button>
                            </div>

                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <Badge className="mb-3 bg-green-100 text-green-700 hover:bg-green-100 border-none px-3 py-1 rounded-full uppercase text-[10px] font-bold tracking-wider">
                                        {apiary.type || 'Permanent'}
                                    </Badge>
                                    <h3 className="text-xl font-bold text-[#1e293b] dark:text-white mb-1 group-hover:text-[#F4D03F] transition-colors">
                                        {apiary.name}
                                    </h3>
                                    <div className="flex items-center text-slate-500 text-xs font-medium">
                                        <MapPin className="w-3 h-3 mr-1" />
                                        {apiary.location_name || 'Location not set'}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-black text-[#1e293b] dark:text-white">
                                        {apiary.hive_count || 0}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                        Hives
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-50 dark:border-slate-800">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                                        Forage
                                    </p>
                                    <p className="font-bold text-slate-700 dark:text-slate-300 text-sm truncate">
                                        {apiary.forage_type || 'Mixed Flora'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                                        Size
                                    </p>
                                    <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                                        {apiary.size_acres || 0} Acres
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyPlacesView;
