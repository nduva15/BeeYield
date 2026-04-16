import React from 'react';
import { motion } from 'framer-motion';
import { X, Database, Image as ImageIcon, Globe, Shield, Microscope, Bug, Home, Zap, DollarSign, Award, Info } from 'lucide-react';
import Logo from "@/assets/Logo.png";

interface AboutBeeYieldProps {
    onClose: () => void;
}

const StatCard = ({ icon: Icon, value, label }: { icon: any, value: string, label: string }) => (
    <div className="bg-[#FFF9F0] p-4 rounded-2xl border border-[#F4D03F]/10 shadow-sm flex flex-col items-center text-center group hover:border-[#F4D03F]/30 transition-all duration-300">
        <div className="w-10 h-10 rounded-xl bg-[#F4D03F]/5 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Icon className="w-5 h-5 text-[#F4D03F]" />
        </div>
        <div className="text-xl font-black text-[#1A1A1A] tracking-tight mb-0.5">{value}</div>
        <div className="text-[8px] font-bold text-[#1A1A1A]/40 tracking-wider">{label}</div>
    </div>
);

const CapabilityCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
    <div className="flex gap-4 p-4 rounded-xl hover:bg-[#F4D03F]/5 transition-all group">
        <div className="w-10 h-10 rounded-xl bg-[#FFF9F0] flex items-center justify-center shadow-sm border border-[#F4D03F]/10 group-hover:border-[#F4D03F]/20 flex-shrink-0">
            <Icon className="w-5 h-5 text-[#F4D03F]" />
        </div>
        <div className="flex flex-col gap-0.5">
            <h4 className="text-[11px] font-black tracking-wider text-[#1A1A1A]">{title}</h4>
            <p className="text-[11px] text-[#1A1A1A]/60 leading-relaxed font-semibold">{description}</p>
        </div>
    </div>
);

export const AboutBeeYield: React.FC<AboutBeeYieldProps> = ({ onClose }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="w-full max-w-3xl max-h-[85vh] overflow-y-auto custom-scroll bg-[#FFF9F0] rounded-[2rem] shadow-2xl border border-[#F4D03F]/20 relative p-6 sm:p-10"
        >
            <button 
                onClick={onClose}
                className="absolute top-6 right-6 w-8 h-8 rounded-full hover:bg-[#F4D03F]/10 flex items-center justify-center transition-all text-[#1A1A1A]/40 hover:text-[#1A1A1A] z-10"
            >
                <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col gap-10">
                {/* Header */}
                <div className="flex flex-col items-start gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#F4D03F]/10 p-2 flex items-center justify-center">
                            <img src={Logo} alt="BeeYield" className="w-full h-full object-contain" />
                        </div>
                        <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tighter leading-none">Our Story</h2>
                    </div>
                    <p className="text-sm text-[#1A1A1A]/60 leading-relaxed font-semibold italic">
                        BeeYield is a knowledge platform for apiculture research. Utilizing over 750,000 curated research datasets, we provide accurate diagnostics, support tools, and global economic metrics for the modern beekeeper.
                    </p>
                </div>

                {/* Global Bee Data */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-[#F4D03F]/10" />
                        <h3 className="text-[9px] font-black text-[#1A1A1A]/30 italic">Research Core</h3>
                        <div className="h-px flex-1 bg-[#F4D03F]/10" />
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        <StatCard icon={Bug} value="20,000+" label="Species Profiles" />
                        <StatCard icon={Home} value="300+" label="Honey Varieties" />
                        <StatCard icon={Shield} value="50+" label="Active Protocols" />
                        <StatCard icon={Microscope} value="750K+" label="Research Nodes" />
                        <StatCard icon={Hexagon} value="91M" label="Tracked Hives" />
                        <StatCard icon={DollarSign} value="$577B" label="Economy Impact" />
                    </div>
                </div>

                {/* Capabilities */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-[#F4D03F]/10" />
                        <h3 className="text-[9px] font-black text-[#1A1A1A]/30 italic">Capabilities</h3>
                        <div className="h-px flex-1 bg-[#F4D03F]/10" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <CapabilityCard 
                            icon={Database} 
                            title="Librarian Engine" 
                            description="Direct lookup from a massive library of peer-reviewed bee science."
                        />
                        <CapabilityCard 
                            icon={ImageIcon} 
                            title="Image Scanning" 
                            description="Real-time species and disease detection from hive imagery."
                        />
                        <CapabilityCard 
                            icon={Globe} 
                            title="Global Sensors" 
                            description="Aggregated climate and production metrics from over 50 countries."
                        />
                        <CapabilityCard 
                            icon={Shield} 
                            title="Bio-Security" 
                            description="Emergency response protocols for invasive species and infections."
                        />
                    </div>
                </div>
            </div>
            <style>{`
                .custom-scroll::-webkit-scrollbar { width: 3px; }
                .custom-scroll::-webkit-scrollbar-track { background: transparent; }
                .custom-scroll::-webkit-scrollbar-thumb { background: rgba(244, 208, 63, 0.2); border-radius: 10px; }
            `}</style>
        </motion.div>
    );
};

// Add missing icon
const Hexagon = ({ className }: { className?: string }) => (
    <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
);
