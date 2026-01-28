import axios from 'axios';
import { localIntelligence } from './localIntelligence';

const API_BASE_URL = import.meta.env.VITE_API_URL ||
    (window.location.hostname === 'localhost' ? 'http://localhost:8000/api/v1' : '/api/v1');

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export const aiService = {
    async chat(message: string, history: ChatMessage[] = [], language: string = 'EN') {
        console.log('Sending chat request to:', `${API_BASE_URL}/ai/chat`);
        try {
            const response = await axios.post(`${API_BASE_URL}/ai/chat`, {
                message,
                history,
                language
            }, {
                timeout: 5000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data.response;
        } catch (error: any) {
            console.warn('Backend connection failed, switching to local intelligence.');
            // Fallback to local intelligence
            return await localIntelligence.chat(message);
        }
    },

    async getStatus() {
        try {
            const response = await axios.get(`${API_BASE_URL}/ai/status`, { timeout: 2000 });
            return response.data;
        } catch (error) {
            // Return 'online' to avoid UI error states, assuming local is "online" enough
            return { status: 'online', mode: 'local' };
        }
    }
};
