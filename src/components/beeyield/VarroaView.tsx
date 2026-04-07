import React from 'react';
import { CalendarDays, ChevronDown, Search, Sparkles, Settings, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

type StartMode = 'observed' | 'default';
type ColonyStrength = 'Weak' | 'Medium' | 'Strong';
type BroodMode = 'Seasonal (auto)' | 'Manual (advanced)' | 'Broodless';

const pageClass = 'min-h-screen bg-[#f3f6fb] px-4 py-6 md:px-6 lg:px-8';
const shellClass = 'mx-auto max-w-[1120px] space-y-4';
const cardClass = 'rounded-[18px] border border-[#e2e8f0] bg-white shadow-[0_12px_40px_rgba(15,23,42,0.05)]';
const softCardClass = 'rounded-[16px] border border-[#e7edf5] bg-[#fbfcfe]';
const labelClass = 'text-[11px] font-medium uppercase tracking-[0.05em] text-[#607086]';
const titleClass = 'text-[18px] font-semibold tracking-[-0.02em] text-[#182235]';
const inputClass = 'h-11 w-full rounded-[12px] border border-[#d7deea] bg-white px-4 text-[15px] text-[#182235] outline-none transition focus:border-[#f5b938] focus:ring-2 focus:ring-[#f5b938]/20';
const chipClass = 'rounded-full border border-[#d6dfeb] bg-white px-4 py-2.5 text-[13px] font-medium text-[#41506a]';
const activeChipClass = 'rounded-full border border-[#dfab27] bg-[#f6bc3a] px-4 py-2.5 text-[13px] font-medium text-[#1f2937] shadow-[0_10px_20px_rgba(245,185,56,0.25)]';
const okPillClass = 'inline-flex items-center rounded-full border border-[#7ed8a2] bg-[#dff7e8] px-4 py-2 text-[13px] font-semibold text-[#13794a]';
const warningPillClass = 'inline-flex items-center rounded-full border border-[#dfab27] bg-[#f6bc3a] px-4 py-2 text-[13px] font-medium text-[#1f2937] shadow-[0_10px_20px_rgba(245,185,56,0.25)]';

const faqItems = [
    'Is this a veterinary diagnosis?',
    'Why can results differ from my hive?',
    'Can I compare different treatment plans?',
    'Where does collapse risk come from?',
    'What is reinvasion and why does it break plans?',
];

const quickLinks = [
    'Add planned treatment',
    'My devices',
    'Measurement data',
    'Support Center',
    'BeeHUB Agro Intelligence',
    'Settings',
];

const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-GB');
};

const buildSimulationData = (initialMiteCount: number, simulationDays: number, adultBeePopulation: number) => {
    const steps = 12;

    return Array.from({ length: steps }, (_, index) => {
        const progress = index / (steps - 1);
        const day = Math.round(progress * simulationDays);
        const growth = Math.exp(progress * 4.25);
        const phoretic = Math.round(initialMiteCount * growth);
        const dailyMiteFall = Math.max(1, Math.round(phoretic / 180));
        const cumulativeMiteFall = Math.round(dailyMiteFall * (day + 1) * 0.42);
        const population = Math.round(adultBeePopulation * (0.96 + (progress * 0.18)));
        const brood = Math.round(164246 * (1.02 - progress * 0.42 + (Math.sin(progress * 6) * 0.05)));
        const mitesInBrood = Math.round(phoretic * (0.18 + progress * 0.35));
        const broodlessPhoretic = Math.round(phoretic * (0.42 + progress * 0.16));
        const infectionPer100 = Number(((phoretic / Math.max(population, 1)) * 100).toFixed(1));
        const scenarioRisk = Math.round(50000 + progress ** 4 * 520000);
        const adultBees = Math.round(population * (0.85 + progress * 0.08));
        const allBrood = Math.round(brood * 1.9);
        const cappedBrood = Math.round(brood * 1.35);
        const alcoholWash = Math.round(phoretic / 60);

        return {
            day,
            dayLabel: `${day}`,
            population,
            phoretic,
            dailyMiteFall,
            cumulativeMiteFall,
            brood,
            mitesInBrood,
            broodlessPhoretic,
            infectionPer100,
            scenarioRisk,
            adultBees,
            allBrood,
            cappedBrood,
            alcoholWash,
        };
    });
};

const StatTile = ({ label, value }: { label: string; value: string }) => (
    <div className="rounded-[12px] border border-[#e6edf5] bg-[#fbfcfe] px-4 py-3">
        <div className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#7d8ca2]">{label}</div>
        <div className="mt-2 text-[22px] font-semibold tracking-[-0.03em] text-[#1a2436]">{value}</div>
    </div>
);

const MiniChartCard = ({
    title,
    dataKey,
    color,
    data,
    secondaryKey,
    secondaryColor,
}: {
    title: string;
    dataKey: string;
    color: string;
    data: Array<Record<string, number | string>>;
    secondaryKey?: string;
    secondaryColor?: string;
}) => (
    <div className={cn(softCardClass, 'p-3')}>
        <div className="mb-2 text-[12px] font-semibold text-[#1a2436]">{title}</div>
        <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid stroke="#edf1f6" />
                    <XAxis dataKey="dayLabel" tick={{ fontSize: 10, fill: '#7d8ca2' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#7d8ca2' }} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
                    {secondaryKey && secondaryColor ? <Line type="monotone" dataKey={secondaryKey} stroke={secondaryColor} strokeWidth={2} dot={false} /> : null}
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
);

const Field = ({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) => (
    <label className={cn('space-y-2.5', className)}>
        <div className={labelClass}>{label}</div>
        {children}
    </label>
);

const ToggleChip = ({
    active,
    children,
    onClick,
    className,
}: {
    active: boolean;
    children: React.ReactNode;
    onClick: () => void;
    className?: string;
}) => (
    <button type="button" onClick={onClick} className={cn(active ? activeChipClass : chipClass, className)}>
        {children}
    </button>
);

const VarroaView: React.FC = () => {
    const today = React.useMemo(() => new Date().toISOString().slice(0, 10), []);
    const [startMode, setStartMode] = React.useState<StartMode>('default');
    const [startDate, setStartDate] = React.useState(today);
    const [initialMiteCount, setInitialMiteCount] = React.useState(120);
    const [adultBeePopulation, setAdultBeePopulation] = React.useState(20000);
    const [simulationDays, setSimulationDays] = React.useState(180);
    const [collapseThreshold, setCollapseThreshold] = React.useState(3000);
    const [measurementType, setMeasurementType] = React.useState('Daily mite fall');
    const [mitesPerDay, setMitesPerDay] = React.useState(5);
    const [colonyMultiplier, setColonyMultiplier] = React.useState(120);
    const [region, setRegion] = React.useState('Central Europe');
    const [colonyStrength, setColonyStrength] = React.useState<ColonyStrength>('Medium');
    const [broodMode, setBroodMode] = React.useState<BroodMode>('Seasonal (auto)');
    const [treatmentMode, setTreatmentMode] = React.useState('Profile');
    const [treatmentDay, setTreatmentDay] = React.useState(0);
    const [treatmentType, setTreatmentType] = React.useState('amitraz');
    const [temperature, setTemperature] = React.useState(20);
    const [searchQuery, setSearchQuery] = React.useState('Search apiaries, tools');
    const [language, setLanguage] = React.useState('English');
    const [manualTemperature, setManualTemperature] = React.useState(true);
    const [treatmentAdvisorTemp, setTreatmentAdvisorTemp] = React.useState(20);
    const [oaTemperature, setOaTemperature] = React.useState(10);
    const [hasBrood, setHasBrood] = React.useState(true);

    React.useEffect(() => {
        if (startMode === 'observed') setInitialMiteCount(mitesPerDay * colonyMultiplier);
    }, [startMode, mitesPerDay, colonyMultiplier]);

    const simulationData = React.useMemo(
        () => buildSimulationData(initialMiteCount, simulationDays, adultBeePopulation),
        [initialMiteCount, simulationDays, adultBeePopulation],
    );

    const recentRows = React.useMemo(
        () =>
            simulationData.slice(-7).reverse().map((row) => ({
                day: row.day,
                totalPopulation: row.population.toLocaleString(),
                phoretic: row.phoretic.toLocaleString(),
                dailyMiteFall: row.dailyMiteFall.toLocaleString(),
            })),
        [simulationData],
    );

    const estimatedMiteCount = mitesPerDay * colonyMultiplier;
    const lastPoint = simulationData[simulationData.length - 1];

    return (
        <div className={pageClass}>
            <div className={shellClass}>
                <section className={cn(cardClass, 'bg-[linear-gradient(180deg,#fff9ee_0%,#ffffff_100%)] px-5 py-4')}>
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-1">
                            <div className="text-[15px] font-semibold text-[#182235]">First steps</div>
                            <div className="text-[13px] text-[#7d8ca2]">Start here to set up your apiaries, devices, and measurements.</div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {quickLinks.map((item) => (
                                    <span key={item} className="rounded-full border border-[#ebe2d0] bg-white px-3 py-1.5 text-[11px] font-medium text-[#263247]">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <button type="button" className="self-start rounded-full border border-[#ece7da] bg-white px-3 py-1 text-[11px] text-[#68768c]">
                            Hide
                        </button>
                    </div>
                </section>

                <header className="space-y-1 px-1">
                    <h1 className="text-[32px] font-semibold tracking-[-0.04em] text-[#182235]">Varroa Modeling</h1>
                </header>

                <section className={cn(cardClass, 'p-5 md:p-6')}>
                    <div className="space-y-4">
                        <h2 className={titleClass}>How to use the model</h2>
                        <div className="text-[13px] leading-6 text-[#7d8ca2]">
                            <p>A few steps to get a useful forecast quickly.</p>
                            <ol className="mt-3 space-y-1.5 text-[#4d5d74]">
                                <li>1. Choose a starting point: your mite fall/alcohol data or a default scenario.</li>
                                <li>2. Set colony parameters (strength and brood mode).</li>
                                <li>3. Add planned treatments and temperatures if you want to include them.</li>
                                <li>4. Review the charts and highlighted best treatment windows.</li>
                                <li>5. Compare scenarios and pick the one with the lowest collapse risk.</li>
                            </ol>
                            <p className="mt-3">This is a decision-support model, not a veterinary diagnosis.</p>
                        </div>
                        <button type="button" className={chipClass}>Show quick tour</button>
                    </div>
                </section>

                <section className={cn(cardClass, 'p-5 md:p-6')}>
                    <h2 className={titleClass}>Mini FAQ</h2>
                    <div className="mt-4 space-y-3">
                        {faqItems.map((item) => (
                            <details key={item} className="group">
                                <summary className="list-none cursor-pointer text-[14px] font-medium text-[#182235]">
                                    <span className="inline-flex items-center gap-2">
                                        <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                                        {item}
                                    </span>
                                </summary>
                            </details>
                        ))}
                    </div>
                </section>

                <section className={cn(cardClass, 'p-5 md:p-6')}>
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div>
                                <h2 className={titleClass}>Where do we start?</h2>
                                <p className="mt-1 text-[13px] text-[#8a97aa]">Set the starting point and basic colony parameters.</p>
                            </div>
                            <button type="button" className={warningPillClass}>Live update</button>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <ToggleChip active={startMode === 'observed'} onClick={() => setStartMode('observed')}>
                                I have mite fall / alcohol wash data
                            </ToggleChip>
                            <ToggleChip active={startMode === 'default'} onClick={() => setStartMode('default')}>
                                I don&apos;t know - use a default scenario
                            </ToggleChip>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Start date">
                                <div className="relative">
                                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={cn(inputClass, 'pr-10')} />
                                    <CalendarDays className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7d8ca2]" />
                                </div>
                            </Field>
                            <Field label="Initial mite count">
                                <input type="number" value={initialMiteCount} onChange={(e) => setInitialMiteCount(Number(e.target.value) || 0)} className={inputClass} />
                            </Field>
                            <Field label="Adult bee population">
                                <input type="number" value={adultBeePopulation} onChange={(e) => setAdultBeePopulation(Number(e.target.value) || 0)} className={inputClass} />
                            </Field>
                            <Field label="Simulation days">
                                <input type="number" value={simulationDays} onChange={(e) => setSimulationDays(Number(e.target.value) || 0)} className={inputClass} />
                            </Field>
                            <Field label="Collapse threshold">
                                <input type="number" value={collapseThreshold} onChange={(e) => setCollapseThreshold(Number(e.target.value) || 0)} className={inputClass} />
                            </Field>
                        </div>
                    </div>
                </section>

                {startMode === 'observed' ? (
                    <section className={cn(cardClass, 'p-5 md:p-6')}>
                        <div className="space-y-5">
                            <h2 className={titleClass}>Mite fall / alcohol calculator</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Measurement type">
                                    <input value={measurementType} onChange={(e) => setMeasurementType(e.target.value)} className={inputClass} />
                                </Field>
                                <Field label="Mites per day">
                                    <input type="number" value={mitesPerDay} onChange={(e) => setMitesPerDay(Number(e.target.value) || 0)} className={inputClass} />
                                </Field>
                                <Field label="Colony multiplier">
                                    <input type="number" value={colonyMultiplier} onChange={(e) => setColonyMultiplier(Number(e.target.value) || 0)} className={inputClass} />
                                </Field>
                            </div>
                            <div className="text-[14px] text-[#7d8ca2]">
                                Estimated mite count: <span className="font-semibold text-[#182235]">{estimatedMiteCount}</span>
                            </div>
                        </div>
                    </section>
                ) : null}

                <section className={cn(cardClass, 'p-5 md:p-6')}>
                    <div className="space-y-6">
                        <h2 className={titleClass}>Colony</h2>
                        <div className="max-w-[300px]">
                            <Field label="Region">
                                <input value={region} onChange={(e) => setRegion(e.target.value)} className={inputClass} />
                            </Field>
                        </div>

                        <div className="space-y-3">
                            <div className={labelClass}>Colony strength</div>
                            <div className="grid gap-3 md:grid-cols-2">
                                {(['Weak', 'Medium', 'Strong'] as ColonyStrength[]).map((item) => (
                                    <ToggleChip key={item} active={colonyStrength === item} onClick={() => setColonyStrength(item)} className="h-[36px] text-center">
                                        {item}
                                    </ToggleChip>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className={labelClass}>Brood</div>
                            <div className="grid gap-3 md:grid-cols-2">
                                {(['Seasonal (auto)', 'Manual (advanced)', 'Broodless'] as BroodMode[]).map((item) => (
                                    <ToggleChip key={item} active={broodMode === item} onClick={() => setBroodMode(item)} className="h-[36px] text-center">
                                        {item}
                                    </ToggleChip>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className={cn(cardClass, 'p-5 md:p-6')}>
                    <div className="space-y-6">
                        <h2 className={titleClass}>Treatments</h2>
                        <div className="grid gap-4 md:grid-cols-3">
                            <Field label="Mode">
                                <input value={treatmentMode} onChange={(e) => setTreatmentMode(e.target.value)} className={inputClass} />
                            </Field>
                            <Field label="Day">
                                <input type="number" value={treatmentDay} onChange={(e) => setTreatmentDay(Number(e.target.value) || 0)} className={inputClass} />
                            </Field>
                            <Field label="Type">
                                <input value={treatmentType} onChange={(e) => setTreatmentType(e.target.value)} className={inputClass} />
                            </Field>
                            <Field label="Temperature (C)" className="md:col-span-2">
                                <input type="number" value={temperature} onChange={(e) => setTemperature(Number(e.target.value) || 0)} className={inputClass} />
                            </Field>
                        </div>
                        <button type="button" className="h-11 w-full rounded-full bg-[#f5b938] text-[14px] font-medium text-[#1f2937] shadow-[0_10px_22px_rgba(245,185,56,0.25)]">
                            Add treatment
                        </button>
                    </div>
                </section>

                <section className={cn(cardClass, 'px-4 py-4 md:px-5')}>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <button type="button" className="h-11 rounded-full bg-[#f5b938] px-7 text-[14px] font-medium text-[#1f2937] shadow-[0_10px_22px_rgba(245,185,56,0.25)]">
                            Run simulation
                        </button>
                        <button type="button" className="h-11 rounded-full border border-[#d6dfeb] bg-white px-6 text-[14px] font-medium text-[#24324a]">
                            Get weather from BeeHUB Weather
                        </button>
                        <div className="text-[12px] text-[#8a97aa]">Changes in fields recalculate the simulation automatically.</div>
                    </div>
                </section>

                <section className={cn(cardClass, 'p-5 md:p-6')}>
                    <div className="space-y-5">
                        <h2 className={titleClass}>Simulation</h2>

                        <div className={cn(softCardClass, 'p-4')}>
                            <div className="space-y-4">
                                <h3 className="text-[14px] font-semibold text-[#182235]">Season overview</h3>
                                <div className="flex flex-wrap gap-2">
                                    <span className="rounded-[6px] bg-[#2ea7e0] px-3 py-2 text-[12px] font-medium text-white">Alcohol wash</span>
                                    <span className="rounded-[6px] bg-[#c92020] px-3 py-2 text-[12px] font-medium text-white">Mites x10</span>
                                    <span className="rounded-[6px] bg-[#ff7b19] px-3 py-2 text-[12px] font-medium text-[#1f2937]">Capped brood with mites (approx.)</span>
                                    <span className="rounded-[6px] bg-[#f9c916] px-3 py-2 text-[12px] font-medium text-[#1f2937]">All brood</span>
                                    <span className="rounded-[6px] bg-[#fde179] px-3 py-2 text-[12px] font-medium text-[#1f2937]">Adult bees</span>
                                </div>
                                <div className="h-[360px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={simulationData} margin={{ top: 12, right: 12, left: 12, bottom: 0 }}>
                                            <CartesianGrid stroke="#edf1f6" />
                                            <XAxis dataKey="dayLabel" tick={{ fontSize: 11, fill: '#7d8ca2' }} tickLine={false} axisLine={false} />
                                            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#7d8ca2' }} tickLine={false} axisLine={false} />
                                            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#7d8ca2' }} tickLine={false} axisLine={false} />
                                            <Tooltip />
                                            <Line yAxisId="right" type="monotone" dataKey="alcoholWash" stroke="#2ea7e0" strokeWidth={2.5} dot={false} />
                                            <Line yAxisId="right" type="monotone" dataKey="phoretic" stroke="#d81f26" strokeWidth={2.5} dot={false} strokeDasharray="3 3" />
                                            <Line yAxisId="left" type="monotone" dataKey="cappedBrood" stroke="#ff7b19" strokeWidth={2.5} dot={false} />
                                            <Line yAxisId="left" type="monotone" dataKey="allBrood" stroke="#f9c916" strokeWidth={2.5} dot={false} />
                                            <Line yAxisId="left" type="monotone" dataKey="adultBees" stroke="#e5c75a" strokeWidth={2.5} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <div className={cn(softCardClass, 'p-4')}>
                            <div className="space-y-3">
                                <h3 className="text-[14px] font-semibold text-[#182235]">Scenario comparison</h3>
                                <div className="h-[220px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={simulationData} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
                                            <CartesianGrid stroke="#edf1f6" />
                                            <XAxis dataKey="dayLabel" tick={{ fontSize: 11, fill: '#7d8ca2' }} tickLine={false} axisLine={false} />
                                            <YAxis tick={{ fontSize: 11, fill: '#7d8ca2' }} tickLine={false} axisLine={false} />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="scenarioRisk" stroke="#2f63e1" fill="#2f63e1" fillOpacity={0.12} strokeWidth={2.5} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-4">
                            <StatTile label="Total population" value={lastPoint.population.toLocaleString()} />
                            <StatTile label="Phoretic" value={lastPoint.phoretic.toLocaleString()} />
                            <StatTile label="Brood" value={lastPoint.brood.toLocaleString()} />
                            <StatTile label="Daily mite fall" value={lastPoint.dailyMiteFall.toLocaleString()} />
                        </div>

                        <div className="grid gap-3 md:grid-cols-3">
                            <MiniChartCard title="Varroa population" dataKey="phoretic" color="#eb6a2d" data={simulationData} secondaryKey="broodlessPhoretic" secondaryColor="#334155" />
                            <MiniChartCard title="Mites in brood (R)" dataKey="mitesInBrood" color="#dca90f" data={simulationData} secondaryKey="brood" secondaryColor="#f59e0b" />
                            <MiniChartCard title="Phoretic vs brood" dataKey="phoretic" color="#0ea5a8" data={simulationData} secondaryKey="brood" secondaryColor="#86c06a" />
                            <MiniChartCard title="Daily mite fall" dataKey="dailyMiteFall" color="#94a3b8" data={simulationData} secondaryKey="phoretic" secondaryColor="#cbd5e1" />
                            <MiniChartCard title="Cumulative mite fall" dataKey="cumulativeMiteFall" color="#334155" data={simulationData} />
                            <MiniChartCard title="Daily population change" dataKey="population" color="#7c3aed" data={simulationData} />
                            <MiniChartCard title="Infestation per 100 bees" dataKey="infectionPer100" color="#0ea5ff" data={simulationData} />
                        </div>

                        <div className="flex flex-wrap gap-4 text-[12px] text-[#607086]">
                            <label className="inline-flex items-center gap-2">
                                <input type="radio" name="advice-mode" defaultChecked />
                                Project a brood
                            </label>
                            <label className="inline-flex items-center gap-2">
                                <input type="radio" name="advice-mode" />
                                Why OA needs broodless periods
                            </label>
                            <label className="inline-flex items-center gap-2">
                                <input type="radio" name="advice-mode" />
                                Auto reinvasion
                            </label>
                        </div>

                        <div className={cn(softCardClass, 'overflow-hidden')}>
                            <div className="border-b border-[#e6edf5] px-4 py-3 text-[14px] font-semibold text-[#182235]">Recent days</div>
                            <table className="w-full text-left">
                                <thead className="bg-[#fbfcfe] text-[11px] uppercase tracking-[0.05em] text-[#7d8ca2]">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Day</th>
                                        <th className="px-4 py-3 font-medium">Total population</th>
                                        <th className="px-4 py-3 font-medium">Phoretic</th>
                                        <th className="px-4 py-3 font-medium">Daily mite fall</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[13px] text-[#24324a]">
                                    {recentRows.map((row) => (
                                        <tr key={row.day} className="border-t border-[#eef2f7]">
                                            <td className="px-4 py-3">{row.day}</td>
                                            <td className="px-4 py-3">{row.totalPopulation}</td>
                                            <td className="px-4 py-3">{row.phoretic}</td>
                                            <td className="px-4 py-3">{row.dailyMiteFall}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                <section className={cn(cardClass, 'p-5 md:p-6')}>
                    <div className="space-y-4">
                        <h2 className={titleClass}>What does this treatment really do?</h2>
                        <p className="text-[13px] text-[#7d8ca2]">Choose the treatment to review its procedure, strengths, and limits.</p>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Choose treatment">
                                <input value={treatmentType} onChange={(e) => setTreatmentType(e.target.value)} className={inputClass} />
                            </Field>
                            <Field label="Best used (day)">
                                <input value="Optimal seed day" readOnly className={inputClass} />
                            </Field>
                        </div>
                        <div className="grid gap-3 md:grid-cols-3">
                            <div className={cn(softCardClass, 'p-4')}>
                                <div className="text-[12px] font-semibold text-[#182235]">What happens to Varroa</div>
                                <p className="mt-2 text-[13px] leading-6 text-[#607086]">Strong contact effect on mites and faster phoretic suppression.</p>
                            </div>
                            <div className={cn(softCardClass, 'p-4')}>
                                <div className="text-[12px] font-semibold text-[#182235]">What happens to bees</div>
                                <p className="mt-2 text-[13px] leading-6 text-[#607086]">Short acting; requires correct dose and colony timing to reduce stress.</p>
                            </div>
                            <div className={cn(softCardClass, 'p-4')}>
                                <div className="text-[12px] font-semibold text-[#182235]">What does NOT do</div>
                                <p className="mt-2 text-[13px] leading-6 text-[#607086]">Does not prevent rebound if brood remains capped and reinvasion continues.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className={cn(cardClass, 'p-4 md:px-5 md:py-4')}>
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-wrap items-center gap-2 text-[12px] text-[#607086]">
                            <span className="rounded-full bg-[#fff4db] px-2 py-1 text-[#a06a00]">BeeHUB Plus</span>
                            <span>{formatDate(startDate)}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative min-w-[260px]">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
                                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={cn(inputClass, 'h-10 pl-9 text-[13px]')} />
                            </div>
                            <button type="button" className={chipClass}>{language}</button>
                            <button type="button" className={chipClass}>
                                <Sparkles className="h-4 w-4" />
                            </button>
                            <button type="button" className={chipClass}>
                                <Wand2 className="h-4 w-4" />
                            </button>
                            <button type="button" className={chipClass}>
                                <Settings className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </section>

                <section className={cn(cardClass, 'p-5 md:p-6')}>
                    <div className="space-y-4">
                        <h2 className={titleClass}>Is the temperature favorable for treatment?</h2>
                        <div className="grid gap-4 md:grid-cols-3">
                            <Field label="Treatment">
                                <input value="Formic acid" readOnly className={inputClass} />
                            </Field>
                            <Field label="Temperature (C)">
                                <input type="number" value={treatmentAdvisorTemp} onChange={(e) => setTreatmentAdvisorTemp(Number(e.target.value) || 0)} className={inputClass} />
                            </Field>
                        </div>
                        <button type="button" onClick={() => setManualTemperature((value) => !value)} className={warningPillClass}>
                            Use manual temperature
                        </button>
                        <div className={okPillClass}>OK</div>
                        <p className="text-[13px] text-[#607086]">Efficacy and safety depend on how fast the substance evaporates.</p>
                    </div>
                </section>

                <section className={cn(cardClass, 'p-5 md:p-6')}>
                    <div className="space-y-4">
                        <h2 className={titleClass}>Does oxalic acid (OA) make sense?</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Temperature (C)">
                                <input type="number" value={oaTemperature} onChange={(e) => setOaTemperature(Number(e.target.value) || 0)} className={inputClass} />
                            </Field>
                        </div>
                        <button type="button" onClick={() => setHasBrood((value) => !value)} className={chipClass}>
                            Is there brood in the hive?
                        </button>
                        <div className={okPillClass}>{hasBrood ? 'YES' : 'NO'}</div>
                        <p className="text-[14px] font-medium text-[#24324a]">OA is very effective against phoretic mites.</p>
                        <p className="text-[13px] text-[#7d8ca2]">This tool is not veterinary advice.</p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default VarroaView;
