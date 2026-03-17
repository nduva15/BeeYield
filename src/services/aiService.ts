/**
 * BeeYield AI Service — Routes through the Knowledge Hub Edge Function (beegpt)
 * This is the AUTHORITATIVE AI service that provides long-form, detailed responses.
 * It connects to the Supabase Knowledge Hub which has 750K+ curated datasets.
 */
import { apiGet } from './api';
import { localIntelligence } from './localIntelligence';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface AIResponse {
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

export const aiService = {
    /**
     * Send a chat message to the BeeYield AI (Knowledge Hub Edge Function).
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
    ): Promise<AIResponse> {
        try {
            // 1. Fetch Company Brain context with a strict timeout to prevent hangs
            const userContextPromise = fetchUserContext();
            const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500));
            const userContext = await Promise.race([userContextPromise, timeoutPromise]);

            // 2. Build messages array using an authoritative System Message with dynamic topic injection
            const promptLower = message.toLowerCase();
            let dynamicFocus = "";

            if (promptLower.includes("health") || promptLower.includes("disease") || promptLower.includes("varroa") || promptLower.includes("sick") || promptLower.includes("mite")) {
                dynamicFocus = `
[TOPIC: HIVE HEALTH]
- Explain what the readings mean and what to check next.
- Keep advice practical and safe. Suggest an inspection when unsure.
`;
            } else if (promptLower.includes("honey") || promptLower.includes("harvest") || promptLower.includes("batch") || promptLower.includes("trace") || promptLower.includes("kib")) {
                dynamicFocus = `
[TOPIC: HONEY & TRACEABILITY]
- Explain what batch details mean and how to verify origin.
- Keep it simple and avoid technical implementation details.
`;
            } else if (promptLower.includes("sensor") || promptLower.includes("hub") || promptLower.includes("scale") || promptLower.includes("iot") || promptLower.includes("telemetry")) {
                dynamicFocus = `
[TOPIC: SENSORS & DEVICES]
- Explain what each sensor measures and common troubleshooting steps.
- Keep it non-technical unless the user asks for details.
`;
            } else if (promptLower.includes("research") || promptLower.includes("science") || promptLower.includes("data") || promptLower.includes("acoustics")) {
                dynamicFocus = `
[TOPIC: DATA & INSIGHTS]
- Explain what the data suggests and what actions to take.
`;
            }

            const mandatoryBranding = `
[STYLE]
You are the BeeYield assistant.
Use plain, simple language.
Be specific and practical.
Avoid buzzwords.
Avoid implementation/protocol details unless the user asks.

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
                    'How do I treat Varroa safely?',
                    'What are the best honey varieties for export?',
                    'Analyze my hive health trends',
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
        return aiService.chat(
            `Provide a comprehensive health analysis for hive ${hiveId}. Include current status, recent inspections, disease risks, and recommended actions.`,
            [],
            'EN'
        );
    },

    async getSessions(): Promise<ChatSession[]> {
        // Sessions are now managed client-side via localStorage
        try {
            const stored = localStorage.getItem('beeyield_ai_sessions');
            if (stored) return JSON.parse(stored);
        } catch {
            // Intentionally ignore localStorage failures (private mode / quota).
        }
        return [];
    },

    async getSessionMessages(sessionId: string): Promise<{ session: ChatSession; messages: ChatDBMessage[] } | null> {
        try {
            const stored = localStorage.getItem(`beeyield_ai_session_${sessionId}`);
            if (stored) return JSON.parse(stored);
        } catch {
            // Intentionally ignore localStorage failures (private mode / quota).
        }
        return null;
    },

    saveSessions(sessions: ChatSession[]) {
        try {
            localStorage.setItem('beeyield_ai_sessions', JSON.stringify(sessions));
        } catch {
            // Intentionally ignore localStorage failures (private mode / quota).
        }
    },

    saveSessionMessages(sessionId: string, data: { session: ChatSession; messages: ChatDBMessage[] }) {
        try {
            localStorage.setItem(`beeyield_ai_session_${sessionId}`, JSON.stringify(data));
        } catch {
            // Intentionally ignore localStorage failures (private mode / quota).
        }
    }
};
