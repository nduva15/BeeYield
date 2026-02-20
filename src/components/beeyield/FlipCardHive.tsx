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
            case 'ok': return 'bg-[#ecfdf5] border-emerald-500 text-emerald-700';
            case 'warning': return 'bg-[#fffbeb] border-amber-500 text-amber-700';
            case 'critical': return 'bg-[#fef2f2] border-rose-500 text-rose-700';
            default: return 'bg-white border-black text-black';
        }
    };

    return (
        <Card className="h-full border-2 border-black bg-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden group">
            <div className={cn("p-2 border-b-2 border-black font-bold text-[10px] uppercase tracking-widest text-center", getStatusStyles(hive.status))}>
                STATUS: {hive.status.toUpperCase()}
            </div>

            <CardContent className="h-full flex flex-col p-6 gap-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-3xl font-black text-black tracking-tighter uppercase leading-none mb-1">
                            {hive.name}
                        </h3>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                            Hive
                        </p>
                    </div>
                    <div className="w-10 h-10 border-2 border-black flex items-center justify-center bg-[#FF4F00] text-white">
                        <Hexagon className="w-5 h-5" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 border-2 border-black bg-neutral-50">
                        <div className="flex items-center gap-2 mb-1 text-neutral-500">
                            <Zap className="w-3.5 h-3.5" />
                            <span className="text-[8px] font-bold uppercase tracking-widest">Weight</span>
                        </div>
                        <span className="text-xl font-black text-black">{hive.weight}kg</span>
                    </div>
                    <div className="p-3 border-2 border-black bg-neutral-50">
                        <div className="flex items-center gap-2 mb-1 text-neutral-500">
                            <Droplet className="w-3.5 h-3.5" />
                            <span className="text-[8px] font-bold uppercase tracking-widest">Humidity</span>
                        </div>
                        <span className="text-xl font-black text-black">{hive.humidity}%</span>
                    </div>
                </div>

                <div className="mt-auto space-y-2">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="flex-1 h-10 rounded-none border-2 border-black bg-white text-black hover:bg-black hover:text-white font-bold text-[9px] uppercase tracking-widest transition-none"
                            onClick={onViewHistory}
                        >
                            <BarChart2 className="w-3 h-3 mr-2" /> Data
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 h-10 rounded-none border-2 border-black bg-white text-black hover:bg-black hover:text-white font-bold text-[9px] uppercase tracking-widest transition-none"
                            onClick={onMarkInspection}
                        >
                            <Settings className="w-3 h-3 mr-2" /> Inspect
                        </Button>
                    </div>
                    <Button
                        className="w-full h-10 rounded-none bg-black text-white hover:bg-[#FF4F00] font-bold text-[9px] uppercase tracking-widest transition-none border-2 border-black"
                        onClick={onViewHistory}
                    >
                        View Details <ArrowRight className="w-3 h-3 ml-2" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default FlipCardHive;
