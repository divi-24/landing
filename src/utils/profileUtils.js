import { API_CONFIG } from '../core/config/apiConfig';

export const resolveMediaUrl = (value) => {
    if (!value) return null;
    const url = typeof value === 'object' ? value.url : value;
    if (!url || typeof url !== 'string') return null;
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    return `${API_CONFIG.BASE_URL}${url}`;
};

export const getProfileImageUrl = (profile = {}) => (
    resolveMediaUrl(
        profile.profileImageUrl ||
        profile.profilePicture ||
        profile.avatar ||
        profile.image ||
        profile.logoUrl ||
        profile.logo
    )
);

export const getDisplayName = (profile = {}, fallback = 'Creator') => (
    profile.fullName ||
    profile.name ||
    profile.brandName ||
    profile.username ||
    fallback
);

export const getEntityId = (entity = {}) => entity._id || entity.id;

export const getCount = (value) => {
    if (Array.isArray(value)) return value.length;
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
};
