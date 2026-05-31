import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, MapPin, Globe, ArrowLeft, Share2,
    Settings, PencilLine, MessageCircle, MoreHorizontal,
    Bookmark, Calendar,
    Youtube, Instagram, Linkedin, Twitter,
    BarChart2, ExternalLink, Ban, Flag,
    ShieldCheck, Star, Zap, FileText, Receipt, Crown, Package, TrendingUp,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import UserService from '../core/services/UserService';
import CollectionService from '../core/services/CollectionService';
import ProfileBadge from '../components/ProfileBadge';
import YouTubeSection from '../components/YouTubeSection';
import ProfileTabs from '../components/ProfileTabs';
import EditProfileModal from '../components/EditProfileModal';
import FollowListModal from '../components/FollowListModal';
import FloatingActionButton from '../components/FloatingActionButton';
import { ShimmerProfileHeader, ShimmerCollectionGrid } from '../components/Shimmer';
import Snackbar from '../components/Snackbar';
import { getCount } from '../utils/profileUtils';
import '../styles/CreatorPortfolio.css';
import '../styles/Profile.css';
import '../styles/YouTube.css';

// ─── Verified Creator badge ───────────────────────────────────────────────────
const VerifiedBadge = ({ plan }) => {
    if (!plan || plan === 'free') return null;
    const isPro = plan.toLowerCase() === 'pro';
    return (
        <motion.span
            className={`pf-verified-badge${isPro ? ' pf-verified-badge--pro' : ''}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.25, type: 'spring', stiffness: 260 }}
            title={`Verified ${isPro ? 'Pro' : 'Lite'} Creator`}
        >
            {isPro ? <Star size={11} strokeWidth={2.5} /> : <ShieldCheck size={11} strokeWidth={2.5} />}
            Verified Creator
        </motion.span>
    );
};

// ─── Platform placeholder ─────────────────────────────────────────────────────
const PlatformPlaceholder = ({ platform, socialUrl }) => {
    const cfg = {
        instagram: {
            Icon: Instagram, iconClass: 'pf-ig-icon',
            title: 'Instagram Analytics',
            msg: 'Connect your Instagram to display reach, impressions and engagement data.',
            btnClass: 'cp2-ext-btn--ig', btnLabel: 'View Profile',
        },
        linkedin: {
            Icon: Linkedin, iconClass: 'pf-li-icon',
            title: 'LinkedIn Analytics',
            msg: 'Connect your LinkedIn to display profile views, post reach and network insights.',
            btnClass: 'cp2-ext-btn--li', btnLabel: 'View Profile',
        },
    }[platform];
    if (!cfg) return null;
    const { Icon, iconClass, title, msg, btnClass, btnLabel } = cfg;
    return (
        <div className="cp2-panel-state cp2-panel-state--col cp2-panel-state--placeholder">
            <div className={`cp2-platform-icon-wrap ${iconClass}`}><Icon size={22} /></div>
            <p className="cp2-panel-title">{title}</p>
            <p className="cp2-panel-msg">{msg}</p>
            {socialUrl && (
                <a href={socialUrl} target="_blank" rel="noopener noreferrer" className={`cp2-ext-btn ${btnClass}`}>
                    <ExternalLink size={13} /> {btnLabel}
                </a>
            )}
        </div>
    );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const Profile = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const { user: authUser } = useAuth();

    const [profile, setProfile] = useState(null);
    const [profileCollections, setProfileCollections] = useState([]);
    const [sharedCollections, setSharedCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isOwnProfile, setIsOwnProfile] = useState(username === 'me' || !username);

    const [activeTab, setActiveTab] = useState('youtube');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [followModal, setFollowModal] = useState({ isOpen: false, type: 'followers' });
    const [showOptions, setShowOptions] = useState(false);
    const [snackbar, setSnackbar] = useState({ show: false, message: '', type: 'success' });
    const [transactions, setTransactions] = useState([]);

    // ── Load ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const currentUser = await UserService.getUserProfile().catch(() => null);
                let data;

                if (username === 'me' || !username) {
                    data = currentUser;
                    setIsOwnProfile(true);
                } else {
                    const res = await UserService.getUserByUsername(username);
                    data = res.result || res.user || res;
                    if (currentUser && data &&
                        (currentUser._id === data._id || currentUser.id === data.id)) {
                        navigate('/profile/me', { replace: true });
                        return;
                    }
                    setIsOwnProfile(false);
                }

                if (!data) throw new Error('Profile not found');
                setProfile(data);

                const uid = data._id || data.id;
                const isOwn = username === 'me' || !username ||
                    (currentUser && (currentUser._id === data._id || currentUser.id === data.id));
                if (uid) {
                    if (isOwn) {
                        const { result, sharedCollections: shared } = await CollectionService.getMyCollections();
                        setProfileCollections(result);
                        setSharedCollections(shared);
                        UserService.getSubscriptionTransactions()
                            .then(setTransactions)
                            .catch(() => setTransactions([]));
                    } else {
                        setProfileCollections(await CollectionService.getUserCollections(uid));
                    }
                }
            } catch (e) {
                setError(e.response?.data?.message || e.message || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [username, navigate]);

    // ── Actions ───────────────────────────────────────────────────────────────
    const handleFollow = async () => {
        const id = profile?._id || profile?.id;
        if (!id || isOwnProfile) return;
        const was = profile.isFollowing === true;
        setProfile(p => ({ ...p, isFollowing: !was, followers: Math.max(0, (Number(p.followers) || 0) + (was ? -1 : 1)) }));
        try {
            await UserService.followUser(id);
            setSnackbar({ show: true, message: was ? `Unfollowed @${profile.username}` : `Following @${profile.username}`, type: 'success' });
        } catch (e) {
            setProfile(p => ({ ...p, isFollowing: was, followers: Math.max(0, (Number(p.followers) || 0) + (was ? 1 : -1)) }));
            setSnackbar({ show: true, message: e.message || 'Failed to update follow', type: 'error' });
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setSnackbar({ show: true, message: 'Profile link copied!', type: 'success' });
    };

    const refreshProfile = async () => {
        try { setProfile(await UserService.getUserProfile()); } catch { /* silent */ }
    };

    const refreshCollections = async () => {
        if (!profile) return;
        try {
            const uid = profile._id || profile.id;
            if (isOwnProfile) {
                const { result, sharedCollections: shared } = await CollectionService.getMyCollections();
                setProfileCollections(result);
                setSharedCollections(shared);
            } else {
                setProfileCollections(await CollectionService.getUserCollections(uid));
            }
        } catch { /* silent */ }
    };

    const handleCollectionUpdate = (id, updated) =>
        setProfileCollections(prev => prev.map(c => (c._id === id || c.id === id) ? { ...c, ...updated } : c));

    useEffect(() => {
        if (!showOptions) return;
        const close = () => setShowOptions(false);
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, [showOptions]);

    // ── Loading / error ───────────────────────────────────────────────────────
    if (loading) return (
        <div className="profile-page">
            <div className="profile-container">
                <ShimmerProfileHeader />
                <div style={{ padding: '0 1.5rem' }}><ShimmerCollectionGrid count={6} /></div>
            </div>
        </div>
    );

    if (error) return (
        <div className="cp2-fullscreen-center cp2-fullscreen-center--col">
            <p className="cp2-error-title">Couldn't load profile</p>
            <p className="cp2-error-msg">{error}</p>
            <button className="cp2-ghost-btn" onClick={() => navigate(-1)}><ArrowLeft size={14} /> Go back</button>
        </div>
    );

    if (!profile) return null;

    const {
        fullName, username: uname, bio, location, website, profileImageUrl,
        interests = [], followers = 0, following = 0,
        socialLinks = {}, subscription = {}, analytics = {},
        gender, pronoun, createdAt, plan, isFollowing, followsMe, mediaKitLink,
    } = profile;

    const userId = profile._id || profile.id;
    const planLabel = subscription?.plan || plan || 'free';
    const isVerified = planLabel && planLabel !== 'free';
    const isFreePlan = !planLabel || planLabel === 'free';
    const collectionCount = profileCollections.length;
    const productCount = analytics?.products?.count || 0;
    const productRows = analytics?.products?.data || [];
    const topCollections = [...profileCollections]
        .sort((a, b) => (getCount(b.views) + getCount(b.likes)) - (getCount(a.views) + getCount(a.likes)))
        .slice(0, 3);
    const topProducts = [...productRows]
        .sort((a, b) => (getCount(b.views) + getCount(b.likes)) - (getCount(a.views) + getCount(a.likes)))
        .slice(0, 3);
    const todayKey = new Date().toDateString();
    const todaysCheckouts = transactions.filter(t => t?.createdAt && new Date(t.createdAt).toDateString() === todayKey);
    const lastCheckout = transactions[0];
    const joinedDate = createdAt
        ? new Date(createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : null;

    const hasSocialLinks = socialLinks.youtube || socialLinks.instagram || socialLinks.linkedin || socialLinks.twitter;

    const ANALYTICS_TABS = [
        { id: 'youtube', label: 'YouTube', Icon: Youtube },
        { id: 'instagram', label: 'Instagram', Icon: Instagram },
        { id: 'linkedin', label: 'LinkedIn', Icon: Linkedin },
    ];

    return (
        <motion.div className="cp2-page"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>

            {/* ── TOP NAV ─────────────────────────────────────────────────── */}
            <div className="cp2-topnav">
                <div className="cp2-topnav-inner">
                    {!isOwnProfile ? (
                        <button className="cp2-icon-btn"
                            onClick={() => navigate(-1)}
                            aria-label="Back">
                            <ArrowLeft size={18} />
                        </button>
                    ) : <span className="cp2-topnav-spacer" />}
                    <div className="pf-topnav-right">
                        {isOwnProfile && (
                            <Link to="/settings" className="cp2-icon-btn" aria-label="Settings">
                                <Settings size={17} />
                            </Link>
                        )}
                        <button className="cp2-share-btn" onClick={handleShare}>
                            <Share2 size={14} /><span>Share</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ── HERO ────────────────────────────────────────────────────── */}
            <div className="cp2-hero pf-hero">
                <div className="pf-hero-inner">

                    {/* ── Left col: avatar ── */}
                    <div className="pf-avatar-col">
                        <div className="cp2-avatar-wrap">
                            {profileImageUrl ? (
                                <img src={profileImageUrl} alt={fullName || uname} className="cp2-avatar pf-avatar" />
                            ) : (
                                <div className="cp2-avatar pf-avatar cp2-avatar--placeholder">
                                    <User size={40} strokeWidth={1.5} />
                                </div>
                            )}
                            {isVerified && (
                                <div className="cp2-avatar-badge">
                                    <ProfileBadge plan={planLabel} size={15} />
                                </div>
                            )}
                        </div>

                        {/* Action buttons below avatar on desktop */}
                        <div className="pf-actions pf-actions--desktop">
                            {isOwnProfile ? (
                                <button className="pf-btn pf-btn--edit pf-btn--full" onClick={() => setIsEditModalOpen(true)}>
                                    <PencilLine size={14} /> Edit Profile
                                </button>
                            ) : (
                                <>
                                    <button className={`pf-btn pf-btn--full${isFollowing ? ' pf-btn--following' : ' pf-btn--follow'}`} onClick={handleFollow}>
                                        {isFollowing ? 'Following' : (followsMe ? 'Follow Back' : 'Follow')}
                                    </button>
                                    <button className="pf-btn pf-btn--message pf-btn--full"
                                        onClick={() => setSnackbar({ show: true, message: 'Messages coming soon.', type: 'info' })}>
                                        <MessageCircle size={14} /> Message
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ── Right col: identity ── */}
                    <div className="pf-identity-col">

                        {/* Name + verified */}
                        <div className="pf-name-row">
                            <h1 className="cp2-name">{fullName || uname}</h1>
                            {isVerified && <VerifiedBadge plan={planLabel} />}
                        </div>

                        <p className="cp2-handle">@{uname}</p>

                        {bio && <p className="cp2-bio pf-bio">{bio}</p>}

                        {/* Meta line */}
                        <div className="cp2-meta">
                            {location && (
                                <span className="cp2-meta-item"><MapPin size={13} strokeWidth={2} />{location}</span>
                            )}
                            {website && (
                                <a href={website.startsWith('http') ? website : `https://${website}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="cp2-meta-item cp2-meta-item--link">
                                    <Globe size={13} strokeWidth={2} />
                                    {website.replace(/^https?:\/\//, '')}
                                </a>
                            )}
                            {joinedDate && (
                                <span className="cp2-meta-item"><Calendar size={13} strokeWidth={2} />{joinedDate}</span>
                            )}
                        </div>

                        {/* Niche / content categories */}
                        {interests.length > 0 && (
                            <div className="pf-niche-row">
                                {interests.map(t => (
                                    <span key={t} className="pf-niche-tag">{t}</span>
                                ))}
                            </div>
                        )}

                        {/* Social links */}
                        {hasSocialLinks && (
                            <div className="cp2-socials pf-socials">
                                {socialLinks.youtube && (
                                    <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer"
                                        className="cp2-social-btn cp2-social-btn--yt">
                                        <Youtube size={14} /><span>YouTube</span>
                                    </a>
                                )}
                                {socialLinks.instagram && (
                                    <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                                        className="cp2-social-btn cp2-social-btn--ig">
                                        <Instagram size={14} /><span>Instagram</span>
                                    </a>
                                )}
                                {socialLinks.linkedin && (
                                    <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                                        className="cp2-social-btn cp2-social-btn--li">
                                        <Linkedin size={14} /><span>LinkedIn</span>
                                    </a>
                                )}
                                {socialLinks.twitter && (
                                    <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                                        className="cp2-social-btn cp2-social-btn--tw">
                                        <Twitter size={14} /><span>Twitter</span>
                                    </a>
                                )}
                            </div>
                        )}

                        {/* Stats */}
                        <div className="pf-stats-row">
                            <button className="pf-stat-item" onClick={() => setFollowModal({ isOpen: true, type: 'followers' })}>
                                <span className="pf-stat-val">{Number(followers).toLocaleString()}</span>
                                <span className="pf-stat-lbl">Followers</span>
                            </button>
                            <div className="pf-stat-div" />
                            <button className="pf-stat-item" onClick={() => setFollowModal({ isOpen: true, type: 'following' })}>
                                <span className="pf-stat-val">{Number(following).toLocaleString()}</span>
                                <span className="pf-stat-lbl">Following</span>
                            </button>
                            <div className="pf-stat-div" />
                            <div className="pf-stat-item pf-stat-item--static">
                                <span className="pf-stat-val">{collectionCount}</span>
                                <span className="pf-stat-lbl">Collections</span>
                            </div>
                            {productCount > 0 && (
                                <>
                                    <div className="pf-stat-div" />
                                    <div className="pf-stat-item pf-stat-item--static">
                                        <span className="pf-stat-val">{productCount}</span>
                                        <span className="pf-stat-lbl">Products</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Mobile action buttons */}
                        <div className="pf-actions pf-actions--mobile">
                            {isOwnProfile ? (
                                <button className="pf-btn pf-btn--edit pf-btn--full" onClick={() => setIsEditModalOpen(true)}>
                                    <PencilLine size={14} /> Edit Profile
                                </button>
                            ) : (
                                <>
                                    <button className={`pf-btn pf-btn--flex${isFollowing ? ' pf-btn--following' : ' pf-btn--follow'}`} onClick={handleFollow}>
                                        {isFollowing ? 'Following' : (followsMe ? 'Follow Back' : 'Follow')}
                                    </button>
                                    <button className="pf-btn pf-btn--message pf-btn--flex"
                                        onClick={() => setSnackbar({ show: true, message: 'Messages coming soon.', type: 'info' })}>
                                        <MessageCircle size={14} /> Message
                                    </button>
                                </>
                            )}
                            {!isOwnProfile && (
                                <div className="pf-options-wrap">
                                    <button className="pf-btn pf-btn--icon"
                                        onClick={e => { e.stopPropagation(); setShowOptions(v => !v); }}>
                                        <MoreHorizontal size={18} />
                                    </button>
                                    <AnimatePresence>
                                        {showOptions && (
                                            <motion.div className="pf-options-menu"
                                                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                                                transition={{ duration: 0.13 }}>
                                                <button onClick={e => { e.stopPropagation(); handleShare(); setShowOptions(false); }}>
                                                    <Share2 size={14} /> Share profile
                                                </button>
                                                <button onClick={e => { e.stopPropagation(); setSnackbar({ show: true, message: 'User blocked.', type: 'success' }); setShowOptions(false); }}>
                                                    <Ban size={14} /> Block
                                                </button>
                                                <button className="pf-options-menu__danger"
                                                    onClick={e => { e.stopPropagation(); setSnackbar({ show: true, message: 'Report submitted.', type: 'success' }); setShowOptions(false); }}>
                                                    <Flag size={14} /> Report
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>

                    </div>{/* /identity-col */}
                </div>
            </div>

            {/* ── CONTENT ─────────────────────────────────────────────────── */}
            <div className="cp2-content-wrap pf-content-wrap">
                {isOwnProfile && isFreePlan && (
                    <div className="cp2-upgrade-cta">
                        <div className="cp2-upgrade-icon"><Crown size={18} /></div>
                        <div>
                            <strong>Build a sharper creator storefront</strong>
                            <span>Unlock advanced analytics, profile views, verified badge, and priority brand deals.</span>
                        </div>
                        <button onClick={() => navigate('/subscription')}>Upgrade</button>
                    </div>
                )}

                {/* Platform Analytics */}
                <div className="cp2-card">
                    <div className="cp2-card-header">
                        <BarChart2 size={16} className="cp2-card-header-icon" />
                        <h2 className="cp2-card-title">Platform Analytics</h2>
                    </div>
                    <div className="cp2-tabs pf-analytics-tabs">
                        {ANALYTICS_TABS.map(({ id, label, Icon }) => (
                            <button key={id}
                                className={`cp2-tab${activeTab === id ? ' cp2-tab--active' : ''}`}
                                onClick={() => setActiveTab(id)}>
                                <Icon size={14} />{label}
                            </button>
                        ))}
                    </div>
                    <div className="pf-analytics-body">
                        <AnimatePresence mode="wait">
                            <motion.div key={activeTab}
                                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.16 }}>
                                {activeTab === 'youtube' && (
                                    isOwnProfile
                                        ? <div className="pf-yt-wrap"><YouTubeSection /></div>
                                        : (
                                            <div className="cp2-panel-state cp2-panel-state--col">
                                                <Youtube size={28} style={{ color: '#FF0000', opacity: 0.7 }} />
                                                <p className="cp2-panel-title">YouTube</p>
                                                <p className="cp2-panel-msg">Analytics are private. Only the creator can view detailed insights.</p>
                                                {socialLinks.youtube && (
                                                    <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="cp2-ext-btn">
                                                        <ExternalLink size={13} /> View Channel
                                                    </a>
                                                )}
                                            </div>
                                        )
                                )}
                                {activeTab === 'instagram' && (
                                    isOwnProfile
                                        ? <PlatformPlaceholder platform="instagram" socialUrl={socialLinks.instagram} />
                                        : (
                                            <div className="cp2-panel-state cp2-panel-state--col">
                                                <Instagram size={28} style={{ color: '#E1306C', opacity: 0.7 }} />
                                                <p className="cp2-panel-title">Instagram</p>
                                                <p className="cp2-panel-msg">Analytics are private.</p>
                                                {socialLinks.instagram && (
                                                    <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="cp2-ext-btn cp2-ext-btn--ig">
                                                        <ExternalLink size={13} /> View Profile
                                                    </a>
                                                )}
                                            </div>
                                        )
                                )}
                                {activeTab === 'linkedin' && (
                                    isOwnProfile
                                        ? <PlatformPlaceholder platform="linkedin" socialUrl={socialLinks.linkedin} />
                                        : (
                                            <div className="cp2-panel-state cp2-panel-state--col">
                                                <Linkedin size={28} style={{ color: '#0A66C2', opacity: 0.7 }} />
                                                <p className="cp2-panel-title">LinkedIn</p>
                                                <p className="cp2-panel-msg">Analytics are private.</p>
                                                {socialLinks.linkedin && (
                                                    <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="cp2-ext-btn cp2-ext-btn--li">
                                                        <ExternalLink size={13} /> View Profile
                                                    </a>
                                                )}
                                            </div>
                                        )
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                <div className="cp2-card">
                    <div className="cp2-card-header">
                        <TrendingUp size={16} className="cp2-card-header-icon" />
                        <h2 className="cp2-card-title">Creator Portfolio</h2>
                    </div>
                    <div className="cp2-portfolio-grid">
                        <div className="cp2-mini-panel">
                            <div className="cp2-mini-panel-title"><Receipt size={14} />Daily checkout history</div>
                            <strong>{todaysCheckouts.length}</strong>
                            <span>{lastCheckout ? `Last checkout ${new Date(lastCheckout.createdAt || lastCheckout.date).toLocaleDateString()}` : 'No subscription checkouts yet'}</span>
                            {isOwnProfile && <button onClick={() => navigate('/transactions')}>View history</button>}
                        </div>
                        <div className="cp2-mini-panel">
                            <div className="cp2-mini-panel-title"><Bookmark size={14} />Top collections</div>
                            {topCollections.length ? topCollections.map(col => (
                                <Link key={col._id || col.id} to={`/c/${col._id || col.id}`} className="cp2-rank-row">
                                    <span>{col.title || col.name || 'Untitled'}</span>
                                    <strong>{getCount(col.views)} views</strong>
                                </Link>
                            )) : <span>No collection activity yet</span>}
                        </div>
                        <div className="cp2-mini-panel">
                            <div className="cp2-mini-panel-title"><Package size={14} />Top products</div>
                            {topProducts.length ? topProducts.map(item => (
                                <div key={item.id || item._id || item.name} className="cp2-rank-row">
                                    <span>{item.name || item.title || 'Product'}</span>
                                    <strong>{getCount(item.likes)} likes</strong>
                                </div>
                            )) : <span>Product analytics will appear after views and likes</span>}
                        </div>
                        <div className="cp2-mini-panel">
                            <div className="cp2-mini-panel-title"><Zap size={14} />Brand deals</div>
                            <strong>{isVerified ? 'Priority' : 'Starter'}</strong>
                            <span>{isVerified ? 'Your profile is ready for higher-intent campaigns.' : 'Upgrade to raise your visibility in brand discovery.'}</span>
                            <button onClick={() => navigate('/campaigns')}>Explore deals</button>
                        </div>
                    </div>
                </div>

                <div className="cp2-card">
                    <div className="cp2-card-header">
                        <FileText size={16} className="cp2-card-header-icon" />
                        <h2 className="cp2-card-title">Media Kit</h2>
                        {isOwnProfile && (
                            <button className="cp2-inline-action" onClick={() => setIsEditModalOpen(true)}>
                                <PencilLine size={13} />Edit
                            </button>
                        )}
                    </div>
                    {mediaKitLink ? (
                        <div className="cp2-media-kit">
                            {String(mediaKitLink).includes('.pdf') || String(mediaKitLink).startsWith('data:application/pdf') ? (
                                <iframe src={mediaKitLink} title={`${fullName || uname} media kit`} />
                            ) : (
                                <div className="cp2-panel-state cp2-panel-state--col">
                                    <FileText size={28} />
                                    <p className="cp2-panel-title">Media kit ready</p>
                                </div>
                            )}
                            <a href={mediaKitLink} target="_blank" rel="noopener noreferrer" className="cp2-ext-btn">
                                <ExternalLink size={13} /> Open media kit
                            </a>
                        </div>
                    ) : (
                        <div className="cp2-panel-state cp2-panel-state--col">
                            <FileText size={28} />
                            <p className="cp2-panel-title">No media kit added</p>
                            <p className="cp2-panel-msg">{isOwnProfile ? 'Create one by adding a PDF link or uploading a PDF from Edit Profile.' : 'This creator has not shared a media kit yet.'}</p>
                            {isOwnProfile && (
                                <button className="cp2-ghost-btn" onClick={() => setIsEditModalOpen(true)}>Add media kit</button>
                            )}
                        </div>
                    )}
                </div>

                {/* Collections */}
                <div className="cp2-card pf-collections-card">
                    <div className="cp2-card-header">
                        <Bookmark size={16} className="cp2-card-header-icon" />
                        <h2 className="cp2-card-title">Collections</h2>
                        <span className="cp2-count-badge">{collectionCount}</span>
                    </div>
                    <div className="pf-tabs-wrap">
                        <ProfileTabs
                            collections={profileCollections}
                            sharedCollections={sharedCollections}
                            profileUser={{ ...profile, avatar: profileImageUrl, stats: { followers, following, collections: collectionCount } }}
                            activeTab="collections"
                            onRefresh={refreshCollections}
                            isOwner={isOwnProfile}
                            onUpdateCollection={handleCollectionUpdate}
                        />
                    </div>
                </div>

                {/* Creator Overview */}
                <div className="cp2-card">
                    <div className="cp2-card-header">
                        <User size={16} className="cp2-card-header-icon" />
                        <h2 className="cp2-card-title">Creator Overview</h2>
                    </div>
                    <div className="cp2-about-list">
                        {interests.length > 0 && (
                            <div className="cp2-about-row">
                                <span className="cp2-about-key">Content Niche</span>
                                <div className="cp2-tags">
                                    {interests.map(t => <span key={t} className="cp2-tag">{t}</span>)}
                                </div>
                            </div>
                        )}
                        {location && (
                            <div className="cp2-about-row">
                                <span className="cp2-about-key">Location</span>
                                <span className="cp2-about-val">{location}</span>
                            </div>
                        )}
                        {gender && (
                            <div className="cp2-about-row">
                                <span className="cp2-about-key">Gender</span>
                                <span className="cp2-about-val">{gender}{pronoun ? ` · ${pronoun}` : ''}</span>
                            </div>
                        )}
                        {joinedDate && (
                            <div className="cp2-about-row">
                                <span className="cp2-about-key">Member since</span>
                                <span className="cp2-about-val">{joinedDate}</span>
                            </div>
                        )}
                        {isVerified && (
                            <div className="cp2-about-row">
                                <span className="cp2-about-key">Creator status</span>
                                <div className="cp2-about-val cp2-about-val--flex">
                                    <VerifiedBadge plan={planLabel} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* ── Modals ───────────────────────────────────────────────────── */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <EditProfileModal user={profile} onClose={() => setIsEditModalOpen(false)} onUpdate={refreshProfile} />
                )}
            </AnimatePresence>

            <FollowListModal
                isOpen={followModal.isOpen}
                onClose={() => setFollowModal(m => ({ ...m, isOpen: false }))}
                userId={userId} type={followModal.type} username={uname}
            />

            <FloatingActionButton />

            <Snackbar isVisible={snackbar.show} message={snackbar.message} type={snackbar.type}
                onClose={() => setSnackbar(s => ({ ...s, show: false }))} />
        </motion.div>
    );
};

export default Profile;
