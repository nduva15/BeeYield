import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Apiary, Hive } from '@/services/beeyieldService';
import { useLanguage } from '@/contexts/LanguageContext';
import { Label } from "@/components/ui/label";
import { Cpu, Database, Network, ShieldCheck, RefreshCw, X, Info, Zap, Binary, Activity, Command, Shield } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';
import { motion, AnimatePresence } from 'framer-motion';

interface AddDeviceModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (device: any) => void;
    apiaries: Apiary[];
    hives: Hive[];
}

const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ open, onOpenChange, onAdd, apiaries, hives }) => {
    const { t } = useLanguage();
    const [selectedApiaryId, setSelectedApiaryId] = React.useState<string>("");
    const [selectedHiveId, setSelectedHiveId] = React.useState<string>("");
    const [deviceCode, setDeviceCode] = React.useState("");
    const [deviceName, setDeviceName] = React.useState("");
    const [deviceType, setDeviceType] = React.useState<'infield' | 'inland' | 'disease'>('inland');
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const filteredHives = hives?.filter(h => h.apiary_id === selectedApiaryId) || [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!deviceCode) {
            toast.error("Please enter the BeeHUB ID");
            return;
        }

        const toastId = toast.loading("Executing hardware integration protocol...");
        setIsSubmitting(true);
        try {
            const newDevice = {
                id: Math.random().toString(36).substr(2, 9),
                device_code: deviceCode,
                device_name: deviceName || `Device ${deviceCode}`,
                device_type: deviceType,
                status: 'active',
                battery_level: 100,
                firmware_version: '1.0.0',
                last_ping: new Date().toISOString(),
                location_name: apiaries.find(a => a.id === selectedApiaryId)?.name || '',
                apiary_id: selectedApiaryId,
                linked_apiary_id: selectedApiaryId,
                hive_id: selectedHiveId
            };

            await onAdd(newDevice);

            // Reset form
            setDeviceCode("");
            setDeviceName("");
            setSelectedApiaryId("");
            setSelectedHiveId("");
            onOpenChange(false);
            toast.success("Node successfully synchronized with registry", { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error("Hardware handshake failed", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl bg-white/80 backdrop-blur-3xl border-white/5 rounded-[4rem] shadow-[0_100px_200px_-50px_rgba(0,0,0,0.5)] p-0 overflow-hidden antialiased outline-none thin-scrollbar">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.02, y: -30 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="bg-gradient-to-br from-[#121212] to-black px-14 py-16 text-gray-900 relative overflow-hidden border-b border-gray-200">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-honey/10 rounded-full -mr-40 -mt-20 blur-[120px] animate-pulse pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-500/5 rounded-full -ml-30 -mb-20 blur-[80px] pointer-events-none" />

                        <div className="relative z-10 flex justify-between items-start">
                            <div className="space-y-8">
                                <div className="flex items-center gap-6">
                                    <div className="inline-flex items-center gap-4 px-6 py-2 bg-honey/10 rounded-full border border-honey/20 shadow-2xl skew-x-[-12deg]">
                                        <Cpu className="w-5 h-5 text-honey" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] skew-x-[12deg] italic">Hardware Protocol v4.4_X</span>
                                    </div>
                                    <div className="flex items-center gap-3 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20 shadow-inner">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic font-mono">LINK: STANDBY</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-7xl font-black text-foreground tracking-tighter uppercase italic leading-[0.85]">
                                        Initialize <span className="text-honey">Node</span>
                                    </h2>
                                    <p className="text-gray-500 font-black text-[11px] uppercase tracking-[0.4em] mt-3 italic border-l-2 border-honey/20 pl-8 max-w-sm">
                                        Pairing industrial IOT hardware with strategic sector registry hub_v4
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => onOpenChange(false)}
                                className="w-16 h-16 rounded-[2rem] bg-white/5 border border-gray-200 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-500 transition-all duration-700 shadow-2xl group"
                            >
                                <X className="w-8 h-8 group-hover:rotate-90 transition-transform" />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-14 space-y-12 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6 group">
                                <Label className={cn(glass.microLabel, 'ml-8 border-l-2 border-honey/40 pl-6 opacity-40 font-black tracking-widest uppercase text-[10px]')}>Hardware Signature ID</Label>
                                <div className="relative">
                                    <Network className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-honey transition-colors group-focus-within:text-foreground" />
                                    <Input
                                        placeholder="E.G. HUB_KIB_PRIME_001"
                                        value={deviceCode}
                                        onChange={(e) => setDeviceCode(e.target.value)}
                                        className={cn(glass.input, "h-20 pl-20 px-10 rounded-[2.5rem] italic font-black text-2xl bg-gray-50 border-none shadow-inner normal-case placeholder:opacity-10")}
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <Label className={cn(glass.microLabel, 'ml-8 border-l-2 border-blue-500/40 pl-6 opacity-40 font-black tracking-widest uppercase text-[10px]')}>Node Classification</Label>
                                <Select value={deviceType} onValueChange={(v: any) => setDeviceType(v)}>
                                    <SelectTrigger className={cn(glass.select, 'h-20 px-10 rounded-[2.5rem] italic font-black text-xl bg-gray-50 border-none shadow-inner')}>
                                        <div className="flex items-center gap-6">
                                            <Zap className="w-6 h-6 text-blue-400" />
                                            <SelectValue />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className={glass.selectContent}>
                                        <SelectItem value="inland" className="p-5 font-black uppercase text-[11px] tracking-widest italic">Industrial_Master_Hub</SelectItem>
                                        <SelectItem value="infield" className="p-5 font-black uppercase text-[11px] tracking-widest italic">Regional_Tactical_Station</SelectItem>
                                        <SelectItem value="disease" className="p-5 font-black uppercase text-[11px] tracking-widest italic">Bio_Spectral_Monitor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <Label className={cn(glass.microLabel, 'ml-8 border-l-2 border-honey/40 pl-6 opacity-40 font-black tracking-widest uppercase text-[10px]')}>Strategic Sector</Label>
                                <Select value={selectedApiaryId} onValueChange={setSelectedApiaryId}>
                                    <SelectTrigger className={cn(glass.select, 'h-20 px-10 rounded-[2.5rem] italic font-black text-xl bg-gray-50 border-none shadow-inner')}>
                                        <div className="flex items-center gap-6">
                                            <Database className="w-6 h-6 text-honey" />
                                            <SelectValue placeholder="LOCATE_SECTOR..." />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className={glass.selectContent}>
                                        {apiaries.map(apiary => (
                                            <SelectItem key={apiary.id} value={apiary.id} className="p-5 font-black uppercase text-[11px] tracking-widest italic">
                                                {apiary.name.toUpperCase()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-6">
                                <Label className={cn(glass.microLabel, 'ml-8 border-l-2 border-emerald-500/40 pl-6 opacity-40 font-black tracking-widest uppercase text-[10px]')}>Target Registry ID</Label>
                                <Select
                                    value={selectedHiveId}
                                    onValueChange={setSelectedHiveId}
                                    disabled={!selectedApiaryId}
                                >
                                    <SelectTrigger className={cn(glass.select, 'h-20 px-10 rounded-[2.5rem] italic font-black text-xl bg-gray-50 border-none shadow-inner disabled:opacity-20')}>
                                        <div className="flex items-center gap-6">
                                            <ShieldCheck className="w-6 h-6 text-emerald-500" />
                                            <SelectValue placeholder="SELECT_UNIT_ID..." />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className={glass.selectContent}>
                                        {filteredHives.map(hive => (
                                            <SelectItem key={hive.id} value={hive.id} className="p-5 font-black uppercase text-[11px] tracking-widest italic">
                                                {hive.hive_code.toUpperCase()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-6 group">
                            <Label className={cn(glass.microLabel, 'ml-8 border-l-2 border-honey/40 pl-6 opacity-40 font-black tracking-widest uppercase text-[10px]')}>Human-Readable Neural Alias</Label>
                            <div className="relative">
                                <Binary className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-honey opacity-20 group-hover:opacity-100 transition-opacity" />
                                <Input
                                    id="device-name"
                                    name="device_name"
                                    value={deviceName}
                                    onChange={(e) => setDeviceName(e.target.value)}
                                    placeholder="E.G. ALPHA_GATEWAY_PRIME"
                                    className={cn(glass.input, "h-20 pl-20 px-10 rounded-[2.5rem] italic font-black text-xl bg-gray-50 border-none shadow-inner normal-case placeholder:opacity-10")}
                                />
                            </div>
                        </div>

                        <div className="p-14 bg-white/40 border-t border-white/5 flex gap-10 rounded-[3rem] shadow-inner mt-10">
                            <button
                                type="button"
                                onClick={() => onOpenChange(false)}
                                className={cn(glass.btnSecondary, "flex-1 h-22 rounded-[2.5rem] font-black italic uppercase text-lg tracking-widest transition-all bg-white/40")}
                            >
                                Abort Protocol
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !deviceCode}
                                className={cn(glass.btnPrimary, "flex-[2] h-22 bg-[#FBBE24] text-black shadow-[0_45px_100px_-20px_rgba(251,191,36,0.6)] rounded-[2.5rem] px-14 font-black italic text-2xl transition-all uppercase flex items-center justify-center gap-6 group/commit pl-20")}
                            >
                                {isSubmitting ? (
                                    <RefreshCw className="w-10 h-10 animate-spin" />
                                ) : (
                                    <ShieldCheck className="w-10 h-10 group-hover/commit:scale-125 transition-all duration-1000 text-black fill-current" />
                                )}
                                Commit Registry
                            </button>
                        </div>
                    </form>

                    {/* Industrial Logic Banner */}
                    <div className="px-14 pb-14">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={cn(glass.card, "p-10 bg-honey/[0.03] border-honey/20 flex items-center gap-10 relative overflow-hidden group rounded-[3rem]")}
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-honey/10 blur-3xl pointer-events-none" />
                            <div className="w-16 h-16 rounded-2xl bg-white/40 flex items-center justify-center shrink-0 border border-honey/20 shadow-4xl group-hover:rotate-[360deg] transition-transform duration-1000 relative z-10">
                                <Info className="w-8 h-8 text-honey" />
                            </div>
                            <div className="relative z-10 space-y-2">
                                <p className="text-xl italic font-black text-foreground tracking-tighter uppercase">Deployment Logic</p>
                                <p className="text-[13px] italic font-medium opacity-40 leading-relaxed text-foreground max-w-xl">
                                    Initializing a node links hardware telemetry to specific hive assets. Ensure the HUB_ID matches the cryptographic sticker on the device for recursive data integrity.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
};

export default AddDeviceModal;
