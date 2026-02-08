
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
import { ArrowUpDown, Battery, Thermometer, Weight, Activity, Search } from 'lucide-react';
import { Hive } from '@/services/beeyieldService';

interface HivesTableProps {
    data: Hive[];
}

export const HivesTable: React.FC<HivesTableProps> = ({ data }) => {
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
                const status = row.getValue('status') as string;
                return (
                    <Badge className={
                        status === 'Active & Healthy' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                            status === 'Weak Colony' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' :
                                'bg-slate-100 text-slate-700 hover:bg-slate-100'
                    }>
                        {status}
                    </Badge>
                )
            }
        },
        {
            accessorKey: 'latest_weight',
            header: 'Weight (kg)',
            cell: ({ row }) => {
                const weight = row.original.latest_weight;
                return (
                    <div className="flex items-center gap-2">
                        <Weight className="w-4 h-4 text-slate-400" />
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                            {weight ? weight.toFixed(1) : '-'}
                        </span>
                    </div>
                )
            }
        },
        {
            accessorKey: 'latest_temp',
            header: 'Internal Temp',
            cell: ({ row }) => {
                const temp = row.original.latest_temp;
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
            id: 'battery',
            header: 'Battery',
            cell: () => {
                // Mock battery for now as it's mainly on device level
                return (
                    <div className="flex items-center gap-2">
                        <Battery className="w-4 h-4 text-green-500" />
                        <span className="text-xs font-bold text-slate-500">Good</span>
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
                                <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
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
