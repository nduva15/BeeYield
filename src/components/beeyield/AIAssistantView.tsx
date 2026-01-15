import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Sparkles, Zap, ShieldCheck } from 'lucide-react';

const AIAssistantView: React.FC = () => {
    return (
        <div className="flex flex-col h-[calc(100vh-180px)] animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        AI Assistant <Sparkles className="w-6 h-6 text-amber-400 fill-amber-400" />
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Intelligent insights for your beekeeping operations.</p>
                </div>
                <div className="flex gap-2">
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-none px-3 py-1 rounded-full text-xs font-bold tracking-tight">AI ONLINE</Badge>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 min-h-0">
                {/* Chat Area */}
                <div className="lg:col-span-3 flex flex-col h-full bg-white dark:bg-[#09090b] rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] shadow-sm overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-8 space-y-6">
                        {/* Bot Message */}
                        <div className="flex gap-4 max-w-[80%]">
                            <div className="w-10 h-10 rounded-2xl bg-[#B48428] flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-500/20">
                                <Sparkles className="w-5 h-5 fill-current" />
                            </div>
                            <div className="bg-gray-50 dark:bg-[#1e1e1e] p-6 rounded-[2rem] rounded-tl-none space-y-4">
                                <p className="text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                                    Hello Timothy! I've analyzed your data from the **North Orchard** apiary.
                                    I noticed a slight increase in activity in **Hive #42**.
                                    Would you like me to check the temperature trends or acoustic patterns?
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <Button variant="outline" className="justify-start rounded-xl border-gray-200 dark:border-gray-800 hover:bg-[#F8F2E4] dark:hover:bg-[#27272a] hover:text-[#B48428] transition-all text-sm h-auto py-3">
                                        Check temperature trends
                                    </Button>
                                    <Button variant="outline" className="justify-start rounded-xl border-gray-200 dark:border-gray-800 hover:bg-[#F8F2E4] dark:hover:bg-[#27272a] hover:text-[#B48428] transition-all text-sm h-auto py-3">
                                        Analyze acoustics
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* User Message */}
                        <div className="flex gap-4 max-w-[80%] ml-auto flex-row-reverse">
                            <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 shrink-0">
                                <UserRound className="w-5 h-5" />
                            </div>
                            <div className="bg-[#B48428] text-white p-6 rounded-[2rem] rounded-tr-none shadow-lg shadow-amber-500/10">
                                <p className="leading-relaxed font-medium">
                                    Show me the temperature trends for the last 24 hours.
                                </p>
                            </div>
                        </div>

                        {/* Bot Message with Chart placeholder */}
                        <div className="flex gap-4 max-w-[80%]">
                            <div className="w-10 h-10 rounded-2xl bg-[#B48428] flex items-center justify-center text-white shrink-0">
                                <Sparkles className="w-5 h-5 fill-current" />
                            </div>
                            <div className="bg-gray-50 dark:bg-[#1e1e1e] p-6 rounded-[2rem] rounded-tl-none space-y-4 w-full">
                                <p className="text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                                    Here is the temperature chart for Hive #42. Everything looks within the optimal range.
                                </p>
                                <div className="h-48 bg-white dark:bg-[#09090b] rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-center">
                                    <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">[ Temperature Chart Visualization ]</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="p-6 bg-gray-50/50 dark:bg-[#1e1e1e]/20 border-t border-gray-100 dark:border-[#1e1e1e]">
                        <div className="relative">
                            <Input
                                placeholder="Ask about your hives, weather, or beekeeping tips..."
                                className="w-full h-14 pl-6 pr-16 rounded-[1.5rem] bg-white dark:bg-[#09090b] border-gray-200 dark:border-gray-800 shadow-sm focus-visible:ring-amber-500"
                            />
                            <Button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-[#B48428] hover:bg-[#966b1d] text-white p-0 shadow-lg shadow-amber-500/20">
                                <Send className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Sidebar suggestions */}
                <div className="space-y-6">
                    <Card className="rounded-[2rem] border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm overflow-hidden">
                        <CardContent className="p-6 space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> Suggested Actions
                            </h3>
                            <div className="space-y-2">
                                <button className="w-full text-left p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#1e1e1e] text-xs font-medium text-gray-600 dark:text-gray-400 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-800">
                                    Identify pests from image
                                </button>
                                <button className="w-full text-left p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#1e1e1e] text-xs font-medium text-gray-600 dark:text-gray-400 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-800">
                                    Predict honey yield
                                </button>
                                <button className="w-full text-left p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#1e1e1e] text-xs font-medium text-gray-600 dark:text-gray-400 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-800">
                                    Winter prep checklist
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2rem] border border-gray-100 dark:border-[#1e1e1e] bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg overflow-hidden border-none">
                        <CardContent className="p-6 space-y-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <ShieldCheck className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-bold">Smart Protection</h3>
                            <p className="text-xs text-white/80 leading-relaxed font-medium">
                                Upgrade to BeeYield Pro for real-time acoustic analysis and Varroa detection.
                            </p>
                            <Button className="w-full bg-white text-[#B48428] hover:bg-gray-100 rounded-xl font-bold h-10 mt-2 shadow-sm">
                                View Pricing
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

import { Badge } from '@/components/ui/badge';
import { UserRound } from 'lucide-react';

export default AIAssistantView;
