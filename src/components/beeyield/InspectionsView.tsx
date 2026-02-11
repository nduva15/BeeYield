import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Plus,
    ArrowLeft,
    Grid3X3,
    Box,
    Search,
    Sun,
    Cloud,
    CloudRain,
    Snowflake,
    Wind,
    Loader2,
    Activity,
    Thermometer,
    Droplets,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    Calendar,
    User,
    ClipboardList,
    MoreVertical,
    Trash2,
    Edit3,
    Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { beeyieldService, Apiary, Hive, Inspection } from '@/services/beeyieldService';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

interface InspectionsViewProps {
    onTabChange: (tab: string) => void;
}

const InspectionsView: React.FC<InspectionsViewProps> = ({ onTabChange }) => {
    const [isAddingInspection, setIsAddingInspection] = useState(false);
    const [inspections, setInspections] = useState<Inspection[]>([]);
    const [apiaries, setApiaries] = useState<Apiary[]>([]);
    const [hives, setHives] = useState<Hive[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPlaceId, setSelectedPlaceId] = useState<string>('all_places');
    const [selectedHiveId, setSelectedHiveId] = useState<string>('all_hives');
    const [editingId, setEditingId] = useState<string | null>(null);

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



    const [isSaving, setIsSaving] = useState(false);

    const { user, beeyieldUser } = useAuth();
    const userId = beeyieldUser?.id || user?.id;

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

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this inspection?")) return;

        try {
            const { error } = await beeyieldService.deleteInspection(id);
            if (error) throw error;
            setInspections(inspections.filter(i => i.id !== id));
        } catch (error) {
            console.error("Error deleting inspection:", error);
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
        return true;
    });

    if (isAddingInspection) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500 pb-12">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => {
                            setIsAddingInspection(false);
                            resetForm();
                        }}
                        className="flex items-center gap-2 text-[#1B9157] dark:text-[#F4D03F] font-bold hover:underline transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        BACK TO HISTORY
                    </button>
                    <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{editingId ? 'Edit Inspection' : 'New Hive Inspection'}</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form Left - Selection & Basic Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="rounded-[2rem] border-none bg-white dark:bg-[#111111] shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
                            <CardHeader className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5 p-6">
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-[#1B9157] flex items-center gap-2">
                                    <Box className="w-4 h-4" /> Destination
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-gray-400 uppercase">Apiary</Label>
                                    <Select
                                        value={hives.find(h => h.id === formData.hive_id)?.apiary_id || 'unselected'}
                                        onValueChange={(val) => {
                                            const firstHive = hives.find(h => h.apiary_id === val);
                                            if (firstHive) setFormData({ ...formData, hive_id: firstHive.id });
                                        }}
                                    >
                                        <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-white/5 border-none font-bold">
                                            <SelectValue placeholder="Select Apiary" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {apiaries.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-gray-400 uppercase">Target Hive</Label>
                                    <Select
                                        value={formData.hive_id}
                                        onValueChange={(val) => setFormData({ ...formData, hive_id: val })}
                                    >
                                        <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-white/5 border-none font-bold">
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
                                    <Label className="text-[10px] font-bold text-gray-400 uppercase">Inspection Date</Label>
                                    <Input
                                        type="date"
                                        value={formData.inspection_date}
                                        onChange={(e) => setFormData({ ...formData, inspection_date: e.target.value })}
                                        className="h-12 rounded-xl bg-slate-50 dark:bg-white/5 border-none font-bold"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-gray-400 uppercase">Inspector Name</Label>
                                    <Input
                                        placeholder="Full Name"
                                        value={formData.inspector_name}
                                        onChange={(e) => setFormData({ ...formData, inspector_name: e.target.value })}
                                        className="h-12 rounded-xl bg-slate-50 dark:bg-white/5 border-none font-bold"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-[2rem] border-none bg-[#1B9157] text-white p-6 shadow-lg shadow-green-500/20">
                            <Bot className="w-8 h-8 mb-4 opacity-50" />
                            <h3 className="font-black text-lg uppercase tracking-tight leading-tight mb-2">Hive AI Assistant</h3>
                            <p className="text-sm font-medium opacity-80 leading-relaxed">
                                Complete the inspection data to receive automated health scoring and varroa risk assessment.
                            </p>
                        </Card>
                    </div>

                    {/* Form Center - Vitals */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="rounded-[2rem] border-none bg-white dark:bg-[#111111] shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
                            <CardHeader className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5 p-6 flex flex-row items-center justify-between">
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-[#F4D03F] flex items-center gap-2">
                                    <Activity className="w-4 h-4" /> Colony Vitals
                                </CardTitle>
                                <div className="flex gap-2">
                                    {['healthy', 'weak', 'diseased', 'critical'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setFormData({ ...formData, health_status: s })}
                                            className={cn(
                                                "px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all",
                                                formData.health_status === s
                                                    ? "bg-[#1B9157] text-white scale-110 shadow-lg shadow-green-500/30"
                                                    : "bg-slate-100 dark:bg-white/5 text-gray-400"
                                            )}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Swaps/Switches */}
                                    <div className="space-y-6">
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Queen Seen</span>
                                                    <span className="text-[10px] font-medium text-gray-400 tracking-tight">Visual confirmation of the queen</span>
                                                </div>
                                                <Switch
                                                    checked={formData.queen_seen}
                                                    onCheckedChange={(val) => setFormData({ ...formData, queen_seen: val })}
                                                    className="data-[state=checked]:bg-[#1B9157]"
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Eggs Seen</span>
                                                    <span className="text-[10px] font-medium text-gray-400 tracking-tight">Evidence of a laying queen</span>
                                                </div>
                                                <Switch
                                                    checked={formData.eggs_seen}
                                                    onCheckedChange={(val) => setFormData({ ...formData, eggs_seen: val })}
                                                    className="data-[state=checked]:bg-[#1B9157]"
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Queen Cells</span>
                                                    <span className="text-[10px] font-medium text-gray-400 tracking-tight">Active or emerging queen cells</span>
                                                </div>
                                                <Switch
                                                    checked={formData.queen_cells_seen}
                                                    onCheckedChange={(val) => setFormData({ ...formData, queen_cells_seen: val })}
                                                    className="data-[state=checked]:bg-[#1B9157]"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4">
                                            <Label className="text-[10px] font-bold text-gray-400 uppercase">Colony Temperament</Label>
                                            <div className="flex gap-2">
                                                {['calm', 'nervous', 'aggressive'].map(t => (
                                                    <Button
                                                        key={t}
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setFormData({ ...formData, temperament: t })}
                                                        className={cn(
                                                            "flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-wider",
                                                            formData.temperament === t ? "bg-slate-900 text-white" : "bg-slate-50 dark:bg-white/5 text-slate-500"
                                                        )}
                                                    >
                                                        {t}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Metrics & Environmental */}
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1.5">
                                                    <Thermometer className="w-3 h-3" /> External Temp (°C)
                                                </Label>
                                                <Input
                                                    type="number"
                                                    value={formData.temperature_celsius}
                                                    onChange={(e) => setFormData({ ...formData, temperature_celsius: parseFloat(e.target.value) })}
                                                    className="h-11 rounded-xl bg-slate-50 dark:bg-white/5 border-none font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold text-gray-400 uppercase">Weather</Label>
                                                <Select value={formData.weather_condition} onValueChange={(v) => setFormData({ ...formData, weather_condition: v })}>
                                                    <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-white/5 border-none font-bold px-3">
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
                                                <Label className="text-[10px] font-bold text-gray-400 uppercase">Honey Stores (kg)</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.honey_stores}
                                                    onChange={(e) => setFormData({ ...formData, honey_stores: parseFloat(e.target.value) })}
                                                    className="h-11 rounded-xl bg-slate-50 dark:bg-white/5 border-none font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold text-gray-400 uppercase">Pollen (Frames)</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.pollen_stores}
                                                    onChange={(e) => setFormData({ ...formData, pollen_stores: parseFloat(e.target.value) })}
                                                    className="h-11 rounded-xl bg-slate-50 dark:bg-white/5 border-none font-bold"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold text-gray-400 uppercase text-red-500">Varroa Count (/300)</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.varroa_mite_count}
                                                    onChange={(e) => setFormData({ ...formData, varroa_mite_count: parseInt(e.target.value) })}
                                                    className="h-11 rounded-xl bg-red-50 dark:bg-red-500/10 border-none font-bold text-red-600 dark:text-red-400"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold text-gray-400 uppercase">SH Beetles</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.small_hive_beetles_seen}
                                                    onChange={(e) => setFormData({ ...formData, small_hive_beetles_seen: parseInt(e.target.value) })}
                                                    className="h-11 rounded-xl bg-slate-50 dark:bg-white/5 border-none font-bold"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Separator className="my-8 opacity-50" />

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-gray-400 uppercase">Key Findings</Label>
                                        <Textarea
                                            placeholder="What did you observe?"
                                            value={formData.findings}
                                            onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                                            className="min-h-[80px] rounded-[1.5rem] bg-slate-50 dark:bg-white/5 border-none font-medium p-4 resize-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-gray-400 uppercase">Actions Taken</Label>
                                        <Textarea
                                            placeholder="Added super, treated for varroa, etc."
                                            value={formData.actions_taken}
                                            onChange={(e) => setFormData({ ...formData, actions_taken: e.target.value })}
                                            className="min-h-[80px] rounded-[1.5rem] bg-slate-50 dark:bg-white/5 border-none font-medium p-4 resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end mt-10">
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="h-14 px-12 rounded-2xl bg-[#1B9157] hover:bg-[#167d4a] text-white font-black uppercase tracking-widest shadow-xl shadow-green-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingId ? 'Update Record' : 'Seal Inspection')}
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
        <div className="space-y-8 animate-in fade-in duration-500 pb-20 -mt-2">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-2 mb-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">History & Logs</h1>
                    <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 mt-1">
                        Detailed monitoring and health records for all active hives.
                    </p>
                </div>
                <div className="flex items-center gap-3 mt-4 md:mt-0">
                    <Button
                        onClick={() => {
                            resetForm();
                            setIsAddingInspection(true);
                        }}
                        className="h-11 px-6 rounded-xl bg-[#F4D03F] hover:bg-[#e0be36] text-black font-black uppercase tracking-wider text-xs shadow-lg shadow-[#F4D03F]/20"
                    >
                        <Plus className="w-4 h-4 mr-2" /> New Inspection
                    </Button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap gap-3 px-2">
                <Select value={selectedPlaceId} onValueChange={setSelectedPlaceId}>
                    <SelectTrigger className="w-48 h-10 rounded-xl bg-white dark:bg-[#111111] border-gray-100 dark:border-white/5 font-bold text-xs uppercase tracking-wider shadow-sm">
                        <div className="flex items-center gap-2">
                            <Grid3X3 className="w-3 h-3 text-[#F4D03F]" />
                            <SelectValue />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all_places">All Places</SelectItem>
                        {apiaries.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                    </SelectContent>
                </Select>

                <Select value={selectedHiveId} onValueChange={setSelectedHiveId}>
                    <SelectTrigger className="w-48 h-10 rounded-xl bg-white dark:bg-[#111111] border-gray-100 dark:border-white/5 font-bold text-xs uppercase tracking-wider shadow-sm">
                        <div className="flex items-center gap-2">
                            <Box className="w-3 h-3 text-[#1B9157]" />
                            <SelectValue />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all_hives">All Hives</SelectItem>
                        {filteredHives.map(h => <SelectItem key={h.id} value={h.id}>{h.hive_code}</SelectItem>)}
                    </SelectContent>
                </Select>

                <div className="flex-1" />

                <div className="flex items-center gap-4 text-[10px] font-black uppercase text-gray-400 tracking-widest bg-slate-50 dark:bg-white/5 px-4 rounded-xl py-2">
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#1B9157]" /> Healthy</span>
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#F4D03F]" /> Warning</span>
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Critical</span>
                </div>
            </div>

            {/* Inspection History List */}
            <div className="space-y-4 px-2">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-[#111111]/50 rounded-[2rem] border border-dashed border-gray-200 dark:border-white/10">
                        <Loader2 className="w-10 h-10 text-[#F4D03F] animate-spin mb-4" />
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Synchronizing with HiveChain™...</p>
                    </div>
                ) : filteredInspections.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#111111] rounded-[2rem] border border-gray-100 dark:border-white/5 text-center">
                        <ClipboardList className="w-16 h-16 text-slate-200 dark:text-white/5 mb-6" />
                        <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">No records found</h3>
                        <p className="text-sm font-medium text-gray-400 mt-2 max-w-xs px-6">
                            Start documenting your hive maintenance and health status by creating your first inspection.
                        </p>
                        <Button
                            onClick={() => { resetForm(); setIsAddingInspection(true); }}
                            variant="ghost"
                            className="mt-6 text-[#1B9157] dark:text-[#F4D03F] font-bold text-xs uppercase tracking-widest"
                        >
                            <Plus className="w-4 h-4 mr-2" /> CREATE NEW RECORD
                        </Button>
                    </div>
                ) : (
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
                                        <Card className="rounded-3xl border-none bg-white dark:bg-[#111111] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all group overflow-hidden">
                                            <div className="flex flex-col md:flex-row">
                                                {/* Left Status Bar */}
                                                <div className={cn(
                                                    "w-full md:w-2 h-2 md:h-auto",
                                                    inspection.health_status === 'healthy' ? "bg-[#1B9157]" :
                                                        inspection.health_status === 'weak' ? "bg-[#F4D03F]" : "bg-red-500"
                                                )} />

                                                <div className="flex-1 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                                    {/* Left - Info */}
                                                    <div className="flex gap-6 items-center">
                                                        <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/5 flex flex-col items-center justify-center border border-gray-100 dark:border-white/5">
                                                            <span className="text-[10px] font-black uppercase text-gray-400">Hive</span>
                                                            <span className="text-lg font-black text-slate-900 dark:text-white">{hive?.hive_code?.split('-').pop() || '??'}</span>
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                                                    {apiary?.name || 'Local Apiary'}
                                                                </h3>
                                                                <Badge className={cn(
                                                                    "text-[9px] font-black uppercase px-2 h-5 flex items-center gap-1 border-none",
                                                                    inspection.health_status === 'healthy' ? "bg-[#1B9157]/10 text-[#1B9157]" :
                                                                        inspection.health_status === 'weak' ? "bg-[#F4D03F]/10 text-[#9a7f1e]" : "bg-red-500/10 text-red-500"
                                                                )}>
                                                                    {inspection.health_status === 'healthy' && <CheckCircle2 className="w-2.5 h-2.5" />}
                                                                    {inspection.health_status === 'critical' && <AlertCircle className="w-2.5 h-2.5" />}
                                                                    {inspection.health_status}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                                                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase">
                                                                    <Calendar className="w-3 h-3 text-[#F4D03F]" /> {inspection.inspection_date}
                                                                </span>
                                                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase">
                                                                    <User className="w-3 h-3 text-[#1B9157]" /> {inspection.inspector_name || 'System Auto'}
                                                                </span>
                                                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase">
                                                                    <Activity className="w-3 h-3 text-red-500" /> {inspection.varroa_mite_count || 0} Varroa
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Center - Stats */}
                                                    <div className="flex gap-4 md:gap-8 flex-wrap">
                                                        <div className="space-y-1">
                                                            <div className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Honey Stores</div>
                                                            <div className="flex items-end gap-1">
                                                                <span className="text-xl font-black text-slate-800 dark:text-white leading-none">{inspection.honey_stores || '0'}</span>
                                                                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-0.5 uppercase tracking-tighter">kg</span>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Temperament</div>
                                                            <div className="flex items-end gap-1">
                                                                <span className="text-xl font-black text-slate-800 dark:text-white leading-none uppercase">{inspection.temperament || '---'}</span>
                                                            </div>
                                                        </div>
                                                        <div className="hidden lg:block space-y-1">
                                                            <div className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Indicators</div>
                                                            <div className="flex gap-2">
                                                                <div className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase", inspection.queen_seen ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" : "bg-slate-100 text-slate-400 dark:bg-white/5")}>Q</div>
                                                                <div className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase", inspection.eggs_seen ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" : "bg-slate-100 text-slate-400 dark:bg-white/5")}>E</div>
                                                                <div className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase", inspection.queen_cells_seen ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" : "bg-slate-100 text-slate-400 dark:bg-white/5")}>QC</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Right - Actions */}
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDelete(inspection.id)}
                                                            className="rounded-xl hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="rounded-xl"
                                                            onClick={() => handleEdit(inspection)}
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="rounded-xl"
                                                        >
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Findings Expand - optional - simplified for now */}
                                            {inspection.findings && (
                                                <div className="px-8 pb-6 pt-0 border-t border-slate-50 dark:border-white/5 mt-[-1rem]">
                                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-2">
                                                        "{inspection.findings}"
                                                    </p>
                                                </div>
                                            )}
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InspectionsView;
