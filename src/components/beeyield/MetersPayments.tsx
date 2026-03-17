import React from 'react';
import { Reorder } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Droplet, Flame, Zap, FileText, CreditCard, GripVertical, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { meterService, BillingRate } from '@/services/meterService';
import { toast } from 'sonner';
import { glass } from './GlassTheme';
import { motion } from 'framer-motion';
import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';

interface MetersPaymentsProps {
    onTabChange?: (tab: string) => void;
}

const MetersPayments: React.FC<MetersPaymentsProps> = ({ onTabChange = () => { } }) => {
    const [rates, setRates] = React.useState<BillingRate[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [isCreating, setIsCreating] = React.useState(false);

    const LOCAL_RATES_KEY = React.useMemo(() => 'beeyield_local_meter_rates_v1', []);

    const readLocalRates = React.useCallback((): BillingRate[] => {
        try {
            const raw = globalThis.localStorage?.getItem(LOCAL_RATES_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? (parsed as BillingRate[]) : [];
        } catch {
            return [];
        }
    }, [LOCAL_RATES_KEY]);

    const writeLocalRates = React.useCallback((next: BillingRate[]) => {
        try {
            globalThis.localStorage?.setItem(LOCAL_RATES_KEY, JSON.stringify(next));
        } catch {
            // ignore
        }
    }, [LOCAL_RATES_KEY]);

    const consumptionData = [
        { label: 'Energy usage', value: '12,483', unit: 'Units', subtext: 'last month', icon: Zap, color: 'text-[#1B9157]' },
        { label: 'Water usage', value: '3,842', unit: 'm3', subtext: 'last month', icon: Droplet, color: 'text-blue-500' },
        { label: 'Heat/Fuel usage', value: '1,203', unit: 'GJ', subtext: 'last month', icon: Flame, color: 'text-[#F4D03F]' },
    ];

    const [columns, setColumns] = React.useState([
        'Sensor ID',
        'Device number',
        'Apiary address',
        'Hive / Unit',
        'Level',
        'Reading'
    ]);

    React.useEffect(() => {
        const loadRates = async () => {
            setError(null);
            try {
                const data = await meterService.getBillingRates();
                setRates(data);
            } catch (error) {
                const local = readLocalRates();
                if (local.length > 0) {
                    setRates(local);
                    toast.info('Loaded billing rates from this device');
                } else {
                    setError('Billing rates unavailable right now.');
                    toast.error('Failed to load billing rates');
                }
            } finally {
                setLoading(false);
            }
        };
        loadRates();
    }, [readLocalRates]);

    const refreshRates = React.useCallback(async () => {
        const data = await meterService.getBillingRates();
        setRates(data);
    }, []);

    const exportRatesCsv = React.useCallback(() => {
        if (!rates || rates.length === 0) {
            toast.info('No billing rates to export');
            return;
        }

        const rows = rates.map((r: any) => ({
            id: r.id ?? '',
            meter_type: r.meter_type ?? '',
            unit: r.unit ?? '',
            rate_per_unit: r.rate_per_unit ?? '',
            currency: r.currency ?? '',
            effective_from: r.effective_from ?? '',
        }));

        const escapeCsv = (v: unknown) => {
            const s = String(v ?? '');
            if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
            return s;
        };

        const header = Object.keys(rows[0]).join(',');
        const body = rows.map((row) => Object.values(row).map(escapeCsv).join(',')).join('\n');
        const csv = `${header}\n${body}\n`;

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `beeyield-billing-rates-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        toast.success('Data package exported');
    }, [rates]);

    const [newRate, setNewRate] = React.useState<{
        meter_type: 'Water' | 'Heat' | 'Energy' | 'Other';
        rate_per_unit: string;
        currency: string;
        unit: string;
        description: string;
        is_active: boolean;
    }>({
        meter_type: 'Water',
        rate_per_unit: '',
        currency: 'USD',
        unit: 'unit',
        description: '',
        is_active: true,
    });

    const addRateLocal = React.useCallback(() => {
        const rateNum = Number(newRate.rate_per_unit);
        if (!Number.isFinite(rateNum) || rateNum <= 0) {
            toast.error('Enter a valid unit rate (> 0)');
            return;
        }
        if (!newRate.unit.trim()) {
            toast.error('Unit is required');
            return;
        }
        if (!newRate.currency.trim()) {
            toast.error('Currency is required');
            return;
        }

        const row: any = {
            id:
                typeof crypto !== 'undefined' && 'randomUUID' in crypto
                    ? `local-${crypto.randomUUID()}`
                    : `local-${Date.now()}`,
            meter_type: newRate.meter_type,
            rate_per_unit: rateNum,
            currency: newRate.currency.toUpperCase(),
            unit: newRate.unit,
            description: newRate.description,
            is_active: newRate.is_active,
            effective_from: new Date().toISOString(),
        };

        const next = [row as BillingRate, ...(rates || [])];
        setRates(next);
        writeLocalRates(next);
        setNewRate((prev) => ({ ...prev, rate_per_unit: '', description: '' }));
        toast.success('New billing rate saved (local)');
    }, [newRate, rates, writeLocalRates]);

    const addRateRemote = React.useCallback(async () => {
        if (isCreating) return;
        const rateNum = Number(newRate.rate_per_unit);
        if (!Number.isFinite(rateNum) || rateNum <= 0) {
            toast.error('Enter a valid unit rate (> 0)');
            return;
        }
        if (!newRate.unit.trim()) {
            toast.error('Unit is required');
            return;
        }
        if (!newRate.currency.trim()) {
            toast.error('Currency is required');
            return;
        }

        setIsCreating(true);
        const tid = toast.loading('Saving billing rate…');
        try {
            await meterService.createBillingRate({
                meter_type: newRate.meter_type,
                rate_per_unit: rateNum,
                unit: newRate.unit.trim(),
                currency: newRate.currency.trim().toUpperCase(),
                description: newRate.description.trim() || undefined,
                is_active: newRate.is_active,
            });
            toast.success('Billing rate saved', { id: tid });
            setNewRate((prev) => ({ ...prev, rate_per_unit: '', description: '' }));
            await refreshRates();
        } catch (e: any) {
            console.error(e);
            toast.error(e?.message || 'Could not save billing rate', { id: tid });
            // keep UX usable even if backend is unavailable
            addRateLocal();
        } finally {
            setIsCreating(false);
        }
    }, [addRateLocal, isCreating, newRate, refreshRates]);

    return (
        <BeeYieldPageShell className="p-0 md:p-0 -m-4 md:-m-6 space-y-0 pb-0">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("p-8 -m-0 space-y-12 pb-12 min-h-screen")}>
            <BeeYieldPageHeader
                icon={CreditCard}
                label="USAGE_SETTLEMENT_REGISTRY"
                title={<>Financial <span className="text-[#F4D03F]">Logistics</span></>}
                subtitle="RESOURCE_VALUATION_AND_BILLING_METRICS"
            />

            {/* Consumption Summary */}
            <div className={cn(glass.card, "p-0 shadow-xl overflow-hidden bg-white/40 backdrop-blur-xl border-white/20 rounded-[2.5rem]")}>
                <div className="p-5 border-b border-white/10 bg-white/20 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/50 flex items-center justify-center border border-white/40">
                        <CreditCard className="w-4 h-4 text-[#1B9157]" />
                    </div>
                    <h3 className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-[0.2em]">CONSUMPTION_MATRIX</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
                    {consumptionData.map((item, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={idx}
                            className="p-6 flex flex-col items-center text-center group hover:bg-white/50 transition-colors"
                        >
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 shadow-sm border border-white/40 group-hover:scale-110 transition-transform duration-300 bg-white/60", item.color)}>
                                <item.icon className="w-5 h-5" />
                            </div>
                            <p className="text-[9px] font-black tracking-widest uppercase text-gray-500 mb-1">{item.label}</p>
                            <h3 className="text-2xl font-black text-[#1A1A1A] tracking-tighter tabular-nums">
                                {item.value} <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.unit}</span>
                            </h3>
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-2">{item.subtext}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Export to billing system */}
            <div className={cn(glass.card, "p-6 shadow-xl bg-white/40 backdrop-blur-xl border-white/20 relative overflow-hidden group rounded-[2.5rem]")}>
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#1B9157]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-transform group-hover:scale-110" />

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/50 flex items-center justify-center border border-white/40 shadow-sm">
                            <FileText className="w-6 h-6 text-[#1B9157]" />
                        </div>
                        <div className="space-y-0.5">
                            <h3 className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-[0.2em]">BATCH_SETTLEMENT_EXPORT</h3>
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">COMPILE_PAYMENT_ARCHIVES_FOR_EXTERNAL_PROCESSING</p>
                        </div>
                    </div>

                    <button
                        onClick={exportRatesCsv}
                        className={cn(glass.btnPrimary, "w-full md:w-auto h-10 px-6 font-black text-[10px] uppercase tracking-[0.2em]")}
                    >
                        EXECUTE_BATCH_EXPORT
                    </button>
                </div>
            </div>

            {/* Sample billing rates */}
            <div className={cn(glass.card, "p-0 shadow-xl overflow-hidden bg-white/40 backdrop-blur-xl border-white/20 rounded-[2.5rem]")}>
                <div className="p-5 border-b border-white/10 bg-white/20">
                    <h3 className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-[0.2em]">BILLING_PARAMETERIZATION</h3>
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">DEFINE_RESOURCE_SPECIFIC_VALUATION_WEIGHTS</p>
                </div>

                <div className="p-5 space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-10">
                            <Loader2 className="w-6 h-6 animate-spin text-[#F4D03F]" />
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mt-4 animate-pulse">SYNCHING_PARAMETERS...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <FileText className="w-8 h-8 text-red-300 mb-4" />
                            <p className="text-[9px] font-black text-red-600 uppercase tracking-widest">LOAD_FAILED</p>
                            <p className="text-[10px] font-semibold text-gray-500 mt-2 max-w-md">{error}</p>
                        </div>
                    ) : rates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10">
                            <FileText className="w-8 h-8 text-gray-300 mb-4" />
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">ZERO_RATE_CONFIGURATION_DETECTED</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {rates.map((item, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={item.id}
                                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-white/50 border border-white/40 hover:bg-white/70 transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center border border-white/40 shadow-sm group-hover:scale-105 transition-transform duration-200">
                                            {item.meter_type === 'Water' && <Droplet className="w-4 h-4 text-blue-500" />}
                                            {item.meter_type === 'Heat' && <Flame className="w-4 h-4 text-[#F4D03F]" />}
                                            {item.meter_type === 'Energy' && <Zap className="w-4 h-4 text-[#1B9157]" />}
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-[0.2em]">{item.meter_type}_RATE</h4>
                                            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">{item.description || 'GLOBAL_STANDARD_SETTLEMENT'}</p>
                                        </div>
                                    </div>
                                    <div className="text-left md:text-right">
                                        <p className="text-lg font-black text-[#1A1A1A] tracking-tighter tabular-nums">
                                            {item.rate_per_unit.toFixed(2)} <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{item.currency} / {item.unit}</span>
                                        </p>
                                        <div className="flex items-center md:justify-end gap-2 mt-1">
                                            {item.is_active && <div className="bg-[#1B9157]/10 text-[#1B9157] border border-[#1B9157]/20 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest">ACTIVE_PROTOCOL</div>}
                                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">EFF: {new Date(item.effective_from).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-5 border-t border-white/10 bg-white/20 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black tracking-widest uppercase text-gray-500 ml-1">TELE_TYPE</label>
                            <Select
                                value={newRate.meter_type.toLowerCase()}
                                onValueChange={(v) => {
                                    const next =
                                        v === 'water' ? 'Water' :
                                        v === 'heat' ? 'Heat' :
                                        v === 'energy' ? 'Energy' : 'Other';
                                    setNewRate((p) => ({ ...p, meter_type: next }));
                                }}
                            >
                                <SelectTrigger id="meters-payments-meter-type" aria-label="Meter type" className="h-9 bg-white/50 border-white/40 rounded-xl text-[9px] font-black uppercase tracking-[0.2em]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border border-white/40 shadow-lg bg-white/90 backdrop-blur-xl">
                                    <SelectItem value="water" className="text-[9px] font-black uppercase tracking-widest hover:bg-white/50 cursor-pointer">WATER</SelectItem>
                                    <SelectItem value="heat" className="text-[9px] font-black uppercase tracking-widest hover:bg-white/50 cursor-pointer">HEAT</SelectItem>
                                    <SelectItem value="energy" className="text-[9px] font-black uppercase tracking-widest hover:bg-white/50 cursor-pointer">ENERGY</SelectItem>
                                    <SelectItem value="other" className="text-[9px] font-black uppercase tracking-widest hover:bg-white/50 cursor-pointer">OTHER</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="meters-payments-rate-per-unit" className="text-[9px] font-black tracking-widest uppercase text-gray-500 ml-1">UNIT_RATE</label>
                            <Input
                                id="meters-payments-rate-per-unit"
                                name="rate_per_unit"
                                autoComplete="off"
                                type="number"
                                inputMode="decimal"
                                placeholder="0.00"
                                value={newRate.rate_per_unit}
                                onChange={(e) => setNewRate((p) => ({ ...p, rate_per_unit: e.target.value }))}
                                className="h-9 bg-white/50 border-white/40 rounded-xl text-[9px] font-black font-mono w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="meters-payments-description" className="text-[9px] font-black tracking-widest uppercase text-gray-500 ml-1">ANNOTATION</label>
                            <Input
                                id="meters-payments-description"
                                name="description"
                                autoComplete="off"
                                placeholder="COMMENT..."
                                value={newRate.description}
                                onChange={(e) => setNewRate((p) => ({ ...p, description: e.target.value }))}
                                className="h-9 bg-white/50 border-white/40 rounded-xl text-[9px] font-black uppercase tracking-widest w-full"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={addRateRemote}
                            disabled={isCreating}
                            className={cn(glass.btnPrimary, "w-full h-9 rounded-xl inline-flex items-center justify-center text-[9px] font-black uppercase tracking-[0.2em]")}
                        >
                            {isCreating ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Plus className="w-3.5 h-3.5 mr-1" />}
                            COMMIT_WEIGHT
                        </button>
                    </div>

                    {/* Drag and Drop Columns */}
                    <div className="pt-5 border-t border-white/10">
                        <div className="mb-4">
                            <h4 className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-[0.2em]">RECURSIVE_DIMENSIONALITY</h4>
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">CONFIGURE_HIERARCHICAL_ORDERING_FOR_BATCH_OUTPUT</p>
                        </div>

                        <Reorder.Group axis="y" values={columns} onReorder={setColumns} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {columns.map((column) => (
                                <Reorder.Item
                                    key={column}
                                    value={column}
                                    className={cn(glass.card, "p-3 flex items-center justify-between cursor-grab active:cursor-grabbing hover:bg-white/50 transition-colors group bg-white/30 border-white/40")}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-md bg-white/50 flex items-center justify-center border border-white/40 shadow-sm group-hover:bg-[#F4D03F] group-hover:border-[#F4D03F] group-hover:text-white transition-colors duration-200">
                                            <GripVertical className="w-3 h-3 text-gray-500 group-hover:text-white" />
                                        </div>
                                        <span className="text-[9px] font-black text-[#1A1A1A] uppercase tracking-[0.2em]">{column}</span>
                                    </div>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    </div>
                </div>
            </div>
            </motion.div>
        </BeeYieldPageShell>
    );
};

export default MetersPayments;
