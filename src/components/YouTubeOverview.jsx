import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Eye, Clock, ThumbsUp, TrendingUp, RefreshCw } from 'lucide-react';
import YouTubeService from '../core/services/YouTubeService';
import '../styles/YouTube.css';

// ─── Stat Card ─────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="yt-stat-card">
        <div className="yt-stat-icon" style={{ background: `${color}18`, color }}>
            <Icon size={18} />
        </div>
        <div>
            <div className="yt-stat-value">{Number(value).toLocaleString()}</div>
            <div className="yt-stat-label">{label}</div>
        </div>
    </div>
);

// ─── Main Component ────────────────────────────────────────────────────────
const YouTubeOverview = () => {
    const today = new Date().toISOString().split('T')[0];
    const fourWeeksAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(fourWeeksAgo);
    const [endDate, setEndDate] = useState(today);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchOverview = useCallback(async (start, end, forceRefresh = false) => {
        setLoading(true);
        setError(null);
        try {
            if (forceRefresh) {
                const cacheKey = `yt_overview_${start}_${end}`;
                localStorage.removeItem(cacheKey);
            }
            const result = await YouTubeService.getOverview(start, end);
            setData(result);
        } catch (err) {
            setError(err.message || 'Failed to load YouTube overview');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOverview(startDate, endDate);
    }, [startDate, endDate, fetchOverview]);

    const handleApply = () => fetchOverview(startDate, endDate, true);

    if (loading) {
        return (
            <div className="yt-overview-loading">
                <div className="yt-spinner" />
                <span>Loading YouTube analytics…</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="yt-overview-error">
                <span>{error}</span>
                <button className="yt-retry-btn" onClick={() => fetchOverview(startDate, endDate, true)}>
                    <RefreshCw size={14} /> Retry
                </button>
            </div>
        );
    }

    if (!data) return null;

    // API returns: { views, likes, comments, estimatedMinutesWatched }
    const { views = 0, likes = 0, comments = 0, estimatedMinutesWatched = 0 } = data;

    return (
        <motion.div
            className="yt-overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            {/* Date picker */}
            <div className="yt-date-row">
                <div className="yt-date-group">
                    <label className="yt-date-label">From</label>
                    <input
                        type="date"
                        value={startDate}
                        max={endDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="yt-date-input"
                    />
                </div>
                <div className="yt-date-group">
                    <label className="yt-date-label">To</label>
                    <input
                        type="date"
                        value={endDate}
                        min={startDate}
                        max={today}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="yt-date-input"
                    />
                </div>
                <button className="yt-apply-btn" onClick={handleApply}>
                    Apply
                </button>
                <button
                    className="yt-refresh-btn"
                    onClick={() => fetchOverview(startDate, endDate, true)}
                    title="Refresh data"
                >
                    <RefreshCw size={15} />
                </button>
            </div>

            {/* Summary stats */}
            <div className="yt-stats-grid">
                <StatCard icon={Eye} label="Views" value={views} color="#FF0000" />
                <StatCard icon={Clock} label="Watch Minutes" value={estimatedMinutesWatched} color="#7C3AED" />
                <StatCard icon={ThumbsUp} label="Likes" value={likes} color="#F0057A" />
                <StatCard icon={TrendingUp} label="Comments" value={comments} color="#10B981" />
            </div>
        </motion.div>
    );
};

export default YouTubeOverview;
