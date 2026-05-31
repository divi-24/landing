import React, { useState, useEffect } from 'react';
import { Share2, MoreHorizontal, Trash2, Link2, Copy, Check, Heart, Edit2, Pin, Sparkles } from 'lucide-react';
import AddProductModal from './AddProductModal';
import { API_CONFIG } from '../core/config/apiConfig';
import PLACEHOLDER_IMAGE from '../utils/placeholder';
import ProductService from '../core/services/ProductService';
import BrandProductService from '../core/services/BrandProductService';
import Snackbar from './Snackbar';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getDisplayName, getEntityId, getProfileImageUrl } from '../utils/profileUtils';
import '../styles/Profile.css';

const ProductCard = ({ product, onDelete, isCollectionOwner = false, productSource }) => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [openMenu, setOpenMenu] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isLiked, setIsLiked] = useState(
        product?.likes?.some(like => {
            const likeUserId = typeof like === 'object' ? (like.user?._id || like.user) : like;
            return likeUserId?.toString() === user?._id?.toString();
        }) || false
    );
    const [likeCount, setLikeCount] = useState(product.likes?.length || 0);
    const [snackbar, setSnackbar] = useState({ show: false, message: '', type: 'success' });
    const [isPinned, setIsPinned] = useState(!!product.isPinned);
    const [pinLoading, setPinLoading] = useState(false);

    useEffect(() => { setIsPinned(!!product.isPinned); }, [product._id, product.id, product.isPinned]);

    const productId = product._id || product.id;
    const creator = product.createdBy || product.creator;
    const brand = product.brand || product.brandId;
    const isBrandProduct = productSource === 'brand' || !!(product.brand || product.brandId || product.brandName);
    const productActions = isBrandProduct ? BrandProductService : ProductService;
    const creatorId = typeof creator === 'object' ? getEntityId(creator) : creator;
    const isOwner = isAuthenticated && user && creatorId && String(creatorId) === String(user._id || user.id);
    const canManageProduct = isOwner || isCollectionOwner;

    const handleCardClick = (e) => {
        if (e.target.closest('.pcard-overlay') || e.target.closest('.pcard-share-popup') || e.target.closest('.pcard-menu-popup') || e.target.closest('.pcard-quick-like')) return;
        navigate(`/product/${productId}${isBrandProduct ? '?source=brand' : '?source=creator'}`);
    };

    const handlePinClick = async (e) => {
        e.stopPropagation();
        if (!isOwner || pinLoading) return;
        const next = !isPinned;
        setIsPinned(next);
        setPinLoading(true);
        try {
            await productActions.pinProduct(productId);
            setSnackbar({ show: true, message: next ? 'Product pinned' : 'Product unpinned', type: 'success' });
        } catch {
            setIsPinned(!next);
            setSnackbar({ show: true, message: 'Failed to update pin', type: 'error' });
        } finally { setPinLoading(false); }
    };

    const handleCreatorClick = (e) => {
        e.stopPropagation();
        if (isBrandProduct) {
            const brandId = typeof brand === 'object' ? getEntityId(brand) : brand;
            if (brandId) navigate(`/brand-profile/${brandId}`);
            return;
        }
        if (creatorId) navigate(`/user/${creatorId}`);
    };

    const handleLikeClick = async (e) => {
        e.stopPropagation();
        if (!isAuthenticated) { navigate('/login'); return; }
        const prev = isLiked;
        setIsLiked(!isLiked);
        setLikeCount(c => isLiked ? c - 1 : c + 1);
        try {
            const result = await productActions.likeProduct(productId);
            if (result && result.success === false) {
                setIsLiked(prev);
                setLikeCount(c => isLiked ? c + 1 : c - 1);
            }
        } catch (err) {
            setIsLiked(prev);
            setLikeCount(c => isLiked ? c + 1 : c - 1);
            setSnackbar({ show: true, message: err?.message || 'Failed to update like', type: 'error' });
        }
    };

    const handleShareClick = (e) => { e.stopPropagation(); setShowShare(s => !s); setOpenMenu(false); };
    const handleMenuClick = (e) => { e.stopPropagation(); setOpenMenu(m => !m); setShowShare(false); };

    const handleCopyLink = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(`${window.location.origin}/product/${productId}${isBrandProduct ? '?source=brand' : '?source=creator'}`);
        setCopied(true);
        setTimeout(() => { setShowShare(false); setCopied(false); }, 1500);
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        setOpenMenu(false);
        if (!window.confirm('Delete this product?')) return;
        try {
            await ProductService.deleteProduct(productId);
            setSnackbar({ show: true, message: 'Product deleted', type: 'success' });
            if (onDelete) onDelete(productId);
        } catch {
            setSnackbar({ show: true, message: 'Failed to delete', type: 'error' });
        }
    };

    const handleEdit = (e) => { e.stopPropagation(); setOpenMenu(false); setShowEditModal(true); };

    const getImageUrl = (urlOrObj) => {
        if (!urlOrObj) return PLACEHOLDER_IMAGE;
        const url = typeof urlOrObj === 'object' ? urlOrObj.url : urlOrObj;
        if (!url || typeof url !== 'string') return PLACEHOLDER_IMAGE;
        if (url.startsWith('http')) return url;
        return API_CONFIG.BASE_URL + url;
    };

    const firstMedia = Array.isArray(product.media) && product.media.length > 0 ? product.media[0] : null;
    const displayImage = getImageUrl(product.image || product.imageUrl || firstMedia);
    const creatorImage = typeof creator === 'object' ? getProfileImageUrl(creator) : null;
    const brandImage = typeof brand === 'object' ? getProfileImageUrl(brand) : getImageUrl(product.logoUrl || product.logo);
    const isBoosted = product._feedSource === 'boosted' || product.boostedConfig?.isBoosted;
    const category = Array.isArray(product.category) ? product.category[0] : product.category;
    const attribution = isBrandProduct
        ? {
            image: brandImage,
            name: (typeof brand === 'object' && getDisplayName(brand, product.brandName || 'Brand')) || product.brandName || 'Brand',
            fallback: 'B',
        }
        : {
            image: creatorImage,
            name: typeof creator === 'object' ? getDisplayName(creator) : null,
            fallback: '?',
        };

    useEffect(() => {
        const close = () => { setOpenMenu(false); setShowShare(false); };
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, []);

    return (
        <>
            <div className="pcard" onClick={handleCardClick}>

                {/* ── Image area ── */}
                <div className="pcard-media">
                    <img
                        src={displayImage}
                        alt={product.name || product.title}
                        onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                    />

                    {/* Top-left badges (pin / boost) */}
                    {(isPinned || isBoosted) && (
                        <div className="pcard-badges-top">
                            {isPinned && (
                                <span className="pcard-badge pcard-badge--pin" onClick={handlePinClick}>
                                    <Pin size={9} />Pinned
                                </span>
                            )}
                            {isBoosted && (
                                <span className="pcard-badge pcard-badge--boost">
                                    <Sparkles size={9} />Featured
                                </span>
                            )}
                        </div>
                    )}

                    {/* Always-visible like button (top-right) */}
                    <button
                        className={`pcard-quick-like${isLiked ? ' liked' : ''}`}
                        onClick={handleLikeClick}
                        aria-label={isLiked ? 'Unlike' : 'Like'}
                    >
                        <Heart size={13} strokeWidth={2} fill={isLiked ? 'currentColor' : 'none'} />
                    </button>

                    {/* Hover overlay — share + manage actions */}
                    <div className="pcard-overlay" onClick={e => e.stopPropagation()}>
                        <div className="pcard-overlay-actions">
                            <button className="pcard-icon-btn" onClick={handleShareClick} title="Share">
                                <Share2 size={13} />
                            </button>
                            {canManageProduct && (
                                <button className="pcard-icon-btn" onClick={handleMenuClick} title="More">
                                    <MoreHorizontal size={13} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Share popup */}
                    {showShare && (
                        <div className="pcard-share-popup" onClick={e => e.stopPropagation()}>
                            <p className="pcard-share-label"><Link2 size={13} />Copy link</p>
                            <div className="pcard-share-row">
                                <input
                                    readOnly
                                    value={`${window.location.origin}/product/${productId}${isBrandProduct ? '?source=brand' : '?source=creator'}`}
                                    className="pcard-share-input"
                                />
                                <button className={`pcard-copy-btn${copied ? ' done' : ''}`} onClick={handleCopyLink}>
                                    {copied ? <Check size={13} /> : <Copy size={13} />}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Context menu */}
                    {openMenu && (
                        <div className="pcard-menu-popup" onClick={e => e.stopPropagation()}>
                            {isOwner && (
                                <button onClick={handlePinClick}>
                                    <Pin size={14} />{isPinned ? 'Unpin' : 'Pin to top'}
                                </button>
                            )}
                            <button onClick={handleEdit}>
                                <Edit2 size={14} />Edit product
                            </button>
                            <button className="danger" onClick={handleDelete}>
                                <Trash2 size={14} />Delete
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Info strip ── */}
                <div className="pcard-info">
                    {/* Category pill — now in info strip, always visible */}
                    {category && <span className="pcard-cat-label">{category}</span>}

                    <h4 className="pcard-title">{product.name || product.title}</h4>

                    <div className="pcard-footer">
                        {attribution.name ? (
                            <button className="pcard-creator" onClick={handleCreatorClick}>
                                {attribution.image ? (
                                    <img
                                        src={attribution.image}
                                        alt=""
                                        className="pcard-creator-avatar"
                                        onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                    />
                                ) : null}
                                <span
                                    className="pcard-creator-fallback"
                                    style={{ display: attribution.image ? 'none' : 'flex' }}
                                >
                                    {(attribution.name || attribution.fallback)[0].toUpperCase()}
                                </span>
                                <span className="pcard-creator-name">
                                    {attribution.name}
                                </span>
                            </button>
                        ) : <span />}

                        {likeCount > 0 && (
                            <span className="pcard-like-count">
                                <Heart size={10} fill={isLiked ? 'currentColor' : 'none'} />
                                {likeCount}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <Snackbar
                isVisible={snackbar.show}
                message={snackbar.message}
                type={snackbar.type}
                onClose={() => setSnackbar(s => ({ ...s, show: false }))}
            />

            <AddProductModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                productToEdit={product}
                onProductAdded={() => window.location.reload()}
            />
        </>
    );
};

export default ProductCard;
