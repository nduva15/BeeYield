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

    // Mock data
    const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([
        {
            id: 'REQ-8291',
            title: 'Honey Press sensor calibration',
            status: 'in_progress',
            date: '1/12/2026',
            category: 'technical'
        },
        {
            id: 'REQ-7120',
            title: 'Apiary Map not loading',
            status: 'resolved',
            date: '1/10/2026',
            category: 'app'
        }
    ]);

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

                {/* Page Title */}
                <h1 className="text-[2.5rem] font-bold text-[#0F172A] dark:text-white tracking-tight">Support Center</h1>

                {/* Stats Row */}
                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Total Requests</p>
                        <span className="text-3xl font-black text-gray-900 dark:text-white">{stats.total}</span>
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
                                    ? "bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/20"
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

                        <p className="text-[#B48428] text-sm font-medium">
                            Attach the <span onClick={handlePrint} className="underline cursor-pointer hover:text-amber-600 font-bold">printed service form</span> to your shipment.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 lg:items-end justify-center min-w-[200px]">
                        <Button
                            variant="outline"
                            className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-white border-gray-200 dark:border-gray-700 rounded-xl px-6 h-12 font-bold w-full justify-center"
                        >
                            Manuals
                        </Button>
                        <Button
                            onClick={handlePrint}
                            className="bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-100 border-none rounded-xl px-6 h-12 font-bold w-full justify-center gap-2"
                        >
                            <Printer className="w-4 h-4" />
                            Print service form
                        </Button>

                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    className="bg-[#B48428] hover:bg-[#966b1d] text-white rounded-xl px-6 h-12 font-bold w-full shadow-lg shadow-amber-500/20 justify-center transition-all hover:scale-[1.02]"
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

                                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="category" className="text-xs font-bold uppercase tracking-wider text-gray-500">Category *</Label>
                                            <Select
                                                value={formData.category}
                                                onValueChange={(val) => handleSelectChange('category', val)}
                                            >
                                                <SelectTrigger id="category" className="h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:ring-[#B48428]">
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl">
                                                    <SelectItem value="technical">Technical Support</SelectItem>
                                                    <SelectItem value="hardware">Hardware / Device Issue</SelectItem>
                                                    <SelectItem value="app">App / Software Issue</SelectItem>
                                                    <SelectItem value="billing">Billing & Subscription</SelectItem>
                                                    <SelectItem value="advisory">Beekeeping Advisory</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="priority" className="text-xs font-bold uppercase tracking-wider text-gray-500">Priority</Label>
                                            <Select
                                                value={formData.priority}
                                                onValueChange={(val) => handleSelectChange('priority', val)}
                                            >
                                                <SelectTrigger id="priority" className="h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:ring-[#B48428]">
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl">
                                                    <SelectItem value="low">Low</SelectItem>
                                                    <SelectItem value="normal">Normal</SelectItem>
                                                    <SelectItem value="high">High</SelectItem>
                                                    <SelectItem value="urgent">Urgent</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="serialNumber" className="text-xs font-bold uppercase tracking-wider text-gray-500">Device Serial Number / ID</Label>
                                        <Input
                                            id="serialNumber"
                                            name="serialNumber"
                                            placeholder="e.g. BY-2024-X-99"
                                            value={formData.serialNumber}
                                            onChange={handleInputChange}
                                            className="h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus-visible:ring-[#B48428]"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="subject" className="text-xs font-bold uppercase tracking-wider text-gray-500">Subject *</Label>
                                        <Input
                                            id="subject"
                                            name="subject"
                                            placeholder="Brief summary of the issue"
                                            value={formData.subject}
                                            onChange={handleInputChange}
                                            className="h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus-visible:ring-[#B48428]"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-gray-500">Email *</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus-visible:ring-[#B48428]"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-gray-500">Description *</Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            placeholder="Please describe the issue in detail..."
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            className="min-h-[120px] rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus-visible:ring-[#B48428] resize-none p-4"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="files" className="text-xs font-bold uppercase tracking-wider text-gray-500">Attachments (Optional)</Label>
                                        <div className="flex items-center gap-4">
                                            <div className="relative flex-1">
                                                <Input
                                                    id="files"
                                                    type="file"
                                                    onChange={handleFileChange}
                                                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                                                    multiple
                                                />
                                                <div className="h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 flex items-center px-4 text-gray-400 text-sm">
                                                    <Paperclip className="w-4 h-4 mr-2" />
                                                    {formData.files && formData.files.length > 0
                                                        ? `${formData.files.length} file(s) selected`
                                                        : "Click to upload files or screenshosts"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <DialogFooter className="pt-4">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setIsDialogOpen(false)}
                                            className="rounded-xl h-12 px-6 font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="bg-[#B48428] hover:bg-[#966b1d] text-white rounded-xl h-12 px-8 font-bold shadow-lg shadow-amber-500/20"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="mr-2 h-4 w-4" />
                                                    Submit Request
                                                </>
                                            )}
                                        </Button>
                                    </DialogFooter>
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
                        className="w-full max-w-lg px-6 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#B48428]/20 focus:border-[#B48428] transition-all font-medium shadow-sm"
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
                                                request.status === 'new' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                                                request.status === 'in_progress' && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                                                request.status === 'resolved' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
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
