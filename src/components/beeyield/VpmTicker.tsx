import React from 'react';
import { Camera, ArrowUp, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';

const VpmTicker: React.FC = () => {
    const [vpm, setVpm] = React.useState(14.2);
    const [trend, setTrend] = React.useState<'up' | 'down'>('up');

    React.useEffect(() => {
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
        <div className={cn(glass.card, "flex items-center gap-4 px-6 h-full p-0 shadow-none hover:shadow-none hover:border-honey/20 transition-all rounded-2xl group border-l-4 overflow-hidden border-l-honey bg-white/40 dark:bg-black/20")}>
            <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-honey" />
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
                            <ArrowUp className="w-4 h-4 text-emerald-500" strokeWidth={3} />
                        ) : (
                            <ArrowDown className="w-4 h-4 text-amber-500" strokeWidth={3} />
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
                                className="absolute bottom-0 left-0 right-0 bg-honey"
                                animate={{
                                    height: `${Math.random() * 80 + 20}%`
                                }}
                                transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className={cn(glass.badge, "ml-auto bg-emerald-500/10 text-emerald-500 border-emerald-500/20 whitespace-nowrap hidden sm:flex")}>
                Optimal Flow
            </div>
        </div>
    );
};

export default VpmTicker;
