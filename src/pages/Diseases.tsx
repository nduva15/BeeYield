import { useState } from "react";
import {
    Activity,
    Shield,
    Heart,
    Droplets,
    Info,
    ExternalLink,
    ArrowRight,
    CheckCircle2,
    Lock,
    Sparkles,
    Sprout,
    Leaf,
    Wind,
    Snowflake,
    Sun,
    CloudRain,
    Apple,
    Cherry,
    Carrot,
    Coffee,
    Wheat,
    Grape,
    MapPin,
    Users,
    Globe,
    Trophy,
    Award,
    Star,
    Zap,
    Clock,
    ShoppingBag,
    Smartphone,
    Wifi,
    Thermometer,
    Database,
    Cpu,
    Mic,
    Scale,
    Radio,
    CheckCircle,
    HelpCircle,
    Mail,
    Phone,
    LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import { submitContactForm } from "@/services/contactService";
import { useToast } from "@/hooks/use-toast";

const Diseases = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "+254",
        message: ""
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Split name into first/last for backend consistency
            const nameParts = formData.name.trim().split(/\s+/);
            const first_name = nameParts[0] || "";
            const last_name = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Unknown";

            await submitContactForm({
                first_name,
                last_name,
                email: formData.email,
                phone: formData.phone,
                city: "Nairobi", // Default or add field
                state: "Nairobi",
                country: "Kenya",
                inquiry_type: "diseases",
                topic: "Disease Detection Inquiry",
                message: formData.message
            });

            toast({
                title: "Inquiry Sent!",
                description: "We've received your message and will get back to you soon.",
            });

            setFormData({
                name: "",
                email: "",
                phone: "+254",
                message: ""
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Submission Failed",
                description: "There was an error sending your message. Please try again.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const benefits = [
        {
            title: "Ease of use",
            description: "BeeYield can be used in both large and small apiaries. The more hives you have, the easier it becomes to manage your apiary.",
            icon: <LayoutDashboard className="h-8 w-8 text-primary" />
        },
        {
            title: "Scalability",
            description: "With BeeYield, you can reduce the need for chemical protection and treatments.",
            icon: <Activity className="h-8 w-8 text-primary" /> /* Using Activity as placeholder for scalability/growth/health */
        },
        {
            title: "Reduced use of chemicals",
            description: "BeeYield reduces apiary management costs by minimizing hive inspections and lowering expenses for bee treatments.",
            icon: <Droplets className="h-8 w-8 text-primary" />
        },
        {
            title: "Lower costs",
            description: "Discover all the benefits of BeeYield.",
            icon: <Zap className="h-8 w-8 text-primary" />
        },
        {
            title: "Healthy bees",
            description: "With BeeYield, you will quickly notice the first signs of diseases in your apiary and take action before the problem spreads.",
            icon: <Leaf className="h-8 w-8 text-primary" />
        },
        {
            title: "Safe apiary",
            description: "BeeYield minimizes the risk of disease spreading within the apiary, helping to avoid costly treatments or the need to eliminate infected bee colonies.",
            icon: <CheckCircle className="h-8 w-8 text-primary" /> /* Shield was not imported as capitalized Shield, using CheckCircle or simply Shield if imported */
        },
        {
            title: "Knowledge and guidance",
            description: "The BeeYield app will guide you on what to do when a threat is detected. You will receive clear instructions and practical recommendations.",
            icon: <HelpCircle className="h-8 w-8 text-primary" />
        },
        {
            title: "Continuous monitoring",
            description: "BeeYield gives you constant access to up-to-date information about the condition of your apiary. Remotely monitor your hives anytime, anywhere.",
            icon: <Activity className="h-8 w-8 text-primary" />
        }
    ];

    const appFeatures = [
        {
            title: "Manage your apiary",
            description: "Add and organize apiaries and individual hives."
        },
        {
            title: "Analyze data in real time",
            description: "Track weight charts, monitor environmental conditions, and compare results across hives."
        },
        {
            title: "Detect diseases",
            description: "Receive alerts about threats along with a ready-to-follow action plan."
        },
        {
            title: "Keep notes and inspections",
            description: "Record information about each bee colony, plan your work, and access the complete history of every hive."
        }
    ];

    const hardwareFeatures = [
        {
            title: "Gas sensors",
            description: "Monitoring conditions inside the hive and enabling early disease detection.",
            icon: <Thermometer className="h-6 w-6" />
        },
        {
            title: "Microphones",
            description: "Analyzing hive sounds to assess the mood and condition of the colony.",
            icon: <Mic className="h-6 w-6" />
        },
        {
            title: "Hive scales",
            description: "Providing continuous monitoring of honey yield and tracking external hive conditions.",
            icon: <Scale className="h-6 w-6" />
        },
        {
            title: "LTE gateway with GPS module",
            description: "Enabling the transmission of data from up to 100 measuring devices to the server. With a range of 30 m, a single gateway supports the entire apiary.",
            icon: <Radio className="h-6 w-6" />
        }
    ];

    const faqs = [
        {
            question: "Is the BeeYield system resistant to harsh weather conditions?",
            answer: "When installed according to the instructions, BeeYield sensors are fully adapted to operate in harsh weather conditions – resistant to moisture, rain, snow, and extreme temperatures."
        },
        {
            question: "Can I test BeeYield before deciding on full implementation?",
            answer: "If you want to experience how BeeYield works, join our field testing program."
        },
        {
            question: "Why does the system use satellite data?",
            answer: "Satellite data enables the analysis of environmental conditions around the apiary, such as temperature, humidity, weather changes, and the availability of forage for bees. Combining this information with sensor data allows our analysis model to provide beekeepers with precise guidance on potential threats to their apiary."
        },
        {
            question: "How does BeeYield use automated analysis?",
            answer: "BeeYield uses proprietary analysis models to scan the collected data, enabling rapid detection of anomalies and prediction of disease risks."
        },
        {
            question: "What data do the in-hive sensors collect?",
            answer: "The sensors monitor gas levels such as volatile organic compounds (VOCs), carbon dioxide (CO₂), and nitrogen oxides (NOx). They also record temperature, humidity, and the sounds generated by bees. Analyzing this data makes it possible to detect health problems in bee colonies at an early stage."
        },
        {
            question: "What is BeeYield?",
            answer: "BeeYield is a technical hive monitoring system that enables early detection of bee diseases and other threats using IoT sensors, advanced analysis, and satellite data."
        }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Hero Section */}
            <section className="relative py-24 lg:py-32 bg-gradient-to-br from-amber-500/10 via-background to-background overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <Badge className="mb-6 bg-primary text-primary-foreground hover:bg-primary/90">
                            New: BeeYield Technology
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                            BeeYield Protection for Your <span className="text-primary">Beehives</span>
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
                            BeeYield helps protect beehives from diseases and environmental threats. Sensors and an app give you real-time bee health monitoring without disturbing the colony.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="gap-2" onClick={() => document.getElementById('beeyield-system')?.scrollIntoView({ behavior: 'smooth' })}>
                                Get Started <ArrowRight className="h-4 w-4" />
                            </Button>
                            <Button size="lg" variant="outline" onClick={() => document.getElementById('beeyield-system')?.scrollIntoView({ behavior: 'smooth' })}>
                                Learn More
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
            </section>

            {/* Intro Section */}
            <section className="py-20 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="order-2 lg:order-1 relative rounded-2xl overflow-hidden shadow-2xl">
                            {/* Placeholder for an image - using a colored block or generic bee image if available. 
                   Ideally, we would use a relevant image from the assets or a placeholder. */}
                            <div className="bg-primary/20 w-full h-[400px] flex items-center justify-center">
                                <Cpu className="h-24 w-24 text-primary/40" />
                            </div>
                        </div>
                        <div className="order-1 lg:order-2">
                            <h2 className="text-3xl font-bold mb-6">Hive monitoring that fits your apiary</h2>
                            <p className="text-lg text-muted-foreground mb-6">
                                BeeYield is a compact IoT device that can be easily installed inside a hive, together with an application that allows you to constantly monitor the condition of your apiary, no matter where you are.
                            </p>
                            <p className="text-lg text-muted-foreground">
                                BeeYield consists of easy-to-install and user-friendly sensors that require no complex maintenance and do not interfere with the life of the bees.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Grid */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Why Choose BeeYield?</h2>
                        <p className="text-muted-foreground">Discover all the benefits of our monitoring system</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {benefits.map((benefit, index) => (
                            <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow bg-muted/40">
                                <CardContent className="p-6 text-center">
                                    <div className="mb-4 inline-flex items-center justify-center p-3 bg-background rounded-full shadow-sm">
                                        {benefit.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {benefit.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* System Overview */}
            <section id="beeyield-system" className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-10"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold mb-6">BeeYield System</h2>
                        <p className="text-lg opacity-90 leading-relaxed">
                            BeeYield is the central hub for managing your entire apiary – it combines data from hive-installed devices, weather information, satellite data, beekeeper’s notes and inspections, and advanced analysis into one clear system.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        <div className="space-y-6">
                            {appFeatures.map((feature, index) => (
                                <div key={index} className="flex gap-4 items-start bg-primary-foreground/10 p-4 rounded-xl backdrop-blur-sm">
                                    <CheckCircle className="h-6 w-6 mt-1 flex-shrink-0 text-yellow-300" />
                                    <div>
                                        <h4 className="font-bold text-lg mb-1">{feature.title}</h4>
                                        <p className="opacity-90">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center justify-center">
                            {/* App Mockup Placeholder */}
                            <div className="relative w-64 h-[500px] border-8 border-primary-foreground/20 rounded-[3rem] bg-background shadow-2xl flex items-center justify-center overflow-hidden">
                                <div className="text-primary p-4 text-center">
                                    <Smartphone className="h-12 w-12 mx-auto mb-2 text-primary/50" />
                                    <p className="font-bold">BeeYield App Interface</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Hardware Components */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-16">What does our solution consist of?</h2>
                    <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                        <div>
                            <p className="text-lg text-muted-foreground mb-8">
                                The BeeYield solution is built on modern monitoring devices that collect data from the hive in real time, combined with satellite data and weather forecasts.
                            </p>
                            <div className="space-y-6">
                                {hardwareFeatures.map((hardware, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="bg-primary/10 p-3 rounded-lg h-fit text-primary">
                                            {hardware.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">{hardware.title}</h4>
                                            <p className="text-muted-foreground">{hardware.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-muted rounded-3xl p-8 min-h-[400px] flex items-center justify-center">
                            <div className="text-center">
                                <Cpu className="h-32 w-32 text-muted-foreground/20 mx-auto mb-4" />
                                <p className="text-muted-foreground font-medium">IoT Device Visualization</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Demo & Partners */}
            <section className="py-24 bg-muted/20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center mb-20 bg-background p-8 rounded-2xl shadow-xl">
                        <h2 className="text-3xl font-bold mb-4">Try BeeYield in your apiary</h2>
                        <p className="text-muted-foreground mb-6">
                            BeeYield is constantly evolving. We invite you to take part in the international testing of our system – together, we can advance technology that protects bees worldwide.
                        </p>
                        <Button size="lg" className="w-full sm:w-auto" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>Join the Program</Button>
                    </div>

                    <div className="text-center">
                        <h2 className="text-3xl font-bold mb-6">We are building a global network of partners</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
                            BeeYield collaborates with leading partners worldwide, joining forces with beekeeping equipment manufacturers, industry organizations, and renowned universities.
                        </p>
                        {/* Partner Logo Placeholders */}
                        <div className="flex flex-wrap justify-center gap-8 items-center opacity-70 hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-3 px-8 py-6 bg-background rounded-2xl shadow-sm border border-border">
                                <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
                                    <Globe className="h-6 w-6 text-primary" />
                                </div>
                                <span className="font-bold text-xl">Farmers</span>
                            </div>
                            <div className="flex items-center gap-3 px-8 py-6 bg-background rounded-2xl shadow-sm border border-border">
                                <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
                                    <Activity className="h-6 w-6 text-primary" />
                                </div>
                                <span className="font-bold text-xl">ApiSense</span>
                            </div>
                            <div className="flex items-center gap-3 px-8 py-6 bg-background rounded-2xl shadow-sm border border-border">
                                <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
                                    <Cpu className="h-6 w-6 text-primary" />
                                </div>
                                <span className="font-bold text-xl">Intelligent Hives</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ & Contact */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-16">

                        {/* FAQ */}
                        <div>
                            <h2 className="text-3xl font-bold mb-8">We answer your questions</h2>
                            <Accordion type="single" collapsible className="w-full">
                                {faqs.map((faq, index) => (
                                    <AccordionItem key={index} value={`item-${index}`}>
                                        <AccordionTrigger className="text-left font-medium text-lg">
                                            {faq.question}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-muted-foreground leading-relaxed">
                                            {faq.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>

                        {/* Contact Form */}
                        <div id="contact">
                            <div className="bg-muted/30 p-8 rounded-2xl border border-border">
                                <h3 className="text-2xl font-bold mb-6">Contact us</h3>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="name">Name & Surname</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="john@example.com"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="phone">Mobile</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            placeholder="+254..."
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="message">Message</Label>
                                        <Textarea
                                            id="message"
                                            name="message"
                                            placeholder="How can we help?"
                                            className="min-h-[120px]"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? "Sending..." : "Send Message"}
                                    </Button>
                                </form>

                                <div className="mt-8 pt-8 border-t border-border">
                                    <p className="text-sm text-muted-foreground text-center">
                                        <a href="/privacy" className="hover:underline">Privacy Policy</a> • <a href="/terms" className="hover:underline">Terms of Service</a>
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
};

export default Diseases;
