import React from 'react';
import { Camera, ArrowUp, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';
import beeyieldService from '@/services/beeyieldService';

const VpmTicker: React.FC = () => {
    const [vpm, setVpm] = React.useState(14.2);
    const [trend, setTrend] = React.useState<'up' | 'down'>('up');

    React.useEffect(() => {
        let mounted = true;

        const readVpm = async () => {
            try {
                const rows = await beeyieldService.getSensorReadings(undefined, 1);
                const r: any = Array.isArray(rows) ? rows[0] : null;
                const raw =
                    typeof r?.vpm === 'number'
                        ? r.vpm
                        : typeof r?.visits_per_minute === 'number'
                            ? r.visits_per_minute
                            : typeof r?.activity_vpm === 'number'
                                ? r.activity_vpm
                                : null;
                if (!mounted || typeof raw !== 'number') return;

                setVpm((prev) => {
                    const next = Math.max(0, raw);
                    setTrend(next > prev ? 'up' : 'down');
                    return next;
                });
            } catch {
                // ignore (ticker can run stale)
            }
        };

        readVpm();
        const interval = setInterval(readVpm, 15_000);
        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, []);

    return (
        <div className={cn(glass.card, "flex items-center gap-4 px-6 h-full p-0 shadow-none hover:shadow-none hover:border-[#F4D03F]/20 transition-all rounded-2xl group border-l-4 overflow-hidden border-l-honey bg-gray-400")}>
            <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#F4D03F]" />
                <span className={cn(glass.microLabel, "text-muted-foreground whitespace-nowrap")}>Live VPM</span>
            </div>

            <motion.div
                key={vpm}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center gap-2"
            >
                <span className={cn(glass.sectionTitle, "text-xl tabular-nums leading-none")}>
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
                            <ArrowUp className="w-4 h-4 text-[#1B9157]" strokeWidth={3} />
                        ) : (
                            <ArrowDown className="w-4 h-4 text-[#F4D03F]" strokeWidth={3} />
                        )}
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            <div className="hidden xl:block ml-4 shrink-0">
                <div className="flex gap-1 items-end h-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div
                            key={i}
                            className="w-1.5 h-full rounded-t-sm bg-muted overflow-hidden relative"
                        >
                            <motion.div
                                className="absolute bottom-0 left-0 right-0 bg-[#F4D03F]"
                                animate={{
                                    height: [`${22 + (i % 4) * 12}%`, `${85 - (i % 5) * 7}%`, `${28 + (i % 3) * 10}%`]
                                }}
                                transition={{ duration: 1.1, repeat: Infinity, repeatType: 'mirror', delay: i * 0.06, ease: 'easeInOut' }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className={cn(glass.badge, "ml-auto bg-[#1B9157] text-[#1B9157] border-[#1B9157] whitespace-nowrap hidden sm:flex")}>
                Optimal Flow
            </div>
        </div>
    );
};

export default VpmTicker;
