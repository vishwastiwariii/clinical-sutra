import apiClient from "./apiClient";

export const searchService = {

    getTrialsBySearch: async (params = '') => {
        const queryParams = typeof params === 'string' ? { q: params } : params;
        return await apiClient.get('/search', {
            params: queryParams
        });
    },

    getAllTrials: async () => {
        return await apiClient.get('/trials')
    },

    getTrialsById: async (nct_id) => {
        return await apiClient.get(`/trials/${nct_id}`)
    }
    
}