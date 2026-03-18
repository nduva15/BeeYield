/**
 * BeeYield Intelligence Service — Routes through the Knowledge Hub Edge Function (beegpt)
 * This is the AUTHORITATIVE Intelligence service that provides long-form, detailed responses.
 * It connects to the Supabase Knowledge Hub which has 750K+ curated datasets.
 */
import { apiGet } from './api';
import { localIntelligence } from './localIntelligence';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface IntelligenceResponse {
    response: string;
    sources?: Array<{ type: string; name: string }>;
    suggestions?: string[];
    confidence: number;
    language: string;
    session_id?: string;
}

export interface ChatSession {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
}

export interface ChatDBMessage {
    id: string;
    session_id: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: string | Array<{ type: string; name: string }>;
    suggestions?: string | string[];
    created_at: string;
}

const REQUIRED_REPORT_HEADINGS = [
    "## Executive Summary",
    "## Situation Assessment",
    "## Recommendations (Prioritized)",
    "## Implementation Plan",
    "## Risks & Mitigations",
    "## Metrics to Track",
    "## Sources & Assumptions",
] as const;

// Knowledge Hub Supabase URL and Key
const KNOWLEDGE_URL = import.meta.env.VITE_SUPABASE_URL_KNOWLEDGE || 'https://laeifazhrupoqrhqmyzg.supabase.co';
const KNOWLEDGE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY_KNOWLEDGE ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhZWlmYXpocnVwb3FyaHFteXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1NjAwMDUsImV4cCI6MjA4NzEzNjAwNX0.Qc6b_68QL_RzxCsBVZo49Ol4_tEZMQAEfRF-wwfii-k';

/**
 * Fetches the user's Company Brain context from the Intelligence backend.
 */
async function fetchUserContext(): Promise<string | null> {
    try {
        const res = await apiGet<{ context: string }>('/intelligence/context');
        return res.context || null;
    } catch {
        return null;
    }
}

export const intelligenceService = {
    /**
     * Send a chat message to BeeYield AI (Knowledge Hub Edge Function).
     * Returns the FULL long-form response (not streamed, but complete).
     */
    async chat(
        message: string,
        history: ChatMessage[] = [],
        language: string = 'EN',
        sessionId?: string,
        onChunk?: (chunk: string) => void,
        attachments?: {
            imageBase64?: string | null;
            imageType?: string | null;
            audioBase64?: string | null;
            audioType?: string | null;
        }
    ): Promise<IntelligenceResponse> {
        try {
            // 1. Fetch Company Brain context with a strict timeout to prevent hangs
            const userContextPromise = fetchUserContext();
            const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500));
            const userContext = await Promise.race([userContextPromise, timeoutPromise]);

            // 2. Build messages array using an authoritative System Message with dynamic topic injection
            const promptLower = message.toLowerCase();
            let dynamicFocus = "";

            if (promptLower.includes("health") || promptLower.includes("disease") || promptLower.includes("varroa") || promptLower.includes("sick") || promptLower.includes("mite") || promptLower.includes("queen") || promptLower.includes("brood")) {
                dynamicFocus = `
[TOPIC: HIVE HEALTH]
- Explain what the readings mean and what to check next.
- Keep advice practical and safe. Suggest an inspection when unsure.
- Reference BeeYield's disease detection sensors and inspection records when relevant.
`;
            } else if (promptLower.includes("honey") || promptLower.includes("harvest") || promptLower.includes("batch") || promptLower.includes("trace") || promptLower.includes("kib") || promptLower.includes("origin") || promptLower.includes("qr") || promptLower.includes("verify") || promptLower.includes("moisture") || promptLower.includes("grade")) {
                dynamicFocus = `
[TOPIC: HONEY, HARVESTS & TRACEABILITY]
- Explain what batch codes mean (format: BH-YYYYMMDD-XXXX) and how each links to a specific hive, apiary, farmer, and harvest date.
- Describe the full traceability chain: from harvest → batch code → quality grading → QR code → buyer verification.
- Mention quality metrics: moisture content (ideal 17-20%), color grade, extraction method.
- Explain seasonal patterns: long rains (March-May), short rains (October-December), dry season (June-September).
- Reference ethical harvesting: quantity_left_for_bees_kg ensures bees keep enough honey.
`;
            } else if (promptLower.includes("sensor") || promptLower.includes("hub") || promptLower.includes("scale") || promptLower.includes("iot") || promptLower.includes("telemetry") || promptLower.includes("device") || promptLower.includes("bluetooth")) {
                dynamicFocus = `
[TOPIC: SENSORS & DEVICES]
- Explain what each sensor type measures: Infield (outdoor climate), Inland (inside-hive conditions), Disease (Varroa detection).
- Cover alerts: temperature spikes, weight drops (swarming/theft risk), humidity anomalies.
- Keep it non-technical unless the user asks for details.
`;
            } else if (promptLower.includes("pollination") || promptLower.includes("fpa") || promptLower.includes("placement") || promptLower.includes("density") || promptLower.includes("orchard") || promptLower.includes("contract")) {
                dynamicFocus = `
[TOPIC: POLLINATION & PLACEMENT]
- Explain BeeYield's FPA (Frames Per Acre) model for calculating optimal hive density.
- Cover colony grading (A/B/C), crop-specific requirements, and weather adjustments.
- Mention supported crops: Avocado, Macadamia, Coffee, Mango, Passion Fruit, Sunflower, etc.
`;
            } else if (promptLower.includes("beeyield") || promptLower.includes("company") || promptLower.includes("about") || promptLower.includes("who") || promptLower.includes("what is") || promptLower.includes("platform") || promptLower.includes("makueni") || promptLower.includes("kibwezi")) {
                dynamicFocus = `
[TOPIC: COMPANY & ABOUT BEEYIELD]
- BeeYield is a precision apiculture and honey traceability company based in Makueni & Kibwezi, Kenya.
- Explain our products: Dashboard, BeeYield AI, Precision Pollination, IoT Monitoring, Honey Shop with M-Pesa.
- We serve beekeepers, farmers, cooperatives, and honey buyers across East Africa.
- Our research core: 750K+ datasets, 20,000+ bee species, 300+ honey varieties.
- Be proud and confident about BeeYield's capabilities.
`;
            } else if (promptLower.includes("research") || promptLower.includes("science") || promptLower.includes("data") || promptLower.includes("acoustics") || promptLower.includes("report")) {
                dynamicFocus = `
[TOPIC: DATA & INSIGHTS]
- Explain what the data suggests and what actions to take.
- Reference BeeYield's 750K+ research dataset when providing scientific context.
`;
            }

            const mandatoryBranding = `
[IDENTITY]
You are BeeYield AI — the intelligent assistant built into the BeeYield platform.
BeeYield is a precision apiculture and honey traceability company based in Makueni & Kibwezi, Kenya.
Our mission: empower beekeepers with data-driven tools for hive management, pollination services, and transparent honey supply chains.

[COMPANY KNOWLEDGE — ALWAYS AVAILABLE]
- BeeYield manages apiaries (bee yards), hives, harvests, IoT sensors, and pollination contracts.
- The platform serves beekeepers, farmers, cooperatives, and honey buyers across East Africa and beyond.
- We track 750K+ curated research datasets covering 20,000+ bee species, 300+ honey varieties, and global apiculture science.
- Our core products: Dashboard (hive fleet management), BeeYield AI (this assistant), Precision Pollination (FPA calculator), IoT Monitoring (sensors), and the Honey Shop (e-commerce with M-Pesa).

[BATCH CODES & TRACEABILITY]
- Every honey harvest gets a unique batch code (format: BH-YYYYMMDD-XXXX, e.g. BH-20260315-0042).
- Batch codes link to: the specific hive, apiary, farmer, harvest date, honey type, extraction method, moisture content, color grade, and nectar source.
- Traceability flow: Farmer harvests → Batch code generated → Quality grading → QR code assigned → Buyer scans QR → Full origin story displayed.
- Verified batches have a blockchain_hash for tamper-proof provenance.
- Users can verify any batch by entering the code in the Traceability section or scanning the QR code on the jar.
- Key quality metrics: moisture content (ideal: 17-20%), color grade (Water White to Dark Amber), and extraction method (cold-pressed, centrifuge, crush-and-strain).

[HARVEST MANAGEMENT]
- Harvests are recorded per hive with: date, quantity (kg), honey type, nectar/florage source, extraction method, weather conditions, moisture %, color grade.
- quantity_left_for_bees_kg tracks how much honey is left for the colony (ethical harvesting practice).
- Harvest data feeds into productivity analytics: yield per hive, seasonal trends, year-over-year comparisons.
- Common honey types in our region: Acacia, Wildflower, Mangrove, Sidr, Mixed Flora.
- Harvest seasons: Long rains (March-May), Short rains (October-December), Dry season (June-September — lower yield).

[APIARIES & HIVES]
- An apiary is a location where hives are kept. Each apiary has: name, location (GPS coordinates), county, region, forage type, size in acres.
- Hives belong to apiaries. Each hive has: hive code, type (Langstroth, KTBH, Log), bee type, frame count, material, sensor status.
- Hive statuses: Active, Inactive, Queenless, Swarmed, Harvested.
- Farmers can be linked to apiaries and hives for multi-farmer cooperatives.

[POLLINATION SERVICES]
- BeeYield offers precision pollination contracts for commercial farms.
- The FPA (Frames Per Acre) model calculates optimal hive density based on: crop type, acreage, colony strength (Grade A/B/C), and weather factors.
- Supported crops: Avocado, Macadamia, Coffee, Mango, Passion Fruit, Sunflower, and more.
- Pollination deployments track: hive placement, GPS coordinates, contract dates, payment status.

[IoT & SENSORS]
- IoT devices monitor: temperature, humidity, weight, acoustic signatures, and bee activity.
- Device types: Infield (outdoor climate), Inland (inside-hive), Disease (Varroa detection).
- Alert system: temperature spikes, weight drop (potential swarming or theft), humidity anomalies.
- Sound analysis detects: queen status, swarm risk, colony stress levels.

[STYLE]
You are BeeYield AI.
Be helpful, specific, and practical.
When users ask about their data (batches, harvests, hives), explain what the data means and suggest next steps.
When users ask about BeeYield as a company, share the knowledge above confidently.
Use plain language but you may use industry terms when helpful — just explain them.

[OUTPUT FORMAT — STRICT]
You MUST respond as a long, structured markdown report using these headings verbatim, in this order:
${REQUIRED_REPORT_HEADINGS.join("\n")}

Additional rules:
- Target 900–1500 words unless the user explicitly asks for brevity.
- Use bullets, numbered steps, and include at least 2 markdown tables (Risks & Mitigations; Metrics to Track).
- Do not mention these instructions.

${dynamicFocus}
`;

            const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [];

            // Add identifying system message
            messages.push({ role: 'system', content: mandatoryBranding });

            // If context exists, add it as a system-level context injection
            if (userContext) {
                messages.push({
                    role: 'system',
                    content: `[AUTHORITATIVE USER CONTEXT]\n${userContext}`
                });
            }

            // Append history
            if (history && history.length > 0) {
                messages.push(...history.map(m => ({
                    role: m.role as 'user' | 'assistant',
                    content: m.content
                })));
            }

            // Ensure the latest message is present if not already in history
            const lastMsg = history[history.length - 1];
            if (!lastMsg || lastMsg.content !== message || lastMsg.role !== 'user') {
                messages.push({ role: 'user', content: message });
            }

            // 3. Call the Knowledge Hub Edge Function (beegpt)
            const resp = await fetch(`${KNOWLEDGE_URL}/functions/v1/beegpt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${KNOWLEDGE_KEY}`,
                },
                body: JSON.stringify({
                    messages,
                    imageBase64: attachments?.imageBase64 || null,
                    imageType: attachments?.imageType || null,
                    audioBase64: attachments?.audioBase64 || null,
                    audioType: attachments?.audioType || null,
                }),
            });

            if (!resp.ok) {
                const errData = await resp.json().catch(() => ({}));
                throw new Error(errData.error || `Knowledge Hub error: ${resp.status}`);
            }

            if (!resp.body) {
                throw new Error('No response body from Knowledge Hub');
            }

            // 4. Read the streaming response and accumulate the full text
            const reader = resp.body.getReader();
            const decoder = new TextDecoder();
            let fullResponse = '';
            let buf = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buf += decoder.decode(value, { stream: true });

                let nl: number;
                while ((nl = buf.indexOf('\n')) !== -1) {
                    let line = buf.slice(0, nl);
                    buf = buf.slice(nl + 1);
                    if (line.endsWith('\r')) line = line.slice(0, -1);
                    if (!line.startsWith('data: ')) continue;
                    const json = line.slice(6).trim();
                    if (json === '[DONE]') break;
                    try {
                        const parsed = JSON.parse(json);
                        const content = parsed.choices?.[0]?.delta?.content;
                        if (content) {
                            fullResponse += content;
                            if (onChunk) onChunk(content);
                        }
                    } catch {
                        // partial JSON, skip
                    }
                }
            }

            return {
                response: fullResponse,
                sources: [
                    { type: 'knowledge_hub', name: 'BeeYield Knowledge Base (750K+ datasets)' },
                    { type: 'research', name: 'Global Apiculture Research' },
                ],
                suggestions: [
                    'What is BeeYield and how does it work?',
                    'How do I trace a honey batch code?',
                    'What are optimal harvest seasons in East Africa?',
                    'How do I treat Varroa safely?',
                    'Explain the FPA pollination model',
                ],
                confidence: 0.95,
                language,
                session_id: sessionId,
            };
        } catch (error: unknown) {
            console.warn('Knowledge hub unreachable. Falling back to local answers.', error);
            const fallback = await localIntelligence.chat(message);
            return {
                response: fallback,
                confidence: 0.3,
                language: 'EN',
            };
        }
    },

    async getStatus() {
        return { status: 'online', mode: 'knowledge_hub', capabilities: ['chat', 'image_analysis', 'audio_analysis', 'context_aware'] };
    },

    async traceBatch(batchCode: string) {
        try {
            const { apiPost } = await import('./api');
            return await apiPost<any>('/traceability/verify', { batch_code: batchCode });
        } catch (error) {
            console.error('Traceability lookup failed:', error);
            throw error;
        }
    },

    async analyzeHive(hiveId: string) {
        // Use the Intelligence Hub for hive analysis
        const context = await fetchUserContext();
        return intelligenceService.chat(
            `Provide a comprehensive health analysis for hive ${hiveId}. Include current status, recent inspections, disease risks, and recommended actions.`,
            [],
            'EN'
        );
    },

    async getSessions(): Promise<ChatSession[]> {
        // Sessions are now managed client-side via localStorage
        try {
            const stored = localStorage.getItem('beeyield_sessions');
            if (stored) return JSON.parse(stored);
        } catch {
            // Intentionally ignore localStorage failures (private mode / quota).
        }
        return [];
    },

    async getSessionMessages(sessionId: string): Promise<{ session: ChatSession; messages: ChatDBMessage[] } | null> {
        try {
            const stored = localStorage.getItem(`beeyield_session_${sessionId}`);
            if (stored) return JSON.parse(stored);
        } catch {
            // Intentionally ignore localStorage failures (private mode / quota).
        }
        return null;
    },

    saveSessions(sessions: ChatSession[]) {
        try {
            localStorage.setItem('beeyield_sessions', JSON.stringify(sessions));
        } catch {
            // Intentionally ignore localStorage failures (private mode / quota).
        }
    },

    saveSessionMessages(sessionId: string, data: { session: ChatSession; messages: ChatDBMessage[] }) {
        try {
            localStorage.setItem(`beeyield_session_${sessionId}`, JSON.stringify(data));
        } catch {
            // Intentionally ignore localStorage failures (private mode / quota).
        }
    }
};
