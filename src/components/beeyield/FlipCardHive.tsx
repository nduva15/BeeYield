import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Hexagon, Zap, Droplet, ArrowRight, Settings, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlipCardHiveProps {
    hive: {
        id: string;
        name: string;
        weight: number;
        temp: number;
        humidity: number;
        status: 'ok' | 'warning' | 'critical';
    };
    onViewHistory: () => void;
    onMarkInspection: () => void;
}

const FlipCardHive: React.FC<FlipCardHiveProps> = ({ hive, onViewHistory, onMarkInspection }) => {
    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'ok': return 'bg-[#10b981]/10 border-[#10b981] text-[#064e3b]';
            case 'warning': return 'bg-[#facc15]/10 border-[#facc15] text-[#064e3b]';
            case 'critical': return 'bg-red-500/10 border-red-500 text-red-700';
            default: return 'bg-white border-[#064e3b] text-[#064e3b]';
        }
    };

    return (
        <Card className="h-full border-4 border-[#064e3b] bg-white rounded-none shadow-[6px_6px_0px_0px_rgba(6,78,59,1)] overflow-hidden group">
            <div className={cn("p-2 border-b-2 border-[#064e3b] font-black text-[10px] uppercase tracking-[0.2em] text-center", getStatusStyles(hive.status))}>
                STATUS: {hive.status.toUpperCase()}
            </div>

            <CardContent className="h-full flex flex-col p-6 gap-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-3xl font-black text-[#064e3b] tracking-tighter uppercase leading-none mb-1">
                            {hive.name}
                        </h3>
                        <p className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-widest">
                            Hive Asset
                        </p>
                    </div>
                    <div className="w-10 h-10 border-2 border-[#10b981] flex items-center justify-center bg-[#064e3b] text-[#facc15]">
                        <Hexagon className="w-5 h-5" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 border-2 border-[#064e3b] bg-neutral-50/50">
                        <div className="flex items-center gap-2 mb-1 text-[#064e3b]/40">
                            <Zap className="w-3.5 h-3.5" />
                            <span className="text-[8px] font-black uppercase tracking-widest">Weight</span>
                        </div>
                        <span className="text-xl font-black text-[#064e3b]">{hive.weight}kg</span>
                    </div>
                    <div className="p-3 border-2 border-[#064e3b] bg-neutral-50/50">
                        <div className="flex items-center gap-2 mb-1 text-[#064e3b]/40">
                            <Droplet className="w-3.5 h-3.5" />
                            <span className="text-[8px] font-black uppercase tracking-widest">Humidity</span>
                        </div>
                        <span className="text-xl font-black text-[#064e3b]">{hive.humidity}%</span>
                    </div>
                </div>

                <div className="mt-auto space-y-2">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="flex-1 h-10 rounded-none border-2 border-[#064e3b] bg-white text-[#064e3b] hover:bg-[#064e3b] hover:text-white font-black text-[9px] uppercase tracking-widest transition-none"
                            onClick={onViewHistory}
                        >
                            <BarChart2 className="w-3 h-3 mr-2" /> Data
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 h-10 rounded-none border-2 border-[#064e3b] bg-white text-[#064e3b] hover:bg-[#064e3b] hover:text-white font-black text-[9px] uppercase tracking-widest transition-none"
                            onClick={onMarkInspection}
                        >
                            <Settings className="w-3 h-3 mr-2" /> Inspect
                        </Button>
                    </div>
                    <Button
                        className="w-full h-10 rounded-none bg-[#064e3b] text-white hover:bg-[#10b981] font-black text-[9px] uppercase tracking-widest transition-none border-2 border-[#064e3b] shadow-[4px_4px_0px_0px_rgba(16,185,129,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                        onClick={onViewHistory}
                    >
                        View Details <ArrowRight className="w-3 h-3 ml-2 text-[#facc15]" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default FlipCardHive;
