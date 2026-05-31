import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, FileText, Shield } from 'lucide-react';
import '../styles/Legal.css';

const sections = [
    {
        id: 'acceptance',
        title: 'Acceptance of Terms',
        body: (
            <>
                <p>By accessing or using Dropp ("the Platform", "we", "us"), you agree to be legally bound by these Terms of Service. If you do not agree to these terms in full, you must not use the Platform.</p>
                <p>These terms apply to all visitors, users, and others who access or use Dropp, regardless of whether you have created an account.</p>
            </>
        ),
    },
    {
        id: 'description',
        title: 'Description of Service',
        body: (
            <>
                <p>Dropp is a social curation platform that enables creators and users to:</p>
                <ul>
                    <li>Create and manage curated product collections</li>
                    <li>Share authentic product recommendations with followers</li>
                    <li>Discover items recommended by trusted creators</li>
                    <li>Follow other users and engage with their content</li>
                    <li>Access creator analytics and profile insights</li>
                </ul>
                <p>We reserve the right to modify, suspend, or discontinue any part of the Service at any time with or without notice.</p>
            </>
        ),
    },
    {
        id: 'accounts',
        title: 'User Accounts',
        body: (
            <>
                <p>To access most features, you must create an account. When registering, you agree to:</p>
                <ul>
                    <li>Provide accurate, current, and complete information</li>
                    <li>Maintain the security of your password and account</li>
                    <li>Promptly notify us of any unauthorized account access</li>
                    <li>Be at least 13 years of age (or the age of digital consent in your jurisdiction)</li>
                    <li>Maintain only one personal account</li>
                </ul>
                <p>You are solely responsible for all activity that occurs under your account. Dropp is not liable for any loss or damage arising from unauthorized account access.</p>
            </>
        ),
    },
    {
        id: 'content',
        title: 'User Content',
        body: (
            <>
                <p>You retain full ownership of any content you post on Dropp ("User Content"), including collections, product descriptions, images, and videos.</p>
                <p>By posting User Content, you grant Dropp a worldwide, non-exclusive, royalty-free license to use, display, reproduce, and distribute your content solely for the purpose of operating and improving the Platform.</p>
                <p>You represent that your User Content:</p>
                <ul>
                    <li>Does not infringe any third-party intellectual property rights</li>
                    <li>Is not false, misleading, defamatory, or harmful</li>
                    <li>Does not contain spam, malware, or unauthorized advertising</li>
                    <li>Complies with all applicable laws and regulations</li>
                </ul>
            </>
        ),
    },
    {
        id: 'acceptable-use',
        title: 'Acceptable Use',
        body: (
            <>
                <p>You agree not to use Dropp to:</p>
                <ul>
                    <li>Violate any applicable local, national, or international law</li>
                    <li>Harass, bully, intimidate, or harm other users</li>
                    <li>Impersonate any person, entity, or brand</li>
                    <li>Upload or transmit viruses, malware, or malicious code</li>
                    <li>Scrape, crawl, or systematically extract platform data without permission</li>
                    <li>Artificially inflate engagement metrics (views, likes, followers)</li>
                    <li>Use automated tools to create or interact with accounts</li>
                    <li>Attempt to gain unauthorized access to any part of the Platform</li>
                </ul>
                <p>Violations may result in immediate account suspension or termination at our sole discretion.</p>
            </>
        ),
    },
    {
        id: 'ip',
        title: 'Intellectual Property',
        body: (
            <>
                <p>All rights to the Dropp name, logo, branding, design system, source code, and underlying technology are the exclusive intellectual property of Dropp and its licensors.</p>
                <p>You may not copy, modify, distribute, reverse-engineer, or create derivative works from any part of Dropp without prior written consent from us.</p>
                <p>If you believe your intellectual property has been used on our platform without authorization, please contact us at <a href="mailto:ondropp.app@gmail.com">ondropp.app@gmail.com</a>.</p>
            </>
        ),
    },
    {
        id: 'subscriptions',
        title: 'Subscriptions & Payments',
        body: (
            <>
                <p>Dropp offers optional paid subscription plans ("Plans") that provide access to additional features. By subscribing to a Plan, you agree to:</p>
                <ul>
                    <li>Pay the applicable subscription fee on a recurring basis</li>
                    <li>Provide accurate payment information</li>
                    <li>Authorize Dropp (via Razorpay) to charge your payment method</li>
                </ul>
                <p>Subscriptions auto-renew unless cancelled before the end of the billing period. Refunds are issued at our discretion. You may cancel your subscription at any time from the Settings page.</p>
            </>
        ),
    },
    {
        id: 'featured',
        title: 'Featured Products',
        body: (
            <>
                <p>Users may feature their products to increase visibility within the explore feed. Featured placement is subject to platform guidelines and availability.</p>
                <p>Dropp does not endorse, verify, or guarantee any featured products. Product quality, accuracy, and authenticity remain the sole responsibility of the creator. Users interact with featured products at their own risk.</p>
            </>
        ),
    },
    {
        id: 'privacy',
        title: 'Privacy',
        body: (
            <>
                <p>Your use of Dropp is also governed by our <Link to="/privacy">Privacy Policy</Link>, which is incorporated into these Terms by reference. The Privacy Policy describes how we collect, use, store, and protect your personal data.</p>
                <p>By using Dropp, you consent to the data practices described in our Privacy Policy.</p>
            </>
        ),
    },
    {
        id: 'termination',
        title: 'Termination',
        body: (
            <>
                <p>We reserve the right to suspend or permanently terminate your account at any time, with or without notice, if we believe you have violated these Terms or for any other reason at our sole discretion.</p>
                <p>You may delete your account at any time from the Settings page. Upon deletion, your personal data will be permanently removed from our servers, though some information may be retained for legal or security purposes.</p>
                <p>All provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability.</p>
            </>
        ),
    },
    {
        id: 'liability',
        title: 'Limitation of Liability',
        body: (
            <>
                <p>Dropp is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.</p>
                <p>To the maximum extent permitted by law, Dropp and its affiliates, directors, employees, and agents shall not be liable for:</p>
                <ul>
                    <li>Any indirect, incidental, special, or consequential damages</li>
                    <li>Loss of data, revenue, or profits</li>
                    <li>Damages arising from third-party products shared by creators</li>
                    <li>Service interruptions or platform downtime</li>
                </ul>
            </>
        ),
    },
    {
        id: 'changes',
        title: 'Changes to Terms',
        body: (
            <>
                <p>We may revise these Terms at any time. We will indicate the date of the most recent update at the top of this page. For material changes, we will make reasonable efforts to notify you via email or an in-app notification.</p>
                <p>Your continued use of the Platform after changes are posted constitutes your acceptance of the updated Terms. If you do not agree to the revised Terms, you must stop using Dropp.</p>
            </>
        ),
    },
    {
        id: 'contact',
        title: 'Contact',
        body: (
            <>
                <p>If you have any questions, concerns, or requests regarding these Terms of Service, please reach out to us:</p>
            </>
        ),
        hasContact: true,
    },
];

const Terms = () => {
    const [activeId, setActiveId] = useState(sections[0].id);
    const sectionRefs = useRef({});

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActiveId(entry.target.id);
                });
            },
            { rootMargin: '-20% 0px -70% 0px' }
        );
        Object.values(sectionRefs.current).forEach((el) => { if (el) observer.observe(el); });
        return () => observer.disconnect();
    }, []);

    const scrollTo = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <motion.div
            className="legal-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Hero */}
            <div className="legal-hero">
                <div className="legal-breadcrumb">
                    <FileText size={12} />
                    Legal
                    <span className="legal-breadcrumb-sep">/</span>
                    <span className="legal-breadcrumb-active">Terms of Service</span>
                </div>
                <h1 className="legal-title">
                    Terms of <span className="accent">Service.</span>
                </h1>
                <div className="legal-meta">
                    <span className="legal-meta-item">Last updated — May 2026</span>
                    <span className="legal-meta-item">Effective — May 2026</span>
                </div>
            </div>

            {/* Body */}
            <div className="legal-body">
                {/* ToC */}
                <nav className="legal-toc" aria-label="Table of contents">
                    <div className="legal-toc-title">Contents</div>
                    <ul className="legal-toc-list">
                        {sections.map((s) => (
                            <li key={s.id}>
                                <button
                                    className={`legal-toc-item${activeId === s.id ? ' active' : ''}`}
                                    onClick={() => scrollTo(s.id)}
                                >
                                    {s.title}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Content */}
                <div className="legal-content">
                    {sections.map((s, i) => (
                        <motion.section
                            key={s.id}
                            id={s.id}
                            ref={(el) => { sectionRefs.current[s.id] = el; }}
                            className="legal-section"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                        >
                            <span className="legal-section-number">§{String(i + 1).padStart(2, '0')}</span>
                            <h2 className="legal-section-title">{s.title}</h2>
                            <div className="legal-section-body">{s.body}</div>

                            {s.hasContact && (
                                <div className="legal-contact-box">
                                    <div className="legal-contact-icon">
                                        <Mail size={18} />
                                    </div>
                                    <div>
                                        <div className="legal-contact-title">Get in touch</div>
                                        <div className="legal-contact-text">
                                            Email us at{' '}
                                            <a href="mailto:ondropp.app@gmail.com">ondropp.app@gmail.com</a>
                                            {' '}— we typically respond within 24–48 hours.
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.section>
                    ))}

                    {/* Companion link */}
                    <div className="legal-companion">
                        <span className="legal-companion-text">
                            Also read our Privacy Policy to understand how we handle your data.
                        </span>
                        <Link to="/privacy" className="legal-companion-link">
                            <Shield size={15} />
                            Privacy Policy
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Terms;
