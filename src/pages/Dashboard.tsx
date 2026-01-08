import React, { useEffect, useState } from 'react';
import { analyticsService, AnalyticsSummary, PageViewData, TopPageData, ScanData, SalesData } from '@/services/analyticsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Loader2, TrendingUp, Users, QrCode, ShoppingCart, ArrowUpRight } from 'lucide-react';

const Dashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
    const [pageViews, setPageViews] = useState<PageViewData[]>([]);
    const [topPages, setTopPages] = useState<TopPageData[]>([]);
    const [scans, setScans] = useState<ScanData[]>([]);
    const [sales, setSales] = useState<SalesData[]>([]);
    const [timeRange, setTimeRange] = useState(30);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [summaryData, viewsData, pagesData, scansData, salesData] = await Promise.all([
                    analyticsService.getSummary(timeRange),
                    analyticsService.getPageViewsChart(timeRange),
                    analyticsService.getTopPages(10, timeRange),
                    analyticsService.getScansChart(timeRange),
                    analyticsService.getSalesAnalytics(timeRange)
                ]);

                setSummary(summaryData);
                setPageViews(viewsData);
                setTopPages(pagesData);
                setScans(scansData);
                setSales(salesData);
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [timeRange]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-muted/10">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/10 p-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Analytics Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Real-time insights into your platform's performance.</p>
                </div>
                <Tabs defaultValue="30" onValueChange={(v) => setTimeRange(Number(v))} className="w-[400px]">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="7">7 Days</TabsTrigger>
                        <TabsTrigger value="30">30 Days</TabsTrigger>
                        <TabsTrigger value="90">90 Days</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard
                    title="Page Views"
                    value={summary?.page_views?.toLocaleString() || '0'}
                    icon={<TrendingUp className="h-5 w-5 text-primary" />}
                    trend="+12%"
                />
                <SummaryCard
                    title="Unique Visitors"
                    value={summary?.unique_sessions?.toLocaleString() || '0'}
                    icon={<Users className="h-5 w-5 text-secondary" />}
                    trend="+5%"
                />
                <SummaryCard
                    title="QR Scans"
                    value={summary?.traceability_scans?.toLocaleString() || '0'}
                    icon={<QrCode className="h-5 w-5 text-honey-light" />}
                    trend="+24%"
                />
                <SummaryCard
                    title="Total Revenue"
                    value={`KES ${sales.reduce((acc, curr) => acc + curr.revenue, 0).toLocaleString()}`}
                    icon={<ShoppingCart className="h-5 w-5 text-nature-green" />}
                    trend="+8%"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Main Traffic Chart */}
                <Card className="col-span-1 lg:col-span-2 shadow-sm border-border">
                    <CardHeader>
                        <CardTitle>Traffic Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={pageViews}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(str) => new Date(str).toLocaleDateString()}
                                    stroke="#a3a3a3"
                                    fontSize={12}
                                />
                                <YAxis stroke="#a3a3a3" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                />
                                <Legend />
                                <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorViews)" name="Page Views" strokeWidth={2} />
                                <Area type="monotone" dataKey="visitors" stroke="hsl(var(--secondary))" fillOpacity={1} fill="url(#colorVisitors)" name="Unique Visitors" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Top Pages */}
                <Card className="shadow-sm border-border">
                    <CardHeader>
                        <CardTitle>Top Pages</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topPages.map((page, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border hover:border-primary/20 transition-colors">
                                    <span className="text-sm font-medium text-foreground truncate max-w-[200px]">{page.page_path}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-semibold text-foreground">{page.views.toLocaleString()} views</span>
                                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-full"
                                                style={{ width: `${(page.views / (topPages[0]?.views || 1)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Traceability Scans */}
                <Card className="shadow-sm border-border">
                    <CardHeader>
                        <CardTitle>Traceability Scans</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={scans}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(str) => new Date(str).toLocaleDateString()}
                                    stroke="#a3a3a3"
                                    fontSize={12}
                                />
                                <YAxis stroke="#a3a3a3" fontSize={12} />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--muted))' }}
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                />
                                <Bar dataKey="scans" fill="hsl(var(--honey-light))" radius={[4, 4, 0, 0]} name="QR Scans" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const SummaryCard = ({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) => (
    <Card className="shadow-sm border-border hover:shadow-md transition-shadow">
        <CardContent className="p-6">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <h3 className="text-2xl font-bold text-foreground mt-1">{value}</h3>
                </div>
                <div className="p-2 bg-muted rounded-lg">
                    {icon}
                </div>
            </div>
            <div className="flex items-center mt-4 text-xs font-medium text-nature-green bg-nature-green/10 w-fit px-2 py-1 rounded-full">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                {trend} vs last period
            </div>
        </CardContent>
    </Card>
);

export default Dashboard;
