import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Cpu, Activity, Radio, Shield, MessageSquare,
    Settings, Search, ArrowRight, Zap, Smartphone,
    CheckCircle2, AlertCircle, Clock, MapPin, HardDrive,
    Database, Layout, Signal, Battery, Thermometer,
    Droplets, Scale, Volume2, Sun, CloudRain
} from 'lucide-react';
import { cn } from '@/lib/utils';
import FirstStepsBanner from './FirstStepsBanner';
import heroImage from '@/assets/beeyield_hub_hero.png';

interface BuyBeeYieldHubViewProps {
    onTabChange: (tab: string) => void;
}

const BuyBeeYieldHubView: React.FC<BuyBeeYieldHubViewProps> = ({ onTabChange }) => {
    const stats = [
        { label: 'Happy Clients', value: '5000+' },
        { label: 'Client Support', value: '24/7' },
        { label: 'Years Enterprise', value: '5+' }
    ];

    const features = [
        {
            title: 'Easy installation',
            description: 'The BeeYield Hub system is designed for quick and easy setup. Simply plug and play with our intuitive mounting system.',
            icon: Settings
        },
        {
            title: 'Data analysis',
            description: 'Advanced analytics and reporting tools to help you make informed decisions about your honey production.',
            icon: Activity
        },
        {
            title: 'Remote access',
            description: 'Access your apiary data from anywhere in the world using our cloud-based BeeYield Hub dashboard.',
            icon: Smartphone
        },
        {
            title: 'User-friendly interface',
            description: 'Simple and intuitive design for beekeepers of all experience levels.',
            points: ['Real-time monitoring', 'Customizable alerts', 'Detailed reporting', 'Easy configuration'],
            icon: Layout
        }
    ];

    const family = [
        {
            name: 'BeeYield Control',
            description: 'The brain of your apiary. Manages multiple sensors and transmits data via Satellite or GSM.',
            color: 'bg-blue-50'
        },
        {
            name: 'BeeYield Sensor',
            description: 'Internal hive monitoring. Tracks temperature, humidity, weight, and acoustic signatures.',
            color: 'bg-blue-100/50'
        },
        {
            name: 'BeeYield GPS',
            description: 'Anti-theft and location tracking. Stay updated on the movement of your hives.',
            color: 'bg-blue-50'
        }
    ];

    const inventory = [
        { id: '1', sn: '130324000185', desc: 'HUB_PRO_V3', lat: '-1.2863', long: '36.8221', status: 'Online', uptime: '15d 04:22' },
        { id: '2', sn: '220424000842', desc: 'SENSOR_NODE_INTERNAL', lat: '-1.2864', long: '36.8222', status: 'Online', uptime: '15d 04:22' },
        { id: '3', sn: '220424000843', desc: 'SENSOR_NODE_EXTERNAL', lat: '-1.2863', long: '36.8224', status: 'Offline', uptime: '02d 01:15' },
        { id: '4', sn: '250524001290', desc: 'HIVE_SCALE_PRO', lat: '-1.2865', long: '36.8221', status: 'Online', uptime: '12d 08:45' },
        { id: '5', sn: '250524001291', desc: 'HIVE_SCALE_PRO', lat: '-1.2866', long: '36.8220', status: 'Online', uptime: '12d 08:45' },
        { id: '6', sn: '100624000551', desc: 'BEEYIELD_GPS_TRACKER', lat: '-1.2869', long: '36.8225', status: 'Online', uptime: '30d 12:10' },
        { id: '7', sn: '100624000552', desc: 'BEEYIELD_GPS_TRACKER', lat: '-1.2870', long: '36.8226', status: 'Online', uptime: '30d 12:10' }
    ];

    const parameters = [
        { name: 'Ambient', description: 'Surrounding environment temperature and conditions' },
        { name: 'Temperature', description: 'Internal hive temperature monitoring for brood health' },
        { name: 'Humidity', description: 'Internal humidity levels for honey curing and health' },
        { name: 'Weight', description: 'Real-time honey yield tracking and swarm detection' },
        { name: 'Sound', description: 'Acoustic analysis for queen status and swarm intent' },
        { name: 'Activity', description: 'Flight activity monitoring at the hive entrance' },
        { name: 'Battery', description: 'Device voltage and solar charging performance' },
        { name: 'Signal', description: 'GSM/Satellite and Bluetooth connectivity strength' },
        { name: 'GPS', description: 'Precise location tracking and movement alerts' },
        { name: 'Pressure', description: 'Barometric pressure for weather forecasting' },
        { name: 'Light', description: 'Solar intensity and forage time monitoring' },
        { name: 'Motion', description: 'Anti-tamper and vibration detection' },
        { name: 'Orientation', description: '3-axis orientation to detect hive tilting or falls' },
        { name: 'Acceleration', description: 'Impact detection and movement analysis' },
        { name: 'Magnetic', description: 'Entrance gate monitoring and magnetic disturbances' },
        { name: 'CO2', description: 'Carbon dioxide concentration within the hive hive' },
        { name: 'VOC', description: 'Volatile Organic Compounds for health diagnostics' },
        { name: 'PM2.5 / PM10', description: 'Particulate matter monitoring in the apiary vicinity' },
        { name: 'NOx / SOx', description: 'Air quality monitoring for pollutants affecting bees' },
        { name: 'Rain', description: 'Real-time rainfall intensity and duration tracking' },
        { name: 'Wind Speed', description: 'Anemometer data for flight safety alerts' },
        { name: 'UV Index', description: 'Solar radiation intensity monitoring' },
        { name: 'Lux', description: 'Precise light intensity for biological clock correlation' },
        { name: 'Visibility', description: 'Atmospheric visibility for foraging conditions' }
    ];

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20 max-w-[1400px] mx-auto">
            {/* Header Banner - Custom styling to match image */}
            <div className="bg-[#FFF9F4] dark:bg-[#1a1612] p-8 rounded-[2.5rem] border border-[#FDE6D2] dark:border-orange-900/10 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">First steps</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Start here to set up your BeeYield Hub monitoring platform.</p>
                    </div>
                </div>
                <div className="mt-6">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">QUICK LINKS</p>
                    <div className="flex flex-wrap gap-2">
                        {['Basic product information', 'Specifications', 'Installation manual', 'Disposal Manual', 'Known issues with hardware', 'Gallery'].map((link) => (
                            <Button
                                key={link}
                                variant="outline"
                                className="rounded-full bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-sm text-xs font-semibold px-6"
                            >
                                {link}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <Card className="rounded-[3rem] border-none bg-white dark:bg-[#09090b] shadow-xl overflow-hidden">
                <CardContent className="p-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        <div className="p-12 lg:p-20 space-y-8 flex flex-col justify-center">
                            <div className="space-y-4">
                                <h1 className="text-6xl font-black text-[#0F172A] dark:text-white tracking-tight leading-[1.1]">
                                    IoT monitoring system
                                </h1>
                                <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl">
                                    What to use when monitoring your apiary? Our BeeYield Hub system offers the most advanced and comprehensive solution for beekeepers. Optimize honey production, monitor health in real-time, and get early warnings for your hives.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <Button className="bg-[#2563EB] hover:bg-blue-700 text-white rounded-2xl px-10 h-16 text-lg font-bold shadow-xl shadow-blue-500/20">
                                    Start a conversation
                                </Button>
                                <Button variant="outline" className="rounded-2xl px-10 h-16 text-lg font-bold border-gray-200 dark:border-gray-800">
                                    View development tools
                                </Button>
                            </div>

                            <div className="pt-8 flex gap-12 border-t border-gray-100 dark:border-gray-800">
                                {stats.map(stat => (
                                    <div key={stat.label}>
                                        <p className="text-3xl font-black text-blue-600">{stat.value}</p>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative h-[400px] lg:h-auto overflow-hidden bg-gray-50 dark:bg-[#1e1e1e]">
                            <img
                                src={heroImage}
                                alt="BeeYield Hub IoT System"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* User Friendly Interface section */}
            <div className="space-y-12 py-12">
                <div className="text-center space-y-4 max-w-3xl mx-auto">
                    <h2 className="text-4xl font-black tracking-tight">User-friendly Interface</h2>
                    <p className="text-gray-500 dark:text-gray-400 lg:text-lg">
                        Innovative technology meets intuitive design to provide the most seamless beekeeping experience possible.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, i) => (
                        <Card key={i} className="rounded-[2.5rem] border-none bg-blue-50/50 dark:bg-blue-900/5 p-8 hover:transform hover:-translate-y-2 transition-all duration-300">
                            <div className="w-14 h-14 bg-white dark:bg-blue-900/20 rounded-2xl flex items-center justify-center shadow-sm mb-6">
                                <feature.icon className="w-7 h-7 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4">
                                {feature.description}
                            </p>
                            {feature.points && (
                                <ul className="space-y-2">
                                    {feature.points.map(pt => (
                                        <li key={pt} className="flex items-center gap-2 text-xs font-bold text-blue-600/70">
                                            <div className="w-1 h-1 rounded-full bg-blue-600" />
                                            {pt}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card>
                    ))}
                </div>
            </div>

            {/* BeeYield Family */}
            <div className="space-y-12 py-12">
                <div className="space-y-4">
                    <h2 className="text-4xl font-black tracking-tight">BeeYield family</h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
                        A modular ecosystem of IoT devices designed to work together in harmony. Choose the components that fit your specific apiary needs.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {family.map((item, i) => (
                        <Card key={i} className={cn("rounded-[2.5rem] border-none p-10 flex flex-col justify-between h-[300px]", item.color)}>
                            <div className="space-y-4">
                                <h3 className="text-2xl font-black text-blue-900 dark:text-blue-100">{item.name}</h3>
                                <p className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                            <Button variant="ghost" className="p-0 h-auto font-bold text-blue-600 hover:text-blue-800 w-fit gap-2">
                                Discover more <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Set Table */}
            <div className="space-y-8 py-12">
                <div className="space-y-2">
                    <h2 className="text-4xl font-black tracking-tight">Set</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">PRODUCT CODE</p>
                </div>

                <div className="bg-white dark:bg-[#09090b] rounded-[2.5rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
                            <TableRow className="border-none hover:bg-transparent">
                                <TableHead className="font-bold text-gray-900 dark:text-white px-8 h-14">ID</TableHead>
                                <TableHead className="font-bold text-gray-900 dark:text-white h-14">SERIAL NO</TableHead>
                                <TableHead className="font-bold text-gray-900 dark:text-white h-14">DESCRIPTION</TableHead>
                                <TableHead className="font-bold text-gray-900 dark:text-white h-14">LAST LAT</TableHead>
                                <TableHead className="font-bold text-gray-900 dark:text-white h-14">LAST LONG</TableHead>
                                <TableHead className="font-bold text-gray-900 dark:text-white h-14">STATUS</TableHead>
                                <TableHead className="font-bold text-gray-900 dark:text-white px-8 h-14 text-right">UP TIME</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {inventory.map((item) => (
                                <TableRow key={item.id} className="border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                                    <TableCell className="px-8 py-6 font-medium text-gray-500">{item.id}</TableCell>
                                    <TableCell className="py-6 font-bold">{item.sn}</TableCell>
                                    <TableCell className="py-6 text-gray-500">{item.desc}</TableCell>
                                    <TableCell className="py-6 font-mono text-xs">{item.lat}</TableCell>
                                    <TableCell className="py-6 font-mono text-xs">{item.long}</TableCell>
                                    <TableCell className="py-6">
                                        <div className={cn(
                                            "inline-flex items-center rounded-full px-3 py-1 font-bold text-[10px]",
                                            item.status === 'Online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        )}>
                                            {item.status.toUpperCase()}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8 py-6 text-right font-medium text-gray-500">{item.uptime}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Bottom Banner */}
            <Card className="rounded-[2.5rem] border-none bg-[#0F172A] p-10 shadow-2xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="relative flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="space-y-2">
                        <h3 className="text-3xl font-bold text-white tracking-tight">User-friendly Interface</h3>
                        <p className="text-blue-200/60 font-medium">Advanced power management for IoT platforms</p>
                    </div>
                    <div className="flex gap-4">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-8 h-14 font-bold border-none">
                            Configuration & Maintenance
                        </Button>
                        <Button variant="outline" className="bg-white hover:bg-gray-100 text-[#0F172A] border-none rounded-2xl px-10 h-14 font-bold">
                            Consultants
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Parameters Table */}
            <div className="space-y-12 py-12">
                <div className="text-center space-y-4 max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold tracking-tight px-12">
                        Table of measurement parameters supported by the BeeYield Hub Platform
                    </h2>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">COMPLETE CAPABILITIES</p>
                </div>

                <div className="bg-white dark:bg-[#09090b] rounded-[2.5rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
                            <TableRow className="border-none hover:bg-transparent">
                                <TableHead className="font-bold text-gray-900 dark:text-white px-8 h-14 w-16">ID</TableHead>
                                <TableHead className="font-bold text-gray-900 dark:text-white h-14 w-[300px]">PARAMETER</TableHead>
                                <TableHead className="font-bold text-gray-900 dark:text-white h-14 px-8">DESCRIPTION</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {parameters.map((p, i) => (
                                <TableRow key={i} className="border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                                    <TableCell className="px-8 py-4 font-medium text-gray-500">{i + 1}</TableCell>
                                    <TableCell className="py-4 font-bold text-blue-600">{p.name}</TableCell>
                                    <TableCell className="px-8 py-4 text-gray-500 text-sm">{p.description}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
};

export default BuyBeeYieldHubView;
