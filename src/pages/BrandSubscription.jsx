import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Check, Crown, Loader2, PartyPopper,
    ShieldCheck, Zap, X, AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Snackbar from '../components/Snackbar';
import { useAuth } from '../contexts/AuthContext';
import UserService from '../core/services/UserService';
import BrandService from '../core/services/BrandService';
import '../styles/BrandSubscription.css';

const BRAND_FEATURES = [
    { text: 'Unlimited campaigns', included: true },
    { text: 'Creator discovery & smart matching', included: true },
    { text: 'Campaign analytics & ROI tracking', included: true },
    { text: 'Direct messaging with creators', included: true },
    { text: 'Brand page editor', included: true },
    { text: 'Priority placement on creator feed', included: true },
    { text: 'Transaction history', included: true },
    { text: 'Priority brand support', included: true },
];

const FREE_FEATURES = [
    { text: 'Explore creator products', included: true },
    { text: 'Basic brand profile', included: true },
    { text: 'Campaign management', included: false },
    { text: 'Creator discovery', included: false },
    { text: 'Analytics & ROI tracking', included: false },
    { text: 'Direct messaging', included: false },
    { text: 'Brand page editor', included: false },
];

const FeatureRow = ({ text, included }) => (
    <li className={`bsub-feat${included ? '' : ' bsub-feat--off'}`}>
        <span className={`bsub-feat-icon${included ? ' bsub-feat-icon--on' : ''}`}>
            {included ? <Check size={13} strokeWidth={3} /> : <X size={13} strokeWidth={3} />}
        </span>
        {text}
    </li>
);

const SuccessModal = ({ onClose }) => (
    <div className="modal-overlay" style={{ zIndex: 1000 }}>
        <motion.div
            className="bsub-success-modal"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
        >
            <div className="bsub-success-icon-wrap">
                <PartyPopper size={44} />
            </div>
            <h2>You're now on Pro!</h2>
            <p>All brand features are now unlocked. Start creating campaigns and discovering creators.</p>
            <div className="bsub-success-badge">
                <ShieldCheck size={16} />
                <span>Brand Pro badge activated</span>
            </div>
            <button className="bsub-success-btn" onClick={onClose}>
                Go to Dashboard
            </button>
        </motion.div>
    </div>
);

const CancelModal = ({ onConfirm, onClose, loading }) => (
    <div className="modal-overlay" style={{ zIndex: 1000 }}>
        <motion.div
            className="bsub-success-modal"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
        >
            <div className="bsub-success-icon-wrap" style={{ background: 'rgba(220,38,38,0.1)' }}>
                <AlertTriangle size={40} style={{ color: '#dc2626' }} />
            </div>
            <h2>Cancel Subscription?</h2>
            <p>Your Pro plan remains active until the billing period ends. After that, you'll revert to Free.</p>
            <div className="bsub-cancel-actions">
                <button className="bsub-cancel-keep" onClick={onClose} disabled={loading}>Keep Plan</button>
                <button className="bsub-cancel-confirm" onClick={onConfirm} disabled={loading}>
                    {loading ? <Loader2 size={16} className="bsub-spin" /> : 'Yes, Cancel'}
                </button>
            </div>
        </motion.div>
    </div>
);

const BrandSubscription = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showCancel, setShowCancel] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'info' });
    const [subPlan, setSubPlan] = useState(user?.subscription?.plan || 'free');
    const [subStatus, setSubStatus] = useState(user?.subscription?.status || null);

    const isPro = subPlan !== 'free' && subStatus === 'active';

    useEffect(() => {
        if (user?.subscription?.plan) setSubPlan(user.subscription.plan);
        if (user?.subscription?.status) setSubStatus(user.subscription.status);
    }, [user?.subscription?.plan, user?.subscription?.status]);

    const handleUpgrade = async () => {
        if (isPro) {
            setSnackbar({ visible: true, message: 'You are already on the Pro plan.', type: 'info' });
            return;
        }

        setLoading(true);
        try {
            // Load Razorpay script on-demand (only when user initiates payment)
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

            const subData = await UserService.createSubscription('BrandPremium');

            const options = {
                key: subData.key,
                subscription_id: subData.subscriptionId,
                name: 'Dropp for Brands',
                description: 'Brand Pro — Monthly',
                prefill: {
                    name: user?.brandName || user?.email || '',
                    email: user?.email || '',
                },
                theme: { color: '#1E0A3C' },
                handler: async (response) => {
                    try {
                        const result = await UserService.verifySubscription({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_subscription_id: response.razorpay_subscription_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        if (result.success) {
                            try {
                                const freshProfile = await BrandService.getProfile();
                                updateUser(freshProfile);
                                setSubPlan(freshProfile?.subscription?.plan || 'BrandPremium');
                                setSubStatus(freshProfile?.subscription?.status || 'active');
                            } catch {
                                updateUser({ ...user, subscription: { plan: 'BrandPremium', status: 'active' } });
                                setSubPlan('BrandPremium');
                                setSubStatus('active');
                            }
                            setShowSuccess(true);
                        } else {
                            throw new Error('Verification failed');
                        }
                    } catch {
                        setSnackbar({ visible: true, message: 'Payment verification failed. Please contact support.', type: 'error' });
                    }
                },
                modal: { ondismiss: () => {} },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (resp) => {
                setSnackbar({ visible: true, message: 'Payment failed: ' + resp.error.description, type: 'error' });
            });
            rzp.open();
        } catch (error) {
            setSnackbar({ visible: true, message: error.message || 'Failed to start checkout. Please try again.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        setCancelLoading(true);
        try {
            await UserService.cancelSubscription();
            const freshProfile = await BrandService.getProfile().catch(() => null);
            updateUser(freshProfile || { ...user, subscription: { plan: 'free', status: 'cancelled' } });
            setSubPlan(freshProfile?.subscription?.plan || 'free');
            setSubStatus(freshProfile?.subscription?.status || null);
            setShowCancel(false);
            setSnackbar({ visible: true, message: 'Subscription cancelled. Plan remains active until billing period ends.', type: 'info' });
        } catch (err) {
            setSnackbar({ visible: true, message: err.message || 'Failed to cancel. Please try again.', type: 'error' });
        } finally {
            setCancelLoading(false);
        }
    };

    return (
        <motion.div
            className="bsub-page"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <AnimatePresence>
                {showSuccess && (
                    <SuccessModal onClose={() => { setShowSuccess(false); navigate('/brand/app'); }} />
                )}
                {showCancel && (
                    <CancelModal
                        onConfirm={handleCancel}
                        onClose={() => setShowCancel(false)}
                        loading={cancelLoading}
                    />
                )}
            </AnimatePresence>

            {/* Back nav */}
            <button className="bsub-back" onClick={() => navigate(-1)}>
                <ArrowLeft size={16} strokeWidth={2} />
                Back
            </button>

            {/* Hero */}
            <div className="bsub-hero">
                <div className="bsub-hero-glow" aria-hidden />
                <span className="bsub-hero-pill">
                    <Crown size={13} />
                    Dropp for Brands
                </span>
                <h1 className="bsub-hero-title">Unlock the Full Platform</h1>
                <p className="bsub-hero-sub">
                    One plan. Everything you need to run creator campaigns, track ROI, and grow.
                </p>
            </div>

            {/* Plans grid */}
            <div className="bsub-plans">
                {/* Free card */}
                <motion.div
                    className="bsub-card bsub-card--free"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.1 }}
                >
                    <div className="bsub-card-header">
                        <div className="bsub-card-icon bsub-card-icon--free">
                            <Zap size={18} strokeWidth={2} />
                        </div>
                        <span className="bsub-card-label">FREE</span>
                    </div>
                    <div className="bsub-card-price">
                        <span className="bsub-price-curr">₹</span>
                        <span className="bsub-price-val">0</span>
                        <span className="bsub-price-period">/month</span>
                    </div>
                    <p className="bsub-card-desc">Explore the platform with limited access. Upgrade anytime.</p>
                    <div className="bsub-divider" />
                    <ul className="bsub-feats">
                        {FREE_FEATURES.map(f => <FeatureRow key={f.text} {...f} />)}
                    </ul>
                    {!isPro && (
                        <div className="bsub-current-badge">Current Plan</div>
                    )}
                </motion.div>

                {/* Pro card */}
                <motion.div
                    className={`bsub-card bsub-card--pro${isPro ? ' bsub-card--active' : ''}`}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.18 }}
                >
                    <span className="bsub-recommended">Recommended</span>
                    {isPro && <span className="bsub-current-tag">Current Plan</span>}

                    <div className="bsub-card-header">
                        <div className="bsub-card-icon bsub-card-icon--pro">
                            <Crown size={18} strokeWidth={2} />
                        </div>
                        <span className="bsub-card-label bsub-card-label--pro">PRO</span>
                    </div>
                    <div className="bsub-card-price">
                        <span className="bsub-price-curr bsub-price-curr--pro">₹</span>
                        <span className="bsub-price-val bsub-price-val--pro">3,499</span>
                        <span className="bsub-price-period bsub-price-period--pro">/month</span>
                    </div>
                    <p className="bsub-card-desc bsub-card-desc--pro">
                        Full platform access. Run unlimited campaigns, discover creators, track every rupee.
                    </p>
                    <div className="bsub-divider bsub-divider--pro" />
                    <ul className="bsub-feats">
                        {BRAND_FEATURES.map(f => <FeatureRow key={f.text} {...f} />)}
                    </ul>

                    <button
                        className="bsub-cta"
                        onClick={handleUpgrade}
                        disabled={loading || isPro}
                    >
                        {loading
                            ? <Loader2 size={18} className="bsub-spin" />
                            : isPro ? 'Current Plan' : 'Upgrade to Pro'
                        }
                    </button>

                    {isPro && (
                        <button className="bsub-cancel-link" onClick={() => setShowCancel(true)}>
                            Cancel subscription
                        </button>
                    )}
                </motion.div>
            </div>

            <Snackbar
                message={snackbar.message}
                type={snackbar.type}
                isVisible={snackbar.visible}
                onClose={() => setSnackbar(s => ({ ...s, visible: false }))}
            />
        </motion.div>
    );
};

export default BrandSubscription;
