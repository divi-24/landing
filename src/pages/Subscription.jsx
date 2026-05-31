import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Check, X, Sparkles, Zap, ChevronDown, Loader2, PartyPopper, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Snackbar from '../components/Snackbar';
import { useAuth } from '../contexts/AuthContext';
import UserService from '../core/services/UserService';
import '../styles/Subscription.css';

const plans = [
    {
        id: 'free',
        label: 'FREE',
        price: '₹0',
        period: '/month',
        icon: Sparkles,
        description: 'Everything you need to start. Build your dropp collection and earn — no upfront cost.',
        features: [
            { text: 'Unlimited collections', included: true },
            { text: '10 products per collection', included: true },
            { text: 'Free user account', included: true },
            { text: 'Verified badge', included: false },
            { text: 'Analytics', included: false },
            { text: "Creator's portfolio", included: false },
            { text: 'Profile visits', included: false },
            { text: 'AI powered insights', included: false },
            { text: 'Engagement', included: false },
        ],
        btnLabel: 'Join for free',
        btnVariant: 'outline',
    },
    {
        id: 'lite',
        label: 'LITE',
        price: '₹299',
        period: '/month',
        icon: Zap,
        popular: true,
        description: 'For creators ready to grow. More collections, more products, more reach.',
        features: [
            { text: 'Unlimited collections', included: true },
            { text: '30 products per collection', included: true },
            { text: 'Verified badge', included: true },
            { text: 'Basic Analytics', included: true },
            { text: "Creator's portfolio (Lite)", included: true },
            { text: 'Last 10 profile visits', included: true },
            { text: 'AI powered insights', included: true },
            { text: 'Priority support', included: true },
            { text: 'Engagement', included: false },
            { text: 'Early access', included: false },
        ],
        btnLabel: 'Upgrade to Lite',
        btnVariant: 'primary',
    },
    {
        id: 'pro',
        label: 'PRO',
        price: '₹499',
        period: '/month',
        icon: Crown,
        description: 'For creators who mean business. Full portfolio, advanced analytics, and priority on brand deals.',
        features: [
            { text: 'Unlimited collections', included: true },
            { text: 'Unlimited products', included: true },
            { text: 'Verified badge', included: true },
            { text: 'Advanced Analytics', included: true },
            { text: "Creator's portfolio (Pro)", included: true },
            { text: 'Unlimited profile visits', included: true },
            { text: 'AI powered insights', included: true },
            { text: 'Engagement', included: true },
            { text: 'Priority support', included: true },
            { text: 'Early access to beta features', included: true },
        ],
        btnLabel: 'Join Pro',
        btnVariant: 'deep',
    },
];

const comparisonFeatures = [
    { label: 'Collections', free: 'Unlimited', lite: 'Unlimited', pro: 'Unlimited' },
    { label: 'Products per collection', free: '10', lite: '30', pro: 'Unlimited' },
    { label: 'Verified badge', free: false, lite: true, pro: true },
    { label: 'Analytics', free: false, lite: 'Basic', pro: 'Advanced' },
    { label: "Creator's portfolio", free: false, lite: 'Lite', pro: 'Pro' },
    { label: 'Profile visits', free: false, lite: '10', pro: 'Unlimited' },
    { label: 'AI powered insights', free: false, lite: true, pro: true },
    { label: 'Engagement', free: false, lite: false, pro: true },
    { label: 'Priority support', free: false, lite: true, pro: true },
    { label: 'Early access', free: false, lite: false, pro: true },
];

const faqs = [
    {
        q: 'Can I cancel anytime?',
        a: 'Yes! You can cancel your subscription at any time from your account settings. Your plan will remain active until the end of the current billing period.',
    },
    {
        q: 'How does billing work?',
        a: "You'll be billed monthly on the date you subscribe. We'll send you a reminder before each billing cycle so there are no surprises.",
    },
    {
        q: 'What payment methods do you accept?',
        a: 'We accept UPI, credit/debit cards, net banking, and popular wallets through our payment partner Razorpay.',
    },
];

const FeatureItem = ({ text, included, isPopular }) => (
    <li className={`sub-feature-item ${!included ? 'sub-feature-item--disabled' : ''}`}>
        <span className={`sub-feature-icon ${included ? 'sub-feature-icon--check' : 'sub-feature-icon--x'}`}>
            {included
                ? <Check size={14} strokeWidth={3} />
                : <X size={14} strokeWidth={3} />
            }
        </span>
        <span className={`sub-feature-text ${isPopular && included ? 'sub-feature-text--light' : ''} ${isPopular && !included ? 'sub-feature-text--muted-light' : ''}`}>
            {text}
        </span>
    </li>
);

const ComparisonCell = ({ value }) => {
    if (value === true) return <Check size={16} strokeWidth={2.5} className="sub-compare-check" />;
    if (value === false) return <X size={16} strokeWidth={2.5} className="sub-compare-x" />;
    return <span className="sub-compare-text">{value}</span>;
};

const FaqItem = ({ faq, isOpen, onToggle }) => (
    <div className={`sub-faq-item ${isOpen ? 'sub-faq-item--open' : ''}`}>
        <button className="sub-faq-q" onClick={onToggle}>
            <span>{faq.q}</span>
            <ChevronDown size={18} strokeWidth={2} className="sub-faq-chevron" />
        </button>
        <AnimatePresence initial={false}>
            {isOpen && (
                <motion.div
                    className="sub-faq-a-wrap"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                    <p className="sub-faq-a">{faq.a}</p>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

const CancelModal = ({ onConfirm, onClose, loading }) => (
    <div className="modal-overlay" style={{ zIndex: 1000 }}>
        <motion.div
            className="sub-success-modal"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            style={{ maxWidth: '420px' }}
        >
            <div className="sub-success-icon-wrap" style={{ background: 'rgba(220,38,38,0.08)' }}>
                <AlertTriangle size={40} style={{ color: '#dc2626' }} />
            </div>
            <h2 className="sub-success-title" style={{ fontSize: '1.4rem' }}>Cancel Subscription?</h2>
            <p className="sub-success-msg">
                Your plan will remain active until the end of the current billing period. After that, your account will revert to the <strong>Free</strong> plan.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                    onClick={onClose}
                    disabled={loading}
                    style={{
                        flex: 1,
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '0.9rem'
                    }}
                >
                    Keep Plan
                </button>
                <button
                    onClick={onConfirm}
                    disabled={loading}
                    style={{
                        flex: 1,
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: 'none',
                        background: '#dc2626',
                        color: '#fff',
                        fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                    }}
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : 'Yes, Cancel'}
                </button>
            </div>
        </motion.div>
    </div>
);

const SuccessModal = ({ plan, onClose, onUpgradeToPro }) => (
    <div className="modal-overlay" style={{ zIndex: 1000 }}>
        <motion.div 
            className="sub-success-modal"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
        >
            <div className="sub-success-icon-wrap">
                <PartyPopper size={48} className="sub-success-icon" />
            </div>
            
            <h2 className="sub-success-title">Congratulations!</h2>
            <p className="sub-success-msg">
                You are now a <strong>{plan.toUpperCase()}</strong> member of the Dropp community.
            </p>
            
            <div className="sub-success-card">
                <div className="sub-success-badge-preview">
                    <ShieldCheck size={20} />
                    <span>Premium Badge Activated</span>
                </div>
                <p>Your exclusive badge is now visible on your profile avatar across the platform.</p>
            </div>

            {plan === 'lite' && (
                <div className="sub-upsell-box">
                    <h3>Want even more?</h3>
                    <p>Upgrade to <strong>PRO</strong> for unlimited products, advanced analytics, and priority brand deals.</p>
                    <button className="sub-upsell-btn" onClick={onUpgradeToPro}>
                        Explore Pro Features <ArrowRight size={16} />
                    </button>
                </div>
            )}

            <button className="sub-success-close-btn" onClick={onClose}>
                Start Creating
            </button>
        </motion.div>
    </div>
);

const Subscription = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, updateUser } = useAuth();
    const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'info' });
    const [openFaq, setOpenFaq] = useState(null);
    const [loadingPlan, setLoadingPlan] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [justSubscribedPlan, setJustSubscribedPlan] = useState('');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [currentPlan, setCurrentPlan] = useState(user?.plan || null);
    const [planLoading, setPlanLoading] = useState(!user?.plan);

    // Sync currentPlan whenever auth context user updates (e.g. after AuthContext fetches fresh profile)
    useEffect(() => {
        if (user?.plan) {
            setCurrentPlan(user.plan);
            setPlanLoading(false);
        } else if (!isAuthenticated) {
            setPlanLoading(false);
        }
    }, [user?.plan, isAuthenticated]);

    const handleUpgrade = async (planId) => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/subscription' } });
            return;
        }

        if (planId === 'free' || currentPlan === planId) {
            setSnackbar({
                visible: true,
                message: planId === 'free' ? "You are already on the Free plan." : `You are already on the ${planId} plan.`,
                type: 'info'
            });
            return;
        }

        setLoadingPlan(planId);
        try {
            // 1. Load Razorpay script on-demand (only when user initiates payment)
            if (!window.Razorpay) {
                await new Promise((resolve, reject) => {
                    const s = document.createElement('script');
                    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
                    s.async = true;
                    s.onload = resolve;
                    s.onerror = () => reject(new Error('Failed to load payment gateway.'));
                    document.body.appendChild(s);
                });
            }

            // 2. Create subscription on backend
            const subData = await UserService.createSubscription(planId);

            // 3. Open Razorpay Checkout
            const options = {
                key: subData.key,
                subscription_id: subData.subscriptionId,
                name: 'Dropp',
                description: 'Monthly subscription',
                prefill: {
                    name: user?.fullName || '',
                    email: user?.email || '',
                    contact: user?.phone || '',
                },
                theme: {
                    color: '#000000',
                },
                handler: async function (response) {
                    try {
                        // 3. Verify subscription on backend
                        const verificationResult = await UserService.verifySubscription({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_subscription_id: response.razorpay_subscription_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        if (verificationResult.success) {
                            // 4. Re-fetch fresh profile so plan is definitely up to date
                            try {
                                const freshProfile = await UserService.getUserProfile();
                                updateUser(freshProfile);
                                setCurrentPlan(freshProfile.plan);
                            } catch {
                                updateUser(verificationResult.user);
                                setCurrentPlan(planId);
                            }
                            setJustSubscribedPlan(planId);
                            setShowSuccess(true);
                        } else {
                            throw new Error('Verification failed');
                        }
                    } catch (err) {
                        setSnackbar({
                            visible: true,
                            message: 'Payment verification failed. Please contact support.',
                            type: 'error'
                        });
                    }
                },
                modal: {
                    ondismiss: () => {
                        console.log("User closed the checkout");
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                setSnackbar({
                    visible: true,
                    message: 'Payment failed: ' + response.error.description,
                    type: 'error'
                });
            });
            rzp.open();

        } catch (error) {
            console.error('Upgrade error:', error);
            setSnackbar({
                visible: true,
                message: error.message || 'Failed to initiate upgrade. Please try again.',
                type: 'error'
            });
        } finally {
            setLoadingPlan(null);
        }
    };

    const handleCancelSubscription = async () => {
        setCancelLoading(true);
        try {
            await UserService.cancelSubscription();
            const freshProfile = await UserService.getUserProfile().catch(() => null);
            updateUser(freshProfile || { ...user, plan: 'free' });
            setCurrentPlan(freshProfile?.plan || 'free');
            setShowCancelModal(false);
            setSnackbar({ visible: true, message: 'Subscription cancelled. Your plan will remain active until the billing period ends.', type: 'info' });
        } catch (err) {
            setSnackbar({ visible: true, message: err.message || 'Failed to cancel subscription. Please try again.', type: 'error' });
        } finally {
            setCancelLoading(false);
        }
    };

    const isLiteUser = currentPlan === 'lite';
    const isPaidUser = currentPlan && currentPlan !== 'free';
    const proPlan = plans.find(p => p.id === 'pro');

    if (planLoading) {
        return (
            <div className="subscription-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <Loader2 className="animate-spin" size={32} style={{ color: 'var(--text-secondary)' }} />
            </div>
        );
    }

    return (
        <motion.div
            className="subscription-page"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
        >
            <AnimatePresence>
                {showSuccess && (
                    <SuccessModal
                        plan={justSubscribedPlan}
                        onClose={() => { setShowSuccess(false); navigate('/plan-details'); }}
                        onUpgradeToPro={() => {
                            setShowSuccess(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                    />
                )}
                {showCancelModal && (
                    <CancelModal
                        onConfirm={handleCancelSubscription}
                        onClose={() => setShowCancelModal(false)}
                        loading={cancelLoading}
                    />
                )}
            </AnimatePresence>

            {/* Hero */}
            <div className="sub-hero">
                <div className="sub-hero-mesh" aria-hidden />
                <div className="sub-hero-glow" aria-hidden />
                <motion.div
                    className="sub-hero-inner"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08, duration: 0.45 }}
                >
                    <span className="sub-hero-pill">
                        <Crown size={14} strokeWidth={2.2} />
                        {isLiteUser ? 'Upgrade to Pro' : 'Plans & Pricing'}
                    </span>
                    <h1 className="sub-hero-title">
                        {isLiteUser ? 'Go Further with PRO' : 'Unlock Your Full Potential'}
                    </h1>
                    <p className="sub-hero-sub">
                        {isLiteUser
                            ? 'Unlimited products, advanced analytics, and priority brand deals — all in one plan.'
                            : 'Choose a plan that fits your creative journey'}
                    </p>
                </motion.div>
            </div>

            {/* Lite user: PRO-only upgrade view */}
            {isLiteUser ? (
                <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', marginBottom: 'var(--spacing-lg)' }}>
                    <motion.div
                        className="sub-plan-card"
                        style={{ maxWidth: 480, width: '100%', background: 'var(--color-deep, #1E0A3C)', color: '#fff', border: 'none', boxShadow: '0 16px 48px rgba(30,10,60,0.35)' }}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <span className="sub-plan-badge">Recommended</span>

                        <div className="sub-plan-header">
                            <div className="sub-plan-icon sub-plan-icon--popular">
                                {React.createElement(proPlan.icon, { size: 20, strokeWidth: 2 })}
                            </div>
                            <h2 className="sub-plan-label" style={{ color: '#fff' }}>{proPlan.label}</h2>
                        </div>

                        <div className="sub-plan-pricing">
                            <span className="sub-plan-currency" style={{ color: '#fff' }}>₹</span>
                            <span className="sub-plan-price" style={{ color: '#fff' }}>{proPlan.price.replace('₹', '')}</span>
                            <span className="sub-plan-period" style={{ color: 'rgba(255,255,255,0.6)' }}>{proPlan.period}</span>
                        </div>

                        <p className="sub-plan-description" style={{ color: 'rgba(255,255,255,0.72)' }}>{proPlan.description}</p>

                        <div className="sub-plan-divider" style={{ background: 'rgba(255,255,255,0.15)' }} />

                        <ul className="sub-plan-features">
                            {proPlan.features.map((feat) => (
                                <FeatureItem key={feat.text} text={feat.text} included={feat.included} isPopular={true} />
                            ))}
                        </ul>

                        <button
                            className="sub-plan-btn sub-plan-btn--deep"
                            onClick={() => handleUpgrade('pro')}
                            disabled={loadingPlan === 'pro'}
                        >
                            {loadingPlan === 'pro' ? <Loader2 className="animate-spin" size={20} /> : 'Upgrade to Pro'}
                        </button>
                    </motion.div>

                    {/* Actions for lite users */}
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button
                            onClick={() => navigate('/transactions')}
                            style={{
                                background: 'none',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-primary)',
                                padding: '0.6rem 1.5rem',
                                borderRadius: '8px',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                cursor: 'pointer'
                            }}
                        >
                            View Transactions
                        </button>
                        <button
                            onClick={() => setShowCancelModal(true)}
                            style={{
                                background: 'none',
                                border: '1px solid #dc2626',
                                color: '#dc2626',
                                padding: '0.6rem 1.5rem',
                                borderRadius: '8px',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel Subscription
                        </button>
                    </div>
                </section>
            ) : (
                <>
                    {/* All-plans grid */}
                    <section className="sub-plans">
                        {plans.map((plan, i) => (
                            <motion.div
                                key={plan.id}
                                className={`sub-plan-card ${plan.popular ? 'sub-plan-card--popular' : ''} ${currentPlan === plan.id ? 'sub-plan-card--current' : ''}`}
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                            >
                                {plan.popular && <span className="sub-plan-badge">Best choice</span>}
                                {currentPlan === plan.id && <span className="sub-plan-current-badge">Current Plan</span>}

                                <div className="sub-plan-header">
                                    <div className={`sub-plan-icon ${plan.popular ? 'sub-plan-icon--popular' : ''}`}>
                                        {React.createElement(plan.icon, { size: 20, strokeWidth: 2 })}
                                    </div>
                                    <h2 className="sub-plan-label">{plan.label}</h2>
                                </div>

                                <div className="sub-plan-pricing">
                                    <span className="sub-plan-currency">₹</span>
                                    <span className="sub-plan-price">{plan.price.replace('₹', '')}</span>
                                    <span className="sub-plan-period">{plan.period}</span>
                                </div>

                                <p className="sub-plan-description">{plan.description}</p>

                                <div className="sub-plan-divider" />

                                <ul className="sub-plan-features">
                                    {plan.features.map((feat) => (
                                        <FeatureItem
                                            key={feat.text}
                                            text={feat.text}
                                            included={feat.included}
                                            isPopular={plan.popular}
                                        />
                                    ))}
                                </ul>

                                <button
                                    className={`sub-plan-btn sub-plan-btn--${plan.btnVariant}`}
                                    onClick={() => handleUpgrade(plan.id)}
                                    disabled={loadingPlan === plan.id || currentPlan === plan.id}
                                >
                                    {loadingPlan === plan.id ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        currentPlan === plan.id ? 'Current Plan' : plan.btnLabel
                                    )}
                                </button>
                            </motion.div>
                        ))}
                    </section>

                    {/* Cancel subscription (pro users) */}
                    {isPaidUser && (
                        <div style={{ textAlign: 'center', marginTop: '0.5rem', marginBottom: '2rem' }}>
                            <button
                                onClick={() => setShowCancelModal(true)}
                                style={{
                                    background: 'none',
                                    border: '1px solid #dc2626',
                                    color: '#dc2626',
                                    padding: '0.6rem 1.5rem',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel Subscription
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Feature Comparison Table */}
            <section className="sub-compare">
                <h2 className="sub-section-title">Feature Comparison</h2>
                <div className="sub-compare-table-wrap">
                    <table className="sub-compare-table">
                        <thead>
                            <tr>
                                <th>Feature</th>
                                <th>Free</th>
                                <th>Lite</th>
                                <th>Pro</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comparisonFeatures.map((row) => (
                                <tr key={row.label}>
                                    <td>{row.label}</td>
                                    <td><ComparisonCell value={row.free} /></td>
                                    <td><ComparisonCell value={row.lite} /></td>
                                    <td><ComparisonCell value={row.pro} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* FAQ */}
            <section className="sub-faq">
                <h2 className="sub-section-title">Frequently Asked Questions</h2>
                {faqs.map((faq, i) => (
                    <FaqItem
                        key={i}
                        faq={faq}
                        isOpen={openFaq === i}
                        onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                    />
                ))}
            </section>

            <Snackbar
                message={snackbar.message}
                type={snackbar.type}
                isVisible={snackbar.visible}
                onClose={() => setSnackbar({ ...snackbar, visible: false })}
            />
        </motion.div>
    );
};

export default Subscription;
