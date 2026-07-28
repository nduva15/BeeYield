import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Database, Globe, Shield, Microscope, Heart, Zap } from "lucide-react";

const stats = [
  { label: "Bee Species Covered", value: "20,000+", icon: "🐝" },
  { label: "Honey Varieties", value: "300+", icon: "🍯" },
  { label: "Disease Protocols", value: "50+", icon: "🦠" },
  { label: "Research Datasets", value: "750K+", icon: "🔬" },
  { label: "Managed Hives Globally", value: "91 Million", icon: "🏡" },
  { label: "Pollination Value/Year", value: "$577B", icon: "🌸" },
];

const capabilities = [
  { icon: Database, title: "Comprehensive Database", desc: "Every bee species, honey variety, disease, treatment protocol, and research finding in one system." },
  { icon: Microscope, title: "Image Identification", desc: "Upload bee photos for species identification, hive inspection analysis, and disease detection." },
  { icon: Globe, title: "Global Industry Data", desc: "Real-time statistics on honey production, colony losses, trade data, and market projections." },
  { icon: Shield, title: "Disease & Treatment", desc: "Complete protocols for Varroa, AFB, EFB, Nosema, CCD, and every known bee pathology." },
  { icon: Heart, title: "Bee Products Science", desc: "Royal jelly, propolis, bee pollen, beeswax, apitoxin — composition and medicinal applications." },
  { icon: Zap, title: "Voice & Audio Input", desc: "Ask questions by voice, attach audio recordings, or type naturally in any format." },
];

interface AboutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AboutModal({ open, onOpenChange }: AboutModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto custom-scroll">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display text-honey flex items-center gap-2">
            🐝 About Beeyield AI
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Beeyield AI is the world's most comprehensive bee knowledge system, powered by over 750,000 curated datasets 
            covering every aspect of apiculture, entomology, and pollination science. From species identification to 
            disease treatment protocols, honey composition analysis to global industry statistics.
          </p>

          {/* Stats Grid */}
          <div>
            <h3 className="font-display text-base font-bold text-foreground mb-3">Global Bee Data</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {stats.map((s) => (
                <div key={s.label} className="knowledge-card rounded-xl p-3 text-center">
                  <div className="text-xl mb-1">{s.icon}</div>
                  <div className="font-display text-lg font-bold text-honey">{s.value}</div>
                  <div className="text-[11px] text-muted-foreground leading-tight">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Capabilities */}
          <div>
            <h3 className="font-display text-base font-bold text-foreground mb-3">Capabilities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {capabilities.map((c) => (
                <div key={c.title} className="flex gap-3 p-3 rounded-xl border border-border bg-card">
                  <c.icon className="w-5 h-5 text-honey flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-foreground">{c.title}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed mt-0.5">{c.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Facts */}
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
            <h3 className="font-display text-sm font-bold text-honey mb-2">⚡ Quick Bee Facts</h3>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li>🏆 Oldest honey found: <span className="text-foreground font-medium">5,500 years old</span> in Egyptian tombs</li>
              <li>🔬 Largest bee: <span className="text-foreground font-medium">Megachile pluto</span> at 38mm wingspan</li>
              <li>⚡ Fastest bee: <span className="text-foreground font-medium">Carpenter bee</span> at ~30 mph</li>
              <li>🌍 Top producer: <span className="text-foreground font-medium">China</span> with 446,000 MT/year</li>
              <li>🧬 Genome sequenced: <span className="text-foreground font-medium">2006</span> — 236 million base pairs</li>
              <li>🌡️ Brood temperature: <span className="text-foreground font-medium">35°C</span> maintained year-round</li>
              <li>💰 Pollination value: <span className="text-foreground font-medium">$235–577 billion USD</span> globally</li>
            </ul>
          </div>

          <p className="text-[11px] text-muted-foreground text-center">
            Beeyield AI — Specialized exclusively in bees, honey, apiculture, and pollination science
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
