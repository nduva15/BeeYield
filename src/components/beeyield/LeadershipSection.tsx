import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TIMOTHY_PHOTO from "@/assets/timothy-nduva.png";

/**
 * "Our Leadership" — co-founder cards with press contacts.
 * Moved from the Media page to Our Story.
 */

const Linkedin = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);

const LEADERS = [
  {
    name: "Timothy Nduva",
    role: "CEO & Co-Founder",
    department: "Executive & Directorate",
    description: "Pioneering the intersection of traditional apiculture and IoT precision. Directs ecosystem strategy, sensor telemetry, and Kibwezi field operations.",
    image: TIMOTHY_PHOTO,
    linkedin: "https://linkedin.com/in/timothynduva",
    email: "timothy@beeyield.com",
    tags: ["Vision Lead", "Architecture Head", "Global Strategy", "Field Beekeeper"],
  },
  {
    name: "Carole Nduva",
    role: "Co-Founder & Chief Operating Officer (COO)",
    department: "Operations & Partnerships",
    description: "Oversees operational logistics, commercial grower relationships, community expansion, and international honey export channels.",
    image: undefined as string | undefined,
    linkedin: "https://linkedin.com/company/beeyield",
    email: "carole@beeyield.com",
    tags: ["Ops Scalability", "Partner Systems", "Logistics Core", "Smallholder Network"],
  },
  {
    name: "Agatha Nduva",
    role: "Co-Founder & Chief Technology Officer (CTO)",
    department: "Engineering & IT Systems",
    description: "Architects distributed telemetry infrastructure, real-time hive sensor networks, and tamper-proof honey traceability ledgers.",
    image: undefined as string | undefined,
    linkedin: "https://linkedin.com/company/beeyield",
    email: "agatha@beeyield.com",
    tags: ["System Integrity", "Data Security", "Protocol Lead", "Telemetry Architecture"],
  },
];

export const LeadershipSection: React.FC = () => (
  <section id="our-leadership" className="py-24 bg-card/40 border-t border-border/40 relative">
    <div className="container mx-auto px-4 max-w-7xl">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Badge className="bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-300 font-bold px-4 py-1.5 text-xs rounded-full uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 mr-1.5 inline text-amber-600" />
          Press &amp; Media Contacts
        </Badge>
        <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight mt-4">
          Our Leadership
        </h2>
        <p className="mt-3 text-base text-muted-foreground leading-relaxed">
          Connect with BeeYield's co-founders for executive interviews, agricultural telemetry insights, and apiculture innovation briefings.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
        {LEADERS.map((member) => (
          <div
            key={member.name}
            className="group flex flex-col h-full bg-card rounded-[2.5rem] border border-border/80 hover:border-amber-500/40 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
          >
            {/* Media / Portrait View */}
            <div className="relative aspect-[4/5] m-3.5 rounded-[2rem] overflow-hidden bg-muted/60 shadow-inner">
              {member.image ? (
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-beeyield-green">
                  <span className="text-6xl font-black text-white">
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
              )}
              {/* Subtle Gradient Scrim at Bottom of Photo */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

              {/* Top Corner Pill Badges */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                <Badge className="bg-background/90 text-foreground backdrop-blur-md border border-border/40 font-bold text-[10px] tracking-wider px-3 py-1 rounded-full shadow-sm">
                  {member.department}
                </Badge>
                <span className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center shadow-sm opacity-90 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </span>
              </div>

              {/* Bottom Micro-Badge on Image */}
              <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between text-white text-[11px] font-medium pointer-events-none">
                <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white/95 font-semibold text-[10px] flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active Co-Founder
                </span>
                <span className="text-[10px] font-bold text-white/90 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full">
                  Kibwezi, Kenya
                </span>
              </div>
            </div>

            {/* Content Details Section Below Portrait */}
            <div className="p-6 pt-3 flex flex-col flex-1 justify-between">
              <div>
                <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-1.5">
                  {member.role}
                </p>

                <h3 className="text-2xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors flex items-center justify-between">
                  <span>{member.name}</span>
                  <ArrowRight className="w-4 h-4 text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h3>

                <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {member.description}
                </p>

                {/* Key Focus Tags */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {member.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-[10px] font-semibold py-0.5 px-2.5 rounded-lg bg-muted text-muted-foreground border-none"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action Bar */}
              <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
                <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-xs font-bold text-foreground hover:text-primary gap-1">
                  <Link to="/team">
                    <span>Meet Full Team</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>

                <div className="flex items-center gap-2">
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name} LinkedIn`}
                    className="w-8 h-8 rounded-full bg-muted hover:bg-[#0077B5] hover:text-white text-muted-foreground flex items-center justify-center transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a
                    href={`mailto:${member.email}`}
                    aria-label={`Email ${member.name}`}
                    className="w-8 h-8 rounded-full bg-muted hover:bg-foreground hover:text-background text-muted-foreground flex items-center justify-center transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default LeadershipSection;
