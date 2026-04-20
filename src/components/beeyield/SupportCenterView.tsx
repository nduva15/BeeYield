import React from 'react';
import { cn } from '@/lib/utils';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { ServiceForm } from './ServiceForm';
import { Loader2, Send, Printer, Headphones, Mail, Phone, MapPin, Search, Activity, ChevronRight, MessageSquare, ShieldCheck, X } from 'lucide-react';
import { beeyieldService, SupportRequest } from '@/services/beeyieldService';
import { AnimatePresence, motion } from 'framer-motion';
import { glass, PageHeader } from './GlassTheme';

interface SupportCenterViewProps {
    onTabChange: (tab: string) => void;
}

const SupportCenterView: React.FC<SupportCenterViewProps> = () => {
    const [activeTab, setActiveTab] = React.useState<'all' | 'new' | 'in_progress' | 'resolved'>('all');
    const [filterText, setFilterText] = React.useState('');
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [supportRequests, setSupportRequests] = React.useState<SupportRequest[]>([]);

    const [formData, setFormData] = React.useState({
        category: 'General',
        subject: '',
        description: '',
        priority: 'medium',
    });

    const loadRequests = async () => {
        setLoading(true);
        try {
            const data = await beeyieldService.getRequests();
            setSupportRequests(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadRequests();
    }, []);

    const normalizeStatus = React.useCallback((s: any) => String(s || '').toLowerCase().replace(/\s+/g, '_'), []);

    const stats = {
        total: supportRequests.length,
        lastRequest: supportRequests.length > 0 ? new Date(supportRequests[0].created_at).toLocaleDateString() : 'None',
        pending: supportRequests.filter(r => ['new', 'open', 'draft'].includes(normalizeStatus(r.status))).length,
        active: supportRequests.filter(r => ['in_progress'].includes(normalizeStatus(r.status))).length,
        completed: supportRequests.filter(r => ['resolved', 'closed'].includes(normalizeStatus(r.status))).length,
    };

    const filteredRequests = supportRequests.filter(request => {
        const s = normalizeStatus(request.status);
        const matchesTab =
            activeTab === 'all' ||
            (activeTab === 'new' && (s === 'new' || s === 'open' || s === 'draft')) ||
            (activeTab === 'in_progress' && s === 'in_progress') ||
            (activeTab === 'resolved' && (s === 'resolved' || s === 'closed'));
        const matchesFilter = request.subject?.toLowerCase().includes(filterText.toLowerCase());
        return matchesTab && matchesFilter;
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.subject || !formData.description) {
            toast.error("Required fields missing.");
            return;
        }

        setIsSubmitting(true);
        const { data } = await beeyieldService.createRequest({
            category: formData.category,
            subject: formData.subject,
            description: formData.description,
            priority: formData.priority as any,
            type: 'support'
        });

        if (data) {
            setSupportRequests(prev => [data, ...prev]);
            setIsDialogOpen(false);
            setFormData({ category: 'General', subject: '', description: '', priority: 'medium' });
            toast.success("Ticket Dispatched");
        }
        setIsSubmitting(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={glass.page}
        >
            <PageHeader
                icon={Headphones}
                label="Help Desk"
                title={<>Support <span className="text-[#F4D03F]">Page View</span></>}
                subtitle="High-priority assistance for your apiculture operations."
                actions={
                    <button
                        onClick={() => setIsDialogOpen(true)}
                        className={glass.btnPrimary}
                    >
                        New Ticket <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                }
            />

            {/* Print Layout */}
            <div className="hidden print:block">
                <ServiceForm />
            </div>

            <div className="print:hidden space-y-6">
                {/* KPI Section */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {[
                        { label: 'Total Tickets', value: stats.total, border: 'border-border/' },
                        { label: 'Pending', value: stats.pending, border: 'border-amber-500/20' },
                        { label: 'In Progress', value: stats.active, border: 'border-[#1B9157]/20' },
                        { label: 'Resolved', value: stats.completed, border: 'border-gray-200' },
                        { label: 'Last Contact', value: stats.lastRequest, border: 'border-border/' },
                    ].map((stat, i) => (
                        <div key={i} className={cn(glass.card, "p-4")}>
                            <p className={glass.microLabel}>{stat.label}</p>
                            <p className="text-xl font-bold tracking-tight text-foreground mt-2 truncate">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Contact Hero */}
                <div className={cn(glass.card, "p-6 lg:p-8 relative overflow-hidden")}>
                    <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#F4D03F]/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                        <div className="lg:col-span-8 space-y-4">
                            <div>
                                <h2 className="text-lg font-bold text-foreground tracking-tight">Contact <span className="text-[#F4D03F]">Support</span></h2>
                                <p className="text-sm text-muted-foreground max-w-xl leading-relaxed mt-1">
                                    Experts available for hardware calibration, app issues, or data interpretation.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { icon: Mail, label: 'Mail', value: 'support@beeyield.com' },
                                    { icon: Phone, label: 'Phone', value: '+254 700 000 000' },
                                    { icon: MapPin, label: 'Hub', value: 'Kibwezi, Kenya' }
                                ].map((item, idx) => (
                                    <div key={idx} className="space-y-1">
                                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/70">
                                            <item.icon className="w-3.5 h-3.5 text-[#F4D03F]" /> {item.label}
                                        </div>
                                        <p className="text-foreground font-bold text-sm truncate">{item.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className={cn(glass.badge, "bg-[#1B9157]/10 text-[#1B9157] border-[#1B9157]/20 w-fit py-1.5")}>
                                <Activity className="w-3.5 h-3.5 mr-2 animate-pulse" />
                                SLA: &lt; 2 Hours
                            </div>
                        </div>

                        <div className="lg:col-span-4 flex flex-col gap-3 justify-center">
                            <button className={glass.btnSecondary}>
                                <Activity className="w-4 h-4" /> Troubleshooting
                            </button>
                            <button onClick={() => window.print()} className={glass.btnSecondary}>
                                <Printer className="w-4 h-4" /> Export Service Form
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tickets Ledger */}
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex bg-gray-100/50 p-1 rounded-xl border border-gray-100 w-fit">
                            {['all', 'new', 'in_progress', 'resolved'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={cn(
                                        "px-4 h-8 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                                        activeTab === tab
                                            ? "bg-white text-foreground shadow-sm border border-border/"
                                            : "text-muted-foreground hover:text-gray-800"
                                    )}
                                >
                                    {tab.replace('_', ' ')}
                                </button>
                            ))}
                        </div>

                        <div className="relative group w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70 group-focus-within:text-[#F4D03F] transition-all" />
                            <input
                                id="support-center-filter"
                                name="search_tickets"
                                autoComplete="off"
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                                placeholder="Search tickets..."
                                className={cn(glass.input, "pl-10 w-full")}
                            />
                        </div>
                    </div>

                    <div className={cn(glass.table, "min-h-[400px]")}>
                        {loading ? (
                            <div className="flex items-center justify-center h-[400px]">
                                <Loader2 className="w-8 h-8 animate-spin text-[#F4D03F]/50" />
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <div className={cn(glass.emptyState, "h-[400px] border-none bg-transparent")}>
                                <Send className="w-12 h-12 text-[#F4D03F]/40" />
                                <h3 className="text-sm font-bold text-foreground">No Tickets Found</h3>
                                <p className="text-xs text-muted-foreground">All support channels are synchronized.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-muted/20">
                                        <tr>
                                            <th className={cn(glass.tableHead, "text-left")}>Subject</th>
                                            <th className={cn(glass.tableHead, "text-left")}>Priority</th>
                                            <th className={cn(glass.tableHead, "text-left")}>Status</th>
                                            <th className={cn(glass.tableHead, "text-left")}>Created</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#F4D03F]/10">
                                        {filteredRequests.map((request) => (
                                            <tr key={request.id} className={glass.tableRow}>
                                                <td className="px-4 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-foreground truncate">{request.subject}</span>
                                                        <span className="text-xs text-muted-foreground mt-1">{request.category}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={cn(
                                                        glass.badge,
                                                        request.priority === 'high' ? "bg-red-50 text-red-600 border-red-200" : "bg-blue-50 text-blue-600 border-blue-200"
                                                    )}>
                                                        {request.priority || 'medium'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn(
                                                            "w-2 h-2 rounded-full",
                                                            request.status === 'new' ? "bg-amber-400" :
                                                                request.status === 'in_progress' ? "bg-blue-500" :
                                                                    "bg-[#1B9157]"
                                                        )} />
                                                        <span className="text-xs font-bold text-muted-foreground">{request.status.replace('_', ' ')}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-xs font-bold text-muted-foreground/70 tabular-nums">
                                                    {new Date(request.created_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                <AnimatePresence>
                    {isDialogOpen && (
                        <div
                            className={cn(glass.modalOverlay, "z-[120] p-4 sm:p-6")}
                            onClick={() => setIsDialogOpen(false)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.96, y: 24 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.96, y: 24 }}
                                transition={{ duration: 0.2, ease: 'easeOut' }}
                                className={cn(glass.modalCard, "max-w-2xl max-h-[90vh] overflow-y-auto")}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-8 lg:p-10 relative overflow-hidden bg-card">
                                    <button
                                        type="button"
                                        onClick={() => setIsDialogOpen(false)}
                                        className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-lg border border-border/ bg-muted/ text-foreground/60 shadow-sm transition hover:bg-white hover:text-foreground"
                                        aria-label="Close new ticket form"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#F4D03F]/5 rounded-full blur-3xl pointer-events-none" />

                                    <div className="mb-8 flex items-center gap-4 pr-12 relative z-10">
                                        <div className="w-12 h-12 bg-muted/20 rounded-xl flex items-center justify-center border border-border/ shadow-sm">
                                            <MessageSquare className="w-5 h-5 text-[#F4D03F]" />
                                        </div>
                                        <div>
                                            <h2 className={glass.sectionTitle}>New <span className="text-[#F4D03F]">Ticket</span></h2>
                                            <p className={glass.microLabel}>Submit support request to Mission Control</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className={glass.microLabel}>Category</Label>
                                                <Select value={formData.category} onValueChange={(val) => handleSelectChange('category', val)}>
                                                    <SelectTrigger id="support-ticket-category" aria-label="Category" className={glass.select}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className={glass.selectContent}>
                                                        <SelectItem value="Hardware" className="p-2 font-bold uppercase text-xs">Hardware Calibration</SelectItem>
                                                        <SelectItem value="Software" className="p-2 font-bold uppercase text-xs">Software / App Issue</SelectItem>
                                                        <SelectItem value="Traceability" className="p-2 font-bold uppercase text-xs">Data / API Query</SelectItem>
                                                        <SelectItem value="General" className="p-2 font-bold uppercase text-xs">General Inquiry</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className={glass.microLabel}>Priority</Label>
                                                <Select value={formData.priority} onValueChange={(val) => handleSelectChange('priority', val)}>
                                                    <SelectTrigger id="support-ticket-priority" aria-label="Priority" className={glass.select}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className={glass.selectContent}>
                                                        <SelectItem value="low" className="p-2 font-bold uppercase text-xs">Low Priority</SelectItem>
                                                        <SelectItem value="medium" className="p-2 font-bold uppercase text-xs">Standard Priority</SelectItem>
                                                        <SelectItem value="high" className="p-2 font-bold uppercase text-xs text-red-600">High / Urgent</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="support-ticket-subject" className={glass.microLabel}>Subject</Label>
                                            <Input
                                                id="support-ticket-subject"
                                                name="subject"
                                                autoComplete="off"
                                                value={formData.subject}
                                                onChange={handleInputChange}
                                                placeholder="Briefly describe the issue..."
                                                className={glass.input}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="support-ticket-description" className={glass.microLabel}>Description</Label>
                                            <Textarea
                                                id="support-ticket-description"
                                                name="description"
                                                autoComplete="off"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                placeholder="Provide full details..."
                                                className={cn(glass.input, "min-h-[140px] py-3 resize-none")}
                                            />
                                        </div>

                                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-border/">
                                            <div className="flex items-center gap-2 opacity-60">
                                                <ShieldCheck className="w-5 h-5 text-[#1B9157]" />
                                                <p className={glass.microLabel}>Secure Channels Active</p>
                                            </div>
                                            <div className="flex gap-3 w-full md:w-auto">
                                                <button type="button" onClick={() => setIsDialogOpen(false)} className={glass.btnSecondary}>
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className={glass.btnPrimary}
                                                >
                                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Dispatch Ticket"}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default SupportCenterView;

