import React, { useState, useRef } from 'react';
import { ShieldCheck, Camera, Activity, FileCheck, Info, Award, CheckCircle2, XCircle, Search, Cpu, Upload, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import beeyieldService from '@/services/beeyieldService';
import { toast } from 'sonner';
import { glass, PageHeader } from './GlassTheme';
import { motion, AnimatePresence } from 'framer-motion';

interface DigitalHealthAuditProps {
    onTabChange?: (tab: string, message?: string, action?: string) => void;
}

const DigitalHealthAudit: React.FC<DigitalHealthAuditProps> = ({ onTabChange }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [scanResults, setScanResults] = useState<null | any>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            setScanResults(null);
        }
    };

    const handleScan = async () => {
        if (!selectedFile) {
            toast.error("Please select an image first");
            fileInputRef.current?.click();
            return;
        }

        setIsScanning(true);
        try {
            const results = await beeyieldService.analyzeHiveImage({
                image: selectedFile,
                hiveId: 'HV-001' // Mock ID for now
            });
            setScanResults(results);
            toast.success("Scanning complete!");
        } catch (error: any) {
            toast.error("Scanning failed", { description: error.message });
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, "p-8 -m-8 space-y-20 pb-24")}
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 pb-12 border-b border-white/5">
                <div className="space-y-6">
                    <div className={cn(glass.badge, 'bg-honey/10 text-honey border-honey/20 px-8 py-2.5 shadow-3xl skew-x-[-12deg]')}>
                        <div className="flex items-center gap-4 skew-x-[12deg]">
                            <Camera className="w-5 h-5" />
                            <span className="uppercase tracking-[0.4em] font-black italic text-[12px]">Photo Inspection</span>
                        </div>
                    </div>
                    <h1 className="text-8xl font-black text-foreground tracking-tighter uppercase italic leading-none">
                        Health <span className="text-honey">Check</span>
                    </h1>
                    <p className={cn(glass.microLabel, "opacity-40 italic font-black uppercase tracking-[0.4em] ml-2")}>
                        Check bee numbers and hive health using your camera.
                    </p>
                </div>

                <div className="flex gap-6">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(glass.btnSecondary, "h-20 px-12 font-black italic uppercase rounded-full shadow-4xl flex items-center gap-6 border-white/10 hover:bg-white/5")}
                    >
                        <Upload className="w-8 h-8" />
                        {selectedFile ? selectedFile.name.substring(0, 15) : "Select Photo"}
                    </button>
                    <button
                        onClick={handleScan}
                        disabled={isScanning || !selectedFile}
                        className={cn(
                            glass.btnPrimary,
                            "h-20 px-16 font-black italic uppercase text-2xl shadow-4xl shadow-honey/20 rounded-full min-w-[320px] flex items-center justify-center gap-6 disabled:opacity-20 transition-all",
                            isScanning ? "animate-pulse" : ""
                        )}
                    >
                        {isScanning ? <Loader2 className="w-8 h-8 animate-spin" /> : <Sparkles className="w-8 h-8" />}
                        {isScanning ? "Scanning..." : "Start Scan"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                {/* Main Viewport */}
                <div className="lg:col-span-8 space-y-16">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(glass.card, "bg-black h-[700px] relative overflow-hidden rounded-[6rem] shadow-4xl border-white/5 border-8")}
                    >
                        <div className="absolute inset-0 opacity-20 mix-blend-screen bg-gradient-to-b from-honey/20 to-transparent pointer-events-none" />

                        <AnimatePresence mode="wait">
                            {isScanning ? (
                                <motion.div
                                    key="scanning"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 flex flex-col items-center justify-center gap-12"
                                >
                                    <div className="w-80 h-80 border-4 border-dashed border-honey/40 rounded-full flex items-center justify-center relative">
                                        <motion.div
                                            animate={{ top: ['0%', '100%', '0%'] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                            className="w-full h-2 bg-honey/60 absolute blur-md rounded-full shadow-[0_0_30px_rgba(251,191,36,0.8)]"
                                        />
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="w-16 h-16 text-honey animate-spin" />
                                            <span className="text-xl font-black italic text-honey uppercase tracking-[0.5em]">Analyzing</span>
                                        </div>
                                    </div>
                                    <p className="text-2xl font-black italic opacity-40 uppercase tracking-widest text-white text-center px-12">
                                        Identifying bees and counting markers...
                                    </p>
                                </motion.div>
                            ) : scanResults ? (
                                <motion.div
                                    key="results"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute inset-0 p-20 bg-honey text-black flex flex-col justify-center items-center text-center overflow-y-auto"
                                >
                                    <div className="w-32 h-32 bg-black rounded-[2.5rem] flex items-center justify-center mb-10 shadow-4xl">
                                        <Award className="w-16 h-16 text-honey" />
                                    </div>
                                    <h3 className="text-7xl font-black italic uppercase tracking-tighter mb-12 leading-none">Healthy <span className="text-white">Colony</span></h3>

                                    <div className="grid grid-cols-3 gap-16 border-y-4 border-black/10 py-12 my-8 w-full">
                                        <div className="space-y-2">
                                            <p className="text-[14px] font-black italic uppercase opacity-40">Mite Check</p>
                                            <p className="text-6xl font-black text-red-600 italic tracking-tighter tabular-nums">{scanResults.mite_count}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[14px] font-black italic uppercase opacity-40">Brood Area</p>
                                            <p className="text-6xl font-black italic tracking-tighter tabular-nums">{scanResults.brood_area_pct}%</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[14px] font-black italic uppercase opacity-40">Score</p>
                                            <p className="text-6xl font-black italic tracking-tighter tabular-nums border-b-8 border-black/10 inline-block">{scanResults.health_score}</p>
                                        </div>
                                    </div>

                                    <div className="text-left w-full mt-10 bg-black/5 p-10 rounded-[3rem] border-2 border-black/10">
                                        <div className="flex items-center gap-6 mb-8">
                                            <Activity className="w-8 h-8 opacity-40" />
                                            <p className="text-[14px] font-black italic uppercase tracking-[0.4em] opacity-40">Detections</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {scanResults.detections?.slice(0, 4).map((d: any, i: number) => (
                                                <div key={i} className="flex justify-between items-center bg-white/20 p-6 rounded-3xl border border-black/5">
                                                    <span className="text-xl font-black italic uppercase tracking-widest">{d.label}</span>
                                                    <span className="text-[12px] font-black italic bg-black/10 px-4 py-1 rounded-full">{Math.round(d.confidence * 100)}% Match</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setScanResults(null)}
                                        className="mt-16 h-20 px-16 bg-black text-white rounded-full font-black italic text-2xl uppercase tracking-widest shadow-4xl hover:scale-105 active:scale-95 transition-all flex items-center gap-6"
                                    >
                                        <Camera className="w-8 h-8" />
                                        New Scan
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="idle"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 flex flex-col items-center justify-center text-white/10 gap-10"
                                >
                                    <div className="w-40 h-40 border-8 border-white/5 rounded-full flex items-center justify-center">
                                        <Search className="w-20 h-20" />
                                    </div>
                                    <p className="text-2xl font-black italic uppercase tracking-[0.5em] text-center px-20">Ready to recognize. Please upload a photo...</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Decoration Elements */}
                        <div className="absolute top-16 left-16 border-t-8 border-l-8 border-white/10 w-24 h-24 rounded-tl-[3.5rem]" />
                        <div className="absolute top-16 right-16 border-t-8 border-r-8 border-white/10 w-24 h-24 rounded-tr-[3.5rem]" />
                        <div className="absolute bottom-16 left-16 border-b-8 border-l-8 border-white/10 w-24 h-24 rounded-bl-[3.5rem]" />
                        <div className="absolute bottom-16 right-16 border-b-8 border-r-8 border-white/10 w-24 h-24 rounded-br-[3.5rem]" />
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className={cn(glass.card, "p-12 shadow-4xl bg-white/80 dark:bg-[#0D0D0D]/80 backdrop-blur-3xl rounded-[4rem] border-white/5 group hover:border-honey/20 transition-all")}>
                            <div className="flex items-center gap-8 mb-8">
                                <div className="w-16 h-16 bg-honey/10 rounded-3xl flex items-center justify-center border border-honey/20 shadow-4xl group-hover:scale-110 transition-transform">
                                    <Cpu className="w-8 h-8 text-honey" />
                                </div>
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter">AI Analysis</h3>
                            </div>
                            <p className="text-xl font-black italic opacity-60 leading-relaxed uppercase pl-4 border-l-4 border-honey/20">
                                Our tool automatically checks your bees. No more manual counting or guessing.
                            </p>
                        </div>
                        <div className={cn(glass.card, "p-12 shadow-4xl bg-white/80 dark:bg-[#0D0D0D]/80 backdrop-blur-3xl rounded-[4rem] border-white/5 group hover:border-honey/20 transition-all")}>
                            <div className="flex items-center gap-8 mb-8">
                                <div className="w-16 h-16 bg-honey/10 rounded-3xl flex items-center justify-center border border-honey/20 shadow-4xl group-hover:scale-110 transition-transform">
                                    <Award className="w-8 h-8 text-honey" />
                                </div>
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter">Health Badge</h3>
                            </div>
                            <p className="text-xl font-black italic opacity-60 leading-relaxed uppercase pl-4 border-l-4 border-honey/20">
                                Get a Health Badge to show that your colony is ready for pollination.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-12">
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(glass.card, "p-12 shadow-4xl bg-white/80 dark:bg-[#0D0D0D]/80 backdrop-blur-3xl rounded-[4.5rem] border-white/5 relative overflow-hidden group")}
                    >
                        <div className="absolute top-0 right-0 w-48 h-48 bg-honey/5 rounded-full blur-[80px] -mr-24 -mt-24 pointer-events-none group-hover:bg-honey/10 transition-all" />

                        <div className="flex items-center justify-between mb-12 border-b-4 border-white/5 pb-8 relative z-10">
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none">History</h3>
                            <div className="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
                                <FileCheck className="w-6 h-6 text-honey" />
                            </div>
                        </div>

                        <div className="space-y-10 relative z-10">
                            {[
                                { date: '2026.02.15', orchard: 'Apple Block', status: 'PASS', score: '8.4 AI' },
                                { date: '2026.02.12', orchard: 'Cherry Field', status: 'PASS', score: '8.1 AI' },
                                { date: '2026.02.08', orchard: 'Almond Edge', status: 'ALERT', score: '6.2 AI' },
                            ].map((audit, i) => (
                                <div key={i} className="flex justify-between items-center group/item cursor-pointer hover:bg-white/5 p-6 rounded-[2.5rem] border-2 border-transparent hover:border-white/5 transition-all">
                                    <div className="space-y-2">
                                        <p className="text-[12px] font-black italic uppercase tracking-widest opacity-30">{audit.date}</p>
                                        <p className="text-2xl font-black italic text-foreground tracking-tighter">{audit.orchard}</p>
                                    </div>
                                    <div className="text-right space-y-3">
                                        <div className={cn(
                                            "inline-block px-6 py-1.5 rounded-full text-[12px] font-black italic tracking-[0.2em] shadow-4xl",
                                            audit.status === 'PASS' ? "bg-emerald-500 text-black" : "bg-red-500 text-white"
                                        )}>
                                            {audit.status}
                                        </div>
                                        <p className="text-xl font-black italic tracking-tighter opacity-40">{audit.score}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-16 h-20 bg-black text-honey rounded-[2.5rem] font-black italic text-xl uppercase tracking-widest shadow-4xl hover:scale-105 transition-all flex items-center justify-center gap-6 group/all">
                            View All
                            <ArrowRight className="w-8 h-8 group-hover/all:translate-x-3 transition-transform" />
                        </button>
                    </motion.div>

                    <div className={cn(glass.card, "p-12 shadow-4xl bg-honey/10 border-honey/20 rounded-[4rem] group hover:bg-honey/15 transition-all relative overflow-hidden")}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                        <div className="flex items-center gap-6 mb-8 relative z-10">
                            <div className="w-16 h-16 bg-white/60 dark:bg-black/60 rounded-[1.5rem] flex items-center justify-center border-2 border-honey shadow-4xl">
                                <Info className="w-8 h-8 text-honey" />
                            </div>
                            <h4 className="text-3xl font-black italic uppercase tracking-tighter leading-none">Healthy standards</h4>
                        </div>
                        <p className="text-xl font-black italic opacity-60 leading-normal uppercase pl-4 border-l-4 border-honey/40 relative z-10">
                            Health checks follow official bee standards. Your certificates are valid for 30 days.
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default DigitalHealthAudit;
