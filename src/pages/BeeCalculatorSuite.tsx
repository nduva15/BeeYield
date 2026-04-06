import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Droplet, Flame, Wallet, History, ArrowUpRight, Zap, Activity, TrendingUp, Flower2, Truck, ShieldCheck, Gauge } from 'lucide-react';
import { glass } from '@/components/beeyield/GlassTheme';
import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
import { cn } from '@/lib/utils';
import VarroaWashInterpreter from '@/components/calculators/VarroaWashInterpreter';
import { calculateHealthyHiveIndex, calculatePollinationMetrics, HealthyHiveInputs } from '@/lib/pollinationCalculations';

type FeedRatio = '1:1' | '2:1';

const NumberField = ({ label, value, min, max, step = 1, suffix, onChange }: { label: string; value: number; min?: number; max?: number; step?: number; suffix?: string; onChange: (value: number) => void }) => (
    <label className="space-y-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</span>
        <div className="rounded-2xl border border-gray-100 bg-[#F9F7F2] px-4 py-3">
            <div className="flex items-center justify-between gap-3">
                <input type="number" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} className="w-full bg-transparent text-lg font-black text-[#1A1A1A] outline-none" />
                {suffix && <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{suffix}</span>}
            </div>
        </div>
    </label>
);

const RangeField = ({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) => (
    <label className="space-y-3">
        <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</span>
            <span className="text-[10px] font-black text-[#1B9157]">{Math.round(value * 100)}%</span>
        </div>
        <input type="range" min="0.2" max="1" step="0.05" value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full accent-[#1B9157]" />
    </label>
);

const BeeCalculatorSuite = () => {
    const [feedRatio, setFeedRatio] = React.useState<FeedRatio>('1:1');
    const [feedColonies, setFeedColonies] = React.useState(24);
    const [feedDays, setFeedDays] = React.useState(10);
    const [dailyFeedLiters, setDailyFeedLiters] = React.useState(0.75);
    const [proteinGrams, setProteinGrams] = React.useState(180);

    const [economicAcres, setEconomicAcres] = React.useState(180);
    const [economicHives, setEconomicHives] = React.useState(24);
    const [economicFrames, setEconomicFrames] = React.useState(9);
    const [targetFpa, setTargetFpa] = React.useState(10);
    const [contractPrice, setContractPrice] = React.useState(185);
    const [cropValuePerAcre, setCropValuePerAcre] = React.useState(1450);
    const [bloomIntensity, setBloomIntensity] = React.useState(0.92);
    const [forageCondition, setForageCondition] = React.useState(0.88);
    const [weatherRisk, setWeatherRisk] = React.useState(0.22);

    const [healthInputs, setHealthInputs] = React.useState<HealthyHiveInputs>({
        colonyFrames: 11,
        broodFrames: 5,
        queenPresenceScore: 0.95,
        weeklyFlightHours: 39,
        weatherQuality: 0.84,
        orientation: 'east',
    });

    const [hivesPerPallet, setHivesPerPallet] = React.useState(4);
    const [deploymentSpeed, setDeploymentSpeed] = React.useState(18);
    const [laneTurns, setLaneTurns] = React.useState(12);
    const [siteSpacingMeters, setSiteSpacingMeters] = React.useState(220);

    const economicMetrics = React.useMemo(() => calculatePollinationMetrics({
        totalAcres: economicAcres,
        targetFpa,
        averageFramesPerHive: economicFrames,
        bloomIntensity,
        forageCondition,
        weatherRisk,
        hives: Array.from({ length: economicHives }).map(() => ({ frameCount: economicFrames, isStrong: true, isLarge: economicFrames >= 10 })),
    }), [bloomIntensity, economicAcres, economicFrames, economicHives, forageCondition, targetFpa, weatherRisk]);

    const healthyHiveMetrics = React.useMemo(() => calculateHealthyHiveIndex(healthInputs), [healthInputs]);

    const syrupLiters = React.useMemo(() => Number((feedColonies * feedDays * dailyFeedLiters).toFixed(1)), [dailyFeedLiters, feedColonies, feedDays]);
    const sugarKg = React.useMemo(() => Number((syrupLiters * (feedRatio === '1:1' ? 0.8 : 1.33)).toFixed(1)), [feedRatio, syrupLiters]);
    const proteinPattiesKg = React.useMemo(() => Number(((feedColonies * proteinGrams) / 1000).toFixed(1)), [feedColonies, proteinGrams]);
    const projectedPollinationRevenue = React.useMemo(() => Number((economicAcres * cropValuePerAcre * (economicMetrics.projectedYieldLiftPercent / 100)).toFixed(0)), [cropValuePerAcre, economicAcres, economicMetrics.projectedYieldLiftPercent]);
    const deploymentCost = React.useMemo(() => Number((economicHives * contractPrice).toFixed(0)), [contractPrice, economicHives]);
    const projectedRoi = React.useMemo(() => deploymentCost ? Number((((projectedPollinationRevenue - deploymentCost) / deploymentCost) * 100).toFixed(1)) : 0, [deploymentCost, projectedPollinationRevenue]);
    const palletsRequired = React.useMemo(() => Math.max(1, Math.ceil(economicMetrics.hivesRequired / Math.max(hivesPerPallet, 1))), [economicMetrics.hivesRequired, hivesPerPallet]);
    const routeDistanceKm = React.useMemo(() => Number(((palletsRequired * laneTurns * siteSpacingMeters) / 1000).toFixed(1)), [laneTurns, palletsRequired, siteSpacingMeters]);
    const fieldHours = React.useMemo(() => Number((routeDistanceKm / Math.max(deploymentSpeed, 1)).toFixed(1)), [deploymentSpeed, routeDistanceKm]);
    const overlapRisk = React.useMemo(() => Math.max(0, Math.round((siteSpacingMeters < 180 ? 28 : siteSpacingMeters < 220 ? 16 : 8) + (economicMetrics.saturationRisk === 'high' ? 12 : 0))), [economicMetrics.saturationRisk, siteSpacingMeters]);

    return (
        <BeeYieldPageShell className="space-y-6">
            <BeeYieldPageHeader
                icon={Calculator}
                label="Universal Calculator Suite"
                title={<>Precision <span className="text-[#F4D03F]">Forecasting</span></>}
                subtitle="Feeding math | Weather-normalized pollination | Deployment calculus"
                actions={<Button className={cn(glass.btnSecondary, 'h-9 text-[10px]')} aria-label="Open audit history" title="Audit history"><History className="w-3.5 h-3.5" />Audit History</Button>}
            />

            <Tabs defaultValue="economic" className="w-full">
                <TabsList className="w-full h-11 p-1 bg-[#F4D03F]/5 border border-[#F4D03F]/10 rounded-xl flex gap-1 mb-8 overflow-x-auto">
                    {[
                        { id: 'feeding', label: 'Nutritional', icon: Droplet },
                        { id: 'health', label: 'Treatment', icon: Flame },
                        { id: 'economic', label: 'Economic ROI', icon: Wallet },
                        { id: 'logistics', label: 'Deployment', icon: Zap },
                    ].map((tab) => (
                        <TabsTrigger key={tab.id} value={tab.id} className="flex-1 h-full rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#F4D03F] data-[state=active]:shadow-sm text-[10px] font-black text-gray-400 transition-all flex items-center gap-2">
                            <tab.icon className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="economic" className="mt-0 space-y-6">
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                        <Card className={cn(glass.card, 'xl:col-span-5 bg-white/50 border-[#F4D03F]/10')}>
                            <CardHeader className="border-b border-[#F4D03F]/10"><CardTitle className="text-sm font-black text-[#1A1A1A]">Pollination contract optimizer</CardTitle></CardHeader>
                            <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <NumberField label="Orchard size" value={economicAcres} min={10} step={5} suffix="ac" onChange={setEconomicAcres} />
                                <NumberField label="Colonies deployed" value={economicHives} min={1} step={1} suffix="hives" onChange={setEconomicHives} />
                                <NumberField label="Average frames per hive" value={economicFrames} min={5} max={16} step={1} suffix="frames" onChange={setEconomicFrames} />
                                <NumberField label="Target frames per acre" value={targetFpa} min={4} max={16} step={1} suffix="fpa" onChange={setTargetFpa} />
                                <NumberField label="Contract price per hive" value={contractPrice} min={80} step={5} suffix="usd" onChange={setContractPrice} />
                                <NumberField label="Crop value per acre" value={cropValuePerAcre} min={100} step={50} suffix="usd" onChange={setCropValuePerAcre} />
                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                    <RangeField label="Bloom intensity" value={bloomIntensity} onChange={setBloomIntensity} />
                                    <RangeField label="Forage condition" value={forageCondition} onChange={setForageCondition} />
                                    <RangeField label="Weather confidence" value={1 - weatherRisk} onChange={(value) => setWeatherRisk(Number((1 - value).toFixed(2)))} />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="xl:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { label: 'Readiness score', value: `${economicMetrics.readinessScore}%`, icon: ShieldCheck, tone: 'text-[#1B9157]' },
                                { label: 'Effective FPA', value: economicMetrics.effectiveFPA.toString(), icon: Activity, tone: 'text-[#F4D03F]' },
                                { label: 'Coverage gap', value: `${economicMetrics.coverageGapHives} hives`, icon: Flower2, tone: 'text-amber-600' },
                                { label: 'Marginal gain per hive', value: `${economicMetrics.marginalGainPerHive} FPA`, icon: Gauge, tone: 'text-sky-600' },
                            ].map((item) => (
                                <Card key={item.label} className={cn(glass.card, 'bg-white/50 border-[#F4D03F]/10')}>
                                    <CardContent className="p-5 space-y-3">
                                        <div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{item.label}</span><item.icon className={cn('w-4 h-4', item.tone)} /></div>
                                        <p className={cn('text-3xl font-black tracking-tighter', item.tone)}>{item.value}</p>
                                    </CardContent>
                                </Card>
                            ))}

                            <Card className={cn(glass.card, 'md:col-span-2 bg-[#1A1A1A] border-transparent text-white')}>
                                <CardContent className="p-6 space-y-5">
                                    <div className="flex items-center justify-between">
                                        <div><p className="text-[10px] font-black uppercase tracking-widest text-[#F4D03F]">Projected season upside</p><h3 className="text-2xl font-black tracking-tight mt-2">${projectedPollinationRevenue.toLocaleString()}</h3></div>
                                        <Badge className="bg-white/10 text-white border border-white/10">ROI {projectedRoi}%</Badge>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[
                                            { label: 'Fruit set forecast', value: `${economicMetrics.predictedFruitSetPercent}%` },
                                            { label: 'Yield lift', value: `${economicMetrics.projectedYieldLiftPercent}%` },
                                            { label: 'Flight hours normalized', value: `${economicMetrics.normalizedFlightHours} h` },
                                        ].map((item) => <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-[9px] font-black uppercase tracking-widest text-white/50">{item.label}</p><p className="mt-2 text-xl font-black">{item.value}</p></div>)}
                                    </div>
                                    <div className="rounded-2xl border border-[#F4D03F]/20 bg-[#F4D03F]/10 p-4 space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#F4D03F]">Recommendation</p>
                                        <p className="text-sm font-semibold leading-relaxed">{economicMetrics.recommendation}</p>
                                        <p className="text-[11px] text-white/70">Recommended contract band: {economicMetrics.recommendedHivesLow}-{economicMetrics.recommendedHivesHigh} hives.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="health" className="mt-0 space-y-6">
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                        <Card className={cn(glass.card, 'xl:col-span-5 bg-white/50 border-[#F4D03F]/10')}>
                            <CardHeader className="border-b border-[#F4D03F]/10"><CardTitle className="text-sm font-black text-[#1A1A1A]">Weather-normalized hive readiness</CardTitle></CardHeader>
                            <CardContent className="p-5 space-y-4">
                                <NumberField label="Populated frames" value={healthInputs.colonyFrames} min={3} max={16} step={1} suffix="frames" onChange={(value) => setHealthInputs((prev) => ({ ...prev, colonyFrames: value }))} />
                                <NumberField label="Brood frames" value={healthInputs.broodFrames} min={1} max={8} step={1} suffix="frames" onChange={(value) => setHealthInputs((prev) => ({ ...prev, broodFrames: value }))} />
                                <NumberField label="Weekly flight hours" value={healthInputs.weeklyFlightHours} min={8} max={60} step={1} suffix="hours" onChange={(value) => setHealthInputs((prev) => ({ ...prev, weeklyFlightHours: value }))} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <RangeField label="Queen certainty" value={healthInputs.queenPresenceScore} onChange={(value) => setHealthInputs((prev) => ({ ...prev, queenPresenceScore: value }))} />
                                    <RangeField label="Weather quality" value={healthInputs.weatherQuality} onChange={(value) => setHealthInputs((prev) => ({ ...prev, weatherQuality: value }))} />
                                </div>
                                <label className="space-y-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Hive orientation</span>
                                    <select className="h-12 w-full rounded-2xl border border-gray-100 bg-[#F9F7F2] px-4 text-sm font-black text-[#1A1A1A]" value={healthInputs.orientation} onChange={(event) => setHealthInputs((prev) => ({ ...prev, orientation: event.target.value as HealthyHiveInputs['orientation'] }))}>
                                        <option value="east">East facing</option>
                                        <option value="south">South facing</option>
                                        <option value="west">West facing</option>
                                        <option value="north">North facing</option>
                                    </select>
                                </label>
                            </CardContent>
                        </Card>

                        <div className="xl:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { label: 'Healthy Hive Index', value: `${healthyHiveMetrics.healthyHiveIndex}%`, icon: ShieldCheck, tone: 'text-[#1B9157]' },
                                { label: 'Flight score', value: `${healthyHiveMetrics.weatherNormalizedFlightScore}%`, icon: Activity, tone: 'text-sky-600' },
                                { label: 'Colony strength', value: `${healthyHiveMetrics.colonyStrengthScore}%`, icon: TrendingUp, tone: 'text-[#F4D03F]' },
                                { label: 'Brood health', value: `${healthyHiveMetrics.broodHealthScore}%`, icon: Flower2, tone: 'text-amber-600' },
                            ].map((item) => (
                                <Card key={item.label} className={cn(glass.card, 'bg-white/50 border-[#F4D03F]/10')}>
                                    <CardContent className="p-5 space-y-3">
                                        <div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{item.label}</span><item.icon className={cn('w-4 h-4', item.tone)} /></div>
                                        <p className={cn('text-3xl font-black tracking-tighter', item.tone)}>{item.value}</p>
                                    </CardContent>
                                </Card>
                            ))}
                            <Card className={cn(glass.card, 'md:col-span-2 bg-white/50 border-[#F4D03F]/10')}>
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div><p className="text-[10px] font-black uppercase tracking-widest text-[#1B9157]">Deployment readiness</p><h3 className="mt-2 text-2xl font-black tracking-tight text-[#1A1A1A]">{healthyHiveMetrics.deploymentReadiness === 'deploy' ? 'Ready for premium bloom' : healthyHiveMetrics.deploymentReadiness === 'watch' ? 'Ready with monitoring' : 'Hold and strengthen'}</h3></div>
                                        <Badge className={cn(healthyHiveMetrics.deploymentReadiness === 'deploy' ? 'bg-[#1B9157]/10 text-[#1B9157]' : healthyHiveMetrics.deploymentReadiness === 'watch' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700')}>{healthyHiveMetrics.deploymentReadiness}</Badge>
                                    </div>
                                    <p className="text-sm font-semibold leading-relaxed text-gray-600">{healthyHiveMetrics.recommendation}</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    <VarroaWashInterpreter />
                </TabsContent>

                <TabsContent value="feeding" className="mt-0 space-y-6">
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                        <Card className={cn(glass.card, 'xl:col-span-5 bg-white/50 border-[#F4D03F]/10')}>
                            <CardHeader className="border-b border-[#F4D03F]/10"><CardTitle className="text-sm font-black text-[#1A1A1A]">Feeding inventory planner</CardTitle></CardHeader>
                            <CardContent className="p-5 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <NumberField label="Colonies" value={feedColonies} min={1} step={1} suffix="hives" onChange={setFeedColonies} />
                                    <NumberField label="Feed days" value={feedDays} min={1} step={1} suffix="days" onChange={setFeedDays} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <NumberField label="Daily syrup per hive" value={dailyFeedLiters} min={0.1} step={0.05} suffix="liters" onChange={setDailyFeedLiters} />
                                    <NumberField label="Protein grams per hive" value={proteinGrams} min={50} step={10} suffix="grams" onChange={setProteinGrams} />
                                </div>
                                <label className="space-y-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Syrup ratio</span>
                                    <div className="grid grid-cols-2 gap-3">
                                        {(['1:1', '2:1'] as const).map((ratio) => <button key={ratio} type="button" onClick={() => setFeedRatio(ratio)} className={cn('h-12 rounded-2xl border text-sm font-black transition-all', feedRatio === ratio ? 'border-[#1B9157]/30 bg-[#1B9157]/5 text-[#1B9157]' : 'border-gray-100 bg-[#F9F7F2] text-gray-500')}>{ratio}</button>)}
                                    </div>
                                </label>
                            </CardContent>
                        </Card>

                        <div className="xl:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { label: 'Total syrup', value: `${syrupLiters} L`, icon: Droplet, tone: 'text-sky-600' },
                                { label: 'Dry sugar needed', value: `${sugarKg} kg`, icon: Flame, tone: 'text-amber-600' },
                                { label: 'Protein patties', value: `${proteinPattiesKg} kg`, icon: Activity, tone: 'text-[#1B9157]' },
                            ].map((item) => (
                                <Card key={item.label} className={cn(glass.card, 'bg-white/50 border-[#F4D03F]/10')}>
                                    <CardContent className="p-5 space-y-3">
                                        <div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{item.label}</span><item.icon className={cn('w-4 h-4', item.tone)} /></div>
                                        <p className={cn('text-3xl font-black tracking-tighter', item.tone)}>{item.value}</p>
                                    </CardContent>
                                </Card>
                            ))}
                            <Card className={cn(glass.card, 'md:col-span-3 bg-white/50 border-[#F4D03F]/10')}>
                                <CardContent className="p-6 space-y-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#1B9157]">Feed recommendation</p>
                                    <p className="text-sm font-semibold text-gray-600 leading-relaxed">Use {feedRatio} syrup while brood is building, then switch to 2:1 only if stores stay below target before transport. Protein demand stays highest during strong brood expansion, so keep patties distributed before the bloom rush.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="logistics" className="mt-0 space-y-6">
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                        <Card className={cn(glass.card, 'xl:col-span-5 bg-white/50 border-[#F4D03F]/10')}>
                            <CardHeader className="border-b border-[#F4D03F]/10"><CardTitle className="text-sm font-black text-[#1A1A1A]">Deployment calculus</CardTitle></CardHeader>
                            <CardContent className="p-5 space-y-4">
                                <NumberField label="Hives per pallet" value={hivesPerPallet} min={1} max={8} step={1} suffix="hives" onChange={setHivesPerPallet} />
                                <NumberField label="Average field speed" value={deploymentSpeed} min={4} max={40} step={1} suffix="km/h" onChange={setDeploymentSpeed} />
                                <NumberField label="Turn count per block" value={laneTurns} min={1} max={30} step={1} suffix="turns" onChange={setLaneTurns} />
                                <NumberField label="Spacing between drop points" value={siteSpacingMeters} min={80} max={400} step={10} suffix="meters" onChange={setSiteSpacingMeters} />
                            </CardContent>
                        </Card>

                        <div className="xl:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { label: 'Pallets required', value: palletsRequired.toString(), icon: Truck, tone: 'text-[#1B9157]' },
                                { label: 'Route distance', value: `${routeDistanceKm} km`, icon: Zap, tone: 'text-sky-600' },
                                { label: 'Field hours', value: `${fieldHours} h`, icon: Activity, tone: 'text-[#F4D03F]' },
                                { label: 'Overlap risk', value: `${overlapRisk}%`, icon: Gauge, tone: overlapRisk > 20 ? 'text-amber-600' : 'text-[#1B9157]' },
                            ].map((item) => (
                                <Card key={item.label} className={cn(glass.card, 'bg-white/50 border-[#F4D03F]/10')}>
                                    <CardContent className="p-5 space-y-3">
                                        <div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{item.label}</span><item.icon className={cn('w-4 h-4', item.tone)} /></div>
                                        <p className={cn('text-3xl font-black tracking-tighter', item.tone)}>{item.value}</p>
                                    </CardContent>
                                </Card>
                            ))}
                            <Card className={cn(glass.card, 'md:col-span-2 bg-[#1A1A1A] border-transparent text-white')}>
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div><p className="text-[10px] font-black uppercase tracking-widest text-[#F4D03F]">Logistics note</p><h3 className="mt-2 text-2xl font-black tracking-tight">Deploy {economicMetrics.recommendedHivesLow}-{economicMetrics.recommendedHivesHigh} hives with {palletsRequired} pallets</h3></div>
                                        <ArrowUpRight className="w-5 h-5 text-[#F4D03F]" />
                                    </div>
                                    <p className="text-sm font-semibold text-white/70 leading-relaxed">Current spacing keeps overlap risk at {overlapRisk}%. If bloom tightens, reduce spacing only after coverage gap falls under {economicMetrics.coverageGapFrames} frames.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </BeeYieldPageShell>
    );
};

export default BeeCalculatorSuite;
