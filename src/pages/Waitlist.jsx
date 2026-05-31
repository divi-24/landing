import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    BadgeCheck,
    Box,
    Image,
    Instagram,
    Layers3,
    Linkedin,
    PenTool,
} from 'lucide-react';
import '../styles/Waitlist.css';

const featurePills = [
    { label: 'Product drops', icon: Layers3, className: 'pill-products' },
    { label: 'Creator pages', icon: Image, className: 'pill-creators' },
    { label: 'Brand rooms', icon: Box, className: 'pill-brands' },
    { label: 'Collections', icon: PenTool, className: 'pill-collections' },
];

const Waitlist = () => {
    const [formData, setFormData] = useState({ email: '', name: '' });
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const response = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name || 'Dropp waitlist',
                    email: formData.email,
                    role: 'Waitlist',
                    interest: 'Early access',
                }),
            });
            const data = await response.json().catch(() => ({}));

            if (!response.ok || data.success === false) {
                throw new Error(data.message || 'Could not request early access');
            }

            setStatus('success');
            setMessage(data.existing ? 'You are already on the list. We saved your spot.' : 'You are in. We will reach out when access opens.');
        } catch (error) {
            setStatus('error');
            setMessage(error.message || 'Could not request early access');
        }
    };

    return (
        <main className="wl-page">
            <div className="wl-stage-glow" aria-hidden="true" />
            <Link to="/landing" className="wl-back">
                <ArrowLeft size={16} />
                Back
            </Link>

            <motion.section
                className="wl-device"
                initial={{ opacity: 0, y: 28, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="wl-screen">
                    <div className="wl-ring wl-ring-one" aria-hidden="true" />
                    <div className="wl-ring wl-ring-two" aria-hidden="true" />
                    <div className="wl-ring wl-ring-three" aria-hidden="true" />

                    <div className="wl-corner-dot wl-dot-a" aria-hidden="true" />
                    <div className="wl-corner-dot wl-dot-b" aria-hidden="true" />
                    <div className="wl-corner-dot wl-dot-c" aria-hidden="true" />
                    <div className="wl-corner-dot wl-dot-d" aria-hidden="true" />

                    {featurePills.map(({ label, icon: Icon, className }, index) => (
                        <motion.div
                            className={`wl-floating-pill ${className}`}
                            key={label}
                            initial={{ opacity: 0, y: 12, scale: 0.92 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: 0.3 + index * 0.12, duration: 0.5 }}
                        >
                            <span><Icon size={16} /></span>
                            {label}
                        </motion.div>
                    ))}

                    <motion.div
                        className="wl-center"
                        initial={{ opacity: 0, y: 22 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.18, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="wl-brand">
                            <img src="/img/dropp-logo-wordmark.png" alt="Dropp" />
                            <span>Early access</span>
                        </div>

                        <h1>
                            <span>Create.</span>
                            <span className="wl-title-row">
                                Share.
                                Grow.
                            </span>
                        </h1>

                        <p>
                            Join Dropp before launch. Curate products, build creator storefronts, and give brands a calmer way to launch with people audiences already trust.
                        </p>

                        <form className="wl-form" onSubmit={handleSubmit}>
                            <label>
                                <span>Your email</span>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
                                    placeholder="you@example.com"
                                    required
                                    disabled={status === 'loading'}
                                />
                            </label>
                            <label className="wl-name-field">
                                <span>Name</span>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                                    placeholder="Your name"
                                    disabled={status === 'loading'}
                                />
                            </label>
                            <button type="submit" disabled={status === 'loading'}>
                                {status === 'loading' ? 'Requesting...' : 'Request early access'}
                                <ArrowRight size={17} />
                            </button>
                        </form>

                        {message && (
                            <motion.div
                                className={`wl-message ${status === 'success' ? 'success' : 'error'}`}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {status === 'success' && <BadgeCheck size={16} />}
                                {message}
                            </motion.div>
                        )}

                        <div className="wl-socials" aria-label="Social links">
                            <a href="https://www.linkedin.com/company/ondropp/" target="_blank" rel="noopener noreferrer" aria-label="Dropp on LinkedIn">
                                <Linkedin size={18} />
                            </a>
                            <a href="https://www.instagram.com/dropp_app?igsh=MXE5dTFyYWVmYTd1Mw==" target="_blank" rel="noopener noreferrer" aria-label="Dropp on Instagram">
                                <Instagram size={18} />
                            </a>
                        </div>
                    </motion.div>

                    <div className="wl-built">
                        <span />
                        Built for creators and brands
                    </div>
                </div>
            </motion.section>
        </main>
    );
};

export default Waitlist;
