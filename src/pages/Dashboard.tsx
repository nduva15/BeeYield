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
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 p-8 space-y-12">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                <div className="space-y-2">
                    <h1 className="text-5xl font-black text-foreground tracking-tightest leading-none">
                        Intelligence <span className="text-primary italic">Pulse</span>
                    </h1>
                    <p className="text-xl text-muted-foreground font-medium">Real-time insights into your platform's performance.</p>
                </div>
                <Tabs defaultValue="30" onValueChange={(v) => setTimeRange(Number(v))} className="w-full lg:w-[400px]">
                    <TabsList className="grid w-full grid-cols-3 bg-muted/30 p-1.5 rounded-2xl backdrop-blur-sm border border-border/50">
                        <TabsTrigger value="7" className="rounded-xl font-black text-xs uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow">7 Days</TabsTrigger>
                        <TabsTrigger value="30" className="rounded-xl font-black text-xs uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow">30 Days</TabsTrigger>
                        <TabsTrigger value="90" className="rounded-xl font-black text-xs uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow">90 Days</TabsTrigger>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Main Traffic Chart */}
                <Card className="col-span-1 lg:col-span-2 border-none glass-dark sm:glass shadow-premium rounded-[3rem] overflow-hidden">
                    <CardHeader className="p-10 pb-0">
                        <CardTitle className="text-3xl font-black tracking-tightest flex items-center gap-3">
                            <TrendingUp className="h-8 w-8 text-primary" />
                            Traffic Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[500px] p-10 pt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={pageViews}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(str) => new Date(str).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={10}
                                    fontWeight="bold"
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={10}
                                    fontWeight="bold"
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    labelClassName="font-black text-xs uppercase tracking-widest text-muted-foreground mr-2"
                                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                                <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorViews)" name="Page Views" strokeWidth={4} />
                                <Area type="monotone" dataKey="visitors" stroke="hsl(var(--secondary))" fillOpacity={1} fill="url(#colorVisitors)" name="Unique Visitors" strokeWidth={4} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Top Pages */}
                <Card className="border-none glass-dark sm:glass shadow-premium rounded-[3rem] overflow-hidden">
                    <CardHeader className="p-10 pb-0">
                        <CardTitle className="text-3xl font-black tracking-tightest flex items-center gap-3">
                            <Users className="h-8 w-8 text-secondary" />
                            Engagement Hub
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-10 pt-6">
                        <div className="space-y-4">
                            {topPages.map((page, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-white/40 dark:bg-card/40 rounded-2xl border border-border/50 hover:border-primary transition-all group/item">
                                    <div className="space-y-1">
                                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground group-hover/item:text-primary transition-colors">{page.page_path}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-black text-foreground">{page.views.toLocaleString()}</span>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Interactions</span>
                                        </div>
                                    </div>
                                    <div className="w-24 h-2 bg-muted/30 rounded-full overflow-hidden shrink-0">
                                        <div
                                            className="h-full bg-secondary rounded-full"
                                            style={{ width: `${(page.views / (topPages[0]?.views || 1)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Traceability Scans */}
                <Card className="border-none glass-dark sm:glass shadow-premium rounded-[3rem] overflow-hidden">
                    <CardHeader className="p-10 pb-0">
                        <CardTitle className="text-3xl font-black tracking-tightest flex items-center gap-3">
                            <QrCode className="h-8 w-8 text-honey-light" />
                            Pulse Scans
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px] p-10 pt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={scans}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(str) => new Date(str).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={10}
                                    fontWeight="bold"
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={10}
                                    fontWeight="bold"
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.05)', radius: 12 }}
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    labelClassName="font-black text-xs uppercase tracking-widest text-muted-foreground"
                                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                />
                                <Bar dataKey="scans" fill="hsl(var(--honey-light))" radius={[12, 12, 4, 4]} name="QR Scans" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const SummaryCard = ({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) => (
    <Card className="border-none glass sm:glass-dark shadow-premium hover:shadow-glow transition-all duration-500 rounded-[2rem] overflow-hidden group">
        <CardContent className="p-8">
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">{title}</p>
                    <h3 className="text-4xl font-black text-foreground tracking-tightest">{value}</h3>
                </div>
                <div className="p-4 bg-primary/10 rounded-2xl text-primary transition-transform group-hover:scale-110">
                    {icon}
                </div>
            </div>
            <div className="flex items-center mt-6 text-[10px] font-black uppercase tracking-widest text-nature-green bg-nature-green/10 w-fit px-4 py-2 rounded-xl shadow-inner">
                <ArrowUpRight className="h-3 w-3 mr-2" />
                {trend} Growth
            </div>
        </CardContent>
    </Card>
);

export default Dashboard;
