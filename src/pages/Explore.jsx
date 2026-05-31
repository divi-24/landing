import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Grid, Loader, X, Store, Users, Bookmark, ExternalLink, MapPin, Globe, CheckCircle } from 'lucide-react';
import FloatingActionButton from '../components/FloatingActionButton';
import CollectionService from '../core/services/CollectionService';
import UserService from '../core/services/UserService';
import BrandService from '../core/services/BrandService';
import CollectionCard from '../components/CollectionCard';
import { ShimmerCollectionGrid } from '../components/Shimmer';
import { categories } from '../data/categories';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getEntityId, getProfileImageUrl } from '../utils/profileUtils';
import '../styles/Explore.css';
import '../styles/Profile.css';

const formatCount = n => {
    if (!n) return '0';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return String(n);
};

const GRADIENTS = [
    'linear-gradient(135deg,#F0057A,#FF80C0)',
    'linear-gradient(135deg,#4F46E5,#818CF8)',
    'linear-gradient(135deg,#7C3AED,#C4B5FD)',
    'linear-gradient(135deg,#F59E0B,#FDE68A)',
    'linear-gradient(135deg,#10B981,#6EE7B7)',
    'linear-gradient(135deg,#EF4444,#FCA5A5)',
    'linear-gradient(135deg,#0EA5E9,#7DD3FC)',
    'linear-gradient(135deg,#EC4899,#F9A8D4)',
];

/* ── Creator card (compact, for the Explore tab) ── */
const ExploreCreatorCard = ({ creator, idx, onFollow, isFollowing }) => {
    const grad = GRADIENTS[idx % GRADIENTS.length];
    const navigate = useNavigate();
    const username = creator.username || creator.name || 'creator';
    const avatarUrl = getProfileImageUrl(creator);
    const creatorId = getEntityId(creator);

    return (
        <motion.article
            className="exc-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04, duration: 0.4 }}
            onClick={() => navigate(username ? `/profile/${username}` : `/user/${creatorId}`)}
        >
            <div className="exc-card-banner" style={{ background: grad }} />
            <div className="exc-card-body">
                <div className="exc-card-avatar-wrap">
                    {avatarUrl
                        ? <img src={avatarUrl} alt={creator.name} className="exc-card-avatar" />
                        : <div className="exc-card-avatar-fallback" style={{ background: grad }}>{(creator.name || 'U')[0].toUpperCase()}</div>
                    }
                </div>
                <h4 className="exc-card-name">{creator.name || creator.username}</h4>
                <p className="exc-card-handle">@{username}</p>
                {creator.location && (
                    <p className="exc-card-location"><MapPin size={11} />{creator.location}</p>
                )}
                <div className="exc-card-stats">
                    <span><strong>{formatCount(creator.followers || 0)}</strong>followers</span>
                    <span><strong>{creator.collectionsCount || 0}</strong>collections</span>
                </div>
                <button
                    className={`exc-card-follow${isFollowing ? ' following' : ''}`}
                    onClick={e => { e.stopPropagation(); onFollow(creatorId, e); }}
                >
                    {isFollowing ? 'Following' : 'Follow'}
                </button>
            </div>
        </motion.article>
    );
};

/* ── Brand card ── */
const ExploreBrandCard = ({ brand, idx }) => {
    const navigate = useNavigate();
    const brandId = brand._id || brand.id;
    const grad = GRADIENTS[(idx + 2) % GRADIENTS.length];

    return (
        <motion.article
            className="exb-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04, duration: 0.4 }}
            onClick={() => brandId && navigate(`/brand-profile/${brandId}`)}
        >
            <div className="exb-card-header" style={{ background: grad }}>
                <div className="exb-card-logo">
                    {brand.logoUrl
                        ? <img src={brand.logoUrl} alt={brand.brandName} />
                        : <span>{(brand.brandName || 'B')[0].toUpperCase()}</span>
                    }
                </div>
            </div>
            <div className="exb-card-body">
                <div className="exb-card-name-row">
                    <h4 className="exb-card-name">{brand.brandName || 'Brand'}</h4>
                    {brand.collaborationInfo?.collaborationOpen && (
                        <span className="exb-card-open"><CheckCircle size={12} />Open</span>
                    )}
                </div>
                {brand.description && <p className="exb-card-desc">{brand.description}</p>}
                {brand.industry?.length > 0 && (
                    <div className="exb-card-industries">
                        {brand.industry.slice(0, 2).map(i => <span key={i}>{i}</span>)}
                    </div>
                )}
                {brand.location?.city && (
                    <p className="exb-card-location"><MapPin size={11} />{brand.location.city}{brand.location.state ? `, ${brand.location.state}` : ''}</p>
                )}
                {brand.contact?.website && (
                    <a href={brand.contact.website} target="_blank" rel="noopener noreferrer" className="exb-card-website" onClick={e => e.stopPropagation()}>
                        <Globe size={11} />{brand.contact.website.replace(/^https?:\/\//, '')}
                    </a>
                )}
            </div>
        </motion.article>
    );
};

const Explore = () => {
    const { user: currentUser, isAuthenticated } = useAuth();
    const [activeCategory, setActiveCategory] = useState('All');
    const [activeTab, setActiveTab] = useState('collections');
    const [collections, setCollections] = useState([]);
    const [creators, setCreators] = useState([]);
    const [brands, setBrands] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [following, setFollowing] = useState({});
    const [loading, setLoading] = useState(true);
    const [creatorsLoading, setCreatorsLoading] = useState(false);
    const [brandsLoading, setBrandsLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => { fetchCollections(); }, []);

    const fetchCollections = async () => {
        try {
            setLoading(true);
            const data = await CollectionService.getExploreCollections();
            setCollections(data);
        } catch { /* noop */ } finally { setLoading(false); }
    };

    const fetchCreators = useCallback(async () => {
        if (creators.length > 0) return;
        setCreatorsLoading(true);
        try {
            const users = await UserService.getAllUsers();
            setCreators(users);
            const map = {};
            users.forEach(u => { map[getEntityId(u)] = u.isFollowing === true; });
            const myId = currentUser?.id || currentUser?._id;
            if (myId) {
                const list = await UserService.getFollowing(myId).catch(() => []);
                const followedIds = new Set(list.map(getEntityId).filter(Boolean));
                users.forEach(u => {
                    const id = getEntityId(u);
                    map[id] = followedIds.has(id) || map[id] === true;
                });
            }
            setFollowing(prev => ({ ...prev, ...map }));
        } catch { /* noop */ } finally { setCreatorsLoading(false); }
    }, [creators.length, currentUser?.id, currentUser?._id]);

    const fetchBrands = useCallback(async () => {
        if (brands.length > 0) return;
        setBrandsLoading(true);
        try {
            const data = await BrandService.exploreBrands();
            setBrands(data);
        } catch { /* noop */ } finally { setBrandsLoading(false); }
    }, [brands.length]);

    useEffect(() => {
        if (activeTab === 'creators') fetchCreators();
        if (activeTab === 'brands') fetchBrands();
    }, [activeTab, fetchCreators, fetchBrands]);

    // Debounce search
    useEffect(() => {
        const t = setTimeout(async () => {
            if (searchQuery.trim()) {
                setIsSearching(true); setSearchLoading(true);
                try {
                    const results = await CollectionService.searchCollections(searchQuery);
                    setSearchResults(results);
                } catch { setSearchResults([]); } finally { setSearchLoading(false); }
            } else { setIsSearching(false); setSearchResults([]); }
        }, 500);
        return () => clearTimeout(t);
    }, [searchQuery]);

    const handleFollow = async (creatorId, e) => {
        e.stopPropagation();
        if (!isAuthenticated || !creatorId) return;
        const myId = currentUser?.id || currentUser?._id;
        if (myId && String(myId) === String(creatorId)) return;
        const was = following[creatorId];
        setFollowing(prev => ({ ...prev, [creatorId]: !was }));
        setCreators(prev => prev.map(c => {
            if ((c._id || c.id) !== creatorId) return c;
            return { ...c, followers: was ? Math.max(0, (c.followers || 0) - 1) : (c.followers || 0) + 1 };
        }));
        try { await UserService.followUser(creatorId); }
        catch {
            setFollowing(prev => ({ ...prev, [creatorId]: was }));
            setCreators(prev => prev.map(c => {
                if ((c._id || c.id) !== creatorId) return c;
                return { ...c, followers: was ? (c.followers || 0) + 1 : Math.max(0, (c.followers || 0) - 1) };
            }));
        }
    };

    const filteredCollections = (activeCategory === 'All' ? collections : collections.filter(c =>
        Array.isArray(c.category) ? c.category.includes(activeCategory) : c.category === activeCategory
    ));
    const displayedCollections = isSearching ? (Array.isArray(searchResults) ? searchResults : []) : filteredCollections;

    const switchTab = (tab) => {
        setActiveTab(tab);
        setSearchQuery('');
        setActiveCategory('All');
        setIsSearching(false);
        setSearchResults([]);
    };

    const TABS = [
        { key: 'collections', label: 'Collections', icon: Bookmark },
        { key: 'creators', label: 'Creators', icon: Users },
        { key: 'brands', label: 'Brands', icon: Store },
    ];

    return (
        <motion.div
            className="explore-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="explore-header">
                <h1 className="explore-title">
                    Explore <span className="accent">
                        {activeTab === 'collections' ? 'collections.' : activeTab === 'creators' ? 'creators.' : 'brands.'}
                    </span>
                </h1>
                {activeTab === 'collections' && (
                    <div className="explore-search">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search collections..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                                <X size={16} />
                            </button>
                        )}
                        {searchLoading && <Loader className="search-spinner" size={18} />}
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="explore-tabs ex-tabs-row">
                {TABS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        className={`explore-tab ex-tab-pill${activeTab === key ? ' active' : ''}`}
                        onClick={() => switchTab(key)}
                    >
                        <Icon size={14} />
                        {label}
                    </button>
                ))}
            </div>

            {/* Category filter only for collections */}
            {activeTab === 'collections' && !isSearching && (
                <div className="category-filters">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`category-pill${activeCategory === cat ? ' active' : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            <div className="explore-content">
                {isSearching && (
                    <h2 className="search-results-title">
                        {searchLoading ? 'Searching...' : `Results (${searchResults.length})`}
                    </h2>
                )}

                {/* Collections tab */}
                {activeTab === 'collections' && (
                    loading || searchLoading ? <ShimmerCollectionGrid count={8} /> : (
                        <div className="pinterest-grid">
                            {displayedCollections.map(col => (
                                <CollectionCard key={col._id || col.id} collection={col} />
                            ))}
                            {displayedCollections.length === 0 && (
                                <div className="no-results">
                                    <Grid size={48} />
                                    <p>{isSearching ? `No collections for "${searchQuery}"` : 'No collections found'}</p>
                                </div>
                            )}
                        </div>
                    )
                )}

                {/* Creators tab */}
                {activeTab === 'creators' && (
                    creatorsLoading ? <ShimmerCollectionGrid count={8} /> : (
                        creators.length === 0 ? (
                            <div className="no-results"><Users size={48} /><p>No creators found</p></div>
                        ) : (
                            <div className="exc-grid">
                                {creators.map((c, i) => (
                                    <ExploreCreatorCard
                                        key={c._id || c.id || i}
                                        creator={c}
                                        idx={i}
                                        onFollow={handleFollow}
                                        isFollowing={!!following[c._id || c.id]}
                                    />
                                ))}
                            </div>
                        )
                    )
                )}

                {/* Brands tab */}
                {activeTab === 'brands' && (
                    brandsLoading ? <ShimmerCollectionGrid count={8} /> : (
                        brands.length === 0 ? (
                            <div className="no-results ex-brands-empty">
                                <Store size={48} />
                                <p>No brands found</p>
                                <small>Brands that are open to collaborations will appear here.</small>
                            </div>
                        ) : (
                            <div className="exb-grid">
                                {brands.map((b, i) => (
                                    <ExploreBrandCard key={b._id || b.id || i} brand={b} idx={i} />
                                ))}
                            </div>
                        )
                    )
                )}

            </div>

            <FloatingActionButton />
        </motion.div>
    );
};

export default Explore;
