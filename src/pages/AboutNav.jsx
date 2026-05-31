import React from 'react';
import { motion } from 'framer-motion';

const AboutNav = () => {
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
                    About{' '}
                    <span style={{
                        fontFamily: 'var(--font-serif)',
                        fontStyle: 'italic',
                        fontWeight: '400',
                        background: 'var(--accent-gradient)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}>dropp.</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>Where influence meets reality. We are redefining social commerce.</p>
            </div>
        </motion.div>
    );
};

export default AboutNav;
