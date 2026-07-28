import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchBeeSpecies from "./tools/search-bee-species";
import searchBeeDiseases from "./tools/search-bee-diseases";
import searchFloragePlants from "./tools/search-florage-plants";
import searchKnowledgeFacts from "./tools/search-knowledge-facts";
import pollinationStockingDensity from "./tools/pollination-stocking-density";
import harvestEstimate from "./tools/harvest-estimate";
import hiveActivityForecast from "./tools/hive-activity-forecast";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "beeyield-mcp",
  title: "BeeYield Apiary Tools",
  version: "0.1.0",
  instructions:
    "BeeYield tools for AI assistants: search bee species, diseases, florage plants, " +
    "and the knowledge base; compute recommended pollination stocking density (PSI) and " +
    "quick honey harvest estimates. All data is read-only and covers Kenyan/EA apiaries.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    searchBeeSpecies,
    searchBeeDiseases,
    searchFloragePlants,
    searchKnowledgeFacts,
    pollinationStockingDensity,
    harvestEstimate,
    hiveActivityForecast,
  ],
});
