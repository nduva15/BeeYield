import React from 'react';
import { cn } from '@/lib/utils';
import {
    Home,
    Smartphone,
    MapPin,
    Hexagon,
    Activity,
    FileText,
    HelpCircle,
    ClipboardList,
    Cpu,
    LayoutList,
    Receipt,
    LifeBuoy,
    Settings,
    ChevronDown,
    ChevronRight,
    LogOut,
    Menu,
    X,
    Database,
    Zap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import beeyieldLogo from '@/assets/Logo.png';

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    id: string;
    label: string;
    icon: React.ElementType;
    hidden?: boolean;
    hasSubmenu?: boolean;
    submenuItems?: (NavItem | NavGroup)[];
    subItems?: NavItem[]; // for third level
}

interface DashboardSidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    onLogout: () => void;
    navItems: NavItem[];
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
    activeTab,
    onTabChange,
    onLogout,
    navItems
}) => {
    const [expandedGroups, setExpandedGroups] = React.useState<string[]>(['precision-pollination-folder', 'beeyield', 'data', 'meters']);
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    const toggleGroup = (id: string) => {
        setExpandedGroups(prev =>
            prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
        );
    };

    const isTabActive = (id: string) => activeTab === id;

    const renderNavItem = (item: NavItem | NavGroup, depth = 0) => {
        if ('title' in item) {
            return (
                <div key={item.title} className="mt-6 mb-2">
                    <div className="px-8 py-2">
                        <span className="text-[9px] font-black text-primary/40 uppercase tracking-widest">{item.title}</span>
                    </div>
                    {item.items.map(subItem => renderNavItem(subItem, depth + 1))}
                </div>
            );
        }

        const isActive = isTabActive(item.id);
        const hasChildren = (item.submenuItems && item.submenuItems.length > 0) || (item.subItems && item.subItems.length > 0);
        const isExpanded = expandedGroups.includes(item.id);

        return (
            <div key={item.id} className="w-full">
                <button
                    onClick={() => hasChildren ? toggleGroup(item.id) : onTabChange(item.id)}
                    className={cn(
                        "w-full flex items-center justify-between h-11 px-6 transition-all border-b border-border/30 group relative overflow-hidden",
                        isActive ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-muted/30",
                        depth > 0 && "pl-10 h-10 bg-muted/10"
                    )}
                >
                    {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                    )}
                    <div className="flex items-center gap-3">
                        <item.icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground/70 group-hover:text-muted-foreground/90")} />
                        <span className={cn(
                            "text-[10px] font-bold",
                            isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground/80"
                        )}>
                            {item.label}
                        </span>
                    </div>
                    {hasChildren && (
                        <div className={cn("transition-transform duration-200", isExpanded ? "rotate-180" : "rotate-0")}>
                            <ChevronDown className={cn("w-3 h-3", isActive ? "text-primary" : "text-muted-foreground/30")} />
                        </div>
                    )}
                </button>

                {hasChildren && isExpanded && (
                    <div className="bg-muted/5">
                        {(item.submenuItems || item.subItems)?.map((sub: any) => renderNavItem(sub, depth + 1))}
                    </div>
                )
                }
            </div >
        );
    };

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden fixed bottom-8 right-8 z-50 w-16 h-16 bg-primary border-4 border-primary/20 flex items-center justify-center text-primary-foreground shadow-lg active:scale-95 transition-all"
            >
                {mobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
            </button>

            <aside className={cn(
                "fixed inset-y-0 left-0 z-40 w-72 bg-card border-r border-border flex flex-col transition-transform lg:translate-x-0 shadow-sm",
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Branding */}
                <div className="h-24 flex items-center px-8 border-b border-border bg-card group cursor-pointer" onClick={() => onTabChange('home')}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl border border-border bg-white flex items-center justify-center shadow-sm group-hover:border-primary/30 transition-all overflow-hidden">
                            <img src={beeyieldLogo} alt="BeeYield Dashboard" className="w-9 h-9 object-contain" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold text-foreground tracking-tighter leading-none">BeeYield <span className="text-primary">Dashboard</span></span>
                            <span className="text-[9px] font-bold text-primary mt-1 uppercase tracking-widest">Operational Intelligence OS</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="h-10 flex items-center justify-between border-b border-border bg-muted/10 px-8">
                        <span className="text-[8px] font-bold text-muted-foreground/70 tracking-wider">WORKSPACE</span>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[8px] font-bold text-green-500 uppercase tracking-tighter">Synchronized</span>
                        </div>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="py-0">
                            {navItems.map(item => renderNavItem(item))}
                        </div>
                    </ScrollArea>
                </div>

                <div className="p-6 border-t border-border bg-card space-y-3">
                    <button
                        onClick={() => onTabChange('settings')}
                        className="w-full h-11 rounded-xl border border-border bg-card flex items-center gap-3 px-6 hover:bg-muted/40 transition-all shadow-sm"
                    >
                        <Settings className="w-4 h-4 text-muted-foreground/70" />
                        <span className="text-[10px] font-bold text-muted-foreground/90">Preferences</span>
                    </button>
                    <button
                        onClick={onLogout}
                        className="w-full h-11 rounded-xl bg-foreground text-background flex items-center gap-3 px-6 hover:bg-primary hover:text-primary-foreground transition-all shadow-md group"
                    >
                        <LogOut className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" />
                        <span className="text-[10px] font-bold">Sign Out</span>
                    </button>
                    <div className="pt-2 flex justify-center">
                        <span className="text-[8px] font-bold text-muted-foreground/40">© 2026 BeeYield Dashboard Platform</span>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default DashboardSidebar;
