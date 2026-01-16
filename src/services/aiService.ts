import axios from 'axios';

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
                timeout: 10000, // 10s timeout
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data.response;
        } catch (error: any) {
            console.error('AI Chat Error Details:', error.response || error);
            if (error.code === 'ECONNABORTED') return "The session timed out. Please try again.";
            return "I'm having trouble connecting to the BeeYield Brain. Check if the backend server is running on port 8000.";
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
