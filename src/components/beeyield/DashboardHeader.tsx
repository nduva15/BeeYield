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
    Moon,
    Activity,
    ShieldCheck,
    Hexagon,
    Command,
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
import { motion, AnimatePresence } from 'framer-motion';
import { glass } from './GlassTheme';

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
    const { language, setLanguage, t } = useLanguage();
    const { theme, setTheme } = useTheme();
    const [alerts, setAlerts] = React.useState<SensorAlert[]>([]);
    const [scrolled, setScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        const fetchAlerts = async () => {
            const data = await beeyieldService.getSensorAlerts(false, 5);
            setAlerts(data);
        };
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 300000);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearInterval(interval);
        };
    }, []);


    const userName = (beeyieldUser?.user_metadata?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User').split(' ')[0];

    return (
        <header className={cn(
            "h-16 sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 transition-all duration-300",
            scrolled ? "bg-[#F9F7F2]/80 backdrop-blur-xl border-b border-[#F4D03F]/20 shadow-lg" : "bg-transparent"
        )}>
            {/* Left: Breadcrumb & Welcome */}
            <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F4D03F]/10 border border-[#F4D03F]/20 rounded-lg">
                            <span className="text-[11px] font-semibold text-[#F4D03F] uppercase tracking-wider">Dashboard</span>
                        </div>
                        <span className="text-gray-300">/</span>
                        <motion.span
                            key={activeTab}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-[11px] font-medium text-gray-600 uppercase tracking-wider"
                        >
                            {activeTab.replace(/-/g, ' ')}
                        </motion.span>
                    </div>
                    <h2 className="text-lg font-bold text-[#1A1A1A] tracking-tight hidden md:block">
                        Welcome, <span className="text-[#F4D03F]">{userName}</span>
                    </h2>
                </div>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-2 md:gap-3">
                {/* Search */}
                <div className="hidden lg:flex items-center h-10 px-4 bg-[#F9F7F2] rounded-xl border border-[#F4D03F]/20 focus-within:border-[#F4D03F]/30 transition-all gap-2 w-64 group/search">
                    <Search className="w-4 h-4 text-gray-400 group-focus-within/search:text-[#F4D03F] transition-colors" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent border-none outline-none text-sm text-[#1A1A1A] placeholder:text-gray-400 w-full"
                    />
                    <kbd className="hidden md:inline text-[10px] text-gray-300 bg-[#F9F7F2] px-1.5 py-0.5 rounded border border-[#F4D03F]/20">⌘K</kbd>
                </div>

                {/* Quick Action */}
                <button
                    onClick={onQuickAction}
                    className={cn(glass.btnPrimary, "hidden sm:flex h-10 px-4 text-xs gap-2 rounded-xl")}
                >
                    <Plus className="w-4 h-4" />
                    <span className="hidden md:inline">New Record</span>
                </button>

                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="relative h-10 w-10 bg-[#F9F7F2] border border-[#F4D03F]/20 rounded-xl flex items-center justify-center hover:border-[#F4D03F]/40 hover:bg-[#F4D03F]/10 transition-all group">
                            <Bell className="w-4 h-4 text-gray-600 group-hover:text-gray-700 transition-colors" />
                            {alerts.length > 0 && (
                                <div className="absolute top-2 right-2 w-2 h-2 bg-[#F4D03F] rounded-full shadow-[0_0_8px_rgba(255,107,0,0.6)] animate-pulse" />
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        sideOffset={8}
                        className="w-80 rounded-xl border border-[#F4D03F]/20 p-2 shadow-xl bg-[#FFF9F0]/95 backdrop-blur-xl"
                    >
                        <div className="px-4 py-3 bg-[#F4D03F]/5 rounded-lg mb-2 border border-[#F4D03F]/10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#F4D03F]/10 flex items-center justify-center">
                                    <ShieldCheck className="w-4 h-4 text-[#F4D03F]" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-[#1A1A1A]">Alerts</p>
                                    <p className="text-[11px] text-gray-600">{alerts.length} active</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            {alerts.length > 0 ? alerts.map((n) => (
                                <DropdownMenuItem key={n.id} className="flex items-start gap-3 px-4 py-3 rounded-lg hover:bg-[#F9F7F2] transition-colors cursor-pointer">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                                        n.severity === 'critical' ? "bg-red-500" : "bg-[#F4D03F]"
                                    )} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-medium text-[#1A1A1A] truncate">{n.message}</p>
                                        <span className="text-[11px] text-gray-500">
                                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                </DropdownMenuItem>
                            )) : (
                                <div className="py-8 text-center">
                                    <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-[13px] text-gray-400">No alerts</p>
                                </div>
                            )}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Profile */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-3 h-10 pl-1.5 pr-3 bg-[#F9F7F2] border border-[#F4D03F]/20 rounded-xl hover:border-[#F4D03F]/40 hover:bg-[#F4D03F]/10 transition-all group">
                            <div className="w-7 h-7 rounded-lg bg-[#F4D03F] flex items-center justify-center flex-shrink-0 text-white font-bold text-xs group-hover:scale-105 transition-transform">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                            <span className="hidden md:block text-sm font-medium text-gray-700 group-hover:text-[#1A1A1A] transition-colors">
                                {userName}
                            </span>
                            <ChevronDown className="w-3 h-3 text-gray-500 group-data-[state=open]:rotate-180 transition-transform" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        sideOffset={8}
                        className="w-56 rounded-xl border border-[#F4D03F]/20 p-2 shadow-xl bg-[#FFF9F0]/95 backdrop-blur-xl"
                    >
                        <DropdownMenuLabel className="px-3 py-2 text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                            Account
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => onTabChange('settings')}
                            className="px-3 py-2.5 text-sm text-gray-700 hover:text-[#1A1A1A] hover:bg-[#F9F7F2] cursor-pointer flex items-center gap-3 rounded-lg transition-colors"
                        >
                            <Settings className="w-4 h-4 text-gray-600" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onTabChange('support')}
                            className="px-3 py-2.5 text-sm text-gray-700 hover:text-[#1A1A1A] hover:bg-[#F9F7F2] cursor-pointer flex items-center gap-3 rounded-lg transition-colors"
                        >
                            <Hexagon className="w-4 h-4 text-gray-600" />
                            {t('nav_support')}
                        </DropdownMenuItem>
                        <Separator className="my-2 bg-[#F9F7F2]" />
                        <DropdownMenuItem
                            onClick={onLogout}
                            className="px-3 py-2.5 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/5 cursor-pointer flex items-center gap-3 rounded-lg transition-colors"
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
