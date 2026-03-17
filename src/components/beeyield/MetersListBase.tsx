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
import { glass } from './GlassTheme';
import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';

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
    const [enrollMeterNumber, setEnrollMeterNumber] = React.useState('');
    const [enrollBuildingId, setEnrollBuildingId] = React.useState<string>('');
    const [enrollApartmentId, setEnrollApartmentId] = React.useState<string>('');
    const [enrolling, setEnrolling] = React.useState(false);

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
                if (!enrollBuildingId && bData?.length) setEnrollBuildingId(bData[0].id);
            } catch (error) {
                console.error(`Failed to load ${meterType} meters`, error);
                toast.error(`Failed to load ${meterType} meter data`);
            } finally {
                setLoading(false);
            }
        };
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [meterType]);

    React.useEffect(() => {
        if (!enrollBuildingId) return;
        const firstUnit = apartments.find(a => a.building_id === enrollBuildingId);
        setEnrollApartmentId(firstUnit?.id || '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enrollBuildingId]);

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
        'Other': 'text-gray-500 fill-gray-500 bg-[#F9F7F2]'
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

    const refreshMeters = async () => {
        const mData = await meterService.getMeters({ meter_type: meterType });
        setMeters(mData);
    };

    const handleEnroll = async () => {
        if (enrolling) return;
        const meter_number = enrollMeterNumber.trim();
        if (!meter_number) return toast.error('Serial number is required');
        if (!enrollBuildingId) return toast.error('Select a location');

        setEnrolling(true);
        const tid = toast.loading('Adding meter…');
        try {
            await meterService.createMeter({
                meter_number,
                meter_type: meterType,
                building_id: enrollBuildingId,
                apartment_id: enrollApartmentId || undefined,
                status: 'OK',
            });
            toast.success('Meter added.', { id: tid });
            setEnrollMeterNumber('');
            setIsAddingMeter(false);
            await refreshMeters();
        } catch (e: any) {
            console.error(e);
            toast.error(e?.message || 'Could not add meter', { id: tid });
        } finally {
            setEnrolling(false);
        }
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
            <BeeYieldPageShell className="p-0 md:p-0 -m-4 md:-m-6 space-y-0 pb-0">
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 p-4 md:p-6">
                    <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
                    <p className="text-gray-500 font-medium">Synchronizing sensor data...</p>
                </div>
            </BeeYieldPageShell>
        );
    }

    return (
        <BeeYieldPageShell className="p-0 md:p-0 -m-4 md:-m-6 space-y-0 pb-0">
            <div className="space-y-6 animate-in fade-in duration-500 pb-20 p-4 md:p-6">
                <FirstStepsBanner onTabChange={onTabChange} />

                <BeeYieldPageHeader
                    icon={Activity}
                    label="Meters"
                    title={<>Sensor <span className="text-[#F4D03F]">Registry</span> <span className="text-gray-300">·</span> {title}</>}
                    subtitle="Manage meters and view recent readings."
                />

            <div className={cn(glass.card, "p-5 bg-white/40 backdrop-blur-xl border-white/20 rounded-[2.5rem] shadow-xl")}>
                {!isAddingMeter ? (
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-[0.2em]">Add {meterType} meter</h3>
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Enter the serial number and pick a location.</p>
                        </div>
                        <button
                            onClick={() => setIsAddingMeter(true)}
                            className={cn(glass.btnPrimary, "h-9 px-6 font-black uppercase text-[9px] tracking-[0.2em]")}
                        >
                            Add meter
                        </button>
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-top duration-300 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-[0.2em]">Meter details</h3>
                            <button
                                onClick={() => setIsAddingMeter(false)}
                                className="text-gray-400 hover:bg-white/50 hover:text-[#1A1A1A] rounded-xl h-8 w-8 p-0 flex justify-center items-center transition-colors"
                                aria-label="Close"
                                title="Close"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <Input
                                value={enrollMeterNumber}
                                onChange={(e) => setEnrollMeterNumber(e.target.value)}
                                placeholder="Serial number"
                                className="h-9 bg-white/50 border-white/40 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] focus-visible:bg-white"
                            />
                            <Select value={enrollBuildingId} onValueChange={setEnrollBuildingId}>
                                <SelectTrigger className="h-9 bg-white/50 border-white/40 rounded-xl text-[9px] font-black uppercase tracking-[0.2em]">
                                    <SelectValue placeholder="Location" />
                                </SelectTrigger>
                                <SelectContent>
                                    {buildings.map((b) => (
                                        <SelectItem key={b.id} value={b.id}>
                                            {b.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={enrollApartmentId} onValueChange={setEnrollApartmentId}>
                                <SelectTrigger className="h-9 bg-white/50 border-white/40 rounded-xl text-[9px] font-black uppercase tracking-[0.2em]">
                                    <SelectValue placeholder="Hive (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">None</SelectItem>
                                    {filteredUnits.map((a) => (
                                        <SelectItem key={a.id} value={a.id}>
                                            {a.unit_number}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <button
                                onClick={handleEnroll}
                                disabled={enrolling}
                                className={cn(glass.btnPrimary, "h-9 font-black uppercase text-[9px] tracking-[0.2em]")}
                            >
                                {enrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                Add meter
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Buildings Grid */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/50 flex items-center justify-center border border-white/40">
                            <Building2 className="w-4 h-4 text-[#1B9157]" />
                        </div>
                        <h3 className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-[0.2em] leading-none">INFRASTRUCTURE_<span className="text-[#1B9157]">STATUS</span></h3>
                    </div>
                    <button onClick={() => setBuildingsOpen(!buildingsOpen)} className="text-gray-400 font-black uppercase text-[8px] tracking-[0.2em] gap-1.5 hover:bg-white/40 flex items-center px-2 py-1 rounded-lg">
                        {buildingsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        {buildingsOpen ? 'FOLD_VIEW' : 'EXPAND_VIEW'}
                    </button>
                </div>
                {buildingsOpen && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {buildings.map(b => (
                            <div key={b.id} className={cn(glass.card, "p-4 bg-white/40 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all group overflow-hidden border-l-[6px] border-l-[#1B9157] rounded-2xl flex flex-col justify-between")}>
                                <div>
                                    <h4 className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-[0.2em] truncate">{b.name}</h4>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1 line-clamp-1">{b.address}</p>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="bg-[#1B9157]/10 text-[#1B9157] px-2 py-0.5 border border-[#1B9157]/20 rounded-md text-[8px] font-black uppercase tracking-[0.2em]">
                                        {meters.filter(m => m.building_id === b.id).length} DEVICES
                                    </div>
                                    <div className="w-6 h-6 rounded-lg bg-white/50 flex items-center justify-center border border-white/40">
                                        <Activity className="w-3 h-3 text-[#1B9157]" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className={cn(glass.card, "p-5 bg-white/40 backdrop-blur-xl border-white/20 rounded-[2.5rem] shadow-xl")}>
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <div className="space-y-2">
                        <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">APIARY_AREA</label>
                        <Select value={buildingFilter} onValueChange={setBuildingFilter}>
                            <SelectTrigger className="h-9 bg-white/50 border-white/40 rounded-xl text-[9px] font-black uppercase tracking-[0.2em]"><SelectValue placeholder="ALL" /></SelectTrigger>
                            <SelectContent className="rounded-xl border border-white/40 shadow-lg bg-white/90 backdrop-blur-xl">
                                <SelectItem value="all" className="uppercase font-black text-[8px] tracking-[0.2em]">ALL_APIARIES</SelectItem>
                                {buildings.map(b => <SelectItem key={b.id} value={b.id} className="uppercase font-black text-[8px] tracking-[0.2em]">{b.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">HIVE_STATION</label>
                        <Select value={apartmentFilter} onValueChange={setApartmentFilter}>
                            <SelectTrigger className="h-9 bg-white/50 border-white/40 rounded-xl text-[9px] font-black uppercase tracking-[0.2em]"><SelectValue placeholder="ALL" /></SelectTrigger>
                            <SelectContent className="rounded-xl border border-white/40 shadow-lg bg-white/90 backdrop-blur-xl">
                                <SelectItem value="all" className="uppercase font-black text-[8px] tracking-[0.2em]">ALL_HIVES</SelectItem>
                                {filteredUnits.map(a => <SelectItem key={a.id} value={a.id} className="uppercase font-black text-[8px] tracking-[0.2em]">{a.unit_number}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">STATUS</label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-9 bg-white/50 border-white/40 rounded-xl text-[9px] font-black uppercase tracking-[0.2em]"><SelectValue placeholder="ALL" /></SelectTrigger>
                            <SelectContent className="rounded-xl border border-white/40 shadow-lg bg-white/90 backdrop-blur-xl">
                                <SelectItem value="all" className="uppercase font-black text-[8px] tracking-[0.2em]">ALL</SelectItem>
                                <SelectItem value="ok" className="uppercase font-black text-[8px] tracking-[0.2em]">OK</SelectItem>
                                <SelectItem value="warning" className="uppercase font-black text-[8px] tracking-[0.2em]">WARNING</SelectItem>
                                <SelectItem value="alert" className="uppercase font-black text-[8px] tracking-[0.2em]">ALERT</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="lg:col-span-3 space-y-2">
                        <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">SEARCH_IDENTIFIER</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <Input
                                placeholder="SEARCH BY SENSOR ID OR COORDINATES..."
                                className="h-9 rounded-xl pl-9 bg-white/50 border-white/40 font-black text-[9px] uppercase focus-visible:bg-white tracking-[0.2em]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className={cn(glass.card, "p-0 overflow-hidden shadow-xl bg-white/40 backdrop-blur-xl border-white/20 rounded-[2.5rem]")}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/20 bg-white/30">
                                {['SENSOR_IDENTIFIER', 'DEPLOYMENT_LOCATION', 'TELEMETRY_LOAD', 'STATUS', 'ACTIONS'].map(h => (
                                    <th key={h} className="text-left py-4 px-5 text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {filteredMeters.length === 0 ? (
                                <tr><td colSpan={5} className="py-20 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">NO_MATCHING_METERS_FOUND</td></tr>
                            ) : (
                                filteredMeters.map(meter => (
                                    <tr key={meter.id} className="group hover:bg-white/50 transition-colors">
                                        <td className="py-4 px-5">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center border border-white/40 shadow-sm bg-white/60 text-[#1A1A1A]")}>
                                                    {meterType === 'Water' && <Droplet className="w-4 h-4 text-blue-500" />}
                                                    {meterType === 'Heat' && <Flame className="w-4 h-4 text-[#F4D03F]" />}
                                                    {meterType === 'Energy' && <Zap className="w-4 h-4 text-[#1B9157]" />}
                                                    {meterType === 'Other' && <Box className="w-4 h-4 text-gray-500" />}
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-[0.2em]">{meter.meter_number}</p>
                                                    <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">{meter.meter_code}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-5">
                                            <p className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest">{getBuildingName(meter.building_id)}</p>
                                            <p className="text-[8px] font-bold text-[#1B9157] uppercase tracking-widest mt-0.5">UNIT: {getApartmentNumber(meter.apartment_id)}</p>
                                        </td>
                                        <td className="py-4 px-5">
                                            <p className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest">{meter.last_reading_value} {meter.last_reading_unit}</p>
                                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{meter.last_reading_at ? new Date(meter.last_reading_at).toLocaleDateString() : 'ARCHIVE_N/A'}</p>
                                        </td>
                                        <td className="py-4 px-5">
                                            <span className={cn(
                                                "rounded-md border px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.2em] shadow-sm",
                                                meter.status === 'OK' ? "bg-green-500/10 text-[#1B9157] border-green-500/20" :
                                                    meter.status === 'WARNING' ? "bg-[#F4D03F]/10 text-[#F4D03F] border-[#F4D03F]/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                                            )}>
                                                {meter.status === 'OK' ? 'NOMINAL' : meter.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-5">
                                            <div className="flex gap-2">
                                                <button
                                                    className="h-8 w-8 rounded-xl bg-white/50 border border-white/40 flex items-center justify-center text-gray-500 hover:bg-white hover:text-[#1A1A1A] transition-colors"
                                                    aria-label="Meter details"
                                                    title="Meter details"
                                                >
                                                    <Info className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    className="h-8 w-8 rounded-xl bg-[#1B9157]/10 border border-[#1B9157]/20 flex items-center justify-center text-[#1B9157] hover:bg-[#1B9157] hover:text-white transition-colors"
                                                    onClick={() => generatePDF()}
                                                    aria-label="Download report"
                                                    title="Download report"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Export Section */}
            <div className={cn(glass.card, "p-6 shadow-xl bg-white/40 backdrop-blur-xl border-white/20 rounded-[2.5rem]")}>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">TELEMETRY_EXPORT</h3>
                        <p className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-[0.2em] mt-1">ARCHIVE_SYSTEM_RECORDS</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button onClick={() => handleExport('CSV')} className={cn(glass.btnSecondary, "h-9 px-5 bg-white/50 border-white/40 text-[9px] font-black uppercase tracking-[0.2em] gap-2")}>
                            <FileText className="w-3.5 h-3.5" /> CSV_BATCH
                        </button>
                        <button onClick={() => handleExport('XLS')} className={cn(glass.btnSecondary, "h-9 px-5 bg-white/50 border-white/40 text-[9px] font-black uppercase tracking-[0.2em] gap-2")}>
                            <FileSpreadsheet className="w-3.5 h-3.5" /> EXCEL_MATRIX
                        </button>
                        <button onClick={() => handleExport('PDF')} className={cn(glass.btnPrimary, "h-9 px-6 text-[9px] font-black uppercase tracking-[0.2em] gap-2")}>
                            {downloading === 'PDF' ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : <Download className="w-3.5 h-3.5" />}
                            PDF_OPERATIONAL_REPORT
                        </button>
                    </div>
                </div>
            </div>
            </div>
        </BeeYieldPageShell>
    );
};

export default MetersListBase;
