import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, Zap, Shield, Heart, TrendingUp } from 'lucide-react';
import '../styles/About.css';

const About = () => {
    const features = [
        {
            icon: Target,
            title: 'Curated Collections',
            description: 'Discover handpicked collections from creators you trust, organized by theme and style.'
        },
        {
            icon: Users,
            title: 'Creator Community',
            description: 'Connect with influencers and curators who share your passion and aesthetic.'
        },
        {
            icon: Zap,
            title: 'Instant Discovery',
            description: 'Find exactly what you\'re looking for with our powerful search and recommendation engine.'
        },
        {
            icon: Shield,
            title: 'Verified Quality',
            description: 'Every collection is curated by real people who genuinely use and love these products.'
        },
        {
            icon: Heart,
            title: 'Save & Organize',
            description: 'Build your own collections and keep track of items you love across the web.'
        },
        {
            icon: TrendingUp,
            title: 'Trending Insights',
            description: 'Stay ahead with trending collections and see what\'s popular in your community.'
        }
    ];

    const stats = [
        { value: '50K+', label: 'Active Users' },
        { value: '100K+', label: 'Collections' },
        { value: '500+', label: 'Creators' },
        { value: '1M+', label: 'Items Curated' }
    ];

    return (
        <motion.div
            className="about-page"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="about-container">
                {/* Hero Section */}
                <div className="about-hero">
                    <h1 className="about-title">About <span className="accent">dropp.</span></h1>
                    <p className="about-subtitle">
                        Where influence meets reality. We're redefining how people discover and share the products they love.
                    </p>
                </div>

                {/* Mission Section */}
                <section className="about-section">
                    <h2 className="section-title">Our Mission</h2>
                    <p className="section-content">
                        At dropp., we believe that the best product recommendations come from real people you trust.
                        We've built a platform where creators and curators can share their authentic favorites,
                        and where everyone can discover products that truly match their style and needs.
                    </p>
                    <p className="section-content">
                        We're not just another shopping platform. We're a community of tastemakers, early adopters,
                        and passionate individuals who believe in the power of genuine recommendations over
                        algorithmic ads.
                    </p>
                </section>

                {/* Stats */}
                <section className="about-stats">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            className="stat-item"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="stat-value">{stat.value}</div>
                            <div className="stat-label">{stat.label}</div>
                        </motion.div>
                    ))}
                </section>

                {/* Features Grid */}
                <section className="about-section">
                    <h2 className="section-title">What Makes Us Different</h2>
                    <div className="features-grid">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <motion.div
                                    key={index}
                                    className="feature-card"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="feature-icon">
                                        <Icon size={24} />
                                    </div>
                                    <h3 className="feature-title">{feature.title}</h3>
                                    <p className="feature-description">{feature.description}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* Meet Our Team */}
                <section className="about-section">
                    <h2 className="section-title">Meet Our Team</h2>
                    <p className="section-content">
                        The passionate people behind Dropp who are building the future of social curation.
                    </p>
                    <div className="features-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                        {[
                            { name: 'Team Member', role: 'Founder & CEO' },
                            { name: 'Team Member', role: 'Co-Founder & CTO' },
                            { name: 'Team Member', role: 'Lead Designer' },
                            { name: 'Team Member', role: 'Full Stack Developer' },
                        ].map((member, index) => (
                            <motion.div
                                key={index}
                                className="feature-card"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}
                            >
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    background: 'var(--accent-gradient)',
                                    margin: '0 auto var(--spacing-sm)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    fontFamily: 'var(--font-display)',
                                }}>
                                    {member.name.charAt(0)}
                                </div>
                                <h3 style={{
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    fontFamily: 'var(--font-display)',
                                    color: 'var(--text-primary)',
                                    marginBottom: '0.25rem',
                                }}>{member.name}</h3>
                                <p style={{
                                    fontSize: '0.85rem',
                                    color: 'var(--text-secondary)',
                                }}>{member.role}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Vision Section */}
                <section className="about-section about-vision">
                    <h2 className="section-title">Our Vision</h2>
                    <p className="section-content">
                        We envision a world where product discovery is personal, authentic, and community-driven.
                        Where you can trust that every recommendation comes from someone who genuinely uses and
                        loves what they're sharing.
                    </p>
                    <p className="section-content">
                        Join us in building the future of social commerce—one collection at a time.
                    </p>
                </section>

                {/* Connect With Us */}
                <section className="about-section" style={{ textAlign: 'center' }}>
                    <h2 className="section-title">Connect With Us</h2>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--spacing-md)', flexWrap: 'wrap', marginTop: 'var(--spacing-md)' }}>
                        {[
                            { label: 'Twitter / X', href: 'https://x.com/ondropp' },
                            { label: 'Instagram', href: 'https://instagram.com/ondropp' },
                            { label: 'LinkedIn', href: 'https://linkedin.com/company/ondropp' },
                        ].map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: 'var(--glass-bg)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: 'var(--radius-lg)',
                                    color: 'var(--text-primary)',
                                    textDecoration: 'none',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    fontFamily: 'var(--font-display)',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>
                </section>
            </div>
        </motion.div>
    );
};

export default About;
