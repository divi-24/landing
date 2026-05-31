import BrandCampaignRepository from '../repositories/BrandCampaignRepository';

export const labelFromEnum = (value) => String(value || '')
    .trim()
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const IST_TIME_ZONE = 'Asia/Kolkata';

const hasTimezone = (value) => /(?:z|[+-]\d{2}:?\d{2})$/i.test(String(value || ''));

const parseBackendUtcDate = (value) => {
    if (!value) return null;
    const raw = String(value).trim();
    if (!raw) return null;
    const normalized = hasTimezone(raw)
        ? raw
        : /^\d{4}-\d{2}-\d{2}$/.test(raw)
            ? `${raw}T00:00:00.000Z`
            : `${raw}Z`;
    const date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? null : date;
};

export const toCampaignDateTimeLocalValue = (value) => {
    const date = parseBackendUtcDate(value);
    if (!date) return '';
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: IST_TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).formatToParts(date).reduce((acc, part) => {
        if (part.type !== 'literal') acc[part.type] = part.value;
        return acc;
    }, {});
    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
};

export const formatCampaignDateTime = (value, options = {}) => {
    const date = parseBackendUtcDate(value);
    if (!date) return value ? String(value).replace('T', ' ') : 'Not set';
    return date.toLocaleString('en-IN', {
        timeZone: IST_TIME_ZONE,
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        ...options,
    });
};

const toBackendUtcIso = (value) => {
    if (!value) return '';
    const raw = String(value).trim();
    if (!raw) return '';
    if (hasTimezone(raw)) {
        const date = new Date(raw);
        return Number.isNaN(date.getTime()) ? raw : date.toISOString();
    }
    const istValue = /^\d{4}-\d{2}-\d{2}$/.test(raw)
        ? `${raw}T00:00:00+05:30`
        : `${raw.length === 16 ? `${raw}:00` : raw}+05:30`;
    const date = new Date(istValue);
    return Number.isNaN(date.getTime()) ? raw : date.toISOString();
};

const getDateOnly = (value) => toCampaignDateTimeLocalValue(value).slice(0, 10);

const normalizeStatus = (status) => {
    const value = String(status || 'DRAFT').trim().toUpperCase();
    if (value === 'PUBLISHED') return 'Published';
    if (value === 'DRAFT') return 'Draft';
    return labelFromEnum(value);
};

const normalizeCampaign = (campaign = {}) => {
    const min = campaign.budgetRange?.min ?? 0;
    const max = campaign.budgetRange?.max ?? min;
    const platformList = Array.isArray(campaign.platformsRequired) ? campaign.platformsRequired : [];
    const deliverable = campaign.contentDeliverable || '';

    return {
        raw: campaign,
        id: campaign._id || campaign.id,
        name: campaign.campaignTitle || 'Untitled campaign',
        product: campaign.productServiceName || '',
        status: normalizeStatus(campaign.campaignStatus),
        statusValue: String(campaign.campaignStatus || '').trim().toUpperCase(),
        creators: campaign.numberOfCreatorsToSelect || 0,
        start: getDateOnly(campaign.campaignStartDate),
        end: getDateOnly(campaign.applicationTimeline),
        endDate: getDateOnly(campaign.campaignEndDate),
        startDateTime: campaign.campaignStartDate || '',
        applicationDeadlineDateTime: campaign.applicationTimeline || '',
        endDateTime: campaign.campaignEndDate || '',
        budgetLocked: campaign.budgetLocked === true,
        budgetLockedAt: campaign.budgetLockedAt || null,
        budget: max || min || 0,
        budgetMin: min,
        budgetMax: max,
        clicks: 0,
        platform: platformList.map(labelFromEnum).join(', ') || 'Not selected',
        platforms: platformList,
        category: labelFromEnum(deliverable) || 'Campaign',
        goal: labelFromEnum(deliverable) || 'Creator collaboration',
        applicants: Array.isArray(campaign.applicants) ? campaign.applicants : [],
        underReview: Array.isArray(campaign.underReview) ? campaign.underReview : [],
        shortlisted: Array.isArray(campaign.shortlisted) ? campaign.shortlisted : [],
        legalAgreements: Array.isArray(campaign.legalAgreements) ? campaign.legalAgreements : [],
        productIds: Array.isArray(campaign.productIds) ? campaign.productIds : [],
        myShortlistedDetails: campaign.myShortlistedDetails || null,
        myLegalAgreements: campaign.myLegalAgreements || null,
        baseTimelines: Array.isArray(campaign.baseTimelines) ? campaign.baseTimelines : [],
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
    };
};

const mapFormToPayload = (form) => ({
    campaignTitle: form.name.trim(),
    productServiceName: form.product.trim(),
    contentDeliverable: form.deliverable,
    platformsRequired: form.platforms,
    budgetRange: {
        min: Number(form.budgetMin),
        max: Number(form.budgetMax),
    },
    applicationTimeline: toBackendUtcIso(form.applicationDeadline),
    campaignStartDate: toBackendUtcIso(form.startDate),
    campaignEndDate: toBackendUtcIso(form.endDate),
    numberOfCreatorsToSelect: Number(form.creatorCount),
    productIds: Array.isArray(form.productIds) ? form.productIds.filter(Boolean) : [],
    baseTimelines: (form.baseTimelines || []).map(t => ({
        title: String(t.title || '').trim(),
        deadline: toBackendUtcIso(t.deadline),
    })),
});

class BrandCampaignService {
    async getCampaigns(status = 'all') {
        const response = await BrandCampaignRepository.getCampaigns(status);
        return (response?.data || []).map(normalizeCampaign);
    }

    async createCampaign(form) {
        this.validateCampaignForm(form);
        const response = await BrandCampaignRepository.createCampaign(mapFormToPayload(form));
        return response;
    }

    async publishCampaign(id) {
        return BrandCampaignRepository.publishCampaign(id);
    }

    async updateCampaign(id, form) {
        this.validateCampaignForm(form);
        const payload = mapFormToPayload(form);
        const response = await BrandCampaignRepository.updateCampaign(id, payload);
        return response;
    }

    async deleteCampaign(id) {
        return BrandCampaignRepository.deleteCampaign(id);
    }

    async exploreCampaigns(start = 0, end = 50) {
        const response = await BrandCampaignRepository.exploreCampaigns(start, end);
        return { data: (response?.data || []).map(normalizeCampaign), count: response?.count || 0 };
    }

    async applyCampaign(id, proposedBid) {
        return BrandCampaignRepository.applyCampaign(id, proposedBid);
    }

    // operation: 'MOVETOREVIEW' | 'MOVETOSHORTLISTED'
    async updateApplicant(campaignId, applicantId, operation) {
        return BrandCampaignRepository.updateApplicant(campaignId, applicantId, operation);
    }

    async getCampaignById(id) {
        const response = await BrandCampaignRepository.getCampaignById(id);
        return normalizeCampaign(response?.data || response || {});
    }

    async getCampaignsByBrandId(brandId) {
        const response = await BrandCampaignRepository.getCampaignsByBrandId(brandId);
        return (response?.data || []).map(normalizeCampaign);
    }

    // Thread methods
    async getThreadMessages(campaignId, threadId) {
        const response = await BrandCampaignRepository.getThreadMessages(campaignId, threadId);
        return response?.data || response || {};
    }

    async sendThreadMessage(campaignId, threadId, message) {
        const response = await BrandCampaignRepository.sendThreadMessage(campaignId, threadId, message);
        return response?.data || response || {};
    }

    // Legal agreements methods
    async getLegalAgreements(campaignId) {
        try {
            const response = await BrandCampaignRepository.getLegalAgreements(campaignId);
            return response?.data || null;
        } catch (err) {
            // apiClient interceptor converts errors to { message, status, data } plain objects
            // 404 = creator is in underReview but no agreement entry yet
            if (err?.status === 404) return null;
            throw err;
        }
    }

    async acknowledgeLegalAgreement(campaignId, acknowledgement, creatorId = null) {
        const response = await BrandCampaignRepository.acknowledgeLegalAgreement(campaignId, acknowledgement, creatorId);
        return response?.data || response || {};
    }

    validateCampaignForm(form) {
        if (!form.name?.trim()) throw new Error('Campaign name is required');
        if (!form.product?.trim()) throw new Error('Product or service name is required');
        if (!form.deliverable) throw new Error('Select a content deliverable');
        if (!Array.isArray(form.platforms) || form.platforms.length === 0) {
            throw new Error('Select at least one platform');
        }
        if (!form.applicationDeadline) throw new Error('Application deadline is required');
        if (!form.startDate) throw new Error('Campaign start date is required');
        if (!form.endDate) throw new Error('Campaign end date is required');
        if (new Date(form.endDate) < new Date(form.startDate)) {
            throw new Error('Campaign end date must be on or after start date');
        }
        if (Number(form.creatorCount) < 1) throw new Error('Select at least one creator');
        if (Number(form.budgetMin) < 0 || Number(form.budgetMax) < 0) {
            throw new Error('Budget cannot be negative');
        }
        if (Number(form.budgetMin) > Number(form.budgetMax)) {
            throw new Error('Minimum budget cannot be greater than maximum budget');
        }
        if (!Array.isArray(form.baseTimelines) || form.baseTimelines.length === 0) {
            throw new Error('At least one timeline milestone is required');
        }
        for (const [index, tl] of form.baseTimelines.entries()) {
            if (!tl.title?.trim()) throw new Error(`Timeline item ${index + 1} needs a title`);
            if (!tl.deadline) throw new Error(`Timeline item ${index + 1} needs a deadline`);
        }
    }
}

export default new BrandCampaignService();
