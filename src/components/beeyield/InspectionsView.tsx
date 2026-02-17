import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
    Plus,
    Search,
    Loader2,
    Activity,
    Thermometer,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    Calendar,
    User,
    ClipboardList,
    MoreVertical,
    Trash2,
    Edit3,
    Bot,
    Filter,
    ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { beeyieldService, Apiary, Hive, Inspection } from '@/services/beeyieldService';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, StatCard, SectionHeader, EmptyState } from './SharedPageComponents';

interface InspectionsViewProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
    initialParams?: { message?: string, action?: string } | null;
}

const InspectionsView: React.FC<InspectionsViewProps> = ({ onTabChange, initialParams }) => {
    // UI State
    const [isAddingInspection, setIsAddingInspection] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Data State
    const [inspections, setInspections] = useState<Inspection[]>([]);
    const [apiaries, setApiaries] = useState<Apiary[]>([]);
    const [hives, setHives] = useState<Hive[]>([]);

    // Filters
    const [selectedPlaceId, setSelectedPlaceId] = useState<string>('all_places');
    const [selectedHiveId, setSelectedHiveId] = useState<string>('all_hives');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (initialParams?.action === 'open_add_new') {
            setIsAddingInspection(true);
        } else if (initialParams?.action?.startsWith('filter_hive:')) {
            const hiveId = initialParams.action.split(':')[1];
            if (hiveId && hives.some(h => h.id === hiveId)) {
                setSelectedHiveId(hiveId);
                const hive = hives.find(h => h.id === hiveId);
                if (hive && hive.apiary_id) {
                    setSelectedPlaceId(hive.apiary_id);
                }
                toast.info(`Filtering inspections for hive ${hive?.hive_code || hiveId}`);
            }
        }
    }, [initialParams, hives]);

    const { user, beeyieldUser } = useAuth();
    const userId = beeyieldUser?.id || user?.id;

    // Form State
    const [formData, setFormData] = useState({
        hive_id: '',
        inspector_name: '',
        inspection_date: new Date().toISOString().split('T')[0],
        health_status: 'healthy',
        temperament: 'calm',
        honey_stores: 0,
        pollen_stores: 0,
        brood_pattern: 'solid',
        eggs_seen: false,
        queen_seen: false,
        queen_cells_seen: false,
        varroa_mite_count: 0,
        small_hive_beetles_seen: 0,
        weather_condition: 'sunny',
        temperature_celsius: 25,
        findings: '',
        actions_taken: '',
        notes: ''
    });

    const resetForm = () => {
        setFormData({
            hive_id: '',
            inspector_name: '',
            inspection_date: new Date().toISOString().split('T')[0],
            health_status: 'healthy',
            temperament: 'calm',
            honey_stores: 0,
            pollen_stores: 0,
            brood_pattern: 'solid',
            eggs_seen: false,
            queen_seen: false,
            queen_cells_seen: false,
            varroa_mite_count: 0,
            small_hive_beetles_seen: 0,
            weather_condition: 'sunny',
            temperature_celsius: 25,
            findings: '',
            actions_taken: '',
            notes: ''
        });
        setEditingId(null);
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [apiariesData, hivesData, inspectionsData] = await Promise.all([
                    beeyieldService.getApiaries(),
                    beeyieldService.getHives(),
                    beeyieldService.getInspections()
                ]);

                if (userId) {
                    const filteredApiaries = apiariesData.filter(a => !a.user_id || a.user_id === userId);
                    const filteredHives = hivesData.filter(h => !h.user_id || h.user_id === userId);
                    const userHiveIds = new Set(filteredHives.map(h => h.id));
                    const filteredInspections = inspectionsData.filter(i => userHiveIds.has(i.hive_id));

                    setApiaries(filteredApiaries);
                    setHives(filteredHives);
                    setInspections(filteredInspections);
                } else {
                    setApiaries(apiariesData);
                    setHives(hivesData);
                    setInspections(inspectionsData);
                }
            } catch (error) {
                console.error("Error loading data", error);
                toast.error("Failed to load dashboard data");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [userId]);

    const handleSave = async () => {
        if (!formData.hive_id || formData.hive_id === 'all_hives') {
            toast.error("Please select a hive for this inspection");
            return;
        }

        setIsSaving(true);
        try {
            let result;
            if (editingId) {
                result = await beeyieldService.updateInspection(editingId, formData);
            } else {
                result = await beeyieldService.createInspection(formData);
            }

            const { data, error } = result;
            if (error) throw error;

            if (data) {
                if (editingId) {
                    setInspections(inspections.map(i => i.id === editingId ? data : i));
                    toast.success('Inspection updated successfully');
                } else {
                    setInspections([data, ...inspections]);
                    toast.success('Inspection saved successfully');
                }
            }

            setIsAddingInspection(false);
            resetForm();
        } catch (error: any) {
            console.error('Error saving inspection:', error);
            toast.error(error.message || "Failed to save inspection");
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (inspection: Inspection) => {
        setEditingId(inspection.id);
        const hive = hives.find(h => h.id === inspection.hive_id);
        setFormData({
            hive_id: inspection.hive_id,
            inspector_name: inspection.inspector_name || '',
            inspection_date: inspection.inspection_date || new Date().toISOString().split('T')[0],
            health_status: inspection.health_status || 'healthy',
            temperament: inspection.temperament || 'calm',
            honey_stores: inspection.honey_stores || 0,
            pollen_stores: inspection.pollen_stores || 0,
            brood_pattern: inspection.brood_pattern || 'solid',
            eggs_seen: inspection.eggs_seen || false,
            queen_seen: inspection.queen_seen || false,
            queen_cells_seen: inspection.queen_cells_seen || false,
            varroa_mite_count: inspection.varroa_mite_count || 0,
            small_hive_beetles_seen: inspection.small_hive_beetles_seen || 0,
            weather_condition: inspection.weather_condition || 'sunny',
            temperature_celsius: inspection.temperature_celsius || 25,
            findings: inspection.findings || '',
            actions_taken: inspection.actions_taken || '',
            notes: inspection.notes || ''
        });
        setIsAddingInspection(true);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this inspection?")) return;

        try {
            const { error } = await beeyieldService.deleteInspection(id);
            if (error) throw error;
            setInspections(inspections.filter(i => i.id !== id));
            toast.success("Inspection deleted");
        } catch (error) {
            console.error("Error deleting inspection:", error);
            toast.error("Failed to delete inspection");
        }
    };

    const filteredHives = hives.filter(h =>
        selectedPlaceId === 'all_places' || h.apiary_id === selectedPlaceId
    );

    const filteredInspections = inspections.filter(i => {
        if (selectedHiveId !== 'all_hives' && i.hive_id !== selectedHiveId) return false;
        if (selectedPlaceId !== 'all_places') {
            const hive = hives.find(h => h.id === i.hive_id);
            if (!hive || hive.apiary_id !== selectedPlaceId) return false;
        }
        if (searchQuery) {
            const hive = hives.find(h => h.id === i.hive_id);
            const apiary = hive ? apiaries.find(a => a.id === hive.apiary_id) : null;
            const searchLower = searchQuery.toLowerCase();
            return (
                i.inspector_name?.toLowerCase().includes(searchLower) ||
                i.findings?.toLowerCase().includes(searchLower) ||
                hive?.hive_code.toLowerCase().includes(searchLower) ||
                apiary?.name.toLowerCase().includes(searchLower)
            );
        }
        return true;
    });

    const stats = React.useMemo(() => {
        return {
            total: inspections.length,
            healthy: inspections.filter(i => i.health_status === 'healthy').length,
            issues: inspections.filter(i => i.health_status !== 'healthy').length,
            thisMonth: inspections.filter(i => {
                const date = new Date(i.inspection_date);
                const now = new Date();
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            }).length
        };
    }, [inspections]);

    if (isAddingInspection) {
        return (
            <div className="space-y-6 pb-12">
                <PageHeader
                    title={editingId ? 'Edit Inspection' : 'New Key Inspection'}
                    subtitle="Record hive health, brood patterns, and observations"
                    icon={ClipboardList}
                    onBack={() => {
                        setIsAddingInspection(false);
                        resetForm();
                    }}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form Left - Selection & Basic Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary">Destination & Date</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Apiary</Label>
                                    <Select
                                        value={hives.find(h => h.id === formData.hive_id)?.apiary_id || 'unselected'}
                                        onValueChange={(val) => {
                                            const firstHive = hives.find(h => h.apiary_id === val);
                                            if (firstHive) setFormData({ ...formData, hive_id: firstHive.id });
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Apiary" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {apiaries.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Target Hive</Label>
                                    <Select
                                        value={formData.hive_id}
                                        onValueChange={(val) => setFormData({ ...formData, hive_id: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Hive" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {hives
                                                .filter(h => !hives.find(xh => xh.id === formData.hive_id)?.apiary_id || h.apiary_id === hives.find(xh => xh.id === formData.hive_id)?.apiary_id)
                                                .map(h => <SelectItem key={h.id} value={h.id}>{h.hive_code}</SelectItem>)
                                            }
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Inspection Date</Label>
                                    <Input
                                        type="date"
                                        value={formData.inspection_date}
                                        onChange={(e) => setFormData({ ...formData, inspection_date: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Inspector Name</Label>
                                    <Input
                                        placeholder="Full Name"
                                        value={formData.inspector_name}
                                        onChange={(e) => setFormData({ ...formData, inspector_name: e.target.value })}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-primary/5 border-primary/20">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <Bot className="w-6 h-6 text-primary" />
                                    <h3 className="font-bold text-gray-900 dark:text-white">Smart Assistant</h3>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Complete the inspection data to receive automated health scoring and varroa risk assessment.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Form Center - Vitals */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
                                    <Activity className="w-4 h-4" /> Colony Vitals
                                </CardTitle>
                                <div className="flex gap-2">
                                    {['healthy', 'weak', 'diseased', 'critical'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setFormData({ ...formData, health_status: s })}
                                            className={cn(
                                                "px-3 py-1 rounded-full text-xs font-bold uppercase transition-all",
                                                formData.health_status === s
                                                    ? "bg-primary text-white shadow-md"
                                                    : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                                            )}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Swaps/Switches */}
                                    <div className="space-y-4">
                                        {[
                                            { id: 'queen_seen', label: 'Queen Seen', sub: 'Visual confirmation' },
                                            { id: 'eggs_seen', label: 'Eggs Seen', sub: 'Evidence of laying' },
                                            { id: 'queen_cells_seen', label: 'Queen Cells', sub: 'Active/emerging cells' }
                                        ].map(item => (
                                            <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{item.label}</span>
                                                    <span className="text-xs text-gray-500">{item.sub}</span>
                                                </div>
                                                <Switch
                                                    checked={(formData as any)[item.id]}
                                                    onCheckedChange={(val) => setFormData({ ...formData, [item.id]: val })}
                                                />
                                            </div>
                                        ))}

                                        <div className="pt-2">
                                            <Label className="mb-2 block">Temperament</Label>
                                            <div className="flex gap-2">
                                                {['calm', 'nervous', 'aggressive'].map(t => (
                                                    <Button
                                                        key={t}
                                                        variant={formData.temperament === t ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => setFormData({ ...formData, temperament: t })}
                                                        className="flex-1 capitalize"
                                                    >
                                                        {t}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Metrics */}
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Est. Temperature (°C)</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.temperature_celsius}
                                                    onChange={(e) => setFormData({ ...formData, temperature_celsius: parseFloat(e.target.value) })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Weather</Label>
                                                <Select value={formData.weather_condition} onValueChange={(v) => setFormData({ ...formData, weather_condition: v })}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="sunny">Sunny</SelectItem>
                                                        <SelectItem value="cloudy">Cloudy</SelectItem>
                                                        <SelectItem value="rainy">Rainy</SelectItem>
                                                        <SelectItem value="windy">Windy</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Honey (kg)</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.honey_stores}
                                                    onChange={(e) => setFormData({ ...formData, honey_stores: parseFloat(e.target.value) })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Pollen (Frames)</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.pollen_stores}
                                                    onChange={(e) => setFormData({ ...formData, pollen_stores: parseFloat(e.target.value) })}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-red-500">Varroa Count</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.varroa_mite_count}
                                                    onChange={(e) => setFormData({ ...formData, varroa_mite_count: parseInt(e.target.value) })}
                                                    className="border-red-200 focus-visible:ring-red-500"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>SH Beetles</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.small_hive_beetles_seen}
                                                    onChange={(e) => setFormData({ ...formData, small_hive_beetles_seen: parseInt(e.target.value) })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Key Findings</Label>
                                        <Textarea
                                            placeholder="What did you observe?"
                                            value={formData.findings}
                                            onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                                            className="min-h-[80px]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Actions Taken</Label>
                                        <Textarea
                                            placeholder="Added super, treated for varroa, etc."
                                            value={formData.actions_taken}
                                            onChange={(e) => setFormData({ ...formData, actions_taken: e.target.value })}
                                            className="min-h-[80px]"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="h-12 px-8 text-base"
                                    >
                                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                                        {editingId ? 'Update Record' : 'Save Inspection'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <PageHeader
                title="Inspections"
                subtitle="Detailed monitoring logs and health records"
                icon={ClipboardList}
                badge={{ text: `${stats.total} Records`, variant: 'success' }}
                actions={
                    <Button
                        onClick={() => {
                            resetForm();
                            setIsAddingInspection(true);
                        }}
                        className="gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        New Inspection
                    </Button>
                }
            />

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Inspections"
                    value={stats.total}
                    icon={ClipboardList}
                    color="primary"
                />
                <StatCard
                    label="Healthy Hives"
                    value={stats.healthy}
                    icon={CheckCircle2}
                    color="green"
                    subtitle={`${Math.round((stats.healthy / (stats.total || 1)) * 100)}% of total`}
                />
                <StatCard
                    label="Issues Found"
                    value={stats.issues}
                    icon={AlertCircle}
                    color="amber"
                    subtitle="Requires attention"
                />
                <StatCard
                    label="This Month"
                    value={stats.thisMonth}
                    icon={Calendar}
                    color="blue"
                    subtitle="Recent activity"
                />
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search by inspector, findings, hive code..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={selectedPlaceId} onValueChange={setSelectedPlaceId}>
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="All Places" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all_places">All Places</SelectItem>
                                {apiaries.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={selectedHiveId} onValueChange={setSelectedHiveId}>
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="All Hives" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all_hives">All Hives</SelectItem>
                                {filteredHives.map(h => <SelectItem key={h.id} value={h.id}>{h.hive_code}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Inspection List */}
            {isLoading ? (
                <div className="grid grid-cols-1 gap-4">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-8">
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : filteredInspections.length === 0 ? (
                <EmptyState
                    icon={ClipboardList}
                    title="No Inspections Found"
                    description="Start documenting your hive maintenance and health status by creating your first inspection."
                    action={{
                        label: "Create First Inspection",
                        onClick: () => { resetForm(); setIsAddingInspection(true); }
                    }}
                />
            ) : (
                <div className="space-y-4">
                    <SectionHeader title="Recent Logs" subtitle={`Showing ${filteredInspections.length} records`} />
                    <div className="grid grid-cols-1 gap-4">
                        <AnimatePresence>
                            {filteredInspections.map((inspection, index) => {
                                const hive = hives.find(h => h.id === inspection.hive_id);
                                const apiary = hive ? apiaries.find(a => a.id === hive.apiary_id) : null;

                                return (
                                    <motion.div
                                        key={inspection.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer border-l-4 border-l-primary" onClick={() => handleEdit(inspection)}>
                                            <CardContent className="p-6">
                                                <div className="flex flex-col md:flex-row gap-6">
                                                    {/* Left: Hive Info */}
                                                    <div className="w-full md:w-64 flex-shrink-0">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                                {hive?.hive_code?.split('-').pop() || '??'}
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-gray-900 dark:text-white">
                                                                    {apiary?.name || 'Unknown Apiary'}
                                                                </h3>
                                                                <p className="text-xs text-gray-500">{hive?.hive_code}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-wrap gap-2 mt-3">
                                                            <Badge variant="outline" className={cn(
                                                                "border-none",
                                                                inspection.health_status === 'healthy' ? "bg-green-100 text-green-700" :
                                                                    inspection.health_status === 'weak' ? "bg-amber-100 text-amber-700" :
                                                                        "bg-red-100 text-red-700"
                                                            )}>
                                                                {inspection.health_status}
                                                            </Badge>
                                                            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                                                                {inspection.inspection_date}
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    {/* Middle: Stats */}
                                                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                                                        <div>
                                                            <p className="text-xs text-gray-500 uppercase font-bold">Stores</p>
                                                            <p className="font-semibold">{inspection.honey_stores || 0} kg</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 uppercase font-bold">Varroa</p>
                                                            <p className={cn("font-semibold", (inspection.varroa_mite_count || 0) > 5 ? "text-red-500" : "")}>
                                                                {inspection.varroa_mite_count || 0}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 uppercase font-bold">Temp</p>
                                                            <p className="font-semibold">{inspection.temperature_celsius || '--'}°C</p>
                                                        </div>
                                                        <div>
                                                            <div className="flex gap-1">
                                                                {inspection.queen_seen && <Badge className="text-[10px] h-5 bg-green-100 text-green-700 border-none px-1">Q</Badge>}
                                                                {inspection.eggs_seen && <Badge className="text-[10px] h-5 bg-blue-100 text-blue-700 border-none px-1">E</Badge>}
                                                                {inspection.queen_cells_seen && <Badge className="text-[10px] h-5 bg-red-100 text-red-700 border-none px-1">QC</Badge>}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Right: Actions */}
                                                    <div className="flex flex-col justify-between items-end gap-2">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-primary">
                                                            <ArrowRight className="w-5 h-5" />
                                                        </Button>

                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-gray-400 hover:text-red-500"
                                                                onClick={(e) => handleDelete(inspection.id, e)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InspectionsView;
