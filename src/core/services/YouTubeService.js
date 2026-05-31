import YouTubeRepository from '../repositories/YouTubeRepository';

const CACHE_KEY_PREFIX = 'yt_overview_';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

class YouTubeService {
    async getStatus() {
        return YouTubeRepository.getStatus();
    }

    async disconnectYouTube() {
        // Clear cached overview data before disconnecting
        this.clearCache();
        return YouTubeRepository.disconnectYouTube();
    }

    async getOverview(startDate, endDate, userId) {
        const cacheKey = `${CACHE_KEY_PREFIX}${userId || 'current'}_${startDate}_${endDate}`;
        const cached = this._readCache(cacheKey);
        if (cached) return cached;

        const data = await YouTubeRepository.getOverview(startDate, endDate, userId);
        this._writeCache(cacheKey, data);
        return data;
    }

    async getTopVideos(startDate, endDate, limit) {
        const cacheKey = `${CACHE_KEY_PREFIX}top_videos_${startDate || ''}_${endDate || ''}_${limit || ''}`;
        const cached = this._readCache(cacheKey);
        if (cached) return cached;

        const data = await YouTubeRepository.getTopVideos(startDate, endDate, limit);
        this._writeCache(cacheKey, data);
        return data;
    }

    /** Remove all cached YouTube overview entries from localStorage. */
    clearCache() {
        try {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(CACHE_KEY_PREFIX)) keysToRemove.push(key);
            }
            keysToRemove.forEach((k) => localStorage.removeItem(k));
        } catch {
            // ignore — storage may be unavailable
        }
    }

    _readCache(key) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return null;
            const { data, timestamp } = JSON.parse(raw);
            if (Date.now() - timestamp > CACHE_TTL_MS) {
                localStorage.removeItem(key);
                return null;
            }
            return data;
        } catch {
            return null;
        }
    }

    _writeCache(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
        } catch {
            // Storage quota exceeded — skip silently
        }
    }
}

export default new YouTubeService();
