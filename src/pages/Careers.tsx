import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Cpu,
  Sprout,
  Users,
  Send,
  Building,
  Heart,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import beeyieldLogo from "@/assets/beeyield-logo.png";
import { PandaMitiSmallContainer } from "@/components/PandaMitiSection";

interface JobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  salaryRange: string;
  description: string;
  requirements: string[];
}

const JOB_OPENINGS: JobOpening[] = [
  {
    id: "job_agronomist",
    title: "Senior Precision Agronomist",
    department: "Field Operations & Pollination",
    location: "Kibwezi / Makueni, Kenya",
    type: "Full-time",
    salaryRange: "KES 150,000 – 200,000 / mo",
    description:
      "Lead orchard pollination planning across avocado, mango, sisal, and macadamia client farmlands. Work directly with smart hives and grower agronomists to maximize fruit set and quality.",
    requirements: [
      "BSc/MSc in Agronomy, Crop Science, Horticulture, or related field",
      "3+ years experience with tree crops or commercial pollination",
      "Strong field diagnostic skills and comfort with IoT data dashboards",
    ],
  },
  {
    id: "job_software_engineer",
    title: "Full-Stack Software Engineer (IoT & AI)",
    department: "Technology",
    location: "Nairobi / Remote",
    type: "Full-time",
    salaryRange: "KES 120,000 – 180,000 / mo",
    description:
      "Build high-throughput telemetry pipelines connecting Apisense in-hive acoustic sensors, LoRa gateways, and the BeeGPT retrieval-augmented intelligence layer.",
    requirements: [
      "Proficiency with TypeScript, React, TailwindCSS, and Node/Bun",
      "Experience with Supabase/PostgreSQL, WebSockets, or IoT time-series telemetry",
      "Passionate about ecological tech and sustainable agriculture",
    ],
  },
  {
    id: "job_field_technician",
    title: "IoT Hardware & Hive Technician",
    department: "Hardware Operations",
    location: "Kibwezi Basin, Makueni County",
    type: "Full-time",
    salaryRange: "KES 80,000 – 110,000 / mo",
    description:
      "Deploy, calibrate, and service solar-powered BeeHUB Sense nodes, precision scales, and LoRaWAN gateways across 184+ active hives and reforestation zones.",
    requirements: [
      "Diploma or Degree in Electrical/Electronics, Mechatronics, or Telecommunications",
      "Hands-on experience with soldering, microcontrollers (ESP32/STM32), and solar setups",
      "Comfort working outdoors around active honeybee apiaries (bee suit provided)",
    ],
  },
  {
    id: "job_apiary_lead",
    title: "Apiary Operations & Honey Quality Lead",
    department: "Production & Animal Welfare",
    location: "Kibwezi Farm, Kenya",
    type: "Full-time",
    salaryRange: "KES 100,000 – 140,000 / mo",
    description:
      "Manage hive health, queen breeding, colony inspections, and our strict 50/50 ethical harvest protocol. Oversee honey extraction and batch traceability.",
    requirements: [
      "5+ years hands-on commercial beekeeping experience in East Africa",
      "Deep understanding of Apis mellifera scutellata behavior, Varroa, and bee diseases",
      "Rigorous commitment to clean, non-adulterated honey processing and traceability",
    ],
  },
];

export default function CareersPage() {
  const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null);
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [coverNote, setCoverNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim() || !applicantEmail.trim() || !selectedJob) {
      toast.error("Please fill in your name, email, and select a position.");
      return;
    }
    setSubmitted(true);
    toast.success(`Application for ${selectedJob.title} received! We will be in touch shortly.`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/90 backdrop-blur-md">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <img src={beeyieldLogo} alt="BeeYield" className="h-8 w-auto transition-transform group-hover:scale-105" />
              <span className="font-display font-bold text-base sm:text-lg text-foreground tracking-tight">
                BeeYield
              </span>
            </Link>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-xs font-semibold text-muted-foreground">Careers</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/about"
              className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Our Story
            </Link>
            <Link
              to="/blogs"
              className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Field Blogs
            </Link>
            <Link
              to="/panda-miti"
              className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <Sprout className="w-3.5 h-3.5" />
              Panda Miti
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-background to-background pointer-events-none" />
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <Badge
            variant="outline"
            className="border-amber-500/30 bg-amber-500/10 text-amber-500 font-semibold mb-4 px-3.5 py-1 text-xs"
          >
            We're Hiring
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground mb-4">
            Join the Team Building the Future of{" "}
            <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
              Precision Beekeeping
            </span>
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-6">
            At BeeYield, we unite IoT hardware, AI intelligence, and regenerative agroforestry to protect pollinators and elevate farm yields across Africa and beyond.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="container max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* PANDA MITI INITIATIVE: Small container with buttons to the panda miti initiative page */}
        <section>
          <div className="mb-2 text-xs uppercase tracking-wider font-bold text-muted-foreground">
            Our Ecological Commitment
          </div>
          <PandaMitiSmallContainer />
        </section>

        {/* Company Values */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-card border border-border/60">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-foreground mb-1">Purpose-Led Innovation</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every sensor we mount and every line of code we write safeguards bee lives and boosts farmer livelihoods.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-card border border-border/60">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
              <Sprout className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-foreground mb-1">Rooted in Nature</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We operate in the field, among acacia canopies in Kibwezi, side by side with smallholders and colonies.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-card border border-border/60">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-foreground mb-1">Family &amp; Community First</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Co-founded by three siblings with grit and personal savings, fostering an inclusive and highly driven culture.
            </p>
          </div>
        </section>

        {/* Open Positions List */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-foreground">Open Roles</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Select a position to review requirements and apply directly.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {JOB_OPENINGS.map((job) => (
              <div
                key={job.id}
                onClick={() => {
                  setSelectedJob(job);
                  setSubmitted(false);
                }}
                className={`p-5 sm:p-6 rounded-2xl border transition-all cursor-pointer ${
                  selectedJob?.id === job.id
                    ? "border-amber-500 bg-amber-500/5 shadow-md"
                    : "border-border/70 bg-card hover:border-border hover:bg-muted/30"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-foreground">{job.title}</h3>
                    <p className="text-xs font-medium text-muted-foreground">{job.department}</p>
                  </div>
                  <Badge variant="outline" className="w-fit text-xs border-amber-500/30 text-amber-500 bg-amber-500/10">
                    {job.salaryRange}
                  </Badge>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground mb-4 leading-relaxed">
                  {job.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" /> {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-500" /> {job.type}
                  </span>
                  <span className="ml-auto font-semibold text-amber-500 flex items-center gap-1">
                    {selectedJob?.id === job.id ? "Selected" : "Click to Apply"} <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Application Form */}
        {selectedJob && (
          <section id="apply-form" className="rounded-3xl border border-amber-500/30 bg-card p-6 sm:p-10 shadow-xl">
            <div className="mb-6">
              <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs mb-2">
                Application Form
              </Badge>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                Apply for: {selectedJob.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedJob.department} • {selectedJob.location}
              </p>
            </div>

            {submitted ? (
              <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-foreground text-lg">Application Submitted!</h4>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Thank you for applying to BeeYield. Our hiring team will review your application and respond within 3 business days.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSubmitted(false)}
                  className="rounded-xl text-xs"
                >
                  Submit Another Application
                </Button>
              </div>
            ) : (
              <form onSubmit={handleApplication} className="space-y-4 max-w-xl">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Full Name *
                  </label>
                  <Input
                    placeholder="e.g. Jane Mwangi"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    required
                    className="rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      placeholder="jane@example.com"
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      placeholder="+254 7XX XXX XXX"
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    LinkedIn / Portfolio URL
                  </label>
                  <Input
                    placeholder="https://linkedin.com/in/username"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Why do you want to join BeeYield?
                  </label>
                  <Textarea
                    placeholder="Tell us about your background and what excites you about our mission..."
                    rows={4}
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    className="rounded-xl"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-bold h-12 shadow-md shadow-amber-500/20"
                >
                  <Send className="w-4 h-4 mr-2" /> Submit Application
                </Button>
              </form>
            )}
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-border/40 text-center space-y-2 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} BeeYield. Building precision apiculture from Makueni, Kenya.</p>
      </footer>
    </div>
  );
}
