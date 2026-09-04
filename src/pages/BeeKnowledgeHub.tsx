import LovableBeeYieldAI from "@/components/beeyield/lovable_ai/LovableIndex";
import { Helmet } from "react-helmet";

export default function BeeKnowledgeHub() {
  return (
    <>
      <Helmet>
        <title>BeeKnowledge Hub | BeeYield AI & Apiculture Intelligence</title>
        <meta
          name="description"
          content="Explore the global BeeKnowledge Hub with 3.2M+ apiculture datasets, bee species identification, pollination calculators, disease management, and AI assistance."
        />
      </Helmet>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <LovableBeeYieldAI />
      </div>
    </>
  );
}
