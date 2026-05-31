import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingBag, ExternalLink } from 'lucide-react';
import { useData } from '../contexts/DataContext';

const Collection = () => {
    const { id } = useParams();
    const { getProductsForCollection, collections } = useData();

    const products = getProductsForCollection(id);
    const collection = collections.find(c => c.id === parseInt(id)) || { title: "Collection", items: 0 };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ padding: 'var(--spacing-lg) 0' }}
        >
            <div className="container">
                <Link to="/profile/alex_style" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: 'var(--spacing-md)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem'
                }}>
                    <ArrowLeft size={16} /> Back to Profile
                </Link>

                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-xs)', fontFamily: 'var(--font-display)', fontWeight: '700', letterSpacing: '-0.03em' }}>{collection.title}</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>{collection.items} items in this collection.</p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: 'var(--spacing-md)'
                }}>
                    {products.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="glass-panel"
                            style={{
                                borderRadius: 'var(--radius-md)',
                                overflow: 'hidden',
                                position: 'relative'
                            }}
                        >
                            <div style={{ height: '350px', overflow: 'hidden', position: 'relative' }}>
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <button style={{
                                    position: 'absolute',
                                    bottom: '12px',
                                    right: '12px',
                                    backgroundColor: 'white',
                                    color: 'black',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '40px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}>
                                    <ShoppingBag size={20} />
                                </button>
                            </div>
                            <div style={{ padding: 'var(--spacing-sm)' }}>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{product.brand}</div>
                                <h3 style={{ fontSize: '1.125rem', marginBottom: '8px' }}>{product.name}</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '600' }}>{product.price}</span>
                                    <button style={{
                                        fontSize: '0.875rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        color: 'var(--text-secondary)'
                                    }}>
                                        Shop <ExternalLink size={14} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default Collection;
