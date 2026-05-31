import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft, ChevronLeft, ChevronRight, Heart, Share2,
    ExternalLink, Calendar, MoreHorizontal, Flag, UserX,
    UserPlus, UserCheck, Package, Check, Layers, Grid3X3,
    Pin, Sparkles, Building2, Globe, ShieldCheck, X, ZoomIn
} from 'lucide-react';
import ProductService from '../core/services/ProductService';
import BrandProductService from '../core/services/BrandProductService';
import BrandService from '../core/services/BrandService';
import UserService from '../core/services/UserService';
import CollectionService from '../core/services/CollectionService';
import CollectionCard from '../components/CollectionCard';
import Snackbar from '../components/Snackbar';
import Footer from '../components/Footer';
import FollowListModal from '../components/FollowListModal';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG } from '../core/config/apiConfig';
import PLACEHOLDER_IMAGE from '../utils/placeholder';
import { getCount, getDisplayName, getEntityId, getProfileImageUrl } from '../utils/profileUtils';
import { getShowcaseProductById } from '../data/showcaseData';
import '../styles/ProductDetailPage.css';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();

    const [product, setProduct] = useState(null);
    const [creator, setCreator] = useState(null);
    const [brandInfo, setBrandInfo] = useState(null);
    const [isBrandProduct, setIsBrandProduct] = useState(false);
    const [creatorCollections, setCreatorCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeMedia, setActiveMedia] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [showOptions, setShowOptions] = useState(false);
    const [copied, setCopied] = useState(false);
    const [snackbar, setSnackbar] = useState({ show: false, message: '', type: 'success' });
    const [followModal, setFollowModal] = useState({ isOpen: false, type: 'followers' });
    const [pinLoading, setPinLoading] = useState(false);
    const [featureLoading, setFeatureLoading] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIdx, setLightboxIdx] = useState(0);

    const touchStartX = useRef(null);
    const optionsRef = useRef(null);

    const currentUserId = user?.id || user?._id;
    const isOwner = isAuthenticated && creator && currentUserId &&
        ((creator._id || creator.id) === currentUserId);

    const normalizeUser = (payload) => payload?.profile || payload?.result || payload?.user || payload?.data || payload;
    const productSource = new URLSearchParams(location.search).get('source');
    const showcaseProduct = getShowcaseProductById(id);

    // Compute mediaList early — used in useEffect dependency arrays below
    const mediaList = (product?.media || []).map(item => {
        if (!item) return null;
        const url = typeof item === 'object' ? item.url : item;
        if (!url || typeof url !== 'string') return null;
        if (url.startsWith('http')) return url;
        return API_CONFIG.BASE_URL + url;
    }).filter(Boolean);

    useEffect(() => {
        if (showcaseProduct) {
            setProduct(showcaseProduct);
            setBrandInfo(showcaseProduct.brand || null);
            setIsBrandProduct(true);
            setLikeCount(showcaseProduct?.likes?.length || 0);
            setLoading(false);
            return;
        }

        if (isAuthenticated) fetchProductData();
        else setLoading(false);
    }, [id, isAuthenticated]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (optionsRef.current && !optionsRef.current.contains(e.target)) {
                setShowOptions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleKey = (e) => {
            if (!lightboxOpen) return;
            if (e.key === 'Escape') setLightboxOpen(false);
            if (e.key === 'ArrowLeft') setLightboxIdx(i => i > 0 ? i - 1 : mediaList.length - 1);
            if (e.key === 'ArrowRight') setLightboxIdx(i => i < mediaList.length - 1 ? i + 1 : 0);
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [lightboxOpen, mediaList.length]);

    const fetchProductData = async () => {
        try {
            setLoading(true);
            let productData = null;
            let isBrand = false;

            if (productSource === 'brand') {
                productData = await BrandProductService.getProductById(id);
                isBrand = !!productData;
                if (!productData) {
                    productData = await ProductService.getProductByPId(id);
                    isBrand = false;
                }
            } else {
                try {
                    productData = await ProductService.getProductByPId(id);
                } catch {
                    // Fallback keeps old shared links working, but source=brand avoids this 404 for brand cards.
                    productData = await BrandProductService.getProductById(id);
                    isBrand = !!productData;
                }
            }

            if (!productData) {
                setLoading(false);
                return;
            }

            setProduct(productData);
            setIsBrandProduct(isBrand);
            setLikeCount(productData?.likes?.length || 0);

            if (isAuthenticated && user && !isBrand) {
                const userId = user.id || user._id;
                const hasLiked = productData?.likes?.some(like => {
                    const likeUserId = typeof like === 'object' ? (like.user?._id || like.user) : like;
                    return likeUserId?.toString() === userId?.toString();
                });
                setIsLiked(!!hasLiked);
            }

            if (isBrand) {
                const brand = productData?.brand || productData?.brandId;
                if (brand && typeof brand === 'object') {
                    setBrandInfo(brand);
                } else if (brand) {
                    const fullBrand = await BrandService.getBrandById(brand).catch(() => null);
                    setBrandInfo(fullBrand || { _id: brand, brandName: productData?.brandName });
                }
            } else {
                const creatorId = typeof productData?.createdBy === 'string'
                    ? productData.createdBy
                    : productData?.createdBy?._id || productData?.createdBy?.id;

                if (creatorId) {
                    const [userData, collectionsData] = await Promise.allSettled([
                        UserService.getUserById(creatorId),
                        CollectionService.getUserCollections(creatorId)
                    ]);

                    if (userData.status === 'fulfilled' && userData.value) {
                        const creatorData = normalizeUser(userData.value);
                        setCreator(creatorData);
                        setFollowerCount(getCount(creatorData?.followers));

                        if (isAuthenticated && user) {
                            const myId = user.id || user._id;
                            const followingList = await UserService.getFollowing(myId).catch(() => []);
                            const followedIds = new Set(followingList.map(getEntityId).filter(Boolean).map(String));
                            setIsFollowing(creatorData?.isFollowing === true || followedIds.has(String(creatorId)));
                        }
                    } else if (typeof productData?.createdBy === 'object' && productData?.createdBy) {
                        setCreator(productData.createdBy);
                        setFollowerCount(getCount(productData.createdBy?.followers));
                    }

                    if (collectionsData.status === 'fulfilled') {
                        setCreatorCollections(collectionsData.value || []);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch product:', error);
            setSnackbar({ show: true, message: 'Failed to load product', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        if (!isAuthenticated) { navigate('/login'); return; }
        const prevLiked = isLiked;
        const prevCount = likeCount;
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
        try {
            await ProductService.likeProduct(id);
        } catch (error) {
            setIsLiked(prevLiked);
            setLikeCount(prevCount);
            setSnackbar({ show: true, message: 'Failed to like product', type: 'error' });
        }
    };

    const handleFollow = async () => {
        if (!isAuthenticated) { navigate('/login'); return; }
        const prevFollowing = isFollowing;
        const prevCount = followerCount;
        const creatorId = creator?._id || creator?.id;
        if (!creatorId || String(creatorId) === String(user?.id || user?._id)) return;
        setIsFollowing(!isFollowing);
        setFollowerCount(prev => Math.max(0, isFollowing ? prev - 1 : prev + 1));
        try {
            await UserService.followUser(creatorId);
            setSnackbar({
                show: true,
                message: isFollowing ? `Unfollowed @${creator?.username}` : `Following @${creator?.username}`,
                type: 'success'
            });
        } catch (error) {
            setIsFollowing(prevFollowing);
            setFollowerCount(prevCount);
            setSnackbar({ show: true, message: 'Failed to update follow', type: 'error' });
        }
    };

    const handleShare = () => {
        const url = `${window.location.origin}/product/${id}`;
        if (navigator.share) {
            navigator.share({ title: product?.name, text: product?.desc, url }).catch(() => {});
        } else {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            setSnackbar({ show: true, message: 'Link copied!', type: 'success' });
        }
    };

    const handleReport = () => {
        setShowOptions(false);
        setSnackbar({ show: true, message: 'Report submitted. Thanks for keeping Dropp safe.', type: 'info' });
    };

    const handleBlock = () => {
        setShowOptions(false);
        setSnackbar({ show: true, message: `@${creator?.username} has been blocked`, type: 'warning' });
    };

    const handlePinProduct = async () => {
        if (!isOwner || pinLoading) return;
        const nextPinned = !product?.isPinned;
        setPinLoading(true);
        setProduct((prev) => ({ ...prev, isPinned: nextPinned }));
        try {
            await ProductService.pinProduct(id);
            setSnackbar({ show: true, message: nextPinned ? 'Product pinned' : 'Product unpinned', type: 'success' });
        } catch (error) {
            setProduct((prev) => ({ ...prev, isPinned: !nextPinned }));
            setSnackbar({ show: true, message: 'Failed to update pin status', type: 'error' });
        } finally {
            setPinLoading(false);
        }
    };

    const isFeatured = product?.boostedConfig?.isBoosted && product?.boostedConfig?.boostedUntil && new Date(product.boostedConfig.boostedUntil) > new Date();

    const handleFeatureProduct = async () => {
        if (!isOwner || featureLoading || isFeatured) return;
        setFeatureLoading(true);
        try {
            await ProductService.featureProduct(id, 24);
            setProduct((prev) => ({
                ...prev,
                boostedConfig: {
                    isBoosted: true,
                    boostedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                }
            }));
            setSnackbar({ show: true, message: 'Product marked as featured', type: 'success' });
        } catch (error) {
            setSnackbar({ show: true, message: 'Failed to update featured status', type: 'error' });
        } finally {
            setFeatureLoading(false);
        }
    };

    const goPrev = () => setActiveMedia(prev => prev > 0 ? prev - 1 : mediaList.length - 1);
    const goNext = () => setActiveMedia(prev => prev < mediaList.length - 1 ? prev + 1 : 0);

    const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
    const handleTouchEnd = (e) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) { diff > 0 ? goNext() : goPrev(); }
        touchStartX.current = null;
    };

    const getImageUrl = (urlOrObj) => {
        if (!urlOrObj) return null;
        const url = typeof urlOrObj === 'object' ? urlOrObj.url : urlOrObj;
        if (!url || typeof url !== 'string') return null;
        if (url.startsWith('http')) return url;
        return API_CONFIG.BASE_URL + url;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return null;
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const formatCount = (count) => {
        if (!count && count !== 0) return '0';
        if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
        if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
        return count.toString();
    };

    if (!isAuthenticated && !showcaseProduct) {
        return (
            <>
                <div className="pdp-auth-gate-page">
                    <div className="pdp-auth-gate">
                        <div className="pdp-auth-gate-icon">
                            <Package size={36} strokeWidth={1.2} />
                        </div>
                        <h2 className="pdp-auth-gate-title">Sign in to view this product</h2>
                        <p className="pdp-auth-gate-sub">
                            Create an account or sign in to explore curated products and collections from creators on Dropp.
                        </p>
                        <div className="pdp-auth-gate-btns">
                            <button className="pdp-auth-gate-primary" onClick={() => navigate('/waitlist')}>
                                Join Waitlist
                            </button>
                            <button className="pdp-auth-gate-secondary" onClick={() => navigate('/login')}>
                                Sign In
                            </button>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (loading) {
        return (
            <div className="pdp-page">
                <div className="pdp-container">
                    <div className="pdp-shimmer-layout">
                        <div className="pdp-shimmer-left">
                            <div className="pdp-shimmer-media"></div>
                            <div className="pdp-shimmer-title"></div>
                            <div className="pdp-shimmer-desc"></div>
                        </div>
                        <div className="pdp-shimmer-right">
                            <div className="pdp-shimmer-avatar"></div>
                            <div className="pdp-shimmer-name"></div>
                            <div className="pdp-shimmer-line"></div>
                            <div className="pdp-shimmer-line short"></div>
                            <div className="pdp-shimmer-btn"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="pdp-error-state">
                <Package size={56} strokeWidth={1} />
                <h2>Product not found</h2>
                <p>This product may have been deleted or doesn't exist.</p>
                <button onClick={() => navigate(-1)} className="pdp-back-btn">
                    <ArrowLeft size={16} /> Go Back
                </button>
            </div>
        );
    }

    const productName = product.name || product.title || 'Untitled Product';
    const productDesc = product.desc || product.description;
    const productLink = product.link;
    const productLinks = productLink
        ? productLink.split(',').map(l => l.trim()).filter(Boolean)
        : [];
    const categories = Array.isArray(product.category) ? product.category : (product.category ? [product.category] : []);

    const creatorName = getDisplayName(creator || product?.createdBy || {}, 'Unknown Creator');
    const creatorUsername = creator?.username;
    const creatorAvatar = getProfileImageUrl(creator || product?.createdBy || {});
    const creatorBio = creator?.bio;
    const creatorFollowingCount = getCount(creator?.following);

    const brandName = getDisplayName(brandInfo || {}, product?.brandName || 'Brand');
    const brandLogo = getProfileImageUrl(brandInfo || {}) || getImageUrl(product?.logoUrl || product?.logo);
    const brandId = getEntityId(brandInfo || {}) || getEntityId(product?.brand || {}) || product?.brandId;
    const brandLocation = [brandInfo?.location?.city, brandInfo?.location?.state, brandInfo?.location?.country].filter(Boolean).join(', ');
    const brandIndustries = brandInfo?.industry || [];
    const brandWebsite = brandInfo?.contact?.website || brandInfo?.website;

    return (
        <>
            <motion.div
                className="pdp-page"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
            >
                <div className="pdp-container">
                    <button className="pdp-back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={15} /> Back
                    </button>

                    <div className="pdp-layout">
                        {/* ── LEFT: Media ── */}
                        <div className="pdp-media-col">
                            {mediaList.length > 0 ? (
                                <div className="pdp-media-wrap">
                                    <div
                                        className="pdp-media-viewport"
                                        onTouchStart={handleTouchStart}
                                        onTouchEnd={handleTouchEnd}
                                    >
                                        <div
                                            className="pdp-media-track"
                                            style={{ transform: `translateX(-${activeMedia * 100}%)` }}
                                        >
                                            {mediaList.map((src, i) => (
                                                <div
                                                    key={i}
                                                    className="pdp-media-slide"
                                                    onClick={() => { setLightboxIdx(i); setLightboxOpen(true); }}
                                                >
                                                    <img src={src} alt={`${productName} ${i + 1}`} draggable="false" />
                                                </div>
                                            ))}
                                        </div>

                                        {mediaList.length > 1 && (
                                            <>
                                                <button className="pdp-nav pdp-nav--prev" onClick={goPrev} aria-label="Previous">
                                                    <ChevronLeft size={18} />
                                                </button>
                                                <button className="pdp-nav pdp-nav--next" onClick={goNext} aria-label="Next">
                                                    <ChevronRight size={18} />
                                                </button>
                                                <div className="pdp-counter">{activeMedia + 1} / {mediaList.length}</div>
                                            </>
                                        )}
                                    </div>

                                    {mediaList.length > 1 && (
                                        <div className="pdp-thumbnails">
                                            {mediaList.map((src, i) => (
                                                <button
                                                    key={i}
                                                    className={`pdp-thumb${i === activeMedia ? ' active' : ''}`}
                                                    onClick={() => setActiveMedia(i)}
                                                >
                                                    <img src={src} alt="" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="pdp-media-placeholder">
                                    <img src={PLACEHOLDER_IMAGE} alt="No media" />
                                </div>
                            )}
                        </div>

                        {/* ── RIGHT: Info + Creator/Brand ── */}
                        <div className="pdp-info-col">
                            {/* Product info */}
                            <div className="pdp-product-info">
                                {isBrandProduct && (
                                    <span className="pdp-brand-badge"><Building2 size={11} />Brand Product</span>
                                )}

                                {categories.length > 0 && (
                                    <div className="pdp-cats">
                                        {categories.map(c => <span key={c} className="pdp-cat">{c}</span>)}
                                    </div>
                                )}

                                <h1 className="pdp-title">{productName}</h1>

                                {productDesc && <p className="pdp-desc">{productDesc}</p>}

                                <div className="pdp-meta-row">
                                    {product.createdAt && (
                                        <span className="pdp-meta-chip">
                                            <Calendar size={12} />{formatDate(product.createdAt)}
                                        </span>
                                    )}
                                    {likeCount > 0 && (
                                        <span className="pdp-meta-chip">
                                            <Heart size={12} />{formatCount(likeCount)} {likeCount === 1 ? 'like' : 'likes'}
                                        </span>
                                    )}
                                </div>

                                <div className="pdp-actions">
                                    {!isBrandProduct && (
                                        <button
                                            className={`pdp-action-btn${isLiked ? ' pdp-liked' : ''}`}
                                            onClick={handleLike}
                                        >
                                            <Heart size={15} fill={isLiked ? 'currentColor' : 'none'} />
                                            {isLiked ? 'Liked' : 'Like'}
                                        </button>
                                    )}

                                    <button className="pdp-action-btn" onClick={handleShare}>
                                        {copied ? <Check size={15} /> : <Share2 size={15} />}
                                        {copied ? 'Copied!' : 'Share'}
                                    </button>

                                    {productLinks.length > 0 && (
                                        <a
                                            href={productLinks[0]}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="pdp-action-btn pdp-action-btn--primary"
                                        >
                                            <ExternalLink size={15} />
                                            Visit Product
                                        </a>
                                    )}

                                    {isOwner && !isBrandProduct && (
                                        <>
                                            <button
                                                className={`pdp-action-btn${product?.isPinned ? ' pdp-liked' : ''}`}
                                                onClick={handlePinProduct}
                                                disabled={pinLoading}
                                            >
                                                <Pin size={15} />
                                                {product?.isPinned ? 'Pinned' : 'Pin'}
                                            </button>
                                            <button
                                                className={`pdp-action-btn${isFeatured ? ' pdp-liked' : ''}`}
                                                onClick={handleFeatureProduct}
                                                disabled={featureLoading || isFeatured}
                                            >
                                                <Sparkles size={15} />
                                                {isFeatured ? 'Featured' : 'Feature'}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Creator or Brand panel */}
                            {isBrandProduct ? (
                                <div className="pdp-panel">
                                    <p className="pdp-panel-label">Brand</p>
                                    <div className="pdp-panel-identity">
                                        {brandLogo ? (
                                            <img src={brandLogo} alt={brandName} className="pdp-panel-avatar" />
                                        ) : (
                                            <div className="pdp-panel-avatar-fallback">{brandName[0]?.toUpperCase()}</div>
                                        )}
                                        <div>
                                            <h3 className="pdp-panel-name">{brandName}</h3>
                                            <span className="pdp-panel-verified"><ShieldCheck size={12} />Verified Brand</span>
                                        </div>
                                    </div>

                                    {(brandInfo?.description || brandInfo?.about) && (
                                        <p className="pdp-panel-bio">{brandInfo.description || brandInfo.about}</p>
                                    )}

                                    <div className="pdp-detail-list">
                                        {brandIndustries.length > 0 && (
                                            <div><span>Industry</span><strong>{brandIndustries.slice(0, 2).join(', ')}</strong></div>
                                        )}
                                        {brandLocation && (
                                            <div><span>Location</span><strong>{brandLocation}</strong></div>
                                        )}
                                        {brandInfo?.createdAt && (
                                            <div><span>Joined</span><strong>{new Date(brandInfo.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</strong></div>
                                        )}
                                        {brandInfo?.collaborationInfo?.collaborationOpen !== undefined && (
                                            <div><span>Collabs</span><strong>{brandInfo.collaborationInfo.collaborationOpen ? 'Open' : 'Closed'}</strong></div>
                                        )}
                                    </div>

                                    <div className="pdp-panel-actions">
                                        {brandId && (
                                            <button
                                                className="pdp-follow-btn"
                                                onClick={() => navigate(`/brand-profile/${brandId}`)}
                                            >
                                                <Globe size={15} /> View Brand Page
                                            </button>
                                        )}
                                        {productLinks.length > 0 && (
                                            <a
                                                href={productLinks[0]}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="pdp-view-profile-btn"
                                            >
                                                <ExternalLink size={15} /> Visit Store
                                            </a>
                                        )}
                                        {brandWebsite && !productLinks.length && (
                                            <a
                                                href={brandWebsite.startsWith('http') ? brandWebsite : `https://${brandWebsite}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="pdp-view-profile-btn"
                                            >
                                                <ExternalLink size={15} /> Website
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ) : creator ? (
                                <div className="pdp-panel">
                                    <p className="pdp-panel-label">Creator</p>

                                    <div
                                        className="pdp-panel-identity clickable"
                                        onClick={() => creator?._id && navigate(`/user/${creator._id}`)}
                                    >
                                        {creatorAvatar ? (
                                            <img
                                                src={creatorAvatar}
                                                alt={creatorName}
                                                className="pdp-panel-avatar"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div
                                            className="pdp-panel-avatar-fallback"
                                            style={{ display: creatorAvatar ? 'none' : 'flex' }}
                                        >
                                            {creatorName[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="pdp-panel-name">{creatorName}</h3>
                                            {creatorUsername && (
                                                <span className="pdp-panel-username">@{creatorUsername}</span>
                                            )}
                                        </div>
                                    </div>

                                    {creatorBio && <p className="pdp-panel-bio">{creatorBio}</p>}

                                    <div className="pdp-detail-list">
                                        {creator?.location && <div><span>Location</span><strong>{creator.location}</strong></div>}
                                        {creator?.interests?.length > 0 && <div><span>Niche</span><strong>{creator.interests.slice(0, 2).join(', ')}</strong></div>}
                                        {creator?.createdAt && <div><span>Joined</span><strong>{new Date(creator.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</strong></div>}
                                    </div>

                                    <div className="pdp-panel-stats">
                                        <div
                                            className="pdp-stat clickable"
                                            onClick={() => setFollowModal({ isOpen: true, type: 'followers' })}
                                        >
                                            <span className="pdp-stat-val">{formatCount(followerCount)}</span>
                                            <span className="pdp-stat-lbl">Followers</span>
                                        </div>
                                        <div className="pdp-stat-div" />
                                        <div
                                            className="pdp-stat clickable"
                                            onClick={() => setFollowModal({ isOpen: true, type: 'following' })}
                                        >
                                            <span className="pdp-stat-val">{formatCount(creatorFollowingCount)}</span>
                                            <span className="pdp-stat-lbl">Following</span>
                                        </div>
                                        <div className="pdp-stat-div" />
                                        <div className="pdp-stat">
                                            <span className="pdp-stat-val">{formatCount(creatorCollections.length)}</span>
                                            <span className="pdp-stat-lbl">Collections</span>
                                        </div>
                                    </div>

                                    {!isOwner && (
                                        <div className="pdp-panel-actions">
                                            <button
                                                className={`pdp-follow-btn${isFollowing ? ' following' : ''}`}
                                                onClick={handleFollow}
                                            >
                                                {isFollowing
                                                    ? <><UserCheck size={15} />Following</>
                                                    : <><UserPlus size={15} />Follow</>}
                                            </button>

                                            <div className="pdp-options-wrap" ref={optionsRef}>
                                                <button
                                                    className="pdp-options-btn"
                                                    onClick={(e) => { e.stopPropagation(); setShowOptions(prev => !prev); }}
                                                >
                                                    <MoreHorizontal size={17} />
                                                </button>
                                                {showOptions && (
                                                    <div className="pdp-options-dropdown">
                                                        <button onClick={handleReport}><Flag size={13} />Report</button>
                                                        <button className="pdp-danger" onClick={handleBlock}><UserX size={13} />Block</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        className="pdp-view-profile-btn"
                                        onClick={() => creator?._id && navigate(`/user/${creator._id}`)}
                                    >
                                        View Profile
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    {/* More from creator */}
                    {!isBrandProduct && creator && (
                        <div className="pdp-more">
                            <div className="pdp-more-header">
                                <Grid3X3 size={16} />
                                <h2>More from <span className="pdp-more-accent">{creatorName}</span></h2>
                            </div>

                            {creatorCollections.length > 0 ? (
                                <div className="pdp-cols-scroll">
                                    {creatorCollections.map((col) => (
                                        <div key={col._id || col.id} className="pdp-col-wrap">
                                            <CollectionCard collection={col} isOwner={false} fallbackCreator={creator} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="pdp-no-cols">
                                    <Layers size={26} strokeWidth={1.5} />
                                    <p>No public collections yet</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>

            {!isAuthenticated && <Footer />}

            {snackbar.show && (
                <Snackbar
                    message={snackbar.message}
                    type={snackbar.type}
                    onClose={() => setSnackbar({ ...snackbar, show: false })}
                />
            )}

            {creator && (
                <FollowListModal
                    isOpen={followModal.isOpen}
                    onClose={() => setFollowModal({ ...followModal, isOpen: false })}
                    userId={creator._id || creator.id}
                    type={followModal.type}
                    username={creator.username}
                />
            )}

            {lightboxOpen && mediaList.length > 0 && (
                <div className="pdp-lightbox" onClick={() => setLightboxOpen(false)}>
                    <img
                        src={mediaList[lightboxIdx]}
                        alt={productName}
                        className="pdp-lightbox-img"
                        onClick={e => e.stopPropagation()}
                        draggable="false"
                    />
                    <button className="pdp-lightbox-close" onClick={() => setLightboxOpen(false)}>
                        <X size={18} />
                    </button>
                    {mediaList.length > 1 && (
                        <>
                            <button
                                className="pdp-lightbox-nav pdp-lightbox-nav--prev"
                                onClick={e => { e.stopPropagation(); setLightboxIdx(i => i > 0 ? i - 1 : mediaList.length - 1); }}
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                className="pdp-lightbox-nav pdp-lightbox-nav--next"
                                onClick={e => { e.stopPropagation(); setLightboxIdx(i => i < mediaList.length - 1 ? i + 1 : 0); }}
                            >
                                <ChevronRight size={20} />
                            </button>
                            <div className="pdp-lightbox-counter">{lightboxIdx + 1} / {mediaList.length}</div>
                        </>
                    )}
                </div>
            )}
        </>
    );
};

export default ProductDetailPage;
