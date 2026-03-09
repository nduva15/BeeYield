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
import { Separator } from "@/components/ui/separator";
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
        <header className="h-[88px] bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md border-b border-slate-200/60 dark:border-white/5 sticky top-0 z-30 flex items-center justify-between px-10">
            {/* Left: Breadcrumb */}
            <div className="flex items-center gap-4">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em]">Dashboard</span>
                        <span className="text-slate-300 dark:text-white/10 text-xs">/</span>
                        <span className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-[0.2em] capitalize">
                            {activeTab.replace(/-/g, ' ')}
                        </span>
                    </div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter mt-1">
                        Welcome back, <span className="text-amber-600">{userName}</span>
                    </h2>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                {/* Search */}
                <div className="hidden lg:flex items-center h-12 px-5 bg-slate-100/50 dark:bg-white/5 rounded-2xl border border-transparent focus-within:border-amber-500/30 focus-within:bg-white dark:focus-within:bg-[#0D0D0D] transition-all gap-3 w-64">
                    <Search className="w-4 h-4 text-slate-400 dark:text-white/20 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Search your data..."
                        className="bg-transparent border-none outline-none text-xs font-medium text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 w-full"
                    />
                </div>

                {/* Theme Toggle */}
                <button
                    onClick={() => setTheme(isDark ? 'light' : 'dark')}
                    className="h-12 w-12 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-center hover:shadow-xl hover:border-amber-500/20 transition-all group"
                    title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {isDark ? (
                        <Sun className="w-4 h-4 text-amber-500 group-hover:rotate-45 transition-transform" />
                    ) : (
                        <Moon className="w-4 h-4 text-slate-500 group-hover:-rotate-12 transition-transform" />
                    )}
                </button>

                {/* Quick Action CTA */}
                <button
                    onClick={onQuickAction}
                    className="hidden sm:flex items-center gap-2 px-6 h-12 bg-green-700 text-white font-black text-[11px] tracking-widest uppercase rounded-2xl shadow-lg shadow-green-900/10 hover:bg-green-800 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <Plus className="w-4 h-4" />
                    New Record
                </button>

                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="relative h-12 w-12 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-center hover:shadow-xl hover:border-amber-500/20 transition-all">
                            <Bell className="w-4 h-4 text-slate-500 dark:text-white/40" />
                            {alerts.length > 0 && <div className="absolute top-3.5 right-3.5 w-2 h-2 bg-amber-500 rounded-full border-2 border-white dark:border-[#09090b]" />}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="w-80 rounded-[1.5rem] border border-slate-200 dark:border-white/5 p-2 shadow-2xl bg-white dark:bg-[#0D0D0D] overflow-hidden"
                    >
                        <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl mb-2">
                            <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]">Security Center</p>
                            <p className="text-[10px] text-slate-500 dark:text-white/30 mt-1">{alerts.length} active alerts detected</p>
                        </div>
                        <div className="space-y-1">
                            {alerts.length > 0 ? alerts.map((n) => (
                                <div key={n.id} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full mt-1.5 flex-shrink-0 animate-pulse",
                                        n.severity === 'critical' ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                                    )} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-bold text-slate-800 dark:text-white truncate">{n.message}</p>
                                        <p className="text-[9px] text-slate-400 dark:text-white/20 mt-1">
                                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-8 text-center">
                                    <p className="text-[11px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest leading-relaxed">System Status:<br /><span className="text-emerald-500">All Nodes Optimal</span></p>
                                </div>
                            )}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Profile */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-3 h-12 pl-2 pr-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl hover:shadow-xl hover:border-amber-500/20 transition-all">
                            <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
                                <span className="text-xs font-black text-neutral-900">{userName.charAt(0).toUpperCase()}</span>
                            </div>
                            <span className="text-xs font-black text-slate-900 dark:text-white hidden md:block uppercase tracking-wider">
                                {userName}
                            </span>
                            <ChevronDown className="w-4 h-4 text-slate-400 dark:text-white/20" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="w-56 rounded-[1.5rem] border border-slate-200 dark:border-white/5 p-2 shadow-2xl bg-white dark:bg-[#0D0D0D]"
                    >
                        <DropdownMenuLabel className="px-4 py-3 text-[9px] font-black uppercase text-slate-400 dark:text-white/20 tracking-[0.3em] font-sans">
                            Account Profile
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => onTabChange('settings')}
                            className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer flex items-center gap-3 rounded-xl transition-all"
                        >
                            <Settings className="w-4 h-4" />
                            Settings
                        </DropdownMenuItem>
                        <Separator className="my-2 bg-slate-100 dark:bg-white/5" />
                        <DropdownMenuItem
                            onClick={onLogout}
                            className="px-4 py-3 text-xs font-bold text-red-500/80 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/5 cursor-pointer flex items-center gap-3 rounded-xl transition-all"
                        >
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
