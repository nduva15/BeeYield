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
import { glass } from './GlassTheme';
import heroImage from '@/assets/beeyield_hub_sensor.jpg';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

import beeyieldService from '@/services/beeyieldService';
import { Loader2 } from 'lucide-react';

interface BuyBeeYieldHubViewProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

const BuyBeeYieldHubView: React.FC<BuyBeeYieldHubViewProps> = ({ onTabChange }) => {
    const { t } = useLanguage();
    const [inventory, setInventory] = React.useState<any[]>([]);
    const [loadingInventory, setLoadingInventory] = React.useState(true);

    React.useEffect(() => {
        const fetchInventory = async () => {
            setLoadingInventory(true);
            try {
                const data = await beeyieldService.getIotDevices();
                if (data && data.length > 0) {
                    setInventory(data);
                } else {
                    // Fallback to static demo data if none in DB
                    setInventory([
                        { id: '1', sn: '130324000185', desc: 'Bee Hub', lat: '-1.2863', long: '36.8221', status: 'Online', uptime: '15d 04:22' },
                        { id: '2', sn: '220424000842', desc: 'Inside Sensor', lat: '-1.2864', long: '36.8222', status: 'Online', uptime: '15d 04:22' },
                        { id: '3', sn: '220424000843', desc: 'Outside Sensor', lat: '-1.2863', long: '36.8224', status: 'Offline', uptime: '02d 01:15' },
                        { id: '4', sn: '250524001290', desc: 'Hive Scale', lat: '-1.2865', long: '36.8221', status: 'Online', uptime: '12d 08:45' },
                        { id: '5', sn: '250524001291', desc: 'Hive Scale', lat: '-1.2866', long: '36.8220', status: 'Online', uptime: '12d 08:45' },
                        { id: '6', sn: '100624000551', desc: 'Bee Tracker', lat: '-1.2869', long: '36.8225', status: 'Online', uptime: '30d 12:10' },
                        { id: '7', sn: '100624000552', desc: 'Bee Tracker', lat: '-1.2870', long: '36.8226', status: 'Online', uptime: '30d 12:10' }
                    ]);
                }
            } catch (err) {
                console.error("Error loading inventory:", err);
            } finally {
                setLoadingInventory(false);
            }
        };
        fetchInventory();
    }, []);
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
            name: 'BeeHUB Queen (Lora)',
            description: 'The primary gateway for your apiary. Manages data transmission from multiple sensors via LoRa/GSM/Satellite. Built-in battery and solar charging Support.',
            color: 'bg-yellow-50',
            image: heroImage
        },
        {
            name: 'BeeHUB Sense',
            description: 'Internal hive sensor. Tracks temperature and humidity and connects wirelessly to the BeeHUB Queen gateway.',
            color: 'bg-green-50',
            image: '/images/products/beehub_temp_humidity.png'
        },
        {
            name: 'BeeHUB Tracker (GPS)',
            description: 'Anti-theft tracking for your colonies. Integrated GPS and motion sensors to prevent theft and monitor migration.',
            color: 'bg-yellow-50',
            image: '/images/products/beehub_sim_card.png'
        }
    ];

    const parameters = [
        { name: 'Air', description: 'Checks conditions around the hives' },
        { name: 'Temperature', description: 'Checks inside health for baby bees' },
        { name: 'Humidity', description: 'Checks moisture for honey quality' },
        { name: 'Weight', description: 'Real-time honey gain and swarm check' },
        { name: 'Sound', description: 'Sound analysis for queen and swarm risk' },
        { name: 'Activity', description: 'Checks how many bees are flying' },
        { name: 'Battery', description: 'Power and solar charging status' },
        { name: 'Signal', description: 'Cellular and Satellite connection status' },
        { name: 'GPS', description: 'Location tracking and hive move alerts' },
        { name: 'Pressure', description: 'Air pressure for weather updates' },
        { name: 'Light', description: 'Sunlight and foraging time checks' },
        { name: 'Motion', description: 'Anti-theft and movement alerts' },
        { name: 'Tilting', description: 'Checks if a hive has tipped over' },
        { name: 'Impact', description: 'Detects bumps or falls' },
        { name: 'Magnetic', description: 'Entrance monitoring and magnetic checks' },
        { name: 'CO2', description: 'Carbon dioxide levels inside the hive' },
        { name: 'VOC', description: 'Health checks using air chemicals' },
        { name: 'Air Dust', description: 'Particulate matter monitoring' },
        { name: 'Pollution', description: 'Checks for pollutants affecting bees' },
        { name: 'Rain', description: 'Real-time rainfall tracking' },
        { name: 'Wind', description: 'Checks if it is too windy for bees to fly' },
        { name: 'UV', description: 'Solar radiation checks' },
        { name: 'Light Level', description: 'Checks light for bee activity' },
        { name: 'Visibility', description: 'Checks visibility for foraging' }
    ];

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20 max-w-[1400px] mx-auto">


            {/* Hero Section */}
            <Card className={cn(glass.card, "bg-card border-none shadow-xl overflow-hidden")}>
                <CardContent className="p-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        <div className="p-12 lg:p-20 space-y-8 flex flex-col justify-center">
                            <div className="space-y-4">
                                <h1 className="text-6xl font-black text-[#0F172A] tracking-tight leading-[1.1]">
                                    Hive monitoring system
                                </h1>
                                <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                                    What to use when monitoring your apiary? BeeYield Hub gives beekeepers one place to see hive health, honey production, and early warnings—all in real time.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <Button
                                    onClick={() => onTabChange('requests')}
                                    className="bg-[#1B9157] hover:bg-[#146c43] text-foreground rounded-2xl px-10 h-16 text-lg font-bold shadow-xl shadow-green-500/20"
                                >
                                    Start a conversation
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => onTabChange('support')}
                                    className="rounded-2xl px-10 h-16 text-lg font-bold border-border/"
                                >
                                    Talk to support
                                </Button>
                            </div>

                            <div className="pt-8 flex gap-12 border-t border-border/">
                                {stats.map(stat => (
                                    <div key={stat.label}>
                                        <p className="text-3xl font-black text-[#F4D03F]">{stat.value}</p>
                                        <p className="text-xs font-bold text-muted-foreground/70 uppercase tracking-wider">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative h-[400px] lg:h-auto overflow-hidden bg-muted/20">
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
                    <p className="text-muted-foreground lg:text-lg">
                        Built for beekeepers: clear dashboards, simple setup, and support when you need it.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, i) => (
                        <Card key={i} className={cn(glass.card, "bg-[#FAFAFA] border-none p-8 hover:transform hover:-translate-y-2 transition-all duration-300")}>
                            <div className="w-14 h-14 bg-card rounded-2xl flex items-center justify-center shadow-sm mb-6">
                                <feature.icon className="w-7 h-7 text-[#F4D03F]" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                                {feature.description}
                            </p>
                            {feature.points && (
                                <ul className="space-y-2">
                                    {feature.points.map(pt => (
                                        <li key={pt} className="flex items-center gap-2 text-xs font-bold text-[#1B9157]">
                                            <div className="w-1 h-1 rounded-full bg-[#1B9157]" />
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
                    <p className="text-muted-foreground max-w-2xl leading-relaxed">
                        A modular ecosystem of IoT devices designed to work together in harmony. Choose the components that fit your specific apiary needs.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {family.map((item, i) => (
                        <Card key={i} className={cn(glass.card, "p-0 border-none overflow-hidden flex flex-col h-[450px] shadow-sm hover:shadow-md transition-shadow", item.color)}>
                            <div className="h-48 bg-[#F4F8FB] flex items-center justify-center p-12 border-b border-primary/5">
                                <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain transition-transform duration-700 group-hover:scale-110" />
                            </div>
                            <div className="p-8 flex-1 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-black text-foreground tracking-tighter">{item.name}</h3>
                                    <p className="text-foreground/70 text-sm leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    onClick={() => window.open('https://beeyield.com/shop-sensors', '_blank', 'noopener,noreferrer')}
                                    className="p-0 h-auto font-bold text-[#1B9157] hover:text-[#146c43] w-fit gap-2 text-[10px]"
                                >
                                    Discover more <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Set Table */}
            <div className="space-y-8 py-12">
                <div className="space-y-2">
                    <h2 className="text-4xl font-black tracking-tight">Set</h2>
                    <p className="text-[10px] font-bold text-muted-foreground/70">Product Code</p>
                </div>

                <div className={cn(glass.card, "p-0 overflow-hidden shadow-sm")}>
                    <Table>
                        <TableHeader className="bg-muted/20">
                            <TableRow className="border-none hover:bg-transparent">
                                <TableHead className="font-bold text-foreground px-8 h-14">ID</TableHead>
                                <TableHead className="font-bold text-foreground h-14">Serial No</TableHead>
                                <TableHead className="font-bold text-foreground h-14">Description</TableHead>
                                <TableHead className="font-bold text-foreground h-14">Last Lat</TableHead>
                                <TableHead className="font-bold text-foreground h-14">Last Long</TableHead>
                                <TableHead className="font-bold text-foreground h-14">Status</TableHead>
                                <TableHead className="font-bold text-foreground px-8 h-14 text-right">Up Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {inventory.map((item) => (
                                <TableRow key={item.id} className="border-gray-50 hover:bg-muted/:bg-gray-800/30">
                                    <TableCell className="px-8 py-6 font-medium text-muted-foreground">{item.id}</TableCell>
                                    <TableCell className="py-6 font-bold">{item.sn}</TableCell>
                                    <TableCell className="py-6 text-muted-foreground">{item.desc}</TableCell>
                                    <TableCell className="py-6 font-mono text-xs">{item.lat}</TableCell>
                                    <TableCell className="py-6 font-mono text-xs">{item.long}</TableCell>
                                    <TableCell className="py-6">
                                        <div className={cn(
                                            "inline-flex items-center rounded-full px-3 py-1 font-bold text-[10px]",
                                            item.status === 'Online' ? 'bg-green-100 text-[#1B9157]' : 'bg-red-100 text-red-700'
                                        )}>
                                            {item.status.toUpperCase()}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8 py-6 text-right font-medium text-muted-foreground">{item.uptime}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Bottom Banner */}
            <Card className={cn(glass.card, "bg-[#0F172A] border-none p-8 lg:p-12 shadow-2xl overflow-hidden relative group")}>
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-[120px] pointer-events-none group-hover:bg-blue-500/20 transition-all duration-1000" />
                <div className="relative flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="space-y-3">
                        <h3 className="text-4xl font-black text-white tracking-tighter">Industrial <span className="text-[#F4D03F]">Efficiency</span></h3>
                        <p className="text-blue-200/60 font-black text-[10px]">Recursive power management for hyper-scale IoT</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Button
                            onClick={() => onTabChange('settings')}
                            className="bg-[#1B9157] hover:bg-[#146c43] text-white rounded-2xl px-8 h-14 font-bold border-none shadow-lg shadow-green-500/20"
                        >
                            Maintainance_Matrix
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => onTabChange('support')}
                            className="bg-muted/ hover:bg-muted/ text-white border-border/ rounded-2xl px-10 h-14 font-bold backdrop-blur-md"
                        >
                            {t('nav_support')}
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Parameters Table */}
            <div className="space-y-12 py-12">
                <div className="text-center space-y-4 max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold tracking-tight px-12 uppercase">
                        What the Bee Hub Platform measures
                    </h2>
                    <p className="text-[10px] font-bold text-[#F4D03F]">Smart Sensors</p>
                </div>

                <div className={cn(glass.card, "p-0 overflow-hidden shadow-sm")}>
                    <Table>
                        <TableHeader className="bg-muted/20">
                            <TableRow className="border-none hover:bg-transparent">
                                <TableHead className="font-bold text-foreground px-8 h-14 w-16">ID</TableHead>
                                <TableHead className="font-bold text-foreground h-14 w-[300px]">Parameter</TableHead>
                                <TableHead className="font-bold text-foreground h-14 px-8">Description</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {parameters.map((p, i) => (
                                <TableRow key={i} className="border-gray-50 hover:bg-muted/:bg-gray-800/30">
                                    <TableCell className="px-8 py-4 font-medium text-muted-foreground">{i + 1}</TableCell>
                                    <TableCell className="py-4 font-bold text-[#1B9157]">{p.name}</TableCell>
                                    <TableCell className="px-8 py-4 text-muted-foreground text-sm">{p.description}</TableCell>
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

