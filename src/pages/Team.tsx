import { useState } from "react";
import { 
  Globe, 
  Award, 
  Users, 
  Code, 
  Briefcase, 
  Mail, 
  ExternalLink, 
  Cpu, 
  Droplet, 
  ShieldCheck, 
  Terminal,
  Layers,
  Sparkles,
  X,
  Target,
  ArrowRight,
  Shield,
  Zap,
  BookOpen,
  Hexagon,
  Heart,
  CheckCircle2,
  Activity,
  Star,
  Trophy,
  Leaf,
  LayoutDashboard,
  HelpCircle,
  Lock as LockIcon,
  Phone
} from "lucide-react";

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { submitContactForm } from "@/services/contactService";
import { useToast } from "@/hooks/use-toast";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";

import IMPACT_BEEKEEPING from "@/assets/impact-beekeeping.jpg";
import TIMOTHY_PHOTO from "@/assets/timothy-nduva.png";
import LOGO from "@/assets/Logo.png";
import STORY_HERO from "@/assets/story-hero-honey.png";

interface TeamMember {
  name: string;
  role: string;
  description: string;
  image: string;
  linkedin: string;
  email: string;
  achievements: string[];
  department: string;
}

const Team = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
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
            const nameParts = formData.name.trim().split(/\s+/);
            const first_name = nameParts[0] || "";
            const last_name = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Unknown";

            const response = await submitContactForm({
                first_name,
                last_name,
                email: formData.email,
                phone: formData.phone,
                city: "Nairobi",
                state: "Nairobi",
                country: "Kenya",
                inquiry_type: "general",
                topic: "Team Inquiry",
                message: formData.message
            });

            toast({
                title: "✅ Message Sent!",
                description: response?.message || "We've received your inquiry and will be in touch with the Directorate soon.",
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

    const founders: TeamMember[] = [
        {
            name: "Timothy Nduva",
            role: "Founder & CEO",
            department: "Leadership",
            description: "Timothy founded BeeYield at the family farm in Kibwezi during the 2020 season. He leads the company around practical beekeeping systems, precision pollination, and traceable harvest records.",
            image: TIMOTHY_PHOTO,
            linkedin: "https://linkedin.com/in/timothynduva",
            email: "info@beeyield.com",
            achievements: ["Architect of HoneyChain™", "Strategic Vision Lead", "Family Mission Founder"]
        },
        {
            name: "Carole Nduva",
            role: "Director, Operations & Growth",
            department: "Operations",
            description: "Carole helps translate BeeYield's family story into dependable partner operations, delivery coordination, and growth systems that support field work.",
            image: LOGO,
            linkedin: "",
            email: "info@beeyield.com",
            achievements: ["Partner coordination", "Operations systems", "Growth execution"]
        },
        {
            name: "Agatha Nduva",
            role: "Director, Product & Engineering",
            department: "Engineering",
            description: "Agatha leads our engineering work—building reliable systems for data collection, reporting, and traceability.",
            image: LOGO,
            linkedin: "",
            email: "info@beeyield.com",
            achievements: ["Product systems", "Data reliability", "Trust-focused engineering"]
        },
    ];

    const specialists: TeamMember[] = [
        {
            name: "Rose Ndinda",
            role: "VP Technology",
            department: "Technology",
            description: "Rose supports the technical systems that turn hive data into useful dashboards, monitoring workflows, and more practical decision-making for teams in the field.",
            image: LOGO,
            linkedin: "",
            email: "info@beeyield.com",
            achievements: ["Technical systems", "Dashboard experience", "Platform resilience"]
        },
        {
            name: "Nicholas Nduva",
            role: "Board & Governance Advisor",
            department: "Governance",
            description: "Nicholas provides governance support around compliance, stewardship, and the accountability needed to keep BeeYield's commitments measurable.",
            image: LOGO,
            linkedin: "",
            email: "info@beeyield.com",
            achievements: ["Governance support", "Long-term stewardship", "Accountability"]
        },
    ];

    const teamValues = [
        {
            title: "Family Integrity",
            description: "Our team story begins with Timothy, Carole, and Agatha building BeeYield together in Kibwezi and carrying that trust into every decision.",
            icon: <Users className="h-8 w-8 text-beeyield-green" />
        },
        {
            title: "Verifiable Impact",
            description: "Our 50/50 Harvest Promise and reforestation projects are not just goals—they are hard-coded into our DNA.",
            icon: <Activity className="h-8 w-8 text-beeyield-green" />
        },
        {
            title: "Precision Pollination",
            description: "We build practical technology that helps monitor hive health, support field operations, and improve pollination outcomes.",
            icon: <Cpu className="h-8 w-8 text-beeyield-green" />
        },
        {
            title: "ESG Accountability",
            description: "Our team page now reflects the same stewardship language used across BeeYield's ESG and commitment pages.",
            icon: <ShieldCheck className="h-8 w-8 text-beeyield-green" />
        }
    ];

    return (
        <BeeYieldPageShell className="bg-background text-foreground">
            {/* Hero Section */}
            <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 bg-gradient-to-br from-[#fffdf8] via-[#f7f2e7] to-[#fffdf8] overflow-hidden border-b border-neutral-100">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
                        <motion.img 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            src={LOGO} 
                            alt="BeeYield Logo" 
                            className="h-28 md:h-36 w-auto mb-10 drop-shadow-2xl" 
                        />
                        <Badge className="mb-6 bg-beeyield-green/10 text-beeyield-green border-none px-4 py-1.5 font-black text-[10px]">
                            Family-led since 2020
                        </Badge>
                        <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tighter leading-[0.9] text-neutral-900">
                            Meet the team shaping BeeYield's <span className="text-beeyield-green">story, standards, and impact</span>
                        </h1>
                        <p className="text-xl text-neutral-500 leading-relaxed mb-12 max-w-2xl mx-auto font-medium">
                            This page now follows the same story told across About Us, Our Story, ESG, and Commitment: a Kibwezi family mission focused on healthier hives, better pollination, and more trustworthy harvest records.
                        </p>
                        <div className="grid gap-4 md:grid-cols-3 w-full max-w-3xl mb-10">
                            {[
                                { value: "184", label: "monitored hives" },
                                { value: "25+", label: "acres pollinated" },
                                { value: "2,500+", label: "trees planted" }
                            ].map((stat) => (
                                <div key={stat.label} className="rounded-[1.75rem] border border-[#1B9157]/10 bg-white/80 px-5 py-6 shadow-[0_18px_45px_rgba(18,53,36,0.06)] backdrop-blur">
                                    <p className="text-3xl font-black text-neutral-900">{stat.value}</p>
                                    <p className="mt-2 text-sm font-medium text-neutral-500">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button 
                                size="lg" 
                                className="h-14 px-10 bg-neutral-900 text-white font-black text-xs rounded-2xl hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-900/20"
                                onClick={() => document.getElementById('narrative')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Read Our Team Story
                            </Button>
                            <Button 
                                size="lg" 
                                variant="outline" 
                                className="h-14 px-10 border-neutral-200 text-neutral-900 font-black text-xs rounded-2xl hover:bg-neutral-50 transition-all"
                                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Contact The Team
                            </Button>
                        </div>
                    </div>
                </div>
                {/* Subtle decorative elements */}
                <div className="absolute top-0 right-0 w-1/4 h-full bg-beeyield-green/[0.02] -skew-x-12 translate-x-20 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-1/4 h-full bg-beeyield-gold/[0.02] skew-x-12 -translate-x-20 pointer-events-none" />
            </section>

            {/* Narrative Section */}
            <section id="narrative" className="py-32 lg:py-48 relative overflow-hidden bg-white">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neutral-100 to-transparent" />
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-24 items-center">
                        <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="relative rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] aspect-square bg-neutral-900 group">
                                <img 
                                    src={STORY_HERO}
                                    alt="BeeYield story rooted in Kibwezi" 
                                    className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform"
                                    style={{ transitionDuration: '2000ms' }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/20 to-transparent" />
                                <div className="absolute bottom-12 left-12 right-12 p-10 bg-white/5 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-2xl">
                                   <div className="flex items-center gap-4 mb-6">
                                      <div className="h-0.5 w-12 bg-beeyield-green" />
                                      <span className="text-[10px] font-black text-beeyield-green">Est. 2020</span>
                                   </div>
                                   <p className="text-white text-xl md:text-2xl font-black italic leading-tight tracking-tighter">
                                     "One family story now drives our leadership, ESG language, and field commitments."
                                   </p>
                                </div>
                            </div>
                            {/* Industrial decorative border */}
                            <div className="absolute -top-6 -left-6 w-32 h-32 border-t-2 border-l-2 border-beeyield-green/20 rounded-tl-[3rem] -z-10" />
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 border-b-2 border-r-2 border-beeyield-gold/20 rounded-br-[3rem] -z-10" />
                        </motion.div>

                        <div className="space-y-12">
                            <div>
                                <Badge className="bg-beeyield-green/10 text-beeyield-green border-none mb-8 px-4 py-1.5 font-black text-[10px]">
                                    Re-edited Team Story
                                </Badge>
                                <h2 className="text-5xl lg:text-7xl font-black text-neutral-900 tracking-tighter leading-none mb-8">
                                    From <br />
                                    <span className="text-beeyield-green">Kibwezi To Commitment</span>
                                </h2>
                                <p className="text-xl text-neutral-500 leading-relaxed font-medium">
                                    BeeYield was born from a sibling commitment to stewardship. This section now blends the family origin from About Us and Our Story with the accountability language from ESG and Commitment, so the team page feels connected to the rest of the company story.
                                </p>
                            </div>

                            <div className="grid gap-10 pt-6">
                                <div className="flex items-start gap-6 group">
                                   <div className="h-14 w-14 shrink-0 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center group-hover:bg-beeyield-green group-hover:border-beeyield-green transition-all shadow-sm">
                                      <Leaf className="w-6 h-6 text-beeyield-green group-hover:text-white transition-colors" />
                                   </div>
                                   <div>
                                      <h4 className="text-xl font-black text-neutral-900 tracking-tight mb-2">50/50 Harvest Promise</h4>
                                      <p className="text-neutral-400 font-medium leading-relaxed">The team story now clearly reflects BeeYield's colony-first harvest promise and stewardship responsibility.</p>
                                   </div>
                                </div>
                                <div className="flex items-start gap-6 group">
                                   <div className="h-14 w-14 shrink-0 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center group-hover:bg-beeyield-gold group-hover:border-beeyield-gold transition-all shadow-sm">
                                      <ShieldCheck className="w-6 h-6 text-beeyield-gold group-hover:text-white transition-colors" />
                                   </div>
                                   <div>
                                      <h4 className="text-xl font-black text-neutral-900 tracking-tight mb-2">Traceability And Pollination Impact</h4>
                                      <p className="text-neutral-400 font-medium leading-relaxed">The team leads around clear records, precision pollination support, and measurable proof points like acreage served and trees planted.</p>
                                   </div>
                                </div>
                                <div className="flex items-start gap-6 group">
                                   <div className="h-14 w-14 shrink-0 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center group-hover:bg-beeyield-green group-hover:border-beeyield-green transition-all shadow-sm">
                                      <Users className="w-6 h-6 text-beeyield-green group-hover:text-white transition-colors" />
                                   </div>
                                   <div>
                                      <h4 className="text-xl font-black text-neutral-900 tracking-tight mb-2">Family-Led Leadership</h4>
                                      <p className="text-neutral-400 font-medium leading-relaxed">The page centers the people behind BeeYield instead of stock placeholders, using the BeeYield logo wherever a portrait is not yet available.</p>
                                   </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-32 bg-neutral-50/50 border-y border-neutral-100 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(27,145,87,0.06),_transparent_42%)] pointer-events-none" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl lg:text-5xl font-black text-neutral-900 tracking-tighter mb-4 italic">What Our Team Stands For</h2>
                        <div className="h-1 w-20 bg-beeyield-green mx-auto mb-6 rounded-full" />
                        <p className="text-neutral-400 font-medium text-xs">A modern version of the BeeYield story, rewritten around leadership, ESG, and commitment.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
                        {teamValues.map((value, index) => (
                            <motion.div 
                                key={index} 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white p-12 rounded-[2.5rem] border border-neutral-100 shadow-soft hover:shadow-glow hover:border-beeyield-green/20 transition-all duration-500 group"
                            >
                                <div className="mb-10 inline-flex items-center justify-center p-6 bg-neutral-50 rounded-3xl group-hover:bg-beeyield-green/10 transition-colors">
                                    {value.icon}
                                </div>
                                <h3 className="text-2xl font-black text-neutral-900 mb-6 italic tracking-tight leading-none">{value.title}</h3>
                                <p className="text-neutral-400 leading-relaxed font-medium">
                                    {value.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Grid Section */}
            <section id="team-members" className="py-32 lg:py-48 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-32 max-w-3xl mx-auto">
                        <Badge className="bg-neutral-100 text-neutral-400 border-none mb-8 px-5 py-2 font-black text-[10px] rounded-full">
                            Meet The People
                        </Badge>
                        <h2 className="text-5xl lg:text-7xl font-black text-neutral-900 tracking-tighter mb-8 italic leading-none">The BeeYield Team</h2>
                        <p className="text-xl text-neutral-500 font-medium leading-relaxed">
                            Leadership, operations, technology, and governance now sit inside one clearer company story.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-16 max-w-7xl mx-auto mb-32">
                        {founders.map((member, index) => (
                            <motion.div 
                                key={index} 
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => setSelectedMember(member)}
                                className="group cursor-pointer flex flex-col items-center"
                            >
                                <div className="w-full aspect-[4/5] rounded-[2rem] overflow-hidden bg-neutral-100 relative mb-10 border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.15)] transition-all duration-700">
                                    <img 
                                        src={member.image} 
                                        alt={member.name} 
                                        className={member.image === LOGO
                                            ? "w-full h-full object-contain p-10 bg-[#fff9f0] transition-all duration-700 group-hover:scale-105"
                                            : "w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"}
                                    />
                                    <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-t from-neutral-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute top-8 right-8 flex flex-col items-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity font-mono text-[10px] text-beeyield-green font-semibold">
                                       <span>ID: {member.name.substring(0,3).toUpperCase()}00{index}</span>
                                       <span className="flex items-center gap-1"><div className="w-1 h-1 bg-beeyield-green rounded-full animate-pulse" />Online</span>
                                    </div>
                                    <div className="absolute bottom-10 left-8 right-8 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                       <Button className="w-full bg-beeyield-green text-black font-semibold h-12 rounded-xl border border-beeyield-green shadow-[0_0_30px_rgba(45,168,79,0.2)]">View profile</Button>
                                    </div>
                                </div>
                                <div className="text-center space-y-3">
                                    <span className="text-[9px] font-black text-neutral-300">BeeYield Leadership</span>
                                    <h4 className="text-4xl font-black text-neutral-900 italic tracking-tight leading-none">{member.name}</h4>
                                    <div className="flex items-center justify-center gap-2">
                                       <div className="h-1 w-1 bg-beeyield-green rounded-full animate-pulse" />
                                       <p className="text-[10px] font-black text-beeyield-green">{member.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="flex items-center gap-12 mb-24 max-w-6xl mx-auto">
                        <div className="h-px w-full bg-gradient-to-r from-transparent to-neutral-200" />
                        <span className="text-[10px] whitespace-nowrap font-black text-neutral-300">Support, Technology & Governance</span>
                        <div className="h-px w-full bg-gradient-to-l from-transparent to-neutral-200" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-16 max-w-5xl mx-auto items-stretch">
                        {specialists.map((member, index) => (
                           <motion.div 
                                 key={index} 
                                 initial={{ opacity: 0, y: 30 }}
                                 whileInView={{ opacity: 1, y: 0 }}
                                 viewport={{ once: true }}
                                 onClick={() => setSelectedMember(member)}
                                 className="group cursor-pointer flex flex-col items-center"
                             >
                                 <div className="w-full aspect-[4/5] rounded-[2rem] overflow-hidden bg-neutral-100 relative mb-10 border border-neutral-100 shadow-soft group-hover:shadow-2xl transition-all duration-700">
                                     <img 
                                         src={member.image} 
                                         alt={member.name} 
                                         className={member.image === LOGO
                                            ? "w-full h-full object-contain p-10 bg-[#fff9f0] transition-all duration-700 group-hover:scale-105"
                                            : "w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"}
                                     />
                                     <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-t from-neutral-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                     <div className="absolute top-8 right-8 flex flex-col items-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity font-mono text-[8px] text-beeyield-green font-black">
                                        <span>ID_SEC: {member.name.substring(0,3).toUpperCase()}99{index}</span>
                                        <span className="flex items-center gap-1"><div className="w-1 h-1 bg-beeyield-gold rounded-full animate-pulse" />Operational</span>
                                     </div>
                                 </div>
                                 <div className="text-center space-y-3">
                                      <span className="text-[9px] font-black text-neutral-300">BeeYield Support Team</span>
                                     <h4 className="text-4xl font-black text-neutral-900 italic tracking-tight leading-none">{member.name}</h4>
                                     <div className="flex items-center justify-center gap-2">
                                        <div className="h-1 w-1 bg-beeyield-green rounded-full animate-pulse" />
                                        <p className="text-[10px] font-black text-beeyield-green">{member.role}</p>
                                     </div>
                                 </div>
                             </motion.div>
                         ))}
                    </div>
                </div>
            </section>

            {/* Story, ESG and Commitment */}
            <section className="py-24 bg-neutral-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(45,168,79,0.18),_transparent_34%)] opacity-80 pointer-events-none" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-20 p-12 bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10">
                            <div className="space-y-6 max-w-xl">
                                <div className="flex items-center gap-3">
                                   <div className="h-2 w-2 bg-beeyield-green rounded-full animate-pulse" />
                                   <span className="text-[10px] font-black text-beeyield-green">Story, ESG and commitment aligned</span>
                                </div>
                                <h2 className="text-4xl lg:text-5xl font-black italic tracking-tighter leading-none">The <span className="text-beeyield-green">proof points</span> behind the team</h2>
                                <p className="text-neutral-400 font-medium leading-relaxed">
                                    This section now ties the team page to BeeYield's wider promises: traceability, pollination support, stewardship, and measurable ecosystem restoration.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-6 w-full md:w-auto">
                                {[
                                    { label: "Harvest", val: "50/50", icon: Leaf },
                                    { label: "Records", val: "Traceable", icon: ShieldCheck },
                                    { label: "Pollination", val: "25+ acres", icon: Globe },
                                    { label: "Restoration", val: "2,500+ trees", icon: LockIcon }
                                ].map((stat, i) => (
                                    <div key={i} className="p-6 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center text-center">
                                       <stat.icon className="w-5 h-5 text-beeyield-green mb-3 opacity-50" />
                                       <span className="text-2xl font-black mb-1">{stat.val}</span>
                                       <span className="text-[9px] font-black text-neutral-500">{stat.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            <Link to="/about" className="rounded-[2rem] border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all">
                                <p className="text-sm font-black text-beeyield-green mb-3">About Us</p>
                                <p className="text-white text-lg font-bold mb-2">Origin in Kibwezi</p>
                                <p className="text-neutral-400 text-sm">The company overview and growth story now reinforce the leadership narrative.</p>
                            </Link>
                            <Link to="/ourstory" className="rounded-[2rem] border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all">
                                <p className="text-sm font-black text-beeyield-green mb-3">Our Story</p>
                                <p className="text-white text-lg font-bold mb-2">Sibling-led mission</p>
                                <p className="text-neutral-400 text-sm">The fuller family story now connects directly to how the team page is written.</p>
                            </Link>
                            <Link to="/esg" className="rounded-[2rem] border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all">
                                <p className="text-sm font-black text-beeyield-green mb-3">ESG & Commitment</p>
                                <p className="text-white text-lg font-bold mb-2">Visible accountability</p>
                                <p className="text-neutral-400 text-sm">Leadership language now reflects BeeYield's environmental and operational commitments.</p>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-32 lg:py-48 bg-neutral-50 border-t border-neutral-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-beeyield-green/[0.01] -skew-x-12 translate-x-32 pointer-events-none" />
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-32 items-center">
                        <div>
                            <Badge className="bg-beeyield-green/10 text-beeyield-green border-none mb-8 px-5 py-2 font-black text-[10px] rounded-full">
                                Keep Reading
                            </Badge>
                            <h2 className="text-5xl lg:text-7xl font-black text-neutral-900 tracking-tighter mb-10 italic leading-none">Continue The <span className="text-beeyield-green">BeeYield Story</span></h2>
                            <p className="text-xl text-neutral-400 font-medium mb-16 leading-relaxed">
                                Use these links to move from the team page into the pages that shaped this rewrite: About Us, Our Story, ESG, and Commitment.
                            </p>
                            
                            <div className="grid grid-cols-2 gap-8">
                                {[
                                    { label: "About Us", href: "/about", icon: Users },
                                    { label: "Our Story", href: "/ourstory", icon: Leaf },
                                    { label: "ESG", href: "/esg", icon: ShieldCheck },
                                    { label: "Commitment", href: "/commitment", icon: Cpu }
                                ].map((p, i) => (
                                    <Link key={i} to={p.href} className="flex items-center gap-6 p-8 bg-white rounded-[2rem] border border-neutral-100 shadow-soft group hover:border-beeyield-green/30 transition-all">
                                        <div className="h-14 w-14 shrink-0 flex items-center justify-center bg-neutral-50 rounded-2xl text-beeyield-green group-hover:bg-beeyield-green group-hover:text-white transition-all">
                                            <p.icon className="h-7 w-7" />
                                        </div>
                                        <span className="font-black text-xs text-neutral-900">{p.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div id="contact">
                            <div className="bg-white p-12 lg:p-16 rounded-[3.5rem] border border-neutral-100 shadow-soft relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-48 h-48 bg-beeyield-green/[0.02] rounded-full -translate-x-20 -translate-y-20 border border-beeyield-green/5" />
                                <h3 className="text-4xl font-black text-neutral-900 italic tracking-tight mb-10 leading-none">Contact The Team</h3>
                                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <Label htmlFor="name" className="text-[10px] font-black text-neutral-400 ml-1">Full Name</Label>
                                            <Input id="name" name="name" placeholder="Your name" value={formData.name} onChange={handleInputChange} required className="h-16 rounded-2xl border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-beeyield-green/20 focus:border-beeyield-green transition-all" />
                                        </div>
                                        <div className="space-y-3">
                                            <Label htmlFor="email" className="text-[10px] font-black text-neutral-400 ml-1">Email</Label>
                                            <Input id="email" name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleInputChange} required className="h-16 rounded-2xl border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-beeyield-green/20 focus:border-beeyield-green transition-all" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="phone" className="text-[10px] font-black text-neutral-400 ml-1">Phone (optional)</Label>
                                        <Input id="phone" name="phone" type="tel" placeholder="+254" value={formData.phone} onChange={handleInputChange} className="h-16 rounded-2xl border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-beeyield-green/20 focus:border-beeyield-green transition-all" />
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="message" className="text-[10px] font-black text-neutral-400 ml-1">Message</Label>
                                        <Textarea id="message" name="message" placeholder="Tell us what you would like to discuss." className="min-h-[160px] rounded-2xl border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-beeyield-green/20 focus:border-beeyield-green transition-all p-6" value={formData.message} onChange={handleInputChange} required />
                                    </div>
                                    <Button type="submit" className="w-full h-20 rounded-3xl bg-neutral-900 text-beeyield-green font-black text-xs shadow-2xl shadow-neutral-900/30 hover:scale-[1.02] active:scale-95 transition-all" disabled={loading}>
                                        {loading ? "Sending..." : "Send Message"}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Member Modal */}
            <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
                <DialogContent className="max-w-[900px] bg-transparent border-none p-0 shadow-none overflow-visible">
                    <AnimatePresence>
                        {selectedMember && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                                className="bg-white rounded-[3.5rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.3)] relative border border-neutral-100 flex flex-col"
                            >
                                {/* Header with Logo */}
                                <div className="p-10 border-b border-neutral-100 flex items-center justify-between bg-white relative z-10 shrink-0">
                                    <img src={LOGO} alt="BeeYield Logo" className="h-12 w-auto" />
                                    <button 
                                        onClick={() => setSelectedMember(null)}
                                        className="w-12 h-12 bg-neutral-50 hover:bg-neutral-900 hover:text-white rounded-2xl flex items-center justify-center transition-all active:scale-95"
                                        aria-label="Close member details"
                                        title="Close"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="flex flex-col md:flex-row flex-1">
                                   <div className="md:w-[45%] relative bg-neutral-900 aspect-square md:aspect-auto">
                                      <img 
                                        src={selectedMember.image} 
                                        alt={selectedMember.name} 
                                        className="w-full h-full object-cover grayscale"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/20 to-transparent" />
                                      <div className="absolute bottom-10 left-10">
                                         <Badge className="bg-beeyield-green text-black border-none mb-4 px-4 py-2 font-black text-[10px] rounded-lg">
                                            {selectedMember.department}
                                         </Badge>
                                         <h3 className="text-white text-4xl font-black italic tracking-tighter leading-tight">{selectedMember.name}</h3>
                                      </div>
                                   </div>

                                   <div className="md:w-[55%] p-16 flex flex-col justify-center bg-white relative">
                                      <div className="absolute top-0 right-0 w-32 h-32 bg-beeyield-green/[0.02] rounded-full translate-x-12 -translate-y-12 border border-beeyield-green/10" />
                                      <div className="mb-10">
                                         <span className="text-[12px] font-semibold text-beeyield-green block mb-4">Team member</span>
                                         <h2 className="text-4xl font-black text-neutral-900 italic leading-[0.9] tracking-tighter">{selectedMember.role}</h2>
                                      </div>
                                      <p className="text-neutral-500 text-xl leading-relaxed font-medium mb-10">
                                         {selectedMember.description}
                                      </p>
                                      
                                      <div className="space-y-4 pt-6 border-t border-neutral-100">
                                         <span className="text-[12px] font-semibold text-neutral-400 block mb-2">Highlights</span>
                                         {selectedMember.achievements.map((ach, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                               <CheckCircle2 className="w-5 h-5 text-beeyield-green" />
                                               <span className="text-sm font-bold text-neutral-700 uppercase">{ach}</span>
                                            </div>
                                         ))}
                                      </div>
                                   </div>
                                </div>

                                <div className="grid grid-cols-2 divide-x divide-neutral-100 border-t border-neutral-100 h-28 shrink-0 bg-neutral-50/50">
                                   <a 
                                     href={selectedMember.linkedin} 
                                     target="_blank" 
                                     rel="noopener noreferrer"
                                     className="flex items-center justify-center gap-4 hover:bg-white transition-all group"
                                   >
                                      <LinkedinIcon className="w-6 h-6 text-neutral-300 group-hover:text-beeyield-green transition-colors" />
                                      <span className="text-xs font-black text-neutral-400 group-hover:text-neutral-900 transition-colors">LinkedIn Profile</span>
                                   </a>
                                   <a 
                                     href={`mailto:${selectedMember.email}`} 
                                     className="flex items-center justify-center gap-4 hover:bg-white transition-all group"
                                   >
                                      <Mail className="w-6 h-6 text-neutral-300 group-hover:text-beeyield-green transition-colors" />
                                      <span className="text-xs font-black text-neutral-400 group-hover:text-neutral-900 transition-colors">Contact Office</span>
                                   </a>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </DialogContent>
            </Dialog>
        </BeeYieldPageShell>
    );
};

export default Team;
