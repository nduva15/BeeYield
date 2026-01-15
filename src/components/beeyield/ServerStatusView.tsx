import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import FirstStepsBanner from './FirstStepsBanner';

const ServerStatusView: React.FC<{ onTabChange: (tab: string) => void }> = ({ onTabChange }) => {
    // Mock Data to match screenshot
    const timestamp = "2026-01-15T21:48:31.170Z"; // Using a static one or current date
    const lastLoginTimestamp = "2026-01-14T...:..:.."; // Partial mock

    const topEndpoints = [
        { path: '/api/apiaries', count: 10 },
        { path: '/api/identity/me', count: 5 },
        { path: '/api/chat/conversation', count: 5 },
        { path: '/api/user-request/paged', count: 3 },
        { path: '/api/tasks', count: 2 },
        { path: '/api/data/measurements/last', count: 2 },
    ];

    const apis = [
        { name: 'Copernicus API', checkPath: '/api/health', lastCheck: '2026-01-15T21:48:27.658Z' },
        { name: 'Main BeeYield API', checkPath: '/api/identity/me', lastCheck: '2026-01-15T21:48:28.351Z' },
        { name: 'Patient API', checkPath: '/health', lastCheck: '2026-01-15T21:48:29.885Z' },
        { name: 'Accounting API', checkPath: '/health', lastCheck: '2026-01-15T21:48:31.170Z' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <FirstStepsBanner onTabChange={onTabChange} />

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white">API status</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Quick connectivity overview for BeeYield services.</p>
                </div>
                <Button variant="outline" className="rounded-full px-6 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                    Check now
                </Button>
            </div>

            {/* System Health */}
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white dark:bg-[#1e1e1e]">
                <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">System health</h3>
                        <Badge className="bg-[#DCFCE7] text-[#166534] hover:bg-[#DCFCE7] uppercase text-[10px] font-bold px-3 py-1">Online</Badge>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Last refresh</span>
                            <span className="font-mono font-medium text-gray-900 dark:text-white">{timestamp}</span>
                        </div>
                        {/* Simulate the faded second line or just leave it out if not needed, but snippet showed it */}
                        {/* The screenshot shows a very faint second line, I'll add it for completeness but faint */}
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Last login (this browser)</span>
                            <span className="font-mono font-medium text-gray-900 dark:text-white">2026-01-14T21:48:31.170Z</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* API Usage */}
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white dark:bg-[#1e1e1e]">
                <CardContent className="p-6 space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">API usage</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Client-side estimate for last 7 days.</p>
                        </div>
                        <Badge className="bg-[#DCFCE7] text-[#166534] hover:bg-[#DCFCE7] text-[12px] font-bold px-3 py-1">0%</Badge>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-[1%]" /> {/* approximate 0.32% */}
                    </div>

                    {/* Stats */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Total calls</span>
                            <span className="font-bold text-gray-900 dark:text-white">32</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Limit</span>
                            <span className="font-bold text-gray-900 dark:text-white">10000</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">TOP ENDPOINTS</p>
                        <div className="space-y-1">
                            {topEndpoints.map((ep, idx) => (
                                <div key={idx} className={`flex justify-between items-center py-2 px-3 rounded-lg text-sm ${idx % 2 !== 0 ? 'bg-gray-50 dark:bg-white/5' : ''}`}>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{ep.path}</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{ep.count}</span>
                                </div>
                            ))}
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
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Check path</p>
                                    <p className="font-medium text-sm text-gray-900 dark:text-white">{api.checkPath}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last check</p>
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
