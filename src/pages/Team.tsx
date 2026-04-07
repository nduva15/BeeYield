import { useState } from "react";
import {
  Activity,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Cpu,
  Globe,
  Mail,
  Phone,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BeeYieldPageShell } from "@/components/beeyield/BeeYieldUI";
import { useToast } from "@/hooks/use-toast";
import { submitContactForm } from "@/services/contactService";

import BEEYIELD_LOGO from "@/assets/beeyield-logo.png";
import TIMOTHY_PHOTO from "@/assets/timothy-nduva.png";

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

type PortraitStyle = "photo" | "logo";

interface TeamMember {
  name: string;
  role: string;
  department: string;
  description: string;
  image: string;
  portraitStyle: PortraitStyle;
  linkedin: string;
  email: string;
  achievements: string[];
}

const founders: TeamMember[] = [
  {
    name: "Timothy Nduva",
    role: "CEO & Founder",
    department: "Directorate",
    description:
      "Timothy founded BeeYield at the family farm in Kibwezi during the 2020 pandemic. He leads the team building practical tools for beekeepers and a clear traceability record for every harvest.",
    image: TIMOTHY_PHOTO,
    portraitStyle: "photo",
    linkedin: "https://linkedin.com/in/timothynduva",
    email: "info@beeyield.com",
    achievements: [
      "HoneyChain architecture",
      "Field-led product direction",
      "Traceability leadership",
    ],
  },
  {
    name: "Carole Nduva",
    role: "Technical Director",
    department: "Operations",
    description:
      "Carole leads operational planning across hive deployments, partner coordination, and the day-to-day systems that keep BeeYield practical for working apiaries.",
    image: BEEYIELD_LOGO,
    portraitStyle: "logo",
    linkedin: "#",
    email: "info@beeyield.com",
    achievements: [
      "Operational scale-up",
      "Partner delivery workflows",
      "Field logistics planning",
    ],
  },
  {
    name: "Agatha Nduva",
    role: "Technical Director",
    department: "Engineering",
    description:
      "Agatha leads engineering work for data collection, reporting, and product reliability so beekeepers can trust every signal and every record.",
    image: BEEYIELD_LOGO,
    portraitStyle: "logo",
    linkedin: "#",
    email: "info@beeyield.com",
    achievements: [
      "Product engineering",
      "Data reliability",
      "Security and privacy",
    ],
  },
];

const specialists: TeamMember[] = [
  {
    name: "Rose Ndinda",
    role: "VP Technology",
    department: "Engineering",
    description:
      "Rose focuses on resilient web and mobile experiences, making BeeYield's telemetry, dashboards, and decision tools easier to use in the field.",
    image: BEEYIELD_LOGO,
    portraitStyle: "logo",
    linkedin: "#",
    email: "info@beeyield.com",
    achievements: [
      "Dashboard systems",
      "Mobile experience",
      "UI delivery standards",
    ],
  },
  {
    name: "Nicholas Nduva",
    role: "Board Member",
    department: "Governance",
    description:
      "Nicholas provides governance oversight, helping BeeYield grow with sound decision-making, compliance discipline, and long-term stewardship.",
    image: BEEYIELD_LOGO,
    portraitStyle: "logo",
    linkedin: "#",
    email: "info@beeyield.com",
    achievements: [
      "Governance oversight",
      "Sustainability roadmap",
      "Legal and board support",
    ],
  },
];

const teamValues = [
  {
    title: "Field-first product thinking",
    description:
      "We build for real apiaries, not presentation decks. Every workflow has to make life easier for the beekeeper in the field.",
    icon: <Users className="h-8 w-8 text-primary" />,
  },
  {
    title: "Reliable data",
    description:
      "Our team focuses on trustworthy telemetry, clear reporting, and records that support decisions from hive to harvest.",
    icon: <Cpu className="h-8 w-8 text-primary" />,
  },
  {
    title: "Healthy hives",
    description:
      "The work behind BeeYield is organized around practical monitoring, early response, and better outcomes for bee colonies.",
    icon: <Activity className="h-8 w-8 text-primary" />,
  },
  {
    title: "Transparent stewardship",
    description:
      "We care about traceability, operational discipline, and long-term environmental responsibility as part of the product.",
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
  },
];

const mediaStandards = [
  "Approved photography is used where available.",
  "AI-generated portraits have been replaced with BeeYield-branded logo media.",
  "Team visuals now follow the same warm palette and clean tone as the disease page.",
];

const teamStats = [
  { label: "Leadership roles", value: "5" },
  { label: "Core focus areas", value: "4" },
  { label: "Operating base", value: "Kibwezi" },
];

function MemberPortrait({
  member,
  large = false,
}: {
  member: TeamMember;
  large?: boolean;
}) {
  if (member.portraitStyle === "photo") {
    return (
      <img
        src={member.image}
        alt={member.name}
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#164a33] via-[#1b9157] to-[#f4d03f]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.28),transparent_42%)]" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/20 to-transparent" />
      <div className="absolute left-6 top-6 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/90 backdrop-blur">
        BeeYield
      </div>
      <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/15 bg-black/15 px-4 py-3 text-white backdrop-blur-sm">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/70">
          Branded team media
        </p>
        <p className="mt-1 text-sm font-semibold">{member.name}</p>
      </div>
      <div className="relative flex flex-col items-center gap-4 text-center">
        <div className="rounded-[2rem] border border-white/20 bg-white/12 p-5 shadow-2xl backdrop-blur-md">
          <img
            src={BEEYIELD_LOGO}
            alt="BeeYield logo"
            className={large ? "h-28 w-28 object-contain" : "h-20 w-20 object-contain"}
          />
        </div>
        <div className="px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/80">
            Approved brand placeholder
          </p>
        </div>
      </div>
    </div>
  );
}

function MemberCard({
  member,
  onSelect,
}: {
  member: TeamMember;
  onSelect: (member: TeamMember) => void;
}) {
  return (
    <Card className="group overflow-hidden border-none bg-muted/40 shadow-lg transition-shadow hover:shadow-xl">
      <button
        type="button"
        onClick={() => onSelect(member)}
        className="block w-full text-left"
      >
        <div className="relative aspect-[4/5] overflow-hidden">
          <MemberPortrait member={member} />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent p-6 text-white">
            <Badge className="mb-3 bg-white/12 text-white hover:bg-white/12">
              {member.department}
            </Badge>
            <h3 className="mb-1 text-2xl font-bold tracking-tight text-white">
              {member.name}
            </h3>
            <p className="text-sm text-white/85">{member.role}</p>
          </div>
        </div>
        <CardContent className="space-y-4 p-6">
          <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">
            {member.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {member.achievements.slice(0, 2).map((item) => (
              <span
                key={item}
                className="rounded-full bg-background px-3 py-1 text-xs font-medium text-foreground shadow-sm"
              >
                {item}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            View profile <ArrowRight className="h-4 w-4" />
          </div>
        </CardContent>
      </button>
    </Card>
  );
}

const Team = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "+254",
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const nameParts = formData.name.trim().split(/\s+/);
      const first_name = nameParts[0] || "";
      const last_name =
        nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Unknown";

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
        message: formData.message,
      });

      toast({
        title: "Message sent",
        description:
          response?.message ||
          "We've received your inquiry and will get back to you soon.",
      });

      setFormData({
        name: "",
        email: "",
        phone: "+254",
        message: "",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Submission failed",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <BeeYieldPageShell className="min-h-screen bg-background p-0 text-foreground">
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-background to-background py-24 lg:py-32">
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-6 bg-primary text-primary-foreground hover:bg-primary/90">
              Meet the BeeYield Team
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              The people building <span className="text-primary">healthy hives</span>, clearer records, and practical tools for beekeepers
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-xl leading-relaxed text-muted-foreground">
              Our team combines field experience, operations, engineering, and governance to keep BeeYield useful from hive monitoring to harvest traceability.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="gap-2"
                onClick={() =>
                  document
                    .getElementById("team-members")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Meet the team <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() =>
                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Contact us
              </Button>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary/5 to-transparent" />
      </section>

      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="order-2 overflow-hidden rounded-2xl shadow-2xl lg:order-1">
              <div className="grid gap-px bg-border md:grid-cols-3">
                {teamStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-background px-6 py-8 text-center"
                  >
                    <p className="text-3xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
              <div className="relative min-h-[280px] bg-gradient-to-br from-[#164a33] via-[#1b9157] to-[#f4d03f] p-10 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_36%)]" />
                <div className="relative flex h-full flex-col justify-between gap-10">
                  <div className="flex items-center justify-between gap-6">
                    <img
                      src={BEEYIELD_LOGO}
                      alt="BeeYield logo"
                      className="h-16 w-16 object-contain"
                    />
                    <Badge className="bg-white/15 text-white hover:bg-white/15">
                      Kibwezi, Kenya
                    </Badge>
                  </div>
                  <div>
                    <h2 className="mb-4 text-3xl font-bold text-white">
                      A family-led team with a practical operating model
                    </h2>
                    <p className="max-w-xl text-white/90">
                      BeeYield started on a family farm and still runs with the same focus: build tools that are clear, dependable, and useful in daily apiary work.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="mb-6 text-3xl font-bold">
                A team page that now matches the BeeYield product story
              </h2>
              <p className="mb-6 text-lg text-muted-foreground">
                We simplified the tone, softened the layout, and aligned the page with the same warm palette and readable structure used on the disease page.
              </p>
              <p className="text-lg text-muted-foreground">
                For team media, BeeYield-branded logo portraits are now used wherever AI-generated profile photos appeared. Timothy keeps his approved photograph, while Carole, Agatha, Rose, and Nicholas now use consistent branded media.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold">How the team works</h2>
            <p className="text-muted-foreground">
              The same priorities behind our disease monitoring work guide the people behind BeeYield.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {teamValues.map((value) => (
              <Card
                key={value.title}
                className="border-none bg-muted/40 shadow-lg transition-shadow hover:shadow-xl"
              >
                <CardContent className="p-6 text-center">
                  <div className="mb-4 inline-flex items-center justify-center rounded-full bg-background p-3 shadow-sm">
                    {value.icon}
                  </div>
                  <h3 className="mb-3 text-xl font-semibold">{value.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="team-members" className="bg-primary py-24 text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-6 text-3xl font-bold">Leadership and specialist team</h2>
            <p className="text-lg opacity-90">
              BeeYield brings together leadership across operations, engineering, governance, and field delivery.
            </p>
          </div>

          <div className="mb-12">
            <h3 className="mb-6 text-center text-2xl font-bold">Directorate</h3>
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {founders.map((member) => (
                <MemberCard
                  key={member.name}
                  member={member}
                  onSelect={setSelectedMember}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-6 text-center text-2xl font-bold">Specialists and governance</h3>
            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
              {specialists.map((member) => (
                <MemberCard
                  key={member.name}
                  member={member}
                  onSelect={setSelectedMember}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold">Team media</h2>
              <p className="mb-8 text-lg text-muted-foreground">
                Portraits should feel consistent with the BeeYield brand. Where approved photography is not available, we now use a branded BeeYield logo treatment instead of generic AI portrait imagery.
              </p>
              <div className="space-y-4">
                {mediaStandards.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-4 rounded-2xl bg-muted/40 p-4"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                    <p className="text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <Card className="overflow-hidden border-none bg-muted/40 shadow-lg">
              <div className="grid gap-px bg-border md:grid-cols-2">
                <div className="bg-background p-6">
                  <p className="mb-3 text-sm font-medium text-muted-foreground">
                    Approved photo
                  </p>
                  <div className="overflow-hidden rounded-2xl">
                    <img
                      src={TIMOTHY_PHOTO}
                      alt="Timothy Nduva"
                      className="aspect-[4/5] w-full object-cover"
                    />
                  </div>
                </div>
                <div className="bg-background p-6">
                  <p className="mb-3 text-sm font-medium text-muted-foreground">
                    Branded placeholder
                  </p>
                  <div className="overflow-hidden rounded-2xl">
                    <div className="aspect-[4/5]">
                      <MemberPortrait member={founders[1]} />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-muted/20 py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-16 lg:grid-cols-2">
            <div className="rounded-2xl bg-background p-8 shadow-xl">
              <h2 className="mb-6 text-3xl font-bold">Contact the team</h2>
              <p className="mb-8 text-muted-foreground">
                Reach out for partnerships, technology questions, or team inquiries.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 rounded-xl bg-muted/40 p-4">
                  <Mail className="h-5 w-5 text-primary" />
                  <span>info@beeyield.com</span>
                </div>
                <div className="flex items-center gap-4 rounded-xl bg-muted/40 p-4">
                  <Phone className="h-5 w-5 text-primary" />
                  <span>+254 team support</span>
                </div>
                <div className="flex items-center gap-4 rounded-xl bg-muted/40 p-4">
                  <Globe className="h-5 w-5 text-primary" />
                  <span>Based in Kenya, serving beekeepers globally</span>
                </div>
                <div className="flex items-center gap-4 rounded-xl bg-muted/40 p-4">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <span>Operations, engineering, and governance in one team</span>
                </div>
              </div>
            </div>

            <div id="contact">
              <div className="rounded-2xl border border-border bg-background p-8">
                <h3 className="mb-6 text-2xl font-bold">Send a message</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your name"
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
                      placeholder="you@example.com"
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
                    {loading ? "Sending..." : "Send message"}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-4xl overflow-hidden border-none bg-transparent p-0 shadow-none">
          {selectedMember && (
            <div className="overflow-hidden rounded-[2rem] bg-background shadow-2xl">
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div className="flex items-center gap-3">
                  <img
                    src={BEEYIELD_LOGO}
                    alt="BeeYield logo"
                    className="h-10 w-10 object-contain"
                  />
                  <div>
                    <p className="text-sm font-semibold">BeeYield Team</p>
                    <p className="text-xs text-muted-foreground">
                      Leadership profile
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMember(null)}
                  className="rounded-xl bg-muted p-2 text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
                  aria-label="Close member details"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid md:grid-cols-[minmax(0,360px)_1fr]">
                <div className="min-h-[360px] bg-muted">
                  <MemberPortrait member={selectedMember} large />
                </div>
                <div className="p-8">
                  <Badge className="mb-4 bg-primary text-primary-foreground hover:bg-primary/90">
                    {selectedMember.department}
                  </Badge>
                  <h2 className="mb-2 text-3xl font-bold">
                    {selectedMember.name}
                  </h2>
                  <p className="mb-6 text-lg text-primary">
                    {selectedMember.role}
                  </p>
                  <p className="mb-8 leading-relaxed text-muted-foreground">
                    {selectedMember.description}
                  </p>

                  <div className="mb-8 grid gap-3">
                    {selectedMember.achievements.map((item) => (
                      <div key={item} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <a
                      href={selectedMember.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 rounded-xl bg-muted px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/80"
                    >
                      <LinkedinIcon className="h-5 w-5" />
                      LinkedIn
                    </a>
                    <a
                      href={`mailto:${selectedMember.email}`}
                      className="flex items-center justify-center gap-3 rounded-xl bg-muted px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/80"
                    >
                      <Mail className="h-5 w-5" />
                      Email office
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </BeeYieldPageShell>
  );
};

export default Team;
