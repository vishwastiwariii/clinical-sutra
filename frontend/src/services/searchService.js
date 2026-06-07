import apiClient from "./apiClient";

export const searchService = {

    getTrialsBySearch: async(searchQuery = '') => {
        return await apiClient.get('/search', {
            params: {q: searchQuery}
        })
    },

    getAllTrials: async () => {
        return await apiClient.get('/trials')
    },

    getTrialsById: async (nct_id) => {
        return await apiClient.get(`/trials/${nct_id}`)
    }
    
}