import React from 'react';
import { cn } from '@/lib/utils';
import {
    Layers,
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
    Menu,
    Lock,
    Unlock,
    LayoutGrid,
    ClipboardList,
    Award,
    MapPin,
    Navigation,
    Bot,
    Brain,
    Heart,
    Volume2,
    Bug,
    Sparkles,
    Gauge,
    Cpu,
    Scale,
    Zap,
    Puzzle,
    Banknote,
    LifeBuoy
} from 'lucide-react';
import { NavItem } from './DashboardSidebar';
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
    navItems?: NavItem[];
    onToggleMobileSidebar?: () => void;
    deviceMode?: 'auto' | 'phone' | 'pad' | 'laptop';
    onDeviceModeChange?: (mode: 'auto' | 'phone' | 'pad' | 'laptop') => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    onTabChange,
    onLogout,
    activeTab,
    onQuickAction,
    navItems = [],
    onToggleMobileSidebar,
    deviceMode = 'auto',
    onDeviceModeChange
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
    const avatarUrl = user?.user_metadata?.avatar_url;

    const navCategories = [
        {
            title: "Operations & Hives",
            items: [
                { id: 'home', label: 'Overview', icon: LayoutGrid },
                { id: 'beeyield', label: 'My Hives & Apiaries', icon: Hexagon },
                { id: 'inspections', label: 'Inspections & Audits', icon: ClipboardList },
                { id: 'harvests', label: 'Honey Harvest Batches', icon: Award },
                { id: 'places', label: 'My Places & Maps', icon: MapPin },
                { id: 'flight-map', label: 'Flight Mapping', icon: Navigation },
            ]
        },
        {
            title: "Intelligence & Neural Hive",
            items: [
                { id: 'assistant', label: 'BeeYield AI Assistant', icon: Bot },
                                { id: 'hive-health', label: 'Hive Health Monitor', icon: Heart },
                { id: 'acoustic-transformer', label: 'Acoustic Mood Transformer', icon: Volume2 },
                { id: 'sound-analysis', label: 'Sound Spectrogram', icon: Activity },
                { id: 'bee-diseases', label: 'Pathogen & Disease Guide', icon: Bug },
                { id: 'varroa-simulator', label: 'Varroa Mite Simulator', icon: Sparkles },
            ]
        },
        {
            title: "IoT Hardware & Sensors",
            items: [
                { id: 'sensor-alerts', label: 'Sensor Real-Time Alerts', icon: Bell },
                { id: 'continuous-monitor', label: 'Continuous Telemetry', icon: Gauge },
                { id: 'devices', label: 'Hardware & IoT Nodes', icon: Cpu },
                { id: 'measurement-tools', label: 'Measurement Data Tools', icon: Scale },
                { id: 'meters', label: 'IoT Flow & Smart Meters', icon: Zap },
            ]
        },
        {
            title: "Platform & Settings",
            items: [
                { id: 'settings', label: 'Dashboard Settings', icon: Settings },
                { id: 'integrations', label: 'Connected Integrations', icon: Puzzle },
                { id: 'billing', label: 'Billing & Subscriptions', icon: Banknote },
                { id: 'support', label: 'Support & Help Desk', icon: LifeBuoy },
            ]
        }
    ];

    const currentItem = navCategories.flatMap(c => c.items).find(i => i.id === activeTab) || 
        navItems.find(i => i.id === activeTab);
    const CurrentIcon = (currentItem as any)?.icon || Hexagon;
    const currentLabel = (currentItem as any)?.label || activeTab.replace(/-/g, ' ');

    return (
        <header className={cn(
            "h-16 sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 transition-all duration-300",
            scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-lg" : "bg-transparent"
        )}>
            {/* Left: Hamburger, View Dropdown, & Breadcrumbs */}
            <div className="flex items-center gap-2 sm:gap-3">
                {/* Mobile Drawer Trigger (phone & pad) */}
                <button
                    onClick={onToggleMobileSidebar}
                    className="md:hidden p-2 rounded-xl bg-muted/40 hover:bg-[#F4D03F]/15 border border-border text-foreground transition-all flex items-center justify-center shrink-0"
                    aria-label="Open navigation menu"
                    title="Open Navigation Menu"
                >
                    <Menu className="w-5 h-5 text-[#F4D03F]" />
                </button>

                {/* View Selector Dropdown - ALWAYS VISIBLE ON PHONE, PAD, AND LAPTOP */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-neutral-50 border border-neutral-200/90 rounded-xl transition-all group outline-none shrink-0 shadow-sm"
                            title="Switch Dashboard View"
                        >
                            <div className="w-5 h-5 rounded-lg bg-[#F4D03F]/15 flex items-center justify-center text-[#B78103] dark:text-[#F4D03F] shrink-0">
                                <CurrentIcon className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-bold text-foreground capitalize tracking-tight flex items-center gap-1 max-w-[130px] sm:max-w-[200px] truncate">
                                {currentLabel}
                                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform shrink-0" />
                            </span>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        sideOffset={8}
                        className="w-80 max-h-[82vh] overflow-y-auto rounded-2xl border border-neutral-200/90 p-2.5 shadow-2xl bg-white text-neutral-900 z-50 custom-scrollbar"
                    >
                        <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-amber-700 flex items-center justify-between border-b border-neutral-100 mb-2">
                            <span>BeeYield Expert Views</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-bold">Harvests Grade</span>
                        </DropdownMenuLabel>
                        <div className="space-y-3">
                            {navCategories.map((category) => (
                                <div key={category.title} className="space-y-1">
                                    <div className="flex items-center gap-1.5 px-3 py-1">
                                        <Layers className="w-3 h-3 text-amber-600" />
                                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">{category.title}</p>
                                    </div>
                                    <div className="space-y-0.5">
                                        {category.items.map((item) => {
                                            const ItemIcon = item.icon;
                                            const isActive = activeTab === item.id;
                                            return (
                                                <DropdownMenuItem
                                                    key={item.id}
                                                    onClick={() => onTabChange(item.id)}
                                                    className={cn(
                                                        "px-2.5 py-2 text-xs rounded-xl cursor-pointer flex items-center justify-between transition-all border my-0.5",
                                                        isActive 
                                                            ? "bg-amber-50 border-amber-300 text-neutral-950 font-bold shadow-sm" 
                                                            : "border-transparent text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 hover:border-neutral-200"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <div className={cn(
                                                            "w-6 h-6 rounded-md flex items-center justify-center shrink-0 border transition-all",
                                                            isActive
                                                                ? "bg-[#F4D03F] text-neutral-900 border-[#F4D03F]"
                                                                : "bg-[#F4D03F]/10 border-[#F4D03F]/20 text-[#F4D03F]"
                                                        )}>
                                                            <ItemIcon className="w-3.5 h-3.5 shrink-0" />
                                                        </div>
                                                        <span className="truncate font-semibold">{item.label}</span>
                                                    </div>
                                                    {isActive && (
                                                        <span className="w-2 h-2 rounded-full bg-[#F4D03F] shrink-0" />
                                                    )}
                                                </DropdownMenuItem>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Breadcrumbs (Hidden on tiny phone screens, visible on pad & laptop) */}
                <div className="hidden sm:flex items-center gap-2">
                    <span className="text-border">•</span>
                    <span className="text-[11px] font-semibold text-[#F4D03F] tracking-wide uppercase">OS</span>
                    <span className="text-border">/</span>
                    <span className="text-[11px] font-medium text-muted-foreground capitalize truncate max-w-[120px]">
                        {activeTab.replace(/-/g, ' ')}
                    </span>
                </div>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-2 md:gap-3">
                {/* Search */}
                <div className="hidden lg:flex items-center h-10 px-4 bg-muted/30 rounded-xl border border-border focus-within:border-border/ transition-all gap-2 w-64 group/search">
                    <Search className="w-4 h-4 text-muted-foreground/70 group-focus-within/search:text-[#F4D03F] transition-colors" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground/70 w-full"
                    />
                    <kbd className="hidden md:inline text-[10px] text-gray-300 bg-muted/30 px-1.5 py-0.5 rounded border border-border">⌘K</kbd>
                </div>

                {/* Quick Action */}
                <button
                    onClick={onQuickAction}
                    className={cn(glass.btnPrimary, "hidden sm:flex px-4 shadow-none")}
                >
                    <Plus className="w-4 h-4" />
                    <span className="hidden md:inline">New Record</span>
                </button>

                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="relative h-10 w-10 bg-muted/30 border border-border rounded-xl flex items-center justify-center hover:border-border/ hover:bg-[#F4D03F]/10 transition-all group">
                            <Bell className="w-4 h-4 text-muted-foreground group-hover:text-foreground/90 transition-colors" />
                            {alerts.length > 0 && (
                                <div className="absolute top-2 right-2 w-2 h-2 bg-[#F4D03F] rounded-full shadow-[0_0_8px_rgba(255,107,0,0.6)] animate-pulse" />
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        sideOffset={8}
                        className="w-80 rounded-2xl border border-neutral-200 p-2 shadow-2xl bg-white text-neutral-900 z-50"
                    >
                        <div className="px-4 py-3 bg-[#F4D03F]/5 rounded-lg mb-2 border border-border/50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#F4D03F]/10 flex items-center justify-center">
                                    <ShieldCheck className="w-4 h-4 text-[#F4D03F]" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">Alerts</p>
                                    <p className="text-[11px] text-muted-foreground">{alerts.length} active</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            {alerts.length > 0 ? alerts.map((n) => (
                                <DropdownMenuItem key={n.id} className="flex items-start gap-3 px-4 py-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                                        n.severity === 'critical' ? "bg-red-500" : "bg-[#F4D03F]"
                                    )} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-medium text-foreground truncate">{n.message}</p>
                                        <span className="text-[11px] text-muted-foreground">
                                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                </DropdownMenuItem>
                            )) : (
                                <div className="py-8 text-center">
                                    <Activity className="w-8 h-8 text-muted-foreground/70 mx-auto mb-2" />
                                    <p className="text-[13px] text-muted-foreground/70">No alerts</p>
                                </div>
                            )}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Profile */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-3 h-10 pl-1.5 pr-3 bg-muted/30 border border-border rounded-xl hover:border-border/ hover:bg-[#F4D03F]/10 transition-all group">
                            <div className="w-7 h-7 rounded-lg bg-card border border-border/50 flex items-center justify-center flex-shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[#F4D03F] text-white font-bold text-[10px]">
                                        {userName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <span className="hidden md:block text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors">
                                {userName}
                            </span>
                            <ChevronDown className="w-3 h-3 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform" />
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="end"
                        sideOffset={8}
                        className="w-56 rounded-2xl border border-neutral-200 p-2 shadow-2xl bg-white text-neutral-900 z-50"
                    >
                        <DropdownMenuLabel className="px-3 py-2 text-[11px] font-medium text-muted-foreground tracking-wider">
                            Account
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => onTabChange('settings')}
                            className="px-3 py-2.5 text-sm text-foreground/90 hover:text-foreground hover:bg-muted/30 cursor-pointer flex items-center gap-3 rounded-lg transition-colors"
                        >
                            <Settings className="w-4 h-4 text-muted-foreground" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onTabChange('support')}
                            className="px-3 py-2.5 text-sm text-foreground/90 hover:text-foreground hover:bg-muted/30 cursor-pointer flex items-center gap-3 rounded-lg transition-colors"
                        >
                            <Hexagon className="w-4 h-4 text-muted-foreground" />
                            {t('nav_support')}
                        </DropdownMenuItem>
                        <Separator className="my-2 bg-muted/30" />
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


