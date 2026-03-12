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
    Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBeekeepingMath } from '@/hooks/useBeekeepingMath';
import { beeyieldService, CalculatorLogCreateInput } from '@/services/beeyieldService';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { glass } from './GlassTheme';

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
                icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />
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
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className={cn(glass.page, "p-8 -m-8 space-y-12 pb-12 w-full max-w-[1600px] mx-auto min-h-screen")}>
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-border/50 pb-10">
                <div className="space-y-4">
                    <div className={cn(glass.badge, 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 mb-2')}>
                        <Calculator className="w-4 h-4 mr-2" />
                        BeeYield Precision Analytics v3.0
                    </div>
                    <h1 className={cn(glass.sectionTitle, 'text-6xl')}>
                        Op-Health <span className="text-honey">Calculator</span>
                    </h1>
                    <p className={cn(glass.microLabel, "normal-case italic font-semibold opacity-70")}>
                        Suite of Economic & Logistics Multi-Tools
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={fetchHistory}
                        className={cn(glass.btnSecondary, "h-14 px-8 border-border hover:border-foreground/30 font-bold justify-center min-w-[180px]")}
                    >
                        <History className="w-4 h-4 mr-2" />
                        Math Ledger
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={cn(glass.btnPrimary, "h-14 px-10 font-bold justify-center min-w-[180px]")}
                    >
                        {isSaving ? <span className="animate-spin mr-2">◷</span> : <Save className="w-4 h-4 mr-2" />}
                        Persist Data
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                {/* Section Navigation */}
                <div className="lg:col-span-1 space-y-4">
                    {[
                        { id: 'feeding', label: 'Feeding Management', icon: Droplet, count: 3, color: 'text-blue-500', bg: 'bg-blue-500' },
                        { id: 'health', label: 'Health & Prevention', icon: Zap, count: 2, color: 'text-emerald-500', bg: 'bg-emerald-500' },
                        { id: 'logistics', label: 'Apiary Logistics', icon: Package, count: 3, color: 'text-amber-500', bg: 'bg-amber-500' },
                        { id: 'economy', label: 'The Economy Suite', icon: TrendingUp, count: 2, color: 'text-indigo-500', bg: 'bg-indigo-500' }
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={cn(
                                glass.card,
                                "w-full p-6 flex flex-col gap-4 text-left transition-all duration-300 group hover:shadow-xl hover:border-border",
                                activeSection === item.id
                                    ? "bg-white/60 border-border shadow-xl ring-1 ring-foreground/5 scale-[1.02]"
                                    : "bg-white/20 border-transparent opacity-80"
                            )}
                        >
                            <div className="flex justify-between items-center w-full">
                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm transition-colors duration-300",
                                    activeSection === item.id ? "bg-background border-border" : "bg-white/40 border-border/50 group-hover:bg-background")}>
                                    <item.icon className={cn("w-6 h-6", activeSection === item.id ? item.color : "text-foreground/50 group-hover:text-foreground")} />
                                </div>
                                <div className={cn(glass.badge, "border-none !py-1 text-[10px]",
                                    activeSection === item.id ? `${item.bg}/10 ${item.color} font-bold` : "bg-transparent text-foreground/40")}>
                                    {item.count} TOOLS
                                </div>
                            </div>
                            <span className={cn(glass.sectionTitle, "text-xl normal-case mt-2", activeSection === item.id ? "text-foreground" : "text-foreground/70")}>{item.label}</span>
                        </button>
                    ))}

                    <div className={cn(glass.card, "mt-10 p-8 space-y-4 bg-honey/5 border-honey/20 relative overflow-hidden group")}>
                        <div className="absolute right-0 top-0 w-32 h-32 bg-honey/10 rounded-full blur-xl pointer-events-none group-hover:bg-honey/20 transition-colors" />
                        <div className="flex items-center gap-3 relative z-10">
                            <Info className="w-5 h-5 text-honey" />
                            <h4 className={cn(glass.microLabel, "font-bold text-honey")}>Cloud Sync</h4>
                        </div>
                        <p className={cn(glass.microLabel, "normal-case italic opacity-70 leading-relaxed font-semibold relative z-10")}>
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
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-10"
                            >
                                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Syrup Calculator */}
                                    <div className={cn(glass.card, "p-8 space-y-8 flex flex-col justify-between shadow-xl")}>
                                        <div className="flex justify-between items-start">
                                            <h3 className={cn(glass.sectionTitle, "text-2xl normal-case")}>Sugar Synergy <span className="text-blue-500">Syrup</span></h3>
                                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                <Droplet className="w-5 h-5 text-blue-500" />
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <label className={cn(glass.microLabel, "font-bold opacity-80 pl-1")}>Target Volume (L)</label>
                                                <input
                                                    type="number"
                                                    value={syrupVol}
                                                    onChange={(e) => setSyrupVol(Number(e.target.value))}
                                                    className={cn(glass.input, "w-full h-14 rounded-2xl text-xl font-bold font-mono")}
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className={cn(glass.microLabel, "font-bold opacity-80 pl-1")}>Concentration Ratio</label>
                                                <div className="grid grid-cols-2 gap-3 p-1 rounded-2xl bg-white/40 border border-border">
                                                    <button
                                                        onClick={() => setSyrupRatio('1:1')}
                                                        className={cn("h-12 rounded-xl text-sm font-bold transition-all duration-300",
                                                            syrupRatio === '1:1' ? "bg-background text-foreground shadow-sm ring-1 ring-border" : "text-foreground/50 hover:bg-white/60:bg-black/30")}
                                                    >
                                                        1:1 (Stimulation)
                                                    </button>
                                                    <button
                                                        onClick={() => setSyrupRatio('2:1')}
                                                        className={cn("h-12 rounded-xl text-sm font-bold transition-all duration-300",
                                                            syrupRatio === '2:1' ? "bg-background text-foreground shadow-sm ring-1 ring-border" : "text-foreground/50 hover:bg-white/60:bg-black/30")}
                                                    >
                                                        2:1 (Storage)
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6 pt-4">
                                            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center flex flex-col items-center justify-center h-32 relative overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent pointer-events-none" />
                                                <p className={cn(glass.sectionTitle, "text-4xl tabular-nums text-emerald-600")}>{syrupResult.sugarKg}</p>
                                                <p className={cn(glass.microLabel, "opacity-60 italic mt-2")}>Sugar (kg)</p>
                                            </div>
                                            <div className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center flex flex-col items-center justify-center h-32 relative overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent pointer-events-none" />
                                                <p className={cn(glass.sectionTitle, "text-4xl tabular-nums text-blue-600")}>{syrupResult.waterL}</p>
                                                <p className={cn(glass.microLabel, "opacity-60 italic mt-2")}>Water (L)</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Winter Ready Tool */}
                                    <div className={cn(glass.card, "p-8 space-y-8 flex flex-col justify-between shadow-xl relative overflow-hidden")}>
                                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-500/5 rounded-full blur-[60px] pointer-events-none" />
                                        <div className="flex justify-between items-start relative z-10">
                                            <h3 className={cn(glass.sectionTitle, "text-2xl normal-case")}>Winter Readiness</h3>
                                            <div className={cn(glass.badge, "bg-red-500/10 text-red-500 border-red-500/20 px-3 py-1 font-bold")}>CRITICAL_WEIGHT</div>
                                        </div>
                                        <div className="space-y-8 relative z-10">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <label className={cn(glass.microLabel, "font-bold opacity-80 pl-1")}>Current (kg)</label>
                                                    <input
                                                        type="number"
                                                        value={currentWeight}
                                                        onChange={(e) => setCurrentWeight(Number(e.target.value))}
                                                        className={cn(glass.input, "w-full h-14 rounded-2xl text-xl font-bold font-mono")}
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className={cn(glass.microLabel, "font-bold opacity-80 pl-1")}>Target (kg)</label>
                                                    <input
                                                        type="number"
                                                        value={targetWeight}
                                                        onChange={(e) => setTargetWeight(Number(e.target.value))}
                                                        className={cn(glass.input, "w-full h-14 rounded-2xl text-xl font-bold font-mono")}
                                                    />
                                                </div>
                                            </div>
                                            <div className="p-8 rounded-3xl bg-white/40 border border-border space-y-6">
                                                <div className="flex justify-between items-center">
                                                    <span className={cn(glass.microLabel, "font-bold")}>Weight Deficit</span>
                                                    <span className={cn(glass.sectionTitle, "text-3xl tabular-nums text-red-500")}>{winterResult.deficitKg} <span className="text-base italic opacity-50 ml-1">KG</span></span>
                                                </div>
                                                <div className="w-full h-px bg-border/50" />
                                                <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-6">
                                                    <div>
                                                        <p className={cn(glass.microLabel, "opacity-60 italic mb-2")}>Required 2:1 Syrup</p>
                                                        <p className={cn(glass.sectionTitle, "text-4xl tabular-nums text-emerald-500")}>{winterResult.syrupNeededL} <span className="text-lg italic opacity-50 ml-1">L</span></p>
                                                    </div>
                                                    <button className={cn(glass.btnPrimary, "h-12 px-6 shadow-md hover:shadow-lg whitespace-nowrap w-full sm:w-auto")}>Order Feed</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <div className={cn(glass.card, "p-10 bg-gradient-to-br from-honey/10 to-transparent border-honey/20 flex flex-col md:flex-row items-center gap-10")}>
                                    <div className="w-24 h-24 rounded-[2rem] bg-white/60 border border-border shadow-xl flex items-center justify-center shrink-0 -rotate-6 hover:rotate-0 transition-transform duration-500 relative">
                                        <div className="absolute inset-0 bg-honey/10 rounded-[2rem] animate-pulse" />
                                        <TrendingUp className="w-10 h-10 text-honey relative z-10" />
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className={cn(glass.sectionTitle, "text-3xl normal-case text-foreground")}>Pro Tip: Storage Ratios</h4>
                                        <p className="text-sm italic font-medium opacity-80 leading-relaxed max-w-4xl text-foreground">
                                            For winter stores, always use 2:1 syrup. This reduces the energy expenditure required for bees to evaporate excess water, increasing survival rates in low-temp zones.
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
                                className="space-y-10"
                            >
                                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Varroa Wash Interpreter */}
                                    <div className={cn(glass.card, "p-8 space-y-8 flex flex-col justify-between shadow-xl relative overflow-hidden group")}>
                                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none transition-colors duration-500"
                                            style={{ backgroundColor: varroaResult.status === 'safe' ? 'rgba(16,185,129,0.05)' : varroaResult.status === 'warning' ? 'rgba(245,158,11,0.05)' : 'rgba(239,68,68,0.05)' }} />

                                        <div className="flex justify-between items-start relative z-10">
                                            <h3 className={cn(glass.sectionTitle, "text-2xl normal-case")}>Varroa Wash Interpreter</h3>
                                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                                <Zap className="w-5 h-5 text-emerald-500" />
                                            </div>
                                        </div>
                                        <div className="space-y-8 relative z-10">
                                            <div className="space-y-3">
                                                <label className={cn(glass.microLabel, "font-bold opacity-80 pl-1")}>Total Mites Found (300 Bees)</label>
                                                <input
                                                    type="number"
                                                    value={miteCount}
                                                    onChange={(e) => setMiteCount(Number(e.target.value))}
                                                    className={cn(glass.input, "w-full h-14 rounded-2xl text-xl font-bold font-mono text-center")}
                                                />
                                            </div>
                                            <div className={cn(
                                                "p-10 rounded-[2rem] border text-center space-y-4 flex flex-col items-center justify-center shadow-inner transition-colors duration-500 relative overflow-hidden",
                                                varroaResult.status === 'safe' ? "bg-emerald-500/10 border-emerald-500/20" :
                                                    varroaResult.status === 'warning' ? "bg-amber-500/10 border-amber-500/20" : "bg-red-500/10 border-red-500/20"
                                            )}>
                                                <p className={cn(glass.sectionTitle, "text-7xl tabular-nums leading-none tracking-tighter m-0",
                                                    varroaResult.status === 'safe' ? "text-emerald-600" :
                                                        varroaResult.status === 'warning' ? "text-amber-600" : "text-red-500"
                                                )}>{varroaResult.percentage}%</p>
                                                <p className={cn(glass.microLabel, "opacity-60 italic mb-2")}>Current Infestation Rate</p>
                                                <div className={cn(
                                                    glass.badge, "font-bold px-4 py-1 mt-4 shadow-sm",
                                                    varroaResult.status === 'safe' ? "bg-emerald-500 text-white border-transparent" :
                                                        varroaResult.status === 'warning' ? "bg-amber-500 text-gray-900 border-transparent" : "bg-red-500 text-gray-900 border-transparent"
                                                )}>
                                                    {varroaResult.status.toUpperCase()}_ZONE
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Treatment Window Optimizer */}
                                    <div className={cn(glass.card, "p-8 space-y-8 flex flex-col shadow-xl relative overflow-hidden")}>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

                                        <div className="flex justify-between items-start relative z-10">
                                            <h3 className={cn(glass.sectionTitle, "text-2xl normal-case")}>Treatment Thresholds</h3>
                                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                <Thermometer className="w-5 h-5 text-blue-500" />
                                            </div>
                                        </div>
                                        <div className="space-y-8 relative z-10 flex-1 flex flex-col justify-end">
                                            <div className="space-y-4 p-8 rounded-3xl bg-white/40 border border-border">
                                                <label className={cn(glass.microLabel, "font-bold opacity-80")}>Local Ambient Temp (℃)</label>
                                                <div className="flex items-center gap-6">
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="40"
                                                        value={temp}
                                                        onChange={(e) => setTemp(Number(e.target.value))}
                                                        className="flex-1 h-2 bg-gray-50 appearance-none rounded-full cursor-pointer accent-foreground/80 hover:accent-foreground transition-all"
                                                    />
                                                    <span className={cn(glass.sectionTitle, "text-3xl tabular-nums min-w-[3.5rem] text-right")}>{temp}℃</span>
                                                </div>
                                            </div>

                                            <div className="space-y-5">
                                                <p className={cn(glass.microLabel, "font-bold opacity-80")}>Product Compatibility Index</p>
                                                <div className="space-y-3">
                                                    {[
                                                        { name: 'Formic Pro (MAQS)', max: 30, risk: temp > 30 },
                                                        { name: 'Apivar (Amitraz)', max: 40, risk: temp > 40 },
                                                        { name: 'Oxalic Vapor', max: 25, risk: temp > 25 }
                                                    ].map((p) => (
                                                        <div key={p.name} className="flex justify-between items-center p-4 rounded-2xl bg-white/30 border border-border/50 hover:bg-white/50:bg-black/30 transition-colors">
                                                            <span className={cn(glass.microLabel, "font-bold text-sm")}>{p.name}</span>
                                                            <div className={cn(
                                                                glass.badge, "border-transparent px-3 py-1 font-bold shadow-sm",
                                                                p.risk ? "bg-red-500 text-gray-900" : "bg-emerald-500 text-white"
                                                            )}>
                                                                {p.risk ? 'RISK: BROOD LOSS' : 'SAFE: OPTIMAL'}
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
                                className="space-y-10"
                            >
                                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* BOM Calculator */}
                                    <div className={cn(glass.card, "p-8 space-y-8 flex flex-col shadow-xl")}>
                                        <div className="flex justify-between items-start">
                                            <h3 className={cn(glass.sectionTitle, "text-2xl normal-case")}>Equipment BOM</h3>
                                            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                                                <Package className="w-5 h-5 text-amber-500" />
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <label className={cn(glass.microLabel, "font-bold opacity-80 pl-1")}>Target Colony Count</label>
                                                <input
                                                    type="number"
                                                    value={colonyCount}
                                                    onChange={(e) => setColonyCount(Number(e.target.value))}
                                                    className={cn(glass.input, "w-full h-14 rounded-2xl text-xl font-bold font-mono")}
                                                />
                                            </div>
                                            <div className="space-y-3 pt-2">
                                                {[
                                                    { label: 'Deep Brood Boxes', val: bomResult.deepBoxes },
                                                    { label: 'Honey Supers', val: bomResult.supers },
                                                    { label: 'Frames (Wired)', val: bomResult.totalFrames },
                                                    { label: 'Wax Foundations', val: bomResult.foundations }
                                                ].map((item) => (
                                                    <div key={item.label} className="flex justify-between items-center p-5 rounded-2xl bg-white/40 border border-border hover:shadow-sm transition-shadow">
                                                        <span className={cn(glass.microLabel, "font-bold italic opacity-80")}>{item.label}</span>
                                                        <span className={cn(glass.sectionTitle, "text-2xl tabular-nums")}>{item.val}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Harvest Package Estimaor */}
                                    <div className={cn(glass.card, "p-8 space-y-8 flex flex-col justify-between shadow-xl")}>
                                        <div className="flex justify-between items-start">
                                            <h3 className={cn(glass.sectionTitle, "text-2xl normal-case")}>Jar & Label Estimator</h3>
                                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                                <Tag className="w-5 h-5 text-emerald-500" />
                                            </div>
                                        </div>
                                        <div className="space-y-8">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <label className={cn(glass.microLabel, "font-bold opacity-80 pl-1")}>Honey Yield (kg)</label>
                                                    <input
                                                        type="number"
                                                        value={honeyKg}
                                                        onChange={(e) => setHoneyKg(Number(e.target.value))}
                                                        className={cn(glass.input, "w-full h-14 rounded-2xl text-xl font-bold font-mono")}
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className={cn(glass.microLabel, "font-bold opacity-80 pl-1")}>Jar Size (ml)</label>
                                                    <select
                                                        value={jarSize}
                                                        onChange={(e) => setJarSize(Number(e.target.value))}
                                                        className={cn(glass.input, "w-full h-14 rounded-2xl font-bold font-mono py-0 pl-5 pr-10 appearance-none")}
                                                    >
                                                        <option value={250}>250 ML / 350G</option>
                                                        <option value={500}>500 ML / 700G</option>
                                                        <option value={1000}>1000 ML / 1.4KG</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="p-8 rounded-3xl bg-honey border shadow-sm border-honey flex flex-col items-center justify-center text-center relative overflow-hidden text-white group">
                                                    <div className="absolute inset-0 bg-white/10 scale-0 group-hover:scale-110 transition-transform duration-500 rounded-full blur-xl pointer-events-none" />
                                                    <p className={cn(glass.sectionTitle, "text-5xl tabular-nums text-gray-900")}>{harvestResult.jars}</p>
                                                    <p className={cn(glass.microLabel, "italic opacity-80 mt-2 text-gray-900")}>Jars Needed</p>
                                                </div>
                                                <div className="p-8 rounded-3xl bg-white/40 border border-border flex flex-col items-center justify-center text-center">
                                                    <p className={cn(glass.sectionTitle, "text-5xl tabular-nums")}>{harvestResult.labels}</p>
                                                    <p className={cn(glass.microLabel, "italic opacity-60 mt-2")}>Labels <span className="text-[9px]">(inc. 5% ext)</span></p>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleShare('Harvest Logistics')}
                                            className={cn(glass.btnPrimary, "w-full h-14 justify-center mt-4")}
                                        >
                                            <Share2 className="w-4 h-4 mr-2" />
                                            Share BOM With Team
                                        </button>
                                    </div>
                                </section>

                                {/* Queen Replacement Tool */}
                                <section className={cn(glass.card, "p-10 space-y-10 shadow-xl overflow-hidden relative group")}>
                                    <div className="absolute top-0 right-0 w-96 h-96 bg-honey/5 rounded-full blur-[80px] pointer-events-none -mr-20 -mt-40 transition-transform group-hover:scale-110 group-hover:bg-honey/10 duration-700" />
                                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 relative z-10">
                                        <div className="space-y-2">
                                            <h3 className={cn(glass.sectionTitle, "text-3xl normal-case")}>Queen Replacement Logic</h3>
                                            <p className={cn(glass.microLabel, "italic opacity-70")}>Automated Nuc & Queen Procurement Estimator</p>
                                        </div>
                                        <div className="w-16 h-16 rounded-3xl bg-honey/10 flex items-center justify-center shadow-inner border border-honey/20">
                                            <Award className="w-8 h-8 text-honey" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-center relative z-10">
                                        <div className="space-y-8">
                                            <div className="space-y-3">
                                                <label className={cn(glass.microLabel, "font-bold opacity-80 pl-1")}>Total Apiary Size</label>
                                                <input type="number" value={totalColonies} onChange={(e) => setTotalColonies(Number(e.target.value))} className={cn(glass.input, "w-full h-14 rounded-2xl text-xl font-bold font-mono")} />
                                            </div>
                                            <div className="space-y-4">
                                                <label className={cn(glass.microLabel, "font-bold opacity-80 pl-1")}>Annual Turnover Rate (%)</label>
                                                <div className="flex items-center gap-6 p-4 rounded-2xl bg-white/40 border border-border">
                                                    <input type="range" min="5" max="50" step="5" value={replacementRate} onChange={(e) => setReplacementRate(Number(e.target.value))} className="flex-1 h-2 bg-gray-50 appearance-none rounded-full cursor-pointer accent-foreground/80 hover:accent-foreground transition-all" />
                                                    <span className={cn(glass.sectionTitle, "text-2xl tabular-nums min-w-[3rem] text-right")}>{replacementRate}%</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="lg:col-span-2 flex flex-col sm:flex-row gap-6">
                                            <div className="flex-1 p-10 rounded-3xl bg-white/60 border border-border flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                                                <p className={cn(glass.sectionTitle, "text-7xl tabular-nums text-foreground relative z-10")}>{queensNeeded}</p>
                                                <p className={cn(glass.microLabel, "opacity-60 italic mt-4 relative z-10")}>Mated Queens Required</p>
                                            </div>
                                            <div className="sm:w-64 p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 flex flex-col justify-center items-center gap-6 text-center shadow-inner">
                                                <div className={cn(glass.badge, "bg-emerald-500 text-white border-transparent px-4 py-1.5 shadow-md flex items-center gap-2")}>
                                                    <Zap className="w-3 h-3" /> ORDER_QUEUE
                                                </div>
                                                <p className="text-sm font-semibold opacity-80 leading-relaxed italic">Lock-in early spring pricing (est. $35/ea)</p>
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
                                className="space-y-10"
                            >
                                <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                    {/* Margin Calculator */}
                                    <div className={cn(glass.card, "p-8 space-y-8 flex flex-col shadow-xl")}>
                                        <div className="flex justify-between items-start">
                                            <h3 className={cn(glass.sectionTitle, "text-2xl normal-case")}>Global Cost Baseline <span className="opacity-50 ml-2 text-lg">/ 1KG</span></h3>
                                            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                                                <Scale className="w-5 h-5 text-indigo-500" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6 relative">
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[80%] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
                                            <div className="space-y-3 relative z-10">
                                                <label className={cn(glass.microLabel, "font-bold opacity-80 pl-1")}>Labor ($)</label>
                                                <input type="number" value={laborCost} onChange={(e) => setLaborCost(Number(e.target.value))} className={cn(glass.input, "w-full h-14 rounded-2xl text-xl font-bold font-mono")} />
                                            </div>
                                            <div className="space-y-3 relative z-10">
                                                <label className={cn(glass.microLabel, "font-bold opacity-80 pl-1")}>Fuel/Logistics ($)</label>
                                                <input type="number" value={fuelCost} onChange={(e) => setFuelCost(Number(e.target.value))} className={cn(glass.input, "w-full h-14 rounded-2xl text-xl font-bold font-mono")} />
                                            </div>
                                            <div className="space-y-3 relative z-10">
                                                <label className={cn(glass.microLabel, "font-bold opacity-80 pl-1")}>Medicine ($)</label>
                                                <input type="number" value={medCost} onChange={(e) => setMedCost(Number(e.target.value))} className={cn(glass.input, "w-full h-14 rounded-2xl text-xl font-bold font-mono")} />
                                            </div>
                                            <div className="space-y-3 relative z-10">
                                                <label className={cn(glass.microLabel, "font-bold opacity-80 pl-1")}>Equip/Depr ($)</label>
                                                <input type="number" value={equipCost} onChange={(e) => setEquipCost(Number(e.target.value))} className={cn(glass.input, "w-full h-14 rounded-2xl text-xl font-bold font-mono")} />
                                            </div>
                                        </div>
                                        <div className="p-8 rounded-3xl bg-indigo-500 border border-indigo-400 text-gray-900 flex flex-col sm:flex-row justify-between items-center gap-6 shadow-lg shadow-indigo-500/20 group relative overflow-hidden">
                                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                            <div>
                                                <p className={cn(glass.microLabel, "italic opacity-80 mb-2 text-gray-900")}>Break-Even Point</p>
                                                <p className={cn(glass.sectionTitle, "text-5xl tabular-nums text-gray-900")}><span className="opacity-70 mr-1">$</span>{marginResult.costPerKg} <span className="text-xl italic opacity-60 ml-1">/ KG</span></p>
                                            </div>
                                            <div className={cn(glass.badge, "bg-white/20 text-gray-900 border-transparent px-4 py-2 font-bold backdrop-blur-md self-start sm:self-center")}>
                                                Target Profit: 40%
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hiking ROI */}
                                    <div className={cn(glass.card, "p-8 space-y-8 flex flex-col justify-between shadow-xl relative overflow-hidden")}>
                                        <div className={cn("absolute -top-10 -right-10 w-48 h-48 rounded-full blur-[50px] pointer-events-none transition-colors duration-700",
                                            hikingROI.isWorthIt ? "bg-emerald-500/10" : "bg-red-500/10")} />
                                        <div className="flex justify-between items-start relative z-10">
                                            <h3 className={cn(glass.sectionTitle, "text-2xl normal-case")}>Expedition ROI</h3>
                                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                                <TrendingUp className="w-5 h-5 text-emerald-500" />
                                            </div>
                                        </div>
                                        <div className="space-y-8 relative z-10">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <label className={cn(glass.microLabel, "font-bold opacity-80 pl-1")}>Number of Hives</label>
                                                    <input type="number" value={hikingHives} onChange={(e) => setHikingHives(Number(e.target.value))} className={cn(glass.input, "w-full h-14 rounded-2xl text-xl font-bold font-mono")} />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className={cn(glass.microLabel, "font-bold opacity-80 pl-1")}>Transport Costs ($)</label>
                                                    <input type="number" value={hikingTransport} onChange={(e) => setHikingTransport(Number(e.target.value))} className={cn(glass.input, "w-full h-14 rounded-2xl text-xl font-bold font-mono")} />
                                                </div>
                                            </div>
                                            <div className={cn(
                                                "p-8 rounded-3xl border space-y-6 flex flex-col items-center justify-center shadow-inner transition-colors duration-500",
                                                hikingROI.isWorthIt ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"
                                            )}>
                                                <div className="flex flex-col items-center gap-4 text-center">
                                                    <div className={cn("w-14 h-14 rounded-full flex items-center justify-center border shadow-sm",
                                                        hikingROI.isWorthIt ? "bg-white/60 border-emerald-500/30 text-emerald-500" : "bg-white/60 border-red-500/30 text-red-500"
                                                    )}>
                                                        {hikingROI.isWorthIt ? <CheckCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
                                                    </div>
                                                    <p className={cn(glass.sectionTitle, "text-4xl tabular-nums leading-none tracking-tight",
                                                        hikingROI.isWorthIt ? "text-emerald-600" : "text-red-500"
                                                    )}>
                                                        {hikingROI.isWorthIt ? 'Deploy Hives' : 'Abort Hike'}
                                                    </p>
                                                </div>
                                                <div className="w-full flex justify-between items-center pt-6 border-t border-border/50">
                                                    <div className="space-y-1">
                                                        <span className={cn(glass.microLabel, "opacity-60 italic")}>Net Profit</span>
                                                        <p className={cn(glass.sectionTitle, "text-xl tabular-nums")}><span className="opacity-50 mr-1">$</span>{hikingROI.netProfit.toLocaleString()}</p>
                                                    </div>
                                                    <div className="space-y-1 text-right">
                                                        <span className={cn(glass.microLabel, "opacity-60 italic")}>Per Hive</span>
                                                        <p className={cn(glass.sectionTitle, "text-xl tabular-nums text-foreground/70")}><span className="opacity-50 mr-1">$</span>{hikingROI.profitPerHive.toFixed(0)}</p>
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
                            <div className="flex justify-between items-center mb-10 border-b border-border/50 pb-6">
                                <h2 className={cn(glass.sectionTitle, "text-3xl normal-case")}>Math <span className="text-honey">Ledger</span></h2>
                                <button onClick={() => setShowHistory(false)} className="w-10 h-10 rounded-full bg-white/10 border border-border flex items-center justify-center hover:bg-white/20:bg-gray-100 transition-colors">
                                    <span className={cn(glass.microLabel, "font-bold")}>✕</span>
                                </button>
                            </div>

                            {isLoadingHistory ? (
                                <div className="flex flex-col items-center justify-center py-32 gap-6">
                                    <Loader2 className="w-12 h-12 text-honey animate-spin" />
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
                                            className={cn(glass.card, "p-6 relative group overflow-hidden border-border/50")}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
                                            <div className="flex justify-between items-start mb-6">
                                                <div className={cn(glass.badge, "bg-honey/10 text-honey border-honey/20")}>
                                                    {log.calculation_type}
                                                </div>
                                                <span className={cn(glass.microLabel, "opacity-60")}>
                                                    {new Date(log.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h4 className={cn(glass.sectionTitle, "text-lg normal-case mb-6")}>
                                                {log.sub_type === 'snapshot' ? 'Manual Snapshot' : 'Auto-Log'}
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-5 rounded-2xl bg-white/40 border border-border shadow-inner">
                                                    <p className={cn(glass.microLabel, "opacity-60 mb-3 italic font-semibold")}>Inputs</p>
                                                    <div className="space-y-2">
                                                        {Object.entries(log.inputs || {}).slice(0, 3).map(([k, v]: any) => (
                                                            <p key={k} className={cn(glass.microLabel, "normal-case font-bold truncate")}><span className="opacity-50 font-normal mr-1">{k}:</span> {v}</p>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="p-5 rounded-2xl bg-honey/5 border border-honey/20 shadow-inner">
                                                    <p className={cn(glass.microLabel, "text-honey mb-3 italic font-semibold")}>Key Results</p>
                                                    <div className="space-y-2">
                                                        {Object.values(log.results || {}).slice(0, 2).map((v: any, i) => (
                                                            <p key={i} className={cn(glass.microLabel, "normal-case font-bold truncate text-honey")}><span className="opacity-50 font-normal mr-1 text-foreground">Res:</span> {JSON.stringify(v)}</p>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <button className={cn(glass.btnSecondary, "w-full mt-6 justify-center opacity-0 translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300")}>
                                                Restore This State
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
