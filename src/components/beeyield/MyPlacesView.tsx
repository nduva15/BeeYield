import React, { useState } from 'react';
import { Plus, MapPin, Trash2, Edit, Thermometer, LayoutGrid, List as ListIcon, Hexagon, ShieldCheck, ArrowRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { Skeleton } from '@/components/ui/skeleton';
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
import OrchardDashboardView from './OrchardDashboardView'; // Assume this is the detail dashboard
import { PageHeader, StatCard, SectionHeader, EmptyState } from './SharedPageComponents';

// --- Detail View Component ---
const ApiaryDetailView = ({ apiary, setViewingApiary, onTabChange }: { apiary: Apiary; setViewingApiary: (a: Apiary | null) => void; onTabChange?: (tab: string) => void }) => {
    const { hives, isLoading: hivesLoading } = useHivesWithTelemetry(apiary.id);
    const [activeView, setActiveView] = useState<'dashboard' | 'details'>('dashboard');
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
        if (s.includes('healthy') || s.includes('active')) return 'bg-green-500';
        if (s.includes('weak') || s.includes('warning')) return 'bg-amber-500';
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
        <div className="space-y-6 pb-20">
            {/* Header with improved navigation */}
            <PageHeader
                title={apiary.name}
                subtitle={apiary.location_name || 'No location set'}
                icon={MapPin}
                badge={{ text: 'Live', variant: 'success' }}
                onBack={() => setViewingApiary(null)}
                actions={
                    <div className="flex gap-2">
                        <div className="flex justify-center p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <Button
                                variant={activeView === 'dashboard' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setActiveView('dashboard')}
                                className="h-8 dark:text-white"
                            >
                                Dashboard
                            </Button>
                            <Button
                                variant={activeView === 'details' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setActiveView('details')}
                                className="h-8 dark:text-white"
                            >
                                Details
                            </Button>
                        </div>
                    </div>
                }
            />

            {activeView === 'dashboard' ? (
                <OrchardDashboardView apiary={apiary} onTabChange={onTabChange} />
            ) : (
                <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        <StatCard label="Total Hives" value={stats.total} icon={Hexagon} color="blue" />
                        <StatCard label="Healthy" value={stats.healthy} icon={ShieldCheck} color="green" />
                        <StatCard label="Warnings" value={stats.warnings} icon={ShieldCheck} color="amber" />
                        <StatCard label="Critical" value={stats.critical} icon={ShieldCheck} color="red" />
                        <StatCard label="Acreage" value={`${apiary.size_acres || 0} Ac`} icon={MapPin} color="purple" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Left Panel: Hive Fleet Visualization */}
                        <Card className="lg:col-span-4 min-h-[400px]">
                            <CardContent className="p-0 flex flex-col h-full">
                                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                    <h3 className="text-sm font-bold uppercase text-gray-500">Hive Fleet</h3>
                                    <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                                        <Button
                                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                            size="sm"
                                            className="h-7 w-7 p-0"
                                            onClick={() => setViewMode('grid')}
                                        >
                                            <LayoutGrid className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                                            size="sm"
                                            className="h-7 w-7 p-0"
                                            onClick={() => setViewMode('list')}
                                        >
                                            <ListIcon className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="p-4 flex-1 overflow-y-auto max-h-[500px]">
                                    {viewMode === 'grid' ? (
                                        <div className="grid grid-cols-5 gap-2">
                                            {hives.map(hive => (
                                                <div
                                                    key={hive.id}
                                                    className={cn(
                                                        "aspect-square rounded-lg flex items-center justify-center text-xs font-bold text-white transition-all cursor-pointer hover:scale-105 shadow-sm",
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
                                                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                                                    onClick={() => handleEditHive(hive)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn("w-2 h-2 rounded-full", getStatusColor(hive.status))} />
                                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{hive.hive_code}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Thermometer className="w-3 h-3" />
                                                            {((hive as any).latest_temp)?.toFixed(1) || '--'}°
                                                        </span>
                                                        <ArrowRight className="w-3 h-3" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Right Panel: Detailed Hives List (Table) */}
                        <Card className="lg:col-span-8 min-h-[400px]">
                            <CardContent className="p-6">
                                <SectionHeader
                                    title="Active Hives"
                                    action={
                                        <Button
                                            onClick={handleOpenAddHive}
                                            className="gap-2"
                                        >
                                            <Plus className="w-4 h-4" /> New Hive
                                        </Button>
                                    }
                                />

                                <div className="mt-6">
                                    {hivesLoading ? (
                                        <div className="space-y-4">
                                            <Skeleton className="h-10 w-full rounded-lg" />
                                            <Skeleton className="h-[300px] w-full rounded-lg" />
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
        return <ApiaryDetailView apiary={viewingApiary} setViewingApiary={setViewingApiary} onTabChange={onTabChange} />;
    }

    if (isAddingPlace) {
        return (
            <div className="space-y-6 pb-20">
                <PageHeader
                    title={editingApiary ? 'Edit Place' : 'Add Place'}
                    subtitle="Create a new location for your hives"
                    icon={MapPin}
                    onBack={resetForm}
                />

                <Card className="max-w-3xl">
                    <CardContent className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column */}
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-sm font-bold text-gray-500 uppercase">Apiary Name*</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Nanyuki North Field"
                                        className="h-12"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-sm font-bold text-gray-500 uppercase">Apiary Type</Label>
                                    <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                                        <SelectTrigger className="h-12">
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

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <Label className="text-xs font-bold text-gray-500 uppercase">Hives</Label>
                                        <Input
                                            type="number"
                                            value={formData.expected_hives || ''}
                                            onChange={(e) => setFormData({ ...formData, expected_hives: parseInt(e.target.value) || 0 })}
                                            placeholder="0"
                                            className="h-12"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-xs font-bold text-gray-500 uppercase">Acres</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.size_acres || ''}
                                            onChange={(e) => setFormData({ ...formData, size_acres: parseFloat(e.target.value) || 0 })}
                                            placeholder="0.00"
                                            className="h-12"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-sm font-bold text-gray-500 uppercase">Location Name</Label>
                                    <Input
                                        value={formData.location_name}
                                        onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                                        placeholder="e.g. Mount Kenya Region"
                                        className="h-12"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-sm font-bold text-gray-500 uppercase">Primary Forage</Label>
                                    <Input
                                        value={formData.forage_type}
                                        onChange={(e) => setFormData({ ...formData, forage_type: e.target.value })}
                                        placeholder="e.g. Acacia, Canola"
                                        className="h-12"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-sm font-bold text-gray-500 uppercase">Notes</Label>
                                    <Textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="min-h-[120px]"
                                        placeholder="Enter additional details..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <Button
                                variant="ghost"
                                onClick={resetForm}
                                className="h-12 px-8"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={createApiary.isPending || updateApiary.isPending}
                                className="h-12 px-8"
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
        <div className="space-y-6 pb-20">
            <PageHeader
                title={`My Places`}
                subtitle="Manage your apiaries and hive locations"
                icon={MapPin}
                badge={{ text: `${apiaries.length} Locations`, variant: 'success' }}
                actions={
                    <Button
                        onClick={() => setIsAddingPlace(true)}
                        className="gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        New Apiary
                    </Button>
                }
            />

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AnimatePresence>
                        {[1, 2, 3].map(i => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: i * 0.1 }}
                            >
                                <Card className="h-48 animate-pulse">
                                    <CardContent className="h-full bg-gray-100 dark:bg-gray-800/50" />
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : apiaries.length === 0 ? (
                <EmptyState
                    icon={MapPin}
                    title="No Apiaries Yet"
                    description="Start by adding your first apiary location to track your hives and harvests."
                    action={{
                        label: "Add First Place",
                        onClick: () => setIsAddingPlace(true)
                    }}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {apiaries.map((apiary, index) => (
                            <motion.div
                                key={apiary.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                            >
                                <Card
                                    className="group relative cursor-pointer hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary overflow-hidden"
                                    onClick={() => setViewingApiary(apiary)}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <Badge variant="secondary" className="mb-2">
                                                    {apiary.type || 'Permanent'}
                                                </Badge>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                                                    {apiary.name}
                                                </h3>
                                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                                    <MapPin className="w-3.5 h-3.5 mr-1" />
                                                    {apiary.location_name || 'Location not set'}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-3xl font-black text-gray-900 dark:text-white">
                                                    {apiary.hive_count || 0}
                                                </span>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Hives</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-100 dark:border-gray-800">
                                            <div>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Forage</p>
                                                <p className="text-sm font-semibold truncate">{apiary.forage_type || 'Mixed Flora'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Size</p>
                                                <p className="text-sm font-semibold">{apiary.size_acres || 0} Acres</p>
                                            </div>
                                        </div>

                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => { e.stopPropagation(); handleEdit(apiary); }}
                                                className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800"
                                            >
                                                <Edit className="w-4 h-4 text-gray-500" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => handleDelete(apiary.id, e)}
                                                className="h-8 w-8 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
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
