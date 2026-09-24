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
    BookOpen,
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
                { id: 'about', label: 'About BeeYield (Our Story)', icon: BookOpen },
                { id: 'blogs', label: 'BeeYield Blogs & Field Notes', icon: BookOpen },
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
            "bg-background/95 backdrop-blur-md border-b border-border shadow-xs"
        )}>
            {/* Left: Main Tools Dropdown & Tools Rail Button (Matches screenshot 1:1) */}
            <div className="flex items-center gap-2 sm:gap-3">
                {/* BeeYield Tools Dropdown - Main navigation dropdown for tools */}
                <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="flex items-center gap-2.5 px-3.5 py-2 bg-[#14120f] hover:bg-[#1c1915] border border-amber-500/50 hover:border-amber-500/80 rounded-2xl transition-all group outline-none shrink-0 shadow-lg text-white"
                            title="BeeYield AI Tools & Views Directory"
                        >
                            <div className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-[#f59e0b] shrink-0">
                                <CurrentIcon className="w-4 h-4 text-[#f59e0b]" />
                            </div>
                            <span className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5 leading-none">
                                {currentLabel}
                                <ChevronDown className="w-3.5 h-3.5 text-neutral-300 group-data-[state=open]:rotate-180 transition-transform shrink-0" />
                            </span>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        sideOffset={8}
                        className="w-76 sm:w-84 max-h-[85vh] overflow-y-auto rounded-2xl border border-neutral-800 p-2.5 shadow-2xl bg-[#14120f] text-white z-50 custom-scrollbar"
                    >
                        {/* Search tools input matching screenshot */}
                        <div className="p-1 mb-2.5 border-b border-neutral-800/80">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <input
                                    type="text"
                                    value={dropdownQuery}
                                    onChange={(e) => setDropdownQuery(e.target.value)}
                                    placeholder="Search tools"
                                    aria-label="Search tools"
                                    className="w-full bg-[#1e1c18] border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-amber-500/80 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => e.stopPropagation()}
                                    autoFocus
                                />
                            </div>
                        </div>

                        {filteredCategories.length === 0 ? (
                            <p className="px-3 py-4 text-xs text-neutral-400 text-center">
                                No tool matches “{dropdownQuery}”.
                            </p>
                        ) : (
                            <div className="space-y-3.5">
                                {filteredCategories.map((category) => (
                                    <div key={category.title} className="space-y-1">
                                        <p className="px-2.5 mb-1 text-[10px] font-bold uppercase tracking-wider text-[#f59e0b]">
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
                                                            "w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-left text-[13px] cursor-pointer transition-colors focus:bg-[#262420] focus:text-white",
                                                            isActive
                                                                ? "bg-[#262420] text-white font-medium border border-amber-500/20 shadow-sm"
                                                                : "text-neutral-200 hover:text-white hover:bg-[#201d19]"
                                                        )}
                                                    >
                                                        <ItemIcon className="w-4 h-4 flex-shrink-0 text-[#f59e0b]" />
                                                        <span className="truncate flex-1">{item.label}</span>
                                                        {isActive && (
                                                            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] shrink-0" />
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

                {/* AI Tools Rail Toggle Button */}
                {onToggleToolsDrawer && (
                    <button
                        onClick={onToggleToolsDrawer}
                        className={cn(
                            "flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all shadow-md shrink-0",
                            isToolsDrawerOpen
                                ? "border-amber-500 bg-[#1c1915] text-[#f59e0b] shadow-amber-500/10 ring-1 ring-amber-500/30"
                                : "border-amber-500/40 bg-[#14120f] hover:bg-[#1c1915] hover:border-amber-500/70 text-[#f59e0b]"
                        )}
                        title={isToolsDrawerOpen ? "Collapse AI Tools Rail" : "Open & Stick AI Tools Rail"}
                    >
                        <Menu className="w-4 h-4 text-[#f59e0b]" />
                        <span>AI Tools Rail</span>
                        {isToolsDrawerOpen && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] shrink-0" />
                        )}
                    </button>
                )}
            </div>

            {/* Right: Search, Quick Action, Alerts, Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
                {/* Search Bar */}
                <div className="relative hidden xl:flex items-center gap-2 px-3 py-1.5 bg-muted/40 border border-border/50 rounded-xl w-48 group-focus-within/search:w-64 transition-all group/search">
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
                        <button className="relative h-10 w-10 bg-white dark:bg-[#181614] border border-neutral-200/90 dark:border-amber-500/30 rounded-xl flex items-center justify-center hover:border-amber-300 hover:bg-neutral-50 dark:hover:bg-[#231f1a] transition-all group shadow-sm">
                            <Bell className="w-4 h-4 text-muted-foreground group-hover:text-foreground/90 transition-colors" />
                            {alerts.length > 0 && (
                                <div className="absolute top-2 right-2 w-2 h-2 bg-[#F4D03F] rounded-full shadow-[0_0_8px_rgba(255,107,0,0.6)] animate-pulse" />
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        sideOffset={8}
                        className="w-80 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-2 shadow-2xl bg-white dark:bg-[#181614] text-neutral-900 dark:text-neutral-100 z-50"
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
                        <button className="flex items-center gap-3 h-10 pl-1.5 pr-3 bg-white dark:bg-[#181614] border border-neutral-200/90 dark:border-amber-500/30 rounded-xl hover:border-amber-300 hover:bg-neutral-50 dark:hover:bg-[#231f1a] transition-all group shadow-sm">
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
                        className="w-56 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-2 shadow-2xl bg-white dark:bg-[#181614] text-neutral-900 dark:text-neutral-100 z-50"
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
