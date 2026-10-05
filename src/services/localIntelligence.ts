/**
 * Local Intelligence — Autonomous Ceba AI Apicultural Engine when cloud services are offline
 */
import { generateClientAutonomousBeeAnalysis } from "@/lib/beegpt-stream";

export const localIntelligence = {
  async chat(message: string): Promise<string> {
    try {
      return generateClientAutonomousBeeAnalysis(message);
    } catch {
      return `### 🐝 Ceba AI Offline Intelligence\n\nRegular hive inspections every 7–10 days during the active season are vital for detecting queen status, swarming signs, and brood viability.\n\nYour query was: "${message}"`;
    }
  },
};
