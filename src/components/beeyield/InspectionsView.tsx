import React from 'react';
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
    const [isAddingInspection, setIsAddingInspection] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);
    const [editingId, setEditingId] = React.useState<string | null>(null);

    // Data State
    const [inspections, setInspections] = React.useState<Inspection[]>([]);
    const [apiaries, setApiaries] = React.useState<Apiary[]>([]);
    const [hives, setHives] = React.useState<Hive[]>([]);

    // Filters
    const [selectedPlaceId, setSelectedPlaceId] = React.useState<string>('all_places');
    const [selectedHiveId, setSelectedHiveId] = React.useState<string>('all_hives');
    const [searchQuery, setSearchQuery] = React.useState('');

    React.useEffect(() => {
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
    const [formData, setFormData] = React.useState({
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

    React.useEffect(() => {
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
                        className="h-14 w-14 rounded-none border-4 border-[#064e3b] bg-white text-[#064e3b] hover:bg-[#facc15]/10 transition-none"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </Button>
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[#10b981] bg-[#064e3b] mb-2">
                            <ClipboardList className="w-3.5 h-3.5 text-[#facc15]" />
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{editingId ? 'Modify Entry' : 'Log Registry'}</span>
                        </div>
                        <h1 className="text-5xl font-black text-[#064e3b] tracking-tighter uppercase leading-none">Colony <span className="text-[#10b981]">Audit</span></h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Panel: Scope & Metadata */}
                    <div className="lg:col-span-1 space-y-8">
                        <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[8px_8px_0px_0px_rgba(6,78,59,1)] overflow-hidden">
                            <CardHeader className="p-8 border-b-4 border-[#064e3b]/10">
                                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-[#064e3b]/30">Registry Scope</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8 mt-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-[0.2em]">Target Sector</Label>
                                    <Select
                                        value={hives.find(h => h.id === formData.hive_id)?.apiary_id || 'unselected'}
                                        onValueChange={(val) => {
                                            const firstHive = hives.find(h => h.apiary_id === val);
                                            if (firstHive) setFormData({ ...formData, hive_id: firstHive.id });
                                        }}
                                    >
                                        <SelectTrigger className="h-12 rounded-none border-4 border-[#064e3b] font-black text-xs uppercase transition-none">
                                            <SelectValue placeholder="Select Location" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-none border-2 border-[#064e3b] shadow-xl">
                                            {apiaries.map(a => <SelectItem key={a.id} value={a.id} className="uppercase font-black text-[10px]">{a.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-[0.2em]">Specific Asset</Label>
                                    <Select
                                        value={formData.hive_id}
                                        onValueChange={(val) => setFormData({ ...formData, hive_id: val })}
                                    >
                                        <SelectTrigger className="h-12 rounded-none border-4 border-[#064e3b] font-black text-xs uppercase transition-none">
                                            <SelectValue placeholder="Identify Hive" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-none border-2 border-[#064e3b] shadow-xl">
                                            {hives
                                                .filter(h => !hives.find(xh => xh.id === formData.hive_id)?.apiary_id || h.apiary_id === hives.find(xh => xh.id === formData.hive_id)?.apiary_id)
                                                .map(h => <SelectItem key={h.id} value={h.id} className="uppercase font-black text-[10px]">HIVE #{h.hive_code}</SelectItem>)
                                            }
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-[0.2em]">Archive Date</Label>
                                    <Input
                                        type="date"
                                        value={formData.inspection_date}
                                        onChange={(e) => setFormData({ ...formData, inspection_date: e.target.value })}
                                        className="h-12 rounded-none border-4 border-[#064e3b] font-black text-xs transition-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-[0.2em]">Audit Personnel</Label>
                                    <Input
                                        placeholder="Certified Inspector Name"
                                        value={formData.inspector_name}
                                        onChange={(e) => setFormData({ ...formData, inspector_name: e.target.value })}
                                        className="h-12 rounded-none border-4 border-[#064e3b] font-black text-xs transition-none focus-visible:bg-[#facc15]/5"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-none border-4 border-[#064e3b] bg-[#064e3b] shadow-[8px_8px_0px_0px_rgba(16,185,129,1)] overflow-hidden relative group">
                            <CardContent className="p-8 relative z-10 flex items-start gap-5">
                                <Bot className="w-10 h-10 text-[#facc15] mt-1" />
                                <div className="space-y-2">
                                    <h3 className="font-black text-white text-xl uppercase tracking-tighter">Neural Co-Pilot</h3>
                                    <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.1em] leading-relaxed">
                                        SUBMISSION TRIGGER: ARCHIVING THIS LOG WILL RE-CALIBRATE ASSET VITALITY SCORES AND VARROA VECTOR ANALYSIS.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Panel: Biometric Data */}
                    <div className="lg:col-span-2 space-y-10">
                        <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[12px_12px_0px_0px_rgba(6,78,59,1)] overflow-hidden">
                            <CardHeader className="p-10 pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                <div>
                                    <CardTitle className="text-4xl font-black text-[#064e3b] uppercase tracking-tighter flex items-center gap-4">
                                        <HeartPulse className="w-8 h-8 text-[#10b981]" />
                                        Health Vector
                                    </CardTitle>
                                    <p className="text-[#064e3b]/30 font-black text-[10px] mt-2 uppercase tracking-[0.2em] px-1">COLONY BIOMETRICS PROTOCOL</p>
                                </div>
                                <div className="flex bg-[#064e3b]/5 border-4 border-[#064e3b] p-1.5 gap-1.5">
                                    {['healthy', 'weak', 'diseased', 'critical'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setFormData({ ...formData, health_status: s })}
                                            className={cn(
                                                "h-12 px-6 rounded-none text-[10px] font-black uppercase tracking-widest transition-none",
                                                formData.health_status === s
                                                    ? "bg-[#064e3b] text-white shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]"
                                                    : "text-[#064e3b]/40 hover:text-[#064e3b] hover:bg-white"
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
                                    <div className="space-y-6">
                                        {[
                                            { id: 'queen_seen', label: 'Queen Verified', sub: 'Visual presence confirmed', icon: ShieldCheck },
                                            { id: 'eggs_seen', label: 'Egg Presence', sub: 'Oviposition cycle active', icon: CheckCircle2 },
                                            { id: 'queen_cells_seen', label: 'Queen Cells', sub: 'Active swarming markers', icon: AlertCircle }
                                        ].map(item => (
                                            <div key={item.id} className="flex items-center justify-between p-6 rounded-none bg-neutral-50/50 border-4 border-[#064e3b]/10 hover:border-[#064e3b] transition-none group shadow-[4px_4px_0px_0px_rgba(0,0,0,0)] hover:shadow-[4px_4px_0px_0px_rgba(6,78,59,1)]">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 rounded-none border-2 border-[#064e3b]/20 bg-white flex items-center justify-center text-[#064e3b]/40 group-hover:text-[#10b981] group-hover:border-[#10b981] transition-none">
                                                        <item.icon className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-base font-black text-[#064e3b] uppercase tracking-tighter">{item.label}</span>
                                                        <span className="text-[9px] font-black text-[#064e3b]/40 uppercase tracking-[0.1em]">{item.sub}</span>
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={(formData as any)[item.id]}
                                                    onCheckedChange={(val) => setFormData({ ...formData, [item.id]: val })}
                                                    className="data-[state=checked]:bg-[#10b981] border-2 border-[#064e3b]"
                                                />
                                            </div>
                                        ))}

                                        <div className="pt-4 space-y-3">
                                            <Label className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-[0.2em] ml-1">Temperament Profile</Label>
                                            <div className="flex bg-[#064e3b]/5 border-4 border-[#064e3b] p-1.5 gap-1.5">
                                                {['calm', 'nervous', 'aggressive'].map(t => (
                                                    <button
                                                        key={t}
                                                        onClick={() => setFormData({ ...formData, temperament: t })}
                                                        className={cn(
                                                            "flex-1 h-12 rounded-none text-[10px] font-black uppercase tracking-widest transition-none",
                                                            formData.temperament === t
                                                                ? "bg-[#064e3b] text-white shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]"
                                                                : "text-[#064e3b]/40 hover:text-[#064e3b] hover:bg-white"
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
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-[0.2em] ml-1">Core Temp (°C)</Label>
                                                <div className="relative">
                                                    <Thermometer className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#10b981]" />
                                                    <Input
                                                        type="number"
                                                        value={formData.temperature_celsius}
                                                        onChange={(e) => setFormData({ ...formData, temperature_celsius: parseFloat(e.target.value) })}
                                                        className="h-12 pl-10 rounded-none border-4 border-[#064e3b] font-black text-[#064e3b] transition-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-[0.2em] ml-1">Sky Condition</Label>
                                                <Select value={formData.weather_condition} onValueChange={(v) => setFormData({ ...formData, weather_condition: v })}>
                                                    <SelectTrigger className="h-12 rounded-none border-4 border-[#064e3b] font-black text-xs uppercase transition-none">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-none border-2 border-[#064e3b]">
                                                        <SelectItem value="sunny">Sunny</SelectItem>
                                                        <SelectItem value="cloudy">Cloudy</SelectItem>
                                                        <SelectItem value="rainy">Rainy</SelectItem>
                                                        <SelectItem value="windy">Windy</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-[0.2em] ml-1">Honey Mass (kg)</Label>
                                                <div className="relative">
                                                    <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#facc15]" />
                                                    <Input
                                                        type="number"
                                                        value={formData.honey_stores}
                                                        onChange={(e) => setFormData({ ...formData, honey_stores: parseFloat(e.target.value) })}
                                                        className="h-12 pl-10 rounded-none border-4 border-[#064e3b] font-black text-[#064e3b] transition-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-[0.2em] ml-1">Pollen Ratio</Label>
                                                <div className="relative">
                                                    <Sun className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
                                                    <Input
                                                        type="number"
                                                        value={formData.pollen_stores}
                                                        onChange={(e) => setFormData({ ...formData, pollen_stores: parseFloat(e.target.value) })}
                                                        className="h-12 pl-10 rounded-none border-4 border-[#064e3b] font-black text-[#064e3b] transition-none placeholder:text-neutral-300"
                                                        placeholder="Frames"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] ml-1">Varroa Count</Label>
                                                <div className="relative">
                                                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                                                    <Input
                                                        type="number"
                                                        value={formData.varroa_mite_count}
                                                        onChange={(e) => setFormData({ ...formData, varroa_mite_count: parseInt(e.target.value) })}
                                                        className="h-12 pl-10 rounded-none border-4 border-red-500 bg-red-500/5 font-black text-red-600 transition-none focus-visible:ring-0"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-[0.2em] ml-1">SH Beetles</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.small_hive_beetles_seen}
                                                    onChange={(e) => setFormData({ ...formData, small_hive_beetles_seen: parseInt(e.target.value) })}
                                                    className="h-12 rounded-none border-4 border-[#064e3b] font-black text-[#064e3b] transition-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-[1px] w-full bg-[#F5F5F5]" />

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-[0.2em] ml-1">Diagnostic Findings</Label>
                                        <Textarea
                                            placeholder="Environmental anomalies, brood capping quality, odor, etc."
                                            value={formData.findings}
                                            onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                                            className="min-h-[120px] rounded-none border-4 border-[#064e3b] p-6 font-black text-xs uppercase transition-none focus-visible:ring-0 focus-visible:bg-[#facc15]/5"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-[0.2em] ml-1">Biometric Interventions (Actions)</Label>
                                        <Textarea
                                            placeholder="Splits performed, supers modified, thermal treatment initiated..."
                                            value={formData.actions_taken}
                                            onChange={(e) => setFormData({ ...formData, actions_taken: e.target.value })}
                                            className="min-h-[120px] rounded-none border-4 border-[#064e3b] p-6 font-black text-xs uppercase transition-none focus-visible:ring-0 focus-visible:bg-[#facc15]/5"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-8 border-t-4 border-[#064e3b]/10">
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="h-16 px-12 rounded-none bg-[#064e3b] text-white hover:bg-[#10b981] gap-4 font-black text-base uppercase tracking-widest shadow-[8px_8px_0px_0px_rgba(16,185,129,1)] transition-none active:shadow-none active:translate-x-1 active:translate-y-1 border-2 border-[#064e3b]"
                                    >
                                        {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <ShieldCheck className="w-6 h-6 text-[#facc15]" />}
                                        {editingId ? 'COMMIT RECORD UPDATES' : 'FINALIZE & ARCHIVE LOG'}
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
                    <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[#10b981] bg-[#064e3b] mb-6">
                        <ClipboardList className="w-3.5 h-3.5 text-[#facc15]" />
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Diagnostic Archive</span>
                    </div>
                    <h1 className="text-6xl font-black text-[#064e3b] tracking-tighter uppercase leading-none">Health <span className="text-[#10b981]">Logs</span></h1>
                    <p className="text-[#064e3b]/40 font-black mt-3 text-xl uppercase tracking-tight">
                        Systematic colony biometrics and history.
                    </p>
                </div>
                <Button
                    onClick={() => {
                        resetForm();
                        setIsAddingInspection(true);
                    }}
                    className="h-14 px-10 rounded-none bg-[#064e3b] hover:bg-[#10b981] text-white border-4 border-[#064e3b] gap-3 font-black text-xs uppercase tracking-widest transition-none shadow-[8px_8px_0px_0px_rgba(16,185,129,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                >
                    <Plus className="w-5 h-5" />
                    NEW INSPECTION
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                    { label: 'Total Records', value: stats.total, icon: ClipboardList, color: 'text-[#064e3b]', bg: 'bg-white' },
                    { label: 'Healthy State', value: stats.healthy, icon: CheckCircle2, color: 'text-[#10b981]', bg: 'bg-white' },
                    { label: 'Stress Signals', value: stats.issues, icon: AlertCircle, color: 'text-red-500', bg: 'bg-white' },
                    { label: 'Current Cycle', value: stats.thisMonth, icon: Calendar, color: 'text-[#064e3b]', bg: 'bg-white' }
                ].map((stat, i) => (
                    <motion.div key={i} whileHover={{ y: -4 }}>
                        <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[6px_6px_0px_0px_rgba(6,78,59,1)] overflow-hidden group">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={cn("w-12 h-12 rounded-none border-4 border-[#064e3b] flex items-center justify-center transition-none group-hover:bg-[#064e3b] group-hover:text-white", stat.bg)}>
                                        <stat.icon className={cn("w-6 h-6 stroke-[3] transition-colors transition-none group-hover:text-white", stat.color)} />
                                    </div>
                                    <p className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-[0.2em]">{stat.label}</p>
                                </div>
                                <h3 className="text-5xl font-black text-[#064e3b] tracking-tighter">{stat.value}</h3>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[8px_8px_0px_0px_rgba(6,78,59,1)] overflow-hidden">
                <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#064e3b]" />
                            <Input
                                placeholder="Search by inspector, findings, or hive code..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 h-14 rounded-none border-4 border-[#064e3b] bg-white font-black text-xs uppercase transition-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:bg-[#facc15]/5"
                            />
                        </div>
                        <Select value={selectedPlaceId} onValueChange={setSelectedPlaceId}>
                            <SelectTrigger className="h-14 md:w-[260px] rounded-none border-4 border-[#064e3b] font-black text-xs uppercase transition-none">
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-4 h-4 text-[#10b981]" />
                                    <SelectValue placeholder="Network Focus" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-none border-2 border-[#064e3b] shadow-xl">
                                <SelectItem value="all_places">GLOBAL NETWORK</SelectItem>
                                {apiaries.map(a => <SelectItem key={a.id} value={a.id} className="uppercase font-black text-[10px]">{a.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={selectedHiveId} onValueChange={setSelectedHiveId}>
                            <SelectTrigger className="h-14 md:w-[260px] rounded-none border-4 border-[#064e3b] font-black text-xs uppercase transition-none">
                                <div className="flex items-center gap-3">
                                    <Hexagon className="w-4 h-4 text-[#10b981]" />
                                    <SelectValue placeholder="Colony Filter" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-none border-2 border-[#064e3b] shadow-xl">
                                <SelectItem value="all_hives">ALL COLONIES</SelectItem>
                                {filteredHivesForSelect.map(h => <SelectItem key={h.id} value={h.id} className="uppercase font-black text-[10px]">HIVE #{h.hive_code}</SelectItem>)}
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
                    <div className="flex items-center gap-4">
                        <h3 className="text-2xl font-black text-[#064e3b] uppercase tracking-tighter">Event Stream</h3>
                        <div className="h-1 flex-1 bg-[#064e3b]/10" />
                        <span className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-[0.2em]">{filteredInspections.length} AUDIT RESULTS</span>
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
                                            className="rounded-none border-4 border-[#064e3b] bg-white hover:bg-neutral-50/50 transition-none cursor-pointer group shadow-[4px_4px_0px_0px_rgba(6,78,59,1)] hover:shadow-[8px_8px_0px_0px_rgba(6,78,59,1)] active:shadow-none"
                                            onClick={() => handleEdit(inspection)}
                                        >
                                            <CardContent className="p-8">
                                                <div className="flex flex-col lg:flex-row gap-10">
                                                    {/* Hive & Basic Context */}
                                                    <div className="w-full lg:w-80 flex-shrink-0">
                                                        <div className="flex items-start gap-5">
                                                            <div className="w-16 h-16 rounded-none border-4 border-[#064e3b] bg-white flex items-center justify-center text-[#064e3b] group-hover:bg-[#064e3b] group-hover:text-white transition-none overflow-hidden relative">
                                                                <Hexagon className="w-7 h-7 stroke-[3]" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-black text-[#064e3b] text-2xl uppercase tracking-tighter leading-none pt-1">
                                                                    {apiary?.name || 'Local Sector'}
                                                                </h3>
                                                                <p className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-[0.2em] mt-3">ASSET ID: {hive?.hive_code || '---'}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-wrap gap-2 mt-8">
                                                            <div className={cn(
                                                                "px-3 py-1 border-2 font-black text-[9px] uppercase tracking-widest",
                                                                inspection.health_status === 'healthy' ? "bg-[#10b981]/10 border-[#10b981] text-[#064e3b]" :
                                                                    inspection.health_status === 'weak' ? "bg-[#facc15]/10 border-[#facc15] text-[#064e3b]" :
                                                                        "bg-red-500/10 border-red-500 text-red-600"
                                                            )}>
                                                                {inspection.health_status} STATUS
                                                            </div>
                                                            <div className="flex items-center gap-2 px-3 py-1 bg-neutral-100 border-2 border-[#064e3b]/10 text-[9px] font-black text-[#064e3b] uppercase tracking-widest">
                                                                <Calendar className="w-3 h-3 text-[#10b981]" />
                                                                {new Date(inspection.inspection_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Metrics Snapshot */}
                                                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-8 py-2">
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] text-[#064e3b]/40 uppercase font-black tracking-[0.2em]">HONEY MASS</p>
                                                            <div className="flex items-center gap-2">
                                                                <Zap className="w-4 h-4 text-[#facc15]" />
                                                                <span className="font-black text-[#064e3b] text-xl tracking-tighter">{inspection.honey_stores || 0} KG</span>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] text-[#064e3b]/40 uppercase font-black tracking-[0.2em]">VARROA COUNT</p>
                                                            <div className="flex items-center gap-2">
                                                                <ShieldCheck className={cn("w-4 h-4", (inspection.varroa_mite_count || 0) > 3 ? "text-red-500" : "text-[#10b981]")} />
                                                                <span className={cn("font-black text-xl tracking-tighter", (inspection.varroa_mite_count || 0) > 3 ? "text-red-500" : "text-[#064e3b]")}>
                                                                    {inspection.varroa_mite_count || 0}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] text-[#064e3b]/40 uppercase font-black tracking-[0.2em]">CORE TEMP</p>
                                                            <div className="flex items-center gap-2">
                                                                <Thermometer className="w-4 h-4 text-orange-500" />
                                                                <span className="font-black text-[#064e3b] text-xl tracking-tighter">{inspection.temperature_celsius || '--'}°C</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col justify-center">
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {inspection.queen_seen && <div className="w-7 h-7 border-2 border-[#10b981] bg-[#10b981]/10 flex items-center justify-center text-[10px] font-black text-[#064e3b]" title="Queen Seen">Q</div>}
                                                                {inspection.eggs_seen && <div className="w-7 h-7 border-2 border-blue-500 bg-blue-500/10 flex items-center justify-center text-[10px] font-black text-blue-600" title="Eggs Seen">E</div>}
                                                                {inspection.queen_cells_seen && <div className="w-7 h-7 border-2 border-red-500 bg-red-500/10 flex items-center justify-center text-[10px] font-black text-red-600" title="Cells Observed">QC</div>}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Actions & Navigation */}
                                                    <div className="flex flex-row lg:flex-col justify-between items-end gap-4 border-t-2 lg:border-t-0 lg:border-l-4 border-[#064e3b]/5 pt-6 lg:pt-0 lg:pl-10">
                                                        <div className="w-12 h-12 rounded-none border-2 border-[#064e3b] flex items-center justify-center text-[#064e3b] group-hover:bg-[#064e3b] group-hover:text-white transition-none">
                                                            <ArrowRight className="w-5 h-5" />
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-10 w-10 text-[#064e3b]/20 hover:text-red-500 hover:bg-red-50 rounded-none transition-none"
                                                            onClick={(e) => handleDelete(inspection.id, e)}
                                                        >
                                                            <Trash2 className="w-5 h-5" />
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
