import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader, Store, Users, Grid } from 'lucide-react';
import ProductMasonryGrid from './ProductMasonryGrid';
import { ShimmerCollectionGrid } from './Shimmer';
import ProductService from '../core/services/ProductService';
import BrandProductService from '../core/services/BrandProductService';
import { categories } from '../data/categories';
import { showcaseProducts } from '../data/showcaseData';
import '../styles/ProductFeed.css';

const ProductFeed = ({ defaultTab = 'brand' }) => {
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);

    const [brandProducts, setBrandProducts] = useState([]);
    const [brandLoading, setBrandLoading] = useState(false);
    const [brandLoaded, setBrandLoaded] = useState(false);

    const [creatorProducts, setCreatorProducts] = useState([]);
    const [creatorLoading, setCreatorLoading] = useState(false);
    const [creatorLoaded, setCreatorLoaded] = useState(false);

    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const loadBrandProducts = useCallback(async () => {
        if (brandLoaded) return;
        setBrandLoading(true);
        try {
            const data = await BrandProductService.exploreBrandProducts();
            setBrandProducts(Array.isArray(data) && data.length > 0 ? data : showcaseProducts);
        } catch {
            setBrandProducts(showcaseProducts);
        } finally {
            setBrandLoading(false);
            setBrandLoaded(true);
        }
    }, [brandLoaded]);

    const loadCreatorProducts = useCallback(async () => {
        if (creatorLoaded) return;
        setCreatorLoading(true);
        try {
            const data = await ProductService.getExploreProducts();
            setCreatorProducts(Array.isArray(data) && data.length > 0 ? data : showcaseProducts);
        } catch {
            setCreatorProducts(showcaseProducts);
        } finally {
            setCreatorLoading(false);
            setCreatorLoaded(true);
        }
    }, [creatorLoaded]);

    // Load initial tab on mount
    useEffect(() => {
        if (defaultTab === 'brand') loadBrandProducts();
        else loadCreatorProducts();
    }, []);

    const handleTabSwitch = (tab) => {
        if (tab === activeTab) return;
        setActiveTab(tab);
        setActiveCategory('All');
        setSearchQuery('');
        setIsSearching(false);
        setSearchResults([]);
        if (tab === 'brand') loadBrandProducts();
        else loadCreatorProducts();
    };

    // Debounced search
    useEffect(() => {
        const t = setTimeout(() => {
            if (searchQuery.trim()) {
                handleSearch(searchQuery);
            } else {
                setIsSearching(false);
                setSearchResults([]);
            }
        }, 450);
        return () => clearTimeout(t);
    }, [searchQuery]);

    const handleSearch = async (q) => {
        setSearchLoading(true);
        setIsSearching(true);
        try {
            const res = activeTab === 'brand'
                ? await BrandProductService.searchProducts(q)
                : await ProductService.searchProducts(q);
            if (Array.isArray(res) && res.length > 0) {
                setSearchResults(res);
            } else {
                const needle = q.toLowerCase();
                setSearchResults(showcaseProducts.filter(product => {
                    const haystack = [
                        product.name,
                        product.desc,
                        product.brandName,
                        ...(Array.isArray(product.category) ? product.category : [product.category]),
                    ].filter(Boolean).join(' ').toLowerCase();
                    return haystack.includes(needle);
                }));
            }
        } catch {
            const needle = q.toLowerCase();
            setSearchResults(showcaseProducts.filter(product => {
                const haystack = [
                    product.name,
                    product.desc,
                    product.brandName,
                    ...(Array.isArray(product.category) ? product.category : [product.category]),
                ].filter(Boolean).join(' ').toLowerCase();
                return haystack.includes(needle);
            }));
        } finally {
            setSearchLoading(false);
        }
    };

    const activeList = activeTab === 'brand' ? brandProducts : creatorProducts;
    const isLoadingFeed = activeTab === 'brand' ? brandLoading : creatorLoading;

    const filtered = activeCategory === 'All'
        ? activeList
        : activeList.filter(p =>
            Array.isArray(p.category)
                ? p.category.includes(activeCategory)
                : p.category === activeCategory
        );

    const displayedItems = isSearching ? searchResults : filtered;
    const showLoading = isLoadingFeed || (isSearching && searchLoading);

    return (
        <div className="pf-root">
            {/* ── Tabs + Search row ── */}
            <div className="pf-controls">
                <div className="pf-tabs" role="tablist">
                    <button
                        role="tab"
                        aria-selected={activeTab === 'brand'}
                        className={`pf-tab${activeTab === 'brand' ? ' active' : ''}`}
                        onClick={() => handleTabSwitch('brand')}
                    >
                        <Store size={13} strokeWidth={2.2} />
                        Brand Products
                    </button>
                    <button
                        role="tab"
                        aria-selected={activeTab === 'creator'}
                        className={`pf-tab${activeTab === 'creator' ? ' active' : ''}`}
                        onClick={() => handleTabSwitch('creator')}
                    >
                        <Users size={13} strokeWidth={2.2} />
                        Creator Products
                    </button>
                </div>

                <div className={`pf-search${searchFocused ? ' focused' : ''}`}>
                    {searchLoading
                        ? <Loader size={14} className="pf-spin" />
                        : <Search size={14} className="pf-search-icon" strokeWidth={2.2} />
                    }
                    <input
                        type="text"
                        placeholder={activeTab === 'brand' ? 'Search brand products…' : 'Search creator products…'}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        aria-label="Search products"
                    />
                    <AnimatePresence>
                        {searchQuery && (
                            <motion.button
                                className="pf-search-clear"
                                onClick={() => setSearchQuery('')}
                                initial={{ opacity: 0, scale: 0.6 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.6 }}
                                transition={{ duration: 0.1 }}
                                aria-label="Clear"
                            >
                                <X size={11} />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ── Category filters ── */}
            {!isSearching && (
                <div className="pf-cats" role="group" aria-label="Filter by category">
                    {categories.map((cat, i) => (
                        <motion.button
                            key={cat}
                            role="radio"
                            aria-checked={activeCategory === cat}
                            className={`pf-cat${activeCategory === cat ? ' active' : ''}`}
                            onClick={() => setActiveCategory(cat)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.008, duration: 0.16 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {cat}
                        </motion.button>
                    ))}
                </div>
            )}

            {/* ── Count meta ── */}
            {!showLoading && (
                isSearching
                    ? searchResults.length > 0 && (
                        <p className="pf-meta">
                            <strong>{searchResults.length}</strong> result{searchResults.length !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
                        </p>
                    )
                    : filtered.length > 0 && (
                        <p className="pf-meta">
                            {filtered.length} {activeCategory !== 'All' ? `${activeCategory} ` : ''}{activeTab === 'brand' ? 'brand products' : 'drops'}
                        </p>
                    )
            )}

            {/* ── Feed ── */}
            <div className="pf-feed">
                {showLoading ? (
                    <ShimmerCollectionGrid count={10} />
                ) : displayedItems.length > 0 ? (
                    <ProductMasonryGrid products={displayedItems} productSource={activeTab} />
                ) : (
                    <motion.div
                        className="pf-empty"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="pf-empty-icon">
                            {isSearching ? <Search size={24} strokeWidth={1.5} /> : <Grid size={24} strokeWidth={1.5} />}
                        </div>
                        <p className="pf-empty-title">
                            {isSearching ? 'No results found' : 'Nothing here yet'}
                        </p>
                        <p className="pf-empty-sub">
                            {isSearching
                                ? `No products match "${searchQuery}"`
                                : activeTab === 'brand'
                                    ? 'No brand products available right now.'
                                    : 'No creator products available right now.'}
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ProductFeed;
