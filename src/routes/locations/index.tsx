import { createFileRoute, Link } from '@tanstack/react-router';
import { locations } from '@/data/locations';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MapPin } from "lucide-react";

export const Route = createFileRoute('/locations/')({
    component: LocationsIndexPage,
    head: () => ({
        meta: [
            { title: 'Our Regions | Precision Pollination Services Across Kenya | BeeYield' },
            { name: 'description', content: 'Explore BeeYield\'s regional hubs across Kenya, including Kibwezi, Makueni, Embu, and Meru. Providing precision pollination and sustainable beekeeping solutions.' },
            { name: 'keywords', content: 'pollination services Kenya, beekeeping Makueni, agricultural services Embu, Meru avocado pollination' }
        ],
    }),
});

function LocationsIndexPage() {
    return (
        <div className="min-h-screen bg-background py-24">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mb-16 space-y-4">
                    <Badge className="bg-amber-500 text-white border-none font-bold px-4 py-1">📍 Local Presence</Badge>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter">Our <span className="text-amber-500">Service</span> Areas</h1>
                    <p className="text-xl text-muted-foreground font-medium">
                        BeeYield is expanding across Kenya's key agricultural corridors.
                        Each hub is specialized in regional crops and supported by our
                        IoT-enabled pollination network.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {locations.map((loc) => (
                        <Link key={loc.slug} to={`/locations/${loc.slug}`} className="group">
                            <Card className="h-full border-2 border-transparent hover:border-amber-500 transition-all duration-300 rounded-[2rem] overflow-hidden shadow-elegant hover:shadow-glow">
                                <div className="aspect-video relative overflow-hidden">
                                    <img
                                        src={loc.heroImage}
                                        alt={loc.cityName}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-4 left-4 text-white">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-amber-500" />
                                            <span className="font-bold uppercase tracking-widest text-xs">{loc.regionName}</span>
                                        </div>
                                    </div>
                                </div>
                                <CardContent className="p-8 space-y-4">
                                    <h2 className="text-3xl font-black tracking-tight">{loc.cityName}</h2>
                                    <p className="text-muted-foreground font-medium line-clamp-3">
                                        {loc.description}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {loc.crops.map(crop => (
                                            <Badge key={crop} variant="outline" className="border-neutral-200 text-neutral-600 font-bold">
                                                {crop}
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="pt-4 flex items-center text-amber-600 font-black uppercase tracking-widest text-sm">
                                        Explore Region
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
