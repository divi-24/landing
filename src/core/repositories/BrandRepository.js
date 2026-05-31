import apiClient from '../config/apiClient';
import { API_CONFIG } from '../config/apiConfig';

class BrandRepository {
    async signup(email, password) {
        const response = await apiClient.post(API_CONFIG.ENDPOINTS.BRAND_SIGNUP, {
            email,
            password,
        });
        return response.data;
    }

    async login(email, password) {
        const response = await apiClient.post(API_CONFIG.ENDPOINTS.BRAND_LOGIN, {
            email,
            password,
        });
        return response.data;
    }

    async updateProfile(profileData) {
        const config = profileData instanceof FormData
            ? { headers: { 'Content-Type': 'multipart/form-data' } }
            : undefined;
        const response = await apiClient.put(API_CONFIG.ENDPOINTS.BRAND_UPDATE, profileData, config);
        return response.data;
    }

    async getProfile() {
        const response = await apiClient.get(API_CONFIG.ENDPOINTS.BRAND_PROFILE);
        return response.data;
    }

    async deleteAccount() {
        const response = await apiClient.delete(API_CONFIG.ENDPOINTS.BRAND_DELETE);
        return response.data;
    }

    async getAllBrands(start = 0, limit = 30) {
        const response = await apiClient.get(API_CONFIG.ENDPOINTS.BRAND_ALL, {
            params: { start, limit },
        });
        return response.data;
    }

    async getBrandById(brandId) {
        const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.BRAND_PROFILE}/${brandId}`);
        return response.data;
    }

    async getAnalytics() {
        const response = await apiClient.get(API_CONFIG.ENDPOINTS.BRAND_ANALYTICS);
        return response.data;
    }
}

export default new BrandRepository();
