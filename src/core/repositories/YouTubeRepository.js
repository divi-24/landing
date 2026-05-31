import apiClient from '../config/apiClient';
import { API_CONFIG, STORAGE_KEYS } from '../config/apiConfig';

const readJson = (value) => {
    try {
        return value ? JSON.parse(value) : null;
    } catch {
        return null;
    }
};

const decodeJwtPayload = (token) => {
    try {
        if (!token) return null;
        const payload = token.split('.')[1];
        if (!payload) return null;
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const json = decodeURIComponent(
            atob(base64)
                .split('')
                .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
                .join('')
        );
        return JSON.parse(json);
    } catch {
        return null;
    }
};

const getCurrentUserId = () => {
    const storedUser = readJson(localStorage.getItem(STORAGE_KEYS.USER_DATA));
    const tokenUser = decodeJwtPayload(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN));
    const user = storedUser || tokenUser || {};
    return user._id || user.id || user.userId || user.sub || user.user?._id || user.user?.id;
};

const requireUserScopedEndpoint = (endpoint, userId) => {
    const id = userId || getCurrentUserId();
    if (!id) {
        throw new Error('Missing user id for YouTube analytics. Please sign in again.');
    }
    return `${endpoint}/${encodeURIComponent(id)}`;
};

class YouTubeRepository {
    async getStatus() {
        const response = await apiClient.get(API_CONFIG.ENDPOINTS.YOUTUBE_STATUS);
        return response.data;
    }

    async disconnectYouTube() {
        const response = await apiClient.post(API_CONFIG.ENDPOINTS.YOUTUBE_DISCONNECT);
        return response.data;
    }

    async getOverview(startDate, endDate, userId) {
        const response = await apiClient.get(requireUserScopedEndpoint(API_CONFIG.ENDPOINTS.YOUTUBE_OVERVIEW, userId), {
            params: { startDate, endDate },
        });
        return response.data;
    }

    async getTopVideos(startDate, endDate, limit) {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (limit) params.limit = limit;
        const response = await apiClient.get(API_CONFIG.ENDPOINTS.YOUTUBE_TOP_VIDEOS, { params });
        return response.data;
    }
}

export default new YouTubeRepository();
