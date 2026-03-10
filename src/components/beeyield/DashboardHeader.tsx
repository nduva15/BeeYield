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
            scrolled ? "bg-white/40 dark:bg-[#0D0D0D]/40 backdrop-blur-3xl border-b border-white/10 shadow-2xl" : "bg-transparent"
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
                        <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase italic leading-none group-hover:scale-[1.02] transition-transform duration-700">
                            Node_ <span className="text-honey">{userName.toUpperCase()}</span>
                        </h2>
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-inner">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">Stable</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Premium Control Matrix */}
            <div className="flex items-center gap-6">
                {/* Global Search Node */}
                <div className="hidden lg:flex items-center h-16 px-8 bg-white/40 dark:bg-black/60 backdrop-blur-3xl rounded-[2rem] border border-white/5 shadow-inner focus-within:border-honey/40 focus-within:bg-white dark:focus-within:bg-[#09090b] focus-within:shadow-3xl transition-all duration-700 gap-5 w-80 group/search">
                    <Search className="w-5 h-5 text-muted-foreground/30 group-focus-within/search:text-honey transition-colors" />
                    <input
                        type="text"
                        placeholder="Neural Query Search..."
                        className="bg-transparent border-none outline-none text-[13px] font-black italic text-foreground placeholder:text-muted-foreground/20 w-full uppercase tracking-widest font-mono"
                    />
                    <Command className="w-4 h-4 text-muted-foreground/10 group-focus-within/search:text-honey/30 transition-colors" />
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
                                    <Sun className="w-6 h-6 text-honey fill-honey animate-glow scale-125" />
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
                    className={cn(glass.btnPrimary, "hidden sm:flex items-center gap-6 px-10 h-16 bg-[#FBBE24] text-black font-black text-xs tracking-widest uppercase rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(251,191,36,0.5)] hover:bg-[#F59E0B] hover:scale-[1.05] active:scale-[0.98] transition-all duration-700 italic group/btn pl-14")}
                >
                    <Plus className="w-6 h-6 group-hover/btn:rotate-90 transition-transform duration-700" />
                    Archive_Entry
                </button>

                {/* Notification Feed Matrix */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="relative h-16 w-16 bg-white/40 dark:bg-black/60 backdrop-blur-3xl border border-white/5 rounded-2xl flex items-center justify-center hover:border-honey/40 hover:shadow-3xl transition-all duration-700 shadow-2xl group">
                            <Bell className="w-6 h-6 text-muted-foreground/30 group-hover:text-honey transition-colors" />
                            {alerts.length > 0 && (
                                <div className="absolute top-4 right-4 w-3 h-3 bg-honey rounded-full border-2 border-white dark:border-[#09090b] shadow-[0_0_20px_rgba(251,191,36,0.8)] animate-pulse" />
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        sideOffset={20}
                        className="w-96 rounded-[3rem] border border-white/10 p-4 shadow-4xl bg-white/95 dark:bg-[#0D0D0D]/95 backdrop-blur-3xl overflow-hidden animate-in zoom-in-95 duration-700"
                    >
                        <div className="p-8 bg-honey/[0.03] dark:bg-white/[0.03] rounded-[2.5rem] mb-4 border border-honey/10 shadow-inner relative overflow-hidden group/alert">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-honey/5 blur-3xl pointer-events-none" />
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-10 h-10 rounded-xl bg-honey/10 flex items-center justify-center border border-honey/20">
                                    <ShieldCheck className="w-5 h-5 text-honey" />
                                </div>
                                <div>
                                    <p className="text-[13px] font-black italic text-foreground tracking-tighter uppercase">Security Center</p>
                                    <p className="text-[10px] text-muted-foreground/40 mt-0.5 font-black uppercase tracking-widest italic">{alerts.length} pulses detected</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2 p-2">
                            {alerts.length > 0 ? alerts.map((n) => (
                                <DropdownMenuItem key={n.id} className="flex items-start gap-6 p-6 rounded-[2rem] hover:bg-honey/5 dark:hover:bg-white/5 transition-all duration-700 cursor-pointer border border-transparent hover:border-honey/20 group/item">
                                    <div className={cn(
                                        "w-3 h-3 rounded-full mt-2 flex-shrink-0 animate-pulse",
                                        n.severity === 'critical' ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]" : "bg-honey shadow-[0_0_15px_rgba(251,191,36,0.6)]"
                                    )} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[12px] font-black italic text-foreground truncate uppercase tracking-tight group-hover/item:text-honey transition-colors">{n.message}</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] italic">
                                                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true }).toUpperCase()}
                                            </span>
                                            <span className="text-[8px] px-2 py-0.5 rounded-full border border-white/5 text-muted-foreground/20 italic font-mono uppercase">Node_{Math.random().toString(36).slice(6).toUpperCase()}</span>
                                        </div>
                                    </div>
                                </DropdownMenuItem>
                            )) : (
                                <div className="p-14 text-center space-y-4">
                                    <Activity className="w-10 h-10 text-emerald-500/20 mx-auto" />
                                    <p className="text-[11px] font-black text-muted-foreground/20 uppercase tracking-[0.4em] leading-relaxed italic">Environment Optimal<br /><span className="text-emerald-500/40">Neural Link Stable</span></p>
                                </div>
                            )}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Biometric Profile Matrix */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-6 h-16 pl-3 pr-6 bg-white/40 dark:bg-black/60 backdrop-blur-3xl border border-white/5 rounded-[2rem] hover:border-honey/40 hover:shadow-3xl transition-all duration-700 shadow-2xl group">
                            <div className="w-10 h-10 rounded-2xl bg-[#FBBE24] flex items-center justify-center flex-shrink-0 shadow-3xl text-black font-black text-sm italic group-hover:scale-110 transition-transform duration-700">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                            <div className="hidden md:flex flex-col items-start items-start gap-1">
                                <span className="text-[11px] font-black text-foreground uppercase tracking-widest italic group-hover:text-honey transition-colors">
                                    {userName}
                                </span>
                                <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] font-mono leading-none italic">ORG_ADMIN</span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-muted-foreground/20 group-hover:text-honey transition-all group-data-[state=open]:rotate-180" />
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
