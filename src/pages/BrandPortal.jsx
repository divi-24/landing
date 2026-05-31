import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    ArrowRight,
    BarChart3,
    Bell,
    Bookmark,
    BriefcaseBusiness,
    CalendarDays,
    Check,
    Clock,
    CheckCircle2,
    ChevronRight,
    Compass,
    Copy,
    Crown,
    Download,
    Edit3,
    ExternalLink,
    Eye,
    FileText,
    Filter,
    Globe,
    Image,
    IndianRupee,
    Instagram,
    LayoutGrid,
    Linkedin,
    Link2,
    Lock,
    Loader2,
    Mail,
    MapPin,
    MessageCircle,
    MessageSquare,
    MousePointerClick,
    Package,
    Paperclip,
    Plug,
    Plus,
    Search,
    Settings,
    Send,
    Star,
    Store,
    Tag,
    Trash2,
    TrendingUp,
    User,
    Users,
    X,
    Youtube,
    Zap,
} from 'lucide-react';
import BrandService from '../core/services/BrandService';
import BrandCampaignService, {
    formatCampaignDateTime,
    toCampaignDateTimeLocalValue,
} from '../core/services/BrandCampaignService';
import BrandProductService from '../core/services/BrandProductService';
import ProductService from '../core/services/ProductService';
import UserService from '../core/services/UserService';
import WalletService from '../core/services/WalletService';
import BrandProfileEditModal from '../components/BrandProfileEditModal';
import ProductFeed from '../components/ProductFeed';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { getNotificationMessage } from './Notifications';
import '../styles/BrandPortal.css';
import '../styles/Profile.css';
import '../styles/Threads.css';

const formatNum = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return String(value);
};

const getEntityId = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value._id || value.id || '';
};

const formatMoney = (value) => `INR ${Number(value).toLocaleString('en-IN')}`;

const toDateTimeLocalValue = toCampaignDateTimeLocalValue;

const toDateInputValue = (value) => toDateTimeLocalValue(value).slice(0, 10);

const formatDateTime = (value) => {
    if (!value) return 'Not set';
    const raw = String(value);
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(raw) && !/(?:z|[+-]\d{2}:?\d{2})$/i.test(raw)) {
        const date = new Date(`${raw.length === 16 ? `${raw}:00` : raw}+05:30`);
        if (Number.isNaN(date.getTime())) return raw.replace('T', ' ');
        return date.toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }
    return formatCampaignDateTime(value);
};

const labelFromEnum = (value) => String(value || '')
    .trim()
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const normalizeCreatorProfile = (creator = {}) => {
    const id = creator._id || creator.id || creator.creatorId || '';
    const name = creator.fullName || creator.username || 'Creator';
    const interests = Array.isArray(creator.interests) && creator.interests.length ? creator.interests : ['Creator'];

    return {
        raw: creator,
        id,
        _id: id,
        name,
        handle: creator.username ? `@${creator.username}` : '',
        category: interests,
        location: creator.location || 'India',
        followers: Number(creator.followers || 0),
        following: Number(creator.following || 0),
        platform: Object.entries(creator.socialLinks || {})
            .filter(([, url]) => Boolean(url))
            .map(([platform]) => platform.charAt(0).toUpperCase() + platform.slice(1)),
        engagement: creator.analytics?.engagementRate || 0,
        ctr: creator.analytics?.ctr || 0,
        deals: Array.isArray(creator.appliedCampaigns?.accepted) ? creator.appliedCampaigns.accepted.length : 0,
        rating: creator.rating || null,
        available: true,
        verified: Boolean(creator.emailVerified || creator.phoneVerified),
        realFollowers: creator.realFollowers || null,
        avatar: creator.profileImageUrl || '',
        bio: creator.bio || '',
        website: creator.website || '',
        socialLinks: creator.socialLinks || {},
    };
};

const getPipelineCreatorId = (entry = {}) => {
    if (!entry || typeof entry !== 'object') return '';
    return (
        getEntityId(entry.creatorId) ||
        getEntityId(entry.creator) ||
        getEntityId(entry.user) ||
        getEntityId(entry.userId) ||
        getEntityId(entry.id) ||
        getEntityId(entry._id)
    );
};

const getPipelineCreatorProfile = (entry = {}) => {
    if (!entry || typeof entry !== 'object') return null;
    const candidates = [
        entry.profile,
        entry.creatorProfile,
        entry.creatorDetails,
        entry.userProfile,
        entry.userDetails,
        entry.creator,
        entry.user,
        entry.userId,
        entry.creatorId,
    ];
    return candidates.find(candidate => candidate && typeof candidate === 'object') || null;
};

const withCreatorProfiles = (items = [], profileMap = new Map()) => items.filter(Boolean).map((entry = {}) => {
    const id = getPipelineCreatorId(entry);
    const existingProfile = getPipelineCreatorProfile(entry);
    const fetchedProfile = profileMap.get(id);
    return {
        ...entry,
        profile: existingProfile || fetchedProfile || null,
        creatorId: existingProfile || fetchedProfile || entry.creatorId,
    };
});

const normalizePipelineItem = (entry = {}, stage = '') => {
    const id = getPipelineCreatorId(entry);
    return {
        ...entry,
        id,
        _id: id || entry._id,
        stage,
        profile: getPipelineCreatorProfile(entry),
        threads: Array.isArray(entry.threads) ? entry.threads : [],
    };
};

const team = [
    { name: 'Riya Bansal', role: 'Owner', email: 'riya@brand.co' },
    { name: 'Arjun Mehra', role: 'Admin', email: 'arjun@brand.co' },
    { name: 'Sneha Kapoor', role: 'Campaign Manager', email: 'sneha@brand.co' },
    { name: 'Vivek Nair', role: 'Viewer', email: 'vivek@brand.co' },
];


const StatusBadge = ({ status }) => <span className={`brand-status ${String(status).toLowerCase().replace(/\s+/g, '-')}`}>{status}</span>;

const EmptyPanel = ({ title, message, action, icon }) => (
    <article className="brand-panel brand-empty-state">
        {icon && <div className="brand-empty-state-icon">{React.createElement(icon, { size: 32 })}</div>}
        <h2>{title}</h2>
        <p>{message}</p>
        {action}
    </article>
);

const PageHeader = ({ title, accent, description, actions }) => (
    <header className="brand-page-hero">
        <div className="brand-page-hero-mesh" aria-hidden="true" />
        <div className="brand-page-heading brand-page-heading-row">
            <div>
                <span className="brand-page-kicker">Dropp for Brands</span>
                <h1>
                    {title}
                    {accent ? <span className="accent"> {accent}</span> : null}
                </h1>
                {description && <p>{description}</p>}
            </div>
            {actions && <div className="brand-header-actions">{actions}</div>}
        </div>
    </header>
);

const BrandTopbar = ({ brandName }) => {
    const { user } = useAuth();
    const logoUrl = user?.logoUrl || '';
    return (
        <div className="brand-topbar brand-topbar--unified">
            {/* Left: search */}
            <div className="brand-topbar-search brand-topbar-search--inline">
                <Search size={16} />
                <input placeholder="Search creators, campaigns…" />
            </div>

            {/* Right: actions */}
            <div className="brand-topbar-right">
                <Link className="brand-icon-btn brand-topbar-icon" to="/brand/campaigns/new" aria-label="New campaign" title="New campaign">
                    <Plus size={17} />
                </Link>

                <Link className="brand-topbar-avatar" to="/brand/profile" title={brandName}>
                    {logoUrl
                        ? <img src={logoUrl} alt={brandName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                        : <span>{brandName.slice(0, 1).toUpperCase()}</span>}
                </Link>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, detail }) => (
    <article className="brand-stat-card">
        <div className="brand-stat-card-top">
            <span>{label}</span>
            {React.createElement(icon, { size: 18 })}
        </div>
        <strong>{value}</strong>
        {detail && <small>{detail}</small>}
    </article>
);

const AnalyticsStat = ({ icon, label, value, detail }) => {
    const isUp = detail?.startsWith('+');
    const isDown = detail?.startsWith('-');
    return (
        <article className="ba-stat">
            <div className="ba-stat-head">
                <div className="ba-stat-icon">{React.createElement(icon, { size: 15 })}</div>
                {detail && (
                    <span className={`ba-stat-delta${isUp ? ' ba-stat-delta--up' : isDown ? ' ba-stat-delta--down' : ''}`}>
                        {detail}
                    </span>
                )}
            </div>
            <strong className="ba-stat-value">{value}</strong>
            <span className="ba-stat-label">{label}</span>
        </article>
    );
};

const FreeTierHome = ({ brandName, unreadCount }) => {
    const navigate = useNavigate();
    return (
        <section className="brand-section brand-home-page">
            <div className="brand-home-top-bar">
                <div className="brand-home-top-spacer" aria-hidden="true" />
                <Link to="/brand/app" className="brand-home-brand" aria-label="Dropp brand home">
                    <span className="brand-home-wordmark" aria-hidden="true">
                        {'DROPP'.split('').map((char, i) => (
                            <span key={i} className="brand-home-char">{char}</span>
                        ))}
                    </span>
                    <span className="brand-home-tagline">curate · share · earn</span>
                </Link>
                <div className="brand-home-top-actions">
                    <Link to="/brand/notifications" className="brand-home-notify" aria-label="Notifications" style={{ position: 'relative' }}>
                        <span className="brand-home-notify-inner">
                            <Bell size={20} strokeWidth={2} />
                        </span>
                        {unreadCount > 0 && (
                            <span style={{ position: 'absolute', top: 0, right: 0, background: '#ef4444', color: '#fff', borderRadius: '50%', fontSize: 10, fontWeight: 700, minWidth: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>
            <div className="brand-welcome-hero">
                <div className="brand-welcome-hero-content">
                    <div className="brand-welcome-badge"><Zap size={12} />Free Plan</div>
                    <h1>Welcome, <span>{brandName}</span></h1>
                    <p>You're on the Free plan. Upgrade to Pro to unlock campaigns, analytics, and more.</p>
                </div>
                <div className="brand-welcome-hero-orbs">
                    <div className="brand-welcome-orb brand-welcome-orb-1" />
                    <div className="brand-welcome-orb brand-welcome-orb-2" />
                    <div className="brand-welcome-orb brand-welcome-orb-3" />
                </div>
            </div>
            <div className="brand-gate" style={{ margin: '0 0 24px 0', maxWidth: '100%', padding: '32px' }}>
                <div className="brand-gate-icon">
                    <Crown size={28} strokeWidth={1.8} />
                </div>
                <span className="brand-gate-kicker">
                    <Crown size={12} strokeWidth={2.5} />
                    Pro Plan
                </span>
                <h2 className="brand-gate-title">Unlock the Full Platform</h2>
                <p className="brand-gate-desc">
                    Create unlimited campaigns, discover verified creators, track ROI, and message directly — all in one place.
                </p>
                <button className="brand-gate-cta" onClick={() => navigate('/brand/subscription')}>
                    <Crown size={15} strokeWidth={2.5} />
                    Upgrade to Pro — ₹3,499/month
                </button>
                <p className="brand-gate-hint">Cancel anytime</p>
            </div>
            <div className="brand-kpi-grid">
                <article className="brand-panel" style={{ cursor: 'pointer' }} onClick={() => navigate('/brand/explore')}>
                    <div className="brand-panel-title">
                        <div><strong>Explore</strong><span>Available on Free plan</span></div>
                        <Compass size={18} />
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                        Browse creator products and discover who's trending on Dropp.
                    </p>
                </article>
                <article className="brand-panel" style={{ cursor: 'pointer' }} onClick={() => navigate('/brand/creators')}>
                    <div className="brand-panel-title">
                        <div><strong>Creators</strong><span>Available on Free plan</span></div>
                        <Users size={18} />
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                        Discover verified creators by niche, reach, and engagement.
                    </p>
                </article>
            </div>
        </section>
    );
};

const HomeView = ({ brandName, campaigns: campaignList, loadingCampaigns, isPro, unreadCount }) => {
    if (!isPro) return <FreeTierHome brandName={brandName} unreadCount={unreadCount} />;
    const active = campaignList.filter((campaign) => campaign.status === 'Published');
    const drafts = campaignList.filter((campaign) => campaign.status === 'Draft');
    const totalApplicants = campaignList.reduce((sum, c) => sum + (c.applicants?.length || 0), 0);
    const campaignsWithApplicants = campaignList.filter(c => (c.applicants?.length || 0) > 0);
    const liveThreadCount = campaignList.reduce((sum, campaign) => (
        sum + (campaign.raw?.shortlisted || []).reduce((inner, entry) => inner + (entry.threads?.length || 0), 0)
    ), 0);
    return (
        <section className="brand-section brand-home-page">
            <div className="brand-home-top-bar">
                <div className="brand-home-top-spacer" aria-hidden="true" />
                <Link to="/brand/app" className="brand-home-brand" aria-label="Dropp brand home">
                    <span className="brand-home-wordmark" aria-hidden="true">
                        {'DROPP'.split('').map((char, i) => (
                            <span key={i} className="brand-home-char">{char}</span>
                        ))}
                    </span>
                    <span className="brand-home-tagline">curate · share · earn</span>
                </Link>
                <div className="brand-home-top-actions">
                    <Link to="/brand/notifications" className="brand-home-notify" aria-label="Notifications" style={{ position: 'relative' }}>
                        <span className="brand-home-notify-inner">
                            <Bell size={20} strokeWidth={2} />
                        </span>
                        {unreadCount > 0 && (
                            <span style={{ position: 'absolute', top: 0, right: 0, background: '#ef4444', color: '#fff', borderRadius: '50%', fontSize: 10, fontWeight: 700, minWidth: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>
            <div className="brand-welcome-hero">
                <div className="brand-welcome-hero-content">
                    <div className="brand-welcome-badge"><Zap size={12} />Brand Dashboard</div>
                    <h1>Welcome back, <span>{brandName}</span></h1>
                    <p>Manage campaigns, discover creators, and grow your brand presence.</p>
                </div>
                <div className="brand-welcome-hero-orbs">
                    <div className="brand-welcome-orb brand-welcome-orb-1" />
                    <div className="brand-welcome-orb brand-welcome-orb-2" />
                    <div className="brand-welcome-orb brand-welcome-orb-3" />
                </div>
            </div>
            <div className="brand-setup-card">
                <div>
                    <strong>Finish setting up your brand</strong>
                    <p>3 of 4 steps complete</p>
                </div>
                <div className="brand-progress"><span style={{ width: '75%' }} /></div>
                <div className="brand-check-grid">
                    {['Complete brand profile', 'Create first campaign', 'Explore creators', 'Invite team member'].map((item, index) => (
                        <div key={item} className={index < 3 ? 'done' : ''}>{index < 3 ? <CheckCircle2 size={16} /> : <span className="brand-empty-dot" />}{item}</div>
                    ))}
                </div>
            </div>
            <div className="brand-kpi-grid expanded">
                <StatCard icon={BriefcaseBusiness} value={loadingCampaigns ? '...' : active.length} label="Published Campaigns" detail="Active" />
                <StatCard icon={FileText} value={loadingCampaigns ? '...' : drafts.length} label="Draft Campaigns" detail="In progress" />
                <StatCard icon={Users} value={loadingCampaigns ? '...' : totalApplicants} label="Applications" detail={totalApplicants > 0 ? 'Total applicants' : 'Awaiting applicants'} />
                <StatCard icon={MessageSquare} value={loadingCampaigns ? '...' : liveThreadCount} label="Threads" detail="Live campaign threads" />
                <StatCard icon={MousePointerClick} value={loadingCampaigns ? '...' : formatNum(campaignList.reduce((sum, c) => sum + (c.clicks || 0), 0))} label="Tracked Clicks" detail="Campaign analytics" />
            </div>
            <div className="brand-dashboard-grid">
                <article className="brand-panel wide">
                    <div className="brand-panel-title"><div><strong>Published campaigns</strong><span>Live campaigns from your account</span></div><Link to="/brand/campaigns">View all</Link></div>
                    {loadingCampaigns ? <p>Loading campaigns...</p> : active.length > 0 ? <div className="brand-list">
                        {active.map((campaign) => (
                            <Link to={`/brand/campaigns/${campaign.id}`} className="brand-list-row bh-campaign-row" key={campaign.id}>
                                <div className="brand-avatar small">{campaign.name[0]}</div>
                                <div className="bh-campaign-info">
                                    <strong>{campaign.name}</strong>
                                    <span>{campaign.creators} creators · {campaign.platform}</span>
                                </div>
                                <div className="bh-campaign-deadline">
                                    <CalendarDays size={13} />
                                    <span>{campaign.end || 'No deadline'}</span>
                                </div>
                                <span className="bh-live-badge"><span className="bh-live-dot" />Live</span>
                            </Link>
                        ))}
                    </div> : <div className="brand-empty-inline"><BriefcaseBusiness size={24} /><div><strong>No published campaigns yet</strong><p>Create your first campaign and publish it when the brief is ready.</p></div><Link className="brand-primary-btn compact" to="/brand/campaigns/new"><Plus size={14} />Create campaign</Link></div>}
                </article>
                <article className="brand-panel">
                    <div className="brand-panel-title"><div><strong>Creator applications</strong><span>Incoming collaboration requests</span></div>{campaignsWithApplicants.length > 0 && <Link to="/brand/campaigns">View all</Link>}</div>
                    {loadingCampaigns ? (
                        <div className="brand-empty-inline"><Loader2 size={20} className="brand-spin" /><div><strong>Loading…</strong></div></div>
                    ) : campaignsWithApplicants.length > 0 ? (
                        <div className="brand-list">
                            {campaignsWithApplicants.map(c => (
                                <Link to={`/brand/campaigns/${c.id}`} className="brand-list-row bh-campaign-row" key={c.id}>
                                    <div className="brand-avatar small">{c.name[0]}</div>
                                    <div className="bh-campaign-info">
                                        <strong>{c.name}</strong>
                                        <span>{c.applicants.length} applicant{c.applicants.length !== 1 ? 's' : ''}</span>
                                    </div>
                                    <span className="bh-applicant-count">{c.applicants.length}</span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="brand-empty-inline"><Users size={24} /><div><strong>No applications yet</strong><p>Applications will appear here once your campaigns are published.</p></div></div>
                    )}
                </article>
                <article className="brand-panel wide">
                    <DeadlineCalendar campaigns={campaignList} />
                </article>
                <article className="brand-panel">
                    <div className="brand-panel-title"><div><strong>Recent threads</strong><span>Creator conversations</span></div></div>
                    <div className="brand-empty-inline"><MessageCircle size={24} /><div><strong>No threads yet</strong><p>Start a thread with creators from their profile.</p></div></div>
                </article>
            </div>
        </section>
    );
};

const CampaignsView = ({ campaigns: campaignList, loading, error, onRefresh }) => {
    const [view, setView] = useState('cards');
    const [statusFilter, setStatusFilter] = useState('all');
    const [query, setQuery] = useState('');

    const filtered = campaignList.filter(c =>
        (statusFilter === 'all' || c.status.toLowerCase() === statusFilter) &&
        c.name.toLowerCase().includes(query.toLowerCase())
    );
    const draftCount = campaignList.filter(c => c.status === 'Draft').length;
    const publishedCount = campaignList.filter(c => c.status === 'Published').length;

    return (
        <section className="brand-section brand-compact-page cp-campaigns-page">
            <div className="cp-page-header">
                <div className="cp-page-header-text">
                    <span className="cp-page-kicker">Brand Campaigns</span>
                    <h1>Your Campaigns</h1>
                    <p>Plan, launch, and track every creator collaboration.</p>
                </div>
                <div className="cp-page-header-actions">
                    <button className="brand-secondary-btn" onClick={onRefresh}><TrendingUp size={15} />Refresh</button>
                    <Link className="brand-primary-btn" to="/brand/campaigns/new"><Plus size={16} />New Campaign</Link>
                </div>
            </div>

            <div className="cp-toolbar">
                <div className="cp-status-tabs">
                    {[
                        { key: 'all', label: 'All', count: campaignList.length },
                        { key: 'draft', label: 'Draft', count: draftCount },
                        { key: 'published', label: 'Published', count: publishedCount },
                    ].map(({ key, label, count }) => (
                        <button
                            key={key}
                            className={`cp-status-tab${statusFilter === key ? ' active' : ''}`}
                            onClick={() => setStatusFilter(key)}
                        >
                            {label}
                            {count > 0 && <span className="cp-tab-badge">{count}</span>}
                        </button>
                    ))}
                </div>
                <div className="cp-toolbar-right">
                    <div className="brand-input-icon">
                        <Search size={16} />
                        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search campaigns…" />
                    </div>
                    <div className="brand-segmented">
                        <button className={view === 'cards' ? 'active' : ''} onClick={() => setView('cards')} aria-label="Card view"><LayoutGrid size={15} /></button>
                        <button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')} aria-label="Table view"><FileText size={15} /></button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="cp-card-grid">
                    {[1,2,3].map(i => <div key={i} className="cp-card-skeleton" />)}
                </div>
            ) : error ? (
                <div className="brand-empty-inline">
                    <TrendingUp size={24} />
                    <div><strong>Could not load campaigns</strong><p>{error}</p></div>
                    <button className="brand-primary-btn compact" onClick={onRefresh}>Try again</button>
                </div>
            ) : filtered.length === 0 ? (
                <div className="cp-empty-state">
                    <div className="cp-empty-icon"><BriefcaseBusiness size={32} /></div>
                    <strong>{campaignList.length === 0 ? 'No campaigns yet' : 'No campaigns match'}</strong>
                    <p>{campaignList.length === 0 ? 'Create your first campaign to start working with creators.' : 'Try a different search or filter.'}</p>
                    {campaignList.length === 0 && <Link className="brand-primary-btn compact" to="/brand/campaigns/new"><Plus size={14} />Create campaign</Link>}
                </div>
            ) : view === 'cards' ? (
                <div className="cp-card-grid">
                    {filtered.map(c => <CampaignCard key={c.id} campaign={c} />)}
                </div>
            ) : (
                <div className="cp-table">
                    <div className="cp-table-head">
                        <span>Campaign</span>
                        <span>Status</span>
                        <span>Platform</span>
                        <span>Budget</span>
                        <span>Deadline</span>
                        <span>Creators</span>
                        <span />
                    </div>
                    {filtered.map(c => (
                        <div className="cp-table-row" key={c.id}>
                            <div className="cp-table-name">
                                <div className="cp-table-avatar">{c.name[0]}</div>
                                <div>
                                    <strong>{c.name}</strong>
                                    <small>{c.product || c.goal}</small>
                                </div>
                            </div>
                            <StatusBadge status={c.status === 'Published' ? 'Active' : c.status} />
                            <span className="cp-table-platform">{c.platform}</span>
                            <span className="cp-table-budget">{formatMoney(c.budgetMin)}–{formatMoney(c.budgetMax)}</span>
                            <span className="cp-table-date">{c.end || '—'}</span>
                            <span className="cp-table-creators">{c.creators}</span>
                            <Link to={`/brand/campaigns/${c.id}`} className="cp-table-open">Open <ChevronRight size={13} /></Link>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

const CampaignCard = ({ campaign: c }) => (
    <Link to={`/brand/campaigns/${c.id}`} className={`cp-card${c.status === 'Published' ? ' cp-card--live' : ' cp-card--draft'}`}>
        <div className="cp-card-top">
            <div className="cp-card-icon">{c.name[0]}</div>
            <StatusBadge status={c.status === 'Published' ? 'Active' : c.status} />
        </div>
        <h3 className="cp-card-name">{c.name}</h3>
        <p className="cp-card-product">{c.product || c.goal}</p>
        <div className="cp-card-meta">
            <span><Users size={12} />{c.creators} creators</span>
            <span><CalendarDays size={12} />{c.end || 'No deadline'}</span>
        </div>
        <div className="cp-card-budget">
            <span className="cp-card-budget-label">Budget</span>
            <strong>{formatMoney(c.budgetMin)} – {formatMoney(c.budgetMax)}</strong>
        </div>
        <div className="cp-card-platform">{c.platform}</div>
        <div className="cp-card-arrow"><ChevronRight size={16} /></div>
    </Link>
);

const CampaignThreadsPanel = ({ campaignId, shortlisted, pipelineProfiles, legalAgreements, campaign }) => {
    const [selectedCreator, setSelectedCreator] = useState(null);
    const [selectedThreadIdx, setSelectedThreadIdx] = useState(0);
    const [threads, setThreads] = useState([]);  // threads array for selected creator
    const [messages, setMessages] = useState([]); // messages for selected thread
    const [sending, setSending] = useState(false);
    const [compose, setCompose] = useState('');
    const [legalData, setLegalData] = useState(null);
    const [brandWallet, setBrandWallet] = useState(null);
    const [ackLoading, setAckLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const creatorList = useMemo(() => {
        const profileMap = new Map((pipelineProfiles || []).map((entry) => [getPipelineCreatorId(entry), entry]));
        return (shortlisted || []).filter(Boolean).map((entry) => {
            const id = getPipelineCreatorId(entry);
            const enriched = profileMap.get(id);
            return {
                ...entry,
                ...enriched,
                id,
                _id: id || entry._id,
                profile: getPipelineCreatorProfile(enriched || entry),
                threads: Array.isArray(enriched?.threads) ? enriched.threads : (Array.isArray(entry.threads) ? entry.threads : []),
            };
        });
    }, [pipelineProfiles, shortlisted]);

    // Load wallet on mount
    useEffect(() => {
        WalletService.getWallet().then(setBrandWallet).catch(() => {});
    }, []);

    useEffect(() => {
        if (selectedCreator || creatorList.length === 0) return;
        setSelectedCreator(creatorList[0]);
    }, [creatorList, selectedCreator]);

    // When creator is selected, read their embedded threads and legal data from campaign detail.
    useEffect(() => {
        if (!selectedCreator) {
            setThreads([]);
            setMessages([]);
            setLegalData(null);
            return;
        }
        const creatorId = getPipelineCreatorId(selectedCreator);
        const nextThreads = Array.isArray(selectedCreator.threads) ? selectedCreator.threads : [];
        const directLegal = selectedCreator.legalAgreement || selectedCreator.legalAgreements || selectedCreator.agreement;
        const matchedLegal = (legalAgreements || []).find(item => getEntityId(item.creatorId) === creatorId);
        setSelectedThreadIdx(0);
        setThreads(nextThreads);
        setMessages(nextThreads[0]?.messages || []);
        setLegalData(directLegal || matchedLegal || null);
    }, [selectedCreator, legalAgreements]);

    // When thread changes, use embedded thread messages.
    useEffect(() => {
        const thread = threads[selectedThreadIdx];
        setMessages(thread?.messages || []);
    }, [threads, selectedThreadIdx]);

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        const content = compose.trim();
        if (!content || sending) return;
        const thread = threads[selectedThreadIdx];
        if (!thread) return;
        setSending(true);
        try {
            const result = await BrandCampaignService.sendThreadMessage(campaignId, thread._id, content);
            const nextMessages =
                result?.messages ||
                result?.thread?.messages ||
                result?.data?.messages ||
                result?.data?.thread?.messages;
            const fallbackMessage = {
                _id: `local-${Date.now()}`,
                senderRole: 'BRAND',
                content,
                sentAt: new Date().toISOString(),
            };
            const updatedMessages = Array.isArray(nextMessages) ? nextMessages : [...messages, fallbackMessage];
            setCompose('');
            setMessages(updatedMessages);
            setThreads(prev => prev.map((item, idx) => (
                idx === selectedThreadIdx ? { ...item, messages: updatedMessages } : item
            )));
        } catch { /* noop */ }
        finally { setSending(false); }
    };

    const handleAck = async (type) => {
        const creatorId = getPipelineCreatorId(selectedCreator);
        if (!creatorId) return;
        setAckLoading(true);
        try {
            const updated = await BrandCampaignService.acknowledgeLegalAgreement(campaignId, type, creatorId);
            setLegalData(updated);
        } catch { /* noop */ }
        finally { setAckLoading(false); }
    };

    const isBudgetLocked = campaign?.budgetLocked === true || campaign?.raw?.budgetLocked === true;

    const checkUnlocked = () => {
        if (!legalData) return false;
        return isBudgetLocked &&
            legalData.campaignAcknowledgement?.brand &&
            legalData.campaignAcknowledgement?.creator &&
            legalData.legalAcknowledgement?.brand &&
            legalData.legalAcknowledgement?.creator;
    };

    const getConditions = () => [
        { label: 'Campaign terms — Brand', met: legalData?.campaignAcknowledgement?.brand === true },
        { label: 'Campaign terms — Creator', met: legalData?.campaignAcknowledgement?.creator === true },
        { label: 'Legal agreement — Brand', met: legalData?.legalAcknowledgement?.brand === true },
        { label: 'Legal agreement — Creator', met: legalData?.legalAcknowledgement?.creator === true },
        { label: 'Campaign budget locked', met: isBudgetLocked },
    ];

    const conditions = getConditions();
    const metCount = legalData ? conditions.filter(c => c.met).length : (isBudgetLocked ? 1 : 0);
    const isUnlocked = checkUnlocked();
    const currentThread = threads[selectedThreadIdx];
    const currentTimeline = currentThread?.timelines?.[0];

    const fmtTime = (d) => {
        if (!d) return '';
        const dt = new Date(d);
        return dt.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    const fmtDeadline = (d) => {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const statusClass = (s) => {
        const m = { PENDING: 'pending', SUBMITTED: 'submitted', ACCEPTED: 'accepted', REJECTED: 'rejected' };
        return m[String(s).toUpperCase()] || 'pending';
    };

    if (creatorList.length === 0) {
        return (
            <div className="brand-empty-inline">
                <MessageCircle size={24} />
                <div>
                    <strong>No shortlisted creators yet</strong>
                    <p>Threads unlock once creators are shortlisted and both parties complete agreements.</p>
                </div>
            </div>
        );
    }

    const selectedProfile = getPipelineCreatorProfile(selectedCreator) || selectedCreator?.profile || null;
    const selectedDisplayName = selectedProfile?.fullName || selectedProfile?.username || 'Creator';
    const selectedAvatarLetter = selectedDisplayName[0]?.toUpperCase() || '?';

    return (
        <div className="thr-root">
            {/* Sidebar */}
            <div className="thr-sidebar">
                <div className="thr-sidebar-header">
                    <span className="thr-sidebar-title">Shortlisted Creators</span>
                </div>
                <div className="thr-sidebar-list">
                    {creatorList.map(c => {
                        const p = c?.profile || getPipelineCreatorProfile(c);
                        const name = p?.fullName || p?.username || 'Creator';
                        const isActive = getPipelineCreatorId(selectedCreator) === getPipelineCreatorId(c);
                        return (
                            <button
                                key={getPipelineCreatorId(c) || name}
                                className={`thr-creator-item${isActive ? ' active' : ''}`}
                                onClick={() => setSelectedCreator(c)}
                            >
                                <div className="thr-creator-avatar">
                                    {p?.profileImageUrl
                                        ? <img src={p.profileImageUrl} alt={name} />
                                        : name[0]?.toUpperCase()}
                                </div>
                                <div className="thr-creator-info">
                                    <div className="thr-creator-name">{name}</div>
                                    {p?.username && <div className="thr-creator-sub">@{p.username}</div>}
                                </div>
                                <span className={`thr-creator-badge thr-creator-badge--${isUnlocked ? 'unlocked' : 'locked'}`}>
                                    {isUnlocked ? <Check size={9} /> : <Lock size={9} />}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main panel */}
            <div className="thr-panel">
                {!selectedCreator ? (
                    <div className="thr-panel-empty">
                        <MessageCircle size={32} />
                        <strong>Select a creator</strong>
                        <p>Choose a shortlisted creator from the left to view their thread.</p>
                    </div>
                ) : (
                    <>
                        {/* Panel header */}
                        <div className="thr-panel-header">
                            <div className="thr-panel-header-avatar">
                                {selectedProfile?.profileImageUrl
                                    ? <img src={selectedProfile.profileImageUrl} alt={selectedDisplayName} />
                                    : selectedAvatarLetter}
                            </div>
                            <div className="thr-panel-header-info">
                                <div className="thr-panel-header-name">{selectedDisplayName}</div>
                                <div className="thr-panel-header-sub">
                                    {selectedProfile?.username ? `@${selectedProfile.username} · ` : ''}
                                    Bid: {formatMoney(selectedCreator?.proposedBid || 0)}
                                </div>
                            </div>
                            {isUnlocked && (
                                <span className="thr-status-pill thr-status-pill--accepted" style={{ flexShrink: 0 }}>
                                    <Check size={8} /> Active
                                </span>
                            )}
                        </div>

                        {/* Legal agreements (if not fully acknowledged) */}
                        {!isUnlocked && (
                            <div className="thr-legal">
                                <div className="thr-legal-title">
                                    <Lock size={14} />
                                    Legal Agreements
                                    <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)' }}>{metCount}/{conditions.length} completed</span>
                                </div>
                                <div className="thr-legal-progress">
                                    <div className="thr-legal-progress-fill" style={{ width: `${(metCount / conditions.length) * 100}%` }} />
                                </div>
                                <div className="thr-legal-grid">
                                    {conditions.map((c, i) => (
                                        <div key={i} className={`thr-legal-item${c.met ? ' done' : ''}`}>
                                            <div className="thr-legal-check">
                                                {c.met && <Check size={10} />}
                                            </div>
                                            <div className="thr-legal-label">
                                                <strong>{c.label}</strong>
                                                <span>{c.met ? 'Acknowledged' : 'Pending'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="thr-legal-actions">
                                    {!legalData?.campaignAcknowledgement?.brand && (
                                        <button
                                            className="thr-legal-acknowledge-btn"
                                            onClick={() => handleAck('campaign')}
                                            disabled={ackLoading}
                                        >
                                            {ackLoading ? <Loader2 size={12} className="brand-spin" /> : <Check size={12} />}
                                            Acknowledge Campaign Terms
                                        </button>
                                    )}
                                    {!legalData?.legalAcknowledgement?.brand && (
                                        <button
                                            className="thr-legal-acknowledge-btn"
                                            onClick={() => handleAck('legal')}
                                            disabled={ackLoading}
                                        >
                                            {ackLoading ? <Loader2 size={12} className="brand-spin" /> : <Check size={12} />}
                                            Acknowledge Legal Agreement
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {threads.length === 0 ? (
                            <div className="thr-panel-empty">
                                <FileText size={28} />
                                <strong>No threads yet</strong>
                                <p>Threads are created from the campaign's milestones when a creator is shortlisted.</p>
                            </div>
                        ) : (
                            <>
                                {/* Milestone tabs */}
                                <div className="thr-milestone-tabs">
                                    {threads.map((thread, idx) => {
                                        const tl = thread.timelines?.[0];
                                        const sc = statusClass(tl?.status);
                                        return (
                                            <button
                                                key={thread._id || idx}
                                                className={`thr-milestone-tab${selectedThreadIdx === idx ? ' active' : ''}`}
                                                onClick={() => setSelectedThreadIdx(idx)}
                                            >
                                                {idx + 1}. {tl?.title || `Milestone ${idx + 1}`}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Timeline header */}
                                {currentTimeline && (
                                    <div className="thr-timeline-header">
                                        <div className="thr-timeline-icon">
                                            <CalendarDays size={15} />
                                        </div>
                                        <div className="thr-timeline-info">
                                            <div className="thr-timeline-title">{currentTimeline.title}</div>
                                            <div className={`thr-timeline-deadline${new Date(currentTimeline.deadline) < new Date() && currentTimeline.status === 'PENDING' ? ' overdue' : ''}`}>
                                                <Clock size={11} />
                                                Deadline: {fmtDeadline(currentTimeline.deadline)}
                                            </div>
                                        </div>
                                        <span className={`thr-status-pill thr-status-pill--${statusClass(currentTimeline.status)}`}>
                                            {currentTimeline.status || 'PENDING'}
                                        </span>
                                    </div>
                                )}

                                {/* Messages */}
                                {!isUnlocked ? (
                                <div className="thr-locked">
                                    <div className="thr-locked-icon"><Lock size={22} /></div>
                                    <h3>Thread Locked</h3>
                                        <p>Messaging opens only after all acknowledgements are complete and the campaign budget is locked in the brand wallet.</p>
                                        <div className="thr-locked-conditions">
                                            {conditions.map((c, i) => (
                                                <div key={i} className={`thr-condition-row${c.met ? ' met' : ''}`}>
                                                    <div className="thr-condition-dot">{c.met && <Check size={9} />}</div>
                                                    {c.label}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="thr-messages-scroll">
                                            {messages.length === 0 ? (
                                                <div className="thr-empty-thread">
                                                    <MessageCircle size={24} />
                                                    <p>No messages yet. Start the conversation about this milestone.</p>
                                                </div>
                                            ) : (
                                                messages.map((msg, idx) => {
                                                    const isBrand = msg.senderRole === 'BRAND';
                                                    return (
                                                        <div key={msg._id || idx} className={`thr-msg thr-msg--${isBrand ? 'brand' : 'creator'}`}>
                                                            <div className="thr-msg-avatar-col">
                                                                <div className="thr-msg-avatar">
                                                                    {isBrand ? campaign?.name?.[0] || 'B' : selectedAvatarLetter}
                                                                </div>
                                                            </div>
                                                            <div className="thr-msg-body">
                                                                <div className="thr-msg-header">
                                                                    <span className="thr-msg-sender-name">
                                                                        {isBrand ? (campaign?.name || 'Brand') : selectedDisplayName}
                                                                    </span>
                                                                    <span className={`thr-msg-role thr-msg-role--${isBrand ? 'brand' : 'creator'}`}>
                                                                        {isBrand ? 'Brand' : 'Creator'}
                                                                    </span>
                                                                    <span className="thr-msg-time">{fmtTime(msg.sentAt)}</span>
                                                                </div>
                                                                <div className="thr-msg-content">{msg.content}</div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                            <div ref={messagesEndRef} />
                                        </div>

                                        {/* Compose */}
                                        <div className="thr-compose">
                                            <div className="thr-compose-row">
                                                <div className="thr-compose-avatar">
                                                    {campaign?.name?.[0] || 'B'}
                                                </div>
                                                <div className="thr-compose-input-wrap">
                                                    <textarea
                                                        className="thr-compose-textarea"
                                                        placeholder={`Reply to ${selectedDisplayName}…`}
                                                        value={compose}
                                                        onChange={e => setCompose(e.target.value)}
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                                e.preventDefault();
                                                                handleSend();
                                                            }
                                                        }}
                                                        rows={1}
                                                        maxLength={2000}
                                                    />
                                                </div>
                                            </div>
                                            <div className="thr-compose-footer">
                                                <span className="thr-compose-hint">{compose.length}/2000 · Enter to send</span>
                                                <button
                                                    className="thr-compose-send"
                                                    onClick={handleSend}
                                                    disabled={!compose.trim() || sending}
                                                >
                                                    {sending ? <Loader2 size={13} className="brand-spin" /> : <Send size={13} />}
                                                    {sending ? 'Sending…' : 'Reply'}
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

const CampaignDetailView = ({ campaigns: campaignList, loading, onDelete, onPublish, onRefresh, products = [], loadingProducts = false }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const campaign = campaignList.find(item => item.id === id);
    const [tab, setTab] = useState('overview');
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editError, setEditError] = useState('');
    const [editData, setEditData] = useState(null);
    const [moveError, setMoveError] = useState('');
    const [publishError, setPublishError] = useState('');
    const [publishing, setPublishing] = useState(false);
    const [detailedCampaign, setDetailedCampaign] = useState(null);

    // Pipeline state: null = still loading from API, object = loaded
    const [rawPipeline, setRawPipeline] = useState(null);
    const [pipelineProfiles, setPipelineProfiles] = useState(null);
    const [pipelineLoading, setPipelineLoading] = useState(false);
    const [pipelineTab, setPipelineTab] = useState('applicants');
    const [movingApplicant, setMovingApplicant] = useState(null);
    const [legalAgreements, setLegalAgreements] = useState([]);

    const fetchPipeline = useCallback(async () => {
        if (!id) return;
        setPipelineLoading(true);
        try {
            const data = await BrandCampaignService.getCampaignById(id);
            setDetailedCampaign(data);
            const nextPipeline = {
                applicants: Array.isArray(data.raw?.applicants)
                    ? data.raw.applicants.map(item => normalizePipelineItem(item, 'applicants'))
                    : [],
                underReview: Array.isArray(data.raw?.underReview)
                    ? data.raw.underReview.map(item => normalizePipelineItem(item, 'underReview'))
                    : [],
                shortlisted: Array.isArray(data.raw?.shortlisted)
                    ? data.raw.shortlisted.map(item => normalizePipelineItem(item, 'shortlisted'))
                    : [],
            };
            setRawPipeline(nextPipeline);
            let profileMap = new Map();
            const creatorIds = Object.values(nextPipeline)
                .flat()
                .map(getPipelineCreatorId)
                .filter(Boolean);
            if (creatorIds.length > 0) {
                try {
                    const users = await UserService.getAllUsers();
                    profileMap = new Map((users || []).map(user => [getEntityId(user), user]));
                } catch {
                    profileMap = new Map();
                }
            }
            setPipelineProfiles({
                applicants: withCreatorProfiles(nextPipeline.applicants, profileMap),
                underReview: withCreatorProfiles(nextPipeline.underReview, profileMap),
                shortlisted: withCreatorProfiles(nextPipeline.shortlisted, profileMap),
            });
            setLegalAgreements(Array.isArray(data.raw?.legalAgreements) ? data.raw.legalAgreements : []);
        } catch {
            setDetailedCampaign(null);
            setRawPipeline({ applicants: [], underReview: [], shortlisted: [] });
            setPipelineProfiles({ applicants: [], underReview: [], shortlisted: [] });
            setLegalAgreements([]);
        } finally {
            setPipelineLoading(false);
        }
    }, [id]);

    useEffect(() => {
        setPipelineProfiles(null);
        setRawPipeline(null);
        fetchPipeline();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const getLegalAgreementForCreator = useCallback((creatorId) => {
        const idValue = getEntityId(creatorId);
        return legalAgreements.find(item => (
            getEntityId(item.creatorId) === idValue ||
            getPipelineCreatorId(item) === idValue
        )) || null;
    }, [legalAgreements]);

    const mergeLegalAgreement = useCallback((agreement) => {
        if (!agreement?.creatorId) return;
        const creatorId = getEntityId(agreement.creatorId);
        setLegalAgreements(prev => {
            const exists = prev.some(item => getEntityId(item.creatorId) === creatorId);
            if (exists) {
                return prev.map(item => getEntityId(item.creatorId) === creatorId ? agreement : item);
            }
            return [...prev, agreement];
        });
    }, []);

    const isAgreementComplete = (agreement) => (
        agreement?.campaignAcknowledgement?.brand === true &&
        agreement?.campaignAcknowledgement?.creator === true &&
        agreement?.legalAcknowledgement?.brand === true &&
        agreement?.legalAcknowledgement?.creator === true
    );

    const handleAcknowledgeApplicant = useCallback(async (applicantId, type) => {
        setMovingApplicant(applicantId);
        setMoveError('');
        try {
            const updated = await BrandCampaignService.acknowledgeLegalAgreement(id, type, applicantId);
            mergeLegalAgreement(updated);
            await fetchPipeline();
        } catch (err) {
            const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Acknowledgement failed';
            setMoveError(msg);
        } finally {
            setMovingApplicant(null);
        }
    }, [fetchPipeline, id, mergeLegalAgreement]);

    const handleMoveApplicant = useCallback(async (applicantId, operation) => {
        setMovingApplicant(applicantId);
        setMoveError('');
        try {
            if (operation === 'MOVETOSHORTLISTED') {
                const legal = getLegalAgreementForCreator(applicantId);
                if (!isAgreementComplete(legal)) {
                    setMoveError('Complete all campaign and legal acknowledgements before shortlisting. The creator must also acknowledge both items.');
                    return;
                }
            }
            await BrandCampaignService.updateApplicant(id, applicantId, operation);
            const toStage = operation === 'MOVETOREVIEW' ? 'underReview' : 'shortlisted';
            await fetchPipeline();
            setPipelineTab(toStage);
        } catch (err) {
            const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Action failed';
            setMoveError(msg);
        }
        finally { setMovingApplicant(null); }
    }, [fetchPipeline, getLegalAgreementForCreator, id]);

    const openEdit = (sourceCampaign = detailedCampaign || campaign) => {
        if (!sourceCampaign) return;
        setEditData({
            name: sourceCampaign.name,
            product: sourceCampaign.product || '',
            platforms: sourceCampaign.platforms || [],
            deliverable: sourceCampaign.raw?.contentDeliverable || 'REEL',
            budgetMin: sourceCampaign.budgetMin,
            budgetMax: sourceCampaign.budgetMax,
            creatorCount: sourceCampaign.creators || 1,
            applicationDeadline: toDateTimeLocalValue(sourceCampaign.applicationDeadlineDateTime || sourceCampaign.raw?.applicationTimeline || sourceCampaign.end),
            startDate: toDateTimeLocalValue(sourceCampaign.startDateTime || sourceCampaign.raw?.campaignStartDate || sourceCampaign.start),
            endDate: toDateTimeLocalValue(sourceCampaign.endDateTime || sourceCampaign.raw?.campaignEndDate || sourceCampaign.endDate),
            productIds: sourceCampaign.productIds || sourceCampaign.raw?.productIds || [],
            baseTimelines: sourceCampaign.baseTimelines || sourceCampaign.raw?.baseTimelines || [],
        });
        setEditing(true);
        setEditError('');
        setPublishError('');
    };

    const updateField = (key, val) => setEditData(prev => ({ ...prev, [key]: val }));
    const togglePlatform = (p) => updateField('platforms', editData.platforms.includes(p) ? editData.platforms.filter(x => x !== p) : [...editData.platforms, p]);
    const toggleEditProduct = (product) => {
        const productId = getEntityId(product);
        if (!productId) return;
        const productIds = editData.productIds || [];
        updateField('productIds', productIds.includes(productId)
            ? productIds.filter(id => id !== productId)
            : [...productIds, productId]);
    };
    const addEditTimeline = () => updateField('baseTimelines', [...(editData?.baseTimelines || []), { title: '', deadline: '' }]);
    const removeEditTimeline = (i) => updateField('baseTimelines', (editData?.baseTimelines || []).filter((_, idx) => idx !== i));
    const updateEditTimeline = (i, key, val) => updateField('baseTimelines', (editData?.baseTimelines || []).map((t, idx) => idx === i ? { ...t, [key]: val } : t));

    const handleSave = async () => {
        setSaving(true);
        setEditError('');
        try {
            await BrandCampaignService.updateCampaign(campaign.id, editData);
            const refreshed = await BrandCampaignService.getCampaignById(campaign.id);
            setDetailedCampaign(refreshed);
            await onRefresh?.();
            setEditing(false);
        } catch (err) {
            setEditError(err.message || 'Could not update campaign');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <section className="brand-section brand-compact-page cp-detail-page">
            <div className="cp-detail-loading">
                <Loader2 size={28} className="brand-spin" />
                <span>Loading campaign…</span>
            </div>
        </section>
    );

    if (!campaign) return (
        <section className="brand-section brand-compact-page cp-detail-page">
            <div className="cp-detail-loading">
                <BriefcaseBusiness size={28} />
                <span>Campaign not found</span>
                <Link className="brand-secondary-btn compact" to="/brand/campaigns"><ArrowLeft size={14} />All campaigns</Link>
            </div>
        </section>
    );

    const isPublished = campaign.status === 'Published';
    const campaignForValidation = detailedCampaign || campaign;
    const campaignStartValue = campaignForValidation.startDateTime || campaignForValidation.raw?.campaignStartDate || campaignForValidation.start;
    const campaignEndValue = campaignForValidation.endDateTime || campaignForValidation.raw?.campaignEndDate || campaignForValidation.endDate;
    const applicationDeadlineValue = campaignForValidation.applicationDeadlineDateTime || campaignForValidation.raw?.applicationTimeline || campaignForValidation.end;
    const isStarted = campaignStartValue && new Date(campaignStartValue) <= new Date();
    const hasTimelines = Array.isArray(campaignForValidation.baseTimelines) && campaignForValidation.baseTimelines.length > 0;
    const hasProducts = Array.isArray(campaignForValidation.productIds) && campaignForValidation.productIds.length > 0;

    const handlePublish = async () => {
        if (publishing) return;
        setPublishing(true);
        setEditError('');
        setPublishError('');
        let latestCampaign = campaignForValidation;
        try {
            latestCampaign = await BrandCampaignService.getCampaignById(campaign.id);
            setDetailedCampaign(latestCampaign);
        } catch {
            // Keep using the current client copy and let publish surface any server error.
        }
        const latestTimelines = latestCampaign?.baseTimelines || latestCampaign?.raw?.baseTimelines || [];
        const latestProductIds = latestCampaign?.productIds || latestCampaign?.raw?.productIds || [];
        if (!Array.isArray(latestTimelines) || latestTimelines.length === 0) {
            setEditing(true);
            openEdit(latestCampaign);
            setEditError('Add at least one delivery milestone before publishing.');
            setPublishing(false);
            return;
        }
        if (!Array.isArray(latestProductIds) || latestProductIds.length === 0) {
            setEditing(true);
            openEdit(latestCampaign);
            setEditError('Select at least one brand product before publishing.');
            setPublishing(false);
            return;
        }
        try {
            await onPublish(campaign.id);
            const refreshed = await BrandCampaignService.getCampaignById(campaign.id);
            setDetailedCampaign(refreshed);
        } catch (err) {
            setPublishError(err?.message || 'Could not publish campaign');
        } finally {
            setPublishing(false);
        }
    };

    return (
        <section className="brand-section brand-compact-page cp-detail-page">
            {/* Back */}
            <Link className="cp-detail-back" to="/brand/campaigns"><ArrowLeft size={15} />All campaigns</Link>
            {publishError && <div className="brand-form-error" style={{ marginBottom: 12 }}>{publishError}</div>}

            {/* Hero */}
            <div className={`cp-detail-hero${isPublished ? ' cp-detail-hero--live' : ''}`}>
                <div className="cp-detail-hero-bg" />
                <div className="cp-detail-hero-content">
                    <div className="cp-detail-hero-left">
                        <div className="cp-detail-hero-icon">{campaign.name[0]}</div>
                        <div>
                            <div className="cp-detail-hero-meta">
                                <StatusBadge status={isPublished ? 'Active' : 'Draft'} />
                                <span className="cp-detail-hero-category">{campaign.category}</span>
                            </div>
                            <h1 className="cp-detail-hero-title">{campaign.name}</h1>
                            <p className="cp-detail-hero-sub">{campaign.platform} · {campaign.product || campaign.goal}</p>
                        </div>
                    </div>
                    <div className="cp-detail-hero-actions">
                        {!isPublished && (
                            <button
                                className="brand-primary-btn"
                                onClick={handlePublish}
                                disabled={publishing}
                                title={!hasTimelines ? 'Add delivery milestones before publishing' : 'Publish campaign'}
                            >
                                {publishing ? <Loader2 size={15} className="brand-spin" /> : <Zap size={15} />}
                                {publishing ? 'Publishing...' : 'Publish'}
                            </button>
                        )}
                        <button
                            className="brand-secondary-btn"
                            onClick={openEdit}
                            disabled={isStarted}
                            title={isStarted ? 'Campaign cannot be edited after its start date has passed' : 'Edit campaign'}
                        >
                            <Edit3 size={15} />Edit
                        </button>
                        <button className="brand-danger-btn" onClick={() => onDelete(campaign.id)}>
                            <Trash2 size={15} />Delete
                        </button>
                    </div>
                </div>
                <div className="cp-detail-kpis">
                    <div className="cp-detail-kpi">
                        <span>Budget</span>
                        <strong>{formatMoney(campaign.budgetMin)} – {formatMoney(campaign.budgetMax)}</strong>
                    </div>
                    <div className="cp-detail-kpi-divider" />
                    <div className="cp-detail-kpi">
                        <span>Creators</span>
                        <strong>{campaign.creators}</strong>
                    </div>
                    <div className="cp-detail-kpi-divider" />
                    <div className="cp-detail-kpi">
                        <span>Applicants</span>
                        <strong>{rawPipeline !== null ? rawPipeline.applicants.length : (campaign.applicants?.length ?? 0)}</strong>
                    </div>
                    <div className="cp-detail-kpi-divider" />
                    <div className="cp-detail-kpi">
                        <span>Start date & time</span>
                        <strong>{formatDateTime(campaignStartValue)}</strong>
                    </div>
                    <div className="cp-detail-kpi-divider" />
                    <div className="cp-detail-kpi">
                        <span>Apply by</span>
                        <strong>{formatDateTime(applicationDeadlineValue)}</strong>
                    </div>
                    <div className="cp-detail-kpi-divider" />
                    <div className="cp-detail-kpi">
                        <span>Ends</span>
                        <strong>{formatDateTime(campaignEndValue)}</strong>
                    </div>
                </div>
            </div>

            <Tabs tabs={['overview', 'creators', 'applications', 'content', 'analytics', 'messages']} active={tab} onChange={setTab} />

            {tab === 'overview' && (
                <div className="cp-overview-grid">
                    <article className="brand-panel cp-overview-brief">
                        <h2>Campaign Brief</h2>
                        <p>{campaign.product ? `Promote ${campaign.product} with ${campaign.category.toLowerCase()} content on ${campaign.platform}.` : 'Add product details to make this campaign easier for creators to understand.'}</p>
                        <div className="cp-brief-grid">
                            <div className="cp-brief-item">
                                <span>Deliverable</span>
                                <strong>{campaign.category}</strong>
                            </div>
                            <div className="cp-brief-item">
                                <span>Platforms</span>
                                <strong>{campaign.platform}</strong>
                            </div>
                            <div className="cp-brief-item">
                                <span>Status</span>
                                <strong>{campaign.status}</strong>
                            </div>
                            <div className="cp-brief-item">
                                <span>Product</span>
                                <strong>{campaign.product || '—'}</strong>
                            </div>
                        </div>
                    </article>
                    <article className="brand-panel cp-overview-timeline">
                        <h2>Timeline</h2>
                        <div className="cp-timeline">
                            <div className="cp-timeline-bar">
                                <div className="cp-timeline-fill" style={{ width: isPublished ? '100%' : '35%' }} />
                            </div>
                            <div className="cp-timeline-labels">
                                <span>{formatDateTime(campaignStartValue)}</span>
                                <strong className={`cp-timeline-status${isPublished ? ' published' : ''}`}>{campaign.status}</strong>
                                <span>{formatDateTime(campaignEndValue)}</span>
                            </div>
                        </div>
                        {!isPublished && (
                            <div className="cp-publish-hint">
                                <Zap size={14} />
                                <span>
                                    {!hasTimelines
                                        ? 'Add at least one delivery milestone before publishing.'
                                        : 'This campaign is in draft. Publish it to make it visible to creators.'}
                                </span>
                                <button className="brand-primary-btn compact" onClick={handlePublish} disabled={publishing}>
                                    {publishing ? 'Publishing...' : 'Publish now'}
                                </button>
                            </div>
                        )}
                    </article>
                </div>
            )}
            {tab === 'creators' && (
                pipelineLoading ? (
                    <div className="brand-empty-inline"><Loader2 size={24} className="brand-spin" /><div><strong>Loading selected creators</strong><p>Fetching campaign pipeline.</p></div></div>
                ) : (pipelineProfiles?.shortlisted || []).length ? (
                    <div className="brand-grid two">
                        {pipelineProfiles.shortlisted.map((entry) => {
                            const creator = normalizeCreatorProfile(entry.profile || getPipelineCreatorProfile(entry) || entry.creatorId);
                            return <CreatorCard key={entry.id || creator.id} creator={creator} />;
                        })}
                    </div>
                ) : (
                    <div className="brand-empty-inline"><Users size={24} /><div><strong>No selected creators yet</strong><p>Shortlisted creators from this campaign will appear here.</p></div></div>
                )
            )}
            {tab === 'applications' && (() => {
                const isLoading = pipelineLoading || rawPipeline === null;
                const isEmpty = pipelineProfiles !== null &&
                    pipelineProfiles.applicants.length === 0 &&
                    pipelineProfiles.underReview.length === 0 &&
                    pipelineProfiles.shortlisted.length === 0;

                const STAGE_LABELS = { applicants: 'New', underReview: 'Under Review', shortlisted: 'Shortlisted' };
                const STAGE_ACTIONS = {
                    applicants: { label: 'Move to Review', op: 'MOVETOREVIEW' },
                    underReview: { label: 'Shortlist', op: 'MOVETOSHORTLISTED' },
                    shortlisted: null,
                };
                const currentList = pipelineProfiles?.[pipelineTab] || [];

                const ApplicantCard = ({ a, stageKey }) => {
                    const p = a.profile || getPipelineCreatorProfile(a);
                    const displayName = p?.fullName || p?.username || 'Unknown creator';
                    const handle = p?.username ? `@${p.username}` : '';
                    const avatarLetter = displayName[0]?.toUpperCase() || '?';
                    const appliedDate = new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                    const action = STAGE_ACTIONS[stageKey];
                    const isMoving = movingApplicant === a.id;
                    const legal = stageKey === 'underReview' ? getLegalAgreementForCreator(a.id) : null;
                    const brandCampaignDone = legal?.campaignAcknowledgement?.brand === true;
                    const creatorCampaignDone = legal?.campaignAcknowledgement?.creator === true;
                    const brandLegalDone = legal?.legalAcknowledgement?.brand === true;
                    const creatorLegalDone = legal?.legalAcknowledgement?.creator === true;
                    const canShortlist = brandCampaignDone && creatorCampaignDone && brandLegalDone && creatorLegalDone;
                    return (
                        <div className="cp-applicant-card" key={a.id}>
                            <div
                                className="cp-applicant-avatar"
                                style={{ cursor: a.id ? 'pointer' : 'default' }}
                                onClick={() => a.id && navigate(`/user/${a.id}`)}
                                title={a.id ? 'View profile' : ''}
                            >
                                {p?.profileImageUrl
                                    ? <img src={p.profileImageUrl} alt={displayName} />
                                    : <span>{avatarLetter}</span>}
                            </div>
                            <div className="cp-applicant-info" style={{ cursor: a.id ? 'pointer' : 'default' }} onClick={() => a.id && navigate(`/user/${a.id}`)}>
                                <div className="cp-applicant-name-row">
                                    <strong className="cp-applicant-name">{displayName}</strong>
                                    {handle && <span className="cp-applicant-handle">{handle}</span>}
                                </div>
                                {a.proposedBid !== undefined && (
                                    <div className="cp-applicant-bid">
                                        <IndianRupee size={11} /><strong>{Number(a.proposedBid).toLocaleString('en-IN')}</strong> proposed bid
                                    </div>
                                )}
                                {p?.bio && <p className="cp-applicant-bio">{p.bio}</p>}
                                <div className="cp-applicant-meta">
                                    {p?.location && <span><MapPin size={11} />{p.location}</span>}
                                    {p?.followers !== undefined && <span><Users size={11} />{formatNum(p.followers)} followers</span>}
                                    <span><CalendarDays size={11} />{appliedDate}</span>
                                </div>
                            </div>
                            <div className="cp-applicant-actions">
                                {stageKey === 'shortlisted' ? (
                                    <span className="cp-applicant-shortlisted-badge"><Check size={11} />Shortlisted</span>
                                ) : action ? (
                                    <>
                                        {stageKey === 'underReview' && (
                                            <div className="cp-applicant-legal">
                                                <div className="cp-applicant-legal-row">
                                                    <span className={brandCampaignDone ? 'done' : ''}>{brandCampaignDone ? <Check size={10} /> : <FileText size={10} />} Brand terms</span>
                                                    <span className={creatorCampaignDone ? 'done' : ''}>{creatorCampaignDone ? <Check size={10} /> : <Lock size={10} />} Creator terms</span>
                                                </div>
                                                <div className="cp-applicant-legal-row">
                                                    <span className={brandLegalDone ? 'done' : ''}>{brandLegalDone ? <Check size={10} /> : <FileText size={10} />} Brand legal</span>
                                                    <span className={creatorLegalDone ? 'done' : ''}>{creatorLegalDone ? <Check size={10} /> : <Lock size={10} />} Creator legal</span>
                                                </div>
                                                {(!brandCampaignDone || !brandLegalDone) && (
                                                    <div className="cp-applicant-ack-actions">
                                                        {!brandCampaignDone && (
                                                            <button
                                                                className="brand-secondary-btn compact"
                                                                onClick={(e) => { e.stopPropagation(); handleAcknowledgeApplicant(a.id, 'campaign'); }}
                                                                disabled={isMoving}
                                                            >
                                                                {isMoving ? <Loader2 size={13} className="brand-spin" /> : <Check size={13} />}
                                                                Terms
                                                            </button>
                                                        )}
                                                        {!brandLegalDone && (
                                                            <button
                                                                className="brand-secondary-btn compact"
                                                                onClick={(e) => { e.stopPropagation(); handleAcknowledgeApplicant(a.id, 'legal'); }}
                                                                disabled={isMoving}
                                                            >
                                                                {isMoving ? <Loader2 size={13} className="brand-spin" /> : <Check size={13} />}
                                                                Legal
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                                {brandCampaignDone && brandLegalDone && (!creatorCampaignDone || !creatorLegalDone) && (
                                                    <span className="cp-applicant-legal-waiting">Waiting for creator</span>
                                                )}
                                            </div>
                                        )}
                                        <button
                                            className="brand-secondary-btn compact"
                                            onClick={(e) => { e.stopPropagation(); handleMoveApplicant(a.id, action.op); }}
                                            disabled={isMoving || (stageKey === 'underReview' && !canShortlist)}
                                            title={stageKey === 'underReview' && !canShortlist ? 'All brand and creator acknowledgements are required before shortlisting.' : ''}
                                        >
                                            {isMoving ? <Loader2 size={13} className="brand-spin" /> : null}
                                            {isMoving ? 'Working…' : action.label}
                                        </button>
                                    </>
                                ) : null}
                            </div>
                        </div>
                    );
                };

                return (
                    <div className="cp-applicants-section">
                        {isLoading ? (
                            <div className="cp-applicants-loading">
                                <Loader2 size={22} className="brand-spin" />
                                <span>Loading applicants…</span>
                            </div>
                        ) : isEmpty ? (
                            <div className="brand-empty-inline">
                                <Users size={24} />
                                <div>
                                    <strong>No applicants yet</strong>
                                    <p>Applicants will appear here once creators apply to your campaign.</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {moveError && (
                                    <div className="brand-form-error" style={{ marginBottom: '12px' }}>
                                        {moveError}
                                    </div>
                                )}
                                {/* Pipeline stage tabs */}
                                <div className="cp-pipeline-tabs">
                                    {Object.entries(STAGE_LABELS).map(([key, label]) => {
                                        const count = pipelineProfiles?.[key]?.length ?? 0;
                                        return (
                                            <button
                                                key={key}
                                                className={`cp-pipeline-tab${pipelineTab === key ? ' active' : ''}`}
                                                onClick={() => setPipelineTab(key)}
                                            >
                                                {label}
                                                <span className={`cp-pipeline-count${key === 'shortlisted' ? ' shortlisted' : ''}`}>{count}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                {currentList.length === 0 ? (
                                    <div className="brand-empty-inline">
                                        <Users size={20} />
                                        <div>
                                            <strong>No one here yet</strong>
                                            <p>Move applicants from the previous stage to continue.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="cp-applicants-list">
                                        {currentList.map(a => <ApplicantCard key={a.id} a={a} stageKey={pipelineTab} />)}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                );
            })()}
            {tab === 'content' && <div className="brand-empty-inline"><Image size={24} /><div><strong>No content submissions yet</strong><p>Submitted deliverables appear inside shortlisted creator threads.</p></div></div>}
            {tab === 'analytics' && <div className="brand-empty-inline"><BarChart3 size={24} /><div><strong>No campaign analytics yet</strong><p>Analytics populate after this campaign receives tracked activity.</p></div></div>}
            {tab === 'messages' && (
                <CampaignThreadsPanel
                    campaignId={id}
                    shortlisted={rawPipeline?.shortlisted || []}
                    pipelineProfiles={pipelineProfiles?.shortlisted || []}
                    legalAgreements={legalAgreements}
                    campaign={campaignForValidation}
                />
            )}

            {/* Edit drawer */}
            {editing && (
                <div className="cp-edit-overlay" onClick={() => setEditing(false)}>
                    <div className="cp-edit-drawer" onClick={e => e.stopPropagation()}>
                        <div className="cp-edit-drawer-header">
                            <div>
                                <span>Edit Campaign</span>
                                <h3>{campaign.name}</h3>
                            </div>
                            <button onClick={() => setEditing(false)} aria-label="Close"><X size={18} /></button>
                        </div>
                        <div className="cp-edit-drawer-body">
                            {editError && <div className="brand-form-error">{editError}</div>}
                            <div className="brand-form-grid">
                                <label className="wide">Campaign name
                                    <input value={editData.name} onChange={e => updateField('name', e.target.value)} placeholder="Summer Glow Reel Drop" />
                                </label>
                                <label className="wide">Product / service name
                                    <input value={editData.product} onChange={e => updateField('product', e.target.value)} placeholder="Hydra Glow Serum" />
                                </label>
                                <div className="wide">
                                    <span className="brand-label">Associated brand products {loadingProducts ? '(loading...)' : ''}</span>
                                    {products.length > 0 ? (
                                        <div className="cp-deliverable-grid">
                                            {products.map((product) => {
                                                const productId = getEntityId(product);
                                                const label = product.name || product.title || product.productName || 'Product';
                                                return (
                                                    <button
                                                        type="button"
                                                        key={productId || label}
                                                        className={`cp-deliverable-chip${(editData.productIds || []).includes(productId) ? ' selected' : ''}`}
                                                        onClick={() => toggleEditProduct(product)}
                                                    >
                                                        {label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: 12 }}>
                                            Add a brand product before publishing this campaign.
                                        </p>
                                    )}
                                </div>
                                <label>Campaign start date & time
                                    <input type="datetime-local" value={editData.startDate} onChange={e => updateField('startDate', e.target.value)} />
                                </label>
                                <label>Campaign end date & time *
                                    <input type="datetime-local" value={editData.endDate} onChange={e => updateField('endDate', e.target.value)} min={editData.startDate || undefined} />
                                </label>
                                <label>Application deadline date & time
                                    <input type="datetime-local" value={editData.applicationDeadline} onChange={e => updateField('applicationDeadline', e.target.value)} max={editData.endDate || undefined} />
                                </label>
                                <div className="wide">
                                    <span className="brand-label">Platforms</span>
                                    <ChipGroup items={['INSTAGRAM', 'YOUTUBE', 'X', 'LINKEDIN']} selected={editData.platforms} onToggle={togglePlatform} />
                                </div>
                                <label>Deliverable
                                    <select value={editData.deliverable} onChange={e => updateField('deliverable', e.target.value)}>
                                        {['REEL','POST','STORY','YOUTUBE_VIDEO','BLOG','LINKEDIN_ARTICLE','X_THREAD'].map(d => (
                                            <option key={d} value={d}>{d.replace(/_/g,' ')}</option>
                                        ))}
                                    </select>
                                </label>
                                <label>Min budget (INR)
                                    <input type="number" value={editData.budgetMin} onChange={e => updateField('budgetMin', Number(e.target.value))} />
                                </label>
                                <label>Max budget (INR)
                                    <input type="number" value={editData.budgetMax} onChange={e => updateField('budgetMax', Number(e.target.value))} />
                                </label>
                                <label>Creators to select
                                    <input type="number" value={editData.creatorCount} onChange={e => updateField('creatorCount', Number(e.target.value))} min={1} />
                                </label>
                            </div>
                            <div className="cp-edit-milestones">
                                <div className="cp-edit-milestones-header">
                                    <span className="brand-label">Delivery milestones *</span>
                                    <button type="button" className="brand-secondary-btn compact" onClick={addEditTimeline}><Plus size={13} />Add</button>
                                </div>
                                {(editData.baseTimelines || []).map((tl, i) => (
                                    <div key={i} className="tl-milestone-row">
                                        <input
                                            className="tl-milestone-input"
                                            placeholder={`Milestone ${i + 1}`}
                                            value={tl.title}
                                            required
                                            onChange={e => updateEditTimeline(i, 'title', e.target.value)}
                                        />
                                        <input
                                            type="date"
                                            className="tl-milestone-date"
                                            value={tl.deadline}
                                            required
                                            max={toDateInputValue(editData.endDate) || undefined}
                                            onChange={e => updateEditTimeline(i, 'deadline', e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="tl-milestone-remove"
                                            onClick={() => removeEditTimeline(i)}
                                            disabled={(editData.baseTimelines || []).length === 1}
                                        ><X size={13} /></button>
                                    </div>
                                ))}
                                {(!editData.baseTimelines || editData.baseTimelines.length === 0) && (
                                    <p className="cp-edit-milestones-empty">No milestones yet — required before publishing.</p>
                                )}
                            </div>
                        </div>
                        <div className="cp-edit-drawer-footer">
                            <button className="brand-secondary-btn" onClick={() => setEditing(false)}>Cancel</button>
                            <button className="brand-primary-btn" onClick={handleSave} disabled={saving}>
                                {saving ? <><Loader2 size={14} className="brand-spin" />Saving…</> : <><Check size={14} />Save changes</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

const NewCampaignView = ({ onCreated, products = [], loadingProducts = false }) => {
    const navigate = useNavigate();
    const STEPS = [
        { label: 'Basics', icon: FileText },
        { label: 'Deliverables', icon: LayoutGrid },
        { label: 'Timelines', icon: CalendarDays },
        { label: 'Budget', icon: BarChart3 },
        { label: 'Review', icon: CheckCircle2 },
    ];
    const [step, setStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [data, setData] = useState({
        name: '',
        product: '',
        platforms: ['INSTAGRAM'],
        deliverable: 'REEL',
        budgetMin: 25000,
        budgetMax: 75000,
        creatorCount: 10,
        applicationDeadline: '',
        startDate: '',
        endDate: '',
        productIds: [],
        baseTimelines: [{ title: 'Draft submission', deadline: '' }],
    });

    const update = (key, value) => { setData(cur => ({ ...cur, [key]: value })); setError(''); };
    const toggleArr = (key, val) => update(key, data[key].includes(val) ? data[key].filter(x => x !== val) : [...data[key], val]);
    const toggleProduct = (product) => {
        const productId = getEntityId(product);
        if (!productId) return;
        const nextIds = data.productIds.includes(productId)
            ? data.productIds.filter(id => id !== productId)
            : [...data.productIds, productId];
        setData(cur => ({
            ...cur,
            productIds: nextIds,
            product: nextIds.length === 1 && !cur.product.trim()
                ? (product.name || product.title || product.productName || cur.product)
                : cur.product,
        }));
        setError('');
    };
    const addTimeline = () => update('baseTimelines', [...data.baseTimelines, { title: '', deadline: '' }]);
    const removeTimeline = (i) => update('baseTimelines', data.baseTimelines.filter((_, idx) => idx !== i));
    const updateTimeline = (i, key, val) => update('baseTimelines', data.baseTimelines.map((t, idx) => idx === i ? { ...t, [key]: val } : t));

    const handleSubmit = async (publishNow = false) => {
        setSubmitting(true);
        setError('');
        try {
            if (publishNow && data.productIds.length === 0) {
                throw new Error('Select at least one brand product before publishing.');
            }
            const response = await BrandCampaignService.createCampaign(data);
            const cid = response?.campaignId || response?.data?.id;
            // baseTimelines are not saved by the create endpoint — update immediately after
            if (cid) await BrandCampaignService.updateCampaign(cid, data);
            if (publishNow && cid) await BrandCampaignService.publishCampaign(cid);
            await onCreated();
            navigate(cid ? `/brand/campaigns/${cid}` : '/brand/campaigns');
        } catch (err) {
            setError(err.message || 'Could not create campaign');
        } finally {
            setSubmitting(false);
        }
    };

    const PLATFORM_META = {
        INSTAGRAM: { icon: Instagram, color: '#E1306C' },
        YOUTUBE: { icon: Youtube, color: '#FF0000' },
        X: { icon: Globe, color: '#1DA1F2' },
        LINKEDIN: { icon: Linkedin, color: '#0A66C2' },
    };
    const DELIVERABLE_LABELS = {
        REEL: 'Reel', POST: 'Post', STORY: 'Story', YOUTUBE_VIDEO: 'YouTube Video',
        BLOG: 'Blog', LINKEDIN_ARTICLE: 'LinkedIn Article', X_THREAD: 'X Thread',
    };

    return (
        <section className="brand-section brand-compact-page cp-wizard-page">
            <div className="cp-wizard-header">
                <Link className="cp-wizard-back" to="/brand/campaigns"><ArrowLeft size={16} /></Link>
                <div>
                    <span className="cp-page-kicker">New Campaign</span>
                    <h1>Create a campaign</h1>
                </div>
            </div>

            {/* Step progress */}
            <div className="cp-wizard-steps">
                {STEPS.map((s, i) => (
                    <button
                        key={s.label}
                        className={`cp-wizard-step${i === step ? ' active' : i < step ? ' done' : ''}`}
                        onClick={() => i < step && setStep(i)}
                    >
                        <div className="cp-wizard-step-dot">
                            {i < step ? <Check size={13} /> : React.createElement(s.icon, { size: 13 })}
                        </div>
                        <span>{s.label}</span>
                    </button>
                ))}
                <div className="cp-wizard-track">
                    <div className="cp-wizard-progress" style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }} />
                </div>
            </div>

            <div className="cp-wizard-body">
                {error && <div className="brand-form-error cp-wizard-error">{error}</div>}

                {step === 0 && (
                    <div className="cp-wizard-step-panel">
                        <div className="cp-wizard-step-title">
                            <FileText size={20} />
                            <div><strong>Campaign basics</strong><span>Name your campaign and set key dates.</span></div>
                        </div>
                        <div className="brand-form-grid">
                            <label className="wide">Campaign name *
                                <input value={data.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Summer Glow Reel Drop" />
                            </label>
                            <label className="wide">Product / service name *
                                <input value={data.product} onChange={e => update('product', e.target.value)} placeholder="e.g. Hydra Glow Serum" />
                            </label>
                            <div className="wide">
                                <span className="brand-label">Associated brand products {loadingProducts ? '(loading...)' : ''}</span>
                                {products.length > 0 ? (
                                    <div className="cp-deliverable-grid">
                                        {products.map((product) => {
                                            const productId = getEntityId(product);
                                            const label = product.name || product.title || product.productName || 'Product';
                                            return (
                                                <button
                                                    type="button"
                                                    key={productId || label}
                                                    className={`cp-deliverable-chip${data.productIds.includes(productId) ? ' selected' : ''}`}
                                                    onClick={() => toggleProduct(product)}
                                                >
                                                    {label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: 12 }}>
                                        Add a brand product first if you want to publish immediately. Drafts can be saved now.
                                    </p>
                                )}
                            </div>
                            <label>Campaign start date & time *
                                <input type="datetime-local" value={data.startDate} onChange={e => update('startDate', e.target.value)} />
                            </label>
                            <label>Application deadline date & time *
                                <input type="datetime-local" value={data.applicationDeadline} onChange={e => update('applicationDeadline', e.target.value)} max={data.endDate || undefined} />
                            </label>
                            <label>Campaign end date & time *
                                <input type="datetime-local" value={data.endDate} onChange={e => update('endDate', e.target.value)} min={data.startDate || undefined} />
                            </label>
                        </div>
                    </div>
                )}

                {step === 1 && (
                    <div className="cp-wizard-step-panel">
                        <div className="cp-wizard-step-title">
                            <LayoutGrid size={20} />
                            <div><strong>Deliverables &amp; platforms</strong><span>Where and how creators will post.</span></div>
                        </div>
                        <div className="brand-form-grid">
                            <div className="wide">
                                <span className="brand-label">Platforms *</span>
                                <div className="cp-platform-chips">
                                    {Object.entries(PLATFORM_META).map(([key, meta]) => (
                                        <button
                                            type="button"
                                            key={key}
                                            className={`cp-platform-chip${data.platforms.includes(key) ? ' selected' : ''}`}
                                            onClick={() => toggleArr('platforms', key)}
                                            style={{ '--chip-color': meta.color }}
                                        >
                                            {React.createElement(meta.icon, { size: 16 })}
                                            {key.charAt(0) + key.slice(1).toLowerCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="wide">
                                <span className="brand-label">Content deliverable</span>
                                <div className="cp-deliverable-grid">
                                    {Object.entries(DELIVERABLE_LABELS).map(([key, label]) => (
                                        <button
                                            type="button"
                                            key={key}
                                            className={`cp-deliverable-chip${data.deliverable === key ? ' selected' : ''}`}
                                            onClick={() => update('deliverable', key)}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="cp-wizard-step-panel tl-wizard-step">
                        <div className="cp-wizard-step-title">
                            <CalendarDays size={20} />
                            <div>
                                <strong>Delivery milestones</strong>
                                <span>Define the deadlines creators must hit during this campaign.</span>
                            </div>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                            Each milestone becomes a separate thread where creators submit deliverables and you give feedback.
                            All deadlines must fall on or before the campaign end date ({formatDateTime(data.endDate)}).
                        </p>
                        <div className="tl-milestones-list">
                            {data.baseTimelines.map((tl, i) => (
                                <div key={i} className="tl-milestone-row">
                                    <input
                                        className="tl-milestone-input"
                                        placeholder={`Milestone ${i + 1} — e.g. Draft submission`}
                                        value={tl.title}
                                        required
                                        onChange={e => updateTimeline(i, 'title', e.target.value)}
                                    />
                                    <input
                                        type="date"
                                        className="tl-milestone-date"
                                        value={tl.deadline}
                                        required
                                        max={toDateInputValue(data.endDate) || undefined}
                                        onChange={e => updateTimeline(i, 'deadline', e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="tl-milestone-remove"
                                        onClick={() => removeTimeline(i)}
                                        disabled={data.baseTimelines.length === 1}
                                        title="Remove milestone"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button type="button" className="tl-add-milestone" onClick={addTimeline}>
                            <Plus size={14} />Add milestone
                        </button>
                    </div>
                )}

                {step === 3 && (
                    <div className="cp-wizard-step-panel">
                        <div className="cp-wizard-step-title">
                            <BarChart3 size={20} />
                            <div><strong>Budget &amp; team size</strong><span>Set your budget range and creator count.</span></div>
                        </div>
                        <div className="brand-form-grid">
                            <label>Min budget (INR)
                                <input type="number" value={data.budgetMin} min={0} onChange={e => update('budgetMin', Number(e.target.value))} />
                                <span className="cp-budget-preview">{formatMoney(data.budgetMin)}</span>
                            </label>
                            <label>Max budget (INR)
                                <input type="number" value={data.budgetMax} min={0} onChange={e => update('budgetMax', Number(e.target.value))} />
                                <span className="cp-budget-preview">{formatMoney(data.budgetMax)}</span>
                            </label>
                            <label className="wide">Number of creators to select
                                <input type="number" value={data.creatorCount} min={1} onChange={e => update('creatorCount', Number(e.target.value))} />
                            </label>
                        </div>
                        <div className="cp-budget-summary">
                            <span>Total budget range</span>
                            <strong>{formatMoney(data.budgetMin)} – {formatMoney(data.budgetMax)}</strong>
                            <span>·</span>
                            <span>{data.creatorCount} creator{data.creatorCount !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="cp-wizard-step-panel">
                        <div className="cp-wizard-step-title">
                            <CheckCircle2 size={20} />
                            <div><strong>Review &amp; launch</strong><span>Everything looks good? Save as draft or publish.</span></div>
                        </div>
                        <div className="cp-review-card">
                            <div className="cp-review-header">
                                <div className="cp-review-icon">{(data.name || 'C')[0]}</div>
                                <div>
                                    <h3>{data.name || 'Untitled campaign'}</h3>
                                    <p>{data.product || 'No product set'}</p>
                                </div>
                                <StatusBadge status="Draft" />
                            </div>
                            <div className="cp-review-grid">
                                <div className="cp-review-item"><span>Deliverable</span><strong>{DELIVERABLE_LABELS[data.deliverable]}</strong></div>
                                <div className="cp-review-item"><span>Platforms</span><strong>{data.platforms.join(', ') || 'None'}</strong></div>
                                <div className="cp-review-item"><span>Budget</span><strong>{formatMoney(data.budgetMin)} – {formatMoney(data.budgetMax)}</strong></div>
                                <div className="cp-review-item"><span>Creators</span><strong>{data.creatorCount}</strong></div>
                                <div className="cp-review-item"><span>Start date & time</span><strong>{formatDateTime(data.startDate)}</strong></div>
                                <div className="cp-review-item"><span>Apply by</span><strong>{formatDateTime(data.applicationDeadline)}</strong></div>
                                <div className="cp-review-item"><span>Campaign ends</span><strong>{formatDateTime(data.endDate)}</strong></div>
                                <div className="cp-review-item"><span>Products linked</span><strong>{data.productIds.length || 'None'}</strong></div>
                                <div className="cp-review-item"><span>Milestones</span><strong>{data.baseTimelines.length} deliverable{data.baseTimelines.length !== 1 ? 's' : ''}</strong></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer nav */}
            <div className="cp-wizard-footer">
                <button className="brand-secondary-btn" disabled={step === 0} onClick={() => setStep(s => Math.max(0, s - 1))}>
                    <ArrowLeft size={15} />Back
                </button>
                {step < STEPS.length - 1 ? (
                    <button className="brand-primary-btn" onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))}>
                        Next<ArrowRight size={15} />
                    </button>
                ) : (
                    <div className="cp-wizard-submit-group">
                        <button className="brand-secondary-btn" disabled={submitting} onClick={() => handleSubmit(false)}>
                            {submitting ? <Loader2 size={14} className="brand-spin" /> : <FileText size={14} />}Save draft
                        </button>
                        <button className="brand-primary-btn" disabled={submitting || data.productIds.length === 0} onClick={() => handleSubmit(true)}>
                            {submitting ? <Loader2 size={14} className="brand-spin" /> : <Zap size={14} />}Publish now
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

const PLATFORM_COLORS = { Instagram: '#E1306C', YouTube: '#FF0000', X: '#000', LinkedIn: '#0A66C2' };

const CreatorCard = ({ creator }) => {
    const primaryPlatform = creator.platform[0] || 'Creator';
    const platformColor = PLATFORM_COLORS[primaryPlatform] || '#F0057A';
    return (
        <article className="cr-card" style={{ '--platform-color': platformColor }}>
            <div className="cr-card-head">
                {creator.available
                    ? <span className="cr-avail-badge"><span className="cr-avail-dot" />Available</span>
                    : <span />
                }
                <div className="cr-platform-chips">
                    {creator.platform.slice(0, 2).map(p => (
                        <span key={p} className="cr-platform-chip" title={p} style={{ background: PLATFORM_COLORS[p] || '#555' }} />
                    ))}
                </div>
            </div>

            <div className="cr-card-profile">
                <div className="cr-avatar">{creator.avatar ? <img src={creator.avatar} alt={creator.name} /> : creator.name[0]}</div>
                <div className="cr-identity">
                    <div className="cr-name-row">
                        <strong>{creator.name}</strong>
                        {creator.verified && <CheckCircle2 size={13} className="cr-verified" />}
                    </div>
                    <span className="cr-handle">{creator.handle}</span>
                    <span className="cr-location"><MapPin size={10} />{creator.location}</span>
                </div>
            </div>

            <div className="cr-categories">
                {creator.category.slice(0, 2).map(c => <span key={c}>{c}</span>)}
            </div>

            <div className="cr-stats">
                <div className="cr-stat">
                    <strong>{formatNum(creator.followers)}</strong>
                    <span>Followers</span>
                </div>
                <div className="cr-stat-divider" />
                <div className="cr-stat">
                    <strong>{creator.engagement}%</strong>
                    <span>Engagement</span>
                </div>
                <div className="cr-stat-divider" />
                <div className="cr-stat">
                    <strong>{creator.deals}</strong>
                    <span>Deals</span>
                </div>
            </div>

            <div className="cr-actions">
                <Link className="cr-view-btn" to={`/brand/creators/${creator.id}`}>View profile</Link>
                <button className="cr-save-btn" title="Shortlist creator from a campaign applicant list" disabled><Bookmark size={14} /></button>
            </div>
        </article>
    );
};

const CreatorsView = () => {
    const [query, setQuery] = useState('');
    const [platform, setPlatform] = useState('all');
    const [category, setCategory] = useState('all');
    const [creatorList, setCreatorList] = useState([]);
    const [loadingCreators, setLoadingCreators] = useState(true);

    useEffect(() => {
        let active = true;
        setLoadingCreators(true);
        UserService.getAllUsers()
            .then(users => {
                if (active) setCreatorList((users || []).map(normalizeCreatorProfile));
            })
            .catch(() => {
                if (active) setCreatorList([]);
            })
            .finally(() => {
                if (active) setLoadingCreators(false);
            });
        return () => { active = false; };
    }, []);

    const filtered = creatorList.filter(c => {
        const matchPlatform = platform === 'all' || c.platform.includes(platform);
        const matchCategory = category === 'all' || c.category.some(cat => cat.toLowerCase().includes(category.toLowerCase()));
        const matchQuery = `${c.name} ${c.handle}`.toLowerCase().includes(query.toLowerCase());
        return matchPlatform && matchCategory && matchQuery;
    });
    const verifiedCount = creatorList.filter(c => c.verified).length;
    const connectedCount = creatorList.filter(c => c.platform.length > 0).length;

    return (
        <section className="brand-section brand-compact-page brand-creators-page">
            <PageHeader title="Creators" accent="Directory" description="Discover verified creators, filter by niche, and build your collaboration roster." />

            <div className="cr-roster-strip">
                {[['Creators', creatorList.length, Users], ['Verified', verifiedCount, CheckCircle2], ['With social links', connectedCount, Link2], ['Available profiles', creatorList.length, Eye]].map(([label, count, Icon]) => (
                    <div className="cr-roster-item" key={label}>
                        <div className="cr-roster-icon">{React.createElement(Icon, { size: 15 })}</div>
                        <strong>{count}</strong>
                        <span>{label}</span>
                    </div>
                ))}
            </div>

            <div className="cr-toolbar">
                <div className="brand-input-icon cr-search-wrap">
                    <Search size={15} />
                    <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name or handle…" />
                </div>
                <div className="cr-filter-group">
                    <select value={platform} onChange={e => setPlatform(e.target.value)}>
                        <option value="all">All platforms</option>
                        <option>Instagram</option>
                        <option>YouTube</option>
                        <option>X</option>
                        <option>LinkedIn</option>
                    </select>
                    <select value={category} onChange={e => setCategory(e.target.value)}>
                        <option value="all">All categories</option>
                        <option value="beauty">Beauty</option>
                        <option value="fashion">Fashion</option>
                        <option value="wellness">Wellness</option>
                        <option value="tech">Tech</option>
                        <option value="food">Food</option>
                        <option value="travel">Travel</option>
                        <option value="fitness">Fitness</option>
                    </select>
                </div>
                <span className="cr-result-count">{filtered.length} creator{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            {loadingCreators ? (
                <div className="brand-empty-inline">
                    <Loader2 size={24} className="brand-spin" />
                    <div><strong>Loading creators</strong><p>Fetching live creator profiles.</p></div>
                </div>
            ) : filtered.length === 0 ? (
                <div className="brand-empty-inline">
                    <Users size={24} />
                    <div><strong>No creators found</strong><p>Try adjusting your filters or search query.</p></div>
                </div>
            ) : (
                <div className="cr-grid">
                    {filtered.map(c => <CreatorCard creator={c} key={c.id} />)}
                </div>
            )}
        </section>
    );
};

const CreatorDetailView = () => {
    const { id } = useParams();
    const [creator, setCreator] = useState(null);
    const [loadingCreator, setLoadingCreator] = useState(true);
    const [tab, setTab] = useState('stats');

    useEffect(() => {
        let active = true;
        setLoadingCreator(true);
        UserService.getUserById(id)
            .then(data => {
                const raw = data?.profile || data?.result || data;
                if (active) setCreator(normalizeCreatorProfile(raw));
            })
            .catch(() => {
                if (active) setCreator(null);
            })
            .finally(() => {
                if (active) setLoadingCreator(false);
            });
        return () => { active = false; };
    }, [id]);

    if (loadingCreator) {
        return (
            <section className="brand-section brand-compact-page brand-creator-detail-page">
                <PageHeader title="Creator profile" actions={<Link className="brand-secondary-btn" to="/brand/creators"><ArrowLeft size={16} />Back</Link>} />
                <div className="brand-empty-inline"><Loader2 size={24} className="brand-spin" /><div><strong>Loading creator</strong><p>Fetching live profile data.</p></div></div>
            </section>
        );
    }

    if (!creator) {
        return (
            <section className="brand-section brand-compact-page brand-creator-detail-page">
                <PageHeader title="Creator profile" actions={<Link className="brand-secondary-btn" to="/brand/creators"><ArrowLeft size={16} />Back</Link>} />
                <EmptyPanel icon={Users} title="Creator not found" message="This creator profile could not be loaded." action={<Link className="brand-primary-btn" to="/brand/creators">Back to creators</Link>} />
            </section>
        );
    }

    const activePlatforms = creator.platform.length ? creator.platform : ['Profile'];

    return (
        <section className="brand-section brand-compact-page brand-creator-detail-page">
            <PageHeader title="Creator profile" actions={<Link className="brand-secondary-btn" to="/brand/creators"><ArrowLeft size={16} />Back</Link>} />
            <article className="brand-profile-hero compact">
                <div className="brand-avatar xlarge">{creator.avatar ? <img src={creator.avatar} alt={creator.name} /> : creator.name[0]}</div>
                <div>
                    <h2>{creator.name}{creator.verified && <CheckCircle2 size={18} />}{creator.available && <StatusBadge status="Available" />}</h2>
                    <p>{creator.handle}</p>
                    <span><MapPin size={14} />{creator.location} - {creator.category.join(' - ')}</span>
                    <p>{creator.bio || 'No creator bio added yet.'}</p>
                    <div className="brand-overview-stats">
                        <div><strong>{formatNum(creator.followers)}</strong><span>Total reach</span></div>
                        <div><strong>{creator.deals}</strong><span>Deals done</span></div>
                        <div><strong>{creator.platform.length}</strong><span>Linked channels</span></div>
                    </div>
                </div>
                <div className="brand-profile-actions"><Link className="brand-primary-btn" to="/brand/campaigns/new"><Send size={16} />Create brief</Link><Link className="brand-secondary-btn" to="/brand/campaigns"><Plus size={16} />Use in campaign</Link></div>
            </article>
            <Tabs tabs={['stats', 'expertise', 'proof']} active={tab} onChange={setTab} />
            {tab === 'stats' && <div className="brand-grid two">{activePlatforms.map((platform) => <article className="brand-panel" key={platform}><h2>{platform}</h2><div className="brand-info-grid"><span><strong>{formatNum(creator.followers)}</strong>followers</span><span><strong>{creator.engagement}%</strong>engagement</span><span><strong>{creator.verified ? 'Verified' : 'Profile data'}</strong>source</span></div></article>)}</div>}
            {tab === 'expertise' && <CreatorExpertise creator={creator} />}
            {tab === 'proof' && <article className="brand-panel"><div className="brand-info-grid"><span><strong><Star size={17} />{creator.rating || '—'}</strong>Brand rating</span><span><strong>{creator.verified ? 'Verified' : 'Unverified'}</strong>Account status</span></div></article>}
        </section>
    );
};

const MessagesView = ({ campaigns = [], loadingCampaigns }) => {
    const liveThreads = campaigns.flatMap((campaign) => (
        (campaign.raw?.shortlisted || []).flatMap((entry) => (
            (entry.threads || []).map((thread) => ({
                id: thread._id,
                campaignId: campaign.id,
                campaignName: campaign.name,
                creator: normalizeCreatorProfile(entry.creatorId),
                messageCount: thread.messages?.length || 0,
                milestoneCount: thread.timelines?.length || 0,
            }))
        ))
    ));

    return (
        <section className="brand-section brand-compact-page brand-messages-page">
            <PageHeader title="Messages" description="Live creator threads from shortlisted campaign applicants." />
            {loadingCampaigns ? (
                <div className="brand-empty-inline"><Loader2 size={24} className="brand-spin" /><div><strong>Loading threads</strong><p>Fetching campaign conversations.</p></div></div>
            ) : liveThreads.length ? (
                <article className="brand-panel">
                    <div className="brand-data-table simple">
                        {liveThreads.map((thread) => <div className="brand-data-row" key={thread.id}><strong>{thread.creator.name}</strong><span>{thread.campaignName}</span><span>{thread.messageCount} messages · {thread.milestoneCount} milestones</span><Link className="brand-secondary-btn compact" to={`/brand/campaigns/${thread.campaignId}`}>Open</Link></div>)}
                    </div>
                </article>
            ) : (
                <EmptyPanel icon={MessageCircle} title="No live message threads yet" message="Move campaign applicants to shortlisted to seed a real thread with campaign milestones." action={<Link className="brand-primary-btn" to="/brand/campaigns">Review campaigns</Link>} />
            )}
        </section>
    );
};

const AnalyticsView = ({ campaigns: campaignList = [], loadingCampaigns }) => {
    const [analytics, setAnalytics] = useState(null);
    const [loadingAnalytics, setLoadingAnalytics] = useState(true);

    useEffect(() => {
        BrandService.getAnalytics()
            .then(data => setAnalytics(data))
            .catch(() => setAnalytics(null))
            .finally(() => setLoadingAnalytics(false));
    }, []);

    const publishedCount = campaignList.filter(c => c.status === 'Published').length;
    const totalApplicants = campaignList.reduce((sum, c) => sum + (c.applicants?.length || 0), 0);

    const fmt = (v) => (v !== undefined && v !== null) ? formatNum(v) : '—';
    const monthlyCampaigns = useMemo(() => {
        const now = new Date();
        return Array.from({ length: 6 }, (_, index) => {
            const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
            const month = date.toLocaleString('en-US', { month: 'short' });
            const count = campaignList.filter(c => {
                if (!c.createdAt) return false;
                const created = new Date(c.createdAt);
                return created.getFullYear() === date.getFullYear() && created.getMonth() === date.getMonth();
            }).length;
            return { month, clicks: count };
        });
    }, [campaignList]);
    const platformData = useMemo(() => {
        const counts = new Map();
        campaignList.forEach(c => (c.platforms || []).forEach(platform => counts.set(platform, (counts.get(platform) || 0) + 1)));
        return Array.from(counts, ([name, value]) => ({ name: labelFromEnum(name), value }));
    }, [campaignList]);
    const categoryData = useMemo(() => {
        const counts = new Map();
        campaignList.forEach(c => {
            const key = c.category || 'Campaign';
            counts.set(key, (counts.get(key) || 0) + 1);
        });
        return Array.from(counts, ([name, value]) => ({ name, value }));
    }, [campaignList]);

    return (
    <section className="brand-section brand-compact-page brand-analytics-page">
        <div className="ba-page-header">
            <div>
                <span className="ba-page-kicker">Reporting</span>
                <h1>Analytics</h1>
            </div>
            <button className="brand-secondary-btn"><Download size={16} />Export PDF</button>
        </div>
        {(loadingAnalytics || loadingCampaigns) && (
            <div className="ba-fetch-bar"><Loader2 size={14} className="brand-spin" /><span>Loading analytics…</span></div>
        )}
        <div className="ba-kpi-row">
            <AnalyticsStat icon={Users} label="Total applications" value={loadingAnalytics ? '…' : fmt(analytics?.totalApplications)} detail="All campaigns" />
            <AnalyticsStat icon={BriefcaseBusiness} label="Campaigns this month" value={loadingAnalytics ? '…' : fmt(analytics?.currentMonthCampaigns?.count)} detail={loadingCampaigns ? '' : `${campaignList.length} total`} />
            <AnalyticsStat icon={TrendingUp} label="All campaigns" value={loadingAnalytics ? '…' : fmt(analytics?.allCampaigns?.count)} detail="Ever created" />
            <AnalyticsStat icon={BriefcaseBusiness} label="Published" value={loadingCampaigns ? '…' : publishedCount} detail="Live now" />
            <AnalyticsStat icon={Users} label="Applicants (session)" value={loadingCampaigns ? '…' : totalApplicants} detail="Loaded campaigns" />
            <AnalyticsStat icon={MousePointerClick} label="Creators needed" value={loadingCampaigns ? '…' : campaignList.reduce((s, c) => s + (c.creators || 0), 0)} detail="Across all campaigns" />
        </div>
        <div className="ba-charts-grid">
            <article className="ba-chart-panel ba-chart-wide">
                <div className="ba-chart-header">
                    <div><h3>Monthly campaign volume</h3><span>Last 6 months · Live campaigns</span></div>
                </div>
                <LineAreaChart data={monthlyCampaigns} />
            </article>
            <article className="ba-chart-panel">
                <div className="ba-chart-header">
                    <div><h3>Campaigns by platform</h3><span>Based on selected campaign platforms</span></div>
                </div>
                {platformData.length ? <HorizBarChart data={platformData} /> : <div className="brand-empty-inline"><BarChart3 size={22} /><div><strong>No platform data</strong><p>Create campaigns with selected platforms to populate this chart.</p></div></div>}
            </article>
            <article className="ba-chart-panel">
                <div className="ba-chart-header">
                    <div><h3>Campaigns by deliverable</h3><span>Live campaign breakdown</span></div>
                </div>
                {categoryData.length ? <DonutChart data={categoryData} /> : <div className="brand-empty-inline"><BarChart3 size={22} /><div><strong>No deliverable data</strong><p>Create campaigns to populate this chart.</p></div></div>}
            </article>
            <article className="ba-chart-panel ba-chart-wide">
                <div className="ba-chart-header">
                    <div><h3>Top creators by clicks</h3><span>Performance ranking</span></div>
                </div>
                <CreatorLeaderboard campaigns={campaignList} />
            </article>
        </div>
        <article className="ba-chart-panel">
            <div className="ba-chart-header">
                <div><h3>Attribution setup</h3><span>Connect verified purchases and revenue tracking.</span></div>
            </div>
            <div className="ba-attribution-list">
                {[
                    { name: 'Attribution Pixel', connected: true },
                    { name: 'Shopify App', connected: false },
                    { name: 'WooCommerce', connected: false },
                    { name: 'Server Postback', connected: false },
                ].map(({ name, connected }) => (
                    <div className="ba-attribution-item" key={name}>
                        <div className={`ba-attribution-icon${connected ? ' ba-attribution-icon--on' : ''}`}><Plug size={14} /></div>
                        <div className="ba-attribution-info">
                            <strong>{name}</strong>
                            <span>{connected ? 'Connected' : 'Not connected'}</span>
                        </div>
                        <div className={`ba-attribution-badge${connected ? ' ba-attribution-badge--on' : ''}`}>{connected ? 'Active' : 'Inactive'}</div>
                        <button className={connected ? 'brand-secondary-btn compact' : 'brand-primary-btn compact'}>{connected ? 'Test' : 'Connect'}</button>
                    </div>
                ))}
            </div>
        </article>
    </section>
    );
};

const BrandPageEditorView = ({ brandName, profile, products, loadingProducts, onCreateProduct, onDeleteProduct, onEdit }) => {
    const industries = profile?.industry || [];
    const location = [profile?.location?.city, profile?.location?.state].filter(Boolean).join(', ');
    const profileId = profile?._id || profile?.id;

    return (
        <section className="brand-section brand-compact-page bpe-section">
            <div className="bpe-header">
                <div>
                    <span className="ba-page-kicker">Public page</span>
                    <h1>Brand Page Editor</h1>
                    <p className="bpe-subhead">Everything here is shown on your public brand profile.</p>
                </div>
                {profileId && (
                    <Link className="brand-secondary-btn" to={`/brand-profile/${profileId}`}>
                        <ExternalLink size={14} />View live
                    </Link>
                )}
            </div>

            <div className="bpe-grid">
                {/* ── Profile card ── */}
                <article className="bpe-card bpe-card--profile">
                    <div className="bpe-card-top">
                        <div className="bpe-avatar">
                            {profile?.logoUrl
                                ? <img src={profile.logoUrl} alt={brandName} />
                                : <span>{brandName[0]?.toUpperCase()}</span>}
                        </div>
                        <div className="bpe-brand-meta">
                            <h2>{brandName}<CheckCircle2 size={15} className="bpe-verified" /></h2>
                            {profile?.description && <p className="bpe-desc">{profile.description}</p>}
                        </div>
                    </div>
                    <div className="bpe-fields">
                        <div className="bpe-field">
                            <span className="bpe-field-label">Location</span>
                            <span className="bpe-field-value">{location || <span className="bpe-empty">Not set</span>}</span>
                        </div>
                        <div className="bpe-field">
                            <span className="bpe-field-label">Website</span>
                            <span className="bpe-field-value">
                                {profile?.contact?.website
                                    ? <a href={profile.contact.website} target="_blank" rel="noopener noreferrer">{profile.contact.website}</a>
                                    : <span className="bpe-empty">Not set</span>}
                            </span>
                        </div>
                        <div className="bpe-field bpe-field--full">
                            <span className="bpe-field-label">Industries</span>
                            <div className="bpe-chips">
                                {industries.length
                                    ? industries.map(i => <span key={i} className="bpe-chip">{i}</span>)
                                    : <span className="bpe-empty">Not set</span>}
                            </div>
                        </div>
                        <div className="bpe-field">
                            <span className="bpe-field-label">Collaborations</span>
                            <span className="bpe-field-value">
                                <span className={`bpe-collab-dot ${profile?.collaborationInfo?.collaborationOpen ? 'open' : 'closed'}`} />
                                {profile?.collaborationInfo?.collaborationOpen ? 'Open' : 'Closed'}
                            </span>
                        </div>
                    </div>
                    <button className="brand-primary-btn compact" onClick={onEdit}>
                        <Edit3 size={14} />Edit profile
                    </button>
                </article>

                {/* ── Products ── */}
                <article className="bpe-card bpe-card--products">
                    <div className="bpe-card-header">
                        <div>
                            <strong>Products</strong>
                            <span>{products.length} listed on your public page</span>
                        </div>
                        <button className="brand-primary-btn compact" onClick={onCreateProduct}>
                            <Plus size={14} />Add
                        </button>
                    </div>
                    {loadingProducts ? (
                        <div className="brand-products-loading">
                            {[1, 2, 3].map(i => <div key={i} className="brand-product-skeleton" />)}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="brand-empty-inline">
                            <Package size={22} />
                            <div>
                                <strong>No products yet</strong>
                                <p>Add products so creators can see what they'll be promoting.</p>
                            </div>
                            <button className="brand-primary-btn compact" onClick={onCreateProduct}>
                                <Plus size={14} />Add Product
                            </button>
                        </div>
                    ) : (
                        <div className="brand-product-grid">
                            {products.map(p => <ProductCard key={p._id} product={p} onDelete={onDeleteProduct} />)}
                        </div>
                    )}
                </article>
            </div>
        </section>
    );
};

const fmtPaise = (paise) => `₹${(Number(paise || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const BillingTab = ({ profile }) => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loadingTx, setLoadingTx] = useState(true);
    const [txError, setTxError] = useState('');

    const isPro = profile?.subscription?.plan !== 'free' && profile?.subscription?.status === 'active';
    const planEnd = profile?.subscription?.currentPeriodEnd;

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoadingTx(true);
            try {
                const data = await UserService.getSubscriptionTransactions();
                // Deduplicate by paymentId — prefer entries with invoiceUrl
                const seen = new Map();
                data.forEach((tx) => {
                    const key = tx.razorpayPaymentId || tx._id;
                    if (!seen.has(key) || tx.invoiceUrl) seen.set(key, tx);
                });
                setTransactions([...seen.values()]);
            } catch {
                setTxError('Could not load transaction history.');
            } finally {
                setLoadingTx(false);
            }
        };
        fetchTransactions();
    }, []);

    const formatDate = (iso) => {
        if (!iso) return '—';
        const d = new Date(iso);
        if (d.getFullYear() <= 1970) return '—';
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="billing-wrap">
            {/* ── Plan card ── */}
            <div className={`billing-plan-card${isPro ? ' billing-plan-card--pro' : ' billing-plan-card--free'}`}>
                <div className="billing-plan-left">
                    <span className="billing-plan-badge">
                        {isPro ? <Crown size={13} strokeWidth={2.5} /> : <Zap size={13} strokeWidth={2.5} />}
                        {isPro ? 'Brand Pro' : 'Free Plan'}
                    </span>
                    <div className="billing-plan-price">
                        <span className="billing-plan-amount">{isPro ? '₹3,499' : '₹0'}</span>
                        <span className="billing-plan-period">/month</span>
                    </div>
                    <p className="billing-plan-desc">
                        {isPro
                            ? planEnd
                                ? `Renews on ${formatDate(planEnd)}`
                                : 'Your subscription renews automatically'
                            : 'Explore creators and view your basic brand profile'}
                    </p>
                </div>
                <div className="billing-plan-actions">
                    {!isPro && (
                        <button className="brand-primary-btn" onClick={() => navigate('/brand/subscription')}>
                            <Crown size={14} />
                            Upgrade to Pro
                        </button>
                    )}
                    <button
                        className={isPro ? 'brand-secondary-btn billing-manage-btn' : 'brand-secondary-btn billing-manage-btn billing-manage-btn--ghost'}
                        onClick={() => navigate('/brand/subscription')}
                    >
                        {isPro ? 'Manage subscription' : 'View plans'}
                    </button>
                </div>
            </div>

            {/* ── Transaction history ── */}
            <article className="brand-panel">
                <div className="brand-panel-title">
                    <div>
                        <strong>Transaction History</strong>
                        <span>All payments made for your Dropp subscription</span>
                    </div>
                </div>

                {loadingTx ? (
                    <div className="billing-state-center">
                        <Loader2 size={22} className="brand-spin" />
                    </div>
                ) : txError ? (
                    <div className="billing-state-center billing-state-error">
                        <FileText size={20} />
                        <span>{txError}</span>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="billing-state-center billing-state-empty">
                        <div className="billing-empty-icon"><FileText size={24} /></div>
                        <strong>No transactions yet</strong>
                        <span>Your payment history will appear here after your first subscription payment.</span>
                    </div>
                ) : (
                    <div className="billing-tx-table">
                        <div className="billing-tx-header">
                            <span>Date</span>
                            <span>Plan</span>
                            <span className="billing-col-hide-sm">Method</span>
                            <span>Amount</span>
                            <span>Status</span>
                            <span>Invoice</span>
                        </div>
                        {transactions.map((tx) => (
                            <div className="billing-tx-row" key={tx._id}>
                                <span className="billing-tx-date">{formatDate(tx.createdAt)}</span>
                                <span className="billing-tx-plan">
                                    {tx.plan === 'BrandPremium' ? 'Brand Pro' : tx.plan}
                                </span>
                                <span className="billing-tx-method billing-col-hide-sm">
                                    {tx.paymentMethod || '—'}
                                </span>
                                <span className="billing-tx-amount">
                                    ₹{Number(tx.amount).toLocaleString('en-IN')}
                                </span>
                                <span>
                                    <span className={`billing-tx-status billing-tx-status--${tx.status}`}>
                                        {tx.status}
                                    </span>
                                </span>
                                <span>
                                    {tx.invoiceUrl ? (
                                        <a
                                            href={tx.invoiceUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="billing-tx-link"
                                        >
                                            <ExternalLink size={12} />
                                            View
                                        </a>
                                    ) : (
                                        <span className="billing-tx-na">—</span>
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </article>
        </div>
    );
};

const NOTIF_ITEMS = [
    { label: 'New application', desc: 'When a creator applies to your campaign' },
    { label: 'New message', desc: 'When a creator sends you a message' },
    { label: 'Campaign milestone', desc: 'Deliverable submitted, approved, or rejected' },
    { label: 'Deal status change', desc: 'Offer accepted, declined, or countered' },
    { label: 'Creator review posted', desc: 'A creator leaves a review on a deal' },
    { label: 'Deadline reminders', desc: '48 h and 24 h before a campaign deadline' },
];

const ST_INTEGRATIONS = [
    { name: 'Instagram', icon: Instagram, status: 'connected', desc: 'Track mentions and post performance' },
    { name: 'YouTube', icon: Youtube, status: 'connected', desc: 'Sync video campaigns and analytics' },
    { name: 'Attribution Pixel', icon: MousePointerClick, status: 'connected', desc: 'Track clicks and conversions' },
    { name: 'Webhooks', icon: Plug, status: 'disconnected', desc: 'Push real-time events to your backend' },
];

const SettingsView = ({ brandName, profile, onEdit, onSaved }) => {
    const [tab, setTab] = useState('profile');
    const [saving, setSaving] = useState(false);
    const [logoUploading, setLogoUploading] = useState(false);
    const [error, setError] = useState('');
    const [draft, setDraft] = useState({
        brandName: brandName || '',
        website: profile?.contact?.website || '',
        city: profile?.location?.city || '',
        state: profile?.location?.state || '',
        supportEmail: profile?.contact?.supportEmail || '',
        whatsappBusinessNumber: profile?.contact?.whatsappBusinessNumber || '',
    });
    const logoInputRef = useRef(null);
    const logoUrl = typeof profile?.logoUrl === 'string' && profile.logoUrl.trim() ? profile.logoUrl.trim() : '';

    const handleLogoChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLogoUploading(true);
        setError('');
        try {
            const fd = new FormData();
            fd.append('logo', file);
            const response = await BrandService.updateProfile(fd);
            const updated = response?.data || response?.brand || response;
            if (updated) onSaved(updated);
        } catch (err) {
            setError(err.message || 'Logo upload failed');
        } finally {
            setLogoUploading(false);
            e.target.value = '';
        }
    };

    useEffect(() => {
        setDraft({
            brandName: brandName || '',
            website: profile?.contact?.website || '',
            city: profile?.location?.city || '',
            state: profile?.location?.state || '',
            supportEmail: profile?.contact?.supportEmail || '',
            whatsappBusinessNumber: profile?.contact?.whatsappBusinessNumber || '',
        });
    }, [brandName, profile]);

    const setField = (key, value) => setDraft(prev => ({ ...prev, [key]: value }));

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            const payload = {};
            if (draft.brandName.trim()) payload.brandName = draft.brandName.trim();
            const loc = {};
            if (draft.city.trim()) loc.city = draft.city.trim();
            if (draft.state.trim()) loc.state = draft.state.trim();
            if (Object.keys(loc).length) payload.location = loc;
            const contact = {};
            if (draft.website.trim()) contact.website = draft.website.trim();
            if (draft.supportEmail.trim()) contact.supportEmail = draft.supportEmail.trim();
            if (draft.whatsappBusinessNumber.trim()) contact.whatsappBusinessNumber = draft.whatsappBusinessNumber.trim();
            if (Object.keys(contact).length) payload.contact = contact;
            if (!Object.keys(payload).length) return;
            const response = await BrandService.updateProfile(payload);
            const updated = response?.data || response?.brand || response;
            if (updated) onSaved(updated);
        } catch (err) {
            setError(err.message || 'Could not save settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="brand-section brand-compact-page brand-settings-page">
            <PageHeader title="Settings" description="Manage your brand profile, team, billing, and account preferences." />
            <Tabs tabs={['profile', 'team', 'notifications', 'billing', 'integrations', 'privacy']} active={tab} onChange={setTab} />

            {/* ── Profile ── */}
            {tab === 'profile' && (
                <article className="brand-panel st-profile-panel">
                    <div className="st-identity-card">
                        <div className="st-logo-avatar">
                            {logoUrl ? <img src={logoUrl} alt={brandName} /> : brandName[0]}
                        </div>
                        <div className="st-identity-info">
                            <p className="st-identity-name">{brandName}</p>
                            <p className="st-identity-email">{profile?.email || '—'}</p>
                        </div>
                        <input
                            ref={logoInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleLogoChange}
                        />
                        <button
                            className="brand-secondary-btn compact"
                            onClick={() => logoInputRef.current?.click()}
                            disabled={logoUploading}
                        >
                            {logoUploading ? <><Loader2 size={14} className="brand-spin" />Uploading…</> : 'Change logo'}
                        </button>
                    </div>
                    {error && <div className="brand-form-error">{error}</div>}
                    <span className="st-section-label">Brand details</span>
                    <div className="brand-form-grid">
                        <label>Brand name<input value={draft.brandName} onChange={e => setField('brandName', e.target.value)} /></label>
                        <label>Website<input value={draft.website} onChange={e => setField('website', e.target.value)} placeholder="https://yoursite.com" /></label>
                        <label>City<input value={draft.city} onChange={e => setField('city', e.target.value)} placeholder="Mumbai" /></label>
                        <label>State<input value={draft.state} onChange={e => setField('state', e.target.value)} placeholder="Maharashtra" /></label>
                    </div>
                    <span className="st-section-label">Contact</span>
                    <div className="brand-form-grid">
                        <label>Support email<input value={draft.supportEmail} onChange={e => setField('supportEmail', e.target.value)} placeholder="support@brand.com" /></label>
                        <label>WhatsApp<input value={draft.whatsappBusinessNumber} onChange={e => setField('whatsappBusinessNumber', e.target.value)} placeholder="+91 XXXXX XXXXX" /></label>
                    </div>
                    <div className="st-profile-actions">
                        <button className="brand-primary-btn" onClick={onEdit}>Edit full profile</button>
                        <button className="brand-secondary-btn" onClick={handleSave} disabled={saving}>{saving ? <><Loader2 size={15} className="brand-spin" />Saving…</> : 'Save changes'}</button>
                    </div>
                </article>
            )}

            {/* ── Team ── */}
            {tab === 'team' && (
                <article className="brand-panel">
                    <div className="brand-panel-title">
                        <div>
                            <strong>Team members</strong>
                            <span>{team.length} members · manage roles and access</span>
                        </div>
                        <button className="brand-primary-btn compact"><Plus size={14} />Invite member</button>
                    </div>
                    <div className="st-member-list">
                        {team.map(member => (
                            <div className="st-member-row" key={member.email}>
                                <div className="st-member-avatar">{member.name[0]}</div>
                                <div className="st-member-info">
                                    <strong>{member.name}</strong>
                                    <span>{member.email}</span>
                                </div>
                                <span className={`st-role-badge st-role-badge--${member.role.toLowerCase()}`}>{member.role}</span>
                                <button className="brand-icon-btn danger" title="Remove"><Trash2 size={15} /></button>
                            </div>
                        ))}
                    </div>
                </article>
            )}

            {/* ── Notifications ── */}
            {tab === 'notifications' && (
                <article className="brand-panel st-notif-panel">
                    <div className="brand-panel-title">
                        <div>
                            <strong>Notification preferences</strong>
                            <span>Choose how and when you get notified</span>
                        </div>
                    </div>
                    <div className="st-notif-wrap">
                        {NOTIF_ITEMS.map(({ label, desc }) => (
                            <div className="st-notif-item" key={label}>
                                <div className="st-notif-content">
                                    <strong>{label}</strong>
                                    <span>{desc}</span>
                                </div>
                                <div className="st-notif-toggles">
                                    <div className="st-notif-toggle-col">
                                        <span className="st-notif-toggle-label">In-app</span>
                                        <label className="st-toggle">
                                            <input type="checkbox" defaultChecked />
                                            <span className="st-toggle-track"><span className="st-toggle-thumb" /></span>
                                        </label>
                                    </div>
                                    <div className="st-notif-toggle-col">
                                        <span className="st-notif-toggle-label">Email</span>
                                        <label className="st-toggle">
                                            <input type="checkbox" defaultChecked />
                                            <span className="st-toggle-track"><span className="st-toggle-thumb" /></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </article>
            )}

            {/* ── Billing ── */}
            {tab === 'billing' && <BillingTab profile={profile} />}

            {/* ── Integrations ── */}
            {tab === 'integrations' && (
                <div className="st-integrations-grid">
                    {ST_INTEGRATIONS.map(({ name, icon: Icon, status, desc }) => (
                        <article className="st-integration-card" key={name}>
                            <div className="st-integration-icon-wrap">
                                <Icon size={22} />
                            </div>
                            <div className="st-integration-body">
                                <strong>{name}</strong>
                                <span>{desc}</span>
                                <div className="st-integration-footer">
                                    <span className={`st-conn-badge st-conn-badge--${status}`}>
                                        <span className="st-conn-dot" />
                                        {status === 'connected' ? 'Connected' : 'Not connected'}
                                    </span>
                                    <button className="brand-secondary-btn compact">
                                        {status === 'connected' ? 'Manage' : 'Connect'}
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {/* ── Privacy ── */}
            {tab === 'privacy' && (
                <div className="st-privacy-stack">
                    <article className="st-privacy-card">
                        <div className="st-privacy-icon-wrap">
                            <Download size={22} />
                        </div>
                        <div className="st-privacy-body">
                            <strong>Export your data</strong>
                            <p>Download a complete copy of everything Dropp has stored for your brand — campaigns, analytics, and account history.</p>
                        </div>
                        <button className="brand-secondary-btn">Request export</button>
                    </article>
                    <article className="st-privacy-card">
                        <div className="st-privacy-icon-wrap st-privacy-icon-wrap--danger">
                            <Trash2 size={22} />
                        </div>
                        <div className="st-privacy-body">
                            <strong>Delete brand account</strong>
                            <p>Permanently remove this brand and all associated campaigns, analytics, and creator history. This cannot be undone.</p>
                        </div>
                        <button className="brand-danger-btn">Delete account</button>
                    </article>
                </div>
            )}
        </section>
    );
};

const CATEGORIES = [
    'Beauty & Personal Care', 'Fashion & Apparel', 'Health & Wellness', 'Food & Beverage',
    'Technology & Electronics', 'Home & Lifestyle', 'Sports & Fitness', 'Travel & Hospitality',
    'Entertainment & Media', 'Education', 'Retail & E-Commerce', 'Other',
];

const CreateProductModal = ({ onClose, onCreated }) => {
    const fileRef = useRef(null);
    const [form, setForm] = useState({ name: '', link: '', desc: '', category: '', tags: '' });
    const [previews, setPreviews] = useState([]);
    const [files, setFiles] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const handleFiles = (e) => {
        const selected = e.target.files;
        if (!selected?.length) return;
        setFiles(selected);
        const urls = Array.from(selected).map(f => URL.createObjectURL(f));
        setPreviews(urls);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) { setError('Product name is required.'); return; }
        if (!form.link.trim()) { setError('Product link is required.'); return; }
        if (!form.desc.trim()) { setError('Product description is required.'); return; }
        if (!form.category) { setError('Product category is required.'); return; }
        if (!files?.length) { setError('Upload at least one product image or video.'); return; }
        setSubmitting(true);
        setError('');
        try {
            await BrandProductService.createProduct({ ...form, mediaFiles: files });
            onCreated();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Could not create product');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="brand-modal-overlay" onClick={onClose}>
            <div className="brand-edit-modal brand-product-modal" onClick={e => e.stopPropagation()}>
                <div className="brand-edit-modal-header">
                    <div>
                        <span>Brand Products</span>
                        <h2>Add Product</h2>
                    </div>
                    <button onClick={onClose} aria-label="Close"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    {error && <div className="brand-form-error">{error}</div>}
                    <div className="brand-form-grid">
                        <label className="wide">
                            Product name *
                            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Protekt Sunscreen SPF 50" required />
                        </label>
                        <label className="wide">
                            Product link *
                            <input value={form.link} onChange={e => set('link', e.target.value)} placeholder="https://your-store.com/product" type="url" required />
                        </label>
                        <label className="wide">
                            Description *
                            <textarea rows={3} value={form.desc} onChange={e => set('desc', e.target.value)} placeholder="Short product description..." required />
                        </label>
                        <label>
                            Category *
                            <select value={form.category} onChange={e => set('category', e.target.value)} required>
                                <option value="">Select a category</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </label>
                        <label>
                            Tags <span style={{ textTransform: 'none', letterSpacing: 0, fontSize: '0.75rem', fontWeight: 400, color: 'inherit' }}>(comma separated)</span>
                            <input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="sunscreen, spf, skincare" />
                        </label>
                        <div className="wide brand-product-upload-area" onClick={() => fileRef.current?.click()}>
                            <input ref={fileRef} type="file" accept="image/*,video/*" multiple style={{ display: 'none' }} onChange={handleFiles} required />
                            {previews.length > 0 ? (
                                <div className="brand-product-previews">
                                    {previews.map((url, i) => <img key={i} src={url} alt="" />)}
                                </div>
                            ) : (
                                <div className="brand-product-upload-placeholder">
                                    <Image size={24} />
                                    <span>Click to upload product images or videos</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="brand-form-actions" style={{ marginTop: 20 }}>
                        <button type="button" className="brand-secondary-btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="brand-primary-btn" disabled={submitting}>
                            {submitting ? <><Loader2 size={15} className="brand-spin" />Creating…</> : <><Plus size={15} />Create Product</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ProductCard = ({ product, onDelete }) => {
    const [deleting, setDeleting] = useState(false);
    const img = product.media?.[0]?.url;
    const handleDelete = async (e) => {
        e.preventDefault();
        if (!window.confirm(`Delete "${product.name}"?`)) return;
        setDeleting(true);
        try { await BrandProductService.deleteProduct(product._id); onDelete(product._id); }
        catch { setDeleting(false); }
    };
    return (
        <article className="brand-product-card">
            <div className="brand-product-img-wrap">
                {img
                    ? <img src={img} alt={product.name} className="brand-product-img" />
                    : <div className="brand-product-img-placeholder"><Package size={28} /></div>}
            </div>
            <div className="brand-product-body">
                <h4>{product.name}</h4>
                {product.desc && <p className="brand-product-desc">{product.desc}</p>}
                {product.category?.length > 0 && (
                    <div className="brand-product-tags">
                        <Tag size={11} />
                        {product.category.map(c => <span key={c}>{c}</span>)}
                    </div>
                )}
                <div className="brand-product-footer">
                    <a href={product.link} target="_blank" rel="noopener noreferrer" className="brand-secondary-btn compact">
                        <Link2 size={13} />View
                    </a>
                    <button className="brand-danger-btn compact" onClick={handleDelete} disabled={deleting}>
                        {deleting ? <Loader2 size={13} className="brand-spin" /> : <Trash2 size={13} />}
                    </button>
                </div>
            </div>
        </article>
    );
};

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const DeadlineCalendar = ({ campaigns }) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const todayDate = today.getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const deadlineMap = {};
    campaigns.forEach(c => {
        if (!c.end) return;
        const d = new Date(c.end);
        if (isNaN(d.getTime())) return;
        if (d.getFullYear() === year && d.getMonth() === month) {
            const day = d.getDate();
            if (!deadlineMap[day]) deadlineMap[day] = [];
            deadlineMap[day].push(c);
        }
    });

    const cells = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const upcomingEntries = Object.entries(deadlineMap)
        .sort(([a], [b]) => Number(a) - Number(b))
        .flatMap(([day, cams]) => cams.map(c => ({ day: Number(day), campaign: c })));

    return (
        <div className="bh-calendar">
            <div className="bh-calendar-head">
                <strong className="bh-calendar-month">{MONTHS[month]} {year}</strong>
                {upcomingEntries.length > 0 && (
                    <span className="bh-calendar-count">{upcomingEntries.length} deadline{upcomingEntries.length !== 1 ? 's' : ''}</span>
                )}
            </div>
            <div className="bh-calendar-weekdays">
                {WEEKDAYS.map(d => <span key={d}>{d}</span>)}
            </div>
            <div className="bh-calendar-grid">
                {cells.map((day, i) => {
                    if (day === null) return <div key={`e-${i}`} className="bh-cal-cell bh-cal-empty" />;
                    const isToday = day === todayDate;
                    const deadlines = deadlineMap[day];
                    return (
                        <div key={day} className={`bh-cal-cell${isToday ? ' bh-cal-today' : ''}${deadlines ? ' bh-cal-event-day' : ''}`}>
                            <span className="bh-cal-num">{day}</span>
                            {deadlines && <span className="bh-cal-dot" />}
                        </div>
                    );
                })}
            </div>
            {upcomingEntries.length > 0 && (
                <div className="bh-cal-events">
                    {upcomingEntries.slice(0, 4).map(({ day, campaign }) => (
                        <Link key={campaign.id} to={`/brand/campaigns/${campaign.id}`} className="bh-cal-event-row">
                            <span className="bh-cal-event-date">{MONTHS[month].slice(0, 3)} {day}</span>
                            <span className="bh-cal-event-name">{campaign.name}</span>
                            <StatusBadge status={campaign.status} />
                        </Link>
                    ))}
                </div>
            )}
            {upcomingEntries.length === 0 && (
                <div className="bh-cal-empty-msg">
                    <CalendarDays size={20} />
                    <span>No deadlines this month</span>
                </div>
            )}
        </div>
    );
};

const ExploreProductCard = ({ product, onClick, onDelete }) => {
    const [deleting, setDeleting] = useState(false);
    const [hovered, setHovered] = useState(false);
    const img = product.media?.[0]?.url || (typeof product.media?.[0] === 'string' ? product.media[0] : null);
    const category = Array.isArray(product.category) ? product.category[0] : product.category;

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (!window.confirm(`Delete "${product.name}"?`)) return;
        setDeleting(true);
        try { await BrandProductService.deleteProduct(product._id); onDelete(product._id); }
        catch { setDeleting(false); }
    };
    return (
        <div
            className="pcard"
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onClick()}
        >
            <div className="pcard-media">
                {img ? (
                    <img src={img} alt={product.name} loading="lazy" />
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160, color: 'var(--text-tertiary)' }}>
                        <Package size={32} />
                    </div>
                )}

                {category && <span className="pcard-cat">{category}</span>}

                <div className="pcard-overlay" onClick={e => e.stopPropagation()}>
                    <div className="pcard-overlay-actions">
                        <span />
                        <div className="pcard-icon-btns">
                            {onDelete && (
                                <button
                                    className="pcard-icon-btn"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    title="Delete"
                                >
                                    {deleting ? <Loader2 size={13} className="brand-spin" /> : <Trash2 size={13} />}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="pcard-info">
                <h4 className="pcard-title">{product.name}</h4>
                {product.desc && (
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0', lineHeight: '1.45', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {product.desc}
                    </p>
                )}
            </div>
        </div>
    );
};

const ProductDetailModal = ({ product, brandName, onClose }) => {
    const [activeImg, setActiveImg] = useState(0);
    const imgs = product.media?.filter(m => m?.url) ?? [];
    return (
        <div className="ep-modal-overlay" onClick={onClose}>
            <div className="ep-modal" onClick={e => e.stopPropagation()}>
                <button className="ep-modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
                <div className="ep-modal-layout">
                    <div className="ep-modal-gallery">
                        <div className="ep-modal-main-img">
                            {imgs.length > 0
                                ? <img src={imgs[activeImg].url} alt={product.name} />
                                : <div className="ep-modal-img-placeholder"><Package size={52} /></div>}
                        </div>
                        {imgs.length > 1 && (
                            <div className="ep-modal-thumbs">
                                {imgs.map((m, i) => (
                                    <button key={i} className={`ep-modal-thumb${i === activeImg ? ' active' : ''}`} onClick={() => setActiveImg(i)}>
                                        <img src={m.url} alt="" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="ep-modal-info">
                        <div className="ep-modal-brand-row">
                            <div className="ep-modal-brand-avatar">{brandName[0]?.toUpperCase()}</div>
                            <div>
                                <span className="ep-modal-brand-label">Posted by</span>
                                <strong className="ep-modal-brand-name">{brandName}</strong>
                            </div>
                            <span className="ep-modal-verified"><CheckCircle2 size={14} />Verified Brand</span>
                        </div>
                        <h2 className="ep-modal-title">{product.name}</h2>
                        {product.desc && <p className="ep-modal-desc">{product.desc}</p>}
                        {product.category?.length > 0 && (
                            <div className="ep-modal-cats">
                                {product.category.map(c => <span key={c}>{c}</span>)}
                            </div>
                        )}
                        {product.tags && (
                            <div className="ep-modal-tags">
                                <Tag size={12} />
                                {String(product.tags).split(',').map(t => t.trim()).filter(Boolean).map(t => <span key={t}>{t}</span>)}
                            </div>
                        )}
                        <div className="ep-modal-actions">
                            <a href={product.link} target="_blank" rel="noopener noreferrer" className="brand-primary-btn">
                                <ExternalLink size={15} />Visit Product
                            </a>
                            <button className="brand-secondary-btn">
                                <MessageCircle size={15} />Message Brand
                            </button>
                        </div>
                        <div className="ep-modal-footer">
                            <Globe size={13} />
                            <a href={product.link} target="_blank" rel="noopener noreferrer">{product.link}</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ExploreView = () => (
    <section className="brand-section brand-compact-page ep-section">
        <ProductFeed defaultTab="brand" />
    </section>
);

const NotificationsView = ({ notifications: notifList = [], unreadCount, markAsRead, markAllAsRead }) => (
    <section className="brand-section brand-compact-page brand-notifications-page">
        <PageHeader
            title="Notifications"
            description="Stay updated on campaign activity and creator interactions."
            actions={unreadCount > 0 ? <button className="brand-secondary-btn compact" onClick={markAllAsRead}>Mark all as read</button> : null}
        />
        {notifList.length > 0 ? (
            <div className="brand-message-list">
                {notifList.map((notification) => {
                    const id = notification._id || notification.id;
                    const date = new Date(notification.createdAt);
                    const now = new Date();
                    const diffSec = Math.max(0, Math.floor((now - date) / 1000));
                    const timeLabel = diffSec < 60 ? 'Just now' : diffSec < 3600 ? `${Math.floor(diffSec / 60)}m` : diffSec < 86400 ? `${Math.floor(diffSec / 3600)}h` : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    return (
                        <article
                            className={`brand-message${!notification.hasRead ? ' unread' : ''}`}
                            key={id}
                            onClick={() => !notification.hasRead && markAsRead(id)}
                            style={!notification.hasRead ? { cursor: 'pointer' } : {}}
                        >
                            <div className="brand-notif-icon"><Bell size={18} /></div>
                            <div><strong>{getNotificationMessage(notification)}</strong></div>
                            <span>{timeLabel}</span>
                        </article>
                    );
                })}
            </div>
        ) : (
            <EmptyPanel icon={Bell} title="No notifications yet" message="When creators interact with your campaigns, you'll see updates here." />
        )}
    </section>
);

const ProfileView = ({ brandName, profile, loadingProfile, logoUrl, location, socialLinks, onEdit }) => (
    <section className="brand-section brand-compact-page brand-profile-page">
        {loadingProfile ? <div className="brand-card">Loading brand profile...</div> : (
            <div className="brand-profile-pro">
                <div className="brand-profile-cover">
                    <Link className="brand-profile-corner brand-profile-corner--left" to="/brand/settings" aria-label="Settings">
                        <Settings size={18} />
                    </Link>
                    <div className="brand-profile-cover-inner">
                        <div className="brand-profile-logo-wrap">
                            {logoUrl ? <img src={logoUrl} alt={brandName} className="brand-profile-logo" referrerPolicy="no-referrer" onError={(event) => { event.currentTarget.style.display = 'none'; event.currentTarget.nextElementSibling.style.display = 'grid'; }} /> : null}
                            <div className="brand-profile-logo-fallback" style={{ display: logoUrl ? 'none' : 'grid' }}>{brandName[0]?.toUpperCase() || 'B'}</div>
                        </div>
                        <div className="brand-profile-main-copy">
                            <div className="brand-profile-kicker"><CheckCircle2 size={16} />Brand account</div>
                            <h1>{brandName}</h1>
                            <p>{profile?.description || 'Add a brand description to help creators understand your products and collaboration goals.'}</p>
                            <div className="brand-profile-meta">{profile?.legalName && <span>{profile.legalName}</span>}{location && <span><MapPin size={15} />{location}</span>}</div>
                        </div>
                        <button className="brand-profile-edit-btn" onClick={onEdit}><Edit3 size={18} />Edit Profile</button>
                    </div>
                </div>
                <div className="brand-profile-content-grid">
                    <article className="brand-profile-panel wide"><h2>Brand Overview</h2><div className="brand-industry-list">{(profile?.industry?.length ? profile.industry : ['No industries selected']).map((industry) => <span key={industry}>{industry}</span>)}</div><div className="brand-overview-stats"><div><strong>{profile?.collaborationInfo?.collaborationTypes?.length || 0}</strong><span>Collaboration Types</span></div><div><strong>{profile?.collaborationInfo?.collaborationOpen ? 'Open' : 'Paused'}</strong><span>Creator Outreach</span></div><div><strong>{profile?.createdAt ? new Date(profile.createdAt).getFullYear() : 'New'}</strong><span>Joined</span></div></div></article>
                    <article className="brand-profile-panel"><h2>Contact</h2><div className="brand-contact-list">{profile?.contact?.website && <a href={profile.contact.website} target="_blank" rel="noopener noreferrer"><Globe size={17} />Website</a>}{profile?.contact?.supportEmail && <a href={`mailto:${profile.contact.supportEmail}`}><Mail size={17} />{profile.contact.supportEmail}</a>}{profile?.contact?.whatsappBusinessNumber && <span><MessageCircle size={17} />{profile.contact.whatsappBusinessNumber}</span>}</div></article>
                    <article className="brand-profile-panel"><h2>Social Links</h2><div className="brand-contact-list">{socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"><Instagram size={17} />Instagram</a>}{socialLinks.youtube && <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer"><Youtube size={17} />YouTube</a>}{socialLinks.linkedin && <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin size={17} />LinkedIn</a>}{!socialLinks.instagram && !socialLinks.youtube && !socialLinks.linkedin && <span>No social links added</span>}</div></article>
                    <article className="brand-profile-panel wide"><h2>Collaboration Preferences</h2><p>{profile?.collaborationInfo?.collaborationOpen ? 'This brand is currently open to new creator partnerships.' : 'This brand has paused new creator partnerships.'}</p><div className="brand-industry-list">{(profile?.collaborationInfo?.collaborationTypes?.length ? profile.collaborationInfo.collaborationTypes : ['No collaboration types added']).map((type) => <span key={type}>{type.replace('_', ' ')}</span>)}</div></article>
                </div>
            </div>
        )}
    </section>
);

const Tabs = ({ tabs, active, onChange, counts = {} }) => (
    <div className="brand-tabs">{tabs.map((tab) => <button key={tab} className={active === tab ? 'active' : ''} onClick={() => onChange(tab)}>{tab.replace('-', ' ')}{counts[tab] !== undefined ? ` (${counts[tab]})` : ''}</button>)}</div>
);

const ChipGroup = ({ items, selected, onToggle }) => <div className="brand-chip-grid">{items.map((item) => <button type="button" className={selected.includes(item) ? 'brand-chip selected' : 'brand-chip'} key={item} onClick={() => onToggle(item)}>{item}</button>)}</div>;

const CreatorRows = ({ creators: creatorList }) => <article className="brand-data-table">{creatorList.map((creator) => <div className="brand-data-row creator-row" key={creator.id}><div><strong>{creator.name}</strong><small>{creator.handle}</small></div><StatusBadge status={creator.verified ? 'Verified' : 'Pending'} /><strong>{formatNum(creator.followers || 0)}</strong><div><Link className="brand-icon-btn" to={`/brand/creators/${creator.id}`}><Eye size={15} /></Link></div></div>)}</article>;

const ApplicationRows = ({ applications: applicationList }) => <article className="brand-panel"><div className="brand-mini-list">{applicationList.length ? applicationList.map((application) => <div key={application.id}><div className="brand-avatar small">{application.creator[0]}</div><div><strong>{application.creator}</strong><span>{formatNum(application.followers)} followers - {application.applied}</span></div><StatusBadge status={application.status} /><button className="brand-primary-btn compact"><Check size={14} />Shortlist</button></div>) : <p>No applications yet.</p>}</div></article>;

const ContentReview = ({ creators: creatorList }) => <div className="brand-grid three">{creatorList.slice(0, 3).map((creator) => <article className="brand-card" key={creator.id}><div className="brand-post-thumb">{creator.name[0]}</div><h3>{creator.name}</h3><p>Content appears here after campaign thread submissions.</p><StatusBadge status="Pending" /></article>)}</div>;

const CreatorExpertise = ({ creator }) => <article className="brand-data-table simple">{creator.category.map((category) => <div className="brand-data-row" key={category}><strong>{category}</strong><span>Profile interest</span><span>{creator.verified ? 'Verified account' : 'Unverified account'}</span><span>{creator.platform.length ? `${creator.platform.length} linked channel${creator.platform.length !== 1 ? 's' : ''}` : 'No linked channels'}</span></div>)}</article>;

const DONUT_COLORS = ['#F0057A', '#7C3AED', '#0A66C2', '#E1306C', '#10B981'];

const LineAreaChart = ({ data }) => {
    const [hovered, setHovered] = useState(null);
    const W = 560, H = 164, padL = 46, padR = 12, padT = 18, padB = 28;
    const chartData = data.length ? data : [{ month: '', clicks: 0 }];
    const vals = chartData.map(d => d.clicks);
    const maxV = Math.max(...vals), minV = Math.min(...vals), range = maxV - minV || 1;
    const cxFn = (i) => padL + (i / Math.max(chartData.length - 1, 1)) * (W - padL - padR);
    const cyFn = (v) => padT + (1 - (v - minV) / range) * (H - padT - padB);
    const pts = chartData.map((d, i) => [cxFn(i), cyFn(d.clicks)]);
    const lineD = pts.reduce((acc, [x, y], i) => {
        if (i === 0) return `M ${x} ${y}`;
        const [px, py] = pts[i - 1];
        const m = (x + px) / 2;
        return `${acc} C ${m} ${py},${m} ${y},${x} ${y}`;
    }, '');
    const areaD = `${lineD} L ${pts.at(-1)[0]} ${H - padB} L ${pts[0][0]} ${H - padB} Z`;
    const gridVals = [0, 0.33, 0.66, 1].map(t => minV + t * range);
    const segW = (W - padL - padR) / Math.max(chartData.length - 1, 1);

    const getTip = (i) => {
        const tx = pts[i][0], ty = pts[i][1];
        const tW = 74, tH = 38;
        return {
            tx, ty, tW, tH,
            tX: Math.min(Math.max(tx - tW / 2, padL), W - padR - tW),
            tY: Math.max(2, ty - tH - 10),
        };
    };

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="ba-line-chart" onMouseLeave={() => setHovered(null)}>
            <defs>
                <linearGradient id="ba-lg" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#F0057A" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#F0057A" stopOpacity="0" />
                </linearGradient>
            </defs>
            {gridVals.map((v, i) => {
                const y = cyFn(v);
                return <g key={i}>
                    <line x1={padL} x2={W - padR} y1={y} y2={y} className="ba-grid-line" strokeWidth="1" />
                    <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="9" className="ba-axis-text" fontFamily="sans-serif">{formatNum(Math.round(v))}</text>
                </g>;
            })}
            <path d={areaD} fill="url(#ba-lg)" />
            <path d={lineD} fill="none" stroke="#F0057A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {pts.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={hovered === i ? 5 : 3} fill="#F0057A" stroke="white" strokeWidth="1.5" style={{ transition: 'r 0.1s' }} />
            ))}
            {chartData.map((d, i) => (
                <text key={i} x={cxFn(i)} y={H - 5} textAnchor="middle" fontSize="9" className="ba-axis-text" fontFamily="sans-serif">{d.month}</text>
            ))}
            {/* Wide transparent hit zones so hover works between dots too */}
            {chartData.map((d, i) => (
                <rect key={`hit-${i}`} x={cxFn(i) - segW / 2} y={padT} width={segW} height={H - padT - padB}
                    fill="transparent" onMouseEnter={() => setHovered(i)} style={{ cursor: 'crosshair' }} />
            ))}
            {hovered !== null && (() => {
                const { tx, ty, tX, tY, tW, tH } = getTip(hovered);
                return <>
                    <line x1={tx} x2={tx} y1={padT} y2={H - padB} stroke="#F0057A" strokeWidth="1" strokeDasharray="3 3" opacity="0.35" />
                    <rect x={tX} y={tY} width={tW} height={tH} rx="6" className="ba-tooltip-bg" />
                    <text x={tX + tW / 2} y={tY + 13} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.65)" fontFamily="sans-serif">{chartData[hovered].month}</text>
                    <text x={tX + tW / 2} y={tY + 28} textAnchor="middle" fontSize="11" fontWeight="800" fill="white" fontFamily="sans-serif">{chartData[hovered].clicks.toLocaleString('en-IN')}</text>
                </>;
            })()}
        </svg>
    );
};

const HorizBarChart = ({ data }) => {
    const max = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="ba-horiz-bars">
            {data.map(d => (
                <div key={d.name} className="ba-horiz-bar-row">
                    <span className="ba-horiz-bar-label">{d.name}</span>
                    <div className="ba-horiz-bar-track">
                        <div className="ba-horiz-bar-fill" style={{ width: `${(d.value / max) * 100}%`, background: PLATFORM_COLORS[d.name] || '#F0057A' }} />
                    </div>
                    <span className="ba-horiz-bar-val">{formatNum(d.value)}</span>
                </div>
            ))}
        </div>
    );
};

const DonutChart = ({ data }) => {
    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    const R = 52, ccx = 70, ccy = 70, sw = 22, circ = 2 * Math.PI * R;
    let off = 0;
    const slices = data.map((d, i) => {
        const dash = (d.value / total) * circ;
        const s = { off, dash, gap: circ - dash, color: DONUT_COLORS[i % DONUT_COLORS.length] };
        off += dash;
        return s;
    });
    return (
        <div className="ba-donut-wrap">
            <svg viewBox="0 0 140 140" className="ba-donut-svg" aria-hidden="true">
                {slices.map((s, i) => (
                    <circle key={i} cx={ccx} cy={ccy} r={R} fill="none" stroke={s.color} strokeWidth={sw}
                        strokeDasharray={`${s.dash} ${s.gap}`} strokeDashoffset={-s.off}
                        style={{ transform: 'rotate(-90deg)', transformOrigin: `${ccx}px ${ccy}px` }} />
                ))}
                <text x={ccx} y={ccy - 6} textAnchor="middle" fontSize="17" fontWeight="800" className="ba-donut-text-val" fontFamily="sans-serif">{formatNum(total)}</text>
                <text x={ccx} y={ccy + 11} textAnchor="middle" fontSize="9" className="ba-donut-text-sub" fontFamily="sans-serif">campaigns</text>
            </svg>
            <div className="ba-donut-legend">
                {data.map((d, i) => (
                    <div key={d.name} className="ba-donut-legend-item">
                        <span className="ba-donut-dot" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                        <span className="ba-donut-legend-label">{d.name}</span>
                        <span className="ba-donut-legend-val">{formatNum(d.value)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const CreatorLeaderboard = ({ campaigns = [] }) => {
    const entries = campaigns
        .flatMap((campaign) => campaign.applicants || [])
        .map((entry) => normalizeCreatorProfile(entry.creatorId || entry.creator || entry))
        .filter((creator) => creator.id)
        .slice(0, 6)
        .map((creator) => ({ ...creator, clicks: 0 }));

    if (!entries.length) {
        return <div className="brand-empty-inline"><Users size={22} /><div><strong>No creator performance yet</strong><p>Creator click rankings appear after campaigns receive applications and tracked traffic.</p></div></div>;
    }

    const max = Math.max(...entries.map(entry => entry.clicks), 1);
    return (
        <div className="ba-leaderboard">
            {entries.map((c, i) => (
                <div key={c.id} className="ba-lb-row">
                    <span className="ba-lb-rank">{i + 1}</span>
                    <div className="ba-lb-avatar">{c.name[0]}</div>
                    <div className="ba-lb-info">
                        <strong>{c.name}</strong>
                        <span>{c.handle}</span>
                    </div>
                    <div className="ba-lb-bar-wrap">
                        <div className="ba-lb-bar" style={{ width: `${(c.clicks / max) * 100}%` }} />
                    </div>
                    <strong className="ba-lb-val">{formatNum(c.clicks)}</strong>
                </div>
            ))}
        </div>
    );
};

const GATE_CONFIG = {
    dashboard:       { title: 'Campaign Analytics',    desc: 'Track impressions, clicks, conversions, and ROI across all your campaigns.' },
    analytics:       { title: 'Advanced Analytics',    desc: 'Deep-dive into creator performance, audience reach, and spend efficiency.' },
    campaigns:       { title: 'Campaign Management',   desc: 'Create, publish, and manage influencer campaigns end-to-end.' },
    'new-campaign':  { title: 'Create Campaigns',      desc: 'Launch targeted influencer campaigns and reach millions of consumers.' },
    'campaign-detail': { title: 'Campaign Details',   desc: 'View applications, manage creators, and track deliverables per campaign.' },
    chats:           { title: 'Direct Messaging',      desc: 'Communicate directly with creators to brief, approve, and manage deals.' },
    messages:        { title: 'Direct Messaging',      desc: 'Communicate directly with creators to brief, approve, and manage deals.' },
    'brand-page':    { title: 'Brand Page Editor',     desc: 'Build a premium brand presence on Dropp with custom content and products.' },
};

const PremiumGate = ({ feature }) => {
    const navigate = useNavigate();
    const config = GATE_CONFIG[feature] || { title: 'Premium Feature', desc: 'Upgrade to Pro to unlock this feature.' };
    return (
        <section className="brand-section brand-gate-wrap">
            <div className="brand-gate">
                <div className="brand-gate-icon">
                    <Lock size={28} strokeWidth={1.8} />
                </div>
                <span className="brand-gate-kicker">
                    <Crown size={12} strokeWidth={2.5} />
                    Pro Feature
                </span>
                <h2 className="brand-gate-title">{config.title}</h2>
                <p className="brand-gate-desc">{config.desc}</p>
                <button
                    className="brand-gate-cta"
                    onClick={() => navigate('/brand/subscription')}
                >
                    <Crown size={15} strokeWidth={2.5} />
                    Upgrade to Pro
                </button>
                <p className="brand-gate-hint">₹3,499/month · Cancel anytime</p>
            </div>
        </section>
    );
};

const LOCKED_PAGES = new Set([
    'dashboard', 'analytics', 'campaigns', 'new-campaign', 'campaign-detail',
    'chats', 'messages', 'brand-page',
]);

const BrandPortal = ({ page = 'home' }) => {
    const { user, updateUser } = useAuth();
    const { notifications: realNotifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(user);
    const [loadingProfile, setLoadingProfile] = useState(page === 'profile');
    const [campaignList, setCampaignList] = useState([]);
    const [loadingCampaigns, setLoadingCampaigns] = useState(true);
    const [campaignError, setCampaignError] = useState('');
    const [editOpen, setEditOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [createProductOpen, setCreateProductOpen] = useState(false);

    useEffect(() => {
        let active = true;
        const loadProfile = async () => {
            if (page === 'profile') setLoadingProfile(true);
            try {
                const data = await BrandService.getProfile();
                if (active) {
                    setProfile(data);
                    updateUser(data);
                }
            } catch (error) {
                console.error('Failed to load brand profile:', error);
            } finally {
                if (active && page === 'profile') setLoadingProfile(false);
            }
        };
        loadProfile();
        return () => {
            active = false;
        };
    }, [page, updateUser]);

    const loadCampaigns = useCallback(async () => {
        setLoadingCampaigns(true);
        setCampaignError('');
        try {
            const data = await BrandCampaignService.getCampaigns();
            setCampaignList(data);
        } catch (error) {
            setCampaignError(error.message || 'Failed to load campaigns');
        } finally {
            setLoadingCampaigns(false);
        }
    }, []);

    useEffect(() => {
        loadCampaigns();
    }, [loadCampaigns]);

    const loadProducts = useCallback(async () => {
        setLoadingProducts(true);
        try {
            const data = await BrandProductService.getMyProducts();
            setProducts(data);
        } catch {
            setProducts([]);
        } finally {
            setLoadingProducts(false);
        }
    }, []);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const handleDeleteProduct = useCallback((productId) => {
        setProducts(prev => prev.filter(p => p._id !== productId));
    }, []);

    const brandName = profile?.brandName || profile?.email || 'Brand Studio';
    const logoUrl = typeof profile?.logoUrl === 'string' && profile.logoUrl.trim() ? profile.logoUrl.trim() : '';
    const location = [profile?.location?.city, profile?.location?.state, profile?.location?.pincode].filter(Boolean).join(', ');
    const socialLinks = useMemo(() => profile?.contact?.socialLinks || {}, [profile]);

    const handleProfileUpdate = (updatedProfile) => {
        setProfile(updatedProfile);
        updateUser(updatedProfile);
    };

    const handlePublishCampaign = useCallback(async (campaignId) => {
        try {
            setCampaignError('');
            await BrandCampaignService.publishCampaign(campaignId);
            await loadCampaigns();
        } catch (error) {
            setCampaignError(error.message || 'Could not publish campaign');
            throw error;
        }
    }, [loadCampaigns]);

    const handleDeleteCampaign = useCallback(async (campaignId) => {
        try {
            await BrandCampaignService.deleteCampaign(campaignId);
            await loadCampaigns();
            if (page === 'campaign-detail') navigate('/brand/campaigns');
        } catch (error) {
            setCampaignError(error.message || 'Could not delete campaign');
        }
    }, [loadCampaigns, navigate, page]);

    const handleUpdateCampaign = useCallback(async (campaignId, form) => {
        try {
            await BrandCampaignService.updateCampaign(campaignId, form);
            await loadCampaigns();
        } catch (error) {
            setCampaignError(error.message || 'Could not update campaign');
        }
    }, [loadCampaigns]);

    const productProps = {
        products,
        loadingProducts,
        onCreateProduct: () => setCreateProductOpen(true),
        onDeleteProduct: handleDeleteProduct,
    };

    const isPro = profile?.subscription?.plan !== 'free' && profile?.subscription?.status === 'active';

    const content = useMemo(() => {
        // Free-tier gate: block locked pages until brand upgrades
        if (!isPro && LOCKED_PAGES.has(page)) {
            return <PremiumGate feature={page} />;
        }

        const profileProps = { brandName, profile, loadingProfile, logoUrl, location, socialLinks, onEdit: () => setEditOpen(true) };
        const campaignProps = {
            campaigns: campaignList,
            loading: loadingCampaigns,
            error: campaignError,
            onRefresh: loadCampaigns,
            onDelete: handleDeleteCampaign,
            onPublish: handlePublishCampaign,
            onUpdate: handleUpdateCampaign,
        };
        switch (page) {
            case 'explore': return <ExploreView />;
            case 'dashboard': return <AnalyticsView campaigns={campaignList} loadingCampaigns={loadingCampaigns} />;
            case 'campaigns': return <CampaignsView {...campaignProps} />;
            case 'campaign-detail': return <CampaignDetailView {...campaignProps} products={products} loadingProducts={loadingProducts} />;
            case 'new-campaign': return <NewCampaignView onCreated={loadCampaigns} products={products} loadingProducts={loadingProducts} />;
            case 'creators': return <CreatorsView />;
            case 'creator-detail': return <CreatorDetailView />;
            case 'chats':
            case 'messages': return <MessagesView campaigns={campaignList} loadingCampaigns={loadingCampaigns} />;
            case 'analytics': return <AnalyticsView campaigns={campaignList} loadingCampaigns={loadingCampaigns} />;
            case 'brand-page': return <BrandPageEditorView brandName={brandName} profile={profile} onEdit={() => setEditOpen(true)} {...productProps} />;
            case 'notifications': return <NotificationsView notifications={realNotifications} unreadCount={unreadCount} markAsRead={markAsRead} markAllAsRead={markAllAsRead} />;
            case 'settings': return <SettingsView brandName={brandName} profile={profile} onEdit={() => setEditOpen(true)} onSaved={handleProfileUpdate} />;
            case 'profile': return <ProfileView {...profileProps} />;
            default: return <HomeView brandName={brandName} campaigns={campaignList} loadingCampaigns={loadingCampaigns} isPro={isPro} unreadCount={unreadCount} />;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPro, brandName, campaignError, campaignList, handleDeleteCampaign, handlePublishCampaign, handleUpdateCampaign, loadCampaigns, loadingCampaigns, loadingProfile, location, logoUrl, page, products, loadingProducts, profile, socialLinks, realNotifications, unreadCount, markAsRead, markAllAsRead]);

    return (
        <div className="brand-portal-page">
            <BrandTopbar brandName={brandName} unreadCount={unreadCount} />
            {content}
            {editOpen && <BrandProfileEditModal profile={profile} onClose={() => setEditOpen(false)} onUpdate={handleProfileUpdate} />}
            {createProductOpen && (
                <CreateProductModal
                    onClose={() => setCreateProductOpen(false)}
                    onCreated={loadProducts}
                />
            )}
        </div>
    );
};

export default BrandPortal;
