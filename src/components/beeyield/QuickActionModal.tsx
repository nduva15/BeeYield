import React from 'react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Plus, MapPin, Wind, Sun, Info, Database, Calendar, Hexagon, Layers, ShieldCheck, RefreshCw, Activity, Shield, Binary, Search, ChevronRight } from 'lucide-react';
import { beeyieldService, Apiary } from '@/services/beeyieldService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { glass } from './GlassTheme';

interface QuickActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const QuickActionModal: React.FC<QuickActionModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [activeTab, setActiveTab] = React.useState('apiary');
    const [apiaries, setApiaries] = React.useState<Apiary[]>([]);
    const [loading, setLoading] = React.useState(false);

    // Apiary Form State
    const [apiaryData, setApiaryData] = React.useState({
        name: '',
        location_name: '',
        forage_type: 'Forest',
        sun_exposure: 'Semi-Shade'
    });

    // Hive Form State
    const [hiveData, setHiveData] = React.useState({
        apiary_id: '',
        hive_code: '',
        type: 'Langstroth',
        queen_hatched: new Date().toISOString().split('T')[0],
        strength: 3
    });

    React.useEffect(() => {
        if (isOpen) {
            fetchApiaries();
        }
    }, [isOpen]);

    const fetchApiaries = async () => {
        const data = await beeyieldService.getApiaries();
        setApiaries(data);
        if (data.length > 0 && !hiveData.apiary_id) {
            setHiveData(prev => ({ ...prev, apiary_id: data[0].id }));
        }
    };

    const handleAddApiary = async () => {
        if (!apiaryData.name || !apiaryData.location_name) {
            toast.error("Please fill in all required fields");
            return;
        }

        const toastId = toast.loading("Initializing global sector registry...");
        setLoading(true);
        const { data, error } = await beeyieldService.createApiary(apiaryData);
        setLoading(false);

        if (!error) {
            toast.success(`Sector "${apiaryData.name}" Archived successfully`, { id: toastId });
            onSuccess?.();
            onClose();
            // Reset form
            setApiaryData({
                name: '',
                location_name: '',
                forage_type: 'Forest',
                sun_exposure: 'Semi-Shade'
            });
        } else {
            toast.error("Sector initialization failed", { id: toastId });
        }
    };

    const handleAddHive = async () => {
        if (!hiveData.apiary_id || !hiveData.hive_code) {
            toast.error("Please fill in all required fields");
            return;
        }

        const toastId = toast.loading("Committing unit to industrial cluster...");
        setLoading(true);
        const { data, error } = await beeyieldService.createHive({
            ...hiveData,
            hive_type: hiveData.type,
            installation_date: hiveData.queen_hatched,
        } as any);
        setLoading(false);

        if (!error) {
            toast.success(`Unit "${hiveData.hive_code}" Registered successfully`, { id: toastId });
            onSuccess?.();
            onClose();
            // Reset form
            setHiveData({
                apiary_id: apiaries[0]?.id || '',
                hive_code: '',
                type: 'Langstroth',
                queen_hatched: new Date().toISOString().split('T')[0],
                strength: 3
            });
        } else {
            toast.error("Unit registry failed", { id: toastId });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-white/80 dark:bg-[#0D0D0D]/80 backdrop-blur-3xl border-white/5 rounded-[4rem] shadow-[0_100px_200px_-50px_rgba(0,0,0,0.5)] p-0 overflow-hidden antialiased outline-none thin-scrollbar">
                <div className="bg-gradient-to-br from-[#121212] to-black px-14 py-16 text-white relative overflow-hidden border-b border-white/10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-honey/10 rounded-full -mr-40 -mt-20 blur-[120px] animate-pulse pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-500/5 rounded-full -ml-30 -mb-20 blur-[80px] pointer-events-none" />

                    <DialogHeader className="relative z-10 space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="inline-flex items-center gap-4 px-6 py-2 bg-honey/10 rounded-full border border-honey/20 shadow-2xl skew-x-[-12deg]">
                                <Plus className="w-5 h-5 text-honey" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] skew-x-[12deg] italic">Master Registry Update</span>
                            </div>
                            <div className="flex items-center gap-4 opacity-30">
                                <Activity className="w-5 h-5 animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-widest italic font-mono">ENCRYPTION: AES_256</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <DialogTitle className="text-7xl font-black flex items-center gap-6 tracking-tighter leading-none italic uppercase">
                                Provision <span className="text-honey">Asset</span>
                            </DialogTitle>
                            <DialogDescription className="text-white/30 font-black text-[11px] uppercase tracking-[0.4em] mt-3 italic border-l-2 border-honey/20 pl-8 max-w-sm">
                                Initializing autonomous industrial cluster synchronization protocol_v4.4_X
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                </div>

                <div className="p-14 space-y-12">
                    <Tabs defaultValue="apiary" onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-white/40 dark:bg-black/40 p-2 h-20 rounded-[30px] mb-14 border border-white/10 shadow-2xl backdrop-blur-3xl">
                            <TabsTrigger value="apiary" className="rounded-[22px] font-black text-[11px] uppercase tracking-[0.2em] italic data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-foreground data-[state=active]:shadow-2xl transition-all duration-700 h-full">
                                Strategic Sector
                            </TabsTrigger>
                            <TabsTrigger value="hive" className="rounded-[22px] font-black text-[11px] uppercase tracking-[0.2em] italic data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-foreground data-[state=active]:shadow-2xl transition-all duration-700 h-full">
                                Industrial Unit
                            </TabsTrigger>
                        </TabsList>

                        <div className="min-h-[400px]">
                            <AnimatePresence mode="wait">
                                <TabsContent value="apiary" className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                                    <div className="space-y-6 group">
                                        <Label htmlFor="apiary-name" className={cn(glass.microLabel, 'ml-8 border-l-2 border-honey/40 pl-6 opacity-40 font-black tracking-widest uppercase text-[10px]')}>Sector Designation</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-honey transition-colors group-focus-within:text-foreground" />
                                            <Input
                                                id="apiary-name"
                                                name="name"
                                                placeholder="e.g. KIB_SECTOR_PRIME_01"
                                                className={cn(glass.input, "h-20 pl-20 px-10 rounded-[2.5rem] italic font-black text-2xl bg-black/5 dark:bg-black/30 border-none shadow-inner normal-case placeholder:opacity-10")}
                                                value={apiaryData.name}
                                                onChange={e => setApiaryData({ ...apiaryData, name: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6 group">
                                        <Label htmlFor="apiary-location" className={cn(glass.microLabel, 'ml-8 border-l-2 border-emerald-500/40 pl-6 opacity-40 font-black tracking-widest uppercase text-[10px]')}>Geospatial Metadata</Label>
                                        <div className="relative">
                                            <Binary className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-emerald-500 transition-colors group-focus-within:text-foreground" />
                                            <Input
                                                id="apiary-location"
                                                name="location_name"
                                                placeholder="LAT_LONG_COORDINATES_OR_DESIGNATION"
                                                className={cn(glass.input, "h-20 pl-20 px-10 rounded-[2.5rem] italic font-black text-xl bg-black/5 dark:bg-black/30 border-none shadow-inner normal-case placeholder:opacity-10")}
                                                value={apiaryData.location_name}
                                                onChange={e => setApiaryData({ ...apiaryData, location_name: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <Label className={cn(glass.microLabel, 'ml-8 border-l-2 border-honey/40 pl-6 opacity-40 font-black tracking-widest uppercase text-[10px]')}>Flora Feedstock</Label>
                                            <Select
                                                name="forage_type"
                                                value={apiaryData.forage_type}
                                                onValueChange={v => setApiaryData({ ...apiaryData, forage_type: v })}
                                            >
                                                <SelectTrigger id="apiary-forage" className={cn(glass.select, 'h-20 px-10 rounded-[2.5rem] italic font-black text-xl bg-black/5 dark:bg-black/30 border-none shadow-inner')}>
                                                    <div className="flex items-center gap-6">
                                                        <Layers className="w-6 h-6 text-honey" />
                                                        <SelectValue />
                                                    </div>
                                                </SelectTrigger>
                                                <SelectContent className={glass.selectContent}>
                                                    <SelectItem value="Forest" className="p-5 font-black uppercase text-[11px] tracking-widest italic">Wild_Matrix_Forest</SelectItem>
                                                    <SelectItem value="Canola" className="p-5 font-black uppercase text-[11px] tracking-widest italic">Canola_Industrial</SelectItem>
                                                    <SelectItem value="Acacia" className="p-5 font-black uppercase text-[11px] tracking-widest italic">Acacia_Prime_Cut</SelectItem>
                                                    <SelectItem value="Lavender" className="p-5 font-black uppercase text-[11px] tracking-widest italic">Lavender_Extract</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-6">
                                            <Label className={cn(glass.microLabel, 'ml-8 border-l-2 border-blue-500/40 pl-6 opacity-40 font-black tracking-widest uppercase text-[10px]')}>Luminity Protocol</Label>
                                            <Select
                                                name="sun_exposure"
                                                value={apiaryData.sun_exposure}
                                                onValueChange={v => setApiaryData({ ...apiaryData, sun_exposure: v })}
                                            >
                                                <SelectTrigger id="apiary-sun" className={cn(glass.select, 'h-20 px-10 rounded-[2.5rem] italic font-black text-xl bg-black/5 dark:bg-black/30 border-none shadow-inner')}>
                                                    <div className="flex items-center gap-6">
                                                        <Sun className="w-6 h-6 text-blue-400" />
                                                        <SelectValue />
                                                    </div>
                                                </SelectTrigger>
                                                <SelectContent className={glass.selectContent}>
                                                    <SelectItem value="Full Sun" className="p-5 font-black uppercase text-[11px] tracking-widest italic">Zenith_Exposure</SelectItem>
                                                    <SelectItem value="Shade" className="p-5 font-black uppercase text-[11px] tracking-widest italic">Deep_Mask_Shade</SelectItem>
                                                    <SelectItem value="Semi-Shade" className="p-5 font-black uppercase text-[11px] tracking-widest italic">Balanced_Contrast</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="hive" className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                                    <div className="space-y-6">
                                        <Label className={cn(glass.microLabel, 'ml-8 border-l-2 border-honey/40 pl-6 opacity-40 font-black tracking-widest uppercase text-[10px]')}>Sector Assignment</Label>
                                        <Select
                                            name="apiary_id"
                                            value={hiveData.apiary_id}
                                            onValueChange={v => setHiveData({ ...hiveData, apiary_id: v })}
                                        >
                                            <SelectTrigger id="hive-apiary" className={cn(glass.select, 'h-20 px-10 rounded-[2.5rem] italic font-black text-xl bg-black/5 dark:bg-black/30 border-none shadow-inner')}>
                                                <div className="flex items-center gap-6">
                                                    <MapPin className="w-6 h-6 text-honey" />
                                                    <SelectValue placeholder="DEPLOY_TO_SECTOR..." />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className={glass.selectContent}>
                                                {apiaries.map(apiary => (
                                                    <SelectItem key={apiary.id} value={apiary.id} className="p-5 font-black uppercase text-[11px] tracking-widest italic">{apiary.name.toUpperCase()}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-6 group">
                                        <Label className={cn(glass.microLabel, 'ml-8 border-l-2 border-emerald-500/40 pl-6 opacity-40 font-black tracking-widest uppercase text-[10px]')}>Registry Alpha Code</Label>
                                        <div className="relative">
                                            <Hexagon className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-emerald-500 transition-colors group-focus-within:text-foreground" />
                                            <Input
                                                id="hive-code"
                                                name="hive_code"
                                                placeholder="e.g. BY_HIVE_REG_01"
                                                className={cn(glass.input, "h-20 pl-20 px-10 rounded-[2.5rem] italic font-black text-2xl bg-black/5 dark:bg-black/30 border-none shadow-inner normal-case placeholder:opacity-10")}
                                                value={hiveData.hive_code}
                                                onChange={e => setHiveData({ ...hiveData, hive_code: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <Label className={cn(glass.microLabel, 'ml-8 border-l-2 border-honey/40 pl-6 opacity-40 font-black tracking-widest uppercase text-[10px]')}>Architecture</Label>
                                            <Select
                                                name="type"
                                                value={hiveData.type}
                                                onValueChange={v => setHiveData({ ...hiveData, type: v })}
                                            >
                                                <SelectTrigger id="hive-type" className={cn(glass.select, 'h-20 px-10 rounded-[2.5rem] italic font-black text-xl bg-black/5 dark:bg-black/30 border-none shadow-inner')}>
                                                    <div className="flex items-center gap-6">
                                                        <Layers className="w-6 h-6 text-honey" />
                                                        <SelectValue />
                                                    </div>
                                                </SelectTrigger>
                                                <SelectContent className={glass.selectContent}>
                                                    <SelectItem value="Langstroth" className="p-5 font-black uppercase text-[11px] tracking-widest italic">Langstroth_Industrial</SelectItem>
                                                    <SelectItem value="Top Bar" className="p-5 font-black uppercase text-[11px] tracking-widest italic">V_Horizontal_TopBar</SelectItem>
                                                    <SelectItem value="Warre" className="p-5 font-black uppercase text-[11px] tracking-widest italic">Warre_Bio_Module</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-6 group">
                                            <Label className={cn(glass.microLabel, 'ml-8 border-l-2 border-blue-500/40 pl-6 opacity-40 font-black tracking-widest uppercase text-[10px]')}>Registry Date</Label>
                                            <div className="relative">
                                                <Calendar className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-blue-400 opacity-40 group-focus-within:opacity-100 transition-opacity" />
                                                <Input
                                                    id="queen-hatched"
                                                    name="queen_hatched"
                                                    type="date"
                                                    className={cn(glass.input, "h-20 pl-20 px-10 rounded-[2.5rem] italic font-black text-xl bg-black/5 dark:bg-black/30 border-none shadow-inner")}
                                                    value={hiveData.queen_hatched}
                                                    onChange={e => setHiveData({ ...hiveData, queen_hatched: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-10 pt-4 px-4 bg-honey/[0.03] border border-honey/20 p-10 rounded-[3rem] shadow-inner relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-honey/5 blur-3xl pointer-events-none" />
                                        <div className="flex justify-between items-center relative z-10">
                                            <div className="space-y-1">
                                                <Label className={cn(glass.microLabel, 'opacity-40 italic tracking-widest uppercase font-black text-[10px]')}>Biomass Density Coefficient</Label>
                                                <p className="text-2xl font-black italic text-foreground tracking-tighter">Unit_Strength_Pulse</p>
                                            </div>
                                            <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-6 py-2 rounded-full font-black text-[12px] italic tracking-widest shadow-2xl skew-x-[-12deg]">
                                                <span className="skew-x-[12deg]">{Math.round(hiveData.strength * 20)}%_POTENCY</span>
                                            </Badge>
                                        </div>
                                        <Slider
                                            defaultValue={[3]}
                                            max={5}
                                            min={1}
                                            step={1}
                                            className="py-10"
                                            onValueChange={v => setHiveData({ ...hiveData, strength: v[0] })}
                                        />
                                        <div className="flex justify-between text-[10px] font-black text-muted-foreground/20 uppercase tracking-[0.4em] px-2 italic">
                                            <span>MIN_DEN</span>
                                            <span>NOMINAL_VECTOR</span>
                                            <span>SATURATION_LIMIT</span>
                                        </div>
                                    </div>
                                </TabsContent>
                            </AnimatePresence>
                        </div>
                    </Tabs>
                </div>

                <div className="p-14 bg-white/40 dark:bg-black/60 border-t border-white/5 flex gap-10 rounded-b-[4rem]">
                    <button
                        onClick={onClose}
                        className={cn(glass.btnSecondary, "flex-1 h-22 rounded-[2.5rem] font-black italic uppercase text-lg tracking-widest transition-all shadow-xl bg-white/40 dark:bg-black/20")}
                    >
                        Abort Protocol
                    </button>
                    <button
                        onClick={activeTab === 'apiary' ? handleAddApiary : handleAddHive}
                        className={cn(glass.btnPrimary, "flex-[2] h-22 bg-[#FBBE24] text-black shadow-[0_45px_100px_-20px_rgba(251,191,36,0.6)] rounded-[2.5rem] px-14 font-black italic text-2xl transition-all uppercase flex items-center justify-center gap-6 group/commit pl-20")}
                        disabled={loading}
                    >
                        {loading ? (
                            <RefreshCw className="w-10 h-10 animate-spin" />
                        ) : (
                            <ShieldCheck className="w-10 h-10 group-hover/commit:scale-125 transition-all duration-1000 text-black fill-current" />
                        )}
                        Commit Registry
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default QuickActionModal;
