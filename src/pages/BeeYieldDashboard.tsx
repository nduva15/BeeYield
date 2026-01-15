import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from '@tanstack/react-router';
import { beeyieldService, IoTDevice, SensorReading } from '@/services/beeyieldService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    LayoutGrid, MessageSquare, Box, LineChart, Signal, Bluetooth, Cpu, Usb, FileText, HelpCircle,
    Plus, Filter, SlidersHorizontal, MoreHorizontal, Battery, Wifi, Clock, AlertTriangle, CheckCircle2,
    X, ChevronDown, MapPin, Search, ClipboardList, Calculator, Receipt, LifeBuoy, Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import DashboardLayout from '@/components/beeyield/DashboardLayout';
import { NavItem } from '@/components/beeyield/DashboardSidebar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// View Imports
import MyDevicesView from '@/components/beeyield/MyDevicesView';
import AIAssistantView from '@/components/beeyield/AIAssistantView';
import MyPlacesView from '@/components/beeyield/MyPlacesView';
import BeeYieldView from '@/components/beeyield/BeeYieldView';
import MeasurementDataView from '@/components/beeyield/MeasurementDataView';
import SettingsView from '@/components/beeyield/SettingsView';
import {
    BeeHUBOnlineView,
    BluetoothView,
    USBView
} from '@/components/beeyield/RemainingViews';
import MyRequestsView from '@/components/beeyield/MyRequestsView';
import MyNotesView from '@/components/beeyield/MyNotesView';
import MyTaskView from '@/components/beeyield/MyTaskView';
import BuyBeeYieldHubView from '@/components/beeyield/BuyBeeYieldHubView';
import MetersView from '@/components/beeyield/MetersView';
import BillingView from '@/components/beeyield/BillingView';
import SupportCenterView from '@/components/beeyield/SupportCenterView';


const BeeYieldDashboard: React.FC = () => {
    const { user, signOut } = useAuth();

    // Dashboard state
    const [loading, setLoading] = useState(true);
    const [devices, setDevices] = useState<IoTDevice[]>([]);
    const [readings, setReadings] = useState<SensorReading[]>([]);
    const [activeTab, setActiveTab] = useState('devices');
    const [showBanner, setShowBanner] = useState(true);

    // Data fetching
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [devicesData, readingsData] = await Promise.all([
                    beeyieldService.getDevices(),
                    beeyieldService.getSensorReadings(undefined, 24 * 7) // Get last 7 days for stats
                ]);
                setDevices(devicesData);
                setReadings(readingsData);
            } catch (error) {
                console.error('Failed to load dashboard data', error);
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Derived Stats
    const totalDevices = devices.length;
    const withMeasurement = devices.filter(d => readings.some(r => r.device_id === d.id)).length;

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    const measuredIn24h = devices.filter(d => {
        const lastReading = readings.find(r => r.device_id === d.id); // Assuming sorted or filtering approach
        // Better: check if ANY reading for this device is within 24h
        return readings.some(r => r.device_id === d.id && (now.getTime() - new Date(r.timestamp).getTime() < oneDay));
    }).length;

    const measuredIn48h = devices.filter(d => {
        return readings.some(r => r.device_id === d.id && (now.getTime() - new Date(r.timestamp).getTime() < oneDay * 2));
    }).length;

    const measuredIn7Days = devices.filter(d => {
        return readings.some(r => r.device_id === d.id && (now.getTime() - new Date(r.timestamp).getTime() < oneDay * 7));
    }).length;

    // Attention Needed Stats (Mock logic for demonstration)
    const noMeasurement5Days = devices.filter(d => {
        const hasRecent = readings.some(r => r.device_id === d.id && (now.getTime() - new Date(r.timestamp).getTime() < oneDay * 5));
        return !hasRecent;
    }).length;

    const lowBattery = devices.filter(d => d.battery_level < 20).length;

    // Nav Items matching screenshot precisely
    const navItems: NavItem[] = [
        { id: 'assistant', label: 'AI Assistant', icon: MessageSquare },
        { id: 'places', label: 'My Places', icon: LayoutGrid },
        { id: 'beeyield', label: 'BeeYield', icon: Box, hasSubmenu: true },
        { id: 'data', label: 'Measurement data', icon: LineChart, hasSubmenu: true },
        { id: 'online', label: 'BeeHUB Online', icon: Signal },
        { id: 'bluetooth', label: 'Bluetooth', icon: Bluetooth },
        { id: 'devices', label: 'My devices', icon: Cpu },
        { id: 'usb', label: 'USB', icon: Usb },
        { id: 'notes', label: 'My Notes', icon: FileText },
        { id: 'requests', label: 'My Requests', icon: HelpCircle },
        { id: 'task', label: 'My Task', icon: ClipboardList },
        { id: 'buy', label: 'Buy BeeYield HUB', icon: Cpu },
        { id: 'meters', label: 'Meters', icon: Calculator, hasSubmenu: true },
        { id: 'billing', label: 'Billing', icon: Receipt },
        { id: 'support', label: 'Support center', icon: LifeBuoy },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    // Function to render content based on active tab
    const renderContent = () => {
        switch (activeTab) {
            case 'assistant':
                return <AIAssistantView />;
            case 'places':
                return <MyPlacesView />;
            case 'beeyield':
                return <BeeYieldView />;
            case 'data':
                return <MeasurementDataView />;
            case 'online':
                return <BeeHUBOnlineView />;
            case 'bluetooth':
                return <BluetoothView />;
            case 'devices':
                return <MyDevicesView devices={devices} readings={readings} onTabChange={setActiveTab} />;
            case 'usb':
                return <USBView />;
            case 'notes':
                return <MyNotesView />;
            case 'requests':
                return <MyRequestsView />;
            case 'task':
                return <MyTaskView />;
            case 'buy':
                return <BuyBeeYieldHubView />;
            case 'meters':
                return <MetersView />;
            case 'billing':
                return <BillingView />;
            case 'support':
                return <SupportCenterView />;
            case 'settings': // Special case from top bar or banner
                return <SettingsView onTabChange={setActiveTab} />;
            default:
                return (
                    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white dark:bg-[#09090b] rounded-[2.5rem] border border-dashed border-gray-200 dark:border-[#1e1e1e]">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-[#1e1e1e] rounded-2xl flex items-center justify-center mb-4">
                            <Box className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {navItems.find(i => i.id === activeTab)?.label || 'View Content'}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-sm font-medium">
                            This section is currently under development. Check back soon for updates!
                        </p>
                    </div>
                );
        }
    };

    return (
        <DashboardLayout
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onLogout={signOut}
            navItems={navItems}
        >
            <div className="mt-6 px-4">
                {renderContent()}
            </div>
        </DashboardLayout>
    );
};

export default BeeYieldDashboard;
