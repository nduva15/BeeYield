import React from 'react';
import { motion } from 'framer-motion';
import { X, Database, Image as ImageIcon, Globe, Shield, Microscope, Bug, Home, Zap, DollarSign, Award, Info } from 'lucide-react';
import Logo from "@/assets/Logo.png";

interface AboutBeeYieldAIProps {
    onClose: () => void;
}

const StatCard = ({ icon: Icon, value, label }: { icon: any, value: string, label: string }) => (
    <div className="bg-white p-6 rounded-[2.5rem] border border-border shadow-sm flex flex-col items-center text-center group hover:border-honey/30 transition-all duration-500 hover:shadow-honey/5">
        <div className="w-14 h-14 rounded-2xl bg-honey/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
            <Icon className="w-7 h-7 text-honey" />
        </div>
        <div className="text-2xl font-black text-honey tracking-tight mb-1">{value}</div>
        <div className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.1em]">{label}</div>
    </div>
);

const CapabilityCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
    <div className="flex gap-5 p-6 rounded-[2rem] hover:bg-honey/5 transition-all duration-500 group">
        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg border border-border group-hover:border-honey/20 flex-shrink-0">
            <Icon className="w-6 h-6 text-honey" />
        </div>
        <div className="flex flex-col gap-1">
            <h4 className="text-sm font-black uppercase tracking-widest text-foreground">{title}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">{description}</p>
        </div>
    </div>
);

export const AboutBeeYieldAI: React.FC<AboutBeeYieldAIProps> = ({ onClose }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scroll bg-white rounded-[3rem] shadow-3xl border border-border relative p-8 sm:p-12"
        >
            <button 
                onClick={onClose}
                className="absolute top-8 right-8 w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-all text-muted-foreground hover:text-foreground z-10"
            >
                <X className="w-6 h-6" />
            </button>

            <div className="flex flex-col gap-12">
                {/* Header */}
                <div className="flex flex-col items-start gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-honey/10 p-2.5 flex items-center justify-center">
                            <img src={Logo} alt="BeeYield AI" className="w-full h-full object-contain" />
                        </div>
                        <h2 className="text-4xl font-black text-honey italic tracking-tighter uppercase leading-none">About BeeYield AI</h2>
                    </div>
                    <p className="text-lg text-muted-foreground leading-relaxed font-medium font-serif italic">
                        BeeYield AI is the world's most comprehensive bee knowledge system, powered by over 750,000 curated datasets 
                        covering every aspect of apiculture, entomology, and pollination science. From species identification 
                        to disease treatment protocols, honey composition analysis to global industry statistics.
                    </p>
                </div>

                {/* Global Bee Data */}
                <div className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-border" />
                        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground italic">Global Bee Data</h3>
                        <div className="h-px flex-1 bg-border" />
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                        <StatCard icon={Bug} value="20,000+" label="Bee Species Covered" />
                        <StatCard icon={Home} value="300+" label="Honey Varieties" />
                        <StatCard icon={Shield} value="50+" label="Disease Protocols" />
                        <StatCard icon={Microscope} value="750K+" label="Research Datasets" />
                        <StatCard icon={Hexagon} value="91 Million" label="Managed Hives Globally" />
                        <StatCard icon={DollarSign} value="$577B" label="Pollination Value/Year" />
                    </div>
                </div>

                {/* Capabilities */}
                <div className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-border" />
                        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground italic">Capabilities</h3>
                        <div className="h-px flex-1 bg-border" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CapabilityCard 
                            icon={Database} 
                            title="Comprehensive Database" 
                            description="Every bee species, honey variety, disease, treatment protocol, and research finding in one system."
                        />
                        <CapabilityCard 
                            icon={ImageIcon} 
                            title="Image Identification" 
                            description="Upload bee photos for species identification, hive inspection analysis, and disease detection."
                        />
                        <CapabilityCard 
                            icon={Globe} 
                            title="Global Industry Data" 
                            description="Real-time statistics on honey production, export/import trends, and economic impact."
                        />
                        <CapabilityCard 
                            icon={Shield} 
                            title="Disease & Treatment" 
                            description="Complete protocols for Varroa, AFB, EFB, Nosema, and many more diseases."
                        />
                    </div>
                </div>
            </div>
            <style>{`
                .custom-scroll::-webkit-scrollbar { width: 5px; }
                .custom-scroll::-webkit-scrollbar-track { background: transparent; }
                .custom-scroll::-webkit-scrollbar-thumb { background: rgba(245, 158, 11, 0.1); border-radius: 10px; }
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
