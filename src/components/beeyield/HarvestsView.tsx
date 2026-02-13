import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { beeyieldService, Harvest, HarvestCreateInput, Apiary, Hive } from '@/services/beeyieldService';
import { useAuth } from '@/contexts/AuthContext';
import {
    Loader2, Trash2, RefreshCw, Filter, Calendar, ChevronDown, Plus, Download, ChevronRight,
    LayoutGrid, List, SlidersHorizontal, MapPin, Box, Database, Search, Settings, LogOut,
    MoreHorizontal, Hexagon, ShieldCheck, Link as LinkIcon, Droplets, Palette, Factory,
    Activity, Zap, Thermometer, Waves, Calendar as CalendarIcon
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

import Logo from '@/assets/Logo.png';

interface HarvestsViewProps {
    onTabChange: (tab: string) => void;
}

const HarvestsView: React.FC<HarvestsViewProps> = ({ onTabChange }) => {
    const [isAddingHarvest, setIsAddingHarvest] = useState(false);
    const [date, setDate] = useState<Date>(new Date());
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Filter states
    const [selectedPlace, setSelectedPlace] = useState<string>('');
    const [selectedHive, setSelectedHive] = useState<string>('');
    const [quickYear, setQuickYear] = useState<string>('all');
    const [selectedHarvest, setSelectedHarvest] = useState<Harvest | null>(null);

    // Form states
    const [amount, setAmount] = useState('');
    const [honeyType, setHoneyType] = useState('');
    const [florageType, setFlorageType] = useState('Multifloral');
    const [batchCode, setBatchCode] = useState(`BY-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    const [moisture, setMoisture] = useState('');
    const [colorGrade, setColorGrade] = useState('');
    const [sealOnHoneyChain, setSealOnHoneyChain] = useState(true);

    // Live data from Supabase
    const [allHarvests, setAllHarvests] = useState<Harvest[]>([]);

    const filteredHarvests = allHarvests.filter(h => {
        // Apiary filter
        if (selectedPlace && h.apiary_id !== selectedPlace) return false;

        // Hive filter
        if (selectedHive && h.hive_id !== selectedHive) return false;

        // Year filter
        if (quickYear !== 'all') {
            const harvestYear = new Date(h.harvest_date).getFullYear().toString();
            if (harvestYear !== (quickYear || '2026')) return false;
        }

        return true;
    });

    // List of apiaries and hives used in generation
    const [apiaries, setApiaries] = useState<Apiary[]>([]);
    const [hives, setHives] = useState<Hive[]>([]);

    const [editingHarvest, setEditingHarvest] = useState<Harvest | null>(null);

    // Auto-generate batch code
    useEffect(() => {
        if (selectedHive && !editingHarvest) {
            const hive = hives.find(h => h.id === selectedHive);
            if (hive) {
                const year = date.getFullYear();
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const day = date.getDate().toString().padStart(2, '0');
                const cleanHiveCode = hive.hive_code.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase();
                setBatchCode(`BY-${year}${month}${day}-${cleanHiveCode}`);
            }
        }
    }, [date, selectedHive, hives, editingHarvest]);

    const { user, beeyieldUser } = useAuth();
    const currentUser = beeyieldUser || user;

    // Fetch data on mount
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const userId = currentUser?.id;

            // Fetch harvest data specifically for this user
            const [harvestsData, apiariesData, hivesData] = await Promise.all([
                beeyieldService.getHarvests(userId ? { farmer_id: userId } : {}),
                beeyieldService.getApiaries(),
                beeyieldService.getHives()
            ]);

            setAllHarvests(harvestsData);
            setApiaries(apiariesData);
            setHives(hivesData);
            setIsLoading(false);
        };
        fetchData();
    }, [currentUser]);

    const resetForm = () => {
        setAmount('');
        // Batch code will be auto-generated by the effect above
        setHoneyType('');
        setFlorageType('Multifloral');
        setMoisture('');
        setColorGrade('');
        setSealOnHoneyChain(true);
        setDate(new Date());
        setSelectedHive('');
        setEditingHarvest(null);
    };

    const handleEdit = (harvest: Harvest) => {
        setEditingHarvest(harvest);
        setAmount(harvest.quantity_kg.toString());
        setHoneyType(harvest.honey_type || '');
        setFlorageType(harvest.florage_type || 'Multifloral');
        setBatchCode(harvest.batch_code || '');
        setMoisture(harvest.moisture_content_percent?.toString() || '');
        setColorGrade(harvest.color_grade || '');
        setSealOnHoneyChain(harvest.is_verified || false);
        setDate(new Date(harvest.harvest_date));
        setSelectedHive(harvest.hive_id || '');

        setIsAddingHarvest(true);
        // Close detail view if open
        setSelectedHarvest(null);
    };

    const handleSave = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast.error('Please enter a valid harvest amount');
            return;
        }

        setIsSaving(true);

        if (!selectedHive) {
            toast.error('Please select a source hive');
            setIsSaving(false);
            return;
        }

        const selectedHiveData = hives.find(h => h.id === selectedHive);
        if (!selectedHiveData) {
            toast.error('Selected hive not found in records');
            setIsSaving(false);
            return;
        }

        const harvestInput: any = {
            hive_id: selectedHive,
            apiary_id: selectedHiveData.apiary_id,
            harvest_date: date.toISOString().split('T')[0],
            quantity_kg: parseFloat(amount),
            quantity_left_for_bees_kg: parseFloat(amount), // 50/50 rule
            honey_type: honeyType || 'Wildflower',
            florage_type: florageType || 'Multifloral',
            batch_code: batchCode,
            moisture_content_percent: parseFloat(moisture) || 17.5,
            color_grade: colorGrade || 'Light Amber',
            is_verified: sealOnHoneyChain,
        };

        if (editingHarvest) {
            const { data, error } = await beeyieldService.updateHarvest(editingHarvest.id, harvestInput);
            if (data && !error) {
                setAllHarvests(allHarvests.map(h => h.id === editingHarvest.id ? { ...h, ...data } : h));
                setIsAddingHarvest(false);
                resetForm();
                toast.success('Harvest record updated');
            }
        } else {
            // NEW: Use Smart Batch Logger for snapshots
            const batchInput = {
                hive_id: selectedHive,
                apiary_id: selectedHiveData.apiary_id || (hives.find(h => h.id === selectedHive)?.apiary_id || ''),
                quantity_kg: parseFloat(amount),
                florage_type: florageType || 'Multifloral',
                harvest_date: date.toISOString().split('T')[0],
                honey_type: honeyType || 'Wildflower',
                notes: `Batch: ${batchCode} | Color: ${colorGrade}`
            };

            const { data, error } = await beeyieldService.logHarvestBatch(batchInput);

            if (data && !error) {
                // data.record contains the created harvest object
                const newHarvest = data.record || data;
                setAllHarvests([newHarvest, ...allHarvests]);
                setIsAddingHarvest(false);
                resetForm();
                toast.success(`Harvest Batch ${data.batch_id} Logged!`);
            } else {
                setIsSaving(false);
            }
        }
        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this harvest record?')) return;
        const { error } = await beeyieldService.deleteHarvest(id);
        if (!error) {
            setAllHarvests(allHarvests.filter(h => h.id !== id));
            toast.success('Harvest record deleted');
            if (selectedHarvest?.id === id) setSelectedHarvest(null);
        }
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
                            <h2 className="text-2xl font-medium text-gray-800 dark:text-gray-100">{editingHarvest ? 'Edit harvest' : 'Add harvest'}</h2>
                        </div>

                        <div className="space-y-6">
                            {/* Hive Selection for New Harvest */}
                            <div className="space-y-2">
                                <Label className="text-gray-600 dark:text-gray-400 font-normal">Source Hive*</Label>
                                <Select name="hive_id" value={selectedHive} onValueChange={setSelectedHive}>
                                    <SelectTrigger className="h-12 bg-white dark:bg-[#2a2a2a] border-gray-200 dark:border-gray-700 rounded-xl text-lg">
                                        <SelectValue placeholder="Select Hive" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {hives.map(h => (
                                            <SelectItem key={h.id} value={h.id}>{h.hive_code} ({apiaries.find(a => a.id === h.apiary_id)?.name})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Amount Input */}
                            <div className="space-y-2">
                                <Label className="text-gray-600 dark:text-gray-400 font-normal">Amount [kg]*</Label>
                                <Input
                                    id="harvest-amount"
                                    name="harvest-amount"
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
                                        id="harvest-date"
                                        name="harvest-date"
                                        value={format(date, 'M/d/yyyy')}
                                        onChange={(e) => {
                                            const d = new Date(e.target.value);
                                            if (!isNaN(d.getTime())) setDate(d);
                                        }}
                                        type="date"
                                        className="h-12 bg-white dark:bg-[#2a2a2a] border-gray-200 dark:border-gray-700 rounded-xl text-lg pr-10"
                                    />
                                </div>
                            </div>

                            {/* Traceability Section */}
                            <div className="animate-in slide-in-from-bottom-2 duration-500 delay-100">
                                <div className="flex items-center gap-2 mb-4 mt-2">
                                    <Hexagon className="w-4 h-4 text-[#F4D03F] fill-[#F4D03F]" />
                                    <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest">Honey Tracking</span>
                                    <div className="h-px bg-amber-200 flex-1 opacity-50"></div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-gray-500 uppercase">Batch Code</Label>
                                            <div className="relative">
                                                <Database className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                                                <Input
                                                    id="harvest-batch"
                                                    name="harvest-batch"
                                                    value={batchCode}
                                                    onChange={(e) => setBatchCode(e.target.value)}
                                                    className="h-10 pl-8 bg-white dark:bg-[#2a2a2a] border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-gray-500 uppercase">Honey Type</Label>
                                            <Select name="honey_type" value={honeyType} onValueChange={setHoneyType}>
                                                <SelectTrigger className="h-10 bg-white dark:bg-[#2a2a2a] border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="multiflora">Multi-flower</SelectItem>
                                                    <SelectItem value="acacia">Acacia</SelectItem>
                                                    <SelectItem value="forest">Forest</SelectItem>
                                                    <SelectItem value="rapeseed">Rapeseed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-gray-500 uppercase">Florage / Nectar</Label>
                                            <Select name="florage_type" value={florageType} onValueChange={setFlorageType}>
                                                <SelectTrigger className="h-10 bg-white dark:bg-[#2a2a2a] border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                                                    <SelectValue placeholder="Select Source" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Multifloral">Multifloral</SelectItem>
                                                    <SelectItem value="Acacia">Acacia</SelectItem>
                                                    <SelectItem value="Coffee">Coffee</SelectItem>
                                                    <SelectItem value="Avocado">Avocado</SelectItem>
                                                    <SelectItem value="Wildflower">Wildflower</SelectItem>
                                                    <SelectItem value="Eucalyptus">Eucalyptus</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>


                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-gray-500 uppercase">Moisture %</Label>
                                            <div className="relative">
                                                <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-cyan-500" />
                                                <Input
                                                    id="harvest-moisture"
                                                    name="harvest-moisture"
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
                                                <Select name="color_grade" value={colorGrade} onValueChange={setColorGrade}>
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

                                    <div className="bg-[#F4D03F]/5 dark:bg-[#F4D03F]/10 border border-[#F4D03F]/20 dark:border-amber-900/30 rounded-xl p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-colors", sealOnHoneyChain ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400")}>
                                                <ShieldCheck className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Secure record</p>
                                                <p className="text-[10px] text-gray-500">Safe history for this honey</p>
                                            </div>
                                        </div>
                                        <Switch name="is_verified" checked={sealOnHoneyChain} onCheckedChange={setSealOnHoneyChain} className="data-[state=checked]:bg-[#F4D03F]/50" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-4 pt-4">
                            <button
                                onClick={() => { setIsAddingHarvest(false); resetForm(); }}
                                className="text-[#D4AF37] font-medium text-sm hover:underline"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-[#F4D03F] hover:bg-[#D4AF37] text-white rounded-xl px-8 h-12 font-bold shadow-lg transition-all"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingHarvest ? 'Save Changes' : 'Create Record')}
                            </button>
                        </div>
                    </div>
                    {/* Progress Bar Bottom */}
                    <div className="flex items-center gap-1 px-4 pb-4">
                        <div className="h-2 w-2 rounded-full bg-[#F4D03F]/30"></div>
                        <div className="h-2 flex-1 rounded-full bg-[#F4D03F]"></div>
                        <div className="h-2 w-2 rounded-full bg-[#F4D03F]/30"></div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12 relative">

            <div className="flex items-center justify-between">
                <h1 className="text-[2.5rem] font-bold text-[#0F172A] dark:text-white tracking-tight">
                    Harvests ({allHarvests.length})
                </h1>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => setIsAddingHarvest(true)}
                        className="h-12 px-8 rounded-2xl bg-[#F4D03F] hover:bg-[#F1C40F] text-black transition-all shadow-lg shadow-[#F4D03F]/20 flex items-center gap-2 font-bold uppercase tracking-wider text-[10px]"
                    >
                        <Plus className="w-4 h-4" />
                        Log Harvest
                    </Button>
                </div>
            </div>

            {/* Yield Summary Card */}
            <Card className="rounded-[2rem] border border-gray-100 dark:border-gray-800 bg-white dark:bg-slate-50 shadow-sm overflow-hidden p-1">
                <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">YIELD SUMMARY</p>
                            <h2 className="text-4xl font-bold text-gray-900 dark:text-slate-900">{quickYear === 'all' ? "All Time" : (quickYear || "2026")}</h2>
                        </div>
                        <div className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm">
                            {quickYear === 'all' ? "All Time" : (quickYear || "2026")}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                        {(() => {
                            const moistureSum = filteredHarvests.reduce((sum, h) => sum + (h.moisture_content_percent || 0), 0);
                            const avgMoisture = filteredHarvests.length > 0 ? (moistureSum / filteredHarvests.length).toFixed(1) : '0.0';

                            const totalYield = filteredHarvests.reduce((sum, h) => sum + (h.quantity_kg || 0), 0).toFixed(1);

                            const verifiedCount = filteredHarvests.filter(h => h.is_verified).length;

                            const organicStatus = filteredHarvests.length > 0 ? 'ACTIVE' : 'PENDING';

                            return (
                                <>
                                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Avg Moisture</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl font-black text-slate-800 dark:text-white">{avgMoisture}</span>
                                            <span className="text-[10px] font-bold text-gray-400">%</span>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total weight</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl font-black text-slate-800 dark:text-slate-900">{totalYield}</span>
                                            <span className="text-[10px] font-bold text-gray-400">kg</span>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Organic Status</p>
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className={cn("w-3 h-3", organicStatus === 'ACTIVE' ? "text-green-500" : "text-yellow-500")} />
                                            <span className={cn("text-sm font-black uppercase", organicStatus === 'ACTIVE' ? "text-green-600" : "text-yellow-600")}>{organicStatus}</span>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Verified Seals</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl font-black text-slate-800 dark:text-slate-900">{verifiedCount}</span>
                                            <span className="text-[10px] font-bold text-[#F4D03F]">VALID</span>
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                    </div>

                    {/* Harvest Chart */}
                    <div className="h-[200px] mt-8 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={(() => {
                                const chartData = Array.from({ length: 12 }, (_, i) => ({
                                    name: new Date(0, i).toLocaleString('default', { month: 'short' }),
                                    total: 0
                                }));
                                filteredHarvests.forEach(h => {
                                    const month = new Date(h.harvest_date).getMonth();
                                    chartData[month].total += (h.quantity_kg || 0);
                                });
                                return chartData;
                            })()}>
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-white dark:bg-[#1a1a1a] p-2 border border-gray-100 dark:border-gray-800 rounded-lg shadow-lg">
                                                    <p className="text-xs font-bold text-gray-500 mb-1">{payload[0].payload.name}</p>
                                                    <p className="text-sm font-black text-[#F4D03F]">{payload[0].value} kg</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar
                                    dataKey="total"
                                    fill="#F4D03F"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-8 overflow-x-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-[#F4D03F]" />
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-800">
                                        <th className="text-left py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hive / Batch</th>
                                        <th className="text-left py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Apiary</th>
                                        <th className="text-left py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Farmer</th>
                                        <th className="text-right py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
                                        <th className="text-right py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Honey Type</th>
                                        <th className="text-right py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                        <th className="text-center py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Verified</th>
                                        <th className="text-center py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredHarvests.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
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
                                                            index === 0 ? "bg-green-100 text-green-700" : "bg-[#F4D03F]/5 text-[#D4AF37]"
                                                        )}>
                                                            #{index + 1}
                                                        </span>
                                                        <div className="flex flex-col">
                                                            <span className="group-hover:text-[#D4AF37] transition-colors">
                                                                {harvest.hive?.hive_code || 'Unknown Hive'}
                                                            </span>
                                                            <span className="text-[10px] text-gray-400 font-mono">{harvest.batch_code || '-'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-gray-600 dark:text-gray-400 font-medium">
                                                    {harvest.apiary?.name || harvest.hive?.apiary?.name || '-'}
                                                </td>
                                                <td className="py-4 text-gray-600 dark:text-gray-400">
                                                    {harvest.farmer?.name || '-'}
                                                </td>
                                                <td className="py-4 text-right font-medium text-gray-900 dark:text-white">
                                                    {harvest.quantity_kg} kg
                                                </td>
                                                <td className="py-4 text-right text-gray-600 dark:text-gray-400">
                                                    {harvest.honey_type || 'Wildflower'}
                                                </td>
                                                <td className="py-4 text-right text-gray-600 dark:text-gray-400">
                                                    {new Date(harvest.harvest_date).toLocaleDateString()}
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex justify-center">
                                                        {harvest.is_verified ? (
                                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-full">
                                                                <ShieldCheck className="w-3 h-3 text-green-600" />
                                                                <span className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wide">Verified</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">-</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex justify-center items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEdit(harvest);
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-[#F4D03F] hover:bg-amber-50 rounded-xl"
                                                        >
                                                            <Settings className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(harvest.id);
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
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
                        onClick={() => { resetForm(); setIsAddingHarvest(true); }}
                        className="bg-[#F4D03F] hover:bg-[#D4AF37] text-white rounded-full px-6 h-11 font-bold shadow-lg shadow-[#F4D03F]/50 dark:shadow-none transition-all hover:scale-105"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add harvest
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Location Filter */}
                    <div className="p-6 rounded-[1.5rem] border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 rounded-full bg-[#F4D03F]"></div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">LOCATION</span>
                        </div>
                        <div className="space-y-3">
                            <Select name="apiary_id" value={selectedPlace || "all"} onValueChange={(val) => setSelectedPlace(val === "all" ? "" : val)}>
                                <SelectTrigger id="harvest-apiary-filter" className="w-full h-12 rounded-2xl border-gray-200 bg-white dark:bg-[#1e1e1e] dark:border-gray-700">
                                    <SelectValue placeholder="Select Apiary" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Apiaries ({apiaries.length})</SelectItem>
                                    {apiaries.map(apiary => (
                                        <SelectItem key={apiary.id} value={apiary.id}>
                                            {apiary.name} ({hives.filter(h => h.apiary_id === apiary.id).length} Hives)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select name="hive_id" value={selectedHive || "all"} onValueChange={(val) => setSelectedHive(val === "all" ? "" : val)}>
                                <SelectTrigger id="harvest-hive-filter" className="w-full h-12 rounded-2xl border-gray-200 bg-white dark:bg-[#1e1e1e] dark:border-gray-700">
                                    <SelectValue placeholder="Select Hive" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Hives ({hives.length})</SelectItem>
                                    {hives.map(hive => (
                                        <SelectItem key={hive.id} value={hive.id}>{hive.hive_code}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Period Filter */}
                    <div className="p-6 rounded-[1.5rem] border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 rounded-full bg-[#F4D03F]"></div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">PERIOD</span>
                        </div>
                        <div className="space-y-3">
                            <div className="relative">
                                <span className="absolute -top-2 left-3 bg-white dark:bg-[#09090b] px-1 text-[10px] text-gray-500 font-bold">From</span>
                                <Input
                                    id="harvest-date-from"
                                    name="date-from"
                                    value={`1/1/${quickYear || "2026"}`}
                                    readOnly
                                    className="h-12 rounded-2xl border-gray-200 bg-white dark:bg-[#1e1e1e] dark:border-gray-700"
                                />
                                <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </div>
                            <div className="relative">
                                <span className="absolute -top-2 left-3 bg-white dark:bg-[#09090b] px-1 text-[10px] text-gray-500 font-bold">To</span>
                                <Input
                                    id="harvest-date-to"
                                    name="date-to"
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
                            <div className="w-2 h-2 rounded-full bg-[#F4D03F]"></div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">QUICK YEAR</span>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full h-12 rounded-2xl border-gray-200 dark:border-gray-700 justify-between font-medium text-gray-700 dark:text-gray-300">
                                    {quickYear === 'all' ? "All Time" : (quickYear || "Custom range")}
                                    <ChevronDown className="w-4 h-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-xl bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-gray-700">
                                <DropdownMenuItem
                                    onClick={() => setQuickYear('all')}
                                    className="py-3 font-bold text-gray-700 dark:text-gray-300 cursor-pointer focus:bg-[#F4D03F]/5 dark:focus:bg-amber-900/10"
                                >
                                    All Time ({allHarvests.reduce((sum, h) => sum + (h.quantity_kg || 0), 0).toFixed(1)}kg)
                                </DropdownMenuItem>
                                {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map((year) => {
                                    const yearTotal = allHarvests
                                        .filter(h => new Date(h.harvest_date).getFullYear() === year)
                                        .reduce((sum, h) => sum + (h.quantity_kg || 0), 0)
                                        .toFixed(1);
                                    return (
                                        <DropdownMenuItem
                                            key={year}
                                            onClick={() => setQuickYear(year.toString())}
                                            className="py-3 font-bold text-gray-700 dark:text-gray-300 cursor-pointer focus:bg-[#F4D03F]/5 dark:focus:bg-amber-900/10"
                                        >
                                            Year {year} ({yearTotal}kg)
                                        </DropdownMenuItem>
                                    );
                                })}
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
                            <div className="h-24 bg-gradient-to-r from-[#F4D03F] to-[#D4AF37] p-8 flex items-end justify-between">
                                <Hexagon className="absolute -top-6 -left-6 w-32 h-32 text-white/10 fill-white/10 rotate-12" />
                                <div className="relative z-10">
                                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Honey details</p>
                                    <h3 className="text-2xl font-black text-white">{selectedHarvest.apiary?.name || 'Unknown Apiary'}</h3>
                                </div>
                                <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg border border-white/30 text-white text-[10px] font-bold uppercase tracking-wider">
                                    {selectedHarvest.batch_code || 'No Batch'}
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Harvest</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-black text-gray-900 dark:text-slate-900">{selectedHarvest.quantity_kg}</span>
                                            <span className="text-xs font-bold text-gray-400">kg</span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Honey Type</p>
                                        <div className="flex items-center gap-2">
                                            <Droplets className="w-4 h-4 text-amber-500" />
                                            <span className="text-lg font-black text-gray-900 dark:text-slate-900">{selectedHarvest.honey_type || 'Wildflower'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Moisture Level</span>
                                        <span className="text-sm font-black text-gray-900 dark:text-slate-900">{selectedHarvest.moisture_content_percent}%</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Color Grade</span>
                                        <span className="text-sm font-black text-gray-900 dark:text-slate-900">{selectedHarvest.color_grade}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hive Source</span>
                                        <span className="text-sm font-black text-gray-900 dark:text-slate-900">{selectedHarvest.hive?.hive_code || 'Multi-hive'}</span>
                                    </div>
                                </div>

                                {selectedHarvest.is_verified && (
                                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-2xl flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                            <ShieldCheck className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-green-800 dark:text-green-400 uppercase tracking-widest">Verified Record</p>
                                            <p className="text-[10px] text-green-600/70 font-medium">This record has been sealed and secured via IoT node.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-8 pt-0">
                                <div className="p-8 pt-0 flex gap-4">
                                    <Button
                                        onClick={() => handleEdit(selectedHarvest)}
                                        className="flex-1 h-14 bg-[#FFF8F0] dark:bg-white/5 text-[#D4AF37] dark:text-[#F4D03F] border border-[#F4D03F]/20 rounded-2xl font-black uppercase tracking-widest hover:bg-[#F4D03F]/10 transition-all"
                                    >
                                        Edit Record
                                    </Button>
                                    <Button
                                        onClick={() => setSelectedHarvest(null)}
                                        className="flex-1 h-14 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        Close
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default HarvestsView;
