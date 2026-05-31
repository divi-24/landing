import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, ArrowRight, BriefcaseBusiness, Building2, CalendarDays,
    Check, CheckCircle2, ChevronDown, Clock, ExternalLink, Globe, IndianRupee,
    Instagram, Linkedin, Loader, Loader2, MapPin, Package, Search,
    Users, X, Youtube, Zap, AlertCircle, Briefcase, Crown,
} from 'lucide-react';
import BrandCampaignService, { formatCampaignDateTime } from '../core/services/BrandCampaignService';
import BrandService from '../core/services/BrandService';
import { useAuth } from '../contexts/AuthContext';
import '../styles/CampaignsExplore.css';

/* ─── constants ─── */
const PLATFORM_COLORS = {
    INSTAGRAM: '#E1306C', YOUTUBE: '#FF0000', X: '#000000', LINKEDIN: '#0A66C2',
};
const PLATFORM_ICONS = { INSTAGRAM: Instagram, YOUTUBE: Youtube, X: Globe, LINKEDIN: Linkedin };
const DELIVERABLE_LABELS = {
    REEL: 'Reel', POST: 'Post', STORY: 'Story', YOUTUBE_VIDEO: 'YouTube Video',
    BLOG: 'Blog', LINKEDIN_ARTICLE: 'LinkedIn Article', X_THREAD: 'X Thread',
};

const fmtMoney = v => `₹${Number(v).toLocaleString('en-IN')}`;
const fmtDate = d => d ? formatCampaignDateTime(d, { hour: undefined, minute: undefined }) : '—';
const daysLeft = d => { if (!d) return null; const diff = new Date(d) - new Date(); if (diff <= 0) return 0; return Math.ceil(diff / 86400000); };

const PlatformBadge = ({ platform }) => {
    const Icon = PLATFORM_ICONS[platform] || Globe;
    return (
        <span className="cex-plat-badge" style={{ '--pc': PLATFORM_COLORS[platform] || '#888' }}>
            <Icon size={11} />{platform.charAt(0) + platform.slice(1).toLowerCase()}
        </span>
    );
};

/* ──────────────────────────────────────────────────────────────
   Campaign Detail Panel (full-screen overlay)
────────────────────────────────────────────────────────────── */
const CampaignDetailPanel = ({ campaignId, onClose, appliedIds, onApplySuccess }) => {
    const [campaign, setCampaign] = useState(null);
    const [brand, setBrand] = useState(null);
    const [loadingCampaign, setLoadingCampaign] = useState(true);
    const [loadingBrand, setLoadingBrand] = useState(false);
    const [applying, setApplying] = useState(false);
    const [applyStatus, setApplyStatus] = useState('idle'); // idle | bidding | success | error
    const [applyError, setApplyError] = useState('');
    const [applyErrorType, setApplyErrorType] = useState(''); // plan_upgrade | daily_limit | already_applied | expired | generic
    const [proposedBid, setProposedBid] = useState('');

    const alreadyApplied = appliedIds.has(campaignId);
    const deadline = campaign?.raw?.applicationTimeline;
    const dl = daysLeft(deadline);
    const expired = dl === 0;

    useEffect(() => {
        let cancelled = false;
        setLoadingCampaign(true);

        BrandCampaignService.getCampaignById(campaignId)
            .then(async (c) => {
                if (cancelled) return;
                setCampaign(c);
                const brandId = c?.raw?.brand;
                if (brandId) {
                    setLoadingBrand(true);
                    try {
                        const b = await BrandService.getBrandById(brandId);
                        if (!cancelled) setBrand(b);
                    } catch { /* non-fatal */ }
                    finally { if (!cancelled) setLoadingBrand(false); }
                }
            })
            .catch(() => {})
            .finally(() => { if (!cancelled) setLoadingCampaign(false); });

        return () => { cancelled = true; };
    }, [campaignId]);

    // Lock body scroll while open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const perCreatorBid = campaign
        ? Math.round(((campaign.budgetMin || 0) + (campaign.budgetMax || 0)) / 2 / (campaign.creators || 1))
        : 0;

    const handleSubmitBid = async () => {
        const raw = proposedBid.trim();
        const bid = raw ? Number(raw) : perCreatorBid;
        if (isNaN(bid) || bid < 0) {
            setApplyError('Please enter a valid bid amount (₹0 or more).');
            return; // stay in 'bidding' state, show inline error
        }
        setApplying(true);
        setApplyError('');
        setApplyErrorType('');
        try {
            await BrandCampaignService.applyCampaign(campaignId, bid);
            setApplyStatus('success');
            onApplySuccess(campaignId);
        } catch (err) {
            const msg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Could not submit application.';
            const status = err?.response?.status;
            let errType = 'generic';
            if (status === 409 || msg.toLowerCase().includes('already applied')) {
                errType = 'already_applied';
                setApplyStatus('success');
                onApplySuccess(campaignId);
                return;
            } else if (status === 403 && msg.toLowerCase().includes('plan')) {
                errType = 'plan_upgrade';
                setApplyStatus('error');
            } else if (status === 403 && (msg.toLowerCase().includes('daily') || msg.toLowerCase().includes('limit'))) {
                errType = 'daily_limit';
                setApplyStatus('error');
            } else if (status === 400 && (msg.toLowerCase().includes('timeline') || msg.toLowerCase().includes('expired'))) {
                errType = 'expired';
                setApplyStatus('error');
            } else {
                // Generic API error — show inline in bid form and stay in 'bidding'
                errType = 'generic';
            }
            setApplyError(msg);
            setApplyErrorType(errType);
        } finally {
            setApplying(false);
        }
    };

    const logoSrc = brand?.logoUrl;
    const brandInitial = (brand?.brandName || campaign?.raw?.brandName || 'B')[0].toUpperCase();

    const socialLinks = brand?.contact?.socialLinks || {};
    const hasSocial = socialLinks.instagram || socialLinks.youtube || socialLinks.linkedin || brand?.contact?.website;

    return (
        <motion.div
            className="cdp-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="cdp-panel"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 34 }}
                onClick={e => e.stopPropagation()}
            >
                {/* ── Top bar ── */}
                <div className="cdp-topbar">
                    <button className="cdp-back-btn" onClick={onClose}>
                        <ArrowLeft size={16} strokeWidth={2.5} />
                        Campaigns
                    </button>
                    <button className="cdp-close" onClick={onClose} aria-label="Close">
                        <X size={17} strokeWidth={2.5} />
                    </button>
                </div>

                {loadingCampaign ? (
                    <div className="cdp-loading">
                        <Loader2 size={28} className="cdp-spin" />
                        <span>Loading campaign…</span>
                    </div>
                ) : (
                    <>
                        {/* ── Scrollable body ── */}
                        <div className="cdp-scroll">

                            {/* Brand hero */}
                            <div className="cdp-brand-section">
                                <div className="cdp-brand-hero-glow" aria-hidden />
                                <div className="cdp-brand-identity">
                                    <div className="cdp-brand-logo">
                                        {logoSrc
                                            ? <img src={logoSrc} alt={brand?.brandName} />
                                            : <span>{brandInitial}</span>
                                        }
                                    </div>
                                    <div className="cdp-brand-meta">
                                        <h2 className="cdp-brand-name">
                                            {brand?.brandName || campaign?.raw?.brandName || 'Brand'}
                                        </h2>
                                        {brand?.industry?.length > 0 && (
                                            <div className="cdp-brand-industries">
                                                {brand.industry.map(ind => (
                                                    <span key={ind} className="cdp-industry-chip">
                                                        <Briefcase size={10} />{ind}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {(brand?.location?.city || brand?.location?.state) && (
                                            <p className="cdp-brand-location">
                                                <MapPin size={12} />
                                                {[brand.location.city, brand.location.state].filter(Boolean).join(', ')}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {brand?.description && (
                                    <p className="cdp-brand-desc">{brand.description}</p>
                                )}
                                {loadingBrand && !brand && (
                                    <p className="cdp-brand-loading"><Loader size={13} className="cdp-spin" /> Loading brand info…</p>
                                )}

                                {hasSocial && (
                                    <div className="cdp-social-row">
                                        {socialLinks.instagram && (
                                            <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="cdp-social-link cdp-social-link--ig">
                                                <Instagram size={13} /> Instagram
                                            </a>
                                        )}
                                        {socialLinks.youtube && (
                                            <a href={socialLinks.youtube} target="_blank" rel="noreferrer" className="cdp-social-link cdp-social-link--yt">
                                                <Youtube size={13} /> YouTube
                                            </a>
                                        )}
                                        {socialLinks.linkedin && (
                                            <a href={socialLinks.linkedin} target="_blank" rel="noreferrer" className="cdp-social-link cdp-social-link--li">
                                                <Linkedin size={13} /> LinkedIn
                                            </a>
                                        )}
                                        {brand?.contact?.website && (
                                            <a href={brand.contact.website} target="_blank" rel="noreferrer" className="cdp-social-link">
                                                <ExternalLink size={13} /> Website
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Campaign details */}
                            <div className="cdp-campaign-section">

                                {/* Title block */}
                                <div className="cdp-campaign-title-block">
                                    <p className="cdp-campaign-by">
                                        Campaign by {brand?.brandName || campaign?.raw?.brandName || 'Brand'}
                                    </p>
                                    <h1 className="cdp-campaign-title">{campaign?.name}</h1>
                                    {campaign?.product && (
                                        <p className="cdp-campaign-product">
                                            <Package size={14} strokeWidth={2} />
                                            {campaign.product}
                                        </p>
                                    )}
                                </div>

                                {/* Platforms + deliverable */}
                                <div className="cdp-chips-row">
                                    {(campaign?.platforms || []).map(p => <PlatformBadge key={p} platform={p} />)}
                                    {campaign?.raw?.contentDeliverable && (
                                        <span className="cdp-deliverable-chip">
                                            {DELIVERABLE_LABELS[campaign.raw.contentDeliverable] || campaign.raw.contentDeliverable}
                                        </span>
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="cdp-stats-grid">
                                    <div className="cdp-stat">
                                        <span className="cdp-stat-label">Budget Range</span>
                                        <strong className="cdp-stat-value">
                                            {fmtMoney(campaign?.budgetMin)} – {fmtMoney(campaign?.budgetMax)}
                                        </strong>
                                    </div>
                                    <div className="cdp-stat cdp-stat--highlight">
                                        <span className="cdp-stat-label">Your Estimated Pay</span>
                                        <strong className="cdp-stat-value cdp-stat-value--accent">
                                            {perCreatorBid ? fmtMoney(perCreatorBid) : '—'}
                                        </strong>
                                        <span className="cdp-stat-sub">per creator</span>
                                    </div>
                                    <div className="cdp-stat">
                                        <span className="cdp-stat-label">Creators Needed</span>
                                        <strong className="cdp-stat-value">{campaign?.creators || '—'}</strong>
                                    </div>
                                    <div className="cdp-stat">
                                        <span className="cdp-stat-label">Campaign Starts</span>
                                        <strong className="cdp-stat-value">{fmtDate(campaign?.raw?.campaignStartDate)}</strong>
                                    </div>
                                    <div className={`cdp-stat${expired ? ' cdp-stat--warn' : dl !== null && dl <= 7 && dl > 0 ? ' cdp-stat--urgent' : ''}`}>
                                        <span className="cdp-stat-label">Apply Before</span>
                                        <strong className="cdp-stat-value">
                                            {fmtDate(deadline)}
                                        </strong>
                                        {dl !== null && dl > 0 && (
                                            <span className="cdp-stat-sub">{dl} day{dl !== 1 ? 's' : ''} left</span>
                                        )}
                                        {expired && <span className="cdp-stat-sub cdp-stat-sub--expired">Deadline passed</span>}
                                    </div>
                                </div>

                                {/* Collaboration types */}
                                {brand?.collaborationInfo?.collaborationTypes?.length > 0 && (
                                    <div className="cdp-detail-row">
                                        <span className="cdp-detail-label">Collaboration type</span>
                                        <div className="cdp-collab-chips">
                                            {brand.collaborationInfo.collaborationTypes.map(t => (
                                                <span key={t} className="cdp-collab-chip">
                                                    {t.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Feedback inline */}
                                <AnimatePresence mode="wait">
                                    {applyStatus === 'success' && (
                                        <motion.div className="cdp-feedback cdp-feedback--success"
                                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                        >
                                            <CheckCircle2 size={18} />
                                            <div>
                                                <strong>Application submitted!</strong>
                                                <p>The brand will review your profile and reach out if selected.</p>
                                            </div>
                                        </motion.div>
                                    )}
                                    {applyStatus === 'error' && (
                                        <motion.div className="cdp-feedback cdp-feedback--error"
                                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                        >
                                            <AlertCircle size={18} />
                                            <div>
                                                <strong>Could not apply</strong>
                                                <p>{applyError}</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* ── Sticky apply footer (always visible) ── */}
                        <div className="cdp-footer">
                            {applyStatus === 'success' || alreadyApplied ? (
                                <div className="cdp-footer-applied">
                                    <CheckCircle2 size={18} />
                                    <div>
                                        <strong>Application submitted</strong>
                                        <span>The brand will review your profile and reach out if selected.</span>
                                    </div>
                                </div>
                            ) : expired ? (
                                <div className="cdp-footer-expired">
                                    <Clock size={15} />Deadline has passed
                                </div>
                            ) : applyStatus === 'error' && applyErrorType === 'plan_upgrade' ? (
                                <div className="cdp-footer-gate">
                                    <Crown size={18} />
                                    <div>
                                        <strong>Upgrade your plan</strong>
                                        <span>Your current plan doesn't allow applying to campaigns.</span>
                                    </div>
                                    <a href="/subscription" className="cdp-upgrade-btn">Upgrade</a>
                                </div>
                            ) : applyStatus === 'error' && applyErrorType === 'daily_limit' ? (
                                <div className="cdp-footer-limit">
                                    <AlertCircle size={16} />
                                    <div>
                                        <strong>Daily limit reached</strong>
                                        <span>{applyError}</span>
                                    </div>
                                </div>
                            ) : applyStatus === 'bidding' || (applyStatus === 'idle' && !expired && !alreadyApplied) || (applyStatus === 'error' && applyErrorType === 'generic') ? (
                                (applyStatus === 'bidding' || applyStatus === 'error') ? (
                                    <div className="cdp-bid-form">
                                        <label className="cdp-bid-label">Propose your bid</label>
                                        <div className="cdp-bid-row">
                                            <div className="cdp-bid-input-wrap">
                                                <IndianRupee size={15} className="cdp-bid-prefix" />
                                                <input
                                                    className="cdp-bid-input"
                                                    type="text"
                                                    inputMode="decimal"
                                                    placeholder={perCreatorBid ? perCreatorBid.toLocaleString('en-IN') : 'Enter amount'}
                                                    value={proposedBid}
                                                    onChange={e => setProposedBid(e.target.value.replace(/[^0-9.]/g, ''))}
                                                    onKeyDown={e => e.key === 'Enter' && handleSubmitBid()}
                                                    autoFocus
                                                />
                                            </div>
                                            <button className="cdp-apply-btn cdp-apply-btn--submit" onClick={handleSubmitBid} disabled={applying}>
                                                {applying
                                                    ? <><Loader2 size={16} className="cdp-spin" />Submitting…</>
                                                    : <>Submit <ArrowRight size={15} /></>
                                                }
                                            </button>
                                        </div>
                                        {perCreatorBid > 0 && (
                                            <p className="cdp-bid-hint">
                                                <IndianRupee size={11} />{perCreatorBid.toLocaleString('en-IN')} suggested · total budget ÷ {campaign?.creators || 1} creator{(campaign?.creators || 1) !== 1 ? 's' : ''}. Leave blank to accept.
                                            </p>
                                        )}
                                        {applyError && (
                                            <div className="cdp-bid-error"><AlertCircle size={13} />{applyError}</div>
                                        )}
                                        <button className="cdp-bid-cancel" onClick={() => { setApplyStatus('idle'); setApplyError(''); setProposedBid(''); }}>
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button className="cdp-apply-btn" onClick={() => { setApplyStatus('bidding'); setProposedBid(''); }}>
                                        Apply to this campaign <ArrowRight size={16} />
                                    </button>
                                )
                            ) : (
                                <>
                                    {applyStatus === 'error' && applyError && (
                                        <div className="cdp-footer-error">
                                            <AlertCircle size={14} />
                                            <span>{applyError}</span>
                                        </div>
                                    )}
                                    <button className="cdp-apply-btn" onClick={() => { setApplyStatus('bidding'); setProposedBid(''); }}>
                                        Try again <ArrowRight size={16} />
                                    </button>
                                </>
                            )}
                            {applyStatus !== 'success' && !alreadyApplied && (
                                <p className="cdp-footer-hint">
                                    Applications are reviewed by the brand. You'll be notified if selected.
                                </p>
                            )}
                        </div>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
};

/* ──────────────────────────────────────────────────────────────
   Campaign Card
────────────────────────────────────────────────────────────── */
const CARD_ACCENTS = [
    'rgba(240,5,122,0.04)', 'rgba(79,70,229,0.04)', 'rgba(124,58,237,0.04)',
    'rgba(16,185,129,0.04)', 'rgba(245,158,11,0.04)', 'rgba(14,165,233,0.04)',
];

const CampaignCard = ({ campaign, idx, onOpen, appliedIds }) => {
    const dl = daysLeft(campaign.end);
    const isUrgent = dl !== null && dl > 0 && dl <= 7;
    const isExpired = dl === 0;
    const isApplied = appliedIds.has(campaign.id);

    return (
        <motion.article
            className={`cex-card${isExpired ? ' cex-card--expired' : ''}${isApplied ? ' cex-card--applied' : ''}`}
            style={{ '--card-accent': CARD_ACCENTS[idx % CARD_ACCENTS.length] }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => onOpen(campaign.id)}
        >
            {/* Brand row */}
            <div className="cex-card-top">
                <div className="cex-card-brand-row">
                    <div className="cex-card-brand-av">
                        {(campaign.raw?.brandName || 'B')[0].toUpperCase()}
                    </div>
                    <div>
                        <span className="cex-card-by">Campaign by</span>
                        <strong className="cex-card-brand-name">{campaign.raw?.brandName || 'Brand'}</strong>
                    </div>
                </div>
                <div className="cex-card-badges">
                    {isApplied && <span className="cex-badge cex-badge--applied"><Check size={10} />Applied</span>}
                    {!isApplied && isUrgent && <span className="cex-badge cex-badge--urgent"><Zap size={10} />Closing soon</span>}
                    {!isApplied && isExpired && <span className="cex-badge cex-badge--expired">Expired</span>}
                </div>
            </div>

            {/* Title + product */}
            <h3 className="cex-card-title">{campaign.name}</h3>
            {campaign.product && (
                <p className="cex-card-product"><Package size={12} strokeWidth={2} />{campaign.product}</p>
            )}

            {/* Platform chips */}
            <div className="cex-card-platforms">
                {(campaign.platforms || []).map(p => <PlatformBadge key={p} platform={p} />)}
                {campaign.raw?.contentDeliverable && (
                    <span className="cex-deliverable">
                        {DELIVERABLE_LABELS[campaign.raw.contentDeliverable] || campaign.raw.contentDeliverable}
                    </span>
                )}
            </div>

            {/* Meta */}
            <div className="cex-card-meta">
                <span className="cex-meta-item"><Users size={12} />{campaign.creators} creator{campaign.creators !== 1 ? 's' : ''}</span>
                {campaign.end && (
                    <span className={`cex-meta-item${isUrgent ? ' cex-meta--urgent' : ''}${isExpired ? ' cex-meta--expired' : ''}`}>
                        <Clock size={12} />
                        {isExpired ? 'Deadline passed' : `${dl}d left`}
                    </span>
                )}
            </div>

            {/* Footer */}
            <div className="cex-card-footer">
                <div className="cex-card-budget">
                    <span>Budget</span>
                    <strong>{fmtMoney(campaign.budgetMin)} – {fmtMoney(campaign.budgetMax)}</strong>
                </div>
                <button
                    className={`cex-card-cta${isApplied ? ' cex-card-cta--applied' : ''}${isExpired ? ' cex-card-cta--expired' : ''}`}
                    onClick={e => { e.stopPropagation(); onOpen(campaign.id); }}
                >
                    {isApplied
                        ? <><CheckCircle2 size={13} />Applied</>
                        : <>View & Apply <ArrowRight size={13} /></>
                    }
                </button>
            </div>
        </motion.article>
    );
};

/* ──────────────────────────────────────────────────────────────
   Main Page
────────────────────────────────────────────────────────────── */
const PAGE_SIZE = 20;

const CampaignsExplore = () => {
    const { isAuthenticated } = useAuth();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [search, setSearch] = useState('');
    const [openCampaignId, setOpenCampaignId] = useState(null);
    const [appliedIds, setAppliedIds] = useState(new Set());

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const result = await BrandCampaignService.exploreCampaigns(0, PAGE_SIZE);
                setCampaigns(result.data);
                setTotalCount(result.count);
            } catch { setCampaigns([]); setTotalCount(0); }
            finally { setLoading(false); }
        })();
    }, []);

    const handleLoadMore = useCallback(async () => {
        if (loadingMore || campaigns.length >= totalCount) return;
        setLoadingMore(true);
        try {
            const result = await BrandCampaignService.exploreCampaigns(campaigns.length, campaigns.length + PAGE_SIZE);
            setCampaigns(prev => [...prev, ...result.data]);
            setTotalCount(result.count);
        } catch { /* silently ignore */ }
        finally { setLoadingMore(false); }
    }, [loadingMore, campaigns.length, totalCount]);

    const handleOpen = useCallback((id) => {
        if (!isAuthenticated) return;
        setOpenCampaignId(id);
    }, [isAuthenticated]);

    const handleApplySuccess = useCallback((id) => {
        setAppliedIds(prev => new Set([...prev, id]));
    }, []);

    const filtered = search.trim()
        ? campaigns.filter(c =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            (c.raw?.brandName || '').toLowerCase().includes(search.toLowerCase()) ||
            (c.product || '').toLowerCase().includes(search.toLowerCase())
          )
        : campaigns;

    const active = filtered.filter(c => daysLeft(c.end) !== 0);
    const expired = filtered.filter(c => daysLeft(c.end) === 0);

    return (
        <motion.div
            className="cex-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Hero */}
            <div className="cex-hero">
                <div className="cex-hero-bg" />
                <div className="cex-hero-content">
                    <div className="cex-hero-badge"><Zap size={12} />Brand Campaigns</div>
                    <h1>Discover <span className="cex-hero-accent">campaigns.</span></h1>
                    <p>Find brand collaborations that match your audience and apply directly.</p>
                    {!loading && campaigns.length > 0 && (
                        <div className="cex-hero-stats">
                            <span><strong>{active.length}</strong> open</span>
                            <span className="cex-hero-dot" />
                            <span><strong>{campaigns.length}</strong> total</span>
                            {appliedIds.size > 0 && <>
                                <span className="cex-hero-dot" />
                                <span className="cex-hero-stat-applied">
                                    <CheckCircle2 size={13} /><strong>{appliedIds.size}</strong> applied
                                </span>
                            </>}
                        </div>
                    )}
                </div>
                <div className="cex-hero-orbs">
                    <div className="cex-orb cex-orb-1" />
                    <div className="cex-orb cex-orb-2" />
                </div>
            </div>

            {/* Toolbar */}
            <div className="cex-toolbar">
                <div className="cex-search">
                    <Search size={16} />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by campaign, brand, or product…"
                    />
                    {search && (
                        <button className="cex-search-clear" onClick={() => setSearch('')}>
                            <X size={14} />
                        </button>
                    )}
                </div>
                {!loading && (
                    <span className="cex-count">
                        {filtered.length} campaign{filtered.length !== 1 ? 's' : ''}
                        {search && ` for "${search}"`}
                    </span>
                )}
            </div>

            {/* Grid */}
            <div className="cex-content">
                {loading ? (
                    <div className="cex-grid">
                        {[1,2,3,4,5,6].map(i => <div key={i} className="cex-skeleton" />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="cex-empty">
                        <BriefcaseBusiness size={44} />
                        <strong>{search ? 'No campaigns match your search' : 'No campaigns available right now'}</strong>
                        <p>{search ? 'Try a different keyword or brand name.' : 'Check back soon — brands are creating new campaigns.'}</p>
                    </div>
                ) : (
                    <>
                        {active.length > 0 && (
                            <div className="cex-grid">
                                {active.map((c, i) => (
                                    <CampaignCard
                                        key={c.id || i}
                                        campaign={c}
                                        idx={i}
                                        onOpen={handleOpen}
                                        appliedIds={appliedIds}
                                    />
                                ))}
                            </div>
                        )}
                        {expired.length > 0 && (
                            <div className="cex-expired-section">
                                <div className="cex-section-label"><Clock size={14} />Expired campaigns</div>
                                <div className="cex-grid">
                                    {expired.map((c, i) => (
                                        <CampaignCard
                                            key={c.id || i}
                                            campaign={c}
                                            idx={i}
                                            onOpen={handleOpen}
                                            appliedIds={appliedIds}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Load more */}
                {!loading && !search && campaigns.length > 0 && campaigns.length < totalCount && (
                    <div className="cex-load-more">
                        <button className="cex-load-more-btn" onClick={handleLoadMore} disabled={loadingMore}>
                            {loadingMore
                                ? <><Loader2 size={15} className="cex-spin" />Loading…</>
                                : <><ChevronDown size={15} />Load more campaigns</>
                            }
                        </button>
                        <span className="cex-load-more-hint">
                            Showing {campaigns.length} of {totalCount}
                        </span>
                    </div>
                )}
            </div>

            {/* Detail panel */}
            <AnimatePresence>
                {openCampaignId && (
                    <CampaignDetailPanel
                        key={openCampaignId}
                        campaignId={openCampaignId}
                        appliedIds={appliedIds}
                        onClose={() => setOpenCampaignId(null)}
                        onApplySuccess={handleApplySuccess}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default CampaignsExplore;
