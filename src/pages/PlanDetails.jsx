import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Crown, Zap, Calendar, CreditCard,
    History, CheckCircle2, ExternalLink, AlertCircle, AlertTriangle, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserService from '../core/services/UserService';
import '../styles/Settings.css';

const planConfig = {
    lite: {
        icon: Zap,
        color: '#F0057A',
        label: 'LITE',
        price: '₹299/month',
        features: ['30 products per collection', 'Verified badge', 'Basic Analytics', 'Last 10 profile visits', 'Priority support']
    },
    pro: {
        icon: Crown,
        color: '#FFD700',
        label: 'PRO',
        price: '₹499/month',
        features: ['Unlimited products', 'Verified badge', 'Advanced Analytics', 'Unlimited profile visits', 'Priority support', 'Early access to beta features']
    }
};

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const statusStyle = (status) => {
    if (status === 'paid') return { color: '#059669', backgroundColor: 'rgba(5, 150, 105, 0.1)' };
    if (status === 'failed') return { color: '#dc2626', backgroundColor: 'rgba(220, 38, 38, 0.1)' };
    return { color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)' };
};

const CancelModal = ({ onConfirm, onClose, loading }) => (
    <div className="modal-overlay" style={{ zIndex: 1000 }}>
        <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '2rem',
                maxWidth: '420px',
                width: '90%',
                margin: 'auto',
                textAlign: 'center'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <AlertTriangle size={40} style={{ color: '#dc2626' }} />
            </div>
            <h2 style={{ fontSize: '1.4rem', margin: '0 0 0.75rem' }}>Cancel Subscription?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 1.5rem' }}>
                Your plan will remain active until the end of the current billing period. After that, your account will revert to the <strong>Free</strong> plan.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                    onClick={onClose}
                    disabled={loading}
                    style={{
                        flex: 1, padding: '0.75rem', borderRadius: '10px',
                        border: '1px solid var(--border-color)', background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)', fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.9rem'
                    }}
                >
                    Keep Plan
                </button>
                <button
                    onClick={onConfirm}
                    disabled={loading}
                    style={{
                        flex: 1, padding: '0.75rem', borderRadius: '10px',
                        border: 'none', background: '#dc2626', color: '#fff',
                        fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '0.9rem', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: '0.5rem'
                    }}
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : 'Yes, Cancel'}
                </button>
            </div>
        </motion.div>
    </div>
);

const PlanDetails = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [cancelMessage, setCancelMessage] = useState(null);
    // Always fetch fresh plan from API — never trust stale JWT-decoded user.plan
    const [activePlanId, setActivePlanId] = useState(null);

    useEffect(() => {
        UserService.getSubscriptionTransactions()
            .then(txData => {
                setTransactions(txData);
                // Derive active plan from the most recent paid transaction
                // as a fallback if user.plan from auth context is stale
                const latestPaid = txData.find(tx => tx.status === 'paid');
                const planFromTx = latestPaid?.plan || null;
                setActivePlanId(user?.plan && user.plan !== 'free' ? user.plan : planFromTx || user?.plan || 'free');
            })
            .catch(() => {
                setError('Failed to load plan details.');
                setActivePlanId(user?.plan || 'free');
            })
            .finally(() => setLoading(false));
    }, []);

    const handleCancelSubscription = async () => {
        setCancelLoading(true);
        try {
            await UserService.cancelSubscription();
            updateUser({ ...user, plan: 'free' });
            setActivePlanId('free');
            setShowCancelModal(false);
            setCancelMessage('Subscription cancelled. Your plan will remain active until the billing period ends.');
        } catch (err) {
            setCancelMessage(err.message || 'Failed to cancel subscription. Please try again.');
        } finally {
            setCancelLoading(false);
        }
    };

    const currentPlan = activePlanId && planConfig[activePlanId.toLowerCase()] ? planConfig[activePlanId.toLowerCase()] : null;

    // Derive billing info from the most recent paid transaction
    const latestTx = transactions.find(tx => tx.status === 'paid') || transactions[0];

    if (loading) {
        return <div className="settings-page"><div className="settings-container" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading plan details...</div></div>;
    }

    if (!currentPlan) {
        return <div className="settings-page"><div className="settings-container" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No active paid plan found.</div></div>;
    }

    return (
        <>
        <AnimatePresence>
            {showCancelModal && (
                <CancelModal
                    onConfirm={handleCancelSubscription}
                    onClose={() => setShowCancelModal(false)}
                    loading={cancelLoading}
                />
            )}
        </AnimatePresence>
        <motion.div
            className="settings-page"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
        >
            <div className="settings-container">
                <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={() => navigate('/settings')}
                            className="profile-back-btn"
                            style={{ position: 'static', margin: 0 }}
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <h1 className="settings-title" style={{ margin: 0 }}>Plan Details</h1>
                    </div>
                    <button
                        onClick={() => navigate('/transactions')}
                        className="settings-btn"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                    >
                        <History size={15} /> View Transactions
                    </button>
                </header>

                {/* Current Plan Card */}
                <section className="settings-section" style={{
                    background: `linear-gradient(135deg, ${currentPlan.color}11 0%, transparent 100%)`,
                    border: `1px solid ${currentPlan.color}33`
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                        <div>
                            <span style={{
                                color: currentPlan.color,
                                fontWeight: 800,
                                fontSize: '0.75rem',
                                letterSpacing: '0.1em',
                                backgroundColor: `${currentPlan.color}22`,
                                padding: '4px 12px',
                                borderRadius: '12px',
                                display: 'inline-block',
                                marginBottom: '0.5rem'
                            }}>
                                CURRENT ACTIVE PLAN
                            </span>
                            <h2 style={{ fontSize: '2.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                {currentPlan.label}
                                {React.createElement(currentPlan.icon, { size: 32, color: currentPlan.color })}
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0', fontSize: '0.9rem' }}>{currentPlan.price}</p>
                        </div>
                        <button
                            className="settings-btn"
                            onClick={() => navigate('/subscription')}
                            style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)' }}
                        >
                            Change Plan
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <div style={{ color: currentPlan.color }}><Calendar size={20} /></div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Billing Cycle</p>
                                <p style={{ fontWeight: 600, margin: 0 }}>Monthly</p>
                            </div>
                        </div>
                        {latestTx && (
                            <>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <div style={{ color: currentPlan.color }}><Calendar size={20} /></div>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Current Period</p>
                                        <p style={{ fontWeight: 600, margin: 0, fontSize: '0.875rem' }}>
                                            {formatDate(latestTx.billingPeriodStart)} – {formatDate(latestTx.billingPeriodEnd)}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <div style={{ color: currentPlan.color }}><CreditCard size={20} /></div>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Payment Method</p>
                                        <p style={{ fontWeight: 600, margin: 0, textTransform: 'capitalize' }}>
                                            {latestTx.paymentMethod ? latestTx.paymentMethod : 'Razorpay'}
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </section>

                {/* Features Included */}
                <section className="settings-section">
                    <h2 className="section-title">Included Features</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                        {currentPlan.features.map((feature) => (
                            <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
                                <CheckCircle2 size={18} color={currentPlan.color} />
                                <span style={{ fontSize: '0.9rem' }}>{feature}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Transaction History */}
                <section className="settings-section">
                    <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <History size={20} />
                        Transaction History
                    </h2>

                    {loading && (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>Loading transactions...</p>
                    )}

                    {error && !loading && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', padding: '1rem 0' }}>
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    {!loading && !error && transactions.length === 0 && (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>No transactions found.</p>
                    )}

                    {!loading && !error && transactions.length > 0 && (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                                        <th style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Date</th>
                                        <th style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Payment ID</th>
                                        <th style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Plan</th>
                                        <th style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Billing Period</th>
                                        <th style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Amount</th>
                                        <th style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Status</th>
                                        <th style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Invoice</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((tx) => (
                                        <tr key={tx._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '1rem 0.5rem', whiteSpace: 'nowrap' }}>{formatDate(tx.createdAt)}</td>
                                            <td style={{ padding: '1rem 0.5rem', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                {tx.razorpayPaymentId}
                                            </td>
                                            <td style={{ padding: '1rem 0.5rem' }}>
                                                <span style={{
                                                    color: planConfig[tx.plan]?.color || 'var(--text-primary)',
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    fontSize: '0.8rem'
                                                }}>
                                                    {tx.plan}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                                                {formatDate(tx.billingPeriodStart)} – {formatDate(tx.billingPeriodEnd)}
                                            </td>
                                            <td style={{ padding: '1rem 0.5rem', fontWeight: 700 }}>
                                                ₹{tx.amount}
                                            </td>
                                            <td style={{ padding: '1rem 0.5rem' }}>
                                                <span style={{
                                                    ...statusStyle(tx.status),
                                                    padding: '3px 10px',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem 0.5rem' }}>
                                                {tx.invoiceUrl ? (
                                                    <a
                                                        href={tx.invoiceUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontSize: '0.8rem' }}
                                                    >
                                                        View <ExternalLink size={12} />
                                                    </a>
                                                ) : (
                                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {cancelMessage && (
                    <div style={{
                        padding: '0.875rem 1rem',
                        borderRadius: '10px',
                        background: 'rgba(5,150,105,0.08)',
                        border: '1px solid rgba(5,150,105,0.2)',
                        color: '#059669',
                        fontSize: '0.875rem',
                        textAlign: 'center',
                        marginBottom: '1rem'
                    }}>
                        {cancelMessage}
                    </div>
                )}

                {/* Cancel Subscription */}
                <div style={{ textAlign: 'center', padding: '0.5rem 1rem 1rem' }}>
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

                <div style={{ textAlign: 'center', padding: '0.5rem 1rem 1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    <p>For billing support, please contact
                        <a href="mailto:ondropp.app@gmail.com" style={{ color: 'var(--color-accent)', marginLeft: '4px', textDecoration: 'none' }}>
                            ondropp.app@gmail.com
                        </a>
                    </p>
                </div>
            </div>
        </motion.div>
        </>
    );
};

export default PlanDetails;
