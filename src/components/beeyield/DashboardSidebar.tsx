import React, { useState } from 'react';
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
    Database
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface NavItem {
    id: string;
    label: string;
    icon: React.ElementType;
    hasSubmenu?: boolean;
    submenuItems?: NavItem[];
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
    const [expandedGroups, setExpandedGroups] = useState<string[]>(['data', 'meters', 'beeyield']);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleGroup = (id: string) => {
        setExpandedGroups(prev =>
            prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
        );
    };

    const isTabActive = (id: string) => activeTab === id;

    const renderNavItem = (item: NavItem, depth = 0) => {
        const isActive = isTabActive(item.id);
        const hasChildren = (item.submenuItems && item.submenuItems.length > 0) || (item.subItems && item.subItems.length > 0);
        const isExpanded = expandedGroups.includes(item.id);

        return (
            <div key={item.id} className="w-full">
                <button
                    onClick={() => hasChildren ? toggleGroup(item.id) : onTabChange(item.id)}
                    className={cn(
                        "w-full flex items-center justify-between h-12 px-4 transition-none border-b-2 border-black group",
                        isActive ? "bg-[#FF4F00] text-white" : "text-black hover:bg-neutral-100",
                        depth > 0 && "pl-8 h-10 bg-neutral-50/50"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <item.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-black")} />
                        <span className={cn(
                            "text-[10px] uppercase font-bold tracking-widest",
                            isActive ? "text-white" : "text-black"
                        )}>
                            {item.label}
                        </span>
                    </div>
                    {hasChildren && (
                        isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
                    )}
                </button>

                {hasChildren && isExpanded && (
                    <div className="bg-white">
                        {(item.submenuItems || item.subItems)?.map(sub => renderNavItem(sub, depth + 1))}
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
                className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#FF4F00] border-4 border-black flex items-center justify-center text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none translate-y-[-2px]"
            >
                {mobileMenuOpen ? <X /> : <Menu />}
            </button>

            <aside className={cn(
                "fixed inset-y-0 left-0 z-40 w-72 bg-white border-r-4 border-black flex flex-col transition-transform lg:translate-x-0 shadow-[8px_0px_0px_0px_rgba(0,0,0,0.05)]",
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Branding */}
                <div className="h-20 flex items-center px-6 border-b-4 border-black bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 border-2 border-black bg-black flex items-center justify-center">
                            <Hexagon className="w-6 h-6 text-white fill-current" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black text-black uppercase tracking-tighter leading-none">BeeYield</span>
                            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Data Hub</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="p-4 flex items-center justify-between border-b-2 border-black bg-neutral-50 px-6">
                        <span className="text-[10px] font-bold uppercase text-black tracking-widest">Menu</span>
                        <div className="bg-black text-white px-2 py-0.5 text-[8px] font-bold tracking-widest">LIVE</div>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="py-0">
                            {navItems.map(item => renderNavItem(item))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t-4 border-black bg-white space-y-4">
                    <button
                        onClick={() => onTabChange('settings')}
                        className="w-full h-12 border-2 border-black bg-white flex items-center gap-3 px-4 hover:bg-neutral-100 transition-none"
                    >
                        <Settings className="w-4 h-4 text-black" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-black">Settings</span>
                    </button>
                    <button
                        onClick={onLogout}
                        className="w-full h-12 border-2 border-black bg-black flex items-center gap-3 px-4 hover:bg-[#FF4F00] text-white transition-none transition-colors"
                    >
                        <LogOut className="w-4 h-4 text-white" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default DashboardSidebar;
