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
import { ArrowUpDown, Battery, Thermometer, Weight, Activity, Search, Scale, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Hive } from '@/services/beeyieldService';

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
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="hover:bg-transparent pl-0 text-left font-black uppercase text-[10px] tracking-widest text-slate-400"
                    >
                        Registry ID
                        <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                    </Button>
                );
            },
            cell: ({ row }) => <div className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{row.getValue('hive_code')}</div>,
        },
        {
            accessorKey: 'status',
            header: ({ column }) => <span className="font-black uppercase text-[10px] tracking-widest text-slate-400">Health Status</span>,
            cell: ({ row }) => {
                const status = (row.getValue('status') as string || '').toLowerCase();
                const isHealthy = status.includes('healthy') || status.includes('active') || status === 'ok';
                const isWarning = status.includes('weak') || status.includes('warning');
                const isCritical = status.includes('critical') || status.includes('abandoned');

                return (
                    <Badge className={cn(
                        "rounded-full px-3 py-1 font-black text-[9px] uppercase tracking-widest border-none shadow-sm",
                        isHealthy ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' :
                            isWarning ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400' :
                                isCritical ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400' :
                                    'bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-white/20'
                    )}>
                        {row.getValue('status') || 'Unknown Source'}
                    </Badge>
                )
            }
        },
        {
            accessorKey: 'latest_weight',
            header: ({ column }) => <span className="font-black uppercase text-[10px] tracking-widest text-slate-400 text-center block">Biomass</span>,
            cell: ({ row }) => {
                const hive = row.original;
                const weight = hive.latest_weight || (hive as any).weight;
                return (
                    <div className="flex items-center gap-2 justify-center">
                        <Scale className="w-3.5 h-3.5 text-slate-300" />
                        <span className="font-black text-slate-900 dark:text-white tabular-nums italic">
                            {weight ? `${weight.toFixed(1)}kg` : '---'}
                        </span>
                    </div>
                )
            }
        },
        {
            accessorKey: 'latest_temp',
            header: ({ column }) => <span className="font-black uppercase text-[10px] tracking-widest text-slate-400 text-center block">Internal Temp</span>,
            cell: ({ row }) => {
                const hive = row.original;
                const temp = hive.latest_temp || (hive as any).temp;
                return (
                    <div className="flex items-center gap-2 justify-center">
                        <Thermometer className="w-3.5 h-3.5 text-slate-300" />
                        <span className={cn("font-black tabular-nums italic", temp && temp > 36 ? 'text-red-500' : 'text-slate-900 dark:text-white')}>
                            {temp ? `${temp.toFixed(1)}°C` : '---'}
                        </span>
                    </div>
                )
            }
        },
        {
            id: 'battery',
            header: ({ column }) => <span className="font-black uppercase text-[10px] tracking-widest text-slate-400 text-right block">Connectivity</span>,
            cell: ({ row }) => {
                const battery = (row.original as any).battery;
                return (
                    <div className="flex items-center gap-2 justify-end">
                        <Battery className={cn("w-3.5 h-3.5", battery && battery < 20 ? "text-red-500" : "text-emerald-500")} />
                        <span className="text-[10px] font-black text-slate-400 tabular-nums uppercase">{battery ? `${battery.toFixed(0)}%` : '95%'}</span>
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
        <div className="space-y-6">
            {/* Full component with search and table */}
            <div className="flex items-center gap-4 bg-muted/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-border shadow-inner">
                <Search className="w-5 h-5 text-honey" />
                <Input
                    placeholder="Search master registry..."
                    value={globalFilter ?? ''}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="border-none bg-transparent h-10 focus-visible:ring-0 text-[11px] font-black uppercase tracking-widest text-foreground placeholder:text-muted-foreground/50"
                />
            </div>

            <div className="rounded-[2.5rem] border border-border bg-white/80 backdrop-blur-md overflow-hidden shadow-xl shadow-black/5">
                <table className="w-full text-sm text-left border-separate border-spacing-0">
                    <thead className="bg-muted/30 border-b border-border">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th key={header.id} className="px-10 py-8 first:rounded-tl-[2.5rem] last:rounded-tr-[2.5rem]">
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-border">
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
                                    className={cn(
                                        "group hover:bg-honey/5 transition-colors",
                                        onRowClick && "cursor-pointer"
                                    )}
                                    onClick={() => onRowClick && onRowClick(row.original)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="px-10 py-8 align-middle">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="h-40 text-center text-muted-foreground font-black uppercase text-[10px] tracking-widest opacity-50 italic">
                                    No registry entries found in current scope.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination if needed */}
            {table.getPageCount() > 1 && (
                <div className="flex items-center justify-between px-6 pt-4">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-6 py-3 bg-white/50 backdrop-blur-md rounded-full border border-border shadow-sm">
                        Network Page {table.getState().pagination.pageIndex + 1} // {table.getPageCount()}
                    </p>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="h-12 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest text-muted-foreground hover:text-honey border border-border bg-white/50 backdrop-blur-md shadow-sm disabled:opacity-30 transition-all active:scale-95"
                        >
                            Previous
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="h-12 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest text-muted-foreground hover:text-honey border border-border bg-white/50 backdrop-blur-md shadow-sm disabled:opacity-30 transition-all active:scale-95"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
