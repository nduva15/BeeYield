import React from 'react';
import { cn } from '@/lib/utils';
import {
    Home,
    LogIn,
    Calendar,
    Calculator,
    Sprout,
    Flower2,
    Target,
    Box,
    CheckSquare,
    Compass,
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
    LifeBuoy,
    Plane,
    HeartPulse,
    Info,
    Download,
    Plug,
    Package,
    AudioLines,
    BarChart3
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
    onToggleToolsDrawer?: () => void;
    isToolsDrawerOpen?: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    onTabChange,
    onLogout,
    activeTab,
    onQuickAction,
    navItems = [],
    onToggleMobileSidebar,
    deviceMode = 'auto',
    onDeviceModeChange,
    onToggleToolsDrawer,
    isToolsDrawerOpen = false
}) => {
    const { user, beeyieldUser } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    const { theme, setTheme } = useTheme();
    const [alerts, setAlerts] = React.useState<SensorAlert[]>([]);
    const [dropdownQuery, setDropdownQuery] = React.useState('');
    const [dropdownOpen, setDropdownOpen] = React.useState(false);
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

    const userFullName = beeyieldUser?.user_metadata?.full_name || user?.user_metadata?.full_name || '';
    const userEmail = beeyieldUser?.email || user?.email || '';
    const userName = (userFullName || userEmail?.split('@')[0] || 'Beekeeper').split(' ')[0];
    const avatarUrl = user?.user_metadata?.avatar_url || beeyieldUser?.user_metadata?.avatar_url;

    const navCategories = React.useMemo(() => [
        {
            title: "APIARY OPERATIONS",
            items: [
                { id: 'home', label: 'Dashboard Home', icon: Home },
                { id: 'apiaries-weather', label: 'Apiaries & Live Weather', icon: Compass },
                { id: 'hive-health', label: 'Hive Health Dashboard', icon: HeartPulse },
                { id: 'inspections', label: 'Inspections & Diagnostics', icon: ClipboardList },
                { id: 'tasks', label: 'My Tasks & Schedules', icon: CheckSquare },
                { id: 'sound-analysis', label: 'Acoustic Audit (Sound Analysis)', icon: AudioLines },
                { id: 'sensor-alerts', label: 'Alerts', icon: Bug },
                { id: 'site-map', label: 'Hive Placement Map', icon: MapPin },
                { id: 'feeding-schedule', label: 'Feeding Schedule Timeline', icon: Calculator },
                { id: 'apiary-sizing', label: 'Apiary & Equipment Sizing', icon: Layers },
            ]
        },
        {
            title: "YIELD & POLLINATION",
            items: [
                { id: 'harvests', label: 'Harvest Logs & Verification', icon: Package },
                { id: 'harvest-calculator', label: 'Harvest Calculator', icon: Calculator },
                { id: 'yield-projection', label: 'Honey Yield Projection', icon: BarChart3 },
                { id: 'precision-drilldown', label: 'Precision Pollination Drilldown', icon: Target },
                { id: 'pollination-planning-ai', label: 'Pollination Planning', icon: Target },
                { id: 'pollination-calcs', label: 'Pollination Calcs', icon: Calculator },
                { id: 'pollination-analytics', label: 'Pollination Data & Charts', icon: BarChart3 },
                { id: 'pollination-lookup', label: 'Stocking Density Lookup', icon: Flower2 },
                { id: 'moa-view', label: 'MOA — Multi-Objective View', icon: Layers },
                { id: 'moa-compare', label: 'MOA Run Comparison', icon: Layers },
            ]
        },
        {
            title: "BLOOM & FLIGHT",
            items: [
                { id: 'bloom-phenology', label: 'Bloom Phenology', icon: Sprout },
                { id: 'flight-tracker', label: 'Bee Flight & Activity Tracker', icon: Plane },
                { id: 'vpm-counter', label: 'Quick Activity Counter', icon: Plane },
                { id: 'bfh-forecast', label: 'Bee Activity Forecaster', icon: BarChart3 },
                { id: 'florage-page', label: 'Florage Database', icon: Sprout },
                { id: 'forage-zones', label: 'Forage Zones & Floral Resources', icon: Flower2 },
            ]
        },
        {
            title: "KNOWLEDGE & REFERENCE",
            items: [
                { id: 'bee-diseases', label: 'Bee Diseases (Editable)', icon: HeartPulse },
                { id: 'varroa-simulator', label: 'Varroa Simulator', icon: HeartPulse },
                { id: 'beeyield-calculators', label: 'Beeyield Calculators', icon: Calculator },
                { id: 'knowledge-search', label: 'Knowledge Base Search', icon: Info },
                { id: 'dataset-import', label: 'Dataset Import & Re-index', icon: Download },
            ]
        },
        {
            title: "BUSINESS & DEVICES",
            items: [
                { id: 'integrations', label: 'Integrations (Shopify, QuickBooks, eTIMS)', icon: Plug },
                { id: 'measurement-tools', label: 'My Devices, USB, Bluetooth & Online', icon: Cpu },
                { id: 'support', label: 'Support & Tickets', icon: LifeBuoy },
                { id: 'settings', label: 'Settings — Control Center', icon: Settings },
                { id: 'about-ai', label: 'About Beeyield AI', icon: Info },
                { id: 'auth', label: 'Sign in / Sign up', icon: LogIn },
            ]
        }
    ], []);

    const filteredCategories = React.useMemo(() => {
        const q = dropdownQuery.trim().toLowerCase();
        if (!q) return navCategories;
        return navCategories
            .map((c) => ({
                ...c,
                items: c.items.filter((i) => i.label.toLowerCase().includes(q))
            }))
            .filter((c) => c.items.length > 0);
    }, [navCategories, dropdownQuery]);

    const currentItem = navCategories.flatMap(c => c.items).find(i => i.id === activeTab) || 
        navItems.find(i => i.id === activeTab);
    const CurrentIcon = (currentItem as any)?.icon || (activeTab === 'home' ? Home : Sparkles);
    const currentLabel = (currentItem as any)?.label || (activeTab === 'home' ? 'Home' : activeTab.replace(/-/g, ' '));

    return (
        <header className={cn(
            "h-16 sticky top-0 z-40 flex items-center justify-between px-3 sm:px-4 md:px-6 transition-all duration-300",
            "bg-white/95 dark:bg-[#100e0b]/95 backdrop-blur-md border-b border-stone-200/90 dark:border-stone-800 shadow-xs"
        )}>
            {/* Left: Mobile Sidebar Trigger & View Directory Dropdown */}
            <div className="flex items-center gap-2 sm:gap-2.5">
                {/* Mobile Menu Button - Harmonious glassmorphic styling */}
                {(onToggleMobileSidebar || onToggleToolsDrawer) && (
                    <button
                        onClick={onToggleMobileSidebar || onToggleToolsDrawer}
                        className="lg:hidden h-10 w-10 bg-white/90 dark:bg-stone-900/90 border border-stone-200/90 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-500/50 hover:bg-amber-50/50 dark:hover:bg-stone-800/80 rounded-2xl flex items-center justify-center transition-all group shadow-xs shrink-0 active:scale-95"
                        aria-label="Open BeeYield Dashboard Menu"
                        title="Open BeeYield Dashboard Menu"
                    >
                        <Menu className="w-5 h-5 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform" />
                    </button>
                )}

                {/* Directory Views Dropdown - Perfectly matching pill trigger */}
                <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="flex items-center gap-2 sm:gap-2.5 h-10 px-3 sm:px-3.5 bg-white/90 dark:bg-stone-900/90 border border-stone-200/90 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-500/50 hover:bg-amber-50/50 dark:hover:bg-stone-800/80 rounded-2xl transition-all group outline-none shrink-0 shadow-xs text-stone-900 dark:text-white active:scale-95"
                            title="BeeYield AI Tools & Views Directory"
                        >
                            <div className="w-6 h-6 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                                <CurrentIcon className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs sm:text-sm font-bold tracking-tight text-stone-900 dark:text-white flex items-center gap-1.5 leading-none">
                                <span className="truncate max-w-[110px] sm:max-w-[180px]">{currentLabel}</span>
                                <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-500 group-data-[state=open]:rotate-180 transition-transform duration-200 shrink-0" />
                            </span>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        sideOffset={8}
                        className="w-76 sm:w-84 max-h-[80vh] overflow-y-auto rounded-3xl border border-stone-200/90 dark:border-stone-800 p-3 shadow-2xl bg-white/98 dark:bg-[#181512]/98 backdrop-blur-2xl text-stone-900 dark:text-stone-100 z-50 custom-scrollbar ring-1 ring-black/5 dark:ring-white/5 animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
                    >
                        {/* Search tools input */}
                        <div className="p-1 mb-2.5 border-b border-stone-100 dark:border-stone-800/80">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                                <input
                                    type="text"
                                    value={dropdownQuery}
                                    onChange={(e) => setDropdownQuery(e.target.value)}
                                    placeholder="Search tools & views..."
                                    aria-label="Search tools & views"
                                    className="w-full bg-stone-100/80 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 dark:text-white placeholder:text-stone-400 outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/30 transition-all"
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>

                        {filteredCategories.length === 0 ? (
                            <p className="px-3 py-4 text-xs text-stone-400 text-center">
                                No view matches “{dropdownQuery}”.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {filteredCategories.map((category) => (
                                    <div key={category.title} className="space-y-1">
                                        <p className="px-2.5 mb-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500">
                                            {category.title}
                                        </p>
                                        <div className="space-y-0.5">
                                            {category.items.map((item) => {
                                                const ItemIcon = item.icon;
                                                const isActive = activeTab === item.id;
                                                return (
                                                    <DropdownMenuItem
                                                        key={item.id}
                                                        onClick={() => {
                                                            onTabChange(item.id);
                                                            setDropdownOpen(false);
                                                        }}
                                                        className={cn(
                                                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs cursor-pointer transition-all",
                                                            isActive
                                                                ? "bg-amber-500/15 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200 font-bold border border-amber-500/30 shadow-xs"
                                                                : "text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/70 hover:text-stone-950 dark:hover:text-white"
                                                        )}
                                                    >
                                                        <ItemIcon className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                                                        <span className="truncate flex-1 font-medium">{item.label}</span>
                                                        {isActive && (
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                                        )}
                                                    </DropdownMenuItem>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Right: Search, Quick Action, Alerts, Profile */}
            <div className="flex items-center gap-2 sm:gap-2.5">
                {/* Search Bar (Desktop) */}
                <div className="relative hidden xl:flex items-center gap-2 px-3 py-1.5 bg-stone-100/80 dark:bg-stone-900/90 border border-stone-200/90 dark:border-stone-800 rounded-2xl w-48 group-focus-within/search:w-64 transition-all group/search">
                    <Search className="w-4 h-4 text-stone-400 group-focus-within/search:text-amber-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent border-none outline-none text-xs text-stone-900 dark:text-white placeholder:text-stone-400 w-full"
                    />
                    <kbd className="hidden md:inline text-[10px] text-stone-400 bg-stone-200/60 dark:bg-stone-800 px-1.5 py-0.5 rounded border border-stone-300/60 dark:border-stone-700">⌘K</kbd>
                </div>

                {/* Quick Action */}
                <button
                    onClick={onQuickAction}
                    className="hidden sm:inline-flex items-center gap-1.5 h-10 px-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    <span>New Record</span>
                </button>

                {/* Notifications Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="relative h-10 w-10 bg-white/90 dark:bg-stone-900/90 border border-stone-200/90 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-500/50 hover:bg-amber-50/50 dark:hover:bg-stone-800/80 rounded-2xl flex items-center justify-center transition-all group shadow-xs shrink-0 active:scale-95"
                            aria-label="View Alerts & Notifications"
                            title="View Alerts & Notifications"
                        >
                            <Bell className="w-4 h-4 text-stone-600 dark:text-stone-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
                            {alerts.length > 0 && (
                                <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-pulse" />
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        sideOffset={8}
                        className="w-80 sm:w-96 rounded-3xl border border-stone-200/90 dark:border-stone-800 p-3 shadow-2xl bg-white/98 dark:bg-[#181512]/98 backdrop-blur-2xl text-stone-900 dark:text-stone-100 z-50 animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 ring-1 ring-black/5 dark:ring-white/5"
                    >
                        <div className="px-4 py-3 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-orange-500/10 rounded-2xl mb-2.5 border border-amber-500/25 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white">Alerts & Telemetry</p>
                                    <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">{alerts.length} active updates</p>
                                </div>
                            </div>
                            {alerts.length > 0 && (
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                            )}
                        </div>
                        <div className="space-y-1 max-h-72 overflow-y-auto custom-scrollbar">
                            {alerts.length > 0 ? alerts.map((n) => (
                                <DropdownMenuItem key={n.id} className="flex items-start gap-3 px-3.5 py-3 rounded-2xl hover:bg-amber-50/80 dark:hover:bg-stone-800/80 transition-colors cursor-pointer border border-transparent hover:border-amber-200/60 dark:hover:border-stone-700/60">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                                        n.severity === 'critical' ? "bg-red-500" : "bg-amber-500"
                                    )} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">{n.message}</p>
                                        <span className="text-[10px] text-stone-500 dark:text-stone-400">
                                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                </DropdownMenuItem>
                            )) : (
                                <div className="py-8 text-center space-y-1">
                                    <Activity className="w-8 h-8 text-stone-400/60 mx-auto mb-1" />
                                    <p className="text-xs font-medium text-stone-600 dark:text-stone-300">All Systems Optimal</p>
                                    <p className="text-[10px] text-stone-400">No active alerts across monitored apiaries</p>
                                </div>
                            )}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Profile Avatar Dropdown (Ultra-Polished Premium UI/UX) */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="flex items-center gap-2 sm:gap-2.5 h-10 pl-1.5 pr-2.5 sm:pr-3 bg-white/90 dark:bg-stone-900/90 border border-stone-200/90 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-500/50 hover:bg-amber-50/50 dark:hover:bg-stone-800/80 rounded-2xl transition-all group shadow-xs shrink-0 focus:outline-none focus:ring-2 focus:ring-amber-500/30 active:scale-95"
                            aria-label="User profile and account settings"
                        >
                            <div className="relative">
                                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 p-[1.5px] flex items-center justify-center flex-shrink-0 overflow-hidden group-hover:scale-105 transition-transform shadow-xs">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt={userName} className="w-full h-full object-cover rounded-[10px]" />
                                    ) : (
                                        <div className="w-full h-full rounded-[10px] flex items-center justify-center bg-amber-500 text-white font-black text-[11px]">
                                            {userName.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1.5 ring-white dark:ring-stone-900 animate-pulse" />
                            </div>
                            <span className="hidden md:block text-xs font-bold text-stone-800 dark:text-stone-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate max-w-[100px]">
                                {userName}
                            </span>
                            <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-500 group-data-[state=open]:rotate-180 transition-transform duration-200 shrink-0" />
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="end"
                        sideOffset={8}
                        className="w-72 sm:w-80 rounded-3xl border border-stone-200/90 dark:border-stone-800 p-2.5 shadow-2xl bg-white/98 dark:bg-[#181512]/98 backdrop-blur-2xl text-stone-900 dark:text-stone-100 z-50 animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 ring-1 ring-black/5 dark:ring-white/5"
                    >
                        {/* User Identity Header Card */}
                        <div className="p-3 mb-2 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 dark:border-amber-500/15">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 p-0.5 shadow-sm">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt={userName} className="w-full h-full rounded-[14px] object-cover" />
                                        ) : (
                                            <div className="w-full h-full rounded-[14px] bg-amber-500 flex items-center justify-center text-white font-black text-sm">
                                                {userName.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#181512]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white truncate">
                                            {userFullName || userName}
                                        </p>
                                        <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[9px] font-black uppercase tracking-wider">
                                            Owner
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
                                        {userEmail || "Verified Apiary Owner"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Actions */}
                        <div className="space-y-1">
                            <DropdownMenuItem
                                onClick={() => onTabChange('settings')}
                                className="w-full px-3 py-2.5 text-xs rounded-2xl cursor-pointer flex items-center gap-3 transition-all text-stone-800 dark:text-stone-200 hover:text-stone-950 dark:hover:text-white hover:bg-amber-500/10 dark:hover:bg-amber-500/15 focus:bg-amber-500/10 dark:focus:bg-amber-500/15 group"
                            >
                                <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                    <Settings className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-stone-900 dark:text-white text-xs">Settings & Profile</p>
                                    <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">Apiary controls & security</p>
                                </div>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() => onTabChange('apiaries-weather')}
                                className="w-full px-3 py-2.5 text-xs rounded-2xl cursor-pointer flex items-center gap-3 transition-all text-stone-800 dark:text-stone-200 hover:text-stone-950 dark:hover:text-white hover:bg-amber-500/10 dark:hover:bg-amber-500/15 focus:bg-amber-500/10 dark:focus:bg-amber-500/15 group"
                            >
                                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                    <Compass className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-stone-900 dark:text-white text-xs">Apiaries & Live Weather</p>
                                    <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">Location microclimates & hives</p>
                                </div>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() => onTabChange('support')}
                                className="w-full px-3 py-2.5 text-xs rounded-2xl cursor-pointer flex items-center gap-3 transition-all text-stone-800 dark:text-stone-200 hover:text-stone-950 dark:hover:text-white hover:bg-amber-500/10 dark:hover:bg-amber-500/15 focus:bg-amber-500/10 dark:focus:bg-amber-500/15 group"
                            >
                                <div className="w-8 h-8 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                    <LifeBuoy className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-stone-900 dark:text-white text-xs">{t('nav_support') || "Support & Tickets"}</p>
                                    <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">Documentation & help desk</p>
                                </div>
                            </DropdownMenuItem>

                            {/* Quick Appearance / Theme Toggle item */}
                            <div className="px-3 py-2 text-xs flex items-center justify-between rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/60 dark:border-stone-800/80 my-1">
                                <span className="text-[11px] font-medium text-stone-600 dark:text-stone-400 flex items-center gap-2">
                                    {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-amber-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                                    Appearance
                                </span>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setTheme(theme === 'dark' ? 'light' : 'dark');
                                    }}
                                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 shadow-xs hover:border-amber-400 transition-all flex items-center gap-1 cursor-pointer"
                                >
                                    {theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                                </button>
                            </div>
                        </div>

                        <Separator className="my-1.5 bg-stone-200/80 dark:bg-stone-800" />

                        {/* Sign Out Item */}
                        <DropdownMenuItem
                            onClick={onLogout}
                            className="w-full px-3 py-2.5 text-xs rounded-2xl cursor-pointer flex items-center gap-3 transition-all text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 focus:bg-rose-50 dark:focus:bg-rose-950/40 group font-semibold"
                        >
                            <div className="w-8 h-8 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <LogOut className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-rose-600 dark:text-rose-400 text-xs">Sign Out</p>
                                <p className="text-[10px] text-rose-500/80 dark:text-rose-400/70 truncate">End active session securely</p>
                            </div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};

export default DashboardHeader;
