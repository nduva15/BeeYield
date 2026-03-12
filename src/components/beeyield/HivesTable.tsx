import React from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    ColumnDef,
    flexRender,
    SortingState,
} from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, Battery, Thermometer, Weight, Activity, Search, Scale, Droplets, ChevronLeft, ChevronRight, Hash, Binary, SearchCode, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Hive } from '@/services/beeyieldService';
import { glass } from './GlassTheme';
import { motion, AnimatePresence } from 'framer-motion';

interface HivesTableProps {
    data: Hive[];
    onRowClick?: (hive: Hive) => void;
}

export const HivesTable: React.FC<HivesTableProps> = ({ data, onRowClick }) => {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = React.useState('');

    const columns: ColumnDef<Hive>[] = [
        {
            accessorKey: 'hive_code',
            header: ({ column }) => {
                return (
                    <button
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="group flex items-center gap-4 hover:text-[#F4D03F] transition-colors py-4 px-6 rounded-2xl hover:bg-[#F4D03F]/5"
                    >
                        <span className={cn(glass.microLabel, "text-foreground/40 group-hover:text-[#F4D03F] transition-colors italic font-black uppercase tracking-[0.3em]")}>REGISTRY_ID</span>
                        <ArrowUpDown className="w-4 h-4 text-[#F4D03F]/20 group-hover:text-[#F4D03F] transition-colors" />
                    </button>
                );
            },
            cell: ({ row }) => (
                <div className="flex items-center gap-8 pl-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#F9F7F2] border border-[#F4D03F]/10 flex items-center justify-center shadow-4xl group-hover:scale-125 group-hover:rotate-6 group-hover:bg-[#F4D03F]/10 group-hover:border-[#F4D03F]/40 transition-all duration-1000">
                        <Hash className="w-6 h-6 text-[#F4D03F] group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-3xl font-black italic text-foreground tracking-tighter tabular-nums group-hover:text-[#F4D03F] transition-colors uppercase leading-none">{row.getValue('hive_code')}</span>
                        <div className="flex items-center gap-3">
                            <Binary className="w-3.5 h-3.5 text-[#F4D03F]/20" />
                            <span className="text-[9px] font-black text-[#F4D03F]/20 uppercase tracking-[0.4em] italic font-mono leading-none">NODE_v5.2.0</span>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: ({ column }) => <span className={cn(glass.microLabel, "text-foreground/40 py-4 block italic font-black uppercase tracking-[0.3em] pl-6")}>HEALTH_STATUS</span>,
            cell: ({ row }) => {
                const status = (row.getValue('status') as string || '').toLowerCase();
                const isHealthy = status.includes('healthy') || status.includes('active') || status === 'ok';
                const isWarning = status.includes('weak') || status.includes('warning');
                const isCritical = status.includes('critical') || status.includes('abandoned');

                return (
                    <div className="pl-6">
                        <div className={cn(
                            "inline-flex items-center gap-4 px-8 py-2.5 rounded-full border shadow-3xl backdrop-blur-3xl skew-x-[-12deg] transition-all duration-700",
                            isHealthy ? 'bg-[#1B9157]/ text-[#1B9157] border-[#1B9157]/' :
                                isWarning ? 'bg-[#F4D03F]/ text-[#F4D03F] border-amber-500/20' :
                                    isCritical ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                        'bg-foreground/5 text-foreground/40 border-border/50'
                        )}>
                            <div className="flex items-center gap-4 skew-x-[12deg]">
                                <div className={cn("w-2.5 h-2.5 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)]",
                                    isHealthy ? 'bg-[#1B9157] shadow-emerald-500/80 animate-pulse' :
                                        isWarning ? 'bg-[#F4D03F] shadow-amber-500/80 animate-pulse' :
                                            isCritical ? 'bg-red-500 shadow-red-500/80 animate-pulse' :
                                                'bg-foreground/40'
                                )} />
                                <span className={cn(glass.microLabel, "font-black tracking-[0.2em] italic uppercase text-[11px]")}>{row.getValue('status') || 'UNKNOWN'}</span>
                            </div>
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: 'latest_weight',
            header: ({ column }) => <span className={cn(glass.microLabel, "text-foreground/40 py-4 text-center block italic font-black uppercase tracking-[0.3em]")}>BIOMASS_INDEX</span>,
            cell: ({ row }) => {
                const hive = row.original;
                const weight = hive.latest_weight || (hive as any).weight;
                return (
                    <div className="flex flex-col items-center gap-2 group/cell">
                        <div className="flex items-center gap-4">
                            <Scale className="w-5 h-5 text-[#F4D03F] opacity-20 group-hover/cell:opacity-100 group-hover/cell:scale-125 transition-all duration-700" />
                            <span className="text-3xl font-black italic tabular-nums text-foreground/80 group-hover/cell:text-[#F4D03F] transition-colors">
                                {weight ? weight.toFixed(1) : '---'}<span className="text-sm opacity-20 ml-1 font-black uppercase align-baseline">kg</span>
                            </span>
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: 'latest_temp',
            header: ({ column }) => <span className={cn(glass.microLabel, "text-foreground/40 py-4 text-center block italic font-black uppercase tracking-[0.3em]")}>THERMAL_TRACE</span>,
            cell: ({ row }) => {
                const hive = row.original;
                const temp = hive.latest_temp || (hive as any).temp;
                return (
                    <div className="flex flex-col items-center gap-2 group/cell">
                        <div className="flex items-center gap-4">
                            <Thermometer className={cn("w-5 h-5 transition-all duration-700 group-hover/cell:scale-125",
                                temp && temp > 36 ? 'text-red-500' : 'text-[#F4D03F] opacity-20 group-hover/cell:opacity-100'
                            )} />
                            <span className={cn("text-3xl font-black italic tabular-nums text-foreground/80 transition-colors",
                                temp && temp > 36 ? 'text-red-500' : 'group-hover/cell:text-[#F4D03F]'
                            )}>
                                {temp ? temp.toFixed(1) : '---'}<span className="text-sm opacity-20 ml-1 font-black uppercase align-baseline">°C</span>
                            </span>
                        </div>
                    </div>
                )
            }
        },
        {
            id: 'battery',
            header: ({ column }) => <span className={cn(glass.microLabel, "text-foreground/40 py-4 text-right block italic font-black uppercase tracking-[0.3em] pr-12")}>SIGNAL_UPLINK</span>,
            cell: ({ row }) => {
                const battery = (row.original as any).battery;
                const batVal = battery || 95;
                return (
                    <div className="flex items-center gap-8 justify-end pr-12 group/bat">
                        <div className="flex flex-col items-end gap-3">
                            <div className="flex items-center gap-4">
                                <span className="text-[9px] font-black text-foreground/20 uppercase tracking-[0.4em] italic leading-none group-hover/bat:text-[#F4D03F]/60 transition-colors">PWR_LVL: </span>
                                <span className="text-2xl font-black tabular-nums italic text-foreground tracking-tighter leading-none">{batVal}%</span>
                            </div>
                            <div className="w-24 h-2 bg-[#F9F7F2] rounded-full overflow-hidden shadow-inner p-[1px] border border-[#F4D03F]/10">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${batVal}%` }}
                                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                                    className={cn("h-full rounded-full shadow-4xl relative overflow-hidden",
                                        batVal < 20 ? "bg-red-500" : "bg-[#F4D03F]"
                                    )}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                                </motion.div>
                            </div>
                        </div>
                        <Battery className={cn("w-8 h-8 transition-all duration-1000",
                            batVal < 20 ? "text-red-500 animate-pulse scale-125 shadow-[0_0_20px_rgba(239,68,68,0.5)]" :
                                "text-[#F4D03F] opacity-20 group-hover/bat:opacity-100 group-hover/bat:scale-125 group-hover/bat:rotate-12"
                        )} />
                    </div>
                )
            }
        }
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        state: {
            sorting,
            globalFilter,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
    });

    return (
        <div className="space-y-12">
            {/* ── High-Intensity Multi-plex Search ── */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(glass.card, "p-4 px-12 shadow-4xl border-[#F4D03F]/10 flex flex-col md:flex-row items-center gap-10 group bg-gray-400 backdrop-blur-3xl rounded-[3.5rem]")}
            >
                <div className="flex-1 w-full relative group/search">
                    <Search className="absolute left-10 top-1/2 -translate-y-1/2 w-8 h-8 text-[#F4D03F] opacity-20 group-focus-within/search:opacity-100 transition-opacity duration-700" />
                    <Input
                        placeholder="QUERY_INDUSTRIAL_FLEET_REGISTRY..."
                        value={globalFilter ?? ''}
                        onChange={(event) => setGlobalFilter(event.target.value)}
                        className={cn(glass.input, "border-none bg-transparent h-20 pl-24 focus-visible:ring-0 text-xl font-black uppercase tracking-[0.3em] italic placeholder:opacity-5 flex-1 shadow-none rounded-[2rem]")}
                    />
                </div>
                <div className="flex items-center gap-6 pr-6">
                    <div className={cn(glass.badge, "bg-[#F4D03F]/10 text-[#F4D03F] border-[#F4D03F]/20 px-8 py-3 shadow-3xl skew-x-[-12deg]")}>
                        <div className="flex items-center gap-4 skew-x-[12deg]">
                            <Activity className="w-5 h-5 animate-pulse" />
                            <span className="font-black italic uppercase text-[11px] tracking-widest">Live_Telemetry_Link</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── Master Asset Table Matrix ── */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={cn(glass.card, "p-0 overflow-hidden shadow-4xl border-[#F4D03F]/10 relative bg-gray-400 backdrop-blur-3xl rounded-[4rem]")}
            >
                <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-[#F4D03F]/[0.04] rounded-full blur-[150px] pointer-events-none -mr-80 -mt-80" />

                <div className="overflow-x-auto thin-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead className="bg-gray-400 backdrop-blur-3xl">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th key={header.id} className="py-14 border-b border-[#F4D03F]/10 first:pl-6 last:pr-6 align-middle">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <AnimatePresence mode="popLayout">
                                {table.getRowModel().rows.length ? (
                                    table.getRowModel().rows.map((row, i) => (
                                        <motion.tr
                                            key={row.id}
                                            initial={{ opacity: 0, x: -30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                            className={cn(
                                                "group hover:bg-[#F4D03F]/[0.06] transition-all duration-700",
                                                onRowClick && "cursor-pointer"
                                            )}
                                            onClick={() => onRowClick && onRowClick(row.original)}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <td key={cell.id} className="py-14 align-middle transition-all duration-700 first:pl-6 last:pr-6">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </motion.tr>
                                    ))
                                ) : (
                                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <td colSpan={columns.length} className="h-[500px] text-center">
                                            <div className="flex flex-col items-center justify-center space-y-12 group/null">
                                                <div className="w-40 h-40 rounded-[4rem] bg-[#F4D03F]/5 border border-[#F4D03F]/20 flex items-center justify-center mb-6 group-hover/null:scale-110 group-hover/null:rotate-12 transition-all duration-1000 shadow-4xl">
                                                    <SearchCode className="w-20 h-20 text-[#F4D03F] opacity-20 group-hover/null:opacity-100 transition-opacity" />
                                                </div>
                                                <div className="space-y-4">
                                                    <p className="text-4xl font-black italic text-foreground tracking-tighter uppercase leading-none">Null_Registry_Results</p>
                                                    <p className="text-[14px] opacity-40 font-black tracking-widest uppercase italic italic">Revise query parameters or establish first node link</p>
                                                </div>
                                            </div>
                                        </td>
                                    </motion.tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* ── Industrial Pagination Matrix ── */}
            {table.getPageCount() > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-10">
                    <div className={cn(glass.card, "bg-gray-400 text-foreground border-[#F4D03F]/10 py-4 px-12 h-18 shadow-4xl backdrop-blur-3xl rounded-[2.5rem] font-black tracking-[0.4em] italic text-[11px] uppercase flex items-center gap-6")}>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#F4D03F] animate-pulse" />
                        Segment {table.getState().pagination.pageIndex + 1} <span className="opacity-20">/</span> {table.getPageCount()}
                    </div>
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className={cn(glass.btnSecondary, "h-18 px-12 font-black italic uppercase tracking-widest text-xs rounded-[2rem] disabled:opacity-10 disabled:cursor-not-allowed bg-gray-400 shadow-4xl border-[#F4D03F]/10 hover:bg-[#F4D03F] hover:text-[#1A1A1A] transition-all duration-700")}
                        >
                            <ChevronLeft className="w-6 h-6 mr-4" />
                            Prev_Seg
                        </button>
                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className={cn(glass.btnPrimary, "h-18 px-12 bg-[#F4D03F] text-[#1A1A1A] font-black italic uppercase tracking-widest text-xs shadow-[0_30px_60px_-10px_rgba(251,191,36,0.3)] rounded-[2rem] disabled:opacity-10 disabled:cursor-not-allowed transition-all duration-700")}
                        >
                            Next_Seg
                            <ChevronRight className="w-6 h-6 ml-4" />
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
                .animate-shimmer { animation: shimmer 2.5s infinite linear; }
            `}</style>
        </div>
    );
};
