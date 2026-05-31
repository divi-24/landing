import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, CheckCircle2, Globe, Mail, MessageCircle, MapPin,
    Package, BriefcaseBusiness, Calendar, ExternalLink, Star,
    Handshake, Users, Sparkles, ChevronRight, Tag, X,
    Instagram, Youtube, Linkedin,
} from 'lucide-react';
import BrandService from '../core/services/BrandService';
import BrandProductService from '../core/services/BrandProductService';
import BrandCampaignService from '../core/services/BrandCampaignService';
import ProductMasonryGrid from '../components/ProductMasonryGrid';
import { ShimmerCollectionGrid } from '../components/Shimmer';
import '../styles/BrandPublicPage.css';

const GRADIENTS = [
    'linear-gradient(135deg, #1E0A3C 0%, #4A1D96 50%, #7C3AED 100%)',
    'linear-gradient(135deg, #0C0A1E 0%, #1e3a8a 50%, #3b82f6 100%)',
    'linear-gradient(135deg, #0a1929 0%, #0f3460 50%, #16213e 100%)',
    'linear-gradient(135deg, #1a0030 0%, #6b21a8 50%, #c026d3 100%)',
    'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0ea5e9 100%)',
];

function gradientFromId(id) {
    if (!id) return GRADIENTS[0];
    const n = [...String(id)].reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return GRADIENTS[n % GRADIENTS.length];
}

const COLLAB_LABELS = {
    SPONSORED_POSTS: 'Sponsored Posts',
    PRODUCT_REVIEWS: 'Product Reviews',
    BRAND_AMBASSADOR: 'Brand Ambassador',
    AFFILIATE: 'Affiliate Program',
    GIFTING: 'Product Gifting',
    EVENT_COVERAGE: 'Event Coverage',
};

const formatBudget = (range) => {
    if (!range) return null;
    const min = range.min ?? 0;
    const max = range.max ?? min;
    if (!min && !max) return null;
    const fmt = n => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(0)}K` : `₹${n}`;
    return min === max ? fmt(max) : `${fmt(min)} – ${fmt(max)}`;
};

const CampaignBadge = ({ platform }) => {
    const colors = {
        INSTAGRAM: '#E1306C', YOUTUBE: '#FF0000', TIKTOK: '#010101',
        TWITTER: '#1DA1F2', X: '#000', LINKEDIN: '#0A66C2',
        FACEBOOK: '#1877F2',
    };
    const label = platform.split('_').map(w => w[0] + w.slice(1).toLowerCase()).join(' ');
    return (
        <span className="bpp-plat-badge" style={{ '--plat': colors[platform] || '#6366f1' }}>
            {label}
        </span>
    );
};

const CampaignCard = ({ campaign, onView }) => (
    <motion.article
        className="bpp-campaign-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        onClick={onView}
    >
        <div className="bpp-campaign-top">
            <div>
                <span className={`bpp-campaign-status ${campaign.statusValue === 'PUBLISHED' ? 'live' : 'draft'}`}>
                    {campaign.statusValue === 'PUBLISHED' ? 'Live' : 'Draft'}
                </span>
                <h4 className="bpp-campaign-name">{campaign.name}</h4>
                <p className="bpp-campaign-product">{campaign.product}</p>
            </div>
            <div className="bpp-campaign-budget">
                {campaign.budget > 0 && <strong>₹{campaign.budget.toLocaleString('en-IN')}</strong>}
                <span>max budget</span>
            </div>
        </div>
        <div className="bpp-campaign-plats">
            {campaign.platforms.slice(0, 3).map(p => <CampaignBadge key={p} platform={p} />)}
        </div>
        <div className="bpp-campaign-footer">
            <span><Calendar size={12} />{campaign.end || 'Open'} deadline</span>
            <span><Users size={12} />{campaign.creators} creator{campaign.creators !== 1 ? 's' : ''}</span>
            <button className="bpp-campaign-apply-btn" onClick={e => { e.stopPropagation(); onView?.(); }}>
                View <ChevronRight size={13} />
            </button>
        </div>
    </motion.article>
);

const BrandPublicPage = () => {
    const { brandId } = useParams();
    const navigate = useNavigate();

    const [brand, setBrand] = useState(null);
    const [products, setProducts] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [productsLoading, setProductsLoading] = useState(true);
    const [campaignsLoading, setCampaignsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('products');
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        if (!brandId) return;
        setLoading(true);
        try {
            const data = await BrandService.getBrandById(brandId);
            setBrand(data);
        } catch {
            setError('Could not load brand profile.');
        } finally {
            setLoading(false);
        }
    }, [brandId]);

    const loadProducts = useCallback(async () => {
        if (!brandId) return;
        setProductsLoading(true);
        try {
            const data = await BrandProductService.getProductsByBrandId(brandId);
            setProducts(data);
        } catch { setProducts([]); }
        finally { setProductsLoading(false); }
    }, [brandId]);

    const loadCampaigns = useCallback(async () => {
        if (!brandId) return;
        setCampaignsLoading(true);
        try {
            const data = await BrandCampaignService.getCampaignsByBrandId(brandId);
            setCampaigns(data.filter(c => c.statusValue === 'PUBLISHED'));
        } catch { setCampaigns([]); }
        finally { setCampaignsLoading(false); }
    }, [brandId]);

    useEffect(() => { load(); loadProducts(); loadCampaigns(); }, [load, loadProducts, loadCampaigns]);

    if (loading) return (
        <div className="bpp-loading">
            <div className="bpp-loading-hero" />
            <div className="bpp-loading-body">
                <ShimmerCollectionGrid count={6} />
            </div>
        </div>
    );

    if (error) return (
        <div className="bpp-error">
            <X size={36} />
            <h2>Brand not found</h2>
            <p>{error}</p>
            <button onClick={() => navigate(-1)}>Go back</button>
        </div>
    );

    const heroGradient = gradientFromId(brandId);
    const brandName = brand?.brandName || 'Brand';
    const logoUrl = brand?.logoUrl || null;
    const isOpen = brand?.collaborationInfo?.collaborationOpen;
    const collabTypes = brand?.collaborationInfo?.collaborationTypes || [];
    const budget = formatBudget(brand?.collaborationInfo?.typicalBudgetRange);
    const location = [brand?.location?.city, brand?.location?.state, brand?.location?.country].filter(Boolean).join(', ');
    const joinYear = brand?.createdAt ? new Date(brand.createdAt).getFullYear() : null;
    const joinedDate = brand?.createdAt ? new Date(brand.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null;
    const industries = brand?.industry || [];
    const socials = brand?.socialLinks || {};

    return (
        <motion.div
            className="bpp"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* ── Hero ── */}
            <div className="bpp-hero" style={{ background: heroGradient }}>
                <button className="bpp-back" onClick={() => navigate(-1)} aria-label="Go back">
                    <ArrowLeft size={18} />
                </button>

                {/* orbs */}
                <div className="bpp-hero-orb bpp-hero-orb-1" />
                <div className="bpp-hero-orb bpp-hero-orb-2" />

                <div className="bpp-hero-inner">
                    <div className="bpp-logo-wrap">
                        {logoUrl ? (
                            <img src={logoUrl} alt={brandName} className="bpp-logo" referrerPolicy="no-referrer"
                                onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }} />
                        ) : null}
                        <div className="bpp-logo-fallback" style={{ display: logoUrl ? 'none' : 'flex' }}>
                            {brandName[0]?.toUpperCase() || 'B'}
                        </div>
                    </div>

                    <div className="bpp-hero-copy">
                        <div className="bpp-hero-name-row">
                            <h1 className="bpp-brand-name">{brandName}</h1>
                            <span className="bpp-verified"><CheckCircle2 size={16} />Verified Brand</span>
                        </div>

                        {brand?.description && (
                            <p className="bpp-brand-desc">{brand.description}</p>
                        )}

                        <div className="bpp-hero-tags">
                            {isOpen && (
                                <span className="bpp-tag bpp-tag--open">
                                    <Handshake size={12} />Open to Collabs
                                </span>
                            )}
                            {industries.slice(0, 2).map(ind => (
                                <span key={ind} className="bpp-tag bpp-tag--industry">{ind}</span>
                            ))}
                            {location && (
                                <span className="bpp-tag bpp-tag--location">
                                    <MapPin size={11} />{location}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Stats strip ── */}
            <div className="bpp-stats-strip">
                <div className="bpp-stat">
                    <strong>{products.length}</strong>
                    <span><Package size={13} />Products</span>
                </div>
                <div className="bpp-stat-divider" />
                <div className="bpp-stat">
                    <strong>{campaigns.length}</strong>
                    <span><BriefcaseBusiness size={13} />Live campaigns</span>
                </div>
                <div className="bpp-stat-divider" />
                <div className="bpp-stat">
                    <strong>{joinYear || '—'}</strong>
                    <span><Calendar size={13} />Joined</span>
                </div>
                {budget && (
                    <>
                        <div className="bpp-stat-divider" />
                        <div className="bpp-stat">
                            <strong>{budget}</strong>
                            <span><Star size={13} />Typical budget</span>
                        </div>
                    </>
                )}
            </div>

            <div className="bpp-body">
                <div className="bpp-main">
                    {/* ── Tabs ── */}
                    <div className="bpp-tabs">
                        {[
                            { key: 'products', label: 'Products', count: products.length },
                            { key: 'campaigns', label: 'Campaigns', count: campaigns.length },
                        ].map(t => (
                            <button
                                key={t.key}
                                className={`bpp-tab${activeTab === t.key ? ' active' : ''}`}
                                onClick={() => setActiveTab(t.key)}
                            >
                                {t.label}
                                {t.count > 0 && <span className="bpp-tab-count">{t.count}</span>}
                            </button>
                        ))}
                    </div>

                    {/* Products */}
                    <AnimatePresence mode="wait">
                        {activeTab === 'products' && (
                            <motion.div
                                key="products"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.25 }}
                            >
                                {productsLoading ? (
                                    <ShimmerCollectionGrid count={6} />
                                ) : products.length === 0 ? (
                                    <div className="bpp-empty">
                                        <Package size={36} />
                                        <p>No products listed yet</p>
                                    </div>
                                ) : (
                                    <ProductMasonryGrid products={products} productSource="brand" />
                                )}
                            </motion.div>
                        )}

                        {/* Campaigns */}
                        {activeTab === 'campaigns' && (
                            <motion.div
                                key="campaigns"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.25 }}
                            >
                                {campaignsLoading ? (
                                    <ShimmerCollectionGrid count={4} />
                                ) : campaigns.length === 0 ? (
                                    <div className="bpp-empty">
                                        <BriefcaseBusiness size={36} />
                                        <p>No active campaigns right now</p>
                                        <small>Check back soon — new campaigns get posted regularly.</small>
                                    </div>
                                ) : (
                                    <div className="bpp-campaigns-grid">
                                        {campaigns.map(c => (
                                            <CampaignCard
                                                key={c.id}
                                                campaign={c}
                                                onView={() => navigate('/campaigns')}
                                            />
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── Sidebar: About + Contact ── */}
                <aside className="bpp-sidebar">
                    {/* About */}
                    <div className="bpp-card">
                        <h3 className="bpp-card-title"><Sparkles size={15} />About</h3>
                        {brand?.description ? (
                            <p className="bpp-about-text">{brand.description}</p>
                        ) : (
                            <p className="bpp-about-text bpp-muted">No description added yet.</p>
                        )}
                        {industries.length > 0 && (
                            <div className="bpp-industries">
                                {industries.map(ind => (
                                    <span key={ind} className="bpp-industry-chip"><Tag size={10} />{ind}</span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bpp-card">
                        <h3 className="bpp-card-title"><Package size={15} />Brand Details</h3>
                        <div className="bpp-detail-list">
                            <div><span>Products</span><strong>{products.length}</strong></div>
                            <div><span>Live campaigns</span><strong>{campaigns.length}</strong></div>
                            {joinedDate && <div><span>Joined Dropp</span><strong>{joinedDate}</strong></div>}
                            {location && <div><span>Location</span><strong>{location}</strong></div>}
                            {brand?.contact?.website && <div><span>Website</span><strong>{brand.contact.website.replace(/^https?:\/\//, '')}</strong></div>}
                        </div>
                    </div>

                    {/* Collaboration */}
                    {(collabTypes.length > 0 || budget || isOpen !== undefined) && (
                        <div className="bpp-card">
                            <h3 className="bpp-card-title"><Handshake size={15} />Collaboration</h3>
                            <div className="bpp-collab-status">
                                <span className={`bpp-collab-dot${isOpen ? ' open' : ' closed'}`} />
                                <span>{isOpen ? 'Actively looking for creators' : 'Not accepting pitches currently'}</span>
                            </div>
                            {budget && (
                                <div className="bpp-collab-row">
                                    <Star size={13} /><span>Typical budget: <strong>{budget}</strong></span>
                                </div>
                            )}
                            {collabTypes.length > 0 && (
                                <div className="bpp-collab-types">
                                    {collabTypes.map(t => (
                                        <span key={t} className="bpp-collab-chip">
                                            {COLLAB_LABELS[t] || t}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Contact */}
                    {(brand?.contact?.website || brand?.contact?.supportEmail || brand?.contact?.whatsappBusinessNumber || Object.values(socials).some(Boolean)) && (
                        <div className="bpp-card">
                            <h3 className="bpp-card-title"><Globe size={15} />Contact</h3>
                            <div className="bpp-contact-list">
                                {brand.contact?.website && (
                                    <a href={brand.contact.website} target="_blank" rel="noopener noreferrer" className="bpp-contact-link">
                                        <Globe size={15} />
                                        <span>{brand.contact.website.replace(/^https?:\/\//, '')}</span>
                                        <ExternalLink size={11} className="bpp-ext" />
                                    </a>
                                )}
                                {brand.contact?.supportEmail && (
                                    <a href={`mailto:${brand.contact.supportEmail}`} className="bpp-contact-link">
                                        <Mail size={15} /><span>{brand.contact.supportEmail}</span>
                                    </a>
                                )}
                                {brand.contact?.whatsappBusinessNumber && (
                                    <span className="bpp-contact-link">
                                        <MessageCircle size={15} /><span>{brand.contact.whatsappBusinessNumber}</span>
                                    </span>
                                )}
                                {socials.instagram && (
                                    <a href={`https://instagram.com/${socials.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="bpp-contact-link">
                                        <Instagram size={15} /><span>@{socials.instagram.replace('@', '')}</span>
                                        <ExternalLink size={11} className="bpp-ext" />
                                    </a>
                                )}
                                {socials.youtube && (
                                    <a href={socials.youtube} target="_blank" rel="noopener noreferrer" className="bpp-contact-link">
                                        <Youtube size={15} /><span>YouTube</span>
                                        <ExternalLink size={11} className="bpp-ext" />
                                    </a>
                                )}
                                {socials.linkedin && (
                                    <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="bpp-contact-link">
                                        <Linkedin size={15} /><span>LinkedIn</span>
                                        <ExternalLink size={11} className="bpp-ext" />
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Trust signals */}
                    <div className="bpp-card bpp-trust-card">
                        <h3 className="bpp-card-title"><CheckCircle2 size={15} />Trust & Safety</h3>
                        <ul className="bpp-trust-list">
                            <li><CheckCircle2 size={14} className="ok" />Verified brand account</li>
                            <li><CheckCircle2 size={14} className="ok" />Payments secured by Dropp</li>
                            <li><CheckCircle2 size={14} className="ok" />Campaign briefs reviewed</li>
                            {isOpen && <li><CheckCircle2 size={14} className="ok" />Open to collaboration</li>}
                        </ul>
                    </div>
                </aside>
            </div>
        </motion.div>
    );
};

export default BrandPublicPage;
