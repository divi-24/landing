import BrandRepository from '../repositories/BrandRepository';
import { STORAGE_KEYS } from '../config/apiConfig';

const sanitizeProfileUpdate = (profileData = {}) => {
    const payload = { ...profileData };

    if (profileData.collaborationInfo) {
        const {
            collaborationOpen,
            preferredCreatorCategories,
            preferredCategories,
            collaborationTypes,
            typicalBudgetRange,
        } = profileData.collaborationInfo;

        payload.collaborationInfo = {};
        if (collaborationOpen !== undefined) {
            payload.collaborationInfo.collaborationOpen = collaborationOpen;
        }
        if (collaborationTypes !== undefined) {
            payload.collaborationInfo.collaborationTypes = collaborationTypes;
        }
        if (preferredCreatorCategories !== undefined || preferredCategories !== undefined) {
            payload.collaborationInfo.preferredCategories = preferredCreatorCategories || preferredCategories;
        }
        if (typicalBudgetRange !== undefined) {
            payload.collaborationInfo.typicalBudgetRange = typicalBudgetRange;
        }
    }

    return payload;
};

class BrandService {
    validateCredentials(email, password) {
        if (!email) throw new Error('Email is required');
        if (!password) throw new Error('Password is required');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }
    }

    storeBrandSession(token, profile = null) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.ACCOUNT_TYPE, 'brand');
        if (profile) {
            localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(profile));
        }
    }

    async signup(email, password) {
        this.validateCredentials(email, password);
        const response = await BrandRepository.signup(email, password);
        return response;
    }

    async login(email, password) {
        this.validateCredentials(email, password);
        const response = await BrandRepository.login(email, password);
        if (!response?.token) {
            throw new Error(response?.message || 'Brand login did not return a token');
        }
        this.storeBrandSession(response.token);
        return response;
    }

    async updateProfile(profileData) {
        const data = profileData instanceof FormData ? profileData : sanitizeProfileUpdate(profileData);
        const response = await BrandRepository.updateProfile(data);
        return response;
    }

    async getProfile() {
        const response = await BrandRepository.getProfile();
        return response?.data || response;
    }

    async deleteAccount() {
        return BrandRepository.deleteAccount();
    }

    async exploreBrands(start = 0, limit = 30) {
        try {
            const response = await BrandRepository.getAllBrands(start, limit);
            return Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
        } catch {
            return [];
        }
    }

    async getBrandById(brandId) {
        const response = await BrandRepository.getBrandById(brandId);
        return response?.data || response;
    }

    async getAnalytics() {
        const response = await BrandRepository.getAnalytics();
        return response?.analytics || response?.data || response;
    }
}

export default new BrandService();
