import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LifeBuoy, Search, BookOpen, MessageSquare, Phone, Mail, PlayCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

const SupportCenterView: React.FC = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            <div className="text-center max-w-2xl mx-auto space-y-4">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white">Support Center</h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Search our knowledge base or reach out to our team of experts.</p>
                <div className="relative mt-8">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-300" />
                    <input
                        type="text"
                        placeholder="Search for articles, guides, or troubleshooting..."
                        className="w-full pl-16 pr-6 h-16 bg-white dark:bg-[#09090b] border border-gray-100 dark:border-[#1e1e1e] rounded-[2rem] text-lg shadow-xl shadow-gray-200/20 outline-none focus:ring-2 focus:ring-amber-500/20 transition-all font-medium"
                    />
                </div>
            </div>

            {/* Support Hero Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                {[
                    { title: 'Guides & Tutorials', desc: 'Step-by-step instructions for hardware setup and software config.', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                    { title: 'Video Lessons', desc: 'Watch how to install your BeeHUB devices in under 5 minutes.', icon: PlayCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
                    { title: 'Documentation', desc: 'Detailed API and technical specifications for developers.', icon: ArrowRight, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                ].map((item, i) => (
                    <Card key={i} className="rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm hover:shadow-xl transition-all cursor-pointer group p-10">
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3", item.bg)}>
                            <item.icon className={cn("w-7 h-7", item.color)} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{item.desc}</p>
                    </Card>
                ))}
            </div>

            {/* Direct Contact Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                <Card className="rounded-[3rem] bg-gradient-to-br from-[#B48428] to-[#966b1d] text-white p-12 relative overflow-hidden flex flex-col justify-between min-h-[400px]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl opacity-50" />
                    <div className="relative z-10 space-y-6">
                        <Badge className="bg-white/20 text-white rounded-md font-black border-none text-[10px] uppercase tracking-widest">Priority Support</Badge>
                        <h2 className="text-4xl font-black">24/7 Expert Support</h2>
                        <p className="text-amber-50 font-medium text-lg leading-relaxed opacity-90 max-w-md">
                            Our team of professional beekeepers and engineers are standing by to help you with any issue.
                        </p>
                    </div>
                    <div className="relative z-10 flex flex-wrap gap-4 pt-12">
                        <Button className="bg-white text-[#B48428] hover:bg-amber-50 rounded-2xl px-10 h-14 font-black text-lg shadow-lg">Open Live Chat</Button>
                        <Button variant="ghost" className="text-white hover:bg-white/10 rounded-2xl px-8 h-14 font-bold border border-white/30">Our Call Center</Button>
                    </div>
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Card className="rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm p-8 flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-gray-50 dark:bg-[#1e1e1e] rounded-2xl flex items-center justify-center">
                                <Mail className="w-6 h-6 text-gray-400" />
                            </div>
                            <h4 className="text-lg font-bold">Email Support</h4>
                            <p className="text-xs text-gray-500 font-medium mb-6">Average response time: 2 hours</p>
                        </div>
                        <Button variant="link" className="text-amber-600 font-bold p-0 h-auto self-start gap-1">
                            support@beeyield.agro
                            <ExternalLink className="w-3 h-3" />
                        </Button>
                    </Card>
                    <Card className="rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm p-8 flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-gray-50 dark:bg-[#1e1e1e] rounded-2xl flex items-center justify-center">
                                <Phone className="w-6 h-6 text-gray-400" />
                            </div>
                            <h4 className="text-lg font-bold">Priority Line</h4>
                            <p className="text-xs text-gray-500 font-medium mb-6">Direct access for Pro members</p>
                        </div>
                        <Button variant="link" className="text-amber-600 font-bold p-0 h-auto self-start gap-1">
                            +1 (800) BEE-YIELD
                            <ExternalLink className="w-3 h-3" />
                        </Button>
                    </Card>
                    <Card className="rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm p-8 flex flex-col justify-between sm:col-span-2">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-[1.5rem] flex items-center justify-center">
                                <MessageSquare className="w-8 h-8 text-blue-500" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold">Community Forum</h4>
                                <p className="text-sm text-gray-500 font-medium">Join 50k+ beekeepers sharing tips and devices.</p>
                            </div>
                            <Button variant="outline" className="ml-auto rounded-xl font-bold h-10 border-gray-100 dark:border-gray-800">Visit Forum</Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SupportCenterView;
