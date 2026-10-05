import { generateClientAutonomousBeeAnalysis } from "@/lib/beegpt-stream";
import { getCebaTelemetryContext } from "@/lib/ceba-intelligence";

export const localIntelligence = {
  async chat(message: string): Promise<string> {
    try {
      const ctx = await getCebaTelemetryContext();
      return generateClientAutonomousBeeAnalysis(message, undefined, ctx);
    } catch {
      try {
        return generateClientAutonomousBeeAnalysis(message);
      } catch {
        return `### 🐝 Ceba AI Offline Intelligence\n\nRegular hive inspections every 7–10 days during the active season are vital for detecting queen status, swarming signs, and brood viability.\n\nYour query was: "${message}"`;
      }
    }
  },
};
