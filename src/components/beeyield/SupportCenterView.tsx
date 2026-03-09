import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { Loader2, Paperclip, Send, Printer, Headphones, Mail, Phone, MapPin, Search } from 'lucide-react';
import { beeyieldService, SupportRequest } from '@/services/beeyieldService';

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

    // Form State
    const [formData, setFormData] = React.useState({
        category: 'General',
        subject: '',
        description: '',
        priority: 'medium',
    });

    const loadRequests = async () => {
        setLoading(true);
        const data = await beeyieldService.getRequests();
        setSupportRequests(data);
        setLoading(false);
    };

    React.useEffect(() => {
        loadRequests();
    }, []);

    const stats = {
        total: supportRequests.length,
        lastRequest: supportRequests.length > 0 ? new Date(supportRequests[0].created_at).toLocaleDateString() : 'None yet',
        pending: supportRequests.filter(r => r.status === 'new').length,
        active: supportRequests.filter(r => r.status === 'in_progress').length,
        completed: supportRequests.filter(r => r.status === 'resolved').length,
    };

    const filteredRequests = supportRequests.filter(request => {
        const matchesTab = activeTab === 'all' || request.status === activeTab;
        const matchesFilter = request.subject.toLowerCase().includes(filterText.toLowerCase());
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
            toast.error("Please fill in all required fields.");
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
        }
        setIsSubmitting(false);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <div className="hidden print:block fixed inset-0 z-[9999] bg-white">
                <ServiceForm />
            </div>

            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 print:hidden">
                {/* Header Section */}
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">Support Centre</h1>
                    <p className="text-sm font-medium text-slate-400 dark:text-slate-500">How can we help you today?</p>
                </div>

                {/* KPI Section */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {[
                        { label: 'TOTAL REQUESTS', value: stats.total, color: 'text-blue-600', bg: 'bg-blue-500' },
                        { label: 'LAST REQUEST', value: stats.lastRequest, color: 'text-slate-800', bg: 'bg-sky-400' },
                        { label: 'PENDING', value: stats.pending, color: 'text-amber-600', bg: 'bg-amber-400' },
                        { label: 'IN PROGRESS', value: stats.active, color: 'text-green-600', bg: 'bg-green-500' },
                        { label: 'RESOLVED', value: stats.completed, color: 'text-slate-400', bg: 'bg-slate-300' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-[#111111] p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm relative overflow-hidden h-32 flex flex-col justify-between group hover:border-amber-200 transition-all">
                            <div className={cn("absolute top-0 left-0 w-full h-[3px]", stat.bg)} />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <span className={cn("text-3xl font-black tracking-tighter", stat.color)}>{stat.value}</span>
                        </div>
                    ))}
                </div>

                {/* Contact & Support Actions */}
                <div className="bg-white dark:bg-[#0c0c0e] rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-12 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/[0.03] rounded-full -mr-32 -mt-32 blur-3xl transition-transform group-hover:scale-110" />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
                        <div className="lg:col-span-8 space-y-10">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-4">Contact Support Centre</h2>
                                <p className="text-slate-500 font-medium max-w-xl leading-relaxed">
                                    Our technical team is available 24/7 to assist with your BeeHUB devices, harvest software, or farm data questions.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                        <Mail className="w-3.5 h-3.5" /> Email
                                    </div>
                                    <p className="text-slate-800 dark:text-slate-200 font-bold">support@beeyield.com</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                        <Phone className="w-3.5 h-3.5" /> WhatsApp
                                    </div>
                                    <p className="text-slate-800 dark:text-slate-200 font-bold">+254 700 000 000</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                        <MapPin className="w-3.5 h-3.5" /> Office
                                    </div>
                                    <p className="text-slate-800 dark:text-slate-200 font-bold">Kibwezi, Kenya</p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 dark:border-white/5">
                                <p className="text-green-600 dark:text-green-500 text-sm font-bold flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                                    Expected response time: Under 2 hours.
                                </p>
                            </div>
                        </div>

                        <div className="lg:col-span-4 flex flex-col gap-4 justify-center">
                            <Button
                                variant="outline"
                                className="h-14 rounded-2xl border-2 border-slate-100 dark:border-white/10 font-black uppercase tracking-widest text-[11px] hover:bg-slate-50 transition-all dark:bg-white/[0.02]"
                                onClick={() => toast.info("Manuals loading...")}
                            >
                                Technical Manuals
                            </Button>
                            <Button
                                onClick={handlePrint}
                                className="h-14 rounded-2xl bg-[#F4D03F] hover:bg-[#ebc735] text-slate-800 font-black uppercase tracking-widest text-[11px] gap-3 shadow-xl shadow-amber-500/10"
                            >
                                <Printer className="w-5 h-5" /> Print Service Form
                            </Button>

                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="h-14 rounded-2xl bg-[#1B9157] hover:bg-[#167d4a] text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-green-500/10 hover:scale-[1.02] transition-all">
                                        Open Ticket Online
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[700px] p-0 rounded-[3rem] border-none shadow-2xl overflow-hidden bg-[#FAF9F6] dark:bg-[#0c0c0e]">
                                    <div className="p-12 relative">
                                        <div className="mb-10">
                                            <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2 tracking-tighter">New Support Ticket</h2>
                                            <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">Secure help request</p>
                                        </div>

                                        <form onSubmit={handleSubmit} className="space-y-8">
                                            <div className="grid grid-cols-2 gap-8">
                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</Label>
                                                    <Select name="category" value={formData.category} onValueChange={(val) => handleSelectChange('category', val)}>
                                                        <SelectTrigger id="support-category" className="h-16 rounded-2xl border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-6 font-bold text-slate-700 dark:text-slate-300">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                                                            <SelectItem value="Hardware" className="p-4 font-bold text-slate-700">Hardware Support</SelectItem>
                                                            <SelectItem value="Software" className="p-4 font-bold text-slate-700">Software Request</SelectItem>
                                                            <SelectItem value="Traceability" className="p-4 font-bold text-slate-700">Product History</SelectItem>
                                                            <SelectItem value="General" className="p-4 font-bold text-slate-700">General</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority</Label>
                                                    <Select name="priority" value={formData.priority} onValueChange={(val) => handleSelectChange('priority', val)}>
                                                        <SelectTrigger id="support-priority" className="h-16 rounded-2xl border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-6 font-bold text-slate-700 dark:text-slate-300">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                                                            <SelectItem value="low" className="p-4 font-bold text-slate-700">Low</SelectItem>
                                                            <SelectItem value="medium" className="p-4 font-bold text-slate-700">Medium</SelectItem>
                                                            <SelectItem value="high" className="p-4 font-bold text-slate-700">High / Critical</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</Label>
                                                <Input
                                                    id="support-subject"
                                                    name="subject"
                                                    value={formData.subject}
                                                    onChange={handleInputChange}
                                                    placeholder="Briefly describe the issue..."
                                                    className="h-16 rounded-2xl border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-6 font-bold text-slate-800 dark:text-white focus-visible:border-amber-400 transition-colors"
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</Label>
                                                <Textarea
                                                    id="support-description"
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleInputChange}
                                                    placeholder="Detailed explanation..."
                                                    className="min-h-[160px] rounded-2xl border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 font-medium text-slate-800 dark:text-white resize-none focus-visible:border-amber-400 transition-colors"
                                                />
                                            </div>

                                            <div className="flex items-center justify-between pt-6">
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Encrypted Session</p>
                                                <div className="flex gap-4">
                                                    <Button variant="ghost" type="button" onClick={() => setIsDialogOpen(false)} className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[11px] text-slate-400 hover:text-slate-600">
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        disabled={isSubmitting}
                                                        className="h-14 px-8 rounded-2xl bg-[#1B9157] hover:bg-[#167d4a] text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-green-500/10"
                                                    >
                                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Ticket"}
                                                    </Button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {['all', 'new', 'in_progress', 'resolved'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={cn(
                                        "px-6 h-11 rounded-full text-[11px] font-black uppercase tracking-widest transition-all",
                                        activeTab === tab
                                            ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10"
                                            : "hover:bg-slate-100 text-slate-400"
                                    )}
                                >
                                    {tab.replace('_', ' ')}
                                </button>
                            ))}
                        </div>

                        <div className="relative group min-w-[300px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-amber-500 transition-all" />
                            <input
                                id="ticket-search"
                                name="ticket-search"
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                                placeholder="Search tickets..."
                                className="w-full h-11 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-full pl-11 pr-4 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500/30 transition-all"
                            />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#0c0c0e] rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden min-h-[400px]">
                        {loading ? (
                            <div className="flex items-center justify-center h-[400px]">
                                <Loader2 className="w-8 h-8 animate-spin text-slate-200" />
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[400px] text-center p-8">
                                <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mb-6">
                                    <Send className="w-8 h-8 text-slate-200" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No tickets found</h3>
                                <p className="text-sm font-medium text-slate-400 max-w-xs leading-relaxed">
                                    {filterText ? "Try searching for something else." : "You're all set! No active support tickets."}
                                </p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-50 dark:border-white/5">
                                    <tr>
                                        <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Subject</th>
                                        <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Priority</th>
                                        <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                        <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Created</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                                    {filteredRequests.map((request) => (
                                        <tr key={request.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors cursor-pointer group">
                                            <td className="px-10 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-slate-800 dark:text-slate-200 group-hover:text-[#1B9157] transition-colors">{request.subject}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{request.category}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <span className={cn(
                                                    "px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg",
                                                    request.priority === 'high' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                                                )}>
                                                    {request.priority || 'medium'}
                                                </span>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "w-1.5 h-1.5 rounded-full",
                                                        request.status === 'new' ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" :
                                                            request.status === 'in_progress' ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" :
                                                                "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                                                    )} />
                                                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">{request.status.replace('_', ' ')}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 text-[11px] font-bold text-slate-400 tabular-nums">
                                                {new Date(request.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default SupportCenterView;
