import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, Cpu, Sprout, ArrowRight, Check,
  Globe, Flower2, Wheat, MapPin, Mail,
  Sparkles, Camera, CheckCircle2, Layers
} from "lucide-react";
import { Link } from "react-router-dom";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { dashboardPollinationCropDetails } from "@/data/beePollinationData";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";

const CropsWePollinate = () => {
  const [highlightFilter, setHighlightFilter] = useState<"all" | "mangoes" | "citrus" | "hardware">("all");
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
          <div className="max-w-4xl mx-auto text-center mb-10">
            <Badge className="bg-[#1B9157]/15 text-[#1B9157] border-[#1B9157]/30 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-4">
              <Camera className="w-3.5 h-3.5 mr-1.5 inline" />
              Kenya Pollination & Mango Bloom Season • Field Operation
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-neutral-900 tracking-tight">
              BeeYield and Apisense at Work: <br />
              <span className="text-[#1B9157]">Mangoes, Oranges & Citrus</span> Orchard
            </h2>
            <p className="mt-4 text-neutral-600 text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
              It is currently peak <strong>Pollination and Mango Bloom Season in Kenya</strong>! BeeYield and Apisense are deployed in the field across Makueni County. Our colonies are actively working the dense <strong>flowering mango panicles</strong> and <strong>developing citrus orange groves</strong>, with real-time <strong>Apisense™ in-hive telemetry</strong> monitoring acoustic vitality, brood temperature, and foraging velocity under ancient Baobabs.
            </p>
          </div>

          {/* Interactive Category Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {[
              { id: "all", label: "All Field Photos (9)" },
              { id: "mangoes", label: "🥭 Mangoes (3)" },
              { id: "citrus", label: "🍊 Oranges & Citrus (3)" },
              { id: "hardware", label: "📡 Field Telemetry (3)" },
            ].map((tab) => (
              <Button
                key={tab.id}
                size="sm"
                variant={highlightFilter === tab.id ? "default" : "outline"}
                className={`rounded-full px-4 font-bold transition-all ${
                  highlightFilter === tab.id
                    ? "bg-[#1B9157] text-white hover:bg-[#157746] shadow-sm"
                    : "border-neutral-200 hover:bg-neutral-100 text-neutral-700"
                }`}
                onClick={() => setHighlightFilter(tab.id as any)}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* 9-Photo Showcase Grid with Dynamic Filtering */}
          {(() => {
            const fieldHighlights = [
              {
                id: "mango-bloom",
                category: "mangoes",
                title: "Dense Mango Flower Panicles",
                description: "Peak anthesis in Kenya's mango season. Thousands of delicate florets require high-density bee visits to secure fertilization and eliminate early fruit drop.",
                image: "/images/pollination/mango-panicles-close-bloom.png",
                badge: "🥭 Mangoes • Bloom Season",
                badgeColor: "bg-amber-600/90 text-white",
                metric: "90% Pollination Dependency",
                metricColor: "text-[#1B9157]",
              },
              {
                id: "mango-pink",
                category: "mangoes",
                title: "Pink Panicle Canopy Bloom",
                description: "Flowering mango panicles exhibiting vibrant pink hues across the upper canopy. Strategic hive placement ensures forager bees access both outer branches and interior tree crowns.",
                image: "/images/pollination/mango-orchard-pink-panicles.png",
                badge: "🥭 Mangoes • Canopy Burst",
                badgeColor: "bg-rose-600/90 text-white",
                metric: "Export Grade Volume Target",
                metricColor: "text-rose-700",
              },
              {
                id: "mango-blossom",
                category: "mangoes",
                title: "Synchronized Bloom Canopy",
                description: "Vibrant flowering canopy in the dryland orchard. Mobile BeeYield colonies positioned to ensure top branches receive complete pollination pressure.",
                image: "/images/pollination/mango-tree-full-blossom.png",
                badge: "🥭 Full Mango Bloom",
                badgeColor: "bg-lime-700/90 text-white",
                metric: "100% Upper Branch Receptivity",
                metricColor: "text-lime-700",
              },
              {
                id: "citrus-heavy",
                category: "citrus",
                title: "Citrus Tree in Heavy Fruiting",
                description: "Orange branches loaded with dense clusters of plump, developing citrus fruits following successful pollination. Multiple bee visits ensure uniform roundness and maximum fruit retention.",
                image: "/images/pollination/orange-tree-heavy-fruiting.jpg",
                badge: "🍊 Citrus • Heavy Fruiting",
                badgeColor: "bg-orange-600/90 text-white",
                metric: "90%+ First-Grade Market Packout",
                metricColor: "text-orange-600",
              },
              {
                id: "citrus-fruits",
                category: "citrus",
                title: "Citrus Fruit Setting & Development",
                description: "Orange trees loaded with young spherical fruits and late blossoms. Bee pollination directly boosts fruit circumference, juice volume, and sugar Brix levels.",
                image: "/images/pollination/orange-tree-citrus-fruits.jpg",
                badge: "🍊 Oranges • Fruit Setting",
                badgeColor: "bg-amber-600/90 text-white",
                metric: "Higher Juice Content & Brix",
                metricColor: "text-amber-700",
              },
              {
                id: "citrus-intercrop",
                category: "citrus",
                title: "Intercropped Agroforestry Rows",
                description: "Synergistic pollination: bees forage across complementary floral nectar and pollen curves of mangoes and citrus, maintaining peak hive vigor throughout the season.",
                image: "/images/pollination/citrus-mango-intercrop.jpg",
                badge: "🌳 Intercrop Synergy • Oranges & Mangoes",
                badgeColor: "bg-teal-700/90 text-white",
                metric: "Multi-Crop Revenue Boost",
                metricColor: "text-teal-700",
              },
              {
                id: "apisense-probe",
                category: "hardware",
                title: "Apisense™ In-Hive Telemetry",
                description: "Apisense sensor probe mounted inside the brood comb with live honeybees actively working. Tracks acoustics, brood temperature, and queen vigor in real time.",
                image: "/images/pollination/apisense-internal-sensor-probe.png",
                badge: "🐝 BeeYield & Apisense at Work",
                badgeColor: "bg-yellow-600/90 text-white",
                metric: "Real-Time Colony Health Telemetry",
                metricColor: "text-yellow-700",
              },
              {
                id: "beeyield-gateway",
                category: "hardware",
                title: "Autonomous Solar Field Gateway",
                description: "Solar-powered wireless hub mounted on the hive stand in the orchard. Streams in-hive Apisense telemetry directly to the BeeYield analytics dashboard.",
                image: "/images/pollination/beeyield-apisense-gateway-field.png",
                badge: "📡 BeeYield Field Gateway",
                badgeColor: "bg-blue-600/90 text-white",
                metric: "24/7 Field Telemetry Stream",
                metricColor: "text-blue-600",
              },
              {
                id: "farm-panorama",
                category: "hardware",
                title: "Dual-Crop Dryland Orchard Panorama",
                description: "Comprehensive field perspective of the Makueni orchard showing structured orange tree rows in the foreground and tall, blossoming mango trees in the midground against native Baobab trees.",
                image: "/images/pollination/mango-orange-farm-wide.jpg",
                badge: "🌳 Baobab Agroforestry Zone",
                badgeColor: "bg-emerald-700/90 text-white",
                metric: "Semi-Arid Habitat Synergy",
                metricColor: "text-emerald-700",
              },
            ];

            const filtered = highlightFilter === "all" 
              ? fieldHighlights 
              : fieldHighlights.filter(h => h.category === highlightFilter);

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
                {filtered.map((item) => (
                  <div
                    key={item.id}
                    className="group rounded-3xl overflow-hidden bg-card border border-border/70 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className={`${item.badgeColor} border-none text-xs font-bold shadow-md`}>
                          {item.badge}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="text-lg font-bold text-neutral-900">{item.title}</h3>
                        <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                      <div className={`flex items-center gap-2 pt-2 border-t border-border/40 text-xs font-semibold ${item.metricColor}`}>
                        <CheckCircle2 className="w-4 h-4 shrink-0" /> {item.metric}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
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
            {pollinationCrops.map((crop, index) => {
              const isSpotlightCrop = ["Mangoes", "Oranges", "Citrus"].includes(crop.cropName);
              const targetHash = crop.cropName === "Mangoes" ? "mangoes" : crop.cropName === "Oranges" ? "oranges" : crop.cropName === "Citrus" ? "citrus" : "latest-pollination";

              return (
                <Card key={index} className="overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all group bg-[#FFF9F0] flex flex-col justify-between">
                  <div className="relative h-64 overflow-hidden">
                    <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-1.5">
                      <Badge className="bg-[#1B9157] text-white backdrop-blur-md border-none px-3 py-1 font-black">
                        {crop.beeDependence}
                      </Badge>
                      {isSpotlightCrop && (
                        <Badge className="bg-amber-500/95 text-white backdrop-blur-md border-none px-2.5 py-0.5 text-[10px] font-bold shadow">
                          ⭐ Authentic Dispatch
                        </Badge>
                      )}
                    </div>
                    <img
                      src={crop.image}
                      alt={crop.cropName}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A2612]/90 via-[#0A2612]/25 to-transparent" />
                    <div className="absolute bottom-5 left-5 right-5 space-y-1">
                      <h3 className="text-[2.2rem] font-black text-white leading-none tracking-tighter drop-shadow-md">{crop.cropName}</h3>
                      <p className="text-xs text-white/80 line-clamp-1">{crop.beeyieldAdvantage}</p>
                    </div>
                  </div>

                  {/* Micro Plantation Gallery for Spotlight Crops */}
                  {crop.galleryImages && crop.galleryImages.length > 0 && (
                    <div className="p-4 bg-amber-50/70 border-t border-amber-100/80">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-neutral-800 flex items-center gap-1">
                          <Camera className="w-3 h-3 text-[#1B9157]" /> Plantation Photos
                        </span>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-full">
                          {crop.galleryImages.length} Field Photos
                        </span>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {crop.galleryImages.map((img, imgIdx) => (
                          <Link
                            key={imgIdx}
                            to={`/media#${targetHash}`}
                            className="relative w-16 h-12 rounded-lg overflow-hidden border border-neutral-300 flex-shrink-0 group/mini hover:scale-105 transition-transform shadow-xs"
                          >
                            <img src={img} alt={`${crop.cropName} photo ${imgIdx + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/15 group-hover/mini:bg-transparent transition-colors" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-4 border-t border-border/40 flex items-center justify-between bg-card/50">
                    <span className="text-xs font-semibold text-neutral-600">
                      {crop.optimalHivesPerAcre}
                    </span>
                    <Link
                      to={`/media#${targetHash}`}
                      className="inline-flex items-center gap-1.5 text-[#1B9157] hover:text-[#157746] text-xs font-black transition-colors"
                    >
                      View Media Case Study <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </Card>
              );
            })}
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

