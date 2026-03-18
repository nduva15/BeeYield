import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Search, Plus, Download, ChevronDown, ChevronUp,
    Droplet, Flame, Zap, Layers, MapPin, Building2,
    Home, FileText, Settings, Activity, List,
    MoreHorizontal, Filter, SlidersHorizontal, Eye,
    ArrowUpDown, FileInput, CheckCircle2, AlertTriangle,
    XCircle, Clock, BarChart3, Info, Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import FirstStepsBanner from './FirstStepsBanner';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { adminService } from '@/services/adminService';

interface MetersListViewProps {
    type: 'water' | 'heat' | 'energy' | 'other';
    onTabChange: (tab: string) => void;
}

const MetersListView: React.FC<MetersListViewProps> = ({ type, onTabChange }) => {
    const [isBuildingsOpen, setIsBuildingsOpen] = React.useState(true);
    const [isApartmentsOpen, setIsApartmentsOpen] = React.useState(true);
    const [isExportOpen, setIsExportOpen] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState('');

    const title = type.charAt(0).toUpperCase() + type.slice(1);
    const Icon = type === 'water' ? Droplet : type === 'heat' ? Flame : type === 'energy' ? Zap : Layers;

    // Theme colors based on type
    const colors = {
        water: { primary: '#2563EB', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
        heat: { primary: '#F97316', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
        energy: { primary: '#F4D03F', bg: 'bg-[#F4D03F]/20', text: 'text-[#8a7300]', border: 'border-[#F4D03F]/30' },
        other: { primary: '#8B5CF6', bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' }
    }[type];

    const buildings = [
        { name: 'Kibwezi North', address: 'Plot 12A · Makueni - Kibwezi', meters: 1, apartments: 1, coords: '-2.4168, 37.9572' },
        { name: 'Kibwezi East', address: 'Ranch 43 · Makueni Kibwezi', meters: 1, apartments: 0, coords: '-2.4218, 37.9661' },
        { name: 'Kilifi Coast', address: 'Grove 55 · Kilifi - North', meters: 2, apartments: 0, coords: '-3.6343, 39.8515' },
        { name: 'Emali West', address: 'Zone 3 · Makueni - Emali', meters: 2, apartments: 2, coords: '-2.0533, 37.4626' },
        { name: 'Voi Highlands', address: 'Plot 4 · Taita Taveta', meters: 2, apartments: 3, coords: '-3.3906, 38.5610' },
        { name: 'Nanyuki Belt', address: 'Field 5 · Laikipia Central', meters: 1, apartments: 3, coords: '0.0158, 37.0754' },
        { name: 'Machakos Hub', address: 'Plot 10 · Machakos Central', meters: 1, apartments: 3, coords: '-1.5160, 37.2632' },
    ];

    const apartments = [
        { id: 1, name: 'Kibwezi North - Hive 12', location: 'Section A', meters: 1 },
        { id: 2, name: 'Emali West - Hive 21', location: 'Section B', meters: 1 },
        { id: 3, name: 'Emali West - Hive 22', location: 'Section B', meters: 1 },
        { id: 4, name: 'Voi Highlands - Hive 3', location: 'Upper Hill', meters: 1 },
        { id: 5, name: 'Voi Highlands - Hive 4', location: 'Upper Hill', meters: 1 },
    ];

    const meters = [
        {
            id: '1',
            serial: type === 'energy' ? 'ENE-11104' : type === 'water' ? 'WAT-00221' : 'HEA-9901',
            code: '(E-EM-PL-2025)',
            building: 'ul. Zielona 5',
            location: 'Lodz - Polesie',
            apartment: '1',
            medium: title,
            status: 'Alert',
            alarm: true,
            readings: 'Wczoraj 23:11 - 214 kWh'
        },
        {
            id: '2',
            serial: type === 'energy' ? 'ENE-07001' : type === 'water' ? 'WAT-01110' : 'HEA-8821',
            code: '(E-EM-PL-3101)',
            building: 'ul. Kosciuszki 4',
            location: 'Kalisz - Centrum',
            apartment: '2',
            medium: title,
            status: 'OK',
            alarm: false,
            readings: 'Dzisiaj 08:13 - 178 kWh'
        },
        {
            id: '3',
            serial: type === 'energy' ? 'ENE-07002' : type === 'water' ? 'WAT-01111' : 'HEA-5542',
            code: '(E-EM-PL-3102)',
            building: 'ul. Kosciuszki 4',
            location: 'Kalisz - Centrum',
            apartment: '4',
            medium: title,
            status: 'Alert',
            alarm: true,
            readings: 'Wczoraj 22:10 - 585 kWh'
        },
    ];

    const [columns, setColumns] = React.useState([
        { id: 'serial', label: 'Sensor ID', checked: true },
        { id: 'medium', label: 'Type', checked: true },
        { id: 'building', label: 'Apiary/Zone', checked: true },
        { id: 'apartment', label: 'Hive/Unit', checked: true },
        { id: 'status', label: 'Health', checked: true },
        { id: 'readings', label: 'Last Reading', checked: true },
        { id: 'alarm', label: 'Alert', checked: true },
    ]);

    const toggleColumn = (id: string) => {
        setColumns(cols => cols.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
    };

    const exportToPDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(colors.primary === '#F4D03F' ? '#D4AF37' : colors.primary); // Darker yellow for text if energy
        doc.text(`BeeYield ${title} Meter Report`, 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
        doc.text(`Total items: ${meters.length}`, 14, 33);

        const tableHeaders = columns.filter(c => c.checked).map(c => c.label);
        const tableData = meters.map(m => {
            const row: any[] = [];
            if (columns.find(c => c.id === 'serial')?.checked) row.push(m.serial);
            if (columns.find(c => c.id === 'medium')?.checked) row.push(m.medium);
            if (columns.find(c => c.id === 'building')?.checked) row.push(m.building);
            if (columns.find(c => c.id === 'apartment')?.checked) row.push(m.apartment);
            if (columns.find(c => c.id === 'status')?.checked) row.push(m.status);
            if (columns.find(c => c.id === 'readings')?.checked) row.push(m.readings);
            if (columns.find(c => c.id === 'alarm')?.checked) row.push(m.alarm ? 'YES' : 'NO');
            return row;
        });

        autoTable(doc, {
            head: [tableHeaders],
            body: tableData,
            startY: 40,
            styles: { fontSize: 8, cellPadding: 3 },
            headStyles: {
                fillColor: colors.primary === '#F4D03F' ? [212, 175, 55] : colors.primary,
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            alternateRowStyles: { fillColor: [250, 250, 250] },
        });

        doc.save(`BeeYield_${title}_Report_${new Date().toISOString().split('T')[0]}.pdf`);

        // Log export activity
        adminService.logActivity({
            activity_type: 'export',
            action: 'generated',
            entity_type: 'meter_report',
            entity_reference: `${title} Report`,
            metadata: { format: 'pdf', meter_type: type, count: meters.length }
        }).catch(() => { });

        adminService.logDocument({
            document_type: 'report',
            document_name: `BeeYield_${title}_Report.pdf`,
            file_format: 'PDF',
            category: 'System Report',
            related_entity_reference: type
        }).catch(() => { });

        toast.success(`${title} PDF report generated successfully`);
    };

    const exportToXLS = () => {
        const dataToExport = meters.map(m => {
            const obj: any = {};
            columns.filter(c => c.checked).forEach(col => {
                if (col.id === 'serial') obj[col.label] = m.serial;
                if (col.id === 'medium') obj[col.label] = m.medium;
                if (col.id === 'building') obj[col.label] = m.building;
                if (col.id === 'apartment') obj[col.label] = m.apartment;
                if (col.id === 'status') obj[col.label] = m.status;
                if (col.id === 'readings') obj[col.label] = m.readings;
                if (col.id === 'alarm') obj[col.label] = m.alarm ? 'YES' : 'NO';
            });
            return obj;
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Meters");

        // Add some basic styling or just export
        XLSX.writeFile(workbook, `BeeYield_${title}_Data_${new Date().toISOString().split('T')[0]}.xlsx`);

        // Log export activity
        adminService.logActivity({
            activity_type: 'export',
            action: 'downloaded',
            entity_type: 'meter_data',
            entity_reference: `${title} Data`,
            metadata: { format: 'xlsx', meter_type: type, count: meters.length }
        }).catch(() => { });

        toast.success(`${title} Excel data exported successfully`);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-xl font-black tracking-tighter italic text-[#1A1A1A]">
                    Meter Registry <span style={{ color: colors.primary }} className="ml-2">— {title}</span>
                </h1>
                <div className="flex gap-2">
                    <button className={cn(glass.btnPrimary, "h-8 px-5 rounded-xl text-[9px] font-black shadow-sm flex items-center gap-2")}>
                        <Plus className="w-3.5 h-3.5" /> Add Sensor
                    </button>
                </div>
            </div>

            {/* Buildings Collapsible */}
            <Collapsible open={isBuildingsOpen} onOpenChange={setIsBuildingsOpen} className="w-full">
                <div className={cn(glass.card, "p-0 bg-white/40 border-white/20 shadow-xl overflow-hidden")}>
                    <div className="p-5 flex items-center justify-between border-b border-white/10">
                        <div>
                            <h2 className="text-[11px] font-black text-[#1A1A1A] flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-gray-400" />
                                Apiaries
                            </h2>
                            <p className="text-[9px] font-black text-gray-400 mt-1">Overview Of Addresses With Sensor Counts</p>
                        </div>
                        <CollapsibleTrigger asChild>
                            <button className={cn(glass.btnSecondary, "h-8 px-4 font-black text-[9px] rounded-xl border-white/40 flex items-center gap-2")}>
                                {isBuildingsOpen ? <><ChevronUp className="w-3.5 h-3.5" />Collapse</> : <><ChevronDown className="w-3.5 h-3.5" />Expand</>}
                            </button>
                        </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent>
                        <div className="p-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {buildings.map((building, i) => (
                                    <div key={i} className="bg-white/50 border border-white/40 rounded-2xl p-4 shadow-sm hover:bg-white/80 transition-all group">
                                        <h4 className="text-[10px] font-black text-[#1A1A1A] mb-1">{building.name}</h4>
                                        <p className="text-[9px] font-bold text-gray-400 leading-tight mb-3 min-h-[2.5em]">{building.address}</p>

                                        <div className="flex gap-2 mb-3">
                                            <Badge variant="secondary" className="bg-white/50 text-[#1A1A1A]/60 text-[8px] px-2 py-0.5 font-black border border-white/40 rounded-lg">
                                                Sensors: {building.meters}
                                            </Badge>
                                            <Badge variant="secondary" className="bg-white/50 text-[#1A1A1A]/60 text-[8px] px-2 py-0.5 font-black border border-white/40 rounded-lg">
                                                Hives: {building.apartments}
                                            </Badge>
                                        </div>

                                        <div className="space-y-1 mt-4 pt-3 border-t border-white/40">
                                            <p className="text-[8px] text-gray-400 font-black">Coordinates: {building.coords}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CollapsibleContent>
                </div>
            </Collapsible>

            {/* Apartments Collapsible */}
            <Collapsible open={isApartmentsOpen} onOpenChange={setIsApartmentsOpen} className="w-full">
                <div className={cn(glass.card, "p-0 bg-white/40 border-white/20 shadow-xl overflow-hidden")}>
                    <div className="p-5 flex items-center justify-between border-b border-white/10">
                        <div>
                            <h2 className="text-[11px] font-black text-[#1A1A1A] flex items-center gap-2">
                                <Home className="w-4 h-4 text-gray-400" />
                                Hives & Units
                            </h2>
                            <p className="text-[9px] font-black text-gray-400 mt-1">Hive List With Assigned Sensors</p>
                        </div>
                        <CollapsibleTrigger asChild>
                            <button className={cn(glass.btnSecondary, "h-8 px-4 font-black text-[9px] rounded-xl border-white/40 flex items-center gap-2")}>
                                {isApartmentsOpen ? <><ChevronUp className="w-3.5 h-3.5" />Collapse</> : <><ChevronDown className="w-3.5 h-3.5" />Expand</>}
                            </button>
                        </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent>
                        <div className="p-0">
                            <div className="divide-y divide-white/20">
                                {apartments.map((apt) => (
                                    <div key={apt.id} className="p-4 px-5 flex items-center justify-between hover:bg-white/40 transition-colors">
                                        <div>
                                            <h4 className="text-[10px] font-black text-[#1A1A1A]">{apt.name}</h4>
                                            <p className="text-[9px] font-bold text-gray-400 mt-0.5">{apt.location}</p>
                                        </div>
                                        <Badge variant="secondary" className="bg-white/50 text-[#1A1A1A]/60 text-[8px] px-2 py-0.5 font-black border border-white/40 rounded-lg">
                                            Sensors: {apt.meters}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CollapsibleContent>
                </div>
            </Collapsible>

            {/* Filters */}
            <div className={cn(glass.card, "p-5 bg-white/40 border-white/20 shadow-sm")}>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[9px] text-[#1A1A1A]/50 font-black">Type</label>
                        <div className="flex gap-2 p-1 bg-white/50 border border-white/40 rounded-xl h-9">
                            <button className={cn("rounded-lg h-7 w-8 flex items-center justify-center transition-all", type === 'heat' && "bg-white shadow-sm")} onClick={() => onTabChange('meters-heat')}>
                                <Flame className={cn("w-3.5 h-3.5", type === 'heat' ? "text-orange-500" : "text-gray-400")} />
                            </button>
                            <button className={cn("rounded-lg h-7 w-8 flex items-center justify-center transition-all", type === 'water' && "bg-white shadow-sm")} onClick={() => onTabChange('meters-water')}>
                                <Droplet className={cn("w-3.5 h-3.5", type === 'water' ? "text-blue-500" : "text-gray-400")} />
                            </button>
                            <button className={cn("rounded-lg h-7 w-8 flex items-center justify-center transition-all", type === 'energy' && "bg-white shadow-sm")} onClick={() => onTabChange('meters-energy')}>
                                <Zap className={cn("w-3.5 h-3.5", type === 'energy' ? "text-yellow-500" : "text-gray-400")} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] text-[#1A1A1A]/50 font-black">Apiary</label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <select id="filter-apiary" name="apiary" className={cn(glass.select, "w-full h-9 pl-9 pr-4 bg-white/50 border-white/40 focus:bg-white rounded-xl text-[9px] font-black appearance-none cursor-pointer")}>
                                <option value="">All Apiaries</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] text-[#1A1A1A]/50 font-black">Hive</label>
                        <div className="relative">
                            <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <select id="filter-hive" name="hive" className={cn(glass.select, "w-full h-9 pl-9 pr-4 bg-white/50 border-white/40 focus:bg-white rounded-xl text-[9px] font-black appearance-none cursor-pointer")}>
                                <option value="">All Hives</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] text-[#1A1A1A]/50 font-black">Health</label>
                        <div className="relative">
                            <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <select id="filter-status" name="status" className={cn(glass.select, "w-full h-9 pl-9 pr-4 bg-white/50 border-white/40 focus:bg-white rounded-xl text-[9px] font-black appearance-none cursor-pointer")}>
                                <option value="">All Statuses</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] text-[#1A1A1A]/50 font-black">Level</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <select id="filter-level" name="reading-level" className={cn(glass.select, "w-full h-9 pl-9 pr-4 bg-white/50 border-white/40 focus:bg-white rounded-xl text-[9px] font-black appearance-none cursor-pointer")}>
                                <option value="">All Levels</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] text-[#1A1A1A]/50 font-black">Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                                id="meter-search"
                                name="meter-search"
                                placeholder="Sensor ID..."
                                className={cn(glass.input, "w-full h-9 pl-9 bg-white/50 border-white/40 focus:bg-white rounded-xl text-[9px] font-black placeholder:text-gray-400")}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Export Collapsible */}
            <Collapsible open={isExportOpen} onOpenChange={setIsExportOpen} className="w-full">
                <div className={cn(glass.card, "p-0 bg-white/40 border-white/20 shadow-xl overflow-hidden")}>
                    <div className="p-5 flex items-center justify-between border-b border-white/10">
                        <div>
                            <h2 className="text-[11px] font-black text-[#1A1A1A] flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-400" />
                                Export List
                            </h2>
                            <p className="text-[9px] font-black text-gray-400 mt-1">Download Filtered Dataset</p>
                        </div>
                        <CollapsibleTrigger asChild>
                            <button className={cn(glass.btnSecondary, "h-8 px-4 font-black text-[9px] rounded-xl border-white/40 flex items-center gap-2")}>
                                {isExportOpen ? <><ChevronUp className="w-3.5 h-3.5" />Collapse</> : <><ChevronDown className="w-3.5 h-3.5" />Expand</>}
                            </button>
                        </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent>
                        <div className="p-6 bg-white/30">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div>
                                    <h4 className="text-[9px] font-black text-gray-400 mb-4">Data Columns</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-2">
                                        {columns.map(col => (
                                            <div key={col.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={col.id}
                                                    checked={col.checked}
                                                    onCheckedChange={() => toggleColumn(col.id)}
                                                    className="data-[state=checked]:bg-[#1A1A1A] data-[state=checked]:border-[#1A1A1A] border-gray-300 pointer-events-auto"
                                                />
                                                <label htmlFor={col.id} className="text-[9px] font-black text-[#1A1A1A] leading-none cursor-pointer">
                                                    {col.label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <h4 className="text-[9px] font-black text-gray-400">Output Formats</h4>
                                    <div className="flex flex-wrap gap-4">
                                        <button onClick={exportToPDF} className={cn(glass.btnPrimary, "h-10 flex-1 min-w-[150px] font-black text-[9px] rounded-xl")}>
                                            <FileText className="w-3.5 h-3.5 mr-2" /> Portable Document Format
                                        </button>
                                        <button onClick={exportToXLS} className={cn(glass.btnSecondary, "h-10 flex-1 min-w-[150px] font-black text-[9px] rounded-xl border-white/40 bg-white/50 hover:bg-white")}>
                                            <Layers className="w-3.5 h-3.5 mr-2 text-[#1B9157]" /> Excel Spreadsheet
                                        </button>
                                    </div>
                                    <p className="text-[8px] font-bold text-slate-400">* All reports generated via client filter</p>
                                </div>
                            </div>
                        </div>
                    </CollapsibleContent>
                </div>
            </Collapsible>

            {/* Meters Table */}
            <div className={cn(glass.card, "p-0 shadow-xl overflow-hidden bg-white/40 border-white/20")}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/20 bg-white/30">
                                <th className="px-5 py-4 text-[8px] font-black text-gray-400">Sensor Type</th>
                                <th className="px-5 py-4 text-[8px] font-black text-gray-400">Apiary Zone</th>
                                <th className="px-5 py-4 text-[8px] font-black text-gray-400">Hive Unit</th>
                                <th className="px-5 py-4 text-[8px] font-black text-gray-400">Sensor Id</th>
                                <th className="px-5 py-4 text-[8px] font-black text-gray-400">Last Reading</th>
                                <th className="px-5 py-4 text-[8px] font-black text-gray-400">Health</th>
                                <th className="px-5 py-4 text-[8px] font-black text-gray-400">Alert</th>
                                <th className="px-5 py-4 text-[8px] font-black text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {meters.map((meter) => (
                                <tr key={meter.id} className="hover:bg-white/50 transition-colors group">
                                    <td className="px-5 py-3">
                                        <Badge variant="outline" className={cn(
                                            "border-0 rounded-lg gap-1.5 pl-1.5 pr-2.5 py-1 text-[8px] font-black",
                                            colors.bg, colors.text
                                        )}>
                                            <Icon className="w-3 h-3" /> {title}
                                        </Badge>
                                    </td>
                                    <td className="px-5 py-3">
                                        <p className="text-[10px] font-black tracking-wider text-[#1A1A1A]">{meter.building}</p>
                                        <p className="text-[8px] font-bold text-gray-400 mt-0.5">{meter.location}</p>
                                    </td>
                                    <td className="px-5 py-3">
                                        <p className="text-[10px] font-black tracking-wider text-gray-600">{meter.apartment}</p>
                                    </td>
                                    <td className="px-5 py-3">
                                        <p className="text-[10px] font-black tracking-wider text-gray-700">{meter.serial}</p>
                                        <p className="text-[8px] font-black text-[#1B9157] mt-0.5">{meter.code}</p>
                                    </td>
                                    <td className="px-5 py-3">
                                        <p className="text-[10px] font-black tracking-wider">{meter.readings}</p>
                                    </td>
                                    <td className="px-5 py-3">
                                        <Badge className={cn(
                                            "border-0 text-[8px] font-black px-2.5 rounded-full shadow-sm",
                                            meter.status === 'OK' ? "bg-green-100 text-[#1B9157]" : "bg-red-100 text-red-700"
                                        )}>
                                            {meter.status}
                                        </Badge>
                                    </td>
                                    <td className="px-5 py-3">
                                        {meter.alarm ? (
                                            <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                                        ) : (
                                            <span className="text-gray-300 font-black text-[9px]">-</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex items-center gap-3">
                                                <button className="flex items-center gap-1.5 text-[8px] font-black text-gray-500 hover:text-[#1B9157] transition-colors">
                                                    <Info className="w-3 h-3" /> DATA
                                                </button>
                                                <button className="flex items-center gap-1.5 text-[8px] font-black text-gray-500 hover:text-[#1B9157] transition-colors">
                                                    <BarChart3 className="w-3 h-3" /> CHARTS
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button className="flex items-center gap-1.5 text-[8px] font-black text-gray-500 hover:text-[#1B9157] transition-colors">
                                                    <FileText className="w-3 h-3" /> PDF
                                                </button>
                                                <button className="flex items-center gap-1.5 text-[8px] font-black text-gray-500 hover:text-[#1B9157] transition-colors">
                                                    <Settings className="w-3 h-3" /> CONFIG
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MetersListView;
