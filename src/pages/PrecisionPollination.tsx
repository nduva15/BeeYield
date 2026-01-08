import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check, TrendingUp, Shield, BarChart3, ArrowRight,
  Cpu, Wifi, Zap, Target, Database, Award, Clock, Users,
  Activity, Thermometer, Mic, Radio, Smartphone, Bell,
  Settings, LineChart, Heart, AlertCircle, CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";

const PrecisionPollination = () => {
  const sensorMetrics = [
    {
      icon: Thermometer,
      title: "Temperature Monitoring",
      description: "Continuous tracking of hive internal temperature (33-36°C optimal range) to ensure colony comfort and brood health.",
      color: "from-red-500 to-orange-500"
    },
    {
      icon: Activity,
      title: "Humidity Levels",
      description: "Real-time humidity measurements (40-60% ideal) prevent moisture-related diseases and maintain optimal hive conditions.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Mic,
      title: "Acoustic Analysis",
      description: "AI-powered sound pattern recognition identifies queen presence, swarming behavior, and colony stress levels.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Database,
      title: "Population Tracking",
      description: "Estimate bee population dynamics through activity patterns and hive weight changes over time.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Bell,
      title: "Health Alerts",
      description: "Instant notifications when sensors detect anomalies like disease signatures, pest invasions, or queen loss.",
      color: "from-amber-500 to-yellow-500"
    },
    {
      icon: LineChart,
      title: "Productivity Metrics",
      description: "Track foraging activity, honey production rates, and pollination efficiency across your entire operation.",
      color: "from-indigo-500 to-violet-500"
    }
  ];

  const dataPoints = [
    { label: "Sensors per Hive", value: "5-8", icon: Cpu },
    { label: "Data Points Daily", value: "10,000+", icon: BarChart3 },
    { label: "Update Frequency", value: "15 min", icon: Clock },
    { label: "Battery Life", value: "12 mo", icon: Zap }
  ];

  const benefits = [
    {
      icon: Shield,
      title: "Colony Health Guarantee",
      description: "We monitor colony strength 24/7. If our sensors detect a weak hive, we replace it immediately—before it impacts your pollination.",
      stat: "99.2% uptime"
    },
    {
      icon: Target,
      title: "Precision Placement",
      description: "AI algorithms analyze your field layout and crop bloom patterns to determine optimal hive positioning for maximum coverage.",
      stat: "35% better coverage"
    },
    {
      icon: TrendingUp,
      title: "Yield Optimization",
      description: "Historical data from thousands of hives helps us predict and maximize pollination effectiveness for your specific crop.",
      stat: "28% average yield boost"
    },
    {
      icon: Users,
      title: "Expert Support Team",
      description: "Dedicated agronomists and beekeeping specialists analyze your data and provide actionable recommendations weekly.",
      stat: "48hr response time"
    }
  ];

  const technicalSpecs = [
    {
      category: "In-Hive Sensors",
      specs: [
        "Temperature range: -40°C to 85°C (±0.5°C accuracy)",
        "Humidity range: 0-100% RH (±2% accuracy)",
        "Acoustic sampling: 16kHz, 24-bit resolution",
        "Vibration detection: 3-axis accelerometer",
        "Weight monitoring: ±50g precision",
        "Bluetooth 5.0 Low Energy connectivity"
      ]
    },
    {
      category: "Gateway Unit",
      specs: [
        "Coverage range: 100m radius per gateway",
        "Cellular connectivity: 4G LTE with 5G ready",
        "Power: Solar + battery backup (3 days autonomy)",
        "Weatherproof: IP67 rated enclosure",
        "Data transmission: Encrypted AES-256",
        "GPS location tracking built-in"
      ]
    },
    {
      category: "Cloud Platform",
      specs: [
        "Real-time dashboard with mobile apps (iOS/Android)",
        "Historical data retention: 10+ years",
        "API access for farm management integration",
        "Machine learning insights updated weekly",
        "Multi-user access with role management",
        "Automated reporting and alerts"
      ]
    }
  ];

  const performanceMetrics = [
    { metric: "Colony Survival Rate", traditional: "78%", precision: "96%", improvement: "+23%" },
    { metric: "Pollination Consistency", traditional: "Variable", precision: "Predictable", improvement: "100% visibility" },
    { metric: "Hive Replacement Speed", traditional: "5-7 days", precision: "Same day", improvement: "5x faster" },
    { metric: "Data-Driven Decisions", traditional: "None", precision: "Real-time", improvement: "Complete intel" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-foreground via-secondary to-foreground">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-honey-light/20 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-secondary/40 rounded-full blur-3xl animate-pulse delay-500" />
          </div>
          {/* Honeycomb Pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="honeycomb-precision" x="0" y="0" width="20" height="17.32" patternUnits="userSpaceOnUse">
              <polygon points="10,0 20,5.77 20,17.32 10,23.09 0,17.32 0,5.77" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#honeycomb-precision)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-8">
              <Badge className="bg-white/20 text-white border-white/30 text-sm px-4 py-2">
                <Cpu className="h-4 w-4 inline mr-2" />
                In-Hive IoT Intelligence
              </Badge>

              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                Know Your
                <span className="text-honey-light block">Hives</span>
                Inside
                <span className="text-honey-light block">& Out</span>
              </h1>

              <p className="text-xl text-white/90 max-w-lg leading-relaxed">
                Stop paying for boxes. Start paying for performance. Our precision sensor network
                gives you X-ray vision into every hive, ensuring you get the pollination power you paid for.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-white text-indigo-900 hover:bg-blue-100 text-lg px-8 py-6 font-semibold shadow-2xl">
                  Request Free Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 bg-transparent">
                  Watch Demo Video
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
                <div>
                  <p className="text-3xl font-bold text-honey-light">150+</p>
                  <p className="text-white/70 text-sm">Monitored Hives</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-honey-light">96%</p>
                  <p className="text-white/70 text-sm">Colony Health Rate</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-honey-light">15min</p>
                  <p className="text-white/70 text-sm">Update Interval</p>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="hidden lg:block relative">
              <div className="relative w-full aspect-square">
                {/* Central Device Mockup */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-80 h-80 bg-gradient-to-br from-blue-400/30 to-purple-500/30 backdrop-blur-sm rounded-3xl rotate-45 border border-white/20 shadow-2xl">
                    <div className="w-full h-full -rotate-45 flex items-center justify-center p-8">
                      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-xl w-full h-full flex flex-col justify-between">
                        <div className="flex justify-between items-center">
                          <Badge className="bg-green-500 text-white">Live</Badge>
                          <Wifi className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-700">Temp</span>
                            <span className="text-2xl font-bold text-gray-900">35.2°C</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full w-4/5 bg-green-500 rounded-full"></div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-700">Activity</span>
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                          </div>
                        </div>
                        <Cpu className="h-12 w-12 text-blue-600 mx-auto" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating Elements */}
                <div className="absolute top-10 right-10 bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30 animate-bounce">
                  <Database className="h-8 w-8 text-blue-300" />
                </div>
                <div className="absolute bottom-20 left-0 bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30 animate-pulse">
                  <Radio className="h-8 w-8 text-purple-300" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 animate-bounce">
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm">Discover More</span>
            <ArrowRight className="h-5 w-5 rotate-90" />
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="outline" className="text-primary border-primary">
              The Industry Problem
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              You Can't Manage What You <span className="text-primary">Can't Measure</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Traditional pollination services deliver hives to your fields and hope for the best.
              Weak colonies? You won't know until harvest. Queen dead? The beekeeper might not even realize it.
              <strong> This outdated model leaves millions on the table.</strong>
            </p>
            <div className="grid md:grid-cols-3 gap-6 pt-8">
              <div className="p-6 bg-destructive/10 rounded-2xl border border-destructive/20">
                <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">No Visibility</h3>
                <p className="text-sm text-muted-foreground">You pay for boxes, not pollination strength</p>
              </div>
              <div className="p-6 bg-destructive/10 rounded-2xl border border-destructive/20">
                <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Slow Response</h3>
                <p className="text-sm text-muted-foreground">Week-long waits for hive replacements</p>
              </div>
              <div className="p-6 bg-destructive/10 rounded-2xl border border-destructive/20">
                <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Guesswork</h3>
                <p className="text-sm text-muted-foreground">No data means no optimization</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Solution - Sensor Metrics */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="text-primary border-primary">
              Our Solution
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Six Critical Metrics, <span className="text-primary">One Complete Picture</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our multi-sensor system continuously monitors the biological and environmental factors
              that determine pollination success. Here's what we track in every single hive:
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {sensorMetrics.map((metric, index) => (
              <Card key={index} className="group bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <metric.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{metric.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{metric.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Data Points Section */}
      <section className="py-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {dataPoints.map((point, index) => (
              <div key={index} className="text-center p-8 bg-card rounded-2xl shadow-lg border border-border hover:border-primary transition-all">
                <point.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <p className="text-4xl font-bold text-foreground mb-2">{point.value}</p>
                <p className="text-sm text-muted-foreground font-medium">{point.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Hardware */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="tech-hex" x="0" y="0" width="10" height="8.66" patternUnits="userSpaceOnUse">
              <polygon points="5,0 10,2.89 10,8.66 5,11.55 0,8.66 0,2.89" fill="none" stroke="currentColor" strokeWidth="0.3" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#tech-hex)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <Badge className="bg-primary/20 text-primary dark:bg-primary/30 dark:text-honey-light">
              The Technology
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Hardware That <span className="text-primary">Thinks</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Two pieces of cutting-edge hardware work together to give you unprecedented visibility into hive performance
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
            {/* In-Hive Sensor */}
            <Card className="group relative overflow-hidden border-2 border-transparent hover:border-primary transition-all duration-500 bg-gradient-to-br from-card to-honey-light/10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-8 relative z-10">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Mic className="h-8 w-8 text-white" />
                  </div>
                  <div className="space-y-4 flex-1">
                    <h3 className="text-2xl font-bold text-foreground">In-Hive Sensor Node</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Compact, non-invasive sensors installed inside each hive capture temperature, humidity,
                      and acoustic signatures. Our proprietary AI decodes bee sounds to detect queen health,
                      swarming intentions, and stress indicators.
                    </p>
                    <ul className="space-y-2">
                      {["Temperature ±0.5°C accuracy", "16kHz acoustic sampling", "12-month battery life", "Bluetooth Low Energy"].map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gateway Unit */}
            <Card className="group relative overflow-hidden border-2 border-transparent hover:border-secondary transition-all duration-500 bg-gradient-to-br from-card to-secondary/10">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-nature-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-8 relative z-10">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-nature-green flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Wifi className="h-8 w-8 text-white" />
                  </div>
                  <div className="space-y-4 flex-1">
                    <h3 className="text-2xl font-bold text-foreground">FieldGate™ Hub</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Solar-powered gateway collects data from up to 50 hives within 100m radius via Bluetooth,
                      then securely uploads to our cloud platform via 4G/5G cellular connection. Works anywhere,
                      even in remote fields.
                    </p>
                    <ul className="space-y-2">
                      {["100m Bluetooth range", "Solar + 3-day battery backup", "4G LTE cellular uplink", "IP67 weatherproof"].map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-secondary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Technical Specifications Deep Dive */}
          <div className="max-w-6xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12">Complete Technical Specifications</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {technicalSpecs.map((section, index) => (
                <Card key={index} className="bg-card">
                  <CardContent className="p-6">
                    <h4 className="text-lg font-bold mb-4 text-primary">{section.category}</h4>
                    <ul className="space-y-2">
                      {section.specs.map((spec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                          <span>{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="text-primary border-primary">
              Your Benefits
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              From Data to <span className="text-primary">Dollars</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              All this technology translates into real, measurable improvements for your farm
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <Card key={index} className="group relative overflow-hidden border-2 hover:border-primary transition-all">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-foreground">{benefit.title}</h3>
                        <Badge className="bg-nature-green-light text-nature-green">
                          {benefit.stat}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Performance Comparison */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <Badge className="bg-primary/20 text-primary">
              The Proof
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Traditional vs. <span className="text-primary">Precision</span>
            </h2>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-border">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-6 font-bold text-foreground">Performance Metric</th>
                    <th className="text-center p-6 font-bold text-muted-foreground">Traditional Pollination</th>
                    <th className="text-center p-6 font-bold text-primary">BeeYield Precision</th>
                    <th className="text-center p-6 font-bold text-secondary">Improvement</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceMetrics.map((row, index) => (
                    <tr key={index} className="border-t border-border hover:bg-muted/20 transition-colors">
                      <td className="p-6 font-semibold text-foreground">{row.metric}</td>
                      <td className="p-6 text-center text-muted-foreground">{row.traditional}</td>
                      <td className="p-6 text-center font-bold text-primary">{row.precision}</td>
                      <td className="p-6 text-center font-bold text-secondary">{row.improvement}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-24 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="text-primary border-primary">
              Your Command Center
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Real-Time Dashboard, <span className="text-primary">Real Power</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Access your entire pollination operation from any device—desktop, tablet, or smartphone
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="bg-foreground text-background border-none shadow-2xl overflow-hidden">
              <CardContent className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">Live Hive Monitoring</h3>
                    <p className="text-gray-400">Updated every 15 minutes</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-secondary animate-pulse" />
                    <span className="text-sm font-semibold">LIVE</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <Thermometer className="h-8 w-8 text-destructive" />
                      <CheckCircle2 className="h-6 w-6 text-nature-green" />
                    </div>
                    <p className="text-3xl font-bold mb-1">35.2°C</p>
                    <p className="text-sm text-gray-400">Avg. Hive Temperature</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <Activity className="h-8 w-8 text-primary" />
                      <CheckCircle2 className="h-6 w-6 text-nature-green" />
                    </div>
                    <p className="text-3xl font-bold mb-1">52%</p>
                    <p className="text-sm text-gray-400">Avg. Humidity</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <Heart className="h-8 w-8 text-honey-light" />
                      <CheckCircle2 className="h-6 w-6 text-nature-green" />
                    </div>
                    <p className="text-3xl font-bold mb-1">148</p>
                    <p className="text-sm text-gray-400">Healthy Hives</p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h4 className="font-bold mb-4 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Activity Trends (Last 7 Days)
                  </h4>
                  <div className="space-y-3">
                    {[
                      { day: "Today", value: 92 },
                      { day: "Yesterday", value: 88 },
                      { day: "2 days ago", value: 85 }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <span className="text-sm w-24 text-gray-400">{item.day}</span>
                        <div className="flex-1 h-8 bg-white/5 rounded-lg overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-end pr-3"
                            style={{ width: `${item.value}%` }}
                          >
                            <span className="text-xs font-bold">{item.value}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center mt-8">
              <Link to="/dashboard">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Explore Live Dashboard Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Integration & API Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="outline" className="text-primary border-primary">
              Seamless Integration
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Plug Into Your <span className="text-primary">Existing Systems</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Our platform provides robust APIs and webhooks so you can integrate hive data into
              your farm management software, ERP systems, or custom analytics dashboards.
            </p>
            <div className="grid md:grid-cols-2 gap-6 pt-8">
              <Card className="bg-gradient-to-br from-background to-muted border-border">
                <CardContent className="p-6">
                  <Settings className="h-10 w-10 text-primary mb-4" />
                  <h3 className="font-bold text-lg mb-2">RESTful API</h3>
                  <p className="text-sm text-muted-foreground">Full CRUD access to all hive data with comprehensive documentation</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-background to-muted border-border">
                <CardContent className="p-6">
                  <Smartphone className="h-10 w-10 text-secondary mb-4" />
                  <h3 className="font-bold text-lg mb-2">Mobile Apps</h3>
                  <p className="text-sm text-muted-foreground">Native iOS and Android apps for field teams and managers</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-foreground via-secondary to-foreground">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-20 w-64 h-64 bg-blue-400 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-20 w-80 h-80 bg-purple-300 rounded-full blur-3xl" />
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-6xl font-bold text-white">
              Ready to See Inside Your Hives?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Join the farmers who've traded guesswork for guaranteed results.
              Schedule a free consultation and we'll create a custom monitoring plan for your operation.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link to="/pollination-request">
                <Button size="lg" className="bg-white text-primary hover:bg-honey-light/20 text-lg px-8 py-6 font-semibold shadow-xl">
                  Request Pollination Service
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 bg-transparent">
                  Talk to Our Team
                </Button>
              </Link>
            </div>
            <p className="text-white/70 text-sm pt-4">
              No commitment required. Free assessment of your pollination needs and custom quote.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrecisionPollination;
