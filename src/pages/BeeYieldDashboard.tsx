import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { beeyieldService, IoTDevice, SensorReading, Apiary, Hive } from '@/services/beeyieldService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    LayoutGrid, MessageSquare, Box, LineChart, Signal, Bluetooth, Cpu, Usb, FileText, HelpCircle,
    Plus, Filter, SlidersHorizontal, MoreHorizontal, Battery, Wifi, Clock, AlertTriangle, CheckCircle2,
    X, ChevronDown, MapPin, Search, ClipboardList, Calculator, Receipt, LifeBuoy, Settings,
    Hand, Map, TrendingUp, Volume2, Camera, BookOpen, Droplet, Flame, Zap, Building2, Home, PieChart,
    ArrowRightLeft, FileInput, Bot, Activity, Gauge, List, Layers, BarChart3, Upload, LayoutList, Hexagon, Puzzle,
    LogIn, UserPlus, Loader2, ArrowLeft, Shield, Lock as LockIcon, Bell, Banknote, Globe, Tag, ShieldCheck, Server,
    Navigation, FileBarChart, Brain, Crosshair, Scale, FileCheck, Bug, Calendar, Heart
} from "lucide-react";
import { Target } from "lucide-react";
import { Award } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import DashboardLayout from '@/components/beeyield/DashboardLayout';
import { NavItem } from '@/components/beeyield/DashboardSidebar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '@/contexts/LanguageContext';
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";
import { useSettings } from '@/contexts/SettingsContext';
import { SUPER_ADMIN_EMAIL } from '@/config/constants';

// View Imports
import MyDevicesView from '@/components/beeyield/MyDevicesView';
import DeviceDetailView from '@/components/beeyield/DeviceDetailView';
import SmartAssistantView from '@/components/beeyield/SmartAssistantView';
import AgroIntelligenceView from '@/components/beeyield/AgroIntelligenceView';
import MyPlacesView from '@/components/beeyield/MyPlacesView';
import BeeYieldHivesView from '@/components/beeyield/BeeYieldHivesView';
import GlobalHiveNetwork from '@/pages/GlobalHiveNetwork';
import MeasurementDataView from '@/components/beeyield/MeasurementDataView';
import SettingsView from '@/components/beeyield/SettingsView';
import PrecisionPollinationView from '@/components/beeyield/PrecisionPollinationView';
import BloomTrackingView from '@/components/beeyield/BloomTrackingView';
import {
    BeeYieldOnlineView,
    USBView
} from '@/components/beeyield/RemainingViews';
import { BluetoothConnectivityView } from '@/components/beeyield/BluetoothConnectivityView';

import ReportsExportsView from '@/components/beeyield/ReportsExportsView';
import LabelGeneratorView from '@/components/beeyield/LabelGeneratorView';

import MyRequestsView from '@/components/beeyield/MyRequestsView';
import MyNotesView from '@/components/beeyield/MyNotesView';
import MyTaskView from '@/components/beeyield/MyTaskView';
import BuyBeeYieldHubView from '@/components/beeyield/BuyBeeYieldHubView';
import MetersView from '@/components/beeyield/MetersView';
import BillingView from '@/components/beeyield/BillingView';
import SupportCenterView from '@/components/beeyield/SupportCenterView';
import ServerStatusView from '@/components/beeyield/ServerStatusView';
import InspectionsView from '@/components/beeyield/InspectionsView';
import HarvestsView from '@/components/beeyield/HarvestsView';
import ImageAnalysisView from '@/components/beeyield/ImageAnalysisView';
import SoundAnalysisView from '@/components/beeyield/SoundAnalysisView';
import HealthGuideView from '@/components/beeyield/HealthGuideView';
import FlightMapView from '@/components/beeyield/FlightMapView';
import VarroaView from '@/components/beeyield/VarroaView';
import SensorHealthView from '@/components/beeyield/SensorHealthView';
import ContinuousMonitor from '@/components/beeyield/ContinuousMonitor';
import YardOperations from '@/components/beeyield/YardOperations';
import GeospatialSecurity from '@/components/beeyield/GeospatialSecurity';
import PollinationIntelligence from '@/components/beeyield/PollinationIntelligence';
import OrchardMapper from '@/components/beeyield/OrchardMapper';
import SeasonSummary from '@/components/beeyield/SeasonSummary';
import PollinationEngine from '@/components/beeyield/PollinationEngine';
import IntegrationsView from '@/components/beeyield/IntegrationsView';
import SensorAlertsView from '@/components/beeyield/SensorAlertsView';

import LiveActivityHeatmap from '@/components/beeyield/LiveActivityHeatmap';
import PredictiveSuccessEngine from '@/components/beeyield/PredictiveSuccessEngine';
import HealthyHiveIndex from '@/components/beeyield/HealthyHiveIndex';
import DeploymentPlanning from '@/components/beeyield/DeploymentPlanning';

import ForagingOptimizer from '@/components/beeyield/ForagingOptimizer';
import HiveLogisticsSecurity from '@/components/beeyield/HiveLogisticsSecurity';
import DigitalHealthAudit from '@/components/beeyield/DigitalHealthAudit';
import AcousticMoodTransformer from '@/components/beeyield/AcousticMoodTransformer';
import BeeFlightHoursForecast from '@/components/beeyield/BeeFlightHoursForecast';
import VpmAutoCounter from '@/components/beeyield/VpmAutoCounter';
import VpmTicker from '@/components/beeyield/VpmTicker';
import HpaOptimizer from '@/components/beeyield/HpaOptimizer';
import FleetSecurity from '@/components/beeyield/FleetSecurity';
import ComplianceReport from '@/components/beeyield/ComplianceReport';
import BeeCalculatorPage from '@/components/beeyield/BeeCalculatorPage';

import DashboardHomeView from '@/components/beeyield/DashboardHomeView';

import HiveTelemetryView from '@/components/beeyield/HiveTelemetryView';
import ContractVerificationModule from '@/components/beeyield/ContractVerificationModule';
import GatewayHub from '@/components/beeyield/GatewayHub';
import SpatialCoverageView from '@/components/beeyield/SpatialCoverageView';
import MasterMapView from '@/pages/MasterMapView';
import BeeCalculatorSuite from '@/pages/BeeCalculatorSuite';
import BloomPhenology from '@/pages/BloomPhenology';


type AuthMode = 'login' | 'register' | 'forgot-password';

const BeeYieldDashboard: React.FC = () => {
    const { user, loading: authLoading, signOut, beeyieldUser } = useAuth();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { moduleFlags } = useSettings();

    // Auth State
    const [authMode, setAuthMode] = React.useState<AuthMode>('login');

    // Dashboard state
    const [loading, setLoading] = React.useState(true);
    const [devices, setDevices] = React.useState<IoTDevice[]>([]);
    const [readings, setReadings] = React.useState<SensorReading[]>([]);
    const [apiaries, setApiaries] = React.useState<Apiary[]>([]);
    const [hives, setHives] = React.useState<Hive[]>([]);
    const [activeTab, setActiveTab] = React.useState('home');
    const [aiInitialMessage, setAiInitialMessage] = React.useState<string | null>(null);
    const [showBanner, setShowBanner] = React.useState(true);

    const [viewParams, setViewParams] = React.useState<{ message?: string, action?: string } | null>(null);

    const handleTabChange = (tab: string, message?: string, action?: string) => {
        if (tab === 'assistant' && message) {
            setAiInitialMessage(message);
        }
        setViewParams({ message, action });
        setActiveTab(tab);
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/shop');
        toast.success(t('disconnected_success'));
    };

    // Data fetching
    const refreshTelemetryData = React.useCallback(async () => {
        if (!user) return;
        const [devicesData, readingsData] = await Promise.all([
            beeyieldService.getDevices(),
            beeyieldService.getSensorReadings(undefined, 24 * 7),
        ]);
        setDevices(devicesData);
        setReadings(readingsData);
    }, [user]);

    React.useEffect(() => {
        const loadData = async () => {
            // Only load data if user is authenticated
            if (!user) return;

            setLoading(true);
            try {
                const [devicesData, readingsData, apiariesData, hivesData] = await Promise.all([
                    beeyieldService.getDevices(),
                    beeyieldService.getSensorReadings(undefined, 24 * 7), // Get last 7 days for stats
                    beeyieldService.getApiaries(),
                    beeyieldService.getHives()
                ]);

                const userId = beeyieldUser?.id || user?.id;
                const baseApiaries = userId ? apiariesData.filter(a => !a.user_id || a.user_id === userId) : apiariesData;
                const baseHives = userId ? hivesData.filter(h => !h.user_id || h.user_id === userId) : hivesData;

                // Timothy's production account: show only Kibwei Sanctuary and its hives.
                const email = (user?.email || '').toLowerCase();
                const isTimothy =
                    email === 'timothynduva3492@gmail.com' ||
                    email === 'timothynduva3492gmail.com' ||
                    email === 'timothynduva349@gmail.com';

                const filteredApiaries = isTimothy
                    ? baseApiaries.filter(a => (a.name || '').toLowerCase() === 'kibwei sanctuary')
                    : baseApiaries;

                const allowedApiaryIds = new Set(filteredApiaries.map(a => a.id));
                const filteredHives = isTimothy
                    ? baseHives.filter(h => !h.apiary_id || allowedApiaryIds.has(h.apiary_id))
                    : baseHives;

                setDevices(devicesData);
                setReadings(readingsData);
                setApiaries(filteredApiaries);
                setHives(filteredHives);
            } catch (error) {
                console.error('Failed to load dashboard data', error);
                toast.error(t('error_load_dashboard'));
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading && user) {
            loadData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, authLoading]);

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

    // Attention Needed Stats
    const noMeasurement5Days = devices.filter(d => {
        const hasRecent = readings.some(r => r.device_id === d.id && (now.getTime() - new Date(r.timestamp).getTime() < oneDay * 5));
        return !hasRecent;
    }).length;

    const lowBattery = devices.filter(d => d.battery_level < 20).length;

    // Navigation restored EXACTLY to previous historical arrangement
    const navItems: NavItem[] = React.useMemo(() => {
        const items: NavItem[] = [
            { id: 'home', label: 'Home', icon: Home },
            { id: 'assistant', label: 'BeeYield Assistant', icon: Hexagon },
            { id: 'agro-intelligence', label: 'Strategic Insights', icon: LayoutGrid },
            {
                id: 'precision-pollination-folder',
                label: 'Pollination',
                icon: Calculator,
                submenuItems: [
                    {
                        title: 'Strategy & Ops',
                        items: [
                            { id: 'intelligence', label: 'Insights', icon: Brain },
                            { id: 'pollination-grid', label: 'Pollination overview', icon: LayoutGrid },
                            { id: 'pollination-engine', label: 'Pollination planning', icon: Cpu },
                            { id: 'saturation-math', label: 'Coverage area', icon: Scale },
                            { id: 'hpa-optimizer', label: 'Performance planning', icon: Cpu },
                        ]
                    },
                    {
                        title: 'Field Logistics',
                        items: [
                            { id: 'master-map', label: 'Master Map', icon: Map },
                            { id: 'orchard-mapper', label: 'Orchard Mapper', icon: Layers },
                            { id: 'fleet-security', label: 'Hive security', icon: ShieldCheck },
                            { id: 'flight-mapping-tactical', label: 'Flight Mapping', icon: Navigation },
                            { id: 'site-reports-tactical', label: 'Field reports', icon: FileBarChart },
                        ]
                    },
                    {
                        title: 'Health & Compliance',
                        items: [
                            { id: 'digital-audit', label: 'Health check', icon: FileCheck },
                            { id: 'compliance-report', label: 'Compliance Report', icon: Award },
                            { id: 'sensor-alerts', label: 'Sensor Alerts', icon: Bell },
                            { id: 'bloom-tracking', label: 'Bloom Phenology', icon: Zap },
                        ]
                    },
                    {
                        title: 'Analysis & Yield',
                        items: [
                            { id: 'acoustic-transformer', label: 'Sound analysis', icon: Volume2 },
                            { id: 'bee-calculator', label: 'Bee Calculator', icon: Calculator },
                            { id: 'foraging-optimizer', label: 'Foraging guide', icon: Crosshair },
                            { id: 'vpm-counter', label: 'Activity counter', icon: Camera },
                            { id: 'bfh-forecast', label: 'Activity forecast', icon: Zap },
                            { id: 'yield-predict', label: 'Production estimate', icon: BarChart3 },
                        ]
                    },
                    {
                        title: 'System View',
                        items: [
                            { id: 'sensor-vitals', label: 'Hive Health', icon: Heart },
                            { id: 'continuous-monitor', label: 'Live Stream', icon: Activity },
                            { id: 'yard-ops', label: 'Bee Yard', icon: Building2 },
                            { id: 'gateway-hub', label: 'Device gateway', icon: Server },
                            { id: 'hive-telemetry', label: 'Advanced sensor data', icon: Signal },
                            { id: 'contract-verification', label: 'Verified contracts', icon: ShieldCheck },
                        ]
                    },
                ]
            },
            { id: 'places', label: 'Apiaries', icon: MapPin },
            {
                id: 'beeyield',
                label: 'Hives',
                icon: Hexagon,
                submenuItems: [
                    { id: 'inspections', label: 'Inspections', icon: Search },
                    { id: 'harvests', label: 'Harvests', icon: Hand },
                    { id: 'flight-map', label: 'Flight Map', icon: Map },
                    { id: 'varroa', label: 'Varroa', icon: TrendingUp },
                    { id: 'sound', label: 'Sound', icon: Volume2 },
                    { id: 'image-analysis', label: 'Image Analysis', icon: Camera },
                    { id: 'health-guide', label: 'Health Guide', icon: BookOpen },
                    { id: 'reports-exports', label: 'Reports & Exports', icon: FileText },
                    { id: 'label-generator', label: 'Label Generator', icon: Tag },
                    { id: 'global-hive-network', label: 'Global Hive Network', icon: Globe },
                ]
            },
            {
                id: 'data',
                label: 'Measurement Data',
                icon: Activity,
                submenuItems: [
                    { id: 'online', label: 'Online', icon: Signal },
                    { id: 'bluetooth', label: 'Bluetooth', icon: Bluetooth },
                    { id: 'devices', label: 'My Devices', icon: Cpu },
                    { id: 'usb', label: 'USB', icon: Usb },
                ]
            },
            { id: 'notes', label: 'My Notes', icon: FileText },
            { id: 'requests', label: 'My Requests', icon: HelpCircle },
            { id: 'task', label: 'My Tasks', icon: ClipboardList },
            { id: 'buy', label: 'Buy BeeYield Hub', icon: Cpu },
            {
                id: 'meters',
                label: 'Meters',
                icon: LayoutList,
                submenuItems: [
                    { id: 'meters-dashboard', label: 'Dashboard', icon: Gauge },
                    { id: 'meters-list', label: 'Meter List', icon: List },
                    { id: 'meters-alarms', label: 'Alarms/Events', icon: Bell },
                    { id: 'meters-payments', label: 'Payments', icon: Banknote },
                    { id: 'meters-reports', label: 'Reports', icon: FileText },
                    { id: 'meters-settings', label: 'Settings', icon: Settings },
                ]
            },
            { id: 'billing', label: 'Billing', icon: Receipt },
            { id: 'integrations', label: 'Integrations', icon: Puzzle },
            { id: 'support', label: 'Support', icon: LifeBuoy },
            { id: 'settings', label: 'Settings', icon: Settings },
        ];
        return items;
    }, []);

    // Function to render content based on active tab
    const renderContent = () => {
        switch (activeTab) {
            case 'home':
                return <DashboardHomeView devices={devices} readings={readings} apiaries={apiaries} onTabChange={handleTabChange} />;
            case 'assistant':
                return (
                    <SmartAssistantView
                        onTabChange={handleTabChange}
                        initialMessage={aiInitialMessage || undefined}
                        onInitialMessageConsumed={() => setAiInitialMessage(null)}
                    />
                );
            case 'agro-intelligence':
                return <AgroIntelligenceView onTabChange={handleTabChange} />;
            case 'precision-pollination-folder':
            case 'precision-pollination-home':
                return <PrecisionPollinationView devices={devices} readings={readings} onTabChange={handleTabChange} activeSubPageOverride="home" />;

            case 'bloom-tracking':
            case 'bloom-phenology':
                return <BloomPhenology />;
            case 'pollination-calcs':
            case 'pollination-engine':
                return <PollinationEngine onTabChange={handleTabChange} />;
            case 'flight-mapping-tactical':
                return <PrecisionPollinationView devices={devices} readings={readings} onTabChange={handleTabChange} activeSubPageOverride="map" />;
            case 'site-reports-tactical':
                return <PrecisionPollinationView devices={devices} readings={readings} onTabChange={handleTabChange} activeSubPageOverride="reports" />;

            case 'intelligence':
            case 'pollination-intelligence':
                return <PollinationIntelligence onTabChange={handleTabChange} />;

            case 'logistics-setup':
            case 'master-map':
                return <MasterMapView />;
            case 'orchard-mapper':
                return <OrchardMapper onTabChange={handleTabChange} />;

            case 'fleet-security':
            case 'geospatial-security':
            case 'deployment':
                return <HiveLogisticsSecurity onTabChange={handleTabChange} />;

            case 'acoustic-transformer':
                return <AcousticMoodTransformer />;

            case 'bee-calculator':
            case 'calculator-suite':
                return <BeeCalculatorSuite />;

            case 'hpa-optimizer':
                return <HpaOptimizer />;

            case 'foraging-optimizer':
                return <ForagingOptimizer onTabChange={handleTabChange} />;

            case 'yield-predict':
                return <PredictiveSuccessEngine onTabChange={handleTabChange} />;

            case 'fleet-security-active':
                return <FleetSecurity />;

            case 'bfh-forecast':
                return <BeeFlightHoursForecast />;

            case 'vpm-counter':
                return <VpmAutoCounter />;

            case 'digital-audit':
            case 'hhi-audit':
                return <DigitalHealthAudit onTabChange={handleTabChange} />;

            case 'compliance-report':
                return <ComplianceReport onTabChange={handleTabChange} />;

            case 'sensor-alerts':
                return <SensorAlertsView />;

            case 'sensor-vitals':
                return <SensorHealthView onTabChange={handleTabChange} />;
            case 'continuous-monitor':
                return <ContinuousMonitor onTabChange={handleTabChange} />;
            // Removed duplicate cases below to fix build errors


            case 'hive-telemetry':
                return <HiveTelemetryView />;
            case 'contract-verification':
                return <ContractVerificationModule />;
            case 'pollination-grid':
            case 'precision-pollination-grid':
                return <PrecisionPollinationView devices={devices} readings={readings} onTabChange={handleTabChange} activeSubPageOverride="grid" />;
            case 'gateway-hub':
                return <GatewayHub />;
            case 'saturation-math':
                return <SpatialCoverageView />;
            case 'yard-ops':
                return <YardOperations onTabChange={handleTabChange} />;

            case 'places':
                return <MyPlacesView onTabChange={handleTabChange} />;
            case 'beeyield':
                return <BeeYieldHivesView onTabChange={handleTabChange} />;
            case 'inspections':
                return <InspectionsView onTabChange={handleTabChange} initialParams={viewParams} />;
            case 'harvests':
                return <HarvestsView onTabChange={handleTabChange} initialParams={viewParams} />;
            case 'flight-map':
                return <FlightMapView />;
            case 'varroa':
                return <VarroaView />;
            case 'global-hive-network':
                return <GlobalHiveNetwork />;
            case 'data':
                return <MeasurementDataView onTabChange={handleTabChange} />;
            case 'online':
                return <BeeYieldOnlineView onTabChange={handleTabChange} />;
            case 'bluetooth':
                return <BluetoothConnectivityView onTabChange={handleTabChange} />;
            case 'device': {
                const deviceId = viewParams?.action;
                if (!deviceId) return <MyDevicesView devices={devices} readings={readings} apiaries={apiaries} hives={hives} onTabChange={handleTabChange} />;
                return (
                    <DeviceDetailView
                        deviceId={deviceId}
                        devices={devices}
                        readings={readings}
                        apiaries={apiaries}
                        hives={hives}
                        onBack={() => handleTabChange('devices')}
                        onRefresh={refreshTelemetryData}
                    />
                );
            }
            case 'devices':
                return <MyDevicesView devices={devices} readings={readings} apiaries={apiaries} hives={hives} onTabChange={handleTabChange} />;
            case 'usb':
                return <USBView onTabChange={handleTabChange} />;
            case 'notes':
                return <MyNotesView onTabChange={handleTabChange} />;
            case 'requests':
                return <MyRequestsView onTabChange={handleTabChange} />;
            case 'task':
                return <MyTaskView onTabChange={handleTabChange} />;
            case 'buy':
                return <BuyBeeYieldHubView onTabChange={handleTabChange} />;
            case 'meters':
            case 'meters-dashboard':
            case 'meters-list':
            case 'meters-water':
            case 'meters-heat':
            case 'meters-energy':
            case 'meters-other':
            case 'meters-buildings':
            case 'meters-apartments':
            case 'meters-measurements':
            case 'meters-charts':
            case 'meters-consumption':
            case 'meters-comparisons':
            case 'meters-import':
            case 'meters-alarms':
            case 'meters-payments':
            case 'meters-reports':
            case 'meters-settings':
                return <MetersView onTabChange={handleTabChange} activeSubTab={activeTab} />;
            case 'billing':
                return <BillingView onTabChange={handleTabChange} />;
            case 'integrations':
                return <IntegrationsView />;
            case 'support':
                return <SupportCenterView onTabChange={handleTabChange} />;
            case 'settings': // Special case from top bar or banner
                return <SettingsView onTabChange={handleTabChange} />;
            case 'image-analysis':
                return <ImageAnalysisView onTabChange={handleTabChange} />;
            case 'sound':
                return <SoundAnalysisView onTabChange={handleTabChange} />;
            case 'health-guide':
                return <HealthGuideView onTabChange={handleTabChange} />;
            case 'reports-exports':
                return <ReportsExportsView onTabChange={handleTabChange} />;
            case 'label-generator':
                return <LabelGeneratorView onTabChange={handleTabChange} />;
            default:
                return (
                    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-[#FFF9F0] rounded-[2.5rem] border border-dashed border-[#F4D03F]/20">
                        <div className="w-16 h-16 bg-[#F9F7F2] rounded-2xl flex items-center justify-center mb-4">
                            <span className="text-[8px] font-bold text-gray-300">© 2026 BeeYield AI Platform</span>
                        </div>
                        <h3 className="text-lg font-medium text-[#1A1A1A]">
                            {navItems.find(i => i.id === activeTab)?.label || t('view_content')}
                        </h3>
                        <p className="text-gray-500 mt-1 max-w-sm font-medium">
                            {t('under_development')}
                        </p>
                    </div>
                );
        }
    };

    if (authLoading) {
        return (
            <BeeYieldPageShell className="bg-[#FFF9F0] flex flex-col items-center justify-center gap-4 p-0 md:p-0 -m-4 md:-m-6">
                <img src="/logo.png" alt="Loading..." className="h-16 w-auto animate-pulse" />
            </BeeYieldPageShell>
        );
    }

    // Check if user has initialized BeeYield access
    const isBeeYieldActive = !!user?.user_metadata?.beeyield_active || ['timothynduva349@gmail.com', SUPER_ADMIN_EMAIL.toLowerCase()].includes(user?.email?.toLowerCase() || '') || !!beeyieldUser;



    if (!user || !isBeeYieldActive) {
        return (
            <BeeYieldPageShell className="bg-[#FFF9F0] flex flex-col items-center justify-center p-8 font-sans text-[#064e3b] antialiased">
                <div className="max-w-lg w-full text-center space-y-8">
                    <div className="w-20 h-20 rounded-3xl bg-white border border-[#064e3b]/10 flex items-center justify-center mx-auto shadow-sm">
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold text-[#1A1A1A] tracking-tighter leading-none">BeeYield <span className="text-[#F4D03F]">AI</span></span>
                            <span className="text-[9px] font-bold text-[#F4D03F] mt-1 uppercase tracking-widest">Operational OS</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                            Sign in to continue
                        </h1>
                        <p className="text-sm text-[#064e3b]/70 font-medium leading-relaxed">
                            You need an account to access the BeeYield AI dashboard.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => navigate('/login')}
                            className="h-12 px-8 rounded-xl bg-[#10b981] text-[#1A1A1A] font-black text-sm tracking-tight hover:bg-[#0ea371] transition-colors flex items-center justify-center gap-2"
                        >
                            <LockIcon className="w-4 h-4" />
                            Sign in
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="h-12 px-8 rounded-xl bg-white border border-[#064e3b]/10 text-[#064e3b] font-bold text-sm hover:bg-[#064e3b]/5 transition-colors"
                        >
                            Back home
                        </button>
                    </div>
                </div>
            </BeeYieldPageShell>
        );
    }

    return (
        <DashboardLayout
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onLogout={handleLogout}
            navItems={navItems}
        >
            {renderContent()}
        </DashboardLayout>
    );
};

export default BeeYieldDashboard;
