import React from 'react';
import {
    LayoutGrid, Box, ChevronDown, Check, Loader2, Plus,
    HardDrive, Cpu, ShieldCheck, HelpCircle,
    Send, ArrowRight, ArrowLeft, Clock, AlertCircle,
    CheckCircle2, XCircle, Search, MessageSquare, MapPin
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
import { toast } from 'sonner';
import { glass, GlassStatCard } from './GlassTheme';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';

const CATEGORIES = [
    { id: 'Hardware', label: 'Hardware', icon: HardDrive, description: 'Sensor issues, battery, physical hive damage', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'Software', label: 'Software', icon: Cpu, description: 'Dashboard bugs, sync issues, smart analytics', color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { id: 'Traceability', label: 'Traceability', icon: ShieldCheck, description: 'HoneyChain™ verification, batch sealing errors', color: 'text-[#1B9157]', bg: 'bg-[#1B9157]/10' },
    { id: 'General', label: 'General', icon: HelpCircle, description: 'Billing, account, or other general questions', color: 'text-orange-500', bg: 'bg-orange-500/10' },
];

const MyRequestsView: React.FC<{ onTabChange: (tab: string) => void }> = ({ onTabChange }) => {
    // Data Fetching
    const { data: apiariesData } = useApiaries();
    const { data: hivesData } = useHives();
    const { data: requests = [], isLoading: isLoadingRequests } = useRequests();
    const createRequest = useCreateRequest();

    const [selectedPlaceId, setSelectedPlaceId] = React.useState<string>("");
    const [selectedHiveId, setSelectedHiveId] = React.useState<string>("");

    // Wizard State
    const [wizardStep, setWizardStep] = React.useState(0);
    const [category, setCategory] = React.useState('');
    const [subject, setSubject] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [priority, setPriority] = React.useState('medium');
    const [showWizard, setShowWizard] = React.useState(false);

    // Filter History State
    const [searchQuery, setSearchQuery] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("All");

    // Details modal state
    const [selectedRequest, setSelectedRequest] = React.useState<any | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

    const filteredHives = React.useMemo(() => {
        if (!hivesData) return [];
        if (!selectedPlaceId) return hivesData;
        return hivesData.filter(hive => hive.apiary_id === selectedPlaceId);
    }, [hivesData, selectedPlaceId]);

    const combinedRequests = React.useMemo(() => {
        return Array.isArray(requests) ? requests : [];
    }, [requests]);

    const filteredRequests = React.useMemo(() => {
        return combinedRequests.filter((req: any) => {
            const matchesSearch = req.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                req.id.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "All" || req.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [combinedRequests, searchQuery, statusFilter]);

    const handleFormSubmit = async () => {
        if (!subject.trim() || !description.trim() || !category) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            await createRequest.mutateAsync({
                subject,
                description,
                type: category,
                category,
                priority,
                hive_id: selectedHiveId || undefined,
                apiary_id: selectedPlaceId || undefined,
            });
            setShowWizard(false);
            setWizardStep(0);
            setCategory('');
            setSubject('');
            setDescription('');
        } catch (error) {
            console.error('Error submitting request:', error);
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Resolved': return "bg-[#1B9157]/10 text-[#1B9157] border-[#1B9157]/20";
            case 'In Progress': return "bg-blue-500/10 text-blue-600 border-blue-500/20";
            case 'Open': return "bg-orange-500/10 text-orange-600 border-orange-500/20";
            case 'Closed': return "bg-gray-100 text-gray-600 border-gray-200";
            default: return "bg-gray-100 text-gray-600 border-gray-200";
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
        <BeeYieldPageShell className={glass.page}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
            >
            <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-[#F4D03F][0.03] rounded-full blur-[120px] -mr-20 -mt-20 pointer-events-none" />

            <BeeYieldPageHeader
                icon={MessageSquare}
                label="Support Intelligence"
                onBack={() => onTabChange('home')}
                title={<>My <span className="text-[#F4D03F]">Requests</span></>}
                subtitle="Track and manage your technical support tickets."
                actions={
                    <button
                        onClick={() => setShowWizard(!showWizard)}
                        className={cn(glass.btnPrimary, "px-4 h-9 text-[10px] font-bold flex items-center gap-2")}
                    >
                        {showWizard ? "Close Form" : (<><Plus className="w-4 h-4" /> New Request</>)}
                    </button>
                }
            />

            {/* Request Wizard */}
            <AnimatePresence>
                {showWizard && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden relative z-10"
                    >
                        <div className={cn(glass.card, "p-6 mb-8 bg-white/80 backdrop-blur-md")}>
                            <div className="max-w-3xl mx-auto">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#F4D03F]/20 flex items-center justify-center text-[#F4D03F] font-bold text-sm">
                                            {wizardStep + 1}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                                                {wizardStep === 0 && "Select Request Category"}
                                                {wizardStep === 1 && "Request Details"}
                                                {wizardStep === 2 && "Review and Submit"}
                                            </h3>
                                            <p className="text-[10px] font-bold text-foreground/30">Step {wizardStep + 1} of 3</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1.5">
                                        {[0, 1, 2].map((i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "h-1 w-8 rounded-full transition-all duration-500",
                                                    i <= wizardStep ? "bg-[#F4D03F]" : "bg-foreground/5"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <AnimatePresence mode="wait">
                                    {wizardStep === 0 && (
                                        <motion.div
                                            key="step0"
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            className="grid grid-cols-1 md:grid-cols-2 gap-3"
                                        >
                                            {CATEGORIES.map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => {
                                                        setCategory(cat.id);
                                                        setWizardStep(1);
                                                    }}
                                                    className={cn(
                                                        "flex items-start gap-3 p-4 rounded-xl border transition-all text-left",
                                                        category === cat.id ? "border-[#F4D03F] bg-[#F4D03F]/5" : "border-foreground/5 bg-gray-50/50 hover:border-[#F4D03F]/20"
                                                    )}
                                                >
                                                    <div className={cn("p-2 rounded-lg", cat.bg, cat.color)}>
                                                        <cat.icon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-bold text-foreground uppercase tracking-tight">{cat.label}</h4>
                                                        <p className="text-[10px] text-foreground/40 leading-relaxed mt-0.5">{cat.description}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}

                                    {wizardStep === 1 && (
                                        <motion.div
                                            key="step1"
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            className="space-y-4"
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label htmlFor="request-related-apiary" className={glass.microLabel}>Related Entity (Apiary)</label>
                                                    <select
                                                        id="request-related-apiary"
                                                        name="related_apiary"
                                                        autoComplete="off"
                                                        value={selectedPlaceId}
                                                        onChange={(e) => setSelectedPlaceId(e.target.value)}
                                                        className={cn(glass.select, "h-10 text-xs px-4 rounded-xl")}
                                                        aria-label="Related location"
                                                        title="Related location"
                                                    >
                                                        <option value="">Select Apiary (Optional)</option>
                                                        {apiariesData?.map(a => <option key={a.id} value={a.id}>{a.name.toUpperCase()}</option>)}
                                                    </select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label htmlFor="request-related-hive" className={glass.microLabel}>Related Hive</label>
                                                    <select
                                                        id="request-related-hive"
                                                        name="related_hive"
                                                        autoComplete="off"
                                                value={selectedHiveId}
                                                onChange={(e) => setSelectedHiveId(e.target.value)}
                                                        className={cn(glass.select, "h-10 text-xs px-4 rounded-xl")}
                                                        aria-label="Related hive"
                                                        title="Related hive"
                                                    >
                                                        <option value="">Select Hive (Optional)</option>
                                                {filteredHives.map(h => <option key={h.id} value={h.id}>{h.hive_code.toUpperCase()}</option>)}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label htmlFor="request-subject" className={glass.microLabel}>Subject</label>
                                                <input
                                                    id="request-subject"
                                                    name="subject"
                                                    autoComplete="off"
                                                    value={subject}
                                                    onChange={(e) => setSubject(e.target.value)}
                                                    placeholder="Brief summary of the issue..."
                                                    className={cn(glass.input, "h-10 px-4")}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label htmlFor="request-description" className={glass.microLabel}>Description</label>
                                                <textarea
                                                    id="request-description"
                                                    name="description"
                                                    autoComplete="off"
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    placeholder="Detailed technical overview..."
                                                    className={cn(glass.input, "min-h-[120px] p-4 py-3")}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between pt-2">
                                                <div className="flex gap-2">
                                                    {['Low', 'Medium', 'High'].map((p) => (
                                                        <button
                                                            key={p}
                                                            onClick={() => setPriority(p)}
                                                            className={cn(
                                                                "px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all",
                                                                priority === p
                                                                    ? "bg-[#F4D03F] border-[#F4D03F] text-[#1A1A1A]"
                                                                    : "bg-white border-foreground/5 text-foreground/30 hover:text-foreground/60"
                                                            )}
                                                        >
                                                            {p}
                                                        </button>
                                                    ))}
                                                </div>
                                                <button
                                                    onClick={() => setWizardStep(2)}
                                                    disabled={!subject || !description}
                                                    className={cn(glass.btnPrimary, "px-6 h-9 text-[10px] font-bold")}
                                                >
                                                    Review <ArrowRight className="w-4 h-4 ml-2" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {wizardStep === 2 && (
                                        <motion.div
                                            key="step2"
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            className="space-y-6"
                                        >
                                            <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 space-y-4">
                                                <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                                                    <div>
                                                        <p className={glass.microLabel}>Category / Priority</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge className="bg-[#F4D03F]/10 text-[#F4D03F] border-[#F4D03F]/20 text-[9px] font-bold">{category}</Badge>
                                                            <Badge className={cn(
                                                                "border-none text-[9px] font-bold",
                                                                priority === 'High' ? "bg-red-500/10 text-red-500" :
                                                                    priority === 'Medium' ? "bg-orange-500/10 text-orange-500" :
                                                                        "bg-blue-500/10 text-blue-500"
                                                            )}>
                                                                {priority} Priority
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={glass.microLabel}>Entity Mapping</p>
                                                        <p className="text-xs font-bold text-foreground uppercase mt-1">
                                                            {selectedHiveId
                                                                ? (filteredHives.find((h: any) => h.id === selectedHiveId)?.hive_code || "Selected hive")
                                                                : (selectedPlaceId ? "Selected apiary" : "General System")}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className={glass.microLabel}>Subject</p>
                                                    <p className="text-sm font-bold text-foreground">{subject}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className={glass.microLabel}>Description</p>
                                                    <p className="text-xs text-foreground/60 leading-relaxed line-clamp-3">"{description}"</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <button
                                                    onClick={() => setWizardStep(1)}
                                                    className={cn(glass.btnSecondary, "px-4 h-9 text-[10px] font-bold")}
                                                >
                                                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                                                </button>
                                                <button
                                                    onClick={handleFormSubmit}
                                                    disabled={createRequest.isPending}
                                                    className={cn(glass.btnPrimary, "px-8 h-9 text-[10px] font-bold")}
                                                >
                                                    {createRequest.isPending ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <span className="flex items-center gap-2">
                                                            Submit Request <Send className="w-4 h-4" />
                                                        </span>
                                                    )}
                                                </button>
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
            <div className="space-y-4 pt-4">
                <div className={cn(glass.filterBar, "p-3")}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <h2 className="text-[10px] font-bold text-[#1A1A1A]/40">Request History</h2>
                            <div className="px-2 py-0.5 bg-[#F4D03F]/10 border border-[#F4D03F]/20 rounded-lg text-[9px] font-bold text-[#F4D03F]">{filteredRequests.length}</div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative group/search">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/20 group-focus-within/search:text-[#F4D03F] transition-colors" />
                                <input
                                    id="requests-search"
                                    name="search_requests"
                                    autoComplete="off"
                                    placeholder="Search tickets..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={cn(glass.input, "pl-9 h-9 w-48 text-[11px]")}
                                />
                            </div>
                            <div className="flex p-0.5 bg-foreground/5 rounded-xl border border-foreground/5">
                                {['All', 'Open', 'In Progress', 'Resolved'].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setStatusFilter(s)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg text-[9px] font-bold transition-all",
                                            statusFilter === s
                                                ? "bg-white text-[#F4D03F] shadow-sm"
                                                : "text-gray-400 hover:text-gray-600"
                                        )}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={cn(glass.card, "p-0 overflow-hidden bg-white/60")}>
                    {isLoadingRequests ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="w-8 h-8 text-[#F4D03F] animate-spin" />
                            <p className="text-[10px] font-bold text-gray-400">Fetching archives...</p>
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center px-10">
                            <div className="w-12 h-12 rounded-2xl bg-[#F9F7F2] flex items-center justify-center mb-4 border border-[#F4D03F]/10">
                                <MessageSquare className="w-6 h-6 text-foreground/10" />
                            </div>
                            <h3 className="text-lg font-bold text-[#1A1A1A] tracking-tight uppercase opacity-40">No Requests Found</h3>
                            <button onClick={() => setShowWizard(true)} className={cn(glass.btnSecondary, "mt-4 px-4 h-8 text-[9px]")}>Create a request</button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50/50">
                                    <TableRow className="border-gray-100 hover:bg-transparent">
                                        <TableHead className="h-10 text-[9px] font-bold text-gray-400">Reference</TableHead>
                                        <TableHead className="h-10 text-[9px] font-bold text-gray-400">Subject</TableHead>
                                        <TableHead className="h-10 text-[9px] font-bold text-gray-400">Entity</TableHead>
                                        <TableHead className="h-10 text-[9px] font-bold text-gray-400">Category</TableHead>
                                        <TableHead className="h-10 text-[9px] font-bold text-gray-400">Status</TableHead>
                                        <TableHead className="h-10 text-[9px] font-bold text-gray-400 text-right pr-6">Timestamp</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredRequests.map((req) => {
                                        const StatusIcon = getStatusIcon(req.status);
                                        return (
                                            <TableRow
                                                key={req.id}
                                                className="group border-gray-100 hover:bg-gray-50/50 transition-colors cursor-pointer"
                                                onClick={() => {
                                                    setSelectedRequest(req);
                                                    setIsDetailsOpen(true);
                                                }}
                                            >
                                                <TableCell className="py-3.5 font-mono text-[10px] text-[#F4D03F] font-bold">
                                                    #{req.id.substring(0, 8).toUpperCase()}
                                                </TableCell>
                                                <TableCell className="py-3.5">
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] font-bold text-[#1A1A1A] group-hover:text-[#1B9157] transition-colors leading-none">{req.subject}</span>
                                                        <span className="text-[9px] text-gray-400 line-clamp-1 mt-1">{req.description}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-3.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <Box className="w-3 h-3 text-gray-300" />
                                                        <span className="text-[10px] font-bold text-gray-500 tracking-tight">Unit: {req.id.slice(-4).toUpperCase()}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-3.5">
                                                    <Badge className="bg-gray-100 text-gray-400 border-none text-[8px] font-bold h-5 leading-none">{req.category}</Badge>
                                                </TableCell>
                                                <TableCell className="py-3.5">
                                                    <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[8px] font-bold shadow-sm", getStatusStyles(req.status))}>
                                                        <StatusIcon className="w-2.5 h-2.5" />
                                                        {req.status}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-3.5 text-right text-[9px] font-bold text-gray-400 pr-6">
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

            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-2xl bg-[#FFF9F0] border border-[#F4D03F]/20 rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-black tracking-tight">Request details</DialogTitle>
                        <DialogDescription className="text-[11px] font-bold text-gray-500">
                            Reference: #{selectedRequest?.id?.substring(0, 8)?.toUpperCase()}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="p-4 rounded-xl bg-white/70 border border-[#F4D03F]/10">
                                    <p className="text-[10px] font-bold text-gray-400">Status</p>
                                    <p className="text-sm font-black text-[#1A1A1A]">{selectedRequest.status}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-white/70 border border-[#F4D03F]/10">
                                    <p className="text-[10px] font-bold text-gray-400">Category</p>
                                    <p className="text-sm font-black text-[#1A1A1A]">{selectedRequest.category}</p>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-white/70 border border-[#F4D03F]/10">
                                <p className="text-[10px] font-bold text-gray-400">Subject</p>
                                <p className="text-sm font-black text-[#1A1A1A]">{selectedRequest.subject}</p>
                                <p className="text-[11px] text-gray-600 mt-2 whitespace-pre-wrap">{selectedRequest.description}</p>
                            </div>

                            <div className="flex gap-3 justify-end pt-2">
                                <Button variant="outline" onClick={() => setIsDetailsOpen(false)} className="rounded-xl">
                                    Close
                                </Button>
                                <Button
                                    onClick={() => {
                                        try {
                                            navigator.clipboard.writeText(selectedRequest.id);
                                            toast.success('Reference copied');
                                        } catch {
                                            toast.error('Could not copy reference');
                                        }
                                    }}
                                    className={cn(glass.btnPrimary, "h-9 px-4 text-xs font-bold rounded-xl")}
                                >
                                    Copy reference
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
            </motion.div>
        </BeeYieldPageShell>
    );
};

export default MyRequestsView;
