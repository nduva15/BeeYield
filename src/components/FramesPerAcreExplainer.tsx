import { Hexagon, Layers, Sprout, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Frames per Acre — a short, plain-language explainer shown before the
 * technical Hives-per-Acre deep dive on the pollination pages.
 */

type Variant = "in_hive" | "in_land";

interface Props {
  variant?: Variant;
}

const STEPS = [
  {
    icon: Hexagon,
    bg: "bg-yellow-100",
    color: "text-yellow-600",
    title: "A frame is one sheet of comb",
    body: "Each hive box holds frames. The more frames covered in bees, the stronger the colony.",
  },
  {
    icon: Layers,
    bg: "bg-green-100",
    color: "text-[#1B9157]",
    title: "Strong hives send out more foragers",
    body: "A weak hive keeps most bees inside to stay warm. A strong hive has plenty of bees free to visit flowers.",
  },
  {
    icon: Sprout,
    bg: "bg-blue-100",
    color: "text-blue-600",
    title: "So we count frames, not boxes",
    body: "Two farms can have the same number of hives but very different numbers of bees. Frames per acre shows the real number.",
  },
];

export const FramesPerAcreExplainer = ({ variant = "in_hive" }: Props) => (
  <section id="frames-per-acre" className="py-24 bg-muted/30">
    <div className="container mx-auto px-4 max-w-6xl">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">Frames per Acre</Badge>
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Why we count frames, not hives</h2>
        <p className="text-muted-foreground">
          {variant === "in_hive"
            ? "Our sensors check how strong each hive is, so you only pay for bees that can actually do the work."
            : "Our field sensors show how many bees reach your crop, and frames per acre tells us how many hives you need."}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {STEPS.map((s) => (
          <Card key={s.title} className="border-none shadow-lg hover:shadow-xl transition-all h-full">
            <CardContent className="p-6">
              <div className={`${s.bg} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <s.icon className={`h-6 w-6 ${s.color}`} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">{s.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{s.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 grid md:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-2xl border border-border">
          <p className="text-sm text-muted-foreground mb-1">Usual rental</p>
          <p className="text-lg font-bold text-foreground">2 hives per acre, strength unknown</p>
        </div>
        <div className="bg-secondary/30 p-6 rounded-2xl border border-secondary">
          <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-primary" /> BeeYield
          </p>
          <p className="text-lg font-bold text-foreground">A set number of checked frames per acre</p>
        </div>
      </div>
    </div>
  </section>
);

export default FramesPerAcreExplainer;
