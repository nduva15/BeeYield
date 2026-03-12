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
            priority: formData.priority as any
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
                label="Mission Control & Telemetry Support v2.0"
                title={<>Nexus <span className="text-[#F4D03F]">Concierge</span></>}
                subtitle="High-priority support for your apiary industrial control systems."
                actions={
                    <Button
                        onClick={() => setIsDialogOpen(true)}
                        className="h-10 bg-[#1B9157] text-white hover:bg-[#1B9157]/90 rounded-xl px-6 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-[#1B9157]/20"
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
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    {[
                        { label: 'Total Flux', value: stats.total, color: 'text-[#1A1A1A]', bg: 'bg-[#F4D03F]' },
                        { label: 'Pending Node', value: stats.pending, color: 'text-amber-600', bg: 'bg-amber-400' },
                        { label: 'Active Link', value: stats.active, color: 'text-[#1B9157]', bg: 'bg-[#1B9157]' },
                        { label: 'Archive', value: stats.completed, color: 'text-[#1A1A1A]/40', bg: 'bg-[#1A1A1A]/10' },
                        { label: 'Last Comms', value: stats.lastRequest, color: 'text-[#1A1A1A]', bg: 'bg-blue-400' },
                    ].map((stat, i) => (
                        <div key={i} className={cn(glass.card, "p-4 space-y-2 border-[#1A1A1A]/5 bg-[#FFF9F0]/80 rounded-2xl relative overflow-hidden group")}>
                            <div className={cn("absolute top-0 left-0 w-full h-[2px] opacity-10", stat.bg)} />
                            <p className="text-[9px] font-black text-[#1A1A1A]/30 uppercase tracking-widest italic">{stat.label}</p>
                            <p className={cn("text-2xl font-black tracking-tighter truncate", stat.color)}>{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Contact Hero */}
                <div className={cn(glass.card, "p-8 lg:p-12 bg-[#FFF9F0]/80 rounded-[2.5rem] relative overflow-hidden group border-[#F4D03F]/10")}>
                    <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#F4D03F]/5 rounded-full blur-3xl pointer-events-none group-hover:bg-[#F4D03F]/10 transition-all duration-1000" />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-3xl font-black text-[#1A1A1A] mb-4 tracking-tighter italic uppercase leading-none">Contact <span className="text-[#F4D03F]">Concierge</span></h2>
                                <p className="text-[#1A1A1A]/50 font-medium max-w-xl leading-relaxed italic text-sm">
                                    Our industrial telemetry experts are available 24/7 to assist with BeeHUB synchronization, kernel updates, or sensor calibration.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { icon: Mail, label: 'Kernel Mail', value: 'support@beeyield.com' },
                                    { icon: Phone, label: 'Direct Pulse', value: '+254 700 000 000' },
                                    { icon: MapPin, label: 'Sector Hub', value: 'Kibwezi, Kenya' }
                                ].map((item, idx) => (
                                    <div key={idx} className="space-y-1">
                                        <div className="flex items-center gap-2 text-[8px] font-black text-[#1A1A1A]/30 uppercase tracking-[0.2em] italic">
                                            <item.icon className="w-3 h-3 text-[#F4D03F]" /> {item.label}
                                        </div>
                                        <p className="text-[#1A1A1A] font-black italic text-xs truncate">{item.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-3 py-3 px-5 bg-[#1B9157]/5 border border-[#1B9157]/10 rounded-xl w-fit">
                                <span className="w-2 h-2 rounded-full bg-[#1B9157] animate-pulse" />
                                <p className="text-[#1B9157] text-[10px] font-black uppercase tracking-widest italic">Response_SLA: &lt; 2 Hours</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 justify-center">
                            <Button
                                variant="outline"
                                className="h-12 rounded-xl border-[#1A1A1A]/10 bg-white/50 font-black uppercase tracking-widest text-[9px] italic hover:bg-[#F4D03F]/10 transition-all"
                                onClick={() => toast.info("Manuals loading...")}
                            >
                                <Activity className="w-4 h-4 mr-2" /> Technical Protocols
                            </Button>
                            <Button
                                onClick={() => window.print()}
                                className="h-12 rounded-xl bg-[#F4D03F] hover:bg-[#F4D03F]/90 text-[#1A1A1A] font-black uppercase tracking-widest text-[9px] italic gap-3 shadow-lg shadow-[#F4D03F]/10"
                            >
                                <Printer className="w-4 h-4" /> Export Service Form
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Tickets Ledger */}
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex bg-[#1A1A1A]/5 p-1 rounded-xl border border-[#F4D03F]/10 w-fit">
                            {['all', 'new', 'in_progress', 'resolved'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={cn(
                                        "px-4 h-8 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all italic",
                                        activeTab === tab
                                            ? "bg-white text-[#1A1A1A] shadow-sm"
                                            : "text-[#1A1A1A]/30 hover:text-[#1A1A1A]/60"
                                    )}
                                >
                                    {tab.replace('_', ' ')}
                                </button>
                            ))}
                        </div>

                        <div className="relative group w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#1A1A1A]/20 group-focus-within:text-[#F4D03F] transition-all" />
                            <input
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                                placeholder="Search archives..."
                                className="w-full h-10 bg-[#FFF9F0]/80 border border-[#F4D03F]/10 rounded-xl pl-10 pr-4 text-[11px] font-black italic text-[#1A1A1A] outline-none focus:ring-1 focus:ring-[#F4D03F]/30 transition-all"
                            />
                        </div>
                    </div>

                    <div className={cn(glass.card, "p-0 overflow-hidden bg-[#FFF9F0]/80 rounded-3xl min-h-[400px]")}>
                        {loading ? (
                            <div className="flex items-center justify-center h-[400px]">
                                <Loader2 className="w-8 h-8 animate-spin text-[#F4D03F]/20" />
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[400px] text-center p-8 opacity-40 italic">
                                <Send className="w-12 h-12 mb-4 opacity-20" />
                                <h3 className="text-sm font-black uppercase tracking-widest mb-1">Null_Records_Found</h3>
                                <p className="text-[10px] font-medium uppercase tracking-widest opacity-60">Ledger is optimized & synchronized.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-[#1A1A1A]/5">
                                        <tr>
                                            <th className="px-8 py-4 text-left text-[9px] font-black text-[#1A1A1A]/30 uppercase tracking-[0.2em] italic">Sequence_Subject</th>
                                            <th className="px-8 py-4 text-left text-[9px] font-black text-[#1A1A1A]/30 uppercase tracking-[0.2em] italic">Priority_Hash</th>
                                            <th className="px-8 py-4 text-left text-[9px] font-black text-[#1A1A1A]/30 uppercase tracking-[0.2em] italic">Kernel_Status</th>
                                            <th className="px-8 py-4 text-left text-[9px] font-black text-[#1A1A1A]/30 uppercase tracking-[0.2em] italic">Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#F4D03F]/5">
                                        {filteredRequests.map((request) => (
                                            <tr key={request.id} className="hover:bg-[#F4D03F]/[0.02] transition-colors cursor-pointer group">
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-[#1A1A1A] group-hover:text-[#1B9157] transition-colors italic uppercase leading-none">{request.subject}</span>
                                                        <span className="text-[9px] font-black text-[#1A1A1A]/30 uppercase tracking-widest italic mt-1.5">{request.category}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={cn(
                                                        "px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full italic",
                                                        request.priority === 'high' ? "bg-red-500/10 text-red-600" : "bg-blue-500/10 text-blue-600"
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
                                                        <span className="text-[10px] font-black text-[#1A1A1A]/60 uppercase tracking-widest italic">{request.status.replace('_', ' ')}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-[10px] font-black text-[#1A1A1A]/30 tabular-nums italic">
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
                    <DialogContent className="sm:max-w-[700px] p-0 rounded-[3rem] border-none shadow-2xl overflow-hidden bg-[#FFF9F0]">
                        <div className="p-10 lg:p-14 relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#F4D03F]/5 rounded-full blur-3xl" />
                            
                            <div className="mb-10 flex items-center gap-5">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border-2 border-[#F4D03F]/10 shadow-sm">
                                    <MessageSquare className="w-6 h-6 text-[#F4D03F]" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-[#1A1A1A] tracking-tighter italic uppercase leading-none">New <span className="text-[#F4D03F]">Protocol</span> Ticket</h2>
                                    <p className="text-[10px] font-black text-[#1A1A1A]/30 uppercase tracking-widest italic mt-1">Encrypted Support Session v4.1</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label className="text-[9px] font-black text-[#1A1A1A]/30 uppercase tracking-widest italic ml-4">Dispatch Category</Label>
                                        <Select value={formData.category} onValueChange={(val) => handleSelectChange('category', val)}>
                                            <SelectTrigger className="h-14 rounded-2xl border border-[#F4D03F]/10 bg-white/50 px-6 font-black italic text-[#1A1A1A] text-sm">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-[#F4D03F]/10 shadow-3xl bg-white">
                                                <SelectItem value="Hardware" className="p-4 font-black italic uppercase text-xs">Hardware Calibration</SelectItem>
                                                <SelectItem value="Software" className="p-4 font-black italic uppercase text-xs">Kernel / App Issue</SelectItem>
                                                <SelectItem value="Traceability" className="p-4 font-black italic uppercase text-xs">Ledger / API Query</SelectItem>
                                                <SelectItem value="General" className="p-4 font-black italic uppercase text-xs">General Logistics</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[9px] font-black text-[#1A1A1A]/30 uppercase tracking-widest italic ml-4">Response Priority</Label>
                                        <Select value={formData.priority} onValueChange={(val) => handleSelectChange('priority', val)}>
                                            <SelectTrigger className="h-14 rounded-2xl border border-[#F4D03F]/10 bg-white/50 px-6 font-black italic text-[#1A1A1A] text-sm">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-[#F4D03F]/10 shadow-3xl bg-white">
                                                <SelectItem value="low" className="p-4 font-black italic uppercase text-xs">Low Flux</SelectItem>
                                                <SelectItem value="medium" className="p-4 font-black italic uppercase text-xs">Standard Nominal</SelectItem>
                                                <SelectItem value="high" className="p-4 font-black italic uppercase text-xs text-red-600">High / Critical Alert</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[9px] font-black text-[#1A1A1A]/30 uppercase tracking-widest italic ml-4">Mission Subject</Label>
                                    <Input
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        placeholder="Identify the anomaly..."
                                        className="h-14 rounded-2xl border border-[#F4D03F]/10 bg-white/50 px-6 font-black italic text-[#1A1A1A] placeholder:text-[#1A1A1A]/20"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[9px] font-black text-[#1A1A1A]/30 uppercase tracking-widest italic ml-4">Telemetry Details</Label>
                                    <Textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Full context for technical dispatch..."
                                        className="min-h-[160px] rounded-2xl border border-[#F4D03F]/10 bg-white/50 p-6 font-medium text-[#1A1A1A] placeholder:text-[#1A1A1A]/20 resize-none italic"
                                    />
                                </div>

                                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-[#F4D03F]/10">
                                    <div className="flex items-center gap-3 opacity-30">
                                        <ShieldCheck className="w-5 h-5" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">Encrypted_Payload: OK</p>
                                    </div>
                                    <div className="flex gap-4 w-full md:w-auto">
                                        <Button variant="ghost" type="button" onClick={() => setIsDialogOpen(false)} className="h-14 flex-1 md:px-8 rounded-2xl font-black uppercase tracking-widest text-[9px] text-[#1A1A1A]/40 hover:text-[#1A1A1A] italic">
                                            Abort
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="h-14 flex-1 md:px-12 rounded-2xl bg-[#1B9157] hover:bg-[#1B9157]/90 text-white font-black uppercase tracking-widest text-[10px] italic shadow-xl shadow-green-500/10"
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
