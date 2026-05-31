import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

const ProfileDemo = () => {
    const { username } = useParams();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ padding: 'var(--spacing-lg) 0' }}
        >
            <div className="container" style={{ maxWidth: '900px' }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    marginBottom: 'var(--spacing-xl)',
                    marginTop: 'var(--spacing-lg)'
                }}>
                    <motion.div
                        style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            marginBottom: 'var(--spacing-md)',
                            border: '3px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'var(--bg-secondary)'
                        }}
                    ><Lock size={32} /></motion.div>
                    <h1 style={{
                        fontSize: '2rem',
                        marginBottom: 'var(--spacing-xs)',
                        fontFamily: 'var(--font-display)',
                        fontWeight: '700',
                        letterSpacing: '-0.03em',
                    }}>@{username}</h1>
                    <p style={{
                        maxWidth: '520px',
                        marginBottom: 'var(--spacing-md)',
                        color: 'var(--text-secondary)',
                        lineHeight: '1.6'
                    }}>Sign in to view live creator profiles, collections, products, and follow status.</p>
                    <Link className="btn btn-primary" to="/login">Sign in</Link>
                </div>
            </div>
        </motion.div>
    );
};

export default ProfileDemo;
