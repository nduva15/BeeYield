import React from 'react';
import { Map, MapPin, MousePointer2, Calculator, Share2, Info, Zap, Layers, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass, PageHeader } from './GlassTheme';
import { motion } from 'framer-motion';

interface OrchardMapperProps {
    onTabChange?: (tab: string, message?: string, action?: string) => void;
}

interface Point {
    x: number;
    y: number;
}

const OrchardMapper: React.FC<OrchardMapperProps> = ({ onTabChange }) => {
    const [points, setPoints] = React.useState<Point[]>([]);
    const [isDrawing, setIsDrawing] = React.useState(false);
    const svgRef = React.useRef<SVGSVGElement>(null);

    const acreage = React.useMemo(() => {
        if (points.length < 3) return 0;
        let area = 0;
        for (let i = 0; i < points.length; i++) {
            const j = (i + 1) % points.length;
            area += points[i].x * points[j].y;
            area -= points[j].x * points[i].y;
        }
        return Math.abs(area) / (2 * 100);
    }, [points]);

    const suggestedHives = Math.ceil(acreage * 2.5);

    const handleSVGClick = (e: React.MouseEvent) => {
        if (!isDrawing) return;
        const rect = svgRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setPoints([...points, { x, y }]);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, "p-4 lg:p-6 space-y-6 pb-20")}
        >
            <PageHeader
                icon={Layers}
                label="Map"
                title={<>Farm <span className="text-[#F4D03F]">Setup</span></>}
                subtitle="Map area, estimate hive count, and plan drops."
                actions={
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsDrawing(!isDrawing)}
                            className={cn(
                                isDrawing ? glass.btnPrimary : glass.btnSecondary,
                                "h-8 px-4 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
                            )}
                        >
                            <MousePointer2 className="w-3 h-3" />
                            {isDrawing ? "FINISH" : "DRAW AREA"}
                        </button>
                        <button className={cn(glass.btnSecondary, "h-8 px-4 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 bg-white")}>
                            <Share2 className="w-3 h-3" />
                            SAVE MAP
                        </button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Drawing Canvas */}
                <div className="lg:col-span-2">
                    <div className={cn(glass.card, "h-[400px] p-0 relative overflow-hidden bg-white border-gray-200")}>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02),transparent)]" />
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                        <svg
                            ref={svgRef}
                            className="absolute inset-0 w-full h-full cursor-crosshair z-10"
                            onClick={handleSVGClick}
                        >
                            {points.length > 0 && (
                                <polygon
                                    points={points.map(p => `${p.x},${p.y}`).join(' ')}
                                    fill="rgba(27,145,87,0.15)"
                                    stroke="#1B9157"
                                    strokeWidth="2"
                                    strokeDasharray="6 4"
                                />
                            )}
                            {points.map((p, i) => (
                                <circle key={i} cx={p.x} cy={p.y} r="5" fill="#1B9157" stroke="white" strokeWidth="2" className="shadow-sm" />
                            ))}
                        </svg>

                        {isDrawing && (
                            <div className="absolute top-4 left-4 px-3 py-1.5 bg-[#F9F7F2] border border-[#F4D03F]/30 rounded-lg flex items-center gap-2 z-20 shadow-sm">
                                <Activity className="w-3.5 h-3.5 animate-pulse text-[#1B9157]" />
                                <span className="text-xs font-bold text-[#1A1A1A] tracking-tight">Drawing Mode Active</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Panel */}
                <div className="lg:col-span-1 space-y-4">
                    <div className={cn(glass.card, "p-5 bg-white space-y-4")}>
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                                <Calculator className="w-4 h-4 text-[#1B9157]" />
                            </div>
                            <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Area Stats</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Area</p>
                                <div className="flex items-end gap-2">
                                    <p className="text-3xl font-bold tracking-tight text-[#1A1A1A]">{acreage.toFixed(1)}</p>
                                    <span className="text-[10px] font-bold text-[#1B9157] mb-1.5">ACRES</span>
                                </div>
                            </div>
                            <div className="space-y-1 pt-4 border-t border-gray-100">
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Suggested Hives</p>
                                <div className="flex items-end gap-2">
                                    <p className="text-3xl font-bold tracking-tight text-[#1A1A1A]">{suggestedHives}</p>
                                    <span className="text-[10px] font-bold text-[#F4D03F] mb-1.5">HIVES</span>
                                </div>
                                <p className="text-[10px] font-medium text-gray-400 leading-tight mt-2">
                                    Based on <span className="text-gray-600 font-bold">2.5 hives/acre</span> (standard density).
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className={cn(glass.card, "p-4 bg-[#F9F7F2] border-[#F4D03F]/20 space-y-2")}>
                        <div className="flex items-center gap-2 text-[#1B9157]">
                            <Zap className="w-4 h-4" />
                            <h4 className="text-xs font-bold text-[#1A1A1A] tracking-tight">Placement notes</h4>
                        </div>
                        <p className="text-[11px] font-medium text-gray-600 leading-relaxed border-l-2 border-[#1B9157]/30 pl-3">
                            Optimal hive placement algorithm increases pollination coverage by <span className="text-[#1A1A1A] font-bold">18%</span> through geospatial saturation analysis.
                        </p>
                    </div>

                    <div className={cn(glass.card, "p-4 bg-white flex items-start gap-3")}>
                        <div className="w-6 h-6 rounded flex items-center justify-center shrink-0 bg-gray-50 border border-gray-100">
                            <Info className="w-3.5 h-3.5 text-[#F4D03F]" />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-xs font-bold text-[#1A1A1A]">Location Export</p>
                            <p className="text-[10px] font-medium text-gray-500 leading-relaxed">
                                Map data can be exported as CSV for drone drops or manual field placement.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default OrchardMapper;
