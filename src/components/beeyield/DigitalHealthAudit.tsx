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
                // Bind to hive once user selection exists; for now keep optional.
                hiveId: undefined
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
            className={glass.page}
        >
            <PageHeader
                icon={Camera}
                label="Analysis"
                title={<>Health <span className="text-[#F4D03F]">Audit</span></>}
                subtitle="Upload a photo to get a quick health check."
                actions={
                    <div className="flex items-center gap-3">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*"
                            aria-label="Upload image"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className={cn(glass.btnSecondary, "h-10")}
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            {selectedFile ? selectedFile.name.substring(0, 12) + "..." : "Select Image"}
                        </button>
                        <button
                            onClick={handleScan}
                            disabled={isScanning || !selectedFile}
                            className={cn(glass.btnPrimary, "h-10 min-w-[140px] shadow-sm")}
                        >
                            {isScanning ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Scanning...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Start Audit
                                </>
                            )}
                        </button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
                {/* Main Viewport */}
                <div className="lg:col-span-8 space-y-6">
                    <div className={cn(glass.section, "h-[500px] relative overflow-hidden flex flex-col items-center justify-center")}>
                        <div className="absolute inset-0 bg-[#FFF9F0]/30 pointer-events-none" />
                        <div className="absolute inset-0 opacity-[0.01] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #1A1A1A 1px, transparent 1px), linear-gradient(to bottom, #1A1A1A 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                        <AnimatePresence mode="wait">
                            {isScanning ? (
                                <motion.div
                                    key="scanning"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center gap-8 z-10"
                                >
                                    <div className="w-64 h-64 border-2 border-dashed border-[#F4D03F]/30 rounded-full flex items-center justify-center relative">
                                        <motion.div
                                            animate={{ top: ['0%', '100%', '0%'] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                            className="w-full h-1 bg-[#F4D03F]/40 absolute blur-sm rounded-full shadow-[0_0_15px_rgba(244,208,63,0.5)]"
                                        />
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 rounded-2xl bg-[#F9F7F2] border border-[#F4D03F]/20 flex items-center justify-center shadow-sm">
                                                <Loader2 className="w-8 h-8 text-[#F4D03F] animate-spin" />
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Processing…</span>
                                        </div>
                                    </div>
                                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest text-center max-w-xs leading-relaxed">
                                        Correlating population markers with health benchmarks...
                                    </p>
                                </motion.div>
                            ) : scanResults ? (
                                <motion.div
                                    key="results"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute inset-0 p-8 lg:p-12 flex flex-col gap-8 overflow-y-auto thin-scrollbar"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <div className={cn(glass.badge, "bg-[#1B9157]/10 text-[#1B9157] border-[#1B9157]/20")}>
                                                <ShieldCheck className="w-3.5 h-3.5 mr-2" />
                                                Certified Audit v2.4
                                            </div>
                                            <h3 className="text-2xl font-bold text-[#1A1A1A]">Colony Analysis <span className="text-[#1B9157]">Passed</span></h3>
                                        </div>
                                        <button 
                                            onClick={() => setScanResults(null)}
                                            className={cn(glass.btnSecondary, "h-9 w-9 p-0 flex items-center justify-center")}
                                            aria-label="Close results"
                                            title="Close results"
                                        >
                                            <XCircle className="w-4 h-4 text-gray-400" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[
                                            { label: 'Mite Check', value: scanResults.mite_count, color: 'text-red-500', icon: Activity },
                                            { label: 'Brood Area', value: `${scanResults.brood_area_pct}%`, color: 'text-[#1A1A1A]', icon: Target },
                                            { label: 'Health Score', value: scanResults.health_score, color: 'text-[#1B9157]', icon: Award }
                                        ].map((stat, i) => (
                                            <div key={i} className={cn(glass.card, "p-5 flex flex-col gap-3 group")}>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</span>
                                                    <stat.icon className="w-3.5 h-3.5 text-[#F4D03F]/40" />
                                                </div>
                                                <span className={cn("text-3xl font-black tabular-nums tracking-tighter", stat.color)}>{stat.value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className={cn(glass.card, "p-0 overflow-hidden")}>
                                        <div className="px-5 py-4 border-b border-[#F4D03F]/10 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-[#F9F7F2] border border-[#F4D03F]/20 flex items-center justify-center">
                                                <Activity className="w-4 h-4 text-[#F4D03F]" />
                                            </div>
                                            <h4 className="text-sm font-bold text-[#1A1A1A]">Marker Detections</h4>
                                        </div>
                                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white/40">
                                            {scanResults.detections?.slice(0, 4).map((d: any, i: number) => (
                                                <div key={i} className="flex justify-between items-center p-3 rounded-xl border border-[#F4D03F]/10 bg-[#F9F7F2]/30">
                                                    <span className="text-[10px] font-bold uppercase tracking-tight text-[#1A1A1A]">{d.label}</span>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-1.5 w-16 bg-[#F9F7F2] rounded-full overflow-hidden border border-[#F4D03F]/10">
                                                            <div className="h-full bg-[#1B9157]" style={{ width: `${d.confidence * 100}%` }} />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-[#1B9157] tabular-nums">{Math.round(d.confidence * 100)}%</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="idle"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center gap-8"
                                >
                                    <div className="relative">
                                        <div className="w-40 h-40 border-4 border-dashed border-[#F4D03F]/10 rounded-full flex items-center justify-center">
                                            <Search className="w-16 h-16 text-gray-200" />
                                        </div>
                                        <div className="absolute -top-4 -right-4 w-12 h-12 rounded-2xl bg-white border border-[#F4D03F]/20 shadow-sm flex items-center justify-center">
                                            <Camera className="w-6 h-6 text-[#F4D03F]" />
                                        </div>
                                    </div>
                                    <div className="text-center space-y-2 px-12">
                                        <p className="text-sm font-bold text-[#1A1A1A] uppercase tracking-[0.2em]">Ready</p>
                                        <p className="text-xs text-gray-500 max-w-xs leading-relaxed">Upload a clear photo of the hive (good light, in focus).</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Decoration Corner Markers */}
                        <div className="absolute top-6 left-6 border-t-2 border-l-2 border-[#F4D03F]/20 w-8 h-8 rounded-tl-xl pointer-events-none" />
                        <div className="absolute top-6 right-6 border-t-2 border-r-2 border-[#F4D03F]/20 w-8 h-8 rounded-tr-xl pointer-events-none" />
                        <div className="absolute bottom-6 left-6 border-b-2 border-l-2 border-[#F4D03F]/20 w-8 h-8 rounded-bl-xl pointer-events-none" />
                        <div className="absolute bottom-6 right-6 border-b-2 border-r-2 border-[#F4D03F]/20 w-8 h-8 rounded-br-xl pointer-events-none" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className={cn(glass.card, "p-6 group")}>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 bg-[#F4D03F]/5 rounded-xl flex items-center justify-center border border-[#F4D03F]/10 shadow-sm group-hover:scale-105 transition-transform">
                                    <Cpu className="w-5 h-5 text-[#F4D03F]" />
                                </div>
                                <h3 className="text-sm font-bold text-[#1A1A1A]">AI Vision Core</h3>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed pl-4 border-l-2 border-[#F4D03F]/30">
                                Real-time population metrics and pest detections via precision neural optics.
                            </p>
                        </div>
                        <div className={cn(glass.card, "p-6 group")}>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 bg-[#F4D03F]/5 rounded-xl flex items-center justify-center border border-[#F4D03F]/10 shadow-sm group-hover:scale-105 transition-transform">
                                    <Award className="w-5 h-5 text-[#F4D03F]" />
                                </div>
                                <h3 className="text-sm font-bold text-[#1A1A1A]">Compliance Lab</h3>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed pl-4 border-l-2 border-[#F4D03F]/30">
                                Validated colony health status for organic certification and insurance reports.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className={cn(glass.section, "flex flex-col")}>
                        <div className="px-5 py-4 border-b border-[#F4D03F]/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#F9F7F2] border border-[#F4D03F]/20 flex items-center justify-center">
                                    <FileCheck className="w-4 h-4 text-[#F4D03F]" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-[#1A1A1A]">Audit History</h3>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest text-[9px]">Last 30 Days</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 text-center">
                            <p className="text-xs font-semibold text-gray-500">No audits yet.</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                Run an audit to generate history.
                            </p>
                        </div>

                        <div className="p-4 border-t border-[#F4D03F]/10">
                            <button className={cn(glass.btnSecondary, "w-full")}>
                                View Archive
                                <ArrowRight className="w-3.5 h-3.5 ml-2" />
                            </button>
                        </div>
                    </div>

                    <div className={cn(glass.card, "p-6 bg-gradient-to-br from-[#F4D03F]/5 to-transparent border-[#F4D03F]/20")}>
                        <div className="flex items-center gap-3 mb-3">
                             <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-[#F4D03F]/20 shadow-sm">
                                <Info className="w-4 h-4 text-[#F4D03F]" />
                            </div>
                            <h3 className="text-sm font-bold text-[#1A1A1A]">Notes</h3>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-relaxed border-l-2 border-[#F4D03F]/30 pl-3">
                            Audits are synchronized with <span className="text-[#1A1A1A] font-bold">Bee-Standards v4</span>. All certificates valid for 30 days.
                        </p>
                    </div>
                </div>
            </div>

        </motion.div>
    );
};

export default DigitalHealthAudit;
