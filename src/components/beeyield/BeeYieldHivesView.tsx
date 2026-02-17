import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from "@/components/ui/badge";
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
    Plus,
    Hexagon,
    StickyNote,
    CheckSquare,
    Box,
    MapPin,
    Loader2,
    FileSpreadsheet,
    Activity,
    Zap,
    X,
    ShieldCheck,
    Radio,
    Search,
    Filter,
    Cpu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { beeyieldService, Apiary, Hive, IoTDevice } from '@/services/beeyieldService';
import { motion, AnimatePresence } from 'framer-motion';
import { useHives, useDeleteHive, useUpdateHive, useApiaries } from '@/hooks/useHives';
import HiveFormModal from './HiveFormModal';
import FlipCardHive from './FlipCardHive';
import { PageHeader, StatCard, SectionHeader, EmptyState } from './SharedPageComponents';

interface BeeYieldHivesViewProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

const BeeYieldHivesView: React.FC<BeeYieldHivesViewProps> = ({ onTabChange }) => {
    // UI State
    const [selectedPlace, setSelectedPlace] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const [viewMode, setViewMode] = useState<'hives' | 'devices'>('hives');

    // Modal states
    const [isHiveModalOpen, setIsHiveModalOpen] = useState(false);
    const [editingHive, setEditingHive] = useState<Hive | null>(null);

    // Notes and Quick Details states
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
    const [isQuickDetailsOpen, setIsQuickDetailsOpen] = useState(false);
    const [activeHive, setActiveHive] = useState<Hive | null>(null);
    const [hiveNotes, setHiveNotes] = useState("");
    const [isSavingNotes, setIsSavingNotes] = useState(false);

    // Request Inspection Task State
    const [isRequestingInspection, setIsRequestingInspection] = useState(false);
    const [isSavingTask, setIsSavingTask] = useState(false);
    const [inspectionTaskForm, setInspectionTaskForm] = useState({
        title: 'Routine Inspection',
        description: 'Standard hive health check',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'medium' as 'low' | 'medium' | 'high',
        hive_id: '',
        apiary_id: ''
    });

    // Data Hooks
    const { data: hives = [], isLoading: hivesLoading } = useHives();
    const { data: apiaries = [], isLoading: apiariesLoading } = useApiaries();
    const deleteHive = useDeleteHive();
    const updateHiveMutation = useUpdateHive();
    const [devices, setDevices] = useState<IoTDevice[]>([]);

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

    // Filtering
    const filteredHives = React.useMemo(() => {
        return hives.filter(h => {
            const matchesPlace = selectedPlace === 'all' || h.apiary_id === selectedPlace;
            const matchesSearch = searchQuery === '' ||
                h.hive_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                h.status?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesPlace && matchesSearch;
        });
    }, [hives, selectedPlace, searchQuery]);

    const activeDevices = devices.filter(d => d.status === 'active');

    // Stats
    const stats = React.useMemo(() => {
        return {
            total: hives.length,
            active: hives.filter(h => h.status === 'ACTIVE').length,
            critical: hives.filter(h => h.status !== 'ACTIVE').length,
            avgWeight: hives.length > 0
                ? (hives.reduce((sum, h) => sum + (h.latest_weight || 0), 0) / hives.length).toFixed(1)
                : '0.0'
        };
    }, [hives]);

    // Handlers
    const handleOpenAddHive = () => {
        setEditingHive(null);
        if (apiaries.length === 0) {
            toast.error('Please add an apiary first before adding hives');
            onTabChange('places');
            return;
        }
        setIsHiveModalOpen(true);
    };

    const handleEditHive = (hive: Hive) => {
        setEditingHive(hive);
        setIsHiveModalOpen(true);
    };

    const defaultHandleDeleteHive = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (confirm('Are you sure you want to delete this hive?')) {
            try {
                await deleteHive.mutateAsync(id);
                toast.success('Hive deleted');
            } catch (error) {
                console.error(error);
                toast.error('Failed to delete hive');
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
            let dueDate = inspectionTaskForm.due_date;
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
                toast.success('Inspection requested successfully');
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
                type: h.hive_type,
                status: h.status,
                installed: h.installation_date,
                weight: h.latest_weight,
                temp: h.latest_temp
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Hives Data');
            XLSX.writeFile(wb, `BeeYield_Hives_${new Date().toISOString().split('T')[0]}.xlsx`);
            toast.success('Export successful');
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export data');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <PageHeader
                title="Hive Management"
                subtitle="Monitor colony health, productivity, and device status"
                icon={Hexagon}
                badge={{ text: `${activeDevices.length} Online Devices`, variant: 'success' }}
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleExportExcel} disabled={isExporting}>
                            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                        </Button>
                        <Button
                            onClick={handleOpenAddHive}
                            className="gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            New Hive
                        </Button>
                    </div>
                }
            />

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Hives"
                    value={stats.total}
                    icon={Hexagon}
                    color="primary"
                />
                <StatCard
                    label="Active Colonies"
                    value={stats.active}
                    icon={ShieldCheck}
                    color="green"
                />
                <StatCard
                    label="Critical / Warning"
                    value={stats.critical}
                    icon={Activity}
                    color="red"
                    subtitle="Requires attention"
                />
                <StatCard
                    label="Avg Weight"
                    value={`${stats.avgWeight} kg`}
                    icon={Zap}
                    color="amber"
                />
            </div>

            {/* View Switching & Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="flex gap-2">
                            <Button
                                variant={viewMode === 'hives' ? 'default' : 'ghost'}
                                onClick={() => setViewMode('hives')}
                                className="gap-2"
                            >
                                <Box className="w-4 h-4" /> Hives
                            </Button>
                            <Button
                                variant={viewMode === 'devices' ? 'default' : 'ghost'}
                                onClick={() => setViewMode('devices')}
                                className="gap-2"
                            >
                                <Cpu className="w-4 h-4" /> Devices
                            </Button>
                        </div>

                        <div className="flex gap-4 flex-1 justify-end max-w-2xl">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={selectedPlace} onValueChange={setSelectedPlace}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="All Locations" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Locations</SelectItem>
                                    {apiaries.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* List Content */}
            {viewMode === 'hives' ? (
                isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <Card key={i} className="h-64 animate-pulse"><CardContent className="bg-gray-100 dark:bg-gray-800 h-full" /></Card>
                        ))}
                    </div>
                ) : filteredHives.length === 0 ? (
                    <EmptyState
                        icon={Box}
                        title="No Hives Found"
                        description="Add a new hive to start monitoring your colony data."
                        action={{
                            label: "Add Hive",
                            onClick: handleOpenAddHive
                        }}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {filteredHives.map((hive) => (
                                <motion.div
                                    key={hive.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    layout
                                >
                                    <FlipCardHive
                                        hive={{
                                            id: hive.id,
                                            name: hive.hive_code,
                                            weight: hive.latest_weight || 0,
                                            temp: hive.latest_temp || 0,
                                            humidity: hive.latest_humidity || 0,
                                            status: hive.status === 'ACTIVE' ? 'ok' : hive.status?.toUpperCase() === 'MAINTENANCE' ? 'warning' : 'critical'
                                        }}
                                        onViewHistory={() => handleOpenQuickDetails(hive)}
                                        onMarkInspection={() => handleRequestInspection(hive, {} as any)}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )
            ) : (
                /* Devices View */
                <div className="space-y-4">
                    <SectionHeader title="Connected IoT Devices" subtitle={`${activeDevices.length} devices online`} />
                    <Card>
                        <CardContent className="p-0 overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 uppercase font-bold text-xs">
                                    <tr>
                                        <th className="px-6 py-4">Device Code</th>
                                        <th className="px-6 py-4">Linked Hive</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Battery</th>
                                        <th className="px-6 py-4 text-right">Last Sync</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {devices.map((device) => {
                                        const linkedHive = hives.find(h => h.id === device.hive_id || h.hive_code === device.device_code);
                                        return (
                                            <tr key={device.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                                <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-gray-200">
                                                    {device.device_code}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {linkedHive ? (
                                                        <Badge variant="outline" className="font-mono text-xs">
                                                            {linkedHive.hive_code}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-gray-400 italic">Unlinked</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge className={cn(
                                                        "uppercase text-[10px] border-none",
                                                        device.status === 'active' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                    )}>
                                                        {device.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={cn("h-full", device.battery_level > 20 ? "bg-green-500" : "bg-red-500")}
                                                                style={{ width: `${device.battery_level}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-bold text-gray-600">{device.battery_level}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right text-xs text-gray-500">
                                                    {new Date(device.last_ping || Date.now()).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Modals */}
            <HiveFormModal
                isOpen={isHiveModalOpen}
                onClose={() => setIsHiveModalOpen(false)}
                editingHive={editingHive}
            />

            {/* Inspection Request Modal */}
            <AnimatePresence>
                {isRequestingInspection && (
                    <div className="fixed inset-0 z-[50] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md"
                        >
                            <Card className="border-none shadow-xl">
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle>Schedule Inspection</CardTitle>
                                        <Button variant="ghost" size="icon" onClick={() => setIsRequestingInspection(false)}>
                                            <X className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Title</Label>
                                        <Input
                                            value={inspectionTaskForm.title}
                                            onChange={(e) => setInspectionTaskForm({ ...inspectionTaskForm, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Due Date</Label>
                                        <Input
                                            type="date"
                                            value={inspectionTaskForm.due_date}
                                            onChange={(e) => setInspectionTaskForm({ ...inspectionTaskForm, due_date: e.target.value })}
                                        />
                                    </div>
                                    <div className="pt-4 flex gap-3">
                                        <Button variant="ghost" className="flex-1" onClick={() => setIsRequestingInspection(false)}>Cancel</Button>
                                        <Button onClick={submitInspectionRequest} disabled={isSavingTask} className="flex-1">
                                            {isSavingTask ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                            Schedule
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Quick Details Modal */}
            <AnimatePresence>
                {isQuickDetailsOpen && activeHive && (
                    <div className="fixed inset-0 z-[50] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-2xl"
                        >
                            <Card className="border-none shadow-2xl overflow-hidden">
                                <div className="h-2 bg-gradient-to-r from-green-500 to-amber-500" />
                                <CardContent className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h2 className="text-3xl font-bold mb-1">{activeHive.hive_code}</h2>
                                            <div className="flex gap-2">
                                                <Badge>{activeHive.status}</Badge>
                                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {apiaries.find(a => a.id === activeHive.apiary_id)?.name}
                                                </span>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => setIsQuickDetailsOpen(false)}>
                                            <X className="w-5 h-5" />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                        {[
                                            { label: 'Temp', value: activeHive.latest_temp ? `${activeHive.latest_temp}°C` : '--', icon: Activity },
                                            { label: 'Weight', value: activeHive.latest_weight ? `${activeHive.latest_weight}kg` : '--', icon: Zap },
                                            { label: 'Humidity', value: activeHive.latest_humidity ? `${activeHive.latest_humidity}%` : '--', icon: Radio },
                                            { label: 'Brood', value: 'Normal', icon: ShieldCheck }
                                        ].map((item, i) => (
                                            <div key={i} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 text-center">
                                                <item.icon className="w-5 h-5 mx-auto mb-2 text-primary" />
                                                <p className="text-xs font-bold text-gray-400 uppercase">{item.label}</p>
                                                <p className="font-bold text-lg">{item.value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                                            <Label className="text-xs font-bold text-gray-400 uppercase">Recent Notes</Label>
                                            <p className="text-sm mt-1">{activeHive.notes || 'No notes available.'}</p>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <Button
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                                onClick={() => {
                                                    setIsQuickDetailsOpen(false);
                                                    onTabChange('inspections', `Filtering for ${activeHive.hive_code}`, `filter_hive:${activeHive.id}`);
                                                }}
                                            >
                                                <Activity className="w-4 h-4 mr-2" />
                                                View Inspections History
                                            </Button>
                                            <div className="flex gap-3">
                                                <Button className="flex-1" variant="outline" onClick={() => { setIsQuickDetailsOpen(false); handleOpenNotes(activeHive); }}>
                                                    Manage Notes
                                                </Button>
                                                <Button className="flex-1" variant="outline" onClick={() => { setIsQuickDetailsOpen(false); handleEditHive(activeHive); }}>
                                                    Edit Config
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Notes Modal */}
            <AnimatePresence>
                {isNotesModalOpen && activeHive && (
                    <div className="fixed inset-0 z-[50] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-lg"
                        >
                            <Card className="border-none shadow-xl">
                                <CardHeader className="flex flex-row justify-between items-center">
                                    <CardTitle>Hive Notes</CardTitle>
                                    <Button variant="ghost" size="icon" onClick={() => setIsNotesModalOpen(false)}>
                                        <X className="w-5 h-5" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Textarea
                                        value={hiveNotes}
                                        onChange={(e) => setHiveNotes(e.target.value)}
                                        className="min-h-[200px]"
                                        placeholder="Enter observations..."
                                    />
                                    <Button onClick={handleSaveNotes} disabled={isSavingNotes} className="w-full">
                                        {isSavingNotes ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                        Save Notes
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BeeYieldHivesView;
