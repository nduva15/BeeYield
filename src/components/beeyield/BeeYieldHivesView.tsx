import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Grid3X3, StickyNote, CheckSquare, Box, MapPin, Loader2, FileSpreadsheet, ChevronDown, Activity, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { beeyieldService, Apiary, Hive, IoTDevice } from '@/services/beeyieldService';

interface BeeYieldHivesViewProps {
    onTabChange: (tab: string) => void;
}

const BeeYieldHivesView: React.FC<BeeYieldHivesViewProps> = ({ onTabChange }) => {
    const [selectedPlace, setSelectedPlace] = useState('all');
    const [showFab, setShowFab] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [hives, setHives] = useState<Hive[]>([]);
    const [apiaries, setApiaries] = useState<Apiary[]>([]);
    const [devices, setDevices] = useState<IoTDevice[]>([]);

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

    // Calculations
    const totalCoverageAcres = apiaries.reduce((sum, a) => sum + (a.size_acres || 0), 0);

    const activeDevices = devices.filter(d => d.status === 'active');
    const avgBattery = activeDevices.length > 0
        ? Math.round(activeDevices.reduce((sum, d) => sum + d.battery_level, 0) / activeDevices.length)
        : 0;

    // Simulate signal health (mock calculation or based on ping age)
    const signalHealth = activeDevices.length > 0 ? 98.5 : 0;


    const handleExportExcel = async () => {
        setIsExporting(true);
        try {
            const exportData = hives.map(h => ({
                hive_id: h.hive_code,
                apiary: h.apiary?.name || 'Unknown',
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
                { wch: 12 }, // queen_age
                { wch: 15 }, // colony_strength
                { wch: 15 }, // last_inspection
                { wch: 18 }, // honey_production_kg
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

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12 relative">
            {/* Page Title */}
            <div className="flex justify-between items-center">
                <h1 className="text-[2.5rem] font-bold text-[#1B9157] dark:text-[#F4D03F] tracking-tight">BeeYield</h1>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Side - Loading Data Card */}
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

                {/* Right Side - My Places Card */}
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

                        {/* Place Selector */}
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
                                    <SelectItem value="all">All Locations</SelectItem>
                                    {apiaries.map(apiary => (
                                        <SelectItem key={apiary.id} value={apiary.id}>{apiary.name}</SelectItem>
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

            {/* Floating Action Buttons - Right Side */}
            <div className="fixed right-6 bottom-6 flex flex-col items-end gap-3 z-50">
                {/* Expanded FAB Menu */}
                <div className={cn(
                    "flex flex-col gap-3 transition-all duration-300",
                    showFab ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                )}>
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
                </div>

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
        </div>
    );
};

export default BeeYieldHivesView;
