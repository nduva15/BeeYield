import { apiGet, apiPost } from './api';
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

export const aiService = {
    async chat(message: string, history: ChatMessage[] = [], language: string = 'EN', sessionId?: string): Promise<AIResponse> {
        console.log('Sending AI Chat request...');
        try {
            return await apiPost<AIResponse>('/assistant/chat', {
                message,
                history,
                language,
                include_sources: true,
                session_id: sessionId
            });
        } catch (error: unknown) {
            console.warn('AI Backend unreachable or error, falling back to Local Intelligence');
            const fallback = await localIntelligence.chat(message);
            return {
                response: fallback,
                confidence: 0.7,
                language: 'EN'
            };
        }
    },

    async getStatus() {
        try {
            return await apiGet<any>('/assistant/status');
        } catch (error) {
            return { status: 'online', mode: 'local' };
        }
    },

    async traceBatch(batchCode: string) {
        try {
            return await apiPost<any>('/assistant/trace', { batch_code: batchCode });
        } catch (error) {
            console.error('AI Traceability failed:', error);
            throw error;
        }
    },

    async analyzeHive(hiveId: string) {
        try {
            return await apiPost<any>('/assistant/hive/analyze', {
                hive_id: hiveId,
                include_recommendations: true
            });
        } catch (error) {
            console.error('Hive analysis failed:', error);
            throw error;
        }
    },

    async getSessions(): Promise<ChatSession[]> {
        try {
            const result = await apiGet<{ sessions: ChatSession[] }>('/assistant/sessions');
            return result.sessions || [];
        } catch (error) {
            console.error('Failed to get chat sessions:', error);
            return [];
        }
    },

    async getSessionMessages(sessionId: string): Promise<{ session: ChatSession; messages: ChatDBMessage[] } | null> {
        try {
            return await apiGet<{ session: ChatSession; messages: ChatDBMessage[] }>(`/assistant/sessions/${sessionId}/messages`);
        } catch (error) {
            console.error('Failed to get session messages:', error);
            return null;
        }
    }
};
