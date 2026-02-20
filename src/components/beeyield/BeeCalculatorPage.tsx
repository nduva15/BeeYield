import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Calculator,
    Droplet,
    Zap,
    Leaf,
    Info,
    AlertCircle,
    ArrowRight,
    Save,
    Share2,
    History,
    TrendingUp,
    Box,
    Thermometer,
    Wind,
    Sun,
    Package,
    Tag,
    Scale,
    Trash2,
    CheckCircle2
} from 'lucide-react';
import { Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBeekeepingMath } from '@/hooks/useBeekeepingMath';
import { beeyieldService, CalculatorLogCreateInput } from '@/services/beeyieldService';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface Scenario {
    id: string;
    name: string;
    location: string;
    beeType: string;
    createdAt: string;
}

type BeeType = 'Apis mellifera' | 'Apis cerana' | 'Apis florea' | 'Apis dorsata';

const BeeCalculatorPage: React.FC = () => {
    const { user, beeyieldUser } = useAuth();
    const userId = beeyieldUser?.id || user?.id;

    const math = useBeekeepingMath();
    const [activeSection, setActiveSection] = React.useState('feeding');
    const [showHistory, setShowHistory] = React.useState(false);
    const [historyLogs, setHistoryLogs] = React.useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = React.useState(false);

    const [scenarios, setScenarios] = React.useState<Scenario[]>([]);
    const [selectedScenarioId, setSelectedScenarioId] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState<string>('inputs');

    // Scenario inputs
    const [scenarioName, setScenarioName] = React.useState("New Forecast Scenario");
    const [location, setLocation] = React.useState("Tana River Orchard");
    const [beeType, setBeeType] = React.useState<BeeType>('Apis mellifera');
    const [colonyCountScenario, setColonyCountScenario] = React.useState(100); // Renamed to avoid conflict
    const [foragingRadius, setForagingRadius] = React.useState(3.0);
    const [targetCrop, setTargetCrop] = React.useState("Macadamia");
    const [bloomDensity, setBloomDensity] = React.useState(75);
    const [environmentalStress, setEnvironmentalStress] = React.useState(15);
    const [competitionLevel, setCompetitionLevel] = React.useState(20);

    // --- State for Feeding ---
    const [syrupVol, setSyrupVol] = React.useState(10);
    const [syrupRatio, setSyrupRatio] = React.useState<'1:1' | '2:1'>('1:1');
    const syrupResult = math.calculateSyrup(syrupVol, syrupRatio);

    const [currentWeight, setCurrentWeight] = React.useState(35);
    const [targetWeight, setTargetWeight] = React.useState(45);
    const winterResult = math.calculateWinterDeficit(currentWeight, targetWeight);

    // --- State for Health ---
    const [miteCount, setMiteCount] = React.useState(2);
    const [temp, setTemp] = React.useState(24);
    const varroaResult = math.getVarroaInfestation(miteCount);

    // --- State for Logistics ---
    const [colonyCount, setColonyCount] = React.useState(50);
    const bomResult = math.calculateBOM(colonyCount);

    const [honeyKg, setHoneyKg] = React.useState(250);
    const [jarSize, setJarSize] = React.useState(500);
    const harvestResult = math.calculateHarvestSupplies(honeyKg, jarSize);

    // --- State for Economy ---
    const [laborCost, setLaborCost] = React.useState(500);
    const [fuelCost, setFuelCost] = React.useState(200);
    const [medCost, setMedCost] = React.useState(150);
    const [equipCost, setEquipCost] = React.useState(100);
    const marginResult = math.calculateHoneyMargin({ labor: laborCost, fuel: fuelCost, medicine: medCost, equipment: equipCost }, honeyKg);

    const [hikingHives, setHikingHives] = React.useState(40);
    const [hikingYield, setHikingYield] = React.useState(15); // per hive
    const [hikingPrice, setHikingPrice] = React.useState(12);
    const [hikingTransport, setHikingTransport] = React.useState(800);
    const hikingROI = math.calculateHikingROI(hikingHives * hikingYield, hikingPrice, hikingTransport, hikingHives);

    const [totalColonies, setTotalColonies] = React.useState(100);
    const [replacementRate, setReplacementRate] = React.useState(15);
    const queensNeeded = Math.ceil(totalColonies * (replacementRate / 100));

    // --- Actions ---
    React.useEffect(() => {
        const syncCalculation = async () => {
            let payload: any = {
                calculation_type: activeSection as any,
                sub_type: 'snapshot',
                inputs: {},
                results: {}
            };

            if (activeSection === 'feeding') {
                payload.inputs = { syrupVol, syrupRatio, currentWeight, targetWeight };
                payload.results = { syrupResult, winterResult };
            } else if (activeSection === 'health') {
                payload.inputs = { miteCount, temp };
                payload.results = { varroaResult };
            } else if (activeSection === 'logistics') {
                payload.inputs = { colonyCount, honeyKg, jarSize, totalColonies, replacementRate };
                payload.results = { bomResult, harvestResult, queensNeeded };
            } else if (activeSection === 'economy') {
                payload.inputs = { laborCost, fuelCost, medCost, equipCost, hikingHives, hikingYield, hikingPrice, hikingTransport };
                payload.results = { marginResult, hikingROI };
            }

            const { error } = await beeyieldService.logCalculation(payload);
            if (error) {
                toast.error("Failed to sync calculation with BeeYield Cloud.");
            }
        };

        syncCalculation();
    }, [activeSection, syrupVol, syrupRatio, currentWeight, targetWeight,
        syrupResult, winterResult, miteCount, temp, varroaResult,
        colonyCount, honeyKg, jarSize, totalColonies, replacementRate,
        bomResult, harvestResult, queensNeeded, laborCost, fuelCost,
        medCost, equipCost, hikingHives, hikingYield, hikingPrice, hikingTransport,
        marginResult, hikingROI]);

    const handleShare = (tool: string) => {
        toast.success(`Exporting ${tool} report...`, {
            description: "Generated PDF shared with Yard Operations team.",
            icon: <Share2 className="w-4 h-4" />
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        const payload: CalculatorLogCreateInput = {
            calculation_type: activeSection as any,
            sub_type: 'snapshot',
            inputs: {
                syrupVol, syrupRatio, currentWeight, targetWeight,
                miteCount, temp, colonyCount, honeyKg, jarSize,
                totalColonies, replacementRate, laborCost, fuelCost,
                medCost, equipCost, hikingHives, hikingYield,
                hikingPrice, hikingTransport
            },
            results: {
                syrupResult, winterResult, varroaResult, bomResult,
                harvestResult, queensNeeded, marginResult, hikingROI
            }
        };

        const { error } = await beeyieldService.logCalculation(payload);
        if (error) {
            toast.error("Failed to save calculation state.");
        } else {
            toast.success("Calculation snapshot saved successfully.", {
                description: "Access this entry via the Math Ledger history.",
                icon: <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
            });
        }
        setIsSaving(false);
    };

    const fetchHistory = async () => {
        setIsLoadingHistory(true);
        const logs = await beeyieldService.getCalculatorLogs();
        setHistoryLogs(logs || []);
        setIsLoadingHistory(false);
        setShowHistory(true);
    };

    return (
        <div className="space-y-12 pb-20 max-w-7xl mx-auto">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b-8 border-[#064e3b] pb-10">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[#10b981] bg-[#064e3b]">
                        <Calculator className="w-3.5 h-3.5 text-[#facc15]" />
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">BeeYield Precision Analytics v3.0</span>
                    </div>
                    <h1 className="text-6xl font-black text-[#064e3b] tracking-tighter uppercase leading-none">
                        Op-Health <span className="text-[#10b981]">Calculator</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#064e3b]/40">Suite of Economic & Logistics Multi-Tools</p>
                </div>

                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        onClick={fetchHistory}
                        className="h-16 px-8 border-4 border-[#064e3b] bg-white text-[#064e3b] font-black uppercase tracking-widest text-xs shadow-[6px_6px_0px_0px_rgba(6,78,59,1)] active:translate-y-1 active:shadow-none"
                    >
                        <History className="w-4 h-4 mr-3" />
                        Math Ledger
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="h-16 px-10 bg-[#064e3b] text-white border-4 border-[#064e3b] font-black uppercase tracking-widest text-xs shadow-[8px_8px_0px_0px_rgba(250,204,21,1)] hover:bg-[#10b981] transition-all"
                    >
                        <Save className="w-4 h-4 mr-3" />
                        Persist Data
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Section Navigation */}
                <div className="lg:col-span-1 space-y-4">
                    {[
                        { id: 'feeding', label: 'Feeding Management', icon: Droplet, count: 3 },
                        { id: 'health', label: 'Health & Prevention', icon: Zap, count: 2 },
                        { id: 'logistics', label: 'Apiary Logistics', icon: Package, count: 3 },
                        { id: 'economy', label: 'The Economy Suite', icon: TrendingUp, count: 2 }
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={cn(
                                "w-full p-6 border-4 flex flex-col gap-4 text-left transition-all group",
                                activeSection === item.id
                                    ? "bg-[#064e3b] border-[#064e3b] text-white shadow-[8px_8px_0px_0px_rgba(16,185,129,1)]"
                                    : "bg-white border-[#064e3b] text-[#064e3b] hover:bg-neutral-50"
                            )}
                        >
                            <div className="flex justify-between items-center">
                                <item.icon className={cn("w-6 h-6", activeSection === item.id ? "text-[#facc15]" : "text-[#064e3b]/30")} />
                                <Badge className={cn(
                                    "rounded-none px-2 py-0.5 text-[10px] font-black",
                                    activeSection === item.id ? "bg-[#10b981] text-white border-none" : "bg-neutral-100 text-[#064e3b] border-2 border-[#064e3b]"
                                )}>
                                    {item.count} TOOLS
                                </Badge>
                            </div>
                            <span className="text-xl font-black uppercase tracking-tighter leading-snug">{item.label}</span>
                        </button>
                    ))}

                    <div className="mt-10 p-8 border-4 border-[#064e3b] bg-[#facc15]/10 space-y-4">
                        <div className="flex items-center gap-3">
                            <Info className="w-5 h-5 text-[#064e3b]" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#064e3b]">Cloud Sync</h4>
                        </div>
                        <p className="text-[10px] font-bold text-[#064e3b]/60 uppercase leading-relaxed">
                            Changes are auto-saved to your profile. Start on mobile, finish on desktop.
                        </p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">
                        {activeSection === 'feeding' && (
                            <motion.div
                                key="feeding"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-12"
                            >
                                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Syrup Calculator */}
                                    <div className="border-4 border-[#064e3b] bg-white p-8 space-y-8 shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-2xl font-black uppercase tracking-tighter">Sugar Syrup</h3>
                                            <Droplet className="w-5 h-5 text-[#064e3b]/20" />
                                        </div>
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Target Volume (L)</label>
                                                <input
                                                    type="number"
                                                    value={syrupVol}
                                                    onChange={(e) => setSyrupVol(Number(e.target.value))}
                                                    className="w-full h-14 border-4 border-[#064e3b] bg-neutral-50 px-6 font-black text-xl outline-none focus:bg-white"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Concentration Ratio</label>
                                                <div className="grid grid-cols-2 border-4 border-[#064e3b]">
                                                    <button
                                                        onClick={() => setSyrupRatio('1:1')}
                                                        className={cn("h-12 font-black text-xs uppercase transition-none", syrupRatio === '1:1' ? "bg-[#064e3b] text-white" : "text-[#064e3b]/30")}
                                                    >
                                                        1:1 (Stimulation)
                                                    </button>
                                                    <button
                                                        onClick={() => setSyrupRatio('2:1')}
                                                        className={cn("h-12 font-black text-xs uppercase transition-none", syrupRatio === '2:1' ? "bg-[#064e3b] text-white" : "text-[#064e3b]/30")}
                                                    >
                                                        2:1 (Storage)
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-6 bg-[#10b981] text-white text-center border-2 border-[#064e3b]">
                                                <p className="text-3xl font-black">{syrupResult.sugarKg}</p>
                                                <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Sugar (kg)</p>
                                            </div>
                                            <div className="p-6 bg-[#064e3b] text-white text-center border-2 border-[#064e3b]">
                                                <p className="text-3xl font-black">{syrupResult.waterL}</p>
                                                <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Water (L)</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Winter Ready Tool */}
                                    <div className="border-4 border-[#064e3b] bg-white p-8 space-y-8 shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-2xl font-black uppercase tracking-tighter">Winter Readiness</h3>
                                            <Badge className="rounded-none border-2 border-red-500 bg-red-50 text-red-500 font-black text-[9px]">CRITICAL_WEIGHT</Badge>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Current (kg)</label>
                                                    <input
                                                        type="number"
                                                        value={currentWeight}
                                                        onChange={(e) => setCurrentWeight(Number(e.target.value))}
                                                        className="w-full h-14 border-4 border-[#064e3b] bg-neutral-50 px-6 font-black text-xl outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Target (kg)</label>
                                                    <input
                                                        type="number"
                                                        value={targetWeight}
                                                        onChange={(e) => setTargetWeight(Number(e.target.value))}
                                                        className="w-full h-14 border-4 border-[#064e3b] bg-neutral-50 px-6 font-black text-xl outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="p-8 border-4 border-dashed border-[#064e3b] bg-neutral-50 space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-black uppercase tracking-tighter">Weight Deficit</span>
                                                    <span className="text-2xl font-black text-red-500">{winterResult.deficitKg} KG</span>
                                                </div>
                                                <Separator className="bg-[#064e3b]/10 h-[2px]" />
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-gray-400">Required 2:1 Syrup</p>
                                                        <p className="text-3xl font-black text-[#10b981]">{winterResult.syrupNeededL} L</p>
                                                    </div>
                                                    <Button className="h-10 bg-[#064e3b] text-white font-black uppercase text-[9px] tracking-widest px-4 translate-y-2">Order Feed</Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <div className="p-10 border-4 border-[#064e3b] bg-[#064e3b] text-white flex gap-8 items-center">
                                    <div className="w-20 h-20 bg-[#facc15] border-4 border-white flex items-center justify-center shrink-0 -rotate-3 hover:rotate-0 transition-transform">
                                        <TrendingUp className="w-10 h-10 text-[#064e3b]" strokeWidth={3} />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-2xl font-black uppercase tracking-tighter text-[#facc15]">Pro Tip: Storage Ratios</h4>
                                        <p className="text-[10px] font-bold text-white/60 uppercase leading-relaxed max-w-xl">
                                            For winter stores, always use 2:1 syrup. This reduces the energy expenditure required for bees to evaporate excess water, increasing survival rates in low-temp zones.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeSection === 'health' && (
                            <motion.div
                                key="health"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-12"
                            >
                                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Varroa Wash Interpreter */}
                                    <div className="border-4 border-[#064e3b] bg-white p-8 space-y-8 shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-2xl font-black uppercase tracking-tighter">Varroa Wash</h3>
                                            <Zap className="w-5 h-5 text-[#064e3b]/20" />
                                        </div>
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Mites Found (300 Bees)</label>
                                                <input
                                                    type="number"
                                                    value={miteCount}
                                                    onChange={(e) => setMiteCount(Number(e.target.value))}
                                                    className="w-full h-14 border-4 border-[#064e3b] bg-neutral-50 px-6 font-black text-xl outline-none"
                                                />
                                            </div>
                                            <div className={cn(
                                                "p-8 border-4 border-[#064e3b] text-center space-y-3",
                                                varroaResult.status === 'safe' ? "bg-green-50 border-[#10b981]/30" :
                                                    varroaResult.status === 'warning' ? "bg-yellow-50 border-[#facc15]/30" : "bg-red-50 border-red-500/30"
                                            )}>
                                                <p className="text-6xl font-black text-[#064e3b]">{varroaResult.percentage}%</p>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#064e3b]/40">Current Infestation</p>
                                                <Badge className={cn(
                                                    "rounded-none border-2 font-black px-6 py-2 text-xs",
                                                    varroaResult.status === 'safe' ? "bg-[#10b981] text-white border-[#10b981]" :
                                                        varroaResult.status === 'warning' ? "bg-[#facc15] text-[#064e3b] border-[#facc15]" : "bg-red-500 text-white border-red-500"
                                                )}>
                                                    {varroaResult.status.toUpperCase()}_ZONE
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Treatment Window Optimizer */}
                                    <div className="border-4 border-[#064e3b] bg-white p-8 space-y-8 shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-2xl font-black uppercase tracking-tighter">Treatment Window</h3>
                                            <Thermometer className="w-5 h-5 text-[#064e3b]/20" />
                                        </div>
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Local Ambient Temp (℃)</label>
                                                <div className="flex gap-4 items-center">
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="40"
                                                        value={temp}
                                                        onChange={(e) => setTemp(Number(e.target.value))}
                                                        className="flex-1 h-4 bg-neutral-200 appearance-none rounded-full cursor-pointer accent-[#064e3b]"
                                                    />
                                                    <span className="text-2xl font-black text-[#064e3b] w-16">{temp}℃</span>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <p className="text-[10px] font-black uppercase text-gray-400">Product Compatibility</p>
                                                <div className="space-y-2">
                                                    {[
                                                        { name: 'Formic Pro (MAQS)', max: 30, risk: temp > 30 },
                                                        { name: 'Apivar (Amitraz)', max: 40, risk: temp > 40 },
                                                        { name: 'Oxalic Vapor', max: 25, risk: temp > 25 }
                                                    ].map((p) => (
                                                        <div key={p.name} className="flex justify-between items-center p-3 border-2 border-[#064e3b] bg-neutral-50">
                                                            <span className="text-[10px] font-black uppercase">{p.name}</span>
                                                            <Badge className={cn(
                                                                "rounded-none border-none font-black text-[9px] px-2",
                                                                p.risk ? "bg-red-500 text-white" : "bg-[#10b981] text-white"
                                                            )}>
                                                                {p.risk ? 'RISK: BROOD LOSS' : 'SAFE: OPTIMAL'}
                                                            </Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </motion.div>
                        )}

                        {activeSection === 'logistics' && (
                            <motion.div
                                key="logistics"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-12"
                            >
                                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* BOM Calculator */}
                                    <div className="border-4 border-[#064e3b] bg-white p-8 space-y-8 shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-2xl font-black uppercase tracking-tighter">Equipment BOM</h3>
                                            <Package className="w-5 h-5 text-[#064e3b]/20" />
                                        </div>
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Target Colony Count</label>
                                                <input
                                                    type="number"
                                                    value={colonyCount}
                                                    onChange={(e) => setColonyCount(Number(e.target.value))}
                                                    className="w-full h-14 border-4 border-[#064e3b] bg-neutral-50 px-6 font-black text-xl outline-none"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                {[
                                                    { label: 'Deep Brood Boxes', val: bomResult.deepBoxes },
                                                    { label: 'Honey Supers', val: bomResult.supers },
                                                    { label: 'Frames (Wired)', val: bomResult.totalFrames },
                                                    { label: 'Wax Foundations', val: bomResult.foundations }
                                                ].map((item) => (
                                                    <div key={item.label} className="flex justify-between items-center p-4 border-2 border-[#064e3b] bg-neutral-50">
                                                        <span className="text-[10px] font-black uppercase">{item.label}</span>
                                                        <span className="text-lg font-black text-[#064e3b]">{item.val}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Harvest Package Estimaor */}
                                    <div className="border-4 border-[#064e3b] bg-white p-8 space-y-8 shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-2xl font-black uppercase tracking-tighter">Jar & Label Estimator</h3>
                                            <Tag className="w-5 h-5 text-[#064e3b]/20" />
                                        </div>
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Honey Yield (kg)</label>
                                                    <input
                                                        type="number"
                                                        value={honeyKg}
                                                        onChange={(e) => setHoneyKg(Number(e.target.value))}
                                                        className="w-full h-14 border-4 border-[#064e3b] bg-neutral-50 px-6 font-black text-xl outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Jar Size (ml)</label>
                                                    <select
                                                        value={jarSize}
                                                        onChange={(e) => setJarSize(Number(e.target.value))}
                                                        className="w-full h-14 border-4 border-[#064e3b] bg-neutral-50 px-6 font-black text-xs uppercase outline-none"
                                                    >
                                                        <option value={250}>250 ML / 350G</option>
                                                        <option value={500}>500 ML / 700G</option>
                                                        <option value={1000}>1000 ML / 1.4KG</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-8 border-4 border-[#064e3b] bg-[#facc15] text-[#064e3b] text-center space-y-2">
                                                    <p className="text-5xl font-black text-[#064e3b] tracking-tighter">{harvestResult.jars}</p>
                                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Jars Needed</p>
                                                </div>
                                                <div className="p-8 border-4 border-[#064e3b] bg-white text-[#064e3b] text-center space-y-2">
                                                    <p className="text-5xl font-black text-[#064e3b] tracking-tighter">{harvestResult.labels}</p>
                                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Labels (inc. 5% extra)</p>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => handleShare('Harvest Logistics')}
                                            className="w-full h-16 border-4 border-[#064e3b] bg-[#064e3b] rounded-none font-black text-white hover:bg-[#10b981] active:translate-y-1 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3"
                                        >
                                            <Share2 className="w-4 h-4" />
                                            Share BOM With Team
                                        </Button>
                                    </div>
                                </section>

                                {/* Queen Replacement Tool */}
                                <section className="p-12 border-4 border-[#064e3b] bg-white space-y-8 shadow-[8px_8px_0px_0px_rgba(250,204,21,1)]">
                                    <div className="flex justify-between items-center">
                                        <div className="space-y-1">
                                            <h3 className="text-3xl font-black uppercase tracking-tighter">Queen Replacement Logic</h3>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-loose">Automated Nuc & Queen Procurement Estimator</p>
                                        </div>
                                        <Award className="w-10 h-10 text-[#064e3b]/10" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Apiary Size</label>
                                                <input type="number" value={totalColonies} onChange={(e) => setTotalColonies(Number(e.target.value))} className="w-full h-12 border-2 border-[#064e3b] px-4 font-black" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Annual Turnover Rate (%)</label>
                                                <div className="flex items-center gap-4">
                                                    <input type="range" min="5" max="50" step="5" value={replacementRate} onChange={(e) => setReplacementRate(Number(e.target.value))} className="flex-1 accent-[#064e3b]" />
                                                    <span className="font-black w-8">{replacementRate}%</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 flex gap-4">
                                            <div className="flex-1 p-8 border-4 border-[#064e3b] bg-neutral-50 flex flex-col items-center justify-center text-center">
                                                <p className="text-6xl font-black text-[#064e3b]">{queensNeeded}</p>
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Mated Queens Required</p>
                                            </div>
                                            <div className="w-48 p-4 border-4 border-[#064e3b] bg-[#064e3b] text-white flex flex-col justify-center items-center gap-4 text-center">
                                                <Badge className="bg-[#facc15] text-[#064e3b] border-none font-black text-[9px]">ORDER_QUEUE</Badge>
                                                <p className="text-[10px] font-bold uppercase leading-snug">Lock-in early spring pricing (est. $35/ea)</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </motion.div>
                        )}

                        {activeSection === 'economy' && (
                            <motion.div
                                key="economy"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-12"
                            >
                                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Margin Calculator */}
                                    <div className="border-4 border-[#064e3b] bg-white p-8 space-y-8 shadow-[12px_12px_0px_0px_rgba(6,78,59,1)]">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-2xl font-black uppercase tracking-tighter">Cost analysis (per 1kg)</h3>
                                            <Scale className="w-5 h-5 text-[#064e3b]/20" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Labor ($)</label>
                                                <input type="number" value={laborCost} onChange={(e) => setLaborCost(Number(e.target.value))} className="w-full h-12 border-2 border-[#064e3b] bg-neutral-50 px-4 font-black" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Fuel/Logistics ($)</label>
                                                <input type="number" value={fuelCost} onChange={(e) => setFuelCost(Number(e.target.value))} className="w-full h-12 border-2 border-[#064e3b] bg-neutral-50 px-4 font-black" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Medicine ($)</label>
                                                <input type="number" value={medCost} onChange={(e) => setMedCost(Number(e.target.value))} className="w-full h-12 border-2 border-[#064e3b] bg-neutral-50 px-4 font-black" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Equip/Depr ($)</label>
                                                <input type="number" value={equipCost} onChange={(e) => setEquipCost(Number(e.target.value))} className="w-full h-12 border-2 border-[#064e3b] bg-neutral-50 px-4 font-black" />
                                            </div>
                                        </div>
                                        <div className="p-8 border-4 border-[#064e3b] bg-[#10b981] text-white flex justify-between items-center">
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Break-Even Point</p>
                                                <p className="text-4xl font-black">${marginResult.costPerKg} / KG</p>
                                            </div>
                                            <Badge className="bg-white text-[#10b981] border-none font-black px-4 py-1 text-[9px] uppercase tracking-widest">Target Profit: 40%</Badge>
                                        </div>
                                    </div>

                                    {/* Hiking ROI */}
                                    <div className="border-4 border-[#064e3b] bg-white p-8 space-y-8 shadow-[12px_12px_0px_0px_rgba(6,78,59,1)]">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-2xl font-black uppercase tracking-tighter">"Is it worth hiking?"</h3>
                                            <TrendingUp className="w-5 h-5 text-[#064e3b]/20" />
                                        </div>
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Number of Hives</label>
                                                    <input type="number" value={hikingHives} onChange={(e) => setHikingHives(Number(e.target.value))} className="w-full h-12 border-2 border-[#064e3b] bg-neutral-50 px-4 font-black" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Transport Costs ($)</label>
                                                    <input type="number" value={hikingTransport} onChange={(e) => setHikingTransport(Number(e.target.value))} className="w-full h-12 border-2 border-[#064e3b] bg-neutral-50 px-4 font-black" />
                                                </div>
                                            </div>
                                            <div className={cn(
                                                "p-8 border-4 border-[#064e3b] space-y-4 shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]",
                                                hikingROI.isWorthIt ? "bg-green-50" : "bg-red-50"
                                            )}>
                                                <div className="flex justify-between items-center">
                                                    <h4 className="text-xl font-black uppercase tracking-tighter">Recommendation</h4>
                                                    {hikingROI.isWorthIt ? <CheckCircle2 className="w-6 h-6 text-[#10b981]" /> : <AlertCircle className="w-6 h-6 text-red-500" />}
                                                </div>
                                                <p className={cn("text-5xl font-black uppercase tracking-tighter tabular-nums", hikingROI.isWorthIt ? "text-[#10b981]" : "text-red-500")}>
                                                    {hikingROI.isWorthIt ? 'DEPLOY_HIVES' : 'ABORT_HIKE'}
                                                </p>
                                                <div className="flex justify-between items-center text-[10px] font-black uppercase text-[#064e3b]">
                                                    <span>Net Profit: ${hikingROI.netProfit.toLocaleString()}</span>
                                                    <span>${hikingROI.profitPerHive.toFixed(0)} / Hive</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* History Ledger Drawer/Overlay */}
            <AnimatePresence>
                {showHistory && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowHistory(false)}
                            className="fixed inset-0 bg-[#064e3b]/80 backdrop-blur-sm z-[100]"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full max-w-lg bg-white border-l-8 border-[#064e3b] z-[101] shadow-2xl p-10 overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-10 border-b-4 border-[#064e3b] pb-6">
                                <h2 className="text-3xl font-black uppercase tracking-tighter text-[#064e3b]">Math <span className="text-[#10b981]">Ledger</span></h2>
                                <button onClick={() => setShowHistory(false)} className="h-10 w-10 border-2 border-[#064e3b] flex items-center justify-center font-black hover:bg-[#064e3b] hover:text-white transition-colors">X</button>
                            </div>

                            {isLoadingHistory ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <div className="w-12 h-12 border-4 border-[#10b981] border-t-transparent animate-spin rounded-full" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#064e3b]">Syncing with Cloud...</p>
                                </div>
                            ) : historyLogs.length === 0 ? (
                                <div className="text-center py-20 space-y-4">
                                    <History className="w-12 h-12 text-[#064e3b]/10 mx-auto" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#064e3b]/40">No entries recorded in the cloud.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {historyLogs.map((log: any) => (
                                        <div key={log.id} className="p-6 border-4 border-[#064e3b] bg-white relative group">
                                            <div className="flex justify-between items-start mb-4">
                                                <Badge className="rounded-none bg-[#064e3b] text-[#facc15] font-black uppercase px-2 py-0.5 text-[8px]">
                                                    {log.calculation_type}
                                                </Badge>
                                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                                                    {new Date(log.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h4 className="text-lg font-black uppercase tracking-tighter mb-4 leading-tight">
                                                {log.sub_type === 'snapshot' ? 'Manual Snapshot' : 'Auto-Log'}
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-neutral-50 border-2 border-[#064e3b]/10">
                                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Inputs</p>
                                                    <div className="space-y-1">
                                                        {Object.entries(log.inputs || {}).slice(0, 3).map(([k, v]: any) => (
                                                            <p key={k} className="text-[9px] font-bold text-[#064e3b] uppercase truncate">{k}: {v}</p>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-[#10b981]/10 border-2 border-[#064e3b]/10">
                                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Key Results</p>
                                                    <div className="space-y-1">
                                                        {Object.values(log.results || {}).slice(0, 2).map((v: any, i) => (
                                                            <p key={i} className="text-[9px] font-black text-[#064e3b] uppercase truncate">Res: {JSON.stringify(v)}</p>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" className="w-full mt-4 h-10 border-2 border-[#064e3b] rounded-none opacity-0 group-hover:opacity-100 transition-opacity font-black uppercase text-[10px]">
                                                Restore This State
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BeeCalculatorPage;
