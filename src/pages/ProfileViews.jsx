import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Lock, Crown, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserService from '../core/services/UserService';
import '../styles/ProfileViews.css';

const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.max(0, Math.floor((now - date) / 1000));
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// ─── View Item ────────────────────────────────────────────────────────────────

const ViewItem = ({ view, index }) => {
    const navigate = useNavigate();
    const [imgError, setImgError] = useState(false);

    const isLocked = view.locked;
    const username = view.entitySnapshot?.username || view.entitySnapshot?.brandName;
    const fullName = view.entitySnapshot?.name || view.entitySnapshot?.fullName;
    const profileImageUrl = view.entitySnapshot?.profileImageUrl;
    const showProfileImage = !isLocked && profileImageUrl && !imgError;
    const avatarLetter = username?.[0]?.toUpperCase() || '?';

    const handleClick = () => {
        if (!isLocked && view.sender) {
            navigate(`/user/${view.sender}`);
        }
    };

    return (
        <motion.div
            className={`pv-view-item ${isLocked ? 'pv-locked' : ''} ${!isLocked ? 'pv-clickable' : ''}`}
            onClick={handleClick}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.045, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={!isLocked ? { x: 4, transition: { duration: 0.2 } } : {}}
        >
            {/* ── Avatar + badge ── */}
            <div className="pv-avatar-wrap">
                <div className={`pv-avatar ${isLocked ? 'pv-locked-avatar' : 'pv-avatar-unlocked'}`}>
                    {showProfileImage ? (
                        <img
                            src={profileImageUrl}
                            alt={username || ''}
                            className="pv-avatar-img"
                            onError={() => setImgError(true)}
                        />
                    ) : isLocked ? (
                        <Lock size={18} strokeWidth={2} />
                    ) : (
                        avatarLetter
                    )}
                </div>
                <div className={`pv-badge ${isLocked ? 'pv-badge--locked' : ''}`}>
                    <Eye size={11} strokeWidth={2.5} />
                </div>
            </div>

            {/* ── Body ── */}
            <div className="pv-body">
                <p className="pv-username">
                    {isLocked ? 'Hidden User' : `@${username || 'Unknown'}`}
                </p>
                {!isLocked && fullName && (
                    <span className="pv-fullname">{fullName}</span>
                )}
                <span className="pv-view-subtitle">Viewed your profile</span>
                <span className="pv-time">{formatTime(view.createdAt)}</span>
                {isLocked && (
                    <span className="pv-locked-hint">
                        <Lock size={10} strokeWidth={2.5} />
                        Upgrade to unlock
                    </span>
                )}
            </div>

            {/* ── Locked overlay ── */}
            {isLocked && (
                <div className="pv-locked-overlay">
                    <Lock size={20} strokeWidth={2} />
                </div>
            )}

            {/* ── Right action ── */}
            <div className="pv-action">
                {isLocked ? (
                    <div className="pv-lock-icon">
                        <Lock size={15} strokeWidth={2} />
                    </div>
                ) : (
                    <div className="pv-arrow">
                        <ArrowRight size={15} strokeWidth={2} />
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const ProfileViews = () => {
    const navigate = useNavigate();
    const [views, setViews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadViews = async () => {
            try {
                setLoading(true);
                const response = await UserService.getProfileViews();
                setViews(response?.results || []);
            } catch (err) {
                console.error('Failed to load profile views:', err);
            } finally {
                setLoading(false);
            }
        };
        loadViews();
    }, []);

    const totalViews = views.length;
    const unlockedCount = views.filter((v) => !v.locked).length;
    const lockedCount = views.filter((v) => v.locked).length;
    const hasLocked = lockedCount > 0;

    return (
        <motion.div
            className="profile-views-page"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            {/* ── Hero ── */}
            <div className="pv-hero">
                <div className="pv-hero-mesh" aria-hidden />
                <div className="pv-hero-glow" aria-hidden />
                <div className="pv-hero-eye-decor" aria-hidden>
                    <Eye size={140} strokeWidth={0.8} />
                </div>
                <motion.div
                    className="pv-hero-inner"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                    <span className="pv-hero-pill">
                        <Eye size={14} strokeWidth={2.2} />
                        Insights
                    </span>
                    <h1 className="pv-hero-title">Profile Views</h1>
                    <p className="pv-hero-sub">
                        Discover who's been visiting your profile — unlock insights into your audience
                    </p>
                </motion.div>
            </div>

            {/* ── Content ── */}
            {loading ? (
                <div className="pv-loading">
                    <div className="pv-loading-spinner" />
                    Loading profile views…
                </div>
            ) : views.length === 0 ? (
                <motion.div
                    className="pv-empty"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                    <div className="pv-empty-icon">
                        <Eye size={32} strokeWidth={1.5} />
                    </div>
                    <h2>No profile views yet</h2>
                    <p>When someone views your profile, they'll appear here.<br />Share your profile to get started.</p>
                </motion.div>
            ) : (
                <>
                    {/* ── Summary Strip ── */}
                    <motion.div
                        className="pv-summary"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.14, duration: 0.45 }}
                    >
                        <div className="pv-summary-card">
                            <div className="pv-summary-icon pv-summary-icon--total">
                                <Eye size={20} strokeWidth={2} />
                            </div>
                            <div>
                                <div className="pv-summary-value">{totalViews}</div>
                                <div className="pv-summary-label">Total Views</div>
                            </div>
                        </div>
                        <div className="pv-summary-card">
                            <div className="pv-summary-icon pv-summary-icon--unlocked">
                                <Sparkles size={20} strokeWidth={2} />
                            </div>
                            <div>
                                <div className="pv-summary-value">{unlockedCount}</div>
                                <div className="pv-summary-label">Unlocked</div>
                            </div>
                        </div>
                        <div className="pv-summary-card">
                            <div className="pv-summary-icon pv-summary-icon--locked">
                                <Lock size={20} strokeWidth={2} />
                            </div>
                            <div>
                                <div className="pv-summary-value">{lockedCount}</div>
                                <div className="pv-summary-label">Locked</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Views List ── */}
                    <div className="pv-list">
                        <AnimatePresence>
                            {views.map((view, index) => (
                                <ViewItem
                                    key={view._id}
                                    view={view}
                                    index={index}
                                />
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* ── Upgrade CTA ── */}
                    {hasLocked && (
                        <motion.div
                            className="pv-upgrade-card"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35, duration: 0.5 }}
                        >
                            <div className="pv-upgrade-content">
                                <div className="pv-upgrade-icon">
                                    <Crown size={24} strokeWidth={2} />
                                </div>
                                <div className="pv-upgrade-text">
                                    <h3 className="pv-upgrade-title">Unlock all profile viewers</h3>
                                    <p className="pv-upgrade-desc">
                                        Upgrade to Pro to reveal every person who viewed your profile
                                    </p>
                                </div>
                            </div>
                            <button
                                className="pv-upgrade-btn"
                                onClick={() => navigate('/subscription')}
                            >
                                <Crown size={14} strokeWidth={2.5} />
                                Upgrade Plan
                            </button>
                        </motion.div>
                    )}
                </>
            )}
        </motion.div>
    );
};

export default ProfileViews;
