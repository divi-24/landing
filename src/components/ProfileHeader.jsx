import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
    User, MessageCircle, MoreHorizontal, MapPin,
    Link as LinkIcon, ArrowLeft, Share2, Ban, Flag,
    Settings,
    Youtube, Instagram, Linkedin, Menu, PencilLine,
} from 'lucide-react';
import FollowListModal from './FollowListModal';
import ProfileBadge from './ProfileBadge';
import YouTubeSection from './YouTubeSection';
import '../styles/Profile.css';

const ProfileHeader = ({
    user,
    isOwnProfile,
    onFollow,
    onMessage,
    onEditProfile,
    onShareProfile,
    onBlock,
    onReport,
    onAvatarClick
}) => {
    const [showOptions, setShowOptions] = useState(false);
    const [followModal, setFollowModal] = useState({ isOpen: false, type: 'followers' });
    const [insightsOpen, setInsightsOpen] = useState(false);
    const [activePlatform, setActivePlatform] = useState('youtube');
    const navigate = useNavigate();
    const { avatar, fullName, username, bio, location, link, stats, isFollowing, followsMe, plan } = user;
    const userId = user._id || user.id;

    // Close menu on outside click
    useEffect(() => {
        if (!showOptions) return;
        const handleClickOutside = () => setShowOptions(false);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showOptions]);

    const openFollowModal = (type) => {
        setFollowModal({ isOpen: true, type });
    };

    const openPlatformInsights = (platform) => {
        setActivePlatform(platform);
        setInsightsOpen(true);
    };

    return (
        <div className={`profile-header${isOwnProfile ? ' profile-header--own' : ''}`}>
            {isOwnProfile && (
                <>
                    <button
                        type="button"
                        className="profile-corner-btn profile-corner-btn--left"
                        aria-label="Home"
                        title="Home"
                        onClick={() => navigate('/')}
                    >
                        <Menu size={22} strokeWidth={2} />
                    </button>
                    <Link to="/settings" className="profile-corner-btn profile-corner-btn--right" aria-label="Settings" title="Settings">
                        <Settings size={22} strokeWidth={2} />
                    </Link>
                </>
            )}

            {/* Back navigation for visitor view */}
            {!isOwnProfile && (
                <button className="profile-back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} />
                    <span>Back</span>
                </button>
            )}

            <div className="profile-header-top">
                <div className="profile-avatar-section">
                    <div
                        className="profile-avatar"
                        onClick={onAvatarClick}
                        style={{
                            ...(onAvatarClick ? { cursor: 'pointer' } : {}),
                            position: 'relative'
                        }}
                    >
                        {avatar ? (
                            <img
                                src={avatar}
                                alt={fullName}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div
                            className="profile-avatar-placeholder"
                            style={{
                                display: avatar ? 'none' : 'flex',
                                width: '100%',
                                height: '100%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-secondary)'
                            }}
                        >
                            <User size={48} />
                        </div>

                        {/* Plan Badge */}
                        {plan && plan !== 'free' && (
                            <div style={{
                                position: 'absolute',
                                bottom: '5%',
                                right: '5%',
                                zIndex: 2,
                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                            }}>
                                <ProfileBadge plan={plan} size={18} />
                            </div>
                        )}
                    </div>
                </div>

                <div className="profile-info-section">
                    <div className="profile-username-row">
                        <h1 className="profile-username" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {username}
                            {plan && plan !== 'free' && <ProfileBadge plan={plan} size={16} />}
                        </h1>

                        <div className="profile-actions">
                            {!isOwnProfile && (
                                <>
                                    <button
                                        className={`profile-follow-btn ${isFollowing ? 'following' : ''}`}
                                        onClick={() => { if (onFollow) onFollow(); }}
                                    >
                                        {isFollowing ? 'Following' : (followsMe ? 'Follow Back' : 'Follow')}
                                    </button>
                                    <button
                                        className="profile-message-btn"
                                        onClick={() => { if (onMessage) onMessage(); }}
                                    >
                                        <MessageCircle size={18} />
                                        Message
                                    </button>
                                </>
                            )}

                            {isOwnProfile && (
                                <button
                                    className="profile-edit-btn"
                                    onClick={onEditProfile}
                                >
                                    <PencilLine size={16} />
                                    Edit Profile
                                </button>
                            )}

                            {!isOwnProfile && (
                                <div className="profile-menu-container">
                                    <button
                                        className="profile-options-btn"
                                        onClick={(e) => { e.stopPropagation(); setShowOptions(!showOptions); }}
                                    >
                                        <MoreHorizontal size={20} />
                                    </button>

                                    <AnimatePresence>
                                        {showOptions && (
                                            <motion.div
                                                className="profile-options-menu"
                                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                transition={{ duration: 0.15 }}
                                            >
                                                <button onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (onShareProfile) onShareProfile();
                                                    setShowOptions(false);
                                                }}>
                                                    <Share2 size={16} />
                                                    Share Profile
                                                </button>
                                                <button onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (onBlock) onBlock();
                                                    setShowOptions(false);
                                                }}>
                                                    <Ban size={16} />
                                                    Block
                                                </button>
                                                <button className="danger" onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (onReport) onReport();
                                                    setShowOptions(false);
                                                }}>
                                                    <Flag size={16} />
                                                    Report
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="profile-bio">
                        {fullName && (
                            <p className="profile-fullname">
                                {fullName}
                                {bio ? <span className="profile-inline-dot">·</span> : null}
                                {bio ? <span className="profile-bio-inline">{bio}</span> : null}
                            </p>
                        )}
                        {!fullName && bio && <p className="profile-bio-text">{bio}</p>}
                        {location && (
                            <p className="profile-location">
                                <MapPin size={14} />
                                {location}
                            </p>
                        )}
                        {link && (
                            <a
                                href={link.startsWith('http') ? link : `https://${link}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="profile-website"
                            >
                                <LinkIcon size={14} />
                                {link.replace(/^https?:\/\//, '')}
                            </a>
                        )}
                    </div>

                    <div className="profile-stats profile-stats--segmented">
                        <div className="profile-stat">
                            <span className="stat-value">{stats?.collections?.toLocaleString() || '0'}</span>
                            <span className="stat-label">Collections</span>
                        </div>
                        <div 
                            className="profile-stat clickable" 
                            onClick={() => openFollowModal('followers')}
                        >
                            <span className="stat-value">{stats?.followers?.toLocaleString() || '0'}</span>
                            <span className="stat-label">Followers</span>
                        </div>
                        <div 
                            className="profile-stat clickable" 
                            onClick={() => openFollowModal('following')}
                        >
                            <span className="stat-value">{stats?.following?.toLocaleString() || '0'}</span>
                            <span className="stat-label">Following</span>
                        </div>
                    </div>

                    {isOwnProfile && (
                        <div className="profile-quick-actions">
                            <Link to="/profile-views" className="profile-quick-action-btn profile-quick-action-btn--active">
                                <span>Views</span>
                            </Link>
                            <Link to="/liked-products" className="profile-quick-action-btn">
                                <span>Liked</span>
                            </Link>
                            <Link to="/subscription" className="profile-quick-action-btn">
                                <span>Plans</span>
                            </Link>
                        </div>
                    )}

                    {isOwnProfile && (
                        <div className="profile-platform-insights">
                            <div className="profile-platform-insights-label">Platform Insights</div>
                            <div className="profile-platform-chips">
                                <button
                                    className={`profile-platform-chip ${activePlatform === 'youtube' ? 'active' : ''}`}
                                    onClick={() => openPlatformInsights('youtube')}
                                    type="button"
                                >
                                    <span className="platform-icon platform-icon--youtube"><Youtube size={13} /></span>
                                    <span>YouTube</span>
                                </button>
                                <button
                                    className={`profile-platform-chip ${activePlatform === 'instagram' ? 'active' : ''}`}
                                    onClick={() => openPlatformInsights('instagram')}
                                    type="button"
                                >
                                    <span className="platform-icon platform-icon--instagram"><Instagram size={13} /></span>
                                    <span>Instagram</span>
                                </button>
                                <button
                                    className={`profile-platform-chip ${activePlatform === 'linkedin' ? 'active' : ''}`}
                                    onClick={() => openPlatformInsights('linkedin')}
                                    type="button"
                                >
                                    <span className="platform-icon platform-icon--linkedin"><Linkedin size={13} /></span>
                                    <span>LinkedIn</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <FollowListModal
                isOpen={followModal.isOpen}
                onClose={() => setFollowModal({ ...followModal, isOpen: false })}
                userId={userId}
                type={followModal.type}
                username={username}
            />

            <AnimatePresence>
                {insightsOpen && (
                    <motion.div
                        className="profile-insights-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setInsightsOpen(false)}
                    >
                        <motion.div
                            className="profile-insights-modal"
                            initial={{ opacity: 0, y: 24, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 12, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="profile-insights-modal-head">
                                <strong>Platform Analytics</strong>
                                <button type="button" onClick={() => setInsightsOpen(false)}>Close</button>
                            </div>
                            <div className="profile-insights-tabs">
                                <button className={activePlatform === 'youtube' ? 'active' : ''} onClick={() => setActivePlatform('youtube')}><Youtube size={14} />YouTube</button>
                                <button className={activePlatform === 'instagram' ? 'active' : ''} onClick={() => setActivePlatform('instagram')}><Instagram size={14} />Instagram</button>
                                <button className={activePlatform === 'linkedin' ? 'active' : ''} onClick={() => setActivePlatform('linkedin')}><Linkedin size={14} />LinkedIn</button>
                            </div>
                            {activePlatform === 'youtube' ? (
                                <div className="profile-insights-panel"><YouTubeSection /></div>
                            ) : (
                                <div className="profile-insights-placeholder">
                                    <h4>{activePlatform === 'instagram' ? 'Instagram' : 'LinkedIn'} insights</h4>
                                    <p>Platform analytics panel is ready to plug in. Connect this platform to view reach, engagement, and trend insights here.</p>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfileHeader;
