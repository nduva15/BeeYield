import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ServiceForm } from './ServiceForm';
import { Loader2, Send, Printer, Headphones, Mail, Phone, MapPin, Search, Activity, ChevronRight, MessageSquare, ShieldCheck, Clock } from 'lucide-react';
import { beeyieldService, SupportRequest } from '@/services/beeyieldService';
import { motion } from 'framer-motion';
import { glass, PageHeader } from './GlassTheme';

interface SupportCenterViewProps {
    onTabChange: (tab: string) => void;
}

const SupportCenterView: React.FC<SupportCenterViewProps> = ({ onTabChange }) => {
    const { user } = useAuth();
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

    const stats = {
        total: supportRequests.length,
        lastRequest: supportRequests.length > 0 ? new Date(supportRequests[0].created_at).toLocaleDateString() : 'None',
        pending: supportRequests.filter(r => r.status === 'new').length,
        active: supportRequests.filter(r => r.status === 'in_progress').length,
        completed: supportRequests.filter(r => r.status === 'resolved').length,
    };

    const filteredRequests = supportRequests.filter(request => {
        const matchesTab = activeTab === 'all' || request.status === activeTab;
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
        const { data, error } = await beeyieldService.createRequest({
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
            className={cn(glass.page, "p-4 lg:p-6 space-y-6 pb-20 max-w-7xl mx-auto")}
        >
            <PageHeader
                icon={Headphones}
                label="BeeYield Support Terminal"
                title={<>Support <span className="text-[#F4D03F]">Center</span></>}
                subtitle="High-priority assistance for your apiculture operations."
                actions={
                    <Button
                        onClick={() => setIsDialogOpen(true)}
                        className={cn(glass.btnPrimary, "h-9 px-4 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2")}
                    >
                        New Ticket <ChevronRight className="w-4 h-4" />
                    </Button>
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
                        { label: 'Total Tickets', value: stats.total, border: 'border-[#F4D03F]/20' },
                        { label: 'Pending', value: stats.pending, border: 'border-amber-500/20' },
                        { label: 'In Progress', value: stats.active, border: 'border-[#1B9157]/20' },
                        { label: 'Resolved', value: stats.completed, border: 'border-gray-200' },
                        { label: 'Last Contact', value: stats.lastRequest, border: 'border-[#F4D03F]/20' },
                    ].map((stat, i) => (
                        <div key={i} className={cn(glass.card, "p-4 space-y-1 bg-[#FFF9F0]/50 border-[#F4D03F]/10 overflow-hidden")}>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <p className={cn("text-lg font-black tracking-tight truncate text-[#1A1A1A]")}>{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Contact Hero */}
                <div className={cn(glass.card, "p-6 lg:p-8 relative overflow-hidden")}>
                    <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#F4D03F]/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-lg font-bold text-[#1A1A1A] mb-1 tracking-tight uppercase">Contact <span className="text-[#F4D03F]">Support</span></h2>
                                <p className="text-gray-400 font-medium max-w-xl leading-relaxed text-[11px]">
                                    Experts available for hardware calibration, app issues, or data interpretation.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { icon: Mail, label: 'Mail', value: 'support@beeyield.com' },
                                    { icon: Phone, label: 'Phone', value: '+254 700 000 000' },
                                    { icon: MapPin, label: 'Hub', value: 'Kibwezi, Kenya' }
                                ].map((item, idx) => (
                                    <div key={idx} className="space-y-0.5">
                                        <div className="flex items-center gap-1.5 text-[8px] font-bold text-[#1A1A1A]/30 uppercase tracking-wider">
                                            <item.icon className="w-2.5 h-2.5 text-[#F4D03F]" /> {item.label}
                                        </div>
                                        <p className="text-[#1A1A1A] font-bold text-[10px] truncate">{item.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-2 py-2 px-4 bg-[#1B9157]/5 border border-[#1B9157]/10 rounded-lg w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#1B9157] animate-pulse" />
                                <p className="text-[#1B9157] text-[9px] font-bold uppercase tracking-widest">SLA: &lt; 2 Hours</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 justify-center">
                            <Button
                                variant="outline"
                                className="h-9 rounded-xl border-[#F4D03F]/10 bg-white/50 font-bold uppercase tracking-widest text-[9px]"
                            >
                                <Activity className="w-3.5 h-3.5 mr-2" /> Technical Protocols
                            </Button>
                            <Button
                                onClick={() => window.print()}
                                className={cn(glass.btnPrimary, "h-9 text-[9px]")}
                            >
                                <Printer className="w-3.5 h-3.5" /> Export Service Form
                            </Button>
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
                                        "px-4 h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                                        activeTab === tab
                                            ? "bg-white text-[#1A1A1A] shadow-sm border border-gray-100"
                                            : "text-gray-400 hover:text-gray-600"
                                    )}
                                >
                                    {tab.replace('_', ' ')}
                                </button>
                            ))}
                        </div>

                        <div className="relative group w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-[#F4D03F] transition-all" />
                            <input
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                                placeholder="Search tickets..."
                                className="w-full h-10 bg-white border border-gray-200 rounded-xl pl-9 pr-4 text-[11px] font-medium text-[#1A1A1A] outline-none focus:ring-1 focus:ring-[#F4D03F]/30 transition-all"
                            />
                        </div>
                    </div>

                    <div className={cn(glass.card, "p-0 overflow-hidden bg-white/50 backdrop-blur-md rounded-2xl min-h-[400px] shadow-sm")}>
                        {loading ? (
                            <div className="flex items-center justify-center h-[400px]">
                                <Loader2 className="w-8 h-8 animate-spin text-[#F4D03F]/20" />
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[400px] text-center p-8 opacity-40">
                                <Send className="w-12 h-12 mb-4 opacity-10" />
                                <h3 className="text-sm font-bold uppercase tracking-widest mb-1">No Tickets Found</h3>
                                <p className="text-[10px] font-medium uppercase tracking-widest opacity-60">All support channels are synchronized.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Subject</th>
                                            <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Priority</th>
                                            <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Status</th>
                                            <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Created</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredRequests.map((request) => (
                                            <tr key={request.id} className="hover:bg-gray-50/30 transition-colors cursor-pointer group">
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-[#1A1A1A] group-hover:text-[#1B9157] transition-colors leading-none">{request.subject}</span>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">{request.category}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={cn(
                                                        "px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-md",
                                                        request.priority === 'high' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                                                    )}>
                                                        {request.priority || 'medium'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn(
                                                            "w-1.5 h-1.5 rounded-full",
                                                            request.status === 'new' ? "bg-amber-400" :
                                                                request.status === 'in_progress' ? "bg-blue-500" :
                                                                    "bg-[#1B9157]"
                                                        )} />
                                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{request.status.replace('_', ' ')}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-[10px] font-bold text-gray-400 tabular-nums">
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

                {/* Dialog Implementation */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[650px] p-0 rounded-3xl border-none shadow-2xl overflow-hidden bg-white">
                        <div className="p-10 lg:p-12 relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#F4D03F]/5 rounded-full blur-3xl" />
                            
                            <div className="mb-8 flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 shadow-sm">
                                    <MessageSquare className="w-5 h-5 text-[#F4D03F]" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-[#1A1A1A] tracking-tight uppercase leading-none">New <span className="text-[#F4D03F]">Ticket</span></h2>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Submit support request to Mission Control</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Category</Label>
                                        <Select value={formData.category} onValueChange={(val) => handleSelectChange('category', val)}>
                                            <SelectTrigger className="h-10 rounded-xl border border-gray-100 bg-gray-50 px-4 font-bold text-[#1A1A1A] text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-gray-100 shadow-xl bg-white">
                                                <SelectItem value="Hardware" className="p-3 font-bold uppercase text-[10px]">Hardware Calibration</SelectItem>
                                                <SelectItem value="Software" className="p-3 font-bold uppercase text-[10px]">Software / App Issue</SelectItem>
                                                <SelectItem value="Traceability" className="p-3 font-bold uppercase text-[10px]">Data / API Query</SelectItem>
                                                <SelectItem value="General" className="p-3 font-bold uppercase text-[10px]">General Inquiry</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Priority</Label>
                                        <Select value={formData.priority} onValueChange={(val) => handleSelectChange('priority', val)}>
                                            <SelectTrigger className="h-10 rounded-xl border border-gray-100 bg-gray-50 px-4 font-bold text-[#1A1A1A] text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-gray-100 shadow-xl bg-white">
                                                <SelectItem value="low" className="p-3 font-bold uppercase text-[10px]">Low Priority</SelectItem>
                                                <SelectItem value="medium" className="p-3 font-bold uppercase text-[10px]">Standard Priority</SelectItem>
                                                <SelectItem value="high" className="p-3 font-bold uppercase text-[10px] text-red-600">High / Urgent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Subject</Label>
                                    <Input
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        placeholder="Briefly describe the issue..."
                                        className="h-10 rounded-xl border border-gray-100 bg-gray-50 px-4 font-bold text-[#1A1A1A] placeholder:text-gray-300 text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Description</Label>
                                    <Textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Provide full details..."
                                        className="min-h-[140px] rounded-xl border border-gray-100 bg-gray-50 p-4 font-medium text-[#1A1A1A] placeholder:text-gray-300 resize-none text-sm"
                                    />
                                </div>

                                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-gray-100">
                                    <div className="flex items-center gap-2.5 opacity-40">
                                        <ShieldCheck className="w-5 h-5 text-[#1B9157]" />
                                        <p className="text-[9px] font-bold uppercase tracking-widest">Secure Channels Active</p>
                                    </div>
                                    <div className="flex gap-4 w-full md:w-auto">
                                        <Button variant="ghost" type="button" onClick={() => setIsDialogOpen(false)} className="h-10 flex-1 md:px-8 rounded-xl font-bold uppercase tracking-widest text-[10px] text-gray-400 hover:text-[#1A1A1A]">
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className={cn(glass.btnPrimary, "h-10 flex-1 md:px-12 rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-[#1B9157]/10")}
                                        >
                                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Dispatch Ticket"}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </motion.div>
    );
};

export default SupportCenterView;
