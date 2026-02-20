import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Volume2,
    Waveform,
    Zap,
    AlertCircle,
    Activity,
    Timer,
    Database,
    ShieldAlert,
    BrainCircuit,
    ChevronRight,
    Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { cn } from '@/lib/utils';

// Mock MFCC Data
const generateMFCC = () => {
    return Array.from({ length: 40 }, (_, i) => ({
        freq: i * 200,
        db: 20 + Math.random() * 40 + (i > 10 && i < 20 ? 15 : 0) // Peak for activity
    }));
};

const AcousticMoodTransformer: React.FC = () => {
    const [mfccData, setMfccData] = useState(generateMFCC());
    const [status, setStatus] = useState<'queen-right' | 'queenless-roar' | 'swarm-intent'>('queen-right');
    const [confidence, setConfidence] = useState(98.4);

    useEffect(() => {
        const interval = setInterval(() => {
            setMfccData(generateMFCC());
            setConfidence(prev => Math.max(95, Math.min(99.9, prev + (Math.random() - 0.5))));
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    const STATUS_MAP = {
        'queen-right': {
            label: 'Stable (Queen Right)',
            desc: 'Vibrational signatures indicate active queen pheromone and stable brood rearing.',
            color: '#10b981',
            bg: 'bg-green-50',
            border: 'border-[#10b981]'
        },
        'queenless-roar': {
            label: 'Queenless Roar Detection',
            desc: '48H EARLY WARNING: High-intensity low-frequency resonance detected. Queen likely missing.',
            color: '#facc15',
            bg: 'bg-yellow-50',
            border: 'border-[#facc15]'
        },
        'swarm-intent': {
            label: 'Swarm Pre-Forecast',
            desc: '72H WARNING: Vibration density at hive center exceeds threshold. Swarm cell creation highly probable.',
            color: '#ef4444',
            bg: 'bg-red-50',
            border: 'border-red-500'
        }
    };

    return (
        <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[12px_12px_0px_0px_rgba(6,78,59,1)] overflow-hidden">
            <CardHeader className="border-b-4 border-[#064e3b] bg-white p-10">
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[#10b981] bg-[#064e3b]">
                            <BrainCircuit className="w-3.5 h-3.5 text-[#facc15]" />
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Transformer-Encoder decoding</span>
                        </div>
                        <CardTitle className="text-5xl font-black text-[#064e3b] tracking-tighter uppercase leading-none">
                            Acoustic <span className="text-[#10b981]">Mood</span>
                        </CardTitle>
                        <p className="text-[10px] font-bold text-[#064e3b]/40 uppercase tracking-[0.4em]">Sub-audible Vibration Analysis</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase text-[#064e3b]/40 tracking-widest mb-1">AI Confidence</p>
                            <p className="text-4xl font-black text-[#064e3b] leading-none">{confidence.toFixed(1)}%</p>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0 flex flex-col xl:flex-row divide-y-4 xl:divide-y-0 xl:divide-x-4 divide-[#064e3b]">
                {/* Spectral View */}
                <div className="flex-1 p-10 space-y-8 bg-neutral-50 min-h-[500px]">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Activity className="w-5 h-5 text-[#064e3b]" />
                            <h3 className="text-xl font-black uppercase tracking-tighter">MFCC Spectral Feed</h3>
                        </div>
                        <div className="flex gap-4">
                            <Badge className="rounded-none border-2 border-[#064e3b] bg-white text-[#064e3b] font-black text-[9px]">40-CHAN</Badge>
                            <Badge className="rounded-none border-2 border-[#064e3b] bg-[#064e3b] text-white font-black text-[9px]">REALTIME</Badge>
                        </div>
                    </div>

                    <div className="h-[350px] w-full border-4 border-[#064e3b] bg-white p-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[#064e3b]/[0.02] pointer-events-none" />
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mfccData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorDb" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={STATUS_MAP[status].color} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={STATUS_MAP[status].color} stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#064e3b10" />
                                <XAxis
                                    dataKey="freq"
                                    hide
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#064e3b50', fontWeight: 900, fontSize: 10 }}
                                />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-[#064e3b] text-white p-2 text-[9px] font-black uppercase border-2 border-[#facc15]">
                                                    {payload[0].value.toFixed(1)} dB @ {payload[0].payload.freq}Hz
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="db"
                                    stroke={STATUS_MAP[status].color}
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorDb)"
                                    isAnimationActive={false}
                                />
                                <ReferenceLine x={40} stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <div className="p-4 border-2 border-[#064e3b] bg-white text-center">
                            <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Base Freq</p>
                            <p className="text-xl font-black text-[#064e3b]">225 Hz</p>
                        </div>
                        <div className="p-4 border-2 border-[#064e3b] bg-white text-center">
                            <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Harmonic Flux</p>
                            <p className="text-xl font-black text-[#064e3b]">1.4σ</p>
                        </div>
                        <div className="p-4 border-2 border-[#064e3b] bg-white text-center">
                            <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Peak Amplitude</p>
                            <p className="text-xl font-black text-[#064e3b]">58.2 dB</p>
                        </div>
                    </div>
                </div>

                {/* Prediction Panel */}
                <div className="w-full xl:w-[500px] p-10 bg-white space-y-12">
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 border-[#10b981] border-l-8 pl-6">
                            <ShieldAlert className="w-6 h-6 text-[#064e3b]" />
                            <h3 className="text-3xl font-black uppercase tracking-tighter">AI Diagnosis</h3>
                        </div>

                        <div className={cn(
                            "p-8 border-4 shadow-[8px_8px_0px_0px_rgba(6,78,59,1)] transition-all",
                            STATUS_MAP[status].border,
                            STATUS_MAP[status].bg
                        )}>
                            <div className="flex items-center gap-4 mb-4">
                                <Timer className="w-6 h-6 text-[#064e3b]" />
                                <h4 className="text-2xl font-black text-[#064e3b] uppercase leading-tight">{STATUS_MAP[status].label}</h4>
                            </div>
                            <p className="text-xs font-bold text-[#064e3b] uppercase leading-relaxed">
                                {STATUS_MAP[status].desc}
                            </p>
                        </div>
                    </section>

                    <Separator className="bg-[#064e3b]/10 h-1" />

                    <section className="space-y-8">
                        <div className="flex justify-between items-center">
                            <h4 className="text-xl font-black uppercase tracking-tighter">Expert Mode Controls</h4>
                            <Settings className="w-5 h-5 text-[#064e3b]/30" />
                        </div>

                        <div className="space-y-4">
                            <Button
                                variant="outline"
                                onClick={() => setStatus('queen-right')}
                                className={cn(
                                    "w-full h-16 rounded-none border-4 font-black uppercase tracking-widest text-[10px] justify-between px-6 transition-none",
                                    status === 'queen-right' ? "bg-[#064e3b] text-white border-[#064e3b]" : "border-[#064e3b] text-[#064e3b]"
                                )}
                            >
                                Verify Queen Right <ChevronRight className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setStatus('queenless-roar')}
                                className={cn(
                                    "w-full h-16 rounded-none border-4 font-black uppercase tracking-widest text-[10px] justify-between px-6 transition-none",
                                    status === 'queenless-roar' ? "bg-[#facc15] text-[#064e3b] border-[#064e3b]" : "border-[#064e3b] text-[#064e3b]"
                                )}
                            >
                                Simulate Queenless Roar <Zap className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setStatus('swarm-intent')}
                                className={cn(
                                    "w-full h-16 rounded-none border-4 font-black uppercase tracking-widest text-[10px] justify-between px-6 transition-none",
                                    status === 'swarm-intent' ? "bg-red-500 text-white border-[#064e3b]" : "border-[#064e3b] text-[#064e3b]"
                                )}
                            >
                                Analyze Swarm Density <Volume2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </section>

                    <div className="p-8 border-4 border-[#064e3b] bg-neutral-900 text-white flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-[#10b981] animate-pulse rounded-full" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#10b981]">Deep Inference Engine</p>
                        </div>
                        <p className="font-mono text-[9px] text-white/60 leading-relaxed uppercase">
                            [LOG]: Input buffer MFCC-40 channel streaming... <br />
                            [LOG]: Transformer Layer 12 attention lock @ freq 225Hz... <br />
                            [LOG]: Pattern match found: Stability Index 0.98.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default AcousticMoodTransformer;
