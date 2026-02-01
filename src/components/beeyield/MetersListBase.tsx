import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Droplet, Flame, Zap, ChevronDown, ChevronUp, FileText, FileSpreadsheet, Search,
    Settings, Info, AlertTriangle, BarChart3, Download, Loader2, Activity,
    LayoutGrid, Box, X, Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { meterService, Building, Apartment, Meter } from '@/services/meterService';
import FirstStepsBanner from './FirstStepsBanner';

interface MetersListBaseProps {
    meterType: 'Water' | 'Heat' | 'Energy' | 'Other';
    title: string;
    onTabChange: (tab: string) => void;
}

const MetersListBase: React.FC<MetersListBaseProps> = ({ meterType, title, onTabChange }) => {
    // Data States
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [apartments, setApartments] = useState<Apartment[]>([]);
    const [meters, setMeters] = useState<Meter[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [buildingFilter, setBuildingFilter] = useState<string>('all');
    const [apartmentFilter, setApartmentFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // UI States
    const [buildingsOpen, setBuildingsOpen] = useState(true);
    const [apartmentsOpen, setApartmentsOpen] = useState(true);
    const [exportOpen, setExportOpen] = useState(true);
    const [downloading, setDownloading] = useState<string | null>(null);
    const [isAddingMeter, setIsAddingMeter] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [bData, mData, aData] = await Promise.all([
                    meterService.getBuildings(),
                    meterService.getMeters({ meter_type: meterType }),
                    meterService.getApartments()
                ]);
                setBuildings(bData);
                setMeters(mData);
                setApartments(aData);
            } catch (error) {
                console.error(`Failed to load ${meterType} meters`, error);
                toast.error(`Failed to load ${meterType} meter data`);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [meterType]);

    // Helpers
    const getBuildingName = (id: string) => buildings.find(b => b.id === id)?.name || id;
    const getBuildingAddress = (id: string) => buildings.find(b => b.id === id)?.address || '';
    const getApartmentNumber = (id?: string) => apartments.find(a => a.id === id)?.unit_number || 'N/A';

    // Filter Logic
    const filteredMeters = meters.filter(m => {
        if (buildingFilter !== 'all' && m.building_id !== buildingFilter) return false;
        if (apartmentFilter !== 'all' && m.apartment_id !== apartmentFilter) return false;
        if (statusFilter !== 'all' && m.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return m.meter_number.toLowerCase().includes(q) ||
                getBuildingName(m.building_id).toLowerCase().includes(q);
        }
        return true;
    });

    const filteredUnits = apartments.filter(a => {
        if (buildingFilter !== 'all' && a.building_id !== buildingFilter) return false;
        return true;
    });

    // Color logic
    const themeColor = {
        'Water': 'text-blue-500 fill-blue-500 bg-blue-50',
        'Heat': 'text-orange-500 fill-orange-500 bg-orange-50',
        'Energy': 'text-yellow-500 fill-yellow-500 bg-yellow-50',
        'Other': 'text-gray-500 fill-gray-500 bg-gray-50'
    }[meterType];

    const accentColor = {
        'Water': '#2563EB',
        'Heat': '#EA580C',
        'Energy': '#F4D03F',
        'Other': '#4B5563'
    }[meterType];

    const handleExport = (format: 'CSV' | 'XLS' | 'PDF') => {
        setDownloading(format);
        setTimeout(() => {
            try {
                if (format === 'PDF') {
                    generatePDF();
                } else {
                    const exportData = filteredMeters.map(meter => ({
                        'Meter ID': meter.id,
                        'Meter Number': meter.meter_number,
                        'Type': meter.meter_type,
                        'Building': getBuildingName(meter.building_id),
                        'Building Address': getBuildingAddress(meter.building_id),
                        'Apartment': getApartmentNumber(meter.apartment_id),
                        'Last Reading': `${meter.last_reading_value} ${meter.last_reading_unit}`,
                        'Status': meter.status,
                        'Alarm': meter.has_alarm ? 'YES' : 'NO'
                    }));

                    const wb = XLSX.utils.book_new();
                    const ws = XLSX.utils.json_to_sheet(exportData);
                    XLSX.utils.book_append_sheet(wb, ws, "Meters");
                    XLSX.writeFile(wb, `meters_list_${meterType.toLowerCase()}.${format === 'XLS' ? 'xlsx' : 'csv'}`);
                    toast.success(`${format} exported successfully`);
                }
            } catch (error) {
                console.error('Export failed', error);
                toast.error(`Failed to export ${format}`);
            } finally {
                setDownloading(null);
            }
        }, 1000);
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.setTextColor(accentColor === '#F4D03F' ? '#713F12' : accentColor);
        doc.text(`BeeYield Meter List - ${meterType}`, 14, 20);

        const tableData = filteredMeters.map(m => [
            m.meter_type,
            getBuildingName(m.building_id),
            getApartmentNumber(m.apartment_id),
            m.meter_number,
            `${m.last_reading_value} ${m.last_reading_unit}`,
            m.status
        ]);

        autoTable(doc, {
            head: [['Type', 'Building', 'Unit', 'Meter #', 'Last Reading', 'Status']],
            body: tableData,
            startY: 35,
            headStyles: { fillColor: accentColor === '#F4D03F' ? [244, 208, 63] : accentColor as any },
        });

        doc.save(`meters_${meterType.toLowerCase()}.pdf`);
        toast.success('PDF exported successfully');
    };

    if (loading && meters.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
                <p className="text-gray-500 font-medium">Synchronizing meter data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <FirstStepsBanner onTabChange={onTabChange} />

            <div className="flex items-center justify-between">
                <h1 className="text-[2.2rem] font-black text-[#0F172A] dark:text-white tracking-tight flex items-center gap-2">
                    Meter list <span className="text-gray-300">·</span> <span style={{ color: accentColor }}>{title}</span>
                </h1>
            </div>

            <div className="bg-white dark:bg-[#09090b] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
                {!isAddingMeter ? (
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Add new {meterType.toLowerCase()} meter</h3>
                            <p className="text-xs text-gray-400 mt-1">Configure serial number and location details</p>
                        </div>
                        <Button
                            onClick={() => setIsAddingMeter(true)}
                            className="rounded-xl px-6 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 shadow-none border border-gray-200 dark:border-gray-700 font-semibold text-xs h-9"
                        >
                            Add meter
                        </Button>
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-top duration-300 space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Configuration</h3>
                            <Button variant="ghost" size="sm" onClick={() => setIsAddingMeter(false)}><X className="w-4 h-4" /></Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Input placeholder="Serial Number" className="h-10 rounded-xl" />
                            <Select><SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Building" /></SelectTrigger></Select>
                            <Input placeholder="Unit / Office" className="h-10 rounded-xl" />
                            <Button className="h-10 rounded-xl font-bold" style={{ backgroundColor: accentColor, color: accentColor === '#F4D03F' ? 'black' : 'white' }}>Save Meter</Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Buildings Grid */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Apiary Infrastructure</h3>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setBuildingsOpen(!buildingsOpen)} className="text-gray-400 text-xs gap-1">
                        {buildingsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {buildingsOpen ? 'Collapse' : 'Expand'}
                    </Button>
                </div>
                {buildingsOpen && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {buildings.map(b => (
                            <Card key={b.id} className="p-4 rounded-2xl border-gray-100 dark:border-gray-800 shadow-sm border-l-4" style={{ borderLeftColor: accentColor }}>
                                <h4 className="text-sm font-bold truncate">{b.name}</h4>
                                <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{b.address}</p>
                                <div className="mt-4 flex gap-2">
                                    <Badge variant="secondary" className="text-[9px] px-1.5 h-5">{meters.filter(m => m.building_id === b.id).length} Meters</Badge>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-[#09090b] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Apiary Area</label>
                        <Select value={buildingFilter} onValueChange={setBuildingFilter}>
                            <SelectTrigger className="h-9 rounded-xl text-xs"><SelectValue placeholder="All" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All buildings</SelectItem>
                                {buildings.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Hive / Station</label>
                        <Select value={apartmentFilter} onValueChange={setApartmentFilter}>
                            <SelectTrigger className="h-9 rounded-xl text-xs"><SelectValue placeholder="All" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All units</SelectItem>
                                {filteredUnits.map(a => <SelectItem key={a.id} value={a.id}>{a.unit_number}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Status</label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-9 rounded-xl text-xs"><SelectValue placeholder="All" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="ok">OK</SelectItem>
                                <SelectItem value="warning">Warning</SelectItem>
                                <SelectItem value="alert">Alert</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="lg:col-span-3 space-y-1.5">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                            <Input
                                placeholder="Search by meter ID or address..."
                                className="h-9 rounded-xl pl-9 text-xs"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* List */}
            <Card className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/10">
                                {['Meter', 'Location', 'Last Reading', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="text-left py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                            {filteredMeters.length === 0 ? (
                                <tr><td colSpan={5} className="py-20 text-center text-gray-400 italic">No matching meters found</td></tr>
                            ) : (
                                filteredMeters.map(meter => (
                                    <tr key={meter.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("p-2 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800", themeColor)}>
                                                    {meterType === 'Water' && <Droplet className="w-3.5 h-3.5" />}
                                                    {meterType === 'Heat' && <Flame className="w-3.5 h-3.5" />}
                                                    {meterType === 'Energy' && <Zap className="w-3.5 h-3.5" />}
                                                    {meterType === 'Other' && <Box className="w-3.5 h-3.5" />}
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-mono font-bold text-gray-900 dark:text-white uppercase">{meter.meter_number}</p>
                                                    <p className="text-[9px] text-gray-400 mt-0.5">{meter.meter_code}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="text-[11px] font-bold text-gray-700 dark:text-gray-300">{getBuildingName(meter.building_id)}</p>
                                            <p className="text-[9px] text-gray-400 mt-0.5">Unit: {getApartmentNumber(meter.apartment_id)}</p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="text-[11px] font-bold text-gray-900 dark:text-white">{meter.last_reading_value} {meter.last_reading_unit}</p>
                                            <p className="text-[9px] text-gray-400 mt-0.5">{meter.last_reading_at ? new Date(meter.last_reading_at).toLocaleDateString() : 'N/A'}</p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <Badge className={cn(
                                                "border-0 text-[10px] font-bold px-2 rounded-full",
                                                meter.status === 'OK' ? "bg-green-100 text-green-700" :
                                                    meter.status === 'WARNING' ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                                            )}>
                                                {meter.status}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg"><Info className="w-3.5 h-3.5" /></Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => generatePDF()}><Download className="w-3.5 h-3.5" /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Export Section */}
            <Card className="p-6 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold">Data Export</h3>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleExport('CSV')} className="h-8 rounded-xl text-xs font-bold gap-2"><FileText className="w-3.5 h-3.5" /> CSV</Button>
                        <Button variant="outline" size="sm" onClick={() => handleExport('XLS')} className="h-8 rounded-xl text-xs font-bold gap-2"><FileSpreadsheet className="w-3.5 h-3.5 text-green-600" /> Excel</Button>
                        <Button size="sm" onClick={() => handleExport('PDF')} className="h-8 rounded-xl text-xs font-bold gap-2 bg-[#0F172A] text-white">
                            {downloading === 'PDF' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-4 h-4" />}
                            PDF Report
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default MetersListBase;
