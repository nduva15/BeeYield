import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar, Filter } from 'lucide-react';

const MetersReports: React.FC = () => {
    const reports = [
        { id: 1, name: 'Monthly Consumption Summary', period: 'January 2024', type: 'PDF', size: '2.4 MB' },
        { id: 2, name: 'Quarterly Efficiency Report', period: 'Q4 2023', type: 'PDF', size: '5.1 MB' },
        { id: 3, name: 'Annual Billing Statement', period: '2023', type: 'PDF', size: '1.8 MB' },
        { id: 4, name: 'Alarms & Incidents Log', period: 'Dec 2023', type: 'CSV', size: '450 KB' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-[2.5rem] font-bold text-[#0F172A] dark:text-white tracking-tight">Reports</h1>
                <Button className="bg-[#B48428] hover:bg-[#966b1d] text-white">
                    <FileText className="w-4 h-4 mr-2" /> Generate New Report
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {reports.map((report) => (
                    <Card key={report.id} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                        <CardContent className="p-6">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <FileText className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white leading-tight mb-2">{report.name}</h3>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                                <Calendar className="w-3 h-3" />
                                {report.period}
                            </div>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <span className="text-[10px] font-bold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-400">{report.type}</span>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-primary">
                                    <Download className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default MetersReports;
