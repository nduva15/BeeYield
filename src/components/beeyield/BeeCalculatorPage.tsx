import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calculator,
    Droplet,
    Zap,
    History,
    TrendingUp,
    Thermometer,
    Package,
    Tag,
    Scale,
    CheckCircle2,
    Share2,
    Save,
    AlertCircle,
    Info,
    Award,
    Loader2,
    Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBeekeepingMath } from '@/hooks/useBeekeepingMath';
import { beeyieldService, CalculatorLogCreateInput } from '@/services/beeyieldService';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { glass, PageHeader } from './GlassTheme';

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
    const [colonyCountScenario, setColonyCountScenario] = React.useState(100);
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
    const [hikingYield, setHikingYield] = React.useState(15);
    const [hikingPrice, setHikingPrice] = React.useState(12);
    const [hikingTransport, setHikingTransport] = React.useState(800);
    const hikingROI = math.calculateHikingROI(hikingHives * hikingYield, hikingPrice, hikingTransport, hikingHives);

    const [totalColonies, setTotalColonies] = React.useState(100);
    const [replacementRate, setReplacementRate] = React.useState(15);
    const queensNeeded = Math.ceil(totalColonies * (replacementRate / 100));

    // --- Actions ---
    React.useEffect(() => {
        const syncCalculation = async () => {
            const payload: any = {
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
                icon: <CheckCircle2 className="w-4 h-4 text-[#1B9157]" />
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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, "space-y-8 pb-32")}
        >
            {/* Header Section */}
            <PageHeader
                icon={Calculator}
                label="Precision Analytics v3.0"
                title={<>Op-Health <span className="text-[#F4D03F]">Calculator</span></>}
                subtitle="Suite of Economic & Logistics Multi-Tools for hive management."
                actions={
                    <div className="flex gap-2">
                        <button
                            onClick={fetchHistory}
                            className={cn(glass.btnSecondary, "px-3 h-8 shadow-sm group")}
                        >
                            <History className="w-3.5 h-3.5 mr-2 text-foreground/40 group-hover:text-[#F4D03F] transition-colors" />
                            <span className="text-[10px] font-black uppercase tracking-tight">Ledger</span>
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={cn(glass.btnPrimary, "px-4 h-8 shadow-sm group")}
                        >
                            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <Save className="w-3.5 h-3.5 mr-2" />}
                            <span className="text-[10px] font-black uppercase tracking-tight">Save</span>
                        </button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                {/* Section Navigation */}
                <div className="lg:col-span-1 space-y-3">
                    {[
                        { id: 'feeding', label: 'Feeding', icon: Droplet, count: 3, color: 'text-blue-500', bg: 'bg-blue-500' },
                        { id: 'health', label: 'Health', icon: Zap, count: 2, color: 'text-[#1B9157]', bg: 'bg-[#1B9157]' },
                        { id: 'logistics', label: 'Logistics', icon: Package, count: 3, color: 'text-[#F4D03F]', bg: 'bg-[#F4D03F]' },
                        { id: 'economy', label: 'Economy', icon: TrendingUp, count: 2, color: 'text-indigo-500', bg: 'bg-indigo-500' }
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={cn(
                                glass.card,
                                "w-full p-4 flex items-center justify-between gap-4 text-left transition-all duration-300 group hover:shadow-sm overflow-hidden relative",
                                activeSection === item.id
                                    ? "bg-white border-[#F4D03F]/30 ring-2 ring-[#F4D03F]/10"
                                    : "bg-white/40 border-transparent opacity-80"
                            )}
                        >
                            {activeSection === item.id && (
                                <motion.div layoutId="active-pill" className="absolute left-0 top-0 bottom-0 w-1 bg-[#F4D03F]" />
                            )}
                            <div className="flex items-center gap-3">
                                <item.icon className={cn("w-4 h-4", activeSection === item.id ? item.color : "text-gray-400")} />
                                <span className={cn("text-xs font-black uppercase tracking-tight", activeSection === item.id ? "text-foreground" : "text-foreground/60")}>
                                    {item.label}
                                </span>
                            </div>
                            <div className={cn(glass.badge, "border-none px-2 py-0.5",
                                activeSection === item.id ? `${item.bg}/10 ${item.color}` : "bg-transparent text-gray-400")}>
                                {item.count}
                            </div>
                        </button>
                    ))}

                    <div className={cn(glass.card, "mt-6 p-6 space-y-3 bg-[#F4D03F]/5 border-[#F4D03F]/10 relative overflow-hidden group rounded-2xl")}>
                        <div className="flex items-center gap-2 relative z-10">
                            <Info className="w-3.5 h-3.5 text-[#F4D03F]" />
                            <h4 className="text-[10px] font-black uppercase text-[#F4D03F] tracking-tight">Cloud Sync</h4>
                        </div>
                        <p className="text-[10px] font-bold opacity-60 leading-tight relative z-10 uppercase tracking-tighter">
                            Changes auto-save. Start on mobile, finish on desktop.
                        </p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">
                        {activeSection === 'feeding' && (
                            <motion.div
                                key="feeding"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Syrup Calculator */}
                                    <div className={cn(glass.card, "p-6 space-y-6 flex flex-col justify-between shadow-sm bg-white/50 backdrop-blur-xl rounded-3xl border-[#F4D03F]/10")}>
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <h3 className="text-xl font-black uppercase tracking-tight leading-none">Sugar <span className="text-blue-500">Syrup</span></h3>
                                                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest leading-none">Synergy Optimization</p>
                                            </div>
                                            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                                <Droplet className="w-4 h-4 text-blue-500" />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label htmlFor="syrup_target_volume_l" className="text-[10px] font-black uppercase opacity-40 tracking-widest pl-1">Target Volume (L)</label>
                                                <input
                                                    id="syrup_target_volume_l"
                                                    name="syrup_target_volume_l"
                                                    type="number"
                                                    value={syrupVol}
                                                    onChange={(e) => setSyrupVol(Number(e.target.value))}
                                                    placeholder="e.g. 10"
                                                    title="Target syrup volume (liters)"
                                                    aria-label="Target syrup volume (liters)"
                                                    className={cn(glass.input, "w-full h-11 rounded-xl text-lg font-black font-mono px-4")}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase opacity-40 tracking-widest pl-1">Concentration Ratio</label>
                                                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted/50 border border-black/5">
                                                    <button
                                                        onClick={() => setSyrupRatio('1:1')}
                                                        className={cn("h-9 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                                            syrupRatio === '1:1' ? "bg-white text-foreground shadow-sm ring-1 ring-black/5" : "text-foreground/40 hover:bg-white/50")}
                                                    >
                                                        1:1 (Stim)
                                                    </button>
                                                    <button
                                                        onClick={() => setSyrupRatio('2:1')}
                                                        className={cn("h-9 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                                            syrupRatio === '2:1' ? "bg-white text-foreground shadow-sm ring-1 ring-black/5" : "text-foreground/40 hover:bg-white/50")}
                                                    >
                                                        2:1 (Store)
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-center flex flex-col items-center justify-center h-24 relative overflow-hidden group">
                                                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <p className="text-3xl font-black tabular-nums text-[#1B9157] leading-none mb-1">{syrupResult.sugarKg}</p>
                                                <p className="text-[8px] font-black uppercase opacity-40 tracking-widest mt-1">Sugar (kg)</p>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 text-center flex flex-col items-center justify-center h-24 relative overflow-hidden group">
                                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <p className="text-3xl font-black tabular-nums text-blue-600 leading-none mb-1">{syrupResult.waterL}</p>
                                                <p className="text-[8px] font-black uppercase opacity-40 tracking-widest mt-1">Water (L)</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Winter Ready Tool */}
                                    <div className={cn(glass.card, "p-6 space-y-6 flex flex-col justify-between shadow-sm bg-white/50 backdrop-blur-xl rounded-3xl border-[#F4D03F]/10 overflow-hidden relative")}>
                                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
                                        <div className="flex justify-between items-start relative z-10">
                                            <div className="space-y-1">
                                                <h3 className="text-xl font-black uppercase tracking-tight leading-none">Winter <span className="text-red-500">Ready</span></h3>
                                                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest leading-none">Critical Weight Guard</p>
                                            </div>
                                            <div className={cn(glass.badge, "bg-red-500 text-white border-none px-2 py-0.5 text-[8px] font-black tracking-widest")}>DEFICIT_ZONE</div>
                                        </div>
                                        <div className="space-y-4 relative z-10">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label htmlFor="winter_current_weight_kg" className="text-[10px] font-black uppercase opacity-40 tracking-widest pl-1">Current (kg)</label>
                                                    <input
                                                        id="winter_current_weight_kg"
                                                        name="winter_current_weight_kg"
                                                        type="number"
                                                        value={currentWeight}
                                                        onChange={(e) => setCurrentWeight(Number(e.target.value))}
                                                        placeholder="e.g. 18"
                                                        title="Current hive weight (kg)"
                                                        aria-label="Current hive weight (kg)"
                                                        className={cn(glass.input, "w-full h-11 rounded-xl text-lg font-black font-mono px-4")}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label htmlFor="winter_target_weight_kg" className="text-[10px] font-black uppercase opacity-40 tracking-widest pl-1">Target (kg)</label>
                                                    <input
                                                        id="winter_target_weight_kg"
                                                        name="winter_target_weight_kg"
                                                        type="number"
                                                        value={targetWeight}
                                                        onChange={(e) => setTargetWeight(Number(e.target.value))}
                                                        placeholder="e.g. 25"
                                                        title="Target hive weight (kg)"
                                                        aria-label="Target hive weight (kg)"
                                                        className={cn(glass.input, "w-full h-11 rounded-xl text-lg font-black font-mono px-4")}
                                                    />
                                                </div>
                                            </div>
                                            <div className="p-5 rounded-2xl bg-muted/30 border border-black/5 space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-black uppercase opacity-40 tracking-widest">Deficit</span>
                                                    <span className="text-2xl font-black tabular-nums text-red-500 leading-none">{winterResult.deficitKg} <span className="text-[10px] opacity-40 ml-1">KG</span></span>
                                                </div>
                                                <div className="h-px bg-black/5" />
                                                <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
                                                    <div>
                                                        <p className="text-[8px] font-black uppercase opacity-40 tracking-widest mb-1">Required 2:1 Syrup</p>
                                                        <p className="text-3xl font-black tabular-nums text-[#1B9157] leading-none">{winterResult.syrupNeededL} <span className="text-[10px] opacity-40 ml-1">L</span></p>
                                                    </div>
                                                    <button className={cn(glass.btnPrimary, "h-10 px-6 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm w-full sm:w-auto")}>Order Feed</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <div className={cn(glass.card, "p-4 bg-black/5 border-none flex items-start gap-4 rounded-2xl")}>
                                    <div className="w-8 h-8 rounded-xl bg-[#F4D03F]/10 flex items-center justify-center shrink-0">
                                        <Lightbulb className="w-4 h-4 text-[#F4D03F]" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="text-[10px] font-black uppercase tracking-tight leading-none text-foreground">Pro Tip: <span className="text-[#F4D03F]">Storage Ratios</span></h4>
                                        <p className="text-[10px] font-bold opacity-50 leading-tight uppercase tracking-tight">
                                            For winter stores, use 2:1 syrup. Reduces energy expenditure for moisture evaporation, maximizing colony survival.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeSection === 'health' && (
                            <motion.div
                                key="health"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Varroa Wash Interpreter */}
                                    <div className={cn(glass.card, "p-6 space-y-6 flex flex-col justify-between shadow-sm bg-white/50 backdrop-blur-xl rounded-3xl border-[#F4D03F]/10 overflow-hidden relative group")}>
                                        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl pointer-events-none transition-colors duration-500"
                                            style={{ backgroundColor: varroaResult.status === 'safe' ? 'rgba(16,185,129,0.05)' : varroaResult.status === 'warning' ? 'rgba(245,158,11,0.05)' : 'rgba(239,68,68,0.05)' }} />

                                        <div className="flex justify-between items-start relative z-10">
                                            <div className="space-y-1">
                                                <h3 className="text-xl font-black uppercase tracking-tight leading-none">Varroa <span className="text-[#1B9157]">Wash</span></h3>
                                                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest leading-none">Mite Density Analysis</p>
                                            </div>
                                            <div className="w-8 h-8 rounded-xl bg-[#1B9157]/10 flex items-center justify-center">
                                                <Zap className="w-4 h-4 text-[#1B9157]" />
                                            </div>
                                        </div>
                                        <div className="space-y-4 relative z-10">
                                            <div className="space-y-2">
                                                <label htmlFor="varroa_mites_found" className="text-[10px] font-black uppercase opacity-40 tracking-widest pl-1">Total Mites Found (300 Bees)</label>
                                                <input
                                                    id="varroa_mites_found"
                                                    name="varroa_mites_found"
                                                    type="number"
                                                    value={miteCount}
                                                    onChange={(e) => setMiteCount(Number(e.target.value))}
                                                    placeholder="e.g. 9"
                                                    title="Total mites found (300 bees)"
                                                    aria-label="Total mites found (300 bees)"
                                                    className={cn(glass.input, "w-full h-11 rounded-xl text-lg font-black font-mono text-center px-4")}
                                                />
                                            </div>
                                            <div className={cn(
                                                "p-6 rounded-2xl border text-center space-y-2 flex flex-col items-center justify-center shadow-inner transition-colors duration-500 relative overflow-hidden",
                                                varroaResult.status === 'safe' ? "bg-emerald-500/5 border-emerald-500/10" :
                                                    varroaResult.status === 'warning' ? "bg-amber-500/5 border-amber-500/10" : "bg-red-500/5 border-red-500/10"
                                            )}>
                                                <p className={cn("text-5xl font-black tabular-nums leading-none tracking-tighter",
                                                    varroaResult.status === 'safe' ? "text-[#1B9157]" :
                                                        varroaResult.status === 'warning' ? "text-amber-500" : "text-red-500"
                                                )}>{varroaResult.percentage}%</p>
                                                <p className="text-[8px] font-black uppercase opacity-40 tracking-widest leading-none uppercase">Infestation Rate</p>
                                                <div className={cn(
                                                    glass.badge, "font-black px-3 py-1 mt-2 shadow-sm border-none text-[8px] tracking-widest",
                                                    varroaResult.status === 'safe' ? "bg-[#1B9157] text-white" :
                                                        varroaResult.status === 'warning' ? "bg-amber-500 text-white" : "bg-red-500 text-white"
                                                )}>
                                                    {varroaResult.status.toUpperCase()}_ZONE
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Treatment Window Optimizer */}
                                    <div className={cn(glass.card, "p-6 space-y-6 flex flex-col shadow-sm bg-white/50 backdrop-blur-xl rounded-3xl border-[#F4D03F]/10 overflow-hidden relative")}>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

                                        <div className="flex justify-between items-start relative z-10">
                                            <div className="space-y-1">
                                                <h3 className="text-xl font-black uppercase tracking-tight leading-none">Treatment <span className="text-blue-500">Limits</span></h3>
                                                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest leading-none">Ambient Thermal thresholds</p>
                                            </div>
                                            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                                <Thermometer className="w-4 h-4 text-blue-500" />
                                            </div>
                                        </div>
                                        <div className="space-y-4 relative z-10 flex-1 flex flex-col justify-end">
                                            <div className="space-y-3 p-4 rounded-2xl bg-muted/30 border border-black/5">
                                                <label htmlFor="treatment_ambient_temp_c" className="text-[10px] font-black uppercase opacity-40 tracking-widest block">Ambient Temp (℃)</label>
                                                <div className="flex items-center gap-4">
                                                    <input
                                                        id="treatment_ambient_temp_c"
                                                        name="treatment_ambient_temp_c"
                                                        type="range"
                                                        min="0"
                                                        max="40"
                                                        value={temp}
                                                        onChange={(e) => setTemp(Number(e.target.value))}
                                                        title="Ambient temperature (°C)"
                                                        aria-label="Ambient temperature (°C)"
                                                        className="flex-1 h-1.5 bg-black/5 appearance-none rounded-full cursor-pointer accent-blue-500"
                                                    />
                                                    <span className="text-xl font-black tabular-nums min-w-[2.5rem] tracking-tighter">{temp}℃</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <p className="text-[8px] font-black uppercase opacity-40 tracking-widest mb-1">Product Compatibility</p>
                                                <div className="space-y-1.5">
                                                    {[
                                                        { name: 'Formic Pro', max: 30, risk: temp > 30 },
                                                        { name: 'Apivar', max: 40, risk: temp > 40 },
                                                        { name: 'Oxalic Vapor', max: 25, risk: temp > 25 }
                                                    ].map((p) => (
                                                        <div key={p.name} className="flex justify-between items-center px-4 py-2 rounded-xl bg-white/40 border border-black/5 transition-colors group">
                                                            <span className="text-[10px] font-black uppercase tracking-tight text-foreground/60 group-hover:text-foreground">{p.name}</span>
                                                            <div className={cn(
                                                                glass.badge, "border-none px-2 py-0.5 text-[8px] font-black tracking-widest shadow-none",
                                                                p.risk ? "bg-red-500 text-white" : "bg-[#1B9157] text-white"
                                                            )}>
                                                                {p.risk ? 'RISK' : 'SAFE'}
                                                            </div>
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
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* BOM Calculator */}
                                    <div className={cn(glass.card, "p-6 space-y-6 flex flex-col shadow-sm bg-white/50 backdrop-blur-xl rounded-3xl border-[#F4D03F]/10")}>
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <h3 className="text-xl font-black uppercase tracking-tight leading-none">Equipment <span className="text-[#F4D03F]">BOM</span></h3>
                                                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest leading-none">Bill of Materials</p>
                                            </div>
                                            <div className="w-8 h-8 rounded-xl bg-[#F4D03F]/10 flex items-center justify-center">
                                                <Package className="w-4 h-4 text-[#F4D03F]" />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label htmlFor="equipment_target_colony_count" className="text-[10px] font-black uppercase opacity-40 tracking-widest pl-1">Target Colony Count</label>
                                                <input
                                                    id="equipment_target_colony_count"
                                                    name="equipment_target_colony_count"
                                                    type="number"
                                                    value={colonyCount}
                                                    onChange={(e) => setColonyCount(Number(e.target.value))}
                                                    placeholder="e.g. 25"
                                                    title="Target colony count"
                                                    aria-label="Target colony count"
                                                    className={cn(glass.input, "w-full h-11 rounded-xl text-lg font-black font-mono px-4")}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {[
                                                    { label: 'Brood Boxes', val: bomResult.deepBoxes },
                                                    { label: 'Honey Supers', val: bomResult.supers },
                                                    { label: 'Frames', val: bomResult.totalFrames },
                                                    { label: 'Foundations', val: bomResult.foundations }
                                                ].map((item) => (
                                                    <div key={item.label} className="p-3 rounded-xl bg-muted/30 border border-black/5 flex flex-col justify-center">
                                                        <span className="text-[8px] font-black uppercase opacity-40 tracking-widest mb-1">{item.label}</span>
                                                        <span className="text-xl font-black tabular-nums leading-none tracking-tight">{item.val}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Harvest Package Estimator */}
                                    <div className={cn(glass.card, "p-6 space-y-6 flex flex-col justify-between shadow-sm bg-white/50 backdrop-blur-xl rounded-3xl border-[#F4D03F]/10")}>
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <h3 className="text-xl font-black uppercase tracking-tight leading-none">Supply <span className="text-emerald-500">Estimator</span></h3>
                                                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest leading-none">Packaging & Labels</p>
                                            </div>
                                            <div className="w-8 h-8 rounded-xl bg-[#1B9157]/10 flex items-center justify-center">
                                                <Tag className="w-4 h-4 text-[#1B9157]" />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label htmlFor="supply_honey_yield_kg" className="text-[10px] font-black uppercase opacity-40 tracking-widest pl-1">Honey Yield (kg)</label>
                                                    <input
                                                        id="supply_honey_yield_kg"
                                                        name="supply_honey_yield_kg"
                                                        type="number"
                                                        value={honeyKg}
                                                        onChange={(e) => setHoneyKg(Number(e.target.value))}
                                                        placeholder="e.g. 120"
                                                        title="Honey yield (kg)"
                                                        aria-label="Honey yield (kg)"
                                                        className={cn(glass.input, "w-full h-11 rounded-xl text-lg font-black font-mono px-4")}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label htmlFor="supply_jar_size_ml" className="text-[10px] font-black uppercase opacity-40 tracking-widest pl-1">Jar Size (ml)</label>
                                                    <select
                                                        id="supply_jar_size_ml"
                                                        name="supply_jar_size_ml"
                                                        value={jarSize}
                                                        onChange={(e) => setJarSize(Number(e.target.value))}
                                                        title="Jar size (ml)"
                                                        aria-label="Jar size (ml)"
                                                        className={cn(glass.input, "w-full h-11 rounded-xl text-xs font-black uppercase tracking-widest px-4 py-0 appearance-none")}
                                                    >
                                                        <option value={250}>250 ML / 350G</option>
                                                        <option value={500}>500 ML / 700G</option>
                                                        <option value={1000}>1000 ML / 1.4KG</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 rounded-2xl bg-[#F4D03F]/10 border border-[#F4D03F]/20 text-center flex flex-col items-center justify-center h-24 relative overflow-hidden group">
                                                    <div className="absolute inset-0 bg-gradient-to-tr from-[#F4D03F]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <p className="text-3xl font-black tabular-nums transition-transform group-hover:scale-105 duration-300">{harvestResult.jars}</p>
                                                    <p className="text-[8px] font-black uppercase opacity-40 tracking-widest mt-1">Jars Needed</p>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-muted/30 border border-black/5 text-center flex flex-col items-center justify-center h-24 relative overflow-hidden group">
                                                    <p className="text-3xl font-black tabular-nums transition-transform group-hover:scale-105 duration-300">{harvestResult.labels}</p>
                                                    <p className="text-[8px] font-black uppercase opacity-40 tracking-widest mt-1">Labels (5% ext)</p>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleShare('Harvest Logistics')}
                                            className={cn(glass.btnPrimary, "w-full h-10 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm")}
                                        >
                                            <Share2 className="w-3.5 h-3.5 mr-2" />
                                            Share BOM
                                        </button>
                                    </div>
                                </section>

                                {/* Queen Replacement Tool */}
                                <section className={cn(glass.card, "p-6 space-y-6 shadow-sm bg-white/50 backdrop-blur-xl rounded-3xl border-[#F4D03F]/10 overflow-hidden relative group")}>
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#F4D03F]/5 rounded-full blur-3xl pointer-events-none -mr-12 -mt-12 transition-transform group-hover:scale-110 duration-700" />
                                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 relative z-10">
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-black uppercase tracking-tight leading-none">Queen <span className="text-[#F4D03F]">Logistics</span></h3>
                                            <p className="text-[10px] font-black opacity-40 uppercase tracking-widest leading-none">Nuc & Queen Procurement logic</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-[#F4D03F]/5 flex items-center justify-center border border-[#F4D03F]/10">
                                            <Award className="w-5 h-5 text-[#F4D03F]" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
                                        <div className="lg:col-span-4 space-y-4">
                                            <div className="space-y-2">
                                                <label htmlFor="queen_apiary_size" className="text-[10px] font-black uppercase opacity-40 tracking-widest pl-1">Apiary Size</label>
                                                <input
                                                    id="queen_apiary_size"
                                                    name="queen_apiary_size"
                                                    type="number"
                                                    value={totalColonies}
                                                    onChange={(e) => setTotalColonies(Number(e.target.value))}
                                                    placeholder="e.g. 40"
                                                    title="Apiary size (colonies)"
                                                    aria-label="Apiary size (colonies)"
                                                    className={cn(glass.input, "w-full h-11 rounded-xl text-lg font-black font-mono px-4")}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label htmlFor="queen_turnover_rate" className="text-[10px] font-black uppercase opacity-40 tracking-widest pl-1">Turnover ({replacementRate}%)</label>
                                                <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-muted/30 border border-black/5">
                                                    <input
                                                        id="queen_turnover_rate"
                                                        name="queen_turnover_rate"
                                                        type="range"
                                                        min="5"
                                                        max="50"
                                                        step="5"
                                                        value={replacementRate}
                                                        onChange={(e) => setReplacementRate(Number(e.target.value))}
                                                        title="Queen replacement turnover rate (%)"
                                                        aria-label="Queen replacement turnover rate (%)"
                                                        className="flex-1 h-1.5 bg-black/5 appearance-none rounded-full cursor-pointer accent-[#F4D03F]"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="lg:col-span-8 flex flex-col sm:flex-row gap-4 h-full">
                                            <div className="flex-1 p-6 rounded-2xl bg-white/40 border border-black/5 flex flex-col items-center justify-center text-center shadow-inner relative overflow-hidden group/result">
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover/result:scale-150 transition-transform duration-700" />
                                                <p className="text-6xl font-black tabular-nums tracking-tighter text-foreground relative z-10 leading-none">{queensNeeded}</p>
                                                <p className="text-[8px] font-black uppercase opacity-30 tracking-[0.2em] mt-3 relative z-10">Mated Queens Required</p>
                                            </div>
                                            <div className="sm:w-56 p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/10 flex flex-col justify-center items-center gap-3 text-center shadow-sm">
                                                <div className={cn(glass.badge, "bg-[#1B9157] text-white border-none px-2 py-0.5 text-[8px] font-black tracking-widest")}>
                                                    ORDER_QUEUE
                                                </div>
                                                <p className="text-[10px] font-bold opacity-60 leading-tight uppercase tracking-tight">Lock-in early spring pricing<br/>(est. $35/ea)</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </motion.div>
                        )}

                        {activeSection === 'economy' && (
                            <motion.div
                                key="economy"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    {/* Margin Calculator */}
                                    <div className={cn(glass.card, "p-6 space-y-6 flex flex-col shadow-sm bg-white/50 backdrop-blur-xl rounded-3xl border-[#F4D03F]/10")}>
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <h3 className="text-xl font-black uppercase tracking-tight leading-none">Cost <span className="text-indigo-500">Baseline</span></h3>
                                                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest leading-none">Global Unit Economics</p>
                                            </div>
                                            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                                <Scale className="w-4 h-4 text-indigo-500" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 relative">
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[80%] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
                                            <div className="space-y-2 relative z-10">
                                                <label htmlFor="economy_labor_cost" className="text-[10px] font-black uppercase opacity-40 tracking-widest pl-1">Labor ($)</label>
                                                <input
                                                    id="economy_labor_cost"
                                                    name="economy_labor_cost"
                                                    type="number"
                                                    value={laborCost}
                                                    onChange={(e) => setLaborCost(Number(e.target.value))}
                                                    placeholder="e.g. 120"
                                                    title="Labor cost ($)"
                                                    aria-label="Labor cost ($)"
                                                    className={cn(glass.input, "w-full h-11 rounded-xl text-lg font-black font-mono px-4")}
                                                />
                                            </div>
                                            <div className="space-y-2 relative z-10">
                                                <label htmlFor="economy_fuel_cost" className="text-[10px] font-black uppercase opacity-40 tracking-widest pl-1">Fuel ($)</label>
                                                <input
                                                    id="economy_fuel_cost"
                                                    name="economy_fuel_cost"
                                                    type="number"
                                                    value={fuelCost}
                                                    onChange={(e) => setFuelCost(Number(e.target.value))}
                                                    placeholder="e.g. 45"
                                                    title="Fuel cost ($)"
                                                    aria-label="Fuel cost ($)"
                                                    className={cn(glass.input, "w-full h-11 rounded-xl text-lg font-black font-mono px-4")}
                                                />
                                            </div>
                                            <div className="space-y-2 relative z-10">
                                                <label htmlFor="economy_med_cost" className="text-[10px] font-black uppercase opacity-40 tracking-widest pl-1">Medical ($)</label>
                                                <input
                                                    id="economy_med_cost"
                                                    name="economy_med_cost"
                                                    type="number"
                                                    value={medCost}
                                                    onChange={(e) => setMedCost(Number(e.target.value))}
                                                    placeholder="e.g. 25"
                                                    title="Medical cost ($)"
                                                    aria-label="Medical cost ($)"
                                                    className={cn(glass.input, "w-full h-11 rounded-xl text-lg font-black font-mono px-4")}
                                                />
                                            </div>
                                            <div className="space-y-2 relative z-10">
                                                <label htmlFor="economy_equip_cost" className="text-[10px] font-black uppercase opacity-40 tracking-widest pl-1">Equip ($)</label>
                                                <input
                                                    id="economy_equip_cost"
                                                    name="economy_equip_cost"
                                                    type="number"
                                                    value={equipCost}
                                                    onChange={(e) => setEquipCost(Number(e.target.value))}
                                                    placeholder="e.g. 60"
                                                    title="Equipment cost ($)"
                                                    aria-label="Equipment cost ($)"
                                                    className={cn(glass.input, "w-full h-11 rounded-xl text-lg font-black font-mono px-4")}
                                                />
                                            </div>
                                        </div>
                                        <div className="p-6 rounded-2xl bg-indigo-500 border border-indigo-400 text-white flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm group relative overflow-hidden">
                                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                            <div>
                                                <p className="text-[8px] font-black uppercase opacity-60 tracking-widest mb-1">Break-Even Point</p>
                                                <p className="text-4xl font-black tabular-nums leading-none"><span className="text-xl opacity-60 mr-1">$</span>{marginResult.costPerKg} <span className="text-[10px] opacity-60 ml-1">/ KG</span></p>
                                            </div>
                                            <div className={cn(glass.badge, "bg-white/20 text-white border-none px-3 py-1 text-[8px] font-black tracking-widest backdrop-blur-md")}>
                                                TARGET: 40%
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hiking ROI */}
                                    <div className={cn(glass.card, "p-6 space-y-6 flex flex-col justify-between shadow-sm bg-white/50 backdrop-blur-xl rounded-3xl border-[#F4D03F]/10 overflow-hidden relative")}>
                                        <div className={cn("absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl pointer-events-none transition-colors duration-700",
                                            hikingROI.isWorthIt ? "bg-emerald-500/10" : "bg-red-500/10")} />
                                        <div className="flex justify-between items-start relative z-10">
                                            <div className="space-y-1">
                                                <h3 className="text-xl font-black uppercase tracking-tight leading-none">Expedition <span className="text-[#1B9157]">ROI</span></h3>
                                                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest leading-none">Yield Deployment Analysis</p>
                                            </div>
                                            <div className="w-8 h-8 rounded-xl bg-[#1B9157]/10 flex items-center justify-center">
                                                <TrendingUp className="w-4 h-4 text-[#1B9157]" />
                                            </div>
                                        </div>
                                        <div className="space-y-4 relative z-10">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label htmlFor="roi_hives" className="text-[10px] font-black uppercase opacity-40 tracking-widest pl-1">Hives</label>
                                                    <input
                                                        id="roi_hives"
                                                        name="roi_hives"
                                                        type="number"
                                                        value={hikingHives}
                                                        onChange={(e) => setHikingHives(Number(e.target.value))}
                                                        placeholder="e.g. 24"
                                                        title="Number of hives"
                                                        aria-label="Number of hives"
                                                        className={cn(glass.input, "w-full h-11 rounded-xl text-lg font-black font-mono px-4")}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label htmlFor="roi_transport_cost" className="text-[10px] font-black uppercase opacity-40 tracking-widest pl-1">Transport ($)</label>
                                                    <input
                                                        id="roi_transport_cost"
                                                        name="roi_transport_cost"
                                                        type="number"
                                                        value={hikingTransport}
                                                        onChange={(e) => setHikingTransport(Number(e.target.value))}
                                                        placeholder="e.g. 120"
                                                        title="Transport cost ($)"
                                                        aria-label="Transport cost ($)"
                                                        className={cn(glass.input, "w-full h-11 rounded-xl text-lg font-black font-mono px-4")}
                                                    />
                                                </div>
                                            </div>
                                            <div className={cn(
                                                "p-6 rounded-2xl border space-y-4 flex flex-col items-center justify-center shadow-inner transition-colors duration-500",
                                                hikingROI.isWorthIt ? "bg-emerald-500/5 border-emerald-500/10" : "bg-red-500/5 border-red-500/10"
                                            )}>
                                                <div className="flex flex-col items-center gap-2 text-center">
                                                    <p className={cn("text-3xl font-black tabular-nums leading-none tracking-tight",
                                                        hikingROI.isWorthIt ? "text-[#1B9157]" : "text-red-500"
                                                    )}>
                                                        {hikingROI.isWorthIt ? 'DEPLOY_HIVES' : 'ABORT_HIKE'}
                                                    </p>
                                                    <p className="text-[8px] font-black uppercase opacity-40 tracking-widest">Investment recommendation</p>
                                                </div>
                                                <div className="w-full flex justify-between items-center pt-4 border-t border-black/5">
                                                    <div className="space-y-1">
                                                        <span className="text-[8px] font-black uppercase opacity-40 tracking-widest">Net Profit</span>
                                                        <p className="text-lg font-black tabular-nums tracking-tighter"><span className="text-xs opacity-40 mr-1">$</span>{hikingROI.netProfit.toLocaleString()}</p>
                                                    </div>
                                                    <div className="space-y-1 text-right">
                                                        <span className="text-[8px] font-black uppercase opacity-40 tracking-widest">Per Hive</span>
                                                        <p className="text-lg font-black tabular-nums tracking-tighter text-foreground/70"><span className="text-xs opacity-40 mr-1">$</span>{hikingROI.profitPerHive.toFixed(0)}</p>
                                                    </div>
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
                            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full max-w-lg bg-background border-l border-border z-[101] shadow-2xl p-8 overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-10 border-b border-black/5 pb-6">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black uppercase tracking-tight leading-none">Math <span className="text-[#F4D03F]">Ledger</span></h2>
                                    <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">Historical Calculation Sync</p>
                                </div>
                                <button onClick={() => setShowHistory(false)} className="w-8 h-8 rounded-full bg-black/5 border border-black/5 flex items-center justify-center hover:bg-black/10 transition-colors">
                                    <span className="text-sm font-black opacity-40">✕</span>
                                </button>
                            </div>

                            {isLoadingHistory ? (
                                <div className="flex flex-col items-center justify-center py-32 gap-6">
                                    <Loader2 className="w-12 h-12 text-[#F4D03F] animate-spin" />
                                    <p className={cn(glass.microLabel, "animate-pulse")}>Syncing with Cloud...</p>
                                </div>
                            ) : historyLogs.length === 0 ? (
                                <div className="text-center py-32 space-y-6">
                                    <div className="w-20 h-20 rounded-full bg-border/20 flex items-center justify-center mx-auto">
                                        <History className="w-10 h-10 text-muted-foreground/50" />
                                    </div>
                                    <p className={cn(glass.microLabel, "normal-case italic font-semibold")}>No entries recorded in the cloud.</p>
                                </div>
                            ) : (
                                <div className="space-y-6 relative">
                                    <div className="absolute left-8 top-4 bottom-4 w-px bg-border/50 -z-10" />
                                    {historyLogs.map((log: any, idx) => (
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            key={log.id}
                                            className={cn(glass.card, "p-4 relative group overflow-hidden border-black/5 bg-white/50 backdrop-blur-xl rounded-2xl")}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={cn(glass.badge, "bg-[#F4D03F]/10 text-[#F4D03F] border-none px-2 py-0.5 text-[8px] font-black tracking-widest")}>
                                                    {log.calculation_type?.toUpperCase()}
                                                </div>
                                                <span className="text-[8px] font-black opacity-30 uppercase tracking-widest">
                                                    {new Date(log.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h4 className="text-sm font-black uppercase tracking-tight mb-4">
                                                {log.sub_type === 'snapshot' ? 'Manual Snapshot' : 'Auto-Log'}
                                            </h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="p-3 rounded-xl bg-muted/30 border border-black/5">
                                                    <p className="text-[8px] font-black uppercase opacity-40 tracking-widest mb-2">Inputs</p>
                                                    <div className="space-y-1">
                                                        {Object.entries(log.inputs || {}).slice(0, 3).map(([k, v]: any) => (
                                                            <p key={k} className="text-[9px] font-bold truncate leading-tight"><span className="opacity-40 uppercase mr-1">{k}:</span> {v}</p>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="p-3 rounded-xl bg-[#F4D03F]/5 border border-[#F4D03F]/10">
                                                    <p className="text-[8px] font-black uppercase text-[#F4D03F] tracking-widest mb-2">Results</p>
                                                    <div className="space-y-1">
                                                        {Object.values(log.results || {}).slice(0, 2).map((v: any, i) => (
                                                            <p key={i} className="text-[9px] font-bold truncate text-[#F4D03F] leading-tight"><span className="opacity-40 uppercase mr-1 text-foreground">Res:</span> {JSON.stringify(v)}</p>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <button className={cn(glass.btnSecondary, "w-full mt-4 h-8 justify-center opacity-0 translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 text-[10px] font-black uppercase tracking-tight rounded-xl")}>
                                                Restore State
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default BeeCalculatorPage;
