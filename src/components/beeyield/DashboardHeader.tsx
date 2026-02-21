import React from 'react';
import { cn } from '@/lib/utils';
import {
    Search,
    Bell,
    Settings,
    ChevronDown,
    Zap,
    Plus,
    LogOut,
    User
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardHeaderProps {
    onTabChange: (tab: string) => void;
    onLogout: () => void;
    activeTab: string;
    onQuickAction: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    onTabChange,
    onLogout,
    activeTab,
    onQuickAction
}) => {
    const { user, beeyieldUser } = useAuth();
    const { language, setLanguage } = useLanguage();

    return (
        <header className="h-[72px] bg-white/60 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-30 flex items-center justify-between px-8">
            {/* Left: Breadcrumb / Context */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-[11px] font-bold">Dashboard</span>
                    <span className="text-[10px]">/</span>
                    <span className="text-[11px] font-bold text-slate-900 capitalize">{activeTab.replace(/-/g, ' ')}</span>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                {/* Quick Action */}
                <button
                    onClick={onQuickAction}
                    className="hidden sm:flex items-center gap-2 px-5 h-10 bg-[#CEF144] text-slate-900 rounded-full font-bold text-[11px] tracking-tight hover:bg-[#c5e83a] transition-all shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    New Entry
                </button>

                {/* Search */}
                <div className="hidden lg:flex items-center h-10 px-4 bg-slate-50 rounded-full border border-slate-100 focus-within:border-slate-300 focus-within:bg-white transition-all">
                    <Search className="w-4 h-4 text-slate-300 mr-2" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent border-none outline-none text-[12px] text-slate-900 placeholder:text-slate-300 w-40 font-medium"
                    />
                </div>

                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="relative h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center hover:bg-slate-100 transition-all border border-slate-100">
                            <Bell className="w-4 h-4 text-slate-500" />
                            <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 rounded-[20px] border border-slate-100 p-0 shadow-[0_12px_40px_rgba(0,0,0,0.08)] bg-white">
                        <div className="p-5 border-b border-slate-50">
                            <p className="text-[12px] font-bold text-slate-900">Notifications</p>
                            <p className="text-[10px] text-slate-400 mt-1">3 unread alerts</p>
                        </div>
                        <div className="p-4 space-y-3">
                            {[
                                { title: 'Hive #12 weight drop', time: '2 min ago', urgent: true },
                                { title: 'Sync complete: QuickBooks', time: '1 hr ago', urgent: false },
                                { title: 'New season report ready', time: '3 hrs ago', urgent: false },
                            ].map((n, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer">
                                    <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", n.urgent ? "bg-red-500" : "bg-slate-200")} />
                                    <div>
                                        <p className="text-[12px] font-bold text-slate-900">{n.title}</p>
                                        <p className="text-[10px] text-slate-400">{n.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Profile Avatar */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-3 h-10 pl-1 pr-3 bg-slate-50 rounded-full border border-slate-100 hover:bg-white hover:shadow-sm transition-all">
                            <img
                                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80"
                                className="w-8 h-8 rounded-full object-cover"
                                alt="User"
                            />
                            <span className="text-[11px] font-bold text-slate-900 hidden md:block">Timothy</span>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-[20px] border border-slate-100 p-2 shadow-[0_12px_40px_rgba(0,0,0,0.08)] bg-white">
                        <DropdownMenuLabel className="px-3 py-2 text-[10px] font-bold uppercase text-slate-400 tracking-wider">Account</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onTabChange('settings')} className="px-3 py-2.5 rounded-xl text-[12px] font-medium hover:bg-slate-50 cursor-pointer flex items-center gap-3">
                            <Settings className="w-4 h-4 text-slate-400" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onLogout} className="px-3 py-2.5 rounded-xl text-[12px] font-medium text-red-500 hover:bg-red-50 cursor-pointer flex items-center gap-3">
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};

export default DashboardHeader;
