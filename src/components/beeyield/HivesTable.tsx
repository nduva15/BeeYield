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
                        className="group flex items-center gap-2 hover:text-[#F4D03F] transition-colors"
                    >
                        <span className={glass.microLabel}>Registry ID</span>
                        <ArrowUpDown className="w-3 h-3 text-[#F4D03F]/40 group-hover:text-[#F4D03F]" />
                    </button>
                );
            },
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F9F7F2] border border-[#F4D03F]/10 flex items-center justify-center shadow-sm">
                        <Hash className="w-4 h-4 text-[#F4D03F]" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#1A1A1A] tracking-tight uppercase">{row.getValue('hive_code')}</span>
                        <div className="flex items-center gap-1">
                            <Binary className="w-2.5 h-2.5 text-[#F4D03F]/40" />
                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Firmware v5.2</span>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: ({ column }) => <span className={glass.microLabel}>Health State</span>,
            cell: ({ row }) => {
                const status = (row.getValue('status') as string || '').toLowerCase();
                const isHealthy = status.includes('healthy') || status.includes('active') || status === 'ok';
                const isWarning = status.includes('weak') || status.includes('warning');
                const isCritical = status.includes('critical') || status.includes('abandoned');

                return (
                    <div className={cn(
                        "inline-flex items-center gap-2 px-3 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider",
                        isHealthy ? 'bg-[#1B9157]/10 text-[#1B9157] border-[#1B9157]/20' :
                            isWarning ? 'bg-[#F4D03F]/10 text-[#F4D03F] border-[#F4D03F]/20' :
                                isCritical ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                    'bg-gray-100 text-gray-400 border-gray-200'
                    )}>
                        <div className={cn("w-1.5 h-1.5 rounded-full",
                            isHealthy ? 'bg-[#1B9157] animate-pulse' :
                                isWarning ? 'bg-[#F4D03F] animate-pulse' :
                                    isCritical ? 'bg-red-500 animate-pulse' :
                                        'bg-gray-400'
                        )} />
                        {row.getValue('status') || 'UNKNOWN'}
                    </div>
                )
            }
        },
        {
            accessorKey: 'latest_weight',
            header: ({ column }) => <span className={cn(glass.microLabel, "block text-center")}>Biomass</span>,
            cell: ({ row }) => {
                const hive = row.original;
                const weight = hive.latest_weight || (hive as any).weight;
                return (
                    <div className="flex flex-col items-center gap-1 group/cell">
                        <div className="flex items-center gap-2">
                            <Scale className="w-3.5 h-3.5 text-[#F4D03F]/40 group-hover/cell:text-[#F4D03F] transition-colors" />
                            <span className="text-sm font-bold tabular-nums text-[#1A1A1A]">
                                {weight ? weight.toFixed(1) : '---'}<span className="text-[10px] text-gray-400 ml-0.5 font-bold uppercase">kg</span>
                            </span>
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: 'latest_temp',
            header: ({ column }) => <span className={cn(glass.microLabel, "block text-center")}>Thermal</span>,
            cell: ({ row }) => {
                const hive = row.original;
                const temp = hive.latest_temp || (hive as any).temp;
                return (
                    <div className="flex flex-col items-center gap-1 group/cell">
                        <div className="flex items-center gap-2">
                            <Thermometer className={cn("w-3.5 h-3.5 transition-all duration-300",
                                temp && temp > 36 ? 'text-red-500' : 'text-[#F4D03F]/40 group-hover/cell:text-[#F4D03F]'
                            )} />
                            <span className={cn("text-sm font-bold tabular-nums transition-colors",
                                temp && temp > 36 ? 'text-red-500' : 'text-[#1A1A1A]'
                            )}>
                                {temp ? temp.toFixed(1) : '---'}<span className="text-[10px] text-gray-400 ml-0.5 font-bold uppercase">°C</span>
                            </span>
                        </div>
                    </div>
                )
            }
        },
        {
            id: 'battery',
            header: ({ column }) => <span className={cn(glass.microLabel, "text-right block")}>Signal</span>,
            cell: ({ row }) => {
                const battery = (row.original as any).battery;
                const batVal = battery || 95;
                return (
                    <div className="flex items-center gap-4 justify-end group/bat">
                        <div className="flex flex-col items-end gap-1.5">
                            <div className="flex items-center gap-2">
                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">PWR: </span>
                                <span className="text-xs font-bold tabular-nums text-[#1A1A1A]">{batVal}%</span>
                            </div>
                            <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden border border-[#F4D03F]/5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${batVal}%` }}
                                    className={cn("h-full rounded-full transition-all duration-500",
                                        batVal < 20 ? "bg-red-500" : "bg-[#F4D03F]"
                                    )}
                                />
                            </div>
                        </div>
                        <Battery className={cn("w-4 h-4 transition-all duration-300",
                            batVal < 20 ? "text-red-500 animate-pulse" : "text-[#F4D03F]/40 group-hover/bat:text-[#F4D03F]"
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
        <div className="space-y-4">
            {/* Search */}
            <div className={cn(glass.filterBar, "bg-white")}>
                <div className="flex-1 w-full relative group/search">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 opacity-50 group-focus-within/search:opacity-100 transition-opacity" />
                    <Input
                        placeholder="Search fleet registry..."
                        value={globalFilter ?? ''}
                        onChange={(event) => setGlobalFilter(event.target.value)}
                        className="h-9 pl-9 bg-transparent border-none text-xs font-bold text-[#1A1A1A] placeholder:text-gray-400 focus-visible:ring-0"
                    />
                </div>
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-[#1B9157]/5 rounded-lg border border-[#1B9157]/10">
                    <Activity className="w-3 h-3 text-[#1B9157]" />
                    <span className="text-[10px] font-bold text-[#1B9157] uppercase tracking-wider">Live Link</span>
                </div>
            </div>

            {/* Table */}
            <div className={cn(glass.table, "bg-white")}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id} className="bg-[#F9F7F2]">
                                    {headerGroup.headers.map((header) => (
                                        <th key={header.id} className="px-5 py-3 border-b border-[#F4D03F]/10">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-[#F4D03F]/5">
                            <AnimatePresence mode="popLayout">
                                {table.getRowModel().rows.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <motion.tr
                                            key={row.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className={cn(
                                                "hover:bg-[#F4D03F]/5 transition-colors group",
                                                onRowClick && "cursor-pointer"
                                            )}
                                            onClick={() => onRowClick && onRowClick(row.original)}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <td key={cell.id} className="px-5 py-3 align-middle">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={columns.length} className="h-40 text-center">
                                            <div className="flex flex-col items-center justify-center gap-4">
                                                <div className="w-16 h-16 rounded-xl bg-[#F4D03F]/5 border border-[#F4D03F]/20 flex items-center justify-center">
                                                    <SearchCode className="w-8 h-8 text-[#F4D03F] opacity-30" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-bold text-[#1A1A1A] tracking-tight uppercase">Registry Null</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Revise search parameters</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {table.getPageCount() > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Segment {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className={cn(glass.btnSecondary, "h-8 px-4 text-[10px] uppercase tracking-widest disabled:opacity-30")}
                        >
                            <ChevronLeft className="w-3.5 h-3.5 mr-2" />
                            Prev
                        </button>
                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className={cn(glass.btnPrimary, "h-8 px-4 text-[10px] uppercase tracking-widest disabled:opacity-30")}
                        >
                            Next
                            <ChevronRight className="w-3.5 h-3.5 ml-2" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
