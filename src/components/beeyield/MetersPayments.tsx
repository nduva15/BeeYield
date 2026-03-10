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

interface MetersPaymentsProps {
    onTabChange?: (tab: string) => void;
}

const MetersPayments: React.FC<MetersPaymentsProps> = ({ onTabChange = () => { } }) => {
    const [rates, setRates] = React.useState<BillingRate[]>([]);
    const [loading, setLoading] = React.useState(true);

    const consumptionData = [
        { label: 'Energy usage', value: '12,483', unit: 'Units', subtext: 'last month', icon: Zap, color: 'text-emerald-500' },
        { label: 'Water usage', value: '3,842', unit: 'm3', subtext: 'last month', icon: Droplet, color: 'text-blue-500' },
        { label: 'Heat/Fuel usage', value: '1,203', unit: 'GJ', subtext: 'last month', icon: Flame, color: 'text-amber-500' },
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
            // Fake delay for UI loading
            setTimeout(async () => {
                try {
                    const data = await meterService.getBillingRates();
                    setRates(data);
                } catch (error) {
                    toast.error('Failed to load billing rates');
                } finally {
                    setLoading(false);
                }
            }, 600);
        };
        loadRates();
    }, []);

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn(glass.page, "p-8 -m-8 space-y-12 pb-12 min-h-screen")}>
            {/* Header */}
            <div className="space-y-4">
                <div className={cn(glass.badge, 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 mb-2')}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Usage & Settlement Registry
                </div>
                <h1 className={cn(glass.sectionTitle, 'text-6xl')}>Financial <span className="text-honey">Logistics</span></h1>
            </div>

            {/* Consumption Summary */}
            <div className={cn(glass.card, "p-0 shadow-xl overflow-hidden")}>
                <div className="p-8 border-b border-border flex items-center gap-4 bg-white/40 dark:bg-black/20">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <CreditCard className="w-5 h-5 text-emerald-500" />
                    </div>
                    <h3 className={cn(glass.sectionTitle, "text-xl normal-case")}>Consumption Matrix</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/50 bg-white/20 dark:bg-black/10">
                    {consumptionData.map((item, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={idx}
                            className="p-8 flex flex-col items-center text-center group hover:bg-white/40 dark:hover:bg-black/20 transition-colors"
                        >
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-border group-hover:scale-110 transition-transform duration-300 bg-background", item.color)}>
                                <item.icon className="w-6 h-6" />
                            </div>
                            <p className={cn(glass.microLabel, "normal-case italic font-semibold opacity-60 mb-2")}>{item.label}</p>
                            <h3 className={cn(glass.sectionTitle, "text-4xl tabular-nums")}>
                                {item.value} <span className="text-lg opacity-50 font-semibold italic ml-1">{item.unit}</span>
                            </h3>
                            <p className={cn(glass.microLabel, "text-[10px] opacity-40 mt-3")}>{item.subtext}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Export to billing system */}
            <div className={cn(glass.card, "p-8 shadow-xl bg-emerald-500/5 border-emerald-500/20 relative overflow-hidden group")}>
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-transform group-hover:scale-110" />

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-white/40 dark:bg-black/20 flex items-center justify-center border border-border shadow-sm">
                            <FileText className="w-8 h-8 text-emerald-500" />
                        </div>
                        <div className="space-y-1">
                            <h3 className={cn(glass.sectionTitle, "text-2xl normal-case")}>Batch Settlement Export</h3>
                            <p className={cn(glass.microLabel, "normal-case italic opacity-70")}>Compile payment archives for external processing.</p>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            toast.info("Preparing data package for export...");
                            setTimeout(() => toast.success("Data package exported successfully to billing system!"), 2000);
                        }}
                        className={cn(glass.btnPrimary, "w-full md:w-auto h-14 px-10")}
                    >
                        Execute Batch Export
                    </button>
                </div>
            </div>

            {/* Sample billing rates */}
            <div className={cn(glass.card, "p-0 shadow-xl overflow-hidden")}>
                <div className="p-8 border-b border-border bg-white/40 dark:bg-black/20">
                    <h3 className={cn(glass.sectionTitle, "text-2xl normal-case")}>Billing Parameterization</h3>
                    <p className={cn(glass.microLabel, "normal-case italic mt-2 opacity-70 font-semibold")}>Define resource-specific valuation weights.</p>
                </div>

                <div className="p-8 space-y-8 bg-white/10 dark:bg-black/5">
                    {loading ? (
                        <div className={glass.emptyState}>
                            <Loader2 className="w-10 h-10 animate-spin text-honey" />
                            <p className={cn(glass.microLabel, "mt-4 animate-pulse")}>Synching parameters...</p>
                        </div>
                    ) : rates.length === 0 ? (
                        <div className={glass.emptyState}>
                            <FileText className="w-10 h-10 text-muted-foreground/30 mb-4" />
                            <p className={cn(glass.microLabel, "normal-case")}>Zero-rate configuration detected.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {rates.map((item, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={item.id}
                                    className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-2xl bg-white/40 dark:bg-black/20 border border-border hover:shadow-md hover:bg-white/60 dark:hover:bg-black/40 transition-all group"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-background flex flex-col items-center justify-center border border-border shadow-sm group-hover:scale-105 transition-transform duration-200">
                                            {item.meter_type === 'Water' && <Droplet className="w-6 h-6 text-blue-500" />}
                                            {item.meter_type === 'Heat' && <Flame className="w-6 h-6 text-amber-500" />}
                                            {item.meter_type === 'Energy' && <Zap className="w-6 h-6 text-emerald-500" />}
                                        </div>
                                        <div>
                                            <h4 className={cn(glass.microLabel, "font-bold tracking-wider text-sm")}>{item.meter_type} RATE</h4>
                                            <p className="text-xs text-muted-foreground italic font-medium mt-1">{item.description || 'Global standard settlement'}</p>
                                        </div>
                                    </div>
                                    <div className="text-left md:text-right">
                                        <p className={cn(glass.sectionTitle, "text-2xl tabular-nums")}>
                                            {item.rate_per_unit.toFixed(2)} <span className="text-sm italic font-semibold opacity-50 ml-1">{item.currency} / {item.unit}</span>
                                        </p>
                                        <div className="flex items-center md:justify-end gap-3 mt-2">
                                            {item.is_active && <div className={cn(glass.badge, "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-2 py-0.5 text-[9px]")}>Active Protocol</div>}
                                            <p className={cn(glass.microLabel, "text-[9px] opacity-40 italic")}>Eff: {new Date(item.effective_from).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-8 border-t border-border bg-white/30 dark:bg-black/20 space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                        <div className="space-y-3">
                            <label className={cn(glass.microLabel, "font-bold opacity-80 pl-1")}>Tele-Type</label>
                            <Select defaultValue="water">
                                <SelectTrigger className={cn(glass.input, "h-14 rounded-xl font-bold")}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border border-border shadow-xl backdrop-blur-xl bg-white/90 dark:bg-black/90">
                                    <SelectItem value="water" className="py-3 font-bold">Water</SelectItem>
                                    <SelectItem value="heat" className="py-3 font-bold">Heat</SelectItem>
                                    <SelectItem value="energy" className="py-3 font-bold">Energy</SelectItem>
                                    <SelectItem value="other" className="py-3 font-bold">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <label className={cn(glass.microLabel, "font-bold opacity-80 pl-1")}>Weight Ratio (KES)</label>
                            <Input type="number" placeholder="0.00" className={cn(glass.input, "h-14 rounded-xl font-bold font-mono text-base")} />
                        </div>
                        <div className="space-y-3">
                            <label className={cn(glass.microLabel, "font-bold opacity-80 pl-1")}>Annotation</label>
                            <Input placeholder="Comment..." className={cn(glass.input, "h-14 rounded-xl")} />
                        </div>
                        <button
                            onClick={() => toast.success("New billing rate added successfully!")}
                            className={cn(glass.btnPrimary, "w-full h-14 rounded-xl inline-flex items-center justify-center")}
                        >
                            <Plus className="w-5 h-5 mr-2" /> Commit Weight
                        </button>
                    </div>

                    {/* Drag and Drop Columns */}
                    <div className="pt-8 border-t border-border/50">
                        <div className="mb-6">
                            <h4 className={cn(glass.sectionTitle, "text-xl normal-case")}>Recursive Dimensionality</h4>
                            <p className={cn(glass.microLabel, "normal-case italic opacity-60 mt-2 font-semibold")}>Configure hierarchical ordering for batch output.</p>
                        </div>

                        <Reorder.Group axis="y" values={columns} onReorder={setColumns} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {columns.map((column) => (
                                <Reorder.Item
                                    key={column}
                                    value={column}
                                    className={cn(glass.card, "p-4 flex items-center justify-between cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group bg-muted/30 hover:bg-muted/50")}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center border border-border shadow-sm group-hover:bg-honey group-hover:border-honey group-hover:text-white transition-colors duration-200">
                                            <GripVertical className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                                        </div>
                                        <span className={cn(glass.microLabel, "font-bold")}>{column}</span>
                                    </div>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default MetersPayments;
