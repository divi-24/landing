import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const ExploreNav = () => {
    // Placeholder data for masonry grid
    const items = Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        height: Math.floor(Math.random() * (400 - 200 + 1) + 200),
        user: `User ${i + 1}`,
        product: `Product ${i + 1}`
    }));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            style={{ padding: 'var(--spacing-lg) 0' }}
        >
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
                    <h1 style={{
                        fontSize: '3rem',
                        marginBottom: 'var(--spacing-sm)',
                        marginTop: 'var(--spacing-lg)',
                        fontFamily: 'var(--font-display)',
                        fontWeight: '700',
                        letterSpacing: '-0.03em',
                        color: 'var(--text-primary)',
                    }}>
                        Explore <span style={{
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                            fontWeight: '400',
                            background: 'var(--accent-gradient)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}>collections.</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>Discover what's trending in the community.</p>
                </div>

                <div style={{
                    columnCount: 3,
                    columnGap: 'var(--spacing-md)',
                }}>
                    {items.map((item) => (
                        <motion.div
                            key={item.id}
                            whileHover={{ y: -5 }}
                            style={{
                                breakInside: 'avoid',
                                marginBottom: 'var(--spacing-md)',
                                backgroundColor: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius-lg)',
                                overflow: 'hidden',
                                position: 'relative',
                                height: `${item.height}px`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <img
                                src={`https://picsum.photos/seed/${item.id}/400/${item.height}`}
                                alt="Random"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />

                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
                                opacity: 0,
                                transition: 'opacity 0.3s',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-end',
                                padding: 'var(--spacing-sm)',
                                color: 'white'
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                            >
                                <div style={{ fontWeight: '600', fontFamily: 'var(--font-display)' }}>{item.product}</div>
                                <div style={{ fontSize: '0.8125rem', opacity: 0.8 }}>by {item.user}</div>
                                <button style={{
                                    marginTop: 'var(--spacing-xs)',
                                    background: 'linear-gradient(135deg, #0D36C7, #3887F8, #57A0FF)',
                                    color: 'white',
                                    padding: '8px 16px',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '0.8125rem',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    width: 'fit-content',
                                    fontFamily: 'var(--font-display)',
                                    border: 'none',
                                    cursor: 'pointer',
                                }}>
                                    Get Link <ArrowUpRight size={14} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default ExploreNav;
