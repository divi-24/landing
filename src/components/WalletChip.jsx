import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IndianRupee, TrendingUp, Lock, Wallet, Plus, X, Zap, CreditCard, Smartphone } from 'lucide-react';
import WalletService from '../core/services/WalletService';
import '../styles/WalletChip.css';

/* ── animated count-up with ease-out-expo ──────────────── */
const useCountUp = (target, duration = 1100) => {
    const [value, setValue] = useState(0);
    const raf = useRef(null);
    const prev = useRef(0);

    useEffect(() => {
        if (target === 0) {
            prev.current = 0;
            requestAnimationFrame(() => setValue(0));
            return;
        }
        const start = prev.current;
        const diff = target - start;
        const startTime = performance.now();

        const step = (now) => {
            const elapsed = now - startTime;
            const t = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - t, 4); // ease-out quart
            setValue(Math.round(start + diff * eased));
            if (t < 1) raf.current = requestAnimationFrame(step);
            else prev.current = target;
        };

        raf.current = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf.current);
    }, [target, duration]);

    return value;
};

/* ── format paise → ₹ ─────────────────────────────────── */
const fmtRupees = (paise) =>
    (Number(paise || 0) / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 });


/* ──────────────────────────────────────────────────────────
   Add Money Modal
────────────────────────────────────────────────────────── */
const PRESETS = [500, 1000, 2000, 5000];
const PAYMENT_METHODS = [
    { id: 'upi', label: 'UPI', Icon: Smartphone },
    { id: 'card', label: 'Card', Icon: CreditCard },
    { id: 'nb', label: 'Net Banking', Icon: Zap },
];

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

export const AddMoneyModal = ({ onClose, onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [payMethod, setPayMethod] = useState('upi');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [verifiedBalance, setVerifiedBalance] = useState(null);
    const [error, setError] = useState('');
    const inputRef = useRef(null);
    const lastAmountRef = useRef(0);

    useEffect(() => {
        inputRef.current?.focus();
        const onKey = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    const parsedAmount = Number(amount) || 0;
    const isValid = parsedAmount >= 100;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValid || submitting) return;
        setError('');
        setSubmitting(true);
        lastAmountRef.current = parsedAmount;
        try {
            await loadRazorpayScript();
            const order = await WalletService.createDepositOrder(parsedAmount);
            const options = {
                key: order.key,
                amount: order.amount,
                currency: order.currency || 'INR',
                order_id: order.orderId,
                name: 'Dropp',
                description: 'Wallet Top-up',
                handler: async function (response) {
                    console.log('Razorpay handler called:', response);
                    try {
                        const verifyData = await WalletService.verifyDepositOrder({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });
                        console.log('Verification response:', verifyData);

                        setVerifiedBalance(verifyData?.balance ?? null);
                        setSuccess(true);
                        setSubmitting(false);
                        onSuccess?.(verifyData);
                    } catch (err) {
                        console.error('Verify deposit error:', err);
                        setError(err?.message || 'Payment verification failed. Please contact support.');
                        setSubmitting(false);
                    }
                },
                modal: {
                    ondismiss: () => setSubmitting(false),
                },
                prefill: {},
                theme: { color: '#F0057A' },
            };
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (resp) => {
                setError(resp.error?.description || 'Payment failed. Please try again.');
                setSubmitting(false);
            });
            rzp.open();
        } catch (err) {
            setError(err?.response?.data?.error || err.message || 'Something went wrong. Please try again.');
            setSubmitting(false);
        }
    };

    return (
        <div className="wc-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
            <div className="wc-modal" onClick={e => e.stopPropagation()}>

                {/* decorative top bar */}
                <div className="wc-modal-bar" />

                <div className="wc-modal-header">
                    <div className="wc-modal-header-left">
                        <div className="wc-modal-icon-wrap">
                            <Wallet size={14} strokeWidth={2} />
                        </div>
                        <span className="wc-modal-title">Add Money</span>
                    </div>
                    <button className="wc-modal-close" onClick={onClose} aria-label="Close">
                        <X size={15} />
                    </button>
                </div>

                {success ? (
                    <div className="wc-modal-success">
                        <div className="wc-modal-success-ring">
                            <div className="wc-modal-success-icon">
                                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                                    <path d="M4.5 11.5L9 16L17.5 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="wc-modal-success-title">Payment Successful</h3>
                        <p className="wc-modal-success-desc">
                            {verifiedBalance !== null
                                ? <>Your wallet balance is now ₹{Number(verifiedBalance).toLocaleString('en-IN')}.</>
                                : <>₹{lastAmountRef.current.toLocaleString('en-IN')} has been credited to your wallet.</>
                            }
                        </p>
                        <button className="wc-modal-done-btn" onClick={onClose}>Done</button>
                    </div>
                ) : (
                    <form className="wc-modal-body" onSubmit={handleSubmit}>

                        {/* live amount display */}
                        <div className="wc-modal-amount-display">
                            <span className="wc-modal-currency-sym">₹</span>
                            <span className={`wc-modal-amount-big${parsedAmount > 0 ? ' has-value' : ''}`}>
                                {parsedAmount > 0 ? parsedAmount.toLocaleString('en-IN') : '0'}
                            </span>
                        </div>

                        {/* preset chips */}
                        <div className="wc-modal-presets">
                            {PRESETS.map(p => (
                                <button
                                    key={p}
                                    type="button"
                                    className={`wc-modal-preset${parsedAmount === p ? ' active' : ''}`}
                                    onClick={() => setAmount(String(p))}
                                >
                                    ₹{p >= 1000 ? `${p / 1000}K` : p}
                                </button>
                            ))}
                        </div>

                        {/* custom input */}
                        <div className="wc-modal-field">
                            <span className="wc-modal-field-prefix">₹</span>
                            <input
                                ref={inputRef}
                                className="wc-modal-input"
                                type="number"
                                min="100"
                                placeholder="Custom amount"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                            />
                            {amount && (
                                <button
                                    type="button"
                                    className="wc-modal-field-clear"
                                    onClick={() => setAmount('')}
                                    tabIndex={-1}
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>

                        {/* payment method */}
                        <div className="wc-modal-methods">
                            <span className="wc-modal-methods-label">via</span>
                            {PAYMENT_METHODS.map((method) => (
                                <button
                                    key={method.id}
                                    type="button"
                                    className={`wc-modal-method${payMethod === method.id ? ' active' : ''}`}
                                    onClick={() => setPayMethod(method.id)}
                                >
                                    {React.createElement(method.Icon, { size: 12 })}
                                    {method.label}
                                </button>
                            ))}
                        </div>

                        {error && (
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-error, #ef4444)', margin: '-4px 0', textAlign: 'center' }}>
                                {error}
                            </p>
                        )}

                        {/* CTA */}
                        <button
                            type="submit"
                            className={`wc-modal-cta${isValid && !submitting ? ' ready' : ''}`}
                            disabled={!isValid || submitting}
                        >
                            <span className="wc-modal-cta-text">
                                {submitting
                                    ? 'Processing…'
                                    : isValid
                                        ? `Add ₹${parsedAmount.toLocaleString('en-IN')}`
                                        : 'Enter amount'}
                            </span>
                            <span className="wc-modal-cta-arrow">{submitting ? '…' : '→'}</span>
                        </button>

                        <p className="wc-modal-footer-note">Min ₹100 · Secured by Razorpay · No extra charges</p>
                    </form>
                )}
            </div>
        </div>
    );
};

/* ──────────────────────────────────────────────────────────
   WalletPill — topbar split-pill variant
────────────────────────────────────────────────────────── */
export const WalletPill = ({ isBrand = false }) => {
    const navigate = useNavigate();
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [addMoneyOpen, setAddMoneyOpen] = useState(false);

    useEffect(() => {
        WalletService.getWallet()
            .then(setWallet)
            .catch(() => setWallet(null))
            .finally(() => setLoading(false));
    }, []);

    const balancePaise = wallet?.balance ?? 0;
    const animated = useCountUp(loading ? 0 : balancePaise);
    const dest = isBrand ? '/brand/settings' : '/settings';

    const handleDepositSuccess = () => {
        WalletService.getWallet().then(setWallet).catch(() => {});
    };

    if (isBrand) {
        return (
            <>
                <div className={`wc-split-pill${loading ? ' loading' : ''}`}>
                    <button
                        className="wc-split-pill__balance"
                        onClick={() => navigate(dest)}
                        title="View wallet"
                    >
                        <span className="wc-split-pill__symbol">₹</span>
                        {loading
                            ? <span className="wc-split-pill__shimmer" />
                            : <span className="wc-split-pill__amount">{fmtRupees(animated)}</span>
                        }
                    </button>
                    <div className="wc-split-pill__divider" />
                    <button
                        className="wc-split-pill__add"
                        onClick={() => setAddMoneyOpen(true)}
                        title="Add money"
                        disabled={loading}
                    >
                        <Plus size={13} strokeWidth={2.5} />
                    </button>
                </div>
                {addMoneyOpen && (
                    <AddMoneyModal
                        onClose={() => setAddMoneyOpen(false)}
                        onSuccess={handleDepositSuccess}
                    />
                )}
            </>
        );
    }

    return (
        <button
            className={`wc-balance-pill${loading ? ' loading' : ''}`}
            onClick={() => navigate(dest)}
            title="View wallet"
        >
            <span className="wc-balance-pill__dot" />
            <span className="wc-balance-pill__symbol">₹</span>
            {loading
                ? <span className="wc-balance-pill__shimmer" />
                : <span className="wc-balance-pill__amount">{fmtRupees(animated)}</span>
            }
        </button>
    );
};

/* ──────────────────────────────────────────────────────────
   WalletChip — sidebar card / collapsed icon variant
────────────────────────────────────────────────────────── */
const WalletChip = ({ isBrand = false, collapsed = false }) => {
    const navigate = useNavigate();
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [addMoneyOpen, setAddMoneyOpen] = useState(false);

    useEffect(() => {
        WalletService.getWallet()
            .then(setWallet)
            .catch(() => setWallet(null))
            .finally(() => setLoading(false));
    }, []);

    const balancePaise  = wallet?.balance ?? 0;
    const lockedPaise   = wallet?.lockedBalance ?? 0;
    const earnedPaise   = wallet?.lifetimeEarned ?? 0;

    const animBalance = useCountUp(loading ? 0 : balancePaise);
    const dest = isBrand ? '/brand/settings' : '/settings';

    /* ── collapsed (icon only) ── */
    if (collapsed) {
        return (
            <button
                className={`wc-icon-btn${loading ? ' loading' : ''}`}
                onClick={() => navigate(dest)}
                title={loading ? 'Loading…' : `₹${fmtRupees(balancePaise)}`}
            >
                <Wallet size={17} strokeWidth={1.8} />
                {!loading && (
                    <span className={`wc-icon-dot${balancePaise > 0 ? ' active' : ''}`} />
                )}
            </button>
        );
    }

    /* ── expanded card ── */
    return (
        <>
            <div className={`wc-card${loading ? ' loading' : ''}`}>
                {/* ambient glow */}
                <div className="wc-card__glow" aria-hidden />

                {/* header row */}
                <div className="wc-card__header">
                    <div className="wc-card__icon">
                        <Wallet size={13} strokeWidth={2} />
                    </div>
                    <span className="wc-card__label">Wallet</span>
                    <button
                        className="wc-card__goto"
                        onClick={() => navigate(dest)}
                        title="Wallet details"
                        tabIndex={-1}
                    >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 8L8 2M8 2H4M8 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>

                {/* main balance */}
                <div className="wc-card__balance" onClick={() => navigate(dest)}>
                    {loading ? (
                        <span className="wc-card__shimmer" />
                    ) : (
                        <>
                            <span className="wc-card__balance-sym">₹</span>
                            <span className="wc-card__balance-num">{fmtRupees(animBalance)}</span>
                        </>
                    )}
                    <span className="wc-card__balance-label">available</span>
                </div>

                {/* secondary stats */}
                {!loading && (lockedPaise > 0 || earnedPaise > 0) && (
                    <div className="wc-card__stats">
                        {isBrand && lockedPaise > 0 && (
                            <div className="wc-card__stat">
                                <span className="wc-card__stat-dot locked" />
                                <span className="wc-card__stat-label">Locked</span>
                                <span className="wc-card__stat-val locked">₹{fmtRupees(lockedPaise)}</span>
                            </div>
                        )}
                        {!isBrand && earnedPaise > 0 && (
                            <div className="wc-card__stat">
                                <span className="wc-card__stat-dot earned" />
                                <span className="wc-card__stat-label">Lifetime</span>
                                <span className="wc-card__stat-val earned">₹{fmtRupees(earnedPaise)}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* action area */}
                <div className="wc-card__footer">
                    {isBrand ? (
                        <button
                            className="wc-card__add-btn"
                            onClick={() => setAddMoneyOpen(true)}
                        >
                            <Plus size={12} strokeWidth={2.5} />
                            Add Money
                        </button>
                    ) : (
                        <button
                            className="wc-card__view-btn"
                            onClick={() => navigate(dest)}
                        >
                            View details
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{marginLeft: 4}}>
                                <path d="M2 5H8M8 5L5.5 2.5M8 5L5.5 7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {addMoneyOpen && (
                <AddMoneyModal
                    onClose={() => setAddMoneyOpen(false)}
                    onSuccess={() => WalletService.getWallet().then(setWallet).catch(() => {})}
                />
            )}
        </>
    );
};

export default WalletChip;
