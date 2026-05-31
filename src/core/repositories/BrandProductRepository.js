import apiClient from '../config/apiClient';
import { API_CONFIG } from '../config/apiConfig';

class BrandProductRepository {
    async createProduct(formData) {
        const response = await apiClient.post(API_CONFIG.ENDPOINTS.BRAND_PRODUCT_CREATE, formData);
        return response.data;
    }

    async getMyProducts() {
        const response = await apiClient.get(API_CONFIG.ENDPOINTS.BRAND_MY_PRODUCTS);
        return response.data;
    }

    async getProductsByBrandId(brandId) {
        const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.BRAND_PROFILE}/${brandId}/products`);
        return response.data;
    }

    async deleteProduct(productId) {
        const response = await apiClient.delete(`${API_CONFIG.ENDPOINTS.BRAND_PRODUCT_DELETE}/${productId}/delete`);
        return response.data;
    }

    async updateProduct(productId, data) {
        const response = await apiClient.patch(`${API_CONFIG.ENDPOINTS.BRAND_PRODUCT_UPDATE}/${productId}/update`, data);
        return response.data;
    }

    async addMedia(productId, formData) {
        const response = await apiClient.patch(`${API_CONFIG.ENDPOINTS.BRAND_PRODUCT_MEDIA}/${productId}`, formData);
        return response.data;
    }

    async deleteMedia(productId, mediaId) {
        const response = await apiClient.delete(`${API_CONFIG.ENDPOINTS.BRAND_PRODUCT_DELETE}/${productId}/media/${mediaId}`);
        return response.data;
    }

    async getProductById(productId) {
        const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.BRAND_PRODUCT_BY_ID}/${productId}`);
        return response.data;
    }

    async exploreBrandProducts() {
        const response = await apiClient.get(API_CONFIG.ENDPOINTS.BRAND_PRODUCT_EXPLORE);
        return response.data;
    }

    async searchProducts(query) {
        const response = await apiClient.get('/brand/product/search', {
            params: { q: query },
        });
        return response.data;
    }

    async likeProduct(productId) {
        const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.BRAND_PRODUCT_LIKE}/${productId}`);
        return response.data;
    }

    async pinProduct(productId) {
        const response = await apiClient.patch(`${API_CONFIG.ENDPOINTS.BRAND_PRODUCT_PIN}/${productId}`);
        return response.data;
    }
}

export default new BrandProductRepository();
