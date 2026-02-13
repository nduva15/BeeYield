import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Grid3X3, StickyNote, CheckSquare, Box, MapPin, Loader2, FileSpreadsheet, ChevronDown, Activity, Zap, X, Edit, Trash2, ClipboardCheck, Radio, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { beeyieldService, Apiary, Hive, IoTDevice } from '@/services/beeyieldService';
import { motion, AnimatePresence } from 'framer-motion';
import { useHives, useDeleteHive, useUpdateHive, useApiaries } from '@/hooks/useHives';
import HiveFormModal from './HiveFormModal';

interface BeeYieldHivesViewProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

const BeeYieldHivesView: React.FC<BeeYieldHivesViewProps> = ({ onTabChange }) => {
    const [selectedPlace, setSelectedPlace] = useState('all');
    const [showFab, setShowFab] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Modal states
    const [isHiveModalOpen, setIsHiveModalOpen] = useState(false);
    const [editingHive, setEditingHive] = useState<Hive | null>(null);

    // Notes and Quick Details states
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
    const [isQuickDetailsOpen, setIsQuickDetailsOpen] = useState(false);
    const [activeHive, setActiveHive] = useState<Hive | null>(null);
    const [hiveNotes, setHiveNotes] = useState("");
    const [isSavingNotes, setIsSavingNotes] = useState(false);

    // TanStack Query Hooks
    const { data: hives = [], isLoading: hivesLoading } = useHives();
    const { data: apiaries = [], isLoading: apiariesLoading } = useApiaries();
    const deleteHive = useDeleteHive();

    const [devices, setDevices] = useState<IoTDevice[]>([]);

    // Request Inspection Task
    const [isRequestingInspection, setIsRequestingInspection] = useState(false);
    const [isSavingTask, setIsSavingTask] = useState(false);
    const [inspectionTaskForm, setInspectionTaskForm] = useState({
        title: 'Routine Inspection',
        description: 'Standard hive health check',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Next week
        priority: 'medium' as 'low' | 'medium' | 'high',
        hive_id: '',
        apiary_id: ''
    });

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const devicesData = await beeyieldService.getDevices();
                setDevices(devicesData);
            } catch (error) {
                console.error("Failed to fetch devices", error);
            }
        };
        fetchDevices();
    }, []);

    const isLoading = hivesLoading || apiariesLoading;

    // Filtered hives based on selected apiary
    const filteredHives = selectedPlace === 'all'
        ? hives
        : hives.filter(h => h.apiary_id === selectedPlace);

    // Calculations
    const totalCoverageAcres = apiaries.reduce((sum, a) => sum + (a.size_acres || 0), 0);

    const activeDevices = devices.filter(d => d.status === 'active');

    // Open add hive modal
    const handleOpenAddHive = () => {
        setEditingHive(null);
        if (apiaries.length === 0) {
            toast.error('Please add an apiary first before adding hives');
            onTabChange('places');
            return;
        }
        setIsHiveModalOpen(true);
        setShowFab(false);
    };

    // Open edit hive modal
    const handleEditHive = (hive: Hive) => {
        setEditingHive(hive);
        setIsHiveModalOpen(true);
    };

    // Delete hive
    const handleDeleteHive = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (confirm('Are you sure you want to delete this hive?')) {
            try {
                await deleteHive.mutateAsync(id);
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleRequestInspection = (hive: Hive, e: React.MouseEvent) => {
        e.stopPropagation();
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

    const handleOpenQuickDetails = (hive: Hive) => {
        setActiveHive(hive);
        setIsQuickDetailsOpen(true);
    };

    const handleOpenNotes = (hive: Hive, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setActiveHive(hive);
        setHiveNotes(hive.notes || "");
        setIsNotesModalOpen(true);
    };

    const updateHiveMutation = useUpdateHive();

    const handleSaveNotes = async () => {
        if (!activeHive) return;
        setIsSavingNotes(true);
        try {
            await updateHiveMutation.mutateAsync({
                id: activeHive.id,
                data: { notes: hiveNotes }
            });
            setIsNotesModalOpen(false);
            toast.success("Notes saved to archive");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save notes");
        } finally {
            setIsSavingNotes(false);
        }
    };

    const submitInspectionRequest = async () => {
        setIsSavingTask(true);
        try {
            // Ensure date is valid for the API
            let dueDate = inspectionTaskForm.due_date;
            if (dueDate.includes('/')) {
                const [m, d, y] = dueDate.split('/');
                dueDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            }

            const { error } = await beeyieldService.createTask({
                title: inspectionTaskForm.title,
                description: inspectionTaskForm.description,
                status: 'pending',
                priority: inspectionTaskForm.priority === 'high' ? 'High' : inspectionTaskForm.priority === 'low' ? 'Low' : 'Medium',
                type: 'Inspection',
                category: 'Inspection',
                due_date: new Date(dueDate).toISOString(),
                hive_id: inspectionTaskForm.hive_id,
                apiary_id: inspectionTaskForm.apiary_id,
                is_completed: false
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
            setIsSavingTask(false);
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

            const ws = XLSX.utils.json_to_sheet(exportData);
            ws['!cols'] = [
                { wch: 10 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 25 },
            ];

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Hives Data');

            const date = new Date().toISOString().split('T')[0];
            const filename = `BeeYield_Hives_Export_${date}.xlsx`;

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

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12 relative">
            {/* Page Title */}
            <div className="flex justify-between items-center px-4">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Management</h1>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4">
                {/* Left Side - Device List */}
                <Card className="rounded-[2.5rem] border border-slate-100 bg-white shadow-sm min-h-[400px] overflow-hidden">
                    <CardContent className="p-0 flex flex-col h-full">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Connected Hardware</h3>
                                <div className="flex items-center gap-2">
                                    <div className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-20"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </div>
                                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">System Online</span>
                                </div>
                            </div>
                            <ShieldCheck className="w-5 h-5 text-green-500 opacity-20" />
                        </div>
                        <div className="flex-1 overflow-y-auto max-h-[350px] custom-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-8 py-4 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Device ID</th>
                                        <th className="px-8 py-4 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="px-8 py-4 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Battery</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {devices.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="py-12 text-center text-xs text-gray-400 font-bold uppercase tracking-widest">
                                                No connected nodes found
                                            </td>
                                        </tr>
                                    ) : (
                                        devices.map((device) => {
                                            const linkedHive = hives.find(h => h.id === device.hive_id || h.hive_code === device.device_code);
                                            return (
                                                <tr
                                                    key={device.id}
                                                    className={cn(
                                                        "hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors",
                                                        linkedHive && "cursor-pointer"
                                                    )}
                                                    onClick={() => linkedHive && handleOpenQuickDetails(linkedHive)}
                                                >
                                                    <td className="px-8 py-5 text-xs font-bold text-slate-700 font-mono">
                                                        <div className="flex items-center gap-2">
                                                            {linkedHive && <div className="w-1 h-3 bg-green-600 rounded-full" />}
                                                            {device.device_code}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <Badge className={cn(
                                                            "text-[8px] font-black uppercase border-none px-2 py-0.5 rounded-full",
                                                            device.status === 'active' ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
                                                        )}>
                                                            {device.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                                <div className="h-full bg-green-500" style={{ width: `${device.battery_level}%` }} />
                                                            </div>
                                                            <span className="text-[10px] font-bold text-slate-800">{device.battery_level}%</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100">
                            <Button variant="ghost" className="w-full text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:bg-slate-100 py-6">
                                View Device Details <ChevronDown className="w-3 h-3 ml-2" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Side - Vitals & Filter Card */}
                <div className="flex flex-col gap-6">
                    <Card className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">SYSTEM OVERVIEW</h3>
                                <p className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Active</p>
                            </div>
                            <ShieldCheck className="w-6 h-6 text-amber-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100">
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total Area</p>
                                <p className="text-xl font-bold text-slate-800">{totalCoverageAcres} AC</p>
                            </div>
                            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100">
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-2">Active Devices</p>
                                <p className="text-xl font-bold text-slate-800">{activeDevices.length}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm flex-1">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-6">LOCATION FILTER</h3>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Apiary</Label>
                                <Select name="apiary_filter" value={selectedPlace} onValueChange={setSelectedPlace}>
                                    <SelectTrigger id="hives-apiary-filter" className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold">
                                        <SelectValue placeholder="All Territories" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl">
                                        <SelectItem value="all" className="font-bold py-3">All Territories</SelectItem>
                                        {apiaries.map(place => (
                                            <SelectItem key={place.id} value={place.id} className="font-bold py-3">{place.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                onClick={handleExportExcel}
                                disabled={isExporting}
                                className="w-full h-14 rounded-2xl bg-white border border-slate-100 text-slate-800 font-bold uppercase tracking-wider text-[10px] hover:bg-slate-50"
                            >
                                {isExporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileSpreadsheet className="w-4 h-4 mr-2" />}
                                Export Data
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Hives Grid Section */}
            <div className="px-4 mt-4">
                <div className="flex items-center justify-between mb-8 px-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-green-600 rounded-full" />
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight uppercase">Hive List ({filteredHives.length})</h2>
                    </div>
                    <Badge className="bg-slate-100 text-slate-500 border-none font-bold px-4 py-1.5 rounded-full uppercase tracking-wider text-[9px]">
                        {filteredHives.length} Hives
                    </Badge>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                        {[1, 2, 3, 4].map(i => (
                            <Card key={i} className="h-48 rounded-[2rem] animate-pulse bg-slate-100 dark:bg-white/5 border-none" />
                        ))}
                    </div>
                ) : filteredHives.length === 0 ? (
                    <div className="py-20 text-center px-4">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Box className="w-8 h-8 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2 uppercase">No Hives Found</h3>
                        <p className="text-slate-500 font-bold text-sm max-w-xs mx-auto">No hive units detected in this territory. Add a new hive to begin tracking.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                        {filteredHives.map((hive) => (
                            <motion.div
                                key={hive.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="group cursor-pointer"
                                onClick={() => handleOpenQuickDetails(hive)}
                            >
                                <Card className="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden h-full">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-[5rem] -mr-16 -mt-16 transition-all group-hover:scale-110" />

                                    <div className="flex justify-between items-start relative z-10 mb-8">
                                        <div>
                                            <Badge className={cn(
                                                "mb-3 border-none font-bold uppercase tracking-wider text-[8px] px-3 py-1 rounded-full",
                                                hive.status === 'ACTIVE' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                            )}>
                                                {hive.status}
                                            </Badge>
                                            <h3 className="text-2xl font-bold text-slate-800 tracking-tight uppercase">{hive.hive_code}</h3>
                                        </div>
                                        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full bg-slate-50 dark:bg-white/10"
                                                onClick={(e) => { e.stopPropagation(); handleEditHive(hive); }}
                                                title="Edit Hive"
                                            >
                                                <Edit className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full bg-slate-50 dark:bg-white/10"
                                                onClick={(e) => handleOpenNotes(hive, e)}
                                                title="View Notes"
                                            >
                                                <StickyNote className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full bg-red-50 dark:bg-red-900/20"
                                                onClick={(e) => handleDeleteHive(hive.id, e)}
                                                title="Delete Hive"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-6 relative z-10">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Type</p>
                                                <p className="text-[10px] font-bold text-slate-800 uppercase truncate">{hive.hive_type}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Species</p>
                                                <p className="text-[10px] font-bold text-slate-800 uppercase truncate">{hive.bee_type?.split(' ')[0]}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                            <div className="flex items-center text-slate-400">
                                                <MapPin className="w-3 h-3 mr-1.5" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider truncate max-w-[100px]">
                                                    {apiaries.find(a => a.id === hive.apiary_id)?.name || 'Unknown'}
                                                </span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                className="h-8 px-3 rounded-full bg-green-50 hover:bg-green-100 text-green-600 text-[8px] font-bold uppercase tracking-wider transition-all"
                                                onClick={(e) => handleRequestInspection(hive, e)}
                                            >
                                                Refresh Data
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* FAB Control Hub */}
            <div className="fixed bottom-12 right-12 z-50 flex flex-col items-end gap-4">
                <AnimatePresence>
                    {showFab && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            className="flex flex-col gap-3 mb-4 items-end"
                        >
                            <Button
                                onClick={() => { onTabChange('notes', undefined, 'add'); setShowFab(false); }}
                                className="bg-[#1B9157] hover:bg-[#167d4a] text-white rounded-full pl-4 pr-5 h-12 font-black text-[10px] shadow-2xl flex items-center gap-2 border-2 border-white dark:border-[#141414] uppercase tracking-widest"
                            >
                                <StickyNote className="w-4 h-4" />
                                ADD NOTES
                            </Button>
                            <Button
                                onClick={() => { onTabChange('task', undefined, 'add'); setShowFab(false); }}
                                className="bg-amber-400 hover:bg-amber-500 text-slate-800 rounded-full pl-4 pr-5 h-12 font-bold text-[10px] shadow-2xl flex items-center gap-2 border-2 border-white uppercase tracking-wider"
                            >
                                <CheckSquare className="w-4 h-4" />
                                TASK
                            </Button>
                            <Button
                                onClick={() => { handleOpenAddHive(); setShowFab(false); }}
                                className="bg-green-600 hover:bg-green-700 text-white rounded-full pl-4 pr-5 h-12 font-bold text-[10px] shadow-2xl flex items-center gap-2 border-2 border-white uppercase tracking-wider"
                            >
                                <Box className="w-4 h-4" />
                                HIVE
                            </Button>
                            <Button
                                onClick={() => { onTabChange('places'); setShowFab(false); }}
                                className="bg-white hover:bg-slate-50 text-green-600 rounded-full pl-4 pr-5 h-12 font-bold text-[10px] shadow-2xl flex items-center gap-2 border-2 border-white uppercase tracking-wider"
                            >
                                <MapPin className="w-4 h-4" />
                                PLACE
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Button
                    onClick={() => setShowFab(!showFab)}
                    className={cn(
                        "w-16 h-16 rounded-full shadow-[0_20px_50px_rgba(22,163,74,0.3)] flex items-center justify-center transition-all duration-500",
                        showFab ? "bg-slate-800 rotate-45" : "bg-green-600 hover:bg-green-700"
                    )}
                >
                    <Plus className="w-8 h-8 text-white" strokeWidth={3} />
                </Button>
            </div>

            {/* Inspection Request Modal */}
            <AnimatePresence>
                {isRequestingInspection && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md"
                        >
                            <Card className="rounded-[2rem] border-none shadow-2xl bg-white overflow-hidden">
                                <div className="p-8 border-b border-slate-50">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Data Refresh Request</h3>
                                        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsRequestingInspection(false)}>
                                            <X className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                                <CardContent className="p-8 space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operation Description</Label>
                                        <Input
                                            id="inspection-title"
                                            name="inspection-title"
                                            value={inspectionTaskForm.title}
                                            onChange={(e) => setInspectionTaskForm({ ...inspectionTaskForm, title: e.target.value })}
                                            className="h-12 rounded-xl bg-slate-50 dark:bg-white/[0.02] border-slate-100 dark:border-white/5 font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scheduled Date</Label>
                                        <Input
                                            id="inspection-date"
                                            name="inspection-date"
                                            type="date"
                                            value={inspectionTaskForm.due_date}
                                            onChange={(e) => setInspectionTaskForm({ ...inspectionTaskForm, due_date: e.target.value })}
                                            className="h-12 rounded-xl bg-slate-50 dark:bg-white/[0.02] border-slate-100 dark:border-white/5 font-bold"
                                        />
                                    </div>
                                    <div className="pt-4 flex gap-3">
                                        <Button variant="ghost" className="flex-1 h-12 rounded-xl font-bold uppercase tracking-wider text-[10px]" onClick={() => setIsRequestingInspection(false)}>Cancel</Button>
                                        <Button
                                            onClick={submitInspectionRequest}
                                            disabled={isSavingTask}
                                            className="flex-1 h-12 rounded-xl font-bold uppercase tracking-wider text-[10px] bg-green-600 hover:bg-green-700 text-white"
                                        >
                                            {isSavingTask ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ClipboardCheck className="w-4 h-4 mr-2" />}
                                            Refresh Now
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Hive Notes Modal */}
            <AnimatePresence>
                {isNotesModalOpen && activeHive && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsNotesModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-slate-100"
                        >
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-green-600">
                                        <StickyNote className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Hive Notes</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{activeHive.hive_code}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsNotesModalOpen(false)} className="rounded-full">
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Colony Observations</Label>
                                    <textarea
                                        id="hive-observations"
                                        name="hive-observations"
                                        value={hiveNotes}
                                        onChange={(e) => setHiveNotes(e.target.value)}
                                        className="w-full min-h-[200px] bg-slate-50 border-none rounded-3xl p-6 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-green-500/10 transition-all text-sm resize-none"
                                        placeholder="Add notes about queen status, honey stores, temperament..."
                                    />
                                </div>
                                <Button
                                    onClick={handleSaveNotes}
                                    disabled={isSavingNotes}
                                    className="w-full h-14 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-wider text-xs shadow-xl shadow-green-500/20"
                                >
                                    {isSavingNotes ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : "Save Notes"}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Quick Status Modal */}
            <AnimatePresence>
                {isQuickDetailsOpen && activeHive && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsQuickDetailsOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden border border-slate-100"
                        >
                            <div className="h-2 bg-gradient-to-r from-green-600 via-amber-400 to-green-600" />
                            <div className="p-10">
                                <div className="flex justify-between items-start mb-10">
                                    <div className="flex gap-6 items-center">
                                        <div className="w-20 h-20 rounded-3xl bg-slate-50 flex flex-col items-center justify-center border border-slate-100">
                                            <span className="text-[10px] font-bold uppercase text-slate-400">Hive</span>
                                            <span className="text-2xl font-bold text-slate-800">{activeHive.hive_code.split('-').pop()}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-bold text-slate-800 tracking-tight uppercase mb-1">{activeHive.hive_code}</h3>
                                            <div className="flex items-center gap-3">
                                                <Badge className={cn(
                                                    "border-none font-bold uppercase tracking-wider text-[8px] px-3 py-1 rounded-full",
                                                    activeHive.status === 'ACTIVE' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                )}>
                                                    {activeHive.status}
                                                </Badge>
                                                <span className="text-[10px] font-black text-slate-400 border-l border-gray-200 pl-3 uppercase tracking-widest">
                                                    {apiaries.find(a => a.id === activeHive.apiary_id)?.name || 'Local Apiary'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setIsQuickDetailsOpen(false)} className="rounded-full h-10 w-10 bg-slate-50 dark:bg-white/5">
                                        <X className="w-5 h-5 text-slate-400" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                                    {[
                                        { label: 'TEMP', value: activeHive.latest_temp ? `${activeHive.latest_temp.toFixed(1)}°` : '33.5°', icon: Activity, color: 'text-[#1B9157]' },
                                        { label: 'WEIGHT', value: activeHive.latest_weight ? `${activeHive.latest_weight.toFixed(1)}kg` : '24.2kg', icon: Zap, color: 'text-[#F4D03F]' },
                                        { label: 'HUMIDITY', value: activeHive.latest_humidity ? `${activeHive.latest_humidity.toFixed(0)}%` : '55%', icon: Radio, color: 'text-blue-500' },
                                        { label: 'STATUS', value: activeHive.status === 'ACTIVE' ? 'HEALTHY' : 'WARNING', icon: ShieldCheck, color: 'text-green-500' }
                                    ].map((stat, i) => {
                                        const Icon = stat.icon as any;
                                        return (
                                            <div key={i} className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-50 dark:border-white/5">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className={cn("w-6 h-6 rounded-lg bg-white dark:bg-black/20 flex items-center justify-center shadow-sm", stat.color)}>
                                                        {Icon && <Icon className="w-3.5 h-3.5" />}
                                                    </div>
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                                                </div>
                                                <div className="text-lg font-black text-slate-900 dark:text-white">{stat.value}</div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="space-y-4">
                                    <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10">
                                        <div className="flex items-center gap-3 mb-3">
                                            <StickyNote className="w-4 h-4 text-[#1B9157]" />
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Observations</h4>
                                        </div>
                                        <p className="text-sm font-bold text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                            {activeHive.notes || "No recent archive notes detected. Use the note command to document colony status."}
                                        </p>
                                    </div>

                                    <div className="flex gap-4">
                                        <Button
                                            onClick={() => handleOpenNotes(activeHive)}
                                            className="flex-1 h-12 rounded-2xl bg-green-50 hover:bg-green-100 text-green-600 font-bold uppercase tracking-wider text-[10px] border-none"
                                        >
                                            View Details
                                        </Button>
                                        <Button
                                            onClick={() => handleEditHive(activeHive)}
                                            className="flex-1 h-12 rounded-2xl bg-slate-800 text-white font-bold uppercase tracking-wider text-[10px] border-none"
                                        >
                                            Edit Hive
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Hive Form Modal */}
            <HiveFormModal
                isOpen={isHiveModalOpen}
                onClose={() => setIsHiveModalOpen(false)}
                editingHive={editingHive}
            />
        </div>
    );
};

export default BeeYieldHivesView;
