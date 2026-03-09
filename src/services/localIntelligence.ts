/**
 * Local Intelligence — Minimal fallback when cloud AI is unreachable
 */
export const localIntelligence = {
    async chat(message: string): Promise<string> {
        return `I'm currently unable to reach the BeeYield AI cloud service. Please check your internet connection and try again.\n\nIn the meantime, here's a quick tip: Regular hive inspections every 7-10 days during the active season are crucial for detecting issues early.\n\nYour question was: "${message}"`;
    }
};
