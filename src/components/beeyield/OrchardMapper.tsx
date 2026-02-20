import React, { useState, useRef, useCallback } from 'react';
import { MapPin, Share2, Hexagon, Trash2, RotateCcw, CheckCircle2, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrchardMapperProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

interface Point { x: number; y: number; }
interface HiveGroup { id: string; x: number; y: number; count: number; }

const GRID_W = 800;
const GRID_H = 500;
const METERS_PER_PIXEL = 0.5; // 1px = 0.5m → area in m²

function polygonArea(pts: Point[]): number {
    let area = 0;
    const n = pts.length;
    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        area += pts[i].x * pts[j].y;
        area -= pts[j].x * pts[i].y;
    }
    return Math.abs(area / 2);
}

function areaSqM(pts: Point[]): number {
    return polygonArea(pts) * METERS_PER_PIXEL * METERS_PER_PIXEL;
}

function sqMtoAcres(sqm: number): number {
    return sqm / 4046.86;
}

const OrchardMapper: React.FC<OrchardMapperProps> = ({ onTabChange }) => {
    const [polygonPoints, setPolygonPoints] = useState<Point[]>([]);
    const [closed, setClosed] = useState(false);
    const [hiveGroups, setHiveGroups] = useState<HiveGroup[]>([]);
    const [mode, setMode] = useState<'draw' | 'place'>('draw');
    const [hiveCountToPlace, setHiveCountToPlace] = useState(4);
    const [shareLink, setShareLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);

    const getSVGPoint = useCallback((e: React.MouseEvent): Point => {
        const rect = svgRef.current!.getBoundingClientRect();
        return {
            x: Math.round(e.clientX - rect.left),
            y: Math.round(e.clientY - rect.top),
        };
    }, []);

    const handleSVGClick = (e: React.MouseEvent) => {
        if (mode === 'draw') {
            if (closed) return;
            const pt = getSVGPoint(e);
            // Close polygon if near first point
            if (polygonPoints.length >= 3) {
                const first = polygonPoints[0];
                const dist = Math.hypot(pt.x - first.x, pt.y - first.y);
                if (dist < 18) {
                    setClosed(true);
                    return;
                }
            }
            setPolygonPoints(prev => [...prev, pt]);
        } else {
            // Place hive group
            const pt = getSVGPoint(e);
            setHiveGroups(prev => [...prev, { id: `HG-${Date.now()}`, x: pt.x, y: pt.y, count: hiveCountToPlace }]);
        }
    };

    const removeHiveGroup = (id: string) => {
        setHiveGroups(prev => prev.filter(h => h.id !== id));
    };

    const handleReset = () => {
        setPolygonPoints([]);
        setClosed(false);
        setHiveGroups([]);
        setShareLink(null);
    };

    const areaM2 = closed ? areaSqM(polygonPoints) : 0;
    const acres = sqMtoAcres(areaM2);
    const totalHives = hiveGroups.reduce((s, h) => s + h.count, 0);
    const fpa = acres > 0 ? (totalHives / acres).toFixed(2) : '—';

    const generateShareLink = () => {
        const dropSummary = hiveGroups.map(h => `${h.id}:${h.count}hives@(${h.x},${h.y})`).join('; ');
        const link = `https://beeyield.app/drop-map?orchard=MyOrchard&acres=${acres.toFixed(2)}&drops=${encodeURIComponent(dropSummary)}`;
        setShareLink(link);
    };

    const copyLink = () => {
        if (!shareLink) return;
        navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const polyPath = polygonPoints.length > 0
        ? polygonPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + (closed ? ' Z' : '')
        : '';

    return (
        <div className="p-8 space-y-10 bg-white min-h-screen text-[#064e3b] antialiased">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-[#064e3b] pb-8">
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-[#064e3b] border-4 border-[#064e3b] flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-[#facc15]" />
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase leading-[0.8]">
                            Orchard <span className="text-[#10b981]">Mapper</span>
                        </h1>
                    </div>
                    <p className="text-[#10b981] font-black uppercase text-[10px] tracking-[0.4em]">
                        Draw Boundaries · Auto-Acreage · Drop Map Generator
                    </p>
                </div>
                {/* KPIs */}
                <div className="flex gap-6">
                    {[
                        { label: 'Acreage', value: closed ? `${acres.toFixed(2)} ac` : '—' },
                        { label: 'Total Hives', value: totalHives > 0 ? `${totalHives}` : '—' },
                        { label: 'FPA', value: fpa },
                    ].map(k => (
                        <div key={k.label} className="border-4 border-[#064e3b] px-6 py-3 text-center">
                            <p className="text-[9px] font-black uppercase tracking-widest text-[#064e3b]/40">{k.label}</p>
                            <p className="text-2xl font-black text-[#064e3b] tabular-nums">{k.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-4">
                <button
                    onClick={() => setMode('draw')}
                    className={cn("px-5 py-2.5 border-4 text-[10px] font-black uppercase tracking-widest",
                        mode === 'draw' ? "bg-[#064e3b] border-[#064e3b] text-white" : "bg-white border-[#064e3b]/20 text-[#064e3b]"
                    )}
                >
                    ✏ Draw Orchard
                </button>
                <button
                    onClick={() => setMode('place')}
                    className={cn("px-5 py-2.5 border-4 text-[10px] font-black uppercase tracking-widest",
                        mode === 'place' ? "bg-[#064e3b] border-[#064e3b] text-white" : "bg-white border-[#064e3b]/20 text-[#064e3b]"
                    )}
                >
                    ⬡ Place Hive Group
                </button>
                {mode === 'place' && (
                    <div className="flex items-center gap-3 border-4 border-[#064e3b]/20 px-4 py-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#064e3b]/40">Hives per Group:</span>
                        <button onClick={() => setHiveCountToPlace(c => Math.max(1, c - 1))} className="w-6 h-6 font-black text-lg flex items-center justify-center hover:bg-[#064e3b]/10">−</button>
                        <span className="text-sm font-black w-5 text-center tabular-nums">{hiveCountToPlace}</span>
                        <button onClick={() => setHiveCountToPlace(c => c + 1)} className="w-6 h-6 font-black text-lg flex items-center justify-center hover:bg-[#064e3b]/10">+</button>
                    </div>
                )}
                <button onClick={handleReset} className="px-5 py-2.5 border-4 border-[#064e3b]/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:border-red-400 hover:text-red-600">
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
                {closed && hiveGroups.length > 0 && (
                    <button onClick={generateShareLink} className="ml-auto px-6 py-2.5 bg-[#064e3b] border-4 border-[#064e3b] text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-[4px_4px_0px_0px_#10b981]">
                        <Share2 className="w-4 h-4" /> Share with Beekeeper
                    </button>
                )}
            </div>

            {/* Canvas */}
            <div className="border-4 border-[#064e3b] overflow-hidden shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
                <div className="bg-[#064e3b]/3 px-4 py-2 border-b-2 border-[#064e3b]/10 flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#064e3b]/30">
                        {mode === 'draw'
                            ? closed ? `Orchard boundary set — ${polygonPoints.length} vertices` : `Click to add vertices (${polygonPoints.length} added). Click near first point to close.`
                            : 'Click anywhere inside the orchard to place a hive group'}
                    </span>
                    {closed && <CheckCircle2 className="w-4 h-4 text-[#10b981]" />}
                </div>
                <svg
                    ref={svgRef}
                    width={GRID_W}
                    height={GRID_H}
                    onClick={handleSVGClick}
                    className="w-full cursor-crosshair select-none"
                    viewBox={`0 0 ${GRID_W} ${GRID_H}`}
                    style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(6,78,59,0.05) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(6,78,59,0.05) 40px)' }}
                >
                    {/* Polygon */}
                    {polyPath && (
                        <path
                            d={polyPath}
                            fill={closed ? 'rgba(16,185,129,0.12)' : 'none'}
                            stroke={closed ? '#10b981' : '#064e3b'}
                            strokeWidth={closed ? 3 : 2}
                            strokeDasharray={closed ? '0' : '6 3'}
                        />
                    )}
                    {/* Vertex dots */}
                    {polygonPoints.map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y} r={i === 0 ? 8 : 5}
                            fill={i === 0 ? '#facc15' : '#064e3b'}
                            stroke="white" strokeWidth={2}
                        />
                    ))}
                    {/* Hive Groups */}
                    {hiveGroups.map(h => (
                        <g key={h.id} transform={`translate(${h.x},${h.y})`}>
                            <polygon
                                points="0,-16 14,-8 14,8 0,16 -14,8 -14,-8"
                                fill="#facc15"
                                stroke="#064e3b"
                                strokeWidth={2}
                            />
                            <text textAnchor="middle" dominantBaseline="central" fontSize="9" fontWeight="900" fill="#064e3b">{h.count}</text>
                            <circle cx="14" cy="-14" r="7" fill="#064e3b" className="cursor-pointer"
                                onClick={(e) => { e.stopPropagation(); removeHiveGroup(h.id); }}
                            />
                            <text x="14" y="-14" textAnchor="middle" dominantBaseline="central" fontSize="8" fontWeight="900" fill="white">✕</text>
                        </g>
                    ))}
                    {/* Acreage label */}
                    {closed && polygonPoints.length > 0 && (() => {
                        const cx = polygonPoints.reduce((s, p) => s + p.x, 0) / polygonPoints.length;
                        const cy = polygonPoints.reduce((s, p) => s + p.y, 0) / polygonPoints.length;
                        return (
                            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight="900" fill="#064e3b">
                                {acres.toFixed(2)} acres
                            </text>
                        );
                    })()}
                </svg>
            </div>

            {/* Share Link Panel */}
            {shareLink && (
                <div className="border-4 border-[#10b981] bg-[#10b981]/5 p-6 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#10b981]">Beekeeper Drop Link Generated</p>
                    <div className="flex items-center gap-4">
                        <p className="font-mono text-xs text-[#064e3b]/70 flex-1 truncate">{shareLink}</p>
                        <button onClick={copyLink} className="flex items-center gap-2 px-4 py-2 border-4 border-[#064e3b] text-[10px] font-black uppercase tracking-widest bg-white hover:bg-[#064e3b] hover:text-white transition-none">
                            {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                    <p className="text-[9px] font-bold text-[#064e3b]/30">Share this link with your logistics team to navigate directly to each hive drop via GPS.</p>
                </div>
            )}
        </div>
    );
};

export default OrchardMapper;
