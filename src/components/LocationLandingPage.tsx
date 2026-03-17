import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    MapPin, Phone, MessageSquare, CheckCircle2,
    TrendingUp, Droplets, Target, ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

interface LocationProps {
    cityName: string;
    regionName: string;
    description: string;
    crops: string[];
    stats: { label: string; value: string }[];
    address: string;
    heroImage: string;
}

const LocationLandingPage: React.FC<LocationProps> = ({
    cityName,
    regionName,
    description,
    crops,
    stats,
    address,
    heroImage
}) => {
    const faqs = [
        {
            q: `What pollination services do you offer in ${cityName}?`,
            a: `We provide managed honeybee pollination for ${crops.join(', ')} and more. Our hives are equipped with IoT sensors to monitor activity and ensure maximum flower coverage in the ${regionName} area.`
        },
        {
            q: `How do I book BeeYield services in ${cityName}?`,
            a: `You can request a consultation via our website or visit our regional office at ${address}. We recommend booking at least 4 weeks before target bloom cycles.`
        }
    ];

    return (
        <div className="min-h-screen bg-background text-neutral-900">
            {/* SEO Structured Data for AEO / FAQ */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    "mainEntity": faqs.map(faq => ({
                        "@type": "Question",
                        "name": faq.q,
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": faq.a
                        }
                    }))
                })
            }} />
            {/* Hero Section */}
            <section className="relative h-[70vh] flex items-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src={heroImage}
                        alt={`Agriculture in ${cityName}`}
                        className="w-full h-full object-cover brightness-50"
                    />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl text-white space-y-6">
                        <Badge className="bg-amber-500 text-white border-none px-4 py-1.5 text-sm font-bold">
                            📍 Official BeeYield Partner: {cityName}
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight">
                            Precision <span className="text-amber-500">Pollination</span> <br />
                            Services in {cityName}
                        </h1>
                        <p className="text-xl text-neutral-200 font-medium max-w-xl">
                            {description}
                        </p>
                        <div className="flex gap-4 pt-4">
                            <Link to="/pollination-request">
                                <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black font-black h-14 px-8 rounded-xl shadow-xl">
                                    Request Pollination
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link to="/contact">
                                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 font-bold h-14 px-8 rounded-xl">
                                    Contact HQ
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Stats */}
            <section className="py-12 bg-muted/30 border-b border-border">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, i) => (
                            <div key={i} className="text-center md:text-left space-y-1">
                                <p className="text-3xl font-black text-amber-600">{stat.value}</p>
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                            </div>
                        ))}
                        <div className="text-center md:text-left space-y-1">
                            <p className="text-3xl font-black text-green-700">24/7</p>
                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">IoT Support</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why This Location */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h2 className="text-4xl font-black tracking-tight">Trust BeeYield in <span className="text-amber-600">{regionName}</span></h2>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    We've been part of the {cityName} agricultural community for years.
                                    Our mission is to help farmers in {regionName} improve crop yields
                                    with practical hive management and field data.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {[
                                    "Managed hive deployments for regional crops",
                                    "Real-time colony health monitoring",
                                    "Expert agronomists on-call for field visits",
                                    "Pollination coverage across your field"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                                        <span className="font-bold text-neutral-800">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Card className="bg-amber-50 border-none rounded-3xl p-4 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center">
                                    <TrendingUp className="text-white h-6 w-6" />
                                </div>
                                <p className="font-black text-amber-900">Yield <br /> Boost</p>
                            </Card>
                            <Card className="bg-green-50 border-none rounded-3xl p-4 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center">
                                    <Droplets className="text-white h-6 w-6" />
                                </div>
                                <p className="font-black text-green-900">Resource <br /> Efficiency</p>
                            </Card>
                            <Card className="bg-neutral-900 border-none rounded-3xl p-4 col-span-2 text-white flex items-center gap-6">
                                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                                    <Target className="text-amber-500 h-8 w-8" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black">98%</p>
                                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Colony Success Rate</p>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Local Presence Block */}
            <section className="py-24 bg-neutral-900 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-amber-500/10 blur-[120px] -mr-32" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row gap-12 items-center justify-between">
                        <div className="space-y-6">
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight">Visit Our {cityName} <br /> Headquarters</h2>
                            <div className="space-y-4 font-medium">
                                <div className="flex items-start gap-4 text-neutral-300">
                                    <MapPin className="h-6 w-6 text-amber-500 shrink-0 mt-1" />
                                    <span>{address}</span>
                                </div>
                                <div className="flex items-center gap-4 text-neutral-300">
                                    <Phone className="h-6 w-6 text-amber-500 shrink-0" />
                                    <span>+254 (0) 700 000 000</span>
                                </div>
                                <div className="flex items-center gap-4 text-neutral-300">
                                    <MessageSquare className="h-6 w-6 text-amber-500 shrink-0" />
                                    <span>{cityName.toLowerCase()}@beeyield.com</span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 text-neutral-900 space-y-6">
                            <h3 className="text-2xl font-black tracking-tight">Service Availability</h3>
                            <div className="space-y-4">
                                {crops.map((crop, i) => (
                                    <div key={i} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                                        <span className="font-bold text-neutral-600">{crop} Pollination</span>
                                        <Badge className="bg-green-100 text-green-700 border-none font-bold">Active</Badge>
                                    </div>
                                ))}
                            </div>
                            <Link to="/pollination-request" className="block">
                                <Button className="w-full bg-neutral-900 hover:bg-black text-white font-black h-12 rounded-xl uppercase tracking-widest">
                                    Book Consult
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
            {/* FAQ Section for AEO */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-3xl font-black mb-12 text-center uppercase tracking-tighter">Frequently Asked Questions in {cityName}</h2>
                    <div className="space-y-6">
                        {faqs.map((faq, i) => (
                            <div key={i} className="border-b border-neutral-200 pb-6">
                                <h3 className="text-xl font-bold mb-3">{faq.q}</h3>
                                <p className="text-muted-foreground">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LocationLandingPage;
