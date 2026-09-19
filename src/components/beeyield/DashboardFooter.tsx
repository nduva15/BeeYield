import React from 'react';
import { cn } from '@/lib/utils';
import { ShieldCheck, Activity, Award, Sprout } from 'lucide-react';
import Logo from '@/assets/Logo.png';

interface DashboardFooterProps {
    onTabChange?: (tab: string) => void;
    className?: string;
}

export const DashboardFooter: React.FC<DashboardFooterProps> = ({
    onTabChange,
    className
}) => {
    return (
        <footer className={cn("mt-12 pt-8 pb-12 border-t border-border/60 text-xs text-muted-foreground w-full", className)}>
            {/* Top Row: System Health, Origin & Panda Miti Initiative */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-center pb-6 border-b border-border/40">
                {/* IoT Gateway Status */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <Activity className="w-4 h-4 animate-pulse" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5 font-bold text-foreground text-xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                            Live Telemetry Gateway
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                            Kibwezi Apiary Centre, Makueni County • Encrypted
                        </p>
                    </div>
                </div>

                {/* Panda Miti Initiative Progress */}
                <div className="p-3 bg-gradient-to-r from-emerald-500/10 via-amber-500/5 to-emerald-500/10 rounded-2xl border border-emerald-500/20">
                    <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                        <span className="flex items-center gap-1.5 text-foreground">
                            <Sprout className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            Panda Miti Initiative
                        </span>
                        <span className="text-[#F4D03F] font-black">2,500 / 45,000</span>
                    </div>
                    <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-[#F4D03F] rounded-full transition-all duration-500" 
                            style={{ width: '5.55%' }} 
                        />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                        Reforestation progress around Kibwezi forage zone
                    </p>
                </div>

                {/* Standards & Security Certification */}
                <div className="flex items-center justify-start md:justify-end gap-3 text-[11px]">
                    <div className="flex items-center gap-1.5 bg-muted/30 px-3 py-1.5 rounded-xl border border-border/60">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span className="font-semibold text-foreground">PCI-DSS & ISO 27001</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-muted/30 px-3 py-1.5 rounded-xl border border-border/60">
                        <Award className="w-4 h-4 text-[#F4D03F]" />
                        <span className="font-semibold text-foreground">KEBS Certified 843kg</span>
                    </div>
                </div>
            </div>

            {/* Middle Row: Quick Navigation & Tools */}
            <div className="py-6 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
                <div className="flex items-center space-x-2">
                    <img src={Logo} alt="BeeYield" className="h-6 w-6 object-contain" />
                    <span className="font-bold text-foreground text-sm tracking-tight">BeeYield OS</span>
                    <span className="text-[10px] bg-[#F4D03F]/20 text-[#B78103] dark:text-[#F4D03F] px-2 py-0.5 rounded-full font-mono">v2.4</span>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-muted-foreground">
                    <button onClick={() => onTabChange?.('home')} className="hover:text-foreground transition-colors">Overview</button>
                    <button onClick={() => onTabChange?.('inspections')} className="hover:text-foreground transition-colors">Inspections</button>
                    <button onClick={() => onTabChange?.('harvests')} className="hover:text-foreground transition-colors">Harvests</button>
                    <button onClick={() => onTabChange?.('hive-health')} className="hover:text-foreground transition-colors">Hive Health</button>
                    <button onClick={() => onTabChange?.('assistant')} className="hover:text-foreground transition-colors">BeeYield AI</button>
                    <button onClick={() => onTabChange?.('devices')} className="hover:text-foreground transition-colors">IoT Nodes</button>
                    <button onClick={() => onTabChange?.('settings')} className="hover:text-foreground transition-colors">Settings</button>
                    <button onClick={() => onTabChange?.('support')} className="hover:text-foreground transition-colors">Support</button>
                </div>
            </div>

            {/* Bottom Row: Copyright & Legal */}
            <div className="pt-4 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted-foreground/70">
                <p>&copy; {new Date().getFullYear()} BeeYield Intelligence Systems. All sensor data and harvest records cryptographically authenticated.</p>
                <div className="flex items-center gap-4">
                    <a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
                    <span>•</span>
                    <a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a>
                    <span>•</span>
                    <a href="/about" className="hover:text-foreground transition-colors">About Us</a>
                </div>
            </div>
        </footer>
    );
};

export default DashboardFooter;
