import React from 'react';
import { cn } from '@/lib/utils';
import {
    Search,
    Bell,
    Settings,
    ChevronDown,
    Plus,
    LogOut,
    Sun,
    Moon
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { beeyieldService, SensorAlert } from '@/services/beeyieldService';
import { formatDistanceToNow } from 'date-fns';

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
    const { theme, setTheme } = useTheme();
    const [alerts, setAlerts] = React.useState<SensorAlert[]>([]);

    React.useEffect(() => {
        const fetchAlerts = async () => {
            const data = await beeyieldService.getSensorAlerts(false, 5);
            setAlerts(data);
        };
        fetchAlerts();
        // Poll every 5 minutes
        const interval = setInterval(fetchAlerts, 300000);
        return () => clearInterval(interval);
    }, []);

    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const userName = (beeyieldUser?.user_metadata?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User').split(' ')[0];

    return (
        <header className="h-[72px] bg-white dark:bg-[#000000] border-b border-slate-200 dark:border-[#1A1A1A] sticky top-0 z-30 flex items-center justify-between px-8">
            {/* Left: Breadcrumb */}
            <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.2em] font-mono">Dashboard</span>
                <span className="text-slate-300 dark:text-white/10 text-xs">›</span>
                <span className="text-[10px] font-black text-slate-600 dark:text-white/60 uppercase tracking-[0.2em] font-mono capitalize">
                    {activeTab.replace(/-/g, ' ')}
                </span>
            </div>

            {/* Center: Live system ticker (desktop only) */}
            <div className="hidden xl:flex items-center gap-6">
                {[
                    { label: 'STATUS', value: 'OPTIMAL', positive: true },
                    { label: 'UPTIME', value: '99.8%', positive: true },
                    { label: 'ALERTS', value: alerts.length.toString(), positive: alerts.length === 0 },
                ].map(stat => (
                    <div key={stat.label} className="flex items-center gap-2">
                        <span className="text-[8px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.2em] font-mono">{stat.label}</span>
                        <span className={cn(
                            "text-[11px] font-black font-mono tabular-nums",
                            stat.positive ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-[#F59E0B]"
                        )}>{stat.value}</span>
                    </div>
                ))}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                <button
                    onClick={() => setTheme(isDark ? 'light' : 'dark')}
                    className="h-9 w-9 bg-slate-100 dark:bg-[#111111] border border-slate-200 dark:border-[#1A1A1A] flex items-center justify-center hover:border-slate-400 dark:hover:border-white/20 transition-all"
                    title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {isDark ? (
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                    ) : (
                        <Moon className="w-3.5 h-3.5 text-slate-500" />
                    )}
                </button>

                {/* Quick Action CTA */}
                <button
                    onClick={onQuickAction}
                    className="hidden sm:flex items-center gap-2 px-4 h-9 bg-[#F59E0B] text-black font-black text-[10px] tracking-[0.15em] uppercase font-mono hover:bg-[#FBBF24] transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" />
                    New Entry
                </button>

                {/* Search */}
                <div className="hidden lg:flex items-center h-9 px-4 bg-slate-100 dark:bg-[#111111] border border-slate-200 dark:border-[#1A1A1A] focus-within:border-slate-400 dark:focus-within:border-white/20 transition-all gap-2">
                    <Search className="w-3.5 h-3.5 text-slate-400 dark:text-white/20 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent border-none outline-none text-[11px] text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 w-32 font-mono"
                    />
                </div>

                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="relative h-9 w-9 bg-slate-100 dark:bg-[#111111] border border-slate-200 dark:border-[#1A1A1A] flex items-center justify-center hover:border-slate-400 dark:hover:border-white/20 transition-all">
                            <Bell className="w-3.5 h-3.5 text-slate-500 dark:text-white/40" />
                            {alerts.length > 0 && <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#F59E0B] rounded-full" />}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="w-80 rounded-none border border-slate-200 dark:border-[#1A1A1A] p-0 shadow-[0_16px_64px_rgba(0,0,0,0.15)] dark:shadow-[0_16px_64px_rgba(0,0,0,0.8)] bg-white dark:bg-[#0D0D0D]"
                    >
                        <div className="p-4 border-b border-slate-200 dark:border-[#1A1A1A]">
                            <p className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] font-mono">Notifications</p>
                            <p className="text-[9px] text-slate-400 dark:text-white/30 mt-1 font-mono">{alerts.length} unread alerts</p>
                        </div>
                        <div className="divide-y divide-slate-200 dark:divide-[#1A1A1A]">
                            {alerts.length > 0 ? alerts.map((n, i) => (
                                <div key={n.id} className="flex items-start gap-3 p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                                    <span className={cn(
                                        "text-[8px] font-black font-mono tracking-wider pt-0.5 flex-shrink-0",
                                        n.severity === 'critical' ? "text-red-500" : "text-amber-600 dark:text-[#F59E0B]"
                                    )}>
                                        {n.alert_type.toUpperCase()}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-bold text-slate-800 dark:text-white truncate">{n.message}</p>
                                        <p className="text-[9px] text-slate-400 dark:text-white/20 font-mono mt-0.5">
                                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-8 text-center">
                                    <p className="text-[11px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest font-mono">No active alerts</p>
                                </div>
                            )}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Profile */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2.5 h-9 pl-2 pr-3 bg-slate-100 dark:bg-[#111111] border border-slate-200 dark:border-[#1A1A1A] hover:border-slate-400 dark:hover:border-white/20 transition-all">
                            <div className="w-5 h-5 bg-[#F59E0B] flex items-center justify-center flex-shrink-0">
                                <span className="text-[9px] font-black text-black font-mono">{userName.charAt(0).toUpperCase()}</span>
                            </div>
                            <span className="text-[10px] font-black text-slate-600 dark:text-white/60 hidden md:block font-mono uppercase tracking-wider">
                                {userName}
                            </span>
                            <ChevronDown className="w-3 h-3 text-slate-400 dark:text-white/20" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="w-48 rounded-none border border-slate-200 dark:border-[#1A1A1A] p-0 shadow-[0_16px_64px_rgba(0,0,0,0.15)] dark:shadow-[0_16px_64px_rgba(0,0,0,0.8)] bg-white dark:bg-[#0D0D0D]"
                    >
                        <DropdownMenuLabel className="px-4 py-2.5 text-[8px] font-black uppercase text-slate-400 dark:text-white/20 tracking-[0.3em] border-b border-slate-200 dark:border-[#1A1A1A] font-mono">
                            Account
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => onTabChange('settings')}
                            className="px-4 py-3 text-[10px] font-black text-slate-500 dark:text-white/50 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer flex items-center gap-3 font-mono uppercase tracking-wider rounded-none"
                        >
                            <Settings className="w-3.5 h-3.5" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={onLogout}
                            className="px-4 py-3 text-[10px] font-black text-red-500/60 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/5 cursor-pointer flex items-center gap-3 font-mono uppercase tracking-wider rounded-none border-t border-slate-200 dark:border-[#1A1A1A]"
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
