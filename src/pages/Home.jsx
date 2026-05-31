import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, User, TrendingUp, Plus } from 'lucide-react';
import ProductFeed from '../components/ProductFeed';
import FloatingActionButton from '../components/FloatingActionButton';
import OnboardingModal from '../components/OnboardingModal';
import UserService from '../core/services/UserService';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { API_CONFIG } from '../core/config/apiConfig';
import '../styles/Home.css';

function resolveProfileImageSrc(url) {
    if (!url || typeof url !== 'string') return null;
    const u = url.trim();
    if (!u) return null;
    if (u.startsWith('http') || u.startsWith('data:')) return u;
    return API_CONFIG.BASE_URL + u;
}

const getTimeGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
};

const Home = () => {
    const { user, isAuthenticated } = useAuth();
    const { unreadCount } = useNotifications();

    const [me, setMe] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) { setMe(null); return; }
        let cancelled = false;
        (async () => {
            try {
                const profile = await UserService.getUserProfile();
                if (!cancelled) {
                    setMe(profile);
                    const skipped = sessionStorage.getItem('dropp_onboarding_skipped');
                    if (!skipped && !profile.gender && (!profile.interests || profile.interests.length === 0)) {
                        setShowOnboarding(true);
                    }
                }
            } catch { if (!cancelled) setMe(null); }
        })();
        return () => { cancelled = true; };
    }, [isAuthenticated]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await UserService.getAnalytics();
                if (!cancelled) setAnalytics(res?.analytics || null);
            } catch { /* noop */ }
        })();
        return () => { cancelled = true; };
    }, []);

    const avatarUrl = resolveProfileImageSrc(me?.profileImageUrl ?? user?.profileImageUrl);
    const firstName = me?.fullName?.split(' ')?.[0] || user?.fullName?.split(' ')?.[0] || me?.username || user?.username || 'Creator';

    const totalDrops = analytics?.products?.total_products ?? 0;
    const totalCollections = analytics?.collections?.total_collections ?? 0;
    const totalLikes = analytics?.products?.likes_count ?? 0;
    const totalViews = analytics?.collections?.total_views ?? 0;

    return (
        <motion.div
            className="home-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
        >
            {/* ── Sticky top bar ── */}
            <header className="hf-topbar">
                <span className="hf-topbar-title">Discover</span>
                <div className="hf-topbar-right">
                    <Link to="/notifications" className="hf-topbar-icon-btn" aria-label="Notifications">
                        <Bell size={18} strokeWidth={2} />
                        {unreadCount > 0 && (
                            <span className="hf-notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                        )}
                    </Link>
                </div>
            </header>

            {/* ── Profile hero card ── */}
            <div className="hf-hero-card">
                <div className="hf-hero-glow" aria-hidden="true" />

                <div className="hf-hero-left">
                    <Link to="/profile" className="hf-hero-avatar-link">
                        <div className="hf-hero-avatar">
                            {avatarUrl
                                ? <img src={avatarUrl} alt={firstName} />
                                : <span className="hf-hero-avatar-fallback">
                                    {firstName ? firstName[0].toUpperCase() : <User size={22} strokeWidth={1.5} />}
                                </span>
                            }
                            <span className="hf-hero-avatar-ring" aria-hidden="true" />
                        </div>
                    </Link>

                    <div className="hf-hero-info">
                        <p className="hf-hero-greeting">{getTimeGreeting()}</p>
                        <h2 className="hf-hero-name">{firstName}</h2>
                        <p className="hf-hero-tagline">curate &middot; share &middot; earn</p>
                    </div>
                </div>

                <div className="hf-hero-right">
                    <div className="hf-stats-grid">
                        <div className="hf-stat">
                            <span className="hf-stat-value">{totalDrops}</span>
                            <span className="hf-stat-label">Drops</span>
                        </div>
                        <div className="hf-stat">
                            <span className="hf-stat-value">{totalCollections}</span>
                            <span className="hf-stat-label">Collections</span>
                        </div>
                        <div className="hf-stat">
                            <span className="hf-stat-value">{totalLikes}</span>
                            <span className="hf-stat-label">Likes</span>
                        </div>
                        <div className="hf-stat">
                            <span className="hf-stat-value">{totalViews > 999 ? `${(totalViews / 1000).toFixed(1)}k` : totalViews}</span>
                            <span className="hf-stat-label">Views</span>
                        </div>
                    </div>

                    <div className="hf-hero-actions">
                        <Link to="/analytics" className="hf-hero-action-btn hf-hero-action-btn--ghost">
                            <TrendingUp size={13} strokeWidth={2.2} />
                            Analytics
                        </Link>
                        <Link to="/collection" className="hf-hero-action-btn hf-hero-action-btn--primary">
                            <Plus size={13} strokeWidth={2.5} />
                            New Drop
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── Shared product feed (same as brand portal explore) ── */}
            <ProductFeed defaultTab="brand" />

            <FloatingActionButton />

            {showOnboarding && (
                <OnboardingModal
                    onClose={() => setShowOnboarding(false)}
                    onComplete={async () => {
                        try { setMe(await UserService.getUserProfile()); }
                        catch { /* noop */ }
                    }}
                />
            )}
        </motion.div>
    );
};

export default Home;
