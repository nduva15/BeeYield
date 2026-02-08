
import React, { useState } from 'react';
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
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');

    const columns: ColumnDef<Hive>[] = [
        {
            accessorKey: 'hive_code',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="hover:bg-transparent pl-0 text-left font-bold text-slate-700 dark:text-slate-300"
                    >
                        Hive ID
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => <div className="font-bold text-[#1e293b] dark:text-white">{row.getValue('hive_code')}</div>,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = (row.getValue('status') as string || '').toLowerCase();
                const isHealthy = status.includes('healthy') || status.includes('active');
                const isWarning = status.includes('weak') || status.includes('warning');
                const isCritical = status.includes('critical') || status.includes('abandoned');

                return (
                    <Badge className={
                        isHealthy ? 'bg-green-100 text-green-700 hover:bg-green-100 border-none' :
                            isWarning ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none' :
                                isCritical ? 'bg-red-100 text-red-700 hover:bg-red-100 border-none' :
                                    'bg-slate-100 text-slate-700 hover:bg-slate-100 border-none'
                    }>
                        {row.getValue('status') || 'Unknown'}
                    </Badge>
                )
            }
        },
        {
            accessorKey: 'latest_weight',
            header: 'Weight',
            cell: ({ row }) => {
                const hive = row.original;
                const weight = hive.latest_weight || (hive as any).weight;
                return (
                    <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-slate-400" />
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                            {weight ? `${weight.toFixed(1)}kg` : '-'}
                        </span>
                    </div>
                )
            }
        },
        {
            accessorKey: 'latest_temp',
            header: 'Temp',
            cell: ({ row }) => {
                const hive = row.original;
                const temp = hive.latest_temp || (hive as any).temp;
                return (
                    <div className="flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-slate-400" />
                        <span className={`font-mono font-bold ${temp && temp > 36 ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                            {temp ? `${temp.toFixed(1)}°C` : '-'}
                        </span>
                    </div>
                )
            }
        },
        {
            id: 'humidity',
            header: 'Humidity',
            cell: ({ row }) => {
                const humidity = (row.original as any).humidity;
                return (
                    <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-blue-400" />
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                            {humidity ? `${humidity.toFixed(0)}%` : '-'}
                        </span>
                    </div>
                )
            }
        },
        {
            id: 'battery',
            header: 'Battery',
            cell: ({ row }) => {
                const battery = (row.original as any).battery;
                return (
                    <div className="flex items-center gap-2">
                        <Battery className={cn("w-4 h-4", battery && battery < 20 ? "text-red-500" : "text-green-500")} />
                        <span className="text-xs font-bold text-slate-500">{battery ? `${battery.toFixed(0)}%` : '95%'}</span>
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
            {/* Full component with search and table */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                <Search className="w-4 h-4 text-slate-400 ml-2" />
                <Input
                    placeholder="Filter hives..."
                    value={globalFilter ?? ''}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="border-none bg-transparent h-8 focus-visible:ring-0"
                />
            </div>

            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 uppercase text-xs font-bold">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th key={header.id} className="px-6 py-4">
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-[#1e1e1e]">
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
                                    className={cn(
                                        "hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors",
                                        onRowClick && "cursor-pointer"
                                    )}
                                    onClick={() => onRowClick && onRowClick(row.original)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="px-6 py-4">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="h-24 text-center text-slate-400 italic">
                                    No hives found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination if needed */}
            {table.getPageCount() > 1 && (
                <div className="flex items-center justify-end gap-2 text-sm text-slate-500">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <span>
                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
};
