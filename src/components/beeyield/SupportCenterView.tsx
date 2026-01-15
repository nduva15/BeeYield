import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import FirstStepsBanner from './FirstStepsBanner';

interface SupportRequest {
    id: string;
    title: string;
    status: 'new' | 'in_progress' | 'resolved';
    date: string;
}

interface SupportCenterViewProps {
    onTabChange: (tab: string) => void;
}

const SupportCenterView: React.FC<SupportCenterViewProps> = ({ onTabChange }) => {
    const [activeTab, setActiveTab] = useState<'all' | 'new' | 'in_progress' | 'resolved'>('all');
    const [filterText, setFilterText] = useState('');

    // Mock data - would come from API in real application
    const supportRequests: SupportRequest[] = [];

    const stats = {
        total: supportRequests.length,
        status: supportRequests.length > 0 ? 'Active' : 'None yet',
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

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            <FirstStepsBanner onTabChange={onTabChange} />

            {/* Page Title */}
            <h1 className="text-[2.5rem] font-bold text-[#0F172A] dark:text-white tracking-tight">Support Center</h1>

            {/* Stats Row - matching screenshot layout */}
            <div className="flex items-center gap-16 py-4">
                <div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</span>
                </div>
                <div>
                    <span className="text-lg text-gray-500 dark:text-gray-400">{stats.status}</span>
                </div>
                <div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.new}</span>
                </div>
                <div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inProgress}</span>
                </div>
                <div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.resolved}</span>
                </div>
            </div>

            {/* Tab Filters */}
            <div className="flex items-center gap-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all",
                            activeTab === tab.id
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Contact Support Section */}
            <div className="flex flex-col lg:flex-row justify-between gap-6 py-6">
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Contact Support</h2>

                    {/* Email and Phone in a row */}
                    <div className="flex flex-wrap gap-x-12 gap-y-4 mb-4">
                        {/* Email */}
                        <div>
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block">EMAIL</label>
                            <p className="text-gray-900 dark:text-white font-medium mt-1">info@beeyield.com</p>
                        </div>

                        {/* Phone / WhatsApp */}
                        <div>
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block">PHONE / WHATSAPP</label>
                            <p className="text-gray-900 dark:text-white font-medium mt-1">+1 (800) 123-4567</p>
                        </div>
                    </div>

                    {/* Service Address */}
                    <div className="mb-4">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block">SERVICE ADDRESS</label>
                        <p className="text-gray-900 dark:text-white font-medium mt-1">BeeYield</p>
                        <p className="text-gray-900 dark:text-white font-medium">Kibwezi,</p>
                        <p className="text-gray-900 dark:text-white font-medium">Kenya</p>
                    </div>

                    {/* Service Form Note */}
                    <p className="text-blue-500 text-sm">
                        Attach the <span className="underline cursor-pointer hover:text-blue-600">printed service form</span> to your shipment.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 lg:items-end justify-start">
                    <Button
                        variant="outline"
                        className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700 rounded-lg px-6 h-10 font-medium w-fit"
                    >
                        Manuals
                    </Button>
                    <Button
                        className="bg-amber-400 hover:bg-amber-500 text-gray-900 rounded-lg px-6 h-10 font-medium w-fit"
                    >
                        Print service form
                    </Button>
                    <Button
                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 h-10 font-medium w-fit"
                    >
                        Add request online
                    </Button>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700" />

            {/* Filter Input */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Filter"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="w-full max-w-lg px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700" />

            {/* Data Table / Empty State */}
            <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden min-h-[200px] flex items-center justify-center">
                {filteredRequests.length === 0 ? (
                    <div className="py-16 text-center">
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No record found</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredRequests.map((request) => (
                                <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{request.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={cn(
                                            "px-2 py-1 text-xs font-medium rounded-full",
                                            request.status === 'new' && "bg-blue-100 text-blue-700",
                                            request.status === 'in_progress' && "bg-amber-100 text-amber-700",
                                            request.status === 'resolved' && "bg-green-100 text-green-700"
                                        )}>
                                            {request.status === 'new' && 'New'}
                                            {request.status === 'in_progress' && 'In Progress'}
                                            {request.status === 'resolved' && 'Resolved'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{request.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default SupportCenterView;
