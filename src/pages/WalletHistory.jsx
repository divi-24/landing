import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowDownCircle,
    ArrowLeft,
    ArrowUpCircle,
    Clock,
    History,
    Lock,
    RefreshCw,
    Search,
    Unlock,
    Wallet,
    Zap,
} from 'lucide-react';
import WalletService from '../core/services/WalletService';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Wallet.css';

const TX_META = {
    deposit: { label: 'Deposit', Icon: ArrowDownCircle, className: 'wlp-tx-accent', sign: '+' },
    campaign_lock: { label: 'Campaign lock', Icon: Lock, className: 'wlp-tx-amber', sign: '-' },
    campaign_unlock: { label: 'Campaign unlock', Icon: Unlock, className: 'wlp-tx-success', sign: '+' },
    campaign_payout: { label: 'Campaign payout', Icon: Zap, className: 'wlp-tx-violet', sign: '-' },
    withdrawal: { label: 'Withdrawal', Icon: ArrowUpCircle, className: 'wlp-tx-secondary', sign: '-' },
    refund: { label: 'Refund', Icon: RefreshCw, className: 'wlp-tx-success', sign: '+' },
};

const normalizeType = (value) => String(value || 'transaction').trim().toLowerCase();

const labelFromType = (value) => normalizeType(value)
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || 'Transaction';

const getTransactionsFromResponse = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.results)) return response.results;
    if (Array.isArray(response?.transactions)) return response.transactions;
    if (Array.isArray(response?.data?.results)) return response.data.results;
    if (Array.isArray(response?.data?.transactions)) return response.data.transactions;
    if (Array.isArray(response?.data)) return response.data;
    return [];
};

const getAmountPaise = (tx) => {
    const value = tx.amountPaise ?? tx.amountInPaise ?? tx.amount ?? tx.value ?? 0;
    return Number(value) || 0;
};

const formatAmount = (tx) => {
    const type = normalizeType(tx.type || tx.transactionType || tx.kind);
    const meta = TX_META[type] || {};
    const explicitDirection = String(tx.direction || tx.entryType || '').toLowerCase();
    const sign = explicitDirection === 'debit'
        ? '-'
        : explicitDirection === 'credit'
        ? '+'
        : meta.sign || (Number(tx.amount || 0) < 0 ? '-' : '+');
    const amount = Math.abs(getAmountPaise(tx) / 100).toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
    return `${sign}₹${amount}`;
};

const formatDateTime = (value) => {
    if (!value) return 'Date unavailable';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const WalletHistory = () => {
    const { isBrand } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [query, setQuery] = useState('');
    const walletPath = isBrand ? '/brand/wallet' : '/wallet';

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await WalletService.getTransactions();
            setTransactions(getTransactionsFromResponse(response));
        } catch (err) {
            setTransactions([]);
            const isMissingWallet =
                err?.status === 400 &&
                String(err?.message || err?.data?.error || '').toLowerCase().includes('wallet not found');
            setError(isMissingWallet ? '' : (err?.message || 'Could not load wallet history.'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const filtered = useMemo(() => {
        const term = query.trim().toLowerCase();
        if (!term) return transactions;
        return transactions.filter((tx) => {
            const type = labelFromType(tx.type || tx.transactionType || tx.kind);
            const text = [
                type,
                tx.description,
                tx.reason,
                tx.status,
                tx.orderId,
                tx.razorpayOrderId,
                tx.campaignTitle,
                tx.campaignId,
            ].filter(Boolean).join(' ').toLowerCase();
            return text.includes(term);
        });
    }, [query, transactions]);

    return (
        <div className="wlp-page">
            <div className="wlp-inner wlp-inner--wide">
                <header className="wlp-page-header">
                    <div className="wlp-page-header-main">
                        <Link className="wlp-back-btn" to={walletPath} aria-label="Back to wallet">
                            <ArrowLeft size={16} />
                        </Link>
                        <div className="wlp-page-header-icon">
                            <History size={18} strokeWidth={1.8} />
                        </div>
                        <div>
                            <h1 className="wlp-page-title">Wallet history</h1>
                            <p className="wlp-page-subtitle">Every wallet movement, campaign lock, payout, and refund in one place.</p>
                        </div>
                    </div>
                    <button className="wlp-header-action" onClick={fetchTransactions} title="Refresh history" aria-label="Refresh history">
                        <RefreshCw size={17} strokeWidth={2} />
                    </button>
                </header>

                <section className="wlp-history-panel">
                    <div className="wlp-history-toolbar">
                        <div className="wlp-history-search">
                            <Search size={15} />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search history..."
                            />
                        </div>
                        <span className="wlp-history-count">{filtered.length} transaction{filtered.length === 1 ? '' : 's'}</span>
                    </div>

                    {loading ? (
                        <div className="wlp-history-state">
                            <span className="wlp-spinner" />
                            <strong>Loading wallet history</strong>
                        </div>
                    ) : error ? (
                        <div className="wlp-history-state">
                            <Wallet size={24} />
                            <strong>{error}</strong>
                            <button className="wlp-retry-btn" onClick={fetchTransactions}>
                                <RefreshCw size={13} />
                                Retry
                            </button>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="wlp-history-state">
                            <Clock size={24} />
                            <strong>{transactions.length === 0 ? 'No wallet history yet' : 'No matching transactions'}</strong>
                            <p>{transactions.length === 0 ? 'Deposits, locks, payouts, and refunds will appear here.' : 'Try a different search term.'}</p>
                        </div>
                    ) : (
                        <div className="wlp-history-list">
                            {filtered.map((tx, index) => {
                                const type = normalizeType(tx.type || tx.transactionType || tx.kind);
                                const meta = TX_META[type] || { label: labelFromType(type), Icon: Wallet, className: 'wlp-tx-secondary' };
                                const Icon = meta.Icon;
                                const status = String(tx.status || tx.paymentStatus || '').trim();
                                const date = tx.createdAt || tx.updatedAt || tx.date || tx.timestamp;
                                const key = tx._id || tx.id || tx.transactionId || `${type}-${date || index}-${index}`;
                                return (
                                    <article className="wlp-history-row" key={key}>
                                        <div className={`wlp-tx-icon ${meta.className}`}>
                                            <Icon size={16} strokeWidth={2} />
                                        </div>
                                        <div className="wlp-history-row__main">
                                            <div className="wlp-history-row__top">
                                                <strong>{meta.label}</strong>
                                                <span className="wlp-history-amount">{formatAmount(tx)}</span>
                                            </div>
                                            <div className="wlp-history-row__meta">
                                                <span>{tx.description || tx.reason || tx.campaignTitle || 'Wallet transaction'}</span>
                                                <span>{formatDateTime(date)}</span>
                                            </div>
                                        </div>
                                        {status && <span className="wlp-history-status">{status}</span>}
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default WalletHistory;
