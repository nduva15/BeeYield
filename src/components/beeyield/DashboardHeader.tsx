import React from 'react';
import { cn } from '@/lib/utils';
import {
    Search,
    Bell,
    Settings,
    ChevronDown,
    Plus,
    LogOut,
    Zap
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

    const userName = beeyieldUser?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';

    return (
        <header className="h-[72px] bg-[#000000] border-b border-[#1A1A1A] sticky top-0 z-30 flex items-center justify-between px-8">
            {/* Left: Breadcrumb */}
            <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] font-mono">Dashboard</span>
                <span className="text-white/10 text-xs">›</span>
                <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] font-mono capitalize">
                    {activeTab.replace(/-/g, ' ')}
                </span>
            </div>

            {/* Center: Live system ticker (desktop only) */}
            <div className="hidden xl:flex items-center gap-6">
                {[
                    { label: 'HIVES', value: '840', positive: true },
                    { label: 'UPTIME', value: '99.8%', positive: true },
                    { label: 'ALERTS', value: '2', positive: false },
                ].map(stat => (
                    <div key={stat.label} className="flex items-center gap-2">
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] font-mono">{stat.label}</span>
                        <span className={cn(
                            "text-[11px] font-black font-mono tabular-nums",
                            stat.positive ? "text-emerald-400" : "text-[#F59E0B]"
                        )}>{stat.value}</span>
                    </div>
                ))}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
                {/* Quick Action CTA */}
                <button
                    onClick={onQuickAction}
                    className="hidden sm:flex items-center gap-2 px-4 h-9 bg-[#F59E0B] text-black font-black text-[10px] tracking-[0.15em] uppercase font-mono hover:bg-[#FBBF24] transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" />
                    New Entry
                </button>

                {/* Search */}
                <div className="hidden lg:flex items-center h-9 px-4 bg-[#111111] border border-[#1A1A1A] focus-within:border-white/20 transition-all gap-2">
                    <Search className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent border-none outline-none text-[11px] text-white placeholder:text-white/20 w-32 font-mono"
                    />
                </div>

                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="relative h-9 w-9 bg-[#111111] border border-[#1A1A1A] flex items-center justify-center hover:border-white/20 transition-all">
                            <Bell className="w-3.5 h-3.5 text-white/40" />
                            <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#F59E0B] rounded-full" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="w-80 rounded-none border border-[#1A1A1A] p-0 shadow-[0_16px_64px_rgba(0,0,0,0.8)] bg-[#0D0D0D]"
                    >
                        <div className="p-4 border-b border-[#1A1A1A]">
                            <p className="text-[11px] font-black text-white uppercase tracking-[0.2em] font-mono">Notifications</p>
                            <p className="text-[9px] text-white/30 mt-1 font-mono">3 unread alerts</p>
                        </div>
                        <div className="divide-y divide-[#1A1A1A]">
                            {[
                                { title: 'Hive #12 weight drop', time: '2 min ago', tag: 'ALERT', color: 'text-[#F59E0B]' },
                                { title: 'Sync complete: QuickBooks', time: '1 hr ago', tag: 'SYNC', color: 'text-emerald-400' },
                                { title: 'New season report ready', time: '3 hrs ago', tag: 'INFO', color: 'text-white/40' },
                            ].map((n, i) => (
                                <div key={i} className="flex items-start gap-3 p-4 hover:bg-white/5 transition-colors cursor-pointer">
                                    <span className={cn("text-[8px] font-black font-mono tracking-wider pt-0.5 flex-shrink-0", n.color)}>{n.tag}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-bold text-white truncate">{n.title}</p>
                                        <p className="text-[9px] text-white/20 font-mono mt-0.5">{n.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Profile */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2.5 h-9 pl-2 pr-3 bg-[#111111] border border-[#1A1A1A] hover:border-white/20 transition-all">
                            <div className="w-5 h-5 bg-[#F59E0B] flex items-center justify-center flex-shrink-0">
                                <span className="text-[9px] font-black text-black font-mono">{userName.charAt(0).toUpperCase()}</span>
                            </div>
                            <span className="text-[10px] font-black text-white/60 hidden md:block font-mono uppercase tracking-wider">
                                {userName}
                            </span>
                            <ChevronDown className="w-3 h-3 text-white/20" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="w-48 rounded-none border border-[#1A1A1A] p-0 shadow-[0_16px_64px_rgba(0,0,0,0.8)] bg-[#0D0D0D]"
                    >
                        <DropdownMenuLabel className="px-4 py-2.5 text-[8px] font-black uppercase text-white/20 tracking-[0.3em] border-b border-[#1A1A1A] font-mono">
                            Account
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => onTabChange('settings')}
                            className="px-4 py-3 text-[10px] font-black text-white/50 hover:text-white hover:bg-white/5 cursor-pointer flex items-center gap-3 font-mono uppercase tracking-wider rounded-none"
                        >
                            <Settings className="w-3.5 h-3.5" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={onLogout}
                            className="px-4 py-3 text-[10px] font-black text-red-500/60 hover:text-red-400 hover:bg-red-400/5 cursor-pointer flex items-center gap-3 font-mono uppercase tracking-wider rounded-none border-t border-[#1A1A1A]"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            Sign Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};

export default DashboardHeader;
