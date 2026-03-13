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
    const [expandedGroups, setExpandedGroups] = React.useState<string[]>(['data', 'meters', 'beeyield']);
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
                        <span className="text-[9px] font-black uppercase text-[#064e3b]/30 tracking-[0.3em]">{item.title}</span>
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
                        "w-full flex items-center justify-between h-11 px-6 transition-all border-b border-gray-100 group relative overflow-hidden",
                        isActive ? "bg-[#F4D03F]/10 text-[#1A1A1A]" : "text-gray-500 hover:bg-gray-50",
                        depth > 0 && "pl-10 h-10 bg-gray-50/30"
                    )}
                >
                    {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F4D03F]" />
                    )}
                    <div className="flex items-center gap-3">
                        <item.icon className={cn("w-4 h-4", isActive ? "text-[#F4D03F]" : "text-gray-400 group-hover:text-gray-600")} />
                        <span className={cn(
                            "text-[10px] uppercase font-bold tracking-widest",
                            isActive ? "text-[#1A1A1A]" : "text-gray-500 group-hover:text-gray-700"
                        )}>
                            {item.label}
                        </span>
                    </div>
                    {hasChildren && (
                        <div className={cn("transition-transform duration-200", isExpanded ? "rotate-180" : "rotate-0")}>
                            <ChevronDown className={cn("w-3 h-3", isActive ? "text-[#F4D03F]" : "text-gray-300")} />
                        </div>
                    )}
                </button>

                {hasChildren && isExpanded && (
                    <div className="bg-gray-50/50">
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
                className="lg:hidden fixed bottom-8 right-8 z-50 w-16 h-16 bg-[#10b981] border-4 border-[#064e3b] flex items-center justify-center text-[#1A1A1A] shadow-[8px_8px_0px_0px_rgba(6,78,59,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
            >
                {mobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
            </button>

            <aside className={cn(
                "fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-100 flex flex-col transition-transform lg:translate-x-0 shadow-sm",
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Branding */}
                <div className="h-24 flex items-center px-8 border-b border-gray-100 bg-white group cursor-pointer" onClick={() => onTabChange('home')}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl border border-gray-100 bg-[#F9F7F2] flex items-center justify-center shadow-sm group-hover:border-[#F4D03F]/40 transition-all">
                            <img src="/logo.png" alt="BeeYield" className="w-8 h-8 object-contain" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold text-[#1A1A1A] tracking-tighter leading-none">BeeYield</span>
                            <span className="text-[9px] font-bold text-[#F4D03F] uppercase tracking-[0.2em] mt-1">Operational OS</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="h-10 flex items-center justify-between border-b border-gray-100 bg-gray-50/30 px-8">
                        <span className="text-[8px] font-bold uppercase text-gray-400 tracking-widest">Workspace</span>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#1B9157] animate-pulse" />
                            <span className="text-[8px] font-bold tracking-widest text-[#1B9157]">SYNCHRONIZED</span>
                        </div>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="py-0">
                            {navItems.map(item => renderNavItem(item))}
                        </div>
                    </ScrollArea>
                </div>

                <div className="p-6 border-t border-gray-100 bg-white space-y-3">
                    <button
                        onClick={() => onTabChange('settings')}
                        className="w-full h-11 rounded-xl border border-gray-100 bg-white flex items-center gap-3 px-6 hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <Settings className="w-4 h-4 text-gray-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Preferences</span>
                    </button>
                    <button
                        onClick={onLogout}
                        className="w-full h-11 rounded-xl bg-[#1A1A1A] text-white flex items-center gap-3 px-6 hover:bg-red-600 transition-all shadow-md group"
                    >
                        <LogOut className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Sign Out</span>
                    </button>
                    <div className="pt-2 flex justify-center">
                        <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">© 2026 BeeYield Platform</span>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default DashboardSidebar;
