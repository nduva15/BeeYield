import React from 'react';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
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

const cardClass = 'rounded-[18px] border border-[#e2e8f0] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]';
const labelClass = 'text-[12px] font-medium uppercase tracking-[0.02em] text-[#526581]';
const inputClass = 'h-11 w-full rounded-[12px] border border-[#d7deea] bg-white px-4 text-[15px] text-[#0f172a] outline-none transition focus:border-[#f5b938] focus:ring-2 focus:ring-[#f5b938]/20';
const ghostPillClass = 'rounded-full border border-[#cfd8e6] bg-white px-4 py-2.5 text-[14px] font-medium text-[#42526b] transition';
const activePillClass = 'rounded-full border border-[#e2a719] bg-[#f9be42] px-4 py-2.5 text-[14px] font-medium text-[#1f2937] shadow-[0_8px_18px_rgba(245,185,56,0.28)] transition';
const faqItems = [
    'Is this a veterinary diagnosis?',
    'Why can results differ from my hive?',
    'Can I compare different treatment plans?',
    'Where does collapse risk come from?',
    'What is reinvasion and why does it break plans?',
];

const formatDisplayDate = (date: string) => {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;
    return parsed.toLocaleDateString('en-GB');
};

const buildSimulation = (
    initialMiteCount: number,
    simulationDays: number,
    adultBeePopulation: number,
    collapseThreshold: number,
) => {
    const points = 10;
    return Array.from({ length: points }, (_, index) => {
        const progress = index / (points - 1);
        const day = Math.round(progress * simulationDays);
        const curve = Math.exp(progress * 4.15);
        const mitesSample = Math.round(initialMiteCount * curve);
        const mitesX10 = mitesSample * 10;
        const allBrood = Math.round((adultBeePopulation * 180) + (progress ** 3 * collapseThreshold * 18));
        const cappedBrood = Math.round(allBrood * 0.64);
        const adultBees = Math.round(adultBeePopulation * (0.92 + (progress * 0.1)));
        const alcoholWash = Math.max(0, Math.round(mitesSample / 10));
        return {
            day: `D${day}`,
            alcoholWash,
            mitesX10,
            cappedBrood,
            allBrood,
            adultBees,
        };
    });
};

const ToggleButton = ({
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
    <button
        type="button"
        onClick={onClick}
        className={cn(active ? activePillClass : ghostPillClass, className)}
    >
        {children}
    </button>
);

const Field = ({
    label,
    children,
    className,
}: {
    label: string;
    children: React.ReactNode;
    className?: string;
}) => (
    <label className={cn('space-y-3', className)}>
        <div className={labelClass}>{label}</div>
        {children}
    </label>
);

const VarroaView: React.FC = () => {
    const today = React.useMemo(() => new Date().toISOString().slice(0, 10), []);
    const [startMode, setStartMode] = React.useState<StartMode>('observed');
    const [startDate, setStartDate] = React.useState(today);
    const [initialMiteCount, setInitialMiteCount] = React.useState(600);
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
    const [changeNotes, setChangeNotes] = React.useState<string[]>([
        'Rebuilding the page around the modeling layout in the reference image.',
        'Matching the white card stack, yellow action states, and form-first flow.',
        'Keeping the simulation chart visible under the configuration sections.',
    ]);

    React.useEffect(() => {
        if (startMode === 'observed') {
            setInitialMiteCount(mitesPerDay * colonyMultiplier);
        }
    }, [startMode, mitesPerDay, colonyMultiplier]);

    const simulationData = React.useMemo(
        () => buildSimulation(initialMiteCount, simulationDays, adultBeePopulation, collapseThreshold),
        [initialMiteCount, simulationDays, adultBeePopulation, collapseThreshold],
    );

    const estimatedMiteCount = mitesPerDay * colonyMultiplier;

    return (
        <div className="min-h-screen bg-[#f4f7fb] px-4 py-5 md:px-6 lg:px-7">
            <div className="mx-auto max-w-[1150px] space-y-4">
                <div className="space-y-1">
                    <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-[#0f172a]">Varroa Modeling</h1>
                </div>

                <section className={cn(cardClass, 'p-5 md:p-6')}>
                    <div className="space-y-5">
                        <div>
                            <h2 className="text-[18px] font-semibold text-[#0f172a]">How to use the model</h2>
                            <p className="mt-4 text-[14px] leading-7 text-[#6b7b93]">
                                A few steps to get a useful forecast quickly.
                            </p>
                            <ol className="mt-3 space-y-2 text-[14px] leading-7 text-[#42526b]">
                                <li>1. Choose a starting point: your mite fall/alcohol data or a default scenario.</li>
                                <li>2. Set colony parameters (strength and brood mode).</li>
                                <li>3. Add planned treatments and temperatures if you want to include them.</li>
                                <li>4. Review the charts and highlighted best treatment windows.</li>
                                <li>5. Compare scenarios and pick the one with the lowest collapse risk.</li>
                            </ol>
                            <p className="mt-4 text-[14px] text-[#7b8aa2]">
                                This is a decision-support model, not a veterinary diagnosis.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button type="button" className={cn(ghostPillClass, 'px-5 py-2 text-[14px]')}>
                                Show quick tour
                            </button>
                            <div className="hidden text-[13px] text-[#8a97aa] md:block">
                                {changeNotes[0]}
                            </div>
                        </div>
                    </div>
                </section>

                <section className={cn(cardClass, 'p-5 md:p-6')}>
                    <div className="space-y-4">
                        <h2 className="text-[18px] font-semibold text-[#0f172a]">Mini FAQ</h2>
                        <div className="space-y-3">
                            {faqItems.map((item) => (
                                <details key={item} className="group">
                                    <summary className="cursor-pointer list-none text-[14px] font-medium text-[#0f172a]">
                                        <span className="inline-flex items-center gap-2">
                                            <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                                            {item}
                                        </span>
                                    </summary>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                <section className={cn(cardClass, 'p-5 md:p-6')}>
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                            <div>
                                <h2 className="text-[18px] font-semibold text-[#0f172a]">Where do we start?</h2>
                                <p className="mt-1 text-[14px] text-[#8a97aa]">Set the starting point and basic colony parameters.</p>
                            </div>
                            <button type="button" className={cn(activePillClass, 'self-start px-5 py-3')}>
                                Live update
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <ToggleButton active={startMode === 'observed'} onClick={() => setStartMode('observed')}>
                                I have mite fall / alcohol wash data
                            </ToggleButton>
                            <ToggleButton active={startMode === 'default'} onClick={() => setStartMode('default')}>
                                I don&apos;t know - use a default scenario
                            </ToggleButton>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            <Field label="Start date">
                                <div className="relative">
                                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={cn(inputClass, 'pr-11')} />
                                    <CalendarDays className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7b93]" />
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

                {startMode === 'observed' && (
                    <section className={cn(cardClass, 'p-5 md:p-6')}>
                        <div className="space-y-5">
                            <h2 className="text-[18px] font-semibold text-[#0f172a]">Mite fall / alcohol calculator</h2>
                            <div className="grid gap-5 md:grid-cols-2">
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
                            <div className="text-[14px] text-[#7b8aa2]">
                                Estimated mite count: <span className="font-semibold text-[#374151]">{estimatedMiteCount}</span>
                            </div>
                        </div>
                    </section>
                )}

                <section className={cn(cardClass, 'p-5 md:p-6')}>
                    <div className="space-y-6">
                        <h2 className="text-[18px] font-semibold text-[#0f172a]">Colony</h2>
                        <div className="max-w-[300px]">
                            <Field label="Region">
                                <input value={region} onChange={(e) => setRegion(e.target.value)} className={inputClass} />
                            </Field>
                        </div>

                        <div className="space-y-3">
                            <div className={labelClass}>Colony strength</div>
                            <div className="grid gap-3 md:grid-cols-2">
                                {(['Weak', 'Medium', 'Strong'] as ColonyStrength[]).map((item) => (
                                    <ToggleButton
                                        key={item}
                                        active={colonyStrength === item}
                                        onClick={() => setColonyStrength(item)}
                                        className={cn('h-[36px] text-center', item === 'Strong' && 'md:col-span-1', item === 'Medium' && 'md:col-span-1')}
                                    >
                                        {item}
                                    </ToggleButton>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className={labelClass}>Brood</div>
                            <div className="grid gap-3 md:grid-cols-2">
                                {(['Seasonal (auto)', 'Manual (advanced)', 'Broodless'] as BroodMode[]).map((item) => (
                                    <ToggleButton
                                        key={item}
                                        active={broodMode === item}
                                        onClick={() => setBroodMode(item)}
                                        className={cn('h-[36px] text-center', item === 'Broodless' && 'md:col-span-1')}
                                    >
                                        {item}
                                    </ToggleButton>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className={cn(cardClass, 'p-5 md:p-6')}>
                    <div className="space-y-6">
                        <h2 className="text-[18px] font-semibold text-[#0f172a]">Treatments</h2>
                        <div className="grid gap-5 md:grid-cols-3">
                            <Field label="Mode">
                                <input value={treatmentMode} onChange={(e) => setTreatmentMode(e.target.value)} className={inputClass} />
                            </Field>
                            <Field label="Day">
                                <input type="number" value={treatmentDay} onChange={(e) => setTreatmentDay(Number(e.target.value) || 0)} className={inputClass} />
                            </Field>
                            <Field label="Type">
                                <input value={treatmentType} onChange={(e) => setTreatmentType(e.target.value)} className={inputClass} />
                            </Field>
                            <Field label="Temperature (°C)" className="md:col-span-2">
                                <input type="number" value={temperature} onChange={(e) => setTemperature(Number(e.target.value) || 0)} className={inputClass} />
                            </Field>
                        </div>
                        <button type="button" className="h-11 w-full rounded-full bg-[#f5b938] text-[15px] font-medium text-[#1f2937] shadow-[0_10px_22px_rgba(245,185,56,0.28)] transition hover:bg-[#f2b028]">
                            Add treatment
                        </button>
                    </div>
                </section>

                <section className={cn(cardClass, 'p-4 md:px-5 md:py-4')}>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <button type="button" className="h-11 rounded-full bg-[#f5b938] px-7 text-[15px] font-medium text-[#1f2937] shadow-[0_10px_22px_rgba(245,185,56,0.28)]">
                            Run simulation
                        </button>
                        <button type="button" className="h-11 rounded-full border border-[#cfd8e6] bg-white px-6 text-[15px] font-medium text-[#24324a]">
                            Get weather from BeeHUB Weather
                        </button>
                        <div className="text-[13px] text-[#8a97aa]">
                            {changeNotes[1]}
                        </div>
                    </div>
                </section>

                <section className={cn(cardClass, 'p-5 md:p-6')}>
                    <div className="space-y-5">
                        <h2 className="text-[18px] font-semibold text-[#0f172a]">Simulation</h2>

                        <div className="rounded-[16px] border border-[#e7ecf3] bg-white p-4 md:p-5">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-[16px] font-semibold text-[#0f172a]">Season overview</h3>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <span className="rounded-[7px] bg-[#2ea7e0] px-4 py-2 text-[13px] font-medium text-white shadow-sm">Alcohol wash</span>
                                    <span className="rounded-[7px] bg-[#c92020] px-4 py-2 text-[13px] font-medium text-white shadow-sm">Mites x10</span>
                                    <span className="rounded-[7px] bg-[#ff7b19] px-4 py-2 text-[13px] font-medium text-[#1f2937] shadow-sm">Capped brood with mites (approx.)</span>
                                    <span className="rounded-[7px] bg-[#f9c916] px-4 py-2 text-[13px] font-medium text-[#1f2937] shadow-sm">All brood</span>
                                    <span className="rounded-[7px] bg-[#fde179] px-4 py-2 text-[13px] font-medium text-[#1f2937] shadow-sm">Adult bees</span>
                                </div>

                                <div className="h-[360px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={simulationData} margin={{ top: 16, right: 18, left: 18, bottom: 8 }}>
                                            <CartesianGrid stroke="#e9eef6" />
                                            <XAxis dataKey="day" stroke="#7b8aa2" tickLine={false} axisLine={false} />
                                            <YAxis yAxisId="left" stroke="#7b8aa2" tickLine={false} axisLine={false} />
                                            <YAxis yAxisId="right" orientation="right" stroke="#7b8aa2" tickLine={false} axisLine={false} />
                                            <Tooltip />
                                            <Line yAxisId="right" type="monotone" dataKey="alcoholWash" stroke="#2ea7e0" strokeWidth={3} dot={false} />
                                            <Line yAxisId="right" type="monotone" dataKey="mitesX10" stroke="#d81f26" strokeWidth={3} dot={false} strokeDasharray="2 4" />
                                            <Line yAxisId="left" type="monotone" dataKey="cappedBrood" stroke="#ff7b19" strokeWidth={3} dot={false} />
                                            <Line yAxisId="left" type="monotone" dataKey="allBrood" stroke="#f9c916" strokeWidth={3} dot={false} />
                                            <Line yAxisId="left" type="monotone" dataKey="adultBees" stroke="#fde179" strokeWidth={3} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <div className="text-[13px] text-[#8a97aa]">
                            {changeNotes[2]}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default VarroaView;
