import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
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
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ServiceForm } from './ServiceForm';
import { Loader2, Paperclip, Send, Printer } from 'lucide-react';

interface SupportRequest {
    id: string;
    title: string;
    status: 'new' | 'in_progress' | 'resolved';
    date: string;
    category?: string;
}

interface SupportCenterViewProps {
    onTabChange: (tab: string) => void;
}

const SupportCenterView: React.FC<SupportCenterViewProps> = ({ onTabChange }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'all' | 'new' | 'in_progress' | 'resolved'>('all');
    const [filterText, setFilterText] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        category: '',
        subject: '',
        email: user?.email || '',
        priority: 'normal',
        serialNumber: '',
        description: '',
        files: null as FileList | null,
    });

    // Support requests - Empty by default, should be populated from API
    const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);

    const stats = {
        total: supportRequests.length,
        lastRequest: supportRequests.length > 0 ? supportRequests[0].date : 'None yet',
        new: supportRequests.filter(r => r.status === 'new').length,
        inProgress: supportRequests.filter(r => r.status === 'in_progress').length,
        resolved: supportRequests.filter(r => r.status === 'resolved').length,
    };

    const filteredRequests = supportRequests.filter(request => {
        const matchesTab = activeTab === 'all' || request.status === activeTab;
        const matchesFilter = request.title.toLowerCase().includes(filterText.toLowerCase());
        return matchesTab && matchesFilter;
    });

    const tabs = [
        { id: 'all', label: 'All' },
        { id: 'new', label: 'New' },
        { id: 'in_progress', label: 'In Progress' },
        { id: 'resolved', label: 'Resolved' },
    ] as const;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFormData(prev => ({ ...prev, files: e.target.files }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.category || !formData.subject || !formData.description) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        const newRequest: SupportRequest = {
            id: Math.random().toString(36).substr(2, 9),
            title: formData.subject,
            status: 'new',
            date: new Date().toLocaleDateString(),
            category: formData.category
        };

        setSupportRequests(prev => [newRequest, ...prev]);
        toast.success("Support request submitted successfully!");
        setIsDialogOpen(false);
        setIsSubmitting(false);

        // Reset form
        setFormData({
            category: '',
            subject: '',
            email: user?.email || '',
            priority: 'normal',
            serialNumber: '',
            description: '',
            files: null
        });
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            {/* Printable Form - Hidden on screen, visible on print */}
            <div className="hidden print:block fixed inset-0 z-[9999] bg-white">
                <ServiceForm />
            </div>

            <div className="space-y-6 animate-in fade-in duration-500 pb-12 print:hidden">

                {/* Stats Row */}
                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Total Requests</p>
                        <span className="text-3xl font-black text-[#1B9157] dark:text-[#F4D03F]">{stats.total}</span>
                    </div>
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Last Request</p>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.lastRequest}</span>
                    </div>
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">New</p>
                        <span className="text-3xl font-black text-gray-900 dark:text-white">{stats.new}</span>
                    </div>
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">In Progress</p>
                        <span className="text-3xl font-black text-gray-900 dark:text-white">{stats.inProgress}</span>
                    </div>
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Resolved</p>
                        <span className="text-3xl font-black text-gray-900 dark:text-white">{stats.resolved}</span>
                    </div>
                </div>

                {/* Tab Filters */}
                {/* Tab Filters */}
                <div className="flex items-center gap-3">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "px-6 py-2.5 rounded-full text-sm font-bold transition-all border shadow-sm",
                                activeTab === tab.id
                                    ? "bg-[#1B9157] text-white border-[#1B9157] shadow-green-500/20"
                                    : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Contact Support Section */}
                <div className="flex flex-col lg:flex-row justify-between gap-8 py-8 bg-white dark:bg-gray-900/50 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex-1 space-y-6">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Contact Support</h2>

                        {/* Email and Phone */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2">EMAIL</label>
                                <p className="text-gray-900 dark:text-white font-bold text-lg">info@beeyield.com</p>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2">PHONE / WHATSAPP</label>
                                <p className="text-gray-900 dark:text-white font-bold text-lg">+1 (800) 123-4567</p>
                            </div>
                        </div>

                        {/* Service Address */}
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2">SERVICE ADDRESS</label>
                            <p className="text-gray-900 dark:text-white font-medium">BeeYield</p>
                            <p className="text-gray-500 dark:text-gray-400">Kibwezi, Kenya</p>
                        </div>

                        <p className="text-[#1B9157] text-sm font-medium">
                            Attach the <span onClick={handlePrint} className="underline cursor-pointer hover:text-[#1B9157]/80 font-bold">printed service form</span> to your shipment.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 lg:items-end justify-center min-w-[200px]">
                        <Button
                            variant="outline"
                            onClick={() => toast.info("Manuals and documentation are currently being updated.")}
                            className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-white border-gray-200 dark:border-gray-700 rounded-xl px-6 h-12 font-bold w-full justify-center"
                        >
                            Manuals
                        </Button>
                        <Button
                            onClick={handlePrint}
                            className="bg-[#F4D03F] hover:bg-[#EBC735] text-slate-800 border-none rounded-xl px-6 h-12 font-bold w-full justify-center gap-2"
                        >
                            <Printer className="w-4 h-4" />
                            Print service form
                        </Button>

                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    className="bg-[#1B9157] hover:bg-[#167d4a] text-white rounded-xl px-6 h-12 font-bold w-full shadow-lg shadow-green-500/10 justify-center transition-all hover:scale-[1.02]"
                                >
                                    Add request online
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px] rounded-[2rem] p-0 overflow-hidden bg-white dark:bg-[#0F172A] border-gray-100 dark:border-gray-800">
                                <DialogHeader className="p-8 pb-4 bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                                    <DialogTitle className="text-2xl font-black text-gray-900 dark:text-white">Add Request</DialogTitle>
                                    <DialogDescription className="text-gray-500 font-medium">
                                        Submit a new support ticket. We usually respond within 24 hours.
                                    </DialogDescription>
                                </DialogHeader>

                                <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-[#FDFBF9] dark:bg-[#1A1816]">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Category Select */}
                                        <div className="relative pt-2">
                                            <div className="absolute -top-1 left-3 px-1.5 bg-[#FDFBF9] dark:bg-[#1A1816] z-10">
                                                <span className="text-[11px] font-bold text-[#8B5E3C] uppercase tracking-wide">Category *</span>
                                            </div>
                                            <Select
                                                value={formData.category}
                                                onValueChange={(val) => handleSelectChange('category', val)}
                                            >
                                                <SelectTrigger className="h-[52px] rounded-lg border-[#8B5E3C] border-2 bg-transparent text-[#8B5E3C] font-bold text-lg focus:ring-0">
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-[#EEDCC8] bg-[#FDF3E9]">
                                                    <SelectItem value="virgin" className="py-3 font-bold text-[#8B5E3C] focus:bg-[#EEDCC8] focus:text-[#8B5E3C]">Virgin</SelectItem>
                                                    <SelectItem value="app" className="py-3 font-bold text-[#8B5E3C] focus:bg-[#EEDCC8] focus:text-[#8B5E3C]">App</SelectItem>
                                                    <SelectItem value="date" className="py-3 font-bold text-[#8B5E3C] focus:bg-[#EEDCC8] focus:text-[#8B5E3C]">Date</SelectItem>
                                                    <SelectItem value="other" className="py-3 font-bold text-[#8B5E3C] focus:bg-[#EEDCC8] focus:text-[#8B5E3C]">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Email Input */}
                                        <div className="relative pt-2">
                                            <div className="absolute -top-1 left-3 px-1.5 bg-[#FDFBF9] dark:bg-[#1A1816] z-10">
                                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Email*</span>
                                            </div>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="h-[52px] rounded-lg border-gray-300 dark:border-gray-700 bg-transparent text-gray-500 font-bold text-lg focus-visible:ring-0 focus-visible:border-gray-400"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Large Subject Field */}
                                    <div className="relative pt-2">
                                        <Input
                                            id="subject"
                                            name="subject"
                                            placeholder=""
                                            value={formData.subject}
                                            onChange={handleInputChange}
                                            className="h-[52px] rounded-lg border-gray-300 dark:border-gray-700 bg-transparent text-gray-800 dark:text-gray-100 font-medium text-lg focus-visible:ring-0"
                                            required
                                        />
                                    </div>

                                    {/* Description Textarea */}
                                    <div className="relative pt-2">
                                        <Textarea
                                            id="description"
                                            name="description"
                                            placeholder=""
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            className="min-h-[180px] rounded-lg border-[#1B9157] bg-transparent text-gray-800 dark:text-gray-100 text-lg focus-visible:ring-0 resize-none p-4"
                                            required
                                        />
                                    </div>

                                    <div className="flex justify-end gap-10 pt-4">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setIsDialogOpen(false)}
                                            className="h-10 px-0 text-xl font-bold text-[#1B9157] hover:text-[#167d4a] hover:bg-transparent"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            variant="ghost"
                                            className="h-10 px-0 text-xl font-bold text-[#1B9157] hover:text-[#167d4a] hover:bg-transparent"
                                        >
                                            {isSubmitting ? "Saving..." : "Save"}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 dark:border-gray-800" />

                {/* Filter Input */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Filter requests..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="w-full max-w-lg px-6 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#1B9157]/20 focus:border-[#1B9157] transition-all font-medium shadow-sm"
                    />
                </div>

                {/* Data Table / Empty State */}
                <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 overflow-hidden min-h-[300px] flex items-center justify-center shadow-sm">
                    {filteredRequests.length === 0 ? (
                        <div className="py-16 text-center">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Send className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No requests found</h3>
                            <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xs mx-auto">
                                You haven't submitted any support requests yet, or no requests match your filter.
                            </p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                                <tr>
                                    <th className="px-8 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-wider">Title</th>
                                    <th className="px-8 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-wider">Category</th>
                                    <th className="px-8 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-8 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {filteredRequests.map((request) => (
                                    <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">{request.title}</td>
                                        <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-gray-500">{request.category || '-'}</td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <span className={cn(
                                                "px-3 py-1 text-xs font-black uppercase tracking-wider rounded-lg",
                                                request.status === 'new' && "bg-[#F4D03F]/10 text-[#7a6820]",
                                                request.status === 'in_progress' && "bg-[#F4D03F]/10 text-[#7a6820]",
                                                request.status === 'resolved' && "bg-[#1B9157]/10 text-[#1B9157]"
                                            )}>
                                                {request.status === 'new' && 'New'}
                                                {request.status === 'in_progress' && 'In Progress'}
                                                {request.status === 'resolved' && 'Resolved'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-gray-400">{request.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </>
    );
};

export default SupportCenterView;
