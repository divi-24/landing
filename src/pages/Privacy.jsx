import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Shield, FileText } from 'lucide-react';
import '../styles/Legal.css';

const sections = [
    {
        id: 'overview',
        title: 'Overview',
        body: (
            <>
                <p>Dropp ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and share information about you when you use the Dropp platform and its associated services.</p>
                <p>By using Dropp, you agree to the collection and use of information in accordance with this policy. If you disagree, please discontinue using the Platform.</p>
            </>
        ),
    },
    {
        id: 'collection',
        title: 'Information We Collect',
        body: (
            <>
                <p><strong>Information you provide directly:</strong></p>
                <ul>
                    <li>Account details — name, email address, username, date of birth</li>
                    <li>Profile data — bio, profile picture, location, pronouns, interests</li>
                    <li>Content you create — collections, product listings, images, videos, likes</li>
                    <li>Payment information (processed securely via Razorpay — we do not store card details)</li>
                    <li>Communications with us (support emails)</li>
                </ul>
                <p><strong>Information collected automatically:</strong></p>
                <ul>
                    <li>Usage data — pages visited, features used, engagement metrics</li>
                    <li>Device information — browser type, operating system, screen resolution</li>
                    <li>IP address — for security, fraud prevention, and approximate geolocation</li>
                    <li>Referral source — how you arrived at Dropp</li>
                </ul>
            </>
        ),
    },
    {
        id: 'use',
        title: 'How We Use Your Information',
        body: (
            <>
                <p>We use the information we collect to:</p>
                <ul>
                    <li>Provide, operate, and maintain the Dropp platform</li>
                    <li>Personalize your feed and discovery experience based on interests and engagement</li>
                    <li>Send important account notifications — login alerts, email verification, security alerts</li>
                    <li>Display your public profile, collections, and content to other users</li>
                    <li>Process subscription payments and manage billing</li>
                    <li>Generate aggregated, anonymized analytics to improve platform performance</li>
                    <li>Detect, prevent, and investigate fraud, abuse, or security incidents</li>
                    <li>Comply with legal obligations</li>
                </ul>
                <p>We do not use your personal data for advertising profiling or sell it to advertisers.</p>
            </>
        ),
    },
    {
        id: 'sharing',
        title: 'Information Sharing',
        body: (
            <>
                <p><strong>We do not sell your personal data.</strong> We may share information only in the following circumstances:</p>
                <ul>
                    <li><strong>Service providers</strong> — trusted third parties who help us operate the platform, including Cloudinary (media hosting), Razorpay (payments), and transactional email services. These providers are contractually bound to use your data only for the services they perform for us.</li>
                    <li><strong>Public profile</strong> — your username, bio, profile picture, and public collections are visible to other users and may be indexed by search engines.</li>
                    <li><strong>Legal requirements</strong> — we may disclose information if required by law, court order, or governmental authority.</li>
                    <li><strong>Business transfers</strong> — if Dropp is acquired or merges with another company, your information may be transferred as part of that transaction.</li>
                </ul>
            </>
        ),
    },
    {
        id: 'security',
        title: 'Data Security',
        body: (
            <>
                <p>We implement reasonable technical and organizational measures to protect your data:</p>
                <ul>
                    <li>Passwords are hashed using bcrypt — we never store plaintext passwords</li>
                    <li>All data is transmitted over HTTPS encryption</li>
                    <li>Authentication uses short-lived JWT tokens stored in browser localStorage</li>
                    <li>Login alerts are sent via email to notify you of new sign-ins from unrecognized devices</li>
                    <li>Payment information is handled exclusively by Razorpay's PCI-DSS-compliant infrastructure</li>
                </ul>
                <p>No method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.</p>
            </>
        ),
    },
    {
        id: 'rights',
        title: 'Your Rights & Choices',
        body: (
            <>
                <p>Depending on your jurisdiction, you may have the following rights regarding your personal data:</p>
                <ul>
                    <li><strong>Access</strong> — view your personal data through your profile at any time</li>
                    <li><strong>Correction</strong> — update or correct your information in the Edit Profile section</li>
                    <li><strong>Deletion</strong> — permanently delete your account and all associated data from the Settings page. This action is irreversible.</li>
                    <li><strong>Portability</strong> — data export functionality is planned for a future release</li>
                    <li><strong>Objection</strong> — contact us to object to specific processing of your data</li>
                </ul>
                <p>To exercise any of these rights, you can use the in-app tools or contact us directly at <a href="mailto:ondropp.app@gmail.com">ondropp.app@gmail.com</a>.</p>
            </>
        ),
    },
    {
        id: 'storage',
        title: 'Cookies & Storage',
        body: (
            <>
                <p>We use browser <strong>localStorage</strong> to store your authentication token for a seamless login experience across sessions.</p>
                <p>We use <strong>Vercel Analytics</strong> for anonymous, aggregated page view statistics. This collects no personally identifiable information and uses no tracking cookies.</p>
                <p>We do not use third-party advertising cookies, tracking pixels, or behavioural profiling technologies.</p>
            </>
        ),
    },
    {
        id: 'retention',
        title: 'Data Retention',
        body: (
            <>
                <p>We retain your personal data for as long as your account is active or as needed to provide you services. When you delete your account:</p>
                <ul>
                    <li>Your profile, collections, and content are permanently deleted</li>
                    <li>Certain data may be retained for up to 90 days in backups before permanent deletion</li>
                    <li>We may retain minimal information (e.g., email address) for fraud prevention and legal compliance where required by law</li>
                </ul>
            </>
        ),
    },
    {
        id: 'children',
        title: "Children's Privacy",
        body: (
            <>
                <p>Dropp is not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13.</p>
                <p>If you are a parent or guardian and believe your child has provided us with personal information, please contact us at <a href="mailto:ondropp.app@gmail.com">ondropp.app@gmail.com</a>. We will take steps to delete the information promptly.</p>
            </>
        ),
    },
    {
        id: 'third-party',
        title: 'Third-Party Links',
        body: (
            <>
                <p>Dropp allows creators to share links to external products and websites. These third-party sites have their own privacy policies, and we have no control over their content or practices.</p>
                <p>We are not responsible for the privacy practices or content of any third-party websites linked from our platform. We encourage you to review the privacy policy of any site you visit.</p>
            </>
        ),
    },
    {
        id: 'changes',
        title: 'Changes to This Policy',
        body: (
            <>
                <p>We may update this Privacy Policy periodically. We will update the "Last updated" date at the top of this page and, for material changes, make reasonable efforts to notify you via email or in-app notification.</p>
                <p>Your continued use of Dropp after changes are posted constitutes your acceptance of the updated Privacy Policy.</p>
            </>
        ),
    },
    {
        id: 'contact',
        title: 'Contact Us',
        body: (
            <>
                <p>If you have questions, concerns, or requests about this Privacy Policy or our data practices, please contact us:</p>
            </>
        ),
        hasContact: true,
    },
];

const Privacy = () => {
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
                    <Shield size={12} />
                    Legal
                    <span className="legal-breadcrumb-sep">/</span>
                    <span className="legal-breadcrumb-active">Privacy Policy</span>
                </div>
                <h1 className="legal-title">
                    Privacy <span className="accent">Policy.</span>
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
                            Also read our Terms of Service to understand the rules for using Dropp.
                        </span>
                        <Link to="/terms" className="legal-companion-link">
                            <FileText size={15} />
                            Terms of Service
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Privacy;
