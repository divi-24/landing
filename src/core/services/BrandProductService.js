import BrandProductRepository from '../repositories/BrandProductRepository';

class BrandProductService {
    async createProduct(fields) {
        const fd = new FormData();
        fd.append('name', fields.name);
        fd.append('link', fields.link);
        if (fields.desc) fd.append('desc', fields.desc);
        if (fields.category) fd.append('category', fields.category);
        if (fields.tags) fd.append('tags', fields.tags);
        if (fields.mediaFiles) {
            Array.from(fields.mediaFiles).forEach(file => fd.append('media', file));
        }
        const response = await BrandProductRepository.createProduct(fd);
        return response;
    }

    async getMyProducts() {
        const response = await BrandProductRepository.getMyProducts();
        return response.results || [];
    }

    async getProductsByBrandId(brandId) {
        const response = await BrandProductRepository.getProductsByBrandId(brandId);
        return response.results || [];
    }

    async deleteProduct(productId) {
        return BrandProductRepository.deleteProduct(productId);
    }

    async updateProduct(productId, data) {
        return BrandProductRepository.updateProduct(productId, data);
    }

    async addMedia(productId, files) {
        const fd = new FormData();
        Array.from(files).forEach(file => fd.append('media', file));
        return BrandProductRepository.addMedia(productId, fd);
    }

    async deleteMedia(productId, mediaId) {
        return BrandProductRepository.deleteMedia(productId, mediaId);
    }

    async getProductById(productId) {
        try {
            const response = await BrandProductRepository.getProductById(productId);
            return response?.results || response?.data || response?.result || response;
        } catch {
            return null;
        }
    }

    async exploreBrandProducts() {
        try {
            const response = await BrandProductRepository.exploreBrandProducts();
            if (Array.isArray(response)) return response;
            if (Array.isArray(response?.results)) return response.results;
            if (Array.isArray(response?.data)) return response.data;
            if (Array.isArray(response?.products)) return response.products;
            return [];
        } catch {
            return [];
        }
    }

    async searchProducts(query) {
        try {
            const response = await BrandProductRepository.searchProducts(query);
            if (Array.isArray(response)) return response;
            if (Array.isArray(response?.results)) return response.results;
            if (Array.isArray(response?.data)) return response.data;
            return [];
        } catch {
            return [];
        }
    }

    async likeProduct(productId) {
        return BrandProductRepository.likeProduct(productId);
    }

    async pinProduct(productId) {
        return BrandProductRepository.pinProduct(productId);
    }
}

export default new BrandProductService();
