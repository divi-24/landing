import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowDownCircle,
    ArrowUpCircle,
    BadgeCheck,
    History,
    IndianRupee,
    Lock,
    RefreshCw,
    Shield,
    TrendingUp,
    Unlock,
    Wallet,
    X,
    Zap,
} from 'lucide-react';
import WalletService from '../core/services/WalletService';
import { useAuth } from '../contexts/AuthContext';
import Snackbar from '../components/Snackbar';
import '../styles/Wallet.css';

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
const fmtRupees = (paise, decimals = 0) =>
    (Number(paise || 0) / 100).toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });

const loadRazorpayScript = () =>
    new Promise((resolve, reject) => {
        if (window.Razorpay) { resolve(); return; }
        const s = document.createElement('script');
        s.src = 'https://checkout.razorpay.com/v1/checkout.js';
        s.async = true;
        s.onload = resolve;
        s.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
        document.head.appendChild(s);
    });

/* ─────────────────────────────────────────
   Count-up hook (ease-out quart)
───────────────────────────────────────── */
const useCountUp = (target, duration = 1200, enabled = true) => {
    const [value, setValue] = useState(0);
    const raf = useRef(null);
    const prev = useRef(0);

    useEffect(() => {
        if (!enabled) return;
        if (target === 0) {
            prev.current = 0;
            setValue(0);
            return;
        }
        const start = prev.current;
        const diff = target - start;
        const startTime = performance.now();

        const step = (now) => {
            const elapsed = now - startTime;
            const t = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - t, 4);
            setValue(Math.round(start + diff * eased));
            if (t < 1) {
                raf.current = requestAnimationFrame(step);
            } else {
                prev.current = target;
            }
        };

        raf.current = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf.current);
    }, [target, duration, enabled]);

    return value;
};

/* ─────────────────────────────────────────
   Deposit presets
───────────────────────────────────────── */
const PRESETS = [500, 1000, 2000, 5000];

/* ─────────────────────────────────────────
   Transaction type legend data
───────────────────────────────────────── */
const TX_TYPES = [
    {
        type: 'deposit',
        Icon: ArrowDownCircle,
        label: 'Deposit',
        colorClass: 'wlp-tx-accent',
        desc: 'Money added to your wallet via Razorpay. Instantly available for campaigns.',
    },
    {
        type: 'campaign_lock',
        Icon: Lock,
        label: 'Campaign Lock',
        colorClass: 'wlp-tx-amber',
        desc: 'Funds reserved when you launch a campaign. Deducted from available balance.',
    },
    {
        type: 'campaign_unlock',
        Icon: Unlock,
        label: 'Campaign Unlock',
        colorClass: 'wlp-tx-success',
        desc: 'Locked funds returned when a campaign is cancelled or expires unused.',
    },
    {
        type: 'campaign_payout',
        Icon: Zap,
        label: 'Campaign Payout',
        colorClass: 'wlp-tx-violet',
        desc: 'Payment released to a creator upon successful campaign delivery.',
    },
    {
        type: 'withdrawal',
        Icon: ArrowUpCircle,
        label: 'Withdrawal',
        colorClass: 'wlp-tx-secondary',
        desc: 'Creator payout transferred to linked bank account.',
    },
    {
        type: 'refund',
        Icon: RefreshCw,
        label: 'Refund',
        colorClass: 'wlp-tx-success',
        desc: 'Reversed transaction — funds reinstated to your available balance.',
    },
];

/* ═══════════════════════════════════════════
   Main Wallet page component
═══════════════════════════════════════════ */
const WalletPage = () => {
    const { isBrand } = useAuth();
    const historyPath = isBrand ? '/brand/wallet/history' : '/wallet/history';

    /* wallet data */
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    /* deposit form (brand only) */
    const [depositAmt, setDepositAmt] = useState('');
    const [depositing, setDepositing] = useState(false);
    const [depositError, setDepositError] = useState('');
    const inputRef = useRef(null);

    /* snackbar */
    const [snack, setSnack] = useState({ visible: false, message: '', type: 'success' });

    const showSnack = useCallback((message, type = 'success') => {
        setSnack({ visible: true, message, type });
    }, []);

    const hideSnack = useCallback(() => {
        setSnack((s) => ({ ...s, visible: false }));
    }, []);

    /* fetch wallet */
    const fetchWallet = useCallback(() => {
        setLoading(true);
        setLoadError('');
        return WalletService.getWallet()
            .then(setWallet)
            .catch((err) => setLoadError(err?.message || 'Could not load wallet data.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchWallet(); }, [fetchWallet]);

    /* count-up targets (paise) */
    const balancePaise = wallet?.balance ?? 0;
    const lockedPaise = wallet?.lockedBalance ?? 0;
    const lifetimeEarnedPaise = wallet?.lifetimeEarned ?? 0;
    const lifetimeWithdrawnPaise = wallet?.lifetimeWithdrawn ?? 0;

    const animBalance = useCountUp(loading ? 0 : balancePaise, 1300, !loading);

    /* deposit flow */
    const parsedAmt = Number(depositAmt) || 0;
    const depositValid = parsedAmt >= 100;

    const handleDeposit = async (e) => {
        e.preventDefault();
        if (!depositValid || depositing) return;
        setDepositError('');
        setDepositing(true);

        try {
            await loadRazorpayScript();
            const order = await WalletService.createDepositOrder(parsedAmt);

            const options = {
                key: order.key,
                amount: order.amount,
                currency: order.currency || 'INR',
                order_id: order.orderId,
                name: 'Dropp',
                description: 'Wallet Top-up',
                handler: async function (response) {
                    try {
                        const verifyResponse =
                            await WalletService.verifyDepositOrder({
                                razorpay_order_id:
                                    response.razorpay_order_id,

                                razorpay_payment_id:
                                    response.razorpay_payment_id,

                                razorpay_signature:
                                    response.razorpay_signature,
                            });

                        setDepositAmt('');

                        showSnack(
                            `₹${parsedAmt.toLocaleString(
                                'en-IN'
                            )} added to your wallet.`,
                            'success'
                        );

                        await fetchWallet();

                        console.log(
                            'Deposit verified:',
                            verifyResponse
                        );
                    } catch (verifyErr) {
                        console.error(verifyErr);

                        setDepositError(
                            verifyErr?.response?.data?.error ||
                            verifyErr.message ||
                            'Payment verification failed.'
                        );

                        showSnack(
                            'Payment verification failed.',
                            'error'
                        );
                    } finally {
                        setDepositing(false);
                    }
                },
                modal: {
                    ondismiss: () => setDepositing(false),
                },
                prefill: {},
                theme: { color: '#F0057A' },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (resp) => {
                setDepositError(resp.error?.description || 'Payment failed. Please try again.');
                setDepositing(false);
            });
            rzp.open();
        } catch (err) {
            setDepositError(
                err?.response?.data?.error || err.message || 'Something went wrong. Please try again.'
            );
            setDepositing(false);
        }
    };

    /* ── render ── */
    return (
        <div className="wlp-page">
            <div className="wlp-inner">

                {/* ── Page header ── */}
                <header className="wlp-page-header">
                    <div className="wlp-page-header-main">
                        <div className="wlp-page-header-icon">
                            <Wallet size={18} strokeWidth={1.8} />
                        </div>
                        <div>
                            <h1 className="wlp-page-title">Wallet</h1>
                            <p className="wlp-page-subtitle">
                                {isBrand
                                    ? 'Manage your campaign budget and top up funds.'
                                    : 'Track your earnings and withdrawal history.'}
                            </p>
                        </div>
                    </div>
                    <Link className="wlp-header-action" to={historyPath} title="Wallet history" aria-label="Wallet history">
                        <History size={17} strokeWidth={2} />
                    </Link>
                </header>

                {/* ── Balance hero card ── */}
                <div className={`wlp-hero${loading ? ' wlp-hero--loading' : ''}`}>
                    <div className="wlp-hero__glow" aria-hidden />
                    <p className="wlp-hero__eyebrow">Available Balance</p>

                    {loading ? (
                        <div className="wlp-hero__shimmer-wrap">
                            <span className="wlp-hero__shimmer wlp-hero__shimmer--lg" />
                            <span className="wlp-hero__shimmer wlp-hero__shimmer--sm" />
                        </div>
                    ) : loadError ? (
                        <div className="wlp-hero__error">
                            <p className="wlp-hero__error-msg">{loadError}</p>
                            <button className="wlp-retry-btn" onClick={fetchWallet}>
                                <RefreshCw size={13} />
                                Retry
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="wlp-hero__balance">
                                <span className="wlp-hero__currency">₹</span>
                                <span className="wlp-hero__amount">{fmtRupees(animBalance)}</span>
                            </div>
                            <p className="wlp-hero__currency-note">
                                {wallet?.currency || 'INR'} · {isBrand ? 'Brand wallet' : 'Creator wallet'}
                            </p>
                        </>
                    )}
                </div>

                {/* ── Stats row ── */}
                {!loadError && (
                    <div className="wlp-stats-row">
                        {isBrand ? (
                            <>
                                <div className="wlp-stat wlp-stat--amber">
                                    <div className="wlp-stat__icon-wrap wlp-stat__icon-wrap--amber">
                                        <Lock size={14} strokeWidth={2} />
                                    </div>
                                    <div className="wlp-stat__body">
                                        <span className="wlp-stat__label">Locked in Campaigns</span>
                                        {loading ? (
                                            <span className="wlp-stat__shimmer" />
                                        ) : (
                                            <span className="wlp-stat__value wlp-stat__value--amber">
                                                ₹{fmtRupees(lockedPaise)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="wlp-stat wlp-stat--accent">
                                    <div className="wlp-stat__icon-wrap wlp-stat__icon-wrap--accent">
                                        <IndianRupee size={14} strokeWidth={2} />
                                    </div>
                                    <div className="wlp-stat__body">
                                        <span className="wlp-stat__label">Total Balance</span>
                                        {loading ? (
                                            <span className="wlp-stat__shimmer" />
                                        ) : (
                                            <span className="wlp-stat__value wlp-stat__value--accent">
                                                ₹{fmtRupees(balancePaise + lockedPaise)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="wlp-stat wlp-stat--violet">
                                    <div className="wlp-stat__icon-wrap wlp-stat__icon-wrap--violet">
                                        <TrendingUp size={14} strokeWidth={2} />
                                    </div>
                                    <div className="wlp-stat__body">
                                        <span className="wlp-stat__label">Lifetime Earned</span>
                                        {loading ? (
                                            <span className="wlp-stat__shimmer" />
                                        ) : (
                                            <span className="wlp-stat__value wlp-stat__value--violet">
                                                ₹{fmtRupees(lifetimeEarnedPaise)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="wlp-stat wlp-stat--neutral">
                                    <div className="wlp-stat__icon-wrap wlp-stat__icon-wrap--neutral">
                                        <ArrowUpCircle size={14} strokeWidth={2} />
                                    </div>
                                    <div className="wlp-stat__body">
                                        <span className="wlp-stat__label">Total Withdrawn</span>
                                        {loading ? (
                                            <span className="wlp-stat__shimmer" />
                                        ) : (
                                            <span className="wlp-stat__value wlp-stat__value--neutral">
                                                ₹{fmtRupees(lifetimeWithdrawnPaise)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* ── Add Money (Brand only) ── */}
                {isBrand ? (
                    <section className="wlp-section">
                        <div className="wlp-section-header">
                            <IndianRupee size={15} strokeWidth={2} />
                            <h2 className="wlp-section-title">Add Money</h2>
                        </div>

                        <form className="wlp-deposit-form" onSubmit={handleDeposit} noValidate>
                            {/* Presets */}
                            <div className="wlp-presets">
                                {PRESETS.map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        className={`wlp-preset-btn${parsedAmt === p ? ' wlp-preset-btn--active' : ''}`}
                                        onClick={() => setDepositAmt(String(p))}
                                    >
                                        ₹{p >= 1000 ? `${p / 1000}K` : p}
                                    </button>
                                ))}
                            </div>

                            {/* Custom input */}
                            <div className="wlp-deposit-field">
                                <span className="wlp-deposit-field__prefix">₹</span>
                                <input
                                    ref={inputRef}
                                    className="wlp-deposit-input"
                                    type="number"
                                    min="100"
                                    placeholder="Enter custom amount"
                                    value={depositAmt}
                                    onChange={(e) => {
                                        setDepositAmt(e.target.value);
                                        setDepositError('');
                                    }}
                                    disabled={depositing}
                                />
                                {depositAmt && !depositing && (
                                    <button
                                        type="button"
                                        className="wlp-deposit-field__clear"
                                        onClick={() => { setDepositAmt(''); setDepositError(''); }}
                                        tabIndex={-1}
                                        aria-label="Clear"
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>

                            {/* Validation hint */}
                            {depositAmt && !depositValid && (
                                <p className="wlp-deposit-hint">Minimum deposit is ₹100.</p>
                            )}

                            {/* Error */}
                            {depositError && (
                                <p className="wlp-deposit-error">{depositError}</p>
                            )}

                            {/* CTA */}
                            <button
                                type="submit"
                                className={`wlp-deposit-cta${depositValid && !depositing ? ' wlp-deposit-cta--ready' : ''}`}
                                disabled={!depositValid || depositing}
                            >
                                {depositing ? (
                                    <>
                                        <span className="wlp-spinner" />
                                        Processing…
                                    </>
                                ) : depositValid ? (
                                    <>
                                        <IndianRupee size={14} strokeWidth={2} />
                                        Add ₹{parsedAmt.toLocaleString('en-IN')}
                                    </>
                                ) : (
                                    'Enter amount to continue'
                                )}
                            </button>
                        </form>
                    </section>
                ) : (
                    <section className="wlp-section wlp-creator-payout">
                        <div className="wlp-section-header">
                            <ArrowUpCircle size={15} strokeWidth={2} />
                            <h2 className="wlp-section-title">Creator payouts</h2>
                        </div>

                        <div className="wlp-creator-payout-body">
                            <div className="wlp-creator-payout-card">
                                <span className="wlp-creator-payout-label">Ready to withdraw</span>
                                {loading ? (
                                    <span className="wlp-stat__shimmer" />
                                ) : (
                                    <strong>₹{fmtRupees(balancePaise)}</strong>
                                )}
                                <p>Campaign earnings released by brands are added to your available wallet balance.</p>
                            </div>

                            <div className="wlp-creator-actions">
                                <Link className="wlp-creator-action wlp-creator-action--primary" to={historyPath}>
                                    <History size={15} />
                                    View wallet history
                                </Link>
                                <button
                                    className="wlp-creator-action"
                                    type="button"
                                    disabled
                                    title="Withdrawals need backend payout support before this can be enabled."
                                >
                                    <ArrowUpCircle size={15} />
                                    Withdraw
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {!isBrand && (
                    <section className="wlp-section">
                        <div className="wlp-section-header">
                            <TrendingUp size={15} strokeWidth={2} />
                            <h2 className="wlp-section-title">Earnings flow</h2>
                        </div>
                        <div className="wlp-creator-flow">
                            <div className="wlp-creator-flow-step">
                                <span>01</span>
                                <strong>Complete deliverables</strong>
                                <p>Submit work inside your campaign thread.</p>
                            </div>
                            <div className="wlp-creator-flow-step">
                                <span>02</span>
                                <strong>Brand releases payout</strong>
                                <p>Approved campaign payouts move into your wallet.</p>
                            </div>
                            <div className="wlp-creator-flow-step">
                                <span>03</span>
                                <strong>Track everything</strong>
                                <p>Use wallet history to audit payouts and withdrawals.</p>
                            </div>
                        </div>
                    </section>
                )}

                {/* ── Wallet explained ── */}
                <section className="wlp-section">
                    <div className="wlp-section-header">
                        <BadgeCheck size={15} strokeWidth={2} />
                        <h2 className="wlp-section-title">Wallet explained</h2>
                    </div>

                    <div className="wlp-tx-legend">
                        {TX_TYPES.map(({ type, Icon, label, colorClass, desc }) => (
                            <div key={type} className="wlp-tx-row">
                                <div className={`wlp-tx-icon ${colorClass}`}>
                                    <Icon size={14} strokeWidth={2} />
                                </div>
                                <div className="wlp-tx-body">
                                    <span className="wlp-tx-label">{label}</span>
                                    <span className="wlp-tx-desc">{desc}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Footer note ── */}
                <footer className="wlp-footer">
                    <Shield size={12} strokeWidth={2} />
                    <span>All amounts in INR · Secured by Razorpay</span>
                </footer>

            </div>

            {/* Snackbar */}
            <Snackbar
                message={snack.message}
                type={snack.type}
                isVisible={snack.visible}
                onClose={hideSnack}
            />
        </div>
    );
};

export default WalletPage;
