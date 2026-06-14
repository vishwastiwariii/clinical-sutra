import apiClient from "./apiClient.js";

export const aiService = {
    getAiResults: async (question = '') => {
        const question = typeof (question) == string ? { question } : question
        await apiClient.post('/assistant', {
            question: question
        })
    }
}