import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, LogOut, Settings } from 'lucide-react';
import Logo from '@/assets/Logo.png';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

export interface ShopNavItem {
    id: string;
    label: string;
    icon: LucideIcon;
    hidden?: boolean;
}

interface SidebarProps {
    className?: string;
    activeTab: string;
    onTabChange: (tab: string) => void;
    onLogout: () => void;
    navItems: ShopNavItem[];
}

const ShopDashboardSidebar: React.FC<SidebarProps> = ({
    className,
    activeTab,
    onTabChange,
    onLogout,
    navItems,
}) => {
    const { user } = useAuth();
    const userMetadata = user?.user_metadata || {};
    const fullName = userMetadata.first_name || userMetadata.full_name || user?.email?.split('@')[0] || 'Customer';
    const avatarUrl = userMetadata.avatar_url;

    // Stagger variants
    const containerVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1] as any,
                staggerChildren: 0.05
            }
        }
    } as any;

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    } as any;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={cn("flex flex-col h-full bg-[#FFF9F0] border-r border-[#F4D03F]/20 w-[240px] md:w-[280px] z-50 antialiased", className)}
        >
            {/* Brand Header */}
            <motion.div variants={itemVariants} className="h-20 flex items-center px-6 border-b border-[#F4D03F]/10">
                <button
                    onClick={() => onTabChange('overview')}
                    className="flex items-center gap-3.5 w-full text-left group transition-colors"
                >
                    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 bg-[#F4D03F]/10 rounded-xl border border-[#F4D03F]/20 p-2 transition-all group-hover:scale-[1.05]">
                        <img src={Logo} alt="BeeYield" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-[#1A1A1A] tracking-tight leading-none">BeeYield <span className="text-[#F4D03F]">Shop</span></span>
                        <span className="text-[11px] text-gray-500 font-medium mt-1">Customer Portal</span>
                    </div>
                </button>
            </motion.div>

            {/* User Profile Summary */}
            <motion.div variants={itemVariants} className="px-6 py-5 border-b border-[#F4D03F]/10 bg-white/40">
                <button
                    onClick={() => onTabChange('profile')}
                    className="flex items-center gap-3.5 group w-full text-left"
                >
                    <div className="w-11 h-11 rounded-xl bg-white border border-[#F4D03F]/10 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-sm group-hover:border-[#F4D03F]/40 transition-all">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#F9F7F2] text-[#F4D03F] font-bold text-sm">
                                {fullName.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[13px] font-bold text-[#1A1A1A] truncate">{fullName}</span>
                        <span className="text-[11px] text-gray-400 font-medium truncate">{user?.email}</span>
                    </div>
                </button>
            </motion.div>

            {/* Navigation */}
            <motion.div variants={itemVariants} className="flex-1 overflow-y-auto px-4 py-5 custom-scrollbar">
                <div className="space-y-1">
                    {navItems.filter(item => !item.hidden).map((item) => {
                        const isActive = activeTab === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => onTabChange(item.id)}
                                className={cn(
                                    "w-full flex items-center justify-between h-10 px-3 transition-all rounded-lg group relative text-[14px]",
                                    isActive
                                        ? "bg-[#F4D03F]/15 text-[#1A1A1A] font-medium"
                                        : "text-gray-600 hover:text-[#1A1A1A] hover:bg-[#F9F7F2] font-medium"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className={cn(
                                        "w-[18px] h-[18px] flex-shrink-0",
                                        isActive ? "text-[#F4D03F]" : "opacity-40 group-hover:opacity-70 group-hover:text-[#1A1A1A]"
                                    )} />
                                    <span className="truncate">
                                        {item.label}
                                    </span>
                                </div>

                                {item.id === 'checkout' && (
                                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#F4D03F]/20 text-[#1A1A1A]">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#F4D03F] animate-pulse" />
                                    </div>
                                )}
                                
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#F4D03F] rounded-r-full shadow-[0_0_8px_rgba(244,208,63,0.5)]" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </motion.div>

            {/* Footer Actions */}
            <motion.div variants={itemVariants} className="p-4 space-y-2 border-t border-[#F4D03F]/10 bg-white/30">
                <button
                    onClick={() => onTabChange('profile')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-gray-500 hover:text-[#1A1A1A] hover:bg-[#F4D03F]/10 transition-all text-[13px] font-medium border border-transparent hover:border-[#F4D03F]/20 bg-[#F9F7F2]"
                >
                    <Settings className="w-4 h-4 opacity-70" />
                    Account Details
                </button>
                <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all text-[13px] font-medium border border-transparent hover:border-red-100 bg-[#F9F7F2]"
                >
                    <LogOut className="w-4 h-4 opacity-70" />
                    Secure Logout
                </button>
                
                <div className="pt-3 text-center">
                   <p className="text-[10px] text-gray-400 font-medium">BEE YIELD SHOP v2.1.0</p>
                </div>
            </motion.div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(244, 208, 63, 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(244, 208, 63, 0.5);
                }
            `}} />
        </motion.div>
    );
};

export default ShopDashboardSidebar;
