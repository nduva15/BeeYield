import React, { useState, useEffect } from 'react';
import { Camera, ArrowUp, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VpmTicker: React.FC = () => {
    const [vpm, setVpm] = useState(14.2);
    const [trend, setTrend] = useState<'up' | 'down'>('up');

    useEffect(() => {
        const interval = setInterval(() => {
            const delta = (Math.random() - 0.5) * 0.8;
            setVpm(prev => {
                const next = Math.max(8, Math.min(22, prev + delta));
                setTrend(next > prev ? 'up' : 'down');
                return next;
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-4 px-6 border-l-4 border-[#064e3b] h-full bg-neutral-50 overflow-hidden group">
            <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#064e3b]" />
                <span className="text-[10px] font-black text-[#064e3b] uppercase tracking-widest">Live VPM</span>
            </div>

            <motion.div
                key={vpm}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center gap-2"
            >
                <span className="text-xl font-black text-[#064e3b] tabular-nums">
                    {vpm.toFixed(1)}
                </span>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={trend}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                    >
                        {trend === 'up' ? (
                            <ArrowUp className="w-4 h-4 text-[#10b981]" strokeWidth={3} />
                        ) : (
                            <ArrowDown className="w-4 h-4 text-[#facc15]" strokeWidth={3} />
                        )}
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            <div className="hidden xl:block ml-4">
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div
                            key={i}
                            className="w-1.5 h-6 border-[1px] border-[#064e3b]/20 bg-white overflow-hidden relative"
                        >
                            <motion.div
                                className="absolute bottom-0 left-0 right-0 bg-[#10b981]"
                                animate={{
                                    height: `${Math.random() * 80 + 20}%`
                                }}
                                transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="ml-4 px-2 py-0.5 border-2 border-[#10b981] bg-[#064e3b] text-white text-[8px] font-black uppercase tracking-widest hidden sm:block">
                Optimal Flow
            </div>
        </div>
    );
};

export default VpmTicker;
