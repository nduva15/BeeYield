import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Grid3X3, StickyNote, CheckSquare, Box, MapPin, Loader2, FileSpreadsheet, ChevronDown, Activity, Zap, X, Edit, Trash2, ClipboardCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { beeyieldService, Apiary, Hive, HiveCreateInput, IoTDevice } from '@/services/beeyieldService';
import { motion, AnimatePresence } from 'framer-motion';

interface BeeYieldHivesViewProps {
    onTabChange: (tab: string) => void;
}

const BeeYieldHivesView: React.FC<BeeYieldHivesViewProps> = ({ onTabChange }) => {
    const [selectedPlace, setSelectedPlace] = useState('all');
    const [showFab, setShowFab] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Modal states
    const [isAddingHive, setIsAddingHive] = useState(false);
    const [editingHive, setEditingHive] = useState<Hive | null>(null);

    const [hives, setHives] = useState<Hive[]>([]);
    const [apiaries, setApiaries] = useState<Apiary[]>([]);
    const [devices, setDevices] = useState<IoTDevice[]>([]);

    // Hive form state
    const [hiveForm, setHiveForm] = useState<HiveCreateInput>({
        hive_code: '',
        apiary_id: '',
        hive_type: 'Langstroth',
        bee_type: 'African Honey Bee',
        frame_count: 10,
        material: 'Wood',
        status: 'ACTIVE',
        installation_date: new Date().toISOString().split('T')[0],
        has_sensors: false,
    });

    // Request Inspection Task
    const [isRequestingInspection, setIsRequestingInspection] = useState(false);
    const [inspectionTaskForm, setInspectionTaskForm] = useState({
        title: 'Routine Inspection',
        description: 'Standard hive health check',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Next week
        priority: 'medium' as 'low' | 'medium' | 'high',
        hive_id: '',
        apiary_id: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [hivesData, apiariesData, devicesData] = await Promise.all([
                    beeyieldService.getHives(),
                    beeyieldService.getApiaries(),
                    beeyieldService.getDevices()
                ]);
                setHives(hivesData);
                setApiaries(apiariesData);
                setDevices(devicesData);
            } catch (error) {
                console.error("Failed to fetch data", error);
                toast.error("Failed to load BeeYield data");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Filtered hives based on selected apiary
    const filteredHives = selectedPlace === 'all'
        ? hives
        : hives.filter(h => h.apiary_id === selectedPlace);

    // Calculations
    const totalCoverageAcres = apiaries.reduce((sum, a) => sum + (a.size_acres || 0), 0);

    const activeDevices = devices.filter(d => d.status === 'active');
    const avgBattery = activeDevices.length > 0
        ? Math.round(activeDevices.reduce((sum, d) => sum + d.battery_level, 0) / activeDevices.length)
        : 0;

    // Simulate signal health (mock calculation or based on ping age)
    const signalHealth = activeDevices.length > 0 ? 98.5 : 0;

    // Reset form
    const resetHiveForm = () => {
        setHiveForm({
            hive_code: '',
            apiary_id: apiaries.length > 0 ? apiaries[0].id : '',
            hive_type: 'Langstroth',
            bee_type: 'African Honey Bee',
            frame_count: 10,
            material: 'Wood',
            status: 'ACTIVE',
            installation_date: new Date().toISOString().split('T')[0],
            has_sensors: false,
        });
        setEditingHive(null);
    };

    // Open add hive modal
    const handleOpenAddHive = () => {
        resetHiveForm();
        if (apiaries.length === 0) {
            toast.error('Please add an apiary first before adding hives');
            onTabChange('places');
            return;
        }
        setHiveForm(prev => ({ ...prev, apiary_id: apiaries[0].id }));
        setIsAddingHive(true);
        setShowFab(false);
    };

    // Open edit hive modal
    const handleEditHive = (hive: Hive) => {
        setEditingHive(hive);
        setHiveForm({
            hive_code: hive.hive_code,
            apiary_id: hive.apiary_id || '',
            hive_type: hive.hive_type || 'Langstroth',
            bee_type: hive.bee_type || 'African Honey Bee',
            frame_count: hive.frame_count || 10,
            material: hive.material || 'Wood',
            status: hive.status || 'ACTIVE',
            installation_date: hive.installation_date || new Date().toISOString().split('T')[0],
            has_sensors: hive.has_sensors || false,
        });
        setIsAddingHive(true);
    };

    // Submit hive form (create or update)
    const handleSubmitHive = async () => {
        if (!hiveForm.hive_code.trim()) {
            toast.error('Please enter a hive code');
            return;
        }
        if (!hiveForm.apiary_id) {
            toast.error('Please select an apiary');
            return;
        }

        setIsSaving(true);

        if (editingHive) {
            // Update existing hive
            const { data, error } = await beeyieldService.updateHive(editingHive.id, hiveForm);
            if (data && !error) {
                setHives(hives.map(h => h.id === editingHive.id ? { ...h, ...data } : h));
                setIsAddingHive(false);
                resetHiveForm();
            }
        } else {
            // Create new hive
            const { data, error } = await beeyieldService.createHive(hiveForm);
            if (data && !error) {
                setHives([data, ...hives]);
                setIsAddingHive(false);
                resetHiveForm();
            }
        }

        setIsSaving(false);
    };

    const handleRequestInspection = (hive: Hive) => {
        setInspectionTaskForm({
            title: `Inspect Hive ${hive.hive_code}`,
            description: 'Routine colony health and productivity check.',
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            priority: 'medium',
            hive_id: hive.id,
            apiary_id: hive.apiary_id || ''
        });
        setIsRequestingInspection(true);
    };

    const submitInspectionRequest = async () => {
        setIsSaving(true);
        try {
            const { error } = await beeyieldService.createTask({
                title: inspectionTaskForm.title,
                description: inspectionTaskForm.description,
                status: 'pending',
                priority: inspectionTaskForm.priority,
                category: 'Inspection',
                due_date: new Date(inspectionTaskForm.due_date).toISOString(),
                hive_id: inspectionTaskForm.hive_id,
                apiary_id: inspectionTaskForm.apiary_id
            });

            if (!error) {
                toast.success('Inspection requested successfully', {
                    description: 'Task has been created.'
                });
                setIsRequestingInspection(false);
            }
        } catch (e) {
            console.error(e);
            toast.error('Failed to request inspection');
        } finally {
            setIsSaving(false);
        }
    };

    // Delete hive
    const handleDeleteHive = async (id: string) => {
        if (!confirm('Are you sure you want to delete this hive?')) return;

        const { error } = await beeyieldService.deleteHive(id);
        if (!error) {
            setHives(hives.filter(h => h.id !== id));
        }
    };

    const handleExportExcel = async () => {
        setIsExporting(true);
        try {
            const exportData = filteredHives.map(h => ({
                hive_id: h.hive_code,
                apiary: h.apiary?.name || apiaries.find(a => a.id === h.apiary_id)?.name || 'Unknown',
                farmer: h.farmer?.name || 'Unknown',
                type: h.hive_type,
                status: h.status,
                installed: h.installation_date,
                notes: h.status === 'ACTIVE' ? 'Healthy' : h.status
            }));

            // Create worksheet
            const ws = XLSX.utils.json_to_sheet(exportData);

            // Set column widths
            ws['!cols'] = [
                { wch: 10 }, // hive_id
                { wch: 15 }, // location
                { wch: 12 }, // farmer
                { wch: 15 }, // type
                { wch: 15 }, // status
                { wch: 18 }, // installed
                { wch: 25 }, // notes
            ];

            // Create workbook
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Hives Data');

            // Generate filename with current date
            const date = new Date().toISOString().split('T')[0];
            const filename = `BeeYield_Hives_Export_${date}.xlsx`;

            // Save file
            XLSX.writeFile(wb, filename);

            toast.success('Excel file exported successfully!', {
                description: filename
            });
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export Excel file');
        } finally {
            setIsExporting(false);
        }
    };

    // Render add/edit hive modal
    if (isAddingHive) {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
                <div className="mb-8 px-2 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-[#1e293b] dark:text-white tracking-tight">
                        {editingHive ? 'Edit Hive' : 'Add New Hive'}
                    </h1>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            setIsAddingHive(false);
                            resetHiveForm();
                        }}
                        className="text-slate-500"
                    >
                        <X className="w-4 h-4 mr-2" /> Cancel
                    </Button>
                </div>

                <Card className="border-none shadow-sm bg-white dark:bg-[#1e1e1e] rounded-[2rem] overflow-hidden max-w-4xl mx-2">
                    <CardContent className="p-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            {/* Left Column */}
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <Label htmlFor="hive_code" className="text-sm font-[800] text-slate-500 uppercase tracking-widest">
                                        Hive Code<span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <Input
                                        id="hive_code"
                                        value={hiveForm.hive_code}
                                        onChange={(e) => setHiveForm({ ...hiveForm, hive_code: e.target.value })}
                                        placeholder="e.g. KBZ-001"
                                        className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 text-base bg-slate-50/50 dark:bg-slate-900/50"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="apiary_id" className="text-sm font-[800] text-slate-500 uppercase tracking-widest">
                                        Apiary<span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <Select value={hiveForm.apiary_id} onValueChange={(val) => setHiveForm({ ...hiveForm, apiary_id: val })}>
                                        <SelectTrigger className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                            <SelectValue placeholder="Select apiary" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {apiaries.map(apiary => (
                                                <SelectItem key={apiary.id} value={apiary.id}>{apiary.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="hive_type" className="text-sm font-[800] text-slate-500 uppercase tracking-widest">
                                        Hive Type
                                    </Label>
                                    <Select value={hiveForm.hive_type} onValueChange={(val) => setHiveForm({ ...hiveForm, hive_type: val })}>
                                        <SelectTrigger className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Langstroth">Langstroth</SelectItem>
                                            <SelectItem value="KTBH">Kenya Top-Bar Hive (KTBH)</SelectItem>
                                            <SelectItem value="Traditional Log">Traditional Log</SelectItem>
                                            <SelectItem value="Warre">Warré</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="frame_count" className="text-sm font-[800] text-slate-500 uppercase tracking-widest">
                                        Frame Count
                                    </Label>
                                    <Input
                                        id="frame_count"
                                        type="number"
                                        value={hiveForm.frame_count || ''}
                                        onChange={(e) => setHiveForm({ ...hiveForm, frame_count: parseInt(e.target.value) || 0 })}
                                        placeholder="10"
                                        className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 text-base bg-slate-50/50 dark:bg-slate-900/50"
                                    />
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <Label htmlFor="bee_type" className="text-sm font-[800] text-slate-500 uppercase tracking-widest">
                                        Bee Type
                                    </Label>
                                    <Select value={hiveForm.bee_type} onValueChange={(val) => setHiveForm({ ...hiveForm, bee_type: val })}>
                                        <SelectTrigger className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                            <SelectValue placeholder="Select bee type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="African Honey Bee">African Honey Bee</SelectItem>
                                            <SelectItem value="Italian Bee">Italian Bee</SelectItem>
                                            <SelectItem value="Carniolan Bee">Carniolan Bee</SelectItem>
                                            <SelectItem value="Buckfast Bee">Buckfast Bee</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="status" className="text-sm font-[800] text-slate-500 uppercase tracking-widest">
                                        Status
                                    </Label>
                                    <Select value={hiveForm.status} onValueChange={(val) => setHiveForm({ ...hiveForm, status: val })}>
                                        <SelectTrigger className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ACTIVE">Active & Healthy</SelectItem>
                                            <SelectItem value="WEAK">Weak Colony</SelectItem>
                                            <SelectItem value="INACTIVE">Inactive</SelectItem>
                                            <SelectItem value="QUEENLESS">Queenless</SelectItem>
                                            <SelectItem value="ABANDONED">Abandoned</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="material" className="text-sm font-[800] text-slate-500 uppercase tracking-widest">
                                        Material
                                    </Label>
                                    <Select value={hiveForm.material} onValueChange={(val) => setHiveForm({ ...hiveForm, material: val })}>
                                        <SelectTrigger className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                            <SelectValue placeholder="Select material" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Wood">Wood</SelectItem>
                                            <SelectItem value="Plastic">Plastic</SelectItem>
                                            <SelectItem value="Polystyrene">Polystyrene</SelectItem>
                                            <SelectItem value="Bamboo">Bamboo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="installation_date" className="text-sm font-[800] text-slate-500 uppercase tracking-widest">
                                        Installation Date
                                    </Label>
                                    <Input
                                        id="installation_date"
                                        type="date"
                                        value={hiveForm.installation_date || ''}
                                        onChange={(e) => setHiveForm({ ...hiveForm, installation_date: e.target.value })}
                                        className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 text-base bg-slate-50/50 dark:bg-slate-900/50"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-end gap-6">
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setIsAddingHive(false);
                                    resetHiveForm();
                                }}
                                className="h-14 px-8 rounded-2xl font-bold text-slate-500 hover:text-slate-900 transition-all"
                                disabled={isSaving}
                            >
                                Discard
                            </Button>
                            <Button
                                onClick={handleSubmitHive}
                                disabled={isSaving}
                                className="h-14 px-10 rounded-2xl font-[900] bg-[#1B9157] hover:bg-[#167d4a] text-white shadow-xl shadow-[#1B9157]/40 dark:shadow-none tracking-widest uppercase text-xs"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                                {editingHive ? 'Save Changes' : 'Add Hive'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12 relative">
            {/* Page Title */}
            <div className="flex justify-between items-center">
                <h1 className="text-[2.5rem] font-bold text-[#1B9157] dark:text-[#F4D03F] tracking-tight">BeeYield</h1>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Side - Connected Hardware Nodes Card */}
                <Card className="rounded-2xl border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm min-h-[400px] border-t-4 border-t-[#1B9157] overflow-hidden">
                    <CardContent className="p-0 flex flex-col h-full">
                        <div className="p-6 border-b border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                            <h3 className="text-[10px] font-black text-[#1B9157] uppercase tracking-widest mb-1">CONNECTED HARDWARE NODES</h3>
                            <div className="flex items-center gap-2">
                                <div className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </div>
                                <span className="text-[9px] font-bold text-green-600 uppercase">Live Syncing</span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto max-h-[350px]">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-white/5 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Hive ID</th>
                                        <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Efficiency</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                    {devices.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="py-8 text-center text-xs text-gray-400 font-medium">
                                                No connected hardware nodes found.
                                            </td>
                                        </tr>
                                    ) : (
                                        devices.map((device, i) => (
                                            <tr key={device.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">{device.device_code}</td>
                                                <td className="px-6 py-4">
                                                    <Badge className={cn(
                                                        "text-[8px] font-black uppercase border-none",
                                                        device.status === 'active' ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"
                                                    )}>
                                                        {device.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-black text-slate-900 dark:text-white">
                                                    {device.battery_level}%
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5">
                            <Button variant="ghost" className="w-full text-[10px] font-black text-[#1B9157] uppercase tracking-widest hover:bg-[#1B9157]/5">
                                View Network Topology <ChevronDown className="w-3 h-3 ml-2" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Side - Network Overview Card */}
                <Card className="rounded-2xl border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm border-t-4 border-t-[#F4D03F]">
                    <CardContent className="p-6 space-y-5">
                        {/* Card Header */}
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-[10px] font-bold text-[#1B9157] dark:text-[#F4D03F] uppercase tracking-[0.15em] mb-1">NETWORK OVERVIEW</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total active coverage: <span className="font-bold text-slate-900 dark:text-white">{totalCoverageAcres.toLocaleString()} Acres</span></p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/10 flex items-center justify-center">
                                <Zap className="w-5 h-5 text-orange-500" />
                            </div>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Signal Health</p>
                                <p className="text-lg font-black text-slate-800 dark:text-white">{signalHealth}%</p>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Battery Avg</p>
                                <p className="text-lg font-black text-slate-800 dark:text-white">{avgBattery}%</p>
                            </div>
                        </div>

                        {/* Place Selector - Now functional */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Region / Apiary</label>
                            <Select value={selectedPlace} onValueChange={setSelectedPlace}>
                                <SelectTrigger className="w-full rounded-xl border-gray-200 dark:border-gray-700 h-11 bg-white dark:bg-[#1e1e1e] focus:ring-[#F4D03F]/20 focus:border-[#F4D03F]/50">
                                    <div className="flex items-center gap-2">
                                        <Grid3X3 className="w-4 h-4 text-[#1B9157]" />
                                        <SelectValue placeholder="Select a place" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Locations ({hives.length} hives)</SelectItem>
                                    {apiaries.map(apiary => (
                                        <SelectItem key={apiary.id} value={apiary.id}>
                                            {apiary.name} ({hives.filter(h => h.apiary_id === apiary.id).length} hives)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 pt-2">
                            <Button
                                className="bg-[#F4D03F] hover:bg-[#e0be36] text-[#1A1A1A] rounded-full px-5 h-10 font-bold text-sm shadow-none border-none"
                                onClick={() => onTabChange('assistant')}
                            >
                                <Activity className="w-3 h-3 mr-2" /> AI AUDIT
                            </Button>
                            <Button
                                className="bg-[#1B9157] hover:bg-[#167d4a] text-white rounded-full px-5 h-10 font-bold text-sm shadow-none border-none"
                                onClick={handleExportExcel}
                                disabled={isExporting}
                            >
                                {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 mr-2" />}
                                EXPORT REPORT
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Hives Grid - Show filtered hives */}
            {!isLoading && filteredHives.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 uppercase tracking-wide">
                        Hives ({filteredHives.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredHives.map(hive => (
                            <Card key={hive.id} className="border-none shadow-sm bg-white dark:bg-[#1e1e1e] rounded-2xl overflow-hidden hover:shadow-lg transition-shadow group">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-[#1B9157]/10 flex items-center justify-center">
                                                <Box className="w-5 h-5 text-[#1B9157]" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-base text-slate-900 dark:text-white font-mono">{hive.hive_code}</h3>
                                                <p className="text-xs text-slate-500">
                                                    {apiaries.find(a => a.id === hive.apiary_id)?.name || 'Unknown Apiary'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRequestInspection(hive)}
                                                className="text-orange-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl h-8 w-8"
                                                title="Request Inspection"
                                            >
                                                <ClipboardCheck className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEditHive(hive)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl h-8 w-8"
                                            >
                                                <Edit className="w-3 h-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteHive(hive.id)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl h-8 w-8"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Badge className={cn(
                                            "text-[8px] font-black uppercase border-none",
                                            hive.status === 'ACTIVE' ? "bg-green-500/20 text-green-600" :
                                                hive.status === 'WEAK' ? "bg-yellow-500/20 text-yellow-600" :
                                                    "bg-red-500/20 text-red-600"
                                        )}>
                                            {hive.status || 'ACTIVE'}
                                        </Badge>
                                        <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[8px]">
                                            {hive.hive_type || 'Langstroth'}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <p className="text-slate-400 text-[9px] uppercase font-bold">Frames</p>
                                            <p className="font-bold text-slate-700 dark:text-slate-300">{hive.frame_count || 10}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-[9px] uppercase font-bold">Installed</p>
                                            <p className="font-bold text-slate-700 dark:text-slate-300">{hive.installation_date || '-'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state for hives */}
            {!isLoading && filteredHives.length === 0 && (
                <div className="mt-8 bg-[#FEF2F2] dark:bg-red-950/20 border border-[#FEE2E2] dark:border-red-900/40 rounded-[2rem] py-16 flex flex-col items-center justify-center shadow-sm">
                    <span className="text-[#F87171] dark:text-red-400 font-extrabold text-center text-lg tracking-[0.15em] px-8 uppercase mb-4">
                        {selectedPlace === 'all' ? 'No hives found. Add your first hive!' : 'No hives in this apiary.'}
                    </span>
                    <Button
                        onClick={handleOpenAddHive}
                        className="bg-[#1B9157] hover:bg-[#167d4a] text-white rounded-full px-6 h-12 font-bold shadow-lg"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add First Hive
                    </Button>
                </div>
            )}

            {/* Floating Action Buttons - Right Side */}
            <div className="fixed right-6 bottom-6 flex flex-col items-end gap-3 z-50">
                {/* Expanded FAB Menu */}
                <AnimatePresence>
                    {showFab && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowFab(false)}
                                className="fixed inset-0 z-[-1] bg-transparent"
                            />
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="flex flex-col gap-3"
                            >
                                <Button
                                    onClick={() => onTabChange('notes')}
                                    className="bg-[#1B9157] hover:bg-[#167d4a] text-white rounded-full pl-4 pr-5 h-12 font-bold text-sm shadow-lg flex items-center gap-2 border-2 border-white dark:border-[#141414]"
                                >
                                    <StickyNote className="w-4 h-4" />
                                    ADD NOTES
                                </Button>
                                <Button
                                    onClick={() => onTabChange('task')}
                                    className="bg-[#F4D03F] hover:bg-[#e0be36] text-[#1A1A1A] rounded-full pl-4 pr-5 h-12 font-bold text-sm shadow-lg flex items-center gap-2 border-2 border-white dark:border-[#141414]"
                                >
                                    <CheckSquare className="w-4 h-4" />
                                    TASK
                                </Button>
                                <Button
                                    onClick={handleOpenAddHive}
                                    className="bg-[#1B9157] hover:bg-[#167d4a] text-white rounded-full pl-4 pr-5 h-12 font-bold text-sm shadow-lg flex items-center gap-2 border-2 border-white dark:border-[#141414]"
                                >
                                    <Box className="w-4 h-4" />
                                    HIVE
                                </Button>
                                <Button
                                    onClick={() => onTabChange('places')}
                                    className="bg-white hover:bg-gray-50 text-[#1B9157] rounded-full pl-4 pr-5 h-12 font-bold text-sm shadow-lg flex items-center gap-2 border-2 border-[#1B9157]/20"
                                >
                                    <MapPin className="w-4 h-4 text-[#1B9157]" />
                                    PLACE
                                </Button>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Main FAB Button */}
                <Button
                    onClick={() => setShowFab(!showFab)}
                    className={cn(
                        "w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300",
                        showFab
                            ? "bg-gray-800 hover:bg-gray-700 rotate-45"
                            : "bg-[#F4D03F] hover:bg-[#e0be36] text-[#1A1A1A]"
                    )}
                >
                    <Plus className="w-6 h-6" />
                </Button>
            </div>

            {/* Request Inspection Modal */}
            {isRequestingInspection && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <ClipboardCheck className="w-5 h-5 text-[#1B9157]" />
                                Request Inspection
                            </h2>
                            <Button variant="ghost" size="icon" onClick={() => setIsRequestingInspection(false)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    value={inspectionTaskForm.title}
                                    onChange={(e) => setInspectionTaskForm({ ...inspectionTaskForm, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input
                                    value={inspectionTaskForm.description}
                                    onChange={(e) => setInspectionTaskForm({ ...inspectionTaskForm, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Due Date</Label>
                                    <Input
                                        type="date"
                                        value={inspectionTaskForm.due_date}
                                        onChange={(e) => setInspectionTaskForm({ ...inspectionTaskForm, due_date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Priority</Label>
                                    <Select
                                        value={inspectionTaskForm.priority}
                                        onValueChange={(val: any) => setInspectionTaskForm({ ...inspectionTaskForm, priority: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 dark:bg-white/5 flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setIsRequestingInspection(false)}>Cancel</Button>
                            <Button
                                onClick={submitInspectionRequest}
                                disabled={isSaving}
                                className="bg-[#1B9157] hover:bg-[#167d4a] text-white"
                            >
                                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Request Inspection
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BeeYieldHivesView;
