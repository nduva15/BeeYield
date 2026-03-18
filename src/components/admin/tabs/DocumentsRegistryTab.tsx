
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminService, DocumentLog } from '@/services/adminService';
import { Loader2, FileText, Download, FileSpreadsheet, RefreshCw, Files, FileSearch } from "lucide-react";
import { format } from 'date-fns';
import { glass, PageHeader, GlassStatCard } from '@/components/beeyield/GlassTheme';
import { cn } from '@/lib/utils';

export function DocumentsRegistryTab() {
    const [loading, setLoading] = useState(true);
    const [documents, setDocuments] = useState<DocumentLog[]>([]);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [docsData, statsData] = await Promise.all([
                adminService.getGeneratedDocuments(),
                adminService.getDocumentStats()
            ]);
            setDocuments(docsData || []);
            setStats(statsData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getFileIcon = (format: string) => {
        if (format === 'pdf') return <FileText className="h-4 w-4 text-primary" />;
        if (format.includes('xls')) return <FileSpreadsheet className="h-4 w-4 text-emerald-500" />;
        return <FileText className="h-4 w-4 text-primary/60" />;
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
            <PageHeader
                icon={Files}
                label="Digital Assets"
                title="Document Registry"
                subtitle="Archive of generated certificates, invoices, and system exports."
                actions={
                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border/50 hover:bg-primary/10 transition-all active:scale-95" onClick={loadData}>
                        <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                    </Button>
                }
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <GlassStatCard
                    label="Repository"
                    value={stats?.total_documents || 0}
                    icon={Files}
                />
                <GlassStatCard
                    label="PDF Reports"
                    value={stats?.by_format?.pdf || 0}
                    icon={FileText}
                />
                <GlassStatCard
                    label="Exports"
                    value={(stats?.by_format?.xlsx || 0) + (stats?.by_format?.xls || 0)}
                    icon={FileSpreadsheet}
                />
                <GlassStatCard
                    label="Retrieved"
                    value={stats?.total_downloads || 0}
                    icon={Download}
                />
            </div>

            <div className={cn(glass.section, "p-0 overflow-hidden")}>
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-[#F4D03F]/10 bg-muted/20">
                            <TableHead className="py-4 px-6 font-black text-[10px] tracking-widest uppercase">Asset Name</TableHead>
                            <TableHead className="py-4 px-6 font-black text-[10px] tracking-widest uppercase">Protocol Class</TableHead>
                            <TableHead className="py-4 px-6 font-black text-[10px] tracking-widest uppercase text-center">Category</TableHead>
                            <TableHead className="py-4 px-6 font-black text-[10px] tracking-widest uppercase">Generated At</TableHead>
                            <TableHead className="py-4 px-6 font-black text-[10px] tracking-widest uppercase text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && documents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="py-24 text-center">
                                    <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto opacity-50" />
                                    <p className="mt-4 font-black text-[10px] tracking-widest text-muted-foreground uppercase">Scanning document archive...</p>
                                </TableCell>
                            </TableRow>
                        ) : documents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="py-24 text-center">
                                    <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                                        <Files className="h-8 w-8 text-muted-foreground/30" />
                                    </div>
                                    <p className="font-black text-[10px] tracking-widest text-muted-foreground uppercase">No documents found in registry</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            documents.map((doc) => (
                                <TableRow key={doc.id} className="hover:bg-muted/10 transition-all border-b border-[#F4D03F]/10 group">
                                    <TableCell className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-background/50 border border-border/50 group-hover:border-primary/30 transition-colors">
                                                {getFileIcon(doc.file_format)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-[11px] tracking-tighter uppercase">{doc.document_name}</span>
                                                <span className="font-mono text-[8px] opacity-40 uppercase tracking-widest">{doc.file_format} ARCHIVE</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-5">
                                        <span className="font-black text-[9px] uppercase tracking-widest opacity-60">
                                            {doc.document_type.replace('_', ' ')}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-6 py-5 text-center">
                                        <Badge variant="outline" className="font-black text-[8px] tracking-widest px-2 py-0.5 rounded-lg border-primary/20 bg-primary/5 text-primary uppercase">
                                            {doc.category}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-black text-[10px] tracking-tighter">{format(new Date(doc.created_at), 'MMM dd, yyyy')}</span>
                                            <span className="font-mono text-[9px] opacity-40 tracking-widest">{format(new Date(doc.created_at), 'HH:mm')}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-5 text-right">
                                        <Button variant="outline" size="sm" className="h-8 rounded-xl border-border/50 font-black text-[9px] tracking-tighter hover:bg-primary/10 transition-all active:scale-95 px-3">
                                            <Download className="h-3 w-3 mr-1.5" />
                                            DOWNLOAD
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

