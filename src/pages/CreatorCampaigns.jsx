import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Bell,
    BriefcaseBusiness,
    CalendarDays,
    Check,
    CheckCircle2,
    ChevronRight,
    Clock,
    FileText,
    IndianRupee,
    Instagram,
    Linkedin,
    Loader2,
    Lock,
    MessageCircle,
    Send,
    Target,
    Users,
    X,
    Youtube,
    Zap,
} from 'lucide-react';
import UserService from '../core/services/UserService';
import BrandCampaignService, { formatCampaignDateTime } from '../core/services/BrandCampaignService';
import WalletService from '../core/services/WalletService';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Threads.css';

/* ─── Helpers ─── */
const fmtDate = (d) => (d ? formatCampaignDateTime(d) : '—');

const fmtMoney = (v) => (v != null ? `₹${Number(v).toLocaleString('en-IN')}` : '—');

const fmtTime = (d) => {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const getEntityId = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value._id || value.id || '';
};

const PlatformIcon = ({ platform }) => {
    const p = String(platform).toLowerCase();
    if (p.includes('instagram')) return <Instagram size={12} />;
    if (p.includes('youtube')) return <Youtube size={12} />;
    if (p.includes('linkedin')) return <Linkedin size={12} />;
    return <Zap size={12} />;
};

/* ─── Thread unlock logic ─── */
const checkThreadUnlocked = (campaign, creatorId) => {
    const shortlistedEntry = campaign.raw?.shortlisted?.find(
        (s) => (s.creatorId?._id || s.creatorId) === creatorId
    );
    if (!shortlistedEntry) return { unlocked: false, conditions: [], shortlistedEntry: null };

    const legal = campaign.raw?.legalAgreements?.find(
        (l) => (l.creatorId?._id || l.creatorId) === creatorId
    );

    const c1 = legal?.campaignAcknowledgement?.brand === true;
    const c2 = legal?.campaignAcknowledgement?.creator === true;
    const c3 = legal?.legalAcknowledgement?.brand === true;
    const c4 = legal?.legalAcknowledgement?.creator === true;

    return {
        unlocked: c1 && c2 && c3 && c4,
        conditions: [
            { label: 'Campaign terms — Brand', met: c1 },
            { label: 'Campaign terms — You', met: c2 },
            { label: 'Legal agreement — Brand', met: c3 },
            { label: 'Legal agreement — You', met: c4 },
        ],
        canAcknowledgeCampaign: !c2,
        canAcknowledgeLegal: !c4,
        shortlistedEntry,
    };
};

const buildAgreementInfo = (legal) => {
    const c1 = legal?.campaignAcknowledgement?.brand === true;
    const c2 = legal?.campaignAcknowledgement?.creator === true;
    const c3 = legal?.legalAcknowledgement?.brand === true;
    const c4 = legal?.legalAcknowledgement?.creator === true;

    return {
        unlocked: c1 && c2 && c3 && c4,
        conditions: [
            { label: 'Campaign terms — Brand', met: c1 },
            { label: 'Campaign terms — You', met: c2 },
            { label: 'Legal agreement — Brand', met: c3 },
            { label: 'Legal agreement — You', met: c4 },
        ],
        canAcknowledgeCampaign: !c2,
        canAcknowledgeLegal: !c4,
        legal,
    };
};

const getCreatorCampaignDetails = (campaignDetail = {}) => {
    const raw = campaignDetail.raw || campaignDetail || {};
    const hasLegalPayload = Object.prototype.hasOwnProperty.call(raw, 'myLegalAgreements') ||
        Object.prototype.hasOwnProperty.call(raw, 'myLegalAgreement');
    const shortlistedDetails =
        raw.myShortlistedDetails ||
        raw.shortlistedDetails ||
        raw.shortlistedEntry ||
        raw.myThread ||
        null;
    const legalAgreement =
        raw.myLegalAgreements ||
        raw.myLegalAgreement ||
        raw.legalAgreement ||
        null;
    const threads = Array.isArray(shortlistedDetails?.threads) ? shortlistedDetails.threads : [];

    return {
        campaignDetail: raw,
        shortlistedDetails,
        legalAgreement,
        threads,
        budgetLocked: raw.budgetLocked === true,
        budgetLockedAt: raw.budgetLockedAt || null,
        applicationStatus: shortlistedDetails ? 'accepted' : (hasLegalPayload ? 'underReview' : null),
    };
};

const inferReviewState = async (campaignId, currentStatus) => {
    if (currentStatus !== 'applied' || !campaignId) {
        return { applicationStatus: currentStatus, legalAgreement: null };
    }
    try {
        const legalAgreement = await BrandCampaignService.getLegalAgreements(campaignId);
        return { applicationStatus: 'underReview', legalAgreement };
    } catch (err) {
        if (err?.status === 403) {
            return { applicationStatus: currentStatus, legalAgreement: null };
        }
        return { applicationStatus: currentStatus, legalAgreement: null };
    }
};

/* ─── Status badge ─── */
const StatusBadge = ({ status }) => {
    const map = {
        applied: { cls: 'cc-status-badge--applied', label: 'Applied' },
        underReview: { cls: 'cc-status-badge--review', label: 'Under Review' },
        accepted: { cls: 'cc-status-badge--accepted', label: 'Shortlisted' },
        rejected: { cls: 'cc-status-badge--rejected', label: 'Rejected' },
    };
    const { cls, label } = map[status] || map.applied;
    return <span className={`cc-status-badge ${cls}`}>{label}</span>;
};

/* ─── Timeline status pill ─── */
const TimelinePill = ({ status }) => {
    const map = {
        PENDING: 'thr-status-pill--pending',
        SUBMITTED: 'thr-status-pill--submitted',
        ACCEPTED: 'thr-status-pill--accepted',
        REJECTED: 'thr-status-pill--rejected',
    };
    return (
        <span className={`thr-status-pill ${map[status] || map.PENDING}`}>
            {status || 'PENDING'}
        </span>
    );
};

/* ─── Individual message bubble ─── */
const ThreadMessage = ({ msg, currentUser, brandName }) => {
    const isBrand = msg.senderRole === 'BRAND';
    const initials = isBrand
        ? (brandName || 'B').slice(0, 1).toUpperCase()
        : ((currentUser?.name || currentUser?.username || 'C').slice(0, 1).toUpperCase());

    return (
        <div className={`thr-msg thr-msg--${isBrand ? 'brand' : 'creator'}`}>
            <div className="thr-msg-avatar-col">
                <div className="thr-msg-avatar">{initials}</div>
            </div>
            <div className="thr-msg-body">
                <div className="thr-msg-header">
                    <span className="thr-msg-sender-name">
                        {isBrand ? (brandName || 'Brand') : (currentUser?.name || currentUser?.username || 'You')}
                    </span>
                    <span className={`thr-msg-role thr-msg-role--${isBrand ? 'brand' : 'creator'}`}>
                        {isBrand ? 'Brand' : 'You'}
                    </span>
                    <span className="thr-msg-time">
                        {fmtDate(msg.sentAt)} · {fmtTime(msg.sentAt)}
                    </span>
                </div>
                <div className="thr-msg-content">{msg.content}</div>
            </div>
        </div>
    );
};

/* ─── Legal acknowledgement panel ─── */
const LegalPanel = ({ threadInfo, onAcknowledged, loading }) => {
    const metCount = threadInfo.conditions.filter((c) => c.met).length;
    const pct = Math.round((metCount / 4) * 100);

    return (
        <div className="thr-legal">
            <div className="thr-legal-title">
                <FileText size={14} />
                Legal &amp; Agreement Status
            </div>

            <div className="thr-legal-progress">
                <div className="thr-legal-progress-fill" style={{ width: `${pct}%` }} />
            </div>

            <div className="thr-legal-grid">
                {threadInfo.conditions.map((cond, i) => (
                    <div key={i} className={`thr-legal-item ${cond.met ? 'done' : ''}`}>
                        <div className="thr-legal-check">
                            {cond.met && <Check size={10} />}
                        </div>
                        <div className="thr-legal-label">
                            <strong>{cond.label}</strong>
                            <span>{cond.met ? 'Completed' : 'Pending'}</span>
                        </div>
                    </div>
                ))}
            </div>

            {(threadInfo.canAcknowledgeCampaign || threadInfo.canAcknowledgeLegal) && (
                <div className="thr-legal-actions">
                    {threadInfo.canAcknowledgeCampaign && (
                        <button
                            className="thr-legal-acknowledge-btn"
                            disabled={loading}
                            onClick={() => onAcknowledged('campaign')}
                        >
                            {loading ? <Loader2 size={12} className="thr-spin" /> : <Check size={12} />}
                            Acknowledge Campaign Terms
                        </button>
                    )}
                    {threadInfo.canAcknowledgeLegal && (
                        <button
                            className="thr-legal-acknowledge-btn"
                            disabled={loading}
                            onClick={() => onAcknowledged('legal')}
                        >
                            {loading ? <Loader2 size={12} className="thr-spin" /> : <Check size={12} />}
                            Acknowledge Legal Agreement
                        </button>
                    )}
                </div>
            )}

            {!threadInfo.canAcknowledgeCampaign && !threadInfo.canAcknowledgeLegal && !threadInfo.unlocked && (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    Waiting for the brand to complete their acknowledgements.
                </p>
            )}
        </div>
    );
};

/* ─── Thread Modal ─── */
const ThreadModal = ({ campaign: appliedCampaign, currentUser, onClose, onAgreementUpdated }) => {
    const [threads, setThreads] = useState([]);
    const [selectedThreadIdx, setSelectedThreadIdx] = useState(0);
    const [messages, setMessages] = useState({});   // { threadId: [...] }
    const [compose, setCompose] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const [ackLoading, setAckLoading] = useState(false);
    const [threadInfo, setThreadInfo] = useState(null);
    const [legalOnly, setLegalOnly] = useState(false);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    const campaignId = appliedCampaign.campaignId;
    const brandName = appliedCampaign.brand?.brandName || appliedCampaign.brandName || 'Brand';

    /* fetch full campaign data */
    const loadFullCampaign = useCallback(async () => {
        setLoading(true);
        try {
            const campaignDetails = appliedCampaign.campaignDetail
                ? getCreatorCampaignDetails(appliedCampaign.campaignDetail)
                : getCreatorCampaignDetails(await BrandCampaignService.getCampaignById(campaignId));
            const legal = appliedCampaign.legalAgreement || campaignDetails.legalAgreement;
            const threadsList = appliedCampaign.threads?.length ? appliedCampaign.threads : campaignDetails.threads;
            const resolvedStatus = campaignDetails.applicationStatus || appliedCampaign.applicationStatus;

            if (resolvedStatus === 'underReview') {
                setLegalOnly(true);
                setThreadInfo(buildAgreementInfo(legal));
                setThreads([]);
                setMessages({});
                return;
            }

            if (appliedCampaign.applicationStatus === 'accepted' || resolvedStatus === 'accepted') {
                const budgetLocked = appliedCampaign.budgetLocked === true || campaignDetails.budgetLocked === true;
                setLegalOnly(false);
                setThreadInfo({
                    unlocked: budgetLocked,
                    conditions: [{ label: 'Campaign budget locked', met: budgetLocked }],
                    canAcknowledgeCampaign: false,
                    canAcknowledgeLegal: false,
                });
                setThreads(threadsList);

                if (threadsList.length > 0) {
                    const msgMap = {};
                    threadsList.forEach((t) => {
                        msgMap[t._id] = t.messages || [];
                    });
                    setMessages(msgMap);
                }
                return;
            }
            if (resolvedStatus === 'underReview') {
                setLegalOnly(true);
                setThreadInfo(buildAgreementInfo(legal));
                setThreads([]);
                setMessages({});
            }
        } catch (err) {
            console.error('Failed to load campaign:', err);
        } finally {
            setLoading(false);
        }
    }, [appliedCampaign, campaignId, onAgreementUpdated]);

    useEffect(() => {
        loadFullCampaign();
    }, [loadFullCampaign]);

    /* auto-scroll messages */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, selectedThreadIdx]);

    /* handle acknowledgement */
    const handleAcknowledge = async (type) => {
        setAckLoading(true);
        try {
            await BrandCampaignService.acknowledgeLegalAgreement(campaignId, type);
            const campaignDetails = getCreatorCampaignDetails(await BrandCampaignService.getCampaignById(campaignId));
            onAgreementUpdated?.(campaignId, { applicationStatus: campaignDetails.applicationStatus || 'underReview', ...campaignDetails });
            setThreadInfo(buildAgreementInfo(campaignDetails.legalAgreement));
        } catch (err) {
            console.error('Acknowledge failed:', err);
        } finally {
            setAckLoading(false);
        }
    };

    /* send message */
    const handleSend = async () => {
        const text = compose.trim();
        if (!text || sending) return;
        const thread = threads[selectedThreadIdx];
        if (!thread) return;

        setSending(true);
        try {
            const result = await BrandCampaignService.sendThreadMessage(campaignId, thread._id, text);
            const nextMessages =
                result?.messages ||
                result?.thread?.messages ||
                result?.data?.messages ||
                result?.data?.thread?.messages;
            const fallbackMessage = {
                _id: `local-${Date.now()}`,
                senderRole: 'CREATOR',
                content: text,
                sentAt: new Date().toISOString(),
            };
            setCompose('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
            const updatedMessages = Array.isArray(nextMessages)
                ? nextMessages
                : [...(messages[thread._id] || []), fallbackMessage];
            setMessages((prev) => ({ ...prev, [thread._id]: updatedMessages }));
            setThreads(prev => prev.map(item => (
                item._id === thread._id ? { ...item, messages: updatedMessages } : item
            )));
        } catch (err) {
            console.error('Send failed:', err);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleTextareaInput = (e) => {
        const el = e.target;
        el.style.height = 'auto';
        el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
        setCompose(el.value);
    };

    const activeThread = threads[selectedThreadIdx];
    const activeMilestone = activeThread?.timelines?.[0];
    const activeMessages = activeThread ? (messages[activeThread._id] || []) : [];
    const isUnlocked = threadInfo?.unlocked === true;

    return (
        <div className="cc-thread-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="cc-thread-modal">
                {/* Top bar */}
                <div className="cc-thread-modal-topbar">
                    <button className="cc-close-btn" onClick={onClose} title="Close">
                        <ArrowLeft size={16} />
                    </button>
                    <div className="cc-thread-modal-title">
                        <strong>{appliedCampaign.campaignTitle || 'Campaign Thread'}</strong>
                        <span>{brandName}</span>
                    </div>
                    <button className="cc-close-btn" onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>

                {loading ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--text-muted)' }}>
                        <Loader2 size={20} className="thr-spin" />
                        <span style={{ fontSize: 13 }}>Loading thread…</span>
                    </div>
                ) : legalOnly ? (
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                        <div className="thr-locked">
                            <div className="thr-locked-icon">
                                {threadInfo?.unlocked ? <CheckCircle2 size={24} /> : <FileText size={24} />}
                            </div>
                            <h3>{threadInfo?.unlocked ? 'Ready for Shortlist' : 'Complete Agreements'}</h3>
                            <p>
                                {threadInfo?.unlocked
                                    ? 'Your acknowledgements are complete. The brand can now shortlist you.'
                                    : 'The brand moved your application to review. Complete your acknowledgements so they can shortlist you.'}
                            </p>
                            {threadInfo && (
                                <div className="thr-locked-conditions">
                                    {threadInfo.conditions.map((cond, i) => (
                                        <div key={i} className={`thr-condition-row ${cond.met ? 'met' : ''}`}>
                                            <div className="thr-condition-dot">
                                                {cond.met && <Check size={10} />}
                                            </div>
                                            {cond.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {threadInfo && !threadInfo.unlocked && (
                            <LegalPanel
                                threadInfo={threadInfo}
                                onAcknowledged={handleAcknowledge}
                                loading={ackLoading}
                            />
                        )}
                    </div>
                ) : !isUnlocked ? (
                    /* Locked state */
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                        <div className="thr-locked">
                            <div className="thr-locked-icon">
                                <Lock size={24} />
                            </div>
                            <h3>Thread Locked</h3>
                            <p>
                                Messaging opens after the campaign budget is locked in the brand wallet.
                            </p>
                            {threadInfo && (
                                <div className="thr-locked-conditions">
                                    {threadInfo.conditions.map((cond, i) => (
                                        <div key={i} className={`thr-condition-row ${cond.met ? 'met' : ''}`}>
                                            <div className="thr-condition-dot">
                                                {cond.met && <Check size={10} />}
                                            </div>
                                            {cond.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {threadInfo && (
                            <LegalPanel
                                threadInfo={threadInfo}
                                onAcknowledged={handleAcknowledge}
                                loading={ackLoading}
                            />
                        )}
                    </div>
                ) : threads.length === 0 ? (
                    <div className="thr-panel-empty" style={{ flex: 1 }}>
                        <MessageCircle size={36} />
                        <strong>Awaiting thread setup</strong>
                        <p>Your acknowledgements are complete. The brand will open a collaboration thread once they shortlist you.</p>
                    </div>
                ) : (
                    /* Unlocked thread view */
                    <>
                        {/* Milestone tabs */}
                        <div className="thr-milestone-tabs">
                            {threads.map((t, i) => {
                                const ml = t.timelines?.[0];
                                return (
                                    <button
                                        key={t._id}
                                        className={`thr-milestone-tab ${selectedThreadIdx === i ? 'active' : ''}`}
                                        onClick={() => setSelectedThreadIdx(i)}
                                    >
                                        <Target size={10} />
                                        {ml?.title || `Milestone ${i + 1}`}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Timeline header */}
                        {activeMilestone && (
                            <div className="thr-timeline-header">
                                <div className="thr-timeline-icon">
                                    <CalendarDays size={15} />
                                </div>
                                <div className="thr-timeline-info">
                                    <div className="thr-timeline-title">{activeMilestone.title}</div>
                                    <div className={`thr-timeline-deadline ${activeMilestone.deadline && new Date(activeMilestone.deadline) < new Date() && activeMilestone.status === 'PENDING' ? 'overdue' : ''}`}>
                                        <Clock size={11} />
                                        Deadline: {fmtDate(activeMilestone.deadline)}
                                    </div>
                                </div>
                                <TimelinePill status={activeMilestone.status} />
                            </div>
                        )}

                        {/* Legal panel (if not fully done) */}
                        {threadInfo && !threadInfo.unlocked && (
                            <LegalPanel
                                threadInfo={threadInfo}
                                onAcknowledged={handleAcknowledge}
                                loading={ackLoading}
                            />
                        )}

                        {/* Messages */}
                        <div className="thr-messages-scroll">
                            {activeMessages.length === 0 ? (
                                <div className="thr-empty-thread">
                                    <MessageCircle size={28} />
                                    <p>No messages yet. Start the conversation!</p>
                                </div>
                            ) : (
                                activeMessages.map((msg) => (
                                    <ThreadMessage
                                        key={msg._id}
                                        msg={msg}
                                        currentUser={currentUser}
                                        brandName={brandName}
                                    />
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Compose */}
                        <div className="thr-compose">
                            <div className="thr-compose-row">
                                <div className="thr-compose-avatar">
                                    {(currentUser?.name || currentUser?.username || 'C').slice(0, 1).toUpperCase()}
                                </div>
                                <div className="thr-compose-input-wrap">
                                    <textarea
                                        ref={textareaRef}
                                        className="thr-compose-textarea"
                                        placeholder="Write a message…"
                                        value={compose}
                                        onInput={handleTextareaInput}
                                        onChange={(e) => setCompose(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        rows={1}
                                    />
                                </div>
                            </div>
                            <div className="thr-compose-footer">
                                <span className="thr-compose-hint">Enter to send · Shift+Enter for new line</span>
                                <button
                                    className="thr-compose-send"
                                    onClick={handleSend}
                                    disabled={!compose.trim() || sending}
                                >
                                    {sending ? <Loader2 size={13} className="thr-spin" /> : <Send size={13} />}
                                    {sending ? 'Sending…' : 'Send'}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

/* ─── Campaign Card ─── */
const CampaignCard = ({ campaign, currentUser, onOpenThread }) => {
    const [threadInfoPreview, setThreadInfoPreview] = useState(null);

    useEffect(() => {
        if (campaign.applicationStatus === 'accepted') {
            const budgetLocked = campaign.budgetLocked === true;
            setThreadInfoPreview({
                unlocked: budgetLocked,
                conditions: [{ label: 'Campaign budget locked', met: budgetLocked }],
                canAcknowledgeCampaign: false,
                canAcknowledgeLegal: false,
            });
        }
    }, [campaign.applicationStatus, campaign.budgetLocked]);

    const platforms = Array.isArray(campaign.platformsRequired) ? campaign.platformsRequired : [];
    const agreementPreview = campaign.applicationStatus === 'underReview'
        ? buildAgreementInfo(campaign.legalAgreement)
        : threadInfoPreview;

    return (
        <div
            className="cc-campaign-card"
        >
            {/* Card header */}
            <div className="cc-campaign-card-header">
                <div className="cc-brand-logo">
                    {campaign.brand?.logoUrl ? (
                        <img src={campaign.brand.logoUrl} alt={campaign.brand?.brandName} />
                    ) : (
                        (campaign.brand?.brandName || campaign.brandName || 'B').slice(0, 1).toUpperCase()
                    )}
                </div>
                <div className="cc-campaign-meta">
                    <div className="cc-campaign-title">{campaign.campaignTitle || 'Untitled Campaign'}</div>
                    <div className="cc-brand-name">{campaign.brand?.brandName || campaign.brandName || '—'}</div>
                </div>
                <StatusBadge status={campaign.applicationStatus} />
            </div>

            {/* Details chips */}
            <div className="cc-campaign-details">
                {campaign.budgetRange?.min != null && (
                    <span className="cc-detail-chip">
                        <IndianRupee size={11} />
                        {fmtMoney(campaign.budgetRange.min)}
                        {campaign.budgetRange.max && campaign.budgetRange.max !== campaign.budgetRange.min
                            ? ` – ${fmtMoney(campaign.budgetRange.max)}`
                            : ''}
                    </span>
                )}
                {platforms.length > 0 && (
                    <span className="cc-detail-chip">
                        <PlatformIcon platform={platforms[0]} />
                        {platforms.slice(0, 2).join(', ')}
                        {platforms.length > 2 ? ` +${platforms.length - 2}` : ''}
                    </span>
                )}
                {campaign.contentDeliverable && (
                    <span className="cc-detail-chip">
                        <Target size={11} />
                        {campaign.contentDeliverable.replace(/_/g, ' ')}
                    </span>
                )}
                {campaign.appliedDate && (
                    <span className="cc-detail-chip">
                        <CalendarDays size={11} />
                        Applied {fmtDate(campaign.appliedDate)}
                    </span>
                )}
            </div>

            {/* Footer */}
            <div className="cc-campaign-footer">
                <span className="cc-detail-chip" style={{ fontSize: 11 }}>
                    <Clock size={11} />
                    {campaign.campaignStartDate
                        ? `Starts ${fmtDate(campaign.campaignStartDate)}`
                        : campaign.applicationTimeline
                        ? `Deadline ${fmtDate(campaign.applicationTimeline)}`
                        : '—'}
                </span>

                {(campaign.applicationStatus === 'accepted' || campaign.applicationStatus === 'underReview') && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {agreementPreview === null ? (
                            <span className="cc-thread-locked-btn">
                                <Loader2 size={11} className="thr-spin" /> Checking…
                            </span>
                        ) : campaign.applicationStatus === 'underReview' ? (
                            <button
                                className={agreementPreview.unlocked ? 'cc-thread-btn' : 'cc-thread-locked-btn'}
                                onClick={() => onOpenThread(campaign)}
                                title="Complete creator acknowledgements"
                            >
                                {agreementPreview.unlocked ? <CheckCircle2 size={13} /> : <FileText size={13} />}
                                {agreementPreview.unlocked ? 'Ready for Shortlist' : 'Review Terms'}
                                <ChevronRight size={13} />
                            </button>
                        ) : agreementPreview.unlocked ? (
                            <button
                                className="cc-thread-btn"
                                onClick={() => onOpenThread(campaign)}
                            >
                                <MessageCircle size={13} />
                                Open Thread
                                <ChevronRight size={13} />
                            </button>
                        ) : (
                            <button
                                className="cc-thread-locked-btn"
                                onClick={() => campaign.applicationStatus !== 'accepted' && onOpenThread(campaign)}
                                disabled={campaign.applicationStatus === 'accepted'}
                                title={campaign.applicationStatus === 'accepted' ? 'Thread opens after the brand campaign budget is locked.' : 'View conditions'}
                            >
                                <Lock size={11} />
                                {campaign.applicationStatus === 'accepted'
                                    ? 'Budget Pending'
                                    : `Pending Conditions (${agreementPreview.conditions.filter(c => c.met).length}/${agreementPreview.conditions.length})`}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Conditions mini checklist for accepted — shown when not fully unlocked */}
            {(campaign.applicationStatus === 'accepted' || campaign.applicationStatus === 'underReview') && agreementPreview && !agreementPreview.unlocked && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-color)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {agreementPreview.conditions.map((cond, i) => (
                        <span
                            key={i}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: 10,
                                fontWeight: 600,
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-full)',
                                background: cond.met ? 'rgba(16,185,129,0.1)' : 'var(--bg-tertiary)',
                                color: cond.met ? 'var(--color-success)' : 'var(--text-muted)',
                                border: `1px solid ${cond.met ? 'rgba(16,185,129,0.25)' : 'var(--border-color)'}`,
                            }}
                        >
                            {cond.met ? <CheckCircle2 size={9} /> : <Clock size={9} />}
                            {cond.label}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ─── Tab definitions ─── */
const TABS = [
    { key: 'all', label: 'All' },
    { key: 'applied', label: 'Applied' },
    { key: 'underReview', label: 'Under Review' },
    { key: 'accepted', label: 'Shortlisted' },
    { key: 'rejected', label: 'Rejected' },
];

/* ─── Main Page ─── */
export default function CreatorCampaigns() {
    const { user: currentUser } = useAuth();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [openThread, setOpenThread] = useState(null); // campaign object for the thread modal

    /* load applied campaigns */
    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                const res = await UserService.getAppliedCampaigns();
                if (!cancelled) {
                    const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
                    const enriched = await Promise.all(list.map(async (campaign) => {
                        if (!campaign.campaignId) return campaign;
                        try {
                            const detail = await BrandCampaignService.getCampaignById(campaign.campaignId);
                            const creatorDetails = getCreatorCampaignDetails(detail);
                            const reviewState = await inferReviewState(
                                campaign.campaignId,
                                creatorDetails.applicationStatus || campaign.applicationStatus
                            );
                            return {
                                ...campaign,
                                ...creatorDetails,
                                applicationStatus: reviewState.applicationStatus,
                                legalAgreement: creatorDetails.legalAgreement || reviewState.legalAgreement,
                                threads: creatorDetails.threads,
                                budgetLocked: creatorDetails.budgetLocked,
                                budgetLockedAt: creatorDetails.budgetLockedAt,
                            };
                        } catch {
                            return campaign;
                        }
                    }));
                    if (!cancelled) setCampaigns(enriched);
                }
            } catch (err) {
                console.error('Failed to load campaigns:', err);
                if (!cancelled) setCampaigns([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [currentUser]);

    /* tab filtering */
    const filtered = activeTab === 'all'
        ? campaigns
        : campaigns.filter((c) => c.applicationStatus === activeTab);

    const handleAgreementUpdated = useCallback((campaignId, update) => {
        setCampaigns(prev => prev.map(c => (
            String(c.campaignId) === String(campaignId)
                ? {
                    ...c,
                    ...update,
                    applicationStatus: update?.applicationStatus || (c.applicationStatus === 'applied' ? 'underReview' : c.applicationStatus),
                    legalAgreement: update?.legalAgreement ?? update,
                }
                : c
        )));
    }, []);

    /* tab counts */
    const counts = TABS.reduce((acc, t) => {
        acc[t.key] = t.key === 'all' ? campaigns.length : campaigns.filter((c) => c.applicationStatus === t.key).length;
        return acc;
    }, {});

    return (
        <div className="cc-page">
            {/* Header */}
            <div className="cc-header">
                <span className="cc-kicker">Creator Hub</span>
                <h1>My Campaigns</h1>
                <p>Track every campaign you've applied to and collaborate with shortlisting brands.</p>
            </div>

            {/* Tab bar */}
            <div className="cc-tabs">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        className={`cc-tab ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                        {counts[tab.key] > 0 && (
                            <span className="cc-tab-badge">{counts[tab.key]}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Campaign list */}
            <div className="cc-campaigns-list">
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '60px 0', color: 'var(--text-muted)' }}>
                        <Loader2 size={22} className="thr-spin" />
                        <span style={{ fontSize: 14 }}>Loading your campaigns…</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="cc-empty-state">
                        <BriefcaseBusiness size={40} />
                        <h3>
                            {activeTab === 'all'
                                ? 'No campaigns yet'
                                : activeTab === 'underReview'
                                ? 'Nothing under review'
                                : activeTab === 'accepted'
                                ? 'Not shortlisted anywhere yet'
                                : activeTab === 'rejected'
                                ? 'No rejections'
                                : 'No pending applications'}
                        </h3>
                        <p>
                            {activeTab === 'all'
                                ? 'Browse campaigns and apply to start collaborating with brands.'
                                : 'Check back later or explore more campaigns.'}
                        </p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filtered.map((c) => (
                            <CampaignCard
                                key={c.campaignId || c._id}
                                campaign={c}
                                currentUser={currentUser}
                                onOpenThread={setOpenThread}
                            />
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Thread modal */}
            <AnimatePresence>
                {openThread && (
                    <ThreadModal
                        campaign={openThread}
                        currentUser={currentUser}
                        onClose={() => setOpenThread(null)}
                        onAgreementUpdated={handleAgreementUpdated}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
