import React from 'react';
import { cn } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';
import { Sparkles, Terminal, Shield, ArrowRight, Zap, Info, Settings, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { glass } from './GlassTheme';

interface FirstStepsBannerProps {
    onTabChange: (tab: string) => void;
}

const FirstStepsBanner: React.FC<FirstStepsBannerProps> = ({ onTabChange }) => {
    const { showGuides, setShowGuides } = useSettings();

    if (!showGuides) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative p-5 rounded-2xl border border-[#F4D03F]/20 bg-gradient-to-r from-[#F4D03F]/5 to-transparent mb-6 overflow-hidden"
        >
            <button
                onClick={() => setShowGuides(false)}
                className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-[#F9F7F2] flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-[#F4D03F]/10 transition-all"
            >
                <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#F4D03F]/10 rounded-lg border border-[#F4D03F]/20">
                        <Sparkles className="w-3 h-3 text-[#F4D03F]" />
                        <span className="text-[11px] font-semibold text-[#F4D03F]">Getting Started</span>
                    </div>
                    <h2 className="text-lg font-bold text-[#1A1A1A]">
                        Welcome to BeeYield
                    </h2>
                    <p className="text-sm text-gray-600 max-w-xl leading-relaxed">
                        Set up your apiaries, connect your IoT sensors, and start monitoring your hive fleet in real-time.
                    </p>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#F4D03F]/10">
                <p className="text-[11px] text-gray-500 mb-3 font-medium">Quick Actions</p>
                <div className="flex flex-wrap gap-2">
                    {[
                        { label: 'My Places', tab: 'places', icon: Shield },
                        { label: 'Devices', tab: 'devices', icon: Zap },
                        { label: 'Data', tab: 'data', icon: Terminal },
                        { label: 'Support', tab: 'support', icon: Info },
                        { label: 'AI Assistant', tab: 'agro-intelligence', icon: Sparkles },
                        { label: 'Settings', tab: 'settings', icon: Settings },
                    ].map((link) => (
                        <button
                            key={link.tab}
                            onClick={() => onTabChange(link.tab)}
                            className="group flex items-center gap-2 px-3 py-2 bg-[#F9F7F2] hover:bg-[#F4D03F]/10 border border-[#F4D03F]/20 hover:border-[#F4D03F]/20 rounded-lg transition-all text-gray-600 hover:text-[#1A1A1A]"
                        >
                            <link.icon className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#F4D03F] transition-colors" />
                            <span className="text-[12px] font-medium">{link.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default FirstStepsBanner;
