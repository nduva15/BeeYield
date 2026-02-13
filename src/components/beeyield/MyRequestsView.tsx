import React, { useState, useMemo, useEffect } from 'react';
import {
    LayoutGrid, Box, ChevronDown, Check, Loader2, Plus,
    History, HardDrive, Cpu, ShieldCheck, HelpCircle,
    Send, ArrowRight, ArrowLeft, Clock, AlertCircle,
    CheckCircle2, XCircle, Search, Filter, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useApiaries, useHives } from '@/hooks/useApiaries';
import { useRequests, useCreateRequest } from '@/hooks/useRequests';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';

interface MyRequestsViewProps {
    onTabChange: (tab: string) => void;
}

const CATEGORIES = [
    { id: 'Hardware', label: 'Hardware', icon: HardDrive, description: 'Sensor issues, battery, physical hive damage', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'Software', label: 'Software', icon: Cpu, description: 'Dashboard bugs, sync issues, AI predictions', color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { id: 'Traceability', label: 'Traceability', icon: ShieldCheck, description: 'HoneyChain™ verification, batch sealing errors', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'General', label: 'General', icon: HelpCircle, description: 'Billing, account, or other general questions', color: 'text-orange-500', bg: 'bg-orange-500/10' },
];

const MyRequestsView: React.FC<MyRequestsViewProps> = ({ onTabChange }) => {
    // Data Fetching
    const { data: apiariesData, isLoading: isLoadingApiaries } = useApiaries();
    const { data: hivesData, isLoading: isLoadingHives } = useHives();
    const { data: requests, isLoading: isLoadingRequests } = useRequests();
    const createRequest = useCreateRequest();

    const [selectedPlaceId, setSelectedPlaceId] = useState<string>("");
    const [selectedHive, setSelectedHive] = useState<string>("");
    const [isPlacesOpen, setIsPlacesOpen] = useState(false);
    const [isHivesOpen, setIsHivesOpen] = useState(false);

    // Wizard State
    const [wizardStep, setWizardStep] = useState(0); // 0: Category, 1: Details, 2: Review
    const [category, setCategory] = useState('');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [showWizard, setShowWizard] = useState(false);

    // Filter History State
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    // Get apiary name from ID for display
    const selectedPlace = useMemo(() => {
        if (!selectedPlaceId) return "";
        return apiariesData?.find(a => a.id === selectedPlaceId)?.name || "";
    }, [selectedPlaceId, apiariesData]);

    const places = apiariesData || [];

    const filteredHives = useMemo(() => {
        if (!hivesData) return [];
        if (!selectedPlaceId) return hivesData;
        return hivesData.filter(hive => hive.apiary_id === selectedPlaceId);
    }, [hivesData, selectedPlaceId]);

    // Filter Requests for Table
    const filteredRequests = useMemo(() => {
        if (!requests) return [];
        return requests.filter(req => {
            const matchesSearch = req.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                req.id.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "All" || req.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [requests, searchQuery, statusFilter]);

    // Auto-select first apiary if only one exists
    useEffect(() => {
        if (apiariesData?.length === 1 && !selectedPlaceId) {
            setSelectedPlaceId(apiariesData[0].id);
        }
    }, [apiariesData, selectedPlaceId]);

    const handleFormSubmit = async () => {
        try {
            await createRequest.mutateAsync({
                subject,
                description,
                category,
                priority,
                hive_id: selectedHive || undefined,
            });
            // Reset wizard
            setShowWizard(false);
            setWizardStep(0);
            setCategory('');
            setSubject('');
            setDescription('');
        } catch (error) {
            // Error managed by mutation/toast
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Resolved': return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
            case 'In Progress': return "bg-blue-500/10 text-blue-600 border-blue-500/20";
            case 'Open': return "bg-orange-500/10 text-orange-600 border-orange-500/20";
            case 'Closed': return "bg-slate-500/10 text-slate-600 border-slate-500/20";
            default: return "bg-slate-500/10 text-slate-600 border-slate-500/20";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Resolved': return CheckCircle2;
            case 'In Progress': return Clock;
            case 'Open': return AlertCircle;
            case 'Closed': return XCircle;
            default: return AlertCircle;
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-20 px-2 relative min-h-[800px]">

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-3 h-12 bg-[#F4D03F] rounded-full" />
                    <div>
                        <h1 className="text-[3rem] font-black text-[#F4D03F] dark:text-white tracking-tighter uppercase leading-none">MY REQUESTS</h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">{filteredRequests.length} Requests Filed</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 pr-4">
                    <Button
                        onClick={() => setShowWizard(!showWizard)}
                        className={cn(
                            "rounded-full px-6 transition-all duration-300 shadow-lg hover:shadow-xl h-11",
                            showWizard ? "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200" : "bg-[#F4D03F] text-black hover:bg-[#E5C135]"
                        )}
                    >
                        {showWizard ? "Close Form" : (
                            <span className="flex items-center gap-2">
                                <Plus className="w-4 h-4" /> New Request
                            </span>
                        )}
                    </Button>
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-4">
                {/* My Places Dropdown */}
                <div className="relative group/dropdown min-w-[230px]">
                    <button
                        type="button"
                        onClick={() => {
                            setIsPlacesOpen(!isPlacesOpen);
                            setIsHivesOpen(false);
                        }}
                        className={cn(
                            "flex items-center gap-4 px-5 py-3.5 bg-white dark:bg-[#09090b] border border-gray-200 dark:border-gray-800 rounded-[12px] shadow-sm hover:shadow-md hover:border-[#F4D03F]/30 transition-all w-full cursor-pointer h-auto outline-none",
                            isPlacesOpen && "border-orange-200 ring-2 ring-[#F4D03F]/10 dark:ring-orange-900/20"
                        )}
                    >
                        <div className="w-5 h-5 flex items-center justify-center">
                            <LayoutGrid className="w-5 h-5 text-[#F4D03F]" strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col items-start flex-1 min-w-0">
                            <span className="text-[11px] font-[800] text-[#64748B] uppercase tracking-[0.1em] text-left">
                                MY PLACES {apiariesData?.length ? `(${apiariesData.length})` : ''}
                            </span>
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate w-full text-left -mt-0.5 uppercase">
                                {selectedPlace || "Kibwezi Main Apiary"}
                            </span>
                        </div>
                        <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-300", isPlacesOpen && "rotate-180 text-[#F4D03F]")} />
                    </button>

                    <AnimatePresence>
                        {isPlacesOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#09090b] border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden"
                            >
                                <div className="p-2 max-h-[300px] overflow-y-auto">

                                    {isLoadingApiaries ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="w-5 h-5 text-[#F4D03F] animate-spin" />
                                        </div>
                                    ) : places.filter(a => a.name.includes('Kibwezi')).length === 0 ? (
                                        <div className="px-4 py-8 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">
                                            No places found
                                        </div>
                                    ) : places.filter(a => a.name.includes('Kibwezi')).map((place) => (
                                        <button
                                            key={place.id}
                                            onClick={() => {
                                                setSelectedPlaceId(place.id);
                                                setIsPlacesOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F4D03F]/5 dark:hover:bg-orange-900/10 rounded-lg transition-colors group"
                                        >
                                            <LayoutGrid className="w-4 h-4 text-slate-400 group-hover:text-[#F4D03F]" />
                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{place.name}</span>
                                            {selectedPlaceId === place.id && <Check className="w-4 h-4 ml-auto text-[#F4D03F]" />}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Hive Dropdown */}
                <div className="relative group/dropdown min-w-[230px]">
                    <button
                        type="button"
                        onClick={() => {
                            setIsHivesOpen(!isHivesOpen);
                            setIsPlacesOpen(false);
                        }}
                        className={cn(
                            "flex items-center gap-4 px-5 py-3.5 bg-white dark:bg-[#09090b] border border-gray-200 dark:border-gray-800 rounded-[12px] shadow-sm hover:shadow-md hover:border-[#F4D03F]/30 transition-all w-full cursor-pointer h-auto outline-none",
                            isHivesOpen && "border-orange-200 ring-2 ring-[#F4D03F]/10 dark:ring-orange-900/20"
                        )}
                    >
                        <div className="w-5 h-5 flex items-center justify-center">
                            {isLoadingHives ? (
                                <Loader2 className="w-5 h-5 text-[#F4D03F] animate-spin" />
                            ) : (
                                <Box className="w-5 h-5 text-[#F4D03F]" strokeWidth={2.5} />
                            )}
                        </div>
                        <div className="flex flex-col items-start flex-1 min-w-0">
                            <span className="text-[11px] font-[800] text-[#64748B] uppercase tracking-[0.1em] text-left">
                                HIVE {filteredHives.length ? `(${filteredHives.length})` : ''}
                            </span>
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate w-full text-left -mt-0.5 uppercase">
                                {selectedHive || "184 Hives"}
                            </span>
                        </div>
                        <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-300", isHivesOpen && "rotate-180 text-[#F4D03F]")} />
                    </button>

                    <AnimatePresence>
                        {isHivesOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#09090b] border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden"
                            >
                                <div className="p-2 max-h-[300px] overflow-y-auto">

                                    {isLoadingHives ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="w-5 h-5 text-[#F4D03F] animate-spin" />
                                        </div>
                                    ) : filteredHives.length === 0 ? (
                                        <div className="px-4 py-8 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">
                                            No hives found
                                        </div>
                                    ) : (
                                        filteredHives.slice(0, 184).map((hive) => (
                                            <button
                                                key={hive.id}
                                                onClick={() => {
                                                    setSelectedHive(hive.hive_code);
                                                    setIsHivesOpen(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F4D03F]/5 dark:hover:bg-orange-900/10 rounded-lg transition-colors group"
                                            >
                                                <Box className="w-4 h-4 text-slate-400 group-hover:text-[#F4D03F]" />
                                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{hive.hive_code}</span>
                                                {selectedHive === hive.hive_code && <Check className="w-4 h-4 ml-auto text-[#F4D03F]" />}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Request Wizard */}
            <AnimatePresence>
                {showWizard && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-[24px] shadow-xl p-8 mb-12">
                            <div className="max-w-3xl mx-auto">
                                {/* Wizard Header */}
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[#F4D03F]/20 flex items-center justify-center text-[#F4D03F] font-bold">
                                            {wizardStep + 1}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                                {wizardStep === 0 && "Select Request Category"}
                                                {wizardStep === 1 && "Request Details"}
                                                {wizardStep === 2 && "Review and Submit"}
                                            </h3>
                                            <p className="text-sm text-slate-500">Step {wizardStep + 1} of 3</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {[0, 1, 2].map((i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "h-1.5 w-12 rounded-full transition-all duration-500",
                                                    i <= wizardStep ? "bg-[#F4D03F]" : "bg-slate-200 dark:bg-slate-800"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <AnimatePresence mode="wait">
                                    {wizardStep === 0 && (
                                        <motion.div
                                            key="step0"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                        >
                                            {CATEGORIES.map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => {
                                                        setCategory(cat.id);
                                                        setWizardStep(1);
                                                    }}
                                                    className={cn(
                                                        "flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all group hover:border-[#F4D03F]/50",
                                                        category === cat.id ? "border-[#F4D03F] bg-[#F4D03F]/5 shadow-sm" : "border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-800/20"
                                                    )}
                                                >
                                                    <div className={cn("mt-1 p-3 rounded-xl transition-colors", cat.bg, cat.color)}>
                                                        <cat.icon className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">{cat.label}</h4>
                                                        <p className="text-xs text-slate-500 leading-relaxed">{cat.description}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}

                                    {wizardStep === 1 && (
                                        <motion.div
                                            key="step1"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6"
                                        >
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Subject</label>
                                                <Input
                                                    id="wizard-subject"
                                                    name="subject"
                                                    value={subject}
                                                    onChange={(e) => setSubject(e.target.value)}
                                                    placeholder="What can we help you with?"
                                                    className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl h-12 focus:ring-[#F4D03F]"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Message Detail</label>
                                                <Textarea
                                                    id="wizard-description"
                                                    name="description"
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    placeholder="Describe your issue or request in detail..."
                                                    className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl min-h-[150px] focus:ring-[#F4D03F]"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex gap-4">
                                                    {['Low', 'Medium', 'High'].map((p) => (
                                                        <button
                                                            key={p}
                                                            onClick={() => setPriority(p)}
                                                            className={cn(
                                                                "px-4 py-2 rounded-lg text-xs font-bold border transition-all",
                                                                priority === p
                                                                    ? "bg-[#F4D03F] border-[#F4D03F] text-black"
                                                                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500"
                                                            )}
                                                        >
                                                            {p}
                                                        </button>
                                                    ))}
                                                </div>
                                                <Button
                                                    onClick={() => setWizardStep(2)}
                                                    disabled={!subject || !description}
                                                    className="bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 hover:opacity-90 rounded-full px-8"
                                                >
                                                    Review <ArrowRight className="w-4 h-4 ml-2" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {wizardStep === 2 && (
                                        <motion.div
                                            key="step2"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-8"
                                        >
                                            <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 space-y-4">
                                                <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Category</p>
                                                        <div className="flex items-center gap-2">
                                                            <Badge className="bg-[#F4D03F]/10 text-[#F4D03F] border-none">{category}</Badge>
                                                            <Badge className={cn(
                                                                "border-none",
                                                                priority === 'High' ? "bg-red-500/10 text-red-500" :
                                                                    priority === 'Medium' ? "bg-orange-500/10 text-orange-500" :
                                                                        "bg-blue-500/10 text-blue-500"
                                                            )}>
                                                                {priority} Priority
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Related Hive</p>
                                                        <p className="font-bold text-slate-700 dark:text-slate-200">{selectedHive || "General Fleet"}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject</p>
                                                    <p className="text-lg font-bold text-slate-800 dark:text-white leading-tight">{subject}</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</p>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-4">"{description}"</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => setWizardStep(1)}
                                                    className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                                                >
                                                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                                                </Button>
                                                <Button
                                                    onClick={handleFormSubmit}
                                                    disabled={createRequest.isPending}
                                                    className="bg-[#F4D03F] text-black hover:bg-[#E5C135] rounded-full px-10 h-12 shadow-lg"
                                                >
                                                    {createRequest.isPending ? (
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                    ) : (
                                                        <span className="flex items-center gap-2">
                                                            Submit Request <Send className="w-4 h-4" />
                                                        </span>
                                                    )}
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Request History Section */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                            <History className="w-5 h-5 text-slate-500" />
                        </div>
                        <h2 className="text-2xl font-bold dark:text-white">Request History</h2>
                        <Badge variant="outline" className="text-slate-400 border-slate-200 dark:border-slate-800">{filteredRequests.length}</Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                id="history-search"
                                name="search"
                                placeholder="Search by ID or Subject..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl w-64 focus:ring-[#F4D03F]"
                            />
                        </div>
                        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                            {['All', 'Open', 'In Progress', 'Resolved'].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                                        statusFilter === s
                                            ? "bg-white dark:bg-slate-700 text-[#F4D03F] shadow-sm"
                                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                    )}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0c0c0e] border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                    {isLoadingRequests ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <Loader2 className="w-10 h-10 text-[#F4D03F] animate-spin" />
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Fetching ticket archives...</p>
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center px-10">
                            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-4">
                                <MessageSquare className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No Requests Found</h3>
                            <p className="text-slate-500 max-w-sm">No support requests match your current filters. Start a new request using the button above.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50/50 dark:bg-slate-800/30">
                                    <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                                        <TableHead className="py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Reference ID</TableHead>
                                        <TableHead className="py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Request Subject</TableHead>
                                        <TableHead className="py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Category</TableHead>
                                        <TableHead className="py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Priority</TableHead>
                                        <TableHead className="py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Status</TableHead>
                                        <TableHead className="py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] text-right pr-6">Date Submitted</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredRequests.map((req) => {
                                        const StatusIcon = getStatusIcon(req.status);
                                        return (
                                            <TableRow
                                                key={req.id}
                                                className="group border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors cursor-pointer"
                                                onClick={() => {
                                                    // This would open the request detail/chat view
                                                    // For now just toast it
                                                    toast.info(`Opening details for ${req.id}`);
                                                }}
                                            >
                                                <TableCell className="py-5 font-mono text-[11px] text-[#F4D03F] font-bold">
                                                    #{req.id.substring(0, 8).toUpperCase()}
                                                </TableCell>
                                                <TableCell className="py-5">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-700 dark:text-slate-200">{req.subject}</span>
                                                        <span className="text-[10px] text-slate-400 line-clamp-1">{req.description}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-5">
                                                    <div className="flex items-center gap-2">
                                                        {req.category === 'Hardware' && <HardDrive className="w-3.5 h-3.5 text-blue-500" />}
                                                        {req.category === 'Software' && <Cpu className="w-3.5 h-3.5 text-purple-500" />}
                                                        {req.category === 'Traceability' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />}
                                                        {req.category === 'General' && <HelpCircle className="w-3.5 h-3.5 text-orange-500" />}
                                                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{req.category}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-5">
                                                    <Badge variant="outline" className={cn(
                                                        "text-[10px] font-bold px-2 py-0 border-none",
                                                        req.priority === 'High' ? "bg-red-500/10 text-red-500" :
                                                            req.priority === 'Medium' ? "bg-orange-500/10 text-orange-500" :
                                                                "bg-blue-500/10 text-blue-500"
                                                    )}>
                                                        {req.priority}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="py-5">
                                                    <Badge className={cn("flex items-center gap-1.5 w-fit border shadow-none font-bold uppercase text-[9px]", getStatusStyles(req.status))}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {req.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="py-5 text-right text-xs font-medium text-slate-500 pr-6">
                                                    {new Date(req.created_at).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>

            {/* Backdrop for click-away */}
            {(isPlacesOpen || isHivesOpen) && (
                <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => {
                        setIsPlacesOpen(false);
                        setIsHivesOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default MyRequestsView;
