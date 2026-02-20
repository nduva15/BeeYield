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
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    Calendar,
    ClipboardList,
    Trash2,
    Bot,
    ArrowRight,
    MapPin,
    Thermometer,
    Zap,
    Wind,
    Sun,
    HeartPulse,
    ChevronLeft,
    ChevronRight,
    SearchX
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { beeyieldService, Apiary, Hive, Inspection } from '@/services/beeyieldService';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

interface InspectionsViewProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
    initialParams?: { message?: string, action?: string } | null;
}

const InspectionsView: React.FC<InspectionsViewProps> = ({ initialParams }) => {
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
                toast.info(`Filtering logs for hive ${hive?.hive_code || hiveId}`);
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
                    toast.success('Record archived successfully');
                } else {
                    setInspections([data, ...inspections]);
                    toast.success('New inspection record created');
                }
            }

            setIsAddingInspection(false);
            resetForm();
        } catch (error: any) {
            console.error('Error saving inspection:', error);
            toast.error(error.message || "Failed to commit record");
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (inspection: Inspection) => {
        setEditingId(inspection.id);
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
        if (!confirm("Remove this inspection record indefinitely?")) return;

        try {
            const { error } = await beeyieldService.deleteInspection(id);
            if (error) throw error;
            setInspections(inspections.filter(i => i.id !== id));
            toast.success("Record purged");
        } catch (error) {
            console.error("Error deleting record:", error);
            toast.error("Failed to delete inspection");
        }
    };

    const filteredHivesForSelect = hives.filter(h =>
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
            <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Custom Page Header */}
                <div className="flex items-center gap-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setIsAddingInspection(false); resetForm(); }}
                        className="h-14 w-14 rounded-2xl border border-beeyield-sand bg-white text-beeyield-charcoal hover:bg-beeyield-forest/5 hover:text-beeyield-forest"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <div>
                        <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-beeyield-forest/5 border border-beeyield-forest/10 mb-2">
                            <ClipboardList className="w-3.5 h-3.5 text-beeyield-forest" />
                            <span className="text-[10px] font-bold text-beeyield-forest uppercase tracking-[0.1em]">{editingId ? 'Edit Draft' : 'New Entry'}</span>
                        </div>
                        <h1 className="text-4xl font-bold text-beeyield-charcoal tracking-tight">Colony Diagnostics</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Panel: Scope & Metadata */}
                    <div className="lg:col-span-1 space-y-8">
                        <Card className="rounded-[2.5rem] border-[#E0E0E0] bg-white shadow-sm overflow-hidden">
                            <CardHeader className="p-10 pb-6">
                                <CardTitle className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400">Contextual Scope</CardTitle>
                            </CardHeader>
                            <CardContent className="p-10 pt-0 space-y-8">
                                <div className="space-y-3">
                                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1">Target Apiary</Label>
                                    <Select
                                        value={hives.find(h => h.id === formData.hive_id)?.apiary_id || 'unselected'}
                                        onValueChange={(val) => {
                                            const firstHive = hives.find(h => h.apiary_id === val);
                                            if (firstHive) setFormData({ ...formData, hive_id: firstHive.id });
                                        }}
                                    >
                                        <SelectTrigger className="h-14 rounded-2xl border-[#E0E0E0] font-bold text-beeyield-charcoal">
                                            <SelectValue placeholder="Select Location" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl shadow-xl">
                                            {apiaries.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1">Specific Hive</Label>
                                    <Select
                                        value={formData.hive_id}
                                        onValueChange={(val) => setFormData({ ...formData, hive_id: val })}
                                    >
                                        <SelectTrigger className="h-14 rounded-2xl border-[#E0E0E0] font-bold text-beeyield-charcoal">
                                            <SelectValue placeholder="Identify Hive" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl shadow-xl">
                                            {hives
                                                .filter(h => !hives.find(xh => xh.id === formData.hive_id)?.apiary_id || h.apiary_id === hives.find(xh => xh.id === formData.hive_id)?.apiary_id)
                                                .map(h => <SelectItem key={h.id} value={h.id}>Hive #{h.hive_code}</SelectItem>)
                                            }
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1">Archive Date</Label>
                                    <Input
                                        type="date"
                                        value={formData.inspection_date}
                                        onChange={(e) => setFormData({ ...formData, inspection_date: e.target.value })}
                                        className="h-14 rounded-2xl border-[#E0E0E0] font-bold text-beeyield-charcoal"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1">Inspector</Label>
                                    <Input
                                        placeholder="Certified Inspector Name"
                                        value={formData.inspector_name}
                                        onChange={(e) => setFormData({ ...formData, inspector_name: e.target.value })}
                                        className="h-14 rounded-2xl border-[#E0E0E0] font-bold text-beeyield-charcoal"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-[2.5rem] border-none bg-beeyield-forest shadow-xl shadow-beeyield-forest/20 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-700" />
                            <CardContent className="p-10 relative z-10 flex items-start gap-5">
                                <Bot className="w-8 h-8 text-emerald-300 mt-1" />
                                <div className="space-y-2">
                                    <h3 className="font-bold text-white text-lg">Neural Co-Pilot</h3>
                                    <p className="text-emerald-100/70 text-sm leading-relaxed">
                                        Submitting this log triggers the bio-model to update the hive's health score and varroa risk vector in real-time.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Panel: Biometric Data */}
                    <div className="lg:col-span-2 space-y-10">
                        <Card className="rounded-[3rem] border-[#E0E0E0] bg-white shadow-sm overflow-hidden">
                            <CardHeader className="p-10 pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                <div>
                                    <CardTitle className="text-2xl font-bold text-beeyield-charcoal flex items-center gap-3">
                                        <HeartPulse className="w-6 h-6 text-beeyield-forest" />
                                        Health Vector
                                    </CardTitle>
                                    <p className="text-gray-400 font-medium text-sm mt-1 uppercase tracking-widest px-1">Vital Colony Parameters</p>
                                </div>
                                <div className="flex bg-beeyield-sand/30 border border-[#E8E0D5] rounded-2xl p-1.5 gap-1">
                                    {['healthy', 'weak', 'diseased', 'critical'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setFormData({ ...formData, health_status: s })}
                                            className={cn(
                                                "h-10 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                                                formData.health_status === s
                                                    ? "bg-beeyield-forest text-white shadow-md shadow-beeyield-forest/20"
                                                    : "text-gray-400 hover:text-beeyield-charcoal hover:bg-white"
                                            )}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </CardHeader>
                            <CardContent className="p-10 space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    {/* Swaps & Toggles */}
                                    <div className="space-y-5">
                                        {[
                                            { id: 'queen_seen', label: 'Queen Verified', sub: 'Visual presence confirmed', icon: ShieldCheck },
                                            { id: 'eggs_seen', label: 'Egg Presence', sub: 'Oviposition cycle active', icon: CheckCircle2 },
                                            { id: 'queen_cells_seen', label: 'Queen Cells', sub: 'Active swarming markers', icon: AlertCircle }
                                        ].map(item => (
                                            <div key={item.id} className="flex items-center justify-between p-6 rounded-[1.5rem] bg-beeyield-sand/20 border border-transparent hover:border-[#E8E0D5] transition-all group">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-10 h-10 rounded-xl bg-white border border-[#F0F0F0] flex items-center justify-center text-gray-400 group-hover:text-beeyield-forest transition-colors">
                                                        <item.icon className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-beeyield-charcoal">{item.label}</span>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.sub}</span>
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={(formData as any)[item.id]}
                                                    onCheckedChange={(val) => setFormData({ ...formData, [item.id]: val })}
                                                    className="data-[state=checked]:bg-beeyield-forest"
                                                />
                                            </div>
                                        ))}

                                        <div className="pt-4 space-y-3">
                                            <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1">Temperament Profile</Label>
                                            <div className="flex bg-beeyield-sand/30 border border-[#E8E0D5] rounded-2xl p-1.5 gap-1">
                                                {['calm', 'nervous', 'aggressive'].map(t => (
                                                    <button
                                                        key={t}
                                                        onClick={() => setFormData({ ...formData, temperament: t })}
                                                        className={cn(
                                                            "flex-1 h-12 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all",
                                                            formData.temperament === t
                                                                ? "bg-beeyield-forest text-white shadow-md shadow-beeyield-forest/20"
                                                                : "text-gray-400 hover:text-beeyield-charcoal hover:bg-white"
                                                        )}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Physical Metrics */}
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1">Internal Temp (°C)</Label>
                                                <div className="relative">
                                                    <Thermometer className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <Input
                                                        type="number"
                                                        value={formData.temperature_celsius}
                                                        onChange={(e) => setFormData({ ...formData, temperature_celsius: parseFloat(e.target.value) })}
                                                        className="h-14 pl-10 rounded-2xl border-[#E0E0E0] font-bold text-beeyield-charcoal"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1">Sky Conditions</Label>
                                                <Select value={formData.weather_condition} onValueChange={(v) => setFormData({ ...formData, weather_condition: v })}>
                                                    <SelectTrigger className="h-14 rounded-2xl border-[#E0E0E0] font-bold text-beeyield-charcoal">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl">
                                                        <SelectItem value="sunny">Sunny</SelectItem>
                                                        <SelectItem value="cloudy">Cloudy</SelectItem>
                                                        <SelectItem value="rainy">Rainy</SelectItem>
                                                        <SelectItem value="windy">Windy</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1">Liquid Honey (kg)</Label>
                                                <div className="relative">
                                                    <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                                                    <Input
                                                        type="number"
                                                        value={formData.honey_stores}
                                                        onChange={(e) => setFormData({ ...formData, honey_stores: parseFloat(e.target.value) })}
                                                        className="h-14 pl-10 rounded-2xl border-[#E0E0E0] font-bold text-beeyield-charcoal"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1">Pollen Load</Label>
                                                <div className="relative">
                                                    <Sun className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
                                                    <Input
                                                        type="number"
                                                        value={formData.pollen_stores}
                                                        onChange={(e) => setFormData({ ...formData, pollen_stores: parseFloat(e.target.value) })}
                                                        className="h-14 pl-10 rounded-2xl border-[#E0E0E0] font-bold text-beeyield-charcoal placeholder:font-medium"
                                                        placeholder="Frames"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label className="text-[11px] font-bold text-red-500 uppercase tracking-[0.15em] ml-1">Varroa Count</Label>
                                                <div className="relative">
                                                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                                                    <Input
                                                        type="number"
                                                        value={formData.varroa_mite_count}
                                                        onChange={(e) => setFormData({ ...formData, varroa_mite_count: parseInt(e.target.value) })}
                                                        className="h-14 pl-10 rounded-2xl border-red-100 bg-red-50/10 font-bold text-red-600 focus-visible:ring-red-500"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1">SH Beetles</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.small_hive_beetles_seen}
                                                    onChange={(e) => setFormData({ ...formData, small_hive_beetles_seen: parseInt(e.target.value) })}
                                                    className="h-14 rounded-2xl border-[#E0E0E0] font-bold text-beeyield-charcoal"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-[1px] w-full bg-[#F5F5F5]" />

                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1">Observational Findings</Label>
                                        <Textarea
                                            placeholder="Environmental anomalies, brood capping quality, odor, etc."
                                            value={formData.findings}
                                            onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                                            className="min-h-[120px] rounded-3xl border-[#E0E0E0] p-8 font-medium text-lg focus:ring-beeyield-forest/20 focus:border-beeyield-forest/30 transition-all resize-none"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1">Bio-Manipulations (Actions)</Label>
                                        <Textarea
                                            placeholder="Splits performed, supers modified, thermal treatment initiated..."
                                            value={formData.actions_taken}
                                            onChange={(e) => setFormData({ ...formData, actions_taken: e.target.value })}
                                            className="min-h-[120px] rounded-3xl border-[#E0E0E0] p-8 font-medium text-lg focus:ring-beeyield-forest/20 focus:border-beeyield-forest/30 transition-all resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="h-16 px-12 rounded-2xl bg-beeyield-forest text-white gap-3 font-bold text-lg shadow-xl shadow-beeyield-forest/20"
                                    >
                                        {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <ShieldCheck className="w-6 h-6" />}
                                        {editingId ? 'Commit Record Changes' : 'Finalize & Archive Log'}
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
        <div className="space-y-12 pb-20 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-beeyield-forest/5 border border-beeyield-forest/10 mb-6">
                        <ClipboardList className="w-3.5 h-3.5 text-beeyield-forest" />
                        <span className="text-[10px] font-bold text-beeyield-forest uppercase tracking-[0.15em]">Observational Archive</span>
                    </div>
                    <h1 className="text-5xl font-bold text-beeyield-charcoal tracking-tight">Diagnostic Logs</h1>
                    <p className="text-gray-500 font-medium mt-3 text-lg">
                        Systematic health records and colonial history for every sector.
                    </p>
                </div>
                <Button
                    onClick={() => {
                        resetForm();
                        setIsAddingInspection(true);
                    }}
                    className="h-14 px-8 rounded-2xl bg-beeyield-forest hover:opacity-90 text-white shadow-lg shadow-beeyield-forest/20 gap-3 font-bold text-sm tracking-wide"
                >
                    <Plus className="w-5 h-5" />
                    New Inspection
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                    { label: 'Total Records', value: stats.total, icon: ClipboardList, color: 'text-beeyield-forest', bg: 'bg-beeyield-forest/5' },
                    { label: 'Healthy State', value: stats.healthy, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Stress Signals', value: stats.issues, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
                    { label: 'Current Cycle', value: stats.thisMonth, icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50' }
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
                                placeholder="Search by inspector, findings, or hive code..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 h-14 rounded-2xl border-[#E0E0E0] bg-white font-medium text-sm focus:ring-beeyield-forest/20 focus:border-beeyield-forest/30 transition-all shadow-sm"
                            />
                        </div>
                        <Select value={selectedPlaceId} onValueChange={setSelectedPlaceId}>
                            <SelectTrigger className="h-14 md:w-[220px] rounded-2xl border-[#E0E0E0] font-bold text-sm bg-white shadow-sm">
                                <MapPin className="w-4 h-4 mr-2 text-beeyield-forest" />
                                <SelectValue placeholder="Network Focus" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-[#E0E0E0] shadow-xl">
                                <SelectItem value="all_places">Global Network Focus</SelectItem>
                                {apiaries.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={selectedHiveId} onValueChange={setSelectedHiveId}>
                            <SelectTrigger className="h-14 md:w-[220px] rounded-2xl border-[#E0E0E0] font-bold text-sm bg-white shadow-sm">
                                <Hexagon className="w-4 h-4 mr-2 text-beeyield-forest" />
                                <SelectValue placeholder="Colony Filter" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-[#E0E0E0] shadow-xl">
                                <SelectItem value="all_hives">All Colony Filter</SelectItem>
                                {filteredHivesForSelect.map(h => <SelectItem key={h.id} value={h.id}>Hive #{h.hive_code}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* List Content */}
            {isLoading ? (
                <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-40 rounded-[2.5rem] bg-beeyield-sand/20 animate-pulse border border-beeyield-sand/30" />
                    ))}
                </div>
            ) : filteredInspections.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-beeyield-forest/5 border border-beeyield-forest/10 flex items-center justify-center mb-8">
                        <SearchX className="w-10 h-10 text-beeyield-forest/30" />
                    </div>
                    <h3 className="text-2xl font-bold text-beeyield-charcoal mb-3">No Records Found</h3>
                    <p className="text-gray-400 font-medium max-w-md mb-8">Adjust your filters or initiate a new inspection to begin documenting colony biometrics.</p>
                    <Button onClick={() => { resetForm(); setIsAddingInspection(true); }} className="h-12 px-6 rounded-xl bg-beeyield-forest text-white font-bold gap-2">
                        <Plus className="w-4 h-4" /> Start New Inspection
                    </Button>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-beeyield-charcoal px-2">Cycle Feed</h3>
                        <div className="h-[1px] flex-1 bg-[#F5F5F5]" />
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{filteredInspections.length} Entry Results</span>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                        <AnimatePresence mode="popLayout">
                            {filteredInspections.map((inspection, index) => {
                                const hive = hives.find(h => h.id === inspection.hive_id);
                                const apiary = hive ? apiaries.find(a => a.id === hive.apiary_id) : null;

                                return (
                                    <motion.div
                                        key={inspection.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Card
                                            className="rounded-[2.5rem] border-[#E0E0E0] bg-white hover:shadow-xl hover:shadow-beeyield-forest/5 hover:border-beeyield-forest/20 transition-all duration-300 cursor-pointer group"
                                            onClick={() => handleEdit(inspection)}
                                        >
                                            <CardContent className="p-8">
                                                <div className="flex flex-col lg:flex-row gap-10">
                                                    {/* Hive & Basic Context */}
                                                    <div className="w-full lg:w-80 flex-shrink-0">
                                                        <div className="flex items-start gap-5">
                                                            <div className="w-14 h-14 rounded-2xl bg-beeyield-forest/5 flex items-center justify-center text-beeyield-forest group-hover:bg-beeyield-forest group-hover:text-white transition-all duration-500 overflow-hidden relative">
                                                                <Hexagon className="w-6 h-6 stroke-[2.5]" />
                                                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-beeyield-charcoal text-xl leading-none pt-1">
                                                                    {apiary?.name || 'Local Sector'}
                                                                </h3>
                                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Hive #{hive?.hive_code || '---'}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-wrap gap-2.5 mt-8">
                                                            <Badge className={cn(
                                                                "rounded-full px-3.5 py-1.5 border-none font-bold text-[9px] uppercase tracking-widest",
                                                                inspection.health_status === 'healthy' ? "bg-emerald-50 text-emerald-600" :
                                                                    inspection.health_status === 'weak' ? "bg-amber-50 text-amber-600" :
                                                                        "bg-red-50 text-red-600"
                                                            )}>
                                                                {inspection.health_status} Status
                                                            </Badge>
                                                            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-beeyield-sand/30 border border-[#E8E0D5] text-[9px] font-bold text-beeyield-charcoal uppercase tracking-widest">
                                                                <Calendar className="w-3 h-3 text-beeyield-forest" />
                                                                {new Date(inspection.inspection_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Metrics Snapshot */}
                                                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-8 py-2">
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Liquid Mass</p>
                                                            <div className="flex items-center gap-2">
                                                                <Zap className="w-3.5 h-3.5 text-amber-500" />
                                                                <span className="font-bold text-beeyield-charcoal text-lg">{inspection.honey_stores || 0} kg</span>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Varroa Load</p>
                                                            <div className="flex items-center gap-2">
                                                                <ShieldCheck className={cn("w-3.5 h-3.5", (inspection.varroa_mite_count || 0) > 3 ? "text-red-500" : "text-emerald-500")} />
                                                                <span className={cn("font-bold text-lg", (inspection.varroa_mite_count || 0) > 3 ? "text-red-500" : "text-beeyield-charcoal")}>
                                                                    {inspection.varroa_mite_count || 0}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Internal Core</p>
                                                            <div className="flex items-center gap-2">
                                                                <Thermometer className="w-3.5 h-3.5 text-orange-500" />
                                                                <span className="font-bold text-beeyield-charcoal text-lg">{inspection.temperature_celsius || '--'}°C</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col justify-center">
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {inspection.queen_seen && <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[10px] font-black text-emerald-600" title="Queen Seen">Q</div>}
                                                                {inspection.eggs_seen && <div className="w-6 h-6 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600" title="Eggs Seen">E</div>}
                                                                {inspection.queen_cells_seen && <div className="w-6 h-6 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-[10px] font-black text-red-600" title="Cells Observed">QC</div>}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Actions & Navigation */}
                                                    <div className="flex flex-row lg:flex-col justify-between items-end gap-4 border-t lg:border-t-0 lg:border-l border-[#F5F5F5] pt-6 lg:pt-0 lg:pl-10">
                                                        <div className="w-12 h-12 rounded-2xl bg-beeyield-sand/30 flex items-center justify-center text-beeyield-forest group-hover:bg-beeyield-forest group-hover:text-white transition-all duration-500">
                                                            <ArrowRight className="w-5 h-5" />
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-10 w-10 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                            onClick={(e) => handleDelete(inspection.id, e)}
                                                        >
                                                            <Trash2 className="w-4.5 h-4.5" />
                                                        </Button>
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
