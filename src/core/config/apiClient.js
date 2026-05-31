import axios from 'axios';
import { API_CONFIG, STORAGE_KEYS } from './apiConfig';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;

            const isYouTubeReauth = data?.error === 'YOUTUBE_REAUTH_REQUIRED';

            if (status === 401 && !error.config.url.includes('/login') && !isYouTubeReauth) {
                // Unauthorized - clear token and redirect to login
                localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
                localStorage.removeItem(STORAGE_KEYS.USER_DATA);
                window.location.href = '/login';
            }

            return Promise.reject({
                message: data.error || data.message || 'An error occurred',
                status,
                data,
            });
        } else if (error.request) {
            // Request made but no response
            return Promise.reject({
                message: 'Network error. Please check your connection.',
                status: 0,
            });
        } else {
            // Something else happened
            return Promise.reject({
                message: error.message || 'An unexpected error occurred',
                status: 0,
            });
        }
    }
);

export default apiClient;
