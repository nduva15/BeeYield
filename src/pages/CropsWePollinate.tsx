import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, Cpu, Sprout, ArrowRight, Check,
  Globe, Flower2, Wheat, MapPin, Mail,
  Sparkles, Camera, CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { dashboardPollinationCropDetails } from "@/data/beePollinationData";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";

const CropsWePollinate = () => {
  const pollinationCrops = dashboardPollinationCropDetails;

  const locations = [
    { continent: "Africa", countries: ["Kenya"], color: "bg-primary" }
  ];

  // Accurate world map TopoJSON from world-atlas
  const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

  return (
    <BeeYieldPageShell className="min-h-screen bg-background p-0">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#F0F7F0] py-20 md:py-32">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 sm:top-20 left-4 sm:left-10 w-40 sm:w-72 h-40 sm:h-72 bg-secondary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-10 sm:bottom-20 right-4 sm:right-10 w-48 sm:w-96 h-48 sm:h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 sm:w-64 h-32 sm:h-64 bg-[#1B9157] rounded-full blur-3xl animate-pulse delay-500" />
          </div>
          {/* Honeycomb Pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="honeycomb-crops" x="0" y="0" width="20" height="17.32" patternUnits="userSpaceOnUse">
              <polygon points="10,0 20,5.77 20,17.32 10,23.09 0,17.32 0,5.77" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#honeycomb-crops)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-8">
              <Badge className="bg-green-100 text-[#1B9157] border-green-200 rounded-full px-4 py-1.5 text-sm font-bold">
                Precision Agriculture • Active Field Deployments
              </Badge>
              <h1 className="text-4xl font-black tracking-tighter md:text-5xl lg:text-6xl leading-tight text-neutral-900">
                Get Data-Driven <br />
                <span className="text-[#1B9157]">Crop Pollination</span>
              </h1>
              <p className="max-w-xl text-lg text-neutral-600 font-medium leading-relaxed">
                Our end-to-end precision pollination solution gives farmers unprecedented control and visibility into floral anthesis, optimizing fruit set and maximizing harvest yields.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="rounded-full bg-green-700 hover:bg-green-800 text-[#1A1A1A] font-bold h-14 px-8 shadow-xl shadow-green-900/10" asChild>
                  <Link to="/contact">Get a Free Consultation</Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full border-2 border-neutral-200 text-neutral-900 hover:bg-[#F9F7F2] font-bold h-14 px-8" asChild>
                  <Link to="#latest-field-highlight">Latest Field Photos</Link>
                </Button>
              </div>
            </div>

            <div className="relative hidden lg:block">
              {/* Decorative grid of authentic latest field photos */}
              <div className="absolute -right-4 -top-4 h-32 w-32 rounded-2xl bg-[#1B9157] blur-3xl animate-pulse" />
              <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-[#F4D03F] blur-3xl animate-pulse delay-1000" />
              <div className="grid grid-cols-2 gap-4">
                <div className="relative group overflow-hidden rounded-3xl shadow-2xl border-4 border-[#F4D03F]/100">
                  <img
                    src="/images/pollination/mango-panicles-close-bloom.png"
                    alt="Mango Panicles in Bloom"
                    className="h-48 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <span className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-white">
                    🥭 Mango Bloom Panicles
                  </span>
                </div>

                <div className="relative group overflow-hidden rounded-3xl shadow-2xl border-4 border-[#F4D03F]/100 mt-8">
                  <img
                    src="/images/pollination/orange-tree-citrus-fruits.jpg"
                    alt="Citrus Setting with Baobab"
                    className="h-48 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <span className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-white">
                    🍊 Orange Fruit Setting
                  </span>
                </div>

                <div className="relative group overflow-hidden rounded-3xl shadow-2xl border-4 border-[#F4D03F]/100 -mt-4">
                  <img
                    src="/images/pollination/apisense-internal-sensor-probe.png"
                    alt="BeeYield and Apisense at Work - Bees on Comb"
                    className="h-48 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <span className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-white">
                    🐝 BeeYield & Apisense at Work
                  </span>
                </div>

                <div className="relative group overflow-hidden rounded-3xl shadow-2xl border-4 border-[#F4D03F]/100 mt-4">
                  <img
                    src="/images/pollination/mango-orange-farm-wide.jpg"
                    alt="Dryland Baobab Orchard Layout"
                    className="h-48 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <span className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-white">
                    🌳 Baobab Agroforestry
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expert Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold md:text-4xl mb-4">Work With the Pollination Experts</h2>
          <div className="w-24 h-1 bg-primary mx-auto mb-8 rounded-full" />
          <p className="max-w-3xl mx-auto text-lg text-muted-foreground mb-12">
            BeeYield is comprised of leading experts in the field of pollination. Bee biologists and researchers, data-science experts, electrical engineers, leading agronomists, and veteran beekeepers make up our team, and all are committed to creating improved pollination outcomes for our customers.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <Card className="bg-card border-none shadow-lg">
              <CardContent className="p-8 text-center">
                <p className="text-4xl font-bold text-primary mb-2">25+</p>
                <p className="text-muted-foreground font-medium">Acres Managed</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-none shadow-lg">
              <CardContent className="p-8 text-center">
                <p className="text-4xl font-bold text-primary mb-2">1</p>
                <p className="text-muted-foreground font-medium">Country</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-none shadow-lg">
              <CardContent className="p-8 text-center">
                <p className="text-4xl font-bold text-primary mb-2">2</p>
                <p className="text-muted-foreground font-medium">Counties</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-none shadow-lg">
              <CardContent className="p-8 text-center">
                <p className="text-4xl font-bold text-primary mb-2">9</p>
                <p className="text-muted-foreground font-medium">Crop Varieties</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* World Map Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="rounded-full px-4 py-1.5 mb-4">
              <Globe className="w-4 h-4 mr-2" />
              Global Presence
            </Badge>
            <h2 className="text-3xl font-bold md:text-4xl mb-4">Where We Operate</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              BeeYield is expanding its precision pollination services across Africa, starting with our home base in Kenya.
            </p>
          </div>

          <div className="relative max-w-6xl mx-auto">
            <div className="relative bg-secondary/20 rounded-3xl p-4 md:p-8 overflow-hidden">
              {/* Accurate World Map */}
              <div className="w-full">
                <ComposableMap projection="geoNaturalEarth1" className="w-full">
                  <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                      geographies.map((geo) => (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          style={{
                            default: { fill: "hsl(var(--muted))", stroke: "hsl(var(--border))", strokeWidth: 0.5 },
                            hover: { fill: "hsl(var(--secondary)/0.6)", outline: "none" },
                            pressed: { fill: "hsl(var(--secondary)/0.8)", outline: "none" },
                          }}
                        />
                      ))
                    }
                  </Geographies>

                  {/* Kenya marker (Nairobi) */}
                  <Marker coordinates={[36.8219, -1.2921]}>
                    <g className="animate-ping opacity-75">
                      <circle r={8} fill="hsl(var(--primary-foreground))" />
                    </g>
                    <circle r={6} fill="hsl(var(--primary-foreground))" />
                    <circle r={3} fill="hsl(var(--primary))" />
                    <text y={-12} className="text-[11px]" fill="hsl(var(--foreground))" fontWeight={700}>
                      Kenya
                    </text>
                  </Marker>
                </ComposableMap>
              </div>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border">
                <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Active Regions
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
                    <span className="text-sm text-muted-foreground">Kenya (Headquarters)</span>
                  </div>
                </div>
              </div>

              {/* Stats overlay */}
              <div className="absolute top-4 right-4 bg-card/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border">
                <p className="text-xs text-muted-foreground mb-1">Operating in</p>
                <p className="text-2xl font-bold text-primary">1 Country</p>
                <p className="text-xs text-muted-foreground mt-1">East Africa</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Pollination Field Highlight: BeeYield and Apisense at Work */}
      <section id="latest-field-highlight" className="py-20 bg-background border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <Badge className="bg-[#1B9157]/15 text-[#1B9157] border-[#1B9157]/30 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-4">
              <Camera className="w-3.5 h-3.5 mr-1.5 inline" />
              Kenya Pollination & Mango Bloom Season • Field Operation
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-neutral-900 tracking-tight">
              BeeYield and Apisense at Work: <br />
              <span className="text-[#1B9157]">Mangoes & Oranges</span> Orchard
            </h2>
            <p className="mt-4 text-neutral-600 text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
              It is currently peak <strong>Pollination and Mango Bloom Season in Kenya</strong>! BeeYield and Apisense are deployed in the field across Makueni County. Our colonies are actively working the dense <strong>flowering mango panicles</strong> and <strong>developing citrus orange groves</strong>, with real-time <strong>Apisense™ in-hive telemetry</strong> monitoring acoustic vitality, brood temperature, and foraging velocity under ancient Baobabs.
            </p>
          </div>

          {/* 6-Photo Showcase Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
            {/* Photo 1: Mango Bloom */}
            <div className="group rounded-3xl overflow-hidden bg-card border border-border/70 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col">
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src="/images/pollination/mango-panicles-close-bloom.png"
                  alt="Mango Floral Panicles in Peak Bloom"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-amber-600/90 text-white border-none text-xs font-bold">
                    🥭 Mangoes • Bloom Season
                  </Badge>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Dense Mango Flower Panicles</h3>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                    Peak anthesis in Kenya's mango season. Thousands of delicate florets require high-density bee visits to secure fertilization and eliminate early fruit drop.
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-border/40 text-xs font-semibold text-[#1B9157]">
                  <CheckCircle2 className="w-4 h-4" /> 90% Pollination Dependency
                </div>
              </div>
            </div>

            {/* Photo 2: Orange Citrus */}
            <div className="group rounded-3xl overflow-hidden bg-card border border-border/70 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col">
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src="/images/pollination/orange-tree-citrus-fruits.jpg"
                  alt="Citrus Orange Setting and Maturing"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-orange-600/90 text-white border-none text-xs font-bold">
                    🍊 Oranges • Fruit Setting
                  </Badge>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Citrus Fruit Setting & Development</h3>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                    Orange trees loaded with young spherical fruits and late blossoms. Bee pollination directly boosts fruit circumference, juice volume, and sugar Brix levels.
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-border/40 text-xs font-semibold text-orange-600">
                  <CheckCircle2 className="w-4 h-4" /> Higher Juice Content & Brix
                </div>
              </div>
            </div>

            {/* Photo 3: Apisense In-Hive Probe */}
            <div className="group rounded-3xl overflow-hidden bg-card border border-border/70 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col">
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src="/images/pollination/apisense-internal-sensor-probe.png"
                  alt="Apisense In-Hive Telemetry Probe with Live Bees"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-yellow-600/90 text-white border-none text-xs font-bold">
                    🐝 BeeYield & Apisense at Work
                  </Badge>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Apisense™ In-Hive Telemetry</h3>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                    Apisense sensor probe mounted inside the brood comb with live honeybees actively working. Tracks acoustics, brood temperature, and queen vigor in real time.
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-border/40 text-xs font-semibold text-yellow-700">
                  <CheckCircle2 className="w-4 h-4" /> Real-Time Colony Health Telemetry
                </div>
              </div>
            </div>

            {/* Photo 4: BeeYield Field Gateway */}
            <div className="group rounded-3xl overflow-hidden bg-card border border-border/70 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col">
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src="/images/pollination/beeyield-apisense-gateway-field.png"
                  alt="BeeYield Field Gateway with Dual Antennas"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-blue-600/90 text-white border-none text-xs font-bold">
                    📡 BeeYield Field Gateway
                  </Badge>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Autonomous Solar Field Gateway</h3>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                    Solar-powered wireless hub mounted on the hive stand in the orchard. Streams in-hive Apisense telemetry directly to the BeeYield analytics dashboard.
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-border/40 text-xs font-semibold text-blue-600">
                  <CheckCircle2 className="w-4 h-4" /> 24/7 Field Telemetry Stream
                </div>
              </div>
            </div>

            {/* Photo 5: Mango Tree Full Blossom */}
            <div className="group rounded-3xl overflow-hidden bg-card border border-border/70 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col">
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src="/images/pollination/mango-tree-full-blossom.png"
                  alt="Full Blooming Mango Tree in Orchard"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-lime-700/90 text-white border-none text-xs font-bold">
                    🥭 Full Mango Bloom
                  </Badge>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Synchronized Bloom Canopy</h3>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                    Vibrant flowering canopy in the dryland orchard. Mobile BeeYield colonies positioned to ensure top branches receive complete pollination pressure.
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-border/40 text-xs font-semibold text-lime-700">
                  <CheckCircle2 className="w-4 h-4" /> 100% Upper Branch Receptivity
                </div>
              </div>
            </div>

            {/* Photo 6: Mixed Intercrop Agroforestry */}
            <div className="group rounded-3xl overflow-hidden bg-card border border-border/70 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col">
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src="/images/pollination/citrus-mango-intercrop.jpg"
                  alt="Citrus and Mango Intercropped Rows"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-teal-700/90 text-white border-none text-xs font-bold">
                    🌳 Intercrop Synergy • Oranges & Mangoes
                  </Badge>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Intercropped Agroforestry Rows</h3>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                    Synergistic pollination: bees forage across complementary floral nectar and pollen curves of mangoes and citrus, maintaining peak hive vigor throughout the season.
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-border/40 text-xs font-semibold text-teal-700">
                  <CheckCircle2 className="w-4 h-4" /> Multi-Crop Revenue Boost
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Crops Grid */}
      <section id="crops" className="py-20 bg-secondary/10">
        <div className="container mx-auto px-4">
          {/* Crop Navigation Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {pollinationCrops.map((c, i) => (
              <Badge
                key={i}
                variant="outline"
                className="px-4 py-2 text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all rounded-full border-neutral-200"
              >
                {c.cropName}
              </Badge>
            ))}
          </div>

          {/* Crops Cards */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {pollinationCrops.map((crop, index) => (
              <Card key={index} className="overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all group bg-[#FFF9F0]">
                <div className="relative h-64 overflow-hidden">
                  <div className="absolute top-4 right-4 z-20">
                    <Badge className="bg-[#1B9157] text-white backdrop-blur-md border-none px-3 py-1 font-black">
                      {crop.beeDependence}
                    </Badge>
                  </div>
                  <img
                    src={crop.image}
                    alt={crop.cropName}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A2612]/90 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 space-y-1">
                    <h3 className="text-[2.5rem] font-black text-[#1A1A1A] leading-none tracking-tighter">{crop.cropName}</h3>
                    <Link
                      to={`/media#${crop.cropName === "Mangoes" ? "mangoes" : crop.cropName === "Oranges" ? "oranges" : "latest-pollination"}`}
                      className="inline-flex items-center gap-2 text-gray-600 hover:text-[#1A1A1A] text-xs font-black mt-2 transition-colors"
                    >
                      View Media Case Study <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Missing Crop CTA */}
      <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="hexagons" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M5 0 L10 2.5 L10 7.5 L5 10 L0 7.5 L0 2.5 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#hexagons)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-foreground/20 mb-6">
            <Flower2 className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold md:text-4xl mb-4">Don't See Your Crop?</h2>
          <p className="max-w-2xl mx-auto text-primary-foreground/80 mb-8">
            If your crop depends on bees, we’d like to hear from you. We can help with hive placement, timing of bee removal, and more efficient, cost-effective pollination.
          </p>
          <Button size="lg" variant="secondary" className="rounded-full" asChild>
            <a href="mailto:info@beeyield.com">
              <Mail className="mr-2 h-5 w-5" /> Email Our Customer Success Team
            </a>
          </Button>
        </div>
      </section>
    </BeeYieldPageShell>
  );
};

export default CropsWePollinate;

