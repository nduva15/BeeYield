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
                        "w-full flex items-center justify-between h-14 px-6 transition-none border-b-2 border-[#064e3b]/10 group relative overflow-hidden",
                        isActive ? "bg-[#10b981] text-gray-900" : "text-[#064e3b] hover:bg-[#facc15]/5",
                        depth > 0 && "pl-10 h-12 bg-neutral-50/30"
                    )}
                >
                    {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#064e3b]" />
                    )}
                    <div className="flex items-center gap-4">
                        <item.icon className={cn("w-4 h-4", isActive ? "text-gray-900" : "text-[#064e3b]/40 group-hover:text-[#064e3b]")} />
                        <span className={cn(
                            "text-[10px] uppercase font-black tracking-[0.2em]",
                            isActive ? "text-gray-900" : "text-[#064e3b]/60 group-hover:text-[#064e3b]"
                        )}>
                            {item.label}
                        </span>
                    </div>
                    {hasChildren && (
                        <div className={cn("transition-transform duration-200", isExpanded ? "rotate-180" : "rotate-0")}>
                            <ChevronDown className={cn("w-3 h-3", isActive ? "text-gray-900" : "text-[#064e3b]/20")} />
                        </div>
                    )}
                </button>

                {hasChildren && isExpanded && (
                    <div className="bg-white">
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
                className="lg:hidden fixed bottom-8 right-8 z-50 w-16 h-16 bg-[#10b981] border-4 border-[#064e3b] flex items-center justify-center text-gray-900 shadow-[8px_8px_0px_0px_rgba(6,78,59,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
            >
                {mobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
            </button>

            <aside className={cn(
                "fixed inset-y-0 left-0 z-40 w-80 bg-white border-r-4 border-[#064e3b] flex flex-col transition-transform lg:translate-x-0 shadow-[10px_0px_60px_rgba(6,78,59,0.05)]",
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Branding */}
                <div className="h-32 flex items-center px-8 border-b-4 border-[#064e3b] bg-white group cursor-pointer" onClick={() => onTabChange('home')}>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 border-4 border-[#064e3b] bg-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(16,185,129,1)] transition-colors">
                            <img src="/logo.png" alt="BeeYield" className="w-10 h-10 object-contain" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-3xl font-black text-[#064e3b] uppercase tracking-tighter leading-none">BeeYield</span>
                            <span className="text-[10px] font-black text-[#10b981] uppercase tracking-[0.3em] mt-1 italic">Registry_v4.2</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="h-14 flex items-center justify-between border-b-2 border-[#064e3b] bg-neutral-50 px-8">
                        <span className="text-[9px] font-black uppercase text-[#064e3b]/30 tracking-[0.3em]">Operational_Nodes</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-[#10b981] animate-pulse" />
                            <span className="text-[8px] font-black tracking-widest text-[#10b981]">SYNC_OK</span>
                        </div>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="py-0">
                            {navItems.map(item => renderNavItem(item))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Footer Actions */}
                <div className="p-8 border-t-4 border-[#064e3b] bg-white space-y-4">
                    <button
                        onClick={() => onTabChange('settings')}
                        className="w-full h-14 border-4 border-[#064e3b] bg-white flex items-center gap-4 px-6 hover:bg-[#facc15]/10 transition-none shadow-[4px_4px_0px_0px_rgba(6,78,59,0.1)]"
                    >
                        <Settings className="w-5 h-5 text-[#064e3b]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#064e3b]">System Config</span>
                    </button>
                    <button
                        onClick={onLogout}
                        className="w-full h-14 border-4 border-[#064e3b] bg-[#064e3b] flex items-center gap-4 px-6 hover:bg-red-600 text-gray-900 transition-all shadow-[6px_6px_0px_0px_rgba(16,185,129,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                    >
                        <LogOut className="w-5 h-5 text-gray-900" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Terminate_Session</span>
                    </button>
                    <div className="pt-4 flex justify-center">
                        <span className="text-[8px] font-black text-[#064e3b]/20 uppercase tracking-[0.4em]">© 2026 Registry_Core</span>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default DashboardSidebar;
