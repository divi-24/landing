import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heart, Package, ArrowRight, Calendar, Tag, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserService from '../core/services/UserService';
import { getDisplayName, getProfileImageUrl, resolveMediaUrl } from '../utils/profileUtils';
import '../styles/LikedProducts.css';

const LikedProducts = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLikedProducts = async () => {
            try {
                const data = await UserService.getLikedProducts();
                setProducts(data || []);
            } catch (err) {
                console.error('Failed to fetch liked products:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLikedProducts();
    }, []);

    const thisMonthCount = useMemo(() => {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return products.filter((p) => {
            if (!p.createdAt) return false;
            return new Date(p.createdAt) >= monthStart;
        }).length;
    }, [products]);

    return (
        <motion.div
            className="liked-products-page"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
        >
            {/* ─── Hero ─── */}
            <div className="liked-hero">
                <div className="liked-hero-mesh" aria-hidden />
                <div className="liked-hero-glow" aria-hidden />
                <motion.div
                    className="liked-hero-inner"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08, duration: 0.45 }}
                >
                    <span className="liked-hero-pill">
                        <Heart size={14} strokeWidth={2.2} />
                        Your Favorites
                    </span>
                    <h1 className="liked-hero-title">Liked Products</h1>
                    <p className="liked-hero-sub">
                        All the products you've shown love to
                    </p>
                </motion.div>
            </div>

            <div className="liked-container">
                {/* ─── Stats Strip ─── */}
                {!loading && products.length > 0 && (
                    <section className="liked-stats-strip" aria-label="Liked stats">
                        <motion.div
                            className="liked-stat-tile"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                        >
                            <Heart size={18} strokeWidth={2} />
                            <div>
                                <span className="liked-stat-label">Total Liked</span>
                                <strong className="liked-stat-value">
                                    {products.length.toLocaleString()}
                                </strong>
                            </div>
                        </motion.div>
                        <motion.div
                            className="liked-stat-tile"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.22 }}
                        >
                            <Calendar size={18} strokeWidth={2} />
                            <div>
                                <span className="liked-stat-label">This Month</span>
                                <strong className="liked-stat-value">
                                    {thisMonthCount.toLocaleString()}
                                </strong>
                            </div>
                        </motion.div>
                    </section>
                )}

                {/* ─── Loading Skeleton ─── */}
                {loading && (
                    <div className="liked-grid">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="liked-skeleton-card">
                                <div className="liked-skeleton-img" />
                                <div className="liked-skeleton-bar" />
                            </div>
                        ))}
                    </div>
                )}

                {/* ─── Empty State ─── */}
                {!loading && products.length === 0 && (
                    <div className="liked-empty">
                        <div className="liked-empty-card">
                            <div className="liked-empty-icon">
                                <Heart size={28} strokeWidth={1.5} />
                            </div>
                            <h2>No liked products yet</h2>
                            <p>Tap the heart on any product to save it here</p>
                            <button
                                className="liked-empty-btn"
                                onClick={() => navigate('/explore')}
                            >
                                Explore Products <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* ─── Product Grid ─── */}
                {!loading && products.length > 0 && (
                    <div className="liked-grid">
                        {products.map((product, index) => {
                            const imageUrl = resolveMediaUrl(product.image || product.imageUrl || product.media?.[0]);
                            const creator = product.createdBy || product.creator || product.brand || product.brandId;
                            const creatorName = typeof creator === 'object' ? getDisplayName(creator, product.brandName || 'Creator') : product.brandName;
                            const creatorAvatar = typeof creator === 'object' ? getProfileImageUrl(creator) : null;
                            const category = Array.isArray(product.category) ? product.category[0] : product.category;
                            return (
                                <motion.div
                                    key={product._id}
                                    className="liked-card"
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.35,
                                        delay: index * 0.04,
                                        ease: [0.16, 1, 0.3, 1],
                                    }}
                                    onClick={() => navigate(`/product/${product._id}?source=creator`)}
                                >
                                    <div className="liked-card-img-wrap">
                                        {category && <span className="liked-card-category"><Tag size={10} />{category}</span>}
                                        {imageUrl ? (
                                            <img
                                                className="liked-card-img"
                                                src={imageUrl}
                                                alt={product.name}
                                            />
                                        ) : (
                                            <div className="liked-card-img liked-card-img--placeholder">
                                                <Package size={32} color="var(--text-muted)" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="liked-card-info">
                                        <div className="liked-card-copy">
                                            <p className="liked-card-name">{product.name || product.title}</p>
                                            {creatorName && (
                                                <span className="liked-card-creator">
                                                    {creatorAvatar ? <img src={creatorAvatar} alt="" /> : <User size={10} />}
                                                    {creatorName}
                                                </span>
                                            )}
                                        </div>
                                        <span className="liked-card-heart-badge">
                                            <Heart
                                                size={12}
                                                fill="currentColor"
                                                strokeWidth={0}
                                            />
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default LikedProducts;
