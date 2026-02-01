
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminService, DocumentLog } from '@/services/adminService';
import { Loader2, FileText, Download, FileSpreadsheet } from "lucide-react";
import { format } from 'date-fns';

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
        if (format === 'pdf') return <FileText className="h-4 w-4 text-red-500" />;
        if (format.includes('xls')) return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
        return <FileText className="h-4 w-4 text-gray-500" />;
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Generated</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total_documents || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">PDF Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.by_format?.pdf || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Excel Exports</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {(stats?.by_format?.xlsx || 0) + (stats?.by_format?.xls || 0)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total_downloads || 0}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-t-4 border-t-blue-500">
                <CardHeader>
                    <CardTitle>Generated Documents Registry</CardTitle>
                    <CardDescription>Archive of all PDFs, invoices, and Excel exports</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Document Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Generated At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {documents.map((doc) => (
                                    <TableRow key={doc.id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            {getFileIcon(doc.file_format)}
                                            {doc.document_name}
                                        </TableCell>
                                        <TableCell className="capitalize">{doc.document_type.replace('_', ' ')}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{doc.category}</Badge>
                                        </TableCell>
                                        <TableCell>{format(new Date(doc.created_at), 'MMM d, yyyy HH:mm')}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm">
                                                <Download className="h-4 w-4 mr-1" />
                                                Download
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
