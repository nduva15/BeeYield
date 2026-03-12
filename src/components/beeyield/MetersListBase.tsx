import React from 'react';
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
    const [buildings, setBuildings] = React.useState<Building[]>([]);
    const [apartments, setApartments] = React.useState<Apartment[]>([]);
    const [meters, setMeters] = React.useState<Meter[]>([]);
    const [loading, setLoading] = React.useState(true);

    // Filter States
    const [buildingFilter, setBuildingFilter] = React.useState<string>('all');
    const [apartmentFilter, setApartmentFilter] = React.useState<string>('all');
    const [statusFilter, setStatusFilter] = React.useState<string>('all');
    const [searchQuery, setSearchQuery] = React.useState('');

    // UI States
    const [buildingsOpen, setBuildingsOpen] = React.useState(true);
    const [apartmentsOpen, setApartmentsOpen] = React.useState(true);
    const [exportOpen, setExportOpen] = React.useState(true);
    const [downloading, setDownloading] = React.useState<string | null>(null);
    const [isAddingMeter, setIsAddingMeter] = React.useState(false);

    React.useEffect(() => {
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
                        'Sensor ID': meter.id,
                        'Device Number': meter.meter_number,
                        'Type': meter.meter_type,
                        'Apiary': getBuildingName(meter.building_id),
                        'Apiary Address': getBuildingAddress(meter.building_id),
                        'Hive / Unit': getApartmentNumber(meter.apartment_id),
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
        doc.text(`BeeYield Sensor List - ${meterType}`, 14, 20);

        const tableData = filteredMeters.map(m => [
            m.meter_type,
            getBuildingName(m.building_id),
            getApartmentNumber(m.apartment_id),
            m.meter_number,
            `${m.last_reading_value} ${m.last_reading_unit}`,
            m.status
        ]);

        autoTable(doc, {
            head: [['Type', 'Apiary', 'Hive', 'Sensor #', 'Last Reading', 'Status']],
            body: tableData,
            startY: 35,
            headStyles: { fillColor: accentColor === '#F4D03F' ? [244, 208, 63] : accentColor as any },
        });

        doc.save(`sensors_${meterType.toLowerCase()}.pdf`);
        toast.success('PDF exported successfully');
    };

    if (loading && meters.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
                <p className="text-gray-500 font-medium">Synchronizing sensor data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <FirstStepsBanner onTabChange={onTabChange} />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[#10b981] bg-[#064e3b] mb-4">
                        <Activity className="w-3.5 h-3.5 text-[#facc15]" />
                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Operational Registry</span>
                    </div>
                    <h1 className="text-5xl font-black text-[#064e3b] tracking-tighter uppercase leading-none">Sensor <span className="text-[#10b981]">Registry</span> <span className="text-[#064e3b]/20">·</span> {title}</h1>
                </div>
            </div>

            <div className="bg-white border-4 border-[#064e3b] rounded-none p-8 shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
                {!isAddingMeter ? (
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h3 className="text-xl font-black text-[#064e3b] uppercase tracking-tighter">Add {meterType} Sensor</h3>
                            <p className="text-[10px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em] mt-1">Configure serial identifier and deployment coordinates</p>
                        </div>
                        <Button
                            onClick={() => setIsAddingMeter(true)}
                            className="rounded-none px-8 bg-[#064e3b] text-gray-900 hover:bg-[#10b981] border-2 border-[#064e3b] font-black uppercase text-xs h-12 transition-none shadow-[4px_4px_0px_0px_rgba(16,185,129,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                        >
                            ENROLL DEVICE
                        </Button>
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-top duration-300 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-black text-[#064e3b] uppercase tracking-tighter">Device Parameterization</h3>
                            <Button variant="ghost" size="sm" onClick={() => setIsAddingMeter(false)} className="text-[#064e3b] hover:bg-[#facc15]/10 rounded-none h-8 w-8 p-0 transition-none border-2 border-[#064e3b]/10"><X className="w-4 h-4" /></Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Input placeholder="SERIAL IDENTIFIER" className="h-12 rounded-none border-4 border-[#064e3b] font-black text-xs uppercase focus-visible:ring-0 focus-visible:bg-[#facc15]/5 transition-none" />
                            <Select><SelectTrigger className="h-12 rounded-none border-4 border-[#064e3b] font-black text-xs uppercase focus:ring-0 transition-none"><SelectValue placeholder="APIARY" /></SelectTrigger></Select>
                            <Input placeholder="HIVE / STATION" className="h-12 rounded-none border-4 border-[#064e3b] font-black text-xs uppercase focus-visible:ring-0 focus-visible:bg-[#facc15]/5 transition-none" />
                            <Button className="h-12 rounded-none font-black uppercase text-xs bg-[#064e3b] hover:bg-[#10b981] text-gray-900 border-2 border-[#064e3b] transition-none shadow-[4px_4px_0px_0px_rgba(16,185,129,1)] active:shadow-none active:translate-x-1 active:translate-y-1">COMMIT ENROLLMENT</Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Buildings Grid */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-[#10b981]" />
                        <h3 className="text-xl font-black text-[#064e3b] uppercase tracking-tighter leading-none">Infrastructure <span className="text-[#10b981]">Status</span></h3>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setBuildingsOpen(!buildingsOpen)} className="text-[#064e3b]/30 font-black uppercase text-[10px] tracking-widest gap-2 hover:bg-[#facc15]/10">
                        {buildingsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {buildingsOpen ? 'FOLD VIEW' : 'EXPAND VIEW'}
                    </Button>
                </div>
                {buildingsOpen && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {buildings.map(b => (
                            <Card key={b.id} className="p-6 rounded-none border-4 border-[#064e3b] bg-white shadow-[6px_6px_0px_0px_rgba(6,78,59,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group overflow-hidden border-l-[12px] border-l-[#10b981]">
                                <h4 className="text-lg font-black text-[#064e3b] uppercase tracking-tighter truncate">{b.name}</h4>
                                <p className="text-[9px] font-black text-[#064e3b]/30 uppercase tracking-[0.1em] mt-1 line-clamp-1">{b.address}</p>
                                <div className="mt-6 flex items-center justify-between">
                                    <div className="bg-[#064e3b] text-gray-900 px-2 py-0.5 border-2 border-[#10b981] text-[8px] font-black uppercase tracking-[0.2em] shadow-[3px_3px_0px_0px_rgba(16,185,129,1)]">
                                        {meters.filter(m => m.building_id === b.id).length} DEVICES
                                    </div>
                                    <div className="w-8 h-8 rounded-none bg-neutral-50 flex items-center justify-center border-2 border-[#064e3b]/10">
                                        <Activity className="w-4 h-4 text-[#10b981]" />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white border-4 border-[#064e3b] rounded-none p-6 shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em] ml-1">Apiary Area</label>
                        <Select value={buildingFilter} onValueChange={setBuildingFilter}>
                            <SelectTrigger className="h-10 rounded-none border-4 border-[#064e3b] font-black text-[10px] uppercase focus:ring-0 transition-none"><SelectValue placeholder="All" /></SelectTrigger>
                            <SelectContent className="rounded-none border-2 border-[#064e3b]">
                                <SelectItem value="all" className="uppercase font-black text-[10px]">All apiaries</SelectItem>
                                {buildings.map(b => <SelectItem key={b.id} value={b.id} className="uppercase font-black text-[10px]">{b.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em] ml-1">Hive / Station</label>
                        <Select value={apartmentFilter} onValueChange={setApartmentFilter}>
                            <SelectTrigger className="h-10 rounded-none border-4 border-[#064e3b] font-black text-[10px] uppercase focus:ring-0 transition-none"><SelectValue placeholder="All" /></SelectTrigger>
                            <SelectContent className="rounded-none border-2 border-[#064e3b]">
                                <SelectItem value="all" className="uppercase font-black text-[10px]">All hives</SelectItem>
                                {filteredUnits.map(a => <SelectItem key={a.id} value={a.id} className="uppercase font-black text-[10px]">{a.unit_number}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em] ml-1">Status</label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-10 rounded-none border-4 border-[#064e3b] font-black text-[10px] uppercase focus:ring-0 transition-none"><SelectValue placeholder="All" /></SelectTrigger>
                            <SelectContent className="rounded-none border-2 border-[#064e3b]">
                                <SelectItem value="all" className="uppercase font-black text-[10px]">All</SelectItem>
                                <SelectItem value="ok" className="uppercase font-black text-[10px]">OK</SelectItem>
                                <SelectItem value="warning" className="uppercase font-black text-[10px]">Warning</SelectItem>
                                <SelectItem value="alert" className="uppercase font-black text-[10px]">Alert</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="lg:col-span-3 space-y-2">
                        <label className="text-[9px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em] ml-1">Search Identifier</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#064e3b]/30" />
                            <Input
                                placeholder="Search by sensor ID or deployment coordinates..."
                                className="h-10 rounded-none pl-12 border-4 border-[#064e3b] bg-white font-black text-[10px] uppercase focus-visible:ring-0 focus-visible:bg-[#facc15]/5 transition-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* List */}
            <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[12px_12px_0px_0px_rgba(6,78,59,1)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-4 border-[#064e3b] bg-neutral-50/50">
                                {['Sensor Identifier', 'Deployment Location', 'Telemetry Load', 'Protocol Status', 'Actions'].map(h => (
                                    <th key={h} className="text-left py-6 px-8 text-[10px] font-black text-[#064e3b]/40 uppercase tracking-[0.2em]">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-neutral-50">
                            {filteredMeters.length === 0 ? (
                                <tr><td colSpan={5} className="py-20 text-center text-gray-400">No matching meters found</td></tr>
                            ) : (
                                filteredMeters.map(meter => (
                                    <tr key={meter.id} className="group hover:bg-[#facc15]/5 transition-none">
                                        <td className="py-6 px-8">
                                            <div className="flex items-center gap-4">
                                                <div className={cn("w-10 h-10 rounded-none bg-[#064e3b] flex items-center justify-center border-2 border-[#10b981] text-gray-900")}>
                                                    {meterType === 'Water' && <Droplet className="w-5 h-5" />}
                                                    {meterType === 'Heat' && <Flame className="w-5 h-5" />}
                                                    {meterType === 'Energy' && <Zap className="w-5 h-5" />}
                                                    {meterType === 'Other' && <Box className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-[#064e3b] uppercase tracking-tighter">{meter.meter_number}</p>
                                                    <p className="text-[9px] font-black text-[#064e3b]/30 uppercase tracking-widest mt-0.5">{meter.meter_code}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-8">
                                            <p className="text-[11px] font-black text-[#064e3b] uppercase tracking-tight">{getBuildingName(meter.building_id)}</p>
                                            <p className="text-[9px] font-black text-[#10b981] uppercase tracking-widest mt-0.5">Unit: {getApartmentNumber(meter.apartment_id)}</p>
                                        </td>
                                        <td className="py-6 px-8">
                                            <p className="text-[11px] font-black text-[#064e3b] uppercase">{meter.last_reading_value} {meter.last_reading_unit}</p>
                                            <p className="text-[9px] font-black text-[#064e3b]/30 uppercase tracking-widest mt-0.5">{meter.last_reading_at ? new Date(meter.last_reading_at).toLocaleDateString() : 'ARCHIVE_N/A'}</p>
                                        </td>
                                        <td className="py-6 px-8">
                                            <Badge className={cn(
                                                "rounded-none border-2 text-[8px] font-black px-3 py-1 uppercase tracking-[0.2em] shadow-[3px_3px_0px_0px_rgba(6,78,59,1)]",
                                                meter.status === 'OK' ? "bg-[#10b981] text-gray-900 border-[#064e3b]" :
                                                    meter.status === 'WARNING' ? "bg-[#facc15] text-[#064e3b] border-[#064e3b]" : "bg-red-500 text-gray-900 border-[#064e3b]"
                                            )}>
                                                {meter.status === 'OK' ? 'NOMINAL' : meter.status}
                                            </Badge>
                                        </td>
                                        <td className="py-6 px-8">
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none border-2 border-[#064e3b]/10 bg-white text-[#064e3b] hover:bg-[#facc15]/10 transition-none"><Info className="w-4 h-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none border-2 border-[#064e3b]/10 bg-white text-[#064e3b] hover:bg-[#10b981] hover:text-gray-900 transition-none" onClick={() => generatePDF()}><Download className="w-4 h-4" /></Button>
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
            <Card className="p-10 rounded-none border-4 border-[#064e3b] bg-white shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h3 className="text-[10px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em]">Telemetry Export</h3>
                        <p className="text-xl font-black text-[#064e3b] uppercase tracking-tighter mt-1">Archive System Records</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <Button variant="outline" size="sm" onClick={() => handleExport('CSV')} className="h-12 px-6 rounded-none border-2 border-[#064e3b] text-[10px] font-black uppercase tracking-widest text-[#064e3b] hover:bg-[#064e3b] hover:text-gray-900 transition-none gap-3">
                            <FileText className="w-4 h-4" /> CSV BATCH
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleExport('XLS')} className="h-12 px-6 rounded-none border-2 border-[#064e3b] text-[10px] font-black uppercase tracking-widest text-[#064e3b] hover:bg-[#10b981] hover:text-gray-900 transition-none gap-3">
                            <FileSpreadsheet className="w-4 h-4" /> EXCEL MATRIX
                        </Button>
                        <Button size="sm" onClick={() => handleExport('PDF')} className="h-12 px-8 rounded-none bg-[#064e3b] text-gray-900 hover:bg-[#10b981] border-2 border-[#064e3b] text-[10px] font-black uppercase tracking-widest transition-none gap-3 shadow-[4px_4px_0px_0px_rgba(16,185,129,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
                            {downloading === 'PDF' ? <Loader2 className="w-4 h-4 animate-spin text-[#facc15]" /> : <Download className="w-5 h-5 text-[#facc15]" />}
                            PDF OPERATIONAL REPORT
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default MetersListBase;
