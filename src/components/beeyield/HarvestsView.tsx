import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
    Calendar as CalendarIcon,
    Plus,
    Search,
    Filter,
    Settings,
    LogOut,
    MoreHorizontal,
    Hexagon,
    ShieldCheck,
    Database,
    Link as LinkIcon,
    Droplets,
    Palette,
    Factory,
    ChevronDown
} from 'lucide-react';
import { Switch } from "@/components/ui/switch";

import Logo from '@/assets/Logo.png';

interface HarvestsViewProps {
    onTabChange: (tab: string) => void;
}

const HarvestsView: React.FC<HarvestsViewProps> = ({ onTabChange }) => {
    const [isAddingHarvest, setIsAddingHarvest] = useState(false);
    const [date, setDate] = useState<Date>(new Date());

    // Filter states
    const [selectedPlace, setSelectedPlace] = useState<string>('');
    const [selectedHive, setSelectedHive] = useState<string>('');
    const [quickYear, setQuickYear] = useState<string>('');

    // Form states
    const [amount, setAmount] = useState('');
    const [honeyType, setHoneyType] = useState('');
    const [batchCode, setBatchCode] = useState(`BY-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    const [moisture, setMoisture] = useState('');
    const [colorGrade, setColorGrade] = useState('');
    const [sealOnHoneyChain, setSealOnHoneyChain] = useState(true);

    // Mock Data based on HoneyChain - updated with year mapping
    const [allHarvests, setAllHarvests] = useState([
        { id: 1, apiary: 'Rogulski', families: 4, totalKg: 27.52, perFamily: 6.88, change: '+0.72 kg', batch: 'BY-2024-1182', type: 'Multiflora', verified: true, moisture: 17.5, color: 'White', year: '2024' },
        { id: 2, apiary: 'Caesar', families: 9, totalKg: 52.60, perFamily: 5.84, change: '-0.32 kg', batch: 'BY-2024-2291', type: 'Acacia', verified: true, moisture: 16.2, color: 'Extra Light Amber', year: '2024' },
        { id: 3, apiary: 'North Orchard', families: 12, totalKg: 85.20, perFamily: 7.10, change: '+1.20 kg', batch: 'BY-2025-4421', type: 'Forest', verified: true, moisture: 18.1, color: 'Dark Amber', year: '2025' },
        { id: 4, apiary: 'Rogulski', families: 5, totalKg: 38.45, perFamily: 7.69, change: '+0.81 kg', batch: 'BY-2025-3310', type: 'Acacia', verified: true, moisture: 16.8, color: 'White', year: '2025' },
        { id: 5, apiary: 'Main Valley', families: 15, totalKg: 112.30, perFamily: 7.48, change: '+0.55 kg', batch: 'BY-2026-9901', type: 'Rapeseed', verified: true, moisture: 17.2, color: 'Extra White', year: '2026' },
        { id: 6, apiary: 'Rogulski', families: 6, totalKg: 42.10, perFamily: 7.02, change: '-0.15 kg', batch: 'BY-2026-7782', type: 'Multiflora', verified: true, moisture: 17.8, color: 'White', year: '2026' },
    ]);

    const filteredHarvests = allHarvests.filter(h => h.year === (quickYear || '2026'));

    const [selectedHarvest, setSelectedHarvest] = useState<any>(null);

    const handleSave = () => {
        // Create new harvest object
        const newHarvest = {
            id: allHarvests.length + 1,
            apiary: 'New Harvest', // Placeholder
            families: 0,
            totalKg: parseFloat(amount) || 0,
            perFamily: 0,
            change: '+0.00 kg',
            batch: batchCode,
            type: honeyType || 'Unknown',
            verified: sealOnHoneyChain,
            moisture: parseFloat(moisture) || 17.0,
            color: colorGrade || 'White',
            year: quickYear || '2026'
        };

        setAllHarvests([newHarvest, ...allHarvests]);
        setIsAddingHarvest(false);

        // Reset form
        setAmount('');
        setBatchCode(`BY-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);

        toast.success("Harvest added successfully", {
            description: `Batch ${batchCode} sealed on HoneyChain™`
        });
    };

    if (isAddingHarvest) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <Card className="w-full max-w-2xl bg-[#FFF8F0] dark:bg-[#1a1a1a] border-none shadow-2xl rounded-[2rem] overflow-hidden">
                    <div className="p-8 space-y-8">
                        {/* Header */}
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 flex items-center justify-center">
                                <img src={Logo} alt={String(Logo)} className="w-full h-full object-contain" />
                            </div>
                            <h2 className="text-2xl font-medium text-gray-800 dark:text-gray-100">Add harvest</h2>
                        </div>

                        <div className="space-y-6">
                            {/* Amount Input */}
                            <div className="space-y-2">
                                <Label className="text-gray-600 dark:text-gray-400 font-normal">Amount [kg]*</Label>
                                <Input
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="h-12 bg-white dark:bg-[#2a2a2a] border-gray-200 dark:border-gray-700 rounded-xl text-lg"
                                />
                            </div>

                            {/* Date Input */}
                            <div className="space-y-2">
                                <Label className="text-gray-600 dark:text-gray-400 font-normal">Harvest date</Label>
                                <div className="relative">
                                    <Input
                                        value={format(date, 'M/d/yyyy')}
                                        readOnly
                                        className="h-12 bg-white dark:bg-[#2a2a2a] border-gray-200 dark:border-gray-700 rounded-xl text-lg pr-10"
                                    />
                                    <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                </div>
                            </div>

                            {/* Traceability Section */}
                            <div className="animate-in slide-in-from-bottom-2 duration-500 delay-100">
                                <div className="flex items-center gap-2 mb-4 mt-2">
                                    <Hexagon className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">BeeYield HoneyChain™</span>
                                    <div className="h-px bg-amber-200 flex-1 opacity-50"></div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-gray-500 uppercase">Batch Code</Label>
                                            <div className="relative">
                                                <Database className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                                                <Input
                                                    value={batchCode}
                                                    onChange={(e) => setBatchCode(e.target.value)}
                                                    className="h-10 pl-8 bg-white dark:bg-[#2a2a2a] border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-gray-500 uppercase">Type</Label>
                                            <Select value={honeyType} onValueChange={setHoneyType}>
                                                <SelectTrigger className="h-10 bg-white dark:bg-[#2a2a2a] border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="acacia">Acacia</SelectItem>
                                                    <SelectItem value="multiflora">Multi-flower</SelectItem>
                                                    <SelectItem value="forest">Forest</SelectItem>
                                                    <SelectItem value="rapeseed">Rapeseed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-gray-500 uppercase">Moisture %</Label>
                                            <div className="relative">
                                                <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-cyan-500" />
                                                <Input
                                                    value={moisture}
                                                    onChange={(e) => setMoisture(e.target.value)}
                                                    placeholder="e.g. 17.5"
                                                    className="h-10 pl-8 bg-white dark:bg-[#2a2a2a] border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-gray-500 uppercase">Color Grade</Label>
                                            <div className="relative">
                                                <Palette className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-amber-500" />
                                                <Select value={colorGrade} onValueChange={setColorGrade}>
                                                    <SelectTrigger className="h-10 pl-8 bg-white dark:bg-[#2a2a2a] border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                                        <SelectValue placeholder="Grade" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="water_white">Water White</SelectItem>
                                                        <SelectItem value="extra_white">Extra White</SelectItem>
                                                        <SelectItem value="white">White</SelectItem>
                                                        <SelectItem value="extra_light_amber">Extra Light Amber</SelectItem>
                                                        <SelectItem value="light_amber">Light Amber</SelectItem>
                                                        <SelectItem value="amber">Amber</SelectItem>
                                                        <SelectItem value="dark_amber">Dark Amber</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-colors", sealOnHoneyChain ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400")}>
                                                <ShieldCheck className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Seal on HoneyChain™</p>
                                                <p className="text-[10px] text-gray-500">Immutable traceability record</p>
                                            </div>
                                        </div>
                                        <Switch checked={sealOnHoneyChain} onCheckedChange={setSealOnHoneyChain} className="data-[state=checked]:bg-amber-500" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-4 pt-4">
                            <button
                                onClick={() => setIsAddingHarvest(false)}
                                className="text-amber-700 font-medium text-sm hover:underline"
                            >
                                Go back
                            </button>
                            <button
                                onClick={handleSave}
                                className="text-gray-400 font-medium text-sm hover:text-gray-600"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                    {/* Progress Bar Bottom */}
                    <div className="flex items-center gap-1 px-4 pb-4">
                        <div className="h-2 w-2 rounded-full bg-amber-400/30"></div>
                        <div className="h-2 flex-1 rounded-full bg-amber-400"></div>
                        <div className="h-2 w-2 rounded-full bg-amber-400/30"></div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12 relative">

            <h1 className="text-[2.5rem] font-bold text-[#0F172A] dark:text-white tracking-tight">Harvests</h1>

            {/* Productivity Overview Card */}
            <Card className="rounded-[2rem] border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm overflow-hidden p-1">
                <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">PRODUCTIVITY OVERVIEW</p>
                            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">{quickYear || "2026"}</h2>
                        </div>
                        <div className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm">
                            {quickYear || "2026"}
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">WE ARE PREPARING MORE INSIGHTS FOR THIS SECTION.</span>
                    </div>

                    <div className="mt-8 overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-800">
                                    <th className="text-left py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Apiary / Batch</th>
                                    <th className="text-right py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Productive families</th>
                                    <th className="text-right py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total harvests</th>
                                    <th className="text-right py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">kg per family</th>
                                    <th className="text-right py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Change</th>
                                    <th className="text-center py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">HoneyChain™ Verification</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredHarvests.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                                            No harvest records for {quickYear || '2026'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredHarvests.map((harvest, index) => (
                                        <tr
                                            key={harvest.id}
                                            onClick={() => setSelectedHarvest(harvest)}
                                            className="group hover:bg-gray-50 dark:hover:bg-amber-900/10 transition-all cursor-pointer border-b border-gray-50 dark:border-gray-800/50"
                                        >
                                            <td className="py-4 font-medium text-gray-900 dark:text-white">
                                                <div className="flex items-center gap-3">
                                                    <span className={cn(
                                                        "w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold",
                                                        index === 0 ? "bg-green-100 text-green-700" : "bg-amber-50 text-amber-600"
                                                    )}>
                                                        #{index + 1}
                                                    </span>
                                                    <div className="flex flex-col">
                                                        <span className="group-hover:text-amber-600 transition-colors">{harvest.apiary}</span>
                                                        <span className="text-[10px] text-gray-400 font-mono">{harvest.batch}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 text-right text-gray-600 dark:text-gray-400">{harvest.families}</td>
                                            <td className="py-4 text-right font-medium text-gray-900 dark:text-white">{harvest.totalKg} kg</td>
                                            <td className="py-4 text-right text-gray-600 dark:text-gray-400">{harvest.perFamily} kg</td>
                                            <td className="py-4 text-right">
                                                <span className={cn(
                                                    "text-xs font-bold",
                                                    harvest.change.startsWith('+') ? "text-green-600" : harvest.change.startsWith('-') ? "text-red-500" : "text-gray-500"
                                                )}>
                                                    {harvest.change}
                                                </span>
                                            </td>
                                            <td className="py-4">
                                                <div className="flex justify-center">
                                                    {harvest.verified ? (
                                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-full">
                                                            <ShieldCheck className="w-3 h-3 text-green-600" />
                                                            <span className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wide">Verified</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">-</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Filters Section */}
            <Card className="rounded-[2rem] border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Filters</h3>
                        <p className="text-sm text-gray-500 font-medium">Fine-tune the harvest analytics using the filters below.</p>
                    </div>
                    <Button
                        onClick={() => setIsAddingHarvest(true)}
                        className="bg-[#E5B02E] hover:bg-[#D4A025] text-white rounded-full px-6 h-11 font-bold shadow-lg shadow-amber-200/50 dark:shadow-none transition-all hover:scale-105"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add harvest
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Location Filter */}
                    <div className="p-6 rounded-[1.5rem] border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">LOCATION</span>
                        </div>
                        <div className="space-y-3">
                            <Select value={selectedPlace} onValueChange={setSelectedPlace}>
                                <SelectTrigger className="w-full h-12 rounded-2xl border-gray-200 bg-white dark:bg-[#1e1e1e] dark:border-gray-700">
                                    <SelectValue placeholder="MY PLACES" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none" disabled>No places available</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={selectedHive} onValueChange={setSelectedHive}>
                                <SelectTrigger className="w-full h-12 rounded-2xl border-gray-200 bg-white dark:bg-[#1e1e1e] dark:border-gray-700">
                                    <SelectValue placeholder="HIVE" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none" disabled>No hives available</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Period Filter */}
                    <div className="p-6 rounded-[1.5rem] border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">PERIOD</span>
                        </div>
                        <div className="space-y-3">
                            <div className="relative">
                                <span className="absolute -top-2 left-3 bg-white dark:bg-[#09090b] px-1 text-[10px] text-gray-500 font-bold">From</span>
                                <Input
                                    value={`1/1/${quickYear || "2026"}`}
                                    readOnly
                                    className="h-12 rounded-2xl border-gray-200 bg-white dark:bg-[#1e1e1e] dark:border-gray-700"
                                />
                                <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </div>
                            <div className="relative">
                                <span className="absolute -top-2 left-3 bg-white dark:bg-[#09090b] px-1 text-[10px] text-gray-500 font-bold">To</span>
                                <Input
                                    value={`12/31/${quickYear || "2026"}`}
                                    readOnly
                                    className="h-12 rounded-2xl border-gray-200 bg-white dark:bg-[#1e1e1e] dark:border-gray-700"
                                />
                                <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Quick Year Filter */}
                    <div className="p-6 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">QUICK YEAR</span>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full h-12 rounded-2xl border-gray-200 dark:border-gray-700 justify-between font-medium text-gray-700 dark:text-gray-300">
                                    {quickYear || "Custom range"}
                                    <ChevronDown className="w-4 h-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-xl bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-gray-700">
                                {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map((year) => (
                                    <DropdownMenuItem
                                        key={year}
                                        onClick={() => setQuickYear(year.toString())}
                                        className="py-3 font-bold text-gray-700 dark:text-gray-300 cursor-pointer focus:bg-amber-50 dark:focus:bg-amber-900/10"
                                    >
                                        Year {year}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <p className="text-[10px] text-gray-400 mt-4">
                            Select a year to quickly load its harvest data.
                        </p>
                    </div>
                </div>
            </Card>

            {/* Harvest Detail Modal */}
            <Dialog open={!!selectedHarvest} onOpenChange={(open) => !open && setSelectedHarvest(null)}>
                <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[#111111] border-none rounded-[2rem] p-0 overflow-hidden shadow-2xl">
                    {selectedHarvest && (
                        <div className="relative">
                            {/* Accent Header */}
                            <div className="h-24 bg-gradient-to-r from-amber-400 to-amber-600 p-8 flex items-end justify-between">
                                <Hexagon className="absolute -top-6 -left-6 w-32 h-32 text-white/10 fill-white/10 rotate-12" />
                                <div className="relative z-10">
                                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">HoneyChain™ Traceability Record</p>
                                    <h3 className="text-2xl font-black text-white">{selectedHarvest.apiary}</h3>
                                </div>
                                <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg border border-white/30 text-white text-[10px] font-bold uppercase tracking-wider">
                                    {selectedHarvest.batch}
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Harvest</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-black text-gray-900 dark:text-white">{selectedHarvest.totalKg}</span>
                                            <span className="text-xs font-bold text-gray-400">kg</span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Honey Type</p>
                                        <div className="flex items-center gap-2">
                                            <Droplets className="w-4 h-4 text-amber-500" />
                                            <span className="text-lg font-black text-gray-900 dark:text-white">{selectedHarvest.type}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Moisture Level</span>
                                        <span className="text-sm font-black text-gray-900 dark:text-white">{selectedHarvest.moisture}%</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Color Grade</span>
                                        <span className="text-sm font-black text-gray-900 dark:text-white">{selectedHarvest.color}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Productive Families</span>
                                        <span className="text-sm font-black text-gray-900 dark:text-white">{selectedHarvest.families}</span>
                                    </div>
                                </div>

                                {selectedHarvest.verified && (
                                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-2xl flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                            <ShieldCheck className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-green-800 dark:text-green-400 uppercase tracking-widest">HoneyChain Verified</p>
                                            <p className="text-[10px] text-green-600/70 font-medium">This record has been sealed and secured via IoT node.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-8 pt-0">
                                <Button
                                    onClick={() => setSelectedHarvest(null)}
                                    className="w-full h-14 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    Close Record
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default HarvestsView;
