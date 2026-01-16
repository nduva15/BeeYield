import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export const aiService = {
    async chat(message: string, history: ChatMessage[] = []) {
        try {
            const response = await axios.post(`${API_BASE_URL}/ai/chat`, {
                message,
                history
            });
            return response.data.response;
        } catch (error) {
            console.error('AI Chat Error:', error);
            return "I'm having trouble connecting right now. Please try again later.";
        }
    },

    async getStatus() {
        try {
            const response = await axios.get(`${API_BASE_URL}/ai/status`);
            return response.data;
        } catch (error) {
            console.error('AI Status Error:', error);
            return { status: 'offline' };
        }
    }
};
