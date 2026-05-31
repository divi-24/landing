import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, Globe, ArrowLeft, Share2, Youtube,
    Instagram, Linkedin, Twitter, Users, Bookmark,
    Package, UserCheck, Calendar, BarChart2,
    ChevronRight, ExternalLink, RefreshCw,
    Eye, Clock, ThumbsUp, TrendingUp, User,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import UserService from '../core/services/UserService';
import YouTubeService from '../core/services/YouTubeService';
import CollectionService from '../core/services/CollectionService';
import ProfileBadge from '../components/ProfileBadge';
import Snackbar from '../components/Snackbar';
import '../styles/CreatorPortfolio.css';

// ─── SVG line chart ─────────────────────────────────────────────────────────
const MiniLineChart = ({ rows, colIndex, color }) => {
    const values = rows.map((r) => Number(r[colIndex]));
    const max = Math.max(...values, 1);
    const W = 600, H = 80, P = 6;
    const pts = values.map((v, i) => {
        const x = P + (i / Math.max(values.length - 1, 1)) * (W - P * 2);
        const y = H - P - (v / max) * (H - P * 2);
        return `${x},${y}`;
    });
    const uid = `${colIndex}-${color.replace('#', '')}`;
    const areaPath = `M${P},${H - P} ${pts.map(p => `L${p}`).join(' ')} L${W - P},${H - P} Z`;
    const last = pts[pts.length - 1]?.split(',').map(Number) || [W - P, H - P];

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="cp2-chart-svg" preserveAspectRatio="none">
            <defs>
                <linearGradient id={`a-${uid}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.22" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
                <linearGradient id={`l-${uid}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={color} stopOpacity="0.5" />
                    <stop offset="100%" stopColor={color} stopOpacity="1" />
                </linearGradient>
                <filter id={`g-${uid}`}>
                    <feGaussianBlur stdDeviation="1.5" result="b" />
                    <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
            </defs>
            <path d={areaPath} fill={`url(#a-${uid})`} />
            <polyline points={pts.join(' ')} fill="none" stroke={`url(#l-${uid})`}
                strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
                filter={`url(#g-${uid})`} />
            {Number.isFinite(last[0]) && <circle cx={last[0]} cy={last[1]} r="3.5" fill={color} />}
        </svg>
    );
};

// ─── YouTube analytics panel ─────────────────────────────────────────────────
const YouTubePanel = ({ socialUrl }) => {
    const today = new Date().toISOString().split('T')[0];
    const start = new Date(Date.now() - 120 * 86400000).toISOString().split('T')[0];
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetch_ = useCallback(async (force = false) => {
        setLoading(true);
        setError(null);
        try {
            if (force) localStorage.removeItem(`yt_overview_${start}_${today}`);
            const res = await YouTubeService.getOverview(start, today);
            setData(res);
        } catch (e) {
            setError(e.message || 'Could not load analytics');
        } finally {
            setLoading(false);
        }
    }, [start, today]);

    useEffect(() => { fetch_(); }, [fetch_]);

    if (loading) return (
        <div className="cp2-panel-state">
            <div className="cp2-spinner" />
            <span>Loading analytics…</span>
        </div>
    );

    if (error) return (
        <div className="cp2-panel-state cp2-panel-state--col">
            <Youtube size={28} style={{ color: '#FF0000', opacity: 0.7 }} />
            <p className="cp2-panel-msg">{error}</p>
            <div className="cp2-panel-actions">
                {socialUrl && (
                    <a href={socialUrl} target="_blank" rel="noopener noreferrer" className="cp2-ext-btn">
                        <ExternalLink size={13} /> View Channel
                    </a>
                )}
                <button className="cp2-ghost-btn" onClick={() => fetch_(true)}>
                    <RefreshCw size={13} /> Retry
                </button>
            </div>
        </div>
    );

    if (!data) return null;

    const { channelInfo, analytics } = data;
    const snippet = channelInfo?.snippet || {};
    const stats = channelInfo?.statistics || {};
    const rows = analytics?.rows || [];

    const totalViews = rows.reduce((s, r) => s + Number(r[1]), 0);
    const totalMin = rows.reduce((s, r) => s + Number(r[2]), 0);
    const totalLikes = rows.reduce((s, r) => s + Number(r[3]), 0);
    const totalSubs = rows.reduce((s, r) => s + Number(r[4]), 0);

    const METRICS = [
        { label: 'Views', value: totalViews, color: '#FF0000', icon: Eye, chart: 1 },
        { label: 'Watch Min', value: totalMin, color: '#7C3AED', icon: Clock, chart: 2 },
        { label: 'Likes', value: totalLikes, color: '#F0057A', icon: ThumbsUp, chart: 3 },
        { label: 'Subs Gained', value: totalSubs, color: '#10B981', icon: TrendingUp, chart: 4 },
    ];

    const CHANNEL_STATS = [
        { label: 'Subscribers', value: stats.subscriberCount || 0 },
        { label: 'Total Views', value: stats.viewCount || 0 },
        { label: 'Videos', value: stats.videoCount || 0 },
    ];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
            className="cp2-yt-panel">
            {/* Channel row */}
            <div className="cp2-yt-channel">
                {snippet.thumbnails && (
                    <img
                        src={snippet.thumbnails.medium?.url || snippet.thumbnails.default?.url}
                        alt={snippet.title}
                        className="cp2-yt-ch-avatar"
                    />
                )}
                <div className="cp2-yt-ch-info">
                    <p className="cp2-yt-ch-name">{snippet.title}</p>
                    {snippet.customUrl && <p className="cp2-yt-ch-handle">{snippet.customUrl}</p>}
                </div>
                <div className="cp2-yt-ch-stats">
                    {CHANNEL_STATS.map(({ label, value }) => (
                        <div key={label} className="cp2-yt-ch-stat">
                            <span className="cp2-yt-ch-stat-val">{Number(value).toLocaleString()}</span>
                            <span className="cp2-yt-ch-stat-lbl">{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <p className="cp2-period-label">Last 120 days</p>

            {/* Metric cards */}
            <div className="cp2-metric-grid">
                {METRICS.map(({ label, value, color, icon: Icon, chart }) => (
                    <div key={label} className="cp2-metric-card">
                        <div className="cp2-metric-header">
                            <div className="cp2-metric-icon" style={{ background: `${color}18`, color }}>
                                <Icon size={14} />
                            </div>
                            <span className="cp2-metric-label">{label}</span>
                        </div>
                        <p className="cp2-metric-value">{Number(value).toLocaleString()}</p>
                        {rows.length > 1 && (
                            <div className="cp2-metric-chart">
                                <MiniLineChart rows={rows} colIndex={chart} color={color} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

// ─── Platform placeholder panel ───────────────────────────────────────────────
const PlatformPlaceholder = ({ platform, socialUrl }) => {
    const config = {
        instagram: {
            icon: Instagram,
            color: '#E1306C',
            bgClass: 'cp2-ig-icon',
            label: 'Instagram Analytics',
            msg: 'Connect your Instagram account to display reach, impressions, and engagement data.',
            btnClass: 'cp2-ext-btn--ig',
            btnLabel: 'View Profile',
        },
        linkedin: {
            icon: Linkedin,
            color: '#0A66C2',
            bgClass: 'cp2-li-icon',
            label: 'LinkedIn Analytics',
            msg: 'Connect your LinkedIn account to display profile views, post reach, and network insights.',
            btnClass: 'cp2-ext-btn--li',
            btnLabel: 'View Profile',
        },
    }[platform];

    if (!config) return null;
    const Icon = config.icon;

    return (
        <div className="cp2-panel-state cp2-panel-state--col cp2-panel-state--placeholder">
            <div className={`cp2-platform-icon-wrap ${config.bgClass}`}>
                <Icon size={24} />
            </div>
            <p className="cp2-panel-title">{config.label}</p>
            <p className="cp2-panel-msg">{config.msg}</p>
            {socialUrl && (
                <a href={socialUrl} target="_blank" rel="noopener noreferrer"
                    className={`cp2-ext-btn ${config.btnClass}`}>
                    <ExternalLink size={13} /> {config.btnLabel}
                </a>
            )}
        </div>
    );
};

// ─── Main component ───────────────────────────────────────────────────────────
const CreatorPortfolio = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const { user: authUser, isAuthenticated } = useAuth();

    const [profile, setProfile] = useState(null);
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('youtube');
    const [snackbar, setSnackbar] = useState({ show: false, message: '', type: 'success' });

    const isOwn = isAuthenticated && authUser &&
        (authUser.username === username || authUser._id === username);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                let data;
                if (isOwn) {
                    data = await UserService.getUserProfile();
                } else {
                    const res = await UserService.getUserByUsername(username);
                    data = res.result || res.user || res;
                }
                if (!data) throw new Error('Creator not found');
                setProfile(data);

                const uid = data._id || data.id;
                if (uid) {
                    const raw = isOwn
                        ? (await CollectionService.getMyCollections()).result
                        : await CollectionService.getUserCollections(uid);
                    setCollections(Array.isArray(raw) ? raw : []);
                }
            } catch (e) {
                setError(e.response?.data?.message || e.message || 'Failed to load portfolio');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [username, isOwn]);

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setSnackbar({ show: true, message: 'Portfolio link copied!', type: 'success' });
    };

    // ── Loading ──
    if (loading) return (
        <div className="cp2-fullscreen-center">
            <div className="cp2-spinner" />
            <span className="cp2-loading-label">Loading portfolio…</span>
        </div>
    );

    // ── Error ──
    if (error) return (
        <div className="cp2-fullscreen-center cp2-fullscreen-center--col">
            <p className="cp2-error-title">Could not load portfolio</p>
            <p className="cp2-error-msg">{error}</p>
            <button className="cp2-ghost-btn" onClick={() => navigate(-1)}>
                <ArrowLeft size={14} /> Go back
            </button>
        </div>
    );

    if (!profile) return null;

    const {
        fullName, username: uname, bio, location, website,
        profileImageUrl, interests = [], followers = 0, following = 0,
        socialLinks = {}, subscription = {}, analytics = {},
        gender, pronoun, createdAt, plan,
    } = profile;

    const planLabel = subscription?.plan || plan || 'free';
    const showPlan = planLabel && planLabel !== 'free';
    const productCount = analytics?.products?.count || 0;
    const collectionCount = analytics?.collections?.count || collections.length;

    const joinedDate = createdAt
        ? new Date(createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : null;

    const TABS = [
        { id: 'youtube', label: 'YouTube', Icon: Youtube },
        { id: 'instagram', label: 'Instagram', Icon: Instagram },
        { id: 'linkedin', label: 'LinkedIn', Icon: Linkedin },
    ];

    const STATS = [
        { label: 'Followers', value: followers, Icon: Users },
        { label: 'Following', value: following, Icon: UserCheck },
        { label: 'Collections', value: collectionCount, Icon: Bookmark },
        { label: 'Products', value: productCount, Icon: Package },
    ];

    return (
        <motion.div className="cp2-page"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}>

            {/* ──────────── TOP NAV ──────────── */}
            <div className="cp2-topnav">
                <div className="cp2-topnav-inner">
                    <button className="cp2-icon-btn" onClick={() => navigate(-1)} aria-label="Back">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="cp2-topnav-right">
                        <button className="cp2-share-btn" onClick={copyLink}>
                            <Share2 size={15} />
                            <span>Share</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ──────────── HERO ──────────── */}
            <div className="cp2-hero">
                <div className="cp2-hero-inner">

                    {/* Avatar */}
                    <div className="cp2-avatar-wrap">
                        {profileImageUrl ? (
                            <img src={profileImageUrl} alt={fullName || uname} className="cp2-avatar" />
                        ) : (
                            <div className="cp2-avatar cp2-avatar--placeholder">
                                <User size={40} strokeWidth={1.5} />
                            </div>
                        )}
                        {showPlan && (
                            <div className="cp2-avatar-badge">
                                <ProfileBadge plan={planLabel} size={15} />
                            </div>
                        )}
                    </div>

                    {/* Identity */}
                    <div className="cp2-identity">
                        <div className="cp2-name-row">
                            <h1 className="cp2-name">{fullName || uname}</h1>
                            {showPlan && (
                                <span className="cp2-plan-pill">{planLabel}</span>
                            )}
                        </div>
                        <p className="cp2-handle">@{uname}</p>

                        {bio && <p className="cp2-bio">{bio}</p>}

                        {/* Meta */}
                        <div className="cp2-meta">
                            {location && (
                                <span className="cp2-meta-item">
                                    <MapPin size={13} strokeWidth={2} />
                                    {location}
                                </span>
                            )}
                            {website && (
                                <a
                                    href={website.startsWith('http') ? website : `https://${website}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="cp2-meta-item cp2-meta-item--link"
                                >
                                    <Globe size={13} strokeWidth={2} />
                                    {website.replace(/^https?:\/\//, '')}
                                </a>
                            )}
                            {joinedDate && (
                                <span className="cp2-meta-item">
                                    <Calendar size={13} strokeWidth={2} />
                                    {joinedDate}
                                </span>
                            )}
                        </div>

                        {/* Social links */}
                        {(socialLinks.youtube || socialLinks.instagram || socialLinks.linkedin || socialLinks.twitter) && (
                            <div className="cp2-socials">
                                {socialLinks.youtube && (
                                    <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer"
                                        className="cp2-social-btn cp2-social-btn--yt" aria-label="YouTube">
                                        <Youtube size={16} />
                                        <span>YouTube</span>
                                    </a>
                                )}
                                {socialLinks.instagram && (
                                    <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                                        className="cp2-social-btn cp2-social-btn--ig" aria-label="Instagram">
                                        <Instagram size={16} />
                                        <span>Instagram</span>
                                    </a>
                                )}
                                {socialLinks.linkedin && (
                                    <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                                        className="cp2-social-btn cp2-social-btn--li" aria-label="LinkedIn">
                                        <Linkedin size={16} />
                                        <span>LinkedIn</span>
                                    </a>
                                )}
                                {socialLinks.twitter && (
                                    <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                                        className="cp2-social-btn cp2-social-btn--tw" aria-label="Twitter / X">
                                        <Twitter size={16} />
                                        <span>Twitter</span>
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ──────────── STATS ROW ──────────── */}
            <div className="cp2-content-wrap">
                <div className="cp2-stats-row">
                    {STATS.map(({ label, value, Icon }, i) => (
                        <React.Fragment key={label}>
                            {i > 0 && <div className="cp2-stat-divider" />}
                            <div className="cp2-stat">
                                <span className="cp2-stat-val">{Number(value).toLocaleString()}</span>
                                <span className="cp2-stat-lbl">{label}</span>
                            </div>
                        </React.Fragment>
                    ))}
                </div>

                {/* ──────────── PLATFORM ANALYTICS ──────────── */}
                <div className="cp2-card">
                    <div className="cp2-card-header">
                        <BarChart2 size={16} className="cp2-card-header-icon" />
                        <h2 className="cp2-card-title">Platform Analytics</h2>
                    </div>

                    {/* Tabs */}
                    <div className="cp2-tabs">
                        {TABS.map(({ id, label, Icon }) => (
                            <button
                                key={id}
                                className={`cp2-tab${activeTab === id ? ' cp2-tab--active' : ''}`}
                                onClick={() => setActiveTab(id)}
                            >
                                <Icon size={14} />
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="cp2-tab-body">
                        <AnimatePresence mode="wait">
                            <motion.div key={activeTab}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.18 }}>
                                {activeTab === 'youtube' && (
                                    isOwn
                                        ? <YouTubePanel socialUrl={socialLinks.youtube} />
                                        : (
                                            <div className="cp2-panel-state cp2-panel-state--col">
                                                <Youtube size={28} style={{ color: '#FF0000', opacity: 0.7 }} />
                                                <p className="cp2-panel-title">YouTube Analytics</p>
                                                <p className="cp2-panel-msg">Analytics are private and only visible to the creator.</p>
                                                {socialLinks.youtube && (
                                                    <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer"
                                                        className="cp2-ext-btn">
                                                        <ExternalLink size={13} /> View Channel
                                                    </a>
                                                )}
                                            </div>
                                        )
                                )}
                                {activeTab === 'instagram' && (
                                    <PlatformPlaceholder platform="instagram" socialUrl={socialLinks.instagram} />
                                )}
                                {activeTab === 'linkedin' && (
                                    <PlatformPlaceholder platform="linkedin" socialUrl={socialLinks.linkedin} />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* ──────────── COLLECTIONS ──────────── */}
                {collections.length > 0 && (
                    <div className="cp2-card">
                        <div className="cp2-card-header">
                            <Bookmark size={16} className="cp2-card-header-icon" />
                            <h2 className="cp2-card-title">Collections</h2>
                            <span className="cp2-count-badge">{collections.length}</span>
                        </div>

                        <div className="cp2-collections-grid">
                            {collections.slice(0, 6).map((col) => {
                                const colId = col._id || col.id;
                                const thumb = col.coverImage || col.thumbnail || col.image;
                                const name = col.name || col.title || 'Untitled';
                                const count = col.productCount ?? col.products?.length ?? 0;
                                return (
                                    <Link key={colId} to={`/c/${colId}`} className="cp2-col-card">
                                        <div className="cp2-col-img">
                                            {thumb
                                                ? <img src={thumb} alt={name} />
                                                : <div className="cp2-col-img-empty"><Bookmark size={18} strokeWidth={1.5} /></div>
                                            }
                                        </div>
                                        <div className="cp2-col-body">
                                            <p className="cp2-col-name">{name}</p>
                                            <p className="cp2-col-count">
                                                {count} {count === 1 ? 'product' : 'products'}
                                                <ChevronRight size={12} />
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {collections.length > 6 && (
                            <div className="cp2-card-footer">
                                <Link to={`/profile/${uname}`} className="cp2-ghost-btn">
                                    View all {collections.length} collections
                                    <ChevronRight size={14} />
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* ──────────── ABOUT ──────────── */}
                <div className="cp2-card">
                    <div className="cp2-card-header">
                        <User size={16} className="cp2-card-header-icon" />
                        <h2 className="cp2-card-title">About</h2>
                    </div>

                    <div className="cp2-about-list">
                        {interests.length > 0 && (
                            <div className="cp2-about-row">
                                <span className="cp2-about-key">Interests</span>
                                <div className="cp2-tags">
                                    {interests.map((t) => (
                                        <span key={t} className="cp2-tag">{t}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {gender && (
                            <div className="cp2-about-row">
                                <span className="cp2-about-key">Gender</span>
                                <span className="cp2-about-val">
                                    {gender}{pronoun ? ` · ${pronoun}` : ''}
                                </span>
                            </div>
                        )}
                        {joinedDate && (
                            <div className="cp2-about-row">
                                <span className="cp2-about-key">Member since</span>
                                <span className="cp2-about-val">{joinedDate}</span>
                            </div>
                        )}
                        {showPlan && (
                            <div className="cp2-about-row">
                                <span className="cp2-about-key">Plan</span>
                                <div className="cp2-about-val cp2-about-val--flex">
                                    <ProfileBadge plan={planLabel} size={13} />
                                    <span style={{ textTransform: 'capitalize' }}>{planLabel}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>{/* /content-wrap */}

            <Snackbar
                isVisible={snackbar.show}
                message={snackbar.message}
                type={snackbar.type}
                onClose={() => setSnackbar(s => ({ ...s, show: false }))}
            />
        </motion.div>
    );
};

export default CreatorPortfolio;
