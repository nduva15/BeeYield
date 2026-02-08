import axios from 'axios';
import { localIntelligence } from './localIntelligence';

const API_BASE_URL = import.meta.env.VITE_API_URL ||
    (window.location.hostname === 'localhost' ? 'http://localhost:8000/api/v1' : '/api/v1');

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
}

export const aiService = {
    async chat(message: string, history: ChatMessage[] = [], language: string = 'EN'): Promise<AIResponse> {
        console.log('Sending chat request to:', `${API_BASE_URL}/assistant/chat`);
        try {
            const response = await axios.post(`${API_BASE_URL}/assistant/chat`, {
                message,
                history,
                language,
                include_sources: true
            }, {
                timeout: 120000, // Increased timeout to 120s for ultra-long AI generation
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error: unknown) {
            console.warn('Backend connection failed, switching to local intelligence.');
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
            const response = await axios.get(`${API_BASE_URL}/assistant/status`, { timeout: 2000 });
            return response.data;
        } catch (error) {
            return { status: 'online', mode: 'local' };
        }
    }
};
