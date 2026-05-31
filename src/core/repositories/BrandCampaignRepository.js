import apiClient from '../config/apiClient';
import { API_CONFIG } from '../config/apiConfig';

class BrandCampaignRepository {
    async getCampaigns(status = 'all') {
        const response = await apiClient.get(API_CONFIG.ENDPOINTS.BRAND_CAMPAIGNS, {
            params: { status },
        });
        return response.data;
    }

    async createCampaign(data) {
        const response = await apiClient.post(API_CONFIG.ENDPOINTS.BRAND_CAMPAIGN_CREATE, data);
        return response.data;
    }

    async publishCampaign(id) {
        const response = await apiClient.put(`${API_CONFIG.ENDPOINTS.BRAND_CAMPAIGN_PUBLISH}/${id}`);
        return response.data;
    }

    async updateCampaign(id, data) {
        const response = await apiClient.put(`${API_CONFIG.ENDPOINTS.BRAND_CAMPAIGN_UPDATE}/${id}`, data);
        return response.data;
    }

    async deleteCampaign(id) {
        const response = await apiClient.delete(`${API_CONFIG.ENDPOINTS.BRAND_CAMPAIGN_DELETE}/${id}`);
        return response.data;
    }

    async exploreCampaigns(start = 0, end = 50) {
        const response = await apiClient.get(API_CONFIG.ENDPOINTS.BRAND_CAMPAIGNS_EXPLORE, {
            params: { start, end },
        });
        return response.data;
    }

    async applyCampaign(id, proposedBid) {
        const response = await apiClient.post(`${API_CONFIG.ENDPOINTS.BRAND_CAMPAIGN_APPLY}/${id}/apply`, { proposedBid });
        return response.data;
    }

    // operation: 'MOVETOREVIEW' | 'MOVETOSHORTLISTED'
    async updateApplicant(campaignId, applicantId, operation) {
        const response = await apiClient.put(
            `${API_CONFIG.ENDPOINTS.BRAND_CAMPAIGN_UPDATE_APPLICANT}/${campaignId}/update-applicant/${applicantId}`,
            {},
            { params: { operation } }
        );
        return response.data;
    }

    async getCampaignById(id) {
        const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.BRAND_CAMPAIGN_BY_ID}/${id}`);
        return response.data;
    }

    async getCampaignsByBrandId(brandId) {
        const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.BRAND_CAMPAIGNS_BY_BRAND}/${brandId}/campaigns`);
        return response.data;
    }

    // Thread APIs
    async getThreadMessages(campaignId, threadId) {
        const response = await apiClient.get(
            `${API_CONFIG.ENDPOINTS.BRAND_CAMPAIGN_THREAD}/${campaignId}/thread/${threadId}`
        );
        return response.data;
    }

    async sendThreadMessage(campaignId, threadId, message) {
        const response = await apiClient.put(
            `${API_CONFIG.ENDPOINTS.BRAND_CAMPAIGN_THREAD}/${campaignId}/thread/${threadId}`,
            { message }
        );
        return response.data;
    }

    // Legal Agreements — PUT with no params acts as a read for creators:
    // 200 = creator is in underReview and has an agreement
    // 404 = creator is in underReview but no agreement entry yet
    // 403 = creator is NOT in underReview (still applied or shortlisted)
    async getLegalAgreements(campaignId) {
        const response = await apiClient.put(
            `${API_CONFIG.ENDPOINTS.BRAND_CAMPAIGN_AGREEMENTS}/${campaignId}/agreements`
        );
        return response.data;
    }

    async acknowledgeLegalAgreement(campaignId, acknowledgement, creatorId = null) {
        const params = { acknowledgement };
        if (creatorId) params.user = creatorId;
        const response = await apiClient.put(
            `${API_CONFIG.ENDPOINTS.BRAND_CAMPAIGN_AGREEMENTS}/${campaignId}/agreements`,
            {},
            { params }
        );
        return response.data;
    }
}

export default new BrandCampaignRepository();
