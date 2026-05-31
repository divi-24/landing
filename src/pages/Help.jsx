import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Mail } from 'lucide-react';
import '../styles/About.css';

const faqs = [
    {
        q: 'What is Dropp?',
        a: 'Dropp is a social curation platform where creators and influencers share their favorite products in organized collections. Discover authentic recommendations from people you trust.',
    },
    {
        q: 'How do I create a collection?',
        a: "After signing in, click the '+' button or use the floating action button to create a new collection. Give it a name, description, and cover image, then start adding products.",
    },
    {
        q: 'How do I add products to a collection?',
        a: "Open any collection you own, click 'Add Product', then fill in the product name, link, description, upload images or videos, and select a category and tags.",
    },
    {
        q: 'Can I make my collection private?',
        a: 'Yes! When creating or editing a collection, you can toggle the privacy setting. Private collections are only visible to you and invited members.',
    },
    {
        q: 'How does the Featured product work?',
        a: 'You can feature your products to boost their visibility in the explore feed. Featured products appear in highlighted positions for 24 hours.',
    },
    {
        q: 'How do I edit my profile?',
        a: "Go to your profile page and click the 'Edit Profile' button. You can update your name, bio, profile picture, gender, interests, and more.",
    },
    {
        q: 'How can I contact support?',
        a: 'You can reach us directly by emailing ondropp.app@gmail.com. We typically respond within 24–48 hours.',
    },
    {
        q: 'Is Dropp free to use?',
        a: 'Yes, Dropp is free for all users. We may introduce premium features for creators in the future.',
    },
];

const Help = () => {
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <motion.div
            className="about-page"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="about-container">
                <div className="about-hero">
                    <h1 className="about-title">Help <span className="accent">Center.</span></h1>
                    <p className="about-subtitle">Find answers to common questions or reach out to our team.</p>
                </div>

                <section className="about-section">
                    <h2 className="section-title">Frequently Asked Questions</h2>

                    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {faqs.map((faq, i) => (
                            <div
                                key={i}
                                style={{
                                    background: 'var(--glass-bg)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: 'var(--radius-lg)',
                                    overflow: 'hidden',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                    style={{
                                        width: '100%',
                                        padding: '1rem 1.25rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'var(--text-primary)',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        fontFamily: 'var(--font-display)',
                                        textAlign: 'left',
                                        gap: '1rem',
                                    }}
                                >
                                    {faq.q}
                                    <ChevronDown
                                        size={18}
                                        style={{
                                            flexShrink: 0,
                                            transition: 'transform 0.25s ease',
                                            transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0deg)',
                                            color: 'var(--text-secondary)',
                                        }}
                                    />
                                </button>
                                <div
                                    style={{
                                        maxHeight: openIndex === i ? '300px' : '0',
                                        overflow: 'hidden',
                                        transition: 'max-height 0.3s ease',
                                    }}
                                >
                                    <p style={{
                                        padding: '0 1.25rem 1rem',
                                        margin: 0,
                                        color: 'var(--text-secondary)',
                                        fontSize: '0.95rem',
                                        lineHeight: '1.6',
                                    }}>
                                        {faq.a}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="about-section about-vision" style={{ textAlign: 'center' }}>
                    <h2 className="section-title">Still need help?</h2>
                    <p className="section-content">
                        Our team is here to help. Reach out and we'll get back to you within 24–48 hours.
                    </p>
                    <a
                        href="mailto:ondropp.app@gmail.com"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            background: 'var(--accent-gradient)',
                            color: '#fff',
                            borderRadius: 'var(--radius-lg)',
                            textDecoration: 'none',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            fontFamily: 'var(--font-display)',
                        }}
                    >
                        <Mail size={18} />
                        ondropp.app@gmail.com
                    </a>
                </section>
            </div>
        </motion.div>
    );
};

export default Help;
