import React from 'react';
import { motion } from 'framer-motion';

const CreatorsNav = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ paddingTop: 'var(--header-height)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <div className="container text-center">
                <h1 style={{
                    fontSize: '3rem',
                    marginBottom: '1rem',
                    fontFamily: 'var(--font-display)',
                    fontWeight: '700',
                    letterSpacing: '-0.03em',
                    color: 'var(--text-primary)',
                }}>
                    Our{' '}
                    <span style={{
                        fontFamily: 'var(--font-serif)',
                        fontStyle: 'italic',
                        fontWeight: '400',
                        background: 'var(--accent-gradient)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}>creators.</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>Sign in to discover live creator profiles on Dropp.</p>
            </div>
        </motion.div>
    );
};

export default CreatorsNav;
