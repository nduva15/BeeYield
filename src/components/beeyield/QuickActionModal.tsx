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
import { Plus, MapPin, Wind, Sun, Info, Database, Calendar, Hexagon, Layers, ShieldCheck, RefreshCw } from 'lucide-react';
import { beeyieldService, Apiary } from '@/services/beeyieldService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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

        setLoading(true);
        const { data, error } = await beeyieldService.createApiary(apiaryData);
        setLoading(false);

        if (!error) {
            toast.success(`Sector "${apiaryData.name}" initialized!`);
            onSuccess?.();
            onClose();
            // Reset form
            setApiaryData({
                name: '',
                location_name: '',
                forage_type: 'Forest',
                sun_exposure: 'Semi-Shade'
            });
        }
    };

    const handleAddHive = async () => {
        if (!hiveData.apiary_id || !hiveData.hive_code) {
            toast.error("Please fill in all required fields");
            return;
        }

        setLoading(true);
        const { data, error } = await beeyieldService.createHive({
            ...hiveData,
            hive_type: hiveData.type,
            installation_date: hiveData.queen_hatched,
        } as any);
        setLoading(false);

        if (!error) {
            toast.success(`Unit "${hiveData.hive_code}" registered!`);
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
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-white dark:bg-[#0f1115] border-none rounded-[3.5rem] shadow-2xl p-0 overflow-hidden antialiased">
                <div className="bg-neutral-900 dark:bg-amber-600 px-10 py-12 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
                    <DialogHeader className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 mb-6 w-fit">
                            <Plus className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Master Registry Update</span>
                        </div>
                        <DialogTitle className="text-4xl font-black flex items-center gap-4 tracking-tighter leading-none italic uppercase">
                            New <span className="text-amber-500 dark:text-amber-200">Asset</span>
                        </DialogTitle>
                        <DialogDescription className="text-white/40 font-black text-[10px] uppercase tracking-[0.3em] mt-3 italic">
                            Provisioning new biological industrial clusters
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-10">
                    <Tabs defaultValue="apiary" onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-slate-50 dark:bg-black/20 p-1.5 rounded-2xl mb-10 border border-slate-100 dark:border-white/5 shadow-inner">
                            <TabsTrigger value="apiary" className="rounded-xl font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-lg transition-all h-12">
                                Sector
                            </TabsTrigger>
                            <TabsTrigger value="hive" className="rounded-xl font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-lg transition-all h-12">
                                Registry Unit
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="apiary" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-3">
                                <Label htmlFor="apiary-name" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Sector Designation</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                                    <Input
                                        id="apiary-name"
                                        name="name"
                                        placeholder="e.g. Kibwezi Sector Alpha"
                                        className="pl-12 h-14 rounded-2xl border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 font-black text-slate-900 dark:text-white uppercase text-xs tracking-tight focus-visible:ring-amber-500/20 shadow-sm"
                                        value={apiaryData.name}
                                        onChange={e => setApiaryData({ ...apiaryData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="apiary-location" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Geographic Coordinates</Label>
                                <Input
                                    id="apiary-location"
                                    name="location_name"
                                    placeholder="Enter physical address or Lat/Long"
                                    className="h-14 rounded-2xl border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 font-black text-slate-900 dark:text-white uppercase text-xs tracking-tight focus-visible:ring-amber-500/20"
                                    value={apiaryData.location_name}
                                    onChange={e => setApiaryData({ ...apiaryData, location_name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Flora Matrix</Label>
                                    <Select
                                        name="forage_type"
                                        value={apiaryData.forage_type}
                                        onValueChange={v => setApiaryData({ ...apiaryData, forage_type: v })}
                                    >
                                        <SelectTrigger id="apiary-forage" className="h-14 rounded-2xl border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 font-black text-[10px] uppercase tracking-widest text-slate-900 dark:text-white focus:ring-amber-500/20">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-slate-200 dark:border-white/10 shadow-2xl">
                                            <SelectItem value="Forest" className="p-4 font-black uppercase text-[10px] tracking-widest">Wild Forest</SelectItem>
                                            <SelectItem value="Canola" className="p-4 font-black uppercase text-[10px] tracking-widest">High Canola</SelectItem>
                                            <SelectItem value="Acacia" className="p-4 font-black uppercase text-[10px] tracking-widest">Acacia Prime</SelectItem>
                                            <SelectItem value="Lavender" className="p-4 font-black uppercase text-[10px] tracking-widest">Pure Lavender</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Atmospheric Exposure</Label>
                                    <Select
                                        name="sun_exposure"
                                        value={apiaryData.sun_exposure}
                                        onValueChange={v => setApiaryData({ ...apiaryData, sun_exposure: v })}
                                    >
                                        <SelectTrigger id="apiary-sun" className="h-14 rounded-2xl border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 font-black text-[10px] uppercase tracking-widest text-slate-900 dark:text-white focus:ring-amber-500/20">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-slate-200 dark:border-white/10 shadow-2xl">
                                            <SelectItem value="Full Sun" className="p-4 font-black uppercase text-[10px] tracking-widest">Zenith Exposure</SelectItem>
                                            <SelectItem value="Shade" className="p-4 font-black uppercase text-[10px] tracking-widest">Deep Shade</SelectItem>
                                            <SelectItem value="Semi-Shade" className="p-4 font-black uppercase text-[10px] tracking-widest">Balanced Mask</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="hive" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Sector Assignment</Label>
                                <Select
                                    name="apiary_id"
                                    value={hiveData.apiary_id}
                                    onValueChange={v => setHiveData({ ...hiveData, apiary_id: v })}
                                >
                                    <SelectTrigger id="hive-apiary" className="h-14 rounded-2xl border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 font-black text-[10px] uppercase tracking-widest text-slate-900 dark:text-white focus:ring-amber-500/20">
                                        <SelectValue placeholder="Deploy to..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-slate-200 dark:border-white/10 shadow-2xl">
                                        {apiaries.map(apiary => (
                                            <SelectItem key={apiary.id} value={apiary.id} className="p-4 font-black uppercase text-[10px] tracking-widest">{apiary.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Registry Alpha Code</Label>
                                <div className="relative">
                                    <Hexagon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                    <Input
                                        id="hive-code"
                                        name="hive_code"
                                        placeholder="e.g. BY-ALPHA-01"
                                        className="pl-12 h-14 rounded-2xl border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 font-black text-slate-900 dark:text-white uppercase text-xs tracking-tight focus-visible:ring-amber-500/20"
                                        value={hiveData.hive_code}
                                        onChange={e => setHiveData({ ...hiveData, hive_code: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Unit Architecture</Label>
                                    <Select
                                        name="type"
                                        value={hiveData.type}
                                        onValueChange={v => setHiveData({ ...hiveData, type: v })}
                                    >
                                        <SelectTrigger id="hive-type" className="h-14 rounded-2xl border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 font-black text-[10px] uppercase tracking-widest focus:ring-amber-500/20">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-slate-200 dark:border-white/10 shadow-2xl">
                                            <SelectItem value="Langstroth" className="p-4 font-black uppercase text-[10px] tracking-widest">Langstroth Pro</SelectItem>
                                            <SelectItem value="Top Bar" className="p-4 font-black uppercase text-[10px] tracking-widest">Kenyas Top Bar</SelectItem>
                                            <SelectItem value="Warre" className="p-4 font-black uppercase text-[10px] tracking-widest">Warre Eco</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Protocol Start Date</Label>
                                    <Input
                                        id="queen-hatched"
                                        name="queen_hatched"
                                        type="date"
                                        className="h-14 rounded-2xl border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 font-black text-slate-900 dark:text-white uppercase text-[10px] tracking-widest focus-visible:ring-amber-500/20"
                                        value={hiveData.queen_hatched}
                                        onChange={e => setHiveData({ ...hiveData, queen_hatched: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-5 pt-4">
                                <div className="flex justify-between items-center px-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Biomass Density Bias</Label>
                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                                        Efficiency {Math.round(hiveData.strength * 20)}%
                                    </span>
                                </div>
                                <Slider
                                    defaultValue={[3]}
                                    max={5}
                                    min={1}
                                    step={1}
                                    className="py-6"
                                    onValueChange={v => setHiveData({ ...hiveData, strength: v[0] })}
                                />
                                <div className="flex justify-between text-[8px] font-black text-slate-300 uppercase tracking-[0.3em] px-2 italic">
                                    <span>Minimal Feed</span>
                                    <span>Nominal Vector</span>
                                    <span>Max Saturation</span>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="p-10 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 flex gap-6">
                    <Button variant="ghost" onClick={onClose} className="flex-1 h-16 rounded-[1.5rem] font-black text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5 uppercase tracking-widest text-[11px] transition-all">Abort</Button>
                    <Button
                        onClick={activeTab === 'apiary' ? handleAddApiary : handleAddHive}
                        className="flex-[2] h-16 bg-neutral-900 dark:bg-amber-600 text-white hover:scale-[1.02] active:scale-[0.98] rounded-[1.5rem] px-10 font-black shadow-2xl shadow-black/10 transition-all uppercase tracking-[0.2em] text-xs gap-4 border-none"
                        disabled={loading}
                    >
                        {loading ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                            <ShieldCheck className="w-5 h-5 text-amber-200" />
                        )}
                        Commit Registry
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default QuickActionModal;
