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

    const userName = (beeyieldUser?.user_metadata?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User').split(' ')[0];
    const avatarUrl = user?.user_metadata?.avatar_url;

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
            "bg-white/95 dark:bg-[#100e0b]/95 backdrop-blur-md border-b border-neutral-200/90 dark:border-neutral-800 shadow-xs"
        )}>
            {/* Left: Mobile Sidebar Trigger & View Directory Dropdown */}
            <div className="flex items-center gap-2 sm:gap-2.5">
                {/* Mobile Menu Button - Harmonious styling matching avatar & notification controls */}
                {(onToggleMobileSidebar || onToggleToolsDrawer) && (
                    <button
                        onClick={onToggleMobileSidebar || onToggleToolsDrawer}
                        className="lg:hidden h-10 w-10 bg-white dark:bg-[#181614] border border-neutral-200/90 dark:border-amber-500/30 hover:border-amber-400 hover:bg-neutral-50 dark:hover:bg-[#231f1a] rounded-2xl flex items-center justify-center transition-all group shadow-sm shrink-0"
                        aria-label="Open BeeYield Dashboard Menu"
                        title="Open BeeYield Dashboard Menu"
                    >
                        <Menu className="w-5 h-5 text-amber-500 group-hover:scale-105 transition-transform" />
                    </button>
                )}

                {/* Directory Views Dropdown - Perfectly matching pill trigger */}
                <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="flex items-center gap-2 sm:gap-2.5 h-10 px-3 sm:px-3.5 bg-white dark:bg-[#181614] border border-neutral-200/90 dark:border-amber-500/30 hover:border-amber-400 hover:bg-neutral-50 dark:hover:bg-[#231f1a] rounded-2xl transition-all group outline-none shrink-0 shadow-sm text-neutral-900 dark:text-white"
                            title="BeeYield AI Tools & Views Directory"
                        >
                            <div className="w-6 h-6 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                                <CurrentIcon className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs sm:text-sm font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-1.5 leading-none">
                                <span className="truncate max-w-[110px] sm:max-w-[180px]">{currentLabel}</span>
                                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform shrink-0" />
                            </span>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        sideOffset={8}
                        className="w-76 sm:w-84 max-h-[80vh] overflow-y-auto rounded-2xl border border-neutral-200/90 dark:border-neutral-800 p-2.5 shadow-2xl bg-white dark:bg-[#181614] text-neutral-900 dark:text-neutral-100 z-50 custom-scrollbar"
                    >
                        {/* Search tools input */}
                        <div className="p-1 mb-2.5 border-b border-neutral-100 dark:border-neutral-800/80">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={dropdownQuery}
                                    onChange={(e) => setDropdownQuery(e.target.value)}
                                    placeholder="Search tools & views..."
                                    aria-label="Search tools & views"
                                    className="w-full bg-neutral-50 dark:bg-[#201d19] border border-neutral-200 dark:border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-amber-500/80 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>

                        {filteredCategories.length === 0 ? (
                            <p className="px-3 py-4 text-xs text-muted-foreground text-center">
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
                                                            "w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-left text-xs cursor-pointer transition-colors",
                                                            isActive
                                                                ? "bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/20 shadow-xs"
                                                                : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#201d19]"
                                                        )}
                                                    >
                                                        <ItemIcon className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                                                        <span className="truncate flex-1">{item.label}</span>
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
                {/* Search Bar */}
                <div className="relative hidden xl:flex items-center gap-2 px-3 py-1.5 bg-neutral-100/80 dark:bg-[#181614] border border-neutral-200/90 dark:border-amber-500/30 rounded-2xl w-48 group-focus-within/search:w-64 transition-all group/search">
                    <Search className="w-4 h-4 text-muted-foreground group-focus-within/search:text-amber-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground w-full"
                    />
                    <kbd className="hidden md:inline text-[10px] text-neutral-400 bg-neutral-200/50 dark:bg-neutral-800 px-1.5 py-0.5 rounded border border-border">⌘K</kbd>
                </div>

                {/* Quick Action */}
                <button
                    onClick={onQuickAction}
                    className="hidden sm:inline-flex items-center gap-1.5 h-10 px-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all"
                >
                    <Plus className="w-4 h-4" />
                    <span>New Record</span>
                </button>

                {/* Notifications Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="relative h-10 w-10 bg-white dark:bg-[#181614] border border-neutral-200/90 dark:border-amber-500/30 hover:border-amber-400 hover:bg-neutral-50 dark:hover:bg-[#231f1a] rounded-2xl flex items-center justify-center transition-all group shadow-sm shrink-0"
                            aria-label="View Alerts & Notifications"
                            title="View Alerts & Notifications"
                        >
                            <Bell className="w-4 h-4 text-muted-foreground group-hover:text-foreground dark:group-hover:text-white transition-colors" />
                            {alerts.length > 0 && (
                                <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-pulse" />
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        sideOffset={8}
                        className="w-80 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 p-2 shadow-2xl bg-white dark:bg-[#181614] text-neutral-900 dark:text-neutral-100 z-50"
                    >
                        <div className="px-4 py-3 bg-amber-500/10 rounded-xl mb-2 border border-amber-500/20">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                    <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-foreground">Alerts & System Telemetry</p>
                                    <p className="text-[11px] text-muted-foreground">{alerts.length} active updates</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            {alerts.length > 0 ? alerts.map((n) => (
                                <DropdownMenuItem key={n.id} className="flex items-start gap-3 px-4 py-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-[#201d19] transition-colors cursor-pointer">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                                        n.severity === 'critical' ? "bg-red-500" : "bg-amber-500"
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
                                    <p className="text-[13px] text-muted-foreground/70">No active alerts</p>
                                </div>
                            )}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Profile Avatar Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="flex items-center gap-2 sm:gap-2.5 h-10 pl-1.5 pr-2.5 sm:pr-3 bg-white dark:bg-[#181614] border border-neutral-200/90 dark:border-amber-500/30 hover:border-amber-400 hover:bg-neutral-50 dark:hover:bg-[#231f1a] rounded-2xl transition-all group shadow-sm shrink-0"
                            aria-label="User profile and account settings"
                        >
                            <div className="w-7 h-7 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-amber-500 text-white font-black text-[11px]">
                                        {userName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <span className="hidden md:block text-xs font-bold text-neutral-800 dark:text-neutral-200 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors truncate max-w-[100px]">
                                {userName}
                            </span>
                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform shrink-0" />
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="end"
                        sideOffset={8}
                        className="w-56 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 p-2 shadow-2xl bg-white dark:bg-[#181614] text-neutral-900 dark:text-neutral-100 z-50"
                    >
                        <DropdownMenuLabel className="px-3 py-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                            Account: {userName}
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => onTabChange('settings')}
                            className="px-3 py-2 text-xs font-medium text-foreground hover:bg-neutral-100 dark:hover:bg-[#201d19] cursor-pointer flex items-center gap-3 rounded-xl transition-colors"
                        >
                            <Settings className="w-4 h-4 text-amber-500" />
                            Settings & Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onTabChange('support')}
                            className="px-3 py-2 text-xs font-medium text-foreground hover:bg-neutral-100 dark:hover:bg-[#201d19] cursor-pointer flex items-center gap-3 rounded-xl transition-colors"
                        >
                            <LifeBuoy className="w-4 h-4 text-amber-500" />
                            {t('nav_support')}
                        </DropdownMenuItem>
                        <Separator className="my-1.5 bg-neutral-200 dark:bg-neutral-800" />
                        <DropdownMenuItem
                            onClick={onLogout}
                            className="px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer flex items-center gap-3 rounded-xl transition-colors"
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
