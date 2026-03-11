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
    Cpu,
    Command,
    Terminal,
    Hexagon
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
    const { language, setLanguage } = useLanguage();
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

    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const userName = (beeyieldUser?.user_metadata?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User').split(' ')[0];

    return (
        <header className={cn(
            "h-24 sticky top-0 z-40 flex items-center justify-between px-10 transition-all duration-700",
            scrolled ? "bg-[#0A0A0A]/40 backdrop-blur-3xl border-b border-white/10 shadow-2xl" : "bg-transparent"
        )}>
            {/* Left: Breadcrumb & Welcome — High-End Industrial Styling */}
            <div className="flex items-center gap-8 group">
                <div className="flex flex-col">
                    <div className="flex items-center gap-4">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-honey/10 dark:bg-honey/10 border border-honey/20 dark:border-honey/20 rounded-full shadow-2xl skew-x-[-12deg]">
                            <span className="text-[10px] font-black text-honey uppercase tracking-[0.3em] skew-x-[12deg] italic">System Registry</span>
                        </div>
                        <span className="text-muted-foreground/20 font-black tracking-widest">/</span>
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-white/40 dark:bg-black/40 rounded-full border border-white/10 shadow-inner"
                        >
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] italic">
                                {activeTab.replace(/-/g, ' ')}
                            </span>
                        </motion.div>
                    </div>
                    <div className="mt-4 flex items-center gap-6">
                        <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none group-hover:scale-[1.02] transition-transform duration-700">
                            Node_ <span className="text-[#FF6B00]">{userName.toUpperCase()}</span>
                        </h2>
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10">
                            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            <span className="text-[9px] font-mono font-black text-white/60 uppercase tracking-widest">STABLE_UPLINK</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Premium Control Matrix */}
            <div className="flex items-center gap-6">
                {/* Global Search Node */}
                <div className="hidden lg:flex items-center h-16 px-8 bg-white/5 backdrop-blur-3xl rounded-2xl border border-white/10 focus-within:border-[#FF6B00]/40 transition-all gap-5 w-80 group/search">
                    <Search className="w-5 h-5 text-white/20 group-focus-within/search:text-[#FF6B00] transition-colors" />
                    <input
                        type="text"
                        placeholder="Neural Query Search..."
                        className="bg-transparent border-none outline-none text-[13px] font-black text-white placeholder:text-white/10 w-full uppercase tracking-widest font-mono"
                    />
                    <Command className="w-4 h-4 text-white/10 group-focus-within/search:text-[#FF6B00]/30 transition-colors" />
                </div>

                {/* Theme Neural Switching */}
                <button
                    onClick={() => setTheme(isDark ? 'light' : 'dark')}
                    className="h-16 w-16 bg-white/40 dark:bg-black/60 backdrop-blur-3xl border border-white/5 rounded-2xl flex items-center justify-center hover:border-honey/40 hover:shadow-3xl transition-all duration-700 group shadow-2xl"
                >
                    <div className="relative">
                        <AnimatePresence mode="wait">
                            {isDark ? (
                                <motion.div
                                    key="sun"
                                    initial={{ scale: 0, rotate: -90 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0, rotate: 90 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <Sun className="w-6 h-6 text-[#FF6B00] fill-[#FF6B00] animate-glow scale-125" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="moon"
                                    initial={{ scale: 0, rotate: -90 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0, rotate: 90 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <Moon className="w-6 h-6 text-slate-500 group-hover:fill-slate-500 transition-all" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </button>

                {/* High-Fidelity Record Action */}
                <button
                    onClick={onQuickAction}
                    className={cn(glass.btnPrimary, "hidden sm:flex items-center gap-6 px-10 h-16 bg-[#FF6B00] text-black font-black text-xs tracking-[0.2em] uppercase rounded-2xl shadow-[0_0_30px_rgba(255,107,0,0.3)] hover:brightness-125 active:scale-[0.98] transition-all group/btn pl-14 font-mono")}
                >
                    <Plus className="w-6 h-6 group-hover/btn:rotate-90 transition-all duration-500" />
                    LOG_EXTRACTION
                </button>

                {/* Notification Feed Matrix */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="relative h-16 w-16 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl flex items-center justify-center hover:border-[#FF6B00]/40 transition-all shadow-2xl group">
                            <Bell className="w-6 h-6 text-white/20 group-hover:text-[#FF6B00] transition-colors" />
                            {alerts.length > 0 && (
                                <div className="absolute top-4 right-4 w-3 h-3 bg-[#FF6B00] rounded-full border-2 border-[#0A0A0A] shadow-[0_0_20px_rgba(255,107,0,0.8)] animate-pulse" />
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        sideOffset={20}
                        className="w-96 rounded-3xl border border-white/10 p-4 shadow-4xl bg-[#0A0A0A]/95 backdrop-blur-3xl overflow-hidden animate-in zoom-in-95"
                    >
                        <div className="p-8 bg-[#FF6B00]/5 rounded-[2rem] mb-4 border border-[#FF6B00]/10 shadow-inner relative overflow-hidden group/alert">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B00]/5 blur-3xl pointer-events-none" />
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/10 flex items-center justify-center border border-[#FF6B00]/20">
                                    <ShieldCheck className="w-5 h-5 text-[#FF6B00]" />
                                </div>
                                <div>
                                    <p className="text-[13px] font-black text-white tracking-tighter uppercase">Security Center</p>
                                    <p className="text-[10px] text-white/20 mt-0.5 font-black uppercase tracking-[0.2em] font-mono">{alerts.length} PULSES_DETECTED</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1 p-2">
                            {alerts.length > 0 ? alerts.map((n) => (
                                <DropdownMenuItem key={n.id} className="flex items-start gap-6 p-6 rounded-2xl hover:bg-[#FF6B00]/5 transition-all cursor-pointer border border-transparent hover:border-[#FF6B00]/20 group/item">
                                    <div className={cn(
                                        "w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0 animate-pulse",
                                        n.severity === 'critical' ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]" : "bg-[#FF6B00] shadow-[0_0_15px_rgba(255,107,0,0.6)]"
                                    )} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[12px] font-black text-white truncate uppercase tracking-tight group-hover/item:text-[#FF6B00] transition-colors">{n.message}</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="text-[9px] font-mono font-black text-white/20 uppercase tracking-[0.2em]">
                                                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true }).toUpperCase()}
                                            </span>
                                            <span className="text-[8px] px-2 py-0.5 rounded-lg bg-white/5 text-white/10 font-mono uppercase">NODE_{Math.random().toString(36).slice(6).toUpperCase()}</span>
                                        </div>
                                    </div>
                                </DropdownMenuItem>
                            )) : (
                                <div className="p-14 text-center space-y-4">
                                    <Activity className="w-10 h-10 text-white/10 mx-auto" />
                                    <p className="text-[11px] font-black text-white/10 uppercase tracking-[0.4em] leading-relaxed">ENVIRONMENT_OPTIMAL<br /><span className="text-white/20 font-mono">UPLINK_STABLE</span></p>
                                </div>
                            )}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Biometric Profile Matrix */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-6 h-16 pl-3 pr-6 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl hover:border-[#FF6B00]/40 transition-all shadow-2xl group">
                            <div className="w-10 h-10 rounded-xl bg-[#FF6B00] flex items-center justify-center flex-shrink-0 shadow-3xl text-black font-black text-sm group-hover:scale-110 transition-transform">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                            <div className="hidden md:flex flex-col items-start gap-1">
                                <span className="text-[11px] font-black text-white uppercase tracking-widest group-hover:text-[#FF6B00] transition-colors">
                                    {userName}
                                </span>
                                <span className="text-[9px] font-mono font-black text-white/20 uppercase leading-none">ADMIN_ROOT</span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-white/20 group-hover:text-[#FF6B00] transition-all group-data-[state=open]:rotate-180" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        sideOffset={20}
                        className="w-72 rounded-[3.5rem] border border-white/10 p-4 shadow-4xl bg-white/95 dark:bg-[#0D0D0D]/95 backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-700"
                    >
                        <DropdownMenuLabel className="px-8 py-6 text-[10px] font-black uppercase text-muted-foreground/20 tracking-[0.5em] font-sans italic border-b border-white/5 mb-2">
                            Neural Identity
                        </DropdownMenuLabel>
                        <div className="p-2 space-y-1">
                            <DropdownMenuItem
                                onClick={() => onTabChange('settings')}
                                className="px-8 py-5 text-[13px] font-black italic text-foreground hover:bg-honey/10 dark:hover:bg-white/5 cursor-pointer flex items-center gap-6 rounded-[2.5rem] transition-all duration-700 uppercase tracking-widest"
                            >
                                <Settings className="w-5 h-5 text-honey" />
                                Configuration
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onTabChange('support')}
                                className="px-8 py-5 text-[13px] font-black italic text-foreground hover:bg-honey/10 dark:hover:bg-white/5 cursor-pointer flex items-center gap-6 rounded-[2.5rem] transition-all duration-700 uppercase tracking-widest"
                            >
                                <Hexagon className="w-5 h-5 text-blue-400" />
                                Kernel_Help
                            </DropdownMenuItem>
                            <Separator className="my-4 bg-white/5 mx-6" />
                            <DropdownMenuItem
                                onClick={onLogout}
                                className="px-8 py-5 text-[13px] font-black italic text-red-500/80 hover:text-red-500 hover:bg-red-500/5 cursor-pointer flex items-center gap-6 rounded-[2.5rem] transition-all duration-700 uppercase tracking-widest"
                            >
                                <LogOut className="w-5 h-5" />
                                Sever Link
                            </DropdownMenuItem>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};

export default DashboardHeader;
