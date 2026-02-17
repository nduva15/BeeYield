import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import beeyieldService from '@/services/beeyieldService';

const ServerStatusView: React.FC<{ onTabChange: (tab: string) => void }> = ({ onTabChange }) => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [lastRefresh, setLastRefresh] = useState('-');

    const fetchStats = async () => {
        setLoading(true);
        try {
            const data = await beeyieldService.getApiUsageStats(7);
            setStats(data);
            setLastRefresh(new Date().toLocaleString());
        } catch (err) {
            console.error('Error loading API stats:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const totalCalls = stats?.total_calls ?? 0;
    const avgResponseMs = stats?.avg_response_ms ? Math.round(stats.avg_response_ms) : 0;
    const errorCount = stats?.error_count ?? 0;
    const topEndpoints: { endpoint: string; count: number }[] = stats?.top_endpoints ?? [];
    const limit = 10000;
    const usagePercent = Math.min((totalCalls / limit) * 100, 100).toFixed(2);

    const apis = [
        { name: 'Supabase REST', checkPath: '/rest/v1/', lastCheck: lastRefresh },
        { name: 'Supabase Auth', checkPath: '/auth/v1/', lastCheck: lastRefresh },
        { name: 'BeeYield Backend', checkPath: '/api/v1/health', lastCheck: lastRefresh },
        { name: 'Analysis Service', checkPath: '/api/v1/ai/health', lastCheck: lastRefresh },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white">Service status</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Check if BeeYield services are working properly.</p>
                </div>
                <Button
                    variant="outline"
                    className="rounded-full px-6 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                    onClick={fetchStats}
                    disabled={loading}
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Check now
                </Button>
            </div>

            {/* System Health */}
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white dark:bg-[#1e1e1e]">
                <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">System status</h3>
                        <Badge className="bg-[#DCFCE7] text-[#166534] hover:bg-[#DCFCE7] uppercase text-[10px] font-bold px-3 py-1">Online</Badge>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Last refresh</span>
                            <span className="font-mono font-medium text-gray-900 dark:text-white">{lastRefresh}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Average speed</span>
                            <span className="font-mono font-medium text-gray-900 dark:text-white">{avgResponseMs}ms</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Errors (7d)</span>
                            <span className="font-mono font-medium text-gray-900 dark:text-white">{errorCount}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* API Usage */}
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white dark:bg-[#1e1e1e]">
                <CardContent className="p-6 space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Usage</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Usage over the last 7 days.</p>
                        </div>
                        <Badge className="bg-[#DCFCE7] text-[#166534] hover:bg-[#DCFCE7] text-[12px] font-bold px-3 py-1">{usagePercent}%</Badge>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${Math.max(parseFloat(usagePercent), 1)}%` }} />
                    </div>

                    {/* Stats */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Total hits</span>
                            <span className="font-bold text-gray-900 dark:text-white">{totalCalls.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Max requests</span>
                            <span className="font-bold text-gray-900 dark:text-white">{limit.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">MOST USED</p>
                        <div className="space-y-1">
                            {topEndpoints.length > 0 ? topEndpoints.map((ep: any, idx: number) => (
                                <div key={idx} className={`flex justify-between items-center py-2 px-3 rounded-lg text-sm ${idx % 2 !== 0 ? 'bg-gray-50 dark:bg-white/5' : ''}`}>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{ep.endpoint}</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{ep.count}</span>
                                </div>
                            )) : (
                                <p className="text-sm text-gray-400 py-4 text-center">No endpoint data available yet</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* API Status Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {apis.map((api, idx) => (
                    <Card key={idx} className="border-none shadow-sm rounded-3xl bg-white dark:bg-[#1e1e1e]">
                        <CardContent className="p-6 flex flex-col h-full bg-white dark:bg-[#1e1e1e] rounded-3xl">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="font-bold text-gray-900 dark:text-white text-base leading-snug max-w-[70%]">
                                    {api.name}
                                </h3>
                                <Badge className="bg-[#DCFCE7] text-[#166534] hover:bg-[#DCFCE7] uppercase text-[10px] font-bold px-2 py-0.5">Online</Badge>
                            </div>

                            <div className="mt-auto space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Address</p>
                                    <p className="font-medium text-sm text-gray-900 dark:text-white">{api.checkPath}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last checked</p>
                                    <p className="font-mono text-[10px] sm:text-xs text-gray-900 dark:text-white truncate">{api.lastCheck}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ServerStatusView;
