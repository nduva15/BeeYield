import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Cpu, Zap, Radio, Shield, ShoppingCart, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const BuyBeeYieldHubView: React.FC = () => {
    const products = [
        {
            name: 'BeeYield HUB Pro v3',
            description: 'Advanced monitoring with satellite connectivity and AI anomaly detection.',
            price: '$249',
            icon: Cpu,
            color: 'bg-amber-500',
            features: ['Satellite Sync', '3 Year Battery', 'Heater Ready']
        },
        {
            name: 'BeeYield HUB Solar',
            description: 'Self-sustaining hub with integrated solar panels for remote apiaries.',
            price: '$299',
            icon: Zap,
            color: 'bg-emerald-500',
            features: ['Solar Powered', 'Weather Proof', 'Long Range Radio']
        },
        {
            name: 'BeeYield HUB Compact',
            description: 'Essential monitoring for small apiaries with direct Bluetooth/USB.',
            price: '$129',
            icon: Radio,
            color: 'bg-blue-500',
            features: ['Bluetooth 5.0', '1 Year Battery', 'Compact Design']
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Buy BeeYield HUB</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Equip your apiary with the latest BeeYield IoT hardware technology.</p>
                </div>
                <Button className="bg-[#B48428] hover:bg-[#966b1d] text-white rounded-xl px-6 h-12 gap-2 border-none shadow-lg shadow-amber-500/20">
                    <ShoppingCart className="w-5 h-5" />
                    View Cart (0)
                </Button>
            </div>

            {/* Featured Product */}
            <div className="relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-400 opacity-90 rounded-[2.5rem]" />
                <div className="relative p-12 flex flex-col md:flex-row items-center gap-12 z-10">
                    <div className="flex-1 space-y-6">
                        <Badge className="bg-white/20 text-white border-none rounded-full px-4 py-1 text-xs font-bold tracking-widest uppercase">New Release</Badge>
                        <h2 className="text-5xl font-black text-white leading-tight">BeeYield Ultra Sensor Pack</h2>
                        <p className="text-amber-50 text-lg font-medium opacity-90 max-w-xl">
                            The ultimate monitoring kit for professional beekeepers. includes 5 BeeYield Nodes, 1 BeeYield Gateway, and lifetime AI analytics support.
                        </p>
                        <div className="flex gap-4">
                            <Button className="bg-white text-amber-600 hover:bg-amber-50 rounded-2xl px-10 h-14 font-black text-lg transition-transform group-hover:scale-105">
                                Buy Now - $899
                            </Button>
                            <Button variant="ghost" className="text-white hover:bg-white/10 rounded-2xl px-8 h-14 font-bold border border-white/30">
                                View Specs
                            </Button>
                        </div>
                    </div>
                    <div className="w-64 h-64 bg-white/10 rounded-[3rem] backdrop-blur-md flex items-center justify-center border border-white/20 relative group-hover:rotate-6 transition-transform duration-500">
                        <Cpu className="w-32 h-32 text-white drop-shadow-2xl" />
                        <div className="absolute -top-4 -right-4 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl">
                            <Zap className="w-8 h-8 text-amber-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                {products.map((p, i) => (
                    <Card key={i} className="rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm hover:shadow-xl transition-all group flex flex-col">
                        <div className="h-56 bg-gray-50 dark:bg-[#1e1e1e] flex items-center justify-center relative overflow-hidden">
                            <div className={cn("absolute -bottom-10 -right-10 w-40 h-40 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700", p.color)} />
                            <p.icon className={cn("w-24 h-24 drop-shadow-lg group-hover:scale-110 transition-transform duration-500", p.color.replace('bg-', 'text-'))} />
                        </div>
                        <div className="p-8 space-y-4 flex-1 flex flex-col">
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-bold group-hover:text-amber-500 transition-colors">{p.name}</h3>
                                <span className="text-2xl font-black text-gray-900 dark:text-white">{p.price}</span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed flex-1">
                                {p.description}
                            </p>
                            <ul className="space-y-2 py-4">
                                {p.features.map((f, j) => (
                                    <li key={j} className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                        <Shield className="w-3 h-3 text-amber-400" />
                                        {f.toUpperCase()}
                                    </li>
                                ))}
                            </ul>
                            <Button className="w-full bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-amber-50 rounded-2xl h-12 font-bold gap-2">
                                Add to Cart
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Support section */}
            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-[2.5rem] p-10 flex items-center justify-between border border-blue-100 dark:border-blue-900/20">
                <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100">Need a custom hardware setup?</h3>
                    <p className="text-blue-700 dark:text-blue-300 font-medium">Contact our engineering team for large apiary deployments and dedicated BeeYield network solutions.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-8 h-12 font-bold shadow-lg shadow-blue-500/20 border-none">
                    Request Consultation
                </Button>
            </div>
        </div>
    );
};

export default BuyBeeYieldHubView;
