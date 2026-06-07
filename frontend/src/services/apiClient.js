import axios from 'axios'

const apiClient = axios.create({
    baseURL: 'http://localhost:3000/',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
})


apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status == 401){
            console.error("Unauthorized Loading")
        }
        return Promise.reject(error.response?.data || error.message);
    }
)

export default apiClient