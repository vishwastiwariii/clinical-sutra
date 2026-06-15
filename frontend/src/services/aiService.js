import apiClient from "./apiClient.js";

export const aiService = {
    getAiResults: async (question = '') => {
        const payload = typeof question === 'string' ? { question } : question;
        const response = await apiClient.post('/assistant', payload);
        return response;
    }
};