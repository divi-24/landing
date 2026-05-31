import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Receipt, ExternalLink, AlertCircle,
    TrendingUp, CreditCard, Calendar, IndianRupee
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserService from '../core/services/UserService';
import '../styles/Settings.css';

const planColors = {
    lite: '#F0057A',
    pro: '#FFD700',
    free: '#6b7280',
};

const statusColors = {
    paid: { color: '#059669', bg: 'rgba(5,150,105,0.1)', label: 'Paid' },
    failed: { color: '#dc2626', bg: 'rgba(220,38,38,0.1)', label: 'Failed' },
    pending: { color: '#d97706', bg: 'rgba(217,119,6,0.1)', label: 'Pending' },
};

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
};

const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

const StatCard = ({ icon: Icon, label, value, color }) => (
    <div style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '1.25rem 1.5rem',
        background: 'var(--bg-secondary)',
        borderRadius: '14px',
        border: '1px solid var(--border-color)',
        flex: 1, minWidth: '160px'
    }}>
        <div style={{
            width: 42, height: 42, borderRadius: '10px',
            background: `${color}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color
        }}>
            <Icon size={20} />
        </div>
        <div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</p>
            <p style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem' }}>{value}</p>
        </div>
    </div>
);

const Transactions = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await UserService.getSubscriptionTransactions();
                setTransactions(data);
            } catch (err) {
                setError('Failed to load transactions. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const filtered = filter === 'all'
        ? transactions
        : transactions.filter(tx => tx.plan === filter);

    const totalSpent = transactions
        .filter(tx => tx.status === 'paid')
        .reduce((sum, tx) => sum + (tx.amount || 0), 0);

    const paidCount = transactions.filter(tx => tx.status === 'paid').length;

    const latestBillingEnd = transactions
        .filter(tx => tx.status === 'paid' && tx.billingPeriodEnd)
        .sort((a, b) => new Date(b.billingPeriodEnd) - new Date(a.billingPeriodEnd))[0]?.billingPeriodEnd;

    return (
        <motion.div
            className="settings-page"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
        >
            <div className="settings-container">

                {/* Header */}
                <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <button
                        onClick={() => navigate(-1)}
                        className="profile-back-btn"
                        style={{ position: 'static', margin: 0 }}
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="settings-title" style={{ margin: 0 }}>Transaction History</h1>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            All your subscription payments in one place
                        </p>
                    </div>
                </header>

                {/* Stats */}
                {!loading && !error && transactions.length > 0 && (
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                        <StatCard icon={IndianRupee} label="Total Spent" value={`₹${totalSpent}`} color="#F0057A" />
                        <StatCard icon={Receipt} label="Transactions" value={paidCount} color="#7c3aed" />
                        <StatCard icon={Calendar} label="Next Billing" value={latestBillingEnd ? formatDate(latestBillingEnd) : '—'} color="#059669" />
                        <StatCard icon={CreditCard} label="Payment via" value="Razorpay" color="#2563eb" />
                    </div>
                )}

                {/* Filter tabs */}
                {!loading && !error && transactions.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        {['all', 'lite', 'pro'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setFilter(tab)}
                                style={{
                                    padding: '0.4rem 1rem',
                                    borderRadius: '999px',
                                    border: `1px solid ${filter === tab ? planColors[tab] || 'var(--color-accent)' : 'var(--border-color)'}`,
                                    background: filter === tab ? `${planColors[tab] || 'var(--color-accent)'}18` : 'transparent',
                                    color: filter === tab ? (planColors[tab] || 'var(--color-accent)') : 'var(--text-secondary)',
                                    fontWeight: filter === tab ? 700 : 500,
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                )}

                {/* Content */}
                <section className="settings-section" style={{ padding: 0, overflow: 'hidden' }}>
                    {loading && (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            Loading transactions...
                        </div>
                    )}

                    {error && !loading && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', padding: '2rem' }}>
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    {!loading && !error && filtered.length === 0 && (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            {transactions.length === 0 ? 'No transactions yet.' : `No ${filter.toUpperCase()} transactions found.`}
                        </div>
                    )}

                    {!loading && !error && filtered.length > 0 && (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                                        {['Date & Time', 'Payment ID', 'Subscription ID', 'Invoice ID', 'Plan', 'Billing Period', 'Amount', 'Method', 'Status', 'Invoice'].map(h => (
                                            <th key={h} style={{
                                                padding: '0.875rem 1rem',
                                                color: 'var(--text-secondary)',
                                                fontWeight: 600,
                                                fontSize: '0.75rem',
                                                textAlign: 'left',
                                                whiteSpace: 'nowrap',
                                                letterSpacing: '0.03em'
                                            }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((tx, idx) => {
                                        const status = statusColors[tx.status] || statusColors.pending;
                                        const planColor = planColors[tx.plan] || 'var(--text-primary)';
                                        return (
                                            <motion.tr
                                                key={tx._id}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.04 }}
                                                style={{ borderBottom: '1px solid var(--border-color)' }}
                                            >
                                                {/* Date */}
                                                <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                                                    {formatDateTime(tx.createdAt)}
                                                </td>

                                                {/* Payment ID */}
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{
                                                        fontFamily: 'monospace', fontSize: '0.75rem',
                                                        color: 'var(--text-secondary)',
                                                        background: 'var(--bg-secondary)',
                                                        padding: '2px 6px', borderRadius: '4px',
                                                        whiteSpace: 'nowrap', display: 'block'
                                                    }}>
                                                        {tx.razorpayPaymentId || '—'}
                                                    </span>
                                                </td>

                                                {/* Subscription ID */}
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{
                                                        fontFamily: 'monospace', fontSize: '0.75rem',
                                                        color: 'var(--text-secondary)',
                                                        background: 'var(--bg-secondary)',
                                                        padding: '2px 6px', borderRadius: '4px',
                                                        whiteSpace: 'nowrap', display: 'block'
                                                    }}>
                                                        {tx.razorpaySubscriptionId || '—'}
                                                    </span>
                                                </td>

                                                {/* Invoice ID */}
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{
                                                        fontFamily: 'monospace', fontSize: '0.75rem',
                                                        color: 'var(--text-secondary)',
                                                        background: 'var(--bg-secondary)',
                                                        padding: '2px 6px', borderRadius: '4px',
                                                        whiteSpace: 'nowrap', display: 'block'
                                                    }}>
                                                        {tx.razorpayInvoiceId || '—'}
                                                    </span>
                                                </td>

                                                {/* Plan */}
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{
                                                        color: planColor,
                                                        background: `${planColor}18`,
                                                        padding: '3px 10px',
                                                        borderRadius: '999px',
                                                        fontWeight: 700,
                                                        fontSize: '0.72rem',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.06em',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        {tx.plan}
                                                    </span>
                                                </td>

                                                {/* Billing Period */}
                                                <td style={{ padding: '1rem', fontSize: '0.78rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                                                    {formatDate(tx.billingPeriodStart)}
                                                    <span style={{ margin: '0 4px', opacity: 0.5 }}>→</span>
                                                    {formatDate(tx.billingPeriodEnd)}
                                                </td>

                                                {/* Amount */}
                                                <td style={{ padding: '1rem', fontWeight: 800, whiteSpace: 'nowrap', fontSize: '0.95rem' }}>
                                                    ₹{tx.amount}
                                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginLeft: '2px', fontWeight: 400 }}>
                                                        {tx.currency}
                                                    </span>
                                                </td>

                                                {/* Payment Method */}
                                                <td style={{ padding: '1rem', textTransform: 'capitalize', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                                                    {tx.paymentMethod || 'Razorpay'}
                                                </td>

                                                {/* Status */}
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{
                                                        color: status.color,
                                                        background: status.bg,
                                                        padding: '3px 10px',
                                                        borderRadius: '4px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        {status.label}
                                                    </span>
                                                    {tx.failureReason && (
                                                        <p style={{ margin: '4px 0 0', fontSize: '0.7rem', color: '#dc2626' }}>
                                                            {tx.failureReason}
                                                        </p>
                                                    )}
                                                </td>

                                                {/* Invoice Link */}
                                                <td style={{ padding: '1rem' }}>
                                                    {tx.invoiceUrl ? (
                                                        <a
                                                            href={tx.invoiceUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{
                                                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                                color: 'var(--color-accent)',
                                                                textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600
                                                            }}
                                                        >
                                                            View <ExternalLink size={12} />
                                                        </a>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>—</span>
                                                    )}
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <div style={{ textAlign: 'center', padding: '1.5rem 1rem 0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    For billing support, contact{' '}
                    <a href="mailto:ondropp.app@gmail.com" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>
                        ondropp.app@gmail.com
                    </a>
                </div>

            </div>
        </motion.div>
    );
};

export default Transactions;
