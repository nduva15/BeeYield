import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, LogOut, ShoppingBag } from 'lucide-react';
import Logo from '@/assets/Logo.png';
import { motion } from 'framer-motion';

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
            className={cn("flex flex-col h-full bg-white border-r border-gray-100 w-64 shadow-[0_0_20px_rgba(0,0,0,0.02)]", className)}
        >
            {/* Logo area - More consumer friendly */}
            <motion.div variants={itemVariants} className="p-7">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3"
                >
                    <img src={Logo} alt="Logo" className="w-10 h-10 object-contain drop-shadow-sm" />
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-none">My Account</h1>
                        <p className="text-[10px] font-black text-primary tracking-widest mt-1.5 uppercase opacity-80">Shop Dashboard</p>
                    </div>
                </motion.div>
            </motion.div>

            {/* Nav */}
            <nav className="flex-1 px-4 mt-4 space-y-1 overflow-y-auto custom-scrollbar-modern">
                {navItems.filter(item => !item.hidden).map((item) => {
                    const isActive = activeTab === item.id;

                    return (
                        <motion.button
                            key={item.id}
                            variants={itemVariants}
                            whileHover={{ scale: 1.01, x: 2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onTabChange(item.id)}
                            className={cn(
                                "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 text-[13px] font-bold group",
                                isActive
                                    ? "bg-primary text-white shadow-lg shadow-primary/25 border border-primary/20"
                                    : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-gray-400 group-hover:text-primary")} />
                            {item.label}
                            {item.id === 'checkout' && (
                                <span className="ml-auto w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse" />
                            )}
                        </motion.button>
                    );
                })}
            </nav>

            {/* Footer Section */}
            <motion.div variants={itemVariants} className="p-5 space-y-3 border-t border-gray-100 bg-gray-50/20">
                <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: '#FEF2F2', color: '#EF4444' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onLogout}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-gray-400 transition-all font-bold text-[13px] group"
                >
                    <LogOut className="w-5 h-5" />
                    Log out
                </motion.button>
                <p className="text-[10px] text-gray-300 font-black text-center pt-2 tracking-[0.05em] uppercase">
                    BEE YIELD SHOP v2.0
                </p>
            </motion.div>
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar-modern::-webkit-scrollbar {
                    width: 3px;
                }
                .custom-scrollbar-modern::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar-modern::-webkit-scrollbar-thumb {
                    background: #F0F0F0;
                    border-radius: 10px;
                }
            `}} />
        </motion.div>
    );
};

export default ShopDashboardSidebar;
