import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    trend?: string;
    trendType?: 'positive' | 'negative' | 'neutral';
    icon: React.ElementType;
    className?: string;
    subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    trend,
    trendType = 'neutral',
    icon: Icon,
    className,
    subtitle
}) => {
    return (
        <div className={cn("h-full", className)}>
            <Card className="h-full border border-slate-200/60 dark:border-white/5 bg-white dark:bg-white/5 rounded-[2.25rem] shadow-2xl shadow-black/5 flex flex-col transition-all duration-300 hover:scale-[1.02] hover:shadow-black/10 group">
                <CardContent className="p-8 flex flex-col justify-between h-full bg-transparent">
                    <div className="flex justify-between items-start mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-black/20 flex items-center justify-center border border-slate-100 dark:border-white/10 group-hover:border-amber-500/50 group-hover:bg-amber-500/10 transition-colors">
                            <Icon className="w-6 h-6 stroke-[2] text-slate-400 group-hover:text-amber-500 transition-colors" />
                        </div>
                        {trend && (
                            <div className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest border",
                                trendType === 'positive' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                                    trendType === 'negative' ? "bg-red-500/10 text-red-600 border-red-500/20" :
                                        "bg-slate-50 dark:bg-white/5 text-slate-400 border-slate-100 dark:border-white/10"
                            )}>
                                {trendType === 'positive' && <ArrowUpRight className="w-3.5 h-3.5" />}
                                {trendType === 'negative' && <ArrowDownRight className="w-3.5 h-3.5" />}
                                {trendType === 'neutral' && <Minus className="w-3.5 h-3.5" />}
                                {trend}
                            </div>
                        )}
                    </div>

                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.3em] italic">
                            {title}
                        </p>
                        <h3 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none italic pb-1">
                            {value}
                        </h3>
                        {subtitle && <p className="text-[10px] text-slate-500 dark:text-white/40 font-black uppercase tracking-widest border-t border-slate-100 dark:border-white/5 pt-4 mt-6 italic">{subtitle}</p>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default StatCard;
