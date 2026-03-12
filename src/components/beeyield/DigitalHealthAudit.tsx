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
            className={cn(glass.page, "space-y-8 pb-32")}
        >
            {/* Header Section */}
            <PageHeader
                icon={Camera}
                label="Photo Inspection"
                title={<>Health <span className="text-[#F4D03F]">Check</span></>}
                subtitle="Analyze hive health from images."
                actions={
                    <div className="flex gap-4">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className={cn(glass.btnSecondary, "h-12 px-6 font-black uppercase text-xs rounded-xl shadow-sm flex items-center gap-4 border-[#F4D03F]/20")}
                        >
                            <Upload className="w-4 h-4" />
                            {selectedFile ? selectedFile.name.substring(0, 10) : "Photo"}
                        </button>
                        <button
                            onClick={handleScan}
                            disabled={isScanning || !selectedFile}
                            className={cn(
                                glass.btnPrimary,
                                "h-12 px-8 font-black uppercase text-xs shadow-sm rounded-xl min-w-[180px] flex items-center justify-center gap-4 disabled:opacity-20",
                                isScanning ? "animate-pulse" : ""
                            )}
                        >
                            {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            {isScanning ? "Scanning..." : "Start Scan"}
                        </button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Viewport */}
                <div className="lg:col-span-8 space-y-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(glass.card, "bg-white/50 h-[500px] relative overflow-hidden rounded-3xl shadow-sm border-[#F4D03F]/10")}
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
                                    <div className="w-80 h-80 border-4 border-dashed border-[#F4D03F]/40 rounded-full flex items-center justify-center relative">
                                        <motion.div
                                            animate={{ top: ['0%', '100%', '0%'] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                            className="w-full h-2 bg-[#F4D03F]/60 absolute blur-md rounded-full shadow-[0_0_30px_rgba(251,191,36,0.8)]"
                                        />
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="w-16 h-16 text-[#F4D03F] animate-spin" />
                                            <span className="text-xl font-black italic text-[#F4D03F] uppercase tracking-[0.5em]">Analyzing</span>
                                        </div>
                                    </div>
                                    <p className="text-2xl font-black italic opacity-40 uppercase tracking-widest text-[#1A1A1A] text-center px-12">
                                        Identifying bees and counting markers...
                                    </p>
                                </motion.div>
                            ) : scanResults ? (
                                <motion.div
                                    key="results"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute inset-0 p-20 bg-[#F4D03F] text-[#1A1A1A] flex flex-col justify-center items-center text-center overflow-y-auto"
                                >
                                    <h3 className="text-4xl font-black uppercase tracking-tight mb-8">Healthy <span className="text-white">Colony</span></h3>

                                    <div className="grid grid-cols-3 gap-8 border-y-2 border-black/10 py-8 my-6 w-full">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase opacity-40">Mite Check</p>
                                            <p className="text-3xl font-black text-red-600 tracking-tight tabular-nums">{scanResults.mite_count}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase opacity-40">Brood Area</p>
                                            <p className="text-3xl font-black tracking-tight tabular-nums">{scanResults.brood_area_pct}%</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase opacity-40">Score</p>
                                            <p className="text-3xl font-black tracking-tight tabular-nums">{scanResults.health_score}</p>
                                        </div>
                                    </div>

                                    <div className="text-left w-full mt-6 bg-white/50 p-6 rounded-2xl border border-black/5">
                                        <div className="flex items-center gap-4 mb-4">
                                            <Activity className="w-4 h-4 opacity-40" />
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Detections</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {scanResults.detections?.slice(0, 4).map((d: any, i: number) => (
                                                <div key={i} className="flex justify-between items-center bg-black/5 p-4 rounded-xl border border-black/5">
                                                    <span className="text-sm font-black uppercase tracking-tight">{d.label}</span>
                                                    <span className="text-[10px] font-bold bg-white/50 px-3 py-0.5 rounded-full">{Math.round(d.confidence * 100)}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setScanResults(null)}
                                        className="mt-8 h-12 px-10 bg-white text-[#1A1A1A] rounded-xl font-black text-xs uppercase tracking-widest shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
                                    >
                                        <Camera className="w-5 h-5" />
                                        New Scan
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="idle"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-10"
                                >
                                    <div className="w-40 h-40 border-8 border-[#F4D03F]/10 rounded-full flex items-center justify-center">
                                        <Search className="w-20 h-20" />
                                    </div>
                                    <p className="text-2xl font-black italic uppercase tracking-[0.5em] text-center px-20">Ready to recognize. Please upload a photo...</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Decoration Elements */}
                        <div className="absolute top-16 left-16 border-t-8 border-l-8 border-[#F4D03F]/20 w-24 h-24 rounded-tl-[3.5rem]" />
                        <div className="absolute top-16 right-16 border-t-8 border-r-8 border-[#F4D03F]/20 w-24 h-24 rounded-tr-[3.5rem]" />
                        <div className="absolute bottom-16 left-16 border-b-8 border-l-8 border-[#F4D03F]/20 w-24 h-24 rounded-bl-[3.5rem]" />
                        <div className="absolute bottom-16 right-16 border-b-8 border-r-8 border-[#F4D03F]/20 w-24 h-24 rounded-br-[3.5rem]" />
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className={cn(glass.card, "p-8 shadow-sm bg-white/50 backdrop-blur-xl rounded-3xl border-[#F4D03F]/10 group hover:border-[#F4D03F]/20 transition-all")}>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-[#F4D03F]/10 rounded-xl flex items-center justify-center border border-[#F4D03F]/20 shadow-sm group-hover:scale-110 transition-transform">
                                    <Cpu className="w-5 h-5 text-[#F4D03F]" />
                                </div>
                                <h3 className="text-xl font-black uppercase tracking-tight">AI Vision</h3>
                            </div>
                            <p className="text-sm font-bold opacity-60 leading-relaxed uppercase pl-4 border-l-4 border-[#F4D03F]/20">
                                Automatic population metrics and health markers via neural engine.
                            </p>
                        </div>
                        <div className={cn(glass.card, "p-8 shadow-sm bg-white/50 backdrop-blur-xl rounded-3xl border-[#F4D03F]/10 group hover:border-[#F4D03F]/20 transition-all")}>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-[#F4D03F]/10 rounded-xl flex items-center justify-center border border-[#F4D03F]/20 shadow-sm group-hover:scale-110 transition-transform">
                                    <Award className="w-5 h-5 text-[#F4D03F]" />
                                </div>
                                <h3 className="text-xl font-black uppercase tracking-tight">Certification</h3>
                            </div>
                            <p className="text-sm font-bold opacity-60 leading-relaxed uppercase pl-4 border-l-4 border-[#F4D03F]/20">
                                Validated colony health status for insurance compliance.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(glass.card, "p-8 shadow-sm bg-white/50 backdrop-blur-xl rounded-3xl border-[#F4D03F]/10 relative overflow-hidden group")}
                    >
                        <div className="flex items-center justify-between mb-8 border-b-2 border-[#F4D03F]/10 pb-6 relative z-10">
                            <h3 className="text-xl font-black uppercase tracking-tight leading-none">History</h3>
                            <div className="w-10 h-10 bg-black/5 rounded-xl flex items-center justify-center border border-[#F4D03F]/10 shadow-inner">
                                <FileCheck className="w-5 h-5 text-[#F4D03F]" />
                            </div>
                        </div>

                        <div className="space-y-6 relative z-10">
                            {[
                                { date: '2026.02.15', orchard: 'Apple Block', status: 'PASS', score: '8.4 AI' },
                                { date: '2026.02.12', orchard: 'Cherry Field', status: 'PASS', score: '8.1 AI' },
                                { date: '2026.02.08', orchard: 'Almond Edge', status: 'ALERT', score: '6.2 AI' },
                            ].map((audit, i) => (
                                <div key={i} className="flex justify-between items-center group/item cursor-pointer hover:bg-black/5 p-4 rounded-2xl border border-transparent hover:border-[#F4D03F]/10 transition-all">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase opacity-30">{audit.date}</p>
                                        <p className="text-md font-black italic text-foreground tracking-tight">{audit.orchard}</p>
                                    </div>
                                    <div className="text-right space-y-2">
                                        <div className={cn(
                                            "inline-block px-4 py-1 rounded-full text-[10px] font-black italic shadow-sm",
                                            audit.status === 'PASS' ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                                        )}>
                                            {audit.status}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-8 h-12 bg-white text-[#F4D03F] rounded-xl font-black uppercase text-xs tracking-widest shadow-sm hover:scale-105 transition-all flex items-center justify-center gap-4 group/all">
                            View All
                            <ArrowRight className="w-4 h-4 group-hover/all:translate-x-2 transition-transform" />
                        </button>
                    </motion.div>

                    <div className={cn(glass.card, "p-8 shadow-sm bg-white/50 border-[#F4D03F]/20 rounded-3xl group transition-all relative overflow-hidden")}>
                        <div className="flex items-center gap-4 mb-4 relative z-10">
                            <div className="w-10 h-10 bg-white/60 rounded-xl flex items-center justify-center border border-[#F4D03F] shadow-sm">
                                <Info className="w-5 h-5 text-[#F4D03F]" />
                            </div>
                            <h4 className="text-xl font-black uppercase tracking-tight leading-none">Standards</h4>
                        </div>
                        <p className="text-xs font-bold opacity-60 leading-normal uppercase tracking-tight relative z-10 border-l-4 border-[#F4D03F]/40 pl-4">
                            Health checks follow official bee standards. Certificates are valid for 30 days.
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default DigitalHealthAudit;
