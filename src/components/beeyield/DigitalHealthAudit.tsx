import React, { useState, useRef } from 'react';
import { ShieldCheck, Camera, Activity, FileCheck, Info, Award, CheckCircle2, XCircle, Search, Cpu, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import beeyieldService from '@/services/beeyieldService';
import { toast } from 'sonner';

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
        <div className="p-4 md:p-8 space-y-8 md:space-y-12 bg-white min-h-screen text-[#064e3b] antialiased border-x-4 border-[#064e3b]">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-[#064e3b] pb-8">
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-[#064e3b] border-4 border-[#064e3b] flex items-center justify-center shadow-[4px_4px_0px_0px_#facc15]">
                            <ShieldCheck className="w-6 h-6 text-[#facc15]" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-[0.8]">
                            Health <span className="text-[#10b981]">Check</span>
                        </h1>
                    </div>
                    <p className="text-[#10b981] font-black uppercase text-[10px] tracking-[0.4em]">
                        Bee Density · Photo History · Health Badge
                    </p>
                </div>

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
                        className="flex items-center gap-4 px-6 py-4 border-4 border-[#064e3b] font-black text-xs uppercase tracking-widest bg-white text-[#064e3b] shadow-[4px_4px_0px_0px_#facc15]"
                    >
                        <Upload className="w-5 h-5" />
                        {selectedFile ? selectedFile.name.substring(0, 15) : "Select Image"}
                    </button>
                    <button
                        onClick={handleScan}
                        disabled={isScanning || !selectedFile}
                        className={cn(
                            "flex items-center gap-4 px-8 py-4 border-4 font-black text-xs uppercase tracking-widest transition-all",
                            isScanning || !selectedFile ? "bg-gray-100 text-gray-400 border-gray-200" : "bg-[#064e3b] text-white border-[#064e3b] shadow-[8px_8px_0px_0px_#10b981]"
                        )}
                    >
                        {isScanning ? <Activity className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                        {isScanning ? "Photo Scan..." : "Start Photo Scan"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* CV Validation Viewport */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="border-8 border-[#064e3b] bg-gray-900 h-[500px] relative overflow-hidden shadow-[15px_15px_0px_0px_#064e3b]">
                        {/* Simulated Camera Feed / CV UI */}
                        <div className="absolute inset-0 opacity-40 mix-blend-screen bg-gradient-to-b from-[#10b981]/20 to-transparent" />

                        {isScanning ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-64 h-64 border-4 border-dashed border-[#10b981] animate-pulse rounded-full flex items-center justify-center">
                                    <div className="w-48 h-1 bg-[#10b981] absolute animate-scan" />
                                    <span className="text-[#10b981] font-black text-[10px] uppercase tracking-[0.5em]">Scanning</span>
                                </div>
                            </div>
                        ) : scanResults ? (
                            <div className="absolute inset-0 p-12 bg-[#064e3b]/95 text-white flex flex-col justify-center items-center text-center overflow-y-auto">
                                <Award className="w-20 h-20 text-[#facc15] mb-4" />
                                <h3 className="text-4xl font-black uppercase tracking-tighter mb-4">Inspection Complete</h3>

                                <div className="grid grid-cols-3 gap-6 border-y-2 border-white/10 py-6 my-4 w-full">
                                    <div>
                                        <p className="text-[9px] font-black uppercase text-white/40">Mite Count</p>
                                        <p className="text-3xl font-black text-red-400">{scanResults.mite_count}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase text-white/40">Brood Area</p>
                                        <p className="text-3xl font-black">{scanResults.brood_area_pct}%</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase text-white/40">Health Score</p>
                                        <p className="text-3xl font-black text-[#10b981]">{scanResults.health_score}</p>
                                    </div>
                                </div>

                                <div className="text-left w-full mt-4 bg-black/20 p-4 border border-white/10">
                                    <p className="text-[10px] font-black uppercase text-white/40 mb-2">AI Insights</p>
                                    <ul className="space-y-1">
                                        {scanResults.detections?.slice(0, 3).map((d: any, i: number) => (
                                            <li key={i} className="text-[9px] font-bold uppercase flex justify-between">
                                                <span>{d.label}</span>
                                                <span className="text-[#facc15]">{Math.round(d.confidence * 100)}% Conf.</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <button
                                    onClick={() => setScanResults(null)}
                                    className="mt-8 px-8 py-3 bg-[#10b981] text-white font-black text-[10px] uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)]"
                                >
                                    New Scan
                                </button>
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20">
                                <Search className="w-20 h-20 mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest italic">Ready to scan. Please hold steady...</p>
                            </div>
                        )}

                        {/* CV Corner Overlays */}
                        <div className="absolute top-8 left-8 border-t-4 border-l-4 border-white/20 w-12 h-12" />
                        <div className="absolute top-8 right-8 border-t-4 border-r-4 border-white/20 w-12 h-12" />
                        <div className="absolute bottom-8 left-8 border-b-4 border-l-4 border-white/20 w-12 h-12" />
                        <div className="absolute bottom-8 right-8 border-b-4 border-r-4 border-white/20 w-12 h-12" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="border-4 border-[#064e3b] p-8 bg-white shadow-[10px_10px_0px_0px_#10b981]">
                            <div className="flex items-center gap-3 mb-6 font-black uppercase text-[#064e3b]">
                                <Cpu className="w-5 h-5 text-[#10b981]" />
                                Photo Check
                            </div>
                            <p className="text-[10px] font-bold text-[#064e3b]/60 leading-relaxed uppercase">
                                Our camera tool checks bee numbers and hive health automatically. No more manual counting or guessing.
                            </p>
                        </div>
                        <div className="border-4 border-[#064e3b] p-8 bg-[#064e3b] text-white shadow-[10px_10px_0px_0px_#facc15]">
                            <div className="flex items-center gap-3 mb-6 font-black uppercase">
                                <ShieldCheck className="w-5 h-5 text-[#facc15]" />
                                Health Badge
                            </div>
                            <p className="text-[10px] font-bold text-white/60 leading-relaxed uppercase">
                                Every check gives you a **Health Badge**, showing that your bees are healthy and ready for work.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Audit Ledger Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="border-4 border-[#064e3b] p-8 bg-white shadow-[10px_10px_0px_0px_#10b981]">
                        <div className="flex items-center justify-between mb-8 border-b-2 border-[#064e3b]/10 pb-4">
                            <h3 className="text-xl font-black uppercase tracking-tight text-[#064e3b]">Check History</h3>
                            <FileCheck className="w-5 h-5 text-[#10b981]" />
                        </div>
                        <div className="space-y-6">
                            {[
                                { date: '2026.02.15', orchard: 'Block A', status: 'PASS', score: '8.4 Score' },
                                { date: '2026.02.12', orchard: 'Block C', status: 'PASS', score: '8.1 Score' },
                                { date: '2026.02.08', orchard: 'North Edge', status: 'RE-CHECK', score: '6.2 Score' },
                            ].map((audit, i) => (
                                <div key={i} className="flex justify-between items-center group cursor-pointer hover:bg-[#064e3b]/5 p-2 transition-none -mx-2">
                                    <div>
                                        <p className="text-[8px] font-black uppercase text-[#064e3b]/30">{audit.date}</p>
                                        <p className="text-[11px] font-black text-[#064e3b]">{audit.orchard}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={cn("text-[9px] font-black border-2 px-2 py-0.5", audit.status === 'PASS' ? "bg-[#10b981] text-white border-[#10b981]" : "bg-red-500 text-white border-red-500")}>
                                            {audit.status}
                                        </p>
                                        <p className="text-[10px] font-black text-[#064e3b] mt-1">{audit.score}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-10 py-4 border-4 border-[#064e3b] text-[#064e3b] font-black text-[10px] uppercase tracking-widest hover:bg-[#064e3b] hover:text-white transition-all">
                            View Full History
                        </button>
                    </div>

                    <div className="p-8 border-4 border-[#facc15] bg-[#facc15]/10 shadow-[10px_10px_0px_0px_#facc15]">
                        <div className="flex items-center gap-3 mb-6">
                            <Info className="w-6 h-6 text-[#064e3b]" />
                            <h4 className="text-xl font-black uppercase tracking-tight text-[#064e3b]">Health Info</h4>
                        </div>
                        <p className="text-[10px] font-bold text-[#064e3b]/60 leading-relaxed uppercase">
                            Health checks follow official bee standards. Your certificates are valid for 30 days and can be shared with farmers easily.
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes scan {
                    0% { top: -10%; }
                    100% { top: 110%; }
                }
                .animate-scan {
                    animation: scan 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default DigitalHealthAudit;
